const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getHomestays,
  getHomestayById,
  getMyHomestays,
  createHomestay,
  updateHomestay,
  deleteHomestay
} = require('../controllers/homestayController');

const router = express.Router();

router.get('/mine', protect, getMyHomestays);
router.get('/', getHomestays);
router.get('/:id', getHomestayById);
router.post('/', protect, authorize('homestay_owner'), upload.array('images', 6), createHomestay);
router.put('/:id', protect, updateHomestay);
router.delete('/:id', protect, deleteHomestay);

module.exports = router;
