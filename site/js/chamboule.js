'use strict';

// Le chamboule-tout de la kermesse (itération 28) : un stand se monte près de la goutte, avec six boîtes empilées en pyramide.
// Ta plume vise les boîtes quand tu t'approches ; une boîte touchée s'envole, fait tomber celles qui reposaient sur elle,
// et roule à travers la page en bousculant les ratures. Toutes par terre avant la fin : gagné, un lot (un moulinet qui tourne autour de toi).
const CHAMB = { first: 9, again: 24, len: 16, d0: 300, d1: 560, aim: 430, hitR: 18, speed: 560, dmg: 9, endDur: 2.2, lie: 5, moulinet: 15, moulR: 92, moulDmg: 4 };
// les boîtes : rangée du bas, du milieu, du haut ; [décalage x, hauteur, boîtes du dessous, gouttes pour la faire tomber] (celles du bas sont lestées)
const BOITES = [[-32, 22, [], 3], [0, 22, [], 3], [32, 22, [], 3], [-16, 56, [0, 1], 2], [16, 56, [1, 2], 2], [0, 90, [3, 4], 1]];
const BOITE_COLS = ['#e85a5f', '#4f9ad8', '#5cb85c', '#f2c14e', '#c77dd1', '#f08a3c'];

function startChamboule() {
  const p = G.p;
  let x = p.x, y = p.y;
  for (let i = 0; i < 12; i++) {
    const a = rnd(TAU), d = rnd(CHAMB.d0, CHAMB.d1);
    x = clamp(p.x + Math.cos(a) * d, 220, WORLD.w - 220); y = clamp(p.y + Math.sin(a) * d, 220, WORLD.h - 160);
    if (Math.hypot(x - p.x, y - p.y) > CHAMB.d0 * 0.8) break;
  }
  G.stand = { x, y, t: 0, up: BOITES.map(() => true), hp: BOITES.map(b => b[3]), wob: BOITES.map(() => 0), n: 0, end: false, endT: 0, win: false };
  AU.play('standUp');
  if (!G.standSeen) { G.standSeen = true; caption('Un chamboule-tout ! Approche-toi : ta plume vise les boîtes.', 3.2, 'green'); caption('Fais-les toutes tomber avant que le stand ferme, et gagne un lot !', 3.2, 'green'); }
  else caption('Un chamboule-tout s’installe !', 2, 'green');
}
const boitePos = (S, i) => ({ x: S.x + BOITES[i][0], y: S.y - BOITES[i][1] });
// une boîte touchée s'envole, et celles qu'elle portait tombent avec elle
function knockBoite(S, i, vx, vy, k = 1) {
  if (!S.up[i]) return;
  S.up[i] = false; S.n++;
  const b = boitePos(S, i), sp = Math.hypot(vx, vy) || 1;
  G.boites.push({ x: b.x, y: S.y + 6, h: BOITES[i][1] - 6, vh: rnd(160, 300), vx: vx / sp * CHAMB.speed * k * rnd(0.8, 1.1) + rnd(-60, 60), vy: vy / sp * CHAMB.speed * k * rnd(0.8, 1.1) + rnd(-60, 60), rot: 0, vr: rnd(-14, 14), col: BOITE_COLS[i], hit: new Set(), lie: 0 });
  AU.play('boite', i);
  BOITES.forEach((q, j) => { if (S.up[j] && q[2].includes(i)) knockBoite(S, j, vx + rnd(-200, 200), vy + rnd(-200, 200), 0.6); });
}
function stepChamboule(dt) {
  if (!enKermesse()) return;
  for (const f of G.chambFx) f.t += dt;
  G.chambFx = G.chambFx.filter(f => f.t < f.dur);
  stepBoites(dt);
  stepMoulinets(dt);
  stepPompon(dt);
  const S = G.stand;
  if (!S) { if (G.t >= G.nextStand) { if (G.boss) G.nextStand = G.t + 6; else startChamboule(); } return; }
  if (S.end) { S.endT += dt; if (S.endT >= CHAMB.endDur) G.stand = null; return; }
  S.t += dt;
  for (let i = 0; i < S.wob.length; i++) S.wob[i] = Math.max(0, S.wob[i] - dt);
  for (const s of G.shots) {   // les gouttes qui touchent une boîte encore debout
    if (s.life <= 0) continue;
    for (let i = 0; i < BOITES.length; i++) {
      if (!S.up[i]) continue;
      const b = boitePos(S, i);
      if ((s.x - b.x) ** 2 + (s.y - b.y) ** 2 < CHAMB.hitR ** 2) {
        s.life = 0; S.hp[i]--; S.wob[i] = 0.3;
        if (S.hp[i] <= 0) knockBoite(S, i, s.vx, s.vy); else AU.play('boiteHit');
        break;
      }
    }
  }
  if (S.n >= BOITES.length) winChamboule(S);
  else if (S.t >= CHAMB.len) { S.end = true; S.endT = 0; G.nextStand = G.t + CHAMB.again; AU.play('ctrlBad'); caption('Le stand ferme… Il restait ' + (BOITES.length - S.n) + ' boîte' + (BOITES.length - S.n > 1 ? 's' : '') + ' !', 2.4, 'pink'); }
}
function winChamboule(S) {
  S.end = true; S.win = true; S.endT = 0; G.nextStand = G.t + CHAMB.again;
  const k = G.chamboules = (G.chamboules || 0) + 1, heart = k % 3 === 0;   // un cœur tous les trois stands gagnés
  G.score += 400; G.xp += 12;
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  if (G.moulinets.length < 3) G.moulinets.push({ t: 0 }); else G.moulinets[0].t = 0;
  if (heart) G.p.hp = Math.min(G.p.maxHp, G.p.hp + 1);
  AU.play('chambWin'); G.cam.shake = Math.max(G.cam.shake, 6);
  caption('Tout chamboulé ! Tu gagnes un moulinet' + (heart ? ', et un cœur en prime !' : ' !'), 2.8, 'green');
  G.chambFx.push({ x: S.x, y: S.y - 60, t: 0, dur: 1.6 });
  for (let i = 0; i < 36; i++) { const a = rnd(TAU), s = rnd(160, 480); G.parts.push({ x: S.x, y: S.y - 50, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 120, life: 1, max: 1, size: rnd(3, 6), color: FANION_COLS[i % FANION_COLS.length], drag: 2.5 }); }
}
// les boîtes en vol : elles retombent, rebondissent, roulent, et bousculent les ratures sur leur passage
function stepBoites(dt) {
  for (const b of G.boites) {
    if (b.lie > 0) { b.lie += dt; continue; }
    b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt;
    b.vh -= 1100 * dt; b.h += b.vh * dt;
    if (b.h <= 0) { b.h = 0; if (b.vh < -80) b.vh = -b.vh * 0.35; else b.vh = 0; const k = Math.exp(-dt * 2.4); b.vx *= k; b.vy *= k; b.vr *= k; }
    if (b.x < 20 || b.x > WORLD.w - 20) { b.vx = -b.vx * 0.7; b.x = clamp(b.x, 20, WORLD.w - 20); }
    if (b.y < 20 || b.y > WORLD.h - 20) { b.vy = -b.vy * 0.7; b.y = clamp(b.y, 20, WORLD.h - 20); }
    const sp = Math.hypot(b.vx, b.vy);
    if (b.h < 40 && sp > 110) {
      query(b.x, b.y, 80, tmpA);
      for (const e of tmpA) {
        if (e.dead || e.ghost || b.hit.has(e.id) || (e.x - b.x) ** 2 + (e.y - b.y) ** 2 > (e.r + 14) ** 2) continue;
        b.hit.add(e.id); hurtEnemy(e, CHAMB.dmg * G.S.dmg * (e.isBoss ? 2 : 1) * Math.min(1.3, sp / CHAMB.speed), 'boite');
        if (!e.isBoss) { e.vx += b.vx * 0.6; e.vy += b.vy * 0.6; }
        b.vx *= 0.8; b.vy *= 0.8; AU.play('boiteHit');
        if (e.dead) G.chambKills = (G.chambKills || 0) + 1;
      }
    }
    if (b.h === 0 && b.vh === 0 && sp < 25) { b.lie = 0.001; b.vx = 0; b.vy = 0; }
  }
  G.boites = G.boites.filter(b => b.lie < CHAMB.lie);
  if (G.boites.length > 60) G.boites.splice(0, G.boites.length - 60);
}
// les moulinets gagnés : ils tournent autour de la goutte et fauchent les ratures
const moulPos = (i, n) => { const a = G.t * 3.4 + i / n * TAU; return { x: G.p.x + Math.cos(a) * CHAMB.moulR, y: G.p.y + Math.sin(a) * CHAMB.moulR * 0.9, a }; };
function stepMoulinets(dt) {
  for (const m of G.moulinets) m.t += dt;
  G.moulinets = G.moulinets.filter(m => m.t < CHAMB.moulinet);
  const n = G.moulinets.length;
  for (let i = 0; i < n; i++) {
    const q = moulPos(i, n);
    query(q.x, q.y, 70, tmpA);
    for (const e of tmpA) if (!e.dead && !e.ghost && (e.mouCd || 0) <= G.t && (e.x - q.x) ** 2 + (e.y - q.y) ** 2 < (e.r + 16) ** 2) {
      e.mouCd = G.t + 0.3; hurtEnemy(e, CHAMB.moulDmg * G.S.dmg, 'moulinet', Math.cos(q.a + 1.57), Math.sin(q.a + 1.57));
      if (!e.isBoss) { e.vx += Math.cos(q.a + 1.57) * 220; e.vy += Math.sin(q.a + 1.57) * 220; }
    }
  }
}
// le pompon du Grand Manège : qui l'attrape a un tour gratuit (un cœur), et le manège s'arrête, tout étourdi
function stepPompon(dt) {
  const P = G.pompon; if (!P) return;
  P.t += dt;
  const B = P.from;
  if (!B || B.dead || P.t >= MANEGE.pompon) { G.pompon = null; if (B && !B.dead) addText(P.x, P.y - 30, 'le pompon remonte…', C.pencil, 22); return; }
  if (B.hp < B.maxHp / 2) {   // en colère, le forain tire sur la ficelle : le pompon fuit un peu
    const dx = P.x - G.p.x, dy = P.y - G.p.y, d = Math.hypot(dx, dy) || 1;
    if (d < 260) { P.x = clamp(P.x + dx / d * 70 * dt, 60, WORLD.w - 60); P.y = clamp(P.y + dy / d * 70 * dt, 60, WORLD.h - 60); }
  }
  if ((G.p.x - P.x) ** 2 + (G.p.y - P.y) ** 2 < (G.p.r + 26) ** 2) {
    G.pompon = null; G.pompons = (G.pompons || 0) + 1;
    B.stun = MANEGE.stun; B.phase = 'walk'; B.atk = MANEGE.stun + 0.8;
    G.p.hp = Math.min(G.p.maxHp, G.p.hp + 1);
    AU.play('pompon'); G.cam.shake = Math.max(G.cam.shake, 8);
    caption('Le pompon ! Un tour gratuit… et le manège a le tournis !', 2.6, 'green');
    for (let i = 0; i < 24; i++) { const a = rnd(TAU), s = rnd(100, 340); G.parts.push({ x: P.x, y: P.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.8, max: 0.8, size: rnd(2, 5), color: i % 2 ? '#e85a5f' : C.gold, drag: 3 }); }
  }
}
function chambouleTarget() {   // le pilote va au stand (en restant à portée de plume), puis au pompon
  if (!enKermesse()) return null;
  if (G.pompon) return G.pompon;
  const S = G.stand; if (!S || S.end) return null;
  const dx = G.p.x - S.x, dy = G.p.y - S.y, d = Math.hypot(dx, dy) || 1;
  return d < 260 ? null : { x: S.x + dx / d * 200, y: S.y + dy / d * 200 };
}
// la visée : à portée, une boîte encore debout passe avant les ratures
function chambouleAim(bd) {
  const S = G.stand; if (!S || S.end || !enKermesse()) return null;
  let best = null;
  for (let i = BOITES.length - 1; i >= 0; i--) {   // celles du bas d'abord : elles font tomber les autres
    if (!S.up[i]) continue;
    const b = boitePos(S, i), d = ((b.x - G.p.x) ** 2 + (b.y - G.p.y) ** 2);
    if (d > CHAMB.aim ** 2) continue;
    const w = d * 0.1 * (BOITES[i][1] > 30 ? 1.4 : 1);
    if (w < bd && (!best || w < best.w)) best = { x: b.x, y: b.y, vx: 0, vy: 0, w };
  }
  return best;
}

/* ----- dessin ----- */
function drawChamboule() {
  for (const b of G.boites) {   // les boîtes par terre, et en vol
    const a = b.lie > 0 ? clamp(1 - (b.lie - (CHAMB.lie - 1)), 0, 1) : 1;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(46,46,51,0.15)'; ctx.beginPath(); ctx.ellipse(b.x, b.y + 8, 14, 4, 0, 0, TAU); ctx.fill();
    ctx.translate(b.x, b.y - b.h); ctx.rotate(b.lie > 0 ? 1.57 : b.rot); drawBoite(b.col, true);
    ctx.restore();
  }
  if (G.pompon) drawPompon(G.pompon);
  const S = G.stand; if (!S) return;
  const a = S.end ? clamp(1 - (S.endT - 1.4) / 0.8, 0, 1) : Math.min(1, S.t * 3);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(S.x, S.y);
  ctx.fillStyle = 'rgba(46,46,51,0.14)'; ctx.beginPath(); ctx.ellipse(0, 34, 80, 14, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#d3a06a'; ctx.strokeStyle = '#7a4e1e'; ctx.lineWidth = 2.5;   // la planche sur ses tréteaux
  ctx.beginPath(); ctx.moveTo(-50, 8); ctx.lineTo(-58, 34); ctx.moveTo(50, 8); ctx.lineTo(58, 34); ctx.stroke();
  ctx.fillRect(-64, -2, 128, 10); ctx.strokeRect(-64, -2, 128, 10);
  ctx.fillStyle = '#fffdf4'; ctx.strokeStyle = '#b0452f'; ctx.lineWidth = 2; ctx.fillRect(-56, 12, 112, 18); ctx.strokeRect(-56, 12, 112, 18);
  ctx.restore();
  txt('CHAMBOULE-TOUT', S.x, S.y + 21, 13, { color: '#b0452f', alpha: a });
  for (let i = 0; i < BOITES.length; i++) {
    if (!S.up[i]) continue;
    const b = boitePos(S, i), wob = S.end ? 0 : Math.sin(G.time * 3 + i) * 0.02 + Math.sin(G.time * 60) * S.wob[i] * 0.6;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(b.x, b.y); ctx.rotate(wob); drawBoite(BOITE_COLS[i], false); ctx.restore();
  }
  if (!S.end) {   // le temps qui reste, en rond autour du stand
    const k = clamp(1 - S.t / CHAMB.len, 0, 1);
    ctx.save(); ctx.strokeStyle = k < 0.3 ? C.red : '#b0452f'; ctx.globalAlpha = 0.55; ctx.lineWidth = 4; ctx.setLineDash([10, 8]);
    ctx.beginPath(); ctx.arc(S.x, S.y - 30, 110, -Math.PI / 2, -Math.PI / 2 + k * TAU); ctx.stroke(); ctx.restore();
  }
  for (const f of G.chambFx) { const q = f.t / f.dur; txt('Gagné !', f.x, f.y - 60 - q * 50, 56, { font: FONT_CURSIVE, weight: 400, color: '#b0452f', alpha: 1 - q, hl: C.hlGold }); }
}
function drawBoite(col, open) {   // une boîte de conserve peinte, avec son étiquette
  ctx.fillStyle = col; ctx.strokeStyle = 'rgba(46,46,51,0.7)'; ctx.lineWidth = 1.8;
  ctx.fillRect(-12, -16, 24, 32); ctx.strokeRect(-12, -16, 24, 32);
  ctx.fillStyle = '#fffdf4'; ctx.fillRect(-12, -5, 24, 10);
  ctx.fillStyle = '#c7c9d1'; ctx.beginPath(); ctx.ellipse(0, -16, 12, 3.5, 0, 0, TAU); ctx.fill(); ctx.stroke();
  if (open) { ctx.fillStyle = 'rgba(46,46,51,0.5)'; ctx.beginPath(); ctx.ellipse(0, -16, 8, 2, 0, 0, TAU); ctx.fill(); }
}
function drawPompon(P) {   // un pompon de laine qui pend au bout de sa ficelle
  const sw = Math.sin(G.time * 3) * 10, x = P.x + sw, y = P.y, k = Math.min(1, P.t * 3), blink = P.t > MANEGE.pompon - 1.2 && Math.sin(G.time * 20) > 0;
  ctx.save(); ctx.strokeStyle = 'rgba(46,46,51,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(P.x, y - 260); ctx.lineTo(x, y - 260 + 240 * k); ctx.stroke();
  ctx.translate(x, y - 20 + 20 * k); ctx.globalAlpha = blink ? 0.5 : 1;
  for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + G.time; ctx.strokeStyle = i % 2 ? '#e85a5f' : '#f2c14e'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 20, Math.sin(a) * 20); ctx.stroke(); }
  ctx.fillStyle = '#ffd36b'; ctx.beginPath(); ctx.arc(0, 0, 12, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.strokeStyle = C.gold; ctx.globalAlpha = 0.4 + 0.3 * Math.sin(G.time * 8); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(x, y, 36, 0, TAU); ctx.stroke(); ctx.restore();
}
function drawMoulinets() {
  const n = G.moulinets ? G.moulinets.length : 0;
  for (let i = 0; i < n; i++) {
    const q = moulPos(i, n), left = CHAMB.moulinet - G.moulinets[i].t, a = left < 2 && Math.sin(G.time * 16) > 0 ? 0.4 : 1;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(q.x, q.y);
    ctx.strokeStyle = '#7a4e1e'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 24); ctx.stroke();
    ctx.rotate(G.time * 14);
    for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); ctx.fillStyle = FANION_COLS[k]; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -15); ctx.lineTo(10, -8); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#fffdf4'; ctx.beginPath(); ctx.arc(0, 0, 3, 0, TAU); ctx.fill();
    ctx.restore();
  }
}
function drawChambouleArrow() {
  if (G.state !== 'play' || !enKermesse()) return;
  if (G.pompon) edgeArrow(G.pompon.x, G.pompon.y);
  else if (G.stand && !G.stand.end) edgeArrow(G.stand.x, G.stand.y);
}
function drawChambouleHUD() {   // le ticket du stand, en haut à gauche : les boîtes tombées et le temps
  const S = G.stand; if (!S || !enKermesse() || G.state !== 'play') return;
  const s = U, w = 200 * s, h = 76 * s, x = SAFE.l + 18 * s, y = SAFE.t + 84 * s, a = S.end ? clamp(1 - (S.endT - 1.4) / 0.8, 0, 1) : Math.min(1, S.t * 4);
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(-0.02);
  ctx.fillStyle = 'rgba(46,46,51,0.15)'; ctx.fillRect(5, 6, w, h);
  ctx.fillStyle = '#ffe9a8'; ctx.fillRect(0, 0, w, h); ctx.strokeStyle = '#b0452f'; ctx.lineWidth = 2; ctx.setLineDash([5, 4]); ctx.strokeRect(5 * s, 5 * s, w - 10 * s, h - 10 * s); ctx.setLineDash([]);
  ctx.restore();
  txt(S.win ? 'Gagné !' : S.end ? 'Stand fermé' : 'Chamboule-tout', x + w / 2, y + 22 * s, 18 * s, { color: '#b0452f', alpha: a });
  for (let i = 0; i < BOITES.length; i++) { ctx.save(); ctx.globalAlpha = a * (S.up[i] ? 1 : 0.25); ctx.fillStyle = BOITE_COLS[i]; ctx.fillRect(x + (30 + i * 25) * s, y + 40 * s, 16 * s, 20 * s); ctx.restore(); }
  if (!S.end) { const k = clamp(1 - S.t / CHAMB.len, 0, 1); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = k < 0.3 ? C.red : '#b0452f'; ctx.fillRect(x + 14 * s, y + h - 10 * s, (w - 28 * s) * k, 4 * s); ctx.restore(); }
}
