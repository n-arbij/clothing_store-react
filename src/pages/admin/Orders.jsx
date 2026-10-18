import { Fragment, useState } from 'react';
import { useOrders, ORDER_STATUSES } from '../../context/OrdersContext';
import { useProducts } from '../../context/ProductsContext';
import { formatPrice } from '../../util/price';
import { formatDate } from '../../util/format';

export default function Orders() {
  const { orders, updateOrderStatus } = useOrders();
  const { adjustStock } = useProducts();
  const [status, setStatus] = useState('all');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(null);

  const needle = q.trim().toLowerCase();
  const rows = orders.filter(
    (o) =>
      (status === 'all' || o.status === status) &&
      (!needle || `${o.id} ${o.customerName} ${o.customerEmail}`.toLowerCase().includes(needle))
  );

  const onStatus = (order, next) => {
    // cancelling returns the stock; un-cancelling takes it out again
    const wasCancelled = order.status === 'cancelled';
    const willCancel = next === 'cancelled';
    if (wasCancelled !== willCancel) {
      const sign = willCancel ? 1 : -1;
      adjustStock(order.items.map((i) => ({ variantId: i.variantId, delta: sign * i.quantity })));
    }
    updateOrderStatus(order.id, next);
  };

  return (
    <>
      <h1 className="admin-h1">Orders</h1>

      <div className="admin-bar-actions admin-filters">
        <input
          className="admin-search"
          placeholder="Search by order, name or email"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          <option value="all">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Customer</th>
              <th className="num">Items</th>
              <th className="num">Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <Fragment key={o.id}>
                <tr>
                  <td>
                    <button className="link-btn" onClick={() => setOpen(open === o.id ? null : o.id)}>
                      {o.id}
                    </button>
                  </td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>
                    {o.customerName}
                    <br />
                    <span className="muted">{o.customerEmail}</span>
                  </td>
                  <td className="num">{o.items.reduce((n, i) => n + i.quantity, 0)}</td>
                  <td className="num">{formatPrice(o.total)}</td>
                  <td>
                    <select
                      className={`status-select badge--${o.status}`}
                      value={o.status}
                      onChange={(e) => onStatus(o, e.target.value)}
                      aria-label={`Status for ${o.id}`}
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
                {open === o.id && (
                  <tr className="order-detail">
                    <td colSpan="6">
                      {o.items.map((i) => (
                        <p key={`${i.variantId}-${i.sku}`}>
                          {i.quantity} × {i.name} ({[i.color, i.size].filter(Boolean).join(' / ')}) —{' '}
                          {formatPrice(i.unitPrice * i.quantity)}
                        </p>
                      ))}
                      <p className="muted">
                        Subtotal {formatPrice(o.subtotal)} · Shipping {formatPrice(o.shipping)} · Total {formatPrice(o.total)}
                      </p>
                      {o.shippingAddress?.line1 && (
                        <p className="muted">
                          Ship to: {o.shippingAddress.line1}, {o.shippingAddress.city} {o.shippingAddress.postalCode},{' '}
                          {o.shippingAddress.country}
                        </p>
                      )}
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan="6" className="muted">No orders found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}