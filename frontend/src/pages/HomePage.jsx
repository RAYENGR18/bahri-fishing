import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck, ShoppingCart } from 'lucide-react';
import client from '../api/client';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  // On charge les 4 premiers produits pour la vitrine
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await client.get('/products/');
        // On garde seulement les 4 premiers (ou 8)
        setProducts(res.data.slice(0, 4));
      } catch (err) {
        console.error("Erreur chargement produits", err);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="flex flex-col w-full bg-white">
      
      {/* =========================================
          1. HERO BANNER
      ========================================= */}
      <div 
        className="relative h-[85vh] w-full bg-cover bg-center flex items-center"
        style={{ 
            // ⚠️ CONSEIL : Remplacez ce lien par une image locale dans votre dossier public pour plus de fiabilité
            // Ex: backgroundImage: "url('/banner-peche.jpg')"
            backgroundImage: "url('https://images.unsplash.com/photo-1544551763-46a8723ba3f9?q=80&w=2070&auto=format&fit=crop')" 
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white">
          <span className="bg-bahri-blue text-white px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase mb-4 inline-block">
            Nouveauté 2025
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight drop-shadow-lg">
            Maîtrisez <br/> 
            <span className="text-bahri-blue">L'Océan</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl font-light drop-shadow-md">
            Découvrez notre sélection premium d'équipements de pêche professionnelle.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/products" 
              className="bg-bahri-blue hover:bg-white hover:text-bahri-blue text-white font-bold py-4 px-10 rounded-full transition duration-300 flex items-center justify-center gap-2 text-lg shadow-lg"
            >
              VOIR LE CATALOGUE <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================
          2. SECTION PRODUITS VEDETTES (Au lieu des catégories)
      ========================================= */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-bahri-blue font-bold tracking-widest uppercase mb-3">Sélection du mois</h3>
            <h2 className="text-4xl font-extrabold text-gray-900">Nos Nouveautés</h2>
            <div className="w-20 h-1 bg-bahri-blue mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.length > 0 ? (
              products.map((product) => (
                <div key={product.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition duration-300 overflow-hidden border border-gray-100 flex flex-col">
                   
                   {/* Image du produit (Cliquable) */}
                   <div 
                        className="relative h-64 overflow-hidden cursor-pointer bg-gray-100"
                        onClick={() => navigate(`/product/${product.slug || product.id}`)} // Assurez-vous d'avoir une route product details
                    >
                      {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.title}
                            className="w-full h-full object-contain p-4 transition duration-500 group-hover:scale-110"
                          />
                      ) : (
                          // Placeholder si pas d'image
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                             <span className="text-sm">Pas d'image</span>
                          </div>
                      )}
                      
                      {/* Badge Prix */}
                      <div className="absolute top-4 right-4 bg-bahri-blue text-white font-bold px-3 py-1 rounded-full shadow-md text-sm">
                        {product.price} TND
                      </div>
                   </div>

                   {/* Infos Produit */}
                   <div className="p-6 flex flex-col flex-grow">
                      <div className="mb-2 text-xs text-gray-500 uppercase font-bold tracking-wider">
                        {product.category_name || "Pêche"}
                      </div>
                      <h3 
                        className="text-lg font-bold text-gray-900 mb-2 cursor-pointer hover:text-bahri-blue transition line-clamp-2"
                        onClick={() => navigate(`/product/${product.slug || product.id}`)}
                      >
                        {product.title}
                      </h3>
                      
                      <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-100">
                         <Link 
                            to={`/product/${product.slug || product.id}`}
                            className="text-sm font-bold text-gray-600 hover:text-bahri-blue flex items-center gap-1"
                         >
                            Voir détails
                         </Link>
                         <button 
                            className="bg-gray-100 hover:bg-bahri-blue hover:text-white text-gray-900 p-2 rounded-full transition"
                            title="Ajouter au panier"
                         >
                            <ShoppingCart size={18} />
                         </button>
                      </div>
                   </div>
                </div>
              ))
            ) : (
              // Squelette de chargement
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
             <Link to="/products" className="inline-block border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white font-bold py-3 px-8 rounded-full transition duration-300">
                Voir tous les produits
             </Link>
          </div>

        </div>
      </section>

      {/* =========================================
          3. SECTION CONFIANCE
      ========================================= */}
      <section className="py-16 bg-white border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center group">
               <div className="bg-blue-50 p-4 rounded-full mb-6 group-hover:bg-bahri-blue transition duration-300">
                  <Star className="w-8 h-8 text-bahri-blue group-hover:text-white transition duration-300"/>
               </div>
               <h4 className="text-xl font-bold mb-3 text-gray-900">Qualité Premium</h4>
               <p className="text-gray-500 leading-relaxed">Les meilleures marques mondiales sélectionnées.</p>
            </div>
            <div className="flex flex-col items-center group">
               <div className="bg-blue-50 p-4 rounded-full mb-6 group-hover:bg-bahri-blue transition duration-300">
                  <Truck className="w-8 h-8 text-bahri-blue group-hover:text-white transition duration-300"/>
               </div>
               <h4 className="text-xl font-bold mb-3 text-gray-900">Livraison Rapide</h4>
               <p className="text-gray-500 leading-relaxed">Expédition partout en Tunisie sous 48h.</p>
            </div>
            <div className="flex flex-col items-center group">
               <div className="bg-blue-50 p-4 rounded-full mb-6 group-hover:bg-bahri-blue transition duration-300">
                  <ShieldCheck className="w-8 h-8 text-bahri-blue group-hover:text-white transition duration-300"/>
               </div>
               <h4 className="text-xl font-bold mb-3 text-gray-900">Service Client</h4>
               <p className="text-gray-500 leading-relaxed">Une équipe d'experts à votre écoute.</p>
            </div>
         </div>
      </section>
    </div>
  );
};

export default HomePage;