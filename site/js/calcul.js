// Le calcul mental de la rentrée (chapitre IX) : une ardoise pose une multiplication, et les réponses flottent autour.
// Touche la bonne bulle : toute la page est frappée. Une mauvaise : « faux ! », et les chiffres s'échappent.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const CALC = { first: 8, again: 18, d0: 260, d1: 420, r0: 190, r1: 250, bubble: 36, radius: 560, endDur: 1.4, spin: 0.12 };

// une mauvaise réponse qui pourrait tromper : une ligne de trop, une de moins, ou une addition au lieu d'une multiplication
function calcLures(a, b, n) {
  const ans = a * b, cands = [a * (b + 1), a * (b - 1), (a + 1) * b, (a - 1) * b, a + b, ans + 10, ans - 10, (a + 1) * (b + 1), ans + 1, ans - 1];
  const out = [];
  for (const v of cands) if (v > 0 && v !== ans && !out.includes(v)) out.push(v);
  for (let i = out.length - 1; i > 0; i--) { const k = Math.floor(rand() * (i + 1)); [out[i], out[k]] = [out[k], out[i]]; }
  return out.slice(0, n);
}
function writeCalc() {
  const p = G.p, n = G.calculs || 0, top = Math.min(9, 4 + n);
  const a = 2 + Math.floor(rnd(top - 1)), b = 2 + Math.floor(rnd(8)), ans = a * b, m = CALC.r1 + 80;
  let x = p.x, y = p.y;
  for (let i = 0; i < 30; i++) {
    const an = rnd(TAU), d = rnd(CALC.d0, CALC.d1);
    x = clamp(p.x + Math.cos(an) * d, m, WORLD.w - m); y = clamp(p.y + Math.sin(an) * d, m, WORLD.h - m);
    if (Math.hypot(x - p.x, y - p.y) > 300) break;
  }
  const vals = calcLures(a, b, Math.min(4, 2 + Math.floor(n / 2))).concat([ans]);
  for (let i = vals.length - 1; i > 0; i--) { const k = Math.floor(rand() * (i + 1)); [vals[i], vals[k]] = [vals[k], vals[i]]; }
  const off = rnd(TAU), dir = rand() < 0.5 ? -1 : 1;
  const bubbles = vals.map((v, i) => ({ v, ok: v === ans, ang: off + i / vals.length * TAU, rad: rnd(CALC.r0, CALC.r1), x: 0, y: 0, dead: false, deadT: 0, wob: rnd(TAU) }));
  G.calc = { x, y, a, b, ans, bubbles, dir, t: 0, end: false, endT: 0, wrong: 0 };
  placeBubbles(G.calc);
  AU.play('calcNew');
  if (!G.calcSeen) { G.calcSeen = true; caption('Nouveau : le calcul mental ! L’ardoise pose une question…', 3.4, 'green'); caption('Touche la bulle de la bonne réponse. Pas les autres !', 3.6, 'green'); }
  else caption(pick(['Ardoise ! ' + a + ' × ' + b + ' ?', 'Calcul mental : ' + a + ' × ' + b + ' ?', 'Et ' + a + ' fois ' + b + ', ça fait ?']), 2.2, 'green');
}
// les bulles tournent doucement autour de l'ardoise, sans sortir de la page
function placeBubbles(K) {
  for (const q of K.bubbles) {
    q.x = clamp(K.x + Math.cos(q.ang) * q.rad, 40, WORLD.w - 40);
    q.y = clamp(K.y + Math.sin(q.ang) * q.rad * 0.85, 40, WORLD.h - 40);
  }
}
function stepCalc(dt) {
  if (CH().paper !== 'tables') return;
  for (const f of G.calcFx) f.t += dt;
  G.calcFx = G.calcFx.filter(f => f.t < f.dur);
  const K = G.calc;
  if (!K) { if (G.t >= G.nextCalc) writeCalc(); return; }
  K.t += dt;
  if (K.end) { K.endT += dt; if (K.endT >= CALC.endDur) G.calc = null; return; }
  for (const q of K.bubbles) { q.ang += dt * CALC.spin * K.dir; if (q.dead) q.deadT += dt; }
  placeBubbles(K);
  const p = G.p, R = CALC.bubble + p.r - 6;
  for (const q of K.bubbles) {
    if (q.dead || (p.x - q.x) ** 2 + (p.y - q.y) ** 2 > R * R) continue;
    if (q.ok) { solveCalc(K, q); return; }
    wrongCalc(K, q);
  }
}
function wrongCalc(K, q) {
  q.dead = true; K.wrong++;
  AU.play('calcFaux'); G.cam.shake = Math.max(G.cam.shake, 8);
  caption('Faux ! ' + K.a + ' × ' + K.b + ' ne fait pas ' + q.v + '.', 2.4, 'pink');
  addText(q.x, q.y - 50, 'faux !', C.red, 34);
  for (let i = 0; i < 3; i++) { const a = rnd(TAU); spawnEnemy('chiffre', clamp(q.x + Math.cos(a) * 90, 30, WORLD.w - 30), clamp(q.y + Math.sin(a) * 90, 30, WORLD.h - 30)); }   // les chiffres s'échappent
}
function calcImprint(K) {   // l'opération reste écrite sur la page, à l'encre, avec une coche rouge
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.textAlign = 'center'; sctx.textBaseline = 'middle';
  sctx.globalAlpha = 0.3; sctx.fillStyle = C.ink; sctx.font = '700 64px ' + FONT_MAIN; sctx.fillText(K.a + ' × ' + K.b + ' = ' + K.ans, K.x, K.y);
  sctx.globalAlpha = 0.45; sctx.strokeStyle = C.red; sctx.lineWidth = 7; sctx.lineCap = 'round'; sctx.beginPath(); sctx.moveTo(K.x + 170, K.y - 4); sctx.lineTo(K.x + 186, K.y + 16); sctx.lineTo(K.x + 222, K.y - 30); sctx.stroke();
  sctx.restore();
}
function solveCalc(K, q) {
  const p = G.p, n = ++G.calculs, k = Math.min(6, n), X = q.x, Y = q.y, R = CALC.radius, clean = !K.wrong;
  K.end = true; K.endT = 0; K.hit = q; G.nextCalc = G.t + CALC.again;
  G.score += (500 + 120 * k) * (clean ? 1.5 : 1); G.xp += 8 + 2 * k; p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('calcOk', K.ans);
  caption(K.a + ' × ' + K.b + ' = ' + K.ans + (clean ? ' : du premier coup !' : ' : bonne réponse !'), clean ? 2.8 : 2.2, 'green');
  G.cam.shake = Math.max(G.cam.shake, 12);
  G.calcFx.push({ x: X, y: Y, t: 0, dur: 1.3, txt: String(K.ans) });
  calcImprint(K);
  query(X, Y, R + 60, tmpA);
  for (const e of tmpA) {
    const dx = e.x - X, dy = e.y - Y, d = Math.hypot(dx, dy) || 1;
    if (e.dead || d > R + e.r) continue;
    hurtEnemy(e, (e.isBoss ? 90 : 22 + 4 * k) * (clean ? 1.25 : 1) * G.S.dmg, 'calc');
    if (!e.isBoss) { e.vx += dx / d * 440; e.vy += dy / d * 440; }
  }
  const R2 = R * R;
  for (const b of G.ebul) if ((b.x - X) ** 2 + (b.y - Y) ** 2 < R2) b.life = 0;
  G.billes = G.billes.filter(b => (b.x - X) ** 2 + (b.y - Y) ** 2 > R2);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; G.items.push({ x: X, y: Y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, ch: pick(LETTER_POOL), value: 7, rare: true, need: false, t: rnd(TAU), pull: false, rot: rnd(-0.4, 0.4) }); }
  for (let i = 0; i < 40; i++) { const a = rnd(TAU), s = rnd(160, 560); G.parts.push({ x: X, y: Y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.9, max: 0.9, size: rnd(3, 6), color: BEAD_COLORS[i % BEAD_COLORS.length], drag: 3 }); }
}

/* ---------- Le pilote : il sait ses tables ---------- */
function calcTarget() {
  const K = G.calc; if (!K || K.end) return null;
  return K.bubbles.find(q => q.ok) || null;
}
function calcDanger(x, y) {   // le pilote évite les mauvaises bulles
  const K = G.calc; if (!K || K.end) return 0;
  let s = 0;
  for (const q of K.bubbles) if (!q.ok && !q.dead) { const d = Math.hypot(x - q.x, y - q.y); if (d < CALC.bubble + 40) s += 4 + (CALC.bubble + 40 - d) * 0.1; }
  return s;
}

/* ---------- Dessins ---------- */
function drawCalc(v) {
  for (const f of G.calcFx) {   // la bonne réponse éclate en perles de toutes les couleurs
    const q = f.t / f.dur, rr = CALC.radius * ease(q);
    ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = C.gold; ctx.lineWidth = 10 * (1 - q) + 2; ctx.beginPath(); ctx.arc(f.x, f.y, rr, 0, TAU); ctx.stroke(); ctx.restore();
    if (1 - q > 0.05) for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + q * 1.5; ctx.save(); ctx.globalAlpha = 1 - q; drawBead(f.x + Math.cos(a) * rr * 0.93, f.y + Math.sin(a) * rr * 0.93, 11, BEAD_COLORS[i % BEAD_COLORS.length], a); ctx.restore(); }
    if (q < 0.7) txt(f.txt + ' !', f.x, f.y - 110 - q * 40, 52, { color: C.ink, alpha: 1 - q / 0.7, hl: C.hlGold });
  }
  const K = G.calc; if (!K) return;
  if (K.x + 520 < v.x0 || K.x - 520 > v.x1 || K.y + 480 < v.y0 || K.y - 480 > v.y1) return;
  const appear = ease(K.t / 0.6), fade = K.end ? clamp(1 - K.endT / CALC.endDur, 0, 1) : 1;
  // des pointillés à la craie, de l'ardoise à chaque bulle
  ctx.save(); ctx.globalAlpha = 0.35 * appear * fade; ctx.strokeStyle = C.pencil; ctx.lineWidth = 2; ctx.setLineDash([4, 10]); ctx.beginPath();
  for (const q of K.bubbles) if (!q.dead) { ctx.moveTo(K.x, K.y); ctx.lineTo(q.x, q.y); }
  ctx.stroke(); ctx.restore();
  // l'ardoise : un cadre de bois et de la craie
  const w = 300, h = 150, x0 = K.x - w / 2, y0 = K.y - h / 2;
  ctx.save(); ctx.globalAlpha = appear * fade; ctx.translate(K.x, K.y); ctx.rotate(-0.03); ctx.translate(-K.x, -K.y);
  ctx.fillStyle = '#b07a44'; roundRect(x0 - 12, y0 - 12, w + 24, h + 24, 12); ctx.fill(); ctx.strokeStyle = '#6e3f17'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = '#2f4a3e'; roundRect(x0, y0, w, h, 6); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(x0 + 40 + i * 55, y0 + 30 + (i % 2) * 70, 40, 12, 0.3, 0, TAU); ctx.fill(); }   // des traces d'éponge
  ctx.restore();
  const shown = K.end ? K.a + ' × ' + K.b + ' = ' + K.ans : K.a + ' × ' + K.b + ' = ';
  txt(shown, K.x - (K.end ? 0 : 24), K.y + 2, 54, { font: FONT_CURSIVE, weight: 400, color: '#f4f1e6', alpha: appear * fade, rot: -0.03 });
  if (!K.end) txt('?', K.x + 104, K.y + 2, 60, { color: '#f6e75e', alpha: appear * (0.6 + 0.4 * Math.sin(G.time * 5)), rot: -0.03 });
  if (K.wrong && !K.end) txt('faux : ' + K.wrong, K.x, K.y + h / 2 + 34, 24, { color: C.red, alpha: appear, rot: -0.03 });
  // les bulles de réponses
  for (const q of K.bubbles) {
    if (K.end && q !== K.hit) { if (fade < 0.6) continue; }
    const da = q.dead ? clamp(1 - q.deadT / 0.6, 0, 1) : 1;
    if (da <= 0) continue;
    const r = CALC.bubble + Math.sin(G.time * 3 + q.wob) * 2, bx = q.x, by = q.y + Math.sin(G.time * 2 + q.wob) * 4;
    ctx.save(); ctx.globalAlpha = appear * fade * da;
    ctx.fillStyle = q === K.hit ? '#fff3c0' : 'rgba(255,255,255,0.92)'; ctx.beginPath(); ctx.arc(bx, by, r, 0, TAU); ctx.fill();
    ctx.strokeStyle = q === K.hit ? C.gold : '#4fb3c8'; ctx.lineWidth = 3.5; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.8)'; ctx.beginPath(); ctx.ellipse(bx - r * 0.4, by - r * 0.45, r * 0.22, r * 0.12, -0.6, 0, TAU); ctx.fill();
    ctx.restore();
    txt(String(q.v), bx, by + 2, q.v >= 100 ? 30 : 36, { color: C.ink, alpha: appear * fade * da });
    if (q.dead) {   // barrée au stylo rouge
      ctx.save(); ctx.globalAlpha = da; ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
      ctx.moveTo(bx - r * 0.7, by - r * 0.7); ctx.lineTo(bx + r * 0.7, by + r * 0.7); ctx.moveTo(bx + r * 0.7, by - r * 0.7); ctx.lineTo(bx - r * 0.7, by + r * 0.7); ctx.stroke(); ctx.restore();
    }
  }
}
// la flèche du bord d'écran montre l'ardoise, jamais la bonne réponse
function drawCalcArrow() {
  if (G.state !== 'play') return;
  const K = G.calc; if (!K || K.end) return;
  edgeArrow(K.x, K.y);
}
