import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminOrderList.css';

const AdminOrderList = ({ adminId: propAdminId }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const adminId = propAdminId || user?.uid;

  // Fetch orders for this restaurant
  useEffect(() => {
    if (!adminId) {
      console.log("⚠️ No adminId found");
      setLoading(false);
      return;
    }

    console.log("👤 Fetching orders for restaurant:", adminId);
    
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef, 
      where('restaurantId', '==', adminId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("📦 Raw documents found:", snapshot.docs.length);
      
      const ordersList = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log("📝 Order document:", {
          id: doc.id,
          restaurantId: data.restaurantId,
          customerName: data.customerName,
          status: data.status,
          createdAt: data.createdAt
        });
        
        return {
          id: doc.id,
          ...data
        };
      });
      
      ordersList.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0);
        const dateB = new Date(b.createdAt || 0);
        return dateB - dateA;
      });
      
      console.log("✅ Orders after sorting:", ordersList.length);
      setOrders(ordersList);
      setLoading(false);
    }, (error) => {
      console.error("❌ Error fetching orders:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminId]);

  // Handler functions
  const handleEditClick = (order) => {
    setSelectedOrder(order);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (order) => {
    setSelectedOrder(order);
    setDeleteModalOpen(true);
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;

    try {
      await deleteDoc(doc(db, 'orders', selectedOrder.id));
      alert('Order deleted successfully!');
      setDeleteModalOpen(false);
      setSelectedOrder(null);
    } catch (error) {
      console.error('Error deleting order:', error);
      alert('Error deleting order: ' + error.message);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
      alert(`Order status updated to ${newStatus}!`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status: ' + error.message);
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#0EA5E9';
      case 'preparing': return '#8B5CF6';
      case 'out_for_delivery': return '#3B82F6';
      case 'delivered': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatStatus = (status) => {
    if (!status) return 'Pending';
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    preparing: orders.filter(o => o.status === 'preparing').length,
    outForDelivery: orders.filter(o => o.status === 'out_for_delivery').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalRevenue: orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0)
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="admin-orders-container">
      <div className="orders-header">
        <div>
          <h1 className="orders-title">Order List</h1>
          <p className="orders-subtitle">Manage customer orders in real-time</p>
        </div>
      </div>

      <div className="orders-stats">
        <div className="stat-card-order">
          <span className="stat-icon-order">📦</span>
          <div>
            <h3>{stats.total}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        
        <div className="stat-card-order">
          <span className="stat-icon-order">⏳</span>
          <div>
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>

        <div className="stat-card-order">
          <span className="stat-icon-order">✅</span>
          <div>
            <h3>{stats.delivered}</h3>
            <p>Delivered</p>
          </div>
        </div>

        <div className="stat-card-order">
          <span className="stat-icon-order">💰</span>
          <div>
            <h3>LKR {stats.totalRevenue.toFixed(2)}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="orders-filter">
        <button 
          className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
          onClick={() => setFilterStatus('all')}
        >
          All Orders ({stats.total})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
          onClick={() => setFilterStatus('pending')}
        >
          Pending ({stats.pending})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
          onClick={() => setFilterStatus('confirmed')}
        >
          Confirmed ({stats.confirmed})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'preparing' ? 'active' : ''}`}
          onClick={() => setFilterStatus('preparing')}
        >
          Preparing ({stats.preparing})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'delivered' ? 'active' : ''}`}
          onClick={() => setFilterStatus('delivered')}
        >
          Delivered ({stats.delivered})
        </button>
        <button 
          className={`filter-btn ${filterStatus === 'cancelled' ? 'active' : ''}`}
          onClick={() => setFilterStatus('cancelled')}
        >
          Cancelled ({stats.cancelled})
        </button>
      </div>

      <div className="orders-table-section">
        <h3 className="section-title">
          Recent Orders 
          {filterStatus !== 'all' && ` - ${formatStatus(filterStatus)}`}
        </h3>
        
        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <span className="empty-icon">📦</span>
            <h3>No orders yet for this restaurant</h3>
            <p>Orders from customers will appear here in real-time</p>
            <small style={{marginTop: '10px', color: '#9ca3af'}}>
              Listening for restaurantId: {adminId}
            </small>
          </div>
        ) : (
          <div className="table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer Name</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="order-id">#{order.id.substring(0, 8)}</td>
                    <td className="customer-name">
                      <div className="customer-info">
                        <div className="customer-avatar">
                          {(order.customerName || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="name">{order.customerName || 'Unknown'}</div>
                          <div className="email">{order.customerEmail || 'N/A'}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="order-items">
                        {order.items && order.items.length > 0 ? (
                          <>
                            <span className="item-count">{order.items.length} items</span>
                            <div className="item-details">
                              {order.items.map((item, idx) => (
                                <div key={idx}>{item.name} (x{item.quantity})</div>
                              ))}
                            </div>
                          </>
                        ) : (
                          <span>No items</span>
                        )}
                      </div>
                    </td>
                    <td className="amount">LKR {parseFloat(order.totalAmount || 0).toFixed(2)}</td>
                    <td>
                      <span 
                        className="status-badge-order"
                        style={{ backgroundColor: getStatusColor(order.status || 'pending') }}
                      >
                        {formatStatus(order.status || 'pending')}
                      </span>
                    </td>
                    <td className="date">
                      {order.createdAt 
                        ? new Date(order.createdAt).toLocaleString('en-US', {
                            month: 'numeric',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })
                        : 'N/A'
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <select
                          className="status-dropdown"
                          value={order.status || 'pending'}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          style={{ minWidth: '120px' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="preparing">Preparing</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        
                        <button
                          onClick={() => handleEditClick(order)}
                          style={{
                            padding: '6px 12px',
                            background: '#0EA5E9',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                          title="View Details"
                        >
                          👁️ View
                        </button>
                        
                        <button
                          onClick={() => handleDeleteClick(order)}
                          style={{
                            padding: '6px 12px',
                            background: '#EF4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                          title="Delete Order"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View/Edit Order Modal */}
      {editModalOpen && selectedOrder && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setEditModalOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{
              padding: '24px',
              borderBottom: '2px solid #F3F4F6',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #FC8A06 0%, #FFA500 100%)',
              borderRadius: '16px 16px 0 0'
            }}>
              <h2 style={{ margin: 0, fontSize: '24px', color: 'white' }}>
                📦 Order Details
              </h2>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  fontSize: '24px',
                  cursor: 'pointer',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <strong style={{ color: '#6B7280' }}>Order ID:</strong>
                <p style={{ margin: '4px 0', fontSize: '18px', fontWeight: '600' }}>
                  #{selectedOrder.id.substring(0, 8).toUpperCase()}
                </p>
              </div>

              <div style={{ 
                background: '#F9FAFB', 
                padding: '16px', 
                borderRadius: '12px',
                marginBottom: '20px'
              }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>👤 Customer Information</h3>
                <p style={{ margin: '4px 0' }}>
                  <strong>Name:</strong> {selectedOrder.customerName || 'N/A'}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Email:</strong> {selectedOrder.customerEmail || 'N/A'}
                </p>
                <p style={{ margin: '4px 0' }}>
                  <strong>Phone:</strong> {selectedOrder.customerPhone || 'N/A'}
                </p>
                {selectedOrder.deliveryAddress && (
                  <p style={{ margin: '4px 0' }}>
                    <strong>Address:</strong> {selectedOrder.deliveryAddress}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 12px 0', fontSize: '16px' }}>🍕 Order Items</h3>
                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                  selectedOrder.items.map((item, idx) => (
                    <div key={idx} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px',
                      background: '#F9FAFB',
                      borderRadius: '8px',
                      marginBottom: '8px'
                    }}>
                      <div>
                        <strong>{item.name}</strong>
                        <p style={{ margin: '4px 0', color: '#6B7280', fontSize: '14px' }}>
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <strong style={{ color: '#10B981' }}>
                          LKR {(item.price * item.quantity).toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: '#6B7280' }}>No items</p>
                )}
              </div>

              <div style={{
                background: '#10B981',
                color: 'white',
                padding: '16px',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <span style={{ fontSize: '18px', fontWeight: '600' }}>Total Amount:</span>
                <span style={{ fontSize: '24px', fontWeight: '700' }}>
                  LKR {parseFloat(selectedOrder.totalAmount || 0).toFixed(2)}
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <strong style={{ color: '#6B7280' }}>Status:</strong>
                <div style={{ marginTop: '8px' }}>
                  <span 
                    className="status-badge-order"
                    style={{ 
                      backgroundColor: getStatusColor(selectedOrder.status || 'pending'),
                      padding: '8px 16px',
                      fontSize: '14px'
                    }}
                  >
                    {formatStatus(selectedOrder.status || 'pending')}
                  </span>
                </div>
              </div>

              <div>
                <strong style={{ color: '#6B7280' }}>Order Date:</strong>
                <p style={{ margin: '4px 0' }}>
                  {selectedOrder.createdAt 
                    ? new Date(selectedOrder.createdAt).toLocaleString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })
                    : 'N/A'
                  }
                </p>
              </div>
            </div>

            <div style={{
              padding: '16px 24px',
              borderTop: '2px solid #F3F4F6',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setEditModalOpen(false)}
                style={{
                  padding: '12px 24px',
                  background: '#6B7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && selectedOrder && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setDeleteModalOpen(false)}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white',
              borderRadius: '16px',
              maxWidth: '450px',
              width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
            }}
          >
            <div style={{
              padding: '24px',
              borderBottom: '2px solid #F3F4F6',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>⚠️</div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', color: '#1F2937' }}>
                Delete Order?
              </h2>
              <p style={{ margin: 0, color: '#6B7280' }}>
                Are you sure you want to delete order <strong>#{selectedOrder.id.substring(0, 8).toUpperCase()}</strong>?
              </p>
              <p style={{ margin: '8px 0 0 0', color: '#EF4444', fontWeight: '600' }}>
                This action cannot be undone!
              </p>
            </div>

            <div style={{
              padding: '16px 24px',
              display: 'flex',
              gap: '12px'
            }}>
              <button
                onClick={() => setDeleteModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#F3F4F6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteOrder}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#EF4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderList;