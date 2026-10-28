'use strict';

const NOTES_BULLETIN = [
  { x: WORLD.w / 2, y: -150, t: '— carnet n° 8 · chapitre XIV : le bulletin —', r: -0.02 },
  { x: WORLD.w * 0.72, y: -96, t: 'ajouté : des contrôles surprise', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'les grandes vacances ? → d’abord, la kermesse !', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'à faire', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'signer', r: -0.05 },
  { x: -160, y: WORLD.h * 0.45 + 88, t: 'aussi', r: -0.04 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'passe dans la classe supérieure', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: 'un zéro pointé, ça roule vite !', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'moyenne de la classe : 13,5', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: '3e trimestre', r: 0.05 },
  { x: WORLD.w * 0.3, y: -96, t: 'à rendre signé', r: -0.02 }
];
const DICTEES_BULLETIN = ['NOTE', 'BRAVO', 'MENTION', 'TRIMESTRE', 'MOYENNE', 'CONTRÔLE', 'CONSEIL', 'PROGRÈS', 'APPRÉCIATION', 'FÉLICITATIONS'];
const BULLETIN_TYPES = new Set(['zeropointe', 'note20']);
Object.assign(ETYPES, {
  zeropointe:    { r: 20, hp: 14, speed: 58, dmg: 1, xp: 4, agil: 2 },
  note20:        { r: 22, hp: 20, speed: 66, dmg: 1, xp: 4, agil: 3 },
  grandbulletin: { r: 74, hp: 1000, speed: 46, dmg: 2, xp: 250, agil: 1.2, boss: true }
});
const enBulletin = () => CH().paper === 'bulletin';

CHAPTERS.push({
  num: 'XIV', name: 'Le bulletin', done: 'Le bulletin : passe dans la classe supérieure !', paper: 'bulletin', notes: NOTES_BULLETIN, dictees: DICTEES_BULLETIN,
  intro: 'Chapitre XIV : le bulletin. Attention, contrôle surprise…', boss: 'grandbulletin', bossName: 'Le Grand Bulletin',
  bossIntro: 'Le conseil de classe est réuni : voici le Grand Bulletin !', bossBack: 'Le Grand Bulletin revient pour un nouveau trimestre.', bossSound: 'boss14',
  scale: 54, rateOff: 240, rateCap: 20.5, waveCap: 'Toute la classe en même temps !',
  meet: {
    zeropointe: 'Nouveau : le zéro pointé. Il vise… puis il roule !',
    note20: 'Nouveau : la note sur vingt. Biffée, elle se coupe en deux !'
  },
  pick(t, r) {
    if (t > 12 && r < 0.08 && countType('zeropointe') < 5) return 'zeropointe';
    if (t > 20 && r < 0.16 && countType('note20') < 5) return 'note20';
    if (t > 45 && r < 0.21 && countType('tache') < 8) return 'tache';
    if (t > 15 && r < 0.45) return 'biffure';
    return 'gribouillis';
  },
  wave(t, i) { return i % 4 === 0 ? 'zeropointe' : t > 90 && i % 4 === 2 ? 'note20' : 'gribouillis'; }
});

// le bulletin imprimé sur la page : les matières, et les notes des contrôles qu'on y écrit en jouant
const MATIERES = ['Dictée', 'Musique', 'Géométrie', 'Géographie', 'Écriture', 'Calcul', 'Poésie', 'Sport'];
const BTAB = { x0: 320, x1: WORLD.w - 320, y0: 330, head: 70, row: 172, c1: 900, c2: 1210 };
function drawBulletin(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = 'rgba(214,226,240,0.28)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // un papier bleuté, comme les vrais bulletins
  ctx.strokeStyle = C.margin; ctx.globalAlpha = 0.55; ctx.lineWidth = 2.2 / ZOOM; ctx.beginPath(); ctx.moveTo(MARGIN_X, y0); ctx.lineTo(MARGIN_X, y1); ctx.stroke(); ctx.globalAlpha = 1;
  if (v.y0 < 300) {
    txt('Bulletin scolaire · 3e trimestre', WORLD.w / 2, 150, 64, { font: FONT_CURSIVE, weight: 400, color: '#2d4f7c', alpha: 0.5 });
    txt('Élève : la goutte d’encre      Classe : cahier n° 1', WORLD.w / 2, 240, 34, { color: '#2d4f7c', alpha: 0.45, weight: 400 });
  }
  const T = BTAB, yb = T.y0 + T.head + MATIERES.length * T.row;
  if (T.x1 < v.x0 || T.x0 > v.x1 || yb < v.y0 || T.y0 > v.y1) return;
  ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#2d4f7c'; ctx.lineWidth = 3; ctx.strokeRect(T.x0, T.y0, T.x1 - T.x0, yb - T.y0);
  ctx.fillStyle = 'rgba(45,79,124,0.14)'; ctx.fillRect(T.x0, T.y0, T.x1 - T.x0, T.head);
  ctx.beginPath(); ctx.moveTo(T.c1, T.y0); ctx.lineTo(T.c1, yb); ctx.moveTo(T.c2, T.y0); ctx.lineTo(T.c2, yb);
  for (let k = 0; k <= MATIERES.length; k++) { const y = T.y0 + T.head + k * T.row; ctx.moveTo(T.x0, y); ctx.lineTo(T.x1, y); }
  ctx.stroke();
  ctx.font = '700 30px ' + FONT_MAIN; ctx.fillStyle = '#1f3a5f'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.fillText('MATIÈRES', T.x0 + 24, T.y0 + T.head / 2); ctx.fillText('NOTES', T.c1 + 24, T.y0 + T.head / 2); ctx.fillText('APPRÉCIATIONS', T.c2 + 24, T.y0 + T.head / 2);
  ctx.font = '400 44px ' + FONT_MAIN;
  MATIERES.forEach((m, k) => ctx.fillText(m, T.x0 + 30, T.y0 + T.head + (k + 0.5) * T.row));
  ctx.font = '400 40px ' + FONT_MAIN; ctx.fillStyle = 'rgba(31,58,95,0.5)';
  MATIERES.forEach((m, k) => { if (!(G.bulletin || [])[k]) ctx.fillText('…… / 20', T.c1 + 40, T.y0 + T.head + (k + 0.5) * T.row); });
  ctx.restore();
  for (const [k, b] of (G.bulletin || []).entries()) {   // les notes des contrôles, au stylo rouge
    if (!b) continue;
    const y = T.y0 + T.head + (k + 0.5) * T.row, a = Math.min(1, (G.t - b.at) * 2);
    txt(b.note + ' / 20', T.c1 + 150, y, 60, { font: FONT_CURSIVE, weight: 400, color: C.red, alpha: 0.85 * a, rot: -0.04 });
    txt(b.appr, T.c2 + 40, y, 50, { font: FONT_CURSIVE, weight: 400, color: C.red, alpha: 0.8 * a, align: 'left', rot: -0.015 });
    if (b.note >= 10) drawMention(T.x1 - 170, y, b.note, 0.55 * a);
  }
}
const mentionOf = n => n >= 20 ? 'Félicitations' : n >= 17 ? 'Très bien' : n >= 14 ? 'Bien' : n >= 12 ? 'Assez bien' : n >= 10 ? 'Passable' : '';
function drawMention(x, y, n, alpha, g = ctx) {   // le tampon de la mention, en rond
  g.save(); g.translate(x, y); g.rotate(-0.2); g.globalAlpha = alpha;
  const col = n >= 17 ? '#c9952a' : '#3c8a3c';
  g.strokeStyle = col; g.lineWidth = 5; g.beginPath(); g.arc(0, 0, 66, 0, TAU); g.stroke(); g.lineWidth = 2; g.beginPath(); g.arc(0, 0, 56, 0, TAU); g.stroke();
  g.fillStyle = col; g.font = '700 ' + (n >= 20 ? 21 : 25) + 'px ' + FONT_MAIN; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(mentionOf(n), 0, 2);
  g.restore();
}

/* ----- les ratures du bulletin ----- */
const ZERO = { range: 480, aim: 0.55, roll: 0.9, speed: 440 };
function stepBulletinEnemy(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  if (e.type === 'zeropointe') {   // il vise, recule un peu… puis roule tout droit
    e.pt -= dt;
    if (e.phase === 'walk') {
      e.rot += dt * 2;
      if (e.pt <= 0 && d < ZERO.range && !hid) { e.phase = 'aim'; e.pt = ZERO.aim; e.cx = dx / d; e.cy = dy / d; AU.play('zeroAim'); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else if (e.phase === 'aim') {
      MV.x = -dx / d * 30; MV.y = -dy / d * 30; e.rot -= dt * 9;
      e.cx = lerp(e.cx, dx / d, dt * 3); e.cy = lerp(e.cy, dy / d, dt * 3);
      if (e.pt <= 0) { const n = Math.hypot(e.cx, e.cy) || 1; e.cx /= n; e.cy /= n; e.phase = 'roll'; e.pt = ZERO.roll; AU.play('zeroRoll'); }
    } else {
      MV.x = e.cx * ZERO.speed; MV.y = e.cy * ZERO.speed; MV.agil = 20; e.rot += dt * ZERO.speed / 20;
      if (e.pt <= 0) { e.phase = 'walk'; e.pt = rnd(2.2, 3.2); }
    }
  } else {   // la note sur vingt : elle trottine en se balançant
    const w = Math.sin(G.t * 3.5 + e.id) * 0.6;
    MV.x += -dy / d * e.speed * w; MV.y += dx / d * e.speed * w;
    e.rot = Math.sin(G.t * 5 + e.id) * 0.2;
  }
}
// biffée, la note sur vingt se coupe en deux notes sur dix, plus petites et plus vives
function bulletinDeath(e) {
  if (e.type !== 'note20' || e.half) return;
  for (const s of [-1, 1]) {
    const h = spawnEnemy('note20', e.x + s * 14, e.y);
    Object.assign(h, { half: true, r: 15, hp: h.hp * 0.35, maxHp: h.maxHp * 0.35, speed: h.speed * 1.5, xp: 2, vx: s * 260, vy: rnd(-120, 120) });
  }
  AU.play('noteSplit');
}
const noteLabel = e => e.half ? (e.id * 3 % 11) + '/10' : (e.id * 7 % 21) + '/20';

/* ----- le Grand Bulletin ----- */
const GBUL = { fan: 7, fan2: 9, spread: 0.17, numSpeed: 245, volleys: 3, gapV: 0.35, wallN: 30, wallStep: 34, wallSpeed: 185, wallSpeed2: 230, hole: 2, words: 'PEUT MIEUX FAIRE · ' };
function stepGrandBulletin(e, dt, dx, dy, d, slow) {
  const want = d < 300 ? -0.5 : d > 520 ? 2.6 : 1;   // de loin, il accourt : le conseil de classe ne t'attend pas
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow * want; MV.y = dy / d * e.speed * slow * want;
  if (e.enter > 0) e.enter = Math.max(0, e.enter - dt * 0.5);
  const enraged = e.hp < e.maxHp / 2;
  e.pt -= dt; e.open = lerp(e.open || 0, e.phase === 'walk' ? 0 : 1, Math.min(1, dt * 6));
  if (e.phase === 'notes') {   // la colonne des notes : trois éventails de chiffres
    MV.x *= 0.2; MV.y *= 0.2;
    if (e.pt <= 0) {
      const n = enraged ? GBUL.fan2 : GBUL.fan, a0 = Math.atan2(dy, dx);
      for (let i = 0; i < n; i++) {
        const a = a0 + (i - (n - 1) / 2) * GBUL.spread, v = String((e.atkN * 5 + i * 7 + e.vol * 3) % 21);
        G.ebul.push({ x: e.x + Math.cos(a) * 70, y: e.y + Math.sin(a) * 70, vx: Math.cos(a) * GBUL.numSpeed, vy: Math.sin(a) * GBUL.numSpeed, life: 4, lettreT: v, a });
      }
      AU.play('bulNotes'); e.vol++; e.pt = GBUL.gapV;
      if (e.vol >= GBUL.volleys) { e.phase = 'walk'; e.atk = enraged ? 1.2 : 1.8; }
    }
    return;
  }
  if (e.phase === 'wall') {   // « peut mieux faire » : un mur de lettres, avec un trou pour passer
    MV.x *= 0.1; MV.y *= 0.1;
    if (e.pt <= 0) {
      const a = Math.atan2(dy, dx), ux = Math.cos(a), uy = Math.sin(a), sp = enraged ? GBUL.wallSpeed2 : GBUL.wallSpeed;
      const hole = Math.floor(rnd(7, GBUL.wallN - 7)), W2 = GBUL.words;
      for (let i = 0; i < GBUL.wallN; i++) {
        if (Math.abs(i - hole) <= GBUL.hole) continue;
        const o = (i - (GBUL.wallN - 1) / 2) * GBUL.wallStep, ch = W2[i % W2.length];
        G.ebul.push({ x: e.x + ux * 95 - uy * o, y: e.y + uy * 95 + ux * o, vx: ux * sp, vy: uy * sp, life: 7, lettreT: ch === ' ' ? '·' : ch, a: i });
      }
      AU.play('bulWall'); e.phase = 'walk'; e.atk = enraged ? 1.4 : 2;
      if (!G.wallSeen) { G.wallSeen = true; caption('« Peut mieux faire » : passe par le trou du mur !', 2.8, 'pink'); }
    }
    return;
  }
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % (enraged ? 3 : 2);
  if (m === 1) { e.phase = 'notes'; e.vol = 0; e.pt = 0.4; AU.play('bulOpen'); }
  else if (m === 0 && !enraged || m === 2) { e.phase = 'wall'; e.pt = 0.7; AU.play('bulOpen'); }
  else {   // en colère : il convoque le conseil de classe
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + G.t; spawnEnemy(i % 2 ? 'zeropointe' : 'note20', clamp(e.x + Math.cos(a) * 180, 30, WORLD.w - 30), clamp(e.y + Math.sin(a) * 180, 30, WORLD.h - 30)); }
    caption('Il convoque le conseil de classe !', 1.8, 'pink'); AU.play('boss14'); e.atk = 2;
  }
}
function bulletinDanger(x, y) {
  let s = 0;
  for (const e of G.enemies) {
    if (e.type !== 'zeropointe' || e.phase === 'walk') continue;
    const px = x - e.x, py = y - e.y, along = px * e.cx + py * e.cy;   // le couloir où il va rouler
    if (along > 0 && along < ZERO.speed * ZERO.roll + 40 && Math.abs(px * e.cy - py * e.cx) < 46) s += 2;
  }
  return s;
}

function drawBulletinFx() {
  for (const e of G.enemies) {
    if (e.type !== 'zeropointe' || e.phase !== 'aim') continue;
    ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.25 + 0.2 * Math.sin(G.time * 26); ctx.setLineDash([10, 9]); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(e.x + e.cx * 26, e.y + e.cy * 26); ctx.lineTo(e.x + e.cx * ZERO.speed * ZERO.roll, e.y + e.cy * ZERO.speed * ZERO.roll); ctx.stroke(); ctx.restore();
  }
}
function drawBulletinEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const j = (fr - 1) * 0.8;
  if (e.type === 'zeropointe') {   // un gros zéro au stylo rouge, qui roule sur lui-même, et son point
    ctx.fillStyle = 'rgba(46,46,51,0.14)'; ctx.beginPath(); ctx.ellipse(0, 24, 16, 4.5, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.rotate(e.rot || 0);
    ctx.strokeStyle = fl ? '#ffb0b8' : C.red; ctx.lineWidth = 8; ctx.beginPath(); ctx.ellipse(0, 0, 15, 19, 0, 0, TAU); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 15, 19, 0, 3.6, 4.4); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(20, 18, 4, 0, TAU); ctx.fill();   // le point
    for (const s of [-4.5, 4.5]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s, -2 + j, 3.6, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + (e.cx || 0) * 1.2, -1.5 + j + (e.cy || 0) * 1.2, 1.8, 0, TAU); ctx.fill(); }
    if (e.phase === 'aim') { ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, -9); ctx.lineTo(-2, -7); ctx.moveTo(8, -9); ctx.lineTo(2, -7); ctx.stroke(); }
  } else {   // une petite copie notée, coin corné, la note en rouge
    const k = e.half ? 0.7 : 1, w = 24 * k, h = 30 * k;
    ctx.rotate(e.rot || 0);
    ctx.fillStyle = 'rgba(46,46,51,0.14)'; ctx.beginPath(); ctx.ellipse(2, h + 4, w * 0.8, 4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = fl ? '#ffd0d4' : '#fffdf4'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-w, -h); ctx.lineTo(w - 8 * k, -h); ctx.lineTo(w, -h + 8 * k); ctx.lineTo(w, h); ctx.lineTo(-w, h); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(29,58,138,0.3)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let i = 0; i < 3; i++) { const y = -h * 0.2 + i * 9 * k; ctx.moveTo(-w + 5, y); ctx.lineTo(w - 5, y); } ctx.stroke();
    txt(noteLabel(e), 0, -h * 0.55, 15 * k, { color: C.red });
    for (const s of [-6 * k, 6 * k]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s, h * 0.35 + j, 3.2 * k, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s, h * 0.38 + j, 1.6 * k, 0, TAU); ctx.fill(); }
  }
}
function drawGrandBulletin(e, fr, fl) {   // un grand bulletin plié en deux, qui s'ouvre pour attaquer
  const enraged = e.hp < e.maxHp / 2, j = (fr - 1) * 1.4, op = e.open || 0;
  ctx.save(); if (enraged) ctx.translate(vrnd(-1.5, 1.5), vrnd(-1.5, 1.5));
  ctx.fillStyle = 'rgba(46,46,51,0.16)'; ctx.beginPath(); ctx.ellipse(0, 80, 90, 15, 0, 0, TAU); ctx.fill();
  const h = 74, cx0 = -62 + 62 * op, cw = 124 - 28 * op, ox = cx0 + cw / 2, lw = 96 * op;
  if (op > 0.05) {   // le volet de gauche, ouvert : les lignes de notes
    ctx.fillStyle = fl ? '#ffd0d4' : '#eef3fa'; ctx.strokeStyle = '#2d4f7c'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -h); ctx.lineTo(-lw, -h + 8 * op); ctx.lineTo(-lw, h - 8 * op); ctx.lineTo(0, h); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(45,79,124,0.4)'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let k = 0; k < 6; k++) { const y = -h + 24 + k * 22; ctx.moveTo(-lw + 10, y); ctx.lineTo(-8, y); } ctx.stroke();
    if (op > 0.6) for (let k = 0; k < 5; k++) txt(String((k * 7 + 3) % 21), -lw * 0.45, -h + 35 + k * 22, 15, { color: C.red, alpha: op });
  }
  ctx.fillStyle = fl ? '#ffd0d4' : '#3d6896'; ctx.strokeStyle = '#1f3a5f'; ctx.lineWidth = 3;   // la couverture
  roundRect(cx0, -h, cw, h * 2, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fffdf4'; ctx.fillRect(ox - 46, -h + 14, 92, 26); ctx.strokeStyle = '#1f3a5f'; ctx.lineWidth = 2; ctx.strokeRect(ox - 46, -h + 14, 92, 26);
  txt('BULLETIN', ox, -h + 28, 17, { color: '#1f3a5f' });
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x);
  for (const s of [-1, 1]) {
    const ex = ox + s * 24, ey = 2;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex, ey, 11, 0, TAU); ctx.fill(); ctx.strokeStyle = '#1f3a5f'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(ex + Math.cos(la) * 4, ey + Math.sin(la) * 4 + j * 0.3, 4.8, 0, TAU); ctx.fill();
    if (enraged) { ctx.strokeStyle = '#1a1a22'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(ex + s * 12, ey - 16); ctx.lineTo(ex - s * 8, ey - 11); ctx.stroke(); }
  }
  ctx.fillStyle = '#c8424a'; ctx.beginPath(); ctx.ellipse(ox - 30, 22, 7, 4, 0, 0, TAU); ctx.ellipse(ox + 30, 22, 7, 4, 0, 0, TAU); ctx.fill();   // des joues de conseil de classe
  ctx.strokeStyle = '#fffdf4'; ctx.lineWidth = 3; ctx.beginPath();
  if (e.phase !== 'walk') ctx.ellipse(ox, 30, 9, 6, 0, 0, TAU); else if (enraged) { ctx.moveTo(ox - 10, 30); ctx.lineTo(ox + 10, 30); } else ctx.arc(ox, 22, 9, 0.4, Math.PI - 0.4);
  ctx.stroke();
  ctx.restore();
}
