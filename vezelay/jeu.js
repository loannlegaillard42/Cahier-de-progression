/* Vézelay, 31 mars 1146 — déroulé : étapes sur la colline, personnages, sermon, carte de la croisade,
   schéma bilan et carnet de bord. Les textes sont dans donnees.js ; la 3D dans scene3d.js ; la carte dans carte.js. */
(function () {
  'use strict';
  const S = window.Scene3D;
  const CLE = 'vezelay-1146-v1';
  const RAPIDE = /rapide/.test(location.search) || location.hash === '#rapide';
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
  const ICONE_DATE = '<svg class="ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3" y="4.5" width="14" height="12.5" rx="2"/><path d="M3 8.5h14M7 2.5v4M13 2.5v4"/></svg>';
  const NB_QUESTIONS = ETAPES.reduce((n, e) => n + e.questions.length, 0);
  const persoDe = id => PERSONNAGES.find(p => p.id === id);

  /* ---------- État ---------- */
  let E = null;
  function etatInitial() {
    return {
      version: 1, phase: 'intro', noms: '', classe: '', etape: 0, maxEtape: 0, sousEtape: 0, sousMax: 0, sermonVu: false,
      reponses: {}, nbRep: 0, rencontres: {}, sujetsVus: {},
      schema: {}, schemaVerif: null, schemaEssais: 0, schemaCorrige: false, schemaScore: null, etapeSchema: 'placer', redaction: ''
    };
  }
  function sauver() { try { localStorage.setItem(CLE, JSON.stringify(E)); } catch (e) { /* stockage indisponible */ } }
  function charger() { try { const s = localStorage.getItem(CLE); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  const nbBonnes = () => Object.values(E.reponses).filter(r => r.ok).length;

  /* ---------- Interface commune ---------- */
  function majHUD() {
    $('#hud').hidden = false; $('#b-carnet').hidden = false;
    const et = ETAPES[E.etape];
    $('#st-date').innerHTML = ICONE_DATE + '<b>' + (E.phase === 'etapes' ? et.date : '1146-1149') + '</b>';
    $('#carnet-compte').textContent = Object.keys(E.reponses).length + '/' + NB_QUESTIONS;
  }
  function progression() {
    return h('div', { class: 'progress', 'aria-label': 'Étapes' }, ETAPES.map((et, i) => {
      const atteinte = i <= E.maxEtape, courante = i === E.etape;
      return h('button', { type: 'button', class: 'pdot' + (atteinte && !courante ? ' done' : ''), 'aria-current': courante ? 'step' : null, disabled: !atteinte, title: et.titre, 'aria-label': 'Étape ' + (i + 1) + ' : ' + et.titre, onclick: () => { if (atteinte && i !== E.etape) afficherEtape(i); } }, String(i + 1));
    }));
  }
  const bouton = (texte, onclick, opts) => h('button', { type: 'button', class: 'nbtn' + (opts && opts.second ? '' : ' primary'), disabled: !!(opts && opts.desactive), onclick }, texte);
  function panneau(blocs, actions, garder) {
    const p = $('#panneau'), corps = $('#panneau-corps'), nav = $('#panneau-nav'), y = p.scrollTop;
    corps.innerHTML = ''; corps.append(...blocs.filter(Boolean));
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
    b.append(...contenu.filter(Boolean)); b.scrollTop = 0; v.hidden = false;
    const f = b.querySelector('button:not(:disabled)'); if (f) f.focus({ preventScroll: true });
  }
  function fermerModal() { $('#modal').hidden = true; }
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal') fermerModal(); });
  const citation = c => h('blockquote', { class: 'quote' }, h('p', null, '« ' + c.texte + ' »'), h('cite', null, c.source));

  /* ---------- Portraits ---------- */
  function visage(l) {
    const c = l.coiffeCol || '#333', p = l.peau;
    let s = '<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="#E9DCC2"/>';
    s += `<path d="M12 100 C14 79 29 70 50 70 C71 70 86 79 88 100 Z" fill="${l.habit}"/>`;
    if (l.col) s += `<path d="M37 72 L50 87 L63 72" fill="none" stroke="${l.col}" stroke-width="4" stroke-linejoin="round"/>`;
    if (l.coiffe === 'voile') s += `<path d="M22 72 C18 32 32 15 50 15 C68 15 82 32 78 72 C66 78 34 78 22 72 Z" fill="${c}"/>`;
    if (l.coiffe === 'chaperon' || l.coiffe === 'capuche') s += `<path d="M20 74 C16 30 32 12 50 12 C68 12 84 30 80 74 C68 80 32 80 20 74 Z" fill="${c}"/>`;
    if (l.coiffe === 'tonsure') s += `<path d="M26 78 C28 66 38 62 50 62 C62 62 72 66 74 78 Z" fill="${l.habit}" stroke="rgb(0 0 0 / .15)"/>`;
    s += `<rect x="43" y="57" width="14" height="15" rx="4" fill="${p}"/>`;
    if (l.cheveux && !/voile|chaperon|capuche|casque/.test(l.coiffe || '')) s += `<ellipse cx="50" cy="40" rx="20.5" ry="22" fill="${l.cheveux}"/>`;
    if (l.coiffe === 'casque') s += `<ellipse cx="50" cy="44" rx="21" ry="24" fill="#8C9094"/>`;
    s += `<ellipse cx="50" cy="44" rx="16.5" ry="19.5" fill="${p}"/>`;
    if (l.coiffe === 'tonsure') s += `<ellipse cx="50" cy="27.5" rx="13" ry="6" fill="${p}"/>`;
    s += '<circle cx="43.5" cy="43" r="2.1" fill="#2A1E16"/><circle cx="56.5" cy="43" r="2.1" fill="#2A1E16"/>';
    s += `<path d="M39.5 38.3 q4 -2.6 8 0 M52.5 38.3 q4 -2.6 8 0" stroke="${l.cheveux || '#2A1E16'}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    s += '<path d="M50 45 q-2.2 6 1 7" stroke="rgb(0 0 0 / .25)" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
    if (l.barbe) s += `<path d="M34 45 C35 62 42 69 50 69 C58 69 65 62 66 45 C62 54 57 57.5 50 57.5 C43 57.5 38 54 34 45 Z" fill="${l.barbe}"/>`;
    s += `<path d="M45.5 ${l.barbe ? 55.2 : 54} q4.5 3 9 0" stroke="${l.barbe ? '#3A2A20' : '#9A4A3A'}" stroke-width="1.7" fill="none" stroke-linecap="round"/>`;
    if (l.coiffe === 'couronne' || l.coiffe === 'voile') s += `<path d="M33 ${l.coiffe === 'voile' ? 24 : 27} L33 17 L39 22 L44 13 L50 21 L56 13 L61 22 L67 17 L67 ${l.coiffe === 'voile' ? 24 : 27} Z" fill="${l.coiffe === 'voile' ? '#E3B341' : c}" stroke="#9A6E1E" stroke-width="1"/>`;
    else if (l.coiffe === 'casque') s += `<path d="M30 36 C30 20 40 10 50 8 C60 10 70 20 70 36 Z" fill="${c}"/><rect x="48" y="34" width="4" height="15" fill="${c}"/>`;
    else if (l.coiffe === 'pointu') s += `<path d="M31 32 C36 26 44 24 50 24 C56 24 64 26 69 32 L57 31 L50 6 L43 31 Z" fill="${c}"/><path d="M29 33 Q50 24 71 33 Q50 29 29 33 Z" fill="${c}"/>`;
    else if (l.coiffe === 'bonnet') s += `<path d="M32 35 C32 21 41 17 50 17 C59 17 68 21 68 35 Z" fill="${c}"/>`;
    return s + '</svg>';
  }

  // portrait rendu en 3D (si la 3D fonctionne), sinon portrait dessiné
  const portrait = p => S.portraits && S.portraits[p.id] ? '<img src="' + S.portraits[p.id] + '" alt="">' : visage(p.look);

  /* ---------- Dialogues ---------- */
  function blocPersonnages(ids) {
    if (!ids.length) return null;
    return h('div', { class: 'npcs' }, ids.map(id => {
      const p = persoDe(id), met = !!E.rencontres[id], vus = (E.sujetsVus[id] || []).length;
      return h('button', { type: 'button', class: 'npc-btn' + (met ? ' met' : ''), onclick: () => ouvrirDialogue(p) },
        h('span', { class: 'npc-face', html: portrait(p) }),
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
    try { const u = new SpeechSynthesisUtterance(texte); u.lang = 'fr-FR'; const v = speechSynthesis.getVoices().find(x => /^fr/i.test(x.lang)); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) { /* rien */ }
  }
  function taper(texte) {
    const el = $('#talk-texte');
    clearInterval(minuteurFrappe); minuteurFrappe = null; stopVoix();
    dialogue.texte = texte; $('#talk-lu').textContent = texte;
    if (REDUIT) { el.textContent = texte; return; }
    let i = 0; el.textContent = '';
    minuteurFrappe = setInterval(() => { i += 2; el.textContent = texte.slice(0, i); if (i >= texte.length) { clearInterval(minuteurFrappe); minuteurFrappe = null; } }, 18);
  }
  $('#talk-texte').addEventListener('click', () => { if (dialogue && minuteurFrappe) { clearInterval(minuteurFrappe); minuteurFrappe = null; $('#talk-texte').textContent = dialogue.texte; } });
  $('#talk-ecouter').addEventListener('click', () => { if (!dialogue) return; if (PEUT_PARLER && speechSynthesis.speaking) stopVoix(); else lire(dialogue.texte); });
  function ouvrirDialogue(p) {
    if (!E || E.phase !== 'etapes') return;
    dialogue = { p, texte: '' };
    const premiere = !E.rencontres[p.id];
    if (premiere) { E.rencontres[p.id] = true; sauver(); }
    $('#talk-visage').innerHTML = portrait(p); S.parle(p.id);
    $('#talk-nom').textContent = p.nom; $('#talk-role').textContent = p.role;
    $('#talk-ecouter').hidden = !PEUT_PARLER; $('#talk-prompt').hidden = true;
    $('#talk').hidden = false; $('#view').classList.add('talking');
    taper(p.intro); choixDialogue(false);
    if (premiere) { rafraichir(); majMarqueurs(); }
    if (window.innerWidth <= 900) $('#view').scrollIntoView({ behavior: REDUIT ? 'auto' : 'smooth', block: 'start' });
  }
  function choixDialogue(fin) {
    const p = dialogue.p, vus = E.sujetsVus[p.id] || [], c = $('#talk-choix');
    c.innerHTML = '';
    if (fin) c.append(h('button', { type: 'button', class: 'bye', onclick: fermerDialogue }, h('kbd', null, '1'), 'Fermer la conversation'));
    else {
      p.sujets.forEach(([q, r], i) => c.append(h('button', { type: 'button', class: vus.includes(i) ? 'seen' : null, onclick: () => {
        if (!vus.includes(i)) { E.sujetsVus[p.id] = vus.concat(i); sauver(); rafraichir(); }
        taper(r); choixDialogue(false);
      } }, h('kbd', null, String(i + 1)), q)));
      c.append(h('button', { type: 'button', class: 'bye', onclick: () => { taper(p.aurevoir); choixDialogue(true); } }, h('kbd', null, String(p.sujets.length + 1)), 'Au revoir'));
    }
    $('#talk-compte').textContent = 'Questions posées : ' + (E.sujetsVus[p.id] || []).length + ' / ' + p.sujets.length;
  }
  function fermerDialogue() {
    if (!dialogue) return;
    stopVoix(); clearInterval(minuteurFrappe); minuteurFrappe = null; dialogue = null; S.parle(null);
    $('#talk').hidden = true; $('#view').classList.remove('talking');
    if (procheId) montrerInvite(procheId);
  }
  $('#talk-fermer').addEventListener('click', fermerDialogue);

  /* ---------- Questions ---------- */
  function blocQuestion(qid) {
    const Q = QUESTIONS[qid], r = E.reponses[qid];
    return h('div', { class: 'question' },
      h('p', { class: 'q-etiq' }, 'Carnet de bord · question'), h('p', { class: 'q' }, Q.q),
      h('div', { class: 'choix' }, Q.choix.map((c, i) => {
        let cls = null; if (r) { if (i === Q.bonne) cls = 'bonne'; else if (i === r.choix) cls = 'fausse'; }
        return h('button', { type: 'button', class: cls, disabled: !!r, onclick: () => repondre(qid, i) }, c);
      })),
      r ? h('div', { class: 'explication ' + (r.ok ? 'ok' : 'ko') }, h('b', null, r.ok ? 'Bonne réponse !' : 'Pas tout à fait…'), Q.exp) : null);
  }
  function repondre(qid, i) {
    if (E.reponses[qid]) return;
    E.reponses[qid] = { choix: i, ok: i === QUESTIONS[qid].bonne, n: ++E.nbRep };
    sauver(); majHUD(); rafraichir();
  }

  /* ---------- Carte de la croisade ---------- */
  let carte = null;
  function montrerCarte(etat, animer) {
    if (!carte) carte = CarteCroisade.creer($('#carte'), {});
    $('#carte').hidden = false; S.pause(true);
    carte.etat(Object.assign({}, etat, { animer: animer !== false && !REDUIT }));
  }
  function cacherCarte() { $('#carte').hidden = true; S.pause(false); }

  /* ---------- Étapes ---------- */
  function questionsVisibles(et) {
    const rencontre = et.persos.some(id => E.rencontres[id]);
    if (!rencontre) return { ok: false, raison: 'Parle d\'abord à ' + liste(et.persos.map(id => persoDe(id).nom)) + ' : ' + (et.persos.length > 1 ? 'leurs' : 'ses') + ' réponses t\'aideront à remplir ton carnet de bord.' };
    if (et.sermon && !E.sermonVu) return { ok: false, raison: 'Écoute d\'abord le sermon de Bernard jusqu\'au bout.' };
    if (et.sousEtapes && E.sousMax < et.sousEtapes.length - 1) return { ok: false, raison: 'Suis d\'abord la croisade sur la carte, étape par étape.' };
    return { ok: true };
  }
  function majMarqueurs() {
    const et = ETAPES[E.etape];
    S.marquer(et.vue === '3d' ? et.persos.filter(id => !E.rencontres[id]) : []);
  }
  function rafraichir() { if (E && E.phase === 'etapes') afficherEtape(E.etape, { garder: true }); }
  function afficherEtape(i, opts) {
    opts = opts || {};
    const et = ETAPES[i], change = i !== E.etape || opts.premier;
    if (change) { fermerDialogue(); arreterSermon(); }
    if (libreActif && !opts.garder) promenade(false);
    E.etape = i; E.maxEtape = Math.max(E.maxEtape, i); sauver();
    majHUD();
    if (!opts.garder) {
      if (et.vue === '3d') {
        cacherCarte(); $('#b-libre').hidden = !!S.secours; $('#hint').hidden = !!S.secours;
        const arrivee = () => { if (et.sermon && !E.sermonVu && E.etape === i && E.phase === 'etapes') lancerSermon(); };
        if (S.secours) setTimeout(arrivee, RAPIDE ? 50 : 600);
        else S.allerA(et.point, { rapide: RAPIDE, fin: arrivee });
      } else {
        $('#b-libre').hidden = true; $('#hint').hidden = true;
        const etat = et.sousEtapes ? et.sousEtapes[Math.min(E.sousEtape, et.sousEtapes.length - 1)].carte : et.carte;
        montrerCarte(etat, true);
      }
    }
    majMarqueurs();
    const blocs = [progression(), h('p', { class: 'count' }, et.date + ' · Étape ' + (i + 1) + ' / ' + ETAPES.length), h('h2', null, et.titre)];
    et.texte.forEach(t => blocs.push(h('p', null, t)));
    if (et.sousEtapes) {
      const k = Math.min(E.sousEtape, et.sousEtapes.length - 1), se = et.sousEtapes[k];
      blocs.push(h('div', { class: 'sous-etape' },
        h('span', { class: 'se-titre' }, se.titre), h('p', null, se.texte),
        h('div', { class: 'se-nav' }, h('span', null, 'Sur la carte : ' + (k + 1) + ' / ' + et.sousEtapes.length),
          h('button', { type: 'button', class: 'btn second petit', disabled: k === 0, onclick: () => sousEtape(k - 1) }, '◀ Précédent'),
          h('button', { type: 'button', class: 'btn petit', disabled: k === et.sousEtapes.length - 1, onclick: () => sousEtape(k + 1) }, 'Suivant ▶'))));
    }
    if (et.citation) blocs.push(citation(et.citation));
    if (et.sermon && E.sermonVu) blocs.push(h('button', { type: 'button', class: 'btn second', onclick: lancerSermon }, 'Revoir la scène du sermon'));
    blocs.push(blocPersonnages(et.persos));
    if (et.notion) blocs.push(h('p', { class: 'notion', html: '<b>' + esc(et.notion[0]) + '</b> : ' + esc(et.notion[1]) }));
    const vis = questionsVisibles(et);
    if (!vis.ok && et.questions.length) blocs.push(h('p', { class: 'aide-dialogue' }, vis.raison));
    else if (et.questions.length) for (const q of et.questions) { blocs.push(blocQuestion(q)); if (!E.reponses[q]) break; }
    const fini = vis.ok && et.questions.every(q => E.reponses[q]);
    const actions = [];
    if (i > 0) actions.push(bouton('← Précédente', () => afficherEtape(i - 1), { second: true }));
    if (i < ETAPES.length - 1) actions.push(bouton('Étape suivante →', () => { if (ETAPES[i + 1].sousEtapes && E.maxEtape <= i) { E.sousEtape = 0; } afficherEtape(i + 1); }, { desactive: !fini }));
    else actions.push(bouton('Construire le schéma bilan →', () => { E.phase = 'schema'; sauver(); ouvrirSchema(); }, { desactive: !fini }));
    panneau(blocs, actions, opts.garder);
  }
  function sousEtape(k) {
    const et = ETAPES[E.etape];
    E.sousEtape = k; E.sousMax = Math.max(E.sousMax, k); sauver();
    montrerCarte(et.sousEtapes[k].carte, true);
    afficherEtape(E.etape, { garder: true });
  }

  /* ---------- Le sermon ---------- */
  let sermonEnCours = false;
  function lancerSermon() {
    fermerDialogue();
    if (ETAPES[E.etape].point !== 'foule') return;
    sermonEnCours = true; $('#hint').classList.add('gone');
    const st = $('#sous-titres');
    S.sermon(SERMON.lignes, RAPIDE, (i, l) => {
      st.hidden = false; $('#st-qui').textContent = l.qui;
      const d = $('#st-dit'); d.textContent = l.foule ? l.texte : '« ' + l.texte + ' »'; d.classList.toggle('foule', !!l.foule);
    }, () => {
      sermonEnCours = false;
      setTimeout(() => { if (!sermonEnCours) st.hidden = true; }, RAPIDE ? 100 : 2500);
      if (!E.sermonVu) { E.sermonVu = true; sauver(); toast('Scène terminée : ' + SERMON.source, 7000); }
      rafraichir();
    });
  }
  function arreterSermon() { if (sermonEnCours) { S.arreterSermon(); sermonEnCours = false; } $('#sous-titres').hidden = true; }

  /* ---------- Promenade libre ---------- */
  let libreActif = false, procheId = null;
  function promenade(actif) {
    libreActif = actif;
    const et = ETAPES[E.etape];
    if (actif) { arreterSermon(); S.promenade(true); }
    else { S.promenade(false); if (et.vue === '3d') S.allerA(et.point, { rapide: true }); }
    $('#b-libre').setAttribute('aria-pressed', String(actif)); $('#b-libre').textContent = actif ? 'Revenir à l\'étape' : 'Se promener librement';
    $('#dpad').hidden = !actif; $('#aide-libre').hidden = !actif; $('#hint').classList.toggle('gone', actif);
    document.querySelectorAll('#dpad button').forEach(b => b.classList.remove('on'));
    if (!actif) { procheId = null; $('#talk-prompt').hidden = true; }
  }
  $('#b-libre').addEventListener('click', () => promenade(!libreActif));
  function montrerInvite(id) {
    const b = $('#talk-prompt');
    if (!id || dialogue) { b.hidden = true; return; }
    b.textContent = 'Parler à ' + persoDe(id).nom; b.hidden = false; b.onclick = () => ouvrirDialogue(persoDe(id));
  }
  S.surProximite = id => { procheId = id; montrerInvite(id); };
  S.surRegard = () => { $('#hint').classList.add('gone'); };
  const TOUCHES = { ArrowUp: 'avant', z: 'avant', w: 'avant', ArrowDown: 'arriere', s: 'arriere', ArrowLeft: 'gauche', q: 'gauche', a: 'gauche', ArrowRight: 'droite', d: 'droite', Shift: 'vite' };
  function toucheLibre(e, etat) {
    if (!libreActif || dialogue || /INPUT|TEXTAREA/.test(e.target.tagName || '')) return false;
    const k = TOUCHES[e.key.length === 1 ? e.key.toLowerCase() : e.key]; if (!k) return false;
    e.preventDefault(); S.commande[k] = etat;
    const b = document.querySelector('#dpad [data-k="' + k + '"]'); if (b) b.classList.toggle('on', etat);
    return true;
  }
  document.addEventListener('keyup', e => toucheLibre(e, false));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { if (!$('#modal').hidden) { fermerModal(); return; } if (dialogue) fermerDialogue(); return; }
    if (toucheLibre(e, true)) return;
    if (!dialogue || !$('#modal').hidden || /INPUT|TEXTAREA/.test(e.target.tagName || '')) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9) { const b = $('#talk-choix').children[n - 1]; if (b) { e.preventDefault(); b.click(); } }
  });
  document.querySelectorAll('#dpad button').forEach(b => {
    const k = b.dataset.k;
    const on = e => { e.preventDefault(); if (k === 'vite') { S.commande.vite = !S.commande.vite; b.classList.toggle('on', S.commande.vite); return; } S.commande[k] = true; b.classList.add('on'); try { b.setPointerCapture(e.pointerId); } catch (x) { /* rien */ } };
    const off = () => { if (k === 'vite') return; S.commande[k] = false; b.classList.remove('on'); };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('lostpointercapture', off);
  });

  /* ---------- Schéma bilan ---------- */
  let choisi = null;
  function ouvrirSchema() { fermerDialogue(); arreterSermon(); if (libreActif) promenade(false); $('#ecran-schema').hidden = false; dessinerSchema(); }
  function etiquetteSchema(el) {
    const v = E.schemaVerif ? E.schemaVerif[el.id] : null;
    return h('button', { type: 'button', class: 'etiquette' + (choisi === el.id ? ' choisie' : '') + (v === true ? ' ok' : v === false ? ' ko' : ''), onclick: ev => {
      ev.stopPropagation();
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
    cont.append(h('div', { class: 'schema-tete' }, h('p', { class: 'niveau' }, JEU.niveau), h('h1', null, 'Schéma bilan'),
      h('p', null, 'Clique sur une étiquette, puis sur la case où elle doit aller. Pour déplacer une étiquette déjà placée, clique dessus puis sur une autre case (ou sur la réserve).')));
    cont.append(h('div', { class: 'reserve' + (choisi && E.schema[choisi] ? ' cible' : ''), onclick: () => { if (choisi && E.schema[choisi]) placer(null); } }, libres.map(etiquetteSchema)));
    const grille = h('div', { class: 'cases' }, h('div', { class: 'case centre' }, h('div', { class: 'c-titre' }, SCHEMA.titre)));
    for (const c of SCHEMA.cases) {
      grille.append(h('div', { class: 'case ' + c.id + (choisi ? ' cible' : ''), role: 'button', tabindex: '0', onclick: () => placer(c.id), onkeydown: ev => { if (ev.key === 'Enter') placer(c.id); } },
        h('div', { class: 'c-titre' }, c.titre), h('div', { class: 'c-sous' }, c.sous), h('div', { class: 'c-liste' }, SCHEMA.elements.filter(e => E.schema[e.id] === c.id).map(etiquetteSchema))));
    }
    cont.append(grille);
    const actions = h('div', { class: 'actions' }), tousPlaces = !libres.length, toutJuste = E.schemaVerif && SCHEMA.elements.every(e => E.schemaVerif[e.id]);
    if (!toutJuste) actions.append(h('button', { class: 'btn', type: 'button', disabled: !tousPlaces, onclick: verifierSchema }, tousPlaces ? 'Vérifier mon schéma' : 'Place toutes les étiquettes (' + libres.length + ' restantes)'));
    if (E.schemaVerif) { const n = SCHEMA.elements.filter(e => E.schemaVerif[e.id]).length; actions.append(h('span', { class: 'score' }, n + ' / ' + SCHEMA.elements.length + ' bien placées' + (toutJuste ? ' : bravo !' : ' : déplace les étiquettes en rouge.'))); }
    if (!toutJuste && E.schemaEssais >= 2) actions.append(h('button', { class: 'btn second', type: 'button', onclick: corrigerSchema }, 'Voir la correction'));
    if (toutJuste) actions.append(h('button', { class: 'btn or', type: 'button', onclick: () => { E.etapeSchema = 'redaction'; sauver(); dessinerSchema(); $('#ecran-schema').scrollTop = 0; } }, 'Continuer : répondre à la question de départ →'));
    actions.append(h('button', { class: 'btn second', type: 'button', onclick: () => { $('#ecran-schema').hidden = true; E.phase = 'etapes'; sauver(); afficherEtape(E.etape); } }, '← Revenir aux étapes'));
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
    const zone = h('textarea', { id: 'redaction', rows: '8', placeholder: 'Bernard n\'a ni armée ni royaume, mais…' }); zone.value = E.redaction || '';
    const compteur = h('span', { class: 'score' });
    const fini = h('button', { class: 'btn or', type: 'button', onclick: () => { E.redaction = zone.value.trim(); E.phase = 'fin'; sauver(); ouvrirFin(); } }, 'Terminer : voir mon carnet de bord →');
    const maj = () => { const n = zone.value.trim().split(/\s+/).filter(Boolean).length; compteur.textContent = n + ' mot' + (n > 1 ? 's' : '') + (n < 15 ? ' (15 au moins)' : ''); fini.disabled = n < 15; E.redaction = zone.value; sauver(); };
    zone.addEventListener('input', maj);
    cont.append(h('div', { class: 'carte-intro' }, h('p', { class: 'niveau' }, JEU.niveau), h('h1', { style: 'font-size:28px' }, 'Bilan du PPO'),
      h('div', { class: 'qdepart' }, h('small', null, 'Question de départ'), h('b', null, JEU.questionDepart)),
      h('p', { style: 'margin:0;color:var(--muted)' }, REDACTION.consigne),
      h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;align-items:center' }, h('span', { style: 'font-size:13px;color:var(--caption)' }, 'Mots utiles :'), REDACTION.aide.map(m => h('span', { class: 'etiquette', style: 'padding:4px 9px;font-size:13px' }, m))),
      zone,
      h('div', { class: 'actions' }, fini, compteur, h('button', { class: 'btn second', type: 'button', onclick: () => { E.etapeSchema = 'placer'; sauver(); dessinerSchema(); } }, '← Revoir mon schéma'))));
    maj(); zone.focus();
  }

  /* ---------- Carnet de bord ---------- */
  function imageCarte() {
    if (!carte) carte = CarteCroisade.creer($('#carte'), {});
    carte.etat({ routes: Object.keys(CarteCroisade.ROUTES), lieux: ['clairvaux', 'vezelay', 'paris', 'spire', 'ratisbonne', 'constantinople', 'nicee', 'dorylee', 'ephese', 'cadmos', 'attalia', 'antioche', 'edesse', 'acre', 'jerusalem', 'damas', 'lisbonne'], vue: 'tout', animer: false });
    const svg = carte.svg.cloneNode(true); svg.setAttribute('width', '1000'); svg.setAttribute('height', '583'); svg.querySelectorAll('path').forEach(p => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; p.style.transition = ''; });
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
  }
  const chiffre = (t, v) => h('div', { class: 'chiffre' }, h('small', null, t), h('b', null, v));
  function construireCarnet(final) {
    const auj = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const c = h('div', { class: 'carnet' }, h('p', { class: 'niveau' }, JEU.niveau), h('h1', null, 'Carnet de bord'),
      h('div', { class: 'ident' }, (E.noms || 'Pèlerin anonyme') + (E.classe ? ' · ' + E.classe : '') + ' · ' + auj),
      h('div', { class: 'qdepart' }, h('small', null, 'Question de départ'), h('b', null, JEU.questionDepart)));
    c.append(h('h2', null, 'Mon parcours'));
    if (final) c.append(h('img', { class: 'carte', src: imageCarte(), alt: 'Carte de la deuxième croisade (1146-1149)' }));
    const rencontres = PERSONNAGES.filter(p => E.rencontres[p.id]);
    c.append(h('div', { class: 'chiffres' }, chiffre('Étapes', (E.maxEtape + 1) + ' / ' + ETAPES.length), chiffre('Rencontres', rencontres.length + ' / ' + PERSONNAGES.length), chiffre('Bonnes réponses', nbBonnes() + ' / ' + NB_QUESTIONS)));
    c.append(h('ol', { class: 'etapes' }, ETAPES.slice(0, E.maxEtape + 1).map(et => h('li', null, h('span', { class: 'date' }, et.date), h('span', null, h('b', null, et.titre), et.notion ? ' : ' + et.notion[0] + ', ' + et.notion[1] : '')))));
    if (rencontres.length) c.append(h('p', { style: 'margin:4px 0 0;font-size:14px;color:var(--muted)' }, 'Personnes rencontrées : ' + liste(rencontres.map(p => p.nom + ' (' + p.role.charAt(0).toLowerCase() + p.role.slice(1) + ')')) + '.'));
    const rep = Object.keys(E.reponses).sort((a, b) => E.reponses[a].n - E.reponses[b].n);
    c.append(h('h2', null, 'Mes réponses (' + nbBonnes() + ' / ' + NB_QUESTIONS + ')'));
    if (rep.length) c.append(h('div', { class: 'tableau' }, h('table', { class: 'reponses' },
      h('thead', null, h('tr', null, h('th', null, 'Question'), h('th', null, 'Ma réponse'), h('th', null, ''))),
      h('tbody', null, rep.map(q => { const Q = QUESTIONS[q], r = E.reponses[q]; return h('tr', null, h('td', null, Q.q), h('td', null, Q.choix[r.choix], r.ok ? null : h('div', { style: 'color:var(--ok);margin-top:3px' }, 'Réponse attendue : ' + Q.choix[Q.bonne])), h('td', { class: r.ok ? 'v' : 'x' }, r.ok ? '✓' : '✗')); })))));
    else c.append(h('p', null, 'Aucune réponse pour le moment.'));
    if (final) {
      c.append(h('h2', null, 'Mon schéma' + (E.schemaScore !== null ? ' (' + E.schemaScore + ' / ' + SCHEMA.elements.length + ' au premier essai' + (E.schemaCorrige ? ', puis correction' : '') + ')' : '')));
      c.append(h('div', { class: 'schema-final' }, SCHEMA.cases.map(cs => h('div', null, h('b', null, cs.titre), SCHEMA.elements.filter(e => E.schema[e.id] === cs.id).map(e => e.texte).join(' · ') || '(vide)'))));
      c.append(h('h2', null, 'Ma réponse à la question de départ'), h('div', { class: 'redaction-finale' }, E.redaction || ''));
    }
    return c;
  }
  function carnetTexte() {
    const L = ['CARNET DE BORD · ' + JEU.titre + ' (' + JEU.niveau + ')', (E.noms || 'Pèlerin anonyme') + (E.classe ? ' · ' + E.classe : '') + ' · ' + new Date().toLocaleDateString('fr-FR'), '', 'Question de départ : ' + JEU.questionDepart, ''];
    L.push('MON PARCOURS : ' + (E.maxEtape + 1) + '/' + ETAPES.length + ' étapes, ' + PERSONNAGES.filter(p => E.rencontres[p.id]).length + ' personnes rencontrées.');
    L.push('', 'MES RÉPONSES (' + nbBonnes() + '/' + NB_QUESTIONS + ')');
    Object.keys(E.reponses).sort((a, b) => E.reponses[a].n - E.reponses[b].n).forEach(q => { const Q = QUESTIONS[q], r = E.reponses[q]; L.push('- ' + Q.q, '  ' + (r.ok ? '[juste] ' : '[faux] ') + Q.choix[r.choix] + (r.ok ? '' : ' (attendu : ' + Q.choix[Q.bonne] + ')')); });
    if (E.phase === 'fin') {
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
      ouvrirModal([h('h2', null, 'Copie ton carnet'), h('p', null, 'Sélectionne le texte ci-dessous, copie-le, puis colle-le où ton professeur te l\'a demandé.'), zone, h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: fermerModal }, 'Fermer'))]);
      zone.focus(); zone.select();
    };
    try { navigator.clipboard.writeText(texte).then(() => { if (cible) cible.textContent = 'Carnet copié'; toast('Carnet copié : colle-le où ton professeur te l\'a demandé.'); }, secours); } catch (e) { secours(); }
  }
  function ouvrirCarnet() { ouvrirModal([construireCarnet(false), h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: fermerModal }, 'Fermer'), boutonRendu())], { large: true }); }
  function ouvrirFin() {
    fermerDialogue(); arreterSermon();
    $('#ecran-schema').hidden = true;
    const cont = $('#fin-contenu'); cont.innerHTML = '';
    cont.append(h('div', { class: 'barre-fin' }, boutonRendu(),
      h('button', { class: 'btn second', type: 'button', onclick: () => { $('#ecran-fin').hidden = true; E.phase = 'etapes'; sauver(); afficherEtape(E.etape); } }, 'Revoir la visite'),
      h('button', { class: 'btn second', type: 'button', onclick: nouvellePartie }, 'Nouvelle partie')));
    if (DANS_CADRE) cont.append(h('p', { class: 'note-rendu' }, 'Pour rendre ton carnet : copie-le et colle-le dans l\'ENT (ou un document), ou montre cet écran à ton professeur.'));
    cont.append(construireCarnet(true), credits());
    $('#ecran-fin').hidden = false; $('#ecran-fin').scrollTop = 0;
  }
  function imprimer() { remplirImpression(); window.print(); }
  function remplirImpression() { const z = $('#impression'); z.innerHTML = ''; z.append(construireCarnet(E && E.phase === 'fin')); }
  window.addEventListener('beforeprint', () => { if (E && E.phase !== 'intro') remplirImpression(); });
  function nouvellePartie() {
    ouvrirModal([h('h2', null, 'Nouvelle partie ?'), h('p', null, 'Ton carnet de bord actuel sera effacé. Pense à le rendre avant.'),
      h('div', { class: 'actions' }, h('button', { class: 'btn rouge', type: 'button', onclick: () => { fermerModal(); try { localStorage.removeItem(CLE); } catch (e) { /* rien */ } location.reload(); } }, 'Effacer et recommencer'), h('button', { class: 'btn second', type: 'button', onclick: fermerModal }, 'Annuler'))]);
  }
  const credits = () => h('details', { class: 'credits' }, h('summary', null, 'Sources et crédits'), h('ul', null,
    h('li', null, 'Documents : d\'après la fiche « Croisades et djihad — PPO Bernard de Clairvaux » (Doc. 4 à 7).'),
    h('li', null, 'Sermon : phrases tirées d\'une lettre de Bernard de 1146 (lettre 363), en traduction simplifiée ; le texte du sermon de Vézelay n\'a pas été conservé.'),
    h('li', null, 'Personnages : Louis VII, Aliénor, Odon de Deuil et Éphraïm de Bonn ont existé ; les autres sont imaginés. Ce qu\'ils racontent s\'appuie sur les sources de l\'époque et les travaux d\'historiens.'),
    h('li', null, 'Itinéraires de la croisade : d\'après Odon de Deuil et J. Phillips, The Second Crusade (2007) ; tracés simplifiés. Fond de carte : Natural Earth (domaine public).'),
    h('li', null, 'Colline, basilique et foule : reconstitution imaginée et simplifiée. La basilique est montrée telle qu\'on la suppose vers 1146 : nef romane achevée, avant-nef et tours encore en chantier, chœur roman (l\'actuel chœur gothique date de 1185-1215).'),
    h('li', null, 'Personnages, costumes, décors et textures sont modélisés directement dans le navigateur. Moteur 3D : three.js (licence MIT).')));

  /* ---------- Aide, plein écran ---------- */
  function ouvrirAide() {
    ouvrirModal([h('h2', null, 'Comment jouer'), h('div', { class: 'qdepart' }, h('small', null, 'Question de départ'), h('b', null, JEU.questionDepart)),
      h('div', { class: 'regles' }, REGLES.map(([t, d]) => h('div', { class: 'regle' }, h('b', null, t), d))),
      h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: fermerModal }, "C'est compris")), credits()]);
  }
  const fs = $('#b-fs');
  if (!document.fullscreenEnabled) fs.hidden = true;
  fs.addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else document.documentElement.requestFullscreen().catch(() => toast('Le plein écran n\'est pas disponible ici.')); });
  document.addEventListener('fullscreenchange', () => { fs.textContent = document.fullscreenElement ? 'Quitter le plein écran' : 'Plein écran'; });

  /* ---------- Démarrage ---------- */
  function afficherIntro() {
    const s = charger(), cont = $('#intro-contenu'); cont.innerHTML = '';
    const nom = h('input', { id: 'i-noms', autocomplete: 'off', placeholder: 'Prénom Nom (et ton binôme)' });
    const classe = h('input', { id: 'i-classe', autocomplete: 'off', placeholder: 'Ex. : 2de 4' });
    const go = h('button', { class: 'btn or grand', type: 'button', disabled: true, onclick: () => {
      E = etatInitial(); E.noms = nom.value.trim(); E.classe = classe.value.trim(); E.phase = 'etapes';
      sauver(); $('#ecran-intro').hidden = true; afficherEtape(0, { premier: true });
    } }, 'Monter à Vézelay');
    nom.addEventListener('input', () => { go.disabled = nom.value.trim().length < 2; });
    const carteIntro = h('div', { class: 'carte-intro' }, h('p', { class: 'niveau' }, JEU.niveau), h('h1', null, JEU.titre), h('p', { class: 'sous' }, JEU.sousTitre),
      h('div', { class: 'qdepart' }, h('small', null, 'Question de départ'), h('b', null, JEU.questionDepart)),
      h('div', { class: 'intro-texte' }, INTRO.map(t => h('p', null, t))),
      h('div', { class: 'regles' }, REGLES.map(([t, d]) => h('div', { class: 'regle' }, h('b', null, t), d))),
      h('div', { class: 'champs' }, h('div', { class: 'champ' }, h('label', { for: 'i-noms' }, 'Ton nom (et celui de ton binôme)'), nom), h('div', { class: 'champ' }, h('label', { for: 'i-classe' }, 'Classe'), classe)), go);
    if (s && s.phase && s.phase !== 'intro') carteIntro.append(h('div', { class: 'reprise' },
      h('span', null, 'Partie en cours : ', h('b', null, s.noms || 'sans nom'), ', ' + (s.phase === 'fin' ? 'visite terminée' : 'étape ' + ((s.etape || 0) + 1) + ' / ' + ETAPES.length) + '.'),
      h('button', { class: 'btn or petit', type: 'button', onclick: () => reprendre(s) }, 'Reprendre')));
    cont.append(carteIntro); $('#ecran-intro').hidden = false;
  }
  function reprendre(s) {
    E = Object.assign(etatInitial(), s);
    $('#ecran-intro').hidden = true;
    if (E.phase === 'etapes') afficherEtape(E.etape, { premier: true });
    else if (E.phase === 'schema') { afficherEtape(E.etape, { premier: true }); ouvrirSchema(); }
    else if (E.phase === 'fin') { afficherEtape(E.etape, { premier: true }); ouvrirFin(); }
  }
  $('#b-carnet').addEventListener('click', ouvrirCarnet);
  $('#b-aide').addEventListener('click', ouvrirAide);
  panneau([h('p', { class: 'count' }, 'Pâques 1146'), h('h2', null, 'En route pour Vézelay'), h('p', null, 'La colline se dessine à l\'horizon.')], []);

  function demarrer() {
    try {
      S.init($('#scene'), { surClicPerso: id => { const p = persoDe(id); if (p) ouvrirDialogue(p); }, ombres: window.innerWidth > 900 && (navigator.hardwareConcurrency || 4) >= 4 });
      $('#chargement').hidden = true;
    } catch (err) {
      S.modeSecours();
      const ch = $('#chargement'); ch.className = 'fallback'; ch.innerHTML = '';
      ch.append(h('div', null, h('p', null, h('b', null, 'La vue en 3D ne peut pas s\'afficher sur cet ordinateur.'), ' La visite reste possible : suis les étapes dans le panneau.'),
        h('img', { src: 'img/vezelay-secours.jpg', alt: 'Vue de la colline de Vézelay, de la basilique et de la foule rassemblée autour de l\'estrade' })));
      $('#badge').hidden = true; $('#hint').hidden = true;
      if (window.console) console.warn('Mode de secours sans 3D :', err && err.message);
    }
    afficherIntro();
  }
  requestAnimationFrame(() => setTimeout(demarrer, 40));
  window.__jeu = { etat: () => E };
})();
