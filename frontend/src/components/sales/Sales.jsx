import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { salesAPI } from '../../api/axios';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const response = await salesAPI.getAll();
      setSales(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching sales:', error);
      setError('Failed to load sales data');
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading sales data...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Sales History</h1>
        <Link to="/sales/add" className="btn btn-primary">Record New Sale</Link>
      </div>

      {sales.length === 0 ? (
        <p>No sales records found.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id}>
                <td>{new Date(sale.sale_date).toLocaleDateString()}</td>
                <td>{sale.product_name}</td>
                <td>{sale.quantity}</td>
                <td>${sale.unit_price.toFixed(2)}</td>
                <td>${(sale.quantity * sale.unit_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Sales;