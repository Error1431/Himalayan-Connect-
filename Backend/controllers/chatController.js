const Chat = require('../models/Chat');
const User = require('../models/User');
const Product = require('../models/Product');

exports.createOrGetChat = async (req, res) => {
    try {
        const { participantId, productId } = req.body;
        const userId = req.user.id || req.user._id;

        if (!participantId) {
            return res.status(400).json({
                success: false,
                message: 'Participant ID is required'
            });
        }

        const participants = [userId, participantId].sort();

        let chat = await Chat.findOne({
            participants: { $all: participants }
        })
            .populate('participants', 'name email role')
            .populate('productReference', 'productName imageURL basePrice')
            .populate('messages.sender', 'name');

        if (!chat) {
            chat = await Chat.create({
                participants,
                productReference: productId || null,
                messages: []
            });

            chat = await Chat.findById(chat._id)
                .populate('participants', 'name email role')
                .populate('productReference', 'productName imageURL basePrice')
                .populate('messages.sender', 'name');
        }

        res.status(200).json({
            success: true,
            chat: chat
        });

    } catch (error) {
        console.error('Create/Get Chat Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating/fetching chat',
            error: error.message
        });
    }
};

exports.getUserChats = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;

        const chats = await Chat.find({
            participants: userId,
            isActive: true
        })
            .populate('participants', 'name email role')
            .populate('productReference', 'productName imageURL')
            .populate('lastMessage.sender', 'name')
            .sort({ 'lastMessage.timestamp': -1 });

        res.status(200).json({
            success: true,
            count: chats.length,
            chats: chats
        });

    } catch (error) {
        console.error('Get User Chats Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching chats'
        });
    }
};

exports.getChatById = async (req, res) => {
    try {
        const userId = req.user.id || req.user._id;
        const chatId = req.params.id;

        const chat = await Chat.findById(chatId)
            .populate('participants', 'name email role')
            .populate('productReference', 'productName imageURL basePrice')
            .populate('messages.sender', 'name');

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        if (!chat.participants.some(p => p._id.toString() === userId.toString())) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this chat'
            });
        }

        res.status(200).json({
            success: true,
            chat: chat
        });

    } catch (error) {
        console.error('Get Chat Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching chat'
        });
    }
};

exports.sendMessage = async (req, res) => {
    try {
        const { chatId, content, attachments } = req.body;
        const userId = req.user.id || req.user._id;

        if (!chatId || !content) {
            return res.status(400).json({
                success: false,
                message: 'Chat ID and message content are required'
            });
        }

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        if (!chat.participants.some(p => p.toString() === userId.toString())) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to send messages in this chat'
            });
        }

        const newMessage = {
            sender: userId,
            content: content.trim(),
            attachments: attachments || [],
            readBy: [{ user: userId }]
        };

        chat.messages.push(newMessage);
        chat.lastMessage = {
            content: content.trim(),
            sender: userId,
            timestamp: new Date()
        };

        await chat.save();

        const io = req.app.get('io');
        if (io) {
            chat.participants.forEach(participantId => {
                if (participantId.toString() !== userId.toString()) {
                    io.to(`user-${participantId}`).emit('new-message', {
                        chatId: chat._id,
                        message: newMessage
                    });
                }
            });
        }

        const updatedChat = await Chat.findById(chatId)
            .populate('participants', 'name email role')
            .populate('productReference', 'productName imageURL')
            .populate('messages.sender', 'name');

        res.status(200).json({
            success: true,
            message: 'Message sent successfully',
            chat: updatedChat
        });

    } catch (error) {
        console.error('Send Message Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error sending message',
            error: error.message
        });
    }
};

exports.markAsRead = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id || req.user._id;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        chat.messages.forEach(message => {
            const alreadyRead = message.readBy.some(r => r.user.toString() === userId.toString());
            if (!alreadyRead && message.sender.toString() !== userId.toString()) {
                message.readBy.push({ user: userId, readAt: new Date() });
            }
        });

        await chat.save();

        res.status(200).json({
            success: true,
            message: 'Messages marked as read'
        });

    } catch (error) {
        console.error('Mark As Read Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error marking messages as read'
        });
    }
};

exports.deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user.id || req.user._id;

        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: 'Chat not found'
            });
        }

        if (!chat.participants.some(p => p.toString() === userId.toString())) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this chat'
            });
        }

        chat.isActive = false;
        await chat.save();

        res.status(200).json({
            success: true,
            message: 'Chat deleted successfully'
        });

    } catch (error) {
        console.error('Delete Chat Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting chat'
        });
    }
};