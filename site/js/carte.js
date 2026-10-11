// Chapitre IV : la carte au trésor. Mer, îles, ratures marines (mouette, crabe, tourbillon, bouteille) et la Pieuvre-Buvard.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

/* ===================== La page ===================== */
const NOTES_CARTE = [
  { x: WORLD.w / 2, y: -150, t: '— chapitre IV : la carte au trésor —', r: -0.02 },
  { x: WORLD.w * 0.7, y: -96, t: 'ajouté : une carte au trésor (c’est fait)', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'la calligraphie ?', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'terra', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'incognita', r: -0.05 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'échelle : un carreau = une lieue ?', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: '(TODO : le nord est en haut, normalement)', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'X = ici', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'cf. ch. III, le compas', r: 0.05 }
];
const DICTEES_CARTE = ['CAP', 'PORT', 'TRÉSOR', 'ESCALE', 'NAVIRE', 'BOUSSOLE', 'BOUTEILLE', 'ARCHIPEL', 'LONGITUDE', 'EXPLORATION'];
const CARTE_TYPES = new Set(['mouette', 'crabe', 'tourbillon', 'bouteille']);
Object.assign(ETYPES, {
  mouette:    { r: 15, hp: 3.5, speed: 108, dmg: 1, xp: 1, agil: 4 },
  crabe:      { r: 20, hp: 10, speed: 72, dmg: 1, xp: 3, agil: 4 },
  tourbillon: { r: 24, hp: 22, speed: 34, dmg: 1, xp: 5, agil: 1.2 },
  bouteille:  { r: 20, hp: 26, speed: 46, dmg: 1, xp: 6, agil: 1.5 },
  pieuvre:    { r: 82, hp: 1200, speed: 40, dmg: 2, xp: 120, agil: 1.2, boss: true }
});

CHAPTERS.push({
  num: 'IV', name: 'La carte au trésor', done: 'La carte au trésor : explorée.', paper: 'carte', notes: NOTES_CARTE, dictees: DICTEES_CARTE,
  intro: 'Chapitre IV : la carte au trésor. Suis les pointillés…', boss: 'pieuvre', bossName: 'La Pieuvre-Buvard',
  bossIntro: 'Quelque chose remue sous la carte…', bossBack: 'La Pieuvre-Buvard a encore soif.', bossSound: 'boss4',
  scale: 5.5, rateOff: 140, rateCap: 11, waveCap: 'Un vol de mouettes !',
  meet: {
    mouette: 'Nouveau : la mouette. Elle tourne… puis elle pique !',
    crabe: 'Nouveau : le crabe, qui marche de travers',
    tourbillon: 'Nouveau : le tourbillon. Il t’attire, ne te laisse pas emporter !',
    bouteille: 'Nouveau : la bouteille à la mer, qui tire ses bouchons'
  },
  pick(t, r) {   // pas plus de quatre tourbillons à la fois
    if (t > 75 && r < 0.08) return 'bouteille';
    if (t > 45 && r < 0.13 && G.enemies.filter(e => e.type === 'tourbillon').length < 4) return 'tourbillon';
    return t > 25 && r < 0.36 ? 'crabe' : 'mouette';
  },
  wave(t, i) { return t > 70 && i % 4 === 0 ? 'crabe' : 'mouette'; }
});

// Les îles de la carte : des contours tremblés, calculés une fois (en coordonnées locales, autour de leur centre)
const ISLANDS = [
  { x: 640, y: 520, r: 300, name: 'Île au Brouillon' },
  { x: 1880, y: 380, r: 230, name: 'Îlot des Virgules' },
  { x: 1420, y: 1080, r: 330, name: 'Terre Inachevée' },
  { x: 2380, y: 1330, r: 290, name: 'Cap Rature' },
  { x: 520, y: 1520, r: 250, name: 'Île du Buvard' },
  { x: 2520, y: 560, r: 150, name: '' },
  { x: 1110, y: 1760, r: 140, name: '' }
];
const SEA_MARKS = [], ISLE_MARKS = [];
(function buildIslands() {
  const r = mulberry32(4242);
  for (const isl of ISLANDS) {
    const ph = [r() * TAU, r() * TAU, r() * TAU, r() * TAU], pts = [];
    for (let i = 0; i < 44; i++) {
      const a = i / 44 * TAU;
      const k = 1 + 0.17 * Math.sin(2 * a + ph[0]) + 0.1 * Math.sin(3 * a + ph[1]) + 0.06 * Math.sin(5 * a + ph[2]) + 0.035 * Math.sin(9 * a + ph[3]);
      pts.push([Math.cos(a) * isl.r * k, Math.sin(a) * isl.r * k * 0.82]);
    }
    isl.pts = pts;
    isl.path = typeof Path2D === 'function' ? pathFrom(pts.concat([pts[0]]), Math.floor(r() * 1e6), 3, true) : null;
    // des montagnes et des palmiers, dessinés au crayon
    const n = isl.r > 200 ? 4 : 1;
    for (let i = 0; i < n; i++) {
      const a = r() * TAU, d = r() * isl.r * 0.45;
      ISLE_MARKS.push({ x: isl.x + Math.cos(a) * d, y: isl.y + Math.sin(a) * d * 0.8, kind: i % 2 ? 'palm' : 'mount', s: 0.8 + r() * 0.5 });
    }
  }
  // des vaguelettes sur la mer, jamais sur les îles
  for (let i = 0; i < 400 && SEA_MARKS.length < 170; i++) {
    const x = 60 + r() * (WORLD.w - 120), y = 60 + r() * (WORLD.h - 120);
    if (ISLANDS.some(isl => Math.hypot(x - isl.x, (y - isl.y) / 0.82) < isl.r * 1.45)) continue;
    SEA_MARKS.push({ x, y, s: 0.7 + r() * 0.6 });
  }
})();
const ROSE = { x: WORLD.w - 230, y: WORLD.h - 230, r: 120 };
const SHIP = { x: 260, y: 980 };

/* ===================== Les ratures marines ===================== */
const TOURB = { R: 280, pull: 140 };
function stepCarte(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  if (e.type === 'mouette') stepMouette(e, dt, dx, dy, d, slow, hid);
  else if (e.type === 'crabe') {   // il marche de travers, en changeant de côté par à-coups
    e.pt -= dt;
    if (e.pt <= 0) { e.pt = rnd(0.7, 1.4); e.side = rand() < 0.5 ? 1 : -1; if (d < 600) AU.play('crab'); }
    const s = e.speed * slow, side = e.side || 1;
    MV.x = (-dy / d * side * 1.3 + dx / d * 0.5) * s; MV.y = (dx / d * side * 1.3 + dy / d * 0.5) * s;
    e.rot = Math.atan2(dy, dx);
  } else if (e.type === 'tourbillon') {   // il t'attire vers son centre
    e.rot += dt * 4;
    const p = G.p;
    if (d < TOURB.R && !hid && p.dashT <= 0) { const k = TOURB.pull * (1 - d / TOURB.R); G.pullX -= dx / d * k; G.pullY -= dy / d * k; }
  } else if (e.type === 'bouteille') {   // elle dérive, puis tire ses bouchons en éventail
    e.pt -= dt; MV.x *= 0.7; MV.y *= 0.7; e.rot = Math.sin(G.t * 2 + e.id) * 0.4;
    if (e.phase === 'walk') {
      if (e.pt <= 0 && d < 520 && !hid) { e.phase = 'aim'; e.pt = 0.7; e.aimA = Math.atan2(dy, dx); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else {
      MV.x = 0; MV.y = 0;
      if (e.pt <= 0) {
        for (let k = -2; k <= 2; k++) { const a = e.aimA + k * 0.24; G.ebul.push({ x: e.x + Math.cos(a) * 24, y: e.y + Math.sin(a) * 24, vx: Math.cos(a) * 250, vy: Math.sin(a) * 250, life: 3.5, a, cork: true }); }
        AU.play('cork'); e.phase = 'walk'; e.pt = rnd(2.6, 3.4);
      }
    }
  }
}
// La mouette tourne autour de toi, s'arrête un instant (son ombre vise), puis pique en ligne droite
function stepMouette(e, dt, dx, dy, d, slow, hid) {
  e.pt -= dt;
  if (e.phase === 'walk') {
    if (d < 250) { const s = e.speed * slow, k = (d - 170) / 170; MV.x = (-dy / d * 1.1 + dx / d * k) * s; MV.y = (dx / d * 1.1 + dy / d * k) * s; }
    if (e.pt <= 0 && d < 300 && !hid) { e.phase = 'aim'; e.pt = 0.55; e.cx = dx / d; e.cy = dy / d; AU.play('gull'); }
    else if (e.pt <= 0) e.pt = 0.5;
  } else if (e.phase === 'aim') {
    MV.x = -e.cx * 30; MV.y = -e.cy * 30;
    e.cx = lerp(e.cx, dx / d, dt * 3); e.cy = lerp(e.cy, dy / d, dt * 3);
    if (e.pt <= 0) { e.phase = 'dive'; e.pt = 0.45; const n = Math.hypot(e.cx, e.cy) || 1; e.cx /= n; e.cy /= n; }
  } else {
    MV.x = e.cx * 560; MV.y = e.cy * 560; MV.agil = 20;
    if (e.pt <= 0) { e.phase = 'walk'; e.pt = rnd(1.6, 2.6); }
  }
}
// Les tourbillons tirent le joueur (l'attraction totale est plafonnée pour rester jouable)
function applyPull(dt) {
  const p = G.p, m = Math.hypot(G.pullX, G.pullY);
  if (m < 0.01 || G.state !== 'play') return;
  const k = Math.min(1, 170 / m);
  p.x = clamp(p.x + G.pullX * k * dt, p.r, WORLD.w - p.r); p.y = clamp(p.y + G.pullY * k * dt, p.r, WORLD.h - p.r);
}

/* ===================== La Pieuvre-Buvard ===================== */
const PIEUVRE = { arm: 400, warn: 1.0, sweep: 1.0, drink: 260 };
function stepPieuvre(e, dt, dx, dy, d, slow) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  if (e.enter > 0) e.enter = Math.max(0, e.enter - dt * 0.5);
  const enraged = e.hp < e.maxHp / 2, p = G.p;
  e.pt -= dt;
  if (e.phase === 'inhale') {   // le buvard boit : il t'attire et boit tes gouttes d'encre (et les taches de la page)
    MV.x = 0; MV.y = 0;
    if (p.dashT <= 0 && d < 760) { const k = 40 + 150 * (1 - d / 760); G.pullX -= dx / d * k; G.pullY -= dy / d * k; }
    for (const s of G.shots) if (s.life > 0 && (s.x - e.x) ** 2 + (s.y - e.y) ** 2 < PIEUVRE.drink ** 2) { s.life = 0; e.drunk++; }
    if (rand() < dt * 10) eraseStain(e.x + rnd(-240, 240), e.y + rnd(-240, 240), 50);
    if (e.pt <= 0) { spitInk(e, enraged); e.phase = 'walk'; e.atk = 1.5; }
    return;
  }
  if (e.phase === 'sweep') { MV.x = 0; MV.y = 0; if (e.pt <= 0) e.phase = 'walk'; return; }
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % (enraged ? 4 : 3);
  if (m === 1) { sweepArms(e, enraged ? 2 : 1, dx, dy); e.atk = enraged ? 1.6 : 2.0; }
  else if (m === 2) { e.phase = 'inhale'; e.pt = 1.8; e.drunk = 0; caption('Le buvard boit ton encre !', 1.8, 'pink'); AU.play('inhale'); }
  else if (m === 0 && !enraged || m === 3) { inkRain(e, enraged ? 12 : 9); e.atk = enraged ? 2.2 : 2.6; }
  else {   // colère : elle appelle crabes et mouettes, et balaie encore
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + G.t; spawnEnemy(i % 2 ? 'mouette' : 'crabe', e.x + Math.cos(a) * 170, e.y + Math.sin(a) * 170); }
    sweepArms(e, 1, dx, dy); e.atk = 2.2;
  }
}
// Un tentacule balaie un grand secteur : annoncé en pointillés, puis il passe d'un bord à l'autre
function sweepArms(e, n, dx, dy) {
  const aim = Math.atan2(dy, dx), dir = rand() < 0.5 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const c = aim + i * Math.PI;
    G.tents.push({ e, x: e.x, y: e.y, a0: c - dir * 1.15, a1: c + dir * 1.15, a: c - dir * 1.15, t: 0, warn: PIEUVRE.warn, dur: PIEUVRE.sweep, len: PIEUVRE.arm, hit: false, sound: false });
  }
  e.phase = 'sweep'; e.pt = PIEUVRE.warn + PIEUVRE.sweep;
  AU.play('armWarn');
}
// Elle rend l'encre bue : d'autant plus de pâtés qu'elle a bu de gouttes
function spitInk(e, enraged) {
  const n = clamp(12 + Math.floor(e.drunk * 0.4), 12, enraged ? 36 : 28), off = rnd(TAU);
  for (let i = 0; i < n; i++) {
    const a = off + i / n * TAU, ring = i % 2;
    G.ebul.push({ x: e.x + Math.cos(a) * 70, y: e.y + Math.sin(a) * 70, vx: Math.cos(a) * (180 + ring * 45), vy: Math.sin(a) * (180 + ring * 45), life: 4.5, a, blot: true, wait: ring * 0.25 });
  }
  AU.play('spit');
  if (e.drunk > 4) addText(e.x, e.y - 110, 'elle te rend ton encre !', C.red, 26);
}
// Une pluie de pâtés : des cercles annoncés autour de toi, où tombent des gouttes de buvard
function inkRain(e, n) {
  const p = G.p;
  for (let i = 0; i < n; i++) {
    const a = rnd(TAU), r = i === 0 ? 0 : rnd(80, 280);
    G.drops.push({ x: clamp(p.x + Math.cos(a) * r, 20, WORLD.w - 20), y: clamp(p.y + Math.sin(a) * r, 20, WORLD.h - 20), t: -i * 0.12, fall: 1.05, r: 50, done: false });
  }
  AU.play('rain');
}
function stepCarteFx(dt) {
  const p = G.p;
  for (const tn of G.tents) {
    tn.t += dt;
    if (tn.e.dead) { tn.t = 99; continue; }
    tn.x = tn.e.x; tn.y = tn.e.y;
    const k = (tn.t - tn.warn) / tn.dur;
    tn.a = lerp(tn.a0, tn.a1, clamp(k, 0, 1));
    if (k > 0 && !tn.sound) { tn.sound = true; AU.play('sweep'); }
    if (k > 0 && k < 1 && !tn.hit && p.inv <= 0) {
      const c = Math.cos(tn.a), s = Math.sin(tn.a);
      if (segDist(p.x, p.y, tn.x + c * 60, tn.y + s * 60, tn.x + c * (60 + tn.len), tn.y + s * (60 + tn.len)) < p.r + 16) { tn.hit = true; hurtPlayer(2, tn.x, tn.y); }
    }
  }
  G.tents = G.tents.filter(tn => tn.t < tn.warn + tn.dur + 0.3);
  for (const dr of G.drops) {
    dr.t += dt;
    if (!dr.done && dr.t >= dr.fall) {
      dr.done = true; splat(dr.x, dr.y, dr.r * 0.45, '#c86a86', 0.16, 6); AU.play('plop');
      if ((p.x - dr.x) ** 2 + (p.y - dr.y) ** 2 < (dr.r + p.r - 4) ** 2) hurtPlayer(1, dr.x, dr.y);
    }
  }
  G.drops = G.drops.filter(dr => dr.t < dr.fall + 0.5);
}
// Pour le pilote automatique : le danger des tentacules et des pâtés qui tombent
function angIn(a, from, to) {
  const span = to - from, dir = Math.sign(span) || 1;
  const t = (((a - from) * dir) % TAU + TAU) % TAU;
  return t <= Math.abs(span);
}
function carteDanger(x, y) {
  let s = 0;
  for (const tn of G.tents) {
    if (tn.t > tn.warn + tn.dur) continue;
    const d = Math.hypot(x - tn.x, y - tn.y);
    if (d > tn.len + 110 || !angIn(Math.atan2(y - tn.y, x - tn.x), tn.a, tn.a1)) continue;
    s += 2 + (tn.len + 110 - d) * 0.05;
  }
  for (const dr of G.drops) { if (dr.done) continue; const d = Math.hypot(x - dr.x, y - dr.y); if (d < dr.r + 40) s += 3 + (dr.r + 40 - d) * 0.08; }
  return s;
}

/* ===================== Dessin ===================== */
const SEA = 'rgba(105,165,205,0.2)', SAND = 'rgba(238,216,160,0.92)', SEPIA = '#8a5a2b';
function drawCarte(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = 'rgba(214,186,132,0.16)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // le parchemin
  ctx.fillStyle = SEA; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  // vaguelettes
  ctx.strokeStyle = 'rgba(60,110,150,0.42)'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
  for (const m of SEA_MARKS) {
    if (m.x < v.x0 - 40 || m.x > v.x1 + 40 || m.y < v.y0 - 20 || m.y > v.y1 + 20) continue;
    const w = 11 * m.s, off = Math.sin(G.time * 1.3 + m.x * 0.01) * 3;
    ctx.moveTo(m.x - w * 2 + off, m.y); ctx.quadraticCurveTo(m.x - w * 1.5 + off, m.y - w * 0.6, m.x - w + off, m.y);
    ctx.quadraticCurveTo(m.x - w * 0.5 + off, m.y - w * 0.6, m.x + off, m.y);
  }
  ctx.stroke();
  // les îles : un contour de sable, et les lignes d'eau autour, comme sur les vieilles cartes
  for (const isl of ISLANDS) {
    const R = isl.r * 1.4;
    if (!isl.path || isl.x + R < v.x0 || isl.x - R > v.x1 || isl.y + R < v.y0 || isl.y - R > v.y1) continue;
    ctx.save(); ctx.translate(isl.x, isl.y);
    for (const [k, al] of [[1.26, 0.12], [1.16, 0.2], [1.08, 0.3]]) { ctx.save(); ctx.scale(k, k); ctx.strokeStyle = 'rgba(60,110,150,' + al + ')'; ctx.lineWidth = 2 / k; ctx.stroke(isl.path); ctx.restore(); }
    ctx.fillStyle = SAND; ctx.fill(isl.path);
    ctx.strokeStyle = SEPIA; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.stroke(isl.path);
    ctx.restore();
  }
  ctx.strokeStyle = SEPIA; ctx.lineWidth = 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const m of ISLE_MARKS) {
    if (m.x < v.x0 - 60 || m.x > v.x1 + 60 || m.y < v.y0 - 60 || m.y > v.y1 + 60) continue;
    ctx.save(); ctx.translate(m.x, m.y); ctx.scale(m.s, m.s); ctx.beginPath();
    if (m.kind === 'mount') { ctx.moveTo(-34, 14); ctx.lineTo(-12, -22); ctx.lineTo(0, -6); ctx.lineTo(14, -30); ctx.lineTo(38, 14); ctx.moveTo(-12, -22); ctx.lineTo(-6, 10); ctx.moveTo(14, -30); ctx.lineTo(20, 8); }
    else { ctx.moveTo(0, 18); ctx.quadraticCurveTo(6, -4, 0, -24); for (const a of [-2.6, -2, -1.1, -0.5]) { ctx.moveTo(0, -24); ctx.quadraticCurveTo(Math.cos(a) * 14, -24 + Math.sin(a) * 14 - 6, Math.cos(a) * 24, -24 + Math.sin(a) * 18 + 10); } }
    ctx.stroke(); ctx.restore();
  }
  for (const isl of ISLANDS) if (isl.name && Math.abs(isl.x - (v.x0 + v.x1) / 2) < (v.x1 - v.x0) / 2 + 300 && Math.abs(isl.y - (v.y0 + v.y1) / 2) < (v.y1 - v.y0) / 2 + 300) {
    txt(isl.name, isl.x, isl.y + isl.r * 0.82 + 34, 30, { color: SEPIA, weight: 400, alpha: 0.85, rot: -0.04 });
  }
  if (Math.abs(1400 - (v.x0 + v.x1) / 2) < (v.x1 - v.x0) / 2 + 300 && 1680 > v.y0 - 60 && 1680 < v.y1 + 60) txt('Mer des Ratures', 1720, 1690, 38, { color: 'rgba(50,95,135,0.7)', weight: 400, rot: 0.05 });
  if (SHIP.x > v.x0 - 120 && SHIP.x < v.x1 + 120 && SHIP.y > v.y0 - 120 && SHIP.y < v.y1 + 120) drawShip();
  if (ROSE.x + 200 > v.x0 && ROSE.x - 200 < v.x1 && ROSE.y + 200 > v.y0 && ROSE.y - 200 < v.y1) drawRose();
}
// La rose des vents, en bas à droite
function drawRose() {
  ctx.save(); ctx.translate(ROSE.x, ROSE.y);
  ctx.strokeStyle = SEPIA; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, ROSE.r * 0.72, 0, TAU); ctx.stroke();
  ctx.setLineDash([3, 6]); ctx.beginPath(); ctx.arc(0, 0, ROSE.r * 0.82, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * TAU - Math.PI / 2, L = i % 2 ? ROSE.r * 0.55 : ROSE.r, w = i % 2 ? 9 : 16;
    const lx = Math.cos(a + Math.PI / 2) * w, ly = Math.sin(a + Math.PI / 2) * w;
    ctx.fillStyle = i === 0 ? C.red : i % 2 ? 'rgba(138,90,43,0.35)' : 'rgba(138,90,43,0.75)';
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * L, Math.sin(a) * L); ctx.lineTo(lx, ly); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(253,252,246,0.85)'; ctx.beginPath(); ctx.moveTo(Math.cos(a) * L, Math.sin(a) * L); ctx.lineTo(-lx, -ly); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(Math.cos(a) * L, Math.sin(a) * L); ctx.lineTo(lx, ly); ctx.lineTo(-lx, -ly); ctx.closePath(); ctx.stroke();
  }
  ctx.restore();
  [['N', 0, -1], ['S', 0, 1], ['E', 1, 0], ['O', -1, 0]].forEach(([l, x, y]) => txt(l, ROSE.x + x * (ROSE.r + 24), ROSE.y + y * (ROSE.r + 24), 32, { color: l === 'N' ? C.red : SEPIA }));
}
// Un petit navire au crayon, qui tangue
function drawShip() {
  ctx.save(); ctx.translate(SHIP.x, SHIP.y); ctx.rotate(Math.sin(G.time * 1.2) * 0.06);
  ctx.strokeStyle = SEPIA; ctx.lineWidth = 2.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(160,110,60,0.5)'; ctx.beginPath(); ctx.moveTo(-50, 0); ctx.lineTo(50, 0); ctx.lineTo(36, 22); ctx.lineTo(-38, 22); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -84); ctx.stroke();
  ctx.fillStyle = 'rgba(253,252,246,0.9)'; ctx.beginPath(); ctx.moveTo(4, -78); ctx.quadraticCurveTo(40, -50, 6, -10); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-4, -70); ctx.quadraticCurveTo(-30, -44, -4, -14); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(0, -84); ctx.lineTo(16, -79); ctx.lineTo(0, -74); ctx.fill();
  ctx.restore();
}
const CRAB = '#d4643c', CRAB_FL = '#f2a48a', BUVARD = '#f3b6c4';
function drawCarteEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const j = (fr - 1) * 0.8;
  if (e.type === 'mouette') {
    if (e.phase === 'aim') { ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.35 + 0.3 * Math.sin(G.time * 30); ctx.setLineDash([10, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(e.cx * 240, e.cy * 240); ctx.stroke(); ctx.restore(); }
    const f = e.phase === 'dive' ? -7 : Math.sin(G.time * 11 + e.id) * 7;
    ctx.fillStyle = 'rgba(46,46,51,0.12)'; ctx.beginPath(); ctx.ellipse(0, 20, 12, 4, 0, 0, TAU); ctx.fill();   // son ombre sur la mer
    ctx.strokeStyle = fl ? C.red : C.graphite; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-18, -2 + f + j); ctx.quadraticCurveTo(-9, -11 - f * 0.4, 0, 0); ctx.quadraticCurveTo(9, -11 - f * 0.4, 18, -2 + f - j); ctx.stroke();
  } else if (e.type === 'crabe') {
    ctx.rotate(e.rot + Math.PI / 2);
    const pinch = Math.max(0, Math.sin(G.time * 7 + e.id)) * 0.5;
    ctx.strokeStyle = fl ? C.red : '#8a3c22'; ctx.lineWidth = 2.4; ctx.beginPath();
    for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const y = -4 + k * 7, w = Math.sin(G.time * 16 + k + e.id) * 3; ctx.moveTo(s * 14, y); ctx.lineTo(s * 25, y + 4 + w); ctx.lineTo(s * 28, y + 10 + w); }
    for (const s of [-1, 1]) { ctx.moveTo(s * 10, -10); ctx.lineTo(s * 15, -22); }
    ctx.stroke();
    for (const s of [-1, 1]) {   // les pinces, qui s'ouvrent et se ferment
      ctx.save(); ctx.translate(s * 15, -26); ctx.fillStyle = fl ? CRAB_FL : CRAB;
      ctx.beginPath(); ctx.arc(0, 0, 7, -Math.PI / 2 - 0.4 - pinch, -Math.PI / 2 + 0.4 + pinch, true); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#8a3c22'; ctx.lineWidth = 1.5; ctx.stroke(); ctx.restore();
    }
    ctx.fillStyle = fl ? CRAB_FL : CRAB; ctx.beginPath(); ctx.ellipse(0, 0, 16 + j, 12, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#8a3c22'; ctx.lineWidth = 2; ctx.stroke();
    for (const s of [-1, 1]) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(s * 5, -12, 3.6, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s * 5, -13, 1.8, 0, TAU); ctx.fill(); }
  } else if (e.type === 'tourbillon') {
    ctx.save(); ctx.strokeStyle = 'rgba(40,90,140,0.18)'; ctx.setLineDash([6, 10]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, TOURB.R, 0, TAU); ctx.stroke(); ctx.restore();
    ctx.strokeStyle = fl ? C.red : '#2f6f9e'; ctx.lineWidth = 3;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      for (let i = 0; i <= 18; i++) { const t = i / 18, a = -e.rot + k * TAU / 3 + t * 4.2, r = 4 + t * (26 + j); i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.stroke();
    }
    ctx.fillStyle = C.inkDeep; ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.fill();
  } else if (e.type === 'bouteille') {
    if (e.phase === 'aim') {
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.25 + 0.25 * Math.sin(G.time * 24); ctx.setLineDash([8, 8]); ctx.lineWidth = 2;
      ctx.beginPath(); for (let k = -2; k <= 2; k++) { const a = e.aimA + k * 0.24; ctx.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); ctx.lineTo(Math.cos(a) * 220, Math.sin(a) * 220); } ctx.stroke(); ctx.restore();
    }
    const aim = e.phase === 'aim';
    ctx.rotate(aim ? e.aimA + Math.PI / 2 + Math.sin(G.time * 40) * 0.08 : e.rot);
    ctx.fillStyle = fl ? 'rgba(240,140,140,0.6)' : 'rgba(150,200,165,0.6)'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-6, -24); ctx.lineTo(6, -24); ctx.lineTo(6, -14); ctx.quadraticCurveTo(13, -10, 13, -2); ctx.lineTo(13 + j, 22); ctx.lineTo(-13, 22 - j); ctx.lineTo(-13, -2); ctx.quadraticCurveTo(-13, -10, -6, -14); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.wood; ctx.fillRect(-5, -31 - (aim ? 3 : 0), 10, 8); ctx.strokeRect(-5, -31 - (aim ? 3 : 0), 10, 8);
    ctx.fillStyle = '#f6efd8'; ctx.beginPath(); ctx.ellipse(0, 6, 5, 11, 0.2, 0, TAU); ctx.fill(); ctx.lineWidth = 1; ctx.stroke();   // le message roulé
    ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, -2); ctx.lineTo(-8, 14); ctx.stroke();
  }
}
function drawPieuvre(e, fr, fl) {
  const enraged = e.hp < e.maxHp / 2, inh = e.phase === 'inhale';
  if (inh) {   // l'aspiration : des traits qui convergent vers elle
    ctx.save(); ctx.strokeStyle = 'rgba(200,106,134,0.5)'; ctx.lineWidth = 2.5; ctx.setLineDash([12, 12]); ctx.lineDashOffset = -G.time * 120;
    ctx.beginPath(); ctx.arc(0, 0, PIEUVRE.drink, 0, TAU); ctx.stroke();
    ctx.beginPath(); for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + G.time * 0.6; ctx.moveTo(Math.cos(a) * 420, Math.sin(a) * 420); ctx.lineTo(Math.cos(a) * 120, Math.sin(a) * 120); } ctx.stroke(); ctx.restore();
  }
  const wob = Math.sin(G.time * (enraged ? 7 : 4)), j = (fr - 1) * 2;
  // les tentacules au repos, qui ondulent sous le corps
  ctx.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    const a = Math.PI / 2 + (i - 3.5) * 0.36, L = 120 + (i % 3) * 14, w = Math.sin(G.time * 3 + i * 1.3) * 26;
    const bx = Math.cos(a) * 46, by = Math.sin(a) * 40, ex = Math.cos(a) * L + w, ey = Math.sin(a) * L * 0.9;
    ctx.strokeStyle = fl ? '#e0606a' : enraged ? '#c85a78' : '#d77f98'; ctx.lineWidth = 15;
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo((bx + ex) / 2 - w, (by + ey) / 2, ex, ey); ctx.stroke();
    ctx.strokeStyle = fl ? '#ffc0c8' : BUVARD; ctx.lineWidth = 9; ctx.stroke();
  }
  ctx.save(); ctx.scale(1 + wob * 0.04 + (inh ? 0.08 : 0), 1 - wob * 0.04);
  ctx.fillStyle = fl ? '#ffd0d8' : BUVARD; ctx.strokeStyle = enraged ? C.red : '#b0607a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-92, 30); ctx.bezierCurveTo(-110 + j, -70, -50, -116, 0, -114); ctx.bezierCurveTo(50, -116, 110, -70, 92 - j, 30); ctx.quadraticCurveTo(0, 62, -92, 30); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(176,96,122,0.35)';   // les fibres du papier buvard
  for (let i = 0; i < 26; i++) { const a = i * 2.4, r = 20 + (i * 37 % 70); ctx.fillRect(Math.cos(a) * r, Math.sin(a) * r * 0.7 - 36, 2.5, 2.5); }
  ctx.fillStyle = 'rgba(120,60,80,0.55)'; ctx.font = '700 17px ' + FONT_MAIN; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('BUVARD', 0, -86);
  ctx.restore();
  // les yeux, et la bouche (grande ouverte quand elle boit)
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x), ex = Math.cos(la) * 6, ey = Math.sin(la) * 6;
  for (const s of [-1, 1]) {
    ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(s * 32, -40, 17, 20, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s * 32 + ex, -40 + ey, 7, 0, TAU); ctx.fill();
    if (enraged) { ctx.beginPath(); ctx.moveTo(s * 52, -66); ctx.lineTo(s * 14, -56); ctx.stroke(); }
  }
  ctx.fillStyle = C.graphite;
  if (inh) { ctx.beginPath(); ctx.ellipse(0, 4, 20, 16 + Math.sin(G.time * 20) * 2, 0, 0, TAU); ctx.fill(); }
  else { ctx.strokeStyle = C.graphite; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -4, 14, 0.3, Math.PI - 0.3); ctx.stroke(); }
}
// Tentacules qui balaient, pâtés qui tombent, bouchons et gouttes de buvard
function drawCarteFx() {
  for (const dr of G.drops) {
    if (dr.t < 0) continue;
    const k = clamp(dr.t / dr.fall, 0, 1);
    if (!dr.done) {
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.35 + 0.25 * Math.sin(G.time * 20); ctx.setLineDash([8, 7]); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(dr.x, dr.y, dr.r, 0, TAU); ctx.stroke(); ctx.restore();
      ctx.fillStyle = 'rgba(200,106,134,' + (0.08 + 0.2 * k) + ')'; ctx.beginPath(); ctx.arc(dr.x, dr.y, dr.r * k, 0, TAU); ctx.fill();
      const h = (1 - k) * 380; ctx.fillStyle = '#c86a86'; ctx.beginPath(); ctx.ellipse(dr.x, dr.y - h, 9, 13, 0, 0, TAU); ctx.fill();
    } else {
      const q = (dr.t - dr.fall) / 0.5; ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#c86a86'; ctx.lineWidth = 5 * (1 - q) + 1;
      ctx.beginPath(); ctx.arc(dr.x, dr.y, dr.r * (0.6 + 0.6 * q), 0, TAU); ctx.stroke(); ctx.restore();
    }
  }
  for (const tn of G.tents) {
    const live = tn.t >= tn.warn, k = clamp((tn.t - tn.warn) / tn.dur, 0, 1), R = 60 + tn.len;
    ctx.save(); ctx.translate(tn.x, tn.y);
    if (!live || k < 1) {   // le secteur qu'il va balayer
      ctx.strokeStyle = C.red; ctx.globalAlpha = live ? 0.25 : 0.3 + 0.3 * Math.sin(G.time * 22); ctx.setLineDash([12, 10]); ctx.lineWidth = 2.5;
      const from = live ? tn.a : tn.a0;
      ctx.beginPath(); ctx.moveTo(Math.cos(from) * 60, Math.sin(from) * 60); ctx.arc(0, 0, R, from, tn.a1, tn.a1 < tn.a0); ctx.lineTo(Math.cos(tn.a1) * 60, Math.sin(tn.a1) * 60); ctx.stroke();
      ctx.setLineDash([]);
    }
    if (live && k < 1) {   // le tentacule, ventouses comprises
      ctx.globalAlpha = 1; ctx.rotate(tn.a); ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(40, 0);
      for (let i = 1; i <= 12; i++) { const x = 40 + i / 12 * (R - 40), y = Math.sin(i * 0.9 - G.time * 14) * 10 * (i / 12); ctx.lineTo(x, y); }
      ctx.strokeStyle = '#c85a78'; ctx.lineWidth = 26; ctx.stroke(); ctx.strokeStyle = BUVARD; ctx.lineWidth = 18; ctx.stroke();
      ctx.fillStyle = '#fff3f6'; for (let i = 2; i < 12; i += 2) { const x = 40 + i / 12 * (R - 40), y = Math.sin(i * 0.9 - G.time * 14) * 10 * (i / 12); ctx.beginPath(); ctx.arc(x, y + 4, 3.5, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
  }
  for (const b of G.ebul) {
    if (!b.cork && !b.blot) continue;
    ctx.save(); ctx.translate(b.x, b.y); ctx.globalAlpha = b.wait > 0 ? 0.25 + 0.25 * Math.sin(G.time * 20) : 1;
    if (b.cork) { ctx.rotate(G.time * 9); ctx.fillStyle = C.wood; ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.fillRect(-5, -7, 10, 14); ctx.strokeRect(-5, -7, 10, 14); }
    else { ctx.fillStyle = '#c84a6e'; ctx.beginPath(); ctx.arc(0, 0, 7.5, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.arc(-2.5, -2.5, 2.2, 0, TAU); ctx.fill(); }
    ctx.restore();
  }
}
