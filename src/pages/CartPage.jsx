import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, X, Minus, Plus, ChevronDown } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useProducts } from '../context/ProductsContext';
import { useOrders } from '../context/OrdersContext';
import { formatPrice } from '../util/price';
import './CartPage.css';

const SHIPPING_CENTS = 1800; // $18 flat — matches the screenshot

export default function CartPage() {
  const { items, updateQuantity, removeItem, toggleSelected, toggleAll } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { findVariant, adjustStock } = useProducts();
  const { placeOrder } = useOrders();
  const [error, setError] = useState('');

  const lines = items
    .map((i) => ({ ...i, ...findVariant(i.variantId) }))
    .filter((l) => l.variant); // guard against stale ids

  const allSelected = items.length > 0 && items.every((i) => i.selected);
  const selected = lines.filter((l) => l.selected);

  const subtotal = selected.reduce((s, l) => s + l.variant.price * l.quantity, 0);
  const shipping = selected.length ? SHIPPING_CENTS : 0;

  const handleCheckout = () => {
    if (!user) return navigate('/login', { state: { from: '/cart' } });
    const over = selected.find((l) => l.quantity > l.variant.stockQuantity);
    if (over) {
      return setError(`Only ${over.variant.stockQuantity} left of ${over.product.name} (${over.variant.color}).`);
    }
    setError('');
    placeOrder({ user, lines: selected, shipping });
    adjustStock(selected.map((l) => ({ variantId: l.variantId, delta: -l.quantity })));
    selected.forEach((l) => removeItem(l.variantId));
    navigate('/profile');
  };

  return (
    <main className="cart">
      <Link to="/" className="cart-back" aria-label="Continue shopping">
        <ArrowLeft size={18} />
      </Link>

      {lines.length === 0 ? (
        <p className="cart-empty">Your cart is empty.</p>
      ) : (
        <div className="cart-body">
          <section className="cart-items">
            <div className="cart-head">
              <label>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => toggleAll(e.target.checked)}
                />
              </label>
              <div className='cart-head-label'>
                <span>QUANTITY</span>
                <span>TOTAL</span>
              </div>
            </div>

            {lines.map((line) => (
              <article className="cart-row" key={line.variantId}>
                <input
                  type="checkbox"
                  checked={line.selected}
                  onChange={() => toggleSelected(line.variantId)}
                  aria-label={`Select ${line.product.name}`}
                />

                <img className="cart-thumb" src={line.variant.imageUrl} alt="" />

                <div className="cart-info">
                  <p className="cart-name">{line.product.name}</p>
                  <p className="cart-meta">
                    Color: {line.variant.color} / Size: {line.variant.size ?? '—'}
                  </p>
                  <p className="cart-unit">{formatPrice(line.variant.price)}</p>
                </div>

                <div className="cart-qty">
                  <button
                    disabled={line.quantity <= 1}
                    onClick={() => updateQuantity(line.variantId, line.quantity - 1)}
                    aria-label="Decrease quantity"
                  >
                    <Minus size={14} />
                  </button>
                  <span>{line.quantity}</span>
                  <button
                    disabled={line.quantity >= line.variant.stockQuantity}
                    onClick={() => updateQuantity(line.variantId, line.quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <p className="cart-line-total">
                  {formatPrice(line.variant.price * line.quantity)}
                </p>

                <button
                  className="cart-remove"
                  onClick={() => removeItem(line.variantId)}
                  aria-label="Remove item"
                >
                  <X size={16} />
                </button>
              </article>
            ))}
          </section>

          <aside className="cart-summary">
            <h2>SUMMARY</h2>

            <details className="cart-promo">
              <summary>
                Do you have a promo code? <ChevronDown size={14} />
              </summary>
              <div className="cart-promo-row">
                <input placeholder="Enter code" />
                <button>Apply</button>
              </div>
            </details>

            <dl className="cart-lines">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div>
                <dt>International Shipping</dt>
                <dd>{formatPrice(shipping)}</dd>
              </div>
            </dl>

            <div className="cart-total">
              <span>Total</span>
              <strong>{formatPrice(subtotal + shipping)}</strong>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}
            <button className="cart-checkout" disabled={!selected.length} onClick={handleCheckout}>
              CHECK OUT
            </button>
            <button className="cart-paypal">
              Check out with <strong>&nbsp;PayPal</strong>
            </button>

            <div className="cart-notes">
              <h4>FREE SHIPPING</h4>
              <p>Your order qualifies for free shipping on every order, every time.</p>
              <h4>NEED HELP?</h4>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}