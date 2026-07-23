import React from 'react';
import ReactDOM from 'react-dom/client';
// v34.21: Vercel Web Analytics. NOTE: this is a Vite app — use the '/react'
// entry point, not '/next' (the Vercel dashboard snippet assumes Next.js).
import { Analytics } from '@vercel/analytics/react';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
      <Analytics />
    </ErrorBoundary>
  </React.StrictMode>
);
