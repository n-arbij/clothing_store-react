export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}

// A product card shows one price, but variants may differ.
// Show "From $X" when they do; surface a sale if any variant has compareAtPrice.
export function priceSummary(variants) {
  const prices = variants.map((v) => v.price);
  const from = Math.min(...prices);
  const to = Math.max(...prices);

  const onSale = variants.some((v) => v.compareAtPrice && v.compareAtPrice > v.price);
  const compareAt = onSale
    ? Math.max(...variants.filter((v) => v.compareAtPrice).map((v) => v.compareAtPrice))
    : null;

  return { from, to, onSale, compareAt };
}