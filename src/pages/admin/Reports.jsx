import { useState } from 'react';
import { Download } from 'lucide-react';
import { useOrders } from '../../context/OrdersContext';
import { useProducts } from '../../context/ProductsContext';
import { formatPrice } from '../../util/price';
import { makeSampleOrders } from '../../util/sampleOrders';
import {
  summarize, inLastDays, dailyRevenue, topProducts, salesByCategory,
  statusCounts, lowStock, ordersToCsv, downloadCsv,
} from '../../util/reports';
import { StatCard } from './ui';

function BarChart({ data }) {
  const W = 640, H = 200, PAD = 24;
  const max = Math.max(...data.map((d) => d.value), 1);
  const slot = (W - PAD * 2) / data.length;
  const barW = Math.max(2, slot * 0.7);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" role="img" aria-label="Revenue per day">
      <line x1={PAD} x2={W - PAD} y1={H - PAD} y2={H - PAD} stroke="#e4e4e7" />
      {data.map((d, i) => {
        const h = (d.value / max) * (H - PAD * 2);
        return (
          <rect key={d.key} x={PAD + i * slot + (slot - barW) / 2} y={H - PAD - h} width={barW} height={h} rx="2" fill="#18181b">
            <title>{`${d.label}: ${formatPrice(d.value)}`}</title>
          </rect>
        );
      })}
      <text x={PAD} y={H - 6} fontSize="10" fill="#71717a">{data[0].label}</text>
      <text x={W - PAD} y={H - 6} fontSize="10" fill="#71717a" textAnchor="end">{data[data.length - 1].label}</text>
    </svg>
  );
}

function HBars({ rows }) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="hbars">
      {rows.map((r) => (
        <div className="hbar" key={r.label}>
          <span>{r.label}</span>
          <div className="hbar-track"><div className="hbar-fill" style={{ width: `${(r.value / max) * 100}%` }} /></div>
          <strong>{formatPrice(r.value)}</strong>
        </div>
      ))}
    </div>
  );
}

export default function Reports() {
  const { orders, addOrders, clearOrders } = useOrders();
  const { catalog } = useProducts();
  const [days, setDays] = useState(30);

  const scoped = inLastDays(orders, days);
  const stats = summarize(scoped);
  const top = topProducts(scoped);
  const categories = salesByCategory(scoped);
  const counts = statusCounts(scoped);
  const low = lowStock(catalog);

  return (
    <>
      <div className="admin-bar">
        <h1 className="admin-h1">Reports</h1>
        <div className="admin-bar-actions">
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} aria-label="Date range">
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            className="btn-secondary"
            disabled={!scoped.length}
            onClick={() => downloadCsv(`orders-last-${days}-days.csv`, ordersToCsv(scoped))}
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {import.meta.env.DEV && (
        <p className="muted dev-note">
          Dev tools:{' '}
          <button className="link-btn" onClick={() => addOrders(makeSampleOrders(catalog))}>add sample orders</button>
          {' · '}
          <button
            className="link-btn"
            onClick={() => window.confirm('Delete ALL orders?') && clearOrders()}
          >
            clear all orders
          </button>
        </p>
      )}

      <div className="stats">
        <StatCard label="Revenue" value={formatPrice(stats.revenue)} />
        <StatCard label="Orders" value={stats.orders} />
        <StatCard label="Units sold" value={stats.units} />
        <StatCard label="Avg. order value" value={formatPrice(stats.avgOrder)} />
      </div>

      <section className="panel">
        <h2>Revenue per day</h2>
        <BarChart data={dailyRevenue(scoped, days)} />
      </section>

      <div className="admin-cols">
        <section className="panel">
          <h2>Top products</h2>
          {top.length === 0 ? (
            <p className="muted">No sales in this period.</p>
          ) : (
            <table className="table">
              <thead><tr><th>Product</th><th className="num">Units</th><th className="num">Revenue</th></tr></thead>
              <tbody>
                {top.map((p) => (
                  <tr key={p.productId}>
                    <td>{p.name}</td>
                    <td className="num">{p.units}</td>
                    <td className="num">{formatPrice(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="panel">
          <h2>Sales by category</h2>
          {categories.length === 0 ? <p className="muted">No sales in this period.</p> : <HBars rows={categories} />}
        </section>
      </div>

      <div className="admin-cols">
        <section className="panel">
          <h2>Orders by status</h2>
          {Object.keys(counts).length === 0 ? (
            <p className="muted">No orders in this period.</p>
          ) : (
            <table className="table">
              <tbody>
                {Object.entries(counts).map(([s, n]) => (
                  <tr key={s}><td><span className={`badge badge--${s}`}>{s}</span></td><td className="num">{n}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="panel">
          <h2>Inventory alerts</h2>
          {low.length === 0 ? (
            <p className="muted">Everything is well stocked.</p>
          ) : (
            <table className="table">
              <tbody>
                {low.slice(0, 8).map(({ product, variant }) => (
                  <tr key={variant.id}>
                    <td>{product.name}</td>
                    <td>{[variant.color, variant.size].filter(Boolean).join(' / ')}</td>
                    <td className="num">{variant.stockQuantity === 0 ? 'out of stock' : `${variant.stockQuantity} left`}</td>
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