/* Génère rituels/cartes.js : les fonds de carte de l'outil « Carte à compléter » (reviser.html).

   Les côtes viennent de Natural Earth (domaine public), au 1:50 000 000, via le paquet world-atlas ;
   les fleuves, du fichier ne_50m_rivers_lake_centerlines.geojson de Natural Earth (dépôt nvkelso/natural-earth-vector).
   Chaque fond est une projection simple (équirectangulaire, corrigée à la latitude moyenne) :
   x = (lon - lon0) × kx, y = (lat0 - lat) × ky. La page refait le même calcul pour placer les lieux,
   qui gardent donc leurs coordonnées géographiques (lon, lat) dans cours.js.

   Pour ajouter ou modifier un fond : compléter FONDS ci-dessous, puis, depuis un dossier de travail
     npm install world-atlas@2.0.2 d3-geo@3.1.1 topojson-client@3.1.0
     node chemin/vers/outils/fonds-de-carte.js chemin/vers/ne_50m_rivers_lake_centerlines.geojson > chemin/vers/rituels/cartes.js
   (NODE_PATH doit permettre de trouver les trois paquets).
   Noms : mers (toujours affichés, s'ils tiennent : max = largeur maximale en unités de la carte, \n = retour à la ligne)
   et nomsFleuves (affichés quand on zoome). */

var d3 = require("d3-geo");
var topojson = require("topojson-client");
var land = require("world-atlas/land-50m.json");
var fleuves = JSON.parse(require("fs").readFileSync(process.argv[2], "utf8"));

var LARGEUR = 1000;
var FONDS = [
  { id: "mediterranee", nom: "L'Europe et la Méditerranée", ouest: -11, est: 47, nord: 52.5, sud: 28,
    mers: [
      { nom: "Océan\nAtlantique", lon: -6.3, lat: 46.2 },
      { nom: "Mer Méditerranée", lon: 17.5, lat: 33.4, grand: true },
      { nom: "Mer Noire", lon: 34.2, lat: 43.4 },
      { nom: "Mer Tyrrhénienne", lon: 12.2, lat: 39.9, max: 150 },
      { nom: "Mer Adriatique", lon: 15.2, lat: 43.0, rot: 42, max: 150 },
      { nom: "Mer Égée", lon: 24.9, lat: 39.4, max: 80 }
    ],
    nomsFleuves: [
      { nom: "Nil", lon: 31.55, lat: 28.75 }, { nom: "Tigre", lon: 44.1, lat: 35.9 }, { nom: "Euphrate", lon: 40.9, lat: 33.9 },
      { nom: "Danube", lon: 25.4, lat: 44.25 }, { nom: "Rhin", lon: 6.6, lat: 50.2 }, { nom: "Rhône", lon: 5.4, lat: 44.8 },
      { nom: "Seine", lon: 1.2, lat: 49.15 }, { nom: "Loire", lon: 0.3, lat: 47.65 }, { nom: "Pô", lon: 10.2, lat: 45.35 },
      { nom: "Tage", lon: -6.4, lat: 39.95 }, { nom: "Èbre", lon: -0.7, lat: 42.05 }
    ] }
];

function arrondir(v) { return Math.round(v * 1000) / 1000; }

var terres = topojson.feature(land, land.objects.land);
var sortie = FONDS.map(function (f) {
  var latMoy = (f.nord + f.sud) / 2 * Math.PI / 180;
  var k = LARGEUR / ((f.est - f.ouest) * Math.cos(latMoy));
  var kx = arrondir(k * Math.cos(latMoy)), ky = arrondir(k);
  var hauteur = Math.round((f.nord - f.sud) * ky);
  // projection plane faite à la main, puis découpe au cadre (avec une marge, pour que le trait de côte
  // ne dessine jamais le bord du cadre) et écriture du tracé SVG au dixième près
  function projeter(c) { return [(c[0] - f.ouest) * kx, (f.nord - c[1]) * ky]; }
  function polys(g) {
    var p = g.type === "Polygon" ? [g.coordinates] : g.coordinates;
    return p.map(function (poly) { return poly.map(function (anneau) { return anneau.map(projeter); }); });
  }
  var plan = { type: "MultiPolygon", coordinates: [] };
  terres.features.forEach(function (ft) { plan.coordinates = plan.coordinates.concat(polys(ft.geometry)); });
  var marge = 8;
  var proj = d3.geoIdentity().clipExtent([[-marge, -marge], [LARGEUR + marge, hauteur + marge]]);
  var trace = d3.geoPath(proj).digits(1)(plan) || "";
  // on retire les anneaux réduits à rien après découpe (îles hors du cadre)
  trace = trace.split("Z").filter(function (s) { return /L/.test(s); }).join("Z") + "Z";
  // fleuves : les grands cours d'eau (rang ≤ 6), sans les canaux
  var lignes = { type: "MultiLineString", coordinates: [] };
  fleuves.features.forEach(function (ft) {
    var p = ft.properties || {};
    if (p.scalerank > 6 || /canal/i.test(p.name || "") || !/River|Lake Centerline/.test(p.featurecla || "")) return;
    var g = ft.geometry;
    (g.type === "LineString" ? [g.coordinates] : g.coordinates).forEach(function (l) { lignes.coordinates.push(l.map(projeter)); });
  });
  var traceFleuves = (d3.geoPath(proj).digits(1)(lignes) || "").split("M").filter(function (s) { return /L/.test(s); }).map(function (s) { return "M" + s; }).join("");
  return {
    id: f.id, nom: f.nom, lon0: f.ouest, lat0: f.nord, kx: kx, ky: ky, l: LARGEUR, h: hauteur,
    mers: f.mers, nomsFleuves: f.nomsFleuves || [], fleuves: traceFleuves, terre: trace
  };
});

var js = "/* Fonds de carte de la boîte à outils — fichier généré par outils/fonds-de-carte.js, ne pas modifier à la main.\n" +
  "   Côtes : Natural Earth (domaine public), via world-atlas. Projection : x = (lon - lon0) × kx, y = (lat0 - lat) × ky. */\n" +
  "const FONDS = {\n" + sortie.map(function (f) {
    var t = f.terre, r = f.fleuves; delete f.terre; delete f.fleuves;
    var tete = JSON.stringify(f).slice(0, -1);
    return "  " + JSON.stringify(f.id) + ": " + tete + ",\n    \"fleuves\": " + JSON.stringify(r) + ",\n    \"terre\": " + JSON.stringify(t) + " }";
  }).join(",\n") + "\n};\n";
process.stdout.write(js);
