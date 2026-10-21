// Chapitre IX : la rentrée. Quatrième cahier, tout neuf ; la page est le dos de sa couverture, avec les tables de multiplication.
// Ratures de calcul : le chiffre qui trottine, le signe fois qui tire en croix, le signe égal qui lance ses deux traits
// et la retenue qui saute sur les autres pour les rendre plus fortes. Au bout : le Boulier.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const NOTES_TAB = [
  { x: WORLD.w / 2, y: -150, t: '— cahier n° 4 · chapitre IX : la rentrée (dos de la couverture) —', r: -0.02 },
  { x: WORLD.w * 0.72, y: -96, t: 'ajouté : un cahier neuf, qui sent encore le neuf', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'la récré ?', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'à apprendre', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'pour lundi', r: -0.05 },
  { x: -160, y: WORLD.h * 0.45 + 88, t: '(la table de 7 !)', r: -0.04 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'nom : ………… classe : …………', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: '7 × 8 = 56, comme 5, 6, 7, 8', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'le compte est bon ?', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'cahier tout propre', r: 0.05 },
  { x: WORLD.w * 0.3, y: -96, t: 'les vacances sont finies', r: -0.02 }
];
const DICTEES_TAB = ['UN', 'DIX', 'TABLE', 'CALCUL', 'RENTRÉE', 'BOULIER', 'MULTIPLE', 'RETENUE', 'MAÎTRESSE', 'MULTIPLICATION'];
const TABLES_TYPES = new Set(['chiffre', 'fois', 'egal', 'retenue']);
Object.assign(ETYPES, {
  chiffre: { r: 15, hp: 4, speed: 118, dmg: 1, xp: 1, agil: 4 },
  fois:    { r: 17, hp: 10, speed: 70, dmg: 1, xp: 3, agil: 3 },
  egal:    { r: 18, hp: 16, speed: 64, dmg: 1, xp: 4, agil: 2.5 },
  retenue: { r: 12, hp: 8, speed: 96, dmg: 1, xp: 4, agil: 3 },
  boulier: { r: 74, hp: 1300, speed: 42, dmg: 2, xp: 220, agil: 1.2, boss: true }
});

CHAPTERS.push({
  num: 'IX', name: 'La rentrée', done: 'La rentrée : le compte est bon !', paper: 'tables', notes: NOTES_TAB, dictees: DICTEES_TAB,
  intro: 'Chapitre IX : la rentrée. Un cahier tout neuf… et les tables au dos !', boss: 'boulier', bossName: 'Le Boulier',
  bossIntro: 'Driiing ! Tout le monde en rang : voici le Boulier !', bossBack: 'Le Boulier recompte tout.', bossSound: 'boss9',
  scale: 46, rateOff: 240, rateCap: 20.5, waveCap: 'Une ribambelle de chiffres !',
  meet: {
    chiffre: 'Nouveau : le chiffre, qui trottine en comptant ses pas',
    fois: 'Nouveau : le signe fois. Il vise en croix, puis tire !',
    egal: 'Nouveau : le signe égal. Ses deux traits filent côte à côte !',
    retenue: 'Nouveau : la retenue. Elle saute sur les autres ratures pour les rendre plus fortes !'
  },
  pick(t, r) {   // pas plus de trois égal ni de trois retenues à la fois
    if (t > 90 && r < 0.08 && countType('retenue') < 3) return 'retenue';
    if (t > 50 && r < 0.15 && countType('egal') < 3) return 'egal';
    return t > 25 && r < 0.25 && countType('fois') < 4 ? 'fois' : 'chiffre';
  },
  wave(t, i) { return t > 70 && i % 5 === 0 ? 'fois' : 'chiffre'; }
});

/* ---------- La page : le dos d'un cahier neuf, avec les tables de 1 à 10 ---------- */
const TABLE_COLORS = ['#e9524a', '#3c8fc4', '#6cbf6a', '#f19a3e', '#9b7fd1'];
const TABLE_BLOCKS = (() => {
  const out = [], cols = 5, rows = 2, cw = (WORLD.w - MARGIN_X) / cols, rh = WORLD.h / rows;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const n = 1 + i + j * cols, w = 300, h = 470;
    out.push({ n, x: MARGIN_X + i * cw + (cw - w) / 2, y: j * rh + (rh - h) / 2, w, h, color: TABLE_COLORS[(i + j) % TABLE_COLORS.length] });
  }
  return out;
})();
function drawTables(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = 'rgba(205,232,214,0.32)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // le carton vert pâle du dos de la couverture
  if (ZOOM > 0.45) {   // un fin quadrillage, comme sur le carton
    ctx.strokeStyle = 'rgba(80,140,110,0.12)'; ctx.lineWidth = 1 / ZOOM; ctx.beginPath();
    for (let x = Math.ceil(x0 / 32) * 32; x <= x1; x += 32) { ctx.moveTo(x, y0); ctx.lineTo(x, y1); }
    for (let y = Math.ceil(y0 / 32) * 32; y <= y1; y += 32) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
    ctx.stroke();
  }
  ctx.strokeStyle = C.margin; ctx.globalAlpha = 0.7; ctx.lineWidth = 2.2 / ZOOM; ctx.beginPath(); ctx.moveTo(MARGIN_X, y0); ctx.lineTo(MARGIN_X, y1); ctx.stroke(); ctx.globalAlpha = 1;
  for (const b of TABLE_BLOCKS) if (b.x + b.w > v.x0 && b.x < v.x1 && b.y + b.h > v.y0 && b.y - 10 < v.y1) drawTableBlock(b);
}
function drawTableBlock(b) {
  ctx.save(); ctx.globalAlpha = 0.45;
  ctx.fillStyle = 'rgba(255,255,255,0.7)'; roundRect(b.x, b.y, b.w, b.h, 12); ctx.fill();
  ctx.strokeStyle = b.color; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = b.color; roundRect(b.x, b.y, b.w, 50, 12); ctx.fill(); ctx.fillRect(b.x, b.y + 30, b.w, 20);
  ctx.restore();
  txt('Table de ' + b.n, b.x + b.w / 2, b.y + 26, 30, { color: '#ffffff', alpha: 0.85 });
  ctx.save(); ctx.globalAlpha = 0.3; ctx.fillStyle = C.graphite; ctx.font = '700 27px ' + FONT_MAIN; ctx.textBaseline = 'middle';
  for (let k = 1; k <= 10; k++) {
    const y = b.y + 50 + k * 38;
    ctx.textAlign = 'right'; ctx.fillText(b.n + ' × ' + k + ' =', b.x + b.w * 0.66, y);
    ctx.textAlign = 'left'; ctx.fillText(String(b.n * k), b.x + b.w * 0.7, y);
  }
  ctx.restore();
}

/* ---------- Les ratures de calcul ---------- */
const FOIS = { aim: 0.6, speed: 245 };
const EGAL = { keep: 300, aim: 0.8, speed: 300, gap: 18 };
const RETENUE = { hop: 0.7, reach: 460, boost: 0.6 };
function stepTables(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  if (e.type === 'chiffre') {   // il trottine : un pas par temps, en se dandinant
    const f = 0.45 + 0.9 * Math.abs(Math.sin(G.t * 5 + e.id));
    MV.x *= f; MV.y *= f; e.rot = Math.sin(G.t * 10 + e.id) * 0.18;
  } else if (e.type === 'fois') {   // il tourne, vise en croix (ou en plus), puis tire dans ses quatre directions
    e.pt -= dt;
    if (e.phase === 'walk') {
      e.rot += dt * 2.4;
      if (e.pt <= 0 && d < 540 && !hid) { e.phase = 'aim'; e.pt = FOIS.aim; e.cross = !e.cross; e.aimA = (e.cross ? 0 : Math.PI / 4) + Math.atan2(dy, dx); AU.play('foisAim'); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else {
      MV.x = 0; MV.y = 0; e.rot = lerp(e.rot, e.aimA - (e.cross ? 0 : Math.PI / 4), dt * 10);
      if (e.pt <= 0) {
        for (let i = 0; i < 4; i++) { const a = e.aimA + i * Math.PI / 2; G.ebul.push({ x: e.x + Math.cos(a) * 20, y: e.y + Math.sin(a) * 20, vx: Math.cos(a) * FOIS.speed, vy: Math.sin(a) * FOIS.speed, life: 3.2, a }); }
        e.phase = 'walk'; e.pt = rnd(2.8, 3.6); AU.play('foisFire');
      }
    }
  } else if (e.type === 'egal') {   // il garde ses distances, vise, et lance ses deux traits côte à côte
    e.pt -= dt;
    if (e.phase === 'walk') {
      if (d < EGAL.keep) { MV.x *= -0.6; MV.y *= -0.6; }
      e.rot = Math.sin(G.t * 1.5 + e.id) * 0.12;
      if (e.pt <= 0 && d < 620 && !hid) { e.phase = 'aim'; e.pt = EGAL.aim; e.aimA = Math.atan2(dy, dx); AU.play('egalAim'); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else {
      MV.x = 0; MV.y = 0; e.aimA += clamp(Math.atan2(dy, dx) - e.aimA, -dt * 0.8, dt * 0.8); e.rot = e.aimA;
      if (e.pt <= 0) {
        const c = Math.cos(e.aimA), s = Math.sin(e.aimA);
        for (let j = 0; j < 3; j++) for (const side of [-1, 1]) G.ebul.push({ x: e.x + c * 24 - s * side * EGAL.gap, y: e.y + s * 24 + c * side * EGAL.gap, vx: c * EGAL.speed, vy: s * EGAL.speed, life: 3, a: e.aimA, eq: true, wait: j * 0.13 });
        e.phase = 'walk'; e.pt = rnd(2.6, 3.4); AU.play('egalFire');
      }
    }
  } else if (e.type === 'retenue') {   // elle saute sur une autre rature pour s'y ajouter ; à défaut, sur toi
    e.pt -= dt;
    if (e.phase === 'walk') {
      e.rot = Math.sin(G.t * 6 + e.id) * 0.2;
      if (e.pt <= 0) {
        let tgt = null, bd = RETENUE.reach * RETENUE.reach;
        for (const o of G.enemies) { if (o === e || o.dead || o.isBoss || o.type === 'retenue' || o.ghost || (o.plus || 0) >= 2 || ERRANTES.has(o.type)) continue; const q = (o.x - e.x) ** 2 + (o.y - e.y) ** 2; if (q < bd) { bd = q; tgt = o; } }
        if (!tgt && (d > 520 || hid)) { e.pt = 0.4; return; }
        e.phase = 'hop'; e.pt = RETENUE.hop; e.hx = e.x; e.hy = e.y; e.tgt = tgt; e.ghost = true;
        const P = G.p; e.lx = tgt ? tgt.x : clamp(P.x + P.vx * 0.4, 20, WORLD.w - 20); e.ly = tgt ? tgt.y : clamp(P.y + P.vy * 0.4, 20, WORLD.h - 20);
        AU.play('retenueHop');
      }
    } else {
      if (e.tgt && !e.tgt.dead) { e.lx = e.tgt.x; e.ly = e.tgt.y; }   // elle suit sa cible en l'air
      const k = 1 - clamp(e.pt / RETENUE.hop, 0, 1);
      e.x = lerp(e.hx, e.lx, k); e.y = lerp(e.hy, e.ly, k); e.vx = 0; e.vy = 0; MV.x = 0; MV.y = 0; MV.agil = 40;
      e.rot += dt * 9;
      if (e.pt <= 0) retenueLand(e);
    }
  }
}
function retenueLand(e) {
  e.ghost = false; e.phase = 'walk'; e.pt = rnd(0.8, 1.3);
  const o = e.tgt; e.tgt = null;
  if (o && !o.dead && Math.hypot(o.x - e.x, o.y - e.y) < 60) {   // + 1 : la rature visée devient plus solide, la retenue s'y ajoute
    o.maxHp *= 1 + RETENUE.boost; o.hp = Math.min(o.maxHp, o.hp * (1 + RETENUE.boost) + e.hp); o.plus = (o.plus || 0) + 1; o.flash = 0.15;
    e.dead = true; addText(o.x, o.y - o.r - 14, '+1', C.red, 30); AU.play('retenuePlus');
    if (!G.plusSeen) { G.plusSeen = true; caption('La retenue s’ajoute : cette rature compte double !', 2.6, 'pink'); }
    return;
  }
  const p = G.p;   // ratée, ou c'était toi : elle retombe lourdement
  G.rings.push({ x: e.x, y: e.y, t: 0, dur: 0.35, r: 58, color: C.red });
  if (p.inv <= 0 && p.dashT <= 0 && (p.x - e.x) ** 2 + (p.y - e.y) ** 2 < (58 + p.r * 0.5) ** 2) hurtPlayer(1, e.x, e.y);
  AU.play('retenueLand');
}

/* ---------- Le Boulier ---------- */
const BOULIER = { cell: 84, n: 9, tableWarn: 1.1, tableAct: 0.45, rods: 9, rodGap: 50, beadSpeed: 225, billeWarn: 0.95, billeR: 56 };
const BEAD_COLORS = ['#e9524a', '#f8c83c', '#3c8fc4', '#6cbf6a', '#f19a3e'];
function stepBoulier(e, dt, dx, dy, d, slow) {
  const want = d < 300 ? -0.5 : 1;
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow * want; MV.y = dy / d * e.speed * slow * want;
  if (e.enter > 0) e.enter = Math.max(0, e.enter - dt * 0.5);
  const enraged = e.hp < e.maxHp / 2, p = G.p;
  e.count = (e.count || 0) + dt * (enraged ? 3 : 1.6);   // les perles glissent d'un côté à l'autre, comme si on comptait
  e.pt -= dt;
  if (e.phase === 'cast') { MV.x *= 0.2; MV.y *= 0.2; if (e.pt <= 0) { e.phase = 'walk'; e.atk = enraged ? 1.1 : 1.6; } return; }
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % (enraged ? 4 : 3);
  if (m === 1) {   // les perles : des rangées de perles filent vers toi, une seule tringle est vide
    const walls = enraged ? 3 : 2, a = Math.atan2(dy, dx);
    for (let w = 0; w < walls; w++) beadWall(e, a + (w % 2 ? 0.12 : -0.12) * w, 0.55 + w * 0.85);
    AU.play('beads'); e.phase = 'cast'; e.pt = 1.2 + walls * 0.6;
    if (!G.beadSeen) { G.beadSeen = true; caption('Des rangées de perles : passe par la tringle vide !', 2.6, 'pink'); }
  } else if (m === 2) {   // la table de N : sur une grande table de Pythagore, la ligne et la colonne de N brûlent
    pythagore(p, enraged);
    AU.play('tableWarn'); e.phase = 'cast'; e.pt = 1.8;
    if (!G.tableSeen) { G.tableSeen = true; caption('La table de Pythagore ! Sors de la ligne et de la colonne qui s’allument.', 3, 'pink'); }
  } else if (m === 0 && !enraged || m === 3) {   // le calcul : des billes tombent là où tu es, et là où tu vas
    const n = enraged ? 7 : 5;
    for (let i = 0; i < n; i++) {
      const a = rnd(TAU), r = i === 0 ? 0 : rnd(90, 240), lead = i === 1 ? 0.6 : 0;
      G.billes.push({ x0: e.x, y0: e.y - 40, x: clamp(p.x + p.vx * lead + Math.cos(a) * r, 30, WORLD.w - 30), y: clamp(p.y + p.vy * lead + Math.sin(a) * r, 30, WORLD.h - 30), t: -i * 0.12, dur: BOULIER.billeWarn, R: BOULIER.billeR, col: i % BEAD_COLORS.length, done: false });
    }
    AU.play('billes'); e.phase = 'cast'; e.pt = 1.6;
  } else {   // colère : il appelle toute la classe
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + G.t; spawnEnemy(i < 3 ? 'fois' : 'chiffre', e.x + Math.cos(a) * 170, e.y + Math.sin(a) * 170); }
    caption('Le Boulier appelle toute la classe !', 1.8, 'pink'); AU.play('foisFire'); e.atk = 2;
  }
}
function beadWall(e, a, wait) {
  const c = Math.cos(a), s = Math.sin(a), n = BOULIER.rods, gap = 1 + Math.floor(rnd(n - 2));
  for (let k = 0; k < n; k++) {
    if (k === gap) continue;
    const off = (k - (n - 1) / 2) * BOULIER.rodGap;
    G.ebul.push({ x: e.x + c * 90 - s * off, y: e.y + s * 90 + c * off, vx: c * BOULIER.beadSpeed, vy: s * BOULIER.beadSpeed, life: 5, a, bead: 1 + k % BEAD_COLORS.length, wait });
  }
}
// une table de Pythagore posée sous la goutte : la ligne et la colonne de N s'allument, N étant la ligne (ou la colonne) où tu te trouves
function pythagore(p, enraged) {
  const n = BOULIER.n, S = BOULIER.cell, r0 = 1 + Math.floor(rnd(n)), c0 = 1 + Math.floor(rnd(n));
  const x0 = p.x - (c0 - 0.5) * S, y0 = p.y - (r0 - 0.5) * S;
  const nums = enraged ? [r0, c0 === r0 ? 1 + (c0 % n) : c0] : [rand() < 0.5 ? r0 : c0];
  G.tables.push({ x0, y0, n, S, nums, t: 0, warn: BOULIER.tableWarn, act: BOULIER.tableAct, hit: false, fired: false });
}
function inTable(T, x, y, pad = 0) {   // dans la ligne ou la colonne d'un des nombres ?
  const c = (x - T.x0) / T.S, r = (y - T.y0) / T.S, m = pad / T.S;
  if (c < -m || r < -m || c > T.n + m || r > T.n + m) return false;
  for (const k of T.nums) if (Math.abs(r - (k - 0.5)) < 0.5 + m || Math.abs(c - (k - 0.5)) < 0.5 + m) return true;
  return false;
}

function stepTablesFx(dt) {
  if (CH().paper !== 'tables') return;
  const p = G.p, safe = p.inv > 0 || p.dashT > 0;
  for (const T of G.tables) {
    T.t += dt;
    if (!T.fired && T.t >= T.warn) { T.fired = true; AU.play('tableFire'); G.cam.shake = Math.max(G.cam.shake, 6); }
    if (!T.hit && !safe && T.t >= T.warn && T.t < T.warn + T.act && inTable(T, p.x, p.y, p.r * 0.6)) { T.hit = true; hurtPlayer(1, p.x, p.y + 20); }
  }
  G.tables = G.tables.filter(T => T.t < T.warn + T.act + 0.4);
  for (const b of G.billes) {
    b.t += dt;
    if (!b.done && b.t >= b.dur) {
      b.done = true; AU.play('billeLand');
      if (!safe && (p.x - b.x) ** 2 + (p.y - b.y) ** 2 < (b.R + p.r * 0.5) ** 2) hurtPlayer(1, b.x, b.y);
      splat(b.x, b.y, b.R * 0.35, BEAD_COLORS[b.col], 0.12, 6);
    }
  }
  G.billes = G.billes.filter(b => b.t < b.dur + 0.45);
}
function tablesDanger(x, y) {
  let s = 0;
  for (const T of G.tables) if (T.t < T.warn + T.act && inTable(T, x, y, 26)) s += 4;
  for (const b of G.billes) if (!b.done) { const d = Math.hypot(x - b.x, y - b.y); if (d < b.R + 30) s += 3 + (b.R + 30 - d) * 0.06; }
  for (const e of G.enemies) {
    if (e.type === 'fois' && e.phase === 'aim') for (let i = 0; i < 4; i++) { const a = e.aimA + i * Math.PI / 2, d = segDist(x, y, e.x, e.y, e.x + Math.cos(a) * 520, e.y + Math.sin(a) * 520); if (d < 34) s += 2.5; }
    else if (e.type === 'egal' && e.phase === 'aim') { const d = segDist(x, y, e.x, e.y, e.x + Math.cos(e.aimA) * 640, e.y + Math.sin(e.aimA) * 640); if (d < 50) s += 3; }
    else if (e.type === 'retenue' && e.phase === 'hop' && !e.tgt) { const d = Math.hypot(x - e.lx, y - e.ly); if (d < 80) s += 3; }
  }
  return s + calcDanger(x, y);
}

/* ---------- Dessins ---------- */
function drawTablesFx() {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const e of G.enemies) {
    if (e.type === 'fois' && e.phase === 'aim') {   // la croix d'avertissement
      ctx.save(); ctx.translate(e.x, e.y); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 26); ctx.setLineDash([10, 8]); ctx.lineWidth = 2.5; ctx.beginPath();
      for (let i = 0; i < 4; i++) { const a = e.aimA + i * Math.PI / 2; ctx.moveTo(Math.cos(a) * 26, Math.sin(a) * 26); ctx.lineTo(Math.cos(a) * 520, Math.sin(a) * 520); }
      ctx.stroke(); ctx.restore();
    } else if (e.type === 'egal' && e.phase === 'aim') {   // deux traits parallèles en pointillés
      ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.aimA); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 24); ctx.setLineDash([12, 9]); ctx.lineWidth = 2.5; ctx.beginPath();
      for (const s of [-1, 1]) { ctx.moveTo(30, s * EGAL.gap); ctx.lineTo(640, s * EGAL.gap); }
      ctx.stroke(); ctx.restore();
    } else if (e.type === 'retenue' && e.phase === 'hop') {   // là où elle va retomber
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.5; ctx.setLineDash([6, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(e.lx, e.ly, e.tgt ? 30 : 58, 0, TAU); ctx.stroke(); ctx.restore();
    }
    if (e.plus) txt('+' + e.plus, e.x + e.r * 0.8, e.y - e.r - 12, 22, { color: C.red, rot: 0.15 });   // une rature qui a reçu une retenue
  }
  for (const T of G.tables) drawPythagore(T);
  for (const b of G.billes) {
    const k = clamp(b.t / b.dur, 0, 1);
    if (b.t < 0) continue;
    if (!b.done) {
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 20); ctx.setLineDash([9, 7]); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(b.x, b.y, b.R, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 0.15 + 0.25 * k; ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.ellipse(b.x, b.y, b.R * (0.2 + 0.4 * k), b.R * (0.15 + 0.3 * k), 0, 0, TAU); ctx.fill();
      ctx.restore();
      const bx = lerp(b.x0, b.x, k), by = lerp(b.y0, b.y, k) - Math.sin(k * Math.PI) * 240;
      drawBead(bx, by, 15, BEAD_COLORS[b.col], 0);
    } else {
      const q = (b.t - b.dur) / 0.45;
      ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = BEAD_COLORS[b.col]; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(b.x, b.y, b.R * (0.5 + q * 0.6), 0, TAU); ctx.stroke(); ctx.restore();
      if (q < 0.6) txt('toc !', b.x, b.y - 30 - q * 20, 24, { color: C.red, alpha: 1 - q / 0.6 });
    }
  }
  for (const b of G.ebul) {   // perles du boulier et traits du signe égal
    if (!b.bead && !b.eq) continue;
    ctx.save(); ctx.globalAlpha = b.wait > 0 ? 0.35 : 1;
    if (b.bead) drawBead(b.x, b.y, 12, BEAD_COLORS[b.bead - 1], b.a);
    else { ctx.translate(b.x, b.y); ctx.rotate(b.a); ctx.strokeStyle = C.red; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(12, 0); ctx.stroke(); }
    ctx.restore();
  }
}
function drawBead(x, y, r, col, a) {   // une perle de boulier, percée de part en part
  ctx.save(); ctx.translate(x, y); ctx.rotate(a);
  ctx.fillStyle = col; ctx.strokeStyle = 'rgba(46,46,51,0.65)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, r * 0.75, r, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.5)'; ctx.beginPath(); ctx.ellipse(-r * 0.25, -r * 0.4, r * 0.2, r * 0.3, 0, 0, TAU); ctx.fill();
  ctx.restore();
}
function drawPythagore(T) {
  const S = T.S, n = T.n, live = T.t >= T.warn, appear = clamp(T.t / 0.3, 0, 1), fade = live ? clamp(1 - (T.t - T.warn - T.act) / 0.4, 0, 1) : 1;
  ctx.save(); ctx.globalAlpha = appear * fade;
  ctx.strokeStyle = 'rgba(46,46,51,0.25)'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let i = 0; i <= n; i++) { ctx.moveTo(T.x0 + i * S, T.y0); ctx.lineTo(T.x0 + i * S, T.y0 + n * S); ctx.moveTo(T.x0, T.y0 + i * S); ctx.lineTo(T.x0 + n * S, T.y0 + i * S); }
  ctx.stroke();
  ctx.font = '700 26px ' + FONT_MAIN; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = C.pencil;
  for (let i = 1; i <= n; i++) { ctx.fillText(String(i), T.x0 + (i - 0.5) * S, T.y0 - 24); ctx.fillText(String(i), T.x0 - 26, T.y0 + (i - 0.5) * S); }
  ctx.fillText('×', T.x0 - 26, T.y0 - 24);
  for (const k of T.nums) {
    if (live) { ctx.fillStyle = 'rgba(232,82,74,0.42)'; ctx.fillRect(T.x0, T.y0 + (k - 1) * S, n * S, S); ctx.fillRect(T.x0 + (k - 1) * S, T.y0, S, n * S); }
    else {
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha *= 0.4 + 0.35 * Math.sin(G.time * 22); ctx.setLineDash([12, 9]); ctx.lineWidth = 3;
      ctx.strokeRect(T.x0, T.y0 + (k - 1) * S, n * S, S); ctx.strokeRect(T.x0 + (k - 1) * S, T.y0, S, n * S); ctx.restore();
    }
    ctx.fillStyle = live ? '#ffffff' : C.red;
    for (let i = 1; i <= n; i++) { ctx.fillText(String(k * i), T.x0 + (i - 0.5) * S, T.y0 + (k - 0.5) * S); if (i !== k) ctx.fillText(String(k * i), T.x0 + (k - 0.5) * S, T.y0 + (i - 0.5) * S); }
  }
  ctx.restore();
  if (!live) txt('la table de ' + T.nums.join(' et de '), T.x0 + n * S / 2, T.y0 - 64, 34, { color: C.red, alpha: appear, hl: C.hlPink });
}

function drawTablesEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const j = (fr - 1) * 0.8;
  if (e.type === 'chiffre') {   // un chiffre écrit à la plume, avec deux yeux
    ctx.rotate(e.rot);
    txt(String(1 + e.id % 9), j, 2, 40, { color: fl ? C.red : C.ink });
    for (const s of [-5, 5]) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(s, -14, 4, 0, TAU); ctx.fill(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; ctx.stroke(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + 0.8, -13.4, 1.9, 0, TAU); ctx.fill(); }
  } else if (e.type === 'fois') {   // un signe × (ou + quand il vise droit) aux bouts arrondis
    ctx.save(); ctx.rotate(e.rot + (e.cross && e.phase === 'aim' ? 0 : Math.PI / 4));
    ctx.strokeStyle = fl ? C.red : C.graphite; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-18 - j, 0); ctx.lineTo(18 + j, 0); ctx.moveTo(0, -18 + j); ctx.lineTo(0, 18 - j); ctx.stroke();
    ctx.strokeStyle = fl ? '#ffd0d4' : '#5a5a66'; ctx.lineWidth = 3; ctx.stroke();
    ctx.restore();
    ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(0, 0, 7.5, 0, TAU); ctx.fill(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.4; ctx.stroke();
    const la = Math.atan2(G.p.y - e.y, G.p.x - e.x); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(Math.cos(la) * 3, Math.sin(la) * 3, 3, 0, TAU); ctx.fill();
  } else if (e.type === 'egal') {   // deux grosses barres, et des yeux entre les deux
    ctx.rotate(e.rot);
    ctx.fillStyle = fl ? C.red : C.ink;
    for (const s of [-1, 1]) { roundRect(-22, s * 9 - 4.5 + (s > 0 ? j : -j), 44, 9, 4.5); ctx.fill(); }
    for (const s of [-8, 8]) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(s, 0, 4, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + 1, 0.5, 2, 0, TAU); ctx.fill(); }
  } else if (e.type === 'retenue') {   // un petit « 1 » rouge, qu'on écrit au-dessus de la colonne
    const air = e.phase === 'hop' ? Math.sin((1 - clamp(e.pt / RETENUE.hop, 0, 1)) * Math.PI) * 60 : 0;
    if (air) { ctx.fillStyle = 'rgba(46,46,51,0.2)'; ctx.beginPath(); ctx.ellipse(0, 12, 12, 5, 0, 0, TAU); ctx.fill(); }
    ctx.translate(0, -air); ctx.rotate(e.rot);
    txt('1', 0, 0, 34, { color: fl ? C.ink : C.red });
    txt('+', -13, -6, 20, { color: fl ? C.ink : C.red });
    for (const s of [-1, 1]) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(s * 4 + 2, -9, 3, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s * 4 + 2.6, -8.6, 1.5, 0, TAU); ctx.fill(); }
  }
}
function drawBoulier(e, fr, fl) {
  const enraged = e.hp < e.maxHp / 2, j = (fr - 1) * 1.5, w = 190, h = 150, cnt = e.count || 0;
  ctx.save(); if (enraged) ctx.translate(vrnd(-1.5, 1.5), vrnd(-1.5, 1.5));
  // le cadre de bois
  ctx.fillStyle = fl ? '#f0c89a' : '#c9874a'; ctx.strokeStyle = '#6e3f17'; ctx.lineWidth = 3;
  roundRect(-w / 2, -h / 2, w, h, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = fl ? '#fff3df' : '#f8efd8'; roundRect(-w / 2 + 14, -h / 2 + 24, w - 28, h - 38, 4); ctx.fill();
  // les tringles et leurs perles, qui glissent quand il compte
  for (let r = 0; r < 5; r++) {
    const y = -h / 2 + 38 + r * 22;
    ctx.strokeStyle = '#8a8a92'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-w / 2 + 14, y); ctx.lineTo(w / 2 - 14, y); ctx.stroke();
    const moved = Math.floor((cnt + r * 1.7) % 11), slide = (cnt + r * 1.7) % 1;
    for (let k = 0; k < 10; k++) {
      const right = k < moved, base = right ? w / 2 - 26 - (moved - 1 - k) * 13 : -w / 2 + 26 + (k - moved) * 13;
      const x = base + (k === moved - 1 ? (1 - ease(slide * 3)) * -40 : 0);
      drawBead(x, y + (k % 2 ? j : 0) * 0.3, 8, BEAD_COLORS[r], Math.PI / 2);
    }
  }
  // le haut du cadre, avec les yeux et la bouche
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x);
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(s * 34, -h / 2 + 2, 15, 0, TAU); ctx.fill(); ctx.strokeStyle = '#6e3f17'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s * 34 + Math.cos(la) * 6, -h / 2 + 2 + Math.sin(la) * 6, 6, 0, TAU); ctx.fill();
    if (enraged) { ctx.strokeStyle = '#6e3f17'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(s * 50, -h / 2 - 20); ctx.lineTo(s * 20, -h / 2 - 12); ctx.stroke(); }
  }
  ctx.strokeStyle = '#6e3f17'; ctx.lineWidth = 3.5; ctx.beginPath();
  if (enraged) { ctx.moveTo(-18, h / 2 - 3); ctx.lineTo(18, h / 2 - 3); } else ctx.arc(0, h / 2 - 16, 16, 0.4, Math.PI - 0.4);
  ctx.stroke();
  // les pieds
  ctx.fillStyle = '#6e3f17'; for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(s * (w / 2 - 14), h / 2 + 6, 8, 0, TAU); ctx.fill(); }
  ctx.restore();
}
