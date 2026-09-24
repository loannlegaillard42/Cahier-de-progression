/* Galère pour l'Orient — déroulé du jeu : escales, carnet de bord, marché, événements en mer,
   retour à Venise, chronique 1378-1500, schéma bilan et carnet imprimable.
   Les textes sont dans donnees.js ; la carte 3D dans carte3d.js. */
(function () {
  'use strict';
  const C3 = window.Carte3D;
  const CLE = 'galere-orient-v1';
  const RAPIDE = new URLSearchParams(location.search).has('rapide');
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
    date: '<svg class="ico" viewBox="0 0 20 20" fill="none" stroke="#55605F" stroke-width="1.6" aria-hidden="true"><rect x="3" y="4.5" width="14" height="12.5" rx="2"/><path d="M3 8.5h14M7 2.5v4M13 2.5v4"/></svg>',
    cale: '<svg class="ico" viewBox="0 0 20 20" fill="none" stroke="#55605F" stroke-width="1.6" aria-hidden="true"><path d="M2 11h16l-2.5 5h-11z"/><path d="M6 11V6h8v5M10 6V3"/></svg>'
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
      version: 1, phase: 'intro', etape: 'decouverte', noms: '', classe: '', debut: new Date().toISOString(),
      ducats: JEU.ducatsDepart, jour: 1, cale: {}, port: 'venise', visites: { venise: true }, legs: [], journal: [],
      reponses: {}, nbRep: 0, evenements: {}, contrebande: 0, averti: false, depenses: 0, recettes: 0,
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
    $('#st-ducats').innerHTML = ICONES.ducat + '<span class="lib">Ducats</span><b>' + E.ducats + '</b>';
    const d = $('#st-date');
    d.classList.toggle('alerte', E.jour > JEU.jourLimite && E.phase !== 'chronique');
    d.innerHTML = ICONES.date + '<b>' + (E.phase === 'chronique' ? 'Chronique · ' + CHRONIQUE[E.chroniqueEtape].date : dateDe(E.jour)) + '</b>';
    $('#st-cale').innerHTML = ICONES.cale + '<span class="lib">Cale</span><b>' + totalCale() + '/' + JEU.cale + '</b>';
    $('#carnet-compte').textContent = Object.keys(E.reponses).length + '/' + NB_QUESTIONS;
  }
  function panneau(blocs, garder) {
    const p = $('#panneau'); const y = p.scrollTop;
    p.innerHTML = ''; p.append(...blocs.filter(Boolean)); p.hidden = false;
    p.scrollTop = garder ? y : 0;
    majDecalage();
  }
  let minuteurToast = null;
  function toast(msg, duree) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('on');
    clearTimeout(minuteurToast); minuteurToast = setTimeout(() => t.classList.remove('on'), duree || 4200);
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
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden && !$('#modal').dataset.bloquant) fermerModal(); });

  const entete = (drapeau, texte) => h('div', { class: 'chip-port' }, h('span', { class: 'pastille p-' + drapeau }), texte);

  function majDecalage() {
    const p = $('#panneau'), w = window.innerWidth, hh = window.innerHeight;
    if (p.hidden) { C3.decalage(0, 0); return; }
    const aspect = w / hh, t = Math.tan(20 * Math.PI / 180);
    if (w >= 760) C3.decalage(((p.offsetWidth + 24) / 2) / (w / 2) * t * aspect, 0);
    else C3.decalage(0, ((p.offsetHeight + 8) / 2) / (hh / 2) * t * 1.35);
  }
  new MutationObserver(majDecalage).observe($('#panneau'), { attributes: true, attributeFilter: ['hidden'] });
  window.addEventListener('resize', majDecalage);

  /* ---------- Questions du carnet ---------- */
  function blocQuestion(qid, apres) {
    const Q = QUESTIONS[qid], r = E.reponses[qid];
    const boutons = Q.choix.map((c, i) => {
      let cls = null;
      if (r) { if (i === Q.bonne) cls = 'bonne'; else if (i === r.choix) cls = 'fausse'; }
      return h('button', { type: 'button', class: cls, disabled: !!r, onclick: () => repondre(qid, i, apres) }, c);
    });
    return h('div', { class: 'question' },
      h('div', { class: 'q-etiq' }, 'Carnet de bord · question'),
      h('p', { class: 'q' }, Q.q),
      h('div', { class: 'choix' }, boutons),
      r ? h('div', { class: 'explication ' + (r.ok ? 'ok' : 'ko') }, h('b', null, r.ok ? 'Bonne réponse !' : 'Pas tout à fait…'), Q.exp) : null);
  }
  function repondre(qid, i, apres) {
    if (E.reponses[qid]) return;
    E.reponses[qid] = { choix: i, ok: i === QUESTIONS[qid].bonne, n: ++E.nbRep };
    sauver(); majHUD(); (apres || rafraichir)(true);
  }
  function rafraichir(garder) {
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
    if (!E || E.phase === 'intro') return;
    if (E.phase === 'mer') return;
    if (E.phase !== 'port') { toast(PORTS[id].nom + ' — ' + PORTS[id].statut); return; }
    if (id === E.port) { C3.vue('port', { port: id }); return; }
    if (E.etape !== 'depart') { toast("Termine d'abord ton escale à " + PORTS[E.port].nom + ', puis choisis ta destination.'); return; }
    if (!C3.voisins(E.port).includes(id)) { toast("Pas de route directe de " + PORTS[E.port].nom + ' vers ' + PORTS[id].nom + '. Suis les routes dorées.'); return; }
    const pa = peutAller(id); if (!pa.ok) { toast(pa.raison, 5000); return; }
    partir(id);
  }

  /* ---------- Escales ---------- */
  function afficherPort(garder) {
    const p = PORTS[E.port];
    if (!garder) C3.vue(E.etape === 'depart' ? 'ensemble' : 'port', { port: E.port });
    $('#bandeau').hidden = true;
    majHUD(); majCarte();
    const blocs = [entete(p.drapeau, p.statut)];
    const qs = p.questions || [];
    if (E.etape === 'decouverte') {
      blocs.push(h('h2', null, p.titre));
      p.texte.forEach(t => blocs.push(h('p', null, t)));
      if (p.notion) blocs.push(h('div', { class: 'notion', html: '<b>' + esc(p.notion[0]) + '</b> : ' + esc(p.notion[1]) }));
      for (const q of qs) { blocs.push(blocQuestion(q)); if (!E.reponses[q]) break; }
      if (qs.every(q => E.reponses[q])) {
        blocs.push(h('button', { class: 'btn large', type: 'button', onclick: () => { E.etape = p.escale ? 'depart' : 'marche'; sauver(); afficherPort(); } },
          p.escale ? 'Choisir ma prochaine escale →' : 'Aller au marché →'));
      }
    } else if (E.etape === 'marche') {
      blocs.push(...blocMarche(p, false));
    } else {
      blocs.push(...blocDepart(p));
    }
    panneau(blocs, garder);
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
    if (p.conseil) out.push(h('div', { class: 'conseil' }, p.conseil));
    out.push(h('div', { class: 'bourse', html: '<span>Ta bourse : <b>' + E.ducats + ' ducats</b></span><span>Cale : <b>' + totalCale() + '/' + JEU.cale + '</b></span>' }));
    const achat = retour ? {} : (p.achat || {});
    const vente = retour ? prixRetour() : (p.vente || {});
    const ga = Object.keys(achat);
    if (ga.length) out.push(h('div', { class: 'sous-titre-marche' }, 'Tu peux acheter'), h('div', { class: 'marche' }, ga.map(g => ligneMarche(g, achat[g], 'achat'))));
    let gv = Object.keys(vente);
    if (retour) gv = gv.filter(g => E.cale[g]);
    if (gv.length) out.push(h('div', { class: 'sous-titre-marche' }, retour ? 'Les marchands du Rialto t\'achètent' : 'Les marchands d\'ici achètent'), h('div', { class: 'marche' }, gv.map(g => ligneMarche(g, vente[g], 'vente'))));
    else if (retour) out.push(h('p', null, 'Ta cale est vide : tout est vendu.'));
    if (!retour) out.push(h('button', { class: 'btn large', type: 'button', onclick: () => { E.etape = 'depart'; sauver(); afficherPort(); } }, "Lever l'ancre →"));
    return out;
  }
  function acheter(g, prix) {
    if (MARCHANDISES[g].interdit && !E.averti) {
      ouvrirModal([
        h('div', { class: 'ev-entete' }, 'Attention'),
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

  function blocDepart(p) {
    const voisins = C3.voisins(E.port);
    const reste = ORDRE_PORTS.filter(id => !E.visites[id]);
    const out = [h('h2', null, 'Où aller maintenant ?'),
      h('p', null, 'Choisis une escale reliée par une route dorée : ici, ou directement sur la carte.')];
    out.push(h('div', { class: 'destinations' }, voisins.map(v => {
      const pa = peutAller(v), P = PORTS[v], j = joursPour(C3.longueurRoute(E.port, v));
      return h('button', { class: 'dest', type: 'button', disabled: !pa.ok, onclick: () => partir(v) },
        h('span', { class: 'pastille p-' + P.drapeau }),
        h('span', null, h('div', { class: 'd-nom' }, P.nom, E.visites[v] ? h('span', { class: 'fait' }, ' ✓') : null), h('div', { class: 'd-info' }, pa.ok ? P.statut : pa.raison)),
        h('span', { class: 'd-jours' }, '≈ ' + j + ' jours'));
    })));
    out.push(h('p', { style: 'margin-top:14px;font-size:13px;color:var(--sub)' }, reste.length
      ? 'Escales encore à découvrir : ' + liste(reste.map(id => PORTS[id].nom)) + '. Quand ton tour sera fini, rentre à Venise.'
      : 'Tu as fait le tour de toutes les escales : rentre à Venise vendre ta cargaison !'));
    if (E.jour > JEU.jourLimite - 25) out.push(h('div', { class: 'conseil' }, E.jour > JEU.jourLimite ? "L'hiver est là : d'autres galères sont déjà rentrées. Tes marchandises se vendront moins cher." : "L'hiver approche : pense à rentrer à Venise avant le " + dateDe(JEU.jourLimite) + '.'));
    if (!p.escale) out.push(h('button', { class: 'btn second', type: 'button', style: 'margin-top:8px', onclick: () => { E.etape = 'marche'; afficherPort(); } }, '← Retourner au marché'));
    return out;
  }

  /* ---------- En mer ---------- */
  function partir(dest) {
    const pa = peutAller(dest); if (!pa.ok) { toast(pa.raison, 5000); return; }
    const de = E.port, jours = joursPour(C3.longueurRoute(de, dest));
    const cle = ROUTES[de + '-' + dest] ? de + '-' + dest : dest + '-' + de;
    let ev = null;
    for (const id of ['tempete', 'genes']) if (!E.evenements[id] && EVENEMENTS_ROUTES[id].includes(cle)) { ev = id; break; }
    E.phase = 'mer';
    $('#panneau').hidden = true;
    majCarte(); C3.surlignerRoutes(de, []);
    $('#b-titre').textContent = PORTS[de].nom + ' → ' + PORTS[dest].nom;
    const prog = t => {
      $('#b-date').textContent = dateDe(E.jour + Math.floor(t * jours)) + ' · ' + Math.round(t * jours) + ' / ' + jours + ' jours de mer';
      $('#b-jauge').style.width = (t * 100).toFixed(1) + '%';
    };
    prog(0); $('#bandeau').hidden = false;
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
        h('div', { class: 'ev-entete' }, 'En mer'),
        h('h2', null, ev.titre),
        h('div', { class: 'resultat' }, res.resultat, detail ? h('div', { style: 'font-weight:400;margin-top:4px' }, detail) : null),
        h('div', { class: 'a-retenir' }, h('b', null, 'À retenir'), ev.aRetenir),
        h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: () => { fermerModal(); C3.pause(false); } }, 'Reprendre la navigation'))
      ], { bloquant: true });
    };
    ouvrirModal([
      h('div', { class: 'ev-entete' }, 'En mer'),
      h('h2', null, ev.titre), h('p', null, ev.texte),
      h('div', { class: 'choix-ev' }, ev.choix.map(c => h('button', { type: 'button', onclick: () => choisir(c) }, c.label)))
    ], { bloquant: true });
  }
  function arriver(de, dest, jours) {
    E.jour += jours + JEU.joursEscale;
    E.legs.push([de, dest]); E.port = dest;
    const premiere = !E.visites[dest]; E.visites[dest] = true;
    E.journal.push({ port: dest, jour: E.jour, premiere });
    $('#bandeau').hidden = true;
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
  function afficherRetour(garder) {
    if (!garder) C3.vue('port', { port: 'venise' });
    majHUD(); majCarte();
    const blocs = [entete('venise', 'Venise · retour de voyage')];
    if (E.etape === 'vente') {
      blocs.push(h('h2', null, RETOUR.titre));
      RETOUR.texte.forEach(t => blocs.push(h('p', null, t)));
      if (enRetard()) blocs.push(h('div', { class: 'a-retenir' }, h('b', null, 'Retour tardif'), 'Tu rentres le ' + dateDe(E.jour) + " : d'autres galères sont arrivées avant toi. Les prix ont baissé de " + Math.round(JEU.baisseRetard * 100) + ' %.'));
      blocs.push(...blocMarche({}, true));
      blocs.push(h('button', { class: 'btn large', type: 'button', onclick: finVentes }, totalCale() ? 'Tout vendre et continuer →' : 'Continuer →'));
    } else if (E.etape === 'ducat') {
      blocs.push(h('h2', null, "Payé en ducats d'or"));
      blocs.push(h('div', { html: DUCAT_SVG }), h('div', { class: 'legende-ducat' }, 'Ducat de Venise (Doc. 3) — à gauche saint Marc remet l\'étendard au doge ; à droite le Christ.'));
      RETOUR.questions.forEach(q => blocs.push(blocQuestion(q)));
      if (RETOUR.questions.every(q => E.reponses[q])) blocs.push(h('button', { class: 'btn large', type: 'button', onclick: () => { E.etape = 'bilan'; E.ducatsFinaux = E.ducats; sauver(); afficherRetour(); } }, 'Voir le bilan de mon voyage →'));
    } else {
      const benef = E.ducats - JEU.ducatsDepart;
      const titre = benef < 0 ? 'Voyage déficitaire… la mer est cruelle.' : benef < 300 ? 'Un marchand prudent.' : benef < 700 ? 'Un riche marchand !' : 'Un grand marchand du Rialto !';
      blocs.push(h('h2', null, 'Bilan de ton voyage'));
      blocs.push(h('div', { class: 'chiffres' },
        chiffre('Parti avec', JEU.ducatsDepart + ' d.'), chiffre('Rentré avec', E.ducats + ' d.'),
        chiffre('Bénéfice', (benef >= 0 ? '+' : '') + benef + ' d.'), chiffre('Durée', (E.jour - 1) + ' jours'),
        chiffre('Bonnes réponses', nbBonnes() + ' / ' + NB_QUESTIONS)));
      blocs.push(h('p', { style: 'margin-top:14px;font:600 17px var(--serif);color:var(--accent)' }, titre));
      blocs.push(h('p', null, "Ton voyage montre comment Venise s'enrichit : un réseau d'escales et de comptoirs, des galères, une monnaie solide… Mais cette puissance a-t-elle duré ?"));
      blocs.push(h('button', { class: 'btn large', type: 'button', onclick: () => { E.phase = 'chronique'; E.chroniqueEtape = 0; sauver(); afficherChronique(); } }, 'Et après ? Venise face aux menaces (1378-1500) →'));
    }
    panneau(blocs, garder);
  }
  const chiffre = (t, v) => h('div', { class: 'chiffre' }, h('small', null, t), h('b', null, v));
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
        h('div', { class: 'ev-entete' }, 'Au palais des Doges'),
        h('h2', null, puni ? ev.titre : 'Contrebande… impunie'),
        puni ? h('p', null, ev.texte) : null,
        h('div', { class: 'resultat' }, puni ? 'Tu paies une amende de ' + amende + ' ducats.' : ev.impuni),
        h('div', { class: 'a-retenir' }, h('b', null, 'À retenir'), ev.aRetenir),
        h('div', { class: 'actions' }, h('button', { class: 'btn', type: 'button', onclick: () => { fermerModal(); suite(); } }, 'Continuer'))
      ], { bloquant: true });
    } else suite();
  }

  /* ---------- Chronique : Venise face aux menaces ---------- */
  function appliquerChroniqueJusqua(n) { CHRONIQUE.forEach((c, i) => C3.effet(c.effet, i <= n)); }
  function afficherChronique(garder) {
    const i = E.chroniqueEtape, c = CHRONIQUE[i], rep = E.chronique[i];
    $('#bandeau').hidden = true;
    appliquerChroniqueJusqua(i);
    if (!garder) C3.vue('lieu', { lon: c.lon, lat: c.lat, rayon: c.effet === 'gama' ? 12 : c.effet === 'terreFerme' ? 6.5 : 5 });
    C3.etatPorts({}); C3.surlignerRoutes(E.port, []);
    majHUD();
    const blocs = [entete('venise', 'Et après ? · ' + (i + 1) + ' / ' + CHRONIQUE.length),
      h('div', { style: 'font:700 34px var(--serif);color:var(--rouge);margin-top:8px' }, c.date),
      h('h2', null, c.titre), h('p', null, c.texte)];
    const q = h('div', { class: 'question' }, h('div', { class: 'q-etiq' }, 'Ton avis'), h('p', { class: 'q' }, 'Pour la puissance de Venise, cet événement est plutôt…'));
    const opts = [['atout', 'Un atout'], ['menace', 'Une menace']];
    q.append(h('div', { class: 'choix' }, opts.map(([k, l]) => {
      let cls = null; if (rep) { if (k === c.reponse) cls = 'bonne'; else if (k === rep) cls = 'fausse'; }
      return h('button', { type: 'button', class: cls, disabled: !!rep, onclick: () => { E.chronique[i] = k; sauver(); afficherChronique(true); } }, l);
    })));
    if (rep) q.append(h('div', { class: 'explication ' + (rep === c.reponse ? 'ok' : 'ko') },
      h('b', null, rep === c.reponse ? 'Oui.' : 'Pas vraiment.'),
      c.reponse === 'menace' ? (c.effet === 'chioggia' ? "C'est une menace très grave… que Venise surmonte grâce à sa flotte." : 'Cet événement fragilise la puissance vénitienne.') : 'Cet événement renforce la puissance vénitienne.'));
    blocs.push(q);
    if (rep) blocs.push(h('button', { class: 'btn large', type: 'button', onclick: () => {
      if (i < CHRONIQUE.length - 1) { E.chroniqueEtape++; sauver(); afficherChronique(); }
      else { E.phase = 'schema'; sauver(); ouvrirSchema(); }
    } }, i < CHRONIQUE.length - 1 ? 'Suivant →' : 'Construire le schéma bilan →'));
    panneau(blocs, garder);
  }

  /* ---------- Schéma bilan ---------- */
  let choisi = null;
  function ouvrirSchema() {
    $('#panneau').hidden = true; $('#hud').hidden = true; $('#legende').hidden = true;
    $('#ecran-schema').hidden = false; dessinerSchema();
  }
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
      h('span', { class: 'niveau' }, JEU.niveau),
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
    const actions = h('div', { class: 'actions', style: 'display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:16px' });
    const tousPlaces = !libres.length;
    const toutJuste = E.schemaVerif && SCHEMA.elements.every(e => E.schemaVerif[e.id]);
    if (!toutJuste) actions.append(h('button', { class: 'btn', type: 'button', disabled: !tousPlaces, onclick: verifierSchema }, tousPlaces ? 'Vérifier mon schéma' : 'Place toutes les étiquettes (' + libres.length + ' restantes)'));
    if (E.schemaVerif) {
      const n = SCHEMA.elements.filter(e => E.schemaVerif[e.id]).length;
      actions.append(h('span', { class: 'score' }, n + ' / ' + SCHEMA.elements.length + ' bien placées' + (toutJuste ? ' — bravo !' : ' : déplace les étiquettes en rouge.')));
    }
    if (!toutJuste && E.schemaEssais >= 2) actions.append(h('button', { class: 'btn second', type: 'button', onclick: corrigerSchema }, 'Voir la correction'));
    if (toutJuste) actions.append(h('button', { class: 'btn or', type: 'button', onclick: () => { E.etapeSchema = 'redaction'; sauver(); dessinerSchema(); window.scrollTo(0, 0); $('#ecran-schema').scrollTop = 0; } }, 'Continuer : répondre à la question de départ →'));
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
    const zone = h('textarea', { rows: '8', placeholder: 'Venise fonde sa puissance sur…' });
    zone.value = E.redaction || '';
    const compteur = h('span', { class: 'score' });
    const fini = h('button', { class: 'btn or', type: 'button', onclick: () => { E.redaction = zone.value.trim(); E.phase = 'fin'; sauver(); ouvrirFin(); } }, 'Terminer : voir mon carnet de bord →');
    const maj = () => { const n = zone.value.trim().split(/\s+/).filter(Boolean).length; compteur.textContent = n + ' mot' + (n > 1 ? 's' : ''); fini.disabled = n < 15; E.redaction = zone.value; sauver(); };
    zone.addEventListener('input', maj);
    cont.append(h('div', { class: 'carte-intro' },
      h('span', { class: 'niveau' }, JEU.niveau),
      h('h1', { style: 'font-size:28px' }, 'Réponds à la question de départ'),
      h('div', { class: 'qdepart' }, h('small', null, 'Question de départ'), h('b', null, JEU.questionDepart)),
      h('p', { style: 'font-size:14.5px;color:var(--sub)' }, REDACTION.consigne + ' Appuie-toi sur ton voyage, sur la chronique et sur ton schéma.'),
      h('div', { style: 'display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px' }, h('span', { style: 'font-size:12.5px;color:var(--faint);align-self:center' }, 'Mots utiles :'), REDACTION.aide.map(m => h('span', { class: 'etiquette', style: 'padding:4px 9px;font-size:12.5px' }, m))),
      zone,
      h('div', { style: 'display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-top:12px' }, fini, compteur,
        h('button', { class: 'btn second', type: 'button', onclick: () => { E.etapeSchema = 'placer'; sauver(); dessinerSchema(); } }, '← Revoir mon schéma'))));
    maj(); zone.focus();
  }

  /* ---------- Carnet de bord ---------- */
  function construireCarnet(final, image) {
    const auj = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    const c = h('div', { class: 'carnet' },
      h('span', { class: 'niveau' }, JEU.niveau),
      h('h1', null, 'Carnet de bord'),
      h('div', { class: 'ident' }, (E.noms || 'Marchand anonyme') + (E.classe ? ' · ' + E.classe : '') + ' · ' + auj),
      h('div', { class: 'qdepart', style: 'margin-top:14px' }, h('small', null, 'Question de départ'), h('b', null, JEU.questionDepart)));
    c.append(h('h2', null, 'Mon voyage'));
    if (image) c.append(h('img', { class: 'carte', src: image, alt: "Carte de mon itinéraire en Méditerranée" }));
    const nbEscales = ORDRE_PORTS.filter(p => E.visites[p]).length;
    c.append(h('div', { class: 'chiffres', style: 'margin-top:10px' },
      chiffre('Ducats au départ', JEU.ducatsDepart), chiffre(final ? 'Ducats au retour' : 'Ducats', E.ducats),
      chiffre('Escales', nbEscales + ' / ' + ORDRE_PORTS.length), chiffre(final ? 'Durée du voyage' : 'Date', final ? (E.jour - 1) + ' jours' : dateDe(E.jour))));
    const etapes = h('ol', { class: 'etapes', style: 'margin-top:12px' },
      h('li', null, h('span', { class: 'date' }, dateDe(1)), h('span', null, h('b', null, 'Venise'), ' — départ, avec ' + JEU.ducatsDepart + ' ducats.')));
    for (const j of E.journal) {
      const P = PORTS[j.port];
      etapes.append(h('li', null, h('span', { class: 'date' }, dateDe(j.jour)),
        h('span', null, h('b', null, P.nom), j.port === 'venise' ? ' — retour au Rialto.' : j.premiere && P.notion ? ' — ' + P.notion[0] + ' : ' + P.notion[1] : ' — escale.')));
    }
    c.append(etapes);
    const evs = Object.keys(E.evenements);
    if (evs.length) {
      c.append(h('h2', null, 'Événements'));
      c.append(h('ul', { class: 'etapes' }, evs.map(id => h('li', null, h('span', { class: 'date' }, EVENEMENTS[id].titre), h('span', null, 'Mon choix : ' + E.evenements[id].choix + ' → ' + E.evenements[id].resultat)))));
    }
    const rep = Object.keys(E.reponses).sort((a, b) => E.reponses[a].n - E.reponses[b].n);
    c.append(h('h2', null, 'Mes réponses (' + nbBonnes() + ' / ' + NB_QUESTIONS + ')'));
    if (rep.length) {
      c.append(h('table', { class: 'reponses' },
        h('thead', null, h('tr', null, h('th', null, 'Question'), h('th', null, 'Ma réponse'), h('th', null, ''))),
        h('tbody', null, rep.map(q => {
          const Q = QUESTIONS[q], r = E.reponses[q];
          return h('tr', null, h('td', null, Q.q), h('td', null, Q.choix[r.choix], r.ok ? null : h('div', { style: 'color:var(--ok);margin-top:3px' }, 'Réponse attendue : ' + Q.choix[Q.bonne])),
            h('td', { class: r.ok ? 'v' : 'x' }, r.ok ? '✓' : '✗'));
        }))));
    } else c.append(h('p', null, 'Aucune réponse pour le moment.'));
    if (final) {
      c.append(h('h2', null, 'Et après ? Venise face aux menaces'));
      c.append(h('ul', { class: 'etapes' }, CHRONIQUE.map((ch, i) => {
        const r = E.chronique[i];
        return h('li', null, h('span', { class: 'date' }, ch.date), h('span', null, h('b', null, ch.titre), ' — mon avis : ' + (r === 'atout' ? 'un atout' : r === 'menace' ? 'une menace' : '—') + ' ', h('span', { class: r === ch.reponse ? 'v' : 'x' }, r === ch.reponse ? '✓' : '✗')));
      })));
      c.append(h('h2', null, 'Mon schéma' + (E.schemaScore !== null ? ' (' + E.schemaScore + ' / ' + SCHEMA.elements.length + ' au premier essai' + (E.schemaCorrige ? ', puis correction' : '') + ')' : '')));
      c.append(h('div', { class: 'schema-final' }, SCHEMA.cases.map(cs => h('div', null, h('b', null, cs.titre),
        SCHEMA.elements.filter(e => E.schema[e.id] === cs.id).map(e => e.texte).join(' · ') || '—'))));
      c.append(h('h2', null, 'Ma réponse à la question de départ'));
      c.append(h('div', { class: 'redaction-finale' }, E.redaction || ''));
    }
    return c;
  }
  function ouvrirCarnet() {
    ouvrirModal([construireCarnet(false), h('div', { class: 'actions' },
      h('button', { class: 'btn', type: 'button', onclick: fermerModal }, 'Fermer'),
      h('button', { class: 'btn second', type: 'button', onclick: imprimer }, 'Imprimer'))], { large: true });
  }
  let imageFinale = null;
  function ouvrirFin() {
    $('#ecran-schema').hidden = true; $('#panneau').hidden = true; $('#hud').hidden = true; $('#legende').hidden = true;
    appliquerChroniqueJusqua(-1); majCarte(); C3.etatPorts({});
    imageFinale = C3.capture();
    appliquerChroniqueJusqua(CHRONIQUE.length - 1);
    const cont = $('#fin-contenu'); cont.innerHTML = '';
    cont.append(h('div', { class: 'barre-fin' },
      h('button', { class: 'btn or', type: 'button', onclick: imprimer }, 'Imprimer ou enregistrer en PDF'),
      h('button', { class: 'btn second', type: 'button', onclick: revoirCarte }, 'Revoir la carte'),
      h('button', { class: 'btn second', type: 'button', onclick: nouvellePartie }, 'Nouvelle partie')),
      construireCarnet(true, imageFinale));
    $('#ecran-fin').hidden = false; $('#ecran-fin').scrollTop = 0;
  }
  function revoirCarte() {
    $('#ecran-fin').hidden = true; $('#hud').hidden = false; $('#legende').hidden = window.innerWidth < 760;
    C3.vue('ensemble'); majHUD();
    panneau([entete('venise', 'Fin du voyage'), h('h2', null, 'Explore la carte'),
      h('p', null, 'Tourne, zoome, retrouve ton itinéraire en rouge et les changements survenus entre 1378 et 1500.'),
      h('button', { class: 'btn large', type: 'button', onclick: ouvrirFin }, 'Revenir à mon carnet de bord')]);
  }
  function imprimer() {
    remplirImpression();
    window.print();
  }
  function remplirImpression() {
    const zone = $('#impression'); zone.innerHTML = '';
    zone.append(E && E.phase === 'fin' ? construireCarnet(true, imageFinale) : construireCarnet(false));
  }
  window.addEventListener('beforeprint', () => { if (E) remplirImpression(); });
  function nouvellePartie() {
    ouvrirModal([h('h2', null, 'Nouvelle partie ?'), h('p', null, 'Ton carnet de bord actuel sera effacé. Pense à l\'imprimer ou à l\'enregistrer en PDF avant.'),
      h('div', { class: 'actions' },
        h('button', { class: 'btn rouge', type: 'button', onclick: () => { fermerModal(); try { localStorage.removeItem(CLE); } catch (e) { /* rien */ } location.reload(); } }, 'Effacer et recommencer'),
        h('button', { class: 'btn second', type: 'button', onclick: fermerModal }, 'Annuler'))]);
  }

  /* ---------- Aide ---------- */
  function ouvrirAide() {
    ouvrirModal([
      h('h2', null, 'Comment jouer'),
      h('div', { class: 'qdepart' }, h('small', null, 'Question de départ'), h('b', null, JEU.questionDepart)),
      h('div', { class: 'regles', style: 'margin:0' }, REGLES.map(([t, d]) => h('div', { class: 'regle' }, h('b', null, t), d))),
      h('div', { class: 'actions' },
        h('button', { class: 'btn', type: 'button', onclick: fermerModal }, "C'est compris"),
        h('button', { class: 'btn second', type: 'button', onclick: () => { fermerModal(); C3.vue('ensemble'); } }, "Vue d'ensemble de la carte"),
        E && E.phase === 'port' ? h('button', { class: 'btn second', type: 'button', onclick: () => { fermerModal(); C3.vue('port', { port: E.port }); } }, 'Revenir au port') : null)
    ]);
  }

  /* ---------- Démarrage ---------- */
  function montrerJeu() {
    $('#ecran-intro').hidden = true; $('#hud').hidden = false; $('#legende').hidden = window.innerWidth < 760;
  }
  function afficherIntro() {
    const s = charger();
    const cont = $('#intro-contenu'); cont.innerHTML = '';
    const nom = h('input', { id: 'i-noms', autocomplete: 'off', placeholder: 'Prénom Nom (et ton binôme)' });
    const classe = h('input', { id: 'i-classe', autocomplete: 'off', placeholder: 'Ex. : 2de 4' });
    const go = h('button', { class: 'btn large', type: 'button', disabled: true, onclick: () => {
      E = etatInitial(); E.noms = nom.value.trim(); E.classe = classe.value.trim(); E.phase = 'port';
      sauver(); montrerJeu(); C3.reinitialiserEffets(); C3.placerGalere('venise'); afficherPort();
    } }, 'Embarquer à Venise');
    nom.addEventListener('input', () => { go.disabled = nom.value.trim().length < 2; });
    const carte = h('div', { class: 'carte-intro' },
      h('span', { class: 'niveau' }, JEU.niveau),
      h('h1', null, JEU.titre),
      h('p', { class: 'sous' }, JEU.sousTitre),
      h('div', { class: 'qdepart' }, h('small', null, 'Question de départ'), h('b', null, JEU.questionDepart)),
      h('div', { class: 'intro-texte' }, INTRO.map(t => h('p', null, t))),
      h('div', { class: 'regles' }, REGLES.map(([t, d]) => h('div', { class: 'regle' }, h('b', null, t), d))),
      h('div', { class: 'champs' }, h('div', { class: 'champ' }, h('label', { for: 'i-noms' }, 'Ton nom (et celui de ton binôme)'), nom), h('div', { class: 'champ' }, h('label', { for: 'i-classe' }, 'Classe'), classe)),
      go);
    if (s && s.phase && s.phase !== 'intro') {
      carte.append(h('div', { class: 'reprise' },
        h('span', null, 'Partie en cours : ', h('b', null, s.noms || 'sans nom'), ' — ' + (s.phase === 'fin' ? 'voyage terminé' : dateDe(s.jour) + ', ' + ORDRE_PORTS.filter(p => s.visites && s.visites[p]).length + '/' + ORDRE_PORTS.length + ' escales') + '.'),
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
    else if (E.phase === 'schema') { appliquerChroniqueJusqua(CHRONIQUE.length - 1); majHUD(); ouvrirSchema(); }
    else if (E.phase === 'fin') { majHUD(); ouvrirFin(); }
  }

  $('#b-carnet').addEventListener('click', ouvrirCarnet);
  $('#b-aide').addEventListener('click', ouvrirAide);

  try {
    C3.init($('#scene'), { surClicPort: clicPort });
  } catch (err) {
    document.body.innerHTML = '<div style="max-width:560px;margin:60px auto;padding:24px;font-family:system-ui;line-height:1.6"><h1 style="font-size:22px">La carte 3D ne peut pas s\'afficher</h1><p>Ce navigateur ne permet pas l\'affichage 3D (WebGL). Essaie avec une version récente de Chrome, Firefox, Edge ou Safari.</p></div>';
    throw err;
  }
  afficherIntro();
  window.__jeu = { etat: () => E };
})();
