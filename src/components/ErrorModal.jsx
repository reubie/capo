import React from 'react';
import { X, AlertCircle } from 'lucide-react';

const ErrorModal = ({ 
  visible, 
  onClose, 
  onBackdropClick = null, // Optional: called when clicking outside the modal
  title = 'Error',
  message = 'An error occurred. Please try again.',
  buttonText = 'OK',
  buttonColor = 'bg-brand-orange hover:bg-brand-orangeLight'
}) => {
  if (!visible) return null;

  const handleBackdropClick = (e) => {
    // Only trigger if clicking the backdrop itself, not the modal content
    if (e.target === e.currentTarget && onBackdropClick) {
      onBackdropClick();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-brand-cardLight rounded-2xl p-6 max-w-md w-full relative shadow-2xl border border-brand-brown/20"
        onClick={(e) => e.stopPropagation()} // Prevent backdrop click when clicking inside modal
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-textSecondary hover:text-brand-brown transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-brand-brown mb-4">
            {title}
          </h3>
          <div className="text-sm text-brand-textSecondary leading-relaxed text-left w-full space-y-3">
            {message.split('\n\n').map((paragraph, index) => (
              <p key={index} className={index === 0 ? 'font-medium text-brand-brown' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className={`w-full py-3 px-4 ${buttonColor} text-white rounded-lg font-medium transition-colors`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;
