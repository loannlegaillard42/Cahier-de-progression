  /* ---------- État visuel ---------- */
  function majEtat(etat, opts = {}) {
    if (!S.ok) return;
    const fait = etat.etape, prep = opts.prep;
    marqueurs.forEach((m) => {
      if (m.n === 0) return; const d = m.groupe.userData; const e = m.n <= fait ? "fait" : m.n === fait + 1 ? "actuel" : "verrou";
      if (d.etat !== e) { d.etat = e; m.redessiner(); }
      const ch = chapitreDe(m.n); const coul = lin(e === "fait" ? 0xE8C978 : MAISONS[HEROS[ch.heros].maison].c);
      d.orbeMat.color.copy(e === "verrou" ? lin(0x6A6C7E) : coul); d.orbeMat.emissive.copy(e === "verrou" ? lin(0x111122) : coul);
      if (d.lueur) { d.lueur.material.color.copy(coul); d.lueur.material.opacity = e === "actuel" ? 0.55 : e === "fait" ? 0.22 : 0; }
      d.orbeMat.emissiveIntensity = e === "actuel" ? 1.1 : e === "fait" ? 0.6 : 0.1;
      d.anneau.material.opacity = e === "actuel" ? 0.9 : e === "fait" ? 0.35 : 0;
      if (d.banniere) d.banniere.visible = e !== "verrou" || prep;
    });
    ORDRE_RELIQUES.forEach((r) => { if (reliques3D[r]) reliques3D[r].visible = etat.reliques.includes(r); });
    const uFait = fractions[Math.min(fait, LIEUX.length - 1)];
    const c = new THREE.Color();
    pierreFrac.forEach((u, i) => { pierres.setColorAt(i, c.set(u <= uFait + 1e-4 ? 0xE8C050 : u <= fractions[Math.min(fait + 1, 16)] ? 0xE4DCC6 : 0x8E897F).convertSRGBToLinear()); });
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
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: dessin("halo"), color: lin(couleur), size: taille * 1.6, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }));
    scene.add(pts); particules.push({ pts, v, t0: performance.now(), gravite, vie });
  }

