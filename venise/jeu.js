/* Galère pour l'Orient — déroulé du jeu : escales, personnages, carnet de bord, marché, événements en mer,
   retour à Venise, chronique 1378-1500, schéma bilan et carnet de bord final.
   Les textes sont dans donnees.js ; la carte 3D dans carte3d.js. */
(function () {
  'use strict';
  const C3 = window.Carte3D;
  const CLE = 'galere-orient-v1';
  const RAPIDE = /rapide/.test(location.search) || location.hash === '#rapide';
  // Dans une page claude.ai, l'impression est bloquée : on propose alors de copier le carnet.
  const DANS_CADRE = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  const REDUIT = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);

  function h(tag, props, ...enfants) {
    const e = document.createElement(tag);
    if (props) for (const k in props) {
      const v = props[k];
      if (v === null || v === undefined || v === false) continue;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    }
    for (const k of enfants.flat()) if (k !== null && k !== undefined && k !== false) e.append(k.nodeType ? k : document.createTextNode(k));
    return e;
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const liste = arr => arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' et ' + arr[arr.length - 1];

  const ICONES = {
    ducat: '<svg class="ico" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8.5" fill="#E3B341" stroke="#9A6E1E" stroke-width="1.5"/><circle cx="10" cy="10" r="5.3" fill="none" stroke="#9A6E1E" stroke-width="1" stroke-dasharray="1.5 1.5"/></svg>',
    date: '<svg class="ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="4.5" width="14" height="12.5" rx="2"/><path d="M3 8.5h14M7 2.5v4M13 2.5v4"/></svg>',
    cale: '<svg class="ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M2 11h16l-2.5 5h-11z"/><path d="M6 11V6h8v5M10 6V3"/></svg>'
  };
  const DUCAT_SVG = `<svg class="ducat" viewBox="0 0 250 120" role="img" aria-label="Les deux faces du ducat d'or de Venise">
  <defs><radialGradient id="orD" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#F8DF94"/><stop offset="1" stop-color="#C38F2A"/></radialGradient>
  <path id="arcA" d="M -40 0 A 40 40 0 1 1 40 0"/><path id="arcB" d="M -40 0 A 40 40 0 1 1 40 0"/></defs>
  <g transform="translate(62,60)"><circle r="54" fill="url(#orD)" stroke="#94681B" stroke-width="2"/><circle r="45" fill="none" stroke="#94681B" stroke-width="1" stroke-dasharray="2 2.5"/>
    <text font-size="8.5" font-family="Georgia,serif" fill="#6E4B12" letter-spacing="1.5"><textPath href="#arcA" startOffset="50%" text-anchor="middle">S · M · VENETI · DVX</textPath></text>
    <circle cx="-15" cy="-17" r="9" fill="none" stroke="#8A5F18" stroke-width="1.2"/><circle cx="-15" cy="-17" r="5.5" fill="#A8791F"/><path d="M-25 28 L-21 -9 L-9 -9 L-5 28 Z" fill="#A8791F"/>
    <circle cx="15" cy="-2" r="5" fill="#A8791F"/><path d="M5 28 L8 5 L20 5 L25 18 L22 28 Z" fill="#A8791F"/><path d="M11 -9 l4 -5 l4 5 z" fill="#A8791F"/>
    <line x1="0" y1="30" x2="0" y2="-36" stroke="#6E4B12" stroke-width="2.4"/><path d="M0 -36 L15 -32 L0 -26 Z" fill="#6E4B12"/></g>
  <g transform="translate(188,60)"><circle r="54" fill="url(#orD)" stroke="#94681B" stroke-width="2"/><circle r="45" fill="none" stroke="#94681B" stroke-width="1" stroke-dasharray="2 2.5"/>
    <text font-size="7" font-family="Georgia,serif" fill="#6E4B12" letter-spacing=".6"><textPath href="#arcB" startOffset="50%" text-anchor="middle">SIT · T · XPE · DAT · Q · TV · REGIS · ISTE · DVCAT</textPath></text>
    <ellipse rx="19" ry="34" fill="none" stroke="#8A5F18" stroke-width="1.4"/>
    <g fill="#8A5F18">${[[-15, -20], [15, -20], [-17, 0], [17, 0], [-15, 20], [15, 20], [-9, -30], [9, -30], [-9, 30], [9, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8"/>`).join('')}</g>
    <circle cy="-18" r="5.5" fill="#A8791F"/><circle cy="-18" r="8.5" fill="none" stroke="#8A5F18" stroke-width="1"/><path d="M-8 26 L-6 -10 L6 -10 L8 26 Z" fill="#A8791F"/></g>
</svg>`;

  const ORDRE_PORTS = Object.keys(PORTS);
  const NB_QUESTIONS = ORDRE_PORTS.reduce((n, p) => n + (PORTS[p].questions || []).length, 0) + RETOUR.questions.length;
  const MOIS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  function dateDe(jour) {
    const d = new Date(Date.UTC(JEU.dateDepart[0], JEU.dateDepart[1], JEU.dateDepart[2] + jour - 1));
    const j = d.getUTCDate();
    return (j === 1 ? '1er' : j) + ' ' + MOIS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  }
  const joursPour = L => Math.max(3, Math.round(L * JEU.joursParUnite));

  /* ---------- État ---------- */
  let E = null;
  function etatInitial() {
    return {
      version: 2, phase: 'intro', etape: 'decouverte', noms: '', classe: '', debut: new Date().toISOString(),
      ducats: JEU.ducatsDepart, jour: 1, cale: {}, port: 'venise', visites: { venise: true }, legs: [], journal: [],
      reponses: {}, nbRep: 0, rencontres: {}, sujetsVus: {}, evenements: {}, contrebande: 0, averti: false, depenses: 0, recettes: 0,
      chroniqueEtape: 0, chronique: {}, schema: {}, schemaVerif: null, schemaEssais: 0, schemaCorrige: false, schemaScore: null,
      etapeSchema: 'placer', redaction: '', ducatsFinaux: null
    };
  }
  function sauver() { try { localStorage.setItem(CLE, JSON.stringify(E)); } catch (e) { /* stockage indisponible : le jeu continue */ } }
  function charger() { try { const s = localStorage.getItem(CLE); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  const totalCale = () => Object.values(E.cale).reduce((a, b) => a + b, 0);
  const nbBonnes = () => Object.values(E.reponses).filter(r => r.ok).length;

  /* ---------- Interface commune ---------- */
  function majHUD() {
    $('#hud').hidden = false; $('#b-carnet').hidden = false;
    $('#st-ducats').innerHTML = ICONES.ducat + '<span class="lib">Ducats</span><b>' + E.ducats + '</b>';
    const d = $('#st-date');
    d.classList.toggle('alerte', E.jour > JEU.jourLimite && E.phase !== 'chronique');
    d.innerHTML = ICONES.date + '<b>' + (E.phase === 'chronique' ? CHRONIQUE[E.chroniqueEtape].date : dateDe(E.jour)) + '</b>';
    $('#st-cale').innerHTML = ICONES.cale + '<span class="lib">Cale</span><b>' + totalCale() + '/' + JEU.cale + '</b>';
    $('#carnet-compte').textContent = Object.keys(E.reponses).length + '/' + NB_QUESTIONS;
  }
  function progression() {
    if (!E || E.phase === 'intro') return null;
    if (E.phase === 'chronique') {
      return h('div', { class: 'progress', 'aria-label': 'Chronique' }, CHRONIQUE.map((c, i) =>
        h('span', { class: 'pdot' + (i < E.chroniqueEtape ? ' done' : ''), 'aria-current': i === E.chroniqueEtape ? 'step' : null, title: c.date })),
        h('small', null, 'Chronique ' + (E.chroniqueEtape + 1) + ' / ' + CHRONIQUE.length));
    }
    const vus = ORDRE_PORTS.filter(p => E.visites[p]).length;
    const retour = E.phase === 'retour' || E.phase === 'fin';
    return h('div', { class: 'progress', 'aria-label': 'Escales' },
      ORDRE_PORTS.map(p => {
        const actuel = !retour && p === E.port && E.phase !== 'mer';
        const fait = E.visites[p] && !(p === 'venise' && !E.legs.length);
        return h('span', { class: 'pdot' + (fait && !actuel ? ' done' : ''), 'aria-current': actuel ? 'step' : null, title: PORTS[p].nom });
      }),
      h('span', { class: 'pdot', 'aria-current': retour ? 'step' : null, title: 'Retour à Venise' }),
      h('small', null, vus + ' / ' + ORDRE_PORTS.length + ' escales'));
  }
  const entete = (drapeau, texte) => h('p', { class: 'count' }, h('span', { class: 'pastille p-' + drapeau }), texte);
  const bouton = (texte, onclick, opts) => h('button', { type: 'button', class: 'nbtn' + (opts && opts.second ? '' : ' primary'), disabled: !!(opts && opts.desactive), onclick }, texte);
  function panneau(blocs, actions, garder) {
    const p = $('#panneau'), corps = $('#panneau-corps'), nav = $('#panneau-nav'), y = p.scrollTop;
    corps.innerHTML = ''; corps.append(...[progression()].concat(blocs).filter(Boolean));
    nav.innerHTML = ''; (actions || []).filter(Boolean).forEach(a => nav.append(a)); nav.hidden = !nav.children.length;
    p.scrollTop = garder ? y : 0;
  }
  let minuteurToast = null;
  function toast(msg, duree) {
    const t = $('#toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(minuteurToast); minuteurToast = setTimeout(() => { t.hidden = true; }, duree || 4200);
  }
  function ouvrirModal(contenu, opts) {
    opts = opts || {};
    const v = $('#modal'), b = $('#modal-boite');
    b.innerHTML = ''; b.className = 'boite' + (opts.large ? ' large' : '');
    b.append(...contenu.filter(Boolean)); b.scrollTop = 0;
    v.dataset.bloquant = opts.bloquant ? '1' : ''; v.hidden = false;
    const f = b.querySelector('button:not(:disabled)'); if (f) f.focus({ preventScroll: true });
  }
  function fermerModal() { $('#modal').hidden = true; }
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal' && !$('#modal').dataset.bloquant) fermerModal(); });

  function figure(f) {
    return h('figure', { class: 'fig' },
      h('button', { type: 'button', class: 'fig-btn', 'aria-label': 'Agrandir l\'image', onclick: () => {
        $('#lb-img').src = f.src; $('#lb-img').alt = f.alt; $('#lb-legende').innerHTML = f.legende; $('#lightbox').hidden = false; $('#lb-fermer').focus();
      } }, h('img', { src: f.src, alt: f.alt })),
      h('figcaption', { html: f.legende }));
  }
  $('#lb-fermer').addEventListener('click', () => { $('#lightbox').hidden = true; });
  $('#lightbox').addEventListener('click', e => { if (e.target.id === 'lightbox') $('#lightbox').hidden = true; });

  /* ---------- Personnages ---------- */
  function visage(l) {
    const c = l.coiffeCol || '#333', p = l.peau;
    let s = '<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="#E9DCC2"/>';
    s += `<path d="M12 100 C14 79 29 70 50 70 C71 70 86 79 88 100 Z" fill="${l.habit}"/>`;
    if (l.col) s += `<path d="M37 72 L50 87 L63 72" fill="none" stroke="${l.col}" stroke-width="4" stroke-linejoin="round"/>`;
    if (l.coiffe === 'voile') s += `<path d="M22 70 C18 32 32 15 50 15 C68 15 82 32 78 70 C66 76 34 76 22 70 Z" fill="${c}"/>`;
    s += `<rect x="43" y="57" width="14" height="15" rx="4" fill="${p}"/>`;
    if (l.cheveux && l.coiffe !== 'voile') s += `<ellipse cx="50" cy="40" rx="20.5" ry="22" fill="${l.cheveux}"/>`;
    s += `<ellipse cx="50" cy="44" rx="16.5" ry="19.5" fill="${p}"/>`;
    s += '<circle cx="43.5" cy="43" r="2.1" fill="#2A1E16"/><circle cx="56.5" cy="43" r="2.1" fill="#2A1E16"/>';
    s += `<path d="M39.5 38.3 q4 -2.6 8 0 M52.5 38.3 q4 -2.6 8 0" stroke="${l.cheveux || '#2A1E16'}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    s += '<path d="M50 45 q-2.2 6 1 7" stroke="rgb(0 0 0 / .25)" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
    if (l.barbe) s += `<path d="M34 45 C35 62 42 69 50 69 C58 69 65 62 66 45 C62 54 57 57.5 50 57.5 C43 57.5 38 54 34 45 Z" fill="${l.barbe}"/>`;
    s += `<path d="M45.5 ${l.barbe ? 55.2 : 54} q4.5 3 9 0" stroke="${l.barbe ? '#3A2A20' : '#9A4A3A'}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
    if (l.coiffe === 'berret') s += `<path d="M31 37 C30 20 41 13 52 13 C64 13 71 21 70 37 C62 31 40 31 31 37 Z" fill="${c}"/>`;
    else if (l.coiffe === 'toque') s += `<path d="M30 35 C30 21 40 15 50 15 C60 15 70 21 70 35 Z" fill="${c}"/><rect x="28" y="30" width="44" height="9" rx="4.5" fill="#7A5A3A"/>`;
    else if (l.coiffe === 'turban') s += `<ellipse cx="50" cy="27" rx="23" ry="13" fill="${c}"/><path d="M28 31 q22 -11 44 0 M30 24 q20 -9 40 0" stroke="rgb(0 0 0 / .14)" stroke-width="2" fill="none"/>`;
    else if (l.coiffe === 'bonnet') s += `<path d="M32 35 C32 21 41 17 50 17 C59 17 68 21 68 35 Z" fill="${c}"/>`;
    else if (l.coiffe === 'voile') s += `<path d="M31 41 C31 24 40 19 50 19 C60 19 69 24 69 41 C66 30 58 26 50 26 C42 26 34 30 31 41 Z" fill="${c}"/>`;
    return s + '</svg>';
  }
  const persosDe = port => PERSONNAGES.filter(p => p.port === port);
  function blocPersonnages(port) {
    const ps = persosDe(port); if (!ps.length) return null;
    return h('div', { class: 'npcs' }, ps.map(p => {
      const met = !!E.rencontres[p.id], vus = (E.sujetsVus[p.id] || []).length;
      return h('button', { type: 'button', class: 'npc-btn' + (met ? ' met' : ''), onclick: () => ouvrirDialogue(p) },
        h('span', { class: 'npc-face', html: visage(p.look) }),
        h('span', { class: 'npc-txt' }, h('b', null, p.nom), h('small', null, p.role)),
        h('span', { class: 'npc-done' }, met ? vus + ' / ' + p.sujets.length : 'Parler'));
    }));
  }
  const PEUT_PARLER = 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
  let dialogue = null, minuteurFrappe = null;
  function stopVoix() { if (PEUT_PARLER) { try { speechSynthesis.cancel(); } catch (e) { /* rien */ } } }
  function lire(texte) {
    if (!PEUT_PARLER) return;
    stopVoix();
    try {
      const u = new SpeechSynthesisUtterance(texte); u.lang = 'fr-FR';
      const v = speechSynthesis.getVoices().find(x => /^fr/i.test(x.lang)); if (v) u.voice = v;
      speechSynthesis.speak(u);
    } catch (e) { /* synthèse vocale indisponible */ }
  }
  function taper(texte) {
    const el = $('#talk-texte');
    clearInterval(minuteurFrappe); minuteurFrappe = null; stopVoix();
    dialogue.texte = texte; $('#talk-lu').textContent = texte;
    if (REDUIT) { el.textContent = texte; return; }
    let i = 0; el.textContent = '';
    minuteurFrappe = setInterval(() => {
      i += 2; el.textContent = texte.slice(0, i);
      if (i >= texte.length) { clearInterval(minuteurFrappe); minuteurFrappe = null; }
    }, 18);
  }
  $('#talk-texte').addEventListener('click', () => { if (dialogue && minuteurFrappe) { clearInterval(minuteurFrappe); minuteurFrappe = null; $('#talk-texte').textContent = dialogue.texte; } });
  $('#talk-ecouter').addEventListener('click', () => {
    if (!dialogue) return;
    if (PEUT_PARLER && speechSynthesis.speaking) stopVoix(); else lire(dialogue.texte);
  });
  function ouvrirDialogue(p) {
    dialogue = { p, texte: '' };
    const premiere = !E.rencontres[p.id];
    if (premiere) { E.rencontres[p.id] = true; sauver(); }
    $('#talk-visage').innerHTML = visage(p.look);
    $('#talk-nom').textContent = p.nom; $('#talk-role').textContent = p.role;
    $('#talk-ecouter').hidden = !PEUT_PARLER;
    $('#talk').hidden = false; $('#view').classList.add('talking');
    taper(p.intro); choixDialogue(false);
    if (premiere) rafraichir(true);
    if (window.innerWidth <= 900) $('#view').scrollIntoView({ behavior: REDUIT ? 'auto' : 'smooth', block: 'start' });
  }
  function choixDialogue(fin) {
    const p = dialogue.p, vus = E.sujetsVus[p.id] || [], c = $('#talk-choix');
    c.innerHTML = '';
    if (fin) {
      c.append(h('button', { type: 'button', class: 'bye', onclick: fermerDialogue }, h('kbd', null, '1'), 'Fermer la conversation'));
    } else {
      p.sujets.forEach(([q, r], i) => c.append(h('button', { type: 'button', class: vus.includes(i) ? 'seen' : null, onclick: () => {
        if (!vus.includes(i)) { E.sujetsVus[p.id] = vus.concat(i); sauver(); rafraichir(true); }
        taper(r); choixDialogue(false);
      } }, h('kbd', null, String(i + 1)), q)));
      c.append(h('button', { type: 'button', class: 'bye', onclick: () => { taper(p.aurevoir); choixDialogue(true); } }, h('kbd', null, String(p.sujets.length + 1)), 'Au revoir'));
    }
    const n = (E.sujetsVus[p.id] || []).length;
    $('#talk-compte').textContent = 'Questions posées : ' + n + ' / ' + p.sujets.length;
  }
  function fermerDialogue() {
    if (!dialogue) return;
    stopVoix(); clearInterval(minuteurFrappe); minuteurFrappe = null; dialogue = null;
    $('#talk').hidden = true; $('#view').classList.remove('talking');
  }
  $('#talk-fermer').addEventListener('click', fermerDialogue);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!$('#lightbox').hidden) { $('#lightbox').hidden = true; return; }
      if (!$('#modal').hidden) { if (!$('#modal').dataset.bloquant) fermerModal(); return; }
      if (dialogue) fermerDialogue();
      return;
    }
    if (!dialogue || !$('#modal').hidden || /INPUT|TEXTAREA/.test(e.target.tagName || '')) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9) { const b = $('#talk-choix').children[n - 1]; if (b) { e.preventDefault(); b.click(); } }
  });

  /* ---------- Questions du carnet ---------- */
  function blocQuestion(qid) {
    const Q = QUESTIONS[qid], r = E.reponses[qid];
    const boutons = Q.choix.map((c, i) => {
      let cls = null;
      if (r) { if (i === Q.bonne) cls = 'bonne'; else if (i === r.choix) cls = 'fausse'; }
      return h('button', { type: 'button', class: cls, disabled: !!r, onclick: () => repondre(qid, i) }, c);
    });
    return h('div', { class: 'question' },
      h('p', { class: 'q-etiq' }, 'Carnet de bord · question'),
      h('p', { class: 'q' }, Q.q),
      h('div', { class: 'choix' }, boutons),
      r ? h('div', { class: 'explication ' + (r.ok ? 'ok' : 'ko') }, h('b', null, r.ok ? 'Bonne réponse !' : 'Pas tout à fait…'), Q.exp) : null);
  }
  function repondre(qid, i) {
    if (E.reponses[qid]) return;
    E.reponses[qid] = { choix: i, ok: i === QUESTIONS[qid].bonne, n: ++E.nbRep };
    sauver(); majHUD(); rafraichir(true);
  }
  function rafraichir(garder) {
    if (!E) return;
    if (E.phase === 'port') afficherPort(garder);
    else if (E.phase === 'retour') afficherRetour(garder);
  }

  /* ---------- Carte : ports accessibles ---------- */
  function peutAller(id) {
    if (id === 'venise') {
      const manque = ORDRE_PORTS.filter(p => !E.visites[p]);
      if (manque.length) return { ok: false, raison: "Termine d'abord ton tour : il te manque " + liste(manque.map(p => PORTS[p].nom)) + '.' };
    }
    return { ok: true };
  }
  function majCarte() {
    const choix = E.phase === 'port' && E.etape === 'depart';
    const voisins = choix ? C3.voisins(E.port) : [];
    const etats = {};
    for (const id of ORDRE_PORTS) {
      const v = voisins.includes(id), ok = v && peutAller(id).ok;
      etats[id] = { visite: !!E.visites[id] && id !== E.port, actuel: id === E.port && E.phase !== 'mer', accessible: ok, bloque: v && !ok };
    }
    C3.etatPorts(etats);
    C3.surlignerRoutes(E.port, voisins.filter(v => peutAller(v).ok));
    C3.itineraire(E.legs);
  }
  function clicPort(id) {
    if (!E || E.phase === 'intro' || E.phase === 'mer') return;
    if (E.phase !== 'port') { toast(PORTS[id].nom + ' : ' + PORTS[id].statut); return; }
    if (id === E.port) { C3.vue('port', { port: id }); return; }
    if (E.etape !== 'depart') { toast("Termine d'abord ton escale à " + PORTS[E.port].nom + ', puis choisis ta destination.'); return; }
    if (!C3.voisins(E.port).includes(id)) { toast('Pas de route directe de ' + PORTS[E.port].nom + ' vers ' + PORTS[id].nom + '. Suis les routes dorées.'); return; }
    const pa = peutAller(id); if (!pa.ok) { toast(pa.raison, 5000); return; }
    partir(id);
  }

  /* ---------- Escales ---------- */
  function afficherPort(garder) {
    const p = PORTS[E.port];
    if (!garder) C3.vue(E.etape === 'depart' ? 'ensemble' : 'port', { port: E.port });
    majHUD(); majCarte();
    const blocs = [entete(p.drapeau, p.statut)], actions = [];
    const qs = p.questions || [];
    if (E.etape === 'decouverte') {
      blocs.push(h('h2', null, p.titre));
      p.texte.forEach(t => blocs.push(h('p', null, t)));
      if (p.figure) blocs.push(figure(p.figure));
      blocs.push(blocPersonnages(E.port));
      if (p.notion) blocs.push(h('p', { class: 'notion', html: '<b>' + esc(p.notion[0]) + '</b> : ' + esc(p.notion[1]) }));
      const persos = persosDe(E.port);
      if (persos.length && !persos.some(x => E.rencontres[x.id])) {
        blocs.push(h('p', { class: 'aide-dialogue' }, 'Parle d\'abord à ' + liste(persos.map(x => x.nom)) + ' : ' + (persos.length > 1 ? 'leurs' : 'ses') + ' réponses t\'aideront à remplir ton carnet de bord.'));
      } else {
        for (const q of qs) { blocs.push(blocQuestion(q)); if (!E.reponses[q]) break; }
      }
      actions.push(bouton(p.escale ? 'Choisir ma prochaine escale →' : 'Aller au marché →', () => { fermerDialogue(); E.etape = p.escale ? 'depart' : 'marche'; sauver(); afficherPort(); }, { desactive: !qs.every(q => E.reponses[q]) }));
    } else if (E.etape === 'marche') {
      blocs.push(...blocMarche(p, false));
      actions.push(bouton("Lever l'ancre →", () => { E.etape = 'depart'; sauver(); afficherPort(); }));
    } else {
      blocs.push(...blocDepart());
      if (!p.escale) actions.push(bouton('← Retourner au marché', () => { E.etape = 'marche'; afficherPort(); }, { second: true }));
    }
    panneau(blocs, actions, garder);
  }

  function ligneMarche(g, prix, sens) {
    const m = MARCHANDISES[g], n = E.cale[g] || 0;
    const actions = [];
    if (sens === 'achat') actions.push(h('button', { class: 'btn petit', type: 'button', disabled: E.ducats < prix || totalCale() >= JEU.cale, onclick: () => acheter(g, prix) }, 'Acheter'));
    else {
      actions.push(h('button', { class: 'btn petit or', type: 'button', disabled: !n, onclick: () => vendre(g, prix, 1) }, 'Vendre'));
      if (n > 1) actions.push(h('button', { class: 'btn petit second', type: 'button', onclick: () => vendre(g, prix, n) }, 'Tout'));
    }
    return h('div', { class: 'ligne' + (m.interdit ? ' interdit' : '') },
      h('div', { class: 'm-nom' }, h('span', { class: 'ballot', style: 'background:' + m.couleur }),
        h('span', null, m.nom, h('small', null, m.info + (n ? ' · ' + n + ' en cale' : '')))),
      h('div', { class: 'm-prix', html: '<b>' + prix + '</b> d.' }),
      h('div', { class: 'm-act' }, actions));
  }
  function blocMarche(p, retour) {
    const out = [h('h2', null, retour ? 'Vends ta cargaison' : p.marcheTitre)];
    if (p.conseil) out.push(h('p', { class: 'conseil' }, p.conseil));
    out.push(h('p', { class: 'bourse', html: '<span>Ta bourse : <b>' + E.ducats + ' ducats</b></span><span>Cale : <b>' + totalCale() + '/' + JEU.cale + '</b></span>' }));
    const achat = retour ? {} : (p.achat || {});
    const vente = retour ? prixRetour() : (p.vente || {});
    const ga = Object.keys(achat);
    if (ga.length) out.push(h('p', { class: 'sous-titre-marche' }, 'Tu peux acheter'), h('div', { class: 'marche' }, ga.map(g => ligneMarche(g, achat[g], 'achat'))));
    let gv = Object.keys(vente);
    if (retour) gv = gv.filter(g => E.cale[g]);
    if (gv.length) out.push(h('p', { class: 'sous-titre-marche' }, retour ? 'Les marchands du Rialto t\'achètent' : 'Les marchands d\'ici achètent'), h('div', { class: 'marche' }, gv.map(g => ligneMarche(g, vente[g], 'vente'))));
    else if (retour) out.push(h('p', null, 'Ta cale est vide : tout est vendu.'));
    return out;
  }
  function acheter(g, prix) {
    if (MARCHANDISES[g].interdit && !E.averti) {
      ouvrirModal([
        h('p', { class: 'ev-entete' }, 'Attention'),
        h('h2', null, 'Une marchandise interdite'),
        h('p', null, "Le pape interdit de vendre aux musulmans du bois, du fer et des armes : ils pourraient servir à construire des navires et des armes contre les chrétiens (conciles de Latran, 1179 et 1215)."),
        h('p', null, "À Alexandrie, ces marchandises se vendent très cher… mais tu prends un risque."),
        h('div', { class: 'actions' },
          h('button', { class: 'btn rouge', type: 'button', onclick: () => { E.averti = true; fermerModal(); acheter(g, prix); } }, 'Acheter quand même'),
          h('button', { class: 'btn second', type: 'button', onclick: fermerModal }, 'Renoncer'))
      ]);
      return;
    }
    if (E.ducats < prix || totalCale() >= JEU.cale) return;
    E.ducats -= prix; E.cale[g] = (E.cale[g] || 0) + 1; E.depenses += prix;
    sauver(); majHUD(); rafraichir(true);
  }
  function vendre(g, prix, n) {
    n = Math.min(n, E.cale[g] || 0); if (!n) return;
    E.ducats += prix * n; E.cale[g] -= n; if (!E.cale[g]) delete E.cale[g]; E.recettes += prix * n;
    if (g === 'boisfer' && E.port === 'alexandrie') E.contrebande += n;
    sauver(); majHUD(); rafraichir(true);
  }

  function blocDepart() {
    const voisins = C3.voisins(E.port);
    const reste = ORDRE_PORTS.filter(id => !E.visites[id]);
    const out = [h('h2', null, 'Où aller maintenant ?'),
      h('p', null, 'Choisis une escale reliée par une route dorée : ici, ou directement sur la carte.')];
    out.push(h('div', { class: 'destinations' }, voisins.map(v => {
      const pa = peutAller(v), P = PORTS[v], j = joursPour(C3.longueurRoute(E.port, v));
      return h('button', { class: 'dest', type: 'button', disabled: !pa.ok, onclick: () => partir(v) },
        h('span', { class: 'pastille p-' + P.drapeau }),
        h('span', null, h('span', { class: 'd-nom' }, P.nom, E.visites[v] ? h('span', { class: 'fait' }, ' ✓') : null), h('span', { class: 'd-info', style: 'display:block' }, pa.ok ? P.statut : pa.raison)),
        h('span', { class: 'd-jours' }, '≈ ' + j + ' jours'));
    })));
    out.push(h('p', { style: 'font-size:.88em;color:var(--muted)' }, reste.length
      ? 'Escales encore à découvrir : ' + liste(reste.map(id => PORTS[id].nom)) + '. Quand ton tour sera fini, rentre à Venise.'
      : 'Tu as fait le tour de toutes les escales : rentre à Venise vendre ta cargaison !'));
    if (E.jour > JEU.jourLimite - 25) out.push(h('p', { class: 'conseil' }, E.jour > JEU.jourLimite ? "L'hiver est là : d'autres galères sont déjà rentrées. Tes marchandises se vendront moins cher." : "L'hiver approche : pense à rentrer à Venise avant le " + dateDe(JEU.jourLimite) + '.'));
    return out;
  }

  /* ---------- En mer ---------- */
  function resumeCale() {
    const g = Object.keys(E.cale);
    return g.length ? 'Dans ta cale : ' + g.map(k => E.cale[k] + ' × ' + MARCHANDISES[k].nom).join(', ') + '.' : 'Ta cale est vide.';
  }
  function partir(dest) {
    const pa = peutAller(dest); if (!pa.ok) { toast(pa.raison, 5000); return; }
    fermerDialogue();
    const de = E.port, jours = joursPour(C3.longueurRoute(de, dest));
    const cle = ROUTES[de + '-' + dest] ? de + '-' + dest : dest + '-' + de;
    let ev = null;
    for (const id of ['tempete', 'genes']) if (!E.evenements[id] && EVENEMENTS_ROUTES[id].includes(cle)) { ev = id; break; }
    E.phase = 'mer';
    majCarte(); C3.surlignerRoutes(de, []);
    panneau([entete('venise', 'En mer'), h('h2', null, PORTS[de].nom + ' → ' + PORTS[dest].nom),
      h('p', { id: 'b-date' }), h('div', { class: 'jauge' }, h('i', { id: 'b-jauge' })),
      h('p', null, resumeCale()),
      h('p', { class: 'aide-dialogue' }, 'Les rameurs tirent sur les avirons, la voile se gonfle… Tu peux tourner et zoomer sur la carte pendant la traversée.')], []);
    const prog = t => {
      const d = $('#b-date'), j = $('#b-jauge');
      if (d) d.textContent = dateDe(E.jour + Math.floor(t * jours)) + ' · ' + Math.round(t * jours) + ' / ' + jours + ' jours de mer';
      if (j) j.style.width = (t * 100).toFixed(1) + '%';
    };
    prog(0);
    C3.naviguer(de, dest, {
      vitesse: RAPIDE ? 10 : 1.4,
      auMilieu: ev ? () => evenement(ev) : null,
      progres: prog,
      arrivee: () => arriver(de, dest, jours)
    });
  }
  function perdreBallots(n) {
    const lots = []; for (const g in E.cale) for (let k = 0; k < E.cale[g]; k++) lots.push(g);
    const perdus = {};
    for (let k = 0; k < n && lots.length; k++) {
      const g = lots.splice(Math.floor(Math.random() * lots.length), 1)[0];
      E.cale[g]--; if (!E.cale[g]) delete E.cale[g]; perdus[g] = (perdus[g] || 0) + 1;
    }
    return Object.keys(perdus).map(g => perdus[g] + ' × ' + MARCHANDISES[g].nom);
  }
  function appliquer(effet) {
    let detail = '';
    if (effet.jours) E.jour += effet.jours;
    if (effet.perteBallots) {
      const p = perdreBallots(effet.perteBallots);
      detail = p.length ? 'Perdu : ' + liste(p) + '.' : "Ta cale était vide : tu n'avais rien à perdre !";
    }
    majHUD(); return detail;
  }
  function evenement(id) {
    const ev = EVENEMENTS[id];
    const choisir = c => {
      const res = c.hasard ? c.hasard[Math.random() < 0.5 ? 0 : 1] : c;
      const detail = appliquer(res.effet || {});
      E.evenements[id] = { choix: c.label, resultat: res.resultat + (detail ? ' ' + detail : '') };
      ouvrirModal([
        h('p', { class: 'ev-entete' }, 'En mer'),
        h('h2', null, ev.titre),
        h('div', { class: 'resultat' }, res.resultat, detail ? h('div', { style: 'font-weight:400;margin-top:4px' }, detail) : null),
        h('div', { class: 'a-retenir' }, h('b', null, 'À retenir'), ev.aRetenir),
        h('div', { class: 'actions' }, h('button', { class: 'btn or', type: 'button', onclick: () => { fermerModal(); C3.pause(false); } }, 'Reprendre la navigation'))
      ], { bloquant: true });
    };
    ouvrirModal([
      h('p', { class: 'ev-entete' }, 'En mer'),
      h('h2', null, ev.titre), h('p', null, ev.texte),
      h('div', { class: 'choix-ev' }, ev.choix.map(c => h('button', { type: 'button', onclick: () => choisir(c) }, c.label)))
    ], { bloquant: true });
  }
  function arriver(de, dest, jours) {
    E.jour += jours + JEU.joursEscale;
    E.legs.push([de, dest]); E.port = dest;
    const premiere = !E.visites[dest]; E.visites[dest] = true;
    E.journal.push({ port: dest, jour: E.jour, premiere });
    if (dest === 'venise') { E.phase = 'retour'; E.etape = 'vente'; sauver(); afficherRetour(); return; }
    E.phase = 'port';
    const p = PORTS[dest];
    E.etape = premiere ? 'decouverte' : (p.escale ? 'depart' : 'marche');
    sauver(); afficherPort();
    if (premiere && p.nouvelle) setTimeout(() => toast(p.nouvelle, 6500), 900);
    else if (!premiere && p.escale) toast('Escale à ' + p.nom + ' : eau fraîche et vivres, puis on repart.');
  }

  /* ---------- Retour à Venise ---------- */
  const enRetard = () => E.jour > JEU.jourLimite;
  function prixRetour() {
    const out = {}, f = enRetard() ? 1 - JEU.baisseRetard : 1;
    for (const g in RETOUR.vente) out[g] = Math.round(RETOUR.vente[g] * f);
    return out;
  }
  const chiffre = (t, v) => h('div', { class: 'chiffre' }, h('small', null, t), h('b', null, v));
  function afficherRetour(garder) {
    if (!garder) C3.vue('port', { port: 'venise' });
    majHUD(); majCarte();
    const blocs = [entete('venise', 'Venise · retour de voyage')], actions = [];
    if (E.etape === 'vente') {
      blocs.push(h('h2', null, RETOUR.titre));
      RETOUR.texte.forEach(t => blocs.push(h('p', null, t)));
      blocs.push(blocPersonnages('retour'));
      if (enRetard()) blocs.push(h('div', { class: 'a-retenir' }, h('b', null, 'Retour tardif'), 'Tu rentres le ' + dateDe(E.jour) + " : d'autres galères sont arrivées avant toi. Les prix ont baissé de " + Math.round(JEU.baisseRetard * 100) + ' %.'));
      blocs.push(...blocMarche({}, true));
      actions.push(bouton(totalCale() ? 'Tout vendre et continuer →' : 'Continuer →', () => { fermerDialogue(); finVentes(); }));
    } else if (E.etape === 'ducat') {
      blocs.push(h('h2', null, "Payé en ducats d'or"));
      blocs.push(h('figure', { class: 'fig' }, h('div', { html: DUCAT_SVG }), h('figcaption', null, 'Le ducat de Venise (Doc. 3 de ta fiche) : à gauche, saint Marc remet l\'étendard au doge ; à droite, le Christ.')));
      RETOUR.questions.forEach(q => blocs.push(blocQuestion(q)));
      actions.push(bouton('Voir le bilan de mon voyage →', () => { E.etape = 'bilan'; E.ducatsFinaux = E.ducats; sauver(); afficherRetour(); }, { desactive: !RETOUR.questions.every(q => E.reponses[q]) }));
    } else {
      const benef = E.ducats - JEU.ducatsDepart;
      const titre = benef < 0 ? 'Voyage déficitaire… la mer est cruelle.' : benef < 300 ? 'Un marchand prudent.' : benef < 700 ? 'Un riche marchand !' : 'Un grand marchand du Rialto !';
      blocs.push(h('h2', null, 'Bilan de ton voyage'));
      blocs.push(h('div', { class: 'chiffres' },
        chiffre('Parti avec', JEU.ducatsDepart + ' d.'), chiffre('Rentré avec', E.ducats + ' d.'),
        chiffre('Bénéfice', (benef >= 0 ? '+' : '') + benef + ' d.'), chiffre('Durée', (E.jour - 1) + ' jours'),
        chiffre('Bonnes réponses', nbBonnes() + ' / ' + NB_QUESTIONS)));
      blocs.push(h('h3', null, titre));
      blocs.push(h('p', null, "Ton voyage montre comment Venise s'enrichit : un réseau d'escales et de comptoirs, des galères, une monnaie solide… Mais cette puissance a-t-elle duré ?"));
      actions.push(bouton('Et après ? Venise face aux menaces →', () => { E.phase = 'chronique'; E.chroniqueEtape = 0; sauver(); afficherChronique(); }));
    }
    panneau(blocs, actions, garder);
  }
  function finVentes() {
    const prix = prixRetour();
    for (const g of Object.keys(E.cale)) vendre(g, prix[g] || 0, E.cale[g]);
    const suite = () => { E.etape = 'ducat'; sauver(); afficherRetour(); };
    if (E.contrebande > 0 && !E.evenements.contrebande) {
      const ev = EVENEMENTS.contrebande, puni = Math.random() < 0.5;
      const amende = Math.min(E.ducats, ev.amende);
      if (puni) { E.ducats -= amende; E.recettes -= amende; }
      E.evenements.contrebande = { choix: 'Vente de bois et de fer à Alexandrie', resultat: puni ? 'Amende de ' + amende + ' ducats.' : 'Pas de sanction.' };
      sauver(); majHUD();
      ouvrirModal([
        h('p', { class: 'ev-entete' }, 'Au palais des Doges'),
        h('h2', null, puni ? ev.titre : 'Contrebande… impunie'),
        puni ? h('p', null, ev.texte) : null,
        h('div', { class: 'resultat' }, puni ? 'Tu paies une amende de ' + amende + ' ducats.' : ev.impuni),
        h('div', { class: 'a-retenir' }, h('b', null, 'À retenir'), ev.aRetenir),
        h('div', { class: 'actions' }, h('button', { class: 'btn or', type: 'button', onclick: () => { fermerModal(); suite(); } }, 'Continuer'))
      ], { bloquant: true });
    } else suite();
  }

  /* ---------- Chronique : Venise face aux menaces ---------- */
  function appliquerChroniqueJusqua(n) { CHRONIQUE.forEach((c, i) => C3.effet(c.effet, i <= n)); }
  function afficherChronique(garder) {
    const i = E.chroniqueEtape, c = CHRONIQUE[i], rep = E.chronique[i];
    appliquerChroniqueJusqua(i);
    if (!garder) C3.vue('lieu', { lon: c.lon, lat: c.lat, rayon: c.effet === 'gama' ? 12 : c.effet === 'terreFerme' ? 6.5 : 5 });
    C3.etatPorts({}); C3.surlignerRoutes(E.port, []);
    majHUD();
    const blocs = [entete('venise', 'Et après ? Venise face aux menaces'), h('p', { class: 'date-geante' }, c.date), h('h2', null, c.titre), h('p', null, c.texte)];
    const opts = [['atout', 'Un atout'], ['menace', 'Une menace']];
    const q = h('div', { class: 'question' }, h('p', { class: 'q-etiq' }, 'Ton avis'), h('p', { class: 'q' }, 'Pour la puissance de Venise, cet événement est plutôt…'),
      h('div', { class: 'choix' }, opts.map(([k, l]) => {
        let cls = null; if (rep) { if (k === c.reponse) cls = 'bonne'; else if (k === rep) cls = 'fausse'; }
        return h('button', { type: 'button', class: cls, disabled: !!rep, onclick: () => { E.chronique[i] = k; sauver(); afficherChronique(true); } }, l);
      })));
    if (rep) q.append(h('div', { class: 'explication ' + (rep === c.reponse ? 'ok' : 'ko') },
      h('b', null, rep === c.reponse ? 'Oui.' : 'Pas vraiment.'),
      c.reponse === 'menace' ? (c.effet === 'chioggia' ? "C'est une menace très grave… que Venise surmonte grâce à sa flotte." : 'Cet événement fragilise la puissance vénitienne.') : 'Cet événement renforce la puissance vénitienne.'));
    blocs.push(q);
    const dernier = i === CHRONIQUE.length - 1;
    panneau(blocs, [bouton(dernier ? 'Construire le schéma bilan →' : 'Suivant →', () => {
      if (!dernier) { E.chroniqueEtape++; sauver(); afficherChronique(); }
      else { E.phase = 'schema'; sauver(); ouvrirSchema(); }
    }, { desactive: !rep })], garder);
  }

  /* ---------- Schéma bilan ---------- */
  let choisi = null;
  function ouvrirSchema() { $('#ecran-schema').hidden = false; dessinerSchema(); }
  function etiquetteSchema(el) {
    const v = E.schemaVerif ? E.schemaVerif[el.id] : null;
    const cls = 'etiquette' + (choisi === el.id ? ' choisie' : '') + (v === true ? ' ok' : v === false ? ' ko' : '');
    return h('button', { type: 'button', class: cls, onclick: ev => {
      ev.stopPropagation();
      // une étiquette est déjà choisie et on clique sur une autre, placée dans une case : on dépose dans cette case
      if (choisi && choisi !== el.id && E.schema[el.id]) { placer(E.schema[el.id]); return; }
      choisi = choisi === el.id ? null : el.id; dessinerSchema();
    } }, el.texte);
  }
  function placer(caseId) {
    if (!choisi) return;
    if (caseId) E.schema[choisi] = caseId; else delete E.schema[choisi];
    choisi = null; E.schemaVerif = null; sauver(); dessinerSchema();
  }
  function dessinerSchema() {
    const cont = $('#schema-contenu'); cont.innerHTML = '';
    if (E.etapeSchema === 'redaction') return dessinerRedaction();
    const libres = SCHEMA.elements.filter(e => !E.schema[e.id]);
    cont.append(h('div', { class: 'schema-tete' },
      h('p', { class: 'niveau' }, JEU.niveau),
      h('h1', null, 'Schéma bilan'),
      h('p', null, 'Clique sur une étiquette, puis sur la case où elle doit aller. Pour déplacer une étiquette déjà placée, clique dessus puis sur une autre case (ou sur la réserve).')));
    cont.append(h('div', { class: 'reserve' + (choisi && E.schema[choisi] ? ' cible' : ''), onclick: () => { if (choisi && E.schema[choisi]) placer(null); } }, libres.map(etiquetteSchema)));
    const grille = h('div', { class: 'cases' }, h('div', { class: 'case centre' }, h('div', { class: 'c-titre' }, SCHEMA.titre)));
    for (const c of SCHEMA.cases) {
      const dedans = SCHEMA.elements.filter(e => E.schema[e.id] === c.id);
      grille.append(h('div', { class: 'case ' + c.id + (choisi ? ' cible' : ''), role: 'button', tabindex: '0', onclick: () => placer(c.id), onkeydown: ev => { if (ev.key === 'Enter') placer(c.id); } },
        h('div', { class: 'c-titre' }, c.titre), h('div', { class: 'c-sous' }, c.sous),
        h('div', { class: 'c-liste' }, dedans.map(etiquetteSchema))));
    }
    cont.append(grille);
    const actions = h('div', { class: 'actions' });
    const tousPlaces = !libres.length;
    const toutJuste = E.schemaVerif && SCHEMA.elements.every(e => E.schemaVerif[e.id]);
    if (!toutJuste) actions.append(h('button', { class: 'btn', type: 'button', disabled: !tousPlaces, onclick: verifierSchema }, tousPlaces ? 'Vérifier mon schéma' : 'Place toutes les étiquettes (' + libres.length + ' restantes)'));
    if (E.schemaVerif) {
      const n = SCHEMA.elements.filter(e => E.schemaVerif[e.id]).length;
      actions.append(h('span', { class: 'score' }, n + ' / ' + SCHEMA.elements.length + ' bien placées' + (toutJuste ? ' : bravo !' : ' : déplace les étiquettes en rouge.')));
    }
    if (!toutJuste && E.schemaEssais >= 2) actions.append(h('button', { class: 'btn second', type: 'button', onclick: corrigerSchema }, 'Voir la correction'));
    if (toutJuste) actions.append(h('button', { class: 'btn or', type: 'button', onclick: () => { E.etapeSchema = 'redaction'; sauver(); dessinerSchema(); $('#ecran-schema').scrollTop = 0; } }, 'Continuer : répondre à la question de départ →'));
    cont.append(actions);
  }
  function verifierSchema() {
    E.schemaVerif = {}; E.schemaEssais++;
    for (const e of SCHEMA.elements) E.schemaVerif[e.id] = e.cases.includes(E.schema[e.id]);
    const n = SCHEMA.elements.filter(e => E.schemaVerif[e.id]).length;
    if (E.schemaScore === null && (n === SCHEMA.elements.length || E.schemaEssais === 1)) E.schemaScore = n;
    sauver(); dessinerSchema();
  }
  function corrigerSchema() {
    if (E.schemaScore === null) E.schemaScore = SCHEMA.elements.filter(e => E.schemaVerif && E.schemaVerif[e.id]).length;
    for (const e of SCHEMA.elements) if (!e.cases.includes(E.schema[e.id])) E.schema[e.id] = e.cases[0];
    E.schemaCorrige = true; E.schemaVerif = {}; for (const e of SCHEMA.elements) E.schemaVerif[e.id] = true;
    sauver(); dessinerSchema();
  }
  function dessinerRedaction() {
    const cont = $('#schema-contenu');
    const zone = h('textarea', { id: 'redaction', rows: '8', placeholder: 'Venise fonde sa puissance sur…' });
    zone.value = E.redaction || '';
    const compteur = h('span', { class: 'score' });
    const fini = h('button', { class: 'btn or', type: 'button', onclick: () => { E.redaction = zone.value.trim(); E.phase = 'fin'; sauver(); ouvrirFin(); } }, 'Terminer : voir mon carnet de bord →');
    const maj = () => { const n = zone.value.trim().split(/\s+/).filter(Boolean).length; compteur.textContent = n + ' mot' + (n > 1 ? 's' : '') + (n < 15 ? ' (15 au moins)' : ''); fini.disabled = n < 15; E.redaction = zone.value; sauver(); };
    zone.addEventListener('input', maj);
    cont.append(h('div', { class: 'carte-intro' },
      h('p', { class: 'niveau' }, JEU.niveau),
      h('h1', { style: 'font-size:28px' }, 'Réponds à la question de départ'),
      h('div', { class: 'qdepart' }, h('small', null, 'Question de départ'), h('b', null, JEU.questionDepart)),
      h('p', { style: 'margin:0;color:var(--muted)' }, REDACTION.consigne + ' Appuie-toi sur ton voyage, sur la chronique et sur ton schéma.'),
      h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;align-items:center' }, h('span', { style: 'font-size:13px;color:var(--caption)' }, 'Mots utiles :'), REDACTION.aide.map(m => h('span', { class: 'etiquette', style: 'padding:4px 9px;font-size:13px' }, m))),
      zone,
      h('div', { class: 'actions' }, fini, compteur,
        h('button', { class: 'btn second', type: 'button', onclick: () => { E.etapeSchema = 'placer'; sauver(); dessinerSchema(); } }, '← Revoir mon schéma'))));
    maj(); zone.focus();
  }

  /* ---------- Carnet de bord ---------- */
  function construireCarnet(final, image) {
    const auj = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const c = h('div', { class: 'carnet' },
      h('p', { class: 'niveau' }, JEU.niveau),
      h('h1', null, 'Carnet de bord'),
      h('div', { class: 'ident' }, (E.noms || 'Marchand anonyme') + (E.classe ? ' · ' + E.classe : '') + ' · ' + auj),
      h('div', { class: 'qdepart' }, h('small', null, 'Question de départ'), h('b', null, JEU.questionDepart)));
    c.append(h('h2', null, 'Mon voyage'));
    if (image) c.append(h('img', { class: 'carte', src: image, alt: 'Carte de mon itinéraire en Méditerranée' }));
    const nbEscales = ORDRE_PORTS.filter(p => E.visites[p]).length;
    c.append(h('div', { class: 'chiffres' },
      chiffre('Ducats au départ', JEU.ducatsDepart), chiffre(final ? 'Ducats au retour' : 'Ducats', E.ducats),
      chiffre('Escales', nbEscales + ' / ' + ORDRE_PORTS.length), chiffre(final ? 'Durée du voyage' : 'Date', final ? (E.jour - 1) + ' jours' : dateDe(E.jour))));
    const etapes = h('ol', { class: 'etapes' },
      h('li', null, h('span', { class: 'date' }, dateDe(1)), h('span', null, h('b', null, 'Venise'), ' : départ, avec ' + JEU.ducatsDepart + ' ducats.')));
    for (const j of E.journal) {
      const P = PORTS[j.port];
      etapes.append(h('li', null, h('span', { class: 'date' }, dateDe(j.jour)),
        h('span', null, h('b', null, P.nom), j.port === 'venise' ? ' : retour au Rialto.' : j.premiere && P.notion ? ' : ' + P.notion[0] + ', ' + P.notion[1] : ' : escale.')));
    }
    c.append(etapes);
    const rencontres = PERSONNAGES.filter(p => E.rencontres[p.id]);
    if (rencontres.length) c.append(h('p', { style: 'margin:4px 0 0;font-size:14px;color:var(--muted)' }, 'Personnes rencontrées : ' + liste(rencontres.map(p => p.nom + ' (' + p.role.charAt(0).toLowerCase() + p.role.slice(1) + ')')) + '.'));
    const evs = Object.keys(E.evenements);
    if (evs.length) {
      c.append(h('h2', null, 'Événements'));
      c.append(h('ul', { class: 'etapes' }, evs.map(id => h('li', null, h('span', { class: 'date' }, EVENEMENTS[id].titre), h('span', null, 'Mon choix : ' + E.evenements[id].choix + '. ' + E.evenements[id].resultat)))));
    }
    const rep = Object.keys(E.reponses).sort((a, b) => E.reponses[a].n - E.reponses[b].n);
    c.append(h('h2', null, 'Mes réponses (' + nbBonnes() + ' / ' + NB_QUESTIONS + ')'));
    if (rep.length) {
      c.append(h('div', { class: 'tableau' }, h('table', { class: 'reponses' },
        h('thead', null, h('tr', null, h('th', null, 'Question'), h('th', null, 'Ma réponse'), h('th', null, ''))),
        h('tbody', null, rep.map(q => {
          const Q = QUESTIONS[q], r = E.reponses[q];
          return h('tr', null, h('td', null, Q.q), h('td', null, Q.choix[r.choix], r.ok ? null : h('div', { style: 'color:var(--ok);margin-top:3px' }, 'Réponse attendue : ' + Q.choix[Q.bonne])),
            h('td', { class: r.ok ? 'v' : 'x' }, r.ok ? '✓' : '✗'));
        })))));
    } else c.append(h('p', null, 'Aucune réponse pour le moment.'));
    if (final) {
      c.append(h('h2', null, 'Et après ? Venise face aux menaces'));
      c.append(h('ul', { class: 'etapes' }, CHRONIQUE.map((ch, i) => {
        const r = E.chronique[i];
        return h('li', null, h('span', { class: 'date' }, ch.date), h('span', null, h('b', null, ch.titre), ' : mon avis, ' + (r === 'atout' ? 'un atout' : r === 'menace' ? 'une menace' : '(sans réponse)') + ' ', h('span', { class: r === ch.reponse ? 'v' : 'x' }, r === ch.reponse ? '✓' : '✗')));
      })));
      c.append(h('h2', null, 'Mon schéma' + (E.schemaScore !== null ? ' (' + E.schemaScore + ' / ' + SCHEMA.elements.length + ' au premier essai' + (E.schemaCorrige ? ', puis correction' : '') + ')' : '')));
      c.append(h('div', { class: 'schema-final' }, SCHEMA.cases.map(cs => h('div', null, h('b', null, cs.titre),
        SCHEMA.elements.filter(e => E.schema[e.id] === cs.id).map(e => e.texte).join(' · ') || '(vide)'))));
      c.append(h('h2', null, 'Ma réponse à la question de départ'));
      c.append(h('div', { class: 'redaction-finale' }, E.redaction || ''));
    }
    return c;
  }
  function carnetTexte() {
    const L = [];
    L.push('CARNET DE BORD · ' + JEU.titre + ' (' + JEU.niveau + ')');
    L.push((E.noms || 'Marchand anonyme') + (E.classe ? ' · ' + E.classe : '') + ' · ' + new Date().toLocaleDateString('fr-FR'));
    L.push('', 'Question de départ : ' + JEU.questionDepart, '');
    L.push('MON VOYAGE : ' + JEU.ducatsDepart + ' ducats au départ, ' + E.ducats + ' ducats ' + (E.phase === 'fin' ? 'au retour' : 'aujourd\'hui') + ', ' + ORDRE_PORTS.filter(p => E.visites[p]).length + '/' + ORDRE_PORTS.length + ' escales, ' + (E.jour - 1) + ' jours.');
    L.push('- ' + dateDe(1) + ' : Venise, départ.');
    E.journal.forEach(j => L.push('- ' + dateDe(j.jour) + ' : ' + PORTS[j.port].nom + (j.premiere && PORTS[j.port].notion ? ' (' + PORTS[j.port].notion[0] + ')' : '')));
    L.push('', 'MES RÉPONSES (' + nbBonnes() + '/' + NB_QUESTIONS + ')');
    Object.keys(E.reponses).sort((a, b) => E.reponses[a].n - E.reponses[b].n).forEach(q => {
      const Q = QUESTIONS[q], r = E.reponses[q];
      L.push('- ' + Q.q, '  ' + (r.ok ? '[juste] ' : '[faux] ') + Q.choix[r.choix] + (r.ok ? '' : ' (attendu : ' + Q.choix[Q.bonne] + ')'));
    });
    if (E.phase === 'fin') {
      L.push('', 'ET APRÈS ?');
      CHRONIQUE.forEach((ch, i) => L.push('- ' + ch.date + ' ' + ch.titre + ' : ' + (E.chronique[i] || '?') + (E.chronique[i] === ch.reponse ? ' [juste]' : ' [faux]')));
      L.push('', 'MON SCHÉMA' + (E.schemaScore !== null ? ' (' + E.schemaScore + '/' + SCHEMA.elements.length + ' au premier essai)' : ''));
      SCHEMA.cases.forEach(cs => L.push('- ' + cs.titre + ' : ' + SCHEMA.elements.filter(e => E.schema[e.id] === cs.id).map(e => e.texte).join(' ; ')));
      L.push('', 'MA RÉPONSE À LA QUESTION DE DÉPART', E.redaction || '');
    }
    return L.join('\n');
  }
  function boutonRendu() {
    if (!DANS_CADRE) return h('button', { class: 'btn or', type: 'button', onclick: imprimer }, 'Imprimer ou enregistrer en PDF');
    return h('button', { class: 'btn or', type: 'button', onclick: copierCarnet }, 'Copier mon carnet');
  }
  function copierCarnet(ev) {
    const texte = carnetTexte(), cible = ev && ev.currentTarget;
    const secours = () => {
      const zone = h('textarea', { id: 'copie-secours', readonly: true }); zone.value = texte;
      ouvrirModal([h('h2', null, 'Copie ton carnet'), h('p', null, 'Sélectionne le texte ci-dessous, copie-le, puis colle-le où ton professeur te l\'a demandé.'), zone,
        h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: fermerModal }, 'Fermer'))]);
      zone.focus(); zone.select();
    };
    try {
      navigator.clipboard.writeText(texte).then(() => { if (cible) cible.textContent = 'Carnet copié'; toast('Carnet copié : colle-le où ton professeur te l\'a demandé.'); }, secours);
    } catch (e) { secours(); }
  }
  function ouvrirCarnet() {
    ouvrirModal([construireCarnet(false), h('div', { class: 'actions' },
      h('button', { class: 'btn', type: 'button', onclick: fermerModal }, 'Fermer'), boutonRendu())], { large: true });
  }
  let imageFinale = null;
  function ouvrirFin() {
    fermerDialogue();
    $('#ecran-schema').hidden = true;
    appliquerChroniqueJusqua(-1); majCarte(); C3.etatPorts({});
    imageFinale = C3.capture();
    appliquerChroniqueJusqua(CHRONIQUE.length - 1);
    const cont = $('#fin-contenu'); cont.innerHTML = '';
    cont.append(h('div', { class: 'barre-fin' }, boutonRendu(),
      h('button', { class: 'btn second', type: 'button', onclick: revoirCarte }, 'Revoir la carte'),
      h('button', { class: 'btn second', type: 'button', onclick: nouvellePartie }, 'Nouvelle partie')));
    if (DANS_CADRE) cont.append(h('p', { class: 'note-rendu' }, 'Pour rendre ton carnet : copie-le et colle-le dans l\'ENT (ou un document), ou montre cet écran à ton professeur.'));
    cont.append(construireCarnet(true, imageFinale), credits());
    $('#ecran-fin').hidden = false; $('#ecran-fin').scrollTop = 0;
  }
  function revoirCarte() {
    $('#ecran-fin').hidden = true;
    C3.vue('ensemble'); majHUD();
    const bascule = () => { navigationLibre(!libreActif); revoirCarte2(); };
    function revoirCarte2() {
      panneau([entete('venise', 'Fin du voyage'), h('h2', null, libreActif ? 'Navigation libre' : 'Explore la carte'),
        h('p', null, libreActif
          ? 'Dirige toi-même ta galère avec les touches Z Q S D ou les flèches (Maj pour accélérer), ou avec les boutons en bas à droite de la carte. Attention aux côtes !'
          : 'Tourne, zoome, retrouve ton itinéraire en rouge et les changements survenus entre 1378 et 1500. Tu peux aussi prendre la barre de ta galère.'),
        C3.secours ? null : h('button', { class: 'btn' + (libreActif ? ' second' : ''), type: 'button', onclick: bascule }, libreActif ? 'Arrêter la navigation libre' : 'Naviguer librement')],
      [bouton('Revenir à mon carnet de bord', () => { navigationLibre(false); ouvrirFin(); })]);
    }
    revoirCarte2();
  }
  function imprimer() { remplirImpression(); window.print(); }
  function remplirImpression() {
    const zone = $('#impression'); zone.innerHTML = '';
    zone.append(E && E.phase === 'fin' ? construireCarnet(true, imageFinale) : construireCarnet(false));
  }
  window.addEventListener('beforeprint', () => { if (E && E.phase !== 'intro') remplirImpression(); });
  function nouvellePartie() {
    ouvrirModal([h('h2', null, 'Nouvelle partie ?'), h('p', null, 'Ton carnet de bord actuel sera effacé. Pense à le rendre avant.'),
      h('div', { class: 'actions' },
        h('button', { class: 'btn rouge', type: 'button', onclick: () => { fermerModal(); try { localStorage.removeItem(CLE); } catch (e) { /* rien */ } location.reload(); } }, 'Effacer et recommencer'),
        h('button', { class: 'btn second', type: 'button', onclick: fermerModal }, 'Annuler'))]);
  }

  /* ---------- Sources et crédits ---------- */
  const credits = () => h('details', { class: 'credits' }, h('summary', null, 'Sources et crédits'), h('ul', null,
    h('li', null, 'Textes et questions : d\'après la fiche « PPO : Venise, grande puissance maritime et commerciale » (entretien avec Philippe Braunstein, Les Collections de L\'Histoire, n° 71, 2016).'),
    h('li', null, 'Personnages : imaginés ; ce qu\'ils racontent s\'appuie sur la fiche et sur les travaux d\'historiens du commerce vénitien.'),
    h('li', null, 'Gravure de Venise (XVIe siècle) : © The Hebrew University of Jerusalem & The Jewish National & University Library.'),
    h('li', null, 'Trait de côte : Natural Earth (domaine public). Relief exagéré et villes symboliques : reconstitution simplifiée.'),
    h('li', null, 'Moteur 3D : three.js (licence MIT).')));

  /* ---------- Navigation libre ---------- */
  let libreActif = false, dernierEchouage = 0;
  function navigationLibre(actif) {
    libreActif = actif;
    C3.navigationLibre(actif);
    $('#dpad').hidden = !actif; $('#aide-libre').hidden = !actif;
    $('#view').classList.toggle('libre', actif);
    document.querySelectorAll('#dpad button').forEach(b => b.classList.remove('on'));
  }
  C3.surEchouage = () => { const t = Date.now(); if (t - dernierEchouage > 3000) { dernierEchouage = t; toast('Attention, la côte ! Fais demi-tour.'); } };
  const TOUCHES = { ArrowUp: 'avant', z: 'avant', w: 'avant', ArrowDown: 'arriere', s: 'arriere', ArrowLeft: 'gauche', q: 'gauche', a: 'gauche', ArrowRight: 'droite', d: 'droite', Shift: 'vite' };
  function toucheLibre(e, etat) {
    if (!libreActif || /INPUT|TEXTAREA/.test(e.target.tagName || '')) return;
    const k = TOUCHES[e.key.length === 1 ? e.key.toLowerCase() : e.key]; if (!k) return;
    e.preventDefault(); C3.commande[k] = etat;
    const b = document.querySelector('#dpad [data-k="' + k + '"]'); if (b) b.classList.toggle('on', etat);
  }
  document.addEventListener('keydown', e => toucheLibre(e, true));
  document.addEventListener('keyup', e => toucheLibre(e, false));
  document.querySelectorAll('#dpad button').forEach(b => {
    const k = b.dataset.k;
    const on = e => { e.preventDefault(); if (k === 'vite') { C3.commande.vite = !C3.commande.vite; b.classList.toggle('on', C3.commande.vite); return; } C3.commande[k] = true; b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch (x) { /* rien */ } };
    const off = () => { if (k === 'vite') return; C3.commande[k] = false; b.classList.remove('on'); };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
  });

  /* ---------- Aide, plein écran ---------- */
  function ouvrirAide() {
    ouvrirModal([
      h('h2', null, 'Comment jouer'),
      h('div', { class: 'qdepart' }, h('small', null, 'Question de départ'), h('b', null, JEU.questionDepart)),
      h('div', { class: 'regles' }, REGLES.map(([t, d]) => h('div', { class: 'regle' }, h('b', null, t), d))),
      h('div', { class: 'actions' },
        h('button', { class: 'btn', type: 'button', onclick: fermerModal }, "C'est compris"),
        h('button', { class: 'btn second', type: 'button', onclick: () => { fermerModal(); C3.vue('ensemble'); } }, "Vue d'ensemble de la carte"),
        E && E.phase === 'port' ? h('button', { class: 'btn second', type: 'button', onclick: () => { fermerModal(); C3.vue('port', { port: E.port }); } }, 'Revenir au port') : null),
      credits()
    ]);
  }
  const fs = $('#b-fs');
  if (!document.fullscreenEnabled) fs.hidden = true;
  fs.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => toast('Le plein écran n\'est pas disponible ici.'));
  });
  document.addEventListener('fullscreenchange', () => { fs.textContent = document.fullscreenElement ? 'Quitter le plein écran' : 'Plein écran'; });

  /* ---------- Démarrage ---------- */
  function montrerJeu() { $('#ecran-intro').hidden = true; $('#legende').hidden = !!C3.secours; }
  function afficherIntro() {
    const s = charger();
    const cont = $('#intro-contenu'); cont.innerHTML = '';
    const nom = h('input', { id: 'i-noms', autocomplete: 'off', placeholder: 'Prénom Nom (et ton binôme)' });
    const classe = h('input', { id: 'i-classe', autocomplete: 'off', placeholder: 'Ex. : 2de 4' });
    const go = h('button', { class: 'btn or grand', type: 'button', disabled: true, onclick: () => {
      E = etatInitial(); E.noms = nom.value.trim(); E.classe = classe.value.trim(); E.phase = 'port';
      sauver(); montrerJeu(); C3.reinitialiserEffets(); C3.placerGalere('venise'); afficherPort();
    } }, 'Embarquer à Venise');
    nom.addEventListener('input', () => { go.disabled = nom.value.trim().length < 2; });
    const carte = h('div', { class: 'carte-intro' },
      h('p', { class: 'niveau' }, JEU.niveau),
      h('h1', null, JEU.titre),
      h('p', { class: 'sous' }, JEU.sousTitre),
      h('div', { class: 'qdepart' }, h('small', null, 'Question de départ'), h('b', null, JEU.questionDepart)),
      h('div', { class: 'intro-texte' }, INTRO.map(t => h('p', null, t))),
      h('div', { class: 'regles' }, REGLES.map(([t, d]) => h('div', { class: 'regle' }, h('b', null, t), d))),
      h('div', { class: 'champs' }, h('div', { class: 'champ' }, h('label', { for: 'i-noms' }, 'Ton nom (et celui de ton binôme)'), nom), h('div', { class: 'champ' }, h('label', { for: 'i-classe' }, 'Classe'), classe)),
      go);
    if (s && s.phase && s.phase !== 'intro') {
      carte.append(h('div', { class: 'reprise' },
        h('span', null, 'Partie en cours : ', h('b', null, s.noms || 'sans nom'), ', ' + (s.phase === 'fin' ? 'voyage terminé' : dateDe(s.jour) + ', ' + ORDRE_PORTS.filter(p => s.visites && s.visites[p]).length + '/' + ORDRE_PORTS.length + ' escales') + '.'),
        h('button', { class: 'btn or petit', type: 'button', onclick: () => reprendre(s) }, 'Reprendre')));
    }
    cont.append(carte);
    $('#ecran-intro').hidden = false;
  }
  function reprendre(s) {
    E = Object.assign(etatInitial(), s);
    if (E.phase === 'mer') { E.phase = 'port'; E.etape = 'depart'; }
    montrerJeu();
    C3.placerGalere(E.port); C3.itineraire(E.legs);
    if (E.phase === 'port') afficherPort();
    else if (E.phase === 'retour') afficherRetour();
    else if (E.phase === 'chronique') afficherChronique();
    else if (E.phase === 'schema') { appliquerChroniqueJusqua(CHRONIQUE.length - 1); majHUD(); panneau([entete('venise', 'Schéma bilan'), h('p', null, 'Complète ton schéma bilan.')], [bouton('Ouvrir le schéma', ouvrirSchema)]); ouvrirSchema(); }
    else if (E.phase === 'fin') { majHUD(); ouvrirFin(); }
  }

  $('#b-carnet').addEventListener('click', ouvrirCarnet);
  $('#b-aide').addEventListener('click', ouvrirAide);
  panneau([h('p', { class: 'count' }, 'Préparation du voyage'), h('h2', null, 'Venise, été 1350'), h('p', null, 'Ta galère se prépare au départ.')], []);

  function demarrer() {
    try {
      C3.init($('#scene'), { surClicPort: clicPort });
      $('#chargement').hidden = true;
    } catch (err) {
      // Pas de 3D (WebGL bloqué ou absent) : le voyage reste possible avec une carte fixe.
      C3.modeSecours();
      const ch = $('#chargement'); ch.className = 'fallback'; ch.innerHTML = '';
      ch.append(h('div', null,
        h('p', null, h('b', null, 'La carte en 3D ne peut pas s\'afficher sur cet ordinateur.'), ' Le voyage reste possible : suis les étapes dans le panneau.'),
        h('img', { src: 'img/carte-secours.jpg', alt: 'Carte des routes des galères vénitiennes en Méditerranée, avec les escales' })));
      $('#badge').hidden = true;
      if (window.console) console.warn('Mode de secours sans 3D :', err && err.message);
    }
    afficherIntro();
  }
  requestAnimationFrame(() => setTimeout(demarrer, 40));
  window.__jeu = { etat: () => E };
})();
