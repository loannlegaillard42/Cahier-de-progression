  /* ---------- Gare de Pré-au-Lard, Poudlard Express et barques ---------- */
  let voie, voieLong, uPortail = 0, uQuai0 = 0, uQuai1 = 1, train, fumees = [], barques = [], foule = [], hagrid;
  const PONTON = [[36.9, 16.7], [34.7, 10.6]];
  const ARRIVEE = [15.4, -1.6];
  const Y = new THREE.Vector3(0, 1, 0);
  const lateral = (t) => { const l = Math.hypot(t.x, t.z) || 1; return new THREE.Vector3(-t.z / l, 0, t.x / l); }; // vers le lac

  /* Maison à colombages : soubassement de pierre, étage en encorbellement, toit pentu, cheminée, fenêtres éclairées */
  function maison(L, x, z, ry, w, d, h, toit = "toit", pente = 0.72) {
    const y = hauteur(x, z) - 0.3, c = Math.cos(ry), s = Math.sin(ry), P = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
    L.boite(w, 1.3, d, "pierreSombre", x, y, z, ry, 3); L.add(uvMonde(new THREE.BoxGeometry(w + 0.3, h - 1.2, d + 0.3), 1.5), "colombage", x, y + 1.3 + (h - 1.2) / 2, z, ry);
    const ht = w * pente; L.add(toitPans(d + 0.3, w + 0.3, ht, 0.35), toit, x, y + h + 0.1, z, ry + Math.PI / 2);
    for (const k of [-1, 1]) { const [px, pz] = P(0, k * (d / 2 + 0.15)); L.add(uvMonde(pignon(w + 0.3, ht), 1.5), "colombage", px, y + h + 0.1, pz, ry + Math.PI / 2); }
    { const [px, pz] = P(w * 0.22, d * 0.2); L.boite(0.5, ht + 0.9, 0.5, "pierre", px, y + h, pz, ry, 2); }
    for (const k of [-1, 1]) { const [px, pz] = P(k * (w / 2 + 0.17), 0); L.add(new THREE.PlaneGeometry(0.55, 0.6), "fenetreCarree", px, y + 2.1, pz, ry + k * Math.PI / 2); }
    { const [px, pz] = P(-w * 0.2, d / 2 + 0.17), [qx, qz] = P(w * 0.22, d / 2 + 0.17), [rx, rz] = P(0, d / 2 + 0.02); L.add(new THREE.PlaneGeometry(0.55, 0.6), "fenetreCarree", px, y + 2.1, pz, ry); L.add(new THREE.PlaneGeometry(0.55, 0.6), "fenetreCarree", qx, y + 2.1, qz, ry); L.add(uvMonde(new THREE.BoxGeometry(0.6, 1.15, 0.1), 1.5), "boisSombre", rx, y + 0.6, rz, ry); }
  }

  function construireGare() {
    const pts = [[106, 39], [94, 35.6], [82, 32.3]].concat(VOIE).map(([x, z]) => new THREE.Vector3(x, RAIL_Y, z));
    voie = new THREE.CatmullRomCurve3(pts, false, "centripetal"); voieLong = voie.getLength();
    const N = 600; let premier = true;
    for (let i = 0; i <= N; i++) { const p = voie.getPointAt(i / N); if (premier && p.x <= VOIE[0][0]) { uPortail = i / N; premier = false; } if (p.x >= 49.5) uQuai0 = i / N; if (p.x >= 35) uQuai1 = i / N; }
    const L = lot();
    // ballast (ruban de gravier), traverses, rails
    const n = Math.ceil((1 - uPortail) * voieLong / 0.7), pos = [], uvs = [], idx = [];
    for (let i = 0; i <= n; i++) { const u = uPortail + (1 - uPortail) * i / n, p = voie.getPointAt(u), l = lateral(voie.getTangentAt(u)); for (const d of [-1.45, 1.45]) { pos.push(p.x + l.x * d, RAIL_Y - 0.05, p.z + l.z * d); uvs.push(d / 2.9 + 0.5, i * 0.35); } if (i < n) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
    const gb = new THREE.BufferGeometry(); gb.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); gb.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2)); gb.setIndex(idx); gb.computeVertexNormals();
    const ballast = new THREE.Mesh(gb, std({ ...texture("sol", 2), color: 0x8E857A, roughness: 1, side: THREE.DoubleSide })); ballast.receiveShadow = true; scene.add(ballast);
    const nb = Math.floor((1 - uPortail) * voieLong / 0.75), trav = new THREE.InstancedMesh(new THREE.BoxGeometry(1.9, 0.13, 0.32), mat("boisSombre"), nb);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), un = new THREE.Vector3(1, 1, 1);
    for (let i = 0; i < nb; i++) { const u = uPortail + (1 - uPortail) * (i + 0.5) / nb, p = voie.getPointAt(u), t = voie.getTangentAt(u); q.setFromAxisAngle(Y, Math.atan2(t.x, t.z)); m4.compose(new THREE.Vector3(p.x, RAIL_Y + 0.02, p.z), q, un); trav.setMatrixAt(i, m4); }
    trav.receiveShadow = true; scene.add(trav);
    const acier = std({ color: 0x8E949E, roughness: 0.32, metalness: 0.95 });
    for (const d of [-0.55, 0.55]) { const pp = [], k = Math.ceil((1 - uPortail) * voieLong); for (let i = 0; i <= k; i++) { const u = uPortail + (1 - uPortail) * i / k, p = voie.getPointAt(u), l = lateral(voie.getTangentAt(u)); pp.push(new THREE.Vector3(p.x + l.x * d, RAIL_Y + 0.15, p.z + l.z * d)); } scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pp), k * 2, 0.055, 5, false), acier)); }
    // portail du tunnel : façade de pierre, voûte en claveaux, intérieur noir
    const pt = voie.getPointAt(uPortail), tt = voie.getTangentAt(uPortail), rp = Math.atan2(tt.x, tt.z), cp = Math.cos(rp), sp = Math.sin(rp);
    const auP = (lx, ly, lz) => [pt.x + lx * cp + lz * sp, RAIL_Y - 0.2 + ly, pt.z - lx * sp + lz * cp];
    for (const s of [-1, 1]) { const [x, y, z] = auP(s * 3.4, 0, -1); L.boite(3.6, 8.4, 2.4, "pierreSombre", x, y - 1, z, rp); const [x2, y2, z2] = auP(s * 5.6, 0, 0.3); L.boite(1.3, 6.2, 1.6, "pierre", x2, y2 - 1, z2, rp, 3); }
    { const [x, y, z] = auP(0, 4.1, -1); L.boite(3.6, 3.3, 2.4, "pierreSombre", x, y, z, rp); const [x3, y3, z3] = auP(0, 7.4, -1); L.boite(11.6, 0.5, 2.8, "pierre", x3, y3, z3, rp, 3); }
    for (let k = 0; k <= 12; k++) { const a = (k / 12) * Math.PI, [x, y, z] = auP(Math.cos(a) * 1.95, 2.5 + Math.sin(a) * 1.95, 0.25); L.add(uvMonde(new THREE.BoxGeometry(0.5, 0.75, 0.5), 2), k % 2 ? "pierre" : "pierreSombre", x, y, z, rp, 0, a - Math.PI / 2); }
    const nuit = new THREE.MeshBasicMaterial({ color: 0x050508 });
    { const [x, y, z] = auP(0, 1.25, -1.1); L.add(new THREE.BoxGeometry(3.4, 2.5, 2.4), nuit, x, y, z, rp); const [x2, y2, z2] = auP(0, 2.5, -1.1), v = new THREE.CylinderGeometry(1.7, 1.7, 2.4, 20, 1, false, 0, Math.PI); v.rotateZ(Math.PI / 2); v.rotateY(Math.PI / 2); L.add(v, nuit, x2, y2, z2, rp); }
    // quai pavé (côté lac), abri, lampadaires
    for (let u = uQuai0; u < uQuai1; u += 2 / voieLong) { const p = voie.getPointAt(u), t = voie.getTangentAt(u), l = lateral(t), ry = Math.atan2(t.x, t.z); L.add(uvMonde(new THREE.BoxGeometry(2.7, 0.8, 2.12), 2), "paves", p.x + l.x * 2.45, RAIL_Y, p.z + l.z * 2.45, ry); }
    for (let u = uQuai0 + 1.5 / voieLong, k = 0; u < uQuai1; u += 4.2 / voieLong, k++) {
      const p = voie.getPointAt(u), l = lateral(voie.getTangentAt(u)), x = p.x + l.x * 3.5, z = p.z + l.z * 3.5, y = RAIL_Y + 0.4;
      L.cyl(0.05, 0.08, 2.7, "noir", x, y, z, 8); L.cyl(0.12, 0.12, 0.08, "noir", x, y + 2.7, z, 8); L.add(new THREE.BoxGeometry(0.28, 0.36, 0.28), "lampe", x, y + 2.95, z); L.add(new THREE.ConeGeometry(0.26, 0.2, 4), "noir", x, y + 3.24, z, Math.PI / 4);
      if (Q !== "basse" && k % 2 === 0) { const h = halo(0xFFC870, 2.4, 0.4); h.position.set(x, y + 2.95, z); scene.add(h); }
    }
    // panneau « PRÉ-AU-LARD »
    const um = (uQuai0 + uQuai1) / 2, pm = voie.getPointAt(um), tm = voie.getTangentAt(um), lm = lateral(tm);
    const plaque = toile(512, 128, (g) => { g.fillStyle = "#1C3529"; g.fillRect(0, 0, 512, 128); g.strokeStyle = "#D9B65A"; g.lineWidth = 8; g.strokeRect(6, 6, 500, 116); g.fillStyle = "#F0D48E"; g.font = "700 62px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("PRÉ-AU-LARD", 256, 68); });
    const panneau = new THREE.Group();
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), std({ map: plaque, roughness: 0.6 })); pl.position.y = 2.3; panneau.add(pl);
    const dos = new THREE.Mesh(new THREE.BoxGeometry(3.75, 1.05, 0.1), mat("boisSombre")); dos.position.set(0, 2.3, -0.06); panneau.add(dos);
    for (const s of [-1.55, 1.55]) { const pied = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.08, 2.5, 8), mat("boisSombre")); pied.position.set(s, 1.25, -0.1); panneau.add(pied); }
    panneau.position.set(pm.x + lm.x * 3.25, RAIL_Y + 0.4, pm.z + lm.z * 3.25); panneau.rotation.y = Math.atan2(-lm.x, -lm.z); scene.add(ombres(panneau));
    // bâtiment de la gare (pierre et colombages, toit d'ardoise, marquise sur le quai)
    const ug = uQuai0 + 4 / voieLong, pg = voie.getPointAt(ug), tg = voie.getTangentAt(ug), lg = lateral(tg), rg = Math.atan2(tg.x, tg.z);
    maison(L, pg.x + lg.x * 6.1, pg.z + lg.z * 6.1, rg + Math.PI / 2, 6.4, 3.6, 3.4, "toit", 0.4);
    for (const k of [-2.6, 0, 2.6]) { const u = ug + k / voieLong, p = voie.getPointAt(u), l = lateral(voie.getTangentAt(u)); L.cyl(0.07, 0.08, 2.5, "boisSombre", p.x + l.x * 3.3, RAIL_Y + 0.4, p.z + l.z * 3.3, 8); }
    L.add(uvMonde(new THREE.BoxGeometry(2.3, 0.1, 6.6), 2), "toit", pg.x + lg.x * 3.6, RAIL_Y + 3.05, pg.z + lg.z * 3.6, rg, 0, 0.16);
    // le village de Pré-au-Lard
    VILLAGE.forEach(([x, z, r], i) => maison(L, x, z, r, 2.6 + (i % 3) * 0.5, 2.5 + ((i + 1) % 2) * 0.5, 2.9 + (i % 2) * 0.7, i % 2 ? "tuiles" : "toit"));
    // ponton
    const [a, b] = PONTON, lg2 = Math.hypot(b[0] - a[0], b[1] - a[1]), rpo = Math.atan2(b[0] - a[0], b[1] - a[1]);
    L.add(uvMonde(new THREE.BoxGeometry(1.5, 0.16, lg2), 1.2), "bois", (a[0] + b[0]) / 2, EAU + 0.45, (a[1] + b[1]) / 2, rpo);
    for (let k = 0; k <= 4; k++) for (const s of [-0.7, 0.7]) { const f = k / 4, x = a[0] + (b[0] - a[0]) * f, z = a[1] + (b[1] - a[1]) * f; L.cyl(0.09, 0.1, 1.9, "ecorce", x + s * 0.94, EAU - 1.1, z - s * 0.33, 7, 1.5); }
    L.poser(scene);
    // barques
    const form = [[0, 0], [1.7, 1.5], [-1.5, 1.7], [0.2, 3.2]];
    const dir = [b[0] - a[0], b[1] - a[1]], nd = Math.hypot(dir[0], dir[1]), ouest = [dir[1] / nd, -dir[0] / nd];
    barques = form.map(([fx, fz], i) => {
      const g = barque(i), f = i < 2 ? 0.95 : 0.72, cote = i % 2 ? -1.45 : 1.45, dx = a[0] + dir[0] * f + ouest[0] * cote, dz = a[1] + dir[1] * f + ouest[1] * cote;
      const route = new THREE.CatmullRomCurve3([[dx, dz], [29 + fx, 9.6 + fz], [22.5 + fx, 6.9 + fz], [17.6 + fx * 0.7, 2.4 + fz * 0.6], [ARRIVEE[0] + fx * 0.6, ARRIVEE[1] + fz * 0.5]].map(([x, z]) => new THREE.Vector3(x, EAU, z)), false, "centripetal");
      g.userData.route = route; g.userData.i = i; scene.add(g); placerBarque(g, 0, 0); return g;
    });
    // Hagrid et sa lanterne, au bout du quai
    hagrid = construireHagrid(); hagrid.position.set(a[0] + 0.4, RAIL_Y + 0.38, a[1] + 0.9); hagrid.rotation.y = Math.atan2(-dir[0], -dir[1]); scene.add(hagrid);
    // les élèves de première année (cachés hors de la scène du train)
    for (let k = 0; k < 14; k++) { const s = sorcier(ORDRE_MAISONS[k % 4], k); s.scale.setScalar(0.95); s.visible = false; s.userData.k = k; scene.add(s); foule.push(s); }
    // le train
    train = new THREE.Group(); train.userData.voitures = [locomotive(), ...[0, 1, 2, 3].map(() => voiture())]; train.userData.voitures.forEach((v) => train.add(v)); scene.add(train);
    const tex = dessin("nuage");
    for (let k = 0; k < 40; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, color: new THREE.Color(1.5, 1.47, 1.42), transparent: true, opacity: 0, depthWrite: false })); sp.material.userData.lin = true; sp.visible = false; scene.add(sp); fumees.push({ sp, age: 99, vx: 0, vz: 0 }); }
    placerTrain(sTrainGare());
  }
  const LONG_VOITURES = [4.3, 4.3, 4.3, 4.3, 4.3];
  const sTrainGare = () => voieLong - 1.2;
  function placerTrain(s) {
    const avant = train.userData.s; train.userData.s = s; let off = 0;
    train.userData.voitures.forEach((v, i) => {
      const c = Math.min(voieLong, Math.max(0, s - off - LONG_VOITURES[i] / 2)) / voieLong; const p = voie.getPointAt(c), t = voie.getTangentAt(c);
      v.position.set(p.x, RAIL_Y + 0.2, p.z); v.rotation.y = Math.atan2(t.x, t.z); off += LONG_VOITURES[i] + 0.25;
      if (avant != null && v.userData.roues) v.userData.roues.forEach((r) => (r.rotation.x += (s - avant) / r.userData.rayon));
    });
  }

  /* Le Poudlard Express : locomotive rouge, laiton et acier poli ; avant vers +z */
  function roueDans(L, r, x, y, z, m) { L.add(new THREE.TorusGeometry(r - 0.05, 0.055, 8, 20), "argent", x, y, z, Math.PI / 2); L.add(new THREE.CylinderGeometry(r - 0.07, r - 0.07, 0.07, 16), m, x, y, z, 0, 0, Math.PI / 2); }
  function roue(r) {                                     // grande roue motrice à rayons, qui tourne
    const g = new THREE.Group(), L = lot(); roueDans(L, r, 0, 0, 0, MAT.locoRouge);
    for (let k = 0; k < 6; k++) L.add(new THREE.BoxGeometry(0.1, (r - 0.08) * 2, 0.05), "noir", 0, 0, 0, 0, (k / 6) * Math.PI);
    L.add(new THREE.CylinderGeometry(0.09, 0.09, 0.14, 10), "argent", 0, 0, 0, 0, 0, Math.PI / 2); L.poser(g, { recoit: false }); g.userData.rayon = r; return g;
  }
  function locomotive() {
    const g = new THREE.Group(), L = lot(), rouge = MAT.locoRouge || (MAT.locoRouge = std({ color: 0xA8131A, roughness: 0.32, metalness: 0.35, envMapIntensity: 1.2 }));
    L.add(new THREE.BoxGeometry(1.5, 0.3, 4.1), "noir", 0, 0.72, 0);
    L.add(new THREE.CylinderGeometry(0.7, 0.7, 2.5, 24), rouge, 0, 1.55, 0.55, 0, Math.PI / 2); L.add(new THREE.CylinderGeometry(0.73, 0.73, 0.4, 24), "noir", 0, 1.55, 1.95, 0, Math.PI / 2); L.add(new THREE.CylinderGeometry(0.56, 0.6, 0.08, 24), "argent", 0, 1.55, 2.17, 0, Math.PI / 2);
    for (const z of [-0.3, 0.55, 1.4]) L.add(new THREE.TorusGeometry(0.71, 0.025, 6, 28), "or", 0, 1.55, z);
    L.add(new THREE.BoxGeometry(1.72, 1.5, 1.25), rouge, 0, 1.75, -1.35);
    { const t = new THREE.CylinderGeometry(1.05, 1.05, 1.5, 16, 1, false, -0.95, 1.9); t.scale(1, 1, 0.45); t.rotateX(-Math.PI / 2); L.add(t, "noir", 0, 2.225, -1.35); }
    for (const s of [-1, 1]) { L.add(new THREE.PlaneGeometry(0.55, 0.5), "fenetreCarree", s * 0.87, 2.05, -1.3, s * Math.PI / 2); L.add(new THREE.PlaneGeometry(0.4, 0.4), "fenetreCarree", s * 0.45, 2.12, -0.715); }
    L.add(new THREE.CylinderGeometry(0.21, 0.15, 0.75, 14), "noir", 0, 2.55, 1.6); L.add(new THREE.CylinderGeometry(0.25, 0.21, 0.12, 14), "cuivre", 0, 2.95, 1.6);
    { const d = new THREE.SphereGeometry(0.3, 16, 12); d.scale(1, 0.95, 1); L.add(d, "or", 0, 2.2, 0.55); } L.add(new THREE.CylinderGeometry(0.1, 0.13, 0.4, 10), "or", 0, 2.35, -0.25);
    L.add(new THREE.SphereGeometry(0.15, 12, 10), "lampe", 0, 2.45, 2.02);
    L.add(new THREE.BoxGeometry(1.75, 0.3, 0.16), rouge, 0, 0.8, 2.13); for (const s of [-1, 1]) L.add(new THREE.CylinderGeometry(0.1, 0.1, 0.22, 10), "argent", s * 0.55, 0.8, 2.3, 0, Math.PI / 2);
    for (let k = -3; k <= 3; k++) L.add(new THREE.BoxGeometry(0.06, 0.5, 0.75), "noir", k * 0.22, 0.42, 2.42, 0, 0.75);
    for (const s of [-1, 1]) { for (const z of [1.65, -1.5]) roueDans(L, 0.32, s * 0.82, 0.32, z, "noir"); L.add(new THREE.BoxGeometry(0.07, 0.1, 1.25), "argent", s * 0.93, 0.55, 0.28); L.add(new THREE.BoxGeometry(0.12, 0.22, 0.6), "noir", s * 0.9, 0.78, 1.55); }
    L.poser(g);
    g.userData.cheminee = new THREE.Object3D(); g.userData.cheminee.position.set(0, 2.55, 1.6); g.add(g.userData.cheminee);
    if (Q !== "basse") { const h = halo(0xFFE0A0, 2.6, 0.55); h.position.set(0, 2.45, 2.2); g.add(h); }
    g.userData.roues = [];
    for (const s of [-1, 1]) for (const z of [-0.2, 0.75]) { const r = roue(0.55); r.position.set(s * 0.82, 0.55, z); r.traverse((o) => { if (o.isMesh) o.castShadow = true; }); g.add(r); g.userData.roues.push(r); }
    return g;
  }
  function voiture() {
    const g = new THREE.Group(), L = lot(), rouge = MAT.locoRouge, gris = MAT.wagonToit || (MAT.wagonToit = std({ color: 0x3A3C44, roughness: 0.6, metalness: 0.3 }));
    L.add(new THREE.BoxGeometry(1.68, 1.5, 4.1), rouge, 0, 1.47, 0); L.add(new THREE.BoxGeometry(1.72, 0.2, 4.0), "noir", 0, 0.65, 0);
    { const t = new THREE.CylinderGeometry(1.0, 1.0, 4.2, 16, 1, false, -Math.PI / 2.6, Math.PI / 1.3); t.scale(0.92, 1, 0.5); t.rotateX(-Math.PI / 2); L.add(t, gris, 0, 2.05, 0); }
    L.add(new THREE.BoxGeometry(1.7, 0.06, 4.11), "or", 0, 1.2, 0); L.add(new THREE.BoxGeometry(1.7, 0.04, 4.11), "or", 0, 2.12, 0);
    for (const s of [-1, 1]) { for (let k = 0; k < 5; k++) L.add(new THREE.PlaneGeometry(0.56, 0.5), "fenetreCarree", s * 0.85, 1.68, -1.6 + k * 0.8, s * Math.PI / 2); for (const z of [-1.95, 1.95]) L.add(new THREE.PlaneGeometry(0.03, 1.3), "noir", s * 0.846, 1.45, z, s * Math.PI / 2); }
    L.add(new THREE.BoxGeometry(1.1, 1.3, 0.3), "noir", 0, 1.4, -2.18);
    for (const z of [-1.4, 1.4]) { L.add(new THREE.BoxGeometry(1.3, 0.22, 1.2), "noir", 0, 0.45, z); for (const s of [-1, 1]) for (const dz of [-0.38, 0.38]) roueDans(L, 0.3, s * 0.82, 0.3, z + dz, "noir"); }
    L.poser(g); return g;
  }
  /* Barque à clins : coque arrondie, bancs, lanterne à la proue ; proue vers +z */
  function barque(n) {
    const g = new THREE.Group();
    const coque = new THREE.SphereGeometry(1, 18, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), p = coque.attributes.position; for (let k = 0; k < p.count; k++) { const z = p.getZ(k); p.setXYZ(k, p.getX(k) * 0.56 * (1 - Math.max(0, z) * 0.45), p.getY(k) * 0.42, z * 1.25); } coque.computeVertexNormals();
    const mc = new THREE.Mesh(uvMonde(coque, 0.8), std({ ...texture("bois"), color: 0xB89878, roughness: 0.8, side: THREE.DoubleSide })); mc.position.y = 0.3; g.add(mc);
    for (const z of [-0.55, 0.25]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.05, 0.24), mat("bois")); b.position.set(0, 0.2, z); g.add(b); }
    const mt = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 1.0, 6), mat("noir")); mt.position.set(0, 0.75, 1.05); g.add(mt);
    const lan = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), mat("lampe")); lan.position.set(0, 1.28, 1.05); g.add(lan);
    if (Q !== "basse") { const h = halo(0xFFC870, 1.5, 0.5); h.position.copy(lan.position); g.add(h); }
    const passagers = new THREE.Group(); [["gry", 0.2, 0.3], ["pou", -0.2, -0.2], ["ser", 0.15, -0.72]].forEach(([m, x, z], i) => { const s = sorcier(ORDRE_MAISONS[(i + n) % 4] || m, i + n * 3); s.scale.setScalar(0.62); s.position.set(x, 0.12, z); passagers.add(s); });
    passagers.visible = false; g.add(passagers); g.userData.passagers = passagers;
    return ombres(g);
  }
  function placerBarque(g, u, t) {
    const r = g.userData.route; const p = r.getPointAt(u), d = r.getTangentAt(Math.min(0.999, u + 0.001));
    g.position.set(p.x, EAU - 0.05 + Math.sin(t * 2.2 + g.userData.i) * 0.05, p.z);
    g.rotation.set(Math.sin(t * 1.7 + g.userData.i) * 0.04, Math.atan2(d.x, d.z), Math.sin(t * 1.3 + g.userData.i * 2) * 0.05);
  }
  function majFumees(dt, debit) {
    const loco = train.userData.voitures[0]; const ch = loco.userData.cheminee; const src = new THREE.Vector3(); ch.getWorldPosition(src); src.y += 0.6;
    S.reliquatFumee = (S.reliquatFumee || 0) + debit * dt;
    while (S.reliquatFumee >= 1) { S.reliquatFumee -= 1; const f = fumees.find((x) => x.age > 3.6); if (!f) break; f.age = 0; f.sp.position.copy(src); f.vx = (Math.random() - 0.5) * 0.5 + 0.25; f.vz = (Math.random() - 0.5) * 0.5; f.rot = Math.random() * 6.28; f.sp.visible = true; }
    fumees.forEach((f) => { if (f.age > 3.6) { f.sp.visible = false; return; } f.age += dt; const k = f.age / 3.6; f.sp.position.x += f.vx * dt; f.sp.position.z += f.vz * dt; f.sp.position.y += (1.7 - k * 0.8) * dt; f.sp.scale.setScalar(0.9 + k * 4.2); f.sp.material.rotation = f.rot + k; f.sp.material.opacity = 0.6 * Math.min(1, f.age * 6) * (1 - k) * (S.nuit ? 0.25 : 1); });
  }
