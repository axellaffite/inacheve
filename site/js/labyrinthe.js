// Le labyrinthe du cahier de vacances (chapitre VIII) : un vrai labyrinthe imprimé sur la page, dont les murs t'arrêtent.
// Les ratures, elles, n'ont pas lu la consigne : elles passent par-dessus. Entre par « entrée », sors par « sortie ».
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const LABY = { first: 8, again: 20, cell: 92, n0: 6, nMax: 9, wall: 7, radius: 580, endDur: 1.4, trailMax: 700, step: 8 };
const LABY_DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]];

// Un labyrinthe parfait (un seul chemin entre deux cases), creusé au hasard du jeu
function carveLaby(n) {
  const hw = Array.from({ length: n + 1 }, () => Array(n).fill(true)), vw = Array.from({ length: n }, () => Array(n + 1).fill(true));
  const seen = Array.from({ length: n }, () => Array(n).fill(false)), stack = [[Math.floor(rnd(n)), Math.floor(rnd(n))]];
  seen[stack[0][0]][stack[0][1]] = true;
  while (stack.length) {
    const [r, c] = stack[stack.length - 1];
    const next = LABY_DIRS.map(([dr, dc]) => [r + dr, c + dc]).filter(([nr, nc]) => nr >= 0 && nc >= 0 && nr < n && nc < n && !seen[nr][nc]);
    if (!next.length) { stack.pop(); continue; }
    const [nr, nc] = pick(next);
    if (nr !== r) hw[Math.max(r, nr)][c] = false; else vw[r][Math.max(c, nc)] = false;
    seen[nr][nc] = true; stack.push([nr, nc]);
  }
  return { hw, vw };
}
// une ouverture sur un côté : la case du bord, et la case « dehors » juste derrière
function labyDoor(M, side, i) {
  const n = M.n;
  if (side === 'L') { M.vw[i][0] = false; return { r: i, c: 0, out: { r: i, c: -1 }, side }; }
  if (side === 'R') { M.vw[i][n] = false; return { r: i, c: n - 1, out: { r: i, c: n }, side }; }
  if (side === 'T') { M.hw[0][i] = false; return { r: 0, c: i, out: { r: -1, c: i }, side }; }
  M.hw[n][i] = false; return { r: n - 1, c: i, out: { r: n, c: i }, side };
}
const OPPOSITE = { L: 'R', R: 'L', T: 'B', B: 'T' };

function writeLaby() {
  const p = G.p, n = Math.min(LABY.nMax, LABY.n0 + (G.labys || 0)), S = LABY.cell, half = n * S / 2;
  let cx = 0, cy = 0, ok = false;
  for (let i = 0; i < 40 && !ok; i++) {
    const a = rnd(TAU), d = half * 1.42 + rnd(140, 380);
    cx = clamp(p.x + Math.cos(a) * d, half + 100, WORLD.w - half - 100); cy = clamp(p.y + Math.sin(a) * d, half + 100, WORLD.h - half - 100);
    ok = Math.abs(p.x - cx) > half + 90 || Math.abs(p.y - cy) > half + 90;
  }
  if (!ok) { G.nextLaby = G.t + 3; return; }
  const M = { cx, cy, n, S, x0: cx - half, y0: cy - half, ...carveLaby(n), segs: [], t: 0, trail: [], inEnt: false, end: false, endT: 0, jit: rnd(1000) };
  const dx = p.x - cx, dy = p.y - cy, side = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 'L' : 'R') : (dy < 0 ? 'T' : 'B');
  M.ent = labyDoor(M, side, Math.floor(rnd(n))); M.ex = labyDoor(M, OPPOSITE[side], Math.floor(rnd(n)));
  for (let r = 0; r <= n; r++) for (let c = 0; c < n; c++) if (M.hw[r][c]) M.segs.push({ x1: M.x0 + c * S, y1: M.y0 + r * S, x2: M.x0 + (c + 1) * S, y2: M.y0 + r * S, h: true });
  for (let r = 0; r < n; r++) for (let c = 0; c <= n; c++) if (M.vw[r][c]) M.segs.push({ x1: M.x0 + c * S, y1: M.y0 + r * S, x2: M.x0 + c * S, y2: M.y0 + (r + 1) * S, h: false });
  G.laby = M;
  AU.play('labyNew');
  if (!G.labySeen) { G.labySeen = true; caption('Nouveau : un labyrinthe ! Ses murs t’arrêtent…', 3.4, 'green'); caption('Entre par « entrée », ressors par « sortie ».', 3.6, 'green'); }
  else caption(pick(['Un nouveau labyrinthe !', 'Encore un labyrinthe, plus grand.', 'Page suivante : un labyrinthe !']), 2.2, 'green');
}

const labyCenter = (M, r, c) => ({ x: M.x0 + (c + 0.5) * M.S, y: M.y0 + (r + 0.5) * M.S });
const labyCell = (M, x, y) => ({ r: Math.floor((y - M.y0) / M.S), c: Math.floor((x - M.x0) / M.S) });
const labyIn = (M, q) => q.r >= 0 && q.c >= 0 && q.r < M.n && q.c < M.n;
const sameCell = (a, b) => a.r === b.r && a.c === b.c;
const labyKnown = (M, q) => labyIn(M, q) || sameCell(q, M.ent.out) || sameCell(q, M.ex.out);
function labyOpen(M, q, dr, dc) {
  const nq = { r: q.r + dr, c: q.c + dc };
  if (!labyKnown(M, q) || !labyKnown(M, nq)) return false;
  if (dc) return q.r >= 0 && q.r < M.n && !M.vw[q.r][Math.max(q.c, nq.c)];
  return q.c >= 0 && q.c < M.n && !M.hw[Math.max(q.r, nq.r)][q.c];
}
function labyPath(M, from, to) {   // parcours en largeur, de case en case
  const key = q => (q.r + 1) * 64 + q.c + 1, prev = new Map([[key(from), null]]), queue = [from];
  while (queue.length) {
    const q = queue.shift();
    if (sameCell(q, to)) { const path = []; for (let k = q; k; k = prev.get(key(k))) path.unshift(k); return path; }
    for (const [dr, dc] of LABY_DIRS) {
      const nq = { r: q.r + dr, c: q.c + dc };
      if (!prev.has(key(nq)) && labyOpen(M, q, dr, dc)) { prev.set(key(nq), q); queue.push(nq); }
    }
  }
  return null;
}

// La goutte se cogne aux murs : on avance par petits pas et on se décale hors de chaque mur trop proche
function labyMove(p, nx, ny) {
  const M = G.laby;
  if (!M || M.end) { p.x = nx; p.y = ny; return; }
  const pad = p.r + LABY.wall / 2, m = pad + 40;
  const far = (x, y) => x < M.x0 - m || y < M.y0 - m || x > M.x0 + M.n * M.S + m || y > M.y0 + M.n * M.S + m;
  if (far(p.x, p.y) && far(nx, ny)) { p.x = nx; p.y = ny; return; }
  const dx = nx - p.x, dy = ny - p.y, steps = Math.max(1, Math.ceil(Math.hypot(dx, dy) / LABY.step));
  let x = p.x, y = p.y;
  for (let s = 0; s < steps; s++) {
    x += dx / steps; y += dy / steps;
    for (const w of M.segs) {
      const qx = clamp(x, Math.min(w.x1, w.x2), Math.max(w.x1, w.x2)), qy = clamp(y, Math.min(w.y1, w.y2), Math.max(w.y1, w.y2));
      const ex = x - qx, ey = y - qy, d2 = ex * ex + ey * ey;
      if (d2 >= pad * pad) continue;
      const d = Math.sqrt(d2);
      if (d > 0.001) { x = qx + ex / d * pad; y = qy + ey / d * pad; } else if (w.h) y = qy + (dy > 0 ? -pad : pad); else x = qx + (dx > 0 ? -pad : pad);
    }
  }
  p.x = clamp(x, p.r, WORLD.w - p.r); p.y = clamp(y, p.r, WORLD.h - p.r);
}
// Le ballon de plage rebondit sur les murs : renvoie sa nouvelle direction, ou null
function labyBounce(x, y, r, bx, by) {
  const M = G.laby; if (!M || M.end) return null;
  for (const w of M.segs) {
    if (segDist(x, y, w.x1, w.y1, w.x2, w.y2) > r + LABY.wall / 2) continue;
    if (w.h && Math.sign(w.y1 - y) === Math.sign(by)) return { x: bx, y: -by };
    if (!w.h && Math.sign(w.x1 - x) === Math.sign(bx)) return { x: -bx, y: by };
  }
  return null;
}

function stepLaby(dt) {
  if (CH().paper !== 'vacances') return;
  for (const f of G.labyFx) f.t += dt;
  G.labyFx = G.labyFx.filter(f => f.t < f.dur);
  const M = G.laby;
  if (!M) { if (G.t >= G.nextLaby) writeLaby(); return; }
  M.t += dt;
  if (M.end) { M.endT += dt; if (M.endT >= LABY.endDur) G.laby = null; return; }
  const p = G.p, q = labyCell(M, p.x, p.y), inside = labyIn(M, q);
  if (inside && sameCell(q, M.ent)) M.inEnt = true;
  if (!inside && !sameCell(q, M.ex.out) && !sameCell(q, M.ent.out)) { M.inEnt = false; M.trail.length = 0; }   // ressorti par où on est entré
  if (M.inEnt && inside) {
    const last = M.trail[M.trail.length - 1];
    if ((!last || (last.x - p.x) ** 2 + (last.y - p.y) ** 2 > 14 * 14) && M.trail.length < LABY.trailMax) M.trail.push({ x: p.x, y: p.y });
    if (!M.inSeen) { M.inSeen = true; AU.play('labyIn'); }
  }
  if (M.inEnt && sameCell(q, M.ex.out)) solveLaby(M);
}
function labyImprint(M, alpha) {   // le labyrinthe reste sur la page, avec le chemin au crayon de couleur
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.lineCap = 'round'; sctx.lineJoin = 'round';
  sctx.globalAlpha = alpha; sctx.strokeStyle = C.graphite; sctx.lineWidth = 3; sctx.beginPath();
  for (const w of M.segs) { sctx.moveTo(w.x1, w.y1); sctx.lineTo(w.x2, w.y2); }
  sctx.stroke();
  sctx.globalAlpha = alpha * 1.6; sctx.strokeStyle = C.fire; sctx.lineWidth = 5; sctx.beginPath();
  M.trail.forEach((q, i) => i ? sctx.lineTo(q.x, q.y) : sctx.moveTo(q.x, q.y));
  sctx.stroke(); sctx.restore();
}
function solveLaby(M) {
  const p = G.p, n = ++G.labys, k = Math.min(6, n), X = p.x, Y = p.y, R = LABY.radius;
  M.end = true; M.endT = 0; G.nextLaby = G.t + LABY.again;
  G.score += 500 + 120 * k; G.xp += 8 + 2 * k; p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('labyWin');
  caption(n === 1 ? 'Sorti ! Le soleil d’été balaie toute la page !' : pick(['Sorti du labyrinthe !', 'Bravo, par ici la sortie !', 'Trouvé ! Même pas perdu.']), n === 1 ? 3 : 2.2, 'green');
  G.cam.shake = Math.max(G.cam.shake, 12);
  G.labyFx.push({ x: X, y: Y, t: 0, dur: 1.3 });
  labyImprint(M, 0.18);
  query(X, Y, R + 60, tmpA);
  for (const e of tmpA) {
    const dx = e.x - X, dy = e.y - Y, d = Math.hypot(dx, dy) || 1;
    if (e.dead || d > R + e.r) continue;
    hurtEnemy(e, (e.isBoss ? 90 : 24 + 4 * k) * G.S.dmg, 'laby');
    if (!e.isBoss) { e.vx += dx / d * 440; e.vy += dy / d * 440; }
  }
  const R2 = R * R;
  for (const b of G.ebul) if ((b.x - X) ** 2 + (b.y - Y) ** 2 < R2) b.life = 0;
  G.lobs = G.lobs.filter(l => (l.x - X) ** 2 + (l.y - Y) ** 2 > R2);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; G.items.push({ x: X, y: Y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, ch: pick(LETTER_POOL), value: 7, rare: true, need: false, t: rnd(TAU), pull: false, rot: rnd(-0.4, 0.4) }); }
  for (let i = 0; i < 40; i++) { const a = rnd(TAU), s = rnd(160, 560); G.parts.push({ x: X, y: Y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.9, max: 0.9, size: rnd(3, 6), color: i % 3 ? C.fire : C.gold, drag: 3 }); }
}

/* ---------- Le pilote : le chemin le plus court, case par case ---------- */
function labyRoute(M, p, E) {   // contourner le labyrinthe par ses coins pour rejoindre l'entrée
  const L = M.x0 - 16, T = M.y0 - 16, Rr = M.x0 + M.n * M.S + 16, B = M.y0 + M.n * M.S + 16;
  const blocked = (ax, ay, bx, by) => {   // le segment traverse-t-il le rectangle ? (Liang-Barsky)
    let t0 = 0, t1 = 1; const dx = bx - ax, dy = by - ay;
    for (const [pp, qq] of [[-dx, ax - L], [dx, Rr - ax], [-dy, ay - T], [dy, B - ay]]) {
      if (pp === 0) { if (qq < 0) return false; continue; }
      const r = qq / pp; if (pp < 0) { if (r > t1) return false; if (r > t0) t0 = r; } else { if (r < t0) return false; if (r < t1) t1 = r; }
    }
    return t1 - t0 > 0.001;
  };
  if (!blocked(p.x, p.y, E.x, E.y)) return E;
  let best = null, bs = Infinity;
  for (const c of [[L - 60, T - 60], [Rr + 60, T - 60], [L - 60, B + 60], [Rr + 60, B + 60]]) {
    if (blocked(p.x, p.y, c[0], c[1])) continue;
    const s = Math.hypot(c[0] - p.x, c[1] - p.y) + Math.hypot(E.x - c[0], E.y - c[1]) * (blocked(c[0], c[1], E.x, E.y) ? 1.6 : 1);
    if (s < bs) { bs = s; best = { x: c[0], y: c[1] }; }
  }
  return best || E;
}
function labyTarget() { G.labyGoal = labyGoalAt(); return G.labyGoal; }
function labyGoalAt() {
  const M = G.laby; if (!M || M.end) return null;
  const p = G.p, q = labyCell(M, p.x, p.y);
  if (!labyKnown(M, q)) return labyRoute(M, p, labyCenter(M, M.ent.out.r, M.ent.out.c));
  const path = labyPath(M, q, M.inEnt ? M.ex.out : M.ent);
  if (!path) return labyCenter(M, q.r, q.c);
  if (path.length < 2) return labyCenter(M, q.r, q.c);
  const cc = labyCenter(M, q.r, q.c), nx = path[1], nc = labyCenter(M, nx.r, nx.c);
  const horiz = nx.r === q.r, off = horiz ? Math.abs(p.y - cc.y) : Math.abs(p.x - cc.x);
  if (off > 14) return horiz ? { x: p.x + Math.sign(nc.x - p.x) * 4, y: cc.y } : { x: cc.x, y: p.y + Math.sign(nc.y - p.y) * 4 };   // se recentrer avant de tourner
  return nc;
}
// le pilote est dans le labyrinthe (ou sur le pas de la porte) : il suit le chemin, les murs empêchent d'esquiver
function labyGuiding() {
  const M = G.laby; if (!M || M.end) return false;
  return labyKnown(M, labyCell(M, G.p.x, G.p.y));
}

/* ---------- Dessins ---------- */
function drawLaby(v) {
  for (const f of G.labyFx) {   // le soleil d'été : une couronne de rayons dorés
    const q = f.t / f.dur, rr = LABY.radius * ease(q);
    ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = C.gold; ctx.lineWidth = 10 * (1 - q) + 2; ctx.beginPath(); ctx.arc(f.x, f.y, rr, 0, TAU); ctx.stroke();
    ctx.strokeStyle = C.fire; ctx.lineWidth = 5; ctx.beginPath();
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU + q; ctx.moveTo(f.x + Math.cos(a) * rr * 0.86, f.y + Math.sin(a) * rr * 0.86); ctx.lineTo(f.x + Math.cos(a) * rr, f.y + Math.sin(a) * rr); }
    ctx.stroke(); ctx.restore();
    if (q < 0.7) txt('sorti !', f.x, f.y - 120 - q * 40, 46, { color: C.ink, alpha: 1 - q / 0.7, hl: C.hlGold });
  }
  const M = G.laby; if (!M) return;
  const W2 = M.n * M.S;
  if (M.x0 + W2 + 140 < v.x0 || M.x0 - 140 > v.x1 || M.y0 + W2 + 140 < v.y0 || M.y0 - 140 > v.y1) return;
  const appear = clamp(M.t / 1, 0, 1), fade = M.end ? clamp(1 - M.endT / LABY.endDur, 0, 1) : 1;
  ctx.save(); ctx.globalAlpha = fade;
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; roundRect(M.x0 - 26, M.y0 - 74, W2 + 52, W2 + 100, 18); ctx.fill();
  ctx.strokeStyle = '#4fb3c8'; ctx.lineWidth = 4; ctx.stroke();
  ctx.fillStyle = '#4fb3c8'; roundRect(M.x0 - 26, M.y0 - 74, W2 + 52, 44, 18); ctx.fill(); ctx.fillRect(M.x0 - 26, M.y0 - 50, W2 + 52, 20);
  ctx.restore();
  txt('Labyrinthe : aide la goutte à sortir !', M.cx, M.y0 - 52, 26, { color: '#ffffff', alpha: fade * appear });
  ctx.save(); ctx.globalAlpha = fade;
  if (M.trail.length > 1) {   // le chemin au crayon de couleur
    ctx.strokeStyle = 'rgba(232,116,44,0.75)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
    M.trail.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.lineTo(G.p.x, G.p.y); ctx.stroke();
  }
  ctx.strokeStyle = '#24304f'; ctx.lineWidth = LABY.wall; ctx.lineCap = 'round'; ctx.beginPath();
  const shown = Math.ceil(M.segs.length * appear);
  for (let i = 0; i < shown; i++) { const w = M.segs[i]; ctx.moveTo(w.x1, w.y1); ctx.lineTo(w.x2, w.y2); }
  ctx.stroke();
  ctx.restore();
  for (const [d, label, col] of [[M.ent, 'entrée', C.ink], [M.ex, 'sortie', C.red]]) {
    const o = labyCenter(M, d.out.r, d.out.c), c = labyCenter(M, d.r, d.c), a = Math.atan2(c.y - o.y, c.x - o.x) + (d === M.ex ? Math.PI : 0);
    ctx.save(); ctx.globalAlpha = fade * appear; ctx.translate(o.x, o.y); ctx.rotate(a); ctx.strokeStyle = col; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(18, 0); ctx.moveTo(6, -11); ctx.lineTo(19, 0); ctx.lineTo(6, 11); ctx.stroke(); ctx.restore();
    const ly = d.side === 'T' ? o.y - 34 : d.side === 'B' ? o.y + 34 : o.y - 36;
    txt(label, o.x, ly, 28, { color: col, alpha: fade * appear, hl: d === (M.inEnt ? M.ex : M.ent) && !M.end ? C.hl : null });
  }
}
function drawLabyArrow() {
  if (G.state !== 'play') return;
  const M = G.laby; if (!M || M.end) return;
  const d = M.inEnt ? M.ex : M.ent, o = labyCenter(M, d.out.r, d.out.c);
  edgeArrow(o.x, o.y);
}
