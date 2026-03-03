import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const OrderTrackingStatus = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError('No order ID provided');
      setLoading(false);
      return;
    }

    console.log('🔥 Listening to order:', orderId);

    const unsubscribe = onSnapshot(
      doc(db, 'orders', orderId),
      (docSnap) => {
        if (docSnap.exists()) {
          const orderData = { id: docSnap.id, ...docSnap.data() };
          console.log('📦 Order data received:', orderData);
          setOrder(orderData);
          setLoading(false);
          
          // Auto-show review modal when delivered and not reviewed
          if (orderData.status === 'delivered' && !orderData.reviewed) {
            setTimeout(() => setShowReviewModal(true), 1000);
          }
        } else {
          setError('Order not found');
          setLoading(false);
        }
      },
      (error) => {
        console.error('❌ Error fetching order:', error);
        setError('Failed to load order');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orderId]);

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert('Please select a rating!');
      return;
    }

    setSubmittingReview(true);

    try {
      // Save review to 'reviews' collection
      await addDoc(collection(db, 'reviews'), {
        orderId: order.id,
        restaurantId: order.restaurantId,
        restaurantName: order.restaurantName,
        userId: user?.uid || 'anonymous',
        customerName: order.customerName,
        rating: rating,
        review: reviewText,
        createdAt: new Date().toISOString()
      });

      // Mark order as reviewed
      await updateDoc(doc(db, 'orders', order.id), {
        reviewed: true,
        reviewRating: rating,
        reviewText: reviewText
      });

      alert('✅ Thank you for your review!');
      setShowReviewModal(false);
      setRating(0);
      setReviewText('');
    } catch (error) {
      console.error('❌ Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    return steps.indexOf(status);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Pending';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const generateTimeline = (currentStatus, createdAt, updatedAt) => {
    const timeline = [
      {
        status: 'pending',
        label: 'Order Created',
        description: 'Your order has been successfully placed',
        timestamp: createdAt,
        completed: true
      },
      {
        status: 'confirmed',
        label: 'Confirmed',
        description: 'Restaurant has confirmed your order',
        timestamp: currentStatus !== 'pending' ? updatedAt : null,
        completed: getStatusStep(currentStatus) >= 1
      },
      {
        status: 'preparing',
        label: 'Preparing',
        description: 'Your meal is being prepared',
        timestamp: currentStatus === 'preparing' ? updatedAt : null,
        completed: getStatusStep(currentStatus) >= 2
      },
      {
        status: 'out_for_delivery',
        label: 'Out for Delivery',
        description: 'Your order is on the way',
        timestamp: currentStatus === 'out_for_delivery' ? updatedAt : null,
        completed: getStatusStep(currentStatus) >= 3
      },
      {
        status: 'delivered',
        label: 'Delivered',
        description: 'Order has been delivered',
        timestamp: currentStatus === 'delivered' ? updatedAt : null,
        completed: currentStatus === 'delivered'
      }
    ];

    return timeline;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            border: '4px solid #f3f4f6',
            borderTop: '4px solid #ed6e05ff',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px', padding: '2rem' }}>
          <span style={{ fontSize: '4rem' }}>❌</span>
          <h2 style={{ color: '#ef4444', marginTop: '1rem' }}>{error || 'Order not found'}</h2>
          <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
            Please check your order ID and try again
          </p>
          <button
            onClick={() => navigate('/orders-list')}
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#ed6e05ff',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  const currentStep = getStatusStep(order.status || 'pending');
  const timeline = generateTimeline(order.status, order.createdAt, order.updatedAt);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '3rem 1.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
            <div>
              <h1 style={{ fontSize: '1.875rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                <span style={{ color: '#000000' }}>Hi </span>
                <span style={{ color: '#ed6e05ff' }}>{order.customerName || 'Customer'},</span>
              </h1>
              <p style={{ color: '#6b7280', margin: 0 }}>Here's the latest update on your order</p>
            </div>
            <button
              onClick={() => navigate('/orders-list')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.5rem 1rem',
                border: '2px solid #ed6e05ff',
                backgroundColor: 'white',
                color: '#ed6e05ff',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500'
              }}
            >
              ← My Orders
            </button>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          marginBottom: '1.5rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>Order Status</h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>Order #{order.id.substring(0, 8)}</p>
            </div>
            <span style={{
              backgroundColor: 
                order.status === 'delivered' ? '#d1fae5' : 
                order.status === 'cancelled' ? '#fee2e2' : 
                order.status === 'out_for_delivery' ? '#dbeafe' :
                '#fef3c7',
              color: 
                order.status === 'delivered' ? '#065f46' : 
                order.status === 'cancelled' ? '#991b1b' : 
                order.status === 'out_for_delivery' ? '#1e40af' :
                '#92400e',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontWeight: '600',
              fontSize: '0.875rem'
            }}>
              {order.status === 'out_for_delivery' ? 'Out for Delivery' : 
               order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
            </span>
          </div>

          {order.status !== 'cancelled' && (
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  top: '20px',
                  left: '5%',
                  right: '5%',
                  height: '3px',
                  backgroundColor: '#e5e7eb',
                  zIndex: 0
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: '#ed6e05ff',
                    width: `${(currentStep / 4) * 100}%`,
                    transition: 'width 0.3s ease'
                  }} />
                </div>

                {[
                  { icon: '✓', label: 'Created', desc: 'Order placed' },
                  { icon: '📦', label: 'Confirmed', desc: 'Restaurant confirmed' },
                  { icon: '👨‍🍳', label: 'Preparing', desc: 'Being prepared' },
                  { icon: '✓', label: 'Delivered', desc: 'Order delivered' }
                ].map((step, index) => {
                  const isCompleted = index <= currentStep;
                  const isCurrent = index === currentStep;
                  
                  return (
                    <div key={index} style={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      flex: 1,
                      position: 'relative',
                      zIndex: 1
                    }}>
                      <div style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '50%',
                        backgroundColor: isCompleted ? '#ed6e05ff' : '#e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '0.75rem',
                        fontSize: '1.25rem',
                        color: isCompleted ? '#ffffff' : '#6b7280',
                        boxShadow: isCurrent ? '0 0 0 4px rgba(237, 110, 5, 0.2)' : 'none',
                        transition: 'all 0.3s ease'
                      }}>
                        {isCompleted ? '✓' : step.icon}
                      </div>
                      <p style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: isCompleted ? '#ed6e05ff' : '#9ca3af',
                        margin: '0 0 0.25rem 0',
                        textAlign: 'center'
                      }}>
                        {step.label}
                      </p>
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        margin: 0,
                        textAlign: 'center'
                      }}>
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {order.status === 'delivered' && (
            <div style={{
              marginTop: '2rem',
              padding: '1.5rem',
              backgroundColor: '#f0fdf4',
              borderRadius: '0.75rem',
              border: '2px solid #86efac',
              textAlign: 'center'
            }}>
              <span style={{ fontSize: '3rem', marginBottom: '0.5rem', display: 'block' }}>🎉</span>
              <h3 style={{ color: '#166534', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
                Order Delivered Successfully!
              </h3>
              <p style={{ color: '#15803d', fontSize: '0.875rem', margin: '0 0 1rem 0' }}>
                We hope you enjoyed your meal!
              </p>
              {!order.reviewed && (
                <button
                  onClick={() => setShowReviewModal(true)}
                  style={{
                    padding: '0.75rem 2rem',
                    backgroundColor: '#ed6e05ff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  ⭐ Rate Your Experience
                </button>
              )}
              {order.reviewed && (
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '0.5rem',
                  marginTop: '1rem'
                }}>
                  <p style={{ color: '#15803d', fontWeight: '600', margin: 0 }}>
                    ✅ Thank you for your review!
                  </p>
                  <div style={{ marginTop: '0.5rem' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} style={{ fontSize: '1.25rem', color: star <= order.reviewRating ? '#fbbf24' : '#d1d5db' }}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {order.status === 'cancelled' && (
            <div style={{
              backgroundColor: '#fee2e2',
              padding: '1rem',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.5rem' }}>❌</span>
              <div>
                <p style={{ color: '#991b1b', fontWeight: '600', margin: 0 }}>Order Cancelled</p>
                <p style={{ color: '#b91c1c', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
                  This order has been cancelled.
                </p>
              </div>
            </div>
          )}
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 1.5rem 0' }}>Order Timeline</h2>
          
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '16px',
              top: '30px',
              bottom: '30px',
              width: '2px',
              backgroundColor: '#e5e7eb'
            }} />

            {timeline.map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: index === timeline.length - 1 ? 0 : '2rem',
                position: 'relative'
              }}>
                <div style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  backgroundColor: item.completed ? '#10b981' : '#f3f4f6',
                  border: item.completed ? 'none' : '2px solid #e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  zIndex: 1
                }}>
                  {item.completed ? (
                    <span style={{ color: 'white', fontSize: '1.125rem' }}>✓</span>
                  ) : (
                    <div style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      backgroundColor: '#d1d5db'
                    }} />
                  )}
                </div>
                
                <div style={{ flex: 1, paddingTop: '0.125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: item.completed ? '#111827' : '#9ca3af',
                        margin: '0 0 0.25rem 0'
                      }}>
                        {item.label}
                      </h3>
                      <p style={{
                        fontSize: '0.875rem',
                        color: item.completed ? '#6b7280' : '#d1d5db',
                        margin: 0
                      }}>
                        {item.description}
                      </p>
                    </div>
                    {item.timestamp && (
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#9ca3af',
                        whiteSpace: 'nowrap'
                      }}>
                        {formatDate(item.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '1rem',
            maxWidth: '500px',
            width: '100%',
            padding: '2rem',
            position: 'relative',
            animation: 'slideIn 0.3s ease'
          }}>
            <button
              onClick={() => setShowReviewModal(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#6b7280',
                width: '30px',
                height: '30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '3rem', display: 'block', marginBottom: '0.5rem' }}>⭐</span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0 0 0.5rem 0' }}>
                Rate Your Experience
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                {order.restaurantName}
              </p>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <p style={{ color: '#374151', fontWeight: '500', marginBottom: '1rem' }}>
                How was your food?
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '2.5rem',
                      cursor: 'pointer',
                      color: star <= (hoverRating || rating) ? '#fbbf24' : '#d1d5db',
                      transition: 'all 0.2s ease',
                      transform: star <= (hoverRating || rating) ? 'scale(1.1)' : 'scale(1)'
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                color: '#374151',
                fontWeight: '500',
                marginBottom: '0.5rem'
              }}>
                Share your experience (optional)
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tell us what you loved or what we could improve..."
                rows="4"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setShowReviewModal(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  backgroundColor: 'white',
                  color: '#6b7280',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Skip
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={submittingReview || rating === 0}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  backgroundColor: rating === 0 ? '#d1d5db' : '#ed6e05ff',
                  color: 'white',
                  borderRadius: '0.5rem',
                  cursor: rating === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer/>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default OrderTrackingStatus;