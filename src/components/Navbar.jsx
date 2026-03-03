import React from 'react';
import '../styles/Navbar.css';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="logo">
        <div className="logo">
          <span className="logo-icon">🌟</span>
          <span className="logo-text">Order<span className="logo-highlight">.UK</span></span>
        </div>
        </Link>
        
        
        {/* Navigation Menu */}
        <nav className="nav-menu">
          <a href="/" className="nav-link">Home</a>
          <a href="/admindashboard" className="nav-link">Profile</a>
          <a href="/restaurants" className="nav-link">Resturants</a>
          <a href="/order" className="nav-link">Order Food</a>
          <a href="/orders-list" className="nav-link">Track Order</a>
        </nav>

        {/* Right Side Actions */}
        <div className="nav-right">
          <button className="nav-icon-btn">
            <span className="icon">🔔</span>
          </button>
          <Link to="/login"><button className="btn-login">Login</button></Link>
          <Link to="/signup"><button className="btn-signup">Sign up</button></Link>
          
        </div>
      </div>
    </header>
  );
};

export default Navbar;