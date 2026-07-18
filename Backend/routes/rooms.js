const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createRoom,
  getMyRooms,
  getRoomsByUser,
  getRoomById,
  updateRoom,
  deleteRoom
} = require('../controllers/roomController');

router.post('/', protect, upload.array('images', 5), createRoom);
router.get('/mine', protect, getMyRooms);
router.get('/user/:userId', getRoomsByUser);
router.get('/:id', getRoomById);
router.put('/:id', protect, updateRoom);
router.delete('/:id', protect, deleteRoom);

module.exports = router;
