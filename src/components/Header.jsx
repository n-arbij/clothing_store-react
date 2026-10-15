import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ShoppingBag, Heart} from 'lucide-react';
import { useCart } from '../context/CartContext';
import './Header.css';

const categories = ['Men', 'Women', 'Children', 'Accessories', 'Sale'];

// function DropdownPill({ label, items }) {
//   const [open, setOpen] = useState(false);

//   return (
//     <div className="pill-wrap">
//       <button
//         className="pill"
//         aria-haspopup="menu"
//         aria-expanded={open}
//         onClick={() => setOpen((v) => !v)}
//         onBlur={(e) => {
//           if (!e.currentTarget.parentElement.contains(e.relatedTarget)) setOpen(false);
//         }}
//       >
//         <span>{label}</span>
//         <ChevronDown size={12} />
//       </button>
//       {open && (
//         <ul className="menu" role="menu">
//           {items.map((item) => (
//             <li key={item}>
//               <a role="menuitem" href="#" onClick={() => setOpen(false)}>
//                 {item}
//               </a>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// }

export default function Header() {
  const [query, setQuery] = useState('');
  const { count } = useCart();

  return (
    <header className="header">
      <div className="header-top">
        <a className="logo" href="#" aria-label="Nextgen home">
          <span className="logo-text">Epic Thrift</span>
        </a>

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
        </nav>
      </div>

      <div className="header-main">
        <nav className="audience" aria-label="Shop by">
          {categories.map((item) => (
            <a key={item} className="pill pill--link" href="#">
              {item}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}