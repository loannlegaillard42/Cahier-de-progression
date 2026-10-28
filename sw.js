const CACHE = "cahier-hg-v12";
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
    // les caches « reviser-… » appartiennent au service worker de la boîte à outils (rituels/sw.js) : on n'y touche pas
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE && !k.startsWith("reviser-")).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// On ne lit que le cache de cette version : un ancien cache resté en place
// (ancienne page qui chargeait React depuis unpkg) ne doit jamais servir.
const fromCache = (req) => caches.open(CACHE).then((cache) => cache.match(req));

// Le dossier rituels/ est une app à part : le service worker n'y touche pas.
const RITUELS = new URL("./rituels", self.registration.scope).href;

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const url = e.request.url.split(/[?#]/)[0];
  if (url === RITUELS || url.startsWith(RITUELS + "/")) return;
  // Synchro : l'API GitHub, toujours en direct
  if (url.startsWith("https://api.github.com/")) return;

  // La page elle-même : on va chercher la version du réseau d'abord, pour qu'une
  // mise à jour s'applique dès le rechargement. Le cache sert de secours sans
  // connexion, et aussi quand le réseau traîne (Wi-Fi de l'établissement) : au bout
  // de 3 s on ouvre la copie en cache, et la version téléchargée servira la fois suivante.
  const isPage = e.request.mode === "navigate" || e.request.destination === "document";
  if (isPage) {
    let saving = Promise.resolve();
    const network = fetch(e.request).then((res) => {
      const clone = res.clone();
      saving = caches.open(CACHE).then((cache) => cache.put(e.request, clone));
      return res;
    });
    const fallback = () => fromCache(e.request).then((c) => c || fromCache("./index.html"));
    e.respondWith(
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => fallback().then((c) => c && resolve(c)), 3000);
        network.then(
          (res) => { clearTimeout(timer); resolve(res); },
          () => { clearTimeout(timer); fallback().then((c) => (c ? resolve(c) : reject(new Error("hors connexion")))); }
        );
      })
    );
    e.waitUntil(network.then(() => saving, () => {}));
    return;
  }

  // Le reste (React, icônes, manifeste, polices) : cache d'abord, c'est stable et ça reste rapide.
  e.respondWith(
    fromCache(e.request).then((cached) => {
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
