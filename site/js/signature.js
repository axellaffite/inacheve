// Le mot à faire signer (itération 24) : au chapitre XIII, un mot de l'école se pose sur la page.
// Reste près de lui : la plume des parents le signe, trait après trait. Mais les ratures l'ont vu aussi,
// et chacune qui le touche y fait un pâté (la signature recule). Signé : « Lu et signé ! », toute la page est frappée.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const MOT = { first: 5, again: 13, life: 40, R: 125, sign: 5, sheetR: 52, smudge: 0.06, cd: 1.2, gcd: 0.6, lureD: 460, radius: 540, d0: 260, d1: 420, endDur: 1.6, w: 170, h: 112 };
const MOTS_A_SIGNER = [
  ['Sortie au musée jeudi.', 'Prévoir un goûter.'],
  ['Merci de signer', 'la dictée de mardi.'],
  ['Réunion des parents', 'mardi à 18 h.'],
  ['La goutte a oublié', 'sa trousse (encore).'],
  ['Bravo pour', 'la récitation !'],
  ['Photo de classe lundi :', 'bien se coiffer.'],
  ['Classe verte en mai :', 'prévoir des bottes.'],
  ['Cinq minutes de retard :', 'un escargot, paraît-il.']
];

function writeMot() {
  const p = G.p, m = MOT.w / 2 + 60;
  let x = WORLD.w / 2, y = WORLD.h / 2;
  for (let i = 0; i < 30; i++) {
    const a = rnd(TAU), d = rnd(MOT.d0, MOT.d1);
    x = clamp(p.x + Math.cos(a) * d, m, WORLD.w - m); y = clamp(p.y + Math.sin(a) * d, m, WORLD.h - m);
    if (Math.hypot(x - p.x, y - p.y) > MOT.d0 * 0.7) break;
  }
  const k = G.motN = (G.motN || 0) + 1;
  G.mot = { x, y, t: 0, prog: 0, inside: false, done: false, lost: false, endT: 0, lines: MOTS_A_SIGNER[(k * 3 + Math.floor(rnd(3))) % MOTS_A_SIGNER.length], rot: rnd(-0.12, 0.12), seed: k, blots: [], scratch: 0 };
  AU.play('motNew');
  if (!G.motSeen) { G.motSeen = true; caption('Nouveau : un mot à faire signer ! Reste près de lui…', 3.4, 'green'); caption('… et protège-le : les ratures veulent y faire des pâtés.', 3.6, 'green'); }
  else caption('Un mot à faire signer !', 2, 'green');
}
// appelé par la boucle des ratures : une sur quatre, si elle est assez près, fonce sur le mot plutôt que sur toi
function motLure(e) {
  const M = G.mot;
  if (!M || M.done || M.lost || e.isBoss || e.id % 4 || ERRANTES.has(e.type)) return null;
  return (e.x - M.x) ** 2 + (e.y - M.y) ** 2 < MOT.lureD * MOT.lureD ? M : null;
}
function stepMot(dt) {
  if (!enCarnet()) return;
  for (const f of G.motFx) f.t += dt;
  G.motFx = G.motFx.filter(f => f.t < f.dur);
  const M = G.mot;
  if (!M) { if (G.t >= G.nextMot) writeMot(); return; }
  M.t += dt;
  if (M.done || M.lost) { M.endT += dt; if (M.endT >= MOT.endDur) G.mot = null; return; }
  const p = G.p;
  M.inside = Math.hypot(p.x - M.x, p.y - M.y) < MOT.R;
  if (M.inside) {
    M.prog = Math.min(1, M.prog + dt / MOT.sign);
    M.scratch -= dt; if (M.scratch <= 0) { M.scratch = 0.25; AU.play('signe'); }
  }
  if (G.t < (M.blotT || 0)) query(0, 0, 0, tmpA); else query(M.x, M.y, MOT.sheetR + 60, tmpA);   // un pâté à la fois, au plus deux par seconde
  for (const e of tmpA) {   // une rature qui touche le mot y fait un pâté
    if (M.blotT > G.t || e.dead || e.ghost || e.isBoss || (e.smudgeT || 0) > G.t) continue;
    const dx = e.x - M.x, dy = e.y - M.y, d = Math.hypot(dx, dy) || 1;
    if (d > MOT.sheetR + e.r * 0.6) continue;
    e.smudgeT = G.t + MOT.cd; M.blotT = G.t + MOT.gcd; e.vx += dx / d * 420; e.vy += dy / d * 420;
    M.prog = Math.max(0, M.prog - MOT.smudge);
    if (M.blots.length < 9) M.blots.push({ x: rnd(-MOT.w * 0.4, MOT.w * 0.4), y: rnd(-MOT.h * 0.35, MOT.h * 0.35), r: rnd(6, 11) });
    G.pates = (G.pates || 0) + 1;
    addText(M.x, M.y - 70, 'pâté !', C.red, 24); AU.play('pateMot');
    if (!G.pateSeen) { G.pateSeen = true; caption('Un pâté sur le mot ! Biffe les ratures qui s’en approchent.', 2.6, 'pink'); }
  }
  if (M.prog >= 1) solveMot(M);
  else if (M.t > MOT.life) { M.lost = true; M.endT = 0; G.nextMot = G.t + MOT.again; AU.play('motPerdu'); caption('Le mot s’est envolé… il faudra le refaire signer.', 2.4, 'pink'); }
}
function motImprint(M) {   // le mot reste sur la page, signé
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.translate(M.x, M.y); sctx.rotate(M.rot);
  sctx.globalAlpha = 0.35; sctx.strokeStyle = C.graphite; sctx.lineWidth = 2; sctx.strokeRect(-MOT.w / 2, -MOT.h / 2, MOT.w, MOT.h);
  sctx.translate(30, MOT.h / 2 - 26); sctx.globalAlpha = 0.5; drawParapheSig(1, 0.55, M.seed, C.ink, 3, sctx);
  sctx.restore();
}
function solveMot(M) {
  const p = G.p, n = G.signatures = (G.signatures || 0) + 1, k = Math.min(6, n), X = M.x, Y = M.y, R = MOT.radius, propre = !M.blots.length;
  M.done = true; M.endT = 0; G.nextMot = G.t + MOT.again;
  G.score += (500 + 120 * k) * (propre ? 1.5 : 1); G.xp += 8 + 2 * k; p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('motSigne');
  caption(propre ? 'Lu et signé, sans un pâté !' : 'Lu et signé !', propre ? 2.6 : 2.2, 'green');
  G.cam.shake = Math.max(G.cam.shake, 12);
  G.motFx.push({ x: X, y: Y, t: 0, dur: 1.3 });
  motImprint(M);
  query(X, Y, R + 60, tmpA);
  for (const e of tmpA) {
    const dx = e.x - X, dy = e.y - Y, d = Math.hypot(dx, dy) || 1;
    if (e.dead || d > R + e.r) continue;
    hurtEnemy(e, (e.isBoss ? 90 : 22 + 4 * k) * (propre ? 1.25 : 1) * G.S.dmg, 'mot');
    if (!e.isBoss) { e.vx += dx / d * 440; e.vy += dy / d * 440; }
  }
  const R2 = R * R;
  for (const b of G.ebul) if ((b.x - X) ** 2 + (b.y - Y) ** 2 < R2) b.life = 0;
  G.colles = G.colles.filter(c => (c.x - X) ** 2 + (c.y - Y) ** 2 > R2);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; G.items.push({ x: X, y: Y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, ch: pick(LETTER_POOL), value: 7, rare: true, need: false, t: rnd(TAU), pull: false, rot: rnd(-0.4, 0.4) }); }
  for (let i = 0; i < 36; i++) { const a = rnd(TAU), s = rnd(160, 560); G.parts.push({ x: X, y: Y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.9, max: 0.9, size: rnd(3, 6), color: i % 3 ? C.ink : '#c9853a', drag: 3 }); }
}

// le pilote va se poster près du mot et le défend avec son tir automatique
function motTarget() { const M = G.mot; return M && !M.done && !M.lost && enCarnet() ? M : null; }
function motHolding() { const M = motTarget(); return !!M && Math.hypot(G.p.x - M.x, G.p.y - M.y) < MOT.R * 0.75; }

function drawMot(v) {
  for (const f of G.motFx) {   // l'onde de la signature : un grand paraphe qui s'envole en couronne
    const q = f.t / f.dur, rr = MOT.radius * ease(q);
    ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = C.ink; ctx.lineWidth = 10 * (1 - q) + 2; ctx.setLineDash([22, 12]); ctx.beginPath(); ctx.arc(f.x, f.y, rr, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + q; ctx.save(); ctx.translate(f.x + Math.cos(a) * rr * 0.9, f.y + Math.sin(a) * rr * 0.9); ctx.rotate(a + Math.PI / 2); drawParapheSig(1, 0.28, i, '#c9853a', 3); ctx.restore(); }
    ctx.restore();
    if (q < 0.7) txt('Lu et signé !', f.x, f.y - 120 - q * 40, 56, { font: FONT_CURSIVE, weight: 400, color: C.ink, alpha: 1 - q / 0.7, hl: C.hlGold });
  }
  const M = G.mot; if (!M || !enCarnet()) return;
  const appear = ease(Math.min(1, M.t / 0.4)), fade = M.done || M.lost ? clamp(1 - M.endT / MOT.endDur, 0, 1) : 1;
  const fly = M.lost ? M.endT * 160 : 0, bob = M.done || M.lost ? 0 : Math.sin(G.time * 2.5) * 3;
  if (!M.done && !M.lost) {   // le cercle où la plume signe, et la signature qui avance tout autour
    ctx.save(); ctx.globalAlpha = appear; ctx.strokeStyle = M.inside ? '#3c8a3c' : '#c9853a'; ctx.lineWidth = 3; ctx.setLineDash([12, 10]); ctx.lineDashOffset = -G.time * 18;
    ctx.beginPath(); ctx.arc(M.x, M.y, MOT.R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.ink; ctx.globalAlpha = 0.65 * appear; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(M.x, M.y, MOT.R, -Math.PI / 2, -Math.PI / 2 + M.prog * TAU); ctx.stroke();
    ctx.restore();
  }
  ctx.save(); ctx.globalAlpha = appear * fade; ctx.translate(M.x + fly * 0.4, M.y + bob - fly); ctx.rotate(M.rot + (M.lost ? M.endT * 1.5 : 0));
  const w = MOT.w, h = MOT.h;
  ctx.fillStyle = 'rgba(46,46,51,0.15)'; ctx.fillRect(-w / 2 + 6, -h / 2 + 8, w, h);
  ctx.fillStyle = '#fffdf4'; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = '#efe2c0'; ctx.beginPath(); ctx.moveTo(w / 2 - 22, -h / 2); ctx.lineTo(w / 2, -h / 2 + 22); ctx.lineTo(w / 2 - 22, -h / 2 + 22); ctx.closePath(); ctx.fill();   // le coin corné
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.strokeRect(-w / 2, -h / 2, w, h);
  ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = C.ink; ctx.font = '400 17px ' + FONT_CURSIVE;
  M.lines.forEach((l, i) => ctx.fillText(l, -w / 2 + 12, -h / 2 + 26 + i * 21));
  ctx.font = '700 12px ' + FONT_MAIN; ctx.fillStyle = C.pencil; ctx.fillText('Signature des parents :', -w / 2 + 12, h / 2 - 34);
  ctx.save(); ctx.translate(30, h / 2 - 20); drawParapheSig(M.prog, 0.55, M.seed, C.ink, 2.6);
  if (!M.done && !M.lost && M.prog > 0 && M.prog < 1) {   // la plume des parents, au bout du trait
    const [px, py] = sigPoint(M.prog, 0.55, M.seed);
    ctx.translate(px, py); ctx.rotate(-0.7 + (M.inside ? Math.sin(G.time * 30) * 0.06 : 0));
    ctx.fillStyle = '#2e2e33'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(5, -10); ctx.lineTo(-5, -10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c8424a'; ctx.fillRect(-5, -44, 10, 34); ctx.fillStyle = '#e0b23a'; ctx.fillRect(-5, -22, 10, 3);
  }
  ctx.restore();
  for (const b of M.blots) { ctx.fillStyle = 'rgba(46,46,51,0.75)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(b.x + b.r * 0.8, b.y + b.r * 0.5, b.r * 0.3, 0, TAU); ctx.fill(); }
  if (M.done) drawVuStamp(-10, -4, -0.25, 0.75 * Math.min(1, M.endT * 4));
  ctx.restore();
  if (!M.done && !M.lost) {
    const label = M.inside ? 'Signature : ' + Math.floor(M.prog * 100) + ' %' : 'Mot à faire signer !';
    txt(label, M.x, M.y - MOT.R - 26 + bob, 26, { color: M.inside ? '#3c8a3c' : '#8c5a22', alpha: appear, hl: M.inside ? C.hlGreen : undefined });
  }
}
function drawMotArrow() {
  if (G.state !== 'play') return;
  const M = motTarget(); if (M && !M.inside) edgeArrow(M.x, M.y);
}
