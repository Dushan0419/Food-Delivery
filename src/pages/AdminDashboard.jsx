import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import '../styles/AdminDashboard.css';
import { collection, query, onSnapshot, doc, updateDoc, where, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from '../context/AuthContext';
import AdminFoods from "../pages/AdminFoods";
import AdminOrderList from './AdminOrderList';
import AnalyticsPage from "../pages/AnalyticsPage";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [adminId, setAdminId] = useState(null);
  const [restaurantName, setRestaurantName] = useState("My Restaurant");

  const BASE_STATS = {
    totalOrders: 75,
    totalDelivered: 357,
    totalCancelled: 65,
    totalRevenue: 128
  };

  const menuItems = [
    { icon: '📊', name: 'Dashboard' },
    { icon: '📋', name: 'Order List' },
    { icon: '🍕', name: 'Foods' },
    { icon: '👥', name: 'Customer' },
    { icon: '📈', name: 'Analytics' },
    { icon: '📊', name: 'Reviews' }
  ];

  const [dashboardData, setDashboardData] = useState({
    stats: { ...BASE_STATS },
    pieChart: [
      { name: 'Delivered', value: 61, color: '#FC8A06' },
      { name: 'Pending', value: 25, color: '#0EA5E9' },
      { name: 'Cancelled', value: 14, color: '#EF4444' }
    ],
    customerGrowth: [
      { name: 'Jan', value: 75 },
      { name: 'Feb', value: 82 },
      { name: 'Mar', value: 68 },
      { name: 'Apr', value: 90 },
      { name: 'May', value: 78 },
      { name: 'Jun', value: 95 }
    ],
    chartOrder: [
      { month: 'Jan', orders: 820 },
      { month: 'Feb', orders: 750 },
      { month: 'Mar', orders: 680 },
      { month: 'Apr', orders: 920 },
      { month: 'May', orders: 850 },
      { month: 'Jun', orders: 780 },
      { month: 'Jul', orders: 890 }
    ],
    revenue: [
      { month: 'Jan', online: 300, offline: 250 },
      { month: 'Feb', online: 280, offline: 220 },
      { month: 'Mar', online: 350, offline: 280 },
      { month: 'Apr', online: 320, offline: 240 },
      { month: 'May', online: 380, offline: 290 },
      { month: 'Jun', online: 340, offline: 260 }
    ],
    customerMap: [
      { month: 'Jan', value: 850 },
      { month: 'Feb', value: 920 },
      { month: 'Mar', value: 780 },
      { month: 'Apr', value: 950 },
      { month: 'May', value: 880 },
      { month: 'Jun', value: 1020 }
    ],
    reviews: [] // Will be populated from Firebase
  });

  const [selectedMenu, setSelectedMenu] = useState('Dashboard');
  const [notifications, setNotifications] = useState(0);
  const [adminName, setAdminName] = useState("Admin");
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    const fetchAdminData = async () => {
      if (user) {
        setAdminId(user.uid);
        console.log("🧑‍💼 LOGGED IN ADMIN UID:", user.uid);
        console.log("📧 LOGGED IN ADMIN EMAIL:", user.email);

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setAdminName(userData.name || "Admin");
          setRestaurantName(userData.restaurantName || userData.name || "My Restaurant");
        }
      }
    };

    fetchAdminData();
  }, [user]);

  // Fetch Orders
  useEffect(() => {
    if (!adminId) {
      setLoading(false);
      return;
    }

    console.log("🔥 Setting up Firestore listener for admin:", adminId);

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("restaurantId", "==", adminId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("📦 RAW DOCS found:", snapshot.docs.length);

        let fsOrders = 0;
        let fsDelivered = 0;
        let fsCancelled = 0;
        let fsPending = 0;
        let fsRevenue = 0;
        const orders = [];

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();

          orders.push({
            id: docSnap.id,
            ...data,
          });

          fsOrders++;

          if (data.status === "delivered") {
            fsDelivered++;
            fsRevenue += Number(data.totalAmount) || 0;
          } else if (data.status === "cancelled") {
            fsCancelled++;
          } else {
            fsPending++;
          }
        });

        orders.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });

        setRecentOrders(orders);
        setNotifications(fsPending);

        setDashboardData((prev) => ({
          ...prev,
          stats: {
            totalOrders: BASE_STATS.totalOrders + fsOrders,
            totalDelivered: BASE_STATS.totalDelivered + fsDelivered,
            totalCancelled: BASE_STATS.totalCancelled + fsCancelled,
            totalRevenue: (BASE_STATS.totalRevenue + fsRevenue).toFixed(2),
          },
        }));

        setLoading(false);
      },
      (error) => {
        console.error("❌ Firestore Error:", error);
        console.error("Error code:", error.code);
        console.error("Error message:", error.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [adminId]);

  // 🆕 Fetch Reviews for this Restaurant
  useEffect(() => {
    if (!adminId) return;

    console.log("⭐ Setting up reviews listener for restaurant:", adminId);

    const reviewsRef = collection(db, "reviews");
    const q = query(
      reviewsRef,
      where("restaurantId", "==", adminId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log("📝 Reviews found:", snapshot.docs.length);

        const reviewsList = [];
        let totalRating = 0;

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          reviewsList.push({
            id: docSnap.id,
            ...data
          });
          totalRating += data.rating || 0;
        });

        // Sort by newest first
        reviewsList.sort((a, b) => {
          const dateA = new Date(a.createdAt || 0);
          const dateB = new Date(b.createdAt || 0);
          return dateB - dateA;
        });

        // Calculate average rating
        const avgRating = reviewsList.length > 0 
          ? (totalRating / reviewsList.length).toFixed(1) 
          : 0;

        setTotalReviews(reviewsList.length);
        setAverageRating(avgRating);

        setDashboardData((prev) => ({
          ...prev,
          reviews: reviewsList
        }));

        console.log("✅ Reviews loaded:", reviewsList);
      },
      (error) => {
        console.error("❌ Error fetching reviews:", error);
      }
    );

    return () => unsubscribe();
  }, [adminId]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });
      alert(`Order status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update order status: " + error.message);
    }
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    return (
      <div className="star-rating">
        {[...Array(fullStars)].map((_, i) => (
          <span key={i} className="star-filled">★</span>
        ))}
        {hasHalfStar && <span className="star-half">⯨</span>}
        {[...Array(5 - Math.ceil(rating))].map((_, i) => (
          <span key={`empty-${i}`} className="star-empty">★</span>
        ))}
        <span className="rating-value">{rating}</span>
      </div>
    );
  };

  const formatReviewDate = (dateString) => {
    if (!dateString) return 'Recently';
    
    const reviewDate = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - reviewDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return reviewDate.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="logo">{restaurantName}</h2>
          <p className="logo-subtitle">Restaurant Admin Panel</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div
              key={item.name}
              onClick={() => setSelectedMenu(item.name)}
              className={`nav-item ${selectedMenu === item.name ? "active" : ""}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {item.name}
            </div>
          ))}
        </nav>

        <div className="promo-card">
          <div className="promo-bg-circle"></div>
          <div className="promo-content">
            <h4 className="promo-title">Upgrade Restaurant Order</h4>
            <p className="promo-text">Get premium features for better management</p>
            <button className="promo-btn">Learn More</button>
          </div>
          <img
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=100&h=100&fit=crop"
            alt="Promo"
            className="promo-image"
          />
        </div>
      </aside>

      <main className="dashboard-main">
        {selectedMenu === "Foods" && <AdminFoods adminId={adminId} />}
        {selectedMenu === "Order List" && <AdminOrderList adminId={adminId} />}
        {selectedMenu === "Analytics" && <AnalyticsPage adminId={adminId} />}

        {selectedMenu === "Dashboard" && (
          <>
            <header className="dashboard-header">
              <div className="header-left">
                <h1 className="page-title">Dashboard - {restaurantName}</h1>
                <p className="page-subtitle">Hi, {adminName}. Welcome back!</p>
              </div>
              <div className="header-right">
                <div className="header-icons">
                  <div className="icon-btn">
                    <span>🔍</span>
                  </div>
                  <div className="icon-btn notification-btn">
                    <span>🔔</span>
                    {notifications > 0 && <span className="notification-badge">{notifications}</span>}
                  </div>
                  <div className="icon-btn">
                    <span>✉️</span>
                  </div>
                  <div className="icon-btn">
                    <span>❤️</span>
                  </div>
                </div>
                <div className="user-profile">
                  <img
                    src={`https://ui-avatars.com/api/?name=${adminName}&background=FC8A06&color=fff`}
                    alt="Admin"
                    className="user-avatar"
                  />
                  <span className="user-name">Hello, {adminName}</span>
                </div>
              </div>
            </header>

            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon green-icon">
                  <span>📦</span>
                </div>
                <div className="stat-details">
                  <h3 className="stat-number">{dashboardData.stats.totalOrders}</h3>
                  <p className="stat-label">Total Orders</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange-icon">
                  <span>✅</span>
                </div>
                <div className="stat-details">
                  <h3 className="stat-number">{dashboardData.stats.totalDelivered}</h3>
                  <p className="stat-label">Total Delivered</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon blue-icon">
                  <span>❌</span>
                </div>
                <div className="stat-details">
                  <h3 className="stat-number">{dashboardData.stats.totalCancelled}</h3>
                  <p className="stat-label">Total Cancelled</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon red-icon">
                  <span>💰</span>
                </div>
                <div className="stat-details">
                  <h3 className="stat-number">LKR{dashboardData.stats.totalRevenue}</h3>
                  <p className="stat-label">Total Revenue</p>
                </div>
              </div>
            </div>

            <div className="orders-table-section">
              <h3 className="section-title">My Recent Orders</h3>
              {recentOrders.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">📦</span>
                  <p>No orders yet for your restaurant</p>
                  <small>Orders from customers will appear here in real-time</small>
                </div>
              ) : (
                <div className="table-container">
                  <table className="orders-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr key={order.id}>
                          <td>#{order.id.substring(0, 8)}</td>
                          <td>{order.customerName || "N/A"}</td>
                          <td>LKR{parseFloat(order.totalAmount || 0).toFixed(2)}</td>
                          <td>
                            <span className={`status-badge status-${order.status || "pending"}`}>
                              {order.status || "pending"}
                            </span>
                          </td>
                          <td>{order.createdAt ? new Date(order.createdAt).toLocaleString() : "N/A"}</td>
                          <td>
                            <select
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                              value={order.status || "pending"}
                              className="status-dropdown"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="preparing">Preparing</option>
                              <option value="out_for_delivery">Out for Delivery</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="charts-row">
              <div className="chart-card pie-chart-card">
                <h3 className="chart-title">Order Status Distribution</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={dashboardData.pieChart}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dashboardData.pieChart.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pie-legend">
                  {dashboardData.pieChart.map((item) => (
                    <div key={item.name} className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: item.color }}></span>
                      <span className="legend-label">{item.name}</span>
                      <span className="legend-value">{item.value}%</span>
                    </div>
                  ))}
                </div>
                <p className="chart-subtitle">My Restaurant Orders</p>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">Customer Growth</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={dashboardData.customerGrowth}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      fill="#10B981"
                    >
                      {dashboardData.customerGrowth.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 60}, 70%, 50%)`} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card chart-order-card">
                <h3 className="chart-title">Chart Order</h3>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={dashboardData.chartOrder}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Line type="monotone" dataKey="orders" stroke="#0EA5E9" strokeWidth={3} dot={{ fill: "#0EA5E9", r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="charts-row">
              <div className="chart-card revenue-card">
                <h3 className="chart-title">Total Revenue</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={dashboardData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="online" stroke="#0EA5E9" strokeWidth={2} name="Online Sales" />
                    <Line type="monotone" dataKey="offline" stroke="#EF4444" strokeWidth={2} name="Offline Sales" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-card customer-map-card">
                <h3 className="chart-title">Customer Map</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={dashboardData.customerMap}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="month" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {dashboardData.customerMap.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 50}, 70%, 50%)`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 🆕 REVIEWS SECTION WITH REAL DATA */}
            <div className="reviews-section">
              <div className="section-header">
                <div>
                  <h3 className="section-title">Customer Reviews</h3>
                  <p className="section-subtitle">
                    {totalReviews > 0 
                      ? `${totalReviews} reviews • Average rating: ${averageRating} ⭐` 
                      : 'No reviews yet'}
                  </p>
                </div>
              </div>

              {dashboardData.reviews.length === 0 ? (
                <div className="empty-state">
                  <span className="empty-icon">⭐</span>
                  <p>No reviews yet</p>
                  <small>Customer reviews will appear here after they rate your restaurant</small>
                </div>
              ) : (
                <div className="reviews-carousel">
                  <div className="reviews-grid">
                    {dashboardData.reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="review-card">
                        <div className="review-header">
                          <img 
                            src={`https://ui-avatars.com/api/?name=${review.customerName}&background=random&color=fff`}
                            alt={review.customerName} 
                            className="review-avatar" 
                          />
                          <div className="review-info">
                            <h4 className="review-name">{review.customerName}</h4>
                            {renderStars(review.rating)}
                          </div>
                        </div>
                        <p className="review-comment">
                          {review.review || 'Customer left a rating without comment'}
                        </p>
                        <div className="review-footer">
                          <span className="review-date">{formatReviewDate(review.createdAt)}</span>
                          <span className="review-order-id">Order #{review.orderId?.substring(0, 8)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* 🆕 DEDICATED REVIEWS PAGE */}
        {selectedMenu === "Reviews" && (
          <div className="reviews-page">
            <header className="page-header">
              <h1 className="page-title">Customer Reviews</h1>
              <div className="reviews-stats">
                <div className="stat-box">
                  <h3>{totalReviews}</h3>
                  <p>Total Reviews</p>
                </div>
                <div className="stat-box">
                  <h3>{averageRating} ⭐</h3>
                  <p>Average Rating</p>
                </div>
              </div>
            </header>

            {dashboardData.reviews.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">⭐</span>
                <p>No reviews yet</p>
                <small>Customer reviews will appear here after they rate your restaurant</small>
              </div>
            ) : (
              <div className="reviews-list">
                {dashboardData.reviews.map((review) => (
                  <div key={review.id} className="review-card-full">
                    <div className="review-header">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${review.customerName}&background=random&color=fff`}
                        alt={review.customerName} 
                        className="review-avatar" 
                      />
                      <div className="review-info">
                        <h4 className="review-name">{review.customerName}</h4>
                        {renderStars(review.rating)}
                        <p className="review-meta">
                          {formatReviewDate(review.createdAt)} • Order #{review.orderId?.substring(0, 8)}
                        </p>
                      </div>
                    </div>
                    <p className="review-comment">
                      {review.review || 'Customer left a rating without comment'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;