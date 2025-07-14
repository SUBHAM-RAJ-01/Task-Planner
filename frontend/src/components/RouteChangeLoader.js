import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoader } from './LoaderContext';

const RouteChangeLoader = () => {
  const location = useLocation();
  const { showLoader, hideLoader } = useLoader();
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      showLoader({ fullScreen: true });
      // Hide loader after a short delay (simulate page load)
      const timeout = setTimeout(() => {
        hideLoader();
      }, 700); // Adjust duration as needed
      prevPath.current = location.pathname;
      return () => clearTimeout(timeout);
    }
  }, [location.pathname, showLoader, hideLoader]);

  return null;
};

export default RouteChangeLoader; 