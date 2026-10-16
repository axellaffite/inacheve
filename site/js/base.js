// Socle : hasard déterministe, palette, monde, mots-pouvoirs, canvas, formes dessinées, encre persistante, son synthétisé.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

/* ===================== Paramètres & hasard ===================== */
const params = new URLSearchParams(location.search);
const CAPTURE = params.has('capture');          // rendu image par image (vidéos)
let seed = parseInt(params.get('seed'), 10) || (Date.now() % 1000000007);
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let rand = mulberry32(seed);
const rnd = (a = 1, b) => b === undefined ? rand() * a : a + rand() * (b - a);
const pick = arr => arr[Math.floor(rand() * arr.length)];
// Hasard purement visuel (tremblements) : séparé du hasard du jeu, pour qu'une partie filmée et une partie simulée restent identiques
const vrand = mulberry32(seed ^ 0x5eed);
const vrnd = (a, b) => a + vrand() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;
const ease = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);

/* ===================== Palette ===================== */
const C = {
  paper: '#fdfcf6', unwritten: '#ebeae3', dot: '#b9b8ae', ink: '#1d3a8a', inkLight: '#3e63c9', inkDeep: '#12275f',
  graphite: '#2e2e33', pencil: '#6d6d74', red: '#c8424a', margin: '#e06a6c', rule: 'rgba(140,152,214,0.55)',
  ruleMinor: 'rgba(170,180,230,0.45)', hl: 'rgba(246,231,94,0.82)', hlPink: 'rgba(255,140,190,0.6)', hlGreen: 'rgba(140,230,140,0.6)', hlGold: 'rgba(240,200,90,0.55)',
  eraser: '#f2a0a8', eraserSleeve: '#3c66c4', gold: '#c9921b', fire: '#e8742c', wood: '#d3a06a'
};
const FONT_MAIN = "'Main', 'Segoe Print', 'Bradley Hand', cursive";
const FONT_CURSIVE = "'Cursive', 'Main', cursive";

/* ===================== Monde ===================== */
const SQ = 64;                                   // un grand carreau Seyès
const WORLD = { w: SQ * 44, h: SQ * 31 };
const MARGIN_X = SQ * 3;
const UNWRITTEN_NOTES = [
  { x: WORLD.w / 2, y: -150, t: "— marge du haut : rien d'écrit pour l'instant —", r: -0.02 },
  { x: WORLD.w + 170, y: WORLD.h * 0.35, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 180, y: WORLD.h * 0.35 + 46, t: 'une autre page ?', r: 0.04 },
  { x: WORLD.w + 190, y: WORLD.h * 0.35 + 96, t: '→ oui : tourne-la !', r: 0.07 },
  { x: -190, y: WORLD.h * 0.55, t: 'brouillon,', r: -0.07 },
  { x: -180, y: WORLD.h * 0.55 + 44, t: 'ne pas lire', r: -0.05 },
  { x: WORLD.w * 0.3, y: WORLD.h + 140, t: 'à suivre…', r: 0.03 },
  { x: WORLD.w * 0.72, y: WORLD.h + 150, t: 'zone non écrite', r: -0.03 },
  { x: WORLD.w + 160, y: WORLD.h * 0.8, t: '(TODO)', r: 0.1 },
  { x: -170, y: WORLD.h * 0.18, t: '???', r: 0.05 },
  { x: WORLD.w * 0.62, y: -96, t: 'ajouté : les mots se tiennent la main (c’est fait)', r: 0.025 },
  { x: -185, y: WORLD.h * 0.86, t: 'cent lignes ?', r: -0.06 },
  { x: -175, y: WORLD.h * 0.86 + 44, t: '(une suffira)', r: -0.04 }
];

/* ===================== Mots (améliorations) ===================== */
const MOTS = {
  ENCRE:      { label: 'ENCRE', max: 5, desc: 'Une encre plus noire, plus lourde.', eff: () => 'dégâts +30 %', frag: "l'encre" },
  VIRGULE:    { label: 'VIRGULE', max: 5, desc: 'La pause entre deux gouttes raccourcit.', eff: () => 'cadence +18 %', frag: 'une virgule' },
  GUILLEMETS: { label: 'GUILLEMETS', max: 4, desc: 'Des gouttes encadrent la tienne, en éventail.', eff: l => l === 0 ? '+2 gouttes par tir' : '+1 goutte par tir', frag: 'des guillemets' },
  ECHO:       { label: 'ÉCHO', max: 4, desc: 'Chaque goutte rebondit vers une autre rature.', eff: () => '+1 rebond', frag: 'un écho' },
  ITALIQUE:   { label: 'ITALIQUE', max: 4, desc: 'Penchées, tes gouttes traversent tout.', eff: () => '+1 traversée, gouttes plus rapides', frag: "l'italique" },
  LUNE:       { label: 'LUNE', max: 5, desc: 'Un petit « o » tourne autour de toi et cogne.', eff: () => '+1 lune en orbite', frag: 'la lune' },
  FEU:        { label: 'FEU', max: 5, desc: "L'encre s'enflamme au contact des ratures.", eff: l => l === 0 ? 'tes gouttes brûlent' : 'brûlure plus forte', frag: 'le feu' },
  POINT:      { label: 'POINT', max: 5, desc: 'Un point final tombe du ciel, régulièrement.', eff: l => l === 0 ? 'un gros point toutes les 8 s' : 'plus gros, plus souvent', frag: 'un point final' },
  VENT:       { label: 'VENT', max: 3, desc: "Tes gouttes repoussent ce qu'elles touchent.", eff: () => 'recul +', frag: 'le vent' },
  AIMANT:     { label: 'AIMANT', max: 3, desc: 'Les lettres accourent vers toi de plus loin.', eff: () => 'collecte +45 %', frag: 'un aimant' },
  PLUME:      { label: 'PLUME', max: 4, desc: 'Plus légère, plus vive.', eff: () => 'vitesse +10 %, pâté plus fréquent', frag: 'la plume' },
  SOUFFLE:    { label: 'SOUFFLE', max: 3, desc: 'Reprendre son souffle, et un peu plus.', eff: () => '+1 cœur, soin complet', frag: 'un souffle' },
  // Mots composés : quand deux mots atteignent le niveau 2, ils peuvent s'unir (une seule fois)
  POINT_VIRGULE:     { label: 'POINT-VIRGULE', from: ['POINT', 'VIRGULE'], max: 1, desc: 'Chaque point final est suivi d’une virgule qui tombe ailleurs.', eff: () => 'un second point, aussitôt', frag: 'un point-virgule' },
  POINT_DE_FEU:      { label: 'POINT DE FEU', from: ['POINT', 'FEU'], max: 1, desc: 'Là où tombe un point final, la page s’embrase.', eff: () => 'un cercle de flammes 3 s', frag: 'un point de feu' },
  ECHO_DE_LUNE:      { label: 'ÉCHO DE LUNE', from: ['LUNE', 'ECHO'], max: 1, desc: 'Quand une lune cogne, elle renvoie une goutte plus loin.', eff: () => 'les lunes tirent en rebond', frag: 'l’écho de la lune' },
  PLUME_AU_VENT:     { label: 'PLUME AU VENT', from: ['PLUME', 'VENT'], max: 1, desc: 'Ton pâté finit en bourrasque qui balaie tout.', eff: () => 'onde de choc après chaque pâté', frag: 'une plume au vent' },
  ENCRE_SYMPATHIQUE: { label: 'ENCRE SYMPATHIQUE', from: ['ENCRE', 'AIMANT'], max: 1, desc: 'Après un pâté, tu deviens invisible : les ratures perdent ta trace.', eff: () => '2 s d’invisibilité', frag: 'l’encre sympathique' }
};
const isCompose = k => !!(MOTS[k] && MOTS[k].from);
const DICTEES = ['PLUME', 'ENCRE', 'MARGE', 'CAHIER', 'BUVARD', 'LETTRE', 'ÉCRIRE', 'RATURE', 'CHAPITRE', 'BROUILLON', 'PARCHEMIN', 'HISTOIRE'];
const LETTER_POOL = 'EEEEEEEEEEEEEEAAAAAAAASSSSSSSIIIIIIINNNNNNNTTTTTTRRRRRRUUUUUULLLLLOOOOODDDDCCCPPPMMMÉÉVVQFBGHJÀXYZ';

/* ===================== Canvas ===================== */
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
let W = 1280, H = 720, DPR = 1, ZOOM = 1, U = 1;
const SAFE = { t: 0, r: 0, b: 0, l: 0 };
function resize() {
  if (CAPTURE) { W = 1280; H = 720; DPR = 1; }
  else { W = innerWidth; H = innerHeight; DPR = Math.min(2, window.devicePixelRatio || 1); }
  cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
  if (CAPTURE) { cv.style.width = W + 'px'; cv.style.height = H + 'px'; }
  ZOOM = clamp(Math.sqrt(W * H) / Math.sqrt(1280 * 720), 0.62, 1.6);
  U = clamp(Math.min(W / 1280, H / 720) * 1.05, 0.6, 1.5);
  if (W < 700) U = Math.max(U, 0.72);
  const cs = getComputedStyle(document.getElementById('safe'));
  SAFE.t = parseFloat(cs.paddingTop) || 0; SAFE.r = parseFloat(cs.paddingRight) || 0;
  SAFE.b = parseFloat(cs.paddingBottom) || 0; SAFE.l = parseFloat(cs.paddingLeft) || 0;
}

/* ===================== Textures & formes ===================== */
let paperPattern = null, unwrittenPattern = null;
function makeTextures() {
  const r = mulberry32(99);
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = C.paper; g.fillRect(0, 0, 256, 256);
  const id = g.getImageData(0, 0, 256, 256);
  for (let i = 0; i < id.data.length; i += 4) { const n = (r() - 0.5) * 9; id.data[i] += n; id.data[i + 1] += n; id.data[i + 2] += n - 1; }
  g.putImageData(id, 0, 0);
  g.strokeStyle = 'rgba(150,140,110,0.07)'; g.lineWidth = 1;
  for (let i = 0; i < 40; i++) { const x = r() * 256, y = r() * 256, a = r() * TAU, l = 6 + r() * 18; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  paperPattern = ctx.createPattern(c, 'repeat');
  const c2 = document.createElement('canvas'); c2.width = c2.height = 128;
  const g2 = c2.getContext('2d'); g2.fillStyle = C.unwritten; g2.fillRect(0, 0, 128, 128);
  g2.fillStyle = C.dot; g2.fillRect(0, 0, 2, 2); g2.fillRect(64, 0, 2, 2); g2.fillRect(0, 64, 2, 2); g2.fillRect(64, 64, 2, 2);
  unwrittenPattern = ctx.createPattern(c2, 'repeat');
}

// Points de base + variantes « bouillonnantes » (le trait tremble 8 fois par seconde)
function pathFrom(points, jitterSeed, amp, closed) {
  const r = mulberry32(jitterSeed);
  const p = new Path2D();
  const pts = points.map(([x, y]) => [x + (r() - 0.5) * amp, y + (r() - 0.5) * amp]);
  p.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2;
    p.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  const last = pts[pts.length - 1]; p.lineTo(last[0], last[1]);
  if (closed) p.closePath();
  return p;
}
const SHAPES = {};
function buildShapes() {
  const make = (type, count, gen, amp, closed) => {
    SHAPES[type] = [];
    for (let s = 0; s < count; s++) {
      const r = mulberry32(1000 + s * 31 + type.length * 977);
      const pts = gen(r);
      SHAPES[type].push([0, 1, 2].map(k => pathFrom(pts, s * 7 + k * 101 + 5, amp, closed)));
    }
  };
  make('gribouillis', 8, r => { const pts = []; let a = r() * TAU; for (let i = 0; i < 16; i++) { a += 1.6 + r() * 1.6; const rr = 5 + r() * 13; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); } return pts; }, 2.2, false);
  make('gouttelette', 6, r => { const pts = []; let a = r() * TAU; for (let i = 0; i < 9; i++) { a += 1.9 + r() * 1.5; const rr = 3 + r() * 7.5; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); } return pts; }, 1.6, false);
  make('biffure', 6, r => { const pts = []; for (let i = 0; i <= 9; i++) { pts.push([-22 + i * 4.9, (i % 2 ? -1 : 1) * (5 + r() * 5)]); } return pts; }, 2.4, false);
  make('tache', 6, r => { const pts = []; const n = 14; for (let i = 0; i <= n; i++) { const a = i / n * TAU; const rr = 22 * (0.8 + r() * 0.35); pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); } return pts; }, 2.5, true);
  make('soupir', 3, r => [[-5, -22], [5, -11 + r() * 2], [-5, -1], [5, 9 + r() * 2], [-3, 7], [-7, 13], [1, 21]], 2, false);
  make('boss', 3, r => { const pts = []; for (let i = 0; i < 70; i++) { const a = i * 0.55; const rr = 6 + i * 0.95 + r() * 6; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); } return pts; }, 5, false);
}
function boilFrame(t, off = 0) { return Math.floor(t * 8 + off) % 3; }

/* ===================== Encre persistante (taches) ===================== */
const STAIN_S = 0.5;
const stain = document.createElement('canvas');
stain.width = WORLD.w * STAIN_S; stain.height = WORLD.h * STAIN_S;
const sctx = stain.getContext('2d');
function clearStains() { sctx.clearRect(0, 0, stain.width, stain.height); }
function splat(x, y, r, color, alpha, n = 7) {
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.globalAlpha = alpha; sctx.fillStyle = color;
  sctx.beginPath(); sctx.arc(x, y, r, 0, TAU); sctx.fill();
  for (let i = 0; i < n; i++) {
    const a = rnd(TAU), d = r * rnd(0.6, 1.9), rr = r * rnd(0.08, 0.32);
    sctx.beginPath(); sctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, rr, 0, TAU); sctx.fill();
  }
  sctx.restore();
}
// L'encre sèche : les vieilles taches pâlissent doucement, pour que la page ne devienne jamais toute bleue
function dryStains(alpha) {
  sctx.save(); sctx.globalCompositeOperation = 'destination-out'; sctx.globalAlpha = alpha;
  sctx.fillRect(0, 0, stain.width, stain.height); sctx.restore();
}
function eraseStain(x, y, r) {
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.globalCompositeOperation = 'destination-out';
  sctx.globalAlpha = 0.25; sctx.beginPath(); sctx.arc(x, y, r, 0, TAU); sctx.fill(); sctx.restore();
}

/* ===================== Son (tout est synthétisé) ===================== */
const STAFF_F = [698.46, 587.33, 493.88, 392, 329.63];                              // lignes de la portée, de haut en bas : fa, ré, si, sol, mi
const NOTE_F = [329.63, 349.23, 392, 440, 493.88, 523.25, 587.33, 659.25, 698.46];  // de mi à fa, une note par ligne et par interligne
const CAPLOG = { on: false, t: 0, events: [], states: [] };   // capture : sons rejoués hors ligne dans la vidéo
const AU = {
  ctx: null, master: null, sfx: null, mus: null, muted: false, t0: 0, nextBeat: 0, step: 0, noiseBuf: null, last: {},
  init() {
    if (this.ctx || CAPTURE) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.gain.value = this.muted ? 0 : 0.9; this.master.connect(this.ctx.destination);
      this.sfx = this.ctx.createGain(); this.sfx.gain.value = 0.5; this.sfx.connect(this.master);
      this.mus = this.ctx.createGain(); this.mus.gain.value = 0.2; this.mus.connect(this.master);
      const len = this.ctx.sampleRate * 0.6; this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      this.nextBeat = this.ctx.currentTime + 0.2;
    } catch (e) { this.ctx = null; }
  },
  setMuted(m) { this.muted = m; if (this.master) this.master.gain.setTargetAtTime(m ? 0 : 0.9, this.ctx.currentTime, 0.05); },
  throttle(name, gap) { const now = this.offline || CAPLOG.on ? CAPLOG.t * 1000 : performance.now(); if (this.last[name] && now - this.last[name] < gap) return false; this.last[name] = now; return true; },
  tone(f, dur, { type = 'sine', vol = 0.25, when = 0, slide = 0, dest = null, attack = 0.004 } = {}) {
    if (!this.ctx) return; const t = this.ctx.currentTime + this.t0 + when;
    const o = this.ctx.createOscillator(), g = this.ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, f * slide), t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || this.sfx); o.start(t); o.stop(t + dur + 0.05);
  },
  noise(dur, { f = 2000, q = 1, vol = 0.2, when = 0, sweep = 0, type = 'bandpass' } = {}) {
    if (!this.ctx) return; const t = this.ctx.currentTime + this.t0 + when;
    const s = this.ctx.createBufferSource(); s.buffer = this.noiseBuf;
    const bp = this.ctx.createBiquadFilter(); bp.type = type; bp.frequency.setValueAtTime(f, t); bp.Q.value = q;
    if (sweep) bp.frequency.exponentialRampToValueAtTime(f * sweep, t + dur);
    const g = this.ctx.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(bp); bp.connect(g); g.connect(this.sfx); s.start(t, Math.random() * 0.3); s.stop(t + dur + 0.02);
  },
  play(name, k = 0) {
    if (CAPLOG.on) { if (this.throttle('cap-' + name, 25)) CAPLOG.events.push({ t: CAPLOG.t, name, k }); return; }
    if (!this.ctx || this.muted) return;
    const PENTA = [293.66, 349.23, 392, 440, 523.25, 587.33, 698.46, 783.99, 880, 1046.5, 1174.66];
    switch (name) {
      case 'shoot': if (this.throttle('shoot', 70)) this.noise(0.05, { f: 3200 + Math.random() * 1500, q: 2.5, vol: 0.07 }); break;
      case 'hit': if (this.throttle('hit', 40)) this.noise(0.04, { f: 900, q: 1.5, vol: 0.09 }); break;
      case 'kill': if (this.throttle('kill', 45)) { this.noise(0.12, { f: 1800, q: 0.8, vol: 0.12, sweep: 0.4 }); this.tone(110 + Math.random() * 30, 0.12, { type: 'triangle', vol: 0.12, slide: 0.6 }); } break;
      case 'pickup': if (this.throttle('pickup', 30)) this.tone(PENTA[Math.min(PENTA.length - 1, k)] * 2, 0.18, { type: 'sine', vol: 0.09 }); break;
      case 'dictee': this.tone(PENTA[Math.min(PENTA.length - 1, 3 + k)] * 2, 0.5, { type: 'triangle', vol: 0.16 }); this.tone(PENTA[Math.min(PENTA.length - 1, 3 + k)] * 4, 0.35, { vol: 0.05 }); break;
      case 'dicteeDone': [0, 2, 4, 6, 8].forEach((n, i) => this.tone(PENTA[n] * 2, 0.5, { type: 'triangle', vol: 0.14, when: i * 0.07 })); break;
      case 'level': [0, 2, 4, 7].forEach((n, i) => this.tone(PENTA[n] * 2, 0.45, { type: 'triangle', vol: 0.15, when: i * 0.08 })); break;
      case 'choose': this.tone(PENTA[5] * 2, 0.3, { type: 'triangle', vol: 0.15 }); this.noise(0.25, { f: 2500, q: 0.7, vol: 0.08, sweep: 2 }); break;
      case 'hurt': this.tone(150, 0.3, { type: 'sawtooth', vol: 0.14, slide: 0.4 }); this.noise(0.25, { f: 600, q: 0.6, vol: 0.2 }); break;
      case 'dash': this.noise(0.22, { f: 700, q: 0.8, vol: 0.18, sweep: 3.5 }); break;
      case 'point': this.tone(70, 0.6, { type: 'sine', vol: 0.4, slide: 0.5 }); this.noise(0.4, { f: 400, q: 0.5, vol: 0.25, type: 'lowpass' }); break;
      case 'boss': this.tone(55, 2.2, { type: 'sawtooth', vol: 0.12, attack: 0.6 }); this.tone(82.4, 2.2, { type: 'sawtooth', vol: 0.08, attack: 0.8 }); break;
      case 'bossShot': if (this.throttle('bossShot', 200)) this.noise(0.3, { f: 1200, q: 3, vol: 0.12, sweep: 0.3 }); break;
      case 'win': [0, 2, 4, 5, 7, 9, 10].forEach((n, i) => this.tone(PENTA[n], 0.9, { type: 'triangle', vol: 0.16, when: i * 0.11 })); break;
      case 'fusion': [0, 3, 5, 7, 10].forEach((n, i) => { this.tone(PENTA[n] * 2, 0.7, { type: 'triangle', vol: 0.13, when: i * 0.06 }); this.tone(PENTA[n] * 3, 0.5, { vol: 0.04, when: i * 0.06 + 0.03 }); }); this.noise(0.6, { f: 3000, q: 0.6, vol: 0.06, sweep: 2.5 }); break;
      case 'gust': if (this.throttle('gust', 150)) { this.noise(0.45, { f: 450, q: 0.6, vol: 0.24, sweep: 4 }); this.tone(98, 0.35, { type: 'sine', vol: 0.18, slide: 0.5 }); } break;
      case 'fire': if (this.throttle('fire', 120)) this.noise(0.5, { f: 900, q: 0.4, vol: 0.14, type: 'lowpass', sweep: 0.5 }); break;
      case 'citation': [0, 2, 4].forEach((n, i) => this.noise(0.06, { f: 3000 + n * 400, q: 4, vol: 0.06, when: i * 0.05 })); this.tone(PENTA[6] * 2, 0.5, { type: 'triangle', vol: 0.09, when: 0.12, slide: 1.06 }); this.noise(0.4, { f: 1600, q: 0.8, vol: 0.07, sweep: 2.2, when: 0.1 }); break;
      case 'vanish': this.tone(PENTA[8] * 2, 0.45, { vol: 0.08, slide: 0.5 }); this.noise(0.35, { f: 4000, q: 1.2, vol: 0.05, sweep: 0.3 }); break;
      case 'staff': if (this.throttle('staff', 45)) this.tone(STAFF_F[k] || 440, 0.4, { type: 'triangle', vol: 0.06 }); break;
      case 'noteKill': if (this.throttle('kill', 45)) { this.tone(NOTE_F[k] || 440, 0.24, { type: 'triangle', vol: 0.12 }); this.noise(0.08, { f: 2200, q: 1, vol: 0.06 }); } break;
      case 'tick': if (this.throttle('tick', 60)) { this.noise(0.03, { f: 5200, q: 6, vol: 0.1 }); this.tone(k === 3 ? 2400 : 1800, 0.03, { type: 'square', vol: 0.02 }); } break;
      case 'wave': if (this.throttle('wave', 100)) { this.tone(220, 0.35, { type: 'sine', vol: 0.2, slide: 0.5 }); this.noise(0.3, { f: 900, q: 1, vol: 0.12, sweep: 0.4 }); } break;
      case 'blink': if (this.throttle('blink', 120)) this.tone(1200, 0.25, { vol: 0.04, slide: 0.5 }); break;
      case 'boss2': this.tone(61.74, 2.4, { type: 'sawtooth', vol: 0.1, attack: 0.6 }); this.tone(87.31, 2.4, { type: 'sawtooth', vol: 0.08, attack: 0.8 }); this.tone(92.5, 2.4, { vol: 0.06, attack: 0.9 }); break;
      case 'noteShot': if (this.throttle('noteShot', 50)) this.tone(NOTE_F[k % NOTE_F.length] * 2.06, 0.15, { type: 'square', vol: 0.03 }); break;
      case 'wall': this.noise(0.5, { f: 1500, q: 4, vol: 0.1, sweep: 2 }); this.tone(116.54, 0.6, { type: 'sawtooth', vol: 0.06 }); break;
      case 'accord': [246.94, 277.18, 349.23].forEach(f => this.tone(f, 0.7, { type: 'triangle', vol: 0.09 })); break;
      case 'croquis': [0, 1, 2, 3].forEach(i => this.noise(0.07, { f: 2600 + i * 500, q: 3, vol: 0.07, when: i * 0.06, sweep: 1.4 })); this.tone(PENTA[7] * 2, 0.4, { type: 'triangle', vol: 0.09, when: 0.28 }); this.tone(PENTA[9] * 2, 0.5, { type: 'triangle', vol: 0.08, when: 0.36 }); break;
      case 'feuille': this.noise(0.32, { f: 2200, q: 0.6, vol: 0.1, sweep: 0.45 }); break;
      case 'turn': this.noise(0.7, { f: 1800, q: 0.5, vol: 0.18, sweep: 0.35 }); this.noise(0.3, { f: 3500, q: 0.8, vol: 0.08, when: 0.55 }); break;
      case 'refrainNew': [4, 6, 8].forEach((n, i) => this.tone(NOTE_F[n] * 2, 0.35, { type: 'sine', vol: 0.07, when: i * 0.09 })); break;
      case 'refrainNote': this.tone(NOTE_F[k] * 2, 0.6, { type: 'triangle', vol: 0.18 }); this.tone(NOTE_F[k] * 4, 0.4, { vol: 0.05 }); break;
      case 'refrainLost': this.tone(311.13, 0.5, { type: 'triangle', vol: 0.1, slide: 0.85 }); break;
      case 'refrain': {   // la mélodie rejouée d'un trait, puis un accord
        const ds = String(k).split('').map(c => Number(c) - 1);
        ds.forEach((n, i) => { this.tone(NOTE_F[n] * 2, 0.45, { type: 'triangle', vol: 0.16, when: i * 0.1 }); this.tone(NOTE_F[n], 0.5, { vol: 0.06, when: i * 0.1 }); });
        [0, 2, 4].forEach(n => this.tone(NOTE_F[n + 2] * 2, 1.2, { type: 'sine', vol: 0.08, when: ds.length * 0.1 }));
        this.noise(0.8, { f: 3000, q: 0.6, vol: 0.06, sweep: 2.5 }); break;
      }
      // chapitre III : le papier millimétré
      case 'mmKill': if (this.throttle('kill', 45)) { this.tone(PENTA[4 + Math.floor(Math.random() * 5)] * 2, 0.09, { type: 'triangle', vol: 0.09 }); this.noise(0.06, { f: 2600, q: 2, vol: 0.09, sweep: 0.5 }); } break;
      case 'squareAim': if (this.throttle('squareAim', 90)) this.tone(1318.5, 0.14, { vol: 0.04, slide: 1.3 }); break;
      case 'squareSnap': if (this.throttle('squareSnap', 70)) { this.noise(0.1, { f: 3800, q: 5, vol: 0.14 }); this.tone(220, 0.08, { type: 'square', vol: 0.025 }); } break;
      case 'compas': if (this.throttle('compas', 250)) this.noise(0.32, { f: 5200, q: 2.5, vol: 0.05, sweep: 0.8 }); break;
      case 'protract': if (this.throttle('protract', 120)) [0, 1, 2].forEach(i => this.tone(880 * (1 + i * 0.125), 0.07, { type: 'square', vol: 0.02, when: i * 0.04 })); break;
      case 'mesure': if (this.throttle('mesure', 150)) { this.noise(0.15, { f: 2400, q: 6, vol: 0.09 }); [0, 1, 2, 3].forEach(i => this.tone(1567.98, 0.04, { type: 'square', vol: 0.015, when: i * 0.05 })); } break;
      case 'spin': this.noise(1.6, { f: 420, q: 0.7, vol: 0.16, sweep: 3 }); this.tone(110, 1.4, { type: 'sawtooth', vol: 0.04, slide: 1.5 }); break;
      case 'lift': this.tone(160, 0.9, { vol: 0.08, slide: 2.2 }); break;
      case 'slam': this.tone(58, 0.55, { vol: 0.4, slide: 0.5 }); this.noise(0.35, { f: 2500, q: 0.6, vol: 0.24, sweep: 0.3 }); this.tone(1567.98, 0.9, { vol: 0.035 }); this.tone(2349.3, 0.7, { vol: 0.02 }); break;
      case 'boss3': this.tone(49, 2.4, { type: 'sawtooth', vol: 0.1, attack: 0.6 }); this.tone(73.42, 2.4, { type: 'sawtooth', vol: 0.07, attack: 0.8 }); this.tone(1046.5, 1.8, { vol: 0.03, attack: 0.3 }); break;
      case 'lignesNew': [392, 493.88, 587.33].forEach((f, i) => this.tone(f * 2, 0.3, { type: 'triangle', vol: 0.07, when: i * 0.09 })); this.noise(0.4, { f: 3600, q: 3, vol: 0.05, sweep: 0.7, when: 0.25 }); break;
      case 'ligneMot': { const F = [587.33, 659.25, 739.99, 783.99, 880, 987.77, 1108.73, 1174.66]; this.tone(F[k % 8], 0.35, { type: 'triangle', vol: 0.12 }); break; }
      case 'lignes': {   // la phrase rejouée mot à mot, puis la cloche de la récré
        const F = [587.33, 659.25, 739.99, 783.99, 880, 987.77, 1108.73, 1174.66];
        for (let i = 0; i < k; i++) this.tone(F[i % 8], 0.3, { type: 'triangle', vol: 0.12, when: i * 0.06 });
        [1174.66, 1479.98, 1760].forEach((f, i) => this.tone(f, 1.3, { vol: 0.07, when: k * 0.06 + i * 0.02 }));
        this.noise(0.6, { f: 2400, q: 0.6, vol: 0.07, sweep: 3, when: k * 0.06 }); break;
      }
      case 'figureNew': [523.25, 659.25, 783.99].forEach((f, i) => this.tone(f * 2, 0.3, { vol: 0.07, when: i * 0.08 })); break;
      case 'figurePt': { const F = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98]; this.tone(F[k % 6], 0.55, { type: 'triangle', vol: 0.17 }); this.tone(F[k % 6] * 2, 0.35, { vol: 0.05 }); break; }
      case 'figureLost': this.noise(0.4, { f: 1400, q: 0.8, vol: 0.12, sweep: 0.5 }); this.tone(311.13, 0.5, { type: 'triangle', vol: 0.08, slide: 0.85 }); break;
      case 'figure': {   // les sommets rejoués d'un trait, puis l'accord de la figure
        const F = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
        for (let i = 0; i <= k; i++) this.tone(F[i % k] * (i === k ? 2 : 1), 0.4, { type: 'triangle', vol: 0.15, when: i * 0.08 });
        [261.63, 329.63, 392].forEach(f => this.tone(f * 2, 1.2, { vol: 0.08, when: (k + 1) * 0.08 }));
        this.noise(0.7, { f: 3000, q: 0.6, vol: 0.06, sweep: 2.5 }); break;
      }
      // chapitre IV : la carte au trésor
      case 'carteKill': if (this.throttle('kill', 45)) { this.tone(PENTA[3 + Math.floor(Math.random() * 6)] * 2, 0.1, { type: 'triangle', vol: 0.1 }); this.noise(0.1, { f: 1100, q: 0.8, vol: 0.09, sweep: 0.5 }); } break;
      case 'gull': if (this.throttle('gull', 160)) { this.tone(1450, 0.16, { type: 'triangle', vol: 0.045, slide: 0.62 }); this.tone(1300, 0.18, { type: 'triangle', vol: 0.04, slide: 0.7, when: 0.13 }); } break;
      case 'crab': if (this.throttle('crab', 140)) { this.noise(0.03, { f: 4200, q: 8, vol: 0.07 }); this.noise(0.03, { f: 3800, q: 8, vol: 0.06, when: 0.07 }); } break;
      case 'cork': if (this.throttle('cork', 90)) { this.tone(520, 0.09, { type: 'square', vol: 0.04, slide: 2.2 }); this.noise(0.05, { f: 2000, q: 2, vol: 0.1 }); } break;
      case 'boss4': this.tone(43.65, 2.6, { type: 'sawtooth', vol: 0.1, attack: 0.7 }); this.tone(65.41, 2.6, { type: 'sawtooth', vol: 0.07, attack: 0.9 }); this.noise(0.55, { f: 300, q: 0.5, vol: 0.2, type: 'lowpass', sweep: 0.5 }); break;
      case 'armWarn': this.tone(98, 0.7, { type: 'sawtooth', vol: 0.05, slide: 1.4, attack: 0.2 }); break;
      case 'sweep': this.noise(0.55, { f: 320, q: 0.6, vol: 0.24, sweep: 4 }); this.tone(73.42, 0.6, { vol: 0.2, slide: 0.6 }); break;
      case 'inhale': this.tone(80, 2, { type: 'sawtooth', vol: 0.05, slide: 2.6, attack: 0.8 }); this.noise(0.55, { f: 700, q: 0.7, vol: 0.12, sweep: 3, when: 0.2 }); break;
      case 'spit': this.noise(0.35, { f: 900, q: 1, vol: 0.22, sweep: 0.3 }); this.tone(150, 0.35, { vol: 0.2, slide: 0.5 }); break;
      case 'rain': this.tone(330, 0.5, { vol: 0.05, slide: 0.5 }); break;
      case 'plop': if (this.throttle('plop', 70)) this.tone(150 + Math.random() * 80, 0.14, { vol: 0.16, slide: 0.45 }); break;
      case 'tresorNew': [587.33, 739.99, 880].forEach((f, i) => this.tone(f, 0.35, { type: 'triangle', vol: 0.1, when: i * 0.1 })); break;
      case 'trail': { const F = [587.33, 659.25, 698.46, 783.99, 880, 987.77, 1046.5, 1174.66, 1318.5]; this.tone(F[k % 9], 0.4, { type: 'triangle', vol: 0.15 }); this.tone(F[k % 9] * 2, 0.25, { vol: 0.04 }); break; }
      case 'xmark': [880, 1174.66].forEach((f, i) => this.tone(f, 0.5, { type: 'triangle', vol: 0.14, when: i * 0.12 })); break;
      case 'dig': if (this.throttle('dig', 150)) { this.noise(0.12, { f: 900, q: 0.8, vol: 0.18, sweep: 0.5 }); this.tone(110, 0.07, { type: 'square', vol: 0.03 }); } break;
      case 'tresor': {   // fanfare, puis une pluie de pièces
        [0, 4, 7, 12, 16].forEach((n, i) => this.tone(293.66 * 2 * Math.pow(2, n / 12), 0.55, { type: 'triangle', vol: 0.15, when: i * 0.08 }));
        for (let j = 0; j < 8; j++) this.tone(2637 + (j % 3) * 400, 0.12, { vol: 0.035, when: 0.4 + j * 0.06 });
        this.noise(0.6, { f: 5000, q: 0.8, vol: 0.06, sweep: 1.5, when: 0.35 }); break;
      }
      // chapitre V : la page de calligraphie
      case 'calliKill': if (this.throttle('kill', 45)) { this.noise(0.09, { f: 3600, q: 3, vol: 0.08, sweep: 0.6 }); this.tone([392, 440, 493.88, 587.33, 659.25][Math.floor(Math.random() * 5)] * 2, 0.16, { type: 'square', vol: 0.025 }); } break;
      case 'quill': if (this.throttle('quill', 120)) this.noise(0.25, { f: 4200, q: 4, vol: 0.05, sweep: 0.7 }); break;
      case 'spitInk': if (this.throttle('spitInk', 90)) { [0, 1, 2].forEach(i => this.tone(260 - i * 30, 0.08, { vol: 0.12, slide: 0.5, when: i * 0.13 })); } break;
      case 'fleurWarn': if (this.throttle('fleurWarn', 150)) this.tone(1567.98, 0.6, { vol: 0.03, attack: 0.3 }); break;
      case 'fleur': if (this.throttle('fleur', 120)) [1174.66, 1567.98, 1975.53].forEach((f, i) => this.tone(f, 0.5, { type: 'triangle', vol: 0.05, when: i * 0.03 })); break;
      case 'boss5': this.tone(49, 2.6, { type: 'sawtooth', vol: 0.1, attack: 0.6 }); this.tone(73.42, 2.6, { type: 'sawtooth', vol: 0.07, attack: 0.8 }); this.noise(1.6, { f: 3000, q: 2, vol: 0.06, sweep: 0.4, when: 0.4 }); break;
      case 'signWarn': this.tone(392, 0.9, { type: 'triangle', vol: 0.05, slide: 1.5, attack: 0.3 }); break;
      case 'sign': this.noise(1.3, { f: 2600, q: 2.5, vol: 0.16, sweep: 1.6 }); this.tone(130.81, 1.2, { type: 'sawtooth', vol: 0.05, slide: 1.5 }); break;
      case 'pleins': [196, 293.66].forEach((f, i) => this.tone(f, 0.4, { type: 'square', vol: 0.04, when: i * 0.08, slide: 0.7 })); this.noise(0.3, { f: 1500, q: 1, vol: 0.1 }); break;
      case 'enluNew': [783.99, 987.77, 1174.66, 1567.98].forEach((f, i) => this.tone(f, 0.4, { type: 'triangle', vol: 0.07, when: i * 0.07 })); break;
      case 'enluCell': if (this.throttle('enluCell', 90)) this.tone([587.33, 659.25, 739.99, 783.99, 880, 987.77, 1108.73, 1174.66, 1318.51, 1479.98, 1567.98][Math.min(10, k)] * 2, 0.22, { vol: 0.05 }); break;
      case 'enlu': {   // un glissando de harpe, puis un accord doré
        [0, 2, 4, 5, 7, 9, 11, 12, 14, 16].forEach((n, i) => this.tone(392 * Math.pow(2, n / 12), 0.6, { type: 'triangle', vol: 0.1, when: i * 0.045 }));
        [392, 493.88, 587.33, 783.99].forEach(f => this.tone(f * 2, 1.4, { vol: 0.07, when: 0.5 }));
        this.noise(0.8, { f: 6000, q: 0.7, vol: 0.05, sweep: 1.5, when: 0.45 }); break;
      }
      // chapitre VI : la page de garde
      case 'gardeKill': if (this.throttle('kill', 45)) { this.tone([523.25, 587.33, 659.25, 783.99, 880][Math.floor(Math.random() * 5)] * 2, 0.3, { vol: 0.07 }); this.noise(0.08, { f: 1600, q: 1, vol: 0.07, sweep: 0.5 }); } break;
      case 'ribbonWarn': if (this.throttle('ribbonWarn', 120)) this.noise(0.6, { f: 2400, q: 3, vol: 0.04, sweep: 1.6 }); break;
      case 'ribbonSnap': if (this.throttle('ribbonSnap', 80)) { this.noise(0.09, { f: 1800, q: 1.2, vol: 0.2, sweep: 0.4 }); this.tone(330, 0.08, { type: 'square', vol: 0.03, slide: 0.5 }); } break;
      case 'combWarn': if (this.throttle('combWarn', 120)) [0, 1, 2, 3].forEach(i => this.noise(0.04, { f: 3000 + i * 300, q: 6, vol: 0.05, when: i * 0.05 })); break;
      case 'comb': if (this.throttle('comb', 120)) this.noise(0.9, { f: 1400, q: 1.4, vol: 0.09, sweep: 1.8 }); break;
      case 'stampJump': if (this.throttle('stampJump', 120)) this.tone(260, 0.3, { vol: 0.06, slide: 1.8 }); break;
      case 'stampLand': if (this.throttle('stampLand', 90)) { this.tone(90, 0.22, { vol: 0.3, slide: 0.5 }); this.noise(0.12, { f: 700, q: 0.8, vol: 0.18 }); } break;
      case 'boss6': this.tone(41.2, 2.6, { type: 'sawtooth', vol: 0.1, attack: 0.6 }); this.tone(61.74, 2.6, { type: 'sawtooth', vol: 0.07, attack: 0.8 }); this.tone(70, 0.6, { vol: 0.4, slide: 0.5, when: 0.2 }); this.noise(0.5, { f: 400, q: 0.5, vol: 0.2, type: 'lowpass', when: 0.2 }); break;
      case 'flap': this.noise(0.25, { f: 900, q: 0.7, vol: 0.14, sweep: 2 }); this.tone(120, 0.15, { type: 'square', vol: 0.03 }); break;
      case 'trousse': if (this.throttle('trousse', 120)) [0, 1, 2].forEach(i => this.noise(0.05, { f: 4200 - i * 600, q: 3, vol: 0.07, when: i * 0.04 })); break;
      case 'sceauNew': [392, 523.25, 659.25].forEach((f, i) => this.tone(f, 0.45, { type: 'triangle', vol: 0.1, when: i * 0.1 })); break;
      case 'sceauGrab': this.tone(659.25, 0.3, { type: 'triangle', vol: 0.15 }); this.tone(987.77, 0.4, { vol: 0.06, when: 0.08 }); break;
      case 'sceauDrop': this.tone(392, 0.4, { type: 'triangle', vol: 0.12, slide: 0.7 }); this.tone(150, 0.12, { vol: 0.2, slide: 0.5, when: 0.15 }); break;
      case 'sceau': {   // le cachet tombe, puis « au clair de la lune » en carillon
        this.tone(70, 0.5, { vol: 0.4, slide: 0.5 }); this.noise(0.3, { f: 600, q: 0.6, vol: 0.2, type: 'lowpass' });
        [523.25, 523.25, 523.25, 587.33, 659.25, 587.33].forEach((f, i) => { this.tone(f * 2, 0.5, { type: 'triangle', vol: 0.11, when: 0.15 + i * 0.12 }); this.tone(f * 4, 0.3, { vol: 0.03, when: 0.15 + i * 0.12 }); });
        [261.63, 329.63, 392].forEach(f => this.tone(f * 2, 1.4, { vol: 0.07, when: 0.9 }));
        this.noise(0.8, { f: 5000, q: 0.7, vol: 0.05, sweep: 1.5, when: 0.85 }); break;
      }
      case 'lose': [6, 4, 2, 0].forEach((n, i) => this.tone(PENTA[n], 0.8, { type: 'triangle', vol: 0.15, when: i * 0.18 })); break;
    }
  },
  // Musique générative : un petit kalimba en ré dorien, qui s'agite quand ça chauffe
  tick(intensity, bossOn, chap = 1) {
    if (!this.ctx || this.muted) return;
    while (this.nextBeat < this.ctx.currentTime + 0.15) {
      this.beatAt(this.nextBeat - this.ctx.currentTime, this.step, intensity, bossOn, chap);
      this.nextBeat += this.BEAT; this.step++;
    }
  },
  BEAT: 0.36,
  // la mélodie d'« au clair de la lune » (traditionnelle), un temps par case ; 0 = la note précédente continue
  LUNE: [[523.25, 523.25, 523.25, 587.33, 659.25, 0, 587.33, 0, 523.25, 659.25, 587.33, 587.33, 523.25, 0, 0, 0],
         [587.33, 587.33, 587.33, 587.33, 440, 0, 440, 0, 587.33, 523.25, 493.88, 440, 392, 0, 0, 0]],
  // Chapitre I : ré dorien au kalimba. Chapitre II : boîte à musique en do lydien, avec le tic-tac d'un métronome.
  // Chapitre III : arpèges réguliers en la mineur, comme des figures qu'on répète, et le cliquetis d'une règle.
  beatAt(when, s, intensity, bossOn, chap = 1) {
    const beat = this.BEAT, two = chap === 2;
    if (chap === 3) {
      const sc = [220, 261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25], pat = [0, 2, 4, 6, 4, 2, 1, 3];
      if (s % 8 === 0) this.tone([55, 65.41, 73.42, 49][(s >> 5) % 4], beat * 7, { type: 'sine', vol: 0.22, when, dest: this.mus, attack: 0.05 });
      if (s % 4 === 0) this.noise(0.025, { f: 3000, q: 8, vol: 0.025, when });
      if (Math.random() < 0.5 + intensity * 0.45) { const n = sc[(pat[s % 8] + ((s >> 4) % 3)) % sc.length]; this.tone(n * 2, beat * 0.9, { type: 'triangle', vol: 0.085, when, dest: this.mus, attack: 0.002 }); }
      if (bossOn && s % 2 === 0) this.noise(0.05, { f: 5000, q: 1, vol: 0.03, when });
      return;
    }
    if (chap === 4) {   // une barcarolle à six temps en ré dorien, qui tangue, et la houle tous les deux temps forts
      const sc = [146.83, 164.81, 174.61, 196, 220, 246.94, 261.63, 293.66, 329.63, 349.23, 392], bar = s % 6;
      const root = [73.42, 65.41, 58.27, 55][Math.floor(s / 12) % 4];
      if (bar === 0) this.tone(root, beat * 5.5, { type: 'sine', vol: 0.22, when, dest: this.mus, attack: 0.05 });
      if (bar === 3) this.tone(root * 1.5, beat * 2.5, { type: 'sine', vol: 0.1, when, dest: this.mus, attack: 0.05 });
      if (s % 12 === 0) this.noise(0.55, { f: 520, q: 0.5, vol: 0.04, type: 'lowpass', when, sweep: 0.6 });
      if (Math.random() < (bar === 0 || bar === 3 ? 0.85 : 0.3) + intensity * 0.3) {
        const n = sc[([4, 2, 3, 4, 5, 3][bar] + [0, 1, -1, 2][Math.floor(s / 6) % 4] + 2) % sc.length];
        this.tone(n * 2, beat * (bar === 0 ? 2.2 : 1.1), { type: 'triangle', vol: 0.09, when, dest: this.mus, attack: 0.01 });
      }
      if (bossOn && s % 2 === 0) this.noise(0.05, { f: 5000, q: 1, vol: 0.03, when });
      return;
    }
    if (chap === 5) {   // une valse en sol majeur, au clavecin : la basse, puis deux accords pincés
      const bar = s % 3, root = [98, 130.81, 146.83, 98][Math.floor(s / 6) % 4], maj = [1, 1.26, 1.5];
      if (bar === 0) this.tone(root, beat * 2.6, { type: 'sine', vol: 0.22, when, dest: this.mus, attack: 0.03 });
      else maj.forEach(m => this.tone(root * 2 * m, beat * 0.45, { type: 'square', vol: 0.016, when, dest: this.mus, attack: 0.002 }));
      const sc = [392, 440, 493.88, 523.25, 587.33, 659.25, 739.99, 783.99];
      if (Math.random() < (bar === 0 ? 0.75 : 0.35) + intensity * 0.3) this.tone(sc[(bar * 2 + Math.floor(s / 3) * 3) % sc.length], beat * (bar === 0 ? 1.8 : 0.9), { type: 'triangle', vol: 0.085, when, dest: this.mus, attack: 0.004 });
      if (bossOn && s % 2 === 0) this.noise(0.05, { f: 5000, q: 1, vol: 0.03, when });
      return;
    }
    if (chap === 6) {   // « au clair de la lune », à la boîte à musique, sur des accords tenus
      const song = this.LUNE[Math.floor(s / 16) % 4 === 2 ? 1 : 0], i = s % 16, n = song[i], bar = Math.floor(i / 4);
      const roots = Math.floor(s / 16) % 4 === 2 ? [98, 146.83, 98, 98] : [130.81, 130.81, 98, 130.81], root = roots[bar];
      if (i % 4 === 0) { this.tone(root / 2, beat * 3.8, { type: 'sine', vol: 0.2, when, dest: this.mus, attack: 0.05 }); [1, 1.26, 1.5].forEach(m => this.tone(root * 2 * m, beat * 3.6, { type: 'sine', vol: 0.025, when, dest: this.mus, attack: 0.2 })); }
      if (n) {
        let len = 1; while (i + len < 16 && !song[i + len]) len++;
        this.tone(n * 2, beat * (len + 0.6), { type: 'sine', vol: 0.11, when, dest: this.mus, attack: 0.003 });
        this.tone(n * 8, beat * 0.5, { vol: 0.012, when, dest: this.mus, attack: 0.002 });
        if (Math.random() < intensity * 0.35) this.tone(n * 3, beat * 0.6, { type: 'triangle', vol: 0.03, when: when + beat / 2, dest: this.mus, attack: 0.003 });
      }
      if (bossOn && s % 2 === 0) this.noise(0.05, { f: 5000, q: 1, vol: 0.03, when });
      return;
    }
    const scale = two ? [261.63, 293.66, 329.63, 369.99, 392, 440, 493.88, 523.25, 587.33] : [146.83, 174.61, 196, 220, 261.63, 293.66, 349.23, 392, 440];
    const bass = two ? [65.41, 98, 110, 82.41] : [73.42, 87.31, 65.41, 98];
    if (s % 8 === 0) this.tone(bass[(s >> 5) % 4], beat * 7, { type: 'sine', vol: 0.22, when, dest: this.mus, attack: 0.05 });
    if (two) {
      if (s % 2 === 0) this.noise(0.02, { f: 6000, q: 4, vol: 0.02, when });
      if (Math.random() < 0.3 + intensity * 0.5) { const n = scale[(s * 3 + Math.floor(Math.random() * 3)) % scale.length]; this.tone(n * 2, beat * 1.6, { type: 'sine', vol: 0.09, when, dest: this.mus, attack: 0.002 }); this.tone(n * 4, beat * 0.8, { vol: 0.025, when, dest: this.mus, attack: 0.002 }); }
    } else if (Math.random() < 0.25 + intensity * 0.55) { const n = scale[Math.floor(Math.random() * scale.length)]; this.tone(n * 2, beat * 2.2, { type: 'triangle', vol: 0.1, when, dest: this.mus }); }
    if (bossOn && s % 2 === 0) this.noise(0.05, { f: 5000, q: 1, vol: 0.03, when });
  },
  // Rejoue la bande-son d'une capture dans un OfflineAudioContext et renvoie un WAV (base64)
  async renderCapture(duration) {
    const sr = 44100, oc = new OfflineAudioContext(1, Math.ceil(sr * duration), sr);
    const saved = { ctx: this.ctx, master: this.master, sfx: this.sfx, mus: this.mus, noiseBuf: this.noiseBuf, muted: this.muted };
    this.ctx = oc; this.muted = false; this.offline = true;
    this.master = oc.createGain(); this.master.gain.value = 0.9;
    const comp = oc.createDynamicsCompressor(); this.master.connect(comp); comp.connect(oc.destination);
    this.sfx = oc.createGain(); this.sfx.gain.value = 0.5; this.sfx.connect(this.master);
    this.mus = oc.createGain(); this.mus.gain.value = 0.2; this.mus.connect(this.master);
    const len = sr * 0.6; this.noiseBuf = oc.createBuffer(1, len, sr); const d = this.noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this.last = {};
    const st = CAPLOG.states;
    for (let s = 0, tb = 0.05; tb < duration; s++, tb += this.BEAT) {
      let k = 0; while (k < st.length - 1 && st[k + 1].t <= tb) k++;
      this.beatAt(tb, s, st[k] ? st[k].i : 0.1, st[k] ? st[k].b : false, st[k] ? st[k].c : 1);
    }
    for (const e of CAPLOG.events) { CAPLOG.t = e.t; this.t0 = e.t; this.play(e.name, e.k); }
    this.t0 = 0;
    const buf = await oc.startRendering();
    Object.assign(this, saved); this.offline = false;
    const pcm = buf.getChannelData(0), n = pcm.length, bytes = new Uint8Array(44 + n * 2), dv = new DataView(bytes.buffer);
    const wr = (o, str) => { for (let i = 0; i < str.length; i++) bytes[o + i] = str.charCodeAt(i); };
    wr(0, 'RIFF'); dv.setUint32(4, 36 + n * 2, true); wr(8, 'WAVEfmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
    dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); wr(36, 'data'); dv.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) dv.setInt16(44 + i * 2, Math.max(-1, Math.min(1, pcm[i])) * 32767, true);
    let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  }
};
if (!CAPTURE) { try { AU.muted = localStorage.getItem('inacheve.muted') === '1'; } catch (e) { /* stockage indisponible */ } }
