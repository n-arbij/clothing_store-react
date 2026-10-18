import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import { useProducts } from '../../context/ProductsContext';
import { formatPrice } from '../../util/price';
import { formatDate } from '../../util/format';
import { summarize, lowStock } from '../../util/reports';
import { StatCard, StatusBadge } from './ui';

export default function Dashboard() {
  const { listUsers } = useAuth();
  const { orders } = useOrders();
  const { catalog } = useProducts();

  const stats = summarize(orders);
  const customers = listUsers().filter((u) => u.role === 'customer').length;
  const low = lowStock(catalog);
  const pending = orders.filter((o) => o.status === 'pending').length;

  return (
    <>
      <h1 className="admin-h1">Dashboard</h1>

      <div className="stats">
        <StatCard label="Revenue" value={formatPrice(stats.revenue)} hint="excludes cancelled" />
        <StatCard label="Orders" value={stats.orders} hint={`${pending} pending`} />
        <StatCard label="Customers" value={customers} />
        <StatCard label="Low / out of stock" value={low.length} hint="variants at 5 or fewer" />
      </div>

      <div className="admin-cols">
        <section className="panel">
          <div className="panel-head">
            <h2>Recent orders</h2>
            <Link to="/admin/orders">View all</Link>
          </div>
          {orders.length === 0 ? (
            <p className="muted">No orders yet.</p>
          ) : (
            <table className="table">
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id}>
                    <td>{o.id}</td>
                    <td>{o.customerName}</td>
                    <td>{formatDate(o.createdAt)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="num">{formatPrice(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="panel">
          <div className="panel-head">
            <h2>Needs restocking</h2>
            <Link to="/admin/products">Manage</Link>
          </div>
          {low.length === 0 ? (
            <p className="muted">Everything is well stocked.</p>
          ) : (
            <table className="table">
              <tbody>
                {low.slice(0, 6).map(({ product, variant }) => (
                  <tr key={variant.id}>
                    <td>{product.name}</td>
                    <td>{[variant.color, variant.size].filter(Boolean).join(' / ')}</td>
                    <td className="num">
                      <span className={variant.stockQuantity === 0 ? 'badge badge--cancelled' : 'badge badge--pending'}>
                        {variant.stockQuantity === 0 ? 'out' : `${variant.stockQuantity} left`}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
    </div>
    </>
  );
}