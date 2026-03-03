import React, { useState } from 'react';
import '../styles/FlashDeals.css';

const FlashDeals = () => {
  const [activeTab, setActiveTab] = useState('pizza');

  const tabs = [
    { id: 'vegan', name: 'Vegan' },
    { id: 'sushi', name: 'Sushi' },
    { id: 'pizza', name: 'Pizza & Fast food' },
    { id: 'others', name: 'others' }
  ];

  const deals = [
    {
      id: 1,
      image: '/images/chef-burgers.jpg',
      discount: '-40%',
      restaurant: 'Chef Burgers London',
      fallback: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      image: '/images/grand-ai-cafe.jpg',
      discount: '-20%',
      restaurant: 'Grand Ai Cafe London',
      fallback: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      image: '/images/butterbrot-cafe.jpg',
      discount: '-17%',
      restaurant: "Butterbrot Caf'e London",
      fallback: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&h=300&fit=crop'
    },
     {
      id: 4,
      image: '/images/butterbrot-cafe.jpg',
      discount: '-30%',
      restaurant: "Purl Plaza Leeds",
      fallback: 'https://images.unsplash.com/photo-1506354666786-959d6d497f1a?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
     {
      id: 5,
      image: '/images/butterbrot-cafe.jpg',
      discount: '-15%',
      restaurant: "Express Food Birminham",
      fallback: 'https://plus.unsplash.com/premium_photo-1666649675527-6a7859752c53?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    },
     {
      id: 6,
      image: '/images/butterbrot-cafe.jpg',
      discount: '-25%',
      restaurant: "Marine Bay London",
      fallback: 'https://images.unsplash.com/photo-1670164745517-5b41d4660613?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    }
  ];

  const categories = [
    {
      id: 1,
      name: 'Burgers & Fast food',
      restaurants: '21 Restaurants',
      image: '/images/burger.jpg',
      fallback: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop'
    },
    {
      id: 2,
      name: 'Salads',
      restaurants: '32 Restaurants',
      image: '/images/salad.jpg',
      fallback: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop'
    },
    {
      id: 3,
      name: 'Pasta & Casuals',
      restaurants: '4 Restaurants',
      image: '/images/pasta.jpg',
      fallback: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=200&h=200&fit=crop'
    },
    {
      id: 4,
      name: 'Pizza',
      restaurants: '32 Restaurants',
      image: '/images/pizza.jpg',
      fallback: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=200&h=200&fit=crop'
    },
    {
      id: 5,
      name: 'Breakfast',
      restaurants: '4 Restaurants',
      image: '/images/breakfast.jpg',
      fallback: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=200&h=200&fit=crop'
    },
    {
      id: 6,
      name: 'Soups',
      restaurants: '32 Restaurants',
      image: '/images/soup.jpg',
      fallback: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=200&h=200&fit=crop'
    }
  ];

  return (
    <>
      {/* Flash Deals Section */}
      <section className="flash-deals">
        <div className="deals-container">
          {/* Title */}
          <h2 className="deals-heading">
            Up to -40% 🎉 Order.uk exclusive deals
          </h2>

          {/* Tabs */}
          <div className="deals-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`tab-button ${activeTab === tab.id ? 'tab-active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.name}
              </button>
            ))}
          </div>

          {/* Deals Grid */}
          <div className="deals-grid">
            {deals.map(deal => (
              <div key={deal.id} className="deal-card">
                <div className="deal-image-wrapper">
                  <img
                    src={deal.image}
                    alt={deal.restaurant}
                    className="deal-image"
                    onError={(e) => {
                      e.target.src = deal.fallback;
                    }}
                  />
                  <div className="discount-badge">
                    {deal.discount}
                  </div>
                </div>
                <div className="deal-footer">
                  <p className="restaurant-label">Restaurant</p>
                  <h3 className="restaurant-title">{deal.restaurant}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="popular-categories">
        <div className="categories-container">
          <h2 className="categories-heading">
            Order.uk Popular Categories 🤩
          </h2>

          <div className="categories-grid">
            {categories.map(category => (
              <div key={category.id} className="category-card">
                <div className="category-image-wrapper">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="category-image"
                    onError={(e) => {
                      e.target.src = category.fallback;
                    }}
                  />
                </div>
                <div className="category-info">
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-count">{category.restaurants}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default FlashDeals;