import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/slices/authSlice';
import axios from 'axios';
import { Leaf, Eye, EyeOff } from 'lucide-react';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('Farmer');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '',
    village: '', district: '', state: '', farmType: '',
    shopName: '', gstNumber: '', location: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData, role };
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, payload);
      dispatch(loginSuccess({ user: res.data.user, token: res.data.token }));
      if (role === 'Farmer') navigate('/farmer-dashboard');
      else if (role === 'Retailer') navigate('/retailer-dashboard');
      else navigate('/customer-dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-dark-900">
      <div className="max-w-2xl w-full glass-card p-8">
        <div className="text-center mb-8">
          <Leaf className="w-12 h-12 text-primary-600 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create an account</h2>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">{error}</div>}

        <div className="flex gap-2 sm:gap-4 mb-8">
          <button
            type="button"
            onClick={() => setRole('Farmer')}
            className={`flex-1 py-3 px-2 text-sm sm:text-base rounded-xl font-bold transition-colors ${role === 'Farmer' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-gray-300'}`}
          >
            I'm a Farmer
          </button>
          <button
            type="button"
            onClick={() => setRole('Retailer')}
            className={`flex-1 py-3 px-2 text-sm sm:text-base rounded-xl font-bold transition-colors ${role === 'Retailer' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-gray-300'}`}
          >
            I'm a Retailer
          </button>
          <button
            type="button"
            onClick={() => setRole('Customer')}
            className={`flex-1 py-3 px-2 text-sm sm:text-base rounded-xl font-bold transition-colors ${role === 'Customer' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-dark-700 dark:text-gray-300'}`}
          >
            Customer
          </button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Full Name</label>
              <input name="name" type="text" required onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-dark-800 dark:border-dark-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Email Address</label>
              <input name="email" type="email" required onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-dark-800 dark:border-dark-600 dark:text-white" />
            </div>
            <div className="relative">
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Password</label>
              <input 
                name="password" 
                type={showPassword ? 'text' : 'password'} 
                required 
                onChange={handleChange} 
                className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-dark-800 dark:border-dark-600 dark:text-white pr-10" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pt-6 pr-3 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 dark:text-gray-300">Phone Number</label>
              <input name="phone" type="text" required onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-dark-800 dark:border-dark-600 dark:text-white" />
            </div>

            {role === 'Farmer' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Village</label>
                  <input name="village" type="text" onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-dark-800 dark:border-dark-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">District</label>
                  <input name="district" type="text" onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-dark-800 dark:border-dark-600 dark:text-white" />
                </div>
              </>
            )}
            
            {role === 'Retailer' && (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Shop Name</label>
                  <input name="shopName" type="text" required onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-dark-800 dark:border-dark-600 dark:text-white" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">GST Number</label>
                  <input name="gstNumber" type="text" onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-dark-800 dark:border-dark-600 dark:text-white" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1 dark:text-gray-300">Shop Location / District</label>
                  <input name="location" type="text" required onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-dark-800 dark:border-dark-600 dark:text-white" placeholder="e.g. Madurai, Coimbatore, Chennai..." />
                </div>
              </>
            )}
            
            {role === 'Customer' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 dark:text-gray-300">Delivery Address</label>
                <input name="location" type="text" required onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-xl dark:bg-dark-800 dark:border-dark-600 dark:text-white" placeholder="Full residential address..." />
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="w-full py-4 text-white bg-primary-600 rounded-xl font-bold hover:bg-primary-700 transition-colors">
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary-600 font-medium">Already have an account? Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
