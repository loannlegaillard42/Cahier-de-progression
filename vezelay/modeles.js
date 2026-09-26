/* Vézelay, 31 mars 1146 — bibliothèque de modèles 3D (Three.js r150, script classique).
   Textures dessinées au canevas, matériaux « au mètre », personnages articulés avec visage peint,
   foule, chevaux, arbres de printemps, touffes d'herbe. Rien n'est téléchargé : tout est fabriqué au chargement. */
(function () {
  'use strict';
  THREE.ColorManagement.enabled = true; // couleurs données en sRGB, éclairage calculé en linéaire
  const M = {}, TAU = Math.PI * 2, PI = Math.PI;
  function alea(graine) { let a = graine >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const toile = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d', { willReadFrequently: true }); return c; };
  M.alea = alea; M.toile = toile;

  /* ---------- Géométrie ---------- */
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), HAUT = new THREE.Vector3(0, 1, 0);
  // place(g, position, rotation, échelle) : applique la transformation à la géométrie
  function place(g, x, y, z, rx, ry, rz, sx, sy, sz) {
    sx = sx === undefined ? 1 : sx; sy = sy === undefined ? sx : sy; sz = sz === undefined ? sx : sz;
    _e.set(rx || 0, ry || 0, rz || 0); _q.setFromEuler(_e);
    return g.applyMatrix4(_m.compose(_p.set(x || 0, y || 0, z || 0), _q, _s.set(sx, sy, sz)));
  }
  // fusion de géométries en une seule (indexée), pour limiter le nombre d'objets à dessiner
  function fusionner(geos) {
    let nv = 0, ni = 0;
    const avecUV = geos.every(g => g.attributes.uv), avecCol = geos.some(g => g.attributes.color);
    geos.forEach(g => { nv += g.attributes.position.count; ni += g.index ? g.index.count : g.attributes.position.count; });
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = avecUV ? new Float32Array(nv * 2) : null, co = avecCol ? new Float32Array(nv * 3).fill(1) : null;
    const idx = nv > 65535 ? new Uint32Array(ni) : new Uint16Array(ni);
    let ov = 0, oi = 0;
    geos.forEach(g => {
      const n = g.attributes.position.count;
      if (!g.attributes.normal) g.computeVertexNormals();
      pos.set(g.attributes.position.array.subarray(0, n * 3), ov * 3);
      nor.set(g.attributes.normal.array.subarray(0, n * 3), ov * 3);
      if (uv) uv.set(g.attributes.uv.array.subarray(0, n * 2), ov * 2);
      if (co && g.attributes.color) co.set(g.attributes.color.array.subarray(0, n * 3), ov * 3);
      if (g.index) { const a = g.index.array; for (let k = 0; k < a.length; k++) idx[oi + k] = a[k] + ov; oi += a.length; }
      else { for (let k = 0; k < n; k++) idx[oi + k] = ov + k; oi += n; }
      ov += n;
    });
    const r = new THREE.BufferGeometry();
    r.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    r.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    if (uv) r.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    if (co) r.setAttribute('color', new THREE.BufferAttribute(co, 3));
    r.setIndex(new THREE.BufferAttribute(idx, 1));
    r.computeBoundingSphere();
    return r;
  }
  // cylindre d'un point à un autre (branches, sangles, bâtons)
  function segment(a, b, r1, r2, seg) {
    const d = new THREE.Vector3().subVectors(b, a), L = d.length();
    const g = new THREE.CylinderGeometry(r2, r1, L, seg || 6, 1, true).translate(0, L / 2, 0);
    g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(HAUT, d.normalize()));
    return g.translate(a.x, a.y, a.z);
  }
  // étoffe tournée autour de l'axe vertical, avec des plis qui s'accentuent vers le bas
  function drape(profil, seg, plis, ech, phiStart, phiLen) {
    const g = new THREE.LatheGeometry(profil.map(p => new THREE.Vector2(p[0], p[1])), seg, phiStart === undefined ? PI : phiStart, phiLen || TAU);
    const P = g.attributes.position;
    for (let i = 0; i < P.count; i++) {
      let x = P.getX(i), y = P.getY(i), z = P.getZ(i);
      if (plis) {
        const a = Math.atan2(x, z), t = Math.min(1, Math.max(0, (plis.haut - y) / (plis.haut - plis.bas)));
        const k = 1 + plis.amp * t * (Math.sin(a * plis.n + (plis.ph || 0)) * 0.7 + Math.sin(a * (plis.n * 2 + 1) + 1.3 + (plis.ph || 0)) * 0.3);
        x *= k; z *= k;
        if (plis.ourlet && t > 0.98) y += plis.ourlet * Math.sin(a * 3 + (plis.ph || 0));
      }
      if (ech) { x *= ech[0]; z *= ech[1]; }
      P.setXYZ(i, x, y, z);
    }
    g.computeVertexNormals();
    return g;
  }
  const anneau = (r, tube, y, ex, ez, seg) => new THREE.TorusGeometry(r, tube, 5, seg || 24).rotateX(PI / 2).scale(ex || 1, 1, ez || 1).translate(0, y, 0);
  function prisme(larg, haut, long) {
    const f = new THREE.Shape(); f.moveTo(-larg / 2, 0); f.lineTo(larg / 2, 0); f.lineTo(0, haut); f.lineTo(-larg / 2, 0);
    return new THREE.ExtrudeGeometry(f, { depth: long, bevelEnabled: false }).translate(0, 0, -long / 2);
  }
  M.place = place; M.fusionner = fusionner; M.segment = segment; M.drape = drape; M.anneau = anneau; M.prisme = prisme;

  /* ---------- Textures dessinées ---------- */
  const TX = {};
  M.TX = TX;
  function texRepetee(c, srgb, rx, ry) {
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
    if (srgb) t.encoding = THREE.sRGBEncoding;
    if (rx) t.repeat.set(rx, ry || rx);
    return t;
  }
  M.texRepetee = texRepetee;
  // moyenne de la texture en lumière linéaire : sert à ne pas assombrir la couleur de base
  function gainDe(c) {
    const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let s = 0, n = 0;
    for (let i = 0; i < d.length; i += 36) { s += Math.pow((d[i] + d[i + 1] + d[i + 2]) / 765, 2.2); n++; }
    return n / s;
  }
  function grain(x, W, H, force, rnd) {
    const img = x.getImageData(0, 0, W, H), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const k = 1 - force * rnd(); d[i] *= k; d[i + 1] *= k; d[i + 2] *= k; }
    x.putImageData(img, 0, 0);
  }
  // dessine une forme et ses copies de l'autre côté des bords (texture sans raccord)
  function enroule(W, H, px, py, r, fn) { for (const dx of [0, -W, W]) for (const dy of [0, -H, H]) if (px + dx > -r && px + dx < W + r && py + dy > -r && py + dy < H + r) fn(px + dx, py + dy); }
  function bruitPeriodique(taille, n, rnd) {
    const g = new Float32Array(n * n); for (let i = 0; i < g.length; i++) g[i] = rnd();
    const at = (i, j) => g[((j % n + n) % n) * n + ((i % n + n) % n)];
    return (x, y) => {
      const fx = x / taille * n, fy = y / taille * n, i = Math.floor(fx), j = Math.floor(fy), u = fx - i, v = fy - j;
      const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v), a = at(i, j), b = at(i + 1, j), c = at(i, j + 1), d = at(i + 1, j + 1);
      return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
    };
  }
  function fbmPeriodique(taille, rnd, oct, base) {
    const cs = []; for (let o = 0; o < oct; o++) cs.push(bruitPeriodique(taille, (base || 4) << o, rnd));
    return (x, y) => { let s = 0, a = 0.5, t = 0; for (const f of cs) { s += a * f(x, y); t += a; a *= 0.5; } return s / t; };
  }
  M.fbmPeriodique = fbmPeriodique;

  function texPierre() { // pierre de taille en assises régulières
    const W = 512, c = toile(W, W), x = c.getContext('2d'), rnd = alea(401);
    x.fillStyle = 'rgb(168,162,150)'; x.fillRect(0, 0, W, W);
    let y = 0; const rangs = [];
    while (y < W) { let h = 34 + Math.floor(rnd() * 4) * 6; if (W - y - h < 30) h = W - y; rangs.push([y, h]); y += h; }
    for (const [y0, h] of rangs) {
      let px = -rnd() * 100;
      while (px < W) {
        const w = Math.min(70 + rnd() * 120, W - px + 60), l = 200 + rnd() * 48, t = rnd();
        const coul = `rgb(${l | 0},${(l * (0.965 + 0.035 * t)) | 0},${(l * (0.91 + 0.07 * t)) | 0})`;
        const dessine = bx => {
          x.fillStyle = coul; x.fillRect(bx + 1.5, y0 + 1.5, w - 3, h - 3);
          const gr = x.createLinearGradient(0, y0, 0, y0 + h); gr.addColorStop(0, 'rgba(255,255,255,0.10)'); gr.addColorStop(0.25, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(60,45,30,0.13)');
          x.fillStyle = gr; x.fillRect(bx + 1.5, y0 + 1.5, w - 3, h - 3);
        };
        dessine(px); if (px + w > W) dessine(px - W); if (px < 0) dessine(px + W);
        px += w;
      }
    }
    for (let k = 0; k < 260; k++) { // taches, lichens, coulures
      const px = rnd() * W, py = rnd() * W, r = 2 + rnd() * 9;
      x.fillStyle = rnd() < 0.5 ? 'rgba(90,80,60,0.10)' : 'rgba(255,250,235,0.10)';
      enroule(W, W, px, py, r, (a, b) => { x.beginPath(); x.ellipse(a, b, r, r * (0.5 + rnd()), 0, 0, TAU); x.fill(); });
    }
    grain(x, W, W, 0.12, rnd);
    return c;
  }
  function texMoellon() { // moellons irréguliers liés au mortier de chaux
    const W = 512, c = toile(W, W), x = c.getContext('2d'), rnd = alea(402);
    x.fillStyle = 'rgb(206,198,184)'; x.fillRect(0, 0, W, W);
    for (let j = 0; j < 13; j++) {
      const hy = W / 13; let px = rnd() * 20;
      while (px < W) {
        const w = 22 + rnd() * 34, cy = j * hy + hy / 2 + (rnd() - 0.5) * 6, cx = px + w / 2, l = 168 + rnd() * 70;
        const pts = []; const nb = 7; for (let k = 0; k < nb; k++) { const a = k / nb * TAU; pts.push([Math.cos(a) * (w / 2 - 2) * (0.8 + rnd() * 0.25), Math.sin(a) * (hy / 2 - 2.5) * (0.75 + rnd() * 0.3)]); }
        enroule(W, W, cx, cy, 40, (a, b) => {
          x.fillStyle = `rgb(${l | 0},${(l * 0.97) | 0},${(l * 0.91) | 0})`; x.beginPath(); pts.forEach(([u, v], k) => k ? x.lineTo(a + u, b + v) : x.moveTo(a + u, b + v)); x.closePath(); x.fill();
          x.fillStyle = 'rgba(70,55,40,0.12)'; x.beginPath(); x.ellipse(a, b + hy * 0.18, w * 0.38, hy * 0.18, 0, 0, TAU); x.fill();
        });
        px += w + 2 + rnd() * 3;
      }
    }
    grain(x, W, W, 0.14, rnd);
    return c;
  }
  function texTuiles() { // petites tuiles plates de Bourgogne
    const W = 256, c = toile(W, W), x = c.getContext('2d'), rnd = alea(403);
    x.fillStyle = 'rgb(70,58,50)'; x.fillRect(0, 0, W, W);
    const h = 16;
    for (let j = 0; j < W / h; j++) {
      let px = (j % 2) * 9 - 9;
      while (px < W + 20) {
        const w = 15 + rnd() * 6, l = 165 + rnd() * 75, m = rnd() < 0.08;
        const coul = m ? `rgb(${(l * 0.8) | 0},${(l * 0.85) | 0},${(l * 0.62) | 0})` : `rgb(${l | 0},${(l * 0.93) | 0},${(l * 0.86) | 0})`;
        const d = bx => {
          x.fillStyle = coul; x.beginPath(); x.moveTo(bx + 1, j * h); x.lineTo(bx + w - 1, j * h); x.lineTo(bx + w - 1, j * h + h - 4);
          x.quadraticCurveTo(bx + w / 2, j * h + h + 1, bx + 1, j * h + h - 4); x.closePath(); x.fill();
          x.fillStyle = 'rgba(0,0,0,0.18)'; x.fillRect(bx + 1, j * h, w - 2, 3);
        };
        d(px); if (px + w > W) d(px - W); if (px < 0) d(px + W);
        px += w;
      }
    }
    grain(x, W, W, 0.1, rnd);
    return c;
  }
  function texBois() { // planches
    const W = 256, c = toile(W, W), x = c.getContext('2d'), rnd = alea(404);
    x.fillStyle = 'rgb(60,45,32)'; x.fillRect(0, 0, W, W);
    for (let j = 0; j < 8; j++) {
      const y0 = j * 32, l = 175 + rnd() * 50;
      x.fillStyle = `rgb(${l | 0},${(l * 0.9) | 0},${(l * 0.78) | 0})`; x.fillRect(0, y0 + 1, W, 30);
      x.strokeStyle = 'rgba(70,45,25,0.22)'; x.lineWidth = 1;
      for (let k = 0; k < 7; k++) { const yy = y0 + 4 + rnd() * 24, f = 0.01 + rnd() * 0.03, ph = rnd() * 6; x.beginPath(); for (let px = 0; px <= W; px += 8) x.lineTo(px, yy + Math.sin(px * f + ph) * 2.5); x.stroke(); }
      const jointe = rnd() * W; x.fillStyle = 'rgba(40,28,18,0.7)'; x.fillRect(jointe, y0 + 1, 2, 30);
    }
    grain(x, W, W, 0.1, rnd);
    return c;
  }
  function texSol() { // détail du sol : herbe rase, mottes, cailloux
    const W = 256, c = toile(W, W), x = c.getContext('2d'), rnd = alea(405), f = fbmPeriodique(W, rnd, 4, 4), img = x.createImageData(W, W);
    for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) {
      const v = f(i, j), l = 170 + 85 * v + (rnd() - 0.5) * 34, o = (j * W + i) * 4;
      img.data[o] = l; img.data[o + 1] = l * 0.99; img.data[o + 2] = l * 0.93; img.data[o + 3] = 255;
    }
    x.putImageData(img, 0, 0);
    for (let k = 0; k < 500; k++) { const px = rnd() * W, py = rnd() * W; x.fillStyle = rnd() < 0.6 ? 'rgba(40,50,20,0.25)' : 'rgba(255,255,230,0.25)'; x.fillRect(px, py, 1 + rnd() * 2, 1 + rnd() * 2); }
    return c;
  }
  function texTissu() { // trame de laine et de lin
    const W = 128, c = toile(W, W), x = c.getContext('2d'), rnd = alea(406);
    const f = fbmPeriodique(W, rnd, 3, 2), img = x.createImageData(W, W);
    for (let j = 0; j < W; j++) for (let i = 0; i < W; i++) { const l = 205 + 45 * f(i, j) + (((i + j) & 1) ? 6 : -6), o = (j * W + i) * 4; img.data[o] = img.data[o + 1] = img.data[o + 2] = l; img.data[o + 3] = 255; }
    x.putImageData(img, 0, 0);
    grain(x, W, W, 0.05, rnd);
    return c;
  }
  function texMailles() { // cotte de mailles
    const W = 64, c = toile(W, W), x = c.getContext('2d');
    x.fillStyle = 'rgb(55,55,58)'; x.fillRect(0, 0, W, W);
    x.lineWidth = 1.7;
    for (let j = 0; j < 10; j++) for (let i = 0; i < 9; i++) {
      const cx = i * 8 + (j % 2) * 4, cy = j * 6.4;
      enroule(W, W, cx, cy, 5, (a, b) => { x.strokeStyle = 'rgb(215,217,222)'; x.beginPath(); x.ellipse(a, b, 3.6, 3.1, 0, PI * 1.1, PI * 2.9); x.stroke(); });
    }
    return c;
  }
  function texFeuillage() { // bouquets de feuilles : taches claires et sombres
    const W = 128, c = toile(W, W), x = c.getContext('2d'), rnd = alea(407);
    x.fillStyle = 'rgb(200,200,200)'; x.fillRect(0, 0, W, W);
    for (let k = 0; k < 900; k++) {
      const px = rnd() * W, py = rnd() * W, r = 1.2 + rnd() * 3, l = rnd() < 0.5 ? 120 + rnd() * 60 : 225 + rnd() * 30;
      enroule(W, W, px, py, r, (a, b) => { x.fillStyle = `rgb(${l | 0},${l | 0},${l | 0})`; x.beginPath(); x.ellipse(a, b, r, r * 0.6, rnd() * 3, 0, TAU); x.fill(); });
    }
    return c;
  }
  function texTouffe(fleurs) { // brins d'herbe (transparence) ; variante avec pâquerettes et primevères
    const W = 128, H = 64, c = toile(W, H), x = c.getContext('2d'), rnd = alea(fleurs ? 409 : 408);
    x.lineCap = 'round';
    for (let k = 0; k < 70; k++) {
      const bx = 4 + rnd() * (W - 8), h = 20 + rnd() * 42, pen = (rnd() - 0.5) * 22, l = rnd();
      x.strokeStyle = `rgb(${(130 + l * 50) | 0},${(160 + l * 40) | 0},${(70 + l * 30) | 0})`;
      x.lineWidth = 1.6 + rnd() * 1.6;
      x.beginPath(); x.moveTo(bx, H); x.quadraticCurveTo(bx + pen * 0.3, H - h * 0.6, bx + pen, H - h); x.stroke();
    }
    if (fleurs) for (let k = 0; k < 7; k++) {
      const fx = 10 + rnd() * (W - 20), fy = 14 + rnd() * 26, jaune = rnd() < 0.45;
      x.strokeStyle = 'rgb(110,140,60)'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(fx, H); x.lineTo(fx, fy); x.stroke();
      x.fillStyle = jaune ? 'rgb(246,222,110)' : 'rgb(250,248,240)';
      for (let p = 0; p < 6; p++) { const a = p / 6 * TAU; x.beginPath(); x.ellipse(fx + Math.cos(a) * 2.6, fy + Math.sin(a) * 2.6, 2.2, 1.4, a, 0, TAU); x.fill(); }
      x.fillStyle = jaune ? 'rgb(220,160,40)' : 'rgb(240,200,60)'; x.beginPath(); x.arc(fx, fy, 1.6, 0, TAU); x.fill();
    }
    return c;
  }
  function texCheveux() { // mèches
    const W = 64, c = toile(W, W), x = c.getContext('2d'), rnd = alea(410);
    x.fillStyle = 'rgb(225,225,225)'; x.fillRect(0, 0, W, W);
    for (let k = 0; k < 160; k++) { const px = rnd() * W, l = 150 + rnd() * 105; x.strokeStyle = `rgb(${l | 0},${l | 0},${l | 0})`; x.lineWidth = 1; x.beginPath(); x.moveTo(px, 0); x.lineTo(px + (rnd() - 0.5) * 6, W); x.stroke(); }
    return c;
  }
  M.texEcu = function (motif) { // écu peint : champ, bordure, boucle et rais
    const c = toile(128, 256), x = c.getContext('2d'), [fond, meuble] = (motif || '#8E2F24/#D9A93A').split('/');
    x.fillStyle = fond; x.fillRect(0, 0, 128, 256);
    x.strokeStyle = meuble; x.lineWidth = 7; x.strokeRect(4, 4, 120, 248);
    x.lineWidth = 6; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; x.beginPath(); x.moveTo(64, 104); x.lineTo(64 + Math.cos(a) * 70, 104 + Math.sin(a) * 140); x.stroke(); }
    x.fillStyle = meuble; x.beginPath(); x.arc(64, 104, 13, 0, TAU); x.fill();
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.repeat.set(1 / 0.46, 1 / 0.95); t.offset.set(0.5, 0.505);
    return t;
  };
  M.preparer = function () {
    const pierre = texPierre(), moellon = texMoellon(), tuiles = texTuiles(), sol = texSol();
    TX.pierre = { t: texRepetee(pierre), gain: gainDe(pierre) };
    TX.moellon = { t: texRepetee(moellon), gain: gainDe(moellon) };
    TX.tuiles = { t: texRepetee(tuiles), gain: gainDe(tuiles) };
    TX.sol = { t: texRepetee(sol), gain: gainDe(sol) };
    const bois = texBois(); TX.boisMonde = { t: texRepetee(bois), gain: gainDe(bois) };
    TX.bois = texRepetee(bois, true);
    TX.tissu = texRepetee(texTissu(), true, 2, 2);
    TX.mailles = texRepetee(texMailles(), true, 22, 14);
    TX.feuillage = texRepetee(texFeuillage(), true, 2, 2);
    TX.cheveux = texRepetee(texCheveux(), true, 3, 1);
    TX.touffe = new THREE.CanvasTexture(texTouffe(false)); TX.touffe.encoding = THREE.sRGBEncoding;
    TX.touffeFleurs = new THREE.CanvasTexture(texTouffe(true)); TX.touffeFleurs.encoding = THREE.sRGBEncoding;
  };

  /* ---------- Matériaux ---------- */
  // matériau dont la texture est posée « au mètre », d'après la position dans le monde (murs, toits, sols)
  M.matMonde = function (couleur, tx, metres, opts) {
    opts = opts || {};
    const m = new THREE.MeshLambertMaterial({ color: couleur, side: opts.double ? THREE.DoubleSide : THREE.FrontSide });
    const u = { tMonde: { value: tx.t }, echMonde: { value: metres }, gainMonde: { value: tx.gain }, tourne: { value: opts.tourne ? 1 : 0 } };
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, u);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vPosM;\nvarying vec3 vNorM;')
        .replace('#include <begin_vertex>', ['#include <begin_vertex>', 'vec4 pM = vec4(transformed, 1.0); vec3 nM = objectNormal;',
          '#ifdef USE_INSTANCING', 'pM = instanceMatrix * pM; nM = mat3(instanceMatrix) * nM;', '#endif',
          'vPosM = (modelMatrix * pM).xyz; vNorM = mat3(modelMatrix) * nM;'].join('\n'));
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vPosM;\nvarying vec3 vNorM;\nuniform sampler2D tMonde;\nuniform float echMonde;\nuniform float gainMonde;\nuniform float tourne;')
        .replace('#include <color_fragment>', ['#include <color_fragment>', 'vec3 aM = abs(normalize(vNorM));',
          'vec2 uvM = aM.y > 0.55 ? (tourne > 0.5 ? vPosM.zx : vPosM.xz) : (aM.x > aM.z ? vPosM.zy : vPosM.xy);',
          'diffuseColor.rgb *= pow(texture2D(tMonde, uvM / echMonde).rgb, vec3(2.2)) * gainMonde;'].join('\n'));
    };
    return m;
  };
  const MATS = new Map();
  function matiere(cle) {
    let m = MATS.get(cle); if (m) return m;
    const i = cle.indexOf(':'), type = i < 0 ? cle : cle.slice(0, i), c = i < 0 ? '#ffffff' : cle.slice(i + 1);
    switch (type) {
      case 'tissu': m = new THREE.MeshLambertMaterial({ color: c, map: TX.tissu, side: THREE.DoubleSide }); break;
      case 'cheveux': m = new THREE.MeshLambertMaterial({ color: c, map: TX.cheveux }); break;
      case 'mailles': m = new THREE.MeshPhongMaterial({ color: c, map: TX.mailles, specular: 0x6A6A6A, shininess: 28, side: THREE.DoubleSide }); break;
      case 'metal': m = new THREE.MeshPhongMaterial({ color: c, specular: 0x9A9A9A, shininess: 70 }); break;
      case 'or': m = new THREE.MeshPhongMaterial({ color: c, specular: 0xFFE7A0, shininess: 90 }); break;
      case 'cuir': m = new THREE.MeshLambertMaterial({ color: c, map: TX.tissu }); break;
      case 'bois': m = new THREE.MeshLambertMaterial({ color: c, map: TX.bois }); break;
      case 'ecu': m = new THREE.MeshLambertMaterial({ map: M.texEcu(c) }); break;
      default: m = new THREE.MeshLambertMaterial({ color: c });
    }
    MATS.set(cle, m); return m;
  }
  M.matiere = matiere;
  // regroupe les pièces d'un modèle par matériau, puis les fusionne
  function Kit() { this.lots = new Map(); }
  Kit.prototype.ajout = function (cle, g) { let l = this.lots.get(cle); if (!l) this.lots.set(cle, l = []); l.push(g); return g; };
  Kit.prototype.vers = function (groupe, ombre) {
    this.lots.forEach((geos, cle) => { const m = new THREE.Mesh(fusionner(geos), matiere(cle)); m.castShadow = ombre !== false; m.receiveShadow = true; groupe.add(m); });
    return groupe;
  };
  M.Kit = Kit;

  /* ---------- Visage peint ---------- */
  // La tête est une sphère : le visage est au quart de la largeur de la texture (u = 0,25), les yeux sur l'équateur.
  M.texVisage = function (p) {
    const W = 256, H = 128, c = toile(W, H), x = c.getContext('2d'), cx = 64, rnd = alea(p.graine || 7);
    const femme = p.sexe === 'f', age = p.age || 30;
    x.fillStyle = p.peau; x.fillRect(0, 0, W, H);
    const tache = (px, py, rx, ry, rgb, a) => {
      x.save(); x.translate(px, py); x.scale(1, ry / rx);
      const g = x.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
      x.fillStyle = g; x.fillRect(-rx, -rx, 2 * rx, 2 * rx); x.restore();
    };
    // modelé : front clair, orbites, joues, menton
    tache(cx, 44, 26, 14, '255,240,225', 0.18);
    [-1, 1].forEach(s => {
      tache(cx + s * 16, 62, 11, 8, '90,45,35', p.maigre ? 0.34 : 0.2);
      tache(cx + s * 22, 80, 13, 10, femme ? '215,95,90' : '190,85,70', femme ? 0.3 : 0.2);
      if (p.maigre) tache(cx + s * 21, 88, 9, 9, '80,45,35', 0.28);
      tache(cx + s * 30, 66, 10, 20, '120,70,55', 0.12);
    });
    tache(cx, 104, 16, 8, '120,70,55', 0.14);
    if (!femme && !p.barbe && age > 16) tache(cx, 96, 22, 14, '80,80,90', 0.12);
    // yeux
    [-1, 1].forEach(s => {
      const ex = cx + s * 16, ey = 63;
      x.fillStyle = '#EFE8DE'; x.beginPath(); x.ellipse(ex, ey, 6.3, 2.5, 0, 0, TAU); x.fill();
      x.fillStyle = p.yeux || '#5A3A22'; x.beginPath(); x.arc(ex + s * -0.6, ey + 0.2, 2.5, 0, TAU); x.fill();
      x.fillStyle = '#16100C'; x.beginPath(); x.arc(ex + s * -0.6, ey + 0.2, 1.1, 0, TAU); x.fill();
      x.fillStyle = 'rgba(255,255,255,0.9)'; x.fillRect(ex + s * -0.6 - 1.2, ey - 1.2, 1, 1);
      x.strokeStyle = 'rgba(55,30,22,0.9)'; x.lineWidth = 1.4; x.beginPath(); x.ellipse(ex, ey + 0.6, 6.6, 3.2, 0, PI * 1.08, PI * 1.92); x.stroke();
      x.strokeStyle = 'rgba(110,60,50,0.35)'; x.lineWidth = 0.8; x.beginPath(); x.ellipse(ex, ey - 0.4, 6, 3, 0, PI * 0.15, PI * 0.85); x.stroke();
      // sourcils
      x.strokeStyle = p.sourcils || p.cheveux || '#3A2A20'; x.lineWidth = femme ? 1.6 : 2.4; x.beginPath();
      x.moveTo(ex - s * 7, 57.5); x.quadraticCurveTo(ex + s * 1, 54.5, ex + s * 8, 57); x.stroke();
      if (age > 45) { x.strokeStyle = 'rgba(90,50,40,0.35)'; x.lineWidth = 0.8; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(ex + s * 7, ey + 1 + k * 1.6); x.lineTo(ex + s * 10.5, ey + k * 2.4); x.stroke(); } }
    });
    // nez : arête éclairée, ombre portée, narines
    tache(cx, 70, 3, 8, '255,235,220', 0.2);
    tache(cx, 79, 7, 3.5, '90,45,35', 0.3);
    [-1, 1].forEach(s => { x.fillStyle = 'rgba(70,35,28,0.7)'; x.beginPath(); x.ellipse(cx + s * 3.4, 77, 1.5, 1, 0, 0, TAU); x.fill(); });
    // bouche
    const lev = femme ? '#B85A55' : '#A45A4C';
    x.fillStyle = lev; x.beginPath(); x.moveTo(cx - 12, 87.5); x.quadraticCurveTo(cx - 5, 84.5, cx, 86); x.quadraticCurveTo(cx + 5, 84.5, cx + 12, 87.5); x.quadraticCurveTo(cx, 88.5, cx - 12, 87.5); x.fill();
    x.fillStyle = femme ? '#C97468' : '#B26E5E'; x.beginPath(); x.moveTo(cx - 11, 87.8); x.quadraticCurveTo(cx, 93, cx + 11, 87.8); x.quadraticCurveTo(cx, 89, cx - 11, 87.8); x.fill();
    x.strokeStyle = 'rgba(60,25,20,0.6)'; x.lineWidth = 1; x.beginPath(); x.moveTo(cx - 12, 87.6); x.quadraticCurveTo(cx, 89.2, cx + 12, 87.6); x.stroke();
    if (age > 40 || p.maigre) { x.strokeStyle = 'rgba(90,50,40,0.3)'; x.lineWidth = 1.1; [-1, 1].forEach(s => { x.beginPath(); x.moveTo(cx + s * 7, 76); x.quadraticCurveTo(cx + s * 14, 84, cx + s * 14, 92); x.stroke(); }); }
    if (age > 50) { x.strokeStyle = 'rgba(90,50,40,0.22)'; x.lineWidth = 0.9; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(cx - 14, 44 + k * 3.5); x.quadraticCurveTo(cx, 42 + k * 3.5, cx + 14, 44 + k * 3.5); x.stroke(); } }
    grain(x, W, H, 0.05, rnd);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 4;
    return t;
  };

  /* ---------- Personnage détaillé ----------
     Pieds à y = 0, face vers +z. « D » = main droite du personnage (côté −x), « G » = main gauche (côté +x).
     p : peau, cheveux, barbe, yeux, sexe, age, maigre, tunique, longueur (courte, mi, longue, traine), manches (etroites, larges, pendantes),
         chausses, chaussures, ceinture, manteau, bordure, coiffe (nu, tonsure, capuche, couronne, voile, reine, casque, bonnet, chapeau, pointu),
         coiffeCol, capuchonDos, pelerine, cotte, croix, acc (baton, besace, epee, ecu, tablette), pose (mains, epee, tablette, baton). */
  let nVisages = 0;
  const C0 = 0.078; // centre du crâne au-dessus du pivot de la tête
  function crane(r, segs) { // sphère déformée : mâchoire plus étroite, menton, crâne
    const g = new THREE.SphereGeometry(r, segs || 28, Math.round((segs || 28) * 0.72)), P = g.attributes.position;
    for (let i = 0; i < P.count; i++) {
      let x = P.getX(i), y = P.getY(i), z = P.getZ(i); const ny = y / r;
      if (ny < 0) x *= 1 - 0.22 * ny * ny;
      if (ny < -0.25 && z > 0) z *= 1 + 0.1 * (-ny - 0.25);
      if (ny > 0.2 && z < 0) z *= 1.04;
      P.setXYZ(i, x * 0.8, y * 1.1 + C0, z * 0.97);
    }
    g.computeVertexNormals();
    return g;
  }
  // morceau de sphère autour du crâne (cheveux, capuche, voile) ; le visage est vers +z (phi = π/2)
  function calotte(r, phi0, dphi, th0, dth, seg) {
    const g = new THREE.SphereGeometry(r, seg || 22, 12, phi0, dphi, th0, dth), P = g.attributes.position;
    for (let i = 0; i < P.count; i++) {
      let x = P.getX(i), y = P.getY(i), z = P.getZ(i); const ny = y / r;
      if (ny < 0) x *= 1 - 0.22 * ny * ny;
      if (ny < -0.25 && z > 0) z *= 1 + 0.1 * (-ny - 0.25);
      if (ny > 0.2 && z < 0) z *= 1.04;
      P.setXYZ(i, x * 0.8, y * 1.1 + C0, z * 0.97);
    }
    g.computeVertexNormals();
    return g;
  }
  M.personne = function (p) {
    const g = new THREE.Group(), kc = new Kit(), kt = new Kit();
    const femme = p.sexe === 'f', mg = p.maigre ? 0.9 : 1, T = 'tissu:' + p.tunique, PEAU = 'peau:' + p.peau;
    const CORPS = p.cotte ? 'mailles:#8E9297' : T, lg = p.longueur || 'courte';
    const yb = { courte: 0.52, mi: 0.3, longue: 0.07, traine: 0.0 }[lg], rO = { courte: 0.25, mi: 0.27, longue: 0.3, traine: 0.37 }[lg];
    const ph = (p.graine || 1) * 0.7;
    // pieds et jambes
    [-1, 1].forEach(s => kc.ajout('cuir:' + (p.chaussures || '#3A2A1E'), place(new THREE.SphereGeometry(0.052, 10, 6, 0, TAU, 0, PI / 2), s * 0.085, 0, 0.04, 0, 0, 0, 0.85, 0.95, 2.1)));
    if (yb > 0.2) [-1, 1].forEach(s => kc.ajout('tissu:' + (p.chausses || '#5A4A3A'), place(new THREE.CylinderGeometry(0.063 * mg, 0.044, 0.86, 10), s * 0.088, 0.47, 0)));
    // jupe de la tunique (ou de la robe, ou du haubert)
    const pj = []; for (let k = 0; k <= 7; k++) { const t = k / 7, y = yb + (0.93 - yb) * t, e = 1 - Math.pow(1 - t, 1.8); pj.push([rO + (0.19 * mg - rO) * e, y]); }
    pj.push([0.163 * mg, 1.0]);
    const plisJ = { n: femme ? 11 : 9, amp: lg === 'courte' ? 0.07 : 0.1, haut: 0.95, bas: yb, ourlet: 0.012, ph };
    kc.ajout(CORPS, drape(pj, 22, plisJ, [1.08, 0.9]));
    if (p.bordure && !p.cotte) kc.ajout('or:' + p.bordure, drape([[rO * 1.015, yb - 0.003], [(rO + (0.19 * mg - rO) * 0.14) * 1.015, yb + 0.07]], 22, plisJ, [1.08, 0.9]));
    if (p.cotte) kc.ajout(T, drape(pj.slice(0, 3).map(([r, y]) => [r * 0.97, y - 0.06]), 20, plisJ, [1.08, 0.9])); // tunique sous le haubert
    // torse, épaules, cou
    const tr = femme ? [[0.15, 1.0], [0.132, 1.07], [0.152, 1.18], [0.165, 1.26], [0.16, 1.34], [0.15, 1.41], [0.115, 1.47], [0.065, 1.505]]
      : [[0.163, 1.0], [0.16, 1.08], [0.172, 1.18], [0.182, 1.27], [0.182, 1.35], [0.17, 1.42], [0.13, 1.475], [0.07, 1.505]];
    kc.ajout(CORPS, drape(tr.map(([r, y]) => [r * mg, y]), 22, { n: 5, amp: 0.018, haut: 1.45, bas: 1.0 }, [1.14, 0.8]));
    [-1, 1].forEach(s => kc.ajout(CORPS, place(new THREE.SphereGeometry(0.064 * mg, 12, 8), s * 0.17 * mg, 1.425, 0, 0, 0, 0, 1, 0.75, 0.9)));
    kc.ajout(PEAU, place(new THREE.CylinderGeometry(0.056, 0.062, 0.1, 12), 0, 1.52, 0.004, 0, 0, 0, 1, 1, 0.92));
    if (p.bordure) kc.ajout('or:' + p.bordure, anneau(0.075, 0.009, 1.497, 1.1, 1.0, 20));
    if (p.ceinture) {
      kc.ajout('cuir:' + p.ceinture, anneau(0.166 * mg, p.corde ? 0.009 : 0.013, 1.0, 1.13, 0.9, 28));
      kc.ajout('cuir:' + p.ceinture, place(new THREE.BoxGeometry(0.022, p.corde ? 0.4 : 0.22, 0.008), 0.05, p.corde ? 0.8 : 0.89, 0.152 * mg));
    }
    // manteau agrafé sur l'épaule droite
    if (p.manteau) {
      const bas = p.manteauCourt ? 0.62 : Math.max(0.14, yb + 0.07), pm = [];
      for (let k = 0; k <= 8; k++) { const t = k / 8, y = bas + (1.42 - bas) * t; pm.push([0.37 - 0.14 * Math.pow(t, 1.3), y]); }
      pm.push([0.16, 1.49]); pm.push([0.1, 1.53]);
      kc.ajout('tissu:' + p.manteau, drape(pm, 26, { n: 7, amp: 0.07, haut: 1.3, bas, ph: ph + 1 }, [1.12, 0.92], PI - 1.85, 3.7));
      kc.ajout('or:#C9A13A', place(new THREE.SphereGeometry(0.022, 10, 8), -0.13, 1.44, 0.115, 0, 0, 0, 1, 1, 0.5));
    }
    if (p.capuchonDos) { // capuchon rabattu dans le dos (moines)
      kc.ajout('tissu:' + p.capuchonDos, place(new THREE.SphereGeometry(0.13, 14, 10, 0, TAU, 0, PI * 0.75), 0, 1.33, -0.14, 0.25, 0, 0, 1.0, 1.1, 0.35));
      kc.ajout('tissu:' + p.capuchonDos, anneau(0.1, 0.036, 1.49, 1.12, 1.0, 18));
    }
    if (p.pelerine) kc.ajout('tissu:' + p.coiffeCol, drape([[0.27, 1.22], [0.255, 1.3], [0.205, 1.4], [0.13, 1.48], [0.085, 1.56]], 22, { n: 8, amp: 0.05, haut: 1.4, bas: 1.22, ph }, [1.12, 0.95]));
    if (p.croix) {
      const zc = 0.153 + (p.pelerine ? 0.06 : 0);
      kc.ajout('tissu:#B3261E', place(new THREE.BoxGeometry(0.02, 0.12, 0.006), -0.1, 1.31, zc, -0.08));
      kc.ajout('tissu:#B3261E', place(new THREE.BoxGeometry(0.085, 0.02, 0.006), -0.1, 1.33, zc, -0.08));
    }
    // bras : épaule → coude → main
    const bras = s => {
      const ep = new THREE.Group(); ep.position.set(s * 0.19 * mg, 1.42, 0); g.add(ep);
      const kh = new Kit(), MANCHE = p.cotte ? 'mailles:#8E9297' : T;
      kh.ajout(MANCHE, place(new THREE.CylinderGeometry(0.058 * mg, 0.047 * mg, 0.3, 10), 0, -0.15, 0));
      kh.vers(ep);
      const co = new THREE.Group(); co.position.y = -0.29; ep.add(co);
      const kb = new Kit();
      if (p.manches === 'larges') kb.ajout(T, new THREE.CylinderGeometry(0.052, 0.12, 0.28, 14, 1, true).translate(0, -0.13, 0));
      else if (p.manches === 'pendantes') {
        kb.ajout(T, new THREE.CylinderGeometry(0.046, 0.04, 0.24, 10).translate(0, -0.12, 0));
        kb.ajout(T, drape([[0.14, -0.78], [0.12, -0.55], [0.08, -0.34], [0.05, -0.22]], 12, { n: 4, amp: 0.1, haut: -0.3, bas: -0.78 }, [0.75, 1.0]).translate(0, 0, -0.04));
      } else kb.ajout(MANCHE, new THREE.CylinderGeometry(0.046 * mg, 0.036, 0.26, 10).translate(0, -0.13, 0));
      if (p.bordure && p.manches !== 'larges') kb.ajout('or:' + p.bordure, anneau(0.04, 0.008, -0.245, 1, 1, 14));
      kb.ajout(PEAU, place(new THREE.SphereGeometry(0.038, 10, 8), 0, -0.305, 0.004, 0, 0, 0, 0.48, 1.45, 1.0));
      kb.ajout(PEAU, place(new THREE.SphereGeometry(0.014, 6, 5), -s * 0.012, -0.285, 0.028, 0, 0, 0, 1, 1.8, 1));
      kb.vers(co);
      const main = new THREE.Object3D(); main.position.set(0, -0.31, 0.01); co.add(main);
      return { ep, co, main };
    };
    const G = bras(1), D = bras(-1);
    // poses de repos
    const pose = { G: { x: 0, y: 0, z: 0.06, c: -0.18 }, D: { x: 0, y: 0, z: -0.06, c: -0.18 } };
    const P = p.pose || (p.acc && p.acc.includes('baton') ? 'baton' : p.acc && p.acc.includes('tablette') ? 'tablette' : p.acc && p.acc.includes('epee') ? 'epee' : null);
    if (P === 'mains') { pose.G = { x: -0.12, y: -0.6, z: 0.02, c: -1.3 }; pose.D = { x: -0.12, y: 0.6, z: -0.02, c: -1.3 }; }
    if (P === 'baton') pose.D = { x: -0.32, y: 0, z: -0.1, c: -0.62 };
    if (P === 'tablette') { pose.G = { x: -0.25, y: 0.35, z: 0.05, c: -1.3 }; pose.D = { x: -0.2, y: -0.45, z: -0.05, c: -1.05 }; }
    if (P === 'epee') pose.G = { x: 0.05, y: 0.25, z: 0.18, c: -0.75 };
    const appliquer = (b, q) => { b.ep.rotation.set(q.x, q.y, q.z); b.co.rotation.set(q.c, 0, 0); };
    appliquer(G, pose.G); appliquer(D, pose.D);
    g.updateMatrixWorld(true);
    const mainD = new THREE.Vector3(), mainG = new THREE.Vector3(); D.main.getWorldPosition(mainD); G.main.getWorldPosition(mainG);
    // accessoires
    const acc = p.acc || [];
    if (acc.includes('baton')) {
      kc.ajout('bois:#6A4A2A', segment(new THREE.Vector3(mainD.x, 0, mainD.z + 0.02), new THREE.Vector3(mainD.x, 1.78, mainD.z + 0.02), 0.019, 0.016, 7));
      kc.ajout('bois:#5A3A20', place(new THREE.SphereGeometry(0.03, 8, 6), mainD.x, 1.79, mainD.z + 0.02));
    }
    if (acc.includes('besace')) {
      kc.ajout('cuir:#6B4A2E', place(new THREE.BoxGeometry(0.15, 0.17, 0.05), 0.2 * mg, 0.9, 0.07, 0, 0.5, 0));
      kc.ajout('cuir:#6B4A2E', segment(new THREE.Vector3(-0.15, 1.45, 0.02), new THREE.Vector3(0, 1.24, 0.16), 0.008, 0.008, 4));
      kc.ajout('cuir:#6B4A2E', segment(new THREE.Vector3(0, 1.24, 0.16), new THREE.Vector3(0.19, 0.98, 0.1), 0.008, 0.008, 4));
    }
    if (acc.includes('epee')) {
      const ax = new THREE.Vector3(-0.06, Math.cos(0.3), Math.sin(0.3)).normalize(), bas = new THREE.Vector3(0.29, 0.27, -0.1), haut = bas.clone().addScaledVector(ax, 0.8);
      kc.ajout('cuir:#2E2218', segment(bas, haut, 0.024, 0.02, 6));
      const garde = haut.clone().addScaledVector(ax, 0.02);
      kc.ajout('metal:#A8ACB2', place(new THREE.BoxGeometry(0.17, 0.02, 0.026), garde.x, garde.y, garde.z, -0.3));
      kc.ajout('cuir:#3A2A1E', segment(garde, garde.clone().addScaledVector(ax, 0.1), 0.013, 0.013, 6));
      const pom = garde.clone().addScaledVector(ax, 0.12); kc.ajout('metal:#A8ACB2', place(new THREE.SphereGeometry(0.022, 8, 6), pom.x, pom.y, pom.z));
      kc.ajout('cuir:#3A2A1E', anneau(0.175, 0.012, 0.9, 1.12, 0.9, 24).rotateZ(-0.08));
    }
    if (acc.includes('ecu')) { // écu en amande porté dans le dos
      const f = new THREE.Shape(); f.moveTo(-0.23, 0.3); f.quadraticCurveTo(-0.23, 0.47, 0, 0.47); f.quadraticCurveTo(0.23, 0.47, 0.23, 0.3); f.quadraticCurveTo(0.2, -0.1, 0, -0.48); f.quadraticCurveTo(-0.2, -0.1, -0.23, 0.3);
      const e = new THREE.ExtrudeGeometry(f, { depth: 0.018, bevelEnabled: false, curveSegments: 10 }), P2 = e.attributes.position;
      for (let i = 0; i < P2.count; i++) P2.setZ(i, P2.getZ(i) - P2.getX(i) * P2.getX(i) * 0.9);
      e.computeVertexNormals();
      kc.ajout('ecu:' + (p.ecu || '#2F4F8E/#D9A93A'), place(e, 0.03, 1.02, -0.24, 0.08, PI, 0.2));
    }
    if (acc.includes('tablette')) {
      const t = place(new THREE.BoxGeometry(0.15, 0.2, 0.014), 0, -0.33, 0.03, 0.5, 0, 0); const kk = new Kit(); kk.ajout('bois:#8A6A40', t); kk.vers(G.co);
      const st = new Kit(); st.ajout('bois:#4A3A2A', place(new THREE.CylinderGeometry(0.004, 0.003, 0.13, 5), 0, -0.3, 0.03, 0.9)); st.vers(D.co);
    }
    // tête
    const tete = new THREE.Group(); tete.position.set(0, 1.556, 0.012); g.add(tete);
    const cleV = 'visage:' + (++nVisages);
    MATS.set(cleV, new THREE.MeshLambertMaterial({ map: M.texVisage(p) }));
    kt.ajout(cleV, crane(0.1));
    kt.ajout(PEAU, place(new THREE.SphereGeometry(0.017, 10, 8), 0, C0 - 0.017, 0.086, -0.35, 0, 0, 0.6, 1.4, 0.9));
    kt.ajout(PEAU, place(new THREE.SphereGeometry(0.0115, 8, 6), 0, C0 - 0.032, 0.097, 0, 0, 0, 1.3, 0.8, 1.0));
    [-1, 1].forEach(s => kt.ajout(PEAU, place(new THREE.SphereGeometry(0.024, 8, 6), s * 0.078, C0 - 0.004, -0.008, 0, s * 0.3, 0, 0.35, 1, 0.7)));
    const CH = 'cheveux:' + (p.cheveux || '#4A3424'), CF = 'tissu:' + (p.coiffeCol || '#6A5A48'), coiffe = p.coiffe || 'nu';
    const chevelure = () => { kt.ajout(CH, calotte(0.105, 0, TAU, 0, 0.3 * PI)); kt.ajout(CH, calotte(0.104, PI / 2 + 0.95, TAU - 1.9, 0.28 * PI, 0.3 * PI)); kt.ajout(CH, calotte(0.1035, PI / 2 + 0.6, 0.36, 0.28 * PI, 0.2 * PI, 6)); kt.ajout(CH, calotte(0.1035, PI / 2 - 0.96, 0.36, 0.28 * PI, 0.2 * PI, 6)); };
    if (coiffe === 'nu' || coiffe === 'bonnet' || coiffe === 'couronne' || coiffe === 'chapeau' || coiffe === 'pointu') chevelure();
    if (femme && coiffe === 'nu') kt.ajout(CH, place(new THREE.CylinderGeometry(0.03, 0.012, 0.4, 8), 0, C0 - 0.25, -0.09, 0.15));
    if (coiffe === 'tonsure') { kt.ajout(CH, calotte(0.105, 0, TAU, 0.2 * PI, 0.14 * PI)); kt.ajout(CH, calotte(0.104, PI / 2 + 0.6, TAU - 1.2, 0.3 * PI, 0.32 * PI)); }
    if (p.barbe) {
      const B = 'cheveux:' + p.barbe;
      kt.ajout(B, calotte(0.104, PI / 2 - 1.4, 2.8, 0.71 * PI, 0.25 * PI, 18));
      kt.ajout(B, calotte(0.104, PI / 2 - 1.4, 0.42, 0.52 * PI, 0.22 * PI, 5)); kt.ajout(B, calotte(0.104, PI / 2 + 0.98, 0.42, 0.52 * PI, 0.22 * PI, 5));
      kt.ajout(B, place(new THREE.TorusGeometry(0.018, 0.0055, 4, 10, PI), 0, C0 - 0.05, 0.088, 0, 0, 0, 1.15, 0.8, 1));
    }
    if (coiffe === 'capuche') {
      kt.ajout(CF, calotte(0.124, PI / 2 + 1.0, TAU - 2.0, 0, 0.8 * PI));
      kt.ajout(CF, place(new THREE.ConeGeometry(0.035, 0.2, 8), 0, C0 + 0.02, -0.15, -2.2));
    }
    if (coiffe === 'bonnet') kt.ajout(CF, calotte(0.109, 0, TAU, 0, 0.4 * PI));
    if (coiffe === 'couronne' || coiffe === 'reine') {
      const O = 'or:' + (coiffe === 'reine' ? '#D9A93A' : p.coiffeCol || '#D9A93A'), yc = C0 + 0.066, rc = coiffe === 'reine' ? 0.1 : 0.088;
      kt.ajout(O, new THREE.CylinderGeometry(rc, rc + 0.002, 0.032, 24, 1, true).scale(0.85, 1, 1.05).translate(0, yc, 0));
      for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; kt.ajout(O, place(new THREE.ConeGeometry(0.013, 0.045, 5), Math.sin(a) * rc * 0.85, yc + 0.035, Math.cos(a) * rc * 1.05)); kt.ajout(O, place(new THREE.SphereGeometry(0.009, 6, 4), Math.sin(a) * rc * 0.85, yc + 0.06, Math.cos(a) * rc * 1.05)); }
    }
    if (coiffe === 'voile' || coiffe === 'reine') {
      const V = 'tissu:' + (coiffe === 'reine' ? '#F2EEE6' : p.coiffeCol || '#F2EEE6');
      kt.ajout(V, calotte(0.113, PI / 2 + 0.62, TAU - 1.24, 0, 0.6 * PI));
      kt.ajout(V, calotte(0.113, PI / 2 - 0.62, 1.24, 0, 0.34 * PI, 10));
      kt.ajout(V, drape([[0.23, -0.2], [0.19, -0.12], [0.13, -0.02], [0.1, C0 - 0.03]], 16, { n: 6, amp: 0.08, haut: 0, bas: -0.2 }, [0.95, 1.0], PI - 1.5, 3.0));
    }
    if (coiffe === 'casque') {
      const MA = 'mailles:#8E9297', FE = 'metal:#7E8388';
      kt.ajout(MA, calotte(0.116, PI / 2 + 0.72, TAU - 1.44, 0, 0.9 * PI));
      kt.ajout(MA, drape([[0.17, -0.15], [0.12, -0.09], [0.1, -0.02]], 18, null, [1.15, 0.95]));
      kt.ajout(FE, new THREE.ConeGeometry(0.103, 0.18, 18, 1, true).scale(0.88, 1, 1.02).translate(0, C0 + 0.1, 0));
      kt.ajout(FE, anneau(0.1, 0.008, C0 + 0.012, 0.88, 1.02, 20));
      kt.ajout(FE, place(new THREE.BoxGeometry(0.016, 0.08, 0.008), 0, C0 - 0.012, 0.105));
    }
    if (coiffe === 'chapeau') { const F = 'tissu:' + (p.coiffeCol || '#6A5A48'); kt.ajout(F, new THREE.CylinderGeometry(0.2, 0.2, 0.012, 24).translate(0, C0 + 0.07, 0)); kt.ajout(F, new THREE.CylinderGeometry(0.083, 0.095, 0.075, 16).translate(0, C0 + 0.11, 0)); }
    if (coiffe === 'pointu') { const F = 'tissu:' + (p.coiffeCol || '#C9A13A'); kt.ajout(F, new THREE.CylinderGeometry(0.105, 0.105, 0.012, 20).translate(0, C0 + 0.07, 0)); kt.ajout(F, new THREE.ConeGeometry(0.088, 0.19, 16).translate(0, C0 + 0.17, 0)); kt.ajout(F, place(new THREE.SphereGeometry(0.018, 8, 6), 0, C0 + 0.27, 0)); }
    kc.vers(g); kt.vers(tete);
    if (femme) g.scale.setScalar(0.95);
    if (p.taille) g.scale.setScalar(p.taille);
    g.userData = { tete, epG: G.ep, coG: G.co, epD: D.ep, coD: D.co, pose, appliquer: () => { appliquer(G, pose.G); appliquer(D, pose.D); }, hauteurYeux: 1.63 * g.scale.y };
    return g;
  };

  /* ---------- Foule : silhouettes simplifiées, instanciées ----------
     Chaque silhouette donne des géométries par « couche » (corps, jambes, peau, coiffe, bras, manteau) colorées instance par instance. */
  M.silhouette = function (v) {
    const L = {}, add = (k, geo) => { (L[k] = L[k] || []).push(geo); };
    const f = v.sexe === 'f', lg = v.longueur || 'courte';
    const yb = { courte: 0.52, mi: 0.3, longue: 0.07, cavalier: 0.62 }[lg], rO = { courte: 0.25, mi: 0.27, longue: 0.3, cavalier: 0.3 }[lg];
    if (lg === 'cavalier') { // assis en selle : l'origine est le creux de la selle
      [-1, 1].forEach(s => { add('jambes', segment(new THREE.Vector3(s * 0.12, 0.05, 0.05), new THREE.Vector3(s * 0.26, -0.3, 0.3), 0.07, 0.06, 6)); add('jambes', segment(new THREE.Vector3(s * 0.26, -0.3, 0.3), new THREE.Vector3(s * 0.26, -0.75, 0.2), 0.055, 0.045, 6)); });
      add('corps', drape([[0.3, -0.15], [0.24, 0.02], [0.17, 0.1]], 10, { n: 5, amp: 0.1, haut: 0.1, bas: -0.15 }, [1.25, 1.0]));
    } else {
      if (yb > 0.2) [-1, 1].forEach(s => add('jambes', place(new THREE.CylinderGeometry(0.062, 0.045, 0.86, 5), s * 0.088, 0.46, 0)));
      [-1, 1].forEach(s => add('jambes', place(new THREE.SphereGeometry(0.052, 5, 2, 0, TAU, 0, PI / 2), s * 0.085, 0, 0.04, 0, 0, 0, 0.85, 0.95, 2.1)));
      const pj = [[rO, yb], [(rO + 0.19) / 2, (yb + 0.93) / 2], [0.19, 0.93], [0.163, 1.0]];
      add('corps', drape(pj, 9, { n: f ? 7 : 6, amp: 0.09, haut: 0.95, bas: yb, ph: v.ph || 0 }, [1.08, 0.9]));
    }
    const dy = lg === 'cavalier' ? -0.9 : 0;
    add('corps', drape([[0.163, 1.0], [0.175, 1.2], [0.18, 1.33], [0.15, 1.43], [0.06, 1.5]].map(([r, y]) => [r * (f ? 0.92 : 1), y + dy]), 9, null, [1.14, 0.8]));
    add('peau', place(new THREE.SphereGeometry(0.1, 7, 5), 0, 1.65 + dy, 0.012, 0, 0, 0, 0.8, 1.1, 0.97));
    add('peau', place(new THREE.CylinderGeometry(0.042, 0.047, 0.1, 5, 1, true), 0, 1.525 + dy, 0.005));
    [-1, 1].forEach(s => { // bras : origine à la hauteur des épaules pour pouvoir les lever
      add('bras', segment(new THREE.Vector3(s * 0.19, 0, 0), new THREE.Vector3(s * 0.22, -0.29, 0.02), 0.056, 0.046, 5));
      add('bras', segment(new THREE.Vector3(s * 0.22, -0.29, 0.02), new THREE.Vector3(s * 0.2, -0.55, 0.1), 0.046, v.manches === 'larges' ? 0.1 : 0.036, 5));
    });
    const c = v.coiffe, hc = 1.65 + dy;
    const cal = (r, phi0, dphi, th0, dth) => new THREE.SphereGeometry(r, 8, 4, phi0, dphi, th0, dth).scale(0.8, 1.1, 0.97).translate(0, hc, 0.012);
    if (c === 'capuche') { add('coiffe', cal(0.124, PI / 2 + 0.85, TAU - 1.7, 0, 0.8 * PI)); add('coiffe', drape([[0.26, 1.24 + dy], [0.2, 1.4 + dy], [0.1, 1.55 + dy]], 9, null, [1.12, 0.95])); }
    if (c === 'cheveux') { add('coiffe', cal(0.105, 0, TAU, 0, 0.3 * PI)); add('coiffe', cal(0.104, PI / 2 + 0.55, TAU - 1.1, 0.28 * PI, 0.36 * PI)); }
    if (c === 'voile') { add('coiffe', cal(0.113, PI / 2 + 0.62, TAU - 1.24, 0, 0.62 * PI)); add('coiffe', drape([[0.22, 1.42 + dy], [0.15, 1.52 + dy], [0.11, 1.62 + dy]], 7, null, [0.95, 1.0], PI - 1.5, 3.0)); }
    if (c === 'tonsure') { add('coiffe', cal(0.105, 0, TAU, 0.2 * PI, 0.14 * PI)); add('coiffe', cal(0.104, PI / 2 + 0.6, TAU - 1.2, 0.3 * PI, 0.3 * PI)); }
    if (c === 'bonnet') add('coiffe', cal(0.109, 0, TAU, 0, 0.42 * PI));
    if (c === 'chapeau') { add('coiffe', new THREE.CylinderGeometry(0.2, 0.2, 0.012, 10).translate(0, hc + 0.07, 0.012)); add('coiffe', new THREE.CylinderGeometry(0.083, 0.095, 0.075, 8).translate(0, hc + 0.11, 0.012)); }
    if (c === 'casque') { add('coiffe', cal(0.116, PI / 2 + 0.5, TAU - 1.0, 0, 0.9 * PI)); add('coiffe', new THREE.ConeGeometry(0.103, 0.18, 8).scale(0.88, 1, 1.02).translate(0, hc + 0.1, 0.012)); }
    if (v.capuchonDos) add('corps', place(new THREE.SphereGeometry(0.13, 6, 4), 0, 1.35 + dy, -0.15, 0.3, 0, 0, 1.05, 0.95, 0.5));
    if (v.manteau) add('manteau', drape([[0.36, Math.max(0.16, yb + 0.1) + dy], [0.3, 0.8 + dy], [0.24, 1.3 + dy], [0.15, 1.49 + dy]], 10, { n: 5, amp: 0.07, haut: 1.3 + dy, bas: 0.2 + dy }, [1.12, 0.92], PI - 1.85, 3.7));
    const r = {}; for (const k in L) r[k] = fusionner(L[k]);
    return r;
  };

  /* ---------- Cheval ---------- */
  M.cheval = function () {
    const L = {}, add = (k, geo) => { (L[k] = L[k] || []).push(geo); };
    add('robe', place(new THREE.SphereGeometry(1, 16, 10), 0, 1.3, -0.02, 0, 0, 0, 0.31, 0.35, 0.72));
    add('robe', place(new THREE.SphereGeometry(1, 12, 8), 0, 1.3, 0.5, 0, 0, 0, 0.28, 0.35, 0.32));
    add('robe', place(new THREE.SphereGeometry(1, 12, 8), 0, 1.34, -0.5, 0, 0, 0, 0.32, 0.36, 0.38));
    const cou0 = new THREE.Vector3(0, 1.45, 0.62), cou1 = new THREE.Vector3(0, 1.95, 0.95);
    add('robe', segment(cou0, cou1, 0.2, 0.12, 10));
    add('robe', place(new THREE.SphereGeometry(0.13, 10, 8), cou1.x, cou1.y, cou1.z));
    const nuque = cou1.clone(), museau = new THREE.Vector3(0, 1.62, 1.26);
    add('robe', segment(nuque, museau, 0.115, 0.065, 10));
    add('robe', place(new THREE.SphereGeometry(0.07, 8, 6), museau.x, museau.y, museau.z, 0, 0, 0, 1, 0.9, 1.2));
    [-1, 1].forEach(s => add('robe', place(new THREE.ConeGeometry(0.025, 0.1, 5), s * 0.05, 2.08, 0.93, -0.2, 0, s * 0.3)));
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([s, t]) => {
      const x = s * 0.16, z = t * 0.5, genou = new THREE.Vector3(x, 0.62, z + (t < 0 ? -0.06 : 0.02)), boulet = new THREE.Vector3(x, 0.14, z + 0.02);
      add('robe', segment(new THREE.Vector3(x, 1.18, z), genou, t < 0 ? 0.1 : 0.085, 0.055, 8));
      add('robe', segment(genou, boulet, 0.042, 0.036, 6));
      add('crins', new THREE.CylinderGeometry(0.048, 0.062, 0.1, 8).translate(boulet.x, 0.05, boulet.z));
    });
    add('crins', segment(new THREE.Vector3(0, 1.45, -0.86), new THREE.Vector3(0, 0.62, -1.02), 0.06, 0.03, 6));
    add('crins', segment(new THREE.Vector3(0, 1.48, 0.66), new THREE.Vector3(0, 2.02, 0.93), 0.03, 0.03, 4).scale(0.7, 1, 1).translate(0, 0.05, -0.06));
    add('harnais', place(new THREE.BoxGeometry(0.5, 0.1, 0.52), 0, 1.66, -0.02));
    add('harnais', place(new THREE.BoxGeometry(0.34, 0.16, 0.05), 0, 1.74, 0.23));
    add('harnais', place(new THREE.BoxGeometry(0.4, 0.2, 0.06), 0, 1.76, -0.27));
    add('harnais', drape([[0.36, 1.1], [0.33, 1.45], [0.28, 1.62]], 12, null, [1.0, 1.1], PI / 2 - 0.9, 1.8).translate(0, 0, -0.02));
    add('harnais', drape([[0.36, 1.1], [0.33, 1.45], [0.28, 1.62]], 12, null, [1.0, 1.1], PI * 1.5 - 0.9, 1.8).translate(0, 0, -0.02));
    add('harnais', anneau(0.075, 0.012, 0, 1, 1.2, 12).rotateX(-0.75).translate(0, 1.7, 1.18));
    const r = {}; for (const k in L) r[k] = fusionner(L[k]);
    return r;
  };

  /* ---------- Arbres (fin mars : bourgeons, arbres nus, fruitiers en fleurs) ---------- */
  M.arbre = function (type, graine) {
    const rnd = alea(graine), troncs = [], feuilles = [], v = new THREE.Vector3();
    const H = { feuillu: 3.2, nu: 3.6, fruitier: 1.6, peuplier: 4.5, buisson: 0 }[type];
    const branche = (a, dir, long, r, prof) => {
      const b = a.clone().addScaledVector(dir, long);
      troncs.push(segment(a, b, r, r * 0.68, prof > 1 ? 4 : 6));
      if (prof >= (type === 'nu' ? 4 : 3)) { if (type !== 'nu') feuilles.push(b); return; }
      const n = type === 'peuplier' ? 2 : type === 'nu' ? 3 : 2 + (rnd() < 0.5 ? 1 : 0);
      for (let k = 0; k < n; k++) {
        const ang = rnd() * TAU, ecart = type === 'peuplier' ? 0.2 + rnd() * 0.15 : 0.45 + rnd() * 0.4;
        const d = dir.clone().applyAxisAngle(new THREE.Vector3(Math.cos(ang), 0, Math.sin(ang)), ecart).normalize();
        d.y = Math.max(d.y, type === 'fruitier' ? 0.15 : 0.3); d.normalize();
        branche(b, d, long * (0.62 + rnd() * 0.18), r * 0.62, prof + 1);
      }
    };
    if (type === 'buisson') for (let k = 0; k < 4; k++) feuilles.push(new THREE.Vector3((rnd() - 0.5) * 1.6, 0.5 + rnd() * 0.5, (rnd() - 0.5) * 1.6));
    else {
      const base = new THREE.Vector3(0, 0, 0), dir = new THREE.Vector3((rnd() - 0.5) * 0.12, 1, (rnd() - 0.5) * 0.12).normalize();
      troncs.push(segment(base, base.clone().addScaledVector(dir, H), type === 'fruitier' ? 0.16 : 0.3, type === 'fruitier' ? 0.13 : 0.22, 8));
      branche(base.clone().addScaledVector(dir, H), dir, type === 'peuplier' ? 3.8 : type === 'fruitier' ? 1.6 : 2.8, type === 'fruitier' ? 0.12 : 0.21, 1);
    }
    const r = troncs.length ? { tronc: fusionner(troncs) } : {};
    if (feuilles.length) {
      const blobs = [], R = { feuillu: 2.5, fruitier: 1.55, peuplier: 1.45, buisson: 1.0 }[type];
      let ymin = 1e9, ymax = -1e9; feuilles.forEach(p => { ymin = Math.min(ymin, p.y); ymax = Math.max(ymax, p.y); });
      feuilles.forEach(p => {
        const rr = R * (0.75 + rnd() * 0.5), ico = new THREE.SphereGeometry(1, 8, 5), P = ico.attributes.position, cols = new Float32Array(P.count * 3);
        for (let i = 0; i < P.count; i++) {
          v.fromBufferAttribute(P, i); const k = rr * (0.82 + 0.3 * Math.sin(v.x * 5.1 + v.y * 3.3 + graine) * Math.cos(v.z * 4.7));
          v.multiplyScalar(k); if (type === 'peuplier') { v.x *= 0.7; v.z *= 0.7; v.y *= 1.6; }
          v.add(p); P.setXYZ(i, v.x, v.y, v.z);
          const h = (v.y - ymin + R) / (ymax - ymin + 2 * R), l = 0.5 + 0.5 * Math.min(1, h * 1.2);
          cols[i * 3] = cols[i * 3 + 1] = cols[i * 3 + 2] = l;
        }
        ico.setAttribute('color', new THREE.BufferAttribute(cols, 3));
        blobs.push(ico);
      });
      r.couronne = fusionner(blobs);
    }
    return r;
  };
  // touffe d'herbe : trois quadrilatères croisés, normales vers le ciel pour un éclairage doux
  M.touffe = function () {
    const qs = [];
    for (let k = 0; k < 3; k++) {
      const q = new THREE.PlaneGeometry(0.62, 0.34).translate(0, 0.17, 0).rotateY(k * PI / 3), r = q.clone(), I = r.index.array;
      for (let i = 0; i < I.length; i += 3) { const t = I[i]; I[i] = I[i + 2]; I[i + 2] = t; }
      qs.push(q, r);
    }
    const g = fusionner(qs), N = g.attributes.normal; for (let i = 0; i < N.count; i++) N.setXYZ(i, 0, 1, 0);
    return g;
  };

  window.Modeles = M;
})();
