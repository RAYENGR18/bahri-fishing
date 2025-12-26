import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, ShieldCheck } from 'lucide-react';
import client from '../api/client';

const HomePage = () => {
  const [categories, setCategories] = useState([]);

  // On charge les catégories pour les afficher dynamiquement
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await client.get('/products/categories/');
        setCategories(res.data);
      } catch (err) {
        console.error("Erreur chargement catégories", err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-col w-full">
      
      {/* =========================================
          1. HERO BANNER (Style Tile'O)
      ========================================= */}
      <div 
        className="relative h-[85vh] w-full bg-cover bg-center flex items-center"
        style={{ 
          // Image de fond (Pêche en mer de haute qualité)
          backgroundImage: "url('https://images.unsplash.com/photo-1544551763-46a8723ba3f9?q=80&w=2070&auto=format&fit=crop')" 
        }}
      >
        {/* Filtre noir pour rendre le texte lisible */}
        <div className="absolute inset-0 bg-black/40"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white">
          <span className="bg-bahri-blue text-white px-4 py-1 rounded-full text-sm font-bold tracking-widest uppercase mb-4 inline-block">
            Nouveauté 2025
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Maîtrisez <br/> 
            <span className="text-bahri-blue">L'Océan</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 mb-10 max-w-2xl font-light">
            Découvrez notre sélection premium d'équipements de pêche professionnelle. 
            Conçus pour la performance, testés par les experts.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/products" 
              className="bg-bahri-blue hover:bg-white hover:text-bahri-blue text-white font-bold py-4 px-10 rounded-full transition duration-300 flex items-center justify-center gap-2 text-lg shadow-lg border-2 border-transparent hover:border-bahri-blue"
            >
              VOIR LE CATALOGUE <ArrowRight size={20} />
            </Link>
            <Link 
              to="/contact" 
              className="bg-transparent hover:bg-white hover:text-gray-900 text-white border-2 border-white font-bold py-4 px-10 rounded-full transition duration-300 flex items-center justify-center text-lg"
            >
              NOUS CONTACTER
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================
          2. SECTION CATÉGORIES POPULAIRES
      ========================================= */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h3 className="text-bahri-blue font-bold tracking-widest uppercase mb-3">Nos Rayons</h3>
            <h2 className="text-4xl font-extrabold text-gray-900">Explorez par Catégorie</h2>
            <div className="w-20 h-1 bg-bahri-blue mx-auto mt-6 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.length > 0 ? (
              categories.map((cat, index) => (
                <Link key={cat.id} to={`/category/${cat.slug}`} className="group block h-full">
                  <div className="relative h-96 rounded-2xl overflow-hidden shadow-lg cursor-pointer">
                     {/* Image de fond dynamique basée sur le nom de la catégorie (Astuce Unsplash) */}
                     <img 
                       src={`https://source.unsplash.com/random/400x600/?fishing,${cat.slug},sea`} 
                       alt={cat.name}
                       className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                       // Image de secours si Unsplash échoue
                       onError={(e) => {
                         e.target.src = 'https://images.unsplash.com/photo-1516912481808-54233605e6e5?q=80&w=400&auto=format&fit=crop';
                       }}
                     />
                     
                     {/* Overlay dégradé */}
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-8 flex flex-col justify-end">
                        <h3 className="text-2xl font-bold text-white mb-2 transform group-hover:-translate-y-1 transition duration-300">
                          {cat.name}
                        </h3>
                        <span className="text-bahri-blue font-bold text-sm uppercase tracking-wider opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition duration-300">
                          Découvrir
                        </span>
                     </div>
                  </div>
                </Link>
              ))
            ) : (
              // Squelette de chargement (si pas encore de catégories)
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse"></div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* =========================================
          3. SECTION CONFIANCE (ICÔNES)
      ========================================= */}
      <section className="py-16 bg-white border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center group">
               <div className="bg-blue-50 p-4 rounded-full mb-6 group-hover:bg-bahri-blue transition duration-300">
                  <Star className="w-8 h-8 text-bahri-blue group-hover:text-white transition duration-300"/>
               </div>
               <h4 className="text-xl font-bold mb-3 text-gray-900">Qualité Premium</h4>
               <p className="text-gray-500 leading-relaxed">Nous sélectionnons uniquement les meilleures marques mondiales pour garantir votre réussite.</p>
            </div>
            
            <div className="flex flex-col items-center group">
               <div className="bg-blue-50 p-4 rounded-full mb-6 group-hover:bg-bahri-blue transition duration-300">
                  <Truck className="w-8 h-8 text-bahri-blue group-hover:text-white transition duration-300"/>
               </div>
               <h4 className="text-xl font-bold mb-3 text-gray-900">Livraison Rapide</h4>
               <p className="text-gray-500 leading-relaxed">Expédition dans toute la Tunisie sous 24h à 48h. Emballage sécurisé.</p>
            </div>

            <div className="flex flex-col items-center group">
               <div className="bg-blue-50 p-4 rounded-full mb-6 group-hover:bg-bahri-blue transition duration-300">
                  <ShieldCheck className="w-8 h-8 text-bahri-blue group-hover:text-white transition duration-300"/>
               </div>
               <h4 className="text-xl font-bold mb-3 text-gray-900">Service Client</h4>
               <p className="text-gray-500 leading-relaxed">Une équipe de passionnés à votre écoute pour vous conseiller le meilleur matériel.</p>
            </div>
         </div>
      </section>

    </div>
  );
};

export default HomePage;