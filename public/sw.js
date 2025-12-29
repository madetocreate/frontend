/* eslint-disable no-restricted-globals */

const OFFLINE_CACHE = "aklow-offline-v1";
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(OFFLINE_CACHE);
        // Precache offline page, manifest, and essential icons
        const urlsToCache = [
          OFFLINE_URL,
          "/manifest.webmanifest",
          "/icons/icon-192x192.png",
          "/icons/icon-512x512.png",
        ];
        
        await Promise.all(
          urlsToCache.map((url) =>
            cache.add(new Request(url, { cache: "reload" })).catch(() => {
              // Ignore failures for individual URLs
            })
          )
        );
      } catch (e) {
        // Wenn das Precache-Fetch failt, blocken wir die Installation nicht.
      }
      // skipWaiting wird automatisch aufgerufen, aber wir können auch auf Nachricht reagieren
      await self.skipWaiting();
    })()
  );
});

// Reagiere auf SKIP_WAITING Nachrichten für sofortige Aktivierung
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k.startsWith("aklow-offline-") && k !== OFFLINE_CACHE)
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") {
    // Nur GET-Requests werden vom Service Worker gecacht
    return;
  }

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isNavigation = req.mode === "navigate" || req.destination === "document";
  if (!isNavigation) return;

  event.respondWith(
    (async () => {
      try {
        return await fetch(req);
      } catch (e) {
        const cache = await caches.open(OFFLINE_CACHE);
        const cached = await cache.match(OFFLINE_URL);
        return (
          cached ||
          new Response("Offline", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" },
          })
        );
      }
    })()
  );
});


