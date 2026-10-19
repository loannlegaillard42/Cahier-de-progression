const CACHE = "cahier-hg-v10";
const ASSETS = [
  "./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png",
  // React, hébergé dans le dépôt : sans lui en cache, l'app reste blanche hors connexion.
  "./vendor/react-18.3.1.min.js", "./vendor/react-dom-18.3.1.min.js",
];
// Polices Google : gardées en cache après la première visite, pour la même typographie hors connexion.
const FONTS = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;

  // La page elle-même : on va TOUJOURS chercher la version du réseau d'abord,
  // pour qu'une mise à jour s'applique dès le rechargement. Le cache ne sert
  // que de secours en cas de coupure de connexion.
  const isPage = e.request.mode === "navigate" || e.request.destination === "document";
  if (isPage) {
    e.respondWith(
      fetch(e.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request).then((c) => c || caches.match("./index.html")))
    );
    return;
  }

  // Le reste (React, icônes, manifeste, polices) : cache d'abord, c'est stable et ça reste rapide.
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request)
        .then((res) => {
          const cacheable = e.request.url.startsWith(self.location.origin) || FONTS.test(e.request.url);
          // Une feuille de style Google importée sans CORS revient « opaque » (statut 0) : on la garde aussi.
          if (res && (res.status === 200 || res.type === "opaque") && cacheable) {
            const clone = res.clone();
            caches.open(CACHE).then((cache) => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
