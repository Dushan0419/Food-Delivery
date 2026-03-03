import React from 'react';
import '../styles/AppPartner.css';
import googleplay from '../assets/icons/googleplay.png';

const AppPartner = () => {
  return (
    <>
      {/* App Download Section */}
      <section className="app-download-section">
        <div className="app-download-container">
          {/* Left Side - Image */}
          <div className="app-download-left">
            <img
              src="/images/couple-phones.png"
              alt="Couple using phones"
              className="couple-image"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop';
              }}
            />
          </div>

          {/* Right Side - Content */}
          <div className="app-download-right">
            <div className="app-content">
              <h2 className="app-heading">
                Order<span className="heading-orange">i</span>ng is more
              </h2>
              <div className="app-subheading">
                <span className="subheading-orange">Personalised</span>
                <span className="subheading-white"> & Instant</span>
              </div>
              <p className="app-description">
                Download the Order.uk app for faster ordering
              </p>

              {/* App Store Badges */}
              <div className="app-badges">
                <a href="#" className="app-badge-link">
                  <img
                    src="/images/app-store.png"
                    alt="Download on App Store"
                    className="badge-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="badge-fallback apple-badge">
                    <span className="badge-icon"><i class="fa-brands fa-apple"></i></span>
                    <div className="badge-text">
                      <p className="badge-small">Download on the</p>
                      <p className="badge-large">App Store</p>
                    </div>
                  </div>
                </a>

                <a href="#" className="app-badge-link">
                  <img
                    src="/images/google-play.png"
                    alt="Get it on Google Play"
                    className="badge-img"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                  <div className="badge-fallback google-badge">
                    <span className="badge-icon"><i class="fa-brands fa-google-play"></i></span>
                    <div className="badge-text">
                      <p className="badge-small">GET IT ON</p>
                      <p className="badge-large">Google Play</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner & Rider Section */}
      <section className="partner-rider-section">
        <div className="partner-rider-container">
          {/* Partner Card */}
          <div className="partner-card">
            <div className="card-overlay">
              <div className="card-badge">Earn more with lower fees</div>
              <div className="card-content">
                <p className="card-label">Signup as a business</p>
                <h3 className="card-title">Partner with us</h3>
                <button className="card-button">Get Started</button>
              </div>
            </div>
            <img
              src="/images/chef-partner.jpg"
              alt="Partner with us"
              className="card-bg-image"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=600&h=400&fit=crop';
              }}
            />
          </div>

          {/* Rider Card */}
          <div className="rider-card">
            <div className="card-overlay">
              <div className="card-badge">Avail exclusive perks</div>
              <div className="card-content">
                <p className="card-label">Signup as a rider</p>
                <h3 className="card-title">Ride with us</h3>
                <button className="card-button">Get Started</button>
              </div>
            </div>
            <img
              src="/images/delivery-rider.jpg"
              alt="Ride with us"
              className="card-bg-image"
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1526367790999-0150786686a2?w=600&h=400&fit=crop';
              }}
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default AppPartner;