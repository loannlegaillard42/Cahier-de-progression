const fs = require('fs');
const { topology } = require('topojson-server');
const { presimplify, simplify, quantile } = require('topojson-simplify');
const { quantize, feature, mesh, merge } = require('topojson-client');
const gj = JSON.parse(fs.readFileSync('cells_proj.geojson', 'utf8'));
// l'axe y du SVG pointe vers le bas : on inverse y
for (const f of gj.features) {
  const flip = c => typeof c[0] === 'number' ? [c[0], -c[1]] : c.map(flip);
  f.geometry.coordinates = flip(f.geometry.coordinates);
}
let topo = topology({ cellules: gj }, 1e6);
topo = presimplify(topo);
const seuil = parseFloat(process.argv[2] || '0.6');
topo = simplify(topo, seuil);
topo = quantize(topo, 2e4);
// on ne garde que les propriétés utiles
for (const g of topo.objects.cellules.geometries) {
  const p = g.properties;
  g.id = p.id;
  g.properties = { a: p.o1812, b: p.o1815 };
  if (p.dossier) g.properties.d = p.dossier;
  if (p.grp) g.properties.g = p.grp;
  if (p.confed) g.properties.c = 1;
}
const txt = JSON.stringify(topo);
fs.writeFileSync('europe.topo.json', txt);
console.log('arcs', topo.arcs.length, 'taille', (txt.length / 1024).toFixed(0), 'Ko', 'géométries', topo.objects.cellules.geometries.length);
