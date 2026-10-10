// Chapitre II : la portée. Papier à musique, ratures musicales (croche, soupir, métronome) et la Fausse Note.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

/* ===================== La page ===================== */
const STAFF = { top: 96, gap: 16, every: 192 };   // une portée de 5 lignes (espacées de 16 px) toutes les 192 px
const STAFF_COUNT = Math.floor((WORLD.h - 40 - STAFF.top - 4 * STAFF.gap) / STAFF.every) + 1;
const NOTES_PORTEE = [
  { x: WORLD.w / 2, y: -150, t: '— chapitre II : la portée —', r: -0.02 },
  { x: WORLD.w * 0.68, y: -96, t: 'ajouté : la page se tourne (c’est fait)', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 195, y: WORLD.h * 0.3 + 96, t: 'les paroles ?', r: 0.07 },
  { x: WORLD.w + 185, y: WORLD.h * 0.3 + 46, t: 'un refrain ? → écrit !', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'mesure', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'à compléter', r: -0.05 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'da capo ?', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: '(TODO : les paroles)', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'silence, on compose', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'la ? sol ?', r: 0.05 }
];
const DICTEES_PORTEE = ['NOTE', 'GAMME', 'ACCORD', 'REFRAIN', 'SOLFÈGE', 'MÉLODIE', 'CANTATE', 'PARTITION', 'MÉTRONOME', 'SYMPHONIE'];

CHAPTERS.push({
  num: 'II', name: 'La portée', done: 'La portée : écrite.', paper: 'portee', notes: NOTES_PORTEE, dictees: DICTEES_PORTEE,
  intro: 'Chapitre II : la portée. Quelque part, une Fausse Note…', boss: 'fausse', bossName: 'La Fausse Note',
  bossIntro: 'La Fausse Note entre en scène…', bossBack: 'Encore elle, et toujours aussi fausse.', bossSound: 'boss2',
  scale: 2.5, rateOff: 100, rateCap: 8, waveCap: 'Une volée de croches !',
  meet: {
    croche: 'Nouveau : la croche, qui sautille en rythme',
    soupir: 'Nouveau : le soupir, qui disparaît… et réapparaît',
    metronome: 'Nouveau : le métronome. Sors du cercle au quatrième tic !'
  },
  pick(t, r) { if (t > 100 && r < 0.07) return 'gomme'; if (t > 55 && r < 0.17) return 'metronome'; if (t > 20 && r < 0.36) return 'soupir'; if (t > 35 && r < 0.46) return 'biffure'; return 'croche'; },
  wave(t, i) { return t > 70 && i % 4 === 0 ? 'soupir' : 'croche'; }
});

// Une ligne de portée traversée sonne sa note (fa, ré, si, sol, mi de haut en bas)
function staffCross(y0, y1) {
  const lo = Math.min(y0, y1), hi = Math.max(y0, y1);
  for (let m = Math.floor(lo / STAFF.gap) + 1; m * STAFF.gap <= hi; m++) {
    const y = m * STAFF.gap, r = ((y - STAFF.top) % STAFF.every + STAFF.every) % STAFF.every;
    if (r <= 4 * STAFF.gap && y >= STAFF.top && y <= STAFF.top + (STAFF_COUNT - 1) * STAFF.every + 4 * STAFF.gap) AU.play('staff', r / STAFF.gap);
  }
}
// Hauteur de note d'une position : 0 (mi, sous la portée) à 8 (fa, ligne du haut)
function staffPitch(y) {
  const r = ((y - STAFF.top) % STAFF.every + STAFF.every) % STAFF.every;
  return clamp(Math.round((4 * STAFF.gap - Math.min(r, 4 * STAFF.gap + 8)) / (STAFF.gap / 2)), 0, 8);
}

/* ===================== Les ratures musicales ===================== */
const MV = { x: 0, y: 0, agil: 0 };   // sortie de stepPortee (évite une allocation par rature et par image)
function stepPortee(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil;
  if (e.type === 'croche') {
    e.hop = Math.max(0, Math.sin(G.t * 9 + e.id * 1.7));   // elle sautille en rythme
    const s = e.speed * slow * (0.35 + 1.5 * e.hop);
    MV.x = dx / d * s; MV.y = dy / d * s;
  } else if (e.type === 'soupir') {
    e.pt -= dt; MV.x = 0; MV.y = 0;
    if (e.phase === 'walk') {
      MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
      if (e.pt <= 0 && d < 640 && !hid) {
        const a = rnd(TAU), r = rnd(110, 170);
        e.phase = 'fade'; e.pt = 0.65; e.ghost = true;
        e.bx = clamp(G.p.x + Math.cos(a) * r, 30, WORLD.w - 30); e.by = clamp(G.p.y + Math.sin(a) * r, 30, WORLD.h - 30);
        AU.play('blink');
      } else if (e.pt <= 0) e.pt = 0.5;
    } else if (e.phase === 'fade') {
      MV.agil = 10;
      if (e.pt <= 0) { e.x = e.bx; e.y = e.by; e.vx = 0; e.vy = 0; e.phase = 'land'; e.pt = 0.35; }
    } else {
      MV.agil = 10;
      if (e.pt <= 0) { e.phase = 'walk'; e.ghost = false; e.pt = rnd(2.2, 3.4); }
    }
  } else if (e.type === 'metronome') {
    MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
    if (e.ticks === undefined) { e.ticks = 0; e.tickT = 0.5 + (e.id % 4) * 0.12; }
    e.tickT -= dt;
    if (e.tickT <= 0) {
      e.tickT += 0.5; e.ticks++;
      if (e.ticks % 4 === 0) { G.waves.push({ x: e.x, y: e.y, t: 0, dur: 0.55, r: 165, hit: false }); AU.play('wave'); }
      else AU.play('tick', e.ticks % 4);
    }
  }
}

/* ===================== La Fausse Note ===================== */
function noteBullet(x, y, a, sp, wait = 0) { G.ebul.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 5, a, note: true, wait }); }
function stepFausse(e, dt, dx, dy, d) {
  if (e.enter > 0) e.enter = Math.max(0, e.enter - dt * 0.5);
  const enraged = e.hp < e.maxHp / 2;
  if (e.burst > 0) {   // une gamme : les notes partent l'une après l'autre, en spirale
    e.burstT -= dt;
    while (e.burstT <= 0 && e.burst > 0) {
      e.burstT += 0.07; e.burst--;
      const k = e.burstN - e.burst, a = e.burstA + k * 0.42;
      noteBullet(e.x + Math.cos(a) * 60, e.y + Math.sin(a) * 60, a, 225);
      if (enraged) noteBullet(e.x - Math.cos(a) * 60, e.y - Math.sin(a) * 60, a + Math.PI, 225);
      AU.play('noteShot', k);
    }
  }
  e.atk -= dt;
  if (e.phase === 'aim') { e.pt -= dt; e.cx = lerp(e.cx, dx / d, dt * 2); e.cy = lerp(e.cy, dy / d, dt * 2); if (e.pt <= 0) { e.phase = 'charge'; e.pt = 0.7; const n = Math.hypot(e.cx, e.cy) || 1; e.cx /= n; e.cy /= n; } return; }
  if (e.phase === 'charge') { e.pt -= dt; if (e.pt <= 0) e.phase = 'walk'; return; }
  if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % (enraged ? 4 : 3);
  if (m === 1) { e.burst = e.burstN = enraged ? 22 : 18; e.burstA = rnd(TAU); e.burstT = 0; e.atk = 2.5; }
  else if (m === 2) { porteeWall(e); e.atk = enraged ? 2.6 : 3.1; }
  else if (m === 3) {   // colère : elle charge et appelle des croches
    e.phase = 'aim'; e.pt = 0.8; e.cx = dx / d; e.cy = dy / d; e.atk = 2;
    for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + G.t; spawnEnemy('croche', e.x + Math.cos(a) * 100, e.y + Math.sin(a) * 100); }
    caption('Elle charge !', 1.2, 'pink');
  } else {   // un accord : trois cercles de notes, un temps après l'autre
    const off = rnd(TAU);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 12; i++) { const a = off + (i + r * 0.5) / 12 * TAU; noteBullet(e.x + Math.cos(a) * 60, e.y + Math.sin(a) * 60, a, 190, r * 0.28); }
    AU.play('accord'); e.atk = enraged ? 2 : 2.7;
  }
}
// Une portée entière de notes balaie la page ; il faut se glisser dans la respiration (le trou)
function porteeWall(e) {
  const p = G.p, side = e.x >= p.x ? 1 : -1, half = Math.min(600, W / ZOOM / 2 - 50);
  const x0 = p.x + side * half, gapY = p.y + rnd(-140, 140);
  for (let y = p.y - 400; y <= p.y + 400; y += 34) {
    if (Math.abs(y - gapY) < 72) continue;
    G.ebul.push({ x: x0, y, vx: -side * 205, vy: 0, life: 7.5, a: side > 0 ? Math.PI : 0, note: true, wait: 0.9 });
  }
  G.marks = { x: x0, y: gapY, t0: G.time };
  AU.play('wall');
}

/* ===================== Dessin ===================== */
// Clé de sol tracée à la main, dans le repère d'une portée (lignes à y = 0, 16, 32, 48, 64)
const CLEF = typeof Path2D === 'function' ? new Path2D('M 4 52 C -4 54 -8 46 -2 42 C 6 38 14 46 12 54 C 10 64 -6 66 -12 58 C -20 46 -10 30 2 20 C 12 10 14 -6 8 -16 C 4 -24 -4 -18 -4 -8 C -4 10 4 50 6 80 C 7 90 -2 96 -8 90') : null;
function drawPortee(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1);
  ctx.strokeStyle = 'rgba(58,60,84,0.42)'; ctx.lineWidth = Math.max(1.2, 1.3 / ZOOM); ctx.beginPath();
  for (let s = 0; s < STAFF_COUNT; s++) {
    const top = STAFF.top + s * STAFF.every;
    if (top + 4 * STAFF.gap < v.y0 || top > v.y1) continue;
    for (let j = 0; j < 5; j++) { const y = top + j * STAFF.gap; ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
    for (let x = 512; x < WORLD.w - 100; x += 512) if (x > v.x0 && x < v.x1) { ctx.moveTo(x, top); ctx.lineTo(x, top + 4 * STAFF.gap); }
    if (WORLD.w - 40 < v.x1) { ctx.moveTo(WORLD.w - 48, top); ctx.lineTo(WORLD.w - 48, top + 4 * STAFF.gap); }
  }
  ctx.stroke();
  for (let s = 0; s < STAFF_COUNT; s++) {
    const top = STAFF.top + s * STAFF.every;
    if (top + 100 < v.y0 || top - 40 > v.y1) continue;
    if (WORLD.w - 40 < v.x1) { ctx.fillStyle = 'rgba(58,60,84,0.6)'; ctx.fillRect(WORLD.w - 40, top, 6, 4 * STAFF.gap); }
    if (v.x0 > 200) continue;
    if (CLEF) { ctx.save(); ctx.translate(60, top); ctx.strokeStyle = 'rgba(46,46,51,0.75)'; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.stroke(CLEF); ctx.fillStyle = 'rgba(46,46,51,0.75)'; ctx.beginPath(); ctx.arc(-6, 88, 3.6, 0, TAU); ctx.fill(); ctx.restore(); }
    if (s === 0) { txt('4', 116, top + 16, 34, { color: C.graphite, alpha: 0.75 }); txt('4', 116, top + 48, 34, { color: C.graphite, alpha: 0.75 }); }
  }
}
function drawNoteHead(rx, ry) { ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, -0.4, 0, TAU); }
function drawPorteeEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (e.type === 'croche') {
    const j = (fr - 1) * 0.8;
    ctx.translate(0, -(e.hop || 0) * 7);
    ctx.fillStyle = fl ? C.red : C.graphite; ctx.strokeStyle = fl ? C.red : C.graphite;
    ctx.save(); ctx.translate(-2, 8); drawNoteHead(9.5, 6.8); ctx.fill(); ctx.restore();
    ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(6.5, 6 + j); ctx.lineTo(7 + j * 0.5, -22); ctx.stroke();
    ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(7 + j * 0.5, -22); ctx.quadraticCurveTo(18, -14 + j, 15, -3); ctx.stroke();
  } else if (e.type === 'soupir') {
    let a = 1;
    if (e.phase === 'fade') a = clamp(e.pt / 0.65, 0, 1) * 0.8;
    else if (e.phase === 'land') a = 1 - clamp(e.pt / 0.35, 0, 1) * 0.7;
    ctx.globalAlpha *= a;
    ctx.strokeStyle = fl ? C.red : C.graphite; ctx.lineWidth = 4.5;
    ctx.stroke(SHAPES.soupir[e.shape % SHAPES.soupir.length][fr]);
  } else if (e.type === 'metronome') {
    const warn = e.ticks % 4 === 3, k = e.ticks === undefined ? 0 : (1 - e.tickT / 0.5);
    if (warn) { ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.18 + 0.35 * k; ctx.setLineDash([10, 9]); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, 165, 0, TAU); ctx.stroke(); ctx.restore(); }
    const jj = (fr - 1) * 0.7;
    ctx.fillStyle = fl ? '#f3b0a0' : C.wood; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-24 + jj, 26); ctx.lineTo(24, 26 + jj); ctx.lineTo(10, -30); ctx.lineTo(-10 - jj, -30); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(46,46,51,0.45)'; ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) { const y = -18 + i * 8; ctx.beginPath(); ctx.moveTo(-3, y); ctx.lineTo(3, y); ctx.stroke(); }
    const sw = Math.cos(((e.ticks || 0) + k) * Math.PI) * 0.55;
    ctx.save(); ctx.translate(0, 18); ctx.rotate(sw);
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -46); ctx.stroke();
    ctx.fillStyle = warn ? C.red : C.graphite; ctx.fillRect(-5, -34, 10, 7);
    ctx.restore();
  }
}
function drawFausse(e, fr, fl) {
  if (e.phase === 'aim') { ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.4; ctx.setLineDash([16, 10]); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(e.cx * 420, e.cy * 420); ctx.stroke(); ctx.restore(); }
  const enraged = e.hp < e.maxHp / 2, wob = Math.sin(G.time * (enraged ? 9 : 5));
  ctx.save(); ctx.scale(1 + wob * 0.06, 1 - wob * 0.06); ctx.rotate(Math.sin(G.time * 1.3) * 0.12);
  const j = (fr - 1) * 2;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = fl ? '#e0606a' : C.red; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(48, -8); ctx.lineTo(50 + j, -150); ctx.stroke();
  ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(50 + j, -150); ctx.bezierCurveTo(96, -120 + j, 92, -88, 74, -62); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(50 + j, -118); ctx.bezierCurveTo(92, -90 + j, 88, -60, 72, -36); ctx.stroke();
  ctx.save(); ctx.rotate(-0.4);
  ctx.fillStyle = fl ? 'rgba(226,100,108,0.9)' : 'rgba(200,66,74,0.88)';
  ctx.beginPath(); ctx.ellipse(0, 0, 62 + j, 44, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.inkDeep; ctx.globalAlpha = 0.35; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();
  // un bémol de travers, collé de biais : elle n'est jamais dans le ton
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 3; ctx.globalAlpha = 0.8;
  ctx.beginPath(); ctx.moveTo(-86, -64); ctx.lineTo(-88, -18); ctx.bezierCurveTo(-70, -30, -64, -44, -86, -40); ctx.stroke();
  ctx.restore();
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x), ex = Math.cos(la) * 7, ey = Math.sin(la) * 7;
  ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(-6, -4, 20, 14, -0.4, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.inkDeep; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(-6 + ex, -4 + ey, 6.5, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-28, -26 - (enraged ? 6 : 0)); ctx.lineTo(10, -20 + (enraged ? 4 : 0)); ctx.stroke();
}
// Les notes tirées : une tête rouge et une hampe ; annoncées en pointillés avant de partir
function drawNoteBullets() {
  for (const b of G.ebul) {
    if (!b.note) continue;
    ctx.save(); ctx.translate(b.x, b.y);
    ctx.globalAlpha = b.wait > 0 ? 0.25 + 0.25 * Math.sin(G.time * 20) : 1;
    ctx.fillStyle = C.red; ctx.save(); ctx.rotate(-0.4); ctx.beginPath(); ctx.ellipse(0, 0, 7.5, 5.4, 0, 0, TAU); ctx.fill(); ctx.restore();
    ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(6.5, -1); ctx.lineTo(6.5, -17); ctx.stroke();
    if (b.wait > 0) { ctx.setLineDash([5, 6]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.sign(b.vx) * 60, 0); ctx.stroke(); }
    ctx.restore();
  }
  const m = G.marks, mt = m ? G.time - m.t0 : 9;
  if (mt < 1.6) txt('’', m.x, m.y, 60, { color: C.ink, alpha: 1 - mt / 1.6 });   // la respiration : là où la portée laisse passer
}
function drawWaves() {
  for (const wv of G.waves) {
    const k = Math.min(1, wv.t / wv.dur), rr = wv.r * ease(k);
    ctx.save(); ctx.globalAlpha = Math.max(0, 1 - wv.t / (wv.dur + 0.25)); ctx.strokeStyle = C.red; ctx.lineWidth = 5 * (1 - k) + 2;
    ctx.beginPath(); ctx.arc(wv.x, wv.y, rr, 0, TAU); ctx.stroke(); ctx.restore();
  }
}
