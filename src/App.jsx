import Header from './components/Header'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'

function App() {

  return (
    <>
    <Header />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path="/products/:slug" element={<ProductPage />} />
      <Route path='/cart' element={<CartPage />} />
    </Routes>
    </>
  )
}

export default App
