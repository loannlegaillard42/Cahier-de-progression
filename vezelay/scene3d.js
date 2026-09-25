/* Vézelay, 31 mars 1146 — la colline en 3D (Three.js r150, script classique).
   Colline, basilique, bourg, champ de l'assemblée, estrade, foule, personnages, sermon animé,
   caméra guidée d'étape en étape et promenade libre. Reconstitution imaginée et simplifiée. */
(function () {
  'use strict';

  /* ---------- Outils ---------- */
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function hash(i, j) { let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
  function bruit(x, y) {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y) { let s = 0, a = 0.5, f = 1; for (let o = 0; o < 4; o++) { s += a * bruit(x * f, y * f); f *= 2.03; a *= 0.5; } return s / 0.94; }
  function alea(graine) { let a = graine >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const col = c => new THREE.Color(c);

  /* ---------- Relief : la « colline éternelle » ---------- */
  const rivX = z => 640 + 70 * Math.sin(z * 0.0042) + 30 * Math.sin(z * 0.011);
  function hauteur(x, z) {
    // crête allongée est-ouest : plateau du bourg (de x = -340 à 140), flancs raides
    const dx = x < -60 ? Math.max(0, -60 - x - 280) : Math.max(0, x + 60 - 200);
    const dz = Math.max(0, Math.abs(z) - 38);
    let colline = 70 * Math.exp(-(dx * dx) / 13225) * Math.exp(-(dz * dz) / 13924);
    // champ de l'assemblée : pente douce au nord, sous l'estrade
    const w = smooth(-195, -165, x) * (1 - smooth(50, 85, x)) * smooth(-305, -268, z) * (1 - smooth(-142, -118, z));
    colline += ((30 + (z + 150) * 0.2) - colline) * w;
    const d = Math.hypot(x, z * 0.9);
    const lointain = smooth(480, 1300, d) * (30 + 55 * fbm(x * 0.0016 + 3, z * 0.0016 - 1));
    const ondul = 7 * (fbm(x * 0.004 + 7, z * 0.004 + 2) - 0.5) * (1 - Math.min(1, colline / 45));
    const vallee = -9 * Math.exp(-Math.pow((x - rivX(z)) / 110, 2));
    return colline + lointain + ondul + vallee;
  }

  /* ---------- Géométries ---------- */
  function fusion(geos) {
    let n = 0; const gs = geos.map(g => g.index ? g.toNonIndexed() : g);
    gs.forEach(g => { n += g.attributes.position.count; });
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let o = 0;
    gs.forEach(g => { pos.set(g.attributes.position.array, o * 3); nor.set(g.attributes.normal.array, o * 3); o += g.attributes.position.count; });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); return g;
  }
  function prisme(larg, haut, long, axe) {
    const f = new THREE.Shape(); f.moveTo(-larg / 2, 0); f.lineTo(larg / 2, 0); f.lineTo(0, haut); f.lineTo(-larg / 2, 0);
    const g = new THREE.ExtrudeGeometry(f, { depth: long, bevelEnabled: false }); g.translate(0, 0, -long / 2);
    if (axe === 'x') g.rotateY(Math.PI / 2);
    return g;
  }
  const mats = {};
  const mat = c => mats[c] || (mats[c] = new THREE.MeshLambertMaterial({ color: c }));
  function ajout(g, geo, c, x, y, z, ombre) { const m = new THREE.Mesh(geo, typeof c === 'object' ? c : mat(c)); m.position.set(x, y, z); if (ombre !== false) { m.castShadow = true; m.receiveShadow = true; } g.add(m); return m; }
  const boite = (g, w, h, d, x, y, z, c) => ajout(g, new THREE.BoxGeometry(w, h, d), c, x, y, z);

  /* ---------- Textures dessinées ---------- */
  function texTympan() {
    const c = canvas(256, 128), x = c.getContext('2d');
    x.fillStyle = '#CDBB97'; x.fillRect(0, 0, 256, 128);
    x.strokeStyle = '#8E7A58'; x.lineWidth = 3;
    for (let r = 120; r > 100; r -= 7) { x.beginPath(); x.arc(128, 128, r, Math.PI, 0); x.stroke(); }
    x.fillStyle = '#B9A47C'; x.beginPath(); x.ellipse(128, 86, 24, 40, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#7E6A4C'; x.beginPath(); x.arc(128, 62, 8, 0, Math.PI * 2); x.fill(); x.fillRect(118, 70, 20, 46);
    x.strokeStyle = 'rgba(126,106,76,0.7)'; x.lineWidth = 2;
    for (let i = -3; i <= 3; i++) { if (!i) continue; x.beginPath(); x.moveTo(128, 70); x.lineTo(128 + i * 26, 100); x.stroke(); }
    x.fillStyle = '#8E7A58';
    for (let i = 0; i < 12; i++) { const px = 22 + i * 19 + (i > 5 ? 20 : 0) - (i > 5 ? 0 : 0); if (Math.abs(px - 128) < 30) continue; x.fillRect(px - 4, 96, 8, 22); x.beginPath(); x.arc(px, 92, 4, 0, Math.PI * 2); x.fill(); }
    return new THREE.CanvasTexture(c);
  }
  function texBanniere(type) {
    const c = canvas(128, 160), x = c.getContext('2d');
    if (type === 'roi') {
      x.fillStyle = '#2F4F9E'; x.fillRect(0, 0, 128, 160);
      x.fillStyle = '#E3B341';
      const lis = (cx, cy, s) => { x.beginPath(); x.ellipse(cx, cy - 6 * s, 3 * s, 8 * s, 0, 0, Math.PI * 2); x.fill(); x.beginPath(); x.ellipse(cx - 6 * s, cy - 2 * s, 2.5 * s, 6 * s, -0.8, 0, Math.PI * 2); x.fill(); x.beginPath(); x.ellipse(cx + 6 * s, cy - 2 * s, 2.5 * s, 6 * s, 0.8, 0, Math.PI * 2); x.fill(); x.fillRect(cx - 7 * s, cy + 2 * s, 14 * s, 3 * s); x.fillRect(cx - 1.5 * s, cy + 2 * s, 3 * s, 8 * s); };
      [[32, 34], [96, 34], [64, 76], [32, 118], [96, 118]].forEach(([a, b]) => lis(a, b, 1.3));
    } else {
      x.fillStyle = '#F2EDE2'; x.fillRect(0, 0, 128, 160);
      x.fillStyle = '#B3261E'; x.fillRect(52, 12, 24, 136); x.fillRect(16, 52, 96, 24);
    }
    return new THREE.CanvasTexture(c);
  }
  function texCroix() {
    const c = canvas(64, 64), x = c.getContext('2d');
    x.fillStyle = '#B3261E'; x.fillRect(26, 6, 12, 52); x.fillRect(10, 20, 44, 12);
    return new THREE.CanvasTexture(c);
  }
  function texNuage() {
    const c = canvas(128, 64), x = c.getContext('2d');
    for (let i = 0; i < 7; i++) { const g = x.createRadialGradient(20 + i * 14, 36 - (i % 3) * 5, 2, 20 + i * 14, 36 - (i % 3) * 5, 24); g.addColorStop(0, 'rgba(255,255,255,0.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 64); }
    return new THREE.CanvasTexture(c);
  }

  /* ---------- Personnages détaillés ---------- */
  function figure(look, acc) {
    const g = new THREE.Group(), habit = look.habit, peau = look.peau;
    ajout(g, new THREE.CylinderGeometry(0.2, 0.36, 1.12, 14), habit, 0, 0.56, 0);
    ajout(g, new THREE.CylinderGeometry(0.19, 0.21, 0.42, 14), habit, 0, 1.33, 0);
    const ep = ajout(g, new THREE.SphereGeometry(0.2, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), habit, 0, 1.52, 0); ep.scale.set(1.15, 0.5, 0.9);
    ajout(g, new THREE.CylinderGeometry(0.212, 0.212, 0.06, 14), look.col || '#3A2A1E', 0, 1.14, 0);
    const bras = cote => {
      const p = new THREE.Group(); p.position.set(cote * 0.24, 1.5, 0); g.add(p);
      ajout(p, new THREE.CylinderGeometry(0.06, 0.07, 0.62, 8), habit, 0, -0.31, 0);
      ajout(p, new THREE.SphereGeometry(0.055, 8, 6), peau, 0, -0.64, 0);
      p.rotation.z = cote * 0.12; return p;
    };
    g.userData.brasG = bras(-1); g.userData.brasD = bras(1);
    if (look.manteau) { const m = ajout(g, new THREE.CylinderGeometry(0.27, 0.44, 1.38, 16, 1, true, Math.PI / 2, Math.PI), new THREE.MeshLambertMaterial({ color: look.manteau, side: THREE.DoubleSide }), 0, 0.84, -0.02); m.castShadow = true; }
    ajout(g, new THREE.CylinderGeometry(0.06, 0.07, 0.1, 8), peau, 0, 1.6, 0);
    const tete = ajout(g, new THREE.SphereGeometry(0.125, 18, 14), peau, 0, 1.73, 0); tete.scale.set(0.92, 1.08, 0.98);
    [-1, 1].forEach(s => ajout(g, new THREE.SphereGeometry(0.017, 6, 5), '#2A1E16', s * 0.042, 1.75, 0.112, false));
    const c = look.coiffeCol || '#555';
    if (look.cheveux && !/capuche|chaperon|voile|casque/.test(look.coiffe || '')) {
      const ch = ajout(g, new THREE.SphereGeometry(0.132, 16, 10, 0, Math.PI * 2, 0, 1.25), look.cheveux, 0, 1.745, -0.012); ch.scale.set(0.95, 1.05, 1);
    }
    if (look.barbe) { const b = ajout(g, new THREE.SphereGeometry(0.1, 12, 8), look.barbe, 0, 1.655, 0.05); b.scale.set(0.95, 0.75, 0.75); }
    switch (look.coiffe) {
      case 'couronne': {
        ajout(g, new THREE.CylinderGeometry(0.128, 0.13, 0.06, 14, 1, true), new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide }), 0, 1.84, 0);
        for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; ajout(g, new THREE.ConeGeometry(0.018, 0.05, 5), c, Math.sin(a) * 0.125, 1.89, Math.cos(a) * 0.125); }
        break;
      }
      case 'voile': {
        const v = ajout(g, new THREE.SphereGeometry(0.145, 16, 12), c, 0, 1.76, -0.035); v.scale.set(1, 1.05, 1);
        ajout(g, new THREE.CylinderGeometry(0.13, 0.26, 0.5, 14, 1, true, Math.PI / 2, Math.PI), new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide }), 0, 1.55, -0.03);
        ajout(g, new THREE.CylinderGeometry(0.14, 0.145, 0.05, 14, 1, true), new THREE.MeshLambertMaterial({ color: '#E3B341', side: THREE.DoubleSide }), 0, 1.86, -0.01);
        break;
      }
      case 'tonsure': {
        const t = ajout(g, new THREE.TorusGeometry(0.1, 0.035, 8, 18), look.cheveux || '#5A4032', 0, 1.79, -0.005); t.rotation.x = Math.PI / 2;
        const cap = ajout(g, new THREE.TorusGeometry(0.19, 0.06, 8, 18), habit, 0, 1.56, -0.02); cap.rotation.x = Math.PI / 2;
        break;
      }
      case 'chaperon': case 'capuche': {
        const hood = ajout(g, new THREE.SphereGeometry(0.155, 16, 12), c, 0, 1.76, -0.05); hood.scale.set(1, 1.08, 1.05);
        const cap = ajout(g, new THREE.TorusGeometry(0.19, 0.07, 8, 18), c, 0, 1.56, -0.01); cap.rotation.x = Math.PI / 2;
        break;
      }
      case 'casque': {
        ajout(g, new THREE.SphereGeometry(0.148, 16, 12), '#8C9094', 0, 1.72, -0.03);
        ajout(g, new THREE.ConeGeometry(0.14, 0.22, 14), c, 0, 1.89, 0);
        ajout(g, new THREE.BoxGeometry(0.022, 0.13, 0.02), c, 0, 1.76, 0.135);
        break;
      }
      case 'bonnet': ajout(g, new THREE.SphereGeometry(0.135, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), c, 0, 1.77, 0); break;
    }
    if (acc === 'tablette') { const t = ajout(g.userData.brasD, new THREE.BoxGeometry(0.16, 0.2, 0.02), '#8A6A40', -0.05, -0.62, 0.1); t.rotation.x = -0.6; g.userData.brasD.rotation.x = -0.9; }
    if (acc === 'baton') { ajout(g.userData.brasD, new THREE.CylinderGeometry(0.02, 0.02, 1.7, 6), '#6A4A2A', 0, -0.4, 0.05); }
    if (acc === 'epee') { const e = ajout(g, new THREE.BoxGeometry(0.05, 0.85, 0.03), '#B8BCC0', -0.22, 0.72, 0.05); e.rotation.z = 0.15; ajout(g, new THREE.BoxGeometry(0.2, 0.03, 0.04), '#6A4A2A', -0.26, 1.13, 0.05); }
    return g;
  }
  const LOOK_BERNARD = { peau: '#E2B896', habit: '#EDE8DC', coiffe: 'tonsure', cheveux: '#9A8A78' };

  /* ---------- Points de vue et personnages ---------- */
  const EST = { x: -60, z: -150 };
  const POINTS = {
    route: { pos: [620, -147], haut: 1.8, fov: 40, cible: [-200, 30, 0] },
    basilique: { pos: [-352, 9], cible: [-306, 11, 0] },
    bourg: { pos: [-122, -64], cible: [-60, 2, -215] },
    champ: { pos: [62, -212], cible: [-50, 4, -178] },
    estrade: { pos: [-43, -163], cible: [-55, 4.6, -150] },
    foule: { pos: [-58.5, -169], haut: 2.6, fov: 38, cible: [-60, 4.9, -153] },
    survol: { pos: [330, -520], haut: 230, cible: [-90, 10, -70] }
  };
  const PNJ = {
    aubert: { x: 606.7, z: -147.7, acc: 'baton' },
    renaud: { x: -338, z: 5 },
    etienne: { x: -112, z: -72 },
    hugues: { x: 52, z: -207, acc: 'epee', manteau: '#8E2F24' },
    louis: { x: -55.8, z: -149.3, estrade: true, manteau: '#2F4F9E' },
    alienor: { x: -53.4, z: -149.6, estrade: true, manteau: '#6E2A3A' },
    odon: { x: -62.5, z: -166.5, acc: 'tablette' }
  };

  /* ---------- État ---------- */
  const S = {};
  let renderer, scene, camera, conteneur, soleil, horloge, estradeY = 0;
  let enPause = false, surClicPerso = null;
  const personnages = {}, cibles = [], marqueurs = {};
  const cam = { pos: new THREE.Vector3(), yaw: 0, pitch: 0, trajet: null };
  let foule = null, sermon = null, croix = [], texCroixCache = null, bernard = null;
  let libre = false, dernierProche = null;
  S.commande = { avant: false, arriere: false, gauche: false, droite: false, vite: false };

  /* ---------- Construction ---------- */
  const SOL = { vert1: col('#8FA65C'), vert2: col('#A2B665'), labour: col('#9A7C57'), jachere: col('#B5AC72'), pre: col('#94A861'), terre: col('#B7A585'), pietine: col('#9DA066'), foret: col('#5E7443'), vigne: col('#8D9A58') };
  function construireTerrain() {
    const N = 300, T = 3600;
    const geo = new THREE.PlaneGeometry(T, T, N, N); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, couleurs = new Float32Array(pos.count * 3), c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), y = hauteur(x, z); pos.setY(i, y);
      const r = hash(Math.floor((x + 5000) / 70), Math.floor((z + 5000) / 46));
      c.copy(r < 0.42 ? SOL.vert1 : r < 0.68 ? SOL.vert2 : r < 0.84 ? SOL.labour : SOL.jachere);
      const surColline = smooth(10, 30, y) * (1 - smooth(480, 900, Math.hypot(x, z)));
      c.lerp(SOL.pre, surColline * 0.8);
      if (Math.abs(z) < 48 && x > -335 && x < 150 && y > 50) c.lerp(SOL.terre, 0.75);
      if (x > -165 && x < 45 && z > -275 && z < -150) c.lerp(SOL.pietine, 0.55);
      if (z > 60 && z < 140 && x > -160 && x < 60) c.lerp(SOL.vigne, 0.6);
      const f = fbm(x * 0.003 + 11, z * 0.003 - 4);
      if (f > 0.58 && Math.hypot(x, z) > 420) c.lerp(SOL.foret, smooth(0.58, 0.66, f));
      c.multiplyScalar(0.93 + 0.12 * fbm(x * 0.02, z * 0.02));
      couleurs[i * 3] = c.r; couleurs[i * 3 + 1] = c.g; couleurs[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(couleurs, 3));
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ vertexColors: true })); m.receiveShadow = true; scene.add(m);
  }
  function ruban(points, larg, couleur, dy, pas) {
    // bande qui suit le relief : chemins, route, rivière
    const courbe = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const n = Math.ceil(courbe.getLength() / (pas || 4)), pos = [], idx = [];
    for (let i = 0; i <= n; i++) {
      const p = courbe.getPointAt(i / n), t = courbe.getTangentAt(i / n), nx = -t.z, nz = t.x;
      for (const s of [-1, 1]) { const x = p.x + nx * s * larg / 2, z = p.z + nz * s * larg / 2; pos.push(x, hauteur(x, z) + dy, z); }
      if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: couleur, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 })); m.receiveShadow = true; scene.add(m); return m;
  }
  function construireCiel() {
    const g = new THREE.SphereGeometry(4000, 24, 12);
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { haut: { value: col('#6FA3D2') }, bas: { value: col('#DCE7EC') } },
      vertexShader: 'varying float h; void main(){ h = normalize(position).y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: 'uniform vec3 haut; uniform vec3 bas; varying float h; void main(){ gl_FragColor = vec4(mix(bas, haut, smoothstep(0.0, 0.45, h)), 1.0); }'
    });
    scene.add(new THREE.Mesh(g, m));
    const tn = texNuage(), rnd = alea(7);
    for (let k = 0; k < 14; k++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tn, transparent: true, opacity: 0.8, depthWrite: false, fog: false }));
      const a = rnd() * Math.PI * 2, r = 1300 + rnd() * 1300; s.position.set(Math.cos(a) * r, 380 + rnd() * 420, Math.sin(a) * r); s.scale.set(700 + rnd() * 600, 220 + rnd() * 120, 1); scene.add(s);
    }
  }
  function construireBasilique() {
    const x0 = -270, z0 = 0, y0 = hauteur(-270, 0) - 0.5, g = new THREE.Group(); g.position.set(x0, y0, z0); scene.add(g);
    const PIERRE = '#E2D4B4', PIERRE2 = '#D3C29F', TOIT = '#7D5747', FEN = '#3A3530';
    boite(g, 90, 16, 36, 2, -8, 0, PIERRE2);
    boite(g, 52, 19, 13, -2, 9.5, 0, PIERRE);
    boite(g, 52, 11, 6, -2, 5.5, 9.5, PIERRE); boite(g, 52, 11, 6, -2, 5.5, -9.5, PIERRE);
    ajout(g, prisme(14.2, 5.5, 53, 'x'), TOIT, -2, 19, 0);
    [-1, 1].forEach(s => { const t = boite(g, 52.5, 0.5, 7.4, -2, 11.8, s * 9.6, TOIT); t.rotation.x = s * 0.36; });
    boite(g, 9, 17, 34, 28.5, 8.5, 0, PIERRE); ajout(g, prisme(9.6, 4.5, 34.6), TOIT, 28.5, 17, 0);
    boite(g, 14, 15, 12, 40, 7.5, 0, PIERRE); ajout(g, prisme(12.6, 4.5, 14.4, 'x'), TOIT, 40, 15, 0);
    ajout(g, new THREE.CylinderGeometry(6.2, 6.2, 14, 18, 1, false, 0, Math.PI), PIERRE, 47, 7, 0);
    ajout(g, new THREE.ConeGeometry(6.6, 4.2, 18, 1, false, 0, Math.PI), TOIT, 47, 16.1, 0);
    ajout(g, new THREE.CylinderGeometry(9.5, 9.5, 8, 18, 1, false, 0, Math.PI), PIERRE, 47, 4, 0);
    boite(g, 17, 21, 26, -36.5, 10.5, 0, PIERRE); ajout(g, prisme(26.4, 6, 17.4, 'x'), TOIT, -36.5, 21, 0);
    boite(g, 7, 34, 7, -40, 17, 11, PIERRE); const fl = ajout(g, new THREE.ConeGeometry(5.3, 9, 4), TOIT, -40, 38.5, 11); fl.rotation.y = Math.PI / 4;
    // façade : portail, tympan, fenêtres
    boite(g, 0.8, 7.5, 5.5, -45.2, 3.75, 0, '#2E2A26');
    [-12.4, -5.2, 5.2, 12.4].forEach(z => boite(g, 1.6, 17, 1.4, -45.6, 8.5, z, PIERRE2));
    const ty = new THREE.Mesh(new THREE.CircleGeometry(3.2, 24, 0, Math.PI), new THREE.MeshLambertMaterial({ map: texTympan() }));
    ty.rotation.y = -Math.PI / 2; ty.position.set(-45.3, 7.5, 0); g.add(ty);
    const arc = ajout(g, new THREE.TorusGeometry(3.6, 0.35, 8, 24, Math.PI), PIERRE2, -45.35, 7.5, 0); arc.rotation.y = -Math.PI / 2;
    [-4.5, 0, 4.5].forEach(z => { boite(g, 0.3, 3.2, 1.3, -45.2, 14.5, z, FEN); });
    for (let i = 0; i < 8; i++) [-1, 1].forEach(s => {
      boite(g, 1.2, 2.8, 0.2, -24 + i * 6.3, 15, s * 6.55, FEN);
      boite(g, 1.1, 2.2, 0.2, -24 + i * 6.3, 6.5, s * 12.55, FEN);
    });
    // bâtiments de l'abbaye et cloître
    boite(g, 38, 9, 10, 6, 4.5, 30, PIERRE2); ajout(g, prisme(10.6, 3.5, 38.4, 'x'), TOIT, 6, 9, 30);
    boite(g, 10, 8, 26, 30, 4, 34, PIERRE2); ajout(g, prisme(10.6, 3.2, 26.4), TOIT, 30, 8, 34);
    boite(g, 26, 3.5, 1.2, 6, 1.75, 17.5, PIERRE); boite(g, 1.2, 3.5, 12, -12.5, 1.75, 23.5, PIERRE);
  }
  function construireBourg() {
    const rnd = alea(21), maisons = [];
    for (let x = -225; x < 136; x += 8 + rnd() * 4) for (const s of [-1, 1]) {
      if (s < 0 && x > -44 && x < -14) continue;
      maisons.push([x, s * (8.5 + rnd() * 2.5), 7 + rnd() * 3, 7 + rnd() * 2, 5.5 + rnd() * 3.5]);
      if (rnd() < 0.6) maisons.push([x + rnd() * 3, s * (21 + rnd() * 7), 7 + rnd() * 3, 7 + rnd() * 2, 5 + rnd() * 3]);
    }
    const n = maisons.length;
    const murs = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), new THREE.MeshLambertMaterial(), n);
    const toits = new THREE.InstancedMesh(prisme(1, 1, 1, 'x'), new THREE.MeshLambertMaterial(), n);
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const MURS = ['#CFC3A8', '#D8CDB4', '#C9B99A', '#BFB29A', '#D5C7A6'].map(col), TOITS = ['#8A5238', '#7A4A34', '#94603F', '#6E4A3A'].map(col);
    maisons.forEach(([x, z, w, d, h], i) => {
      const y = hauteur(x, z) - 4, tourne = rnd() < 0.35;
      e.set(0, tourne ? Math.PI / 2 : 0, 0); q.setFromEuler(e);
      M.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(w, h + 4, d)); murs.setMatrixAt(i, M);
      M.compose(new THREE.Vector3(x, y + h + 4, z), q, new THREE.Vector3(w * 1.08, 3 + rnd() * 1.5, d * 1.1)); toits.setMatrixAt(i, M);
      murs.setColorAt(i, MURS[Math.floor(rnd() * MURS.length)]); toits.setColorAt(i, TOITS[Math.floor(rnd() * TOITS.length)]);
    });
    [murs, toits].forEach(m => { m.castShadow = true; m.receiveShadow = true; scene.add(m); });
    // remparts et porte
    const segs = [];
    for (let x = -230; x < 146; x += 6) for (const s of [-1, 1]) { if (s < 0 && x > -40 && x < -18) continue; segs.push([x, s * 47]); }
    const rem = new THREE.InstancedMesh(new THREE.BoxGeometry(6.2, 5, 1.6).translate(0, 2.5, 0), mat('#C2B393'), segs.length);
    segs.forEach(([x, z], i) => { M.compose(new THREE.Vector3(x, hauteur(x, z) - 1.5, z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)); rem.setMatrixAt(i, M); });
    rem.castShadow = true; rem.receiveShadow = true; scene.add(rem);
    const porte = new THREE.Group(); porte.position.set(148, hauteur(148, 0) - 2, 0); scene.add(porte);
    boite(porte, 6, 12, 6, 0, 6, -7, '#C2B393'); boite(porte, 6, 12, 6, 0, 6, 7, '#C2B393'); boite(porte, 5, 4, 8, 0, 10, 0, '#C2B393');
  }
  function construireEstrade() {
    const y = hauteur(EST.x, EST.z); estradeY = y + 3.2;
    const g = new THREE.Group(); g.position.set(EST.x, y, EST.z); scene.add(g);
    const BOIS = '#7A5A38';
    for (const px of [-6, -2, 2, 6]) for (const pz of [-3.6, 3.6]) boite(g, 0.35, 5, 0.35, px, 0.5, pz, BOIS);
    boite(g, 13, 0.4, 8, 0, 3, 0, '#8A6A44');
    const drap = boite(g, 13, 2.6, 0.12, 0, 1.6, -4.05, '#8E1B1B');
    boite(g, 13, 0.12, 0.12, 0, 4.1, -3.95, BOIS);
    for (let k = 0; k < 6; k++) boite(g, 2.5, 0.3, 1.2, 7.6 + k * 0.1, 2.6 - k * 0.48, -1.5 + k * 1.2, BOIS);
    boite(g, 0.4, 7, 0.4, 0, 6.2, 3.3, BOIS); boite(g, 3.2, 0.4, 0.4, 0, 8.2, 3.3, BOIS);
    boite(g, 1.2, 0.5, 0.8, 4.2, 3.45, 1.2, '#B3261E');
    const drapeau = (type, px) => {
      boite(g, 0.15, 9, 0.15, px, 4.5, -3.8, BOIS);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 2), new THREE.MeshLambertMaterial({ map: texBanniere(type), side: THREE.DoubleSide }));
      f.position.set(px + (px < 0 ? 0.85 : -0.85), 7.8, -3.8); g.add(f); return f;
    };
    S._drapeaux = [drapeau('roi', -6.4), drapeau('croix', 6.4)];
    drap.material = mat('#8E1B1B');
    bernard = figure(LOOK_BERNARD); bernard.position.set(0, 3.2, -3.0); bernard.rotation.y = Math.PI; g.add(bernard);
  }
  function construireFoule() {
    const rnd = alea(33), gens = [], exclus = [[-58.5, -169, 3], [-43, -163, 2.5], [62, -212, 3], [-62.5, -166.5, 1.6], [52, -207, 2.2]];
    let essais = 0;
    while (gens.length < 1150 && essais++ < 40000) {
      const x = -155 + rnd() * 190, z = -268 + rnd() * 110;
      if (z > -160 && Math.abs(x - EST.x) < 10) continue;
      if (exclus.some(([a, b, r]) => Math.hypot(x - a, z - b) < r)) continue;
      const d = Math.hypot(x - EST.x, z - EST.z);
      if (rnd() > Math.exp(-(d - 15) / 70)) continue;
      if (gens.some(p => Math.abs(p[0] - x) < 0.7 && Math.abs(p[1] - z) < 0.7)) continue;
      gens.push([x, z, 0]);
    }
    for (let k = 0; k < 16; k++) { const x = 34 + rnd() * 26, z = -245 + rnd() * 60; gens.push([x, z, 1]); }
    const n = gens.length;
    const profil = [[0.3, 0], [0.27, 0.45], [0.2, 0.92], [0.23, 1.2], [0.21, 1.33], [0.1, 1.42], [0.01, 1.44]].map(([a, b]) => new THREE.Vector2(a, b));
    const corps = new THREE.InstancedMesh(new THREE.LatheGeometry(profil, 8), new THREE.MeshLambertMaterial(), n);
    const tetes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.12, 8, 6).translate(0, 1.52, 0), new THREE.MeshLambertMaterial(), n);
    const HABITS = ['#7A5A3A', '#6B6150', '#8E2F24', '#3E5F7A', '#5C6B4A', '#9A8A6A', '#4A4038', '#A0763A', '#6E2A3A', '#EDE8DC', '#26221F', '#7A7F84'].map(col);
    const PEAUX = ['#E8C0A0', '#DDB08A', '#D2A27A', '#C99670'].map(col);
    const chevaux = [];
    const base = [];
    gens.forEach(([x, z, cavalier], i) => {
      const y = hauteur(x, z) + (cavalier ? 1.1 : 0), s = 0.9 + rnd() * 0.18, rot = Math.atan2(EST.x - x, EST.z - z) + (rnd() - 0.5) * 0.5;
      base.push({ x, y, z, s, rot, ph: rnd() * 6.28 });
      corps.setColorAt(i, cavalier ? col('#8A8D90') : HABITS[Math.floor(rnd() * HABITS.length)]);
      tetes.setColorAt(i, rnd() < 0.3 && !cavalier ? HABITS[Math.floor(rnd() * 6)] : PEAUX[Math.floor(rnd() * PEAUX.length)]);
      if (cavalier) chevaux.push({ x, y: y - 1.1, z, rot });
    });
    foule = { corps, tetes, base, agitation: 0 };
    majFoule(0);
    [corps, tetes].forEach(m => { m.castShadow = true; m.receiveShadow = true; scene.add(m); });
    // chevaux
    const parts = [new THREE.BoxGeometry(0.5, 0.55, 1.5).translate(0, 1.15, 0), new THREE.BoxGeometry(0.26, 0.72, 0.3).rotateX(0.55).translate(0, 1.58, 0.78), new THREE.BoxGeometry(0.22, 0.24, 0.55).rotateX(0.6).translate(0, 1.86, 1.12)];
    [[-0.17, -0.55], [0.17, -0.55], [-0.17, 0.55], [0.17, 0.55]].forEach(([a, b]) => parts.push(new THREE.BoxGeometry(0.12, 0.95, 0.12).translate(a, 0.47, b)));
    parts.push(new THREE.BoxGeometry(0.08, 0.55, 0.08).rotateX(-0.4).translate(0, 1.1, -0.82));
    const gc = fusion(parts), hm = new THREE.InstancedMesh(gc, new THREE.MeshLambertMaterial(), chevaux.length), M = new THREE.Matrix4();
    const ROBES = ['#6B4A2E', '#3A2A1E', '#8A6A4A', '#D8D0C0', '#4A3A30'].map(col);
    chevaux.forEach((c, i) => { M.compose(new THREE.Vector3(c.x, c.y, c.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, c.rot, 0)), new THREE.Vector3(1, 1, 1)); hm.setMatrixAt(i, M); hm.setColorAt(i, ROBES[i % ROBES.length]); });
    hm.castShadow = true; scene.add(hm);
  }
  const Mf = new THREE.Matrix4(), Qf = new THREE.Quaternion(), Ef = new THREE.Euler(), Vf = new THREE.Vector3(), Sf = new THREE.Vector3();
  function majFoule(t) {
    const a = foule.agitation;
    foule.base.forEach((b, i) => {
      const saut = a > 0 ? Math.max(0, Math.sin(t * 7 + b.ph)) * 0.28 * a : 0;
      Ef.set(0, b.rot + (a > 0 ? Math.sin(t * 3 + b.ph) * 0.15 * a : 0), 0); Qf.setFromEuler(Ef);
      Vf.set(b.x, b.y + saut, b.z); Sf.set(b.s, b.s, b.s);
      Mf.compose(Vf, Qf, Sf); foule.corps.setMatrixAt(i, Mf); foule.tetes.setMatrixAt(i, Mf);
    });
    foule.corps.instanceMatrix.needsUpdate = true; foule.tetes.instanceMatrix.needsUpdate = true;
  }
  function construireCampement() {
    const rnd = alea(51), tentes = [];
    for (let k = 0; k < 9; k++) tentes.push([-178 - rnd() * 22, -250 + k * 10 + rnd() * 4]);
    for (let k = 0; k < 8; k++) tentes.push([78 + rnd() * 25, -255 + k * 11 + rnd() * 4]);
    const tm = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 6).translate(0, 0.5, 0), new THREE.MeshLambertMaterial(), tentes.length), M = new THREE.Matrix4();
    const TEINTES = ['#E8E1D0', '#B83A2E', '#2F5E9E', '#C9A13A', '#E8E1D0', '#6E2A3A'].map(col);
    tentes.forEach(([x, z], i) => {
      const r = 2.6 + rnd() * 1.4, h = 3.2 + rnd() * 1.5;
      M.compose(new THREE.Vector3(x, hauteur(x, z) - 0.2, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rnd() * 3, 0)), new THREE.Vector3(r, h, r)); tm.setMatrixAt(i, M); tm.setColorAt(i, TEINTES[i % TEINTES.length]);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshLambertMaterial({ color: TEINTES[(i + 2) % TEINTES.length], side: THREE.DoubleSide }));
      f.position.set(x + 0.45, hauteur(x, z) + h + 0.9, z); scene.add(f);
      const m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 5), mat('#6A4A2A')); m.position.set(x, hauteur(x, z) + h + 0.5, z); scene.add(m);
    });
    tm.castShadow = true; tm.receiveShadow = true; scene.add(tm);
  }
  function construireVegetation() {
    const rnd = alea(77), arbres = [];
    let essais = 0;
    while (arbres.length < 420 && essais++ < 30000) {
      const a = rnd() * Math.PI * 2, r = 120 + Math.pow(rnd(), 0.7) * 900, x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (Math.abs(z) < 58 && x > -345 && x < 160) continue;
      if (x > -190 && x < 110 && z > -280 && z < -140) continue;
      if (Math.abs(x - rivX(z)) < 14) continue;
      if (Object.values(POINTS).some(p => Math.hypot(x - p.pos[0], z - p.pos[1]) < 45)) continue;
      if (Math.abs(z + 20) < 30 && x > 150 && x < 620) continue;
      const f = fbm(x * 0.003 + 11, z * 0.003 - 4);
      if (rnd() > 0.25 + f * 0.9) continue;
      arbres.push([x, z, f]);
    }
    const n = arbres.length;
    const troncs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.25, 0.35, 1, 6).translate(0, 0.5, 0), mat('#5A4030'), n);
    const houppiers = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshLambertMaterial({ flatShading: true }), n);
    const VERTS = ['#8DAA5A', '#7A9A4C', '#9BB96A', '#6F8E4C', '#A8BE74'].map(col), FLEURS = col('#EDE3E0'), M = new THREE.Matrix4();
    arbres.forEach(([x, z, f], i) => {
      const y = hauteur(x, z), h = 3 + rnd() * 4, r = 2 + rnd() * 2.2;
      M.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(1, h, 1)); troncs.setMatrixAt(i, M);
      M.compose(new THREE.Vector3(x, y + h + r * 0.6, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rnd(), rnd(), 0)), new THREE.Vector3(r, r * 1.1, r)); houppiers.setMatrixAt(i, M);
      houppiers.setColorAt(i, Math.hypot(x, z) < 350 && rnd() < 0.3 ? FLEURS : VERTS[Math.floor(rnd() * VERTS.length)]);
    });
    [troncs, houppiers].forEach(m => { m.castShadow = true; m.receiveShadow = true; scene.add(m); });
    // vignes sur le versant sud
    const ceps = [];
    for (let z = 70; z < 132; z += 3.2) for (let x = -150; x < 55; x += 1.8) if (rnd() < 0.8) ceps.push([x + rnd() * 0.3, z]);
    const cm = new THREE.InstancedMesh(new THREE.BoxGeometry(0.35, 0.9, 0.35).translate(0, 0.45, 0), mat('#5E7A3A'), ceps.length);
    ceps.forEach(([x, z], i) => { M.compose(new THREE.Vector3(x, hauteur(x, z), z), new THREE.Quaternion(), new THREE.Vector3(1, 1, 1)); cm.setMatrixAt(i, M); });
    scene.add(cm);
  }
  function construirePersonnages() {
    for (const id in PNJ) {
      const p = PNJ[id], def = PERSONNAGES.find(x => x.id === id); if (!def) continue;
      const look = Object.assign({}, def.look, p.manteau ? { manteau: p.manteau } : {});
      const g = figure(look, p.acc);
      const y = p.estrade ? estradeY : hauteur(p.x, p.z);
      g.position.set(p.x, y, p.z);
      const vers = p.estrade ? POINTS.estrade.pos : POINTS[{ aubert: 'route', renaud: 'basilique', etienne: 'bourg', hugues: 'champ', odon: 'foule' }[id]].pos;
      g.rotation.y = Math.atan2(vers[0] - p.x, vers[1] - p.z);
      scene.add(g); personnages[id] = g;
      const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 2.2, 8), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(p.x, y + 1.1, p.z); hit.userData.perso = id; scene.add(hit); cibles.push(hit);
      const mk = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), new THREE.MeshBasicMaterial({ color: 0xE3B341 }));
      mk.position.set(p.x, y + 2.25, p.z); mk.userData.y0 = y + 2.25; mk.visible = false; scene.add(mk); marqueurs[id] = mk;
    }
  }

  /* ---------- Caméra ---------- */
  function orienterVers(pos, cible) {
    const dx = cible.x - pos.x, dy = cible.y - pos.y, dz = cible.z - pos.z;
    return { yaw: Math.atan2(dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) };
  }
  function pointMonde(id) {
    const p = POINTS[id];
    const pos = new THREE.Vector3(p.pos[0], hauteur(p.pos[0], p.pos[1]) + (p.haut || 1.7), p.pos[1]);
    const cible = new THREE.Vector3(p.cible[0], hauteur(p.cible[0], p.cible[2]) + p.cible[1], p.cible[2]);
    if (id === 'estrade' || id === 'foule') cible.y = estradeY + p.cible[1] - 3.2;
    return { pos, cible };
  }
  const angle = (a, b, t) => { let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * t; };
  S.allerA = (id, opts) => {
    opts = opts || {};
    libre = false; S.promenade(false);
    const { pos, cible } = pointMonde(id), o = orienterVers(pos, cible);
    if (opts.immediat) { cam.pos.copy(pos); cam.yaw = o.yaw; cam.pitch = o.pitch; cam.trajet = null; camera.fov = POINTS[id].fov || 55; camera.updateProjectionMatrix(); return; }
    const d = cam.pos.distanceTo(pos), mil = cam.pos.clone().lerp(pos, 0.5); mil.y += Math.min(160, d * 0.22);
    cam.trajet = { de: cam.pos.clone(), mil, vers: pos, yaw0: cam.yaw, pitch0: cam.pitch, yaw1: o.yaw, pitch1: o.pitch, fov0: camera.fov, fov1: POINTS[id].fov || 55, t: 0, duree: Math.min(5.5, Math.max(1.6, d / 55)) * (opts.rapide ? 0.25 : 1), fin: opts.fin };
  };
  function majCamera(dt) {
    const tr = cam.trajet;
    if (tr) {
      tr.t = Math.min(1, tr.t + dt / tr.duree);
      const t = tr.t, e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, u = 1 - e;
      cam.pos.set(u * u * tr.de.x + 2 * u * e * tr.mil.x + e * e * tr.vers.x, u * u * tr.de.y + 2 * u * e * tr.mil.y + e * e * tr.vers.y, u * u * tr.de.z + 2 * u * e * tr.mil.z + e * e * tr.vers.z);
      cam.yaw = angle(tr.yaw0, tr.yaw1, e); cam.pitch = tr.pitch0 + (tr.pitch1 - tr.pitch0) * e;
      camera.fov = tr.fov0 + (tr.fov1 - tr.fov0) * e; camera.updateProjectionMatrix();
      if (t >= 1) { cam.trajet = null; if (tr.fin) tr.fin(); }
    } else if (libre) {
      const c = S.commande, v = (c.vite ? 9 : 4) * dt;
      if (c.gauche) cam.yaw -= 1.6 * dt; if (c.droite) cam.yaw += 1.6 * dt;
      const av = (c.avant ? 1 : 0) - (c.arriere ? 1 : 0);
      if (av) {
        const nx = cam.pos.x + Math.sin(cam.yaw) * v * av, nz = cam.pos.z - Math.cos(cam.yaw) * v * av;
        const dansEglise = nx > -318 && nx < -212 && Math.abs(nz) < 20;
        if (!dansEglise && Math.abs(nx) < 1100 && Math.abs(nz) < 1100) { cam.pos.x = nx; cam.pos.z = nz; }
      }
      cam.pos.y += (hauteur(cam.pos.x, cam.pos.z) + 1.7 - cam.pos.y) * Math.min(1, dt * 8);
      let proche = null, dmin = 5;
      for (const id in personnages) { const p = personnages[id].position, d = Math.hypot(p.x - cam.pos.x, p.z - cam.pos.z) + Math.abs(p.y - cam.pos.y + 1.7) * 0.5; if (d < dmin) { dmin = d; proche = id; } }
      if (proche !== dernierProche) { dernierProche = proche; if (S.surProximite) S.surProximite(proche); }
    }
    const cp = Math.cos(cam.pitch);
    camera.position.copy(cam.pos);
    camera.lookAt(cam.pos.x + Math.sin(cam.yaw) * cp, cam.pos.y + Math.sin(cam.pitch), cam.pos.z - Math.cos(cam.yaw) * cp);
  }
  S.promenade = actif => {
    libre = actif; for (const k in S.commande) S.commande[k] = false;
    if (actif && camera) { camera.fov = 60; camera.updateProjectionMatrix(); cam.pos.y = hauteur(cam.pos.x, cam.pos.z) + 1.7; }
    if (!actif && dernierProche) { dernierProche = null; if (S.surProximite) S.surProximite(null); }
  };
  function brancherControles(el) {
    let dep = null, bouge = 0;
    el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); dep = { x: e.clientX, y: e.clientY }; bouge = 0; el.classList.add('dragging'); });
    el.addEventListener('pointermove', e => {
      if (!dep) return;
      const dx = e.clientX - dep.x, dy = e.clientY - dep.y; dep = { x: e.clientX, y: e.clientY }; bouge += Math.abs(dx) + Math.abs(dy);
      if (cam.trajet) return;
      cam.yaw -= dx * 0.0042; cam.pitch = Math.max(-1.1, Math.min(1.1, cam.pitch + dy * 0.0036));
      if (S.surRegard) S.surRegard();
    });
    const fin = e => { if (dep && bouge < 6) cliquer(e); dep = null; el.classList.remove('dragging'); };
    el.addEventListener('pointerup', fin); el.addEventListener('pointercancel', () => { dep = null; el.classList.remove('dragging'); });
    el.addEventListener('wheel', e => { e.preventDefault(); camera.fov = Math.max(30, Math.min(72, camera.fov + e.deltaY * 0.02)); camera.updateProjectionMatrix(); }, { passive: false });
  }
  const ray = new THREE.Raycaster(), souris = new THREE.Vector2();
  function cliquer(e) {
    const r = renderer.domElement.getBoundingClientRect();
    souris.set((e.clientX - r.left) / r.width * 2 - 1, -(e.clientY - r.top) / r.height * 2 + 1);
    ray.setFromCamera(souris, camera);
    const h = ray.intersectObjects(cibles)[0];
    if (h && surClicPerso) surClicPerso(h.object.userData.perso);
  }

  /* ---------- Le sermon ---------- */
  S.sermon = (lignes, rapide, surLigne, surFin) => {
    S.arreterSermon();
    const dureeLigne = rapide ? 0.9 : 6.2;
    sermon = { t: 0, i: -1, lignes, dureeLigne, surLigne, surFin, fin: lignes.length * dureeLigne + (rapide ? 0.5 : 3.5) };
  };
  S.arreterSermon = () => { sermon = null; if (foule) { foule.agitation = 0; majFoule(0); } if (bernard) { bernard.userData.brasG.rotation.set(0, 0, -0.12); bernard.userData.brasD.rotation.set(0, 0, 0.12); } };
  function lancerCroix(n, blanc) {
    if (!texCroixCache) texCroixCache = texCroix();
    for (let k = 0; k < n; k++) {
      let c = croix.find(o => !o.visible);
      if (!c) { if (croix.length > 120) return; c = new THREE.Sprite(new THREE.SpriteMaterial({ map: texCroixCache, transparent: true })); c.scale.set(0.5, 0.5, 1); scene.add(c); croix.push(c); }
      const b = foule.base[Math.floor(Math.random() * Math.min(420, foule.base.length))];
      c.material.color.set(blanc ? 0xEDE8DC : 0xFFFFFF);
      c.userData = { de: new THREE.Vector3(EST.x + (Math.random() - 0.5) * 3, estradeY + 1.6, EST.z - 1.5), vers: new THREE.Vector3(b.x, b.y + 1.8, b.z), t: 0, duree: 1.4 + Math.random() * 1.2, haut: 5 + Math.random() * 6 };
      c.visible = true; c.material.opacity = 1;
    }
  }
  function majSermon(dt, t) {
    for (const c of croix) if (c.visible) {
      const u = c.userData; u.t += dt / u.duree;
      const k = Math.min(1, u.t); c.position.lerpVectors(u.de, u.vers, k); c.position.y += Math.sin(k * Math.PI) * u.haut;
      if (u.t > 1) c.material.opacity = Math.max(0, 1 - (u.t - 1) * 2); if (u.t > 1.5) c.visible = false;
    }
    if (!sermon) return;
    const s = sermon; s.t += dt;
    const i = Math.min(s.lignes.length - 1, Math.floor(s.t / s.dureeLigne));
    if (i !== s.i) { s.i = i; if (s.surLigne) s.surLigne(i, s.lignes[i]); }
    const l = s.lignes[i];
    const parle = !l.foule && !l.croix;
    const bg = bernard.userData.brasG, bd = bernard.userData.brasD;
    const geste = parle ? 0.9 + Math.sin(t * 2.2) * 0.35 : l.croix ? 1.6 + Math.sin(t * 6) * 0.3 : 2.3;
    bd.rotation.x = -geste; bg.rotation.x = parle ? -0.3 - Math.sin(t * 1.7) * 0.2 : -geste * 0.9;
    foule.agitation += ((l.foule || l.croix ? 1 : 0.08) - foule.agitation) * Math.min(1, dt * 2);
    majFoule(t);
    if (l.foule && Math.random() < dt * 6) lancerCroix(1);
    if (l.croix && Math.random() < dt * 14) lancerCroix(2, Math.random() < 0.35);
    if (s.t >= s.fin) { const f = s.surFin; S.arreterSermon(); if (f) f(); }
  }

  /* ---------- Marqueurs, pause, capture ---------- */
  S.marquer = ids => { for (const id in marqueurs) marqueurs[id].visible = (ids || []).includes(id); };
  S.pause = p => { enPause = p; };
  S.capture = (id, l, hh) => {
    const garde = { pos: cam.pos.clone(), yaw: cam.yaw, pitch: cam.pitch };
    const { pos, cible } = pointMonde(id || 'survol'), o = orienterVers(pos, cible);
    cam.pos.copy(pos); cam.yaw = o.yaw; cam.pitch = o.pitch;
    const taille = renderer.getSize(new THREE.Vector2()), ratio = renderer.getPixelRatio(), aspect = camera.aspect, fov = camera.fov;
    renderer.setPixelRatio(1); renderer.setSize(l || 1600, hh || 1000, false); camera.aspect = (l || 1600) / (hh || 1000); camera.fov = POINTS[id || 'survol'].fov || 55; camera.updateProjectionMatrix();
    majCamera(0); renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL('image/jpeg', 0.86);
    renderer.setPixelRatio(ratio); renderer.setSize(taille.x, taille.y, false); camera.aspect = aspect; camera.fov = fov; camera.updateProjectionMatrix();
    cam.pos.copy(garde.pos); cam.yaw = garde.yaw; cam.pitch = garde.pitch;
    return url;
  };
  S.modeSecours = () => {
    ['allerA', 'marquer', 'pause', 'promenade', 'arreterSermon'].forEach(k => { S[k] = () => {}; });
    S.sermon = (lignes, rapide, surLigne, surFin) => {
      let i = 0; const pas = () => { if (i < lignes.length) { surLigne(i, lignes[i]); i++; setTimeout(pas, rapide ? 150 : 4000); } else if (surFin) surFin(); }; pas();
    };
    S.secours = true;
  };

  /* ---------- Initialisation ---------- */
  S.init = (el, opts) => {
    conteneur = el; surClicPerso = opts.surClicPerso;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(el.clientWidth, el.clientHeight);
    const ombres = opts.ombres !== false;
    renderer.shadowMap.enabled = ombres; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xD6E2E8, 0.00085);
    camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.3, 9000);
    scene.add(new THREE.HemisphereLight(0xDDE8F2, 0x6A5A40, 0.72));
    soleil = new THREE.DirectionalLight(0xFFF1D8, 0.78); soleil.position.set(-80 - 230, 420, -120 + 300); soleil.target.position.set(-80, 20, -120);
    if (ombres) {
      soleil.castShadow = true; soleil.shadow.mapSize.set(2048, 2048);
      const sc = soleil.shadow.camera; sc.left = -300; sc.right = 300; sc.top = 300; sc.bottom = -300; sc.near = 50; sc.far = 1200; soleil.shadow.bias = -0.0008;
    }
    scene.add(soleil); scene.add(soleil.target);
    construireCiel();
    construireTerrain();
    ruban([[1150, -420], [880, -300], [660, -170], [520, -90], [420, -40], [300, -12], [200, -4], [150, 0], [60, 0], [-220, 0]], 5, '#B9A27A', 0.25, 4);
    ruban([[-28, -46], [-34, -90], [-45, -125], [-52, -150]], 3.5, '#B3A07A', 0.2, 2);
    const rz = []; for (let z = -1250; z <= 1250; z += 50) rz.push([rivX(z), z]);
    ruban(rz, 13, '#6F9FB2', 0.6, 8);
    construireBasilique(); construireBourg(); construireEstrade(); construireFoule(); construireCampement(); construireVegetation(); construirePersonnages();
    brancherControles(renderer.domElement);
    S.allerA('route', { immediat: true });
    horloge = new THREE.Clock();
    const redim = () => { const w = el.clientWidth, hh = el.clientHeight; if (!w || !hh) return; renderer.setSize(w, hh); camera.aspect = w / hh; camera.updateProjectionMatrix(); };
    if (window.ResizeObserver) new ResizeObserver(redim).observe(el); else window.addEventListener('resize', redim);
    const boucle = () => {
      requestAnimationFrame(boucle);
      const dt = Math.min(0.1, horloge.getDelta()), t = horloge.elapsedTime;
      if (enPause) return;
      majCamera(dt); majSermon(dt, t);
      for (const id in marqueurs) if (marqueurs[id].visible) { const m = marqueurs[id]; m.rotation.y = t * 2; m.position.y = m.userData.y0 + Math.sin(t * 3) * 0.08; }
      if (S._drapeaux) S._drapeaux.forEach((f, i) => { f.rotation.y = Math.sin(t * 1.3 + i) * 0.25; });
      renderer.render(scene, camera);
    };
    boucle();
  };
  S.hauteur = hauteur;
  S.POINTS = POINTS;
  S.enMouvement = () => !!cam.trajet;
  window.Scene3D = S;
})();
