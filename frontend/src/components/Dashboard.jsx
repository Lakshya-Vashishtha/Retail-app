import { useState, useEffect } from 'react';
import { dashboardAPI } from '../api/axios';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getAllData();
        setDashboardData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('Failed to load dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Low Stock Products</h3>
          <div className="dashboard-list">
            {dashboardData?.low_stock_alert?.map((product) => (
              <div key={product.id} className="list-item">
                <span>{product.name}</span>
                <span className="warning">Stock: {product.quantity}</span>
              </div>
            ))}
            {dashboardData?.low_stock_alert?.length === 0 && <p>No low stock products</p>}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Expiring Products</h3>
          <div className="dashboard-list">
            {dashboardData?.expiry_alert?.map((product) => (
              <div key={product.id} className="list-item">
                <span>{product.name}</span>
                <span className="warning">Expires: {new Date(product.expiry_date).toLocaleDateString()}</span>
              </div>
            ))}
            {dashboardData?.expiry_alert?.length === 0 && <p>No expiring products</p>}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Top Selling Products</h3>
          <div className="dashboard-list">
            {dashboardData?.top_selling_products?.map((product) => (
              <div key={product.product_id} className="list-item">
                <span>{product.product_name}</span>
                <span>Sold: {product.total_quantity}</span>
              </div>
            ))}
            {dashboardData?.top_selling_products?.length === 0 && <p>No sales data available</p>}
          </div>
        </div>

        <div className="dashboard-card">
          <h3>Stock Levels</h3>
          <div className="dashboard-list">
            {dashboardData?.stock_levels?.map((product) => (
              <div key={product.id} className="list-item">
                <span>{product.name}</span>
                <span>Stock: {product.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;