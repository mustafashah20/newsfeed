import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { AppProviders } from './app/providers';
import { createQueryClient } from './app/query-client';
import { createAppRouter } from './app/router';
import './index.css';

const queryClient = createQueryClient();
const router = createAppRouter(queryClient);

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Missing #root element in index.html');

createRoot(rootElement).render(
  <StrictMode>
    <AppProviders queryClient={queryClient} router={router} />
  </StrictMode>,
);
