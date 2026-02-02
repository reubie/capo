import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmButtonColor = 'bg-red-500 hover:bg-red-600',
  confirmDisabled = false,
  icon: Icon = AlertTriangle,
  iconColor = 'text-red-500',
  iconBgColor = 'bg-red-500/10'
}) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-brand-cardLight rounded-2xl p-6 max-w-md w-full relative shadow-2xl border border-brand-brown/20">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-brand-textSecondary hover:text-brand-brown transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className={`w-16 h-16 rounded-full ${iconBgColor} flex items-center justify-center mb-4`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
          <h3 className="text-2xl font-bold text-brand-brown mb-2">
            {title}
          </h3>
          <p className="text-sm text-brand-textSecondary">
            {message}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 border border-brand-brown/20 text-brand-brown rounded-lg font-medium hover:bg-brand-background transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmDisabled}
            className={`flex-1 py-3 px-4 ${confirmButtonColor} text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;



