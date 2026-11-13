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
    const dalle = new THREE.CylinderGeometry(0.44, 0.52, 0.17, 10, 1), pd = dalle.attributes.position; for (let k = 0; k < pd.count; k++) { const a = Math.atan2(pd.getZ(k), pd.getX(k)), j = 1 + (bruit((a / Math.PI + 1) * 3, 1, 6, 8) - 0.5) * 0.3; pd.setX(k, pd.getX(k) * j); pd.setZ(k, pd.getZ(k) * j); } dalle.computeVertexNormals();
    const mdalle = new THREE.MeshStandardMaterial({ roughness: 0.7, normalMap: texture("roche").normalMap }); mdalle.userData.lin = true;
    pierres = new THREE.InstancedMesh(dalle, mdalle, liste.length);
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(1, 1, 1);
    liste.forEach((u, i) => { const p = chemin.getPointAt(u); q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rnd() * 3); m.compose(p, q, s); pierres.setMatrixAt(i, m); pierres.setColorAt(i, lin(0x9A958A)); });
    pierreFrac = liste; pierres.receiveShadow = true; pierres.castShadow = true; scene.add(pierres);
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
      if (n === 0) {      // plaque de départ : cercle d'or gravé dans la pierre
        const L = lot(); L.cyl(1.55, 1.7, 0.16, "paves", 0, 0, 0, 28, 2); L.add(new THREE.TorusGeometry(1.4, 0.09, 8, 40), "or", 0, 0.2, 0, 0, Math.PI / 2); L.add(new THREE.TorusGeometry(0.75, 0.05, 6, 32), "or", 0, 0.18, 0, 0, Math.PI / 2); L.poser(g);
        scene.add(g); marqueurs.push({ groupe: g, n }); return;
      }
      const ch = chapitreDe(n); const maison = HEROS[ch.heros].maison; const couleur = lin(MAISONS[maison].c), cp = !!l.cp;
      const L = lot(); L.cyl(cp ? 1.75 : 1.3, cp ? 1.95 : 1.45, 0.3, "pierreMousse", 0, 0, 0, 20, 2); L.cyl(cp ? 1.3 : 0.95, cp ? 1.5 : 1.1, cp ? 0.55 : 0.4, "pierreMousse", 0, 0.3, 0, 16, 2); L.cyl(cp ? 0.3 : 0.2, cp ? 0.5 : 0.36, cp ? 0.75 : 0.55, "pierreMousse", 0, cp ? 0.85 : 0.7, 0, 10, 2);
      const base = L.poser(g); const socle = new THREE.Mesh(new THREE.CylinderGeometry(cp ? 1.8 : 1.35, cp ? 1.95 : 1.45, cp ? 1.6 : 1.25, 10), new THREE.MeshBasicMaterial({ visible: false })); socle.position.y = cp ? 0.8 : 0.62; g.add(socle);
      const orbeMat = new THREE.MeshStandardMaterial({ color: couleur, emissive: couleur, emissiveIntensity: 0.25, roughness: 0.12, metalness: 0.15, flatShading: true, envMapIntensity: 1.6 }); orbeMat.userData.lin = true;
      const orbe = new THREE.Mesh(new THREE.OctahedronGeometry(cp ? 0.72 : 0.52, 0), orbeMat); orbe.scale.y = 1.35; orbe.position.y = cp ? 2.5 : 1.95; g.add(orbe);
      const lueur = halo(couleur, cp ? 4.2 : 3.2, 0); lueur.material.userData.lin = true; lueur.position.y = orbe.position.y; g.add(lueur);
      const anneau = new THREE.Mesh(new THREE.TorusGeometry(cp ? 2.1 : 1.6, 0.07, 6, 40), new THREE.MeshBasicMaterial({ color: 0xFFD98A, transparent: true, opacity: 0.0, fog: false })); anneau.rotation.x = Math.PI / 2; anneau.position.y = 0.1; g.add(anneau);
      const etiquette = texteSprite((cx, t) => {
        const etat = g.userData.etat || "verrou";
        cx.beginPath(); cx.arc(t / 2, t / 2, t * 0.42, 0, Math.PI * 2);
        cx.fillStyle = etat === "fait" ? "#E8C978" : etat === "actuel" ? "#FFF6DC" : "rgba(20,22,40,.88)"; cx.fill();
        cx.lineWidth = t * 0.05; cx.strokeStyle = MAISONS[maison].clair; cx.stroke();
        cx.fillStyle = etat === "verrou" ? "#E9E4D4" : "#1B1D33"; cx.font = `700 ${t * 0.42}px Lexend, sans-serif`; cx.textAlign = "center"; cx.textBaseline = "middle";
        cx.fillText(etat === "fait" ? "✓" : String(n), t / 2, t / 2 + t * 0.03);
      });
      etiquette.material.toneMapped = false; etiquette.material.fog = false; etiquette.material.userData.lin = true;
      etiquette.scale.set(cp ? 2.4 : 2, cp ? 2.4 : 2, 1); etiquette.position.y = cp ? 4.5 : 3.6; etiquette.renderOrder = 4; g.add(etiquette);
      if (cp) {
        const M = lot(); M.cyl(0.06, 0.08, 5, "or", 1.75, 0.3, 0, 8); M.add(new THREE.SphereGeometry(0.13, 10, 8), "or", 1.75, 5.4, 0); M.add(new THREE.CylinderGeometry(0.035, 0.035, 1.5, 6), "or", 2.45, 4.95, 0, 0, 0, Math.PI / 2); M.poser(g);
        const bn = toile(128, 192, (cx) => { cx.fillStyle = MAISONS[maison].c; cx.fillRect(0, 0, 128, 192); cx.fillStyle = MAISONS[maison].c2; cx.fillRect(0, 150, 128, 14); cx.strokeStyle = "#E8C978"; cx.lineWidth = 8; cx.strokeRect(4, 4, 120, 184); });
        const img = new Image(); img.onload = () => { bn.image.getContext("2d").drawImage(img, 22, 28, 84, 84); bn.needsUpdate = true; }; img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(ICONES[ch.relique].replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" width="84" height="84" '));
        const ban = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.95, 4, 6), new THREE.MeshStandardMaterial({ map: bn, side: THREE.DoubleSide, roughness: 0.85 })); const pb = ban.geometry.attributes.position; for (let k = 0; k < pb.count; k++) pb.setZ(k, Math.sin(pb.getY(k) * 2.2 + pb.getX(k) * 2) * 0.07); ban.geometry.computeVertexNormals();
        ban.position.set(2.45, 3.95, 0); ban.castShadow = true; g.add(ban); g.userData.banniere = ban;
        const rel = relique3D(ch.relique); rel.position.y = 5.6; rel.visible = false; g.add(rel); reliques3D[ch.relique] = rel;
      }
      g.userData = { ...g.userData, n, orbe, orbeMat, anneau, etiquette, lueur, hOrbe: orbe.position.y };
      [socle, orbe].forEach((o) => { o.userData.n = n; cliquables.push(o); }); orbe.castShadow = true;
      scene.add(g); marqueurs.push({ groupe: g, n, redessiner: etiquette.userData.redessiner });
    });
    faisceau = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.1, 16, 20, 1, true), new THREE.MeshBasicMaterial({ color: 0xFFE3A0, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending, fog: false }));
    scene.add(faisceau);
  }

  /* Les quatre reliques des Fondateurs, en or et en argent polis */
  function relique3D(id) {
    const g = new THREE.Group(), add = (geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, typeof m === "string" ? mat(m) : m); o.position.set(x, y, z); g.add(o); return o; };
    const gemme = (c, e) => std({ color: c, emissive: e, emissiveIntensity: 0.6, metalness: 0.2, roughness: 0.08, envMapIntensity: 2 });
    if (id === "coupe") {
      const prof = [[0, 0], [0.5, 0], [0.52, 0.05], [0.46, 0.1], [0.16, 0.2], [0.11, 0.38], [0.14, 0.55], [0.3, 0.7], [0.56, 0.95], [0.68, 1.3], [0.7, 1.46], [0.64, 1.46], [0.6, 1.3], [0.5, 1.02], [0, 0.86]].map(([x, y]) => new THREE.Vector2(x, y));
      add(new THREE.LatheGeometry(prof, 40), "or", 0, -0.7, 0); add(new THREE.TorusGeometry(0.69, 0.035, 8, 40), "or", 0, 0.74, 0).rotation.x = Math.PI / 2;
      for (const s of [-1, 1]) { const a = add(new THREE.TorusGeometry(0.3, 0.05, 8, 20, Math.PI * 1.1), "or", s * 0.66, 0.38, 0); a.rotation.z = s > 0 ? -Math.PI / 2 - 0.15 : Math.PI / 2 - 0.95; }
    } else if (id === "epee") {
      const lame = add(new THREE.CylinderGeometry(0.02, 0.075, 2.3, 4), "argent", 0, 0.85, 0); lame.scale.z = 0.28; lame.rotation.y = Math.PI / 4;
      add(new THREE.BoxGeometry(0.85, 0.11, 0.13), "or", 0, -0.33, 0); for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.08, 10, 8), "or", s * 0.44, -0.33, 0);
      add(new THREE.CylinderGeometry(0.055, 0.065, 0.55, 12), std({ ...texture("ecorce"), color: 0x8A5A3A, roughness: 0.7 }), 0, -0.68, 0); add(new THREE.SphereGeometry(0.1, 12, 10), "or", 0, -1.02, 0);
      add(new THREE.OctahedronGeometry(0.11, 0), gemme(0xC0262C, 0x8A0A12), 0, -0.33, 0.08);
    } else if (id === "medaillon") {
      add(new THREE.CylinderGeometry(0.6, 0.6, 0.1, 40), "or").rotation.x = Math.PI / 2; add(new THREE.TorusGeometry(0.6, 0.05, 8, 40), "or");
      add(new THREE.CylinderGeometry(0.44, 0.44, 0.13, 40), gemme(0x1F9A5A, 0x0C6A3A)).rotation.x = Math.PI / 2;
      const sC = new THREE.CatmullRomCurve3([[0.16, 0.22], [0, 0.3], [-0.16, 0.2], [-0.12, 0.05], [0.12, -0.05], [0.16, -0.2], [0, -0.3], [-0.16, -0.22]].map(([x, y]) => new THREE.Vector3(x, y, 0.08))); add(new THREE.TubeGeometry(sC, 30, 0.035, 6), "or");
      add(new THREE.TorusGeometry(0.16, 0.03, 6, 20), "or", 0, 0.76, 0); add(new THREE.TorusGeometry(0.5, 0.022, 6, 36, Math.PI), "or", 0, 0.9, 0);
    } else {
      add(new THREE.TorusGeometry(0.75, 0.055, 10, 48, Math.PI), "argent"); add(new THREE.TorusGeometry(0.75, 0.03, 8, 48, Math.PI), "argent", 0, 0.12, 0);
      for (let k = 0; k < 7; k++) { const a = ((k + 0.5) / 7) * Math.PI, h = k === 3 ? 0.62 : k % 2 ? 0.26 : 0.4; const pic = add(new THREE.ConeGeometry(0.06, h, 8), "argent", Math.cos(a) * 0.78, Math.sin(a) * 0.78 + h * 0.32, 0); pic.rotation.z = a - Math.PI / 2; }
      add(new THREE.OctahedronGeometry(0.17, 0), gemme(0x3D6FD8, 0x1A3F9E), 0, 0.82, 0.06).scale.y = 1.3; for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.06, 10, 8), gemme(0x8FB2FF, 0x2A4C9C), s * 0.42, 0.66, 0.05);
    }
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    const h = halo(0xFFE3A0, 4.5, 0.55); g.add(h);
    return g;
  }

  /* Petit sorcier : robe, écharpe et chapeau aux couleurs de sa maison. Les quatre héros ont chacun leur allure. */
  const ALLURES = { gry: { cheveux: 0xB5502A, peau: 0xF0CDAA, coupe: "bataille" }, ser: { cheveux: 0x1E1A22, peau: 0xE8C39E, coupe: "long", lunettes: true }, pou: { cheveux: 0xE2C36A, peau: 0xF3D2B2, coupe: "tresses", fleur: true }, sep: { cheveux: 0x5A3E28, peau: 0xD9AE86, coupe: "peigne" } };
  const VARIANTES = [[0x3A2A1E, 0xF0CDAA, "peigne"], [0x1E1A22, 0xB98A62, "long"], [0xD9B25A, 0xF3D2B2, "bataille"], [0x7A4A2A, 0x8E6444, "peigne"], [0xA85A2A, 0xE8C39E, "long"], [0x2A2A30, 0xD9AE86, "bataille"]];
  function sorcier(maison, variante = -1) {
    const g = new THREE.Group(), M = MAISONS[maison], L = lot();
    const A = variante < 0 ? ALLURES[maison] : { cheveux: VARIANTES[variante % 6][0], peau: VARIANTES[variante % 6][1], coupe: VARIANTES[variante % 6][2] };
    const tissu = MAT["tissu-" + maison] || (MAT["tissu-" + maison] = std({ color: M.c, roughness: 0.85 })), cle = (p, c) => MAT[p + c] || (MAT[p + c] = std({ color: c, roughness: p === "ch" ? 0.75 : 0.65 })), peau = cle("pe", A.peau), chev = cle("ch", A.cheveux);
    const raye = MAT["raye-" + maison] || (MAT["raye-" + maison] = std({ map: toile(64, 16, (c) => { for (let k = 0; k < 8; k++) { c.fillStyle = k % 2 ? M.c2 : M.c; c.fillRect(k * 8, 0, 8, 16); } }, { repete: true }), roughness: 0.9 }));
    const robe = [[0, 1.0], [0.11, 0.99], [0.19, 0.93], [0.2, 0.78], [0.19, 0.62], [0.25, 0.3], [0.33, 0.03], [0.34, 0]].map(([x, y]) => new THREE.Vector2(x, y));
    L.add(new THREE.LatheGeometry(robe, 18), "tissuNoir"); L.add(new THREE.TorusGeometry(0.335, 0.022, 6, 22), tissu, 0, 0.03, 0, 0, Math.PI / 2);
    for (const s of [-1, 1]) { L.add(new THREE.CylinderGeometry(0.05, 0.075, 0.46, 8), "tissuNoir", s * 0.24, 0.7, 0.03, 0, 0.12, s * 0.42); L.add(new THREE.SphereGeometry(0.05, 8, 6), peau, s * 0.33, 0.5, 0.06); }
    const ge = new THREE.TorusGeometry(0.165, 0.058, 8, 18); ge.attributes.uv.array.forEach((v, i, a) => { if (i % 2 === 0) a[i] = v * 3; }); L.add(ge, raye, 0, 0.955, 0, 0, Math.PI / 2); L.add(new THREE.BoxGeometry(0.1, 0.32, 0.035), raye, 0.1, 0.8, 0.17, 0, 0.12);
    L.add(new THREE.SphereGeometry(0.185, 18, 14), peau, 0, 1.12, 0); L.add(new THREE.SphereGeometry(0.03, 8, 6), peau, 0, 1.1, 0.185);
    for (const s of [-1, 1]) { L.add(new THREE.SphereGeometry(0.026, 8, 6), "noir", s * 0.068, 1.145, 0.165); if (A.lunettes) L.add(new THREE.TorusGeometry(0.045, 0.008, 5, 14), "or", s * 0.068, 1.145, 0.178); }
    L.add(new THREE.SphereGeometry(0.196, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.52), chev, 0, 1.135, -0.012, 0, -0.32);
    if (A.coupe === "long") { const c = new THREE.SphereGeometry(0.2, 14, 10); c.scale(1, 1.45, 0.62); L.add(c, chev, 0, 0.98, -0.1); }
    if (A.coupe === "tresses") for (const s of [-1, 1]) { for (let k = 0; k < 4; k++) L.add(new THREE.SphereGeometry(0.05 - k * 0.006, 8, 6), chev, s * 0.17, 1.02 - k * 0.075, 0.03); }
    if (A.coupe === "bataille") for (let k = 0; k < 7; k++) { const a = k * 0.9; L.add(new THREE.ConeGeometry(0.045, 0.13, 5), chev, Math.cos(a) * 0.14, 1.21, Math.sin(a) * 0.14 - 0.02, 0, Math.sin(a) * 0.9, -Math.cos(a) * 0.9); }
    const ch = new THREE.ConeGeometry(0.19, 0.6, 14, 6), pc = ch.attributes.position; for (let k = 0; k < pc.count; k++) { const f = (pc.getY(k) + 0.3) / 0.6; pc.setX(k, pc.getX(k) + f * f * 0.13); pc.setZ(k, pc.getZ(k) - f * f * 0.05); } ch.computeVertexNormals();
    L.add(ch, tissu, 0, 1.55, 0, 0, 0, 0.06); L.add(new THREE.CylinderGeometry(0.33, 0.34, 0.03, 20), tissu, 0, 1.265, 0, 0, 0, 0.06); L.add(new THREE.TorusGeometry(0.19, 0.022, 6, 18), "or", 0, 1.3, 0, 0, Math.PI / 2, 0);
    if (A.fleur) { L.add(new THREE.SphereGeometry(0.04, 8, 6), "or", 0.2, 1.32, 0.12); for (let k = 0; k < 5; k++) L.add(new THREE.SphereGeometry(0.035, 6, 5), cle("fl", 0xF4A6C0), 0.2 + Math.cos(k * 1.257) * 0.05, 1.32 + Math.sin(k * 1.257) * 0.05, 0.13); }
    L.add(new THREE.CylinderGeometry(0.012, 0.02, 0.5, 6), "boisSombre", 0.36, 0.68, 0.2, 0, 0.9, -0.35);
    L.poser(g, { recoit: false });
    if (variante < 0) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), mat("lampe")); b.position.set(0.415, 0.83, 0.39); g.add(b); if (Q !== "basse") { const h = halo(0xFFF0B0, 0.55, 0.6); h.position.copy(b.position); g.add(h); } }
    return g;
  }
  /* Hagrid, le garde-chasse : deux fois plus grand qu'un élève, manteau de peau de taupe, barbe hirsute, lanterne */
  function construireHagrid() {
    const g = new THREE.Group(), L = lot(), manteau = std({ color: 0x4A3626, roughness: 0.95 }), poil = std({ color: 0x241710, roughness: 1 });
    const prof = [[0, 2.5], [0.3, 2.48], [0.62, 2.3], [0.7, 1.9], [0.78, 1.3], [0.8, 0.7], [0.86, 0.12], [0.84, 0.05], [0, 0.05]].map(([x, y]) => new THREE.Vector2(x, y));
    L.add(new THREE.LatheGeometry(prof, 20), manteau); for (const s of [-1, 1]) { L.add(new THREE.CylinderGeometry(0.19, 0.24, 1.25, 10), manteau, s * 0.82, 1.75, 0.05, 0, 0.1, s * 0.3); L.add(new THREE.SphereGeometry(0.17, 10, 8), "peau", s * 1.02, 1.12, 0.12); L.add(new THREE.BoxGeometry(0.34, 0.2, 0.55), "noir", s * 0.32, 0.1, 0.12); }
    L.add(new THREE.SphereGeometry(0.34, 16, 12), "peau", 0, 2.78, 0.02); L.add(new THREE.SphereGeometry(0.06, 8, 6), "peau", 0, 2.78, 0.36);
    for (const s of [-1, 1]) L.add(new THREE.SphereGeometry(0.035, 8, 6), "noir", s * 0.12, 2.86, 0.31);
    const touffe2 = (r, x, y, z, sy = 1) => { const t = new THREE.IcosahedronGeometry(r, 2), p = t.attributes.position; for (let k = 0; k < p.count; k++) { const j = 0.78 + fbm(p.getX(k) * 5 + 3, p.getY(k) * 5 + p.getZ(k) * 4 + 3, 3, 64) * 0.6; p.setXYZ(k, p.getX(k) * j, p.getY(k) * j * sy, p.getZ(k) * j); } L.add(t, poil, x, y, z); };
    touffe2(0.5, 0, 2.86, -0.16, 0.95); touffe2(0.42, 0, 2.42, 0.2, 1.15); touffe2(0.3, -0.3, 2.62, 0.08); touffe2(0.3, 0.3, 2.62, 0.08);
    L.add(new THREE.CylinderGeometry(0.02, 0.02, 0.5, 6), "noir", 1.05, 0.9, 0.2); L.add(new THREE.BoxGeometry(0.26, 0.34, 0.26), "lampe", 1.05, 0.52, 0.2); L.add(new THREE.ConeGeometry(0.22, 0.14, 4), "noir", 1.05, 0.76, 0.2, Math.PI / 4);
    L.poser(g);
    const lant = new THREE.Object3D(); lant.position.set(1.05, 0.52, 0.2); g.add(lant); g.userData.lanterne = lant;
    if (Q !== "basse") { const h = halo(0xFFC870, 3.2, 0.55); h.position.copy(lant.position); g.add(h); const lum = new THREE.PointLight(lin(0xFFC870), 1.4, 9); lum.position.copy(lant.position); g.add(lum); }
    return g;
  }
  function construireEquipe() {
    equipe = new THREE.Group();
    [["gry", 0.55, 0], ["ser", 0, 0.55], ["pou", -0.55, 0], ["sep", 0, -0.55]].forEach(([m, x, z], i) => { const s = sorcier(m); s.position.set(x, 0, z); s.rotation.y = 0.5; s.userData.phase = i; equipe.add(s); });
    // Moka, la chouette qui porte le courrier
    hibou = new THREE.Group(); const brun = std({ color: 0x7A5A3E, roughness: 0.9 }), creme = std({ color: 0xE8D9BC, roughness: 0.9 }), LH = lot();
    const corps = new THREE.SphereGeometry(0.2, 16, 12); corps.scale(1, 1.25, 0.95); LH.add(corps, brun); const ventre = new THREE.SphereGeometry(0.15, 12, 10); ventre.scale(1, 1.3, 0.6); LH.add(ventre, creme, 0, -0.03, 0.1);
    LH.add(new THREE.SphereGeometry(0.17, 16, 12), brun, 0, 0.24, 0.02); for (const s of [-1, 1]) { const d = new THREE.SphereGeometry(0.075, 12, 8); d.scale(1, 1, 0.35); LH.add(d, creme, s * 0.07, 0.26, 0.15); LH.add(new THREE.SphereGeometry(0.035, 10, 8), std({ color: 0xFFC83A, emissive: 0x8A5A00, roughness: 0.3 }), s * 0.07, 0.265, 0.175); LH.add(new THREE.SphereGeometry(0.016, 8, 6), "noir", s * 0.07, 0.265, 0.205); LH.add(new THREE.ConeGeometry(0.035, 0.1, 5), brun, s * 0.1, 0.4, 0, 0, 0, -s * 0.3); }
    LH.add(new THREE.ConeGeometry(0.025, 0.07, 6), "or", 0, 0.22, 0.185, 0, Math.PI / 2); LH.poser(hibou, { recoit: false });
    for (const s of [-1, 1]) { const ga = new THREE.SphereGeometry(0.2, 12, 8); ga.scale(1.15, 0.12, 0.6); ga.translate(s * 0.22, 0, 0); const aile = new THREE.Mesh(ga, brun); aile.position.set(s * 0.14, 0.08, -0.02); aile.userData.s = s; aile.castShadow = true; hibou.add(aile); }
    equipe.add(hibou);
    const cercle = new THREE.Mesh(new THREE.RingGeometry(1.05, 1.3, 40), new THREE.MeshBasicMaterial({ color: 0xFFE3A0, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false, fog: false })); cercle.rotation.x = -Math.PI / 2; cercle.position.y = 0.06; equipe.add(cercle);
    equipe.scale.setScalar(1.5); scene.add(equipe); placerEquipe(0);
  }
  function placerEquipe(u) { const p = chemin.getPointAt(Math.min(1, Math.max(0, u))); equipe.position.set(p.x, p.y - 0.25, p.z); S.u = u; }

  function decorsAnimes() {
    const n = 160, p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const x = -52 + rnd() * 40, z = -2 + rnd() * 48; p[i * 3] = x; p[i * 3 + 1] = hauteur(x, z) + 0.8 + rnd() * 3; p[i * 3 + 2] = z; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.userData.base = p.slice();
    lucioles = new THREE.Points(g, new THREE.PointsMaterial({ map: dessin("halo"), color: 0xFFF2A8, size: 0.6, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); scene.add(lucioles);
    const courbe = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -1, 0), new THREE.Vector3(0.6, 1.4, 0), new THREE.Vector3(0.2, 3, 0.3), new THREE.Vector3(1.2, 4, 0.2)]);
    tentacule = new THREE.Mesh(new THREE.TubeGeometry(courbe, 32, 0.25, 12, false), std({ color: 0x8A4E7E, roughness: 0.35, metalness: 0.1 })); tentacule.position.set(29, -4, 12); tentacule.castShadow = true; scene.add(tentacule);
    // fumée de la cheminée de Hagrid
    S.fumeeCabane = []; if (S.cheminee && Q !== "basse") for (let k = 0; k < 8; k++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dessin("nuage"), color: new THREE.Color(1.2, 1.18, 1.15), transparent: true, opacity: 0, depthWrite: false })); sp.material.userData.lin = true; scene.add(sp); S.fumeeCabane.push(sp); }
  }
