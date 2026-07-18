const Room = require('../models/Room');

// POST /api/rooms  (protected — homestay owner adds a room, multipart with up to 5 images)
exports.createRoom = async (req, res) => {
  try {
    const {
      roomName, capacity, pricePerNight, amenities,
      description, maxGuests, location, coordinates
    } = req.body;

    if (!roomName || !pricePerNight) {
      return res.status(400).json({ message: 'Room name and price are required' });
    }

    const images = (req.files || []).map((f) => `/uploads/${f.filename}`);

    const room = await Room.create({
      owner: req.user.id,
      roomName,
      capacity: capacity ? Number(capacity) : 1,
      maxGuests: maxGuests ? Number(maxGuests) : 1,
      pricePerNight: Number(pricePerNight),
      amenities,
      description,
      location,
      coordinates,
      images
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Could not save room', error: error.message });
  }
};

// GET /api/rooms/mine  (protected)
exports.getMyRooms = async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch rooms' });
  }
};

// GET /api/rooms/user/:userId  (public — used by profile page)
exports.getRoomsByUser = async (req, res) => {
  try {
    const rooms = await Room.find({ owner: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json(rooms);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch rooms' });
  }
};

// GET /api/rooms/:id  (public — single room, e.g. for cart/checkout display)
exports.getRoomById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch room' });
  }
};

// PUT /api/rooms/:id  (protected — owner only)
exports.updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (String(room.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to edit this room' });
    }
    Object.assign(room, req.body);
    await room.save();
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ message: 'Could not update room' });
  }
};

// DELETE /api/rooms/:id  (protected — owner only)
exports.deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) return res.status(404).json({ message: 'Room not found' });
    if (String(room.owner) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this room' });
    }
    await room.deleteOne();
    res.status(200).json({ success: true, message: 'Room deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete room' });
  }
};
