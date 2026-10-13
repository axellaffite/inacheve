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
// Coups de pouce du montage (itération 4 : le refrain du chapitre II), appliqués à l'identique en simulation et au tournage.
// Chaque étape : `skip` secondes jouées sans filmer, une action éventuelle dans la page, un sous-titre, puis `play` secondes filmées.
// On saute la fin du chapitre I : le pilote reçoit les mots d'une partie avancée, puis la page se tourne.
// La première lettrine s'écrit 8 s après le début du chapitre V : l'étape `enlu` doit la montrer dorée et illuminée.
// Montage (itération 8) : les chapitres I à IV en coup de vent, puis la page de calligraphie, sa lettrine, ses arabesques,
// le Grand Paraphe, et la nouvelle page du bestiaire.
const STEPS = [
  // le bestiaire d'un joueur qui a déjà traversé les quatre premiers chapitres ; la page du chapitre V se remplit pendant le film
  { act: () => window.__cap.croque(['gribouillis', 'gouttelette', 'biffure', 'tache', 'gomme', 'boss', 'croche', 'soupir', 'metronome', 'fausse', 'segment', 'equerre', 'compas', 'rapporteur', 'regle', 'mouette', 'crabe', 'tourbillon', 'bouteille', 'pieuvre']), play: 3 },
  { cap: ['… une Grande Rature plus tard : chapitre II'], act: () => {
    window.__cap.grant({ ENCRE: 4, VIRGULE: 4, GUILLEMETS: 3, LUNE: 3, ECHO: 2, POINT: 3, FEU: 2, PLUME: 2, POINT_VIRGULE: 1, ECHO_DE_LUNE: 1, POINT_DE_FEU: 1 });
    window.__cap.level(22); window.__cap.turn();
  }, play: 1.9 },
  { cap: ['… chapitre III'], act: () => { window.__cap.level(34); window.__cap.turn(); }, play: 1.9 },
  { cap: ['… chapitre IV'], act: () => { window.__cap.level(46); window.__cap.turn(); }, play: 1.9 },
  { cap: ['… une Pieuvre-Buvard plus tard : chapitre V, la page de calligraphie !'], act: () => {
    window.__cap.grant({ ENCRE: 5, VIRGULE: 5, GUILLEMETS: 4, LUNE: 5, ECHO: 4, POINT: 5, FEU: 4, PLUME: 4, ITALIQUE: 3, SOUFFLE: 2, AIMANT: 2, PLUME_AU_VENT: 1, POINT_VIRGULE: 1, ECHO_DE_LUNE: 1, POINT_DE_FEU: 1 });
    window.__cap.level(55); window.__cap.turn();
  }, play: 7 },
  { enlu: true, play: 12 },
  { skip: 40, cap: ['L’encre fraîche des arabesques brûle : ne marche pas dessus !'], play: 5 }
];
const BOSS_FILM = 40;   // secondes de combat filmées au plus contre le Grand Paraphe
// Joue une partie entière en accéléré (sans filmer) pour savoir comment elle se termine
async function simulate(seed) {
  await load(seed);
  await page.evaluate(() => window.__cap.start());
  let sung = 0;
  for (const st of STEPS) {
    await page.evaluate(n => window.__cap.skip(n), st.skip || 0); if (st.act) await page.evaluate(st.act); await page.evaluate(n => window.__cap.skip(n), st.play);
    if (st.enlu) sung = (await page.evaluate(() => window.__cap.state())).enlus;
  }
  const end = await page.evaluate(() => { for (let i = 0; i < 320; i++) { window.__cap.skip(1); const s = window.__cap.state(); if (s.state === 'victory' || s.state === 'gameover') return s; } return window.__cap.state(); });
  return { ...end, sung };
}
// une bonne graine : la lettrine s'illumine à l'écran, et le Grand Paraphe tombe pendant qu'on filme encore
const good = r => r.sung >= 1 && r.state === 'victory' && r.chapter === 5 && r.t <= 176 + BOSS_FILM - 2;
let SEED = SEED_ARG ? parseInt(SEED_ARG, 10) : null;
if (SEED === null && !SMOKE) {
  // on cherche une partie qui va jusqu'à la victoire, pour montrer tout le chapitre
  let best = null;
  for (const s of [42, 7, 5, 99, 3, 11, 23, 64, 1, 8, 13, 21]) {
    const r = await simulate(s);
    console.log(`graine ${s} : ${r.state} au chapitre ${r.chapter}, à ${r.t.toFixed(0)} s (niveau ${r.level}, lettrine filmée : ${r.sung ? 'oui' : 'non'}, ${r.enlus} lettrine(s))`);
    const score = x => (good(x) ? 1e6 : 0) + (x.sung ? 2e5 : 0) + (x.state === 'victory' ? 1e5 - x.t : x.t);
    if (!best || score(r) > score(best.r)) best = { s, r };
    if (good(r)) break;
  }
  SEED = best.s;
}
await load(SEED ?? 42);
const meta = await page.evaluate(() => window.__cap.meta);
const fail = msg => { console.error('ÉCHEC : ' + msg); if (errors.length) console.error(errors.join('\n')); process.exitCode = 1; };

if (SMOKE) {
  await page.evaluate(() => { window.__cap.start(); window.__cap.skip(20); window.__cap.frames(3); window.__cap.start(2); window.__cap.skip(20); window.__cap.frames(3); window.__cap.start(3); window.__cap.skip(30); window.__cap.frames(3); window.__cap.start(4); window.__cap.skip(30); window.__cap.frames(3); window.__cap.start(5); window.__cap.skip(40); window.__cap.frames(3); });
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
console.log(`Tournage de l'itération ${meta.iteration} : « ${meta.title} »`);
await page.evaluate(() => window.__cap.title());
await grab(3);
await page.evaluate(() => window.__cap.start());
await cap(`Itération ${meta.iteration} : ${meta.title}`, 3.2);
for (const step of STEPS) {
  if (step.skip) await page.evaluate(n => window.__cap.skip(n), step.skip);
  if (step.act) await page.evaluate(step.act);
  for (const c of [].concat(step.cap || [])) await cap(c, 4);
  await grab(step.play);
}
let st = await state();
// avance rapide jusqu'au boss (le pilote joue vraiment, on ne filme simplement pas)
while (st.state !== 'gameover' && st.state !== 'victory' && st.t < 176) {
  await page.evaluate(() => { window.__cap.skip(1); const s = window.__cap.state(); if (s.state === 'levelup') window.__cap.skip(1.5); });
  st = await state();
}
if (st.state !== 'gameover') {
  await cap('… trois minutes plus tard, le Grand Paraphe …', 2.6);
  for (let i = 0; i < BOSS_FILM && st.state !== 'victory' && st.state !== 'gameover'; i++) { await grab(1); st = await state(); }
}
await grab(st.state === 'victory' || st.state === 'gameover' ? 4 : 1);
// le bestiaire : sa nouvelle page, celle du chapitre V, remplie pendant la partie
await page.evaluate(() => window.__cap.bestiaire(5));
await cap('Le bestiaire a une nouvelle page', 3);
await grab(3.6);
await page.evaluate(() => window.__cap.feuilleter(-1)); await grab(1.6);
await cap('La suite s’écrit dans douze heures…', 2.6);
await grab(2.4);
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
