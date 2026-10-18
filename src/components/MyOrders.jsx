import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { formatPrice } from '../util/price';
import { formatDate } from '../util/format';

export default function MyOrders() {
  const { user } = useAuth();
  const { orders } = useOrders();
  const mine = orders.filter((o) => o.userId === user.id);

  if (!mine.length) return <p className="my-orders-empty">You haven't placed any orders yet.</p>;

  return (
    <ul className="my-orders">
      {mine.map((o) => (
        <li key={o.id}>
          <div>
            <strong>{o.id}</strong>
            <span>{formatDate(o.createdAt)}</span>
          </div>
          <p>
            {o.items.map((i) => `${i.quantity} × ${i.name}`).join(', ')}
          </p>
          <div>
            <span className={`my-orders-status my-orders-status--${o.status}`}>{o.status}</span>
            <strong>{formatPrice(o.total)}</strong>
          </div>
        </li>
      ))}
    </ul>
  );
}