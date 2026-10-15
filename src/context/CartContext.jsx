import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('nextgen-cart')) ?? [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('nextgen-cart', JSON.stringify(items));
  }, [items]);

  const addItem = (variantId, quantity = 1) =>
    setItems((prev) => {
      const existing = prev.find((i) => i.variantId === variantId);
      return existing
        ? prev.map((i) =>
            i.variantId === variantId ? { ...i, quantity: i.quantity + quantity } : i
          )
        : [...prev, { variantId, quantity, selected: true }];
    });

  const updateQuantity = (variantId, quantity) =>
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.variantId !== variantId)
        : prev.map((i) => (i.variantId === variantId ? { ...i, quantity } : i))
    );

  const removeItem = (variantId) =>
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));

  const toggleSelected = (variantId) =>
    setItems((prev) =>
      prev.map((i) => (i.variantId === variantId ? { ...i, selected: !i.selected } : i))
    );

  const toggleAll = (selected) =>
    setItems((prev) => prev.map((i) => ({ ...i, selected })));

  const count = items.reduce((n, i) => n + i.quantity, 0);

  const value = useMemo(
    () => ({ items, count, addItem, updateQuantity, removeItem, toggleSelected, toggleAll }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}