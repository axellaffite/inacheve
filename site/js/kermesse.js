'use strict';

// Chapitre XV : la kermesse (itération 28). La fête de fin d'année, dans la cour de l'école :
// des guirlandes de fanions, le programme de la fête, et un chamboule-tout (chamboule.js) où l'on gagne des lots.
const NOTES_KERMESSE = [
  { x: WORLD.w / 2, y: -150, t: '— carnet n° 9 · chapitre XV : la kermesse —', r: -0.02 },
  { x: WORLD.w * 0.72, y: -96, t: 'ajouté : un chamboule-tout', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'les grandes vacances ?', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'un ticket', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'de tombola', r: -0.05 },
  { x: -160, y: WORLD.h * 0.45 + 88, t: 'n° 117', r: -0.04 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'le pompon, c’est un tour gratuit !', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: 'les canards vont toujours par quatre', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'buvette : sirop 50 c', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'fin juin', r: 0.05 },
  { x: WORLD.w * 0.3, y: -96, t: 'apporter un gâteau', r: -0.02 }
];
const DICTEES_KERMESSE = ['FÊTE', 'LOTS', 'PRIX', 'MANÈGE', 'FANION', 'LAMPION', 'TOMBOLA', 'CONFETTI', 'GUIRLANDE', 'KERMESSE'];
const KERMESSE_TYPES = new Set(['canard', 'sac']);
Object.assign(ETYPES, {
  canard: { r: 18, hp: 11, speed: 74, dmg: 1, xp: 3, agil: 3 },
  sac:    { r: 22, hp: 22, speed: 60, dmg: 1, xp: 4, agil: 2.5 },
  manege: { r: 96, hp: 1300, speed: 42, dmg: 2, xp: 260, agil: 1.2, boss: true }
});
const enKermesse = () => CH().paper === 'kermesse';

CHAPTERS.push({
  num: 'XV', name: 'La kermesse', done: 'La kermesse : vive la fête !', paper: 'kermesse', notes: NOTES_KERMESSE, dictees: DICTEES_KERMESSE,
  intro: 'Chapitre XV : la kermesse. Approche-toi des stands…', boss: 'manege', bossName: 'Le Grand Manège',
  bossIntro: 'En voiture ! Voici le Grand Manège !', bossBack: 'Le Grand Manège repart pour un tour.', bossSound: 'boss15',
  scale: 58, rateOff: 240, rateCap: 21.5, waveCap: 'Toute l’école est à la fête !',
  meet: {
    canard: 'Nouveau : les canards de la pêche. Ils vont toujours en file indienne !',
    sac: 'Nouveau : la course en sac. Gare à l’endroit où il retombe !'
  },
  pick(t, r) {
    if (t > 12 && r < 0.035 && countType('canard') < 12) return 'canard';
    if (t > 20 && r < 0.12 && countType('sac') < 6) return 'sac';
    if (t > 45 && r < 0.17 && countType('tache') < 8) return 'tache';
    if (t > 15 && r < 0.45) return 'biffure';
    return 'gribouillis';
  },
  wave(t, i) { return i % 5 === 0 ? 'sac' : t > 90 && i % 5 === 2 ? 'biffure' : 'gribouillis'; }
});

/* ----- le papier : la cour en fête ----- */
const FANION_COLS = ['#e85a5f', '#f2c14e', '#4f9ad8', '#5cb85c', '#c77dd1', '#f08a3c'];
const GUIRLANDES = [{ y: 70, sag: 120, off: 0 }, { y: 40, sag: 260, off: 45 }, { y: WORLD.h - 60, sag: -110, off: 20 }];
const PROGRAMME = ['14 h : le chamboule-tout', '14 h 30 : la pêche aux canards', '15 h : la course en sac', '15 h 30 : la tombola', '16 h : le Grand Manège'];
const PRG = { x: WORLD.w - 980, y: 330, w: 760, h: 520 };
function drawKermesse(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = 'rgba(255,236,200,0.22)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // un papier un peu doré, comme un soir de juin
  ctx.strokeStyle = C.margin; ctx.globalAlpha = 0.55; ctx.lineWidth = 2.2 / ZOOM; ctx.beginPath(); ctx.moveTo(MARGIN_X, y0); ctx.lineTo(MARGIN_X, y1); ctx.stroke(); ctx.globalAlpha = 1;
  // des confettis peints, semés une fois pour toutes (hachage, aucun hasard)
  for (let i = 0; i < 140; i++) {
    const cx = (i * 977 % 2731) + 40, cy = (i * 613 % 1900) + 40;
    if (cx < v.x0 - 10 || cx > v.x1 + 10 || cy < v.y0 - 10 || cy > v.y1 + 10) continue;
    ctx.fillStyle = FANION_COLS[i % FANION_COLS.length]; ctx.globalAlpha = 0.3;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(i); ctx.fillRect(-5, -2.5, 10, 5); ctx.restore();
  }
  ctx.globalAlpha = 1;
  if (v.y0 < 330) txt('Grande kermesse de l’école', WORLD.w / 2, 190, 70, { font: FONT_CURSIVE, weight: 400, color: '#b0452f', alpha: 0.5 });
  for (const gl of GUIRLANDES) drawGuirlande(gl, v);
  const P = PRG;
  if (P.x + P.w < v.x0 || P.x > v.x1 || P.y + P.h < v.y0 || P.y > v.y1) return;
  ctx.save(); ctx.globalAlpha = 0.5; ctx.translate(P.x + P.w / 2, P.y + P.h / 2); ctx.rotate(0.02);
  ctx.strokeStyle = '#b0452f'; ctx.lineWidth = 3; ctx.setLineDash([16, 10]); ctx.strokeRect(-P.w / 2, -P.h / 2, P.w, P.h); ctx.setLineDash([]);
  ctx.restore();
  txt('Programme de la fête', P.x + P.w / 2, P.y + 70, 50, { font: FONT_CURSIVE, weight: 400, color: '#b0452f', alpha: 0.55 });
  PROGRAMME.forEach((l, k) => txt(l, P.x + 60, P.y + 160 + k * 72, 38, { align: 'left', color: '#7a3b2a', alpha: 0.45, weight: 400 }));
}
function drawGuirlande(gl, v) {
  const top = Math.min(gl.y, gl.y + gl.sag) - 60, bot = Math.max(gl.y, gl.y + gl.sag) + 60;
  if (bot < v.y0 || top > v.y1) return;
  const yAt = x => gl.y + gl.sag * 4 * (x / WORLD.w) * (1 - x / WORLD.w);
  ctx.strokeStyle = 'rgba(80,60,40,0.45)'; ctx.lineWidth = 2.5; ctx.beginPath();
  for (let x = 0; x <= WORLD.w; x += 64) { if (x === 0) ctx.moveTo(x, yAt(x)); else ctx.lineTo(x, yAt(x)); }
  ctx.stroke();
  for (let i = 0, x = gl.off + 30; x < WORLD.w; i++, x += 92) {
    if (x < v.x0 - 40 || x > v.x1 + 40) continue;
    const y = yAt(x), a = Math.atan2(yAt(x + 1) - y, 1), sw = Math.sin(G.time * 1.6 + i * 0.7) * 0.08;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a + sw); ctx.globalAlpha = 0.75;
    ctx.fillStyle = FANION_COLS[(i + gl.off) % FANION_COLS.length];
    ctx.beginPath(); ctx.moveTo(-26, 0); ctx.lineTo(26, 0); ctx.lineTo(0, 54); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(46,46,51,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
  }
}

/* ----- les ratures de la kermesse ----- */
const SAC = { crouch: [0.45, 0.8], hop: 0.6, speed: 330, hMax: 46, thump: 62 };
function stepKermesseEnemy(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  if (e.type === 'canard') stepCanard(e, dt, dx, dy, d, slow);
  else {   // la course en sac : accroupi, puis un grand bond vers toi
    e.pt -= dt;
    if (e.phase === 'hop') {
      const k = 1 - e.pt / SAC.hop;
      e.h = Math.sin(Math.PI * clamp(k, 0, 1)) * SAC.hMax;
      MV.x = e.cx * SAC.speed; MV.y = e.cy * SAC.speed; MV.agil = 14;
      if (e.pt <= 0) {   // il retombe : boum !
        e.phase = 'walk'; e.h = 0; e.pt = rnd(SAC.crouch[0], SAC.crouch[1]);
        G.rings.push({ x: e.x, y: e.y, t: 0, dur: 0.35, r: SAC.thump, color: '#8a6a3a' });
        if ((G.p.x - e.x) ** 2 + (G.p.y - e.y) ** 2 < (SAC.thump + G.p.r) ** 2) hurtPlayer(1, e.x, e.y);
        AU.play('sacThump');
      }
    } else {
      MV.x *= 0.05; MV.y *= 0.05;
      if (e.pt <= 0) {
        if (d < 900 && !hid) {
          e.phase = 'hop'; e.pt = SAC.hop; e.cx = dx / d; e.cy = dy / d;
          const reach = Math.min(d, SAC.speed * SAC.hop);
          e.lx = e.x + e.cx * reach; e.ly = e.y + e.cy * reach; e.cx *= reach / (SAC.speed * SAC.hop); e.cy *= reach / (SAC.speed * SAC.hop);
          AU.play('sacHop');
        } else e.pt = 0.4;
      }
    }
  }
}
// les canards de la pêche : un chef de file, et trois qui le suivent à la trace ; si le chef tombe, le suivant prend sa place
function stepCanard(e, dt, dx, dy, d, slow) {
  if (!e.init) {
    e.init = true;
    if (!e.lead && !e.copie) {   // une photocopie de canard nage seule
      e.file = e.id; let prev = e;
      for (let i = 1; i < 4; i++) {
        const f = spawnEnemy('canard', clamp(e.x - i * 40, 30, WORLD.w - 30), e.y);
        Object.assign(f, { init: true, lead: prev, file: e.id, num: i + 1 }); prev = f;
      }
      e.num = 1;
    }
  }
  const L = e.lead && !e.lead.dead ? e.lead : null;
  if (!L) {   // le chef de file nage vers toi en faisant de grands zigzags
    e.lead = null;
    const w = Math.sin(G.t * 1.8 + e.id) * 0.9;
    MV.x += -dy / d * e.speed * w; MV.y += dx / d * e.speed * w;
  } else {
    const lx = L.x - (L.vx || 0) * 0.32, ly = L.y - (L.vy || 0) * 0.32, ex = lx - e.x, ey = ly - e.y, ed = Math.hypot(ex, ey) || 1;
    const sp = e.speed * slow * clamp(ed / 30, 0, 1.8);
    MV.x = ex / ed * sp; MV.y = ey / ed * sp; MV.agil = 6;
  }
  e.rot = Math.sin(G.t * 6 + e.id) * 0.12;
}
// une file entière pêchée : un lot de lettres
function kermesseDeath(e) {
  if (e.type !== 'canard' || !e.file) return;
  if (G.enemies.some(o => o !== e && !o.dead && o.type === 'canard' && o.file === e.file)) return;
  G.peches = (G.peches || 0) + 1;
  addText(e.x, e.y - 40, 'toute la file !', '#c9921b', 28); AU.play('peche');
  for (let i = 0; i < 4; i++) dropLetter(e.x + rnd(-20, 20), e.y + rnd(-20, 20), 3);
}
function kermesseDanger(x, y) {
  let s = 0;
  for (const e of G.enemies) {
    if (e.type !== 'sac' || e.phase !== 'hop') continue;
    const dd = (x - e.lx) ** 2 + (y - e.ly) ** 2;
    if (dd < (SAC.thump + 40) ** 2) s += 3;
  }
  return s;
}

function drawKermesseFx() {
  for (const e of G.enemies) {   // là où le sac va retomber
    if (e.type !== 'sac' || e.phase !== 'hop') continue;
    ctx.save(); ctx.strokeStyle = '#8a6a3a'; ctx.globalAlpha = 0.35 + 0.2 * Math.sin(G.time * 20); ctx.setLineDash([7, 7]); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.ellipse(e.lx, e.ly, SAC.thump, SAC.thump * 0.8, 0, 0, TAU); ctx.stroke(); ctx.restore();
  }
}
function drawKermesseEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const j = (fr - 1) * 0.8;
  if (e.type === 'canard') {   // un canard en plastique jaune, son numéro de lot sous le ventre
    const face = (e.vx || 1) >= 0 ? 1 : -1;
    ctx.fillStyle = 'rgba(79,154,216,0.25)'; ctx.beginPath(); ctx.ellipse(0, 14, 24, 6, 0, 0, TAU); ctx.fill();   // un rond dans l'eau
    ctx.save(); ctx.rotate(e.rot || 0); ctx.scale(face, 1);
    ctx.fillStyle = fl ? '#fff3a0' : '#f6cf2e'; ctx.strokeStyle = '#a67c00'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.quadraticCurveTo(-24, -12, -14, -6); ctx.quadraticCurveTo(0, 2, 12, -2); ctx.quadraticCurveTo(20, 4, 14, 12); ctx.quadraticCurveTo(-4, 18, -18, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(9, -12, 9, 0, TAU); ctx.fill(); ctx.stroke();   // la tête
    ctx.fillStyle = '#f08a3c'; ctx.beginPath(); ctx.moveTo(16, -13); ctx.lineTo(25, -10); ctx.lineTo(16, -8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(11, -14 + j * 0.3, 1.9, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#d9a514'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-8, 2); ctx.quadraticCurveTo(-2, 8, 4, 3); ctx.stroke();   // l'aile
    ctx.restore();
    if (e.num) txt(String(e.num), 0, 7, 11, { color: '#a32f2b' });
    if (!e.lead) { ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(9 * face - 6, -23); ctx.lineTo(9 * face - 3, -28); ctx.lineTo(9 * face, -24); ctx.lineTo(9 * face + 3, -28); ctx.lineTo(9 * face + 6, -23); ctx.stroke(); }   // une couronne en papier pour le chef de file
  } else {   // un sac de toile, ficelé en haut, qui saute
    const h = e.h || 0, sq = e.phase === 'walk' ? 1 - 0.12 * clamp(e.pt * 3, 0, 1) : 1.06;
    ctx.fillStyle = 'rgba(46,46,51,' + (0.16 - h / SAC.hMax * 0.08) + ')'; ctx.beginPath(); ctx.ellipse(0, 24, 20 * (1 - h / 120), 5, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(0, -h); ctx.scale(1 / sq, sq);
    ctx.fillStyle = fl ? '#ffe2c0' : '#c9a46a'; ctx.strokeStyle = '#6e5230'; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.moveTo(-12, -22); ctx.quadraticCurveTo(-24, 0, -20, 22); ctx.lineTo(20, 22); ctx.quadraticCurveTo(24, 0, 12, -22); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(110,82,48,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); for (let k = -1; k <= 1; k++) { ctx.moveTo(-15, 2 + k * 8); ctx.lineTo(15, 2 + k * 8); } ctx.stroke();
    ctx.strokeStyle = '#a32f2b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-12, -20); ctx.lineTo(12, -20); ctx.stroke();   // la ficelle
    ctx.beginPath(); ctx.ellipse(-5, -27, 5, 4, -0.4, 0, TAU); ctx.ellipse(5, -27, 5, 4, 0.4, 0, TAU); ctx.stroke();
    for (const s of [-6, 6]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s, -6 + j, 4, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + (e.cx || 0) * 1.5, -5 + j, 2, 0, TAU); ctx.fill(); }
    if (e.phase === 'hop') { ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 6, 4, 0, TAU); ctx.stroke(); }
    ctx.restore();
  }
}

/* ----- le Grand Manège ----- */
const MANEGE = { tourDur: 2.6, tourGap: 0.1, tourSpeed: 210, ring: 18, ring2: 22, ringSpeed: 190, words: 'KERMESSE · MANÈGE · ', pompon: 5.5, stun: 3.4, stunMul: 2, pd: 300 };
function stepManege(e, dt, dx, dy, d, slow) {
  const stun = e.stun > 0, want = stun ? 0 : d < 320 ? -0.4 : d > 560 ? 2.4 : 0.7;
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow * want; MV.y = dy / d * e.speed * slow * want;
  if (e.enter > 0) e.enter = Math.max(0, e.enter - dt * 0.5);
  const enraged = e.hp < e.maxHp / 2;
  e.w = lerp(e.w === undefined ? 1 : e.w, stun ? 0 : e.phase === 'tour' ? 4.2 : enraged ? 1.6 : 1, Math.min(1, dt * 2));
  e.ang = (e.ang || 0) + e.w * dt;
  if (stun) { e.stun -= dt; return; }
  if (e.phase === 'tour') {   // le manège s'emballe : ses chevaux de bois lancent des lettres en spirale
    e.pt -= dt; e.emit = (e.emit || 0) - dt;
    if (e.emit <= 0) {
      e.emit = MANEGE.tourGap; const arms = enraged ? 3 : 2;
      for (let k = 0; k < arms; k++) {
        const a = e.ang + k / arms * TAU, ox = Math.cos(a) * 92, oy = Math.sin(a) * 92, da = a + 0.6;
        G.ebul.push({ x: e.x + ox, y: e.y + oy, vx: Math.cos(da) * MANEGE.tourSpeed, vy: Math.sin(da) * MANEGE.tourSpeed, life: 4.5, lettreT: MANEGE.words[(e.vol++) % MANEGE.words.length].replace(' ', '·'), a: e.vol });
      }
    }
    if (e.pt <= 0) { e.phase = 'walk'; e.atk = enraged ? 1.3 : 1.9; }
    return;
  }
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % 3;
  if (m === 1) { e.phase = 'tour'; e.pt = MANEGE.tourDur; e.emit = 0.3; e.vol = 0; AU.play('manegeTour'); }
  else if (m === 2) {   // la ronde des lettres, et en colère une file de canards
    const n = enraged ? MANEGE.ring2 : MANEGE.ring, off = e.ang;
    for (let i = 0; i < n; i++) { const a = off + i / n * TAU; G.ebul.push({ x: e.x + Math.cos(a) * 100, y: e.y + Math.sin(a) * 100, vx: Math.cos(a) * MANEGE.ringSpeed, vy: Math.sin(a) * MANEGE.ringSpeed, life: 5, lettreT: MANEGE.words[i % 9].replace(' ', '·'), a: i }); }
    AU.play('manegeRing'); e.atk = enraged ? 1.5 : 2.1;
    if (enraged && countType('canard') < 12) { spawnEnemy('canard', clamp(e.x + 160, 40, WORLD.w - 40), clamp(e.y, 40, WORLD.h - 40)); caption('Il lâche les canards de la pêche !', 1.6, 'pink'); }
  } else {   // le pompon : qui l'attrape gagne un tour gratuit, et le manège s'arrête
    if (!G.pompon) {
      const a = Math.atan2(G.p.y - e.y, G.p.x - e.x) + (e.atkN % 2 ? 1 : -1) * 1.1;
      G.pompon = { x: clamp(e.x + Math.cos(a) * MANEGE.pd, 80, WORLD.w - 80), y: clamp(e.y + Math.sin(a) * MANEGE.pd, 80, WORLD.h - 80), t: 0, from: e };
      AU.play('pomponDown');
      if (!G.pomponSeen) { G.pomponSeen = true; caption('Le pompon descend ! Attrape-le : un tour gratuit…', 3, 'green'); caption('… et le manège s’arrête net : frappe-le pendant qu’il a le tournis !', 3.2, 'green'); }
    }
    e.atk = enraged ? 1.8 : 2.4;
  }
}
// les sabots des chevaux de bois : leur place sur le plancher du manège
function horseAt(e, i) { const a = (e.ang || 0) + i / 6 * TAU; return { a, x: Math.cos(a) * 80, y: 34 + Math.sin(a) * 22, front: Math.sin(a) > 0 }; }
const HORSE_COLS = ['#fffdf4', '#ffb3c7', '#a9d1f5', '#f6e08a', '#c7f0c0', '#e0c2f5'];
function drawManege(e, fr, fl) {
  const enraged = e.hp < e.maxHp / 2, stun = e.stun > 0;
  ctx.save(); if (enraged && !stun) ctx.translate(vrnd(-1.5, 1.5), vrnd(-1.5, 1.5));
  ctx.fillStyle = 'rgba(46,46,51,0.16)'; ctx.beginPath(); ctx.ellipse(0, 70, 120, 24, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = fl ? '#ffd9b0' : '#c9853a'; ctx.strokeStyle = '#7a4e1e'; ctx.lineWidth = 3;   // le plancher
  ctx.beginPath(); ctx.ellipse(0, 40, 108, 32, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#e8a64f'; ctx.beginPath(); ctx.ellipse(0, 34, 104, 28, 0, 0, TAU); ctx.fill();
  const horses = [0, 1, 2, 3, 4, 5].map(i => Object.assign(horseAt(e, i), { i }));
  for (const h of horses) if (!h.front) drawHorse(e, h, stun);
  ctx.fillStyle = '#fffdf4'; ctx.strokeStyle = '#a32f2b'; ctx.lineWidth = 2.5;   // la colonne
  ctx.fillRect(-15, -78, 30, 112); ctx.strokeRect(-15, -78, 30, 112);
  ctx.fillStyle = '#e85a5f'; for (let k = 0; k < 4; k++) ctx.fillRect(-15, -70 + k * 28, 30, 10);
  for (const h of horses) if (h.front) drawHorse(e, h, stun);
  // le chapiteau : des quartiers rouges et blancs qui tournent, et son festonné
  const cy = -84, rx = 118, ry = 30, ax = 0, ay = -138, n = 12;
  for (let k = 0; k < n; k++) {
    const b0 = (e.ang || 0) * 0.5 + k / n * TAU, b1 = b0 + TAU / n;
    if (Math.sin((b0 + b1) / 2) < -0.1) continue;   // les quartiers de derrière sont cachés
    ctx.fillStyle = k % 2 ? (fl ? '#ffecec' : '#fffdf4') : (fl ? '#ff8f94' : '#e85a5f');
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(Math.cos(b0) * rx, cy + Math.sin(b0) * ry); ctx.lineTo(Math.cos(b1) * rx, cy + Math.sin(b1) * ry); ctx.closePath(); ctx.fill();
  }
  ctx.strokeStyle = '#a32f2b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, cy, rx, ry, 0, 0, Math.PI); ctx.stroke();
  ctx.fillStyle = fl ? '#ffd0d4' : '#f2c14e';
  for (let k = 0; k <= 10; k++) { const b = k / 10 * Math.PI, x = Math.cos(b) * rx, y = cy + Math.sin(b) * ry; ctx.beginPath(); ctx.arc(x, y + 4, 11, 0, Math.PI); ctx.fill(); }
  ctx.strokeStyle = '#7a4e1e'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(ax, ay - 26); ctx.stroke();   // le petit drapeau
  ctx.fillStyle = FANION_COLS[Math.floor(G.time * 2) % FANION_COLS.length]; ctx.beginPath(); ctx.moveTo(ax, ay - 26); ctx.lineTo(ax + 22, ay - 20 + Math.sin(G.time * 8) * 3); ctx.lineTo(ax, ay - 13); ctx.closePath(); ctx.fill();
  // le visage, sur le chapiteau
  const ey = -106, la = Math.atan2(G.p.y - e.y, G.p.x - e.x);
  for (const s of [-1, 1]) {
    const ex = s * 26;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(ex, ey, 10, 0, TAU); ctx.fill(); ctx.strokeStyle = '#7a1e22'; ctx.lineWidth = 2; ctx.stroke();
    if (stun) { ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.6; ctx.beginPath(); for (let t = 0; t < 9; t += 0.3) ctx.lineTo(ex + Math.cos(t + G.time * 8) * t * 0.9, ey + Math.sin(t + G.time * 8) * t * 0.9); ctx.stroke(); }
    else { ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(ex + Math.cos(la) * 4, ey + Math.sin(la) * 3, 4.5, 0, TAU); ctx.fill(); }
    if (enraged && !stun) { ctx.strokeStyle = '#1a1a22'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(ex + s * 12, ey - 15); ctx.lineTo(ex - s * 8, ey - 10); ctx.stroke(); }
  }
  ctx.strokeStyle = '#7a1e22'; ctx.lineWidth = 3; ctx.beginPath();
  if (stun) ctx.ellipse(0, -86, 7, 5, 0, 0, TAU); else if (e.phase === 'tour') ctx.arc(0, -90, 9, 0.2, Math.PI - 0.2); else if (enraged) { ctx.moveTo(-9, -86); ctx.lineTo(9, -86); } else ctx.arc(0, -92, 8, 0.4, Math.PI - 0.4);
  ctx.stroke();
  if (stun) for (let k = 0; k < 4; k++) { const a = G.time * 3 + k / 4 * TAU; txt('★', Math.cos(a) * 70, -150 + Math.sin(a) * 14, 22, { color: C.gold }); }
  ctx.restore();
}
function drawHorse(e, h, stun) {
  const bob = stun ? 0 : Math.sin(G.time * 4 + h.i * 1.3) * 9, face = Math.cos(h.a + Math.PI / 2) >= 0 ? 1 : -1, y = h.y - 34 + bob;
  ctx.strokeStyle = '#c9921b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(h.x, -84 + 30 * Math.sin(h.a) * 0.3); ctx.lineTo(h.x, h.y); ctx.stroke();   // la barre dorée
  ctx.save(); ctx.translate(h.x, y); ctx.scale(face * (h.front ? 1 : 0.85), h.front ? 1 : 0.85);
  ctx.fillStyle = HORSE_COLS[h.i]; ctx.strokeStyle = '#5a3a20'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.ellipse(0, 0, 19, 10, 0, 0, TAU); ctx.fill(); ctx.stroke();   // le corps
  ctx.beginPath(); ctx.moveTo(12, -4); ctx.lineTo(20, -20); ctx.lineTo(29, -17); ctx.lineTo(22, -6); ctx.closePath(); ctx.fill(); ctx.stroke();   // l'encolure et la tête
  ctx.beginPath(); for (const lx of [-12, -5, 6, 13]) { ctx.moveTo(lx, 7); ctx.lineTo(lx + (lx < 0 ? -4 : 4), 17); } ctx.stroke();
  ctx.strokeStyle = '#e85a5f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(18, -18); ctx.quadraticCurveTo(10, -16, 9, -6); ctx.stroke();   // la crinière
  ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(23, -15, 1.6, 0, TAU); ctx.fill();
  ctx.restore();
}
