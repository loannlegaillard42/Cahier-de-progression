  /* ---------- Matériaux (pierre, ardoise, bois… avec relief) et outils de construction ---------- */
  const MAT = {};
  function mat(nom) {
    if (MAT[nom]) return MAT[nom];
    const T = (n, f) => texture(n, f);
    const std = (o) => new THREE.MeshStandardMaterial(o), ns = (v) => new THREE.Vector2(v, v);
    const defs = {
      pierre: () => std({ ...T("pierre"), color: 0xFFFFFF, roughness: 0.92, normalScale: ns(1.1) }),
      pierreSombre: () => std({ ...T("pierre"), color: 0xC4BBAC, roughness: 0.95, normalScale: ns(1.1) }),
      pierreMousse: () => std({ ...T("pierre"), color: 0x9AA588, roughness: 0.97, normalScale: ns(1.1) }),
      roche: () => std({ ...T("roche"), color: 0xD8D2C6, roughness: 0.96, normalScale: ns(1.2) }),
      paves: () => std({ ...T("paves"), color: 0xE4DDCD, roughness: 0.93 }),
      toit: () => std({ ...T("ardoise"), color: 0xE4E6EC, roughness: 0.6, metalness: 0.1, normalScale: ns(1.3) }),
      tuiles: () => std({ ...T("ardoise"), color: 0xE8A07A, roughness: 0.75, normalScale: ns(1.3) }),
      chaume: () => std({ ...T("chaume"), color: 0xF0E6CC, roughness: 1 }),
      bois: () => std({ ...T("bois"), color: 0xE8D8C0, roughness: 0.85 }),
      boisSombre: () => std({ ...T("bois"), color: 0x8A7A68, roughness: 0.88 }),
      ecorce: () => std({ ...T("ecorce"), color: 0xD8CCBC, roughness: 0.98, normalScale: ns(1.4) }),
      colombage: () => std({ ...T("colombage"), color: 0xFFF8EA, roughness: 0.9 }),
      fenetre: () => std({ color: 0x241808, emissive: 0xFFD08A, emissiveMap: dessin("fenetre"), emissiveIntensity: 1.25, map: dessin("fenetre"), transparent: true, alphaTest: 0.5, roughness: 0.4 }),
      fenetreCarree: () => std({ color: 0x241808, emissive: 0xFFD08A, emissiveMap: dessin("fenetreCarree"), emissiveIntensity: 1.25, roughness: 0.4 }),
      lampe: () => std({ color: 0xFFE2A0, emissive: 0xFFC060, emissiveIntensity: 2.2 }),
      verre: () => new THREE.MeshPhysicalMaterial({ color: 0xCFEDE4, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.32, envMapIntensity: 1.6, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false }),
      fer: () => std({ color: 0x2A3A30, roughness: 0.55, metalness: 0.7 }),
      noir: () => std({ color: 0x1B1B20, roughness: 0.5, metalness: 0.6 }),
      or: () => std({ color: 0xE9BE55, roughness: 0.22, metalness: 1, envMapIntensity: 1.4 }),
      argent: () => std({ color: 0xE4E9F0, roughness: 0.18, metalness: 1, envMapIntensity: 1.4 }),
      cuivre: () => std({ color: 0xC98A5A, roughness: 0.3, metalness: 1 }),
      tissuNoir: () => std({ color: 0x1D1F33, roughness: 0.9 }),
      peau: () => std({ color: 0xEBC9A8, roughness: 0.7 }),
      vegetal: () => { const m = std({ vertexColors: true, roughness: 0.9 }); m.userData.lin = true; return m; },
    };
    return (MAT[nom] = defs[nom]());
  }
  function ombres(o) { o.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; } }); return o; }

  /* Coordonnées de texture à l'échelle du monde (1 motif = « pas » unités), pour que la pierre ait partout la même taille */
  function uvCyl(geo, r, h, pas = 4) { const uv = geo.attributes.uv, ku = Math.max(1, Math.round((2 * Math.PI * r) / pas)), kv = h / pas; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * ku, uv.getY(i) * kv); return geo; }
  function uvMonde(geo, pas = 4) {
    const g = geo.index ? geo.toNonIndexed() : geo; if (!g.attributes.normal) g.computeVertexNormals();
    const p = g.attributes.position, n = g.attributes.normal, uv = new Float32Array(p.count * 2);
    for (let i = 0; i < p.count; i += 3) {       // un plan de projection par triangle (pas de coutures à l'intérieur d'une face)
      const ax = Math.abs(n.getX(i) + n.getX(i + 1) + n.getX(i + 2)), ay = Math.abs(n.getY(i) + n.getY(i + 1) + n.getY(i + 2)), az = Math.abs(n.getZ(i) + n.getZ(i + 1) + n.getZ(i + 2));
      for (let k = i; k < i + 3; k++) { const x = p.getX(k), y = p.getY(k), z = p.getZ(k); if (ay >= ax && ay >= az) { uv[k * 2] = x / pas; uv[k * 2 + 1] = z / pas; } else if (ax >= az) { uv[k * 2] = z / pas; uv[k * 2 + 1] = y / pas; } else { uv[k * 2] = x / pas; uv[k * 2 + 1] = y / pas; } }
    }
    g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); return g;
  }
  /* Fusionne des géométries (position, normale, uv) en une seule : un seul objet à dessiner par matériau */
  function fusion(geos) {
    const L = geos.map((g) => { const h = g.index ? g.toNonIndexed() : g; if (!h.attributes.normal) h.computeVertexNormals(); return h; });
    const n = L.reduce((a, g) => a + g.attributes.position.count, 0), P = new Float32Array(n * 3), Nn = new Float32Array(n * 3), U = new Float32Array(n * 2); let o = 0;
    const avecCoul = L.every((g) => g.attributes.color), Cc = avecCoul ? new Float32Array(n * 3) : null;
    L.forEach((g) => { const c = g.attributes.position.count; P.set(g.attributes.position.array.subarray(0, c * 3), o * 3); Nn.set(g.attributes.normal.array.subarray(0, c * 3), o * 3); if (g.attributes.uv) U.set(g.attributes.uv.array.subarray(0, c * 2), o * 2); if (Cc) Cc.set(g.attributes.color.array.subarray(0, c * 3), o * 3); o += c; });
    const r = new THREE.BufferGeometry(); r.setAttribute("position", new THREE.BufferAttribute(P, 3)); r.setAttribute("normal", new THREE.BufferAttribute(Nn, 3)); r.setAttribute("uv", new THREE.BufferAttribute(U, 2)); if (Cc) r.setAttribute("color", new THREE.BufferAttribute(Cc, 3));
    return r;
  }
  /* Un « lot » rassemble des pièces par matériau puis les pose d'un coup */
  function lot() {
    const par = new Map(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const L = {
      /* pièce déjà en place (coordonnées locales du lot) */
      brut(geo, m) { if (!par.has(m)) par.set(m, []); par.get(m).push(geo); return L; },
      /* pièce posée en (x, y, z), tournée de ry autour de la verticale */
      add(geo, m, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0) { e.set(rx, ry, rz, "YXZ"); q.setFromEuler(e); m4.compose(new THREE.Vector3(x, y, z), q, new THREE.Vector3(1, 1, 1)); const g = geo.clone(); g.applyMatrix4(m4); return L.brut(g, m); },
      /* boîte texturée posée sur y (base), avec la pierre à l'échelle */
      boite(w, h, d, m, x, y, z, ry = 0, pas = 4) { return L.add(uvMonde(new THREE.BoxGeometry(w, h, d), pas), m, x, y + h / 2, z, ry); },
      /* cylindre vertical posé sur y */
      cyl(r1, r2, h, m, x, y, z, seg = 20, pas = 4, ouvert = false) { return L.add(uvCyl(new THREE.CylinderGeometry(r1, r2, h, seg, 1, ouvert), (r1 + r2) / 2, h, pas), m, x, y + h / 2, z); },
      /* toit conique d'ardoises */
      cone(r, h, m, x, y, z, seg = 20, pas = 3) { return L.add(uvCyl(new THREE.ConeGeometry(r, h, seg, 4, true), r * 0.6, Math.hypot(r, h), pas), m, x, y + h / 2, z); },
      poser(parent, { ombre = true, recoit = true } = {}) {
        const g = new THREE.Group();
        par.forEach((geos, m) => { const mesh = new THREE.Mesh(fusion(geos), typeof m === "string" ? mat(m) : m); mesh.castShadow = ombre; mesh.receiveShadow = recoit; g.add(mesh); });
        (parent || scene).add(g); return g;
      },
    };
    return L;
  }
  /* Halo lumineux (lanternes, fenêtres, magie) : un voile additif, sans vraie lampe */
  function halo(couleur, taille, opacite = 0.7) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dessin("halo"), color: couleur, transparent: true, opacity: opacite, blending: THREE.AdditiveBlending, depthWrite: false, fog: false })); s.scale.setScalar(taille); return s; }

  /* Anciennes aides, encore utilisées par quelques constructions simples */
  function boite(w, h, d, m, x, y, z) { const b = new THREE.Mesh(uvMonde(new THREE.BoxGeometry(w, h, d)), mat(m)); b.position.set(x, y + h / 2, z); return b; }
