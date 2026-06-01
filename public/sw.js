// Service Worker — managed by vite-plugin-pwa (this file is a fallback)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
