import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, TrendingUp, ShieldCheck, Truck } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-800/80 dark:from-dark-900/95 dark:to-dark-800/90 z-10"></div>
          <img 
            src="/hero-bg.png" 
            alt="Agriculture Field" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary-500/20 text-primary-100 text-sm font-semibold mb-6 border border-primary-400/30 backdrop-blur-md">
              The Future of AgTech
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight mb-8">
              Connect Farmers Directly <br className="hidden md:block" />
              <span className="text-primary-400">to Retailers</span>
            </h1>
            <p className="mt-4 max-w-2xl text-xl text-gray-200 mx-auto mb-10">
              Eliminate middlemen, ensure fair prices, and deliver fresh produce directly from farms to local shops with AI-powered insights.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/register" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-green-800 bg-white hover:bg-gray-50 transition-all shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105">
                Join Now <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/marketplace" className="inline-flex items-center justify-center px-8 py-4 text-base font-bold rounded-xl text-white border-2 border-white/30 hover:bg-white/10 backdrop-blur-sm transition-all">
                Browse Market
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-dark-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Why Choose UZHAVAN 2 DOORSTEP?</h2>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">Empowering the agricultural supply chain with technology.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<TrendingUp className="w-8 h-8 text-primary-500" />}
              title="Fair Pricing"
              description="AI-driven price suggestions ensure farmers get the best value while retailers pay less than market average."
            />
            <FeatureCard 
              icon={<ShieldCheck className="w-8 h-8 text-primary-500" />}
              title="Verified Quality"
              description="Direct sourcing means fresher produce. We verify all farmers and encourage organic farming practices."
            />
            <FeatureCard 
              icon={<Truck className="w-8 h-8 text-primary-500" />}
              title="Smart Logistics"
              description="Real-time tracking and optimized routing for faster delivery from farm to shop."
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary-600 dark:bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatCard number="10k+" label="Active Farmers" />
            <StatCard number="5k+" label="Retail Partners" />
            <StatCard number="50k+" label="Tons Delivered" />
            <StatCard number="100%" label="Transparent" />
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center">
            <Leaf className="h-8 w-8 text-primary-500" />
            <span className="ml-2 font-bold text-xl">UZHAVAN 2 DOORSTEP</span>
          </div>
          <p className="text-gray-400">&copy; 2026 UZHAVAN 2 DOORSTEP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="p-8 rounded-2xl bg-gray-50 dark:bg-dark-800 border border-gray-100 dark:border-dark-700 shadow-lg hover:shadow-xl transition-all"
  >
    <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400">{description}</p>
  </motion.div>
);

const StatCard = ({ number, label }) => (
  <div>
    <div className="text-4xl font-extrabold text-white mb-2">{number}</div>
    <div className="text-primary-200 font-medium">{label}</div>
  </div>
);

export default LandingPage;
