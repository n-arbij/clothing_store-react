import ProductCard from "./ProductCard";

export default function ProductGrid({ products }) {
  return (
    <div className="grid">
      {products.map((p) => (
        <ProductCard key={p.product.id} product={p.product} variants={p.variants} />
      ))}
    </div>
  );
}