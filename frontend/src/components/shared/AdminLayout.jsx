import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers,
  FiLogOut, FiMenu, FiX, FiChevronRight
} from 'react-icons/fi';

const navItems = [
  { to: '/admin', icon: <FiGrid />, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: <FiPackage />, label: 'Products' },
  { to: '/admin/orders', icon: <FiShoppingBag />, label: 'Orders' },
  { to: '/admin/customers', icon: <FiUsers />, label: 'Customers' },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((s) => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-60' : 'w-16'} bg-primary transition-all duration-300 flex flex-col flex-shrink-0`}>
        <div className="flex items-center justify-between p-4 border-b border-white/10 h-16">
          {sidebarOpen && (
            <span className="font-display text-xl font-bold text-white">
              VL<span className="text-accent">Store</span>
              <span className="text-xs text-gray-400 font-sans font-normal ml-1">admin</span>
            </span>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white transition-colors ml-auto">
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 px-2">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                ${isActive ? 'bg-accent text-white shadow-lg' : 'text-gray-400 hover:bg-white/10 hover:text-white'}`
              }>
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
              {sidebarOpen && <FiChevronRight className="ml-auto opacity-0 group-hover:opacity-60 transition-opacity" size={14} />}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
                <p className="text-gray-500 text-xs truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-xl text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-all text-sm">
            <FiLogOut className="flex-shrink-0" />
            {sidebarOpen && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center px-6 flex-shrink-0">
          <h1 className="font-display text-lg font-semibold text-primary">Admin Panel</h1>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
