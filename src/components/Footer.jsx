import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Footer.css';

export default function Footer() {
  const { user, isAdmin } = useAuth();

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="footer-logo">Epic Thrift</Link>
          <p>Pre-loved style, fresh finds. Good clothes deserve a second life.</p>
        </div>

        <nav className="footer-col" aria-label="Shop">
          <h3>Shop</h3>
          <Link to="/">All products</Link>
          <Link to="/cart">Your cart</Link>
        </nav>

        <nav className="footer-col" aria-label="Account">
          <h3>Account</h3>
          {user ? (
            <Link to="/profile">Profile &amp; orders</Link>
          ) : (
            <>
              <Link to="/login">Log in</Link>
              <Link to="/signup">Create an account</Link>
            </>
          )}
          {isAdmin && <Link to="/admin">Admin</Link>}
        </nav>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Epic Thrift. All rights reserved.</p>
      </div>
    </footer>
  );
}