const Experience = require('../models/Experience');
const { getFileUrl } = require('../middleware/upload');

function formatExperience(doc) {
  const e = doc.toObject ? doc.toObject() : doc;
  const hostUser = e.hostId && typeof e.hostId === 'object' ? e.hostId : null;

  return {
    ...e,
    hostId: hostUser ? hostUser._id : e.hostId,
    hostName: hostUser ? hostUser.name : e.hostName,
    hostPhone: hostUser ? hostUser.phone : undefined,
    village: e.location?.village,
    district: e.location?.district,
    price: e.price?.amount,
    rating: e.ratings?.totalReviews > 0 ? e.ratings.overall : undefined,
    reviews: e.ratings?.totalReviews || 0,
    images: (e.images || []).map((img) => (typeof img === 'string' ? img : img.url)).filter(Boolean),
    image: e.images?.[0] ? (typeof e.images[0] === 'string' ? e.images[0] : e.images[0].url) : undefined,
  };
}

exports.getExperiences = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.culture) filter.culture = req.query.culture;
    if (req.query.district) filter['location.district'] = new RegExp(req.query.district, 'i');

    const experiences = await Experience.find(filter)
      .populate('hostId', 'name phone')
      .sort({ featured: -1, createdAt: -1 });

    res.status(200).json(experiences.map(formatExperience));
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch experiences', error: error.message });
  }
};

exports.getExperienceById = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id).populate('hostId', 'name phone');
    if (!experience) return res.status(404).json({ message: 'Experience not found' });
    res.status(200).json(formatExperience(experience));
  } catch (error) {
    res.status(404).json({ message: 'Experience not found' });
  }
};

exports.getMyExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({ hostId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(experiences.map(formatExperience));
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch your experiences', error: error.message });
  }
};

exports.createExperience = async (req, res, next) => {
  try {
    const {
      title, category, culture, village, district, description, tagline,
      duration, difficulty, price, priceUnit, minGroup, maxGroup,
      guideName, guideCertified, certificationBody, guideYears, includes,
      theme, fromLocation, toLocation, cropsGrown, howToReach, highlights
    } = req.body;

    if (!title || !category || !price) {
      return res.status(400).json({ message: 'Title, category and price are required' });
    }

    const experience = await Experience.create({
      hostId: req.user.id,
      title,
      category,
      culture: culture || 'other',
      description: { short: description || tagline || '' },
      location: { village: village || '', district: district || '', state: 'Uttarakhand' },
      duration: duration || '',
      theme: theme || '',
      route: { from: fromLocation || '', to: toLocation || '' },
      cropsGrown: cropsGrown ? String(cropsGrown).split(',').map((s) => s.trim()).filter(Boolean) : [],
      howToReach: howToReach || '',
      highlights: highlights ? (Array.isArray(highlights) ? highlights : String(highlights).split(',').map((s) => s.trim()).filter(Boolean)) : [],
      difficulty: difficulty || 'easy',
      price: { amount: Number(price), unit: priceUnit || 'per person' },
      groupSize: { min: Number(minGroup) || 1, max: Number(maxGroup) || 10 },
      guide: {
        name: guideName || '',
        certified: guideCertified === 'true' || guideCertified === true,
        certificationBody: certificationBody || '',
        experienceYears: Number(guideYears) || 0
      },
      includes: includes ? String(includes).split(',').map((s) => s.trim()).filter(Boolean) : [],
      images: (req.files || []).map((f) => ({ url: getFileUrl(f) }))
    });

    const populated = await experience.populate('hostId', 'name phone');
    res.status(201).json(formatExperience(populated));
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message });
    }
    next(error);
  }
};

exports.updateExperience = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) return res.status(404).json({ message: 'Experience not found' });
    if (String(experience.hostId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this experience' });
    }
    Object.assign(experience, req.body);
    await experience.save();
    res.status(200).json(formatExperience(experience));
  } catch (error) {
    res.status(500).json({ message: 'Could not update experience', error: error.message });
  }
};

exports.deleteExperience = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) return res.status(404).json({ message: 'Experience not found' });
    if (String(experience.hostId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this experience' });
    }
    await experience.deleteOne();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Could not delete experience', error: error.message });
  }
};

// Booking / inquiry request — logged-in customers ask the host to confirm
// a trek/wedding/tour with their preferred date, group size and route.
exports.requestBooking = async (req, res) => {
  try {
    const { name, phone, date, guests, fromLocation, toLocation, notes } = req.body;
    const experience = await Experience.findById(req.params.id);
    if (!experience) return res.status(404).json({ message: 'Experience not found' });

    experience.inquiries.push({
      name: name || req.user?.name,
      phone: phone || req.user?.phone,
      date: date ? new Date(date) : undefined,
      guests: Number(guests) || 1,
      fromLocation: fromLocation || '',
      toLocation: toLocation || '',
      notes: notes || ''
    });
    await experience.save();
    res.status(201).json({ message: 'Booking request sent to the host' });
  } catch (error) {
    res.status(500).json({ message: 'Could not send booking request', error: error.message });
  }
};
