/* ================= Carte 3D du domaine (three.js r128) ================= */
const Scene3D = (() => {
  const S = { ok: false };
  let renderer, scene, camera, controls, horloge;
  let chemin, cheminLong, echantillons = [], fractions = [];
  let pierres, pierreFrac = [];
  const marqueurs = [], cliquables = [], reliques3D = {};
  let equipe, hibou, faisceau, vif, saule, tentacule, lucioles, nuages = [];
  let ciel3D, soleil, hemi, etoiles;
  let anim = null, tween = null, particules = [];
  let survol = null, onClic = () => {}, onSurvol = () => {};
  const EAU = 0.15;
  const MONDE_RND = (graine) => { let a = graine; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const rnd = MONDE_RND(1337);
  const lisse = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const melange = (a, b, t) => a + (b - a) * t;

  /* Voie ferrée de Pré-au-Lard : la partie visible, du portail du tunnel au bout du quai */
  const RAIL_Y = 0.9;
  const VOIE = [[71, 29], [62, 26.4], [54, 24.3], [46, 22.4], [38, 20.7], [31.5, 19.5]];
  const VILLAGE = [[60.5, 20.6, 0.5], [57, 16.2, 0.1], [62.5, 16.8, -0.4], [53, 14.5, 0.8], [49, 12.5, 0.2], [58.5, 11.5, -0.3]];
  function distVoie(x, z) {
    let d = 1e9;
    for (let i = 0; i < VOIE.length - 1; i++) { const [ax, az] = VOIE[i], [bx, bz] = VOIE[i + 1]; const vx = bx - ax, vz = bz - az; const tr = ((x - ax) * vx + (z - az) * vz) / (vx * vx + vz * vz); if (i === 0 && tr < 0) continue; const t = Math.max(0, Math.min(1, tr)); d = Math.min(d, Math.hypot(x - ax - vx * t, z - az - vz * t)); }
    return d;
  }

  function hauteur(x, z) {
    let h = 0.9 * Math.sin(x * 0.07 + 1.3) * Math.cos(z * 0.06) + 0.5 * Math.sin(x * 0.15 + z * 0.12) + 0.3 * Math.cos(x * 0.23 - z * 0.19);
    const dc = Math.hypot(x / 1.25, z + 33);
    h += 7.5 * (1 - lisse(13, 17.5, dc));
    const dp = Math.hypot((x - 42) / 12, (z + 14) / 7);
    h = melange(h, 0.9, 1 - lisse(0.8, 1.25, dp));
    const dl = Math.hypot((x - 22) / 17, (z - 6) / 13);
    h = melange(h, -7, 1 - lisse(0.82, 1.12, dl));
    const r = Math.hypot(x, z + 5), ang = Math.atan2(z + 5, x);
    h += lisse(60, 96, r) * (20 + 9 * Math.sin(ang * 5) + 6 * Math.sin(ang * 11 + 1) + 3 * Math.sin(ang * 23));
    const dv = distVoie(x, z); if (dv < 9) h = melange(h, RAIL_Y - 0.12, 1 - lisse(2.4, 8.5, dv));
    const dg = Math.hypot((x - 42) / 8.5, (z - 17.6) / 4.2); if (dg < 1.3) h = melange(h, RAIL_Y - 0.08, 1 - lisse(0.75, 1.3, dg));
    return h;
  }
  const dansLac = (x, z) => Math.hypot((x - 22) / 17, (z - 6) / 13) < 1.02;
  const surPlateau = (x, z) => Math.hypot(x / 1.25, z + 33) < 17;

