import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('epicthrift-wishlist')) ?? [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('epicthrift-wishlist', JSON.stringify(ids));
  }, [ids]);

  const toggle = (productId) =>
    setIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );

  const value = useMemo(
    () => ({ ids, toggle, has: (productId) => ids.includes(productId) }),
    [ids]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}