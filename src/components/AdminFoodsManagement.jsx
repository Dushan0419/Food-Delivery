import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminFoods.css';

const AdminFoods = () => {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null,
    offers: '',
    availability: true
  });

  const categories = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Dessert',
    'Beverages',
    'Appetizers',
    'Main Course',
    'Fast Food',
    'Healthy',
    'Vegan'
  ];

  // Fetch foods for this admin/restaurant
  useEffect(() => {
    if (!user) return;

    const foodsRef = collection(db, 'foods');
    const q = query(foodsRef, where('restaurantId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const foodsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFoods(foodsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let imageUrl = '';

      // Upload image to Firebase Storage
      if (formData.image) {
        const imageRef = ref(storage, `foods/${user.uid}/${Date.now()}_${formData.image.name}`);
        await uploadBytes(imageRef, formData.image);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Add food to Firestore
      await addDoc(collection(db, 'foods'), {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: imageUrl,
        offers: formData.offers,
        availability: formData.availability,
        restaurantId: user.uid,
        restaurantName: user.displayName || user.email,
        createdAt: new Date().toISOString()
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        category: '',
        image: null,
        offers: '',
        availability: true
      });
      setShowAddPopup(false);
      alert('Food added successfully!');
    } catch (error) {
      console.error('Error adding food:', error);
      alert('Error adding food: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (foodId) => {
    if (window.confirm('Are you sure you want to delete this food item?')) {
      try {
        await deleteDoc(doc(db, 'foods', foodId));
        alert('Food deleted successfully!');
      } catch (error) {
        console.error('Error deleting food:', error);
        alert('Error deleting food: ' + error.message);
      }
    }
  };

  const toggleAvailability = async (foodId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'foods', foodId), {
        availability: !currentStatus
      });
    } catch (error) {
      console.error('Error updating availability:', error);
    }
  };

  if (loading) {
    return (
      <div className="foods-loading">
        <div className="spinner"></div>
        <p>Loading foods...</p>
      </div>
    );
  }

  return (
    <div className="admin-foods-container">
      {/* Header */}
      <div className="foods-header">
        <div>
          <h1 className="foods-title">My Foods</h1>
          <p className="foods-subtitle">Manage your restaurant menu</p>
        </div>
        <button className="add-food-btn" onClick={() => setShowAddPopup(true)}>
          <span className="add-icon">+</span>
          Add New Food
        </button>
      </div>

      {/* Stats Cards */}
      <div className="foods-stats">
        <div className="stat-card-food">
          <span className="stat-icon-food">🍽️</span>
          <div>
            <h3>{foods.length}</h3>
            <p>Total Items</p>
          </div>
        </div>
        <div className="stat-card-food">
          <span className="stat-icon-food">✅</span>
          <div>
            <h3>{foods.filter(f => f.availability).length}</h3>
            <p>Available</p>
          </div>
        </div>
        <div className="stat-card-food">
          <span className="stat-icon-food">❌</span>
          <div>
            <h3>{foods.filter(f => !f.availability).length}</h3>
            <p>Unavailable</p>
          </div>
        </div>
      </div>

      {/* Foods Grid */}
      {foods.length === 0 ? (
        <div className="empty-foods">
          <span className="empty-icon">🍽️</span>
          <h3>No foods yet</h3>
          <p>Start by adding your first food item</p>
          <button className="add-food-btn-empty" onClick={() => setShowAddPopup(true)}>
            Add Food Item
          </button>
        </div>
      ) : (
        <div className="foods-grid">
          {foods.map(food => (
            <div key={food.id} className="food-card">
              <div className="food-image-container">
                <img 
                  src={food.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image'} 
                  alt={food.name}
                  className="food-image"
                />
                <div className="food-badge">
                  {food.category}
                </div>
                {food.offers && (
                  <div className="food-offer-badge">
                    {food.offers}
                  </div>
                )}
              </div>
              
              <div className="food-details">
                <h3 className="food-name">{food.name}</h3>
                <p className="food-description">{food.description}</p>
                
                <div className="food-price-row">
                  <span className="food-price">${food.price.toFixed(2)}</span>
                  <div className="availability-toggle">
                    <label className="toggle-switch">
                      <input 
                        type="checkbox" 
                        checked={food.availability}
                        onChange={() => toggleAvailability(food.id, food.availability)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <span className="availability-label">
                      {food.availability ? 'Available' : 'Unavailable'}
                    </span>
                  </div>
                </div>

                <div className="food-actions">
                  <button className="edit-btn" onClick={() => alert('Edit feature coming soon!')}>
                    ✏️ Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(food.id)}>
                    🗑️ Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Food Popup */}
      {showAddPopup && (
        <div className="popup-overlay" onClick={() => setShowAddPopup(false)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h2>Add New Food</h2>
              <button className="close-btn" onClick={() => setShowAddPopup(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="food-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Food Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Chicken Burger"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">Price ($) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    placeholder="9.99"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="3"
                  placeholder="Describe your food item..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Category *</label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="offers">Offers (Optional)</label>
                  <input
                    type="text"
                    id="offers"
                    name="offers"
                    value={formData.offers}
                    onChange={handleChange}
                    placeholder="e.g., 20% OFF"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="image">Food Image *</label>
                <input
                  type="file"
                  id="image"
                  name="image"
                  onChange={handleImageChange}
                  accept="image/*"
                  required
                  className="file-input"
                />
                {formData.image && (
                  <div className="image-preview">
                    <img 
                      src={URL.createObjectURL(formData.image)} 
                      alt="Preview"
                    />
                  </div>
                )}
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    name="availability"
                    checked={formData.availability}
                    onChange={handleChange}
                  />
                  <span>Available for orders</span>
                </label>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn-popup"
                  onClick={() => setShowAddPopup(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={uploading}
                >
                  {uploading ? 'Adding...' : 'Add Food'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoods;