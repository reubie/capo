import React from 'react';
import { Mail, Phone, Building2, Briefcase } from 'lucide-react';
import { cn, normalizePhoneNumber } from '../utils/helpers';

const CardPreview = ({ card, onDelete, className = '' }) => {
  return (
    <div className={cn('bg-brand-cardLight rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 p-3 xs:p-4 border border-brand-brown/20', className)}>
      <div className="flex gap-3 xs:gap-4">
        {card.image && (
          <div className="flex-shrink-0">
            <img
              src={card.image}
              alt={card.name}
              className="w-16 h-16 xs:w-20 xs:h-20 tablet:w-24 tablet:h-24 rounded-lg object-cover border border-brand-brown/20"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23FFFCED" width="80" height="80"/%3E%3C/svg%3E';
              }}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm xs:text-base sm:text-lg tablet:text-xl text-brand-brown mb-1 xs:mb-2 truncate">
            {card.name || 'Unknown'}
          </h3>
          {card.company && (
            <div className="flex items-center gap-2 text-brand-textSecondary mb-1">
              <Building2 className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
              <span className="text-xs xs:text-sm truncate">{card.company}</span>
            </div>
          )}
          {card.position && (
            <div className="flex items-center gap-2 text-brand-textSecondary mb-1">
              <Briefcase className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
              <span className="text-xs xs:text-sm truncate">{card.position}</span>
            </div>
          )}
          {card.phone && (
            <div className="flex items-center gap-2 text-brand-textSecondary mb-1">
              <Phone className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
              <span className="text-xs xs:text-sm truncate">{normalizePhoneNumber(card.phone)}</span>
            </div>
          )}
          {card.email && (
            <div className="flex items-center gap-2 text-brand-textSecondary mb-1">
              <Mail className="w-3 h-3 xs:w-4 xs:h-4 flex-shrink-0" />
              <span className="text-xs xs:text-sm truncate">{card.email}</span>
            </div>
          )}
        </div>
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(card.id)}
          className="mt-2 xs:mt-3 text-xs xs:text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Delete
        </button>
      )}
    </div>
  );
};

export default CardPreview;

