/* Vézelay, 31 mars 1146 — la colline en 3D (Three.js r150, script classique).
   Campagne de printemps, basilique romane, bourg fortifié, champ de l'assemblée, estrade, foule, personnages animés,
   sermon, caméra guidée d'étape en étape et promenade libre. Reconstitution imaginée et simplifiée.
   Les modèles (textures, personnages, chevaux, arbres) sont fabriqués par modeles.js. */
(function () {
  'use strict';
  const M = window.Modeles, TAU = Math.PI * 2, PI = Math.PI;
  const HAUTE = /haute/.test(location.search); // tests : pas de baisse automatique de la qualité

  /* ---------- Outils ---------- */
  const smooth = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function hash(i, j) { let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
  function bruit(x, y) {
    const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y) { let s = 0, a = 0.5, f = 1; for (let o = 0; o < 4; o++) { s += a * bruit(x * f, y * f); f *= 2.03; a *= 0.5; } return s / 0.94; }
  const alea = M.alea, col = c => new THREE.Color(c);

  /* ---------- Relief : la « colline éternelle » ---------- */
  const rivX = z => 640 + 70 * Math.sin(z * 0.0042) + 30 * Math.sin(z * 0.011);
  function hauteur(x, z) {
    // crête allongée est-ouest : plateau du bourg (de x = -340 à 140), flancs raides ; la rue monte vers la basilique (à l'ouest)
    const dx = x < -60 ? Math.max(0, -60 - x - 280) : Math.max(0, x + 60 - 200);
    const dz = Math.max(0, Math.abs(z) - 38);
    let colline = 70 * Math.exp(-(dx * dx) / 13225) * Math.exp(-(dz * dz) / 13924);
    colline *= 0.64 + 0.36 * smooth(150, -230, x);
    // champ de l'assemblée : pente douce au nord, sous l'estrade
    const w = smooth(-195, -165, x) * (1 - smooth(50, 85, x)) * smooth(-305, -268, z) * (1 - smooth(-142, -118, z));
    colline += ((30 + (z + 150) * 0.2) - colline) * w;
    const d = Math.hypot(x, z * 0.9);
    const lointain = smooth(480, 1300, d) * (30 + 55 * fbm(x * 0.0016 + 3, z * 0.0016 - 1));
    const ondul = 7 * (fbm(x * 0.004 + 7, z * 0.004 + 2) - 0.5) * (1 - Math.min(1, colline / 45));
    const vallee = -9 * Math.exp(-Math.pow((x - rivX(z)) / 110, 2));
    return colline + lointain + ondul + vallee;
  }
  const foret = (x, z) => smooth(0.56, 0.62, fbm(x * 0.003 + 11, z * 0.003 - 4)) * smooth(430, 520, Math.hypot(x + 60, z));
  const ROUTE = [[1150, -420], [880, -300], [660, -170], [520, -90], [420, -40], [300, -12], [200, -4], [150, 0], [60, 0], [-170, 0]];
  const SENTIER = [[-28, -46], [-34, -90], [-45, -125], [-52, -150]];
  function distPolyligne(pts, x, z) {
    let d = 1e9;
    for (let i = 1; i < pts.length; i++) {
      const [ax, az] = pts[i - 1], [bx, bz] = pts[i], vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz)));
      d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t));
    }
    return d;
  }

  /* ---------- Points de vue, personnages ---------- */
  const EST = { x: -60, z: -150 };
  const POINTS = {
    route: { pos: [760, -222], haut: 1.8, fov: 26, cible: [-60, -6, 0] },
    basilique: { pos: [-176, 3], cible: [-228, 14, 0] },
    bourg: { pos: [-122, -64], cible: [-60, 2, -215] },
    champ: { pos: [38, -226], haut: 2.5, cible: [-55, 5, -175] },
    estrade: { pos: [-43, -163], cible: [-55, 4.6, -150] },
    foule: { pos: [-58.8, -162.5], haut: 3.3, fov: 40, cible: [-60, 4.7, -153] },
    survol: { pos: [330, -520], haut: 230, cible: [-90, 10, -70] }
  };
  const PNJ = {
    aubert: { x: 746.5, z: -219.4 },
    renaud: { x: -190, z: 2.5 },
    etienne: { x: -112, z: -72 },
    hugues: { x: 32, z: -224.5 },
    louis: { x: -55.8, z: -149.3, estrade: true },
    alienor: { x: -53.4, z: -149.6, estrade: true },
    odon: { x: -63.6, z: -152.3, estrade: true, vers: 'foule' } // le chapelain du roi, sur l'estrade
  };
  // costumes : moines noirs de Vézelay (bénédictins), moines blancs de Clairvaux (cisterciens), chevalier en haubert, rois, pèlerin
  const MOINE = { longueur: 'traine', manches: 'larges', coiffe: 'tonsure', corde: true };
  const TENUES = {
    aubert: { tunique: '#7A5A3A', longueur: 'courte', chausses: '#5E5446', ceinture: '#4A3422', coiffe: 'capuche', coiffeCol: '#8A6A40', pelerine: true, acc: ['baton', 'besace'], age: 45 },
    renaud: Object.assign({ tunique: '#2A2623', capuchonDos: '#2A2623', ceinture: '#1A1714', pose: 'mains', age: 50 }, MOINE),
    etienne: Object.assign({ tunique: '#E4DED0', capuchonDos: '#E4DED0', ceinture: '#CFC6B2', pose: 'mains', age: 32 }, MOINE),
    etienne2: Object.assign({ tunique: '#E4DED0', capuchonDos: '#E4DED0', ceinture: '#CFC6B2', pose: 'mains', age: 36 }, MOINE),
    hugues: { tunique: '#6E4A3A', cotte: true, longueur: 'mi', chausses: '#4A4038', manteau: '#8E2F24', coiffe: 'casque', acc: ['epee', 'ecu'], age: 35, ceinture: '#3A2A1E' },
    louis: { tunique: '#2F4F8E', longueur: 'longue', bordure: '#D9A93A', manteau: '#7A1F2A', coiffe: 'couronne', ceinture: '#3A2A1E', croix: true, age: 25, yeux: '#4A6A8A' },
    alienor: { sexe: 'f', tunique: '#8E2F3A', longueur: 'traine', manches: 'pendantes', bordure: '#D9A93A', manteau: '#24365E', coiffe: 'reine', ceinture: '#D9A93A', age: 24, yeux: '#5A6A4A' },
    odon: Object.assign({ tunique: '#2A2623', capuchonDos: '#2A2623', ceinture: '#1A1714', acc: ['tablette'], age: 35 }, MOINE),
    odon2: Object.assign({ tunique: '#2A2623', capuchonDos: '#2A2623', ceinture: '#1A1714', age: 37, pose: 'mains' }, MOINE),
    ephraim: { tunique: '#3E4F6A', longueur: 'mi', chausses: '#4A4038', ceinture: '#5A3A22', manteau: '#6A5A48', manteauCourt: true, coiffe: 'pointu', coiffeCol: '#C9A13A', age: 13, taille: 0.88 },
    bernard: Object.assign({ tunique: '#E4DED0', capuchonDos: '#E4DED0', ceinture: '#CFC6B2', maigre: true, age: 56, cheveux: '#B8B0A4', peau: '#DDB290', pose: 'mains' }, MOINE)
  };
  function tenue(id, i) {
    const def = (typeof PERSONNAGES !== 'undefined' ? PERSONNAGES : []).find(p => p.id === id), look = def ? def.look : {};
    return Object.assign({ peau: look.peau || '#E0B490', cheveux: look.cheveux, barbe: look.barbe, graine: 11 + i * 7 }, TENUES[id] || TENUES.odon);
  }

  /* ---------- État ---------- */
  const S = {};
  let renderer, scene, camera, conteneur, soleil, hemi, horloge, ciel, estradeY = 0;
  let enPause = false, surClicPerso = null, parleur = null;
  const personnages = {}, cibles = [], marqueurs = {};
  const cam = { pos: new THREE.Vector3(), yaw: 0, pitch: 0, trajet: null, focus: new THREE.Vector3() };
  let foule = null, sermon = null, croix = [], texCroixCache = null, bernard = null, drapeaux = [], marcheurs = null, oiseaux = null, fumees = [], herbes = [];
  let libre = false, dernierProche = null;
  const OBSTACLES = [], MURAILLE = [];
  S.commande = { avant: false, arriere: false, gauche: false, droite: false, vite: false };
  const DIR_SOLEIL = new THREE.Vector3(-230, 400, 300).normalize();

  /* ---------- Outils de construction ---------- */
  const MAT = {};
  function materiaux() {
    MAT.pierre = M.matMonde('#E8DABA', M.TX.pierre, 6.5);
    MAT.pierreS = M.matMonde('#CDBE9C', M.TX.pierre, 6.5);
    MAT.moellon = M.matMonde('#D9CBAB', M.TX.moellon, 4.2);
    MAT.maisons = M.matMonde('#D9CBAB', M.TX.moellon, 4.2); // à part : les maisons ont une teinte par instance
    MAT.tuiles = M.matMonde('#A8674C', M.TX.tuiles, 2.6);
    MAT.tuilesT = M.matMonde('#A8674C', M.TX.tuiles, 2.6, { tourne: true });
    MAT.pave = M.matMonde('#C4B595', M.TX.moellon, 2.6);
    MAT.chemin = M.matMonde('#BBA57C', M.TX.sol, 3.5);
    MAT.sombre = new THREE.MeshLambertMaterial({ color: '#2B2724' });
    MAT.bois = M.matiere('bois:#6B4A2E');
    MAT.boisClair = M.matiere('bois:#94724A');
    MAT.volet = M.matiere('bois:#5E6F58');
  }
  function maille(geo, mat, parent, x, y, z, ry, ombre) {
    const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); if (ry) m.rotation.y = ry;
    m.castShadow = ombre !== false; m.receiveShadow = true; parent.add(m); return m;
  }
  const bloc = (parent, mat, w, h, d, x, y, z, ry) => maille(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z, ry);
  function toit(parent, larg, haut, long, x, y, z, axeX, murs) { // pignons en pierre, pans en tuiles
    const g = M.prisme(larg, haut, long); if (axeX) g.rotateY(PI / 2);
    return maille(g, [murs || MAT.pierre, axeX ? MAT.tuiles : MAT.tuilesT], parent, x, y, z);
  }
  const GEO = {};
  function arcade(w, h, prof) { // ouverture en plein cintre (fenêtres, portes)
    const k = 'a' + w + 'x' + h + 'x' + prof; if (GEO[k]) return GEO[k];
    const f = new THREE.Shape(); f.moveTo(-w / 2, 0); f.lineTo(w / 2, 0); f.lineTo(w / 2, h - w / 2); f.absarc(0, h - w / 2, w / 2, 0, PI, false); f.lineTo(-w / 2, 0);
    return (GEO[k] = new THREE.ExtrudeGeometry(f, { depth: prof, bevelEnabled: false, curveSegments: 10 }));
  }
  const cintre = (r, t) => GEO['c' + r + t] || (GEO['c' + r + t] = new THREE.TorusGeometry(r, t, 5, 16, PI));
  const BOITE = new THREE.BoxGeometry(1, 1, 1), BOITE_B = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  // lot d'objets identiques : un seul objet instancié par géométrie
  function Lot() { this.items = new Map(); }
  const _o = new THREE.Object3D();
  Lot.prototype.ajout = function (cle, geo, mat, x, y, z, ry, sx, sy, sz, rx) {
    let it = this.items.get(cle); if (!it) this.items.set(cle, it = { geo, mat, m: [] });
    _o.position.set(x, y, z); _o.rotation.set(rx || 0, ry || 0, 0); _o.scale.set(sx || 1, sy || sx || 1, sz || sx || 1); _o.updateMatrix();
    it.m.push(_o.matrix.clone());
  };
  Lot.prototype.poser = function (parent, ombre) {
    this.items.forEach(it => {
      const im = new THREE.InstancedMesh(it.geo, it.mat, it.m.length); it.m.forEach((m, i) => im.setMatrixAt(i, m));
      im.castShadow = ombre !== false; im.receiveShadow = true; im.frustumCulled = false; parent.add(im);
    });
  };
  // fenêtre (ou baie) en plein cintre posée sur un mur : (x, y, z) au pied de la baie, ry = direction vers l'extérieur
  function fenetre(L, w, h, x, y, z, ry, mat) {
    const nx = Math.sin(ry), nz = Math.cos(ry);
    L.ajout('f' + w + 'x' + h, arcade(w, h, 0.3), mat || MAT.sombre, x - nx * 0.22, y, z - nz * 0.22, ry);
    L.ajout('c' + w, cintre(w / 2 + 0.13, 0.14), MAT.pierreS, x + nx * 0.03, y + h - w / 2, z + nz * 0.03, ry);
  }

  /* ---------- Textures dessinées de la scène ---------- */
  function texTympan() { // Christ en majesté dans une mandorle, entouré des apôtres (moitié haute de la texture)
    const c = M.toile(512, 512), x = c.getContext('2d');
    x.fillStyle = '#CDBB97'; x.fillRect(0, 0, 512, 512);
    const g = x.createRadialGradient(256, 256, 60, 256, 256, 256); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(60,45,25,0.35)'); x.fillStyle = g; x.fillRect(0, 0, 512, 256);
    x.strokeStyle = 'rgba(110,92,62,0.8)'; x.lineWidth = 5;
    for (let i = -5; i <= 5; i++) { if (!i) continue; x.beginPath(); x.moveTo(256, 120); x.lineTo(256 + i * 48, 40 + Math.abs(i) * 30); x.stroke(); }
    x.fillStyle = '#BCA780'; x.beginPath(); x.ellipse(256, 150, 58, 104, 0, 0, TAU); x.fill(); x.strokeStyle = '#8A7552'; x.lineWidth = 6; x.stroke();
    x.fillStyle = '#9C8862'; x.beginPath(); x.moveTo(236, 108); x.lineTo(276, 108); x.lineTo(298, 250); x.lineTo(214, 250); x.closePath(); x.fill();
    x.strokeStyle = '#7C6848'; x.lineWidth = 3; for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(240 + k * 7, 120); x.lineTo(224 + k * 13, 248); x.stroke(); }
    x.lineWidth = 9; x.strokeStyle = '#9C8862'; x.beginPath(); x.moveTo(238, 118); x.lineTo(200, 150); x.moveTo(274, 118); x.lineTo(312, 150); x.stroke();
    x.fillStyle = '#A8946C'; x.beginPath(); x.arc(256, 90, 17, 0, TAU); x.fill(); x.strokeStyle = '#7C6848'; x.lineWidth = 4; x.beginPath(); x.arc(256, 88, 26, PI * 1.05, PI * 1.95); x.stroke();
    for (let i = 0; i < 12; i++) {
      const cote = i < 6 ? -1 : 1, k = i % 6, px = 256 + cote * (90 + k * 30), tete = 150 + k * 16 + (k % 2) * 6;
      x.fillStyle = '#A8946C'; x.beginPath(); x.arc(px, tete, 10, 0, TAU); x.fill();
      x.strokeStyle = '#7C6848'; x.lineWidth = 3; x.beginPath(); x.arc(px, tete - 1, 15, PI * 1.1, PI * 1.9); x.stroke();
      x.fillStyle = '#9C8862'; x.beginPath(); x.moveTo(px - 11, tete + 10); x.lineTo(px + 11, tete + 10); x.lineTo(px + 15, 252); x.lineTo(px - 15, 252); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(90,72,48,0.8)'; x.lineWidth = 2; x.beginPath(); x.moveTo(px - 4, tete + 14); x.lineTo(px - 8, 250); x.moveTo(px + 4, tete + 14); x.lineTo(px + 7, 250); x.stroke();
    }
    x.fillStyle = 'rgba(80,60,35,0.25)'; x.fillRect(0, 246, 512, 10);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }
  function texBanniere(type) {
    const c = M.toile(128, 176), x = c.getContext('2d');
    if (type === 'roi') {
      x.fillStyle = '#2F4F9E'; x.fillRect(0, 0, 128, 176);
      x.fillStyle = '#E3B341';
      const lis = (cx, cy, s) => { x.beginPath(); x.ellipse(cx, cy - 6 * s, 3 * s, 8 * s, 0, 0, TAU); x.fill(); x.beginPath(); x.ellipse(cx - 6 * s, cy - 2 * s, 2.5 * s, 6 * s, -0.8, 0, TAU); x.fill(); x.beginPath(); x.ellipse(cx + 6 * s, cy - 2 * s, 2.5 * s, 6 * s, 0.8, 0, TAU); x.fill(); x.fillRect(cx - 7 * s, cy + 2 * s, 14 * s, 3 * s); x.fillRect(cx - 1.5 * s, cy + 2 * s, 3 * s, 8 * s); };
      [[32, 34], [96, 34], [64, 80], [32, 126], [96, 126]].forEach(([a, b]) => lis(a, b, 1.3));
    } else {
      x.fillStyle = '#F2EDE2'; x.fillRect(0, 0, 128, 176);
      x.fillStyle = '#B3261E'; x.fillRect(52, 12, 24, 152); x.fillRect(16, 56, 96, 24);
    }
    for (let k = 0; k < 176; k += 3) { x.fillStyle = 'rgba(0,0,0,0.04)'; x.fillRect(0, k, 128, 1); }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }
  function texCroix() {
    const c = M.toile(64, 64), x = c.getContext('2d');
    x.fillStyle = '#B3261E'; x.fillRect(26, 6, 12, 52); x.fillRect(10, 20, 44, 12);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }
  function texNuage(graine) { // cumulus : bouffées blanches, base grise
    const c = M.toile(256, 128), x = c.getContext('2d'), rnd = alea(graine);
    for (let i = 0; i < 16; i++) {
      const px = 40 + rnd() * 176, py = 50 + rnd() * 34 - Math.sin((px - 40) / 176 * PI) * 22, r = 18 + rnd() * 26;
      const g = x.createRadialGradient(px, py - r * 0.3, 2, px, py, r); g.addColorStop(0, 'rgba(255,255,255,0.95)'); g.addColorStop(0.6, 'rgba(240,244,248,0.7)'); g.addColorStop(1, 'rgba(225,232,240,0)');
      x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill();
    }
    x.globalCompositeOperation = 'source-atop';
    const b = x.createLinearGradient(0, 40, 0, 110); b.addColorStop(0, 'rgba(255,255,255,0)'); b.addColorStop(1, 'rgba(150,160,178,0.55)'); x.fillStyle = b; x.fillRect(0, 0, 256, 128);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }
  function texFumee() {
    const c = M.toile(64, 64), x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 2, 32, 32, 30);
    g.addColorStop(0, 'rgba(210,210,210,0.55)'); g.addColorStop(1, 'rgba(200,200,200,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }
  function texRayures() {
    const c = M.toile(128, 16), x = c.getContext('2d');
    for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#FFFFFF' : '#E6DED0'; x.fillRect(i * 16, 0, 16, 16); }
    const t = M.texRepetee(c, true); return t;
  }

  /* ---------- Ciel ---------- */
  function construireCiel() {
    const m = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, fog: false,
      uniforms: { haut: { value: col('#4F8AC6') }, bas: { value: col('#D8E4EA') }, dirS: { value: DIR_SOLEIL } },
      vertexShader: 'varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: ['uniform vec3 haut; uniform vec3 bas; uniform vec3 dirS; varying vec3 vDir;',
        'void main(){ vec3 d = normalize(vDir); float h = max(d.y, 0.0);',
        'vec3 c = mix(bas, haut, pow(smoothstep(0.0, 0.7, h), 0.75));',
        'float s = max(dot(d, dirS), 0.0); c += vec3(1.0, 0.93, 0.8) * (pow(s, 900.0) * 6.0 + pow(s, 14.0) * 0.18);',
        'gl_FragColor = vec4(c, 1.0);', '#include <tonemapping_fragment>', '#include <encodings_fragment>', '}'].join('\n')
    });
    ciel = new THREE.Mesh(new THREE.SphereGeometry(4000, 32, 16), m); ciel.renderOrder = -1; scene.add(ciel);
    const rnd = alea(7), tex = [texNuage(3), texNuage(5), texNuage(8)];
    for (let k = 0; k < 18; k++) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex[k % 3], transparent: true, opacity: 0.9, depthWrite: false, fog: false }));
      const a = rnd() * TAU, r = 1300 + rnd() * 1500; s.position.set(Math.cos(a) * r, 360 + rnd() * 460, Math.sin(a) * r); s.scale.set(800 + rnd() * 700, 300 + rnd() * 160, 1); ciel.add(s);
    }
  }

  /* ---------- Terrain : parcelles de printemps peintes sur une carte, détail du sol au mètre ---------- */
  const CARTE = 1024, ETENDUE = 3600, HAIES = [];
  const versCarte = (x, z) => [(x + ETENDUE / 2) / ETENDUE * CARTE, (z + ETENDUE / 2) / ETENDUE * CARTE];
  function dessinerCampagne() {
    const c = M.toile(CARTE, CARTE), x = c.getContext('2d'), rnd = alea(91), k = CARTE / ETENDUE;
    x.fillStyle = '#8CA45A'; x.fillRect(0, 0, CARTE, CARTE);
    // parcelles en lanières : blé en herbe, labours, jachères, prés
    const CULT = [['#9CB85A', 0.26], ['#8A6C4B', 0.22], ['#A8A36A', 0.13], ['#88A357', 0.2], ['#7D9D50', 0.12], ['#B6AC76', 0.07]];
    const tirer = () => { let r = rnd(); for (const [c0, p] of CULT) { if ((r -= p) < 0) return c0; } return CULT[0][0]; };
    const B = 175;
    for (let bx = -ETENDUE / 2; bx < ETENDUE / 2; bx += B) for (let bz = -ETENDUE / 2; bz < ETENDUE / 2; bz += B) {
      const cx = bx + B / 2 + (rnd() - 0.5) * 40, cz = bz + B / 2 + (rnd() - 0.5) * 40, rot = (rnd() - 0.5) * 0.35, ang = (rnd() < 0.5 ? 0 : PI / 2) + (rnd() - 0.5) * 0.4;
      const larg = 11 + rnd() * 17, [px, pz] = versCarte(cx, cz), h = B / 2 + 5;
      x.save(); x.translate(px, pz); x.rotate(rot); x.beginPath(); x.rect(-h * k, -h * k, 2 * h * k, 2 * h * k); x.clip(); x.rotate(ang);
      for (let o = -B; o < B; o += larg) { x.fillStyle = tirer(); x.fillRect(-B * k, o * k, 2 * B * k, larg * k - 0.35); }
      x.restore();
      if (rnd() < 0.6) { // haie vive autour de la pièce de terre
        const cs = [[-h, -h], [h, -h], [h, h], [-h, h]].map(([u, v]) => [cx + u * Math.cos(rot) - v * Math.sin(rot), cz + u * Math.sin(rot) + v * Math.cos(rot)]);
        x.strokeStyle = '#566E3C'; x.lineWidth = 1.4; x.beginPath();
        cs.forEach(([a, b], i) => { const [u, v] = versCarte(a, b); i ? x.lineTo(u, v) : x.moveTo(u, v); }); x.closePath(); x.stroke();
        for (let i = 0; i < 4; i++) HAIES.push([cs[i], cs[(i + 1) % 4]]);
      }
    }
    // bois et forêts (au loin)
    const F = M.toile(256, 256), fx = F.getContext('2d'), img = fx.createImageData(256, 256);
    for (let j = 0; j < 256; j++) for (let i = 0; i < 256; i++) {
      const wx = (i + 0.5) / 256 * ETENDUE - ETENDUE / 2, wz = (j + 0.5) / 256 * ETENDUE - ETENDUE / 2, a = foret(wx, wz), o = (j * 256 + i) * 4;
      img.data[o] = 88; img.data[o + 1] = 110; img.data[o + 2] = 62; img.data[o + 3] = a * 255;
    }
    fx.putImageData(img, 0, 0); x.imageSmoothingEnabled = true; x.drawImage(F, 0, 0, CARTE, CARTE);
    for (let n = 0; n < 26000; n++) {
      const wx = (rnd() - 0.5) * ETENDUE, wz = (rnd() - 0.5) * ETENDUE; if (foret(wx, wz) < 0.5) continue;
      const [u, v] = versCarte(wx, wz); x.fillStyle = rnd() < 0.5 ? 'rgba(60,82,40,0.7)' : 'rgba(128,150,84,0.6)'; x.beginPath(); x.arc(u, v, 1 + rnd() * 1.6, 0, TAU); x.fill();
    }
    // la rivière et ses prés humides
    for (let z = -ETENDUE / 2; z < ETENDUE / 2; z += 8) { const [u, v] = versCarte(rivX(z), z); x.fillStyle = 'rgba(118,152,74,0.5)'; x.beginPath(); x.arc(u, v, 34 * k, 0, TAU); x.fill(); }
    // la colline : pâtures, vignes au sud, champ de l'assemblée au nord, bourg au sommet
    const ellipse = (cx, cz, rx, rz, couleur, a0) => {
      const [u, v] = versCarte(cx, cz); x.save(); x.translate(u, v); x.scale(1, rz / rx);
      const g = x.createRadialGradient(0, 0, 0, 0, 0, rx * k); g.addColorStop(0, couleur.replace('A', a0)); g.addColorStop(0.7, couleur.replace('A', a0)); g.addColorStop(1, couleur.replace('A', 0));
      x.fillStyle = g; x.fillRect(-rx * k, -rx * k, 2 * rx * k, 2 * rx * k); x.restore();
    };
    ellipse(-100, 0, 440, 250, 'rgba(146,170,94,A)', 0.92);
    const rect = (x0, z0, x1, z1, couleur) => { const [a, b] = versCarte(x0, z0), [c2, d] = versCarte(x1, z1); x.fillStyle = couleur; x.fillRect(a, b, c2 - a, d - b); };
    rect(-160, 62, 60, 136, 'rgba(140,128,88,0.85)');
    x.strokeStyle = 'rgba(104,120,66,0.55)'; x.lineWidth = 0.5; for (let zz = 64; zz < 136; zz += 4.4) { const [a, b] = versCarte(-160, zz), [c2] = versCarte(60, zz); x.beginPath(); x.moveTo(a, b); x.lineTo(c2, b); x.stroke(); }
    ellipse(-70, -212, 125, 70, 'rgba(166,166,106,A)', 0.75);
    rect(-340, -46, 150, 46, 'rgba(172,158,122,0.9)');
    for (let n = 0; n < 60; n++) { const gx = -330 + rnd() * 470, gz = (rnd() < 0.5 ? -1 : 1) * (15 + rnd() * 26); rect(gx, gz, gx + 5 + rnd() * 8, gz + 4 + rnd() * 6, rnd() < 0.6 ? 'rgba(122,150,74,0.9)' : 'rgba(140,110,76,0.9)'); }
    // chemins
    x.strokeStyle = 'rgba(190,172,132,0.95)'; x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = 6 * k;
    x.beginPath(); ROUTE.forEach(([a, b], i) => { const [u, v] = versCarte(a, b); i ? x.lineTo(u, v) : x.moveTo(u, v); }); x.stroke();
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
    return t;
  }
  function maillageTerrain(x0, x1, z0, z1, nx, nz, abaisser) {
    const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, nx, nz); geo.rotateX(-PI / 2); geo.translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
    const P = geo.attributes.position, UV = geo.attributes.uv;
    for (let i = 0; i < P.count; i++) {
      const x = P.getX(i), z = P.getZ(i);
      P.setY(i, hauteur(x, z) - (abaisser ? abaisser(x, z) : 0));
      UV.setXY(i, (x + ETENDUE / 2) / ETENDUE, 1 - (z + ETENDUE / 2) / ETENDUE);
    }
    geo.computeVertexNormals();
    const N = geo.attributes.normal, cols = new Float32Array(P.count * 3);
    for (let i = 0; i < P.count; i++) { const s = 1 - N.getY(i), k = 1 - 0.3 * smooth(0.1, 0.45, s); cols[i * 3] = k; cols[i * 3 + 1] = k * 0.97; cols[i * 3 + 2] = k * 0.93; }
    geo.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return geo;
  }
  function matTerrain(carte, recul) {
    const m = new THREE.MeshLambertMaterial({ map: carte, vertexColors: true, polygonOffset: !!recul, polygonOffsetFactor: recul ? 2 : 0, polygonOffsetUnits: recul ? 6 : 0 });
    const u = { tSol: { value: M.TX.sol.t }, gSol: { value: M.TX.sol.gain } };
    m.onBeforeCompile = sh => {
      Object.assign(sh.uniforms, u);
      sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vPosT;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvPosT = (modelMatrix * vec4(transformed, 1.0)).xyz;');
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vPosT;\nuniform sampler2D tSol;\nuniform float gSol;')
        .replace('#include <color_fragment>', ['#include <color_fragment>',
          'vec3 d1 = pow(texture2D(tSol, vPosT.xz / 4.5).rgb, vec3(2.2)) * gSol;',
          'vec3 d2 = pow(texture2D(tSol, vPosT.xz / 41.0 + 0.37).rgb, vec3(2.2)) * gSol;',
          'diffuseColor.rgb *= mix(d1, vec3(1.0), 0.2) * mix(d2, vec3(1.0), 0.35);'].join('\n'));
    };
    return m;
  }
  function construireTerrain() {
    const carte = dessinerCampagne();
    const X0 = -720, X1 = 780, Z0 = -580, Z1 = 500;
    const pres = new THREE.Mesh(maillageTerrain(X0, X1, Z0, Z1, 250, 180), matTerrain(carte)); pres.receiveShadow = true; scene.add(pres);
    const dedans = (x, z) => 2.5 * smooth(0, 30, Math.min(x - X0, X1 - x, z - Z0, Z1 - z));
    const loin = new THREE.Mesh(maillageTerrain(-ETENDUE / 2, ETENDUE / 2, -ETENDUE / 2, ETENDUE / 2, 150, 150, dedans), matTerrain(carte, true)); loin.receiveShadow = true; scene.add(loin);
  }
  function ruban(points, larg, mat, dy, pas) { // bande qui suit le relief : route, sentier, rivière
    const courbe = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const n = Math.ceil(courbe.getLength() / (pas || 4)), pos = [], idx = [], uv = [];
    for (let i = 0; i <= n; i++) {
      const p = courbe.getPointAt(i / n), t = courbe.getTangentAt(i / n), nx = -t.z, nz = t.x;
      for (const s of [-1, 1]) { const x = p.x + nx * s * larg / 2, z = p.z + nz * s * larg / 2; pos.push(x, hauteur(x, z) + dy, z); uv.push(s < 0 ? 0 : 1, i / n); }
      if (i) { const a = (i - 1) * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat); m.receiveShadow = true; scene.add(m); return m;
  }
  function construireChemins() {
    const mc = M.matMonde('#BBA57C', M.TX.sol, 3.5, { double: true }); mc.polygonOffset = true; mc.polygonOffsetFactor = -2;
    ruban(ROUTE, 5.5, mc, 0.2, 4);
    ruban(SENTIER, 3.2, mc, 0.2, 2);
    const eau = new THREE.MeshPhongMaterial({ color: '#4D7480', specular: 0x9FB4BC, shininess: 70, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
    const rz = []; for (let z = -1250; z <= 1250; z += 50) rz.push([rivX(z), z]);
    ruban(rz, 11, eau, 0.35, 8);
  }

  /* ---------- La basilique de la Madeleine (état supposé vers 1146) ----------
     Repère local : façade vers −x ; le groupe est tourné pour que la façade regarde l'est et la Grande Rue. */
  function construireBasilique() {
    const g = new THREE.Group(), y0 = hauteur(-222, 0) - 0.3; g.position.set(-270, y0, 0); g.rotation.y = PI; scene.add(g);
    const L = new Lot();
    // avant-nef (narthex) et façade
    bloc(g, MAT.pierre, 19, 21, 27, -35.5, 10.5, 0);
    toit(g, 27.8, 7.5, 19.6, -35.5, 21, 0, true);
    [-1, 1].forEach(s => {
      const inacheve = s > 0, hT = inacheve ? 28 : 35, tz = s * 10.3;
      bloc(g, MAT.pierre, 7.6, hT, 7.6, -41.3, hT / 2, tz);
      [11, 21].forEach(yy => bloc(g, MAT.pierreS, 8.1, 0.45, 8.1, -41.3, yy, tz));
      const yb = hT - 7.5;
      for (const d of [-1.1, 1.1]) {
        fenetre(L, 1.1, 3.0, -45.1, yb, tz + d, -PI / 2);
        fenetre(L, 1.1, 3.0, -41.3 + d, yb, tz + s * 3.8, s > 0 ? 0 : PI);
      }
      if (!inacheve) {
        bloc(g, MAT.pierreS, 8.1, 0.45, 8.1, -41.3, hT, tz);
        const fl = maille(new THREE.ConeGeometry(5.6, 9, 4, 1), MAT.pierreS, g, -41.3, hT + 4.7, tz); fl.rotation.y = PI / 4;
      } else { // chantier : la tour n'est pas finie, échafaudage de perches et de planches
        for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, ux = Math.cos(a), uz = Math.sin(a), m = Math.max(Math.abs(ux), Math.abs(uz)); L.ajout('perche', BOITE, MAT.boisClair, -41.3 + ux / m * 4.6, hT - 3, tz + uz / m * 4.6, 0, 0.14, 12, 0.14); }
        for (const yy of [hT - 6, hT - 2.5, hT + 1]) [-1, 1].forEach(q => { L.ajout('planche', BOITE, MAT.boisClair, -41.3 + q * 4.6, yy, tz, 0, 0.9, 0.08, 9.4); L.ajout('planche', BOITE, MAT.boisClair, -41.3, yy, tz + q * 4.6, 0, 9.4, 0.08, 0.9); });
        for (let k = 0; k < 18; k++) L.ajout('pierres', BOITE, MAT.pierre, -43.3 + (k % 6) * 0.8, hT + 0.3, tz - 2 + Math.floor(k / 6) * 1.4, k * 0.4, 0.7, 0.45, 0.5);
      }
      // petits portails latéraux
      bloc(g, MAT.sombre, 0.3, 3.8, 2.6, -45.2, 1.9, tz);
      maille(new THREE.CircleGeometry(1.3, 16, 0, PI), MAT.pierreS, g, -45.38, 3.8, tz, -PI / 2);
      [1.55, 1.95].forEach(r => L.ajout('c' + r, cintre(r, 0.2), MAT.pierreS, -45.35, 3.8, tz, -PI / 2));
    });
    // grand portail : vantaux, linteau, tympan sculpté, voussures, colonnettes
    L.ajout('ombre-portail', arcade(6.8, 9.2, 0.3), MAT.sombre, -44.82, 0, 0, -PI / 2);
    bloc(g, MAT.bois, 0.1, 5.3, 5.0, -45.17, 2.65, 0);
    bloc(g, MAT.pierreS, 0.5, 0.55, 5.8, -45.3, 5.55, 0);
    const ty = new THREE.Mesh(new THREE.CircleGeometry(2.85, 32, 0, PI), new THREE.MeshLambertMaterial({ map: texTympan() }));
    ty.rotation.y = -PI / 2; ty.position.set(-45.2, 5.82, 0); ty.receiveShadow = true; g.add(ty);
    [3.3, 3.8, 4.3].forEach(r => L.ajout('c' + r, cintre(r, 0.24), MAT.pierreS, -45.25 - (r - 3.3) * 0.2, 5.82, 0, -PI / 2));
    [-1, 1].forEach(s => [3.3, 3.8, 4.3].forEach(r => L.ajout('col', new THREE.CylinderGeometry(0.2, 0.22, 5.8, 10), MAT.pierreS, -45.25 - (r - 3.3) * 0.2, 2.9, s * r, 0)));
    for (let k = -2; k <= 2; k++) fenetre(L, 1.15, 2.7, -45.05, 12.3, k * 2.35, -PI / 2);
    fenetre(L, 2.1, 3.8, -45.05, 15.8, 0, -PI / 2);
    [-1, 1].forEach(s => bloc(g, MAT.pierreS, 0.7, 21, 1.2, -45.3, 10.5, s * 6.6));
    bloc(g, MAT.pierreS, 0.6, 0.5, 13.4, -45.3, 20.8, 0);
    // nef à bas-côtés : 10 travées
    bloc(g, MAT.pierre, 62, 19, 12.4, 5, 9.5, 0);
    toit(g, 13.4, 6.4, 62.6, 5, 19, 0, true);
    [-1, 1].forEach(s => {
      bloc(g, MAT.pierre, 62, 10.5, 7, 5, 5.25, s * 9.6);
      const t = bloc(g, MAT.tuiles, 62.6, 0.35, 8.1, 5, 12.25, s * 9.7); t.rotation.x = s * 0.42;
      bloc(g, MAT.pierreS, 62, 0.4, 0.5, 5, 18.85, s * 6.35); bloc(g, MAT.pierreS, 62, 0.35, 0.5, 5, 10.35, s * 13.25);
      for (let i = 0; i < 10; i++) {
        const xb = -26 + 3.1 + i * 6.2;
        fenetre(L, 1.3, 2.9, xb, 14.1, s * 6.2, s > 0 ? 0 : PI);
        fenetre(L, 1.2, 2.5, xb, 4.2, s * 13.1, s > 0 ? 0 : PI);
      }
      for (let i = 0; i <= 10; i++) {
        const xc = -26 + i * 6.2;
        L.ajout('contrefort', BOITE, MAT.pierreS, xc, 4.5, s * 13.75, 0, 1.2, 9, 1.4);
        L.ajout('dosseret', BOITE, MAT.pierreS, xc, 14.5, s * 6.35, 0, 0.9, 8.4, 0.35);
      }
    });
    // transept
    bloc(g, MAT.pierre, 9, 19, 39, 40.5, 9.5, 0);
    toit(g, 9.8, 5.2, 39.4, 40.5, 19, 0, false);
    [-1, 1].forEach(s => { fenetre(L, 1.6, 3.4, 40.5, 7.5, s * 19.5, s > 0 ? 0 : PI); fenetre(L, 1.8, 3.6, 40.5, 13.2, s * 19.5, s > 0 ? 0 : PI); });
    // chœur, déambulatoire et chapelles rayonnantes
    bloc(g, MAT.pierre, 12, 17, 12.4, 51, 8.5, 0); toit(g, 13.2, 6, 12.6, 51, 17, 0, true);
    bloc(g, MAT.pierre, 12, 9, 22, 51, 4.5, 0);
    [-1, 1].forEach(s => { const t = bloc(g, MAT.tuiles, 12.4, 0.35, 5.6, 51, 10.5, s * 8.7); t.rotation.x = s * 0.5; });
    maille(new THREE.CylinderGeometry(6.2, 6.2, 17, 28, 1, false, 0, PI), MAT.pierre, g, 57, 8.5, 0);
    maille(new THREE.ConeGeometry(6.8, 5.5, 28, 1, false, 0, PI), MAT.tuiles, g, 57, 19.75, 0);
    maille(new THREE.CylinderGeometry(11, 11, 9, 36, 1, false, 0, PI), MAT.pierre, g, 57, 4.5, 0);
    maille(new THREE.CylinderGeometry(6.4, 11.7, 3.2, 36, 1, true, 0, PI), MAT.tuiles, g, 57, 10.6, 0);
    [-1.05, 0, 1.05].forEach(a => {
      const cx = 57 + 11.2 * Math.cos(a), cz = 11.2 * Math.sin(a);
      maille(new THREE.CylinderGeometry(2.8, 2.8, 6.5, 16, 1, false, -a, PI), MAT.pierre, g, cx, 3.25, cz);
      maille(new THREE.ConeGeometry(3.2, 2.8, 16, 1, false, -a, PI), MAT.tuiles, g, cx, 7.9, cz);
      fenetre(L, 0.9, 2.1, cx + 2.8 * Math.cos(a), 2.4, cz + 2.8 * Math.sin(a), Math.atan2(Math.cos(a), Math.sin(a)));
    });
    [-0.75, 0, 0.75].forEach(a => fenetre(L, 1.3, 3.0, 57 + 6.2 * Math.cos(a), 12.2, 6.2 * Math.sin(a), Math.atan2(Math.cos(a), Math.sin(a))));
    // cloître et bâtiments de l'abbaye (au sud de l'église)
    bloc(g, MAT.moellon, 42, 9, 6.8, 13, 4.5, -42.6); toit(g, 7.6, 4.2, 42.6, 13, 9, -42.6, true, MAT.moellon);
    bloc(g, MAT.moellon, 7.8, 11, 30, 30.1, 5.5, -31); toit(g, 8.6, 4.8, 30.6, 30.1, 11, -31, false, MAT.moellon);
    bloc(g, MAT.moellon, 5.8, 8, 23, -5.1, 4, -27.5); toit(g, 6.6, 3.6, 23.6, -5.1, 8, -27.5, false, MAT.moellon);
    const gal = (x, z, w, d, rx, rz) => { const t = bloc(g, MAT.tuiles, w, 0.3, d, x, 4.4, z); t.rotation.x = rx; t.rotation.z = rz; };
    gal(12, -18.9, 28.4, 4.6, -0.45, 0); gal(12, -37.1, 28.4, 4.6, 0.45, 0); gal(-0.1, -28, 4.6, 14.2, 0, -0.45); gal(24.1, -28, 4.6, 14.2, 0, 0.45);
    const colC = new THREE.CylinderGeometry(0.16, 0.18, 2.6, 8);
    for (let k = 0; k <= 6; k++) [-21, -35].forEach(zz => { L.ajout('colC', colC, MAT.pierreS, 2 + k * 20 / 6, 1.3, zz, 0); if (k < 6) L.ajout('cx', cintre(10 / 6, 0.2), MAT.pierreS, 2 + (k + 0.5) * 20 / 6, 2.6, zz, 0); });
    for (let k = 0; k <= 5; k++) [2, 22].forEach(xx => { L.ajout('colC', colC, MAT.pierreS, xx, 1.3, -21 - k * 2.8, 0); if (k < 5) L.ajout('cz', cintre(1.4, 0.2), MAT.pierreS, xx, 2.6, -22.4 - k * 2.8, PI / 2); });
    maille(new THREE.CylinderGeometry(1.1, 1.2, 1, 14), MAT.moellon, g, 12, 0.9, -28);
    L.poser(g);
    // parvis pavé qui suit la pente de la Grande Rue
    const pg = new THREE.PlaneGeometry(60, 32, 12, 8).rotateX(-PI / 2).translate(-196, 0, 0), PP = pg.attributes.position;
    for (let i = 0; i < PP.count; i++) PP.setY(i, hauteur(PP.getX(i), PP.getZ(i)) + 0.06);
    pg.computeVertexNormals();
    const pv = maille(pg, MAT.pave, scene, 0, 0, 0, 0, false); pv.material = MAT.pave.clone(); pv.material.onBeforeCompile = MAT.pave.onBeforeCompile; pv.material.polygonOffset = true; pv.material.polygonOffsetFactor = -1;
    OBSTACLES.push([-339, -14.5, -224, 14.5], [-315, -20, -306, 20], [-304, 16, -236, 46]);
  }

  /* ---------- Le bourg : maisons de pierre, rues, remparts ---------- */
  function construireBourg() {
    const rnd = alea(21), L = new Lot(), murs = [], toitsX = [], toitsZ = [], fumeesPos = [];
    const TEINTES = ['#FFFFFF', '#F3EADA', '#ECE2CE', '#F8F2E8', '#E6D9C0', '#F1E4CC'].map(col);
    const maison = (x, z, w, d, h, face) => { // face : +1 si la façade regarde +z (la rue est de ce côté)
      const y = hauteur(x, z) - 0.8, pignon = rnd() < 0.35, ht = (pignon ? w : d) * (0.5 + rnd() * 0.12);
      murs.push([x, y, z, w, h + 0.8, d]);
      (pignon ? toitsZ : toitsX).push([x, y + h + 0.8, z, w, ht, d]);
      OBSTACLES.push([x - w / 2, z - d / 2, x + w / 2, z + d / 2]);
      const zf = z + face * d / 2, sol = y + 0.8, ry = face > 0 ? 0 : PI;
      const px = x + (rnd() - 0.5) * w * 0.45;
      L.ajout('porte', arcade(1.3, 2.4, 0.2), MAT.bois, px, sol, zf - face * 0.12, ry);
      L.ajout('c0.65', cintre(0.8, 0.13), MAT.pierreS, px, sol + 1.75, zf + face * 0.02, ry);
      const fen = (fx, fy) => {
        L.ajout('fen', BOITE, MAT.sombre, fx, fy, zf, 0, 0.75, 0.95, 0.24);
        L.ajout('appui', BOITE, MAT.pierreS, fx, fy - 0.53, zf + face * 0.08, 0, 1.0, 0.1, 0.22);
        if (rnd() < 0.7) [-1, 1].forEach(q => L.ajout('volet', BOITE, MAT.volet, fx + q * 0.62, fy, zf + face * 0.1, q * face * 0.5, 0.42, 0.95, 0.05));
      };
      const autre = px > x ? x - w * 0.28 : x + w * 0.28;
      fen(autre, sol + 1.5);
      if (h > 6.2) { fen(x - w * 0.24, sol + 4.4); fen(x + w * 0.24, sol + 4.4); }
      if (rnd() < 0.55) {
        const cx = x + (rnd() - 0.5) * w * 0.5, cz = z + (rnd() - 0.5) * d * 0.3, top = y + h + 0.8 + ht * 0.75;
        L.ajout('chem', BOITE, MAT.moellon, cx, top, cz, 0, 0.8, 2.4, 0.8);
        if (rnd() < 0.4) fumeesPos.push([cx, top + 1.3, cz]);
      }
    };
    for (const s of [-1, 1]) {
      let x = -166;
      while (x < 132) {
        const w = 6 + rnd() * 3.5, d = 8 + rnd() * 3, h = 5.2 + rnd() * 3.6;
        if (!(s < 0 && x > -42 && x < -16)) maison(x + w / 2, s * (4.3 + d / 2), w, d, h, -s);
        x += w + (rnd() < 0.22 ? 2 + rnd() * 4 : 0.25);
      }
      x = -150;
      while (x < 124) { const w = 6 + rnd() * 3, d = 7 + rnd() * 3, h = 4.8 + rnd() * 2.6; if (rnd() < 0.72 && !(s < 0 && x > -44 && x < -14)) maison(x + w / 2, s * (20 + d / 2), w, d, h, -s); x += w + 1 + rnd() * 6; }
    }
    const mm = new THREE.InstancedMesh(BOITE_B, MAT.maisons, murs.length);
    murs.forEach(([x, y, z, w, h, d], i) => { _o.position.set(x, y, z); _o.rotation.set(0, 0, 0); _o.scale.set(w, h, d); _o.updateMatrix(); mm.setMatrixAt(i, _o.matrix); mm.setColorAt(i, TEINTES[i % TEINTES.length]); });
    const tx = new THREE.InstancedMesh(M.prisme(1, 1, 1).rotateY(PI / 2), [MAT.moellon, MAT.tuiles], toitsX.length);
    toitsX.forEach(([x, y, z, w, h, d], i) => { _o.position.set(x, y, z); _o.scale.set(w * 1.06, h, d * 1.12); _o.updateMatrix(); tx.setMatrixAt(i, _o.matrix); });
    const tz = new THREE.InstancedMesh(M.prisme(1, 1, 1), [MAT.moellon, MAT.tuilesT], toitsZ.length);
    toitsZ.forEach(([x, y, z, w, h, d], i) => { _o.position.set(x, y, z); _o.scale.set(w * 1.1, h, d * 1.06); _o.updateMatrix(); tz.setMatrixAt(i, _o.matrix); });
    [mm, tx, tz].forEach(m => { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); });
    // étals de marchands d'enseignes et de cierges sur le parvis, puits
    const TOILES = ['#B3261E', '#2F5E9E', '#C9A13A', '#5E7A3A'];
    [[-214, -11], [-203, -12], [-214, 11], [-203, 12]].forEach(([x, z], k) => {
      const y = hauteur(x, z), f = z < 0 ? 1 : -1;
      L.ajout('etal', BOITE, MAT.boisClair, x, y + 0.9, z, 0, 2.6, 0.12, 1.1);
      [[-1.2, -0.45], [1.2, -0.45], [-1.2, 0.45], [1.2, 0.45]].forEach(([a, b]) => L.ajout('pied', BOITE, MAT.bois, x + a, y + 0.45, z + b, 0, 0.1, 0.9, 0.1));
      [-1.25, 1.25].forEach(a => L.ajout('mat', BOITE, MAT.bois, x + a, y + 1.3, z - f * 0.6, 0, 0.1, 2.6, 0.1));
      L.ajout('toile' + k, BOITE, M.matiere('tissu:' + TOILES[k]), x, y + 2.45, z + f * 0.05, 0, 2.8, 0.04, 1.8, f * 0.35);
      for (let n = 0; n < 5; n++) L.ajout('marchandise', BOITE, M.matiere('tissu:#D8CBB0'), x - 1 + n * 0.5, y + 1.05, z + (rnd() - 0.5) * 0.4, rnd(), 0.28, 0.18, 0.22);
      OBSTACLES.push([x - 1.4, z - 0.7, x + 1.4, z + 0.7]);
    });
    maille(new THREE.CylinderGeometry(1.2, 1.3, 1.0, 16), MAT.moellon, scene, -206, hauteur(-206, 0) + 0.45, 0);
    L.ajout('puitsM', BOITE, MAT.bois, -207.1, hauteur(-206, 0) + 1.6, 0, 0, 0.12, 2.2, 0.12); L.ajout('puitsM', BOITE, MAT.bois, -204.9, hauteur(-206, 0) + 1.6, 0, 0, 0.12, 2.2, 0.12);
    L.ajout('puitsT', BOITE, MAT.bois, -206, hauteur(-206, 0) + 2.65, 0, 0, 2.5, 0.14, 0.14);
    OBSTACLES.push([-207.5, -1.5, -204.5, 1.5]);
    // remparts : courtines de moellons crénelées, tours rondes, porte à l'est, poterne au nord
    const tour = (x, z, r, h) => {
      const y = hauteur(x, z) - 2;
      maille(new THREE.CylinderGeometry(r, r * 1.08, h, 18), MAT.moellon, scene, x, y + h / 2, z);
      for (let k = 0; k < 10; k++) { const a = k / 10 * TAU; L.ajout('merlonT', BOITE, MAT.moellon, x + Math.cos(a) * (r - 0.3), y + h + 0.55, z + Math.sin(a) * (r - 0.3), -a, 1.1, 1.1, 0.7); }
      OBSTACLES.push([x - r, z - r, x + r, z + r]);
    };
    const courtine = pts => {
      for (let i = 1; i < pts.length; i++) {
        const [ax, az] = pts[i - 1], [bx, bz] = pts[i], lg = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(lg / 6)), ry = -Math.atan2(bz - az, bx - ax);
        MURAILLE.push([ax, az, bx, bz]);
        for (let k = 0; k < n; k++) {
          const t = (k + 0.5) / n, x = ax + (bx - ax) * t, z = az + (bz - az) * t, y = hauteur(x, z) - 2;
          L.ajout('courtine', BOITE_B, MAT.moellon, x, y, z, ry, lg / n + 0.3, 8, 1.9);
          for (let m = 0; m < 3; m++) { const u = t + (m - 1) / (3 * n); L.ajout('merlon', BOITE, MAT.moellon, ax + (bx - ax) * u, y + 8.55, az + (bz - az) * u, ry, 1.1, 1.1, 1.9); }
        }
      }
    };
    courtine([[-22, -48], [0, -48.5], [60, -48], [110, -47], [146, -42], [151, -9]]);
    courtine([[151, 9], [146, 42], [100, 47], [0, 48.5], [-120, 48.5], [-230, 49], [-320, 48], [-352, 30], [-356, 0], [-352, -30], [-320, -48], [-230, -49], [-120, -48.5], [-36, -48]]);
    [[146, -42], [146, 42], [60, -48], [0, 48.5], [-120, 48.5], [-230, 49], [-352, 30], [-352, -30], [-230, -49], [-120, -48.5], [-36, -48], [-22, -48]].forEach(([x, z]) => tour(x, z, 3.3, 11));
    const yP = hauteur(152, 0) - 1.5; // porte de ville
    [-1, 1].forEach(s => { maille(new THREE.CylinderGeometry(3.6, 3.9, 14, 18), MAT.moellon, scene, 152, yP + 7, s * 8); OBSTACLES.push([148, s * 8 - 3.6, 156, s * 8 + 3.6]); });
    bloc(scene, MAT.moellon, 6, 5.5, 9, 152, yP + 10.25, 0);
    L.ajout('ombre-porte', arcade(4.4, 6.2, 0.3), MAT.sombre, 148.8, yP + 1.5, 0, -PI / 2);
    L.ajout('ombre-porte', arcade(4.4, 6.2, 0.3), MAT.sombre, 155.2, yP + 1.5, 0, PI / 2);
    for (let k = 0; k < 5; k++) L.ajout('merlon', BOITE, MAT.moellon, 152, yP + 13.5, -3.6 + k * 1.8, 0, 1.2, 1.1, 1.0);
    L.poser(scene);
    // fumées de cheminées
    const tf = texFumee();
    fumeesPos.slice(0, 9).forEach(([x, y, z]) => {
      for (let k = 0; k < 6; k++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tf, transparent: true, depthWrite: false, opacity: 0 })); s.position.set(x, y, z); scene.add(s); fumees.push({ s, x, y, z, t: k / 6 }); }
    });
  }

  /* ---------- L'estrade de bois ---------- */
  function construireEstrade() {
    const y = hauteur(EST.x, EST.z); estradeY = y + 3.2;
    const g = new THREE.Group(); g.position.set(EST.x, y, EST.z); scene.add(g);
    const L = new Lot();
    for (const px of [-6, -2, 2, 6]) for (const pz of [-3.6, 0, 3.6]) L.ajout('poteau', BOITE, MAT.bois, px, 0.6, pz, 0, 0.32, 5.2, 0.32);
    bloc(g, MAT.boisClair, 13.4, 0.35, 8.4, 0, 3.05, 0);
    for (let k = -3; k <= 3; k++) L.ajout('lisse', BOITE, MAT.bois, k * 2, 2.7, 0, 0, 0.18, 0.3, 8.2);
    bloc(g, M.matiere('tissu:#9A2A22'), 9, 0.04, 5, 0, 3.25, -0.6);
    // tenture plissée sur le devant
    const tg = new THREE.PlaneGeometry(13.2, 2.7, 60, 1), P = tg.attributes.position;
    for (let i = 0; i < P.count; i++) P.setZ(i, Math.sin(P.getX(i) * 4.1) * 0.09 + (P.getY(i) < 0 ? Math.sin(P.getX(i) * 2.3) * 0.05 : 0));
    tg.computeVertexNormals();
    maille(tg, M.matiere('tissu:#8E1B1B'), g, 0, 1.65, -4.3);
    bloc(g, M.matiere('or:#C9A13A'), 13.2, 0.12, 0.06, 0, 3.0, -4.36);
    for (let k = 0; k < 6; k++) L.ajout('marche', BOITE, MAT.boisClair, 7.7 + k * 0.1, 2.6 - k * 0.48, -1.5 + k * 1.2, 0, 2.5, 0.3, 1.2);
    bloc(g, MAT.bois, 0.42, 7.5, 0.42, 0, 6.4, 3.3); bloc(g, MAT.bois, 3.4, 0.42, 0.42, 0, 8.3, 3.3);
    bloc(g, M.matiere('tissu:#EDE6D6'), 1.3, 0.55, 0.9, 4.2, 3.5, 1.2);
    for (let k = 0; k < 14; k++) L.ajout('croixTas', BOITE, M.matiere('tissu:#B3261E'), 3.9 + (k % 4) * 0.18, 3.8 + Math.floor(k / 4) * 0.03, 1.0 + (k % 3) * 0.15, k * 0.7, 0.26, 0.02, 0.06);
    L.poser(g);
    const drapeau = (type, px) => {
      bloc(g, MAT.bois, 0.16, 9.5, 0.16, px, 4.75, -3.8);
      const geo = new THREE.PlaneGeometry(1.7, 2.3, 10, 4);
      const f = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: texBanniere(type), side: THREE.DoubleSide }));
      f.position.set(px + (px < 0 ? 0.9 : -0.9), 8.1, -3.8); f.castShadow = true; g.add(f);
      drapeaux.push({ f, base: geo.attributes.position.array.slice(), sens: px < 0 ? 1 : -1 });
    };
    drapeau('roi', -6.4); drapeau('croix', 6.4);
    bernard = M.personne(tenue('bernard', 0)); bernard.position.set(0, 3.22, -3.0); bernard.rotation.y = PI; g.add(bernard);
    OBSTACLES.push([EST.x - 6.8, EST.z - 4.4, EST.x + 9.5, EST.z + 4.4]);
  }

  /* ---------- La foule ---------- */
  const PAL = {
    tunique: ['#7A5A3A', '#6B6150', '#8E2F24', '#3E5F7A', '#5C6B4A', '#9A8A6A', '#4A4038', '#A0763A', '#6E2A3A', '#B8AC92', '#7A7F84', '#5A4A3A', '#8A6A50'],
    robe: ['#6E2A3A', '#3E5F7A', '#8A6A50', '#5C6B4A', '#9A8A6A', '#7A3A2A', '#4A4A5A', '#B8AC92', '#6B6150'],
    moine: ['#2A2623', '#2A2623', '#E4DED0'],
    capuche: ['#8A6A40', '#6B5A44', '#5A4A3A', '#9A7A50', '#4A5A3A', '#7A3A2A', '#B8AC92'],
    cheveux: ['#3A2A20', '#4A3424', '#6A4A30', '#2A1E16', '#8A6A48', '#9A8A78', '#B08850'],
    voile: ['#F2EEE6', '#E8E0D0', '#EDE6D6', '#DDD2BE'],
    bonnet: ['#8E2F24', '#3E5F7A', '#5C6B4A', '#6B5A44', '#A0763A'],
    feutre: ['#6A5A48', '#5A4A3A', '#7A6A50'],
    manteau: ['#5A4A3A', '#6E2A3A', '#3E4F6A', '#6B6150', '#7A5A3A', '#4A5A3A'],
    noble: ['#8E2F24', '#2F4F8E', '#6E2A3A', '#24365E', '#5E7A3A'],
    chausses: ['#5E5446', '#4A4038', '#6B6150', '#3A3430', '#7A6A58'],
    peau: ['#E8C0A0', '#DDB08A', '#D2A27A', '#C99670', '#E2B896']
  };
  function variantesFoule() {
    return [
      { v: { longueur: 'courte', coiffe: 'capuche' }, p: 0.24, pal: { corps: 'tunique', coiffe: 'capuche', jambes: 'chausses', bras: 'corps' } },
      { v: { longueur: 'mi', coiffe: 'cheveux', ph: 1 }, p: 0.18, pal: { corps: 'tunique', coiffe: 'cheveux', jambes: 'chausses', bras: 'corps' } },
      { v: { sexe: 'f', longueur: 'longue', coiffe: 'voile', ph: 2 }, p: 0.22, pal: { corps: 'robe', coiffe: 'voile', jambes: 'chausses', bras: 'corps' } },
      { v: { longueur: 'longue', coiffe: 'tonsure', capuchonDos: true, manches: 'larges', ph: 3 }, p: 0.06, pal: { corps: 'moine', coiffe: 'cheveux', jambes: 'chausses', bras: 'corps' } },
      { v: { longueur: 'mi', coiffe: 'bonnet', manteau: true, ph: 4 }, p: 0.13, pal: { corps: 'tunique', coiffe: 'bonnet', jambes: 'chausses', bras: 'corps', manteau: 'manteau' } },
      { v: { longueur: 'mi', coiffe: 'chapeau', manteau: true, ph: 5 }, p: 0.08, pal: { corps: 'tunique', coiffe: 'feutre', jambes: 'chausses', bras: 'corps', manteau: 'manteau' } },
      { v: { longueur: 'mi', coiffe: 'casque', manteau: true, ph: 6 }, p: 0.09, pal: { corps: 'mailles', coiffe: 'metal', jambes: 'chausses', bras: 'mailles', manteau: 'noble' }, chevalier: true }
    ];
  }
  const MAT_FOULE = {};
  function matFoule(couche, chevalier) {
    const k = couche + (chevalier ? '+' : ''); if (MAT_FOULE[k]) return MAT_FOULE[k];
    let m;
    if (chevalier && (couche === 'corps' || couche === 'bras')) m = new THREE.MeshPhongMaterial({ map: M.TX.mailles, specular: 0x555555, shininess: 25, side: THREE.DoubleSide });
    else if (chevalier && couche === 'coiffe') m = new THREE.MeshPhongMaterial({ specular: 0x888888, shininess: 60 });
    else if (couche === 'peau') m = new THREE.MeshLambertMaterial();
    else m = new THREE.MeshLambertMaterial({ map: M.TX.tissu, side: THREE.DoubleSide });
    return (MAT_FOULE[k] = m);
  }
  // groupe de silhouettes instanciées : chaque personne a une variante, une position et des couleurs
  const SILHOUETTES = {};
  function troupe(gens, variantes, rnd, epaule, sansOmbre) {
    const par = variantes.map(() => []);
    gens.forEach(p => par[p.v].push(p));
    const t = { gens, meshes: [], par };
    const couleur = (p, cle) => cle === 'mailles' ? '#9A9EA4' : cle === 'metal' ? '#A4A8AE' : p.couleurs[cle] || (p.couleurs[cle] = PAL[cle][Math.floor(rnd() * PAL[cle].length)]);
    variantes.forEach((V, vi) => {
      const liste = par[vi]; if (!liste.length) return;
      const sig = JSON.stringify(V.v), geos = SILHOUETTES[sig] || (SILHOUETTES[sig] = M.silhouette(V.v));
      for (const couche in geos) {
        const im = new THREE.InstancedMesh(geos[couche], matFoule(couche, V.chevalier), liste.length);
        const cle = couche === 'peau' ? 'peau' : couche === 'bras' ? (V.pal.bras === 'corps' ? V.pal.corps : V.pal.bras) : V.pal[couche] || 'tunique';
        liste.forEach((p, i) => { p.idx = i; im.setColorAt(i, col(couleur(p, cle))); });
        im.castShadow = !sansOmbre; im.receiveShadow = true; im.frustumCulled = false; scene.add(im);
        t.meshes.push({ im, couche, liste, epaule: epaule || 1.42 });
      }
    });
    return t;
  }
  const Mf = new THREE.Matrix4(), Ml = new THREE.Matrix4(), Mr = new THREE.Matrix4(), Qf = new THREE.Quaternion(), Ef = new THREE.Euler(), Vf = new THREE.Vector3(), Sf = new THREE.Vector3();
  function placerTroupe(t, tps, agit) {
    for (const { im, couche, liste, epaule } of t.meshes) {
      for (const p of liste) {
        const saut = agit > 0 ? Math.max(0, Math.sin(tps * 7 + p.ph)) * 0.25 * agit * p.vif : 0;
        Ef.set(0, p.rot + (agit > 0 ? Math.sin(tps * 3 + p.ph) * 0.12 * agit : 0), 0); Qf.setFromEuler(Ef);
        Mf.compose(Vf.set(p.x, p.y + saut, p.z), Qf, Sf.set(p.s, p.s, p.s));
        if (p.mat) Mf.premultiply(p.mat);
        if (couche === 'bras') {
          const lever = agit > 0 ? agit * p.vif * (1.6 + 0.5 * Math.sin(tps * 5 + p.ph)) : (p.bras || 0);
          Ml.makeTranslation(0, epaule, 0).multiply(Mr.makeRotationX(-lever));
          Mf.multiply(Ml);
        }
        im.setMatrixAt(p.idx, Mf);
      }
      im.instanceMatrix.needsUpdate = true;
    }
  }
  function construireFoule() {
    const rnd = alea(33), V = variantesFoule(), gens = [], exclus = [[-58.8, -162.5, 3], [-43, -163, 5], [38, -226, 3.5], [-61.3, -157.3, 1.6], [32, -224.5, 2.2]];
    const tirer = d => { let r = rnd(); if (d < 16 && r < 0.3) return 6; for (let i = 0; i < V.length; i++) { if ((r -= V[i].p) < 0) return i; } return 0; };
    let essais = 0, n = 0;
    const occupe = new Set(), cle = (x, z) => Math.floor(x / 0.75) + ',' + Math.floor(z / 0.75);
    while (n < 1150 && essais++ < 40000) {
      const x = -155 + rnd() * 190, z = -268 + rnd() * 110;
      if (z > -160 && Math.abs(x - EST.x) < 10) continue;
      if (exclus.some(([a, b, r]) => Math.hypot(x - a, z - b) < r)) continue;
      const d = Math.hypot(x - EST.x, z - EST.z);
      if (rnd() > Math.exp(-(d - 15) / 70)) continue;
      const k = cle(x, z); if (occupe.has(k)) continue; occupe.add(k);
      gens.push({ x, y: hauteur(x, z), z, s: 0.9 + rnd() * 0.16, rot: Math.atan2(EST.x - x, EST.z - z) + (rnd() - 0.5) * 0.5, ph: rnd() * 6.28, vif: 0.5 + rnd() * 0.6, v: tirer(d), couleurs: {}, bras: 0.05 + rnd() * 0.25 });
      n++;
    }
    foule = troupe(gens, V, rnd, 1.42, true);
    foule.agitation = 0;
    placerTroupe(foule, 0, 0);
    // la foule ne projette pas d'ombre calculée (trop coûteux) : une ombre douce au sol, décalée à l'opposé du soleil
    const ombreSol = new THREE.InstancedMesh(new THREE.CircleGeometry(0.42, 12).rotateX(-PI / 2).scale(1, 1, 1.5), new THREE.MeshBasicMaterial({ color: 0x1E2A14, transparent: true, opacity: 0.32, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3 }), gens.length);
    const ox = -DIR_SOLEIL.x * 0.5, oz = -DIR_SOLEIL.z * 0.5, ang = Math.atan2(ox, oz);
    gens.forEach((p, i) => { _o.position.set(p.x + ox, hauteur(p.x + ox, p.z + oz) + 0.04, p.z + oz); _o.rotation.set(0, ang, 0); _o.scale.set(p.s, 1, p.s); _o.updateMatrix(); ombreSol.setMatrixAt(i, _o.matrix); });
    ombreSol.frustumCulled = false; ombreSol.renderOrder = 1; scene.add(ombreSol);
    // chevaliers à cheval, et chevaux attachés près des tentes
    const cavaliers = [], chevaux = [];
    for (let k = 0; k < 16; k++) { const x = 34 + rnd() * 26, z = -245 + rnd() * 60; { const dx = x - 38, dz = z + 226, av = -0.88 * dx + 0.48 * dz, lat = Math.abs(0.48 * dx + 0.88 * dz); if (Math.hypot(dx, dz) < 6 || (av > -3 && av < 32 && lat < 7) || Math.hypot(x - 32, z + 224.5) < 3) { k--; continue; } } chevaux.push({ x, z, rot: Math.atan2(EST.x - x, EST.z - z) + (rnd() - 0.5) * 0.6, monte: true }); }
    for (let k = 0; k < 7; k++) { const x = 84 + rnd() * 18, z = -265 + k * 9; chevaux.push({ x, z, rot: rnd() * TAU, monte: false }); }
    for (let k = 0; k < 5; k++) { const x = -196 + rnd() * 8, z = -262 + k * 11; chevaux.push({ x, z, rot: rnd() * TAU, monte: false }); }
    const gc = M.cheval(), ROBES = ['#6B4A2E', '#3A2A1E', '#8A5A3A', '#D8D0C0', '#4A3A30', '#7A4A28', '#B8A890'], HARNAIS = ['#8E2F24', '#2F4F8E', '#6B4A2E', '#C9A13A', '#3A2A1E'];
    const mats = { robe: new THREE.MeshLambertMaterial({ map: M.TX.tissu }), crins: new THREE.MeshLambertMaterial(), harnais: new THREE.MeshLambertMaterial({ map: M.TX.tissu, side: THREE.DoubleSide }) };
    const Mc = new THREE.Matrix4();
    for (const couche in gc) {
      const im = new THREE.InstancedMesh(gc[couche], mats[couche], chevaux.length);
      chevaux.forEach((c, i) => {
        Mc.compose(new THREE.Vector3(c.x, hauteur(c.x, c.z), c.z), new THREE.Quaternion().setFromEuler(new THREE.Euler(0, c.rot, 0)), new THREE.Vector3(1, 1, 1));
        im.setMatrixAt(i, Mc); c.mat = Mc.clone();
        im.setColorAt(i, col(couche === 'robe' ? ROBES[i % ROBES.length] : couche === 'crins' ? (i % 3 ? '#2A1E16' : '#4A3A2A') : HARNAIS[i % HARNAIS.length]));
      });
      im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false; scene.add(im);
    }
    chevaux.filter(c => c.monte).forEach(c => {
      const mat = c.mat.clone().multiply(new THREE.Matrix4().makeTranslation(0, 1.72, -0.05));
      cavaliers.push({ x: 0, y: 0, z: 0, s: 1, rot: 0, ph: rnd() * 6, vif: 0.3, v: 0, couleurs: {}, mat, bras: 0.3 });
      OBSTACLES.push([c.x - 1.2, c.z - 1.2, c.x + 1.2, c.z + 1.2]);
    });
    const VC = [{ v: { longueur: 'cavalier', coiffe: 'casque', manteau: true }, p: 1, pal: { corps: 'mailles', coiffe: 'metal', jambes: 'chausses', bras: 'mailles', manteau: 'noble' }, chevalier: true }];
    const troupeC = troupe(cavaliers, VC, rnd, 0.52);
    placerTroupe(troupeC, 0, 0);
  }

  /* ---------- Campement : pavillons de toile ---------- */
  function construireCampement() {
    const rnd = alea(51), tentes = [], L = new Lot();
    for (let k = 0; k < 9; k++) tentes.push([-178 - rnd() * 22, -250 + k * 10 + rnd() * 4]);
    for (let k = 0; k < 8; k++) tentes.push([78 + rnd() * 25, -255 + k * 11 + rnd() * 4]);
    const TEINTES = ['#F2EDE2', '#C8483A', '#4A6FAE', '#D9B24A', '#F2EDE2', '#8E3A4A'].map(col);
    const ray = texRayures(); ray.repeat.set(6, 1);
    const murs = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 20, 1, true).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ map: ray, side: THREE.DoubleSide }), tentes.length);
    const toits = new THREE.InstancedMesh(new THREE.ConeGeometry(1, 1, 20, 1, true).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ map: M.TX.tissu, side: THREE.DoubleSide }), tentes.length);
    const lambr = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 20, 1, true).translate(0, 0.5, 0), new THREE.MeshLambertMaterial({ side: THREE.DoubleSide }), tentes.length);
    tentes.forEach(([x, z], i) => {
      const r = 2.6 + rnd() * 1.3, h = 2.8 + rnd() * 1.2, y = hauteur(x, z) - 0.1, c = TEINTES[i % TEINTES.length], c2 = TEINTES[(i + 3) % TEINTES.length];
      _o.rotation.set(0, rnd() * 3, 0);
      _o.position.set(x, y, z); _o.scale.set(r, 1.8, r); _o.updateMatrix(); murs.setMatrixAt(i, _o.matrix); murs.setColorAt(i, c);
      _o.position.set(x, y + 1.8, z); _o.scale.set(r * 1.08, h, r * 1.08); _o.updateMatrix(); toits.setMatrixAt(i, _o.matrix); toits.setColorAt(i, c);
      _o.position.set(x, y + 1.45, z); _o.scale.set(r * 1.1, 0.4, r * 1.1); _o.updateMatrix(); lambr.setMatrixAt(i, _o.matrix); lambr.setColorAt(i, c2);
      L.ajout('mat', BOITE, MAT.bois, x, y + 1.8 + h + 0.4, z, 0, 0.08, 1.0, 0.08);
      L.ajout('fanion' + (i % 4), BOITE, M.matiere('tissu:' + ['#B3261E', '#2F4F9E', '#C9A13A', '#F2EDE2'][i % 4]), x + 0.35, y + 1.8 + h + 0.7, z, 0, 0.7, 0.35, 0.02);
      OBSTACLES.push([x - r, z - r, x + r, z + r]);
    });
    [murs, toits, lambr].forEach(m => { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); });
    // charrettes
    [[-186, -238, 0.4], [92, -232, -0.7], [70, -262, 1.2]].forEach(([x, z, r]) => {
      const y = hauteur(x, z);
      L.ajout('caisse', BOITE, MAT.boisClair, x, y + 1.0, z, r, 1.5, 0.5, 2.6);
      [-1, 1].forEach(s => L.ajout('roue', new THREE.CylinderGeometry(0.62, 0.62, 0.12, 14).rotateZ(PI / 2), MAT.bois, x + Math.cos(r) * s * 0.85, y + 0.62, z - Math.sin(r) * s * 0.85, r));
      L.ajout('timon', BOITE, MAT.bois, x + Math.sin(r) * 2.2, y + 0.7, z + Math.cos(r) * 2.2, r, 0.12, 0.12, 2.2);
      OBSTACLES.push([x - 1.6, z - 1.6, x + 1.6, z + 1.6]);
    });
    L.poser(scene);
  }

  /* ---------- Végétation : haies et arbres de fin mars, vergers en fleurs, peupliers, vignes, herbe ---------- */
  function construireVegetation() {
    const rnd = alea(77), types = { feuillu: [], nu: [], fruitier: [], peuplier: [], buisson: [], lointain: [] };
    const bourg = (x, z) => Math.abs(z) < 56 && x > -365 && x < 165;
    const libre = (x, z, marge) => {
      if (bourg(x, z)) return false;
      if (x > -200 && x < 72 && z > -285 && z < -138) return false;
      if (x > -165 && x < 65 && z > 58 && z < 140) return false;
      if (distPolyligne(ROUTE, x, z) < 7 + (marge || 0) || distPolyligne(SENTIER, x, z) < 4) return false;
      if (Math.abs(x - rivX(z)) < 16) return false;
      for (const k in POINTS) { const p = POINTS[k].pos; if (k !== 'survol' && Math.hypot(x - p[0], z - p[1]) < 30) return false; }
      return true;
    };
    const ajouter = (type, x, z, s) => { const d = Math.hypot(x + 60, z); if (d > 900 && type !== 'peuplier') type = 'lointain'; types[type].push([x, z, s || 0.8 + rnd() * 0.5, rnd() * TAU, d < 480 || Math.hypot(x - 760, z + 222) < 150]); };
    // arbres des haies
    for (const [[ax, az], [bx, bz]] of HAIES) {
      const lg = Math.hypot(bx - ax, bz - az);
      for (let t = rnd() * 30; t < lg; t += 28 + rnd() * 34) {
        const x = ax + (bx - ax) * t / lg, z = az + (bz - az) * t / lg, d = Math.hypot(x + 60, z);
        if (d > 1150 || !libre(x, z) || rnd() < 0.35) continue;
        const r = rnd(); ajouter(r < 0.55 ? 'feuillu' : r < 0.78 ? 'nu' : 'buisson', x, z);
      }
    }
    // bosquets sur les pentes de la colline, vergers en fleurs au sud-est
    for (let k = 0; k < 650; k++) {
      const x = -520 + rnd() * 900, z = -380 + rnd() * 700; if (!libre(x, z)) continue;
      if (rnd() > 0.25 + fbm(x * 0.01, z * 0.01) * 0.5) continue;
      const r = rnd(); ajouter(r < 0.55 ? 'feuillu' : r < 0.75 ? 'nu' : 'buisson', x, z);
    }
    for (let x = 70; x < 250; x += 11) for (let z = 55; z < 140; z += 11) { const px = x + (rnd() - 0.5) * 8, pz = z + (rnd() - 0.5) * 8; if (libre(px, pz) && rnd() < 0.7) ajouter('fruitier', px, pz, 0.8 + rnd() * 0.35); }
    for (let k = 0; k < 40; k++) { const x = -330 + rnd() * 460, z = (rnd() < 0.5 ? -1 : 1) * (60 + rnd() * 30); if (libre(x, z)) ajouter('fruitier', x, z); }
    // peupliers au bord de la rivière
    for (let z = -900; z < 900; z += 12 + rnd() * 10) { const s = rnd() < 0.5 ? -1 : 1, x = rivX(z) + s * (19 + rnd() * 8); if (Math.hypot(x - 760, z + 222) > 28 && distPolyligne(ROUTE, x, z) > 8) ajouter('peuplier', x, z, 0.85 + rnd() * 0.35); }
    // lisières des forêts lointaines
    for (let k = 0; k < 9000 && types.lointain.length < 520; k++) { const x = (rnd() - 0.5) * 3000, z = (rnd() - 0.5) * 3000, f = foret(x, z); if (f > 0.35 && rnd() < 0.5) types.lointain.push([x, z, 1.1 + rnd() * 0.8, rnd() * TAU, false]); }
    // géométries (plusieurs modèles par espèce) et instanciation
    const COUL = { feuillu: ['#9DBA5E', '#B2C96E', '#8DAE58', '#A8C06A'], fruitier: ['#FFFFFF', '#FBEFF2', '#FFFDF8', '#F6FBEF'], peuplier: ['#B8C774', '#A6BD62', '#C4CE84'], buisson: ['#7F9E4E', '#8FAE58', '#6E8E46'], lointain: ['#6E8E4A', '#7A9A52', '#5E7E42'] };
    const matC = new THREE.MeshLambertMaterial({ vertexColors: true, map: M.TX.feuillage }), matF = new THREE.MeshLambertMaterial({ vertexColors: true }), matT = M.matiere('bois:#7C6852');
    const Mm = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), Sc = new THREE.Vector3();
    const lointain = { tronc: new THREE.CylinderGeometry(0.25, 0.4, 4, 5).translate(0, 2, 0), couronne: (() => { const s = new THREE.SphereGeometry(3.2, 7, 5).scale(1, 1.15, 1).translate(0, 6.2, 0); const n = s.attributes.position.count, c = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const l = 0.6 + 0.4 * (s.attributes.position.getY(i) - 3) / 6.5; c[i * 3] = c[i * 3 + 1] = c[i * 3 + 2] = l; } s.setAttribute('color', new THREE.BufferAttribute(c, 3)); return s; })() };
    for (const type in types) {
      const liste = types[type]; if (!liste.length) continue;
      const nb = type === 'lointain' ? 1 : 3, modeles = [];
      for (let k = 0; k < nb; k++) modeles.push(type === 'lointain' ? lointain : M.arbre(type, 100 + k * 17 + type.length));
      modeles.forEach((geo, k) => [true, false].forEach(ombre => {
        const sous = liste.filter((t, i) => i % nb === k && !!t[4] === ombre); if (!sous.length) return;
        for (const part of ['tronc', 'couronne']) {
          if (!geo[part]) continue;
          const im = new THREE.InstancedMesh(geo[part], part === 'tronc' ? matT : type === 'fruitier' ? matF : matC, sous.length);
          sous.forEach(([x, z, s, r], i) => {
            E.set(0, r, 0); Q.setFromEuler(E); Mm.compose(P.set(x, hauteur(x, z) - 0.2, z), Q, Sc.set(s, s * (0.9 + (i % 5) * 0.05), s)); im.setMatrixAt(i, Mm);
            if (part === 'couronne') im.setColorAt(i, col(COUL[type][(i + k) % COUL[type].length]));
          });
          im.castShadow = ombre; im.receiveShadow = true; im.frustumCulled = false; scene.add(im);
        }
      }));
    }
    // herbe haute et fleurs de printemps autour des points de vue
    const touffes = [];
    const herbePossible = (x, z) => !bourg(x, z) && distPolyligne(ROUTE, x, z) > 3.8 && distPolyligne(SENTIER, x, z) > 2.2 && Math.abs(x - rivX(z)) > 8.5 && !(Math.abs(x - EST.x) < 8 && Math.abs(z - EST.z) < 5.5) && !(x > -165 && x < 60 && z > 60 && z < 138);
    for (const k of ['route', 'bourg', 'champ', 'estrade', 'foule']) {
      const [px, pz] = POINTS[k].pos, n = k === 'route' ? 2200 : k === 'foule' || k === 'estrade' ? 500 : 1200;
      for (let i = 0; i < n; i++) {
        const a = rnd() * TAU, r = Math.pow(rnd(), 0.6) * (k === 'route' ? 70 : 42), x = px + Math.cos(a) * r + (k === 'route' ? -r * 0.6 : 0), z = pz + Math.sin(a) * r;
        if (herbePossible(x, z)) touffes.push([x, z, 0.7 + rnd() * 0.7, rnd() * TAU, rnd() < 0.18]);
      }
    }
    for (let z = -400; z < 200; z += 2.6) for (const s of [-1, 1]) { const x = rivX(z) + s * (7.8 + rnd() * 2); if (Math.hypot(x - 700, z + 200) < 160) touffes.push([x, z, 1.6 + rnd(), rnd() * TAU, false, true]); }
    const gT = M.touffe();
    [false, true].forEach(fleurs => {
      const sous = touffes.filter(t => !!t[4] === fleurs); if (!sous.length) return;
      const im = new THREE.InstancedMesh(gT, new THREE.MeshLambertMaterial({ map: fleurs ? M.TX.touffeFleurs : M.TX.touffe, alphaTest: 0.45 }), sous.length);
      sous.forEach(([x, z, s, r, , roseau], i) => { _o.position.set(x, hauteur(x, z) - 0.03, z); _o.rotation.set(0, r, 0); _o.scale.set(s * 0.8, roseau ? s * 1.7 : s * 0.75, s * 0.8); _o.updateMatrix(); im.setMatrixAt(i, _o.matrix); im.setColorAt(i, col(roseau ? '#C8D08A' : ['#FFFFFF', '#F4F8E8', '#FFFBEA', '#EEF4DC'][i % 4])); });
      im.receiveShadow = true; im.frustumCulled = false; scene.add(im); herbes.push(im);
    });
  }

  /* ---------- Les personnages ---------- */
  function construirePersonnages() {
    let i = 0;
    for (const id in PNJ) {
      const p = PNJ[id], g = M.personne(tenue(id, i++));
      const y = p.estrade ? estradeY : hauteur(p.x, p.z);
      g.position.set(p.x, y, p.z);
      const vers = p.vers ? POINTS[p.vers].pos : p.estrade ? POINTS.estrade.pos : POINTS[{ aubert: 'route', renaud: 'basilique', etienne: 'bourg', hugues: 'champ' }[id]].pos;
      g.rotation.y = Math.atan2(vers[0] - p.x, vers[1] - p.z);
      g.userData.ph = i * 1.7; g.userData.ep0 = g.userData.epG.position.y;
      scene.add(g); personnages[id] = g;
      const hit = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 2.2, 8), new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(p.x, y + 1.1, p.z); hit.userData.perso = id; scene.add(hit); cibles.push(hit);
      const mk = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), new THREE.MeshBasicMaterial({ color: 0xE3B341 }));
      mk.position.set(p.x, y + 2.3, p.z); mk.userData.y0 = y + 2.3; mk.visible = false; scene.add(mk); marqueurs[id] = mk;
      if (!p.estrade) OBSTACLES.push([p.x - 0.4, p.z - 0.4, p.x + 0.4, p.z + 0.4]);
    }
  }
  const lisser = (a, b, k) => a + (b - a) * k;
  function majPersonnages(t, dt) {
    const k = Math.min(1, dt * 3);
    for (const id in personnages) {
      const f = personnages[id], u = f.userData;
      const souffle = Math.sin(t * 1.6 + u.ph) * 0.004; u.epG.position.y = u.ep0 + souffle; u.epD.position.y = u.ep0 + souffle;
      const dx = cam.pos.x - f.position.x, dz = cam.pos.z - f.position.z, d = Math.hypot(dx, dz);
      let cy = Math.sin(t * 0.23 + u.ph) * 0.3, cx = 0;
      if (d < 16 || id === parleur) {
        let a = Math.atan2(dx, dz) - f.rotation.y; a = Math.atan2(Math.sin(a), Math.cos(a));
        if (Math.abs(a) < 1.9) { cy = Math.max(-1.0, Math.min(1.0, a)); cx = -Math.max(-0.35, Math.min(0.35, Math.atan2(cam.pos.y - f.position.y - 1.6, d))); }
      }
      u.tete.rotation.y = lisser(u.tete.rotation.y, cy, k); u.tete.rotation.x = lisser(u.tete.rotation.x, cx, k);
      // en parlant : la main libre accompagne la parole
      const libreD = !(u.pose.D.c < -0.5 && id === 'aubert'), bras = libreD ? 'D' : 'G', q = u.pose[bras], ep = bras === 'D' ? u.epD : u.epG, co = bras === 'D' ? u.coD : u.coG;
      if (id === parleur) {
        ep.rotation.x = lisser(ep.rotation.x, -0.45 - 0.2 * Math.sin(t * 2.1), k); ep.rotation.y = lisser(ep.rotation.y, 0, k);
        co.rotation.x = lisser(co.rotation.x, -0.9 - 0.35 * Math.sin(t * 3.3 + 1), k);
      } else { ep.rotation.x = lisser(ep.rotation.x, q.x, k); ep.rotation.y = lisser(ep.rotation.y, q.y, k); co.rotation.x = lisser(co.rotation.x, q.c, k); }
    }
  }

  /* ---------- La vie : pèlerins sur la route, oiseaux ---------- */
  function construireVie() {
    const rnd = alea(61), V = variantesFoule().slice(0, 6), gens = [];
    const courbe = new THREE.CatmullRomCurve3(ROUTE.slice(0, 8).map(([x, z]) => new THREE.Vector3(x, 0, z))), long = courbe.getLength();
    for (let k = 0; k < 44; k++) gens.push({ x: 0, y: 0, z: 0, s: 0.9 + rnd() * 0.15, rot: 0, ph: rnd() * 6.28, vif: 0, v: Math.floor(rnd() * V.length), couleurs: {}, u: rnd(), vit: (0.9 + rnd() * 0.5) / long, cote: (rnd() - 0.5) * 3, bras: 0.1 });
    marcheurs = troupe(gens, V, rnd); marcheurs.courbe = courbe;
    // oiseaux
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, 0.12, -0.55, 0.12, -0.05, 0, 0, -0.12, 0, 0, 0.12, 0.55, 0.12, -0.05, 0, 0, -0.12], 3)); g.computeVertexNormals();
    oiseaux = new THREE.InstancedMesh(g, new THREE.MeshBasicMaterial({ color: '#2A2A2E', side: THREE.DoubleSide }), 14); oiseaux.frustumCulled = false;
    oiseaux.userData.p = []; for (let k = 0; k < 14; k++) oiseaux.userData.p.push({ cx: -150 + rnd() * 250, cz: -120 + rnd() * 200, r: 25 + rnd() * 60, h: 105 + rnd() * 40, v: (0.12 + rnd() * 0.12) * (rnd() < 0.5 ? 1 : -1), a: rnd() * TAU });
    scene.add(oiseaux);
  }
  const Mb = new THREE.Matrix4(), Qb = new THREE.Quaternion(), Eb = new THREE.Euler(), Vb = new THREE.Vector3(), Sb = new THREE.Vector3(), Pt = new THREE.Vector3(), Tg = new THREE.Vector3();
  function majVie(t, dt) {
    if (marcheurs) {
      for (const p of marcheurs.gens) {
        p.u = (p.u + p.vit * dt) % 1;
        marcheurs.courbe.getPointAt(p.u, Pt); marcheurs.courbe.getTangentAt(p.u, Tg);
        p.x = Pt.x - Tg.z * p.cote; p.z = Pt.z + Tg.x * p.cote; p.y = hauteur(p.x, p.z) + 0.2 + Math.abs(Math.sin(t * 5.2 + p.ph)) * 0.05; p.rot = Math.atan2(Tg.x, Tg.z);
      }
      placerTroupe(marcheurs, t, 0);
    }
    if (oiseaux) {
      oiseaux.userData.p.forEach((o, i) => {
        o.a += o.v * dt; const x = o.cx + Math.cos(o.a) * o.r, z = o.cz + Math.sin(o.a) * o.r, bat = 0.35 + 0.65 * Math.abs(Math.sin(t * 7 + i));
        Eb.set(0, Math.atan2(-Math.sin(o.a) * Math.sign(o.v), Math.cos(o.a) * Math.sign(o.v)), 0); Qb.setFromEuler(Eb);
        Mb.compose(Vb.set(x, o.h + Math.sin(t * 0.7 + i) * 3, z), Qb, Sb.set(1.2, bat * 1.2, 1.2)); oiseaux.setMatrixAt(i, Mb);
      });
      oiseaux.instanceMatrix.needsUpdate = true;
    }
    for (const f of fumees) {
      f.t = (f.t + dt * 0.12) % 1;
      f.s.position.set(f.x + f.t * 3.5, f.y + f.t * 9, f.z + f.t * 1.2); const e = 1 + f.t * 4.5; f.s.scale.set(e, e, 1);
      f.s.material.opacity = 0.5 * Math.sin(f.t * PI);
    }
    for (const d of drapeaux) {
      const P = d.f.geometry.attributes.position, b = d.base;
      for (let i = 0; i < P.count; i++) { const x = b[i * 3], e = (x * d.sens + 0.85) / 1.7; P.setZ(i, Math.sin(x * 3 * d.sens - t * 3.6) * 0.16 * e); }
      P.needsUpdate = true; d.f.geometry.computeVertexNormals();
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
  function bloque(x, z) {
    for (const [a, b, c, d] of OBSTACLES) if (x > a - 0.3 && x < c + 0.3 && z > b - 0.3 && z < d + 0.3) return true;
    for (const [ax, az, bx, bz] of MURAILLE) { const vx = bx - ax, vz = bz - az, t = Math.max(0, Math.min(1, ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz))); if (Math.hypot(x - ax - vx * t, z - az - vz * t) < 1.6) return true; }
    return Math.abs(x) > 1100 || Math.abs(z) > 1100;
  }
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
        if (!bloque(nx, nz)) { cam.pos.x = nx; cam.pos.z = nz; }
        else if (!bloque(nx, cam.pos.z)) cam.pos.x = nx;
        else if (!bloque(cam.pos.x, nz)) cam.pos.z = nz;
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
  // l'ombre du soleil suit ce que l'on regarde : ombres fines près de la caméra
  let etendueOmbre = 130;
  function majOmbre(focus, etendue) {
    if (!soleil) return;
    const e = etendue || etendueOmbre, sc = soleil.shadow.camera, texel = 2 * e / soleil.shadow.mapSize.x;
    if (sc.right !== e) { sc.left = -e; sc.right = e; sc.top = e; sc.bottom = -e; sc.updateProjectionMatrix(); }
    const fx = Math.round(focus.x / texel) * texel, fz = Math.round(focus.z / texel) * texel;
    soleil.target.position.set(fx, hauteur(fx, fz), fz); soleil.position.copy(soleil.target.position).addScaledVector(DIR_SOLEIL, 700);
    soleil.target.updateMatrixWorld();
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
    el.addEventListener('wheel', e => { e.preventDefault(); camera.fov = Math.max(25, Math.min(72, camera.fov + e.deltaY * 0.02)); camera.updateProjectionMatrix(); }, { passive: false });
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
  S.arreterSermon = () => {
    sermon = null;
    if (foule && foule.agitation) { foule.agitation = 0; placerTroupe(foule, 0, 0); }
    if (bernard) { bernard.userData.appliquer(); bernard.userData.tete.rotation.set(0, 0, 0); }
  };
  function lancerCroix(n, blanc) {
    if (!texCroixCache) texCroixCache = texCroix();
    for (let k = 0; k < n; k++) {
      let c = croix.find(o => !o.visible);
      if (!c) { if (croix.length > 120) return; c = new THREE.Sprite(new THREE.SpriteMaterial({ map: texCroixCache, transparent: true })); c.scale.set(0.5, 0.5, 1); scene.add(c); croix.push(c); }
      const b = foule.gens[Math.floor(Math.random() * Math.min(420, foule.gens.length))];
      c.material.color.set(blanc ? 0xEDE8DC : 0xFFFFFF);
      c.userData = { de: new THREE.Vector3(EST.x + (Math.random() - 0.5) * 3, estradeY + 1.6, EST.z - 1.5), vers: new THREE.Vector3(b.x, b.y + 1.8, b.z), t: 0, duree: 1.4 + Math.random() * 1.2, haut: 5 + Math.random() * 6 };
      c.visible = true; c.material.opacity = 1;
    }
  }
  function majSermon(dt, t) {
    for (const c of croix) if (c.visible) {
      const u = c.userData; u.t += dt / u.duree;
      const k = Math.min(1, u.t); c.position.lerpVectors(u.de, u.vers, k); c.position.y += Math.sin(k * PI) * u.haut;
      if (u.t > 1) c.material.opacity = Math.max(0, 1 - (u.t - 1) * 2); if (u.t > 1.5) c.visible = false;
    }
    if (!sermon) return;
    const s = sermon; s.t += dt;
    const i = Math.min(s.lignes.length - 1, Math.floor(s.t / s.dureeLigne));
    if (i !== s.i) { s.i = i; if (s.surLigne) s.surLigne(i, s.lignes[i]); }
    const l = s.lignes[i], parle = !l.foule && !l.croix, u = bernard.userData;
    // Bernard : bras droit tendu vers la foule, puis les deux bras levés
    u.epD.rotation.set(parle ? -1.0 - Math.sin(t * 2.2) * 0.35 : l.croix ? -1.5 + Math.sin(t * 6) * 0.3 : -2.5, 0, -0.15);
    u.coD.rotation.x = parle ? -0.45 - Math.sin(t * 1.3) * 0.2 : -0.15;
    u.epG.rotation.set(parle ? -0.35 - Math.sin(t * 1.7) * 0.2 : -2.3, 0, 0.15);
    u.coG.rotation.x = parle ? -0.6 : -0.15;
    u.tete.rotation.y = Math.sin(t * 0.6) * 0.45; u.tete.rotation.x = parle ? -0.05 : -0.25;
    foule.agitation += ((l.foule || l.croix ? 1 : 0.06) - foule.agitation) * Math.min(1, dt * 2);
    placerTroupe(foule, t, foule.agitation);
    if (l.foule && Math.random() < dt * 6) lancerCroix(1);
    if (l.croix && Math.random() < dt * 14) lancerCroix(2, Math.random() < 0.35);
    if (s.t >= s.fin) { const f = s.surFin; S.arreterSermon(); if (f) f(); }
  }

  /* ---------- Marqueurs, pause, capture, portraits ---------- */
  S.marquer = ids => { for (const id in marqueurs) marqueurs[id].visible = (ids || []).includes(id); };
  S.pause = p => { enPause = p; };
  S.parle = id => { parleur = id || null; };
  S.capture = (id, l, hh) => {
    const garde = { pos: cam.pos.clone(), yaw: cam.yaw, pitch: cam.pitch };
    const { pos, cible } = pointMonde(id || 'survol'), o = orienterVers(pos, cible);
    cam.pos.copy(pos); cam.yaw = o.yaw; cam.pitch = o.pitch;
    const taille = renderer.getSize(new THREE.Vector2()), ratio = renderer.getPixelRatio(), aspect = camera.aspect, fov = camera.fov;
    renderer.setPixelRatio(1); renderer.setSize(l || 1600, hh || 1000, false); camera.aspect = (l || 1600) / (hh || 1000); camera.fov = POINTS[id || 'survol'].fov || 55; camera.updateProjectionMatrix();
    majCamera(0); ciel.position.copy(camera.position);
    if (id === 'survol' || !id) majOmbre(new THREE.Vector3(-110, 0, -90), 330); else majOmbre(cible.clone().lerp(pos, 0.6));
    renderer.render(scene, camera);
    const url = renderer.domElement.toDataURL('image/jpeg', 0.86);
    renderer.setPixelRatio(ratio); renderer.setSize(taille.x, taille.y, false); camera.aspect = aspect; camera.fov = fov; camera.updateProjectionMatrix();
    cam.pos.copy(garde.pos); cam.yaw = garde.yaw; cam.pitch = garde.pitch;
    return url;
  };
  // portraits des personnages, rendus en 3D pour la fenêtre de dialogue
  function faireportraits() {
    const studio = new THREE.Scene(); studio.background = col('#E3D6BC');
    studio.add(new THREE.HemisphereLight(0xE8EEF4, 0x8A7A5A, 1.1));
    const cle = new THREE.DirectionalLight(0xFFF2DE, 2.2); cle.position.set(-1.5, 2.5, 3); studio.add(cle);
    const cp = new THREE.PerspectiveCamera(27, 1, 0.05, 20), res = {};
    const taille = renderer.getSize(new THREE.Vector2()), ratio = renderer.getPixelRatio(), ombres = renderer.shadowMap.enabled;
    renderer.setPixelRatio(1); renderer.setSize(200, 200, false); renderer.shadowMap.enabled = false;
    (typeof PERSONNAGES !== 'undefined' ? PERSONNAGES : []).forEach((p, i) => {
      const f = M.personne(tenue(p.id, i)); studio.add(f);
      const y = 1.6 * f.scale.y; f.userData.tete.rotation.y = -0.15;
      cp.position.set(0.3, y + 0.05, 0.95); cp.lookAt(0, y - 0.04, 0); cp.updateProjectionMatrix();
      renderer.render(studio, cp); res[p.id] = renderer.domElement.toDataURL('image/jpeg', 0.9);
      studio.remove(f);
    });
    renderer.setPixelRatio(ratio); renderer.setSize(taille.x, taille.y, false); renderer.shadowMap.enabled = ombres;
    return res;
  }
  S.modeSecours = () => {
    ['allerA', 'marquer', 'pause', 'promenade', 'arreterSermon', 'parle'].forEach(k => { S[k] = () => {}; });
    S.sermon = (lignes, rapide, surLigne, surFin) => {
      let i = 0; const pas = () => { if (i < lignes.length) { surLigne(i, lignes[i]); i++; setTimeout(pas, rapide ? 150 : 4000); } else if (surFin) surFin(); }; pas();
    };
    S.portraits = {};
    S.secours = true;
  };

  /* ---------- Qualité adaptée à l'ordinateur ---------- */
  const qualite = { niveau: 0, dts: [], attente: 2.5 };
  function adapter(dt) {
    if (HAUTE || cam.trajet || qualite.niveau >= 4) return;
    if ((qualite.attente -= dt) > 0) return;
    qualite.dts.push(dt);
    if (qualite.dts.length < 60) return;
    const moy = qualite.dts.reduce((a, b) => a + b, 0) / qualite.dts.length; qualite.dts = [];
    if (moy < 0.042) { qualite.niveau = 4; return; }
    qualite.niveau++; qualite.attente = 1.5;
    if (qualite.niveau === 1 && renderer.getPixelRatio() > 1) renderer.setPixelRatio(1);
    else if (qualite.niveau <= 2 && renderer.shadowMap.enabled) { renderer.shadowMap.enabled = false; scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { m.needsUpdate = true; }); }); }
    else if (qualite.niveau === 3) { herbes.forEach(h => { h.visible = false; }); renderer.setPixelRatio(0.8); }
  }

  /* ---------- Initialisation ---------- */
  S.init = (el, opts) => {
    conteneur = el; surClicPerso = opts.surClicPerso;
    renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.72;
    const ombres = opts.ombres !== false;
    renderer.shadowMap.enabled = ombres; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    M.preparer(); materiaux();
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xD3DFE6, 0.0005);
    camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.25, 9000);
    hemi = new THREE.HemisphereLight(0xCFE0F2, 0x6E6244, 0.62); scene.add(hemi);
    soleil = new THREE.DirectionalLight(0xFFF0D6, 1.65);
    if (ombres) { soleil.castShadow = true; soleil.shadow.mapSize.set(2048, 2048); soleil.shadow.camera.near = 50; soleil.shadow.camera.far = 1500; soleil.shadow.bias = -0.0006; soleil.shadow.normalBias = 0.04; }
    scene.add(soleil); scene.add(soleil.target);
    construireCiel();
    construireTerrain();
    construireChemins();
    construireBasilique(); construireBourg(); construireEstrade(); construireFoule(); construireCampement(); construireVegetation(); construirePersonnages(); construireVie();
    brancherControles(renderer.domElement);
    S.allerA('route', { immediat: true });
    try { S.portraits = faireportraits(); } catch (e) { S.portraits = {}; }
    horloge = new THREE.Clock();
    const redim = () => { const w = el.clientWidth, hh = el.clientHeight; if (!w || !hh) return; renderer.setSize(w, hh); camera.aspect = w / hh; camera.updateProjectionMatrix(); };
    if (window.ResizeObserver) new ResizeObserver(redim).observe(el); else window.addEventListener('resize', redim);
    const fwd = new THREE.Vector3();
    const boucle = () => {
      requestAnimationFrame(boucle);
      const dt = Math.min(0.1, horloge.getDelta()), t = horloge.elapsedTime;
      if (enPause) return;
      majCamera(dt); majSermon(dt, t); majPersonnages(t, dt); majVie(t, dt);
      ciel.position.copy(camera.position);
      fwd.set(Math.sin(cam.yaw), 0, -Math.cos(cam.yaw)); majOmbre(fwd.multiplyScalar(cam.trajet ? 60 : 45).add(cam.pos));
      for (const id in marqueurs) if (marqueurs[id].visible) { const m = marqueurs[id]; m.rotation.y = t * 2; m.position.y = m.userData.y0 + Math.sin(t * 3) * 0.08; }
      renderer.render(scene, camera);
      adapter(dt);
    };
    boucle();
  };
  S.hauteur = hauteur;
  S.POINTS = POINTS;
  S.enMouvement = () => !!cam.trajet;
  window.Scene3D = S;
})();
