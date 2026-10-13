const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getExperiences,
  getExperienceById,
  getMyExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
  requestBooking
} = require('../controllers/experienceController');

const router = express.Router();

router.get('/mine', protect, getMyExperiences);
router.get('/', getExperiences);
router.get('/:id', getExperienceById);
router.post('/', protect, authorize('tourism_guide'), upload.array('images', 6), createExperience);
router.post('/:id/inquire', protect, requestBooking);
router.put('/:id', protect, updateExperience);
router.delete('/:id', protect, deleteExperience);

module.exports = router;
