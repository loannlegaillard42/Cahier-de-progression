/* Vézelay, 31 mars 1146 — l'intérieur de la basilique (Three.js r150, script classique).
   Scène à part : avant-nef et portail de la Pentecôte, nef romane de dix travées (arcs bicolores, voûtes d'arêtes),
   chœur et châsse des reliques, cierges, rais de lumière, pèlerins en prière. Reconstitution simplifiée.
   Repère : la nef suit l'axe x (du portail intérieur, x = 0, vers le chœur) ; z traverse la nef ; y monte. */
(function () {
  'use strict';
  const M = window.Modeles, TAU = Math.PI * 2, PI = Math.PI;
  const NB = 10, TRAVEE = 6.2, XF = NB * TRAVEE, NEF = 5.5, PILE = 0.8, BC = 11.8;
  const H_ARC = 7.2, R_ARC = (TRAVEE - 2 * PILE) / 2, H_VOUTE = 13.8, H_BC = 7.6;
  const I = { modeles: {} };

  /* ---------- Textures ---------- */
  function texBicolore(n) { // claveaux alternés, calcaire blanc et pierre ocre
    const c = M.toile(512, 64), x = c.getContext('2d'), rnd = M.alea(501);
    for (let k = 0; k < 2 * n; k++) {
      const l = k % 2 ? 150 + rnd() * 20 : 225 + rnd() * 20, w = 512 / (2 * n);
      x.fillStyle = k % 2 ? `rgb(${l | 0},${(l * 0.72) | 0},${(l * 0.52) | 0})` : `rgb(${l | 0},${(l * 0.95) | 0},${(l * 0.84) | 0})`;
      x.fillRect(k * w, 0, w, 64);
      x.fillStyle = 'rgba(70,55,40,0.55)'; x.fillRect(k * w, 0, 2, 64);
    }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8;
    return t;
  }
  function texVitrail() { // verre blanc (grisaille) et plombs
    const c = M.toile(64, 128), x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 0, 128); g.addColorStop(0, '#FFFFFF'); g.addColorStop(1, '#DCE8F2'); x.fillStyle = g; x.fillRect(0, 0, 64, 128);
    x.strokeStyle = 'rgba(60,70,80,0.75)'; x.lineWidth = 2.5;
    for (let k = 0; k < 6; k++) { x.beginPath(); x.moveTo(0, k * 22 + 8); x.lineTo(64, k * 22 + 8); x.stroke(); }
    for (let k = 0; k < 12; k++) { x.beginPath(); x.moveTo((k % 2) * 32 + 16, Math.floor(k / 2) * 22 + 8); x.lineTo((k % 2) * 32 + 16, Math.floor(k / 2) * 22 + 30); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }
  function texRai() { // rai de lumière : dégradé vertical
    const c = M.toile(32, 128), x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 128);
    g.addColorStop(0, 'rgba(255,244,220,0.9)'); g.addColorStop(0.7, 'rgba(255,240,210,0.35)'); g.addColorStop(1, 'rgba(255,240,210,0)');
    x.fillStyle = g; x.fillRect(0, 0, 32, 128);
    const h = x.createLinearGradient(0, 0, 32, 0); h.addColorStop(0, 'rgba(0,0,0,1)'); h.addColorStop(0.25, 'rgba(0,0,0,0)'); h.addColorStop(0.75, 'rgba(0,0,0,0)'); h.addColorStop(1, 'rgba(0,0,0,1)');
    x.globalCompositeOperation = 'destination-out'; x.fillStyle = h; x.fillRect(0, 0, 32, 128);
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }
  function texFlamme() {
    const c = M.toile(32, 64), x = c.getContext('2d'), g = x.createRadialGradient(16, 40, 1, 16, 36, 22);
    g.addColorStop(0, 'rgba(255,255,230,1)'); g.addColorStop(0.35, 'rgba(255,200,90,0.9)'); g.addColorStop(1, 'rgba(255,120,30,0)');
    x.fillStyle = g; x.beginPath(); x.ellipse(16, 38, 9, 24, 0, 0, TAU); x.fill();
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; return t;
  }
  function texPoussiere() {
    const c = M.toile(16, 16), x = c.getContext('2d'), g = x.createRadialGradient(8, 8, 0, 8, 8, 8);
    g.addColorStop(0, 'rgba(255,245,225,1)'); g.addColorStop(1, 'rgba(255,245,225,0)'); x.fillStyle = g; x.fillRect(0, 0, 16, 16);
    return new THREE.CanvasTexture(c);
  }
  // Tympan de la Pentecôte : dessiné en relief dans la moitié haute de la texture (disque de CircleGeometry)
  function texPentecote() {
    const W = 1024, c = M.toile(W, W), x = c.getContext('2d'), cx = 512, rnd = M.alea(777);
    x.fillStyle = '#C8B690'; x.fillRect(0, 0, W, W);
    const clair = '#E6D8B6', moyen = '#CDBB94', ombre = 'rgba(70,52,30,0.45)';
    const figure = (px, py, s, bras, livre) => { // personnage drapé assis, en bas-relief
      x.fillStyle = ombre; x.beginPath(); x.ellipse(px + 3 * s, py + 40 * s, 20 * s, 48 * s, 0, 0, TAU); x.fill();
      x.fillStyle = moyen; x.beginPath(); x.moveTo(px - 14 * s, py + 10 * s); x.lineTo(px + 14 * s, py + 10 * s); x.lineTo(px + 24 * s, py + 88 * s); x.lineTo(px - 24 * s, py + 88 * s); x.closePath(); x.fill();
      x.strokeStyle = 'rgba(90,70,45,0.7)'; x.lineWidth = 1.5 * s; for (let k = 0; k < 5; k++) { x.beginPath(); x.moveTo(px - 10 * s + k * 5 * s, py + 16 * s); x.quadraticCurveTo(px - 16 * s + k * 8 * s, py + 50 * s, px - 20 * s + k * 10 * s, py + 86 * s); x.stroke(); }
      x.fillStyle = clair; x.beginPath(); x.arc(px, py, 10 * s, 0, TAU); x.fill();
      x.strokeStyle = clair; x.lineWidth = 3 * s; x.beginPath(); x.arc(px, py - 1 * s, 15 * s, PI * 1.05, PI * 1.95); x.stroke();
      if (livre) { x.fillStyle = clair; x.fillRect(px - 8 * s, py + 26 * s, 16 * s, 12 * s); }
      if (bras) { x.strokeStyle = moyen; x.lineWidth = 6 * s; x.beginPath(); x.moveTo(px, py + 20 * s); x.lineTo(px + bras * 20 * s, py + 12 * s); x.stroke(); }
    };
    // rayons de l'Esprit, des mains du Christ vers les apôtres
    x.strokeStyle = 'rgba(245,235,205,0.9)'; x.lineWidth = 5;
    for (let k = 0; k < 12; k++) { const cote = k < 6 ? -1 : 1, j = k % 6; x.beginPath(); x.moveTo(cx + cote * 70, 250); x.lineTo(cx + cote * (150 + j * 55), 200 + j * 38); x.stroke(); }
    // mandorle et Christ
    x.fillStyle = ombre; x.beginPath(); x.ellipse(cx + 8, 300, 118, 214, 0, 0, TAU); x.fill();
    x.fillStyle = '#D9C8A2'; x.beginPath(); x.ellipse(cx, 292, 112, 210, 0, 0, TAU); x.fill();
    x.strokeStyle = '#A8946C'; x.lineWidth = 10; x.stroke();
    x.fillStyle = moyen; x.beginPath(); x.moveTo(cx - 40, 190); x.lineTo(cx + 40, 190); x.lineTo(cx + 95, 480); x.lineTo(cx - 95, 480); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(90,70,45,0.75)'; x.lineWidth = 3;
    for (let k = 0; k < 14; k++) { x.beginPath(); x.moveTo(cx - 34 + k * 5, 200); x.bezierCurveTo(cx - 60 + k * 9, 300, cx - 110 + k * 16, 380, cx - 88 + k * 13, 478); x.stroke(); }
    x.strokeStyle = moyen; x.lineWidth = 22; x.beginPath(); x.moveTo(cx - 36, 205); x.lineTo(cx - 76, 245); x.moveTo(cx + 36, 205); x.lineTo(cx + 76, 245); x.stroke();
    x.fillStyle = clair; [[-80, 248], [80, 248]].forEach(([a, b]) => { x.beginPath(); x.arc(cx + a, b, 11, 0, TAU); x.fill(); });
    x.beginPath(); x.arc(cx, 160, 30, 0, TAU); x.fill();
    x.strokeStyle = clair; x.lineWidth = 7; x.beginPath(); x.arc(cx, 156, 44, PI * 1.02, PI * 1.98); x.stroke();
    x.lineWidth = 3; x.beginPath(); x.moveTo(cx, 112); x.lineTo(cx, 200); x.moveTo(cx - 44, 156); x.lineTo(cx + 44, 156); x.stroke();
    // apôtres assis de part et d'autre
    for (let k = 0; k < 12; k++) { const cote = k < 6 ? -1 : 1, j = k % 6; figure(cx + cote * (160 + j * 56), 200 + j * 40, 0.9 - j * 0.05, -cote, j % 2 === 0); }
    // compartiments des peuples lointains, en arc
    x.strokeStyle = '#A8946C'; x.lineWidth = 6;
    for (let k = 0; k < 9; k++) {
      const a0 = PI + k / 9 * PI, a1 = PI + (k + 1) / 9 * PI;
      x.beginPath(); x.arc(cx, 512, 500, a0, a1); x.arc(cx, 512, 420, a1, a0, true); x.closePath(); x.fillStyle = k % 2 ? '#CFBE98' : '#C6B38C'; x.fill(); x.stroke();
      const am = (a0 + a1) / 2, px = cx + Math.cos(am) * 460, py = 512 + Math.sin(am) * 460;
      for (let n = 0; n < 3; n++) { const q = (n - 1) * 0.06; const fx = cx + Math.cos(am + q) * 460, fy = 512 + Math.sin(am + q) * 460; x.fillStyle = clair; x.beginPath(); x.arc(fx, fy - 18, k === 2 ? 12 : 8, 0, TAU); x.fill(); if (k === 2) { x.beginPath(); x.ellipse(fx - 12, fy - 18, 8, 12, 0, 0, TAU); x.ellipse(fx + 12, fy - 18, 8, 12, 0, 0, TAU); x.fill(); } if (k === 5) { x.beginPath(); x.moveTo(fx - 8, fy - 24); x.lineTo(fx + 12, fy - 18); x.lineTo(fx - 8, fy - 12); x.fill(); } x.fillStyle = moyen; x.fillRect(fx - 8, fy - 8, 16, 26); }
    }
    for (let k = 0; k < 2500; k++) { x.fillStyle = `rgba(${rnd() < 0.5 ? '255,250,235' : '80,60,40'},0.08)`; x.fillRect(rnd() * W, rnd() * 512, 2, 2); }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8;
    const b = new THREE.CanvasTexture(c); b.anisotropy = 8;
    return { t, b };
  }
  function texChapiteau(moulin) { // corbeille sculptée : feuillages, ou Moïse et saint Paul au moulin
    const W = 512, H = 256, c = M.toile(W, H), x = c.getContext('2d'), rnd = M.alea(moulin ? 61 : 62);
    x.fillStyle = '#CDBB96'; x.fillRect(0, 0, W, H);
    const clair = '#E8DAB8', sombre = 'rgba(70,52,30,0.5)';
    if (!moulin) {
      for (let k = 0; k < 8; k++) { const px = k * 64 + 32; x.fillStyle = sombre; x.beginPath(); x.ellipse(px + 4, 150, 26, 90, 0, 0, TAU); x.fill(); x.fillStyle = clair; x.beginPath(); x.ellipse(px, 146, 22, 88, 0, 0, TAU); x.fill(); x.strokeStyle = 'rgba(120,95,60,0.8)'; x.lineWidth = 3; x.beginPath(); x.moveTo(px, 70); x.lineTo(px, 230); x.stroke(); for (let n = 0; n < 5; n++) { x.beginPath(); x.moveTo(px, 90 + n * 28); x.lineTo(px - 16, 76 + n * 28); x.moveTo(px, 90 + n * 28); x.lineTo(px + 16, 76 + n * 28); x.stroke(); } }
    } else {
      // les quatre faces : Moïse verse le grain, la meule tourne, saint Paul recueille la farine, feuillages
      const perso = (px, sac) => {
        x.fillStyle = sombre; x.beginPath(); x.ellipse(px + 5, 150, 36, 96, 0, 0, TAU); x.fill();
        x.fillStyle = clair; x.beginPath(); x.moveTo(px - 18, 90); x.lineTo(px + 18, 90); x.lineTo(px + 32, 240); x.lineTo(px - 32, 240); x.closePath(); x.fill();
        x.beginPath(); x.arc(px, 70, 18, 0, TAU); x.fill();
        x.fillStyle = 'rgba(120,95,60,0.8)'; x.fillRect(px - 16, 78, 32, 12);
        x.fillStyle = clair; x.beginPath(); x.ellipse(px + sac * 34, 120, 22, 30, sac * 0.5, 0, TAU); x.fill();
        x.strokeStyle = 'rgba(120,95,60,0.8)'; x.lineWidth = 2; for (let n = 0; n < 6; n++) { x.beginPath(); x.moveTo(px - 12 + n * 5, 100); x.lineTo(px - 24 + n * 9, 238); x.stroke(); }
      };
      perso(64, 1);
      x.fillStyle = sombre; x.beginPath(); x.arc(196, 150, 62, 0, TAU); x.fill(); x.fillStyle = clair; x.beginPath(); x.arc(192, 146, 58, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(110,85,55,0.9)'; x.lineWidth = 5; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; x.beginPath(); x.moveTo(192, 146); x.lineTo(192 + Math.cos(a) * 56, 146 + Math.sin(a) * 56); x.stroke(); }
      x.fillStyle = clair; x.fillRect(150, 60, 84, 30); x.beginPath(); x.moveTo(150, 60); x.lineTo(234, 60); x.lineTo(200, 90); x.lineTo(184, 90); x.fill();
      perso(320, -1);
      for (let k = 0; k < 3; k++) { const px = 420 + k * 34; x.fillStyle = clair; x.beginPath(); x.ellipse(px, 150, 16, 84, 0, 0, TAU); x.fill(); }
    }
    for (let k = 0; k < 900; k++) { x.fillStyle = `rgba(${rnd() < 0.5 ? '255,250,235' : '80,60,40'},0.1)`; x.fillRect(rnd() * W, rnd() * H, 2, 2); }
    const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 8;
    const b = new THREE.CanvasTexture(c); b.wrapS = THREE.RepeatWrapping;
    return { t, b };
  }

  /* ---------- Outils ---------- */
  const _o = new THREE.Object3D();
  function Lot() { this.items = new Map(); }
  Lot.prototype.ajout = function (cle, geo, mat, x, y, z, ry, sx, sy, sz, rx, rz) {
    let it = this.items.get(cle); if (!it) this.items.set(cle, it = { geo, mat, m: [] });
    _o.position.set(x, y, z); _o.rotation.set(rx || 0, ry || 0, rz || 0); _o.scale.set(sx || 1, sy || sx || 1, sz || sx || 1); _o.updateMatrix();
    it.m.push(_o.matrix.clone());
  };
  Lot.prototype.poser = function (parent) {
    this.items.forEach(it => { const im = new THREE.InstancedMesh(it.geo, it.mat, it.m.length); it.m.forEach((m, i) => im.setMatrixAt(i, m)); im.frustumCulled = false; parent.add(im); });
  };
  const bloc = (p, mat, w, h, d, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); p.add(m); return m; };
  // voûte d'arêtes au-dessus d'un rectangle : intersection de deux berceaux
  function voute(x0, x1, z0, z1, hNaiss, n) {
    const geo = new THREE.PlaneGeometry(x1 - x0, z1 - z0, n, n).rotateX(PI / 2).translate((x0 + x1) / 2, 0, (z0 + z1) / 2), P = geo.attributes.position;
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, rx = (x1 - x0) / 2, rz = (z1 - z0) / 2, fl = rz;
    for (let i = 0; i < P.count; i++) {
      const dx = (P.getX(i) - cx) / rx, dz = (P.getZ(i) - cz) / rz;
      const y1 = Math.sqrt(Math.max(0, 1 - dz * dz)), y2 = Math.sqrt(Math.max(0, 1 - dx * dx));
      P.setY(i, hNaiss + fl * Math.max(y1, y2));
    }
    geo.computeVertexNormals();
    return geo;
  }
  // statue de pierre à partir d'un personnage
  function statue(p, mat) { const f = M.personne(p); f.traverse(o => { if (o.isMesh) o.material = mat; }); return f; }

  /* ---------- Modèles montrés dans la vitrine ---------- */
  let TX = null;
  function preparer() {
    if (TX) return TX;
    TX = { pente: texPentecote(), chapM: texChapiteau(true), chapF: texChapiteau(false) };
    TX.matTympan = new THREE.MeshLambertMaterial({ map: TX.pente.t, bumpMap: TX.pente.b, bumpScale: 4, side: THREE.DoubleSide });
    TX.matChapM = new THREE.MeshLambertMaterial({ map: TX.chapM.t, bumpMap: TX.chapM.b, bumpScale: 4 });
    TX.matChapF = new THREE.MeshLambertMaterial({ map: TX.chapF.t, bumpMap: TX.chapF.b, bumpScale: 4 });
    TX.pierreObjet = M.matMonde('#DCCDAA', M.TX.pierre, 3, { local: true, relief: 2 });
    return TX;
  }
  I.modeles.tympan = function () {
    const T = preparer(), g = new THREE.Group();
    const t = new THREE.Mesh(new THREE.CircleGeometry(5.2, 64, 0, PI), T.matTympan); t.position.y = 0.7; g.add(t);
    const l = new THREE.Mesh(new THREE.BoxGeometry(10.8, 0.7, 0.5), T.pierreObjet); l.position.set(0, 0.35, -0.2); g.add(l);
    const a = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.4, 8, 48, PI), T.pierreObjet); a.position.set(0, 0.7, 0); g.add(a);
    return g;
  };
  I.modeles.chapiteau = function () {
    const T = preparer(), g = new THREE.Group();
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.36, 0.8, 4, 1, true).rotateY(PI / 4), [T.matChapM]); c.position.y = 0.4; g.add(c);
    const a = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.16, 1.0), T.pierreObjet); a.position.y = 0.88; g.add(a);
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.8, 16), T.pierreObjet); f.position.y = -0.4; g.add(f);
    return g;
  };

  /* ---------- La scène intérieure ---------- */
  I.construire = function (opts) {
    opts = opts || {};
    const T = preparer(), scene = new THREE.Scene();
    scene.background = new THREE.Color('#1E1A16');
    scene.fog = new THREE.FogExp2(0x2C261E, 0.015);
    const pierre = M.matMonde('#E2D4B6', M.TX.pierre, 5.5, { relief: 1.8 }), pierreS = M.matMonde('#D2C2A0', M.TX.pierre, 5.5, { relief: 1.8 });
    const sol = M.matMonde('#B4A688', M.TX.moellon, 7, { relief: 1.6 }), enduit = M.matMonde('#E6DCC6', M.TX.moellon, 4, { relief: 0.8, double: true });
    const verre = new THREE.MeshBasicMaterial({ map: texVitrail(), color: '#FFFFFF' });
    const cibles = [], obstacles = [], L = new Lot();
    // sol, murs extérieurs, avant-nef
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(XF + 40, 2 * BC + 4).rotateX(-PI / 2).translate(XF / 2 - 2, 0, 0), sol); scene.add(sg);
    [-1, 1].forEach(s => {
      bloc(scene, pierre, XF, H_BC + 3.4, 0.8, XF / 2, (H_BC + 3.4) / 2, s * (BC + 0.4));
      bloc(scene, pierre, 17, 21, 0.8, -8.5, 10.5, s * 13.4);
    });
    bloc(scene, pierre, 0.8, 21, 27.6, -17.4, 10.5, 0);
    bloc(scene, enduit, 17.6, 0.6, 27.6, -8.5, 21, 0); // plafond de l'avant-nef
    // mur du portail intérieur, percé de deux portes, avec le tympan
    [-1, 1].forEach(s => bloc(scene, pierre, 1.2, 21, 13.4 - 5.4, 0, 10.5, s * (5.4 + (13.4 - 5.4) / 2)));
    const trou = new THREE.Shape(); trou.moveTo(-5.4, 6.2); trou.lineTo(5.4, 6.2); trou.lineTo(5.4, 21); trou.lineTo(-5.4, 21); trou.lineTo(-5.4, 6.2);
    const h = new THREE.Path(); h.moveTo(-5.2, 6.2); h.absarc(0, 6.2, 5.2, PI, 0, true); h.lineTo(-5.2, 6.2); trou.holes.push(h);
    const tr = new THREE.Mesh(new THREE.ExtrudeGeometry(trou, { depth: 1.2, bevelEnabled: false, curveSegments: 24 }).translate(0, 0, -0.6).rotateY(PI / 2), pierre); scene.add(tr);
    const tym = new THREE.Mesh(new THREE.CircleGeometry(5.2, 64, 0, PI), T.matTympan); tym.rotation.y = -PI / 2; tym.position.set(-0.45, 6.2, 0); tym.userData.objet = 'tympan'; scene.add(tym); cibles.push(tym);
    const linteau = bloc(scene, pierreS, 0.7, 0.7, 10.8, -0.5, 5.85, 0);
    [5.6, 6.2].forEach(r => { const a = new THREE.Mesh(new THREE.TorusGeometry(r, 0.3, 8, 48, PI), pierreS); a.rotation.y = -PI / 2; a.position.set(-0.7, 6.2, 0); scene.add(a); });
    bloc(scene, pierreS, 1.0, 5.5, 1.0, -0.4, 2.75, 0); // trumeau
    const jean = statue({ peau: '#fff', tunique: '#fff', longueur: 'traine', barbe: '#fff', cheveux: '#fff', pose: 'mains' }, T.pierreObjet); jean.position.set(-1.0, 2.4, 0); jean.rotation.y = -PI / 2; jean.scale.setScalar(0.95); scene.add(jean);
    bloc(scene, pierreS, 0.8, 0.5, 0.8, -1.0, 2.15, 0);
    [-1, 1].forEach(s => [3.2, 4.1].forEach((d, k) => { const ap = statue({ peau: '#fff', tunique: '#fff', longueur: 'traine', manteau: '#fff', barbe: '#fff', cheveux: '#fff', graine: k + 3 }, T.pierreObjet); ap.position.set(-0.9, 0.4, s * (5.4 + 0.6 + k * 0.9)); ap.rotation.y = -PI / 2; ap.scale.setScalar(0.85); scene.add(ap); bloc(scene, pierreS, 0.7, 0.4, 0.7, -0.9, 0.2, s * (5.4 + 0.6 + k * 0.9)); }));
    // nef : piles, colonnes, chapiteaux, arcades bicolores, murs hauts, fenêtres, doubleaux, voûtes
    const matArc = n => { const m = new THREE.MeshLambertMaterial({ map: texBicolore(n) }); m.map.repeat.set(1, 1); return m; };
    const arcA = matArc(9), arcD = matArc(18), arcB = matArc(10);
    const colonne = new THREE.CylinderGeometry(0.34, 0.36, 1, 14).translate(0, 0.5, 0), chap = new THREE.CylinderGeometry(0.62, 0.36, 0.8, 4, 1, false).rotateY(PI / 4), tailloir = new THREE.BoxGeometry(1.1, 0.18, 1.1);
    for (let i = 0; i <= NB; i++) [-1, 1].forEach(s => {
      const x = i * TRAVEE, z = s * (NEF + PILE);
      L.ajout('pile', new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), pierre, x, 0, z, 0, 2 * PILE, H_ARC, 2 * PILE);
      L.ajout('col', colonne, pierre, x, 0, z - s * (PILE + 0.2), 0, 1, H_VOUTE - 0.9, 1); // colonne engagée côté nef, jusqu'aux voûtes
      L.ajout('col', colonne, pierre, x + (i < NB ? PILE + 0.2 : 0), 0, z, 0, 1, H_ARC - 0.8, 1);
      L.ajout('col', colonne, pierre, x - (i > 0 ? PILE + 0.2 : 0), 0, z, 0, 1, H_ARC - 0.8, 1);
      L.ajout('col', colonne, pierre, x, 0, z + s * (PILE + 0.2), 0, 1, H_BC - 0.8, 1);
      const moulin = i === 3 && s < 0;
      L.ajout('chap', chap, T.matChapF, x, H_VOUTE - 0.5, z - s * (PILE + 0.2), 0);
      [[x + PILE + 0.2, z], [x - PILE - 0.2, z]].forEach(([a, b], k) => { if (!(moulin && k === 0)) L.ajout('chap', chap, T.matChapF, a, H_ARC - 0.4, b, 0); });
      L.ajout('tailloir', tailloir, pierreS, x, H_ARC, z, 0, 2.3, 1, 2.3);
      obstacles.push([x, z, 1.3]);
      if (moulin) { // le chapiteau du moulin, à la retombée de l'arcade
        const cm = new THREE.Mesh(chap, T.matChapM); cm.position.set(x + PILE + 0.2, H_ARC - 0.4, z); cm.rotation.y = PI / 2; cm.userData.objet = 'chapiteau'; scene.add(cm); cibles.push(cm);
      }
      if (i < NB) {
        const xm = x + TRAVEE / 2;
        L.ajout('arcA', new THREE.TorusGeometry(R_ARC, 0.45, 6, 24, PI), arcA, xm, H_ARC, z, 0, 1, 1, 1.9);
        bloc(scene, pierre, TRAVEE, H_VOUTE - H_ARC - R_ARC, 0.8, xm, H_ARC + R_ARC + (H_VOUTE - H_ARC - R_ARC) / 2, z);
        // écoinçons au-dessus des arcades
        const ec = new THREE.Shape(); ec.moveTo(-TRAVEE / 2 + PILE, 0); ec.lineTo(-TRAVEE / 2 + PILE, R_ARC + 0.01); ec.lineTo(TRAVEE / 2 - PILE, R_ARC + 0.01); ec.lineTo(TRAVEE / 2 - PILE, 0); ec.absarc(0, 0, R_ARC, 0, PI, false);
        const eg = new THREE.Mesh(new THREE.ExtrudeGeometry(ec, { depth: 0.8, bevelEnabled: false, curveSegments: 16 }).translate(0, 0, -0.4), pierre); eg.position.set(xm, H_ARC, z); scene.add(eg);
        // fenêtre haute : vitrail blanc et ébrasement
        const fen = new THREE.Shape(); fen.moveTo(-0.7, 0); fen.lineTo(0.7, 0); fen.lineTo(0.7, 1.6); fen.absarc(0, 1.6, 0.7, 0, PI); fen.lineTo(-0.7, 0);
        const fv = new THREE.Mesh(new THREE.ShapeGeometry(fen, 12), verre); fv.position.set(xm, 10.9, z - s * 0.42); fv.rotation.y = s > 0 ? PI : 0; scene.add(fv);
        const fb = new THREE.Mesh(new THREE.ShapeGeometry(fen, 12), verre); fb.position.set(xm, 3.4, s * (BC - 0.02)); fb.scale.setScalar(0.85); fb.rotation.y = s > 0 ? PI : 0; scene.add(fb);
        // voûte d'arêtes du bas-côté
        const vb = new THREE.Mesh(voute(x, x + TRAVEE, s > 0 ? NEF + PILE : -BC, s > 0 ? BC : -(NEF + PILE), H_BC, 14), enduit); scene.add(vb);
      }
      if (i > 0 && i < NB) L.ajout('arcB', new THREE.TorusGeometry((BC - NEF - PILE) / 2, 0.35, 6, 20, PI), arcB, x, H_BC, s * (NEF + PILE + (BC - NEF - PILE) / 2), PI / 2, 1, 1, 1.6);
    });
    [-1, 1].forEach(s => bloc(scene, pierre, XF, 5.8, 0.8, XF / 2, H_VOUTE + 2.9, s * (NEF + 0.4))); // murs sous les voûtes
    for (let i = 0; i <= NB; i++) L.ajout('arcD', new THREE.TorusGeometry(NEF, 0.42, 6, 32, PI), arcD, i * TRAVEE, H_VOUTE, 0, PI / 2, 1, 1, 1.5);
    const vn = []; for (let i = 0; i < NB; i++) vn.push(voute(i * TRAVEE, (i + 1) * TRAVEE, -NEF, NEF, H_VOUTE, 18));
    const vnm = new THREE.Mesh(M.fusionner(vn), enduit); scene.add(vnm);
    // chœur : croisée, degrés, abside en cul-de-four, autel, châsse, cierges
    bloc(scene, pierre, 16, 20, 0.8, XF + 8, 10, -(NEF + 1.2)); bloc(scene, pierre, 16, 20, 0.8, XF + 8, 10, NEF + 1.2);
    [-1, 1].forEach(s => bloc(scene, pierre, 0.8, 20, BC - NEF - 1.2, XF, 10, s * (NEF + 1.2 + (BC - NEF - 1.2) / 2)));
    const vc = new THREE.Mesh(voute(XF, XF + 16, -NEF - 0.8, NEF + 0.8, H_VOUTE, 18), enduit); scene.add(vc);
    for (let k = 0; k < 3; k++) bloc(scene, pierreS, 0.5, 0.2 * (k + 1), 2 * NEF + 1.6, XF + 7 + k * 0.5, 0.1 * (k + 1), 0);
    bloc(scene, pierreS, 9, 0.6, 2 * NEF + 1.6, XF + 12, 0.3, 0);
    const abs = new THREE.Mesh(new THREE.CylinderGeometry(NEF + 0.8, NEF + 0.8, H_VOUTE, 32, 1, true, 0, PI), pierre); abs.position.set(XF + 16, H_VOUTE / 2, 0); abs.material = pierre.clone(); abs.material.onBeforeCompile = pierre.onBeforeCompile; abs.material.customProgramCacheKey = pierre.customProgramCacheKey; abs.material.side = THREE.BackSide; scene.add(abs);
    const cul = new THREE.Mesh(new THREE.SphereGeometry(NEF + 0.8, 32, 12, PI / 2, PI, 0, PI / 2), enduit); cul.position.set(XF + 16, H_VOUTE, 0); scene.add(cul);
    [-0.8, 0, 0.8].forEach(a => { const fv = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 4.2), verre); const r = NEF + 0.7; fv.position.set(XF + 16 + Math.cos(a) * r, 8.5, Math.sin(a) * r); fv.lookAt(XF + 16, 8.5, 0); scene.add(fv); });
    { const pl = new THREE.PointLight(0xE8EEF6, 0.55, 18, 1.6); pl.position.set(XF + 17, 8, 0); scene.add(pl); }
    bloc(scene, pierreS, 1.2, 1.1, 2.6, XF + 14, 1.15, 0);
    const ch = window.Objets.modele('chasse'); ch.position.set(XF + 14, 1.7, 0); ch.rotation.y = PI / 2; ch.scale.setScalar(1.25); scene.add(ch);
    const hc = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.0, 1.4), new THREE.MeshBasicMaterial({ visible: false })); hc.position.set(XF + 14, 2.2, 0); hc.userData.objet = 'chasse'; scene.add(hc); cibles.push(hc);
    obstacles.push([XF + 14, 0, 1.8]);
    // cierges : chandeliers près de l'autel, herse de cierges des pèlerins
    const tf = texFlamme(), flammes = [], lumieres = [];
    const flamme = (x, y, z, s) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tf, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); sp.position.set(x, y, z); sp.scale.set(0.09 * s, 0.18 * s, 1); scene.add(sp); flammes.push(sp); };
    const cire = new THREE.MeshLambertMaterial({ color: '#F2E8CC' }), laiton = new THREE.MeshPhongMaterial({ color: '#B8923A', specular: 0xFFE0A0, shininess: 70 });
    [-1, 1].forEach(s => {
      const x = XF + 13.2, z = s * 1.9;
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.22, 1.5, 10), laiton); c.position.set(x, 1.35, z); scene.add(c);
      const b = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.5, 8), cire); b.position.set(x, 2.35, z); scene.add(b);
      flamme(x, 2.7, z, 1.4);
      const pl = new THREE.PointLight(0xFFC98A, 0.7, 9, 2); pl.position.set(x, 2.9, z); scene.add(pl); lumieres.push(pl);
    });
    const herse = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.06, 2.4), new THREE.MeshPhongMaterial({ color: '#3A3430', shininess: 30 })); herse.position.set(XF - 2.5, 1.1, 3.2); scene.add(herse);
    for (let k = 0; k < 14; k++) { const z = 2.1 + k * 0.16, hgt = 0.12 + (k * 37 % 5) * 0.03; const b = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, hgt, 6), cire); b.position.set(XF - 2.5 + (k % 2) * 0.12 - 0.06, 1.13 + hgt / 2, z); scene.add(b); flamme(b.position.x, 1.13 + hgt + 0.06, z, 0.7); }
    const plh = new THREE.PointLight(0xFFC98A, 0.7, 7, 2); plh.position.set(XF - 2.5, 1.8, 3.2); scene.add(plh); lumieres.push(plh);
    obstacles.push([XF - 2.5, 3.2, 1.4]);
    // lumière du jour : ciel diffus, lumière des fenêtres, rais de soleil et poussière
    scene.add(new THREE.HemisphereLight(0xC8D2DE, 0x4A3E30, 0.2));
    for (let k = 0; k < 5; k++) { const pl = new THREE.PointLight(0xE8EEF6, 0.5, 22, 1.6); pl.position.set(k * 13 + 4, 11.5, 2); scene.add(pl); }
    [[-1, 0], [1, 0]].forEach(([s]) => { const pl = new THREE.PointLight(0xE0E8F0, 0.45, 24, 1.6); pl.position.set(-8.5, 12, s * 7); scene.add(pl); });
    const tr2 = texRai();
    for (let i = 0; i < NB; i++) {
      const xm = i * TRAVEE + TRAVEE / 2, g = new THREE.PlaneGeometry(1.5, 15, 1, 1).translate(0, -7.5, 0);
      const r = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: tr2, transparent: true, opacity: 0.2, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false }));
      r.position.set(xm + 0.8, 12.2, NEF + 0.3); r.rotation.set(0.62, 0.35, 0); scene.add(r);
    }
    const nP = 380, pp = new Float32Array(nP * 3), rnd = M.alea(31);
    for (let k = 0; k < nP; k++) { pp[k * 3] = rnd() * XF; pp[k * 3 + 1] = 1 + rnd() * 11; pp[k * 3 + 2] = -NEF + rnd() * 2 * NEF; }
    const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
    const poussiere = new THREE.Points(pg, new THREE.PointsMaterial({ map: texPoussiere(), size: 0.06, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending, color: '#FFF1D8' }));
    scene.add(poussiere);
    // pèlerins et moines en prière
    const gens = [], V = [{ longueur: 'courte', coiffe: 'capuche' }, { sexe: 'f', longueur: 'longue', coiffe: 'voile' }, { longueur: 'mi', coiffe: 'cheveux' }, { longueur: 'longue', coiffe: 'tonsure', capuchonDos: true, manches: 'larges' }];
    const PAL = [['#7A5A3A', '#6B6150', '#5C6B4A', '#8A6A50', '#4A4038'], ['#6E2A3A', '#3E5F7A', '#8A6A50', '#B8AC92'], ['#5A4A3A', '#3E4F6A', '#7A3A2A'], ['#2A2623', '#2A2623']];
    for (let k = 0; k < 64; k++) { const x = 4 + rnd() * (XF - 10), z = (rnd() - 0.5) * 2 * (NEF - 0.8); if (obstacles.some(([a, b, r]) => Math.hypot(x - a, z - b) < r + 0.4)) continue; gens.push({ x, z, v: k < 6 ? 3 : Math.floor(rnd() * 3), r: (rnd() - 0.5) * 0.4, s: 0.9 + rnd() * 0.15 }); }
    [[XF + 10.5, -3], [XF + 10.5, 3], [XF + 11.5, -1.2]].forEach(([x, z]) => gens.push({ x, z, v: 3, r: 0, s: 1 }));
    V.forEach((v, vi) => {
      const liste = gens.filter(p => p.v === vi); if (!liste.length) return;
      const geos = M.silhouette(v);
      for (const couche in geos) {
        const im = new THREE.InstancedMesh(geos[couche], new THREE.MeshLambertMaterial({ map: couche === 'peau' ? null : M.TX.tissu, side: THREE.DoubleSide }), liste.length);
        liste.forEach((p, i) => {
          _o.position.set(p.x, p.x > XF + 6 ? 0.6 : 0, p.z); _o.rotation.set(0, PI / 2 + p.r, 0); _o.scale.setScalar(p.s); _o.updateMatrix();
          const m = _o.matrix.clone(); if (couche === 'bras') m.multiply(new THREE.Matrix4().makeTranslation(0, 1.42, 0)).multiply(new THREE.Matrix4().makeRotationX(-1.1));
          im.setMatrixAt(i, m);
          const pal = couche === 'peau' ? ['#E0B490', '#D2A27A', '#E8C0A0'] : couche === 'coiffe' ? (vi === 1 ? ['#F2EEE6', '#E8E0D0'] : ['#8A6A40', '#4A3424', '#6A4A30']) : couche === 'jambes' ? ['#5E5446', '#4A4038'] : PAL[vi];
          im.setColorAt(i, new THREE.Color(pal[(i * 7 + couche.length) % pal.length]));
        });
        im.frustumCulled = false; scene.add(im);
      }
      liste.forEach(p => obstacles.push([p.x, p.z, 0.45]));
    });
    // points de vue
    const points = {
      narthex: { pos: [-12.5, 1.7, 0.4], cible: [0, 7.2, 0], fov: 62 },
      nef: { pos: [3.2, 1.7, 0.6], cible: [XF + 16, 6.5, 0], fov: 60 },
      chapiteau: { pos: [15.6, 1.7, -2.6], cible: [3 * TRAVEE + PILE + 0.2, H_ARC - 0.5, -(NEF + PILE)], fov: 42 },
      choeur: { pos: [XF + 4, 1.7, 1.4], cible: [XF + 14, 2.2, 0], fov: 52 }
    };
    function bloque(x, z) {
      if (x < -16.4 || x > XF + 18) return true;
      if (x > -0.7 && x < 0.7 && !(Math.abs(z) > 0.6 && Math.abs(z) < 5.0)) return true;
      if (x < 0) return Math.abs(z) > 12.7;
      if (x > XF) return Math.abs(z) > NEF + 0.6 || (x > XF + 6.8 && x < XF + 8.3 && false);
      if (Math.abs(z) > BC - 0.4) return true;
      return obstacles.some(([a, b, r]) => Math.hypot(x - a, z - b) < r);
    }
    L.poser(scene);
    const maj = (t) => {
      flammes.forEach((f, k) => { const e = 1 + Math.sin(t * 13 + k * 1.7) * 0.08 + Math.sin(t * 7.3 + k) * 0.05; f.scale.y = f.userData.h0 = (f.userData.h0 || f.scale.y); f.scale.y = f.userData.h0 * e; });
      lumieres.forEach((l, k) => { l.intensity = 0.7 * (1 + Math.sin(t * 11 + k * 2) * 0.07); });
      const P = pg.attributes.position; for (let k = 0; k < nP; k++) { let y = P.getY(k) + 0.004 * Math.sin(t * 0.5 + k); P.setY(k, y); P.setX(k, P.getX(k) + 0.002 * Math.cos(t * 0.3 + k * 0.7)); } P.needsUpdate = true;
    };
    return { scene, points, cibles, bloque, maj, sol: x => (x > XF + 7.4 ? 0.6 : 0) };
  };

  window.Interieur = I;
})();
