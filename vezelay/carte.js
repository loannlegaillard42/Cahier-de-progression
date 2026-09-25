/* Carte de la deuxième croisade (1146-1149) : itinéraires animés, en SVG.
   Sert dans le jeu (étapes 7 à 9) et pour produire le Doc. 7 de la fiche (mode statique).
   Itinéraires d'après Odon de Deuil et J. Phillips, The Second Crusade (2007) ; tracés simplifiés. */
(function () {
  'use strict';
  const K = Math.cos(42 * Math.PI / 180);
  const P = (lon, lat) => [(lon + 12) * K * 10, (57 - lat) * 10];
  const PLEIN = [0, 0, (46 + 12) * K * 10, 300];
  const VUES = {
    tout: [P(-11, 52)[0], P(-11, 52)[1], (41 + 11) * K * 10, (52 - 29.5) * 10],
    europe: [P(-3, 52.5)[0], P(-3, 52.5)[1], (21 + 3) * K * 10, (52.5 - 42) * 10],
    balkans: [P(-2.5, 51.5)[0], P(-2.5, 51.5)[1], (32 + 2.5) * K * 10, (51.5 - 36) * 10],
    orient: [P(24, 42.5)[0], P(24, 42.5)[1], (41 - 24) * K * 10, (42.5 - 30) * 10],
    anatolie: [P(24.5, 42.3)[0], P(24.5, 42.3)[1], (36 - 24.5) * K * 10, (42.3 - 35.3) * 10],
    levant: [P(31, 38.5)[0], P(31, 38.5)[1], (40 - 31) * K * 10, (38.5 - 30.5) * 10],
    ouest: [P(-12, 52)[0], P(-12, 52)[1], (8 + 12) * K * 10, (52 - 35.5) * 10]
  };

  const BALKANS = [[12.10, 49.02], [13.46, 48.57], [16.37, 48.21], [18.74, 47.79], [20.46, 44.82], [21.90, 43.32], [23.32, 42.70], [24.75, 42.15], [26.56, 41.68], [28.98, 41.01]];
  const ROUTES = {
    bernard: { nom: 'Bernard prêche la croisade (1146-1147)', couleur: '#6B4A2E', ep: 2.2, pts: [[4.79, 48.15], [3.75, 47.47], [4.79, 48.15], [6.2, 49.4], [8.27, 50.0], [8.68, 50.11], [8.43, 49.32]] },
    louis1: { nom: 'Armée de Louis VII (1147)', couleur: '#2F5E9E', ep: 3, pts: [[2.36, 48.94], [6.18, 49.12], [8.36, 49.63], ...BALKANS] },
    louis2: { nom: 'Louis VII en Asie Mineure (1147-1148)', couleur: '#2F5E9E', ep: 3, pts: [[28.98, 41.01], [29.72, 40.43], [28.5, 40.2], [27.0, 39.6], [27.18, 39.12], [27.14, 38.42], [27.34, 37.94], [29.11, 37.84], [29.3, 37.72], [30.70, 36.89]] },
    louisMer: { nom: 'Louis VII, par mer', couleur: '#2F5E9E', ep: 2, mer: true, pts: [[30.70, 36.89], [31.4, 36.45], [32.6, 36.0], [34.2, 36.25], [35.6, 36.05], [35.93, 36.12]] },
    louisLevant: { nom: 'Louis VII en Terre sainte', couleur: '#2F5E9E', ep: 3, pts: [[35.93, 36.12], [36.16, 36.20], [35.85, 34.43], [35.5, 33.3], [35.21, 31.77], [35.08, 32.93]] },
    conrad1: { nom: 'Armée de Conrad III (1147)', couleur: '#C98A1B', ep: 3, pts: [[12.30, 48.77], ...BALKANS.slice(1).map(([a, b]) => [a + 0.25, b - 0.3])] },
    conrad2: { nom: 'Conrad III en Asie Mineure (1147)', couleur: '#C98A1B', ep: 3, pts: [[29.23, 40.71], [29.72, 40.2], [30.52, 39.78]] },
    conradRetour: { nom: 'Conrad III, retour puis par mer', couleur: '#C98A1B', ep: 2, mer: true, pts: [[30.52, 39.78], [29.6, 40.3], [28.98, 40.8], [28.0, 40.65], [26.6, 40.3], [26.2, 40.0], [25.9, 39.0], [26.3, 37.5], [27.9, 36.4], [29.5, 36.0], [32.0, 34.4], [34.0, 33.5], [35.08, 32.93]] },
    damas: { nom: 'Vers Damas (juillet 1148)', couleur: '#7A2E8A', ep: 3.2, pts: [[35.08, 32.93], [35.55, 32.85], [35.65, 33.25], [36.0, 33.45], [36.29, 33.51]] },
    lisbonne: { nom: 'Croisés anglais, flamands et allemands (1147)', couleur: '#2F7A45', ep: 2.6, mer: true, pts: [[-3.58, 50.35], [-4.6, 49.3], [-6.0, 47.8], [-9.8, 44.0], [-9.3, 42.0], [-9.0, 41.1], [-9.6, 39.5], [-9.14, 38.72]] }
  };
  const LIEUX = {
    clairvaux: { lon: 4.79, lat: 48.15, nom: 'Clairvaux', type: 'ville', ancre: 's' },
    vezelay: { lon: 3.75, lat: 47.47, nom: 'Vézelay', sous: 'mars 1146', type: 'etape', ancre: 's' },
    paris: { lon: 2.36, lat: 48.94, nom: 'Saint-Denis', sous: 'juin 1147', type: 'ville', ancre: 'w' },
    etampes: { lon: 2.16, lat: 48.43, nom: 'Étampes', sous: 'févr. 1147', type: 'ville', ancre: 'w' },
    metz: { lon: 6.18, lat: 49.12, nom: 'Metz', type: 'ville', ancre: 'n' },
    mayence: { lon: 8.27, lat: 50.0, nom: 'Mayence', type: 'etape', ancre: 'n' },
    spire: { lon: 8.43, lat: 49.32, nom: 'Spire', sous: 'Noël 1146', type: 'etape', ancre: 's' },
    ratisbonne: { lon: 12.10, lat: 49.02, nom: 'Ratisbonne', type: 'ville', ancre: 'n' },
    constantinople: { lon: 28.98, lat: 41.01, nom: 'Constantinople', type: 'ville', ancre: 'n' },
    nicee: { lon: 29.72, lat: 40.43, nom: 'Nicée', type: 'ville', ancre: 'e' },
    dorylee: { lon: 30.52, lat: 39.78, nom: 'Dorylée', sous: 'oct. 1147', type: 'defaite', ancre: 'e' },
    ephese: { lon: 27.34, lat: 37.94, nom: 'Éphèse', type: 'ville', ancre: 'w' },
    cadmos: { lon: 29.3, lat: 37.72, nom: 'Mont Cadmos', sous: 'janv. 1148', type: 'defaite', ancre: 's' },
    attalia: { lon: 30.70, lat: 36.89, nom: 'Attalia', type: 'ville', ancre: 's' },
    antioche: { lon: 36.16, lat: 36.20, nom: 'Antioche', type: 'ville', ancre: 'e' },
    edesse: { lon: 38.79, lat: 37.16, nom: 'Édesse', sous: 'perdue en 1144', type: 'perte', ancre: 'n' },
    acre: { lon: 35.08, lat: 32.93, nom: 'Acre', type: 'ville', ancre: 'w' },
    jerusalem: { lon: 35.21, lat: 31.77, nom: 'Jérusalem', type: 'ville', ancre: 'w' },
    damas: { lon: 36.29, lat: 33.51, nom: 'Damas', sous: 'juillet 1148', type: 'defaite', ancre: 'e' },
    lisbonne: { lon: -9.14, lat: 38.72, nom: 'Lisbonne', sous: 'oct. 1147', type: 'succes', ancre: 'e' },
    dartmouth: { lon: -3.58, lat: 50.35, nom: 'Dartmouth', type: 'ville', ancre: 'e' },
    rome: { lon: 12.49, lat: 41.9, nom: 'Rome', type: 'ville', ancre: 'e' }
  };
  const REGIONS = [
    ['ROYAUME DE FRANCE', 0.8, 45.4], ['EMPIRE GERMANIQUE', 11.2, 51.2], ['HONGRIE', 22.3, 47.3], ['EMPIRE BYZANTIN', 23.5, 40.3],
    ['TURCS SELDJOUKIDES', 32.0, 38.7], ['ZENGI', 38.6, 35.0], ['AL-ANDALUS', -4.6, 37.6], ['PORTUGAL', -8.0, 40.6], ['ANGLETERRE', -1.6, 52.2]
  ];
  const MERS = [['Méditerranée', 17.5, 34.8], ['Atlantique', -7.3, 46.3], ['mer Noire', 34.0, 43.2]];
  const ETATS_LATINS = [
    [[35.8, 36.95], [37.0, 36.95], [37.1, 35.8], [36.3, 35.35], [35.75, 35.7]],
    [[35.75, 35.3], [36.4, 35.15], [36.35, 34.3], [35.6, 34.2]],
    [[34.95, 34.15], [35.9, 34.1], [36.0, 33.2], [35.8, 32.3], [35.6, 31.3], [35.4, 29.8], [34.9, 29.5], [34.3, 31.3], [34.9, 32.9]]
  ];

  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };
  function lisse(pts) {
    // courbe de Catmull-Rom convertie en Bézier cubiques
    const q = pts.map(([lo, la]) => P(lo, la));
    let d = 'M' + q[0][0].toFixed(1) + ' ' + q[0][1].toFixed(1);
    for (let i = 0; i < q.length - 1; i++) {
      const p0 = q[i - 1] || q[i], p1 = q[i], p2 = q[i + 1], p3 = q[i + 2] || q[i + 1];
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += 'C' + [c1, c2, p2].map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
    }
    return d;
  }
  function symbole(g, type, x, y, r) {
    if (type === 'defaite') {
      el('circle', { cx: x, cy: y, r: r * 1.5, fill: '#C0492B', stroke: '#fff', 'stroke-width': r * 0.35, 'data-r': r * 1.5, class: 'sym' }, g);
      const s = r * 0.75;
      el('path', { d: `M${x - s} ${y - s}L${x + s} ${y + s}M${x + s} ${y - s}L${x - s} ${y + s}`, stroke: '#fff', 'stroke-width': r * 0.45, 'stroke-linecap': 'round', class: 'sym-x', 'data-s': s }, g);
    } else if (type === 'succes') {
      el('circle', { cx: x, cy: y, r: r * 1.5, fill: '#2F7A45', stroke: '#fff', 'stroke-width': r * 0.35, 'data-r': r * 1.5, class: 'sym' }, g);
      el('path', { d: `M${x - r * 0.7} ${y}L${x - r * 0.15} ${y + r * 0.6}L${x + r * 0.8} ${y - r * 0.6}`, stroke: '#fff', 'stroke-width': r * 0.45, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    } else if (type === 'perte') {
      el('circle', { cx: x, cy: y, r: r * 1.3, fill: '#fff', stroke: '#C0492B', 'stroke-width': r * 0.55, 'data-r': r * 1.3, class: 'sym' }, g);
    } else if (type === 'etape') {
      el('circle', { cx: x, cy: y, r: r * 1.25, fill: '#6B4A2E', stroke: '#fff', 'stroke-width': r * 0.35, 'data-r': r * 1.25, class: 'sym' }, g);
    } else {
      el('circle', { cx: x, cy: y, r: r, fill: '#22313A', stroke: '#fff', 'stroke-width': r * 0.35, 'data-r': r, class: 'sym' }, g);
    }
  }

  function creer(conteneur, opts) {
    opts = opts || {};
    const svg = el('svg', { viewBox: PLEIN.join(' '), class: 'carte-croisade', role: 'img', 'aria-label': 'Carte de la deuxième croisade (1146-1149)', preserveAspectRatio: 'xMidYMid meet' });
    const defs = el('defs', {}, svg);
    const hach = el('pattern', { id: 'hachures-latins', width: 3, height: 3, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' }, defs);
    el('rect', { width: 3, height: 3, fill: 'rgba(192,73,43,0.18)' }, hach);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 3, stroke: 'rgba(192,73,43,0.6)', 'stroke-width': 1.1 }, hach);
    el('rect', { x: -50, y: -50, width: PLEIN[2] + 100, height: PLEIN[3] + 100, fill: '#BCD7DD' }, svg);
    const grat = el('g', { stroke: 'rgba(255,255,255,0.55)', 'stroke-width': 0.6, fill: 'none', 'vector-effect': 'non-scaling-stroke' }, svg);
    for (let lon = -10; lon <= 40; lon += 10) { const [x] = P(lon, 0); el('line', { x1: x, y1: 0, x2: x, y2: 300, 'vector-effect': 'non-scaling-stroke' }, grat); }
    for (let lat = 30; lat <= 55; lat += 5) { const [, y] = P(0, lat); el('line', { x1: 0, y1: y, x2: PLEIN[2], y2: y, 'vector-effect': 'non-scaling-stroke' }, grat); }
    el('path', { d: TERRES_EUROPE, fill: '#F1E9D6', stroke: '#8F836B', 'stroke-width': 0.9, 'fill-rule': 'evenodd', 'vector-effect': 'non-scaling-stroke' }, svg);
    const gEtats = el('g', {}, svg);
    ETATS_LATINS.forEach(poly => el('path', { d: 'M' + poly.map(([a, b]) => P(a, b).map(v => v.toFixed(1)).join(' ')).join('L') + 'Z', fill: 'url(#hachures-latins)', stroke: '#C0492B', 'stroke-width': 0.8, 'vector-effect': 'non-scaling-stroke' }, gEtats));
    const gTextes = el('g', { 'font-family': "Arimo, Arial, sans-serif" }, svg);
    const textes = [];
    const texte = (s, x, y, taille, attrs) => { const t = el('text', Object.assign({ x, y, 'font-size': taille, 'data-fs': taille }, attrs || {}), gTextes); t.textContent = s; textes.push(t); return t; };
    REGIONS.forEach(([n, lo, la]) => { const [x, y] = P(lo, la); texte(n, x, y, 4.2, { 'text-anchor': 'middle', fill: 'rgba(79,94,102,0.75)', 'font-weight': 700, 'letter-spacing': 0.8 }); });
    MERS.forEach(([n, lo, la]) => { const [x, y] = P(lo, la); texte(n, x, y, 4.6, { 'text-anchor': 'middle', fill: 'rgba(31,78,95,0.7)', 'font-style': 'italic' }); });
    { const [x, y] = P(33.4, 30.3); texte('ÉTATS LATINS', x, y, 3.8, { 'text-anchor': 'end', fill: '#C0492B', 'font-weight': 700 }); }
    const gRoutes = el('g', { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    const routes = {};
    for (const id in ROUTES) {
      const r = ROUTES[id];
      // épaisseurs en unités de la carte, ajustées au zoom (pas de vector-effect : il fausserait l'animation du tracé)
      const halo = el('path', { d: lisse(r.pts), stroke: 'rgba(255,255,255,0.85)', 'data-ep': (r.ep + 2.2) * 0.55 }, gRoutes);
      const p = el('path', { d: lisse(r.pts), stroke: r.couleur, 'data-ep': r.ep * 0.55, opacity: r.mer ? 0.85 : 1 }, gRoutes);
      routes[id] = { p, halo, visible: true };
    }
    const gLieux = el('g', {}, svg);
    const lieux = {};
    for (const id in LIEUX) {
      const l = LIEUX[id], [x, y] = P(l.lon, l.lat), g = el('g', { 'data-lieu': id }, gLieux);
      symbole(g, l.type, x, y, 1.6);
      const dx = { e: 3.2, w: -3.2, n: 0, s: 0 }[l.ancre], dy = { e: 1.5, w: 1.5, n: -3.4, s: 5.8 }[l.ancre];
      const anc = { e: 'start', w: 'end', n: 'middle', s: 'middle' }[l.ancre];
      const t = el('text', { x: x + dx, y: y + dy, 'text-anchor': anc, 'font-size': 5, 'data-fs': 5, 'font-weight': 700, fill: l.type === 'defaite' || l.type === 'perte' ? '#9A3220' : l.type === 'succes' ? '#23603A' : '#22313A', stroke: '#fff', 'stroke-width': 1.6, 'paint-order': 'stroke', 'data-sw': 1.6, 'font-family': "Arimo, Arial, sans-serif" }, g);
      t.textContent = l.nom;
      if (l.sous) { const s = el('text', { x: x + dx, y: y + dy + 4.6, 'text-anchor': anc, 'font-size': 3.8, fill: '#4F5E66', stroke: '#fff', 'stroke-width': 1.3, 'paint-order': 'stroke', 'font-family': "Arimo, Arial, sans-serif" }, g); s.textContent = l.sous; }
      lieux[id] = g;
    }
    conteneur.appendChild(svg);

    let vb = PLEIN.slice(), anim = null;
    function appliquerVue(v) {
      vb = v; svg.setAttribute('viewBox', v.map(n => n.toFixed(2)).join(' '));
      // textes et symboles gardent une taille lisible quel que soit le zoom
      const z = Math.max(0.3, v[2] / VUES.tout[2]);
      textes.forEach(t => t.setAttribute('font-size', (+t.dataset.fs * z).toFixed(2)));
      gRoutes.querySelectorAll('path').forEach(p => p.setAttribute('stroke-width', (+p.dataset.ep * z).toFixed(3)));
      gLieux.querySelectorAll('g[data-lieu]').forEach(g => {
        const l = LIEUX[g.dataset.lieu], [x, y] = P(l.lon, l.lat);
        g.setAttribute('transform', `translate(${x} ${y}) scale(${z.toFixed(3)}) translate(${-x} ${-y})`);
      });
    }
    function zoom(cible, duree) {
      const v = Array.isArray(cible) ? cible : VUES[cible] || VUES.tout;
      if (anim) cancelAnimationFrame(anim);
      if (!duree || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { appliquerVue(v); return; }
      const de = vb.slice(), t0 = performance.now();
      const pas = now => {
        const t = Math.min(1, (now - t0) / duree), e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        appliquerVue(de.map((a, i) => a + (v[i] - a) * e));
        if (t < 1) anim = requestAnimationFrame(pas);
      };
      anim = requestAnimationFrame(pas);
    }
    function montrerRoute(id, visible, animer) {
      const r = routes[id]; if (!r) return;
      const L = r.p.getTotalLength();
      [r.p, r.halo].forEach(p => {
        p.style.transition = 'none';
        p.style.strokeDasharray = L + ' ' + L;
        p.style.strokeDashoffset = visible && !animer ? '0' : String(L);
      });
      if (visible && animer) {
        const duree = Math.max(1.2, Math.min(4, L / 60));
        requestAnimationFrame(() => requestAnimationFrame(() => [r.p, r.halo].forEach(p => { p.style.transition = `stroke-dashoffset ${duree}s ease-in-out`; p.style.strokeDashoffset = '0'; })));
      }
      r.visible = visible;
    }
    function etat(e) {
      const rs = e.routes || [], ls = e.lieux || null, deja = e.deja || [];
      for (const id in routes) {
        const avant = routes[id].visible;
        const voulu = rs.includes(id) || deja.includes(id);
        montrerRoute(id, voulu, voulu && !deja.includes(id) && e.animer !== false && (!avant || e.rejouer));
      }
      for (const id in lieux) lieux[id].style.display = !ls || ls.includes(id) ? '' : 'none';
      gEtats.style.display = e.etats === false ? 'none' : '';
      zoom(e.vue || 'tout', e.animer === false ? 0 : 1400);
    }
    for (const id in routes) montrerRoute(id, false, false);
    appliquerVue(VUES.tout);
    if (opts.statique) { for (const id in routes) montrerRoute(id, true, false); }
    return { svg, etat, zoom, vues: VUES };
  }

  window.CarteCroisade = { creer, ROUTES, LIEUX, VUES };
})();
