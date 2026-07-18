const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

const protect = authMiddleware.verifyAccessToken || authMiddleware.protect || authMiddleware;

router.post('/create', protect, chatController.createOrGetChat);

router.get('/', protect, chatController.getUserChats);

router.get('/:id', protect, protect, chatController.getChatById);

router.post('/message', protect, chatController.sendMessage);

router.patch('/:chatId/read', protect, chatController.markAsRead);

router.delete('/:chatId', protect, chatController.deleteChat);

module.exports = router;