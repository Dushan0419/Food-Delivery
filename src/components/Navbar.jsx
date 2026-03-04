import React, { useState } from 'react';
import '../styles/Navbar.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="logo" onClick={closeMenu}>
          <span className="logo-icon">🌟</span>
          <span className="logo-text">Order<span className="logo-highlight">.UK</span></span>
        </Link>
        
        {/* Hamburger Icon - Mobile Only */}
        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>
        
        {/* Navigation Menu */}
        <nav className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
          <Link to="/admindashboard" className="nav-link" onClick={closeMenu}>Profile</Link>
          <Link to="/restaurants" className="nav-link" onClick={closeMenu}>Restaurants</Link>
          <Link to="/order" className="nav-link" onClick={closeMenu}>Order Food</Link>
          <Link to="/orders-list" className="nav-link" onClick={closeMenu}>Track Order</Link>
          
          {/* Mobile Only - Buttons inside menu */}
          <div className="nav-menu-mobile-buttons">
            <Link to="/login" onClick={closeMenu}>
              <button className="btn-login">Login</button>
            </Link>
            <Link to="/signup" onClick={closeMenu}>
              <button className="btn-signup">Sign up</button>
            </Link>
          </div>
        </nav>

        {/* Right Side Actions - Desktop Only */}
        <div className="nav-right">
          <button className="nav-icon-btn" aria-label="Notifications">
            <span className="icon">🔔</span>
          </button>
          <Link to="/login">
            <button className="btn-login">Login</button>
          </Link>
          <Link to="/signup">
            <button className="btn-signup">Sign up</button>
          </Link>
        </div>
      </div>

      {/* Overlay for mobile menu */}
      {isMenuOpen && <div className="nav-overlay" onClick={closeMenu}></div>}
    </header>
  );
};

export default Navbar;
