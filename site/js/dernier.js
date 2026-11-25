// Chapitre XVII : le dernier jour (itération 32). Le onzième cahier : la dernière page de l'année, celle où les copains
// écrivent leurs dédicaces. Papier, ratures (le chewing-gum, la feuille volante) et le patron (le Grand Tableau).
// La farandole des copains vit dans farandole.js.
'use strict';

const NOTES_DERNIER = [
  { x: WORLD.w / 2, y: -150, t: '— carnet n° 11 · chapitre XVII : le dernier jour —', r: -0.02 },
  { x: WORLD.w * 0.72, y: -96, t: 'ajouté : la farandole des copains', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'la rentrée suivante ? une classe de plus ?', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'rendre', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'les livres', r: -0.05 },
  { x: -160, y: WORLD.h * 0.45 + 88, t: '(et la gomme du voisin)', r: -0.04 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'six copains font une ronde', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: 'le chewing-gum, on le jette !', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'la cloche sonne à 16 h 30', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'fin juin', r: 0.05 },
  { x: WORLD.w * 0.3, y: -96, t: 'ranger la classe', r: -0.02 }
];
const DICTEES_DERNIER = ['FIN', 'JUIN', 'CRAIE', 'CLASSE', 'COPAIN', 'TABLEAU', 'CARTABLE', 'SOUVENIR', 'DÉDICACE', 'VACANCES'];
const DERNIER_TYPES = new Set(['chewing', 'feuille']);
Object.assign(ETYPES, {
  chewing: { r: 15, hp: 15, speed: 66, dmg: 1, xp: 3, agil: 3 },
  feuille: { r: 16, hp: 6, speed: 120, dmg: 1, xp: 2, agil: 2.2 },
  tableau: { r: 118, hp: 1700, speed: 38, dmg: 2, xp: 270, agil: 1.2, boss: true }
});
const enDernier = () => CH().paper === 'dernier';

CHAPTERS.push({
  num: 'XVII', name: 'Le dernier jour', done: 'Le dernier jour : bonnes vacances !', paper: 'dernier', notes: NOTES_DERNIER, dictees: DICTEES_DERNIER,
  intro: 'Chapitre XVII : le dernier jour. Les copains viennent écrire dans ton cahier…', boss: 'tableau', bossName: 'Le Grand Tableau',
  bossIntro: 'Le Grand Tableau se décroche du mur !', bossBack: 'Le Grand Tableau revient, tout propre.', bossSound: 'boss17',
  scale: 70, rateOff: 250, rateCap: 22, waveCap: 'Toute l’école court dans la cour !',
  meet: {
    chewing: 'Nouveau : le chewing-gum. Il colle aux pattes : un pâté pour t’en défaire !',
    feuille: 'Nouveau : la feuille volante. Au courant d’air, elle file tout droit !'
  },
  pick(t, r) {
    if (t > 12 && r < 0.07 && countType('feuille') < 18) return 'feuille';
    if (t > 22 && r < 0.16 && countType('chewing') < 8) return 'chewing';
    if (t > 45 && r < 0.22 && countType('tache') < 8) return 'tache';
    if (t > 15 && r < 0.48) return 'biffure';
    return 'gribouillis';
  },
  wave(t, i) { return i % 6 === 0 ? 'chewing' : i % 6 === 3 || i % 6 === 4 ? 'feuille' : t > 90 && i % 6 === 2 ? 'biffure' : 'gribouillis'; }
});

/* ---------- le papier : la dernière page, pleine de dédicaces ---------- */
const DEDI_FOND = ['Bonnes vacances !', 'À l’an prochain !', 'Ne change pas !', 'Vive l’été !', 'Écris-moi !', 'Bisous d’encre', 'Pense à moi', 'Super année !', 'À la rentrée !', 'Reste comme tu es'];
const DEDI_INKS = ['#c8424a', '#2f8a4e', '#8a5cd6', '#e0569b', '#1fa3a8', '#d98a1c', '#1d3a8a'];
const FOND = Array.from({ length: 22 }, (_, i) => ({ x: 340 + (i * 911 % 2300), y: 330 + (i * 467 % 1500), t: DEDI_FOND[i % DEDI_FOND.length], c: DEDI_INKS[i % DEDI_INKS.length], r: ((i * 37 % 9) - 4) * 0.05, s: 30 + (i * 13 % 3) * 6 }));
const CAL = { x: WORLD.w - 880, y: 260, w: 620, h: 470 };
function drawDernier(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = 'rgba(255,226,196,0.22)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // un papier couleur pêche, comme la fin juin
  drawDernierMarge(v);
  if (v.y0 < 330) txt('Le dernier jour', WORLD.w / 2, 190, 70, { font: FONT_CURSIVE, weight: 400, color: '#b0472f', alpha: 0.5 });
  for (const f of FOND) if (f.x > v.x0 - 260 && f.x < v.x1 + 260 && f.y > v.y0 - 60 && f.y < v.y1 + 60) {
    if (f.x > CAL.x - 200 && f.y < CAL.y + CAL.h + 40) continue;
    txt(f.t, f.x, f.y, f.s, { color: f.c, alpha: 0.2, rot: f.r, weight: 400 });
  }
  const P = CAL;
  if (P.x + P.w < v.x0 || P.x > v.x1 || P.y + P.h < v.y0 || P.y > v.y1) return;
  ctx.save(); ctx.globalAlpha = 0.5; ctx.strokeStyle = '#b0472f'; ctx.lineWidth = 3; ctx.setLineDash([16, 10]); ctx.strokeRect(P.x, P.y, P.w, P.h); ctx.setLineDash([]); ctx.restore();
  txt('Juin', P.x + P.w / 2, P.y + 56, 50, { font: FONT_CURSIVE, weight: 400, color: '#b0472f', alpha: 0.55 });
  const cw = P.w / 7, ch = 66;
  for (let d = 1; d <= 30; d++) {   // les jours barrés un à un, jusqu'au dernier, entouré en rouge
    const k = d + 1, cx = P.x + cw * (k % 7) + cw / 2, cy = P.y + 120 + Math.floor(k / 7) * ch;
    txt(String(d), cx, cy, 30, { color: C.graphite, alpha: 0.4, weight: 400 });
    if (d < 30) { ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.35; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cx - 16, cy - 16); ctx.lineTo(cx + 16, cy + 16); ctx.moveTo(cx + 16, cy - 16); ctx.lineTo(cx - 16, cy + 16); ctx.stroke(); ctx.restore(); }
    else { ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.6; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(cx, cy, 30, 24, -0.2, 0, TAU); ctx.stroke(); ctx.restore(); txt('→ les vacances !', cx - 40, cy + 52, 28, { color: C.red, alpha: 0.5, rot: -0.06 }); }
  }
}
function drawDernierMarge(v) {   // la marge rouge, sur un papier à grands carreaux comme les autres
  ctx.strokeStyle = C.margin; ctx.globalAlpha = 0.55; ctx.lineWidth = 2.2 / ZOOM;
  ctx.beginPath(); ctx.moveTo(MARGIN_X, Math.max(0, v.y0)); ctx.lineTo(MARGIN_X, Math.min(WORLD.h, v.y1)); ctx.stroke(); ctx.globalAlpha = 1;
}

/* ---------- le chewing-gum et la feuille volante ---------- */
const GUM = { range: 300, blow: 1.1, cd: [2.6, 4], n: 8, speed: 200, life: 1.4, stick: 2.6, slow: 0.55 };
const VENT = { cd: [5, 7], warn: 0.9, gust: 1.3, speed: 430, drift: 45 };
function stepDernierEnemy(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  e.pt -= dt;
  if (e.type === 'chewing') {
    if (e.phase === 'bulle') {   // il s'arrête et souffle une bulle rose… qui éclate
      MV.x *= 0.05; MV.y *= 0.05;
      if (e.pt <= 0) {
        const off = rnd(TAU);
        for (let i = 0; i < GUM.n; i++) { const a = off + i / GUM.n * TAU; G.ebul.push({ x: e.x + Math.cos(a) * 30, y: e.y + Math.sin(a) * 30, vx: Math.cos(a) * GUM.speed, vy: Math.sin(a) * GUM.speed, life: GUM.life, gum: true }); }
        AU.play('chewing'); e.phase = 'walk'; e.pt = rnd(GUM.cd[0], GUM.cd[1]);
      }
    } else if (e.pt <= 0) {
      if (d < GUM.range && !hid) { e.phase = 'bulle'; e.pt = GUM.blow; }
      else e.pt = 0.4;
    }
    e.rot = (e.rot || 0) + (MV.x >= 0 ? 1 : -1) * dt * 2.5;   // il roule
    if (!hid && !e.ghost && d < e.r + G.p.r + 2 && G.p.dashT <= 0) {   // il colle aux pattes
      if (!(G.p.gum > 0)) { addText(G.p.x, G.p.y - 30, 'ça colle !', '#e0569b', 22); if (!G.gumSeen) { G.gumSeen = true; caption('Le chewing-gum colle aux pattes : fais un pâté pour t’en défaire !', 3, 'pink'); } }
      G.p.gum = GUM.stick;
    }
  } else {   // la feuille volante : elle flotte vers toi, puis file tout droit quand souffle le courant d'air
    const V = G.vent;
    if (V && V.gust > 0) { MV.x = Math.cos(V.a) * VENT.speed; MV.y = Math.sin(V.a) * VENT.speed; MV.agil = 6; }
    else {
      const w = Math.sin(G.t * 3 + e.id * 1.3) * 0.7, wx = V ? Math.cos(V.a) * VENT.drift : 0, wy = V ? Math.sin(V.a) * VENT.drift : 0;
      MV.x = (dx / d + -dy / d * w) * e.speed * slow + wx; MV.y = (dy / d + dx / d * w) * e.speed * slow + wy;
    }
    e.rot = Math.sin(G.t * 4 + e.id) * 0.5 + (V && V.gust > 0 ? V.a : 0);
  }
}
function stepVent(dt) {
  if (!G.vent) G.vent = { a: rnd(TAU), cd: rnd(VENT.cd[0], VENT.cd[1]), warn: 0, gust: 0 };
  const V = G.vent;
  if (V.gust > 0) { V.gust -= dt; if (V.gust <= 0) V.cd = rnd(VENT.cd[0], VENT.cd[1]); return; }
  if (V.warn > 0) { V.warn -= dt; if (V.warn <= 0) V.gust = VENT.gust; return; }
  V.cd -= dt;
  if (V.cd <= 0) {
    V.a = rnd(TAU); V.warn = VENT.warn;
    if (countType('feuille')) { AU.play('vent'); if (!G.ventSeen) { G.ventSeen = true; caption('Courant d’air ! Les feuilles volantes vont filer dans le sens des traits…', 3, 'pink'); } }
  }
}
const dernierSlow = () => G.p && G.p.gum > 0 ? GUM.slow : 1;
function dernierDeath(e) {
  if (e.type === 'chewing') splat(e.x, e.y, 14, '#e0569b', 0.16, 5);
}
function dernierDanger(x, y) {
  let s = 0;
  for (const e of G.enemies) {
    if (e.type === 'chewing' && e.phase === 'bulle') { if ((x - e.x) ** 2 + (y - e.y) ** 2 < 220 * 220) s += 2; }
    else if (e.type === 'feuille' && G.vent && (G.vent.warn > 0 || G.vent.gust > 0)) {
      const ux = Math.cos(G.vent.a), uy = Math.sin(G.vent.a), ex = x - e.x, ey = y - e.y, along = ex * ux + ey * uy;
      if (along > 0 && along < 320 && Math.abs(ex * uy - ey * ux) < 36) s += 1.5;
    }
  }
  const B = G.brosse;
  if (B && B.phase !== 'back') {
    const ex = x - B.x, ey = y - B.y, along = ex * B.ux + ey * B.uy;
    if (along > -30 && along < 1100 && Math.abs(ex * B.uy - ey * B.ux) < 60) s += 3;
  }
  for (const c of G.crisses || []) {
    const R = crisseR(c, 0.35), dd = Math.hypot(x - c.x, y - c.y);
    if (Math.abs(dd - R) < 70 && !inCrisseGap(c, Math.atan2(y - c.y, x - c.x))) s += 3;
  }
  return s;
}

/* ---------- le Grand Tableau ---------- */
const TAB = { volleys: 3, gap: 0.35, fan: 5, fan2: 7, craieSpeed: 310, aim: 0.75, brosseSpeed: 950, brosseT: 1.15, back: 0.6, crisseDur: 2.4, R0: 120, R1: 980, gapW: 0.5 };
const crisseR = (c, ahead = 0) => c.R0 + (c.R1 - c.R0) * clamp((c.t + ahead) / c.dur, 0, 1);
const inCrisseGap = (c, a) => { let d = a - c.gap; while (d > Math.PI) d -= TAU; while (d < -Math.PI) d += TAU; return Math.abs(d) < c.w; };
function stepTableau(e, dt, dx, dy, d, slow) {
  const want = d < 320 ? -0.4 : d > 600 ? 2.4 : 0.6;
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow * want; MV.y = dy / d * e.speed * slow * want;
  const enraged = e.hp < e.maxHp / 2, p = G.p;
  if (e.phase === 'craies') {   // des volées de craies en éventail
    e.pt -= dt;
    if (e.pt <= 0 && e.vol > 0) {
      e.vol--; e.pt = TAB.gap;
      const n = enraged ? TAB.fan2 : TAB.fan, a0 = Math.atan2(dy, dx);
      for (let i = 0; i < n; i++) { const a = a0 + (i - (n - 1) / 2) * 0.17; G.ebul.push({ x: e.x + Math.cos(a) * 80, y: e.y + 60, vx: Math.cos(a) * TAB.craieSpeed, vy: Math.sin(a) * TAB.craieSpeed, life: 3.2, craie: true, a: i }); }
      AU.play('craie');
    }
    if (e.vol <= 0 && e.pt <= 0) { e.phase = 'walk'; e.atk = enraged ? 1.2 : 1.8; }
    return;
  }
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % 3;
  if (m === 1) { e.phase = 'craies'; e.vol = TAB.volleys + (enraged ? 1 : 0); e.pt = 0.2; }
  else if (m === 2 && !G.brosse) {   // la brosse se décroche et file en ligne droite (le pointillé dit où)
    const n = d || 1;
    G.brosse = { phase: 'aim', t: 0, x: e.x, y: e.y + 92, ux: dx / n, uy: dy / n, hit: false, boss: e };
    AU.play('brosseAim'); e.atk = enraged ? 2.4 : 3;
    if (!G.brosseSeen) { G.brosseSeen = true; caption('La brosse va foncer le long du pointillé : écarte-toi !', 2.6, 'pink'); }
  } else {   // le crissement de la craie : un cercle qui grandit, avec un trou pour passer
    const a = Math.atan2(p.y - e.y, p.x - e.x) + rnd(-1.4, 1.4);
    G.crisses.push({ x: e.x, y: e.y, t: 0, dur: TAB.crisseDur, R0: TAB.R0, R1: TAB.R1, gap: a, w: TAB.gapW, hit: false });
    if (enraged) G.crisses.push({ x: e.x, y: e.y, t: -0.9, dur: TAB.crisseDur, R0: TAB.R0, R1: TAB.R1, gap: a + rnd(1.5, 3), w: TAB.gapW, hit: false });
    AU.play('crisse'); e.atk = enraged ? 2.2 : 2.8;
    if (!G.crisseSeen) { G.crisseSeen = true; caption('Criiii ! Le cercle de craie grandit : passe par son trou !', 3, 'pink'); }
  }
}
function stepDernierFx(dt) {
  const p = G.p;
  if (p.gum > 0) { p.gum = p.dashT > 0 ? 0 : p.gum - dt; }
  if (!enDernier()) return;
  stepVent(dt);
  const B = G.brosse;
  if (B) {
    B.t += dt;
    if (B.phase === 'aim') {
      if (B.boss && !B.boss.dead) { B.x = B.boss.x; B.y = B.boss.y + 92; }
      if (B.t >= TAB.aim) { B.phase = 'go'; B.t = 0; AU.play('brosse'); }
    } else if (B.phase === 'go') {
      B.x += B.ux * TAB.brosseSpeed * dt; B.y += B.uy * TAB.brosseSpeed * dt;
      eraseStain(B.x, B.y, 40);
      if (G.state === 'play' && rand() < dt * 40) G.parts.push({ x: B.x + rnd(-30, 30), y: B.y + rnd(-14, 14), vx: rnd(-40, 40), vy: rnd(-40, 40), life: 0.6, max: 0.6, size: rnd(3, 7), color: 'rgba(240,240,235,0.9)', drag: 2 });
      if (!B.hit && (p.x - B.x) ** 2 + (p.y - B.y) ** 2 < (p.r + 30) ** 2) { B.hit = true; hurtPlayer(1, B.x, B.y); }
      if (B.t >= TAB.brosseT || B.x < -60 || B.y < -60 || B.x > WORLD.w + 60 || B.y > WORLD.h + 60) { B.phase = 'back'; B.t = 0; B.fx = B.x; B.fy = B.y; }
    } else {
      const bx = B.boss && !B.boss.dead ? B.boss.x : B.fx, by = B.boss && !B.boss.dead ? B.boss.y + 92 : B.fy, k = ease(clamp(B.t / TAB.back, 0, 1));
      B.x = lerp(B.fx, bx, k); B.y = lerp(B.fy, by, k);
      if (B.t >= TAB.back) G.brosse = null;
    }
  }
  for (const c of G.crisses) {
    c.t += dt; if (c.t < 0) continue;
    const R = crisseR(c), dd = Math.hypot(p.x - c.x, p.y - c.y);
    if (!c.hit && c.t < c.dur && Math.abs(dd - R) < p.r + 9 && !inCrisseGap(c, Math.atan2(p.y - c.y, p.x - c.x))) { c.hit = true; hurtPlayer(1, c.x, c.y); }
  }
  G.crisses = G.crisses.filter(c => c.t < c.dur + 0.2);
}

/* ---------- dessin ---------- */
function drawDernierEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const j = (fr - 1) * 0.8;
  if (e.type === 'chewing') {   // une boule de chewing-gum rose qui roule, et sa bulle
    ctx.fillStyle = 'rgba(46,46,51,0.14)'; ctx.beginPath(); ctx.ellipse(0, 14, 15, 4, 0, 0, TAU); ctx.fill();
    if (e.phase === 'bulle') {
      const k = clamp(1 - e.pt / GUM.blow, 0, 1), R = 14 + k * 30;
      ctx.fillStyle = 'rgba(255,170,210,0.45)'; ctx.strokeStyle = '#e0569b'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(14, -4, R, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.beginPath(); ctx.ellipse(14 - R * 0.4, -4 - R * 0.45, R * 0.22, R * 0.12, -0.6, 0, TAU); ctx.fill();
      if (k > 0.7) { ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 24); ctx.setLineDash([5, 6]); ctx.beginPath(); ctx.arc(0, 0, 70, 0, TAU); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }
    }
    ctx.save(); ctx.rotate(e.rot || 0);
    ctx.fillStyle = fl ? '#ffffff' : '#f08cbd'; ctx.strokeStyle = '#b8336f'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k <= 12; k++) { const a = k / 12 * TAU, rr = 15 + Math.sin(a * 3 + e.id) * 2 + j * 0.4; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(184,51,111,0.5)'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(-3, 2, 7, 0.4, 2.6); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(-5, -3, 2, 0, TAU); ctx.arc(4, -3, 2, 0, TAU); ctx.fill();
  } else {   // une feuille de cahier volante, qui ondule
    ctx.save(); ctx.rotate(e.rot || 0); ctx.scale(0.7 + 0.3 * Math.cos(G.time * 7 + e.id), 1);
    ctx.fillStyle = fl ? '#ffffff' : '#fffdf4'; ctx.strokeStyle = C.pencil; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-15, -19); ctx.lineTo(13, -19); ctx.quadraticCurveTo(17, 0, 14, 19); ctx.lineTo(-15, 19); ctx.quadraticCurveTo(-12, 0, -15, -19); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(140,152,214,0.8)'; ctx.lineWidth = 1; ctx.beginPath(); for (let y = -11; y <= 13; y += 6) { ctx.moveTo(-13, y); ctx.lineTo(13, y); } ctx.stroke();
    ctx.strokeStyle = C.margin; ctx.beginPath(); ctx.moveTo(-8, -18); ctx.lineTo(-8, 18); ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(-1, -4 + j * 0.3, 1.8, 0, TAU); ctx.arc(6, -4, 1.8, 0, TAU); ctx.fill();
    ctx.restore();
  }
}
function drawTableau(e, fr, fl) {
  const enraged = e.hp < e.maxHp / 2, w = 280, h = 180;
  ctx.save(); if (enraged) ctx.translate(vrnd(-1.2, 1.2), vrnd(-1.2, 1.2));
  ctx.fillStyle = 'rgba(46,46,51,0.16)'; ctx.beginPath(); ctx.ellipse(0, h / 2 + 46, w * 0.5, 14, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#8a5a32'; roundRect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24, 8); ctx.fill();   // le cadre de bois
  ctx.fillStyle = fl ? '#5f8a72' : enraged ? '#33443a' : '#2f4a3a'; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = 'rgba(255,255,255,0.06)'; for (let k = 0; k < 5; k++) ctx.fillRect(-w / 2 + k * 60 + 10, -h / 2 + 10, 30, h - 20);   // les traces de brosse
  // le visage à la craie
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x);
  ctx.strokeStyle = '#f2f0e6'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  for (const s of [-1, 1]) {
    ctx.beginPath(); ctx.arc(s * 50, -30, 20, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#f2f0e6'; ctx.beginPath(); ctx.arc(s * 50 + Math.cos(la) * 8, -30 + Math.sin(la) * 8, 6, 0, TAU); ctx.fill();
    if (enraged) { ctx.beginPath(); ctx.moveTo(s * 72, -62); ctx.lineTo(s * 28, -50); ctx.stroke(); }
  }
  ctx.beginPath(); if (enraged) ctx.arc(0, 40, 34, Math.PI + 0.4, TAU - 0.4); else ctx.arc(0, 8, 38, 0.4, Math.PI - 0.4); ctx.stroke();
  txt(enraged ? 'Au tableau !' : 'Bonnes vacances', 0, h / 2 - 22, 22, { color: '#f2f0e6', alpha: 0.85, weight: 400 });
  // le rebord, ses craies et la brosse (quand elle n'est pas partie)
  ctx.fillStyle = '#6e4626'; ctx.fillRect(-w / 2 - 6, h / 2 + 12, w + 12, 12);
  ['#fffdf4', '#ffe08a', '#ffb3c8', '#a9d8f5'].forEach((c, k) => { ctx.fillStyle = c; ctx.fillRect(-110 + k * 26, h / 2 + 6, 20, 6); });
  if (!G.brosse) drawBrosse(70, h / 2 + 2, 0);
  ctx.restore();
}
function drawBrosse(x, y, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = '#c98a4a'; roundRect(-30, -12, 60, 14, 4); ctx.fill();
  ctx.fillStyle = '#3a3a40'; ctx.fillRect(-28, 2, 56, 8);
  ctx.fillStyle = 'rgba(240,240,235,0.8)'; ctx.fillRect(-28, 8, 56, 3);
  ctx.restore();
}
// les projectiles de la page : craies de couleur et bouts de chewing-gum
function drawDernierBullets() {
  for (const b of G.ebul) {
    if (b.craie) {
      const a = Math.atan2(b.vy, b.vx);
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a);
      ctx.fillStyle = ['#fffdf4', '#ffe08a', '#ffb3c8', '#a9d8f5'][b.a % 4]; ctx.strokeStyle = '#6d6d74'; ctx.lineWidth = 1.5;
      ctx.fillRect(-11, -4, 22, 8); ctx.strokeRect(-11, -4, 22, 8);
      ctx.restore();
    } else if (b.gum) {
      ctx.fillStyle = '#f08cbd'; ctx.strokeStyle = '#b8336f'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, TAU); ctx.fill(); ctx.stroke();
    }
  }
}
function drawDernierFx() {
  if (!enDernier()) { if (G.p && G.p.gum > 0) drawGumFeet(); return; }
  drawDernierBullets();
  const V = G.vent;
  if (V && (V.warn > 0 || V.gust > 0) && countType('feuille')) {   // les traits du courant d'air
    const ux = Math.cos(V.a), uy = Math.sin(V.a), vx = -uy, vy = ux;
    ctx.save(); ctx.strokeStyle = C.pencil; ctx.globalAlpha = V.gust > 0 ? 0.45 : 0.3; ctx.lineWidth = 2; ctx.lineCap = 'round';
    for (let i = 0; i < 14; i++) {
      const off = (i - 7) * 70, run = ((G.t * (V.gust > 0 ? 900 : 300) + i * 173) % 1400) - 700;
      const x = G.p.x + vx * off + ux * run, y = G.p.y + vy * off + uy * run;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + ux * 30 + vx * 6, y + uy * 30 + vy * 6, x + ux * 70, y + uy * 70); ctx.stroke();
    }
    ctx.restore();
  }
  const B = G.brosse;
  if (B) {
    if (B.phase === 'aim') {
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.35 + 0.25 * Math.sin(G.time * 20); ctx.setLineDash([8, 10]); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(B.x, B.y); ctx.lineTo(B.x + B.ux * TAB.brosseSpeed * TAB.brosseT, B.y + B.uy * TAB.brosseSpeed * TAB.brosseT); ctx.stroke(); ctx.restore();
    }
    drawBrosse(B.x, B.y, B.phase === 'go' ? Math.atan2(B.uy, B.ux) : 0);
  }
  for (const c of G.crisses) {   // le cercle de craie, avec son trou
    if (c.t < 0) continue;
    const R = crisseR(c), a = clamp(1 - (c.t - c.dur + 0.4) / 0.4, 0, 1);
    ctx.save(); ctx.globalAlpha = 0.85 * a; ctx.lineCap = 'round';
    ctx.strokeStyle = '#8a909c'; ctx.lineWidth = 17; ctx.beginPath(); ctx.arc(c.x, c.y, R, c.gap + c.w, c.gap - c.w + TAU); ctx.stroke();   // un contour gris, pour que la craie se voie sur le papier
    ctx.strokeStyle = '#f2f0e6'; ctx.lineWidth = 12;
    ctx.beginPath(); ctx.arc(c.x, c.y, R, c.gap + c.w, c.gap - c.w + TAU); ctx.stroke();
    ctx.strokeStyle = '#7a7a82'; ctx.lineWidth = 2.5; ctx.setLineDash([10, 8]); ctx.beginPath(); ctx.arc(c.x, c.y, R, c.gap + c.w, c.gap - c.w + TAU); ctx.stroke();
    ctx.restore();
    txt('criii', c.x + Math.cos(c.gap + Math.PI) * R, c.y + Math.sin(c.gap + Math.PI) * R - 18, 24, { color: C.pencil, alpha: 0.7 * a });
  }
  if (G.p && G.p.gum > 0) drawGumFeet();
}
function drawGumFeet() {   // des fils roses collés à la goutte
  const p = G.p;
  ctx.save(); ctx.strokeStyle = '#e0569b'; ctx.lineWidth = 2.5; ctx.globalAlpha = Math.min(1, p.gum);
  for (let k = 0; k < 4; k++) { const a = Math.PI * 0.2 + k * 0.6; ctx.beginPath(); ctx.moveTo(p.x + Math.cos(a) * 10, p.y + Math.sin(a) * 10); ctx.quadraticCurveTo(p.x + Math.cos(a) * 20, p.y + 22, p.x + Math.cos(a) * 26 + Math.sin(G.time * 5 + k) * 3, p.y + 26); ctx.stroke(); }
  ctx.restore();
}
