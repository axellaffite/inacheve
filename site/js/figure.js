// La figure (chapitre III) : des points A, B, C… sont posés sur le papier millimétré. Relie-les dans l'ordre,
// reviens au point A pour fermer la figure, et tout ce qu'elle enferme est hachuré.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const FIGURE = { first: 8, again: 20, gap: 6, min: 3, max: 6 };
const FIGURE_NAMES = ['', '', '', 'Un triangle !', 'Un quadrilatère !', 'Un pentagone !', 'Un hexagone !'];
const LABELS = 'ABCDEF';

// Pose une nouvelle figure non loin du joueur, entièrement sur la page
function writeFigure() {
  const p = G.p, n = Math.min(FIGURE.max, FIGURE.min + G.figures), R = 170 + 20 * n;
  const a0 = rnd(TAU), off = rnd(140, 300);
  const cx = clamp(p.x + Math.cos(a0) * off, R + 70, WORLD.w - R - 70), cy = clamp(p.y + Math.sin(a0) * off, R + 70, WORLD.h - R - 70);
  const start = rnd(TAU), pts = [];
  for (let i = 0; i < n; i++) {
    const a = start + i / n * TAU + rnd(-0.18, 0.18), r = R * rnd(0.82, 1.08);
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, got: 0, label: LABELS[i] });
  }
  G.figure = { pts, prog: 0, wait: 0, t: 0, cx, cy, R };
  AU.play('figureNew');
  if (!G.figureSeen) { G.figureSeen = true; caption('Nouveau : relie les points dans l’ordre…', 3.4, 'green'); caption('… puis reviens au point A pour fermer la figure', 3.4, 'green'); }
  else caption('Une nouvelle figure, avec un côté de plus', 2.4, 'green');
}

// Le prochain point à toucher (après le dernier sommet, on revient au point A)
function figureTarget() {
  const F = G.figure; if (!F) return null;
  return F.prog < F.pts.length ? F.pts[F.prog] : F.pts[0];
}

function stepFigure(dt) {
  if (CH().paper !== 'milli') return;
  const F = G.figure;
  for (const f of G.fills) f.t += dt;
  G.fills = G.fills.filter(f => f.t < f.dur);
  if (!F) { if (G.t >= G.nextFigure) writeFigure(); return; }
  F.t += dt;
  for (const pt of F.pts) if (pt.got) pt.got += dt;
  if (F.prog > 0) {
    F.wait -= dt;
    if (F.wait <= 0) {   // trop lent : la gomme passe sur les traits, on reprend du point A
      for (const pt of F.pts) pt.got = 0;
      F.prog = 0; AU.play('figureLost');
      addText(F.pts[0].x, F.pts[0].y - 40, 'effacé… on reprend !', C.pencil, 24);
    }
  }
  const tg = figureTarget(), p = G.p;
  if (tg && (p.x - tg.x) ** 2 + (p.y - tg.y) ** 2 < (p.r + 20) ** 2) {
    if (F.prog >= F.pts.length) { closeFigure(F); return; }
    tg.got = 0.001; F.prog++; F.wait = FIGURE.gap;
    AU.play('figurePt', F.prog - 1);
    if (F.prog > 1) { const a = F.pts[F.prog - 2]; pencilStain(a.x, a.y, tg.x, tg.y, 0.25, 2.5); }
    for (let i = 0; i < 8; i++) { const a = rnd(TAU), s = rnd(60, 160); G.parts.push({ x: tg.x, y: tg.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5, max: 0.5, size: rnd(2, 3.5), color: C.gold, drag: 4 }); }
  }
}

function inPolygon(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > y) !== (b.y > y) && x < (b.x - a.x) * (y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
// Figure fermée : elle se remplit de hachures et frappe tout ce qu'elle enferme (et ce qui touche ses côtés)
function closeFigure(F) {
  const p = G.p, n = F.pts.length, pts = F.pts;
  G.figures++; G.figure = null; G.nextFigure = G.t + FIGURE.again;
  G.score += 140 * n; G.xp += 4 + n * 2; p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('figure', n);
  caption(FIGURE_NAMES[n] || 'Une figure !', 2.4, 'green');
  G.cam.shake = Math.max(G.cam.shake, 10);
  pencilStain(pts[n - 1].x, pts[n - 1].y, pts[0].x, pts[0].y, 0.25, 2.5);
  G.fills.push({ pts: pts.map(q => ({ x: q.x, y: q.y })), t: 0, dur: 1.3, n });
  const edge = (x, y) => { let m = 1e9; for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; m = Math.min(m, segDist(x, y, a.x, a.y, b.x, b.y)); } return m; };
  for (const e of G.enemies) {
    if (e.dead) continue;
    if (!inPolygon(e.x, e.y, pts) && edge(e.x, e.y) > e.r + 12) continue;
    hurtEnemy(e, (e.isBoss ? 95 : 24 + 4 * n) * G.S.dmg, 'figure');
  }
  for (const b of G.ebul) if (inPolygon(b.x, b.y, pts)) b.life = 0;
  G.lines = G.lines.filter(l => !inPolygon(l.x, l.y, pts));
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    for (let k = 0; k < 6; k++) { const t = k / 6; G.parts.push({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), vx: rnd(-90, 90), vy: rnd(-90, 90), life: 0.7, max: 0.7, size: rnd(2, 4), color: k % 2 ? C.gold : C.graphite, drag: 3 }); }
  }
}

/* ===================== Dessin ===================== */
function polyPath(pts) { ctx.beginPath(); pts.forEach((q, i) => i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)); ctx.closePath(); }
function drawFigure() {
  // les figures fermées : des hachures au crayon qui s'estompent
  for (const f of G.fills) {
    const k = f.t / f.dur, grow = ease(k * 3);
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const q of f.pts) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); }
    ctx.save(); polyPath(f.pts);
    ctx.fillStyle = C.hlGold; ctx.globalAlpha = 0.5 * (1 - k); ctx.fill();
    ctx.clip(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath();
    const span = (x1 - x0) + (y1 - y0);
    for (let s = 0; s < span * grow; s += 18) { ctx.moveTo(x0 + s, y0); ctx.lineTo(x0 + s - (y1 - y0), y1); }
    ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = C.gold; ctx.lineWidth = 6 * (1 - k) + 2; polyPath(f.pts); ctx.stroke(); ctx.restore();
  }
  const F = G.figure; if (!F) return;
  const k = Math.min(1, F.t * 2), tg = figureTarget(), p = G.p;
  ctx.save(); ctx.globalAlpha = k; ctx.lineCap = 'round';
  // les côtés déjà tracés, et le crayon qui suit le joueur depuis le dernier point
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 3; ctx.beginPath();
  for (let i = 1; i < F.prog; i++) { ctx.moveTo(F.pts[i - 1].x, F.pts[i - 1].y); ctx.lineTo(F.pts[i].x, F.pts[i].y); }
  ctx.stroke();
  if (F.prog > 0) { const last = F.pts[F.prog - 1]; ctx.setLineDash([8, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); ctx.setLineDash([]); }
  // le contour à venir, très léger
  ctx.globalAlpha = k * 0.22; ctx.setLineDash([4, 10]); ctx.lineWidth = 2; polyPath(F.pts); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  F.pts.forEach((pt, i) => {
    const next = pt === tg, got = pt.got > 0 && !next;
    ctx.save(); ctx.translate(pt.x, pt.y); ctx.globalAlpha = k;
    if (next) {
      const r = 24 + 2 * Math.sin(G.time * 6);
      ctx.fillStyle = C.hl; ctx.globalAlpha = k * 0.85; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
      ctx.globalAlpha = k; ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
    } else if (!got) { ctx.strokeStyle = C.gold; ctx.globalAlpha = k * 0.7; ctx.setLineDash([5, 5]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 20, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = k; }
    // un point de géométrie : une petite croix
    ctx.strokeStyle = got ? C.gold : C.graphite; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-7, -7); ctx.lineTo(7, 7); ctx.moveTo(7, -7); ctx.lineTo(-7, 7); ctx.stroke();
    ctx.restore();
    txt(pt.label, pt.x + 22, pt.y - 24, 30, { color: got ? C.gold : C.graphite, alpha: k });
    if (next && F.prog >= F.pts.length) txt('ferme !', pt.x, pt.y + 42, 26, { color: C.gold, alpha: k, hl: C.hl });
  });
  if (F.prog > 0 && tg) {   // le temps qui reste avant que la gomme passe
    const f = clamp(F.wait / FIGURE.gap, 0, 1);
    ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(tg.x, tg.y, 30, -Math.PI / 2, -Math.PI / 2 + TAU * f); ctx.stroke(); ctx.restore();
  }
}
function drawFigureArrow() {
  const tg = figureTarget(); if (tg && G.state === 'play') edgeArrow(tg.x, tg.y);
}
