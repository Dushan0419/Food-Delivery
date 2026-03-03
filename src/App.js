import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import FlashDeals from './components/FlashDeals';
import Login from './pages/Login';
import Signup from './pages/Signup';

import { AuthProvider } from './context/AuthContext';
import ReviewsSection from './components/ReviewSection';
import Footer from './components/Footer';
import AppPartner from './components/AppPartner';
import RestaurantPage from './pages/RestaurantPage';
import Order from './pages/Order';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from "./Auth/AdminRoute";
import UserProfile from './pages/UserProfile';
import Payment from './pages/Payment';
import OrderSuccess from './pages/OrderSuccess';
import OrderTrackingStatus from './pages/OrderTrackingStatus';
import MyOrdersList from './pages/MyOrdersList';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />

        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <FlashDeals />
                <AppPartner />
                <ReviewsSection />
                <Footer />
              </>
            }
          />

          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/restaurants" element={<RestaurantPage />} />
          <Route path="/order" element={<Order />} />
          <Route path="/admindashboard" element={<AdminRoute> <AdminDashboard /> </AdminRoute>}/>
          <Route path="/dashboard" element={<UserProfile />} /> 
          <Route path="/payment" element={<Payment />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          
          {/* FIXED: Swapped these two routes */}
          <Route path="/orders-list" element={<MyOrdersList />} />
          <Route path="/order-status/:orderId" element={<OrderTrackingStatus />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;