import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'

// Register the PWA service worker so browsers expose "Install" /
// "Add to Home Screen". The worker is intentionally minimal and does
// not cache assets — it exists only for installability.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // silent — registration failures are non-fatal; the app still works
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
