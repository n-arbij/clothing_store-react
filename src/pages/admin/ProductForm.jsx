import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';

const blankVariant = () => ({
  key: crypto.randomUUID(),
  sku: '',
  color: '',
  size: '',
  price: '',
  compareAtPrice: '',
  stockQuantity: '0',
  imageUrl: '',
});

const toDollars = (cents) => (cents == null ? '' : (cents / 100).toFixed(2));

const fromEntry = ({ product, variants }) => ({
  name: product.name,
  slug: product.slug,
  category: product.category,
  brand: product.brand,
  images: (product.images ?? []).join('\n'),
  variants: variants.map((v) => ({
    key: crypto.randomUUID(),
    id: v.id,
    sku: v.sku,
    color: v.color ?? '',
    size: v.size ?? '',
    price: toDollars(v.price),
    compareAtPrice: toDollars(v.compareAtPrice),
    stockQuantity: String(v.stockQuantity),
    imageUrl: v.imageUrl ?? '',
  })),
});

const emptyForm = () => ({
  name: '',
  slug: '',
  category: '',
  brand: '',
  images: '',
  variants: [blankVariant()],
});

function FormBody({ entry }) {
  const navigate = useNavigate();
  const { addProduct, updateProduct } = useProducts();
  const editing = Boolean(entry);

  const [form, setForm] = useState(() => (entry ? fromEntry(entry) : emptyForm()));
  const [error, setError] = useState('');

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const setVariant = (key, field) => (e) =>
    setForm((f) => ({
      ...f,
      variants: f.variants.map((v) => (v.key === key ? { ...v, [field]: e.target.value } : v)),
    }));
  const addVariant = () => setForm((f) => ({ ...f, variants: [...f.variants, blankVariant()] }));
  const removeVariant = (key) =>
    setForm((f) => ({ ...f, variants: f.variants.filter((v) => v.key !== key) }));

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');

    const images = form.images.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!form.variants.length) return setError('Add at least one variant.');

    const seen = new Set();
    const variants = [];
    for (const [i, v] of form.variants.entries()) {
      const label = `Variant ${i + 1}`;
      const sku = v.sku.trim();
      const price = Math.round(parseFloat(v.price) * 100);
      const compare = v.compareAtPrice === '' ? null : Math.round(parseFloat(v.compareAtPrice) * 100);
      const stock = Number(v.stockQuantity);
      const imageUrl = v.imageUrl.trim() || images[0] || '';

      if (!sku) return setError(`${label}: SKU is required.`);
      if (seen.has(sku)) return setError(`${label}: SKU "${sku}" is used twice.`);
      seen.add(sku);
      if (!(price > 0)) return setError(`${label}: enter a valid price.`);
      if (compare !== null && !(compare > price)) {
        return setError(`${label}: compare-at price must be higher than the price (or leave it blank).`);
      }
      if (!Number.isInteger(stock) || stock < 0) return setError(`${label}: stock must be a whole number, 0 or more.`);
      if (!imageUrl) return setError(`${label}: add an image URL here or in the product images.`);

      variants.push({
        id: v.id,
        sku,
        color: v.color.trim() || 'Default',
        size: v.size.trim() || null,
        price,
        compareAtPrice: compare,
        stockQuantity: stock,
        imageUrl,
      });
    }

    const product = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      category: form.category.trim(),
      brand: form.brand.trim(),
      images,
    };

    if (editing) updateProduct(entry.product.id, { product, variants });
    else addProduct({ product, variants });
    navigate('/admin/products');
  };

  return (
    <>
      <h1 className="admin-h1">{editing ? 'Edit product' : 'Add product'}</h1>

      <form className="auth-form product-form" onSubmit={onSubmit}>
        {error && <p className="form-error" role="alert">{error}</p>}

        <section className="panel">
          <h2>Details</h2>
          <div className="form-grid">
            <label className="field">
              Name
              <input value={form.name} onChange={set('name')} required />
            </label>
            <label className="field">
              Brand
              <input value={form.brand} onChange={set('brand')} required />
            </label>
            <label className="field">
              Category
              <input value={form.category} onChange={set('category')} placeholder="e.g. shoes, tops, home" required />
            </label>
            <label className="field">
              Slug <span className="field-hint">(URL — leave blank to generate from the name)</span>
              <input value={form.slug} onChange={set('slug')} />
            </label>
            <label className="field form-wide">
              Image URLs <span className="field-hint">(one per line; the first is the main image)</span>
              <textarea rows="4" value={form.images} onChange={set('images')} />
            </label>
          </div>
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Variants</h2>
            <button type="button" className="btn-secondary" onClick={addVariant}>
              <Plus size={14} /> Add variant
            </button>
          </div>
          <p className="muted">Prices are in dollars. Leave size blank for one-size items.</p>

          {form.variants.map((v, i) => (
            <div className="variant-row" key={v.key}>
              <p className="variant-title">
                Variant {i + 1}
                {form.variants.length > 1 && (
                  <button type="button" onClick={() => removeVariant(v.key)} aria-label={`Remove variant ${i + 1}`}>
                    <X size={14} />
                  </button>
                )}
              </p>
              <div className="form-grid form-grid--4">
                <label className="field">SKU<input value={v.sku} onChange={setVariant(v.key, 'sku')} /></label>
                <label className="field">Color<input value={v.color} onChange={setVariant(v.key, 'color')} /></label>
                <label className="field">Size<input value={v.size} onChange={setVariant(v.key, 'size')} /></label>
                <label className="field">
                  Stock
                  <input type="number" min="0" step="1" value={v.stockQuantity} onChange={setVariant(v.key, 'stockQuantity')} />
                </label>
                <label className="field">
                  Price ($)
                  <input type="number" min="0" step="0.01" value={v.price} onChange={setVariant(v.key, 'price')} />
                </label>
                <label className="field">
                  Compare-at ($)
                  <input type="number" min="0" step="0.01" value={v.compareAtPrice} onChange={setVariant(v.key, 'compareAtPrice')} />
                </label>
                <label className="field form-span2">
                  Variant image URL <span className="field-hint">(blank = first product image)</span>
                  <input value={v.imageUrl} onChange={setVariant(v.key, 'imageUrl')} />
                </label>
              </div>
            </div>
          ))}
        </section>

        <div className="admin-bar-actions">
          <button className="btn-primary">{editing ? 'Save changes' : 'Create product'}</button>
          <Link to="/admin/products" className="btn-secondary btn-link">Cancel</Link>
        </div>
      </form>
    </>
  );
}

export default function ProductForm() {
  const { id } = useParams();
  const { catalog } = useProducts();
  const entry = id === undefined ? null : catalog.find((p) => String(p.product.id) === id);

  if (id !== undefined && !entry) {
    return (
      <p>
        Product not found. <Link to="/admin/products">Back to products</Link>
      </p>
    );
  }
  // key resets the form state when switching between products
  return <FormBody key={id ?? 'new'} entry={entry} />;
}