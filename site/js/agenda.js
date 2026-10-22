// Le cahier de textes (itération 21) : au chapitre XII, à chaque heure, un devoir s'écrit dans le cahier.
// « Calcul : biffer 3 signes fois. » Fais-le, puis va cocher la case qui apparaît sur la page :
// toute la page est frappée. Si la cloche sonne avant, tant pis : le devoir est oublié.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const AGENDA = { fragile: 3, first: 3, again: 12, need0: 2, needMax: 5, box: 96, d0: 240, d1: 380, radius: 560, early: 12, endDur: 1.4 };

function writeAgenda() {
  const S = matiere(), n = Math.min(AGENDA.needMax, AGENDA.need0 + (G.agendas || 0));
  G.agenda = { col: S.col, name: S.name, type: S.devoir[0], label: S.devoir[1], need: n, got: 0, box: null, t: 0, done: false, endT: 0 };
  AU.play('caseNew');
  if (!G.agendaSeen) { G.agendaSeen = true; caption('Nouveau : le cahier de textes ! À chaque heure, un devoir…', 3.4, 'green'); caption(S.name + ' : biffer ' + n + ' ' + S.devoir[1] + ', puis cocher la case.', 3.6, 'green'); }
  else caption('Pour tout à l’heure : biffer ' + n + ' ' + S.devoir[1] + ' !', 2.4, 'green');
}
// appelé par killEnemy : une rature biffée compte-t-elle pour le devoir ?
function agendaKill(e) {
  const A = G.agenda; if (!A || A.box || A.done || e.type !== A.type) return;
  A.got++;
  addText(e.x, e.y - 34, A.got + ' / ' + A.need, A.col, 26);
  if (A.got >= A.need) placeCase(A);
}
function placeCase(A) {
  const p = G.p, m = AGENDA.box / 2 + 70;
  let x = WORLD.w / 2, y = WORLD.h / 2;
  for (let i = 0; i < 30; i++) {
    const a = rnd(TAU), d = rnd(AGENDA.d0, AGENDA.d1);
    x = clamp(p.x + Math.cos(a) * d, m, WORLD.w - m); y = clamp(p.y + Math.sin(a) * d, m, WORLD.h - m);
    if (Math.hypot(x - p.x, y - p.y) > AGENDA.d0 * 0.7) break;
  }
  A.box = { x, y, t: 0 };
  AU.play('caseNew', 2);
  caption('Devoir fini ! Va cocher la case.', 2.4, 'green');
}
function stepAgenda(dt) {
  for (const f of G.agendaFx) f.t += dt;
  G.agendaFx = G.agendaFx.filter(f => f.t < f.dur);
  const A = G.agenda;
  if (!A) { if (G.t >= G.nextAgenda && (G.boss || G.nextBell - G.t > 9)) writeAgenda(); return; }
  A.t += dt;
  if (A.done) { A.endT += dt; if (A.endT >= AGENDA.endDur) G.agenda = null; return; }
  if (!A.box) return;
  A.box.t += dt;
  const p = G.p;
  if (Math.hypot(p.x - A.box.x, p.y - A.box.y) < AGENDA.box / 2 + p.r) solveAgenda(A);
}
function agendaImprint(A) {   // la case reste cochée sur la page, avec le devoir écrit à côté
  const X = A.box.x, Y = A.box.y, h = AGENDA.box * 0.6;
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.textAlign = 'left'; sctx.textBaseline = 'middle';
  sctx.globalAlpha = 0.4; sctx.strokeStyle = C.graphite; sctx.lineWidth = 3; sctx.strokeRect(X - h / 2, Y - h / 2, h, h);
  sctx.strokeStyle = C.red; sctx.lineWidth = 6; sctx.beginPath(); sctx.moveTo(X - h * 0.32, Y); sctx.lineTo(X - h * 0.05, Y + h * 0.3); sctx.lineTo(X + h * 0.55, Y - h * 0.6); sctx.stroke();
  sctx.globalAlpha = 0.32; sctx.fillStyle = C.ink; sctx.font = '400 28px ' + FONT_CURSIVE;
  sctx.fillText(A.name + ' : ' + A.need + ' ' + A.label, X + h / 2 + 18, Y);
  sctx.restore();
}
function solveAgenda(A) {
  const p = G.p, n = ++G.agendas, k = Math.min(6, n), X = A.box.x, Y = A.box.y, R = AGENDA.radius, early = !G.boss && G.nextBell - G.t > AGENDA.early;
  A.done = true; A.endT = 0; G.nextAgenda = G.t + AGENDA.again;
  G.score += (500 + 120 * k) * (early ? 1.5 : 1); G.xp += 8 + 2 * k; p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('coche');
  caption(early ? 'Devoir fait, et en avance !' : 'Devoir fait : coché !', early ? 2.6 : 2.2, 'green');
  G.cam.shake = Math.max(G.cam.shake, 12);
  G.agendaFx.push({ x: X, y: Y, t: 0, dur: 1.3, col: A.col });
  agendaImprint(A);
  query(X, Y, R + 60, tmpA);
  for (const e of tmpA) {
    const dx = e.x - X, dy = e.y - Y, d = Math.hypot(dx, dy) || 1;
    if (e.dead || d > R + e.r) continue;
    hurtEnemy(e, (e.isBoss ? 90 : 22 + 4 * k) * (early ? 1.25 : 1) * G.S.dmg, 'agenda');
    if (!e.isBoss) { e.vx += dx / d * 440; e.vy += dy / d * 440; }
  }
  const R2 = R * R;
  for (const b of G.ebul) if ((b.x - X) ** 2 + (b.y - Y) ** 2 < R2) b.life = 0;
  G.fromages = G.fromages.filter(f => f.landed);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; G.items.push({ x: X, y: Y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, ch: pick(LETTER_POOL), value: 7, rare: true, need: false, t: rnd(TAU), pull: false, rot: rnd(-0.4, 0.4) }); }
  for (let i = 0; i < 36; i++) { const a = rnd(TAU), s = rnd(160, 560); G.parts.push({ x: X, y: Y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.9, max: 0.9, size: rnd(3, 6), color: i % 3 ? A.col : C.red, drag: 3 }); }
}

// le pilote fait ses devoirs : il va cocher la case dès qu'elle est là (avant, il se rapproche de ce qu'il faut biffer)
function agendaTarget() { const A = G.agenda; return A && A.box && !A.done ? A.box : null; }
function agendaPrey() {
  const A = G.agenda; if (!A || A.box || A.done) return null;
  let b = null, bd = 700;
  for (const e of G.enemies) if (e.type === A.type && !e.dead && !e.ghost) { const d = Math.hypot(e.x - G.p.x, e.y - G.p.y); if (d < bd) { bd = d; b = e; } }
  return b;
}

function drawAgenda(v) {
  for (const f of G.agendaFx) {   // l'onde de la case cochée : des coches rouges qui s'envolent en couronne
    const q = f.t / f.dur, rr = AGENDA.radius * ease(q);
    ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = f.col; ctx.lineWidth = 10 * (1 - q) + 2; ctx.setLineDash([22, 12]); ctx.beginPath(); ctx.arc(f.x, f.y, rr, 0, TAU); ctx.stroke();
    ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.setLineDash([]);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU + q, x = f.x + Math.cos(a) * rr * 0.9, y = f.y + Math.sin(a) * rr * 0.9;
      ctx.beginPath(); ctx.moveTo(x - 10, y); ctx.lineTo(x - 3, y + 8); ctx.lineTo(x + 12, y - 12); ctx.stroke();
    }
    ctx.restore();
    if (q < 0.7) txt('Coché !', f.x, f.y - 120 - q * 40, 56, { font: FONT_CURSIVE, weight: 400, color: C.ink, alpha: 1 - q / 0.7, hl: C.hlGold });
  }
  const A = G.agenda; if (!A || !enTextes()) return;
  if (!A.box && !A.done) {   // les ratures à biffer pour le devoir sont surlignées
    for (const e of G.enemies) if (e.type === A.type && !e.dead && e.x > v.x0 - 60 && e.x < v.x1 + 60 && e.y > v.y0 - 60 && e.y < v.y1 + 60) drawHighlight(e.x - e.r - 6, e.y + e.r - 4, 2 * e.r + 12, 12, C.hl);
    return;
  }
  if (!A.box) return;
  const B = A.box, s = AGENDA.box, appear = ease(B.t / 0.4), fade = A.done ? clamp(1 - A.endT / AGENDA.endDur, 0, 1) : 1, bob = A.done ? 0 : Math.sin(G.time * 3) * 4;
  ctx.save(); ctx.globalAlpha = appear * fade; ctx.translate(B.x, B.y + bob); ctx.rotate(-0.04);
  ctx.fillStyle = 'rgba(46,46,51,0.15)'; ctx.fillRect(-s / 2 + 6, -s / 2 + 8, s, s);
  ctx.fillStyle = '#fffdf4'; ctx.fillRect(-s / 2, -s / 2, s, s);
  drawHighlight(-s / 2 + 6, -s / 2 + 6, s - 12, s - 12, A.done ? C.hlGreen : C.hl);
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 5; ctx.strokeRect(-s / 2, -s / 2, s, s);
  if (!A.done) { ctx.strokeStyle = A.col; ctx.lineWidth = 3; ctx.setLineDash([10, 8]); ctx.lineDashOffset = -G.time * 20; ctx.strokeRect(-s / 2 - 14, -s / 2 - 14, s + 28, s + 28); ctx.setLineDash([]); }
  else { ctx.strokeStyle = C.red; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-s * 0.3, 0); ctx.lineTo(-s * 0.05, s * 0.28); ctx.lineTo(s * 0.5, -s * 0.55); ctx.stroke(); }
  ctx.restore();
  if (!A.done) txt(A.name + ' : à cocher !', B.x, B.y - s / 2 - 34 + bob, 26, { color: A.col, alpha: appear });
}
function drawAgendaArrow() {
  if (G.state !== 'play') return;
  const B = agendaTarget(); if (B) edgeArrow(B.x, B.y);
}
