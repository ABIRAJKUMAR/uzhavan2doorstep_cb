import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import MarketRatesTicker from './components/MarketRatesTicker';
import LandingPage from './pages/LandingPage';
import Marketplace from './pages/Marketplace';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import RetailerDashboard from './pages/RetailerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import Traceability from './pages/Traceability';

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ className: 'dark:bg-dark-800 dark:text-white border dark:border-dark-700 shadow-xl rounded-xl' }} />
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-dark-900 transition-colors duration-300">
        <Navbar />
        <MarketRatesTicker />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/trace/:id" element={<Traceability />} />
            
            <Route path="/farmer-dashboard" element={
              <ProtectedRoute allowedRoles={['Farmer']}>
                <FarmerDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/retailer-dashboard" element={
              <ProtectedRoute allowedRoles={['Retailer', 'Customer']}>
                <RetailerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/customer-dashboard" element={
              <ProtectedRoute allowedRoles={['Retailer', 'Customer']}>
                <RetailerDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
