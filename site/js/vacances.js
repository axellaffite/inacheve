// Chapitre VIII : le cahier de vacances. Troisième cahier, tout en couleurs : jeux à faire avant la rentrée.
// Ratures d'été : le coquillage qui roule, le pointillé (un serpent de points à relier), le ballon de plage qui rebondit
// et le cornet de glace qui lance sa boule. Au bout : le Grand Soleil, ses rayons, la marée et le coucher de soleil.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const NOTES_VAC = [
  { x: WORLD.w / 2, y: -150, t: '— cahier n° 3 · chapitre VIII : le cahier de vacances —', r: -0.02 },
  { x: WORLD.w * 0.72, y: -96, t: 'ajouté : un cahier de vacances (à finir avant la rentrée)', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'la rentrée ?', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'les corrigés', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'sont à la fin', r: -0.05 },
  { x: -160, y: WORLD.h * 0.45 + 88, t: '(ne pas tricher)', r: -0.04 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'pense à la crème solaire', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: 'une page par jour, c’est promis', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'par où on sort ?', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'il reste du sable', r: 0.05 },
  { x: WORLD.w * 0.3, y: -96, t: 'deuxième cahier : plein aussi', r: -0.02 }
];
const DICTEES_VAC = ['ÉTÉ', 'PLAGE', 'SABLE', 'VAGUE', 'SOLEIL', 'BALADE', 'PARASOL', 'VACANCES', 'COQUILLAGE', 'LABYRINTHE'];
const VAC_TYPES = new Set(['coquillage', 'pointille', 'ballon', 'cornet']);
Object.assign(ETYPES, {
  coquillage: { r: 15, hp: 4, speed: 122, dmg: 1, xp: 1, agil: 4 },
  pointille:  { r: 14, hp: 12, speed: 92, dmg: 1, xp: 4, agil: 3 },
  ballon:     { r: 22, hp: 20, speed: 58, dmg: 1, xp: 5, agil: 2 },
  cornet:     { r: 18, hp: 22, speed: 66, dmg: 1, xp: 6, agil: 2.5 },
  soleil:     { r: 72, hp: 1250, speed: 44, dmg: 2, xp: 200, agil: 1.2, boss: true }
});

CHAPTERS.push({
  num: 'VIII', name: 'Le cahier de vacances', done: 'Vacances : finies… ou presque !', paper: 'vacances', notes: NOTES_VAC, dictees: DICTEES_VAC,
  intro: 'Chapitre VIII : le cahier de vacances. Une page de jeux, à finir avant la rentrée !', boss: 'soleil', bossName: 'Le Grand Soleil',
  bossIntro: 'Il fait de plus en plus chaud… le Grand Soleil se lève !', bossBack: 'Le Grand Soleil se relève.', bossSound: 'boss8',
  scale: 44, rateOff: 230, rateCap: 20.5, waveCap: 'Une marée de coquillages !',
  meet: {
    coquillage: 'Nouveau : le coquillage, qui roule par à-coups',
    pointille: 'Nouveau : le pointillé. Ne touche pas ses points : seule sa tête craint tes gouttes !',
    ballon: 'Nouveau : le ballon de plage. Il vise, puis rebondit partout !',
    cornet: 'Nouveau : le cornet de glace. Sa boule tombe là où tu vas !'
  },
  pick(t, r) {   // pas plus de trois cornets ni de trois ballons à la fois
    if (t > 90 && r < 0.07 && countType('cornet') < 3) return 'cornet';
    if (t > 50 && r < 0.13 && countType('ballon') < 3) return 'ballon';
    return t > 25 && r < 0.23 && countType('pointille') < 8 ? 'pointille' : 'coquillage';
  },
  wave(t, i) { return t > 70 && i % 6 === 0 ? 'pointille' : 'coquillage'; }
});

/* ---------- La page : des exercices imprimés en couleurs, un peu partout ---------- */
const EXO_COLORS = ['#4fb3c8', '#f19a3e', '#e9739b', '#6cbf6a', '#9b7fd1'];
const EXO_KINDS = [
  ['points', 'Relie les points de 1 à 12'], ['mots', 'Mots croisés'], ['colorie', 'Colorie le dessin'], ['diff', 'Trouve les différences'],
  ['calcul', 'Calcul mental'], ['devinette', 'Devinette'], ['points', 'Relie les points'], ['colorie', 'Colorie les vagues']
];
const DEVINETTES = ['Je suis plein de trous, et pourtant je tiens l’eau. Qui suis-je ?', 'Plus je sèche, plus je suis mouillée. Qui suis-je ?', 'Je monte et je descends sans bouger. Qui suis-je ?'];
const EXOS = (() => {
  const r = mulberry32(1515), out = [], cols = 6, rows = 4, cw = WORLD.w / cols, rh = WORLD.h / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    if (r() < 0.22) continue;
    const k = EXO_KINDS[Math.floor(r() * EXO_KINDS.length)], w = 290 + r() * 70, h = 210 + r() * 40;
    out.push({ kind: k[0], title: 'Exercice ' + (out.length + 1) + ' : ' + k[1], color: EXO_COLORS[Math.floor(r() * EXO_COLORS.length)],
      x: i * cw + (cw - w) / 2 + (r() - 0.5) * 60, y: j * rh + (rh - h) / 2 + (r() - 0.5) * 50, w, h, rot: (r() - 0.5) * 0.06, k: Math.floor(r() * 1000),
      text: DEVINETTES[Math.floor(r() * DEVINETTES.length)], a: 2 + Math.floor(r() * 7), b: 2 + Math.floor(r() * 7) });
  }
  return out;
})();
function drawVacances(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = 'rgba(255,226,150,0.14)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // un papier qui a pris le soleil
  ctx.strokeStyle = 'rgba(110,170,215,0.32)'; ctx.lineWidth = 1.2 / ZOOM; ctx.beginPath();   // lignes simples
  for (let y = Math.ceil(y0 / 48) * 48; y <= y1; y += 48) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
  ctx.stroke();
  ctx.strokeStyle = C.margin; ctx.globalAlpha = 0.7; ctx.lineWidth = 2.2 / ZOOM; ctx.beginPath(); ctx.moveTo(MARGIN_X, y0); ctx.lineTo(MARGIN_X, y1); ctx.stroke(); ctx.globalAlpha = 1;
  for (const ex of EXOS) if (ex.x + ex.w + 20 > v.x0 && ex.x - 20 < v.x1 && ex.y + ex.h + 20 > v.y0 && ex.y - 40 < v.y1) drawExo(ex);
}
function drawExo(ex) {
  ctx.save(); ctx.translate(ex.x + ex.w / 2, ex.y + ex.h / 2); ctx.rotate(ex.rot); ctx.globalAlpha = 0.5;
  const w = ex.w, h = ex.h, l = -w / 2, t = -h / 2;
  ctx.fillStyle = 'rgba(255,255,255,0.75)'; roundRect(l, t, w, h, 14); ctx.fill();
  ctx.strokeStyle = ex.color; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = ex.color; roundRect(l, t, w, 34, 14); ctx.fill(); ctx.fillRect(l, t + 18, w, 16);
  ctx.restore();
  txt(ex.title, ex.x + ex.w / 2, ex.y + ex.h / 2 - h / 2 + 18, 21, { color: '#ffffff', rot: ex.rot, alpha: 0.85 });
  ctx.save(); ctx.translate(ex.x + ex.w / 2, ex.y + ex.h / 2 + 16); ctx.rotate(ex.rot); ctx.globalAlpha = 0.42;
  ctx.strokeStyle = C.graphite; ctx.fillStyle = C.graphite; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.font = '700 14px ' + FONT_MAIN; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (ex.kind === 'points') {   // une étoile ou un poisson à relier : seuls les points et leurs numéros sont imprimés
    const pts = ex.k % 2 ? Array.from({ length: 10 }, (_, i) => { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 30 : 74; return [Math.cos(a) * r, Math.sin(a) * r * 0.9]; })
      : [[-80, 0], [-50, -40], [0, -52], [40, -30], [70, -50], [62, 0], [70, 50], [40, 30], [0, 52], [-50, 40], [-30, 0], [-10, -10]];
    pts.forEach(([x, y], i) => { ctx.beginPath(); ctx.arc(x, y, 3.5, 0, TAU); ctx.fill(); ctx.fillText(String(i + 1), x + 11, y - 9); });
  } else if (ex.kind === 'mots') {   // une petite grille de mots croisés, des cases noires et des numéros
    const s = 26;
    for (let j = 0; j < 5; j++) for (let i = 0; i < 7; i++) {
      const on = ((ex.k >> ((i + j * 7) % 10)) & 1) || i === 3 || j === 2;
      if (!on) continue;
      const x = (i - 3.5) * s, y = (j - 2.5) * s;
      if ((i * 7 + j * 3 + ex.k) % 11 === 0) ctx.fillRect(x, y, s, s); else ctx.strokeRect(x, y, s, s);
      if ((i + j) % 4 === 0) { ctx.font = '700 10px ' + FONT_MAIN; ctx.fillText(String(1 + (i + j * 2) % 9), x + 6, y + 7); }
    }
  } else if (ex.kind === 'colorie') {   // un dessin au trait, avec ses numéros de couleurs
    ctx.beginPath();
    if (ex.k % 2) { ctx.arc(0, -6, 38, 0, TAU); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; ctx.moveTo(Math.cos(a) * 50, -6 + Math.sin(a) * 50); ctx.lineTo(Math.cos(a) * 72, -6 + Math.sin(a) * 72); } }
    else { ctx.moveTo(-90, 30); ctx.lineTo(90, 30); ctx.lineTo(60, 60); ctx.lineTo(-60, 60); ctx.closePath(); ctx.moveTo(0, 30); ctx.lineTo(0, -60); ctx.lineTo(56, 20); ctx.lineTo(0, 20); ctx.moveTo(-6, -50); ctx.lineTo(-60, 20); ctx.lineTo(-6, 20); }
    ctx.stroke();
    ctx.fillText('1', 0, ex.k % 2 ? -6 : 45); ctx.fillText('2', ex.k % 2 ? 60 : 24, ex.k % 2 ? -50 : 0);
    ctx.font = '400 13px ' + FONT_MAIN; ctx.fillText('1 = jaune   2 = orange', 0, 84);
  } else if (ex.kind === 'diff') {   // deux petits dessins presque pareils
    for (const s of [-1, 1]) {
      ctx.strokeRect(s * 70 - 58, -50, 116, 100);
      ctx.beginPath(); ctx.arc(s * 70 - 20, -20, 12, 0, TAU); ctx.moveTo(s * 70 - 50, 30); ctx.quadraticCurveTo(s * 70, 10, s * 70 + 50, 30); ctx.stroke();
      if (s > 0 && ex.k % 3) { ctx.beginPath(); ctx.moveTo(s * 70 + 20, -30); ctx.lineTo(s * 70 + 30, -10); ctx.lineTo(s * 70 + 10, -10); ctx.closePath(); ctx.stroke(); }
    }
    ctx.font = '400 13px ' + FONT_MAIN; ctx.fillText('Il y a 7 différences !', 0, 74);
  } else if (ex.kind === 'calcul') {
    ctx.font = '700 22px ' + FONT_MAIN; ctx.textAlign = 'left';
    [[ex.a, '+', ex.b], [ex.a + ex.b + 3, '−', ex.b], [ex.a, '×', 2]].forEach(([a, o, b], i) => ctx.fillText(a + ' ' + o + ' ' + b + ' = ……', -90, -40 + i * 38));
  } else {
    ctx.font = '400 17px ' + FONT_MAIN; ctx.textAlign = 'left';
    const words = ex.text.split(' '); let line = '', y = -46;
    for (const wd of words) { if ((line + wd).length > 28) { ctx.fillText(line, -ex.w / 2 + 24, y); y += 24; line = ''; } line += wd + ' '; }
    ctx.fillText(line, -ex.w / 2 + 24, y);
    ctx.font = '400 13px ' + FONT_MAIN; ctx.fillText('réponse à l’envers, en bas de la page', -ex.w / 2 + 24, 76);
  }
  ctx.restore();
}

/* ---------- Les ratures d'été ---------- */
const POINTILLE = { n: 5, gap: 24, dot: 9 };
const BALLON = { aim: 0.6, roll: 2.3, speed: 430 };
const CORNET = { keep: 320, lob: 0.95, R: 64, empty: 3.6 };
function stepVacances(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  if (e.type === 'coquillage') {   // il roule par à-coups
    const f = 0.25 + 1.5 * Math.max(0, Math.sin(G.t * 4.5 + e.id));
    MV.x *= f; MV.y *= f; e.rot += dt * 6 * f * (dx > 0 ? 1 : -1);
  } else if (e.type === 'pointille') {   // un serpent de points à relier : la tête ondule, les points suivent
    const w = Math.sin(G.t * 3.2 + e.id) * 0.8;
    MV.x += -dy / d * e.speed * w; MV.y += dx / d * e.speed * w;
    e.rot = Math.atan2(MV.y, MV.x);
    if (!e.body) e.body = Array.from({ length: POINTILLE.n }, (_, i) => ({ x: e.x - Math.cos(e.rot) * POINTILLE.gap * (i + 1), y: e.y - Math.sin(e.rot) * POINTILLE.gap * (i + 1) }));
    let px = e.x, py = e.y;
    for (const b of e.body) {
      const bx = b.x - px, by = b.y - py, bd = Math.hypot(bx, by) || 1;
      if (bd > POINTILLE.gap) { b.x = px + bx / bd * POINTILLE.gap; b.y = py + by / bd * POINTILLE.gap; }
      px = b.x; py = b.y;
    }
    const p = G.p;
    if (!e.ghost) for (const b of e.body) if ((b.x - p.x) ** 2 + (b.y - p.y) ** 2 < (POINTILLE.dot + p.r - 2) ** 2) { hurtPlayer(1, b.x, b.y); break; }
  } else if (e.type === 'ballon') {   // il vise, puis file en rebondissant sur les bords de la page et les murs des labyrinthes
    e.pt -= dt;
    if (e.phase === 'walk') {
      e.rot += dt * 1.5;
      if (e.pt <= 0 && d < 560 && !hid) { e.phase = 'aim'; e.pt = BALLON.aim; e.aimA = Math.atan2(dy, dx); AU.play('ballAim'); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else if (e.phase === 'aim') {
      MV.x = 0; MV.y = 0; e.rot += dt * 8;
      if (e.pt <= 0) { e.phase = 'roll'; e.pt = BALLON.roll; e.bx = Math.cos(e.aimA); e.by = Math.sin(e.aimA); }
    } else {
      if ((e.x < e.r && e.bx < 0) || (e.x > WORLD.w - e.r && e.bx > 0)) { e.bx = -e.bx; AU.play('ballBounce'); }
      if ((e.y < e.r && e.by < 0) || (e.y > WORLD.h - e.r && e.by > 0)) { e.by = -e.by; AU.play('ballBounce'); }
      const hit = labyBounce(e.x, e.y, e.r, e.bx, e.by);
      if (hit) { e.bx = hit.x; e.by = hit.y; AU.play('ballBounce'); }
      MV.x = e.bx * BALLON.speed; MV.y = e.by * BALLON.speed; MV.agil = 30; e.rot += dt * 12;
      if (e.pt <= 0) { e.phase = 'walk'; e.pt = rnd(2.4, 3.4); }
    }
  } else if (e.type === 'cornet') {   // il garde ses distances et lance sa boule là où tu vas ; vide, il se sauve
    e.pt -= dt; e.empty = Math.max(0, (e.empty || 0) - dt);
    if (e.empty > 0) { MV.x *= -1.2; MV.y *= -1.2; }
    else if (d < CORNET.keep) { MV.x *= -0.5; MV.y *= -0.5; }
    e.rot = Math.sin(G.t * 2 + e.id) * 0.15;
    if (e.pt <= 0 && !e.empty && d < 640 && !hid) {
      const p = G.p, tx = clamp(p.x + p.vx * 0.55, 30, WORLD.w - 30), ty = clamp(p.y + p.vy * 0.55, 30, WORLD.h - 30);
      G.lobs.push({ x0: e.x, y0: e.y - 26, x: tx, y: ty, t: 0, dur: CORNET.lob, R: CORNET.R, flav: e.id % 3, done: false });
      e.empty = CORNET.empty; e.pt = rnd(3.6, 4.6); AU.play('lob');
    } else if (e.pt <= 0) e.pt = 0.5;
  }
}

/* ---------- Le Grand Soleil ---------- */
const SOLEIL = { rayWarn: 1.0, rayAct: 0.7, rayLen: 820, rayW: 16, tideWarn: 1.0, tideSpeed: 380, tideFrom: 720, tideTo: 900, tideW: 1800, gapW: 170, dusk: 3.6 };
function stepSoleil(e, dt, dx, dy, d, slow) {
  const want = d < 280 ? -0.6 : 1;
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow * want; MV.y = dy / d * e.speed * slow * want;
  if (e.enter > 0) e.enter = Math.max(0, e.enter - dt * 0.5);
  const enraged = e.hp < e.maxHp / 2, p = G.p;
  e.spinA = (e.spinA || 0) + dt * (enraged ? 0.9 : 0.4);
  e.pt -= dt;
  if (e.phase === 'cast') { MV.x *= 0.2; MV.y *= 0.2; if (e.pt <= 0) { e.phase = 'walk'; e.atk = enraged ? 1.1 : 1.6; } return; }
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % (enraged ? 4 : 3);
  if (m === 1) {   // les rayons : annoncés en pointillés, puis brûlants, et ils tournent
    const n = enraged ? 12 : 8;
    G.rays.push({ e, a0: Math.atan2(dy, dx) + Math.PI / n, n, t: 0, warn: SOLEIL.rayWarn, act: SOLEIL.rayAct + (enraged ? 0.3 : 0), spin: (rand() < 0.5 ? -1 : 1) * (enraged ? 0.55 : 0.32), hit: false, fired: false });
    AU.play('rayWarn'); e.phase = 'cast'; e.pt = 1.9;
    if (!G.raySeen) { G.raySeen = true; caption('Ses rayons s’allument : glisse-toi entre eux !', 2.4, 'pink'); }
  } else if (m === 2) {   // la marée : une vague qui traverse la page, et une seule bouée pour passer
    tide(p.x, p.y, rnd(TAU), 0);
    if (enraged) tide(p.x, p.y, rnd(TAU), 1.4);
    e.phase = 'cast'; e.pt = enraged ? 2.4 : 1.4;
    if (!G.tideSeen) { G.tideSeen = true; caption('La marée monte : passe par la bouée !', 2.6, 'pink'); }
  } else if (m === 0 && !enraged || m === 3) {   // le coucher de soleil : la page s'assombrit, seul le soleil brille encore
    G.dusk = { t: 0, dur: SOLEIL.dusk };
    const rings = enraged ? [0.7, 1.7, 2.7] : [0.8, 2.1];
    rings.forEach((w, k) => { const n = 14, off = rnd(TAU); for (let i = 0; i < n; i++) { const a = off + i / n * TAU; G.ebul.push({ x: e.x + Math.cos(a) * 80, y: e.y + Math.sin(a) * 80, vx: Math.cos(a) * (170 + k * 20), vy: Math.sin(a) * (170 + k * 20), life: 5, a, sun: true, wait: w }); } });
    AU.play('dusk'); e.phase = 'cast'; e.pt = 2.2;
    if (!G.duskSeen) { G.duskSeen = true; caption('Le soleil se couche… il fait nuit sur la page !', 2.6, 'pink'); }
  } else {   // colère : il appelle la plage entière
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + G.t; spawnEnemy(i < 3 ? 'ballon' : 'coquillage', e.x + Math.cos(a) * 170, e.y + Math.sin(a) * 170); }
    caption('Le Grand Soleil appelle toute la plage !', 1.8, 'pink'); AU.play('ballBounce'); e.atk = 2;
  }
}
function tide(x, y, a, delay) {
  G.tides.push({ ox: x, oy: y, a, t: -delay, warn: SOLEIL.tideWarn, gap: rnd(-200, 200), hit: false, sound: false });
  if (!delay) AU.play('tideWarn');
}
const tideFront = w => (w.t - w.warn) * SOLEIL.tideSpeed - SOLEIL.tideFrom;
function tideLocal(w, x, y) { const c = Math.cos(w.a), s = Math.sin(w.a), dx = x - w.ox, dy = y - w.oy; return { u: dx * c + dy * s, v: -dx * s + dy * c }; }
function rayHit(R, x, y, pad) {   // distance au rayon le plus proche (Infinity si hors de portée)
  const e = R.e, dx = x - e.x, dy = y - e.y, dist = Math.hypot(dx, dy);
  if (dist < 40 || dist > SOLEIL.rayLen) return Infinity;
  const base = R.a0 + R.spin * Math.max(0, R.t - R.warn), step = TAU / R.n;
  let da = Math.atan2(dy, dx) - base; da -= Math.round(da / step) * step;
  return Math.abs(Math.sin(da)) * dist - pad;
}
const duskK = () => G.dusk ? clamp(Math.min(G.dusk.t / 0.5, (G.dusk.dur - G.dusk.t) / 0.6), 0, 1) : 0;

function stepVacancesFx(dt) {
  if (CH().paper !== 'vacances') return;
  const p = G.p, safe = p.inv > 0 || p.dashT > 0;
  for (const l of G.lobs) {
    l.t += dt;
    if (!l.done && l.t >= l.dur) {
      l.done = true; AU.play('lobLand');
      if (!safe && (p.x - l.x) ** 2 + (p.y - l.y) ** 2 < (l.R + p.r * 0.5) ** 2) hurtPlayer(1, l.x, l.y);
      splat(l.x, l.y, l.R * 0.5, ['#f3a6c0', '#f5e3a0', '#a5d98a'][l.flav], 0.18, 9);
    }
  }
  G.lobs = G.lobs.filter(l => l.t < l.dur + 0.5);
  for (const R of G.rays) {
    R.t += dt;
    if (R.e.dead) { R.t = 99; continue; }
    if (!R.fired && R.t >= R.warn) { R.fired = true; AU.play('rayFire'); }
    if (!R.hit && !safe && R.t >= R.warn && R.t < R.warn + R.act && rayHit(R, p.x, p.y, SOLEIL.rayW + p.r) < 0) { R.hit = true; hurtPlayer(1, R.e.x, R.e.y); }
  }
  G.rays = G.rays.filter(R => R.t < R.warn + R.act + 0.3);
  for (const w of G.tides) {
    w.t += dt;
    if (w.t < w.warn) continue;
    if (!w.sound) { w.sound = true; AU.play('tide'); }
    const L = tideLocal(w, p.x, p.y), s = tideFront(w);
    if (!w.hit && !safe && Math.abs(L.u - s) < 22 + p.r && Math.abs(L.v - w.gap) > SOLEIL.gapW / 2 && Math.abs(L.v) < SOLEIL.tideW / 2) { w.hit = true; hurtPlayer(1, p.x - Math.cos(w.a) * 40, p.y - Math.sin(w.a) * 40); }
  }
  G.tides = G.tides.filter(w => w.t < w.warn || tideFront(w) < SOLEIL.tideTo);
  if (G.dusk) { G.dusk.t += dt; if (G.dusk.t >= G.dusk.dur) G.dusk = null; }
}
function vacancesDanger(x, y) {
  let s = 0;
  for (const l of G.lobs) if (!l.done) { const d = Math.hypot(x - l.x, y - l.y); if (d < l.R + 30) s += 3 + (l.R + 30 - d) * 0.06; }
  for (const R of G.rays) if (R.t < R.warn + R.act) { const d = rayHit(R, x, y, 0); if (d < 50) s += 3 + (50 - d) * 0.1; }
  for (const w of G.tides) {
    const L = tideLocal(w, x, y), f = w.t < w.warn ? -SOLEIL.tideFrom : tideFront(w), du = L.u - f;
    if (Math.abs(L.v - w.gap) < SOLEIL.gapW / 2 - 20) { if (du > -40 && du < 260) s -= 2; continue; }   // la bouée attire le pilote
    if (du > -50 && du < 220) s += 2.5 + (220 - Math.abs(du)) * 0.01;
  }
  for (const e of G.enemies) {
    if (e.type === 'pointille' && e.body) for (const b of e.body) { const d2 = (x - b.x) ** 2 + (y - b.y) ** 2; if (d2 < 44 * 44) s += 2.5; }
    else if (e.type === 'ballon' && e.phase === 'aim') { const d = segDist(x, y, e.x, e.y, e.x + Math.cos(e.aimA) * 600, e.y + Math.sin(e.aimA) * 600); if (d < 50) s += 3 + (50 - d) * 0.1; }
  }
  return s;
}

/* ---------- Dessins ---------- */
const SCOOPS = ['#f3a6c0', '#f8eec0', '#a5d98a'];
function drawVacancesFx() {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const e of G.enemies) if (e.type === 'ballon' && e.phase === 'aim') {   // là où il va filer
    ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.aimA); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 24); ctx.setLineDash([10, 8]); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(560, 0); ctx.stroke(); ctx.restore();
  }
  for (const l of G.lobs) {
    const k = clamp(l.t / l.dur, 0, 1);
    if (!l.done) {
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 20); ctx.setLineDash([9, 7]); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(l.x, l.y, l.R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 0.15 + 0.25 * k; ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.ellipse(l.x, l.y, l.R * (0.25 + 0.5 * k), l.R * (0.18 + 0.36 * k), 0, 0, TAU); ctx.fill();
      ctx.restore();
      const bx = lerp(l.x0, l.x, k), by = lerp(l.y0, l.y, k) - Math.sin(k * Math.PI) * 260;   // la boule en l'air
      ctx.fillStyle = SCOOPS[l.flav]; ctx.strokeStyle = 'rgba(46,46,51,0.6)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(bx, by, 17, 0, TAU); ctx.fill(); ctx.stroke();
    } else {
      const q = (l.t - l.dur) / 0.5;
      ctx.save(); ctx.globalAlpha = 1 - q; ctx.fillStyle = SCOOPS[l.flav]; ctx.strokeStyle = 'rgba(46,46,51,0.5)'; ctx.lineWidth = 2;
      ctx.beginPath(); for (let i = 0; i <= 12; i++) { const a = i / 12 * TAU, rr = l.R * (0.55 + 0.12 * Math.sin(a * 5 + l.flav)) * (1 + q * 0.3); i ? ctx.lineTo(l.x + Math.cos(a) * rr, l.y + Math.sin(a) * rr) : ctx.moveTo(l.x + Math.cos(a) * rr, l.y + Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
      txt('splatch !', l.x, l.y - 30 - q * 20, 26, { color: C.red, alpha: 1 - q });
    }
  }
  for (const R of G.rays) {
    if (R.e.dead) continue;
    const live = R.t >= R.warn, base = R.a0 + R.spin * Math.max(0, R.t - R.warn), e = R.e;
    ctx.save();
    if (!live) { ctx.strokeStyle = C.fire; ctx.globalAlpha = 0.35 + 0.3 * Math.sin(G.time * 22); ctx.setLineDash([16, 12]); ctx.lineWidth = 3; }
    else { const q = (R.t - R.warn) / (R.act + 0.3); ctx.globalAlpha = q > 0.7 ? (1 - q) / 0.3 : 1; ctx.strokeStyle = 'rgba(248,200,60,0.85)'; ctx.lineWidth = SOLEIL.rayW * 2; }
    ctx.beginPath();
    for (let i = 0; i < R.n; i++) { const a = base + i / R.n * TAU; ctx.moveTo(e.x + Math.cos(a) * 80, e.y + Math.sin(a) * 80); ctx.lineTo(e.x + Math.cos(a) * SOLEIL.rayLen, e.y + Math.sin(a) * SOLEIL.rayLen); }
    ctx.stroke();
    if (live) { ctx.strokeStyle = 'rgba(255,255,230,0.9)'; ctx.lineWidth = 6; ctx.stroke(); }
    ctx.restore();
  }
  for (const w of G.tides) drawTide(w);
  drawSunBullets();
}
function drawSunBullets() {
  for (const b of G.ebul) {
    if (!b.sun) continue;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a);
    ctx.globalAlpha = b.wait > 0 ? 0.35 : 1;
    ctx.fillStyle = '#f8c83c'; ctx.strokeStyle = '#e8742c'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-8, -7); ctx.lineTo(-4, 0); ctx.lineTo(-8, 7); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }
}
function drawTide(w) {
  if (w.t < 0) return;
  const c = Math.cos(w.a), s = Math.sin(w.a), H2 = SOLEIL.tideW / 2;
  const f = w.t < w.warn ? -SOLEIL.tideFrom : tideFront(w);
  const P = (u, v) => [w.ox + u * c - v * s, w.oy + u * s + v * c];
  ctx.save();
  if (w.t < w.warn) {   // annonce : la ligne d'écume en pointillés, et la bouée
    ctx.strokeStyle = '#3c8fc4'; ctx.globalAlpha = 0.35 + 0.3 * Math.sin(G.time * 20); ctx.setLineDash([16, 12]); ctx.lineWidth = 3;
    ctx.beginPath(); let q = P(f, -H2); ctx.moveTo(q[0], q[1]); q = P(f, w.gap - SOLEIL.gapW / 2); ctx.lineTo(q[0], q[1]); q = P(f, w.gap + SOLEIL.gapW / 2); ctx.moveTo(q[0], q[1]); q = P(f, H2); ctx.lineTo(q[0], q[1]); ctx.stroke();
  } else {   // la vague : de l'eau derrière, une ligne d'écume qui ondule devant
    ctx.fillStyle = 'rgba(90,170,220,0.22)'; ctx.beginPath();
    const back = Math.max(-SOLEIL.tideFrom - 40, f - 220);
    let q = P(back, -H2); ctx.moveTo(q[0], q[1]);
    for (let i = 0; i <= 36; i++) { const v = -H2 + i / 36 * SOLEIL.tideW; q = P(f + Math.sin(i * 1.3 + G.time * 6) * 10, v); ctx.lineTo(q[0], q[1]); }
    q = P(back, H2); ctx.lineTo(q[0], q[1]); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2f7fb6'; ctx.lineWidth = 7;
    for (const [v0, v1] of [[-H2, w.gap - SOLEIL.gapW / 2], [w.gap + SOLEIL.gapW / 2, H2]]) {
      ctx.beginPath();
      for (let i = 0; i <= 24; i++) { const v = lerp(v0, v1, i / 24); q = P(f + Math.sin(v * 0.05 + G.time * 6) * 10, v); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }
      ctx.stroke(); ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.lineWidth = 3; ctx.stroke(); ctx.strokeStyle = '#2f7fb6'; ctx.lineWidth = 7;
    }
  }
  ctx.setLineDash([]); ctx.globalAlpha = 1;
  const b = P(f, w.gap);   // la bouée, rouge et blanche
  ctx.translate(b[0], b[1]); ctx.rotate(G.time * 1.5);
  for (let i = 0; i < 8; i++) { ctx.strokeStyle = i % 2 ? '#ffffff' : C.red; ctx.lineWidth = 16; ctx.beginPath(); ctx.arc(0, 0, 34, i / 8 * TAU, (i + 1) / 8 * TAU + 0.02); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(46,46,51,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 42, 0, TAU); ctx.moveTo(26, 0); ctx.arc(0, 0, 26, 0, TAU); ctx.stroke();
  ctx.restore();
}
// Le coucher de soleil : par-dessus la page, une nuit d'été ; seuls la goutte (un peu), le soleil et ses rayons restent visibles
function drawVacancesScreen() {
  const k = duskK(); if (!k || !G.p || G.state === 'title') return;
  const px = W / 2 + (G.p.x - G.cam.x) * ZOOM, py = H / 2 + (G.p.y - G.cam.y) * ZOOM;
  const g = ctx.createRadialGradient(px, py, 150 * ZOOM, px, py, 420 * ZOOM);
  g.addColorStop(0, 'rgba(24,26,70,0)'); g.addColorStop(1, 'rgba(24,26,70,' + (0.8 * k) + ')');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(ZOOM, ZOOM); ctx.translate(-G.cam.x, -G.cam.y);
  drawSunBullets();
  if (G.boss && G.boss.type === 'soleil') drawEnemy(G.boss);
  for (let i = 0; i < 26; i++) {   // quelques étoiles qui s'allument
    const sx = G.cam.x + (((i * 7919) % 1000) / 1000 - 0.5) * W / ZOOM, sy = G.cam.y + (((i * 104729) % 1000) / 1000 - 0.5) * H / ZOOM;
    if (Math.hypot(sx - G.p.x, sy - G.p.y) < 380) continue;
    txt('✦', sx, sy, 16 + (i % 3) * 6, { color: '#fff6c8', alpha: k * (0.5 + 0.5 * Math.sin(G.time * 3 + i)) });
  }
  ctx.restore();
}

function drawVacancesEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const j = (fr - 1) * 0.8;
  if (e.type === 'coquillage') {   // un coquillage en spirale, rose nacré
    ctx.rotate(e.rot);
    ctx.fillStyle = fl ? '#ffd0d4' : '#f6c9b8'; ctx.strokeStyle = '#a35d4a'; ctx.lineWidth = 2.2;
    ctx.beginPath(); for (let i = 0; i <= 40; i++) { const a = i * 0.32, r = 3 + i * 0.32; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); for (let i = 0; i <= 40; i++) { const a = i * 0.32, r = 2 + i * 0.26 + j * 0.3; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.stroke();
    ctx.rotate(-e.rot);
    for (const s of [-5, 5]) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(s, -4, 3.6, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + 0.8, -3.4, 1.8, 0, TAU); ctx.fill(); }
  } else if (e.type === 'pointille') {   // des points numérotés, reliés au crayon : la tête est le 1
    const body = e.body || Array.from({ length: POINTILLE.n }, (_, i) => ({ x: e.x - (i + 1) * POINTILLE.gap, y: e.y + Math.sin(i + G.time * 3) * 8 }));
    ctx.strokeStyle = fl ? C.red : C.pencil; ctx.lineWidth = 2; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(0, 0); for (const b of body) ctx.lineTo(b.x - e.x, b.y - e.y); ctx.stroke(); ctx.setLineDash([]);
    body.forEach((b, i) => {
      ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(b.x - e.x, b.y - e.y, POINTILLE.dot - 2, 0, TAU); ctx.fill();
      ctx.font = '700 15px ' + FONT_MAIN; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.ink; ctx.fillText(String(i + 2), b.x - e.x + 12, b.y - e.y - 12);
    });
    ctx.fillStyle = fl ? C.red : C.ink; ctx.beginPath(); ctx.arc(0, 0, 14, 0, TAU); ctx.fill();
    ctx.font = '700 15px ' + FONT_MAIN; ctx.fillStyle = C.paper; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('1', 0, 6);
    const la = e.rot || 0;
    for (const s of [-1, 1]) { const ex = Math.cos(la) * 5 + Math.cos(la + Math.PI / 2) * s * 5, ey = Math.sin(la) * 5 + Math.sin(la + Math.PI / 2) * s * 5 - 3; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, 3.4, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(ex + Math.cos(la), ey + Math.sin(la), 1.7, 0, TAU); ctx.fill(); }
  } else if (e.type === 'ballon') {   // un ballon de plage à quartiers, qui tourne
    ctx.save(); ctx.rotate(e.rot);
    const cols = fl ? ['#ffd0d4', '#ffffff'] : ['#e9524a', '#ffffff', '#3c8fc4', '#ffffff', '#f8c83c', '#ffffff'];
    for (let i = 0; i < 6; i++) { ctx.fillStyle = cols[i % cols.length]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 22, i / 6 * TAU, (i + 1) / 6 * TAU); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 22, 0, TAU); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(-8, -10, 7, 3.5, -0.6, 0, TAU); ctx.fill();
    for (const s of [-6, 6]) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(s, 2, 4.4, 0, TAU); ctx.fill(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; ctx.stroke(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + 1, 3, 2.1, 0, TAU); ctx.fill(); }
  } else if (e.type === 'cornet') {   // un cornet gaufré et sa boule (quand il l'a encore)
    ctx.rotate(e.rot);
    ctx.fillStyle = fl ? '#ffd0d4' : '#e2b26a'; ctx.strokeStyle = '#8a5a26'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-15, -4); ctx.lineTo(15, -4); ctx.lineTo(0, 30); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 1; ctx.beginPath(); for (let i = -2; i <= 2; i++) { ctx.moveTo(-12 + (i + 2) * 6, -4); ctx.lineTo(i * 2, 26); ctx.moveTo(12 - (i + 2) * 6, -4); ctx.lineTo(-i * 2, 26); } ctx.stroke();
    if (!e.empty) { ctx.fillStyle = SCOOPS[e.id % 3]; ctx.strokeStyle = 'rgba(46,46,51,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -16 + j, 16, Math.PI * 0.95, Math.PI * 2.05); ctx.quadraticCurveTo(10, -2, 0, -4); ctx.quadraticCurveTo(-10, -2, -16, -12 + j); ctx.fill(); ctx.stroke(); }
    const ey = e.empty ? 4 : -16;
    for (const s of [-6, 6]) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(s, ey, 3.6, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + 0.8, ey + 0.6, 1.8, 0, TAU); ctx.fill(); }
    if (e.empty) { ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(0, ey + 9, 3, 0, TAU); ctx.stroke(); }   // « oh ! »
  }
}
function drawSoleil(e, fr, fl) {
  const enraged = e.hp < e.maxHp / 2, j = (fr - 1) * 1.5, R = 62, spin = e.spinA || 0;
  ctx.fillStyle = 'rgba(248,200,60,0.18)'; ctx.beginPath(); ctx.arc(0, 0, R + 50 + Math.sin(G.time * 3) * 6, 0, TAU); ctx.fill();
  ctx.save(); ctx.rotate(spin);
  ctx.fillStyle = fl ? '#ffe9a0' : '#f8b43c'; ctx.strokeStyle = '#c86a1e'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU, l = i % 2 ? 26 : 40; ctx.beginPath(); ctx.moveTo(Math.cos(a - 0.12) * (R + 2), Math.sin(a - 0.12) * (R + 2)); ctx.lineTo(Math.cos(a) * (R + l + j), Math.sin(a) * (R + l + j)); ctx.lineTo(Math.cos(a + 0.12) * (R + 2), Math.sin(a + 0.12) * (R + 2)); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.restore();
  ctx.fillStyle = fl ? '#fff2c4' : '#fcd34d'; ctx.strokeStyle = '#c86a1e'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill(); ctx.stroke();
  if (enraged) { ctx.fillStyle = 'rgba(232,82,74,0.55)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 36, 18, 13, 8, 0, 0, TAU); ctx.fill(); } }   // coup de soleil
  // les lunettes de soleil : deux verres ronds et un pont
  ctx.fillStyle = '#26283a'; ctx.strokeStyle = '#26283a'; ctx.lineWidth = 4;
  for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 24, -10, 19, 15, 0, 0, TAU); ctx.fill(); }
  ctx.beginPath(); ctx.moveTo(-6, -14); ctx.quadraticCurveTo(0, -20, 6, -14); ctx.moveTo(-43, -14); ctx.lineTo(-58, -22); ctx.moveTo(43, -14); ctx.lineTo(58, -22); ctx.stroke();
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x);
  ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(s * 24 + Math.cos(la) * 6 - 5, -15 + Math.sin(la) * 4, 5, 3, -0.5, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = '#8a3a12'; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.beginPath();
  if (enraged) { ctx.moveTo(-20, 32); ctx.quadraticCurveTo(0, 22, 20, 32); } else ctx.arc(0, 18, 22, 0.25, Math.PI - 0.25);
  ctx.stroke();
  if (enraged) { ctx.fillStyle = '#7fc4ea'; ctx.beginPath(); ctx.moveTo(52, -36); ctx.quadraticCurveTo(60, -22, 52, -18); ctx.quadraticCurveTo(44, -22, 52, -36); ctx.fill(); }   // il transpire
}
