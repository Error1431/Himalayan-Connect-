import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ToastContainer';
import api, { API_BASE_URL } from '../utils/api';
import {
    FaUser, FaBell, FaLock, FaGlobe, FaCreditCard, FaTractor,
    FaHome, FaShieldAlt, FaEnvelope, FaPhone, FaMapMarkerAlt,
    FaCamera, FaSave, FaTrash, FaEye, FaEyeSlash, FaSignOutAlt,
    FaCheckCircle, FaExclamationTriangle, FaCog, FaPalette,
    FaExclamationCircle, FaTimes, FaIdCard, FaWallet, FaUpload,
    FaCheck, FaClock, FaBan, FaShoppingBag, FaHeart, FaHeartBroken,
    FaCommentDots
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { items: wishlistItems, removeFromWishlist } = useWishlist();
    const { setTheme } = useTheme();
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState('profile');
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [showIncompleteAlert, setShowIncompleteAlert] = useState(false);

    const [aadhaar, setAadhaar] = useState({
        number: '',
        name: '',
        verified: false,
        document: null,
        documentPreview: null
    });

    const [paymentMethod, setPaymentMethod] = useState({
        type: 'upi',
        upiId: '',
        bankDetails: {
            accountHolderName: '',
            accountNumber: '',
            ifscCode: '',
            bankName: ''
        },
        verified: false
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });

    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const [incompleteFields, setIncompleteFields] = useState({
        profile: [],
        payment: [],
        farmer: [],
        homestay: [],
        account: []
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        if (settings) {
            checkIncompleteFields();
        }
    }, [settings]);

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const response = await api.get('/settings');
            setSettings(response.data.settings);

            if (response.data.settings.profile.avatar) {
                setAvatarPreview(`${API_BASE_URL}${response.data.settings.profile.avatar}`);
            }

            if (response.data.settings.account) {
                setAadhaar(response.data.settings.account.aadhaar || {
                    number: '',
                    name: '',
                    verified: false,
                    document: null,
                    documentPreview: null
                });
                setPaymentMethod(response.data.settings.account.paymentMethod || {
                    type: 'upi',
                    upiId: '',
                    bankDetails: {
                        accountHolderName: '',
                        accountNumber: '',
                        ifscCode: '',
                        bankName: ''
                    },
                    verified: false
                });
            }
        } catch (error) {
            console.error('Fetch Settings Error:', error);
            setSettings(null);
        } finally {
            setLoading(false);
        }
    };

    const checkIncompleteFields = () => {
        const incomplete = {
            profile: [],
            payment: [],
            farmer: [],
            homestay: [],
            account: []
        };

        if (!settings.profile.displayName || settings.profile.displayName.trim() === '') {
            incomplete.profile.push('displayName');
        }
        if (!settings.profile.phone || settings.profile.phone.trim() === '') {
            incomplete.profile.push('phone');
        }
        if (!settings.profile.alternateEmail || settings.profile.alternateEmail.trim() === '') {
            incomplete.profile.push('alternateEmail');
        }
        if (!settings.profile.location?.city || settings.profile.location.city.trim() === '') {
            incomplete.profile.push('city');
        }
        if (!settings.profile.bio || settings.profile.bio.trim() === '') {
            incomplete.profile.push('bio');
        }

        if (!settings.payment.upiId || settings.payment.upiId.trim() === '') {
            incomplete.payment.push('upiId');
        }
        if (!settings.payment.bankDetails.accountHolderName || settings.payment.bankDetails.accountHolderName.trim() === '') {
            incomplete.payment.push('accountHolderName');
        }
        if (!settings.payment.bankDetails.accountNumber || settings.payment.bankDetails.accountNumber.trim() === '') {
            incomplete.payment.push('accountNumber');
        }
        if (!settings.payment.bankDetails.ifscCode || settings.payment.bankDetails.ifscCode.trim() === '') {
            incomplete.payment.push('ifscCode');
        }

        if (!aadhaar.number || aadhaar.number.length !== 12) {
            incomplete.account.push('aadhaar');
        }
        if (!paymentMethod.verified) {
            incomplete.account.push('payment');
        }

        if (user?.role === 'farmer') {
            if (!settings.farmer.farmName || settings.farmer.farmName.trim() === '') {
                incomplete.farmer.push('farmName');
            }
            if (!settings.farmer.farmSize || settings.farmer.farmSize === 0) {
                incomplete.farmer.push('farmSize');
            }
            if (!settings.farmer.farmType || settings.farmer.farmType.trim() === '') {
                incomplete.farmer.push('farmType');
            }
        }

        if (user?.role === 'homestay') {
            if (!settings.homestay.propertyName || settings.homestay.propertyName.trim() === '') {
                incomplete.homestay.push('propertyName');
            }
            if (!settings.homestay.totalRooms || settings.homestay.totalRooms === 0) {
                incomplete.homestay.push('totalRooms');
            }
            if (!settings.homestay.cancellationPolicy || settings.homestay.cancellationPolicy.trim() === '') {
                incomplete.homestay.push('cancellationPolicy');
            }
        }

        setIncompleteFields(incomplete);

        const totalIncomplete =
            incomplete.profile.length +
            incomplete.payment.length +
            incomplete.farmer.length +
            incomplete.homestay.length +
            incomplete.account.length;

        setShowIncompleteAlert(totalIncomplete > 0);
    };

    const isFieldIncomplete = (section, field) => {
        return incompleteFields[section]?.includes(field);
    };

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAadhaarDocumentChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAadhaar({
                    ...aadhaar,
                    document: file,
                    documentPreview: reader.result
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();

            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            Object.keys(settings.profile).forEach(key => {
                if (key !== 'location') {
                    formData.append(`profile[${key}]`, settings.profile[key] || '');
                }
            });

            if (settings.profile.location) {
                Object.keys(settings.profile.location).forEach(key => {
                    if (key !== 'coordinates') {
                        formData.append(`profile[location][${key}]`, settings.profile.location[key] || '');
                    }
                });
            }

            const response = await api.put('/settings', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSettings(response.data.settings);
            alert('Profile updated successfully!');
            checkIncompleteFields();
        } catch (error) {
            console.error('Update Profile Error:', error);
            alert('Failed to update profile: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateAccountSettings = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const formData = new FormData();

            formData.append('account[aadhaar][number]', aadhaar.number);
            formData.append('account[aadhaar][name]', aadhaar.name);

            if (aadhaar.document) {
                formData.append('aadhaarDocument', aadhaar.document);
            }

            formData.append('account[paymentMethod][type]', paymentMethod.type);

            if (paymentMethod.type === 'upi') {
                formData.append('account[paymentMethod][upiId]', paymentMethod.upiId);
            } else {
                formData.append('account[paymentMethod][bankDetails][accountHolderName]', paymentMethod.bankDetails.accountHolderName);
                formData.append('account[paymentMethod][bankDetails][accountNumber]', paymentMethod.bankDetails.accountNumber);
                formData.append('account[paymentMethod][bankDetails][ifscCode]', paymentMethod.bankDetails.ifscCode);
                formData.append('account[paymentMethod][bankDetails][bankName]', paymentMethod.bankDetails.bankName);
            }

            const response = await api.put('/settings/account', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSettings(response.data.settings);
            setAadhaar(response.data.settings.account.aadhaar);
            setPaymentMethod(response.data.settings.account.paymentMethod);
            alert('Account settings updated successfully!');
            checkIncompleteFields();
        } catch (error) {
            console.error('Update Account Settings Error:', error);
            alert('Failed to update account settings: ' + (error.response?.data?.message || 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateNotifications = async () => {
        setSaving(true);
        try {
            const response = await api.put('/settings/notifications', settings.notifications);
            setSettings(response.data.settings);
            alert('Notification preferences updated!');
        } catch (error) {
            console.error('Update Notifications Error:', error);
            alert('Failed to update notifications');
        } finally {
            setSaving(false);
        }
    };

    const handleUpdatePrivacy = async () => {
        setSaving(true);
        try {
            const response = await api.put('/settings/privacy', settings.privacy);
            setSettings(response.data.settings);
            alert('Privacy settings updated!');
        } catch (error) {
            console.error('Update Privacy Error:', error);
            alert('Failed to update privacy settings');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('New passwords do not match!');
            return;
        }

        if (passwordData.newPassword.length < 6) {
            alert('Password must be at least 6 characters!');
            return;
        }

        setSaving(true);
        try {
            await api.put('/settings/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            alert('Password changed successfully!');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Change Password Error:', error);
            alert(error.response?.data?.message || 'Failed to change password');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (deleteConfirmation !== 'DELETE MY ACCOUNT') {
            alert('Please type "DELETE MY ACCOUNT" to confirm');
            return;
        }

        const password = prompt('Enter your password to confirm account deletion:');
        if (!password) return;

        try {
            await api.delete('/settings/delete-account', {
                data: { password, confirmation: deleteConfirmation }
            });

            alert('Account deleted successfully');
            logout();
            navigate('/');
        } catch (error) {
            console.error('Delete Account Error:', error);
            alert(error.response?.data?.message || 'Failed to delete account');
        }
    };

    const getTabBadge = (tabId) => {
        const count = incompleteFields[tabId]?.length || 0;
        if (count === 0) return null;

        return (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {count}
            </span>
        );
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: FaUser, badge: getTabBadge('profile') },
        { id: 'account', label: 'Account Verification', icon: FaIdCard, badge: getTabBadge('account') },
        { id: 'orders', label: 'Orders', icon: FaShoppingBag },
        { id: 'wishlist', label: 'Wishlist', icon: FaHeart, badge: wishlistItems.length ? String(wishlistItems.length) : undefined },
        { id: 'notifications', label: 'Notifications', icon: FaBell },
        { id: 'privacy', label: 'Privacy', icon: FaShieldAlt },
        { id: 'preferences', label: 'Preferences', icon: FaCog },
        { id: 'security', label: 'Security', icon: FaLock },
        ...(user?.role === 'farmer' ? [{ id: 'farmer', label: 'Farm Details', icon: FaTractor, badge: getTabBadge('farmer') }] : []),
        ...(user?.role === 'homestay' ? [{ id: 'homestay', label: 'Homestay Details', icon: FaHome, badge: getTabBadge('homestay') }] : []),
        { id: 'payment', label: 'Payment', icon: FaCreditCard, badge: getTabBadge('payment') }
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-alt dark:bg-app-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-ink-soft-soft dark:text-ink-soft-soft font-medium">Loading settings...</p>
                </div>
            </div>
        );
    }

    if (!settings) {
        return (
            <div className="min-h-screen bg-surface-alt dark:bg-app-bg flex items-center justify-center">
                <div className="text-center bg-surface dark:bg-surface rounded-2xl shadow-lg p-8 max-w-md">
                    <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mb-2">Failed to Load Settings</h2>
                    <p className="text-ink-soft-soft dark:text-ink-soft-soft mb-6">Unable to fetch your settings. Please check your connection.</p>
                    <button
                        onClick={fetchSettings}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition shadow-md"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-alt dark:bg-app-bg py-8">
            <div className="max-w-7xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-ink-soft dark:text-ink-soft flex items-center gap-3">
                        <FaCog className="text-green-600" /> Settings
                    </h1>
                    <p className="text-gray-500 dark:text-ink-soft-soft mt-1">Manage your account preferences and settings</p>
                </div>

                {showIncompleteAlert && (
                    <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg p-4 shadow-md animate-pulse">
                        <div className="flex items-start">
                            <FaExclamationCircle className="text-red-500 text-2xl mt-1 mr-3 flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-bold text-red-800 text-lg mb-2">⚠️ Profile Incomplete</h3>
                                <p className="text-red-700 text-sm mb-3">
                                    Complete your profile to unlock full platform features and improve visibility!
                                </p>
                                <div className="space-y-1">
                                    {incompleteFields.profile.length > 0 && (
                                        <p className="text-xs text-red-600 font-semibold">
                                            • Profile: {incompleteFields.profile.length} field{incompleteFields.profile.length > 1 ? 's' : ''} missing
                                        </p>
                                    )}
                                    {incompleteFields.account.length > 0 && (
                                        <p className="text-xs text-red-600 font-semibold">
                                            • Account Verification: {incompleteFields.account.length} field{incompleteFields.account.length > 1 ? 's' : ''} missing
                                        </p>
                                    )}
                                    {incompleteFields.payment.length > 0 && (
                                        <p className="text-xs text-red-600 font-semibold">
                                            • Payment: {incompleteFields.payment.length} field{incompleteFields.payment.length > 1 ? 's' : ''} missing
                                        </p>
                                    )}
                                    {incompleteFields.farmer.length > 0 && (
                                        <p className="text-xs text-red-600 font-semibold">
                                            • Farm Details: {incompleteFields.farmer.length} field{incompleteFields.farmer.length > 1 ? 's' : ''} missing
                                        </p>
                                    )}
                                    {incompleteFields.homestay.length > 0 && (
                                        <p className="text-xs text-red-600 font-semibold">
                                            • Homestay Details: {incompleteFields.homestay.length} field{incompleteFields.homestay.length > 1 ? 's' : ''} missing
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={() => setShowIncompleteAlert(false)}
                                className="text-red-500 hover:text-red-700 ml-2"
                            >
                                <FaTimes />
                            </button>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-surface dark:bg-surface rounded-xl shadow-sm dark:shadow-none p-4 sticky top-4">
                            <div className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition font-medium text-left ${activeTab === tab.id
                                            ? 'bg-green-600 text-white shadow-md'
                                            : 'text-ink-soft-soft dark:text-ink-soft-soft hover:bg-surface-alt'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <tab.icon className="text-lg" />
                                            <span>{tab.label}</span>
                                        </div>
                                        {tab.badge}
                                    </button>
                                ))}

                                <div className="pt-4 border-t mt-4">
                                    <button
                                        onClick={logout}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition font-medium text-left text-red-600 hover:bg-red-50"
                                    >
                                        <FaSignOutAlt className="text-lg" />
                                        <span>Logout</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-surface dark:bg-surface rounded-xl shadow-sm dark:shadow-none p-6">
                            {activeTab === 'profile' && (
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mb-1">Profile Information</h2>
                                        <p className="text-sm text-gray-500 dark:text-ink-soft-soft">Update your personal details and profile picture</p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-surface-alt overflow-hidden flex items-center justify-center border-4 border-white shadow-lg">
                                                {avatarPreview ? (
                                                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <FaUser className="text-4xl text-gray-400 dark:text-ink-soft-soft" />
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 bg-green-600 text-white p-2 rounded-full cursor-pointer hover:bg-green-700 transition shadow-lg">
                                                <FaCamera />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleAvatarChange}
                                                    className="hidden"
                                                />
                                            </label>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-ink-soft dark:text-ink-soft">{user?.name}</h3>
                                            <p className="text-sm text-gray-500 dark:text-ink-soft-soft">{user?.email}</p>
                                            <p className="text-xs text-green-600 mt-1 capitalize font-semibold">{user?.role} Account</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                                Display Name *
                                                {isFieldIncomplete('profile', 'displayName') && (
                                                    <FaExclamationCircle className="text-red-500 animate-bounce" />
                                                )}
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.profile.displayName || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    profile: { ...settings.profile, displayName: e.target.value }
                                                })}
                                                className={`w-full p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('profile', 'displayName')
                                                    ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                    : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                    }`}
                                                placeholder="Your display name"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                                Phone Number *
                                                {isFieldIncomplete('profile', 'phone') && (
                                                    <FaExclamationCircle className="text-red-500 animate-bounce" />
                                                )}
                                            </label>
                                            <div className="relative">
                                                <FaPhone className={`absolute left-3 top-1/2 -translate-y-1/2 ${isFieldIncomplete('profile', 'phone') ? 'text-red-500' : 'text-gray-400 dark:text-ink-soft-soft'
                                                    }`} />
                                                <input
                                                    type="tel"
                                                    value={settings.profile.phone || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        profile: { ...settings.profile, phone: e.target.value }
                                                    })}
                                                    className={`w-full pl-10 p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('profile', 'phone')
                                                        ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                        : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                        }`}
                                                    placeholder="+91 XXXXX XXXXX"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                                Alternate Email *
                                                {isFieldIncomplete('profile', 'alternateEmail') && (
                                                    <FaExclamationCircle className="text-red-500 animate-bounce" />
                                                )}
                                            </label>
                                            <div className="relative">
                                                <FaEnvelope className={`absolute left-3 top-1/2 -translate-y-1/2 ${isFieldIncomplete('profile', 'alternateEmail') ? 'text-red-500' : 'text-gray-400 dark:text-ink-soft-soft'
                                                    }`} />
                                                <input
                                                    type="email"
                                                    value={settings.profile.alternateEmail || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        profile: { ...settings.profile, alternateEmail: e.target.value }
                                                    })}
                                                    className={`w-full pl-10 p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('profile', 'alternateEmail')
                                                        ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                        : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                        }`}
                                                    placeholder="alternate@email.com"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                                City *
                                                {isFieldIncomplete('profile', 'city') && (
                                                    <FaExclamationCircle className="text-red-500 animate-bounce" />
                                                )}
                                            </label>
                                            <div className="relative">
                                                <FaMapMarkerAlt className={`absolute left-3 top-1/2 -translate-y-1/2 ${isFieldIncomplete('profile', 'city') ? 'text-red-500' : 'text-gray-400 dark:text-ink-soft-soft'
                                                    }`} />
                                                <input
                                                    type="text"
                                                    value={settings.profile.location?.city || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        profile: {
                                                            ...settings.profile,
                                                            location: { ...settings.profile.location, city: e.target.value }
                                                        }
                                                    })}
                                                    className={`w-full pl-10 p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('profile', 'city')
                                                        ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                        : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                        }`}
                                                    placeholder="Your city"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                            Bio *
                                            {isFieldIncomplete('profile', 'bio') && (
                                                <FaExclamationCircle className="text-red-500 animate-bounce" />
                                            )}
                                        </label>
                                        <textarea
                                            value={settings.profile.bio || ''}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                profile: { ...settings.profile, bio: e.target.value }
                                            })}
                                            rows="4"
                                            className={`w-full p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('profile', 'bio')
                                                ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                }`}
                                            placeholder="Tell us about yourself..."
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave /> Save Profile
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {activeTab === 'account' && (
                                <form onSubmit={handleUpdateAccountSettings} className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mb-1 flex items-center gap-2">
                                            <FaIdCard className="text-blue-600" /> Account Verification
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-ink-soft-soft">Verify your identity and payment methods for {user?.role} account</p>
                                    </div>

                                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                                        <h3 className="font-bold text-ink-soft dark:text-ink-soft mb-4 flex items-center gap-2 text-lg">
                                            <FaIdCard className="text-blue-600" /> Aadhaar Verification
                                            {aadhaar.verified && <FaCheckCircle className="text-green-500 ml-2" />}
                                            {!aadhaar.verified && aadhaar.number && <FaClock className="text-yellow-500 ml-2" />}
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                                    Aadhaar Number *
                                                    {isFieldIncomplete('account', 'aadhaar') && (
                                                        <FaExclamationCircle className="text-red-500 animate-bounce" />
                                                    )}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={aadhaar.number}
                                                    onChange={(e) => {
                                                        const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                                                        setAadhaar({ ...aadhaar, number: value });
                                                    }}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('account', 'aadhaar')
                                                        ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                        : 'border-gray-300 dark:border-outline focus:border-blue-500'
                                                        }`}
                                                    placeholder="XXXX XXXX XXXX"
                                                    maxLength="12"
                                                    disabled={aadhaar.verified}
                                                />
                                                <p className="text-xs text-gray-500 dark:text-ink-soft-soft mt-1">12-digit Aadhaar number</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">
                                                    Name as per Aadhaar *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={aadhaar.name}
                                                    onChange={(e) => setAadhaar({ ...aadhaar, name: e.target.value })}
                                                    className="w-full p-3 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-blue-500"
                                                    placeholder="Full name"
                                                    disabled={aadhaar.verified}
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">
                                                Upload Aadhaar Document *
                                            </label>
                                            {aadhaar.documentPreview ? (
                                                <div className="relative border-2 border-dashed border-blue-300 rounded-lg p-4 bg-surface dark:bg-surface">
                                                    <img
                                                        src={aadhaar.documentPreview}
                                                        alt="Aadhaar Preview"
                                                        className="max-h-48 mx-auto rounded"
                                                    />
                                                    {!aadhaar.verified && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setAadhaar({ ...aadhaar, document: null, documentPreview: null })}
                                                            className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition"
                                                        >
                                                            <FaTimes />
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                <label className="flex flex-col items-center justify-center border-2 border-dashed border-blue-300 rounded-lg p-6 bg-surface dark:bg-surface hover:bg-blue-50 cursor-pointer transition">
                                                    <FaUpload className="text-4xl text-blue-400 mb-2" />
                                                    <span className="text-sm text-ink-soft-soft dark:text-ink-soft-soft text-center">
                                                        Click to upload Aadhaar card<br />
                                                        <span className="text-xs text-gray-400 dark:text-ink-soft-soft">(JPEG, PNG - Max 5MB)</span>
                                                    </span>
                                                    <input
                                                        type="file"
                                                        accept="image/*,.pdf"
                                                        onChange={handleAadhaarDocumentChange}
                                                        className="hidden"
                                                        disabled={aadhaar.verified}
                                                    />
                                                </label>
                                            )}
                                        </div>

                                        {aadhaar.verified ? (
                                            <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-3 flex items-center gap-2">
                                                <FaCheckCircle className="text-green-600 text-xl" />
                                                <div>
                                                    <p className="font-semibold text-green-800">Aadhaar Verified</p>
                                                    <p className="text-xs text-green-600">Your Aadhaar has been successfully verified</p>
                                                </div>
                                            </div>
                                        ) : aadhaar.number ? (
                                            <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3 flex items-center gap-2">
                                                <FaClock className="text-yellow-600 text-xl" />
                                                <div>
                                                    <p className="font-semibold text-yellow-800">Verification Pending</p>
                                                    <p className="text-xs text-yellow-600">Your Aadhaar is under verification</p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                                        <h3 className="font-bold text-ink-soft dark:text-ink-soft mb-4 flex items-center gap-2 text-lg">
                                            <FaWallet className="text-green-600" /> Payment Method
                                            {paymentMethod.verified && <FaCheckCircle className="text-green-500 ml-2" />}
                                        </h3>

                                        <div className="mb-4">
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">
                                                Select Payment Type *
                                            </label>
                                            <div className="flex gap-4">
                                                <label className={`flex-1 border-2 rounded-lg p-4 cursor-pointer transition ${paymentMethod.type === 'upi' ? 'border-green-500 bg-green-50' : 'border-gray-300 dark:border-outline hover:border-green-300'}`}>
                                                    <input
                                                        type="radio"
                                                        name="paymentType"
                                                        value="upi"
                                                        checked={paymentMethod.type === 'upi'}
                                                        onChange={(e) => setPaymentMethod({ ...paymentMethod, type: e.target.value })}
                                                        className="mr-2"
                                                        disabled={paymentMethod.verified}
                                                    />
                                                    <span className="font-semibold">UPI</span>
                                                </label>
                                                <label className={`flex-1 border-2 rounded-lg p-4 cursor-pointer transition ${paymentMethod.type === 'bank' ? 'border-green-500 bg-green-50' : 'border-gray-300 dark:border-outline hover:border-green-300'}`}>
                                                    <input
                                                        type="radio"
                                                        name="paymentType"
                                                        value="bank"
                                                        checked={paymentMethod.type === 'bank'}
                                                        onChange={(e) => setPaymentMethod({ ...paymentMethod, type: e.target.value })}
                                                        className="mr-2"
                                                        disabled={paymentMethod.verified}
                                                    />
                                                    <span className="font-semibold">Bank Account</span>
                                                </label>
                                            </div>
                                        </div>

                                        {paymentMethod.type === 'upi' ? (
                                            <div>
                                                <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                                    UPI ID *
                                                    {isFieldIncomplete('account', 'payment') && (
                                                        <FaExclamationCircle className="text-red-500 animate-bounce" />
                                                    )}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={paymentMethod.upiId}
                                                    onChange={(e) => setPaymentMethod({ ...paymentMethod, upiId: e.target.value })}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('account', 'payment')
                                                        ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                        : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                        }`}
                                                    placeholder="yourname@upi"
                                                    disabled={paymentMethod.verified}
                                                />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">
                                                        Account Holder Name *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={paymentMethod.bankDetails.accountHolderName}
                                                        onChange={(e) => setPaymentMethod({
                                                            ...paymentMethod,
                                                            bankDetails: { ...paymentMethod.bankDetails, accountHolderName: e.target.value }
                                                        })}
                                                        className="w-full p-3 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500"
                                                        placeholder="Full name"
                                                        disabled={paymentMethod.verified}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">
                                                        Account Number *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={paymentMethod.bankDetails.accountNumber}
                                                        onChange={(e) => setPaymentMethod({
                                                            ...paymentMethod,
                                                            bankDetails: { ...paymentMethod.bankDetails, accountNumber: e.target.value }
                                                        })}
                                                        className="w-full p-3 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500"
                                                        placeholder="XXXXXXXXXXXXXXXX"
                                                        disabled={paymentMethod.verified}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">
                                                        IFSC Code *
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={paymentMethod.bankDetails.ifscCode}
                                                        onChange={(e) => setPaymentMethod({
                                                            ...paymentMethod,
                                                            bankDetails: { ...paymentMethod.bankDetails, ifscCode: e.target.value.toUpperCase() }
                                                        })}
                                                        className="w-full p-3 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500"
                                                        placeholder="IFSC0001234"
                                                        disabled={paymentMethod.verified}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">
                                                        Bank Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={paymentMethod.bankDetails.bankName}
                                                        onChange={(e) => setPaymentMethod({
                                                            ...paymentMethod,
                                                            bankDetails: { ...paymentMethod.bankDetails, bankName: e.target.value }
                                                        })}
                                                        className="w-full p-3 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500"
                                                        placeholder="Bank name"
                                                        disabled={paymentMethod.verified}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {paymentMethod.verified ? (
                                            <div className="mt-4 bg-green-100 border border-green-300 rounded-lg p-3 flex items-center gap-2">
                                                <FaCheckCircle className="text-green-600 text-xl" />
                                                <div>
                                                    <p className="font-semibold text-green-800">Payment Method Verified</p>
                                                    <p className="text-xs text-green-600">Your payment method has been verified</p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>

                                    {!paymentMethod.verified && (
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                    Submitting for Verification...
                                                </>
                                            ) : (
                                                <>
                                                    <FaSave /> Submit for Verification
                                                </>
                                            )}
                                        </button>
                                    )}
                                </form>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mb-1">Notification Preferences</h2>
                                        <p className="text-sm text-gray-500 dark:text-ink-soft-soft">Choose how you want to be notified</p>
                                    </div>

                                    <div className="space-y-6">
                                        <div>
                                            <h3 className="font-bold text-ink-soft dark:text-ink-soft mb-4 flex items-center gap-2">
                                                <FaEnvelope className="text-green-600" /> Email Notifications
                                            </h3>
                                            <div className="space-y-3">
                                                {Object.keys(settings.notifications.email).map((key) => (
                                                    <label key={key} className="flex items-center justify-between p-4 bg-surface-alt dark:bg-app-bg rounded-lg hover:bg-surface-alt transition cursor-pointer">
                                                        <span className="text-sm font-medium text-ink-soft-soft dark:text-ink-soft-soft capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                        <input
                                                            type="checkbox"
                                                            checked={settings.notifications.email[key]}
                                                            onChange={(e) => setSettings({
                                                                ...settings,
                                                                notifications: {
                                                                    ...settings.notifications,
                                                                    email: { ...settings.notifications.email, [key]: e.target.checked }
                                                                }
                                                            })}
                                                            className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-ink-soft dark:text-ink-soft mb-4 flex items-center gap-2">
                                                <FaBell className="text-blue-600" /> Push Notifications
                                            </h3>
                                            <div className="space-y-3">
                                                {Object.keys(settings.notifications.push).map((key) => (
                                                    <label key={key} className="flex items-center justify-between p-4 bg-surface-alt dark:bg-app-bg rounded-lg hover:bg-surface-alt transition cursor-pointer">
                                                        <span className="text-sm font-medium text-ink-soft-soft dark:text-ink-soft-soft capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                        <input
                                                            type="checkbox"
                                                            checked={settings.notifications.push[key]}
                                                            onChange={(e) => setSettings({
                                                                ...settings,
                                                                notifications: {
                                                                    ...settings.notifications,
                                                                    push: { ...settings.notifications.push, [key]: e.target.checked }
                                                                }
                                                            })}
                                                            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="font-bold text-ink-soft dark:text-ink-soft mb-4 flex items-center gap-2">
                                                <FaPhone className="text-purple-600" /> SMS Notifications
                                            </h3>
                                            <div className="space-y-3">
                                                {Object.keys(settings.notifications.sms).map((key) => (
                                                    <label key={key} className="flex items-center justify-between p-4 bg-surface-alt dark:bg-app-bg rounded-lg hover:bg-surface-alt transition cursor-pointer">
                                                        <span className="text-sm font-medium text-ink-soft-soft dark:text-ink-soft-soft capitalize">
                                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                                        </span>
                                                        <input
                                                            type="checkbox"
                                                            checked={settings.notifications.sms[key]}
                                                            onChange={(e) => setSettings({
                                                                ...settings,
                                                                notifications: {
                                                                    ...settings.notifications,
                                                                    sms: { ...settings.notifications.sms, [key]: e.target.checked }
                                                                }
                                                            })}
                                                            className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-500"
                                                        />
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleUpdateNotifications}
                                        disabled={saving}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave /> Save Preferences
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {activeTab === 'privacy' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mb-1">Privacy Settings</h2>
                                        <p className="text-sm text-gray-500 dark:text-ink-soft-soft">Control your privacy and data visibility</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">Profile Visibility</label>
                                            <select
                                                value={settings.privacy.profileVisibility}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    privacy: { ...settings.privacy, profileVisibility: e.target.value }
                                                })}
                                                className="w-full p-3 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500 bg-surface dark:bg-surface"
                                            >
                                                <option value="public">Public - Anyone can see</option>
                                                <option value="private">Private - Only you can see</option>
                                                <option value="friends">Friends - Only connections can see</option>
                                            </select>
                                        </div>

                                        {['showLocation', 'showEmail', 'showPhone', 'allowMessages'].map((key) => (
                                            <label key={key} className="flex items-center justify-between p-4 bg-surface-alt dark:bg-app-bg rounded-lg hover:bg-surface-alt transition cursor-pointer">
                                                <span className="text-sm font-medium text-ink-soft-soft dark:text-ink-soft-soft capitalize">
                                                    {key.replace(/([A-Z])/g, ' $1').replace('show', 'Show my').replace('allow', 'Allow')}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    checked={settings.privacy[key]}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        privacy: { ...settings.privacy, [key]: e.target.checked }
                                                    })}
                                                    className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                                                />
                                            </label>
                                        ))}
                                    </div>

                                    <button
                                        onClick={handleUpdatePrivacy}
                                        disabled={saving}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave /> Save Privacy Settings
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {activeTab === 'preferences' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mb-1">App Preferences</h2>
                                        <p className="text-sm text-gray-500 dark:text-ink-soft-soft">Customize your app experience</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">
                                                <FaGlobe className="inline mr-2 text-green-600" /> Language
                                            </label>
                                            <select
                                                value={settings.preferences.language}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    preferences: { ...settings.preferences, language: e.target.value }
                                                })}
                                                className="w-full p-3 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500 bg-surface dark:bg-surface"
                                            >
                                                <option value="en">English</option>
                                                <option value="hi">Hindi</option>
                                                <option value="pa">Punjabi</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">
                                                <FaPalette className="inline mr-2 text-purple-600" /> Theme
                                            </label>
                                            <select
                                                value={settings.preferences.theme}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    preferences: { ...settings.preferences, theme: e.target.value }
                                                })}
                                                className="w-full p-3 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500 bg-surface dark:bg-surface"
                                            >
                                                <option value="light">Light</option>
                                                <option value="dark">Dark</option>
                                                <option value="auto">Auto</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">Currency</label>
                                            <select
                                                value={settings.preferences.currency}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    preferences: { ...settings.preferences, currency: e.target.value }
                                                })}
                                                className="w-full p-3 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500 bg-surface dark:bg-surface"
                                            >
                                                <option value="INR">INR (₹)</option>
                                                <option value="USD">USD ($)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">Map View</label>
                                            <select
                                                value={settings.preferences.mapView}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    preferences: { ...settings.preferences, mapView: e.target.value }
                                                })}
                                                className="w-full p-3 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500 bg-surface dark:bg-surface"
                                            >
                                                <option value="roadmap">Roadmap</option>
                                                <option value="satellite">Satellite</option>
                                                <option value="hybrid">Hybrid</option>
                                            </select>
                                        </div>
                                    </div>

                                    <button
                                        onClick={async () => {
                                            setSaving(true);
                                            try {
                                                const response = await api.put('/settings', { preferences: settings.preferences });
                                                setSettings(response.data.settings);
                                                // Actually apply the chosen theme to the app, in sync with
                                                // the navbar's dark/light toggle — 'auto' maps to the
                                                // system-driven 'default' theme.
                                                const themeMap = { light: 'light', dark: 'dark', auto: 'default' };
                                                setTheme(themeMap[settings.preferences.theme] || 'default');
                                                addToast('Preferences updated!', 'success');
                                            } catch (error) {
                                                addToast('Failed to update preferences', 'error');
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                        disabled={saving}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
                                    >
                                        {saving ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <FaSave /> Save Preferences
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mb-1">Security Settings</h2>
                                        <p className="text-sm text-gray-500 dark:text-ink-soft-soft">Manage your account security</p>
                                    </div>

                                    <form onSubmit={handleChangePassword} className="space-y-4">
                                        <h3 className="font-bold text-ink-soft dark:text-ink-soft">Change Password</h3>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">Current Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.current ? 'text' : 'password'}
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className="w-full p-3 pr-10 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft hover:text-ink-soft-soft"
                                                >
                                                    {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.new ? 'text' : 'password'}
                                                    value={passwordData.newPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                    className="w-full p-3 pr-10 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft hover:text-ink-soft-soft"
                                                >
                                                    {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">Confirm New Password</label>
                                            <div className="relative">
                                                <input
                                                    type={showPasswords.confirm ? 'text' : 'password'}
                                                    value={passwordData.confirmPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                    className="w-full p-3 pr-10 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-ink-soft-soft hover:text-ink-soft-soft"
                                                >
                                                    {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                                                </button>
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-60 shadow-md"
                                        >
                                            {saving ? 'Changing...' : 'Change Password'}
                                        </button>
                                    </form>

                                    <div className="pt-6 border-t">
                                        <h3 className="font-bold text-ink-soft dark:text-ink-soft mb-4 text-red-600 flex items-center gap-2">
                                            <FaExclamationTriangle /> Danger Zone
                                        </h3>
                                        <button
                                            onClick={() => setShowDeleteModal(true)}
                                            className="w-full bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-md"
                                        >
                                            <FaTrash /> Delete Account
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'payment' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mb-1">Payment Settings</h2>
                                        <p className="text-sm text-gray-500 dark:text-ink-soft-soft">Manage your payment methods</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                                UPI ID *
                                                {isFieldIncomplete('payment', 'upiId') && (
                                                    <FaExclamationCircle className="text-red-500 animate-bounce" />
                                                )}
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.payment.upiId || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    payment: { ...settings.payment, upiId: e.target.value }
                                                })}
                                                className={`w-full p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('payment', 'upiId')
                                                    ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                    : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                    }`}
                                                placeholder="yourname@upi"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                                    Account Holder Name *
                                                    {isFieldIncomplete('payment', 'accountHolderName') && (
                                                        <FaExclamationCircle className="text-red-500 animate-bounce" />
                                                    )}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settings.payment.bankDetails.accountHolderName || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        payment: {
                                                            ...settings.payment,
                                                            bankDetails: { ...settings.payment.bankDetails, accountHolderName: e.target.value }
                                                        }
                                                    })}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('payment', 'accountHolderName')
                                                        ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                        : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                        }`}
                                                    placeholder="Full name"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                                    Account Number *
                                                    {isFieldIncomplete('payment', 'accountNumber') && (
                                                        <FaExclamationCircle className="text-red-500 animate-bounce" />
                                                    )}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settings.payment.bankDetails.accountNumber || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        payment: {
                                                            ...settings.payment,
                                                            bankDetails: { ...settings.payment.bankDetails, accountNumber: e.target.value }
                                                        }
                                                    })}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('payment', 'accountNumber')
                                                        ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                        : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                        }`}
                                                    placeholder="XXXXXXXXXXXXXXXX"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                                    IFSC Code *
                                                    {isFieldIncomplete('payment', 'ifscCode') && (
                                                        <FaExclamationCircle className="text-red-500 animate-bounce" />
                                                    )}
                                                </label>
                                                <input
                                                    type="text"
                                                    value={settings.payment.bankDetails.ifscCode || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        payment: {
                                                            ...settings.payment,
                                                            bankDetails: { ...settings.payment.bankDetails, ifscCode: e.target.value }
                                                        }
                                                    })}
                                                    className={`w-full p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('payment', 'ifscCode')
                                                        ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                        : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                        }`}
                                                    placeholder="IFSC0001234"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">Bank Name</label>
                                                <input
                                                    type="text"
                                                    value={settings.payment.bankDetails.bankName || ''}
                                                    onChange={(e) => setSettings({
                                                        ...settings,
                                                        payment: {
                                                            ...settings.payment,
                                                            bankDetails: { ...settings.payment.bankDetails, bankName: e.target.value }
                                                        }
                                                    })}
                                                    className="w-full p-3 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500"
                                                    placeholder="Bank name"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={async () => {
                                            setSaving(true);
                                            try {
                                                const response = await api.put('/settings', { payment: settings.payment });
                                                setSettings(response.data.settings);
                                                alert('Payment settings updated!');
                                                checkIncompleteFields();
                                            } catch (error) {
                                                alert('Failed to update payment settings');
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                        disabled={saving}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-60 shadow-md"
                                    >
                                        {saving ? 'Saving...' : 'Save Payment Details'}
                                    </button>
                                </div>
                            )}

                            {activeTab === 'orders' && (
                                <OrdersTab />
                            )}

                            {activeTab === 'wishlist' && (
                                <div className="space-y-4">
                                    <h2 className="text-xl font-bold text-ink-soft dark:text-ink-soft mb-4">My Wishlist</h2>
                                    {wishlistItems.length === 0 ? (
                                        <div className="text-center py-16">
                                            <FaHeartBroken className="text-5xl text-gray-300 dark:text-outline mx-auto mb-4" />
                                            <p className="text-ink-soft-soft dark:text-ink-soft-soft font-medium">Your wishlist is empty.</p>
                                            <p className="text-sm text-gray-400 dark:text-ink-soft-soft mt-1">Tap the heart icon on any product or homestay to save it here.</p>
                                            <button
                                                onClick={() => navigate('/products')}
                                                className="mt-5 bg-green-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-green-700 transition"
                                            >
                                                Browse Products
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {wishlistItems.map((item) => (
                                                <div key={`${item.type}-${item.id}`} className="flex gap-3 border border-gray-200 dark:border-outline rounded-xl p-3 bg-surface dark:bg-surface">
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                                                        onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=200&q=80'; }}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-ink-soft dark:text-ink-soft truncate">{item.name}</p>
                                                        <p className="text-xs text-ink-soft-soft dark:text-ink-soft-soft">by {item.sellerName || 'Himalayan Connect'}</p>
                                                        <p className="text-green-600 font-bold mt-1">₹{item.price}{item.unit ? `/${item.unit}` : ''}</p>
                                                        <div className="flex gap-2 mt-2">
                                                            {item.sellerId && (
                                                                <button
                                                                    onClick={() => navigate(`/messages?to=${item.sellerId}&productName=${encodeURIComponent(item.name)}`)}
                                                                    title="Message seller"
                                                                    className="text-xs px-2.5 py-1 rounded-lg bg-surface-alt dark:bg-surface-alt border border-gray-200 dark:border-outline hover:bg-blue-50 dark:hover:bg-blue-900/30 flex items-center gap-1"
                                                                >
                                                                    <FaCommentDots /> Message
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => removeFromWishlist(item.id, item.type)}
                                                                className="text-xs px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:bg-red-100 flex items-center gap-1"
                                                            >
                                                                <FaTrash /> Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'farmer' && user?.role === 'farmer' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mb-1 flex items-center gap-2">
                                            <FaTractor className="text-green-600" /> Farm Details
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-ink-soft-soft">Manage your farm information</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                                Farm Name *
                                                {isFieldIncomplete('farmer', 'farmName') && (
                                                    <FaExclamationCircle className="text-red-500 animate-bounce" />
                                                )}
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.farmer.farmName || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    farmer: { ...settings.farmer, farmName: e.target.value }
                                                })}
                                                className={`w-full p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('farmer', 'farmName')
                                                    ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                    : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                    }`}
                                                placeholder="Green Valley Farm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                                Farm Size (acres) *
                                                {isFieldIncomplete('farmer', 'farmSize') && (
                                                    <FaExclamationCircle className="text-red-500 animate-bounce" />
                                                )}
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.farmer.farmSize || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    farmer: { ...settings.farmer, farmSize: Number(e.target.value) }
                                                })}
                                                className={`w-full p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('farmer', 'farmSize')
                                                    ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                    : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                    }`}
                                                placeholder="10"
                                                min="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                                Farm Type *
                                                {isFieldIncomplete('farmer', 'farmType') && (
                                                    <FaExclamationCircle className="text-red-500 animate-bounce" />
                                                )}
                                            </label>
                                            <select
                                                value={settings.farmer.farmType || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    farmer: { ...settings.farmer, farmType: e.target.value }
                                                })}
                                                className={`w-full p-3 border rounded-lg focus:outline-none transition bg-surface dark:bg-surface ${isFieldIncomplete('farmer', 'farmType')
                                                    ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                    : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                    }`}
                                            >
                                                <option value="">Select type</option>
                                                <option value="organic">Organic</option>
                                                <option value="conventional">Conventional</option>
                                                <option value="mixed">Mixed</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">Harvest Schedule</label>
                                            <input
                                                type="text"
                                                value={settings.farmer.harvestSchedule || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    farmer: { ...settings.farmer, harvestSchedule: e.target.value }
                                                })}
                                                className="w-full p-3 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500"
                                                placeholder="Seasonal / Year-round"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={async () => {
                                            setSaving(true);
                                            try {
                                                const response = await api.put('/settings', { farmer: settings.farmer });
                                                setSettings(response.data.settings);
                                                alert('Farm details updated!');
                                                checkIncompleteFields();
                                            } catch (error) {
                                                alert('Failed to update farm details');
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                        disabled={saving}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-60 shadow-md"
                                    >
                                        {saving ? 'Saving...' : 'Save Farm Details'}
                                    </button>
                                </div>
                            )}

                            {activeTab === 'homestay' && user?.role === 'homestay' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mb-1 flex items-center gap-2">
                                            <FaHome className="text-blue-600" /> Homestay Details
                                        </h2>
                                        <p className="text-sm text-gray-500 dark:text-ink-soft-soft">Manage your homestay information</p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                                Property Name *
                                                {isFieldIncomplete('homestay', 'propertyName') && (
                                                    <FaExclamationCircle className="text-red-500 animate-bounce" />
                                                )}
                                            </label>
                                            <input
                                                type="text"
                                                value={settings.homestay.propertyName || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    homestay: { ...settings.homestay, propertyName: e.target.value }
                                                })}
                                                className={`w-full p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('homestay', 'propertyName')
                                                    ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                    : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                    }`}
                                                placeholder="Mountain View Homestay"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                                Total Rooms *
                                                {isFieldIncomplete('homestay', 'totalRooms') && (
                                                    <FaExclamationCircle className="text-red-500 animate-bounce" />
                                                )}
                                            </label>
                                            <input
                                                type="number"
                                                value={settings.homestay.totalRooms || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    homestay: { ...settings.homestay, totalRooms: Number(e.target.value) }
                                                })}
                                                className={`w-full p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('homestay', 'totalRooms')
                                                    ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                    : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                    }`}
                                                placeholder="5"
                                                min="0"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">Check-in Time</label>
                                            <input
                                                type="time"
                                                value={settings.homestay.checkInTime || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    homestay: { ...settings.homestay, checkInTime: e.target.value }
                                                })}
                                                className="w-full p-3 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">Check-out Time</label>
                                            <input
                                                type="time"
                                                value={settings.homestay.checkOutTime || ''}
                                                onChange={(e) => setSettings({
                                                    ...settings,
                                                    homestay: { ...settings.homestay, checkOutTime: e.target.value }
                                                })}
                                                className="w-full p-3 border border-gray-300 dark:border-outline rounded-lg focus:outline-none focus:border-green-500"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2 flex items-center gap-2">
                                            Cancellation Policy *
                                            {isFieldIncomplete('homestay', 'cancellationPolicy') && (
                                                <FaExclamationCircle className="text-red-500 animate-bounce" />
                                            )}
                                        </label>
                                        <textarea
                                            value={settings.homestay.cancellationPolicy || ''}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                homestay: { ...settings.homestay, cancellationPolicy: e.target.value }
                                            })}
                                            rows="4"
                                            className={`w-full p-3 border rounded-lg focus:outline-none transition ${isFieldIncomplete('homestay', 'cancellationPolicy')
                                                ? 'border-red-500 bg-red-50 focus:border-red-600'
                                                : 'border-gray-300 dark:border-outline focus:border-green-500'
                                                }`}
                                            placeholder="Describe your cancellation policy..."
                                        />
                                    </div>

                                    <button
                                        onClick={async () => {
                                            setSaving(true);
                                            try {
                                                const response = await api.put('/settings', { homestay: settings.homestay });
                                                setSettings(response.data.settings);
                                                alert('Homestay details updated!');
                                                checkIncompleteFields();
                                            } catch (error) {
                                                alert('Failed to update homestay details');
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                        disabled={saving}
                                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-60 shadow-md"
                                    >
                                        {saving ? 'Saving...' : 'Save Homestay Details'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-surface dark:bg-surface rounded-2xl p-8 max-w-md w-full">
                        <div className="text-center mb-6">
                            <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4 animate-pulse" />
                            <h3 className="text-2xl font-bold text-ink-soft dark:text-ink-soft mb-2">Delete Account?</h3>
                            <p className="text-ink-soft-soft dark:text-ink-soft-soft">This action cannot be undone. All your data will be permanently deleted.</p>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-ink-soft-soft dark:text-ink-soft-soft mb-2">
                                Type <span className="text-red-600 font-bold">"DELETE MY ACCOUNT"</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={deleteConfirmation}
                                onChange={(e) => setDeleteConfirmation(e.target.value)}
                                className="w-full p-3 border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500"
                                placeholder="DELETE MY ACCOUNT"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeleteConfirmation('');
                                }}
                                className="flex-1 bg-gray-200 dark:bg-surface-alt text-ink-soft-soft dark:text-ink-soft-soft py-3 rounded-lg font-bold hover:bg-gray-300 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmation !== 'DELETE MY ACCOUNT'}
                                className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition disabled:opacity-50"
                            >
                                Delete Forever
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Fetches and displays the logged-in user's orders (as a buyer).
const OrdersTab = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await api.get('/orders');
                setOrders(response.data.orders || []);
            } catch (err) {
                setError('Could not load your orders right now.');
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const statusColor = (status) => {
        switch (status) {
            case 'delivered': return 'bg-green-50 text-green-700 border-green-200';
            case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
            case 'shipped':
            case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-amber-50 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold text-ink-soft dark:text-ink-soft mb-4">My Orders</h2>
            {loading ? (
                <div className="text-center py-16">
                    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-ink-soft-soft dark:text-ink-soft-soft">Loading your orders...</p>
                </div>
            ) : error ? (
                <p className="text-center py-10 text-red-500">{error}</p>
            ) : orders.length === 0 ? (
                <div className="text-center py-16">
                    <FaShoppingBag className="text-5xl text-gray-300 dark:text-outline mx-auto mb-4" />
                    <p className="text-ink-soft-soft dark:text-ink-soft-soft font-medium">You haven't placed any orders yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order) => (
                        <div key={order._id} className="border border-gray-200 dark:border-outline rounded-xl p-4 bg-surface dark:bg-surface">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-mono text-gray-400 dark:text-ink-soft-soft">Order #{order._id.slice(-8).toUpperCase()}</span>
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${statusColor(order.status)}`}>
                                    {order.status || 'pending'}
                                </span>
                            </div>
                            <div className="space-y-1">
                                {(order.items || []).map((it, idx) => (
                                    <p key={idx} className="text-sm text-ink-soft dark:text-ink-soft">
                                        {it.productName} × {it.quantity} — ₹{it.price}
                                    </p>
                                ))}
                            </div>
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-outline">
                                <span className="text-xs text-gray-400 dark:text-ink-soft-soft">
                                    {order.farmer?.name ? `Seller: ${order.farmer.name}` : ''}
                                </span>
                                <span className="font-bold text-green-600">₹{order.totalAmount}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Settings;