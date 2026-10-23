// Filme le jeu image par image (rendu déterministe) et produit site/videos/iteration-XXX.mp4
// Usage : node tools/record.mjs [--seed 7] [--out chemin.mp4] [--smoke]
//  --smoke : ne fait que charger le jeu, jouer 20 s en accéléré et vérifier qu'aucune erreur JS ne survient.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { ensureFonts } from './fonts.mjs';

ensureFonts();

const args = process.argv.slice(2);
const arg = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const SMOKE = args.includes('--smoke');
const SEED_ARG = arg('seed', null);
const ROOT = path.resolve('site');
const FPS = 30;

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.mp4': 'video/mp4' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

// Navigateur : celui du conteneur s'il existe, sinon celui installé par `npx playwright install chromium`
const candidates = [process.env.CHROMIUM_PATH, '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'].filter(Boolean);
const executablePath = candidates.find(p => fs.existsSync(p));
const browser = await chromium.launch({ executablePath, args: ['--disable-gpu', '--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

async function load(seed) {
  await page.goto(`http://127.0.0.1:${port}/index.html?capture=1&seed=${seed}`);
  await page.waitForFunction(() => window.__cap);
  await page.evaluate(() => window.__cap.ready);
}
// Coups de pouce du montage, appliqués à l'identique en simulation et au tournage.
// Chaque étape : `skip` secondes jouées sans filmer, une action éventuelle dans la page, un sous-titre, puis `play` secondes filmées.
// Montage (itération 15, « Le cahier de vacances ») : on ouvre directement le troisième cahier (chapitre VIII). Un labyrinthe
// s'imprime à 0:08 et le pilote le traverse (les murs l'arrêtent, les ratures passent par-dessus) ; on montre ensuite les
// ratures d'été vers 1:30, puis le Grand Soleil à 3:00 : rayons, marée et bouée, coucher de soleil.
// le montage : le bureau, une goutte qui saute d'onglet en onglet, trois pages ouvertes, puis le Grand Soleil
// Montage (itération 17, « La rentrée ») : le bureau accueille un quatrième cahier, puis on ouvre le chapitre IX. À 0:08,
// l'ardoise pose sa première multiplication et le pilote touche la bonne bulle ; on montre les ratures de calcul vers 1:30,
// puis le Boulier à 3:00 : perles, billes et table de Pythagore.
// Montage (itération 19, « La récré ») : le cahier neuf a une page de plus, on ouvre le chapitre X. À 0:08, la première
// marelle se dessine et le pilote saute de la Terre au Ciel ; les ratures de récré vers 1:30, puis le Grand Sifflet à 3:00
// (ondes, balle au prisonnier, « un, deux, trois… soleil ! »), et la nouvelle page du bestiaire.
// Montage (itération 20, « Le cahier de poésie ») : un cinquième cahier arrive sur le bureau, on ouvre le chapitre XI. À 0:08,
// les fiches des rimes sont distribuées face cachée et le pilote les retourne deux par deux jusqu'au poème complet ; les
// ratures de poésie vers 1:40 (le corbeau et son fromage), puis le Grand Alexandrin à 3:00 (douze pieds, rimes croisées, césure).
// Montage (itération 21, « Le cahier de textes ») : un sixième cahier arrive sur le bureau, on ouvre le chapitre XII. Le premier
// devoir s'écrit à 0:03 et le pilote coche sa case ; deux sonneries forcées montrent la matière qui change (ratures et musique),
// les réveils et les cocottes vers 1:30, puis la Grande Horloge à 3:00 (aiguilles, douze heures, sonnerie).
// Montage (itération 22, « La perforatrice ») : la page des rares a une case vide, puis le devoir du jour au brouillon avec la
// consigne « Feuille perforée » : la perforatrice arrive à 0:20, saute, troue la page, les ratures tombent dans les trous ;
// biffée, sa dernière perforation en fait tomber toute une foule. Elle revient vers 1:20, puis le Stylo Rouge à 3:00.
const STEPS = [
  { act: () => { const c = window.__cap; c.debloque(12); c.croque(['boss', 'fausse', 'regle', 'pieuvre', 'paraphe', 'cartable', 'stylo', 'soleil', 'boulier', 'sifflet', 'alexandrin', 'photocopieuse', 'agrafeuse', 'gribouillis', 'croche', 'segment', 'mouette', 'delie', 'marbrure', 'trombone', 'cafe', 'coquillage', 'chiffre', 'fois', 'calot', 'toupie', 'ver', 'rime']); c.bestiaire(13); },
    cap: ['Au bestiaire, la page des rares a encore une case vide…'], play: 3 },
  { act: s => { window.__cap.refermer(); window.__cap.devoir({ chapter: 7, consigne: 'perfore', pouce: 'pluie', seed: s }); }, arg: s => s,
    cap: ['Le devoir du jour, au brouillon. Consigne : « Feuille perforée »'], play: 4 },
  { skip: 15, play: 5 },
  { cap: ['La perforatrice saute sur la goutte… et troue la page !'], play: 7 },
  { cap: ['Par les trous, on voit le pupitre. Les ratures qui marchent dessus tombent à travers !'], play: 9, need: r => r.tombees >= 3 },
  { cap: ['Biffe-la : sa dernière perforation fait tomber toutes les ratures autour d’elle'], play: 12, need: r => r.perfoKills >= 1 },
  { skip: 30, cap: ['Feuille perforée : elle revient toujours…'], play: 6 }
];
const BOSS_AT = 180, BOSS_FILM = 18;   // le Stylo Rouge arrive à 3:00 ; secondes de combat filmées au plus (la suite est sautée)
const argOf = (st, s) => st.arg ? st.arg(s) : undefined;
// Joue tout le montage en accéléré (sans filmer) pour savoir comment se termine la partie avec la graine s
async function simulate(s) {
  await load(s);
  let ok = true;
  for (const st of STEPS) {
    await page.evaluate(n => window.__cap.skip(n), st.skip || 0); if (st.act) await page.evaluate(st.act, argOf(st, s)); await page.evaluate(n => window.__cap.skip(n), st.play);
    if (st.need && !st.need(await page.evaluate(() => window.__cap.state()))) ok = false;
  }
  const r = await page.evaluate(() => { for (let i = 0; i < 320; i++) { window.__cap.skip(1); const r = window.__cap.state(); if (r.state === 'victory' || r.state === 'gameover') return r; } return window.__cap.state(); });
  return { ...r, ok };
}
// une bonne graine : un devoir coché à l'écran, puis la Grande Horloge tombe avant la fin du tournage
const good = r => r.ok && r.state === 'victory' && r.chapter === 7 && r.t <= BOSS_AT + 75;
let SEED = SEED_ARG ? parseInt(SEED_ARG, 10) : null;
if (SEED === null && !SMOKE) {
  let best = null;
  for (const s of [42, 7, 5, 99, 3, 11, 23, 64, 1, 8, 13, 21]) {
    const r = await simulate(s);
    console.log(`graine ${s} : ${r.state} à ${r.t.toFixed(0)} s (chapitre ${r.chapter}, niveau ${r.level}, ${r.hp} cœur(s), ${r.perfos} perforation(s), ${r.tombees} rature(s) tombée(s), ${r.perfoKills} perforatrice(s) biffée(s))`);
    const score = x => (good(x) ? 1e6 : 0) + (x.ok ? 1e5 : 0) + (x.state === 'victory' ? 5e4 - x.t : x.t);
    if (!best || score(r) > score(best.r)) best = { s, r };
    if (good(r)) break;
  }
  SEED = best.s;
}
await load(SMOKE ? 42 : SEED);
const meta = await page.evaluate(() => window.__cap.meta);
const fail = msg => { console.error('ÉCHEC : ' + msg); if (errors.length) console.error(errors.join('\n')); process.exitCode = 1; };

if (SMOKE) {
  await page.evaluate(() => { window.__cap.start(); window.__cap.skip(20); window.__cap.frames(3); window.__cap.start(2); window.__cap.skip(20); window.__cap.frames(3); window.__cap.start(3); window.__cap.skip(30); window.__cap.frames(3); window.__cap.start(4); window.__cap.skip(30); window.__cap.frames(3); window.__cap.start(5); window.__cap.skip(40); window.__cap.frames(3); window.__cap.grant({ PLUME: 2, ENCRE: 2, GUILLEMETS: 2, ITALIQUE: 2, LUNE: 2, FEU: 2, CALLIGRAPHIE: 1, CITATION: 1, LUNE_ROUSSE: 1 }); window.__cap.skip(15); window.__cap.frames(3); window.__cap.start(6); window.__cap.skip(100); window.__cap.frames(3); window.__cap.skip(90); window.__cap.frames(3); window.__cap.start(7); window.__cap.skip(100); window.__cap.frames(3); window.__cap.skip(100); window.__cap.frames(3); window.__cap.start(9); window.__cap.skip(12); window.__cap.frames(3); window.__cap.skip(170); for (let i = 0; i < 12; i++) { window.__cap.skip(1.5); window.__cap.frames(1); } window.__cap.bestiaire(9); window.__cap.frames(3); window.__cap.start(8); window.__cap.skip(12); window.__cap.frames(3); window.__cap.skip(90); window.__cap.frames(3); window.__cap.skip(95); for (let i = 0; i < 12; i++) { window.__cap.skip(1.5); window.__cap.frames(1); } window.__cap.bestiaire(8); window.__cap.frames(3); window.__cap.start(3); window.__cap.skip(10); window.__cap.photocopie(); for (let i = 0; i < 12; i++) { window.__cap.skip(1); window.__cap.frames(1); } window.__cap.agrafeuse(); for (let i = 0; i < 20; i++) { window.__cap.skip(1); window.__cap.frames(1); } window.__cap.perforatrice(); for (let i = 0; i < 16; i++) { window.__cap.skip(1); window.__cap.frames(1); } window.__cap.bestiaire(13); window.__cap.frames(3); window.__cap.feuilleter(1); window.__cap.frames(3); window.__cap.refermer(); window.__cap.start(7); window.__cap.skip(150); for (let i = 0; i < 10; i++) { window.__cap.skip(1); window.__cap.frames(1); } window.__cap.bestiaire(7); window.__cap.frames(3); window.__cap.feuilleter(1); window.__cap.frames(3); window.__cap.refermer();
    window.__cap.start(10); window.__cap.skip(14); window.__cap.frames(3); window.__cap.skip(60); window.__cap.frames(3); window.__cap.sifflet(); for (let i = 0; i < 16; i++) { window.__cap.skip(1); window.__cap.frames(1); } window.__cap.skip(60); window.__cap.frames(2); window.__cap.bestiaire(10); window.__cap.frames(3); window.__cap.feuilleter(1); window.__cap.frames(2); window.__cap.refermer();
    window.__cap.start(11); window.__cap.skip(14); window.__cap.frames(3); window.__cap.skip(95); window.__cap.frames(3); window.__cap.patron(); for (let i = 0; i < 16; i++) { window.__cap.skip(1); window.__cap.frames(1); } window.__cap.skip(60); window.__cap.frames(2); window.__cap.bestiaire(11); window.__cap.frames(3); window.__cap.feuilleter(1); window.__cap.frames(2); window.__cap.refermer();
    window.__cap.start(12); window.__cap.skip(12); window.__cap.frames(3); window.__cap.sonnerie(); window.__cap.skip(20); window.__cap.frames(3); window.__cap.sonnerie(); window.__cap.skip(70); window.__cap.frames(3); window.__cap.patron(); for (let i = 0; i < 20; i++) { window.__cap.skip(1); window.__cap.frames(1); } window.__cap.skip(60); window.__cap.frames(2); window.__cap.bestiaire(12); window.__cap.frames(3); window.__cap.feuilleter(1); window.__cap.frames(2); window.__cap.refermer();
    window.__cap.debloque(12); window.__cap.pages({ 1: { w: 2, t: 200 } }); window.__cap.bureau(); window.__cap.frames(3); for (let i = 0; i < 12; i++) { window.__cap.choisir(1); window.__cap.frames(2); } window.__cap.bureau(5); window.__cap.commencer(); window.__cap.skip(5); window.__cap.frames(2); window.__cap.debloque(1); window.__cap.bureau(4); window.__cap.commencer(); window.__cap.frames(2); window.__cap.bureau(); window.__cap.choisir(-1); window.__cap.commencer(); window.__cap.skip(5); window.__cap.frames(2);
    for (const [chapter, consigne, pouce] of [[1, 'miroir', 'pluie'], [1, 'sansPate', 'propre'], [4, 'courant', 'pluie'], [2, 'brouillard', 'souffle'], [6, 'double', 'aimant'], [3, 'presse', 'souffle'], [5, 'fragile', 'propre'], [7, 'courant', 'aimant'], [8, 'miroir', 'pluie'], [9, 'double', 'souffle'], [10, 'sansPate', 'aimant'], [11, 'courant', 'pluie'], [12, 'presse', 'propre'], [3, 'perfore', 'pluie'], [11, 'perfore', 'souffle']]) {
      window.__cap.devoir({ chapter, consigne, pouce, seed: chapter }); window.__cap.skip(25); window.__cap.frames(2);
    }
    window.__cap.jour(null); window.__cap.devoir(); for (let i = 0; i < 300 && !['victory', 'gameover'].includes(window.__cap.state().state); i++) window.__cap.skip(1);
    window.__cap.skip(3); window.__cap.frames(2); window.__cap.title(); window.__cap.frames(2); });
  const st = await page.evaluate(() => window.__cap.state());
  console.log('smoke :', JSON.stringify(st));
  if (errors.length) fail('erreurs JavaScript'); else console.log('OK, aucune erreur.');
  await browser.close(); server.close();
  process.exit();
}

const out = arg('out', path.join(ROOT, 'videos', `iteration-${String(meta.iteration).padStart(3, '0')}.mp4`));
fs.mkdirSync(path.dirname(out), { recursive: true });
const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '28', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
const ffDone = new Promise(r => ff.on('close', r));
let total = 0;
async function grab(seconds) {
  let n = Math.round(seconds * FPS);
  while (n > 0) {
    const k = Math.min(15, n); n -= k;
    const frames = await page.evaluate(k => window.__cap.frames(k), k);
    for (const f of frames) { const ok = ff.stdin.write(Buffer.from(f.slice(f.indexOf(',') + 1), 'base64')); if (!ok) await new Promise(r => ff.stdin.once('drain', r)); }
    total += k;
  }
}
const state = () => page.evaluate(() => window.__cap.state());
const cap = (t, d) => page.evaluate(([t, d]) => window.__cap.caption(t, d), [t, d]);

/* ---------- Le « montage » : à adapter à chaque itération pour montrer les nouveautés ---------- */
console.log(`Tournage de l'itération ${meta.iteration} : « ${meta.title} » (graine ${SEED})`);
await page.evaluate(() => window.__cap.title());
await cap(`Itération ${meta.iteration} : ${meta.title}`, 3.4);
await grab(3.6);
for (const step of STEPS) {
  if (step.skip) await page.evaluate(n => window.__cap.skip(n), step.skip);
  if (step.act) await page.evaluate(step.act, argOf(step, SEED));
  for (const c of [].concat(step.cap || [])) await cap(c, 4);
  await grab(step.play);
}
let st = await state();
// avance rapide jusqu'au patron (le pilote joue vraiment, on ne filme simplement pas)
while (st.state !== 'gameover' && st.state !== 'victory' && st.t < BOSS_AT - 4) {
  await page.evaluate(() => { window.__cap.skip(1); const s = window.__cap.state(); if (s.state === 'levelup') window.__cap.skip(1.5); });
  st = await state();
}
if (st.state !== 'gameover' && st.state !== 'victory') {
  await cap('… 3:00 : le Stylo Rouge vient corriger la copie !', 2.6);
  await cap('Les trous de la perforatrice, eux, sont toujours là…', 4);
  for (let i = 0; i < BOSS_FILM && st.state !== 'victory' && st.state !== 'gameover'; i++) { await grab(1); st = await state(); }
  if (st.state !== 'victory' && st.state !== 'gameover') {   // la fin du combat est sautée, pour que la vidéo reste courte
    await page.evaluate(() => { for (let i = 0; i < 300; i++) { const s = window.__cap.state(); if (s.state === 'victory' || s.state === 'gameover') break; window.__cap.skip(0.5); } });
    st = await state();
  }
}
// la copie notée compte les ratures tombées, puis la page des rares du bestiaire
if (st.state === 'victory' || st.state === 'gameover') await grab(6.5);
else await grab(1);
await page.evaluate(() => window.__cap.bestiaire(13));
await cap('Au bestiaire : la page des rares est complète', 3);
await grab(3.4);
await page.evaluate(() => window.__cap.refermer());
// retour à l'écran titre
await page.evaluate(() => window.__cap.title());
await cap('Le cahier continue : la suite s’écrit dans douze heures', 3.4);
await grab(3.6);
/* ---------------------------------------------------------------------------------------------- */

ff.stdin.end();
await ffDone;
// bande-son : le synthé du jeu rejoue tous les sons de la capture, hors ligne
const dur = total / FPS;
try {
  const wav = await page.evaluate(d => window.__cap.audio(d), dur);
  const wavPath = out.replace(/\.mp4$/, '.wav'), tmp = out.replace(/\.mp4$/, '.tmp.mp4');
  fs.writeFileSync(wavPath, Buffer.from(wav, 'base64'));
  fs.renameSync(out, tmp);
  await new Promise((res, rej) => spawn('ffmpeg', ['-y', '-loglevel', 'error', '-i', tmp, '-i', wavPath, '-c:v', 'copy', '-af', `volume=8dB,alimiter=limit=0.9,afade=t=in:d=0.5,afade=t=out:st=${Math.max(0, dur - 2.5)}:d=2.5`, '-c:a', 'aac', '-b:a', '128k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' }).on('close', c => c === 0 ? res() : rej(new Error('mux ' + c))));
  fs.unlinkSync(tmp); fs.unlinkSync(wavPath);
} catch (e) { console.warn('Bande-son ignorée : ' + e.message); }
await browser.close(); server.close();
console.log(`Vidéo : ${out} (${(total / FPS).toFixed(1)} s, ${(fs.statSync(out).size / 1e6).toFixed(1)} Mo) · fin de partie : ${st.state} à ${st.t.toFixed(0)} s, niveau ${st.level}`);
if (errors.length) fail('erreurs JavaScript pendant le tournage');
