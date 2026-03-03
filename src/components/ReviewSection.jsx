import React from 'react';
import CountUp from 'react-countup';
import '../styles/Review.css';

const ReviewsSection = () => {
  const reviews = [
    {
      id: 1,
      text: "Ordering food has never been this simple. Fresh meals arrive on time, the interface is intuitive, and the exclusive offers make every order feel like a great deal.",
      name: "Sarah Thompson",
      username: "@sarah_thompson",
      bgColor: "#ffe4e1"
    },
    {
      id: 2,
      text: "This app made family dinners and gatherings effortless. With a variety of restaurant options and fast delivery, every meal arrives hot, fresh, and on schedule.",
      name: "David Martinez",
      username: "@david_martinez",
      bgColor: "#e8f5e9"
    },
    {
      id: 3,
      text: "I love the user-friendly design of this app. It saves me time, ensures accurate orders, and provides an enjoyable experience every time I order.",
      name: "Glenn Maxwell",
      username: "@maxii_glenn",
      bgColor: "#b2ebf2"
    }
  ];

  return (
    <section className="reviews-section">
      <div className="reviews-container">
        
        {/* Left Side - Rating */}
        <div className="reviews-left">
          <div className="rating-display">
            <h1 className="rating-number">4.9</h1>
            <div className="rating-stars-large">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="star-icon">⭐</span>
              ))}
            </div>
          </div>
          
          <div className="reviews-count-badge">
            <span className="reviews-count">
              <CountUp 
                start={0} 
                end={875} 
                duration={2} 
                separator="," 
              /> + <span className="reviews-label"> Reviews</span>
            </span>
            
          </div>
        </div>

        {/* Right Side - Header & Cards */}
        <div className="reviews-right">
          <h2 className="reviews-heading">
            Our<br />
            Customers<br />
            love us
          </h2>

          {/* Review Cards */}
          <div className="review-cards-grid">
            {reviews.map((review) => (
              <div 
                key={review.id} 
                className="review-card"
                style={{ backgroundColor: review.bgColor }}
              >
                <div className="quote-icon">"</div>
                
                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="star">⭐</span>
                  ))}
                </div>

                <p className="review-text">{review.text}</p>

                <div className="reviewer-info">
                  <p className="reviewer-name">{review.name}</p>
                  <p className="reviewer-username">{review.username}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default ReviewsSection;
