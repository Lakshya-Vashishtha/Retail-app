import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SaleForm = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    quantity: 1,
    sale_date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/v1/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
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
      await axios.post('/api/v1/sales', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/sales');
    } catch (error) {
      console.error('Error recording sale:', error);
      setError('Failed to record sale');
      setLoading(false);
    }
  };

  if (loading && products.length === 0) {
    return <div>Loading products...</div>;
  }

  return (
    <div>
      <h1>Record New Sale</h1>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="product_id">Product</label>
          <select
            className="form-control"
            id="product_id"
            name="product_id"
            value={formData.product_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} - ${product.price.toFixed(2)} ({product.quantity} in stock)
              </option>
            ))}
          </select>
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
            min="1"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="sale_date">Sale Date</label>
          <input
            type="date"
            className="form-control"
            id="sale_date"
            name="sale_date"
            value={formData.sale_date}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Recording...' : 'Record Sale'}
        </button>
      </form>
    </div>
  );
};

export default SaleForm;