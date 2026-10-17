/* ================= Outils ================= */
const $ = (s) => document.querySelector(s);
function el(tag, attrs, ...enfants) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === "class") e.className = v; else if (k === "html") e.innerHTML = v;
    else if (k.startsWith("on")) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v === true ? "" : v);
  }
  for (const c of enfants.flat(3)) { if (c == null || c === false) continue; e.append(c.nodeType ? c : document.createTextNode(String(c))); }
  return e;
}
const ico = (id, cls = "ico") => el("span", { html: `<svg class="${cls}" aria-hidden="true"><use href="#i-${id}"/></svg>`, style: "display:contents" });
const icone = (id) => el("span", { html: ICONES[id] || "", style: "display:contents" });
const normaliser = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]/g, "");
const anneeDe = (xp) => { let a = 1; XP_ANNEES.forEach((s, i) => { if (xp >= s) a = i + 1; }); return a; };
const nomAnnee = (a) => (a === 1 ? "1re année" : `${a}e année`);
const rangDe = (h, pts) => { let r = RANGS[0]; RANGS.forEach((x) => { if (pts >= x[0]) r = x; }); return HEROS[h].f ? r[2] : r[1]; };
const quete = (n) => (typeof QUETES !== "undefined" && QUETES[n]) || null;
function melangeFixe(liste, graine) { const a = liste.map((v, i) => [v, i]); let s = graine * 9301 + 49297; for (let i = a.length - 1; i > 0; i--) { s = (s * 9301 + 49297) % 233280; const j = Math.floor((s / 233280) * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } if (a.length > 2 && a.every(([, i], k) => i === k)) a.push(a.shift()); return a; }

/* ================= État et sauvegarde ================= */
/* Une partie par classe. En ligne : jeu/classes (la liste), parties/<id> (la partie),
   parties/<id>/sauvegardes (les points de sauvegarde). Sinon : le navigateur. */
const CLE = "reliques-fondateurs-v1";
const CLE2 = "reliques-v2";
function etatNeuf() {
  return { v: 1, rev: 0, etape: 0, xp: 0, maitrise: { leo: 0, iris: 0, capucine: 0, silas: 0 }, points: { gry: 0, ser: 0, pou: 0, sep: 0 },
    sac: { chocogrenouille: 1 }, compagnons: [], reliques: [], resultats: {}, defis: {}, usages: {}, destins: [], journal: [], pile: [], introVue: false, scenes: {} };
}
function completer(e) { const n = etatNeuf(); for (const k of Object.keys(n)) if (e[k] == null) e[k] = n[k]; return e; }
const ls = {
  lire(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
  ecrire(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  oublier(k) { try { localStorage.removeItem(k); } catch (e) {} },
};
let etat = etatNeuf();
let registre = { rev: 0, liste: [{ id: "c1", nom: "6e A" }, { id: "c2", nom: "6e B" }] };
const parties = {};
let courante = null;
const nomClasse = (id) => (registre.liste.find((c) => c.id === id) || { nom: "" }).nom;
const partieDe = (id) => (id === courante ? etat : parties[id]);
const prefs = ls.lire(CLE + "-prefs") || {};
const sauverPrefs = () => ls.ecrire(CLE + "-prefs", prefs);

/* Un document synchronisé : la version la plus récente (rev) gagne, une écriture à la fois. */
function creerLien(chemin, cleLie, lire, adopter) {
  const L = { ref: null, unsub: null, ecrit: false, attente: false, reessai: false };
  L.brancher = () => {
    L.ref = Store.db.doc(chemin); let lie = ls.lire(cleLie) === 1;
    L.unsub = L.ref.onSnapshot((snap) => {
      if (snap.metadata && snap.metadata.fromCache) return;
      const d = snap.exists ? snap.data() : null, loc = lire(); if (!loc) return;
      const rd = d ? d.rev || 0 : 0, rl = loc.rev || 0;
      const ecarter = !lie && d && rd < rl && (d.maj || "") > (loc.maj || "");
      if (!lie) { lie = true; ls.ecrire(cleLie, 1); }
      if (!d) { if (rl > 0) L.ecrire(); return; }
      if (rd > rl || ecarter) adopter(JSON.parse(JSON.stringify(d)));
      else if (rd < rl) L.ecrire();
    }, (e) => Store.perdu(e));
  };
  L.ecrire = async () => {
    if (!L.ref || Store.lecture) return;
    if (L.ecrit) { L.attente = true; return; }
    const d = lire(); if (!d) return;
    L.ecrit = true;
    try { await L.ref.set(JSON.parse(JSON.stringify(d))); L.reessai = false; }
    catch (e) { const c = (e && e.code) || "unavailable"; if (c === "invalid_argument" || c === "transform_error") { Store.lecture = true; majSync(); } else if (c === "revoked" || c === "not_granted" || c === "capability_disabled" || c === "capability_removed") Store.perdu(e); else if (c !== "quota_exceeded" && !L.reessai) { L.reessai = true; setTimeout(() => L.ecrire(), 1500 + Math.random() * 2000); } }
    L.ecrit = false;
    if (L.attente) { L.attente = false; L.ecrire(); }
  };
  L.couper = () => { if (L.unsub) L.unsub(); L.unsub = null; L.ref = null; };
  return L;
}

const Store = {
  mode: "local", db: null, lecture: false, liens: {},
  charger() {
    const r = ls.lire(CLE2 + "-classes");
    if (r && r.liste && r.liste.length) registre = r;
    else {
      const v1 = ls.lire(CLE);
      if (v1) { const e = completer(v1); e.introVue = e.etape > 0; ls.ecrire(CLE2 + "-partie-" + registre.liste[0].id, e); }
      ls.ecrire(CLE2 + "-classes", registre);
    }
    this.relier();
  },
  relier() {
    const ids = registre.liste.map((c) => c.id);
    ids.forEach((id) => { if (!parties[id]) parties[id] = completer(ls.lire(CLE2 + "-partie-" + id) || etatNeuf()); });
    Object.keys(parties).forEach((id) => { if (!ids.includes(id)) delete parties[id]; });
    if (this.db) {
      ids.forEach((id) => { if (!this.liens[id]) { const l = creerLien("parties/" + id, CLE2 + "-lie-" + id, () => partieDe(id), (d) => this.adopter(id, d)); this.liens[id] = l; l.brancher(); } });
      Object.keys(this.liens).forEach((id) => { if (id !== "registre" && !ids.includes(id)) { this.liens[id].couper(); delete this.liens[id]; } });
    }
    if (courante && !ids.includes(courante)) afficherAccueil();
  },
  adopter(id, d) {
    const e = completer(d); parties[id] = e; ls.ecrire(CLE2 + "-partie-" + id, e);
    if (id === courante) { etat = e; rendreTout(); }
    rendreAccueil();
  },
  async brancher() {
    try {
      if (!window.claude || !window.claude.use) return;
      const db = await window.claude.use("db"); if (!db) return;
      this.db = db; this.mode = "db"; majSync();
      try { // la partie de la version précédente (jeu/partie) devient celle de la première classe
        const r = await db.doc("jeu/classes").get();
        if (!r.exists) { const a = await db.doc("jeu/partie").get(); const id = registre.liste[0].id;
          if (a.exists && (a.data().rev || 0) > (parties[id].rev || 0)) { const e = completer(JSON.parse(JSON.stringify(a.data()))); e.introVue = e.etape > 0; parties[id] = e; if (courante === id) etat = e; ls.ecrire(CLE2 + "-partie-" + id, e); rendreAccueil(); } }
      } catch (e) {}
      if (!this.db) return;
      this.liens.registre = creerLien("jeu/classes", CLE2 + "-lie-classes", () => registre, (d) => { if (!Array.isArray(d.liste) || !d.liste.length) return; registre = d; ls.ecrire(CLE2 + "-classes", registre); this.relier(); rendreAccueil(); if (courante) $("#hud-classe").textContent = nomClasse(courante); });
      this.liens.registre.brancher();
      this.relier();
    } catch (e) {}
  },
  perdu() { this.mode = "local"; Object.values(this.liens).forEach((l) => l.couper()); this.liens = {}; this.db = null; majSync(); },
  sauver(id = courante) {
    if (!id) return; if (id === courante) parties[id] = etat;
    const e = parties[id]; if (!e) return;
    e.rev = (e.rev || 0) + 1; e.maj = new Date().toISOString(); ls.ecrire(CLE2 + "-partie-" + id, e);
    const l = this.liens[id]; if (l) l.ecrire();
  },
  sauverRegistre() { registre.rev = (registre.rev || 0) + 1; registre.maj = new Date().toISOString(); ls.ecrire(CLE2 + "-classes", registre); if (this.liens.registre) this.liens.registre.ecrire(); },
  /* Points de sauvegarde : 25 par classe, dans le navigateur et en ligne. */
  instantane(label, id = courante) {
    const e = partieDe(id); if (!e) return;
    const s = { cle: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), date: new Date().toISOString(), label, etape: e.etape, xp: e.xp, reliques: e.reliques.length, etat: JSON.stringify({ ...e, pile: [] }) };
    ls.ecrire(CLE2 + "-sauv-" + id, [s, ...(ls.lire(CLE2 + "-sauv-" + id) || [])].slice(0, 25));
    if (this.db && !this.lecture) {
      const coll = this.db.collection("parties/" + id + "/sauvegardes");
      coll.doc(s.cle).set(s).then(async () => { const q = await coll.orderBy("date", "desc").limit(60).get(); q.docs.slice(25).forEach((d) => coll.doc(d.id).delete().catch(() => {})); }).catch(() => {});
    }
  },
  async sauvegardes(id) {
    const liste = ls.lire(CLE2 + "-sauv-" + id) || [];
    if (this.db) {
      try { const q = await this.db.collection("parties/" + id + "/sauvegardes").orderBy("date", "desc").limit(25).get(); const vus = new Set(liste.map((s) => s.cle)); q.docs.forEach((d) => { const s = d.data(); if (s && s.etat && !vus.has(s.cle)) liste.push(s); }); } catch (e) {}
    }
    return liste.sort((a, b) => (b.date > a.date ? 1 : -1)).slice(0, 25);
  },
};
function majSync() {
  const s = $("#hud-sync"); if (!s) return;
  s.classList.toggle("db", Store.mode === "db" && !Store.lecture);
  s.lastChild.textContent = Store.lecture ? "Lecture seule" : Store.mode === "db" ? "Parties partagées et sauvegardées en ligne" : "Parties sauvegardées sur cet appareil";
}
function noter(t, e = etat) { e.journal.unshift({ t, d: new Date().toISOString() }); e.journal = e.journal.slice(0, 80); }
/* Remplace la partie d'une classe (restauration, remise à zéro) en gardant son numéro de version. */
function remplacerPartie(id, n, message) {
  const ancien = partieDe(id); n.rev = (ancien && ancien.rev) || 0; noter(message, n);
  parties[id] = n; if (id === courante) etat = n;
  Store.sauver(id);
  if (id === courante) { rendreTout(); if (Scene3D.ok) Scene3D.suivreEquipe(); }
  rendreAccueil();
}

/* ================= Sons ================= */
const Son = {
  ctx: null,
  jouer(type) {
    if (prefs.muet) return;
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      const c = this.ctx, t = c.currentTime;
      const note = (f, d, v = 0.12, forme = "sine", dec = 0) => { const o = c.createOscillator(), g = c.createGain(); o.type = forme; o.frequency.value = f; g.gain.setValueAtTime(0, t + dec); g.gain.linearRampToValueAtTime(v, t + dec + 0.02); g.gain.exponentialRampToValueAtTime(0.001, t + dec + d); o.connect(g).connect(c.destination); o.start(t + dec); o.stop(t + dec + d + 0.05); };
      if (type === "tinte") [523, 659, 784, 1047].forEach((f, i) => note(f, 0.5, 0.1, "triangle", i * 0.09));
      if (type === "fanfare") [392, 523, 659, 784, 1047, 1319].forEach((f, i) => note(f, 0.7, 0.11, "triangle", i * 0.11));
      if (type === "grave") [220, 185].forEach((f, i) => note(f, 0.6, 0.12, "sawtooth", i * 0.18));
      if (type === "magie") for (let i = 0; i < 9; i++) note(900 + Math.random() * 1400, 0.35, 0.05, "sine", i * 0.05);
      if (type === "cloche") [880, 880, 880].forEach((f, i) => note(f, 0.5, 0.14, "square", i * 0.35));
      if (type === "page") note(180, 0.12, 0.05, "triangle");
      if (type === "sifflet") { note(698, 1.3, 0.06, "triangle"); note(880, 1.3, 0.05, "triangle"); note(1047, 1.3, 0.03, "sine"); }
      if (type === "feu") { note(70 + Math.random() * 40, 0.5, 0.16, "sine"); for (let i = 0; i < 6; i++) note(1800 + Math.random() * 2400, 0.12, 0.025, "square", 0.08 + i * 0.05); }
      if (type === "vague") [140, 110, 90].forEach((f, i) => note(f, 1.2, 0.1, "sine", i * 0.25));
    } catch (e) {}
  },
};

/* ================= Fenêtres et messages ================= */
const Fen = {
  pile: [],
  ouvrir(contenu, { classe = "parchemin", etroite = false, bloquante = false, onFermer } = {}) {
    const voile = el("div", { class: "voile" });
    const f = el("div", { class: `fenetre ${classe}${etroite ? " etroite" : ""}`, role: "dialog", "aria-modal": "true", tabindex: "-1" });
    const x = el("button", { class: "fermer", "aria-label": "Fermer", onclick: () => this.fermer() }, ico("x"));
    if (!bloquante) voile.addEventListener("pointerdown", (e) => { if (e.target === voile) this.fermer(); });
    f.append(x, contenu); voile.append(f); $("#fenetres").append(voile);
    this.pile.push({ voile, onFermer, bloquante }); Scene3D.pause = true; setTimeout(() => (bloquante ? f : x).focus({ preventScroll: true }), 30); return f;
  },
  fermer() { const t = this.pile.pop(); if (!t) return; t.voile.remove(); Scene3D.pause = this.pile.length > 0; if (t.onFermer) t.onFermer(); },
  tout() { while (this.pile.length) this.fermer(); },
};
document.addEventListener("keydown", (e) => { const t = Fen.pile[Fen.pile.length - 1]; if (e.key === "Escape" && t && !t.bloquante) Fen.fermer(); });
function toast(t) { const n = el("div", { class: "toast" }, t); $("#toasts").append(n); setTimeout(() => n.remove(), 4300); }
function etincelles(n = 120) {
  const z = $("#etincelles"); const coul = ["#E8C978", "#FF8A7A", "#A9C0FF", "#FFD45E", "#74E3A6", "#ffffff"];
  for (let i = 0; i < n; i++) { const p = el("i", { style: `left:${Math.random() * 100}%;background:${coul[i % coul.length]};animation-duration:${2.5 + Math.random() * 2.5}s;animation-delay:${Math.random() * 0.8}s` }); z.append(p); setTimeout(() => p.remove(), 6000); }
}

/* ================= Règles ================= */
const chapCourant = () => chapitreDe(Math.min(16, etat.etape + 1)).n;
function sortDispo(s) {
  const u = etat.usages[s.id];
  if (s.freq === "finale") return etat.etape === 15 && !u;
  if (anneeDe(etat.xp) < s.annee) return false;
  if (s.freq === "etape") return u !== "e" + (etat.etape + 1);
  if (s.freq === "chapitre") return u !== "c" + chapCourant();
  if (s.freq === "finale") return etat.etape === 15 && !u;
  return true;
}
const marquerSort = (s) => { etat.usages[s.id] = s.freq === "etape" ? "e" + (etat.etape + 1) : s.freq === "chapitre" ? "c" + chapCourant() : "x"; };
const nbObjets = () => Object.values(etat.sac).reduce((a, b) => a + b, 0);
function ajouterObjet(id, q = 1) { etat.sac[id] = (etat.sac[id] || 0) + q; }
function retirerObjet(id) { if (!etat.sac[id]) return false; etat.sac[id]--; if (!etat.sac[id]) delete etat.sac[id]; return true; }
function objetHasard() { const pool = ["rapeltout", "rapeltout", "plume", "retourneur", "pimentine", "bezoard", "chocogrenouille", "chocogrenouille", "dragees", "cape", "felix"]; return pool[Math.floor(Math.random() * pool.length)]; }
function gagnerXP(n, raison) {
  const avant = anneeDe(etat.xp); etat.xp = Math.max(0, etat.xp + n); const apres = anneeDe(etat.xp);
  if (raison) noter(`${n >= 0 ? "+" : ""}${n} XP · ${raison}`);
  if (apres > avant) { const s = SORTS.find((x) => x.annee === apres); setTimeout(() => { Son.jouer("fanfare"); toast(`Passage en ${nomAnnee(apres)} ! Nouveau sort : ${s ? s.nom : ""}`); etincelles(70); }, 400); }
  return apres > avant ? apres : 0;
}
const defisEnAttente = () => { const l = []; for (let n = Math.max(1, etat.etape); n <= Math.min(16, etat.etape); n++) { const q = quete(n); if (q && q.defi_maison && q.defi_maison.titre && !etat.defis[n]) l.push(n); } return l; };

/* ================= HUD ================= */
function rendreHud() {
  const prochaine = Math.min(16, etat.etape + 1); const ch = chapitreDe(prochaine); const fini = etat.etape >= 16;
  const a = anneeDe(etat.xp); const bas = XP_ANNEES[a - 1], haut = XP_ANNEES[a] ?? null;
  $("#hud-classe").textContent = nomClasse(courante);
  $("#hud-chapitre").textContent = fini ? "Méfait accompli !" : `Chapitre ${ch.n} · ${ch.titre}`;
  $("#hud-sous").replaceChildren(el("span", {}, `${nomAnnee(a)} · ${etat.xp} XP`), el("span", { class: "barre" }, el("i", { style: `width:${haut ? Math.round(((etat.xp - bas) / (haut - bas)) * 100) : 100}%` })));
  $("#hud-piste").replaceChildren(...CHAPITRES.map((c) => el("div", { class: "piste-chap" }, [1, 2, 3, 4].map((k) => {
    const n = (c.n - 1) * 4 + k; const e = n <= etat.etape ? " ok" : n === etat.etape + 1 ? " cur" : "";
    const titre = `Étape ${n} · ${nomVisible(n)}`;
    return LIEUX[n].cp ? el("span", { class: "noeud cp" + e + (etat.reliques.includes(c.relique) ? " gagne" : ""), title: `${titre} · ${RELIQUES[c.relique].nom}`, html: ICONES[c.relique] }) : el("i", { class: "noeud" + e, title: titre });
  }))));
  const lead = ch.heros;
  $("#hud-heros").replaceChildren(...ORDRE_HEROS.map((h) => {
    const H = HEROS[h], M = MAISONS[H.maison], pts = etat.maitrise[h];
    return el("div", { class: "heros-mini" + (h === lead && !fini ? " lead" : ""), style: `--hc:${M.c};--hcc:${M.clair}`, title: `${H.nom} · ${M.nom} · ${H.spe} · ${pts} ★` },
      el("span", { html: portraitSVG(H.maison), style: "display:contents" }), el("b", {}, H.court), el("small", {}, rangDe(h, pts)));
  }));
  const max = Math.max(100, ...Object.values(etat.points));
  $("#hud-sabliers").replaceChildren(...ORDRE_MAISONS.map((m) => el("button", { class: "sablier", title: `Points de ${MAISONS[m].nom} : cliquer pour en ajouter ou en retirer`, onclick: (e) => popoverMaison(m, e.currentTarget) },
    el("span", { html: sablierSVG(MAISONS[m].c, etat.points[m] / max), style: "display:contents" }), el("b", {}, etat.points[m]))));
  const defis = defisEnAttente().length;
  $("#btn-defi-attente").hidden = !defis;
  const p = $("#pastille-menu"); p.hidden = !defis; p.textContent = defis;
  $("#be-num").textContent = fini ? "★" : prochaine;
  $("#be-t1").textContent = fini ? "Aventure terminée" : `Étape ${prochaine} sur 16${LIEUX[prochaine].cp ? " · relique en jeu" : ""}`;
  $("#be-t2").textContent = fini ? "Revoir la finale" : LIEUX[prochaine].nom;
}
function rendreTout() { rendreHud(); Scene3D.majEtat(etat, { prep: prefs.prep }); if (!Scene3D.ok) carte2D(); }

function popoverMaison(m, ancre) {
  document.querySelectorAll(".popover-maison").forEach((p) => p.remove());
  const r = ancre.getBoundingClientRect();
  const p = el("div", { class: "popover-maison verre", style: `bottom:${innerHeight - r.top + 8}px;left:${Math.max(8, Math.min(innerWidth - 208, r.right - 200))}px` },
    el("div", { class: "panneau-t" }, `${MAISONS[m].nom} · ${etat.points[m]} points`),
    el("div", { class: "rangee" }, [-5, -1, 1, 2, 3, 5, 10].map((d) => el("button", { class: "b", onclick: () => { etat.points[m] = Math.max(0, etat.points[m] + d); noter(`${d > 0 ? "+" : ""}${d} points pour ${MAISONS[m].nom}`); Store.sauver(); rendreHud(); p.querySelector(".panneau-t").textContent = `${MAISONS[m].nom} · ${etat.points[m]} points`; Son.jouer(d > 0 ? "tinte" : "page"); } }, (d > 0 ? "+" : "") + d))));
  document.body.append(p);
  setTimeout(() => document.addEventListener("pointerdown", function f(e) { if (!p.contains(e.target)) { p.remove(); document.removeEventListener("pointerdown", f); } }), 0);
}

/* ================= Carte 2D de secours ================= */
function carte2D() {
  const box = $("#carte2d"); box.hidden = false;
  const X = (x) => ((x + 52) / 106) * 1000, Z = (z) => ((z + 48) / 92) * 860;
  const pts = LIEUX.map((l) => `${X(l.x).toFixed(0)},${Z(l.z).toFixed(0)}`).join(" ");
  const noeuds = LIEUX.slice(1).map((l) => { const n = l.n, e = n <= etat.etape ? "fait" : n === etat.etape + 1 ? "actuel" : "verrou"; const c = MAISONS[HEROS[chapitreDe(n).heros].maison];
    return `<g class="n2d" data-n="${n}" style="cursor:pointer"><circle cx="${X(l.x)}" cy="${Z(l.z)}" r="${l.cp ? 26 : 20}" fill="${e === "fait" ? "#E8C978" : e === "actuel" ? "#FFF6DC" : "#1B1D33"}" stroke="${c.clair}" stroke-width="4"/><text x="${X(l.x)}" y="${Z(l.z) + 7}" text-anchor="middle" font-size="20" font-weight="700" fill="${e === "verrou" ? "#E9E4D4" : "#1B1D33"}">${e === "fait" ? "✓" : n}</text></g>`; }).join("");
  const p = LIEUX[etat.etape];
  box.innerHTML = `<svg viewBox="0 0 1000 860" role="img" aria-label="Carte du domaine de Poudlard"><rect width="1000" height="860" rx="30" fill="#3C5A34"/><path d="M0 330 L330 300 L330 860 L0 860Z" fill="#294A25"/><ellipse cx="${X(22)}" cy="${Z(6)}" rx="${(17 / 106) * 1000}" ry="${(13 / 92) * 860}" fill="#2C5C7A"/><rect x="${X(-20)}" y="${Z(-46)}" width="${(40 / 106) * 1000}" height="${(26 / 92) * 860}" rx="12" fill="#BDB3A0"/><ellipse cx="${X(42)}" cy="${Z(-14)}" rx="95" ry="50" fill="#7FB05A"/><polyline points="${pts}" fill="none" stroke="#E8C978" stroke-width="6" stroke-dasharray="4 12" stroke-linecap="round"/>${noeuds}<g><circle cx="${X(p.x)}" cy="${Z(p.z) - 38}" r="12" fill="#FFE3A0"/><text x="${X(p.x)}" y="${Z(p.z) - 58}" text-anchor="middle" fill="#FFE3A0" font-size="18">L'équipe</text></g></svg>`;
  box.querySelectorAll(".n2d").forEach((g) => g.addEventListener("click", () => clicLieu(+g.dataset.n)));
}

/* ================= Interaction avec la carte ================= */
function nomVisible(n) { return n <= etat.etape + 1 || prefs.prep ? LIEUX[n].nom : "Lieu encore caché"; }
function clicLieu(n) {
  if (n === 0) return;
  if (n <= etat.etape) return ouvrirQuete(n, "revoir");
  if (n === etat.etape + 1) return lancerEtape();
  if (prefs.prep) return ouvrirQuete(n, "apercu");
  Son.jouer("page"); toast("Ce lieu est encore caché dans la brume… Terminez d'abord l'étape " + (etat.etape + 1) + ".");
}
function survolLieu(n, x, y) {
  const b = $("#infobulle");
  if (n == null) { b.hidden = true; return; }
  const etatL = n <= etat.etape ? "Étape franchie" : n === etat.etape + 1 ? "Prochaine étape" : "À venir";
  b.replaceChildren(el("b", {}, `${n} · ${nomVisible(n)}`), el("span", {}, `${etatL}${LIEUX[n].cp ? " · relique" : ""}`));
  b.style.left = x + "px"; b.style.top = y + "px"; b.hidden = false;
}

/* ================= La quête ================= */
const TYPES = { qcm: "Questionnaire", enigmes: "Énigmes", association: "Associations", ordre: "Remettre dans l'ordre", code: "Message codé", defi_equipe: "Défi d'équipe" };
const SEANCE = { n: 0, loc: null };
function ouvrirQuete(n, mode) {
  const q = quete(n); const L = LIEUX[n], ch = chapitreDe(n), H = HEROS[(q && q.heros) || ch.heros];
  const M = MAISONS[H.maison];
  const corps = el("div", { class: "f-corps" });
  const fen = Fen.ouvrir(corps, { bloquante: mode === "jouer" });
  const loc = (mode === "jouer" && SEANCE.n === n && SEANCE.loc) || { onglet: mode === "revoir" ? "epreuve" : "lettre", chrono: null, indice: false, revele: new Set(), toutRevele: false, resultat: null, maisons: new Set(), felix: false, protego: false, patronum: false };
  if (mode === "jouer") { SEANCE.n = n; SEANCE.loc = loc; }
  const tete = el("div", { class: "q-tete" },
    el("div", {}, el("div", { class: "surtitre" }, `Étape ${n} sur 16 · Chapitre ${ch.n} · ${ch.titre}`), el("h2", {}, (q && q.titre) || L.nom), el("div", { class: "surtitre", style: "font-size:.95rem;margin-top:4px" }, L.nom + (L.cp ? " · relique en jeu" : ""))),
    el("div", { class: "chips" }, el("span", { class: "chip h", style: `--hc:${M.c}` }, `En tête : ${H.court} (${M.nom})`), q && el("span", { class: "chip" }, `${TYPES[q.epreuve.type] || "Épreuve"} · ${q.epreuve.duree} min`)));
  const onglets = el("div", { class: "onglets", role: "tablist" });
  const zone = el("div", {});
  corps.append(tete);
  if (mode === "apercu") corps.append(el("div", { class: "bandeau-prep" }, "Aperçu du professeur : cette étape n'est pas encore jouable. Rien n'est enregistré."));
  if (mode === "revoir") { const r = etat.resultats[n]; corps.append(el("div", { class: "bandeau-prep" }, r ? `Étape franchie : ${({ reussite: "réussite", partielle: "réussite partielle", echec: "échec" })[r.r]}${r.m && r.m.length ? " · ont brillé : " + r.m.map((m) => MAISONS[m].nom).join(", ") : ""}` : "Étape franchie.")); }
  corps.append(onglets, zone);
  if (!q) { zone.append(el("p", { class: "consigne" }, "Le contenu de cette étape n'est pas encore chargé.")); }
  const listeOnglets = [["lettre", "La lettre"], ["epreuve", "L'épreuve"]]; if (mode === "jouer") listeOnglets.push(["resultat", "Le résultat"]);
  function rendreOnglets() { onglets.replaceChildren(...listeOnglets.map(([id, t], i) => el("button", { class: "onglet", role: "tab", "aria-selected": String(loc.onglet === id), onclick: () => { loc.onglet = id; Son.jouer("page"); rendre(); } }, el("span", { class: "n" }, i + 1), t))); }
  function rendre() { rendreOnglets(); if (!q) return; const y = fen.scrollTop; zone.replaceChildren(loc.onglet === "lettre" ? vueLettre() : loc.onglet === "epreuve" ? vueEpreuve() : vueResultat()); fen.scrollTop = loc.vu === loc.onglet ? y : 0; loc.vu = loc.onglet; }

  function vueLettre() {
    return el("div", { style: "display:grid;gap:18px" },
      el("p", { class: "surtitre" }, "Moka se pose sur le bureau et lâche une enveloppe…"),
      el("div", { class: "lettre" }, q.recit),
      q.message_ombre && (loc.ombre || mode === "revoir" ? el("div", { class: "ombre" }, el("small", {}, "Un parchemin noir était glissé dans l'enveloppe"), q.message_ombre)
        : el("div", {}, el("button", { class: "b", onclick: () => { loc.ombre = true; Son.jouer("grave"); rendre(); } }, "Un parchemin noir dépasse de l'enveloppe… le lire maintenant"), el("small", { style: "display:block;margin-top:6px;color:var(--parch-doux)" }, n === 16 ? "" : "Sinon, il s'affichera à la fin de la séance, après le résultat."))),
      el("div", { class: "rangee", style: "justify-content:flex-end" },
        SCENES_ETAPE[n] && Scene3D.ok && mode !== "apercu" && el("button", { class: "b", onclick: () => { Fen.fermer(); jouerScene(SCENES_ETAPE[n], () => ouvrirQuete(n, mode)); } }, ico("film"), "Revoir la scène"),
        mode !== "revoir" && el("button", { class: "b or", onclick: () => { loc.onglet = "epreuve"; Son.jouer("magie"); rendre(); } }, "Passer à l'épreuve →")));
  }

  function revelee(k) { return loc.toutRevele || loc.revele.has(k); }
  function boutonReveler(k) { return el("button", { class: "b", onclick: () => { loc.revele.add(k); Son.jouer("page"); rendre(); } }, ico("oeil"), "Révéler"); }
  function vueEpreuve() {
    const E = q.epreuve; const contenu = el("div", { style: "display:grid;gap:16px;min-width:0" });
    contenu.append(el("h3", {}, E.titre), el("p", { class: "consigne" }, E.consigne));
    if (E.deroulement || q.note_prof) contenu.append(el("details", { class: "prof" }, el("summary", {}, mode === "jouer" ? "Pour le professeur : déroulement (contient des réponses, ne pas ouvrir devant la classe)" : "Pour le professeur : déroulement"), el("p", { class: "deroulement" }, E.deroulement), q.note_prof && el("p", { class: "note-prof" }, q.note_prof), E.reussite && el("p", { class: "deroulement" }, el("b", {}, "Critères : "), E.reussite)));
    if (E.code && E.code.message) {
      contenu.append(el("div", { class: "code-msg" }, E.code.message));
      if (E.code.cle) contenu.append(loc.cle || loc.toutRevele || mode === "revoir" ? el("div", { class: "cle" }, el("b", {}, "La clé : "), E.code.cle) : el("div", {}, el("button", { class: "b", onclick: () => { loc.cle = true; Son.jouer("magie"); rendre(); } }, ico("oeil"), "Montrer la clé du code")));
      if (E.code.reponse) contenu.append(revelee("code") ? el("div", { class: "reponse", style: "padding-left:14px" }, el("b", {}, "Message déchiffré : "), E.code.reponse) : el("div", {}, boutonReveler("code")));
    }
    if (E.paires && E.paires.length) {
      const droite = melangeFixe(E.paires.map((p) => p.droite), n);
      const lettre = (i) => String.fromCharCode(65 + i);
      contenu.append(el("div", { class: "assoc" },
        el("ol", {}, E.paires.map((p, i) => el("li", {}, el("b", {}, i + 1), p.gauche))),
        el("ol", {}, droite.map(([t], i) => el("li", {}, el("b", {}, lettre(i)), t)))));
      contenu.append(revelee("paires") ? el("div", { class: "reponse", style: "padding-left:14px" }, el("b", {}, "Solution : "), E.paires.map((p, i) => `${i + 1} → ${lettre(droite.findIndex(([, j]) => j === i))}`).join("   ·   ")) : el("div", {}, boutonReveler("paires")));
    }
    if (E.ordre && E.ordre.length) {
      const m = melangeFixe(E.ordre, n + 7); const lettre = (i) => String.fromCharCode(65 + i);
      contenu.append(el("div", { class: "assoc", style: "grid-template-columns:1fr" }, el("ol", {}, m.map(([t], i) => el("li", {}, el("b", {}, lettre(i)), t)))));
      contenu.append(revelee("ordre") ? el("div", { class: "reponse", style: "padding-left:14px" }, el("b", {}, "Le bon ordre : "), E.ordre.map((_, i) => lettre(m.findIndex(([, j]) => j === i))).join(" → ")) : el("div", {}, boutonReveler("ordre")));
    }
    if (E.questions && E.questions.length) {
      const nbVis = mode === "jouer" && !loc.toutRevele ? (loc.nbQ || 1) : E.questions.length;
      contenu.append(el("ol", { class: "questions" }, E.questions.slice(0, nbVis).map((Q, i) => {
        const r = revelee("q" + i); const lettre = (k) => String.fromCharCode(65 + k);
        const juste = (c) => normaliser(c) === normaliser(Q.reponse);
        return el("li", { class: "question" }, el("div", { class: "qq" }, el("span", {}, Q.q)),
          Q.choix && Q.choix.length ? el("div", { class: "choix" }, Q.choix.map((c, k) => el("span", { class: r && juste(c) ? "juste" : "" }, el("b", {}, lettre(k) + "."), c))) : null,
          r ? el("div", { class: "reponse" }, el("b", {}, Q.reponse), Q.explication && el("small", {}, Q.explication)) : el("div", { class: "q-actions" }, boutonReveler("q" + i)));
      })));
      if (nbVis < E.questions.length) contenu.append(el("div", {}, el("button", { class: "b or", onclick: () => { loc.nbQ = nbVis + 1; Son.jouer("page"); rendre(); } }, `Afficher la question suivante (${nbVis + 1} sur ${E.questions.length})`)));
    }
    if (loc.indice && E.indice) contenu.append(el("div", { class: "indice" }, el("b", {}, "Indice : "), E.indice));
    if (mode !== "jouer") { if (E.indice && !loc.indice) contenu.append(el("div", {}, el("button", { class: "b", onclick: () => { loc.indice = true; rendre(); } }, "Voir l'indice"))); }
    const cote = el("div", { class: "ep-cote" }, vueChrono(E), mode === "jouer" ? vueJokers(E) : null,
      el("div", { class: "boite" }, el("button", { class: "b", onclick: () => { loc.toutRevele = !loc.toutRevele; rendre(); } }, ico("oeil"), loc.toutRevele ? "Masquer les réponses" : "Tout révéler"),
        el("button", { class: "b", title: "Copie l'épreuve sans les réponses, pour la donner à faire à la maison", onclick: () => copier(texteEpreuve(n, q)) }, ico("copie"), "Copier pour la maison"),
        (mode !== "jouer" || prefs.prep) && el("button", { class: "b", title: "Déroulement, matériel, critères, indice et réponses : à imprimer avant la séance", onclick: () => copier(ficheProf(n, q)) }, ico("copie"), "Copier la fiche du professeur"),
        mode === "jouer" && el("button", { class: "b or", onclick: () => { loc.onglet = "resultat"; rendre(); } }, "Résultat de l'épreuve →")));
    return el("div", { class: "ep-grille" }, contenu, cote);
  }

  function vueChrono(E) {
    if (!loc.chrono) loc.chrono = { total: (E.duree || 25) * 60, reste: (E.duree || 25) * 60, actif: false, id: null };
    const c = loc.chrono; const aff = el("div", { class: "chrono" + (c.reste <= 0 ? " fini" : "") });
    const maj = () => { const m = Math.floor(Math.max(0, c.reste) / 60), s = Math.max(0, c.reste) % 60; aff.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`; aff.classList.toggle("fini", c.reste <= 0); };
    maj();
    const tic = () => { c.reste--; maj(); if (c.reste === 0) { Son.jouer("cloche"); toast("Le temps est écoulé !"); } if (c.reste <= 0) { clearInterval(c.id); c.actif = false; bascule.replaceChildren(ico("play"), "Lancer"); } };
    const bascule = el("button", { class: "b plein", onclick: () => { if (c.actif) { clearInterval(c.id); c.actif = false; } else if (c.reste > 0) { c.id = setInterval(tic, 1000); c.actif = true; } bascule.replaceChildren(ico(c.actif ? "pause" : "play"), c.actif ? "Pause" : "Lancer"); } }, ico(c.actif ? "pause" : "play"), c.actif ? "Pause" : "Lancer");
    if (c.actif) { clearInterval(c.id); c.id = setInterval(tic, 1000); }
    loc.majChrono = maj;
    return el("div", { class: "boite" }, el("h3", {}, "Chronomètre"), aff, el("div", { class: "rangee" }, bascule, el("button", { class: "b", onclick: () => { c.reste = c.total; maj(); } }, ico("reset"), "Remettre")));
  }

  function vueJokers(E) {
    const lignes = [];
    const ligne = (svg, titre, texte, action, label = "Utiliser") => el("div", { class: "joker" }, el("span", { html: svg, style: "display:contents" }), el("div", {}, el("b", {}, titre), el("small", {}, texte)), action ? el("button", { class: "b", onclick: (ev) => { if (ev.detail > 1) return; action(ev); } }, label) : el("span", {}));
    ["rapeltout", "plume", "retourneur", "cape", "pimentine"].forEach((id) => {
      if (!etat.sac[id]) return; const O = OBJETS[id];
      lignes.push(ligne(ICONES[id], `${O.nom} ×${etat.sac[id]}`, O.effet, () => {
        retirerObjet(id); noter(`${O.nom} utilisé à l'étape ${n}`); Son.jouer("magie");
        if (O.auto === "indice") loc.indice = true;
        if (O.auto === "temps") { loc.chrono.reste += 300; loc.chrono.total += 300; }
        toast(`${O.nom} : ${O.effet}`); Store.sauver(); rendreHud(); rendre();
      }));
    });
    if (etat.compagnons.includes("botruc") && etat.usages.botruc !== "c" + ch.n) lignes.push(ligne(ICONES.botruc, "Brindille, le Botruc", "Un indice gratuit (une fois par chapitre).", () => { etat.usages.botruc = "c" + ch.n; loc.indice = true; Son.jouer("magie"); noter("Brindille donne un indice"); Store.sauver(); rendre(); }, "Appeler"));
    SORTS.filter((s) => s.freq === "etape" && sortDispo(s)).forEach((s) => lignes.push(ligne('<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#2B2116"/><path d="M18 46 40 24" stroke="#E8C978" stroke-width="4" stroke-linecap="round"/><circle cx="44" cy="20" r="6" fill="#FFF4C0"/></svg>', s.nom, s.effet, () => { marquerSort(s); noter(`${s.nom} lancé à l'étape ${n}`); Son.jouer("magie"); toast(`${s.nom} ! ${s.effet}`); Store.sauver(); rendreHud(); rendre(); }, "Lancer")));
    if (!lignes.length) lignes.push(el("p", { class: "note-prof", style: "border:0;padding:0" }, "Aucun joker disponible pour l'instant."));
    return el("div", { class: "boite" }, el("h3", {}, "Jokers de l'équipe"), lignes);
  }

  function vueResultat() {
    const choix = [["reussite", "Réussite", `+${XP_RESULTAT.reussite} XP et l'objet de l'étape`], ["partielle", "Partielle", `+${XP_RESULTAT.partielle} XP et l'objet de l'étape`], ["echec", "Échec", `+${XP_RESULTAT.echec} XP, pas d'objet`]];
    const resFinal = () => { let r = loc.resultat; if (loc.felix && r && r !== "reussite") r = "reussite"; else if (loc.protego && r === "echec") r = "partielle"; return r; };
    const v = el("div", { style: "display:grid;gap:18px" });
    v.append(el("h3", {}, "Comment l'équipe s'en est-elle sortie ?"), el("div", { class: "resultats" }, choix.map(([id, t, s]) => el("button", { class: "res " + id, "aria-pressed": String(loc.resultat === id), onclick: () => { loc.resultat = id; loc.felix = false; loc.protego = false; rendre(); } }, el("b", {}, t), el("small", {}, s)))));
    const extra = [];
    if (loc.resultat && loc.resultat !== "reussite" && etat.sac.felix) extra.push(el("button", { class: "b" + (loc.felix ? " plein" : ""), onclick: () => { loc.felix = !loc.felix; loc.protego = false; rendre(); } }, el("span", { html: ICONES.felix.replace("<svg ", '<svg width="26" height="26" '), style: "display:contents" }), loc.felix ? "Felix Felicis sera bu : l'épreuve devient réussie" : "Boire Felix Felicis (l'épreuve devient réussie)"));
    const protego = SORTS.find((s) => s.id === "protego");
    if (loc.resultat === "echec" && sortDispo(protego) && !loc.felix) extra.push(el("button", { class: "b" + (loc.protego ? " plein" : ""), onclick: () => { loc.protego = !loc.protego; rendre(); } }, loc.protego ? "Protego sera lancé : l'épreuve compte comme partielle" : "Lancer Protego (l'échec devient partiel)"));
    const patronum = SORTS.find((s) => s.id === "patronum");
    if (n === 16 && sortDispo(patronum)) extra.push(el("button", { class: "b" + (loc.patronum ? " plein" : ""), onclick: () => { loc.patronum = !loc.patronum; rendre(); } }, loc.patronum ? "Spero Patronum sera lancé : +100 XP" : "Lancer Spero Patronum contre l'Ombre (+100 XP)"));
    if (extra.length) v.append(el("div", { class: "rangee" }, extra));
    v.append(el("h3", {}, "Quelles maisons ont brillé ? (+10 points et +1 ★ pour leur héros)"),
      el("div", { class: "maisons-choix" }, ORDRE_MAISONS.map((m) => el("button", { class: "m-choix", style: `--hc:${MAISONS[m].c}`, "aria-pressed": String(loc.maisons.has(m)), onclick: () => { loc.maisons.has(m) ? loc.maisons.delete(m) : loc.maisons.add(m); rendre(); } }, el("i", {}), `${MAISONS[m].nom} · ${HEROS[HEROS_DE_MAISON[m]].court}`))));
    const r = resFinal();
    const gainObj = GAINS[n][0];
    const resume = [];
    if (r) {
      let xp = XP_RESULTAT[r] + (L.cp ? XP_CHECKPOINT : 0) + (r !== "echec" && etat.reliques.includes("coupe") ? 10 : 0) + (loc.patronum ? 100 : 0);
      resume.push(`+${xp} XP`);
      if (gainObj && gainObj.startsWith("comp:")) resume.push(COMPAGNONS[gainObj.slice(5)].nom + " rejoint l'équipe");
      else if (gainObj && r !== "echec") resume.push(OBJETS[gainObj].nom);
      if (L.cp) resume.push(RELIQUES[ch.relique].nom);
    }
    v.append(el("p", { class: "consigne" }, r ? "Gains : " + resume.join(" · ") : "Choisissez un résultat pour voir les gains."));
    v.append(el("button", { class: "b or valider", disabled: !r, onclick: () => { SEANCE.loc = null; Fen.fermer(); if (loc.chrono && loc.chrono.id) clearInterval(loc.chrono.id); validerEtape(n, { resultat: r, maisons: [...loc.maisons], felix: loc.felix, protego: loc.protego, patronum: loc.patronum }); } }, n === 16 ? "Valider la grande finale" : "Valider l'étape et avancer"));
    return v;
  }
  rendre();
  Scene3D.ok && Scene3D.viserLieu(n);
  const fermer = Fen.pile[Fen.pile.length - 1]; const ancien = fermer.onFermer;
  fermer.onFermer = () => { if (loc.chrono && loc.chrono.id) clearInterval(loc.chrono.id); ancien && ancien(); };
}

function texteEpreuve(n, q) {
  const E = q.epreuve, L = [];
  L.push(`Les Reliques des Fondateurs · Étape ${n} · ${LIEUX[n].nom}`, `${E.titre}`, "", E.consigne, "");
  if (E.code && E.code.message) { L.push("Message codé : " + E.code.message); if (E.code.cle) L.push("La clé : " + E.code.cle); L.push(""); }
  if (E.paires && E.paires.length) { const d = melangeFixe(E.paires.map((p) => p.droite), n); E.paires.forEach((p, i) => L.push(`${i + 1}. ${p.gauche}`)); L.push(""); d.forEach(([t], i) => L.push(`${String.fromCharCode(65 + i)}. ${t}`)); L.push(""); }
  if (E.ordre && E.ordre.length) { melangeFixe(E.ordre, n + 7).forEach(([t], i) => L.push(`${String.fromCharCode(65 + i)}. ${t}`)); L.push(""); }
  (E.questions || []).forEach((Q, i) => { L.push(`${i + 1}. ${Q.q}`); (Q.choix || []).forEach((c, k) => L.push(`   ${String.fromCharCode(65 + k)}. ${c}`)); });
  return L.join("\n");
}

function ficheProf(n, q) {
  const E = q.epreuve, L = [texteEpreuve(n, q), "", "FICHE DU PROFESSEUR (ne pas projeter)"];
  const lettre = (i) => String.fromCharCode(65 + i);
  if (q.note_prof) L.push("", "À PRÉPARER : " + q.note_prof);
  if (E.deroulement) L.push("", "DÉROULEMENT :", E.deroulement);
  if (E.reussite) L.push("", "CRITÈRES : " + E.reussite);
  if (E.indice) L.push("", "INDICE (affiché seulement avec un Rapeltout ou Brindille) : " + E.indice);
  L.push("", "RÉPONSES :");
  if (E.code && E.code.cle) L.push("Clé du code : " + E.code.cle);
  if (E.code && E.code.reponse) L.push("Message déchiffré : " + E.code.reponse);
  if (E.paires && E.paires.length) { const d = melangeFixe(E.paires.map((p) => p.droite), n); L.push(E.paires.map((p, i) => `${i + 1} → ${lettre(d.findIndex(([, j]) => j === i))}`).join("   ")); }
  if (E.ordre && E.ordre.length) { const m = melangeFixe(E.ordre, n + 7); L.push("Bon ordre : " + E.ordre.map((_, i) => lettre(m.findIndex(([, j]) => j === i))).join(" → ")); }
  (E.questions || []).forEach((Q, i) => L.push(`${i + 1}. ${Q.reponse}${Q.explication ? " · " + Q.explication : ""}`));
  if (q.defi_maison && q.defi_maison.titre) L.push("", "DÉFI MAISON : " + q.defi_maison.titre + (q.defi_maison.mot_de_passe ? " · mot de passe : " + q.defi_maison.mot_de_passe : " · création à valider"));
  return L.join("\n");
}

/* ================= Validation, récompenses, destin ================= */
function validerEtape(n, { resultat, maisons, felix, protego, patronum }) {
  const q = quete(n); const L = LIEUX[n], ch = chapitreDe(n);
  const copie = JSON.parse(JSON.stringify(etat)); copie.pile = [];
  etat.pile = [JSON.stringify(copie), ...etat.pile].slice(0, 3);
  const gains = { xp: 0, objets: [], comp: null, relique: null, annee: 0 };
  if (felix) { retirerObjet("felix"); noter("Felix Felicis bu"); }
  if (protego) marquerSort(SORTS.find((s) => s.id === "protego"));
  if (patronum) { marquerSort(SORTS.find((s) => s.id === "patronum")); gains.xp += 100; }
  gains.xp += XP_RESULTAT[resultat] + (L.cp ? XP_CHECKPOINT : 0) + (resultat !== "echec" && etat.reliques.includes("coupe") ? 10 : 0);
  maisons.forEach((m) => { etat.points[m] += 10; etat.maitrise[HEROS_DE_MAISON[m]] += 1; });
  const leader = (q && q.heros) || ch.heros; if (resultat === "reussite") etat.maitrise[leader] += 1;
  const g = GAINS[n][0];
  if (g && g.startsWith("comp:")) { const c = g.slice(5); if (!etat.compagnons.includes(c)) { etat.compagnons.push(c); gains.comp = c; } }
  else if (g && resultat !== "echec") { ajouterObjet(g); gains.objets.push(g); }
  if (L.cp && !etat.reliques.includes(ch.relique)) { etat.reliques.push(ch.relique); gains.relique = ch.relique; if (ch.relique === "diademe") ORDRE_MAISONS.forEach((m) => (etat.points[m] += 20)); }
  etat.etape = n; etat.resultats[n] = { r: resultat, m: maisons, d: new Date().toISOString() };
  noter(`Étape ${n} (${L.nom}) : ${({ reussite: "réussite", partielle: "partielle", echec: "échec" })[resultat]}`);
  gains.annee = gagnerXP(gains.xp, `étape ${n}`);
  Store.sauver();
  Store.instantane(`Après l'étape ${n} · ${L.nom}`);
  Son.jouer(resultat === "echec" ? "grave" : "tinte");
  const bloc = el("div", { class: "voile", style: "background:transparent;backdrop-filter:none" }); $("#fenetres").append(bloc);
  const suite = () => { bloc.remove(); rendreTout(); if (gains.relique) fenetreRelique(gains.relique, () => fenetreRecompenses(n, gains)); else fenetreRecompenses(n, gains); };
  if (Scene3D.ok) { Scene3D.majEtat({ ...etat, etape: n - 1, reliques: etat.reliques.filter((r) => r !== gains.relique) }); Scene3D.avancer(n - 1, n, () => { Scene3D.majEtat(etat); Scene3D.eclat(n); L.cp ? Scene3D.cinematique(n, suite) : suite(); }); }
  else suite();
  rendreHud();
}

function fenetreRelique(r, suite) {
  Son.jouer("fanfare"); etincelles(140);
  const R = RELIQUES[r];
  const c = el("div", { class: "f-corps centre" }, el("p", { class: "surtitre" }, "Relique des Fondateurs"), el("div", { class: "relique-scene", html: ICONES[r] }), el("h2", {}, R.nom), el("p", { class: "consigne" }, R.pouvoir),
    el("p", {}, `${etat.reliques.length} relique${etat.reliques.length > 1 ? "s" : ""} sur 4`), el("button", { class: "b or", onclick: () => { Fen.fermer(); } }, "Continuer"));
  Fen.ouvrir(c, { classe: "sombre", etroite: true, onFermer: suite });
}

function fenetreRecompenses(n, gains) {
  const q = quete(n); const D = q && q.defi_maison;
  const items = [];
  gains.objets.forEach((o) => items.push(el("div", { class: "gain" }, el("span", { html: ICONES[o], style: "display:contents" }), el("b", {}, OBJETS[o].nom), el("small", {}, OBJETS[o].effet))));
  if (gains.comp) items.push(el("div", { class: "gain" }, el("span", { html: ICONES[gains.comp], style: "display:contents" }), el("b", {}, COMPAGNONS[gains.comp].nom), el("small", {}, COMPAGNONS[gains.comp].effet)));
  const s = gains.annee ? SORTS.find((x) => x.annee === gains.annee) : null;
  const xpEl = el("div", { class: "gain-xp" }, "+0 XP");
  const c = el("div", { class: "f-corps centre" },
    el("p", { class: "surtitre" }, `Étape ${n} franchie · ${LIEUX[n].nom}`), xpEl,
    items.length ? el("div", { class: "gains" }, items) : null,
    s && el("div", { class: "annee-up" }, el("h3", {}, `Passage en ${nomAnnee(gains.annee)} !`), el("p", {}, `Nouveau sort : `, el("b", {}, s.nom), ` · ${s.effet}`)),
    q && q.message_ombre && n < 16 && el("div", { class: "ombre", style: "text-align:left;width:100%" }, el("small", {}, "Avant de partir, un parchemin noir tombe du plafond…"), q.message_ombre),
    D && D.titre && el("div", { class: "boite", style: "text-align:left;width:100%;background:rgba(255,255,255,.05);border-color:var(--filet)" }, el("h3", {}, n === 16 ? "Dernier défi, pour la galerie des héros" : "Défi maison pour la prochaine fois"), el("b", {}, D.titre), el("p", { style: "margin:0;white-space:pre-line" }, D.consigne), D.contenu && el("p", { style: "margin:0;white-space:pre-line;font-size:1.05rem" }, D.contenu),
      el("div", { class: "rangee" }, el("button", { class: "b", onclick: () => copier(`${D.titre}\n\n${D.consigne}\n\n${D.contenu || ""}`) }, ico("copie"), "Copier le défi (ENT, mail)"), el("small", { style: "color:var(--doux)" }, !GAINS[n][1] ? "Pas de coffre : le professeur affiche les plus belles cartes." : D.mot_de_passe ? "Récompense : un objet, avec le mot de passe trouvé." : "Récompense : un objet, si le professeur valide la création."))),
    el("div", { class: "rangee", style: "justify-content:center" }, n === 16
      ? el("button", { class: "b or", onclick: () => { Fen.fermer(); jouerScene("feux", fenetreFinale); } }, "La grande finale")
      : LIEUX[n].cp ? el("button", { class: "b or", onclick: () => Fen.fermer() }, "Continuer l'aventure")
        : el("button", { class: "b or", onclick: () => { Fen.fermer(); fenetreDestin(); } }, "Tirer la carte du destin")));
  Fen.ouvrir(c, { classe: "sombre", etroite: false, bloquante: true });
  let v = 0; const cible = gains.xp; const pas = Math.max(1, Math.round(cible / 40)); const id = setInterval(() => { v = Math.min(cible, v + pas); xpEl.textContent = `+${v} XP`; if (v >= cible) clearInterval(id); }, 30);
}

function tirerCarte() { const pool = DESTIN.filter((d) => !etat.destins.includes(d.id)); const c = pool[Math.floor(Math.random() * pool.length)]; etat.destins = [c.id, ...etat.destins].slice(0, 6); return c; }
function texteEffet(e, detail) {
  if (e.xp) return `${e.xp > 0 ? "+" : ""}${e.xp} XP`;
  if (e.toutes) return `${e.toutes} points pour chaque maison`;
  if (e.perte) return detail ? `Objet perdu : ${detail}` : "Votre sac était vide. Ouf !";
  if (e.objet) return `Gagné : ${OBJETS[e.objet].nom}`;
  if (e.maison) return `+${e.pts} points pour ${MAISONS[e.maison].nom}`;
  if (e.hasard) return `Dans le colis : ${detail}`;
  if (e.choix) return `+${e.choix} points pour la maison choisie`;
  return "Aucun effet";
}
function fenetreDestin(dejaRetire = false) {
  const carte = tirerCarte(); const avant = JSON.stringify(etat);
  const zone = el("div", { class: "carte-destin" }); const inner = el("div", { class: "inner" });
  const dos = el("div", { class: "dos" }, el("span", {}, "Carte du destin"));
  const face = el("div", { class: "face" + (carte.nefaste ? " nefaste" : "") });
  inner.append(dos, face); zone.append(inner);
  const actions = el("div", { class: "rangee", style: "justify-content:center" });
  const c = el("div", { class: "f-corps centre" }, el("p", { class: "surtitre" }, "La carte du destin"), zone, actions);
  Fen.ouvrir(c, { classe: "sombre", etroite: true, bloquante: true });
  let detail = "";
  function appliquer() {
    const e = carte.effet;
    if (e.xp) gagnerXP(e.xp, carte.titre);
    if (e.toutes) ORDRE_MAISONS.forEach((m) => (etat.points[m] = Math.max(0, etat.points[m] + e.toutes)));
    if (e.perte) { const ids = Object.keys(etat.sac); if (ids.length) { const id = ids[Math.floor(Math.random() * ids.length)]; retirerObjet(id); detail = OBJETS[id].nom; } }
    if (e.objet) ajouterObjet(e.objet);
    if (e.maison) etat.points[e.maison] += e.pts;
    if (e.hasard) { const id = objetHasard(); ajouterObjet(id); detail = OBJETS[id].nom; }
    noter(`Carte du destin : ${carte.titre}`); Store.sauver(); rendreHud();
  }
  function retourner() {
    Son.jouer(carte.nefaste ? "grave" : "magie");
    face.replaceChildren(el("h3", {}, carte.titre), el("p", {}, carte.texte));
    zone.classList.add("retournee");
    if (carte.effet.choix) {
      face.append(el("p", { class: "effet" }, "Quelle maison ?"), el("div", { class: "rangee", style: "justify-content:center" }, ORDRE_MAISONS.map((m) => el("button", { class: "b", style: `border-color:${MAISONS[m].c}`, onclick: () => { etat.points[m] += carte.effet.choix; noter(`Choixpeau : +${carte.effet.choix} pour ${MAISONS[m].nom}`); Store.sauver(); rendreHud(); Son.jouer("tinte"); face.querySelector(".rangee").replaceWith(el("p", { class: "effet" }, `+${carte.effet.choix} points pour ${MAISONS[m].nom}`)); finir(); } }, MAISONS[m].nom))));
      actions.replaceChildren(); return;
    }
    const ex = SORTS.find((s) => s.id === "expelliarmus"), exDispo = sortDispo(ex);
    appliquer();
    face.append(el("p", { class: "effet" }, texteEffet(carte.effet, detail)));
    const prot = [];
    if (carte.nefaste) {
      const annuler = (label, consommer) => prot.push(el("button", { class: "b", onclick: () => { const rev = etat.rev; etat = completer(JSON.parse(avant)); etat.rev = rev; consommer(); noter(`${label} annule « ${carte.titre} »`); Store.sauver(); rendreTout(); Son.jouer("magie"); face.querySelector(".effet").textContent = `Annulé grâce à : ${label} !`; actions.replaceChildren(boutonFin()); } }, `Annuler avec ${label}`));
      if (etat.sac.bezoard) annuler("le Bézoard", () => retirerObjet("bezoard"));
      if (exDispo) annuler("Expelliarmus", () => marquerSort(ex));
      if (etat.reliques.includes("epee") && etat.usages.epee !== "c" + chapCourant()) annuler("l'Épée de Gryffondor", () => { etat.usages.epee = "c" + chapCourant(); });
    }
    if (!dejaRetire && etat.reliques.includes("medaillon") && etat.usages.medaillon !== "c" + chapCourant()) prot.push(el("button", { class: "b", onclick: () => { const rev = etat.rev; etat = completer(JSON.parse(avant)); etat.rev = rev; etat.usages.medaillon = "c" + chapCourant(); noter("Le Médaillon fait tirer une nouvelle carte"); Store.sauver(); rendreTout(); Fen.fermer(); fenetreDestin(true); } }, "Médaillon : tirer une autre carte"));
    actions.replaceChildren(...prot, boutonFin()); actions.style.pointerEvents = "none"; setTimeout(() => { actions.style.pointerEvents = ""; }, 600);
  }
  function boutonFin() { return el("button", { class: "b or", onclick: () => Fen.fermer() }, "Continuer"); }
  function finir() { actions.replaceChildren(boutonFin()); }
  actions.append(el("button", { class: "b or", onclick: retourner }, "Retourner la carte"));
}

function fenetreFinale() {
  Son.jouer("fanfare"); etincelles(220);
  const classement = [...ORDRE_MAISONS].sort((a, b) => etat.points[b] - etat.points[a]);
  const c = el("div", { class: "f-corps centre" },
    el("p", { class: "surtitre" }, "Juin · La Grande Salle"), el("h2", {}, "Méfait accompli !"),
    el("p", { class: "consigne" }, "Les quatre reliques des Fondateurs sont réunies et l'Ombre est démasquée. Poudlard est sauvé."),
    el("div", { class: "gains" }, ORDRE_RELIQUES.map((r) => el("div", { class: "gain" }, el("span", { html: ICONES[r], style: "display:contents" }), el("b", {}, RELIQUES[r].nom)))),
    el("p", {}, `L'équipe termine en ${nomAnnee(anneeDe(etat.xp))} avec ${etat.xp} XP.`),
    el("h3", {}, "La Coupe des Quatre Maisons"),
    el("div", { class: "gains" }, classement.map((m, i) => el("div", { class: "gain", style: `border-color:${MAISONS[m].c}` }, el("b", { style: "font-size:1.6rem" }, i === 0 ? "1er" : `${i + 1}e`), el("b", { style: `color:${MAISONS[m].clair}` }, MAISONS[m].nom), el("small", {}, `${etat.points[m]} points`)))),
    el("button", { class: "b or", onclick: () => Fen.fermer() }, "Revoir la carte"));
  Fen.ouvrir(c, { classe: "sombre" });
}

/* ================= Sac, sorts, défis, réglages ================= */
function fenetreSac() {
  const corps = el("div", { class: "f-corps" });
  const rendre = () => {
    const libre = (id) => OBJETS[id].quand === "libre";
    corps.replaceChildren(el("h2", {}, "Le sac de l'équipe"),
      el("h3", {}, "Objets et potions"),
      el("div", { class: "grille-objets" }, ORDRE_OBJETS.map((id) => {
        const q = etat.sac[id] || 0; const O = OBJETS[id];
        return el("div", { class: "objet" + (q ? "" : " vide") }, el("span", { html: ICONES[id], style: "display:contents" }),
          el("div", {}, el("b", {}, O.nom, el("span", { class: "qte" }, "×" + q)), el("small", {}, O.effet),
            el("small", {}, ({ epreuve: "À utiliser pendant une épreuve.", resultat: "À utiliser au moment du résultat.", destin: "À utiliser sur une carte du destin.", libre: "Utilisable maintenant." })[O.quand]),
            q && libre(id) ? el("div", { class: "rangee" }, el("button", { class: "b or", onclick: () => utiliserLibre(id, rendre) }, "Utiliser")) : null));
      })),
      el("h3", {}, "Compagnons"),
      el("div", { class: "grille-objets" }, Object.keys(COMPAGNONS).map((id) => el("div", { class: "objet" + (etat.compagnons.includes(id) ? "" : " vide") }, el("span", { html: ICONES[id], style: "display:contents" }), el("div", {}, el("b", {}, etat.compagnons.includes(id) ? COMPAGNONS[id].nom : "Compagnon encore inconnu"), el("small", {}, etat.compagnons.includes(id) ? COMPAGNONS[id].effet : "Il rejoindra peut-être l'équipe en chemin…"))))),
      el("h3", {}, "Reliques des Fondateurs"),
      el("div", { class: "grille-objets" }, ORDRE_RELIQUES.map((id) => el("div", { class: "objet" + (etat.reliques.includes(id) ? "" : " vide") }, el("span", { html: ICONES[id], style: "display:contents" }), el("div", {}, el("b", {}, RELIQUES[id].nom), el("small", {}, etat.reliques.includes(id) ? RELIQUES[id].pouvoir : "Encore cachée quelque part dans le domaine."))))));
  };
  rendre(); Fen.ouvrir(corps, { classe: "sombre" });
}
function utiliserLibre(id, apres) {
  if (!retirerObjet(id)) return;
  if (id === "chocogrenouille") { gagnerXP(25, "Chocogrenouille"); toast("Miam ! +25 XP. Et la carte à collectionner est… Albus Dumbledore !"); Son.jouer("tinte"); }
  if (id === "dragees") { const ok = Math.random() < 0.5; gagnerXP(ok ? 50 : -20, "Dragées surprises"); toast(ok ? "Goût caramel ! +50 XP" : "Goût… vomi ! −20 XP"); Son.jouer(ok ? "tinte" : "grave"); }
  Store.sauver(); rendreHud(); apres && apres();
}
function fenetreSorts() {
  const corps = el("div", { class: "f-corps" });
  const rendre = () => {
    const a = anneeDe(etat.xp);
    corps.replaceChildren(el("h2", {}, "Le grimoire des sorts"), el("p", { style: "margin:0;color:var(--doux)" }, `L'équipe est en ${nomAnnee(a)}. Chaque nouvelle année débloque un sort.`),
      ...SORTS.map((s) => {
        const ouvert = a >= s.annee, dispo = sortDispo(s);
        const etatTxt = !ouvert ? `Débloqué en ${nomAnnee(s.annee)}` : dispo ? "Disponible" : s.freq === "finale" ? "Réservé à la finale" : s.freq === "etape" ? "Déjà lancé pour cette étape" : "Déjà lancé ce chapitre";
        return el("div", { class: "sort" + (ouvert ? "" : " verrou") }, el("span", { class: "an" }, s.annee), el("div", {}, el("b", {}, s.nom), el("small", {}, s.effet), el("small", {}, s.freq === "etape" ? "Une fois par étape." : s.freq === "chapitre" ? "Une fois par chapitre." : "Une seule fois.")),
          s.id === "accio" && ouvert && dispo ? el("button", { class: "b or", onclick: () => { marquerSort(s); const id = objetHasard(); ajouterObjet(id); noter(`Accio : ${OBJETS[id].nom}`); Store.sauver(); rendreHud(); Son.jouer("magie"); toast(`Accio ! ${OBJETS[id].nom} file dans le sac.`); rendre(); } }, "Lancer") : el("span", { class: "etat" + (ouvert && dispo ? " dispo" : "") }, etatTxt));
      }));
  };
  rendre(); Fen.ouvrir(corps, { classe: "sombre" });
}
function fenetreDefis() {
  const corps = el("div", { class: "f-corps" });
  const rendre = () => {
    const liste = []; for (let n = 1; n <= Math.min(16, etat.etape); n++) { const q = quete(n); if (q && q.defi_maison && q.defi_maison.titre) liste.push(n); }
    const alohomora = SORTS.find((s) => s.id === "alohomora");
    corps.replaceChildren(el("h2", {}, "Les défis maison"), el("p", { style: "margin:0;color:var(--parch-doux)" }, "À faire chez soi entre deux séances. Un défi réussi rapporte un objet et " + XP_DEFI + " XP."),
      liste.length ? el("div", { class: "liste-defis" }, liste.reverse().map((n) => {
        const D = quete(n).defi_maison; const fait = !!etat.defis[n]; const champ = el("input", { type: "text", id: "mdp-" + n, placeholder: "MOT DE PASSE", autocomplete: "off", "aria-label": "Mot de passe du défi de l'étape " + n });
        const recompense = GAINS[n][1];
        return el("div", { class: "defi" + (fait ? " fait" : "") }, el("div", { class: "surtitre" }, `Étape ${n} · ${LIEUX[n].nom}${fait ? " · coffre ouvert" : ""}`), el("b", { style: "font-size:1.15rem" }, D.titre),
          el("details", {}, el("summary", {}, "Afficher le défi"), el("p", { style: "white-space:pre-line;font-size:1.1rem" }, D.consigne), D.contenu && el("p", { style: "white-space:pre-line;font-size:1.1rem" }, D.contenu), el("button", { class: "b", onclick: () => copier(`${D.titre}\n\n${D.consigne}\n\n${D.contenu || ""}`) }, ico("copie"), "Copier le défi")),
          fait ? el("p", { style: "margin:0" }, "Défi réussi. Récompense déjà reçue.") : n < etat.etape ? el("p", { style: "margin:0" }, "Coffre refermé : ce défi était à rendre à la séance suivante.") : el("div", { style: "display:grid;gap:8px" },
            recompense && el("small", {}, "Dans le coffre : " + OBJETS[recompense].nom),
            D.mot_de_passe ? el("div", { class: "champ-mdp" }, champ, el("button", { class: "b plein", onclick: () => { if (normaliser(champ.value) === normaliser(D.mot_de_passe)) reussirDefi(n, "mot de passe", rendre); else { Son.jouer("grave"); champ.value = ""; champ.placeholder = "RATÉ, ESSAYEZ ENCORE"; champ.animate([{ transform: "translateX(-8px)" }, { transform: "translateX(8px)" }, { transform: "none" }], { duration: 300 }); } } }, ico("coffre"), "Ouvrir le coffre"))
              : el("button", { class: "b plein", onclick: () => reussirDefi(n, "création validée", rendre) }, "Valider la création (professeur)"),
            sortDispo(alohomora) && el("button", { class: "b", onclick: () => { marquerSort(alohomora); reussirDefi(n, "Alohomora", rendre); } }, "Alohomora : ouvrir sans mot de passe")));
      })) : el("p", {}, "Aucun défi maison pour l'instant. Le premier arrivera après l'étape 1."));
  };
  rendre(); Fen.ouvrir(corps, { classe: "parchemin" });
}
function reussirDefi(n, comment, apres) {
  etat.defis[n] = { d: new Date().toISOString(), c: comment };
  const r = GAINS[n][1]; if (r) ajouterObjet(r);
  gagnerXP(XP_DEFI + (etat.compagnons.includes("niffleur") ? 15 : 0), `défi maison ${n}`);
  noter(`Défi maison ${n} réussi (${comment})`); Store.sauver(); rendreHud(); Son.jouer("fanfare"); etincelles(60);
  toast(`Coffre ouvert ! ${r ? OBJETS[r].nom + " rejoint le sac." : ""}${etat.compagnons.includes("niffleur") ? " Pépite déniche 15 XP de plus." : ""}`);
  apres && apres();
}
function copier(t) {
  try { navigator.clipboard.writeText(t).then(() => toast("Copié !"), () => montrerTexte(t)); } catch (e) { montrerTexte(t); }
}
function montrerTexte(t) { const ta = el("textarea", { class: "sauvegarde", readonly: true }, t); Fen.ouvrir(el("div", { class: "f-corps" }, el("h3", {}, "Sélectionnez le texte puis copiez-le"), ta), { classe: "sombre", etroite: true }); setTimeout(() => { ta.focus(); ta.select(); }, 50); }

function fenetreReglages() {
  const corps = el("div", { class: "f-corps" });
  const rendre = () => {
    corps.replaceChildren(el("h2", {}, "Réglages du professeur"),
      el("div", { class: "reglages" },
        el("div", { class: "reglage" }, el("div", {}, el("b", {}, "Mode préparation"), el("p", {}, "Affiche le nom des lieux à venir et permet d'ouvrir leurs épreuves en aperçu. À couper avant de projeter.")), el("button", { class: "b" + (prefs.prep ? " or" : ""), onclick: () => { prefs.prep = !prefs.prep; sauverPrefs(); rendreTout(); rendre(); } }, prefs.prep ? "Activé" : "Désactivé")),
        el("div", { class: "reglage" }, el("div", {}, el("b", {}, "Sons"), el("p", {}, "Carillons, fanfares, sifflet du train et cloche du chronomètre.")), el("button", { class: "b" + (!prefs.muet ? " or" : ""), onclick: () => { prefs.muet = !prefs.muet; sauverPrefs(); rendre(); } }, prefs.muet ? "Coupés" : "Activés")),
        el("div", { class: "reglage" }, el("div", {}, el("b", {}, "Annuler la dernière étape"), el("p", {}, etat.pile.length ? "Revient à la situation d'avant la dernière validation (erreur de clic, mauvais résultat)." : "Rien à annuler pour l'instant.")), el("button", { class: "b", disabled: !etat.pile.length, onclick: () => { const rev = etat.rev; const pile = etat.pile.slice(1); etat = completer(JSON.parse(etat.pile[0])); etat.pile = pile; etat.rev = rev; noter("Dernière étape annulée"); Store.sauver(); rendreTout(); Scene3D.ok && Scene3D.suivreEquipe(); toast("Dernière étape annulée."); rendre(); } }, "Annuler")),
        el("div", { class: "reglage" }, el("div", {}, el("b", {}, "Plein écran"), el("p", {}, "Pour projeter la carte au tableau.")), el("button", { class: "b", onclick: () => { const d = document.documentElement; (document.fullscreenElement ? document.exitFullscreen() : d.requestFullscreen ? d.requestFullscreen() : Promise.reject()).catch(() => toast("Le plein écran n'est pas disponible ici.")); } }, "Basculer")),
        !Scene3D.ok && el("div", { class: "reglage" }, el("div", {}, el("b", {}, "Carte 3D"), el("p", {}, prefs.force3d ? "La 3D est forcée sur cet ordinateur. Si elle est trop lente, revenez à la carte 2D." : "Cet ordinateur n'a pas d'accélération graphique : le jeu affiche la carte 2D, sans les scènes animées. Vous pouvez forcer la 3D (elle risque d'être lente).")), el("button", { class: "b", onclick: () => { prefs.force3d = !prefs.force3d; sauverPrefs(); location.reload(); } }, prefs.force3d ? "Revenir à la 2D" : "Forcer la 3D")),
        Scene3D.ok && prefs.force3d && el("div", { class: "reglage" }, el("div", {}, el("b", {}, "Carte 3D forcée"), el("p", {}, "Si la carte est trop lente sur cet ordinateur, revenez à la carte 2D.")), el("button", { class: "b", onclick: () => { prefs.force3d = false; sauverPrefs(); location.reload(); } }, "Revenir à la 2D")),
        el("div", { class: "reglage", style: "display:grid" }, el("b", {}, "Journal de la partie"), el("ul", { class: "journal" }, etat.journal.length ? etat.journal.map((j) => el("li", {}, new Date(j.d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) + " · " + j.t)) : el("li", {}, "Rien pour l'instant.")))));
  };
  rendre(); Fen.ouvrir(corps, { classe: "sombre" });
}

function fenetreAide() {
  const etape = (n, t, d) => el("div", { class: "sort" }, el("span", { class: "an" }, n), el("div", {}, el("b", { style: "font-size:1.15rem" }, t), el("small", {}, d)), el("span", {}));
  const c = el("div", { class: "f-corps" },
    el("h2", {}, "Comment jouer"),
    el("p", { style: "margin:0;color:var(--doux)" }, "Une séance d'1 h tous les 15 jours, de novembre à juin : 16 étapes, 4 chapitres, 4 reliques. Toute la classe forme une seule équipe de 4 héros ; chaque maison incarne le sien. Chaque classe a sa propre partie."),
    el("h3", {}, "Une séance"),
    etape(1, "Choisir la classe", "Sur la page d'accueil, « Ouvrir la carte ». La première fois, le Poudlard Express dépose les élèves au château."),
    etape(2, "La lettre (5 min)", "Bouton doré en bas : on lit la lettre de Moka. Certains lieux s'ouvrent sur une scène animée."),
    etape(3, "L'épreuve (25-35 min)", "Chronomètre, réponses à révéler une par une, jokers. Les maisons répondent sur leur ardoise. Une épreuve peut aussi partir à la maison avec « Copier pour la maison »."),
    etape(4, "Le résultat (5 min)", "Réussite, partielle ou échec, et les maisons qui ont brillé. L'équipe avance quoi qu'il arrive."),
    etape(5, "Récompenses et destin (5 min)", "XP, objets, reliques aux étapes 4, 8, 12 et 16, puis une carte du destin. On annonce le défi maison."),
    el("h3", {}, "À l'écran"),
    el("div", { class: "grille-objets" },
      el("div", { class: "objet" }, el("span", { html: ICONES.coupe, style: "display:contents" }), el("div", {}, el("b", {}, "En haut"), el("small", {}, "La classe, le chapitre, l'année et les 16 étapes ; les 4 grands ronds sont les reliques."))),
      el("div", { class: "objet" }, el("span", { html: portraitSVG("pou"), style: "display:contents" }), el("div", {}, el("b", {}, "En bas à gauche"), el("small", {}, "Les 4 héros. Une maison qui brille donne +1 ★ à son héros : Novice, Adepte, Expert, Légende."))),
      el("div", { class: "objet" }, el("span", { html: sablierSVG("#E2B12C", 0.6), style: "display:contents" }), el("div", {}, el("b", {}, "En bas à droite"), el("small", {}, "Les sabliers des maisons. Cliquez sur un sablier pour ajouter ou retirer des points."))),
      el("div", { class: "objet" }, el("span", { html: '<svg viewBox="0 0 64 64"><rect x="10" y="16" width="44" height="6" rx="3" fill="#E8C978"/><rect x="10" y="29" width="44" height="6" rx="3" fill="#E8C978"/><rect x="10" y="42" width="44" height="6" rx="3" fill="#E8C978"/></svg>', style: "display:contents" }), el("div", {}, el("b", {}, "Le menu ☰"), el("small", {}, "Défis maison, sac, sorts, sauvegardes, scènes à revoir et réglages.")))),
    el("h3", {}, "Pour le professeur"),
    el("p", { style: "margin:0;color:var(--doux);line-height:1.5" }, "Avant chaque séance : menu ☰ › Réglages › mode préparation, ouvrez l'étape suivante (bouton doré), onglet « L'épreuve », « Copier la fiche du professeur », imprimez-la et préparez le matériel ; coupez le mode préparation avant de projeter. La sauvegarde est automatique et un point de sauvegarde est créé après chaque étape : menu ☰ › Sauvegardes pour revenir en arrière ou recommencer à zéro."));
  Fen.ouvrir(c, { classe: "sombre" });
}

/* ================= Accueil : une carte par classe ================= */
function rendreAccueil() {
  const box = $("#liste-classes"); if (!box) return;
  box.replaceChildren(...registre.liste.map((c) => {
    const e = partieDe(c.id) || etatNeuf(); const fini = e.etape >= 16, prochaine = Math.min(16, e.etape + 1);
    const res = e.resultats && e.resultats[e.etape]; const derniere = res && res.d ? new Date(res.d) : null;
    return el("article", { class: "carte-classe verre" },
      el("div", { class: "cc-tete" }, el("h2", {}, c.nom), el("button", { class: "btn-rond petit", "aria-label": `Options de la classe ${c.nom}`, title: "Options", onclick: (ev) => menuClasse(c, ev.currentTarget) }, ico("points"))),
      el("p", { class: "cc-etat" }, e.etape === 0 ? "Nouvelle aventure" : fini ? "Aventure terminée" : `Étape ${prochaine} sur 16`),
      el("p", { class: "cc-lieu" }, e.etape === 0 ? (e.introVue ? "L'équipe attend au Grand Hall" : "Départ en Poudlard Express") : fini ? "Les quatre reliques sont réunies" : LIEUX[prochaine].nom),
      el("span", { class: "barre" }, el("i", { style: `width:${Math.round((e.etape / 16) * 100)}%` })),
      el("div", { class: "cc-bas" },
        el("div", { class: "cc-reliques" }, ORDRE_RELIQUES.map((r) => el("span", { class: "slot" + (e.reliques.includes(r) ? " ok" : ""), title: RELIQUES[r].nom, html: ICONES[r] }))),
        el("small", {}, derniere ? "Dernière séance : " + derniere.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) : nomAnnee(anneeDe(e.xp)))),
      el("button", { class: "btn-ouvrir", onclick: () => ouvrirClasse(c.id) }, !e.introVue && Scene3D.ok ? "Monter dans le train" : "Ouvrir la carte"));
  }));
}
function menuClasse(c, ancre) {
  document.querySelectorAll(".popover-menu").forEach((p) => p.remove());
  const r = ancre.getBoundingClientRect();
  const fermer = () => p.remove();
  const item = (texte, action) => el("button", { class: "lien", onclick: () => { fermer(); action(); } }, texte);
  const p = el("div", { class: "popover-menu verre", style: `top:${r.bottom + 6}px;left:${Math.max(8, Math.min(innerWidth - 248, r.right - 240))}px` },
    item("Renommer", () => fenetreNomClasse(c)),
    item("Sauvegardes", () => fenetreSauvegardes(c.id)),
    Scene3D.ok && item("Revoir l'arrivée en train", () => ouvrirClasse(c.id, { train: true })),
    item("Recommencer à zéro", () => fenetreRaz(c.id)),
    registre.liste.length > 1 && item("Supprimer la classe", () => fenetreSupprimer(c)));
  document.body.append(p);
  setTimeout(() => document.addEventListener("pointerdown", function f(e) { if (!p.contains(e.target)) { fermer(); document.removeEventListener("pointerdown", f); } }), 0);
}
function fenetreNomClasse(c) {
  const champ = el("input", { class: "champ", type: "text", value: c ? c.nom : "", placeholder: "Par exemple : 6e C", maxlength: "24", "aria-label": "Nom de la classe" });
  const valider = () => {
    const nom = champ.value.trim(); if (!nom) { champ.focus(); return; }
    if (c) c.nom = nom; else { const id = "c" + Date.now().toString(36); registre.liste.push({ id, nom }); parties[id] = etatNeuf(); ls.ecrire(CLE2 + "-partie-" + id, parties[id]); }
    Store.sauverRegistre(); Store.relier(); rendreAccueil(); if (courante) rendreHud(); Fen.fermer();
  };
  champ.addEventListener("keydown", (e) => { if (e.key === "Enter") valider(); });
  Fen.ouvrir(el("div", { class: "f-corps" }, el("h2", {}, c ? "Renommer la classe" : "Nouvelle classe"), champ, el("div", { class: "rangee" }, el("button", { class: "b or", onclick: valider }, c ? "Renommer" : "Créer la classe"))), { classe: "sombre", etroite: true });
  setTimeout(() => { champ.focus(); champ.select(); }, 60);
}
function fenetreSupprimer(c) {
  const champ = el("input", { class: "champ", type: "text", placeholder: "Tapez SUPPRIMER", "aria-label": "Confirmation" });
  Fen.ouvrir(el("div", { class: "f-corps" }, el("h2", {}, `Supprimer la classe ${c.nom}`), el("p", { style: "margin:0;color:var(--doux)" }, "Sa partie disparaîtra de la page d'accueil. Tapez SUPPRIMER pour confirmer."), champ,
    el("div", { class: "rangee" }, el("button", { class: "b", onclick: () => {
      if (champ.value.trim().toUpperCase() !== "SUPPRIMER") { toast("Tapez SUPPRIMER pour confirmer."); return; }
      registre.liste = registre.liste.filter((x) => x.id !== c.id); ls.oublier(CLE2 + "-partie-" + c.id);
      Store.sauverRegistre(); Store.relier(); rendreAccueil(); Fen.fermer(); toast(`Classe ${c.nom} supprimée.`);
    } }, "Supprimer"))), { classe: "sombre", etroite: true });
}
function fenetreRaz(id) {
  const champ = el("input", { class: "champ", type: "text", placeholder: "Tapez RECOMMENCER", "aria-label": "Confirmation" });
  Fen.ouvrir(el("div", { class: "f-corps" }, el("h2", {}, `Recommencer à zéro · ${nomClasse(id)}`),
    el("p", { style: "margin:0;color:var(--doux)" }, "La classe repart du Poudlard Express : étapes, XP, objets, reliques et points des maisons reviennent à zéro. Un point de sauvegarde est créé juste avant : vous pourrez revenir en arrière. Tapez RECOMMENCER pour confirmer."), champ,
    el("div", { class: "rangee" }, el("button", { class: "b or", onclick: () => {
      if (champ.value.trim().toUpperCase() !== "RECOMMENCER") { toast("Tapez RECOMMENCER pour confirmer."); return; }
      Store.instantane("Avant la remise à zéro", id); remplacerPartie(id, etatNeuf(), "Nouvelle partie");
      Fen.tout(); toast(`${nomClasse(id)} : nouvelle partie.`); if (id === courante) afficherAccueil();
    } }, "Recommencer à zéro"))), { classe: "sombre", etroite: true });
}

/* ================= Sauvegardes ================= */
function fenetreSauvegardes(id) {
  const corps = el("div", { class: "f-corps" });
  Fen.ouvrir(corps, { classe: "sombre" });
  const date = (d) => new Date(d).toLocaleString("fr-FR", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const resume = (s) => `${s.etape === 0 ? "Départ" : s.etape >= 16 ? "Aventure terminée" : `Étape ${s.etape} franchie`} · ${s.xp} XP · ${s.reliques} relique${s.reliques > 1 ? "s" : ""}`;
  const rendre = async () => {
    const e = partieDe(id);
    corps.replaceChildren(el("h2", {}, `Sauvegardes · ${nomClasse(id)}`), el("p", { style: "margin:0;color:var(--doux)" }, "Chargement…"));
    const liste = await Store.sauvegardes(id);
    const code = btoa(unescape(encodeURIComponent(JSON.stringify({ ...e, pile: [] }))));
    const zone = el("textarea", { class: "sauvegarde", placeholder: "Collez ici un code de secours" });
    corps.replaceChildren(el("h2", {}, `Sauvegardes · ${nomClasse(id)}`),
      el("p", { style: "margin:0;color:var(--doux)" }, `Aujourd'hui : ${resume({ etape: e.etape, xp: e.xp, reliques: e.reliques.length })}. Un point de sauvegarde est créé automatiquement après chaque étape.`),
      el("div", { class: "rangee" },
        el("button", { class: "b or", onclick: () => { Store.instantane("Sauvegarde manuelle", id); toast("Point de sauvegarde créé."); rendre(); } }, ico("disque"), "Sauvegarder maintenant"),
        el("button", { class: "b", onclick: () => { Fen.fermer(); fenetreRaz(id); } }, ico("reset"), "Recommencer à zéro")),
      el("h3", {}, "Revenir à un point de sauvegarde"),
      liste.length ? el("div", { class: "liste-sauv" }, liste.map((s) => el("div", { class: "sauv" },
        el("div", {}, el("b", {}, s.label), el("small", {}, `${date(s.date)} · ${resume(s)}`)),
        el("button", { class: "b", onclick: () => {
          let n; try { n = completer(JSON.parse(s.etat)); } catch (er) { toast("Cette sauvegarde est illisible."); return; }
          Store.instantane("Avant la restauration", id); n.introVue = true; remplacerPartie(id, n, `Retour à la sauvegarde : ${s.label}`);
          toast(`Retour à : ${s.label}`); rendre();
        } }, "Restaurer"))))
        : el("p", { style: "margin:0;color:var(--doux)" }, "Aucun point de sauvegarde pour l'instant."),
      el("details", { class: "secours" }, el("summary", {}, "Code de secours (pour changer d'ordinateur)"),
        el("div", { style: "display:grid;gap:8px;margin-top:10px" },
          el("button", { class: "b", onclick: () => copier(code) }, ico("copie"), "Copier le code de cette partie"), zone,
          el("button", { class: "b", onclick: () => { try { const n = JSON.parse(decodeURIComponent(escape(atob(zone.value.trim())))); if (n.v !== 1) throw 0; Store.instantane("Avant la restauration", id); remplacerPartie(id, completer(n), "Partie restaurée depuis un code"); toast("Partie restaurée."); rendre(); } catch (er) { toast("Ce code de sauvegarde n'est pas valide."); } } }, "Restaurer ce code"))));
  };
  rendre();
}

/* ================= Scènes animées ================= */
const SCENES_ETAPE = { 6: "hippogriffe", 9: "saule", 10: "calmar", 12: "plongee", 13: "vif" };
const NOMS_SCENES = { express: ["L'arrivée en Poudlard Express", 0], hippogriffe: ["Le vol de l'hippogriffe", 6], saule: ["La colère du Saule cogneur", 9], calmar: ["Le monstre du lac", 10], plongee: ["Plongée sous le lac noir", 12], vif: ["La chasse au Vif d'or", 13], feux: ["Les feux de la victoire", 17] };
function jouerScene(id, fin) {
  if (!Scene3D.ok) { if (fin) fin(); return; }
  const cin = $("#cinema"), txt = $("#cinema-texte"), hud = $("#hud");
  hud.hidden = true; cin.hidden = false; txt.textContent = ""; txt.classList.remove("on"); $("#infobulle").hidden = true;
  const touche = (e) => { if (e.key === "Escape" || e.key === "Enter") { e.preventDefault(); Scene3D.passerScene(); } };
  document.addEventListener("keydown", touche);
  $("#btn-passer").onclick = () => Scene3D.passerScene();
  setTimeout(() => $("#btn-passer").focus({ preventScroll: true }), 50);
  Scene3D.jouerScene(id, {
    classe: nomClasse(courante),
    son: (s) => Son.jouer(s),
    texte: (t) => { if (t) { txt.textContent = t; txt.classList.remove("on"); void txt.offsetWidth; txt.classList.add("on"); } else txt.classList.remove("on"); },
    fin: () => { document.removeEventListener("keydown", touche); cin.hidden = true; if (courante && $("#accueil").hidden) hud.hidden = false; if (fin) fin(); },
  });
}
function lancerEtape() {
  if (etat.etape >= 16) return fenetreFinale();
  const n = etat.etape + 1, sc = SCENES_ETAPE[n];
  if (sc && Scene3D.ok && !etat.scenes[n]) { etat.scenes[n] = 1; Store.sauver(); jouerScene(sc, () => ouvrirQuete(n, "jouer")); }
  else ouvrirQuete(n, "jouer");
}
function fenetreScenes() {
  const ouverte = (n) => n === 0 || prefs.prep || etat.etape >= n - 1;
  const c = el("div", { class: "f-corps" }, el("h2", {}, "Revoir une scène"),
    el("div", { class: "menu-grille" }, Object.entries(NOMS_SCENES).map(([id, [nom, n]]) => {
      const ok = ouverte(n);
      return el("button", { class: "menu-item", disabled: !ok, onclick: () => { Fen.tout(); jouerScene(id); } }, ico(ok ? "film" : "oeil"),
        el("span", {}, el("b", {}, ok ? nom : "Scène encore cachée"), el("small", {}, n === 0 ? "Le début de l'aventure" : n === 17 ? "La grande finale" : `Étape ${n} · ${nomVisible(n)}`)));
    })));
  Fen.ouvrir(c, { classe: "sombre", etroite: true });
}

/* ================= Menu de la classe ================= */
function fenetreMenu() {
  const a = anneeDe(etat.xp); const nd = defisEnAttente().length, no = nbObjets(), ns = SORTS.filter((s) => s.annee <= a).length;
  const item = (icone, titre, sous, action, badge) => el("button", { class: "menu-item", onclick: () => { Fen.fermer(); action(); } }, ico(icone), el("span", {}, el("b", {}, titre), sous && el("small", {}, sous)), badge ? el("span", { class: "badge" }, badge) : null);
  const c = el("div", { class: "f-corps" }, el("h2", {}, nomClasse(courante)),
    el("div", { class: "menu-grille" },
      item("coffre", "Défis maison", nd ? "Un coffre attend son mot de passe" : "Coffres et mots de passe", fenetreDefis, nd || null),
      item("sac", "Le sac", `${no} objet${no > 1 ? "s" : ""}, compagnons et reliques`, fenetreSac),
      item("grimoire", "Les sorts", `${nomAnnee(a)} · ${ns} sort${ns > 1 ? "s" : ""} connu${ns > 1 ? "s" : ""}`, fenetreSorts),
      item("disque", "Sauvegardes", "Revenir en arrière ou recommencer", () => fenetreSauvegardes(courante)),
      Scene3D.ok && item("film", "Revoir une scène", "Le train, le calmar, l'hippogriffe…", fenetreScenes),
      Scene3D.ok && item("cible", "Recentrer la carte", "Sur l'équipe", () => Scene3D.suivreEquipe()),
      item("aide", "Comment jouer", "Le déroulement d'une séance", fenetreAide),
      item("roue", "Réglages", "Préparation, sons, plein écran", fenetreReglages),
      item("maison", "Méfait accompli", "Refermer la carte, changer de classe", afficherAccueil)));
  Fen.ouvrir(c, { classe: "sombre", etroite: true });
}

/* ================= Démarrage ================= */
function ouvrirClasse(id, { train = false } = {}) {
  courante = id; etat = parties[id];
  Fen.tout(); document.querySelectorAll(".popover-menu").forEach((p) => p.remove());
  const acc = $("#accueil"); acc.classList.add("part"); setTimeout(() => { acc.hidden = true; acc.classList.remove("part"); }, 900);
  Scene3D.ok && Scene3D.orbite(false);
  rendreTout(); Son.jouer("magie");
  const montrer = () => { $("#hud").hidden = false; Scene3D.ok && Scene3D.suivreEquipe(true); };
  if ((train || !etat.introVue) && Scene3D.ok) jouerScene("express", () => { if (!etat.introVue) { etat.introVue = true; Store.sauver(); } montrer(); });
  else { if (!etat.introVue) { etat.introVue = true; Store.sauver(); } montrer(); }
}
function afficherAccueil() {
  Fen.tout(); courante = null;
  $("#hud").hidden = true; $("#infobulle").hidden = true;
  rendreAccueil(); $("#accueil").hidden = false;
  if (Scene3D.ok) Scene3D.orbite(true);
}
function demarrer() {
  Store.charger();
  etat = parties[registre.liste[0].id];
  const ok = Scene3D.init($("#scene"), { clic: clicLieu, survol: survolLieu });
  if (!ok) $("#scene").hidden = true;
  rendreTout(); rendreAccueil(); majSync();
  if (ok) Scene3D.orbite(true);
  $("#btn-etape").addEventListener("click", lancerEtape);
  $("#btn-menu").addEventListener("click", fenetreMenu);
  $("#btn-accueil").addEventListener("click", afficherAccueil);
  $("#btn-defi-attente").addEventListener("click", fenetreDefis);
  $("#btn-ajouter-classe").addEventListener("click", () => fenetreNomClasse(null));
  $("#btn-aide-accueil").addEventListener("click", fenetreAide);
  Store.brancher();
}
demarrer();
