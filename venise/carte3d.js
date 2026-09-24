/* Galère pour l'Orient — la carte en relief, les villes et la galère (Three.js r150, script classique).
   Le déroulé du jeu (questions, marché, événements) est dans jeu.js ; les textes dans donnees.js. */
(function () {
  'use strict';

  /* ---------- Projection (identique à terre.js et aux routes de donnees.js) ---------- */
  const LON0 = 21.25, LAT0 = 38.25, KX = Math.cos(LAT0 * Math.PI / 180);
  const XMIN = (4.5 - LON0) * KX, XMAX = (38 - LON0) * KX, ZMIN = -(48 - LAT0), ZMAX = -(28.5 - LAT0);
  const MW = XMAX - XMIN, MH = ZMAX - ZMIN;
  const GX = 330, GZ = Math.round(GX * MH / MW);
  const TW = 2048, TH = Math.round(TW * MH / MW);
  const proj = (lon, lat) => [(lon - LON0) * KX, -(lat - LAT0)];
  const deproj = (x, z) => [x / KX + LON0, LAT0 - z];

  /* ---------- Relief : grandes chaînes de montagnes (lon, lat), hauteur, largeur ---------- */
  const RELIEF = [
    { h: 0.62, w: 0.55, p: [[6.4, 44.0], [6.9, 45.2], [7.4, 45.9], [8.6, 46.35], [10.3, 46.45], [12.0, 46.6], [13.8, 46.45], [15.2, 47.2]] },
    { h: 0.32, w: 0.4, p: [[8.3, 44.35], [10.2, 44.2], [11.9, 43.6], [13.3, 42.6], [14.3, 41.7], [15.4, 40.7], [16.1, 39.7], [16.3, 38.8], [16.1, 38.2]] },
    { h: 0.36, w: 0.55, p: [[14.6, 45.6], [15.8, 44.6], [17.3, 43.7], [18.9, 42.8], [20.1, 41.9], [20.8, 40.6], [21.3, 39.6], [21.7, 38.6], [22.2, 37.8], [22.4, 36.9]] },
    { h: 0.28, w: 0.4, p: [[22.3, 43.2], [24.3, 42.8], [26.4, 42.7]] },
    { h: 0.3, w: 0.35, p: [[23.3, 41.8], [24.6, 41.6], [25.6, 41.5]] },
    { h: 0.44, w: 0.5, p: [[28.6, 36.9], [30.5, 37.1], [32.3, 36.8], [34.0, 37.1], [35.6, 37.7], [37.6, 38.3]] },
    { h: 0.26, w: 0.6, p: [[29.5, 40.3], [32.0, 40.9], [35.0, 40.9], [37.5, 40.7]] },
    { h: 0.22, w: 0.9, p: [[30.5, 39.0], [33.0, 38.9], [36.0, 39.2]] },
    { h: 0.3, w: 0.25, p: [[35.6, 33.4], [36.0, 34.0], [36.4, 34.6]] },
    { h: 0.26, w: 0.14, p: [[23.7, 35.3], [24.9, 35.2], [25.8, 35.1]] },
    { h: 0.22, w: 0.16, p: [[32.7, 34.95], [33.1, 34.95]] },
    { h: 0.3, w: 0.5, p: [[4.6, 35.8], [7.5, 35.5], [9.4, 35.8], [10.2, 36.2]] },
    { h: 0.26, w: 0.2, p: [[9.0, 42.8], [9.1, 41.9]] },
    { h: 0.18, w: 0.3, p: [[9.1, 40.9], [9.3, 39.7]] },
    { h: 0.24, w: 0.18, p: [[14.3, 37.9], [15.0, 37.75]] },
    { h: 0.28, w: 0.35, p: [[33.6, 29.2], [34.1, 28.6]] }
  ].map(r => ({ h: r.h, w: r.w, p: r.p.map(([lo, la]) => proj(lo, la)) }));

  /* Détroits trop étroits pour le trait de côte simplifié : on les creuse à la main */
  const DETROITS = [
    [[26.10, 40.00], [26.22, 40.06], [26.38, 40.13], [26.42, 40.20], [26.55, 40.30], [26.70, 40.42], [26.90, 40.52]],
    [[28.99, 41.00], [29.02, 41.06], [29.06, 41.12], [29.07, 41.18], [29.12, 41.24]]
  ];

  /* Territoires colorés (possessions vénitiennes) */
  const TERRITOIRES = {
    dalmatie: [[13.4, 45.55], [14.6, 45.25], [15.4, 44.2], [16.3, 43.6], [17.2, 43.2], [18.2, 42.7], [18.6, 42.45], [18.3, 42.3], [17.0, 42.6], [15.8, 42.9], [14.8, 43.7], [14.0, 44.6], [13.4, 44.9]],
    modon: [[21.55, 37.02], [22.08, 37.02], [22.08, 36.68], [21.55, 36.68]],
    crete: [[23.4, 35.8], [26.5, 35.8], [26.5, 34.8], [23.4, 34.8]],
    terreferme: [[9.55, 45.35], [9.6, 45.95], [10.5, 46.2], [11.2, 46.1], [12.0, 46.3], [12.8, 46.6], [13.7, 46.5], [13.65, 45.75], [13.0, 45.65], [12.4, 45.3], [12.3, 45.0], [11.5, 45.05], [10.6, 45.15], [10.0, 45.25]],
    chypre: [[32.1, 35.8], [34.7, 35.8], [34.7, 34.4], [32.1, 34.4]]
  };

  /* ---------- Outils ---------- */
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function hash(i, j) {
    let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  }
  function bruit(x, y) {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y) { let s = 0, a = 0.5, f = 1; for (let o = 0; o < 4; o++) { s += a * bruit(x * f, y * f); f *= 2.03; a *= 0.5; } return s / 0.94; }
  function alea(graine) { let a = graine >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function distSegment(px, pz, ax, az, bx, bz) {
    const dx = bx - ax, dz = bz - az, l2 = dx * dx + dz * dz;
    let t = l2 ? ((px - ax) * dx + (pz - az) * dz) / l2 : 0; t = Math.max(0, Math.min(1, t));
    const qx = ax + t * dx - px, qz = az + t * dz - pz; return Math.sqrt(qx * qx + qz * qz);
  }
  function distLigne(px, pz, pts) { let d = 1e9; for (let i = 0; i < pts.length - 1; i++) d = Math.min(d, distSegment(px, pz, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1])); return pts.length === 1 ? Math.hypot(px - pts[0][0], pz - pts[0][1]) : d; }
  function flou(src, w, h, r) {
    const tmp = new Float32Array(w * h), out = new Float32Array(w * h), n = 2 * r + 1;
    for (let y = 0; y < h; y++) {
      let s = 0; for (let k = -r; k <= r; k++) s += src[y * w + Math.min(w - 1, Math.max(0, k))];
      for (let x = 0; x < w; x++) { tmp[y * w + x] = s / n; s += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)]; }
    }
    for (let x = 0; x < w; x++) {
      let s = 0; for (let k = -r; k <= r; k++) s += tmp[Math.min(h - 1, Math.max(0, k)) * w + x];
      for (let y = 0; y < h; y++) { out[y * w + x] = s / n; s += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]; }
    }
    return out;
  }
  const hex = c => [(c >> 16) & 255, (c >> 8) & 255, c & 255];
  const melange = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  function rampe(stops, v) {
    if (v <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i++) if (v <= stops[i][0]) return melange(stops[i - 1][1], stops[i][1], (v - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0]));
    return stops[stops.length - 1][1];
  }

  /* ---------- Dessin des terres sur un canvas ---------- */
  function tracerTerre(ctx, w, h) {
    const sx = w / MW, sz = h / MH;
    for (const r of TERRE) {
      ctx.beginPath();
      for (let i = 0; i < r.length; i += 2) {
        const X = (r[i] - XMIN) * sx, Y = (r[i + 1] - ZMIN) * sz;
        i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
      }
      ctx.closePath(); ctx.fill();
    }
  }
  function traitCote(ctx, w, h) {
    const sx = w / MW, sz = h / MH;
    ctx.beginPath();
    for (const r of TERRE) {
      for (let i = 0; i < r.length; i += 2) {
        const X = (r[i] - XMIN) * sx, Y = (r[i + 1] - ZMIN) * sz;
        i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y);
      }
      ctx.closePath();
    }
    ctx.stroke();
  }
  function creuserDetroits(ctx, w, h, largeur) {
    ctx.save(); ctx.globalCompositeOperation = 'destination-out'; ctx.strokeStyle = '#000'; ctx.lineWidth = largeur; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const d of DETROITS) {
      ctx.beginPath();
      d.forEach(([lo, la], i) => { const [x, z] = proj(lo, la); const X = (x - XMIN) / MW * w, Y = (z - ZMIN) / MH * h; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
      ctx.stroke();
    }
    ctx.restore();
  }
  function polygoneTex(ctx, pts, w, h) {
    ctx.beginPath();
    pts.forEach(([lo, la], i) => { const [x, z] = proj(lo, la); const X = (x - XMIN) / MW * w, Y = (z - ZMIN) / MH * h; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); });
    ctx.closePath();
  }
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  /* ---------- Calcul du relief sur la grille ---------- */
  function calculerRelief() {
    const nx = GX + 1, nz = GZ + 1;
    const c = canvas(nx, nz), ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; tracerTerre(ctx, nx, nz); creuserDetroits(ctx, nx, nz, 1.6);
    const px = ctx.getImageData(0, 0, nx, nz).data;
    const cov = new Float32Array(nx * nz);
    for (let i = 0; i < nx * nz; i++) cov[i] = px[i * 4 + 3] / 255;
    const proche = flou(cov, nx, nz, 2), loin = flou(cov, nx, nz, 7), tresLoin = flou(cov, nx, nz, 18);
    const H = new Float32Array(nx * nz), L = new Float32Array(nx * nz), D = new Float32Array(nx * nz);
    for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) {
      const i = iz * nx + ix, x = XMIN + ix / GX * MW, z = ZMIN + iz / GZ * MH;
      const n = fbm(x * 0.85 + 3.1, z * 0.85 - 7.3);
      let crete = 0;
      for (const r of RELIEF) { const d = distLigne(x, z, r.p); if (d < r.w * 3) crete += r.h * Math.exp(-(d * d) / (r.w * r.w)); }
      const interieur = smooth(0.4, 1, loin[i]);
      const hTerre = 0.02 + 0.07 * interieur * interieur + 0.72 * crete * (0.45 + 0.75 * n) * smooth(0.45, 0.95, proche[i]) + 0.05 * (n - 0.45) * interieur;
      const prof = 1 - smooth(0, 0.5, tresLoin[i] * 0.55 + loin[i] * 0.45);
      const hMer = -0.03 - 0.3 * prof;
      const t = smooth(0.25, 0.75, cov[i]);
      H[i] = hMer + (hTerre - hMer) * t;
      L[i] = Math.max(0, hTerre); D[i] = prof;
    }
    return { H, L, D, nx, nz };
  }

  /* ---------- Couleurs de la carte ---------- */
  const PLAINE = hex(0xBDB685), COLLINE = hex(0xAE9A6C), MONT = hex(0x8E765B), HAUT = hex(0x7A6853), NEIGE = hex(0xF1EEE8);
  const DESERT = hex(0xDCC28C), NIL = hex(0x86A456), VERT = hex(0x9DAE73);
  const MER_CLAIRE = hex(0x9FD4C8), MER_MOY = hex(0x4B9CB0), MER_PROF = hex(0x215E75);
  function couleursGrille(R) {
    const { nx, nz, L, D } = R;
    const terre = canvas(nx, nz), mer = canvas(nx, nz);
    const it = terre.getContext('2d').createImageData(nx, nz), im = mer.getContext('2d').createImageData(nx, nz);
    for (let iz = 0; iz < nz; iz++) for (let ix = 0; ix < nx; ix++) {
      const i = iz * nx + ix, x = XMIN + ix / GX * MW, z = ZMIN + iz / GZ * MH;
      const [lon, lat] = deproj(x, z);
      const h = L[i], n = fbm(x * 2.2, z * 2.2);
      let c = rampe([[0.02, VERT], [0.09, PLAINE], [0.2, COLLINE], [0.4, MONT], [0.6, HAUT], [0.72, NEIGE]], h + (n - 0.5) * 0.05);
      // déserts d'Afrique du Nord et de Syrie, vallée et delta du Nil
      let des = 0;
      if (lat < 32.6 && lon > 9.5) des = smooth(32.6, 31.4, lat);
      if (lon > 36.4 && lat < 36) des = Math.max(des, smooth(36.4, 37.2, lon) * smooth(36, 34.5, lat));
      if (lon > 33.2 && lat < 31.4) des = Math.max(des, smooth(31.4, 30.8, lat));
      c = melange(c, DESERT, des * (0.85 + 0.15 * n));
      const delta = smooth(31.7, 31.2, lat) * smooth(29.7, 30.2, lon) * smooth(32.5, 32.0, lon) * smooth(29.9, 30.3, lat);
      const vallee = Math.exp(-Math.pow((lon - 31.2) / 0.22, 2)) * smooth(30.4, 30.0, lat);
      c = melange(c, NIL, Math.min(1, delta + vallee) * 0.9);
      const d = D[i];
      const m = rampe([[0, MER_CLAIRE], [0.35, MER_MOY], [1, MER_PROF]], d + (n - 0.5) * 0.06);
      const o = i * 4;
      it.data[o] = c[0]; it.data[o + 1] = c[1]; it.data[o + 2] = c[2]; it.data[o + 3] = 255;
      im.data[o] = m[0]; im.data[o + 1] = m[1]; im.data[o + 2] = m[2]; im.data[o + 3] = 255;
    }
    terre.getContext('2d').putImageData(it, 0, 0); mer.getContext('2d').putImageData(im, 0, 0);
    return { terre, mer };
  }

  function construireFonds(R) {
    const { terre, mer } = couleursGrille(R);
    // masque des terres (blanc opaque sur transparent)
    const masque = canvas(TW, TH), mc = masque.getContext('2d');
    mc.fillStyle = '#fff'; tracerTerre(mc, TW, TH); creuserDetroits(mc, TW, TH, 3.2);
    // fond : mer + graticule + écume côtière + terres
    const fond = canvas(TW, TH), fc = fond.getContext('2d');
    fc.imageSmoothingEnabled = true; fc.imageSmoothingQuality = 'high';
    fc.drawImage(mer, 0, 0, TW, TH);
    fc.strokeStyle = 'rgba(255,255,255,0.13)'; fc.lineWidth = 1.2;
    for (let lon = 5; lon <= 38; lon += 5) { const [x] = proj(lon, 0); const X = (x - XMIN) / MW * TW; fc.beginPath(); fc.moveTo(X, 0); fc.lineTo(X, TH); fc.stroke(); }
    for (let lat = 30; lat <= 48; lat += 5) { const [, z] = proj(0, lat); const Y = (z - ZMIN) / MH * TH; fc.beginPath(); fc.moveTo(0, Y); fc.lineTo(TW, Y); fc.stroke(); }
    fc.strokeStyle = 'rgba(235,250,245,0.42)'; fc.lineWidth = 7; fc.lineJoin = 'round'; traitCote(fc, TW, TH);
    fc.strokeStyle = 'rgba(235,250,245,0.35)'; fc.lineWidth = 3; traitCote(fc, TW, TH);
    const t = canvas(TW, TH), tc = t.getContext('2d');
    tc.drawImage(masque, 0, 0); tc.globalCompositeOperation = 'source-in';
    tc.imageSmoothingEnabled = true; tc.imageSmoothingQuality = 'high'; tc.drawImage(terre, 0, 0, TW, TH);
    fc.drawImage(t, 0, 0);
    // masque de la mer pour l'eau animée
    const merMasque = canvas(1024, Math.round(1024 * TH / TW)), mm = merMasque.getContext('2d');
    mm.fillStyle = '#fff'; mm.fillRect(0, 0, merMasque.width, merMasque.height);
    mm.globalCompositeOperation = 'destination-out'; mm.drawImage(masque, 0, 0, merMasque.width, merMasque.height);
    mm.globalCompositeOperation = 'destination-over'; mm.fillStyle = '#000'; mm.fillRect(0, 0, merMasque.width, merMasque.height);
    return { fond, masque, merMasque };
  }

  /* ---------- Drapeaux ---------- */
  function texDrapeau(type) {
    const c = canvas(128, 84), x = c.getContext('2d');
    const rect = (col) => { x.fillStyle = col; x.fillRect(0, 0, 128, 84); };
    if (type === 'venise') {
      x.fillStyle = '#A3201C';
      x.beginPath(); x.moveTo(0, 0); x.lineTo(128, 0); x.lineTo(128, 60);
      for (let k = 0; k < 4; k++) { x.lineTo(128 - k * 32 - 16, 84); x.lineTo(128 - (k + 1) * 32, 60); }
      x.lineTo(0, 60); x.closePath(); x.fill();
      x.strokeStyle = '#E3B341'; x.lineWidth = 4; x.stroke();
      x.fillStyle = '#E3B341'; x.beginPath(); x.arc(46, 30, 17, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#A3201C'; x.beginPath(); x.ellipse(46, 33, 9, 6, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.arc(40, 25, 4, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.moveTo(48, 28); x.lineTo(62, 14); x.lineTo(58, 30); x.closePath(); x.fill();
    } else if (type === 'byzance') {
      rect('#8E1B1B'); x.fillStyle = '#E3B341'; x.fillRect(58, 0, 12, 84); x.fillRect(0, 36, 128, 12);
      x.font = 'bold 26px serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      [[29, 18], [99, 18], [29, 66], [99, 66]].forEach(([a, b]) => x.fillText('B', a, b));
    } else if (type === 'mamelouk') {
      rect('#E2B42C'); x.fillStyle = '#fff'; x.beginPath(); x.arc(64, 42, 20, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#E2B42C'; x.beginPath(); x.arc(72, 38, 18, 0, Math.PI * 2); x.fill();
    } else if (type === 'chypre') {
      for (let k = 0; k < 7; k++) { x.fillStyle = k % 2 ? '#fff' : '#2F5E9E'; x.fillRect(0, k * 12, 128, 12); }
      x.fillStyle = '#B3261E'; x.beginPath(); x.arc(64, 42, 16, 0, Math.PI * 2); x.fill();
    } else if (type === 'genes') {
      rect('#F6F3EA'); x.fillStyle = '#C8231E'; x.fillRect(54, 0, 20, 84); x.fillRect(0, 32, 128, 20);
    } else if (type === 'pape') {
      rect('#A3201C'); x.lineWidth = 9; x.lineCap = 'round';
      x.strokeStyle = '#E3B341'; x.beginPath(); x.moveTo(40, 70); x.lineTo(88, 14); x.stroke();
      x.strokeStyle = '#D9DDE0'; x.beginPath(); x.moveTo(88, 70); x.lineTo(40, 14); x.stroke();
    } else if (type === 'ottoman') {
      rect('#B3261E'); x.fillStyle = '#fff'; x.beginPath(); x.arc(56, 42, 22, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#B3261E'; x.beginPath(); x.arc(64, 42, 18, 0, Math.PI * 2); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.arc(86, 42, 6, 0, Math.PI * 2); x.fill();
    }
    const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
  }
  const texDrapeaux = {};
  const drapeauTex = type => texDrapeaux[type] || (texDrapeaux[type] = texDrapeau(type));

  /* ---------- Petites constructions ---------- */
  const mats = {};
  const mat = c => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c }));
  function ajout(g, geo, c, x, y, z) { const m = new THREE.Mesh(geo, mat(c)); m.position.set(x, y, z); g.add(m); return m; }
  const boite = (g, w, h, d, x, y, z, c) => ajout(g, new THREE.BoxGeometry(w, h, d), c, x, y + h / 2, z);
  function toit(g, w, h, d, x, y, z, c) { const m = ajout(g, new THREE.ConeGeometry(0.71, h, 4, 1), c, x, y + h / 2, z); m.rotation.y = Math.PI / 4; m.scale.set(w, 1, d); return m; }
  const cylindre = (g, r, h, x, y, z, c, seg) => ajout(g, new THREE.CylinderGeometry(r, r, h, seg || 8), c, x, y + h / 2, z);
  const cone = (g, r, h, x, y, z, c, seg) => ajout(g, new THREE.ConeGeometry(r, h, seg || 8), c, x, y + h / 2, z);
  const dome = (g, r, x, y, z, c) => ajout(g, new THREE.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), c, x, y, z);
  function maison(g, rnd, x, z, y0, murs, toits, plat) {
    const w = 0.03 + rnd() * 0.03, d = 0.03 + rnd() * 0.03, h = 0.025 + rnd() * 0.04;
    const m = boite(g, w, h, d, x, y0, z, murs[Math.floor(rnd() * murs.length)]); m.rotation.y = rnd() * 0.4;
    if (!plat) { const t = toit(g, w * 1.05, 0.02, d * 1.05, x, y0 + h, z, toits[Math.floor(rnd() * toits.length)]); t.rotation.y = Math.PI / 4 + m.rotation.y; }
  }
  function muraille(g, rayon, n, h, y0, c, ouvert) {
    for (let k = 0; k < n; k++) {
      const a0 = k / n * Math.PI * 2, a1 = (k + 1) / n * Math.PI * 2;
      if (ouvert && a0 > ouvert[0] && a0 < ouvert[1]) continue;
      const x0 = Math.cos(a0) * rayon, z0 = Math.sin(a0) * rayon, x1 = Math.cos(a1) * rayon, z1 = Math.sin(a1) * rayon;
      const len = Math.hypot(x1 - x0, z1 - z0);
      const m = boite(g, len, h, 0.012, (x0 + x1) / 2, y0, (z0 + z1) / 2, c); m.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
      cylindre(g, 0.018, h * 1.35, x0, y0, z0, c, 6);
    }
  }
  function mat_(g, x, z, y0, type, h) {
    cylindre(g, 0.004, h || 0.22, x, y0, z, 0x4A3A2C, 5);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 0.079), new THREE.MeshBasicMaterial({ map: drapeauTex(type), side: THREE.DoubleSide, transparent: true, alphaTest: 0.4 }));
    f.position.set(x + 0.062, y0 + (h || 0.22) - 0.045, z); g.add(f); g.userData.drapeau = f; return f;
  }

  const MURS = [0xE7D8BC, 0xDCC7A4, 0xEBDFC8, 0xD9BFA0], TOITS = [0xB55A3C, 0xA84E33, 0xC06A48];
  function socle(g, r, c) { const m = cylindre(g, r, 0.03, 0, -0.022, 0, c || 0xCDBB98, 24); return m; }

  const VILLES = {
    venise(g, rnd) {
      socle(g, 0.3, 0xCBBB98);
      for (let k = 0; k < 34; k++) { const a = rnd() * Math.PI * 2, r = 0.06 + rnd() * 0.2; maison(g, rnd, Math.cos(a) * r, Math.sin(a) * r * 0.8, 0.008, MURS.concat([0xE9C4B0]), TOITS); }
      boite(g, 0.14, 0.05, 0.06, 0.02, 0.008, 0.09, 0xEAD2C4);          // palais des Doges
      boite(g, 0.1, 0.05, 0.08, -0.07, 0.008, 0.02, 0xD8C6A6);          // Saint-Marc
      [[-0.07, 0.02], [-0.07, -0.015], [-0.07, 0.055], [-0.105, 0.02], [-0.035, 0.02]].forEach(([x, z], i) => dome(g, i ? 0.018 : 0.024, x, 0.058, z, 0x8C979C));
      boite(g, 0.024, 0.2, 0.024, -0.005, 0.008, 0.035, 0xB0624A);      // campanile
      toit(g, 0.026, 0.05, 0.026, -0.005, 0.208, 0.035, 0x6E9A86);
      boite(g, 0.16, 0.035, 0.012, 0.19, 0.008, -0.1, 0xC7A57E); boite(g, 0.012, 0.035, 0.12, 0.26, 0.008, -0.05, 0xC7A57E); // Arsenal
      mat_(g, 0.05, 0.14, 0.01, 'venise', 0.26);
    },
    raguse(g, rnd) {
      socle(g, 0.2);
      muraille(g, 0.15, 12, 0.045, 0.008, 0xD8C8A6);
      for (let k = 0; k < 16; k++) { const a = rnd() * Math.PI * 2, r = rnd() * 0.12; maison(g, rnd, Math.cos(a) * r, Math.sin(a) * r, 0.008, MURS, TOITS); }
      cylindre(g, 0.03, 0.1, 0.11, 0.008, -0.08, 0xD2C19C, 10);
      mat_(g, 0.0, 0.0, 0.05, 'venise');
    },
    modon(g, rnd) {
      socle(g, 0.2);
      muraille(g, 0.14, 10, 0.05, 0.008, 0xCDBA93);
      for (let k = 0; k < 10; k++) { const a = rnd() * Math.PI * 2, r = rnd() * 0.1; maison(g, rnd, Math.cos(a) * r, Math.sin(a) * r, 0.008, MURS, TOITS); }
      cylindre(g, 0.035, 0.12, 0.0, 0.008, -0.13, 0xC9B48C, 8); cone(g, 0.04, 0.04, 0.0, 0.128, -0.13, 0x9A5B40, 8);
      mat_(g, 0.03, 0.03, 0.05, 'venise');
    },
    candie(g, rnd) {
      socle(g, 0.26);
      muraille(g, 0.21, 14, 0.05, 0.008, 0xD2BE95);
      for (let k = 0; k < 26; k++) { const a = rnd() * Math.PI * 2, r = rnd() * 0.18; maison(g, rnd, Math.cos(a) * r, Math.sin(a) * r, 0.008, MURS, TOITS); }
      boite(g, 0.05, 0.1, 0.05, -0.05, 0.008, 0.04, 0xE0CFAE); toit(g, 0.05, 0.04, 0.05, -0.05, 0.108, 0.04, 0xA84E33);
      mat_(g, 0.05, -0.02, 0.05, 'venise', 0.26);
    },
    constantinople(g, rnd) {
      socle(g, 0.34, 0xC9B794);
      muraille(g, 0.3, 18, 0.06, 0.008, 0xCBB48E);
      for (let k = 0; k < 44; k++) { const a = rnd() * Math.PI * 2, r = 0.05 + rnd() * 0.24; maison(g, rnd, Math.cos(a) * r, Math.sin(a) * r, 0.008, MURS, TOITS); }
      boite(g, 0.16, 0.07, 0.13, 0.0, 0.008, 0.0, 0xE1C9A3);            // Sainte-Sophie
      dome(g, 0.075, 0.0, 0.078, 0.0, 0x9AA3A6);
      dome(g, 0.045, 0.07, 0.078, 0.0, 0x9AA3A6); dome(g, 0.045, -0.07, 0.078, 0.0, 0x9AA3A6);
      const minarets = new THREE.Group(); minarets.visible = false; g.add(minarets); g.userData.minarets = minarets;
      [[0.1, 0.085], [-0.1, 0.085], [0.1, -0.085], [-0.1, -0.085]].forEach(([x, z]) => { cylindre(minarets, 0.008, 0.2, x, 0.008, z, 0xEDE4D0, 8); cone(minarets, 0.011, 0.04, x, 0.208, z, 0x7B8A90, 8); });
      cylindre(g, 0.012, 0.16, 0.16, 0.008, 0.12, 0xD9CDB5, 8);        // colonne
      mat_(g, 0.09, -0.12, 0.05, 'byzance', 0.28);
    },
    alexandrie(g, rnd) {
      socle(g, 0.3, 0xD8C49A);
      muraille(g, 0.26, 16, 0.05, 0.008, 0xD8C49A);
      for (let k = 0; k < 40; k++) { const a = rnd() * Math.PI * 2, r = 0.04 + rnd() * 0.21; maison(g, rnd, Math.cos(a) * r, Math.sin(a) * r, 0.008, [0xF1EADB, 0xE8DDC6, 0xEFE6D2], TOITS, true); }
      [[0.06, 0.04], [-0.1, -0.06]].forEach(([x, z]) => { cylindre(g, 0.011, 0.19, x, 0.008, z, 0xEEE3CB, 8); cylindre(g, 0.016, 0.01, x, 0.15, z, 0xD9CBAF, 8); cone(g, 0.012, 0.04, x, 0.198, z, 0x8A6A45, 8); });
      dome(g, 0.04, -0.02, 0.05, 0.1, 0xE9DDC4); boite(g, 0.09, 0.042, 0.09, -0.02, 0.008, 0.1, 0xEDE3CF);
      for (let k = 0; k < 6; k++) { const a = rnd() * Math.PI * 2, r = 0.29 + rnd() * 0.05; const x = Math.cos(a) * r, z = Math.sin(a) * r; cylindre(g, 0.004, 0.07, x, 0.0, z, 0x7A5A3A, 5); cone(g, 0.03, 0.02, x, 0.065, z, 0x5E8A3A, 6); }
      boite(g, 0.08, 0.05, 0.06, 0.13, 0.008, -0.1, 0xE2D2B4); // fondouk
      mat_(g, 0.13, -0.1, 0.058, 'mamelouk');
    },
    famagouste(g, rnd) {
      socle(g, 0.24);
      muraille(g, 0.2, 14, 0.055, 0.008, 0xD5C29C);
      for (let k = 0; k < 22; k++) { const a = rnd() * Math.PI * 2, r = rnd() * 0.17; maison(g, rnd, Math.cos(a) * r, Math.sin(a) * r, 0.008, MURS, TOITS); }
      boite(g, 0.12, 0.07, 0.05, 0.0, 0.008, 0.0, 0xE3D3B1); toit(g, 0.12, 0.035, 0.05, 0.0, 0.078, 0.0, 0x8B6B55);
      boite(g, 0.025, 0.12, 0.025, -0.06, 0.008, 0.03, 0xE3D3B1); boite(g, 0.025, 0.12, 0.025, -0.06, 0.008, -0.03, 0xE3D3B1);
      mat_(g, 0.07, 0.05, 0.05, 'chypre');
    },
    petite(g, rnd, type) {
      socle(g, 0.14);
      for (let k = 0; k < 9; k++) { const a = rnd() * Math.PI * 2, r = rnd() * 0.1; maison(g, rnd, Math.cos(a) * r, Math.sin(a) * r, 0.008, MURS, TOITS); }
      cylindre(g, 0.02, 0.09, 0.05, 0.008, 0.03, 0xD5C29C, 8);
      mat_(g, 0.0, 0.0, 0.05, type);
    }
  };

  /* ---------- La galère ---------- */
  function texVoile(type) {
    const c = canvas(128, 128), x = c.getContext('2d');
    x.fillStyle = '#F2E8D2'; x.fillRect(0, 0, 128, 128);
    x.fillStyle = 'rgba(120,90,50,0.12)'; for (let k = 0; k < 128; k += 16) x.fillRect(k, 0, 2, 128);
    if (type === 'genes') { x.fillStyle = '#C8231E'; x.fillRect(74, 0, 18, 128); x.fillRect(0, 70, 128, 18); }
    else { x.fillStyle = '#A3201C'; x.fillRect(0, 96, 128, 14); x.fillStyle = '#E3B341'; x.beginPath(); x.arc(92, 40, 16, 0, Math.PI * 2); x.fill(); x.fillStyle = '#A3201C'; x.beginPath(); x.arc(92, 42, 8, 0, Math.PI * 2); x.fill(); }
    return new THREE.CanvasTexture(c);
  }
  function creerGalere(type) {
    const g = new THREE.Group();
    const forme = (s) => {
      const f = new THREE.Shape();
      f.moveTo(0, -0.5 * s); f.quadraticCurveTo(0.09 * s, -0.49 * s, 0.1 * s, -0.38 * s); f.lineTo(0.1 * s, 0.3 * s);
      f.quadraticCurveTo(0.09 * s, 0.45 * s, 0, 0.52 * s); f.quadraticCurveTo(-0.09 * s, 0.45 * s, -0.1 * s, 0.3 * s);
      f.lineTo(-0.1 * s, -0.38 * s); f.quadraticCurveTo(-0.09 * s, -0.49 * s, 0, -0.5 * s); return f;
    };
    const coque = new THREE.ExtrudeGeometry(forme(1), { depth: 0.07, bevelEnabled: false, curveSegments: 8 }); coque.rotateX(Math.PI / 2);
    ajout(g, coque, type === 'genes' ? 0x3E3A36 : 0x5B3A24, 0, 0.035, 0);
    const bande = new THREE.ExtrudeGeometry(forme(1.02), { depth: 0.016, bevelEnabled: false, curveSegments: 8 }); bande.rotateX(Math.PI / 2);
    ajout(g, bande, type === 'genes' ? 0xEDE6D8 : 0xA3201C, 0, 0.04, 0);
    const pont = new THREE.ExtrudeGeometry(forme(0.9), { depth: 0.005, bevelEnabled: false, curveSegments: 8 }); pont.rotateX(Math.PI / 2);
    ajout(g, pont, 0xB88F5C, 0, 0.042, 0);
    const eperon = ajout(g, new THREE.ConeGeometry(0.014, 0.15, 6), 0x4A3020, 0, 0.012, 0.58); eperon.rotation.x = Math.PI / 2;
    boite(g, 0.17, 0.06, 0.15, 0, 0.04, -0.38, type === 'genes' ? 0xEDE6D8 : 0x8E1B1B);
    cylindre(g, 0.008, 0.46, 0, 0.04, 0.12, 0x4A3020, 6);
    const A = new THREE.Vector3(0, 0.14, 0.5), B = new THREE.Vector3(0, 0.64, -0.26);
    const vergue = ajout(g, new THREE.CylinderGeometry(0.005, 0.005, A.distanceTo(B), 5), 0x4A3020, 0, 0, 0);
    vergue.position.copy(A).add(B).multiplyScalar(0.5);
    vergue.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), B.clone().sub(A).normalize());
    const C = new THREE.Vector3(0.0, 0.08, -0.16);
    const vg = new THREE.BufferGeometry();
    const mid = A.clone().add(B).multiplyScalar(0.5).lerp(C, 0.4); mid.x = 0.07;
    vg.setAttribute('position', new THREE.Float32BufferAttribute([A.x, A.y, A.z, B.x, B.y, B.z, mid.x, mid.y, mid.z, B.x, B.y, B.z, C.x, C.y, C.z, mid.x, mid.y, mid.z, C.x, C.y, C.z, A.x, A.y, A.z, mid.x, mid.y, mid.z], 3));
    vg.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 1, 0.6, 0.5, 1, 1, 1, 0, 0.6, 0.5, 1, 0, 0, 0, 0.6, 0.5], 2));
    vg.computeVertexNormals();
    const voile = new THREE.Mesh(vg, new THREE.MeshLambertMaterial({ map: texVoile(type), side: THREE.DoubleSide }));
    voile.position.x = 0.012; g.add(voile);
    const rames = [];
    for (const cote of [-1, 1]) for (let k = 0; k < 11; k++) {
      const pivot = new THREE.Object3D(); pivot.position.set(cote * 0.1, 0.045, -0.26 + k * 0.05); g.add(pivot);
      const r = ajout(pivot, new THREE.BoxGeometry(0.26, 0.005, 0.007), 0xC9A574, cote * 0.12, -0.035, 0); r.rotation.z = cote * 0.3;
      pivot.userData.cote = cote; rames.push(pivot);
    }
    if (type !== 'genes') mat_(g, 0, -0.44, 0.08, 'venise', 0.16);
    const ombre = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20), new THREE.MeshBasicMaterial({ color: 0x0B2A35, transparent: true, opacity: 0.22, depthWrite: false }));
    ombre.rotation.x = -Math.PI / 2; ombre.scale.set(0.3, 1.25, 1); ombre.position.y = -0.028; g.add(ombre);
    g.userData.rames = rames;
    return g;
  }

  /* ---------- Eau animée ---------- */
  function creerEau(merMasque) {
    const tex = new THREE.CanvasTexture(merMasque);
    const m = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uMasque: { value: tex }, uTemps: { value: 0 }, uCam: { value: new THREE.Vector3() } },
      vertexShader: 'varying vec2 vUv; varying vec3 vPos; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vPos = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: [
        'uniform sampler2D uMasque; uniform float uTemps; uniform vec3 uCam; varying vec2 vUv; varying vec3 vPos;',
        'float vague(vec2 p){ return sin(p.x*5.0+p.y*1.7+uTemps*0.9)*0.5 + sin(p.y*6.5-p.x*2.1-uTemps*0.8)*0.45 + sin((p.x*0.8+p.y)*13.0+uTemps*1.5)*0.18; }',
        'void main(){',
        '  float m = texture2D(uMasque, vUv).r; if (m < 0.03) discard;',
        '  vec2 p = vPos.xz; float e = 0.02; float h0 = vague(p);',
        '  vec3 n = normalize(vec3(-(vague(p+vec2(e,0.0))-h0)/e*0.018, 1.0, -(vague(p+vec2(0.0,e))-h0)/e*0.018));',
        '  vec3 v = normalize(uCam - vPos); vec3 l = normalize(vec3(-0.45, 0.8, -0.4));',
        '  float spec = pow(max(dot(n, normalize(l+v)), 0.0), 120.0); float fres = pow(1.0 - max(dot(n, v), 0.0), 3.0);',
        '  vec3 col = mix(vec3(0.13,0.42,0.52), vec3(0.8,0.9,0.93), fres*0.7);',
        '  gl_FragColor = vec4(col + spec*0.35, m*(0.18 + fres*0.28 + spec*0.25));',
        '}'
      ].join('\n')
    });
    const eau = new THREE.Mesh(new THREE.PlaneGeometry(MW, MH, 1, 1), m);
    eau.rotation.x = -Math.PI / 2; eau.position.y = 0.006; eau.renderOrder = 2;
    return eau;
  }

  /* ---------- Carte3D ---------- */
  const C3 = {};
  let renderer, scene, camera, conteneur, couche, terrainMat, texCarte, fonds, relief, eau, galere, horloge;
  const villes = {}, cibles = [], etiquettes = [], tubes = {}, sillage = [];
  let voyage = null, surClicPort = null, effets = {}, territoiresActifs = {};
  const cam = { cible: new THREE.Vector3(0, 0, 0), rayon: 24, phi: 0.72, theta: 0, but: { cible: new THREE.Vector3(0, 0, 0), rayon: 24, phi: 0.72, theta: 0 }, suivre: false, dec: { x: 0, y: 0 }, decBut: { x: 0, y: 0 } };
  const vise = new THREE.Vector3();

  function hauteur(x, z) {
    const fx = (x - XMIN) / MW * GX, fz = (z - ZMIN) / MH * GZ;
    const ix = Math.max(0, Math.min(GX - 1, Math.floor(fx))), iz = Math.max(0, Math.min(GZ - 1, Math.floor(fz)));
    const tx = Math.min(1, Math.max(0, fx - ix)), tz = Math.min(1, Math.max(0, fz - iz)), n = GX + 1, H = relief.H;
    const a = H[iz * n + ix], b = H[iz * n + ix + 1], c = H[(iz + 1) * n + ix], d = H[(iz + 1) * n + ix + 1];
    return (a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz;
  }

  function peindreCarte() {
    const c = texCarte.image, x = c.getContext('2d');
    x.globalCompositeOperation = 'source-over';
    x.drawImage(fonds.fond, 0, 0);
    const t = canvas(TW, TH), tc = t.getContext('2d');
    tc.fillStyle = 'rgba(170,32,28,0.42)';
    for (const k in territoiresActifs) if (territoiresActifs[k]) { polygoneTex(tc, TERRITOIRES[k], TW, TH); tc.fill(); }
    tc.globalCompositeOperation = 'destination-in'; tc.drawImage(fonds.masque, 0, 0);
    x.drawImage(t, 0, 0);
    x.strokeStyle = 'rgba(70,55,38,0.7)'; x.lineWidth = 1.5; x.lineJoin = 'round'; traitCote(x, TW, TH);
    texCarte.needsUpdate = true;
  }

  function construireTerrain() {
    relief = calculerRelief();
    fonds = construireFonds(relief);
    const geo = new THREE.PlaneGeometry(MW, MH, GX, GZ); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) pos.setY(i, relief.H[i]);
    geo.computeVertexNormals();
    texCarte = new THREE.CanvasTexture(canvas(TW, TH));
    texCarte.anisotropy = renderer.capabilities.getMaxAnisotropy();
    territoiresActifs = { dalmatie: true, modon: true, crete: true };
    peindreCarte();
    terrainMat = new THREE.MeshLambertMaterial({ map: texCarte });
    scene.add(new THREE.Mesh(geo, terrainMat));
    // bords de la maquette
    const bas = -0.75, jupe = [], cols = [];
    const n = GX + 1, bord = [];
    for (let ix = 0; ix <= GX; ix++) bord.push(ix);
    for (let iz = 1; iz <= GZ; iz++) bord.push(iz * n + GX);
    for (let ix = GX - 1; ix >= 0; ix--) bord.push(GZ * n + ix);
    for (let iz = GZ - 1; iz >= 0; iz--) bord.push(iz * n);
    for (let k = 0; k < bord.length - 1; k++) {
      const a = bord[k], b = bord[k + 1];
      const ax = pos.getX(a), az = pos.getZ(a), bx = pos.getX(b), bz = pos.getZ(b);
      const ay = Math.max(relief.H[a], 0.006), by = Math.max(relief.H[b], 0.006);
      jupe.push(ax, ay, az, ax, bas, az, bx, by, bz, bx, by, bz, ax, bas, az, bx, bas, bz);
      const mer = relief.H[a] < 0.006;
      const ch = mer ? [0.30, 0.55, 0.62] : [0.55, 0.43, 0.3], cb = [0.36, 0.27, 0.19];
      cols.push(...ch, ...cb, ...ch, ...ch, ...cb, ...cb);
    }
    const jg = new THREE.BufferGeometry();
    jg.setAttribute('position', new THREE.Float32BufferAttribute(jupe, 3));
    jg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    scene.add(new THREE.Mesh(jg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide })));
    const plateau = new THREE.Mesh(new THREE.BoxGeometry(MW + 1.4, 0.35, MH + 1.4), new THREE.MeshLambertMaterial({ color: 0x6B4A31 }));
    plateau.position.y = bas - 0.17; scene.add(plateau);
    const liseré = new THREE.Mesh(new THREE.BoxGeometry(MW + 1.6, 0.06, MH + 1.6), new THREE.MeshLambertMaterial({ color: 0xB8892B }));
    liseré.position.y = bas - 0.37; scene.add(liseré);
    eau = creerEau(fonds.merMasque); scene.add(eau);
  }

  function ancre(id) {
    for (const k in ROUTES) { const [a, b] = k.split('-'); if (a === id) return ROUTES[k][0]; if (b === id) return ROUTES[k][ROUTES[k].length - 1]; }
    const p = PORTS[id]; return proj(p.lon, p.lat);
  }
  C3.ancre = id => { const a = ancre(id); return new THREE.Vector3(a[0], 0, a[1]); };

  function courbeRoute(de, vers) {
    let pts = ROUTES[de + '-' + vers];
    if (!pts) { pts = ROUTES[vers + '-' + de]; if (!pts) return null; pts = pts.slice().reverse(); }
    return new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], 0.02, p[1])), false, 'centripetal');
  }
  C3.courbeRoute = courbeRoute;
  C3.longueurRoute = (de, vers) => { const c = courbeRoute(de, vers); return c ? c.getLength() : 0; };
  C3.voisins = id => Object.keys(ROUTES).map(k => k.split('-')).filter(([a, b]) => a === id || b === id).map(([a, b]) => a === id ? b : a);

  function construireRoutes() {
    const matN = new THREE.MeshBasicMaterial({ color: 0xFFF3D6, transparent: true, opacity: 0.45, depthWrite: false });
    for (const k in ROUTES) {
      const [a, b] = k.split('-'); const c = courbeRoute(a, b);
      const geo = new THREE.TubeGeometry(c, Math.ceil(c.getLength() * 30), 0.009, 5, false);
      const m = new THREE.Mesh(geo, matN); m.renderOrder = 3; scene.add(m);
      const geoF = new THREE.TubeGeometry(c, Math.ceil(c.getLength() * 30), 0.02, 6, false);
      const mf = new THREE.Mesh(geoF, new THREE.MeshBasicMaterial({ color: 0xE8B53C, transparent: true, opacity: 0.9, depthWrite: false })); mf.visible = false; mf.renderOrder = 4; scene.add(mf);
      const mv = new THREE.Mesh(new THREE.TubeGeometry(c, Math.ceil(c.getLength() * 30), 0.014, 6, false), new THREE.MeshBasicMaterial({ color: 0xA3201C, transparent: true, opacity: 0.85, depthWrite: false })); mv.visible = false; mv.renderOrder = 4; scene.add(mv);
      const me = new THREE.Mesh(new THREE.TubeGeometry(c, Math.ceil(c.getLength() * 20), 0.055, 6, false), new THREE.MeshBasicMaterial({ color: 0xA3201C })); me.visible = false; scene.add(me);
      tubes[k] = { normal: m, fort: mf, fait: mv, epais: me };
    }
  }
  const cleRoute = (a, b) => ROUTES[a + '-' + b] ? a + '-' + b : b + '-' + a;
  C3.surlignerRoutes = (depuis, liste) => { for (const k in tubes) tubes[k].fort.visible = false; (liste || []).forEach(v => { const t = tubes[cleRoute(depuis, v)]; if (t) t.fort.visible = true; }); };
  C3.itineraire = legs => { for (const k in tubes) tubes[k].fait.visible = false; (legs || []).forEach(([a, b]) => { const t = tubes[cleRoute(a, b)]; if (t) t.fait.visible = true; }); };

  function placerVille(id, def, graine) {
    let [x, z] = proj(def.lon, def.lat);
    if (PORTS[id]) {
      // la galère mouille à l'ancre : on écarte un peu la ville pour qu'elles ne se chevauchent pas
      const a = ancre(id); let dx = x - a[0], dz = z - a[1], d = Math.hypot(dx, dz);
      if (d < 0.55) { if (d < 1e-3) { dx = 0; dz = -1; d = 1; } x = a[0] + dx / d * 0.55; z = a[1] + dz / d * 0.55; }
    }
    const g = new THREE.Group(); const rnd = alea(graine);
    (VILLES[def.ville] || VILLES.petite)(g, rnd, def.drapeau);
    g.position.set(x, Math.max(hauteur(x, z), 0.012), z);
    const s = def.ville === 'petite' ? 0.9 : 1.1; g.scale.setScalar(s);
    scene.add(g); return g;
  }

  function creerEtiquette(texte, x, y, z, classe, portId) {
    const el = document.createElement(portId ? 'button' : 'div');
    el.className = 'etiq ' + classe; el.innerHTML = texte;
    if (portId) { el.type = 'button'; el.dataset.port = portId; el.addEventListener('click', e => { e.stopPropagation(); if (surClicPort) surClicPort(portId); }); }
    couche.appendChild(el);
    const e = { el, pos: new THREE.Vector3(x, y, z), classe, portId };
    etiquettes.push(e); return e;
  }

  function construireVilles() {
    let graine = 11;
    for (const id in PORTS) {
      const p = PORTS[id]; const g = placerVille(id, p, graine += 7);
      villes[id] = g;
      const hit = new THREE.Mesh(new THREE.SphereGeometry(0.4, 8, 6), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.copy(g.position); hit.userData.port = id; scene.add(hit); cibles.push(hit);
      const e = creerEtiquette('<span class="nom">' + p.nom + '</span><span class="statut">' + p.statut + '</span>', g.position.x, g.position.y + 0.42, g.position.z, 'port', id);
      e.statutEl = e.el.querySelector('.statut');
    }
    for (const l of AUTRES_LIEUX) {
      const [x, z] = proj(l.lon, l.lat);
      if (!l.sansVille) villes['autre-' + l.nom] = placerVille(l.nom, l, graine += 5);
      creerEtiquette(l.nom + ' <em>' + l.note + '</em>', x, Math.max(hauteur(x, z), 0) + (l.sansVille ? 0.18 : 0.32), z, 'lieu' + (l.drapeau === 'genes' ? ' genois' : ''));
    }
    for (const r of REGIONS) { const [x, z] = proj(r.lon, r.lat); creerEtiquette(r.nom, x, Math.max(hauteur(x, z), 0) + 0.1, z, 'region ' + r.style); }
  }

  C3.etatPorts = etats => {
    for (const e of etiquettes) if (e.portId) {
      const s = etats[e.portId] || {};
      e.el.classList.toggle('accessible', !!s.accessible);
      e.el.classList.toggle('visite', !!s.visite);
      e.el.classList.toggle('actuel', !!s.actuel);
      e.el.classList.toggle('bloque', !!s.bloque);
    }
  };
  C3.statutPort = (id, texte) => { for (const e of etiquettes) if (e.portId === id && e.statutEl) e.statutEl.textContent = texte; };

  /* ---------- Caméra ---------- */
  function limiterCible(v) { v.x = Math.max(XMIN + 1, Math.min(XMAX - 1, v.x)); v.z = Math.max(ZMIN + 1, Math.min(ZMAX - 1, v.z)); }
  C3.vue = (type, opts) => {
    opts = opts || {};
    cam.suivre = false;
    if (type === 'ensemble') { cam.but.cible.set(1.2, 0, -0.3); cam.but.rayon = window.innerWidth < 760 ? 30 : 23; cam.but.phi = 0.68; }
    else if (type === 'port') { const a = villes[opts.port].position; cam.but.cible.set(a.x, 0, a.z + 0.2); cam.but.rayon = opts.rayon || 3.4; cam.but.phi = 0.95; }
    else if (type === 'lieu') { const [x, z] = proj(opts.lon, opts.lat); cam.but.cible.set(x, 0, z); cam.but.rayon = opts.rayon || 6; cam.but.phi = 0.85; }
    else if (type === 'suivre') { cam.suivre = true; cam.but.rayon = opts.rayon || 5.5; cam.but.phi = 0.9; }
    if (opts.immediat) { cam.cible.copy(cam.but.cible); cam.rayon = cam.but.rayon; cam.phi = cam.but.phi; cam.theta = cam.but.theta; }
  };
  function majCamera(dt) {
    if (cam.suivre && galere) { cam.but.cible.set(galere.position.x, 0, galere.position.z); }
    limiterCible(cam.but.cible);
    const k = 1 - Math.exp(-dt * 3.2);
    cam.cible.lerp(cam.but.cible, k); cam.rayon += (cam.but.rayon - cam.rayon) * k; cam.phi += (cam.but.phi - cam.phi) * k; cam.theta += (cam.but.theta - cam.theta) * k;
    cam.dec.x += (cam.decBut.x - cam.dec.x) * k; cam.dec.y += (cam.decBut.y - cam.dec.y) * k;
    // décalage : garde le lieu visé dans la partie de l'écran que le panneau ne cache pas
    const ct = Math.cos(cam.theta), st = Math.sin(cam.theta), ox = cam.dec.x * cam.rayon, oy = cam.dec.y * cam.rayon;
    vise.set(cam.cible.x + ct * ox + st * oy, 0, cam.cible.z - st * ox + ct * oy);
    const s = Math.sin(cam.phi);
    camera.position.set(vise.x + cam.rayon * s * Math.sin(cam.theta), cam.rayon * Math.cos(cam.phi), vise.z + cam.rayon * s * Math.cos(cam.theta));
    camera.lookAt(vise);
  }
  function brancherControles(el) {
    const ptrs = new Map(); let dep = null, bouge = 0, pinch = null;
    el.addEventListener('contextmenu', e => e.preventDefault());
    el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); dep = { x: e.clientX, y: e.clientY, bouton: e.button, shift: e.shiftKey }; bouge = 0; pinch = null; });
    el.addEventListener('pointermove', e => {
      if (!ptrs.has(e.pointerId)) return;
      const p = ptrs.get(e.pointerId), dx = e.clientX - p.x, dy = e.clientY - p.y;
      p.x = e.clientX; p.y = e.clientY; bouge += Math.abs(dx) + Math.abs(dy);
      if (ptrs.size === 2) {
        const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
        if (pinch) { cam.but.rayon = Math.max(1.6, Math.min(34, cam.but.rayon * pinch.d / d)); deplacer((m.x - pinch.m.x) / 2, (m.y - pinch.m.y) / 2); }
        pinch = { d, m }; return;
      }
      if (dep && (dep.bouton === 2 || dep.shift)) deplacer(dx, dy);
      else { cam.but.theta -= dx * 0.005; cam.but.phi = Math.max(0.22, Math.min(1.3, cam.but.phi - dy * 0.004)); }
    });
    const fin = e => {
      if (ptrs.has(e.pointerId) && bouge < 6 && ptrs.size === 1) cliquer(e);
      ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch = null;
    };
    el.addEventListener('pointerup', fin); el.addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); pinch = null; });
    el.addEventListener('wheel', e => { e.preventDefault(); cam.but.rayon = Math.max(1.6, Math.min(34, cam.but.rayon * Math.exp(e.deltaY * 0.0012))); }, { passive: false });
  }
  function deplacer(dx, dy) {
    cam.suivre = false;
    const f = cam.rayon * 0.0016, c = Math.cos(cam.theta), s = Math.sin(cam.theta);
    cam.but.cible.x -= (dx * c + dy * s) * f; cam.but.cible.z -= (-dx * s + dy * c) * f;
  }
  const ray = new THREE.Raycaster(), souris = new THREE.Vector2();
  function cliquer(e) {
    const r = renderer.domElement.getBoundingClientRect();
    souris.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(souris, camera);
    const h = ray.intersectObjects(cibles)[0];
    if (h && surClicPort) surClicPort(h.object.userData.port);
  }

  /* ---------- Navigation de la galère ---------- */
  C3.placerGalere = (id, cap) => {
    const a = ancre(id); galere.position.set(a[0], 0.02, a[1]);
    if (cap !== undefined) galere.rotation.y = cap;
    else { const v = villes[id].position; galere.rotation.y = Math.atan2(a[0] - v.x, a[1] - v.z); }
  };
  C3.naviguer = (de, vers, opts) => {
    const courbe = courbeRoute(de, vers); const L = courbe.getLength();
    voyage = { courbe, L, t: 0, pause: false, milieuFait: !opts.auMilieu, opts };
    cam.but.theta = cam.theta;
    C3.vue('suivre');
    return voyage;
  };
  C3.pause = v => { if (voyage) voyage.pause = v; };
  C3.decalage = (x, y) => { cam.decBut.x = x; cam.decBut.y = y; };
  const tmpV = new THREE.Vector3();
  function majVoyage(dt, temps) {
    const rames = galere.userData.rames;
    const enMouvement = voyage && !voyage.pause;
    rames.forEach((p, i) => { const ph = temps * (enMouvement ? 5 : 1.2) + i * 0.02; p.rotation.y = p.userData.cote * Math.sin(ph) * (enMouvement ? 0.35 : 0.06); p.rotation.x = Math.cos(ph) * (enMouvement ? 0.08 : 0.02); });
    galere.position.y = 0.02 + Math.sin(temps * 1.7) * 0.006; galere.rotation.z = Math.sin(temps * 1.3) * 0.03;
    if (!voyage) return;
    const v = voyage;
    if (!v.pause) {
      const vitesse = (v.opts.vitesse || 1.5);
      v.t = Math.min(1, v.t + vitesse * dt / v.L);
      if (!v.milieuFait && v.t >= 0.5) { v.milieuFait = true; v.pause = true; v.opts.auMilieu(); }
      if (v.opts.progres) v.opts.progres(v.t);
    }
    const p = v.courbe.getPointAt(v.t); galere.position.x = p.x; galere.position.z = p.z;
    v.courbe.getTangentAt(Math.min(0.999, v.t), tmpV);
    const cap = Math.atan2(tmpV.x, tmpV.z); let d = cap - galere.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d));
    galere.rotation.y += d * Math.min(1, dt * 5);
    if (!v.pause) emettreSillage(dt);
    if (v.t >= 1) { const fin = v.opts.arrivee; voyage = null; if (fin) fin(); }
  }
  let accSillage = 0, texRond = null;
  function emettreSillage(dt) {
    accSillage += dt; if (accSillage < 0.07) return; accSillage = 0;
    let s = sillage.find(o => !o.visible);
    if (!s) {
      if (sillage.length > 40) return;
      if (!texRond) {
        const c = canvas(64, 64), x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 4, 32, 32, 30);
        g.addColorStop(0, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
        texRond = new THREE.CanvasTexture(c);
      }
      s = new THREE.Mesh(new THREE.PlaneGeometry(0.2, 0.2), new THREE.MeshBasicMaterial({ map: texRond, transparent: true, depthWrite: false }));
      s.rotation.x = -Math.PI / 2; s.renderOrder = 5; scene.add(s); sillage.push(s);
    }
    const arr = new THREE.Vector3(0, 0, -0.5 * galere.scale.x).applyAxisAngle(new THREE.Vector3(0, 1, 0), galere.rotation.y);
    s.position.set(galere.position.x + arr.x, 0.015, galere.position.z + arr.z); s.userData.age = 0; s.visible = true;
  }
  function majSillage(dt) { for (const s of sillage) if (s.visible) { s.userData.age += dt; const a = s.userData.age; s.scale.setScalar(0.6 + a * 1.6); s.material.opacity = Math.max(0, 0.55 - a * 0.3); if (a > 1.8) s.visible = false; } }

  /* ---------- Effets de la chronique ---------- */
  let genois = null;
  C3.galeresGenoises = (visible, lon, lat) => {
    if (!genois) {
      genois = new THREE.Group();
      for (let k = 0; k < 3; k++) { const g = creerGalere('genes'); g.scale.setScalar(0.34); g.position.set(k * 0.28 - 0.28, 0.02, (k % 2) * 0.22); g.rotation.y = -2.4; genois.add(g); }
      scene.add(genois);
    }
    genois.visible = visible;
    if (visible) { const [x, z] = proj(lon, lat); genois.position.set(x, 0, z); }
  };
  function changerDrapeau(id, type) { const d = villes[id] && villes[id].userData.drapeau; if (d) { d.material.map = drapeauTex(type); d.material.needsUpdate = true; } }
  C3.effet = (nom, actif) => {
    effets[nom] = actif;
    if (nom === 'chioggia') C3.galeresGenoises(actif, 12.36, 45.18);
    if (nom === 'terreFerme') { territoiresActifs.terreferme = actif; peindreCarte(); }
    if (nom === 'chypre') { territoiresActifs.chypre = actif; peindreCarte(); changerDrapeau('famagouste', actif ? 'venise' : 'chypre'); C3.statutPort('famagouste', actif ? 'Chypre vénitienne (1489)' : PORTS.famagouste.statut); }
    if (nom === 'ottomansConstantinople') { villes.constantinople.userData.minarets.visible = actif; changerDrapeau('constantinople', actif ? 'ottoman' : 'byzance'); C3.statutPort('constantinople', actif ? 'Empire ottoman (1453)' : PORTS.constantinople.statut); }
    if (nom === 'ottomansModon') { territoiresActifs.modon = !actif; peindreCarte(); changerDrapeau('modon', actif ? 'ottoman' : 'venise'); C3.statutPort('modon', actif ? 'Ottomane (1500)' : PORTS.modon.statut); }
  };
  C3.reinitialiserEffets = () => { for (const k in effets) if (effets[k]) C3.effet(k, false); };

  /* ---------- Étiquettes HTML ---------- */
  const vProj = new THREE.Vector3();
  function majEtiquettes() {
    const w = conteneur.clientWidth, h = conteneur.clientHeight, loin = cam.rayon > 13, tresPres = cam.rayon < 5;
    couche.classList.toggle('loin', loin); couche.classList.toggle('pres', tresPres);
    for (const e of etiquettes) {
      vProj.copy(e.pos).project(camera);
      const visible = vProj.z < 1 && Math.abs(vProj.x) < 1.15 && Math.abs(vProj.y) < 1.15;
      if (!visible) { if (e.vu !== false) { e.el.style.display = 'none'; e.vu = false; } continue; }
      if (e.vu !== true) { e.el.style.display = ''; e.vu = true; }
      e.el.style.transform = 'translate(-50%,-100%) translate(' + ((vProj.x + 1) / 2 * w).toFixed(1) + 'px,' + ((1 - vProj.y) / 2 * h).toFixed(1) + 'px)';
    }
  }

  /* ---------- Initialisation ---------- */
  C3.init = (el, options) => {
    conteneur = el; surClicPort = options.surClicPort;
    renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0xE4DAC4);
    el.appendChild(renderer.domElement);
    couche = document.createElement('div'); couche.className = 'couche-etiquettes'; el.appendChild(couche);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, el.clientWidth / el.clientHeight, 0.05, 200);
    scene.add(new THREE.HemisphereLight(0xFFF4E0, 0x4E4436, 0.62));
    const soleil = new THREE.DirectionalLight(0xFFF8EE, 0.62); soleil.position.set(-9, 12, -7); scene.add(soleil);
    const sol = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshLambertMaterial({ color: 0xCFC2A4 }));
    sol.rotation.x = -Math.PI / 2; sol.position.y = -1.3; scene.add(sol);
    construireTerrain();
    construireRoutes();
    construireVilles();
    galere = creerGalere('venise'); galere.scale.setScalar(0.42); scene.add(galere);
    C3.placerGalere('venise');
    brancherControles(renderer.domElement);
    C3.vue('ensemble', { immediat: true });
    horloge = new THREE.Clock();
    window.addEventListener('resize', () => { renderer.setSize(el.clientWidth, el.clientHeight); camera.aspect = el.clientWidth / el.clientHeight; camera.updateProjectionMatrix(); });
    const boucle = () => {
      const dt = Math.min(0.1, horloge.getDelta()), t = horloge.elapsedTime;
      eau.material.uniforms.uTemps.value = t; eau.material.uniforms.uCam.value.copy(camera.position);
      majVoyage(dt, t); majSillage(dt); majCamera(dt);
      for (const k in tubes) if (tubes[k].fort.visible) tubes[k].fort.material.opacity = 0.6 + Math.sin(t * 3) * 0.3;
      for (const id in villes) { const d = villes[id].userData.drapeau; if (d) d.rotation.y = Math.sin(t * 1.6 + id.length) * 0.25; }
      renderer.render(scene, camera);
      majEtiquettes();
      requestAnimationFrame(boucle);
    };
    boucle();
  };
  C3.capture = () => {
    const ancien = { cible: cam.cible.clone(), rayon: cam.rayon, phi: cam.phi, theta: cam.theta };
    const dec = { x: cam.dec.x, y: cam.dec.y }; cam.dec.x = cam.dec.y = 0;
    cam.cible.set(1.4, 0, 0.9); cam.rayon = 22.5; cam.phi = 0.55; cam.theta = 0;
    majCamera(0);
    // itinéraire bien visible sur l'image, et noms des ports dessinés par-dessus
    for (const k in tubes) { tubes[k].epais.visible = tubes[k].fait.visible; tubes[k].fait.visible = false; }
    const galVis = galere.visible; galere.visible = false;
    // rendu à taille fixe (paysage), quel que soit l'écran de l'élève
    const taille = renderer.getSize(new THREE.Vector2()), ratio = renderer.getPixelRatio(), aspect = camera.aspect;
    renderer.setPixelRatio(1); renderer.setSize(1600, 1000, false); camera.aspect = 1.6; camera.updateProjectionMatrix();
    renderer.render(scene, camera);
    const src = renderer.domElement, img = canvas(src.width, src.height), x = img.getContext('2d');
    x.drawImage(src, 0, 0);
    const k = 1.6;
    x.font = '600 ' + Math.round(15 * k) + 'px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    for (const id in PORTS) {
      vProj.copy(villes[id].position); vProj.y += 0.35; vProj.project(camera);
      const X = (vProj.x + 1) / 2 * src.width, Y = (1 - vProj.y) / 2 * src.height, w = x.measureText(PORTS[id].nom).width + 14 * k, hh = 22 * k;
      x.fillStyle = 'rgba(255,255,255,0.92)'; x.strokeStyle = 'rgba(31,78,95,0.5)'; x.lineWidth = k;
      x.beginPath(); x.rect(X - w / 2, Y - hh / 2, w, hh); x.fill(); x.stroke();
      x.fillStyle = '#1F4E5F'; x.fillText(PORTS[id].nom, X, Y + k);
    }
    const url = img.toDataURL('image/jpeg', 0.86);
    for (const k2 in tubes) { tubes[k2].fait.visible = tubes[k2].epais.visible; tubes[k2].epais.visible = false; }
    galere.visible = galVis;
    renderer.setPixelRatio(ratio); renderer.setSize(taille.x, taille.y, false); camera.aspect = aspect; camera.updateProjectionMatrix();
    Object.assign(cam, { rayon: ancien.rayon, phi: ancien.phi, theta: ancien.theta }); cam.cible.copy(ancien.cible); cam.dec.x = dec.x; cam.dec.y = dec.y;
    return url;
  };
  C3.proj = proj;

  window.Carte3D = C3;
})();
