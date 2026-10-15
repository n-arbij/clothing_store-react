import { Link } from 'react-router-dom';
import { formatPrice, priceSummary } from '../util/price';
import './ProductCard.css'

export default function ProductCard({ product, variants }) {
  const soldOut = variants.every((v) => v.stockQuantity === 0);
  const { from, to, onSale, compareAt } = priceSummary(variants);

  return (
    <article className="card">
      <Link to={`/products/${product.slug}`} className="card-media">
        <img
          src={variants[0].imageUrl ?? product.imageUrl}
          alt={product.name}
          loading="lazy"
        />
        {soldOut && <span className="card-badge">Sold out</span>}
      </Link>

      <h3 className="card-name">{product.name}</h3>

      <p className="card-price">
        {onSale && compareAt != null && <s>{formatPrice(compareAt)}</s>}
        <span className={onSale ? 'card-price--sale' : ''}>
          {from !== to ? `From ${formatPrice(from)}` : formatPrice(from)}
        </span>
      </p>
    </article>
  );
}