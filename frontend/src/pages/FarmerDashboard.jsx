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
