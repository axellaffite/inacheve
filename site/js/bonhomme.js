'use strict';
// Le bonhomme de neige (itération 34) : à la classe de neige, une petite boule attend sur la page. Pousse-la : elle roule
// devant toi et grossit. Bien ronde, amène-la dans le rond « ici ». Trois boules (grosse, moyenne, petite) font un bonhomme
// qui prend vie un moment et lance des boules de neige sur les ratures.

const BH = { first: 12, again: 16, need: [620, 460, 300], r0: 12, r1: [50, 37, 26], spotD: [520, 800], ballD: 240, hitDrop: true,
  life: 24, melt: 2, rate: 1.7, dmg: 1.3, range: 520, bump: 6, bumpCd: 0.4 };

function stepBonhomme(dt) {
  if (!enNeige()) return;
  const p = G.p;
  if (!G.bh) { if (G.t >= G.nextBh && G.state === 'play') startBonhomme(0); return; }
  const B = G.bh;
  if (B.alive) { stepBonhommeVivant(B, dt); return; }
  const b = B.ball;
  if (!b.carried) {
    if ((p.x - b.x) ** 2 + (p.y - b.y) ** 2 < (p.r + b.r + 6) ** 2) {
      b.carried = true; AU.play('bhBall');
      if (!G.bhRollSeen) { G.bhRollSeen = true; caption('Pousse la boule : elle grossit en roulant ! Bien ronde, amène-la dans le rond.', 3.4, 'green'); }
    }
  } else {
    if (p.hp < B.hp) { b.carried = false; B.hp = p.hp; addText(b.x, b.y - b.r - 20, 'oups !', '#3b6fa3', 22); }   // touchée : la boule s'échappe
    else {
      const sp = Math.hypot(p.vx, p.vy), need = BH.need[B.stage];
      b.roll = Math.min(need, b.roll + sp * dt);
      b.r = BH.r0 + (BH.r1[B.stage] - BH.r0) * (b.roll / need);
      const tx = p.x + Math.cos(p.face) * (p.r + b.r + 2), ty = p.y + Math.sin(p.face) * (p.r + b.r + 2), k = 1 - Math.exp(-dt * 16);
      const ox = b.x, oy = b.y; b.x = clamp(lerp(b.x, tx, k), b.r, WORLD.w - b.r); b.y = clamp(lerp(b.y, ty, k), b.r, WORLD.h - b.r);
      b.spin += Math.hypot(b.x - ox, b.y - oy) / Math.max(8, b.r);
      if (sp > 40 && rand() < dt * 18) G.parts.push({ x: b.x + rnd(-b.r, b.r) * 0.6, y: b.y + b.r * 0.7, vx: rnd(-30, 30), vy: rnd(-20, 10), life: 0.6, max: 0.6, size: rnd(2, 4), color: '#ffffff', drag: 3 });
      query(b.x, b.y, b.r + 40, tmpB);   // la boule qui roule bouscule les ratures
      for (const e of tmpB) if (!e.dead && !e.ghost && !e.isBoss && (e.bhCd || 0) <= G.t && (e.x - b.x) ** 2 + (e.y - b.y) ** 2 < (e.r + b.r) ** 2) {
        e.bhCd = G.t + BH.bumpCd; const d = Math.hypot(e.x - b.x, e.y - b.y) || 1;
        hurtEnemy(e, BH.bump * G.S.dmg * (0.5 + b.roll / need), 'bh', (e.x - b.x) / d, (e.y - b.y) / d);
        e.vx += (e.x - b.x) / d * 320; e.vy += (e.y - b.y) / d * 320;
        if (e.dead) G.bhKills = (G.bhKills || 0) + 1;
      }
      const full = b.roll >= need, inSpot = (b.x - B.spot.x) ** 2 + (b.y - B.spot.y) ** 2 < (BH.r1[0] + 20) ** 2;
      if (full && !B.fullSaid) { B.fullSaid = true; AU.play('bhPret'); addText(b.x, b.y - b.r - 24, 'bien ronde !', '#3b6fa3', 24); }
      if (inSpot && full) poseBoule(B);
      else if (inSpot && !full && !G.bhSmallSeen) { G.bhSmallSeen = true; caption('Trop petite ! Roule-la encore un peu…', 2.4, 'green'); }
    }
  }
  if (!b.carried || p.hp > B.hp) B.hp = p.hp;
}
function startBonhomme(stage) {
  const p = G.p, a = rnd(TAU), d = rnd(BH.spotD[0], BH.spotD[1]);
  const spot = { x: clamp(p.x + Math.cos(a) * d, 200, WORLD.w - 200), y: clamp(p.y + Math.sin(a) * d, 240, WORLD.h - 200) };
  G.bh = { stage: 0, spot, ball: null, hp: p.hp, alive: null, fullSaid: false };
  for (let i = 0; i < stage; i++) G.bh.stage++;
  newBoule(G.bh, p.x, p.y);
  AU.play('bhBall');
  if (!G.bhSeen) { G.bhSeen = true; caption('Une boule de neige t’attend : on fait un bonhomme ?', 3, 'green'); }
}
function newBoule(B, fx, fy) {
  const a = rnd(TAU);
  B.ball = { x: clamp(fx + Math.cos(a) * BH.ballD, 80, WORLD.w - 80), y: clamp(fy + Math.sin(a) * BH.ballD, 80, WORLD.h - 80), r: BH.r0, roll: 0, spin: 0, carried: false };
  B.fullSaid = false;
}
function poseBoule(B) {
  B.stage++; AU.play('bhPose', B.stage);
  G.score += 120 * B.stage; G.xp += 3;
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  G.rings.push({ x: B.spot.x, y: B.spot.y, t: 0, dur: 0.5, r: 120, color: '#8fc4ef' });
  if (B.stage >= 3) {
    B.ball = null; B.alive = { t: 0, fire: 0.8, look: 0, throwT: 0 };
    G.bonshommes = (G.bonshommes || 0) + 1;
    G.p.hp = Math.min(G.p.maxHp, G.p.hp + 1);
    AU.play('bhVie'); G.cam.shake = Math.max(G.cam.shake, 4);
    caption('Le bonhomme de neige prend vie ! Il lance des boules sur les ratures… et un cœur pour toi.', 3.2, 'green');
    if (G.v && typeof voisinSay === 'function') voisinSay('neige');
  } else {
    caption(B.stage === 1 ? 'Le ventre est posé ! Maintenant, le buste…' : 'Le buste est posé ! Plus que la tête…', 2.4, 'green');
    newBoule(B, B.spot.x, B.spot.y);
  }
}
function stepBonhommeVivant(B, dt) {
  const A = B.alive, s = B.spot;
  A.t += dt; A.throwT = Math.max(0, A.throwT - dt);
  if (A.t >= BH.life + BH.melt) { G.bh = null; G.nextBh = G.t + BH.again; AU.play('bhFonte'); return; }
  if (A.t >= BH.life) return;   // il fond
  A.fire -= dt;
  if (A.fire > 0) return;
  let tgt = null, bd = BH.range * BH.range;
  const hx = s.x, hy = s.y - 130;
  for (const e of G.enemies) { if (e.ghost || e.dead) continue; const d = (e.x - hx) ** 2 + (e.y - hy) ** 2; if (d < bd) { bd = d; tgt = e; } }
  if (!tgt) { A.fire = 0.2; return; }
  A.fire = 1 / BH.rate; A.throwT = 0.3;
  const a = Math.atan2(tgt.y - hy, tgt.x - hx); A.look = a;
  for (const o of [-0.12, 0, 0.12]) G.shots.push({ x: hx + Math.cos(a + o) * 20, y: hy + Math.sin(a + o) * 20, vx: Math.cos(a + o) * 520, vy: Math.sin(a + o) * 520, r: 7, life: 1.1, pierce: 1, bounce: 0, hit: new Set(), px: hx, py: hy, neige: true, k: BH.dmg });
  AU.play('bhLance');
}
function bonhommeTarget() {
  const B = G.bh;
  if (!enNeige() || !B || B.alive || !B.ball) return null;
  if (!B.ball.carried) return B.ball;
  return B.ball.roll >= BH.need[B.stage] ? B.spot : null;   // pas encore ronde : on la promène
}

/* ----- dessin ----- */
function drawSnowBall(x, y, r, spin) {
  ctx.fillStyle = 'rgba(46,46,51,0.12)'; ctx.beginPath(); ctx.ellipse(x, y + r * 0.92, r * 0.95, r * 0.25, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#7ea6cc'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(160,200,235,0.35)'; ctx.beginPath(); ctx.arc(x + r * 0.25, y + r * 0.3, r * 0.6, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(126,166,204,0.5)'; ctx.lineWidth = 1.5;
  for (let k = 0; k < 3; k++) { const a = spin + k * 2.1; ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.5, y + Math.sin(a) * r * 0.5, r * 0.18, 0, TAU); ctx.stroke(); }
}
// les boules empilées : le ventre posé au sol du rond, puis le buste, puis la tête
function bonhommeStack(s, n) {
  const out = []; let y = s.y + 20;
  for (let i = 0; i < n; i++) { const r = BH.r1[i]; y -= r; out.push({ x: s.x, y, r }); y -= r * 0.75; }
  return out;
}
function drawBonhomme() {
  const B = G.bh;
  if (!B || !enNeige()) return;
  const s = B.spot, A = B.alive;
  if (!A) {   // le rond « ici », en pointillés
    ctx.save(); ctx.strokeStyle = '#3b6fa3'; ctx.globalAlpha = 0.6; ctx.lineWidth = 3; ctx.setLineDash([10, 9]); ctx.lineDashOffset = -G.time * 20;
    ctx.beginPath(); ctx.ellipse(s.x, s.y + 20, BH.r1[0] + 20, (BH.r1[0] + 20) * 0.45, 0, 0, TAU); ctx.stroke(); ctx.restore();
    if (B.stage === 0) txt('ici, un bonhomme', s.x, s.y + 84, 24, { color: '#3b6fa3', alpha: 0.75 });
  }
  const parts = bonhommeStack(s, Math.min(3, B.stage));
  const melt = A && A.t > BH.life ? clamp((A.t - BH.life) / BH.melt, 0, 1) : 0;
  ctx.save();
  if (melt) { ctx.translate(s.x, s.y + 20); ctx.scale(1 + melt * 0.4, 1 - melt * 0.75); ctx.translate(-s.x, -s.y - 20); ctx.globalAlpha = 1 - melt * 0.5; }
  for (const q of parts) drawSnowBall(q.x, q.y, q.r, 0);
  if (A) drawBonhommeVisage(parts, A);
  ctx.restore();
  if (A && A.t < BH.life) {   // le temps qui reste, en pointillé autour de lui
    const k = clamp(1 - A.t / BH.life, 0, 1);
    ctx.save(); ctx.strokeStyle = '#3b6fa3'; ctx.globalAlpha = 0.45; ctx.lineWidth = 4; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.arc(s.x, s.y - 50, 120, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke(); ctx.restore();
  }
  const b = B.ball;
  if (b) {
    drawSnowBall(b.x, b.y, b.r, b.spin);
    const need = BH.need[B.stage], k = b.roll / need;
    if (k < 1) { ctx.save(); ctx.strokeStyle = '#3b6fa3'; ctx.globalAlpha = 0.6; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(b.x, b.y, b.r + 8, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke(); ctx.restore(); }
    else txt('★', b.x, b.y - b.r - 16, 22, { color: C.gold });
  }
}
function drawBonhommeVisage(parts, A) {
  const head = parts[2], bust = parts[1], base = parts[0], la = A.look;
  // les bras en brindilles (celui qui lance se lève)
  ctx.strokeStyle = '#6e4626'; ctx.lineWidth = 3.5; ctx.lineCap = 'round';
  for (const sd of [-1, 1]) {
    const up = A.throwT > 0 && sd === (Math.cos(la) >= 0 ? 1 : -1), a = up ? -1.1 : -0.35 + Math.sin(G.time * 3 + sd) * 0.15;
    const x0 = bust.x + sd * bust.r * 0.85, y0 = bust.y - 4, x1 = x0 + sd * Math.cos(a) * 46, y1 = y0 + Math.sin(a) * 46;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.moveTo(x0 + sd * Math.cos(a) * 30, y0 + Math.sin(a) * 30); ctx.lineTo(x1 + sd * 4, y1 - 14); ctx.stroke();
  }
  ctx.fillStyle = C.graphite;   // les boutons de charbon
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(bust.x, bust.y + i * 11, 3.5, 0, TAU); ctx.fill(); }
  ctx.beginPath(); ctx.arc(base.x, base.y - 12, 4, 0, TAU); ctx.fill();
  // l'écharpe rouge
  ctx.fillStyle = '#c8424a'; ctx.beginPath(); roundRect(head.x - head.r, head.y + head.r * 0.6, head.r * 2, 9, 4); ctx.fill();
  ctx.beginPath(); ctx.moveTo(head.x + head.r * 0.4, head.y + head.r * 0.9); ctx.lineTo(head.x + head.r * 0.9 + Math.sin(G.time * 4) * 3, head.y + head.r * 2); ctx.lineTo(head.x + head.r * 0.2, head.y + head.r * 1.9); ctx.closePath(); ctx.fill();
  // les yeux, et le nez en carotte qui suit la cible
  const lx = Math.cos(la) * 3, ly = Math.sin(la) * 2;
  ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(head.x - 8 + lx, head.y - 5 + ly, 3, 0, TAU); ctx.arc(head.x + 8 + lx, head.y - 5 + ly, 3, 0, TAU); ctx.fill();
  const nx = Math.cos(la) >= 0 ? 1 : -1;
  ctx.fillStyle = '#e8742c'; ctx.beginPath(); ctx.moveTo(head.x, head.y + 1); ctx.lineTo(head.x + nx * 22, head.y + 4); ctx.lineTo(head.x, head.y + 7); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(head.x, head.y + 6, 9, 0.5, Math.PI - 0.5); ctx.stroke();
  // le bonnet à pompon
  ctx.fillStyle = '#3c66c4'; ctx.beginPath(); ctx.arc(head.x, head.y - head.r * 0.45, head.r * 0.85, Math.PI, TAU); ctx.fill();
  ctx.fillStyle = '#fdfcf6'; ctx.fillRect(head.x - head.r * 0.9, head.y - head.r * 0.5, head.r * 1.8, 6);
  ctx.beginPath(); ctx.arc(head.x, head.y - head.r * 1.35, 7, 0, TAU); ctx.fill();
}
// en haut à gauche : les trois boules du bonhomme
function drawBhHUD() {
  if (!enNeige() || G.state !== 'play' || !G.bh) return;
  const B = G.bh, s = U, x = SAFE.l + 22 * s, y = SAFE.t + 92 * s;
  txt(B.alive ? 'Il est vivant !' : 'Le bonhomme', x, y, 22 * s, { align: 'left', color: '#3b6fa3', hl: B.alive ? C.hl : undefined });
  let cx = x + 14 * s;
  for (let i = 0; i < 3; i++) {
    const r = (12 - i * 3) * s, cy = y + 32 * s;
    ctx.save(); ctx.lineWidth = 2 * s;
    if (i < B.stage) { ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#3b6fa3'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); ctx.stroke(); }
    else {
      ctx.strokeStyle = C.pencil; ctx.setLineDash([3 * s, 3 * s]); ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.stroke();
      if (i === B.stage && B.ball) { ctx.setLineDash([]); ctx.strokeStyle = '#3b6fa3'; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + TAU * B.ball.roll / BH.need[i]); ctx.stroke(); }
    }
    ctx.restore();
    cx += r * 2 + 10 * s;
  }
  txt(B.alive ? 'il lance des boules !' : B.ball && B.ball.carried ? (B.ball.roll >= BH.need[B.stage] ? 'amène-la dans le rond' : 'roule, roule…') : 'va chercher la boule', x, y + 58 * s, 17 * s, { align: 'left', color: C.pencil, weight: 400 });
}
function drawBhArrow() {
  if (G.state !== 'play' || !enNeige()) return;
  const t = bonhommeTarget();
  if (t) edgeArrow(t.x, t.y);
}
