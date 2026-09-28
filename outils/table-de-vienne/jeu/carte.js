/* La table de Vienne — moteur de la carte (SVG, sans bibliothèque de rendu).
   Les données sont dans carte-donnees.js : window.EUROPE (TopoJSON des cellules historiques),
   EAUX (fleuves, lacs), VILLES, ETIQUETTES, ZONES. Coordonnées en km (y vers le bas).
   Une « cellule » est un morceau de territoire qui a un propriétaire en 1812 (propriété a),
   en 1815 (b), et éventuellement un dossier de négociation (d) et un groupe (g).
   Fluidité : pendant un glisser ou un zoom, on déplace l'image déjà dessinée (transformation CSS,
   traitée par la carte graphique) ; la carte n'est redessinée qu'à la fin du geste. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const TOPO = window.EUROPE, OBJ = TOPO.objects.cellules, GEOMS = OBJ.geometries;
  const tj = window.topojson;
  const PAR_ID = {};
  GEOMS.forEach(g => { PAR_ID[g.id] = g; });

  /* ---------- Palette : une carte gravée et coloriée ---------- */
  const PAPIER = '#F2EBDA', MER = '#D2E0DF', MER_TRAIT = '#B7CDCC', ENCRE = '#3D3832', ROUGE = '#C0492B';
  const COUL = {
    FRA: '#6F7FC4', GBR: '#D27389', AUT: '#DDAA2E', PRU: '#4F7FA3', RUS: '#7FA766', POL: '#A9C98C', KRA: '#B98FC0',
    ESP: '#D9985E', POR: '#8DBF82', NLD: '#EC7F2D', SUI: '#B8473D', SAR: '#5FAFA8', PAR: '#B3A1D6', MOD: '#93C5A0',
    LUC: '#8FB3D9', TOS: '#C99B77', PAP: '#B77BA6', SIC: '#86B1DC', DEN: '#D46A5D', SWN: '#7F9ED0', OTT: '#B9996A',
    BAV: '#7DBBDF', WUR: '#D9A098', BAD: '#E6BF72', SAX: '#78AE86', HAN: '#C98F78', GER: '#CBBE9E',
    POLi: '#D6545B', VEN: '#B8452F', GEN: '#D98E3F', ITN: '#6DAE5B', BEL: '#E3B23C', NAPm: '#9B7FC8', ALL: '#8C8173'
  };
  const STATUT_1812 = {
    EMP: 'empire', ITA: 'dep', NAP: 'dep', ESPj: 'dep', CDR: 'dep', CDR_BAV: 'dep', CDR_WUR: 'dep', CDR_BAD: 'dep', CDR_SAX: 'dep',
    VAR: 'dep', SUI: 'dep', NEU: 'dep', LUCP: 'dep', DAN: 'dep', PRU: 'allie', AUT: 'allie', DNK: 'allie',
    GBR: 'ennemi', RUS: 'ennemi', SWE: 'ennemi', POR: 'ennemi', SICi: 'ennemi', SARi: 'ennemi', OTT: 'neutre'
  };
  const COUL_1812 = { empire: '#36539C', dep: '#8EA3DA', allie: '#CDB46E', ennemi: '#C66A66', neutre: '#A6B59A' };
  const LEGENDE_1812 = [['empire', 'Empire français'], ['dep', 'États dépendants de Napoléon'], ['allie', 'Alliés de Napoléon'], ['ennemi', 'Adversaires de Napoléon'], ['neutre', 'Neutre']];
  const NOMS = {
    FRA: 'Royaume de France', GBR: 'Royaume-Uni', AUT: "Empire d'Autriche", PRU: 'Royaume de Prusse', RUS: 'Empire russe',
    POL: 'Royaume de Pologne (uni à la Russie)', KRA: 'Ville libre de Cracovie', ESP: 'Royaume d’Espagne', POR: 'Royaume de Portugal',
    NLD: 'Royaume des Pays-Bas', SUI: 'Confédération suisse', SAR: 'Royaume de Piémont-Sardaigne', PAR: 'Duché de Parme',
    MOD: 'Duché de Modène', LUC: 'Duché de Lucques', TOS: 'Grand-duché de Toscane', PAP: 'États pontificaux', SIC: 'Royaume des Deux-Siciles',
    DEN: 'Royaume de Danemark', SWN: 'Suède-Norvège', OTT: 'Empire ottoman', BAV: 'Royaume de Bavière', WUR: 'Royaume de Wurtemberg',
    BAD: 'Grand-duché de Bade', SAX: 'Royaume de Saxe', HAN: 'Royaume de Hanovre', GER: 'Autres États allemands', HORS: '',
    POLi: 'Pologne indépendante', VEN: 'République de Venise', GEN: 'République de Gênes', ITN: "Royaume d'Italie",
    BEL: 'Belgique indépendante', NAPm: 'Royaume de Naples (Murat)', ALL: 'Allemagne unifiée',
    EMP: 'Empire français', ITA: "Royaume d'Italie (Napoléon roi)", NAP: 'Royaume de Naples (Murat)', ESPj: 'Espagne (Joseph Bonaparte)',
    CDR: 'Confédération du Rhin', CDR_BAV: 'Bavière (Confédération du Rhin)', CDR_WUR: 'Wurtemberg (Confédération du Rhin)',
    CDR_BAD: 'Bade (Confédération du Rhin)', CDR_SAX: 'Saxe (Confédération du Rhin)', VAR: 'Duché de Varsovie', NEU: 'Principauté de Neuchâtel',
    LUCP: 'Principauté de Lucques', DAN: 'Ville libre de Dantzig', DNK: 'Danemark-Norvège', SWE: 'Suède', SICi: 'Sicile (Bourbons)', SARi: 'Sardaigne (Savoie)'
  };
  const ALLEMANDS = { GER: 1, BAV: 1, WUR: 1, BAD: 1, SAX: 1, HAN: 1, PRU: 1, AUT: 1, DEN: 1, NLD: 1 };

  function hexRgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  function melange(h, t) {
    const a = hexRgb(h), b = hexRgb(PAPIER);
    return 'rgb(' + a.map((v, i) => Math.round(v * t + b[i] * (1 - t))).join(' ') + ')';
  }
  function couleurDe(o, mode) {
    if (!o || o === 'HORS') return null;
    if (mode === '1812') { const s = STATUT_1812[o]; return s ? COUL_1812[s] : '#999'; }
    return COUL[o] || '#999';
  }
  const teinte = (o, mode, coul) => melange(coul, mode === '1812' && o === 'EMP' ? .66 : .5);

  /* ---------- Tracés ---------- */
  const r0 = v => Math.round(v * 2) / 2;
  function dPoly(geom) {
    if (!geom) return '';
    const polys = geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
    let s = '';
    for (const p of polys) for (const ring of p) s += 'M' + ring.map(pt => r0(pt[0]) + ' ' + r0(pt[1])).join('L') + 'Z';
    return s;
  }
  function dLignes(geom) {
    if (!geom) return '';
    const ls = geom.type === 'LineString' ? [geom.coordinates] : geom.coordinates;
    return ls.map(l => 'M' + l.map(pt => r0(pt[0]) + ' ' + r0(pt[1])).join('L')).join('');
  }
  const dSuite = pts => 'M' + pts.map(p => p[0] + ' ' + p[1]).join('L');
  function el(tag, attrs, parent) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) if (attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------- Propriétaires ---------- */
  function proprietaires(mode) {
    const out = {};
    for (const g of GEOMS) out[g.id] = mode === '1812' ? g.properties.a : g.properties.b;
    return out;
  }
  const cellulesDe = (dossier, grp) => GEOMS.filter(g => g.properties.d === dossier && (!grp || g.properties.g === grp)).map(g => g.id);
  const fusion = ids => tj.merge(TOPO, ids.map(id => PAR_ID[id]));
  // les tracés déjà calculés sont gardés en mémoire : changer une proposition ne recalcule que ce qui change
  const cacheTraces = new Map();
  function dFusion(ids) {
    const k = ids.join(',');
    let d = cacheTraces.get(k);
    if (d === undefined) { d = dPoly(fusion(ids)); cacheTraces.set(k, d); }
    return d;
  }

  /* ---------- État de la carte ---------- */
  const EXT = ZONES.cadres.europe;          // [x0, y0, x1, y1]
  const LARG_REF = EXT[2] - EXT[0];
  const MARGE = .25;                         // l'image déborde de 25 % de chaque côté : rien de vide pendant un glisser
  let hote, svg, defs, gRoot, calques = {}, tip;
  let vb = { x: EXT[0], y: EXT[1], w: EXT[2] - EXT[0], h: EXT[3] - EXT[1] };   // vue dessinée
  let vv = null;                                                              // vue pendant un geste
  let etat = { mode: '1815', proprio: null, indecis: [], allemagne: 'confed', actif: null, villes3: [], marqueurs: [] };
  let pxW = 800, pxH = 600, signature = '', sigVilles = '', dernierW = 0;

  function init(h, opts) {
    hote = h; opts = opts || {};
    svg = el('svg', { class: 'carte-svg', role: 'img', 'aria-label': opts.label || "Carte de l'Europe", preserveAspectRatio: 'none' });
    defs = el('defs', null, svg);
    // hachures des territoires à négocier
    const pat = el('pattern', { id: 'hachures', patternUnits: 'userSpaceOnUse', width: 14, height: 14, patternTransform: 'rotate(45)' }, defs);
    el('rect', { width: 14, height: 14, fill: '#F6EFE0' }, pat);
    el('line', { x1: 0, y1: 0, x2: 0, y2: 14, stroke: ROUGE, 'stroke-width': 4.5, 'stroke-opacity': .5 }, pat);
    gRoot = el('g', null, svg);
    for (const n of ['mer', 'grille', 'halo', 'etats', 'lacs', 'fleuves', 'frontieres', 'confed', 'hachures', 'cote', 'actif', 'villes', 'etiquettes', 'marqueurs']) {
      // seuls les États et les zones hachurées réagissent à la souris : le reste est ignoré par le navigateur
      calques[n] = el('g', { class: 'c-' + n, 'pointer-events': n === 'etats' || n === 'hachures' ? null : 'none' }, gRoot);
    }
    el('rect', { x: EXT[0] - 3000, y: EXT[1] - 3000, width: LARG_REF + 6000, height: (EXT[3] - EXT[1]) + 6000, fill: MER }, calques.mer);
    el('path', { d: ZONES.graticule.map(dSuite).join(''), fill: 'none', stroke: '#A9C1C0', 'stroke-width': .6, 'vector-effect': 'non-scaling-stroke' }, calques.grille);
    // côtes, lacs, fleuves : ne changent jamais
    const cote = dLignes(tj.mesh(TOPO, OBJ, (a, b) => a === b));
    el('path', { d: cote, fill: 'none', stroke: MER_TRAIT, 'stroke-width': 7, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' }, calques.halo);
    el('path', { d: EAUX.lacs.map(l => dSuite(l) + 'Z').join(''), fill: MER, stroke: '#7F9E9D', 'stroke-width': .6, 'vector-effect': 'non-scaling-stroke' }, calques.lacs);
    el('path', { d: EAUX.fleuves.map(f => f.l.map(dSuite).join('')).join(''), fill: 'none', stroke: '#86A9B7', 'stroke-width': .9, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' }, calques.fleuves);
    el('path', { d: cote, fill: 'none', stroke: '#5E6E6C', 'stroke-width': .8, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' }, calques.cote);
    hote.appendChild(svg);
    tip = document.createElement('div'); tip.className = 'carte-info'; tip.hidden = true; hote.appendChild(tip);
    ecouteurs();
    redimensionner();
    if ('ResizeObserver' in window) new ResizeObserver(redimensionner).observe(hote);
    else window.addEventListener('resize', redimensionner);
  }

  /* ---------- Rendu des États (seulement si quelque chose a changé) ---------- */
  function afficher(e) {
    etat = Object.assign({}, etat, e);
    const mode = etat.mode;
    const proprio = mode === 'jeu' ? etat.proprio : proprietaires(mode);
    const indecis = new Set(mode === 'jeu' ? (etat.indecis || []) : []);
    const sig = mode + '|' + (mode === 'jeu' ? JSON.stringify(proprio) + '|' + [...indecis].join(',') + '|' + etat.allemagne : '');
    let change = false;
    if (sig !== signature) {
      signature = sig; change = true;
      dessinerEtats(mode, proprio, indecis);
    }
    surligner(etat.actif || null);
    const sv = (etat.villes3 || []).join(',');
    if (sv !== sigVilles || change) { sigVilles = sv; villes(); change = true; }
    if (change) majEchelle(true);
  }
  function dessinerEtats(mode, proprio, indecis) {
    const parProprio = {};
    for (const g of GEOMS) {
      if (indecis.has(g.properties.d) && g.properties.d !== 'allemagne') continue;
      const o = proprio[g.id];
      (parProprio[o] = parProprio[o] || []).push(g.id);
    }
    for (const n of ['etats', 'frontieres', 'confed', 'hachures', 'etiquettes']) calques[n].replaceChildren();
    for (const o in parProprio) {
      const coul = couleurDe(o, mode);
      if (!coul) continue;
      el('path', { d: dFusion(parProprio[o]), fill: teinte(o, mode, coul), 'data-o': o }, calques.etats);
    }
    // frontières entre États différents : un trait doux et large, puis un trait fin
    const own = g => indecis.has(g.properties.d) && g.properties.d !== 'allemagne' ? '?' + g.properties.d : proprio[g.id];
    const d = dLignes(tj.mesh(TOPO, OBJ, (a, b) => a !== b && own(a) !== own(b)));
    el('path', { d, fill: 'none', stroke: 'rgb(70 55 40 / .22)', 'stroke-width': 4, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' }, calques.frontieres);
    el('path', { d, fill: 'none', stroke: ENCRE, 'stroke-width': 1, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke', opacity: .85 }, calques.frontieres);
    // Confédération du Rhin (1812) ou Confédération germanique (1815)
    let dansConf = null;
    if (mode === '1812') dansConf = g => /^CDR/.test(g.properties.a);
    else if (mode === '1815' || (mode === 'jeu' && (etat.allemagne === 'confed' || etat.allemagne === 'empire'))) dansConf = g => !!g.properties.c && !!ALLEMANDS[proprio[g.id]];
    if (dansConf) {
      el('path', { d: dLignes(tj.mesh(TOPO, OBJ, (a, b) => a !== b && dansConf(a) !== dansConf(b))), fill: 'none', stroke: mode === '1812' ? '#23397A' : '#7A2E1F',
        'stroke-width': 3, 'stroke-dasharray': mode === 'jeu' && etat.allemagne === 'empire' ? '2 5' : '9 5', 'stroke-linecap': 'round', 'vector-effect': 'non-scaling-stroke', opacity: .8 }, calques.confed);
    }
    // territoires encore à négocier : hachures cliquables
    for (const dsr of indecis) {
      if (dsr === 'allemagne') continue;
      const ids = cellulesDe(dsr);
      if (!ids.length) continue;
      const dd = dFusion(ids);
      el('path', { d: dd, fill: 'url(#hachures)', 'data-dossier': dsr, class: 'a-negocier' }, calques.hachures);
      el('path', { d: dd, fill: 'none', stroke: ROUGE, 'stroke-width': 2, 'stroke-dasharray': '6 4', 'vector-effect': 'non-scaling-stroke', 'pointer-events': 'none' }, calques.hachures);
    }
    etiquettes(proprio, indecis);
  }

  let actifCourant = null;
  function surligner(dossier) {
    etat.actif = dossier;
    if (dossier === actifCourant && calques.actif.firstChild) return;
    actifCourant = dossier;
    calques.actif.replaceChildren();
    if (!dossier) return;
    const ids = dossier === 'allemagne' ? GEOMS.filter(g => g.properties.c).map(g => g.id) : cellulesDe(dossier);
    if (!ids.length) return;
    el('path', { d: dFusion(ids), fill: 'none', stroke: ROUGE, 'stroke-width': 3.5, 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke', opacity: .9 }, calques.actif);
  }

  /* ---------- Étiquettes et villes ---------- */
  function etiquettes(proprio, indecis) {
    const jeu = etat.mode === 'jeu';
    const src = ETIQUETTES[etat.mode === '1812' ? '1812' : '1815'];
    const presents = new Set(Object.values(proprio));
    for (const o in src) {
      if (!presents.has(o)) continue;
      for (const L of src[o]) {
        // l'étiquette n'est affichée que si l'État possède bien le lieu où elle est posée
        const cel = PAR_ID[L.c];
        if (cel && proprio[L.c] !== o) continue;
        if (cel && jeu && indecis.has(cel.properties.d) && cel.properties.d !== 'allemagne') continue;
        texte(L.t, L.p, L.s, L.y);
      }
    }
    if (etat.mode === '1812') texte('Confédération du Rhin', ZONES.libelles.cdr, .7, 'b', '#23397A');
    if (etat.mode === '1815' || (jeu && etat.allemagne === 'confed')) texte('Confédération germanique', ZONES.libelles.confed, .62, 'b', '#7A2E1F');
    if (jeu && etat.allemagne === 'empire') texte('Saint-Empire rétabli', ZONES.libelles.confed, .62, 'b', '#7A2E1F');
    for (const dsr of indecis) {
      const z = ZONES.dossiers[dsr];
      if (!z || dsr === 'allemagne') continue;
      texte(z.t + ' ?', z.p, .82, 'q');
    }
  }
  function texte(t, p, s, style, coul) {
    const e = el('text', { x: p[0], y: p[1], 'text-anchor': 'middle', 'dominant-baseline': 'middle', class: 'et et-' + style, 'data-s': s }, calques.etiquettes);
    if (coul) e.setAttribute('fill', coul);
    e.textContent = style === 'A' ? t.toUpperCase() : t;
  }
  function villes() {
    calques.villes.replaceChildren();
    const v3 = new Set(etat.villes3 || []);
    for (const v of VILLES) {
      if (v.niv === 3 && !v3.has(v.id)) continue;
      const g = el('g', { class: 'ville niv' + v.niv, 'data-niv': v.niv, 'data-x': v.p[0], 'data-y': v.p[1] }, calques.villes);
      el('circle', { r: v.niv === 1 ? 3.2 : 2.5, fill: v.niv === 1 ? ENCRE : '#fff', stroke: ENCRE, 'stroke-width': 1.2 }, g);
      const t = el('text', { x: 5, y: -4, class: 'ville-nom' }, g);
      t.textContent = v.n;
    }
  }

  /* ---------- Marqueurs (Cent-Jours, chronique 1815-1848) ---------- */
  function marqueurs(liste) { etat.marqueurs = liste || []; majMarqueurs(); majEchelle(true); }
  function majMarqueurs() {
    calques.marqueurs.replaceChildren();
    const parVille = {};
    for (const v of VILLES) parVille[v.id] = v;
    for (const m of etat.marqueurs) {
      const v = parVille[m.ville]; if (!v) continue;
      const g = el('g', { class: 'marq', 'data-x': v.p[0], 'data-y': v.p[1] }, calques.marqueurs);
      if (m.actif) el('circle', { r: 15, fill: 'none', stroke: ROUGE, 'stroke-width': 2.5, opacity: .55 }, g);
      if (m.type === 'defense') el('rect', { x: -7, y: -7, width: 14, height: 14, rx: 2, transform: 'rotate(45)', fill: '#1F4E5F', stroke: '#fff', 'stroke-width': 2 }, g);
      else el('circle', { r: m.actif ? 9 : 8, fill: m.type === 'neutre' && !m.actif ? '#8A7F6A' : ROUGE, stroke: '#fff', 'stroke-width': 2 }, g);
      if (m.texte) {
        const t = el('text', { x: -12, y: 5, 'text-anchor': 'end', class: 'marq-texte' }, g);
        t.textContent = m.texte;
      }
    }
  }

  /* ---------- Échelle : tailles constantes à l'écran (recalculées seulement quand le zoom change) ---------- */
  function majEchelle(force) {
    if (!svg) return;
    if (!force && Math.abs(vb.w - dernierW) < 1e-6) return;
    dernierW = vb.w;
    const upp = vb.w / pxW;              // km par pixel
    const k = LARG_REF / vb.w;           // 1 = toute l'Europe
    const pat = defs.querySelector('#hachures');
    const t = (11 * upp).toFixed(3);
    pat.setAttribute('width', t); pat.setAttribute('height', t);
    pat.firstChild.setAttribute('width', t); pat.firstChild.setAttribute('height', t);
    pat.lastChild.setAttribute('y2', t); pat.lastChild.setAttribute('stroke-width', (3.4 * upp).toFixed(3));
    // sur une petite carte (téléphone), les noms d'États rapetissent pour ne pas se chevaucher
    const fk = Math.min(1.75, Math.max(.8, Math.sqrt(k))) * Math.min(1, Math.max(.62, pxW / 880));
    for (const tx of calques.etiquettes.children) {
      const s = parseFloat(tx.dataset.s) || 1;
      const style = tx.classList.contains('et-A') ? 'A' : tx.classList.contains('et-q') ? 'q' : 'b';
      const px = (style === 'A' ? 14 : 13) * s * fk;
      tx.style.display = px < 7.2 ? 'none' : '';
      tx.setAttribute('font-size', (px * upp).toFixed(2));
      tx.setAttribute('stroke-width', ((style === 'q' ? 4 : 3) * upp).toFixed(2));
      tx.setAttribute('letter-spacing', style === 'A' ? (px * .14 * upp).toFixed(2) : 0);
    }
    const sc = ' scale(' + upp.toFixed(4) + ')';
    for (const g of calques.villes.children) {
      const niv = +g.dataset.niv;
      g.style.display = niv === 1 || niv === 3 || k >= 1.9 ? '' : 'none';
      g.setAttribute('transform', 'translate(' + g.dataset.x + ' ' + g.dataset.y + ')' + sc);
    }
    for (const g of calques.marqueurs.children) g.setAttribute('transform', 'translate(' + g.dataset.x + ' ' + g.dataset.y + ')' + sc);
  }

  /* ---------- Vue : dessin et gestes ---------- */
  function poserSvg() {
    // l'élément SVG est plus grand que la zone visible (MARGE de chaque côté)
    Object.assign(svg.style, { position: 'absolute', left: (-MARGE * pxW) + 'px', top: (-MARGE * pxH) + 'px', width: (pxW * (1 + 2 * MARGE)) + 'px', height: (pxH * (1 + 2 * MARGE)) + 'px', transformOrigin: (MARGE * pxW) + 'px ' + (MARGE * pxH) + 'px' });
  }
  function dessinerVue() {
    svg.style.transform = '';
    svg.setAttribute('viewBox', (vb.x - MARGE * vb.w).toFixed(2) + ' ' + (vb.y - MARGE * vb.h).toFixed(2) + ' ' + (vb.w * (1 + 2 * MARGE)).toFixed(2) + ' ' + (vb.h * (1 + 2 * MARGE)).toFixed(2));
    majEchelle();
  }
  function montrerGeste() {
    // la vue « virtuelle » vv est obtenue en transformant l'image déjà dessinée (vb)
    const s = vb.w / vv.w;
    const tx = (vb.x - vv.x) * pxW / vv.w, ty = (vb.y - vv.y) * pxH / vv.h;
    svg.style.transform = 'translate(' + tx.toFixed(1) + 'px,' + ty.toFixed(1) + 'px) scale(' + s.toFixed(4) + ')';
  }
  let minuteurFin = null;
  function commencerGeste() { if (!vv) vv = Object.assign({}, vb); clearTimeout(minuteurFin); }
  function finirGeste(delai) {
    clearTimeout(minuteurFin);
    const fin = () => {
      if (!vv) return;
      const pareil = Math.abs(vv.x - vb.x) < 1e-6 && Math.abs(vv.y - vb.y) < 1e-6 && Math.abs(vv.w - vb.w) < 1e-6;
      vb = vv; vv = null;
      if (pareil) { svg.style.transform = ''; return; }   // simple clic : rien à redessiner
      dessinerVue();
    };
    if (delai) minuteurFin = setTimeout(fin, delai); else fin();
  }
  function redimensionner() {
    const r = hote.getBoundingClientRect();
    if (r.width < 10 || r.height < 10) return;
    if (vv) finirGeste();
    const cx = vb.x + vb.w / 2, cy = vb.y + vb.h / 2;
    pxW = r.width; pxH = r.height;
    vb.h = vb.w * pxH / pxW;
    vb.x = cx - vb.w / 2; vb.y = cy - vb.h / 2;
    borner(vb); poserSvg(); dessinerVue(); majEchelle(true);
  }
  function borner(v) {
    const minW = 220, maxW = LARG_REF * 1.15;
    if (v.w < minW || v.w > maxW) {
      const c = v.x + v.w / 2, cy = v.y + v.h / 2, w = Math.min(maxW, Math.max(minW, v.w));
      v.w = w; v.h = w * pxH / pxW; v.x = c - w / 2; v.y = cy - v.h / 2;
    }
    const mx = EXT[0] - v.w * .3, Mx = EXT[2] + v.w * .3 - v.w, my = EXT[1] - v.h * .3, My = EXT[3] + v.h * .3 - v.h;
    v.x = Math.min(Math.max(v.x, Math.min(mx, Mx)), Math.max(mx, Mx));
    v.y = Math.min(Math.max(v.y, Math.min(my, My)), Math.max(my, My));
  }
  function zoomAutour(v, f, px, py) {
    const ux = v.x + px / pxW * v.w, uy = v.y + py / pxH * v.h;
    v.w /= f; v.h /= f;
    v.x = ux - px / pxW * v.w; v.y = uy - py / pxH * v.h;
    borner(v);
  }
  const REDUIT = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  let animation = null;
  function cadrer(cible, anim) {
    let b = null;
    if (Array.isArray(cible)) b = cible;
    else if (ZONES.cadres[cible]) b = ZONES.cadres[cible];
    else if (ZONES.dossiers[cible]) b = ZONES.dossiers[cible].b;
    if (!b) return;
    const marge = .06;
    let w = (b[2] - b[0]) * (1 + marge * 2), h = (b[3] - b[1]) * (1 + marge * 2);
    if (w / h < pxW / pxH) w = h * pxW / pxH; else h = w * pxH / pxW;
    const but = { x: (b[0] + b[2]) / 2 - w / 2, y: (b[1] + b[3]) / 2 - h / 2, w, h };
    borner(but);
    cancelAnimationFrame(animation);
    const dep = vv ? Object.assign({}, vv) : Object.assign({}, vb);
    // un dézoom important ferait apparaître des bords vides : on saute directement
    if (anim === false || REDUIT || but.w > dep.w * 1.6) { vv = null; vb = but; dessinerVue(); return; }
    commencerGeste();
    const t0 = performance.now(), duree = 650;
    const pas = t => {
      const u = Math.min(1, (t - t0) / duree), e = u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      const w2 = Math.exp(Math.log(dep.w) + (Math.log(but.w) - Math.log(dep.w)) * e);
      const cx = dep.x + dep.w / 2 + ((but.x + but.w / 2) - (dep.x + dep.w / 2)) * e;
      const cy = dep.y + dep.h / 2 + ((but.y + but.h / 2) - (dep.y + dep.h / 2)) * e;
      vv = { w: w2, h: w2 * pxH / pxW, x: cx - w2 / 2, y: cy - w2 * pxH / pxW / 2 };
      montrerGeste();
      if (u < 1) animation = requestAnimationFrame(pas); else { vv = but; finirGeste(); }
    };
    animation = requestAnimationFrame(pas);
  }

  /* ---------- Souris, doigts ---------- */
  function ecouteurs() {
    const pointeurs = new Map();
    let dep = null, glisse = false, pince = null, rafSurvol = 0;
    hote.addEventListener('wheel', e => {
      e.preventDefault();
      cancelAnimationFrame(animation);
      commencerGeste();
      const r = hote.getBoundingClientRect();
      zoomAutour(vv, Math.exp(-e.deltaY * (e.deltaMode === 1 ? .05 : .0018)), e.clientX - r.left, e.clientY - r.top);
      montrerGeste();
      finirGeste(180);
    }, { passive: false });
    hote.addEventListener('pointerdown', e => {
      if (e.target.closest && e.target.closest('button')) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      try { hote.setPointerCapture(e.pointerId); } catch (x) { /* rien */ }
      cancelAnimationFrame(animation);
      commencerGeste();
      if (pointeurs.size === 1) { dep = { x: e.clientX, y: e.clientY, v: Object.assign({}, vv) }; glisse = false; }
      if (pointeurs.size === 2) {
        const [a, b] = [...pointeurs.values()];
        pince = { d: Math.hypot(a.x - b.x, a.y - b.y), v: Object.assign({}, vv) };
      }
    });
    hote.addEventListener('pointermove', e => {
      if (!pointeurs.has(e.pointerId)) {
        if (e.pointerType === 'mouse' && !rafSurvol) { const ev = e; rafSurvol = requestAnimationFrame(() => { rafSurvol = 0; survol(ev); }); }
        return;
      }
      pointeurs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const r = hote.getBoundingClientRect();
      if (pointeurs.size === 2 && pince) {
        const [a, b] = [...pointeurs.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        vv = Object.assign({}, pince.v);
        zoomAutour(vv, d / pince.d, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top);
        montrerGeste(); glisse = true;
        return;
      }
      if (!dep) return;
      const dx = e.clientX - dep.x, dy = e.clientY - dep.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) glisse = true;
      if (glisse) {
        tip.hidden = true;
        vv = Object.assign({}, dep.v, { x: dep.v.x - dx * dep.v.w / pxW, y: dep.v.y - dy * dep.v.h / pxH });
        borner(vv); montrerGeste();
      }
    });
    const fin = e => {
      if (!pointeurs.has(e.pointerId)) return;
      const etaitGlisse = glisse;
      pointeurs.delete(e.pointerId);
      if (pointeurs.size < 2) pince = null;
      if (pointeurs.size === 1) { const [p] = [...pointeurs.values()]; dep = { x: p.x, y: p.y, v: Object.assign({}, vv) }; }
      if (pointeurs.size === 0) {
        dep = null; glisse = false;
        finirGeste();
        if (!etaitGlisse && e.type === 'pointerup') clic(e);
      }
    };
    hote.addEventListener('pointerup', fin);
    hote.addEventListener('pointercancel', fin);
    hote.addEventListener('pointerleave', () => { tip.hidden = true; });
  }
  function cibleSous(e) {
    const n = document.elementFromPoint(e.clientX, e.clientY);
    return n && n.closest ? n.closest('[data-dossier],[data-o]') : null;
  }
  function survol(e) {
    if (vv) { tip.hidden = true; return; }
    const c = cibleSous(e);
    if (!c) { tip.hidden = true; svg.style.cursor = ''; return; }
    const r = hote.getBoundingClientRect();
    let t;
    if (c.dataset.dossier) { t = ZONES.dossiers[c.dataset.dossier].t + ' : à négocier'; svg.style.cursor = 'pointer'; }
    else { t = NOMS[c.dataset.o] || ''; svg.style.cursor = ''; }
    if (!t) { tip.hidden = true; return; }
    tip.textContent = t; tip.hidden = false;
    const x = Math.min(e.clientX - r.left + 14, r.width - tip.offsetWidth - 6);
    tip.style.transform = 'translate(' + Math.max(6, x) + 'px,' + Math.max(6, e.clientY - r.top - 34) + 'px)';
  }
  function clic(e) {
    const c = cibleSous(e);
    if (!c || !C.surClic) return;
    if (c.dataset.dossier) C.surClic({ type: 'dossier', id: c.dataset.dossier });
    else C.surClic({ type: 'etat', id: c.dataset.o, nom: NOMS[c.dataset.o] || '' });
  }

  /* ---------- Carte fixe (pour le carnet) ---------- */
  function svgStatique(proprio, mode, cadre, titre) {
    const b = cadre || ZONES.cadres.centre;
    const w = b[2] - b[0], h = b[3] - b[1];
    const parProprio = {};
    for (const g of GEOMS) { const o = proprio[g.id]; (parProprio[o] = parProprio[o] || []).push(g.id); }
    let s = '<svg xmlns="' + NS + '" viewBox="' + b[0] + ' ' + b[1] + ' ' + w + ' ' + h + '" role="img" aria-label="' + (titre || 'Carte') + '" class="carte-fixe">';
    s += '<rect x="' + b[0] + '" y="' + b[1] + '" width="' + w + '" height="' + h + '" fill="' + MER + '"/>';
    for (const o in parProprio) {
      const coul = couleurDe(o, mode);
      s += '<path d="' + dPoly(fusion(parProprio[o])) + '" fill="' + (coul ? melange(coul, .55) : PAPIER) + '"/>';
    }
    s += '<path d="' + dLignes(tj.mesh(TOPO, OBJ, (a, c) => a !== c && proprio[a.id] !== proprio[c.id])) + '" fill="none" stroke="' + ENCRE + '" stroke-width="' + (w / 700).toFixed(2) + '"/>';
    s += '<path d="' + dLignes(tj.mesh(TOPO, OBJ, (a, c) => a === c)) + '" fill="none" stroke="#5E6E6C" stroke-width="' + (w / 900).toFixed(2) + '"/>';
    const src = ETIQUETTES[mode === '1812' ? '1812' : '1815'];
    const presents = new Set(Object.values(proprio));
    for (const o in src) {
      if (!presents.has(o)) continue;
      for (const L of src[o]) {
        if (PAR_ID[L.c] && proprio[L.c] !== o) continue;
        if (L.s < .6 || L.p[0] < b[0] || L.p[0] > b[2] || L.p[1] < b[1] || L.p[1] > b[3]) continue;
        const fs = (w / 58 * L.s).toFixed(1);
        s += '<text x="' + L.p[0] + '" y="' + L.p[1] + '" text-anchor="middle" dominant-baseline="middle" font-family="\'IM Fell English SC\', Georgia, serif" font-size="' + fs + '" fill="#2E2A25" stroke="' + PAPIER + '" stroke-width="' + (fs / 5).toFixed(1) + '" paint-order="stroke">' + (L.y === 'A' ? L.t.toUpperCase() : L.t) + '</text>';
      }
    }
    return s + '</svg>';
  }

  /* ---------- Légende ---------- */
  function legende(mode) {
    if (mode === '1812') return LEGENDE_1812.map(([k, t]) => ({ couleur: melange(COUL_1812[k], k === 'empire' ? .66 : .5), bord: COUL_1812[k], texte: t }));
    const presents = new Set(Object.values(mode === 'jeu' ? (etat.proprio || {}) : proprietaires('1815')));
    const ordre = ['FRA', 'GBR', 'AUT', 'PRU', 'RUS', 'POL', 'POLi', 'ALL'];
    return ordre.filter(o => presents.has(o)).map(o => ({ couleur: melange(COUL[o], .5), bord: COUL[o], texte: NOMS[o].replace(' (uni à la Russie)', ' (au tsar)') }))
      .concat([{ couleur: melange(COUL.GER, .5), bord: COUL.GER, texte: 'Autres États' }]);
  }

  const C = window.Carte = {
    init, afficher, cadrer, surligner, marqueurs, legende, proprietaires, cellulesDe, svgStatique,
    zoom: f => { cancelAnimationFrame(animation); if (vv) finirGeste(); zoomAutour(vb, f, pxW / 2, pxH / 2); dessinerVue(); },
    villesEvenement: ids => { etat.villes3 = ids || []; const sv = etat.villes3.join(','); if (sv !== sigVilles) { sigVilles = sv; villes(); majEchelle(true); } },
    nom: o => NOMS[o] || o,
    couleur: (o, mode) => couleurDe(o, mode || '1815'),
    cellules: () => GEOMS.map(g => ({ id: g.id, a: g.properties.a, b: g.properties.b, d: g.properties.d || null, g: g.properties.g || null })),
    surClic: null
  };
})();
