import React, { useEffect, useState } from 'react';
// 👇 On ajoute useNavigate pour une navigation fluide
import { useSearchParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import ProductCard from '../components/ProductCard';
import { PackageX } from 'lucide-react';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate(); // Hook de navigation
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await client.get('/products/');
        setProducts(response.data);
      } catch (err) {
        console.error("Erreur API:", err);
        setError("Impossible de charger les produits.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center mt-20 text-xl font-bold text-gray-500 animate-pulse">Chargement du matériel...</div>;
  if (error) return <div className="text-center mt-20 text-red-500 font-bold">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        {searchTerm ? (
            <span>Résultats pour <span className="text-bahri-blue">"{searchTerm}"</span></span>
        ) : (
            "Catalogue Complet" // Petit changement de titre pour faire plus 'Shop'
        )}
      </h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
        ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
                <PackageX size={64} className="mb-4 text-gray-300"/>
                <p className="text-lg font-medium">Aucun produit ne correspond à votre recherche.</p>
                <button 
                    // 👇 CORRECTION ICI : On recharge la page produits sans filtre
                    onClick={() => navigate('/products')} 
                    className="mt-4 text-bahri-blue hover:underline font-bold"
                >
                    Voir tous les produits
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;