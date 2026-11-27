'use strict';
// Chapitre XIX (itération 36) : le cahier de sciences. Une page d'observation avec ses feuilles d'herbier scotchées,
// le cycle de l'eau et la métamorphose dessinés au crayon ; des têtards qui deviennent grenouilles, des pissenlits
// qui soufflent leurs aigrettes, et la Grande Loupe, qui grossit tout ce qu'elle regarde.

const NOTES_SCI = [
  { x: WORLD.w / 2, y: -150, t: '— carnet n° 13 · chapitre XIX : le cahier de sciences —', r: -0.02 },
  { x: WORLD.w * 0.72, y: -96, t: 'ajouté : le haricot dans le coton', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'l’aimant ? la boussole ? les volcans ?', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'observer,', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'noter,', r: -0.05 },
  { x: -160, y: WORLD.h * 0.45 + 88, t: '(et dessiner)', r: -0.04 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'hypothèse : l’encre pousse si on l’arrose', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: 'ne pas toucher aux têtards !', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'expérience n° 1', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'avril', r: 0.05 },
  { x: WORLD.w * 0.3, y: -96, t: 'un treizième cahier', r: -0.02 }
];
const DICTEES_SCI = ['EAU', 'LOUPE', 'GRAINE', 'TÊTARD', 'RACINE', 'POUSSE', 'FEUILLE', 'HERBIER', 'GRENOUILLE', 'EXPÉRIENCE'];
const SCI_TYPES = new Set(['tetard', 'grenouille', 'pissenlit']);
Object.assign(ETYPES, {
  tetard: { r: 12, hp: 5, speed: 96, dmg: 1, xp: 2, agil: 2.4 },
  grenouille: { r: 18, hp: 14, speed: 46, dmg: 1, xp: 4, agil: 2 },
  pissenlit: { r: 20, hp: 10, speed: 34, dmg: 1, xp: 3, agil: 1.4 },
  loupe: { r: 100, hp: 1800, speed: 42, dmg: 2, xp: 290, agil: 1.2, boss: true }
});
const enSci = () => CH().paper === 'sciences';

CHAPTERS.push({
  num: 'XIX', name: 'Le cahier de sciences', done: 'Le cahier de sciences : expérience réussie !', paper: 'sciences', notes: NOTES_SCI, dictees: DICTEES_SCI,
  intro: 'Chapitre XIX : le cahier de sciences. Observe bien : ici, tout pousse et tout change…', boss: 'loupe', bossName: 'La Grande Loupe',
  bossIntro: 'La Grande Loupe se penche sur la page !', bossBack: 'La Grande Loupe revient, toute polie.', bossSound: 'boss19',
  scale: 74, rateOff: 260, rateCap: 22, waveCap: 'Une mare entière de têtards !',
  meet: {
    tetard: 'Nouveau : le têtard. Laisse-le grandir… et il devient grenouille !',
    grenouille: 'Nouveau : la grenouille. Elle saute : regarde où elle va retomber !',
    pissenlit: 'Nouveau : le pissenlit. Il souffle ses aigrettes, même quand on le biffe !'
  },
  pick(t, r) {
    if (t > 8 && r < 0.16 && countType('tetard') < 14) return 'tetard';
    if (t > 30 && r < 0.24 && countType('pissenlit') < 6) return 'pissenlit';
    if (t > 75 && r < 0.28 && countType('grenouille') < 4) return 'grenouille';
    if (t > 15 && r < 0.5) return 'biffure';
    return 'gribouillis';
  },
  wave(t, i) { return i % 4 === 0 ? 'tetard' : i % 4 === 2 && t > 60 ? 'pissenlit' : i % 4 === 1 ? 'tetard' : 'gribouillis'; }
});
VOISIN_SAYS.sciences = ['Il pousse, il pousse !', 'Je note dans mon cahier.', 'Des têtards ! Trop mignons.', 'Hypothèse : on va gagner.'];

/* ----- la page : feuilles d'herbier scotchées, cycle de l'eau, métamorphose ----- */
const HERBIER_SCI = [
  { x: 520, y: 520, k: 'chêne', a: -0.3 }, { x: 1250, y: 380, k: 'érable', a: 0.2 }, { x: 2150, y: 640, k: 'ginkgo', a: -0.1 },
  { x: 800, y: 1450, k: 'trèfle', a: 0.25 }, { x: 1700, y: 1650, k: 'chêne', a: 0.4 }, { x: 2500, y: 1350, k: 'érable', a: -0.35 },
  { x: 420, y: 1050, k: 'ginkgo', a: 0.15 }, { x: 2650, y: 300, k: 'trèfle', a: -0.2 }
];
const CYCLE_SCI = { x: 1950, y: 1050 }, META_SCI = { x: 1050, y: 900 };
function drawSciences(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = 'rgba(214,236,196,0.26)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // un papier vert tendre
  ctx.strokeStyle = 'rgba(120,160,110,0.3)'; ctx.lineWidth = 1.2 / ZOOM; ctx.beginPath();
  for (let x = Math.ceil(x0 / SQ) * SQ; x <= x1; x += SQ) { ctx.moveTo(x, y0); ctx.lineTo(x, y1); }
  for (let y = Math.ceil(y0 / SQ) * SQ; y <= y1; y += SQ) { ctx.moveTo(x0, y); ctx.lineTo(x1, y); }
  ctx.stroke();
  ctx.strokeStyle = C.margin; ctx.globalAlpha = 0.55; ctx.lineWidth = 2.2 / ZOOM;
  ctx.beginPath(); ctx.moveTo(MARGIN_X, y0); ctx.lineTo(MARGIN_X, y1); ctx.stroke(); ctx.globalAlpha = 1;
  if (v.y0 < 330) txt('Le cahier de sciences', WORLD.w / 2, 190, 70, { font: FONT_CURSIVE, weight: 400, color: '#4f7a34', alpha: 0.5 });
  const near = (x, y, m) => x + m > v.x0 && x - m < v.x1 && y + m > v.y0 && y - m < v.y1;
  for (const h of HERBIER_SCI) if (near(h.x, h.y, 160)) drawHerbierFeuille(h);
  if (near(CYCLE_SCI.x, CYCLE_SCI.y, 330)) drawCycleEau(CYCLE_SCI.x, CYCLE_SCI.y);
  if (near(META_SCI.x, META_SCI.y, 380)) drawMetamorphose(META_SCI.x, META_SCI.y);
}
function leafPath(kind, s) {   // le contour d'une feuille, la queue en bas
  ctx.beginPath();
  if (kind === 'chêne') {
    for (let i = 0; i <= 40; i++) { const t = i / 40, a = t * TAU, rr = 1 + 0.16 * Math.sin(a * 5); ctx.lineTo(Math.sin(a) * 0.48 * rr * s, -Math.cos(a) * rr * s - s * 0.1); }
  } else if (kind === 'érable') {
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i - 2) / 10 * TAU * 0.9 + 0.3, rr = i % 2 ? 0.45 : 1; ctx.lineTo(Math.cos(a) * rr * s, Math.sin(a) * rr * s); }
  } else if (kind === 'ginkgo') {
    ctx.moveTo(0, s * 0.5); ctx.lineTo(-s * 0.9, -s * 0.45); ctx.quadraticCurveTo(-s * 0.45, -s * 0.95, -s * 0.06, -s * 0.6); ctx.lineTo(0, -s * 0.4); ctx.lineTo(s * 0.06, -s * 0.6); ctx.quadraticCurveTo(s * 0.45, -s * 0.95, s * 0.9, -s * 0.45);
  } else for (let k = 0; k < 3; k++) { const a = -Math.PI / 2 + (k - 1) * 2.1; ctx.moveTo(Math.cos(a) * s * 0.42 + s * 0.38, Math.sin(a) * s * 0.42); ctx.arc(Math.cos(a) * s * 0.42, Math.sin(a) * s * 0.42, s * 0.38, 0, TAU); }
  ctx.closePath();
}
function drawHerbierFeuille(h) {
  ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.a); ctx.globalAlpha = 0.5;
  const col = h.k === 'érable' ? '#c9752e' : h.k === 'ginkgo' ? '#d8b83a' : '#5f8a3a';
  leafPath(h.k, 70); ctx.fillStyle = col; ctx.fill(); ctx.strokeStyle = '#3e5a26'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.strokeStyle = 'rgba(62,90,38,0.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 90); ctx.lineTo(0, -55); ctx.stroke();   // la nervure et la queue
  ctx.fillStyle = 'rgba(255,255,240,0.55)'; ctx.strokeStyle = 'rgba(160,160,150,0.5)'; ctx.lineWidth = 1;   // le scotch
  ctx.save(); ctx.translate(0, 70); ctx.rotate(0.5); ctx.fillRect(-30, -9, 60, 18); ctx.strokeRect(-30, -9, 60, 18); ctx.restore();
  ctx.restore();
  txt(h.k === 'érable' ? 'feuille d’érable' : 'feuille de ' + h.k, h.x, h.y + 130, 24, { color: C.pencil, alpha: 0.55, rot: h.a * 0.2 });
}
function drawCycleEau(x, y) {   // le cycle de l'eau, dessiné au crayon
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = 0.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#d89a1c'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-200, -150, 40, 0, TAU); ctx.stroke();   // le soleil
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + G.time * 0.2; ctx.beginPath(); ctx.moveTo(-200 + Math.cos(a) * 52, -150 + Math.sin(a) * 52); ctx.lineTo(-200 + Math.cos(a) * 70, -150 + Math.sin(a) * 70); ctx.stroke(); }
  ctx.strokeStyle = '#5a7fa8'; ctx.lineWidth = 3; ctx.beginPath();   // le nuage
  for (const [cx, cy, r] of [[130, -170, 40], [180, -190, 50], [235, -165, 38]]) { ctx.moveTo(cx + r, cy); ctx.arc(cx, cy, r, 0, TAU); }
  ctx.stroke();
  ctx.setLineDash([6, 10]); ctx.lineDashOffset = -G.time * 30;
  for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(140 + i * 26, -120); ctx.lineTo(120 + i * 26, 40); ctx.stroke(); }   // la pluie
  ctx.setLineDash([]);
  ctx.beginPath(); for (let i = -280; i <= 280; i += 40) ctx.quadraticCurveTo(i + 20, 110 + Math.sin(i + G.time) * 6, i + 40, 100); ctx.stroke();   // la mer
  ctx.strokeStyle = C.pencil; ctx.lineWidth = 3; ctx.beginPath();   // les flèches
  ctx.moveTo(-160, 80); ctx.quadraticCurveTo(-120, -60, -40, -120); ctx.moveTo(-40, -120); ctx.lineTo(-62, -122); ctx.moveTo(-40, -120); ctx.lineTo(-52, -100);
  ctx.moveTo(-20, -210); ctx.quadraticCurveTo(40, -240, 90, -205); ctx.moveTo(90, -205); ctx.lineTo(70, -216); ctx.moveTo(90, -205); ctx.lineTo(78, -188);
  ctx.stroke(); ctx.restore();
  txt('évaporation', x - 210, y - 20, 26, { color: C.pencil, alpha: 0.5, rot: -0.5 });
  txt('pluie', x + 270, y - 60, 26, { color: C.pencil, alpha: 0.5 });
  txt('Fig. 1 : le cycle de l’eau', x, y + 170, 28, { color: '#4f7a34', alpha: 0.55 });
}
function drawMetamorphose(x, y) {   // Fig. 2 : de l'œuf à la grenouille
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = 0.4; ctx.lineCap = 'round';
  const pts = [[-270, 0], [-90, -10], [90, 0], [270, -10]];
  ctx.fillStyle = '#2e3a2a'; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(-290 + (i % 3) * 18, -14 + Math.floor(i / 3) * 16, 6, 0, TAU); ctx.fill(); }
  ctx.save(); ctx.translate(pts[1][0], pts[1][1]); drawTetardForme(0, 0, 0); ctx.restore();
  ctx.save(); ctx.translate(pts[2][0], pts[2][1]); drawTetardForme(0, 1, 0); ctx.restore();
  ctx.save(); ctx.translate(pts[3][0], pts[3][1]); ctx.scale(1.3, 1.3); drawGrenouilleForme(0, false, 0); ctx.restore();
  ctx.strokeStyle = C.pencil; ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) { const a = pts[i][0] + 50, b = pts[i + 1][0] - 50; ctx.beginPath(); ctx.moveTo(a, -50); ctx.quadraticCurveTo((a + b) / 2, -90, b, -50); ctx.lineTo(b - 14, -58); ctx.moveTo(b, -50); ctx.lineTo(b - 6, -66); ctx.stroke(); }
  ctx.restore();
  txt('Fig. 2 : la métamorphose', x, y + 90, 28, { color: '#4f7a34', alpha: 0.55 });
}

/* ----- les ratures de sciences ----- */
const TETARD = { grow: 16, morph: 0.9, maxFrogs: 6 };
const GRENOUILLE = { air: 0.75, reach: 420, R: 54, cd: [1.6, 2.6] };
const PISSENLIT = { range: 460, warn: 0.7, n: 6, fan: 1.6, speed: 120, life: 4.5, cd: [3.6, 5], regrow: 2.2, death: 8 };
function stepSciEnemy(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  e.pt -= dt;
  if (e.type === 'tetard') {   // il frétille vers toi… et grandit
    const w = Math.sin(G.t * 6 + e.id) * 0.7;
    MV.x += -dy / d * e.speed * w; MV.y += dx / d * e.speed * w;
    e.age = (e.age || 0) + dt; e.rot = Math.atan2(MV.y, MV.x);
    if (e.phase === 'morph') {
      MV.x *= 0.05; MV.y *= 0.05;
      if (e.pt <= 0) tetardDevientGrenouille(e);
    } else if (e.age > TETARD.grow && !e.copie) {
      if (countType('grenouille') < TETARD.maxFrogs) { e.phase = 'morph'; e.pt = TETARD.morph; AU.play('morph'); }
      else e.age = TETARD.grow * 0.7;   // la mare est pleine de grenouilles : il attend encore un peu
    }
  } else if (e.type === 'grenouille') {   // elle saute, et retombe là où tu allais
    if (e.phase === 'saut') {
      const k = clamp(1 - e.pt / GRENOUILLE.air, 0, 1);
      MV.x = 0; MV.y = 0; e.vx = 0; e.vy = 0;
      e.x = lerp(e.jx0, e.jx, ease(k)); e.y = lerp(e.jy0, e.jy, ease(k)); e.h = Math.sin(k * Math.PI) * 90;
      if (e.pt <= 0) grenouilleAtterrit(e);
      return;
    }
    MV.x *= 0.35; MV.y *= 0.35; e.rot = Math.atan2(dy, dx);
    if (e.pt <= 0) {
      if (d < 640 && !hid) {
        const p = G.p, tx = p.x + p.vx * 0.45, ty = p.y + p.vy * 0.45, jd = Math.hypot(tx - e.x, ty - e.y) || 1, k = Math.min(1, GRENOUILLE.reach * (e.big || 1) / jd);
        e.phase = 'saut'; e.pt = GRENOUILLE.air; e.ghost = true; e.jx0 = e.x; e.jy0 = e.y;
        e.jx = clamp(e.x + (tx - e.x) * k, 40, WORLD.w - 40); e.jy = clamp(e.y + (ty - e.y) * k, 40, WORLD.h - 40);
        AU.play('croa', e.id);
      } else e.pt = 0.5;
    }
  } else {   // le pissenlit dérive, gonfle les joues et souffle ses aigrettes
    const w = Math.sin(G.t * 1.3 + e.id) * 0.8;
    MV.x += -dy / d * e.speed * w; MV.y += dx / d * e.speed * w;
    e.bald = Math.max(0, (e.bald || 0) - dt);
    if (e.phase === 'souffle') {
      MV.x *= 0.1; MV.y *= 0.1;
      if (e.pt <= 0) {
        const a0 = Math.atan2(dy, dx);
        for (let i = 0; i < PISSENLIT.n; i++) { const a = a0 + (i - (PISSENLIT.n - 1) / 2) * PISSENLIT.fan / (PISSENLIT.n - 1); aigrette(e.x + Math.cos(a) * 22, e.y + Math.sin(a) * 22, a, PISSENLIT.speed); }
        AU.play('pfff'); e.phase = 'walk'; e.bald = PISSENLIT.regrow; e.pt = rnd(PISSENLIT.cd[0], PISSENLIT.cd[1]);
      }
    } else if (e.pt <= 0) { if (d < PISSENLIT.range && !hid && e.bald <= 0) { e.phase = 'souffle'; e.pt = PISSENLIT.warn; } else e.pt = 0.4; }
  }
}
function aigrette(x, y, a, sp) { G.ebul.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: PISSENLIT.life, aig: true, sway: rnd(TAU) }); }
function tetardDevientGrenouille(e) {
  const T = ETYPES.grenouille, b = e.big || 1, mul = T.hp / ETYPES.tetard.hp;
  e.type = 'grenouille'; e.r = T.r * b; e.maxHp *= mul; e.hp = e.maxHp; e.speed = T.speed * (b > 1 ? 0.85 : 1); e.xp = T.xp; e.agil = T.agil;
  e.phase = 'walk'; e.pt = 0.8; e.h = 0;
  addText(e.x, e.y - 30, 'croâ !', '#4f8a3a', 22);
  for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * 150, vy: Math.sin(a) * 150, life: 0.5, max: 0.5, size: 3, color: '#7fbf5a', drag: 4 }); }
  if (!G.morphSeen && G.state === 'play') { G.morphSeen = true; caption('Le têtard devient grenouille ! Biffe-les avant qu’ils grandissent.', 3, 'green'); }
  if (!G.seen.grenouille) G.seen.grenouille = true;
}
function grenouilleAtterrit(e) {
  const p = G.p, R = GRENOUILLE.R * (e.big || 1);
  e.ghost = false; e.h = 0; e.phase = 'walk'; e.pt = rnd(GRENOUILLE.cd[0], GRENOUILLE.cd[1]);
  if ((p.x - e.x) ** 2 + (p.y - e.y) ** 2 < (R + p.r) ** 2) hurtPlayer(e.dmg, e.x, e.y);
  G.rings.push({ x: e.x, y: e.y, t: 0, dur: 0.4, r: R + 30, color: '#8fc4ef' });
  for (let i = 0; i < 12; i++) { const a = rnd(TAU), s = rnd(90, 220); G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5, max: 0.5, size: rnd(2, 4), color: '#6fa8dc', drag: 4 }); }
  AU.play('plouf');
}
function sciDeath(e) {
  if (e.type === 'pissenlit') {   // biffé, il lâche toutes ses aigrettes, lentement
    const n = e.bald > 0 ? 3 : PISSENLIT.death, off = rnd(TAU);
    for (let i = 0; i < n; i++) { const a = off + i / n * TAU; aigrette(e.x + Math.cos(a) * 16, e.y + Math.sin(a) * 16, a, 80); }
    AU.play('pfff');
  } else for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, life: 0.5, max: 0.5, size: 3, color: '#6fa8dc', drag: 4 }); }
}

/* ----- la Grande Loupe ----- */
const LOUPE_B = { side: 430, lensR: 92, mag: 1.6, foyDur: 1.35, foyGap: 0.5, foyR: 34, foyR0: 150, track: 175, zoomN: 3, zoomRange: 720, big: 1.7, ring: 14, ringSpeed: 220 };
const GROSSIR_OK = new Set(['tetard', 'grenouille', 'pissenlit', 'gribouillis', 'biffure']);
function stepLoupe(e, dt, dx, dy, d, slow) {
  const enraged = e.hp < e.maxHp / 2, p = G.p;
  // elle se tient à côté de la goutte, à gauche ou à droite (on la voit mieux sur un écran large)
  const ax = p.x + (e.x >= p.x ? 1 : -1) * LOUPE_B.side, ay = p.y - 40, adx = ax - e.x, ady = ay - e.y, ad = Math.hypot(adx, ady) || 1;
  const sp = e.speed * slow * Math.min(5, ad / 90);
  MV.agil = e.agil; MV.x = adx / ad * sp; MV.y = ady / ad * sp;
  if (d < 260) { MV.x -= dx / d * e.speed; MV.y -= dy / d * e.speed; }
  e.real = true; e.wave = (e.wave || 0) + dt; e.h = 8 + Math.sin(e.wave * 2) * 8;
  if (e.phase === 'soleil') {   // trois rayons de soleil concentrés sur toi
    MV.x *= 0.3; MV.y *= 0.3; e.pt -= dt;
    if (e.pt <= 0 && e.vol > 0) { e.vol--; e.pt = LOUPE_B.foyDur + LOUPE_B.foyGap; launchFoyer(e, false); if (enraged) launchFoyer(e, true); }
    if (e.vol <= 0 && !G.foyers.some(f => f.boss === e)) { e.phase = 'walk'; e.atk = enraged ? 1.3 : 1.9; }
    return;
  }
  if (e.phase === 'reflets') {   // elle tourne sur elle-même et lance des reflets en couronne
    e.pt -= dt; e.spinA = (e.spinA || 0) + dt * 6;
    if (e.pt <= 0 && e.vol > 0) {
      e.vol--; e.pt = 0.45;
      const n = LOUPE_B.ring, off = e.spinA;
      for (let i = 0; i < n; i++) { const a = off + i / n * TAU; G.ebul.push({ x: e.x + Math.cos(a) * 100, y: e.y + Math.sin(a) * 100, vx: Math.cos(a) * LOUPE_B.ringSpeed, vy: Math.sin(a) * LOUPE_B.ringSpeed, life: 3.4, reflet: true }); }
      AU.play('reflet');
    }
    if (e.vol <= 0 && e.pt <= 0) { e.phase = 'walk'; e.atk = enraged ? 1.4 : 2; }
    return;
  }
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % 3;
  if (m === 1) {
    e.phase = 'soleil'; e.vol = 3; e.pt = 0.2;
    if (!G.foyerSeen) { G.foyerSeen = true; caption('La Loupe concentre le soleil sur toi : ne reste pas sous le point qui brille !', 3, 'pink'); }
  } else if (m === 2) { grossir(e, enraged); e.atk = enraged ? 2 : 2.6; }
  else { e.phase = 'reflets'; e.vol = enraged ? 3 : 2; e.pt = 0.3; }
}
function launchFoyer(e, lead) {
  const p = G.p;
  G.foyers.push({ x: p.x + (lead ? p.vx * 0.7 : 0), y: p.y + (lead ? p.vy * 0.7 : 0), t: 0, lead, boss: e });
  AU.play('foyer');
}
// la Loupe grossit les ratures qu'elle regarde (ou des têtards tout frais, s'il n'y a personne)
function grossir(e, enraged) {
  const n = LOUPE_B.zoomN + (enraged ? 1 : 0), R2 = LOUPE_B.zoomRange ** 2;
  let list = G.enemies.filter(o => !o.dead && !o.isBoss && !o.big && !o.ghost && GROSSIR_OK.has(o.type) && (o.x - e.x) ** 2 + (o.y - e.y) ** 2 < R2);
  if (list.length < 2) for (let i = 0; i < 2; i++) { const a = rnd(TAU); list.push(spawnEnemy(enraged && i === 0 ? 'grenouille' : 'tetard', e.x + Math.cos(a) * 150, e.y + Math.sin(a) * 150)); }
  list = list.map(o => ({ o, d: (o.x - e.x) ** 2 + (o.y - e.y) ** 2 })).sort((a, b) => a.d - b.d).slice(0, n).map(q => q.o);
  for (const o of list) {
    o.big = LOUPE_B.big; o.r *= LOUPE_B.big; o.hp *= 2; o.maxHp *= 2; o.dmg = 2; o.speed *= 0.85;
    G.zaps.push({ x0: e.x, y0: e.y - (e.h || 0) - 30, o, t: 0 });
    addText(o.x, o.y - o.r - 18, 'grossi !', C.red, 22);
  }
  AU.play('grossi');
  if (!G.grossiSeen) { G.grossiSeen = true; caption('La Loupe grossit les ratures : plus grosses, plus solides… mais plus lentes !', 3, 'pink'); }
}
function stepSciFx(dt) {
  if (!enSci()) return;
  const p = G.p;
  for (const b of G.ebul) if (b.aig) { const s = Math.sin(G.t * 2.5 + b.sway) * dt * 1.1, c = Math.cos(s), n = Math.sin(s), vx = b.vx; b.vx = vx * c - b.vy * n; b.vy = vx * n + b.vy * c; }   // les aigrettes ondulent
  for (const f of G.foyers) {
    f.t += dt;
    if (f.t < LOUPE_B.foyDur - 0.35) {   // le point de lumière suit la goutte, puis s'arrête
      const tx = p.x + (f.lead ? p.vx * 0.6 : 0), ty = p.y + (f.lead ? p.vy * 0.6 : 0), dd = Math.hypot(tx - f.x, ty - f.y), st = LOUPE_B.track * dt;
      if (dd > st) { f.x += (tx - f.x) / dd * st; f.y += (ty - f.y) / dd * st; } else { f.x = tx; f.y = ty; }
    }
    if (f.t >= LOUPE_B.foyDur) {   // ça chauffe !
      f.done = true;
      if ((p.x - f.x) ** 2 + (p.y - f.y) ** 2 < (LOUPE_B.foyR + p.r) ** 2) hurtPlayer(1, f.x, f.y);
      splat(f.x, f.y, 26, '#7a4a1e', 0.16, 6);
      for (let i = 0; i < 14; i++) { const a = rnd(TAU), s = rnd(40, 160); G.parts.push({ x: f.x, y: f.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 60, life: 0.6, max: 0.6, size: rnd(2, 5), color: i % 2 ? C.fire : '#ffd36b', drag: 3 }); }
      G.rings.push({ x: f.x, y: f.y, t: 0, dur: 0.35, r: LOUPE_B.foyR + 26, color: '#ffb84a' });
      AU.play('brule');
    }
  }
  G.foyers = G.foyers.filter(f => !f.done);
  for (const z of G.zaps) z.t += dt;
  G.zaps = G.zaps.filter(z => z.t < 0.5);
}
function sciDanger(x, y) {
  let s = 0;
  for (const e of G.enemies) {
    if (e.type === 'grenouille' && e.phase === 'saut') { const R = GRENOUILLE.R * (e.big || 1) + 50; if ((x - e.jx) ** 2 + (y - e.jy) ** 2 < R * R) s += 4; }
    else if (e.type === 'pissenlit' && e.phase === 'souffle' && (x - e.x) ** 2 + (y - e.y) ** 2 < 220 * 220) s += 1.5;
  }
  for (const f of G.foyers) { const R = LOUPE_B.foyR + 60; if ((x - f.x) ** 2 + (y - f.y) ** 2 < R * R) s += 2 + 3 * f.t / LOUPE_B.foyDur; }
  return s;
}

/* ----- dessin ----- */
function drawTetardForme(fr, legs, morph) {   // un têtard : une tête ronde et une queue qui frétille
  const wig = Math.sin(G.time * 14 + fr) * 0.6;
  ctx.strokeStyle = '#2e3a2a'; ctx.lineWidth = 3; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-8, 0); ctx.quadraticCurveTo(-20, wig * 12, -32, -wig * 8); ctx.stroke();
  ctx.lineWidth = 6; ctx.globalAlpha *= 0.5; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(-18, wig * 10, -26, -wig * 6); ctx.stroke(); ctx.globalAlpha /= 0.5;
  if (legs) {   // les pattes qui poussent
    ctx.strokeStyle = '#4f7a34'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-6, 5); ctx.lineTo(-6 - 7 * legs, 5 + 9 * legs); ctx.moveTo(-6, -5); ctx.lineTo(-6 - 7 * legs, -5 - 9 * legs); ctx.stroke();
  }
  ctx.fillStyle = morph ? '#4f7a34' : '#2e3a2a'; ctx.beginPath(); ctx.ellipse(0, 0, 11, 9, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(5, -4, 3, 0, TAU); ctx.arc(5, 4, 3, 0, TAU); ctx.fill();
  ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(6, -4, 1.4, 0, TAU); ctx.arc(6, 4, 1.4, 0, TAU); ctx.fill();
}
function drawGrenouilleForme(fr, jump, angry) {   // une grenouille vue de dessus, toute verte
  ctx.strokeStyle = '#3e6a26'; ctx.lineWidth = 3.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const L = jump ? 1.6 : 1;
  for (const s of [-1, 1]) {   // les pattes
    ctx.beginPath(); ctx.moveTo(-6, s * 8); ctx.lineTo(-14 - 8 * L, s * (16 + 4 * L)); ctx.lineTo(-22 - 12 * (L - 1), s * (8 + 6 * L)); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(8, s * 9); ctx.lineTo(16 + 4 * L, s * 17); ctx.stroke();
  }
  ctx.fillStyle = '#6fae46'; ctx.beginPath(); ctx.ellipse(0, 0, 17 + (fr - 1) * 0.6, 13, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#4f8a32'; ctx.beginPath(); ctx.arc(-5, -2, 3, 0, TAU); ctx.arc(-1, 5, 2.4, 0, TAU); ctx.fill();   // les taches
  for (const s of [-1, 1]) {   // les gros yeux
    ctx.fillStyle = '#6fae46'; ctx.beginPath(); ctx.arc(10, s * 8, 6.5, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(11, s * 8, 4, 0, TAU); ctx.fill();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(12.5, s * 8, 2, 0, TAU); ctx.fill();
  }
  if (angry) { ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(15, -14); ctx.lineTo(8, -10); ctx.moveTo(15, 14); ctx.lineTo(8, 10); ctx.stroke(); }
}
function drawPissenlitForme(fr, bald, puff, fl) {   // une boule de pissenlit : des aigrettes en étoile, et une petite frimousse
  ctx.strokeStyle = '#4f7a34'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 6); ctx.quadraticCurveTo(4, 26, -2, 40); ctx.stroke();   // la tige
  const n = bald > 0 ? 7 : 22, R = 22 + puff * 6 + (fr - 1) * 0.5;
  ctx.strokeStyle = fl ? C.red : 'rgba(120,120,128,0.85)'; ctx.lineWidth = 1.2;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + (bald > 0 ? 0.4 : 0), c = Math.cos(a), s = Math.sin(a);
    ctx.beginPath(); ctx.moveTo(c * 7, s * 7); ctx.lineTo(c * R, s * R); ctx.stroke();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(c * R, s * R, 2.6, 0, TAU); ctx.fill(); ctx.stroke();
  }
  ctx.fillStyle = '#b8a05a'; ctx.beginPath(); ctx.arc(0, 0, 8 + puff * 2, 0, TAU); ctx.fill();
  ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(-2.6, -1.5, 1.3, 0, TAU); ctx.arc(2.6, -1.5, 1.3, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(0, 3, puff ? 2.4 : 1.4, 0, TAU); ctx.fill();
}
function drawSciEnemy(e, fr, fl) {
  if (e.type === 'tetard') {
    const morph = e.phase === 'morph' ? 1 - Math.max(0, e.pt) / TETARD.morph : 0, legs = Math.max(morph, clamp(((e.age || 0) - TETARD.grow * 0.6) / (TETARD.grow * 0.4), 0, 1) * 0.5);
    if (morph) ctx.translate(vrnd(-1.5, 1.5), vrnd(-1.5, 1.5));
    ctx.rotate(e.rot || 0);
    if (fl) ctx.globalAlpha *= 0.7;
    drawTetardForme(fr, legs, morph > 0.5);
  } else if (e.type === 'grenouille') {
    const h = e.h || 0;
    ctx.fillStyle = 'rgba(46,46,51,0.16)'; ctx.beginPath(); ctx.ellipse(0, 4, 18 - h * 0.08, 7, 0, 0, TAU); ctx.fill();
    ctx.translate(0, -h); ctx.rotate(e.rot || 0);
    if (fl) ctx.globalAlpha *= 0.7;
    drawGrenouilleForme(fr, e.phase === 'saut', e.big);
  } else {
    const puff = e.phase === 'souffle' ? 1 - Math.max(0, e.pt) / PISSENLIT.warn : 0;
    if (puff) { ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.25 + 0.25 * Math.sin(G.time * 26); ctx.setLineDash([5, 6]); ctx.beginPath(); ctx.arc(0, 0, 50, 0, TAU); ctx.stroke(); ctx.restore(); }
    ctx.rotate(Math.sin(G.time * 1.5 + e.id) * 0.15);
    drawPissenlitForme(fr, e.bald || 0, puff, fl);
  }
}
// La Grande Loupe : dans le monde, son ombre et son manche. Le verre (qui grossit vraiment la page) est posé
// ensuite à l'écran par drawLoupeScreen ; dans le bestiaire, il est dessiné tout simplement.
function drawLoupe(e, fr, fl) {
  const h = e.h || 0;
  ctx.fillStyle = 'rgba(46,46,51,0.14)'; ctx.beginPath(); ctx.ellipse(10, 110, 110, 20, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(0, -h); ctx.rotate(Math.sin((e.wave || 0) * 1.4) * 0.05);
  ctx.strokeStyle = '#5a3a1e'; ctx.lineWidth = 4; ctx.fillStyle = fl ? '#d07a5a' : '#9a6232';   // le manche en bois
  ctx.save(); ctx.translate(LOUPE_B.lensR * 0.72, LOUPE_B.lensR * 0.72 - 30); ctx.rotate(-Math.PI / 4);
  ctx.beginPath(); roundRect(-14, 10, 28, 120, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#c9a23a'; ctx.beginPath(); roundRect(-17, 2, 34, 18, 4); ctx.fill(); ctx.stroke();
  ctx.restore();
  if (!e.real || G.state === 'bestiaire' || G.state === 'title') drawLoupeVerre(e, fl, true);
  ctx.restore();
}
function drawLoupeVerre(e, fl, plain) {   // le verre, son cerclage de laiton et ses deux yeux (énormes, forcément)
  const R = LOUPE_B.lensR, enraged = e.hp < e.maxHp / 2;
  ctx.save(); ctx.translate(0, -30);
  if (plain) { ctx.fillStyle = 'rgba(200,230,250,0.55)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill(); }
  ctx.fillStyle = 'rgba(190,225,255,0.12)'; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(0, 0, R - 18, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke();   // un reflet
  ctx.strokeStyle = fl ? '#b08a3a' : '#8a6a1a'; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, 0, R + 4, 0, TAU); ctx.stroke();
  ctx.strokeStyle = fl ? '#fff0b0' : '#e0b84a'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, R + 4, 0, TAU); ctx.stroke();
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x);
  for (const s of [-1, 1]) {
    ctx.fillStyle = '#ffffff'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.ellipse(s * 32, -10, 24, 28, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#3b6fa3'; ctx.beginPath(); ctx.arc(s * 32 + Math.cos(la) * 9, -10 + Math.sin(la) * 11, 12, 0, TAU); ctx.fill();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s * 32 + Math.cos(la) * 10, -10 + Math.sin(la) * 12, 6, 0, TAU); ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(s * 32 + Math.cos(la) * 10 - 3, -14 + Math.sin(la) * 12, 2.5, 0, TAU); ctx.fill();
    if (enraged) { ctx.strokeStyle = C.graphite; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(s * 56, -48); ctx.lineTo(s * 12, -38); ctx.stroke(); }
  }
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 3.5; ctx.beginPath();
  if (enraged) ctx.arc(0, 52, 16, Math.PI + 0.5, TAU - 0.5); else ctx.arc(0, 32, 16, 0.5, Math.PI - 0.5);
  ctx.stroke();
  ctx.restore();
}
const LOUPE_CV = document.createElement('canvas');
LOUPE_CV.width = 256; LOUPE_CV.height = 256;
const LOUPE_CTX = LOUPE_CV.getContext('2d');
// à l'écran : ce qui est sous le verre est vraiment grossi (on recopie un morceau de l'image, agrandi, dans le cercle)
function drawLoupeScreen() {
  if (!G.chapter || !enSci() || !G.enemies || G.state === 'title') return;
  for (const e of G.enemies) {
    if (e.type !== 'loupe' || e.dead || !e.real) continue;
    const wx = e.x, wy = e.y - (e.h || 0) - 30, sx = W / 2 + (wx - G.cam.x) * ZOOM, sy = H / 2 + (wy - G.cam.y) * ZOOM, R = LOUPE_B.lensR * ZOOM;
    if (sx < -R || sy < -R || sx > W + R || sy > H + R) continue;
    const rs = R / LOUPE_B.mag;
    LOUPE_CTX.fillStyle = C.unwritten; LOUPE_CTX.fillRect(0, 0, 256, 256);
    try { LOUPE_CTX.drawImage(cv, (sx - rs) * DPR, (sy - rs) * DPR, 2 * rs * DPR, 2 * rs * DPR, 0, 0, 256, 256); } catch (err) { /* hors champ */ }
    ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, R, 0, TAU); ctx.clip();
    ctx.drawImage(LOUPE_CV, sx - R, sy - R, 2 * R, 2 * R);
    ctx.restore();
    ctx.save(); ctx.translate(sx, sy + 30 * ZOOM); ctx.scale(ZOOM, ZOOM); ctx.rotate(Math.sin((e.wave || 0) * 1.4) * 0.05);
    drawLoupeVerre(e, e.flash > 0, false);
    ctx.restore();
  }
}
function drawSciFx() {
  for (const b of G.ebul) {
    if (b.aig) {   // une aigrette : une graine et son petit parachute
      const a = Math.atan2(b.vy, b.vx);
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(a + Math.PI / 2);
      ctx.strokeStyle = 'rgba(110,110,118,0.9)'; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, -4); for (let k = -2; k <= 2; k++) { ctx.moveTo(0, -4); ctx.lineTo(k * 4, -11 + Math.abs(k)); } ctx.stroke();
      ctx.fillStyle = '#8a6a3a'; ctx.beginPath(); ctx.ellipse(0, 9, 2, 3.5, 0, 0, TAU); ctx.fill();
      ctx.restore();
    } else if (b.reflet) {   // un reflet de soleil en étoile
      const k = 6 + Math.sin(G.time * 20 + b.x * 0.01) * 2;
      ctx.fillStyle = '#ffd36b'; ctx.strokeStyle = '#c98a1b'; ctx.lineWidth = 1.5;
      ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = i % 2 ? k * 0.4 : k * 1.5; ctx.lineTo(b.x + Math.cos(a) * r, b.y + Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
  if (!enSci()) return;
  for (const e of G.enemies) if (e.type === 'grenouille' && e.phase === 'saut') {   // là où la grenouille va retomber
    ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.5; ctx.setLineDash([8, 8]); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(e.jx, e.jy, GRENOUILLE.R * (e.big || 1), 0, TAU); ctx.stroke(); ctx.restore();
  }
  for (const f of G.foyers) {   // le cône de lumière, puis le point qui brûle
    const k = clamp(f.t / LOUPE_B.foyDur, 0, 1), r = lerp(LOUPE_B.foyR0, LOUPE_B.foyR * 0.8, ease(k)), B = f.boss;
    if (B && !B.dead) {
      const lx = B.x, ly = B.y - (B.h || 0) - 30, a = Math.atan2(f.y - ly, f.x - lx), px = -Math.sin(a), py = Math.cos(a), R = LOUPE_B.lensR * 0.9;
      ctx.fillStyle = 'rgba(255,226,120,' + (0.08 + 0.14 * k).toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(lx + px * R, ly + py * R); ctx.lineTo(f.x + px * r, f.y + py * r); ctx.lineTo(f.x - px * r, f.y - py * r); ctx.lineTo(lx - px * R, ly - py * R); ctx.closePath(); ctx.fill();
    }
    const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r);
    g.addColorStop(0, 'rgba(255,255,230,' + (0.35 + 0.6 * k).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,200,80,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, TAU); ctx.fill();
    if (k > 0.5) { ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.4 * Math.sin(G.time * 24); ctx.setLineDash([6, 6]); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(f.x, f.y, LOUPE_B.foyR, 0, TAU); ctx.stroke(); ctx.restore(); }
  }
  for (const z of G.zaps) {   // le regard qui grossit
    if (z.o.dead) continue;
    ctx.save(); ctx.strokeStyle = '#ffd36b'; ctx.globalAlpha = 1 - z.t / 0.5; ctx.lineWidth = 6; ctx.setLineDash([14, 8]);
    ctx.beginPath(); ctx.moveTo(z.x0, z.y0); ctx.lineTo(z.o.x, z.o.y); ctx.stroke(); ctx.restore();
  }
}
