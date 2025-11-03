import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on page load
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
      // You could fetch user data here if needed
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUser(userData);
    
    // Set default Authorization header for all requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    
    // Remove Authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;