'use strict';
// Le haricot dans le coton (itération 36) : au cahier de sciences, l'expérience que toute la classe a faite.
// Un bocal, un haricot posé sur du coton, un arrosoir par terre et un petit nuage de pluie qui se promène.
// Remplis l'arrosoir sous le nuage, arrose le haricot ; trois arrosages, et il devient un haricot magique
// qui pousse jusqu'au ciel et fouette les ratures de ses lianes.

const HA = { first: 14, again: 18, spotD: [460, 720], canD: 200, cloudD: [380, 560], rainR: 95, cloudUp: 170, fill: 1.5, potR: 78, pour: 1.7, need: 3,
  life: 22, wilt: 2, height: 430, rate: 1.1, whips: 2, range: 500, dmg: 13, bossDmg: 34 };

function stepHaricot(dt) {
  if (!enSci()) return;
  const p = G.p;
  if (!G.ha) { if (G.t >= G.nextHa && G.state === 'play') startHaricot(0); return; }
  const H = G.ha;
  stepNuagePluie(H);
  if (H.alive) { stepHaricotVivant(H, dt); return; }
  const c = H.can;
  H.pouring = false;
  if (!c.carried) {
    if ((p.x - c.x) ** 2 + (p.y - c.y) ** 2 < (p.r + 30) ** 2) {
      c.carried = true; AU.play('haCan');
      if (!G.haCanSeen) { G.haCanSeen = true; caption('L’arrosoir ! Remplis-le sous le petit nuage de pluie, puis arrose le haricot.', 3.4, 'green'); }
    }
  } else {
    const k = 1 - Math.exp(-dt * 18), side = Math.cos(p.face) >= 0 ? 1 : -1;
    c.x = lerp(c.x, p.x + side * 26, k); c.y = lerp(c.y, p.y + 4, k); c.side = side;
    if (p.hp < H.hp && c.water > 0) {   // touchée : l'eau se renverse
      c.water = 0; AU.play('haRenverse'); addText(c.x, c.y - 30, 'renversé !', '#3b6fa3', 22);
      for (let i = 0; i < 12; i++) { const a = rnd(TAU), s = rnd(60, 200); G.parts.push({ x: c.x, y: c.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5, max: 0.5, size: rnd(2, 4), color: '#6fa8dc', drag: 4 }); }
    }
    const R = H.rain, inRain = (p.x - R.x) ** 2 + (p.y - R.y) ** 2 < HA.rainR ** 2;
    if (inRain && c.water < 1) {
      c.water = Math.min(1, c.water + dt / HA.fill);
      if (c.water >= 1) { AU.play('haPlein'); addText(c.x, c.y - 34, 'plein !', '#3b6fa3', 24); }
    }
    const atPot = (p.x - H.spot.x) ** 2 + (p.y - H.spot.y) ** 2 < HA.potR ** 2;
    if (atPot && c.water > 0) {
      const w = Math.min(c.water, dt / HA.pour);
      c.water -= w; H.pour += w; H.pouring = true; AU.play('haArrose');
      if (c.water < 1e-4) c.water = 0;
      if (H.pour >= 0.999) { H.pour = 0; pousseHaricot(H); }
    } else if (atPot && !H.emptySaid && H.stage < HA.need) { H.emptySaid = true; caption('L’arrosoir est vide : retourne sous le nuage !', 2.4, 'green'); }
  }
  H.hp = p.hp;
}
function startHaricot(stage) {
  const p = G.p, a = rnd(TAU), d = rnd(HA.spotD[0], HA.spotD[1]);
  const spot = { x: clamp(p.x + Math.cos(a) * d, 220, WORLD.w - 220), y: clamp(p.y + Math.sin(a) * d, 320, WORLD.h - 160) };
  const b = a + Math.PI + rnd(-0.8, 0.8), cd = rnd(HA.cloudD[0], HA.cloudD[1]);
  const ox = clamp(p.x + Math.cos(b) * cd, 260, WORLD.w - 260), oy = clamp(p.y + Math.sin(b) * cd, 320, WORLD.h - 200);
  const ca = rnd(TAU);
  G.ha = { stage: clamp(stage | 0, 0, HA.need - 1), spot, pour: 0, pouring: false, emptySaid: false, hp: p.hp, alive: null,
    cloud: { ox, oy, ph: rnd(TAU) }, rain: { x: ox, y: oy },
    can: { x: clamp(p.x + Math.cos(ca) * HA.canD, 80, WORLD.w - 80), y: clamp(p.y + Math.sin(ca) * HA.canD, 80, WORLD.h - 80), carried: false, water: 0, side: 1 } };
  stepNuagePluie(G.ha);
  AU.play('haCan');
  if (!G.haSeen) { G.haSeen = true; caption('L’expérience du jour : faire pousser un haricot dans le coton !', 3, 'green'); }
}
function stepNuagePluie(H) {   // le petit nuage se promène doucement autour de sa place
  const c = H.cloud;
  H.rain.x = clamp(c.ox + Math.cos(G.t * 0.35 + c.ph) * 120, 120, WORLD.w - 120);
  H.rain.y = clamp(c.oy + Math.sin(G.t * 0.27 + c.ph) * 70, 220, WORLD.h - 120);
}
function pousseHaricot(H) {
  H.stage++; H.emptySaid = false; AU.play('haPousse', H.stage);
  G.score += 150 * H.stage; G.xp += 3;
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  G.rings.push({ x: H.spot.x, y: H.spot.y, t: 0, dur: 0.5, r: 110, color: '#7fbf5a' });
  if (H.stage >= HA.need) {
    H.alive = { t: 0, fire: 1.2, whips: [] };
    G.haricots = (G.haricots || 0) + 1;
    G.p.hp = Math.min(G.p.maxHp, G.p.hp + 1);
    G.score += 600;
    AU.play('haVie'); G.cam.shake = Math.max(G.cam.shake, 6);
    caption('Le haricot magique pousse jusqu’au ciel ! Ses lianes fouettent les ratures… et un cœur pour toi.', 3.4, 'green');
    if (G.v && typeof voisinSay === 'function') voisinSay('sciences');
  } else caption(H.stage === 1 ? 'Une racine… et un petit germe ! Encore de l’eau.' : 'Deux feuilles ! Un dernier arrosage…', 2.6, 'green');
}
function haricotTop(H) {   // le haut de la tige (elle pousse vite au début)
  const A = H.alive, g = A ? ease(clamp(A.t / 1.6, 0, 1)) : 0, wilt = A && A.t > HA.life ? clamp((A.t - HA.life) / HA.wilt, 0, 1) : 0;
  return HA.height * g * (1 - wilt * 0.5);
}
function haricotPoint(H, k) {   // un point de la tige, de 0 (le bocal) à 1 (le sommet)
  const hh = haricotTop(H), y = H.spot.y - 40 - hh * k;
  return { x: H.spot.x + Math.sin(k * 7 + G.time * 1.6) * 26 * k, y };
}
function stepHaricotVivant(H, dt) {
  const A = H.alive;
  A.t += dt;
  for (const w of A.whips) w.t += dt;
  A.whips = A.whips.filter(w => w.t < 0.4);
  if (A.t >= HA.life + HA.wilt) { G.ha = null; G.nextHa = G.t + HA.again; AU.play('haFin'); return; }
  if (A.t >= HA.life || A.t < 1) return;
  A.fire -= dt; if (A.fire > 0) return;
  A.fire = 1 / HA.rate;
  const mid = haricotPoint(H, 0.55), R2 = HA.range * HA.range;
  const list = G.enemies.filter(e => !e.dead && !e.ghost && (e.x - mid.x) ** 2 + (e.y - mid.y) ** 2 < R2)
    .map(e => ({ e, d: (e.x - mid.x) ** 2 + (e.y - mid.y) ** 2 })).sort((a, b) => a.d - b.d).slice(0, HA.whips);
  if (!list.length) { A.fire = 0.25; return; }
  for (const { e } of list) {
    const from = haricotPoint(H, 0.3 + (e.id % 5) * 0.12), d = Math.hypot(e.x - from.x, e.y - from.y) || 1;
    A.whips.push({ x0: from.x, y0: from.y, x1: e.x, y1: e.y, t: 0, s: e.id % 2 ? 1 : -1 });
    hurtEnemy(e, (e.isBoss ? HA.bossDmg : HA.dmg) * G.S.dmg, 'ha', (e.x - from.x) / d, (e.y - from.y) / d);
    if (!e.isBoss && !e.dead) { e.vx += (e.x - from.x) / d * 300; e.vy += (e.y - from.y) / d * 300; }
    if (e.dead) G.haKills = (G.haKills || 0) + 1;
  }
  AU.play('haFouet');
}
function haricotTarget() {
  const H = G.ha;
  if (!enSci() || !H || H.alive) return null;
  const c = H.can;
  if (!c.carried) return c;
  if (c.water > 0 && (c.water >= 0.999 || H.pouring)) return H.spot;
  return H.rain;
}

/* ----- dessin ----- */
function drawHaricot() {
  const H = G.ha;
  if (!H || !enSci()) return;
  drawNuagePluie(H);
  const s = H.spot, A = H.alive, c = H.can;
  if (!A) {   // le rond où l'on arrose
    const ready = c.carried && c.water > 0;
    ctx.save(); ctx.strokeStyle = '#4f7a34'; ctx.globalAlpha = ready ? 0.55 + 0.25 * Math.sin(G.time * 6) : 0.4; ctx.lineWidth = 3; ctx.setLineDash([10, 9]); ctx.lineDashOffset = -G.time * 20;
    ctx.beginPath(); ctx.ellipse(s.x, s.y + 30, HA.potR, HA.potR * 0.45, 0, 0, TAU); ctx.stroke(); ctx.restore();
    if (H.stage === 0) txt('expérience : le haricot', s.x, s.y + 92, 24, { color: '#4f7a34', alpha: 0.8 });
  }
  if (A) drawHaricotMagique(H);
  drawBocal(s.x, s.y, A ? 3 : H.stage, H.pour);
  if (H.pouring) {   // l'eau qui coule de l'arrosoir
    const sx = c.x + c.side * 30, sy = c.y - 12;
    ctx.fillStyle = '#6fa8dc';
    for (let i = 0; i < 7; i++) { const k = (G.time * 2.2 + i / 7) % 1; ctx.beginPath(); ctx.arc(lerp(sx, s.x, k), lerp(sy, s.y - 30, k) - Math.sin(k * Math.PI) * 40, 3.2, 0, TAU); ctx.fill(); }
  }
  if (!A) drawArrosoir(c.x, c.y, c.side || 1, c.water, c.carried);
}
function drawBocal(x, y, stage, pour) {   // un bocal de verre, du coton, et le haricot qui germe
  ctx.save(); ctx.translate(x, y); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(46,46,51,0.12)'; ctx.beginPath(); ctx.ellipse(0, 34, 42, 10, 0, 0, TAU); ctx.fill();
  if (stage >= 1 && stage < 3) {   // la tige et ses feuilles, qui sortent du bocal
    ctx.strokeStyle = '#4f8a32'; ctx.lineWidth = 4; const hh = stage === 1 ? 26 : 70, sw = Math.sin(G.time * 2) * 4;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-8, -hh * 0.5, sw, -hh); ctx.stroke();
    if (stage === 1) { ctx.beginPath(); ctx.arc(sw + 4, -hh, 5, Math.PI, TAU * 0.9); ctx.stroke(); }
    else for (const sd of [-1, 1]) { ctx.save(); ctx.translate(sw, -hh); ctx.rotate(sd * 0.9); ctx.fillStyle = '#6fae46'; ctx.beginPath(); ctx.ellipse(0, -14, 9, 16, 0, 0, TAU); ctx.fill(); ctx.strokeStyle = '#3e6a26'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore(); }
  }
  ctx.fillStyle = 'rgba(200,230,250,0.35)'; ctx.strokeStyle = 'rgba(90,130,160,0.8)'; ctx.lineWidth = 3;   // le verre
  ctx.beginPath(); roundRect(-34, -26, 68, 62, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffffff';   // le coton
  for (const [cx, cy, r] of [[-18, 20, 13], [0, 18, 15], [18, 20, 13], [-9, 10, 11], [10, 10, 11]]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); }
  if (pour > 0) { ctx.fillStyle = 'rgba(111,168,220,0.35)'; ctx.fillRect(-31, 32 - 24 * pour, 62, 24 * pour); }   // le coton qui boit
  ctx.fillStyle = '#e8d6a8'; ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 2;   // le haricot
  ctx.beginPath(); ctx.ellipse(0, 4, 12, 8, -0.2, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(-1, 2, 2, 0, TAU); ctx.stroke();
  if (stage >= 1) { ctx.strokeStyle = '#f4efe0'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(4, 10); ctx.quadraticCurveTo(10, 22, 6, 30); ctx.moveTo(6, 22); ctx.lineTo(14, 26); ctx.stroke(); }   // la racine
  ctx.strokeStyle = 'rgba(90,130,160,0.8)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-38, -26); ctx.lineTo(38, -26); ctx.stroke();   // le bord
  ctx.restore();
}
function drawHaricotMagique(H) {   // la tige géante, ses feuilles, ses gousses, et les lianes qui fouettent
  const A = H.alive, hh = haricotTop(H), n = Math.max(2, Math.floor(hh / 14));
  const wilt = A.t > HA.life ? clamp((A.t - HA.life) / HA.wilt, 0, 1) : 0;
  ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalAlpha = 1 - wilt * 0.6;
  for (const tw of [0, Math.PI]) {   // deux tiges qui s'enroulent
    ctx.strokeStyle = tw ? '#4f8a32' : '#3e6a26'; ctx.lineWidth = 9 - (tw ? 2 : 0);
    ctx.beginPath();
    for (let i = 0; i <= n; i++) { const k = i / n, q = haricotPoint(H, k); ctx.lineTo(q.x + Math.sin(k * 12 + tw) * 9, q.y); }
    ctx.stroke();
  }
  for (let i = 1; i < 9; i++) {   // les feuilles et les gousses
    const k = i / 9, q = haricotPoint(H, k), sd = i % 2 ? 1 : -1, sz = 1 - k * 0.4;
    if (q.y > H.spot.y - 60) continue;
    ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(sd * (1 + Math.sin(G.time * 2 + i) * 0.2));
    ctx.fillStyle = wilt ? '#a8a04a' : '#6fae46'; ctx.strokeStyle = '#3e6a26'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(0, -26 * sz, 16 * sz, 28 * sz, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -50 * sz); ctx.stroke();
    ctx.restore();
    if (i % 3 === 0) { ctx.fillStyle = '#8fbf3a'; ctx.strokeStyle = '#4f7a34'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(q.x - sd * 18, q.y + 18, 6, 18, sd * 0.3, 0, TAU); ctx.fill(); ctx.stroke(); }
  }
  const top = haricotPoint(H, 1);   // une petite étoile tout en haut
  if (hh > 300) txt('★', top.x, top.y - 16, 30, { color: C.gold, alpha: 1 - wilt });
  for (const w of A.whips) {   // les lianes
    const k = 1 - w.t / 0.4, mx = (w.x0 + w.x1) / 2 + w.s * (w.y1 - w.y0) * 0.25, my = (w.y0 + w.y1) / 2 - w.s * (w.x1 - w.x0) * 0.25;
    ctx.globalAlpha = k; ctx.strokeStyle = '#4f8a32'; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(w.x0, w.y0); ctx.quadraticCurveTo(mx, my, w.x1, w.y1); ctx.stroke();
    ctx.fillStyle = '#6fae46'; ctx.beginPath(); ctx.ellipse(w.x1, w.y1, 8, 14, Math.atan2(w.y1 - my, w.x1 - mx) + Math.PI / 2, 0, TAU); ctx.fill();
  }
  ctx.restore();
  if (A.t < HA.life) {   // le temps qui reste
    const k = clamp(1 - A.t / HA.life, 0, 1);
    ctx.save(); ctx.strokeStyle = '#4f7a34'; ctx.globalAlpha = 0.45; ctx.lineWidth = 4; ctx.setLineDash([8, 8]);
    ctx.beginPath(); ctx.arc(H.spot.x, H.spot.y, 70, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke(); ctx.restore();
  }
}
function drawArrosoir(x, y, side, water, carried) {   // un arrosoir vert, son bec et sa pomme
  ctx.save(); ctx.translate(x, y); ctx.scale(side * (carried ? 0.8 : 1), carried ? 0.8 : 1); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  if (!carried) { ctx.fillStyle = 'rgba(46,46,51,0.14)'; ctx.beginPath(); ctx.ellipse(0, 20, 30, 7, 0, 0, TAU); ctx.fill(); }
  ctx.strokeStyle = '#2f5a2a'; ctx.lineWidth = 3; ctx.fillStyle = '#5fae6a';
  ctx.beginPath(); ctx.moveTo(10, -2); ctx.lineTo(38, -22); ctx.stroke();   // le bec
  ctx.beginPath(); ctx.ellipse(40, -23, 4, 7, -0.6, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.beginPath(); roundRect(-20, -14, 32, 34, 6); ctx.fill(); ctx.stroke();   // la cuve
  ctx.beginPath(); ctx.arc(-4, -16, 14, Math.PI, TAU); ctx.stroke();   // l'anse
  if (water > 0) { ctx.fillStyle = 'rgba(111,168,220,0.85)'; ctx.fillRect(-17, 17 - 28 * water, 26, 28 * water); }
  ctx.restore();
  if (!carried) { ctx.save(); ctx.strokeStyle = C.gold; ctx.globalAlpha = 0.5 + 0.3 * Math.sin(G.time * 5); ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(x, y, 40, 0, TAU); ctx.stroke(); ctx.restore(); }
}
function drawNuagePluie(H) {   // le petit nuage, sa pluie et la flaque où l'on remplit l'arrosoir
  const R = H.rain, cx = R.x, cy = R.y - HA.cloudUp, filling = H.can.carried && H.can.water < 1 && (G.p.x - R.x) ** 2 + (G.p.y - R.y) ** 2 < HA.rainR ** 2;
  ctx.save();
  ctx.fillStyle = 'rgba(111,168,220,0.16)'; ctx.strokeStyle = 'rgba(59,111,163,0.55)'; ctx.lineWidth = 2.5; ctx.setLineDash([8, 8]);
  ctx.beginPath(); ctx.ellipse(R.x, R.y, HA.rainR, HA.rainR * 0.5, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(80,130,190,0.6)'; ctx.lineWidth = 2;   // la pluie
  for (let i = 0; i < 12; i++) { const k = (G.time * 1.6 + i * 0.37) % 1, x = cx - 60 + (i * 53 % 120), y = cy + 30 + k * (HA.cloudUp - 20); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 3, y + 14); ctx.stroke(); }
  ctx.fillStyle = '#eef2f7'; ctx.strokeStyle = '#7a8ea8'; ctx.lineWidth = 3;   // le nuage
  ctx.beginPath(); for (const [x, y, r] of [[-50, 8, 30], [-15, -10, 40], [28, -4, 34], [58, 10, 26], [0, 16, 32]]) { ctx.moveTo(cx + x + r, cy + y); ctx.arc(cx + x, cy + y, r, 0, TAU); } ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#eef2f7'; for (const [x, y, r] of [[-50, 8, 28], [-15, -10, 38], [28, -4, 32], [58, 10, 24], [0, 16, 30]]) { ctx.beginPath(); ctx.arc(cx + x, cy + y, r, 0, TAU); ctx.fill(); }
  ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(cx - 12, cy + 4, 3, 0, TAU); ctx.arc(cx + 12, cy + 4, 3, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy + 10, 7, 0.3, Math.PI - 0.3); ctx.stroke();
  ctx.restore();
  if (filling) { const k = H.can.water; ctx.save(); ctx.strokeStyle = '#3b6fa3'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(G.p.x, G.p.y, 30, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke(); ctx.restore(); }
}
// en haut à gauche : les trois arrosages du haricot
function drawHaHUD() {
  if (!enSci() || G.state !== 'play' || !G.ha) return;
  const H = G.ha, s = U, x = SAFE.l + 22 * s, y = SAFE.t + 92 * s, c = H.can;
  txt(H.alive ? 'Haricot magique !' : 'Le haricot', x, y, 22 * s, { align: 'left', color: '#4f7a34', hl: H.alive ? C.hl : undefined });
  let cx = x + 12 * s;
  for (let i = 0; i < HA.need; i++) {   // trois gouttes d'eau
    const cy = y + 32 * s, full = H.alive || i < H.stage;
    ctx.save(); ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(cx, cy - 12 * s); ctx.quadraticCurveTo(cx + 10 * s, cy + 2 * s, cx, cy + 8 * s); ctx.quadraticCurveTo(cx - 10 * s, cy + 2 * s, cx, cy - 12 * s);
    if (full) { ctx.fillStyle = '#6fa8dc'; ctx.fill(); ctx.strokeStyle = '#3b6fa3'; ctx.stroke(); }
    else { ctx.strokeStyle = C.pencil; ctx.setLineDash([3 * s, 3 * s]); ctx.stroke(); }
    ctx.restore(); cx += 26 * s;
  }
  if (!H.alive && c.carried) {   // l'eau dans l'arrosoir
    ctx.save(); ctx.strokeStyle = C.pencil; ctx.lineWidth = 1.5 * s; ctx.strokeRect(cx + 4 * s, y + 24 * s, 60 * s, 12 * s);
    ctx.fillStyle = '#6fa8dc'; ctx.fillRect(cx + 5 * s, y + 25 * s, 58 * s * c.water, 10 * s); ctx.restore();
  }
  const msg = H.alive ? 'ses lianes fouettent les ratures !' : !c.carried ? 'va chercher l’arrosoir' : c.water > 0 && (c.water >= 0.999 || H.pouring) ? 'arrose le haricot' : 'remplis-le sous le nuage';
  txt(msg, x, y + 58 * s, 17 * s, { align: 'left', color: C.pencil, weight: 400 });
}
function drawHaArrow() {
  if (G.state !== 'play' || !enSci()) return;
  const t = haricotTarget();
  if (t) edgeArrow(t.x, t.y);
}
