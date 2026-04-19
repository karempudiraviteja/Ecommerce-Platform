import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import {
  FiShoppingCart, FiHeart, FiUser, FiMenu, FiX,
  FiPackage, FiLogOut, FiSettings, FiSearch
} from 'react-icons/fi';

export default function CustomerLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth);
  const { totalItems } = useSelector((s) => s.cart);
  const { products: wishItems } = useSelector((s) => s.wishlist);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchQ, setSearchQ] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQ.trim()) navigate(`/products?search=${encodeURIComponent(searchQ.trim())}`);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Shop' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Navbar */}
      <header className="bg-primary sticky top-0 z-50 shadow-lg">
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <span className="font-display text-2xl font-bold text-white tracking-tight">
                My<span className="text-accent">Store</span>
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to}
                  className={`text-sm font-medium transition-colors ${location.pathname === l.to ? 'text-accent' : 'text-gray-300 hover:text-white'}`}>
                  {l.label}
                </Link>
              ))}
            </nav>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center bg-white/10 rounded-xl px-3 py-1.5 gap-2 w-56">
              <FiSearch className="text-gray-400 text-sm flex-shrink-0" />
              <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                placeholder="Search products…"
                className="bg-transparent text-white placeholder-gray-400 text-sm outline-none w-full" />
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link to="/wishlist" className="relative p-2 text-gray-300 hover:text-accent transition-colors">
                <FiHeart size={20} />
                {wishItems?.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishItems.length}
                  </span>
                )}
              </Link>
              <Link to="/cart" className="relative p-2 text-gray-300 hover:text-accent transition-colors">
                <FiShoppingCart size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-accent text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative">
                  <button onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 text-gray-300 hover:text-white transition-colors">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                      {[
                        { to: '/profile', icon: <FiSettings size={14} />, label: 'Profile' },
                        { to: '/orders', icon: <FiPackage size={14} />, label: 'My Orders' },
                      ].map((item) => (
                        <Link key={item.to} to={item.to} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          {item.icon} {item.label}
                        </Link>
                      ))}
                      <button onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100">
                        <FiLogOut size={14} /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn-primary text-sm py-2 px-4">Sign In</Link>
              )}

              <button className="md:hidden p-2 text-gray-300" onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {menuOpen && (
            <div className="md:hidden pb-4 space-y-2">
              <form onSubmit={handleSearch} className="flex items-center bg-white/10 rounded-xl px-3 py-2 gap-2">
                <FiSearch className="text-gray-400" />
                <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)}
                  placeholder="Search…" className="bg-transparent text-white placeholder-gray-400 text-sm outline-none flex-1" />
              </form>
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                  className="block text-gray-300 hover:text-white py-2 text-sm font-medium">{l.label}</Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-gray-400 py-10 mt-16">
        <div className="page-container text-center">
          <span className="font-display text-xl font-bold text-white">My<span className="text-accent">Store</span></span>
          <p className="text-sm mt-2">© {new Date().getFullYear()} MyStore. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
