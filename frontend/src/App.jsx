import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import des Composants
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // ✅ AJOUT DU FOOTER

// Import des Pages
import HomePage from './pages/HomePage';       // ✅ NOUVELLE ACCUEIL (Banner)
import ProductsPage from './pages/ProductsPage'; // ✅ ANCIENNEMENT HOME (Liste produits)
import AboutPage from './pages/AboutPage';     // ✅ NOUVELLE PAGE
import ContactPage from './pages/ContactPage'; // ✅ NOUVELLE PAGE

import Login from './pages/Login';
import Register from './pages/Register';
import Cart from './pages/Cart';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import AdminProducts from './pages/AdminProducts';
import AdminProductForm from './pages/AdminProductForm';
import ProductDetails from './pages/ProductDetails';
import MyOrders from './pages/MyOrders';

// Import des Contextes
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            
            {/* Navbar toujours en haut */}
            <Navbar />
            
            {/* Le contenu pousse le footer vers le bas */}
            <div className="flex-grow">
              <Routes>
                {/* --- NOUVELLES ROUTES --- */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                
                {/* --- ROUTES EXISTANTES --- */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/cart" element={<Cart />} />
                
                {/* Routes Connectées */}
                <Route path="/profile" element={<Profile />} />
                <Route path="/category/:slug" element={<CategoryPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/product/:slug" element={<ProductDetails />} />
                <Route path="/my-orders" element={<MyOrders />} />

                {/* Route Admin */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/products/new" element={<AdminProductForm />} />
                <Route path="/admin/products/edit/:id" element={<AdminProductForm />} />
              </Routes>
            </div>

            {/* Footer toujours en bas */}
            <Footer /> 

          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;