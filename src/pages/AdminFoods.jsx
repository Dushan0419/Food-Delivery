import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminFoods.css';

const AdminFoods = () => {
  const { user } = useAuth();
  const [foods, setFoods] = useState([]);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFood, setSelectedFood] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    offers: '',
    availability: true
  });

  // ImgBB API Key
  const IMGBB_API_KEY = '59d6d83898ac1531112c6410e404d6c0';

  const categories = [
    'Breakfast',
    'Lunch',
    'Dinner',
    'Dessert',
    'Beverages',
    'Appetizers',
    'Main Course',
    'Fast Food',
    'Kottu',
    'Soup',
    'Pasta',
    'Healthy',
    'Vegan'
  ];

  // Fetch foods for this admin/restaurant
  useEffect(() => {
    if (!user) return;

    console.log("👤 Current user:", user.uid);
    const foodsRef = collection(db, 'foods');
    const q = query(foodsRef, where('restaurantId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("📦 Foods fetched:", snapshot.docs.length);
      const foodsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFoods(foodsList);
      setLoading(false);
    }, (error) => {
      console.error("❌ Error fetching foods:", error);
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
      const file = e.target.files[0];
      console.log("📷 Image selected:", file.name, file.size, "bytes");
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Upload image to ImgBB
  const uploadToImgBB = async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        console.log("✅ Image uploaded to ImgBB:", data.data.url);
        return data.data.url;
      } else {
        throw new Error(data.error.message || 'Upload failed');
      }
    } catch (error) {
      console.error("❌ ImgBB upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log("🔥 Starting food submission...");
    console.log("📝 Form data:", formData);
    
    // Validation
    if (!formData.name.trim()) {
      alert('Please enter food name!');
      return;
    }
    
    if (!formData.description.trim()) {
      alert('Please enter description!');
      return;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      alert('Please enter a valid price!');
      return;
    }
    
    if (!formData.category) {
      alert('Please select a category!');
      return;
    }
    
    if (!imageFile) {
      alert('Please select an image!');
      return;
    }
    
    setUploading(true);

    try {
      console.log("📤 Uploading image to ImgBB...");
      const imageUrl = await uploadToImgBB(imageFile);
      console.log("🔗 Image URL:", imageUrl);

      console.log("💾 Saving to Firestore...");
      const foodData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: imageUrl,
        offers: formData.offers.trim(),
        availability: formData.availability,
        restaurantId: user.uid,
        restaurantName: user.displayName || user.email,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'foods'), foodData);
      console.log("✅ Food saved with ID:", docRef.id);

      // Reset form
      resetForm();
      setShowAddPopup(false);
      alert('✅ Food added successfully!');
      
    } catch (error) {
      console.error('❌ Error:', error);
      alert('❌ Error adding food: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Open Edit Modal
  const handleEditClick = (food) => {
    setSelectedFood(food);
    setFormData({
      name: food.name,
      description: food.description,
      price: food.price.toString(),
      category: food.category,
      offers: food.offers || '',
      availability: food.availability
    });
    setImagePreview(food.imageUrl);
    setImageFile(null);
    setShowEditPopup(true);
  };

  // Handle Edit Submit
  const handleEditSubmit = async () => {
    if (!formData.name.trim() || !formData.description.trim() || !formData.price || !formData.category) {
      alert('Please fill in all required fields!');
      return;
    }

    setUploading(true);

    try {
      let imageUrl = selectedFood.imageUrl;

      // Upload new image if selected
      if (imageFile) {
        console.log("📤 Uploading new image...");
        imageUrl = await uploadToImgBB(imageFile);
      }

      // Update Firestore
      await updateDoc(doc(db, 'foods', selectedFood.id), {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        imageUrl: imageUrl,
        offers: formData.offers.trim(),
        availability: formData.availability,
        updatedAt: new Date().toISOString()
      });

      console.log("✅ Food updated successfully!");
      alert('✅ Food updated successfully!');
      setShowEditPopup(false);
      resetForm();
    } catch (error) {
      console.error('❌ Error updating food:', error);
      alert('❌ Error updating food: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  // Open Delete Modal
  const handleDeleteClick = (food) => {
    setSelectedFood(food);
    setShowDeletePopup(true);
  };

  // Handle Delete Confirm
  const handleDeleteConfirm = async () => {
    try {
      await deleteDoc(doc(db, 'foods', selectedFood.id));
      console.log("✅ Food deleted successfully!");
      alert('✅ Food deleted successfully!');
      setShowDeletePopup(false);
      setSelectedFood(null);
    } catch (error) {
      console.error('❌ Error deleting food:', error);
      alert('❌ Error deleting food: ' + error.message);
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

  // Reset form helper
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      offers: '',
      availability: true
    });
    setImageFile(null);
    setImagePreview(null);
    setSelectedFood(null);
    
    const fileInput = document.getElementById('image');
    if (fileInput) fileInput.value = '';
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
                  <span className="food-price">LKR{food.price.toFixed(2)}</span>
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
                  <button className="edit-btn" onClick={() => handleEditClick(food)}>
                    ✏️ Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDeleteClick(food)}>
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

            <div className="food-form-container">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Food Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Chicken Burger"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="price">Price (LKR) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
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
                  onChange={handleImageChange}
                  accept="image/*"
                  className="file-input"
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
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
                  type="button" 
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={uploading}
                >
                  {uploading ? 'Adding...' : 'Add Food'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Food Popup */}
      {showEditPopup && selectedFood && (
        <div className="popup-overlay" onClick={() => setShowEditPopup(false)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header edit-header">
              <h2>✏️ Edit Food</h2>
              <button className="close-btn" onClick={() => setShowEditPopup(false)}>
                ✕
              </button>
            </div>

            <div className="food-form-container">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-name">Food Name *</label>
                  <input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g., Chicken Burger"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-price">Price (LKR) *</label>
                  <input
                    type="number"
                    id="edit-price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    placeholder="9.99"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-description">Description *</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Describe your food item..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="edit-category">Category *</label>
                  <select
                    id="edit-category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-offers">Offers (Optional)</label>
                  <input
                    type="text"
                    id="edit-offers"
                    name="offers"
                    value={formData.offers}
                    onChange={handleChange}
                    placeholder="e.g., 20% OFF"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="edit-image">Food Image (Leave empty to keep current)</label>
                <input
                  type="file"
                  id="edit-image"
                  onChange={handleImageChange}
                  accept="image/*"
                  className="file-input"
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
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
                  onClick={() => setShowEditPopup(false)}
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="submit-btn edit-submit-btn"
                  onClick={handleEditSubmit}
                  disabled={uploading}
                >
                  {uploading ? 'Updating...' : '💾 Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Popup */}
      {showDeletePopup && selectedFood && (
        <div className="popup-overlay" onClick={() => setShowDeletePopup(false)}>
          <div className="popup-card delete-popup" onClick={(e) => e.stopPropagation()}>
            <div className="delete-popup-content">
              <div className="delete-icon">⚠️</div>
              <h2>Delete Food Item?</h2>
              <p>Are you sure you want to delete <strong>"{selectedFood.name}"</strong>?</p>
              <p className="delete-warning">This action cannot be undone!</p>
              
              <div className="delete-actions">
                <button 
                  className="cancel-btn-popup"
                  onClick={() => setShowDeletePopup(false)}
                >
                  Cancel
                </button>
                <button 
                  className="delete-confirm-btn"
                  onClick={handleDeleteConfirm}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFoods;