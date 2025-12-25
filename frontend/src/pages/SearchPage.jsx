import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import client from '../api/client';
import ProductCard from '../components/ProductCard';
import { Search, ArrowLeft } from 'lucide-react';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q') || ''; // Récupère le texte de recherche
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            setError(null);
            try {
                // On envoie 'search' au backend (ex: /products/?search=moulinet)
                const res = await client.get(`/products/?search=${encodeURIComponent(query)}`);
                setProducts(res.data);
            } catch (err) {
                console.error("Erreur recherche", err);
                setError("Une erreur est survenue lors de la recherche.");
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchSearchResults();
        } else {
            setProducts([]);
            setLoading(false);
        }
    }, [query]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* En-tête de recherche */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                         <Link to="/" className="hover:text-bahri-blue flex items-center gap-1">
                            <ArrowLeft size={16}/> Accueil
                         </Link>
                         <span>/</span>
                         <span>Recherche</span>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Résultats pour : <span className="text-bahri-blue italic">"{query}"</span>
                    </h1>
                </div>
                <div className="text-gray-500 font-medium">
                    {products.length} produit(s) trouvé(s)
                </div>
            </div>

            {/* États de chargement et d'erreur */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bahri-blue mx-auto mb-4"></div>
                    <p className="text-gray-500">Recherche en cours...</p>
                </div>
            ) : error ? (
                <div className="text-center py-10 text-red-500 bg-red-50 rounded-lg">
                    {error}
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
                    <Search className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun résultat trouvé</h2>
                    <p className="text-gray-500 mb-6">Essayez avec un autre mot-clé ou vérifiez l'orthographe.</p>
                    <Link to="/" className="inline-block bg-bahri-blue text-white px-6 py-2 rounded-lg hover:bg-opacity-90 transition">
                        Retourner à la boutique
                    </Link>
                </div>
            ) : (
                /* Grille de résultats */
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchPage;