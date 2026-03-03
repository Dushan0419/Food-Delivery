import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';

const MyOrdersList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) {
        navigate('/login');
        return;
      }

      try {
        // Simple query without orderBy to avoid index requirement
        const ordersQuery = query(
          collection(db, 'orders'),
          where('customerId', '==', user.uid)
        );

        const querySnapshot = await getDocs(ordersQuery);
        const ordersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Sort in JavaScript instead of Firestore
        ordersData.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });

        console.log('Fetched orders:', ordersData);
        setOrders(ordersData);
      } catch (error) {
        console.error('Error fetching orders:', error);
        alert('Error loading orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, navigate]);

  const getStatusColor = (status) => {
    const colors = {
      pending: { bg: '#fef3c7', text: '#92400e' },
      confirmed: { bg: '#dbeafe', text: '#1e40af' },
      preparing: { bg: '#fef3c7', text: '#92400e' },
      out_for_delivery: { bg: '#dbeafe', text: '#1e40af' },
      delivered: { bg: '#d1fae5', text: '#065f46' },
      cancelled: { bg: '#fee2e2', text: '#991b1b' }
    };
    return colors[status] || colors.pending;
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

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
          <p style={{ color: '#6b7280' }}>Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>My Orders</h1>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>Track and manage all your food orders</p>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'All Orders', count: orders.length },
            { value: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
            { value: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
            { value: 'preparing', label: 'Preparing', count: orders.filter(o => o.status === 'preparing').length },
            { value: 'out_for_delivery', label: 'On the Way', count: orders.filter(o => o.status === 'out_for_delivery').length },
            { value: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
            { value: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length }
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: filter === tab.value ? '#ed6e05ff' : 'white',
                color: filter === tab.value ? 'white' : '#6b7280',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                transition: 'all 0.2s'
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <span style={{ fontSize: '4rem' }}>📦</span>
            <h2 style={{ marginTop: '1rem', color: '#111827' }}>No orders found</h2>
            <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
              {filter === 'all' 
                ? "You haven't placed any orders yet. Start ordering delicious food!"
                : `No ${filter} orders found.`}
            </p>
            <button
              onClick={() => navigate('/order')}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 2rem',
                backgroundColor: '#ed6e05ff',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '1rem'
              }}
            >
              Browse Food
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredOrders.map(order => {
              const statusColor = getStatusColor(order.status);
              return (
                <div 
                  key={order.id} 
                  style={{
                    backgroundColor: 'white',
                    padding: '1.5rem',
                    borderRadius: '1rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>
                          Order #{order.id.substring(0, 8).toUpperCase()}
                        </h3>
                        <span style={{
                          backgroundColor: statusColor.bg,
                          color: statusColor.text,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '0.25rem',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textTransform: 'capitalize'
                        }}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                        📍 {order.restaurantName || 'Restaurant'}
                      </p>
                      <p style={{ color: '#9ca3af', fontSize: '0.875rem', margin: '0.25rem 0' }}>
                        🕒 {new Date(order.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', margin: 0 }}>
                        LKR {order.totalAmount?.toFixed(2) || '0.00'}
                      </p>
                      <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div style={{ 
                    marginBottom: '1rem', 
                    paddingTop: '1rem', 
                    borderTop: '1px solid #e5e7eb' 
                  }}>
                    {order.items?.slice(0, 2).map((item, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        marginBottom: '0.5rem',
                        color: '#6b7280',
                        fontSize: '0.875rem'
                      }}>
                        <span>{item.quantity}x {item.name}</span>
                        <span>LKR {(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.items?.length > 2 && (
                      <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                        +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                      onClick={() => navigate(`/order-status/${order.id}`)}
                      style={{
                        flex: 1,
                        padding: '0.75rem 1.5rem',
                        backgroundColor: '#ed6e05ff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        fontWeight: '500',
                        fontSize: '0.875rem'
                      }}
                    >
                      🔍 Track Order
                    </button>
                    {order.status === 'delivered' && (
                      <button
                        onClick={() => {/* Add reorder functionality */}}
                        style={{
                          padding: '0.75rem 1.5rem',
                          backgroundColor: 'white',
                          color: '#ed6e05ff',
                          border: '2px solid #ed6e05ff',
                          borderRadius: '0.5rem',
                          cursor: 'pointer',
                          fontWeight: '500',
                          fontSize: '0.875rem'
                        }}
                      >
                        🔄 Reorder
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};


export default MyOrdersList;