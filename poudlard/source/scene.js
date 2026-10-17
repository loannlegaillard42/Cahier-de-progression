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

  /* Voie ferrée de Pré-au-Lard : la partie visible, du portail du tunnel au bout du quai */
  const RAIL_Y = 0.9;
  const VOIE = [[71, 29], [62, 26.4], [54, 24.3], [46, 22.4], [38, 20.7], [31.5, 19.5]];
  const VILLAGE = [[60.5, 20.6, 0.5], [57, 16.2, 0.1], [62.5, 16.8, -0.4], [53, 14.5, 0.8], [49, 12.5, 0.2], [58.5, 11.5, -0.3]];
  function distVoie(x, z) {
    let d = 1e9;
    for (let i = 0; i < VOIE.length - 1; i++) { const [ax, az] = VOIE[i], [bx, bz] = VOIE[i + 1]; const vx = bx - ax, vz = bz - az; const tr = ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz); if (i === 0 && tr < 0) continue; const t = Math.max(0, Math.min(1, tr)); d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t)); }
    return d;
  }

  function hauteur(x, z) {
    let h = 0.9 * Math.sin(x * 0.07 + 1.3) * Math.cos(z * 0.06) + 0.5 * Math.sin(x * 0.15 + z * 0.12) + 0.3 * Math.cos(x * 0.23 - z * 0.19);
    const dc = Math.hypot(x / 1.25, z + 33);
    h += 7.5 * (1 - lisse(13, 17.5, dc));
    const dp = Math.hypot((x - 42) / 12, (z + 14) / 7);
    h = melange(h, 0.9, 1 - lisse(0.8, 1.25, dp));
    const dl = Math.hypot((x - 22) / 17, (z - 6) / 13);
    h = melange(h, -7, 1 - lisse(0.82, 1.12, dl));
    const r = Math.hypot(x, z + 5), ang = Math.atan2(z + 5, x);
    h += lisse(60, 96, r) * (20 + 9 * Math.sin(ang * 5) + 6 * Math.sin(ang * 11 + 1) + 3 * Math.sin(ang * 23));
    const dv = distVoie(x, z); if (dv < 9) h = melange(h, RAIL_Y - 0.12, 1 - lisse(2.4, 8.5, dv));
    const dg = Math.hypot((x - 42) / 8.5, (z - 17.6) / 4.2); if (dg < 1.3) h = melange(h, RAIL_Y - 0.08, 1 - lisse(0.75, 1.3, dg));
    return h;
  }
  const dansLac = (x, z) => Math.hypot((x - 22) / 17, (z - 6) / 13) < 1.02;
  const surPlateau = (x, z) => Math.hypot(x / 1.25, z + 33) < 17;

  function init(canvas, rappels) {
    if (!window.THREE || !THREE.OrbitControls) return false;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", failIfMajorPerformanceCaveat: !(typeof prefs !== "undefined" && prefs.force3d) });
    } catch (e) { return false; }
    onClic = rappels.clic; onSurvol = rappels.survol;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene();
    scene.background = ciel();
    scene.fog = new THREE.Fog(0xE9C9A2, 140, 330);
    S.air = S.airJour = [scene.fog, scene.background]; S.sousEau = [new THREE.Fog(0x0B3A2E, 0.3, 16), new THREE.Color(0x0B3A2E)];
    camera = new THREE.PerspectiveCamera(45, 1, 0.5, 700);
    camera.position.set(70, 78, 95);
    controls = new THREE.OrbitControls(camera, canvas);
    controls.target.set(0, 3, -4);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.minDistance = 14; controls.maxDistance = 170;
    controls.maxPolarAngle = 1.38; controls.screenSpacePanning = false;
    horloge = new THREE.Clock();

    lumieres(); terrain(); eau(); chateau(); serres(); cabane(); quidditch(); decorsLieux(); construireGare(); construireLac(); construireChemin(); arbres(); construireMarqueurs(); construireEquipe(); decorsAnimes();

    const ro = new ResizeObserver(redim); ro.observe(canvas.parentElement); redim();
    evenements(canvas);
    document.fonts && document.fonts.ready.then(() => marqueurs.forEach((m) => m && m.redessiner && m.redessiner()));
    S.ok = true;
    boucle();
    return true;
  }

  function redim() {
    const el = renderer.domElement.parentElement; const w = el.clientWidth, h = el.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); if (S.pause) renderer.render(scene, camera);
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
    S.lumieres = scene.children.filter((o) => o.isLight).map((l) => [l, l.intensity]);
  }

  function terrain() {
    const geo = new THREE.PlaneGeometry(320, 320, 170, 170); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position; const couleurs = new Float32Array(pos.count * 3); const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i); const y = hauteur(x, z); pos.setY(i, y);
      const n = 0.5 + 0.5 * Math.sin(x * 0.9 + z * 1.3) * Math.cos(z * 0.7 - x * 0.4);
      if (y < -1.6 && dansLac(x, z)) c.set(0x5E6E4A).lerp(new THREE.Color(0x3F5A3A), n);
      else if (y < 0.55 && Math.hypot((x - 22) / 17, (z - 6) / 13) < 1.3) c.set(0xC8B68A);
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
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x2C5C7A, roughness: 0.18, metalness: 0.35, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
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
    const g = new THREE.Group(); const gris = new THREE.MeshStandardMaterial({ color: 0x8D8D96, flatShading: true }), clair = new THREE.MeshStandardMaterial({ color: 0xD9D6CC, flatShading: true });
    const corps = new THREE.Group(); g.add(corps);
    const tronc = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.9, 0.8), gris); tronc.position.y = 1.2; corps.add(tronc);
    const cou = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, 0.8, 6), clair); cou.position.set(0.95, 1.65, 0); cou.rotation.z = -0.6; corps.add(cou);
    const tete = new THREE.Mesh(new THREE.SphereGeometry(0.34, 8, 7), clair); tete.position.set(1.25, 2.05, 0); corps.add(tete);
    const bec = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.45, 5), new THREE.MeshStandardMaterial({ color: 0xD8A84A, flatShading: true })); bec.rotation.z = -Math.PI / 2; bec.position.set(1.62, 1.98, 0); corps.add(bec);
    for (const s of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(0.06, 6, 5), new THREE.MeshBasicMaterial({ color: 0xF2A23A })); o.position.set(1.42, 2.13, s * 0.22); corps.add(o); }
    const queue = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.9, 5), gris); queue.position.set(-1.15, 1.2, 0); queue.rotation.z = -2.2; corps.add(queue);
    const ailes = [];
    for (const s of [-1, 1]) {
      const piv = new THREE.Group(); piv.position.set(0.15, 1.6, s * 0.38); piv.userData.s = s;
      const aile = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.07, 1.9), gris); aile.position.set(-0.1, 0, s * 0.95); piv.add(aile);
      const bout = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.06, 0.9), clair); bout.position.set(-0.35, 0, s * 2.1); piv.add(bout);
      piv.rotation.x = s * 0.9; piv.scale.z = 0.35; corps.add(piv); ailes.push(piv);
    }
    for (const [dx, dz] of [[0.7, 0.3], [0.7, -0.3], [-0.7, 0.3], [-0.7, -0.3]]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.8, 5), gris); p.position.set(dx, 0.4, dz); g.add(p); }
    g.userData.ailes = ailes; g.userData.corps = corps;
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
      if (distVoie(jx, jz) < 9 || Math.hypot(jx - 1, jz - 25) < 7 || Math.hypot((jx - 42) / 11, (jz - 17.6) / 6) < 1 || VILLAGE.some(([vx, vz]) => Math.hypot(jx - vx, jz - vz) < 3.6)) p = 0;
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
  function eclat(pos, couleur, n = 120, { taille = 0.35, force = 1, gravite = 6, vie = 2.2, sphere = false } = {}) {
    const p = new Float32Array(n * 3), v = [];
    for (let i = 0; i < n; i++) { p[i * 3] = pos.x; p[i * 3 + 1] = pos.y; p[i * 3 + 2] = pos.z; const a = Math.random() * Math.PI * 2, b = Math.random() * Math.PI - Math.PI / 2, s = (2 + Math.random() * 5) * force; v.push(new THREE.Vector3(Math.cos(a) * Math.cos(b) * s, sphere ? Math.sin(b) * s : Math.abs(Math.sin(b)) * s + 2, Math.sin(a) * Math.cos(b) * s)); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: couleur, size: taille, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(pts); particules.push({ pts, v, t0: performance.now(), gravite, vie });
  }

  /* ---------- Gare de Pré-au-Lard, Poudlard Express et barques ---------- */
  let voie, voieLong, uPortail = 0, uQuai0 = 0, uQuai1 = 1, train, fumees = [], barques = [], foule = [], hagrid;
  const PONTON = [[36.9, 16.7], [34.7, 10.6]];
  const ARRIVEE = [15.4, -1.6];
  const Y = new THREE.Vector3(0, 1, 0);
  const lateral = (t) => { const l = Math.hypot(t.x, t.z) || 1; return new THREE.Vector3(-t.z / l, 0, t.x / l); }; // vers le lac
  function construireGare() {
    const pts = [[106, 39], [94, 35.6], [82, 32.3]].concat(VOIE).map(([x, z]) => new THREE.Vector3(x, RAIL_Y, z));
    voie = new THREE.CatmullRomCurve3(pts, false, "centripetal"); voieLong = voie.getLength();
    const N = 600; let premier = true;
    for (let i = 0; i <= N; i++) { const p = voie.getPointAt(i / N); if (premier && p.x <= VOIE[0][0]) { uPortail = i / N; premier = false; } if (p.x >= 49.5) uQuai0 = i / N; if (p.x >= 35) uQuai1 = i / N; }
    const sol = new THREE.MeshStandardMaterial({ color: 0x6F675E, roughness: 1, side: THREE.DoubleSide });
    // ballast
    const n = Math.ceil((1 - uPortail) * voieLong / 0.7); const pos = [], idx = [];
    for (let i = 0; i <= n; i++) { const u = uPortail + (1 - uPortail) * i / n; const p = voie.getPointAt(u), l = lateral(voie.getTangentAt(u)); for (const d of [-1.35, 1.35]) pos.push(p.x + l.x * d, RAIL_Y - 0.05, p.z + l.z * d); if (i < n) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    const gb = new THREE.BufferGeometry(); gb.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); gb.setIndex(idx); gb.computeVertexNormals();
    const ballast = new THREE.Mesh(gb, sol); ballast.receiveShadow = true; scene.add(ballast);
    // traverses et rails
    const nb = Math.floor((1 - uPortail) * voieLong / 0.75); const trav = new THREE.InstancedMesh(new THREE.BoxGeometry(1.8, 0.12, 0.32), mat("bois"), nb);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), un = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < nb; i++) { const u = uPortail + (1 - uPortail) * (i + 0.5) / nb; const p = voie.getPointAt(u), t = voie.getTangentAt(u); q.setFromAxisAngle(Y, Math.atan2(t.x, t.z)); m4.compose(new THREE.Vector3(p.x, RAIL_Y + 0.02, p.z), q, un); trav.setMatrixAt(i, m4); }
    trav.receiveShadow = true; scene.add(trav);
    for (const d of [-0.55, 0.55]) { const pp = []; const k = Math.ceil((1 - uPortail) * voieLong); for (let i = 0; i <= k; i++) { const u = uPortail + (1 - uPortail) * i / k; const p = voie.getPointAt(u), l = lateral(voie.getTangentAt(u)); pp.push(new THREE.Vector3(p.x + l.x * d, RAIL_Y + 0.14, p.z + l.z * d)); } scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pp), k * 2, 0.06, 4, false), mat("argent"))); }
    // portail du tunnel
    const pt = voie.getPointAt(uPortail), tt = voie.getTangentAt(uPortail); const portail = new THREE.Group();
    const facade = new THREE.Mesh(new THREE.BoxGeometry(9, 7.5, 2.2), mat("pierreSombre")); facade.position.y = 3.6; portail.add(facade);
    const trou = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.3, 2.3), new THREE.MeshBasicMaterial({ color: 0x0B0B12 })); trou.position.y = 1.6; portail.add(trou);
    const voute = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 2.3, 16, 1, false, 0, Math.PI), new THREE.MeshBasicMaterial({ color: 0x0B0B12 })); voute.rotation.set(Math.PI / 2, 0, Math.PI / 2); voute.position.y = 3.25; portail.add(voute);
    portail.position.set(pt.x, RAIL_Y - 0.2, pt.z); portail.rotation.y = Math.atan2(tt.x, tt.z); scene.add(ombres(portail));
    // quai (côté lac), lampadaires et panneau
    for (let u = uQuai0; u < uQuai1; u += 2 / voieLong) {
      const p = voie.getPointAt(u), t = voie.getTangentAt(u), l = lateral(t);
      const b = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.75, 2.1), mat("pierre")); b.position.set(p.x + l.x * 2.45, RAIL_Y + 0.02, p.z + l.z * 2.45); b.rotation.y = Math.atan2(t.x, t.z); b.receiveShadow = true; scene.add(b);
    }
    const lampe = new THREE.MeshStandardMaterial({ color: 0xFFE2A0, emissive: 0xFFC060, emissiveIntensity: 1 });
    for (let u = uQuai0 + 1.5 / voieLong; u < uQuai1; u += 4.2 / voieLong) {
      const p = voie.getPointAt(u), l = lateral(voie.getTangentAt(u)); const g = new THREE.Group();
      const mt = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 2.6, 6), new THREE.MeshStandardMaterial({ color: 0x1E1E24 })); mt.position.y = 1.3; g.add(mt);
      const lan = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.38, 0.3), lampe); lan.position.y = 2.75; g.add(lan);
      g.position.set(p.x + l.x * 3.45, RAIL_Y + 0.4, p.z + l.z * 3.45); scene.add(g);
    }
    const um = (uQuai0 + uQuai1) / 2, pm = voie.getPointAt(um), tm = voie.getTangentAt(um), lm = lateral(tm);
    const cnv = document.createElement("canvas"); cnv.width = 512; cnv.height = 128; const cx = cnv.getContext("2d");
    cx.fillStyle = "#1F3B2E"; cx.fillRect(0, 0, 512, 128); cx.strokeStyle = "#E2B74A"; cx.lineWidth = 8; cx.strokeRect(6, 6, 500, 116);
    cx.fillStyle = "#F2D48A"; cx.font = "700 62px Georgia, serif"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText("PRÉ-AU-LARD", 256, 68);
    const panneau = new THREE.Group();
    const plaque = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cnv), emissive: 0x222222, emissiveMap: null })); plaque.position.y = 2.3; panneau.add(plaque);
    const dos = new THREE.Mesh(new THREE.BoxGeometry(3.7, 1, 0.08), mat("bois")); dos.position.set(0, 2.3, -0.06); panneau.add(dos);
    for (const s of [-1.5, 1.5]) { const pied = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 2.4, 6), mat("bois")); pied.position.set(s, 1.2, -0.1); panneau.add(pied); }
    panneau.position.set(pm.x + lm.x * 3.2, RAIL_Y + 0.4, pm.z + lm.z * 3.2); panneau.rotation.y = Math.atan2(-lm.x, -lm.z); scene.add(ombres(panneau));
    // bâtiment de la gare
    const ug = uQuai0 + 3.5 / voieLong, pg = voie.getPointAt(ug), tg = voie.getTangentAt(ug), lg = lateral(tg); const gare = new THREE.Group();
    gare.add(boite(3.4, 2.8, 6, "pierre", 0, 0, 0));
    const toitG = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 6.6, 3), mat("toit")); toitG.rotation.x = -Math.PI / 2; toitG.scale.set(1, 1, 0.55); toitG.position.y = 3.43; gare.add(toitG);
    for (const z of [-2, 2]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 1), mat("fenetre")); f.position.set(1.72, 1.6, z); f.rotation.y = Math.PI / 2; gare.add(f); }
    const pg2 = new THREE.Mesh(new THREE.PlaneGeometry(1, 1.8), mat("bois")); pg2.position.set(1.72, 0.9, 0); pg2.rotation.y = Math.PI / 2; gare.add(pg2);
    gare.position.set(pg.x + lg.x * 6, RAIL_Y - 0.2, pg.z + lg.z * 6); gare.rotation.y = Math.atan2(tg.x, tg.z); scene.add(ombres(gare));
    // le village
    VILLAGE.forEach(([x, z, r], i) => {
      const g = new THREE.Group(); const w = 2.4 + (i % 3) * 0.4, h = 2 + (i % 2) * 0.6;
      g.add(boite(w, h, 2.4, "pierre", 0, 0, 0));
      const toitM = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, 2.4) * 0.82, 1.6, 4), new THREE.MeshStandardMaterial({ color: [0x7A4A3A, 0x3E4A63, 0x5A4636][i % 3], flatShading: true })); toitM.rotation.y = Math.PI / 4; toitM.position.y = h + 0.8; g.add(toitM);
      const f = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.6), mat("fenetre")); f.position.set(0, h * 0.55, 1.21); g.add(f);
      g.position.set(x, hauteur(x, z) - 0.2, z); g.rotation.y = r; scene.add(ombres(g));
    });
    // ponton, barques et Hagrid
    const [a, b] = PONTON; const lg2 = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ponton = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.18, lg2), mat("bois")); ponton.position.set((a[0] + b[0]) / 2, EAU + 0.45, (a[1] + b[1]) / 2); ponton.rotation.y = Math.atan2(b[0] - a[0], b[1] - a[1]); ponton.castShadow = true; scene.add(ponton);
    for (let k = 0; k <= 4; k++) for (const s of [-0.7, 0.7]) { const f = k / 4; const x = a[0] + (b[0] - a[0]) * f, z = a[1] + (b[1] - a[1]) * f; const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 1.6, 5), mat("bois")); pl.position.set(x + s * 0.94, EAU - 0.2, z - s * 0.33); scene.add(pl); }
    const form = [[0, 0], [1.7, 1.5], [-1.5, 1.7], [0.2, 3.2]];
    const dir = [b[0] - a[0], b[1] - a[1]]; const nd = Math.hypot(dir[0], dir[1]); const ouest = [dir[1] / nd, -dir[0] / nd];
    barques = form.map(([fx, fz], i) => {
      const g = barque(i); const f = i < 2 ? 0.95 : 0.72, cote = i % 2 ? -1.45 : 1.45; const dx = a[0] + dir[0] * f + ouest[0] * cote, dz = a[1] + dir[1] * f + ouest[1] * cote;
      const route = new THREE.CatmullRomCurve3([[dx, dz], [29 + fx, 9.6 + fz], [22.5 + fx, 6.9 + fz], [17.6 + fx * 0.7, 2.4 + fz * 0.6], [ARRIVEE[0] + fx * 0.6, ARRIVEE[1] + fz * 0.5]].map(([x, z]) => new THREE.Vector3(x, EAU, z)), false, "centripetal");
      g.userData.route = route; g.userData.i = i; scene.add(g); placerBarque(g, 0, 0); return g;
    });
    hagrid = new THREE.Group();
    const manteau = new THREE.Mesh(new THREE.ConeGeometry(0.75, 2.5, 9), new THREE.MeshStandardMaterial({ color: 0x5A4030, flatShading: true })); manteau.position.y = 1.25; hagrid.add(manteau);
    const tete = new THREE.Mesh(new THREE.SphereGeometry(0.36, 10, 8), new THREE.MeshStandardMaterial({ color: 0xE3C3A0 })); tete.position.y = 2.75; hagrid.add(tete);
    const barbe = new THREE.Mesh(new THREE.SphereGeometry(0.42, 9, 8), new THREE.MeshStandardMaterial({ color: 0x3A2618, flatShading: true })); barbe.scale.set(1, 1.15, 0.8); barbe.position.set(0, 2.55, 0.12); hagrid.add(barbe);
    const lant = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 6), lampe); lant.position.set(0.7, 2.1, 0.3); hagrid.add(lant);
    const lum = new THREE.PointLight(0xFFC870, 1.1, 9); lum.position.copy(lant.position); hagrid.add(lum);
    hagrid.position.set(a[0] + 0.4, hauteur(a[0] + 0.4, a[1] + 0.9) - 0.05, a[1] + 0.9); hagrid.rotation.y = Math.atan2(-dir[0], -dir[1]); scene.add(ombres(hagrid));
    // les élèves de première année (cachés hors de la scène du train)
    for (let k = 0; k < 14; k++) { const s = sorcier(ORDRE_MAISONS[k % 4]); s.scale.setScalar(0.95); s.visible = false; s.userData.k = k; scene.add(s); foule.push(s); }
    // le train
    train = new THREE.Group(); train.userData.voitures = [locomotive(), ...[0, 1, 2, 3].map(() => voiture())]; train.userData.voitures.forEach((v) => train.add(v)); scene.add(train);
    const tex = (() => { const c = document.createElement("canvas"); c.width = c.height = 64; const g = c.getContext("2d"); const d = g.createRadialGradient(32, 32, 2, 32, 32, 30); d.addColorStop(0, "rgba(255,255,255,1)"); d.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = d; g.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
    for (let k = 0; k < 36; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: 0xE8E4DC, transparent: true, opacity: 0, depthWrite: false })); sp.visible = false; scene.add(sp); fumees.push({ sp, age: 99, vx: 0, vz: 0 }); }
    placerTrain(sTrainGare());
  }
  const LONG_VOITURES = [4.3, 4.3, 4.3, 4.3, 4.3];
  const sTrainGare = () => voieLong - 1.2;
  function placerTrain(s) {
    train.userData.s = s; let off = 0;
    train.userData.voitures.forEach((v, i) => {
      const c = Math.min(voieLong, Math.max(0, s - off - LONG_VOITURES[i] / 2)) / voieLong; const p = voie.getPointAt(c), t = voie.getTangentAt(c);
      v.position.set(p.x, RAIL_Y + 0.12, p.z); v.rotation.y = Math.atan2(t.x, t.z); off += LONG_VOITURES[i] + 0.25;
    });
  }
  function locomotive() {
    const g = new THREE.Group(); const rouge = new THREE.MeshStandardMaterial({ color: 0xB3141B, roughness: 0.45, metalness: 0.3, flatShading: true }); const noir = new THREE.MeshStandardMaterial({ color: 0x1B1B20, roughness: 0.6, metalness: 0.4 });
    const chassis = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.35, 4.2), noir); chassis.position.y = 0.55; g.add(chassis);
    const chaudiere = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.72, 2.6, 14), rouge); chaudiere.rotation.x = Math.PI / 2; chaudiere.position.set(0, 1.45, 0.65); g.add(chaudiere);
    const avant = new THREE.Mesh(new THREE.CylinderGeometry(0.74, 0.74, 0.35, 14), noir); avant.rotation.x = Math.PI / 2; avant.position.set(0, 1.45, 2.0); g.add(avant);
    const cabine = new THREE.Mesh(new THREE.BoxGeometry(1.75, 1.75, 1.3), rouge); cabine.position.set(0, 1.62, -1.35); g.add(cabine);
    const toit = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.14, 1.55), noir); toit.position.set(0, 2.56, -1.35); g.add(toit);
    for (const s of [-1, 1]) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.55), mat("fenetre")); f.position.set(s * 0.885, 1.9, -1.3); f.rotation.y = s * Math.PI / 2; g.add(f); }
    const chem = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.15, 0.85, 10), noir); chem.position.set(0, 2.45, 1.45); g.add(chem); g.userData.cheminee = chem;
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), mat("or")); dome.position.set(0, 2.15, 0.35); g.add(dome);
    const phare = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), new THREE.MeshStandardMaterial({ color: 0xFFF1C0, emissive: 0xFFD27A, emissiveIntensity: 1.2 })); phare.position.set(0, 1.45, 2.2); g.add(phare);
    const chasse = new THREE.Mesh(new THREE.ConeGeometry(0.75, 0.6, 4), noir); chasse.rotation.set(Math.PI / 2, Math.PI / 4, 0); chasse.scale.set(1, 1, 0.5); chasse.position.set(0, 0.45, 2.25); g.add(chasse);
    for (const s of [-1, 1]) for (const z of [-1.3, 0, 1.2]) { const r = z === 0 || z === 1.2 ? 0.5 : 0.35; const w = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.14, 14), rouge); w.rotation.z = Math.PI / 2; w.position.set(s * 0.8, r, z); g.add(w); }
    const filet = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.08, 4.0), mat("or")); filet.position.set(0, 0.76, 0); g.add(filet);
    return ombres(g);
  }
  function voiture() {
    const g = new THREE.Group(); const rouge = new THREE.MeshStandardMaterial({ color: 0xA5161C, roughness: 0.5, metalness: 0.2, flatShading: true }); const noir = new THREE.MeshStandardMaterial({ color: 0x24242A, roughness: 0.7 });
    const caisse = new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.55, 4.1), rouge); caisse.position.y = 1.32; g.add(caisse);
    const toit = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 4.2, 12, 1, false, -Math.PI / 2.6, Math.PI / 1.3), noir); toit.rotation.x = -Math.PI / 2; toit.position.y = 1.95; toit.scale.set(0.92, 1, 0.5); g.add(toit);
    for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.5), mat("fenetre")); f.position.set(s * 0.86, 1.55, -1.45 + k * 0.97); f.rotation.y = s * Math.PI / 2; g.add(f); }
    const bande = new THREE.Mesh(new THREE.BoxGeometry(1.72, 0.07, 4.05), mat("or")); bande.position.y = 1.1; g.add(bande);
    for (const z of [-1.4, 1.4]) { const bog = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.4, 1.1), noir); bog.position.set(0, 0.33, z); g.add(bog); }
    return ombres(g);
  }
  function barque(n) {
    const g = new THREE.Group(); const bois = new THREE.MeshStandardMaterial({ color: 0x6B4426, flatShading: true });
    const coque = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.38, 2.1), bois); coque.position.y = 0.12; g.add(coque);
    const proue = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.7, 4), bois); proue.rotation.set(Math.PI / 2, Math.PI / 4, 0); proue.scale.set(1, 1, 0.55); proue.position.set(0, 0.12, 1.38); g.add(proue);
    const mt = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 5), mat("bois")); mt.position.set(0, 0.7, 1.15); g.add(mt);
    const lan = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), new THREE.MeshStandardMaterial({ color: 0xFFE2A0, emissive: 0xFFC060, emissiveIntensity: 1.3 })); lan.position.set(0, 1.18, 1.15); g.add(lan);
    const passagers = new THREE.Group(); [["gry", 0.25, 0.45], ["pou", -0.25, -0.1], ["ser", 0.2, -0.6]].forEach(([m, x, z], i) => { const s = sorcier(ORDRE_MAISONS[(i + n) % 4] || m); s.scale.setScalar(0.62); s.position.set(x, 0.2, z); passagers.add(s); });
    passagers.visible = false; g.add(passagers); g.userData.passagers = passagers;
    return ombres(g);
  }
  function placerBarque(g, u, t) {
    const r = g.userData.route; const p = r.getPointAt(u), d = r.getTangentAt(Math.min(0.999, u + 0.001));
    g.position.set(p.x, EAU + 0.02 + Math.sin(t * 2.2 + g.userData.i) * 0.05, p.z);
    g.rotation.set(Math.sin(t * 1.7 + g.userData.i) * 0.04, Math.atan2(d.x, d.z), Math.sin(t * 1.3 + g.userData.i * 2) * 0.05);
  }
  function majFumees(dt, debit) {
    const loco = train.userData.voitures[0]; const ch = loco.userData.cheminee; const src = new THREE.Vector3(); ch.getWorldPosition(src); src.y += 0.5;
    S.reliquatFumee = (S.reliquatFumee || 0) + debit * dt;
    while (S.reliquatFumee >= 1) { S.reliquatFumee -= 1; const f = fumees.find((x) => x.age > 3.2); if (!f) break; f.age = 0; f.sp.position.copy(src); f.vx = (Math.random() - 0.5) * 0.5; f.vz = (Math.random() - 0.5) * 0.5; f.sp.visible = true; }
    fumees.forEach((f) => { if (f.age > 3.2) { f.sp.visible = false; return; } f.age += dt; const k = f.age / 3.2; f.sp.position.x += f.vx * dt; f.sp.position.z += f.vz * dt; f.sp.position.y += (1.6 - k * 0.6) * dt; f.sp.scale.setScalar(0.7 + k * 3.2); f.sp.material.opacity = 0.55 * (1 - k); });
  }

  /* ---------- Le fond du lac et le calmar géant ---------- */
  let calmarG, bras = [], algues, poissons = [], bulles, fondLac = -7;
  function construireLac() {
    fondLac = hauteur(23, 2);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(3.1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x5FD6A0, emissive: 0x1F7A52, emissiveIntensity: 0.7, transparent: true, opacity: 0.55, roughness: 0.1 }));
    dome.position.set(23, fondLac + 0.1, 2); scene.add(dome);
    const socle = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.6, 0.6, 20), mat("pierreSombre")); socle.position.set(23, fondLac, 2); scene.add(socle);
    const colonne = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, -fondLac - 2.6, 10), mat("pierreSombre")); colonne.position.set(23, (fondLac + 3.1 + 0.35) / 2, 2); scene.add(colonne);
    const porte = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.6), new THREE.MeshBasicMaterial({ color: 0xB8FFD8 })); porte.position.set(23, fondLac + 0.9, 5.05); scene.add(porte);
    const n = 46; algues = new THREE.InstancedMesh(new THREE.ConeGeometry(0.16, 1, 5), new THREE.MeshStandardMaterial({ color: 0x1F5A32, flatShading: true }), n); algues.userData.base = [];
    for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, r = 4.2 + rnd() * 7; const x = 23 + Math.cos(a) * r, z = 2 + Math.sin(a) * r; if (!dansLac(x, z)) { algues.userData.base.push(null); continue; } algues.userData.base.push([x, hauteur(x, z), z, 2.5 + rnd() * 3, rnd() * 6]); }
    majAlgues(0); scene.add(algues);
    const mp = new THREE.MeshStandardMaterial({ color: 0xBFD3DA, metalness: 0.6, roughness: 0.3, flatShading: true });
    for (let k = 0; k < 12; k++) { const p = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 4), mp); p.rotation.x = Math.PI / 2; const g = new THREE.Group(); g.add(p); g.userData = { r: 4.5 + rnd() * 2.5, h: fondLac + 1.5 + rnd() * 3, v: 0.5 + rnd() * 0.4, p: rnd() * 6 }; scene.add(g); poissons.push(g); }
    const nbu = 70, pb = new Float32Array(nbu * 3); for (let i = 0; i < nbu; i++) { pb[i * 3] = 23 + (rnd() - 0.5) * 6; pb[i * 3 + 1] = fondLac + rnd() * 6; pb[i * 3 + 2] = 2 + (rnd() - 0.5) * 6; }
    const gb = new THREE.BufferGeometry(); gb.setAttribute("position", new THREE.BufferAttribute(pb, 3));
    bulles = new THREE.Points(gb, new THREE.PointsMaterial({ color: 0xDFFFF0, size: 0.14, transparent: true, opacity: 0.8, depthWrite: false })); scene.add(bulles);
    majPoissons(0);
    // le calmar géant
    calmarG = new THREE.Group(); const peau = new THREE.MeshStandardMaterial({ color: 0x8A4E7E, roughness: 0.55, flatShading: true });
    const manteau = new THREE.Mesh(new THREE.SphereGeometry(1.6, 14, 10), peau); manteau.scale.set(1, 2.2, 0.95); manteau.position.y = 3.6; calmarG.add(manteau);
    const nag = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.6, 4), peau); nag.scale.set(1.6, 1, 0.25); nag.position.y = 7.3; calmarG.add(nag);
    for (const s of [-1, 1]) {
      const oeil = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), new THREE.MeshStandardMaterial({ color: 0xF4E7B0, emissive: 0x6A5A20, emissiveIntensity: 0.4 })); oeil.position.set(s * 0.95, 2.1, 1.0); calmarG.add(oeil);
      const pup = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), new THREE.MeshBasicMaterial({ color: 0x111111 })); pup.position.set(s * 1.08, 2.12, 1.36); calmarG.add(pup);
    }
    const ventouse = new THREE.MeshStandardMaterial({ color: 0xB06A98, roughness: 0.6, flatShading: true });
    for (let j = 0; j < 10; j++) {
      const longs = j >= 8; const segs = longs ? 16 : 11; const arm = [];
      for (let k = 0; k < segs; k++) { const r = (longs ? 0.3 : 0.4) * (1 - k / (segs + 2)); const sp = new THREE.Mesh(new THREE.SphereGeometry(r, 7, 6), k % 3 === 2 ? ventouse : peau); calmarG.add(sp); arm.push(sp); }
      bras.push({ arm, ang: longs ? (j === 8 ? 0.9 : -0.9) + Math.PI / 2 : (j / 8) * Math.PI * 2, longs, j });
    }
    calmarG.position.set(16, -12, 11); calmarG.visible = false; scene.add(calmarG);
    S.rides = [0, 1, 2].map(() => { const r = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 40), new THREE.MeshBasicMaterial({ color: 0xDCEBFF, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.set(16, EAU + 0.03, 11); scene.add(r); return r; });
  }
  function majAlgues(t) {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), v = new THREE.Vector3();
    algues.userData.base.forEach((b, i) => { if (!b) { m.makeScale(0, 0, 0); algues.setMatrixAt(i, m); return; } const [x, y, z, h, ph] = b; e.set(Math.sin(t * 1.3 + ph) * 0.18, 0, Math.cos(t * 1.1 + ph) * 0.18); q.setFromEuler(e); s.set(1, h, 1); v.set(x, y + h / 2, z); m.compose(v, q, s); algues.setMatrixAt(i, m); });
    algues.instanceMatrix.needsUpdate = true;
  }
  function majPoissons(t) { poissons.forEach((g) => { const d = g.userData; const a = t * d.v + d.p; g.position.set(23 + Math.cos(a) * d.r, d.h + Math.sin(t * 1.4 + d.p) * 0.3, 2 + Math.sin(a) * d.r); g.rotation.y = -a; }); }
  function majCalmar(t, hauteurSortie, salut) {
    calmarG.position.y = hauteurSortie; calmarG.rotation.y = -0.98 + Math.sin(t * 0.4) * 0.12;
    bras.forEach((b) => {
      const dir = new THREE.Vector3(Math.sin(b.ang), 0, Math.cos(b.ang)); let phi = b.longs ? 0.9 + (b.j === 8 ? salut * 0.6 : 0) : -0.25; const p = new THREE.Vector3(dir.x * 0.9, 0.9, dir.z * 0.9);
      b.arm.forEach((sp, k) => { phi += (b.longs ? 0.16 : 0.2) * Math.sin(t * 2.2 + b.j * 1.3 - k * 0.55) + (b.longs ? -0.05 : 0.03); const pas = b.longs ? 0.42 : 0.4; p.x += dir.x * Math.cos(phi) * pas; p.z += dir.z * Math.cos(phi) * pas; p.y += Math.sin(phi) * pas; sp.position.copy(p); });
    });
  }

  /* ---------- Scénographies : caméra sur rails, sous-titres, sons ---------- */
  let cine = null;
  const V3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  function ailesHippo(angle, ouverture) { S.hippogriffe.userData.ailes.forEach((p) => { p.rotation.x = -p.userData.s * angle; p.scale.z = ouverture; }); }
  function vifSur(courbe, u, t) { const p = courbe.getPointAt(Math.min(1, Math.max(0, u))); vif.position.copy(p); vif.children.forEach((c) => { if (c.userData.s) c.rotation.y = c.userData.s * Math.sin(t * 40) * 0.9; }); }
  const COULEURS_FEUX = [0xFF8A7A, 0xA9C0FF, 0xFFD45E, 0x74E3A6, 0xFFE3A0];

  const SCENES = {
    express: {
      duree: 34,
      textes: [[0.8, 6.2, "1er septembre. Le Poudlard Express file à travers les montagnes…"], [7.5, 12.6, "Gare de Pré-au-Lard. Tout le monde descend !"], [13.4, 19, "« Les première année, par ici ! » Hagrid les attend au bord du lac."], [19.6, 26.4, "En barque, on traverse le lac noir… et soudain, le château apparaît."], [27.6, 34, (o) => `Bienvenue à Poudlard${o.classe ? ", " + o.classe : ""} !`]],
      sons: [[1.2, "sifflet"], [10.6, "sifflet"], [27.6, "fanfare"]],
      cles() {
        const sP = uPortail * voieLong;
        const pv = (s, lat, h) => { const u = Math.min(1, Math.max(0, s / voieLong)); const p = voie.getPointAt(u), l = lateral(voie.getTangentAt(u)); return [p.x + l.x * lat, p.y + h, p.z + l.z * lat]; };
        const K = [{ t: 0, p: pv(sP + 15, -4, 5.5), c: pv(sP, 0, 2.8) }, { t: 3, p: pv(sP + 13, -5.5, 3.6), c: pv(sP + 3, 0, 2) }, { t: 5.5, p: pv(sP + 19, -6.5, 4.5), c: pv(sP + 28, 0, 1.5) }, { t: 8.5, p: pv(sP + 27, -7.5, 6), c: pv(sP + 37, 1.5, 1.5) },
          { t: 11.5, p: [53, 6.5, 33.5], c: [43, 1.6, 21] }, { t: 15.5, p: [47.5, 10, 29], c: [36, 0.8, 14] }];
        const r = barques[0].userData.route;
        [19.5, 22.5, 25.5, 28.5].forEach((t, k) => { const p = r.getPointAt(lisse(18.4, 30.6, t)); K.push({ t, p: k ? [p.x + 9, p.y + 3.4, p.z + 7.5] : [p.x + 3, p.y + 5.5, p.z + 7], c: [p.x - 12, p.y + 0.5 + k * 2, p.z - 11] }); });
        K.push({ t: 34, p: [10, 16, 1], c: [0, 9, -22] }); return K;
      },
      debut(ctx) { ctx.s0 = sTrainGare() - 56; },
      maj(t, ctx, dt) {
        const k = Math.min(1, t / 11.5); placerTrain(ctx.s0 + (sTrainGare() - ctx.s0) * (1 - (1 - k) * (1 - k)));
        majFumees(dt, k < 1 ? 10 : 2.5);
        const [a, b] = PONTON;
        foule.forEach((s, i) => {
          const vis = t > 12.2 && t < 18.5; s.visible = vis; if (!vis) return;
          const u = uQuai0 + (uQuai1 - uQuai0) * (0.12 + (i / foule.length) * 0.7); const p = voie.getPointAt(u), l = lateral(voie.getTangentAt(u));
          const x0 = p.x + l.x * 1.9, z0 = p.z + l.z * 1.9, dec = ((i % 3) - 1) * 0.45;
          const k1 = lisse(12.8 + (i % 4) * 0.15, 16.2, t), k2 = lisse(16.2, 18.4, t);
          const x1 = a[0] + dec, z1 = a[1] + 0.4, x2 = a[0] + (b[0] - a[0]) * 0.8 + dec, z2 = a[1] + (b[1] - a[1]) * 0.8;
          const x = k2 > 0 ? melange(x1, x2, k2) : melange(x0, x1, k1), z = k2 > 0 ? melange(z1, z2, k2) : melange(z0, z1, k1);
          const vx = k2 > 0 ? x2 - x1 : x1 - x0, vz = k2 > 0 ? z2 - z1 : z1 - z0;
          s.position.set(x, melange(RAIL_Y + 0.4, EAU + 0.55, k1) + Math.abs(Math.sin(t * 9 + i)) * 0.08, z); s.rotation.y = Math.atan2(vx, vz);
        });
        barques.forEach((bq, i) => { placerBarque(bq, lisse(18.4 + i * 0.35, 30.6 + i * 0.35, t), t); bq.userData.passagers.visible = t > 18.3; });
        hagrid.visible = t < 18.3;
      },
      fin() { hagrid.visible = true; placerTrain(sTrainGare()); foule.forEach((s) => (s.visible = false)); barques.forEach((bq) => { placerBarque(bq, 0, 0); bq.userData.passagers.visible = false; }); },
    },
    hippogriffe: {
      duree: 16,
      textes: [[0.5, 4.2, "L'équipe salue Buck… et Buck s'incline à son tour !"], [4.6, 11.6, "Accrochez-vous : l'hippogriffe s'envole au-dessus du domaine !"], [12.4, 16, "Atterrissage en douceur. Buck a accepté l'équipe."]],
      sons: [[3.4, "magie"], [12.6, "tinte"]],
      debut(ctx) {
        const h = S.hippogriffe, p0 = h.position.clone(); ctx.p0 = p0; ctx.r0 = h.rotation.y;
        ctx.vol = new THREE.CatmullRomCurve3([[0, 0, 0], [4, 3, -4], [13, 10, -12], [29, 15, -18], [47, 16, -12], [57, 13, 0], [43, 11, 14], [21, 10, 16], [7, 5, 8], [1, 1.2, 2], [0, 0, 0]].map(([x, y, z]) => new THREE.Vector3(p0.x + x, p0.y + y, p0.z + z)), false, "centripetal");
      },
      cles(ctx) {
        const p0 = ctx.p0, K = [{ t: 0, p: [p0.x + 5, p0.y + 3.2, p0.z + 3.5], c: [p0.x, p0.y + 1.5, p0.z] }, { t: 3, p: [p0.x + 4, p0.y + 2.4, p0.z + 2.4], c: [p0.x, p0.y + 1.6, p0.z] }];
        for (const t of [6, 7.5, 9, 10.5, 12]) { const u = lisse(4, 12.5, t), p = ctx.vol.getPoint(u), d = ctx.vol.getTangent(u); K.push({ t, p: [p.x - d.x * 8, p.y - d.y * 8 + 3.5, p.z - d.z * 8], c: [p.x + d.x * 3, p.y + d.y * 3 + 0.6, p.z + d.z * 3] }); }
        K.push({ t: 14, p: [p0.x + 5.5, p0.y + 4, p0.z + 3], c: [p0.x, p0.y + 1.4, p0.z] }, { t: 16, p: [p0.x + 6.5, p0.y + 4.6, p0.z + 4], c: [p0.x, p0.y + 1.4, p0.z] });
        return K;
      },
      maj(t, ctx) {
        const h = S.hippogriffe; const u = lisse(4, 12.5, t);
        const salut = t > 0.6 && t < 2.8 ? Math.sin(Math.PI * (t - 0.6) / 2.2) : 0; h.userData.corps.rotation.z = -0.4 * salut;
        const f = lisse(3, 4.2, t) * (1 - lisse(12.4, 13.6, t)); ailesHippo(melange(-0.9, 0.15 + 0.7 * Math.sin(t * 8), f), melange(0.35, 1, f));
        if (u > 0 && u < 1) { const p = ctx.vol.getPoint(u), d = ctx.vol.getTangent(u); h.position.copy(p); h.rotation.set(0, Math.atan2(-d.z, d.x), Math.asin(Math.max(-0.6, Math.min(0.6, d.y))) * 0.8); }
        else { h.position.copy(ctx.p0); h.rotation.set(0, ctx.r0, 0); }
      },
      fin(ctx) { const h = S.hippogriffe; h.position.copy(ctx.p0); h.rotation.set(0, ctx.r0, 0); h.userData.corps.rotation.z = 0; ailesHippo(-0.9, 0.35); },
    },
    saule: {
      duree: 9.5,
      textes: [[0.4, 4.6, "Attention ! Le Saule cogneur n'aime pas du tout les visiteurs…"], [5, 9.5, "Pour l'approcher, il faudra trouver le nœud secret de son tronc."]],
      sons: [[1.2, "grave"], [3.6, "grave"]],
      cles: [{ t: 0, p: [2, 9, 41], c: [-8, 4, 28.5] }, { t: 3, p: [-2.5, 5, 35.5], c: [-8, 4.2, 28.5] }, { t: 6.5, p: [-13, 4.6, 35.5], c: [-8, 4, 28.5] }, { t: 9.5, p: [-6, 8, 40], c: [-8, 3, 27] }],
      maj(t, ctx) {
        S.fureur = lisse(0.8, 1.8, t) * (1 - lisse(7.2, 9, t));
        for (const [k, tt] of [[1, 2], [2, 3.6], [3, 5.2]]) if (t > tt && !ctx["f" + k]) { ctx["f" + k] = true; eclat(saule.position.clone().add(new THREE.Vector3(0, 5.5, 0)), 0x7FB85A, 70, { taille: 0.3 }); }
      },
      secousse: () => (S.fureur || 0) * 0.12,
      fin() { S.fureur = 0; },
    },
    calmar: {
      duree: 15,
      textes: [[0.5, 4.6, "Les eaux du lac noir se mettent à bouillonner…"], [5.4, 10.6, "Le calmar géant ! Il fixe l'équipe de ses yeux immenses…"], [11, 15, "…puis il replonge lentement. Que cache-t-il au fond du lac ?"]],
      sons: [[2.6, "vague"], [11.6, "vague"]],
      cles: [{ t: 0, p: [-3, 11, 31], c: [8, 1, 17] }, { t: 3.5, p: [1, 4.8, 26], c: [15, 2.5, 12] }, { t: 7.5, p: [7, 3.2, 19.5], c: [16, 4, 11] }, { t: 11, p: [5, 3.6, 21.5], c: [16, 3, 11] }, { t: 15, p: [-1, 7, 28], c: [12, 0.5, 13] }],
      debut() { calmarG.visible = true; },
      maj(t, ctx) {
        const y = melange(-12, -0.9, lisse(2.2, 5.5, t)) + melange(0, -11, lisse(11, 14.5, t)) + Math.sin(t * 1.3) * 0.15;
        majCalmar(t, y, lisse(6.5, 7.5, t) * (1 - lisse(9.5, 10.5, t)) * Math.sin(t * 6));
        S.rides.forEach((r, i) => { const k = (t - 2.2 - i * 0.7) / 2.1 - Math.floor((t - 2.2 - i * 0.7) / 2.1); const on = t > 2.2 + i * 0.7 && t < 13.5; r.material.opacity = on ? 0.6 * (1 - k) : 0; r.scale.setScalar(2 + k * 7); });
        if (t > 3.2 && !ctx.g1) { ctx.g1 = true; eclat(new THREE.Vector3(16, 1, 11), 0xCFE8FF, 220, { taille: 0.3, force: 1.2 }); }
        if (t > 12 && !ctx.g2) { ctx.g2 = true; eclat(new THREE.Vector3(16, 0.6, 11), 0xCFE8FF, 140, { taille: 0.28, force: 0.9 }); }
      },
      fin() { calmarG.visible = false; S.rides.forEach((r) => (r.material.opacity = 0)); },
    },
    plongee: {
      duree: 15,
      textes: [[0.5, 4.4, "Une Branchiflore chacun… et l'équipe plonge dans le lac noir !"], [5, 9.6, "Sous l'eau, les algues ondulent et les poissons tournent en rond…"], [10, 15, "Au fond, une salle de verre brille d'une lueur verte. L'entrée est là."]],
      sons: [[3.7, "vague"]],
      cles() { const F = fondLac; return [{ t: 0, p: [33, 10, 16], c: [23, 0, 2] }, { t: 3, p: [26, 3, 8.5], c: [23, -1, 3] }, { t: 5, p: [24.5, -1.2, 8.2], c: [23, F + 2.5, 3] }, { t: 8, p: [30.5, F + 3.4, 7.5], c: [23, F + 1.5, 2] }, { t: 11.5, p: [16, F + 3, 8.5], c: [23, F + 1.2, 2] }, { t: 15, p: [23, F + 2.1, 10.8], c: [23, F + 0.9, 4.8] }]; },
      maj(t, ctx, dt) {
        majAlgues(t); majPoissons(t);
        const a = bulles.geometry.attributes.position; for (let i = 0; i < a.count; i++) { a.array[i * 3 + 1] += dt * (0.8 + (i % 5) * 0.15); if (a.array[i * 3 + 1] > EAU - 0.1) a.array[i * 3 + 1] = fondLac + 0.5; } a.needsUpdate = true;
        if (t > 3.9 && !ctx.g) { ctx.g = true; eclat(new THREE.Vector3(24.8, 0.4, 8), 0xDCEBFF, 160, { taille: 0.26 }); }
      },
    },
    vif: {
      duree: 9.5,
      textes: [[0.3, 4.3, "Le Vif d'or ensorcelé file à travers le terrain de Quidditch…"], [4.7, 9.5, "…il traverse les anneaux ! Impossible de l'attraper sans ruse."]],
      sons: [[0.3, "magie"], [4.4, "magie"]],
      debut(ctx) { ctx.vol = new THREE.CatmullRomCurve3([[30, 5, -4], [37, 8, -11], [45, 6.5, -16.5], [48.5, 7.6, -14.2], [51.6, 7.7, -14], [56, 7.7, -13.8], [57, 10, -8], [47, 4.5, -7.5], [37, 6, -17], [42, 4, -14]].map(V3), false, "centripetal"); },
      cles(ctx) {
        const K = []; for (let t = 0; t <= 8.51; t += 0.85) { const u = Math.min(1, t / 8.6), p = ctx.vol.getPointAt(u), d = ctx.vol.getTangentAt(u); K.push({ t, p: [p.x - d.x * 3, p.y - d.y * 3 + 0.7, p.z - d.z * 3], c: [p.x + d.x * 1.5, p.y + d.y * 1.5, p.z + d.z * 1.5] }); }
        K.push({ t: 9.5, p: [35, 9, -3], c: [42, 4, -14] }); return K;
      },
      maj(t, ctx) { vifSur(ctx.vol, t / 8.6, t); },
    },
    feux: {
      duree: 13,
      textes: [[0.5, 5, "Les quatre reliques brillent à nouveau sur le château…"], [5.5, 13, "Poudlard est sauvé ! Place à la fête !"]],
      cles: [{ t: 0, p: [30, 13, 16], c: [-2, 22, -33] }, { t: 13, p: [19, 15, 6], c: [-2, 25, -33] }],
      debut() { S.lumieres.forEach(([l, i]) => (l.intensity = i * 0.38)); scene.background = new THREE.Color(0x121735); scene.fog = new THREE.Fog(0x121735, 120, 320); S.air = [scene.fog, scene.background]; S.nuit = true; },
      fin() { S.lumieres.forEach(([l, i]) => (l.intensity = i)); S.nuit = false; scene.fog = S.airJour[0]; scene.background = S.airJour[1]; S.air = S.airJour; },
      maj(t, ctx) {
        if (ctx.prochain == null) { ctx.prochain = 0.8; ctx.k = 0; }
        while (t >= ctx.prochain && t < 11.5) {
          eclat(new THREE.Vector3(-16 + Math.random() * 32, 32 + Math.random() * 12, -46 + Math.random() * 24), COULEURS_FEUX[ctx.k % 5], 220, { taille: 1.5, force: 1.8, gravite: 1.2, vie: 2.8, sphere: true });
          if (ctx.k % 2 === 0 && ctx.opts.son) ctx.opts.son("feu");
          ctx.k++; ctx.prochain += 0.42 + Math.random() * 0.3;
        }
      },
    },
  };

  function jouerScene(id, opts = {}) {
    const def = SCENES[id];
    if (!S.ok || !def) { if (opts.fin) opts.fin(); return; }
    if (cine) terminerScene(false);
    anim = null; tween = null; S.enOrbite = false;
    const ctx = { opts };
    if (def.debut) def.debut(ctx);
    const cles = typeof def.cles === "function" ? def.cles(ctx) : def.cles;
    marqueurs.forEach((m) => (m.groupe.visible = false)); ctx.faisceau = faisceau.visible; faisceau.visible = false;
    cine = { id, def, ctx, cles, t0: performance.now(), courbeP: new THREE.CatmullRomCurve3(cles.map((k) => V3(k.p)), false, "centripetal"), courbeC: new THREE.CatmullRomCurve3(cles.map((k) => V3(k.c)), false, "centripetal"), texte: -1, son: 0 };
    controls.enabled = false; camera.fov = 52; camera.updateProjectionMatrix();
  }
  function terminerScene(appeler) {
    const c = cine; if (!c) return; cine = null; S.gel = null;
    if (c.def.fin) c.def.fin(c.ctx);
    marqueurs.forEach((m) => (m.groupe.visible = true)); faisceau.visible = c.ctx.faisceau;
    const k = c.cles[c.cles.length - 1]; camera.position.copy(V3(k.p)); controls.target.copy(V3(k.c)); controls.enabled = true; camera.fov = 45; camera.updateProjectionMatrix();
    if (c.ctx.opts.texte) c.ctx.opts.texte(null);
    if (appeler && c.ctx.opts.fin) c.ctx.opts.fin();
  }
  function majScene(maint, dt) {
    const c = cine; const t = S.gel != null ? S.gel : (maint - c.t0) / 1000; const cl = c.cles, n1 = cl.length - 1;
    let i = 0; while (i < n1 - 1 && t >= cl[i + 1].t) i++;
    const x = Math.min(1, Math.max(0, (t - cl[i].t) / (cl[i + 1].t - cl[i].t)));
    const f = n1 === 1 ? ease(x) : i === 0 ? x * x * (2 - x) : i === n1 - 1 ? x + x * x - x * x * x : x;
    const u = Math.min(1, (i + f) / n1);
    camera.position.copy(c.courbeP.getPoint(u)); const cible = c.courbeC.getPoint(u);
    if (c.def.secousse) { const s = c.def.secousse(t); camera.position.x += (Math.random() - 0.5) * s; camera.position.y += (Math.random() - 0.5) * s; }
    controls.target.copy(cible); camera.lookAt(cible);
    if (c.def.maj) c.def.maj(t, c.ctx, dt);
    if (cine !== c) return;
    const tx = (c.def.textes || []).findIndex(([a, b]) => t >= a && t < b);
    if (tx !== c.texte) { c.texte = tx; const o = c.ctx.opts; if (o.texte) { const v = tx >= 0 ? c.def.textes[tx][2] : null; o.texte(typeof v === "function" ? v(o) : v); } }
    const sons = c.def.sons || []; while (c.son < sons.length && t >= sons[c.son][0]) { if (c.ctx.opts.son) c.ctx.opts.son(sons[c.son][1]); c.son++; }
    if (t >= c.def.duree) terminerScene(true);
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
    if (document.hidden || (S.pause && !anim && !tween && !cine)) return;
    const t = horloge.getElapsedTime(), maint = performance.now();
    const dt = Math.min(0.05, (maint - (S.tPrec || maint)) / 1000); S.tPrec = maint;
    if (cine) majScene(maint, dt);
    else if (anim) {
      const k = Math.min(1, (maint - anim.t0) / anim.duree); placerEquipe(melange(anim.u0, anim.u1, ease(k)));
      const p = equipe.position; controls.target.lerp(new THREE.Vector3(p.x, p.y, p.z), 0.08); camera.position.lerp(new THREE.Vector3(p.x + 22, p.y + 27, p.z + 34), 0.04);
      if (k >= 1) { const f = anim.fin; anim = null; tween = null; f && f(); }
    } else if (tween) {
      const k = Math.min(1, (maint - tween.debut) / tween.ms), e = ease(k);
      camera.position.lerpVectors(tween.p0, tween.p1, e); controls.target.lerpVectors(tween.t0c, tween.t1, e);
      if (k >= 1) tween = null;
    } else if (S.enOrbite) {
      S.angle += dt * 0.035;
      camera.position.lerp(new THREE.Vector3(4 + Math.cos(S.angle) * 112, 60, -2 + Math.sin(S.angle) * 112), 0.03); controls.target.lerp(new THREE.Vector3(4, 2, -2), 0.03);
    }
    const scn = cine ? cine.id : null;
    equipe.children.forEach((c) => { if (c.userData.phase != null) c.position.y = Math.abs(Math.sin(t * 3 + c.userData.phase)) * (anim ? 0.25 : 0.06); });
    hibou.position.set(Math.cos(t * 0.9) * 1.6, 2.4 + Math.sin(t * 2) * 0.2, Math.sin(t * 0.9) * 1.6); hibou.rotation.y = -t * 0.9;
    hibou.children.forEach((c) => { if (c.userData.s) c.rotation.z = c.userData.s * Math.sin(t * 14) * 0.6; });
    marqueurs.forEach((m) => { const d = m.groupe.userData; if (!d.orbe) return; d.orbe.rotation.y = t * 0.8 + m.n; d.orbe.position.y = (LIEUX[m.n].cp ? 2.1 : 1.6) + Math.sin(t * 1.6 + m.n) * 0.12 + (d.etat === "actuel" ? 0.15 : 0); if (d.etat === "actuel") d.anneau.scale.setScalar(1 + 0.12 * Math.sin(t * 3)); });
    ORDRE_RELIQUES.forEach((r) => { const o = reliques3D[r]; if (o && o.visible) { o.rotation.y = t * 0.9; } });
    if (faisceau.visible) faisceau.material.opacity = 0.16 + 0.08 * Math.sin(t * 2.4);
    if (vif && scn !== "vif") { vif.position.set(42 + Math.sin(t * 0.7) * 8, 4 + Math.sin(t * 1.9) * 1.5, -14 + Math.sin(t * 1.3) * 4); vif.children.forEach((c) => { if (c.userData.s) c.rotation.y = c.userData.s * Math.sin(t * 40) * 0.9; }); }
    if (saule) { const f = S.fureur || 0; saule.children.forEach((c, i) => { if (c.userData.base != null) c.rotation.x = c.userData.base + Math.sin(t * 1.1 + i) * 0.18 + f * Math.sin(t * 9 + i * 1.9) * 0.75; }); saule.rotation.y = f * Math.sin(t * 5) * 0.25; }
    if (tentacule) { const cyc = (t % 26) / 26; tentacule.position.y = cyc < 0.25 ? -4 + Math.sin(cyc / 0.25 * Math.PI) * 3.8 : -4; tentacule.rotation.y = t * 0.3; }
    if (lucioles) { const a = lucioles.geometry.attributes.position, b = lucioles.geometry.userData.base; for (let i = 0; i < a.count; i++) { a.array[i * 3 + 1] = b[i * 3 + 1] + Math.sin(t * 1.3 + i) * 0.4; a.array[i * 3] = b[i * 3] + Math.sin(t * 0.7 + i * 2) * 0.5; } a.needsUpdate = true; lucioles.material.opacity = 0.55 + 0.35 * Math.sin(t * 2); }
    if (S.reflets) S.reflets.material.opacity = 0.35 + 0.25 * Math.sin(t * 1.7);
    if (S.haloLac) S.haloLac.material.opacity = 0.18 + 0.1 * Math.sin(t * 2.2);
    if (S.drapeau) S.drapeau.rotation.y = Math.sin(t * 2) * 0.25;
    if (S.hippogriffe && scn !== "hippogriffe") S.hippogriffe.rotation.y = 0.8 + Math.sin(t * 0.4) * 0.6;
    if (scn !== "express") majFumees(dt, 1.2);
    nuages.forEach((n, i) => { const a = 0.0004 * n.userData.v; const x = n.position.x, z = n.position.z + 5; n.position.x = x * Math.cos(a) - z * Math.sin(a); n.position.z = x * Math.sin(a) + z * Math.cos(a) - 5; });
    for (let i = particules.length - 1; i >= 0; i--) { const pa = particules[i]; const age = (maint - pa.t0) / 1000; const a = pa.pts.geometry.attributes.position; pa.v.forEach((v, j) => { a.array[j * 3] += v.x * 0.016; a.array[j * 3 + 1] += (v.y - age * pa.gravite) * 0.016; a.array[j * 3 + 2] += v.z * 0.016; }); a.needsUpdate = true; pa.pts.material.opacity = Math.max(0, 1 - age / pa.vie); if (age > pa.vie) { scene.remove(pa.pts); pa.pts.geometry.dispose(); particules.splice(i, 1); } }
    if (!cine) controls.update();
    const sous = camera.position.y < EAU && dansLac(camera.position.x, camera.position.z);
    if (sous !== !!S.sous) { S.sous = sous; [scene.fog, scene.background] = sous ? S.sousEau : S.air; }
    renderer.render(scene, camera);
  }

  function ecran(n) { const l = LIEUX[n]; const p = pointLieu(l); p.y += 3; p.project(camera); const r = renderer.domElement.getBoundingClientRect(); return { x: r.left + (p.x + 1) / 2 * r.width, y: r.top + (1 - p.y) / 2 * r.height, devant: p.z < 1 }; }

  function orbite(oui) { S.enOrbite = oui; if (oui && camera) { tween = null; S.angle = Math.atan2(camera.position.z + 2, camera.position.x - 4); } }
  return Object.assign(S, { __cam: () => ({ camera, controls }), __scene: () => cine && { id: cine.id, t: (performance.now() - cine.t0) / 1000 }, __aller: (t, gel) => { if (cine) { cine.t0 = performance.now() - t * 1000; S.gel = gel ? t : null; } },
    init, majEtat, avancer, viserLieu, survolGeneral, suivreEquipe, cinematique, eclat: (n) => { const p = pointLieu(LIEUX[n]); eclat(p.add(new THREE.Vector3(0, 3, 0)), 0xFFE3A0, 140); }, ecran, en: () => anim != null,
    jouerScene, passerScene: () => terminerScene(true), orbite });
})();
