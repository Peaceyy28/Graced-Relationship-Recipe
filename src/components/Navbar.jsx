import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Menu, X, Heart, Flame } from 'lucide-react';
import { useStreak } from '../context/StreakContext';
import './Navbar.css';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { streak } = useStreak();

  function toggleMenu() {
    setIsOpen(!isOpen);
  }

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <header className="navbar-header">
      <nav className="navbar">
        {/* Brand Logo */}
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <span className="brand-icon">
            <Heart size={20} fill="#ffffff" color="#ffffff" />
          </span>
          <span className="brand-text">Graced Relationship Recipes</span>
        </Link>

        {/* Mobile Hamburger Toggle Button */}
        <button 
          className="nav-toggle" 
          onClick={toggleMenu} 
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Navigation Links */}
        <div className={`nav-menu ${isOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li>
              <NavLink 
                to="/" 
                end
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={closeMenu}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/word-for-the-day" 
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={closeMenu}
              >
                Word for the Day
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/daily-exercise" 
                className={({ isActive }) => isActive ? 'nav-item active exercise-nav-link' : 'nav-item exercise-nav-link'}
                onClick={closeMenu}
              >
                <span>Daily Exercise</span>
                {streak > 0 ? (
                  <span className="nav-streak-pill">
                    <Flame size={12} />
                    {streak}
                  </span>
                ) : (
                  <span className="nav-new-pill">Daily</span>
                )}
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/videos" 
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={closeMenu}
              >
                Videos
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/about" 
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={closeMenu}
              >
                About
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/contact" 
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
                onClick={closeMenu}
              >
                Contact
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
