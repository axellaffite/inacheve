'use strict';

// Le contrôle surprise (itération 26) : cinq ratures deviennent des questions, numérotées au stylo rouge ;
// 20 s pour les biffer toutes, et chaque coup reçu retire trois points.
// La note est écrite au stylo rouge dans le bulletin imprimé sur la page, et une bonne note fait une onde.
const CTRL = { first: 10, again: 22, len: 20, need: 20, qs: 5, d0: 320, d1: 950, hurt: 3, endDur: 2.4, radius: 300 };
const APPRECIATIONS = [[20, 'Parfait ! Rien à redire.'], [17, 'Excellent travail, bravo.'], [14, 'Très bien, continue ainsi.'], [12, 'Bien. Encore un petit effort.'], [10, 'Juste la moyenne : courage !'], [5, 'Peut mieux faire.'], [0, 'Un peu dans la lune ?']];
const apprOf = n => APPRECIATIONS.find(([m]) => n >= m)[1];

function startCtrl() {
  const p = G.p, d2 = e => (e.x - p.x) ** 2 + (e.y - p.y) ** 2;
  // les questions : des ratures ni trop près ni trop loin, choisies de la plus proche à la plus lointaine
  const pool = G.enemies.filter(e => !e.dead && !e.isBoss && !e.ghost && !ERRANTES.has(e.type) && e.type !== 'perforatrice' && d2(e) > CTRL.d0 ** 2 && d2(e) < CTRL.d1 ** 2).sort((a, b) => d2(a) - d2(b));
  if (pool.length < 3) { G.nextCtrl = G.t + 1; return; }
  const step = pool.length / CTRL.qs, qs = [];
  for (let i = 0; i < CTRL.qs && i * step < pool.length; i++) qs.push(pool[Math.floor(i * step)]);
  qs.forEach((e, i) => { e.q = i + 1; });
  G.ctrl = { t: 0, n: 0, total: qs.length, qs, end: false, endT: 0, note: 0, hits: 0 };
  AU.play('ctrlStart');
  if (!G.ctrlSeen) { G.ctrlSeen = true; caption('Contrôle surprise ! Biffe les ' + qs.length + ' questions entourées de rouge…', 3.4, 'green'); caption('… en vingt secondes, sans te faire toucher : chaque coup coûte trois points.', 3.4, 'green'); }
  else caption('Contrôle surprise !', 2, 'green');
}
function stepCtrl(dt) {
  if (!enBulletin()) return;
  for (const f of G.ctrlFx) f.t += dt;
  G.ctrlFx = G.ctrlFx.filter(f => f.t < f.dur);
  const K = G.ctrl;
  if (!K) { if (G.t >= G.nextCtrl) { if (G.boss) G.nextCtrl = G.t + 5; else startCtrl(); } return; }
  if (K.end) { K.endT += dt; if (K.endT >= CTRL.endDur) G.ctrl = null; return; }
  K.t += dt;
  if (K.n >= K.total || K.t >= CTRL.len) finishCtrl(K);
}
const ctrlPoints = K => Math.max(0, Math.round(CTRL.need * K.n / K.total) - CTRL.hurt * K.hits);
function ctrlKill(e) {
  const K = G.ctrl; if (!K || K.end || !e.q) return;
  K.n++; AU.play('ctrlTick', K.n); addText(e.x, e.y - 40, 'question ' + e.q + ' : juste !', '#3c8a3c', 26);
}
function ctrlHurt() { const K = G.ctrl; if (K && !K.end) { K.hits++; addText(G.p.x, G.p.y - 50, '− ' + CTRL.hurt + ' points', C.red, 26); } }
function ctrlTarget() {   // le pilote va chercher la question la plus proche
  const K = G.ctrl; if (!K || K.end || !enBulletin()) return null;
  let best = null, bd = Infinity;
  for (const e of K.qs) { if (e.dead) continue; const d = (e.x - G.p.x) ** 2 + (e.y - G.p.y) ** 2; if (d < bd) { bd = d; best = e; } }
  return best;
}
function finishCtrl(K) {
  const note = K.note = ctrlPoints(K), p = G.p, X = p.x, Y = p.y;
  for (const e of K.qs) e.q = 0;
  K.end = true; K.endT = 0; G.nextCtrl = G.t + CTRL.again;
  const k = G.ctrlN = (G.ctrlN || 0) + 1;
  G.bulletin[(k - 1) % MATIERES.length] = { note, appr: apprOf(note), at: G.t };
  if (note < 10) { AU.play('ctrlBad'); caption(note + ' / 20 : ' + apprOf(note) + ' Le prochain sera le bon !', 2.8, 'pink'); return; }
  G.controles = (G.controles || 0) + 1; if (note >= 20) G.vingts = (G.vingts || 0) + 1;
  G.score += 60 * note; G.xp += note; if (note >= 16) p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play(note >= 17 ? 'ctrlTop' : 'ctrlGood');
  caption(note + ' / 20 : ' + mentionOf(note) + ' !' + (note >= 16 ? ' (un cœur en prime)' : ''), 2.6, 'green');
  G.cam.shake = Math.max(G.cam.shake, 10);
  const R = CTRL.radius + 15 * note;
  G.ctrlFx.push({ x: X, y: Y, t: 0, dur: 1.3, r: R, note });
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); drawMention(X, Y, note, 0.35, sctx); sctx.restore();   // la mention reste tamponnée sur la page
  query(X, Y, R + 60, tmpA);
  for (const e of tmpA) {
    const dx = e.x - X, dy = e.y - Y, d = Math.hypot(dx, dy) || 1;
    if (e.dead || d > R + e.r) continue;
    hurtEnemy(e, (e.isBoss ? 4 * note : 14 + 1.5 * note) * G.S.dmg, 'ctrl');
    if (!e.isBoss) { e.vx += dx / d * 420; e.vy += dy / d * 420; }
  }
  const R2 = R * R;
  for (const b of G.ebul) if ((b.x - X) ** 2 + (b.y - Y) ** 2 < R2) b.life = 0;
  for (let i = 0; i < 30; i++) { const a = rnd(TAU), s = rnd(160, 520); G.parts.push({ x: X, y: Y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.9, max: 0.9, size: rnd(3, 6), color: i % 3 ? C.red : C.gold, drag: 3 }); }
}

function drawCtrlFx() {
  const K = G.ctrl;
  if (K && !K.end) for (const e of K.qs) {   // les questions : un numéro entouré au stylo rouge
    if (e.dead) continue;
    const y = e.y - e.r - 30, pulse = 1 + 0.08 * Math.sin(G.time * 8 + e.q);
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(e.x, e.y, (e.r + 14) * pulse, (e.r + 12) * pulse, -0.15, 0.3, TAU + 0.1); ctx.stroke(); ctx.restore();
    txt(String(e.q), e.x, y, 30, { color: C.red, hl: C.hl });
  }
  for (const f of G.ctrlFx) {   // l'onde de la bonne note : un grand cercle rouge, comme une note entourée
    const q = f.t / f.dur, rr = f.r * ease(q);
    ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = C.red; ctx.lineWidth = 9 * (1 - q) + 2; ctx.beginPath(); ctx.ellipse(f.x, f.y, rr, rr * 0.92, -0.1, 0.2, TAU + 0.05); ctx.stroke(); ctx.restore();
    if (q < 0.75) txt(f.note + ' / 20', f.x, f.y - 110 - q * 50, 64, { font: FONT_CURSIVE, weight: 400, color: C.red, alpha: 1 - q / 0.75, hl: C.hlGold });
  }
}
// la copie du contrôle, en haut à gauche, sous le niveau : les points, et le temps qui reste
function drawCtrlArrow() {
  if (G.state !== 'play') return;
  const e = ctrlTarget(); if (e) edgeArrow(e.x, e.y);
}
function drawCtrlHUD() {
  const K = G.ctrl; if (!K || !enBulletin() || G.state !== 'play') return;
  const s = U, w = 220 * s, h = 104 * s, x = SAFE.l + 18 * s, y = SAFE.t + 84 * s, a = K.end ? clamp(1 - (K.endT - 1.6) / 0.8, 0, 1) : Math.min(1, K.t * 4);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(-0.02);
  ctx.fillStyle = 'rgba(46,46,51,0.15)'; ctx.fillRect(5, 6, w, h);
  ctx.fillStyle = '#fffdf4'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.strokeRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(200,66,74,0.5)'; ctx.beginPath(); ctx.moveTo(26 * s, 0); ctx.lineTo(26 * s, h); ctx.stroke();
  ctx.restore();
  const n = ctrlPoints(K), cx = x + 123 * s;
  txt(K.end ? 'Contrôle rendu' : 'Contrôle surprise', cx, y + 16 * s, 18 * s, { color: C.graphite, alpha: a, weight: 400 });
  txt(n + ' / 20', cx, y + 48 * s, 32 * s, { font: FONT_CURSIVE, weight: 400, color: n >= 10 ? C.ink : C.red, alpha: a });
  if (!K.end) {
    txt('questions : ' + K.n + ' / ' + K.total, cx, y + 78 * s, 15 * s, { color: C.pencil, alpha: a, weight: 400 });
    const k = clamp(1 - K.t / CTRL.len, 0, 1);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = k < 0.25 ? C.red : C.ink; ctx.fillRect(x + 34 * s, y + h - 12 * s, (w - 46 * s) * k, 5 * s); ctx.restore();
  } else if (K.note >= 10) txt(mentionOf(K.note), cx, y + 82 * s, 18 * s, { color: '#3c8a3c', alpha: a });
}
