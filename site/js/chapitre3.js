// Chapitre III : le papier millimétré. Ratures géométriques (segment, équerre, compas, rapporteur) et la Règle de fer.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

/* ===================== La page ===================== */
const MM = 8;   // un millimètre du papier, en pixels du monde
const NOTES_MILLI = [
  { x: WORLD.w / 2, y: -150, t: '— chapitre III : le papier millimétré —', r: -0.02 },
  { x: WORLD.w * 0.7, y: -96, t: 'ajouté : relier les points (c’est fait)', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'une carte au trésor ?', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'à main levée', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'interdit !', r: -0.05 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'π ≈ 3,14', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: '(TODO : le rapporteur ment)', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'tout se mesure', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'cf. ch. II, mesure 4', r: 0.05 }
];
const DICTEES_MILLI = ['ANGLE', 'CERCLE', 'RAYON', 'CARRÉ', 'COMPAS', 'ÉQUERRE', 'TRIANGLE', 'DIAMÈTRE', 'RECTANGLE', 'PARALLÈLE', 'GÉOMÉTRIE'];
const MILLI_TYPES = new Set(['segment', 'equerre', 'compas', 'rapporteur']);

CHAPTERS.push({
  num: 'III', name: 'Le papier millimétré', done: 'Le papier millimétré : tracé.', paper: 'milli', notes: NOTES_MILLI, dictees: DICTEES_MILLI,
  intro: 'Chapitre III : le papier millimétré. Ici, tout se mesure…', boss: 'regle', bossName: 'La Règle de fer',
  bossIntro: 'La Règle de fer se pose sur la page…', bossBack: 'La Règle de fer revient, toujours bien droite.', bossSound: 'boss3',
  scale: 3, rateOff: 110, rateCap: 8.5, waveCap: 'Une ribambelle de segments !',
  meet: {
    segment: 'Nouveau : le segment, qui fait des moulinets',
    equerre: 'Nouveau : l’équerre. Elle trace un angle droit… sur toi !',
    compas: 'Nouveau : le compas. Ne reste pas sur son cercle !',
    rapporteur: 'Nouveau : le rapporteur, qui tire en éventail'
  },
  pick(t, r) { if (t > 105 && r < 0.07) return 'rapporteur'; if (t > 55 && r < 0.16) return 'compas'; if (t > 25 && r < 0.34) return 'equerre'; if (t > 80 && r < 0.4) return 'gomme'; return 'segment'; },
  wave(t, i) { return t > 70 && i % 4 === 0 ? 'equerre' : 'segment'; }
});

// Distance d'un point à un segment
function segDist(px, py, x1, y1, x2, y2) {
  const vx = x2 - x1, vy = y2 - y1, l2 = vx * vx + vy * vy || 1;
  const k = clamp(((px - x1) * vx + (py - y1) * vy) / l2, 0, 1);
  return Math.hypot(px - x1 - vx * k, py - y1 - vy * k);
}
// Un trait de crayon laissé sur la page (il sèche comme l'encre)
function pencilStain(x1, y1, x2, y2, alpha, width = 2.5) {
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.globalAlpha = alpha; sctx.strokeStyle = C.graphite; sctx.lineWidth = width; sctx.lineCap = 'round';
  sctx.beginPath(); sctx.moveTo(x1, y1); sctx.lineTo(x2, y2); sctx.stroke(); sctx.restore();
}

/* ===================== Les ratures géométriques ===================== */
function stepMilli(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  if (e.type === 'segment') {   // il avance en faisant des moulinets
    const w = Math.sin(G.t * 2.5 + e.id) * 0.45;
    MV.x += -dy / d * e.speed * w; MV.y += dx / d * e.speed * w;
    e.rot += dt * (3 + e.id % 3);
  } else if (e.type === 'equerre') {
    e.pt -= dt;
    if (e.phase === 'walk') {
      e.rot += dt * 0.7;
      if (e.pt <= 0 && d < 460 && !hid) {   // elle s'arrête et trace un angle droit dont un côté passe par toi
        e.phase = 'aim'; e.pt = 1.1; e.aimA = Math.atan2(dy, dx);
        G.lines.push({ x: e.x, y: e.y, a: e.aimA, side: rand() < 0.5 ? 1 : -1, len: 440, t: 0, warn: 0.85, act: 0.3, hit: false });
        AU.play('squareAim');
      } else if (e.pt <= 0) e.pt = 0.5;
    } else {
      MV.x = 0; MV.y = 0;
      e.rot = lerp(e.rot, e.aimA + Math.PI / 4, Math.min(1, dt * 8));
      if (e.pt <= 0) { e.phase = 'walk'; e.pt = rnd(2.6, 3.8); }
    }
  } else if (e.type === 'compas') {
    stepCompas(e, dt, dx, dy, d, hid);
  } else if (e.type === 'rapporteur') {
    e.pt -= dt; MV.x *= 0.8; MV.y *= 0.8;
    if (e.phase === 'walk') {
      e.rot = Math.atan2(dy, dx);
      if (e.pt <= 0 && d < 560 && !hid) { e.phase = 'aim'; e.pt = 0.8; e.aimA = Math.atan2(dy, dx); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else {
      MV.x = 0; MV.y = 0;
      if (e.pt <= 0) {   // cinq rayons, de 24° en 24°
        for (let k = -2; k <= 2; k++) for (let j = 0; j < 2; j++) {
          const a = e.aimA + k * 0.42;
          G.ebul.push({ x: e.x + Math.cos(a) * 26, y: e.y + Math.sin(a) * 26, vx: Math.cos(a) * 235, vy: Math.sin(a) * 235, life: 3.5, a, deg: true, wait: j * 0.24 });
        }
        AU.play('protract'); e.phase = 'walk'; e.pt = rnd(2.8, 3.6);
      }
    }
  }
}
// Le compas plante sa pointe, ouvre ses branches, puis trace un cercle complet : la mine fait mal
function stepCompas(e, dt, dx, dy, d, hid) {
  e.pt -= dt;
  if (e.phase === 'walk') {
    e.rot = Math.sin(G.t * 6 + e.id) * 0.15;
    if (e.pt <= 0 && d < 320 && !hid) {
      e.phase = 'open'; e.pt = 0.55; e.cx = e.x; e.cy = e.y;
      e.R = 0; e.Rt = clamp(d, 120, 230); e.dir = rand() < 0.5 ? 1 : -1; e.ang = Math.atan2(dy, dx) - e.dir * 1.7;
    } else if (e.pt <= 0) e.pt = 0.5;
    return;
  }
  MV.x = 0; MV.y = 0; MV.agil = 50; e.vx = 0; e.vy = 0;
  const ox = e.x, oy = e.y;
  if (e.phase === 'open') { e.R = e.Rt * (1 - Math.max(0, e.pt) / 0.55); if (e.pt <= 0) { e.phase = 'draw'; e.pt = 2.3; AU.play('compas'); } }
  else if (e.phase === 'draw') { e.ang += e.dir * TAU / 2.3 * dt; if (e.pt <= 0) { e.phase = 'close'; e.pt = 0.4; } }
  else if (e.phase === 'close') { e.R = e.Rt * Math.max(0, e.pt) / 0.4; if (e.pt <= 0) { e.phase = 'walk'; e.pt = rnd(2.4, 3.4); e.R = 0; } }
  e.x = e.cx + Math.cos(e.ang) * e.R; e.y = e.cy + Math.sin(e.ang) * e.R;
  if (e.phase === 'draw') { pencilStain(ox, oy, e.x, e.y, 0.16, 2); if (Math.floor((e.pt + dt) * 3) !== Math.floor(e.pt * 3)) AU.play('compas'); }
}
// Angles droits tracés par les équerres : annoncés en pointillés, puis actifs un court instant
function stepLines(dt) {
  const p = G.p;
  for (const l of G.lines) {
    const was = l.t < l.warn; l.t += dt;
    if (was && l.t >= l.warn) {
      AU.play('squareSnap');
      for (const a of [l.a, l.a + l.side * Math.PI / 2]) pencilStain(l.x, l.y, l.x + Math.cos(a) * l.len, l.y + Math.sin(a) * l.len, 0.07, 2);
    }
    if (!l.hit && l.t >= l.warn && l.t < l.warn + l.act) {
      for (const a of [l.a, l.a + l.side * Math.PI / 2]) {
        if (segDist(p.x, p.y, l.x, l.y, l.x + Math.cos(a) * l.len, l.y + Math.sin(a) * l.len) < p.r + 6) { l.hit = true; hurtPlayer(1, l.x, l.y); break; }
      }
    }
  }
  G.lines = G.lines.filter(l => l.t < l.warn + l.act + 0.4);
}

/* ===================== La Règle de fer ===================== */
const REGLE = { L: 540, w: 54 };
function regleEnds(e, x = e.x, y = e.y, rot = e.rot) {
  const c = Math.cos(rot) * REGLE.L / 2, s = Math.sin(rot) * REGLE.L / 2;
  return [x - c, y - s, x + c, y + s];
}
// Distance « utile » d'un point à la règle (pour les coups et pour le pilote automatique)
function regleDist(e, x, y) {
  if (e.phase === 'spinWarn' || e.phase === 'spin') return Math.hypot(x - e.x, y - e.y) - REGLE.L / 2;
  const [x1, y1, x2, y2] = e.phase === 'lift' ? regleEnds(e, e.sx, e.sy, e.srot) : regleEnds(e);
  return segDist(x, y, x1, y1, x2, y2) - REGLE.w / 2;
}
function stepRegle(e, dt, dx, dy, d, slow) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  if (e.enter > 0) e.enter = Math.max(0, e.enter - dt * 0.5);
  const enraged = e.hp < e.maxHp / 2, p = G.p;
  e.pt -= dt;
  if (e.phase === 'spinWarn') { MV.x = 0; MV.y = 0; e.rot += dt * 0.6; if (e.pt <= 0) { e.phase = 'spin'; e.pt = 2.6; AU.play('spin'); } }
  else if (e.phase === 'spin') { e.rot += dt * (enraged ? 5.2 : 4.2); MV.x *= 0.9; MV.y *= 0.9; if (e.pt <= 0) { e.phase = 'walk'; e.atk = 1.1; } }
  else if (e.phase === 'lift') { MV.x = 0; MV.y = 0; e.vx = 0; e.vy = 0; if (e.pt <= 0) slamRegle(e); return; }
  else e.rot += dt * 0.35;
  // le corps de la règle : on se cogne sur toute sa longueur
  const [x1, y1, x2, y2] = regleEnds(e);
  if (segDist(p.x, p.y, x1, y1, x2, y2) < REGLE.w / 2 + p.r - 4) hurtPlayer(e.phase === 'spin' ? 2 : 1, e.x, e.y);
  if (e.phase !== 'walk') return;
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % (enraged ? 4 : 3);
  if (m === 1) { mesure(e, enraged ? 3 : 2); e.atk = enraged ? 2.2 : 2.8; }
  else if (m === 2) { e.phase = 'spinWarn'; e.pt = 0.9; caption('Le moulinet !', 1.2, 'pink'); }
  else if (m === 0 && !enraged || m === 3) { e.slams = enraged ? 2 : 1; liftRegle(e); e.atk = 1.6; }
  else {   // colère : elle appelle des équerres et des segments, et mesure encore
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + G.t; spawnEnemy(i % 2 ? 'segment' : 'equerre', e.x + Math.cos(a) * 160, e.y + Math.sin(a) * 160); }
    mesure(e, 1); e.atk = 2.4;
  }
}
// La règle tire ses graduations, de part et d'autre, en plusieurs fois
function mesure(e, volleys) {
  const nx = -Math.sin(e.rot), ny = Math.cos(e.rot);
  for (let v = 0; v < volleys; v++) for (let i = 0; i <= 8; i++) {
    const k = (i / 8 - 0.5) * REGLE.L * 0.9, x = e.x + Math.cos(e.rot) * k, y = e.y + Math.sin(e.rot) * k;
    for (const s of [-1, 1]) {
      const a = Math.atan2(ny * s, nx * s) + (v % 2 ? 0.22 : 0);
      G.ebul.push({ x: x + nx * s * 30, y: y + ny * s * 30, vx: Math.cos(a) * 195, vy: Math.sin(a) * 195, life: 4.5, a, deg: true, wait: v * 0.45 });
    }
  }
  AU.play('mesure');
}
// Elle se soulève (intouchable), vise un trait qui passe par toi, puis s'abat dessus
function liftRegle(e) {
  const p = G.p;
  e.phase = 'lift'; e.pt = e.slams > 1 ? 1.0 : 1.1; e.ghost = true;
  e.ox = e.x; e.oy = e.y; e.orot = e.rot;
  e.sx = clamp(p.x, 60, WORLD.w - 60); e.sy = clamp(p.y, 60, WORLD.h - 60); e.srot = rnd(TAU);
  AU.play('lift');
}
function slamRegle(e) {
  const p = G.p;
  e.x = e.sx; e.y = e.sy; e.rot = e.srot; e.ghost = false; e.vx = 0; e.vy = 0;
  G.cam.shake = Math.max(G.cam.shake, 16); AU.play('slam');
  const [x1, y1, x2, y2] = regleEnds(e);
  pencilStain(x1, y1, x2, y2, 0.4, 4);   // un trait tiré à la règle reste sur la page
  for (let i = 0; i < 30; i++) { const k = rnd(-0.5, 0.5) * REGLE.L, s = rnd(-1, 1) > 0 ? 1 : -1; G.parts.push({ x: e.x + Math.cos(e.rot) * k, y: e.y + Math.sin(e.rot) * k, vx: -Math.sin(e.rot) * s * rnd(80, 260), vy: Math.cos(e.rot) * s * rnd(80, 260), life: 0.5, max: 0.5, size: rnd(2, 4), color: C.graphite, drag: 4 }); }
  if (segDist(p.x, p.y, x1, y1, x2, y2) < REGLE.w / 2 + p.r) hurtPlayer(2, e.x, e.y);
  e.slams--;
  if (e.slams > 0) liftRegle(e); else e.phase = 'walk';
}

/* ===================== Dessin ===================== */
// Papier millimétré : lignes orangées au millimètre, plus marquées tous les 5 mm et tous les centimètres
function drawMilli(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  const grid = (step, skip, style, lw) => {
    ctx.strokeStyle = style; ctx.lineWidth = lw; ctx.beginPath();
    for (let x = Math.ceil(x0 / step) * step; x <= x1; x += step) if (!skip || x % skip) { ctx.moveTo(x, y0); ctx.lineTo(x, y1); }
    for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) if (!skip || y % skip) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
    ctx.stroke();
  };
  if (ZOOM > 0.7) grid(MM, MM * 5, 'rgba(230,150,90,0.2)', 0.8 / ZOOM);
  grid(MM * 5, MM * 10, 'rgba(218,132,68,0.34)', 1 / ZOOM);
  grid(MM * 10, 0, 'rgba(206,112,50,0.5)', 1.5 / ZOOM);
  // un repère tracé au crayon, en bas à gauche
  const ox = 160, oy = WORLD.h - 160;
  if (ox + 760 > v.x0 && ox - 40 < v.x1 && oy + 60 > v.y0 && oy - 760 < v.y1) {
    ctx.save(); ctx.strokeStyle = C.graphite; ctx.globalAlpha = 0.55; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath();
    ctx.moveTo(ox - 20, oy); ctx.lineTo(ox + 720, oy); ctx.lineTo(ox + 706, oy - 8); ctx.moveTo(ox + 720, oy); ctx.lineTo(ox + 706, oy + 8);
    ctx.moveTo(ox, oy + 20); ctx.lineTo(ox, oy - 720); ctx.lineTo(ox - 8, oy - 706); ctx.moveTo(ox, oy - 720); ctx.lineTo(ox + 8, oy - 706);
    for (let k = 80; k < 720; k += 80) { ctx.moveTo(ox + k, oy - 6); ctx.lineTo(ox + k, oy + 6); ctx.moveTo(ox - 6, oy - k); ctx.lineTo(ox + 6, oy - k); }
    ctx.stroke(); ctx.restore();
    txt('O', ox - 22, oy + 24, 30, { color: C.graphite, alpha: 0.6 }); txt('x', ox + 730, oy + 26, 30, { color: C.graphite, alpha: 0.6 }); txt('y', ox - 26, oy - 724, 30, { color: C.graphite, alpha: 0.6 });
  }
}
const PLASTIC = 'rgba(150,200,222,0.42)', PLASTIC_FL = 'rgba(240,140,140,0.55)';
function drawMilliEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const j = (fr - 1) * 0.8;
  if (e.type === 'segment') {
    ctx.rotate(e.rot);
    ctx.strokeStyle = fl ? C.red : C.graphite; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-17, j); ctx.lineTo(17, -j);
    ctx.moveTo(-17, -6); ctx.lineTo(-17, 6); ctx.moveTo(17, -6 + j); ctx.lineTo(17, 6 + j); ctx.stroke();
  } else if (e.type === 'equerre') {
    ctx.rotate(e.rot);
    ctx.fillStyle = fl ? PLASTIC_FL : PLASTIC; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-18 + j, 18); ctx.lineTo(28, 18 + j); ctx.lineTo(-18, -28); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-10, 10); ctx.lineTo(8, 10); ctx.lineTo(-10, -8); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); for (let k = 0; k < 6; k++) { const x = -14 + k * 7.5; ctx.moveTo(x, 18); ctx.lineTo(x, k % 2 ? 14 : 12); } ctx.stroke();
    ctx.strokeRect(-18, 11, 7, 7);   // le petit carré de l'angle droit
  } else if (e.type === 'compas') {
    drawCompas(e, fr, fl);
  } else if (e.type === 'rapporteur') {
    if (e.phase === 'aim') {
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.25 + 0.25 * Math.sin(G.time * 24); ctx.setLineDash([8, 8]); ctx.lineWidth = 2;
      ctx.beginPath(); for (let k = -2; k <= 2; k++) { const a = e.aimA + k * 0.42; ctx.moveTo(Math.cos(a) * 30, Math.sin(a) * 30); ctx.lineTo(Math.cos(a) * 220, Math.sin(a) * 220); } ctx.stroke(); ctx.restore();
    }
    ctx.rotate(e.rot);
    ctx.fillStyle = fl ? PLASTIC_FL : PLASTIC; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-2, -28 - j); ctx.arc(-2, 0, 28, -Math.PI / 2, Math.PI / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(-2, 0, 9, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.beginPath(); for (let k = 1; k < 12; k++) { const a = -Math.PI / 2 + k / 12 * Math.PI, r0 = k % 3 ? 23 : 19; ctx.moveTo(-2 + Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(-2 + Math.cos(a) * 28, Math.sin(a) * 28); } ctx.stroke();
  }
}
// Le compas : fermé quand il marche ; ouvert, la pointe plantée au centre et la mine (lui) sur le cercle
function drawCompas(e, fr, fl) {
  const j = (fr - 1) * 0.8;
  if (e.phase === 'walk') {
    ctx.rotate(e.rot);
    ctx.strokeStyle = fl ? C.red : '#7d7f88'; ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.moveTo(0, -24); ctx.lineTo(-4 + j, 20); ctx.moveTo(0, -24); ctx.lineTo(4, 16 + j); ctx.stroke();
    ctx.fillStyle = C.wood; ctx.fillRect(2, 12, 5, 9); ctx.fillStyle = C.graphite; ctx.fillRect(3.5, 21, 2, 3);
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(0, -26, 5, 0, TAU); ctx.fill(); ctx.fillRect(-1.5, -38, 3, 10);
    return;
  }
  const px = e.cx - e.x, py = e.cy - e.y, mx = px / 2, my = py / 2, len = Math.hypot(px, py) || 1;
  const hx = mx, hy = my - Math.max(30, len * 0.38);
  if (e.phase === 'open') {   // le cercle qu'il va tracer, annoncé en pointillés
    ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.45; ctx.setLineDash([7, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(px, py, e.Rt, 0, TAU); ctx.stroke(); ctx.restore();
  }
  ctx.strokeStyle = fl ? C.red : '#7d7f88'; ctx.lineWidth = 3.4;
  ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(px, py); ctx.moveTo(hx, hy); ctx.lineTo(0, -8); ctx.stroke();
  ctx.fillStyle = C.wood; ctx.beginPath(); ctx.arc(0, -7, 4.5, 0, TAU); ctx.fill();
  ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(hx, hy, 5.5, 0, TAU); ctx.fill(); ctx.fillRect(hx - 1.5, hy - 13, 3, 9);
}
function drawRegle(e, fr, fl) {
  const enraged = e.hp < e.maxHp / 2;
  if (e.phase === 'spinWarn') { ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 18); ctx.setLineDash([14, 10]); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, REGLE.L / 2, 0, TAU); ctx.stroke(); ctx.restore(); }
  if (e.phase === 'lift') {   // l'ombre de la règle là où elle va s'abattre
    const k = 1 - clamp(e.pt / 1.1, 0, 1);
    ctx.save(); ctx.translate(e.sx - e.x, e.sy - e.y); ctx.rotate(e.srot);
    ctx.fillStyle = 'rgba(46,46,51,' + (0.08 + 0.18 * k) + ')'; ctx.fillRect(-REGLE.L / 2, -REGLE.w / 2, REGLE.L, REGLE.w);
    ctx.strokeStyle = C.red; ctx.globalAlpha = 0.5 + 0.4 * Math.sin(G.time * 22); ctx.setLineDash([16, 10]); ctx.lineWidth = 3; ctx.strokeRect(-REGLE.L / 2, -REGLE.w / 2, REGLE.L, REGLE.w);
    ctx.restore();
    ctx.globalAlpha *= Math.max(0, 1 - k * 1.6);
    ctx.scale(1 + k * 0.25, 1 + k * 0.25);
  }
  const wob = (fr - 1) * 0.6;
  ctx.save(); ctx.rotate(e.rot);
  const L = REGLE.L, w = REGLE.w;
  ctx.fillStyle = fl ? '#e8b4b8' : enraged ? '#c7b7b9' : '#c4c8d0'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-L / 2, -w / 2 + wob); ctx.lineTo(L / 2, -w / 2); ctx.lineTo(L / 2 + wob, w / 2); ctx.lineTo(-L / 2, w / 2 - wob); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.fillRect(-L / 2 + 6, -w / 2 + 5, L - 12, 6);
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.4; ctx.beginPath();
  for (let i = 0; i <= 100; i++) { const x = -L / 2 + 20 + i * (L - 40) / 100, h = i % 10 === 0 ? 16 : i % 5 === 0 ? 11 : 6; ctx.moveTo(x, w / 2); ctx.lineTo(x, w / 2 - h); }
  ctx.stroke();
  ctx.fillStyle = C.graphite; ctx.font = '700 15px ' + FONT_MAIN; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (let i = 0; i <= 10; i++) if (Math.abs(i - 5) > 1) ctx.fillText(String(i), -L / 2 + 20 + i * (L - 40) / 10, w / 2 - 25);
  ctx.restore();
  // l'œil, au milieu de la règle
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x), ex = Math.cos(la) * 6, ey = Math.sin(la) * 6;
  ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(0, 0, 21, 14, e.rot, 0, TAU); ctx.fill();
  ctx.strokeStyle = enraged ? C.red : C.graphite; ctx.lineWidth = 3; ctx.stroke();
  ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(ex, ey, 6.5, 0, TAU); ctx.fill();
}
// Les graduations tirées (règle, rapporteur) : de petits « ° » rouges, annoncés en pointillés
function drawDegBullets() {
  ctx.save(); ctx.lineWidth = 2.6; ctx.strokeStyle = C.red;
  for (const b of G.ebul) {
    if (!b.deg) continue;
    ctx.globalAlpha = b.wait > 0 ? 0.2 + 0.2 * Math.sin(G.time * 20) : 1;
    ctx.beginPath(); ctx.arc(b.x, b.y, 5.5, 0, TAU); ctx.stroke();
    if (b.wait <= 0) { const n = Math.hypot(b.vx, b.vy) || 1; ctx.beginPath(); ctx.moveTo(b.x - b.vx / n * 9, b.y - b.vy / n * 9); ctx.lineTo(b.x - b.vx / n * 16, b.y - b.vy / n * 16); ctx.stroke(); }
  }
  ctx.restore();
}
function drawLines() {
  for (const l of G.lines) {
    const live = l.t >= l.warn, k = live ? clamp((l.t - l.warn) / (l.act + 0.4), 0, 1) : 0;
    ctx.save(); ctx.lineCap = 'round';
    if (!live) { ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 24); ctx.setLineDash([10, 9]); ctx.lineWidth = 2.5; }
    else { ctx.strokeStyle = C.red; ctx.globalAlpha = 1 - k; ctx.lineWidth = 7 * (1 - k) + 2; }
    ctx.beginPath();
    for (const a of [l.a, l.a + l.side * Math.PI / 2]) { ctx.moveTo(l.x, l.y); ctx.lineTo(l.x + Math.cos(a) * l.len, l.y + Math.sin(a) * l.len); }
    ctx.stroke();
    ctx.setLineDash([]); ctx.lineWidth = 2; ctx.translate(l.x, l.y); ctx.rotate(l.a); ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(18, l.side * 18); ctx.lineTo(0, l.side * 18); ctx.stroke();
    ctx.restore();
  }
}
