import React from 'react'
import ReactDOM from 'react-dom/client'

// DEBUG INTERCEPTOR - REMOVE AFTER FIXING 404s
const originalFetch = window.fetch;
window.fetch = function() {
  const url = arguments[0];
  if (typeof url === 'string' && (url.includes('/progress') || url.includes('vercel.app'))) {
    console.warn(`[FETCH DEBUG] Intercepted: ${url}`);
    console.trace();
  }
  return originalFetch.apply(this, arguments);
};

import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { ProgressProvider } from './context/ProgressContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider>
    <ToastProvider>
      <ProgressProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ProgressProvider>
    </ToastProvider>
  </ThemeProvider>
)
