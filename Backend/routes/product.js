const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  getProducts,
  searchProducts,
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const router = express.Router();

router.get('/my-products', protect, getMyProducts);
router.get('/search', searchProducts);
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', protect, authorize('farmer'), upload.single('image'), createProduct);
router.put('/:id', protect, updateProduct);
router.delete('/:id', protect, deleteProduct);

module.exports = router;
