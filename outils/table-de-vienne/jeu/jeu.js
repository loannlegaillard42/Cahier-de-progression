/* La table de Vienne — déroulé du jeu : l'Europe de 1812, les salons, le tableau « Qui veut quoi ? »,
   trois séances de négociation, la crise de janvier 1815, les Cent-Jours, le bilan, les deux alliances,
   le tableau de la fiche, la chronique 1815-1848, la réponse finale et le carnet du secrétaire.
   Les textes sont dans donnees.js ; la carte dans carte.js. */
(function () {
  'use strict';
  const K = window.Carte;
  const CLE = 'table-vienne-v1';
  const DANS_CADRE = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  const REDUIT = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = s => document.querySelector(s);

  /* ---------- Outils ---------- */
  // espaces insécables de la typographie française
  const typo = s => String(s).replace(/ ([:;!?»])/g, ' $1').replace(/« /g, '« ').replace(/ – /g, ' – ');
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
    for (const c of enfants.flat()) if (c !== null && c !== undefined && c !== false) e.append(c.nodeType ? c : document.createTextNode(typo(c)));
    return e;
  }
  const liste = arr => arr.length <= 1 ? arr.join('') : arr.slice(0, -1).join(', ') + ' et ' + arr[arr.length - 1];
  const persoDe = id => PERSONNAGES.find(p => p.id === id);
  const NEGOCIATEURS = PERSONNAGES.filter(p => !p.guide);
  const ORDRE_DOSSIERS = SEANCES.flatMap(s => s.dossiers);
  const optionDe = (k, id) => DOSSIERS[k].options.find(o => o.id === id);
  const CELLULES = K.cellules();
  const VILLES_ID = {};
  for (const v of window.VILLES) VILLES_ID[v.id] = v;

  /* ---------- Icônes ---------- */
  const ICO = {
    eq: '<svg class="ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3v14M6 17h8M3.5 6.5h13M3.5 6.5l-2.5 5h5zM16.5 6.5l-2.5 5h5z"/></svg>',
    leg: '<svg class="ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M3 15.5h14l1-9-4.5 3.5L10 4 6.5 10 2 6.5z"/></svg>',
    sec: '<svg class="ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><path d="M10 2.5l6.5 2.6v4.6c0 4-2.8 6.7-6.5 7.8-3.7-1.1-6.5-3.8-6.5-7.8V5.1z"/></svg>',
    ent: '<svg class="ico" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="7.5" cy="10" r="4.2"/><circle cx="12.5" cy="10" r="4.2"/></svg>',
    peuple: '<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="#E9DCC2"/><g fill="#7A6A55"><circle cx="30" cy="42" r="10"/><path d="M12 84c2-16 9-24 18-24s16 8 18 24z"/><circle cx="70" cy="42" r="10"/><path d="M52 84c2-16 9-24 18-24s16 8 18 24z"/></g><g fill="#5A4B3A"><circle cx="50" cy="36" r="12"/><path d="M28 92c2-20 11-29 22-29s20 9 22 29z"/></g></svg>'
  };
  function portrait(l) {
    const p = l.peau, c = l.cheveux, hb = l.habit;
    let s = '<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" fill="#E9DCC2"/>';
    s += `<path d="M7 100 C9 80 26 70 50 70 C74 70 91 80 93 100 Z" fill="${hb}"/>`;
    s += '<path d="M35 72 L50 97 L44 72 Z M65 72 L50 97 L56 72 Z" fill="rgb(0 0 0 / .25)"/>';
    s += '<path d="M40 70 L50 90 L60 70 Z" fill="#F4F0E6"/>';
    if (l.decor === 'epaulettes') s += '<path d="M10 86 C13 77 22 72 31 72 L29 80 C22 80 15 83 10 90 Z M90 86 C87 77 78 72 69 72 L71 80 C78 80 85 83 90 90 Z" fill="#D4AF37"/>';
    if (l.cordon) s += `<path d="M27 74 L72 100 L61 100 L22 79 Z" fill="${l.cordon}"/>`;
    if (l.decor === 'plaque') s += '<path d="M31 82 L32.8 86.2 L37 88 L32.8 89.8 L31 94 L29.2 89.8 L25 88 L29.2 86.2 Z" fill="#EDE8DC" stroke="#8E8878" stroke-width=".7"/>';
    if (l.decor === 'toison') s += '<path d="M50 77 L50 85" stroke="#B2261E" stroke-width="3"/><path d="M46 86 h8 l-2 5 h-4 z" fill="#D4AF37"/>';
    s += `<rect x="43" y="55" width="14" height="13" rx="4" fill="${p}"/>`;
    s += '<path d="M39 64 C43 73 57 73 61 64 L62 71 C57 78 43 78 38 71 Z" fill="#FFFFFF" stroke="#D4CDBE" stroke-width=".8"/>';
    if (l.coiffure === 'poudre') s += `<path d="M26 52 C22 28 35 15 50 15 C65 15 78 28 74 52 C73 60 69 64 66 64 L66 46 C66 35 59 29 50 29 C41 29 34 35 34 46 L34 64 C31 64 27 60 26 52 Z" fill="${c}"/>`;
    else if (l.coiffure !== 'degarni') s += `<ellipse cx="50" cy="40" rx="20.5" ry="22" fill="${c}"/>`;
    s += `<ellipse cx="50" cy="44" rx="16.5" ry="19.5" fill="${p}"/>`;
    if (l.coiffure === 'degarni') s += `<path d="M33.2 36 C32.5 47 34.5 55 38 58 L38.8 43 Z M66.8 36 C67.5 47 65.5 55 62 58 L61.2 43 Z" fill="${c}"/><path d="M34 34 C35 29 38 27 41 27 L39 33 Z M66 34 C65 29 62 27 59 27 L61 33 Z" fill="${c}"/>`;
    s += '<circle cx="43.5" cy="43" r="2.1" fill="#2A1E16"/><circle cx="56.5" cy="43" r="2.1" fill="#2A1E16"/>';
    s += `<path d="M39.5 38.3 q4 -2.6 8 0 M52.5 38.3 q4 -2.6 8 0" stroke="${l.coiffure === 'poudre' ? '#8C8274' : c}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    s += '<path d="M50 45 q-2.2 6 1 7" stroke="rgb(0 0 0 / .25)" stroke-width="1.4" fill="none" stroke-linecap="round"/>';
    s += '<path d="M45.5 54 q4.5 2.6 9 0" stroke="#9A4A3A" stroke-width="1.7" fill="none" stroke-linecap="round"/>';
    if (l.coiffure === 'court') s += `<path d="M33 39 C31 24 41 18.5 50.5 18.5 C60 18.5 69 24 67 39 C63 30 56 27.5 50 27.5 C43 27.5 37 31 33 39 Z" fill="${c}"/>`;
    else if (l.coiffure === 'boucles') s += `<g fill="${c}"><circle cx="36" cy="30" r="6.5"/><circle cx="44" cy="23.5" r="7"/><circle cx="54" cy="22.5" r="7"/><circle cx="63" cy="28" r="6.5"/><circle cx="34" cy="38" r="5"/><circle cx="66" cy="37" r="5"/></g>`;
    else if (l.coiffure === 'poudre') s += `<path d="M33 37 C33 25 41 20 50 20 C59 20 67 25 67 37 C62 31 57 29 50 29 C43 29 38 31 33 37 Z" fill="${c}"/><g fill="${c}"><ellipse cx="31" cy="46" rx="4.5" ry="7"/><ellipse cx="69" cy="46" rx="4.5" ry="7"/></g>`;
    return s + '</svg>';
  }
  const visage = id => { const p = persoDe(id); return p ? portrait(p.look) : ICO.peuple; };

  /* ---------- État ---------- */
  let E = null;
  function etatInitial() {
    return {
      v: 1, phase: 'intro', etape: 'q', noms: '', classe: '', debut: new Date().toISOString(),
      q1812: null, rencontres: {}, sujetsVus: {},
      exig: {}, exigVerif: null, exigEssais: 0, exigScore: null, exigCorrige: false,
      seance: 0, choix: {}, choixEleve: {}, forces: {}, ouvert: null, crise: null, cj: 0,
      bilanRep: null, alliances: {}, tab: {}, tabVerif: null, tabEssais: 0, tabScore: null, tabCorrige: false,
      chro: {}, chroEtape: 0, redaction: '', vue: 'jeu'
    };
  }
  function sauver() { try { localStorage.setItem(CLE, JSON.stringify(E)); } catch (e) { /* stockage indisponible : le jeu continue */ } }
  function charger() { try { const s = localStorage.getItem(CLE); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  const encoder = o => 'TV1-' + btoa(unescape(encodeURIComponent(JSON.stringify(o))));
  function decoder(code) {
    try {
      const s = String(code).replace(/\s+/g, '').replace(/^TV1-/, '');
      const o = JSON.parse(decodeURIComponent(escape(atob(s))));
      return o && o.v === 1 && o.phase ? o : null;
    } catch (e) { return null; }
  }

  /* ---------- Jauges ---------- */
  function jauges(choix) {
    const j = { eq: JAUGE_DEPART, leg: JAUGE_DEPART, sec: JAUGE_DEPART, ent: JAUGE_DEPART };
    for (const k in choix) {
      const o = optionDe(k, choix[k]);
      if (o) for (const g in o.effets) j[g] += o.effets[g];
    }
    for (const g in j) j[g] = Math.max(0, Math.min(100, j[g]));
    return j;
  }
  const CHOIX_REELS = {};
  for (const k in DOSSIERS) CHOIX_REELS[k] = DOSSIERS[k].reel;
  const niveau = v => v < 30 ? 'bas' : v < 60 ? 'moyen' : 'haut';
  function barreJauge(k, v, petit) {
    return h('div', { class: 'jauge ' + niveau(v) + (petit ? ' petite' : ''), title: JAUGES[k].nom + ' : ' + JAUGES[k].aide },
      h('span', { class: 'j-ico', html: ICO[k] }), h('span', { class: 'j-nom' }, JAUGES[k].nom),
      h('span', { class: 'j-barre' }, h('i', { style: 'width:' + v + '%' })));
  }

  /* ---------- Carte ---------- */
  function proprioJeu() {
    const p = K.proprietaires('1815');
    for (const c of CELLULES) {
      if (!c.d) continue;
      const ch = E.choix[c.d];
      if (c.d === 'france' && !ch) { p[c.id] = TERRES_1814.france[c.g]; continue; }
      if (!ch) continue;
      const o = optionDe(c.d, ch);
      if (o && o.terres && o.terres[c.g]) p[c.id] = o.terres[c.g];
    }
    if (E.choix.allemagne === 'unifiee') for (const c of CELLULES) if (['GER', 'BAV', 'WUR', 'BAD', 'SAX', 'HAN'].includes(p[c.id])) p[c.id] = 'ALL';
    return p;
  }
  function indecis() {
    return Object.keys(DOSSIERS).filter(k => !E.choix[k] && (k !== 'france' || (E.phase === 'table' && E.seance >= 2)));
  }
  let modeCourant = null;
  function majCarte(opts) {
    opts = opts || {};
    const ph = E ? E.phase : 'intro';
    let mode = 'jeu';
    if (ph === 'intro' || (ph === 'europe' && E.etape === 'q')) mode = '1812';
    else if (ph === 'chronique' || ph === 'redaction') mode = '1815';
    else if (['bilan', 'alliances', 'tableau', 'fin'].includes(ph)) mode = E.vue === '1812' ? '1812' : E.vue === '1815' ? '1815' : 'jeu';
    modeCourant = mode;
    const etat = { mode, actif: opts.actif === undefined ? (E && E.ouvert) || null : opts.actif };
    if (mode === 'jeu') Object.assign(etat, { proprio: proprioJeu(), indecis: indecis(), allemagne: E.choix.allemagne && E.choix.allemagne !== 'unifiee' ? E.choix.allemagne : null });
    K.afficher(etat);
    majLegende();
    $('#bascule').hidden = !['bilan', 'alliances', 'tableau', 'fin'].includes(ph);
    document.querySelectorAll('#bascule button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.vue === E.vue)));
  }
  function majLegende() {
    const L = $('#legende'); L.replaceChildren();
    if (!modeCourant) return;
    L.append(h('p', { class: 'leg-titre' }, modeCourant === '1812' ? "L'Europe en 1812" : modeCourant === '1815' ? "L'Europe en 1815" : E.phase === 'bilan' || E.phase === 'alliances' || E.phase === 'tableau' || E.phase === 'fin' ? 'Ma paix' : 'Ma carte des négociations'));
    for (const it of K.legende(modeCourant)) L.append(h('div', { class: 'l' }, h('span', { class: 'pastille', style: 'background:' + it.couleur + ';box-shadow:inset 0 0 0 2px ' + it.bord }), it.texte));
    if (modeCourant === 'jeu' && indecis().some(k => k !== 'allemagne')) L.append(h('div', { class: 'l' }, h('span', { class: 'pastille hach' }), 'À négocier'));
    if (modeCourant === '1812') L.append(h('div', { class: 'l' }, h('span', { class: 'trait conf1812' }), 'Confédération du Rhin'));
    else if (modeCourant === '1815' || (E.choix.allemagne && E.choix.allemagne !== 'unifiee')) L.append(h('div', { class: 'l' }, h('span', { class: 'trait conf' }), E.choix.allemagne === 'empire' && modeCourant === 'jeu' ? 'Saint-Empire rétabli' : 'Confédération germanique'));
    if (E && E.phase === 'chronique') {
      L.append(h('div', { class: 'l' }, h('span', { class: 'm-def' }), "Défense de l'ordre"), h('div', { class: 'l' }, h('span', { class: 'm-cont' }), 'Contestation'));
    }
  }
  function boiteVilles(ids, min) {
    const pts = ids.map(i => VILLES_ID[i]).filter(Boolean).map(v => v.p);
    if (!pts.length) return 'centre';
    let x0 = Math.min(...pts.map(p => p[0])), x1 = Math.max(...pts.map(p => p[0]));
    let y0 = Math.min(...pts.map(p => p[1])), y1 = Math.max(...pts.map(p => p[1]));
    const m = min || 900;
    if (x1 - x0 < m) { const c = (x0 + x1) / 2; x0 = c - m / 2; x1 = c + m / 2; }
    if (y1 - y0 < m * .7) { const c = (y0 + y1) / 2; y0 = c - m * .35; y1 = c + m * .35; }
    return [x0, y0, x1, y1];
  }
  K.surClic = e => {
    if (!E) return;
    if (e.type === 'dossier') {
      if (E.phase === 'table' && SEANCES[E.seance].dossiers.includes(e.id)) ouvrirDossier(e.id);
      else if (E.phase === 'table') toast(DOSSIERS[e.id].titre + ' : ce dossier sera traité lors d\'une autre séance.');
      else toast(DOSSIERS[e.id].titre + ' : un territoire que le congrès doit attribuer.');
    } else if (e.nom) toast(e.nom);
  };

  /* ---------- Interface commune ---------- */
  const DATES = { intro: 'Septembre 1814', europe: '1812', salons: 'Octobre 1814', exigences: 'Octobre 1814', bilan: 'Juin 1815', alliances: 'Septembre-novembre 1815', tableau: '1815', redaction: '1815-1848', fin: '1815-1848' };
  function dateCourante() {
    if (E.phase === 'europe') return E.etape === 'q' ? '1812' : 'Septembre 1814';
    if (E.phase === 'table') return SEANCES[E.seance].date;
    if (E.phase === 'centjours') return EVENEMENTS.centjours.etapes[Math.min(E.cj, EVENEMENTS.centjours.etapes.length - 1)][0];
    if (E.phase === 'chronique') return CHRONIQUE[E.chroEtape].date;
    return DATES[E.phase] || '';
  }
  function majHUD() {
    $('#hud').hidden = false; $('#b-carnet').hidden = false;
    $('#hud-date').textContent = dateCourante();
    const j = jauges(E.choix), zone = $('#hud-jauges');
    zone.replaceChildren(...['eq', 'leg', 'sec', 'ent'].map(k => barreJauge(k, j[k])));
  }
  function progression() {
    const etapes = [['europe', '1812'], ['salons', 'Salons'], ['table', 'Négociations'], ['bilan', 'Bilan'], ['chronique', '1815-1848'], ['redaction', 'Conclusion']];
    const rang = { intro: 0, europe: 0, salons: 1, exigences: 1, table: 2, centjours: 2, bilan: 3, alliances: 3, tableau: 3, chronique: 4, redaction: 5, fin: 6 };
    const r = rang[E.phase];
    return h('ol', { class: 'progress', 'aria-label': 'Étapes du jeu' }, etapes.map(([k, t], i) =>
      h('li', { class: i < r ? 'fait' : i === r ? 'actuel' : '', 'aria-current': i === r ? 'step' : null }, t)));
  }
  const entete = (t) => h('p', { class: 'count' }, t);
  const bouton = (texte, onclick, opts) => h('button', { type: 'button', class: 'nbtn' + (opts && opts.second ? '' : ' primary'), disabled: !!(opts && opts.desactive), onclick }, texte);
  function panneau(blocs, actions, garder) {
    const p = $('#panneau'), corps = $('#panneau-corps'), nav = $('#panneau-nav'), y = p.scrollTop;
    corps.replaceChildren(...[progression()].concat(blocs).filter(Boolean));
    nav.replaceChildren(...(actions || []).filter(Boolean)); nav.hidden = !nav.children.length;
    p.scrollTop = garder ? y : 0;
    majHUD();
  }
  let minuteurToast = null;
  function toast(msg, duree) {
    const t = $('#toast'); t.textContent = typo(msg); t.hidden = false;
    clearTimeout(minuteurToast); minuteurToast = setTimeout(() => { t.hidden = true; }, duree || 4200);
  }
  function ouvrirModal(contenu, opts) {
    opts = opts || {};
    const v = $('#modal'), b = $('#modal-boite');
    b.replaceChildren(...contenu.filter(Boolean)); b.className = 'boite' + (opts.large ? ' large' : '');
    b.scrollTop = 0; v.dataset.bloquant = opts.bloquant ? '1' : ''; v.hidden = false;
    const f = b.querySelector('button:not(:disabled)'); if (f) f.focus({ preventScroll: true });
  }
  function fermerModal() { $('#modal').hidden = true; }
  $('#modal').addEventListener('click', e => { if (e.target.id === 'modal' && !$('#modal').dataset.bloquant) fermerModal(); });
  function question(Q, rep, surRep, etiquette) {
    const boutons = Q.choix.map((c, i) => {
      let cls = null;
      if (rep !== null && rep !== undefined) { if (i === Q.bonne) cls = 'bonne'; else if (i === rep) cls = 'fausse'; }
      return h('button', { type: 'button', class: cls, disabled: rep !== null && rep !== undefined, onclick: () => surRep(i) }, c);
    });
    const ok = rep === Q.bonne;
    return h('div', { class: 'question' }, h('p', { class: 'q-etiq' }, etiquette || 'Question'), h('p', { class: 'q' }, Q.q), h('div', { class: 'choix' }, boutons),
      rep !== null && rep !== undefined ? h('div', { class: 'explication ' + (ok ? 'ok' : 'ko') }, h('b', null, ok ? 'Bonne réponse !' : 'Pas tout à fait…'), Q.exp) : null);
  }

  /* ---------- 1. L'Europe de 1812 ---------- */
  function afficherEurope(garder) {
    majCarte();
    if (!garder) K.cadrer('centre');
    const blocs = [entete(E.etape === 'q' ? 'Avant le congrès' : 'Septembre 1814')];
    const actions = [];
    if (E.etape === 'q') {
      blocs.push(h('h2', null, EUROPE_1812.titre));
      EUROPE_1812.texte.forEach(t => blocs.push(h('p', null, t)));
      blocs.push(question(EUROPE_1812.question, E.q1812, i => { E.q1812 = i; sauver(); afficherEurope(true); }, 'Lis la carte'));
      actions.push(bouton('Septembre 1814 →', () => { E.etape = 'apres'; sauver(); afficherEurope(); }, { desactive: E.q1812 === null }));
    } else {
      blocs.push(h('h2', null, EUROPE_1812.apres.titre));
      EUROPE_1812.apres.texte.forEach(t => blocs.push(h('p', null, t)));
      blocs.push(h('p', { class: 'conseil' }, 'Survole ou touche une zone hachurée pour lire son nom.'));
      actions.push(bouton('← Revoir 1812', () => { E.etape = 'q'; sauver(); afficherEurope(); }, { second: true }));
      actions.push(bouton('Entrer dans les salons de Vienne →', () => { E.phase = 'salons'; sauver(); afficherSalons(); }));
    }
    panneau(blocs, actions, garder);
  }

  /* ---------- 2. Les salons ---------- */
  function carteNpc(p) {
    const met = !!E.rencontres[p.id], vus = (E.sujetsVus[p.id] || []).length;
    return h('button', { type: 'button', class: 'npc-btn' + (met ? ' met' : '') + (p.guide ? ' guide' : ''), onclick: () => ouvrirDialogue(p) },
      h('span', { class: 'npc-face', html: portrait(p.look) }),
      h('span', { class: 'npc-txt' }, h('b', null, p.nom), h('small', null, p.role)),
      h('span', { class: 'npc-done' }, met ? vus + ' / ' + p.sujets.length : 'Parler'));
  }
  function afficherSalons(garder) {
    majCarte({ actif: null });
    if (!garder) K.cadrer('centre');
    const tousVus = NEGOCIATEURS.every(p => E.rencontres[p.id]);
    const blocs = [entete('Octobre 1814 · Les salons de Vienne'), h('h2', null, 'Les salons de Vienne'),
      h('p', null, 'Avant les négociations, fais le tour des salons. Commence par Friedrich von Gentz, puis parle aux cinq grands négociateurs : note ce que chacun réclame.'),
      h('div', { class: 'npcs' }, PERSONNAGES.map(carteNpc))];
    if (!tousVus) blocs.push(h('p', { class: 'aide-dialogue' }, 'Encore à rencontrer : ' + liste(NEGOCIATEURS.filter(p => !E.rencontres[p.id]).map(p => p.nom)) + '.'));
    panneau(blocs, [bouton('Remplir mon tableau « Qui veut quoi ? » →', () => { fermerDialogue(); E.phase = 'exigences'; sauver(); ouvrirExigences(); }, { desactive: !tousVus })], garder);
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
    const el = $('#talk-texte'); texte = typo(texte);
    clearInterval(minuteurFrappe); minuteurFrappe = null; stopVoix();
    dialogue.texte = texte; $('#talk-lu').textContent = texte;
    if (REDUIT) { el.textContent = texte; return; }
    let i = 0; el.textContent = '';
    minuteurFrappe = setInterval(() => {
      i += 2; el.textContent = texte.slice(0, i);
      if (i >= texte.length) { clearInterval(minuteurFrappe); minuteurFrappe = null; }
    }, 16);
  }
  $('#talk-texte').addEventListener('click', () => { if (dialogue && minuteurFrappe) { clearInterval(minuteurFrappe); minuteurFrappe = null; $('#talk-texte').textContent = dialogue.texte; } });
  $('#talk-ecouter').addEventListener('click', () => { if (!dialogue) return; if (PEUT_PARLER && speechSynthesis.speaking) stopVoix(); else lire(dialogue.texte); });
  function ouvrirDialogue(p) {
    dialogue = { p, texte: '' };
    const premiere = !E.rencontres[p.id];
    if (premiere) { E.rencontres[p.id] = true; sauver(); }
    $('#talk-visage').innerHTML = portrait(p.look);
    $('#talk-nom').textContent = p.nom; $('#talk-role').textContent = p.role;
    $('#talk-ecouter').hidden = !PEUT_PARLER;
    $('#talk').hidden = false; $('#vue').classList.add('talking');
    taper(p.intro); choixDialogue(false);
    if (premiere) afficherSalons(true);
    if (window.innerWidth <= 900) $('#vue').scrollIntoView({ behavior: REDUIT ? 'auto' : 'smooth', block: 'start' });
  }
  function choixDialogue(fin) {
    const p = dialogue.p, vus = E.sujetsVus[p.id] || [], c = $('#talk-choix');
    c.replaceChildren();
    if (fin) c.append(h('button', { type: 'button', class: 'bye', onclick: fermerDialogue }, h('kbd', null, '1'), 'Fermer la conversation'));
    else {
      p.sujets.forEach(([q, r, zone], i) => c.append(h('button', { type: 'button', class: vus.includes(i) ? 'seen' : null, onclick: () => {
        if (!vus.includes(i)) { E.sujetsVus[p.id] = vus.concat(i); sauver(); afficherSalons(true); }
        if (zone) { K.cadrer(zone); K.surligner(zone); } else { K.surligner(null); }
        taper(r); choixDialogue(false);
      } }, h('kbd', null, String(i + 1)), q)));
      c.append(h('button', { type: 'button', class: 'bye', onclick: () => { taper(p.aurevoir); choixDialogue(true); } }, h('kbd', null, String(p.sujets.length + 1)), 'Au revoir'));
    }
    $('#talk-compte').textContent = 'Questions posées : ' + (E.sujetsVus[p.id] || []).length + ' / ' + p.sujets.length;
  }
  function fermerDialogue() {
    if (!dialogue) return;
    stopVoix(); clearInterval(minuteurFrappe); minuteurFrappe = null; dialogue = null;
    $('#talk').hidden = true; $('#vue').classList.remove('talking');
    K.surligner(null);
  }
  $('#talk-fermer').addEventListener('click', fermerDialogue);

  /* ---------- Activités de classement (qui veut quoi ? / tableau de la fiche) ---------- */
  let choisi = null;
  function activite(cfg) {
    // cfg : { titre, consigne, elements [{id, texte}], cases [{id, titre, sous, visage}], place (obj), verif, essais, bonne(e) -> caseId, suite, libelleSuite, surVerif, surCorrige, grille }
    const cont = $('#activite-contenu'); cont.replaceChildren();
    const P = cfg.place;
    const libres = cfg.elements.filter(e => !P[e.id]);
    const etiquette = el => {
      const v = cfg.verif ? cfg.verif[el.id] : null;
      return h('button', { type: 'button', class: 'etiquette' + (choisi === el.id ? ' choisie' : '') + (v === true ? ' ok' : v === false ? ' ko' : ''), 'aria-pressed': String(choisi === el.id), onclick: ev => {
        ev.stopPropagation();
        if (choisi && choisi !== el.id && P[el.id]) { deposer(P[el.id]); return; }
        choisi = choisi === el.id ? null : el.id; activite(cfg);
      } }, el.texte);
    };
    const deposer = caseId => {
      if (!choisi) return;
      if (caseId) P[choisi] = caseId; else delete P[choisi];
      choisi = null; cfg.reinit(); sauver(); activite(cfg);
    };
    cont.append(h('div', { class: 'schema-tete' }, h('p', { class: 'niveau' }, JEU.niveau), h('h1', null, cfg.titre), h('p', null, cfg.consigne)));
    cont.append(h('div', { class: 'reserve' + (choisi && P[choisi] ? ' cible' : ''), onclick: () => { if (choisi && P[choisi]) deposer(null); } }, libres.map(etiquette)));
    const grille = h('div', { class: 'cases ' + (cfg.grille || '') });
    for (const c of cfg.cases) {
      const dedans = cfg.elements.filter(e => P[e.id] === c.id);
      grille.append(h('div', { class: 'case' + (choisi ? ' cible' : ''), role: 'button', tabindex: '0', 'aria-label': 'Déposer dans : ' + c.titre, onclick: () => deposer(c.id), onkeydown: ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); deposer(c.id); } } },
        h('div', { class: 'c-tete' }, c.visage ? h('span', { class: 'c-visage', html: c.visage }) : null, h('div', null, h('div', { class: 'c-titre' }, c.titre), c.sous ? h('div', { class: 'c-sous' }, c.sous) : null)),
        h('div', { class: 'c-liste' }, dedans.map(etiquette))));
    }
    cont.append(grille);
    const actions = h('div', { class: 'actions' });
    const tousPlaces = !libres.length;
    const toutJuste = cfg.verif && cfg.elements.every(e => cfg.verif[e.id]);
    if (!toutJuste) actions.append(h('button', { class: 'btn', type: 'button', disabled: !tousPlaces, onclick: () => { cfg.surVerif(); activite(cfg); } }, tousPlaces ? 'Vérifier' : 'Place toutes les étiquettes (' + libres.length + ' restantes)'));
    if (cfg.verif) {
      const n = cfg.elements.filter(e => cfg.verif[e.id]).length;
      actions.append(h('span', { class: 'score' }, n + ' / ' + cfg.elements.length + ' bien placées' + (toutJuste ? ' : bravo !' : ' : déplace les étiquettes en rouge.')));
    }
    if (!toutJuste && cfg.essais >= 2) actions.append(h('button', { class: 'btn second', type: 'button', onclick: () => { cfg.surCorrige(); activite(cfg); } }, 'Voir la correction'));
    if (toutJuste) actions.append(h('button', { class: 'btn or', type: 'button', onclick: cfg.suite }, cfg.libelleSuite));
    if (cfg.retour) actions.append(h('button', { class: 'btn second', type: 'button', onclick: cfg.retour }, cfg.libelleRetour));
    cont.append(actions);
  }
  function cfgExigences() {
    return {
      titre: 'Qui veut quoi ?', consigne: "Clique sur une exigence, puis sur le négociateur qui la défend. Pour déplacer une étiquette, clique dessus puis sur une autre case.",
      elements: EXIGENCES, cases: NEGOCIATEURS.map(p => ({ id: p.id, titre: p.nom, sous: p.role, visage: portrait(p.look) })), grille: 'cinq',
      place: E.exig, verif: E.exigVerif, essais: E.exigEssais,
      reinit: () => { E.exigVerif = null; },
      surVerif: () => {
        E.exigVerif = {}; E.exigEssais++;
        for (const x of EXIGENCES) E.exigVerif[x.id] = E.exig[x.id] === x.perso;
        const n = EXIGENCES.filter(x => E.exigVerif[x.id]).length;
        if (E.exigScore === null && (n === EXIGENCES.length || E.exigEssais === 1)) E.exigScore = n;
        sauver();
      },
      surCorrige: () => {
        if (E.exigScore === null) E.exigScore = EXIGENCES.filter(x => E.exigVerif && E.exigVerif[x.id]).length;
        for (const x of EXIGENCES) E.exig[x.id] = x.perso;
        E.exigCorrige = true; E.exigVerif = {}; for (const x of EXIGENCES) E.exigVerif[x.id] = true; sauver();
      },
      suite: () => { $('#ecran-activite').hidden = true; E.phase = 'table'; E.seance = 0; E.ouvert = null; sauver(); afficherTable(); },
      libelleSuite: 'Passer à la table des négociations →',
      retour: () => { $('#ecran-activite').hidden = true; E.phase = 'salons'; sauver(); afficherSalons(); },
      libelleRetour: '← Retourner dans les salons'
    };
  }
  function ouvrirExigences() {
    choisi = null; $('#ecran-activite').hidden = false; $('#ecran-activite').scrollTop = 0;
    const cfg = cfgExigences(); cfg.place = E.exig; activite(new Proxy(cfg, { get: (t, k) => k === 'verif' ? E.exigVerif : k === 'essais' ? E.exigEssais : t[k] }));
  }
  function cfgTableau() {
    return {
      titre: TABLEAU.titre, consigne: TABLEAU.consigne,
      elements: TABLEAU.etiquettes, cases: TABLEAU.lignes.map(l => ({ id: l.id, titre: l.titre, sous: 'Indices : ' + l.indices })), grille: 'lignes',
      place: E.tab,
      reinit: () => { E.tabVerif = null; },
      surVerif: () => {
        E.tabVerif = {}; E.tabEssais++;
        for (const x of TABLEAU.etiquettes) E.tabVerif[x.id] = E.tab[x.id] === x.ligne;
        const n = TABLEAU.etiquettes.filter(x => E.tabVerif[x.id]).length;
        if (E.tabScore === null && (n === TABLEAU.etiquettes.length || E.tabEssais === 1)) E.tabScore = n;
        sauver();
      },
      surCorrige: () => {
        if (E.tabScore === null) E.tabScore = TABLEAU.etiquettes.filter(x => E.tabVerif && E.tabVerif[x.id]).length;
        for (const x of TABLEAU.etiquettes) E.tab[x.id] = x.ligne;
        E.tabCorrige = true; E.tabVerif = {}; for (const x of TABLEAU.etiquettes) E.tabVerif[x.id] = true; sauver();
      },
      suite: () => { $('#ecran-activite').hidden = true; E.phase = 'chronique'; E.chroEtape = 0; sauver(); afficherChronique(); },
      libelleSuite: "Continuer : l'ordre de 1815 à l'épreuve →",
      retour: () => { $('#ecran-activite').hidden = true; E.phase = 'alliances'; sauver(); afficherAlliances(); },
      libelleRetour: '← Revoir les deux alliances'
    };
  }
  function ouvrirTableau() {
    choisi = null; $('#ecran-activite').hidden = false; $('#ecran-activite').scrollTop = 0;
    const cfg = cfgTableau(); activite(new Proxy(cfg, { get: (t, k) => k === 'verif' ? E.tabVerif : k === 'essais' ? E.tabEssais : t[k] }));
  }

  /* ---------- 3. La table des négociations ---------- */
  function resumeChoix(k) {
    const ch = E.choix[k];
    if (!ch) return null;
    return optionDe(k, ch).texte;
  }
  function afficherTable(garder) {
    if (E.ouvert) return afficherDossier(E.ouvert, garder);
    const S = SEANCES[E.seance];
    majCarte({ actif: null });
    if (!garder) K.cadrer(E.seance === 2 ? 'france' : 'centre');
    const cartes = S.dossiers.map(k => {
      const d = DOSSIERS[k], r = resumeChoix(k);
      return h('button', { type: 'button', class: 'dossier' + (r ? ' fait' : ''), onclick: () => ouvrirDossier(k) },
        h('span', { class: 'd-titre' }, d.titre), h('span', { class: 'd-etat' }, r ? 'Proposition : ' + r : 'À décider · ' + d.ames));
    });
    const reste = S.dossiers.filter(k => !E.choix[k]);
    const blocs = [entete(S.titre + ' · ' + S.date), h('h2', null, 'La table des négociations'), h('p', null, S.texte), h('div', { class: 'dossiers' }, cartes)];
    if (reste.length) blocs.push(h('p', { class: 'aide-dialogue' }, 'Clique sur un dossier, ou directement sur une zone hachurée de la carte.'));
    else blocs.push(h('p', { class: 'conseil' }, 'Tous les dossiers de la séance ont une proposition. Tu peux encore en changer avant de clore la séance.'));
    panneau(blocs, [bouton(E.seance === 2 ? 'Signer le traité →' : 'Clore la séance →', clore, { desactive: reste.length > 0 })], garder);
  }
  function ouvrirDossier(k) {
    fermerDialogue();
    E.ouvert = k; sauver();
    afficherDossier(k);
  }
  function avis(qui, texte) {
    const p = persoDe(qui);
    return h('li', { class: 'avis' }, h('span', { class: 'a-visage', html: visage(qui) }),
      h('span', null, h('b', null, p ? p.nom : 'La voix des peuples'), ' ', h('span', { class: 'a-texte' }, texte)));
  }
  let derniersEffets = null;
  function afficherDossier(k, garder) {
    const d = DOSSIERS[k];
    majCarte({ actif: k === 'allemagne' ? 'allemagne' : k });
    if (!garder) K.cadrer(k);
    const ch = E.choix[k];
    const blocs = [h('button', { type: 'button', class: 'lien-retour', onclick: () => { E.ouvert = null; derniersEffets = null; sauver(); afficherTable(); } }, '← Tous les dossiers de la séance'),
      entete(SEANCES[E.seance].titre + ' · Dossier'), h('h2', null, d.titre), h('p', null, d.situation),
      h('p', { class: 'ames' }, h('span', { class: 'ames-chiffre' }, d.ames), ' selon la commission de statistique du congrès'),
      h('h3', null, "Ce qu'ils en disent"), h('ul', { class: 'avis-liste' }, d.avis.map(([q, t]) => avis(q, t))),
      h('h3', null, 'Ta proposition')];
    const opts = h('div', { class: 'options', role: 'radiogroup', 'aria-label': 'Propositions' }, d.options.map(o => h('button', {
      type: 'button', role: 'radio', 'aria-checked': String(ch === o.id), class: 'option' + (ch === o.id ? ' choisie' : ''),
      onclick: () => choisir(k, o.id)
    }, h('span', { class: 'o-rond', 'aria-hidden': 'true' }), h('span', null, o.texte))));
    blocs.push(opts);
    if (ch) {
      const o = optionDe(k, ch);
      const eff = derniersEffets && derniersEffets.k === k ? derniersEffets.eff : o.effets;
      blocs.push(h('div', { class: 'reaction' }, h('p', null, o.reaction),
        h('div', { class: 'deltas' }, ['eq', 'leg', 'sec', 'ent'].filter(g => eff[g]).map(g => h('span', { class: 'delta ' + (eff[g] > 0 ? 'plus' : 'moins') }, h('span', { html: ICO[g] }), JAUGES[g].nom + ' ' + (eff[g] > 0 ? '+' : '') + eff[g])))));
    }
    panneau(blocs, [bouton('Valider et revenir à la séance', () => { E.ouvert = null; derniersEffets = null; sauver(); afficherTable(); }, { desactive: !ch })], garder);
  }
  function choisir(k, id) {
    E.choix[k] = id; E.choixEleve[k] = id; delete E.forces[k];
    derniersEffets = { k, eff: optionDe(k, id).effets };
    sauver(); afficherDossier(k, true);
    const r = document.querySelector('#panneau .reaction');
    if (r) r.scrollIntoView({ behavior: REDUIT ? 'auto' : 'smooth', block: 'nearest' });
  }
  function clore() {
    fermerDialogue();
    if (E.seance === 0) evenementCrise();
    else if (E.seance === 1) { E.phase = 'centjours'; E.cj = 0; sauver(); afficherCentJours(); }
    else { E.phase = 'bilan'; E.vue = 'jeu'; sauver(); afficherBilan(); }
  }

  /* ---------- Événement : la crise de janvier 1815 ---------- */
  function evenementCrise() {
    const ev = EVENEMENTS.crise;
    const rupture = jauges(E.choix).ent < SEUIL_CRISE;
    E.crise = rupture ? 'rupture' : 'calme';
    if (rupture) {
      for (const k of ['pologne', 'saxe']) if (E.choix[k] !== DOSSIERS[k].reel) { E.choix[k] = DOSSIERS[k].reel; E.forces[k] = true; }
    }
    E.seance = 1; E.ouvert = null; sauver();
    afficherTable();
    ouvrirModal([
      h('p', { class: 'ev-entete' }, ev.date),
      h('h2', null, ev.titre),
      h('p', null, rupture ? ev.texteRupture : ev.texteCalme),
      h('div', { class: 'resultat' }, rupture ? ev.suiteRupture : ev.suiteCalme),
      h('div', { class: 'a-retenir' }, h('b', null, 'À retenir'), ev.aRetenir),
      h('div', { class: 'actions' }, h('button', { class: 'btn or', type: 'button', onclick: () => { fermerModal(); afficherTable(); } }, 'Deuxième séance →'))
    ], { bloquant: true });
  }

  /* ---------- Événement : les Cent-Jours ---------- */
  function afficherCentJours(garder) {
    const ev = EVENEMENTS.centjours, n = ev.etapes.length, i = Math.min(E.cj, n - 1);
    const [date, texte, ville] = ev.etapes[i];
    if (i >= 2 && E.choix.naples === 'murat') { E.choix.naples = 'bourbons'; E.forces.naples = true; sauver(); }
    majCarte({ actif: null });
    K.villesEvenement(ev.etapes.slice(0, i + 1).map(x => x[2]));
    K.marqueurs(ev.etapes.slice(0, i + 1).map((x, j) => ({ ville: x[2], type: 'neutre', texte: '', actif: j === i })));
    if (!garder) K.cadrer(boiteVilles([ville, 'paris', 'vienne'], 1400));
    const blocs = [entete(ev.titre + ' · ' + ev.date), h('p', { class: 'date-geante' }, date), h('p', null, texte)];
    if (i === 2 && E.forces.naples && E.choixEleve.naples === 'murat') blocs.push(h('div', { class: 'resultat' }, ev.murat));
    if (i === n - 1) blocs.push(h('div', { class: 'a-retenir' }, h('b', null, 'À retenir'), ev.aRetenir));
    blocs.push(h('div', { class: 'pastilles' }, ev.etapes.map((x, j) => h('span', { class: 'pdot' + (j < i ? ' done' : ''), 'aria-current': j === i ? 'step' : null, title: x[0] }))));
    const actions = [];
    if (i > 0) actions.push(bouton('← Précédent', () => { E.cj--; sauver(); afficherCentJours(); }, { second: true }));
    actions.push(i < n - 1 ? bouton('Suivant →', () => { E.cj++; sauver(); afficherCentJours(); })
      : bouton('À Paris : la troisième séance →', () => { K.marqueurs([]); K.villesEvenement([]); E.phase = 'table'; E.seance = 2; E.ouvert = null; sauver(); afficherTable(); }));
    panneau(blocs, actions, garder);
  }

  /* ---------- 4. Le bilan ---------- */
  function afficherBilan(garder) {
    majCarte({ actif: null });
    if (!garder) K.cadrer('centre');
    const moi = jauges(E.choix), reel = jauges(CHOIX_REELS);
    const lignes = ORDRE_DOSSIERS.map(k => {
      const d = DOSSIERS[k], mien = E.choixEleve[k] || E.choix[k], same = mien === d.reel;
      return h('details', { class: 'ligne-bilan' + (same ? ' pareil' : '') },
        h('summary', null, h('span', { class: 'lb-titre' }, d.titre), h('span', { class: 'lb-marque' }, same ? '= comme en 1815' : '≠ différent')),
        h('div', { class: 'lb-corps' },
          h('p', null, h('b', null, 'Ta proposition : '), optionDe(k, mien).texte + (E.forces[k] ? ' (annulée par les événements)' : '')),
          h('p', null, h('b', null, 'Vienne, 1815 : '), d.texteReel)));
    });
    const peuple = ORDRE_DOSSIERS.filter(k => { const o = optionDe(k, E.choixEleve[k] || E.choix[k]); return o && o.peuple; });
    const blocs = [entete('Juin 1815 · Le bilan'), h('h2', null, BILAN.titre),
      h('p', null, 'Compare ta carte à celle de 1815 avec les boutons en haut de la carte. Ouvre chaque dossier pour lire ce qui a vraiment été décidé.'),
      h('div', { class: 'bilan-lignes' }, lignes),
      h('h3', null, 'Tes jauges et celles de Vienne'),
      h('div', { class: 'comparaison' }, ['eq', 'leg', 'sec', 'ent'].map(g => h('div', { class: 'cmp' },
        h('span', { class: 'cmp-nom', html: ICO[g] + '<span>' + JAUGES[g].nom + '</span>' }),
        h('span', { class: 'cmp-barres' },
          h('span', { class: 'cmp-l' }, h('small', null, 'Toi'), h('span', { class: 'j-barre ' + niveau(moi[g]) }, h('i', { style: 'width:' + moi[g] + '%' }))),
          h('span', { class: 'cmp-l' }, h('small', null, 'Vienne'), h('span', { class: 'j-barre ' + niveau(reel[g]) }, h('i', { style: 'width:' + reel[g] + '%' }))))))),
      h('div', { class: 'a-retenir peuples' }, h('b', null, 'Et les peuples ?'), BILAN.peuples,
        peuple.length ? h('span', { class: 'peuple-toi' }, ' Toi, tu en as tenu compte pour ' + liste(peuple.map(k => DOSSIERS[k].court)) + '.') : null),
      question(BILAN.question, E.bilanRep, i => { E.bilanRep = i; sauver(); afficherBilan(true); }, 'Conclus')];
    panneau(blocs, [bouton('Continuer : après le congrès →', () => { E.phase = 'alliances'; sauver(); afficherAlliances(); }, { desactive: E.bilanRep === null })], garder);
  }

  /* ---------- 5. Les deux alliances ---------- */
  function afficherAlliances(garder) {
    majCarte({ actif: null });
    const A = ALLIANCES;
    const docs = A.docs.map(d => h('figure', { class: 'doc' }, h('p', { class: 'doc-etiq' }, d.titre + ' · ' + d.date), h('blockquote', null, d.extrait),
      h('figcaption', null, d.source + '. Signataires : ' + d.signataires + '.')));
    const affs = A.affirmations.map(a => {
      const r = E.alliances[a.id], ok = r && a.rep.includes(r);
      return h('div', { class: 'aff' + (r ? (ok ? ' ok' : ' ko') : '') }, h('p', null, a.texte),
        h('div', { class: 'aff-choix' }, [['sainte', 'Sainte-Alliance'], ['quadruple', 'Quadruple-Alliance'], ['deux', 'Les deux']].map(([k, t]) =>
          h('button', { type: 'button', class: r === k ? (ok ? 'bonne' : 'fausse') : r && a.rep.includes(k) ? 'attendue' : null, disabled: !!r, onclick: () => { E.alliances[a.id] = k; sauver(); afficherAlliances(true); } }, t))));
    });
    const fini = A.affirmations.every(a => E.alliances[a.id]);
    const blocs = [entete('Septembre-novembre 1815'), h('h2', null, A.titre), h('div', { class: 'docs' }, docs), h('h3', null, 'À quelle alliance correspond chaque phrase ?'), h('div', { class: 'affs' }, affs)];
    if (fini) blocs.push(h('div', { class: 'a-retenir' }, h('b', null, 'À retenir'), A.aRetenir));
    panneau(blocs, [bouton('← Bilan', () => { E.phase = 'bilan'; sauver(); afficherBilan(); }, { second: true }),
      bouton('Compléter le tableau de ma fiche →', () => { E.phase = 'tableau'; sauver(); ouvrirTableau(); }, { desactive: !fini })], garder);
  }

  /* ---------- 6. La chronique 1815-1848 ---------- */
  const juste = (i) => E.chro[i] && CHRONIQUE[i].rep.includes(E.chro[i]);
  function afficherChronique(garder) {
    const i = E.chroEtape, c = CHRONIQUE[i], rep = E.chro[i];
    majCarte({ actif: null });
    const vus = CHRONIQUE.slice(0, i + 1);
    const villes = [...new Set(vus.flatMap(x => x.villes))];
    K.villesEvenement(villes);
    // un seul marqueur par ville : il prend la couleur du dernier événement et regroupe les dates
    const parVille = {};
    vus.forEach((x, j) => {
      const montrer = j < i || rep;
      const type = !montrer ? 'neutre' : x.rep.includes('defense') ? 'defense' : 'contestation';
      x.villes.forEach((v, n) => {
        const m = parVille[v] || (parVille[v] = { ville: v, dates: [], type, actif: false });
        m.type = type;
        if (j === i) m.actif = true;
        if (n === 0 && !m.dates.includes(x.date)) m.dates.push(x.date);
      });
    });
    K.marqueurs(Object.values(parVille).map(m => ({ ville: m.ville, type: m.type, actif: m.actif, texte: m.dates.join(' · ') })));
    if (!garder) K.cadrer(boiteVilles(c.villes, 1500));
    const q = h('div', { class: 'question' }, h('p', { class: 'q-etiq' }, 'Classe cet événement'), h('div', { class: 'choix' }, CHOIX_CHRONIQUE.map(([k, t]) => {
      let cls = null;
      if (rep) { if (c.rep.includes(k)) cls = 'bonne'; else if (k === rep) cls = 'fausse'; }
      return h('button', { type: 'button', class: cls, disabled: !!rep, onclick: () => { E.chro[i] = k; sauver(); afficherChronique(true); } }, t);
    })));
    if (rep) q.append(h('div', { class: 'explication ' + (juste(i) ? 'ok' : 'ko') }, h('b', null, juste(i) ? 'Oui.' : 'Pas vraiment.'), c.exp));
    const blocs = [entete("L'ordre de 1815 à l'épreuve · " + (i + 1) + ' / ' + CHRONIQUE.length), h('p', { class: 'date-geante' }, c.date), h('h2', null, c.titre),
      c.ppo ? h('p', { class: 'ppo' }, 'Point de passage : ' + c.ppo) : null, h('p', null, c.texte), q];
    const dernier = i === CHRONIQUE.length - 1;
    const actions = [];
    if (i > 0) actions.push(bouton('← Précédent', () => { E.chroEtape--; sauver(); afficherChronique(); }, { second: true }));
    actions.push(bouton(dernier ? 'Construire mon plan →' : 'Suivant →', () => {
      if (!dernier) { E.chroEtape++; sauver(); afficherChronique(); } else { E.phase = 'redaction'; sauver(); ouvrirRedaction(); }
    }, { desactive: !rep }));
    panneau(blocs, actions, garder);
  }

  /* ---------- 7. Plan et réponse finale ---------- */
  function planDonnees() {
    const org = ['Congrès de Vienne (septembre 1814 - juin 1815) : Metternich (Autriche), Castlereagh (Royaume-Uni), Alexandre Ier (Russie), Hardenberg (Prusse), Talleyrand (France).',
      'Principes : équilibre entre les puissances, légitimité des dynasties.',
      'Décisions : royaume de Pologne au tsar, Prusse sur le Rhin, Belgique unie aux Pays-Bas, Autriche en Italie du Nord, Confédération germanique.',
      'Acte final : 9 juin 1815. Second traité de Paris : 20 novembre 1815.'];
    const def = ['Sainte-Alliance (26 septembre 1815) : Autriche, Prusse, Russie.', 'Quadruple-Alliance (20 novembre 1815) et système des congrès.'];
    const cont = [];
    CHRONIQUE.forEach((c, i) => {
      const t = c.date + ' : ' + c.titre.charAt(0).toLowerCase() + c.titre.slice(1) + (E.chro[i] && !juste(i) ? ' (corrigé)' : '');
      if (c.rep.includes('defense')) def.push(t);
      else cont.push((c.rep.length > 1 ? 'Libérale et nationale' : c.rep[0] === 'liberale' ? 'Libérale' : 'Nationale') + ' · ' + t);
    });
    return [org, def, cont];
  }
  function blocPlan() {
    const P = planDonnees();
    return h('div', { class: 'plan' }, REDACTION.plan.map((p, i) => h('div', { class: 'plan-col' }, h('p', { class: 'plan-num' }, ['I', 'II', 'III'][i]), h('b', null, p.titre), h('small', null, p.sous),
      h('ul', null, P[i].map(t => h('li', null, t))))));
  }
  function ouvrirRedaction() {
    fermerDialogue();
    const cont = $('#activite-contenu'); cont.replaceChildren();
    const zone = h('textarea', { id: 'redaction', rows: '9', placeholder: "L'ordre voulu par Metternich…" });
    zone.value = E.redaction || '';
    const compteur = h('span', { class: 'score' });
    const fini = h('button', { class: 'btn or', type: 'button', onclick: () => { E.redaction = zone.value.trim(); E.phase = 'fin'; E.vue = 'jeu'; sauver(); ouvrirFin(); } }, 'Terminer : voir mon carnet →');
    const maj = () => { const n = zone.value.trim().split(/\s+/).filter(Boolean).length; compteur.textContent = n + ' mot' + (n > 1 ? 's' : '') + (n < JEU.motsMin ? ' (' + JEU.motsMin + ' au moins)' : ''); fini.disabled = n < JEU.motsMin; E.redaction = zone.value; sauver(); };
    zone.addEventListener('input', maj);
    cont.append(h('div', { class: 'carte-intro' },
      h('p', { class: 'niveau' }, JEU.niveau),
      h('h1', { class: 'titre-page' }, 'Ton plan, ta conclusion'),
      h('div', { class: 'qdepart' }, h('small', null, 'Question problématisée (à la maison)'), h('b', null, JEU.questionFinale)),
      h('p', { class: 'sous-texte' }, 'Voici ton plan en trois axes, construit pendant le jeu. Il te servira pour rédiger ta réponse complète, avec une introduction et une conclusion.'),
      blocPlan(),
      h('p', { class: 'sous-texte' }, REDACTION.consigne),
      h('div', { class: 'mots' }, h('span', null, 'Mots utiles :'), REDACTION.aide.map(m => h('span', { class: 'etiquette mini' }, m))),
      h('label', { for: 'redaction', class: 'sr' }, 'Ma conclusion'), zone,
      h('div', { class: 'actions' }, fini, compteur, boutonPlan(),
        h('button', { class: 'btn second', type: 'button', onclick: () => { $('#ecran-activite').hidden = true; E.phase = 'chronique'; E.chroEtape = CHRONIQUE.length - 1; sauver(); afficherChronique(); } }, '← Revoir la chronique'))));
    $('#ecran-activite').hidden = false; $('#ecran-activite').scrollTop = 0;
    maj();
  }

  /* ---------- Note automatique ---------- */
  const arr = x => Math.round(x * 4) / 4; // au quart de point
  function noteAuto() {
    const lignes = [];
    const exig = E.exigScore !== null ? arr(E.exigScore / EXIGENCES.length * BAREME.exigences) : 0;
    lignes.push(['Qui veut quoi ? (1er essai : ' + (E.exigScore ?? 0) + ' / ' + EXIGENCES.length + ')', exig, BAREME.exigences]);
    const tab = E.tabScore !== null ? arr(E.tabScore / TABLEAU.etiquettes.length * BAREME.tableau) : 0;
    lignes.push(['Tableau de la fiche (1er essai : ' + (E.tabScore ?? 0) + ' / ' + TABLEAU.etiquettes.length + ')', tab, BAREME.tableau]);
    const nA = ALLIANCES.affirmations.length + 1;
    const jA = ALLIANCES.affirmations.filter(a => E.alliances[a.id] && a.rep.includes(E.alliances[a.id])).length + (E.bilanRep === BILAN.question.bonne ? 1 : 0);
    lignes.push(['Alliances et bilan (' + jA + ' / ' + nA + ')', arr(jA / nA * BAREME.alliances), BAREME.alliances]);
    const jC = CHRONIQUE.filter((x, i) => juste(i)).length;
    lignes.push(['Chronique 1815-1848 (' + jC + ' / ' + CHRONIQUE.length + ')', arr(jC / CHRONIQUE.length * BAREME.chronique), BAREME.chronique]);
    const total = lignes.reduce((s, l) => s + l[1], 0);
    const sur = BAREME.exigences + BAREME.tableau + BAREME.alliances + BAREME.chronique;
    return { lignes, total: arr(total), sur };
  }
  const fmt = n => String(n).replace('.', ',');
  function partiesIci() { try { return parseInt(localStorage.getItem(CLE + '-parties') || '0', 10) || 0; } catch (e) { return 0; } }
  function compterPartie() { try { localStorage.setItem(CLE + '-parties', String(partiesIci() + 1)); } catch (e) { /* rien */ } }
  function blocNote() {
    const n = noteAuto();
    return h('div', { class: 'note-auto' },
      h('p', { class: 'note-titre' }, 'Note automatique : ', h('b', null, fmt(n.total) + ' / ' + n.sur), ' · rédaction : … / ' + BAREME.redaction + ' (corrigée par le professeur)'),
      h('table', { class: 'reponses' }, h('tbody', null, n.lignes.map(l => h('tr', null, h('td', null, l[0]), h('td', null, fmt(l[1]) + ' / ' + l[2]))))),
      h('p', { class: 'note-controle' }, 'Partie commencée le ' + new Date(E.debut).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) + (E.partieN ? ' · partie n° ' + E.partieN + ' sur cet ordinateur' : '') + (E.repris ? ' · reprise par code' : '')));
  }

  /* ---------- Le carnet du secrétaire ---------- */
  const section = t => h('h2', null, t);
  function construireCarnet(final) {
    const auj = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const c = h('div', { class: 'carnet' },
      h('p', { class: 'niveau' }, JEU.niveau), h('h1', null, 'Carnet du secrétaire'),
      h('div', { class: 'ident' }, (E.noms || 'Sans nom') + (E.classe ? ' · ' + E.classe : '') + ' · ' + auj),
      final ? blocNote() : null,
      h('div', { class: 'qdepart' }, h('small', null, 'Question de départ'), h('b', null, JEU.questionDepart)));
    // 1. Qui veut quoi ?
    c.append(section('1. Qui veut quoi ?' + (E.exigScore !== null ? ' (' + E.exigScore + ' / ' + EXIGENCES.length + ' au premier essai' + (E.exigCorrige ? ', puis correction' : '') + ')' : '')));
    if (Object.keys(E.exig).length) c.append(h('div', { class: 'tableau' }, h('table', { class: 'reponses' }, h('tbody', null, NEGOCIATEURS.map(p => h('tr', null,
      h('th', { scope: 'row' }, p.nom), h('td', null, EXIGENCES.filter(x => E.exig[x.id] === p.id).map(x => x.texte).join(' · ') || '—')))))));
    else c.append(h('p', null, 'Pas encore rempli.'));
    // 2. Ma paix
    const decides = ORDRE_DOSSIERS.filter(k => E.choix[k]);
    c.append(section('2. Ma paix et la paix de Vienne'));
    if (final || decides.length === ORDRE_DOSSIERS.length) {
      c.append(h('div', { class: 'deux-cartes' },
        h('figure', null, h('div', { html: K.svgStatique(proprioJeu(), 'jeu', null, 'Ma carte') }), h('figcaption', null, 'Ma paix')),
        h('figure', null, h('div', { html: K.svgStatique(K.proprietaires('1815'), '1815', null, "L'Europe en 1815") }), h('figcaption', null, 'La paix de Vienne (1815)'))));
    }
    if (decides.length) c.append(h('div', { class: 'tableau' }, h('table', { class: 'reponses' },
      h('thead', null, h('tr', null, h('th', null, 'Dossier'), h('th', null, 'Ma proposition'), h('th', null, 'Décision de 1815'))),
      h('tbody', null, decides.map(k => {
        const mien = E.choixEleve[k] || E.choix[k], same = mien === DOSSIERS[k].reel;
        return h('tr', null, h('td', null, DOSSIERS[k].titre), h('td', null, optionDe(k, mien).texte + (E.forces[k] ? ' (annulée par les événements)' : '')),
          h('td', { class: same ? 'v' : '' }, same ? '= pareil' : optionDe(k, DOSSIERS[k].reel).texte));
      })))));
    else c.append(h('p', null, 'Aucun dossier décidé pour le moment.'));
    if (decides.length) {
      const moi = jauges(E.choix), reel = jauges(CHOIX_REELS);
      c.append(h('p', { class: 'jauges-carnet' }, ['eq', 'leg', 'sec', 'ent'].map(g => JAUGES[g].nom + ' : ' + moi[g] + ' (Vienne : ' + reel[g] + ')').join(' · ')));
    }
    if (E.crise) c.append(h('p', null, 'Crise de janvier 1815 : ' + (E.crise === 'rupture' ? 'mes propositions ont failli provoquer une guerre ; le compromis de février 1815 a été imposé.' : 'l\'entente entre les Alliés a tenu.')));
    // 3. Alliances
    if (Object.keys(E.alliances).length) {
      c.append(section('3. Deux alliances'));
      const nom = { sainte: 'Sainte-Alliance', quadruple: 'Quadruple-Alliance', deux: 'Les deux' };
      c.append(h('div', { class: 'tableau' }, h('table', { class: 'reponses' }, h('tbody', null, ALLIANCES.affirmations.map(a => {
        const r = E.alliances[a.id]; if (!r) return null;
        const ok = a.rep.includes(r);
        return h('tr', null, h('td', null, a.texte), h('td', { class: ok ? 'v' : 'x' }, (ok ? '✓ ' : '✗ ') + nom[r] + (ok ? '' : ' (attendu : ' + nom[a.rep[0]] + ')')));
      })))));
    }
    // 4. Tableau de la fiche
    if (Object.keys(E.tab).length) {
      c.append(section('4. Ce que décide le congrès de Vienne' + (E.tabScore !== null ? ' (' + E.tabScore + ' / ' + TABLEAU.etiquettes.length + ' au premier essai' + (E.tabCorrige ? ', puis correction' : '') + ')' : '')));
      c.append(h('div', { class: 'tableau' }, h('table', { class: 'reponses' }, h('tbody', null, TABLEAU.lignes.map(l => h('tr', null, h('th', { scope: 'row' }, l.titre),
        h('td', null, TABLEAU.etiquettes.filter(x => E.tab[x.id] === l.id).map(x => x.texte).join(' ') || '—')))))));
    }
    // 5. Chronique
    if (Object.keys(E.chro).length) {
      const n = CHRONIQUE.filter((x, i) => juste(i)).length;
      c.append(section("5. L'ordre de 1815 à l'épreuve (" + n + ' / ' + CHRONIQUE.length + ')'));
      const nom = Object.fromEntries(CHOIX_CHRONIQUE);
      c.append(h('ul', { class: 'etapes' }, CHRONIQUE.map((x, i) => E.chro[i] ? h('li', null, h('span', { class: 'date' }, x.date), h('span', null, h('b', null, x.titre), ' : ' + nom[E.chro[i]].toLowerCase() + ' ', h('span', { class: juste(i) ? 'v' : 'x' }, juste(i) ? '✓' : '✗ (attendu : ' + x.rep.map(r => nom[r].toLowerCase()).join(' et ') + ')'))) : null)));
    }
    // 6. Plan et réponse
    if (final) {
      c.append(section('6. Mon plan pour la question problématisée'));
      c.append(h('div', { class: 'qdepart' }, h('small', null, 'Sujet'), h('b', null, JEU.questionFinale)));
      c.append(blocPlan());
      c.append(section('7. Ma conclusion'));
      c.append(h('div', { class: 'redaction-finale' }, E.redaction || ''));
      c.append(section('Vocabulaire à retenir'), blocVocab());
    }
    return c;
  }
  function carnetTexte() {
    const L = [], nomC = Object.fromEntries(CHOIX_CHRONIQUE);
    L.push('CARNET DU SECRÉTAIRE · ' + JEU.titre + ' (' + JEU.niveau + ')');
    L.push((E.noms || 'Sans nom') + (E.classe ? ' · ' + E.classe : '') + ' · ' + new Date().toLocaleDateString('fr-FR'));
    if (E.phase === 'fin') {
      const n = noteAuto();
      L.push('', 'NOTE AUTOMATIQUE : ' + fmt(n.total) + ' / ' + n.sur + '   |   Rédaction : ... / ' + BAREME.redaction + '   |   TOTAL : ... / 20');
      n.lignes.forEach(l => L.push('- ' + l[0] + ' : ' + fmt(l[1]) + ' / ' + l[2]));
      L.push('Partie commencée le ' + new Date(E.debut).toLocaleString('fr-FR') + (E.partieN ? ' · partie n° ' + E.partieN + ' sur cet ordinateur' : '') + (E.repris ? ' · reprise par code' : ''));
    }
    L.push('', 'Question de départ : ' + JEU.questionDepart, '');
    L.push('1. QUI VEUT QUOI ?' + (E.exigScore !== null ? ' (' + E.exigScore + '/' + EXIGENCES.length + ' au premier essai)' : ''));
    NEGOCIATEURS.forEach(p => L.push('- ' + p.nom + ' : ' + (EXIGENCES.filter(x => E.exig[x.id] === p.id).map(x => x.texte).join(' ; ') || '-')));
    L.push('', '2. MA PAIX ET LA PAIX DE VIENNE');
    ORDRE_DOSSIERS.filter(k => E.choix[k]).forEach(k => {
      const mien = E.choixEleve[k] || E.choix[k];
      L.push('- ' + DOSSIERS[k].titre + ' : ' + optionDe(k, mien).texte + (mien === DOSSIERS[k].reel ? ' [comme en 1815]' : ' [en 1815 : ' + optionDe(k, DOSSIERS[k].reel).texte + ']'));
    });
    if (ORDRE_DOSSIERS.some(k => E.choix[k])) { const m = jauges(E.choix), r = jauges(CHOIX_REELS); L.push('Jauges : ' + ['eq', 'leg', 'sec', 'ent'].map(g => JAUGES[g].nom + ' ' + m[g] + ' (Vienne ' + r[g] + ')').join(', ')); }
    if (Object.keys(E.alliances).length) {
      L.push('', '3. DEUX ALLIANCES');
      ALLIANCES.affirmations.forEach(a => { const r = E.alliances[a.id]; if (r) L.push('- ' + a.texte + ' -> ' + r + (a.rep.includes(r) ? ' [juste]' : ' [faux]')); });
    }
    if (Object.keys(E.tab).length) {
      L.push('', '4. CE QUE DÉCIDE LE CONGRÈS DE VIENNE');
      TABLEAU.lignes.forEach(l => L.push('- ' + l.titre + ' : ' + TABLEAU.etiquettes.filter(x => E.tab[x.id] === l.id).map(x => x.texte).join(' ')));
    }
    if (Object.keys(E.chro).length) {
      L.push('', "5. L'ORDRE DE 1815 À L'ÉPREUVE");
      CHRONIQUE.forEach((x, i) => { if (E.chro[i]) L.push('- ' + x.date + ' ' + x.titre + ' : ' + nomC[E.chro[i]] + (juste(i) ? ' [juste]' : ' [faux]')); });
    }
    if (E.phase === 'fin') {
      const P = planDonnees();
      L.push('', '6. MON PLAN · ' + JEU.questionFinale);
      REDACTION.plan.forEach((p, i) => { L.push(['I', 'II', 'III'][i] + '. ' + p.titre + ' (' + p.sous + ')'); P[i].forEach(t => L.push('   - ' + t)); });
      L.push('', '7. MA CONCLUSION', E.redaction || '');
    }
    return L.join('\n');
  }
  function copier(texte, cible, messageOk) {
    const secours = () => {
      const zone = h('textarea', { id: 'copie-secours', readonly: true }); zone.value = texte;
      ouvrirModal([h('h2', null, 'Copie ce texte'), h('p', null, 'Sélectionne le texte ci-dessous, copie-le, puis colle-le où ton professeur te l\'a demandé.'), zone,
        h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: fermerModal }, 'Fermer'))]);
      zone.focus(); zone.select();
    };
    try {
      navigator.clipboard.writeText(texte).then(() => { if (cible) cible.textContent = 'Copié'; toast(messageOk); }, secours);
    } catch (e) { secours(); }
  }
  /* ---------- Fiches à copier : le plan et le tableau comparatif, collés comme de vrais tableaux dans Word, Docs ou l'ENT ---------- */
  const echap = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const STYLE_TD = 'border:1px solid #999;padding:6px;vertical-align:top;';
  function fichePlan() {
    const P = planDonnees();
    const tete = REDACTION.plan.map((p, i) => '<th style="' + STYLE_TD + 'background:#E7EEF0">' + ['I', 'II', 'III'][i] + '. ' + echap(p.titre) + '<br><small>' + echap(p.sous) + '</small></th>').join('');
    const corps = P.map(col => '<td style="' + STYLE_TD + '"><ul>' + col.map(t => '<li>' + echap(t) + '</li>').join('') + '</ul></td>').join('');
    const html = '<h3>Plan · ' + echap(JEU.questionFinale) + '</h3><table style="border-collapse:collapse;width:100%"><tr>' + tete + '</tr><tr>' + corps + '</tr></table>';
    const L = ['PLAN · ' + JEU.questionFinale];
    REDACTION.plan.forEach((p, i) => { L.push('', ['I', 'II', 'III'][i] + '. ' + p.titre + ' (' + p.sous + ')'); P[i].forEach(t => L.push('- ' + t)); });
    return { html, texte: L.join('\n') };
  }
  function ficheComparaison() {
    const lignes = ORDRE_DOSSIERS.filter(k => E.choix[k]).map(k => {
      const mien = E.choixEleve[k] || E.choix[k];
      return [DOSSIERS[k].titre, optionDe(k, mien).texte + (E.forces[k] ? ' (annulée par les événements)' : ''), optionDe(k, DOSSIERS[k].reel).texte, mien === DOSSIERS[k].reel ? 'Pareil' : 'Différent'];
    });
    const th = ['Dossier', 'Ma proposition', 'Décision de 1815', 'Comparaison'].map(t => '<th style="' + STYLE_TD + 'background:#E7EEF0">' + t + '</th>').join('');
    const html = '<h3>Ma paix et la paix de Vienne</h3><table style="border-collapse:collapse;width:100%"><tr>' + th + '</tr>' + lignes.map(l => '<tr>' + l.map(c => '<td style="' + STYLE_TD + '">' + echap(c) + '</td>').join('') + '</tr>').join('') + '</table>';
    const texte = ['MA PAIX ET LA PAIX DE VIENNE', 'Dossier\tMa proposition\tDécision de 1815\tComparaison'].concat(lignes.map(l => l.join('\t'))).join('\n');
    return { html, texte };
  }
  function copierFiche(f, cible, msg) {
    try {
      if (window.ClipboardItem && navigator.clipboard && navigator.clipboard.write) {
        const item = new ClipboardItem({ 'text/html': new Blob([f.html], { type: 'text/html' }), 'text/plain': new Blob([f.texte], { type: 'text/plain' }) });
        navigator.clipboard.write([item]).then(() => { if (cible) cible.textContent = 'Copié'; toast(msg); }, () => copier(f.texte, cible, msg));
        return;
      }
    } catch (e) { /* on passe au texte simple */ }
    copier(f.texte, cible, msg);
  }
  const boutonPlan = () => h('button', { class: 'btn second', type: 'button', onclick: ev => copierFiche(fichePlan(), ev.currentTarget, 'Plan copié : colle-le dans un document pour le compléter.') }, 'Copier le plan');
  const boutonComparaison = () => h('button', { class: 'btn second', type: 'button', disabled: !ORDRE_DOSSIERS.some(k => E.choix[k]), onclick: ev => copierFiche(ficheComparaison(), ev.currentTarget, 'Tableau copié : colle-le dans un document pour le compléter.') }, 'Copier le tableau comparatif');
  const boutonCopier = () => h('button', { class: 'btn or', type: 'button', onclick: ev => copier(carnetTexte(), ev.currentTarget, 'Carnet copié : colle-le où ton professeur te l\'a demandé.') }, 'Copier mon carnet');
  const boutonCode = () => h('button', { class: 'btn second', type: 'button', onclick: ev => copier(encoder(E), ev.currentTarget, 'Code de reprise copié : garde-le pour continuer ailleurs.') }, 'Copier mon code de reprise');
  function ouvrirCarnet() {
    fermerDialogue();
    ouvrirModal([construireCarnet(E.phase === 'fin'), h('div', { class: 'actions' },
      h('button', { class: 'btn', type: 'button', onclick: fermerModal }, 'Fermer'), boutonCopier(), boutonComparaison(), E.phase === 'redaction' || E.phase === 'fin' ? boutonPlan() : null, boutonCode()),
      h('p', { class: 'note-rendu' }, 'Le code de reprise permet de continuer la partie sur un autre ordinateur (par exemple à la maison) : colle-le dans l\'écran d\'accueil, bouton « Reprendre avec un code ».')], { large: true });
  }
  function ouvrirFin() {
    fermerDialogue();
    $('#ecran-activite').hidden = true;
    majCarte();
    const cont = $('#fin-contenu'); cont.replaceChildren();
    cont.append(h('div', { class: 'barre-fin' }, boutonCopier(), boutonPlan(), boutonComparaison(),
      DANS_CADRE ? null : h('button', { class: 'btn', type: 'button', onclick: imprimer }, 'Imprimer ou enregistrer en PDF'),
      h('button', { class: 'btn second', type: 'button', onclick: revoirCarte }, 'Revoir la carte'),
      boutonCode(),
      h('button', { class: 'btn second', type: 'button', onclick: nouvellePartie }, 'Nouvelle partie')));
    cont.append(h('p', { class: 'note-rendu' }, 'Pour rendre ton carnet : copie-le et colle-le dans l\'ENT (ou dans un document), ou montre cet écran à ton professeur.'));
    cont.append(construireCarnet(true), credits());
    $('#ecran-fin').hidden = false; $('#ecran-fin').scrollTop = 0;
  }
  function revoirCarte() {
    $('#ecran-fin').hidden = true;
    E.vue = 'jeu'; majCarte(); K.cadrer('centre');
    panneau([entete('Fin de la partie'), h('h2', null, 'Explore la carte'),
      h('p', null, 'Compare l\'Europe de 1812, ta paix et la paix de Vienne avec les boutons en haut de la carte. Survole un État pour lire son nom.')],
    [bouton('Revenir à mon carnet', () => { ouvrirFin(); })]);
  }
  function imprimer() { remplirImpression(); window.print(); }
  function remplirImpression() { const z = $('#impression'); z.replaceChildren(construireCarnet(E.phase === 'fin')); }
  window.addEventListener('beforeprint', () => { if (E && E.phase !== 'intro') remplirImpression(); });
  function demanderCodeProf(titre, texte, action) {
    const champ = h('input', { id: 'i-prof', type: 'password', autocomplete: 'off', placeholder: 'Code du professeur' });
    const err = h('p', { class: 'erreur', role: 'alert' });
    const valider = () => { if (champ.value.trim().toUpperCase() === String(JEU.codeProf).toUpperCase()) { fermerModal(); action(); } else err.textContent = 'Code incorrect : appelle ton professeur.'; };
    champ.addEventListener('keydown', e => { if (e.key === 'Enter') valider(); });
    ouvrirModal([h('h2', null, titre), h('p', null, texte),
      h('label', { for: 'i-prof', class: 'sr' }, 'Code du professeur'), champ, err,
      h('div', { class: 'actions' },
        h('button', { class: 'btn rouge', type: 'button', onclick: valider }, 'Valider'),
        h('button', { class: 'btn second', type: 'button', onclick: fermerModal }, 'Annuler'))]);
    setTimeout(() => champ.focus(), 50);
  }
  function nouvellePartie() {
    demanderCodeProf('Nouvelle partie ?', 'Ton carnet actuel sera effacé de cet ordinateur. Cette partie est notée : seul ton professeur peut autoriser une nouvelle partie.',
      () => { try { localStorage.removeItem(CLE); } catch (e) { /* rien */ } location.reload(); });
  }

  /* ---------- Sources ---------- */
  const credits = () => h('details', { class: 'credits' }, h('summary', null, 'Sources et crédits'), h('ul', null,
    h('li', null, 'Documents : fiche élève du PPO « Metternich et le congrès de Vienne » (Doc. 1 : Metternich ; Doc. 2 : traité de la Sainte-Alliance) ; traité de la Quadruple-Alliance, 20 novembre 1815, article 6.'),
    h('li', null, 'Personnages : réels. Leurs paroles sont imaginées d\'après les positions qu\'ils ont défendues au congrès. « Le congrès danse, mais il ne marche pas » est attribué au prince de Ligne.'),
    h('li', null, 'Carte : traits de côte et limites administratives Natural Earth (domaine public). Frontières de 1812 et de 1815 recomposées et simplifiées pour ce jeu.'),
    h('li', null, 'Populations : ordres de grandeur arrondis.')));

  /* ---------- Aide ---------- */
  const blocVocab = () => h('div', { class: 'vocab' }, h('p', { class: 'vocab-titre' }, 'Vocabulaire'),
    h('dl', null, VOCABULAIRE.flatMap(([m, d]) => [h('dt', null, m), h('dd', null, d)])));
  function ouvrirAide() {
    ouvrirModal([h('h2', null, 'Comment jouer'),
      h('div', { class: 'qdepart' }, h('small', null, 'Question de départ'), h('b', null, JEU.questionDepart)),
      h('div', { class: 'regles' }, REGLES.map(([t, d]) => h('div', { class: 'regle' }, h('b', null, t), d))),
      h('div', { class: 'jauges-aide' }, ['eq', 'leg', 'sec', 'ent'].map(g => h('p', null, h('span', { html: ICO[g] }), h('b', null, JAUGES[g].nom + ' : '), JAUGES[g].aide))),
      blocVocab(),
      h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: fermerModal }, "C'est compris"),
        E && E.phase !== 'intro' ? boutonCode() : null),
      credits()]);
  }

  /* ---------- Clavier, plein écran, boutons ---------- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (!$('#modal').hidden) { if (!$('#modal').dataset.bloquant) fermerModal(); return; }
      if (dialogue) fermerDialogue();
      return;
    }
    if (!dialogue || !$('#modal').hidden || /INPUT|TEXTAREA/.test(e.target.tagName || '')) return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9) { const b = $('#talk-choix').children[n - 1]; if (b) { e.preventDefault(); b.click(); } }
  });
  const fs = $('#b-fs');
  if (!document.fullscreenEnabled) fs.hidden = true;
  fs.addEventListener('click', () => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else document.documentElement.requestFullscreen().catch(() => toast('Le plein écran n\'est pas disponible ici.'));
  });
  document.addEventListener('fullscreenchange', () => { const t = document.fullscreenElement ? 'Quitter le plein écran' : 'Plein écran'; fs.setAttribute('aria-label', t); fs.title = t; });
  $('#b-carnet').addEventListener('click', ouvrirCarnet);
  $('#b-aide').addEventListener('click', ouvrirAide);
  $('#z-plus').addEventListener('click', () => K.zoom(1.5));
  $('#z-moins').addEventListener('click', () => K.zoom(1 / 1.5));
  $('#z-tout').addEventListener('click', () => K.cadrer('centre'));
  document.querySelectorAll('#bascule button').forEach(b => b.addEventListener('click', () => { E.vue = b.dataset.vue; sauver(); majCarte(); }));

  /* ---------- Démarrage ---------- */
  function afficherPhase() {
    const ph = E.phase;
    $('#ecran-activite').hidden = true; $('#ecran-fin').hidden = true;
    if (ph === 'europe') afficherEurope();
    else if (ph === 'salons') afficherSalons();
    else if (ph === 'exigences') { afficherSalons(); ouvrirExigences(); }
    else if (ph === 'table') afficherTable();
    else if (ph === 'centjours') afficherCentJours();
    else if (ph === 'bilan') afficherBilan();
    else if (ph === 'alliances') afficherAlliances();
    else if (ph === 'tableau') { afficherAlliances(); E.phase = 'tableau'; ouvrirTableau(); }
    else if (ph === 'chronique') afficherChronique();
    else if (ph === 'redaction') { E.chroEtape = CHRONIQUE.length - 1; afficherChronique(); E.phase = 'redaction'; ouvrirRedaction(); }
    else if (ph === 'fin') { majHUD(); ouvrirFin(); }
  }
  function resumePartie(s) {
    const noms = { europe: "l'Europe de 1812", salons: 'les salons', exigences: 'les salons', table: 'les négociations', centjours: 'les Cent-Jours', bilan: 'le bilan', alliances: 'les alliances', tableau: 'le tableau', chronique: 'la chronique 1815-1848', redaction: 'la conclusion', fin: 'partie terminée' };
    return (s.noms || 'sans nom') + ' · ' + (noms[s.phase] || '');
  }
  function reprendre(s) {
    E = Object.assign(etatInitial(), s);
    $('#ecran-intro').hidden = true;
    sauver(); afficherPhase();
  }
  function afficherIntro() {
    const s = charger();
    const cont = $('#intro-contenu'); cont.replaceChildren();
    const nom = h('input', { id: 'i-noms', autocomplete: 'off', placeholder: 'Prénom Nom (et ton binôme)' });
    const classe = h('input', { id: 'i-classe', autocomplete: 'off', placeholder: 'Ex. : 1re 3' });
    const demarrer = () => {
      compterPartie();
      E = etatInitial(); E.noms = nom.value.trim(); E.classe = classe.value.trim(); E.phase = 'europe'; E.etape = 'q'; E.partieN = partiesIci();
      sauver(); $('#ecran-intro').hidden = true; afficherEurope();
    };
    const enCours = s && s.phase && s.phase !== 'intro';
    const go = h('button', { class: 'btn or grand', type: 'button', disabled: true, onclick: () => {
      if (enCours) demanderCodeProf('Une partie est déjà en cours', 'Une partie notée a déjà commencé sur cet ordinateur (' + resumePartie(s) + '). Reprends-la avec le bouton « Reprendre ». Pour en commencer une autre, il faut le code du professeur.', demarrer);
      else demarrer();
    } }, 'Entrer au congrès');
    nom.addEventListener('input', () => { go.disabled = nom.value.trim().length < 2; });
    nom.addEventListener('keydown', e => { if (e.key === 'Enter' && !go.disabled) go.click(); });
    const zoneCode = h('textarea', { id: 'i-code', rows: '3', placeholder: 'Colle ici ton code de reprise (il commence par TV1-)' });
    const erreur = h('p', { class: 'erreur', role: 'alert' });
    const blocCode = h('details', { class: 'reprise-code' }, h('summary', null, 'Reprendre avec un code'),
      h('label', { for: 'i-code', class: 'sr' }, 'Code de reprise'), zoneCode,
      h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: () => {
        const o = decoder(zoneCode.value);
        if (!o) { erreur.textContent = 'Ce code n\'est pas reconnu. Vérifie que tu l\'as copié en entier.'; return; }
        o.repris = true; reprendre(o);
      } }, 'Reprendre la partie')), erreur);
    const carte = h('div', { class: 'carte-intro' },
      h('p', { class: 'niveau' }, JEU.niveau),
      h('h1', null, JEU.titre),
      h('p', { class: 'sous' }, JEU.sousTitre),
      h('div', { class: 'qdepart' }, h('small', null, 'Question de départ'), h('b', null, JEU.questionDepart)),
      h('div', { class: 'intro-texte' }, INTRO.map(t => h('p', null, t))),
      h('div', { class: 'regles' }, REGLES.slice(0, 4).map(([t, d]) => h('div', { class: 'regle' }, h('b', null, t), d))),
      h('div', { class: 'champs' }, h('div', { class: 'champ' }, h('label', { for: 'i-noms' }, 'Ton nom (et celui de ton binôme)'), nom), h('div', { class: 'champ' }, h('label', { for: 'i-classe' }, 'Classe'), classe)),
      go);
    if (s && s.phase && s.phase !== 'intro') carte.append(h('div', { class: 'reprise' }, h('span', null, 'Partie en cours : ', h('b', null, resumePartie(s)), '.'),
      h('button', { class: 'btn or petit', type: 'button', onclick: () => reprendre(s) }, 'Reprendre')));
    carte.append(blocCode);
    cont.append(carte);
    $('#ecran-intro').hidden = false;
  }

  K.init($('#carte'), { label: "Carte de l'Europe entre 1812 et 1815" });
  K.afficher({ mode: '1812' });
  K.cadrer('centre', false);
  modeCourant = '1812';
  E = etatInitial();
  majLegende();
  panneau([entete('Vienne, 1814'), h('h2', null, 'Le congrès se prépare'), h('p', null, 'Les diplomates arrivent de toute l\'Europe.')], []);
  $('#hud').hidden = true; $('#b-carnet').hidden = true;
  E = null;
  afficherIntro();
  window.__jeu = { etat: () => E };
})();
