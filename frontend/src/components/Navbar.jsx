import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Fish, LogOut, ShieldCheck, Menu, X, Search, Package, ChevronDown } from 'lucide-react'; 
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

  // Pour gérer l'ouverture du dropdown mobile
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
        navigate(`/?search=${encodeURIComponent(searchQuery)}`);
        setIsMenuOpen(false);
    }
  };

  return (
    <nav className="bg-bahri-blue text-white shadow-lg sticky top-0 z-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center gap-4">
          
          {/* --- 1. LOGO --- */}
          <Link to="/" className="flex items-center space-x-2 font-bold text-2xl hover:text-gray-200 transition shrink-0">
            <Fish size={32} />
            <span className="hidden sm:inline tracking-tight">Bahri Fishing</span>
          </Link>

          {/* --- 2. BARRE DE RECHERCHE (Desktop) --- */}
          <form onSubmit={handleSearch} className="hidden lg:flex relative flex-grow max-w-sm mx-8">
            <input 
                type="text" 
                placeholder="Rechercher..." 
                className="w-full bg-white/10 text-white placeholder-gray-300 rounded-full py-2 pl-5 pr-10 focus:outline-none focus:bg-white/20 focus:ring-1 focus:ring-white/30 transition text-sm border border-transparent focus:border-white/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-3 top-2 text-gray-300 hover:text-white transition">
                <Search size={18} />
            </button>
          </form>

          {/* --- 3. MENU NAVIGATION (Desktop) --- */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-bold uppercase tracking-wide">
            
            <Link to="/" className="hover:text-bahri-light transition">Accueil</Link>

            {/* DROPDOWN : NOS RAYONS */}
            <div className="relative group py-6 cursor-pointer">
                <span className="flex items-center gap-1 hover:text-bahri-light transition">
                    Rayons <ChevronDown size={14}/>
                </span>
                
                {/* Le menu qui s'affiche au survol */}
                <div className="absolute left-0 top-full w-56 bg-white text-gray-800 shadow-xl rounded-lg overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-50 border-t-4 border-bahri-light">
                    {categories.map((cat) => (
                        <Link 
                            key={cat.id} 
                            to={`/category/${cat.slug}`}
                            className="block px-4 py-3 hover:bg-gray-50 hover:text-bahri-blue border-b border-gray-100 last:border-0 transition text-xs font-bold"
                        >
                            {cat.name}
                        </Link>
                    ))}
                    <Link to="/products" className="block px-4 py-3 bg-gray-50 text-center text-bahri-blue hover:underline text-xs">
                        Voir tout le catalogue →
                    </Link>
                </div>
            </div>

            <Link to="/products" className="hover:text-bahri-light transition">Catalogue</Link>
            <Link to="/about" className="hover:text-bahri-light transition">À Propos</Link>
            <Link to="/contact" className="hover:text-bahri-light transition">Contact</Link>
          </div>

          {/* --- 4. ICONES ACTIONS (Panier/User) --- */}
          <div className="flex items-center space-x-5 shrink-0 ml-4">
            
            {/* Admin */}
            {user && user.is_admin && (
                <Link to="/admin" className="text-yellow-400 hover:text-yellow-200 hidden xl:flex items-center gap-1 font-bold text-xs bg-white/10 px-3 py-1.5 rounded-full transition">
                    <ShieldCheck size={16} /> <span>Admin</span>
                </Link>
            )}

            {/* Panier */}
            <Link to="/cart" className="relative hover:text-gray-300 transition group">
              <ShoppingCart size={26} className="group-hover:scale-110 transition duration-300" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-bahri-blue">
                    {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {user ? (
                <div className="hidden md:flex items-center space-x-3 pl-2 border-l border-white/20">
                    <Link to="/profile" className="text-right leading-tight hover:opacity-80 transition">
                        <div className="text-sm font-bold">{user.first_name}</div>
                        <div className="text-[10px] text-bahri-light font-mono">{parseFloat(user.loyalty_points).toFixed(0)} pts</div>
                    </Link>
                    <button onClick={handleLogout} className="hover:text-red-300 transition" title="Déconnexion">
                        <LogOut size={22} />
                    </button>
                </div>
            ) : (
                <Link to="/login" className="hidden md:flex bg-white/10 hover:bg-white/20 px-4 py-2 rounded-full text-sm font-bold transition">
                  Login
                </Link>
            )}

            {/* Burger Mobile */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? <X size={30} /> : <Menu size={30} />}
            </button>
          </div>
        </div>
      </div>

      {/* --- MENU MOBILE RESPONSIVE --- */}
      {isMenuOpen && (
        <div className="md:hidden bg-bahri-blue border-t border-white/10 shadow-2xl animate-fade-in-down h-screen overflow-y-auto">
            
            {/* Search Mobile */}
            <div className="p-4">
                <form onSubmit={handleSearch} className="relative">
                    <input 
                        type="text" 
                        placeholder="Rechercher..." 
                        className="w-full bg-white/10 text-white rounded-lg py-3 pl-4 pr-10 focus:outline-none focus:bg-white/20"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button type="submit" className="absolute right-3 top-3 text-gray-300">
                        <Search size={20} />
                    </button>
                </form>
            </div>

            {/* Liens Navigation Mobile */}
            <div className="px-4 space-y-1">
                <Link to="/" className="block py-3 px-2 text-lg font-bold border-b border-white/5" onClick={() => setIsMenuOpen(false)}>
                    🏠 Accueil
                </Link>
                <Link to="/products" className="block py-3 px-2 text-lg font-bold border-b border-white/5" onClick={() => setIsMenuOpen(false)}>
                    📦 Tout le Catalogue
                </Link>
                
                {/* Accordéon Catégories Mobile */}
                <div>
                    <button 
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="w-full flex justify-between items-center py-3 px-2 text-lg font-bold border-b border-white/5"
                    >
                        <span>🎣 Nos Rayons</span>
                        <ChevronDown size={20} className={`transform transition ${isDropdownOpen ? 'rotate-180' : ''}`}/>
                    </button>
                    
                    {isDropdownOpen && (
                        <div className="bg-black/20 px-4 py-2 space-y-2">
                            {categories.map((cat) => (
                                <Link 
                                    key={cat.id} 
                                    to={`/category/${cat.slug}`}
                                    className="block py-2 text-sm text-gray-200 hover:text-white"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    • {cat.name}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <Link to="/about" className="block py-3 px-2 text-lg font-bold border-b border-white/5" onClick={() => setIsMenuOpen(false)}>
                    ℹ️ À Propos
                </Link>
                <Link to="/contact" className="block py-3 px-2 text-lg font-bold border-b border-white/5" onClick={() => setIsMenuOpen(false)}>
                    📞 Contact
                </Link>
            </div>
            
            {/* User Mobile */}
            <div className="p-4 mt-4 bg-black/10">
                {user ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="bg-bahri-light text-bahri-blue font-bold w-10 h-10 rounded-full flex items-center justify-center">
                                {user.first_name[0]}
                            </div>
                            <div>
                                <p className="font-bold">{user.first_name} {user.last_name}</p>
                                <p className="text-xs opacity-70">{user.email}</p>
                            </div>
                        </div>
                        <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block bg-white/10 text-center py-2 rounded font-bold">
                            Mon Profil ({parseFloat(user.loyalty_points).toFixed(0)} pts)
                        </Link>
                        <button onClick={handleLogout} className="block w-full text-left py-2 text-red-300 font-bold">
                            Déconnexion
                        </button>
                    </div>
                ) : (
                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block w-full bg-white text-bahri-blue text-center py-3 rounded font-bold shadow-lg">
                        Se connecter / S'inscrire
                    </Link>
                )}
            </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;