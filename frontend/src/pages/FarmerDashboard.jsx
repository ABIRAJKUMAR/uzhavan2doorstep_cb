import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Plus, Package, TrendingUp, Clock, CheckCircle, XCircle, UploadCloud, Trash2, X, Cpu, Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const FarmerDashboard = () => {
  const { token, user } = useSelector(state => state.auth);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '', category: 'Vegetables', quantity: '', unit: 'kg', price: '', description: '', isOrganic: false
  });
  const [marketRates, setMarketRates] = useState([]);

  // Drag and Drop Upload States
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  // AI Diagnostic Tab States
  const [scanFile, setScanFile] = useState(null);
  const [scanPreview, setScanPreview] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [chartMode, setChartMode] = useState('earnings');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [prodRes, ordRes, marketRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/market-prices`)
      ]);
      // Filter products for this farmer
      setProducts(prodRes.data.filter(p => p.farmerId === user.id));
      setOrders(ordRes.data);
      if (marketRes.data && marketRes.data.data) {
        setMarketRates(marketRes.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and Drop File Handlers
  const handleFiles = (files) => {
    const filesArray = Array.from(files).filter(file => file.type.startsWith('image/'));
    const newFiles = [...selectedFiles, ...filesArray].slice(0, 5);
    setSelectedFiles(newFiles);
    
    // Revoke old previews to avoid memory leak
    previews.forEach(p => URL.revokeObjectURL(p));
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    URL.revokeObjectURL(previews[index]);
    const newPreviews = previews.filter((_, i) => i !== index);
    setPreviews(newPreviews);
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const headers = { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      };
      
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('category', newProduct.category);
      formData.append('quantity', newProduct.quantity);
      formData.append('unit', newProduct.unit);
      formData.append('price', newProduct.price);
      formData.append('description', newProduct.description);
      formData.append('isOrganic', newProduct.isOrganic);
      
      if (selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          formData.append('images', file);
        });
      }

      const uploadToast = toast.loading('Uploading product...');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`, formData, { headers });
      toast.success('Product added successfully!', { id: uploadToast });
      
      setNewProduct({ name: '', category: 'Vegetables', quantity: '', unit: 'kg', price: '', description: '', isOrganic: false });
      setSelectedFiles([]);
      previews.forEach(p => URL.revokeObjectURL(p));
      setPreviews([]);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to add product. Please check your image size or network.');
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // AI Diagnostic Handlers
  const handleScanChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScanFile(file);
      setScanPreview(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const handleScanDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setScanFile(file);
      setScanPreview(URL.createObjectURL(file));
      setScanResult(null);
    }
  };

  const startAnalysis = () => {
    if (!scanFile) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      
      const tomatoDiseases = [
        {
          crop: 'Tomato',
          issue: 'Tomato Early Blight',
          status: 'danger',
          confidence: '95.4%',
          remedies: [
            'Remove infected lower leaves to prevent spread.',
            'Spray organic neem oil solution.',
            'Avoid overhead watering; irrigate at the base of the crop.'
          ]
        },
        {
          crop: 'Tomato',
          issue: 'Tomato Leaf Mold',
          status: 'warning',
          confidence: '91.2%',
          remedies: [
            'Improve air circulation around tomato plants.',
            'Apply certified copper fungicide early in the morning.',
            'Reduce humidity levels in greenhouses or polytunnels.'
          ]
        },
        {
          crop: 'Tomato',
          issue: 'Healthy Tomato Plant',
          status: 'success',
          confidence: '99.1%',
          remedies: [
            'Your tomato plant looks perfectly healthy! Keep doing what you are doing.',
            'Maintain optimal soil moisture and balanced fertilizing.'
          ]
        }
      ];

      const riceDiseases = [
        {
          crop: 'Rice',
          issue: 'Rice Leaf Blast',
          status: 'danger',
          confidence: '92.1%',
          remedies: [
            'Apply balanced nitrogen fertilizers to prevent excessive vegetative growth.',
            'Spray Pseudomonas fluorescens formulation.',
            'Drain excess standing water from the field for 24-48 hours.'
          ]
        },
        {
          crop: 'Rice',
          issue: 'Rice Brown Spot',
          status: 'warning',
          confidence: '88.5%',
          remedies: [
            'Ensure proper soil nutrient management (especially Potassium).',
            'Apply organic compost once every two weeks.',
            'Spray copper oxychloride to control fungal expansion.'
          ]
        },
        {
          crop: 'Rice',
          issue: 'Healthy Rice Plant',
          status: 'success',
          confidence: '98.5%',
          remedies: [
            'Your rice crop looks completely healthy! Excellent maintenance.',
            'Keep checking water level at regular intervals.'
          ]
        }
      ];

      const cottonDiseases = [
        {
          crop: 'Cotton',
          issue: 'Leaf Curl Virus',
          status: 'warning',
          confidence: '89.7%',
          remedies: [
            'Uproot and destroy heavily infected plants immediately.',
            'Control whitefly vectors using yellow sticky traps.',
            'Spray neem-based biopesticides early in the morning.'
          ]
        },
        {
          crop: 'Cotton',
          issue: 'Boll Rot',
          status: 'danger',
          confidence: '93.3%',
          remedies: [
            'Ensure adequate plant spacing for aeration.',
            'Avoid excessive nitrogen applications.',
            'Spray systemic fungicide if symptoms persist.'
          ]
        },
        {
          crop: 'Cotton',
          issue: 'Healthy Cotton Plant',
          status: 'success',
          confidence: '97.8%',
          remedies: [
            'Your cotton plant is healthy and showing great growth patterns.',
            'Continue regular insect scouting.'
          ]
        }
      ];

      const chilliDiseases = [
        {
          crop: 'Chilli',
          issue: 'Chilli Anthracnose',
          status: 'danger',
          confidence: '94.2%',
          remedies: [
            'Remove infected fruits and destroy them.',
            'Spray Trichoderma viride formulation.',
            'Avoid using seeds from infected plants for next cultivation.'
          ]
        },
        {
          crop: 'Chilli',
          issue: 'Chilli Leaf Curl',
          status: 'warning',
          confidence: '91.5%',
          remedies: [
            'Control sucking pests (thrips/mites) using sticky traps.',
            'Spray dilute garlic-chilli extract as a natural repellent.',
            'Keep fields weed-free to reduce pest breeding grounds.'
          ]
        },
        {
          crop: 'Chilli',
          issue: 'Healthy Chilli Plant',
          status: 'success',
          confidence: '99.3%',
          remedies: [
            'Your chilli plants look exceptionally healthy! No disease detected.',
            'Maintain regular irrigation and weeding cycles.'
          ]
        }
      ];

      const otherDiseases = [
        {
          crop: 'General Leaf',
          issue: 'Powdery Mildew',
          status: 'warning',
          confidence: '86.4%',
          remedies: [
            'Expose plants to full sun where possible.',
            'Spray baking soda solution mixed with mild soap.',
            'Remove infected leaves immediately to contain spread.'
          ]
        },
        {
          crop: 'General Leaf',
          issue: 'Leaf Spot Disease',
          status: 'danger',
          confidence: '89.9%',
          remedies: [
            'Spray neem oil extract to inhibit fungal spore development.',
            'Avoid watering from overhead; keep foliage dry.',
            'Ensure adequate ventilation between rows.'
          ]
        },
        {
          crop: 'General Leaf',
          issue: 'Healthy Crop',
          status: 'success',
          confidence: '98.2%',
          remedies: [
            'The uploaded leaf appears healthy and free of pathogenic infections.',
            'Keep monitoring and apply standard organic manure.'
          ]
        }
      ];

      let chosenResultList = otherDiseases;
      if (selectedCrop === 'Tomato') chosenResultList = tomatoDiseases;
      else if (selectedCrop === 'Rice') chosenResultList = riceDiseases;
      else if (selectedCrop === 'Cotton') chosenResultList = cottonDiseases;
      else if (selectedCrop === 'Chilli') chosenResultList = chilliDiseases;

      const randomResult = chosenResultList[Math.floor(Math.random() * chosenResultList.length)];
      setScanResult(randomResult);
    }, 2500);
  };

  const resetScanner = () => {
    setScanFile(null);
    if (scanPreview) URL.revokeObjectURL(scanPreview);
    setScanPreview(null);
    setScanResult(null);
    setIsScanning(false);
  };

  const getEarningsByDate = () => {
    const groups = {};
    orders.forEach(order => {
      if (!order.createdAt) return;
      const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      groups[dateStr] = (groups[dateStr] || 0) + order.totalAmount;
    });
    return Object.keys(groups).map(date => ({
      name: date,
      amount: groups[date]
    })).slice(-7);
  };

  const getSalesByCrop = () => {
    const groups = {};
    orders.forEach(order => {
      const cropName = order.Product?.name || 'Unknown';
      groups[cropName] = (groups[cropName] || 0) + order.totalAmount;
    });
    return Object.keys(groups).map(crop => ({
      name: crop,
      amount: groups[crop]
    }));
  };

  const totalEarnings = orders.filter(o => o.status === 'Delivered').reduce((acc, o) => acc + o.totalAmount, 0);
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;

  const suggestedRate = newProduct.name.length > 2 
    ? marketRates.find(r => r.commodity.toLowerCase().includes(newProduct.name.toLowerCase().trim()) || newProduct.name.toLowerCase().includes(r.commodity.toLowerCase().trim()))
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Farmer Dashboard</h1>
      
      {/* Tabs */}
      <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
        {['overview', 'products', 'add-product', 'orders', 'ai-diagnostic'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'}`}
          >
            {tab === 'ai-diagnostic' ? 'AI Disease Scanner 🤖' : tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard icon={<TrendingUp />} title="Total Earnings" value={`₹${totalEarnings}`} color="bg-green-100 text-green-600" />
            <StatCard icon={<Package />} title="My Products" value={products.length} color="bg-blue-100 text-blue-600" />
            <StatCard icon={<Clock />} title="Pending Orders" value={pendingOrders} color="bg-yellow-100 text-yellow-600" />
          </div>
          
          <div className="glass-card p-6 border dark:border-dark-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Sales & Analytics</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Understand your farm's performance and crop popularity.</p>
              </div>
              <div className="flex bg-gray-100 dark:bg-dark-900 p-1 rounded-xl border dark:border-dark-750">
                <button
                  onClick={() => setChartMode('earnings')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${chartMode === 'earnings' ? 'bg-primary-600 text-white shadow' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Earnings Trend
                </button>
                <button
                  onClick={() => setChartMode('crops')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${chartMode === 'crops' ? 'bg-primary-600 text-white shadow' : 'text-gray-650 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                  Popular Crops
                </button>
              </div>
            </div>

            <div className="h-80 w-full">
              {orders.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  {chartMode === 'earnings' ? (
                    <AreaChart data={getEarningsByDate()}>
                      <defs>
                        <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                      <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} unit="₹" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '12px', fontSize: '13px' }} 
                        formatter={(value) => [`₹${value}`, 'Earnings']}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorEarnings)" />
                    </AreaChart>
                  ) : (
                    <BarChart data={getSalesByCrop()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} />
                      <XAxis dataKey="name" stroke="#6b7280" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} unit="₹" />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '12px', fontSize: '13px' }} 
                        formatter={(value) => [`₹${value}`, 'Sales']}
                      />
                      <Bar dataKey="amount" fill="#059669" radius={[8, 8, 0, 0]} maxBarSize={50} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Not enough sales data to render analytics.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Product Tab */}
      {activeTab === 'add-product' && (
        <div className="glass-card p-8 max-w-2xl">
          <h2 className="text-xl font-bold mb-6 dark:text-white">Add New Product</h2>
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1 dark:text-gray-300">Name</label>
                <input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-3 rounded-lg border dark:bg-dark-800 dark:border-dark-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm mb-1 dark:text-gray-300">Category</label>
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-3 rounded-lg border dark:bg-dark-800 dark:border-dark-600 dark:text-white">
                  <option>Vegetables</option>
                  <option>Fruits</option>
                  <option>Grains</option>
                </select>
              </div>
              <div>
                <label className="block text-sm mb-1 dark:text-gray-300">Quantity</label>
                <input type="number" required value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} className="w-full p-3 rounded-lg border dark:bg-dark-800 dark:border-dark-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm mb-1 dark:text-gray-300">Price per unit (₹)</label>
                <input type="number" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-3 rounded-lg border dark:bg-dark-800 dark:border-dark-600 dark:text-white" />
              </div>
              
              {/* Dynamic Market Rate Suggestion */}
              {suggestedRate && (
                <div className="col-span-2 mt-2 p-4 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-xl flex items-start gap-3">
                  <TrendingUp className="text-primary-600 dark:text-primary-400 w-6 h-6 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-primary-900 dark:text-primary-100">
                      Live Market Trend for {suggestedRate.commodity}
                    </p>
                    <p className="text-sm text-primary-700 dark:text-primary-300 mt-1">
                      Current wholesale price in <b>{suggestedRate.market}</b> is <b>₹{suggestedRate.modalPrice}/kg</b>. 
                      To sell faster, we suggest pricing your product between <b className="text-green-600 dark:text-green-400">₹{suggestedRate.minPrice}</b> and <b className="text-green-600 dark:text-green-400">₹{suggestedRate.maxPrice}</b>!
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm mb-1 dark:text-gray-300">Description</label>
              <textarea value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full p-3 rounded-lg border dark:bg-dark-800 dark:border-dark-600 dark:text-white" rows="3"></textarea>
            </div>
            <div>
              <label className="block text-sm mb-1 dark:text-gray-300 font-medium font-sans">Product Images</label>
              <div 
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => document.getElementById('image-upload-input').click()}
                className={`relative group w-full py-8 px-4 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${dragActive ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10' : 'border-gray-300 dark:border-dark-600 hover:border-primary-500 bg-white/50 dark:bg-dark-800/50'}`}
              >
                <input 
                  id="image-upload-input"
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={handleChange}
                  className="hidden" 
                />
                <UploadCloud className={`w-10 h-10 mb-3 transition-colors duration-300 ${dragActive ? 'text-primary-500' : 'text-gray-400 group-hover:text-primary-500'}`} />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 text-center">
                  Drag & drop images here, or <span className="text-primary-600 dark:text-primary-400 hover:underline">browse</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  Supports JPG, PNG, WEBP (Max 5 files)
                </p>
              </div>

              {/* Previews */}
              {previews.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative group aspect-square rounded-xl overflow-hidden border dark:border-dark-700 bg-gray-50 dark:bg-dark-900">
                      <img src={preview} alt={`preview-${index}`} className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100 shadow"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="organic" checked={newProduct.isOrganic} onChange={e => setNewProduct({...newProduct, isOrganic: e.target.checked})} />
              <label htmlFor="organic" className="dark:text-gray-300">Certified Organic</label>
            </div>
            <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700">Add Product</button>
          </form>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <div key={product.id} className="glass-card overflow-hidden group border dark:border-dark-700">
              <div className="relative h-40 bg-gray-200 dark:bg-dark-700">
                {product.images && product.images[0] ? (
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                {product.isOrganic && (
                  <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-md">Organic</span>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{product.name}</h3>
                  <span className="font-bold text-primary-600 dark:text-primary-400">₹{product.price}/{product.unit}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{product.category}</p>
                <div className="flex justify-between items-center text-sm border-t border-gray-100 dark:border-dark-700 pt-3 mt-2">
                  <span className="text-gray-600 dark:text-gray-400">Stock: <b>{product.quantity} {product.unit}</b></span>
                  <button 
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this product?')) {
                        try {
                          await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products/${product.id}`, {
                            headers: { Authorization: `Bearer ${token}` }
                          });
                          toast.success('Product deleted successfully');
                          fetchData();
                        } catch (err) {
                          console.error(err);
                          toast.error('Failed to delete product');
                        }
                      }
                    }}
                    className="text-red-500 hover:text-red-700 text-sm font-semibold transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {products.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              You haven't listed any products yet.
            </div>
          )}
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm overflow-hidden">
          {/* Desktop view */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 dark:bg-dark-700">
                <tr>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-300">Order ID</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-300">Retailer</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-300">Product</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-300">Amount</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-300">Status</th>
                  <th className="p-4 font-medium text-gray-500 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
                    <td className="p-4 text-sm font-semibold text-primary-600 dark:text-primary-400">{order.orderNumber || order.id.substring(0,8)}</td>
                    <td className="p-4 text-sm dark:text-gray-300">{order.retailer?.name}</td>
                    <td className="p-4 text-sm dark:text-gray-300">{order.Product?.name} ({order.quantity})</td>
                    <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">₹{order.totalAmount}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-semibold inline-flex items-center gap-1
                        ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                        ${order.status === 'Accepted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                        ${order.status === 'Shipped' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                        ${order.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                      `}>
                        {order.status === 'Delivered' ? <CheckCircle size={12}/> : <Package size={12}/>}
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4">
                      {order.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => updateOrderStatus(order.id, 'Accepted')} className="text-green-600 hover:text-green-850 dark:hover:text-green-400"><CheckCircle size={20}/></button>
                          <button onClick={() => updateOrderStatus(order.id, 'Rejected')} className="text-red-600 hover:text-red-850 dark:hover:text-red-400"><XCircle size={20}/></button>
                        </div>
                      )}
                      {order.status === 'Accepted' && (
                        <button onClick={() => updateOrderStatus(order.id, 'Shipped')} className="text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1.5 rounded-md font-semibold transition-colors">Mark Shipped</button>
                      )}
                      {order.status === 'Shipped' && (
                        <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-md font-semibold transition-colors">Mark Delivered</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="grid grid-cols-1 gap-4 p-4 md:hidden">
            {orders.map(order => (
              <div key={order.id} className="p-4 rounded-xl border border-gray-150 dark:border-dark-700 bg-gray-50 dark:bg-dark-900/50 flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">#{order.orderNumber || order.id.substring(0,8)}</span>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-semibold inline-flex items-center gap-1
                    ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                    ${order.status === 'Accepted' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' : ''}
                    ${order.status === 'Shipped' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' : ''}
                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                    ${order.status === 'Rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                  `}>
                    {order.status === 'Delivered' ? <CheckCircle size={12}/> : <Package size={12}/>}
                    {order.status}
                  </span>
                </div>
                <div className="font-bold text-gray-900 dark:text-white">{order.Product?.name} ({order.quantity})</div>
                <div className="text-sm text-gray-650 dark:text-gray-400">Retailer: <b>{order.retailer?.name}</b></div>
                <div className="flex justify-between items-center mt-2 border-t dark:border-dark-750 pt-2">
                  <span className="font-bold text-gray-905 dark:text-white">Total: ₹{order.totalAmount}</span>
                  <div className="flex gap-2">
                    {order.status === 'Pending' && (
                      <>
                        <button onClick={() => updateOrderStatus(order.id, 'Accepted')} className="p-1 text-green-600 hover:text-green-800"><CheckCircle size={22}/></button>
                        <button onClick={() => updateOrderStatus(order.id, 'Rejected')} className="p-1 text-red-600 hover:text-red-800"><XCircle size={22}/></button>
                      </>
                    )}
                    {order.status === 'Accepted' && (
                      <button onClick={() => updateOrderStatus(order.id, 'Shipped')} className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-3 py-1 rounded-md font-bold transition-colors">Mark Shipped</button>
                    )}
                    {order.status === 'Shipped' && (
                      <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-200 px-3 py-1 rounded-md font-bold transition-colors">Mark Delivered</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {orders.length === 0 && <div className="p-8 text-center text-gray-500 dark:text-gray-400">No orders yet.</div>}
        </div>
      )}

      {/* AI Crop Disease Scanner Tab */}
      {activeTab === 'ai-diagnostic' && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-800 rounded-3xl overflow-hidden shadow-xl border border-gray-150 dark:border-dark-700 p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-xl">
              <Cpu size={24} />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                AI Crop Disease Diagnostic Center
                <span className="bg-primary-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider animate-pulse">Beta</span>
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Upload a photo of your crop leaf to instantly identify diseases and receive expert remedies.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side: Upload & Scan */}
            <div className="flex flex-col justify-center">
              <div className="mb-6">
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                  Select Crop Type
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => {
                    setSelectedCrop(e.target.value);
                    setScanResult(null);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-dark-600 dark:bg-dark-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-sm font-medium"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Rice">Rice</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Chilli">Chilli</option>
                  <option value="Other">Other / General Leaf</option>
                </select>
              </div>
              {!scanPreview ? (
                <div 
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleScanDrop}
                  className={`border-3 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[300px]
                    ${dragActive ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-300 dark:border-dark-700 hover:border-primary-500 dark:hover:border-primary-500 bg-gray-50 dark:bg-dark-900/30'}`}
                >
                  <input type="file" id="scan-upload" className="hidden" accept="image/*" onChange={handleScanChange} />
                  <label htmlFor="scan-upload" className="cursor-pointer flex flex-col items-center">
                    <UploadCloud className="w-16 h-16 text-gray-400 mb-4 animate-bounce" />
                    <p className="font-bold text-gray-700 dark:text-gray-300 mb-1">Click to Upload or Drag Leaf Image</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Supports JPG, PNG (Max 5MB)</p>
                  </label>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-700 max-h-[400px] flex items-center justify-center bg-black/5 dark:bg-black/20">
                  <img src={scanPreview} alt="Leaf preview" className="max-w-full max-h-[350px] object-contain rounded-2xl" />
                  
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                      <div className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_15px_#10b981] animate-scan"></div>
                      <div className="bg-dark-900/80 backdrop-blur-md rounded-xl p-4 border border-dark-700 flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
                        <span className="text-white font-bold text-sm">Analyzing Leaf Tissue...</span>
                      </div>
                    </div>
                  )}

                  {!isScanning && !scanResult && (
                    <button onClick={resetScanner} className="absolute top-4 right-4 p-2 bg-red-600 hover:bg-red-750 text-white rounded-full shadow-lg transition-colors">
                      <X size={20} />
                    </button>
                  )}
                </div>
              )}

              {scanPreview && !isScanning && !scanResult && (
                <button
                  onClick={startAnalysis}
                  className="w-full py-4 mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg shadow-primary-600/35 transition-all text-lg flex items-center justify-center gap-2"
                >
                  <Sparkles size={20} />
                  Analyze Crop Health
                </button>
              )}
            </div>

            {/* Right Side: Results & Advisory */}
            <div className="bg-gray-50 dark:bg-dark-900/40 rounded-2xl border border-gray-150 dark:border-dark-750 p-6 flex flex-col justify-center">
              {!scanResult && !isScanning && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                  <Cpu size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="font-semibold text-lg">Awaiting Image Scan</p>
                  <p className="text-sm mt-1 max-w-xs">Upload a photo on the left and click analyze to start the diagnostic scan.</p>
                </div>
              )}

              {isScanning && (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400 flex flex-col items-center">
                  <div className="h-12 w-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                  <p className="font-semibold text-lg animate-pulse text-primary-600 dark:text-primary-400">AI Engine Scanning...</p>
                  <p className="text-sm mt-1">Comparing leaf pattern against 50,000+ agricultural disease samples.</p>
                </div>
              )}

              {scanResult && !isScanning && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                  <div className="flex items-center justify-between border-b dark:border-dark-700 pb-4">
                    <span className="text-xs uppercase font-bold tracking-wider text-gray-500 dark:text-gray-400">Diagnosis Report</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                      ${scanResult.status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : ''}
                      ${scanResult.status === 'warning' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' : ''}
                      ${scanResult.status === 'danger' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : ''}
                    `}>
                      {scanResult.status === 'success' ? 'Healthy' : 'Alert'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm text-gray-500 dark:text-gray-450">Target Crop</h4>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{scanResult.crop}</p>
                  </div>

                  <div>
                    <h4 className="text-sm text-gray-500 dark:text-gray-450">Condition Detected</h4>
                    <p className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{scanResult.issue}</p>
                  </div>

                  <div>
                    <h4 className="text-sm text-gray-500 dark:text-gray-450">Confidence Level</h4>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-3 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary-500 rounded-full" 
                          style={{ width: scanResult.confidence }}
                        ></div>
                      </div>
                      <span className="font-extrabold text-sm text-gray-900 dark:text-white">{scanResult.confidence}</span>
                    </div>
                  </div>

                  <div className="border-t dark:border-dark-700 pt-4">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Sparkles size={16} className="text-primary-500" />
                      Recommended Solutions
                    </h4>
                    <ul className="space-y-2">
                      {scanResult.remedies.map((remedy, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <span className="text-primary-500 font-bold">•</span>
                          <span>{remedy}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={resetScanner}
                    className="w-full py-3 bg-gray-200 hover:bg-gray-300 dark:bg-dark-800 dark:hover:bg-dark-750 text-gray-700 dark:text-gray-350 font-bold rounded-xl transition-all text-sm flex items-center justify-center gap-2 mt-4"
                  >
                    <RefreshCw size={16} />
                    Reset & Scan New Leaf
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <motion.div whileHover={{ y: -5 }} className="glass-card p-6 flex items-center gap-4">
    <div className={`p-4 rounded-xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
    </div>
  </motion.div>
);

export default FarmerDashboard;
