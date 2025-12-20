import React, { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const showLoading = (text = 'Loading...') => {
    setMessage(text);
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
    setMessage('');
  };

  return (
    <LoadingContext.Provider
      value={{ loading, message, showLoading, hideLoading }}
    >
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);
