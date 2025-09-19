import  { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from '@shopify/polaris';
import './index.css';
import App from './App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@shopify/polaris';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider i18n={{}}>
     <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
    </AppProvider>
  </StrictMode>
);
