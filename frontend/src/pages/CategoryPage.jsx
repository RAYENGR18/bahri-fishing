import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import client from '../api/client';
import ProductCard from '../components/ProductCard';

const CategoryPage = () => {
    const { slug } = useParams(); // Récupère "moulinets" depuis l'URL
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                // Appel API avec le filtre ?category=slug
                const res = await client.get(`/products/?category=${slug}`);
                setProducts(res.data);
                
                // Petit hack pour afficher un joli titre (on majuscule la 1ère lettre)
                setCategoryName(slug.charAt(0).toUpperCase() + slug.slice(1).replace('-', ' '));
            } catch (err) {
                console.error("Erreur chargement catégorie", err);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [slug]); // Se relance si on change de catégorie

    if (loading) return <div className="text-center py-20">Chargement du rayon...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b pb-4 border-gray-200">
                Rayon : <span className="text-bahri-blue">{categoryName}</span>
            </h1>
            
            {products.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                    Aucun produit trouvé dans cette catégorie pour le moment.
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryPage;