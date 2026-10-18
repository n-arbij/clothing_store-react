import './Home.css'
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../context/ProductsContext.jsx';

const categories = ['Men', 'Women', 'Children', 'Accessories', 'Sale'];

export default function Home () {
    const { catalog } = useProducts();

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
            <ProductGrid products={catalog} />
        </main>
        
        </>
    );
}