import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import des Composants
import Navbar from './components/Navbar';

// Import des Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
// Import des Contextes (La mémoire de l'app)
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProductForm from './pages/ProductForm';
import AdminProducts from './pages/AdminProducts';
import AdminProductForm from './pages/AdminProductForm';
// ... imports
import ProductDetails from './pages/ProductDetails';
import MyOrders from './pages/MyOrders';

// ...




function App() {
  return (
    // 1. AuthProvider englobe tout (pour savoir qui est connecté)
    <AuthProvider>
      {/* 2. CartProvider englobe tout (pour que le panier soit accessible partout) */}
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            
            {/* La Navbar est ICI, DANS les Providers */}
            <Navbar />
            
            <div className="flex-grow">
              <Routes>
                {/* Routes Publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                
                {/* Routes Connectées */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                {/* Route Admin */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/admin/products/new" element={<ProductForm />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/new" element={<AdminProductForm />} />
                <Route path="/admin/products/edit/:id" element={<AdminProductForm />} />
                <Route path="/product/:slug" element={<ProductDetails />} />
                <Route path="/my-orders" element={<MyOrders />} />
              </Routes>
            </div>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;