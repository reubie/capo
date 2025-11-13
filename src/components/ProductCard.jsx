import React from 'react';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, onPurchase }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-[#8B4513]/20">
      <div className="relative overflow-hidden bg-[#F5E6D3] aspect-square">
        <img
          src={product.image || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23F5E6D3" width="400" height="400"/%3E%3Ctext fill="%238B4513" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EProduct Image%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>
      <div className="p-4 bg-white">
        <h3 className="font-semibold text-lg text-[#8B4513] mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-2xl font-bold text-[#5C4033] mb-4">
          ₩{product.price?.toLocaleString() || '0'}
        </p>
        <button
          onClick={() => onPurchase(product)}
          className="w-full py-2.5 bg-[#8B4513] text-white font-medium rounded-lg hover:bg-[#A0522D] transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-4 h-4" />
          Buy
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

