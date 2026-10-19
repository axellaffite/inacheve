// Chapitre VII : le cahier de brouillon, première page du deuxième cahier. Papier recyclé à petits carreaux,
// couvert de calculs barrés et de dessins dans les coins ; ratures de brouillon (trombone, tache de café,
// taille-crayon, blanco) et le Stylo Rouge, qui corrige tout ce qui bouge. La partie de morpion est dans morpion.js.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const NOTES_BROU = [
  { x: WORLD.w / 2, y: -150, t: '— cahier n° 2 · chapitre VII : le brouillon —', r: -0.02 },
  { x: WORLD.w * 0.7, y: -96, t: 'ajouté : un deuxième cahier (c’est fait, et c’est un brouillon)', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'le cahier de vacances ?', r: 0.04 },
  { x: WORLD.w + 200, y: WORLD.h * 0.3 + 96, t: '→ oui : avec des labyrinthes !', r: 0.07 },
  { x: -185, y: WORLD.h * 0.45, t: 'ici, on a', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'le droit de rater', r: -0.05 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'frère Jacques, dormez-vous ?', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: '(ne pas recopier au propre)', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'O ou X ?', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: '2 + 2 = 5 ? non.', r: 0.05 },
  { x: WORLD.w * 0.3, y: -96, t: 'premier cahier : plein', r: -0.02 }
];
const DICTEES_BROU = ['OUPS', 'ESSAI', 'CALCUL', 'CROQUIS', 'MORPION', 'TROMBONE', 'BROUILLON', 'CORRECTION', 'GRIBOUILLIS', 'RECOMMENCER'];
const BROU_TYPES = new Set(['trombone', 'cafe', 'taillecrayon', 'blanco']);
Object.assign(ETYPES, {
  trombone:     { r: 15, hp: 4, speed: 128, dmg: 1, xp: 1, agil: 4 },
  cafe:         { r: 22, hp: 14, speed: 50, dmg: 1, xp: 4, agil: 1.8 },
  taillecrayon: { r: 20, hp: 22, speed: 58, dmg: 1, xp: 5, agil: 2.5 },
  blanco:       { r: 20, hp: 24, speed: 50, dmg: 1, xp: 6, agil: 2 },
  stylo:        { r: 62, hp: 1400, speed: 46, dmg: 2, xp: 180, agil: 1.2, boss: true }
});
const countType = t => G.enemies.reduce((n, e) => n + (e.type === t), 0);

CHAPTERS.push({
  num: 'VII', name: 'Le cahier de brouillon', done: 'Brouillon : tout est permis !', paper: 'brouillon', notes: NOTES_BROU, dictees: DICTEES_BROU,
  intro: 'Chapitre VII : le cahier de brouillon. Ici, on a le droit de rater…', boss: 'stylo', bossName: 'Le Stylo Rouge',
  bossIntro: 'Quelqu’un débouche un stylo rouge…', bossBack: 'Le Stylo Rouge revient corriger.', bossSound: 'boss7',
  scale: 32, rateOff: 220, rateCap: 19, waveCap: 'Une poignée de trombones !',
  meet: {
    trombone: 'Nouveau : le trombone, qui avance par bonds',
    cafe: 'Nouveau : la tache de café. Ses flaques collent aux pattes !',
    taillecrayon: 'Nouveau : le taille-crayon. Il mange tes lettres !',
    blanco: 'Nouveau : le blanco. Son ruban blanc brûle tant qu’il n’est pas sec !'
  },
  pick(t, r) {   // pas plus de trois blancos ni de trois taille-crayons à la fois
    if (t > 90 && r < 0.07 && countType('blanco') < 3) return 'blanco';
    if (t > 50 && r < 0.13 && countType('taillecrayon') < 3) return 'taillecrayon';
    return t > 25 && r < 0.21 ? 'cafe' : 'trombone';
  },
  wave(t, i) { return t > 70 && i % 5 === 0 ? 'cafe' : 'trombone'; }
});

/* ===================== Le papier ===================== */
// Des dessins et des calculs laissés là par quelqu'un d'autre : tirés une fois pour toutes, à part du hasard du jeu
const DOODLE_TEXTS = ['3 + 4 = 8', '12 × 3 = 36', '7 − 2 = 5', '144 : 12 = 12', 'essai n° 3', 'à revoir', 'PLUMME ?', 'mardi', '1, 2, 3… soleil', 'zéro + zéro = la tête à Toto', 'je m’appelle…', 'ne pas oublier', '9 × 7 = 63', 'brouillon'];
const DOODLE_KINDS = ['soleil', 'maison', 'fleur', 'bonhomme', 'spirale', 'coeur', 'etoile', 'nuage', 'morpion', 'texte', 'texte', 'texte'];
const DOODLES = (() => {
  const r = mulberry32(1212), out = [];
  for (let i = 0; i < 46; i++) {
    const kind = DOODLE_KINDS[Math.floor(r() * DOODLE_KINDS.length)];
    out.push({ kind, x: 140 + r() * (WORLD.w - 280), y: 120 + r() * (WORLD.h - 240), rot: (r() - 0.5) * 0.5, s: 0.8 + r() * 0.7, text: DOODLE_TEXTS[Math.floor(r() * DOODLE_TEXTS.length)], cross: r() < 0.45, k: Math.floor(r() * 512) });
  }
  return out;
})();
function drawBrouillon(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = 'rgba(206,196,168,0.2)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // papier recyclé, un peu gris
  ctx.strokeStyle = 'rgba(130,145,190,0.3)'; ctx.lineWidth = 1 / ZOOM; ctx.beginPath();   // petits carreaux
  for (let x = Math.ceil(x0 / 32) * 32; x <= x1; x += 32) { ctx.moveTo(x, y0); ctx.lineTo(x, y1); }
  for (let y = Math.ceil(y0 / 32) * 32; y <= y1; y += 32) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
  ctx.stroke();
  ctx.strokeStyle = C.margin; ctx.globalAlpha = 0.7; ctx.lineWidth = 2.2 / ZOOM; ctx.beginPath(); ctx.moveTo(MARGIN_X, y0); ctx.lineTo(MARGIN_X, y1); ctx.stroke(); ctx.globalAlpha = 1;
  for (const d of DOODLES) if (d.x + 160 > v.x0 && d.x - 160 < v.x1 && d.y + 100 > v.y0 && d.y - 100 < v.y1) drawDoodle(d);
}
function drawDoodle(d) {
  ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.globalAlpha = 0.32;
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (d.kind === 'texte') {
    ctx.restore(); txt(d.text, d.x, d.y, 30 * d.s, { color: C.graphite, weight: 400, rot: d.rot, alpha: 0.38 });
    if (!d.cross) return;
    ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.rot); ctx.globalAlpha = 0.4; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.5;
    const w = d.text.length * 7.5 * d.s;
    ctx.beginPath(); ctx.moveTo(-w, 2); for (let i = 1; i <= 10; i++) ctx.lineTo(-w + i * w / 5, (i % 2 ? -7 : 7) * d.s); ctx.stroke();
    ctx.restore(); return;
  }
  ctx.scale(d.s, d.s); ctx.beginPath();
  if (d.kind === 'soleil') { ctx.arc(0, 0, 18, 0, TAU); for (let i = 0; i < 9; i++) { const a = i / 9 * TAU; ctx.moveTo(Math.cos(a) * 25, Math.sin(a) * 25); ctx.lineTo(Math.cos(a) * 38, Math.sin(a) * 38); } }
  else if (d.kind === 'maison') { ctx.rect(-26, -10, 52, 40); ctx.moveTo(-34, -8); ctx.lineTo(0, -38); ctx.lineTo(34, -8); ctx.rect(-7, 10, 14, 20); ctx.rect(10, -2, 10, 9); }
  else if (d.kind === 'fleur') { for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; ctx.moveTo(Math.cos(a) * 10 + 9, Math.sin(a) * 10 - 20); ctx.arc(Math.cos(a) * 10, Math.sin(a) * 10 - 20, 9, 0, TAU); } ctx.moveTo(0, -10); ctx.quadraticCurveTo(-6, 14, 2, 36); ctx.moveTo(-1, 14); ctx.quadraticCurveTo(-16, 8, -18, 16); }
  else if (d.kind === 'bonhomme') { ctx.arc(0, -26, 11, 0, TAU); ctx.moveTo(0, -15); ctx.lineTo(0, 12); ctx.moveTo(-18, -6); ctx.lineTo(18, -6); ctx.moveTo(0, 12); ctx.lineTo(-12, 34); ctx.moveTo(0, 12); ctx.lineTo(12, 34); }
  else if (d.kind === 'spirale') { for (let i = 0; i <= 50; i++) { const a = i * 0.36, r = 2 + i * 0.7; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); } }
  else if (d.kind === 'coeur') { ctx.moveTo(0, 22); ctx.bezierCurveTo(-34, 0, -20, -28, 0, -10); ctx.bezierCurveTo(20, -28, 34, 0, 0, 22); }
  else if (d.kind === 'etoile') { for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 11 : 28; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); } }
  else if (d.kind === 'nuage') { ctx.arc(-18, 4, 14, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(0, -8, 18, Math.PI, 0); ctx.arc(20, 4, 14, Math.PI * 1.5, Math.PI * 0.5); ctx.lineTo(-18, 18); }
  else if (d.kind === 'morpion') {   // une vieille partie, déjà finie
    for (const o of [-14, 14]) { ctx.moveTo(o, -40); ctx.lineTo(o, 40); ctx.moveTo(-40, o); ctx.lineTo(40, o); }
    for (let i = 0; i < 9; i++) {
      const c = (d.k >> i) & 1, cx = (i % 3 - 1) * 28, cy = (Math.floor(i / 3) - 1) * 28;
      if (i === 4 || c) { ctx.moveTo(cx + 8, cy); ctx.arc(cx, cy, 8, 0, TAU); } else { ctx.moveTo(cx - 7, cy - 7); ctx.lineTo(cx + 7, cy + 7); ctx.moveTo(cx + 7, cy - 7); ctx.lineTo(cx - 7, cy + 7); }
    }
  }
  ctx.stroke(); ctx.restore();
}

/* ===================== Les ratures de brouillon ===================== */
const CAFE = { R: 66, life: 7, max: 16, slow: 0.55, grow: 0.6 };
const TAILLE = { reach: 230, pull: 170, eat: 18, spin: 0.6, n: 8 };
const BLANCO = { aim: 0.7, roll: 1.0, speed: 380, wet: 1.5, life: 4.2, max: 420, w: 11 };
function stepBrouillon(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  if (e.type === 'trombone') {   // il avance par bonds, comme un ressort
    const f = 0.3 + 1.4 * Math.max(0, Math.sin(G.t * 6 + e.id));
    MV.x *= f; MV.y *= f; e.rot = Math.atan2(dy, dx) + Math.sin(G.t * 6 + e.id) * 0.35;
  } else if (e.type === 'cafe') {   // elle s'arrête, et renverse une flaque qui colle
    e.pt -= dt; e.rot = Math.sin(G.t * 1.5 + e.id) * 0.2;
    if (e.pt <= 0 && d < 760) { spillCafe(e.x, e.y, CAFE.R + rnd(0, 16)); e.pt = rnd(3.4, 4.8); }
    else if (e.pt <= 0) e.pt = 0.6;
  } else if (e.type === 'taillecrayon') {   // il garde ses distances, aspire les lettres, puis crache ses copeaux en couronne
    e.pt -= dt;
    if (d < 250) { MV.x *= -0.5; MV.y *= -0.5; }
    eatLetters(e, dt);
    if (e.phase === 'walk') {
      e.rot += dt * 2;
      if (e.pt <= 0 && d < 560 && !hid) { e.phase = 'spin'; e.pt = TAILLE.spin; AU.play('sharpen'); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else {
      MV.x = 0; MV.y = 0; e.rot += dt * 16;
      if (e.pt <= 0) {
        const off = e.rot;
        for (let i = 0; i < TAILLE.n; i++) { const a = off + i / TAILLE.n * TAU; G.ebul.push({ x: e.x + Math.cos(a) * 22, y: e.y + Math.sin(a) * 22, vx: Math.cos(a) * 190, vy: Math.sin(a) * 190, life: 3.2, a, copeau: true }); }
        e.phase = 'walk'; e.pt = rnd(2.6, 3.4);
      }
    }
  } else if (e.type === 'blanco') {   // il vise, puis roule tout droit en déroulant son ruban blanc
    e.pt -= dt;
    if (e.phase === 'walk') {
      e.rot = Math.atan2(dy, dx);
      if (e.pt <= 0 && d < 520 && !hid) { e.phase = 'aim'; e.pt = BLANCO.aim; e.aimA = Math.atan2(dy, dx); AU.play('combWarn'); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else if (e.phase === 'aim') {
      MV.x = 0; MV.y = 0; e.rot = e.aimA;
      if (e.pt <= 0) { e.phase = 'roll'; e.pt = BLANCO.roll; e.tape = { pts: [], owner: e, done: false }; G.tapes.push(e.tape); AU.play('tape'); }
    } else {
      const c = Math.cos(e.aimA), sn = Math.sin(e.aimA);
      MV.x = c * BLANCO.speed; MV.y = sn * BLANCO.speed; MV.agil = 30; e.rot = e.aimA;
      addTapePt(e.tape, e.x - c * 16, e.y - sn * 16);
      if (e.pt <= 0) { e.tape.done = true; e.tape = null; e.phase = 'walk'; e.pt = rnd(3, 4); }
    }
  }
}
function spillCafe(x, y, R) {
  if (G.cafes.length >= CAFE.max) G.cafes.shift();
  G.cafes.push({ x, y, R, r: 0, t: 0, life: CAFE.life, seed: rnd(TAU) });
  AU.play('cafe');
}
// Dans une flaque de café, la goutte avance moins vite
function cafeSlow(x, y) {
  for (const c of G.cafes) if ((x - c.x) ** 2 + (y - c.y) ** 2 < c.r * c.r) return CAFE.slow;
  return 1;
}
function eatLetters(e, dt) {
  let eaten = 0;
  for (const it of G.items) {
    if (it.pull) continue;
    const dx = e.x - it.x, dy = e.y - it.y, d2 = dx * dx + dy * dy;
    if (d2 > TAILLE.reach * TAILLE.reach) continue;
    const d = Math.sqrt(d2) || 1;
    if (d < TAILLE.eat) { it.eaten = true; eaten++; continue; }
    it.x += dx / d * TAILLE.pull * dt; it.y += dy / d * TAILLE.pull * dt;
  }
  if (!eaten) return;
  e.eaten = Math.min(30, (e.eaten || 0) + eaten);
  G.items = G.items.filter(it => !it.eaten);
  AU.play('crunch');
}
function addTapePt(tp, x, y) {
  const P = tp.pts, last = P[P.length - 1];
  if (last && (last.x - x) ** 2 + (last.y - y) ** 2 < 10 * 10) return;
  if (G.tapeN >= BLANCO.max) return;
  P.push({ x, y, b: G.t }); G.tapeN++;
  eraseStain(x, y, 22);   // le blanc recouvre l'encre…
  const R2 = 24 * 24; let gone = false;   // … et les lettres qui traînaient dessous
  for (const it of G.items) if (!it.pull && (it.x - x) ** 2 + (it.y - y) ** 2 < R2) { it.eaten = true; gone = true; }
  if (gone) G.items = G.items.filter(it => !it.eaten);
}
// Une rature de brouillon biffée : le café se renverse, le taille-crayon rend ce qu'il a mangé
function brouillonDeath(e) {
  if (e.type === 'cafe') spillCafe(e.x, e.y, CAFE.R + 30);
  else if (e.type === 'taillecrayon' && e.eaten) {
    for (let i = 0; i < Math.min(14, e.eaten); i++) dropLetter(e.x + rnd(-14, 14), e.y + rnd(-14, 14), 1);
    if (e.eaten >= 6) caption('Le taille-crayon rend tes lettres !', 1.6, 'green');
  }
}

/* ===================== Le Stylo Rouge ===================== */
const STYLO = { faute: 1.0, fauteR: 64, bar: 0.9, barAct: 0.3, barLen: 1300, barGap: 125, zeroR: 300, zeroWarn: 0.8, zeroDur: 2.1, zeroGap: 0.95 };
function stepStylo(e, dt, dx, dy, d, slow) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  if (e.enter > 0) e.enter = Math.max(0, e.enter - dt * 0.5);
  const enraged = e.hp < e.maxHp / 2, p = G.p;
  e.pt -= dt; e.write = Math.max(0, (e.write || 0) - dt * 2);
  // la pointe écrit en rouge sur la page, partout où il passe
  const tx = e.x + 42, ty = e.y + 106;
  if (e.lx !== undefined && (e.lx - tx) ** 2 + (e.ly - ty) ** 2 > 14 * 14) { redLine(e.lx, e.ly, tx, ty, 0.07, 3); e.lx = tx; e.ly = ty; }
  else if (e.lx === undefined) { e.lx = tx; e.ly = ty; }
  if (e.phase === 'write') { MV.x = 0; MV.y = 0; e.write = 1; if (e.pt <= 0) { e.phase = 'walk'; e.atk = enraged ? 1.2 : 1.7; } return; }
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % (enraged ? 4 : 3);
  if (m === 1) {   // « faute ! » : des cercles rouges autour de toi
    const n = enraged ? 6 : 4;
    for (let i = 0; i < n; i++) {
      const a = rnd(TAU), r = i ? rnd(90, 270) : 0, ox = i ? 0 : p.vx * 0.6, oy = i ? 0 : p.vy * 0.6;
      G.fautes.push({ x: clamp(p.x + ox + Math.cos(a) * r, 40, WORLD.w - 40), y: clamp(p.y + oy + Math.sin(a) * r, 40, WORLD.h - 40), r: STYLO.fauteR, t: -i * 0.18, warn: STYLO.faute, done: false });
    }
    AU.play('fauteWarn'); e.phase = 'write'; e.pt = 1.3;
    if (!G.fauteSeen) { G.fauteSeen = true; caption('Faute ! Sors des cercles rouges.', 2.2, 'pink'); }
  } else if (m === 2) {   // « barré » : trois traits parallèles, il faut se glisser entre eux
    barreTrois(p.x, p.y, rnd(TAU), 0);
    if (enraged) barreTrois(p.x, p.y, rnd(TAU), 0.75);
    e.phase = 'write'; e.pt = enraged ? 1.8 : 1.2;
  } else if (m === 0 && !enraged || m === 3) {   // le zéro pointé : un grand 0 qui se referme sur toi, sauf par sa respiration
    G.zeros.push({ x: p.x, y: p.y, R0: STYLO.zeroR, t: 0, warn: STYLO.zeroWarn, dur: STYLO.zeroDur, gap: rnd(TAU), hit: false });
    AU.play('zeroWarn'); e.phase = 'write'; e.pt = 1.0;
    if (!G.zeroSeen) { G.zeroSeen = true; caption('Le zéro se referme : passe par l’ouverture !', 2.6, 'pink'); }
  } else {   // colère : il vide sa trousse de brouillon
    for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + G.t; spawnEnemy(i === 0 ? 'taillecrayon' : 'trombone', e.x + Math.cos(a) * 160, e.y + Math.sin(a) * 160); }
    caption('Le Stylo Rouge vide sa trousse !', 1.8, 'pink'); AU.play('flap'); e.atk = 2;
  }
}
function barreTrois(x, y, a, delay) {
  const c = Math.cos(a), s = Math.sin(a), L = STYLO.barLen / 2, off = rnd(-30, 30);
  for (const k of [-1, 0, 1]) {
    const o = k * STYLO.barGap + off, mx = x - s * o, my = y + c * o;
    G.bars.push({ x1: mx - c * L, y1: my - s * L, x2: mx + c * L, y2: my + s * L, t: -delay, warn: STYLO.bar, act: STYLO.barAct, hit: false, sound: false });
  }
  if (!delay) AU.play('ribbonWarn');
}
function redLine(x1, y1, x2, y2, alpha, width) {
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.globalAlpha = alpha; sctx.strokeStyle = C.red; sctx.lineWidth = width; sctx.lineCap = 'round';
  sctx.beginPath(); sctx.moveTo(x1, y1); sctx.lineTo(x2, y2); sctx.stroke(); sctx.restore();
}
function redRing(x, y, r, alpha, width) {
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.globalAlpha = alpha; sctx.strokeStyle = C.red; sctx.lineWidth = width;
  sctx.beginPath(); sctx.arc(x, y, r, 0, TAU); sctx.stroke(); sctx.restore();
}

/* ===================== Effets : café, ruban blanc, fautes, traits, zéro ===================== */
function stepBrouillonFx(dt) {
  if (CH().paper !== 'brouillon') return;
  const p = G.p, safe = p.inv > 0 || p.dashT > 0;
  for (const c of G.cafes) {
    c.t += dt; c.r = c.R * ease(c.t / CAFE.grow);
    if (c.t >= c.life) {   // la flaque sèche et laisse sa marque de tasse
      sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.globalAlpha = 0.14; sctx.strokeStyle = '#7a4a1e'; sctx.lineWidth = 6;
      sctx.beginPath(); sctx.arc(c.x, c.y, c.R * 0.8, 0, TAU); sctx.stroke(); sctx.restore();
    }
  }
  G.cafes = G.cafes.filter(c => c.t < c.life);
  let n = 0;
  for (const tp of G.tapes) {   // le ruban blanc : il brûle tant qu'il est humide, puis sèche et s'efface
    if (tp.owner && tp.owner.dead) tp.done = true;
    const P = tp.pts;
    let k = 0; while (k < P.length && G.t - P[k].b > BLANCO.life) k++;
    if (k) P.splice(0, k);
    n += P.length;
    if (safe) continue;
    for (const q of P) { const age = G.t - q.b; if (age >= 0.12 && age < BLANCO.wet && (q.x - p.x) ** 2 + (q.y - p.y) ** 2 < (p.r + BLANCO.w) ** 2) { hurtPlayer(1, q.x, q.y); break; } }
  }
  G.tapeN = n;
  G.tapes = G.tapes.filter(tp => tp.pts.length || !tp.done);
  for (const f of G.fautes) {
    f.t += dt;
    if (!f.done && f.t >= f.warn) {
      f.done = true; AU.play('faute');
      if (!safe && (p.x - f.x) ** 2 + (p.y - f.y) ** 2 < (f.r + p.r * 0.5) ** 2) hurtPlayer(1, f.x, f.y);
      redRing(f.x, f.y, f.r, 0.16, 4);
    }
  }
  G.fautes = G.fautes.filter(f => f.t < f.warn + 0.6);
  for (const b of G.bars) {
    const was = b.t < b.warn; b.t += dt;
    if (was && b.t >= b.warn) { AU.play('barSnap'); redLine(b.x1, b.y1, b.x2, b.y2, 0.09, 5); }
    if (!b.hit && !safe && b.t >= b.warn && b.t < b.warn + b.act && segDist(p.x, p.y, b.x1, b.y1, b.x2, b.y2) < p.r + 8) { b.hit = true; hurtPlayer(1, p.x, p.y); }
  }
  G.bars = G.bars.filter(b => b.t < b.warn + b.act + 0.35);
  for (const z of G.zeros) {
    z.t += dt;
    if (z.t < z.warn || z.hit) continue;
    const R = zeroR(z);
    if (R <= 0) continue;
    const d = Math.hypot(p.x - z.x, p.y - z.y);
    if (!safe && Math.abs(d - R) < p.r + 7 && !inGap(z, p.x, p.y)) { z.hit = true; hurtPlayer(1, z.x, z.y); }
  }
  for (const z of G.zeros) if (z.t >= z.warn + z.dur && !z.marked) { z.marked = true; redRing(z.x, z.y, 18, 0.2, 6); AU.play('point'); }
  G.zeros = G.zeros.filter(z => z.t < z.warn + z.dur + 0.5);
}
const zeroR = z => z.t < z.warn ? z.R0 : z.R0 * (1 - clamp((z.t - z.warn) / z.dur, 0, 1));
function inGap(z, x, y) { let da = Math.atan2(y - z.y, x - z.x) - z.gap; da = Math.atan2(Math.sin(da), Math.cos(da)); return Math.abs(da) < STYLO.zeroGap / 2; }
// Le pilote automatique évite flaques, ruban humide, cercles, traits annoncés et zéro qui se referme
function brouillonDanger(x, y) {
  let s = 0;
  for (const c of G.cafes) if ((x - c.x) ** 2 + (y - c.y) ** 2 < (c.r + 10) ** 2) s += 1.2;
  for (const tp of G.tapes) for (const q of tp.pts) { if (G.t - q.b > BLANCO.wet) continue; const d2 = (x - q.x) ** 2 + (y - q.y) ** 2; if (d2 < 50 * 50) s += 2 + (50 - Math.sqrt(d2)) * 0.1; }
  for (const f of G.fautes) if (!f.done) { const d = Math.hypot(x - f.x, y - f.y); if (d < f.r + 30) s += 4 + (f.r + 30 - d) * 0.08; }
  for (const b of G.bars) if (b.t < b.warn + b.act) { const d = segDist(x, y, b.x1, b.y1, b.x2, b.y2); if (d < 46) s += 3 + (46 - d) * 0.12; }
  for (const z of G.zeros) {
    if (z.hit) continue;
    const R = zeroR(z), d = Math.hypot(x - z.x, y - z.y);
    if (inGap(z, x, y)) { if (d < R + 40) s -= 1.5; continue; }   // la respiration attire le pilote
    if (Math.abs(d - R) < 70) s += 3 + (70 - Math.abs(d - R)) * 0.06;
    if (d < R) s += 1.5;   // rester dedans, c'est se faire rattraper
  }
  for (const e of G.enemies) if (e.type === 'blanco' && e.phase === 'aim') {
    const d = segDist(x, y, e.x, e.y, e.x + Math.cos(e.aimA) * BLANCO.speed * BLANCO.roll, e.y + Math.sin(e.aimA) * BLANCO.speed * BLANCO.roll);
    if (d < 50) s += 3 + (50 - d) * 0.1;
  }
  return s;
}

/* ===================== Dessin ===================== */
const COFFEE = 'rgba(122,74,30,', METAL = '#8c96a3', METAL_D = '#4f5864';
function drawBrouillonGround(v) {
  for (const c of G.cafes) {
    if (c.x + c.R < v.x0 || c.x - c.R > v.x1 || c.y + c.R < v.y0 || c.y - c.R > v.y1) continue;
    const a = Math.min(1, (c.life - c.t) * 0.8);
    ctx.save(); ctx.translate(c.x, c.y); ctx.globalAlpha = a; ctx.beginPath();
    for (let i = 0; i <= 24; i++) { const an = i / 24 * TAU, rr = c.r * (1 + 0.08 * Math.sin(an * 3 + c.seed) + 0.04 * Math.sin(an * 7 + c.seed * 2)); i ? ctx.lineTo(Math.cos(an) * rr, Math.sin(an) * rr) : ctx.moveTo(Math.cos(an) * rr, Math.sin(an) * rr); }
    ctx.closePath(); ctx.fillStyle = COFFEE + '0.26)'; ctx.fill(); ctx.strokeStyle = COFFEE + '0.55)'; ctx.lineWidth = 4; ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(-c.r * 0.3, -c.r * 0.35, c.r * 0.2, c.r * 0.08, -0.5, 0, TAU); ctx.fill();
    ctx.restore();
  }
}
function drawBrouillonFx() {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const tp of G.tapes) {   // le ruban blanc : bordé de rouge tant qu'il est humide (bord, puis blanc, puis reflet : sinon chaque bout recouvre le précédent)
    const P = tp.pts;
    for (let pass = 0; pass < 3; pass++) {
      for (let i = 1; i < P.length; i++) {
        const a = P[i - 1], b = P[i], age = G.t - b.b, wet = age < BLANCO.wet;
        if (pass === 2 && !wet) continue;
        ctx.globalAlpha = clamp((BLANCO.life - age) / 0.8, 0, 1);
        if (pass === 0) { ctx.strokeStyle = wet ? 'rgba(200,66,74,0.75)' : 'rgba(140,140,150,0.55)'; ctx.lineWidth = BLANCO.w * 2 + 4; }
        else if (pass === 1) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = BLANCO.w * 2; }
        else { ctx.strokeStyle = 'rgba(190,215,255,0.8)'; ctx.lineWidth = 3; }
        const o = pass === 2 ? 4 : 0;
        ctx.beginPath(); ctx.moveTo(a.x - o * 0.75, a.y - o); ctx.lineTo(b.x - o * 0.75, b.y - o); ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
  for (const e of G.enemies) if (e.type === 'blanco' && e.phase === 'aim') {   // là où il va rouler
    ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.aimA); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 24); ctx.setLineDash([10, 8]); ctx.lineWidth = 2;
    const L = BLANCO.speed * BLANCO.roll; ctx.strokeRect(0, -BLANCO.w, L, BLANCO.w * 2); ctx.restore();
  }
  for (const f of G.fautes) {
    if (f.t < 0) continue;
    if (!f.done) {
      const k = f.t / f.warn;
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.35 + 0.3 * Math.sin(G.time * 22); ctx.setLineDash([9, 7]); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
      ctx.globalAlpha = 0.85; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(f.x, f.y, f.r, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke();   // le stylo entoure
      ctx.restore();
      txt('?', f.x, f.y, 40, { color: C.red, alpha: 0.5 });
    } else {
      const q = (f.t - f.warn) / 0.6;
      ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = C.red; ctx.lineWidth = 6 * (1 - q) + 2; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (1 + 0.15 * q), 0, TAU); ctx.stroke(); ctx.restore();
      txt('faute !', f.x, f.y - 8 * q, 30, { color: C.red, alpha: 1 - q });
    }
  }
  for (const b of G.bars) {
    if (b.t < 0) continue;
    ctx.save(); ctx.strokeStyle = C.red;
    if (b.t < b.warn) { ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 24); ctx.setLineDash([14, 10]); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke(); }
    else {
      const k = clamp((b.t - b.warn) / (b.act + 0.35), 0, 1), dx = (b.x2 - b.x1) * Math.min(1, (b.t - b.warn) / 0.08), dy = (b.y2 - b.y1) * Math.min(1, (b.t - b.warn) / 0.08);
      ctx.globalAlpha = 1 - k * k; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x1 + dx, b.y1 + dy); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.stroke();
    }
    ctx.restore();
  }
  for (const z of G.zeros) {
    const R = zeroR(z), live = z.t >= z.warn, w = STYLO.zeroGap / 2;
    ctx.save(); ctx.strokeStyle = C.red;
    if (!live) { ctx.globalAlpha = 0.35 + 0.3 * Math.sin(G.time * 22); ctx.setLineDash([12, 9]); ctx.lineWidth = 3; }
    else { ctx.globalAlpha = z.t > z.warn + z.dur ? clamp(1 - (z.t - z.warn - z.dur) / 0.5, 0, 1) : 1; ctx.lineWidth = 10; }
    if (R > 2) { ctx.beginPath(); ctx.arc(z.x, z.y, R, z.gap + w, z.gap - w + TAU); ctx.stroke(); }
    ctx.restore();
    if (R > 40) {   // la respiration : deux petits traits de chaque côté de l'ouverture
      ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 4; ctx.globalAlpha = 0.8;
      for (const s of [-w, w]) { const a = z.gap + s; ctx.beginPath(); ctx.moveTo(z.x + Math.cos(a) * (R - 16), z.y + Math.sin(a) * (R - 16)); ctx.lineTo(z.x + Math.cos(a) * (R + 16), z.y + Math.sin(a) * (R + 16)); ctx.stroke(); }
      ctx.restore();
    }
    if (z.t >= z.warn + z.dur) { ctx.fillStyle = C.red; ctx.globalAlpha = clamp(1 - (z.t - z.warn - z.dur) / 0.5, 0, 1); ctx.beginPath(); ctx.arc(z.x, z.y, 14, 0, TAU); ctx.fill(); ctx.globalAlpha = 1; }
  }
  for (const b of G.ebul) {   // les copeaux du taille-crayon
    if (!b.copeau) continue;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a + G.time * 6);
    ctx.fillStyle = '#e8c08a'; ctx.strokeStyle = '#b07a3a'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 1.4); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#c8424a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 1.4); ctx.stroke();
    ctx.restore();
  }
}
function drawBrouillonEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const j = (fr - 1) * 0.8;
  if (e.type === 'trombone') {   // un trombone : un fil de fer replié en deux boucles
    ctx.rotate(e.rot);
    ctx.strokeStyle = fl ? C.red : METAL_D; ctx.lineWidth = 4.5;
    ctx.beginPath(); ctx.moveTo(-6, 7); ctx.lineTo(14, 7); ctx.arc(14, 0, 7, Math.PI / 2, -Math.PI / 2, true); ctx.lineTo(-16, -7); ctx.arc(-16, -1, 6, -Math.PI / 2, Math.PI / 2, true); ctx.lineTo(10 + j, 5); ctx.arc(10 + j, 1, 4, Math.PI / 2, -Math.PI / 2, true); ctx.lineTo(-8, -3);
    ctx.stroke(); ctx.strokeStyle = fl ? '#ffb0b4' : METAL; ctx.lineWidth = 2; ctx.stroke();
    for (const s of [-4, 4]) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(-2, s * 0.6 - 1, 3, 0, TAU); ctx.fill(); }
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(-1.5, -3, 1.5, 0, TAU); ctx.arc(-1.5, 1.6, 1.5, 0, TAU); ctx.fill();
  } else if (e.type === 'cafe') {   // une tache de café, ronde, avec sa marque de tasse et deux yeux
    ctx.rotate(e.rot);
    ctx.fillStyle = fl ? '#e0a090' : COFFEE + '0.85)'; ctx.beginPath();
    for (let i = 0; i <= 18; i++) { const a = i / 18 * TAU, rr = 22 * (1 + 0.08 * Math.sin(a * 4 + fr) + 0.05 * Math.sin(a * 7)); i ? ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : ctx.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#4e2c10'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 15, 0.4, TAU - 0.6); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(-7, -9, 5, 2.5, -0.5, 0, TAU); ctx.fill();
    for (const s of [-6, 6]) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(s, 0, 4, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + 1, 1, 2, 0, TAU); ctx.fill(); }
  } else if (e.type === 'taillecrayon') {   // un taille-crayon de métal, sa lame et son trou
    ctx.rotate(e.rot * 0.15 + (e.phase === 'spin' ? Math.sin(G.time * 60) * 0.12 : 0));
    ctx.fillStyle = fl ? '#ffd0d4' : '#b9c1cc'; ctx.strokeStyle = METAL_D; ctx.lineWidth = 2;
    roundRect(-20, -15, 40, 30, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d7dde5'; ctx.fillRect(-20, -15, 40, 6);
    ctx.strokeStyle = METAL_D; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-14, -9); ctx.lineTo(10, 11); ctx.stroke();
    ctx.fillStyle = '#2b2f36'; ctx.beginPath(); ctx.arc(6 + j, 2, 7, 0, TAU); ctx.fill();
    ctx.fillStyle = '#e8c08a'; ctx.beginPath(); ctx.arc(6 + j, 2, 3, 0, TAU); ctx.fill();
    for (const s of [-12, -4]) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(s, -2, 3.4, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + 0.8, -1.4, 1.7, 0, TAU); ctx.fill(); }
    if (e.eaten) txt(String(e.eaten), 0, -26, 16, { color: C.gold });
  } else if (e.type === 'blanco') {   // un dérouleur de ruban correcteur, blanc et bleu
    ctx.rotate(e.rot);
    ctx.fillStyle = fl ? '#ffd0d4' : '#e9eef6'; ctx.strokeStyle = '#3c66c4'; ctx.lineWidth = 2.2;
    roundRect(-22, -14, 40, 28, 10); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3c66c4'; ctx.beginPath(); ctx.arc(-6, 0, 8, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(-6, 0, 4, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#9aa4b4'; ctx.beginPath(); ctx.moveTo(18, -6); ctx.lineTo(28 + j, 0); ctx.lineTo(18, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
    for (const s of [-7, 7]) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(9, s, 3.2, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(10, s, 1.6, 0, TAU); ctx.fill(); }
  }
}
function drawStylo(e, fr, fl) {
  const enraged = e.hp < e.maxHp / 2, w = e.write || 0, j = (fr - 1) * 1.2;
  ctx.fillStyle = 'rgba(46,46,51,0.16)'; ctx.beginPath(); ctx.ellipse(10, 96, 70, 18, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.rotate(-0.38 + Math.sin(G.time * (enraged ? 6 : 2.5)) * 0.05 + w * Math.sin(G.time * 30) * 0.06);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // la pointe
  ctx.fillStyle = '#e6e2d6'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-22, 70); ctx.lineTo(22, 70); ctx.lineTo(4, 112); ctx.lineTo(-4, 112); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, 114, 5, 0, TAU); ctx.fill();
  // le corps, avec sa fenêtre où l'on voit l'encre
  ctx.fillStyle = fl ? '#ff9aa0' : C.red; ctx.strokeStyle = '#7a1e26'; ctx.lineWidth = 3.5;
  roundRect(-24, -110, 48, 182, 10); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.22)'; ctx.fillRect(-16, -100, 7, 162);
  ctx.fillStyle = 'rgba(122,30,38,0.6)'; roundRect(6, -60, 9, 110, 4); ctx.fill();
  // le capuchon, qui saute quand il se met en colère
  if (!enraged) {
    ctx.fillStyle = fl ? '#ffb0b4' : '#8e2228'; roundRect(-27, -136, 54, 74, 9); ctx.fill(); ctx.stroke();
    ctx.fillStyle = METAL; ctx.strokeStyle = METAL_D; ctx.lineWidth = 2; roundRect(22, -130, 9, 66, 4); ctx.fill(); ctx.stroke();
  } else { ctx.fillStyle = '#7a1e26'; ctx.fillRect(-12, -122, 24, 14); }
  // les lunettes de correctrice, et les yeux qui te suivent
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x) + 0.38, ex = Math.cos(la) * 4, ey = Math.sin(la) * 4;
  for (const sx of [-12, 12]) {
    ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(sx, -26, 11, 0, TAU); ctx.fill();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(sx + ex, -26 + ey, 4.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(sx, -26, 14, 0, TAU); ctx.stroke();
    if (enraged) { ctx.strokeStyle = '#3a0c10'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx - 12 * Math.sign(sx), -48); ctx.lineTo(sx + 10 * Math.sign(sx), -40 + j); ctx.stroke(); }
  }
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(-2, -26); ctx.lineTo(2, -26); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 6, 9, enraged ? Math.PI + 0.4 : 0.3, enraged ? -0.4 : Math.PI - 0.3); ctx.stroke();
  ctx.restore();
}
