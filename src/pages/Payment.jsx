import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../styles/Payment.css';

const stripePromise = loadStripe('pk_test_51SMKt9D6jjomYf6c0hnwbodSeVg6OZHpMCWY1aq4xfhoPRAlRI6rEGlaUXLmkCgCrRyqp5aEHHafAeYdz8tm0xSf00dRl61qDj');

const CheckoutForm = ({ cartItems, totalAmount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [cardholderName, setCardholderName] = useState('');
  const [saveCard, setSaveCard] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!cardholderName.trim()) {
      setError('Please enter cardholder name');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      console.log('💳 Processing payment...');

      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: cardholderName,
          email: user?.email
        }
      });

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      console.log('✅ Payment Method Created:', paymentMethod.id);
      console.log('📦 Creating orders in Firestore...');

      // Group items by restaurant
      const ordersByRestaurant = {};
      
      cartItems.forEach(item => {
        const restId = item.restaurantId;
        if (!ordersByRestaurant[restId]) {
          ordersByRestaurant[restId] = {
            restaurantId: restId,
            restaurantName: item.restaurantName,
            items: []
          };
        }
        ordersByRestaurant[restId].items.push(item);
      });

      console.log('🔍 Orders grouped by restaurant:', ordersByRestaurant);

      // Create separate orders for each restaurant
      const orderPromises = Object.values(ordersByRestaurant).map(restaurantOrder => {
        const restaurantTotal = restaurantOrder.items.reduce(
          (sum, item) => sum + (item.price * item.quantity), 0
        );

        const orderData = {
          // ✅ CRITICAL: Restaurant info (this is what admins query by)
          restaurantId: restaurantOrder.restaurantId,
          restaurantName: restaurantOrder.restaurantName,
          
          // Customer info
          customerName: user?.displayName || user?.email,
          customerEmail: user?.email,
          customerId: user?.uid,
          
          // Order details
          items: restaurantOrder.items,
          totalAmount: restaurantTotal,
          
          // Payment info
          paymentMethod: paymentMethod.id,
          paymentStatus: 'paid',
          cardLast4: paymentMethod.card.last4,
          cardBrand: paymentMethod.card.brand,
          
          // Order status
          status: 'pending',
          
          // Timestamps (use ISO string for consistency)
          createdAt: new Date().toISOString(),
          paidAt: new Date().toISOString()
        };

        console.log('💾 Creating order:', orderData);
        return addDoc(collection(db, 'orders'), orderData);
      });

      const createdOrders = await Promise.all(orderPromises);
      console.log('✅ Orders created successfully! IDs:', createdOrders.map(doc => doc.id));

      setProcessing(false);
      alert('✅ Payment successful! Your order has been placed.');
      
      if (onSuccess) {
        onSuccess();
      }

      navigate('/order-success', {
        state: {
          orderCount: Object.keys(ordersByRestaurant).length,
          totalAmount: totalAmount
        }
      });

    } catch (err) {
      console.error('❌ Payment/Order error:', err);
      setError('Payment failed: ' + err.message);
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="payment-card-section">
        <div className="payment-card-header">
          <h3>💳 Add new card</h3>
          <div className="card-logos">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="card-logo" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/MasterCard_Logo.svg" alt="Mastercard" className="card-logo" />
          </div>
        </div>

        <div className="form-group">
          <label>Card owner *</label>
          <input
            type="text"
            placeholder="Enter the name on the card"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            required
            className="payment-input"
          />
        </div>

        <div className="form-group">
          <label>Card details *</label>
          <div className="card-element-wrapper">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#1F2937',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                  invalid: {
                    color: '#EF4444',
                  },
                },
              }}
            />
          </div>
        </div>

        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="saveCard"
            checked={saveCard}
            onChange={(e) => setSaveCard(e.target.checked)}
          />
          <label htmlFor="saveCard">Set as default</label>
        </div>

        {error && (
          <div className="payment-error">
            ⚠️ {error}
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={!stripe || processing}
        className="review-order-btn"
      >
        {processing ? (
          <>
            <span className="spinner-small"></span>
            Processing Payment...
          </>
        ) : (
          'Complete Payment'
        )}
      </button>
    </form>
  );
};

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { 
    cartItems = [], 
    total = 0, 
    subtotal = 0,
    discount = 0,
    delivery = 0 
  } = location.state || {};

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!cartItems || cartItems.length === 0) {
    navigate('/order');
    return null;
  }

  const handlePaymentSuccess = () => {
    console.log('✅ Payment and orders completed!');
  };

  return (
    <div className="payment-page">
      <div className="payment-container">
        <div className="progress-steps">
          <div className="step completed">
            <div className="step-circle">✓</div>
            <span className="step-label">Cart</span>
          </div>
          <div className="step-line completed"></div>
          
          <div className="step completed">
            <div className="step-circle">✓</div>
            <span className="step-label">Review</span>
          </div>
          <div className="step-line active"></div>
          
          <div className="step active">
            <div className="step-circle">3</div>
            <span className="step-label">Payment</span>
          </div>
          <div className="step-line"></div>
          
          <div className="step">
            <div className="step-circle">4</div>
            <span className="step-label">Confirm</span>
          </div>
        </div>

        <div className="payment-content">
          <div className="payment-left">
            <button className="back-button" onClick={() => navigate(-1)}>
              ← Back to Cart
            </button>

            <h2 className="payment-title">Payment Method</h2>
            <p className="payment-subtitle">Complete your payment to place the order</p>

            <Elements stripe={stripePromise}>
              <CheckoutForm
                cartItems={cartItems}
                totalAmount={total}
                onSuccess={handlePaymentSuccess}
              />
            </Elements>

            <div className="payment-security">
              <span>🔒</span>
              <p>Your payment information is encrypted and secure</p>
            </div>
          </div>

          <div className="payment-right">
            <div className="order-summary-card">
              <h3 className="summary-title">
                🛒 Order Summary
              </h3>

              <div className="summary-header">
                <span>Product</span>
                <span>Qty</span>
                <span>Price</span>
              </div>

              <div className="summary-items">
                {cartItems.map((item) => (
                  <div key={item.foodId} className="summary-item">
                    <div className="item-image-name">
                      <img 
                        src={item.imageUrl || 'https://via.placeholder.com/50'} 
                        alt={item.name}
                        className="summary-item-image"
                      />
                      <div className="item-text">
                        <span className="item-name">{item.name}</span>
                        <span className="item-restaurant">🏪 {item.restaurantName}</span>
                      </div>
                    </div>
                    <span className="item-portion">(x{item.quantity})</span>
                    <span className="item-price">LKR{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="summary-breakdown">
                <div className="breakdown-row">
                  <span>Subtotal:</span>
                  <span>LKR{subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="breakdown-row discount-row">
                    <span>Discount:</span>
                    <span>-LKR{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="breakdown-row">
                  <span>Delivery Fee:</span>
                  <span>LKR{delivery.toFixed(2)}</span>
                </div>
              </div>

              <div className="summary-total">
                <span>Total Amount:</span>
                <span className="total-amount">LKR{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;