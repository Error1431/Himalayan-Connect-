const Farm = require('../models/Farm');

// POST /api/farms  (protected — farmer adds/describes their farm)
exports.createFarm = async (req, res) => {
  try {
    const {
      farmName, areaSize, cropTypes, certifications,
      description, contact, harvestSeasons, location, coordinates
    } = req.body;

    if (!farmName) {
      return res.status(400).json({ message: 'Farm name is required' });
    }

    const farm = await Farm.create({
      owner: req.user.id,
      farmName,
      areaSize: areaSize ? Number(areaSize) : undefined,
      cropTypes,
      certifications,
      description,
      contact,
      harvestSeasons,
      location,
      coordinates
    });

    res.status(201).json(farm);
  } catch (error) {
    res.status(500).json({ message: 'Could not save farm details', error: error.message });
  }
};

// GET /api/farms/mine  (protected)
exports.getMyFarms = async (req, res) => {
  try {
    const farms = await Farm.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(farms);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch farm details' });
  }
};

// GET /api/farms/user/:userId  (public — used by profile page)
exports.getFarmsByUser = async (req, res) => {
  try {
    const farms = await Farm.find({ owner: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(farms);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch farm details' });
  }
};

// PUT /api/farms/:id  (protected — owner only)
exports.updateFarm = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    if (String(farm.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to edit this farm' });
    }
    Object.assign(farm, req.body);
    await farm.save();
    res.status(200).json(farm);
  } catch (error) {
    res.status(500).json({ message: 'Could not update farm details' });
  }
};

// DELETE /api/farms/:id  (protected — owner only)
exports.deleteFarm = async (req, res) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) return res.status(404).json({ message: 'Farm not found' });
    if (String(farm.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this farm' });
    }
    await farm.deleteOne();
    res.status(200).json({ success: true, message: 'Farm details deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete farm details' });
  }
};
