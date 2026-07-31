import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { API_BASE_URL } from '../utils/api';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import {
  FaLeaf, FaBox, FaRupeeSign, FaTruck,
  FaPlus, FaChartLine, FaSeedling,
  FaCloudSun, FaTimes, FaMapMarkerAlt,
  FaImage, FaTrash, FaCheckCircle, FaClock, FaArrowUp, FaArrowDown,
  FaCalendarAlt, FaWarehouse, FaInfoCircle, FaCrosshairs, FaSearchLocation,
  FaChartBar, FaStar, FaEdit
} from 'react-icons/fa';

import LocationPicker from '../components/LocationPicker';
import WeatherAdvisory from '../components/WeatherAdvisory';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Title, Tooltip, Legend, Filler
);

const CATEGORIES = ['Vegetables', 'Fruits', 'Grains & Pulses', 'Organic Foods'];
const UNITS = ['kg', 'quintal', 'dozen', 'piece', 'litre'];

const EMPTY_PRODUCT = {
  productName: '',
  category: 'Vegetables',
  description: '',
  pricing: { basePrice: '', unit: 'kg' },
  availability: { quantity: '' },
  location: { address: '', coordinates: null, zipCode: '' },
  images: [], // File objects, 1-6
  imagePreviews: [] // matching object URLs
};

const FarmerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // product being edited, or null
  const [editForm, setEditForm] = useState({ productName: '', basePrice: '', quantity: '', description: '' });
  const [savingEdit, setSavingEdit] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetchedProducts, setFetchedProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [marketData, setMarketData] = useState({ totalRevenue: 0, totalOrders: 0 });
  const [schedule, setSchedule] = useState([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('All');
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [newProduct, setNewProduct] = useState(EMPTY_PRODUCT);

  const [showMapModal, setShowMapModal] = useState(false);
  const [locating, setLocating] = useState(false);
  const [tempLocation, setTempLocation] = useState({ address: '', coordinates: null, zipCode: '' });
  const [manualZip, setManualZip] = useState('');
  const [resolvingZip, setResolvingZip] = useState(false);

  const fetchDashboardData = async () => {
    setDashboardLoading(true);
    try {
      const [productsRes, ordersRes, scheduleRes] = await Promise.allSettled([
        api.get('/products/my-products'),
        api.get('/orders/received'),
        api.get('/collection-schedule')
      ]);

      if (productsRes.status === 'fulfilled') {
        const data = productsRes.value.data;
        const list = Array.isArray(data) ? data : (data.products || data.data || []);
        setFetchedProducts(list);
      }
      if (ordersRes.status === 'fulfilled') {
        const data = ordersRes.value.data;
        const list = Array.isArray(data) ? data : (data.orders || data.data || []);
        setOrders(list);
        setMarketData({ totalRevenue: data.totalRevenue || 0, totalOrders: data.totalOrders || list.length });
      }
      if (scheduleRes.status === 'fulfilled') {
        const data = scheduleRes.value.data;
        const list = Array.isArray(data) ? data : (data.schedule || data.data || []);
        setSchedule(list);
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const activeProducts = fetchedProducts.filter(p => (p.quantity ?? p.availability?.quantity) > 0).length;
    const thisMonth = new Date().getMonth();
    const monthlyRevenue = orders
      .filter(o => new Date(o.createdAt).getMonth() === thisMonth && o.status === 'completed')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
    const harvestReady = fetchedProducts.filter(p => p.harvestStatus === 'Ready' || !p.harvestStatus).length;

    return [
      {
        icon: FaBox, label: 'Products Listed', value: `${activeProducts || fetchedProducts.length} Active`,
        color: 'bg-green-500', trend: '+2 this week', trendUp: true
      },
      {
        icon: FaRupeeSign, label: 'Revenue (Month)', value: `₹${monthlyRevenue.toLocaleString('en-IN')}`,
        color: 'bg-blue-500', trend: monthlyRevenue > 0 ? 'Growing' : 'No sales', trendUp: monthlyRevenue > 0
      },
      {
        icon: FaTruck, label: 'Orders Pending', value: `${pendingOrders} Orders`,
        color: 'bg-yellow-500', trend: pendingOrders > 5 ? 'High volume' : 'Manageable', trendUp: pendingOrders <= 5
      },
      {
        icon: FaLeaf, label: 'Harvest Ready', value: `${harvestReady} Crops`,
        color: 'bg-purple-500', trend: 'On schedule', trendUp: true
      }
    ];
  }, [fetchedProducts, orders]);

  const revenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTotals = new Array(12).fill(0);
    orders.forEach(o => {
      if (o.status === 'completed' && o.createdAt) {
        const m = new Date(o.createdAt).getMonth();
        monthlyTotals[m] += (o.totalAmount || 0);
      }
    });
    const currentMonth = new Date().getMonth();
    const last6 = [];
    const labels = [];
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonth - i + 12) % 12;
      labels.push(months[idx]);
      last6.push(monthlyTotals[idx]);
    }
    return {
      labels,
      datasets: [{
        label: 'Revenue (₹)',
        data: last6,
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }]
    };
  }, [orders]);

  const yieldData = useMemo(() => {
    if (fetchedProducts.length === 0) {
      return {
        labels: ['No data'],
        datasets: [{ data: [1], backgroundColor: ['rgba(209, 213, 219, 0.5)'] }]
      };
    }
    const palette = [
      'rgba(34, 197, 94, 0.75)', 'rgba(59, 130, 246, 0.75)', 'rgba(249, 115, 22, 0.75)',
      'rgba(168, 85, 247, 0.75)', 'rgba(236, 72, 153, 0.75)', 'rgba(20, 184, 166, 0.75)'
    ];
    return {
      labels: fetchedProducts.slice(0, 6).map(p => p.productName),
      datasets: [{
        label: 'Quantity',
        data: fetchedProducts.slice(0, 6).map(p => Number(p.quantity ?? p.availability?.quantity ?? 0)),
        backgroundColor: palette
      }]
    };
  }, [fetchedProducts]);

  const harvestStatus = useMemo(() => {
    if (fetchedProducts.length === 0) return [];
    return fetchedProducts.map(p => ({
      crop: p.productName,
      status: p.harvestStatus || 'Ready',
      expected: p.expectedHarvestDate
        ? new Date(p.expectedHarvestDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        : 'Available now'
    }));
  }, [fetchedProducts]);

  const MAX_PRODUCT_IMAGES = 6;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setNewProduct((prev) => {
      const combined = [...prev.images, ...files].slice(0, MAX_PRODUCT_IMAGES);
      if (prev.images.length + files.length > MAX_PRODUCT_IMAGES) {
        alert(`You can upload up to ${MAX_PRODUCT_IMAGES} photos — only the first ${MAX_PRODUCT_IMAGES} were kept.`);
      }
      return {
        ...prev,
        images: combined,
        imagePreviews: combined.map((f) => URL.createObjectURL(f))
      };
    });
    e.target.value = ''; // allow re-selecting the same file later
  };

  const handleRemoveProductImage = (index) => {
    setNewProduct((prev) => {
      const nextImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: nextImages,
        imagePreviews: nextImages.map((f) => URL.createObjectURL(f))
      };
    });
  };

  const handleRequestGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const fallbackAddress = `Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;

        try {
          const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
          if (!apiKey) {
            setTempLocation({
              address: fallbackAddress,
              zipCode: '',
              coordinates: { lat: latitude, lng: longitude }
            });
            setLocating(false);
            setShowMapModal(true);
            return;
          }

          const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`);
          const data = await response.json();
          if (data.results && data.results[0]) {
            let zip = '';
            const components = data.results[0].address_components;
            for (let component of components) {
              if (component.types.includes('postal_code')) {
                zip = component.long_name;
                break;
              }
            }
            setTempLocation({
              address: data.results[0].formatted_address,
              zipCode: zip,
              coordinates: { lat: latitude, lng: longitude }
            });
            setManualZip(zip);
          } else {
            setTempLocation({
              address: fallbackAddress,
              zipCode: '',
              coordinates: { lat: latitude, lng: longitude }
            });
          }
        } catch (err) {
          setTempLocation({
            address: fallbackAddress,
            zipCode: '',
            coordinates: { lat: latitude, lng: longitude }
          });
        } finally {
          setLocating(false);
          setShowMapModal(true);
        }
      },
      () => {
        setLocating(false);
        setTempLocation({ address: '', zipCode: '', coordinates: { lat: 30.3165, lng: 78.0322 } });
        setShowMapModal(true);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleResolveZipCode = async () => {
    if (!manualZip || manualZip.trim().length < 6) {
      alert('Enter valid 6-digit ZIP code');
      return;
    }
    setResolvingZip(true);
    try {
      const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '';
      if (!apiKey) {
        alert('Google Maps API key not configured');
        setResolvingZip(false);
        return;
      }

      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${manualZip}&components=country:IN&key=${apiKey}`);
      const data = await response.json();
      if (data.results && data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        setTempLocation({
          address: data.results[0].formatted_address,
          zipCode: manualZip,
          coordinates: { lat, lng }
        });
      } else {
        alert('Location not found for this ZIP');
      }
    } catch (err) {
      alert('Error fetching ZIP location');
    } finally {
      setResolvingZip(false);
    }
  };

  const handleConfirmLocation = () => {
    setNewProduct({ ...newProduct, location: tempLocation });
    setShowMapModal(false);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!newProduct.productName.trim()) {
      alert('Enter product name!');
      return;
    }

    if (!newProduct.location.coordinates) {
      alert('Set farm location!');
      return;
    }

    if (!newProduct.images || newProduct.images.length === 0) {
      alert('Upload at least 1 product photo!');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('productName', newProduct.productName.trim());
      formData.append('category', newProduct.category);
      formData.append('description', newProduct.description);
      formData.append('basePrice', newProduct.pricing.basePrice);
      formData.append('unit', newProduct.pricing.unit);
      formData.append('quantity', newProduct.availability.quantity);
      formData.append('locationAddress', newProduct.location.address);
      formData.append('locationLat', newProduct.location.coordinates.lat);
      formData.append('locationLng', newProduct.location.coordinates.lng);
      formData.append('locationZipCode', newProduct.location.zipCode || '');
      newProduct.images.forEach((file) => formData.append('images', file));

      await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      alert('Product added successfully!');
      setNewProduct(EMPTY_PRODUCT);
      setShowAddProduct(false);
      fetchDashboardData();
    } catch (error) {
      console.error('Upload Error:', error.response?.data || error);
      alert('Upload Failed: ' + (error.response?.data?.message || 'Check console'));
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      alert('Product deleted!');
      fetchDashboardData();
    } catch (error) {
      alert('Delete failed: ' + (error.response?.data?.message || 'Error'));
    }
  };

  const openEditProduct = (prod) => {
    setEditingProduct(prod);
    setEditForm({
      productName: prod.productName || '',
      basePrice: prod.pricing?.basePrice ?? prod.basePrice ?? '',
      quantity: prod.availability?.quantity ?? prod.quantity ?? '',
      description: prod.description || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editForm.productName.trim() || !editForm.basePrice) {
      alert('Product name and price are required');
      return;
    }
    setSavingEdit(true);
    try {
      await api.put(`/products/${editingProduct._id}`, {
        productName: editForm.productName.trim(),
        basePrice: Number(editForm.basePrice),
        unit: editingProduct.pricing?.unit || editingProduct.unit || 'kg',
        quantity: Number(editForm.quantity) || 0,
        description: editForm.description,
      });
      setEditingProduct(null);
      fetchDashboardData();
    } catch (error) {
      alert('Update failed: ' + (error.response?.data?.message || 'Error'));
    } finally {
      setSavingEdit(false);
    }
  };

  const handleViewLocation = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaChartLine },
    { id: 'products', label: 'My Products', icon: FaBox },
    { id: 'market', label: 'Market Analysis', icon: FaChartBar },
    { id: 'schedule', label: 'Schedule', icon: FaTruck },
    { id: 'harvest', label: 'Harvest', icon: FaSeedling },
    { id: 'weather', label: 'Weather', icon: FaCloudSun }
  ];

  const filteredProducts = fetchedProducts.filter(p => {
    if (selectedCategoryFilter === 'All') return true;
    return p.category === selectedCategoryFilter;
  });

  const farmCoordinates = fetchedProducts.find(p => p.locationLat)
    ? { lat: Number(fetchedProducts[0].locationLat), lng: Number(fetchedProducts[0].locationLng) }
    : null;

  return (
    <div className="min-h-screen bg-surface-alt dark:bg-app-bg py-8">
      <div className="max-w-7xl mx-auto px-4">

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-ink-soft dark:text-ink-soft">Welcome, {user?.name || 'Farmer'}! 👋</h1>
            <p className="text-gray-500 dark:text-ink-soft-soft mt-1">Farmer Dashboard</p>
          </div>
          <div className="flex space-x-3 mt-4 md:mt-0">
            <button
              onClick={() => navigate(`/profile/${user?._id || user?.id}`)}
              className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl hover:bg-emerald-100 transition font-medium border border-emerald-200"
            >
              <FaSeedling /> <span>My Farm Profile</span>
            </button>
            <button
              onClick={() => navigate('/ai-assistant')}
              className="flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl hover:bg-green-200 transition font-medium"
            >
              <FaSeedling /> <span>AI Advisory</span>
            </button>
            <button
              onClick={() => {
                setNewProduct(EMPTY_PRODUCT);
                setTempLocation({ address: '', coordinates: null, zipCode: '' });
                setManualZip('');
                setShowAddProduct(true);
              }}
              className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition font-medium shadow-sm dark:shadow-none"
            >
              <FaPlus /> <span>Add Product</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="bg-surface dark:bg-surface rounded-xl shadow-sm dark:shadow-none p-6 hover:shadow-md transition">
              <div className="flex items-center">
                <div className={`${stat.color} p-4 rounded-xl text-white mr-4`}>
                  <stat.icon className="text-2xl" />
                </div>
                <div className="flex-1">
                  <p className="text-gray-500 dark:text-ink-soft-soft text-sm">{stat.label}</p>
                  <p className="text-xl font-bold text-ink-soft dark:text-ink-soft">{stat.value}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-amber-600'}`}>
                {stat.trendUp ? <FaArrowUp /> : <FaArrowDown />}
                <span>{stat.trend}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex space-x-1 bg-surface dark:bg-surface rounded-xl p-1 shadow-sm dark:shadow-none mb-8 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition whitespace-nowrap ${activeTab === tab.id ? 'bg-green-600 text-white' : 'text-ink-soft-soft dark:text-ink-soft-soft hover:bg-surface-alt'
                }`}
            >
              <tab.icon /> <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-surface dark:bg-surface rounded-xl shadow-sm dark:shadow-none p-6">
                <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-4">📈 Revenue Trend</h3>
                <Line data={revenueData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
              </div>
              <div className="bg-surface dark:bg-surface rounded-xl shadow-sm dark:shadow-none p-6">
                <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-4">🌾 Crop Distribution</h3>
                <Doughnut data={yieldData} options={{ responsive: true }} />
              </div>
            </div>

            <div className="bg-surface dark:bg-surface rounded-xl shadow-sm dark:shadow-none p-6">
              <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-4 flex items-center gap-2">
                <FaInfoCircle className="text-green-500" /> Quick Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                  <p className="text-xs text-green-600 font-semibold uppercase">Total Products</p>
                  <p className="text-2xl font-bold text-ink-soft dark:text-ink-soft mt-1">{fetchedProducts.length}</p>
                  <p className="text-xs text-gray-500 dark:text-ink-soft-soft mt-1">{new Set(fetchedProducts.map(p => p.category)).size} categories</p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-xs text-blue-600 font-semibold uppercase">Total Orders</p>
                  <p className="text-2xl font-bold text-ink-soft dark:text-ink-soft mt-1">{orders.length}</p>
                  <p className="text-xs text-gray-500 dark:text-ink-soft-soft mt-1">{orders.filter(o => o.status === 'completed').length} completed</p>
                </div>
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                  <p className="text-xs text-purple-600 font-semibold uppercase">Pickups</p>
                  <p className="text-2xl font-bold text-ink-soft dark:text-ink-soft mt-1">{schedule.filter(s => s.status === 'scheduled').length}</p>
                  <p className="text-xs text-gray-500 dark:text-ink-soft-soft mt-1">upcoming</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-surface dark:bg-surface rounded-xl shadow-sm dark:shadow-none p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft">📦 My Products</h3>
              <div className="flex flex-wrap gap-2">
                {['All', ...CATEGORIES].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${selectedCategoryFilter === cat ? 'bg-green-600 text-white' : 'bg-surface-alt dark:bg-surface-alt text-ink-soft-soft dark:text-ink-soft-soft hover:bg-gray-200'
                      }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {dashboardLoading ? (
              <p className="text-gray-400 dark:text-ink-soft-soft text-center py-8">Loading...</p>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <FaWarehouse className="text-4xl border-outline mx-auto mb-3" />
                <p className="text-gray-400 dark:text-ink-soft-soft">No products. Click "Add Product"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((prod) => {
                  const imageUrl = prod.imageURL ? `${API_BASE_URL}${prod.imageURL}` : null;
                  const displayAddress = prod.locationAddress || 'Location';

                  return (
                    <div key={prod._id} className="border border-gray-100 dark:border-outline rounded-2xl p-4 bg-surface dark:bg-surface hover:shadow-lg transition relative group">
                      <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition z-10">
                        <button
                          onClick={() => openEditProduct(prod)}
                          className="bg-surface dark:bg-surface/90 text-gray-400 dark:text-ink-soft-soft hover:text-blue-500 rounded-lg p-1.5 shadow"
                          title="Edit product"
                        >
                          <FaEdit className="text-xs" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod._id)}
                          className="bg-surface dark:bg-surface/90 text-gray-400 dark:text-ink-soft-soft hover:text-red-500 rounded-lg p-1.5 shadow"
                          title="Delete product"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>

                      <div className="w-full h-40 bg-surface-alt dark:bg-surface-alt rounded-xl mb-3 overflow-hidden flex items-center justify-center">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={prod.productName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect fill="%23ddd" width="100" height="100"/><text x="50%" y="50%" font-size="14" text-anchor="middle" dy=".3em" fill="%23999">No Image</text></svg>';
                            }}
                          />
                        ) : (
                          <FaBox className="text-4xl border-outline" />
                        )}
                      </div>

                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold uppercase">
                        {prod.category}
                      </span>

                      <h4 className="font-bold text-ink-soft dark:text-ink-soft text-lg mt-2">{prod.productName}</h4>

                      {prod.description && (
                        <p className="text-xs text-gray-500 dark:text-ink-soft-soft line-clamp-2 mt-1">{prod.description}</p>
                      )}

                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-outline space-y-2">
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-black text-green-600">
                            ₹{prod.basePrice}/{prod.unit}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-ink-soft-soft">
                            Stock: {prod.quantity} {prod.unit}
                          </p>
                        </div>

                        <button
                          onClick={() => handleViewLocation(prod.locationLat, prod.locationLng)}
                          className="w-full text-xs text-left text-blue-600 hover:text-blue-800 flex items-center gap-1.5 font-medium transition group/loc"
                          title="View on Google Maps"
                        >
                          <FaMapMarkerAlt className="text-green-500 group-hover/loc:scale-110 transition" />
                          <span className="truncate underline">{displayAddress}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="bg-surface dark:bg-surface rounded-xl shadow-sm dark:shadow-none p-6">
            <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-2">📅 Collection Schedule</h3>
            <p className="text-sm text-gray-500 dark:text-ink-soft-soft mb-6">Track pickup schedules</p>

            {schedule.length === 0 ? (
              <div className="text-center py-12">
                <FaCalendarAlt className="text-4xl border-outline mx-auto mb-3" />
                <p className="text-gray-400 dark:text-ink-soft-soft">No schedules</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-green-50">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Crop</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Quantity</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-green-800">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {schedule.map((item, i) => (
                      <tr key={i} className="hover:bg-surface-alt">
                        <td className="px-4 py-3">{item.date}</td>
                        <td className="px-4 py-3 font-medium">{item.crop}</td>
                        <td className="px-4 py-3">{item.qty}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === 'collected' ? 'bg-green-100 text-green-700' :
                            item.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'harvest' && (
          <div className="bg-surface dark:bg-surface rounded-xl shadow-sm dark:shadow-none p-6">
            <h3 className="text-lg font-bold text-ink-soft dark:text-ink-soft mb-2">🌱 Harvest Status</h3>
            <p className="text-sm text-gray-500 dark:text-ink-soft-soft mb-6">Growth tracking</p>

            {harvestStatus.length === 0 ? (
              <div className="text-center py-12">
                <FaSeedling className="text-4xl border-outline mx-auto mb-3" />
                <p className="text-gray-400 dark:text-ink-soft-soft">No crops tracked</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {harvestStatus.map((item, i) => (
                  <div key={i} className={`p-4 rounded-xl border-2 ${item.status === 'Ready' ? 'border-green-500 bg-green-50' :
                    item.status === 'Partially Ready' ? 'border-yellow-500 bg-yellow-50' :
                      'border-gray-300 dark:border-outline bg-surface-alt dark:bg-app-bg'
                    }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-ink-soft dark:text-ink-soft">{item.crop}</h4>
                        <p className="text-sm text-gray-500 dark:text-ink-soft-soft flex items-center gap-1 mt-0.5">
                          <FaClock className="text-xs" /> {item.expected}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${item.status === 'Ready' ? 'bg-green-500 text-white' :
                        item.status === 'Partially Ready' ? 'bg-yellow-500 text-white' :
                          'bg-gray-400 text-white'
                        }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'market' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-surface dark:bg-surface rounded-xl shadow p-5 border border-gray-100 dark:border-outline">
                <p className="text-xs text-ink-soft-soft dark:text-ink-soft-soft font-semibold uppercase">Total Revenue</p>
                <p className="text-2xl font-black text-green-600 mt-1">₹{marketData.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-surface dark:bg-surface rounded-xl shadow p-5 border border-gray-100 dark:border-outline">
                <p className="text-xs text-ink-soft-soft dark:text-ink-soft-soft font-semibold uppercase">Total Orders</p>
                <p className="text-2xl font-black text-ink-soft dark:text-ink-soft mt-1">{marketData.totalOrders}</p>
              </div>
              <div className="bg-surface dark:bg-surface rounded-xl shadow p-5 border border-gray-100 dark:border-outline">
                <p className="text-xs text-ink-soft-soft dark:text-ink-soft-soft font-semibold uppercase">Products Listed</p>
                <p className="text-2xl font-black text-ink-soft dark:text-ink-soft mt-1">{fetchedProducts.length}</p>
              </div>
            </div>

            <div className="bg-surface dark:bg-surface rounded-xl shadow p-5 border border-gray-100 dark:border-outline">
              <h3 className="font-bold text-ink-soft dark:text-ink-soft mb-4 flex items-center gap-2">
                <FaChartBar className="text-green-600" /> Recent Orders
              </h3>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-ink-soft-soft italic">No orders received yet. Once buyers order your products, they'll show up here.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-ink-soft-soft dark:text-ink-soft-soft uppercase border-b border-gray-100 dark:border-outline">
                        <th className="pb-2 pr-4">Order ID</th>
                        <th className="pb-2 pr-4">Buyer</th>
                        <th className="pb-2 pr-4">Items</th>
                        <th className="pb-2 pr-4">Amount</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 8).map((o) => (
                        <tr key={o._id} className="border-b border-gray-50 dark:border-outline last:border-0">
                          <td className="py-2.5 pr-4 font-mono text-xs text-green-600">{o._id.slice(-8).toUpperCase()}</td>
                          <td className="py-2.5 pr-4">{o.buyer?.name || o.buyerName || 'Customer'}</td>
                          <td className="py-2.5 pr-4">{(o.items || []).map((it) => it.productName).join(', ')}</td>
                          <td className="py-2.5 pr-4 font-bold">₹{o.totalAmount}</td>
                          <td className="py-2.5">
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                              o.status === 'delivered' ? 'bg-green-50 text-green-700' :
                              o.status === 'cancelled' ? 'bg-red-50 text-red-700' :
                              o.status === 'confirmed' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {o.status || 'pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-surface dark:bg-surface rounded-xl shadow p-5 border border-gray-100 dark:border-outline">
              <h3 className="font-bold text-ink-soft dark:text-ink-soft mb-4 flex items-center gap-2">
                <FaStar className="text-amber-400" /> Your Products — Price & Rating
              </h3>
              {fetchedProducts.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-ink-soft-soft italic">Add your first product to see it here.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {fetchedProducts.map((p) => (
                    <div key={p._id} className="border border-gray-100 dark:border-outline rounded-lg p-3">
                      <p className="font-semibold text-sm text-ink-soft dark:text-ink-soft truncate">{p.productName}</p>
                      <p className="text-green-600 font-bold">₹{p.pricing?.basePrice || p.basePrice}/{p.pricing?.unit || p.unit || 'kg'}</p>
                      {p.ratings?.count > 0 ? (
                        <p className="text-xs text-amber-500 mt-1">★ {p.ratings.average.toFixed(1)} ({p.ratings.count} review{p.ratings.count === 1 ? '' : 's'})</p>
                      ) : (
                        <p className="text-xs text-gray-400 dark:text-ink-soft-soft mt-1 italic">No reviews yet</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'weather' && (
          <WeatherAdvisory
            lat={farmCoordinates?.lat}
            lng={farmCoordinates?.lng}
            locationName={fetchedProducts[0]?.locationAddress || 'Your Farm'}
          />
        )}
      </div>

      {showAddProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-surface dark:bg-surface rounded-2xl p-8 max-w-lg w-full my-8 relative">
            <button onClick={() => setShowAddProduct(false)} className="absolute top-4 right-4 text-gray-400 dark:text-ink-soft-soft hover:text-red-500 text-xl">
              <FaTimes />
            </button>
            <h2 className="text-2xl font-bold mb-1">Add New Product</h2>
            <p className="text-sm text-gray-400 dark:text-ink-soft-soft mb-6">List your fresh produce</p>

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-ink-soft-soft uppercase mb-1.5">Product Name *</label>
                <input
                  type="text"
                  value={newProduct.productName}
                  onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
                  className="w-full p-3 border border-gray-200 dark:border-outline rounded-xl focus:outline-none focus:border-green-500 transition"
                  placeholder="e.g. Organic Tomatoes"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-ink-soft-soft uppercase mb-1.5">Category *</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full p-3 border border-gray-200 dark:border-outline rounded-xl bg-surface dark:bg-surface focus:outline-none focus:border-green-500"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-ink-soft-soft uppercase mb-1.5">Unit *</label>
                  <select
                    value={newProduct.pricing.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, pricing: { ...newProduct.pricing, unit: e.target.value } })}
                    className="w-full p-3 border border-gray-200 dark:border-outline rounded-xl bg-surface dark:bg-surface focus:outline-none focus:border-green-500"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-ink-soft-soft uppercase mb-1.5">Price (₹) *</label>
                  <input
                    type="number"
                    value={newProduct.pricing.basePrice}
                    onChange={(e) => setNewProduct({ ...newProduct, pricing: { ...newProduct.pricing, basePrice: e.target.value } })}
                    placeholder="0"
                    className="w-full p-3 border border-gray-200 dark:border-outline rounded-xl focus:outline-none focus:border-green-500"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-ink-soft-soft uppercase mb-1.5">Quantity *</label>
                  <input
                    type="number"
                    value={newProduct.availability.quantity}
                    onChange={(e) => setNewProduct({ ...newProduct, availability: { ...newProduct.availability, quantity: e.target.value } })}
                    placeholder="0"
                    className="w-full p-3 border border-gray-200 dark:border-outline rounded-xl focus:outline-none focus:border-green-500"
                    required
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-ink-soft-soft uppercase mb-1.5">Farm Location *</label>
                <div
                  onClick={handleRequestGPSLocation}
                  className="w-full p-3.5 border-2 border-dashed border-gray-300 dark:border-outline rounded-xl bg-surface-alt dark:bg-app-bg hover:bg-surface-alt cursor-pointer flex items-center justify-between transition group"
                >
                  <div className="flex items-center space-x-2 text-ink-soft-soft dark:text-ink-soft-soft">
                    <FaMapMarkerAlt className="text-green-600 group-hover:scale-110 transition" />
                    <span className="text-sm font-medium truncate max-w-[250px]">
                      {newProduct.location.address || (locating ? 'Getting GPS...' : 'Click to set location')}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="bg-surface dark:bg-surface px-3 py-1.5 rounded-lg shadow-sm dark:shadow-none text-xs border text-green-700 flex items-center gap-1 font-bold"
                  >
                    <FaCrosshairs className={locating ? 'animate-spin' : ''} /> Set
                  </button>
                </div>
                {newProduct.location.zipCode && (
                  <p className="text-xs text-green-600 font-medium mt-1">PIN: {newProduct.location.zipCode}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-ink-soft-soft uppercase mb-1.5">
                  Product Photos * <span className="normal-case font-normal">(1 required, up to {MAX_PRODUCT_IMAGES})</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {newProduct.imagePreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-outline group">
                      <img src={src} alt={`Product ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveProductImage(i)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                  {newProduct.images.length < MAX_PRODUCT_IMAGES && (
                    <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-outline flex flex-col items-center justify-center gap-1 cursor-pointer text-gray-400 dark:text-ink-soft-soft hover:border-green-500 hover:text-green-600 transition bg-surface-alt dark:bg-app-bg">
                      <FaImage size={20} />
                      <span className="text-xs font-semibold">Add Photo</span>
                      <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-ink-soft-soft uppercase mb-1.5">Description</label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Product details, quality, certifications..."
                  className="w-full p-3 border border-gray-200 dark:border-outline rounded-xl focus:outline-none focus:border-green-500"
                  rows="3"
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-green-600 text-white py-3 rounded-xl font-bold hover:bg-green-700 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg"
              >
                {uploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FaCheckCircle /> Add Product
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-surface rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-outline flex justify-between items-center bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-800">
              <h3 className="font-bold text-ink-soft dark:text-ink-soft flex items-center gap-2"><FaEdit /> Edit Product</h3>
              <button onClick={() => setEditingProduct(null)} className="text-gray-400 hover:text-red-500">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-ink-soft-soft uppercase mb-1.5">Product Name *</label>
                <input
                  type="text"
                  value={editForm.productName}
                  onChange={(e) => setEditForm({ ...editForm, productName: e.target.value })}
                  className="w-full p-3 border border-gray-200 dark:border-outline rounded-xl focus:outline-none focus:border-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-ink-soft-soft uppercase mb-1.5">Price (₹) *</label>
                  <input
                    type="number"
                    value={editForm.basePrice}
                    onChange={(e) => setEditForm({ ...editForm, basePrice: e.target.value })}
                    className="w-full p-3 border border-gray-200 dark:border-outline rounded-xl focus:outline-none focus:border-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft"
                    required
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-ink-soft-soft uppercase mb-1.5">Stock Quantity</label>
                  <input
                    type="number"
                    value={editForm.quantity}
                    onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                    className="w-full p-3 border border-gray-200 dark:border-outline rounded-xl focus:outline-none focus:border-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-ink-soft-soft uppercase mb-1.5">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  rows="3"
                  className="w-full p-3 border border-gray-200 dark:border-outline rounded-xl focus:outline-none focus:border-green-500 bg-surface dark:bg-surface text-ink-soft dark:text-ink-soft"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 border-2 border-gray-300 dark:border-outline text-ink-soft-soft dark:text-ink-soft-soft py-2.5 rounded-xl font-semibold hover:bg-surface-alt transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 bg-green-600 text-white py-2.5 rounded-xl font-semibold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMapModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
          <div className="bg-surface dark:bg-surface rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-green-50 to-blue-50">
              <div>
                <h3 className="font-bold text-ink-soft dark:text-ink-soft text-lg flex items-center gap-2">
                  <FaMapMarkerAlt className="text-green-600" /> Set Farm Location
                </h3>
                <p className="text-xs text-gray-500 dark:text-ink-soft-soft mt-0.5">Use GPS or enter PIN code</p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-400 dark:text-ink-soft-soft hover:text-red-500 p-2"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength="6"
                  placeholder="Enter 6-digit PIN"
                  value={manualZip}
                  onChange={(e) => setManualZip(e.target.value.replace(/\D/g, ''))}
                  className="flex-1 p-3 border border-gray-300 dark:border-outline rounded-xl focus:outline-none focus:border-green-500 text-sm"
                />
                <button
                  type="button"
                  onClick={handleResolveZipCode}
                  disabled={resolvingZip}
                  className="bg-green-600 text-white px-4 rounded-xl font-bold text-xs hover:bg-green-700 transition disabled:opacity-60 flex items-center gap-1.5"
                >
                  <FaSearchLocation /> {resolvingZip ? 'Finding...' : 'Find'}
                </button>
              </div>

              <div className="text-center">
                <span className="text-xs text-gray-400 dark:text-ink-soft-soft font-semibold">— OR —</span>
              </div>

              <button
                type="button"
                onClick={handleRequestGPSLocation}
                disabled={locating}
                className="w-full py-3 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-md"
              >
                <FaCrosshairs className={locating ? 'animate-spin' : ''} />
                {locating ? 'Getting GPS...' : 'Use My Current Location'}
              </button>

              <div className="w-full h-64 rounded-xl border-2 border-gray-200 dark:border-outline overflow-hidden shadow-inner">
                <LocationPicker
                  value={tempLocation}
                  onChange={(loc) => {
                    setTempLocation(loc);
                    if (loc.zipCode) setManualZip(loc.zipCode);
                  }}
                />
              </div>

              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex gap-3">
                  <FaMapMarkerAlt className="text-green-600 text-xl mt-1 shrink-0" />
                  <div className="text-sm text-ink-soft-soft dark:text-ink-soft-soft">
                    <span className="font-bold block text-green-800 mb-1">Selected Location:</span>
                    {tempLocation.address || "No location selected. Use GPS or drag map marker."}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-surface-alt dark:bg-app-bg border-t flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowMapModal(false)}
                className="px-5 py-2 text-sm font-medium text-ink-soft-soft dark:text-ink-soft-soft hover:bg-surface-alt rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLocation}
                disabled={!tempLocation.coordinates}
                className="px-6 py-2 text-sm font-bold bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaCheckCircle /> Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;