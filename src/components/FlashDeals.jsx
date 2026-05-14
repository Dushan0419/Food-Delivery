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

  // ================= PIZZA & FAST FOOD =================
  {
    id: 1,
    category: 'pizza',
    image: '/images/burger.jpg',
    discount: '-40%',
    restaurant: 'Chef Burgers London',
    fallback: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    category: 'pizza',
    image: '/images/pizza.jpg',
    discount: '-25%',
    restaurant: 'Pizza Palace Manchester',
    fallback: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    category: 'pizza',
    image: '/images/fries.jpg',
    discount: '-15%',
    restaurant: 'Fast Bites Leeds',
    fallback: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    category: 'pizza',
    image: '/images/hotdog.jpg',
    discount: '-30%',
    restaurant: 'Hot Grill Express',
    fallback: 'https://images.unsplash.com/photo-1612392062798-2b2cf388b6c0?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    category: 'pizza',
    image: '/images/fried-chicken.jpg',
    discount: '-22%',
    restaurant: 'Crunchy Chicken Hub',
    fallback: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop'
  },
  {
    id: 6,
    category: 'pizza',
    image: '/images/sandwich.jpg',
    discount: '-18%',
    restaurant: 'Street Sandwich Point',
    fallback: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop'
  },

  // ================= VEGAN =================
  {
    id: 7,
    category: 'vegan',
    image: '/images/vegan-salad.jpg',
    discount: '-20%',
    restaurant: 'Green Bowl Cafe',
    fallback: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
  },
  {
    id: 8,
    category: 'vegan',
    image: '/images/healthy-food.jpg',
    discount: '-18%',
    restaurant: 'Healthy Vegan Kitchen',
    fallback: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop'
  },
  {
    id: 9,
    category: 'vegan',
    image: '/images/vegan-wrap.jpg',
    discount: '-22%',
    restaurant: 'Nature Fresh Foods',
    fallback: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=300&fit=crop'
  },
  {
    id: 10,
    category: 'vegan',
    image: '/images/fruit-bowl.jpg',
    discount: '-12%',
    restaurant: 'Organic Delight London',
    fallback: 'https://images.unsplash.com/photo-1505253716362-afaea6c5d1af?w=400&h=300&fit=crop'
  },
  {
    id: 11,
    category: 'vegan',
    image: '/images/vegan-pasta.jpg',
    discount: '-16%',
    restaurant: 'Pure Vegan Pasta',
    fallback: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop'
  },
  {
    id: 12,
    category: 'vegan',
    image: '/images/smoothie.jpg',
    discount: '-28%',
    restaurant: 'Fresh Juice & Smoothie',
    fallback: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400&h=300&fit=crop'
  },

  // ================= SUSHI =================
  {
    id: 13,
    category: 'sushi',
    image: '/images/sushi.jpg',
    discount: '-17%',
    restaurant: 'Tokyo Sushi House',
    fallback: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=300&fit=crop'
  },
  {
    id: 14,
    category: 'sushi',
    image: '/images/noodles.jpg',
    discount: '-10%',
    restaurant: 'Sakura Asian Foods',
    fallback: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400&h=300&fit=crop'
  },
  {
    id: 15,
    category: 'sushi',
    image: '/images/ramen.jpg',
    discount: '-28%',
    restaurant: 'Ramen King Birmingham',
    fallback: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=400&h=300&fit=crop'
  },
  {
    id: 16,
    category: 'sushi',
    image: '/images/dumplings.jpg',
    discount: '-15%',
    restaurant: 'Dragon Sushi Bar',
    fallback: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400&h=300&fit=crop'
  },
  {
    id: 17,
    category: 'sushi',
    image: '/images/tempura.jpg',
    discount: '-24%',
    restaurant: 'Tempura Express',
    fallback: 'https://images.unsplash.com/photo-1604908554027-3f4b7b1a5f28?w=400&h=300&fit=crop'
  },
  {
    id: 18,
    category: 'sushi',
    image: '/images/asian-rice.jpg',
    discount: '-21%',
    restaurant: 'Asian Rice Bowl',
    fallback: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&h=300&fit=crop'
  },

  // ================= OTHERS =================
  {
    id: 19,
    category: 'others',
    image: '/images/breakfast.jpg',
    discount: '-25%',
    restaurant: 'Morning Breakfast Hub',
    fallback: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop'
  },
  {
    id: 20,
    category: 'others',
    image: '/images/soup.jpg',
    discount: '-20%',
    restaurant: 'Soup World London',
    fallback: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&h=300&fit=crop'
  },
  {
    id: 21,
    category: 'others',
    image: '/images/pasta.jpg',
    discount: '-14%',
    restaurant: 'Italian Pasta Corner',
    fallback: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop'
  },
  {
    id: 22,
    category: 'others',
    image: '/images/cake.jpg',
    discount: '-35%',
    restaurant: 'Sweet Dessert Cafe',
    fallback: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop'
  },
  {
    id: 23,
    category: 'others',
    image: '/images/icecream.jpg',
    discount: '-27%',
    restaurant: 'Ice Cream Factory',
    fallback: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop'
  },
  {
    id: 24,
    category: 'others',
    image: '/images/coffee.jpg',
    discount: '-19%',
    restaurant: 'Coffee Time Cafe',
    fallback: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop'
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

  const filteredDeals = deals.filter(
  deal => deal.category === activeTab
);

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
            {filteredDeals.map(deal => (
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
