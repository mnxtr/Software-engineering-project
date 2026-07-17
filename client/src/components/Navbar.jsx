import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();

  return (
    <nav className="navbar">
      <Link to="/menu" className="navbar-brand">NSU Cafeteria</Link>
      <div className="navbar-links">
        <Link to="/menu" className="nav-link">Menu</Link>
        <Link to="/cart" className="nav-link cart">
          Cart
          {getCartCount() > 0 && (
            <span className="cart-badge">{getCartCount()}</span>
          )}
        </Link>
        <Link to="/orders" className="nav-link">My Orders</Link>
        {user?.role === 'admin' && (
          <Link to="/admin" className="nav-link">Admin</Link>
        )}
        <Link to="/profile" className="nav-link">Profile</Link>
        <div className="user-info">
          <span className="balance">৳{user?.balance?.toFixed(2) || 0}</span>
          <button className="btn btn-secondary" onClick={logout}>Logout</button>
        </div>
      </div>
    </nav>
  );
}