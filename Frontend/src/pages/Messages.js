import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import api, { API_BASE_URL } from '../utils/api';
import io from 'socket.io-client';
import {
    FaPaperPlane, FaArrowLeft, FaUser, FaLeaf, FaHome,
    FaCircle, FaSearch, FaPhone, FaVideo, FaEllipsisV,
    FaShoppingBag, FaTimes, FaSmile, FaPaperclip
} from 'react-icons/fa';

const Messages = () => {
    const { user } = useAuth();
    const location = useLocation();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);

    useEffect(() => {
        fetchChats();
        initializeSocket();

        const params = new URLSearchParams(location.search);
        const chatId = params.get('chat');
        const toUserId = params.get('to');
        if (chatId) {
            loadSpecificChat(chatId);
        } else if (toUserId) {
            startChatWithUser(toUserId, params.get('productName'));
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [selectedChat?.messages]);

    const initializeSocket = () => {
        socketRef.current = io(API_BASE_URL);

        socketRef.current.emit('join-user-room', user.id || user._id);

        socketRef.current.on('new-message', (data) => {
            if (selectedChat && selectedChat._id === data.chatId) {
                setSelectedChat(prev => ({
                    ...prev,
                    messages: [...prev.messages, data.message]
                }));
            }
            fetchChats();
        });

        socketRef.current.on('connect', () => {
            console.log('Socket connected');
        });

        socketRef.current.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    };

    const startChatWithUser = async (participantId, productName) => {
        try {
            const response = await api.post('/chat/create', { participantId });
            setSelectedChat(response.data.chat);
            if (productName) {
                setMessage(`Hi! I'm interested in "${productName}". Is it still available?`);
            }
            fetchChats();
        } catch (error) {
            console.error('Start chat error:', error);
        }
    };

    const loadSpecificChat = async (chatId) => {
        try {
            const response = await api.get(`/chat/${chatId}`);
            setSelectedChat(response.data.chat);
            await api.patch(`/chat/${chatId}/read`);
            fetchChats();
        } catch (error) {
            console.error('Load specific chat error:', error);
        }
    };

    const fetchChats = async () => {
        setLoading(true);
        try {
            const response = await api.get('/chat');
            setChats(response.data.chats || []);
        } catch (error) {
            console.error('Fetch chats error:', error);
            setChats([]);
        } finally {
            setLoading(false);
        }
    };

    const selectChat = async (chat) => {
        try {
            const response = await api.get(`/chat/${chat._id}`);
            setSelectedChat(response.data.chat);

            await api.patch(`/chat/${chat._id}/read`);
            fetchChats();
        } catch (error) {
            console.error('Select chat error:', error);
        }
    };

    const sendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim() || !selectedChat) return;

        setSending(true);
        try {
            const response = await api.post('/chat/message', {
                chatId: selectedChat._id,
                content: message.trim()
            });

            setSelectedChat(response.data.chat);
            setMessage('');
            fetchChats();
        } catch (error) {
            console.error('Send message error:', error);
            alert('Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getOtherParticipant = (chat) => {
        const myId = user.id || user._id;
        return chat.participants?.find(p => p._id !== myId);
    };

    const getUnreadCount = (chat) => {
        const myId = user.id || user._id;
        return chat.messages?.filter(
            msg => msg.sender?._id !== myId && !msg.readBy?.some(r => r.user === myId)
        ).length || 0;
    };

    const formatTime = (date) => {
        const now = new Date();
        const msgDate = new Date(date);
        const diffInMs = now - msgDate;
        const diffInHours = diffInMs / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const mins = Math.floor(diffInMs / (1000 * 60));
            return mins < 1 ? 'Just now' : `${mins}m ago`;
        } else if (diffInHours < 24) {
            return msgDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        } else if (diffInHours < 48) {
            return 'Yesterday';
        } else {
            return msgDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
        }
    };

    const filteredChats = chats.filter(chat => {
        const otherUser = getOtherParticipant(chat);
        return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const getRoleIcon = (role) => {
        switch (role) {
            case 'farmer': return <FaLeaf className="text-green-600" />;
            case 'homestay':
            case 'homestay_owner': return <FaHome className="text-blue-600" />;
            default: return <FaUser className="text-ink-soft-soft dark:text-ink-soft-soft" />;
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            farmer: { bg: 'bg-green-100', text: 'text-green-700', label: 'Farmer' },
            homestay: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Homestay' },
            homestay_owner: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Homestay' },
            customer: { bg: 'bg-surface-alt dark:bg-surface-alt', text: 'text-ink-soft-soft dark:text-ink-soft-soft', label: 'Customer' }
        };

        const badge = badges[role] || badges.customer;
        return (
            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${badge.bg} ${badge.text}`}>
                {badge.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-alt dark:bg-app-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-ink-soft-soft dark:text-ink-soft-soft font-medium">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-surface-alt dark:bg-app-bg flex overflow-hidden">

            <div className={`w-full md:w-96 bg-surface dark:bg-surface border-r border-gray-200 dark:border-outline flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>

                <div className="p-4 border-b border-gray-200 dark:border-outline bg-gradient-to-r from-green-50 to-emerald-50">
                    <h2 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mb-4 flex items-center gap-2">
                        <FaShoppingBag className="text-green-600" /> Messages
                    </h2>
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-outline rounded-xl focus:outline-none focus:border-green-500 bg-surface dark:bg-surface shadow-sm dark:shadow-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {filteredChats.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <FaUser className="text-5xl border-outline mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-ink-soft-soft font-medium">No conversations yet</p>
                            <p className="text-xs text-gray-400 dark:text-ink-soft-soft mt-2">Start chatting by clicking "Contact Seller" on any product</p>
                        </div>
                    ) : (
                        filteredChats.map(chat => {
                            const otherUser = getOtherParticipant(chat);
                            const unreadCount = getUnreadCount(chat);

                            return (
                                <div
                                    key={chat._id}
                                    onClick={() => selectChat(chat)}
                                    className={`p-4 border-b border-gray-100 dark:border-outline hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 cursor-pointer transition ${selectedChat?._id === chat._id ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-600' : ''
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="relative flex-shrink-0">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                                                {otherUser?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <h3 className="font-bold text-ink-soft dark:text-ink-soft truncate">{otherUser?.name}</h3>
                                                    {getRoleIcon(otherUser?.role)}
                                                </div>
                                                <span className="text-xs text-gray-500 dark:text-ink-soft-soft ml-2">
                                                    {formatTime(chat.lastMessage?.timestamp || chat.updatedAt)}
                                                </span>
                                            </div>

                                            <p className="text-sm text-ink-soft-soft dark:text-ink-soft-soft truncate mb-1">
                                                {chat.lastMessage?.content || 'No messages yet'}
                                            </p>

                                            {chat.productReference && (
                                                <div className="flex items-center gap-1 mt-1">
                                                    <FaLeaf className="text-xs text-green-600" />
                                                    <p className="text-xs text-green-600 truncate font-medium">
                                                        {chat.productReference.productName}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {unreadCount > 0 && (
                                            <div className="bg-green-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                                                {unreadCount}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            <div className={`flex-1 flex flex-col ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
                {selectedChat ? (
                    <>
                        <div className="bg-surface dark:bg-surface border-b border-gray-200 dark:border-outline p-4 flex items-center justify-between shadow-sm dark:shadow-none">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedChat(null)}
                                    className="md:hidden text-ink-soft-soft dark:text-ink-soft-soft hover:text-ink-soft p-2 hover:bg-surface-alt rounded-lg transition"
                                >
                                    <FaArrowLeft />
                                </button>

                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                                    {getOtherParticipant(selectedChat)?.name?.charAt(0).toUpperCase()}
                                </div>

                                <div>
                                    <h3 className="font-bold text-ink-soft dark:text-ink-soft flex items-center gap-2">
                                        {getOtherParticipant(selectedChat)?.name}
                                        {getRoleIcon(getOtherParticipant(selectedChat)?.role)}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center gap-1 text-xs text-green-600">
                                            <FaCircle className="text-[6px]" />
                                            <span>Online</span>
                                        </div>
                                        {getRoleBadge(getOtherParticipant(selectedChat)?.role)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-surface-alt rounded-lg transition text-ink-soft-soft dark:text-ink-soft-soft hover:text-green-600">
                                    <FaPhone />
                                </button>
                                <button className="p-2 hover:bg-surface-alt rounded-lg transition text-ink-soft-soft dark:text-ink-soft-soft hover:text-green-600">
                                    <FaVideo />
                                </button>
                                <button className="p-2 hover:bg-surface-alt rounded-lg transition text-ink-soft-soft dark:text-ink-soft-soft">
                                    <FaEllipsisV />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white">
                            {selectedChat.productReference && (
                                <div className="bg-surface dark:bg-surface rounded-xl p-3 mb-4 border-2 border-green-200 flex items-center gap-3 shadow-sm dark:shadow-none hover:shadow-md transition">
                                    {selectedChat.productReference.imageURL && (
                                        <img
                                            src={`${API_BASE_URL}${selectedChat.productReference.imageURL}`}
                                            alt={selectedChat.productReference.productName}
                                            className="w-16 h-16 object-cover rounded-lg shadow-md"
                                            onError={(e) => {
                                                e.target.src = 'https://via.placeholder.com/64?text=Product';
                                            }}
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="text-xs text-gray-500 dark:text-ink-soft-soft font-semibold uppercase tracking-wide">Discussing about</p>
                                        <p className="font-bold text-ink-soft dark:text-ink-soft">{selectedChat.productReference.productName}</p>
                                        <p className="text-sm text-green-600 font-bold">₹{selectedChat.productReference.basePrice}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {selectedChat.messages?.map((msg, index) => {
                                    const isMyMessage = msg.sender?._id === (user.id || user._id);

                                    return (
                                        <div key={index} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-xs md:max-w-md ${isMyMessage ? 'order-2' : 'order-1'}`}>
                                                <div
                                                    className={`rounded-2xl px-4 py-2 shadow-md ${isMyMessage
                                                        ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-br-none'
                                                        : 'bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft rounded-bl-none border border-gray-200 dark:border-outline'
                                                        }`}
                                                >
                                                    {!isMyMessage && (
                                                        <p className="text-xs font-semibold mb-1 text-green-600">
                                                            {msg.sender?.name}
                                                        </p>
                                                    )}
                                                    <p className="text-sm break-words">{msg.content}</p>
                                                    <p className={`text-xs mt-1 ${isMyMessage ? 'text-green-100' : 'text-gray-500 dark:text-ink-soft-soft'}`}>
                                                        {formatTime(msg.createdAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div ref={messagesEndRef} />
                        </div>

                        <form onSubmit={sendMessage} className="bg-surface dark:bg-surface border-t border-gray-200 dark:border-outline p-4 shadow-lg">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    className="p-3 hover:bg-surface-alt rounded-full transition text-ink-soft-soft dark:text-ink-soft-soft hover:text-green-600"
                                >
                                    <FaSmile />
                                </button>
                                <button
                                    type="button"
                                    className="p-3 hover:bg-surface-alt rounded-full transition text-ink-soft-soft dark:text-ink-soft-soft hover:text-green-600"
                                >
                                    <FaPaperclip />
                                </button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type a message..."
                                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-outline rounded-full focus:outline-none focus:border-green-500 shadow-sm dark:shadow-none"
                                    disabled={sending}
                                />
                                <button
                                    type="submit"
                                    disabled={sending || !message.trim()}
                                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-3 rounded-full hover:from-green-700 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                                >
                                    <FaPaperPlane />
                                </button>
                            </div>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-green-50">
                        <div className="text-center">
                            <div className="bg-surface dark:bg-surface p-8 rounded-full shadow-xl mb-6 mx-auto w-32 h-32 flex items-center justify-center">
                                <FaShoppingBag className="text-6xl text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mb-2">No Conversation Selected</h3>
                            <p className="text-gray-500 dark:text-ink-soft-soft max-w-sm mx-auto">Choose a conversation from the left or start chatting by clicking "Contact Seller" on any product</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages;