const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

export const mockProducts = [
  {
    product: { id: 1, name: 'Ceramic Plant Pot', slug: 'ceramic-plant-pot', category: 'home' },
    variants: [
      { id: 11, productId: 1, sku: 'CPP-WHT', size: null, color: 'White', price: 3400, compareAtPrice: null, stockQuantity: 12, imageUrl: img('pot') },
    ],
  },
  {
    product: { id: 2, name: 'Black Paper Clip', slug: 'black-paper-clip', category: 'office' },
    variants: [
      { id: 21, productId: 2, sku: 'BPC-BLK', size: null, color: 'Black', price: 1000, compareAtPrice: 2300, stockQuantity: 5, imageUrl: img('clip') },
    ],
  },
  {
    product: { id: 3, name: 'Colored Design Box', slug: 'colored-design-box', category: 'office' },
    variants: [
      { id: 31, productId: 3, sku: 'CDB-BLU', size: null, color: 'Blue', price: 12600, compareAtPrice: null, stockQuantity: 0, imageUrl: img('box') },
    ],
  },
];