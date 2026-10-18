import Header from './components/Header'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import ProductPage from './pages/ProductPage'
import CartPage from './pages/CartPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ProtectedRoute from './components/ProtectedRoute'
import Profile from './pages/Profile'
import WishlistPage from './pages/WishlistPage'
import Layout from './pages/admin/Layout'
import Dashboard from './pages/admin/Dashboard'
import Products from './pages/admin/Product'
import ProductForm from './pages/admin/ProductForm'
import Orders from './pages/admin/Orders'
import Users from './pages/admin/Users'
import Reports from './pages/admin/Reports'
import Footer from './components/Footer'

function App() {

  return (
    <>
    <Header />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path="/products/:slug" element={<ProductPage />} />
      <Route path='/cart' element={<CartPage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/profile' element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path='/wishlist' element={<WishlistPage />} />
      <Route path='/admin' element={<ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>} >
        <Route index element={<Dashboard />} />
        <Route path='products' element={<Products />} />
        <Route path='products/new' element={<ProductForm />} />
        <Route path='products/:id/edit' element={<ProductForm />} />
        <Route path='orders' element={<Orders />} />
        <Route path='users' element={<Users />} />
        <Route path='reports' element={<Reports />} />
      </Route>
    </Routes>
    <Footer />
    </>
  )
}

export default App
