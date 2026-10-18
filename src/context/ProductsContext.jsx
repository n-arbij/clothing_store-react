import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { mockProducts } from '../data/mockProduct';
import { slugify } from '../util/slug';

/*
 * Catalog store. Same shape as mockProducts: [{ product, variants }].
 * Seeded from mock data, then persisted to localStorage so admin edits survive reloads.
 * Swap the bodies for API calls when a backend exists.
 */

const KEY = 'epicthrift-products';

const load = () => {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(stored) ? stored : mockProducts;
  } catch {
    return mockProducts;
  }
};

const maxId = (ids) => ids.reduce((m, n) => Math.max(m, n), 0);
const nextVariantId = (catalog) => maxId(catalog.flatMap((p) => p.variants.map((v) => v.id))) + 1;

const assignVariantIds = (variants, productId, startId) => {
  let next = startId;
  return variants.map((v) => ({ ...v, productId, id: v.id ?? next++ }));
};

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [catalog, setCatalog] = useState(load);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(catalog));
  }, [catalog]);

  const uniqueSlug = useCallback(
    (base, ignoreId) => {
      const root = base || 'product';
      let slug = root;
      let n = 2;
      while (catalog.some((p) => p.product.slug === slug && p.product.id !== ignoreId)) {
        slug = `${root}-${n++}`;
      }
      return slug;
    },
    [catalog]
  );

  const addProduct = useCallback(
    ({ product, variants }) => {
      const id = maxId(catalog.map((p) => p.product.id)) + 1;
      const entry = {
        product: {
          rating: 0,
          reviewsCount: 0,
          ...product,
          id,
          slug: uniqueSlug(slugify(product.slug || product.name)),
        },
        variants: assignVariantIds(variants, id, nextVariantId(catalog)),
      };
      setCatalog((prev) => [...prev, entry]);
      return entry.product;
    },
    [catalog, uniqueSlug]
  );

  const updateProduct = useCallback(
    (id, { product, variants }) => {
      const start = nextVariantId(catalog);
      const slug = uniqueSlug(slugify(product.slug || product.name), id);
      setCatalog((prev) =>
        prev.map((p) =>
          p.product.id !== id
            ? p
            : {
                product: { ...p.product, ...product, id, slug },
                variants: assignVariantIds(variants, id, start),
              }
        )
      );
    },
    [catalog, uniqueSlug]
  );

  const deleteProduct = useCallback((id) => {
    setCatalog((prev) => prev.filter((p) => p.product.id !== id));
  }, []);

  // changes: [{ variantId, delta }] — negative to sell, positive to restock
  const adjustStock = useCallback((changes) => {
    setCatalog((prev) =>
      prev.map((p) => ({
        ...p,
        variants: p.variants.map((v) => {
          const delta = changes.filter((c) => c.variantId === v.id).reduce((s, c) => s + c.delta, 0);
          return delta ? { ...v, stockQuantity: Math.max(0, v.stockQuantity + delta) } : v;
        }),
      }))
    );
  }, []);

  const resetCatalog = useCallback(() => setCatalog(mockProducts), []);

  const findVariant = useCallback(
    (variantId) => {
      for (const { product, variants } of catalog) {
        const variant = variants.find((v) => v.id === variantId);
        if (variant) return { product, variant };
      }
      return null;
    },
    [catalog]
  );

  const value = useMemo(
    () => ({ catalog, addProduct, updateProduct, deleteProduct, adjustStock, resetCatalog, findVariant }),
    [catalog, addProduct, updateProduct, deleteProduct, adjustStock, resetCatalog, findVariant]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within ProductsProvider');
  return ctx;
}