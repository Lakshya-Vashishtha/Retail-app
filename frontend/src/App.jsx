import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';

// Import components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Products from './components/products/Products';
import ProductForm from './components/products/ProductForm';
import Sales from './components/sales/Sales';
import SaleForm from './components/sales/SaleForm';
import Dashboard from './components/Dashboard';
import Assistant from './components/assistant/Assistant';
import Navbar from './components/Navbar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    // Check if user is authenticated on component mount
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" />;
    }
    return children;
  };

  return (
    <Router>
      <div className="app-container">
        <Navbar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated} />
        
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/products" element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } />
            
            <Route path="/products/add" element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            } />
            
            <Route path="/products/edit/:id" element={
              <ProtectedRoute>
                <ProductForm />
              </ProtectedRoute>
            } />
            
            <Route path="/sales" element={
              <ProtectedRoute>
                <Sales />
              </ProtectedRoute>
            } />
            
            <Route path="/sales/add" element={
              <ProtectedRoute>
                <SaleForm />
              </ProtectedRoute>
            } />
            
            <Route path="/assistant" element={
              <ProtectedRoute>
                <Assistant />
              </ProtectedRoute>
            } />
            
            <Route path="/" element={
              isAuthenticated ? 
              <Navigate to="/dashboard" /> : 
              <div className="auth-container">
                <div className="auth-card">
                  <h2>Welcome to Smart Assistant</h2>
                  <p>Your complete business management solution with AI assistance.</p>
                  <div className="dashboard-stats">
                    <div className="stat-card">
                      <h3>Products</h3>
                      <p className="stat-value">Manage your inventory</p>
                    </div>
                    <div className="stat-card">
                      <h3>Sales</h3>
                      <p className="stat-value">Track your revenue</p>
                    </div>
                    <div className="stat-card">
                      <h3>AI Assistant</h3>
                      <p className="stat-value">Get insights</p>
                    </div>
                  </div>
                </div>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
