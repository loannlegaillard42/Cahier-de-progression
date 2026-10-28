// Service worker de la boîte à outils (dossier rituels/) : la page, les fiches et les documents restent
// disponibles sans connexion, après une première visite en ligne.
// - La page et activation.json : le réseau d'abord (3 s au plus), le cache en secours, pour que les chapitres
//   ouverts par le professeur arrivent tout de suite.
// - Les fiches (cours.js, cartes.js…), les images et les polices : le cache d'abord, mis à jour en arrière-plan
//   pour la visite suivante.
// Le service worker de l'application principale (../sw.js) laisse ce dossier de côté.
const CACHE = "reviser-v1";
const BASE = [
  "./reviser.html", "./cours.js", "./cartes.js", "./questions.js", "./reperes.js", "./activation.json",
  "../vendor/qrcode-generator-1.4.4.js", "../icon-192.png"
];
const POLICES = /^https:\/\/fonts\.(googleapis|gstatic)\.com\//;

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(BASE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("reviser-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// une seule entrée par fichier, quels que soient les paramètres (activation.json?t=…, reviser.html?demo)
const cle = (url) => { const u = new URL(url); return u.origin + u.pathname; };
const garder = (req, rep) => {
  // les polices de Google arrivent « opaques » (sans statut lisible) : on les garde quand même
  if (rep && ((rep.ok && (rep.type === "basic" || rep.type === "cors")) || (rep.type === "opaque" && POLICES.test(req.url)))) {
    const copie = rep.clone();
    caches.open(CACHE).then((cache) => cache.put(POLICES.test(req.url) ? req.url : cle(req.url), copie));
  }
  return rep;
};
const duCache = (req) => caches.open(CACHE).then((cache) => cache.match(POLICES.test(req.url) ? req.url : cle(req.url)));

function reseauDabord(req) {
  const reseau = fetch(req).then((rep) => garder(req, rep));
  const delai = new Promise((ok) => setTimeout(ok, 3000)).then(() => duCache(req));
  return Promise.race([reseau.catch(() => duCache(req)), delai.then((r) => r || reseau)])
    .then((r) => r || reseau)
    .catch(() => duCache(req).then((r) => r || Response.error()));
}

function cacheDabord(req, e) {
  return duCache(req).then((enCache) => {
    const reseau = fetch(req).then((rep) => garder(req, rep));
    if (enCache) {
      e.waitUntil(reseau.catch(() => {}));
      return enCache;
    }
    return reseau;
  });
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (POLICES.test(req.url)) { e.respondWith(cacheDabord(req, e)); return; }
  const url = new URL(req.url);
  // l'API GitHub (publication du professeur) et les autres sites : toujours en direct
  if (url.origin !== self.location.origin) return;
  if (req.mode === "navigate" || url.pathname.endsWith(".html") || url.pathname.endsWith("/activation.json")) {
    e.respondWith(reseauDabord(req));
    return;
  }
  e.respondWith(cacheDabord(req, e));
});
