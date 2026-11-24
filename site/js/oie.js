'use strict';

// Le jeu de l'oie (itération 31) : sur toutes les pages, un petit jeu de l'oie s'imprime près de la goutte, en spirale, avec
// son gros dé posé à côté. On fonce dans le dé : il roule à travers les ratures (et les bouscule), puis s'arrête sur un
// nombre, et le pion avance d'autant de cases. Cases de l'oie (on rejoue le même nombre), pont, labyrinthe… Au bout de la
// spirale, l'oie s'envole : une grande oie de papier traverse la page en fauchant les ratures sur son passage.
const OIE = { first: 40, again: 55, len: 90, d0: 440, d1: 720, deD: 230, deR: 24, kick: 780, kickDash: 1100, fric: 1.5, stop: 45,
  dmg: 26, bossDmg: 60, hop: 0.22, cd: 0.6, last: 14, endDur: 2.4, fly: 2.4, flySp: 820, flyR: 130, flyDmg: 60, flyBoss: 160 };
// les cases spéciales (comme sur le vrai jeu, en plus court) : l'oie fait rejouer, le pont fait sauter, le labyrinthe fait reculer
const OIE_CASES = { 4: 'oie', 8: 'oie', 11: 'oie', 6: 'pont', 12: 'laby' };
const OIE_JUMP = { pont: 10, laby: 7 };
// la spirale : 14 cases (le départ et 13 cases), puis l'arrivée au centre
const OIE_SPIRAL = [[-246, 0], [-219, -65], [-158, -117], [-72, -147], [23, -148], [109, -119], [167, -66], [180, 1], [144, 62], [67, 100], [-26, 100], [-98, 59], [-113, -5], [-57, -54], [22, 4]];
const DE_PIPS = [null, [[0, 0]], [[-1, -1], [1, 1]], [[-1, -1], [0, 0], [1, 1]], [[-1, -1], [1, -1], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]]];
VOISIN_SAYS.oie = ['Six ! Six ! Six !', 'Elle fait « couac », ton oie ?', 'Attention au labyrinthe…', 'À moi de lancer le dé !'];

function startOie(pos) {
  const p = G.p;
  let x = WORLD.w / 2, y = WORLD.h / 2;
  for (let i = 0; i < 30; i++) {
    const a = rnd(TAU), d = rnd(OIE.d0, OIE.d1);
    x = clamp(p.x + Math.cos(a) * d, 360, WORLD.w - 360); y = clamp(p.y + Math.sin(a) * d, 300, WORLD.h - 300);
    if (Math.hypot(x - p.x, y - p.y) > OIE.d0 * 0.75) break;
  }
  const cells = OIE_SPIRAL.map(([cx, cy], i) => ({ x: x + cx, y: y + cy, kind: i === OIE.last ? 'fin' : i === 0 ? 'depart' : OIE_CASES[i] || '' }));
  // le dé : entre la goutte et le plateau, à bonne distance des deux
  const a = Math.atan2(y - p.y, x - p.x) + rnd(-0.8, 0.8);
  const de = { x: clamp(p.x + Math.cos(a) * OIE.deD, 60, WORLD.w - 60), y: clamp(p.y + Math.sin(a) * OIE.deD, 60, WORLD.h - 60), vx: 0, vy: 0, face: 1 + Math.floor(rnd(6)), res: 0, rolling: false, cd: 0.8, rot: rnd(-0.3, 0.3), flick: 0, flickT: 0, kickN: 0 };
  const start = clamp(pos | 0, 0, OIE.last - 1);
  G.oie = { x, y, cells, de, pos: start, from: start, moves: [], hopT: OIE.hop, roll: 0, busy: false, t: 0, end: false, endT: 0, win: false };
  AU.play('oieNew');
  if (!G.oieSeen) { G.oieSeen = true; caption('Un jeu de l’oie s’imprime sur la page !', 3.2, 'hl'); caption('Fonce dans le dé : il roule à travers les ratures, puis ton pion avance.', 3.8, 'hl'); }
  else caption('Une nouvelle partie de jeu de l’oie !', 2.4, 'hl');
}
// les cases à parcourir pour avancer de n (on s'arrête à l'arrivée : pas besoin du compte exact, c'est un jeu de poche)
function oieAdvance(K, n) {
  K.moves = []; K.roll = n;
  for (let i = 1, c = K.pos; i <= n && c < OIE.last; i++) { c++; K.moves.push(c); }
  K.busy = true;
}

function stepOie(dt) {
  stepOieVols(dt);
  const K = G.oie;
  if (!K) {
    if (G.t >= G.nextOie) { if (G.boss || (G.colo && !G.colo.end)) G.nextOie = G.t + 6; else startOie(); }
    return;
  }
  if (K.end) { K.endT += dt; if (K.endT >= OIE.endDur) G.oie = null; return; }
  K.t += dt;
  const p = G.p, de = K.de;
  de.cd -= dt;
  if (de.rolling) rollDe(K, de, dt);
  else if (!K.busy && de.cd <= 0) {   // on fonce dans le dé
    const dx = de.x - p.x, dy = de.y - p.y, d = Math.hypot(dx, dy);
    if (d < p.r + OIE.deR + 4) {
      const ux = d > 1 ? dx / d : p.dx || 1, uy = d > 1 ? dy / d : p.dy || 0, sp = p.dashT > 0 ? OIE.kickDash : OIE.kick;
      Object.assign(de, { vx: ux * sp, vy: uy * sp, rolling: true, res: 1 + Math.floor(rnd(6)), kickN: de.kickN + 1 });
      G.deKicks = (G.deKicks || 0) + 1;
      AU.play('deKick'); G.cam.shake = Math.max(G.cam.shake, 3);
    }
  }
  if (K.busy && !de.rolling) stepPion(K, dt);
  if (!K.busy && !de.rolling && K.t >= OIE.len) {
    K.end = true; K.endT = 0; G.nextOie = G.t + OIE.again;
    caption('La partie de l’oie est rangée dans sa boîte…', 2.4, 'pink'); AU.play('ctrlBad');
  }
}
// le dé roule, rebondit sur les bords de la page et bouscule les ratures
function rollDe(K, de, dt) {
  de.x += de.vx * dt; de.y += de.vy * dt;
  if (de.x < 40 || de.x > WORLD.w - 40) { de.vx *= -0.8; de.x = clamp(de.x, 40, WORLD.w - 40); AU.play('deHit'); }
  if (de.y < 40 || de.y > WORLD.h - 40) { de.vy *= -0.8; de.y = clamp(de.y, 40, WORLD.h - 40); AU.play('deHit'); }
  const k = Math.exp(-OIE.fric * dt); de.vx *= k; de.vy *= k;
  const sp = Math.hypot(de.vx, de.vy);
  de.rot += sp * dt / 40;
  de.flickT -= dt;
  if (de.flickT <= 0) { de.flickT = 0.07 + 18 / Math.max(60, sp); de.flick++; de.face = 1 + (de.flick * 5 + de.kickN) % 6; AU.play('deRoll'); }
  if (rand() < dt * 10) G.parts.push({ x: de.x + rnd(-10, 10), y: de.y + rnd(-10, 10), vx: -de.vx * 0.1, vy: -de.vy * 0.1, life: 0.4, max: 0.4, size: rnd(2, 3.5), color: C.graphite, drag: 3 });
  query(de.x, de.y, OIE.deR + 120, tmpA);
  for (const e of tmpA) {
    if (e.dead || e.ghost || e.deHit === de.kickN || (e.x - de.x) ** 2 + (e.y - de.y) ** 2 > (e.r + OIE.deR) ** 2) continue;
    e.deHit = de.kickN;
    hurtEnemy(e, (e.isBoss ? OIE.bossDmg : OIE.dmg) * G.S.dmg, 'oie');
    if (e.dead) G.oieKills = (G.oieKills || 0) + 1;
    else if (!e.isBoss) { e.vx += de.vx * 0.6; e.vy += de.vy * 0.6; }
    de.vx *= 0.94; de.vy *= 0.94;
    AU.play('deHit');
  }
  if (sp < OIE.stop) {
    Object.assign(de, { vx: 0, vy: 0, rolling: false, face: de.res, rot: Math.round(de.rot / (Math.PI / 2)) * Math.PI / 2 });
    AU.play('deStop');
    addText(de.x, de.y - 46, de.res + ' !', C.red, 40);
    oieAdvance(K, de.res);
  }
}
// le pion saute de case en case, puis on regarde où il est tombé
function stepPion(K, dt) {
  K.hopT += dt;
  if (K.hopT < OIE.hop) return;
  if (K.moves.length) { K.from = K.pos; K.pos = K.moves.shift(); K.hopT = 0; AU.play('pion', K.pos); return; }
  oieLand(K);
}
function oieLand(K) {
  const kind = K.cells[K.pos].kind;
  if (K.pos >= OIE.last) { oieWin(K); return; }
  if (kind === 'oie') { caption('Case ' + K.pos + ' : l’oie ! Tu avances encore de ' + K.roll + '.', 2.4, 'hl'); AU.play('oieCase'); oieAdvance(K, K.roll); return; }
  if (kind === 'pont' || kind === 'laby') {
    const to = OIE_JUMP[kind];
    caption(kind === 'pont' ? 'Le pont ! Ton pion file à la case ' + to + '.' : 'Le labyrinthe : tu te perds… retour à la case ' + to + '.', 2.4, kind === 'pont' ? 'hl' : 'pink');
    AU.play(kind === 'pont' ? 'oieCase' : 'oieRecule');
    K.moves = [to]; K.hopT = -0.3; return;
  }
  K.busy = false; K.de.cd = OIE.cd;
  G.xp += 3; G.score += 50;
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  addText(K.de.x, K.de.y - 78, 'case ' + K.pos + ' / ' + OIE.last, C.graphite, 26);
}
// l'arrivée : l'oie s'envole et traverse la page vers la goutte (et bien au-delà)
function oieWin(K) {
  const p = G.p;
  K.busy = false; K.end = true; K.win = true; K.endT = 0; G.nextOie = G.t + OIE.again;
  G.oies = (G.oies || 0) + 1;
  G.score += 600; G.xp += 16; p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  let dx = p.x - K.x, dy = p.y - K.y, d = Math.hypot(dx, dy);
  if (d < 80) { const a = rnd(TAU); dx = Math.cos(a); dy = Math.sin(a); d = 1; }
  G.oieVols.push({ x: K.x - dx / d * 260, y: K.y - dy / d * 260, vx: dx / d * OIE.flySp, vy: dy / d * OIE.flySp, t: 0, n: G.oies, honk: 0 });
  AU.play('oieWin'); G.cam.shake = Math.max(G.cam.shake, 8);
  caption('Arrivée ! L’oie s’envole… et un cœur !', 2.8, 'hl');
  voisinSay('oie');
  for (let i = 0; i < 30; i++) { const a = rnd(TAU), s = rnd(120, 420); G.parts.push({ x: K.x, y: K.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.9, max: 0.9, size: rnd(3, 6), color: i % 2 ? C.gold : '#fffdf4', drag: 3 }); }
}
function stepOieVols(dt) {
  for (const O of G.oieVols) {
    O.t += dt; O.honk -= dt;
    O.x += O.vx * dt; O.y += O.vy * dt;
    if (O.honk <= 0) { O.honk = 0.7; AU.play('oieHonk'); }
    if (rand() < dt * 14) G.parts.push({ x: O.x + rnd(-30, 30), y: O.y + rnd(-20, 20), vx: -O.vx * 0.15 + rnd(-40, 40), vy: rnd(20, 80), life: 1.1, max: 1.1, size: rnd(3, 5), color: '#fffdf4', drag: 2 });
    query(O.x, O.y, OIE.flyR + 120, tmpA);
    for (const e of tmpA) {
      if (e.dead || e.ghost || e.flyHit === O.n || (e.x - O.x) ** 2 + (e.y - O.y) ** 2 > (OIE.flyR + e.r) ** 2) continue;
      e.flyHit = O.n;
      hurtEnemy(e, (e.isBoss ? OIE.flyBoss : OIE.flyDmg) * G.S.dmg, 'oie');
      if (e.dead) G.oieKills = (G.oieKills || 0) + 1;
      else if (!e.isBoss) { const d = Math.hypot(O.vx, O.vy) || 1; e.vx += O.vy / d * 300; e.vy -= O.vx / d * 300; }
    }
  }
  G.oieVols = G.oieVols.filter(O => O.t < OIE.fly);
}

// Le pilote : il va au dé quand il attend d'être lancé
function oieTarget() {
  const K = G.oie; if (!K || K.end || K.busy || K.de.rolling || K.de.cd > 0) return null;
  return K.de;
}

/* ----- dessin ----- */
function drawOieBoard(v) {
  const K = G.oie; if (!K) return;
  if (K.x + 340 < v.x0 || K.x - 340 > v.x1 || K.y + 280 < v.y0 || K.y - 300 > v.y1) return;
  const a = K.end ? clamp(1 - (K.endT - 1.2) / 1, 0, 1) : Math.min(1, K.t * 2);
  ctx.save(); ctx.globalAlpha = a; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.save(); ctx.translate(K.x, K.y); ctx.rotate(0.012);
  ctx.fillStyle = 'rgba(255,250,232,0.8)'; ctx.fillRect(-310, -230, 620, 440);
  ctx.strokeStyle = 'rgba(46,46,51,0.4)'; ctx.lineWidth = 2; ctx.strokeRect(-302, -222, 604, 424);
  ctx.strokeStyle = 'rgba(201,146,27,0.45)'; ctx.lineWidth = 4; ctx.strokeRect(-294, -214, 588, 408);
  ctx.restore();
  // le chemin
  ctx.strokeStyle = 'rgba(46,46,51,0.35)'; ctx.lineWidth = 5; ctx.setLineDash([2, 10]);
  ctx.beginPath(); K.cells.forEach((c, i) => i ? ctx.lineTo(c.x, c.y) : ctx.moveTo(c.x, c.y)); ctx.stroke(); ctx.setLineDash([]);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  K.cells.forEach((c, i) => {
    const fin = c.kind === 'fin', r = fin ? 40 : 28;
    ctx.fillStyle = fin ? 'rgba(240,200,90,0.75)' : c.kind === 'oie' ? 'rgba(246,231,94,0.7)' : c.kind === 'pont' ? 'rgba(140,230,140,0.55)' : c.kind === 'laby' ? 'rgba(255,140,190,0.5)' : '#fffdf4';
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.arc(c.x, c.y, r, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.translate(c.x, c.y + (fin ? 4 : 5)); ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    if (c.kind === 'oie' || fin) { ctx.scale(fin ? 0.34 : 0.2, fin ? 0.34 : 0.2); drawOieBird(1, 0.6, true); }
    else if (c.kind === 'pont') { ctx.beginPath(); ctx.arc(0, 8, 14, Math.PI, TAU); ctx.moveTo(-18, 8); ctx.lineTo(18, 8); ctx.stroke(); }
    else if (c.kind === 'laby') { ctx.beginPath(); for (let t = 0; t < 14; t += 0.3) ctx.lineTo(Math.cos(t) * t * 1.1, Math.sin(t) * t * 1.1); ctx.stroke(); }
    ctx.restore();
    ctx.font = '700 ' + (fin ? 20 : 17) + 'px ' + FONT_MAIN; ctx.fillStyle = C.graphite;
    ctx.fillText(i === 0 ? 'départ' : fin ? 'arrivée' : String(i), c.x, c.y - (fin ? 26 : c.kind ? 15 : 0));
  });
  // le pion : une petite goutte d'encre qui saute de case en case
  const c0 = K.cells[K.from], c1 = K.cells[K.pos], q = clamp(K.hopT / OIE.hop, 0, 1);
  const px = lerp(c0.x, c1.x, q), py = lerp(c0.y, c1.y, q) - Math.sin(q * Math.PI) * (Math.abs(K.pos - K.from) > 1 ? 120 : 40) - 10;
  ctx.fillStyle = 'rgba(46,46,51,0.2)'; ctx.beginPath(); ctx.ellipse(px, lerp(c0.y, c1.y, q) + 14, 12, 4, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = C.ink; ctx.beginPath(); ctx.moveTo(px, py - 22); ctx.quadraticCurveTo(px + 14, py - 2, px, py + 10); ctx.quadraticCurveTo(px - 14, py - 2, px, py - 22); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(px - 4, py - 2, 3, 0, TAU); ctx.fill();
  ctx.restore();
  txt('Jeu de l’oie', K.x, K.y - 252, 32, { font: FONT_CURSIVE, weight: 400, color: C.graphite, alpha: a, hl: K.win ? C.hlGold : undefined });
  if (!K.end) {
    const k = clamp(1 - K.t / OIE.len, 0, 1);
    ctx.save(); ctx.globalAlpha = a * 0.7; ctx.fillStyle = k < 0.3 ? C.red : C.pencil; ctx.fillRect(K.x - 200, K.y + 222, 400 * k, 5); ctx.restore();
  } else if (K.win) txt('gagné !', K.x, K.y - 290 - K.endT * 20, 40, { font: FONT_CURSIVE, weight: 400, color: C.red, alpha: a });
}
function drawDe(de, a) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(46,46,51,0.18)'; ctx.beginPath(); ctx.ellipse(de.x + 4, de.y + 26, 26, 8, 0, 0, TAU); ctx.fill();
  ctx.translate(de.x, de.y); ctx.rotate(de.rot);
  const s = OIE.deR;
  ctx.fillStyle = '#fffdf4'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.6; ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(-s + 6, -s); ctx.lineTo(s - 6, -s); ctx.quadraticCurveTo(s, -s, s, -s + 6); ctx.lineTo(s, s - 6); ctx.quadraticCurveTo(s, s, s - 6, s); ctx.lineTo(-s + 6, s); ctx.quadraticCurveTo(-s, s, -s, s - 6); ctx.lineTo(-s, -s + 6); ctx.quadraticCurveTo(-s, -s, -s + 6, -s); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = de.face === 1 ? C.red : C.graphite;
  for (const [x, y] of DE_PIPS[de.face]) { ctx.beginPath(); ctx.arc(x * 12, y * 12, de.face === 1 ? 6 : 4.5, 0, TAU); ctx.fill(); }
  ctx.restore();
}
// une oie de papier (blanche, bec orange, écharpe rouge) ; flap : ouverture de l'aile ; plain : pour l'icône des cases
function drawOieBird(face, flap, plain) {
  ctx.lineWidth = plain ? 6 : 3; ctx.strokeStyle = C.graphite; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  ctx.fillStyle = '#fffdf4';
  ctx.beginPath(); ctx.moveTo(-62, -6); ctx.lineTo(-84, -22); ctx.lineTo(-74, 4); ctx.closePath(); ctx.fill(); ctx.stroke();   // la queue
  ctx.beginPath(); ctx.ellipse(-10, 0, 62, 34, 0, 0, TAU); ctx.fill(); ctx.stroke();   // le corps
  ctx.beginPath(); ctx.moveTo(34, -18); ctx.quadraticCurveTo(52, -30, 52, -58); ctx.lineTo(70, -60); ctx.quadraticCurveTo(70, -26, 48, -4); ctx.closePath(); ctx.fill(); ctx.stroke();   // le cou
  ctx.beginPath(); ctx.arc(62, -64, 15, 0, TAU); ctx.fill(); ctx.stroke();   // la tête
  ctx.fillStyle = '#e8742c'; ctx.beginPath(); ctx.moveTo(74, -70); ctx.lineTo(100, -62); ctx.lineTo(74, -56); ctx.closePath(); ctx.fill(); ctx.stroke();   // le bec
  ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(66, -68, plain ? 4 : 3, 0, TAU); ctx.fill();
  ctx.fillStyle = '#e5484d'; ctx.beginPath(); ctx.moveTo(46, -34); ctx.lineTo(70, -38); ctx.lineTo(70, -28); ctx.lineTo(48, -24); ctx.closePath(); ctx.fill();   // l'écharpe
  if (!plain) { ctx.beginPath(); ctx.moveTo(50, -28); ctx.lineTo(40, -6); ctx.lineTo(50, -8); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle = '#f3efe2';   // l'aile
  ctx.beginPath(); ctx.moveTo(-34, -8); ctx.quadraticCurveTo(-30, -20 - 70 * flap, 6 - 30 * flap, -24 - 60 * flap); ctx.quadraticCurveTo(10, -16, 24, -10); ctx.closePath(); ctx.fill(); ctx.stroke();
  if (!plain) { ctx.strokeStyle = '#e8742c'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-14, 32); ctx.lineTo(-32, 40); ctx.moveTo(4, 32); ctx.lineTo(-14, 42); ctx.stroke(); }
}
function drawOieTop() {
  const K = G.oie;
  if (K && (!K.end || K.endT < 1.4)) {
    const de = K.de, a = K.end ? clamp(1 - K.endT / 1.4, 0, 1) : Math.min(1, K.t * 2);
    if (oieSeenAt(de.x, de.y, 60)) {
      if (!K.end && !K.busy && !de.rolling && de.cd <= 0) {   // le dé attend : un pointillé qui palpite
        ctx.save(); ctx.strokeStyle = C.gold; ctx.globalAlpha = 0.4 + 0.3 * Math.sin(G.time * 5); ctx.lineWidth = 3; ctx.setLineDash([6, 6]);
        ctx.beginPath(); ctx.arc(de.x, de.y, 44, 0, TAU); ctx.stroke(); ctx.restore();
        txt('case ' + K.pos + ' / ' + OIE.last, de.x, de.y - 56, 22, { color: C.graphite, alpha: a * 0.85 });
      }
      drawDe(de, a);
    }
  }
  for (const O of G.oieVols) {
    if (!oieSeenAt(O.x, O.y, 200)) continue;
    const a = Math.min(1, O.t * 4, (OIE.fly - O.t) * 3), face = O.vx < 0 ? -1 : 1;
    ctx.save(); ctx.globalAlpha = a; ctx.translate(O.x, O.y + Math.sin(O.t * 9) * 6);
    ctx.fillStyle = 'rgba(46,46,51,0.12)'; ctx.beginPath(); ctx.ellipse(0, 110, 80, 14, 0, 0, TAU); ctx.fill();
    ctx.scale(face * 1.25, 1.25); ctx.rotate(Math.atan2(O.vy, Math.abs(O.vx)) * 0.5);
    drawOieBird(face, 0.5 + 0.5 * Math.sin(O.t * 14), false);
    ctx.restore();
  }
}
function drawOieArrow() {
  if (G.state !== 'play') return;
  const t = oieTarget(); if (t) edgeArrow(t.x, t.y);
}
function oieSeenAt(x, y, m) { const v = viewRect(); return x > v.x0 - m && x < v.x1 + m && y > v.y0 - m && y < v.y1 + m; }
