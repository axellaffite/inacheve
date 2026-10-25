// Chapitre XIII : le carnet de correspondance (itération 24). Le septième cahier : un petit carnet couleur
// chamois, ses cases imprimées (« Mot des parents », « Absences et retards »…) déjà remplies à la main.
// Deux ratures à soi : le bâton de colle, qui laisse des flaques collantes, et l'enveloppe, qui t'écrit
// des lettres. Au bout : le Grand Tampon du directeur. Le mot à faire signer est dans signature.js.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const NOTES_CARNET = [
  { x: WORLD.w / 2, y: -150, t: '— carnet n° 7 · chapitre XIII : le carnet de correspondance —', r: -0.02 },
  { x: WORLD.w * 0.72, y: -96, t: 'ajouté : des mots à faire signer', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'le bulletin de fin d’année ?', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'à signer', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'avant', r: -0.05 },
  { x: -160, y: WORLD.h * 0.45 + 88, t: 'lundi', r: -0.04 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'lu et approuvé', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: 'qui a imité la signature ? personne !', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'cachet de l’école', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'VU', r: 0.05 },
  { x: WORLD.w * 0.3, y: -96, t: 'à rapporter demain sans faute', r: -0.02 }
];
const DICTEES_CARNET = ['MOT', 'SIGNÉ', 'RETARD', 'PARENTS', 'CARNET', 'ABSENCE', 'CONDUITE', 'RÉUNION', 'ENVELOPPE', 'CORRESPONDANCE'];
const CARNET_TYPES = new Set(['colle', 'enveloppe']);
Object.assign(ETYPES, {
  colle:       { r: 19, hp: 18, speed: 54, dmg: 1, xp: 4, agil: 2 },
  enveloppe:   { r: 18, hp: 9, speed: 96, dmg: 1, xp: 3, agil: 3 },
  grandtampon: { r: 72, hp: 1600, speed: 44, dmg: 2, xp: 250, agil: 1.2, boss: true }
});
const enCarnet = () => CH().paper === 'carnet';

CHAPTERS.push({
  num: 'XIII', name: 'Le carnet de correspondance', done: 'Le carnet : lu et signé !', paper: 'carnet', notes: NOTES_CARNET, dictees: DICTEES_CARNET,
  intro: 'Chapitre XIII : le carnet de correspondance. Un mot à faire signer…', boss: 'grandtampon', bossName: 'Le Grand Tampon',
  bossIntro: 'Boum… boum… Le Grand Tampon du directeur arrive !', bossBack: 'Le Grand Tampon s’encre de nouveau.', bossSound: 'boss13',
  scale: 42, rateOff: 240, rateCap: 18, waveCap: 'Une pile de courrier !',
  meet: {
    colle: 'Nouveau : le bâton de colle. Ne marche pas dans ce qu’il laisse !',
    enveloppe: 'Nouveau : l’enveloppe. Elle s’ouvre… et t’écrit des lettres !'
  },
  pick(t, r) {
    if (t > 20 && r < 0.06 && countType('colle') < 4) return 'colle';
    if (t > 8 && r < 0.14 && countType('enveloppe') < 4) return 'enveloppe';
    if (t > 45 && r < 0.2 && countType('tache') < 8) return 'tache';   // pas trop de taches : elles s'entassaient et couvraient tout le carnet
    if (t > 15 && r < 0.45) return 'biffure';
    return 'gribouillis';
  },
  wave(t, i) { return i % 4 === 0 ? 'enveloppe' : t > 90 && i % 4 === 2 ? 'biffure' : 'gribouillis'; }
});

/* ---------- Le papier : les cases imprimées du carnet, remplies à la main ---------- */
// [titre, lignes écrites à la main, signée ?]
const FICHES = [
  ['Mot de l’enseignant', ['La goutte bavarde avec les lettres', 'pendant la dictée.'], true],
  ['Mot des parents', ['Pardon pour le retard de lundi :', 'il y avait un escargot sur le trottoir.'], true],
  ['Absences et retards', ['lundi : cinq minutes de retard', 'jeudi : absente (rhume des foins)'], false],
  ['Rendez-vous', ['Réunion mardi à 18 h, salle 12.', '→ D’accord, nous serons là !'], true],
  ['Informations', ['Sortie au musée jeudi : prévoir un goûter', 'et des chaussures qui marchent.'], false],
  ['Vu par le directeur', ['Bon trimestre. Continuez ainsi !'], true]
];
const FICHE = { x0: 300, y0: 290, w: 1080, h: 440, gx: 1220, gy: 560 };
function drawCarnet(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = 'rgba(240,218,170,0.26)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // un papier chamois
  ctx.strokeStyle = 'rgba(170,140,90,0.22)'; ctx.lineWidth = 1 / ZOOM; ctx.beginPath();
  for (let y = Math.ceil(Math.max(y0, 96) / 40) * 40; y <= y1; y += 40) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
  ctx.stroke();
  ctx.strokeStyle = C.margin; ctx.globalAlpha = 0.55; ctx.lineWidth = 2.2 / ZOOM; ctx.beginPath(); ctx.moveTo(MARGIN_X, y0); ctx.lineTo(MARGIN_X, y1); ctx.stroke(); ctx.globalAlpha = 1;
  if (v.y0 < 230) txt('Carnet de correspondance', WORLD.w / 2, 150, 64, { font: FONT_CURSIVE, weight: 400, color: '#8c5a22', alpha: 0.5 });
  FICHES.forEach((f, i) => {
    const x = FICHE.x0 + (i % 2) * FICHE.gx, y = FICHE.y0 + Math.floor(i / 2) * FICHE.gy;
    if (x + FICHE.w < v.x0 || x > v.x1 || y + FICHE.h < v.y0 || y - 50 > v.y1) return;
    drawFicheCarnet(f, x, y, i);
  });
}
function drawFicheCarnet([title, lines, signed], x, y, i) {
  const w = FICHE.w, h = FICHE.h;
  ctx.save(); ctx.globalAlpha = 0.5;
  ctx.strokeStyle = '#8c5a22'; ctx.lineWidth = 3; ctx.strokeRect(x, y, w, h);
  ctx.fillStyle = 'rgba(201,133,58,0.18)'; ctx.fillRect(x, y, w, 62);
  ctx.beginPath(); ctx.moveTo(x, y + 62); ctx.lineTo(x + w, y + 62); ctx.stroke();
  ctx.font = '700 30px ' + FONT_MAIN; ctx.fillStyle = '#6b4218'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText(title.toUpperCase(), x + 24, y + 32);
  ctx.setLineDash([4, 8]); ctx.strokeStyle = 'rgba(107,66,24,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let k = 0; k < 4; k++) { const ly = y + 130 + k * 64; ctx.moveTo(x + 24, ly); ctx.lineTo(x + w - 24, ly); }
  ctx.stroke(); ctx.setLineDash([]);
  ctx.font = '400 36px ' + FONT_CURSIVE; ctx.fillStyle = C.ink; ctx.textBaseline = 'alphabetic';
  lines.forEach((l, k) => ctx.fillText(l, x + 40, y + 122 + k * 64));
  ctx.font = '700 24px ' + FONT_MAIN; ctx.fillStyle = '#6b4218'; ctx.fillText('Signature :', x + w - 420, y + h - 40);
  ctx.restore();
  if (signed) { ctx.save(); ctx.translate(x + w - 200, y + h - 52); ctx.globalAlpha = 0.45; drawParapheSig(1, 0.9 + (i % 3) * 0.12, i, C.ink, 3); ctx.restore(); }
  if (i === 5) drawVuStamp(x + w - 230, y + 150, -0.2, 0.4);
}
// le cachet « VU » du directeur
function drawVuStamp(x, y, rot, alpha, g = ctx) {
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = alpha;
  g.strokeStyle = C.red; g.lineWidth = 6; g.strokeRect(-70, -40, 140, 80); g.lineWidth = 2; g.strokeRect(-60, -30, 120, 60);
  g.fillStyle = C.red; g.font = '700 46px ' + FONT_MAIN; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('VU', 0, 3);
  g.restore();
}
// un paraphe à la main : u (0 à 1) dit jusqu'où il est tracé ; k étire, seed varie les boucles
function sigPoint(t, k, seed) {
  if (t < 0.78) { const u = t / 0.78; return [(-62 + 112 * u + 11 * Math.sin(u * (24 + seed % 3 * 3))) * k, (-4 - 13 * Math.abs(Math.sin(u * (11 + seed % 2 * 2))) + 6 * u) * k]; }
  const u = (t - 0.78) / 0.22;   // le grand trait de soulignement, qui revient en arrière
  return [(52 - 120 * u) * k, (4 + 10 * Math.sin(u * Math.PI)) * k];
}
function drawParapheSig(upto, k, seed, color, lw, g = ctx) {
  if (upto <= 0) return;
  g.strokeStyle = color; g.lineWidth = lw; g.lineCap = 'round'; g.lineJoin = 'round'; g.beginPath();
  const n = Math.max(2, Math.ceil(60 * upto));
  for (let i = 0; i <= n; i++) { const [px, py] = sigPoint(i / n * upto, k, seed); if (i) g.lineTo(px, py); else g.moveTo(px, py); }
  g.stroke();
}

/* ---------- Les ratures du carnet ---------- */
const COLLE = { drop: 0.4, life: 7, r: 26, slow: 0.5, max: 70 };
const ENVEL = { keep: 220, range: 420, open: 0.6, speed: 205, n: 3, spread: 0.3 };
function stepCarnet(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  e.pt -= dt;
  if (e.type === 'colle') {   // il avance en se dandinant, et laisse derrière lui des flaques de colle
    e.rot = Math.sin(G.t * 5 + e.id) * 0.15;
    e.drop = (e.drop || 0) - dt;
    if (e.drop <= 0) {
      e.drop = COLLE.drop;
      if (G.colles.length < COLLE.max) { G.colles.push({ x: e.x, y: e.y + 10, t: 0, life: COLLE.life, r: COLLE.r * rnd(0.8, 1.15), k: rnd(TAU) }); AU.play('colle'); }
    }
  } else if (e.type === 'enveloppe') {   // elle volette, garde ses distances, s'ouvre… et t'écrit trois lettres
    const w = Math.sin(G.t * 4 + e.id) * 0.8;
    MV.x += -dy / d * e.speed * w; MV.y += dx / d * e.speed * w;
    e.rot = Math.sin(G.t * 6 + e.id) * 0.25;
    if (e.phase === 'walk') {
      if (d < ENVEL.keep) { MV.x = -MV.x * 0.5; MV.y = -MV.y * 0.5; }
      if (e.pt <= 0 && d < ENVEL.range && !hid) { e.phase = 'open'; e.pt = ENVEL.open; AU.play('enveloppeOpen'); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else {
      MV.x *= 0.1; MV.y *= 0.1; e.rot *= 0.3;
      if (e.pt <= 0) {
        const a0 = Math.atan2(dy, dx);
        for (let i = 0; i < ENVEL.n; i++) { const a = a0 + (i - (ENVEL.n - 1) / 2) * ENVEL.spread; G.ebul.push({ x: e.x + Math.cos(a) * 16, y: e.y + Math.sin(a) * 16, vx: Math.cos(a) * ENVEL.speed, vy: Math.sin(a) * ENVEL.speed, life: 3, lettre: true, a }); }
        AU.play('lettre'); e.phase = 'walk'; e.pt = rnd(2.8, 3.8);
      }
    }
  }
}
function stepCarnetFx(dt) {
  if (!enCarnet()) return;
  for (const c of G.colles) c.t += dt;
  G.colles = G.colles.filter(c => c.t < c.life);
}
// la goutte qui marche dans la colle avance deux fois moins vite
function colleSlow(x, y) {
  for (const c of G.colles) if ((x - c.x) ** 2 + (y - c.y) ** 2 < c.r * c.r) return COLLE.slow;
  return 1;
}

/* ---------- Le Grand Tampon ---------- */
const GTAMPON = { up: 0.85, R: 110, rest: 0.45, lift: 150, inkN: 16, inkN2: 22, inkSpeed: 210, gap: 0.085, letterSpeed: 270, words: 'LU ET APPROUVÉ' };
function stepGrandTampon(e, dt, dx, dy, d, slow) {
  const want = d < 300 ? -0.5 : 1;
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow * want; MV.y = dy / d * e.speed * slow * want;
  if (e.enter > 0) e.enter = Math.max(0, e.enter - dt * 0.5);
  const enraged = e.hp < e.maxHp / 2, p = G.p;
  e.pt -= dt;
  if (e.phase === 'up') {   // en l'air : il plane jusqu'au-dessus de toi, puis retombe
    MV.x = 0; MV.y = 0;
    const k = 1 - Math.exp(-dt * 7); e.x = lerp(e.x, e.tx, k); e.y = lerp(e.y, e.ty, k);
    e.h = GTAMPON.lift * Math.min(1, (e.up - e.pt) / 0.2) * (e.pt < 0.12 ? e.pt / 0.12 : 1);
    if (e.pt <= 0) slamTampon(e);
    return;
  }
  if (e.phase === 'down') { MV.x = 0; MV.y = 0; if (e.pt <= 0) { if (e.slams > 0) liftTampon(e, enraged); else { e.phase = 'walk'; e.atk = enraged ? 1.2 : 1.8; } } return; }
  if (e.phase === 'ink') {   // il s'encre sur son tampon encreur, puis éclabousse toute la page
    MV.x *= 0.1; MV.y *= 0.1;
    if (e.pt <= 0) {
      for (const [n, off, wait] of enraged ? [[GTAMPON.inkN2, 0, 0], [GTAMPON.inkN2, 0.5, 0.4]] : [[GTAMPON.inkN, 0, 0]]) for (let i = 0; i < n; i++) {
        const a = (i + off) / n * TAU + e.atkN;
        G.ebul.push({ x: e.x + Math.cos(a) * 70, y: e.y + Math.sin(a) * 70, vx: Math.cos(a) * GTAMPON.inkSpeed, vy: Math.sin(a) * GTAMPON.inkSpeed, life: 4.5, tampon: true, wait });
      }
      AU.play('slam'); G.cam.shake = Math.max(G.cam.shake, 8); e.phase = 'walk'; e.atk = enraged ? 1.2 : 1.8;
    }
    return;
  }
  if (e.phase === 'date') {   // « LU ET APPROUVÉ » : les lettres partent une à une, en serpentant vers toi
    MV.x *= 0.2; MV.y *= 0.2;
    const W2 = GTAMPON.words, ta = Math.atan2(dy, dx);
    let df = ta - e.da; while (df > Math.PI) df -= TAU; while (df < -Math.PI) df += TAU; e.da += df * Math.min(1, dt * 2.5);
    e.dtk -= dt;
    while (e.dtk <= 0 && e.di < W2.length) {
      e.dtk += GTAMPON.gap;
      const ch = W2[e.di], wav = Math.sin(e.di * 0.8) * 0.32;
      if (ch !== ' ') for (const side of enraged ? [-0.45, 0.45] : [0]) {
        const a = e.da + wav + side;
        G.ebul.push({ x: e.x + Math.cos(a) * 70, y: e.y + Math.sin(a) * 70, vx: Math.cos(a) * GTAMPON.letterSpeed, vy: Math.sin(a) * GTAMPON.letterSpeed, life: 4, lettreT: ch, a });
      }
      e.di++;
    }
    if (e.di >= W2.length) { e.phase = 'walk'; e.atk = enraged ? 1.2 : 1.8; }
    return;
  }
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % (enraged ? 4 : 3);
  if (m === 1) {   // les coups de tampon : trois (quatre en colère), là où tu es
    e.slams = enraged ? 4 : 3; liftTampon(e, enraged);
    if (!G.tamponSeen) { G.tamponSeen = true; caption('Le coup de tampon ! Sors de son ombre avant qu’il retombe.', 2.8, 'pink'); }
  } else if (m === 2) { e.phase = 'ink'; e.pt = 0.75; AU.play('encreur'); }
  else if (m === 0 && !enraged || m === 3) {
    e.phase = 'date'; e.di = 0; e.dtk = 0.25; e.da = Math.atan2(dy, dx); AU.play('date');
    if (!G.dateSeen) { G.dateSeen = true; caption('« Lu et approuvé » : ses lettres serpentent, glisse entre elles !', 2.8, 'pink'); }
  } else {   // colère : il ouvre tout le courrier
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + G.t; spawnEnemy(i % 3 ? 'enveloppe' : 'colle', clamp(e.x + Math.cos(a) * 170, 30, WORLD.w - 30), clamp(e.y + Math.sin(a) * 170, 30, WORLD.h - 30)); }
    caption('Il ouvre tout le courrier !', 1.8, 'pink'); AU.play('boss13'); e.atk = 2;
  }
}
function liftTampon(e, enraged) {
  const p = G.p;
  e.slams--; e.phase = 'up'; e.up = e.pt = GTAMPON.up * (enraged ? 0.8 : 1); e.ghost = true; e.h = 0;
  e.tx = clamp(p.x + p.vx * 0.3, 90, WORLD.w - 90); e.ty = clamp(p.y + p.vy * 0.3, 90, WORLD.h - 90);
  AU.play('slamWarn');
}
function slamTampon(e) {
  const p = G.p;
  e.ghost = false; e.x = e.tx; e.y = e.ty; e.vx = 0; e.vy = 0; e.h = 0; e.phase = 'down'; e.pt = GTAMPON.rest;
  if (p.dashT <= 0 && Math.hypot(p.x - e.x, p.y - e.y) < GTAMPON.R + p.r * 0.5) hurtPlayer(1, e.x, e.y);
  query(e.x, e.y, GTAMPON.R + 40, tmpA);   // les ratures dessous sont aplaties aussi
  for (const o of tmpA) if (o !== e && !o.dead && !o.isBoss && Math.hypot(o.x - e.x, o.y - e.y) < GTAMPON.R + o.r) hurtEnemy(o, 40, 'tampon');
  const rot = rnd(-0.3, 0.3);
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); drawVuStamp(e.x, e.y, rot, 0.4, sctx); sctx.restore();   // il laisse son « VU » sur la page
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + rot; G.ebul.push({ x: e.x + Math.cos(a) * 80, y: e.y + Math.sin(a) * 80, vx: Math.cos(a) * 190, vy: Math.sin(a) * 190, life: 1.4, tampon: true }); }
  G.rings.push({ x: e.x, y: e.y, t: 0, dur: 0.45, r: GTAMPON.R * 1.5, color: C.red });
  for (let i = 0; i < 20; i++) { const a = rnd(TAU), s = rnd(120, 380); G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5, max: 0.5, size: rnd(2, 5), color: C.red, drag: 4 }); }
  G.cam.shake = Math.max(G.cam.shake, 14); AU.play('slam');
}
// les mêmes coups, vus par le pilote automatique
function carnetDanger(x, y) {
  let s = 0;
  for (const e of G.enemies) {
    if (e.type === 'grandtampon' && e.phase === 'up') { if (Math.hypot(x - e.tx, y - e.ty) < GTAMPON.R + 40) s += 6; }
    else if (e.type === 'enveloppe' && e.phase === 'open') { const a = Math.atan2(G.p.y - e.y, G.p.x - e.x), b = Math.atan2(y - e.y, x - e.x); let df = Math.abs(a - b); if (df > Math.PI) df = TAU - df; if (df < 0.5 && Math.hypot(x - e.x, y - e.y) < 500) s += 1.2; }
  }
  for (const c of G.colles) if ((x - c.x) ** 2 + (y - c.y) ** 2 < (c.r + 14) ** 2) s += 0.6;
  return s;
}

/* ---------- Dessins ---------- */
function drawColles(v) {
  if (!G.colles.length) return;
  for (const c of G.colles) {
    if (c.x < v.x0 - 40 || c.x > v.x1 + 40 || c.y < v.y0 - 40 || c.y > v.y1 + 40) continue;
    const a = Math.min(1, c.t * 4, (c.life - c.t) / 1.2);
    ctx.save(); ctx.globalAlpha = 0.6 * a; ctx.translate(c.x, c.y); ctx.rotate(c.k);
    ctx.fillStyle = 'rgba(214,226,255,0.8)'; ctx.strokeStyle = 'rgba(120,135,190,0.6)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(0, 0, c.r, c.r * 0.72, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.beginPath(); ctx.ellipse(-c.r * 0.3, -c.r * 0.25, c.r * 0.25, c.r * 0.12, -0.4, 0, TAU); ctx.fill();
    ctx.restore();
  }
}
function drawCarnetFx() {
  for (const e of G.enemies) {
    if (e.type === 'grandtampon' && e.phase === 'up') {   // l'ombre du tampon, là où il va retomber
      const q = clamp(1 - e.pt / e.up, 0, 1);
      ctx.save(); ctx.fillStyle = 'rgba(46,46,51,' + (0.08 + 0.25 * q) + ')'; ctx.beginPath(); ctx.ellipse(e.tx, e.ty, GTAMPON.R * (0.5 + 0.5 * q), GTAMPON.R * (0.5 + 0.5 * q) * 0.8, 0, 0, TAU); ctx.fill();
      ctx.strokeStyle = C.red; ctx.globalAlpha = 0.4 + 0.4 * Math.sin(G.time * 24); ctx.setLineDash([12, 9]); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(e.tx, e.ty, GTAMPON.R, 0, TAU); ctx.stroke(); ctx.restore();
    } else if (e.type === 'enveloppe' && e.phase === 'open') {
      const a0 = Math.atan2(G.p.y - e.y, G.p.x - e.x);
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.25 + 0.2 * Math.sin(G.time * 26); ctx.setLineDash([8, 8]); ctx.lineWidth = 2;
      for (let i = 0; i < ENVEL.n; i++) { const a = a0 + (i - (ENVEL.n - 1) / 2) * ENVEL.spread; ctx.beginPath(); ctx.moveTo(e.x + Math.cos(a) * 24, e.y + Math.sin(a) * 24); ctx.lineTo(e.x + Math.cos(a) * 200, e.y + Math.sin(a) * 200); ctx.stroke(); }
      ctx.restore();
    }
  }
  for (const b of G.ebul) {
    if (b.lettre) {   // une petite lettre pliée, qui tourne sur elle-même
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(G.time * 7 + b.a);
      ctx.fillStyle = '#fffdf4'; ctx.strokeStyle = C.red; ctx.lineWidth = 1.6; ctx.fillRect(-8, -5.5, 16, 11); ctx.strokeRect(-8, -5.5, 16, 11);
      ctx.beginPath(); ctx.moveTo(-8, -5.5); ctx.lineTo(0, 1.5); ctx.lineTo(8, -5.5); ctx.stroke(); ctx.restore();
    } else if (b.tampon) {   // une goutte d'encre à tampon, violette
      const a = b.wait > 0 ? 0.35 : 1;
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#7a2f7a'; ctx.beginPath(); ctx.arc(b.x, b.y, 7, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.arc(b.x - 2, b.y - 2, 2.2, 0, TAU); ctx.fill(); ctx.restore();
    } else if (b.lettreT) {   // une lettre du tampon, à l'encre rouge
      txt(b.lettreT, b.x, b.y, 26, { color: C.red, rot: Math.sin(G.time * 5 + b.a * 3) * 0.3 });
    }
  }
}
function drawCarnetEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const j = (fr - 1) * 0.8;
  if (e.type === 'colle') {   // un bâton de colle debout, bouchon violet, étiquette orange
    ctx.rotate(e.rot || 0);
    ctx.fillStyle = 'rgba(46,46,51,0.16)'; ctx.beginPath(); ctx.ellipse(0, 24, 15, 5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(214,226,255,0.9)'; ctx.beginPath(); ctx.ellipse(0, 22, 10, 4, 0, 0, TAU); ctx.fill();   // la colle qui dépasse
    ctx.fillStyle = fl ? '#ffd0d4' : '#fffdf4'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; roundRect(-12, -16 + j, 24, 38, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = fl ? '#ffb0b8' : '#f09a3e'; ctx.fillRect(-12, -6 + j, 24, 18); ctx.strokeRect(-12, -6 + j, 24, 18);
    ctx.fillStyle = fl ? '#ffd0d4' : '#7b5ea7'; roundRect(-13, -30, 26, 15, 5); ctx.fill(); ctx.stroke();
    for (const s of [-5, 5]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s, 2 + j, 3.4, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s, 2.6 + j, 1.7, 0, TAU); ctx.fill(); }
  } else if (e.type === 'enveloppe') {   // une enveloppe, un timbre rouge, et un rabat qui s'ouvre
    ctx.rotate(e.rot || 0);
    const op = e.phase === 'open' ? ease(1 - e.pt / ENVEL.open) : 0, w = 21, h = 14;
    ctx.fillStyle = 'rgba(46,46,51,0.14)'; ctx.beginPath(); ctx.ellipse(2, 22, 18, 4.5, 0, 0, TAU); ctx.fill();
    if (op > 0.05) { ctx.fillStyle = fl ? '#ffd0d4' : '#efe2c0'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-w, -h); ctx.lineTo(0, -h - 16 * op); ctx.lineTo(w, -h); ctx.closePath(); ctx.fill(); ctx.stroke(); }
    ctx.fillStyle = fl ? '#ffd0d4' : '#f6efd9'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.fillRect(-w, -h, 2 * w, 2 * h); ctx.strokeRect(-w, -h, 2 * w, 2 * h);
    ctx.strokeStyle = 'rgba(46,46,51,0.45)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.moveTo(-w, h); ctx.lineTo(-3, 1); ctx.moveTo(w, h); ctx.lineTo(3, 1); ctx.stroke();
    if (op <= 0.05) { ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(-w, -h); ctx.lineTo(0, 2); ctx.lineTo(w, -h); ctx.stroke(); }
    ctx.fillStyle = C.red; ctx.fillRect(w - 10, -h + 3, 7, 8);   // le timbre
    for (const s of [-6, 6]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s, 5, op > 0.3 ? 3.6 : 3, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s, 5.5 + j * 0.3, 1.6, 0, TAU); ctx.fill(); }
  }
}
function drawGrandTampon(e, fr, fl) {
  const enraged = e.hp < e.maxHp / 2, j = (fr - 1) * 1.4, h = e.h || 0, ink = e.phase === 'ink';
  ctx.save(); if (enraged || ink) ctx.translate(vrnd(-1.5, 1.5), vrnd(-1.5, 1.5));
  ctx.fillStyle = 'rgba(46,46,51,' + (0.16 - h / GTAMPON.lift * 0.08) + ')'; ctx.beginPath(); ctx.ellipse(0, 76, 82 - h * 0.2, 15, 0, 0, TAU); ctx.fill();
  ctx.translate(0, -h);
  if (ink) { ctx.fillStyle = '#5a2a5a'; ctx.fillRect(-90, 66, 180, 18); }   // le tampon encreur, dessous
  // le caoutchouc, puis le bloc de bois
  ctx.fillStyle = fl ? '#ffd0d4' : '#7a2f7a'; ctx.strokeStyle = '#3e1a3e'; ctx.lineWidth = 2.5; ctx.fillRect(-72, 50, 144, 20); ctx.strokeRect(-72, 50, 144, 20);
  ctx.fillStyle = fl ? '#fff3c0' : '#b07a45'; ctx.strokeStyle = '#5e3c1e'; ctx.lineWidth = 3; roundRect(-66, -14, 132, 64, 6); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(94,60,30,0.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (const y of [0, 14, 30]) { ctx.moveTo(-60, y + j * 0.4); ctx.quadraticCurveTo(0, y + 6, 60, y - 2); } ctx.stroke();   // le fil du bois
  // le manche et sa boule
  ctx.fillStyle = fl ? '#fff3c0' : '#8a5a34'; ctx.strokeStyle = '#5e3c1e'; ctx.lineWidth = 3; ctx.fillRect(-15, -58, 30, 46); ctx.strokeRect(-15, -58, 30, 46);
  ctx.beginPath(); ctx.arc(0, -82, 30, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.beginPath(); ctx.ellipse(-10, -92, 10, 6, -0.5, 0, TAU); ctx.fill();
  // l'étiquette : « VU »
  ctx.fillStyle = '#fffdf4'; ctx.fillRect(-26, 24, 52, 20); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.strokeRect(-26, 24, 52, 20);
  txt('VU', 0, 35, 17, { color: C.red });
  // les yeux, la bouche
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x);
  for (const s of [-1, 1]) {
    const ex = s * 24, ey = 4;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex, ey, 10, 0, TAU); ctx.fill(); ctx.strokeStyle = '#5e3c1e'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(ex + Math.cos(la) * 4, ey + Math.sin(la) * 4 + j * 0.3, 4.5, 0, TAU); ctx.fill();
    if (enraged) { ctx.strokeStyle = '#4a3a2a'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(ex + s * 12, ey - 15); ctx.lineTo(ex - s * 8, ey - 10); ctx.stroke(); }
  }
  ctx.strokeStyle = '#4a3a2a'; ctx.lineWidth = 3; ctx.beginPath();
  if (e.phase === 'up' || e.phase === 'date') ctx.ellipse(0, 18, 7, 5, 0, 0, TAU); else if (enraged) { ctx.moveTo(-10, 19); ctx.lineTo(10, 19); } else ctx.arc(0, 12, 8, 0.4, Math.PI - 0.4);
  ctx.stroke();
  ctx.restore();
}
