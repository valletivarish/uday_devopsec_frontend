/**
 * Layout.jsx - Main application layout with sidebar navigation and top navbar.
 * Uses React Router's Outlet to render child routes in the content area.
 * Sidebar navigation adapts based on user role:
 *   - Admin/Manager: Management dashboard with CRUD pages
 *   - Viewer: E-commerce storefront with Shop, Cart, My Orders
 */
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiBox,
  FiUsers,
  FiShoppingCart,
  FiDatabase,
  FiX,
  FiLogOut,
  FiZap,
  FiShoppingBag,
  FiPackage,
} from 'react-icons/fi';
import Navbar from './Navbar';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../context/CartContext';

// Admin/Manager navigation
const adminNav = [
  { path: '/dashboard', label: 'Dashboard', icon: FiHome },
  { path: '/products', label: 'Products', icon: FiBox },
  { path: '/customers', label: 'Customers', icon: FiUsers },
  { path: '/orders', label: 'Orders', icon: FiShoppingCart },
  { path: '/inventory', label: 'Inventory', icon: FiDatabase },
];

// Viewer (customer) navigation
const viewerNav = [
  { path: '/shop', label: 'Shop', icon: FiShoppingBag },
  { path: '/cart', label: 'Cart', icon: FiShoppingCart, showBadge: true },
  { path: '/my-orders', label: 'My Orders', icon: FiPackage },
];

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isViewer } = useAuth();
  const cart = useCart();

  const navItems = isViewer ? viewerNav : adminNav;

  const handleLogout = () => {
    localStorage.removeItem('opm_user');
    localStorage.removeItem('opm_token');
    localStorage.removeItem('opm_cart');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-emerald-50/30">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-emerald-950 transform transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
              <FiZap className="text-white" size={18} />
            </div>
            <span className="text-xl font-bold text-white">
              {isViewer ? 'OPM Store' : 'OPM System'}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded hover:bg-white/10 text-white/60"
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon, showBadge }) => (
            <NavLink
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 shadow-sm'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              {label}
              {showBadge && cart && cart.totalItems > 0 && (
                <span className="ml-auto w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {cart.totalItems}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          {user && (
            <div className="mb-3 px-3">
              <p className="text-sm font-medium text-white truncate">
                {user.name || user.email || 'User'}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.role || 'Member'}
              </p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <FiLogOut size={20} />
            Logout
          </button>
          <p className="mt-2 px-3 text-[10px] text-slate-500">v1.3.0 — DevSecOps Pipeline Active</p>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Navbar onToggleSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
