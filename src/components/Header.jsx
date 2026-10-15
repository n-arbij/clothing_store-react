import { useState } from 'react';
import { ChevronDown, Search, ShoppingBag, Heart} from 'lucide-react';
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
          <button className="icon-btn icon-btn--circle" aria-label="Cart">
            <ShoppingBag size={16} />
          </button>
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