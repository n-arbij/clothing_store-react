import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'epicthrift-orders';

// eslint-disable-next-line react-refresh/only-export-components
export const ORDER_STATUSES = ['pending', 'shipped', 'delivered', 'cancelled'];

// eslint-disable-next-line react-refresh/only-export-components
export const newOrderId = () => `ORD-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

const load = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(stored) ? stored : [];
  } catch {
    return [];
  }
};

const OrdersContext = createContext(null);

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(orders));
  }, [orders]);

  // lines: [{ product, variant, quantity }]. Item data is snapshotted so later
  // catalog edits (price changes, deletions) never rewrite order history.
  const placeOrder = useCallback(({ user, lines, shipping }) => {
    const items = lines.map(({ product, variant, quantity }) => ({
      variantId: variant.id,
      productId: product.id,
      name: product.name,
      category: product.category,
      sku: variant.sku,
      color: variant.color,
      size: variant.size,
      unitPrice: variant.price,
      quantity,
    }));
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    const order = {
      id: newOrderId(),
      userId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      status: 'pending',
      shippingAddress: user.address ?? null,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [order, ...prev]);
    return order;
  }, []);

  const updateOrderStatus = useCallback((id, status) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
  }, []);

  const addOrders = useCallback((list) => {
    setOrders((prev) => [...list, ...prev].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }, []);

  const clearOrders = useCallback(() => setOrders([]), []);

  const value = useMemo(
    () => ({ orders, placeOrder, updateOrderStatus, addOrders, clearOrders }),
    [orders, placeOrder, updateOrderStatus, addOrders, clearOrders]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useOrders() {
  const ctx = useContext(OrdersContext);
  if (!ctx) throw new Error('useOrders must be used within OrdersProvider');
  return ctx;
}