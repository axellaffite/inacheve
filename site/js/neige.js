'use strict';
// Chapitre XVIII (itération 34) : la classe de neige. Une page bleu glacier, du verglas où tout glisse,
// des flocons qui éclatent en étoiles de glace, des boules de neige qui grossissent en roulant, et la Grande Moufle.

const NOTES_NEIGE = [
  { x: WORLD.w / 2, y: -150, t: '— carnet n° 12 · chapitre XVIII : la classe de neige —', r: -0.02 },
  { x: WORLD.w * 0.72, y: -96, t: 'ajouté : le bonhomme de neige', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'la luge ? le chocolat chaud ?', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'ne pas oublier', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'les moufles', r: -0.05 },
  { x: -160, y: WORLD.h * 0.45 + 88, t: '(attachées à la ficelle)', r: -0.04 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'trois boules font un bonhomme', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: 'attention : ça glisse !', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: '− 5 °C au chalet', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'février', r: 0.05 },
  { x: WORLD.w * 0.3, y: -96, t: 'une classe de plus', r: -0.02 }
];
const DICTEES_NEIGE = ['SKI', 'LUGE', 'NEIGE', 'SAPIN', 'FLOCON', 'BONNET', 'MOUFLE', 'CHALET', 'ÉCHARPE', 'AVALANCHE'];
const NEIGE_TYPES = new Set(['flocon', 'boule']);
Object.assign(ETYPES, {
  flocon: { r: 15, hp: 7, speed: 70, dmg: 1, xp: 2, agil: 2.6 },
  boule: { r: 12, hp: 5, speed: 96, dmg: 1, xp: 2, agil: 2.2 },
  moufle: { r: 105, hp: 1750, speed: 40, dmg: 2, xp: 280, agil: 1.2, boss: true }
});
const enNeige = () => CH().paper === 'neige';

CHAPTERS.push({
  num: 'XVIII', name: 'La classe de neige', done: 'La classe de neige : tout schuss !', paper: 'neige', notes: NOTES_NEIGE, dictees: DICTEES_NEIGE,
  intro: 'Chapitre XVIII : la classe de neige. Ça glisse, et il neige sur la page…', boss: 'moufle', bossName: 'La Grande Moufle',
  bossIntro: 'La Grande Moufle descend la piste !', bossBack: 'La Grande Moufle revient, toute séchée.', bossSound: 'boss18',
  scale: 72, rateOff: 255, rateCap: 22, waveCap: 'Bataille de boules de neige !',
  meet: {
    flocon: 'Nouveau : le flocon. Il tourne, tourne… et éclate en étoile de glace !',
    boule: 'Nouveau : la boule de neige. Plus elle roule, plus elle grossit : biffe-la vite !'
  },
  pick(t, r) {
    if (t > 12 && r < 0.1 && countType('flocon') < 14) return 'flocon';
    if (t > 20 && r < 0.2 && countType('boule') < 10) return 'boule';
    if (t > 45 && r < 0.26 && countType('tache') < 8) return 'tache';
    if (t > 15 && r < 0.5) return 'biffure';
    return 'gribouillis';
  },
  wave(t, i) { return i % 5 === 0 ? 'boule' : i % 5 === 2 ? 'flocon' : t > 90 && i % 5 === 3 ? 'biffure' : 'gribouillis'; }
});
VOISIN_SAYS.neige = ['J’ai froid aux gouttes !', 'Une bataille de boules ?', 'Attention, ça glisse !', 'Mon bonnet !'];

/* ----- le verglas : des plaques de glace où tout glisse (la goutte comme les ratures) ----- */
const GLACE = { n: 6, grip: 2.2, enemyGrip: 0.22 };
function makeGlaces() {
  const out = [];
  for (let i = 0; i < 40 && out.length < GLACE.n; i++) {
    const g = { x: rnd(MARGIN_X + 260, WORLD.w - 280), y: rnd(300, WORLD.h - 260), rx: rnd(200, 330), ry: rnd(120, 190), a: rnd(-0.4, 0.4) };
    if (Math.hypot(g.x - WORLD.w / 2, g.y - WORLD.h / 2) < 380) continue;   // pas sous la goutte au départ
    if (out.some(o => Math.hypot(o.x - g.x, o.y - g.y) < o.rx + g.rx + 60)) continue;
    out.push(g);
  }
  return out;
}
function onGlace(x, y) {
  if (!G.glaces) return false;
  for (const g of G.glaces) {
    const c = Math.cos(-g.a), s = Math.sin(-g.a), dx = x - g.x, dy = y - g.y, lx = dx * c - dy * s, ly = dx * s + dy * c;
    if ((lx / g.rx) ** 2 + (ly / g.ry) ** 2 < 1) return true;
  }
  return false;
}
// l'adhérence de la goutte : 14 sur le papier, presque rien sur la glace
function neigeGrip(p) {
  if (!G.glaces || !onGlace(p.x, p.y)) return 14;
  if (!G.glaceSeen && G.state === 'play') { G.glaceSeen = true; caption('Verglas ! Ça glisse… pour les ratures aussi.', 2.8, 'green'); }
  return GLACE.grip;
}
const neigeEnemyGrip = e => G.glaces && !e.isBoss && onGlace(e.x, e.y) ? GLACE.enemyGrip : 1;

/* ----- la page ----- */
const SAPINS_NEIGE = Array.from({ length: 16 }, (_, i) => ({ x: 320 + (i * 977 % 2380), y: 380 + (i * 541 % 1450), s: 0.7 + (i * 7 % 5) * 0.12 }));
const CHALET_NEIGE = { x: WORLD.w - 760, y: 300 };
function drawNeige(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = 'rgba(206,228,247,0.32)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // un papier bleu glacier
  ctx.strokeStyle = 'rgba(140,152,214,0.35)'; ctx.lineWidth = 1.2 / ZOOM; ctx.beginPath();   // des grands carreaux, un peu givrés
  for (let x = Math.ceil(x0 / SQ) * SQ; x <= x1; x += SQ) { ctx.moveTo(x, y0); ctx.lineTo(x, y1); }
  for (let y = Math.ceil(y0 / SQ) * SQ; y <= y1; y += SQ) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
  ctx.stroke();
  ctx.strokeStyle = C.margin; ctx.globalAlpha = 0.55; ctx.lineWidth = 2.2 / ZOOM;
  ctx.beginPath(); ctx.moveTo(MARGIN_X, y0); ctx.lineTo(MARGIN_X, y1); ctx.stroke(); ctx.globalAlpha = 1;
  if (v.y0 < 330) txt('La classe de neige', WORLD.w / 2, 190, 70, { font: FONT_CURSIVE, weight: 400, color: '#3b6fa3', alpha: 0.5 });
  for (const s of SAPINS_NEIGE) if (s.x > v.x0 - 80 && s.x < v.x1 + 80 && s.y > v.y0 - 120 && s.y < v.y1 + 60) drawSapinNeige(s.x, s.y, s.s);
  if (CHALET_NEIGE.x + 300 > v.x0 && CHALET_NEIGE.x - 300 < v.x1 && CHALET_NEIGE.y + 260 > v.y0 && CHALET_NEIGE.y - 200 < v.y1) drawChaletNeige(CHALET_NEIGE.x, CHALET_NEIGE.y);
  if (G.glaces) for (const g of G.glaces) if (g.x + g.rx > v.x0 && g.x - g.rx < v.x1 && g.y + g.ry > v.y0 && g.y - g.ry < v.y1) drawGlace(g);
  if (y1 > WORLD.h - 80) {   // les congères en bas de page
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.strokeStyle = 'rgba(120,150,190,0.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x0, WORLD.h);
    for (let x = Math.floor(x0 / 90) * 90; x <= x1 + 90; x += 90) ctx.quadraticCurveTo(x + 45, WORLD.h - 50 - (x * 37 % 30), x + 90, WORLD.h);
    ctx.lineTo(x1, WORLD.h); ctx.closePath(); ctx.fill(); ctx.stroke();
  }
}
function drawSapinNeige(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#2f6b4f'; ctx.fillStyle = 'rgba(47,107,79,0.25)'; ctx.lineWidth = 2.5; ctx.lineJoin = 'round';
  for (let k = 0; k < 3; k++) { const w = 46 - k * 10, yy = -k * 34; ctx.beginPath(); ctx.moveTo(-w, yy); ctx.lineTo(0, yy - 52); ctx.lineTo(w, yy); ctx.closePath(); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = '#ffffff'; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.ellipse(0, -k * 34 - 44, 10 - k * 2, 5, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = '#8a5a32'; ctx.fillRect(-6, 0, 12, 16);
  ctx.restore();
}
function drawChaletNeige(x, y) {   // le chalet de la classe de neige, avec la cheminée qui fume
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = 0.45; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#6e4626'; ctx.lineWidth = 4; ctx.fillStyle = 'rgba(201,138,74,0.35)';
  ctx.beginPath(); ctx.rect(-180, 0, 360, 190); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(-230, 10); ctx.lineTo(0, -140); ctx.lineTo(230, 10); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.lineWidth = 2; for (let k = 1; k < 6; k++) { ctx.beginPath(); ctx.moveTo(-180, k * 32); ctx.lineTo(180, k * 32); ctx.stroke(); }
  ctx.fillStyle = '#ffe08a'; ctx.fillRect(-120, 50, 70, 60); ctx.strokeRect(-120, 50, 70, 60); ctx.fillRect(50, 50, 70, 60); ctx.strokeRect(50, 50, 70, 60);
  ctx.fillStyle = '#8a5a32'; ctx.fillRect(-26, 100, 52, 90);
  ctx.fillRect(110, -110, 34, 70);
  ctx.strokeStyle = C.pencil; ctx.lineWidth = 3;
  for (let k = 0; k < 3; k++) { const t = (G.time * 0.4 + k / 3) % 1; ctx.globalAlpha = 0.4 * (1 - t); ctx.beginPath(); ctx.arc(127 + Math.sin(t * 6) * 14, -120 - t * 120, 12 + t * 16, 0, TAU); ctx.stroke(); }
  ctx.restore();
  txt('le chalet', x, y + 230, 30, { color: '#6e4626', alpha: 0.45, rot: -0.03 });
}
function drawGlace(g) {   // une plaque de verglas : bleu pâle, reflets et traces de patins
  ctx.save(); ctx.translate(g.x, g.y); ctx.rotate(g.a);
  ctx.fillStyle = 'rgba(170,214,245,0.55)'; ctx.strokeStyle = 'rgba(90,150,205,0.7)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(0, 0, g.rx, g.ry, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-g.rx * 0.6, -g.ry * 0.35); ctx.lineTo(-g.rx * 0.3, -g.ry * 0.55); ctx.moveTo(-g.rx * 0.45, -g.ry * 0.15); ctx.lineTo(-g.rx * 0.2, -g.ry * 0.3); ctx.stroke();
  ctx.strokeStyle = 'rgba(90,150,205,0.4)'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.ellipse(g.rx * 0.1, g.ry * 0.15, g.rx * 0.5, g.ry * 0.35, 0.3, 0.2, 4.4); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(g.rx * 0.15, g.ry * 0.1, g.rx * 0.42, g.ry * 0.28, 0.25, 0.6, 5); ctx.stroke();
  ctx.restore();
}
// la neige qui tombe, par-dessus tout (dessinée dans le monde, autour de la vue)
function drawNeigeFlocons(v) {
  ctx.save(); ctx.fillStyle = '#ffffff'; ctx.strokeStyle = 'rgba(110,140,185,0.55)'; ctx.lineWidth = 1;
  const W0 = v.x1 - v.x0 + 200, H0 = v.y1 - v.y0 + 200;
  for (let i = 0; i < 70; i++) {
    const sp = 40 + (i * 13 % 50), x = v.x0 - 100 + ((i * 397 + Math.sin(G.time * 0.7 + i) * 30 + G.time * 12) % W0 + W0) % W0, y = v.y0 - 100 + ((i * 211 + G.time * sp) % H0);
    const r = 2 + (i % 3);
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); ctx.stroke();
  }
  ctx.restore();
}

/* ----- les ratures de neige ----- */
const FLOCON = { range: 380, spin: 0.85, cd: [3, 4.6], n: 6, speed: 230, life: 1.7 };
const BOULE = { grow: 0.011, rMax: 36, hpPerR: 0.55, big: 25 };
function stepNeigeEnemy(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  e.pt -= dt;
  if (e.type === 'flocon') {   // il flotte en zigzag, puis tourne de plus en plus vite et éclate en étoile de glace
    const w = Math.sin(G.t * 2.2 + e.id) * 0.9;
    MV.x += -dy / d * e.speed * w; MV.y += dx / d * e.speed * w;
    if (e.phase === 'eclat') {
      MV.x *= 0.08; MV.y *= 0.08; e.rot = (e.rot || 0) + dt * 14;
      if (e.pt <= 0) {
        const off = e.rot;
        for (let i = 0; i < FLOCON.n; i++) { const a = off + i / FLOCON.n * TAU; G.ebul.push({ x: e.x + Math.cos(a) * 20, y: e.y + Math.sin(a) * 20, vx: Math.cos(a) * FLOCON.speed, vy: Math.sin(a) * FLOCON.speed, life: FLOCON.life, glace: true, a }); }
        AU.play('flocon', e.id); e.phase = 'walk'; e.pt = rnd(FLOCON.cd[0], FLOCON.cd[1]);
      }
    } else {
      e.rot = (e.rot || 0) + dt * 1.2;
      if (e.pt <= 0) { if (d < FLOCON.range && !hid) { e.phase = 'eclat'; e.pt = FLOCON.spin; } else e.pt = 0.4; }
    }
  } else {   // la boule de neige roule, et grossit en roulant (plus lente, plus solide, plus lourde)
    const sp = Math.hypot(e.vx, e.vy);
    if (e.r < BOULE.rMax) {
      const dr = Math.min(BOULE.rMax - e.r, sp * dt * BOULE.grow);
      const sc = e.hsc || (e.hsc = e.maxHp / ETYPES.boule.hp);
      e.r += dr; e.hp += dr * BOULE.hpPerR * sc; e.maxHp += dr * BOULE.hpPerR * sc;
    }
    if (e.r > BOULE.big) e.dmg = 2;
    const k = 12 / e.r; MV.x *= 0.55 + 0.45 * k; MV.y *= 0.55 + 0.45 * k;
    e.rot = (e.rot || 0) + (dx >= 0 ? 1 : -1) * sp * dt / e.r;
  }
}
function neigeDeath(e) {
  if (e.type === 'boule') {
    splat(e.x, e.y, e.r * 0.8, '#9cc3e6', 0.14, 6);
    for (let i = 0; i < 12; i++) { const a = rnd(TAU), s = rnd(80, 260); G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6, max: 0.6, size: rnd(2.5, 5), color: '#ffffff', drag: 4 }); }
    if (e.r > BOULE.big && countType('boule') < 12) for (let i = 0; i < 2; i++) { const b = spawnEnemy('boule', e.x + rnd(-14, 14), e.y + rnd(-14, 14)); b.vx = rnd(-200, 200); b.vy = rnd(-200, 200); }   // une grosse boule se casse en deux petites
  } else for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * 180, vy: Math.sin(a) * 180, life: 0.5, max: 0.5, size: 3, color: '#8fc4ef', drag: 4 }); }
}

/* ----- la Grande Moufle ----- */
const MOUF = { volleys: 3, gap: 0.4, fan: 5, fan2: 7, speed: 300, claqueR: 165, claqueWarn: 1.0, avSpeed: 390, avFrom: 1000, avLen: 2600, avGap: 190, avThick: 38 };
function stepMoufle(e, dt, dx, dy, d, slow) {
  const want = d < 330 ? -0.4 : d > 620 ? 2.4 : 0.6, enraged = e.hp < e.maxHp / 2, p = G.p;
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow * want; MV.y = dy / d * e.speed * slow * want;
  e.wave = (e.wave || 0) + dt;
  if (e.phase === 'boules') {   // des volées de boules de neige en éventail
    e.pt -= dt;
    if (e.pt <= 0 && e.vol > 0) {
      e.vol--; e.pt = MOUF.gap;
      const n = enraged ? MOUF.fan2 : MOUF.fan, a0 = Math.atan2(dy, dx);
      for (let i = 0; i < n; i++) { const a = a0 + (i - (n - 1) / 2) * 0.18; G.ebul.push({ x: e.x + Math.cos(a) * 90, y: e.y + Math.sin(a) * 90, vx: Math.cos(a) * MOUF.speed, vy: Math.sin(a) * MOUF.speed, life: 3.2, neige: true }); }
      AU.play('pouf');
    }
    if (e.vol <= 0 && e.pt <= 0) { e.phase = 'walk'; e.atk = enraged ? 1.2 : 1.8; }
    return;
  }
  if (e.phase === 'claque') {   // elle saute… et retombe à plat sur le rond annoncé
    const K = G.claque;
    if (!K) { e.phase = 'walk'; return; }
    const left = Math.max(0.05, MOUF.claqueWarn - K.t);
    MV.x = (K.x - e.x) / left; MV.y = (K.y - e.y) / left; MV.agil = 12;
    e.h = Math.sin(clamp(K.t / MOUF.claqueWarn, 0, 1) * Math.PI) * 90;
    return;
  }
  e.h = 0;
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % 3;
  if (m === 1) { e.phase = 'boules'; e.vol = MOUF.volleys + (enraged ? 1 : 0); e.pt = 0.2; }
  else if (m === 2 && !G.claque) {
    G.claque = { x: p.x, y: p.y, t: 0, boss: e }; e.phase = 'claque'; e.atk = enraged ? 2.2 : 2.8;
    AU.play('claqueAim');
    if (!G.claqueSeen) { G.claqueSeen = true; caption('La Moufle va retomber à plat sur le rond : écarte-toi !', 2.6, 'pink'); }
  } else {   // l'avalanche : un mur de neige qui traverse la page, avec un passage
    launchAvalanche(e, 0);
    if (enraged) launchAvalanche(e, -1.2);
    e.atk = enraged ? 2.6 : 3.2;
    if (!G.avalSeen) { G.avalSeen = true; caption('Avalanche ! Un mur de neige dévale : passe par le trou !', 3, 'pink'); }
  }
}
function launchAvalanche(e, delay) {
  const p = G.p, a = Math.atan2(p.y - e.y, p.x - e.x) + rnd(-0.5, 0.5), ux = Math.cos(a), uy = Math.sin(a);
  G.avalanches.push({ ox: p.x - ux * MOUF.avFrom, oy: p.y - uy * MOUF.avFrom, ux, uy, t: delay, pos: 0, gap: rnd(-220, 220), hit: false });
  AU.play('avalanche');
}
function avalancheDist(A, x, y) {   // distance au mur (Infinity si on est dans le passage)
  const ex = x - A.ox, ey = y - A.oy, along = ex * A.ux + ey * A.uy, lat = -ex * A.uy + ey * A.ux;
  if (Math.abs(lat - A.gap) < MOUF.avGap / 2 || Math.abs(lat) > MOUF.avLen / 2) return Infinity;
  return Math.abs(along - A.pos);
}
function stepNeigeFx(dt) {
  if (!enNeige()) return;
  if (!G.glaces) G.glaces = makeGlaces();
  const p = G.p, K = G.claque;
  if (K) {
    K.t += dt;
    if (K.t >= MOUF.claqueWarn) {   // patatras !
      G.claque = null;
      G.cam.shake = Math.max(G.cam.shake, 12); AU.play('claque');
      G.rings.push({ x: K.x, y: K.y, t: 0, dur: 0.5, r: MOUF.claqueR + 40, color: '#8fc4ef' });
      for (let i = 0; i < 26; i++) { const a = i / 26 * TAU, s = rnd(200, 420); G.parts.push({ x: K.x + Math.cos(a) * 60, y: K.y + Math.sin(a) * 60, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6, max: 0.6, size: rnd(3, 6), color: '#ffffff', drag: 4 }); }
      if ((p.x - K.x) ** 2 + (p.y - K.y) ** 2 < (MOUF.claqueR + p.r) ** 2) hurtPlayer(1, K.x, K.y);
      if (K.boss && !K.boss.dead) { K.boss.phase = 'walk'; K.boss.h = 0; }
    }
  }
  for (const A of G.avalanches) {
    A.t += dt; if (A.t < 0) continue;
    A.pos = A.t * MOUF.avSpeed;
    if (!A.hit && avalancheDist(A, p.x, p.y) < MOUF.avThick + p.r && p.dashT <= 0) { A.hit = true; hurtPlayer(1, p.x - A.ux * 30, p.y - A.uy * 30); }
    if (G.state === 'play' && rand() < dt * 20) {
      const l = rnd(-MOUF.avLen / 2, MOUF.avLen / 2);
      if (Math.abs(l - A.gap) > MOUF.avGap / 2) G.parts.push({ x: A.ox + A.ux * A.pos - A.uy * l, y: A.oy + A.uy * A.pos + A.ux * l, vx: A.ux * 200 + rnd(-40, 40), vy: A.uy * 200 + rnd(-40, 40), life: 0.5, max: 0.5, size: rnd(3, 6), color: '#ffffff', drag: 3 });
    }
  }
  G.avalanches = G.avalanches.filter(A => A.pos < MOUF.avFrom * 2.2);
}
function neigeDanger(x, y) {
  let s = 0;
  for (const e of G.enemies) if (e.type === 'flocon' && e.phase === 'eclat' && (x - e.x) ** 2 + (y - e.y) ** 2 < 200 * 200) s += 1.5;
  const K = G.claque;
  if (K && (x - K.x) ** 2 + (y - K.y) ** 2 < (MOUF.claqueR + 50) ** 2) s += 4;
  for (const A of G.avalanches) if (A.t >= -0.3) { const dd = avalancheDist(A, x, y); if (dd < 160) s += 3 * (1 - dd / 160) + 0.5; }
  return s;
}

/* ----- dessin ----- */
function drawNeigeEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (e.type === 'flocon') {   // un flocon à six branches, avec deux yeux au milieu
    const k = e.phase === 'eclat' ? 1 + 0.4 * (1 - e.pt / FLOCON.spin) : 1;
    if (e.phase === 'eclat') { ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.25 + 0.25 * Math.sin(G.time * 26); ctx.setLineDash([5, 6]); ctx.beginPath(); ctx.arc(0, 0, 60, 0, TAU); ctx.stroke(); ctx.restore(); }
    ctx.save(); ctx.rotate(e.rot || 0); ctx.scale(k, k);
    ctx.strokeStyle = fl ? C.red : '#4f86b8'; ctx.lineWidth = 2.6;
    for (let i = 0; i < 6; i++) {
      ctx.save(); ctx.rotate(i / 6 * TAU);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -17 - (fr - 1));
      ctx.moveTo(0, -9); ctx.lineTo(-5, -14); ctx.moveTo(0, -9); ctx.lineTo(5, -14); ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fill();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(-2.4, -1, 1.4, 0, TAU); ctx.arc(2.4, -1, 1.4, 0, TAU); ctx.fill();
  } else {   // une boule de neige qui roule (elle grossit), avec ses yeux qui restent en haut
    const r = e.r;
    ctx.fillStyle = 'rgba(46,46,51,0.14)'; ctx.beginPath(); ctx.ellipse(0, r * 0.9, r, r * 0.28, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.rotate(e.rot || 0);
    ctx.fillStyle = fl ? '#e4eeff' : '#ffffff'; ctx.strokeStyle = '#7ea6cc'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k <= 14; k++) { const a = k / 14 * TAU, rr = r + Math.sin(a * 5 + e.id) * 1.4 + (fr - 1) * 0.5; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(126,166,204,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(r * 0.2, r * 0.2, r * 0.45, 0.3, 2.4); ctx.stroke();
    ctx.restore();
    ctx.fillStyle = 'rgba(160,200,235,0.35)'; ctx.beginPath(); ctx.arc(r * 0.25, r * 0.3, r * 0.6, 0, TAU); ctx.fill();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(-r * 0.3, -r * 0.25, 2 + r * 0.04, 0, TAU); ctx.arc(r * 0.3, -r * 0.25, 2 + r * 0.04, 0, TAU); ctx.fill();
    if (r > BOULE.big) { ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-r * 0.45, -r * 0.5); ctx.lineTo(-r * 0.15, -r * 0.38); ctx.moveTo(r * 0.45, -r * 0.5); ctx.lineTo(r * 0.15, -r * 0.38); ctx.stroke(); }
  }
}
function drawMoufle(e, fr, fl) {   // une moufle géante tricotée, rouge à motifs, avec son pompon et sa ficelle
  const enraged = e.hp < e.maxHp / 2, h = e.h || 0;
  ctx.fillStyle = 'rgba(46,46,51,0.16)'; ctx.beginPath(); ctx.ellipse(0, 120, 110 - h * 0.3, 18, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(0, -h); if (enraged) ctx.translate(vrnd(-1.2, 1.2), vrnd(-1.2, 1.2));
  ctx.rotate(Math.sin(e.wave * 2) * 0.06);
  const body = fl ? '#e86a62' : enraged ? '#b8333b' : '#d0453e';
  ctx.fillStyle = body; ctx.strokeStyle = '#7e2226'; ctx.lineWidth = 4;
  ctx.beginPath();   // la main
  ctx.moveTo(-80, 80); ctx.lineTo(-86, -40); ctx.quadraticCurveTo(-84, -120, -10, -124); ctx.quadraticCurveTo(70, -122, 76, -40); ctx.lineTo(72, 80); ctx.closePath(); ctx.fill(); ctx.stroke();
  const tw = Math.sin(e.wave * 3) * 0.15;   // le pouce qui gigote
  ctx.save(); ctx.translate(74, -10); ctx.rotate(-0.5 + tw);
  ctx.beginPath(); ctx.ellipse(26, 0, 34, 22, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
  ctx.fillStyle = '#fdfcf6';   // le revers en côtes
  ctx.beginPath(); roundRect(-92, 72, 172, 46, 12); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(126,34,38,0.45)'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = -80; x <= 70; x += 14) { ctx.moveTo(x, 76); ctx.lineTo(x, 114); } ctx.stroke();
  ctx.fillStyle = '#fdfcf6';   // le motif de flocons tricotés
  for (const [x, y] of [[-50, 30], [30, 30], [-10, -60]]) for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(x + Math.cos(i * Math.PI / 2) * 9, y + Math.sin(i * Math.PI / 2) * 9, 3.5, 0, TAU); ctx.fill(); }
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x);
  for (const s of [-1, 1]) {   // les yeux
    ctx.fillStyle = '#fdfcf6'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(-10 + s * 30, -20, 15, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(-10 + s * 30 + Math.cos(la) * 6, -20 + Math.sin(la) * 6, 5.5, 0, TAU); ctx.fill();
    if (enraged) { ctx.beginPath(); ctx.moveTo(-10 + s * 46, -46); ctx.lineTo(-10 + s * 14, -36); ctx.stroke(); }
  }
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 3; ctx.beginPath();
  if (enraged) ctx.arc(-10, 34, 18, Math.PI + 0.4, TAU - 0.4); else ctx.arc(-10, 14, 18, 0.4, Math.PI - 0.4);
  ctx.stroke();
  ctx.restore();
  ctx.strokeStyle = C.pencil; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-90, 110 - h); ctx.quadraticCurveTo(-150, 140, -170 + Math.sin(e.wave * 2) * 10, 90); ctx.stroke();   // la ficelle
  ctx.fillStyle = '#fdfcf6'; ctx.strokeStyle = '#7ea6cc'; ctx.beginPath(); ctx.arc(-170 + Math.sin(e.wave * 2) * 10, 86, 14, 0, TAU); ctx.fill(); ctx.stroke();   // le pompon
}
function drawNeigeFx() {
  for (const b of G.ebul) {
    if (b.glace) {   // un éclat de glace en losange
      const a = Math.atan2(b.vy, b.vx);
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a);
      ctx.fillStyle = 'rgba(190,226,250,0.95)'; ctx.strokeStyle = '#4f86b8'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(0, -5); ctx.lineTo(-10, 0); ctx.lineTo(0, 5); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.restore();
    } else if (b.neige) {   // une boule de neige
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#7ea6cc'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(b.x, b.y, 10, 0, TAU); ctx.fill(); ctx.stroke();
    }
  }
  if (!enNeige()) return;
  const K = G.claque;
  if (K) {   // le rond où la moufle va retomber
    const k = clamp(K.t / MOUF.claqueWarn, 0, 1);
    ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.35 + 0.3 * Math.sin(G.time * 22); ctx.setLineDash([12, 10]); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(K.x, K.y, MOUF.claqueR, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(200,66,74,0.12)'; ctx.beginPath(); ctx.arc(K.x, K.y, MOUF.claqueR * k, 0, TAU); ctx.fill();
    ctx.restore();
  }
  for (const A of G.avalanches) {
    if (A.t < 0) continue;
    const cx = A.ox + A.ux * A.pos, cy = A.oy + A.uy * A.pos, vx = -A.uy, vy = A.ux, L = MOUF.avLen / 2, g0 = A.gap - MOUF.avGap / 2, g1 = A.gap + MOUF.avGap / 2;
    ctx.save(); ctx.lineCap = 'round';
    for (const [l0, l1] of [[-L, g0], [g1, L]]) {
      ctx.strokeStyle = 'rgba(120,150,190,0.75)'; ctx.lineWidth = MOUF.avThick * 2 + 6;
      ctx.beginPath(); ctx.moveTo(cx + vx * l0, cy + vy * l0); ctx.lineTo(cx + vx * l1, cy + vy * l1); ctx.stroke();
      ctx.strokeStyle = '#ffffff'; ctx.lineWidth = MOUF.avThick * 2;
      ctx.beginPath(); ctx.moveTo(cx + vx * l0, cy + vy * l0); ctx.lineTo(cx + vx * l1, cy + vy * l1); ctx.stroke();
      ctx.fillStyle = '#ffffff';   // la crête bosselée
      for (let l = l0 + 20; l < l1 - 10; l += 46) { ctx.beginPath(); ctx.arc(cx + vx * l + A.ux * MOUF.avThick, cy + vy * l + A.uy * MOUF.avThick, 22 + (Math.abs(l) * 7 % 10), 0, TAU); ctx.fill(); }
    }
    ctx.restore();
    txt('passe ici !', cx + vx * A.gap - A.ux * 70, cy + vy * A.gap - A.uy * 70, 24, { color: '#3b6fa3', alpha: 0.8 });
  }
}
