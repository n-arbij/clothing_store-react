import { Link } from 'react-router-dom';
import { PackageOpen, Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { mockProducts } from '../data/mockProduct';
import ProductGrid from '../components/ProductGrid'
import './WishlistPage.css';

export default function WishlistPage() {
  const { ids } = useWishlist();
  const items = mockProducts.filter((p) => ids.includes(p.product.id));

  // ---- empty state (matches the screenshot) ----
  if (items.length === 0) {
    return (
      <main className="wish">
        <div className="wish-art" aria-hidden="true">
          <PackageOpen size={72} strokeWidth={1.2} />
          <Heart size={22} fill="#ef4444" strokeWidth={0} className="wish-art-heart" />
        </div>
        <h1 className="wish-title">Your Wishlist is Empty</h1>
        <p className="wish-sub">Tap heart button to start saving your favorite items.</p>
        <Link to="/" className="wish-add">Add Now</Link>
      </main>
    );
  }

  // ---- populated ----
  return (
    <main className="wish wish--full">
      <h1 className="wish-title">Wishlist <span>({items.length})</span></h1>
      <ProductGrid products={items} />
    </main>
  );
}