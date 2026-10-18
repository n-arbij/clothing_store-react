import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useProducts } from '../../context/ProductsContext';
import { formatPrice, priceSummary } from '../../util/price';

export default function Products() {
  const { catalog, deleteProduct, resetCatalog } = useProducts();
  const [q, setQ] = useState('');

  const rows = catalog.filter(({ product }) =>
    `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(q.trim().toLowerCase())
  );

  const onDelete = (product) => {
    if (window.confirm(`Delete "${product.name}"? This can't be undone.`)) deleteProduct(product.id);
  };

  const onReset = () => {
    if (window.confirm('Replace the whole catalog with the original demo products?')) resetCatalog();
  };

  return (
    <>
      <div className="admin-bar">
        <h1 className="admin-h1">Products</h1>
        <div className="admin-bar-actions">
          {import.meta.env.DEV && (
            <button className="btn-secondary" onClick={onReset}>Reset demo data</button>
          )}
          <Link to="/admin/products/new" className="btn-primary btn-link">
            <Plus size={16} /> Add product
          </Link>
        </div>
      </div>

      <input
        className="admin-search"
        placeholder="Search by name, brand or category"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th className="num">Variants</th>
              <th className="num">In stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ product, variants }) => {
              const { from, to } = priceSummary(variants);
              const stock = variants.reduce((n, v) => n + v.stockQuantity, 0);
              return (
                <tr key={product.id}>
                  <td><img className="thumb" src={variants[0]?.imageUrl} alt="" /></td>
                  <td>
                    <strong>{product.name}</strong>
                    <br />
                    <span className="muted">{product.brand}</span>
                  </td>
                  <td>{product.category}</td>
                  <td>{from === to ? formatPrice(from) : `${formatPrice(from)} – ${formatPrice(to)}`}</td>
                  <td className="num">{variants.length}</td>
                  <td className="num">
                    {stock === 0 ? <span className="badge badge--cancelled">sold out</span> : stock}
                  </td>
                  <td className="row-actions">
                    <Link to={`/admin/products/${product.id}/edit`} aria-label={`Edit ${product.name}`}>
                      <Pencil size={16} />
                    </Link>
                    <button onClick={() => onDelete(product)} aria-label={`Delete ${product.name}`}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr><td colSpan="7" className="muted">No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}