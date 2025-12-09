import React from 'react';
import { ShoppingCart } from 'lucide-react';

const ProductCard = ({ product, onPurchase }) => {
  return (
    <div className="bg-brand-cardLight rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group border border-brand-brown/20">
      <div className="relative overflow-hidden bg-white aspect-square">
        <img
          src={product.image || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23FFFCED" width="400" height="400"/%3E%3Ctext fill="%2355231E" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EProduct Image%3C/text%3E%3C/svg%3E';
          }}
        />
      </div>
      <div className="p-3 xs:p-4 bg-brand-cardLight">
        <h3 className="font-semibold text-sm xs:text-base sm:text-lg tablet:text-xl text-brand-brown mb-2 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-lg xs:text-xl sm:text-2xl tablet:text-3xl font-bold text-brand-orange mb-3 xs:mb-4">
          S${product.price?.toLocaleString() || '0'}
        </p>
        <button
          onClick={() => onPurchase(product)}
          className="w-full py-2 xs:py-2.5 text-xs xs:text-sm sm:text-base bg-brand-orange text-brand-textOnDark font-medium rounded-lg hover:bg-brand-orangeLight transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="w-3 h-3 xs:w-4 xs:h-4" />
          Buy
        </button>
      </div>
    </div>
  );
};

export default ProductCard;

