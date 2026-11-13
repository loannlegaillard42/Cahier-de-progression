  function init(canvas, rappels) {
    if (!window.THREE || !THREE.OrbitControls) return false;
    const P = typeof prefs !== "undefined" ? prefs : {};
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance", failIfMajorPerformanceCaveat: !P.force3d });
    } catch (e) { return false; }
    onClic = rappels.clic; onSurvol = rappels.survol;
    Q = S.qualite = qualite(P); S.adaptatif = !P.qualite && !P.fixe;
    S.aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    S.ratio = Math.min(window.devicePixelRatio || 1, { haute: 2, moyenne: 1.5, basse: 1 }[Q]);
    renderer.setPixelRatio(S.ratio);
    renderer.outputEncoding = THREE.sRGBEncoding; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.6;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = Q === "basse" ? THREE.PCFShadowMap : THREE.PCFSoftShadowMap;
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, 0.5, 1200);
    camera.position.set(70, 78, 95);
    controls = new THREE.OrbitControls(camera, canvas);
    controls.target.set(0, 3, -4);
    controls.enableDamping = true; controls.dampingFactor = 0.08;
    controls.minDistance = 14; controls.maxDistance = 170;
    controls.maxPolarAngle = 1.38; controls.screenSpacePanning = false;
    horloge = new THREE.Clock();

    atmosphere(); construireChemin(); terrain(); eau(); chateau(); serres(); cabane(); quidditch(); decorsLieux(); construireGare(); construireLac(); arbres(); construireMarqueurs(); construireEquipe(); decorsAnimes();
    lineariser(scene);

    const ro = new ResizeObserver(redim); ro.observe(canvas.parentElement); redim();
    evenements(canvas);
    document.fonts && document.fonts.ready.then(() => marqueurs.forEach((m) => m && m.redessiner && m.redessiner()));
    S.ok = true;
    boucle();
    return true;
  }

  /* Qualité : choisie dans les réglages, sinon devinée d'après la carte graphique. */
  function qualite(P) {
    let nom = ""; try { const gl = renderer.getContext(), e = gl.getExtension("WEBGL_debug_renderer_info"); nom = e ? String(gl.getParameter(e.UNMASKED_RENDERER_WEBGL)) : ""; } catch (e) {}
    S.carte = nom;
    if (["haute", "moyenne", "basse"].includes(P.qualite)) return P.qualite;
    if (/swiftshader|llvmpipe|software|basic render/i.test(nom)) return "basse";
    if (/intel|mali|adreno|powervr|apple gpu|videocore/i.test(nom) && !/iris\(r\) xe|iris xe|arc/i.test(nom)) return "moyenne";
    return nom ? "haute" : "moyenne";
  }

  function redim() {
    const el = renderer.domElement.parentElement; const w = el.clientWidth, h = el.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); if (S.pause) renderer.render(scene, camera);
  }

  /* Les couleurs sont saisies en sRGB ; le rendu (sortie sRGB, tons filmiques) attend des couleurs linéaires. */
  function lineariser(racine) {
    racine.traverse((o) => { for (const m of (Array.isArray(o.material) ? o.material : o.material ? [o.material] : [])) { if (m.userData.lin || !m.color || !m.color.isColor) continue; m.userData.lin = true; m.color.convertSRGBToLinear(); if (m.emissive) m.emissive.convertSRGBToLinear(); } });
    return racine;
  }

  /* ---------- Ciel, soleil, brume, nuages ---------- */
  const DIR_SOLEIL = new THREE.Vector3(-0.56, 0.5, 0.66).normalize();
  function atmosphere() {
    hemi = new THREE.HemisphereLight(lin(0xC4D8FF), lin(0x6E5C3E), 0.5); scene.add(hemi);
    soleil = new THREE.DirectionalLight(lin(0xFFE2B6), 3.0);
    soleil.position.copy(DIR_SOLEIL).multiplyScalar(150).add(new THREE.Vector3(5, 0, -5)); soleil.target.position.set(5, 0, -5); scene.add(soleil.target);
    soleil.castShadow = true; const t = { haute: 4096, moyenne: 2048, basse: 1024 }[Q]; soleil.shadow.mapSize.set(t, t);
    const sc = soleil.shadow.camera; sc.left = -98; sc.right = 98; sc.top = 98; sc.bottom = -98; sc.near = 20; sc.far = 340;
    soleil.shadow.bias = -0.0004; soleil.shadow.normalBias = 0.06;
    scene.add(soleil);
    S.jour = { soleil: soleil.intensity, hemi: hemi.intensity, couleur: soleil.color.clone() };
    S.brumes = { jour: new THREE.Fog(0xC6CFD8, 170, 560), nuit: new THREE.Fog(0x0E1430, 120, 420), eau: new THREE.Fog(0x0B3A2E, 0.3, 16) };
    S.fonds = { jour: new THREE.Color(0x9FB8D6), nuit: new THREE.Color(0x0B1026), eau: new THREE.Color(0x0B3A2E) };
    if (THREE.Sky) {
      const regler = (c) => { const u = c.material.uniforms; u.turbidity.value = 5; u.rayleigh.value = 1.35; u.mieCoefficient.value = 0.006; u.mieDirectionalG.value = 0.83; u.sunPosition.value.copy(DIR_SOLEIL); c.scale.setScalar(4000); return c; };
      ciel3D = regler(new THREE.Sky()); scene.add(ciel3D);
      try {
        const pm = new THREE.PMREMGenerator(renderer), sj = new THREE.Scene(); sj.add(regler(new THREE.Sky()));
        S.envs = { jour: pm.fromScene(sj).texture }; const sn = new THREE.Scene(); sn.background = lin(0x1A2244); S.envs.nuit = pm.fromScene(sn).texture; pm.dispose();
      } catch (e) { S.envs = null; }
    }
    // nuages : amas de voiles doux sur un anneau lointain
    const tn = dessin("nuage");
    for (let k = 0; k < (Q === "basse" ? 9 : 16); k++) {
      const g = new THREE.Group(), ang = rnd() * Math.PI * 2, ray = 150 + rnd() * 130;
      for (let j = 0; j < 4; j++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tn, color: new THREE.Color(1.75, 1.68, 1.6), transparent: true, opacity: 0.72, depthWrite: false, fog: false })); sp.material.userData.lin = true; const e = 46 + rnd() * 40; sp.scale.set(e * 1.7, e, 1); sp.position.set(j * 26 - 40 + rnd() * 14, rnd() * 9, rnd() * 20); g.add(sp); }
      g.position.set(Math.cos(ang) * ray, 78 + rnd() * 40, Math.sin(ang) * ray - 5); g.userData.v = 0.5 + rnd() * 0.7; scene.add(g); nuages.push(g);
    }
    // étoiles (visibles la nuit seulement)
    const ne = 500, pe = new Float32Array(ne * 3); for (let i = 0; i < ne; i++) { const a = rnd() * Math.PI * 2, h = 0.08 + rnd() * 0.9, r = Math.sqrt(1 - h * h); pe[i * 3] = Math.cos(a) * r * 800; pe[i * 3 + 1] = h * 800; pe[i * 3 + 2] = Math.sin(a) * r * 800; }
    const ge = new THREE.BufferGeometry(); ge.setAttribute("position", new THREE.BufferAttribute(pe, 3));
    etoiles = new THREE.Points(ge, new THREE.PointsMaterial({ color: 0xffffff, size: 2.2, sizeAttenuation: false, fog: false, transparent: true, opacity: 0.9 })); etoiles.visible = false; scene.add(etoiles);
    ambiance("jour");
  }
  /* Ambiances : « jour », « nuit » (feu d'artifice final), « eau » (caméra sous le lac). */
  function ambiance(nom) {
    S.ambiance = nom; const nuit = nom === "nuit", sousEau = nom === "eau";
    if (ciel3D) ciel3D.visible = nom === "jour";
    scene.background = nom === "jour" && ciel3D ? null : S.fonds[nom]; scene.fog = S.brumes[nom];
    if (S.envs) scene.environment = nuit ? S.envs.nuit : S.envs.jour;
    soleil.intensity = S.jour.soleil * (nuit ? 0.1 : sousEau ? 0.45 : 1); hemi.intensity = S.jour.hemi * (nuit ? 0.5 : sousEau ? 0.7 : 1);
    soleil.color.copy(nuit ? lin(0x9DB4FF) : S.jour.couleur);
    etoiles.visible = nuit; nuages.forEach((n) => { n.visible = !sousEau; n.children.forEach((s) => { s.material.color.setScalar(nuit ? 0.22 : 1.7); s.material.opacity = nuit ? 0.18 : 0.72; }); });
    if (MAT.fenetre) MAT.fenetre.emissiveIntensity = nuit ? 2.6 : 1.25;
  }
