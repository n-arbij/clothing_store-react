import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingBag, Heart, Truck, Star, ChevronRight } from 'lucide-react';
import { formatPrice } from '../util/price';
import { mockProducts } from '../data/mockProduct'
import { useCart } from '../context/CartContext';
import './ProductPage.css';

function StarRating({ rating }) {
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          fill="currentColor"
          className={i <= Math.round(rating) ? 'star--on' : 'star--off'}
        />
      ))}
    </span>
  );
}

export default function ProductPage() {
  const { slug } = useParams();
  const { product, variants } = mockProducts.find((p) => p.product.slug === slug);

  // one swatch per color (first variant of each color provides its image)
  const colorOptions = [...new Map(variants.map((v) => [v.color, v])).values()];
  const [color, setColor] = useState(colorOptions[0]?.color);

  const sizeOptions = variants.filter((v) => v.color === color);
  const [size, setSize] = useState(null);

  const variant = sizeOptions.find((v) => v.size === size);

  const images = product.images?.length
    ? product.images
    : [variant?.imageUrl ?? product.imageUrl];
  const [imgIndex, setImgIndex] = useState(0);

  const { addItem } = useCart();
  const handleAdd = () => addItem(variant.id);

  return (
    <main className="pdp">
      <nav className="pdp-crumb" aria-label="Breadcrumb">
        <Link to="/">{product.category}</Link>
        <ChevronRight size={12} />
        <span>{product.brand}</span>
      </nav>

      <div className="pdp-body">
        {/* ---- gallery ---- */}
        <div className="pdp-gallery">
          <div className="pdp-main">
            <img src={images[imgIndex]} alt={product.name} />
          </div>
          <div className="pdp-thumbs">
            {images.slice(0, 4).map((src, i) => (
              <button
                key={src}
                className={`pdp-thumb ${i === imgIndex ? 'is-active' : ''}`}
                onClick={() => setImgIndex(i)}
              >
                <img src={src} alt="" />
              </button>
            ))}
            {images.length > 4 && (
              <button
                className="pdp-thumb pdp-thumb--more"
                onClick={() => setImgIndex(4)}
              >
                +{images.length - 4} more
              </button>
            )}
          </div>
        </div>

        {/* ---- info ---- */}
        <div className="pdp-info">
          <div className="pdp-brandrow">
            <span className="pdp-brand">
              <span className="pdp-brandlogo">{product.brand[0]}</span>
              {product.brand}
            </span>
            <span className="pdp-sku">{variant?.sku ?? sizeOptions[0]?.sku}</span>
          </div>

          <h1 className="pdp-title">{product.name}</h1>

          <div className="pdp-rating">
            <StarRating rating={product.rating} />
            <span className="pdp-reviews">{product.reviewsCount} reviews</span>
          </div>

          <p className="pdp-price">
            {variant?.compareAtPrice && (
              <s>{formatPrice(variant.compareAtPrice)}</s>
            )}
            {formatPrice(variant?.price ?? sizeOptions[0]?.price)}
          </p>

          <section className="pdp-section">
            <div className="pdp-label">
              Color <span>{color}</span>
            </div>
            <div className="pdp-swatches">
              {colorOptions.map((v) => (
                <button
                  key={v.color}
                  className={`pdp-swatch ${v.color === color ? 'is-active' : ''}`}
                  title={v.color}
                  onClick={() => {
                    setColor(v.color);
                    setSize(null); // reset — size availability differs per color
                    setImgIndex(0);
                  }}
                >
                  <img src={v.imageUrl} alt={v.color} />
                </button>
              ))}
            </div>
          </section>

          <section className="pdp-section">
            <div className="pdp-label">
              Size <span>EU Men</span>
            </div>
            <div className="pdp-sizes">
              {sizeOptions.map((v) => (
                <button
                  key={v.id}
                  className={`pdp-size ${v.size === size ? 'is-active' : ''}`}
                  disabled={v.stockQuantity === 0}
                  onClick={() => setSize(v.size)}
                >
                  {v.size}
                </button>
              ))}
            </div>
            <a href="#" className="pdp-sizeguide">Size guide</a>
          </section>

          <div className="pdp-actions">
            <button
              className="pdp-add"
              disabled={!variant || variant.stockQuantity === 0}
              onClick={handleAdd}
            >
              <ShoppingBag size={16} />
              Add to cart
            </button>
            <button className="pdp-wish" aria-label="Add to wishlist">
              <Heart size={16} />
            </button>
          </div>

          <p className="pdp-shipping">
            <Truck size={16} />
            Free delivery on orders over $30.0
          </p>
        </div>
      </div>
    </main>
  );
}