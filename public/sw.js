// Minimal service worker for Literature Tracker PWA installability.
// We deliberately do NOT cache app assets here — the app fetches fresh
// data from Supabase on every load, and caching stale JS bundles during
// active development leads to confusing "why is my change not showing"
// bugs. This SW exists solely so browsers treat the site as a PWA and
// expose the "Install" / "Add to Home Screen" prompts.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Pass-through fetch: always hit the network.
self.addEventListener('fetch', () => {
  // no-op → browser uses default network handling
});
