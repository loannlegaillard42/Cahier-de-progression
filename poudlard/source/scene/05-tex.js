  /* ---------- Textures procédurales : tout est calculé ici, aucune image externe ---------- */
  let Q = "moyenne";                                   // qualité graphique : haute, moyenne ou basse
  const lin = (hex) => new THREE.Color(hex).convertSRGBToLinear();
  const bruit = (() => {                                // bruit de valeur 2D, périodique (motifs raccordables)
    const P = new Uint8Array(512), r = (() => { let a = 9001; return () => { a = (a * 1664525 + 1013904223) >>> 0; return a / 4294967296; }; })();
    for (let i = 0; i < 256; i++) P[i] = i;
    for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const t = P[i]; P[i] = P[j]; P[j] = t; }
    for (let i = 0; i < 256; i++) P[256 + i] = P[i];
    const h = (x, y, px, py) => P[P[((x % px) + px) % px & 255] + (((y % py) + py) % py & 255)] / 255;
    return (x, y, px = 256, py = px) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = h(xi, yi, px, py), b = h(xi + 1, yi, px, py), c = h(xi, yi + 1, px, py), d = h(xi + 1, yi + 1, px, py); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  })();
  const fbm = (x, y, oct = 4, px = 8, py = px) => { let s = 0, a = 0.5, n = 0; for (let o = 0; o < oct; o++) { s += a * bruit(x, y, px, py); n += a; a *= 0.5; x *= 2; y *= 2; px *= 2; py *= 2; } return s / n; };
  const hacher = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  /* Motifs : (u, v) dans [0,1[ → [hauteur 0..1, r, g, b] (couleurs sRGB 0..255) */
  const MOTIFS = {
    pierre(u, v) {                                      // pierre de taille : assises décalées, joints creusés
      const R = 8, rang = Math.floor(v * R), fy = v * R - rang; const C = 4 + (rang % 3 === 1 ? 1 : 0), dec = hacher(rang, 3) * 0.7 + (rang % 2) * 0.5;
      const x = u * C + dec, col = Math.floor(x), fx = x - col; const id = hacher(((col % C) + C) % C, rang * 7 + 1);
      const bord = Math.min(fx, 1 - fx) * (1 / C) * R, joint = Math.min(bord, Math.min(fy, 1 - fy));
      const grain = fbm(u * 24, v * 24, 4, 24), tache = fbm(u * 4 + 9, v * 4, 3, 4);
      const m = lisse(0.0, 0.055, joint); const h = m * (0.72 + id * 0.2 + grain * 0.14) + (1 - m) * 0.3;
      const t = (0.84 + id * 0.22) * (0.84 + grain * 0.28) * (0.82 + tache * 0.34) * (0.8 + 0.2 * m);
      return [h, 164 * t + (id - 0.5) * 14, 153 * t + (tache - 0.5) * 8, 132 * t - (id - 0.5) * 12];
    },
    ardoise(u, v) {                                     // toit d'ardoises : rangs qui se recouvrent
      const R = 10, rang = Math.floor(v * R), fy = v * R - rang, C = 7; const x = u * C + (rang % 2) * 0.5, col = Math.floor(x), fx = x - col;
      const id = hacher(((col % C) + C) % C, rang * 5 + 2), grain = fbm(u * 30, v * 30, 3, 30);
      const fente = lisse(0, 0.06, Math.min(fx, 1 - fx)), recouv = lisse(0, 0.12, fy);
      const h = (0.35 + 0.6 * (1 - fy)) * fente * (0.4 + 0.6 * recouv) + grain * 0.06;
      const t = (0.78 + id * 0.34) * (0.9 + grain * 0.2) * (0.5 + 0.5 * fente) * (0.6 + 0.4 * recouv);
      return [h, 78 * t, 84 * t + id * 4, 96 * t + id * 8];
    },
    bois(u, v) {                                        // planches verticales veinées
      const C = 5, x = u * C, col = Math.floor(x), fx = x - col, id = hacher(col, 4);
      const veine = fbm(u * 40 + col * 3, v * 5, 4, 40, 5), fente = lisse(0, 0.05, Math.min(fx, 1 - fx));
      const t = (0.75 + id * 0.3) * (0.72 + veine * 0.5) * (0.45 + 0.55 * fente);
      return [fente * (0.6 + veine * 0.3), 128 * t, 88 * t, 54 * t];
    },
    ecorce(u, v) {
      const n = fbm(u * 14, v * 3, 4, 14, 3), c = Math.abs(Math.sin((u * 9 + n * 1.6) * Math.PI)); const h = Math.pow(c, 0.6) * 0.8 + n * 0.2;
      const t = 0.5 + h * 0.6; return [h, 96 * t, 74 * t, 52 * t];
    },
    sol(u, v) {                                         // détail neutre du terrain (multiplie la couleur du relief)
      const a = fbm(u * 8, v * 8, 5, 8), b = fbm(u * 40 + 3, v * 40 + 7, 3, 40); const h = a * 0.65 + b * 0.35, t = 205 + h * 50;
      return [h, t, t, t];
    },
    roche(u, v) {
      const n = fbm(u * 6, v * 6, 5, 6), s = fbm(u * 3, v * 14 + n * 2.4, 4, 3, 14), cr = Math.abs(fbm(u * 10 + 5, v * 10, 3, 10) - 0.5) * 2; const h = s * 0.7 + n * 0.3 - (1 - lisse(0, 0.12, cr)) * 0.25;
      const t = 0.62 + h * 0.5; return [h, 148 * t, 142 * t, 132 * t];
    },
    colombage(u, v) {                                   // enduit clair et pans de bois
      const P = (d) => 1 - lisse(0.035, 0.05, d); const du = Math.min(u, 1 - u), dv = Math.min(v, 1 - v);
      const cu = (u * 2) % 1, cv = (v * 2) % 1, diag = Math.abs((Math.floor(u * 2) % 2 ? cu : 1 - cu) - cv) * 0.354;
      const poutre = Math.max(P(du), P(dv), P(Math.abs(u - 0.5)), P(Math.abs(v - 0.5)), v < 0.5 ? P(diag) : 0);
      const g = fbm(u * 30, v * 30, 3, 30), veine = fbm(u * 6, v * 50, 3, 6, 50);
      if (poutre > 0.5) { const t = 0.7 + veine * 0.5; return [0.75 + veine * 0.1, 78 * t, 54 * t, 36 * t]; }
      const t = 0.9 + g * 0.14; return [0.5 + g * 0.08, 226 * t, 214 * t, 190 * t];
    },
    chaume(u, v) {
      const n = fbm(u * 60, v * 6, 4, 60, 6), r = v * 6 - Math.floor(v * 6); const h = n * 0.6 + (1 - r) * 0.4, t = 0.6 + h * 0.55;
      return [h, 150 * t, 122 * t, 70 * t];
    },
    paves(u, v) {                                       // dallage irrégulier
      const C = 6, x = u * C + (Math.floor(v * C) % 2) * 0.5, col = Math.floor(x), rang = Math.floor(v * C), fx = x - col, fy = v * C - rang, id = hacher(col % C, rang + 11);
      const j = lisse(0.02, 0.1, Math.min(Math.min(fx, 1 - fx), Math.min(fy, 1 - fy))), g = fbm(u * 28, v * 28, 3, 28), t = (0.78 + id * 0.3) * (0.85 + g * 0.25) * (0.55 + 0.45 * j);
      return [j * (0.7 + id * 0.2), 150 * t, 144 * t, 132 * t];
    },
    eau(u, v) { const h = fbm(u * 5, v * 5, 5, 5) * 0.6 + fbm(u * 13 + 4, v * 13 + 2, 3, 13) * 0.4; return [h, 128, 128, 255]; },
  };
  const TEX = {};
  /* Renvoie { map, normalMap } pour un motif ; la carte de normales est déduite du relief. */
  function texture(nom, force = 2.2) {
    if (TEX[nom]) return TEX[nom];
    const N = { haute: 512, moyenne: 512, basse: 256 }[Q], f = MOTIFS[nom];
    const cc = document.createElement("canvas"), cn = document.createElement("canvas"); cc.width = cc.height = cn.width = cn.height = N;
    const gc = cc.getContext("2d"), gn = cn.getContext("2d"), ic = gc.createImageData(N, N), inn = gn.createImageData(N, N), H = new Float32Array(N * N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const r = f(x / N, y / N), i = (y * N + x) * 4; H[y * N + x] = r[0]; ic.data[i] = r[1]; ic.data[i + 1] = r[2]; ic.data[i + 2] = r[3]; ic.data[i + 3] = 255; }
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const dx = (H[y * N + ((x + 1) % N)] - H[y * N + ((x + N - 1) % N)]) * force, dy = (H[((y + 1) % N) * N + x] - H[((y + N - 1) % N) * N + x]) * force, l = Math.hypot(dx, dy, 1), i = (y * N + x) * 4;
      inn.data[i] = (-dx / l * 0.5 + 0.5) * 255; inn.data[i + 1] = (dy / l * 0.5 + 0.5) * 255; inn.data[i + 2] = (1 / l * 0.5 + 0.5) * 255; inn.data[i + 3] = 255;
    }
    gc.putImageData(ic, 0, 0); gn.putImageData(inn, 0, 0);
    const prep = (c, couleur) => { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = S.aniso || 1; if (couleur) t.encoding = THREE.sRGBEncoding; return t; };
    return (TEX[nom] = { map: prep(cc, true), normalMap: prep(cn, false) });
  }
  /* Textures dessinées (canvas 2D) */
  function toile(l, h, dessin, opts = {}) { const c = document.createElement("canvas"); c.width = l; c.height = h; dessin(c.getContext("2d"), l, h); const t = new THREE.CanvasTexture(c); t.encoding = THREE.sRGBEncoding; t.anisotropy = S.aniso || 1; if (opts.repete) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
  const DESSINS = {
    halo: () => toile(128, 128, (g) => { const d = g.createRadialGradient(64, 64, 2, 64, 64, 62); d.addColorStop(0, "rgba(255,255,255,1)"); d.addColorStop(0.25, "rgba(255,255,255,.55)"); d.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = d; g.fillRect(0, 0, 128, 128); }),
    nuage: () => toile(256, 256, (g) => { const r = MONDE_RND(31); for (let k = 0; k < 26; k++) { const x = 60 + r() * 136, y = 90 + r() * 90, ra = 28 + r() * 46, d = g.createRadialGradient(x, y, 2, x, y, ra); d.addColorStop(0, "rgba(255,255,255,.55)"); d.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = d; g.fillRect(0, 0, 256, 256); } }),
    /* fenêtre gothique à meneaux : claire sur fond transparent, pour l'émissif */
    fenetre: () => toile(64, 128, (g) => {
      g.clearRect(0, 0, 64, 128); g.beginPath(); g.moveTo(6, 126); g.lineTo(6, 46); g.quadraticCurveTo(6, 8, 32, 2); g.quadraticCurveTo(58, 8, 58, 46); g.lineTo(58, 126); g.closePath();
      const d = g.createLinearGradient(0, 0, 0, 128); d.addColorStop(0, "#FFE9A8"); d.addColorStop(1, "#F2A640"); g.fillStyle = d; g.fill();
      g.strokeStyle = "#3A2A18"; g.lineWidth = 3; g.stroke(); g.lineWidth = 2.4; g.beginPath(); g.moveTo(32, 4); g.lineTo(32, 126); for (const y of [46, 74, 100]) { g.moveTo(7, y); g.lineTo(57, y); } g.stroke();
    }),
    fenetreCarree: () => toile(64, 64, (g) => { const d = g.createLinearGradient(0, 0, 0, 64); d.addColorStop(0, "#FFE9A8"); d.addColorStop(1, "#F0A848"); g.fillStyle = d; g.fillRect(4, 4, 56, 56); g.strokeStyle = "#3A2A18"; g.lineWidth = 4; g.strokeRect(4, 4, 56, 56); g.beginPath(); g.moveTo(32, 4); g.lineTo(32, 60); g.moveTo(4, 32); g.lineTo(60, 32); g.stroke(); }),
    pelouse: () => toile(256, 256, (g) => { for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? "#5E9440" : "#6FA84A"; g.fillRect(k * 32, 0, 32, 256); } g.globalAlpha = 0.08; const r = MONDE_RND(5); for (let k = 0; k < 2500; k++) { g.fillStyle = r() > 0.5 ? "#fff" : "#000"; g.fillRect(r() * 256, r() * 256, 2, 2); } }),
  };
  function dessin(nom) { return TEX["d-" + nom] || (TEX["d-" + nom] = DESSINS[nom]()); }
