  /* ---------- Le château de Poudlard ---------- */
  /* Toit à deux pans (faîte le long de x), posé sur y = 0 ; ardoises à l'échelle */
  function toitPans(w, d, h, debord = 0.45) {
    const a = w / 2 + debord, s = d / 2 + debord, k = h / (d / 2), y0 = -debord * k, L = Math.hypot(s, h - y0) / 3, U = (2 * a) / 3;
    const P = [], T = []; const quad = (p, uv) => { [0, 1, 2, 0, 2, 3].forEach((i) => { P.push(...p[i]); T.push(...uv[i]); }); };
    quad([[-a, y0, s], [a, y0, s], [a, h, 0], [-a, h, 0]], [[0, 0], [U, 0], [U, L], [0, L]]);
    quad([[a, y0, -s], [-a, y0, -s], [-a, h, 0], [a, h, 0]], [[0, 0], [U, 0], [U, L], [0, L]]);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3)); g.setAttribute("uv", new THREE.Float32BufferAttribute(T, 2)); g.computeVertexNormals(); return g;
  }
  function pignon(d, h) { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute([0, 0, d / 2, 0, 0, -d / 2, 0, h, 0, 0, 0, -d / 2, 0, 0, d / 2, 0, h, 0], 3)); g.computeVertexNormals(); return uvMonde(g); }
  /* Le chemin des étapes passe-t-il en l'air près de ce point ? (on y laisse un passage dans les créneaux) */
  function pasChemin(x, y, z, marge = 1.5) { return echantillons.some((p) => Math.abs(p.y - y) < 2.2 && (p.x - x) ** 2 + (p.z - z) ** 2 < marge * marge); }

  function chateau() {
    const L = lot(), b = hauteur(0, -33) - 0.6, F = [], FC = [];
    const sol = (x, z) => Math.min(hauteur(x, z), b + 0.6);
    const fen = (x, y, z, ry, l = 0.6, h = 1.4) => F.push([x, y, z, ry, l, h]);
    const merlon = (x, y, z, ry = 0) => { if (!pasChemin(x, y, z)) L.boite(0.72, 0.8, 0.5, "pierre", x, y, z, ry, 3); };

    function tourRonde(x, z, r, haut, { toit = true, hToit = r * 2.7, fenetres = 4 } = {}) {
      const y0 = sol(x, z) - 3;
      L.cyl(r, r * 1.1, haut - y0, "pierre", x, y0, z, 28);
      L.cyl(r + 0.32, r + 0.02, 0.6, "pierreSombre", x, haut - 0.6, z, 28);
      if (toit) { L.cone(r + 0.6, hToit, "toit", x, haut, z, 28); L.add(new THREE.SphereGeometry(0.17, 10, 8), "or", x, haut + hToit + 0.12, z); L.cyl(0.03, 0.03, 0.9, "or", x, haut + hToit, z, 6); }
      else { L.cyl(r + 0.32, r + 0.32, 0.25, "paves", x, haut - 0.02, z, 28); const n = Math.round((2 * Math.PI * (r + 0.1)) / 1.35); for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2; merlon(x + Math.sin(a) * (r + 0.07), haut + 0.2, z + Math.cos(a) * (r + 0.07), a); } }
      for (let k = 0; k < fenetres; k++) { const a = k * 2.4 + x * 0.7 + z, y = y0 + 5 + ((haut - y0 - 8) * (k + 0.5)) / fenetres; fen(x + Math.sin(a) * (r + 0.03), y, z + Math.cos(a) * (r + 0.03), a, 0.5, 1.2); }
    }
    /* Corps de bâtiment rectangulaire ; fenêtres sur les quatre faces ; toit plat crénelé ou toit à deux pans (axe "x" ou "z") */
    function corps(x, z, w, d, haut, { toit = null, hToit = 3.5, rangs = 2, pasF = 1.9, hF = 1.5 } = {}) {
      const y0 = Math.min(sol(x - w / 2, z - d / 2), sol(x + w / 2, z - d / 2), sol(x - w / 2, z + d / 2), sol(x + w / 2, z + d / 2)) - 2.5, mur = toit ? haut : haut - 0.25;
      L.boite(w, mur - y0, d, "pierre", x, y0, z);
      L.boite(w + 0.35, 0.35, d + 0.35, "pierreSombre", x, haut - (toit ? 0.35 : 0.6), z);
      if (!toit) {
        L.boite(w + 0.3, 0.25, d + 0.3, "paves", x, haut - 0.25, z, 0, 2.5);
        for (let u = -w / 2 + 0.3; u <= w / 2 - 0.25; u += 1.32) { merlon(x + u, haut, z + d / 2 - 0.1); merlon(x + u, haut, z - d / 2 + 0.1); }
        for (let u = -d / 2 + 1.5; u <= d / 2 - 1.4; u += 1.32) { merlon(x + w / 2 - 0.1, haut, z + u, Math.PI / 2); merlon(x - w / 2 + 0.1, haut, z + u, Math.PI / 2); }
      } else if (toit === "x") { L.add(toitPans(w, d, hToit), "toit", x, haut, z); for (const s of [-1, 1]) L.add(pignon(d, hToit), "pierre", x + (s * w) / 2, haut, z); }
      else { L.add(toitPans(d, w, hToit), "toit", x, haut, z, Math.PI / 2); for (const s of [-1, 1]) L.add(pignon(w, hToit), "pierre", x, haut, z + (s * d) / 2, Math.PI / 2); }
      const yb = Math.max(sol(x, z), y0 + 2.5) + 1.6;
      for (let r = 0; r < rangs; r++) {
        const y = yb + ((mur - yb - 1.4) * (r + 0.5)) / rangs;
        for (let u = -w / 2 + 1.1; u <= w / 2 - 1; u += pasF) { fen(x + u, y, z + d / 2 + 0.04, 0, 0.6, hF); fen(x + u, y, z - d / 2 - 0.04, Math.PI, 0.6, hF); }
        for (let u = -d / 2 + 1.1; u <= d / 2 - 1; u += pasF) { fen(x + w / 2 + 0.04, y, z + u, Math.PI / 2, 0.6, hF); fen(x - w / 2 - 0.04, y, z + u, -Math.PI / 2, 0.6, hF); }
      }
    }
    /* Rempart crénelé entre deux points */
    function rempart(x1, z1, x2, z2, haut = b + 5.2, ep = 1.3) {
      const dx = x2 - x1, dz = z2 - z1, lg = Math.hypot(dx, dz), ry = Math.atan2(dx, dz), n = Math.ceil(lg / 4);
      for (let k = 0; k < n; k++) { const f = (k + 0.5) / n, x = x1 + dx * f, z = z1 + dz * f, y0 = sol(x, z) - 3; L.add(uvMonde(new THREE.BoxGeometry(ep, haut - y0, lg / n + 0.05)), "pierre", x, y0 + (haut - y0) / 2, z, ry); }
      L.add(uvMonde(new THREE.BoxGeometry(ep + 0.3, 0.3, lg)), "pierreSombre", (x1 + x2) / 2, haut - 0.15, (z1 + z2) / 2, ry);
      for (let s = 0.7; s < lg - 0.5; s += 1.32) { const f = s / lg; for (const c of [-1, 1]) { const ox = (Math.cos(ry) * c * (ep / 2 - 0.2)), oz = (-Math.sin(ry) * c * (ep / 2 - 0.2)); if (c === 1 || s % 2.64 < 1.4) L.add(uvMonde(new THREE.BoxGeometry(0.45, 0.75, 0.72), 3), "pierre", x1 + dx * f + ox, haut + 0.37, z1 + dz * f + oz, ry); } }
    }

    // --- La Grande Salle (façade sud, entrée face à la plaque de départ)
    corps(0, -27, 16, 8, b + 7.2, { toit: "x", hToit: 4.6, rangs: 0 });
    for (let k = 0; k < 7; k++) { const x = -6.6 + k * 2.2; if (Math.abs(x) > 1.2) { fen(x, b + 4.1, -22.95, 0, 1.05, 3.6); } fen(x, b + 4.1, -31.05, Math.PI, 1.05, 3.6); }
    for (let k = 0; k < 8; k++) { const x = -7.7 + k * 2.2; if (Math.abs(x) < 1.5) continue; L.boite(0.55, 6.6, 0.9, "pierreSombre", x, b - 0.4, -22.7, 0, 3); L.add(uvMonde(new THREE.BoxGeometry(0.55, 1.1, 0.9), 3), "pierreSombre", x, b + 6.6, -22.9, 0, 0.5); }
    for (const [sx, sz] of [[-8, -23], [8, -23], [-8, -31], [8, -31]]) { tourRonde(sx, sz, 1.05, b + 9.6, { hToit: 3.2, fenetres: 2 }); }
    L.boite(4, 5.4, 1.5, "pierre", 0, b - 0.3, -22.6); L.add(toitPans(1.9, 4.4, 1.9, 0.3), "toit", 0, b + 5.1, -22.6, Math.PI / 2); L.add(pignon(4.4, 1.9), "pierre", 0, b + 5.1, -21.85, Math.PI / 2);
    L.add(uvMonde(new THREE.BoxGeometry(2.2, 3.3, 0.2)), "boisSombre", 0, b + 2.15, -21.82); L.add(new THREE.CircleGeometry(1.1, 20, 0, Math.PI), "boisSombre", 0, b + 3.8, -21.71);
    for (let k = 0; k < 4; k++) L.boite(5.2 + k * 0.9, 0.3, 0.8, "paves", 0, b + 0.3 - k * 0.3, -21.4 + k * 0.75, 0, 2.5);
    for (const s of [-1, 1]) { L.cyl(0.07, 0.09, 2.6, "noir", s * 2.5, b + 0.4, -21.3, 8); L.add(new THREE.BoxGeometry(0.32, 0.42, 0.32), "lampe", s * 2.5, b + 3.2, -21.3); }
    for (const x of [-4.5, 4.5]) { L.boite(0.9, 2.6, 0.9, "pierre", x, b + 9.8, -27, 0, 3); L.boite(1.1, 0.25, 1.1, "pierreSombre", x, b + 12.4, -27, 0, 3); }
    // --- Le donjon (terrasse de la Salle sur Demande) et ses échauguettes
    corps(-3, -37, 10, 9, 20.1, { rangs: 3 });
    for (const [sx, sz] of [[-8, -41.5], [2, -41.5], [-8, -32.5], [2, -32.5]]) { if (pasChemin(sx, 22, sz, 2.6)) continue; L.cyl(0.95, 0.5, 1.6, "pierreSombre", sx, 16.4, sz, 16); L.cyl(0.95, 0.95, 4.6, "pierre", sx, 18, sz, 16); L.cone(1.3, 2.6, "toit", sx, 22.6, sz, 16); L.add(new THREE.SphereGeometry(0.13, 8, 6), "or", sx, 25.3, sz); fen(sx + (sx < -3 ? -0.98 : 0.98), 20.6, sz, sx < -3 ? -Math.PI / 2 : Math.PI / 2, 0.4, 1); }
    // --- L'aile est (terrasse de la Bibliothèque), le corps central et la galerie nord
    corps(12.5, -31, 10, 6.5, 16, { rangs: 2 });
    corps(5.5, -38.5, 7, 7, b + 6.5, { toit: "z", hToit: 3.2, rangs: 1 });
    corps(-13, -34, 8, 5, b + 5.4, { toit: "x", hToit: 2.8, rangs: 1 });
    corps(14, -40, 6, 5, b + 5, { toit: "x", hToit: 2.6, rangs: 1 });
    // --- Les tours
    tourRonde(-14, -41, 3.0, 25, { toit: false, fenetres: 6 });                       // tour de Serdaigle (dernière étape)
    tourRonde(9, -43, 2.4, 29.5, { hToit: 7, fenetres: 7 });                          // tour d'astronomie, la plus haute
    tourRonde(18.5, -36.5, 2.3, 19, { fenetres: 5 }); tourRonde(-12.5, -27.5, 1.9, 15.5); tourRonde(-20, -35, 1.9, 14.5);
    tourRonde(3.5, -46, 1.7, 22.5, { fenetres: 5 }); tourRonde(-6, -46.5, 1.5, 15); tourRonde(17.5, -27, 1.5, b + 5.8, { hToit: 3 });
    tourRonde(-2.5, -41.5, 1.3, 26.5, { hToit: 4.4, fenetres: 2 });
    // --- Les remparts
    rempart(-20, -35, -15.6, -39.5); rempart(-12, -43.2, -6, -46.5); rempart(-6, -46.5, 3.5, -46); rempart(3.5, -46, 8, -44.5); rempart(11, -42, 18.5, -36.5);
    rempart(18.5, -36.5, 17.5, -27); rempart(17.5, -27, 9, -23.6); rempart(-9, -23.6, -12.5, -27.5); rempart(-12.5, -27.5, -20, -35);
    // --- Le drapeau de Serdaigle
    L.cyl(0.06, 0.07, 4.6, "noir", -16.1, 25, -43.1, 8); L.add(new THREE.SphereGeometry(0.13, 8, 6), "or", -16.1, 29.7, -43.1);
    const g = L.poser(scene);
    passerelles();
    // fenêtres éclairées : une seule géométrie
    const quad = new THREE.PlaneGeometry(1, 1), LF = lot();
    F.forEach(([x, y, z, ry, l, h]) => { const q = quad.clone(); q.scale(l, h, 1); LF.add(q, "fenetre", x, y, z, ry); });
    const gf = LF.poser(scene, { ombre: false, recoit: false }); gf.children.forEach((m) => (m.renderOrder = 1));
    const drapeau = new THREE.Mesh(new THREE.PlaneGeometry(2, 1.2, 8, 1), new THREE.MeshStandardMaterial({ color: 0x2A4C9C, side: THREE.DoubleSide, roughness: 0.8 })); drapeau.geometry.translate(1, 0, 0); drapeau.position.set(-16.1, 28.9, -43.1); drapeau.castShadow = true; scene.add(drapeau); S.drapeau = drapeau;
    if (Q !== "basse") for (const [x, y, z] of [[0, b + 3.6, -21.2], [-4, b + 4.5, -22.6], [4, b + 4.5, -22.6], [9, 24, -43]]) { const h = halo(0xFFC870, 5, 0.32); h.position.set(x, y, z); scene.add(h); }
    return g;
  }

  /* Viaduc et passerelles de pierre sous le chemin, là où il quitte le sol pour monter au château */
  function passerelles() {
    const L = lot(), pas = 1.45 / cheminLong, toits = [[-3, -37, 5.2, 4.7, 20.1], [12.5, -31, 5.2, 3.45, 16]];
    const dessous = (x, z) => { let h = hauteur(x, z); toits.forEach(([cx, cz, dx, dz, t]) => { if (Math.abs(x - cx) < dx && Math.abs(z - cz) < dz) h = Math.max(h, t); }); if (Math.hypot(x + 14, z + 41) < 3.2) h = Math.max(h, 25); return h; };
    let k = 0;
    for (let u = fractions[13]; u <= 1; u += pas) {
      const p = chemin.getPointAt(u), t = chemin.getTangentAt(u), h = dessous(p.x, p.z); if (p.y - h < 0.7) { k = 0; continue; }
      const ry = Math.atan2(t.x, t.z), rx = -Math.asin(Math.max(-1, Math.min(1, t.y)));
      L.add(uvMonde(new THREE.BoxGeometry(2.1, 0.34, 1.5), 2.5), "paves", p.x, p.y - 0.27, p.z, ry, rx);
      for (const s of [-1, 1]) L.add(uvMonde(new THREE.BoxGeometry(0.22, 0.6, 1.5).translate(s * 0.98, 0.42, 0), 3), "pierre", p.x, p.y - 0.27, p.z, ry, rx);
      if (k++ % 4 === 0 && p.y - h > 1.6) { const hp = p.y - 0.5 - h + 1.5; L.add(uvMonde(new THREE.BoxGeometry(1.5, hp, 1.2)), "pierre", p.x, p.y - 0.5 - hp / 2, p.z, ry); L.add(uvMonde(new THREE.BoxGeometry(2.3, 0.4, 1.6), 3), "pierreSombre", p.x, p.y - 0.62, p.z, ry); }
    }
    L.poser(scene);
  }
