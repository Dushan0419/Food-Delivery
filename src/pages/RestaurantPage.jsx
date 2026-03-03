import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import '../styles/RestaurantPage.css';
import Footer from '../components/Footer';
import { db } from "../firebase";

const RestaurantPage = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [similarRestaurants, setSimilarRestaurants] = useState([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Categories
  const categories = [
    { id: 'all', name: 'All', icon: '🍽️' },
    { id: 'Offers', name: 'Offres', icon: '🍽️' },
    { id: 'burgers', name: 'Burgers & Fast food', icon: '🍔' },
    { id: 'salads', name: 'Salads', icon: '🥗' },
    { id: 'pasta', name: 'Pasta & Casuals', icon: '🍝' },
    { id: 'pizza', name: 'Pizza', icon: '🍕' },
    { id: 'breakfast', name: 'Breakfast', icon: '🍳' },
    { id: 'soups', name: 'Soups', icon: '🍲' }
  ];

  // Menu items - Burgers
  const burgers = [
    {
      id: 1,
      name: "Royal Cheese Burger with extra Fries",
      description: "1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium",
      price: "LKR 120",
      category: "burgers",
      image: "/images/burger1.jpg",
      fallback: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop"
    },
    {
      id: 2,
      name: "Cheeseburger Deluxe",
      description: "Melted cheese over a tender beef patty, finished with crunchy veggies and rich flavor.",
      price: "LKR 420",
      category: "burgers",
      image: "/images/burger2.jpg",
      fallback: "https://images.unsplash.com/photo-1550547660-d9450f859349?w=200&h=200&fit=crop"
    },
    {
      id: 3,
      name: "Grilled Chicken Supreme",
      description: "Tender grilled chicken breast with fresh vegetables and light sauce.",
      price: "LKR 200",
      category: "burgers",
      image: "/images/burger3.jpg",
      fallback: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=200&h=200&fit=crop"
    }
  ];

  // Menu items - Fries
  const fries = [
    {
      id: 4,
      name: "French Fries with Mayonnaise",
      description: "Hot, crispy fries dipped in velvety mayonnaise.",
      price: "LKR 350",
      category: "fries",
      image: "/images/fries1.jpg",
      fallback: "https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=200&h=200&fit=crop"
    },
    {
      id: 5,
      name: "Potato Chips with Tomato sauce ",
      description: "Crispy potato chips served with classic tomato sauce.",
      price: "LKR 250",
      category: "fries",
      image: "/images/fries2.jpg",
      fallback: "https://images.unsplash.com/photo-1518013431117-eb1465fa5752?w=200&h=200&fit=crop"
    },
    {
      id: 6,
      name: "Crinkle-Cut Fries",
      description: "Classic fries with a crispy crinkle texture.",
      price: "LKR 120",
      category: "fries",
      image: "/images/fries3.jpg",
      fallback: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=200&h=200&fit=crop"
    }
  ];

  // Menu items - Cold Drinks
  const drinks = [
    {
      id: 7,
      name: "Classic Chocolate Milk",
      description: "Rich, creamy chocolate blended with fresh cold milk.",
      price: "LKR 345",
      category: "drinks",
      image: "/images/drink1.jpg",
      fallback: "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=200&h=200&fit=crop"
    },
    {
      id: 8,
      name: "Fanta Orange Crush 300ml",
      description: "1 McChicken™, 1 Big Mac™, 1 Royal Cheeseburger, 3 medium",
      price: "LKR 300",
      category: "drinks",
      image: "/images/drink2.jpg",
      fallback: "https://images.unsplash.com/photo-1624517452488-04869289c4ca?w=200&h=200&fit=crop"
    },
    {
      id: 9,
      name: "Turmeric Milk (Golden Milk)",
      description: "Traditional healthy drink with anti-inflammatory benefits.",
      price: "LKR 300",
      category: "drinks",
      image: "/images/drink3.jpg",
      fallback: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?w=200&h=200&fit=crop"
    }
  ];

  // Combine all menu items
  const allMenuItems = [...burgers, ...fries, ...drinks];

  // Filter menu items based on search query
  const getFilteredItems = () => {
    let items = allMenuItems;

    // Filter by search query
    if (searchQuery.trim()) {
      items = items.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return items;
  };

  const filteredItems = getFilteredItems();

  // Group filtered items by category
  const groupedItems = {
    burgers: filteredItems.filter(item => item.category === 'burgers'),
    fries: filteredItems.filter(item => item.category === 'fries'),
    drinks: filteredItems.filter(item => item.category === 'drinks')
  };

  const reviews = [
    {
      id: 1,
      name: "St Glx",
      location: "South London",
      date: "24th September, 2023",
      rating: 5,
      review: "The positive aspect was undoubtedly the efficiency of the service. The queue moved quickly, the staff was friendly, and the food was up to the usual McDonald's standard — hot and satisfying.",
      avatar: "https://ui-avatars.com/api/?name=St+Glx&background=FF6B35&color=fff"
    },
    {
      id: 2,
      name: "Mitchell Marsh",
      location: "South London",
      date: "24th September, 2023",
      rating: 5,
      review:"The service met expectations overall. The order was delivered promptly, the food was warm, and the flavors were exactly what I was expecting.",
      avatar: "https://ui-avatars.com/api/?name=St+Glx&background=FF6B35&color=fff"
    },
    {
      id: 3,
      name: "Alexander Loran",
      location: "South London",
      date: "24th September, 2023",
      rating: 5,
      review: "The overall experience was quite good. The delivery was faster than expected, the food was warm, and the taste was consistent with previous orders.",
      avatar: "https://ui-avatars.com/api/?name=St+Glx&background=FF6B35&color=fff"
    },
    {
      id: 4,
      name: "Aaron Finch",
      location: "South London",
      date: "24th September, 2023",
      rating: 4,
      review: "One of the strongest points was the speed of delivery. The driver arrived promptly, the food was still hot, and the taste was exactly as advertised on the menu.",
      avatar: "https://ui-avatars.com/api/?name=St+Glx&background=FF6B35&color=fff"
    },
    {
      id: 5,
      name: "Ben Stokes",
      location: "South London",
      date: "24th September, 2023",
      rating: 4.5,
      review: "The ordering process was simple and convenient, which made the overall experience better. Delivery was timely, the food was warm, and the portion sizes were quite satisfying",
      avatar: "https://ui-avatars.com/api/?name=St+Glx&background=FF6B35&color=fff"
    },
    {
      id: 6,
      name: "Mitchell Starc",
      location: "South London",
      date: "24th September, 2023",
      rating: 4,
      review: "The most positive aspect of the experience was the efficiency of the service. The order was processed quickly, the delivery arrived on time, and the food was hot, fresh, and met the expected quality standards.",
      avatar: "https://ui-avatars.com/api/?name=St+Glx&background=FF6B35&color=fff"
    }
  ];

  // Fetch real restaurants from Firebase
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        console.log("🔍 Fetching restaurants from Firebase...");
        
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'admin'), limit(6));
        
        const querySnapshot = await getDocs(q);
        console.log("📦 Found restaurants:", querySnapshot.docs.length);
        
        const restaurantsList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.restaurantName || data.name || 'Restaurant',
            email: data.email,
            logo: data.logoUrl || data.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.restaurantName || data.name || 'R')}&size=120&background=FF6B35&color=fff`,
            bgColor: getRandomColor()
          };
        });
        
        setSimilarRestaurants(restaurantsList);
        setLoadingRestaurants(false);
      } catch (error) {
        console.error("❌ Error fetching restaurants:", error);
        setLoadingRestaurants(false);
      }
    };

    fetchRestaurants();
  }, []);

  const getRandomColor = () => {
    const colors = [
      '#FF6B35', '#F7931E', '#FDC830', '#4ECDC4', 
      '#45B7D1', '#5F27CD', '#00D2FF', '#3742FA',
      '#2ECC71', '#E74C3C', '#9B59B6', '#F39C12'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleRestaurantClick = (restaurant) => {
    console.log("🍽️ Navigating to restaurant:", restaurant.name);
    alert(`Opening ${restaurant.name}...`);
  };

  const handlePrevReview = () => {
    setCurrentReviewIndex((prev) => (prev === 0 ? 0 : prev - 1));
  };

  const handleNextReview = () => {
    setCurrentReviewIndex((prev) => (prev >= reviews.length - 3 ? prev : prev + 1));
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <span key={index} className={index < rating ? 'star-filled' : 'star-empty'}>★</span>
    ));
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="restaurant-page">
      {/* Hero Section */}
      <section className="restaurant-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="restaurant-name">McDonald's Colombo 02</h1>
          <div className="restaurant-meta">
            <div className="meta-item">
              <span className="meta-icon">⭐</span>
              <span className="meta-text">3.4</span>
            </div>
            <div className="meta-item">
              <span className="meta-icon">📍</span>
              <span className="meta-text">Store No. 14, Level 3, Colombo City Centre Mall, Colombo 02, Sri Lanka</span>
            </div>
          </div>
          <div className="hero-badge">
            <span className="badge-icon">🏪</span>
            <span>Open now from McDonald's Colombo 02</span>
          </div>
        </div>
        <div className="hero-image">
          <img 
            src="/images/mcdonalds-food.jpg" 
            alt="McDonald's Food"
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=400&h=300&fit=crop';
            }}
          />
        </div>
      </section>

      {/* Search Bar - NOW FUNCTIONAL */}
      <section className="search-section">
        <div className="search-container">
          <div className="search-box-restaurant">
            <span className="search-icon">🔍</span>
            <input 
              type="text" 
              placeholder="Search from menu..."
              className="search-input-restaurant"
              value={searchQuery}
              onChange={handleSearchChange}
            />
            {searchQuery && (
              <button 
                className="clear-search-btn"
                onClick={clearSearch}
                style={{
                  position: 'absolute',
                  right: '16px',
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p style={{
              marginTop: '12px',
              color: '#666',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {filteredItems.length > 0 
                ? `Found ${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                : `No items found for "${searchQuery}"`
              }
            </p>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section">
        <div className="categories-container">
          <div className="categories-scroll">
            {categories.map(category => (
              <button
                key={category.id}
                className={`category-btn ${selectedCategory === category.id ? 'category-active' : ''}`}
                onClick={() => setSelectedCategory(category.id)}
              >
                <span className="category-icon">{category.icon}</span>
                <span className="category-name">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Sections - NOW FILTERED */}
      <section className="menu-section">
        <div className="menu-container">
          {filteredItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999'
            }}>
              <div style={{ fontSize: '80px', marginBottom: '20px' }}>🔍</div>
              <h3 style={{ fontSize: '24px', marginBottom: '12px', color: '#333' }}>
                No items found
              </h3>
              <p style={{ fontSize: '16px' }}>
                Try searching for something else
              </p>
              <button 
                onClick={clearSearch}
                style={{
                  marginTop: '20px',
                  padding: '12px 24px',
                  background: '#FF6B35',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                Clear Search
              </button>
            </div>
          ) : (
            <>
              {/* Burgers */}
              {groupedItems.burgers.length > 0 && (
                <div className="menu-category">
                  <h2 className="category-title">Burgers</h2>
                  <div className="menu-grid">
                    {groupedItems.burgers.map(item => (
                      <div key={item.id} className="menu-card">
                        <div className="menu-card-content">
                          <h3 className="menu-item-name">{item.name}</h3>
                          <p className="menu-item-desc">{item.description}</p>
                          <p className="menu-item-price">{item.price}</p>
                        </div>
                        <div className="menu-card-image">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = item.fallback;
                            }}
                          />
                          <button className="add-btn">
                            <span>+</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Fries */}
              {groupedItems.fries.length > 0 && (
                <div className="menu-category">
                  <h2 className="category-title">Fries</h2>
                  <div className="menu-grid">
                    {groupedItems.fries.map(item => (
                      <div key={item.id} className="menu-card">
                        <div className="menu-card-content">
                          <h3 className="menu-item-name">{item.name}</h3>
                          <p className="menu-item-desc">{item.description}</p>
                          <p className="menu-item-price">{item.price}</p>
                        </div>
                        <div className="menu-card-image">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = item.fallback;
                            }}
                          />
                          <button className="add-btn">
                            <span>+</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cold Drinks */}
              {groupedItems.drinks.length > 0 && (
                <div className="menu-category">
                  <h2 className="category-title">Cold Drinks</h2>
                  <div className="menu-grid">
                    {groupedItems.drinks.map(item => (
                      <div key={item.id} className="menu-card">
                        <div className="menu-card-content">
                          <h3 className="menu-item-name">{item.name}</h3>
                          <p className="menu-item-desc">{item.description}</p>
                          <p className="menu-item-price">{item.price}</p>
                        </div>
                        <div className="menu-card-image">
                          <img 
                            src={item.image} 
                            alt={item.name}
                            onError={(e) => {
                              e.target.src = item.fallback;
                            }}
                          />
                          <button className="add-btn">
                            <span>+</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Info Cards */}
      <section className="info-section">
        <div className="info-container">
          <div className="info-card info-delivery">
            <span className="info-icon">🚚</span>
            <h3>Delivery information</h3>
            <p><strong>Monday:</strong> 12:00 AM–3:00 AM, 8:00 AM–3:00 AM</p>
            <p><strong>Tuesday:</strong> 8:00 AM–3:00 AM</p>
            <p><strong>Wednesday:</strong> 8:00 AM–3:00 AM</p>
            <p><strong>Thursday:</strong> 8:00 AM–3:00 AM</p>
            <p><strong>Friday:</strong> 8:00 AM–3:00 AM</p>
            <p><strong>Saturday:</strong> 8:00 AM–3:00 AM</p>
            <p><strong>Sunday:</strong> 8:00 AM–12:00 AM</p>
            <p><strong>Estimated time until delivery:</strong> 20 min</p>
          </div>

          <div className="info-card info-contact">
            <span className="info-icon">📞</span>
            <h3>Contact information</h3>
            <p>If you have allergies or other dietary restrictions, please contact the restaurant. The restaurant will provide food-specific information upon request.</p>
            <p><strong>Phone number</strong></p>
            <p>+934443-43</p>
            <p><strong>Website</strong></p>
            <p>http://mcdonalds.uk/</p>
          </div>

          <div className="info-card info-operational">
            <span className="info-icon">🕐</span>
            <h3>Operational Times</h3>
            <p><strong>Monday:</strong> 8:00 AM–3:00 AM</p>
            <p><strong>Tuesday:</strong> 8:00 AM–3:00 AM</p>
            <p><strong>Wednesday:</strong> 8:00 AM–3:00 AM</p>
            <p><strong>Thursday:</strong> 8:00 AM–3:00 AM</p>
            <p><strong>Friday:</strong> 8:00 AM–3:00 AM</p>
            <p><strong>Saturday:</strong> 8:00 AM–3:00 AM</p>
            <p><strong>Sunday:</strong> 8:00 AM–3:00 AM</p>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <div className="map-container">
          <div className="map-info">
            <h2>McDonald's</h2>
            <h3>Colombo 02 </h3>
            <p>Store No. 14, Level 3, Colombo City Centre Mall, Colombo 02, Sri Lanka</p>
            <p><strong>Phone number</strong></p>
            <p>+934443-43</p>
            <p><strong>Website</strong></p>
            <p>http://mcdonalds.lk/</p>
          </div>
          <div className="map-embed">
            <iframe
              title="Restaurant Location Map"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '8px' }}
              loading="lazy"
              allowFullScreen
              src="https://maps.google.com/maps?q=51.5045,-0.0865&hl=en&z=15&output=embed"
            />
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="Rreviews-section">
        <div className="Rreviews-container">
          <div className="Rreviews-header">
            <h2 className="Rreviews-title">Customer Reviews</h2>
            <div className="Rreviews-navigation">
              <button onClick={handlePrevReview} className="nav-btn">‹</button>
              <button onClick={handleNextReview} className="nav-btn">›</button>
            </div>
          </div>

          <div className="Rreviews-grid">
            {reviews.slice(currentReviewIndex, currentReviewIndex + 3).map((review) => (
              <div key={review.id} className="Rreview-card">
                <div className="Rreview-header">
                  <div className="Rreviewer-info">
                    <img src={review.avatar} alt={review.name} className="Rreviewer-avatar" />
                    <div>
                      <h4 className="Rreviewer-name">{review.name}</h4>
                      <p className="Rreviewer-location">{review.location}</p>
                    </div>
                  </div>
                  <div className="Rreview-stars">{renderStars(review.rating)}</div>
                </div>
                <div className="Rreview-date">
                  <span className="Rdate-icon">🕐</span>
                  <span>{review.date}</span>
                </div>
                <p className="Rreview-text">{review.review}</p>
              </div>
            ))}
          </div>

          <div className="Roverall-rating">
            <h3 className="Rrating-number">3.4</h3>
            <div className="Rrating-stars">{renderStars(3)}</div>
            <p className="Rrating-count">1,360 reviews</p>
          </div>
        </div>
      </section>

      {/* Similar Restaurants Section */}
      <section className="similar-section">
        <div className="similar-container">
          <h2 className="similar-title">Similar Restaurants</h2>
          
          {loadingRestaurants ? (
            <div className="loading-restaurants">
              <div className="spinner"></div>
              <p>Loading restaurants...</p>
            </div>
          ) : similarRestaurants.length === 0 ? (
            <div className="no-restaurants">
              <p>No restaurants available at the moment</p>
            </div>
          ) : (
            <div className="similar-grid">
              {similarRestaurants.map((restaurant) => (
                <div 
                  key={restaurant.id} 
                  className="similar-card"
                  onClick={() => handleRestaurantClick(restaurant)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="similar-logo" style={{ backgroundColor: restaurant.bgColor }}>
                    <img
                      src={restaurant.logo}
                      alt={restaurant.name}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(restaurant.name)}&size=120&background=FF6B35&color=fff`;
                      }}
                    />
                  </div>
                  <div className="similar-name">
                    <h4>{restaurant.name}</h4>
                    {restaurant.email && (
                      <p style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                        {restaurant.email}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default RestaurantPage;