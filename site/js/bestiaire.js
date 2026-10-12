// Le bestiaire : une page du cahier qui se remplit d'un croquis à chaque nouvelle rature biffée.
// Une page par chapitre ; les croquis sont les vraies ratures, dessinées en direct et immobiles sous leur bout de scotch.
'use strict';

// [type, nom, note au crayon]
const BESTIAIRE = [null,
  [
    ['gribouillis', 'le gribouillis', 'Né d’un stylo qui s’ennuie. Fonce droit sur toi, sans réfléchir.'],
    ['gouttelette', 'la gouttelette', 'Tombe des taches qu’on biffe. Toute petite, mais très pressée.'],
    ['biffure', 'la biffure', 'Vise, puis barre tout sur son passage. Méfie-toi du trait rouge.'],
    ['tache', 'la tache', 'Lente et têtue. Biffée, elle se divise en gouttelettes.'],
    ['gomme', 'la gomme', 'Efface l’encre de la page et mord fort : deux cœurs d’un coup.'],
    ['boss', 'la Grande Rature', 'Un seul œil, et des traits rouges plein les poches.']
  ],
  [
    ['croche', 'la croche', 'Sautille en rythme. Compte les temps pour l’esquiver.'],
    ['soupir', 'le soupir', 'Disparaît, puis se pose près de toi : guette le cercle en pointillés.'],
    ['metronome', 'le métronome', 'Tic, tic, tic… au quatrième tic, son onde part.'],
    ['fausse', 'la Fausse Note', 'Jamais dans le ton. Dans ses portées, cherche la respiration.']
  ],
  [
    ['segment', 'le segment', 'Fait des moulinets. Deux bouts, aucune idée derrière.'],
    ['equerre', 'l’équerre', 'Trace un angle droit qui passe par toi. Sors de la ligne !'],
    ['compas', 'le compas', 'La pointe ne pique pas. C’est la mine qu’il faut éviter.'],
    ['rapporteur', 'le rapporteur', 'Mesure ses angles, puis tire en éventail, deux fois.'],
    ['regle', 'la Règle de fer', 'Toujours droite, jamais tendre. Quand elle se lève, file.']
  ],
  [
    ['mouette', 'la mouette', 'Tourne autour de toi, s’arrête une seconde… et pique.'],
    ['crabe', 'le crabe', 'Marche de travers, mais il finit toujours par arriver.'],
    ['tourbillon', 'le tourbillon', 'T’attire vers son centre. Un pâté d’encre t’en sort.'],
    ['bouteille', 'la bouteille à la mer', 'Le message dit « à l’aide ». Les bouchons disent « aïe ».'],
    ['pieuvre', 'la Pieuvre-Buvard', 'Boit ton encre, puis te la recrache. Très mal élevée.']
  ]
];
const BEST_TYPES = new Set(BESTIAIRE.slice(1).flat().map(b => b[0]));
// rayon apparent de chaque croquis, pour qu'il tienne dans sa case
const BEST_VIS = { boss: 92, fausse: 128, regle: 282, pieuvre: 150, metronome: 54, compas: 42, tourbillon: 34, equerre: 32, rapporteur: 32, bouteille: 34, crabe: 34, mouette: 24, tache: 30, gomme: 32 };
const BEST_TOAST = 3.4;

G.bestiary = {};
if (!CAPTURE) {
  try {
    const raw = JSON.parse(localStorage.getItem('inacheve.bestiaire') || '{}');
    if (raw && typeof raw === 'object') for (const k in raw) if (BEST_TYPES.has(k) && Number.isFinite(raw[k]) && raw[k] > 0) G.bestiary[k] = Math.floor(raw[k]);
  } catch (e) { G.bestiary = {}; }
}
G.bestToasts = []; G.bestPage = 1; G.bestFlip = 9; G.bestDir = 1;
function saveBestiaire() {
  if (CAPTURE) return;
  try { localStorage.setItem('inacheve.bestiaire', JSON.stringify(G.bestiary)); } catch (e) { /* rien */ }
}
const bestCount = () => Object.keys(G.bestiary).length;
const bestPageDone = n => BESTIAIRE[n].every(b => G.bestiary[b[0]]);

// Une rature biffée : on la compte, et la première fois on la croque
function noteBestiaire(type) {
  if (!BEST_TYPES.has(type)) return;
  const first = !G.bestiary[type];
  G.bestiary[type] = (G.bestiary[type] || 0) + 1;
  if (!first) return;
  G.newCroquis = (G.newCroquis || 0) + 1;
  G.bestToasts.push({ type, t: 0 });
  AU.play('croquis');
  const page = BESTIAIRE.findIndex(p => p && p.some(b => b[0] === type));
  if (bestPageDone(page)) caption('Bestiaire : la page du chapitre ' + CHAPTERS[page].num + ' est complète !', 3.2, 'green');
  saveBestiaire();
}
function stepBestToasts(dt) {
  if (!G.bestToasts.length) return;
  G.bestToasts[0].t += dt;
  if (G.bestToasts[0].t >= BEST_TOAST) G.bestToasts.shift();
}

/* ----- ouvrir, feuilleter, refermer ----- */
function openBestiaire(page) {
  if (G.state === 'bestiaire' || G.state === 'levelup' || G.state === 'turn') return;
  if (G.state === 'play') { G.state = 'pause'; }
  G.bestFrom = G.state; G.bestFromT = G.stateT;
  G.state = 'bestiaire'; G.stateT = 0;
  G.bestPage = clamp(page || (G.p ? G.chapter || 1 : 1), 1, CHAPTERS.length - 1); G.bestFlip = 9;
  AU.play('turn');
  setUI();
}
function closeBestiaire() {
  if (G.state !== 'bestiaire') return;
  G.state = G.bestFrom || 'title'; G.stateT = G.bestFromT || 9;
  setUI();
}
function flipBestiaire(d) {
  const n = clamp(G.bestPage + d, 1, CHAPTERS.length - 1);
  if (n === G.bestPage) return;
  G.bestPage = n; G.bestDir = d; G.bestFlip = 0;
  AU.play('feuille');
}

/* ----- mise en page ----- */
function bestLayout() {
  const s = U, x = SAFE.l + 14 * s, y = SAFE.t + 12 * s, w = W - SAFE.l - SAFE.r - 28 * s, h = H - SAFE.t - SAFE.b - 24 * s;
  const narrow = w < 640, ml = narrow ? 34 * s : 70 * s;
  const n = BESTIAIRE[G.bestPage].length, cols = narrow ? 2 : 3, rows = Math.ceil(n / cols);
  const gx = x + ml + 8 * s, gy = y + (narrow ? 112 : 124) * s, gw = w - ml - 22 * s, gh = h - (narrow ? 112 : 124) * s - 74 * s;
  const cells = [];
  for (let i = 0; i < n; i++) {
    const c = i % cols, r = Math.floor(i / cols), cw = gw / cols, ch = gh / rows;
    // la dernière ligne, si elle est incomplète, est centrée
    const inRow = r === rows - 1 ? n - r * cols : cols, off = (cols - inRow) * cw / 2;
    cells.push({ x: gx + off + c * cw, y: gy + r * ch, w: cw, h: ch });
  }
  const fy = y + h - 40 * s, bR = 26 * s;
  return { x, y, w, h, ml, narrow, cells, prev: { x: x + ml + 46 * s, y: fy, r: bR }, next: { x: x + w - 46 * s, y: fy, r: bR }, close: { x: x + w - 34 * s, y: y + 34 * s, r: bR }, fy };
}
function bestHit(x, y) {
  const L = bestLayout(), at = b => Math.hypot(x - b.x, y - b.y) < b.r * 1.5;
  if (at(L.close)) return 'close';
  if (at(L.prev) || x < W * 0.18) return 'prev';
  if (at(L.next) || x > W * 0.82) return 'next';
  return null;
}

/* ----- dessin ----- */
// une fausse rature, juste assez remplie pour que ses fonctions de dessin la croquent
function bestFake(type, i) {
  const T = ETYPES[type], t = G.time + i * 0.7;
  const e = { type, id: 900 + i, x: 0, y: 0, r: T.r, shape: i % 3, rot: 0, boilOff: i * 0.37, flash: 0, phase: 'walk', cx: 0, cy: 0, hp: 1, maxHp: 1, pt: 1, aimA: 0, hop: 0, ticks: 0, tickT: 0.5, sx: 0, sy: 0, srot: 0 };
  if (type === 'gribouillis' || type === 'gouttelette' || type === 'biffure' || type === 'tache' || type === 'gomme') e.rot = Math.sin(t * 0.8) * 0.35;
  else if (type === 'boss') e.rot = t * 0.3;
  else if (type === 'croche') e.hop = Math.abs(Math.sin(t * 4));
  else if (type === 'metronome') { const b = t * 2; e.ticks = Math.floor(b) % 3; e.tickT = 0.5 * (1 - (b % 1)); }
  else if (type === 'segment') e.rot = t * 1.6;
  else if (type === 'equerre') e.rot = Math.sin(t) * 0.3;
  else if (type === 'regle') e.rot = -0.12;
  else if (type === 'crabe') e.rot = -Math.PI / 2;
  else if (type === 'tourbillon') e.rot = t * 3;
  else if (type === 'bouteille') e.rot = Math.sin(t * 1.2) * 0.25;
  return e;
}
function drawCroquis(type, i, cx, cy, R) {
  const vis = BEST_VIS[type] || ETYPES[type].r * 1.4, k = Math.min(2.4, R / vis);
  const saveP = G.p;
  G.p = { x: Math.cos(G.time * 0.9 + i) * 100, y: Math.sin(G.time * 1.3 + i) * 60 + 30 };   // les yeux suivent quelque chose d'invisible
  ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
  try { drawEnemy(bestFake(type, i)); } finally { ctx.restore(); G.p = saveP; }
}
function drawTape(x, y, w, rot) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = 'rgba(236,226,180,0.72)'; ctx.fillRect(-w / 2, -8 * U, w, 16 * U);
  ctx.strokeStyle = 'rgba(160,150,110,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(-w / 2, -8 * U, w, 16 * U); ctx.restore();
}
function drawBestCell(b, i, c, a) {
  const [type, name, note] = b, s = U, met = G.bestiary[type] || 0, boss = !!ETYPES[type].boss;
  const fs = Math.min(23 * s, c.w / 11), small = Math.min(19 * s, c.w / 14);
  const bw = Math.min(c.w * (c.w < 220 * s ? 0.8 : 0.62), c.h * 0.46 * 1.3), bh = Math.min(c.h * 0.46, bw * 0.8), bx = c.x + c.w / 2 - bw / 2, by = c.y + 10 * s;
  const tilt = ((i * 37) % 7 - 3) * 0.012;
  ctx.save(); ctx.globalAlpha = a;
  ctx.translate(bx + bw / 2, by + bh / 2); ctx.rotate(tilt);
  ctx.shadowColor = 'rgba(40,40,30,0.2)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  ctx.fillStyle = met ? '#fffef9' : '#f1efe6'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  ctx.shadowColor = 'transparent';
  if (boss) { ctx.strokeStyle = met ? C.gold : 'rgba(201,146,27,0.4)'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.strokeRect(-bw / 2 + 5, -bh / 2 + 5, bw - 10, bh - 10); ctx.setLineDash([]); }
  ctx.beginPath(); ctx.rect(-bw / 2 + 2, -bh / 2 + 2, bw - 4, bh - 4); ctx.clip();
  if (met) drawCroquis(type, i, 0, 3 * s, Math.min(bw, bh) * 0.44);
  else {   // une silhouette au crayon, pas encore croquée
    ctx.strokeStyle = 'rgba(109,109,116,0.35)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); for (let k = -6; k <= 6; k++) { ctx.moveTo(k * bh * 0.09 - bh * 0.3, bh * 0.32); ctx.lineTo(k * bh * 0.09 + bh * 0.3, -bh * 0.32); } ctx.stroke();
    txt('?', 0, 2 * s, bh * 0.55, { color: C.pencil, alpha: 0.75 });
  }
  ctx.restore();
  ctx.save(); ctx.globalAlpha = a;
  drawTape(bx + bw * 0.18, by + 2 * s, bw * 0.3, -0.35 + tilt); drawTape(bx + bw * 0.82, by + 2 * s, bw * 0.3, 0.3 + tilt);
  const ty = by + bh + 20 * s;
  txt(met ? name : '? ? ?', c.x + c.w / 2, ty, fs, { color: met ? (boss ? C.red : C.ink) : C.pencil, hl: met && G.bestToasts.some(q => q.type === type) ? C.hl : null });
  if (met) {
    const yy = wrap(note, c.x + c.w / 2, ty + fs * 1.15, c.w - 18 * s, small, small * 1.15, C.graphite, 400);
    if (yy < c.y + c.h - 2) txt(met === 1 ? 'biffé·e une fois' : 'biffé·e ' + met + ' fois', c.x + c.w / 2, Math.min(yy + 2 * s, c.y + c.h - small * 0.6), small, { color: C.margin, weight: 400 });
  } else txt(Math.max(G.unlocked, G.p ? G.chapter || 1 : 1) >= G.bestPage ? 'pas encore croisé·e' : 'se cache plus loin dans le cahier', c.x + c.w / 2, ty + fs * 1.15, small, { color: C.pencil, weight: 400 });
  ctx.restore();
}
function drawBestiaire() {
  const s = U, L = bestLayout(), page = BESTIAIRE[G.bestPage], ch = CHAPTERS[G.bestPage];
  dimPage(0.55);
  const open = ease(clamp(G.stateT * 4, 0, 1));
  ctx.save(); ctx.globalAlpha = open; ctx.translate(0, (1 - open) * 30 * s);
  // la feuille
  ctx.shadowColor = 'rgba(30,30,20,0.3)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  ctx.fillStyle = C.paper; ctx.fillRect(L.x, L.y, L.w, L.h); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = C.ruleMinor; ctx.lineWidth = 1;
  ctx.beginPath(); for (let y = L.y + 36 * s; y < L.y + L.h - 4; y += 32 * s) { ctx.moveTo(L.x, y); ctx.lineTo(L.x + L.w, y); } ctx.stroke();
  ctx.strokeStyle = C.margin; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(L.x + L.ml, L.y); ctx.lineTo(L.x + L.ml, L.y + L.h); ctx.stroke();
  // trous de classeur
  for (let k = 0; k < 3; k++) { ctx.fillStyle = C.unwritten; ctx.beginPath(); ctx.arc(L.x + L.ml * 0.42, L.y + L.h * (0.2 + k * 0.3), Math.min(9 * s, L.ml * 0.2), 0, TAU); ctx.fill(); }
  // en-tête
  const cxh = L.x + L.ml + (L.w - L.ml) / 2;
  txt('Bestiaire des ratures', L.narrow ? cxh - 22 * s : cxh, L.y + (L.narrow ? 36 : 44) * s, Math.min(44 * s, (L.w - L.ml - 110 * s) / 10), { font: FONT_CURSIVE, weight: 400, color: C.ink });
  txt('Chapitre ' + ch.num + ' · ' + ch.name, cxh, L.y + (L.narrow ? 80 : 92) * s, Math.min(24 * s, L.w / 22), { color: C.graphite, weight: 400 });
  if (!L.narrow) txt(bestCount() + ' / ' + BEST_TYPES.size + ' croquées', L.x + L.w - 70 * s, L.y + 92 * s, 21 * s, { color: C.margin, weight: 400, align: 'right' });
  // les cases (glissent un peu quand on tourne la page)
  const fk = ease(clamp(G.bestFlip / 0.35, 0, 1)), dx = (1 - fk) * 60 * s * G.bestDir;
  ctx.save(); ctx.translate(dx, 0);
  page.forEach((b, i) => drawBestCell(b, i, L.cells[i], fk));
  ctx.restore();
  // un bon point quand la page est complète
  if (bestPageDone(G.bestPage)) {
    ctx.save(); ctx.translate(L.narrow ? L.x + L.w - 48 * s : L.x + L.ml + 80 * s, L.narrow ? L.fy - 64 * s : L.y + 56 * s); ctx.rotate(0.14); ctx.globalAlpha = 0.85 * fk;
    ctx.strokeStyle = C.gold; ctx.fillStyle = 'rgba(240,200,90,0.25)'; ctx.lineWidth = 2.5 * s;
    ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, r = (k % 2 ? 17 : 34) * s * (L.narrow ? 0.75 : 1); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke();
    txt('bon point', 0, (L.narrow ? 34 : 46) * s, 18 * s, { color: C.gold });
    ctx.restore();
  }
  // pied de page : feuilleter, refermer
  const last = CHAPTERS.length - 1;
  const btn = (b, label, on) => { ctx.save(); ctx.globalAlpha = on ? 1 : 0.25; ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, TAU); ctx.stroke(); ctx.restore(); txt(label, b.x, b.y - 2 * s, 32 * s, { color: C.ink, alpha: on ? 1 : 0.25 }); };
  btn(L.prev, '‹', G.bestPage > 1); btn(L.next, '›', G.bestPage < last); btn(L.close, '×', true);
  txt('page ' + G.bestPage + ' / ' + last, cxh, L.fy, 22 * s, { color: C.graphite, weight: 400 });
  if (!G.input.touch && !L.narrow) txt('← → ou Q D : tourner les pages    Échap : refermer', cxh, L.fy + 26 * s, 17 * s, { color: C.pencil, weight: 400 });
  ctx.restore();
}
// Une rature croquée pour la première fois : un petit polaroïd glisse depuis le bord gauche
function drawBestToast() {
  const q = G.bestToasts[0]; if (!q) return;
  const s = U, k = Math.min(ease(q.t * 3), ease((BEST_TOAST - q.t) * 3));
  const b = BESTIAIRE.flat().find(x => x && x[0] === q.type), w = 132 * s, h = 150 * s;
  const x = SAFE.l + 16 * s - (1 - k) * (w + 40 * s), y = H * 0.36;
  ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate(-0.05);
  ctx.shadowColor = 'rgba(40,40,30,0.25)'; ctx.shadowBlur = 12; ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#fffef9'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
  ctx.fillStyle = '#f4f1e6'; ctx.fillRect(-w / 2 + 8 * s, -h / 2 + 8 * s, w - 16 * s, w - 30 * s);
  ctx.save(); ctx.beginPath(); ctx.rect(-w / 2 + 8 * s, -h / 2 + 8 * s, w - 16 * s, w - 30 * s); ctx.clip();
  drawCroquis(q.type, 0, 0, -h / 2 + 8 * s + (w - 30 * s) / 2, (w - 30 * s) * 0.36);
  ctx.restore();
  txt('croqué !', 0, h / 2 - 32 * s, 17 * s, { color: C.margin, weight: 400 });
  txt(b ? b[1] : q.type, 0, h / 2 - 13 * s, Math.min(19 * s, w / Math.max(6, (b ? b[1].length : 8) * 0.5)), { color: C.ink });
  ctx.restore();
  drawTape(x + w / 2, y + 2 * s, 54 * s, 0.04);
}
