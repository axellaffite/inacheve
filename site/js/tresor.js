// La chasse au trésor (chapitre IV) : des pointillés se dessinent devant toi à mesure que tu les suis,
// jusqu'à un X sur une île. Reste sur le X pour creuser : le coffre s'ouvre et les doublons balaient la carte.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const TRESOR = { first: 8, again: 22, reach: 95, dig: 1.6, digR: 48, radius: 520, min: 4, max: 8 };

// Trace un nouveau chemin : un départ près du joueur, des étapes en zigzag, et un X sur une île
function writeTresor() {
  const p = G.p, n = Math.min(TRESOR.max, TRESOR.min + G.tresors);
  let X = null;
  for (let i = 0; i < 40 && !X; i++) {
    const isl = pick(ISLANDS), a = rnd(TAU), rr = isl.r * rnd(0, 0.5);
    const x = clamp(isl.x + Math.cos(a) * rr, 140, WORLD.w - 140), y = clamp(isl.y + Math.sin(a) * rr * 0.8, 140, WORLD.h - 140);
    const dd = Math.hypot(x - p.x, y - p.y);
    if ((dd > 560 + 50 * n && dd < 1500 + 50 * n) || i === 39) X = { x, y };
  }
  const a0 = Math.atan2(X.y - p.y, X.x - p.x), nx = -Math.sin(a0), ny = Math.cos(a0);
  const pts = [{ x: clamp(p.x + Math.cos(a0) * 110, 60, WORLD.w - 60), y: clamp(p.y + Math.sin(a0) * 110, 60, WORLD.h - 60) }];
  for (let i = 1; i < n; i++) {
    const k = i / n, off = (i % 2 ? 1 : -1) * rnd(90, 230);
    pts.push({ x: clamp(lerp(pts[0].x, X.x, k) + nx * off, 80, WORLD.w - 80), y: clamp(lerp(pts[0].y, X.y, k) + ny * off, 80, WORLD.h - 80) });
  }
  pts.push(X);
  G.tresor = { pts, shown: 1, grow: 0, dig: 0, t: 0, digT: 0 };
  AU.play('tresorNew');
  if (!G.tresorSeen) { G.tresorSeen = true; caption('Nouveau : suis les pointillés…', 3.4, 'green'); caption('… et creuse là où est le X !', 3.4, 'green'); }
  else caption('Une nouvelle piste, plus longue', 2.4, 'green');
}

// Là où le joueur doit aller : le bout des pointillés déjà dessinés (ou le X)
function tresorTarget() {
  const T = G.tresor; if (!T) return null;
  return T.pts[T.shown];
}
function tresorDigging() {
  const T = G.tresor; if (!T || T.shown < T.pts.length - 1) return false;
  const X = T.pts[T.shown]; return (G.p.x - X.x) ** 2 + (G.p.y - X.y) ** 2 < TRESOR.digR ** 2;
}

function stepTresor(dt) {
  if (CH().paper !== 'carte') return;
  for (const c of G.chests) c.t += dt;
  G.chests = G.chests.filter(c => c.t < c.dur);
  const T = G.tresor;
  if (!T) { if (G.t >= G.nextTresor) writeTresor(); return; }
  T.t += dt; T.grow = Math.min(1, T.grow + dt * 2.2);
  const p = G.p, last = T.pts.length - 1, tg = T.pts[T.shown];
  if (T.shown < last) {
    if ((p.x - tg.x) ** 2 + (p.y - tg.y) ** 2 < TRESOR.reach ** 2) {   // le chemin continue de s'écrire devant toi
      T.shown++; T.grow = 0; AU.play('trail', T.shown);
      if (T.shown === last) { AU.play('xmark'); addText(T.pts[last].x, T.pts[last].y - 50, 'X !', C.red, 34); }
    }
    return;
  }
  if (tresorDigging()) {   // on creuse
    T.dig += dt; T.digT -= dt;
    if (T.digT <= 0) {
      T.digT = 0.22; AU.play('dig');
      for (let i = 0; i < 5; i++) { const a = rnd(-Math.PI, 0), s = rnd(90, 220); G.parts.push({ x: tg.x, y: tg.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5, max: 0.5, size: rnd(2.5, 4.5), color: i % 2 ? '#c9a464' : '#8a5a2b', drag: 3 }); }
    }
    if (T.dig >= TRESOR.dig) openTresor(T);
  } else T.dig = Math.max(0, T.dig - dt * 0.5);
}

// Le coffre s'ouvre : des doublons partent en cercle et frappent tout ce qu'ils touchent
function openTresor(T) {
  const p = G.p, X = T.pts[T.pts.length - 1], n = T.pts.length - 1;
  G.tresors++; G.tresor = null; G.nextTresor = G.t + TRESOR.again;
  G.score += 150 * n; G.xp += 5 + n * 2; p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('tresor');
  caption(pick(['Un trésor !', 'X marquait l’endroit !', 'Des doublons plein le coffre !']), 2.4, 'green');
  G.cam.shake = Math.max(G.cam.shake, 12);
  G.chests.push({ x: X.x, y: X.y, t: 0, dur: 2.6 });
  for (let i = 0; i < 3; i++) G.coins.push({ x: X.x, y: X.y, t: -i * 0.15, dur: 0.95, r: TRESOR.radius });
  query(X.x, X.y, TRESOR.radius + 60, tmpA);
  for (const e of tmpA) {
    const dx = e.x - X.x, dy = e.y - X.y, d = Math.hypot(dx, dy) || 1;
    if (e.dead || d > TRESOR.radius + e.r) continue;
    hurtEnemy(e, (e.isBoss ? 80 : 20 + 3 * n) * G.S.dmg, 'tresor');
    if (!e.isBoss) { e.vx += dx / d * 420; e.vy += dy / d * 420; }
  }
  for (const b of G.ebul) if ((b.x - X.x) ** 2 + (b.y - X.y) ** 2 < TRESOR.radius ** 2) b.life = 0;
  G.drops = G.drops.filter(dr => (dr.x - X.x) ** 2 + (dr.y - X.y) ** 2 > TRESOR.radius ** 2);
  // et des lettrines dorées, à ramasser
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; G.items.push({ x: X.x, y: X.y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, ch: pick(LETTER_POOL), value: 7, rare: true, need: false, t: rnd(TAU), pull: false, rot: rnd(-0.4, 0.4) }); }
  for (let i = 0; i < 36; i++) { const a = rnd(TAU), s = rnd(160, 560); G.parts.push({ x: X.x, y: X.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.9, max: 0.9, size: rnd(3, 6), color: i % 3 ? C.gold : '#f2d36b', drag: 3 }); }
}

/* ===================== Dessin ===================== */
const TRAIL = '#8a5a2b';
function drawTresor(v) {
  // les coffres ouverts, et l'onde de doublons
  for (const c of G.chests) {
    const k = c.t / c.dur, up = ease(c.t * 3), a = Math.min(1, (c.dur - c.t) * 2);
    ctx.save(); ctx.translate(c.x, c.y - 10 * up); ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(70,40,15,0.35)'; ctx.beginPath(); ctx.ellipse(0, 26, 46, 12, 0, 0, TAU); ctx.fill();   // le trou
    ctx.fillStyle = '#9a6332'; ctx.strokeStyle = '#4e2e12'; ctx.lineWidth = 3;
    ctx.fillRect(-34, -6, 68, 32); ctx.strokeRect(-34, -6, 68, 32);
    ctx.fillStyle = 'rgba(255,220,110,' + (0.6 + 0.4 * Math.sin(G.time * 10)) + ')'; ctx.fillRect(-30, -10, 60, 6);   // la lueur de l'or
    ctx.save(); ctx.translate(0, -6); ctx.rotate(-1.1 * up);   // le couvercle s'ouvre
    ctx.fillStyle = '#a86e3a'; ctx.beginPath(); ctx.moveTo(-34, 0); ctx.lineTo(-34, -14); ctx.quadraticCurveTo(0, -30, 34, -14); ctx.lineTo(34, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = C.gold; ctx.fillRect(-36, 4, 72, 5); ctx.fillRect(-4, -4, 8, 14);
    ctx.restore();
    if (k < 0.6) txt('trésor !', c.x, c.y - 70 - k * 40, 34, { color: C.gold, alpha: 1 - k / 0.6, hl: C.hl });
  }
  for (const s of G.coins) {
    if (s.t < 0) continue;
    const k = Math.min(1, s.t / s.dur), rr = s.r * ease(k);
    ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = C.gold; ctx.lineWidth = 7 * (1 - k) + 2;
    ctx.beginPath(); ctx.arc(s.x, s.y, rr, 0, TAU); ctx.stroke();
    for (let i = 0; i < 14; i++) {
      const a = i / 14 * TAU - k, x = s.x + Math.cos(a) * rr, y = s.y + Math.sin(a) * rr;
      ctx.fillStyle = '#f2d36b'; ctx.beginPath(); ctx.ellipse(x, y, 9 * Math.abs(Math.cos(G.time * 8 + i)) + 2, 9, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.stroke();
    }
    ctx.restore();
  }
  const T = G.tresor; if (!T) return;
  const k0 = Math.min(1, T.t * 2), last = T.pts.length - 1;
  // les pointillés déjà écrits (le dernier se dessine)
  ctx.save(); ctx.globalAlpha = k0; ctx.strokeStyle = TRAIL; ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.setLineDash([14, 12]);
  ctx.beginPath(); ctx.moveTo(T.pts[0].x, T.pts[0].y);
  for (let i = 1; i <= T.shown; i++) {
    const a = T.pts[i - 1], b = T.pts[i], g = i === T.shown ? ease(T.grow) : 1;
    ctx.lineTo(lerp(a.x, b.x, g), lerp(a.y, b.y, g));
  }
  ctx.stroke(); ctx.restore();
  // de petits pas le long du chemin parcouru
  for (let i = 1; i < T.shown; i++) { const q = T.pts[i]; txt('·', q.x, q.y, 40, { color: TRAIL, alpha: k0 }); }
  const tg = T.pts[T.shown], grown = T.grow >= 1;
  if (T.shown < last) {
    if (grown) {   // le bout du chemin : un rond doré qui t'attend
      ctx.save(); ctx.globalAlpha = k0 * 0.85; ctx.fillStyle = C.hl; ctx.beginPath(); ctx.arc(tg.x, tg.y, 22 + 2 * Math.sin(G.time * 6), 0, TAU); ctx.fill();
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      txt('?', tg.x, tg.y, 30, { color: TRAIL, alpha: k0 });
    }
    return;
  }
  // le X, et la jauge de fouille
  const g = ease(T.grow), X = tg;
  ctx.save(); ctx.translate(X.x, X.y);
  ctx.fillStyle = C.hl; ctx.globalAlpha = 0.5 + 0.3 * Math.sin(G.time * 5); ctx.beginPath(); ctx.arc(0, 0, TRESOR.digR, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  ctx.strokeStyle = C.red; ctx.lineWidth = 9; ctx.lineCap = 'round';
  const L = 26 * g; ctx.beginPath(); ctx.moveTo(-L, -L); ctx.lineTo(L, L); ctx.moveTo(L, -L); ctx.lineTo(-L, L); ctx.stroke();
  if (T.dig > 0) {
    ctx.fillStyle = 'rgba(90,55,20,' + (0.2 + 0.4 * T.dig / TRESOR.dig) + ')'; ctx.beginPath(); ctx.ellipse(0, 0, 34 * T.dig / TRESOR.dig, 22 * T.dig / TRESOR.dig, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(0, 0, TRESOR.digR + 6, -Math.PI / 2, -Math.PI / 2 + TAU * T.dig / TRESOR.dig); ctx.stroke();
  }
  ctx.restore();
  txt(T.dig > 0 ? 'creuse…' : 'creuse ici !', X.x, X.y + 72, 28, { color: C.gold, alpha: g, hl: C.hl });
}
function drawTresorArrow() {
  const T = G.tresor; if (!T || G.state !== 'play') return;
  const tg = tresorTarget(); if (tg) edgeArrow(tg.x, tg.y);
}
