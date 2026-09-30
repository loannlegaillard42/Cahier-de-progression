/* Vézelay, 31 mars 1146 — ambiance sonore fabriquée dans le navigateur (Web Audio) : vent, oiseaux, rumeur de la foule,
   cloches de l'abbaye, cris « Des croix ! », chant des moines sous les voûtes. Rien n'est téléchargé.
   Le son est coupé par défaut ; le choix de l'élève est mémorisé dans le navigateur. */
(function () {
  'use strict';
  const CLE = 'vezelay1146-son';
  const Son = { actif: false };
  let ctx = null, maitre = null, reverb = null, bruitRose = null, bruitBrun = null, babils = [];
  const pistes = {}, cibles = { vent: 0, oiseaux: 0, foule: 0, chant: 0 };
  let lieu = 'route', sourdine = 1, minuteurOiseaux = null, minuteurChant = null, prochainChant = 0;

  // niveaux de chaque piste selon le lieu
  const LIEUX = {
    route: { vent: 0.55, oiseaux: 1, foule: 0.06, chant: 0 },
    basilique: { vent: 0.25, oiseaux: 0.35, foule: 0.35, chant: 0.05 },
    bourg: { vent: 0.3, oiseaux: 0.45, foule: 0.4, chant: 0 },
    champ: { vent: 0.4, oiseaux: 0.55, foule: 0.65, chant: 0 },
    estrade: { vent: 0.3, oiseaux: 0.35, foule: 0.85, chant: 0 },
    foule: { vent: 0.3, oiseaux: 0.3, foule: 1, chant: 0 },
    interieur: { vent: 0.04, oiseaux: 0, foule: 0.08, chant: 1 },
    carte: { vent: 0.12, oiseaux: 0, foule: 0, chant: 0 },
    silence: { vent: 0, oiseaux: 0, foule: 0, chant: 0 }
  };

  function lireChoix() { try { return localStorage.getItem(CLE) === '1'; } catch (e) { return false; } }
  function ecrireChoix(v) { try { localStorage.setItem(CLE, v ? '1' : '0'); } catch (e) { /* stockage indisponible */ } }
  function tampon(sec, canaux, fn) {
    const b = ctx.createBuffer(canaux, Math.floor(ctx.sampleRate * sec), ctx.sampleRate);
    for (let c = 0; c < canaux; c++) fn(b.getChannelData(c), ctx.sampleRate, c);
    return b;
  }
  function boucle(buf, rate, depart) {
    const s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.playbackRate.value = rate || 1;
    s.start(0, depart || 0); return s;
  }
  function filtre(type, f, q) { const b = ctx.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q || 0.7; return b; }
  function gain(v) { const g = ctx.createGain(); g.gain.value = v; return g; }
  function lfo(freq, profondeur, param) { const o = ctx.createOscillator(), g = gain(profondeur); o.frequency.value = freq; o.connect(g); g.connect(param); o.start(); return o; }

  /* ---------- Préparation du graphe (au premier clic : les navigateurs l'exigent) ---------- */
  function preparer() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    ctx = new AC();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(ctx.destination);
    maitre = gain(0); maitre.connect(comp);
    // bruits de base
    bruitRose = tampon(5, 1, d => {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < d.length; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926;
      }
    });
    bruitBrun = tampon(6, 2, d => { let v = 0; for (let i = 0; i < d.length; i++) { v = (v + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[i] = v * 3.2; } });
    // babil : bruit découpé en syllabes (3 à 6 par seconde), pour la rumeur d'une foule qui parle
    for (let k = 0; k < 3; k++) babils.push(tampon(5, 1, (d, sr) => {
      let env = 0, cible = 0, prochain = 0, f1 = 0, f2 = 0;
      for (let i = 0; i < d.length; i++) {
        if (i >= prochain) { cible = Math.random() < 0.25 ? 0.05 : 0.4 + Math.random() * 0.6; prochain = i + sr * (0.08 + Math.random() * 0.22); }
        env += (cible - env) * 0.0022;
        const w = Math.random() * 2 - 1; f1 += (w - f1) * 0.22; f2 += (f1 - f2) * 0.22;
        d[i] = f2 * env * 2.6;
      }
      const n = Math.floor(sr * 0.05); for (let i = 0; i < n; i++) { const t = i / n; d[i] = d[i] * t + d[d.length - n + i] * (1 - t); } // raccord de la boucle
    }));
    // réverbération d'une grande nef romane : réponse impulsionnelle de 4 s
    reverb = ctx.createConvolver();
    reverb.buffer = tampon(4, 2, (d, sr) => { for (let i = 0; i < d.length; i++) { const t = i / sr; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t / 4, 2.2) * (t < 0.012 ? t / 0.012 : 1) * 0.6; } });
    const rv = gain(0.9); reverb.connect(rv); rv.connect(maitre);
    for (const k in cibles) { pistes[k] = gain(0); pistes[k].connect(maitre); }
    // vent : bruit brun filtré, en rafales lentes
    const v = boucle(bruitBrun, 1), fv = filtre('lowpass', 420, 0.5), gv = gain(0.55);
    v.connect(fv); fv.connect(gv); gv.connect(pistes.vent);
    lfo(0.07, 0.3, gv.gain); lfo(0.11, 180, fv.frequency);
    const v2 = boucle(bruitRose, 0.5, 1.3), fv2 = filtre('bandpass', 900, 0.6), gv2 = gain(0.05); v2.connect(fv2); fv2.connect(gv2); gv2.connect(pistes.vent); lfo(0.05, 0.04, gv2.gain);
    // rumeur de la foule : plusieurs babils décalés, filtrés comme des voix
    for (let k = 0; k < 6; k++) {
      const s = boucle(babils[k % 3], 0.85 + k * 0.06, k * 0.7), f1 = filtre('bandpass', 420 + k * 70, 1.1), f2 = filtre('peaking', 1500 + k * 120, 1.2), p = ctx.createStereoPanner ? ctx.createStereoPanner() : null, g = gain(0.34);
      f2.gain.value = 6;
      s.connect(f1); f1.connect(f2); f2.connect(g);
      if (p) { p.pan.value = -0.8 + k * 0.32; g.connect(p); p.connect(pistes.foule); } else g.connect(pistes.foule);
      lfo(0.13 + k * 0.03, 0.12, g.gain);
    }
    const fondFoule = boucle(bruitRose, 1, 2), ff = filtre('lowpass', 700, 0.5), gf = gain(0.25); fondFoule.connect(ff); ff.connect(gf); gf.connect(pistes.foule);
    // le chant des moines passe par la réverbération
    const envoi = gain(0.75); pistes.chant.connect(envoi); envoi.connect(reverb);
    document.addEventListener('visibilitychange', () => { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (Son.actif) ctx.resume(); });
    return true;
  }

  /* ---------- Oiseaux : merles, pinsons, mésanges ---------- */
  function oiseau() {
    if (!ctx || !Son.actif || cibles.oiseaux * sourdine < 0.05) return;
    const t0 = ctx.currentTime + 0.05, o = ctx.createOscillator(), g = gain(0), p = ctx.createStereoPanner ? ctx.createStereoPanner() : null, r = Math.random();
    o.type = 'sine';
    if (r < 0.4) { // merle : phrase flûtée
      let t = t0; for (let k = 0; k < 4 + Math.floor(Math.random() * 4); k++) { const f = 1400 + Math.random() * 1300, d = 0.07 + Math.random() * 0.12; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * (0.8 + Math.random() * 0.5), t + d); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.06, t + 0.015); g.gain.linearRampToValueAtTime(0, t + d); t += d + 0.03 + Math.random() * 0.06; }
      o.start(t0); o.stop(t + 0.1);
    } else if (r < 0.75) { // pinson : trille descendant
      let t = t0; const n = 8 + Math.floor(Math.random() * 6);
      for (let k = 0; k < n; k++) { const f = 4600 - k * 170 + Math.random() * 200; o.frequency.setValueAtTime(f, t); o.frequency.exponentialRampToValueAtTime(f * 0.7, t + 0.045); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.025, t + 0.008); g.gain.linearRampToValueAtTime(0, t + 0.045); t += 0.06; }
      o.start(t0); o.stop(t + 0.1);
    } else { // mésange : « ti-tu, ti-tu »
      let t = t0; for (let k = 0; k < 3; k++) [6200, 4300].forEach(f => { o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.02, t + 0.01); g.gain.linearRampToValueAtTime(0, t + 0.09); t += 0.13; });
      o.start(t0); o.stop(t + 0.1);
    }
    o.connect(g); if (p) { p.pan.value = Math.random() * 1.6 - 0.8; g.connect(p); p.connect(pistes.oiseaux); } else g.connect(pistes.oiseaux);
  }
  function planifierOiseaux() {
    clearTimeout(minuteurOiseaux);
    const suite = () => { oiseau(); minuteurOiseaux = setTimeout(suite, 700 + Math.random() * 2600 / Math.max(0.3, cibles.oiseaux)); };
    minuteurOiseaux = setTimeout(suite, 400);
  }

  /* ---------- Chant des moines : une mélodie grégorienne (mode de ré), à l'unisson ---------- */
  const MELODIE = [[50, 1], [52, 1], [53, 1], [55, 2], [53, 1], [52, 1], [50, 2], [0, 1], [53, 1], [55, 1], [57, 2], [55, 1], [57, 1], [60, 1], [57, 2], [55, 1], [53, 1], [55, 1], [52, 2], [50, 3], [0, 2],
    [57, 1], [57, 1], [55, 1], [57, 1], [60, 2], [59, 1], [57, 1], [55, 2], [53, 1], [55, 1], [53, 1], [52, 1], [50, 3], [0, 3]];
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  function phraseChant(t0) {
    const temps = 0.5, voix = [[0, -4, 0.2], [0, 5, -0.3], [-12, 2, 0.05]]; // décalage (demi-tons), désaccord (cents), panoramique
    const formants = [[700, 5, 1], [1150, 7, 0.45], [2700, 9, 0.2]];
    const bus = gain(1), sortie = gain(2.3); sortie.connect(pistes.chant);
    formants.forEach(([f, q, a]) => { const b = filtre('bandpass', f, q), g = gain(a * 2.2); bus.connect(b); b.connect(g); g.connect(sortie); }); // voyelle « a »
    let t = t0;
    for (const [m, d] of MELODIE) {
      const duree = d * temps;
      if (m) voix.forEach(([dec, cents, pan], k) => {
        const o = ctx.createOscillator(), g = gain(0), v = ctx.createOscillator(), vg = gain(5);
        o.type = 'sawtooth'; o.frequency.value = hz(m + dec); o.detune.value = cents;
        v.frequency.value = 4.6 + k * 0.4; v.connect(vg); vg.connect(o.detune);
        const a = k === 2 ? 0.05 : 0.07;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(a, t + 0.09); g.gain.setValueAtTime(a, t + duree - 0.06); g.gain.linearRampToValueAtTime(0, t + duree + 0.05);
        o.connect(g); if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; g.connect(p); p.connect(bus); } else g.connect(bus);
        o.start(t); o.stop(t + duree + 0.08); v.start(t); v.stop(t + duree + 0.08);
      });
      t += duree;
    }
    return t;
  }
  function planifierChant() {
    clearTimeout(minuteurChant);
    const suite = () => {
      if (!ctx || !Son.actif) return;
      if (cibles.chant * sourdine > 0.02 && prochainChant < ctx.currentTime + 1) prochainChant = phraseChant(Math.max(ctx.currentTime + 0.1, prochainChant)) + 1.5;
      minuteurChant = setTimeout(suite, 1000);
    };
    suite();
  }

  /* ---------- Cloches de l'abbaye ---------- */
  function cloche(t0, f, force, loin) {
    const PART = [[0.5, 0.5, 9], [1, 1, 6], [1.19, 0.6, 4], [1.5, 0.35, 3.5], [2, 0.5, 3], [2.52, 0.25, 2.2], [3.01, 0.2, 1.6], [4.1, 0.12, 1.1]];
    const sortie = gain(force * 0.16); let dest = sortie;
    if (loin) { const lp = filtre('lowpass', 1600, 0.5); sortie.connect(lp); dest = lp; }
    dest.connect(maitre); if (!loin) { const e = gain(0.35); sortie.connect(e); e.connect(reverb); }
    PART.forEach(([r, a, d]) => {
      const o = ctx.createOscillator(), g = gain(0); o.frequency.value = f * r * (1 + (Math.random() - 0.5) * 0.002);
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(a, t0 + 0.004); g.gain.exponentialRampToValueAtTime(0.0008, t0 + d);
      o.connect(g); g.connect(sortie); o.start(t0); o.stop(t0 + d + 0.1);
    });
  }
  function volee(n, loin) {
    if (!ctx || !Son.actif) return;
    const t = ctx.currentTime + 0.3;
    for (let k = 0; k < n; k++) cloche(t + k * 1.35, k % 2 ? 330 : 262, loin ? 0.35 : 1, loin);
  }

  /* ---------- Cris de la foule ---------- */
  function syllabe(t, f1, f2, duree, force) {
    const s = ctx.createBufferSource(); s.buffer = babils[Math.floor(Math.random() * 3)]; s.playbackRate.value = 1.4;
    const a = filtre('bandpass', f1, 2.2), b = filtre('bandpass', f2, 3), g = gain(0), ga = gain(1), gb = gain(0.6);
    s.connect(a); s.connect(b); a.connect(ga); b.connect(gb); ga.connect(g); gb.connect(g); g.connect(maitre);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(force, t + 0.04); g.gain.exponentialRampToValueAtTime(0.001, t + duree);
    s.start(t, Math.random() * 3); s.stop(t + duree + 0.05);
  }
  function clameur(duree, force) {
    const t = ctx.currentTime + 0.05, s = boucle(bruitRose, 1.2, Math.random() * 3), f = filtre('bandpass', 900, 0.6), g = gain(0);
    s.connect(f); f.connect(g); g.connect(maitre);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(force, t + 0.6); g.gain.setTargetAtTime(0, t + duree * 0.6, duree * 0.25);
    s.stop(t + duree + 1.5);
  }

  /* ---------- Interface ---------- */
  function appliquer(rapide) {
    if (!ctx) return;
    const L = LIEUX[lieu] || LIEUX.route, t = ctx.currentTime;
    for (const k in cibles) { cibles[k] = L[k]; pistes[k].gain.setTargetAtTime(Son.actif ? L[k] * (k === 'foule' ? sourdine : 1) : 0, t, rapide ? 0.2 : 1.2); }
  }
  Son.activer = function (oui) {
    Son.actif = !!oui; ecrireChoix(Son.actif);
    if (Son.actif) {
      if (!ctx && !preparer()) { Son.actif = false; return false; }
      ctx.resume();
      maitre.gain.setTargetAtTime(0.8, ctx.currentTime, 0.4);
      appliquer(); planifierOiseaux(); planifierChant();
    } else if (ctx) {
      maitre.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
      clearTimeout(minuteurOiseaux); clearTimeout(minuteurChant); prochainChant = 0;
      setTimeout(() => { if (!Son.actif && ctx) ctx.suspend(); }, 600);
    }
    return Son.actif;
  };
  Son.disponible = !!(window.AudioContext || window.webkitAudioContext);
  Son.choixMemorise = lireChoix;
  Son.ambiance = function (l) {
    const avant = lieu; lieu = LIEUX[l] ? l : 'route';
    if (!ctx || !Son.actif) return;
    appliquer();
    if (lieu === 'basilique' && avant !== 'basilique' && avant !== 'interieur') volee(6);
    if (lieu === 'route' && avant !== 'route') setTimeout(() => volee(3, true), 1500);
    if (lieu === 'interieur') prochainChant = Math.max(prochainChant, ctx.currentTime + 1.5);
  };
  // pendant le sermon, la foule se tait pour écouter ; puis elle crie « Des croix ! »
  Son.sermon = function (etat) {
    if (!ctx || !Son.actif) return;
    if (etat === 'debut') { sourdine = 0.22; appliquer(); }
    else if (etat === 'fin') { sourdine = 1; appliquer(); }
    else if (etat === 'croix') {
      sourdine = 1; appliquer(true); clameur(4.5, 0.55);
      const t = ctx.currentTime + 0.15;
      for (let k = 0; k < 3; k++) { const tk = t + k * 0.95; for (let v = 0; v < 5; v++) { const d = Math.random() * 0.06; syllabe(tk + d, 420 + v * 30, 2100, 0.28, 0.7); syllabe(tk + 0.3 + d, 720 + v * 25, 1150, 0.5, 0.9); } }
    } else if (etat === 'acclamation') { clameur(5, 0.45); }
  };
  Son._noeuds = () => ({ ctx, maitre }); // pour les tests automatiques (mesure du niveau)
  window.Son = Son;
})();
