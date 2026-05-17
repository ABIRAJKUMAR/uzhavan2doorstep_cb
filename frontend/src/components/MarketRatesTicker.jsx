import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const MarketRatesTicker = () => {
  const [rates, setRates] = useState([]);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/market-prices`);
        if (response.data && response.data.data) {
          setRates(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch market rates', error);
      }
    };
    fetchRates();
  }, []);

  if (rates.length === 0) return null;

  return (
    <div className="bg-primary-50 dark:bg-dark-800 text-gray-800 dark:text-white py-2 overflow-hidden flex items-center shadow-inner relative z-30 border-b border-primary-200 dark:border-dark-700 transition-colors duration-300">
      
      {/* Sticky Label on the left */}
      <div className="px-4 py-1 flex items-center space-x-2 border-r border-primary-200 dark:border-dark-700 bg-primary-50 dark:bg-dark-800 z-10 font-bold whitespace-nowrap shadow-[10px_0_15px_-3px_rgba(0,0,0,0.1)] dark:shadow-[10px_0_15px_-3px_rgba(0,0,0,0.5)] transition-colors duration-300">
        <TrendingUp className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        <span className="text-sm tracking-wide text-primary-900 dark:text-white">TODAY'S MARKET RATES:</span>
      </div>

      {/* Scrolling Content */}
      <div className="flex flex-1 overflow-hidden relative">
        <motion.div
          className="flex whitespace-nowrap items-center"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: rates.length * 4, repeat: Infinity }}
        >
          {/* We duplicate the rates list to create a seamless infinite scroll effect */}
          {[...rates, ...rates].map((rate, index) => (
            <div key={`${rate.id}-${index}`} className="flex items-center mx-6">
              <span className="font-semibold text-primary-900 dark:text-primary-50">{rate.commodity}</span>
              <span className="text-xs text-primary-600 dark:text-primary-300 ml-1">({rate.market})</span>
              <span className="font-bold text-primary-700 dark:text-green-400 ml-2">₹{rate.modalPrice}/kg</span>
              <span className="ml-12 text-primary-300 dark:text-primary-700">|</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default MarketRatesTicker;
