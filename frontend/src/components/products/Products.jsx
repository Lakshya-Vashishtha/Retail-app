import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../../api/axios';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll();
      setProducts(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await productsAPI.delete(id);
        fetchProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
        setError('Failed to delete product');
      }
    }
  };

  if (loading) {
    return <div>Loading products...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Products</h1>
        <Link to="/products/add" className="btn btn-primary">Add Product</Link>
      </div>

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Brand</th>
              <th>Category</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.Brand}</td>
                <td>{product.category}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.quantity}</td>
                <td>
                  <Link to={`/products/edit/${product.id}`} className="btn btn-sm btn-primary me-2">Edit</Link>
                  <button 
                    onClick={() => handleDelete(product.id)} 
                    className="btn btn-sm btn-danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Products;