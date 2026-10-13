// Chapitre V : la page de calligraphie. Ratures à la plume (délié, plume d'oie, arabesque, majuscule) et le Grand Paraphe.
// Les traits d'encre (`G.strokes`) sèchent lentement : tant qu'ils sont frais, ils brûlent qui les touche.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

/* ===================== La page ===================== */
const NOTES_CALLI = [
  { x: WORLD.w / 2, y: -150, t: '— chapitre V : la page de calligraphie —', r: -0.02 },
  { x: WORLD.w * 0.7, y: -96, t: 'ajouté : la calligraphie (c’est fait, à la plume)', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'la page de garde ?', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'pleins', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'et déliés', r: -0.05 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'penche ta plume à 45°', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: '(TODO : ne pas faire de pâtés… trop tard)', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'signé : ?', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'cf. ch. IV, le buvard', r: 0.05 },
  { x: WORLD.w * 0.3, y: -96, t: '« citation » (c’est fait, entre guillemets)', r: -0.02 },
  { x: -180, y: WORLD.h * 0.72, t: 'une union à trois mots ?', r: -0.06 }
];
const DICTEES_CALLI = ['PLEIN', 'DÉLIÉ', 'ENCRE', 'PLUMIER', 'ENCRIER', 'LETTRINE', 'ARABESQUE', 'MAJUSCULE', 'ENLUMINURE', 'CALLIGRAPHIE'];
const CALLI_TYPES = new Set(['delie', 'plumeoie', 'arabesque', 'majuscule']);
Object.assign(ETYPES, {
  delie:     { r: 14, hp: 3.5, speed: 112, dmg: 1, xp: 1, agil: 4 },
  plumeoie:  { r: 18, hp: 9, speed: 74, dmg: 1, xp: 3, agil: 3 },
  arabesque: { r: 17, hp: 14, speed: 120, dmg: 1, xp: 4, agil: 2.2 },
  majuscule: { r: 28, hp: 26, speed: 36, dmg: 1, xp: 6, agil: 1.4 },
  paraphe:   { r: 66, hp: 1400, speed: 48, dmg: 2, xp: 140, agil: 1.2, boss: true }
});

CHAPTERS.push({
  num: 'V', name: 'La page de calligraphie', done: 'La page de calligraphie : signée.', paper: 'calli', notes: NOTES_CALLI, dictees: DICTEES_CALLI,
  intro: 'Chapitre V : la page de calligraphie. Pleins et déliés…', boss: 'paraphe', bossName: 'Le Grand Paraphe',
  bossIntro: 'Une signature immense s’avance sur la page…', bossBack: 'Le Grand Paraphe revient signer la page.', bossSound: 'boss5',
  scale: 10.5, rateOff: 180, rateCap: 13, waveCap: 'Une volée de déliés !',
  meet: {
    delie: 'Nouveau : le délié, fin comme un cheveu',
    plumeoie: 'Nouveau : la plume d’oie. Elle vise… et crache son encre !',
    arabesque: 'Nouveau : l’arabesque. Son encre fraîche brûle, ne marche pas dessus !',
    majuscule: 'Nouveau : la majuscule, et sa couronne de fleurons'
  },
  pick(t, r) {   // pas plus de trois majuscules ni de quatre arabesques à la fois : leurs fleurs et leurs boucles d'encre suffisent
    if (t > 90 && r < 0.07 && G.enemies.filter(e => e.type === 'majuscule').length < 3) return 'majuscule';
    if (t > 50 && r < 0.13 && G.enemies.filter(e => e.type === 'arabesque').length < 4) return 'arabesque';
    return t > 25 && r < 0.34 ? 'plumeoie' : 'delie';
  },
  wave(t, i) { return t > 70 && i % 4 === 0 ? 'plumeoie' : 'delie'; }
});

const INK = '#3a2418', INK_FL = '#e0606a', GOLD_LEAF = '#e2b33c';
const BIG_LETTERS = [
  { x: 470, y: 470, ch: 'A', r: -0.08 }, { x: 2350, y: 520, ch: 'Q', r: 0.06 },
  { x: 1500, y: 1330, ch: 'R', r: -0.04 }, { x: 640, y: 1560, ch: 'E', r: 0.05 }, { x: 2420, y: 1580, ch: 'S', r: -0.06 }
];
const BAND = 192;   // une ligne d'écriture : hampe, hauteur d'x, ligne de base, jambage
function drawCalli(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = 'rgba(236,218,170,0.2)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // un papier vergé, crème
  for (const L of BIG_LETTERS) if (L.x + 260 > v.x0 && L.x - 260 < v.x1 && L.y + 260 > v.y0 && L.y - 260 < v.y1) txt(L.ch, L.x, L.y, 380, { font: FONT_CURSIVE, weight: 400, color: 'rgba(201,146,27,0.09)', rot: L.r });
  const lw = 1 / ZOOM;
  ctx.lineWidth = lw * 1.2;
  ctx.strokeStyle = 'rgba(150,110,70,0.28)'; ctx.beginPath();
  for (let b = Math.floor(y0 / BAND) * BAND; b <= y1; b += BAND) for (const o of [40, 92, 140]) { const y = b + o; if (y < y0 || y > y1) continue; ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
  ctx.stroke();
  ctx.strokeStyle = 'rgba(150,110,70,0.5)'; ctx.lineWidth = lw * 1.8; ctx.beginPath();   // la ligne de base, plus marquée
  for (let b = Math.floor(y0 / BAND) * BAND; b <= y1; b += BAND) { const y = b + 140; if (y < y0 || y > y1) continue; ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
  ctx.stroke();
  // les obliques de pente, à 55°
  if (ZOOM > 0.7) {
    const k = 1 / Math.tan(55 * Math.PI / 180), h = y1 - y0;
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, x1 - x0, h); ctx.clip();
    ctx.strokeStyle = 'rgba(150,110,70,0.13)'; ctx.lineWidth = lw; ctx.beginPath();
    for (let c = Math.floor(x0 / 96) * 96; c <= x1 + h * k; c += 96) { ctx.moveTo(c, y0); ctx.lineTo(c - h * k, y1); }
    ctx.stroke(); ctx.restore();
  }
  ctx.strokeStyle = C.margin; ctx.lineWidth = 2.2 / ZOOM; ctx.beginPath(); ctx.moveTo(MARGIN_X, Math.max(0, v.y0)); ctx.lineTo(MARGIN_X, Math.min(WORLD.h, v.y1)); ctx.stroke();
}

/* ===================== L'encre des plumes ===================== */
// Une plume tenue à 45° : le trait est plein quand il descend vers la droite, délié quand il monte
const NIB = -Math.PI / 4;
const nibW = (ax, ay, bx, by, w) => w * (0.25 + 0.75 * Math.abs(Math.sin(Math.atan2(by - ay, bx - ax) - NIB)));
const STROKE_HOT = 0.2, STROKE_MAX = 700;
function inkStroke(life, owner) { const s = { pts: [], life, owner, done: false }; G.strokes.push(s); return s; }
function strokeCount() { let n = 0; for (const s of G.strokes) n += s.pts.length; return n; }
function addStrokePt(s, x, y) {
  const P = s.pts, last = P[P.length - 1];
  if (last && (last.x - x) ** 2 + (last.y - y) ** 2 < 10 * 10) return;
  if (G.strokeN >= STROKE_MAX) return;
  P.push({ x, y, b: G.t }); G.strokeN++;
  if (last && P.length % 3 === 0) inkLine(last.x, last.y, x, y, 0.06, 6);   // l'encre marque la page, puis elle sèche
}
function inkLine(x1, y1, x2, y2, alpha, width) {
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.globalAlpha = alpha; sctx.strokeStyle = INK; sctx.lineWidth = width; sctx.lineCap = 'round';
  sctx.beginPath(); sctx.moveTo(x1, y1); sctx.lineTo(x2, y2); sctx.stroke(); sctx.restore();
}
function stepStrokes() {
  const p = G.p, R = (p.r + 8) ** 2;
  let n = 0;
  for (const s of G.strokes) {
    if (s.owner && s.owner.dead) s.done = true;
    const P = s.pts;
    let k = 0; while (k < P.length && G.t - P[k].b > s.life) k++;
    if (k) P.splice(0, k);
    n += P.length;
    if (p.inv > 0 || p.dashT > 0) continue;
    for (const q of P) if (G.t - q.b >= STROKE_HOT && (q.x - p.x) ** 2 + (q.y - p.y) ** 2 < R) { hurtPlayer(1, q.x, q.y); break; }
  }
  G.strokeN = n;
  G.strokes = G.strokes.filter(s => s.pts.length || !s.done);
}
function eraseStrokes(x, y, r) {
  for (const s of G.strokes) s.pts = s.pts.filter(q => (q.x - x) ** 2 + (q.y - y) ** 2 > r * r);
}

/* ===================== Les ratures à la plume ===================== */
const ORBIT = 230;
function stepCalli(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  const s = e.speed * slow;
  if (e.type === 'delie') {   // il zigzague, comme une main qui hésite
    const side = Math.sin(G.t * 6 + e.id) > 0 ? 1 : -1;
    MV.x = (dx / d - dy / d * side * 0.75) * s; MV.y = (dy / d + dx / d * side * 0.75) * s;
    e.rot = Math.atan2(MV.y, MV.x);
  } else if (e.type === 'arabesque') {   // elle tourne autour de toi en faisant des boucles, et laisse son encre derrière elle
    if (!e.stroke) { e.stroke = inkStroke(2.3, e); e.side = e.id % 2 ? 1 : -1; }
    e.rot += dt * 3.4 * e.side;
    if (d < 620) {
      const k = clamp((d - ORBIT) / ORBIT, -1, 1) * 1.1;
      MV.x = (-dy / d * e.side + dx / d * k + Math.cos(e.rot) * 0.95) * s;
      MV.y = (dx / d * e.side + dy / d * k + Math.sin(e.rot) * 0.95) * s;
      MV.agil = 6;
      addStrokePt(e.stroke, e.x, e.y);
    }
  } else if (e.type === 'plumeoie') {   // elle s'arrête, vise, puis crache trois gouttes d'encre
    e.pt -= dt; e.rot = Math.sin(G.t * 2.4 + e.id) * 0.3;
    if (e.phase === 'walk') {
      if (d < 260) { MV.x *= -0.3; MV.y *= -0.3; }
      if (e.pt <= 0 && d < 430 && !hid) { e.phase = 'aim'; e.pt = 0.65; e.aimA = Math.atan2(dy, dx); AU.play('quill'); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else {
      MV.x = 0; MV.y = 0; e.aimA += clamp(Math.atan2(dy, dx) - e.aimA, -dt, dt) * 0.8;
      if (e.pt <= 0) {
        for (let i = 0; i < 3; i++) { const a = e.aimA + (i - 1) * 0.07; G.ebul.push({ x: e.x + Math.cos(a) * 26, y: e.y + Math.sin(a) * 26, vx: Math.cos(a) * 300, vy: Math.sin(a) * 300, life: 3, a, ink: true, wait: i * 0.13 }); }
        AU.play('spitInk'); e.phase = 'walk'; e.pt = rnd(2.4, 3.2);
      }
    }
  } else if (e.type === 'majuscule') {   // elle avance, s'enlumine, et sa couronne de fleurons s'envole
    e.pt -= dt;
    if (e.phase === 'walk') { if (e.pt <= 0 && d < 680 && !hid) { e.phase = 'glow'; e.pt = 0.75; AU.play('fleurWarn'); } else if (e.pt <= 0) e.pt = 0.6; }
    else {
      MV.x = 0; MV.y = 0;
      if (e.pt <= 0) {
        const off = rnd(TAU);
        for (let i = 0; i < 10; i++) { const a = off + i / 10 * TAU; G.ebul.push({ x: e.x + Math.cos(a) * 34, y: e.y + Math.sin(a) * 34, vx: Math.cos(a) * 175, vy: Math.sin(a) * 175, life: 4, a, fleur: true }); }
        AU.play('fleur'); e.phase = 'walk'; e.pt = rnd(3.2, 4.2);
      }
    }
  }
}

/* ===================== Le Grand Paraphe ===================== */
const PARAPHE = { warn: 1.0, dur: 1.25, life: 2.6, loops: 3, R: 92 };
// La signature part du patron, passe près de toi et file plus loin, en faisant des boucles (une cycloïde allongée)
function startSig(e, again) {
  const p = G.p, a = Math.atan2(p.y - e.y, p.x - e.x) + rnd(-0.25, 0.25);
  const L = clamp(Math.hypot(p.x - e.x, p.y - e.y) + 380, 640, 1300), ux = Math.cos(a), uy = Math.sin(a), side = rand() < 0.5 ? 1 : -1;
  const pts = [], n = 96;
  for (let i = 0; i <= n; i++) {
    const u = i / n, th = TAU * PARAPHE.loops * u;
    const al = L * u + PARAPHE.R * Math.sin(th), pe = side * (PARAPHE.R * (1 - Math.cos(th)) * 0.75 - Math.sin(Math.PI * u) * 70);
    pts.push({ x: clamp(e.x + ux * al - uy * pe, 40, WORLD.w - 40), y: clamp(e.y + uy * al + ux * pe, 40, WORLD.h - 40) });
  }
  const sig = { pts, t: 0, u: 0, warn: PARAPHE.warn * (again ? 0.75 : 1), dur: PARAPHE.dur, again: !!again, sound: false, e };
  sig.stroke = inkStroke(PARAPHE.life, null);
  G.sigs.push(sig); e.sig = sig; e.phase = 'sign';
  AU.play('signWarn');
  if (!G.sigSeen) { G.sigSeen = true; caption('Il va signer : écarte-toi de la ligne !', 2.6, 'pink'); }
}
function sigAt(s, k) {
  const f = k * (s.pts.length - 1), i = Math.min(s.pts.length - 2, Math.floor(f)), r = f - i, a = s.pts[i], b = s.pts[i + 1];
  return { x: lerp(a.x, b.x, r), y: lerp(a.y, b.y, r) };
}
function stepParaphe(e, dt, dx, dy, d, slow) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  if (e.enter > 0) e.enter = Math.max(0, e.enter - dt * 0.5);
  const enraged = e.hp < e.maxHp / 2;
  e.rot = Math.sin(G.t * 1.5) * 0.12;
  if (e.phase === 'sign') {   // il suit sa signature d'un seul trait
    MV.x = 0; MV.y = 0; MV.agil = 30; e.vx = 0; e.vy = 0;
    const s = e.sig; s.t += dt;
    if (s.t < s.warn) return;
    if (!s.sound) { s.sound = true; AU.play('sign'); }
    const k = clamp((s.t - s.warn) / s.dur, 0, 1);
    for (let u = s.u; u < k; u += 0.006) { const q = sigAt(s, u); addStrokePt(s.stroke, q.x, q.y); }
    s.u = k;
    const q = sigAt(s, k); e.x = q.x; e.y = q.y; e.rot = 0.5;
    if (k >= 1) {
      s.stroke.done = true; G.sigs = G.sigs.filter(x => x !== s);
      if (enraged && !s.again) startSig(e, true);
      else { e.phase = 'walk'; e.atk = enraged ? 1.3 : 1.7; }
    }
    return;
  }
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % (enraged ? 4 : 3);
  if (m === 1) startSig(e, false);
  else if (m === 2) { pleinsDelies(e, enraged); e.atk = enraged ? 2.1 : 2.6; }
  else if (m === 0 && !enraged || m === 3) { pointsSurLesI(enraged ? 5 : 3); e.atk = enraged ? 2.2 : 2.5; }
  else {   // colère : il appelle déliés et arabesques
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + G.t; spawnEnemy(i % 3 === 0 ? 'arabesque' : 'delie', e.x + Math.cos(a) * 160, e.y + Math.sin(a) * 160); }
    caption('Le Grand Paraphe appelle ses déliés !', 1.8, 'pink'); e.atk = 2;
  }
}
// Pleins et déliés : une couronne qui alterne de grosses gouttes lentes et des traits fins et rapides
function pleinsDelies(e, enraged) {
  const rings = enraged ? 2 : 1;
  for (let r = 0; r < rings; r++) {
    const n = 16, off = rnd(TAU);
    for (let i = 0; i < n; i++) {
      const a = off + i / n * TAU, big = i % 2 === 0, sp = big ? 150 : 270;
      G.ebul.push({ x: e.x + Math.cos(a) * 70, y: e.y + Math.sin(a) * 70, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 4.5, a, ink: big, big, wait: r * 0.45 });
    }
  }
  AU.play('pleins');
}
// Le point sur le i : de gros points d'encre tombent là où tu vas
function pointsSurLesI(n) {
  const p = G.p;
  for (let i = 0; i < n; i++) {
    const lead = 0.45 + i * 0.3, x = clamp(p.x + p.vx * lead + rnd(-40, 40), 30, WORLD.w - 30), y = clamp(p.y + p.vy * lead + rnd(-40, 40), 30, WORLD.h - 30);
    G.drops.push({ x, y, t: -i * 0.32, fall: 1.0, r: 58, done: false, ink: true });
  }
  AU.play('rain');
}

function stepCalliFx() {
  if (G.sigs.length) G.sigs = G.sigs.filter(s => { if (!s.e.dead) return true; s.stroke.done = true; return false; });   // biffé en pleine signature
  stepStrokes();
}
// Pour le pilote automatique : l'encre fraîche et la signature annoncée, près du joueur
function calliNear(px, py) {
  const out = [], R = 420 * 420;
  for (const s of G.strokes) for (const q of s.pts) if ((q.x - px) ** 2 + (q.y - py) ** 2 < R) out.push({ x: q.x, y: q.y, w: 520 });
  for (const s of G.sigs) for (let i = Math.floor(s.u * (s.pts.length - 1)); i < s.pts.length; i++) { const q = s.pts[i]; if ((q.x - px) ** 2 + (q.y - py) ** 2 < R) out.push({ x: q.x, y: q.y, w: 900 }); }
  return out;
}
function calliDanger(x, y, list) {
  let s = 0;
  for (const q of list) { const d2 = (q.x - x) ** 2 + (q.y - y) ** 2; if (d2 < 160 * 160) s += q.w / Math.pow(Math.max(6, Math.sqrt(d2)), 1.4); }
  return s;
}

/* ===================== Dessin ===================== */
function drawNibPath(P, w) {
  for (let i = 1; i < P.length; i++) {
    const a = P[i - 1], b = P[i];
    ctx.lineWidth = nibW(a.x, a.y, b.x, b.y, w); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
}
// Une plume d'oie, la pointe vers le bas (+y)
function drawQuill(L, fl) {
  const w = L * 0.2;
  ctx.fillStyle = fl ? '#ffd6d6' : '#f6f1e3'; ctx.strokeStyle = C.graphite; ctx.lineWidth = Math.max(1.5, L * 0.035); ctx.lineJoin = 'round';
  ctx.beginPath(); ctx.moveTo(0, -L); ctx.quadraticCurveTo(w * 1.4, -L * 0.62, w * 0.5, -L * 0.1); ctx.lineTo(0, -L * 0.06); ctx.lineTo(-w * 0.35, -L * 0.12); ctx.quadraticCurveTo(-w * 1.1, -L * 0.6, 0, -L); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(46,46,51,0.4)'; ctx.lineWidth = Math.max(1, L * 0.015); ctx.beginPath();
  for (let k = 1; k <= 6; k++) { const y = -L * (0.16 + k * 0.11); ctx.moveTo(0, y + L * 0.04); ctx.lineTo(w * 0.85, y - L * 0.03); ctx.moveTo(0, y + L * 0.04); ctx.lineTo(-w * 0.65, y - L * 0.02); }
  ctx.stroke();
  ctx.strokeStyle = C.graphite; ctx.lineWidth = Math.max(1.5, L * 0.035); ctx.beginPath(); ctx.moveTo(0, -L * 0.96); ctx.lineTo(0, L * 0.16); ctx.stroke();
  ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-L * 0.055, L * 0.1); ctx.lineTo(L * 0.055, L * 0.1); ctx.lineTo(0, L * 0.34); ctx.closePath(); ctx.fill();
}
function drawCalliEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const j = (fr - 1) * 0.8;
  if (e.type === 'delie') {   // un trait qui s'affine : plein à la tête, délié à la queue
    ctx.rotate(e.rot);
    ctx.fillStyle = fl ? INK_FL : INK;
    ctx.beginPath(); ctx.moveTo(18, -1); ctx.quadraticCurveTo(6, -9 - j, -8, -4); ctx.quadraticCurveTo(-18, -1, -26, 5 + j); ctx.quadraticCurveTo(-14, 1, -6, 3); ctx.quadraticCurveTo(8, 6 + j, 18, -1); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = fl ? INK_FL : INK; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-26, 5 + j); ctx.quadraticCurveTo(-34, 9, -38, 3 - j); ctx.stroke();
  } else if (e.type === 'plumeoie') {
    if (e.phase === 'aim') { ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.35 + 0.3 * Math.sin(G.time * 30); ctx.setLineDash([10, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(e.aimA) * 260, Math.sin(e.aimA) * 260); ctx.stroke(); ctx.restore(); }
    ctx.rotate(e.phase === 'aim' ? e.aimA - Math.PI / 2 + Math.sin(G.time * 40) * 0.05 : e.rot + Math.PI * 0.85);
    ctx.translate(0, 8); drawQuill(36 + j, fl);
  } else if (e.type === 'arabesque') {   // une spirale qui tourne sur elle-même, avec un panache
    ctx.rotate(e.rot); ctx.strokeStyle = fl ? INK_FL : INK;
    const P = [];
    for (let i = 0; i <= 22; i++) { const t = i / 22, a = t * 3.4 * Math.PI, r = 2 + t * (17 + j); P.push({ x: Math.cos(a) * r, y: Math.sin(a) * r }); }
    P.push({ x: 26, y: -6 }); P.push({ x: 32, y: -16 });
    drawNibPath(P, 6);
    ctx.fillStyle = fl ? INK_FL : INK; ctx.beginPath(); ctx.arc(32, -16, 3, 0, TAU); ctx.fill();
  } else if (e.type === 'majuscule') {   // une lettre ornée dans son cadre, rouge et or
    const glow = e.phase === 'glow';
    if (glow) { ctx.save(); ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 24); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(0, 0, 46, 0, TAU); ctx.stroke(); ctx.restore(); }
    ctx.rotate(Math.sin(G.time * 1.6 + e.id) * 0.06);
    const s = 27 + j;
    ctx.fillStyle = fl ? '#ffdede' : glow ? '#fff3c4' : '#fbf3dc'; ctx.fillRect(-s, -s, s * 2, s * 2);
    ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.strokeRect(-s, -s, s * 2, s * 2);
    ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]); ctx.strokeRect(-s + 5, -s + 5, s * 2 - 10, s * 2 - 10); ctx.setLineDash([]);
    ctx.fillStyle = C.gold; for (const [cx, cy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) { ctx.beginPath(); ctx.arc(cx * s, cy * s, 4, 0, TAU); ctx.fill(); }
    const ch = e.ch || (e.ch = 'ABCDEFGHIJKLMNOPQRSTUVZ'[e.id % 23]);
    ctx.fillStyle = fl ? '#fff' : C.red; ctx.font = '400 38px ' + FONT_CURSIVE; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(ch, 0, 3);
  }
}
const PARAPHE_SHAPE = (() => {
  const P = [];
  for (let i = 0; i <= 64; i++) { const t = i / 64, th = TAU * 2 * t; P.push({ x: -112 + 224 * t + 44 * Math.sin(th), y: -30 * (1 - Math.cos(th)) + 22 }); }
  return P;
})();
const PARAPHE_LINE = [{ x: -120, y: 54 }, { x: -40, y: 46 }, { x: 60, y: 50 }, { x: 128, y: 36 }, { x: 140, y: 18 }];
function drawParaphe(e, fr, fl) {
  const enraged = e.hp < e.maxHp / 2, wob = Math.sin(G.time * (enraged ? 6 : 3)), j = (fr - 1) * 1.5;
  ctx.save(); ctx.scale(1 + wob * 0.03, 1 - wob * 0.03);
  ctx.fillStyle = 'rgba(240,200,90,0.22)'; ctx.beginPath(); ctx.ellipse(0, 10, 150, 62, 0, 0, TAU); ctx.fill();   // un halo doré, comme une signature fraîche
  ctx.lineCap = 'round'; ctx.strokeStyle = fl ? INK_FL : enraged ? '#7a2618' : INK;
  drawNibPath(PARAPHE_SHAPE.map(q => ({ x: q.x, y: q.y + Math.sin(q.x * 0.05 + G.time * 4) * j })), 22);
  drawNibPath(PARAPHE_LINE, 16);
  ctx.restore();
  // les yeux, dans les deux boucles
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x), ex = Math.cos(la) * 5, ey = Math.sin(la) * 5;
  for (const sx of [-42, 42]) {
    ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(sx, -6, 15, 17, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = INK; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(sx + ex, -6 + ey, 6, 0, TAU); ctx.fill();
    if (enraged) { ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(sx - 16 * Math.sign(sx), -32); ctx.lineTo(sx + 14 * Math.sign(sx), -24); ctx.stroke(); }
  }
  // la plume qui signe
  ctx.save(); ctx.translate(70, -60); ctx.rotate(e.phase === 'sign' ? 0.2 + Math.sin(G.time * 30) * 0.1 : 0.55 + wob * 0.08); drawQuill(120, fl); ctx.restore();
}
function drawCalliFx(v) {
  // la signature annoncée : un trait rouge en pointillés, et la part déjà tracée
  for (const s of G.sigs) {
    const i0 = Math.floor(s.u * (s.pts.length - 1));
    ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = s.t < s.warn ? 0.35 + 0.3 * Math.sin(G.time * 22) : 0.3; ctx.setLineDash([12, 10]); ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(s.pts[i0].x, s.pts[i0].y); for (let i = i0 + 1; i < s.pts.length; i++) ctx.lineTo(s.pts[i].x, s.pts[i].y); ctx.stroke();
    ctx.restore();
  }
  // l'encre fraîche : pleins et déliés, qui pâlissent en séchant
  ctx.lineCap = 'round'; ctx.strokeStyle = INK;
  for (const s of G.strokes) {
    const P = s.pts;
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1], b = P[i];
      if (b.x < v.x0 - 30 || b.x > v.x1 + 30 || b.y < v.y0 - 30 || b.y > v.y1 + 30) continue;
      const age = G.t - b.b;
      ctx.globalAlpha = clamp((s.life - age) / 0.6, 0, 1) * (age < STROKE_HOT ? 0.5 : 0.92);
      ctx.lineWidth = nibW(a.x, a.y, b.x, b.y, 15); ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
  for (const b of G.ebul) {
    if (!b.ink && !b.fleur) continue;
    ctx.save(); ctx.translate(b.x, b.y); ctx.globalAlpha = b.wait > 0 ? 0.3 + 0.25 * Math.sin(G.time * 20) : 1;
    if (b.ink) {
      const r = b.big ? 9 : 7;
      ctx.rotate(b.a); ctx.fillStyle = INK; ctx.beginPath(); ctx.moveTo(-r * 1.9, 0); ctx.quadraticCurveTo(-r, -r, 0, -r); ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2); ctx.quadraticCurveTo(-r, r, -r * 1.9, 0); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.4)'; ctx.beginPath(); ctx.arc(r * 0.2, -r * 0.35, r * 0.28, 0, TAU); ctx.fill();
    } else {   // un fleuron : quatre pétales rouges et un cœur d'or
      ctx.rotate(G.time * 5 + b.a);
      ctx.fillStyle = C.red; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.ellipse(Math.cos(k * Math.PI / 2) * 5, Math.sin(k * Math.PI / 2) * 5, 5, 3, k * Math.PI / 2, 0, TAU); ctx.fill(); }
      ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(0, 0, 2.6, 0, TAU); ctx.fill();
    }
    ctx.restore();
  }
}
