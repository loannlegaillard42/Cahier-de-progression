/* Garde le jeu dans l'ordinateur : il s'ouvre même sans Internet, et se met à jour quand une nouvelle version est en ligne. */
const CACHE = "reliques-549a62004d";
const FICHIERS = ["./", "index.html", "manifest.webmanifest", "icones/icone-192.png", "icones/icone-512.png", "icones/icone-masque-512.png", "icones/icone-apple-180.png"];
self.addEventListener("install", (e) => { e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS))); self.skipWaiting(); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((l) => Promise.all(l.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // réseau d'abord (pour recevoir les mises à jour), sinon la copie gardée
  e.respondWith(fetch(e.request).then((r) => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then((k) => k.put(e.request, c)); } return r; }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("index.html"))));
});
