import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, Navigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Video, BarChart3, Settings, LogOut, Globe, Heart, Menu, X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Admin.css';

export default function AdminLayout() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // If not logged in, redirect directly to admin login
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    setIsMobileMenuOpen(false);
    logout();
    navigate('/');
  };

  const closeMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="admin-wrapper">
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="admin-sidebar-backdrop" 
          onClick={closeMenu} 
          aria-hidden="true"
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <div className="brand-badge-mini">
              <Heart size={16} fill="#ffffff" color="#ffffff" />
            </div>
            <div>
              <h3>Graced Admin</h3>
              <span className="role-badge">Content Manager</span>
            </div>
          </div>

          {/* Close X Button in Mobile Sidebar Drawer */}
          <button 
            className="sidebar-close-btn" 
            onClick={closeMenu} 
            aria-label="Close admin menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink 
            to="/admin" 
            end 
            onClick={closeMenu}
            className={({ isActive }) => isActive ? 'side-item active' : 'side-item'}
          >
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </NavLink>

          <NavLink 
            to="/admin/posts" 
            onClick={closeMenu}
            className={({ isActive }) => isActive ? 'side-item active' : 'side-item'}
          >
            <BookOpen size={18} />
            <span>Word for the Day</span>
          </NavLink>

          <NavLink 
            to="/admin/videos" 
            onClick={closeMenu}
            className={({ isActive }) => isActive ? 'side-item active' : 'side-item'}
          >
            <Video size={18} />
            <span>YouTube Videos</span>
          </NavLink>

          <NavLink 
            to="/admin/promo-studio" 
            onClick={closeMenu}
            className={({ isActive }) => isActive ? 'side-item active' : 'side-item'}
          >
            <Sparkles size={18} />
            <span>Daily Graphics Studio</span>
          </NavLink>

          <NavLink 
            to="/admin/analytics" 
            onClick={closeMenu}
            className={({ isActive }) => isActive ? 'side-item active' : 'side-item'}
          >
            <BarChart3 size={18} />
            <span>Analytics & Insights</span>
          </NavLink>

          <NavLink 
            to="/admin/settings" 
            onClick={closeMenu}
            className={({ isActive }) => isActive ? 'side-item active' : 'side-item'}
          >
            <Settings size={18} />
            <span>Site Settings</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <Link to="/" onClick={closeMenu} className="public-site-link">
            <Globe size={16} />
            <span>View Public Website</span>
          </Link>

          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="admin-main">
        <header className="admin-topbar">
          <div className="topbar-left">
            {/* Hamburger Toggle Button for Mobile / Small Screens */}
            <button 
              className="admin-menu-toggle" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="dashboard-title">Graced Relationship Recipes — Control Centre</span>
          </div>
          <div className="topbar-right">
            <div className="admin-user-pill">
              <span className="user-dot"></span>
              <span className="user-name">{user?.email || 'Administrator'}</span>
            </div>
          </div>
        </header>

        <div className="admin-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
