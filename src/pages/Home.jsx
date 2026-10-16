import './Home.css'
import ProductGrid from '../components/ProductGrid';
import { mockProducts } from '../data/mockProduct';

const categories = ['Men', 'Women', 'Children', 'Accessories', 'Sale'];

export default function Home () {
    return (
        <>
        <main>
            <div className="main-header">
                <nav className="audience" aria-label="Shop by">
                {categories.map((item) => (
                    <a key={item} className="pill pill--link" href="#">
                    {item}
                    </a>
                ))}
                </nav>
            </div>
            <ProductGrid products={mockProducts} />
        </main>
        </>
    );
}