import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const ReviewModal = ({ product, isOpen, onClose }) => {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    if (isOpen && product) {
      fetchReviews();
    }
  }, [isOpen, product]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/${product.id}`);
      setReviews(res.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to review');
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/reviews/${product.id}`,
        { rating, comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Review submitted successfully!');
      setComment('');
      fetchReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting review');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 50, opacity: 0 }}
          className="bg-white dark:bg-dark-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews for {product.name}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
              <X size={24} />
            </button>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Customer Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No reviews yet. Be the first to review!</p>
            ) : (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-gray-50 dark:bg-dark-700 p-4 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900 dark:text-white">{review.reviewer?.name || 'Anonymous'}</span>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={16} className={star <= review.rating ? "text-yellow-400 fill-current" : "text-gray-300"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {user && (user.role === 'Retailer' || user.role === 'Customer') && (
            <form onSubmit={submitReview} className="border-t border-gray-200 dark:border-dark-600 pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Write a Review</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star size={24} className={star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comment</label>
                <textarea
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-dark-600 bg-white dark:bg-dark-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  rows="3"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewModal;
