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
    marqueurs.forEach((m) => { const d = m.groupe.userData; if (!d.orbe) return; d.orbe.rotation.y = t * 0.8 + m.n; d.orbe.position.y = d.hOrbe + Math.sin(t * 1.6 + m.n) * 0.12 + (d.etat === "actuel" ? 0.15 : 0); if (d.lueur) d.lueur.position.y = d.orbe.position.y; if (d.etat === "actuel") d.anneau.scale.setScalar(1 + 0.12 * Math.sin(t * 3)); });
    ORDRE_RELIQUES.forEach((r) => { const o = reliques3D[r]; if (o && o.visible) { o.rotation.y = t * 0.9; } });
    if (faisceau.visible) faisceau.material.opacity = 0.16 + 0.08 * Math.sin(t * 2.4);
    if (vif && scn !== "vif") { vif.position.set(42 + Math.sin(t * 0.7) * 8, 4 + Math.sin(t * 1.9) * 1.5, -14 + Math.sin(t * 1.3) * 4); vif.children.forEach((c) => { if (c.userData.s) c.rotation.y = c.userData.s * Math.sin(t * 40) * 0.9; }); }
    if (saule) { const f = S.fureur || 0; saule.children.forEach((c, i) => { if (c.userData.base != null) c.rotation.x = c.userData.base + Math.sin(t * 1.1 + i) * 0.18 + f * Math.sin(t * 9 + i * 1.9) * 0.75; }); saule.rotation.y = f * Math.sin(t * 5) * 0.25; }
    if (tentacule) { const cyc = (t % 26) / 26; tentacule.position.y = cyc < 0.25 ? -4 + Math.sin(cyc / 0.25 * Math.PI) * 3.8 : -4; tentacule.rotation.y = t * 0.3; }
    if (lucioles) { const a = lucioles.geometry.attributes.position, b = lucioles.geometry.userData.base; for (let i = 0; i < a.count; i++) { a.array[i * 3 + 1] = b[i * 3 + 1] + Math.sin(t * 1.3 + i) * 0.4; a.array[i * 3] = b[i * 3] + Math.sin(t * 0.7 + i * 2) * 0.5; } a.needsUpdate = true; lucioles.material.opacity = 0.55 + 0.35 * Math.sin(t * 2); }
    if (S.haloLac) S.haloLac.material.opacity = 0.18 + 0.1 * Math.sin(t * 2.2);
    if (S.fumeeCabane && S.fumeeCabane.length) S.fumeeCabane.forEach((sp, i) => { const k = (t * 0.16 + i / S.fumeeCabane.length) % 1; sp.position.set(S.cheminee.x + k * 1.6 + Math.sin(t + i) * 0.15, S.cheminee.y + k * 4.2, S.cheminee.z + Math.sin(i * 2.1) * 0.3 * k); sp.scale.setScalar(0.6 + k * 2.6); sp.material.opacity = 0.42 * Math.sin(k * Math.PI) * (S.nuit ? 0.3 : 1); });
    if (S.drapeau) S.drapeau.rotation.y = Math.sin(t * 2) * 0.25;
    if (S.hippogriffe && scn !== "hippogriffe") S.hippogriffe.rotation.y = 0.8 + Math.sin(t * 0.4) * 0.6;
    if (scn !== "express") majFumees(dt, 1.2);
    nuages.forEach((n, i) => { const a = 0.0004 * n.userData.v; const x = n.position.x, z = n.position.z + 5; n.position.x = x * Math.cos(a) - z * Math.sin(a); n.position.z = x * Math.sin(a) + z * Math.cos(a) - 5; });
    for (let i = particules.length - 1; i >= 0; i--) { const pa = particules[i]; const age = (maint - pa.t0) / 1000; const a = pa.pts.geometry.attributes.position; pa.v.forEach((v, j) => { a.array[j * 3] += v.x * 0.016; a.array[j * 3 + 1] += (v.y - age * pa.gravite) * 0.016; a.array[j * 3 + 2] += v.z * 0.016; }); a.needsUpdate = true; pa.pts.material.opacity = Math.max(0, 1 - age / pa.vie); if (age > pa.vie) { scene.remove(pa.pts); pa.pts.geometry.dispose(); particules.splice(i, 1); } }
    if (!cine) controls.update();
    const sous = camera.position.y < EAU && dansLac(camera.position.x, camera.position.z);
    if (sous !== !!S.sous) { S.sous = sous; ambiance(sous ? "eau" : S.nuit ? "nuit" : "jour"); }
    majEau(t, dt);
    renderer.render(scene, camera);
  }

  function ecran(n) { const l = LIEUX[n]; const p = pointLieu(l); p.y += 3; p.project(camera); const r = renderer.domElement.getBoundingClientRect(); return { x: r.left + (p.x + 1) / 2 * r.width, y: r.top + (1 - p.y) / 2 * r.height, devant: p.z < 1 }; }

  function orbite(oui) { S.enOrbite = oui; if (oui && camera) { tween = null; S.angle = Math.atan2(camera.position.z + 2, camera.position.x - 4); } }
  return Object.assign(S, { __cam: () => ({ camera, controls }), __vue: (p, c) => { tween = null; anim = null; S.enOrbite = false; camera.position.set(p[0], p[1], p[2]); controls.target.set(c[0], c[1], c[2]); controls.update(); }, __info: () => ({ tri: renderer.info.render.triangles, appels: renderer.info.render.calls, q: Q, carte: S.carte }), __scene: () => cine && { id: cine.id, t: (performance.now() - cine.t0) / 1000 }, __aller: (t, gel) => { if (cine) { cine.t0 = performance.now() - t * 1000; S.gel = gel ? t : null; } },
    init, majEtat, avancer, viserLieu, survolGeneral, suivreEquipe, cinematique, eclat: (n) => { const p = pointLieu(LIEUX[n]); eclat(p.add(new THREE.Vector3(0, 3, 0)), 0xFFE3A0, 140); }, ecran, en: () => anim != null,
    jouerScene, passerScene: () => terminerScene(true), orbite });
})();
