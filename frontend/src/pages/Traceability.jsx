import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { MapPin, User, Calendar, ShieldCheck, Leaf, ArrowLeft, Truck, Package, Store } from 'lucide-react';

const Traceability = () => {
  const { id } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTraceabilityData = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/trace/${id}`);
        setOrders(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Could not find traceability data for this invoice.');
      } finally {
        setLoading(false);
      }
    };
    fetchTraceabilityData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center dark:bg-dark-900">
        <div className="text-center">
          <ShieldCheck className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Traceability Failed</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
          <Link to="/" className="text-primary-600 hover:underline flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Assuming all items in this invoice went to the same buyer
  const buyer = orders[0]?.retailer;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-block p-4 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
          <ShieldCheck className="h-12 w-12 text-green-600 dark:text-green-400" />
        </motion.div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Farm to Table Journey</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Verified Traceability for Invoice: <span className="font-mono font-bold text-gray-900 dark:text-gray-300">{id}</span></p>
      </div>

      <div className="space-y-12">
        {orders.map((order, index) => (
          <motion.div 
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-dark-800 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-dark-700"
          >
            {/* Product Header */}
            <div className="bg-primary-50 dark:bg-primary-900/20 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900/50 rounded-2xl flex items-center justify-center">
                  <Leaf className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {order.Product.name}
                    {order.Product.isOrganic && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-md uppercase tracking-wider">Organic</span>
                    )}
                  </h3>
                  <p className="text-primary-600 dark:text-primary-400 font-semibold">{order.quantity} {order.Product.unit}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar size={16} /> Harvested recently
              </div>
            </div>

            {/* Journey Timeline */}
            <div className="p-8">
              <div className="relative">
                {/* Connecting Line */}
                <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-gray-200 dark:bg-dark-700"></div>
                
                {/* Farm Step */}
                <div className="relative flex gap-6 mb-12">
                  <div className="h-12 w-12 rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 flex items-center justify-center z-10 border-4 border-white dark:border-dark-800 flex-shrink-0">
                    <User size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Grown by {order.farmer.name}</h4>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin size={16} /> {order.farmer.village || 'Local Farm'}, {order.farmer.district || 'Tamil Nadu'}
                    </p>
                    <p className="text-sm text-gray-400 mt-2 italic">Cultivated with care and sustainable farming practices.</p>
                  </div>
                </div>

                {/* Quality Check Step */}
                <div className="relative flex gap-6 mb-12">
                  <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 flex items-center justify-center z-10 border-4 border-white dark:border-dark-800 flex-shrink-0">
                    <Package size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Quality Checked & Packed</h4>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Status: {order.status}</p>
                  </div>
                </div>

                {/* Delivery Step */}
                <div className="relative flex gap-6">
                  <div className="h-12 w-12 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 flex items-center justify-center z-10 border-4 border-white dark:border-dark-800 flex-shrink-0">
                    <Store size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Delivered to {buyer?.shopName || buyer?.name}</h4>
                    <p className="text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                      <MapPin size={16} /> {order.deliveryAddress}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-12">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Powered by Uzhavan 2 Doorstep Transparency Network
        </p>
      </div>
    </div>
  );
};

export default Traceability;
