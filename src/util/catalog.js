import { mockProducts } from '../data/mockProduct';

export function findVariant(variantId) {
  for (const { product, variants } of mockProducts) {
    const variant = variants.find((v) => v.id === variantId);
    if (variant) return { product, variant };
  }
  return null;
}