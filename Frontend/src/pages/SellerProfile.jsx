import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaMapMarkerAlt, FaCheckCircle, FaStar, FaSeedling, FaHome, FaCommentDots, FaImage, FaVideo, FaPlus, FaTimes, FaUpload, FaThLarge, FaLeaf, FaBed, FaWifi, FaUtensils, FaAward, FaUsers, FaCalendar, FaMapPin, FaPhone, FaEnvelope, FaTrash, FaEdit, FaHeart, FaShare, FaEllipsisV, FaCloudUploadAlt, FaPlay, FaFileAlt, FaShoppingCart } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ToastContainer';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export default function SellerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { addToast } = useToast();
  const { user: loggedInUser } = useAuth();
  const { addToCart } = useCart();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showPostModal, setShowPostModal] = useState(false);
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [postLikes, setPostLikes] = useState({});
  const [uploadingPost, setUploadingPost] = useState(false);
  const [selectedPostImage, setSelectedPostImage] = useState(null);
  const [selectedPostVideo, setSelectedPostVideo] = useState(null);

  const [formData, setFormData] = useState({
    content: '',
    type: 'image',
    mediaUrl: '',
    mediaFile: null,
    location: ''
  });

  const [farmData, setFarmData] = useState({
    farmName: '',
    areaSize: '',
    cropTypes: '',
    certifications: '',
    description: '',
    contact: '',
    harvestSeasons: '',
    location: ''
  });

  const [roomData, setRoomData] = useState({
    roomName: '',
    capacity: '',
    pricePerNight: '',
    amenities: '',
    description: '',
    images: [],
    maxGuests: '',
    location: ''
  });

  useEffect(() => {
    let active = true;
    setLoading(true);

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profile/${id}`);
        if (!response.ok) throw new Error('Failed to fetch profile');

        const data = await response.json();
        if (active) {
          setProfile(data);
          const likes = {};
          (data.posts || []).forEach(post => {
            likes[post._id] = post.likes || 0;
          });
          setPostLikes(likes);
        }
      } catch (error) {
        if (active) {
          console.error('Profile fetch error:', error);
          addToast('Failed to load profile', 'error');
          setProfile(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProfile();

    return () => {
      active = false;
    };
  }, [id, addToast]);

  const handlePostImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        addToast('Image size must be less than 10MB', 'error');
        return;
      }
      setSelectedPostImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setFormData({ ...formData, mediaUrl: reader.result, mediaFile: file });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePostVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        addToast('Video size must be less than 100MB', 'error');
        return;
      }
      setSelectedPostVideo(file);
      setFormData({ ...formData, mediaUrl: file.name, mediaFile: file, type: 'video' });
    }
  };

  const handleRoomImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (roomData.images.length + files.length > 5) {
      addToast('Maximum 5 images allowed per room', 'error');
      return;
    }
    setRoomData({
      ...roomData,
      images: [...roomData.images, ...files]
    });
  };

  const handleCreatePost = async () => {
    if (!formData.content && !formData.mediaUrl) {
      addToast('Please add content or media', 'error');
      return;
    }

    setUploadingPost(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('content', formData.content);
      formDataObj.append('type', formData.type);
      formDataObj.append('location', formData.location || '');
      formDataObj.append('userId', profile.user._id);
      if (formData.mediaFile) {
        formDataObj.append('media', formData.mediaFile);
      }

      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        body: formDataObj,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to create post');

      const newPost = await response.json();

      setProfile({
        ...profile,
        posts: [newPost, ...(profile.posts || [])]
      });

      setFormData({ content: '', type: 'image', mediaUrl: '', mediaFile: null, location: '' });
      setSelectedPostImage(null);
      setSelectedPostVideo(null);
      setShowPostModal(false);

      addToast('Post created successfully!', 'success');
    } catch (error) {
      console.error('Post creation error:', error);
      addToast('Failed to create post', 'error');
    } finally {
      setUploadingPost(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Delete this post?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete post');

      setProfile({
        ...profile,
        posts: profile.posts.filter(p => p._id !== postId)
      });
      addToast('Post deleted', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      addToast('Failed to delete post', 'error');
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to like post');

      setPostLikes({
        ...postLikes,
        [postId]: (postLikes[postId] || 0) + 1
      });
    } catch (error) {
      console.error('Like error:', error);
      addToast('Failed to like post', 'error');
    }
  };

  const handleSharePost = (post) => {
    const text = `Check out this post from ${profile.user.name}: ${post.content}`;
    if (navigator.share) {
      navigator.share({
        title: 'HimalayanConnect',
        text: text,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast('Link copied to clipboard!', 'success');
    }
  };

  const handleCreateFarm = async () => {
    if (!farmData.farmName || !farmData.areaSize) {
      addToast('Please fill required fields', 'error');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/farms`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...farmData,
          userId: profile.user._id
        })
      });

      if (!response.ok) throw new Error('Failed to create farm');

      const newFarm = await response.json();

      setProfile({
        ...profile,
        farmDetails: [newFarm, ...(profile.farmDetails || [])]
      });

      setFarmData({
        farmName: '',
        areaSize: '',
        cropTypes: '',
        certifications: '',
        description: '',
        contact: '',
        harvestSeasons: '',
        location: ''
      });
      setShowFarmModal(false);
      addToast('Farm details added!', 'success');
    } catch (error) {
      console.error('Farm creation error:', error);
      addToast('Failed to add farm details', 'error');
    }
  };

  const handleDeleteFarm = async (farmId) => {
    if (!window.confirm('Delete farm details?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/farms/${farmId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete farm');

      setProfile({
        ...profile,
        farmDetails: profile.farmDetails.filter(f => f._id !== farmId)
      });
      addToast('Farm details deleted', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      addToast('Failed to delete farm', 'error');
    }
  };

  const handleCreateRoom = async () => {
    if (!roomData.roomName || !roomData.pricePerNight || !roomData.capacity) {
      addToast('Please fill required fields', 'error');
      return;
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append('roomName', roomData.roomName);
      formDataObj.append('capacity', roomData.capacity);
      formDataObj.append('pricePerNight', roomData.pricePerNight);
      formDataObj.append('amenities', roomData.amenities);
      formDataObj.append('description', roomData.description);
      formDataObj.append('maxGuests', roomData.maxGuests);
      formDataObj.append('location', roomData.location);
      formDataObj.append('userId', profile.user._id);

      roomData.images.forEach((img, idx) => {
        if (img instanceof File) {
          formDataObj.append('images', img);
        }
      });

      const response = await fetch(`${API_BASE_URL}/api/rooms`, {
        method: 'POST',
        body: formDataObj,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to create room');

      const newRoom = await response.json();

      setProfile({
        ...profile,
        homestayRooms: [newRoom, ...(profile.homestayRooms || [])]
      });

      setRoomData({
        roomName: '',
        capacity: '',
        pricePerNight: '',
        amenities: '',
        description: '',
        images: [],
        maxGuests: '',
        location: ''
      });
      setShowRoomModal(false);
      addToast('Room added successfully!', 'success');
    } catch (error) {
      console.error('Room creation error:', error);
      addToast('Failed to add room', 'error');
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Delete this room?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete room');

      setProfile({
        ...profile,
        homestayRooms: profile.homestayRooms.filter(r => r._id !== roomId)
      });
      addToast('Room deleted', 'success');
    } catch (error) {
      console.error('Delete error:', error);
      addToast('Failed to delete room', 'error');
    }
  };

  const handleRemoveRoomImage = (index) => {
    const newImages = roomData.images.filter((_, i) => i !== index);
    setRoomData({ ...roomData, images: newImages });
  };

  const addRoomToCart = (room, host) => {
    addToCart({
      id: room._id,
      type: 'room',
      name: room.roomName,
      price: room.pricePerNight,
      unit: 'night',
      image: room.images && room.images[0]
        ? (room.images[0].startsWith('http') ? room.images[0] : `${API_BASE_URL}${room.images[0]}`)
        : '',
      sellerId: host._id,
      sellerName: host.name
    });
    addToast(`${room.roomName} added to cart!`, 'success');
  };

  if (loading) {
    return (
      <div className={`min-h-screen pt-20 flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-surface-alt'}`}>
        <div className="text-center">
          <div className="animate-spin mb-4">
            <FaThLarge className={`text-4xl ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
          </div>
          <p className={`font-semibold ${darkMode ? 'border-outline' : 'text-ink-soft-soft'}`}>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile || !profile.user) {
    return (
      <div className={`min-h-screen pt-20 flex items-center justify-center ${darkMode ? 'bg-gray-900 border-outline' : 'bg-surface-alt text-ink-soft-soft'}`}>
        <div className="text-center">
          <FaTimes className="text-4xl mb-4 mx-auto opacity-50" />
          <p className="text-lg font-semibold">Profile not found</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const { user, products = [], homestays = [], posts = [], farmDetails = [], homestayRooms = [] } = profile;
  const isFarmer = user.role === 'farmer';
  const isHomestayOwner = user.role === 'homestay' || user.role === 'homestay_owner';
  const isOwnProfile = Boolean(
    loggedInUser && (String(loggedInUser._id) === String(user._id) || String(loggedInUser.id) === String(user._id))
  );

  return (
    <div className={`min-h-screen pt-20 pb-16 transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-surface-alt'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className={`rounded-3xl border shadow-sm p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 ${darkMode
          ? 'bg-gray-800 border-gray-700'
          : 'bg-surface border-gray-100'
          }`}>
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'}
            alt={user.name}
            className="w-24 h-24 rounded-2xl object-cover border-4 border-green-500/20"
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h1 className={`text-3xl font-black ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
                {user.name}
              </h1>
              {user.aadhaarVerified && (
                <FaCheckCircle className="text-green-500 text-xl" title="Aadhaar Verified" />
              )}
            </div>
            <p className={`text-sm mt-1 flex items-center justify-center sm:justify-start gap-1.5 ${darkMode ? 'text-gray-400' : 'text-ink-soft-soft'
              }`}>
              {isFarmer ? <FaSeedling className="text-green-600" /> : <FaHome className="text-green-600" />}
              {isFarmer ? 'Verified Farmer' : 'Verified Homestay Host'}
            </p>
            {user.location && (
              <p className={`text-sm mt-1 flex items-center justify-center sm:justify-start gap-1.5 ${darkMode ? 'text-gray-400' : 'text-ink-soft-soft'
                }`}>
                <FaMapMarkerAlt /> {user.location}
              </p>
            )}
            {user.bio && (
              <p className={`mt-4 leading-relaxed max-w-xl ${darkMode ? 'border-outline' : 'text-ink-soft-soft'}`}>
                {user.bio}
              </p>
            )}
          </div>
          <div className="flex flex-col items-center gap-3">
            {user.rating && (
              <div className={`flex items-center gap-1 font-bold text-lg ${darkMode ? 'text-amber-400' : 'text-amber-500'}`}>
                <FaStar /> {user.rating.toFixed(1)}
              </div>
            )}
            <button
              onClick={() => navigate(`/messages?user=${id}`)}
              className={`flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold rounded-xl transition-all shadow-md active:scale-95 ${isOwnProfile ? 'hidden' : ''}`}
            >
              <FaCommentDots /> Message
            </button>
          </div>
        </div>

        <div className={`rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-surface border-gray-100'}`}>
          <div className={`flex gap-2 border-b overflow-x-auto ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            {isFarmer && (
              <>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'overview'
                    ? `border-green-600 ${darkMode ? 'text-green-400' : 'text-green-600'}`
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:border-outline' : 'text-ink-soft-soft hover:text-ink-soft'}`
                    }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('farm')}
                  className={`px-6 py-3 font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'farm'
                    ? `border-green-600 ${darkMode ? 'text-green-400' : 'text-green-600'}`
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:border-outline' : 'text-ink-soft-soft hover:text-ink-soft'}`
                    }`}
                >
                  <FaSeedling /> Farm
                </button>
                <button
                  onClick={() => setActiveTab('produce')}
                  className={`px-6 py-3 font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'produce'
                    ? `border-green-600 ${darkMode ? 'text-green-400' : 'text-green-600'}`
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:border-outline' : 'text-ink-soft-soft hover:text-ink-soft'}`
                    }`}
                >
                  Produce
                </button>
              </>
            )}
            {isHomestayOwner && (
              <>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'overview'
                    ? `border-green-600 ${darkMode ? 'text-green-400' : 'text-green-600'}`
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:border-outline' : 'text-ink-soft-soft hover:text-ink-soft'}`
                    }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('rooms')}
                  className={`px-6 py-3 font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap ${activeTab === 'rooms'
                    ? `border-green-600 ${darkMode ? 'text-green-400' : 'text-green-600'}`
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:border-outline' : 'text-ink-soft-soft hover:text-ink-soft'}`
                    }`}
                >
                  <FaBed /> Rooms
                </button>
                <button
                  onClick={() => setActiveTab('homestays')}
                  className={`px-6 py-3 font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'homestays'
                    ? `border-green-600 ${darkMode ? 'text-green-400' : 'text-green-600'}`
                    : `border-transparent ${darkMode ? 'text-gray-400 hover:border-outline' : 'text-ink-soft-soft hover:text-ink-soft'}`
                    }`}
                >
                  Homestays
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('posts')}
              className={`px-6 py-3 font-bold transition-all border-b-2 whitespace-nowrap ${activeTab === 'posts'
                ? `border-green-600 ${darkMode ? 'text-green-400' : 'text-green-600'}`
                : `border-transparent ${darkMode ? 'text-gray-400 hover:border-outline' : 'text-ink-soft-soft hover:text-ink-soft'}`
                }`}
            >
              Posts
            </button>
          </div>

          <div className="p-6 space-y-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
                  Profile Overview
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-green-50 border-green-200'}`}>
                    <p className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-ink-soft-soft'}`}>
                      {isFarmer ? 'Products Listed' : 'Rooms Listed'}
                    </p>
                    <p className={`text-3xl font-black mt-1 ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
                      {isFarmer ? products.length : homestayRooms.length}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-blue-50 border-blue-200'}`}>
                    <p className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-ink-soft-soft'}`}>
                      Posts
                    </p>
                    <p className={`text-3xl font-black mt-1 ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
                      {posts.length}
                    </p>
                  </div>
                  <div className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-amber-50 border-amber-200'}`}>
                    <p className={`text-sm font-bold ${darkMode ? 'text-gray-400' : 'text-ink-soft-soft'}`}>
                      Rating
                    </p>
                    <p className={`text-3xl font-black mt-1 flex items-center gap-1 ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
                      <FaStar className="text-amber-500" /> {user.rating ? user.rating.toFixed(1) : '0'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'farm' && isFarmer && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
                    Farm Details
                  </h2>
                  {isOwnProfile && (
                    <button
                      onClick={() => setShowFarmModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all text-sm"
                    >
                      <FaPlus /> Add Farm
                    </button>
                  )}
                </div>
                {farmDetails.length === 0 ? (
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-ink-soft-soft'}`}>
                    No farm details added yet
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {farmDetails.map((farm) => (
                      <div
                        key={farm._id}
                        className={`rounded-2xl border p-5 ${darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                          }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
                            {farm.farmName}
                          </h3>
                          {isOwnProfile && (
                            <button
                              onClick={() => handleDeleteFarm(farm._id)}
                              className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600 transition-all"
                            >
                              <FaTrash />
                            </button>
                          )}
                        </div>
                        <div className={`space-y-2 text-sm ${darkMode ? 'border-outline' : 'text-ink-soft-soft'}`}>
                          <p><span className="font-bold">Size:</span> {farm.areaSize} hectares</p>
                          <p><span className="font-bold">Crops:</span> {farm.cropTypes}</p>
                          {farm.location && <p className="flex items-center gap-2"><FaMapPin className="text-green-600" /> {farm.location}</p>}
                          {farm.certifications && <p><span className="font-bold">Certifications:</span> {farm.certifications}</p>}
                          {farm.harvestSeasons && <p><span className="font-bold">Harvest:</span> {farm.harvestSeasons}</p>}
                          {farm.description && <p className="mt-3 leading-relaxed">{farm.description}</p>}
                          {farm.contact && <p className="flex items-center gap-2 mt-3"><FaPhone className="text-green-600" /> {farm.contact}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'produce' && isFarmer && (
              <div>
                <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
                  Organic Produce
                </h2>
                {products.length === 0 ? (
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-ink-soft-soft'}`}>
                    No products listed yet
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {products.map((product) => (
                      <div
                        key={product._id}
                        className={`rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all ${darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-surface border-gray-100'
                          }`}
                      >
                        <img
                          src={product.imageUrl ? `${API_BASE_URL}${product.imageUrl}` : (product.image || 'https://via.placeholder.com/400x300?text=Fresh+Himalayan+Produce')}
                          alt={product.productName || product.name}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4">
                          <p className={`font-bold ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
                            {product.productName || product.name}
                          </p>
                          <p className="text-green-600 font-bold mt-2 text-lg">
                            ₹{product.basePrice || product.price}/{product.unit || 'kg'}
                          </p>
                          {(product.quantity || product.availability?.quantity) && (
                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-ink-soft-soft'}`}>
                              Stock: {product.quantity || product.availability?.quantity} {product.unit || 'kg'}
                            </p>
                          )}
                          {!isOwnProfile && (
                            <button
                              onClick={() => addToCart({
                                id: product._id,
                                type: 'product',
                                name: product.productName || product.name,
                                price: product.basePrice || product.price,
                                unit: product.unit || 'kg',
                                image: product.imageUrl ? `${API_BASE_URL}${product.imageUrl}` : product.image,
                                sellerId: user._id,
                                sellerName: user.name
                              })}
                              className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-lg transition-all text-sm active:scale-95"
                            >
                              <FaShoppingCart /> Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'rooms' && isHomestayOwner && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
                    Rooms & Accommodation
                  </h2>
                  {isOwnProfile && (
                    <button
                      onClick={() => setShowRoomModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all text-sm"
                    >
                      <FaPlus /> Add Room
                    </button>
                  )}
                </div>
                {homestayRooms.length === 0 ? (
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-ink-soft-soft'}`}>
                    No rooms added yet
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {homestayRooms.map((room) => (
                      <div
                        key={room._id}
                        className={`rounded-2xl border overflow-hidden shadow-sm ${darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-surface border-gray-100'
                          }`}
                      >
                        {room.images && room.images.length > 0 && (
                          <div className="relative w-full h-48 bg-gray-200 dark:bg-gray-600 overflow-x-auto flex">
                            {room.images.map((img, idx) => {
                              const src = typeof img === 'string'
                                ? (img.startsWith('http') ? img : `${API_BASE_URL}${img}`)
                                : URL.createObjectURL(img);
                              return (
                                <img
                                  key={idx}
                                  src={src}
                                  alt={`Room ${idx + 1}`}
                                  className="h-full min-w-full object-cover"
                                />
                              );
                            })}
                          </div>
                        )}
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
                                {room.roomName}
                              </h3>
                              <p className="text-green-600 font-bold text-xl mt-1">
                                ₹{room.pricePerNight}/night
                              </p>
                            </div>
                            {isOwnProfile && (
                              <button
                                onClick={() => handleDeleteRoom(room._id)}
                                className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600 transition-all"
                              >
                                <FaTrash />
                              </button>
                            )}
                          </div>
                          <div className={`space-y-2 text-sm ${darkMode ? 'border-outline' : 'text-ink-soft-soft'}`}>
                            <p className="flex items-center gap-2"><FaBed className="text-green-600" /> Capacity: {room.capacity}</p>
                            <p className="flex items-center gap-2"><FaUsers className="text-green-600" /> Max: {room.maxGuests}</p>
                            {room.location && <p className="flex items-center gap-2"><FaMapPin className="text-green-600" /> {room.location}</p>}
                            {room.amenities && <p><span className="font-bold">Amenities:</span> {room.amenities}</p>}
                            {room.description && <p className="mt-3 leading-relaxed">{room.description}</p>}
                          </div>
                          {!isOwnProfile && (
                            <button
                              onClick={() => addRoomToCart(room, user)}
                              className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold rounded-lg transition-all active:scale-95"
                            >
                              <FaShoppingCart /> Add to Cart
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'homestays' && isHomestayOwner && (
              <div>
                <h2 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
                  Homestay Listings
                </h2>
                {homestays.length === 0 ? (
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-ink-soft-soft'}`}>
                    No homestays listed yet
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {homestays.map((stay) => (
                      <div
                        key={stay._id}
                        className={`rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-all ${darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-surface border-gray-100'
                          }`}
                      >
                        <img
                          src={stay.image}
                          alt={stay.title}
                          className="w-full h-40 object-cover"
                        />
                        <div className="p-4">
                          <p className={`font-bold ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
                            {stay.title}
                          </p>
                          <p className="text-green-600 font-bold mt-2 text-lg">
                            ₹{stay.pricePerNight}/night
                          </p>
                          {stay.location && (
                            <p className={`text-xs mt-1 flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-ink-soft-soft'
                              }`}>
                              <FaMapPin /> {stay.location}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'posts' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
                    Posts & Updates
                  </h2>
                  {isOwnProfile && (
                    <button
                      onClick={() => setShowPostModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all text-sm"
                    >
                      <FaPlus /> New Post
                    </button>
                  )}
                </div>

                {posts.length === 0 ? (
                  <div className={`text-center py-12 rounded-2xl border-2 border-dashed ${darkMode ? 'border-gray-600 bg-gray-800/50' : 'border-gray-300 bg-surface-alt'
                    }`}>
                    <FaImage className={`text-4xl mx-auto mb-3 opacity-30 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`font-bold ${darkMode ? 'text-gray-400' : 'text-ink-soft-soft'}`}>
                      No posts yet. Share your stories!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div
                        key={post._id}
                        className={`rounded-2xl border overflow-hidden shadow-sm ${darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-surface border-gray-100'
                          }`}
                      >
                        <div className={`flex items-center justify-between p-4 border-b ${darkMode ? 'border-gray-600' : 'border-gray-200'
                          }`}>
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <p className={`font-bold ${darkMode ? 'text-white' : 'text-ink-soft'}`}>
                                {user.name}
                              </p>
                              <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-ink-soft-soft'}`}>
                                {new Date(post.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            className={`p-2 rounded-lg transition-all ${darkMode
                              ? 'hover:bg-gray-600 text-gray-400'
                              : 'hover:bg-surface-alt text-ink-soft-soft'
                              } ${isOwnProfile ? '' : 'hidden'}`}
                          >
                            <FaTrash />
                          </button>
                        </div>

                        {post.type === 'video' && post.mediaUrl && (
                          <div className="relative w-full bg-black">
                            <video src={post.mediaUrl.startsWith('http') ? post.mediaUrl : `${API_BASE_URL}${post.mediaUrl}`} controls className="w-full max-h-96" />
                          </div>
                        )}

                        {post.type === 'image' && post.mediaUrl && (
                          <img src={post.mediaUrl.startsWith('http') ? post.mediaUrl : `${API_BASE_URL}${post.mediaUrl}`} alt="Post" className="w-full object-cover max-h-96" />
                        )}

                        {post.location && (
                          <p className={`px-4 pt-3 text-xs flex items-center gap-1.5 ${darkMode ? 'text-gray-400' : 'text-ink-soft-soft'}`}>
                            <FaMapPin className="text-green-600" /> {post.location}
                          </p>
                        )}

                        {post.content && (
                          <p className={`p-4 leading-relaxed ${darkMode ? 'border-outline' : 'text-ink-soft'
                            }`}>
                            {post.content}
                          </p>
                        )}

                        <div className={`flex items-center gap-4 p-4 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'
                          }`}>
                          <button
                            onClick={() => handleLikePost(post._id)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 transition-all font-bold text-sm"
                          >
                            <FaHeart /> {postLikes[post._id] || 0}
                          </button>
                          <button
                            onClick={() => handleSharePost(post)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all font-bold text-sm ${darkMode
                              ? 'hover:bg-gray-600 text-gray-400'
                              : 'hover:bg-surface-alt text-ink-soft-soft'
                              }`}
                          >
                            <FaShare /> Share
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPostModal && isOwnProfile && (
        <PostModal
          show={showPostModal}
          onClose={() => {
            setShowPostModal(false);
            setFormData({ content: '', type: 'image', mediaUrl: '', mediaFile: null, location: '' });
            setSelectedPostImage(null);
            setSelectedPostVideo(null);
          }}
          formData={formData}
          setFormData={setFormData}
          selectedPostImage={selectedPostImage}
          selectedPostVideo={selectedPostVideo}
          handlePostImageUpload={handlePostImageUpload}
          handlePostVideoUpload={handlePostVideoUpload}
          handleCreatePost={handleCreatePost}
          uploadingPost={uploadingPost}
          darkMode={darkMode}
        />
      )}

      {showFarmModal && isFarmer && isOwnProfile && (
        <FarmModal
          show={showFarmModal}
          onClose={() => {
            setShowFarmModal(false);
            setFarmData({
              farmName: '',
              areaSize: '',
              cropTypes: '',
              certifications: '',
              description: '',
              contact: '',
              harvestSeasons: '',
              location: ''
            });
          }}
          farmData={farmData}
          setFarmData={setFarmData}
          handleCreateFarm={handleCreateFarm}
          darkMode={darkMode}
        />
      )}

      {showRoomModal && isHomestayOwner && isOwnProfile && (
        <RoomModal
          show={showRoomModal}
          onClose={() => {
            setShowRoomModal(false);
            setRoomData({
              roomName: '',
              capacity: '',
              pricePerNight: '',
              amenities: '',
              description: '',
              images: [],
              maxGuests: '',
              location: ''
            });
          }}
          roomData={roomData}
          setRoomData={setRoomData}
          handleRoomImageUpload={handleRoomImageUpload}
          handleRemoveRoomImage={handleRemoveRoomImage}
          handleCreateRoom={handleCreateRoom}
          darkMode={darkMode}
        />
      )}
    </div>
  );
}

function PostModal({ show, onClose, formData, setFormData, selectedPostImage, selectedPostVideo, handlePostImageUpload, handlePostVideoUpload, handleCreatePost, uploadingPost, darkMode }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-surface'}`}>
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-surface border-gray-200'}`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-ink-soft'}`}>Create Post</h2>
          <button onClick={onClose} className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-surface-alt text-ink-soft-soft'}`}>
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'border-outline' : 'text-ink-soft'}`}>Post Type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormData({ ...formData, type: 'image' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${formData.type === 'image'
                  ? 'bg-green-600 text-white'
                  : darkMode
                    ? 'bg-gray-700 border-outline hover:bg-gray-600'
                    : 'bg-surface-alt text-ink-soft-soft hover:bg-gray-200'
                  }`}
              >
                <FaImage /> Image
              </button>
              <button
                onClick={() => setFormData({ ...formData, type: 'video' })}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${formData.type === 'video'
                  ? 'bg-green-600 text-white'
                  : darkMode
                    ? 'bg-gray-700 border-outline hover:bg-gray-600'
                    : 'bg-surface-alt text-ink-soft-soft hover:bg-gray-200'
                  }`}
              >
                <FaVideo /> Video
              </button>
            </div>
          </div>

          {formData.type === 'image' && (
            <div className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${darkMode ? 'border-gray-600 hover:border-green-500 hover:bg-gray-700/50' : 'border-gray-300 hover:border-green-500 hover:bg-green-50'}`}>
              <input type="file" accept="image/*" onChange={handlePostImageUpload} className="hidden" id="post-image-input" />
              <label htmlFor="post-image-input" className="cursor-pointer">
                {selectedPostImage ? (
                  <div>
                    <img src={formData.mediaUrl} alt="Preview" className="w-full h-48 object-cover rounded-xl mb-3" />
                    <p className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>Image selected</p>
                  </div>
                ) : (
                  <div>
                    <FaCloudUploadAlt className={`text-4xl mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`font-bold ${darkMode ? 'border-outline' : 'text-ink-soft-soft'}`}>Click to upload image</p>
                  </div>
                )}
              </label>
            </div>
          )}

          {formData.type === 'video' && (
            <div className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${darkMode ? 'border-gray-600 hover:border-green-500 hover:bg-gray-700/50' : 'border-gray-300 hover:border-green-500 hover:bg-green-50'}`}>
              <input type="file" accept="video/*" onChange={handlePostVideoUpload} className="hidden" id="post-video-input" />
              <label htmlFor="post-video-input" className="cursor-pointer">
                {selectedPostVideo ? (
                  <div>
                    <FaPlay className={`text-4xl mx-auto mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                    <p className={`font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{selectedPostVideo.name}</p>
                  </div>
                ) : (
                  <div>
                    <FaCloudUploadAlt className={`text-4xl mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                    <p className={`font-bold ${darkMode ? 'border-outline' : 'text-ink-soft-soft'}`}>Click to upload video</p>
                  </div>
                )}
              </label>
            </div>
          )}

          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'border-outline' : 'text-ink-soft'}`}>Caption (Optional)</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write something interesting..."
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 resize-none transition-all ${darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500'
                : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'
                }`}
            />
          </div>

          <div>
            <label className={`block text-sm font-bold mb-2 ${darkMode ? 'border-outline' : 'text-ink-soft'}`}>Location (Optional)</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g. Chopta Village, Rudraprayag"
              className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 transition-all ${darkMode
                ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500'
                : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'
                }`}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-2.5 rounded-lg font-bold transition-all ${darkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-ink-soft'
                }`}
            >
              Cancel
            </button>
            <button
              onClick={handleCreatePost}
              disabled={uploadingPost}
              className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-500 text-white font-bold rounded-lg transition-all active:scale-95"
            >
              {uploadingPost ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FarmModal({ show, onClose, farmData, setFarmData, handleCreateFarm, darkMode }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-surface'}`}>
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-surface border-gray-200'}`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-ink-soft'}`}>Add Farm Details</h2>
          <button onClick={onClose} className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-surface-alt text-ink-soft-soft'}`}>
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Farm Name *" value={farmData.farmName} onChange={(e) => setFarmData({ ...farmData, farmName: e.target.value })} className={`px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'}`} />
            <input type="number" placeholder="Area Size (hectares) *" value={farmData.areaSize} onChange={(e) => setFarmData({ ...farmData, areaSize: e.target.value })} className={`px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'}`} />
          </div>

          <input type="text" placeholder="Crop Types (comma separated)" value={farmData.cropTypes} onChange={(e) => setFarmData({ ...farmData, cropTypes: e.target.value })} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'}`} />

          <input type="text" placeholder="Farm Location (village, district)" value={farmData.location} onChange={(e) => setFarmData({ ...farmData, location: e.target.value })} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'}`} />

          <input type="text" placeholder="Certifications (Organic, etc.)" value={farmData.certifications} onChange={(e) => setFarmData({ ...farmData, certifications: e.target.value })} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'}`} />

          <input type="text" placeholder="Harvest Seasons" value={farmData.harvestSeasons} onChange={(e) => setFarmData({ ...farmData, harvestSeasons: e.target.value })} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'}`} />

          <input type="tel" placeholder="Contact Number" value={farmData.contact} onChange={(e) => setFarmData({ ...farmData, contact: e.target.value })} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'}`} />

          <textarea placeholder="Farm Description" value={farmData.description} onChange={(e) => setFarmData({ ...farmData, description: e.target.value })} rows={4} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 resize-none transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'}`} />

          <div className="flex gap-3">
            <button onClick={onClose} className={`flex-1 px-4 py-2.5 rounded-lg font-bold transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-ink-soft'}`}>Cancel</button>
            <button onClick={handleCreateFarm} className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all active:scale-95">Add Farm</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function RoomModal({ show, onClose, roomData, setRoomData, handleRoomImageUpload, handleRemoveRoomImage, handleCreateRoom, darkMode }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto ${darkMode ? 'bg-gray-800' : 'bg-surface'}`}>
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-surface border-gray-200'}`}>
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-ink-soft'}`}>Add Room</h2>
          <button onClick={onClose} className={`p-2 rounded-lg transition-all ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-surface-alt text-ink-soft-soft'}`}>
            <FaTimes className="text-xl" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <input type="text" placeholder="Room Name *" value={roomData.roomName} onChange={(e) => setRoomData({ ...roomData, roomName: e.target.value })} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'}`} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="number" placeholder="Capacity *" value={roomData.capacity} onChange={(e) => setRoomData({ ...roomData, capacity: e.target.value })} className={`px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'}`} />
            <input type="number" placeholder="Max Guests" value={roomData.maxGuests} onChange={(e) => setRoomData({ ...roomData, maxGuests: e.target.value })} className={`px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'}`} />
            <input type="number" placeholder="Price/Night *" value={roomData.pricePerNight} onChange={(e) => setRoomData({ ...roomData, pricePerNight: e.target.value })} className={`px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'}`} />
          </div>

          <input type="text" placeholder="Amenities (WiFi, AC, TV, etc.)" value={roomData.amenities} onChange={(e) => setRoomData({ ...roomData, amenities: e.target.value })} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'}`} />

          <input type="text" placeholder="Room / Homestay Location (village, district)" value={roomData.location} onChange={(e) => setRoomData({ ...roomData, location: e.target.value })} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'}`} />

          <textarea placeholder="Room Description" value={roomData.description} onChange={(e) => setRoomData({ ...roomData, description: e.target.value })} rows={3} className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:border-green-500 resize-none transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-500' : 'bg-surface-alt border-gray-200 text-ink-soft placeholder:text-gray-400'}`} />

          <div className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${darkMode ? 'border-gray-600 hover:border-green-500 hover:bg-gray-700/50' : 'border-gray-300 hover:border-green-500 hover:bg-green-50'}`}>
            <input type="file" accept="image/*" multiple onChange={handleRoomImageUpload} className="hidden" id="room-images-input" />
            <label htmlFor="room-images-input" className="cursor-pointer">
              <FaCloudUploadAlt className={`text-4xl mx-auto mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
              <p className={`font-bold ${darkMode ? 'border-outline' : 'text-ink-soft-soft'}`}>Upload room images</p>
            </label>
          </div>

          {roomData.images.length > 0 && (
            <div className="space-y-2">
              <p className={`text-sm font-bold ${darkMode ? 'border-outline' : 'text-ink-soft'}`}>
                Selected Images ({roomData.images.length})
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {roomData.images.map((img, idx) => (
                  <div key={idx} className="relative group">
                    <img src={typeof img === 'string' ? img : URL.createObjectURL(img)} alt={`Room ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                    <button onClick={() => handleRemoveRoomImage(idx)} className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-all">
                      <FaTimes className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={onClose} className={`flex-1 px-4 py-2.5 rounded-lg font-bold transition-all ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-ink-soft'}`}>Cancel</button>
            <button onClick={handleCreateRoom} className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-all active:scale-95">Add Room</button>
          </div>
        </div>
      </div>
    </div>
  );
}