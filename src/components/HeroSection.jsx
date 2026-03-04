import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HeroSection.css';
import mainImg from '../assets/icons/main-food.png';      // woman eating pizza
import secondaryImg from '../assets/icons/secondary-food.png'; // woman eating noodles


const Hero = () => {
  const [address, setAddress] = useState('');
  const [foodSearch, setFoodSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
  e.preventDefault();

  if (!foodSearch.trim()) return;

  navigate(`/order?search=${encodeURIComponent(foodSearch)}`);
};
  return (
    <section className="hero">
      <div className="hero-container">
        {/* Left Side - Content */}
        <div className="hero-left">
          {/* Delivery Badge */}
          <div className="delivery-badge">
            <span className="badge-icon">🏍️</span>
            <span className="badge-text">Delivery within 30 minutes</span>
          </div>

          {/* Main Heading */}
          <h1 className="hero-heading">
            Feast Your Senses,<br />
            <span className="heading-orange">Fast and Fresh</span>
          </h1>

          {/* Subheading */}
          <p className="hero-subtext">
            Enter your address and we will specify the offer for your area.
          </p>

          {/* Search Box */}
          <form className="search-box" onSubmit={handleSearch}>
            <div className="search-group">
              <span className="search-icon">📍</span>
              <input
                type="text"
                placeholder="Enter Your Address"
                className="search-input"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="search-divider"></div>

            <div className="search-group">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Find Food..."
                className="search-input"
                value={foodSearch}
                onChange={(e) => setFoodSearch(e.target.value)}
              />
            </div>

            <button type="submit" className="search-button">
              <span>🔍</span>
            </button>
          </form>
        </div>

        {/* Right Side - Image with Cards */}
              <div className="hero-right">
        {/* Orange curved background */}
        <div className="hero-bg-orange"></div>

        {/* Secondary image (behind) */}
        <img src={secondaryImg} alt="Secondary food" className="secondary-img" />

        {/* Main image */}
        <img src={mainImg} alt="Main food" className="main-img" />
        

            {/* Floating Card 1 - User Review */}
            <div className="float-card card-1">
              <img
                src="/images/user.jpg"
                alt="User"
                className="card-avatar"
                onError={(e) => {
                  e.target.src = 'https://i.pravatar.cc/50?img=1';
                }}
              />
              <div className="card-info">
                <p className="card-name">Sophia</p>
                <div className="card-stars">⭐⭐⭐⭐⭐</div>
              </div>
            </div>

            {/* Floating Card 2 - Notification */}
            <div className="float-card card-2">
              <div className="notification-dot"></div>
              <p className="notification-text">Your order is on the way</p>
            </div>

            {/* Floating Card 3 - Food Item */}
            <div className="float-card card-3">
              <img
                src="/images/noodles.jpg"
                alt="Food"
                className="card-food-img"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=80&h=80&fit=crop';
                }}
              />
              <div className="card-text">
                <p className="food-title">Chinese Noodles</p>
                <p className="food-subtitle">Restaurant</p>
              </div>
            </div>
          </div>
        </div>
      
    </section>
  );
};

export default Hero;
