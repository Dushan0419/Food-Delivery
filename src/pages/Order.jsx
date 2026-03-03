import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/Footer';
import '../styles/Order.css';
import { useNavigate } from 'react-router-dom';


const OrderPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate()
  const [allFoods, setAllFoods] = useState([]);
  const [displayedFoods, setDisplayedFoods] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  
  // ✨ NEW: Track quantities for each food item
  const [quantities, setQuantities] = useState({});


  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const search = params.get('search');

    if (search) {
      setSearchQuery(search);
    }
  }, [location.search]);


  const categories = [
    'All', 'Pizzas', 'Garlic Bread', 'Rice & Curry', 'Breakfast', 
    'Salads', 'Cold drinks', 'Happy Meal®','Kottu', 'Desserts','Lunch','Fast Food',
    'Hot drinks','Soups', 'Dinner', 'Orbit®'
  ];

  // Fetch all available foods from all restaurants
  useEffect(() => {
    console.log("📦 Fetching all foods from restaurants...");
    
    const foodsRef = collection(db, 'foods');
    const q = query(foodsRef, where('availability', '==', true));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const foodsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`✅ Loaded ${foodsList.length} foods`);
      setAllFoods(foodsList);
      setDisplayedFoods(foodsList);
      setLoading(false);
      
      // Initialize quantities to 1 for all foods
      const initialQuantities = {};
      foodsList.forEach(food => {
        initialQuantities[food.id] = 1;
      });
      setQuantities(initialQuantities);
    }, (error) => {
      console.error("❌ Error fetching foods:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter foods by search query and category
  useEffect(() => {
    let filtered = allFoods;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(food => 
        food.category === selectedCategory || 
        food.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(food =>
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setDisplayedFoods(filtered);
  }, [searchQuery, selectedCategory, allFoods]);

  // ✨ NEW: Handle quantity change
  const handleQuantityChange = (foodId, value) => {
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 999) {
      setQuantities(prev => ({
        ...prev,
        [foodId]: numValue
      }));
    }
  };

  // ✨ NEW: Increment quantity
  const incrementQuantity = (foodId) => {
    setQuantities(prev => ({
      ...prev,
      [foodId]: Math.min((prev[foodId] || 1) + 1, 999)
    }));
  };

  // ✨ NEW: Decrement quantity
  const decrementQuantity = (foodId) => {
    setQuantities(prev => ({
      ...prev,
      [foodId]: Math.max((prev[foodId] || 1) - 1, 1)
    }));
  };

  // ✨ UPDATED: Add to cart with quantity
  const addToCart = (food) => {
    const quantity = quantities[food.id] || 1;
    
    // 🚫 Enforce single-restaurant cart
    if (
      cartItems.length > 0 &&
      cartItems[0].restaurantId !== food.restaurantId
    ) {
      alert("You can only order from one restaurant at a time.");
      return;
    }

    const existingItem = cartItems.find(item => item.foodId === food.id);

    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.foodId === food.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCartItems([
        ...cartItems,
        {
          foodId: food.id,
          name: food.name,
          price: food.price,
          quantity: quantity,
          restaurantId: food.restaurantId,
          restaurantName: food.restaurantName,
          details: food.description
        }
      ]);
    }
    
    // Reset quantity to 1 after adding
    setQuantities(prev => ({
      ...prev,
      [food.id]: 1
    }));
    
    console.log('✅ Cart after adding:', cartItems);
  };

  // Remove from cart
  const removeItem = (foodId) => {
    setCartItems(cartItems.filter(item => item.foodId !== foodId));
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const discount = 3.00;
  const delivery = 2.50;
  const total = subtotal - discount + delivery;

  // Checkout
  const handleCheckout = () => {
    if (!user) {
      alert('Please login to place an order!');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    navigate('/payment', {
      state: {
        cartItems: cartItems,
        total: total,
        subtotal: subtotal,
        discount: discount,
        delivery: delivery
      }
    });
  };

  if (loading) {
    return (
      <div className="order-loading">
        <div className="spinner"></div>
        <p>Loading menu...</p>
      </div>
    );
  }

  return (
    <>
      <div className="order-page">
        {/* Top Banner */}
        <div className="top-banner">
          <div className="banner-left">
            🌟 Get 5% Off your first order, <span className="promo-code">Promo: ORDER5</span>
          </div>
          <div className="banner-right">
            <span>📍 Regent Street, A4, A4201, Colombo <span className="change-location">Change Location</span></span>
            <div className="cart-preview">
              <span>🛒</span>
              <span>{cartItems.length} Items</span>
              <span>LKR {total.toFixed(2)}</span>
              <button className="cart-toggle">▼</button>
            </div>
          </div>
        </div>

        {/* Main Container */}
        <div className="order-container">
          {/* Left Sidebar - Menu Categories */}
          <aside className="menu-sidebar">
            <h3 className="sidebar-title">
              <span className="menu-icon">🍕</span> Menu
            </h3>
            <nav className="menu-nav">
              {categories.map((cat) => (
                <div
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`menu-item ${selectedCategory === cat ? 'active' : ''}`}
                >
                  {cat}
                </div>
              ))}
            </nav>

            {/* Offer Card */}
            <div className="offer-card">
              <div className="offer-bg-circle"></div>
              <div className="offer-content">
                <div className="offer-avatar">
                  😊
                  <span className="discount-badge">-25%</span>
                </div>
                <h4 className="offer-title">First Order Discount</h4>
                <p className="offer-text">Get 25% off on your first order</p>
              </div>
            </div>
          </aside>

          {/* Center Content - Menu Items */}
          <main className="menu-content">
            {/* Header Section */}
            <div className="restaurant-header">
              <div className="header-info">
                <p className="restaurant-tag">Browse foods from multiple restaurants!</p>
                <h1 className="restaurant-title">Order Food Online</h1>
                <div className="restaurant-badges">
                  <button className="info-badge">
                    <span>🛍️</span> {displayedFoods.length} Items Available
                  </button>
                  <button className="info-badge">
                    <span>🚴</span> Delivery in 20-25 Minutes
                  </button>
                </div>
                <div className="open-badge">
                  <span>⏰</span> Open until 3:00 AM
                </div>
              </div>
              <div className="header-image-wrapper">
                <img
                  src="https://images.unsplash.com/photo-1595475038665-86405d51ff38?w=200&h=200&fit=crop"
                  alt="Food"
                  className="header-image"
                />
                <div className="orating-card">
                  <h3 className="orating-number">4.8</h3>
                  <div className="orating-stars">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < 5 ? 'star-filled' : 'star-empty'}>★</span>
                    ))}
                  </div>
                  <p className="orating-count">Multiple Restaurants</p>
                </div>
              </div>
            </div>

            {/* Order Section Header */}
            <h2 className="section-title">Explore Our Menu</h2>

            {/* Search and Sort */}
            <div className="search-sort-wrapper">
              <div className="search-box">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search from menu..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button className="sort-button">
                Sort by: Pricing <span>⚙️</span>
              </button>
            </div>

            {/* Category Title */}
            <h3 className="category-title">
              {selectedCategory} 
              <span className="result-count">({displayedFoods.length} items)</span>
            </h3>

            {/* Food Cards */}
            {displayedFoods.length === 0 ? (
              <div className="no-results-order">
                <span className="no-results-icon">🔍</span>
                <h3>No items found</h3>
                <p>Try searching with different keywords</p>
              </div>
            ) : (
              <div className="pizza-list">
                {displayedFoods.map((food, index) => (
                  <div key={food.id} className={`pizza-card ${index === 0 ? 'featured' : ''}`}>
                    <div className="pizza-content">
                      <div className="pizza-details">
                        <h4 className="pizza-name">{food.name}</h4>
                        <div className="pizza-rating">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className="star-filled">★</span>
                          ))}
                        </div>
                        <p className="pizza-restaurant-badge">
                          🏪 {food.restaurantName}
                        </p>
                        <p className="pizza-description">{food.description}</p>

                        {/* ✨ NEW: Price and Quantity Selector */}
                        <div className="pizza-price-section">
                          <span className="pizza-price">LKR{food.price.toFixed(2)}</span>
                          
                          <div className="quantity-cart-wrapper">
                            {/* Quantity Selector */}
                            <div className="quantity-selector">
                              <button 
                                className="quantity-btn"
                                onClick={() => decrementQuantity(food.id)}
                              >
                                −
                              </button>
                              <input
                                type="number"
                                className="quantity-input"
                                value={quantities[food.id] || 1}
                                onChange={(e) => handleQuantityChange(food.id, e.target.value)}
                                min="1"
                                max="999"
                              />
                              <button 
                                className="quantity-btn"
                                onClick={() => incrementQuantity(food.id)}
                              >
                                +
                              </button>
                            </div>
                            
                            {/* Add to Cart Button */}
                            <button 
                              className="add-to-cart-button"
                              onClick={() => addToCart(food)}
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>

                        {food.offers && (
                          <div className="pizza-offer-badge">
                            {food.offers}
                          </div>
                        )}
                      </div>

                      <div className="pizza-image-wrapper">
                        <img
                          src={food.imageUrl || 'https://via.placeholder.com/150'}
                          alt={food.name}
                          className="pizza-image"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar - Cart */}
          <aside className="cart-sidebar">
            {/* Share Cart Button */}
            <button className="share-cart-btn">
              <span>🛒</span> Share this cart with your friends
            </button>

            {/* My Basket Header */}
            <div className="basket-header">
              <span className="basket-icon">🛒</span> My Basket
            </div>

            {/* Cart Items */}
            <div className="cart-items">
              {cartItems.length === 0 ? (
                <div className="empty-cart-message">
                  <p>Your cart is empty</p>
                  <small>Add items to get started</small>
                </div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.foodId} className="cart-item">
                    <div className="item-quantity">{item.quantity}x</div>
                    <div className="item-info">
                      <p className="item-name">{item.name}</p>
                      <p className="item-details">🏪 {item.restaurantName}</p>
                    </div>
                    <div className="item-price">LKR{(item.price * item.quantity).toFixed(2)}</div>
                    <button className="item-remove" onClick={() => removeItem(item.foodId)}>✕</button>
                  </div>
                ))
              )}
            </div>

            {/* Cart Summary */}
            {cartItems.length > 0 && (
              <>
                <div className="cart-summary">
                  <div className="summary-row">
                    <span>Sub Total:</span>
                    <span className="summary-value">LKR{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Discounts:</span>
                    <span className="summary-value discount">-LKR{discount.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Delivery Fee:</span>
                    <span className="summary-value">LKR{delivery.toFixed(2)}</span>
                  </div>
                </div>

                {/* Total to Pay */}
                <div className="total-box">
                  <span className="total-label">Total to pay</span>
                  <span className="total-amount">LKR{total.toFixed(2)}</span>
                </div>

                {/* Additional Options */}
                <div className="cart-options">
                  <div className="option-item">
                    <span>Choose your free item..</span>
                    <span>❓</span>
                  </div>
                  <div className="option-item">
                    <span>Apply Coupon Code here</span>
                    <span className="option-arrow">➡️</span>
                  </div>
                </div>

                {/* Delivery Options */}
                <div className="delivery-options">
                  <div className="delivery-option active">
                    <div className="option-icon">🚚</div>
                    <p className="option-title">Delivery</p>
                    <p className="option-time">Starts at 17:50</p>
                  </div>
                  <div className="delivery-option">
                    <div className="option-icon">📦</div>
                    <p className="option-title">Collection</p>
                    <p className="option-time">Starts at 16:50</p>
                  </div>
                </div>

                {/* Checkout Button */}
                <button className="checkout-btn" onClick={handleCheckout}>
                  <span>✓</span> Checkout!
                </button>
              </>
            )}
          </aside>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default OrderPage;