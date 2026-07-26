const Homestay = require('../models/Homestay');
const { getFileUrl } = require('../middleware/upload');

function formatHomestay(doc) {
  const h = doc.toObject ? doc.toObject() : doc;
  const ownerUser = h.ownerId && typeof h.ownerId === 'object' ? h.ownerId : null;
  const lowestPrice = h.roomTypes?.[0]?.pricing?.basePrice;

  let type = 'budget';
  if (lowestPrice >= 5000) type = 'premium';
  else if (lowestPrice >= 2000) type = 'mid';

  return {
    ...h,
    hostId: ownerUser ? ownerUser._id : h.ownerId,
    hostName: ownerUser ? ownerUser.name : h.hostName,
    hostPhone: ownerUser ? ownerUser.phone : undefined,
    owner: ownerUser ? ownerUser._id : h.ownerId,
    // legacy flat aliases used by older UI bits
    village: h.location?.village,
    district: h.location?.district,
    price: lowestPrice,
    type,
    rating: h.ratings?.totalReviews > 0 ? h.ratings.overall : undefined,
    reviews: h.ratings?.totalReviews || 0,
    pincode: h.location?.pincode,
    coordinates: h.location?.coordinates,
    mapUrl: h.location?.coordinates?.lat
      ? `https://www.google.com/maps/search/?api=1&query=${h.location.coordinates.lat},${h.location.coordinates.lng}`
      : undefined,
    // Relative paths (e.g. "/uploads/x.jpg") — the frontend prefixes these
    // with its configured API base URL when rendering.
    images: (h.images || []).map((img) => (typeof img === 'string' ? img : img.url)).filter(Boolean),
    image: h.images?.[0] ? (typeof h.images[0] === 'string' ? h.images[0] : h.images[0].url) : undefined,
  };
}

exports.getHomestays = async (req, res) => {
  try {
    const homestays = await Homestay.find().populate('ownerId', 'name phone').sort({ createdAt: -1 });
    res.status(200).json(homestays.map(formatHomestay));
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch homestays', error: error.message });
  }
};

exports.getHomestayById = async (req, res) => {
  try {
    const idOrSlug = req.params.id;
    let homestay = null;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      homestay = await Homestay.findById(idOrSlug).populate('ownerId', 'name phone');
    }
    if (!homestay) {
      homestay = await Homestay.findOne({ 'seo.slug': idOrSlug }).populate('ownerId', 'name phone');
    }

    if (!homestay) {
      return res.status(404).json({ message: 'Homestay not found' });
    }

    res.status(200).json(formatHomestay(homestay));
  } catch (error) {
    res.status(404).json({ message: 'Homestay not found' });
  }
};

exports.getMyHomestays = async (req, res) => {
  try {
    const homestays = await Homestay.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(homestays.map(formatHomestay));
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch your homestays', error: error.message });
  }
};

exports.createHomestay = async (req, res, next) => {
  try {
    const {
      homestayName, village, district, price, pricePerNight, rooms,
      description, tagline, wifi, meals, parking, bonfire,
      occupancy, acType, pincode, lat, lng
    } = req.body;

    const finalPrice = Number(price ?? pricePerNight);

    if (!homestayName || !finalPrice) {
      return res.status(400).json({ message: 'Homestay name and price are required' });
    }
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least 1 photo is required' });
    }

    const occupancyLabel = occupancy === 'double' ? 'Double' : 'Single';
    const acLabel = acType === 'ac' ? 'AC' : 'Non-AC';

    const homestay = await Homestay.create({
      ownerId: req.user.id,
      homestayName,
      tagline: tagline || '',
      description: { short: description || '' },
      location: {
        village: village || '',
        district: district || '',
        state: 'Uttarakhand',
        pincode: pincode || '',
        coordinates: (lat && lng) ? { lat: Number(lat), lng: Number(lng) } : undefined
      },
      roomTypes: [{
        name: `${occupancyLabel} Room (${acLabel})`,
        capacity: occupancy === 'double' ? 2 : 1,
        totalRooms: Number(rooms) || 1,
        availableRooms: Number(rooms) || 1,
        pricing: { basePrice: finalPrice },
        amenities: [acLabel]
      }],
      facilities: {
        wifi: Boolean(wifi),
        meals: Boolean(meals),
        parking: Boolean(parking),
        bonfire: Boolean(bonfire)
      },
      images: req.files.map((f) => ({ url: getFileUrl(f) }))
    });

    const populated = await homestay.populate('ownerId', 'name phone');
    res.status(201).json(formatHomestay(populated));
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message });
    }
    next(error);
  }
};

exports.updateHomestay = async (req, res) => {
  try {
    const homestay = await Homestay.findById(req.params.id);
    if (!homestay) return res.status(404).json({ message: 'Homestay not found' });
    if (String(homestay.ownerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this homestay' });
    }
    Object.assign(homestay, req.body);
    await homestay.save();
    res.status(200).json(formatHomestay(homestay));
  } catch (error) {
    res.status(500).json({ message: 'Could not update homestay', error: error.message });
  }
};

exports.deleteHomestay = async (req, res) => {
  try {
    const homestay = await Homestay.findById(req.params.id);
    if (!homestay) return res.status(404).json({ message: 'Homestay not found' });
    if (String(homestay.ownerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this homestay' });
    }
    await homestay.deleteOne();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Could not delete homestay', error: error.message });
  }
};
