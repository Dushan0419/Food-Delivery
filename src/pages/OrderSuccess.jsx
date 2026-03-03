import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/OrderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { orderCount = 1, totalAmount = 0 } = location.state || {};

  return (
    <div className="order-success-page">
      <div className="success-container">
        <div className="success-icon">✓</div>
        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-message">
          Your order has been placed successfully and sent to the restaurant(s).
        </p>

        <div className="success-details">
          <div className="detail-item">
            <span className="detail-label">Orders Placed:</span>
            <span className="detail-value">{orderCount}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Total Paid:</span>
            <span className="detail-value">LKR{totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="success-actions">
          <button 
            className="btn-primary"
            onClick={() => navigate('/order')}
          >
            Order More Food
          </button>
          <button 
            className="btn-secondary"
            onClick={() => navigate('/')}
          >
            Go to Home
          </button>
        </div>

        <p className="success-note">
          📧 You will receive order confirmation via email shortly.
        </p>
      </div>
    </div>
  );
};

export default OrderSuccess;