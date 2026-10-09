// Rendu : page, ratures, joueur, interface, écrans de titre, de choix et de fin.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

/* ===================== Rendu ===================== */
function txt(s, x, y, size, o = {}) {
  ctx.save();
  ctx.font = (o.weight || 700) + ' ' + size + 'px ' + (o.font || FONT_MAIN);
  ctx.textAlign = o.align || 'center'; ctx.textBaseline = o.base || 'middle';
  ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
  if (o.rot) { ctx.translate(x, y); ctx.rotate(o.rot); x = 0; y = 0; }
  if (o.hl) { const w = ctx.measureText(s).width, a = ctx.textAlign === 'center' ? -w / 2 : ctx.textAlign === 'right' ? -w : 0; drawHighlight(x + a - size * 0.25, y - size * 0.32, w + size * 0.5, size * 0.72, o.hl); }
  ctx.fillStyle = o.color || C.ink; ctx.fillText(s, x, y);
  ctx.restore();
}
// le surligneur : l'accent visuel unique du jeu
function drawHighlight(x, y, w, h, color = C.hl) {
  ctx.save(); ctx.fillStyle = color; ctx.globalAlpha *= 0.95;
  ctx.beginPath(); ctx.moveTo(x + 4, y + 2); ctx.lineTo(x + w, y - 1); ctx.lineTo(x + w - 3, y + h + 1); ctx.lineTo(x, y + h - 1); ctx.closePath(); ctx.fill();
  ctx.restore();
}
function viewRect() { const vw = W / ZOOM, vh = H / ZOOM; return { x0: G.cam.x - vw / 2, y0: G.cam.y - vh / 2, x1: G.cam.x + vw / 2, y1: G.cam.y + vh / 2 }; }

function drawPage(v) {
  // hors-page : le non-écrit
  ctx.fillStyle = unwrittenPattern; ctx.fillRect(v.x0 - 10, v.y0 - 10, v.x1 - v.x0 + 20, v.y1 - v.y0 + 20);
  // la page
  ctx.save();
  ctx.shadowColor = 'rgba(60,55,40,0.22)'; ctx.shadowBlur = 24 * ZOOM; ctx.shadowOffsetY = 6 * ZOOM;
  ctx.fillStyle = C.paper; ctx.fillRect(0, 0, WORLD.w, WORLD.h);
  ctx.restore();
  ctx.fillStyle = paperPattern; ctx.fillRect(Math.max(0, v.x0), Math.max(0, v.y0), Math.min(WORLD.w, v.x1) - Math.max(0, v.x0), Math.min(WORLD.h, v.y1) - Math.max(0, v.y0));
  // réglure Seyès
  const lw = 1 / ZOOM;
  const xa = Math.max(0, Math.floor(v.x0 / SQ) * SQ), xb = Math.min(WORLD.w, v.x1), ya = Math.max(0, Math.floor(v.y0 / 16) * 16), yb = Math.min(WORLD.h, v.y1);
  ctx.lineWidth = lw;
  ctx.strokeStyle = C.ruleMinor; ctx.beginPath();
  for (let y = ya; y <= yb; y += 16) if (y % SQ) { ctx.moveTo(Math.max(0, v.x0), y); ctx.lineTo(Math.min(WORLD.w, v.x1), y); }
  ctx.stroke();
  ctx.strokeStyle = C.rule; ctx.lineWidth = lw * 1.4; ctx.beginPath();
  for (let y = Math.ceil(ya / SQ) * SQ; y <= yb; y += SQ) { ctx.moveTo(Math.max(0, v.x0), y); ctx.lineTo(Math.min(WORLD.w, v.x1), y); }
  for (let x = xa; x <= xb; x += SQ) { ctx.moveTo(x, Math.max(0, v.y0)); ctx.lineTo(x, Math.min(WORLD.h, v.y1)); }
  ctx.stroke();
  ctx.strokeStyle = C.margin; ctx.lineWidth = 2.2 / ZOOM; ctx.beginPath(); ctx.moveTo(MARGIN_X, 0); ctx.lineTo(MARGIN_X, WORLD.h); ctx.stroke();
  // bord crayonné
  ctx.save(); ctx.strokeStyle = C.pencil; ctx.globalAlpha = 0.55; ctx.lineWidth = 1.6; ctx.setLineDash([14, 9]);
  ctx.strokeRect(-6, -6, WORLD.w + 12, WORLD.h + 12); ctx.restore();
  // notes dans le non-écrit
  for (const n of UNWRITTEN_NOTES) if (n.x > v.x0 - 400 && n.x < v.x1 + 400 && n.y > v.y0 - 100 && n.y < v.y1 + 100) txt(n.t, n.x, n.y, 34, { color: C.pencil, weight: 400, rot: n.r, alpha: 0.75 });
  // taches persistantes
  const sx0 = Math.max(0, v.x0), sy0 = Math.max(0, v.y0), sx1 = Math.min(WORLD.w, v.x1), sy1 = Math.min(WORLD.h, v.y1);
  if (sx1 > sx0 && sy1 > sy0) ctx.drawImage(stain, sx0 * STAIN_S, sy0 * STAIN_S, (sx1 - sx0) * STAIN_S, (sy1 - sy0) * STAIN_S, sx0, sy0, sx1 - sx0, sy1 - sy0);
}

function drawEnemy(e) {
  const fr = boilFrame(G.time, e.boilOff);
  ctx.save(); ctx.translate(e.x, e.y);
  const fl = e.flash > 0;
  if (e.type === 'gribouillis' || e.type === 'gouttelette') {
    ctx.rotate(e.rot);
    ctx.strokeStyle = fl ? C.red : C.graphite; ctx.lineWidth = e.type === 'gouttelette' ? 2 : 2.4; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke(SHAPES[e.type][e.shape % SHAPES[e.type].length][fr]);
  } else if (e.type === 'biffure') {
    if (e.phase === 'aim') { ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.35 + 0.3 * Math.sin(G.time * 30); ctx.setLineDash([10, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(e.cx * 260, e.cy * 260); ctx.stroke(); ctx.restore(); ctx.translate(rnd(-2, 2), rnd(-2, 2)); }
    ctx.rotate(e.rot);
    ctx.strokeStyle = fl ? C.red : C.graphite; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke(SHAPES.biffure[e.shape % SHAPES.biffure.length][fr]);
    ctx.lineWidth = 4.2; ctx.beginPath(); ctx.moveTo(-25, (fr - 1) * 1.5); ctx.lineTo(25, -(fr - 1) * 1.5); ctx.stroke();
  } else if (e.type === 'tache') {
    ctx.rotate(e.rot);
    const s = e.r / 24; ctx.scale(s, s);
    ctx.fillStyle = fl ? 'rgba(200,66,74,0.55)' : 'rgba(46,46,51,0.82)'; ctx.fill(SHAPES.tache[e.shape % SHAPES.tache.length][fr]);
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.5; ctx.stroke(SHAPES.tache[e.shape % SHAPES.tache.length][fr]);
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.ellipse(-6, -8, 5, 3, -0.5, 0, TAU); ctx.fill();
  } else if (e.type === 'gomme') {
    ctx.rotate(e.rot); const j = (fr - 1) * 0.8;
    ctx.fillStyle = fl ? '#ffd0d4' : C.eraser; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    roundRect(-26 + j, -16, 52, 32, 7); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.eraserSleeve; roundRect(-4, -17 - j, 32, 34, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.7)'; ctx.font = '700 13px ' + FONT_MAIN; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('GOMME', 12, 1);
  } else if (e.type === 'boss') {
    if (e.phase === 'aim') { ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.4; ctx.setLineDash([16, 10]); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(e.cx * 420, e.cy * 420); ctx.stroke(); ctx.restore(); }
    const pulse = 1 + Math.sin(G.time * 5) * 0.03;
    ctx.save(); ctx.rotate(e.rot); ctx.scale(pulse, pulse);
    ctx.strokeStyle = fl ? '#ff9aa0' : C.red; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.stroke(SHAPES.boss[0][fr]);
    ctx.globalAlpha = 0.5; ctx.lineWidth = 2.2; ctx.rotate(1.7); ctx.stroke(SHAPES.boss[1][(fr + 1) % 3]);
    ctx.restore();
    // l'œil
    const ex = Math.cos(Math.atan2(G.p.y - e.y, G.p.x - e.x)) * 7, ey = Math.sin(Math.atan2(G.p.y - e.y, G.p.x - e.x)) * 7;
    ctx.fillStyle = C.paper; ctx.beginPath(); ctx.ellipse(0, 0, 19, 13, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(ex, ey, 6.5, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

function drawPlayer() {
  const p = G.p; if (!p) return;
  if (p.inv > 0 && G.state === 'play' && Math.floor(G.time * 16) % 2 === 0 && p.dashT <= 0) return;
  const r = p.r, st = 1 + p.squash * 0.35;
  ctx.save(); ctx.translate(p.x, p.y);
  // jauge de pâté
  if (p.dashCd > 0) { ctx.strokeStyle = 'rgba(29,58,138,0.35)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(0, 0, r + 9, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - p.dashCd / G.S.dashCd)); ctx.stroke(); }
  ctx.save(); ctx.rotate(p.face); ctx.scale(st, 1 / Math.sqrt(st));
  ctx.beginPath(); ctx.moveTo(-r * 2.15, 0);
  ctx.bezierCurveTo(-r * 1.25, -r * 0.35, -r * 0.95, -r, 0, -r);
  ctx.arc(0, 0, r, -Math.PI / 2, Math.PI / 2);
  ctx.bezierCurveTo(-r * 0.95, r, -r * 1.25, r * 0.35, -r * 2.15, 0);
  ctx.fillStyle = C.ink; ctx.fill();
  ctx.strokeStyle = C.inkDeep; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.restore();
  // reflet + yeux
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(-r * 0.25, -r * 0.45, r * 0.32, r * 0.18, -0.5, 0, TAU); ctx.fill();
  const la = G.enemies && G.enemies.length ? p.look : p.face, lx = Math.cos(la) * 2.2, ly = Math.sin(la) * 2.2;
  const blink = Math.floor(G.time * 10) % 37 === 0 ? 0.2 : 1;
  for (const s of [-1, 1]) {
    const ex = Math.cos(la) * 4 + Math.cos(la + Math.PI / 2) * s * 4.6, ey = Math.sin(la) * 4 + Math.sin(la + Math.PI / 2) * s * 4.6;
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(ex, ey, 3.4, 3.8 * blink, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(ex + lx * 0.6, ey + ly * 0.6, 1.7 * blink, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

function drawWorld() {
  const v = viewRect();
  ctx.save();
  const sh = G.cam.shake;
  ctx.translate(W / 2 + (sh ? rnd(-sh, sh) : 0), H / 2 + (sh ? rnd(-sh, sh) : 0));
  ctx.scale(ZOOM, ZOOM); ctx.translate(-G.cam.x, -G.cam.y);
  drawPage(v);
  const inView = (x, y, m = 80) => x > v.x0 - m && x < v.x1 + m && y > v.y0 - m && y < v.y1 + m;
  if (G.state === 'title') { for (const d of G.deco) if (inView(d.x, d.y)) drawEnemy(d); ctx.restore(); return; }
  // flaques
  for (const pd of G.puddles) { ctx.globalAlpha = 0.28 * Math.min(1, pd.life / pd.max * 2); ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(pd.x, pd.y, pd.r * (0.85 + 0.15 * Math.sin(pd.life * 6)), 0, TAU); ctx.fill(); }
  ctx.globalAlpha = 1;
  // points en chute (ombre)
  for (const pt of G.points) if (!pt.done) { const k = pt.t / pt.fall; ctx.fillStyle = 'rgba(18,39,95,' + (0.1 + 0.25 * k) + ')'; ctx.beginPath(); ctx.ellipse(pt.x, pt.y, pt.r * (0.3 + 0.7 * k), pt.r * (0.3 + 0.7 * k) * 0.8, 0, 0, TAU); ctx.fill(); }
  // lettres
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const it of G.items) {
    if (!inView(it.x, it.y)) continue;
    const bob = Math.sin(it.t * 4) * 2, sz = it.rare ? 30 : 24;
    ctx.save(); ctx.translate(it.x, it.y + bob); ctx.rotate(it.rot);
    if (it.ch === G.dicteeWord[G.dicteeProg]) drawHighlight(-13, -10, 26, 20, C.hl);
    if (it.rare) drawHighlight(-14, -11, 28, 22, C.hlPink);
    ctx.font = '700 ' + sz + 'px ' + FONT_MAIN; ctx.fillStyle = it.rare ? C.gold : C.ink; ctx.fillText(it.ch, 0, 1);
    ctx.restore();
  }
  // ennemis
  for (const e of G.enemies) if (inView(e.x, e.y, e.r + 300)) drawEnemy(e);
  // lunes
  if (G.S && G.S.moons) {
    const R = 74 + 6 * G.S.moons;
    for (let i = 0; i < G.S.moons; i++) {
      const a = G.moonA + i / G.S.moons * TAU, mx = G.p.x + Math.cos(a) * R, my = G.p.y + Math.sin(a) * R;
      ctx.strokeStyle = 'rgba(29,58,138,0.18)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(G.p.x, G.p.y, R, a - 0.5, a); ctx.stroke();
      ctx.font = '700 34px ' + FONT_MAIN; ctx.fillStyle = C.ink; ctx.fillText('o', mx, my - 3);
    }
  }
  // gouttes
  ctx.lineCap = 'round';
  for (const s of G.shots) {
    ctx.strokeStyle = 'rgba(29,58,138,0.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(s.x - s.vx * 0.03, s.y - s.vy * 0.03); ctx.lineTo(s.x, s.y); ctx.stroke();
    ctx.fillStyle = G.S.burn ? '#2b4fb5' : C.ink; ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, TAU); ctx.fill();
    if (G.S.burn) { ctx.fillStyle = C.fire; ctx.beginPath(); ctx.arc(s.x, s.y, s.r * 0.45, 0, TAU); ctx.fill(); }
  }
  // traits rouges du boss
  ctx.strokeStyle = C.red; ctx.lineWidth = 4;
  for (const b of G.ebul) { const n = Math.hypot(b.vx, b.vy) || 1; ctx.beginPath(); ctx.moveTo(b.x - b.vx / n * 9, b.y - b.vy / n * 9); ctx.lineTo(b.x + b.vx / n * 9, b.y + b.vy / n * 9); ctx.stroke(); }
  drawPlayer();
  // points qui tombent
  for (const pt of G.points) {
    if (pt.done) { const k = (pt.t - pt.fall) / 0.6; ctx.strokeStyle = 'rgba(18,39,95,' + (1 - k) + ')'; ctx.lineWidth = 6 * (1 - k) + 1; ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r * ease(k), 0, TAU); ctx.stroke(); continue; }
    const k = pt.t / pt.fall, h = (1 - k) * 420; ctx.fillStyle = C.inkDeep; ctx.beginPath(); ctx.arc(pt.x, pt.y - h, pt.r * 0.32, 0, TAU); ctx.fill();
  }
  // particules
  for (const q of G.parts) { ctx.globalAlpha = Math.min(1, q.life / q.max * 1.5); ctx.fillStyle = q.color; ctx.fillRect(q.x - q.size / 2, q.y - q.size / 2, q.size, q.size); }
  ctx.globalAlpha = 1;
  for (const t of G.texts) txt(t.text, t.x, t.y - t.t * 40, t.size, { color: t.color, alpha: 1 - t.t / t.dur, hl: C.hl });
  ctx.restore();
}

function drawStamp(x, y, s) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-0.09); ctx.globalAlpha = 0.86;
  ctx.strokeStyle = C.red; ctx.lineWidth = 2.5 * s; roundRect(-78 * s, -27 * s, 156 * s, 54 * s, 8 * s); ctx.stroke();
  ctx.lineWidth = 1 * s; roundRect(-72 * s, -21 * s, 144 * s, 42 * s, 5 * s); ctx.stroke();
  ctx.fillStyle = C.red; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = '700 ' + (22 * s) + 'px ' + FONT_MAIN; ctx.fillText('itération n° ' + GAME_META.iteration, 0, -4 * s);
  ctx.font = '400 ' + (15 * s) + 'px ' + FONT_MAIN; ctx.fillText(frDate(GAME_META.date), 0, 13 * s);
  ctx.restore();
}
function frDate(iso) { const m = ['janv.', 'févr.', 'mars', 'avril', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']; const [y, mo, d] = iso.split('-').map(Number); return d + ' ' + m[mo - 1] + ' ' + y; }
function mmss(t) { t = Math.max(0, Math.floor(t)); return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); }

function drawHUD() {
  const p = G.p, s = U, top = SAFE.t + 14 * s, left = SAFE.l + 18 * s, right = W - SAFE.r - 18 * s, bottom = H - SAFE.b - 14 * s;
  // cœurs = gouttes
  for (let i = 0; i < p.maxHp; i++) {
    const x = left + 14 * s + i * 30 * s, y = top + 18 * s, full = i < p.hp;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(-Math.PI / 2);
    ctx.beginPath(); ctx.moveTo(-20, 0); ctx.bezierCurveTo(-12, -3, -9, -10, 0, -10); ctx.arc(0, 0, 10, -Math.PI / 2, Math.PI / 2); ctx.bezierCurveTo(-9, 10, -12, 3, -20, 0);
    if (full) { ctx.fillStyle = C.ink; ctx.fill(); } ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.stroke();
    ctx.restore();
  }
  txt('niveau ' + G.level, left, top + 54 * s, 24 * s, { align: 'left', color: C.graphite });
  // chapitre + chrono
  txt('Chapitre ' + GAME_META.chapter + (G.endless ? ' · page libre' : ''), W / 2, top + 12 * s, 22 * s, { color: C.graphite, weight: 400 });
  txt(mmss(G.t), W / 2, top + 42 * s, 38 * s, { color: C.ink });
  // barre du boss
  if (G.boss) {
    const bw = Math.min(520 * s, W - 220 * s), bx = W / 2 - bw / 2, by = top + 72 * s, k = clamp(G.boss.hp / G.boss.maxHp, 0, 1);
    txt('La Grande Rature', W / 2, by - 2 * s, 21 * s, { color: C.red });
    ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.strokeRect(bx, by + 12 * s, bw, 12 * s);
    ctx.fillStyle = 'rgba(200,66,74,0.75)'; ctx.fillRect(bx + 2, by + 14 * s, (bw - 4) * k, 12 * s - 4); ctx.restore();
  }
  // tampon d'itération
  const compact = G.input.touch && !G.demo;
  if (compact) drawStamp(right - 62 * s, top + 92 * s, s * 0.78); else drawStamp(right - 80 * s, top + 30 * s, s);
  // mots acquis
  let y = top + (compact ? 136 : 84) * s;
  for (const k of G.motOrder) {
    txt(MOTS[k].label, right - 4 * s, y, 21 * s, { align: 'right', color: C.ink });
    for (let i = 0; i < MOTS[k].max; i++) { ctx.fillStyle = i < lvl(k) ? C.ink : 'rgba(29,58,138,0.2)'; ctx.beginPath(); ctx.arc(right - 4 * s - (MOTS[k].max - 1 - i) * 9 * s, y + 15 * s, 3 * s, 0, TAU); ctx.fill(); }
    y += 40 * s;
  }
  // dictée
  const word = G.dicteeWord, fs = 30 * s, gap = 24 * s, dy = bottom - 56 * s;
  txt('Dictée :', W / 2 - (word.length * gap) / 2 - 16 * s, dy, 22 * s, { align: 'right', color: C.graphite, weight: 400 });
  for (let i = 0; i < word.length; i++) {
    const x = W / 2 - (word.length * gap) / 2 + i * gap + gap / 2;
    if (i === G.dicteeProg) drawHighlight(x - 11 * s, dy - 12 * s, 22 * s, 22 * s, C.hl);
    if (i < G.dicteeProg) txt(word[i], x, dy, fs, { color: C.ink });
    else { txt(i === G.dicteeProg ? word[i] : '_', x, dy, i === G.dicteeProg ? fs : fs * 0.8, { color: i === G.dicteeProg ? C.pencil : 'rgba(46,46,51,0.35)', alpha: i === G.dicteeProg ? 0.6 : 1 }); }
  }
  // barre d'expérience : une ligne qu'on écrit
  const bw = Math.min(W - 80 * s, 700 * s), bx = W / 2 - bw / 2, by = bottom - 18 * s;
  ctx.save(); ctx.strokeStyle = C.rule; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx + bw, by); ctx.stroke();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 5 * s; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(bx, by);
  const k = clamp(G.xp / G.xpNext, 0, 1), steps = Math.max(1, Math.floor(k * 60));
  for (let i = 1; i <= steps; i++) ctx.lineTo(bx + bw * k * i / steps, by + Math.sin(i * 1.7) * 1.6 * s);
  ctx.stroke(); ctx.restore();
  // contrôles tactiles
  if (G.input.touch && !G.demo) {
    const bxp = W - SAFE.r - 70 * s, byp = H - SAFE.b - 110 * s;
    ctx.save(); ctx.globalAlpha = p.dashCd > 0 ? 0.35 : 0.85; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(bxp, byp, 40 * s, 0, TAU); ctx.fill(); ctx.restore();
    txt('pâté', bxp, byp, 24 * s, { color: C.paper });
    const j = G.input.joy;
    if (j && j.active) { ctx.save(); ctx.globalAlpha = 0.25; ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(j.ox, j.oy, 55 * s, 0, TAU); ctx.stroke(); ctx.globalAlpha = 0.5; ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(j.ox + clamp(j.x - j.ox, -55 * s, 55 * s), j.oy + clamp(j.y - j.oy, -55 * s, 55 * s), 18 * s, 0, TAU); ctx.fill(); ctx.restore(); }
  }
  if (G.demo) txt('démo automatique', left, bottom - 18 * s, 20 * s, { align: 'left', color: C.pencil, weight: 400 });
}

function drawCaptions() {
  let y = SAFE.t + (G.state === 'title' ? 60 : 150) * U;
  for (const c of G.captions) {
    const a = Math.min(1, c.t * 4, (c.dur - c.t) * 2.5);
    const hl = c.style === 'pink' ? C.hlPink : c.style === 'green' ? C.hlGreen : C.hl;
    ctx.font = '700 ' + (34 * U) + 'px ' + FONT_MAIN;
    const size = 34 * U * Math.min(1, (W - 40) / Math.max(1, ctx.measureText(c.text).width + 34 * U * 0.5));
    txt(c.text, W / 2, y, size, { color: C.inkDeep, alpha: a, hl, rot: -0.012 });
    y += 52 * U;
  }
}

function dimPage(a) { ctx.fillStyle = 'rgba(250,249,242,' + a + ')'; ctx.fillRect(0, 0, W, H); }

function cardRects() {
  const n = G.choices.length, vertical = W < 760;
  const out = [];
  if (vertical) {
    const cw = Math.min(W - 40, 460), ch = Math.min(150, (H - 220 * U) / n - 14);
    for (let i = 0; i < n; i++) out.push({ x: W / 2 - cw / 2, y: H * 0.5 - (n * (ch + 14)) / 2 + i * (ch + 14) + 40 * U, w: cw, h: ch, v: true });
  } else {
    const cw = Math.min(300 * U, (W - 100) / 3 - 20), ch = cw * 1.12;
    for (let i = 0; i < n; i++) out.push({ x: W / 2 - (n * (cw + 26) - 26) / 2 + i * (cw + 26), y: H / 2 - ch / 2 + 30 * U, w: cw, h: ch, v: false });
  }
  return out;
}
function drawLevelUp() {
  dimPage(0.72);
  const k = ease(G.stateT * 3.5);
  txt('Choisis un mot', W / 2, H / 2 - (W < 760 ? 0.36 * H : 230 * U), 58 * U, { font: FONT_CURSIVE, weight: 400, color: C.ink, alpha: k });
  const rects = cardRects();
  rects.forEach((r, i) => {
    const key = G.choices[i], M = MOTS[key], L = lvl(key), sel = i === G.sel;
    const yo = (1 - ease(G.stateT * 4 - i * 0.15)) * 60;
    ctx.save(); ctx.translate(r.x + r.w / 2, r.y + r.h / 2 + yo); ctx.rotate((i - 1) * 0.02 + (sel ? 0 : 0.004));
    ctx.globalAlpha = clamp(G.stateT * 4 - i * 0.15, 0, 1);
    ctx.shadowColor = 'rgba(40,40,30,0.25)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
    ctx.fillStyle = '#fffef9'; ctx.fillRect(-r.w / 2, -r.h / 2, r.w, r.h);
    ctx.shadowColor = 'transparent';
    // fiche bristol : une ligne rouge, des lignes bleues
    ctx.strokeStyle = C.margin; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-r.w / 2, -r.h / 2 + 46 * U); ctx.lineTo(r.w / 2, -r.h / 2 + 46 * U); ctx.stroke();
    ctx.strokeStyle = C.ruleMinor; ctx.lineWidth = 1;
    for (let yy = -r.h / 2 + 46 * U + 26 * U; yy < r.h / 2 - 6; yy += 26 * U) { ctx.beginPath(); ctx.moveTo(-r.w / 2, yy); ctx.lineTo(r.w / 2, yy); ctx.stroke(); }
    if (sel) { ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(-r.w / 2 - 5, -r.h / 2 - 5, r.w + 10, r.h + 10); }
    ctx.restore();
    const cx = r.x + r.w / 2, top = r.y + yo;
    ctx.save(); ctx.globalAlpha = clamp(G.stateT * 4 - i * 0.15, 0, 1);
    txt(String(i + 1), r.x + 16 * U, top + 22 * U, 22 * U, { color: C.margin, align: 'left' });
    txt(L ? 'niveau ' + (L + 1) : 'nouveau', r.x + r.w - 14 * U, top + 22 * U, 20 * U, { color: C.margin, align: 'right', weight: 400 });
    const wordSize = Math.min(46 * U, r.w / (M.label.length * 0.62));
    txt(M.label, cx, top + (r.v ? 70 : 92) * U, wordSize, { color: C.ink, hl: sel ? C.hl : null });
    ctx.restore();
    ctx.save(); ctx.globalAlpha = clamp(G.stateT * 4 - i * 0.15, 0, 1);
    wrap(M.desc, cx, top + (r.v ? 104 : 142) * U, r.w - 30 * U, 22 * U, 26 * U, C.graphite, 400);
    if (!r.v) txt(M.eff(L), cx, top + r.h - 30 * U, 22 * U, { color: C.ink });
    ctx.restore();
  });
  txt(G.input.touch ? 'Touche une fiche' : 'Touches 1, 2, 3 ou clic', W / 2, H - SAFE.b - 30 * U, 22 * U, { color: C.pencil, weight: 400 });
}
function wrap(s, x, y, maxW, size, lh, color, weight = 700) {
  ctx.font = weight + ' ' + size + 'px ' + FONT_MAIN;
  const words = s.split(' '); let line = '', yy = y; const lines = [];
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  lines.push(line);
  for (const l of lines) { txt(l, x, yy, size, { color, weight }); yy += lh; }
  return yy;
}

function drawTitle() {
  const s = U, t = G.stateT;
  dimPage(0.35);
  const reveal = ease(t / 1.7);
  const ty = H * 0.38;
  ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W * 0.15 + W * 0.85 * reveal, H); ctx.clip();
  txt('Inachevé', W / 2, ty, Math.min(150 * s, W / 6.2), { font: FONT_CURSIVE, weight: 400, color: C.ink });
  ctx.restore();
  // soulignement
  if (t > 1.4) {
    const k = ease((t - 1.4) / 0.6), w = Math.min(560 * s, W * 0.7);
    ctx.save(); ctx.strokeStyle = C.margin; ctx.lineWidth = 3.5 * s; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i <= 40 * k; i++) { const x = W / 2 - w / 2 + w * i / 40, y = ty + 82 * s + Math.sin(i * 0.5) * 3 * s; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke(); ctx.restore();
  }
  const a = clamp((t - 1.2) * 2, 0, 1);
  txt('un jeu qui s’écrit tout seul, toutes les douze heures', W / 2, ty + 128 * s, Math.min(32 * s, W / 22), { color: C.graphite, weight: 400, alpha: a });
  txt(G.input.touch ? 'Touche l’écran pour commencer' : 'Appuie sur Entrée pour commencer', W / 2, ty + 196 * s, Math.min(38 * s, W / 18), { color: C.ink, alpha: a * (0.6 + 0.4 * Math.sin(G.time * 3)), hl: C.hl });
  if (!G.input.touch) txt('ZQSD, WASD ou flèches : bouger    Espace : pâté d’encre    Échap : pause    M : son', W / 2, ty + 252 * s, Math.min(22 * s, W / 40), { color: C.pencil, weight: 400, alpha: a });
  else txt('Glisse pour bouger, bouton « pâté » pour foncer', W / 2, ty + 252 * s, 22 * s, { color: C.pencil, weight: 400, alpha: a });
  if (G.best) txt('meilleur score : ' + G.best, W / 2, ty + 290 * s, 22 * s, { color: C.margin, weight: 400, alpha: a });
  drawStamp(W - SAFE.r - 110 * s, SAFE.t + 48 * s, s * 1.1);
}

function drawEnd() {
  const win = G.state === 'victory', s = U, t = G.stateT;
  dimPage(Math.min(0.82, t * 1.6));
  const a = clamp(t * 2 - 0.3, 0, 1);
  const y0 = H * 0.2;
  txt(win ? GAME_META.chapterName + ' : écrit.' : 'La page a été effacée.', W / 2, y0, Math.min(66 * s, W / 11), { font: FONT_CURSIVE, weight: 400, color: win ? C.ink : C.red, alpha: a });
  txt('« ' + G.endPhrase + ' »', W / 2, y0 + 82 * s, Math.min(32 * s, W / 26), { color: C.graphite, weight: 400, alpha: a });
  const rows = [['temps', mmss(G.t)], ['ratures biffées', G.kills], ['lettres ramassées', G.letters], ['dictées réussies', G.dictees], ['niveau', G.level], ['score', G.score]];
  rows.forEach(([k, v], i) => {
    const y = y0 + 150 * s + i * 38 * s, aa = clamp(t * 3 - 1 - i * 0.25, 0, 1);
    txt(k, W / 2 - 14 * s, y, 26 * s, { align: 'right', color: C.pencil, weight: 400, alpha: aa });
    txt(String(v), W / 2 + 14 * s, y, 30 * s, { align: 'left', color: C.ink, alpha: aa, hl: k === 'score' && G.newBest ? C.hl : null });
  });
  const by = y0 + 150 * s + rows.length * 38 * s + 26 * s, ab = clamp(t * 2 - 2.2, 0, 1);
  if (G.newBest) txt('nouveau record !', W / 2, by, 26 * s, { color: C.margin, alpha: ab });
  const hint = win ? (G.input.touch ? 'Touche pour continuer en page libre' : 'Entrée : continuer en page libre    R : recommencer') : (G.input.touch ? 'Touche pour recommencer' : 'Entrée : recommencer');
  txt(hint, W / 2, by + 44 * s, 30 * s, { color: C.ink, alpha: ab, hl: C.hl });
  txt('La suite s’écrit dans douze heures. Itération n° ' + GAME_META.iteration + '.', W / 2, by + 92 * s, 22 * s, { color: C.pencil, weight: 400, alpha: ab });
}

function render() {
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.fillStyle = C.unwritten; ctx.fillRect(0, 0, W, H);
  drawWorld();
  if (G.state === 'title') drawTitle();
  else {
    drawHUD();
    if (G.state === 'levelup') drawLevelUp();
    else if (G.state === 'pause') { dimPage(0.7); txt('Pause', W / 2, H / 2 - 40 * U, 80 * U, { font: FONT_CURSIVE, weight: 400 }); txt(G.input.touch ? 'Touche pour reprendre' : 'Échap ou Entrée pour reprendre', W / 2, H / 2 + 40 * U, 30 * U, { hl: C.hl }); }
    else if (G.state === 'gameover' || G.state === 'victory') drawEnd();
  }
  if (G.state !== 'levelup') drawCaptions();
  // vignette douce
  const g = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.45, W / 2, H / 2, Math.hypot(W, H) * 0.62);
  g.addColorStop(0, 'rgba(60,50,30,0)'); g.addColorStop(1, 'rgba(60,50,30,0.16)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
