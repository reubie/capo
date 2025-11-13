import React from 'react';
import { Mail, Phone, Building2, Calendar } from 'lucide-react';
import { cn } from '../utils/helpers';

const CardPreview = ({ card, onDelete, className = '' }) => {
  return (
    <div className={cn('bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-4 border border-[#8B4513]/20', className)}>
      <div className="flex gap-4">
        {card.image && (
          <div className="flex-shrink-0">
            <img
              src={card.image}
              alt={card.name}
              className="w-20 h-20 rounded-lg object-cover border border-[#8B4513]/20"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23F5E6D3" width="80" height="80"/%3E%3C/svg%3E';
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg text-[#8B4513] mb-2 truncate">
            {card.name || 'Unknown'}
          </h3>
          {card.company && (
            <div className="flex items-center gap-2 text-[#8B4513]/70 mb-1">
              <Building2 className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">{card.company}</span>
            </div>
          )}
          {card.email && (
            <div className="flex items-center gap-2 text-[#8B4513]/70 mb-1">
              <Mail className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">{card.email}</span>
            </div>
          )}
          {card.phone && (
            <div className="flex items-center gap-2 text-[#8B4513]/70 mb-1">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm truncate">{card.phone}</span>
            </div>
          )}
          {card.date && (
            <div className="flex items-center gap-2 text-[#8B4513]/60 mt-2">
              <Calendar className="w-3 h-3 flex-shrink-0" />
              <span className="text-xs">
                {new Date(card.date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(card.id)}
          className="mt-3 text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default CardPreview;

