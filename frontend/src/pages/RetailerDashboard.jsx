import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { clearCart, removeFromCart, updateQuantity } from '../redux/slices/cartSlice';
import { ShoppingBag, Truck, CheckCircle, Trash2, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import PaymentModal from '../components/PaymentModal';

const RetailerDashboard = () => {
  const { token } = useSelector(state => state.auth);
  const { items, total } = useSelector(state => state.cart);
  const dispatch = useDispatch();
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('cart');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCheckoutClick = () => {
    if (items.length === 0) return;
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentMethod = 'Online') => {
    setIsPaymentModalOpen(false);
    try {
      const checkoutToast = toast.loading('Processing order...');
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/batch`, {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.cartQuantity,
          price: item.price
        })),
        deliveryAddress: 'Home/Shop Address',
        paymentMethod,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast.success('Order placed successfully!', { id: checkoutToast });
      dispatch(clearCart());
      setActiveTab('orders');
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Checkout failed. Please try again.', { id: checkoutToast });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        {useSelector(state => state.auth.user?.role)} Dashboard
      </h1>
      
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setActiveTab('cart')}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'cart' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300'}`}
        >
          My Cart ({items.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-6 py-3 rounded-xl font-medium transition-colors ${activeTab === 'orders' ? 'bg-primary-600 text-white' : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300'}`}
        >
          Order History
        </button>
      </div>

      {activeTab === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.length === 0 ? (
              <div className="glass-card p-12 text-center text-gray-500">Your cart is empty.</div>
            ) : (
              items.map(item => (
                <div key={item.id} className="glass-card p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-200 dark:bg-dark-700 rounded-lg overflow-hidden">
                      {item.images?.[0] && <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                      <p className="text-sm text-gray-500">₹{item.price}/{item.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-1 sm:gap-2 border border-gray-300 dark:border-dark-600 rounded-lg p-1">
                      <button 
                        onClick={() => dispatch(updateQuantity({id: item.id, quantity: item.cartQuantity - 1}))} 
                        className="p-1 rounded bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-600 dark:text-gray-300 transition-colors"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-6 sm:w-8 text-center font-medium text-gray-900 dark:text-white">
                        {item.cartQuantity}
                      </span>
                      <button 
                        onClick={() => {
                          if (item.cartQuantity < item.quantity) {
                            dispatch(updateQuantity({id: item.id, quantity: item.cartQuantity + 1}))
                          } else {
                            toast.error(`Only ${item.quantity} ${item.unit} in stock!`);
                          }
                        }} 
                        className="p-1 rounded bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-600 dark:text-gray-300 transition-colors"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <span className="font-bold text-primary-600 min-w-[60px] sm:min-w-[80px] text-right">
                      ₹{item.price * item.cartQuantity}
                    </span>
                    <button onClick={() => dispatch(removeFromCart(item.id))} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={20}/></button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="lg:col-span-1">
            <div className="glass-card p-6">
              <h3 className="text-xl font-bold mb-4 dark:text-white">Order Summary</h3>
              <div className="flex justify-between mb-2 text-gray-600 dark:text-gray-300">
                <span>Subtotal</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between mb-4 text-gray-600 dark:text-gray-300">
                <span>Delivery</span>
                <span>Free</span>
              </div>
              <div className="border-t border-gray-200 dark:border-dark-700 pt-4 mb-6 flex justify-between font-bold text-lg dark:text-white">
                <span>Total</span>
                <span className="text-primary-600">₹{total}</span>
              </div>
              <button 
                onClick={handleCheckoutClick} 
                disabled={items.length === 0}
                className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-dark-700">
              <tr>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-300">Order ID</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-300">Product</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-300">Quantity</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-300">Total</th>
                <th className="p-4 font-medium text-gray-500 dark:text-gray-300">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-dark-700">
              {orders.map(order => (
                <tr key={order.id}>
                  <td className="p-4 text-sm font-semibold text-primary-600 dark:text-primary-400">{order.orderNumber || order.id.substring(0,8)}</td>
                  <td className="p-4 text-sm dark:text-gray-300">{order.Product?.name}</td>
                  <td className="p-4 text-sm dark:text-gray-300">{order.quantity}</td>
                  <td className="p-4 text-sm font-medium text-gray-900 dark:text-white">₹{order.totalAmount}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium inline-flex items-center gap-1
                      ${order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${order.status === 'Accepted' ? 'bg-blue-100 text-blue-800' : ''}
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : ''}
                      ${order.status === 'Rejected' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {order.status === 'Delivered' ? <CheckCircle size={12}/> : <Truck size={12}/>}
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <div className="p-8 text-center text-gray-500 dark:text-gray-400">No order history.</div>}
        </div>
      )}

      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)} 
        totalAmount={total} 
        onSuccess={handlePaymentSuccess} 
      />
    </div>
  );
};

export default RetailerDashboard;
