const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

const shoeSizes = ['40.5', '41', '42', '43', '43.5', '44', '44.5', '45', '46'];

const shoeVariants = ['White', 'Gray', 'Black'].flatMap((color, ci) =>
  shoeSizes.map((size, si) => ({
    id: 400 + ci * 10 + si,
    productId: 4,
    sku: `HR1325R00-${color.slice(0, 3).toUpperCase()}-${size}`,
    size,
    color,
    price: 19900,
    compareAtPrice: null,
    // deterministic: exactly one sold-out combo (White/46) to demo disabled state
    stockQuantity: color === 'White' && size === '46' ? 0 : 6,
    imageUrl: img(`shoe-${color.toLowerCase()}`),
  }))
);

export const mockProducts = [
  {
    product: {
      id: 1,
      name: 'Ceramic Plant Pot',
      slug: 'ceramic-plant-pot',
      category: 'home',
      brand: 'Atelier Nord',
      rating: 4.5,
      reviewsCount: 18,
      images: ['pot-1', 'pot-2', 'pot-3', 'pot-4'].map(img),
    },
    variants: [
      { id: 11, productId: 1, sku: 'CPP-WHT',      size: null, color: 'White',      price: 3400, compareAtPrice: null, stockQuantity: 12, imageUrl: img('pot-white') },
      { id: 12, productId: 1, sku: 'CPP-TER',      size: null, color: 'Terracotta', price: 3400, compareAtPrice: null, stockQuantity: 4,  imageUrl: img('pot-terracotta') },
      { id: 13, productId: 1, sku: 'CPP-BLK',      size: null, color: 'Black',      price: 3600, compareAtPrice: null, stockQuantity: 0,  imageUrl: img('pot-black') },
    ],
  },
  {
    product: {
      id: 2,
      name: 'Black Paper Clip',
      slug: 'black-paper-clip',
      category: 'office',
      brand: 'Monograph',
      rating: 3.5,
      reviewsCount: 12,
      images: ['clip-1', 'clip-2', 'clip-3'].map(img),
    },
    variants: [
      { id: 21, productId: 2, sku: 'BPC-BLK-S',  size: 'S',  color: 'Black',  price: 1000, compareAtPrice: 2300, stockQuantity: 5,  imageUrl: img('clip-black') },
      { id: 22, productId: 2, sku: 'BPC-BLK-L',  size: 'L',  color: 'Black',  price: 1400, compareAtPrice: 2600, stockQuantity: 8,  imageUrl: img('clip-black') },
      { id: 23, productId: 2, sku: 'BPC-SLV-S',  size: 'S',  color: 'Silver', price: 1200, compareAtPrice: null, stockQuantity: 0,  imageUrl: img('clip-silver') },
    ],
  },
  {
    product: {
      id: 3,
      name: 'Colored Design Box',
      slug: 'colored-design-box',
      category: 'office',
      brand: 'Pantone',
      rating: 5,
      reviewsCount: 7,
      images: ['box-1', 'box-2', 'box-3', 'box-4', 'box-5'].map(img),
    },
    variants: [
      // whole product is sold out — card should show the "Sold out" badge
      { id: 31, productId: 3, sku: 'CDB-BLU', size: null, color: 'Blue',  price: 12600, compareAtPrice: null, stockQuantity: 0, imageUrl: img('box-blue') },
      { id: 32, productId: 3, sku: 'CDB-RED', size: null, color: 'Red',   price: 12600, compareAtPrice: null, stockQuantity: 0, imageUrl: img('box-red') },
    ],
  },
  {
    product: {
      id: 4,
      name: 'Shoes Reebok Zig Kinetica 3',
      slug: 'reebok-zig-kinetica-3',
      category: 'Clothes and shoes',
      brand: 'Reebok',
      rating: 4,
      reviewsCount: 42,
      images: ['shoe1', 'shoe2', 'shoe3', 'shoe4', 'shoe5', 'shoe6'].map(img),
    },
    variants: shoeVariants,
  },
];