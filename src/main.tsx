import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { ErrorBoundary } from '@shared/components/ui/ErrorBoundary';
import { setAuthToken } from './api';

// ── Token bootstrap ──────────────────────────────────────────────────────────
// This runs synchronously before React renders anything.
// If the URL contains ?token= (Google OAuth redirect), save it immediately so
// the axios interceptor already has it in memory before the first API call.
const _params = new URLSearchParams(window.location.search);
const _token = _params.get('token');
if (_token) {
  setAuthToken(_token);
  window.history.replaceState({}, '', window.location.pathname);
}
// ────────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
