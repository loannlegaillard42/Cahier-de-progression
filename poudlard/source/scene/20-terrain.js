  /* ---------- Relief : herbe, sous-bois, roche, neige, sable, selon l'altitude, la pente et le lieu ---------- */
  function grilleChemin() {                              // distance au sentier des étapes (pour le tracé de terre battue)
    const G = new Map(), cle = (i, j) => i * 1000 + j;
    echantillons.forEach((p) => { if (p.y > hauteur(p.x, p.z) + 1.2) return; const k = cle(Math.floor(p.x / 2), Math.floor(p.z / 2)); if (!G.has(k)) G.set(k, []); G.get(k).push(p); });
    return (x, z) => { let d = 9; const i = Math.floor(x / 2), j = Math.floor(z / 2); for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const l = G.get(cle(i + a, j + b)); if (l) for (const p of l) d = Math.min(d, Math.hypot(p.x - x, p.z - z)); } return d; };
  }
  function terrain() {
    const N = { haute: 256, moyenne: 192, basse: 128 }[Q];
    const geo = new THREE.PlaneGeometry(320, 320, N, N); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, uv = geo.attributes.uv;
    for (let i = 0; i < pos.count; i++) { const x = pos.getX(i), z = pos.getZ(i); pos.setY(i, hauteur(x, z)); uv.setXY(i, x / 9, z / 9); }
    geo.computeVertexNormals();
    const nor = geo.attributes.normal, coul = new Float32Array(pos.count * 3), c = new THREE.Color(), d = new THREE.Color();
    const K = {}; Object.entries({ herbe1: 0x4F7A34, herbe2: 0x6B9444, herbe3: 0x86A552, foret1: 0x2E4725, foret2: 0x44552D, litiere: 0x54452B, plateau: 0x7E8A58, roche1: 0x8F897E, roche2: 0x6A655D, neige: 0xF4F7FB, sable: 0xCDB98A, mouille: 0x8A7B5C, vase: 0x35453A, terre: 0x846E4C }).forEach(([k, v]) => (K[k] = lin(v)));
    const sentier = grilleChemin();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i), pente = 1 - nor.getY(i);
      const g1 = fbm(x * 0.045 + 40, z * 0.045 + 40, 4, 256), g2 = fbm(x * 0.21 + 7, z * 0.21 + 3, 3, 256);
      c.copy(K.herbe1).lerp(K.herbe2, lisse(0.35, 0.62, g1)).lerp(K.herbe3, lisse(0.5, 0.8, g2) * 0.55);
      const foret = lisse(-11, -16, x) * lisse(-59, -54, x) * lisse(-7, -2, z) * lisse(53, 48, z);
      if (foret > 0) c.lerp(d.copy(K.foret1).lerp(K.foret2, g2).lerp(K.litiere, lisse(0.55, 0.85, g1) * 0.6), foret * 0.92);
      if (surPlateau(x, z)) c.lerp(K.plateau, 0.5);
      const ds = sentier(x, z); if (ds < 1.7 && y > EAU) c.lerp(K.terre, (1 - lisse(0.4, 1.7, ds)) * 0.8);
      let roche = lisse(0.1, 0.3, pente + (g2 - 0.5) * 0.08); if (y > 11 && !surPlateau(x, z)) roche = Math.max(roche, lisse(11, 20, y + g1 * 7 - 3.5) * 0.9);
      if (roche > 0) c.lerp(d.copy(K.roche1).lerp(K.roche2, g2), roche);
      const neige = lisse(22.5, 27.5, y + g1 * 6 - 3) * (1 - lisse(0.3, 0.55, pente)); if (neige > 0) c.lerp(K.neige, neige);
      const dl = Math.hypot((x - 22) / 17, (z - 6) / 13);
      if (dl < 1.32) { c.lerp(K.sable, (1 - lisse(1.1, 1.3, dl + (g2 - 0.5) * 0.12)) * (y > EAU - 0.4 ? 0.9 : 1)); if (y < EAU + 0.25) c.lerp(K.mouille, 1 - lisse(EAU - 0.3, EAU + 0.25, y)); if (y < -0.4) c.lerp(K.vase, lisse(-0.4, -3.2, y)); }
      coul[i * 3] = c.r; coul[i * 3 + 1] = c.g; coul[i * 3 + 2] = c.b;
    }
    geo.setAttribute("color", new THREE.BufferAttribute(coul, 3));
    const T = texture("sol", 2);
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, map: T.map, normalMap: T.normalMap, normalScale: new THREE.Vector2(0.75, 0.75), roughness: 0.95, metalness: 0 }));
    m.material.userData.lin = true; m.receiveShadow = true; m.castShadow = Q !== "basse"; scene.add(m); S.sol = m;
  }

  /* ---------- Le lac : reflets du ciel et du château (haute et moyenne), eau simple sinon ---------- */
  function eau() {
    const N = texture("eau", 3).normalMap, g = new THREE.CircleGeometry(1, 72);
    const poser = (m) => { m.rotation.x = -Math.PI / 2; m.scale.set(18.5, 14.5, 1); m.position.set(22, EAU, 6); scene.add(m); return m; };
    if (THREE.Water && Q !== "basse") {
      const t = Q === "haute" ? 1024 : 512;
      const w = new THREE.Water(g, { textureWidth: t, textureHeight: t, waterNormals: N, sunDirection: DIR_SOLEIL.clone(), sunColor: 0xFFF0D0, waterColor: 0x0E3442, distortionScale: 1.5, alpha: 0.95, fog: true });
      w.material.fragmentShader = w.material.fragmentShader.replace("#include <tonemapping_fragment>", "#include <tonemapping_fragment>\n#include <encodings_fragment>");
      w.material.transparent = true; w.material.uniforms.size.value = 13; S.eau = poser(w); S.eauReflets = true;
    } else {
      const m = new THREE.MeshStandardMaterial({ color: lin(0x1B4A5C), roughness: 0.06, metalness: 0.55, normalMap: N, normalScale: new THREE.Vector2(0.35, 0.35), transparent: true, opacity: 0.93, envMapIntensity: 1.3 });
      m.userData.lin = true; N.repeat.set(5, 4); S.eau = poser(new THREE.Mesh(g, m)); S.eau.receiveShadow = true;
    }
    // la surface vue de dessous (plongée dans le lac)
    const dessous = poser(new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x2F8A70, transparent: true, opacity: 0.6, side: THREE.BackSide, fog: true }))); dessous.position.y = EAU - 0.02;
  }
  function majEau(t, dt) {
    if (!S.eau) return;
    if (S.eauReflets) S.eau.material.uniforms.time.value += dt * 0.55;
    else if (S.eau.material.normalMap) S.eau.material.normalMap.offset.set(t * 0.012, t * 0.008);
  }
