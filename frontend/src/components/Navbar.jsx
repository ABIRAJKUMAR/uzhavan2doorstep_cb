import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';
import { Leaf, Menu, X, ShoppingCart, User, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 glass border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex flex-shrink-0 items-center">
              <Leaf className="h-8 w-8 text-primary-500" />
              <span className="ml-2 font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                UZHAVAN 2 DOORSTEP
              </span>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</Link>
              <Link to="/marketplace" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Marketplace</Link>
              {isAuthenticated && user?.role === 'Farmer' && (
                <Link to="/farmer-dashboard" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
              )}
              {isAuthenticated && (user?.role === 'Retailer' || user?.role === 'Customer') && (
                <Link to={`/${user.role.toLowerCase()}-dashboard`} className="text-gray-600 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium transition-colors">Dashboard</Link>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 dark:text-gray-400 transition-colors">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {isAuthenticated && (user?.role === 'Retailer' || user?.role === 'Customer') && (
               <Link to={`/${user.role.toLowerCase()}-dashboard`} className="relative p-2 text-gray-500 hover:text-primary-500 transition-colors">
                 <ShoppingCart size={24} />
                 {items.length > 0 && (
                   <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary-600 rounded-full">{items.length}</span>
                 )}
               </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium dark:text-gray-200">{user.name}</span>
                </div>
                <button onClick={handleLogout} className="bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-primary-500 font-medium px-3 py-2">Log in</Link>
                <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-medium shadow-md shadow-primary-500/30 transition-all hover:shadow-lg hover:-translate-y-0.5">
                  Sign up
                </Link>
              </div>
            )}
          </div>
          <div className="-mr-2 flex md:hidden items-center space-x-4">
             <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 dark:text-gray-400 transition-colors">
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             
             {isAuthenticated && (user?.role === 'Retailer' || user?.role === 'Customer') && (
                <Link to={`/${user.role.toLowerCase()}-dashboard`} className="relative p-2 text-gray-500 hover:text-primary-500 transition-colors">
                  <ShoppingCart size={24} />
                  {items.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary-600 rounded-full">{items.length}</span>
                  )}
                </Link>
             )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-700 focus:outline-none ml-2"
            >
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden glass border-t border-gray-200 dark:border-dark-700">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-dark-700">Home</Link>
            <Link to="/marketplace" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-dark-700">Marketplace</Link>
            
            {isAuthenticated && user?.role === 'Farmer' && (
              <Link to="/farmer-dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-dark-700">Dashboard</Link>
            )}
            {isAuthenticated && (user?.role === 'Retailer' || user?.role === 'Customer') && (
              <Link to={`/${user.role.toLowerCase()}-dashboard`} onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-dark-700">Dashboard</Link>
            )}

            {isAuthenticated ? (
               <div className="pt-4 pb-2 border-t border-gray-200 dark:border-dark-700 mt-2">
                 <div className="flex items-center px-3 mb-3">
                   <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                     {user.name.charAt(0)}
                   </div>
                   <div className="ml-3">
                     <div className="text-base font-medium text-gray-800 dark:text-gray-200">{user.name}</div>
                     <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{user.role}</div>
                   </div>
                 </div>
                 <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">Logout</button>
               </div>
            ) : (
               <div className="pt-4 border-t border-gray-200 dark:border-dark-700 mt-2 space-y-1">
                 <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-dark-700">Login</Link>
                 <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-900/30 font-semibold">Sign up</Link>
               </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
