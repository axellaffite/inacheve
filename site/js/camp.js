'use strict';

// Chapitre XVI : la colo (itération 30). Le dixième cahier est un carnet de colonie de vacances : des sapins au crayon,
// une tente, le planning de la semaine. Deux ratures à soi : le moustique, qui vise puis pique en piqué, et le hérisson,
// qui se roule en boule et lance ses épines. Quand la nuit tombe, c'est la veillée (veillee.js). Au bout : la Grande Ourse.
const NOTES_CAMP = [
  { x: WORLD.w / 2, y: -150, t: '— carnet n° 10 · chapitre XVI : la colo —', r: -0.02 },
  { x: WORLD.w * 0.72, y: -96, t: 'ajouté : la veillée, et des lucioles', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'le dernier jour ? la cour vide ?', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'ne pas oublier', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'la lampe de poche', r: -0.05 },
  { x: -160, y: WORLD.h * 0.45 + 88, t: '(et le doudou)', r: -0.04 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'les lucioles vont dans le bocal', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: 'un hérisson en boule, on ne le touche pas', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'extinction des feux : 21 h', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'juillet', r: 0.05 },
  { x: WORLD.w * 0.3, y: -96, t: 'écrire aux parents', r: -0.02 }
];
const DICTEES_CAMP = ['NUIT', 'TENTE', 'LAMPE', 'ÉTOILE', 'SAPIN', 'LUCIOLE', 'BOUSSOLE', 'VEILLÉE', 'CHANSON', 'COLONIE'];
const CAMP_TYPES = new Set(['moustique', 'herisson']);
Object.assign(ETYPES, {
  moustique: { r: 12, hp: 7, speed: 96, dmg: 1, xp: 2, agil: 5 },
  herisson:  { r: 21, hp: 26, speed: 44, dmg: 1, xp: 4, agil: 2 },
  ourse:     { r: 112, hp: 1650, speed: 40, dmg: 2, xp: 260, agil: 1.2, boss: true }
});
const enCamp = () => CH().paper === 'camp';

CHAPTERS.push({
  num: 'XVI', name: 'La colo', done: 'La colo : bonne nuit, les étoiles !', paper: 'camp', notes: NOTES_CAMP, dictees: DICTEES_CAMP,
  intro: 'Chapitre XVI : la colo. Quand la nuit tombe, attrape les lucioles…', boss: 'ourse', bossName: 'La Grande Ourse',
  bossIntro: 'Lève les yeux : la Grande Ourse descend du ciel !', bossBack: 'La Grande Ourse redescend faire un tour.', bossSound: 'boss16',
  scale: 68, rateOff: 240, rateCap: 22, waveCap: 'Toute la colo est réveillée !',
  meet: {
    moustique: 'Nouveau : le moustique. Il s’arrête, vise… et pique en piqué !',
    herisson: 'Nouveau : le hérisson. En boule, il lance ses épines tout autour.'
  },
  pick(t, r) {
    const nuit = G.nuit && !G.nuit.end;   // la nuit, les moustiques sortent
    if (t > 12 && r < (nuit ? 0.12 : 0.05) && countType('moustique') < (nuit ? 16 : 10)) return 'moustique';
    if (t > 20 && r < 0.17 && countType('herisson') < 6) return 'herisson';
    if (t > 45 && r < 0.22 && countType('tache') < 8) return 'tache';
    if (t > 15 && r < 0.48) return 'biffure';
    return 'gribouillis';
  },
  wave(t, i) { return i % 6 === 0 ? 'herisson' : i % 6 === 3 ? 'moustique' : t > 90 && i % 6 === 2 ? 'biffure' : 'gribouillis'; }
});

/* ---------- le papier : un carnet de colo ---------- */
const PLANNING = ['lundi : grand jeu dans les bois', 'mardi : baignade au lac', 'mercredi : la randonnée', 'jeudi : la veillée', 'vendredi : la boum !'];
const PLAN = { x: WORLD.w - 960, y: 300, w: 720, h: 500 };
const SAPINS = Array.from({ length: 34 }, (_, i) => ({ x: 90 + (i * 811 % 2620), y: WORLD.h - 70 - (i * 337 % 3) * 40, s: 0.7 + (i * 53 % 5) * 0.12 }));
function drawCamp(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = 'rgba(200,226,200,0.2)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // un papier un peu vert, comme une feuille au soleil
  ctx.strokeStyle = C.margin; ctx.globalAlpha = 0.55; ctx.lineWidth = 2.2 / ZOOM; ctx.beginPath(); ctx.moveTo(MARGIN_X, y0); ctx.lineTo(MARGIN_X, y1); ctx.stroke(); ctx.globalAlpha = 1;
  if (v.y0 < 330) txt('Carnet de colo', WORLD.w / 2, 190, 70, { font: FONT_CURSIVE, weight: 400, color: '#2f6b4f', alpha: 0.5 });
  for (const s of SAPINS) if (s.x > v.x0 - 80 && s.x < v.x1 + 80 && s.y > v.y0 - 160 && s.y < v.y1 + 40) drawSapin(s.x, s.y, s.s);
  if (v.x0 < 900 && v.y0 < 760 && v.x1 > 300 && v.y1 > 300) drawTenteDoodle(560, 560);
  const P = PLAN;
  if (P.x + P.w < v.x0 || P.x > v.x1 || P.y + P.h < v.y0 || P.y > v.y1) return;
  ctx.save(); ctx.globalAlpha = 0.5; ctx.translate(P.x + P.w / 2, P.y + P.h / 2); ctx.rotate(-0.015);
  ctx.strokeStyle = '#2f6b4f'; ctx.lineWidth = 3; ctx.setLineDash([16, 10]); ctx.strokeRect(-P.w / 2, -P.h / 2, P.w, P.h); ctx.setLineDash([]);
  ctx.restore();
  txt('Le planning de la semaine', P.x + P.w / 2, P.y + 70, 48, { font: FONT_CURSIVE, weight: 400, color: '#2f6b4f', alpha: 0.55 });
  PLANNING.forEach((l, k) => txt(l, P.x + 60, P.y + 160 + k * 70, 38, { align: 'left', color: '#33503f', alpha: 0.45, weight: 400 }));
}
function drawSapin(x, y, s) {   // un sapin au crayon, trois étages et un petit tronc
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = 0.32;
  ctx.strokeStyle = '#2f6b4f'; ctx.fillStyle = 'rgba(90,150,110,0.35)'; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  for (let k = 0; k < 3; k++) { const w = 60 - k * 14, top = -60 - k * 40; ctx.beginPath(); ctx.moveTo(-w, top + 60); ctx.lineTo(0, top); ctx.lineTo(w, top + 60); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.strokeStyle = '#7a5a3a'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 22); ctx.stroke();
  ctx.restore();
}
function drawTenteDoodle(x, y) {   // une tente canadienne et un feu de camp, dessinés au crayon
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = 0.35; ctx.lineWidth = 3; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(232,116,44,0.25)'; ctx.strokeStyle = '#a3542a';
  ctx.beginPath(); ctx.moveTo(-150, 90); ctx.lineTo(-40, -70); ctx.lineTo(70, 90); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-40, -70); ctx.lineTo(-40, 90); ctx.moveTo(-40, -70); ctx.lineTo(-60, -95); ctx.stroke();
  ctx.fillStyle = 'rgba(46,46,51,0.25)'; ctx.beginPath(); ctx.moveTo(-40, 90); ctx.lineTo(-40, 0); ctx.lineTo(-8, 90); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#7a5a3a'; ctx.beginPath(); ctx.moveTo(150, 92); ctx.lineTo(220, 72); ctx.moveTo(150, 72); ctx.lineTo(220, 92); ctx.stroke();
  ctx.fillStyle = 'rgba(232,116,44,0.5)'; ctx.strokeStyle = '#c9592a';
  ctx.beginPath(); ctx.moveTo(160, 76); ctx.quadraticCurveTo(170, 30, 185, 20); ctx.quadraticCurveTo(195, 50, 212, 76); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

/* ---------- le moustique et le hérisson ---------- */
const MOUST = { aimR: 270, aim: 0.42, dive: 0.34, diveSpeed: 440, cd: [1.8, 3.2], night: 1.3 };
const HERISSON = { range: 480, cd: [2.8, 4.2], bristle: 0.6, curl: 1.1, n: 10, speed: 215, life: 1.6, armor: 0.35 };
function stepCampEnemy(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  e.pt -= dt;
  if (e.type === 'moustique') {
    const nuit = G.nuit && !G.nuit.end ? MOUST.night : 1;   // la nuit, ta lumière les attire
    if (e.phase === 'aim') {   // il s'arrête en l'air et vise (un fin pointillé montre où)
      MV.x *= 0.05; MV.y *= 0.05;
      if (e.pt <= 0) { e.phase = 'dive'; e.pt = MOUST.dive; }
    } else if (e.phase === 'dive') {   // le piqué
      MV.x = e.cx * MOUST.diveSpeed; MV.y = e.cy * MOUST.diveSpeed; MV.agil = 14;
      if (e.pt <= 0) { e.phase = 'walk'; e.pt = rnd(MOUST.cd[0], MOUST.cd[1]); }
    } else {
      const w = Math.sin(G.t * 7 + e.id * 1.7) * 0.9;
      MV.x = (dx / d + -dy / d * w) * e.speed * slow * nuit; MV.y = (dy / d + dx / d * w) * e.speed * slow * nuit;
      if (e.pt <= 0) {
        if (d < MOUST.aimR && !hid) { e.phase = 'aim'; e.pt = MOUST.aim; e.cx = dx / d; e.cy = dy / d; AU.play('moustique'); }
        else e.pt = 0.3;
      }
    }
    e.rot = Math.atan2(e.phase === 'walk' ? MV.y : e.cy, e.phase === 'walk' ? MV.x : e.cx);
  } else {   // le hérisson : il trottine, se roule en boule, hérisse ses piquants… et les lance tout autour
    if (e.phase === 'curl') {
      MV.x = 0; MV.y = 0; MV.agil = 8;
      if (!e.shot && e.pt <= HERISSON.curl) {
        e.shot = true;
        const off = rnd(TAU);
        for (let i = 0; i < HERISSON.n; i++) { const a = off + i / HERISSON.n * TAU; G.ebul.push({ x: e.x + Math.cos(a) * 24, y: e.y + Math.sin(a) * 24, vx: Math.cos(a) * HERISSON.speed, vy: Math.sin(a) * HERISSON.speed, life: HERISSON.life, epine: true }); }
        AU.play('epines');
      }
      e.spinA = (e.spinA || 0) + dt * (e.shot ? 6 : 1);
      if (e.pt <= 0) { e.phase = 'walk'; e.pt = rnd(HERISSON.cd[0], HERISSON.cd[1]); }
    } else {
      if (e.pt <= 0) {
        if (d < HERISSON.range && !hid) { e.phase = 'curl'; e.pt = HERISSON.bristle + HERISSON.curl; e.shot = false; AU.play('herisson'); }
        else e.pt = 0.4;
      }
      e.face = MV.x >= 0 ? 1 : -1;
    }
  }
}
const campArmor = e => e.type === 'herisson' && e.phase === 'curl' ? HERISSON.armor : 1;   // en boule, il ne craint presque rien
function campDanger(x, y) {
  let s = 0;
  for (const e of G.enemies) {
    if (e.type === 'herisson' && e.phase === 'curl' && !e.shot) { if ((x - e.x) ** 2 + (y - e.y) ** 2 < 240 * 240) s += 2; }
    else if (e.type === 'moustique' && e.phase !== 'walk') {
      const ex = x - e.x, ey = y - e.y, along = ex * e.cx + ey * e.cy;
      if (along > 0 && along < 200 && Math.abs(ex * e.cy - ey * e.cx) < 34) s += 2.5;
    }
  }
  return s;
}

/* ---------- la Grande Ourse ---------- */
// une constellation en forme d'ourse : ses étoiles, et les traits qui les relient (les sept de la casserole brillent plus fort)
const OURSE_STARS = [[-150, -30], [-112, -18], [-75, -28], [-15, -44], [45, -40], [80, -28], [102, -44], [92, -66], [138, -30], [108, -12], [64, 2], [58, 34], [78, 60], [-10, 8], [-66, 30], [-50, 60], [-188, -50]];
const OURSE_LINES = [[16, 0], [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [6, 8], [8, 9], [9, 10], [10, 4], [10, 11], [11, 12], [10, 13], [3, 13], [13, 14], [2, 14], [14, 15]];
const OURSE_BRIGHT = new Set([16, 0, 1, 2, 3, 13, 14]);
const OURSE_SKY = Array.from({ length: 26 }, (_, i) => [((i * 7919) % 400) - 200, ((i * 104729) % 260) - 130, 1 + i % 3]);
const OURSE = { fall: 2.6, gap: 0.16, gap2: 0.1, fallSpeed: 400, constN: 7, constN2: 10, constR: 330, wait: 0.95, constSpeed: 340, zN: 14, zN2: 18, zSpeed: 150 };
function stepOurse(e, dt, dx, dy, d, slow) {
  const want = d < 330 ? -0.4 : d > 580 ? 2.4 : 0.6;
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow * want; MV.y = dy / d * e.speed * slow * want;
  if (e.enter > 0) e.enter = Math.max(0, e.enter - dt * 0.5);
  const enraged = e.hp < e.maxHp / 2, p = G.p;
  e.face = dx >= 0 ? 1 : -1;
  if (e.phase === 'filantes') {   // la pluie d'étoiles filantes : elles tombent en biais autour de toi
    e.pt -= dt; e.emit = (e.emit || 0) - dt;
    if (e.emit <= 0) {
      e.emit = enraged ? OURSE.gap2 : OURSE.gap;
      const x = p.x + rnd(-560, 560), y = p.y - 640, n = Math.hypot(0.34, 1);
      G.ebul.push({ x, y, vx: 0.34 / n * OURSE.fallSpeed, vy: 1 / n * OURSE.fallSpeed, life: 3.6, etoile: true, a: rnd(TAU) });
    }
    if (e.pt <= 0) { e.phase = 'walk'; e.atk = enraged ? 1.3 : 1.9; }
    return;
  }
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % 3;
  if (m === 1) { e.phase = 'filantes'; e.pt = OURSE.fall; e.emit = 0.2; AU.play('filantes'); }
  else if (m === 2) {   // la constellation : des étoiles s'allument en cercle autour de toi, puis foncent toutes ensemble
    const rings = enraged ? 2 : 1;
    for (let r = 0; r < rings; r++) {
      const n = enraged ? OURSE.constN2 : OURSE.constN, off = rnd(TAU), tx = p.x, ty = p.y, R = OURSE.constR + r * 90;
      for (let i = 0; i < n; i++) {
        const a = off + i / n * TAU, x = tx + Math.cos(a) * R, y = ty + Math.sin(a) * R;
        G.ebul.push({ x, y, vx: -Math.cos(a) * OURSE.constSpeed, vy: -Math.sin(a) * OURSE.constSpeed, life: 2.4, wait: OURSE.wait + r * 0.45 + i * 0.04, tx, ty, etoile: true, a });
      }
    }
    AU.play('constellation'); e.atk = enraged ? 1.9 : 2.5;
    if (!G.constSeen) { G.constSeen = true; caption('Les étoiles s’allument autour de toi… sors du cercle avant qu’elles foncent !', 3, 'pink'); }
  } else {   // la berceuse : elle bâille, et des « z » partent en rond ; en colère, elle réveille les moustiques
    const n = enraged ? OURSE.zN2 : OURSE.zN, off = rnd(TAU);
    for (let i = 0; i < n; i++) { const a = off + i / n * TAU; G.ebul.push({ x: e.x + Math.cos(a) * 90, y: e.y + Math.sin(a) * 70, vx: Math.cos(a) * OURSE.zSpeed, vy: Math.sin(a) * OURSE.zSpeed, life: 6, zz: true, a: i }); }
    AU.play('baille'); e.yawn = 1.2; e.atk = enraged ? 1.6 : 2.2;
    if (enraged && countType('moustique') < 16) { for (let k = 0; k < 4; k++) { const a = k / 4 * TAU; spawnEnemy('moustique', clamp(e.x + Math.cos(a) * 170, 40, WORLD.w - 40), clamp(e.y + Math.sin(a) * 140, 40, WORLD.h - 40)); } caption('Elle réveille les moustiques !', 1.6, 'pink'); }
  }
}
function drawOurse(e, fr, fl) {
  const enraged = e.hp < e.maxHp / 2, tw = G.time;
  if (e.yawn > 0) e.yawn = Math.max(0, e.yawn - 1 / 60);   // purement visuel (la durée exacte n'importe pas)
  ctx.save(); if (enraged) ctx.translate(vrnd(-1.2, 1.2), vrnd(-1.2, 1.2));
  // un morceau de ciel de nuit, qui la suit partout
  const g = ctx.createRadialGradient(0, 0, 40, 0, 0, 230);
  g.addColorStop(0, fl ? 'rgba(70,80,150,0.95)' : 'rgba(22,30,78,0.92)'); g.addColorStop(0.7, 'rgba(22,30,78,0.7)'); g.addColorStop(1, 'rgba(22,30,78,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 240, 170, 0, 0, TAU); ctx.fill();
  for (const [x, y, s] of OURSE_SKY) { ctx.globalAlpha = 0.4 + 0.4 * Math.sin(tw * 2 + x); ctx.fillStyle = '#e8ecff'; ctx.fillRect(x, y, s, s); }
  ctx.globalAlpha = 1;
  ctx.scale(e.face || 1, 1);
  const P = OURSE_STARS.map(([x, y], i) => [x, y + Math.sin(tw * 1.6 + i * 0.7) * 2.5]);
  ctx.lineCap = 'round';
  for (const [w, a] of [[7, 0.18], [2.4, 0.85]]) {   // les traits, avec un halo
    ctx.strokeStyle = enraged ? '#ffb38a' : '#ffe9a8'; ctx.globalAlpha = a; ctx.lineWidth = w; ctx.beginPath();
    for (const [i, j] of OURSE_LINES) { ctx.moveTo(P[i][0], P[i][1]); ctx.lineTo(P[j][0], P[j][1]); }
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  P.forEach(([x, y], i) => drawStar5(x, y, OURSE_BRIGHT.has(i) ? 9 + Math.sin(tw * 4 + i) * 1.5 : 5, fl ? '#ffffff' : OURSE_BRIGHT.has(i) ? '#fff3b8' : '#ffe08a'));
  // l'œil et la bouche
  const ex = 112, ey = -34;
  ctx.fillStyle = '#fffdf4'; ctx.beginPath(); ctx.arc(ex, ey, 8, 0, TAU); ctx.fill();
  const la = Math.atan2(G.p.y - e.y, (G.p.x - e.x) * (e.face || 1));
  ctx.fillStyle = '#1a1f44'; ctx.beginPath(); ctx.arc(ex + Math.cos(la) * 3, ey + Math.sin(la) * 3, 3.6, 0, TAU); ctx.fill();
  if (enraged) { ctx.strokeStyle = '#ffb38a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(ex - 10, ey - 14); ctx.lineTo(ex + 9, ey - 9); ctx.stroke(); }
  ctx.strokeStyle = '#ffe9a8'; ctx.lineWidth = 2.5; ctx.beginPath();
  if (e.yawn > 0) ctx.ellipse(124, -14, 7, 4 + 6 * Math.sin(Math.PI * e.yawn / 1.2), 0, 0, TAU); else ctx.arc(122, -20, 6, 0.3, Math.PI - 0.3);
  ctx.stroke();
  ctx.restore();
}
function drawStar5(x, y, r, col) {
  ctx.fillStyle = col; ctx.beginPath();
  for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}

/* ---------- dessin des ratures et des projectiles ---------- */
function drawCampEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const j = (fr - 1) * 0.8;
  if (e.type === 'moustique') {   // un petit moustique gris, de grandes ailes qui vibrent, la trompe en avant
    ctx.save(); ctx.rotate(e.rot || 0);
    const flap = Math.sin(G.time * 60 + e.id) * 0.5;
    ctx.fillStyle = 'rgba(200,215,235,0.55)'; ctx.strokeStyle = 'rgba(90,100,120,0.6)'; ctx.lineWidth = 1;
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.ellipse(-2, s * (8 + flap * 3), 10, 4.5, s * (0.5 + flap), 0, TAU); ctx.fill(); ctx.stroke(); }
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; ctx.beginPath();
    for (const lx of [-6, -1, 4]) for (const s of [-1, 1]) { ctx.moveTo(lx, s * 2); ctx.lineTo(lx - 5, s * 12); }
    ctx.stroke();
    ctx.fillStyle = fl ? '#ffffff' : '#6b6f7e'; ctx.beginPath(); ctx.ellipse(-6, 0, 9, 3.6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = fl ? '#ffffff' : '#4a4d5a'; ctx.beginPath(); ctx.arc(5, 0, 4.4, 0, TAU); ctx.fill();
    ctx.strokeStyle = e.phase === 'walk' ? '#4a4d5a' : C.red; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(9, 0); ctx.lineTo(19, 0); ctx.stroke();   // la trompe
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(6, -2 + j * 0.2, 1.7, 0, TAU); ctx.fill();
    ctx.restore();
  } else {   // le hérisson : un dos de piquants bruns et un petit museau crème ; en boule, une bogue qui tourne
    const curl = e.phase === 'curl', bris = curl && !e.shot ? clamp(1 - (e.pt - HERISSON.curl) / HERISSON.bristle, 0, 1) : 0;
    ctx.fillStyle = 'rgba(46,46,51,0.14)'; ctx.beginPath(); ctx.ellipse(0, 18, 22, 5, 0, 0, TAU); ctx.fill();
    if (curl) {
      ctx.save(); ctx.rotate(e.spinA || 0);
      const L = e.shot ? 8 : 9 + bris * 9 + (bris > 0.8 ? vrnd(-1, 1) : 0);
      ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 2.4; ctx.beginPath();
      for (let k = 0; k < 18; k++) { const a = k / 18 * TAU; ctx.moveTo(Math.cos(a) * 14, Math.sin(a) * 14); ctx.lineTo(Math.cos(a) * (17 + L), Math.sin(a) * (17 + L)); }
      ctx.stroke();
      ctx.fillStyle = fl ? '#e8d0b0' : '#8a6038'; ctx.beginPath(); ctx.arc(0, 0, 17, 0, TAU); ctx.fill(); ctx.strokeStyle = '#4a2e18'; ctx.lineWidth = 2; ctx.stroke();
      ctx.restore();
      if (bris > 0.3) { ctx.strokeStyle = C.red; ctx.globalAlpha = 0.25 + 0.25 * Math.sin(G.time * 24); ctx.setLineDash([5, 6]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 42, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }
    } else {
      ctx.save(); ctx.scale(e.face || 1, 1);
      ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 2.2; ctx.beginPath();
      for (let k = 0; k <= 10; k++) { const a = Math.PI + k / 10 * Math.PI, x = Math.cos(a) * 18 - 2, y = Math.sin(a) * 15 + 4; ctx.moveTo(x, y); ctx.lineTo(x * 1.45 - 2, y * 1.5 - 1); }
      ctx.stroke();
      ctx.fillStyle = fl ? '#e8d0b0' : '#8a6038'; ctx.beginPath(); ctx.ellipse(-2, 4, 19, 14, 0, Math.PI, TAU); ctx.lineTo(17, 8); ctx.quadraticCurveTo(0, 18, -21, 8); ctx.closePath(); ctx.fill();
      ctx.fillStyle = fl ? '#fff6e6' : '#f1d9b5'; ctx.strokeStyle = '#8a6038'; ctx.lineWidth = 1.5;   // le museau
      ctx.beginPath(); ctx.moveTo(8, -6); ctx.quadraticCurveTo(26, -2, 30, 6); ctx.quadraticCurveTo(20, 14, 8, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(30, 6, 2.6, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(16, 1 + j * 0.3, 1.8, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 2.4; ctx.beginPath(); for (const lx of [-12, -4, 6, 12]) { ctx.moveTo(lx, 12); ctx.lineTo(lx + Math.sin(G.time * 10 + lx) * 2, 18); } ctx.stroke();
      ctx.restore();
    }
  }
}
// les projectiles de la page : épines, étoiles (filantes ou en constellation) et « z » de la berceuse
function drawCampBullets() {
  for (const b of G.ebul) {
    if (b.epine) {
      const n = Math.hypot(b.vx, b.vy) || 1, ux = b.vx / n, uy = b.vy / n;
      ctx.strokeStyle = '#5a3a22'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(b.x - ux * 9, b.y - uy * 9); ctx.lineTo(b.x + ux * 8, b.y + uy * 8); ctx.stroke();
    } else if (b.etoile) {
      if (b.wait > 0) {   // annoncée : un pointillé doré vers l'endroit qu'elle vise
        ctx.save(); ctx.strokeStyle = '#d9a514'; ctx.globalAlpha = 0.45; ctx.setLineDash([4, 9]); ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(lerp(b.x, b.tx, 0.6), lerp(b.y, b.ty, 0.6)); ctx.stroke(); ctx.restore();
        drawStar5(b.x, b.y, 7 + 4 * Math.abs(Math.sin(G.time * 10 + b.a)), '#ffd75e');
      } else {
        const n = Math.hypot(b.vx, b.vy) || 1;
        const tr = ctx.createLinearGradient(b.x, b.y, b.x - b.vx / n * 60, b.y - b.vy / n * 60);
        tr.addColorStop(0, 'rgba(255,220,120,0.8)'); tr.addColorStop(1, 'rgba(255,220,120,0)');
        ctx.strokeStyle = tr; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x - b.vx / n * 60, b.y - b.vy / n * 60); ctx.stroke();
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(G.time * 4 + b.a); drawStar5(0, 0, 10, '#ffd75e'); ctx.restore();
      }
    } else if (b.zz) txt('z', b.x, b.y, 30, { font: FONT_CURSIVE, weight: 400, color: '#3d4aa8', rot: Math.sin(G.time * 3 + b.a) * 0.4 });
  }
}
function drawCampFx() {
  if (!enCamp()) return;
  for (const e of G.enemies) {   // là où le moustique va piquer
    if (e.type !== 'moustique' || e.phase !== 'aim') continue;
    ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.4; ctx.setLineDash([3, 6]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(e.x + e.cx * MOUST.diveSpeed * MOUST.dive, e.y + e.cy * MOUST.diveSpeed * MOUST.dive); ctx.stroke(); ctx.restore();
  }
  if (!nuitK()) drawCampBullets();   // la nuit, ils brillent par-dessus le noir (veillee.js)
}
