import './Home.css'
import ProductGrid from '../components/ProductGrid';
import { mockProducts } from '../data/mockProduct';

export default function Home () {
    return (
        <>
        <main>
            <ProductGrid products={mockProducts} />
        </main>
        </>
    );
}