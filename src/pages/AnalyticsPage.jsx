import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import '../styles/Analytics.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/icons/LOGO 1.png';

const AnalyticsPage = ({ adminId }) => {
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
    topSellingFoods: [],
    revenueByDay: [],
    ordersByMonth: [],
    ordersByStatus: []
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month'); // week, month, year
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!adminId) return;
    fetchAnalytics();
  }, [adminId, timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('restaurantId', '==', adminId));
      const snapshot = await getDocs(q);

      const ordersList = [];
      let totalRevenue = 0;
      const foodSales = {};
      const revenueByDay = {};
      const ordersByMonth = {};
      const ordersByStatus = {
        pending: 0,
        confirmed: 0,
        preparing: 0,
        out_for_delivery: 0,
        delivered: 0,
        cancelled: 0
      };

      snapshot.forEach((doc) => {
        const data = doc.data();
        ordersList.push({ id: doc.id, ...data });

        // Calculate revenue
        const amount = parseFloat(data.totalAmount) || 0;
        totalRevenue += amount;

        // Count by status
        ordersByStatus[data.status] = (ordersByStatus[data.status] || 0) + 1;

        // Track food items sold
        if (data.items && Array.isArray(data.items)) {
          data.items.forEach((item) => {
            if (!foodSales[item.name]) {
              foodSales[item.name] = {
                name: item.name,
                quantity: 0,
                revenue: 0
              };
            }
            foodSales[item.name].quantity += item.quantity || 1;
            foodSales[item.name].revenue += (item.price || 0) * (item.quantity || 1);
          });
        }

        // Revenue by day
        const date = new Date(data.createdAt);
        const dayKey = date.toLocaleDateString();
        revenueByDay[dayKey] = (revenueByDay[dayKey] || 0) + amount;

        // Orders by month
        const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        ordersByMonth[monthKey] = (ordersByMonth[monthKey] || 0) + 1;
      });

      // Convert to arrays and sort
      const topSellingFoods = Object.values(foodSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);

      const revenueByDayArray = Object.entries(revenueByDay)
        .map(([date, revenue]) => ({ date, revenue }))
        .slice(-30); // Last 30 days

      const ordersByMonthArray = Object.entries(ordersByMonth)
        .map(([month, count]) => ({ month, orders: count }))
        .slice(-12); // Last 12 months

      const ordersByStatusArray = Object.entries(ordersByStatus)
        .map(([status, count]) => ({ 
          name: status.replace(/_/g, ' ').toUpperCase(), 
          value: count,
          color: getStatusColor(status)
        }));

      setAnalytics({
        totalOrders: ordersList.length,
        totalRevenue: totalRevenue.toFixed(2),
        averageOrderValue: ordersList.length > 0 ? (totalRevenue / ordersList.length).toFixed(2) : 0,
        topSellingFoods,
        revenueByDay: revenueByDayArray,
        ordersByMonth: ordersByMonthArray,
        ordersByStatus: ordersByStatusArray
      });

      setOrders(ordersList);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FFA500',
      confirmed: '#0EA5E9',
      preparing: '#8B5CF6',
      out_for_delivery: '#3B82F6',
      delivered: '#10B981',
      cancelled: '#EF4444'
    };
    return colors[status] || '#6B7280';
  };

  const exportToCSV = () => {
    const csvData = orders.map(order => ({
      'Order ID': order.id,
      'Customer': order.customerName,
      'Amount': order.totalAmount,
      'Status': order.status,
      'Date': new Date(order.createdAt).toLocaleString()
    }));

    const headers = Object.keys(csvData[0]);
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => row[h]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportTopFoodsToCSV = () => {
    const csvContent = [
      'Food Item,Quantity Sold,Revenue',
      ...analytics.topSellingFoods.map(food => 
        `${food.name},${food.quantity},LKR${food.revenue.toFixed(2)}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `top-selling-foods-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  /* ===================== PDF EXPORTS ===================== */

const exportOrdersPDF = () => {
  const doc = new jsPDF();

  // Logo
  doc.addImage(logo, 'PNG', 14, 10, 50, 13);

  doc.setFontSize(16);
  doc.text('Order.UK – Orders Report', 70, 20);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

  autoTable(doc, {
    startY: 40,
    head: [['Order ID', 'Customer', 'Amount (LKR)', 'Status', 'Date']],
    body: orders.map(order => [
      order.id,
      order.customerName || '-',
      order.totalAmount,
      order.status?.toUpperCase(),
      new Date(order.createdAt).toLocaleString()
    ]),
    headStyles: { fillColor: [255, 165, 0] }
  });

  doc.save(`orders-report-${new Date().toISOString().split('T')[0]}.pdf`);
};

const exportTopFoodsPDF = () => {
  const doc = new jsPDF();

  // Logo
  doc.addImage(logo, 'PNG', 14, 10, 50, 13);

  doc.setFontSize(16);
  doc.text('Order.UK – Top Selling Foods', 70, 20);

  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

  autoTable(doc, {
    startY: 40,
    head: [['Rank', 'Food Item', 'Quantity Sold', 'Revenue (LKR)']],
    body: analytics.topSellingFoods.map((food, index) => [
      index + 1,
      food.name,
      food.quantity,
      food.revenue.toFixed(2)
    ]),
    headStyles: { fillColor: [16, 185, 129] }
  });

  doc.save(`top-selling-foods-${new Date().toISOString().split('T')[0]}.pdf`);
};


  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics-page">
      <header className="analytics-header">
        <div className="header-left">
          <h1 className="page-title">📊 Analytics & Reports</h1>
          <p className="page-subtitle">Comprehensive insights into your restaurant performance</p>
        </div>
        <div className="header-right">
          <select 
            className="time-range-select"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="year">Last Year</option>
            <option value="all">All Time</option>
          </select>
           <button className="export-btn" onClick={exportOrdersPDF}>PDF Orders</button>
          <button className="export-btn" onClick={exportTopFoodsPDF}>PDF Foods</button>
        </div>
        
      </header>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon blue">📦</div>
          <div className="metric-details">
            <h3>{analytics.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon green">💰</div>
          <div className="metric-details">
            <h3>LKR {analytics.totalRevenue}</h3>
            <p>Total Revenue</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon orange">📊</div>
          <div className="metric-details">
            <h3>LKR {analytics.averageOrderValue}</h3>
            <p>Average Order Value</p>
          </div>
        </div>
        <div className="metric-card">
          <div className="metric-icon purple">🍕</div>
          <div className="metric-details">
            <h3>{analytics.topSellingFoods.length}</h3>
            <p>Food Items Sold</p>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="charts-row">
        <div className="chart-card">
          <h3 className="chart-title">Revenue Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value) => `LKR ${value}`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Orders by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.ordersByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {analytics.ordersByStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Foods */}
      <div className="top-foods-section">
        <h3 className="section-title">🏆 Top Selling Food Items</h3>
        <div className="top-foods-grid">
          {analytics.topSellingFoods.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">🍕</span>
              <p>No food sales data yet</p>
            </div>
          ) : (
            <table className="top-foods-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Food Item</th>
                  <th>Quantity Sold</th>
                  <th>Revenue</th>
                  <th>Performance</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topSellingFoods.map((food, index) => (
                  <tr key={food.name}>
                    <td>
                      <span className={`rank-badge rank-${index + 1}`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="food-name">{food.name}</td>
                    <td>{food.quantity} orders</td>
                    <td className="revenue">LKR {food.revenue.toFixed(2)}</td>
                    <td>
                      <div className="performance-bar">
                        <div 
                          className="performance-fill"
                          style={{ 
                            width: `${(food.quantity / analytics.topSellingFoods[0].quantity) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Monthly Orders Chart */}
      <div className="chart-card full-width">
        <h3 className="chart-title">Orders by Month</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analytics.ordersByMonth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="orders" fill="#0EA5E9" radius={[8, 8, 0, 0]} name="Total Orders" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsPage;