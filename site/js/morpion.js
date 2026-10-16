// Le morpion (chapitre VII) : une grille de trois sur trois est tracée sur le brouillon. Reste un instant dans une case
// pour y dessiner ton O ; les X répondent au crayon rouge. Trois O alignés : la page entière est frappée.
// Trois X alignés : leur trait barre la page. Grille pleine : match nul, on recommence.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const MORPION = { first: 8, again: 20, retry: 12, cell: 124, hold: 0.55, xDelay: 0.9, radius: 560, d0: 420, d1: 720, endDur: 1.3 };
const LINES3 = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];

function writeMorpion() {
  const p = G.p, half = MORPION.cell * 1.5 + 60;
  let x = p.x, y = p.y;
  for (let i = 0; i < 30; i++) {
    const a = rnd(TAU), d = rnd(MORPION.d0, MORPION.d1);
    x = clamp(p.x + Math.cos(a) * d, half, WORLD.w - half); y = clamp(p.y + Math.sin(a) * d, half, WORLD.h - half);
    if (Math.hypot(x - p.x, y - p.y) > 330) break;
  }
  G.morpion = { x, y, cells: [0, 0, 0, 0, 0, 0, 0, 0, 0], at: [], turn: 1, hold: -1, holdT: 0, xT: 0, t: 0, end: null, endT: 0, line: null, jit: rnd(1000) };
  AU.play('morpionNew');
  if (!G.morpionSeen) { G.morpionSeen = true; caption('Nouveau : une partie de morpion !', 3.4, 'green'); caption('Reste dans une case pour y poser ton O. Aligne-en trois !', 3.6, 'green'); }
  else caption(pick(['Une nouvelle partie de morpion !', 'On rejoue ? Les O commencent.', 'Revanche !']), 2.2, 'green');
}
const cellXY = (M, i) => ({ x: M.x + (i % 3 - 1) * MORPION.cell, y: M.y + (Math.floor(i / 3) - 1) * MORPION.cell });
function cellAt(M, x, y) {
  const c = Math.floor((x - M.x) / MORPION.cell + 1.5), r = Math.floor((y - M.y) / MORPION.cell + 1.5);
  return c < 0 || c > 2 || r < 0 || r > 2 ? -1 : r * 3 + c;
}
function lineOf(cells, who) { return LINES3.find(l => l.every(i => cells[i] === who)) || null; }
// Une case qui complète (ou bloque) un alignement de « who »
function threat(cells, who) {
  for (const l of LINES3) { const mine = l.filter(i => cells[i] === who).length, free = l.filter(i => !cells[i]); if (mine === 2 && free.length === 1) return free[0]; }
  return -1;
}
// Les X jouent bien, mais pas parfaitement : ils gagnent quand ils peuvent, et ne bloquent qu'une fois sur deux
function chooseX(M) {
  const free = M.cells.map((c, i) => c ? -1 : i).filter(i => i >= 0);
  const win = threat(M.cells, 2); if (win >= 0) return win;
  const block = threat(M.cells, 1); if (block >= 0 && rand() < 0.5) return block;
  if (!M.cells[4] && rand() < 0.5) return 4;
  return pick(free);
}
// Le pilote automatique joue comme un enfant appliqué : gagner, bloquer, le centre, les coins
function botCell(M) {
  const win = threat(M.cells, 1); if (win >= 0) return win;
  const block = threat(M.cells, 2); if (block >= 0) return block;
  for (const i of [4, 0, 2, 6, 8, 1, 3, 5, 7]) if (!M.cells[i]) return i;
  return -1;
}
function morpionTarget() {
  const M = G.morpion; if (!M || M.end || M.turn !== 1) return null;
  const i = botCell(M); return i < 0 ? null : cellXY(M, i);
}
function morpionHolding() {
  const M = G.morpion; if (!M || M.end || M.turn !== 1) return false;
  const i = botCell(M), c = cellXY(M, i);
  return i >= 0 && Math.abs(G.p.x - c.x) < MORPION.cell * 0.36 && Math.abs(G.p.y - c.y) < MORPION.cell * 0.36;
}

function stepMorpion(dt) {
  if (CH().paper !== 'brouillon') return;
  for (const f of G.morpionFx) f.t += dt;
  G.morpionFx = G.morpionFx.filter(f => f.t < f.dur);
  const M = G.morpion;
  if (!M) { if (G.t >= G.nextMorpion) writeMorpion(); return; }
  M.t += dt;
  if (M.end) { M.endT += dt; if (M.endT >= MORPION.endDur) G.morpion = null; return; }
  if (M.turn === 1) {
    const p = G.p, c = cellAt(M, p.x, p.y);
    if (c >= 0 && !M.cells[c]) {
      if (M.hold !== c) { M.hold = c; M.holdT = 0; }
      M.holdT += dt;
      if (M.holdT >= MORPION.hold) place(M, c, 1);
    } else { M.hold = -1; M.holdT = 0; }
  } else {
    M.xT -= dt;
    if (M.xT <= 0) place(M, chooseX(M), 2);
  }
}
function place(M, i, who) {
  M.cells[i] = who; M.at[i] = M.t; M.hold = -1; M.holdT = 0;
  AU.play(who === 1 ? 'morpionO' : 'morpionX');
  const line = lineOf(M.cells, who);
  if (line) { M.end = who === 1 ? 'win' : 'lose'; M.line = line; M.endT = 0; if (who === 1) winMorpion(M); else loseMorpion(M); return; }
  if (M.cells.every(c => c)) { M.end = 'nul'; M.endT = 0; nulMorpion(M); return; }
  M.turn = who === 1 ? 2 : 1;
  if (who === 1) M.xT = MORPION.xDelay;
}
function morpionImprint(M, alpha) {   // la partie reste sur la page, au crayon
  const s = MORPION.cell;
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.globalAlpha = alpha; sctx.strokeStyle = C.graphite; sctx.lineWidth = 3; sctx.lineCap = 'round';
  sctx.beginPath();
  for (const o of [-0.5, 0.5]) { sctx.moveTo(M.x + o * s, M.y - 1.5 * s); sctx.lineTo(M.x + o * s, M.y + 1.5 * s); sctx.moveTo(M.x - 1.5 * s, M.y + o * s); sctx.lineTo(M.x + 1.5 * s, M.y + o * s); }
  sctx.stroke();
  M.cells.forEach((c, i) => {
    if (!c) return;
    const q = cellXY(M, i); sctx.strokeStyle = c === 1 ? C.ink : C.red; sctx.beginPath();
    if (c === 1) sctx.arc(q.x, q.y, s * 0.3, 0, TAU); else { const r = s * 0.27; sctx.moveTo(q.x - r, q.y - r); sctx.lineTo(q.x + r, q.y + r); sctx.moveTo(q.x + r, q.y - r); sctx.lineTo(q.x - r, q.y + r); }
    sctx.stroke();
  });
  sctx.restore();
}
function winMorpion(M) {
  const p = G.p, n = ++G.morpions, X = M.x, Y = M.y, R = MORPION.radius;
  G.nextMorpion = G.t + MORPION.again;
  G.score += 500 + 100 * Math.min(6, n); G.xp += 8 + 2 * Math.min(6, n); p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('morpionWin');
  caption(n === 1 ? 'Morpion ! Trois O alignés : la page entière tremble !' : pick(['Morpion !', 'Trois O, bien alignés !', 'Gagné ! Les X n’ont rien vu venir.']), n === 1 ? 3 : 2.2, 'green');
  G.cam.shake = Math.max(G.cam.shake, 12);
  G.morpionFx.push({ x: X, y: Y, t: 0, dur: 1.2, kind: 'win' });
  morpionImprint(M, 0.22);
  query(X, Y, R + 60, tmpA);
  for (const e of tmpA) {
    const dx = e.x - X, dy = e.y - Y, d = Math.hypot(dx, dy) || 1;
    if (e.dead || d > R + e.r) continue;
    hurtEnemy(e, (e.isBoss ? 90 : 22 + 4 * Math.min(6, n)) * G.S.dmg, 'morpion');
    if (!e.isBoss) { e.vx += dx / d * 440; e.vy += dy / d * 440; }
  }
  const R2 = R * R;
  for (const b of G.ebul) if ((b.x - X) ** 2 + (b.y - Y) ** 2 < R2) b.life = 0;
  G.fautes = G.fautes.filter(f => (f.x - X) ** 2 + (f.y - Y) ** 2 > R2);
  G.bars = G.bars.filter(b => b.t >= b.warn);
  for (const tp of G.tapes) tp.pts = tp.pts.filter(q => (q.x - X) ** 2 + (q.y - Y) ** 2 > R2);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; G.items.push({ x: X, y: Y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, ch: pick(LETTER_POOL), value: 7, rare: true, need: false, t: rnd(TAU), pull: false, rot: rnd(-0.4, 0.4) }); }
  for (let i = 0; i < 40; i++) { const a = rnd(TAU), s = rnd(160, 560); G.parts.push({ x: X, y: Y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.9, max: 0.9, size: rnd(3, 6), color: i % 3 ? C.ink : C.gold, drag: 3 }); }
}
function loseMorpion(M) {   // les X gagnent : leur trait barre la page, d'un bord à l'autre
  G.nextMorpion = G.t + MORPION.retry;
  const a = cellXY(M, M.line[0]), b = cellXY(M, M.line[2]), an = Math.atan2(b.y - a.y, b.x - a.x), L = 700;
  G.bars.push({ x1: M.x - Math.cos(an) * L, y1: M.y - Math.sin(an) * L, x2: M.x + Math.cos(an) * L, y2: M.y + Math.sin(an) * L, t: 0, warn: 0.8, act: 0.3, hit: false });
  AU.play('morpionLose');
  caption(G.morpionLost ? 'Les X ont gagné !' : 'Les X ont gagné : sors de leur trait !', 2.2, 'pink');
  G.morpionLost = true;
}
function nulMorpion(M) {
  G.nextMorpion = G.t + MORPION.retry;
  G.xp += 4; G.score += 150;
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  for (let i = 0; i < 2; i++) G.items.push({ x: M.x, y: M.y, vx: rnd(-150, 150), vy: rnd(-150, 150), ch: pick(LETTER_POOL), value: 5, rare: true, need: false, t: rnd(TAU), pull: false, rot: rnd(-0.4, 0.4) });
  AU.play('morpionNul');
  caption('Match nul : on recommence !', 2, 'hl');
}

/* ===================== Dessin ===================== */
function morpionStroke(x1, y1, x2, y2, k, jit) {   // un trait de crayon qui tremble un peu, tracé jusqu'à k
  const n = 8, ex = lerp(x1, x2, k), ey = lerp(y1, y2, k);
  ctx.beginPath(); ctx.moveTo(x1, y1);
  for (let i = 1; i <= n; i++) { const t = i / n; ctx.lineTo(lerp(x1, ex, t) + Math.sin(jit + i * 2.1) * 2, lerp(y1, ey, t) + Math.cos(jit + i * 1.7) * 2); }
  ctx.stroke();
}
function drawO(x, y, r, k, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.strokeStyle = C.ink; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.92, -0.2, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke(); ctx.restore();
}
function drawX(x, y, r, k) {
  ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 8; ctx.lineCap = 'round';
  const k1 = clamp(k * 2, 0, 1), k2 = clamp(k * 2 - 1, 0, 1);
  ctx.beginPath(); ctx.moveTo(x - r, y - r); ctx.lineTo(x - r + 2 * r * k1, y - r + 2 * r * k1); ctx.stroke();
  if (k2 > 0) { ctx.beginPath(); ctx.moveTo(x + r, y - r); ctx.lineTo(x + r - 2 * r * k2, y - r + 2 * r * k2); ctx.stroke(); }
  ctx.restore();
}
function drawMorpion(v) {
  for (const f of G.morpionFx) {   // l'onde du morpion gagné : des O qui s'envolent en couronne
    const q = f.t / f.dur, rr = MORPION.radius * ease(q);
    ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = C.gold; ctx.lineWidth = 10 * (1 - q) + 2; ctx.beginPath(); ctx.arc(f.x, f.y, rr, 0, TAU); ctx.stroke();
    ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
    for (let i = 0; i < 14; i++) { const an = i / 14 * TAU + q; ctx.beginPath(); ctx.arc(f.x + Math.cos(an) * rr, f.y + Math.sin(an) * rr, 9, 0, TAU); ctx.stroke(); }
    ctx.restore();
    if (q < 0.7) txt('morpion !', f.x, f.y - 230 - q * 40, 46, { color: C.ink, alpha: 1 - q / 0.7, hl: C.hlGold });
  }
  const M = G.morpion; if (!M) return;
  const s = MORPION.cell, half = s * 1.5;
  if (M.x + half + 60 < v.x0 || M.x - half - 60 > v.x1 || M.y + half + 90 < v.y0 || M.y - half - 60 > v.y1) return;
  const appear = clamp(M.t / 0.8, 0, 1), fade = M.end ? clamp(1 - (M.endT - 0.7) / (MORPION.endDur - 0.7), 0, 1) : 1;
  ctx.save(); ctx.globalAlpha = fade;
  // la case où tu te tiens, surlignée, et ton O qui se dessine
  if (M.turn === 1 && !M.end) {
    const c = cellAt(M, G.p.x, G.p.y);
    for (let i = 0; i < 9; i++) if (!M.cells[i]) { const q = cellXY(M, i); ctx.fillStyle = i === c ? 'rgba(246,231,94,0.45)' : 'rgba(246,231,94,0.12)'; ctx.fillRect(q.x - s / 2 + 6, q.y - s / 2 + 6, s - 12, s - 12); }
  }
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 5; ctx.lineCap = 'round';
  [-0.5, 0.5].forEach((o, k) => {
    morpionStroke(M.x + o * s, M.y - half, M.x + o * s, M.y + half, clamp(appear * 4 - k, 0, 1), M.jit + k);
    morpionStroke(M.x - half, M.y + o * s, M.x + half, M.y + o * s, clamp(appear * 4 - 2 - k, 0, 1), M.jit + 5 + k);
  });
  M.cells.forEach((c, i) => {
    if (!c) return;
    const q = cellXY(M, i), k = clamp((M.t - M.at[i]) / 0.3, 0, 1);
    if (c === 1) drawO(q.x, q.y, s * 0.3, k); else drawX(q.x, q.y, s * 0.27, k);
  });
  if (M.hold >= 0 && M.turn === 1 && !M.end) { const q = cellXY(M, M.hold); drawO(q.x, q.y, s * 0.3, M.holdT / MORPION.hold, 0.45); }
  if (M.line) {   // le trait de la victoire, doré pour les O, rouge pour les X
    const a = cellXY(M, M.line[0]), b = cellXY(M, M.line[2]), dx = (b.x - a.x) * 0.22, dy = (b.y - a.y) * 0.22, k = clamp(M.endT / 0.3, 0, 1);
    ctx.strokeStyle = M.end === 'win' ? C.gold : C.red; ctx.lineWidth = 12;
    morpionStroke(a.x - dx, a.y - dy, b.x + dx, b.y + dy, k, M.jit + 9);
  }
  ctx.restore();
  const label = M.end === 'win' ? 'gagné !' : M.end === 'lose' ? 'perdu…' : M.end === 'nul' ? 'match nul' : M.turn === 1 ? 'à toi : pose ton O' : 'les X réfléchissent…';
  txt(label, M.x, M.y - half - 34, 30, { color: M.end === 'lose' || M.turn === 2 && !M.end ? C.red : C.ink, alpha: appear * fade, hl: M.turn === 1 && !M.end ? C.hl : null });
}
function drawMorpionArrow() {
  if (G.state !== 'play') return;
  const M = G.morpion; if (M && !M.end) edgeArrow(M.x, M.y);
}
