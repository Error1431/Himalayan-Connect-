const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
    createPost,
    getPosts,
    getPostById,
    getPostsByUser,
    updatePost,
    deletePost,
    likePost,
} = require('../controllers/postController');

// Unlimited photo/video posts — every upload creates a new Post document.
router.post('/', protect, upload.single('media'), createPost);
router.get('/', getPosts);
router.get('/user/:userId', getPostsByUser);
router.get('/:id', getPostById);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.post('/:id/like', protect, likePost);

module.exports = router;
