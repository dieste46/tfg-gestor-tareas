// src/hooks/useLoading.js
import { useState } from 'react';

export const useLoading = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingMessage, setLoadingMessage] = useState('');

  const startLoading = (message = 'Cargando...') => {
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const stopLoading = () => {
    setIsLoading(false);
    setLoadingMessage('');
  };

  const withLoading = async (asyncFunction, message = 'Cargando...') => {
    startLoading(message);
    try {
      const result = await asyncFunction();
      return result;
    } finally {
      stopLoading();
    }
  };

  return { 
    isLoading, 
    loadingMessage, 
    startLoading, 
    stopLoading, 
    withLoading 
  };
};

export default useLoading;