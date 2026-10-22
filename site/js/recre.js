// Chapitre X : la récré. La page du cahier neuf est restée ouverte par terre, dans la cour, et la craie a tout envahi.
// Ratures de récré : le calot qui ne sait pas freiner, la toupie qui crache en spirale, la corde à sauter qu'on franchit
// d'un pâté, et l'avion en papier qui pique. Au bout : le Grand Sifflet, et son « un, deux, trois… soleil ! ».
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const NOTES_RECRE = [
  { x: WORLD.w / 2, y: -150, t: '— cahier n° 4 · chapitre X : la récré (la page est restée dans la cour) —', r: -0.02 },
  { x: WORLD.w * 0.72, y: -96, t: 'ajouté : de la craie partout, et du bitume', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'un cahier de poésie ? → oui : avec des rimes !', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'interdit de', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'courir sous', r: -0.05 },
  { x: -160, y: WORLD.h * 0.45 + 88, t: 'le préau', r: -0.04 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'qui a pris mon calot ?', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: 'un, deux, trois… soleil !', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'encore cinq minutes !', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'pas de bousculade', r: 0.05 },
  { x: WORLD.w * 0.3, y: -96, t: 'driiing : c’est l’heure', r: -0.02 }
];
const DICTEES_RECRE = ['CIEL', 'CRAIE', 'BILLE', 'CORDE', 'RONDE', 'PRÉAU', 'TOUPIE', 'MARELLE', 'SIFFLET', 'RÉCRÉATION'];
const RECRE_TYPES = new Set(['calot', 'toupie', 'corde', 'avion']);
Object.assign(ETYPES, {
  calot:   { r: 13, hp: 4, speed: 168, dmg: 1, xp: 1, agil: 1.3 },
  toupie:  { r: 17, hp: 10, speed: 74, dmg: 1, xp: 3, agil: 3 },
  corde:   { r: 18, hp: 18, speed: 58, dmg: 1, xp: 4, agil: 2 },
  avion:   { r: 16, hp: 12, speed: 110, dmg: 1, xp: 4, agil: 2.5 },
  sifflet: { r: 70, hp: 1550, speed: 44, dmg: 2, xp: 230, agil: 1.2, boss: true }
});

CHAPTERS.push({
  num: 'X', name: 'La récré', done: 'La récré : tout le monde en rang !', paper: 'recre', notes: NOTES_RECRE, dictees: DICTEES_RECRE,
  intro: 'Chapitre X : la récré. La page est restée dans la cour…', boss: 'sifflet', bossName: 'Le Grand Sifflet',
  bossIntro: 'Tuuut ! Fin de la récré : voici le Grand Sifflet !', bossBack: 'Le Grand Sifflet reprend son souffle.', bossSound: 'boss10',
  scale: 54, rateOff: 240, rateCap: 21.5, waveCap: 'Toute la cour déboule !',
  meet: {
    calot: 'Nouveau : le calot, une grosse bille qui ne sait pas freiner',
    toupie: 'Nouveau : la toupie. Quand elle s’emballe, elle crache en spirale !',
    corde: 'Nouveau : la corde à sauter. Quand elle touche le sol, saute (un pâté) ou écarte-toi !',
    avion: 'Nouveau : l’avion en papier. Il vise, puis il pique !'
  },
  pick(t, r) {   // pas plus de deux cordes ni de trois avions à la fois
    if (t > 90 && r < 0.08 && countType('avion') < 3) return 'avion';
    if (t > 50 && r < 0.13 && countType('corde') < 2) return 'corde';
    return t > 25 && r < 0.24 && countType('toupie') < 4 ? 'toupie' : 'calot';
  },
  wave(t, i) { return t > 70 && i % 6 === 0 ? 'toupie' : 'calot'; }
});

/* ---------- La page : bitume, poussière de craie, et les dessins de la cour ---------- */
const CRAIES = ['#ffffff', '#ffc4d6', '#fff1a6', '#bfe3ff', '#c8f2c0'];
// les dessins à la craie de la cour : tirés une fois pour toutes, à part du hasard du jeu
const COUR = (() => {
  const r = mulberry32(1919), out = [], kinds = ['soleil', 'coeur', 'fleche', 'maison', 'bonhomme', 'etoile', 'escargot', 'nuage'];
  for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) {
    if (r() < 0.3) continue;
    const cw = (WORLD.w - MARGIN_X) / 6, rh = WORLD.h / 4;
    out.push({ kind: kinds[Math.floor(r() * kinds.length)], x: MARGIN_X + (i + 0.2 + r() * 0.6) * cw, y: (j + 0.2 + r() * 0.6) * rh, s: 0.8 + r() * 0.6, a: (r() - 0.5) * 0.6, col: CRAIES[Math.floor(r() * CRAIES.length)] });
  }
  const grain = [];
  for (let i = 0; i < 900; i++) grain.push([r() * WORLD.w, r() * WORLD.h, 1 + r() * 2.2, r() < 0.5]);
  return { out, grain };
})();
function drawRecre(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = 'rgba(170,166,158,0.42)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // le bitume de la cour, à travers la page
  if (ZOOM > 0.4) {   // le grain du bitume
    for (const g of COUR.grain) if (g[0] > x0 && g[0] < x1 && g[1] > y0 && g[1] < y1) { ctx.fillStyle = g[3] ? 'rgba(90,88,84,0.22)' : 'rgba(255,255,255,0.35)'; ctx.fillRect(g[0], g[1], g[2], g[2]); }
  }
  // les lignes de la cour, peintes en blanc : un grand rond au milieu et le terrain
  ctx.save(); ctx.strokeStyle = 'rgba(255,255,255,0.55)'; ctx.lineWidth = 10; ctx.setLineDash([]);
  const cx = (MARGIN_X + WORLD.w) / 2, cy = WORLD.h / 2;
  ctx.beginPath(); ctx.arc(cx, cy, 300, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx, 120); ctx.lineTo(cx, WORLD.h - 120); ctx.stroke();
  ctx.strokeRect(MARGIN_X + 160, 120, WORLD.w - MARGIN_X - 320, WORLD.h - 240);
  ctx.restore();
  ctx.strokeStyle = C.margin; ctx.globalAlpha = 0.5; ctx.lineWidth = 2.2 / ZOOM; ctx.beginPath(); ctx.moveTo(MARGIN_X, y0); ctx.lineTo(MARGIN_X, y1); ctx.stroke(); ctx.globalAlpha = 1;
  for (const d of COUR.out) if (d.x + 140 > v.x0 && d.x - 140 < v.x1 && d.y + 140 > v.y0 && d.y - 140 < v.y1) drawCraie(d);
}
function drawCraie(d) {   // un dessin d'enfant à la craie, un peu effacé par les semelles
  ctx.save(); ctx.translate(d.x, d.y); ctx.rotate(d.a); ctx.scale(d.s, d.s);
  ctx.strokeStyle = d.col; ctx.globalAlpha = 0.55; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath();
  if (d.kind === 'soleil') { ctx.arc(0, 0, 34, 0, TAU); for (let k = 0; k < 9; k++) { const a = k * TAU / 9; ctx.moveTo(Math.cos(a) * 46, Math.sin(a) * 46); ctx.lineTo(Math.cos(a) * 70, Math.sin(a) * 70); } }
  else if (d.kind === 'coeur') { ctx.moveTo(0, 40); ctx.bezierCurveTo(-70, -10, -30, -60, 0, -22); ctx.bezierCurveTo(30, -60, 70, -10, 0, 40); }
  else if (d.kind === 'fleche') { ctx.moveTo(-80, 0); ctx.lineTo(70, 0); ctx.moveTo(40, -28); ctx.lineTo(72, 0); ctx.lineTo(40, 28); }
  else if (d.kind === 'maison') { ctx.rect(-40, -10, 80, 60); ctx.moveTo(-52, -6); ctx.lineTo(0, -56); ctx.lineTo(52, -6); ctx.rect(-10, 20, 20, 30); }
  else if (d.kind === 'bonhomme') { ctx.arc(0, -40, 18, 0, TAU); ctx.moveTo(0, -22); ctx.lineTo(0, 24); ctx.lineTo(-20, 60); ctx.moveTo(0, 24); ctx.lineTo(20, 60); ctx.moveTo(-30, -6); ctx.lineTo(30, -6); }
  else if (d.kind === 'etoile') { for (let k = 0; k <= 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? 20 : 50; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } }
  else if (d.kind === 'escargot') { for (let k = 0; k < 40; k++) { const a = k * 0.42, rr = 4 + k * 1.1; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.moveTo(40, 10); ctx.lineTo(-60, 30); ctx.lineTo(-70, 10); }
  else { ctx.arc(-30, 0, 26, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(0, -16, 30, Math.PI, 0); ctx.arc(32, 0, 26, Math.PI * 1.5, Math.PI * 0.5); ctx.closePath(); }
  ctx.stroke(); ctx.restore();
}

/* ---------- Les ratures de récré ---------- */
const TOUPIE = { spin: 0.7, n: 10, speed: 215 };
const CORDE = { len: 150, turn: 1.35, low: 0.22, reach: 16 };
const AVION = { keep: 380, aim: 0.7, dive: 1.1, speed: 540 };
function stepRecre(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  if (e.type === 'calot') {   // il roule, il ne sait pas freiner : il dépasse, fait demi-tour, et revient
    e.rot += Math.hypot(e.vx, e.vy) * dt / e.r;
  } else if (e.type === 'toupie') {   // elle tourne en titubant, s'emballe, puis crache ses gouttes en spirale
    e.pt -= dt;
    const w = Math.sin(G.t * 2.3 + e.id) * 0.9;
    MV.x += -dy / d * e.speed * w; MV.y += dx / d * e.speed * w;
    if (d < 200) { MV.x *= -0.3; MV.y *= -0.3; }
    if (e.phase === 'walk') {
      e.rot += dt * 9;
      if (e.pt <= 0 && d < 560 && !hid) { e.phase = 'spin'; e.pt = TOUPIE.spin; AU.play('toupieWarn'); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else {
      MV.x = 0; MV.y = 0; e.rot += dt * 30;
      if (e.pt <= 0) {
        const off = rnd(TAU);
        for (let i = 0; i < TOUPIE.n; i++) { const a = off + i / TOUPIE.n * TAU; G.ebul.push({ x: e.x + Math.cos(a) * 20, y: e.y + Math.sin(a) * 20, vx: Math.cos(a) * TOUPIE.speed, vy: Math.sin(a) * TOUPIE.speed, life: 3.4, a, wait: i * 0.045 }); }
        e.phase = 'walk'; e.pt = rnd(3, 3.8); AU.play('toupieFire');
      }
    }
  } else if (e.type === 'corde') {   // deux poignées, la corde tourne : elle frappe le sol à chaque tour
    if (e.ang === undefined) { e.ang = Math.atan2(dy, dx) + Math.PI / 2; e.cyc = rnd(1); }
    let da = Math.atan2(dy, dx) + Math.PI / 2 - e.ang; while (da > Math.PI / 2) da -= Math.PI; while (da < -Math.PI / 2) da += Math.PI;
    e.ang += clamp(da, -dt * 0.7, dt * 0.7);   // elle se met en travers de ton chemin
    const before = e.cyc; e.cyc = (e.cyc + dt / CORDE.turn) % 1;
    if (e.cyc < before) { e.hitSol = false; if (d < 700) AU.play('cordeClac'); }
    if (e.cyc > 1 - CORDE.low && !e.hitSol) cordeHit(e);
  } else if (e.type === 'avion') {   // il plane autour de toi, vise, puis pique en ligne droite
    e.pt -= dt;
    if (e.phase === 'walk') {
      const away = d < AVION.keep ? -0.7 : 0.6;
      MV.x = (dx / d * away - dy / d * 0.9) * e.speed * slow; MV.y = (dy / d * away + dx / d * 0.9) * e.speed * slow;
      e.rot = Math.atan2(e.vy, e.vx);
      if (e.pt <= 0 && d < 640 && !hid) { e.phase = 'aim'; e.pt = AVION.aim; e.aimA = Math.atan2(dy, dx); AU.play('avionAim'); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else if (e.phase === 'aim') {
      MV.x = 0; MV.y = 0; e.aimA += clamp(Math.atan2(dy, dx) - e.aimA, -dt, dt); e.rot = e.aimA;
      if (e.pt <= 0) { e.phase = 'dive'; e.pt = AVION.dive; AU.play('avionDive'); }
    } else {
      e.aimA += clamp(Math.atan2(dy, dx) - e.aimA, -dt * 0.5, dt * 0.5); e.rot = e.aimA;
      MV.x = Math.cos(e.aimA) * AVION.speed; MV.y = Math.sin(e.aimA) * AVION.speed; MV.agil = 16;
      if (e.pt <= 0) { e.phase = 'walk'; e.pt = rnd(2.6, 3.6); }
    }
  }
}
function cordeEnds(e) { const c = Math.cos(e.ang) * CORDE.len, s = Math.sin(e.ang) * CORDE.len; return [e.x - c, e.y - s, e.x + c, e.y + s]; }
function cordeHit(e) {   // la corde au sol : un pâté (on saute !) ou être ailleurs
  const p = G.p, [x1, y1, x2, y2] = cordeEnds(e);
  if (p.inv > 0 || p.dashT > 0) return;
  if (segDist(p.x, p.y, x1, y1, x2, y2) < CORDE.reach + p.r * 0.5) {
    e.hitSol = true; hurtPlayer(1, e.x, e.y);
    if (!G.cordeSeen) { G.cordeSeen = true; caption('La corde t’a eu ! Un pâté fait sauter par-dessus.', 2.8, 'pink'); }
  }
}

/* ---------- Le Grand Sifflet ---------- */
const SIFFLET = { waveSpeed: 360, waveR: 1100, gap: 0.95, band: 16, count: 1.9, look: 1.5, grace: 0.28, ballR: 26, ballSpeed: 380, ballLife: 4.6 };
function stepSifflet(e, dt, dx, dy, d, slow) {
  const want = d < 300 ? -0.5 : 1;
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow * want; MV.y = dy / d * e.speed * slow * want;
  if (e.enter > 0) e.enter = Math.max(0, e.enter - dt * 0.5);
  const enraged = e.hp < e.maxHp / 2, p = G.p;
  e.blow = Math.max(0, (e.blow || 0) - dt);
  e.pt -= dt;
  if (e.phase === 'cast') { MV.x *= 0.15; MV.y *= 0.15; if (e.pt <= 0) { e.phase = 'walk'; e.atk = enraged ? 1 : 1.5; } return; }
  if (G.soleil) { MV.x = 0; MV.y = 0; return; }   // il compte, puis il regarde : il ne bouge pas
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % (enraged ? 4 : 3);
  if (m === 1) {   // coups de sifflet : des ondes en anneau, chacune avec une ouverture
    const n = enraged ? 4 : 3, base = Math.atan2(dy, dx) + rnd(1.2, 2.2) * (rand() < 0.5 ? -1 : 1);
    for (let i = 0; i < n; i++) G.sifflets.push({ x: e.x, y: e.y, t: -i * 0.55, gapA: base + i * (enraged ? 1.4 : 1.1) * (i % 2 ? -1 : 1), hit: false });
    e.blow = 0.55 * n; AU.play('sifflet'); e.phase = 'cast'; e.pt = 0.8 + n * 0.55;
    if (!G.siffletSeen) { G.siffletSeen = true; caption('Coups de sifflet ! Passe par l’ouverture de chaque onde.', 2.8, 'pink'); }
  } else if (m === 2) {   // un, deux, trois… soleil !
    G.soleil = { phase: 'count', t: 0, dur: enraged ? SIFFLET.count * 0.65 : SIFFLET.count, look: enraged ? SIFFLET.look * 1.3 : SIFFLET.look, caught: false, said: 0 };
    e.phase = 'cast'; e.pt = 99;
  } else if (m === 0 && !enraged || m === 3) {   // la balle au prisonnier : des ballons qui rebondissent sur les bords de la page
    const n = enraged ? 3 : 2;
    for (let i = 0; i < n; i++) {
      const lead = 0.5 + i * 0.25, tx = p.x + p.vx * lead, ty = p.y + p.vy * lead, a = Math.atan2(ty - e.y, tx - e.x) + (i - (n - 1) / 2) * 0.35;
      G.balles.push({ x: e.x + Math.cos(a) * 80, y: e.y + Math.sin(a) * 80, vx: Math.cos(a) * SIFFLET.ballSpeed, vy: Math.sin(a) * SIFFLET.ballSpeed, t: -0.6 - i * 0.2, life: SIFFLET.ballLife, rot: 0 });
    }
    AU.play('balleThrow'); e.phase = 'cast'; e.pt = 1.4;
    if (!G.balleSeen) { G.balleSeen = true; caption('La balle au prisonnier ! Les ballons rebondissent sur les bords.', 2.8, 'pink'); }
  } else {   // colère : il siffle le rassemblement
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + G.t; spawnEnemy(i < 3 ? 'toupie' : 'calot', e.x + Math.cos(a) * 170, e.y + Math.sin(a) * 170); }
    caption('Rassemblement ! Toute la cour accourt.', 1.8, 'pink'); AU.play('sifflet'); e.blow = 0.6; e.atk = 2;
  }
}
// « un, deux, trois… soleil ! » : pendant qu'il compte, tout bouge ; quand il se retourne, tout le monde se fige, toi aussi
function stepUnDeuxTrois(dt) {
  const S = G.soleil, p = G.p;
  if (!S) { G.freeze = 0; return; }
  if (!G.boss) { G.soleil = null; G.freeze = 0; return; }
  S.t += dt;
  if (S.phase === 'count') {
    const k = Math.min(3, Math.floor(S.t / S.dur * 4));
    if (k > S.said - 1 && S.said < 3) { S.said++; AU.play('soleilCount', S.said); }
    if (!G.soleilSeen && S.t < dt * 1.5) { G.soleilSeen = true; caption('Un, deux, trois… soleil ! Quand il se retourne, ne bouge plus !', 3.4, 'pink'); }
    if (S.t >= S.dur) { S.phase = 'look'; S.t = 0; G.freeze = 1; AU.play('soleilLook'); G.cam.shake = Math.max(G.cam.shake, 6); }
  } else {
    G.freeze = 1;
    if (!S.caught && S.t > SIFFLET.grace && p.moving && p.inv <= 0) {   // bougé !
      S.caught = true; G.bouges = (G.bouges || 0) + 1; hurtPlayer(1, G.boss.x, G.boss.y);
      caption(pick(['Bougé ! Je t’ai vu !', 'Tu as bougé !', 'Vu ! Tu as bougé !']), 2, 'pink'); AU.play('soleilCaught');
    }
    if (S.t >= S.look) {
      if (!S.caught) { G.immobiles = (G.immobiles || 0) + 1; addText(p.x, p.y - 34, 'pas bougé !', C.ink, 26); }
      G.soleil = null; G.freeze = 0;
      if (G.boss && G.boss.phase === 'cast') G.boss.pt = 0.4;
    }
  }
}
function stepRecreFx(dt) {
  if (CH().paper !== 'recre' && CH().paper !== 'textes') return;   // et la récré du cahier de textes
  stepUnDeuxTrois(dt);
  if (G.freeze) return;   // tout le monde s'est figé
  const p = G.p, safe = p.inv > 0 || p.dashT > 0;
  for (const w of G.sifflets) {
    w.t += dt; if (w.t < 0) continue;
    const r = w.t * SIFFLET.waveSpeed;
    if (!w.hit && !safe && Math.abs(Math.hypot(p.x - w.x, p.y - w.y) - r) < SIFFLET.band + p.r * 0.5 && !inGap(w, p.x, p.y)) { w.hit = true; hurtPlayer(1, w.x, w.y); }
  }
  G.sifflets = G.sifflets.filter(w => w.t * SIFFLET.waveSpeed < SIFFLET.waveR);
  for (const b of G.balles) {
    b.t += dt; if (b.t < 0) continue;
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt; b.rot += dt * 6;
    const R = SIFFLET.ballR;
    if (b.x < R || b.x > WORLD.w - R) { b.vx = -b.vx; b.x = clamp(b.x, R, WORLD.w - R); AU.play('balleBounce'); }
    if (b.y < R || b.y > WORLD.h - R) { b.vy = -b.vy; b.y = clamp(b.y, R, WORLD.h - R); AU.play('balleBounce'); }
    if (!safe && (p.x - b.x) ** 2 + (p.y - b.y) ** 2 < (R + p.r * 0.6) ** 2) hurtPlayer(1, b.x, b.y);
  }
  G.balles = G.balles.filter(b => b.life > 0);
}
function inGap(w, x, y) { let a = Math.atan2(y - w.y, x - w.x) - w.gapA; while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return Math.abs(a) < SIFFLET.gap / 2; }
function recreDanger(x, y) {
  let s = 0;
  for (const w of G.sifflets) { if (w.t < -0.3) continue; const r = Math.max(0, w.t) * SIFFLET.waveSpeed, dd = Math.abs(Math.hypot(x - w.x, y - w.y) - r - 40); if (dd < 60 && !inGap(w, x, y)) s += 3 + (60 - dd) * 0.05; else if (dd < 60) s -= 1.5; }
  for (const b of G.balles) { const d = Math.hypot(x - b.x - b.vx * 0.25, y - b.y - b.vy * 0.25); if (d < SIFFLET.ballR + 60) s += 3.5; }
  for (const e of G.enemies) {
    if (e.type === 'corde' && e.ang !== undefined) { const [x1, y1, x2, y2] = cordeEnds(e), dd = segDist(x, y, x1, y1, x2, y2); if (dd < 50) s += e.cyc > 0.55 ? 4 : 1.5; }
    else if (e.type === 'avion' && e.phase !== 'walk') { const dd = segDist(x, y, e.x, e.y, e.x + Math.cos(e.aimA) * 600, e.y + Math.sin(e.aimA) * 600); if (dd < 50) s += 3; }
    else if (e.type === 'toupie' && e.phase === 'spin') { const dd = Math.hypot(x - e.x, y - e.y); if (dd < 160) s += 1.5; }
  }
  return s + marelleDanger(x, y);
}
// le pilote : quand le Grand Sifflet se retourne, il ne touche plus à rien
function soleilFreezeBot() { return !!(G.soleil && (G.soleil.phase === 'look' || G.soleil.t > G.soleil.dur - 0.12)); }

/* ---------- Dessins ---------- */
function drawRecreFx() {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const e of G.enemies) {
    if (e.type === 'toupie' && e.phase === 'spin') {   // elle s'emballe : un cercle en pointillés qui rétrécit
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.35 + 0.3 * Math.sin(G.time * 26); ctx.setLineDash([8, 7]); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(e.x, e.y, 30 + 50 * clamp(e.pt / TOUPIE.spin, 0, 1), 0, TAU); ctx.stroke(); ctx.restore();
    } else if (e.type === 'avion' && e.phase === 'aim') {   // la trajectoire du piqué
      ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.aimA); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 24); ctx.setLineDash([12, 9]); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(24, 0); ctx.lineTo(600, 0); ctx.stroke(); ctx.restore();
    }
  }
  for (const w of G.sifflets) {   // les ondes du sifflet, avec leur ouverture
    if (w.t < 0) {   // annoncée : le trait d'ouverture, en pointillés
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.35; ctx.setLineDash([6, 8]); ctx.lineWidth = 2; ctx.beginPath();
      for (const s of [-1, 1]) { const a = w.gapA + s * SIFFLET.gap / 2; ctx.moveTo(w.x + Math.cos(a) * 90, w.y + Math.sin(a) * 90); ctx.lineTo(w.x + Math.cos(a) * 260, w.y + Math.sin(a) * 260); }
      ctx.stroke(); ctx.restore(); continue;
    }
    const r = w.t * SIFFLET.waveSpeed, fade = 1 - r / SIFFLET.waveR;
    ctx.save(); ctx.globalAlpha = 0.8 * fade; ctx.strokeStyle = '#4d7fd6'; ctx.lineWidth = 6; ctx.beginPath();
    const a0 = w.gapA + SIFFLET.gap / 2, span = TAU - SIFFLET.gap, n = Math.max(24, Math.floor(r / 6));
    for (let i = 0; i <= n; i++) { const a = a0 + span * i / n, rr = r + Math.sin(a * 14 + w.t * 20) * 5; i ? ctx.lineTo(w.x + Math.cos(a) * rr, w.y + Math.sin(a) * rr) : ctx.moveTo(w.x + Math.cos(a) * rr, w.y + Math.sin(a) * rr); }
    ctx.stroke(); ctx.globalAlpha = 0.25 * fade; ctx.lineWidth = 18; ctx.stroke(); ctx.restore();
  }
  for (const b of G.balles) {   // les ballons de la balle au prisonnier
    if (b.t < 0) {
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.4; ctx.setLineDash([10, 8]); ctx.lineWidth = 2.5; const n = Math.hypot(b.vx, b.vy) || 1;
      ctx.beginPath(); ctx.moveTo(b.x, b.y); ctx.lineTo(b.x + b.vx / n * 520, b.y + b.vy / n * 520); ctx.stroke(); ctx.restore();
    }
    ctx.save(); ctx.globalAlpha = b.t < 0 ? 0.45 : Math.min(1, b.life * 2);
    ctx.fillStyle = 'rgba(46,46,51,0.2)'; ctx.beginPath(); ctx.ellipse(b.x + 6, b.y + SIFFLET.ballR * 0.8, SIFFLET.ballR * 0.9, SIFFLET.ballR * 0.35, 0, 0, TAU); ctx.fill();
    ctx.translate(b.x, b.y); ctx.rotate(b.rot);
    ctx.fillStyle = '#e04848'; ctx.strokeStyle = '#8e2222'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, SIFFLET.ballR, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#fff5e8'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, SIFFLET.ballR * 0.62, -0.9, 0.9); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, SIFFLET.ballR * 0.62, Math.PI - 0.9, Math.PI + 0.9); ctx.stroke();
    ctx.restore();
  }
}
// au-dessus de tout : le compte du Grand Sifflet, puis « soleil ! »
function drawSoleilScreen() {
  const S = G.soleil; if (!S || G.state !== 'play') return;
  if (S.phase === 'count') {
    const k = Math.min(3, Math.floor(S.t / S.dur * 4)), words = ['Un…', 'deux…', 'trois…'];
    const shown = words.slice(0, Math.max(1, k)).join(' ');
    txt(shown, W / 2, H * 0.3, 54 * U, { color: C.graphite, hl: C.hl, rot: -0.02 });
  } else {
    const q = S.t / S.look;
    ctx.save(); ctx.fillStyle = 'rgba(255,214,90,' + (0.18 * (1 - q)) + ')'; ctx.fillRect(0, 0, W, H); ctx.restore();
    txt('SOLEIL !', W / 2, H * 0.3, (78 + 10 * Math.sin(Math.min(1, S.t * 6) * Math.PI)) * U, { color: C.red, hl: C.hlGold, rot: 0.03 });
    txt(S.caught ? 'bougé…' : 'ne bouge plus !', W / 2, H * 0.3 + 64 * U, 30 * U, { color: S.caught ? C.red : C.ink, alpha: 0.9 });
  }
}

function drawRecreEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const j = (fr - 1) * 0.8;
  if (e.type === 'calot') {   // une grosse bille de verre, avec sa spirale de couleur
    const col = ['#e9524a', '#3c8fc4', '#6cbf6a', '#f19a3e'][e.id % 4];
    ctx.fillStyle = 'rgba(46,46,51,0.18)'; ctx.beginPath(); ctx.ellipse(3, e.r * 0.8, e.r, e.r * 0.35, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = fl ? '#ffd0d4' : 'rgba(225,238,250,0.92)'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, e.r, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.save(); ctx.rotate(e.rot); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-e.r * 0.7, 0); ctx.bezierCurveTo(-e.r * 0.2, -e.r * 0.9, e.r * 0.2, e.r * 0.9, e.r * 0.7, 0); ctx.stroke(); ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.ellipse(-e.r * 0.35, -e.r * 0.4, e.r * 0.22, e.r * 0.13, -0.6, 0, TAU); ctx.fill();
    for (const s of [-4, 4]) { ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + j, -2, 2.1, 0, TAU); ctx.fill(); }
  } else if (e.type === 'toupie') {   // une toupie de bois peinte, sur sa pointe
    const tilt = e.phase === 'spin' ? vrnd(-0.08, 0.08) : Math.sin(G.t * 3 + e.id) * 0.15;
    ctx.rotate(tilt);
    ctx.fillStyle = 'rgba(46,46,51,0.18)'; ctx.beginPath(); ctx.ellipse(0, 20, 14, 5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = fl ? '#ffd0d4' : '#e9a23b'; ctx.strokeStyle = '#7a4a14'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(-22, -4); ctx.quadraticCurveTo(-20, 8, 0, 21); ctx.quadraticCurveTo(20, 8, 22, -4); ctx.quadraticCurveTo(0, -14, -22, -4); ctx.fill(); ctx.stroke();
    const band = ((e.rot % TAU) + TAU) % TAU;
    for (let k = 0; k < 3; k++) { const x = Math.sin(band + k * 2.1) * 18; if (Math.cos(band + k * 2.1) < 0) continue; ctx.strokeStyle = ['#e9524a', '#3c8fc4', '#6cbf6a'][k]; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, -9); ctx.lineTo(x * 0.6, 9); ctx.stroke(); }
    ctx.fillStyle = '#7a4a14'; ctx.fillRect(-2.5, -24, 5, 12);
    for (const s of [-7, 7]) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(s, -4, 3.6, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + (e.phase === 'spin' ? vrnd(-1, 1) : 0.8), -3.5, 1.8, 0, TAU); ctx.fill(); }
  } else if (e.type === 'corde') {   // deux poignées de bois, et la corde qui tourne
    if (e.ang === undefined) return;
    const L = CORDE.len, c = Math.cos(e.ang), s = Math.sin(e.ang), q = e.cyc || 0, low = q > 1 - CORDE.low;
    const lift = Math.sin(q * Math.PI) * 70;   // vue d'en haut : plus elle monte, plus elle se gonfle de côté
    ctx.save(); ctx.rotate(e.ang);
    ctx.strokeStyle = low ? (fl ? C.ink : '#d23c3c') : 'rgba(80,60,40,0.55)'; ctx.lineWidth = low ? 5 : 3; if (!low) ctx.setLineDash([10, 7]);
    ctx.beginPath(); ctx.moveTo(-L, 0); ctx.quadraticCurveTo(0, lift * 1.3, L, 0); ctx.stroke(); ctx.setLineDash([]);
    if (!low) { ctx.globalAlpha = 0.18; ctx.strokeStyle = C.graphite; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-L, 0); ctx.lineTo(L, 0); ctx.stroke(); ctx.globalAlpha = 1; }
    for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * L, 0); ctx.rotate(sx * 0.3); ctx.fillStyle = '#c8423f'; ctx.strokeStyle = '#6e1f1d'; ctx.lineWidth = 2; roundRect(-7, -18, 14, 36, 6); ctx.fill(); ctx.stroke(); ctx.restore(); }
    ctx.restore();
    // le nœud du milieu, avec des yeux : c'est lui qu'il faut biffer
    ctx.fillStyle = fl ? '#ffd0d4' : '#f2e2c4'; ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(0, 0, e.r, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(122,90,58,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(-4, 2, e.r * 0.6, 0.5, 3.5); ctx.stroke();
    const la = Math.atan2(G.p.y - e.y, G.p.x - e.x);
    for (const sx of [-6, 6]) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(sx, -3, 4.5, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(sx + Math.cos(la) * 1.8, -3 + Math.sin(la) * 1.8, 2.2, 0, TAU); ctx.fill(); }
    if (low) txt('clac !', 0, -34, 20, { color: C.red, rot: 0.1 });
  } else if (e.type === 'avion') {   // un avion en papier plié dans une feuille de cahier
    ctx.rotate(e.rot);
    ctx.fillStyle = 'rgba(46,46,51,0.15)'; ctx.beginPath(); ctx.moveTo(30, 14); ctx.lineTo(-22, 2); ctx.lineTo(-18, 30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = fl ? '#ffd0d4' : '#fdfcf6'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.moveTo(28, 0); ctx.lineTo(-22, -18 - j); ctx.lineTo(-14, 0); ctx.lineTo(-22, 18 + j); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-18, -9); ctx.lineTo(16, -3); ctx.moveTo(-18, 9); ctx.lineTo(16, 3); ctx.stroke();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(28, 0); ctx.lineTo(-14, 0); ctx.stroke();
    for (const s of [-1, 1]) { ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(10, s * 4, 1.8, 0, TAU); ctx.fill(); }
  }
}
function drawSifflet(e, fr, fl) {
  const enraged = e.hp < e.maxHp / 2, j = (fr - 1) * 1.5, back = G.soleil && G.soleil.phase === 'count';
  const look = G.soleil && G.soleil.phase === 'look';
  ctx.save(); if (enraged) ctx.translate(vrnd(-1.5, 1.5), vrnd(-1.5, 1.5));
  if (e.blow > 0) for (let k = 0; k < 3; k++) {   // le souffle qui sort du bec
    const q = (G.time * 3 + k / 3) % 1;
    ctx.save(); ctx.globalAlpha = 0.6 * (1 - q); ctx.strokeStyle = '#4d7fd6'; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(-110 - q * 60, -10, 16 + q * 30, -0.9, 0.9); ctx.stroke(); ctx.restore();
  }
  ctx.scale(back ? -1 : 1, 1);   // de dos, il compte : il regarde ailleurs
  // le cordon autour du cou
  ctx.strokeStyle = '#3c8fc4'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(40, -50); ctx.bezierCurveTo(120, -140, -40, -170, -30, -60); ctx.stroke();
  // le bec
  ctx.fillStyle = fl ? '#fff3c0' : '#d9dde3'; ctx.strokeStyle = '#5b6068'; ctx.lineWidth = 3;
  roundRect(-110, -30, 90, 40, 8); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#5b6068'; ctx.fillRect(-112, -18, 8, 16);
  // le corps rond, en métal brillant
  const g = ctx.createRadialGradient(-20, -30, 10, 10, 0, 80);
  g.addColorStop(0, fl ? '#ffffff' : '#f4f6f8'); g.addColorStop(1, fl ? '#ffd0d4' : '#9ea5ae');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(14, 4, 64 + j * 0.5, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(46,46,51,0.75)'; ctx.fillRect(-26, -32, 26, 12);   // la fente
  // la petite bille dedans, qui roule quand il siffle
  const ba = G.time * (e.blow > 0 ? 24 : 2);
  ctx.fillStyle = '#e9a23b'; ctx.beginPath(); ctx.arc(14 + Math.cos(ba) * 18, 14 + Math.sin(ba) * 10, 9, 0, TAU); ctx.fill();
  ctx.restore();
  if (back) { txt('…', 0, -86, 40, { color: C.graphite }); return; }
  // les yeux (grands ouverts quand il regarde), et les sourcils
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x), R = look ? 17 : 13;
  for (const s of [-1, 1]) {
    const ex = 14 + s * 26, ey = -10;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex, ey, R, 0, TAU); ctx.fill(); ctx.strokeStyle = '#5b6068'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(ex + Math.cos(la) * 5, ey + Math.sin(la) * 5, look ? 7 : 5.5, 0, TAU); ctx.fill();
    if (enraged || look) { ctx.strokeStyle = '#3a3d42'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ex + s * 12, ey - R - 12); ctx.lineTo(ex - s * 12, ey - R - (look ? 12 : 3)); ctx.stroke(); }
  }
  ctx.strokeStyle = '#3a3d42'; ctx.lineWidth = 3.5; ctx.beginPath();
  if (look) { ctx.arc(14, 38, 9, 0, TAU); } else if (enraged) { ctx.moveTo(-4, 40); ctx.lineTo(32, 40); } else ctx.arc(14, 26, 16, 0.4, Math.PI - 0.4);
  ctx.stroke();
}
