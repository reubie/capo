import React from 'react';
import { useLoading } from '../context/LoadingContext';

const GlobalLoader = () => {
  const { loading, message } = useLoading();

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl p-6 w-72 text-center shadow-xl">
        <div className="w-10 h-10 mx-auto mb-4 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-brand-brown">
          {message}
        </p>
      </div>
    </div>
  );
};

export default GlobalLoader;
