import './Main.css';
import CookieConsentBanner from './components/cookie-consent/Banner';
import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

/**
 * use this component to wrap all child components
 * this is useful for templates, themes, and context
 */
export default function App() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView();
      }
    }
  }, [location]);

  return (
    <>
      <Outlet />
      <CookieConsentBanner />
    </>
  );
}
