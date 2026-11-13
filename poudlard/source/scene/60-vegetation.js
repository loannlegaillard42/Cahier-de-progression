  /* ---------- Végétation : sapins, épicéas, feuillus, buissons, rochers, herbes ---------- */
  function teinter(geo, f) { const p = geo.attributes.position, a = new Float32Array(p.count * 3), c = new THREE.Color(); for (let i = 0; i < p.count; i++) { f(c, p.getX(i), p.getY(i), p.getZ(i)); a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } geo.setAttribute("color", new THREE.BufferAttribute(a, 3)); return geo; }
  /* Conifère : étages de branches tombantes au contour irrégulier, plus clairs en bout de rameau */
  function conifere(tiers, rayon, haut, graine) {
    const G = [], r = MONDE_RND(graine), sombre = lin(0x1A3320), clair = lin(0x4C7A3C), ecorce = lin(0x4E3B2C);
    const tronc = new THREE.CylinderGeometry(0.1, 0.2, haut * 0.5, 7); tronc.translate(0, haut * 0.25, 0); G.push(teinter(tronc, (c) => c.copy(ecorce)));
    for (let i = 0; i < tiers; i++) {
      const f = i / tiers, ray = rayon * (1 - f * 0.8), h = ((haut * 0.84) / tiers) * 2.1, y = haut * 0.16 + f * haut * 0.78;
      const g = new THREE.ConeGeometry(ray, h, Q === "basse" ? 7 : 11, 2, true); g.translate(0, h / 2, 0);
      const p = g.attributes.position;
      for (let k = 0; k < p.count; k++) { const yy = p.getY(k), x = p.getX(k), z = p.getZ(k), rr = Math.hypot(x, z); if (rr < 0.01) continue; const a = (Math.atan2(z, x) / Math.PI + 1) * 6, bas = 1 - yy / h, j = 1 + (bruit(a + i * 3, yy * 2 + i, 12, 64) - 0.5) * 0.7 * bas; p.setXYZ(k, x * j, yy - (rr / ray) * ray * 0.3 * bas, z * j); }
      g.rotateY(r() * 6.28); g.translate(0, y, 0); g.computeVertexNormals();
      G.push(teinter(g, (c, x, yy, z) => { const e = Math.min(1, Math.hypot(x, z) / ray); c.copy(sombre).lerp(clair, e * e * 0.85 + f * 0.3); }));
    }
    return fusion(G);
  }
  /* Feuillu : tronc, branches et houppier fait de masses de feuillage bosselées */
  function feuillu(graine) {
    const G = [], r = MONDE_RND(graine), ecorce = lin(0x57432F), v1 = lin(0x2C4A1C), v2 = lin(0x7A9A40);
    const tronc = new THREE.CylinderGeometry(0.19, 0.36, 2.6, 8, 3); const pt = tronc.attributes.position; for (let k = 0; k < pt.count; k++) pt.setX(k, pt.getX(k) + Math.sin(pt.getY(k) * 1.4) * 0.09); tronc.translate(0, 1.3, 0); tronc.computeVertexNormals(); G.push(teinter(tronc, (c) => c.copy(ecorce)));
    for (let k = 0; k < 3; k++) { const br = new THREE.CylinderGeometry(0.06, 0.14, 1.7, 5); br.translate(0, 0.85, 0); br.rotateZ(0.6 + r() * 0.35); br.rotateY(k * 2.1 + r()); br.translate(0, 1.9, 0); G.push(teinter(br, (c) => c.copy(ecorce))); }
    const masses = [[0, 3.9, 0, 1.55], [1.05, 3.3, 0.3, 1.15], [-0.95, 3.4, -0.5, 1.2], [0.25, 3.2, -1.05, 1.05], [-0.3, 3.3, 1.05, 1.1], [0.35, 4.7, 0.1, 1.0]].slice(0, Q === "basse" ? 4 : 6);
    masses.forEach(([x, y, z, ra], i) => {
      const g = new THREE.IcosahedronGeometry(ra, Q === "haute" ? 2 : 1), p = g.attributes.position;
      for (let k = 0; k < p.count; k++) { const px = p.getX(k), py = p.getY(k), pz = p.getZ(k), j = 0.8 + fbm(px * 1.6 + i * 5 + 20, py * 1.6 + pz * 1.3 + 20, 3, 64) * 0.45; p.setXYZ(k, px * j, py * j * 0.82, pz * j); }
      g.translate(x + (r() - 0.5) * 0.3, y, z + (r() - 0.5) * 0.3);
      G.push(teinter(g, (c, px, py, pz) => c.copy(v1).lerp(v2, Math.min(1, Math.max(0, (py - 2.6) / 2.8)) * 0.75 + fbm(px * 3 + 9, pz * 3 + py, 2, 64) * 0.3)));
    });
    return fusion(G);
  }
  function rocher() { const g = new THREE.IcosahedronGeometry(1, 2), p = g.attributes.position; for (let k = 0; k < p.count; k++) { const x = p.getX(k), y = p.getY(k), z = p.getZ(k), j = 0.72 + fbm(x * 1.3 + 30, y * 1.3 + z * 1.1 + 30, 3, 64) * 0.6; p.setXYZ(k, x * j, y * j * 0.62, z * j); } return g; }
  function touffe() {                                    // touffe d'herbe : quelques brins courbés
    const P = [], C = [], v0 = lin(0x3B5E26), v1 = lin(0x8DAE55), r = MONDE_RND(12);
    for (let k = 0; k < 5; k++) { const a = (k / 5) * 6.28 + r(), h = 0.32 + r() * 0.3, l = 0.05, dx = Math.cos(a), dz = Math.sin(a), b = 0.12 + r() * 0.1;
      P.push(dx * 0.05 - dz * l, 0, dz * 0.05 + dx * l, dx * 0.05 + dz * l, 0, dz * 0.05 - dx * l, dx * (0.05 + b), h, dz * (0.05 + b)); C.push(v0.r, v0.g, v0.b, v0.r, v0.g, v0.b, v1.r, v1.g, v1.b); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(C, 3)); g.computeVertexNormals(); const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0); return g;
  }

  function arbres() {
    const positions = []; const pas = 2.5;
    const clairieres = [[-21, 11, 6.5], [-33, 15, 6.5], [-24, 35, 8], [-39, 28, 4], [-31, 2, 6.5], [-8, 27, 5.5], [-17, -14, 5], [-25, -8, 5], [-9, -13, 4]];
    const proche = (x, z, d) => echantillonsChemin.some((p) => (p.x - x) ** 2 + (p.z - z) ** 2 < d * d);
    const libre = (jx, jz) => !(dansLac(jx, jz) || Math.hypot((jx - 22) / 17, (jz - 6) / 13) < 1.15 || surPlateau(jx, jz) || Math.hypot(jx / 1.25, jz + 33) < 19 || Math.hypot((jx - 42) / 13, (jz + 14) / 8) < 1.1
      || distVoie(jx, jz) < 9 || Math.hypot(jx - 1, jz - 25) < 7 || Math.hypot((jx - 42) / 11, (jz - 17.6) / 6) < 1 || VILLAGE.some(([vx, vz]) => Math.hypot(jx - vx, jz - vz) < 3.6));
    for (let x = -60; x <= 60; x += pas) for (let z = -50; z <= 56; z += pas) {
      const jx = x + (rnd() - 0.5) * pas, jz = z + (rnd() - 0.5) * pas; const y = hauteur(jx, jz);
      const foret = jx < -13 && jx > -56 && jz > -4 && jz < 50;
      let p = foret ? 0.82 : 0.07;
      const r = Math.hypot(jx, jz + 5); if (r > 58) p = y < 22 ? 0.35 : 0;
      if (!libre(jx, jz) || clairieres.some(([cx, cz, cr]) => Math.hypot(jx - cx, jz - cz) < cr)) p = 0;
      if (p > 0 && proche(jx, jz, 2.8)) p = 0;
      if (rnd() < p) positions.push([jx, y, jz, foret, r > 58]);
    }
    // trois essences, chacune en plusieurs milliers de triangles partagés par toutes ses copies
    const T = Q === "basse" ? [3, 4] : [5, 7];
    const essences = [conifere(T[0], 1.55, 5.6, 3), conifere(T[1], 1.05, 7.2, 8), feuillu(5)];
    const tri = [[], [], []];
    positions.forEach((p) => { const a = rnd(); tri[p[3] ? (a < 0.62 ? 0 : 1) : p[4] ? (a < 0.5 ? 1 : 0) : a < 0.5 ? 2 : a < 0.78 ? 0 : 1].push(p); });
    const matA = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, side: Q === "basse" ? THREE.FrontSide : THREE.DoubleSide }); matA.userData.lin = true;
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(), v = new THREE.Vector3(), c = new THREE.Color(), Yv = new THREE.Vector3(0, 1, 0);
    tri.forEach((liste, e) => {
      const im = new THREE.InstancedMesh(essences[e], matA, liste.length);
      liste.forEach(([x, y, z, foret], i) => {
        const k = (e === 2 ? 0.85 : 0.8) + rnd() * 0.65; q.setFromAxisAngle(Yv, rnd() * 6.28); s.set(k, k * (0.9 + rnd() * 0.35), k); v.set(x, y - 0.15, z); m.compose(v, q, s); im.setMatrixAt(i, m);
        const l = (foret ? 0.5 : 0.85) + rnd() * 0.3; c.setRGB(l * (0.92 + rnd() * 0.16), l, l * (0.9 + rnd() * 0.12)); im.setColorAt(i, c);
      });
      im.castShadow = true; im.receiveShadow = true; scene.add(im);
    });
    // buissons au pied du château et dans le parc
    const gb = (() => { const g = new THREE.IcosahedronGeometry(0.8, 1), p = g.attributes.position, v1 = lin(0x2F4D1E), v2 = lin(0x6F8F3C); for (let k = 0; k < p.count; k++) { const j = 0.8 + fbm(p.getX(k) * 2 + 4, p.getY(k) * 2 + p.getZ(k) * 2 + 4, 2, 64) * 0.5; p.setXYZ(k, p.getX(k) * j, Math.max(-0.1, p.getY(k) * j * 0.7), p.getZ(k) * j); } return teinter(g, (cc, x, y) => cc.copy(v1).lerp(v2, Math.min(1, y + 0.5))); })();
    const buis = []; for (let k = 0; k < 150; k++) { const x = -58 + rnd() * 128, z = -46 + rnd() * 100; if (libre(x, z) && !proche(x, z, 2) && hauteur(x, z) < 12) buis.push([x, z]); }
    const ib = new THREE.InstancedMesh(gb, matA, buis.length); buis.forEach(([x, z], i) => { const k = 0.7 + rnd() * 0.9; q.setFromAxisAngle(Yv, rnd() * 6.28); s.set(k, k, k); v.set(x, hauteur(x, z) + 0.1, z); m.compose(v, q, s); ib.setMatrixAt(i, m); const l = 0.8 + rnd() * 0.3; ib.setColorAt(i, c.setRGB(l, l, l * 0.9)); }); ib.castShadow = true; ib.receiveShadow = true; scene.add(ib);
    // rochers : rives du lac, pied des montagnes, sous-bois
    const roc = []; for (let k = 0; k < 420 && roc.length < 130; k++) { const x = -70 + rnd() * 150, z = -55 + rnd() * 115, y = hauteur(x, z), dl = Math.hypot((x - 22) / 17, (z - 6) / 13), rr = Math.hypot(x, z + 5); if ((dl > 1.02 && dl < 1.22 && rnd() < 0.6) || (rr > 56 && rr < 80 && y < 24 && rnd() < 0.5) || (libre(x, z) && rnd() < 0.12)) if (!proche(x, z, 2.2) && distVoie(x, z) > 3.5 && !surPlateau(x, z)) roc.push([x, y, z]); }
    const ir = new THREE.InstancedMesh(rocher(), mat("roche"), roc.length); roc.forEach(([x, y, z], i) => { const k = 0.35 + rnd() * rnd() * 1.9; q.setFromEuler(new THREE.Euler(rnd() * 0.5, rnd() * 6.28, rnd() * 0.5)); s.set(k, k * (0.7 + rnd() * 0.5), k * (0.8 + rnd() * 0.4)); v.set(x, y + k * 0.12, z); m.compose(v, q, s); ir.setMatrixAt(i, m); }); ir.castShadow = true; ir.receiveShadow = true; scene.add(ir);
    // herbes hautes le long du sentier et autour des lieux (invisibles de loin, précieuses dans les scènes)
    const nh = { haute: 9000, moyenne: 4500, basse: 0 }[Q];
    if (nh) {
      const pts = [], ech = echantillonsChemin.filter((p, i) => i % 3 === 0 && p.y < hauteur(p.x, p.z) + 1), foyers = [[36, 17, 7], [-33, 15, 8], [-8, 28.5, 7], [3, 22, 8], [-21, 11, 7], [0, -17, 6]];
      for (let k = 0; k < nh * 3 && pts.length < nh; k++) { let x, z; if (rnd() < 0.7) { const e = ech[Math.floor(rnd() * ech.length)], a = rnd() * 6.28, d = 1.2 + rnd() * 7; x = e.x + Math.cos(a) * d; z = e.z + Math.sin(a) * d; } else { const f = foyers[Math.floor(rnd() * foyers.length)], a = rnd() * 6.28, d = rnd() * f[2]; x = f[0] + Math.cos(a) * d; z = f[1] + Math.sin(a) * d; } const y = hauteur(x, z); if (y > EAU + 0.25 && y < 10 && distVoie(x, z) > 1.8 && !proche(x, z, 0.9) && Math.hypot((x - 42) / 12, (z + 14) / 7) > 1.05 && !(z < -19.6 && Math.abs(x) < 22) && Math.hypot((x - 42) / 9, (z - 18) / 4.6) > 1) pts.push([x, y, z]); }
      const mh = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.9, side: THREE.DoubleSide }); mh.userData.lin = true;
      const ih = new THREE.InstancedMesh(touffe(), mh, pts.length); pts.forEach(([x, y, z], i) => { const k = 0.8 + rnd() * 1.1; q.setFromAxisAngle(Yv, rnd() * 6.28); s.set(k, k * (0.8 + rnd() * 0.6), k); v.set(x, y - 0.02, z); m.compose(v, q, s); ih.setMatrixAt(i, m); const l = 0.75 + rnd() * 0.4; ih.setColorAt(i, c.setRGB(l, l, l * 0.85)); }); ih.receiveShadow = true; scene.add(ih);
    }
  }
