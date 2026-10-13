const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createFarm,
  getMyFarms,
  getFarmsByUser,
  updateFarm,
  deleteFarm
} = require('../controllers/farmController');

router.post('/', protect, createFarm);
router.get('/mine', protect, getMyFarms);
router.get('/user/:userId', getFarmsByUser);
router.put('/:id', protect, updateFarm);
router.delete('/:id', protect, deleteFarm);

module.exports = router;
