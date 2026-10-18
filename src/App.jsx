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
      </Route>
    </Routes>
    </>
  )
}

export default App
