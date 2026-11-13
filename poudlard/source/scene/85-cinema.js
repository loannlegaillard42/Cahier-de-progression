  /* ---------- Scénographies : caméra sur rails, sous-titres, sons ---------- */
  let cine = null;
  const V3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  function ailesHippo(angle, ouverture) { S.hippogriffe.userData.ailes.forEach((p) => { p.rotation.x = -p.userData.s * angle; p.scale.z = ouverture; }); }
  function vifSur(courbe, u, t) { const p = courbe.getPointAt(Math.min(1, Math.max(0, u))); vif.position.copy(p); vif.children.forEach((c) => { if (c.userData.s) c.rotation.y = c.userData.s * Math.sin(t * 40) * 0.9; }); }
  const COULEURS_FEUX = [0xFF8A7A, 0xA9C0FF, 0xFFD45E, 0x74E3A6, 0xFFE3A0];

  const SCENES = {
    express: {
      duree: 34,
      textes: [[0.8, 6.2, "1er septembre. Le Poudlard Express file à travers les montagnes…"], [7.5, 12.6, "Gare de Pré-au-Lard. Tout le monde descend !"], [13.4, 19, "« Les première année, par ici ! » Hagrid les attend au bord du lac."], [19.6, 26.4, "En barque, on traverse le lac noir… et soudain, le château apparaît."], [27.6, 34, (o) => `Bienvenue à Poudlard${o.classe ? ", " + o.classe : ""} !`]],
      sons: [[1.2, "sifflet"], [10.6, "sifflet"], [27.6, "fanfare"]],
      cles() {
        const sP = uPortail * voieLong;
        const pv = (s, lat, h) => { const u = Math.min(1, Math.max(0, s / voieLong)); const p = voie.getPointAt(u), l = lateral(voie.getTangentAt(u)); return [p.x + l.x * lat, p.y + h, p.z + l.z * lat]; };
        const K = [{ t: 0, p: pv(sP + 15, -4, 5.5), c: pv(sP, 0, 2.8) }, { t: 3, p: pv(sP + 13, -5.5, 3.6), c: pv(sP + 3, 0, 2) }, { t: 5.5, p: pv(sP + 19, -6.5, 4.5), c: pv(sP + 28, 0, 1.5) }, { t: 8.5, p: pv(sP + 27, -7.5, 6), c: pv(sP + 37, 1.5, 1.5) },
          { t: 11.5, p: [53, 6.5, 33.5], c: [43, 1.6, 21] }, { t: 15.5, p: [47.5, 10, 29], c: [36, 0.8, 14] }];
        const r = barques[0].userData.route;
        [19.5, 22.5, 25.5, 28.5].forEach((t, k) => { const p = r.getPointAt(lisse(18.4, 30.6, t)); K.push({ t, p: k ? [p.x + 8, p.y + 3.2, p.z + 6.6] : [p.x + 3, p.y + 5.5, p.z + 7], c: [p.x - 12, p.y - 1.4 + k * 1.7, p.z - 11] }); });
        K.push({ t: 34, p: [10, 16, 1], c: [0, 9, -22] }); return K;
      },
      debut(ctx) { ctx.s0 = sTrainGare() - 56; },
      maj(t, ctx, dt) {
        const k = Math.min(1, t / 11.5); placerTrain(ctx.s0 + (sTrainGare() - ctx.s0) * (1 - (1 - k) * (1 - k)));
        majFumees(dt, k < 1 ? 10 : 2.5);
        const [a, b] = PONTON;
        foule.forEach((s, i) => {
          const vis = t > 12.2 && t < 18.5; s.visible = vis; if (!vis) return;
          const u = uQuai0 + (uQuai1 - uQuai0) * (0.12 + (i / foule.length) * 0.7); const p = voie.getPointAt(u), l = lateral(voie.getTangentAt(u));
          const x0 = p.x + l.x * 1.9, z0 = p.z + l.z * 1.9, dec = ((i % 3) - 1) * 0.45;
          const k1 = lisse(12.8 + (i % 4) * 0.15, 16.2, t), k2 = lisse(16.2, 18.4, t);
          const x1 = a[0] + dec, z1 = a[1] + 0.4, x2 = a[0] + (b[0] - a[0]) * 0.8 + dec, z2 = a[1] + (b[1] - a[1]) * 0.8;
          const x = k2 > 0 ? melange(x1, x2, k2) : melange(x0, x1, k1), z = k2 > 0 ? melange(z1, z2, k2) : melange(z0, z1, k1);
          const vx = k2 > 0 ? x2 - x1 : x1 - x0, vz = k2 > 0 ? z2 - z1 : z1 - z0;
          s.position.set(x, melange(RAIL_Y + 0.4, EAU + 0.55, k1) + Math.abs(Math.sin(t * 9 + i)) * 0.08, z); s.rotation.y = Math.atan2(vx, vz);
        });
        barques.forEach((bq, i) => { placerBarque(bq, lisse(18.4 + i * 0.35, 30.6 + i * 0.35, t), t); bq.userData.passagers.visible = t > 18.3; });
        hagrid.visible = t < 18.3;
      },
      fin() { hagrid.visible = true; placerTrain(sTrainGare()); foule.forEach((s) => (s.visible = false)); barques.forEach((bq) => { placerBarque(bq, 0, 0); bq.userData.passagers.visible = false; }); },
    },
    hippogriffe: {
      duree: 16,
      textes: [[0.5, 4.2, "L'équipe salue Buck… et Buck s'incline à son tour !"], [4.6, 11.6, "Accrochez-vous : l'hippogriffe s'envole au-dessus du domaine !"], [12.4, 16, "Atterrissage en douceur. Buck a accepté l'équipe."]],
      sons: [[3.4, "magie"], [12.6, "tinte"]],
      debut(ctx) {
        const h = S.hippogriffe, p0 = h.position.clone(); ctx.p0 = p0; ctx.r0 = h.rotation.y;
        ctx.vol = new THREE.CatmullRomCurve3([[0, 0, 0], [4, 3, -4], [13, 10, -12], [29, 15, -18], [47, 16, -12], [57, 13, 0], [43, 11, 14], [21, 10, 16], [7, 5, 8], [1, 1.2, 2], [0, 0, 0]].map(([x, y, z]) => new THREE.Vector3(p0.x + x, p0.y + y, p0.z + z)), false, "centripetal");
      },
      cles(ctx) {
        const p0 = ctx.p0, K = [{ t: 0, p: [p0.x + 5, p0.y + 3.2, p0.z + 3.5], c: [p0.x, p0.y + 1.5, p0.z] }, { t: 3, p: [p0.x + 4, p0.y + 2.4, p0.z + 2.4], c: [p0.x, p0.y + 1.6, p0.z] }];
        for (const t of [6, 7.5, 9, 10.5, 12]) { const u = lisse(4, 12.5, t), p = ctx.vol.getPoint(u), d = ctx.vol.getTangent(u); K.push({ t, p: [p.x - d.x * 8, p.y - d.y * 8 + 3.5, p.z - d.z * 8], c: [p.x + d.x * 3, p.y + d.y * 3 + 0.6, p.z + d.z * 3] }); }
        K.push({ t: 14, p: [p0.x + 5.5, p0.y + 4, p0.z + 3], c: [p0.x, p0.y + 1.4, p0.z] }, { t: 16, p: [p0.x + 6.5, p0.y + 4.6, p0.z + 4], c: [p0.x, p0.y + 1.4, p0.z] });
        return K;
      },
      maj(t, ctx) {
        const h = S.hippogriffe; const u = lisse(4, 12.5, t);
        const salut = t > 0.6 && t < 2.8 ? Math.sin(Math.PI * (t - 0.6) / 2.2) : 0; h.userData.corps.rotation.z = -0.4 * salut;
        const f = lisse(3, 4.2, t) * (1 - lisse(12.4, 13.6, t)); ailesHippo(melange(-0.9, 0.15 + 0.7 * Math.sin(t * 8), f), melange(0.35, 1, f));
        if (u > 0 && u < 1) { const p = ctx.vol.getPoint(u), d = ctx.vol.getTangent(u); h.position.copy(p); h.rotation.set(0, Math.atan2(-d.z, d.x), Math.asin(Math.max(-0.6, Math.min(0.6, d.y))) * 0.8); }
        else { h.position.copy(ctx.p0); h.rotation.set(0, ctx.r0, 0); }
      },
      fin(ctx) { const h = S.hippogriffe; h.position.copy(ctx.p0); h.rotation.set(0, ctx.r0, 0); h.userData.corps.rotation.z = 0; ailesHippo(-0.9, 0.35); },
    },
    saule: {
      duree: 9.5,
      textes: [[0.4, 4.6, "Attention ! Le Saule cogneur n'aime pas du tout les visiteurs…"], [5, 9.5, "Pour l'approcher, il faudra trouver le nœud secret de son tronc."]],
      sons: [[1.2, "grave"], [3.6, "grave"]],
      cles: [{ t: 0, p: [2, 9, 41], c: [-8, 4, 28.5] }, { t: 3, p: [-2.5, 5, 35.5], c: [-8, 4.2, 28.5] }, { t: 6.5, p: [-13, 4.6, 35.5], c: [-8, 4, 28.5] }, { t: 9.5, p: [-6, 8, 40], c: [-8, 3, 27] }],
      maj(t, ctx) {
        S.fureur = lisse(0.8, 1.8, t) * (1 - lisse(7.2, 9, t));
        for (const [k, tt] of [[1, 2], [2, 3.6], [3, 5.2]]) if (t > tt && !ctx["f" + k]) { ctx["f" + k] = true; eclat(saule.position.clone().add(new THREE.Vector3(0, 5.5, 0)), 0x7FB85A, 70, { taille: 0.3 }); }
      },
      secousse: () => (S.fureur || 0) * 0.12,
      fin() { S.fureur = 0; },
    },
    calmar: {
      duree: 15,
      textes: [[0.5, 4.6, "Les eaux du lac noir se mettent à bouillonner…"], [5.4, 10.6, "Le calmar géant ! Il fixe l'équipe de ses yeux immenses…"], [11, 15, "…puis il replonge lentement. Que cache-t-il au fond du lac ?"]],
      sons: [[2.6, "vague"], [11.6, "vague"]],
      cles: [{ t: 0, p: [-3, 11, 31], c: [8, 1, 17] }, { t: 3.5, p: [1, 4.8, 26], c: [15, 2.5, 12] }, { t: 7.5, p: [7, 3.2, 19.5], c: [16, 4, 11] }, { t: 11, p: [5, 3.6, 21.5], c: [16, 3, 11] }, { t: 15, p: [-1, 7, 28], c: [12, 0.5, 13] }],
      debut() { calmarG.visible = true; },
      maj(t, ctx) {
        const y = melange(-12, -0.9, lisse(2.2, 5.5, t)) + melange(0, -11, lisse(11, 14.5, t)) + Math.sin(t * 1.3) * 0.15;
        majCalmar(t, y, lisse(6.5, 7.5, t) * (1 - lisse(9.5, 10.5, t)) * Math.sin(t * 6));
        S.rides.forEach((r, i) => { const k = (t - 2.2 - i * 0.7) / 2.1 - Math.floor((t - 2.2 - i * 0.7) / 2.1); const on = t > 2.2 + i * 0.7 && t < 13.5; r.material.opacity = on ? 0.6 * (1 - k) : 0; r.scale.setScalar(2 + k * 7); });
        if (t > 3.2 && !ctx.g1) { ctx.g1 = true; eclat(new THREE.Vector3(16, 1, 11), 0xCFE8FF, 220, { taille: 0.3, force: 1.2 }); }
        if (t > 12 && !ctx.g2) { ctx.g2 = true; eclat(new THREE.Vector3(16, 0.6, 11), 0xCFE8FF, 140, { taille: 0.28, force: 0.9 }); }
      },
      fin() { calmarG.visible = false; S.rides.forEach((r) => (r.material.opacity = 0)); },
    },
    plongee: {
      duree: 15,
      textes: [[0.5, 4.4, "Une Branchiflore chacun… et l'équipe plonge dans le lac noir !"], [5, 9.6, "Sous l'eau, les algues ondulent et les poissons tournent en rond…"], [10, 15, "Au fond, une salle de verre brille d'une lueur verte. L'entrée est là."]],
      sons: [[3.7, "vague"]],
      cles() { const F = fondLac; return [{ t: 0, p: [33, 10, 16], c: [23, 0, 2] }, { t: 3, p: [26, 3, 8.5], c: [23, -1, 3] }, { t: 5, p: [24.5, -1.2, 8.2], c: [23, F + 2.5, 3] }, { t: 8, p: [30.5, F + 3.4, 7.5], c: [23, F + 1.5, 2] }, { t: 11.5, p: [16, F + 3, 8.5], c: [23, F + 1.2, 2] }, { t: 15, p: [23, F + 2.1, 10.8], c: [23, F + 0.9, 4.8] }]; },
      maj(t, ctx, dt) {
        majAlgues(t); majPoissons(t);
        const a = bulles.geometry.attributes.position; for (let i = 0; i < a.count; i++) { a.array[i * 3 + 1] += dt * (0.8 + (i % 5) * 0.15); if (a.array[i * 3 + 1] > EAU - 0.1) a.array[i * 3 + 1] = fondLac + 0.5; } a.needsUpdate = true;
        if (t > 3.9 && !ctx.g) { ctx.g = true; eclat(new THREE.Vector3(24.8, 0.4, 8), 0xDCEBFF, 160, { taille: 0.26 }); }
      },
    },
    vif: {
      duree: 9.5,
      textes: [[0.3, 4.3, "Le Vif d'or ensorcelé file à travers le terrain de Quidditch…"], [4.7, 9.5, "…il traverse les anneaux ! Impossible de l'attraper sans ruse."]],
      sons: [[0.3, "magie"], [4.4, "magie"]],
      debut(ctx) { ctx.vol = new THREE.CatmullRomCurve3([[30, 5, -4], [37, 8, -11], [45, 6.5, -16.5], [48.5, 7.6, -14.2], [51.6, 7.7, -14], [56, 7.7, -13.8], [57, 10, -8], [47, 4.5, -7.5], [37, 6, -17], [42, 4, -14]].map(V3), false, "centripetal"); },
      cles(ctx) {
        const K = []; for (let t = 0; t <= 8.51; t += 0.85) { const u = Math.min(1, t / 8.6), p = ctx.vol.getPointAt(u), d = ctx.vol.getTangentAt(u); K.push({ t, p: [p.x - d.x * 3, p.y - d.y * 3 + 0.7, p.z - d.z * 3], c: [p.x + d.x * 1.5, p.y + d.y * 1.5, p.z + d.z * 1.5] }); }
        K.push({ t: 9.5, p: [35, 9, -3], c: [42, 4, -14] }); return K;
      },
      maj(t, ctx) { vifSur(ctx.vol, t / 8.6, t); },
    },
    feux: {
      duree: 13,
      textes: [[0.5, 5, "Les quatre reliques brillent à nouveau sur le château…"], [5.5, 13, "Poudlard est sauvé ! Place à la fête !"]],
      cles: [{ t: 0, p: [30, 13, 16], c: [-2, 22, -33] }, { t: 13, p: [19, 15, 6], c: [-2, 25, -33] }],
      debut() { S.nuit = true; ambiance("nuit"); },
      fin() { S.nuit = false; ambiance("jour"); },
      maj(t, ctx) {
        if (ctx.prochain == null) { ctx.prochain = 0.8; ctx.k = 0; }
        while (t >= ctx.prochain && t < 11.5) {
          eclat(new THREE.Vector3(-16 + Math.random() * 32, 32 + Math.random() * 12, -46 + Math.random() * 24), COULEURS_FEUX[ctx.k % 5], 220, { taille: 1.5, force: 1.8, gravite: 1.2, vie: 2.8, sphere: true });
          if (ctx.k % 2 === 0 && ctx.opts.son) ctx.opts.son("feu");
          ctx.k++; ctx.prochain += 0.42 + Math.random() * 0.3;
        }
      },
    },
  };

  function jouerScene(id, opts = {}) {
    const def = SCENES[id];
    if (!S.ok || !def) { if (opts.fin) opts.fin(); return; }
    if (cine) terminerScene(false);
    anim = null; tween = null; S.enOrbite = false;
    const ctx = { opts };
    if (def.debut) def.debut(ctx);
    const cles = typeof def.cles === "function" ? def.cles(ctx) : def.cles;
    marqueurs.forEach((m) => (m.groupe.visible = false)); ctx.faisceau = faisceau.visible; faisceau.visible = false;
    cine = { id, def, ctx, cles, t0: performance.now(), courbeP: new THREE.CatmullRomCurve3(cles.map((k) => V3(k.p)), false, "centripetal"), courbeC: new THREE.CatmullRomCurve3(cles.map((k) => V3(k.c)), false, "centripetal"), texte: -1, son: 0 };
    controls.enabled = false; camera.fov = 52; camera.updateProjectionMatrix();
  }
  function terminerScene(appeler) {
    const c = cine; if (!c) return; cine = null; S.gel = null;
    if (c.def.fin) c.def.fin(c.ctx);
    marqueurs.forEach((m) => (m.groupe.visible = true)); faisceau.visible = c.ctx.faisceau;
    const k = c.cles[c.cles.length - 1]; camera.position.copy(V3(k.p)); controls.target.copy(V3(k.c)); controls.enabled = true; camera.fov = 45; camera.updateProjectionMatrix();
    if (c.ctx.opts.texte) c.ctx.opts.texte(null);
    if (appeler && c.ctx.opts.fin) c.ctx.opts.fin();
  }
  function majScene(maint, dt) {
    const c = cine; const t = S.gel != null ? S.gel : (maint - c.t0) / 1000; const cl = c.cles, n1 = cl.length - 1;
    let i = 0; while (i < n1 - 1 && t >= cl[i + 1].t) i++;
    const x = Math.min(1, Math.max(0, (t - cl[i].t) / (cl[i + 1].t - cl[i].t)));
    const f = n1 === 1 ? ease(x) : i === 0 ? x * x * (2 - x) : i === n1 - 1 ? x + x * x - x * x * x : x;
    const u = Math.min(1, (i + f) / n1);
    camera.position.copy(c.courbeP.getPoint(u)); const cible = c.courbeC.getPoint(u);
    if (c.def.secousse) { const s = c.def.secousse(t); camera.position.x += (Math.random() - 0.5) * s; camera.position.y += (Math.random() - 0.5) * s; }
    controls.target.copy(cible); camera.lookAt(cible);
    if (c.def.maj) c.def.maj(t, c.ctx, dt);
    if (cine !== c) return;
    const tx = (c.def.textes || []).findIndex(([a, b]) => t >= a && t < b);
    if (tx !== c.texte) { c.texte = tx; const o = c.ctx.opts; if (o.texte) { const v = tx >= 0 ? c.def.textes[tx][2] : null; o.texte(typeof v === "function" ? v(o) : v); } }
    const sons = c.def.sons || []; while (c.son < sons.length && t >= sons[c.son][0]) { if (c.ctx.opts.son) c.ctx.opts.son(sons[c.son][1]); c.son++; }
    if (t >= c.def.duree) terminerScene(true);
  }

