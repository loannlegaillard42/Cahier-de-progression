/* ================= Carte 3D du domaine (three.js r128) ================= */
const Scene3D = (() => {
  const S = { ok: false };
  let renderer, scene, camera, controls, horloge;
  let chemin, cheminLong, echantillons = [], fractions = [];
  let pierres, pierreFrac = [];
  const marqueurs = [], cliquables = [], reliques3D = {};
  let equipe, hibou, faisceau, vif, saule, tentacule, lucioles, nuages = [];
  let anim = null, tween = null, particules = [];
  let survol = null, onClic = () => {}, onSurvol = () => {};
  const EAU = 0.15;
  const rnd = (() => { let a = 1337; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; })();
  const lisse = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const melange = (a, b, t) => a + (b - a) * t;

  function hauteur(x, z) {
    let h = 0.9 * Math.sin(x * 0.07 + 1.3) * Math.cos(z * 0.06) + 0.5 * Math.sin(x * 0.15 + z * 0.12) + 0.3 * Math.cos(x * 0.23 - z * 0.19);
    const dc = Math.hypot(x / 1.25, z + 33);
    h += 7.5 * (1 - lisse(13, 17.5, dc));
    const dp = Math.hypot((x - 42) / 12, (z + 14) / 7);
    h = melange(h, 0.9, 1 - lisse(0.8, 1.25, dp));
    const dl = Math.hypot((x - 22) / 17, (z - 6) / 13);
    h = melange(h, -2.2, 1 - lisse(0.82, 1.12, dl));
    const r = Math.hypot(x, z + 5), ang = Math.atan2(z + 5, x);
    h += lisse(60, 96, r) * (20 + 9 * Math.sin(ang * 5) + 6 * Math.sin(ang * 11 + 1) + 3 * Math.sin(ang * 23));
    return h;
  }
  const dansLac = (x, z) => Math.hypot((x - 22) / 17, (z - 6) / 13) < 1.02;
  const surPlateau = (x, z) => Math.hypot(x / 1.25, z + 33) < 17;

  function init(canvas, rappels) {
    if (!window.THREE || !THREE.OrbitControls) return false;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
    } catch (e) { return false; }
    onClic = rappels.clic; onSurvol = rappels.survol;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene();
    scene.background = ciel();
    scene.fog = new THREE.Fog(0xE9C9A2, 140, 330);
    camera = new THREE.PerspectiveCamera(45, 1, 0.5, 700);
    camera.position.set(70, 78, 95);
    controls = new THREE.OrbitControls(camera, canvas);
    controls.target.set(0, 3, -4);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.minDistance = 14; controls.maxDistance = 170;
    controls.maxPolarAngle = 1.38; controls.screenSpacePanning = false;
    horloge = new THREE.Clock();

    lumieres(); terrain(); eau(); chateau(); serres(); cabane(); quidditch(); decorsLieux(); construireChemin(); arbres(); construireMarqueurs(); construireEquipe(); decorsAnimes();

    const ro = new ResizeObserver(redim); ro.observe(canvas.parentElement); redim();
    evenements(canvas);
    document.fonts && document.fonts.ready.then(() => marqueurs.forEach((m) => m && m.redessiner && m.redessiner()));
    S.ok = true;
    boucle();
    return true;
  }

  function redim() {
    const el = renderer.domElement.parentElement; const w = el.clientWidth, h = el.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix();
  }

  function ciel() {
    const c = document.createElement("canvas"); c.width = 4; c.height = 512; const g = c.getContext("2d");
    const d = g.createLinearGradient(0, 0, 0, 512);
    d.addColorStop(0, "#22385F"); d.addColorStop(0.35, "#5E7BA8"); d.addColorStop(0.62, "#C9B2A0"); d.addColorStop(0.8, "#F2C996"); d.addColorStop(1, "#F6DDB4");
    g.fillStyle = d; g.fillRect(0, 0, 4, 512);
    const t = new THREE.CanvasTexture(c); return t;
  }

  function lumieres() {
    scene.add(new THREE.HemisphereLight(0xC9D8FF, 0x5A4A2E, 0.62));
    scene.add(new THREE.AmbientLight(0xffffff, 0.12));
    const soleil = new THREE.DirectionalLight(0xFFD9A6, 1.05);
    soleil.position.set(-70, 85, 55); soleil.castShadow = true;
    soleil.shadow.mapSize.set(2048, 2048);
    const sc = soleil.shadow.camera; sc.left = -75; sc.right = 75; sc.top = 75; sc.bottom = -75; sc.near = 10; sc.far = 260;
    soleil.shadow.bias = -0.0006;
    scene.add(soleil);
  }

  function terrain() {
    const geo = new THREE.PlaneGeometry(320, 320, 170, 170); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position; const couleurs = new Float32Array(pos.count * 3); const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i); const y = hauteur(x, z); pos.setY(i, y);
      const n = 0.5 + 0.5 * Math.sin(x * 0.9 + z * 1.3) * Math.cos(z * 0.7 - x * 0.4);
      if (y < 0.55 && Math.hypot((x - 22) / 17, (z - 6) / 13) < 1.3) c.set(0xC8B68A);
      else if (y > 30) c.set(0xF2F4F7);
      else if (y > 14) c.set(0x8D8A85).lerp(new THREE.Color(0x6E7A5A), 0.3 * n);
      else if (y > 9 && !surPlateau(x, z)) c.set(0x6E7D4E).lerp(new THREE.Color(0x8D8A85), (y - 9) / 6);
      else if (x < -12 && z > -6 && z < 46 && x > -54) c.set(0x3F6B34).lerp(new THREE.Color(0x4F7D3A), n);
      else if (surPlateau(x, z)) c.set(0x7A9A55).lerp(new THREE.Color(0x9A9C78), n * 0.5);
      else c.set(0x6E9E4C).lerp(new THREE.Color(0x8DB45A), n);
      couleurs[i * 3] = c.r; couleurs[i * 3 + 1] = c.g; couleurs[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(couleurs, 3)); geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
    m.receiveShadow = true; scene.add(m);
  }

  function eau() {
    const g = new THREE.CircleGeometry(1, 64); g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x2C5C7A, roughness: 0.18, metalness: 0.35, transparent: true, opacity: 0.9 }));
    m.scale.set(18.5, 1, 14.5); m.position.set(22, EAU, 6); m.receiveShadow = true; scene.add(m);
    S.eau = m;
    const n = 220, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()); p[i * 3] = 22 + Math.cos(a) * r * 17; p[i * 3 + 1] = EAU + 0.05; p[i * 3 + 2] = 6 + Math.sin(a) * r * 13; }
    const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(p, 3));
    S.reflets = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xFFF1C8, size: 0.35, transparent: true, opacity: 0.6, depthWrite: false }));
    scene.add(S.reflets);
  }

  const MAT = {};
  function mat(nom) {
    if (MAT[nom]) return MAT[nom];
    const def = {
      pierre: { color: 0xCFC6B4, roughness: 0.9, flatShading: true },
      pierreSombre: { color: 0xA89F8E, roughness: 0.9, flatShading: true },
      toit: { color: 0x34405F, roughness: 0.7, flatShading: true },
      fenetre: { color: 0xFFD27A, emissive: 0xFFB84A, emissiveIntensity: 0.9 },
      bois: { color: 0x7A5230, roughness: 0.9, flatShading: true },
      verre: { color: 0xBFE6DA, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.45 },
      or: { color: 0xE2B74A, roughness: 0.25, metalness: 0.9, emissive: 0x4A3508 },
      argent: { color: 0xDDE3EC, roughness: 0.2, metalness: 0.95, emissive: 0x1A1E26 },
    }[nom];
    MAT[nom] = new THREE.MeshStandardMaterial(def); return MAT[nom];
  }
  function ombres(o) { o.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); return o; }
  function boite(w, h, d, m, x, y, z) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(m)); b.position.set(x, y + h / 2, z); return b; }
  function tour(x, z, base, haut, r, toit = true) {
    const g = new THREE.Group();
    const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 1.06, haut - base, 10), mat("pierre")); c.position.set(x, base + (haut - base) / 2, z); g.add(c);
    if (toit) { const t = new THREE.Mesh(new THREE.ConeGeometry(r * 1.3, r * 2.6, 10), mat("toit")); t.position.set(x, haut + r * 1.3, z); g.add(t); }
    else creneaux(g, x, z, haut, r * 1.15, 10);
    for (let k = 0; k < 3; k++) { const a = rnd() * Math.PI * 2, y = base + 2 + rnd() * (haut - base - 3); const f = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.8), mat("fenetre")); f.position.set(x + Math.cos(a) * (r + 0.02), y, z + Math.sin(a) * (r + 0.02)); f.lookAt(x + Math.cos(a) * 9, y, z + Math.sin(a) * 9); g.add(f); }
    return g;
  }
  function creneaux(g, x, z, y, r, n) {
    const disque = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.4, 16), mat("pierreSombre")); disque.position.set(x, y + 0.2, z); g.add(disque);
    for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; const b = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.6), mat("pierre")); b.position.set(x + Math.cos(a) * (r - 0.3), y + 0.8, z + Math.sin(a) * (r - 0.3)); g.add(b); }
  }
  function fenetres(g, x0, x1, y, z, sens) {
    for (let x = x0; x <= x1; x += 1.6) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1), mat("fenetre")); f.position.set(x, y, z); f.rotation.y = sens; g.add(f); }
  }

  function chateau() {
    const g = new THREE.Group(); const b = hauteur(0, -33) - 0.6;
    const hall = boite(15, 6, 7, "pierre", 0, b, -26); g.add(hall);
    const toitHall = new THREE.Mesh(new THREE.CylinderGeometry(4.6, 4.6, 15.4, 3), mat("toit")); toitHall.rotation.set(-Math.PI / 2, 0, Math.PI / 2); toitHall.scale.set(1, 1, 0.55); toitHall.position.set(0, b + 6 + 1.3, -26); g.add(toitHall);
    fenetres(g, -6, 6, b + 3.4, -22.45, 0);
    const donjon = boite(10, 20.1 - b, 9, "pierre", -3, b, -37); g.add(donjon);
    for (const [dx, dz] of [[-4.6, -4.1], [4.6, -4.1], [-4.6, 4.1], [4.6, 4.1]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), mat("pierre")); m.position.set(-3 + dx, 20.6, -37 + dz); g.add(m); }
    fenetres(g, -7, 1, b + 8, -32.45, 0); fenetres(g, -7, 1, b + 13, -32.45, 0);
    const aile = boite(10, 16 - b, 6.5, "pierre", 12.5, b, -31); g.add(aile);
    for (let k = -4; k <= 4; k += 2) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.9, 0.8), mat("pierre")); m.position.set(12.5 + k, 16.45, -27.9); g.add(m); }
    fenetres(g, 8.5, 16.5, b + 4.5, -27.7, 0); fenetres(g, 8.5, 16.5, b + 7.5, -27.7, 0);
    g.add(tour(-14, -41, b, 25, 2.9, false));
    const mat_ = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 4, 6), mat("bois")); mat_.position.set(-15.8, 27, -42.4); g.add(mat_);
    const drapeau = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.1), new THREE.MeshStandardMaterial({ color: 0x2A4C9C, side: THREE.DoubleSide })); drapeau.position.set(-14.9, 28.4, -42.4); g.add(drapeau); S.drapeau = drapeau;
    g.add(tour(9, -42, b, 29, 1.9)); g.add(tour(18, -36, b, 18, 2.1)); g.add(tour(-12, -28, b, 15, 1.8)); g.add(tour(8, -24, b, 12.5, 1.5));
    g.add(tour(4, -45, b, 22, 1.6)); g.add(tour(-20, -34, b, 13, 1.7)); g.add(tour(18, -26, b, 13, 1.6));
    const mur = boite(22, 3, 1.2, "pierreSombre", -6, b, -46); g.add(mur);
    scene.add(ombres(g));
  }

  function serre(x, z, rot) {
    const g = new THREE.Group(); const y = hauteur(x, z) - 0.2;
    const corps = new THREE.Mesh(new THREE.BoxGeometry(6, 2.6, 3.6), mat("verre")); corps.position.set(0, 1.3, 0); g.add(corps);
    const toit = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.1, 6, 3, 1, true), mat("verre")); toit.rotation.set(-Math.PI / 2, 0, Math.PI / 2); toit.scale.set(1, 1, 0.9); toit.position.set(0, 3.55, 0); g.add(toit);
    const cadre = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(6, 2.6, 3.6)), new THREE.LineBasicMaterial({ color: 0x3E5A44 })); cadre.position.y = 1.3; g.add(cadre);
    for (let k = 0; k < 6; k++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.35 + rnd() * 0.25, 7, 6), new THREE.MeshStandardMaterial({ color: [0x4F8F3A, 0x6CA84A, 0xB8447A, 0x3A7D5C][k % 4], flatShading: true })); p.position.set(-2.2 + k * 0.9, 0.5, (k % 2 ? 1 : -1) * 1); g.add(p); }
    g.position.set(x, y, z); g.rotation.y = rot; scene.add(g);
  }
  function serres() { serre(-17, -15.5, 0.3); serre(-25, -9.5, 0.6); serre(-21, -18.5, 0.2); }

  function cabane() {
    const x = -21, z = 12.5, y = hauteur(x, z) - 0.2; const g = new THREE.Group();
    const c = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.3, 2.6, 9), mat("pierreSombre")); c.position.y = 1.3; g.add(c);
    const t = new THREE.Mesh(new THREE.ConeGeometry(2.8, 2.2, 9), new THREE.MeshStandardMaterial({ color: 0x8A6A3A, flatShading: true })); t.position.y = 3.7; g.add(t);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.4, 0.5), mat("pierre")); ch.position.set(1, 4.2, 0.4); g.add(ch);
    const porte = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.6), mat("bois")); porte.position.set(0, 0.8, 2.26); g.add(porte);
    g.position.set(x, y, z); scene.add(ombres(g));
    for (let k = 0; k < 7; k++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.4 + rnd() * 0.5, 8, 6), new THREE.MeshStandardMaterial({ color: 0xE07B22, flatShading: true })); const px = x + 3.5 + rnd() * 3, pz = z - 3 + rnd() * 4; p.scale.y = 0.75; p.position.set(px, hauteur(px, pz) + 0.25, pz); p.castShadow = true; scene.add(p); }
  }

  function quidditch() {
    const g = new THREE.Group(); const cx = 42, cz = -14, y = 0.95;
    const sol = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.3, 40), new THREE.MeshStandardMaterial({ color: 0x7FB05A, flatShading: true })); sol.scale.set(11, 1, 6); sol.position.set(cx, y - 0.1, cz); g.add(sol);
    const ligne = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 4, 60), new THREE.MeshBasicMaterial({ color: 0xffffff })); ligne.rotation.x = Math.PI / 2; ligne.scale.set(10.3, 5.6, 1); ligne.position.set(cx, y + 0.07, cz); g.add(ligne);
    for (const sx of [-1, 1]) for (const [dz, h] of [[-1.6, 5], [0, 6.2], [1.6, 5]]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, h, 6), mat("or")); pole.position.set(cx + sx * 9.6, y + h / 2, cz + dz); g.add(pole);
      const anneau = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.08, 6, 20), mat("or")); anneau.position.set(cx + sx * 9.6, y + h + 0.55, cz + dz); anneau.rotation.y = Math.PI / 2; g.add(anneau);
    }
    ORDRE_MAISONS.forEach((m, i) => { const a = (i / 4) * Math.PI * 2 + Math.PI / 4; const px = cx + Math.cos(a) * 12.5, pz = cz + Math.sin(a) * 7.4;
      const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.1, 5.2, 8), mat("bois")); tr.position.set(px, y + 2.6, pz); g.add(tr);
      const drap = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 1.6, 8, 1, true), new THREE.MeshStandardMaterial({ color: MAISONS[m].c, side: THREE.DoubleSide, flatShading: true })); drap.position.set(px, y + 4.2, pz); g.add(drap);
      const toitT = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2, 8), new THREE.MeshStandardMaterial({ color: MAISONS[m].c, flatShading: true })); toitT.position.set(px, y + 6.2, pz); g.add(toitT); });
    scene.add(ombres(g));
    vif = new THREE.Group();
    const boule = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), new THREE.MeshStandardMaterial({ color: 0xF2C94C, emissive: 0x8A6A10, metalness: 0.8, roughness: 0.25 })); vif.add(boule);
    for (const s of [-1, 1]) { const aile = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.28), new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.85, side: THREE.DoubleSide })); aile.position.x = s * 0.42; aile.userData.s = s; vif.add(aile); }
    scene.add(vif);
  }

  function decorsLieux() {
    // Jardin d'Helga : fleurs et arche
    const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.22, 6, 5), new THREE.MeshStandardMaterial({ flatShading: true }), 90); const c = new THREE.Color(); const mtx = new THREE.Matrix4();
    for (let i = 0; i < 90; i++) { const a = rnd() * Math.PI * 2, r = 2 + rnd() * 4; const x = -31 + Math.cos(a) * r, z = 2 + Math.sin(a) * r; mtx.makeTranslation(x, hauteur(x, z) + 0.2, z); fl.setMatrixAt(i, mtx); fl.setColorAt(i, c.set([0xF2C94C, 0xE86A92, 0xFFFFFF, 0xB07CE0, 0xF29B4C][i % 5])); }
    scene.add(fl);
    const arche = new THREE.Mesh(new THREE.TorusGeometry(2, 0.22, 6, 18, Math.PI), new THREE.MeshStandardMaterial({ color: 0x4F7D3A, flatShading: true })); arche.position.set(-28.5, hauteur(-28.5, -0.5), -0.5); arche.rotation.y = 0.9; arche.castShadow = true; scene.add(arche);
    // Enclos des hippogriffes
    for (let k = 0; k < 20; k++) { const a = (k / 20) * Math.PI * 2; const x = -33 + Math.cos(a) * 5.5, z = 15 + Math.sin(a) * 4.5; const p = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1, 0.2), mat("bois")); p.position.set(x, hauteur(x, z) + 0.5, z); scene.add(p); }
    const hip = hippogriffe(); hip.position.set(-35, hauteur(-35, 16), 16); hip.rotation.y = 0.8; scene.add(hip); S.hippogriffe = hip;
    // Clairière des centaures : cercle de pierres
    for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; const x = -24 + Math.cos(a) * 6, z = 35 + Math.sin(a) * 6; const p = new THREE.Mesh(new THREE.BoxGeometry(0.9, 2.6 + rnd(), 0.6), mat("pierreSombre")); p.position.set(x, hauteur(x, z) + 1.2, z); p.lookAt(-24, p.position.y, 35); p.castShadow = true; scene.add(p); }
    // Saule cogneur
    saule = new THREE.Group(); const sx = -8, sz = 28.5, sy = hauteur(sx, sz);
    const tronc = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 4, 7), mat("bois")); tronc.position.y = 2; tronc.rotation.z = 0.12; saule.add(tronc);
    for (let k = 0; k < 7; k++) { const br = new THREE.Group(); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.2, 3.4, 5), mat("bois")); b.position.y = 1.6; br.add(b); const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 0), new THREE.MeshStandardMaterial({ color: 0x5F8F45, flatShading: true })); f.position.y = 3.3; br.add(f); br.position.y = 3.8; br.rotation.set(0.9, (k / 7) * Math.PI * 2, 0); br.rotation.order = "YXZ"; br.userData.base = 0.9; saule.add(br); }
    saule.position.set(sx, sy, sz); scene.add(ombres(saule));
    // Plateforme de la Salle sous le lac
    const pl = new THREE.Mesh(new THREE.CylinderGeometry(2.4, 2.6, 0.5, 14), new THREE.MeshStandardMaterial({ color: 0x2F5A48, flatShading: true })); pl.position.set(23, 0.35, 2); scene.add(pl);
    const lueur = new THREE.PointLight(0x3EE08A, 1.2, 14); lueur.position.set(23, -0.4, 2); scene.add(lueur);
    const halo = new THREE.Mesh(new THREE.CircleGeometry(4, 32), new THREE.MeshBasicMaterial({ color: 0x3EE08A, transparent: true, opacity: 0.25, depthWrite: false })); halo.rotation.x = -Math.PI / 2; halo.position.set(23, EAU + 0.02, 2); scene.add(halo); S.haloLac = halo;
    // Cachot : porte dans la falaise
    const porte = boite(2.2, 2.6, 1.2, "pierreSombre", 11, hauteur(11, -11.5) - 0.3, -11.5); scene.add(porte);
    const pv = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 1.8), new THREE.MeshStandardMaterial({ color: 0x1D4A32, emissive: 0x0F3A22 })); pv.position.set(11, hauteur(11, -11.5) + 0.6, -10.88); scene.add(pv);
  }

  function hippogriffe() {
    const g = new THREE.Group(); const gris = new THREE.MeshStandardMaterial({ color: 0x8D8D96, flatShading: true });
    const corps = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.8), gris); corps.position.y = 1.2; g.add(corps);
    const tete = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 6), gris); tete.rotation.z = -Math.PI / 2.4; tete.position.set(1.2, 1.9, 0); g.add(tete);
    for (const s of [-1, 1]) { const aile = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.1, 0.9), gris); aile.position.set(0, 1.6, s * 0.75); aile.rotation.x = s * 0.5; g.add(aile); }
    for (const [dx, dz] of [[0.7, 0.3], [0.7, -0.3], [-0.7, 0.3], [-0.7, -0.3]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 5), gris); p.position.set(dx, 0.4, dz); g.add(p); }
    return ombres(g);
  }

  function arbres() {
    const positions = []; const pas = 2.5;
    const clairieres = [[-21, 11, 6.5], [-33, 15, 6.5], [-24, 35, 8], [-39, 28, 4], [-31, 2, 6.5], [-8, 27, 4.5], [-17, -14, 5], [-25, -8, 5], [-9, -13, 4]];
    const proche = (x, z, d) => echantillonsChemin.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < d * d);
    for (let x = -60; x <= 60; x += pas) for (let z = -50; z <= 56; z += pas) {
      const jx = x + (rnd() - 0.5) * pas, jz = z + (rnd() - 0.5) * pas; const y = hauteur(jx, jz);
      const foret = jx < -13 && jx > -56 && jz > -4 && jz < 50;
      let p = foret ? 0.82 : 0.06;
      const r = Math.hypot(jx, jz + 5); if (r > 58) p = y < 22 ? 0.35 : 0;
      if (dansLac(jx, jz) || Math.hypot((jx - 22) / 17, (jz - 6) / 13) < 1.15) p = 0;
      if (surPlateau(jx, jz) || Math.hypot(jx / 1.25, jz + 33) < 19) p = 0;
      if (Math.hypot((jx - 42) / 13, (jz + 14) / 8) < 1.1) p = 0;
      if (clairieres.some(([cx, cz, cr]) => Math.hypot(jx - cx, jz - cz) < cr)) p = 0;
      if (p > 0 && proche(jx, jz, 2.6)) p = 0;
      if (rnd() < p) positions.push([jx, y, jz, foret]);
    }
    const n = positions.length;
    const feuilles = new THREE.InstancedMesh(new THREE.ConeGeometry(1.25, 3.4, 7), new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9 }), n);
    const feuilles2 = new THREE.InstancedMesh(new THREE.ConeGeometry(0.95, 2.4, 7), new THREE.MeshStandardMaterial({ flatShading: true, roughness: 0.9 }), n);
    const troncs = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.18, 0.26, 1.4, 5), mat("bois"), n);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3(), c = new THREE.Color();
    positions.forEach(([x, y, z, foret], i) => {
      const k = 0.75 + rnd() * 0.7; q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 6.28);
      s.set(k, k * (0.9 + rnd() * 0.4), k); v.set(x, y + 0.7 * k, z); m.compose(v, q, s); troncs.setMatrixAt(i, m);
      v.set(x, y + 2.6 * k, z); m.compose(v, q, s); feuilles.setMatrixAt(i, m);
      v.set(x, y + 4.1 * k, z); m.compose(v, q, s); feuilles2.setMatrixAt(i, m);
      c.setHSL(foret ? 0.3 + rnd() * 0.05 : 0.26 + rnd() * 0.06, 0.45, foret ? 0.2 + rnd() * 0.08 : 0.3 + rnd() * 0.08);
      feuilles.setColorAt(i, c); c.offsetHSL(0.01, 0, 0.04); feuilles2.setColorAt(i, c);
    });
    for (const o of [feuilles, feuilles2, troncs]) { o.castShadow = true; o.receiveShadow = true; scene.add(o); }
  }

  /* ---------- Chemin, pierres et marqueurs ---------- */
  let echantillonsChemin = [];
  function pointLieu(l) { return new THREE.Vector3(l.x, l.y != null ? l.y : hauteur(l.x, l.z) + 0.35, l.z); }
  function construireChemin() {
    const pts = []; LIEUX.forEach((l, i) => {
      pts.push(pointLieu(l));
      if (i === 13) pts.push(new THREE.Vector3(26, 10, -24));
      if (i === 14) pts.push(new THREE.Vector3(5, 18.5, -34));
      if (i === 15) pts.push(new THREE.Vector3(-9, 23, -40.5));
    });
    const brut = new THREE.CatmullRomCurve3(pts, false, "centripetal");
    const N = 900; const ajustes = [];
    for (let i = 0; i <= N; i++) {
      const p = brut.getPoint(i / N); const sol = hauteur(p.x, p.z);
      let y = p.y; const enChateau = p.y > sol + 2.5;
      if (!enChateau) y = Math.max(y, sol + 0.3); if (dansLac(p.x, p.z)) y = Math.max(y, EAU + 0.45);
      ajustes.push(new THREE.Vector3(p.x, y, p.z));
    }
    chemin = new THREE.CatmullRomCurve3(ajustes.filter((_, i) => i % 3 === 0 || i === N), false, "centripetal");
    cheminLong = chemin.getLength();
    echantillons = chemin.getSpacedPoints(1200); echantillonsChemin = echantillons;
    fractions = LIEUX.map((l) => { const p = pointLieu(l); let best = 0, d = 1e9; echantillons.forEach((e, i) => { const dd = e.distanceToSquared(p); if (dd < d) { d = dd; best = i; } }); return best / (echantillons.length - 1); });
    fractions[0] = 0; fractions[LIEUX.length - 1] = 1;
    const pas = 1.45 / cheminLong; const liste = [];
    for (let u = 0; u <= 1; u += pas) { if (fractions.some((f) => Math.abs(f - u) * cheminLong < 1.35)) continue; liste.push(u); }
    pierres = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.42, 0.5, 0.16, 7), new THREE.MeshStandardMaterial({ roughness: 0.6, flatShading: true }), liste.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1);
    liste.forEach((u, i) => { const p = chemin.getPointAt(u); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 3); m.compose(p, q, s); pierres.setMatrixAt(i, m); pierres.setColorAt(i, new THREE.Color(0x9A958A)); });
    pierreFrac = liste; pierres.receiveShadow = true; scene.add(pierres);
  }

  function texteSprite(dessin, taille = 256) {
    const c = document.createElement("canvas"); c.width = c.height = taille; const t = new THREE.CanvasTexture(c);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: true, transparent: true }));
    sp.userData.redessiner = () => { const g = c.getContext("2d"); g.clearRect(0, 0, taille, taille); dessin(g, taille); t.needsUpdate = true; };
    sp.userData.redessiner(); return sp;
  }

  function construireMarqueurs() {
    LIEUX.forEach((l, n) => {
      const g = new THREE.Group(); const p = pointLieu(l); g.position.copy(p); g.position.y -= 0.3;
      if (n === 0) {
        const anneau = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.12, 6, 30), mat("or")); anneau.rotation.x = Math.PI / 2; anneau.position.y = 0.15; g.add(anneau);
        scene.add(g); marqueurs.push({ groupe: g, n }); return;
      }
      const ch = chapitreDe(n); const maison = HEROS[ch.heros].maison; const couleur = new THREE.Color(MAISONS[maison].c);
      const socle = new THREE.Mesh(new THREE.CylinderGeometry(l.cp ? 1.5 : 1.1, l.cp ? 1.75 : 1.3, l.cp ? 0.8 : 0.5, 8), mat("pierreSombre")); socle.position.y = l.cp ? 0.4 : 0.25; g.add(socle);
      const orbeMat = new THREE.MeshStandardMaterial({ color: couleur, emissive: couleur, emissiveIntensity: 0.25, roughness: 0.3, metalness: 0.2, flatShading: true });
      const orbe = new THREE.Mesh(new THREE.OctahedronGeometry(l.cp ? 0.75 : 0.55), orbeMat); orbe.position.y = l.cp ? 2.1 : 1.6; g.add(orbe);
      const anneau = new THREE.Mesh(new THREE.TorusGeometry(l.cp ? 1.9 : 1.45, 0.07, 6, 36), new THREE.MeshBasicMaterial({ color: 0xE8C978, transparent: true, opacity: 0.0 })); anneau.rotation.x = Math.PI / 2; anneau.position.y = 0.08; g.add(anneau);
      const etiquette = texteSprite((cx, t) => {
        const etat = g.userData.etat || "verrou";
        cx.beginPath(); cx.arc(t / 2, t / 2, t * 0.42, 0, Math.PI * 2);
        cx.fillStyle = etat === "fait" ? "#E8C978" : etat === "actuel" ? "#FFF6DC" : "rgba(20,22,40,.85)"; cx.fill();
        cx.lineWidth = t * 0.05; cx.strokeStyle = MAISONS[maison].clair; cx.stroke();
        cx.fillStyle = etat === "verrou" ? "#E9E4D4" : "#1B1D33"; cx.font = `700 ${t * 0.42}px Lexend, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle";
        cx.fillText(etat === "fait" ? "✓" : String(n), t / 2, t / 2 + t * 0.03);
      });
      etiquette.scale.set(l.cp ? 2.4 : 2, l.cp ? 2.4 : 2, 1); etiquette.position.y = l.cp ? 3.8 : 3.1; etiquette.renderOrder = 2; g.add(etiquette);
      if (l.cp) {
        const mat_ = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 4.6, 6), mat("or")); mat_.position.set(1.7, 2.3, 0); g.add(mat_);
        const cnv = document.createElement("canvas"); cnv.width = 128; cnv.height = 192; const cx = cnv.getContext("2d");
        cx.fillStyle = MAISONS[maison].c; cx.fillRect(0, 0, 128, 192); cx.fillStyle = MAISONS[maison].c2; cx.fillRect(0, 150, 128, 14); cx.strokeStyle = "#E8C978"; cx.lineWidth = 8; cx.strokeRect(4, 4, 120, 184);
        const tex = new THREE.CanvasTexture(cnv);
        const img = new Image(); img.onload = () => { cx.drawImage(img, 22, 28, 84, 84); tex.needsUpdate = true; }; img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(ICONES[ch.relique].replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" '));
        const ban = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.95), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide })); ban.position.set(2.4, 3.4, 0); g.add(ban); g.userData.banniere = ban;
        const rel = relique3D(ch.relique); rel.position.y = 4.9; rel.visible = false; g.add(rel); reliques3D[ch.relique] = rel;
      }
      g.userData = { ...g.userData, n, orbe, orbeMat, anneau, etiquette };
      [socle, orbe].forEach((o) => { o.userData.n = n; cliquables.push(o); }); o_ombres(g);
      scene.add(g); marqueurs.push({ groupe: g, n, redessiner: etiquette.userData.redessiner });
    });
    faisceau = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.1, 16, 16, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFE3A0, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    scene.add(faisceau);
  }
  function o_ombres(g) { g.traverse((c) => { if (c.isMesh) c.castShadow = true; }); }

  function relique3D(id) {
    const g = new THREE.Group();
    if (id === "coupe") {
      const prof = [[0, 0], [0.55, 0], [0.5, 0.08], [0.14, 0.2], [0.12, 0.55], [0.3, 0.7], [0.62, 1.0], [0.7, 1.45], [0.64, 1.45], [0.56, 1.05], [0, 0.85]].map(([x, y]) => new THREE.Vector2(x, y));
      g.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 24), mat("or")));
      for (const s of [-1, 1]) { const a = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 6, 16, Math.PI), mat("or")); a.position.set(s * 0.72, 1.1, 0); a.rotation.z = s * -Math.PI / 2; g.add(a); }
      g.position.y -= 0.7;
    } else if (id === "epee") {
      const lame = new THREE.Mesh(new THREE.BoxGeometry(0.14, 2.2, 0.04), mat("argent")); lame.position.y = 0.8; g.add(lame);
      const garde = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.12, 0.12), mat("or")); garde.position.y = -0.35; g.add(garde);
      const poignee = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.55, 8), mat("bois")); poignee.position.y = -0.7; g.add(poignee);
      const rubis = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), new THREE.MeshStandardMaterial({ color: 0xC0262C, emissive: 0x6A0A0E, metalness: 0.3, roughness: 0.2 })); rubis.position.set(0, -0.35, 0.08); g.add(rubis);
      const pommeau = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), mat("or")); pommeau.position.y = -1.02; g.add(pommeau);
    } else if (id === "medaillon") {
      const disque = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.12, 28), mat("or")); disque.rotation.x = Math.PI / 2; g.add(disque);
      const pierre = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.14, 28), new THREE.MeshStandardMaterial({ color: 0x1F9A5A, emissive: 0x0C4A2A, metalness: 0.4, roughness: 0.25 })); pierre.rotation.x = Math.PI / 2; g.add(pierre);
      const chaine = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.03, 6, 30), mat("or")); chaine.position.y = 0.95; g.add(chaine);
    } else {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.06, 8, 40, Math.PI), mat("argent")); g.add(arc);
      for (let k = 0; k < 5; k++) { const a = (k + 0.5) / 5 * Math.PI; const pic = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.35 + (k === 2 ? 0.3 : 0), 5), mat("argent")); pic.position.set(Math.cos(a) * 0.75, Math.sin(a) * 0.75 + 0.15, 0); pic.rotation.z = a - Math.PI / 2; g.add(pic); }
      const saphir = new THREE.Mesh(new THREE.OctahedronGeometry(0.16), new THREE.MeshStandardMaterial({ color: 0x3D6FD8, emissive: 0x13306E, metalness: 0.3, roughness: 0.15 })); saphir.position.set(0, 0.78, 0.05); g.add(saphir);
    }
    const lumiere = new THREE.PointLight(0xFFE3A0, 0.9, 7); g.add(lumiere);
    return g;
  }

  function sorcier(maison) {
    const g = new THREE.Group(); const m = MAISONS[maison];
    const robe = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.95, 8), new THREE.MeshStandardMaterial({ color: 0x1D1F33, flatShading: true })); robe.position.y = 0.48; g.add(robe);
    const echarpe = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.06, 6, 12), new THREE.MeshStandardMaterial({ color: m.c })); echarpe.rotation.x = Math.PI / 2; echarpe.position.y = 0.9; g.add(echarpe);
    const tete = new THREE.Mesh(new THREE.SphereGeometry(0.19, 10, 8), new THREE.MeshStandardMaterial({ color: 0xE9D7B8 })); tete.position.y = 1.08; g.add(tete);
    const chapeau = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.55, 8), new THREE.MeshStandardMaterial({ color: m.c, flatShading: true })); chapeau.position.y = 1.43; chapeau.rotation.z = 0.15; g.add(chapeau);
    const bord = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 12), new THREE.MeshStandardMaterial({ color: 0x1D1F33 })); bord.position.y = 1.18; g.add(bord);
    const bag = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.6, 4), mat("bois")); bag.position.set(0.3, 0.75, 0.1); bag.rotation.z = -0.6; g.add(bag);
    const bout = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), new THREE.MeshBasicMaterial({ color: 0xFFF4C0 })); bout.position.set(0.5, 1.0, 0.1); g.add(bout);
    return ombres(g);
  }
  function construireEquipe() {
    equipe = new THREE.Group();
    [["gry", 0.55, 0], ["ser", 0, 0.55], ["pou", -0.55, 0], ["sep", 0, -0.55]].forEach(([m, x, z], i) => { const s = sorcier(m); s.position.set(x, 0, z); s.userData.phase = i; equipe.add(s); });
    hibou = new THREE.Group();
    const corps = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 8), new THREE.MeshStandardMaterial({ color: 0x8A6A4A, flatShading: true })); corps.scale.y = 1.2; hibou.add(corps);
    for (const s of [-1, 1]) { const aile = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.04, 0.22), new THREE.MeshStandardMaterial({ color: 0x6E5238 })); aile.position.x = s * 0.28; aile.userData.s = s; hibou.add(aile); }
    for (const s of [-1, 1]) { const oeil = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), new THREE.MeshBasicMaterial({ color: 0xFFD45E })); oeil.position.set(s * 0.08, 0.08, 0.19); hibou.add(oeil); }
    equipe.add(hibou);
    const halo = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.3, 32), new THREE.MeshBasicMaterial({ color: 0xFFE3A0, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false })); halo.rotation.x = -Math.PI / 2; halo.position.y = 0.05; equipe.add(halo);
    equipe.scale.setScalar(1.5); scene.add(equipe); placerEquipe(0);
  }
  function placerEquipe(u) { const p = chemin.getPointAt(Math.min(1, Math.max(0, u))); equipe.position.set(p.x, p.y - 0.25, p.z); S.u = u; }

  function decorsAnimes() {
    const n = 160, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const x = -52 + rnd() * 40, z = -2 + rnd() * 48; p[i * 3] = x; p[i * 3 + 1] = hauteur(x, z) + 0.8 + rnd() * 3; p[i * 3 + 2] = z; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.userData.base = p.slice();
    lucioles = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xFFF2A8, size: 0.32, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(lucioles);
    const courbe = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -1, 0), new THREE.Vector3(0.6, 1.4, 0), new THREE.Vector3(0.2, 3, 0.3), new THREE.Vector3(1.2, 4, 0.2)]);
    tentacule = new THREE.Mesh(new THREE.TubeGeometry(courbe, 20, 0.25, 6, false), new THREE.MeshStandardMaterial({ color: 0x6A4A7A, flatShading: true })); tentacule.position.set(29, -4, 12); scene.add(tentacule);
    const mb = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.85, flatShading: true });
    for (let k = 0; k < 7; k++) { const g2 = new THREE.Group(); for (let j = 0; j < 4; j++) { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(2.2 + rnd() * 2, 0), mb); s.position.set(j * 2.6, rnd() * 1.2, rnd() * 2); g2.add(s); } const ang = rnd() * Math.PI * 2, ray = 95 + rnd() * 45; g2.position.set(Math.cos(ang) * ray, 58 + rnd() * 16, Math.sin(ang) * ray - 5); g2.userData.v = 0.6 + rnd() * 0.8; scene.add(g2); nuages.push(g2); }
  }

  /* ---------- État visuel ---------- */
  function majEtat(etat, opts = {}) {
    if (!S.ok) return;
    const fait = etat.etape, prep = opts.prep;
    marqueurs.forEach((m) => {
      if (m.n === 0) return; const d = m.groupe.userData; const e = m.n <= fait ? "fait" : m.n === fait + 1 ? "actuel" : "verrou";
      if (d.etat !== e) { d.etat = e; m.redessiner(); }
      const ch = chapitreDe(m.n); const coul = new THREE.Color(e === "fait" ? 0xE8C978 : MAISONS[HEROS[ch.heros].maison].c);
      d.orbeMat.color.copy(e === "verrou" ? new THREE.Color(0x56586A) : coul); d.orbeMat.emissive.copy(e === "verrou" ? new THREE.Color(0x111122) : coul);
      d.orbeMat.emissiveIntensity = e === "actuel" ? 0.7 : e === "fait" ? 0.45 : 0.15;
      d.anneau.material.opacity = e === "actuel" ? 0.9 : e === "fait" ? 0.35 : 0;
      if (d.banniere) d.banniere.visible = e !== "verrou" || prep;
    });
    ORDRE_RELIQUES.forEach((r) => { if (reliques3D[r]) reliques3D[r].visible = etat.reliques.includes(r); });
    const uFait = fractions[Math.min(fait, LIEUX.length - 1)];
    const c = new THREE.Color();
    pierreFrac.forEach((u, i) => { pierres.setColorAt(i, c.set(u <= uFait + 1e-4 ? 0xE8C978 : u <= fractions[Math.min(fait + 1, 16)] ? 0xD9D2BE : 0x8E897F)); });
    pierres.instanceColor.needsUpdate = true;
    const cible = marqueurs.find((m) => m.n === fait + 1);
    faisceau.visible = !!cible; if (cible) { faisceau.position.copy(cible.groupe.position); faisceau.position.y += 8; }
    if (!anim) placerEquipe(fractions[fait]);
  }

  function avancer(de, a, fin) {
    const u0 = fractions[de], u1 = fractions[a]; const duree = Math.min(6, 1.6 + (u1 - u0) * cheminLong / 18);
    anim = { u0, u1, t0: performance.now(), duree: duree * 1000, fin };
    suivreEquipe(true);
  }
  function suivreEquipe(lent) {
    const p = equipe.position; const dir = new THREE.Vector3(22, 27, 34);
    allerA(new THREE.Vector3(p.x, p.y, p.z), dir, lent ? 1400 : 900);
  }
  function viserLieu(n, dist = 1) {
    const l = LIEUX[n]; const p = pointLieu(l); const off = new THREE.Vector3(14, 15, 20).multiplyScalar(dist);
    if (n >= 14) off.set(16, 10, 26).multiplyScalar(dist);
    allerA(p, off, 1200);
  }
  function survolGeneral() { allerA(new THREE.Vector3(2, 3, -4), new THREE.Vector3(62, 72, 88), 1600); }
  function allerA(cible, decalage, ms) {
    tween = { p0: camera.position.clone(), t0c: controls.target.clone(), p1: cible.clone().add(decalage), t1: cible.clone(), debut: performance.now(), ms };
  }
  function cinematique(n, fin) {
    const p = pointLieu(LIEUX[n]); viserLieu(n, 0.8);
    eclat(p.clone().add(new THREE.Vector3(0, 3, 0)), 0xFFE3A0, 180);
    setTimeout(fin, 1700);
  }
  function eclat(pos, couleur, n = 120) {
    const p = new Float32Array(n * 3), v = [];
    for (let i = 0; i < n; i++) { p[i * 3] = pos.x; p[i * 3 + 1] = pos.y; p[i * 3 + 2] = pos.z; const a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI - Math.PI / 2, s = 2 + Math.random() * 5; v.push(new THREE.Vector3(Math.cos(a) * Math.cos(b) * s, Math.abs(Math.sin(b)) * s + 2, Math.sin(a) * Math.cos(b) * s)); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: couleur, size: 0.35, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(pts); particules.push({ pts, v, t0: performance.now() });
  }

  /* ---------- Interaction ---------- */
  function evenements(canvas) {
    const ray = new THREE.Raycaster(); const souris = new THREE.Vector2(); let bas = null;
    const pick = (e) => { const r = canvas.getBoundingClientRect(); souris.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(souris, camera); const h = ray.intersectObjects(cliquables, false)[0]; return h ? h.object.userData.n : null; };
    canvas.addEventListener("pointermove", (e) => { const n = pick(e); if (n !== survol) { survol = n; canvas.style.cursor = n != null ? "pointer" : "grab"; } onSurvol(n, e.clientX, e.clientY); });
    canvas.addEventListener("pointerleave", () => { survol = null; onSurvol(null); });
    canvas.addEventListener("pointerdown", (e) => { bas = [e.clientX, e.clientY]; tween = null; });
    canvas.addEventListener("pointerup", (e) => { if (!bas) return; const d = Math.hypot(e.clientX - bas[0], e.clientY - bas[1]); bas = null; if (d < 6) { const n = pick(e); if (n != null) onClic(n); } });
  }

  /* ---------- Boucle ---------- */
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  function boucle() {
    requestAnimationFrame(boucle);
    if (document.hidden) return;
    const t = horloge.getElapsedTime(), maint = performance.now();
    if (anim) {
      const k = Math.min(1, (maint - anim.t0) / anim.duree); placerEquipe(melange(anim.u0, anim.u1, ease(k)));
      const p = equipe.position; controls.target.lerp(new THREE.Vector3(p.x, p.y, p.z), 0.08); camera.position.lerp(new THREE.Vector3(p.x + 22, p.y + 27, p.z + 34), 0.04);
      if (k >= 1) { const f = anim.fin; anim = null; f && f(); }
    } else if (tween) {
      const k = Math.min(1, (maint - tween.debut) / tween.ms), e = ease(k);
      camera.position.lerpVectors(tween.p0, tween.p1, e); controls.target.lerpVectors(tween.t0c, tween.t1, e);
      if (k >= 1) tween = null;
    }
    equipe.children.forEach((c) => { if (c.userData.phase != null) c.position.y = Math.abs(Math.sin(t * 3 + c.userData.phase)) * (anim ? 0.25 : 0.06); });
    hibou.position.set(Math.cos(t * 0.9) * 1.6, 2.4 + Math.sin(t * 2) * 0.2, Math.sin(t * 0.9) * 1.6); hibou.rotation.y = -t * 0.9;
    hibou.children.forEach((c) => { if (c.userData.s) c.rotation.z = c.userData.s * Math.sin(t * 14) * 0.6; });
    marqueurs.forEach((m) => { const d = m.groupe.userData; if (!d.orbe) return; d.orbe.rotation.y = t * 0.8 + m.n; d.orbe.position.y = (LIEUX[m.n].cp ? 2.1 : 1.6) + Math.sin(t * 1.6 + m.n) * 0.12 + (d.etat === "actuel" ? 0.15 : 0); if (d.etat === "actuel") d.anneau.scale.setScalar(1 + 0.12 * Math.sin(t * 3)); });
    ORDRE_RELIQUES.forEach((r) => { const o = reliques3D[r]; if (o && o.visible) { o.rotation.y = t * 0.9; } });
    if (faisceau.visible) faisceau.material.opacity = 0.16 + 0.08 * Math.sin(t * 2.4);
    if (vif) { vif.position.set(42 + Math.sin(t * 0.7) * 8, 4 + Math.sin(t * 1.9) * 1.5, -14 + Math.sin(t * 1.3) * 4); vif.children.forEach((c) => { if (c.userData.s) c.rotation.y = c.userData.s * Math.sin(t * 40) * 0.9; }); }
    if (saule) saule.children.forEach((c, i) => { if (c.userData.base != null) c.rotation.x = c.userData.base + Math.sin(t * 1.1 + i) * 0.18; });
    if (tentacule) { const cyc = (t % 26) / 26; tentacule.position.y = cyc < 0.25 ? -4 + Math.sin(cyc / 0.25 * Math.PI) * 3.8 : -4; tentacule.rotation.y = t * 0.3; }
    if (lucioles) { const a = lucioles.geometry.attributes.position, b = lucioles.geometry.userData.base; for (let i = 0; i < a.count; i++) { a.array[i * 3 + 1] = b[i * 3 + 1] + Math.sin(t * 1.3 + i) * 0.4; a.array[i * 3] = b[i * 3] + Math.sin(t * 0.7 + i * 2) * 0.5; } a.needsUpdate = true; lucioles.material.opacity = 0.55 + 0.35 * Math.sin(t * 2); }
    if (S.reflets) S.reflets.material.opacity = 0.35 + 0.25 * Math.sin(t * 1.7);
    if (S.haloLac) S.haloLac.material.opacity = 0.18 + 0.1 * Math.sin(t * 2.2);
    if (S.drapeau) S.drapeau.rotation.y = Math.sin(t * 2) * 0.25;
    if (S.hippogriffe) S.hippogriffe.rotation.y = 0.8 + Math.sin(t * 0.4) * 0.6;
    nuages.forEach((n, i) => { const a = 0.0004 * n.userData.v; const x = n.position.x, z = n.position.z + 5; n.position.x = x * Math.cos(a) - z * Math.sin(a); n.position.z = x * Math.sin(a) + z * Math.cos(a) - 5; });
    for (let i = particules.length - 1; i >= 0; i--) { const pa = particules[i]; const age = (maint - pa.t0) / 1000; const a = pa.pts.geometry.attributes.position; pa.v.forEach((v, j) => { a.array[j * 3] += v.x * 0.016; a.array[j * 3 + 1] += (v.y - age * 6) * 0.016; a.array[j * 3 + 2] += v.z * 0.016; }); a.needsUpdate = true; pa.pts.material.opacity = Math.max(0, 1 - age / 2.2); if (age > 2.2) { scene.remove(pa.pts); pa.pts.geometry.dispose(); particules.splice(i, 1); } }
    controls.update();
    renderer.render(scene, camera);
  }

  function ecran(n) { const l = LIEUX[n]; const p = pointLieu(l); p.y += 3; p.project(camera); const r = renderer.domElement.getBoundingClientRect(); return { x: r.left + (p.x + 1) / 2 * r.width, y: r.top + (1 - p.y) / 2 * r.height, devant: p.z < 1 }; }

  return Object.assign(S, { __cam: () => ({ camera, controls }), init, majEtat, avancer, viserLieu, survolGeneral, suivreEquipe, cinematique, eclat: (n) => { const p = pointLieu(LIEUX[n]); eclat(p.add(new THREE.Vector3(0, 3, 0)), 0xFFE3A0, 140); }, ecran, en: () => anim != null });
})();
