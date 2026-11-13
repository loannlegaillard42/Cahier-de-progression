  /* ---------- Les lieux du parc : serres, cabane, stade, jardin, enclos, clairière, saule ---------- */
  const std = (o) => new THREE.MeshStandardMaterial(o);
  function plante(r, c1, c2) { const g = new THREE.IcosahedronGeometry(r, 1), p = g.attributes.position; for (let k = 0; k < p.count; k++) { const j = 0.8 + fbm(p.getX(k) * 3 + 2, p.getY(k) * 3 + p.getZ(k) * 2 + 2, 2, 64) * 0.5; p.setXYZ(k, p.getX(k) * j, p.getY(k) * j, p.getZ(k) * j); } return teinter(g, (c, x, y) => c.copy(c1).lerp(c2, Math.min(1, Math.max(0, y / r * 0.5 + 0.5)))); }

  /* Serre victorienne : muret de pierre, vitrage, armature de fer, plantes à l'intérieur */
  function serre(x, z, rot) {
    const L = lot(), V = lot(), w = 6, d = 3.6, h = 2.3, ht = 1.5;
    L.boite(w + 0.3, 0.55, d + 0.3, "pierreSombre", 0, 0, 0, 0, 3);
    V.add(new THREE.BoxGeometry(w, h, d), "verre", 0, 0.55 + h / 2, 0); V.add(toitPans(w, d, ht, 0.05), "verre", 0, 0.55 + h, 0);
    for (const s of [-1, 1]) V.add(pignon(d, ht), "verre", (s * w) / 2, 0.55 + h, 0);
    const fer = (lw, lh, ld, px, py, pz, ry = 0, rx = 0) => L.add(new THREE.BoxGeometry(lw, lh, ld), "fer", px, py, pz, ry, rx);
    for (let u = -w / 2; u <= w / 2 + 0.01; u += 1) { for (const s of [-1, 1]) { fer(0.07, h, 0.07, u, 0.55 + h / 2, (s * d) / 2); fer(0.07, 0.07, Math.hypot(d / 2, ht), u, 0.55 + h + ht / 2, (s * d) / 4, 0, s * Math.atan2(ht, d / 2)); } }
    for (const s of [-1, 1]) { fer(w, 0.08, 0.08, 0, 0.55 + h, (s * d) / 2); fer(w, 0.08, 0.08, 0, 0.55 + h * 0.5, (s * d) / 2); for (let u = -d / 2; u <= d / 2 + 0.01; u += 0.9) fer(0.07, h, 0.07, (s * w) / 2, 0.55 + h / 2, u); }
    fer(w + 0.2, 0.12, 0.12, 0, 0.55 + h + ht, 0); L.add(uvMonde(new THREE.BoxGeometry(0.9, 1.7, 0.08)), "boisSombre", w / 2 + 0.03, 1.4, 0, Math.PI / 2);
    const verts = [[0x2E5A26, 0x6CA84A], [0x35643A, 0x8FBF58], [0x5A2E55, 0xC062A0], [0x2F5E48, 0x58A07A], [0x6A5A22, 0xE0C24A]];
    for (let k = 0; k < 9; k++) { const [a, b] = verts[k % 5]; L.add(plante(0.3 + rnd() * 0.28, lin(a), lin(b)), "vegetal", -2.4 + (k % 5) * 1.2 + rnd() * 0.3, 0.95 + rnd() * 0.3, k < 5 ? -0.9 : 0.9); }
    for (const s of [-1, 1]) L.boite(w - 0.8, 0.5, 0.75, "boisSombre", 0, 0.5, s * 0.9, 0, 2);
    const g = new THREE.Group(); L.poser(g); V.poser(g, { ombre: false, recoit: false }).children.forEach((m) => (m.renderOrder = 2));
    g.position.set(x, hauteur(x, z) - 0.25, z); g.rotation.y = rot; scene.add(g);
  }
  function serres() { serre(-17, -15.5, 0.3); serre(-25, -9.5, 0.6); serre(-21, -18.5, 0.2); }

  /* La cabane de Hagrid : pierre moussue, toit de chaume, citrouilles géantes */
  function citrouille(r) { const g = new THREE.SphereGeometry(r, 18, 12), p = g.attributes.position; for (let k = 0; k < p.count; k++) { const a = Math.atan2(p.getZ(k), p.getX(k)), j = 1 + Math.abs(Math.sin(a * 5)) * 0.12; p.setXYZ(k, p.getX(k) * j, p.getY(k) * 0.72, p.getZ(k) * j); } g.computeVertexNormals(); return g; }
  function cabane() {
    const x = -21, z = 12.5, y = hauteur(x, z) - 0.25, L = lot(), orange = std({ color: 0xDE7A1E, roughness: 0.55 }), tige = std({ color: 0x4E6A2A, roughness: 0.8 });
    L.cyl(2.2, 2.4, 2.8, "pierreMousse", x, y, z, 22, 3); L.add(uvCyl(new THREE.ConeGeometry(3.15, 2.9, 24, 3, true), 2, 3.6, 2.2), "chaume", x, y + 2.6 + 1.45, z);
    L.boite(0.75, 2.6, 0.75, "pierre", x + 1.1, y + 3, z + 0.5, 0, 3); L.boite(0.95, 0.2, 0.95, "pierreSombre", x + 1.1, y + 5.6, z + 0.5, 0, 3);
    L.add(uvMonde(new THREE.BoxGeometry(1.05, 1.9, 0.14)), "boisSombre", x, y + 0.95, z + 2.36); L.add(new THREE.CircleGeometry(0.525, 16, 0, Math.PI), "boisSombre", x, y + 1.9, z + 2.43);
    for (const s of [-1, 1]) L.add(new THREE.PlaneGeometry(0.6, 0.6), "fenetreCarree", x + s * 1.5, y + 1.6, z + 1.78, s * 0.72);
    for (let k = 0; k < 9; k++) L.add(uvCyl(new THREE.CylinderGeometry(0.16, 0.16, 1.5, 8), 0.16, 1.5, 1.5), "ecorce", x - 2.9, y + 0.2 + Math.floor(k / 3) * 0.3, z - 0.6 + (k % 3) * 0.34 + (Math.floor(k / 3) % 2) * 0.17, 0, 0, Math.PI / 2);
    for (let k = 0; k < 7; k++) { const px = x + 3.4 + rnd() * 3.2, pz = z - 3 + rnd() * 4.5, r = 0.4 + rnd() * 0.55, py = hauteur(px, pz); L.add(citrouille(r), orange, px, py + r * 0.6, pz, rnd() * 6); L.add(new THREE.CylinderGeometry(0.04, 0.07, 0.25, 6), tige, px, py + r * 1.3, pz, 0, 0.3); }
    L.poser(scene); S.cheminee = new THREE.Vector3(x + 1.1, y + 5.9, z + 0.5);
    if (Q !== "basse") { const h = halo(0xFFC070, 2.2, 0.4); h.position.set(x, y + 1.6, z + 2.2); scene.add(h); }
  }

  /* Le stade de Quidditch : pelouse rayée, anneaux d'or, tours drapées aux couleurs des maisons, gradins */
  function quidditch() {
    const cx = 42, cz = -14, y = 0.95, L = lot();
    const pel = dessin("pelouse"); pel.wrapS = pel.wrapT = THREE.RepeatWrapping; pel.repeat.set(2.5, 1);
    const sol = new THREE.Mesh(new THREE.CircleGeometry(1, 56), std({ map: pel, roughness: 0.95 })); sol.rotation.x = -Math.PI / 2; sol.scale.set(11, 6, 1); sol.position.set(cx, y + 0.06, cz); sol.receiveShadow = true; scene.add(sol);
    const ligne = new THREE.Mesh(new THREE.RingGeometry(0.965, 0.98, 72), new THREE.MeshBasicMaterial({ color: 0xF4F4EC })); ligne.rotation.x = -Math.PI / 2; ligne.scale.set(10.6, 5.75, 1); ligne.position.set(cx, y + 0.08, cz); scene.add(ligne);
    for (const sx of [-1, 1]) for (const [dz, h] of [[-1.6, 5], [0, 6.2], [1.6, 5]]) {
      L.cyl(0.06, 0.09, h, "or", cx + sx * 9.6, y, cz + dz, 10); L.add(new THREE.TorusGeometry(0.6, 0.07, 10, 32), "or", cx + sx * 9.6, y + h + 0.55, cz + dz, Math.PI / 2);
    }
    ORDRE_MAISONS.forEach((m, i) => {
      const M = MAISONS[m], a = (i / 4) * Math.PI * 2 + Math.PI / 4, px = cx + Math.cos(a) * 12.6, pz = cz + Math.sin(a) * 7.5;
      const tissu = toile(128, 128, (g) => { g.fillStyle = M.c; g.fillRect(0, 0, 128, 128); g.fillStyle = M.c2; for (let u = 0; u < 4; u++) for (let v = 0; v < 4; v++) if ((u + v) % 2) { g.beginPath(); g.moveTo(u * 32 + 16, v * 32); g.lineTo(u * 32 + 32, v * 32 + 16); g.lineTo(u * 32 + 16, v * 32 + 32); g.lineTo(u * 32, v * 32 + 16); g.fill(); } }, { repete: true });
      const drap = std({ map: tissu, roughness: 0.85, side: THREE.DoubleSide }), uni = std({ color: M.c, roughness: 0.8 });
      L.cyl(0.95, 1.2, 1.4, "bois", px, y - 0.3, pz, 12, 2); L.add(uvCyl(new THREE.CylinderGeometry(1.0, 1.15, 5.6, 16, 1, true), 1.05, 5.6, 1.6), drap, px, y + 1.1 + 2.8, pz);
      L.cyl(1.3, 1.3, 0.25, "bois", px, y + 6.7, pz, 16, 2); L.add(new THREE.ConeGeometry(1.45, 2.3, 16), uni, px, y + 6.95 + 1.15, pz); L.add(new THREE.SphereGeometry(0.13, 8, 6), "or", px, y + 9.35, pz);
      L.cyl(0.03, 0.03, 1.1, "noir", px, y + 9.3, pz, 5); L.add(new THREE.PlaneGeometry(0.9, 0.5), std({ color: M.c, side: THREE.DoubleSide, roughness: 0.8 }), px + 0.45, y + 10.1, pz);
    });
    for (const s of [-1, 1]) for (let k = -5; k <= 5; k++) { const a = (s > 0 ? Math.PI / 2 : -Math.PI / 2) + k * 0.13, px = cx + Math.cos(a) * 13.2, pz = cz + Math.sin(a) * 8.1, ry = Math.atan2(-Math.cos(a) * 8.1, -Math.sin(a) * 13.2); for (let e = 0; e < 3; e++) L.add(uvMonde(new THREE.BoxGeometry(1.75, 0.5 + e * 0.5, 0.6), 2), "bois", px + Math.cos(a) * e * 0.6, y + (0.5 + e * 0.5) / 2 - 0.1, pz + Math.sin(a) * e * 0.4, ry); }
    L.poser(scene);
    // le Vif d'or
    vif = new THREE.Group();
    vif.add(new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 18), mat("or")));
    const bande = new THREE.Mesh(new THREE.TorusGeometry(0.222, 0.012, 6, 32), mat("cuivre")); bande.rotation.x = Math.PI / 2; vif.add(bande);
    const fa = new THREE.Shape(); fa.moveTo(0, 0); fa.quadraticCurveTo(0.35, 0.2, 0.85, 0.06); fa.quadraticCurveTo(0.55, -0.02, 0.6, -0.1); fa.quadraticCurveTo(0.35, -0.04, 0.38, -0.16); fa.quadraticCurveTo(0.15, -0.06, 0, 0);
    const ga = new THREE.ShapeGeometry(fa, 8), ma = std({ color: 0xF6F2E6, roughness: 0.4, metalness: 0.3, transparent: true, opacity: 0.92, side: THREE.DoubleSide });
    for (const s of [-1, 1]) { const piv = new THREE.Group(); const aile = new THREE.Mesh(ga, ma); aile.scale.x = s; aile.position.x = s * 0.18; piv.add(aile); piv.userData.s = s; vif.add(piv); }
    if (Q !== "basse") vif.add(halo(0xFFE08A, 1.1, 0.45));
    vif.traverse((o) => { if (o.isMesh) o.castShadow = true; }); scene.add(vif);
  }

  function decorsLieux() {
    const L = lot();
    // Jardin d'Helga : massifs de fleurs, arche de verdure, banc de pierre
    const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.17, 8, 6), std({ roughness: 0.6 }), 170), c = new THREE.Color(), mtx = new THREE.Matrix4(), sc = new THREE.Vector3(), qq = new THREE.Quaternion(), vv = new THREE.Vector3();
    for (let i = 0; i < 170; i++) { const a = rnd() * Math.PI * 2, r = 1.8 + rnd() * 4.4, x = -31 + Math.cos(a) * r, z = 2 + Math.sin(a) * r, k = 0.7 + rnd() * 0.8; mtx.compose(vv.set(x, hauteur(x, z) + 0.28 + rnd() * 0.25, z), qq, sc.set(k, k * 0.7, k)); fl.setMatrixAt(i, mtx); fl.setColorAt(i, c.copy(lin([0xF2C94C, 0xE86A92, 0xFFFFFF, 0xB07CE0, 0xF29B4C, 0xD9452F][i % 6]))); }
    fl.material.userData.lin = true; fl.castShadow = true; scene.add(fl);
    for (let i = 0; i < 26; i++) { const a = rnd() * 6.28, r = 2 + rnd() * 4.2, x = -31 + Math.cos(a) * r, z = 2 + Math.sin(a) * r; L.add(plante(0.5 + rnd() * 0.35, lin(0x2C4F22), lin(0x6C9440)), "vegetal", x, hauteur(x, z) + 0.12, z); }
    const ya = hauteur(-28.5, -0.5); for (let k = 0; k <= 10; k++) { const a = (k / 10) * Math.PI, px = Math.cos(a) * 1.9, py = Math.sin(a) * 2.5; L.add(plante(0.55, lin(0x2F5524), lin(0x7FA548)), "vegetal", -28.5 + px * Math.cos(0.9), ya + 0.2 + py, -0.5 - px * Math.sin(0.9)); }
    L.boite(1.8, 0.16, 0.6, "pierre", -33.5, hauteur(-33.5, 4.8) + 0.5, 4.8, 0.5, 2); for (const s of [-0.7, 0.7]) L.boite(0.2, 0.5, 0.5, "pierreSombre", -33.5 + s * Math.cos(0.5), hauteur(-33.5, 4.8), 4.8 - s * Math.sin(0.5), 0.5, 2);
    // Enclos des hippogriffes : clôture de rondins
    const N = 22; for (let k = 0; k < N; k++) {
      const a = (k / N) * Math.PI * 2, b = ((k + 1) / N) * Math.PI * 2, x = -33 + Math.cos(a) * 5.5, z = 15 + Math.sin(a) * 4.5, x2 = -33 + Math.cos(b) * 5.5, z2 = 15 + Math.sin(b) * 4.5, y1 = hauteur(x, z), y2 = hauteur(x2, z2);
      L.cyl(0.1, 0.12, 1.35, "ecorce", x, y1 - 0.15, z, 7, 1.5);
      if (k % 11 !== 3) for (const h of [0.5, 0.95]) L.add(uvCyl(new THREE.CylinderGeometry(0.06, 0.06, Math.hypot(x2 - x, z2 - z, y2 - y1) + 0.1, 6), 0.06, 1.5, 1.5), "ecorce", (x + x2) / 2, (y1 + y2) / 2 + h, (z + z2) / 2, Math.atan2(x2 - x, z2 - z), Math.PI / 2 - Math.atan2(y2 - y1, Math.hypot(x2 - x, z2 - z)));
    }
    // Clairière des centaures : cercle de pierres levées
    for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2, x = -24 + Math.cos(a) * 6, z = 35 + Math.sin(a) * 6, h = 1.5 + rnd() * 0.8, g = rocher(); g.scale(0.62, h * 1.9, 0.42); L.add(g, k % 3 ? "roche" : "pierreMousse", x, hauteur(x, z) + h * 0.85, z, -a + Math.PI / 2, (rnd() - 0.5) * 0.16, (rnd() - 0.5) * 0.12); }
    { const g = rocher(); g.scale(1.5, 0.5, 1.1); L.add(g, "roche", -24, hauteur(-24, 35) + 0.2, 35); }
    // Plateforme de la Salle sous le lac
    L.cyl(2.45, 2.65, 0.6, "pierreMousse", 23, 0.05, 2, 28, 3); L.cyl(2.2, 2.2, 0.08, "paves", 23, 0.62, 2, 28, 2);
    for (let k = 0; k < 6; k++) { const a = (k / 6) * 6.28 + 0.3; L.cyl(0.14, 0.17, 0.7, "pierre", 23 + Math.cos(a) * 2.25, 0.6, 2 + Math.sin(a) * 2.25, 8, 2); }
    // Cachot des potions : porte dans la falaise
    const yc = hauteur(11, -11.5) - 0.3; L.boite(2.6, 3, 1.4, "pierreSombre", 11, yc, -11.6); L.boite(3, 0.4, 1.6, "pierre", 11, yc + 3, -11.6, 0, 3); for (const s of [-1, 1]) L.cyl(0.22, 0.26, 3, "pierre", 11 + s * 1.15, yc, -10.85, 10, 3);
    L.poser(scene);
    const pv = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.2), std({ color: 0x0E2A1C, emissive: 0x2FE08A, emissiveIntensity: 0.55, emissiveMap: dessin("fenetre"), map: dessin("fenetre"), transparent: true, alphaTest: 0.4 })); pv.position.set(11, yc + 1.25, -10.86); scene.add(pv);
    const lueur = new THREE.PointLight(lin(0x3EE08A), 1.6, 14); lueur.position.set(23, -0.4, 2); if (Q !== "basse") scene.add(lueur);
    const hl = new THREE.Mesh(new THREE.CircleGeometry(4, 40), new THREE.MeshBasicMaterial({ map: dessin("halo"), color: 0x3EE08A, transparent: true, opacity: 0.25, depthWrite: false, blending: THREE.AdditiveBlending })); hl.rotation.x = -Math.PI / 2; hl.position.set(23, EAU + 0.03, 2); hl.renderOrder = 3; scene.add(hl); S.haloLac = hl;
    const hip = hippogriffe(); hip.position.set(-35, hauteur(-35, 16), 16); hip.rotation.y = 0.8; scene.add(hip); S.hippogriffe = hip;
    construireSaule();
  }

  /* Le Saule cogneur : tronc noueux et longues branches articulées (le jeu les fait fouetter) */
  function construireSaule() {
    saule = new THREE.Group(); const sx = -8, sz = 28.5, ecorce = mat("ecorce"), vert = mat("vegetal");
    const tronc = uvCyl(new THREE.CylinderGeometry(0.42, 1.05, 4.4, 14, 8), 0.7, 4.4, 2), p = tronc.attributes.position;
    for (let k = 0; k < p.count; k++) { const y = p.getY(k) + 2.2, a = Math.atan2(p.getZ(k), p.getX(k)), j = 1 + (bruit((a / Math.PI + 1) * 4, y * 1.2, 8, 64) - 0.5) * 0.55 + (y < 0.6 ? (0.6 - y) * 0.9 : 0); p.setXYZ(k, p.getX(k) * j + Math.sin(y * 0.9) * 0.28, p.getY(k), p.getZ(k) * j + Math.cos(y * 0.7) * 0.18 - 0.18); }
    tronc.computeVertexNormals(); const mt = new THREE.Mesh(tronc, ecorce); mt.position.y = 2.1; saule.add(mt);
    const noeud = new THREE.Mesh(rocher(), ecorce); noeud.scale.set(0.75, 0.9, 0.75); noeud.position.set(0.25, 4.3, -0.1); saule.add(noeud);
    const feuilles = plante(0.62, lin(0x35561F), lin(0x86A548));
    for (let k = 0; k < 8; k++) {
      const br = new THREE.Group(), lg = 3.6 + rnd() * 1.4;
      const b = uvCyl(new THREE.CylinderGeometry(0.05, 0.2, lg, 7, 6), 0.12, lg, 1.6), pb = b.attributes.position; for (let i = 0; i < pb.count; i++) { const y = pb.getY(i) + lg / 2; pb.setX(i, pb.getX(i) + Math.sin(y * 0.8 + k) * 0.22); pb.setZ(i, pb.getZ(i) + (y * y) / lg * 0.16); }
      b.computeVertexNormals(); const mb = new THREE.Mesh(b, ecorce); mb.position.y = lg / 2; br.add(mb);
      for (let j = 0; j < 5; j++) { const f = new THREE.Mesh(feuilles, vert), y = lg * (0.55 + j * 0.11); f.position.set(Math.sin(y * 0.8 + k) * 0.22 + (rnd() - 0.5) * 0.5, y, (y * y) / lg * 0.16 + (rnd() - 0.5) * 0.5); f.scale.setScalar(0.7 + rnd() * 0.7); br.add(f); }
      for (let j = 0; j < 3; j++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.03, 1.3, 4), ecorce); t.position.set((rnd() - 0.5) * 0.7, lg * (0.75 + j * 0.1) - 0.5, 0.5 + rnd() * 0.3); t.rotation.x = 2.6; br.add(t); }
      br.position.set(0.25, 4.2, -0.1); br.rotation.order = "YXZ"; br.rotation.set(0.95, (k / 8) * Math.PI * 2 + rnd() * 0.3, 0); br.userData.base = 0.85 + rnd() * 0.3; saule.add(br);
    }
    saule.position.set(sx, hauteur(sx, sz) - 0.1, sz); scene.add(ombres(saule));
  }

  /* Buck l'hippogriffe : arrière-train de cheval, tête, serres et ailes d'aigle. Regarde vers +x. */
  function hippogriffe() {
    const g = new THREE.Group(), corps = new THREE.Group(); g.add(corps);
    const gris = std({ color: 0x64646E, roughness: 0.8 }), clair = std({ color: 0xA8A49C, roughness: 0.85 }), bec = std({ color: 0xD9A441, roughness: 0.45 }), sombre = std({ color: 0x3A3A42, roughness: 0.7 }), plume = std({ color: 0x74747E, roughness: 0.85, side: THREE.DoubleSide });
    const piece = (geo, m, x, y, z, sx = 1, sy = 1, sz = 1, rz = 0, parent = corps) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.rotation.z = rz; parent.add(o); return o; };
    const boule = new THREE.SphereGeometry(1, 20, 14);
    piece(boule, gris, -0.25, 1.28, 0, 0.95, 0.5, 0.44); piece(boule, gris, -0.85, 1.32, 0, 0.5, 0.5, 0.42);            // dos et croupe
    piece(boule, clair, 0.55, 1.36, 0, 0.55, 0.56, 0.46); piece(new THREE.CylinderGeometry(0.2, 0.34, 0.95, 12), clair, 0.98, 1.85, 0, 1, 1, 1, -0.55);   // poitrail et cou
    piece(boule, clair, 1.28, 2.28, 0, 0.32, 0.3, 0.27); piece(new THREE.ConeGeometry(0.15, 0.5, 10), bec, 1.62, 2.2, 0, 1, 1, 0.8, -Math.PI / 2 - 0.35); piece(new THREE.ConeGeometry(0.07, 0.2, 8), bec, 1.82, 2.03, 0, 1, 1, 0.8, Math.PI - 0.5);
    for (const s of [-1, 1]) { piece(new THREE.SphereGeometry(0.06, 10, 8), std({ color: 0xF2A23A, emissive: 0x9A5A10, roughness: 0.3 }), 1.42, 2.36, s * 0.2); piece(new THREE.SphereGeometry(0.028, 8, 6), sombre, 1.47, 2.365, s * 0.215); piece(new THREE.ConeGeometry(0.06, 0.26, 6), clair, 1.12, 2.58, s * 0.14, 1, 1, 1, 0.5); }
    piece(new THREE.ConeGeometry(0.2, 1.3, 10), sombre, -1.52, 0.74, 0, 1, 1, 0.7, Math.PI - 0.35);                                    // queue
    for (const s of [-1, 1]) {
      piece(new THREE.CylinderGeometry(0.1, 0.07, 0.85, 8), gris, -0.95, 0.6, s * 0.26, 1, 1, 1, 0, g); piece(new THREE.CylinderGeometry(0.09, 0.1, 0.16, 8), sombre, -0.95, 0.08, s * 0.26, 1, 1, 1, 0, g);   // pattes arrière, sabots
      piece(new THREE.CylinderGeometry(0.09, 0.05, 0.9, 8), bec, 0.6, 0.55, s * 0.24, 1, 1, 1, 0, g); for (let k = -1; k <= 1; k++) piece(new THREE.ConeGeometry(0.035, 0.22, 6), sombre, 0.72, 0.06, s * 0.24 + k * 0.08, 1, 1, 1, -1.35, g);   // serres
    }
    const fa = new THREE.Shape(); [[0.5, 0], [0.42, 1], [0.12, 2.2], [-0.3, 2.65], [-0.62, 2.12], [-0.5, 1.92], [-0.92, 1.5], [-0.76, 1.3], [-1.12, 0.9], [-0.92, 0.7], [-1.02, 0.2], [-0.6, 0]].forEach(([x, y], i) => (i ? fa.lineTo(x, y) : fa.moveTo(x, y)));
    const ailes = [];
    for (const s of [-1, 1]) {
      const piv = new THREE.Group(); piv.position.set(0.2, 1.68, s * 0.34); piv.userData.s = s;
      const ga = new THREE.ShapeGeometry(fa); ga.rotateX(Math.PI / 2); if (s < 0) ga.scale(1, 1, -1); ga.computeVertexNormals();
      piv.add(new THREE.Mesh(ga, plume)); const os = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.07, 2.3, 6), clair); os.rotation.x = s * Math.PI / 2; os.position.set(0.38, 0.03, s * 1.15); piv.add(os);
      piv.rotation.x = s * 0.9; piv.scale.z = 0.35; corps.add(piv); ailes.push(piv);
    }
    g.userData.ailes = ailes; g.userData.corps = corps;
    return ombres(g);
  }
