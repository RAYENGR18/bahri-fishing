import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Fish, LogOut, ShieldCheck, Menu, X, Search, Package } from 'lucide-react'; // Ajout de Package
import client from '../api/client';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cartCount, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const res = await client.get('/products/categories/');
            setCategories(res.data);
        } catch (err) {
            console.error("Erreur chargement menu", err);
        }
    };
    fetchCategories();
  }, []);

  const handleLogout = () => {
    if(clearCart) clearCart();
    logout();
    navigate('/');
  };

  // Dans Navbar.jsx

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        // 🚀 ACTION : On redirige vers l'accueil avec le mot-clé dans l'URL
        navigate(`/?search=${encodeURIComponent(searchQuery)}`);
        
        // On ferme le menu mobile et on vide (optionnel)
        setIsMenuOpen(false);
    }
  };

  return (
    <nav className="bg-bahri-blue text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center gap-4">
          
          {/* --- LOGO --- */}
          <Link to="/" className="flex items-center space-x-2 font-bold text-xl hover:text-gray-200 transition shrink-0">
            <Fish size={28} />
            <span className="hidden sm:inline">Bahri Fishing</span>
          </Link>

          {/* --- RECHERCHE (Desktop) --- */}
          <form onSubmit={handleSearch} className="hidden lg:flex relative flex-grow max-w-md mx-4">
            <input 
                type="text" 
                placeholder="Rechercher un produit..." 
                className="w-full bg-white/10 text-white placeholder-gray-300 rounded-full py-1.5 pl-4 pr-10 focus:outline-none focus:bg-white/20 focus:ring-1 focus:ring-white/30 transition text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-2 top-1.5 text-gray-300 hover:text-white">
                <Search size={18} />
            </button>
          </form>

          {/* --- MENU CATÉGORIES (Desktop) --- */}
          <div className="hidden md:flex space-x-4 overflow-x-auto no-scrollbar items-center">
            {categories.map((cat) => (
                <Link 
                    key={cat.id} 
                    to={`/category/${cat.slug}`}
                    className="text-sm font-medium hover:text-bahri-light whitespace-nowrap uppercase tracking-wide transition"
                >
                    {cat.name}
                </Link>
            ))}
          </div>

          {/* --- ACTIONS DROITE --- */}
          <div className="flex items-center space-x-4 shrink-0">
            
            {/* Admin Link */}
            {user && user.is_admin && (
                <Link to="/admin" className="text-yellow-400 hover:text-yellow-200 hidden xl:flex items-center gap-1 font-bold text-sm bg-white/10 px-3 py-1 rounded-full">
                    <ShieldCheck size={18} />
                    <span>Admin</span>
                </Link>
            )}

            {/* Lien Mes Commandes (Desktop) - Visible si connecté */}
            {user && (
                <Link to="/my-orders" className="hidden md:flex items-center hover:text-gray-300 transition" title="Mes Commandes">
                    <Package size={22} />
                </Link>
            )}

            {/* Panier */}
            <Link to="/cart" className="relative hover:text-gray-300 transition">
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                </span>
              )}
            </Link>

            {/* User Zone */}
            {user ? (
                <div className="hidden md:flex items-center space-x-4">
                    <Link to="/profile" className="text-sm text-right leading-tight hover:opacity-80 transition cursor-pointer group">
                        <div className="font-semibold group-hover:underline">{user.first_name}</div>
                        <div className="text-xs text-bahri-light opacity-90 font-mono">
                            {user.loyalty_points ? parseFloat(user.loyalty_points).toFixed(2) : "0.00"} pts
                        </div>
                    </Link>
                    <button onClick={handleLogout} className="hover:text-red-300 transition" title="Déconnexion">
                        <LogOut size={22} />
                    </button>
                </div>
            ) : (
                <Link to="/login" className="hidden md:flex hover:text-gray-300 items-center space-x-1 transition">
                  <User size={24} />
                  <span className="text-sm font-medium">Login</span>
                </Link>
            )}

            {/* Menu Burger (Mobile) */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MENU MOBILE DROPDOWN --- */}
      {isMenuOpen && (
        <div className="md:hidden bg-bahri-blue border-t border-white/10 pb-4 shadow-xl animate-fade-in-down">
            
            {/* Barre de recherche Mobile */}
            <div className="p-4 pb-0">
                <form onSubmit={handleSearch} className="relative">
                    <input 
                        type="text" 
                        placeholder="Rechercher..." 
                        className="w-full bg-white/10 text-white placeholder-gray-300 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:bg-white/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-3 top-2.5 text-gray-300">
                        <Search size={20} />
                    </button>
                </form>
            </div>

            {/* Liste des catégories Mobile */}
            <div className="px-4 pt-4 pb-2 space-y-2">
                <p className="text-xs text-gray-300 uppercase font-bold mb-2">Rayons</p>
                {categories.map((cat) => (
                    <Link 
                        key={cat.id} 
                        to={`/category/${cat.slug}`}
                        className="block py-2 text-base font-medium hover:bg-white/10 rounded px-2"
                        onClick={() => setIsMenuOpen(false)}
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>
            
            <div className="border-t border-white/10 pt-4 px-4 space-y-3">
                {user ? (
                    <>
                        <div className="flex justify-between items-center py-2 px-2 bg-white/5 rounded">
                            <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                                <span className="font-bold block">{user.first_name} {user.last_name}</span>
                                <span className="text-xs text-bahri-light">{user.email}</span>
                            </Link>
                            <span className="bg-white/20 px-2 py-1 rounded text-xs font-mono">{parseFloat(user.loyalty_points).toFixed(2)} pts</span>
                        </div>
                        
                        {/* Lien Mes Commandes (Mobile) */}
                        <Link to="/my-orders" className="flex items-center gap-2 py-2 px-2 hover:bg-white/5 rounded font-medium" onClick={() => setIsMenuOpen(false)}>
                            <Package size={20} /> Mes Commandes
                        </Link>

                        {user.is_admin && (
                             <Link to="/admin" className="flex items-center gap-2 py-2 text-yellow-300 font-bold px-2 hover:bg-white/5 rounded" onClick={() => setIsMenuOpen(false)}>
                                <ShieldCheck size={20}/> Dashboard Admin
                             </Link>
                        )}

                        <button onClick={handleLogout} className="flex items-center gap-2 text-red-300 py-2 w-full text-left px-2 hover:bg-white/5 rounded mt-2 border-t border-white/10">
                            <LogOut size={20}/> Déconnexion
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="flex items-center gap-2 py-2 font-bold px-2 hover:bg-white/5 rounded" onClick={() => setIsMenuOpen(false)}>
                        <User size={20} /> Se connecter
                    </Link>
                )}
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;