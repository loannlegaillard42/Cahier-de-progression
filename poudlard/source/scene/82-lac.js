  /* ---------- Le fond du lac et le calmar géant ---------- */
  let calmarG, bras = [], algues, poissons = [], bulles, fondLac = -7;
  function construireLac() {
    fondLac = hauteur(23, 2);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(3.1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x5FD6A0, emissive: 0x2FAA72, emissiveIntensity: 1.1, transparent: true, opacity: 0.5, roughness: 0.05, envMapIntensity: 1.5 }));
    dome.position.set(23, fondLac + 0.1, 2); scene.add(dome);
    const socle = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.6, 0.6, 20), mat("pierreSombre")); socle.position.set(23, fondLac, 2); scene.add(socle);
    const colonne = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.65, -fondLac - 2.6, 10), mat("pierreSombre")); colonne.position.set(23, (fondLac + 3.1 + 0.35) / 2, 2); scene.add(colonne);
    const porte = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.6), new THREE.MeshBasicMaterial({ color: 0xB8FFD8 })); porte.position.set(23, fondLac + 0.9, 5.05); scene.add(porte);
    const n = 46; algues = new THREE.InstancedMesh(new THREE.ConeGeometry(0.16, 1, 7, 4), new THREE.MeshStandardMaterial({ color: 0x1F5A32 }), n); algues.userData.base = [];
    for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, r = 4.2 + rnd() * 7; const x = 23 + Math.cos(a) * r, z = 2 + Math.sin(a) * r; if (!dansLac(x, z)) { algues.userData.base.push(null); continue; } algues.userData.base.push([x, hauteur(x, z), z, 2.5 + rnd() * 3, rnd() * 6]); }
    majAlgues(0); scene.add(algues);
    const mp = new THREE.MeshStandardMaterial({ color: 0xBFD3DA, metalness: 0.6, roughness: 0.3 });
    for (let k = 0; k < 12; k++) { const p = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.5, 4), mp); p.rotation.x = Math.PI / 2; const g = new THREE.Group(); g.add(p); g.userData = { r: 4.5 + rnd() * 2.5, h: fondLac + 1.5 + rnd() * 3, v: 0.5 + rnd() * 0.4, p: rnd() * 6 }; scene.add(g); poissons.push(g); }
    const nbu = 70, pb = new Float32Array(nbu * 3); for (let i = 0; i < nbu; i++) { pb[i * 3] = 23 + (rnd() - 0.5) * 6; pb[i * 3 + 1] = fondLac + rnd() * 6; pb[i * 3 + 2] = 2 + (rnd() - 0.5) * 6; }
    const gb = new THREE.BufferGeometry(); gb.setAttribute("position", new THREE.BufferAttribute(pb, 3));
    bulles = new THREE.Points(gb, new THREE.PointsMaterial({ color: 0xDFFFF0, size: 0.14, transparent: true, opacity: 0.8, depthWrite: false })); scene.add(bulles);
    majPoissons(0);
    // le calmar géant
    calmarG = new THREE.Group(); const peau = new THREE.MeshStandardMaterial({ color: 0x8A4E7E, roughness: 0.28, metalness: 0.05, envMapIntensity: 1.3 });
    const manteau = new THREE.Mesh(new THREE.SphereGeometry(1.6, 30, 22), peau); manteau.scale.set(1, 2.2, 0.95); manteau.position.y = 3.6; calmarG.add(manteau);
    const nag = new THREE.Mesh(new THREE.ConeGeometry(1.4, 1.6, 4), peau); nag.scale.set(1.6, 1, 0.25); nag.position.y = 7.3; calmarG.add(nag);
    for (const s of [-1, 1]) {
      const oeil = new THREE.Mesh(new THREE.SphereGeometry(0.45, 12, 10), new THREE.MeshStandardMaterial({ color: 0xF4E7B0, emissive: 0x6A5A20, emissiveIntensity: 0.4 })); oeil.position.set(s * 0.95, 2.1, 1.0); calmarG.add(oeil);
      const pup = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), new THREE.MeshBasicMaterial({ color: 0x111111 })); pup.position.set(s * 1.08, 2.12, 1.36); calmarG.add(pup);
    }
    const ventouse = new THREE.MeshStandardMaterial({ color: 0xB06A98, roughness: 0.6 });
    for (let j = 0; j < 10; j++) {
      const longs = j >= 8; const segs = longs ? 16 : 11; const arm = [];
      for (let k = 0; k < segs; k++) { const r = (longs ? 0.3 : 0.4) * (1 - k / (segs + 2)); const sp = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 9), k % 3 === 2 ? ventouse : peau); calmarG.add(sp); arm.push(sp); }
      bras.push({ arm, ang: longs ? (j === 8 ? 0.9 : -0.9) + Math.PI / 2 : (j / 8) * Math.PI * 2, longs, j });
    }
    calmarG.position.set(16, -12, 11); calmarG.visible = false; scene.add(calmarG);
    S.rides = [0, 1, 2].map(() => { const r = new THREE.Mesh(new THREE.RingGeometry(0.9, 1.15, 40), new THREE.MeshBasicMaterial({ color: 0xDCEBFF, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); r.rotation.x = -Math.PI / 2; r.position.set(16, EAU + 0.03, 11); scene.add(r); return r; });
  }
  function majAlgues(t) {
    const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), s = new THREE.Vector3(), v = new THREE.Vector3();
    algues.userData.base.forEach((b, i) => { if (!b) { m.makeScale(0, 0, 0); algues.setMatrixAt(i, m); return; } const [x, y, z, h, ph] = b; e.set(Math.sin(t * 1.3 + ph) * 0.18, 0, Math.cos(t * 1.1 + ph) * 0.18); q.setFromEuler(e); s.set(1, h, 1); v.set(x, y + h / 2, z); m.compose(v, q, s); algues.setMatrixAt(i, m); });
    algues.instanceMatrix.needsUpdate = true;
  }
  function majPoissons(t) { poissons.forEach((g) => { const d = g.userData; const a = t * d.v + d.p; g.position.set(23 + Math.cos(a) * d.r, d.h + Math.sin(t * 1.4 + d.p) * 0.3, 2 + Math.sin(a) * d.r); g.rotation.y = -a; }); }
  function majCalmar(t, hauteurSortie, salut) {
    calmarG.position.y = hauteurSortie; calmarG.rotation.y = -0.98 + Math.sin(t * 0.4) * 0.12;
    bras.forEach((b) => {
      const dir = new THREE.Vector3(Math.sin(b.ang), 0, Math.cos(b.ang)); let phi = b.longs ? 0.9 + (b.j === 8 ? salut * 0.6 : 0) : -0.25; const p = new THREE.Vector3(dir.x * 0.9, 0.9, dir.z * 0.9);
      b.arm.forEach((sp, k) => { phi += (b.longs ? 0.16 : 0.2) * Math.sin(t * 2.2 + b.j * 1.3 - k * 0.55) + (b.longs ? -0.05 : 0.03); const pas = b.longs ? 0.42 : 0.4; p.x += dir.x * Math.cos(phi) * pas; p.z += dir.z * Math.cos(phi) * pas; p.y += Math.sin(phi) * pas; sp.position.copy(p); });
    });
  }

