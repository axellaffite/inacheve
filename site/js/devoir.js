// Le devoir du jour (itération 11) : une page tirée de la date, la même pour tout le monde, avec une consigne et un coup de pouce.
// La maîtresse rend la copie avec une note sur 20 et une appréciation au stylo rouge.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

// Les consignes compliquent la page ; leur bonus s'ajoute à la note quand on bat le patron.
const CONSIGNES = {
  sansPate:   { label: 'Pas de pâtés aujourd’hui', desc: 'le pâté d’encre est interdit', bonus: 2 },
  presse:     { label: 'Copie à rendre plus tôt', desc: 'le patron arrive dès 2:00', bonus: 1 },
  double:     { label: 'Interligne double', desc: 'deux fois plus de ratures, mais plus fragiles', bonus: 1 },
  fragile:    { label: 'Écrire sans trembler', desc: 'tu commences avec quatre cœurs seulement', bonus: 2 },
  courant:    { label: 'Courant d’air', desc: 'le vent pousse la goutte et les lettres', bonus: 1 },
  brouillard: { label: 'Brouillard de gomme', desc: 'on n’y voit pas plus loin que le bout de sa plume', bonus: 1.5 },
  miroir:     { label: 'Écrire en miroir', desc: 'la gauche et la droite sont inversées', bonus: 2 },
  perfore:    { label: 'Feuille perforée', desc: 'la perforatrice arrive dès 0:20, et revient toujours', bonus: 1 },
  taille:     { label: 'Crayons à tailler', desc: 'le taille-crayon électrique arrive dès 0:20, et revient toujours', bonus: 1 }
};
const COUPS_DE_POUCE = {
  pluie:   { label: 'Pluie de lettrines', desc: 'les lettres dorées tombent dix fois plus souvent' },
  propre:  { label: 'Page propre', desc: 'l’encre sèche vite, les lettres oubliées viennent à toi' },
  souffle: { label: 'Deux cœurs de rechange', desc: 'tu commences avec deux cœurs de plus' },
  aimant:  { label: 'Grand aimant', desc: 'les lettres viennent à toi de deux fois plus loin' }
};
const DEVOIR = { bossT: 120, wind: 95, windTurn: 16, fogIn: 200, fogOut: 420, key: 'inacheve.devoir' };

function todayISO() { if (CAPTURE) return GAME_META.date; try { return new Date().toISOString().slice(0, 10); } catch (e) { return GAME_META.date; } }
// FNV-1a, puis un brassage final : deux dates voisines donnent des devoirs sans rapport
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return h >>> 0;
}
let devoirOver = null;   // capture : le montage peut imposer son devoir (chapitre, consigne, coup de pouce, graine)
// Tout vient de la date (en temps universel) : chaque joueur a la même page, les mêmes mots et les mêmes ratures au départ
function devoirDuJour(date = todayISO()) {
  const h = hashStr('inacheve:' + date), r = mulberry32(h);
  const cons = Object.keys(CONSIGNES), pouces = Object.keys(COUPS_DE_POUCE);
  const consigne = cons[Math.floor(r() * cons.length)];
  let pouce = pouces[Math.floor(r() * pouces.length)];
  if (consigne === 'fragile' && pouce === 'souffle') pouce = 'aimant';   // l'un défait l'autre
  const d = { date, chapter: 1 + Math.floor(r() * (CHAPTERS.length - 1)), consigne, pouce, seed: (h % 2147483646) + 1 };
  return devoirOver ? Object.assign(d, devoirOver) : d;
}
function devoirHas(k) { return !!G.devoir && (G.devoir.consigne === k || G.devoir.pouce === k); }
const devoirBossT = () => devoirHas('presse') ? DEVOIR.bossT : 180;

/* ---------- la meilleure note du jour (gardée en local, jamais envoyée) ---------- */
function loadNote() {
  if (CAPTURE) return null;
  try {
    const o = JSON.parse(localStorage.getItem(DEVOIR.key) || 'null');
    if (o && typeof o.date === 'string' && typeof o.best === 'number' && o.best >= 0 && o.best <= 20) return { date: o.date, best: o.best };
  } catch (e) { /* rien */ }
  return null;
}
G.noteJour = loadNote();
function bestNote(date) { const o = G.noteJour; return o && o.date === date ? o.best : null; }
function saveNote(date, n) {
  const prev = bestNote(date);
  G.noteJour = { date, best: prev === null ? n : Math.max(prev, n) };
  if (CAPTURE) return;
  try { localStorage.setItem(DEVOIR.key, JSON.stringify(G.noteJour)); } catch (e) { /* rien */ }
}

/* ---------- la partie ---------- */
function startDevoir(demo) { const d = devoirDuJour(); newGame(demo, d.chapter, d); }
// appelé par newGame, une fois les mots du brouillon tirés
function setupDevoir() {
  const p = G.p, d = G.devoir;
  if (devoirHas('fragile')) { p.maxHp = 4; p.hp = 4; }
  if (devoirHas('souffle')) { p.maxHp += 2; p.hp = p.maxHp; }
  G.wind = { a: rnd(TAU), t: DEVOIR.windTurn, x: 0, y: 0 };
  G.note = null;
  caption('Devoir du ' + frDate(d.date) + ' : ' + CH().name.toLowerCase(), 4.2);
  caption('Consigne : ' + CONSIGNES[d.consigne].label, 4.2, 'pink');
  caption('Coup de pouce : ' + COUPS_DE_POUCE[d.pouce].label, 4.2, 'green');
}
function stepDevoir(dt) {
  if (!G.devoir) return;
  const p = G.p;
  if (devoirHas('courant')) {
    const w = G.wind;
    w.t -= dt;
    if (w.t <= 0) { w.t = DEVOIR.windTurn; w.a += rnd(1.4, 3) * (rand() < 0.5 ? -1 : 1); caption('Le vent tourne !', 1.6, 'pink'); AU.play('gust'); }
    const k = Math.min(1, dt * 1.5);
    w.x = lerp(w.x, Math.cos(w.a) * DEVOIR.wind, k); w.y = lerp(w.y, Math.sin(w.a) * DEVOIR.wind, k);
    if (p.dashT <= 0) { p.x = clamp(p.x + w.x * dt, p.r, WORLD.w - p.r); p.y = clamp(p.y + w.y * dt, p.r, WORLD.h - p.r); }
    for (const it of G.items) if (!it.pull) { it.x = clamp(it.x + w.x * 0.6 * dt, 10, WORLD.w - 10); it.y = clamp(it.y + w.y * 0.6 * dt, 10, WORLD.h - 10); }
  }
  if (devoirHas('propre')) {
    if (Math.floor(G.t) > Math.floor(G.t - dt)) dryStains(0.06);
    for (const it of G.items) if (it.t > 9) it.pull = true;
  }
}

/* ---------- la note ---------- */
// les petits exploits de la page : lignes, refrains, figures, trésors, lettrines, ex-libris, morpions gagnés, labyrinthes, calculs, marelles, poèmes, devoirs cochés, mots signés, contrôles réussis
function devoirExploits() { return (G.lignes || 0) + (G.refrains || 0) + (G.figures || 0) + (G.tresors || 0) + (G.enlus || 0) + (G.sceaux || 0) + (G.morpions || 0) + (G.labys || 0) + (G.calculs || 0) + (G.marelles || 0) + (G.poemes || 0) + (G.agendas || 0) + (G.signatures || 0) + (G.controles || 0); }
function gradeDevoir(win) {
  const d = G.devoir, ex = devoirExploits();
  // gagné : au moins la moyenne (11), puis dictées, exploits, cœurs restants et difficulté de la consigne ; perdu : jamais la moyenne
  let n = win ? 11 + Math.min(2.5, G.dictees / 4) + Math.min(2.5, ex / 2) + 2 * clamp(G.p.hp / G.p.maxHp, 0, 1) + CONSIGNES[d.consigne].bonus
    : Math.min(9.5, 1 + 7 * clamp(G.t / devoirBossT(), 0, 1) + Math.min(1, G.dictees / 6) + Math.min(1, ex / 3));
  n = clamp(Math.round(n * 2) / 2, 0, 20);
  const prev = bestNote(d.date);
  G.note = { n, app: appreciation(n, win), prev, record: prev !== null && n > prev };
  saveNote(d.date, n);
  AU.play('croquis');
}
function appreciation(n, win) {
  if (n >= 19) return 'Parfait ! Copie à afficher au tableau.';
  if (n >= 16) return 'Très bien. Quelle belle écriture !';
  if (n >= 13) return G.devoir.consigne === 'sansPate' ? 'Bien, et sans un seul pâté !' : 'Bien. Attention aux pâtés.';
  if (n >= 10) return win ? 'Assez bien. Peut mieux faire.' : 'Presque ! La page tenait encore.';
  if (n >= 6) return 'Des efforts, mais la page est bien raturée.';
  return 'À revoir. Demain, un autre devoir t’attend !';
}
const fmtNote = n => String(n).replace('.', ',');

/* ---------- le rendu ---------- */
function drawWind() {
  const w = G.wind, sp = Math.hypot(w.x, w.y);
  if (sp < 5) return;
  const ux = w.x / sp, uy = w.y / sp, PW = W + 240, PH = H + 240;
  ctx.save(); ctx.strokeStyle = C.graphite; ctx.lineCap = 'round'; ctx.lineWidth = 2 * U;
  for (let i = 0; i < 34; i++) {
    const h1 = (i * 0.618034) % 1, h2 = (i * 0.414214 + 0.3) % 1, run = G.time * sp * 3 * ZOOM * (0.8 + 0.4 * h2);
    const x = (((h1 * PW + ux * run) % PW) + PW) % PW - 120, y = (((h2 * PH + uy * run) % PH) + PH) % PH - 120;
    const len = (50 + 70 * h2) * U, curl = 10 * U * Math.sin(G.time * 3 + i);
    ctx.globalAlpha = (0.32 + 0.18 * Math.sin(G.time * 2 + i * 1.7)) * Math.min(1, sp / DEVOIR.wind);
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x - ux * len * 0.5 - uy * curl, y - uy * len * 0.5 + ux * curl, x - ux * len, y - uy * len);
    ctx.stroke();
  }
  ctx.restore();
}
// Brouillard de gomme : la page pâlit au-delà du bout de la plume (écran, au-dessus du monde, sous l'interface)
function drawDevoirFx() {
  if (!G.devoir || !G.p || G.state === 'title' || G.state === 'bestiaire' || G.state === 'turn') return;
  if (devoirHas('courant')) drawWind();
  if (devoirHas('brouillard')) {
    const px = W / 2 + (G.p.x - G.cam.x) * ZOOM, py = H / 2 + (G.p.y - G.cam.y) * ZOOM;
    const g = ctx.createRadialGradient(px, py, DEVOIR.fogIn * ZOOM, px, py, DEVOIR.fogOut * ZOOM);
    g.addColorStop(0, 'rgba(236,235,228,0)'); g.addColorStop(0.55, 'rgba(236,235,228,0.82)'); g.addColorStop(1, 'rgba(236,235,228,0.97)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
}
// sous le niveau, à gauche : la consigne et le coup de pouce
function drawDevoirHUD() {
  if (!G.devoir) return;
  const s = U, left = SAFE.l + 18 * s, top = SAFE.t + 14 * s, fz = Math.min(19 * s, W / 34);
  txt('consigne : ' + CONSIGNES[G.devoir.consigne].label, left, top + 86 * s, fz, { align: 'left', color: C.red, weight: 400 });
  txt('coup de pouce : ' + COUPS_DE_POUCE[G.devoir.pouce].label, left, top + 112 * s, fz, { align: 'left', color: C.ink, weight: 400, hl: C.hlGreen });
}
// la fiche du devoir, punaisée en haut à gauche de l'écran titre (le titre descend un peu pour lui faire de la place)
const slipShown = () => W >= 980 && H >= 600;
function drawDevoirSlip(alpha) {
  if (!slipShown()) return;
  const d = devoirDuJour(), s = U, w = 360 * s, h = 118 * s, x = SAFE.l + 22 * s, y = SAFE.t + 14 * s;
  const note = bestNote(d.date);
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x + w / 2, y + h / 2); ctx.rotate(-0.03);
  ctx.shadowColor = 'rgba(40,40,30,0.25)'; ctx.shadowBlur = 14; ctx.shadowOffsetY = 5;
  ctx.fillStyle = '#fffef9'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = C.ruleMinor; ctx.lineWidth = 1;
  for (let yy = -h / 2 + 43 * s; yy < h / 2 - 4; yy += 23 * s) { ctx.beginPath(); ctx.moveTo(-w / 2, yy); ctx.lineTo(w / 2, yy); ctx.stroke(); }
  ctx.strokeStyle = C.margin; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-w / 2 + 26 * s, -h / 2); ctx.lineTo(-w / 2 + 26 * s, h / 2); ctx.stroke();
  // la punaise
  ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(-w / 2 + 13 * s, -h / 2 + 13 * s, 6 * s, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.beginPath(); ctx.arc(-w / 2 + 11 * s, -h / 2 + 11 * s, 2 * s, 0, TAU); ctx.fill();
  const lx = -w / 2 + 34 * s, rx = w / 2 - 10 * s;
  txt('Devoir du ' + frDate(d.date), lx, -h / 2 + 24 * s, 20 * s, { align: 'left', font: FONT_CURSIVE, weight: 400, color: C.ink });
  if (note !== null) txt(fmtNote(note) + '/20', rx, -h / 2 + 24 * s, 20 * s, { align: 'right', color: C.red, rot: -0.06 });
  txt('Chapitre ' + CHAPTERS[d.chapter].num + ' : ' + CHAPTERS[d.chapter].name.toLowerCase(), lx, -h / 2 + 54 * s, 18 * s, { align: 'left', color: C.graphite });
  if (!G.input.touch) txt('touche J', rx, -h / 2 + 55 * s, 16 * s, { align: 'right', color: C.ink, hl: C.hl });
  txt('Consigne : ' + CONSIGNES[d.consigne].label, lx, -h / 2 + 77 * s, 17 * s, { align: 'left', color: C.red, weight: 400 });
  txt('Coup de pouce : ' + COUPS_DE_POUCE[d.pouce].label, lx, -h / 2 + 100 * s, 17 * s, { align: 'left', color: C.ink, weight: 400 });
  ctx.restore();
}
// la note entourée au stylo rouge, puis l'appréciation
function drawNote(x, y, sc, t) {
  const N = G.note;
  if (!N || t < 0.6) return;
  const s = U * sc, k = ease((t - 0.75) / 0.7), a = clamp((t - 0.6) * 4, 0, 1);
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.08);
  txt(fmtNote(N.n) + '/20', 0, 2 * s, 58 * s, { color: C.red, alpha: a });
  if (k > 0) {
    const rx = 112 * s, ry = 56 * s, a0 = -2.3, span = TAU * 1.1 * k;
    ctx.strokeStyle = C.red; ctx.lineWidth = 3.2 * s; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i <= 64; i++) { const an = a0 + span * i / 64, wob = 1 + 0.035 * Math.sin(an * 3 + 1) + 0.07 * i / 64; const px = Math.cos(an) * rx * wob, py = Math.sin(an) * ry * wob; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke();
  }
  const b = clamp((t - 1.5) * 2.5, 0, 1);
  if (b > 0) {
    ctx.font = '400 ' + (24 * s) + 'px ' + FONT_CURSIVE;
    const words = N.app.split(' '), lines = []; let line = '';
    for (const wd of words) { const tt = line ? line + ' ' + wd : wd; if (ctx.measureText(tt).width > 330 * s && line) { lines.push(line); line = wd; } else line = tt; }
    lines.push(line);
    lines.forEach((l, i) => txt(l, 0, 104 * s + i * 38 * s, 24 * s, { font: FONT_CURSIVE, weight: 400, color: C.red, alpha: b }));
    if (N.record) txt('meilleure note du jour !', 0, 104 * s + lines.length * 38 * s + 6 * s, 20 * s, { color: C.red, alpha: b, hl: C.hl });
  }
  ctx.restore();
}
