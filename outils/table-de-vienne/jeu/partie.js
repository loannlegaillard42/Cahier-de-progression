const { chromium } = require('playwright');
const W = +(process.env.W || 1366), H = +(process.env.H || 768);
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: W, height: H }, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('console', m => { if (m.type() === 'error' && !/ERR_CERT|net::/.test(m.text())) errs.push(m.text()); });
  page.on('pageerror', e => errs.push('PAGEERROR ' + String(e)));
  const shot = async n => { await page.waitForTimeout(350); await page.screenshot({ path: 'captures/' + (process.env.P || '') + n + '.png' }); };
  const clic = async (sel, opts) => { await page.locator(sel).first().click(opts); await page.waitForTimeout(120); };
  const bouton = async txt => { await page.getByRole('button', { name: txt }).first().click(); await page.waitForTimeout(150); };
  await page.goto('file://' + process.cwd() + '/local.html');
  await page.waitForTimeout(800);
  await shot('01-intro');
  await page.fill('#i-noms', 'Camille Martin');
  await page.fill('#i-classe', '1re 3');
  await bouton('Entrer au congrès');
  await shot('02-europe1812');
  await page.locator('.question .choix button').nth(1).click();
  await shot('03-europe-reponse');
  await bouton('Septembre 1814 →');
  await shot('04-sept1814');
  await bouton('Entrer dans les salons de Vienne →');
  const n = await page.locator('.npc-btn').count();
  for (let i = 0; i < n; i++) {
    await page.locator('.npc-btn').nth(i).click();
    await page.waitForTimeout(150);
    const nb = await page.locator('#talk-choix button').count();
    for (let j = 0; j < nb - 1; j++) { await page.locator('#talk-choix button').nth(j).click(); await page.waitForTimeout(100); }
    if (i === 3) await shot('05-dialogue-tsar');
    await page.locator('#talk-fermer').click();
  }
  await shot('06-salons');
  await bouton('Remplir mon tableau « Qui veut quoi ? » →');
  // placement : volontairement une erreur au premier essai
  const exig = await page.evaluate(() => EXIGENCES.map(x => [x.texte, x.perso]));
  const nomsP = await page.evaluate(() => Object.fromEntries(PERSONNAGES.map(p => [p.id, p.nom])));
  for (const [i, [texte, perso]] of exig.entries()) {
    await page.locator('#ecran-activite .reserve .etiquette').filter({ hasText: texte }).first().click();
    const cible = i === 0 ? 'hardenberg' : perso;
    await page.locator('#ecran-activite .case').filter({ hasText: nomsP[cible] }).first().click();
  }
  await shot('07-exigences');
  await bouton('Vérifier');
  await shot('08-exigences-verif');
  // corriger : déplacer la première étiquette
  await page.locator('#ecran-activite .etiquette.ko').first().click();
  await page.locator('#ecran-activite .case').filter({ hasText: nomsP[exig[0][1]] }).first().click();
  await bouton('Vérifier');
  await bouton('Passer à la table des négociations →');
  await shot('09-table-s1');
  // séance 1 : choix qui déclenchent la crise
  await page.locator('.dossier').nth(0).click();
  await shot('10-dossier-pologne');
  await page.locator('.option').nth(0).click();
  await shot('11-pologne-choix');
  await bouton('Valider et revenir à la séance');
  await page.locator('.dossier').nth(1).click();
  await page.locator('.option').nth(0).click();
  await bouton('Valider et revenir à la séance');
  await bouton('Clore la séance →');
  await shot('12-crise');
  await bouton('Deuxième séance →');
  // séance 2
  const choixS2 = [1, 3, 0, 0, 2]; // rhin: France ; belgique: indépendante ; italie: républiques ; naples: Murat ; allemagne: unifiée
  for (let d = 0; d < 5; d++) {
    await page.locator('.dossier').nth(d).click();
    await page.locator('.option').nth(choixS2[d]).click();
    if (d === 4) await shot('13-allemagne-unifiee');
    await bouton('Valider et revenir à la séance');
  }
  await shot('14-table-s2');
  await bouton('Clore la séance →');
  for (let k = 0; k < 4; k++) { if (k === 2) await shot('15-centjours-murat'); await bouton('Suivant →'); }
  await shot('16-centjours-fin');
  await bouton('À Paris : la troisième séance →');
  await shot('17-table-s3');
  await page.locator('.dossier').nth(0).click();
  await page.locator('.option').nth(1).click();
  await bouton('Valider et revenir à la séance');
  await bouton('Signer le traité →');
  await shot('18-bilan');
  await page.locator('.ligne-bilan summary').first().click();
  await page.locator('.question .choix button').nth(1).click();
  await shot('19-bilan-reponse');
  await page.locator('#bascule button[data-vue="1815"]').click();
  await shot('20-bilan-1815');
  await page.locator('#bascule button[data-vue="jeu"]').click();
  await bouton('Continuer : après le congrès →');
  const affs = await page.locator('.aff').count();
  for (let a = 0; a < affs; a++) { await page.locator('.aff').nth(a).locator('button').nth(a % 3).click(); }
  await shot('21-alliances');
  await bouton('Compléter le tableau de ma fiche →');
  const tab = await page.evaluate(() => TABLEAU.etiquettes.map(x => [x.texte, TABLEAU.lignes.find(l => l.id === x.ligne).titre]));
  for (const [texte, ligne] of tab) {
    await page.locator('#ecran-activite .reserve .etiquette').filter({ hasText: texte }).first().click();
    await page.locator('#ecran-activite .case').filter({ hasText: ligne }).first().click();
  }
  await bouton('Vérifier');
  await shot('22-tableau');
  await bouton("Continuer : l'ordre de 1815 à l'épreuve →");
  const nbc = await page.evaluate(() => CHRONIQUE.length);
  for (let c = 0; c < nbc; c++) {
    await page.locator('.question .choix button').nth(c % 3).click();
    if (c === 4) await shot('23-chronique-chios');
    if (c === nbc - 1) { await shot('24-chronique-1848'); await bouton('Construire mon plan →'); }
    else await bouton('Suivant →');
  }
  await shot('25-redaction');
  await page.fill('#redaction', ('L’ordre de Metternich repose sur l’équilibre et la légitimité. Il est défendu par la Sainte-Alliance et les congrès, mais il est contesté par les libéraux et les nationalistes, en 1830 puis en 1848, quand Metternich doit fuir Vienne. ').repeat(2));
  await bouton('Terminer : voir mon carnet →');
  await shot('26-fin');
  await page.locator('#ecran-fin').evaluate(el => el.scrollTo(0, 900));
  await shot('27-fin-cartes');
  // code de reprise
  const code = await page.evaluate(() => 'TV1-' + btoa(unescape(encodeURIComponent(localStorage.getItem('table-vienne-v1')))));
  await page.evaluate(() => localStorage.clear());
  await page.reload(); await page.waitForTimeout(700);
  await page.locator('.reprise-code summary').click();
  await page.fill('#i-code', code);
  await bouton('Reprendre la partie');
  const ph = await page.evaluate(() => window.__jeu.etat().phase);
  console.log('reprise par code -> phase', ph, '| longueur du code', code.length);
  console.log(errs.length ? 'ERREURS :\n' + errs.join('\n') : 'aucune erreur JS');
  await b.close();
})().catch(e => { console.error('ÉCHEC', e); process.exit(1); });
