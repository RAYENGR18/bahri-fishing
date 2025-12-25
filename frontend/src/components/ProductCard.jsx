import React, { useContext } from 'react';
import { ShoppingCart } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { Link } from 'react-router-dom';
import { buildImageUrl } from '../utils/image';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition border flex flex-col h-full">
      
      {/* IMAGE */}
      <Link to={`/product/${product.slug}`} className="block h-48 bg-gray-50">
        {product.image ? (
          <img
            src={buildImageUrl(product.image)}
            alt={product.title}
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            Aucune image
          </div>
        )}
      </Link>

      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs font-bold text-bahri-blue mb-1">
          {product.category_name || "Pêche"}
        </span>

        <Link to={`/product/${product.slug}`}>
          <h3 className="font-bold text-gray-800 text-lg mb-2 hover:text-bahri-blue">
            {product.title}
          </h3>
        </Link>

        <div className="mt-auto flex items-center justify-between">
          <span className="text-xl font-bold">{product.price} TND</span>

          <button
            onClick={() => addToCart(product)}
            className="bg-bahri-light text-bahri-blue p-2 rounded-full hover:bg-bahri-blue hover:text-white"
          >
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
