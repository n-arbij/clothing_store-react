import { newOrderId } from '../context/OrdersContext';

const CUSTOMERS = [
  ['Amina Yusuf', 'amina@example.com'],
  ['Brian Otieno', 'brian@example.com'],
  ['Chloe Martin', 'chloe@example.com'],
  ['Daniel Kimani', 'daniel@example.com'],
  ['Esther Wanjiru', 'esther@example.com'],
];
const STATUSES = ['delivered', 'delivered', 'delivered', 'shipped', 'pending', 'cancelled'];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Dev helper: random orders over the last 60 days built from the current catalog.
export function makeSampleOrders(catalog, count = 40) {
  const pool = catalog.flatMap(({ product, variants }) => variants.map((variant) => ({ product, variant })));
  if (!pool.length) return [];

  return Array.from({ length: count }, () => {
    const [customerName, customerEmail] = pick(CUSTOMERS);
    const items = Array.from({ length: 1 + Math.floor(Math.random() * 3) }, () => {
      const { product, variant } = pick(pool);
      return {
        variantId: variant.id,
        productId: product.id,
        name: product.name,
        category: product.category,
        sku: variant.sku,
        color: variant.color,
        size: variant.size,
        unitPrice: variant.price,
        quantity: 1 + Math.floor(Math.random() * 3),
      };
    });
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const shipping = 1800;
    return {
      id: newOrderId(),
      userId: null,
      customerName,
      customerEmail,
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      status: pick(STATUSES),
      shippingAddress: null,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
}