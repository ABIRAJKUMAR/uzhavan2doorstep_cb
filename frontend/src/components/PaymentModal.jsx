import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Smartphone, CheckCircle, X, Truck } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentModal = ({ isOpen, onClose, totalAmount, onSuccess }) => {
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setLoading(true);

    if (method === 'cod') {
      setTimeout(() => {
        toast.success("Order Placed via Cash on Delivery!");
        setLoading(false);
        onSuccess('COD');
      }, 1000);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Create order on backend
      const { data: order } = await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/create`,
        { amount: totalAmount },
        { headers }
      );

      // 2. Configure Razorpay options
      const options = {
        key: "rzp_test_SrBQyYhN3fOJg2", // Added from user's env
        amount: order.amount,
        currency: "INR",
        name: "UZHAVAN 2 DOORSTEP",
        description: "Farm Fresh Produce",
        order_id: order.id,
        handler: async function (response) {
          try {
            // 3. Verify on backend
            await axios.post(
              `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payment/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { headers }
            );

            toast.success("Payment Successful!");
            setLoading(false);
            onSuccess('Online');
          } catch (err) {
            toast.error("Payment Verification Failed");
            setLoading(false);
          }
        },
        prefill: {
          name: "User", // Can be dynamically filled
          email: "user@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#10b981",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      // 3. Open Razorpay Interface
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error(response.error.description);
        setLoading(false);
      });
      rzp.open();

    } catch (error) {
      console.error(error);
      toast.error("Could not initialize payment");
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-primary-600 p-6 text-white relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-primary-200 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <h2 className="text-xl font-bold mb-1">Secure Checkout</h2>
            <p className="text-primary-100 text-sm">Powered by UzhavanPay</p>
            <div className="mt-6">
              <p className="text-primary-100 text-sm mb-1">Amount to Pay</p>
              <h3 className="text-4xl font-black">₹{totalAmount}</h3>
            </div>
          </div>

          {/* Body */}
          <div className="p-6">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Select Payment Method</h4>
            
            <div className="space-y-3 mb-6">
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${method === 'upi' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700'}`}>
                <input type="radio" name="payment" value="upi" checked={method === 'upi'} onChange={() => setMethod('upi')} className="sr-only" />
                <Smartphone className={`w-6 h-6 mr-3 ${method === 'upi' ? 'text-primary-600' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">UPI (GPay, PhonePe)</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Instant payment via UPI App</p>
                </div>
                {method === 'upi' && <CheckCircle className="text-primary-600" size={20} />}
              </label>

              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${method === 'card' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700'}`}>
                <input type="radio" name="payment" value="card" checked={method === 'card'} onChange={() => setMethod('card')} className="sr-only" />
                <CreditCard className={`w-6 h-6 mr-3 ${method === 'card' ? 'text-primary-600' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">Credit / Debit Card</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Visa, Mastercard, RuPay</p>
                </div>
                {method === 'card' && <CheckCircle className="text-primary-600" size={20} />}
              </label>

              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${method === 'cod' ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-700'}`}>
                <input type="radio" name="payment" value="cod" checked={method === 'cod'} onChange={() => setMethod('cod')} className="sr-only" />
                <Truck className={`w-6 h-6 mr-3 ${method === 'cod' ? 'text-primary-600' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white">Cash on Delivery</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pay at your doorstep</p>
                </div>
                {method === 'cod' && <CheckCircle className="text-primary-600" size={20} />}
              </label>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-primary-700 hover:shadow-primary-600/30 transition-all flex justify-center items-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                method === 'cod' ? 'Place Order (COD)' : `Pay ₹${totalAmount}`
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4 flex justify-center items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span> 100% Secure Payment
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PaymentModal;
