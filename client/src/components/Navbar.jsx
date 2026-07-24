import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        CockroachFoodApp
      </Link>
      <nav className="nav-links">
        <Link to="/">Restaurants</Link>
        {user && <Link to="/orders">My Orders</Link>}
        {user?.role === 'owner' && <Link to="/dashboard">Dashboard</Link>}
        <Link to="/cart" className="cart-link">
          Cart{itemCount > 0 && <span className="badge">{itemCount}</span>}
        </Link>
        {user ? (
          <>
            <span className="greeting">Hi, {user.name.split(' ')[0]}</span>
            <button className="link-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign up</Link>
          </>
        )}
      </nav>
    </header>
  );
}
