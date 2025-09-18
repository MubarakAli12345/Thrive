import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from '@shopify/polaris';
import './index.css';
import App from './App';
import '@shopify/polaris';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider i18n={{}}>
      <App />
    </AppProvider>
  </StrictMode>
);
