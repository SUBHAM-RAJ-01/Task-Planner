import React, { createContext, useContext, useState, useCallback } from 'react';
import Loader from './Loader';

const LoaderContext = createContext();

export const useLoader = () => useContext(LoaderContext);

export const LoaderProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [fullScreen, setFullScreen] = useState(true);

  const showLoader = useCallback((opts = {}) => {
    setFullScreen(opts.fullScreen !== false); // default true
    setLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setLoading(false);
  }, []);

  return (
    <LoaderContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
      {loading && <Loader fullScreen={fullScreen} />}
    </LoaderContext.Provider>
  );
}; 