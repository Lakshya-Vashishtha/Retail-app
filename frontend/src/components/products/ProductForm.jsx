import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    Brand: '',
    category: '',
    price: '',
    cost_price: '',
    quantity: '',
    expiry_date: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/v1/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Format date for input field
      const product = response.data;
      if (product.expiry_date) {
        product.expiry_date = product.expiry_date.split('T')[0];
      }
      
      setFormData(product);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product data');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (id) {
        await axios.put(`/api/v1/products/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/v1/products', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      navigate('/products');
    } catch (error) {
      console.error('Error saving product:', error);
      setError('Failed to save product');
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>{id ? 'Edit Product' : 'Add Product'}</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Product Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="Brand">Brand</label>
          <input
            type="text"
            className="form-control"
            id="Brand"
            name="Brand"
            value={formData.Brand}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <input
            type="text"
            className="form-control"
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="cost_price">Cost Price</label>
          <input
            type="number"
            step="0.01"
            className="form-control"
            id="cost_price"
            name="cost_price"
            value={formData.cost_price}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="quantity">Quantity</label>
          <input
            type="number"
            className="form-control"
            id="quantity"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="expiry_date">Expiry Date</label>
          <input
            type="date"
            className="form-control"
            id="expiry_date"
            name="expiry_date"
            value={formData.expiry_date}
            onChange={handleChange}
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Product'}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;