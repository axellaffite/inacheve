'use strict';
// Le cerf-volant (itération 35) : sur toutes les pages, un cerf-volant découpé dans la page elle-même attend par terre,
// avec sa bobine. Ramasse-le, puis cours : tant que tu bouges, il monte ; si tu t'arrêtes, il pique du nez. Sa queue
// à nœuds de surligneur fauche les ratures derrière toi. Assez de ciel, et il touche les nuages : un grand looping
// autour de toi balaie la page, puis il s'envole pour de bon.

const CERF = { first: 55, again: 60, wait: 45, d0: 380, d1: 620, take: 42,
  climb: 0.5, sink: 0.32, lift: 0.1, run: 150, hitDrop: 0.35, l0: 90, l1: 250, need: 14, turn: 9,
  dmg: 7, bossDmg: 16, tailDmg: 3, hitCd: 0.35, segs: 13, seg: 16, body: 22,
  loop: 2.6, loopR: 300, loopTurns: 1.6, loopHit: 74, loopDmg: 40, loopBoss: 120, away: 2.4 };
const CERF_NOEUDS = ['rgba(246,231,94,0.95)', 'rgba(255,140,190,0.92)', 'rgba(140,230,140,0.92)'];
VOISIN_SAYS.cerf = ['Plus haut ! Plus haut !', 'Cours, cours, il retombe !', 'Je peux tenir la bobine ?', 'Il touche les nuages !'];

function startCerf(sky, near) {
  const p = G.p, d0 = near || CERF.d0;
  let x = p.x, y = p.y;
  for (let i = 0; i < 30; i++) {
    const a = rnd(TAU), d = near || rnd(CERF.d0, CERF.d1);
    x = clamp(p.x + Math.cos(a) * d, 140, WORLD.w - 140); y = clamp(p.y + Math.sin(a) * d, 140, WORLD.h - 140);
    if (Math.hypot(x - p.x, y - p.y) > d0 * 0.75) break;
  }
  G.cerfN = (G.cerfN || 0) + 1;
  G.cerf = { phase: 'pose', x, y, vx: 0, vy: 0, alt: 0, sky: clamp(sky || 0, 0, 0.95) * CERF.need, t: 0, wait: 0, hp: p.hp,
    dirX: 1, dirY: 0, wa: rnd(TAU), turnT: CERF.turn, rot: rnd(-0.5, 0.5), loopT: 0, loopA: 0, loopR: 0, n: G.cerfN, endT: 0, flapT: 0, high: false, tail: [] };
  cerfTailLie(G.cerf);
  AU.play('cerfNew');
  if (!G.cerfSeen) { G.cerfSeen = true; caption('Un cerf-volant est tombé sur la page !', 3, 'hl'); caption('Ramasse-le, puis cours face au vent : il monte !', 3.6, 'hl'); }
  else caption('Un nouveau cerf-volant attend sa bobine !', 2.4, 'hl');
}
// par terre : la queue est couchée en S à côté du cerf-volant
function cerfTailLie(K) {
  K.tail = [];
  for (let i = 0; i < CERF.segs; i++) {
    const a = K.rot + Math.PI / 2 + Math.sin(i * 0.7) * 0.5, d = 20 + i * CERF.seg;
    const x = K.x + Math.cos(a) * d, y = K.y + Math.sin(a) * d;
    K.tail.push({ x, y, px: x, py: y });
  }
}

function stepCerf(dt) {
  const K = G.cerf;
  if (!K) {
    if (G.t >= G.nextCerf && G.state === 'play') { if (G.boss || (G.colo && !G.colo.end)) G.nextCerf = G.t + 6; else startCerf(); }
    return;
  }
  K.t += dt;
  const p = G.p;
  if (K.phase === 'pose') {
    K.wait += dt;
    if ((p.x - K.x) ** 2 + (p.y - K.y) ** 2 < (p.r + CERF.take) ** 2) cerfTake(K);
    else if (K.wait > CERF.wait) { cerfAway(K); caption('Le vent emporte le cerf-volant…', 2.4, 'pink'); }
    return;
  }
  if (K.phase === 'end') {
    K.endT += dt; K.x += 70 * dt; K.y -= 170 * dt; K.alt = Math.min(1.6, K.alt + dt * 0.5);
    cerfTail(K, dt, 0.6, -1);
    if (K.endT >= CERF.away) G.cerf = null;
    return;
  }
  if (K.phase === 'loop') { stepCerfLoop(K, dt); return; }
  // en vol : il monte quand on court face au vent, il redescend quand on s'arrête (ou qu'on court avec le vent)
  stepCerfVent(K, dt);
  const sp = Math.hypot(p.vx, p.vy), run = p.dashT > 0 || sp > CERF.run, wx = Math.cos(K.wa), wy = Math.sin(K.wa);
  if (sp > 30) { const k = 1 - Math.exp(-dt * 3); K.dirX = lerp(K.dirX, p.vx / sp, k); K.dirY = lerp(K.dirY, p.vy / sp, k); }
  const f = sp > 1 ? -(p.vx * wx + p.vy * wy) / sp : 0;   // 1 : face au vent, -1 : vent dans le dos
  K.face = lerp(K.face || 0, run ? f : 0, 1 - Math.exp(-dt * 6));
  const climb = !run ? -CERF.sink : f >= 0 ? CERF.climb * Math.min(1.4, sp / 235) * f + CERF.lift : CERF.sink * 0.8 * f + CERF.lift * 0.5;
  K.alt = clamp(K.alt + climb * dt, 0, 1);
  if (p.hp < K.hp) { K.alt = Math.max(0, K.alt - CERF.hitDrop); addText(K.x, K.y - 46, 'le fil se détend !', C.red, 22); AU.play('cerfDown'); }
  K.hp = p.hp;
  if (K.alt > 0.8 && !K.high) { K.high = true; addText(K.x, K.y - 50, 'tout là-haut !', C.ink, 24); AU.play('cerfUp'); }
  else if (K.alt < 0.6) K.high = false;
  if (K.alt <= 0) { cerfFall(K); return; }
  K.sky = Math.min(CERF.need, K.sky + dt * K.alt);
  // il vole sous le vent de la goutte, au bout du fil, et se balance de part et d'autre (sa queue balaie)
  const L = CERF.l0 + (CERF.l1 - CERF.l0) * K.alt, sw = Math.sin(K.t * 1.7) * L * 0.5 * K.alt;
  const tx = p.x + wx * L - wy * sw, ty = p.y + wy * L + wx * sw;
  const ox = K.x, oy = K.y, k = 1 - Math.exp(-dt * 4);
  K.x = lerp(K.x, tx, k); K.y = lerp(K.y, ty, k);
  const fx = K.x - p.x, fy = K.y - p.y, fd = Math.hypot(fx, fy) || 1, Lmax = L * 1.15;
  if (fd > Lmax) { K.x = p.x + fx / fd * Lmax; K.y = p.y + fy / fd * Lmax; }   // le fil est tendu
  K.vx = (K.x - ox) / Math.max(dt, 1e-4); K.vy = (K.y - oy) / Math.max(dt, 1e-4);
  cerfTail(K, dt, 1, 1);
  cerfHits(K);
  K.flapT -= dt;
  if (run && K.flapT <= 0) { K.flapT = 0.55; AU.play('cerfFlap'); }
  if (K.sky >= CERF.need) cerfWin(K);
}
// le vent tourne de temps en temps (au devoir du jour, c'est le courant d'air qui décide)
function stepCerfVent(K, dt) {
  if (G.wind) { K.wa = G.wind.a; return; }
  K.turnT -= dt;
  if (K.turnT <= 0) {
    K.turnT = CERF.turn; K.wa += rnd(1.2, 2.4) * (rand() < 0.5 ? -1 : 1);
    caption('Le vent tourne : cours face au vent !', 1.8, 'pink'); AU.play('cerfFlap');
  }
}
function cerfTake(K) {
  const p = G.p, d = Math.hypot(p.vx, p.vy);
  Object.assign(K, { phase: 'vol', alt: 0.22, hp: p.hp, turnT: CERF.turn, face: 0, dirX: d > 30 ? p.vx / d : Math.cos(p.face), dirY: d > 30 ? p.vy / d : Math.sin(p.face), high: false });
  AU.play('cerfUp');
  if (!G.cerfRunSeen) { G.cerfRunSeen = true; caption('La flèche te montre où courir. Si tu t’arrêtes, il pique du nez !', 3.4, 'green'); }
}
function cerfFall(K) {
  Object.assign(K, { phase: 'pose', wait: 0, alt: 0, rot: rnd(-0.6, 0.6) });
  cerfTailLie(K);
  AU.play('cerfDown'); G.cam.shake = Math.max(G.cam.shake, 2);
  addText(K.x, K.y - 40, 'plouf !', C.pencil, 24);
  caption('Il pique du nez ! Ramasse-le et cours encore.', 2.6, 'pink');
}
function cerfAway(K) { K.phase = 'end'; K.endT = 0; G.nextCerf = G.t + CERF.again; }
// la queue : une chaîne de nœuds qui flotte au vent, derrière le cerf-volant
function cerfTail(K, dt, wind, up) {
  const wx = K.phase === 'loop' ? -K.dirX : Math.cos(K.wa), wy = K.phase === 'loop' ? -K.dirY : Math.sin(K.wa);
  const T = K.tail, ax = wx * 300 * wind, ay = wy * 300 * wind + (up < 0 ? 200 : 0);
  T[0].x = K.x; T[0].y = K.y + CERF.body * 0.9;
  for (let i = 1; i < T.length; i++) {
    const n = T[i], vx = (n.x - n.px) * 0.9, vy = (n.y - n.py) * 0.9;
    n.px = n.x; n.py = n.y;
    n.x += vx + ax * dt * dt + Math.sin(K.t * 6 + i * 0.8) * 0.7;
    n.y += vy + ay * dt * dt + Math.cos(K.t * 5 + i * 0.9) * 0.7;
  }
  for (let it = 0; it < 4; it++) for (let i = 1; i < T.length; i++) {
    const a = T[i - 1], b = T[i], dx = b.x - a.x, dy = b.y - a.y, dd = Math.hypot(dx, dy) || 1, f = (dd - CERF.seg) / dd;
    if (i === 1) { b.x -= dx * f; b.y -= dy * f; }
    else { a.x += dx * f * 0.5; a.y += dy * f * 0.5; b.x -= dx * f * 0.5; b.y -= dy * f * 0.5; }
  }
  for (let i = 1; i < T.length; i++) {   // et elle ne s'étire jamais (même pendant le looping, qui va très vite)
    const a = T[i - 1], b = T[i], dx = b.x - a.x, dy = b.y - a.y, dd = Math.hypot(dx, dy) || 1, mx = CERF.seg * 1.15;
    if (dd > mx) { b.x = a.x + dx / dd * mx; b.y = a.y + dy / dd * mx; }
  }
}
// le cerf-volant et sa queue fauchent les ratures qu'ils touchent
function cerfHits(K) {
  const R = CERF.body + 16 * K.alt;
  query(K.x, K.y, R + 200, tmpA);
  for (const e of tmpA) {
    if (e.dead || e.ghost || (e.cerfCd || 0) > G.t) continue;
    let hit = (e.x - K.x) ** 2 + (e.y - K.y) ** 2 < (R + e.r) ** 2, dmg = e.isBoss ? CERF.bossDmg : CERF.dmg * (0.5 + K.alt);
    if (!hit) for (let i = 2; i < K.tail.length; i += 2) { const n = K.tail[i]; if ((e.x - n.x) ** 2 + (e.y - n.y) ** 2 < (12 + e.r) ** 2) { hit = true; dmg = CERF.tailDmg * (e.isBoss ? 2 : 1); break; } }
    if (!hit) continue;
    e.cerfCd = G.t + CERF.hitCd;
    const d = Math.hypot(e.x - K.x, e.y - K.y) || 1;
    hurtEnemy(e, dmg * G.S.dmg, 'cerf', (e.x - K.x) / d, (e.y - K.y) / d);
    if (e.dead) G.cerfKills = (G.cerfKills || 0) + 1;
    else if (!e.isBoss) { e.vx += K.vx * 0.35; e.vy += K.vy * 0.35; }
  }
}
function cerfWin(K) {
  const p = G.p;
  K.phase = 'loop'; K.loopT = 0; K.loopA = Math.atan2(K.y - p.y, K.x - p.x); K.loopR = Math.hypot(K.x - p.x, K.y - p.y); K.alt = 1;
  G.cerfs = (G.cerfs || 0) + 1;
  G.score += 600; G.xp += 16; p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('cerfWin'); G.cam.shake = Math.max(G.cam.shake, 7);
  caption('Il touche les nuages ! Grand looping… et un cœur !', 2.8, 'hl');
  voisinSay('cerf');
}
function stepCerfLoop(K, dt) {
  const p = G.p;
  K.loopT += dt;
  const q = K.loopT / CERF.loop, R = lerp(K.loopR, CERF.loopR, ease(Math.min(1, q * 2.5)));
  K.loopA += dt * CERF.loopTurns * TAU / CERF.loop;
  const ox = K.x, oy = K.y;
  K.x = p.x + Math.cos(K.loopA) * R; K.y = p.y + Math.sin(K.loopA) * R;
  K.vx = (K.x - ox) / Math.max(dt, 1e-4); K.vy = (K.y - oy) / Math.max(dt, 1e-4);
  const sp = Math.hypot(K.vx, K.vy) || 1; K.dirX = K.vx / sp; K.dirY = K.vy / sp;
  cerfTail(K, dt, 1.4, 1);
  if (rand() < dt * 30) { const c = CERF_NOEUDS[(rand() * 3) | 0]; G.parts.push({ x: K.x + rnd(-14, 14), y: K.y + rnd(-14, 14), vx: -K.vx * 0.1, vy: -K.vy * 0.1, life: 0.7, max: 0.7, size: rnd(3, 6), color: c, drag: 2 }); }
  query(K.x, K.y, CERF.loopHit + 140, tmpA);
  for (const e of tmpA) {
    if (e.dead || e.ghost || e.cerfLoop === K.n || (e.x - K.x) ** 2 + (e.y - K.y) ** 2 > (CERF.loopHit + e.r) ** 2) continue;
    e.cerfLoop = K.n;
    hurtEnemy(e, (e.isBoss ? CERF.loopBoss : CERF.loopDmg) * G.S.dmg, 'cerf');
    if (e.dead) G.cerfKills = (G.cerfKills || 0) + 1;
    else if (!e.isBoss) { const d = Math.hypot(e.x - p.x, e.y - p.y) || 1; e.vx += (e.x - p.x) / d * 420; e.vy += (e.y - p.y) / d * 420; }
  }
  for (const b of G.ebul) if ((b.x - K.x) ** 2 + (b.y - K.y) ** 2 < CERF.loopHit ** 2) b.life = 0;   // il balaie aussi les coups
  if (q >= 1) { cerfAway(K); addText(p.x, p.y - 60, 'au revoir, cerf-volant !', C.ink, 26); }
}

function cerfTarget() {
  const K = G.cerf; if (!K) return null;
  if (K.phase === 'pose') return K;
  if (K.phase !== 'vol' || K.alt > 0.85) return null;   // en vol, le pilote court face au vent (et longe le bord quand il le faut)
  const p = G.p, m = 260; let ux = -Math.cos(K.wa), uy = -Math.sin(K.wa);
  if ((p.x < m && ux < 0) || (p.x > WORLD.w - m && ux > 0)) ux = 0;
  if ((p.y < m && uy < 0) || (p.y > WORLD.h - m && uy > 0)) uy = 0;
  if (Math.hypot(ux, uy) < 0.3) { ux = WORLD.w / 2 - p.x; uy = WORLD.h / 2 - p.y; }
  const d = Math.hypot(ux, uy) || 1;
  K.run = K.run || { x: 0, y: 0 }; K.run.x = p.x + ux / d * 360; K.run.y = p.y + uy / d * 360;
  return K.run;
}

/* ----- dessin ----- */
// le papier du cerf-volant : un morceau de la page où l'on joue, avec la couleur de son onglet au bureau
function cerfPaper(s) {
  const kind = CH().paper, tab = (typeof TAB_COLORS !== 'undefined' && TAB_COLORS[G.chapter]) || '#f6e75e';
  ctx.fillStyle = '#fdfcf6'; ctx.fill();
  ctx.save(); ctx.clip();
  ctx.globalAlpha = 0.45; ctx.fillStyle = tab; ctx.fillRect(-s, -s * 1.4, s * 2, s * 2.8); ctx.globalAlpha = 1;
  ctx.lineWidth = 1.2;
  if (kind === 'portee') {   // cinq lignes de portée
    ctx.strokeStyle = 'rgba(46,46,51,0.5)'; ctx.beginPath(); for (let i = -2; i <= 2; i++) { ctx.moveTo(-s, i * s * 0.18); ctx.lineTo(s, i * s * 0.18); } ctx.stroke();
  } else if (kind === 'milli' || kind === 'tables') {   // un quadrillage fin
    ctx.strokeStyle = 'rgba(232,140,60,0.45)'; ctx.beginPath(); for (let i = -6; i <= 6; i++) { ctx.moveTo(i * s * 0.17, -s * 1.4); ctx.lineTo(i * s * 0.17, s * 1.4); ctx.moveTo(-s, i * s * 0.22); ctx.lineTo(s, i * s * 0.22); } ctx.stroke();
  } else if (kind === 'carte') {   // un bout de carte : pointillés et un X
    ctx.strokeStyle = 'rgba(140,90,40,0.6)'; ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(-s * 0.6, s * 0.6); ctx.quadraticCurveTo(0, -s * 0.2, s * 0.3, -s * 0.5); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(s * 0.2, -s * 0.62); ctx.lineTo(s * 0.4, -s * 0.42); ctx.moveTo(s * 0.4, -s * 0.62); ctx.lineTo(s * 0.2, -s * 0.42); ctx.stroke();
  } else if (kind === 'neige' || kind === 'camp') {   // des flocons, ou des étoiles
    ctx.strokeStyle = kind === 'neige' ? 'rgba(59,111,163,0.6)' : 'rgba(201,146,27,0.7)';
    for (const [fx, fy] of [[-0.35, -0.5], [0.3, 0.1], [-0.2, 0.7]]) { ctx.beginPath(); for (let k = 0; k < 3; k++) { const a = k * Math.PI / 3; ctx.moveTo(fx * s - Math.cos(a) * 7, fy * s - Math.sin(a) * 7); ctx.lineTo(fx * s + Math.cos(a) * 7, fy * s + Math.sin(a) * 7); } ctx.stroke(); }
  } else {   // le cahier à grands carreaux, et sa marge rouge
    ctx.strokeStyle = C.rule; ctx.beginPath(); for (let i = -5; i <= 5; i++) { ctx.moveTo(-s, i * s * 0.26); ctx.lineTo(s, i * s * 0.26); } ctx.stroke();
    ctx.strokeStyle = C.margin; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-s * 0.55, -s * 1.4); ctx.lineTo(-s * 0.55, s * 1.4); ctx.stroke();
  }
  ctx.restore();
}
function cerfShape(s) { ctx.beginPath(); ctx.moveTo(0, -s * 1.3); ctx.lineTo(s * 0.85, -s * 0.15); ctx.lineTo(0, s * 1.05); ctx.lineTo(-s * 0.85, -s * 0.15); ctx.closePath(); }
function drawCerfKite(x, y, s, tilt, face) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(tilt);
  cerfShape(s); cerfPaper(s);
  cerfShape(s); ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.2; ctx.lineJoin = 'round'; ctx.stroke();
  ctx.strokeStyle = '#a0662f'; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(0, -s * 1.3); ctx.lineTo(0, s * 1.05); ctx.moveTo(-s * 0.85, -s * 0.15); ctx.lineTo(s * 0.85, -s * 0.15); ctx.stroke();   // les baguettes
  if (face) {   // un visage, au feutre
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(-s * 0.25, -s * 0.35, 2.6, 0, TAU); ctx.arc(s * 0.25, -s * 0.35, 2.6, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, -s * 0.12, s * 0.2, 0.2, Math.PI - 0.2); ctx.stroke();
  }
  ctx.restore();
}
function drawCerfTail(K) {
  const T = K.tail;
  ctx.save(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); T.forEach((n, i) => i ? ctx.lineTo(n.x, n.y) : ctx.moveTo(n.x, n.y)); ctx.stroke();
  for (let i = 2; i < T.length; i += 2) {   // les nœuds, en papier de surligneur
    const n = T[i], m = T[i - 1], a = Math.atan2(n.y - m.y, n.x - m.x) + Math.PI / 2;
    ctx.save(); ctx.translate(n.x, n.y); ctx.rotate(a); ctx.fillStyle = CERF_NOEUDS[(i / 2) % 3];
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-14, -8); ctx.lineTo(-14, 8); ctx.closePath(); ctx.moveTo(0, 0); ctx.lineTo(14, -8); ctx.lineTo(14, 8); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(46,46,51,0.55)'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
  }
  ctx.restore();
}
function drawCerf() {
  const K = G.cerf; if (!K) return;
  const p = G.p, v = viewRect(), m = 420;
  if (K.x < v.x0 - m || K.x > v.x1 + m || K.y < v.y0 - m || K.y > v.y1 + m) return;
  const fade = K.phase === 'end' ? clamp(1 - K.endT / CERF.away, 0, 1) : K.phase === 'pose' && K.wait > CERF.wait - 5 ? 0.5 + 0.5 * Math.abs(Math.sin(K.t * 6)) : 1;
  ctx.save(); ctx.globalAlpha = fade;
  if (K.phase === 'pose') {
    // par terre : le cerf-volant couché, sa queue en S et la bobine
    ctx.fillStyle = 'rgba(46,46,51,0.12)'; ctx.beginPath(); ctx.ellipse(K.x + 4, K.y + 8, 30, 12, K.rot, 0, TAU); ctx.fill();
    drawCerfTail(K);
    drawCerfKite(K.x, K.y, 30, K.rot, true);
    const bx = K.x + Math.cos(K.rot) * 56, by = K.y + Math.sin(K.rot) * 56;
    ctx.fillStyle = '#c99a64'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(bx, by, 12, 8, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#fffdf4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(bx, by, 6, 4, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo((bx + K.x) / 2, by + 16, K.x, K.y); ctx.stroke();
    ctx.strokeStyle = C.gold; ctx.globalAlpha = fade * (0.4 + 0.3 * Math.sin(G.time * 5)); ctx.lineWidth = 3; ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.arc(K.x, K.y, 60, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.restore();
    if (K.sky > 0) drawCerfSky(K, K.x, K.y - 74, fade);
    return;
  }
  const s = 32 + 26 * Math.min(1, K.alt), lift = 12 + 46 * Math.min(1.2, K.alt);
  // l'ombre sur la page, le fil depuis la goutte, la queue, puis le cerf-volant en l'air
  ctx.fillStyle = 'rgba(46,46,51,' + (0.16 - 0.08 * Math.min(1, K.alt)) + ')';
  ctx.beginPath(); ctx.ellipse(K.x + lift * 0.5, K.y + lift, s * 0.7, s * 0.35, 0, 0, TAU); ctx.fill();
  if (K.phase !== 'end') {
    ctx.strokeStyle = 'rgba(46,46,51,0.7)'; ctx.lineWidth = 1.4;
    const mx = (p.x + K.x) / 2, my = (p.y + K.y) / 2 + 30 * (1 - Math.min(1, K.alt));   // le fil qui pend un peu quand il est bas
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.quadraticCurveTo(mx, my, K.x, K.y + s * 0.2); ctx.stroke();
  }
  if (K.phase === 'loop') {   // le looping laisse un grand trait de surligneur autour de la goutte
    const R = Math.hypot(K.x - p.x, K.y - p.y), k = clamp((CERF.loop - K.loopT) * 2, 0, 1);
    ctx.save(); ctx.lineCap = 'round'; ctx.strokeStyle = C.hl; ctx.globalAlpha = 0.55 * k; ctx.lineWidth = 34;
    ctx.beginPath(); ctx.arc(p.x, p.y, R, K.loopA - Math.min(2.2, K.loopT * 3), K.loopA); ctx.stroke();
    ctx.strokeStyle = C.hlPink; ctx.globalAlpha = 0.4 * k; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.arc(p.x, p.y, R - 22, K.loopA - Math.min(1.6, K.loopT * 2.4), K.loopA - 0.1); ctx.stroke();
    ctx.restore();
  }
  drawCerfTail(K);
  const tilt = clamp(K.vx / 600, -0.6, 0.6) + Math.sin(K.t * 3.1) * 0.12 * K.alt;
  drawCerfKite(K.x, K.y, s, tilt, true);
  ctx.restore();
  if (K.phase === 'vol') { drawCerfSky(K, K.x, K.y - s * 1.3 - 26, fade); drawCerfVent(K, p.x, p.y - 64, 0.9); }
  else if (K.phase === 'loop') txt('youpi !', K.x, K.y - s * 1.3 - 22, 26, { color: C.red, font: FONT_CURSIVE, weight: 400 });
}
// la jauge du ciel : un arc de nuages au-dessus du cerf-volant
function drawCerfSky(K, x, y, a) {
  const q = K.sky / CERF.need;
  ctx.save(); ctx.globalAlpha = a; ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(109,109,116,0.35)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(x, y + 30, 34, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
  ctx.strokeStyle = '#7fb3e0'; ctx.beginPath(); ctx.arc(x, y + 30, 34, Math.PI * 1.1, Math.PI * (1.1 + 0.8 * q)); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgba(59,111,163,0.7)'; ctx.lineWidth = 1.5;   // le petit nuage au bout
  const cx = x + Math.cos(Math.PI * 1.9) * 34 + 8, cy = y + 30 + Math.sin(Math.PI * 1.9) * 34 - 4;
  ctx.beginPath(); ctx.arc(cx - 6, cy, 6, 0, TAU); ctx.arc(cx + 2, cy - 4, 7, 0, TAU); ctx.arc(cx + 9, cy, 5, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.restore();
}
// la manche à air : une flèche qui montre où courir (face au vent), verte quand on y court
function drawCerfVent(K, x, y, a) {
  const ux = -Math.cos(K.wa), uy = -Math.sin(K.wa), good = (K.face || 0) > 0.5;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(Math.atan2(uy, ux));
  ctx.fillStyle = good ? 'rgba(140,230,140,0.95)' : 'rgba(255,255,255,0.9)'; ctx.strokeStyle = good ? '#2f7a3a' : C.graphite; ctx.lineWidth = 2; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(30, 0); ctx.lineTo(10, -14); ctx.lineTo(10, -6); ctx.lineTo(-22, -6); ctx.lineTo(-22, 6); ctx.lineTo(10, 6); ctx.lineTo(10, 14); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  txt(good ? 'face au vent !' : 'cours par ici', x, y - 26, 19, { color: good ? '#2f7a3a' : C.pencil, alpha: a, weight: 400 });
}
// le vent, à l'écran : des traits qui filent (sauf au devoir « courant d'air », qui a déjà les siens)
function drawCerfWind() {
  const K = G.cerf;
  if (!K || K.phase !== 'vol' || !G.p || G.wind || !['play', 'levelup', 'pause'].includes(G.state)) return;
  const ux = Math.cos(K.wa), uy = Math.sin(K.wa), PW = W + 240, PH = H + 240;
  ctx.save(); ctx.strokeStyle = '#7fb3e0'; ctx.lineCap = 'round'; ctx.lineWidth = 2 * U;
  for (let i = 0; i < 18; i++) {
    const h1 = (i * 0.618034) % 1, h2 = (i * 0.414214 + 0.3) % 1, run = G.time * 260 * ZOOM * (0.8 + 0.4 * h2);
    const x = (((h1 * PW + ux * run) % PW) + PW) % PW - 120, y = (((h2 * PH + uy * run) % PH) + PH) % PH - 120;
    const len = (40 + 60 * h2) * U, curl = 8 * U * Math.sin(G.time * 3 + i);
    ctx.globalAlpha = 0.3 + 0.15 * Math.sin(G.time * 2 + i * 1.7);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x - ux * len * 0.5 - uy * curl, y - uy * len * 0.5 + ux * curl, x - ux * len, y - uy * len); ctx.stroke();
  }
  ctx.restore();
}
function drawCerfArrow() {
  if (G.state !== 'play') return;
  const K = G.cerf; if (K && K.phase === 'pose') edgeArrow(K.x, K.y);
}
