/* Vézelay, 31 mars 1146 — les objets à examiner (Three.js r150, script classique).
   Chaque objet est modelé ici, à l'échelle réelle (en mètres) : le même modèle est posé dans la scène et montré dans la vitrine,
   où l'on peut le faire tourner. Les textes sont dans donnees.js (OBJETS). */
(function () {
  'use strict';
  const M = window.Modeles, TAU = Math.PI * 2, PI = Math.PI;
  const { place, segment, drape, anneau, toile } = M;
  const O = {};

  /* ---------- Matériaux et textures propres aux objets ---------- */
  const MAT = {};
  const tex = (c, rep) => { const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = 8; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; };
  const texBrute = c => { const t = new THREE.CanvasTexture(c); t.anisotropy = 8; return t; };
  function lignesEcriture(x, x0, y0, w, h, pas, couleur, rnd) { // fausse écriture médiévale (minuscule caroline)
    x.fillStyle = couleur;
    for (let y = y0; y < y0 + h; y += pas) {
      let px = x0; const fin = x0 + w - rnd() * w * (y + pas >= y0 + h ? 0.6 : 0.05);
      while (px < fin) { const lg = 2 + rnd() * 9; x.fillRect(px, y + (rnd() < 0.15 ? -2 : 0), lg, pas * 0.32 + (rnd() < 0.2 ? 3 : 0)); px += lg + 1 + (rnd() < 0.18 ? 5 : 1.5); }
    }
  }
  function texParchemin(graine, opts) {
    opts = opts || {};
    const W = 256, H = 320, c = toile(W, H), x = c.getContext('2d'), rnd = M.alea(graine);
    const g = x.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 230); g.addColorStop(0, '#EFE2C2'); g.addColorStop(1, '#D6BF8E');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    for (let k = 0; k < 40; k++) { x.fillStyle = `rgba(150,110,60,${0.03 + rnd() * 0.05})`; x.beginPath(); x.ellipse(rnd() * W, rnd() * H, 4 + rnd() * 24, 3 + rnd() * 16, rnd() * 3, 0, TAU); x.fill(); }
    if (opts.initiale !== false) {
      x.fillStyle = '#9A2A1E'; x.fillRect(26, 34, 30, 34); x.fillStyle = '#2E4C8E'; x.fillRect(30, 38, 22, 26);
      x.fillStyle = '#D9A93A'; x.font = 'bold 26px serif'; x.fillText(opts.lettre || 'E', 32, 60);
    }
    lignesEcriture(x, 62, 36, 170, 32, 11, 'rgba(45,30,20,0.85)', rnd);
    lignesEcriture(x, 26, 76, 206, opts.court ? 110 : 190, 11, 'rgba(45,30,20,0.85)', rnd);
    if (opts.rouge) { x.fillStyle = 'rgba(150,40,30,0.9)'; x.fillRect(26, 76, 60, 5); }
    return tex(c);
  }
  function texSceau(type) { // relief de cire ou de plomb : sert de couleur et de relief
    const W = 256, c = toile(W, W), x = c.getContext('2d');
    x.fillStyle = '#9A9A9A'; x.fillRect(0, 0, W, W);
    x.strokeStyle = '#D8D8D8'; x.lineWidth = 6; x.beginPath(); x.arc(128, 128, 118, 0, TAU); x.stroke();
    x.beginPath(); x.arc(128, 128, 92, 0, TAU); x.stroke();
    x.fillStyle = '#E4E4E4'; x.font = 'bold 20px serif'; x.textAlign = 'center';
    const legende = { roi: '+ LVDOVICVS DEI GRATIA FRANCORVM REX', abbe: '+ SIGILLVM ABBATIS VIZELIACENSIS', bulle: '' }[type];
    for (let i = 0; i < legende.length; i++) { const a = -PI / 2 + i / legende.length * TAU; x.save(); x.translate(128 + Math.cos(a) * 104, 128 + Math.sin(a) * 104); x.rotate(a + PI / 2); x.fillText(legende[i], 0, 7); x.restore(); }
    x.fillStyle = '#EDEDED'; x.strokeStyle = '#EDEDED';
    if (type === 'roi') { // le roi en majesté, sceptre et fleur de lis
      x.fillRect(96, 150, 64, 10); x.fillRect(100, 160, 8, 26); x.fillRect(148, 160, 8, 26);
      x.beginPath(); x.moveTo(108, 104); x.lineTo(148, 104); x.lineTo(162, 170); x.lineTo(94, 170); x.closePath(); x.fill();
      x.beginPath(); x.arc(128, 86, 15, 0, TAU); x.fill(); x.fillRect(114, 66, 28, 8); for (let k = 0; k < 3; k++) x.fillRect(116 + k * 10, 60, 5, 8);
      x.lineWidth = 5; x.beginPath(); x.moveTo(94, 116); x.lineTo(76, 76); x.stroke(); x.beginPath(); x.arc(76, 70, 7, 0, TAU); x.fill();
      x.beginPath(); x.moveTo(162, 116); x.lineTo(178, 104); x.stroke(); x.beginPath(); x.ellipse(182, 94, 5, 11, 0, 0, TAU); x.fill();
    } else if (type === 'abbe') { // l'abbé debout, crosse à la main
      x.beginPath(); x.moveTo(114, 96); x.lineTo(142, 96); x.lineTo(156, 196); x.lineTo(100, 196); x.closePath(); x.fill();
      x.beginPath(); x.arc(128, 80, 14, 0, TAU); x.fill();
      x.lineWidth = 5; x.beginPath(); x.moveTo(160, 196); x.lineTo(160, 70); x.stroke(); x.beginPath(); x.arc(152, 70, 8, PI, TAU); x.stroke();
    } else { // bulle : saints Pierre et Paul, croix
      x.font = 'bold 30px serif'; x.fillText('SPA   SPE', 128, 74);
      x.fillRect(124, 84, 8, 56); x.fillRect(108, 100, 40, 7);
      [[84, 150], [172, 150]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 26, 0, TAU); x.fill(); x.fillStyle = '#B0B0B0'; for (let k = 0; k < 14; k++) { x.beginPath(); x.arc(a - 12 + (k % 5) * 6, b + 8 + Math.floor(k / 5) * 6, 2.4, 0, TAU); x.fill(); } x.fillStyle = '#EDEDED'; });
    }
    return texBrute(c);
  }
  function texEmail() { // émaux champlevés de Limoges : saints sous des arcades, fond bleu, or
    const W = 256, H = 128, c = toile(W, H), x = c.getContext('2d');
    x.fillStyle = '#C9A13A'; x.fillRect(0, 0, W, H);
    for (let k = 0; k < 4; k++) {
      const x0 = 8 + k * 62;
      x.fillStyle = '#1F3F8E'; x.beginPath(); x.moveTo(x0, H - 8); x.lineTo(x0, 40); x.arc(x0 + 23, 40, 23, PI, 0); x.lineTo(x0 + 46, H - 8); x.closePath(); x.fill();
      x.fillStyle = '#3E8A5A'; x.fillRect(x0 + 4, H - 26, 38, 10);
      x.fillStyle = '#E9D7A4'; x.beginPath(); x.arc(x0 + 23, 44, 8, 0, TAU); x.fill();
      x.strokeStyle = '#E3B341'; x.lineWidth = 3; x.beginPath(); x.arc(x0 + 23, 42, 12, PI * 1.05, PI * 1.95); x.stroke();
      x.fillStyle = k % 2 ? '#B3261E' : '#E9E2D0'; x.beginPath(); x.moveTo(x0 + 13, 56); x.lineTo(x0 + 33, 56); x.lineTo(x0 + 37, H - 28); x.lineTo(x0 + 9, H - 28); x.closePath(); x.fill();
      x.fillStyle = '#FFFFFF'; for (let n = 0; n < 5; n++) { x.beginPath(); x.arc(x0 + 6 + n * 9, 14, 2.4, 0, TAU); x.fill(); }
    }
    return tex(c);
  }
  function texPaille() {
    const W = 128, c = toile(W, W), x = c.getContext('2d'), rnd = M.alea(88);
    x.fillStyle = '#C9A860'; x.fillRect(0, 0, W, W);
    for (let k = 0; k < 500; k++) { const px = rnd() * W, l = 150 + rnd() * 90; x.strokeStyle = `rgb(${l | 0},${(l * 0.82) | 0},${(l * 0.45) | 0})`; x.lineWidth = 1 + rnd(); x.beginPath(); x.moveTo(px, rnd() * W); x.lineTo(px + (rnd() - 0.5) * 6, rnd() * W); x.stroke(); }
    return tex(c, [2, 1]);
  }
  function texCire() { // tablette : cire sombre et lignes grattées au stylet
    const W = 128, H = 160, c = toile(W, H), x = c.getContext('2d'), rnd = M.alea(89);
    x.fillStyle = '#2E3326'; x.fillRect(0, 0, W, H);
    lignesEcriture(x, 12, 14, 104, 130, 10, 'rgba(190,178,130,0.75)', rnd);
    return tex(c);
  }
  function texPiece(or) {
    const W = 64, c = toile(W, W), x = c.getContext('2d');
    x.fillStyle = or ? '#D4A53A' : '#B8BCC0'; x.fillRect(0, 0, W, W);
    x.strokeStyle = or ? '#8E6A1E' : '#6A6E72'; x.lineWidth = 3; x.beginPath(); x.arc(32, 32, 27, 0, TAU); x.stroke();
    x.lineWidth = 4; x.beginPath(); x.moveTo(32, 14); x.lineTo(32, 50); x.moveTo(14, 32); x.lineTo(50, 32); x.stroke();
    return tex(c);
  }
  function texOriflamme() {
    const c = toile(256, 128), x = c.getContext('2d');
    x.fillStyle = '#B3261E'; x.fillRect(0, 0, 256, 128);
    x.fillStyle = 'rgba(255,210,120,0.55)'; for (let k = 0; k < 9; k++) { x.beginPath(); x.arc(30 + k * 26, 20 + (k % 2) * 80, 5, 0, TAU); x.fill(); }
    for (let k = 0; k < 128; k += 3) { x.fillStyle = 'rgba(0,0,0,0.05)'; x.fillRect(0, k, 256, 1); }
    return tex(c);
  }
  function texBoeuf() {
    const c = toile(128, 64), x = c.getContext('2d'), rnd = M.alea(90);
    x.fillStyle = '#C8B89E'; x.fillRect(0, 0, 128, 64);
    for (let k = 0; k < 9; k++) { x.fillStyle = 'rgba(120,90,60,0.35)'; x.beginPath(); x.ellipse(rnd() * 128, rnd() * 64, 6 + rnd() * 14, 4 + rnd() * 8, rnd() * 3, 0, TAU); x.fill(); }
    return tex(c);
  }
  O.preparer = function () {
    if (MAT.or) return;
    MAT.or = new THREE.MeshPhongMaterial({ color: '#D9A93A', specular: 0xFFE3A0, shininess: 90 });
    MAT.fer = new THREE.MeshPhongMaterial({ color: '#8E949A', specular: 0xB0B0B0, shininess: 70 });
    MAT.ferSombre = new THREE.MeshPhongMaterial({ color: '#4A4E52', specular: 0x777777, shininess: 40 });
    MAT.bois = M.matiere('bois:#7A5A38'); MAT.boisSombre = M.matiere('bois:#4E3A26'); MAT.boisClair = M.matiere('bois:#A07A4E');
    MAT.cuir = M.matiere('cuir:#6B4A2E'); MAT.cuirSombre = M.matiere('cuir:#3A2A1E');
    MAT.pierre = M.matMonde('#DCCDAA', M.TX.pierre, 3.2, { local: true, relief: 2 });
    MAT.moellon = M.matMonde('#D2C3A2', M.TX.moellon, 2.6, { local: true, relief: 2 });
    MAT.tuiles = M.matMonde('#A8674C', M.TX.tuiles, 2.2, { local: true, relief: 2 });
    MAT.tuilesT = M.matMonde('#A8674C', M.TX.tuiles, 2.2, { local: true, relief: 2, tourne: true });
    const sR = texSceau('roi'), sA = texSceau('abbe'), sB = texSceau('bulle');
    MAT.cireRoi = new THREE.MeshPhongMaterial({ color: '#E0C38A', map: sR, bumpMap: sR, bumpScale: 3, shininess: 30, specular: 0x333333 });
    MAT.cireAbbe = new THREE.MeshPhongMaterial({ color: '#9A3A28', map: sA, bumpMap: sA, bumpScale: 3, shininess: 35, specular: 0x333333 });
    MAT.plomb = new THREE.MeshPhongMaterial({ color: '#9A9EA2', map: sB, bumpMap: sB, bumpScale: 3, shininess: 25, specular: 0x555555 });
    MAT.cireBord = new THREE.MeshPhongMaterial({ color: '#8E3A26', shininess: 30 });
    MAT.email = new THREE.MeshPhongMaterial({ map: texEmail(), specular: 0x886633, shininess: 60 });
    MAT.paille = new THREE.MeshLambertMaterial({ map: texPaille() });
    MAT.cire = new THREE.MeshPhongMaterial({ map: texCire(), shininess: 15 });
    MAT.argent = new THREE.MeshPhongMaterial({ map: texPiece(false), specular: 0xCCCCCC, shininess: 60 });
    MAT.besant = new THREE.MeshPhongMaterial({ map: texPiece(true), specular: 0xFFE3A0, shininess: 80 });
    MAT.oriflamme = new THREE.MeshLambertMaterial({ map: texOriflamme(), side: THREE.DoubleSide });
    MAT.boeuf = new THREE.MeshLambertMaterial({ map: texBoeuf() });
    MAT.corne = new THREE.MeshLambertMaterial({ color: '#E8DCC0' });
    MAT.braise = new THREE.MeshBasicMaterial({ color: '#FF8A2A' });
    MAT.cristal = new THREE.MeshPhongMaterial({ color: '#E8F4FF', specular: 0xFFFFFF, shininess: 120, transparent: true, opacity: 0.8 });
    MAT.pain = new THREE.MeshLambertMaterial({ color: '#B87A3A' });
    MAT.drapRouge = M.matiere('tissu:#8E1B1B'); MAT.croixRouge = M.matiere('tissu:#B3261E');
  };
  const parchemins = {};
  const matParchemin = (cle, opts) => parchemins[cle] || (parchemins[cle] = new THREE.MeshLambertMaterial({ map: texParchemin(cle.length * 7 + 3, opts), side: THREE.DoubleSide }));

  /* ---------- Petits outils de modelage ---------- */
  const mesh = (g, geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x || 0, y || 0, z || 0); m.rotation.set(rx || 0, ry || 0, rz || 0); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  function feuille(l, h, courbe, mat) { // parchemin légèrement ondulé
    const geo = new THREE.PlaneGeometry(l, h, 10, 12), P = geo.attributes.position;
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), y = P.getY(i); P.setZ(i, Math.sin(x / l * PI) * courbe * 0.3 + Math.pow(Math.max(0, -y / h - 0.3), 2) * courbe + Math.sin(y * 17) * 0.002); }
    geo.computeVertexNormals();
    return new THREE.Mesh(geo, mat);
  }
  function sceauPendant(g, mat, r, x, y, z, epaisseur) { // sceau de cire pendu à des lacs de soie
    mesh(g, segment(new THREE.Vector3(x, y + 0.12, z), new THREE.Vector3(x, y + r * 0.8, z), 0.004, 0.004, 4), M.matiere('tissu:#2F6A3E'));
    const s = mesh(g, new THREE.CylinderGeometry(r, r, epaisseur || 0.012, 32), [MAT.cireBord, mat, mat], x, y, z, PI / 2);
    return s;
  }
  function epee(g, x, y, z, rx, ry, rz) {
    const e = new THREE.Group(); e.position.set(x, y, z); e.rotation.set(rx || 0, ry || 0, rz || 0); g.add(e);
    const lame = new THREE.Shape(); lame.moveTo(-0.025, 0); lame.lineTo(0.025, 0); lame.lineTo(0.02, 0.72); lame.lineTo(0, 0.8); lame.lineTo(-0.02, 0.72); lame.lineTo(-0.025, 0);
    mesh(e, new THREE.ExtrudeGeometry(lame, { depth: 0.006, bevelEnabled: true, bevelThickness: 0.002, bevelSize: 0.003, bevelSegments: 1 }).translate(0, 0, -0.003), MAT.fer);
    mesh(e, new THREE.BoxGeometry(0.2, 0.022, 0.03), MAT.ferSombre, 0, -0.01, 0);
    mesh(e, new THREE.CylinderGeometry(0.015, 0.017, 0.1, 8), MAT.cuirSombre, 0, -0.07, 0);
    mesh(e, new THREE.CylinderGeometry(0.03, 0.03, 0.022, 12), MAT.ferSombre, 0, -0.13, 0, PI / 2);
    return e;
  }
  function eperon(g, x, y, z, ry) {
    const e = new THREE.Group(); e.position.set(x, y, z); e.rotation.y = ry || 0; g.add(e);
    mesh(e, new THREE.TorusGeometry(0.05, 0.006, 5, 16, PI), MAT.fer, 0, 0, 0, PI / 2, 0, 0);
    mesh(e, new THREE.ConeGeometry(0.01, 0.05, 6), MAT.fer, 0, 0, 0.068, PI / 2, 0, 0);
    mesh(e, new THREE.BoxGeometry(0.16, 0.012, 0.006), MAT.cuirSombre, 0, 0, -0.01);
    return e;
  }
  function gerbe(g, x, y, z, rx, ry) { // tiges coupées en bas, lien au milieu, épis ébouriffés en haut
    const s = new THREE.Group(); s.position.set(x, y, z); s.rotation.set(rx || 0, ry || 0, 0); g.add(s);
    mesh(s, drape([[0.2, 0], [0.16, 0.25], [0.11, 0.5], [0.12, 0.62], [0.2, 0.85], [0.27, 1.02], [0.2, 1.12], [0.05, 1.16]], 18, { n: 13, amp: 0.22, haut: 0.62, bas: 1.12, ph: x * 3 }), MAT.paille);
    mesh(s, new THREE.CircleGeometry(0.2, 16).rotateX(PI / 2), MAT.paille);
    mesh(s, anneau(0.118, 0.022, 0.55, 1, 1, 16), M.matiere('cuir:#8A6A3A'));
    return s;
  }
  function tonneau(g, x, y, z, couche) {
    const t = new THREE.Group(); t.position.set(x, y, z); if (couche) t.rotation.z = PI / 2; g.add(t);
    const p = []; for (let k = 0; k <= 8; k++) { const u = k / 8; p.push([0.3 + 0.07 * Math.sin(u * PI), u * 0.85]); }
    mesh(t, new THREE.LatheGeometry(p.map(([r, yy]) => new THREE.Vector2(r, yy)), 18), MAT.boisClair);
    [0.08, 0.3, 0.55, 0.77].forEach(yy => mesh(t, anneau(0.3 + 0.07 * Math.sin(yy / 0.85 * PI) + 0.004, 0.012, yy, 1, 1, 20), MAT.ferSombre));
    [0, 0.85].forEach(yy => mesh(t, new THREE.CircleGeometry(0.29, 18).rotateX(yy ? -PI / 2 : PI / 2).translate(0, yy, 0), MAT.boisSombre));
    return t;
  }
  function boeuf(g, x, z, ry) {
    const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = ry; g.add(b);
    mesh(b, new THREE.SphereGeometry(1, 16, 10).scale(0.42, 0.45, 0.95), MAT.boeuf, 0, 1.12, 0);
    mesh(b, new THREE.SphereGeometry(1, 12, 8).scale(0.38, 0.42, 0.4), MAT.boeuf, 0, 1.18, 0.62);
    mesh(b, segment(new THREE.Vector3(0, 1.28, 0.8), new THREE.Vector3(0, 1.12, 1.18), 0.22, 0.16, 10), MAT.boeuf);
    mesh(b, segment(new THREE.Vector3(0, 1.12, 1.15), new THREE.Vector3(0, 0.88, 1.42), 0.16, 0.11, 10), MAT.boeuf);
    mesh(b, new THREE.SphereGeometry(0.11, 8, 6).scale(1, 0.8, 0.9), MAT.boeuf, 0, 0.86, 1.46);
    [-1, 1].forEach(s => { mesh(b, segment(new THREE.Vector3(s * 0.1, 1.2, 1.18), new THREE.Vector3(s * 0.32, 1.34, 1.1), 0.035, 0.012, 6), MAT.corne); mesh(b, new THREE.SphereGeometry(0.05, 6, 4).scale(0.5, 1, 1.2), MAT.boeuf, s * 0.16, 1.14, 1.12); });
    [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([s, t]) => { mesh(b, segment(new THREE.Vector3(s * 0.22, 0.95, t * 0.58), new THREE.Vector3(s * 0.2, 0.08, t * 0.6), 0.1, 0.06, 8), MAT.boeuf); mesh(b, new THREE.CylinderGeometry(0.06, 0.07, 0.08, 8), M.matiere('cuir:#2A2420'), s * 0.2, 0.04, t * 0.6); });
    mesh(b, segment(new THREE.Vector3(0, 1.2, -0.9), new THREE.Vector3(0, 0.45, -1.02), 0.04, 0.02, 6), MAT.boeuf);
    return b;
  }

  /* ---------- Les objets ---------- */
  const MODELES = {
    bourdon(vitrine) {
      const g = new THREE.Group();
      if (!vitrine) { // croix de chemin
        mesh(g, new THREE.BoxGeometry(1.4, 0.3, 1.4), MAT.pierre, 0, 0.15, 0); mesh(g, new THREE.BoxGeometry(0.9, 0.3, 0.9), MAT.pierre, 0, 0.45, 0);
        mesh(g, new THREE.BoxGeometry(0.2, 2.1, 0.2), MAT.pierre, 0, 1.65, 0); mesh(g, new THREE.BoxGeometry(0.9, 0.2, 0.2), MAT.pierre, 0, 2.3, 0);
      }
      const o = new THREE.Group(); o.position.set(vitrine ? 0 : 0.55, vitrine ? 0 : 0.6, vitrine ? 0 : 0.15); o.rotation.z = vitrine ? 0 : 0.18; g.add(o);
      mesh(o, segment(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 1.75, 0), 0.02, 0.017, 8), MAT.bois);
      mesh(o, new THREE.SphereGeometry(0.035, 10, 8), MAT.boisSombre, 0, 1.76, 0);
      mesh(o, new THREE.ConeGeometry(0.02, 0.1, 8).rotateX(PI), MAT.fer, 0, -0.04, 0);
      mesh(o, new THREE.SphereGeometry(0.07, 12, 10).scale(1, 1.25, 1), M.matiere('cuir:#B08A4A'), 0.08, 1.42, 0.02); // gourde
      mesh(o, new THREE.CylinderGeometry(0.02, 0.025, 0.05, 8), MAT.boisSombre, 0.08, 1.53, 0.02);
      const sac = new THREE.Group(); sac.position.set(-0.08, 1.05, 0.05); o.add(sac);
      mesh(sac, drape([[0.14, -0.2], [0.16, -0.1], [0.14, 0.05], [0.11, 0.1]], 16, { n: 5, amp: 0.05, haut: 0.1, bas: -0.2 }, [1.1, 0.45]), M.matiere('cuir:#8A6A44'));
      mesh(sac, new THREE.BoxGeometry(0.3, 0.12, 0.08), M.matiere('cuir:#7A5A36'), 0, 0.06, 0.02);
      // coquille Saint-Jacques cousue sur la besace
      const cq = new THREE.Group(); cq.position.set(0, -0.07, 0.085); sac.add(cq);
      for (let k = 0; k < 9; k++) { const a = -0.9 + k * 0.225; mesh(cq, new THREE.CylinderGeometry(0.004, 0.012, 0.09, 5), new THREE.MeshLambertMaterial({ color: k % 2 ? '#F2E4D0' : '#E6CFAE' }), Math.sin(a) * 0.04, Math.cos(a) * 0.04 - 0.03, 0, PI / 2 - 0.2, 0, -a); }
      mesh(cq, new THREE.CircleGeometry(0.05, 12, 0, PI).rotateZ(0), new THREE.MeshLambertMaterial({ color: '#EAD6B8', side: THREE.DoubleSide }), 0, -0.035, -0.004);
      mesh(sac, segment(new THREE.Vector3(-0.12, 0.1, 0), new THREE.Vector3(0.08, 0.72, -0.02), 0.008, 0.008, 4), MAT.cuirSombre);
      return g;
    },
    charrue(vitrine) {
      const g = new THREE.Group();
      // charrue à versoir sur avant-train à roues
      const c = new THREE.Group(); g.add(c);
      mesh(c, segment(new THREE.Vector3(0, 0.25, -1.1), new THREE.Vector3(0, 0.62, 1.2), 0.07, 0.06, 8), MAT.bois); // âge
      [-1, 1].forEach(s => mesh(c, segment(new THREE.Vector3(s * 0.08, 0.2, -1.0), new THREE.Vector3(s * 0.3, 1.0, -1.7), 0.035, 0.03, 6), MAT.bois)); // mancherons
      mesh(c, new THREE.BoxGeometry(0.1, 0.12, 0.7), MAT.bois, 0, 0.06, -0.8); // sep
      mesh(c, new THREE.ConeGeometry(0.07, 0.3, 4).rotateX(PI / 2).scale(1.2, 0.6, 1), MAT.fer, 0, 0.05, -0.33); // soc
      mesh(c, segment(new THREE.Vector3(0, 0.55, -0.4), new THREE.Vector3(0, 0.02, -0.25), 0.03, 0.02, 6), MAT.fer); // coutre
      const v = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.35, 4, 3), MAT.boisSombre); v.material = MAT.boisSombre; v.position.set(0.18, 0.2, -0.75); v.rotation.set(0, 0.9, 0.2); v.castShadow = true; c.add(v); // versoir
      [-1, 1].forEach(s => mesh(c, new THREE.CylinderGeometry(0.34, 0.34, 0.07, 16), MAT.bois, s * 0.35, 0.34, 1.05, 0, 0, PI / 2));
      mesh(c, new THREE.CylinderGeometry(0.03, 0.03, 0.8, 6), MAT.fer, 0, 0.34, 1.05, 0, 0, PI / 2);
      // joug
      mesh(g, new THREE.BoxGeometry(1.6, 0.12, 0.14), MAT.bois, 0, 1.2, 2.55);
      mesh(g, segment(new THREE.Vector3(0, 0.62, 1.2), new THREE.Vector3(0, 1.15, 2.5), 0.05, 0.05, 6), MAT.bois);
      boeuf(g, -0.45, 2.75, 0); boeuf(g, 0.45, 2.75, 0);
      return g;
    },
    four(vitrine) {
      const g = new THREE.Group();
      mesh(g, new THREE.BoxGeometry(3.4, 2.6, 3.0), MAT.moellon, 0, 1.3, 0);
      const t = mesh(g, M.prisme(3.8, 1.5, 3.4), [MAT.moellon, MAT.tuilesT], 0, 2.6, 0);
      mesh(g, new THREE.SphereGeometry(1.3, 16, 10, 0, TAU, 0, PI / 2).scale(1, 0.75, 1), MAT.moellon, 0, 0.9, -2.1);
      mesh(g, new THREE.BoxGeometry(0.7, 1.4, 0.7), MAT.moellon, 0.9, 3.2, -0.6);
      // gueule du four et braises
      const bouche = new THREE.Shape(); bouche.moveTo(-0.4, 0); bouche.lineTo(0.4, 0); bouche.lineTo(0.4, 0.4); bouche.absarc(0, 0.4, 0.4, 0, PI); bouche.lineTo(-0.4, 0);
      mesh(g, new THREE.ExtrudeGeometry(bouche, { depth: 0.05, bevelEnabled: false }), new THREE.MeshBasicMaterial({ color: '#2A1406' }), 0, 0.7, 1.49);
      mesh(g, new THREE.SphereGeometry(0.28, 10, 6, 0, TAU, 0, PI / 2).scale(1, 0.4, 0.5), MAT.braise, 0, 0.72, 1.4);
      // planche à pains, pelle à enfourner, fagots
      mesh(g, new THREE.BoxGeometry(1.4, 0.06, 0.5), MAT.boisClair, -1.1, 0.9, 1.9); [-1, 1].forEach(s => mesh(g, new THREE.BoxGeometry(0.06, 0.9, 0.4), MAT.bois, -1.1 + s * 0.6, 0.45, 1.9));
      for (let k = 0; k < 5; k++) mesh(g, new THREE.SphereGeometry(0.12, 10, 6).scale(1, 0.55, 1), MAT.pain, -1.6 + k * 0.25, 0.97, 1.9);
      mesh(g, segment(new THREE.Vector3(0.9, 0, 1.7), new THREE.Vector3(1.3, 2.2, 1.55), 0.025, 0.025, 6), MAT.bois); mesh(g, new THREE.BoxGeometry(0.35, 0.02, 0.45), MAT.boisClair, 0.88, 0.1, 1.72, 0.2, 0, 0);
      for (let k = 0; k < 6; k++) mesh(g, new THREE.CylinderGeometry(0.12, 0.12, 1.2, 8), M.matiere('bois:#6A5236'), 1.3 + (k % 3) * 0.26, 0.14 + Math.floor(k / 3) * 0.22, 0.8, PI / 2, 0.1, 0);
      return g;
    },
    charte(vitrine) {
      const g = new THREE.Group();
      if (!vitrine) {
        mesh(g, new THREE.BoxGeometry(1.4, 0.07, 0.8), MAT.boisClair, 0, 0.85, 0);
        [[-0.6, -0.32], [0.6, -0.32], [-0.6, 0.32], [0.6, 0.32]].forEach(([a, b]) => mesh(g, new THREE.BoxGeometry(0.07, 0.85, 0.07), MAT.bois, a, 0.42, b));
        mesh(g, new THREE.BoxGeometry(0.3, 0.2, 0.22), MAT.boisSombre, 0.45, 0.99, 0.1); // coffret des redevances
        for (let k = 0; k < 7; k++) mesh(g, new THREE.CylinderGeometry(0.012, 0.012, 0.002, 10), MAT.argent, 0.2 + (k % 4) * 0.035, 0.89, -0.15 + Math.floor(k / 4) * 0.04);
        mesh(g, new THREE.CylinderGeometry(0.03, 0.035, 0.05, 10), MAT.ferSombre, -0.45, 0.91, -0.2);
        mesh(g, segment(new THREE.Vector3(-0.45, 0.93, -0.2), new THREE.Vector3(-0.38, 1.12, -0.28), 0.004, 0.001, 4), new THREE.MeshLambertMaterial({ color: '#F4F0E6' }));
      }
      const f = feuille(0.36, 0.46, 0.02, matParchemin('charte', { lettre: 'I' })); f.castShadow = true; g.add(f);
      if (vitrine) { f.position.set(0, 0.3, 0); sceauPendant(g, MAT.cireAbbe, 0.07, 0, 0.0, 0.01); }
      else {
        f.rotation.x = -PI / 2; f.position.set(-0.1, 0.892, 0.02);
        mesh(g, new THREE.CylinderGeometry(0.06, 0.06, 0.014, 32), [MAT.cireBord, MAT.cireAbbe, MAT.cireAbbe], -0.1, 0.897, 0.33);
        mesh(g, segment(new THREE.Vector3(-0.1, 0.892, 0.24), new THREE.Vector3(-0.1, 0.895, 0.29), 0.004, 0.004, 4), M.matiere('tissu:#2F6A3E'));
      }
      return g;
    },
    dime(vitrine) {
      const g = new THREE.Group();
      if (!vitrine) { // grange de l'abbaye
        mesh(g, new THREE.BoxGeometry(8, 4.2, 5.5), MAT.moellon, 0, 2.1, -4.2);
        mesh(g, M.prisme(6.2, 3.2, 8.4).rotateY(PI / 2), [MAT.moellon, MAT.tuiles], 0, 4.2, -4.2);
        mesh(g, new THREE.BoxGeometry(2.4, 2.8, 0.1), MAT.boisSombre, 0, 1.4, -1.44);
      }
      [[-0.7, 0, 0.1, 0.1], [-0.3, 0, -0.2, -0.12], [0.1, 0, 0.15, 0.08], [-1.1, 0, -0.35, -0.05], [0.45, 0, -0.1, 0.15]].forEach(([x, y, z, r], i) => gerbe(g, x, y, z, r, i));
      tonneau(g, 1.2, 0, 0.2); tonneau(g, 1.95, 0, -0.1); tonneau(g, 1.55, 0.62, -0.05, true);
      if (!vitrine) { // bâton de taille : on y compte les parts par des encoches
        mesh(g, new THREE.BoxGeometry(0.04, 0.5, 0.03), MAT.boisClair, -1.6, 0.95, 0.4, 0, 0, 0.4);
      }
      return g;
    },
    epee(vitrine) {
      const g = new THREE.Group();
      if (!vitrine) { // râtelier : lances, écu, casque, coffre
        mesh(g, new THREE.BoxGeometry(2.4, 0.1, 0.1), MAT.bois, 0, 1.5, -0.3); [-1.1, 1.1].forEach(x => mesh(g, new THREE.BoxGeometry(0.12, 1.6, 0.12), MAT.bois, x, 0.8, -0.3));
        for (let k = 0; k < 4; k++) mesh(g, segment(new THREE.Vector3(-0.9 + k * 0.35, 0, -0.45), new THREE.Vector3(-0.8 + k * 0.35, 3.2, -0.2), 0.022, 0.018, 6), MAT.bois);
        for (let k = 0; k < 4; k++) mesh(g, new THREE.ConeGeometry(0.035, 0.22, 4), MAT.fer, -0.8 + k * 0.35, 3.3, -0.19);
        mesh(g, new THREE.BoxGeometry(1.0, 0.5, 0.55), MAT.boisSombre, 0.2, 0.25, 0.25);
        mesh(g, new THREE.BoxGeometry(1.1, 0.03, 0.62), MAT.drapRouge, 0.2, 0.515, 0.25);
        mesh(g, new THREE.ConeGeometry(0.11, 0.2, 16).scale(0.9, 1, 1.05), MAT.fer, 0.55, 0.62, 0.3);
        epee(g, 0.05, 0.56, 0.25, -PI / 2, 0, PI / 2 - 0.1);
        eperon(g, 0.45, 0.545, 0.05, 0.4); eperon(g, 0.62, 0.545, 0.12, 0.6);
      } else { epee(g, 0, 0.14, 0, 0, 0, 0.3); eperon(g, 0.25, 0.1, 0.05, 0.5); eperon(g, 0.3, 0.3, -0.05, 1.2); }
      return g;
    },
    ecu(vitrine) {
      const g = new THREE.Group();
      const f = new THREE.Shape(); f.moveTo(-0.23, 0.3); f.quadraticCurveTo(-0.23, 0.47, 0, 0.47); f.quadraticCurveTo(0.23, 0.47, 0.23, 0.3); f.quadraticCurveTo(0.2, -0.1, 0, -0.48); f.quadraticCurveTo(-0.2, -0.1, -0.23, 0.3);
      const e = new THREE.ExtrudeGeometry(f, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.006, bevelSize: 0.008, bevelSegments: 2, curveSegments: 14 }), P = e.attributes.position;
      for (let i = 0; i < P.count; i++) P.setZ(i, P.getZ(i) - P.getX(i) * P.getX(i) * 0.9);
      e.computeVertexNormals();
      const m = mesh(g, e.scale(1.8, 1.8, 1.8), [M.matiere('ecu:#2F4F8E/#D9A93A'), M.matiere('cuir:#4A3422')], 0, vitrine ? 0.85 : 0.86, 0, vitrine ? 0 : -0.25);
      mesh(g, new THREE.SphereGeometry(0.07, 12, 8, 0, TAU, 0, PI / 2).rotateX(PI / 2), MAT.or, 0, (vitrine ? 0.85 : 0.86) + 0.12 * 1.8, 0.05);
      return g;
    },
    bulle(vitrine) {
      const g = new THREE.Group();
      if (!vitrine) { // pupitre
        mesh(g, new THREE.CylinderGeometry(0.06, 0.1, 1.05, 8), MAT.bois, 0, 0.52, 0); mesh(g, new THREE.CylinderGeometry(0.3, 0.3, 0.05, 12), MAT.bois, 0, 0.03, 0);
        mesh(g, new THREE.BoxGeometry(0.62, 0.04, 0.46), MAT.boisSombre, 0, 1.1, 0, -0.35, 0, 0);
      }
      const f = feuille(0.42, 0.52, 0.015, matParchemin('bulle', { lettre: 'Q', rouge: true })); f.castShadow = true; g.add(f);
      if (vitrine) { f.position.set(0, 0.35, 0); sceauPendant(g, MAT.plomb, 0.045, 0, 0.04, 0.01, 0.01); }
      else { f.rotation.set(-PI / 2 - 0.35, 0, 0); f.position.set(0, 1.14, 0); sceauPendant(g, MAT.plomb, 0.045, 0, 0.84, -0.14, 0.01); }
      return g;
    },
    sceau(vitrine) {
      const g = new THREE.Group();
      if (!vitrine) { mesh(g, new THREE.BoxGeometry(0.7, 0.72, 0.5), MAT.boisSombre, 0, 0.36, 0); mesh(g, new THREE.BoxGeometry(0.6, 0.14, 0.44), M.matiere('tissu:#6E1A24'), 0, 0.79, 0); }
      const f = feuille(0.34, 0.4, 0.015, matParchemin('sceau', { lettre: 'L', court: true }));
      if (vitrine) { f.position.set(0, 0.36, -0.02); g.add(f); sceauPendant(g, MAT.cireRoi, 0.09, 0, 0.05, 0.01, 0.016); }
      else { f.rotation.x = -PI / 2; f.position.set(-0.05, 0.87, -0.05); g.add(f); const s = mesh(g, new THREE.CylinderGeometry(0.085, 0.085, 0.016, 32), [MAT.cireBord, MAT.cireRoi, MAT.cireRoi], 0.12, 0.875, 0.1); }
      return g;
    },
    croix(vitrine) {
      const g = new THREE.Group();
      if (!vitrine) { // panier plein de croix de tissu
        mesh(g, new THREE.CylinderGeometry(0.34, 0.26, 0.32, 18, 1, true), M.matiere('bois:#A68A5A'), 0, 0.16, 0);
        mesh(g, new THREE.CircleGeometry(0.26, 16).rotateX(-PI / 2), M.matiere('bois:#8A6E44'), 0, 0.01, 0);
      }
      const n = vitrine ? 4 : 14;
      for (let k = 0; k < n; k++) {
        const c = new THREE.Group(), a = k * 2.4;
        c.position.set(vitrine ? (k % 2) * 0.22 - 0.11 : Math.cos(a) * 0.18 * (k % 3) / 2, vitrine ? 0.02 + k * 0.012 : 0.3 + (k % 4) * 0.012, vitrine ? Math.floor(k / 2) * 0.22 - 0.11 : Math.sin(a) * 0.14 * (k % 3) / 2);
        c.rotation.set(-PI / 2 + (vitrine ? 0 : 0.2), 0, a); g.add(c);
        mesh(c, new THREE.BoxGeometry(0.05, 0.22, 0.005), MAT.croixRouge); mesh(c, new THREE.BoxGeometry(0.16, 0.05, 0.005), MAT.croixRouge, 0, 0.035, 0);
      }
      return g;
    },
    tablette(vitrine) {
      const g = new THREE.Group();
      if (!vitrine) { mesh(g, new THREE.CylinderGeometry(0.22, 0.22, 0.05, 12), MAT.bois, 0, 0.48, 0); [0, 2.1, 4.2].forEach(a => mesh(g, segment(new THREE.Vector3(Math.cos(a) * 0.14, 0.47, Math.sin(a) * 0.14), new THREE.Vector3(Math.cos(a) * 0.2, 0, Math.sin(a) * 0.2), 0.02, 0.02, 5), MAT.bois)); }
      const y = vitrine ? 0 : 0.51, t = new THREE.Group(); t.position.y = y; g.add(t);
      [-1, 1].forEach(s => { mesh(t, new THREE.BoxGeometry(0.14, 0.018, 0.19), MAT.bois, s * 0.075, 0.009, 0); mesh(t, new THREE.BoxGeometry(0.115, 0.004, 0.165), MAT.cire, s * 0.075, 0.019, 0); });
      mesh(t, segment(new THREE.Vector3(-0.06, 0.03, 0.12), new THREE.Vector3(0.1, 0.03, 0.16), 0.004, 0.002, 5), MAT.fer);
      const rou = mesh(t, new THREE.CylinderGeometry(0.02, 0.02, 0.2, 10), matParchemin('rouleau', {}), 0.1, 0.03, -0.14, 0, 0, PI / 2);
      return g;
    },
    lettre() {
      const g = new THREE.Group();
      const f = feuille(0.34, 0.44, 0.02, matParchemin('lettre', { lettre: 'B' })); f.position.set(0, 0.3, 0); g.add(f);
      sceauPendant(g, MAT.cireAbbe, 0.05, 0, 0.04, 0.01);
      return g;
    },
    oriflamme() {
      const g = new THREE.Group();
      mesh(g, segment(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 2.6, 0), 0.025, 0.02, 8), MAT.bois);
      mesh(g, new THREE.ConeGeometry(0.035, 0.22, 4), MAT.or, 0, 2.7, 0);
      const f = new THREE.Shape(); f.moveTo(0, 0); f.lineTo(1.2, 0); f.lineTo(1.0, -0.15); f.lineTo(1.25, -0.3); f.lineTo(1.0, -0.42); f.lineTo(1.2, -0.6); f.lineTo(0, -0.6); f.lineTo(0, 0);
      const geo = new THREE.ShapeGeometry(f, 8), P = geo.attributes.position, uv = geo.attributes.uv;
      for (let i = 0; i < P.count; i++) { const x = P.getX(i); P.setZ(i, Math.sin(x * 4) * 0.06 * x); uv.setXY(i, x / 1.25, 1 + P.getY(i) / 0.6); }
      geo.computeVertexNormals();
      mesh(g, geo, MAT.oriflamme, 0.02, 2.45, 0);
      return g;
    },
    bourse() { // bourse de cuir fermée par un lacet, deniers d'argent et besants d'or
      const g = new THREE.Group();
      mesh(g, drape([[0.001, 0], [0.07, 0.012], [0.095, 0.05], [0.09, 0.1], [0.06, 0.14], [0.032, 0.16], [0.03, 0.17], [0.05, 0.2]], 18, { n: 7, amp: 0.12, haut: 0.2, bas: 0.02 }), M.matiere('cuir:#5E3E24'));
      mesh(g, anneau(0.033, 0.006, 0.162, 1, 1, 12), M.matiere('cuir:#2E1E12'));
      mesh(g, segment(new THREE.Vector3(0.03, 0.16, 0), new THREE.Vector3(0.09, 0.08, 0.05), 0.004, 0.004, 4), M.matiere('cuir:#2E1E12'));
      const rnd = M.alea(12);
      for (let k = 0; k < 16; k++) { const a = rnd() * 1.6 - 0.2, d = 0.11 + rnd() * 0.12; mesh(g, new THREE.CylinderGeometry(0.014, 0.014, 0.0025, 16), k % 4 ? MAT.argent : MAT.besant, Math.cos(a) * d, 0.0015 + (k % 3) * 0.0028, Math.sin(a) * d, (rnd() - 0.5) * 0.3, 0, (rnd() - 0.5) * 0.3); }
      return g;
    },
    livre() {
      const g = new THREE.Group();
      mesh(g, new THREE.BoxGeometry(0.26, 0.07, 0.34), M.matiere('cuir:#5A2A1E'), 0, 0.035, 0);
      mesh(g, new THREE.BoxGeometry(0.245, 0.055, 0.33), new THREE.MeshLambertMaterial({ color: '#E8DCC0' }), 0.01, 0.035, 0);
      [[-0.09, -0.12], [0.09, -0.12], [-0.09, 0.12], [0.09, 0.12], [0, 0]].forEach(([a, b]) => mesh(g, new THREE.SphereGeometry(0.018, 8, 6, 0, TAU, 0, PI / 2), MAT.or, a, 0.07, b));
      [-0.08, 0.08].forEach(b => mesh(g, new THREE.BoxGeometry(0.06, 0.075, 0.025), MAT.or, 0.13, 0.035, b));
      mesh(g, new THREE.BoxGeometry(0.012, 0.002, 0.12), M.matiere('tissu:#8E1B1B'), -0.02, 0.071, -0.2);
      return g;
    },
    // objets de l'intérieur de la basilique : modèles fournis par interieur.js (vitrine) ou simplifiés ici
    chasse() {
      const g = new THREE.Group(), L = 0.9, P = 0.36, H = 0.4;
      mesh(g, new THREE.BoxGeometry(L, H, P), [MAT.email, MAT.email, MAT.or, MAT.or, MAT.email, MAT.email], 0, 0.12 + H / 2, 0);
      mesh(g, M.prisme(P + 0.08, 0.26, L + 0.04).rotateY(PI / 2), [MAT.or, MAT.email], 0, 0.12 + H, 0);
      for (let k = 0; k < 7; k++) { mesh(g, new THREE.SphereGeometry(0.028, 10, 8), MAT.cristal, -0.36 + k * 0.12, 0.12 + H + 0.3, 0); mesh(g, new THREE.CylinderGeometry(0.008, 0.012, 0.05, 6), MAT.or, -0.36 + k * 0.12, 0.12 + H + 0.27, 0); }
      [[-0.4, -0.14], [0.4, -0.14], [-0.4, 0.14], [0.4, 0.14]].forEach(([a, b]) => mesh(g, new THREE.CylinderGeometry(0.03, 0.04, 0.12, 8), MAT.or, a, 0.06, b));
      mesh(g, new THREE.BoxGeometry(L + 0.02, 0.03, P + 0.02), MAT.or, 0, 0.12, 0); mesh(g, new THREE.BoxGeometry(L + 0.02, 0.03, P + 0.02), MAT.or, 0, 0.12 + H, 0);
      [[-0.2, 0.45], [0.2, 0.45]].forEach(([a, h]) => mesh(g, new THREE.SphereGeometry(0.025, 10, 8), new THREE.MeshPhongMaterial({ color: '#8E1B2E', specular: 0xFFFFFF, shininess: 100 }), a, 0.12 + h * 0.5, P / 2 + 0.005));
      return g;
    }
  };
  O.modele = function (id, vitrine) {
    O.preparer();
    const f = MODELES[id] || (window.Interieur && window.Interieur.modeles && window.Interieur.modeles[id]);
    if (!f) return null;
    const g = f(!!vitrine); g.userData.objet = id;
    return g;
  };
  O.existe = id => !!(MODELES[id] || (window.Interieur && window.Interieur.modeles && window.Interieur.modeles[id]));

  /* ---------- La vitrine : un petit rendu 3D qu'on fait tourner à la souris ou au doigt ---------- */
  let rendu = null, scene = null, cam = null, pivot = null, anim = null, glisse = null;
  const vit = { rx: 0.35, ry: 0.6, auto: true };
  function initVitrine() {
    rendu = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendu.outputEncoding = THREE.sRGBEncoding; rendu.toneMapping = THREE.ACESFilmicToneMapping; rendu.toneMappingExposure = 0.9;
    rendu.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xEAF0F6, 0x6A5A40, 0.9));
    const cle = new THREE.DirectionalLight(0xFFF1DC, 1.9); cle.position.set(-2, 3, 3); scene.add(cle);
    const contre = new THREE.DirectionalLight(0xCFE0FF, 0.8); contre.position.set(3, 1.5, -3); scene.add(contre);
    cam = new THREE.PerspectiveCamera(30, 1, 0.01, 100);
    pivot = new THREE.Group(); scene.add(pivot);
    const el = rendu.domElement; el.style.touchAction = 'none'; el.style.cursor = 'grab';
    el.addEventListener('pointerdown', e => { el.setPointerCapture(e.pointerId); glisse = { x: e.clientX, y: e.clientY }; vit.auto = false; el.style.cursor = 'grabbing'; });
    el.addEventListener('pointermove', e => { if (!glisse) return; vit.ry += (e.clientX - glisse.x) * 0.01; vit.rx = Math.max(-1.2, Math.min(1.3, vit.rx + (e.clientY - glisse.y) * 0.008)); glisse = { x: e.clientX, y: e.clientY }; });
    const fin = () => { glisse = null; el.style.cursor = 'grab'; };
    el.addEventListener('pointerup', fin); el.addEventListener('pointercancel', fin);
    el.addEventListener('wheel', e => { e.preventDefault(); vit.zoom = Math.max(0.6, Math.min(1.8, (vit.zoom || 1) * (1 + e.deltaY * 0.001))); }, { passive: false });
  }
  O.vitrine = function (conteneur, id) {
    try { if (!rendu) initVitrine(); } catch (e) { return false; }
    while (pivot.children.length) pivot.remove(pivot.children[0]);
    const m = O.modele(id, true); if (!m) return false;
    const b = new THREE.Box3().setFromObject(m), c = b.getCenter(new THREE.Vector3()), r = b.getBoundingSphere(new THREE.Sphere()).radius;
    m.position.sub(c); pivot.add(m);
    vit.r = r; vit.rx = 0.3; vit.ry = 0.6; vit.auto = true; vit.zoom = 1;
    const w = conteneur.clientWidth || 280, h = conteneur.clientHeight || 280;
    rendu.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix();
    conteneur.innerHTML = ''; conteneur.appendChild(rendu.domElement);
    cancelAnimationFrame(anim);
    const boucle = () => {
      anim = requestAnimationFrame(boucle);
      if (vit.auto) vit.ry += 0.006;
      pivot.rotation.set(vit.rx, vit.ry, 0);
      const d = vit.r / Math.sin(15 * PI / 180) * 1.05 * vit.zoom; cam.position.set(0, 0, d); cam.near = d / 50; cam.far = d * 4; cam.updateProjectionMatrix(); cam.lookAt(0, 0, 0);
      rendu.render(scene, cam);
    };
    boucle();
    return true;
  };
  O.fermerVitrine = () => { cancelAnimationFrame(anim); anim = null; };

  window.Objets = O;
})();
