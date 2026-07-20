const Product = require('../models/Product');
const { getFileUrl } = require('../middleware/upload');

// Shape a Mongoose Product doc into the flexible object the frontend
// (ProductCard.js, Products.js, SellerProfile.jsx) already expects —
// keeps both the "flat" legacy fields and the real nested schema fields
// so no frontend code needs to change.
function formatProduct(doc) {
  const p = doc.toObject ? doc.toObject() : doc;
  const farmerUser = p.farmerId && typeof p.farmerId === 'object' ? p.farmerId : null;

  return {
    ...p,
    farmer: farmerUser ? { _id: farmerUser._id, name: farmerUser.name, phone: farmerUser.phone } : p.farmerId,
    farmerId: farmerUser ? farmerUser._id : p.farmerId,
    farmerName: farmerUser ? farmerUser.name : p.farmerName,
    basePrice: p.pricing?.basePrice,
    unit: p.pricing?.unit,
    quantity: p.availability?.quantity,
  };
}

exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: { $ne: 'Archived' } })
      .populate('farmerId', 'name phone')
      .sort({ createdAt: -1 });
    res.status(200).json(products.map(formatProduct));
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch products', error: error.message });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();
    const filter = q
      ? { $text: { $search: q } }
      : {};

    const products = await Product.find(filter)
      .populate('farmerId', 'name phone')
      .sort({ createdAt: -1 });
    res.status(200).json(products.map(formatProduct));
  } catch (error) {
    // fall back to a simple regex search if text index isn't ready
    try {
      const q = (req.query.q || '').trim();
      const regex = new RegExp(q, 'i');
      const products = await Product.find({
        $or: [{ productName: regex }, { category: regex }, { description: regex }, { locationAddress: regex }]
      }).populate('farmerId', 'name phone');
      return res.status(200).json(products.map(formatProduct));
    } catch (err2) {
      res.status(500).json({ message: 'Could not search products', error: err2.message });
    }
  }
};

exports.getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmerId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(products.map(formatProduct));
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch your products', error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('farmerId', 'name phone');
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(formatProduct(product));
  } catch (error) {
    res.status(404).json({ message: 'Product not found' });
  }
};

exports.createProduct = async (req, res, next) => {
  try {
    const {
      productName,
      category,
      description,
      basePrice,
      unit,
      quantity,
      locationAddress,
      locationLat,
      locationLng,
      locationZipCode,
    } = req.body;

    if (!productName || !basePrice) {
      return res.status(400).json({ message: 'Product name and base price are required' });
    }

    const lat = locationLat ? Number(locationLat) : undefined;
    const lng = locationLng ? Number(locationLng) : undefined;

    const product = await Product.create({
      farmerId: req.user.id,
      farmer: req.user.id,
      productName,
      category: category || 'Vegetables',
      description: description || '',
      pricing: {
        basePrice: Number(basePrice),
        unit: unit || 'kg',
      },
      availability: {
        quantity: Number(quantity) || 0,
      },
      locationAddress: locationAddress || '',
      locationLat: lat,
      locationLng: lng,
      locationZipCode: locationZipCode || '',
      geoSpatialLocation: (lat !== undefined && lng !== undefined)
        ? { type: 'Point', coordinates: [lng, lat] }
        : undefined,
      imageUrl: req.file ? getFileUrl(req.file) : '',
    });

    const populated = await product.populate('farmerId', 'name phone');
    res.status(201).json(formatProduct(populated));
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message });
    }
    next(error);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (String(product.farmerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this product' });
    }

    const { basePrice, unit, quantity, ...rest } = req.body;
    Object.assign(product, rest);
    if (basePrice !== undefined) product.pricing.basePrice = Number(basePrice);
    if (unit !== undefined) product.pricing.unit = unit;
    if (quantity !== undefined) product.availability.quantity = Number(quantity);

    await product.save();
    res.status(200).json(formatProduct(product));
  } catch (error) {
    res.status(500).json({ message: 'Could not update product', error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (String(product.farmerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this product' });
    }

    await product.deleteOne();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Could not delete product', error: error.message });
  }
};
