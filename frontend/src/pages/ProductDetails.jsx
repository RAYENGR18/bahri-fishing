import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../api/client';
import { CartContext } from '../context/CartContext';
import { ShoppingCart, ArrowLeft, Check, Truck, Shield } from 'lucide-react';
import { buildImageUrl } from '../utils/image';

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    client
      .get(`/products/${slug}/`)
      .then(res => setProduct(res.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="text-center py-20">Chargement...</div>;
  if (!product) return <div className="text-center py-20">Produit introuvable</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center mb-6 text-gray-500">
        <ArrowLeft size={20}/> Retour
      </button>

      <div className="bg-white rounded-xl shadow-lg grid md:grid-cols-2 overflow-hidden">

        {/* IMAGE */}
        <div className="p-8 bg-gray-50 flex items-center justify-center">
          {product.image ? (
            <img
              src={buildImageUrl(product.image)}
              alt={product.title}
              className="max-h-[500px] object-contain"
            />
          ) : (
            <div className="text-gray-400">Aucune image disponible</div>
          )}
        </div>

        {/* INFOS */}
        <div className="p-8">
          <span className="text-sm font-bold text-bahri-blue">
            {product.category_name}
          </span>

          <h1 className="text-3xl font-bold my-4">{product.title}</h1>
          <div className="text-3xl font-bold text-bahri-blue mb-4">
            {product.price} TND
          </div>

          <p className="text-gray-600 mb-6">
            {product.description || "Aucune description disponible"}
          </p>

          <div className="flex gap-4 mb-6">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}>-</button>
            <span>{qty}</span>
            <button onClick={() => setQty(q => q + 1)}>+</button>
          </div>

          <button
            onClick={() => addToCart(product)}
            className="bg-bahri-blue text-white px-6 py-3 rounded flex items-center gap-2"
          >
            <ShoppingCart size={20}/> Ajouter au panier
          </button>

          <div className="grid grid-cols-2 gap-4 mt-6 text-sm text-gray-600">
            <div className="flex items-center gap-2"><Truck/> Livraison rapide</div>
            <div className="flex items-center gap-2"><Shield/> Garantie qualité</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
