import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'epicthrift-cart';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) ?? [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  // max (optional): the variant's stock, so repeated "Add to cart" clicks can't exceed it
  const addItem = useCallback((variantId, quantity = 1, max = Infinity) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === variantId);
      if (existing) {
        const next = Math.min(existing.quantity + quantity, max);
        return prev.map((i) => (i.variantId === variantId ? { ...i, quantity: next } : i));
      }
      return [...prev, { variantId, quantity: Math.min(quantity, max), selected: true }];
    });
  }, []);

  const updateQuantity = useCallback((variantId, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );
  }, []);

  const removeItem = useCallback((variantId) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  }, []);

  const toggleSelected = useCallback((variantId) => {
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, selected: !i.selected } : i))
    );
  }, []);

  const toggleAll = useCallback((selected) => {
    setItems((prev) => prev.map((i) => ({ ...i, selected })));
  }, []);

  const count = useMemo(() => items.reduce((n, i) => n + i.quantity, 0), [items]);

  const value = useMemo(
    () => ({ items, count, addItem, updateQuantity, removeItem, toggleSelected, toggleAll }),
    [items, count, addItem, updateQuantity, removeItem, toggleSelected, toggleAll]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}