import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Heart, User} from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Header.css';

export default function Header() {
  const [query, setQuery] = useState('');
  const { count } = useCart();

  return (
    <header className="header">
        <Link to="/" className="logo" href="#" aria-label="EpicThrift home">
          <span className="logo-text">Epic Thrift</span>
        </Link>

        <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
          <input
            type="search"
            placeholder="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
          <button className="search-btn" type="submit" aria-label="Search">
            <Search size={15} />
          </button>
        </form>
        
        <nav className="top-links" aria-label="Secondary">
          <a href="#">About</a>
          <a href="#">FAQs</a>
          <button className="icon-btn icon-btn--circle" aria-label="Cart">
            <Heart size={16} />
          </button>
          <Link to="/cart" className="icon-btn icon-btn--circle cart-btn" aria-label="Cart">
            <ShoppingBag size={16} />
            {count > 0 && <span className="cart-count">{count}</span>}
          </Link>
          <Link to="/profile" className="icon-btn icon-btn--circle cart-btn" aria-label="Profile">
            <User size={16} />
          </Link>
        </nav>
    </header>
  );
}