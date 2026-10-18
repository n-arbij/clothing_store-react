const DAY = 24 * 60 * 60 * 1000;

// cancelled orders never count toward revenue / sales figures
export const activeOrders = (orders) => orders.filter((o) => o.status !== 'cancelled');

export const inLastDays = (orders, days, now = Date.now()) =>
  orders.filter((o) => new Date(o.createdAt).getTime() >= now - days * DAY);

export function summarize(orders) {
  const active = activeOrders(orders);
  const revenue = active.reduce((s, o) => s + o.total, 0);
  const units = active.reduce((s, o) => s + o.items.reduce((n, i) => n + i.quantity, 0), 0);
  return {
    revenue,
    orders: active.length,
    units,
    avgOrder: active.length ? Math.round(revenue / active.length) : 0,
  };
}

const dayKey = (d) => d.toLocaleDateString('en-CA'); // YYYY-MM-DD in local time

export function dailyRevenue(orders, days, now = new Date()) {
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    buckets.push({ key: dayKey(d), label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), value: 0 });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const o of activeOrders(orders)) {
    const b = byKey.get(dayKey(new Date(o.createdAt)));
    if (b) b.value += o.total;
  }
  return buckets;
}

export function topProducts(orders, limit = 5) {
  const map = new Map();
  for (const o of activeOrders(orders)) {
    for (const i of o.items) {
      const row = map.get(i.productId) ?? { productId: i.productId, name: i.name, units: 0, revenue: 0 };
      row.units += i.quantity;
      row.revenue += i.unitPrice * i.quantity;
      map.set(i.productId, row);
    }
  }
  return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export function salesByCategory(orders) {
  const map = new Map();
  for (const o of activeOrders(orders)) {
    for (const i of o.items) {
      map.set(i.category, (map.get(i.category) ?? 0) + i.unitPrice * i.quantity);
    }
  }
  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

export function statusCounts(orders) {
  const counts = {};
  for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
  return counts;
}

export function lowStock(catalog, threshold = 5) {
  return catalog
    .flatMap(({ product, variants }) => variants.map((variant) => ({ product, variant })))
    .filter(({ variant }) => variant.stockQuantity <= threshold)
    .sort((a, b) => a.variant.stockQuantity - b.variant.stockQuantity);
}

const csvCell = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export function ordersToCsv(orders) {
  const head = ['Order', 'Date', 'Customer', 'Email', 'Status', 'Items', 'Subtotal', 'Shipping', 'Total'];
  const rows = orders.map((o) => [
    o.id,
    new Date(o.createdAt).toISOString(),
    o.customerName,
    o.customerEmail,
    o.status,
    o.items.reduce((n, i) => n + i.quantity, 0),
    (o.subtotal / 100).toFixed(2),
    (o.shipping / 100).toFixed(2),
    (o.total / 100).toFixed(2),
  ]);
  return [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
}

export function downloadCsv(filename, csv) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}