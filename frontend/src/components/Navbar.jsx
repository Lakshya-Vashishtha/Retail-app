import { Link } from 'react-router-dom';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">Smart Assistant</Link>
      <ul className="navbar-nav">
        {isAuthenticated ? (
          <>
            <li className="nav-item">
              <Link to="/" className="nav-link">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link to="/products" className="nav-link">Products</Link>
            </li>
            <li className="nav-item">
              <Link to="/sales" className="nav-link">Sales</Link>
            </li>
            <li className="nav-item">
              <Link to="/assistant" className="nav-link">Assistant</Link>
            </li>
            <li className="nav-item">
              <button onClick={handleLogout} className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li className="nav-item">
              <Link to="/login" className="nav-link">Login</Link>
            </li>
            <li className="nav-item">
              <Link to="/register" className="nav-link">Register</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;