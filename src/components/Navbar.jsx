/**
 * Navbar.jsx - Top navigation bar displayed across all pages.
 * Shows the application title and a hamburger menu toggle for mobile.
 */
import { HiOutlineMenuAlt2 } from 'react-icons/hi';
import { FiZap } from 'react-icons/fi';

const Navbar = ({ onToggleSidebar }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 px-4 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30">
      {/* Mobile menu toggle button */}
      <button
        onClick={onToggleSidebar}
        className="lg:hidden p-2 rounded-md hover:bg-emerald-50 text-slate-600"
        aria-label="Toggle sidebar"
      >
        <HiOutlineMenuAlt2 size={24} />
      </button>

      {/* App title with icon */}
      <div className="flex items-center gap-2">
        <FiZap className="text-emerald-600" size={24} />
        <h1 className="text-lg font-semibold text-slate-800">
          Order Processing & Management
        </h1>
      </div>

      {/* Spacer for right-side alignment (placeholder for future features like user menu) */}
      <div className="w-10" />
    </header>
  );
};

export default Navbar;
