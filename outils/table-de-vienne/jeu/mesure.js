// Mesure de fluidité avec un processeur bridé (Chromebook d'entrée de gamme simulé)
const { chromium } = require('playwright');
const fichier = process.argv[2] || 'local.html';
const RATE = +(process.env.RATE || 6);
(async () => {
  const b = await chromium.launch();
  const page = await b.newPage({ viewport: { width: 1366, height: 768 } });
  await page.goto('file://' + process.cwd() + '/' + fichier);
  await page.waitForTimeout(600);
  // partie en cours : première séance de négociation (carte hachurée, animations actives)
  await page.evaluate(() => localStorage.setItem('table-vienne-v1', JSON.stringify({ v: 1, phase: 'table', etape: 'apres', noms: 'Test', classe: '', seance: 0, choix: {}, choixEleve: {}, forces: {}, rencontres: {}, sujetsVus: {}, exig: {}, alliances: {}, tab: {}, chro: {}, chroEtape: 0, cj: 0, q1812: 1, exigEssais: 0, tabEssais: 0, exigScore: null, tabScore: null, bilanRep: null, redaction: '', vue: 'jeu', ouvert: null, crise: null })));
  await page.reload(); await page.waitForTimeout(500);
  await page.getByRole('button', { name: 'Reprendre', exact: true }).click();
  await page.waitForTimeout(1200);
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: RATE });
  await cdp.send('Performance.enable');
  const tache = async () => { const m = await cdp.send('Performance.getMetrics'); return Object.fromEntries(m.metrics.map(x => [x.name, x.value])); };
  // 1) au repos pendant 3 s : temps CPU consommé (animations)
  let m0 = await tache(); await page.waitForTimeout(3000); let m1 = await tache();
  const repos = ((m1.TaskDuration - m0.TaskDuration) / 3 * 100).toFixed(0);
  // 2) glisser la carte : intervalles entre images
  const box = await page.locator('#carte').boundingBox();
  await page.evaluate(() => { window.__f = []; let t = performance.now(); const f = n => { window.__f.push(n - t); t = n; if (window.__f.length < 400) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  for (let i = 0; i < 40; i++) await page.mouse.move(box.x + box.width / 2 - i * 8, box.y + box.height / 2 - i * 3);
  await page.mouse.up();
  await page.waitForTimeout(400);
  const glisser = await page.evaluate(() => { const f = window.__f.slice(2); f.sort((a, b) => a - b); return { images: f.length, mediane: f[Math.floor(f.length / 2)].toFixed(0), p90: f[Math.floor(f.length * .9)].toFixed(0), pire: f[f.length - 1].toFixed(0) }; });
  // 3) molette : 12 crans de zoom
  await page.evaluate(() => { window.__f = []; let t = performance.now(); const f = n => { window.__f.push(n - t); t = n; if (window.__f.length < 400) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const t0 = Date.now();
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, -120); await page.waitForTimeout(30); }
  await page.waitForTimeout(500);
  const molette = await page.evaluate(() => { const f = window.__f.slice(2); f.sort((a, b) => a - b); return { mediane: f[Math.floor(f.length / 2)].toFixed(0), p90: f[Math.floor(f.length * .9)].toFixed(0), pire: f[f.length - 1].toFixed(0) }; });
  // 4) clic sur un dossier : temps jusqu'à l'affichage
  const t1 = await page.evaluate(() => new Promise(res => { const t = performance.now(); document.querySelector('.dossier').click(); requestAnimationFrame(() => requestAnimationFrame(() => res((performance.now() - t).toFixed(0)))); }));
  console.log(`[${fichier}] CPU x${RATE} | au repos : ${repos} % d'un cœur | glisser (ms/image) méd ${glisser.mediane} p90 ${glisser.p90} pire ${glisser.pire} | molette méd ${molette.mediane} p90 ${molette.p90} pire ${molette.pire} | ouvrir un dossier ${t1} ms`);
  await b.close();
})();
