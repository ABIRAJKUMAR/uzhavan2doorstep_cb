import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Plus, Package, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const FarmerDashboard = () => {
  const { token, user } = useSelector(state => state.auth);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '', category: 'Vegetables', quantity: '', unit: 'kg', price: '', description: '', isOrganic: false, images: null
  });
  const [marketRates, setMarketRates] = useState([]);

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
      
      if (newProduct.images) {
        Array.from(newProduct.images).forEach(file => {
          formData.append('images', file);
        });
      }

      const uploadToast = toast.loading('Uploading product...');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`, formData, { headers });
      toast.success('Product added successfully!', { id: uploadToast });
      
      setNewProduct({ name: '', category: 'Vegetables', quantity: '', unit: 'kg', price: '', description: '', isOrganic: false, images: null });
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
        {['overview', 'products', 'add-product', 'orders'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-xl font-medium capitalize whitespace-nowrap transition-colors ${activeTab === tab ? 'bg-primary-600 text-white shadow-md' : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-700'}`}
          >
            {tab.replace('-', ' ')}
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
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Sales Overview</h3>
            <div className="h-80 w-full">
              {orders.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={orders.map((o, i) => ({ name: `Order ${i+1}`, amount: o.totalAmount })).slice(-10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis dataKey="name" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', borderColor: '#374151', color: '#fff', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 6, fill: '#10b981' }} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
                  Not enough data to display chart.
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
              <label className="block text-sm mb-1 dark:text-gray-300">Product Images</label>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={e => setNewProduct({...newProduct, images: e.target.files})} 
                className="w-full p-3 rounded-lg border border-dashed dark:bg-dark-800 dark:border-dark-600 dark:text-white" 
              />
              <p className="text-xs text-gray-500 mt-1">You can select multiple images (Max 5)</p>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="organic" checked={newProduct.isOrganic} onChange={e => setNewProduct({...newProduct, isOrganic: e.target.checked})} />
              <label htmlFor="organic" className="dark:text-gray-300">Certified Organic</label>
            </div>
            <button type="submit" className="w-full py-3 bg-primary-600 text-white rounded-lg font-bold hover:bg-primary-700">Add Product</button>
          </form>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm overflow-hidden">
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
                <tr key={order.id}>
                  <td className="p-4 text-sm font-semibold text-primary-600 dark:text-primary-400">{order.orderNumber || order.id.substring(0,8)}</td>
                  <td className="p-4 text-sm dark:text-gray-300">{order.retailer?.name}</td>
                  <td className="p-4 text-sm dark:text-gray-300">{order.Product?.name} ({order.quantity})</td>
                  <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">₹{order.totalAmount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1
                      ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${order.status === 'Accepted' ? 'bg-blue-100 text-blue-800' : ''}
                      ${order.status === 'Shipped' ? 'bg-purple-100 text-purple-800' : ''}
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : ''}
                      ${order.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {order.status === 'Delivered' ? <CheckCircle size={12}/> : <Package size={12}/>}
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4">
                    {order.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button onClick={() => updateOrderStatus(order.id, 'Accepted')} className="text-green-600 hover:text-green-800"><CheckCircle size={20}/></button>
                        <button onClick={() => updateOrderStatus(order.id, 'Rejected')} className="text-red-600 hover:text-red-800"><XCircle size={20}/></button>
                      </div>
                    )}
                    {order.status === 'Accepted' && (
                      <button onClick={() => updateOrderStatus(order.id, 'Shipped')} className="text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1 rounded-md transition-colors">Mark Shipped</button>
                    )}
                    {order.status === 'Shipped' && (
                      <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md transition-colors">Mark Delivered</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div className="p-8 text-center text-gray-500 dark:text-gray-400">No orders yet.</div>}
        </div>
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
