// La lettrine (chapitre V) : une grande lettre attend dans son cadre. Passe et repasse dessus pour la couvrir
// de feuille d'or ; quand elle est presque toute dorée, elle s'illumine et frappe toute la page autour d'elle.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const ENLU = { first: 8, again: 25, cell: 26, need: 0.9, radius: 560, size0: 330, grow: 40, max: 450, brush: 40 };
const ENLU_FONT = s => '700 ' + Math.round(s) + 'px ' + FONT_MAIN;

// La lettre vient du mot de la dictée en cours ; ses cases à dorer sont lues dans un petit canevas
function enluMask(ch, size) {
  const m = document.createElement('canvas'); m.width = m.height = size;
  const g = m.getContext('2d');
  g.fillStyle = '#ead9a4'; g.font = ENLU_FONT(size * 0.92); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(ch, size / 2, size * 0.53);
  const data = g.getImageData(0, 0, size, size).data, n = Math.floor(size / ENLU.cell), cells = [];
  const at = (x, y) => data[((Math.min(size - 1, y | 0) * size) + Math.min(size - 1, x | 0)) * 4 + 3];
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    let hit = false;
    for (let sy = 0; sy < 3 && !hit; sy++) for (let sx = 0; sx < 3 && !hit; sx++) hit = at((i + (sx + 0.5) / 3) * ENLU.cell, (j + (sy + 0.5) / 3) * ENLU.cell) > 90;
    if (hit) cells.push({ i, j, done: false });
  }
  return { m, cells };
}
function writeEnlu() {
  const p = G.p, size = Math.min(ENLU.max, ENLU.size0 + ENLU.grow * G.enlus), h = size / 2;
  let ch = G.dicteeWord[0] || 'A', mk = enluMask(ch, size);
  if (mk.cells.length < 20) { ch = 'A'; mk = enluMask(ch, size); }
  let x = WORLD.w / 2, y = WORLD.h / 2;
  for (let i = 0; i < 30; i++) {
    const a = rnd(TAU), d = rnd(460, 860);
    x = clamp(p.x + Math.cos(a) * d, h + 90, WORLD.w - h - 90); y = clamp(p.y + Math.sin(a) * d, h + 90, WORLD.h - h - 90);
    if (Math.hypot(x - p.x, y - p.y) > 380) break;
  }
  for (const c of mk.cells) { c.x = x - h + (c.i + 0.5) * ENLU.cell; c.y = y - h + (c.j + 0.5) * ENLU.cell; }
  const paint = document.createElement('canvas'); paint.width = paint.height = size;
  G.enlu = { x, y, size, ch, cells: mk.cells, mask: mk.m, paint, painted: 0, t: 0, dirty: true };
  AU.play('enluNew');
  if (!G.enluSeen) { G.enluSeen = true; caption('Nouveau : une lettrine attend son or…', 3.4, 'green'); caption('… passe et repasse dessus pour la dorer !', 3.4, 'green'); }
  else caption('Une nouvelle lettrine, plus grande : « ' + ch + ' »', 2.4, 'green');
}
// La case non dorée la plus proche (pour le pilote automatique)
function enluTarget() {
  const E = G.enlu; if (!E) return null;
  const p = G.p; let best = null, bd = 1e12;
  for (const c of E.cells) if (!c.done) { const d = (c.x - p.x) ** 2 + (c.y - p.y) ** 2; if (d < bd) { bd = d; best = c; } }
  return best;
}
function stepEnlu(dt) {
  if (CH().paper !== 'calli') return;
  for (const gl of G.glows) gl.t += dt;
  G.glows = G.glows.filter(gl => gl.t < gl.dur);
  const E = G.enlu;
  if (!E) { if (G.t >= G.nextEnlu) writeEnlu(); return; }
  E.t += dt;
  const p = G.p, R = ENLU.brush + p.r, h = E.size / 2;
  if (Math.abs(p.x - E.x) > h + R || Math.abs(p.y - E.y) > h + R) return;
  let got = 0;
  for (const c of E.cells) if (!c.done && (c.x - p.x) ** 2 + (c.y - p.y) ** 2 < R * R) {
    c.done = true; got++;
    if (rand() < 0.5) G.parts.push({ x: c.x, y: c.y, vx: rnd(-50, 50), vy: rnd(-90, -30), life: 0.6, max: 0.6, size: rnd(2, 4), color: rand() < 0.5 ? C.gold : GOLD_LEAF, drag: 3 });
  }
  if (!got) return;
  E.painted += got; E.dirty = true;
  AU.play('enluCell', Math.floor(10 * E.painted / E.cells.length));
  if (E.painted >= E.cells.length * ENLU.need) illuminate(E);
}
function illuminate(E) {
  const p = G.p, n = E.cells.length;
  G.enlus++; G.enlu = null; G.nextEnlu = G.t + ENLU.again;
  G.score += 4 * n; G.xp += 6 + Math.round(n / 10); p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('enlu');
  caption(pick(['La lettrine s’illumine !', 'Une enluminure !', 'De l’or plein la page !']), 2.4, 'green');
  G.cam.shake = Math.max(G.cam.shake, 12);
  G.glows.push({ x: E.x, y: E.y, size: E.size, ch: E.ch, t: 0, dur: 2.6 });
  // la lettre dorée reste imprimée sur la page (et sèche comme l'encre)
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.globalAlpha = 0.32; sctx.fillStyle = C.gold; sctx.font = ENLU_FONT(E.size * 0.92); sctx.textAlign = 'center'; sctx.textBaseline = 'middle';
  sctx.fillText(E.ch, E.x, E.y - E.size / 2 + E.size * 0.53); sctx.restore();
  query(E.x, E.y, ENLU.radius + 60, tmpA);
  for (const e of tmpA) {
    const dx = e.x - E.x, dy = e.y - E.y, d = Math.hypot(dx, dy) || 1;
    if (e.dead || d > ENLU.radius + e.r) continue;
    hurtEnemy(e, (e.isBoss ? 90 : 22 + n * 0.12) * G.S.dmg, 'enlu');
    if (!e.isBoss) { e.vx += dx / d * 420; e.vy += dy / d * 420; }
  }
  for (const b of G.ebul) if ((b.x - E.x) ** 2 + (b.y - E.y) ** 2 < ENLU.radius ** 2) b.life = 0;
  G.drops = G.drops.filter(dr => (dr.x - E.x) ** 2 + (dr.y - E.y) ** 2 > ENLU.radius ** 2);
  eraseStrokes(E.x, E.y, ENLU.radius);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; G.items.push({ x: E.x, y: E.y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, ch: E.ch, value: 7, rare: true, need: false, t: rnd(TAU), pull: false, rot: rnd(-0.4, 0.4) }); }
  for (let i = 0; i < 40; i++) { const a = rnd(TAU), s = rnd(160, 560); G.parts.push({ x: E.x, y: E.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.9, max: 0.9, size: rnd(3, 6), color: i % 3 ? C.gold : GOLD_LEAF, drag: 3 }); }
}

/* ----- dessin ----- */
function enluFrame(h) {   // le cadre d'une page d'enluminure : rouge, or, et des vrilles aux coins
  ctx.fillStyle = 'rgba(251,243,220,0.8)'; ctx.fillRect(-h - 18, -h - 18, 2 * h + 36, 2 * h + 36);
  ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.strokeRect(-h - 18, -h - 18, 2 * h + 36, 2 * h + 36);
  ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.setLineDash([8, 6]); ctx.strokeRect(-h - 8, -h - 8, 2 * h + 16, 2 * h + 16); ctx.setLineDash([]);
  ctx.strokeStyle = '#3f7a4a'; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    ctx.beginPath(); const cx = sx * (h + 18), cy = sy * (h + 18);
    for (let i = 0; i <= 14; i++) { const t = i / 14, a = t * 3 * Math.PI, r = 4 + t * 26; const x = cx - sx * 30 + Math.cos(a) * r * sx, y = cy - sy * 30 + Math.sin(a) * r * sy; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
    ctx.stroke();
    ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(cx, cy, 6, 0, TAU); ctx.fill();
  }
}
function drawEnlu(v) {
  for (const gl of G.glows) {
    const k = gl.t / gl.dur, h = gl.size / 2, a = Math.min(1, (gl.dur - gl.t) * 1.5);
    if (gl.t < 1.1) {   // l'onde d'or
      const q = gl.t / 1.1, rr = ENLU.radius * ease(q);
      ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = C.gold; ctx.lineWidth = 9 * (1 - q) + 2; ctx.beginPath(); ctx.arc(gl.x, gl.y, rr, 0, TAU); ctx.stroke();
      ctx.fillStyle = GOLD_LEAF; for (let i = 0; i < 16; i++) { const an = i / 16 * TAU + q; ctx.beginPath(); ctx.arc(gl.x + Math.cos(an) * rr, gl.y + Math.sin(an) * rr, 5, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
    ctx.save(); ctx.translate(gl.x, gl.y); ctx.globalAlpha = a; ctx.scale(1 + 0.08 * ease(k * 3), 1 + 0.08 * ease(k * 3));
    enluFrame(h);
    ctx.fillStyle = C.gold; ctx.font = ENLU_FONT(gl.size * 0.92); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(240,200,90,0.9)'; ctx.shadowBlur = 30 * (1 - k); ctx.fillText(gl.ch, 0, gl.size * 0.03); ctx.shadowBlur = 0;
    ctx.restore();
    if (k < 0.6) txt('enluminé !', gl.x, gl.y - h - 60 - k * 40, 36, { color: C.gold, alpha: 1 - k / 0.6, hl: C.hl });
  }
  const E = G.enlu; if (!E) return;
  const h = E.size / 2;
  if (E.x + h + 60 < v.x0 || E.x - h - 60 > v.x1 || E.y + h + 100 < v.y0 || E.y - h - 60 > v.y1) return;
  if (E.dirty) {   // la feuille d'or, découpée à la forme de la lettre
    E.dirty = false;
    const g = E.paint.getContext('2d'), c = ENLU.cell;
    g.globalCompositeOperation = 'source-over'; g.clearRect(0, 0, E.size, E.size);
    const gr = g.createLinearGradient(0, 0, E.size, E.size); gr.addColorStop(0, '#f2cf5b'); gr.addColorStop(0.5, '#d9a52c'); gr.addColorStop(1, '#f0c752');
    g.fillStyle = gr; for (const q of E.cells) if (q.done) g.fillRect(q.i * c - 2, q.j * c - 2, c + 4, c + 4);
    g.globalCompositeOperation = 'destination-in'; g.drawImage(E.mask, 0, 0); g.globalCompositeOperation = 'source-over';
  }
  const a = Math.min(1, E.t * 2);
  ctx.save(); ctx.translate(E.x, E.y); ctx.globalAlpha = a * 0.92;
  enluFrame(h);
  ctx.globalAlpha = a * 0.75; ctx.drawImage(E.mask, -h, -h);
  ctx.globalAlpha = a; ctx.drawImage(E.paint, -h, -h);
  ctx.strokeStyle = '#a8741a'; ctx.lineWidth = 2; ctx.setLineDash([7, 6]); ctx.lineDashOffset = -G.time * 20;
  ctx.font = ENLU_FONT(E.size * 0.92); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.strokeText(E.ch, 0, E.size * 0.03); ctx.setLineDash([]);
  ctx.restore();
  const pct = Math.min(100, Math.floor(100 * E.painted / (E.cells.length * ENLU.need)));
  txt(E.painted ? 'dorure : ' + pct + ' %' : 'dore la lettrine !', E.x, E.y + h + 56, 30, { color: C.gold, alpha: a, hl: C.hl });
}
function drawEnluArrow() {
  const E = G.enlu; if (!E || G.state !== 'play') return;
  edgeArrow(E.x, E.y);
}
