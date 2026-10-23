// Les bons points et les images (itération 23) : chaque exploit de la page rapporte des bons points, et dix bons points font une image.
// Les images, de petites vignettes peintes à la gouache, se collectionnent à la toute dernière page du bestiaire.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const BONS = { per: 10, key: 'inacheve.images', toast: 2.2, imgToast: 4.8 };
// ce qui rapporte des bons points : [compteur, bons points, raison]
const BON_SOURCES = [
  [() => Math.floor((G.dictees || 0) / 3), 1, 'trois dictées complètes'],
  [() => G.lignes || 0, 1, 'lignes recopiées'],
  [() => G.refrains || 0, 1, 'refrain chanté'],
  [() => G.figures || 0, 1, 'figure tracée'],
  [() => G.tresors || 0, 1, 'trésor déterré'],
  [() => G.enlus || 0, 1, 'lettrine dorée'],
  [() => G.sceaux || 0, 1, 'ex-libris rapporté'],
  [() => G.morpions || 0, 1, 'morpion gagné'],
  [() => G.labys || 0, 1, 'labyrinthe traversé'],
  [() => G.calculs || 0, 1, 'calcul juste'],
  [() => G.marelles || 0, 1, 'marelle sautée'],
  [() => G.poemes || 0, 1, 'poème récité'],
  [() => G.agendas || 0, 1, 'devoir coché'],
  [() => Math.floor((G.kills || 0) / 300), 1, 'trois cents ratures biffées'],
  [() => bestCount(), 1, 'nouveau croquis'],
  [() => unionCount(), 2, 'nouvelle union'],
  [() => G.bossDefeated ? 1 : 0, 3, 'patron biffé']
];

/* ----- les douze images : [nom, peinture] ; chaque peinture se fait dans un carré de 100 × 100 centré ----- */
function sky(top, bottom) { const g = ctx.createLinearGradient(0, -50, 0, 50); g.addColorStop(0, top); g.addColorStop(1, bottom); ctx.fillStyle = g; ctx.fillRect(-50, -50, 100, 100); }
function blob(x, y, rx, ry, fill, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, TAU); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); }
function poly(pts, fill) { ctx.beginPath(); pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.stroke(); }
function cloud(x, y, k) { ctx.save(); ctx.strokeStyle = 'transparent'; [[-8, 2, 9], [0, -3, 11], [9, 2, 8]].forEach(([dx, dy, r]) => blob(x + dx * k, y + dy * k, r * k, r * k * 0.8, 'rgba(255,255,255,0.92)')); ctx.restore(); }
function starsAt(seed, n) { ctx.fillStyle = '#fff8d8'; for (let i = 0; i < n; i++) { const x = ((seed + i * 37) % 97) - 48, y = ((seed * 3 + i * 53) % 61) - 50, tw = 0.6 + 0.4 * Math.sin(G.time * 2 + i); ctx.globalAlpha = tw; ctx.fillRect(x, y, 1.6, 1.6); } ctx.globalAlpha = 1; }
const IMAGES = [
  ['le hibou savant', t => {
    sky('#1f2b58', '#4c5d9c'); starsAt(7, 14); ctx.strokeStyle = 'transparent'; blob(28, -30, 11, 11, '#f6e9b0');
    ctx.strokeStyle = '#3b2a1c'; ctx.lineWidth = 1.4;
    ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-55, 34); ctx.quadraticCurveTo(0, 22, 55, 30); ctx.strokeStyle = '#6b4a2e'; ctx.stroke(); ctx.lineWidth = 1.4; ctx.strokeStyle = '#3b2a1c';
    poly([[-14, -18], [-10, -30], [-5, -20]], '#8a5a34'); poly([[14, -18], [10, -30], [5, -20]], '#8a5a34');
    blob(0, 4, 17, 23, '#8a5a34'); blob(0, 10, 11, 14, '#d9b98a');
    const bl = Math.sin(t * 0.7) > 0.96 ? 0.15 : 1;
    [-7, 7].forEach(x => { blob(x, -8, 6.5, 6.5, '#fffdf2'); ctx.save(); ctx.translate(x, -8); ctx.scale(1, bl); blob(0, 0, 3, 3, '#20190f'); ctx.restore(); });
    ctx.beginPath(); ctx.arc(-7, -8, 7.5, 0, TAU); ctx.arc(7, -8, 7.5, 0, TAU); ctx.moveTo(-0.5, -8); ctx.stroke();
    poly([[-2.5, -1], [2.5, -1], [0, 4]], '#e8a03a');
  }],
  ['la montgolfière', t => {
    sky('#7fc4ea', '#e9f5fb'); cloud(-28, -30, 1); cloud(30, 10, 0.8);
    ctx.strokeStyle = '#4a7a3a'; ctx.lineWidth = 1.2; blob(-30, 70, 60, 34, '#8cc46a'); blob(40, 74, 55, 34, '#a6d47c');
    const y = Math.sin(t * 0.9) * 4 - 12;
    ctx.save(); ctx.beginPath(); ctx.arc(0, y - 8, 24, 0, TAU); ctx.clip();
    for (let k = -3; k <= 3; k++) { ctx.fillStyle = k % 2 ? '#f6c84a' : '#e0514a'; ctx.fillRect(k * 7 - 3.5, y - 34, 7, 52); }
    ctx.restore();
    ctx.strokeStyle = '#3a2a20'; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(0, y - 8, 24, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-16, y + 10); ctx.lineTo(-6, y + 28); ctx.moveTo(16, y + 10); ctx.lineTo(6, y + 28); ctx.stroke();
    poly([[-7, y + 27], [7, y + 27], [6, y + 36], [-6, y + 36]], '#a8703e');
  }],
  ['le phare', t => {
    sky('#f3a76c', '#7462ad'); ctx.strokeStyle = 'transparent'; blob(-30, 8, 10, 10, '#ffd98a');
    const a = t * 1.3, bx = 14, by = -22;
    ctx.save(); ctx.globalAlpha = 0.35 + 0.15 * Math.sin(t * 3); ctx.fillStyle = '#fff3b0';
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(a - 0.18) * 90, by + Math.sin(a - 0.18) * 40); ctx.lineTo(bx + Math.cos(a + 0.18) * 90, by + Math.sin(a + 0.18) * 40); ctx.closePath(); ctx.fill(); ctx.restore();
    ctx.fillStyle = '#2f6c9c'; ctx.fillRect(-50, 22, 100, 30);
    ctx.strokeStyle = '#cfe6f5'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let k = 0; k < 4; k++) { const yy = 28 + k * 6, o = (t * 8 + k * 9) % 16; for (let x = -56 + o; x < 50; x += 16) { ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + 4, yy - 2.5, x + 8, yy); } } ctx.stroke();
    ctx.strokeStyle = '#2b2a33'; ctx.lineWidth = 1.4; poly([[-2, 26], [6, 14], [26, 14], [34, 26]], '#6b6a72');
    poly([[8, 14], [10, -16], [18, -16], [20, 14]], '#fbf7ee');
    ctx.fillStyle = '#d8453f'; ctx.fillRect(8.9, -6, 10.2, 5); ctx.fillRect(8.4, 4, 11.2, 5);
    blob(bx, by + 1, 6, 5, '#ffe36e'); poly([[7, by - 3], [14, by - 10], [21, by - 3]], '#d8453f');
  }],
  ['le chat et la pelote', t => {
    sky('#f6dfb6', '#efd0a0'); ctx.fillStyle = '#c98a52'; ctx.fillRect(-50, 24, 100, 30);
    ctx.strokeStyle = '#a56c3a'; ctx.lineWidth = 0.8; ctx.beginPath(); for (let x = -45; x < 50; x += 14) { ctx.moveTo(x, 24); ctx.lineTo(x - 6, 50); } ctx.stroke();
    ctx.strokeStyle = '#3a3440'; ctx.lineWidth = 1.4;
    const sw = Math.sin(t * 2.2) * 8;
    ctx.lineWidth = 5; ctx.strokeStyle = '#7d7f8c'; ctx.beginPath(); ctx.moveTo(-6, 26); ctx.quadraticCurveTo(-30, 30, -32 + sw * 0.5, 8 + sw * 0.3); ctx.stroke(); ctx.lineWidth = 1.4; ctx.strokeStyle = '#3a3440';
    blob(-12, 12, 14, 16, '#8e909e'); blob(-12, -10, 11, 10, '#8e909e');
    poly([[-21, -15], [-19, -26], [-13, -18]], '#8e909e'); poly([[-3, -15], [-5, -26], [-11, -18]], '#8e909e');
    blob(-16, -11, 1.8, 2.4, '#2a2a30'); blob(-8, -11, 1.8, 2.4, '#2a2a30');
    ctx.beginPath(); ctx.moveTo(-12, -6); ctx.lineTo(-14, -4); ctx.moveTo(-12, -6); ctx.lineTo(-10, -4); ctx.stroke();
    const px = 22 + Math.sin(t * 1.1) * 3; blob(px, 18, 10, 10, '#d8453f');
    ctx.strokeStyle = '#a32f2b'; ctx.lineWidth = 0.9; ctx.beginPath(); for (let k = -2; k <= 2; k++) { ctx.moveTo(px - 9, 18 + k * 3.5); ctx.quadraticCurveTo(px, 14 + k * 3.5, px + 9, 18 + k * 3.5); } ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px - 8, 24); ctx.bezierCurveTo(px - 18, 38, -2, 30, -4, 36); ctx.stroke();
  }],
  ['la baleine', t => {
    sky('#bfe3f5', '#bfe3f5'); const g = ctx.createLinearGradient(0, 0, 0, 50); g.addColorStop(0, '#4fa3d1'); g.addColorStop(1, '#2a6d9e'); ctx.fillStyle = g; ctx.fillRect(-50, 4, 100, 46);
    ctx.strokeStyle = '#ffffff'; ctx.globalAlpha = 0.9; ctx.lineWidth = 1.6;
    for (let i = 0; i < 7; i++) { const k = (t * 0.9 + i / 7) % 1, a = -Math.PI / 2 + (i - 3) * 0.25; ctx.beginPath(); ctx.arc(-4 + Math.cos(a) * 26 * k, -12 + Math.sin(a) * 30 * k + 20 * k * k, 1.5, 0, TAU); ctx.stroke(); }
    ctx.globalAlpha = 1; ctx.strokeStyle = '#22385e'; ctx.lineWidth = 1.4;
    const y = Math.sin(t * 1.2) * 1.5;
    poly([[26, 6 + y], [42, -6 + y], [38, 6 + y], [44, 14 + y]], '#4a6fa5');
    blob(-6, 10 + y, 32, 16, '#4a6fa5'); blob(-8, 18 + y, 24, 7, '#c9dcf0');
    blob(-24, 4 + y, 2, 2, '#1d2638');
    ctx.beginPath(); ctx.arc(-26, 12 + y, 6, 0.3, 1.4); ctx.stroke();
  }],
  ['le moulin', t => {
    sky('#9fd0ee', '#f2f7e6'); cloud(26, -36, 0.8);
    ctx.strokeStyle = '#5d7a2f'; ctx.lineWidth = 1.2; blob(0, 70, 80, 40, '#e2c95a');
    ctx.strokeStyle = '#3a2f26'; ctx.lineWidth = 1.4;
    poly([[-12, 34], [-8, -8], [8, -8], [12, 34]], '#efe3c4'); poly([[-11, -7], [0, -20], [11, -7]], '#c8473f');
    ctx.fillStyle = '#6a4a30'; ctx.fillRect(-3, 22, 6, 12);
    ctx.save(); ctx.translate(0, -12); ctx.rotate(t * 0.9);
    for (let k = 0; k < 4; k++) { ctx.rotate(Math.PI / 2); poly([[2, -1], [36, -1], [36, 8], [6, 8]], 'rgba(250,246,232,0.95)'); ctx.beginPath(); for (let x = 10; x < 36; x += 6) { ctx.moveTo(x, -1); ctx.lineTo(x, 8); } ctx.stroke(); }
    ctx.restore(); blob(0, -12, 2.5, 2.5, '#3a2f26');
  }],
  ['le cerf-volant', t => {
    sky('#66b3e6', '#d6eefa'); cloud(-30, 18, 1); cloud(28, -38, 0.7);
    ctx.strokeStyle = '#4d7a2c'; ctx.lineWidth = 1.2; blob(0, 72, 80, 32, '#7fbf55');
    const sx = 12 + Math.sin(t * 1.4) * 6, sy = -24 + Math.cos(t * 1.1) * 3, r = Math.sin(t * 1.4) * 0.2;
    ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(sx, sy + 16); ctx.quadraticCurveTo(0, 20, -36, 46); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(sx, sy + 16); for (let k = 1; k <= 5; k++) ctx.lineTo(sx + Math.sin(t * 3 + k) * 4 - k * 2, sy + 16 + k * 6); ctx.stroke();
    for (let k = 1; k <= 4; k++) { const bx = sx + Math.sin(t * 3 + k) * 4 - k * 2, by = sy + 16 + k * 6; ctx.fillStyle = k % 2 ? '#e0514a' : '#f6c84a'; ctx.fillRect(bx - 2.5, by - 1.5, 5, 3); }
    ctx.save(); ctx.translate(sx, sy); ctx.rotate(r); ctx.lineWidth = 1.3; ctx.strokeStyle = '#2a2a33';
    poly([[0, -16], [0, 0], [-11, 0]], '#e0514a'); poly([[0, -16], [11, 0], [0, 0]], '#f6c84a'); poly([[-11, 0], [0, 0], [0, 16]], '#3d6cb5'); poly([[11, 0], [0, 16], [0, 0]], '#5cb85c');
    ctx.restore();
  }],
  ['la fusée de papier', t => {
    sky('#1b1640', '#3f2f7a'); starsAt(3, 20); ctx.strokeStyle = 'transparent'; blob(-28, -28, 9, 9, '#f6e9b0'); blob(-24, -31, 8, 8, '#2a2160');
    const y = Math.sin(t * 1.6) * 2;
    ctx.save(); ctx.translate(10, y); ctx.rotate(0.35);
    const f = 10 + Math.sin(t * 20) * 3; poly([[-5, 22], [0, 22 + f], [5, 22]], '#f6a93a'); poly([[-3, 22], [0, 18 + f * 0.7], [3, 22]], '#ffe36e');
    ctx.strokeStyle = '#2a2a33'; ctx.lineWidth = 1.3;
    poly([[-8, 14], [-15, 24], [-7, 22]], '#d8453f'); poly([[8, 14], [15, 24], [7, 22]], '#d8453f');
    poly([[0, -28], [8, -12], [8, 22], [-8, 22], [-8, -12]], '#fbf7ee');
    ctx.strokeStyle = 'rgba(120,130,190,0.6)'; ctx.lineWidth = 0.7; ctx.beginPath(); for (let k = -6; k < 22; k += 5) { ctx.moveTo(-8, k); ctx.lineTo(8, k); } ctx.stroke();
    ctx.strokeStyle = '#2a2a33'; ctx.lineWidth = 1.3; blob(0, -6, 4.5, 4.5, '#8fd3f0');
    ctx.restore();
  }],
  ['l’escargot et la fraise', t => {
    sky('#e7f3d2', '#b9dc8e'); ctx.strokeStyle = '#4a7a2a'; ctx.lineWidth = 1.2;
    for (let k = 0; k < 9; k++) { const x = -48 + k * 12; ctx.beginPath(); ctx.moveTo(x, 50); ctx.quadraticCurveTo(x + 3, 30, x + Math.sin(t + k) * 3, 22 + (k % 3) * 4); ctx.stroke(); }
    ctx.strokeStyle = '#7a2a28'; ctx.lineWidth = 1.4;
    poly([[8, -20], [34, -14], [30, 16], [20, 28], [8, 16], [4, -8]], '#e0453f');
    ctx.fillStyle = '#ffe9a0'; for (let k = 0; k < 9; k++) ctx.fillRect(10 + (k % 3) * 7, -10 + Math.floor(k / 3) * 9 + (k % 2) * 2, 1.6, 2.4);
    ctx.strokeStyle = '#2f5a1e'; poly([[6, -20], [18, -30], [20, -20], [34, -26], [32, -14]], '#4f9a3a');
    ctx.strokeStyle = '#4a3020'; ctx.lineWidth = 1.3;
    const x = -24 + Math.sin(t * 0.4) * 2;
    blob(x + 4, 30, 22, 5, '#d9c08a');
    ctx.beginPath(); ctx.moveTo(x + 18, 27); ctx.lineTo(x + 22, 16); ctx.moveTo(x + 22, 27); ctx.lineTo(x + 28, 18); ctx.stroke();
    blob(x + 22, 15, 1.5, 1.5, '#4a3020'); blob(x + 28, 17, 1.5, 1.5, '#4a3020');
    blob(x, 16, 14, 14, '#d48a3a'); ctx.beginPath(); for (let a = 0; a < 12; a += 0.2) ctx.lineTo(x + Math.cos(a) * a * 1.1, 16 + Math.sin(a) * a * 1.1); ctx.stroke();
  }],
  ['le voilier', t => {
    sky('#8fd0f2', '#e6f5fb'); ctx.strokeStyle = 'transparent'; blob(30, -32, 9, 9, '#ffd45a');
    ctx.strokeStyle = '#3a3a40'; ctx.lineWidth = 1; ctx.beginPath(); [[-30, -30], [-16, -36], [8, -26]].forEach(([x, y], i) => { const f = Math.sin(t * 4 + i) * 2; ctx.moveTo(x - 4, y + f); ctx.quadraticCurveTo(x - 2, y - 2, x, y); ctx.quadraticCurveTo(x + 2, y - 2, x + 4, y + f); }); ctx.stroke();
    const rk = Math.sin(t * 1.3) * 0.06;
    ctx.save(); ctx.translate(0, 16); ctx.rotate(rk); ctx.strokeStyle = '#2a2a33'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(0, 2); ctx.lineTo(0, -46); ctx.stroke();
    poly([[2, -44], [26, 0], [2, 0]], '#fbf7ee'); poly([[-2, -36], [-2, 0], [-20, 0]], '#f2ead6');
    poly([[-26, 2], [28, 2], [20, 12], [-20, 12]], '#c8423f');
    ctx.restore();
    ctx.fillStyle = '#3c8bc4'; ctx.fillRect(-50, 26, 100, 24);
    ctx.strokeStyle = '#d7eefb'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let k = 0; k < 3; k++) { const yy = 30 + k * 7, o = (t * 6 + k * 7) % 14; for (let x = -56 + o; x < 50; x += 14) { ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + 3.5, yy - 2.5, x + 7, yy); } } ctx.stroke();
  }],
  ['le hérisson et la pomme', t => {
    sky('#f6d9a6', '#e9a65c'); ctx.strokeStyle = 'transparent';
    for (let k = 0; k < 5; k++) { const x = -40 + k * 21 + Math.sin(t * 0.8 + k) * 6, y = ((t * 9 + k * 23) % 110) - 55; ctx.save(); ctx.translate(x, y); ctx.rotate(t + k); blob(0, 0, 4, 2, k % 2 ? '#d8573a' : '#e9a23a'); ctx.restore(); }
    ctx.fillStyle = '#9a6a3a'; ctx.fillRect(-50, 28, 100, 22);
    ctx.strokeStyle = '#3a2618'; ctx.lineWidth = 1.3;
    const sp = []; for (let k = 0; k <= 14; k++) { const a = Math.PI + k * Math.PI / 14, r = k % 2 ? 22 : 30; sp.push([-4 + Math.cos(a) * r, 26 + Math.sin(a) * r * 0.8]); }
    poly(sp, '#6b4a2e');
    poly([[18, 14], [32, 22], [18, 28]], '#d8b58a'); blob(32, 22, 1.8, 1.8, '#20150c'); blob(22, 17, 1.4, 1.4, '#20150c');
    blob(-4, -2 + Math.sin(t * 2) * 0.8, 8, 7.5, '#d8453f'); ctx.beginPath(); ctx.moveTo(-4, -9); ctx.lineTo(-3, -14); ctx.stroke(); blob(0, -13, 3, 1.6, '#5a9a3a', -0.4);
  }],
  ['l’arc-en-ciel', t => {
    sky('#8fb3d8', '#e8f1f8');
    const cols = ['#e0514a', '#f0943a', '#f6d24a', '#6cc06a', '#4a8fd8', '#7b5ea7'];
    ctx.lineWidth = 4.2; cols.forEach((c, i) => { ctx.strokeStyle = c; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(0, 40, 44 - i * 4, Math.PI, TAU); ctx.stroke(); }); ctx.globalAlpha = 1;
    cloud(-38, 38, 1.3); cloud(40, 38, 1.3); cloud(-6, -36, 0.7 + 0.05 * Math.sin(t));
    ctx.strokeStyle = 'rgba(90,120,170,0.55)'; ctx.lineWidth = 0.9; ctx.beginPath(); for (let k = 0; k < 10; k++) { const x = -45 + k * 10, y = ((t * 40 + k * 17) % 30) - 50; ctx.moveTo(x, y); ctx.lineTo(x - 1.5, y + 5); } ctx.stroke();
  }]
];

/* ----- la mémoire : le total des bons points, gardé sur ce navigateur ----- */
G.bonsPoints = 0; G.bpSeen = null; G.bpToasts = []; G.imgToasts = []; G.bpRun = 0; G.newImages = 0;
if (!CAPTURE) {
  try { const n = parseInt(localStorage.getItem(BONS.key) || '0', 10); if (Number.isFinite(n) && n > 0) G.bonsPoints = Math.min(n, 99999); } catch (e) { G.bonsPoints = 0; }
}
function saveBonsPoints() {
  if (CAPTURE) return;
  try { localStorage.setItem(BONS.key, String(G.bonsPoints)); } catch (e) { /* rien */ }
}
const imageCount = () => Math.min(IMAGES.length, Math.floor(G.bonsPoints / BONS.per));
const bonsVersImage = () => BONS.per - G.bonsPoints % BONS.per;

function giveBonsPoints(n, label) {
  const before = imageCount();
  G.bonsPoints += n; G.bpRun = (G.bpRun || 0) + n;
  const last = G.bpToasts[G.bpToasts.length - 1];
  if (last && last.label === label && last.t < 0.4) last.n += n; else G.bpToasts.push({ n, label, t: 0 });
  AU.play('bonpoint');
  for (let k = before; k < imageCount(); k++) { G.imgToasts.push({ i: k, t: 0 }); G.newImages++; }
  if (imageCount() > before) { AU.play('image'); caption(imageCount() === IMAGES.length ? 'Dix bons points : la dernière image ! La collection est complète.' : 'Dix bons points font une image : « ' + IMAGES[imageCount() - 1][0] + ' » !', 3.4, 'green'); }
  saveBonsPoints();
}
// À chaque image du jeu : les compteurs qui ont grimpé pendant qu'on jouait rapportent des bons points
function stepBonsPoints(dt) {
  const vals = BON_SOURCES.map(b => b[0]());
  const live = (G.state === 'play' || G.state === 'levelup') && !(G.demo && !CAPTURE);
  if (G.bpSeen && live) vals.forEach((v, i) => { const d = v - G.bpSeen[i]; if (d > 0 && d < 50) giveBonsPoints(d * BON_SOURCES[i][1], BON_SOURCES[i][2]); });
  G.bpSeen = vals;
  if (G.state === 'play' || G.state === 'victory' || G.state === 'gameover') {
    if (G.imgToasts.length) { G.imgToasts[0].t += dt; if (G.imgToasts[0].t >= BONS.imgToast) G.imgToasts.shift(); }
    else if (G.bpToasts.length) { G.bpToasts[0].t += dt * (G.bpToasts.length > 2 ? 2 : 1); if (G.bpToasts[0].t >= BONS.toast) G.bpToasts.shift(); }
  }
}

/* ----- dessin ----- */
function drawStar(x, y, r, fill, stroke) {
  ctx.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.48 : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } ctx.closePath();
  ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(1, r * 0.12); ctx.stroke();
}
// une image (carte bordée d'or) centrée en (cx, cy), de largeur w ; owned = déjà gagnée
function drawImageCard(i, cx, cy, w, owned, rot = 0) {
  const s = U, m = w * 0.07, pw = w - 2 * m, h = pw + m + w * 0.26;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  ctx.shadowColor = 'rgba(40,40,30,0.25)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
  ctx.fillStyle = owned ? '#fffaf0' : '#efe9d8'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = owned ? C.gold : 'rgba(201,146,27,0.35)'; ctx.lineWidth = Math.max(1.5, w * 0.012);
  ctx.strokeRect(-w / 2 + m * 0.35, -h / 2 + m * 0.35, w - m * 0.7, h - m * 0.7);
  const px = -pw / 2, py = -h / 2 + m;
  if (owned) {
    ctx.save(); ctx.beginPath(); ctx.rect(px, py, pw, pw); ctx.clip();
    ctx.translate(0, py + pw / 2); ctx.scale(pw / 100, pw / 100); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    try { IMAGES[i][1](G.time + i * 1.7); } finally { ctx.restore(); }
    ctx.strokeStyle = C.gold; ctx.lineWidth = Math.max(1, w * 0.01); ctx.strokeRect(px, py, pw, pw);
  } else {   // le dos de l'image : un losange doré et un point d'interrogation
    ctx.save(); ctx.beginPath(); ctx.rect(px, py, pw, pw); ctx.clip();
    ctx.strokeStyle = 'rgba(201,146,27,0.3)'; ctx.lineWidth = 1;
    ctx.beginPath(); for (let k = -6; k <= 6; k++) { ctx.moveTo(px + pw / 2 + k * pw / 8 - pw / 2, py); ctx.lineTo(px + pw / 2 + k * pw / 8 + pw / 2, py + pw); ctx.moveTo(px + pw / 2 + k * pw / 8 + pw / 2, py); ctx.lineTo(px + pw / 2 + k * pw / 8 - pw / 2, py + pw); } ctx.stroke(); ctx.restore();
    txt('?', 0, py + pw / 2 + 4 * s, pw * 0.5, { color: C.gold, alpha: 0.5 });
  }
  const name = owned ? IMAGES[i][0] : 'image n° ' + (i + 1);
  txt(name, 0, py + pw + (h / 2 - (py + pw)) * 0.5, Math.min(w * 0.12, w * 2.1 / Math.max(8, name.length)), { color: owned ? C.ink : C.pencil, weight: owned ? 700 : 400 });
  ctx.restore();
}
// la page des images, au bout du bestiaire (les cases viennent de bestLayout)
function drawImagesPage(L, fk) {
  const s = U, got = imageCount();
  IMAGES.forEach((im, i) => {
    const c = L.cells[i], w = Math.min(c.w * 0.86, (c.h - 8 * s) / 1.2);
    ctx.save(); ctx.globalAlpha = fk;
    drawImageCard(i, c.x + c.w / 2, c.y + c.h / 2, w, i < got, ((i * 41) % 7 - 3) * 0.015);
    if (i === got && got < IMAGES.length) txt('encore ' + bonsVersImage() + ' bon' + (bonsVersImage() > 1 ? 's' : '') + ' point' + (bonsVersImage() > 1 ? 's' : ''), c.x + c.w / 2, c.y + c.h / 2, Math.min(18 * s, c.w / 9), { color: C.red, hl: C.hl });
    ctx.restore();
  });
}
// la jauge des dix bons points : dix étoiles, les gagnées en or
function drawBonsGauge(x, y, k, alpha = 1) {
  const s = U * k, cur = G.bonsPoints % BONS.per;
  ctx.save(); ctx.globalAlpha = alpha;
  for (let j = 0; j < BONS.per; j++) drawStar(x + (j - (BONS.per - 1) / 2) * 17 * s, y, 7 * s, j < cur ? 'rgba(240,200,90,0.95)' : 'rgba(253,252,246,0.9)', j < cur ? C.gold : 'rgba(109,109,116,0.45)');
  ctx.restore();
}
// les toasts : « + 1 bon point » qui glisse depuis la droite, ou une image gagnée, plus grande
function drawBonsToast() {
  const s = U;
  if (G.imgToasts.length) {
    const q = G.imgToasts[0], k = Math.min(ease(q.t * 2.5), ease((BONS.imgToast - q.t) * 3)), w = Math.min(190 * s, W * 0.3);
    const x = W - SAFE.r - 24 * s - w / 2 + (1 - k) * (w + 60 * s), y = H * 0.42;
    ctx.save(); ctx.translate(x, y);
    const glow = 0.5 + 0.5 * Math.sin(G.time * 5);
    ctx.globalAlpha = 0.35 * glow * k; for (let j = 0; j < 12; j++) { const a = j * TAU / 12 + G.time * 0.6; ctx.strokeStyle = C.gold; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.moveTo(Math.cos(a) * w * 0.55, Math.sin(a) * w * 0.65); ctx.lineTo(Math.cos(a) * w * 0.8, Math.sin(a) * w * 0.9); ctx.stroke(); }
    ctx.globalAlpha = 1;
    txt('Une image !', 0, -w * 0.74, Math.min(30 * s, w / 5), { font: FONT_CURSIVE, weight: 400, color: C.red, hl: C.hl });
    drawImageCard(q.i, 0, 0, w, true, 0.05 * Math.sin(q.t * 2));
    ctx.restore();
    drawTape(x, y - w * 0.6, 54 * s, -0.06);
    return;
  }
  const q = G.bpToasts[0]; if (!q) return;
  const k = Math.min(ease(q.t * 4), ease((BONS.toast - q.t) * 4)), w = 210 * s, h = 70 * s;
  const x = W - SAFE.r - 16 * s - w + (1 - k) * (w + 40 * s), y = H * 0.36;
  ctx.save(); ctx.translate(x, y); ctx.rotate(0.03);
  ctx.shadowColor = 'rgba(40,40,30,0.25)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#fffaf0'; ctx.fillRect(0, 0, w, h); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = C.gold; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]); ctx.strokeRect(4, 4, w - 8, h - 8); ctx.setLineDash([]);
  const pop = 1 + 0.25 * Math.max(0, 1 - q.t * 4);
  drawStar(34 * s, h / 2, 20 * s * pop, 'rgba(240,200,90,0.95)', C.gold);
  txt('+ ' + q.n + ' bon' + (q.n > 1 ? 's' : '') + ' point' + (q.n > 1 ? 's' : ''), 62 * s, h * 0.36, 22 * s, { color: C.ink, align: 'left' });
  txt(q.label, 62 * s, h * 0.7, 17 * s, { color: C.graphite, align: 'left', weight: 400 });
  ctx.restore();
  drawBonsGauge(x + w / 2, y + h + 14 * s, 0.9, k);
}
