'use strict';

// La perforatrice (itération 22) : la troisième machine égarée. Elle saute sur la goutte et troue la page ;
// par les trous, on voit le bois du pupitre, et les ratures qui marchent dessus tombent à travers.
const PERFO = { at: 60, stay: 38, dist: 270, warn: 0.85, leap: 0.6, cycle: 2.6, first: 1.5, gap: 42, holeR: 30, hurtR: 66,
  life: 12, patch: 1.6, max: 26, fallT: 0.5, fallMax: 34, deathR: 520, deathMax: 24, deathLife: 7, again: 25 };
ETYPES.perforatrice = { r: 44, hp: 70, speed: 70, dmg: 1, xp: 30, agil: 1.8 };
const PERFO_BODY = '#d0643a', PERFO_STEEL = '#9aa0ad';
const NO_FALL = new Set(['mouette', 'corbeau', 'avion', 'soupir']);   // ce qui vole ne tombe pas
ERRANTES.add('perforatrice');
PHOTO_NOCOPY.add('perforatrice');

function stepPerfo(dt) {
  const at = G.perfoAt || (devoirHas('perfore') ? 20 : PERFO.at);
  if (!G.perfoDone && G.t >= at && !G.boss && !G.bossDefeated) {
    G.perfoDone = true;
    spawnPerforatrice();
  }
}
function spawnPerforatrice(x, y) {
  const e = x === undefined ? spawnAround('perforatrice') : spawnEnemy('perforatrice', x, y);
  e.hp = e.maxHp = ETYPES.perforatrice.hp * (1 + G.t / 190) * (1 + 0.15 * CH().scale);
  e.pt = PERFO.first; e.life = 0; e.lever = 0; e.clac = 0; e.h = 0; e.dir = 0; e.tx = e.x; e.ty = e.y; e.sx = e.x; e.sy = e.y;
  AU.play('perfoArrive');
  if (!G.perfoSeen) { G.perfoSeen = true; caption('Clac ! Une perforatrice s’est échappée du bureau !', 3.6, 'pink'); caption('Elle troue la page : attire les ratures dans ses trous !', 3.8, 'hl'); }
  else caption('La perforatrice est de retour !', 2.6, 'pink');
  return e;
}
// elle part d'elle-même, ou on la biffe : avec la consigne « feuille perforée », elle revient
function perfoGone() { if (devoirHas('perfore')) { G.perfoDone = false; G.perfoAt = G.t + PERFO.again; } }

function stepPerforatrice(e, dt, dx, dy, d, slow, hid) {
  e.pt -= dt; e.life += dt; e.clac = Math.max(0, e.clac - dt * 4);
  const want = clamp((d - PERFO.dist) / 120, -0.6, 1);
  let mx = (dx / d * want - dy / d * 0.45) * e.speed * slow, my = (dy / d * want + dx / d * 0.45) * e.speed * slow;
  if (e.phase === 'walk') {
    e.lever = Math.max(0, e.lever - dt * 3);
    if (e.life > PERFO.stay) { e.phase = 'leave'; e.pt = 1.1; e.ghost = true; caption('Plus de papier à trouer : la perforatrice retourne au bureau.', 2.6, 'hl'); AU.play('perfoJam'); }
    else if (e.pt <= 0 && d < 700 && !hid) {
      e.phase = 'warn'; e.pt = PERFO.warn; e.dir = rnd(-0.5, 0.5);
      e.tx = clamp(G.p.x + G.p.vx * 0.25, 60, WORLD.w - 60); e.ty = clamp(G.p.y + G.p.vy * 0.25, 60, WORLD.h - 60);
      AU.play('perfoWarn');
    }
  } else if (e.phase === 'warn') {
    mx = 0; my = 0; e.lever = Math.min(1, e.lever + dt * 3);
    if (e.pt > PERFO.warn * 0.45) {   // elle suit encore la goutte des yeux, puis elle se décide
      const k = Math.min(1, dt * 3);
      e.tx = clamp(lerp(e.tx, G.p.x, k), 60, WORLD.w - 60); e.ty = clamp(lerp(e.ty, G.p.y, k), 60, WORLD.h - 60);
    }
    if (e.pt <= 0) { e.phase = 'leap'; e.pt = PERFO.leap; e.sx = e.x; e.sy = e.y; e.ghost = true; AU.play('perfoHop'); }
  } else if (e.phase === 'leap') {
    const k = clamp(1 - e.pt / PERFO.leap, 0, 1);
    e.x = lerp(e.sx, e.tx, k); e.y = lerp(e.sy, e.ty, k); e.h = Math.sin(k * Math.PI) * 120; e.vx = 0; e.vy = 0;
    mx = 0; my = 0;
    if (e.pt <= 0) { e.x = e.tx; e.y = e.ty; e.h = 0; e.ghost = false; perfoPunch(e); e.phase = 'walk'; e.pt = PERFO.cycle; }
  } else if (e.phase === 'leave') {
    mx *= -2; my *= -2;
    if (e.pt <= 0) { e.dead = true; perfoGone(); }
  }
  MV.x = mx; MV.y = my; MV.agil = e.phase === 'leap' ? 40 : 2;
}
function perfoPunch(e) {
  const ca = Math.cos(e.dir), sa = Math.sin(e.dir);
  for (const s of [-1, 1]) addTrou(e.x + ca * PERFO.gap * s, e.y + sa * PERFO.gap * s, PERFO.life);
  const p = G.p;
  if (Math.hypot(p.x - e.x, p.y - e.y) < PERFO.hurtR) hurtPlayer(1, e.x, e.y);
  e.clac = 1; e.lever = 0; G.perfos = (G.perfos || 0) + 1;
  AU.play('perfoClac'); G.cam.shake = Math.max(G.cam.shake, 7);
  for (let i = 0; i < 10; i++) { const a = rnd(TAU), sp = rnd(80, 220); G.parts.push({ x: e.x, y: e.y + 20, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.4, max: 0.4, size: rnd(2, 4), color: C.pencil, drag: 4 }); }
}
function addTrou(x, y, life) {
  x = clamp(x, 40, WORLD.w - 40); y = clamp(y, 40, WORLD.h - 40);
  if (G.trous.length >= PERFO.max) G.trous.shift();
  const h = { x, y, r: PERFO.holeR, t: 0, life, seed: rnd(TAU) };
  G.trous.push(h);
  // le rond de papier découpé s'envole : un confetti
  G.confettis.push({ x, y, vx: rnd(-140, 140), vy: rnd(-240, -120), life: 1.1, max: 1.1, spin: rnd(TAU), r: PERFO.holeR * 0.92 });
  return h;
}

const canFall = e => !e.dead && !e.ghost && !e.isBoss && !ERRANTES.has(e.type) && !NO_FALL.has(e.type) && !(e.fall > 0) && e.r <= PERFO.fallMax;
function fallEnemy(e, h) {
  e.fall = PERFO.fallT; e.fx = h.x; e.fy = h.y; e.pin = 0;
  AU.play('perfoFall');
  if (!G.perfoFallSeen) { G.perfoFallSeen = true; caption('Une rature est tombée à travers la page !', 2.8, 'green'); }
}
// appelé par la boucle des ennemis : elle glisse au fond du trou, rapetisse… et disparaît (elle compte comme biffée)
function stepFall(e, dt) {
  e.fall -= dt; e.vx = 0; e.vy = 0;
  const k = Math.min(1, dt * 12);
  e.x = lerp(e.x, e.fx, k); e.y = lerp(e.y, e.fy, k);
  if (e.fall <= 0) { G.tombees = (G.tombees || 0) + 1; killEnemy(e); }
}
const trouOpen = h => h.t >= 0.12 && h.life > PERFO.patch;   // à peine percé, ou déjà rebouché : ce n'est pas (encore) un trou
function stepPerfoFx(dt) {
  for (const h of G.trous) {
    h.t += dt; h.life -= dt;
    if (!trouOpen(h)) continue;
    query(h.x, h.y, h.r + 40, tmpA);
    for (const e of tmpA) if (canFall(e) && (e.x - h.x) ** 2 + (e.y - h.y) ** 2 < (h.r * 0.85) ** 2) fallEnemy(e, h);
  }
  G.trous = G.trous.filter(h => h.life > 0);
  for (const c of G.confettis) {
    c.life -= dt; c.spin += dt * 9;
    const k = Math.exp(-dt * 2); c.vx *= k; c.vy = c.vy * k + 320 * dt;
    c.x += c.vx * dt; c.y += c.vy * dt;
  }
  G.confettis = G.confettis.filter(c => c.life > 0);
}
// la goutte s'arrête au bord d'un trou ; un pâté passe par-dessus
function trouPush(p) {
  if (!G.trous.length || p.dashT > 0) return;
  for (const h of G.trous) {
    if (!trouOpen(h)) continue;
    const dx = p.x - h.x, dy = p.y - h.y, d = Math.hypot(dx, dy), m = h.r + 3;
    if (d >= m) continue;
    p.x = h.x + (d > 0.01 ? dx / d : 1) * m; p.y = h.y + (d > 0.01 ? dy / d : 0) * m;
    if (!G.perfoEdgeSeen) { G.perfoEdgeSeen = true; caption('Attention au trou ! Un pâté saute par-dessus.', 2.8, 'hl'); }
  }
}

function perfoDeath(e) {
  query(e.x, e.y, PERFO.deathR, tmpB);
  let n = 0;
  for (const o of tmpB) {
    if (n >= PERFO.deathMax || !canFall(o) || Math.hypot(o.x - e.x, o.y - e.y) > PERFO.deathR) continue;
    if (Math.hypot(o.x - G.p.x, o.y - G.p.y) < 60) continue;   // jamais de trou sous la goutte
    fallEnemy(o, addTrou(o.x, o.y, PERFO.deathLife)); n++;
  }
  for (let i = 0; i < 12; i++) dropLetter(e.x + rnd(-50, 50), e.y + rnd(-50, 50), 3);
  G.score += 500; G.perfoKills = (G.perfoKills || 0) + 1;
  for (let i = 0; i < 30; i++) { const a = rnd(TAU), s = rnd(140, 460); G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.4, 0.9), max: 0.9, size: rnd(2, 4), color: i % 3 ? PERFO_STEEL : PERFO_BODY, drag: 3 }); }
  G.rings.push({ x: e.x, y: e.y, t: 0, dur: 0.6, r: PERFO.deathR, color: PERFO_BODY });
  caption(n ? 'Clac-clac-clac ! ' + n + ' ratures tombent à travers la page.' : 'Clac-clac-clac ! La dernière perforation.', 2.8, 'green');
  AU.play('perfoJam'); G.cam.shake = Math.max(G.cam.shake, 12);
  perfoGone();
}

function perfoTarget() {
  for (const e of G.enemies) {
    if (e.type !== 'perforatrice' || e.ghost) continue;
    const a = Math.atan2(G.p.y - e.y, G.p.x - e.x) - 0.6;
    return { x: e.x + Math.cos(a) * 250, y: e.y + Math.sin(a) * 250 };
  }
  return null;
}
function perfoDanger(x, y) {
  let s = 0;
  for (const e of G.enemies) {
    if (e.type !== 'perforatrice' || (e.phase !== 'warn' && e.phase !== 'leap')) continue;
    s += 1600 / Math.pow(Math.max(6, Math.hypot(x - e.tx, y - e.ty) - PERFO.hurtR * 0.5), 1.4);
  }
  for (const h of G.trous) if (trouOpen(h) && (x - h.x) ** 2 + (y - h.y) ** 2 < (h.r + 16) ** 2) s += 30;   // le pilote ne pousse pas contre un trou
  return s;
}

/* ----- dessin ----- */
function drawPerforatrice(e, fr, fl) {
  const j = (fr - 1) * 0.8, h = e.h || 0;
  if (e.phase === 'leave') ctx.globalAlpha = Math.max(0, e.pt / 1.1);
  const sh = 1 - Math.min(0.6, h / 300);
  ctx.fillStyle = 'rgba(46,46,51,' + (0.14 * sh).toFixed(3) + ')'; ctx.beginPath(); ctx.ellipse(0, 30, 52 * sh, 9 * sh, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(0, -h + j * 0.5 + e.clac * 3); ctx.scale(1.15, 1.15 * (1 - e.clac * 0.12));
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.2;
  // le socle, avec son tiroir à confettis
  ctx.fillStyle = fl ? '#ffd9dc' : '#4a4d57'; roundRect(-46, 10, 92, 15, 5); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e4e0d4'; roundRect(-28, 14, 56, 7, 2); ctx.fill();
  ctx.fillStyle = '#fffdf4'; for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(-22 + i * 8.8, 17.5, 2.2, 0, TAU); ctx.fill(); }
  // les deux poinçons
  ctx.fillStyle = PERFO_STEEL;
  for (const s of [-22, 22]) { roundRect(s - 7, -8, 14, 19, 3); ctx.fill(); ctx.stroke(); }
  // le levier, qui se lève avant de sauter
  ctx.save(); ctx.translate(-44, -8); ctx.rotate(-0.5 * e.lever + 0.05 * e.clac);
  ctx.fillStyle = fl ? '#ffd9dc' : PERFO_BODY; roundRect(-2, -20, 98, 20, 9); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(12, -14); ctx.lineTo(56, -14); ctx.stroke();
  const look = Math.atan2(G.p.y - e.y, G.p.x - e.x) + 0.5 * e.lever;
  for (const s of [60, 78]) {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s, -10, 6.5, 0, TAU); ctx.fill(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + Math.cos(look) * 2.6, -10 + Math.sin(look) * 2.6, 2.8, 0, TAU); ctx.fill();
  }
  if (e.phase === 'warn') { ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(54, -20); ctx.lineTo(67, -16); ctx.moveTo(84, -20); ctx.lineTo(72, -16); ctx.stroke(); }   // les sourcils froncés
  ctx.restore();
  ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(-44, -8, 4, 0, TAU); ctx.fill();   // la charnière
  ctx.restore();
  ctx.globalAlpha = 1;
}
// les trous, sous tout le reste : le bois du pupitre, l'épaisseur du papier, puis la rustine qui rebouche
function drawTrous(inView) {
  for (const h of G.trous) {
    if (!inView(h.x, h.y, h.r + 20)) continue;
    const r = h.r * (h.t < 0.12 ? ease(h.t / 0.12) : 1);
    if (r < 1) continue;
    ctx.save();
    if (h.life < 0.35) ctx.globalAlpha = h.life / 0.35;
    ctx.beginPath(); ctx.arc(h.x, h.y, r, 0, TAU);
    ctx.save(); ctx.clip();
    ctx.fillStyle = '#c4935e'; ctx.fillRect(h.x - r, h.y - r, r * 2, r * 2);
    ctx.strokeStyle = 'rgba(92,55,24,0.22)'; ctx.lineWidth = 1.2;
    for (let k = -3; k <= 3; k++) {   // le veinage suit la page : deux trous voisins montrent la même planche
      const y0 = Math.floor(h.y / 11) * 11 + k * 11;
      ctx.beginPath();
      for (let x = h.x - r; x <= h.x + r + 6; x += 6) { const y = y0 + Math.sin(x * 0.045 + y0 * 0.3) * 2.5; x === h.x - r ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
      ctx.stroke();
    }
    // l'ombre du bord de la feuille, en croissant sur le haut du trou : il est creux, pas bombé
    ctx.fillStyle = 'rgba(55,30,10,0.42)'; ctx.beginPath(); ctx.rect(h.x - r - 2, h.y - r - 2, r * 2 + 4, r * 2 + 4); ctx.arc(h.x + r * 0.12, h.y + r * 0.38, r, 0, TAU, true); ctx.fill('evenodd');
    ctx.restore();
    ctx.beginPath(); ctx.arc(h.x, h.y, r, 0, TAU);
    ctx.strokeStyle = 'rgba(46,46,51,0.55)'; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(h.x, h.y, r + 1.5, 0.25, Math.PI - 0.25); ctx.stroke();   // la tranche du papier, éclairée
    if (h.life < PERFO.patch) {   // une rustine (un œillet autocollant) vient boucher le trou
      const k = ease(clamp((PERFO.patch - h.life) / 0.5, 0, 1));
      ctx.globalAlpha *= k;
      ctx.fillStyle = '#fffdf4'; ctx.beginPath(); ctx.arc(h.x, h.y, h.r + 6, 0, TAU); ctx.fill();
      ctx.strokeStyle = 'rgba(46,46,51,0.25)'; ctx.lineWidth = 1.2; ctx.stroke();
      ctx.beginPath(); ctx.arc(h.x, h.y, h.r * 0.45, 0, TAU); ctx.stroke();
    }
    ctx.restore();
  }
}
function drawPerfoFx() {
  for (const e of G.enemies) {
    if (e.type !== 'perforatrice' || (e.phase !== 'warn' && e.phase !== 'leap')) continue;
    const k = e.phase === 'warn' ? 1 - e.pt / PERFO.warn : 1, ca = Math.cos(e.dir), sa = Math.sin(e.dir);
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.setLineDash([6, 8]);
    ctx.globalAlpha = 0.35 + 0.35 * k + 0.15 * Math.sin(G.time * 30);
    ctx.beginPath(); ctx.arc(e.tx, e.ty, PERFO.hurtR, 0, TAU); ctx.stroke();
    ctx.setLineDash([]); ctx.lineWidth = 2;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(e.tx + ca * PERFO.gap * s, e.ty + sa * PERFO.gap * s, PERFO.holeR * (0.4 + 0.6 * k), 0, TAU); ctx.stroke(); }
    ctx.restore();
  }
  for (const c of G.confettis) {
    ctx.save(); ctx.globalAlpha = Math.min(1, c.life / c.max * 2); ctx.translate(c.x, c.y); ctx.scale(Math.max(0.08, Math.abs(Math.cos(c.spin))), 1);
    ctx.fillStyle = '#fffdf4'; ctx.strokeStyle = 'rgba(46,46,51,0.5)'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.arc(0, 0, c.r, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-c.r * 0.9, -c.r * 0.3); ctx.lineTo(c.r * 0.9, -c.r * 0.3); ctx.moveTo(-c.r * 0.9, c.r * 0.35); ctx.lineTo(c.r * 0.9, c.r * 0.35); ctx.stroke();
    ctx.restore();
  }
}
