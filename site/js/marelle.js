// La marelle (itération 19) : au chapitre X, une marelle à la craie se dessine près de la goutte, avec un caillou dans une case.
// On saute de case en case, de 1 jusqu'au Ciel, sans jamais marcher sur le caillou : au Ciel, toute la cour est frappée.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const MARELLE = { first: 8, again: 20, S: 118, d0: 200, d1: 360, radius: 560, endDur: 1.4, hint: 1.6 };
// les rangées, de la Terre vers le Ciel : une case, ou deux côte à côte (gauche, droite)
const MARELLE_ROWS = [[1], [2], [3], [4, 5], [6], [7, 8]];
const MARELLE_COLS = ['#ffc4d6', '#fff1a6', '#bfe3ff', '#c8f2c0', '#ffd6a8', '#e2ccff', '#ffc4d6', '#fff1a6'];

// coordonnées de la marelle : u le long de l'axe (de la Terre vers le Ciel), v en travers
function marelleLocal(M, x, y) { const dx = x - M.x, dy = y - M.y, c = Math.cos(M.ang), s = Math.sin(M.ang); return [dx * c + dy * s, -dx * s + dy * c]; }
function marelleWorld(M, u, v) { const c = Math.cos(M.ang), s = Math.sin(M.ang); return [M.x + u * c - v * s, M.y + u * s + v * c]; }
function marelleCell(M, x, y) {   // la case sous ce point : un numéro, 'ciel', ou 0
  const S = MARELLE.S, [u, v] = marelleLocal(M, x, y), row = Math.floor(u / S);
  if (u < 0) return 0;
  if (row >= MARELLE_ROWS.length) return Math.hypot(u - MARELLE_ROWS.length * S, v) < S ? 'ciel' : 0;
  const cells = MARELLE_ROWS[row];
  if (cells.length === 1) return Math.abs(v) < S / 2 ? cells[0] : 0;
  return v > -S && v < 0 ? cells[0] : v >= 0 && v < S ? cells[1] : 0;
}
function marelleCenter(M, n) {
  const S = MARELLE.S;
  if (n === 'ciel') return marelleWorld(M, (MARELLE_ROWS.length + 0.4) * S, 0);
  const r = MARELLE_ROWS.findIndex(row => row.includes(n)), row = MARELLE_ROWS[r];
  return marelleWorld(M, (r + 0.5) * S, row.length === 1 ? 0 : (row[0] === n ? -S / 2 : S / 2));
}
function marelleFits(M) {
  const S = MARELLE.S, m = 70;
  for (const [u, v] of [[-S * 0.6, -S], [-S * 0.6, S], [(MARELLE_ROWS.length + 1) * S, -S], [(MARELLE_ROWS.length + 1) * S, S]]) {
    const [x, y] = marelleWorld(M, u, v);
    if (x < m || y < m || x > WORLD.w - m || y > WORLD.h - m) return false;
  }
  return true;
}
function writeMarelle() {
  const p = G.p;
  let M = null;
  for (let i = 0; i < 40 && !M; i++) {
    const a = rnd(TAU), d = rnd(MARELLE.d0, MARELLE.d1), c = { x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, ang: a + rnd(-0.4, 0.4) };
    if (marelleFits(c)) M = c;
  }
  if (!M) {   // à défaut : vers le milieu de la page
    const a = Math.atan2(WORLD.h / 2 - p.y, WORLD.w / 2 - p.x);
    M = { x: clamp(p.x + Math.cos(a) * 200, 200, WORLD.w - 200), y: clamp(p.y + Math.sin(a) * 200, 200, WORLD.h - 200), ang: a };
    for (let k = 0; k < 16 && !marelleFits(M); k++) { M.ang += TAU / 16; }
  }
  const caillou = 2 + Math.floor(rnd(7));
  Object.assign(M, { caillou, seq: [1, 2, 3, 4, 5, 6, 7, 8].filter(n => n !== caillou).concat(['ciel']), prog: 0, on: 0, done: new Set(), t: 0, end: false, endT: 0, ratees: 0, hintT: 0, tossT: 0 });
  G.marelle = M;
  AU.play('marelleNew');
  if (!G.marelleSeen) { G.marelleSeen = true; caption('Nouveau : la marelle ! Saute de 1 jusqu’au Ciel…', 3.4, 'green'); caption('… sans marcher sur la case du caillou !', 3.4, 'green'); }
  else caption(pick(['Une marelle ! Le caillou est sur le ' + caillou + '.', 'Marelle ! Attention au caillou, case ' + caillou + '.', 'De la Terre au Ciel, sans le ' + caillou + ' !']), 2.4, 'green');
}
function stepMarelle(dt) {
  if (CH().paper !== 'recre') return;
  for (const f of G.marelleFx) f.t += dt;
  G.marelleFx = G.marelleFx.filter(f => f.t < f.dur);
  const M = G.marelle;
  if (!M) { if (G.t >= G.nextMarelle) writeMarelle(); return; }
  M.t += dt; M.hintT -= dt; M.tossT = Math.max(0, M.tossT - dt);
  if (M.end) { M.endT += dt; if (M.endT >= MARELLE.endDur) G.marelle = null; return; }
  const p = G.p;
  const cur = p.dashT > 0 ? M.on : marelleCell(M, p.x, p.y);   // pendant un pâté, la goutte saute : elle ne touche aucune case
  if (cur === M.on) return;
  M.on = cur;
  if (!cur) return;
  const want = M.seq[M.prog];
  if (cur === M.caillou) {   // on a marché sur le caillou : tout est à refaire
    M.prog = 0; M.done.clear(); M.ratees++; M.tossT = 0.5;
    AU.play('marelleRate'); G.cam.shake = Math.max(G.cam.shake, 7);
    caption('Raté ! On ne marche pas sur le caillou : retour à la Terre.', 2.4, 'pink');
    addText(p.x, p.y - 40, 'raté !', C.red, 32);
  } else if (cur === want) {
    if (cur === 'ciel') { solveMarelle(M); return; }
    M.prog++; M.done.add(cur); AU.play('marelleCase', M.prog);
    const [x, y] = marelleCenter(M, cur); addText(x, y - 50, String(cur), C.ink, 30);
  } else if (!M.done.has(cur) && M.hintT <= 0) {
    M.hintT = MARELLE.hint;
    addText(p.x, p.y - 40, want === 'ciel' ? 'au Ciel !' : 'd’abord le ' + want + ' !', C.pencil, 24);
  }
}
function marelleImprint(M) {   // la marelle reste dessinée sur la page, à la craie, avec une étoile au Ciel
  const S = MARELLE.S;
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.translate(M.x, M.y); sctx.rotate(M.ang);
  sctx.globalAlpha = 0.4; sctx.strokeStyle = '#ffffff'; sctx.lineWidth = 6; sctx.lineJoin = 'round';
  MARELLE_ROWS.forEach((row, r) => { if (row.length === 1) sctx.strokeRect(r * S, -S / 2, S, S); else { sctx.strokeRect(r * S, -S, S, S); sctx.strokeRect(r * S, 0, S, S); } });
  sctx.beginPath(); sctx.arc(MARELLE_ROWS.length * S, 0, S, -Math.PI / 2, Math.PI / 2); sctx.stroke();
  sctx.fillStyle = '#ffe36b'; sctx.globalAlpha = 0.55; sctx.beginPath();
  for (let k = 0; k <= 10; k++) { const a = k * Math.PI / 5, rr = k % 2 ? 16 : 40; sctx.lineTo((MARELLE_ROWS.length + 0.45) * S + Math.cos(a) * rr, Math.sin(a) * rr); }
  sctx.fill(); sctx.restore();
}
function solveMarelle(M) {
  const p = G.p, n = ++G.marelles, k = Math.min(6, n), [X, Y] = marelleCenter(M, 'ciel'), R = MARELLE.radius, clean = !M.ratees;
  M.end = true; M.endT = 0; G.nextMarelle = G.t + MARELLE.again;
  G.score += (500 + 120 * k) * (clean ? 1.5 : 1); G.xp += 8 + 2 * k; p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('marelleCiel');
  caption(clean ? 'Ciel ! Du premier coup, sans toucher le caillou.' : 'Ciel ! La marelle est finie.', clean ? 2.8 : 2.2, 'green');
  G.cam.shake = Math.max(G.cam.shake, 12);
  G.marelleFx.push({ x: X, y: Y, t: 0, dur: 1.3 });
  marelleImprint(M);
  query(X, Y, R + 60, tmpA);
  for (const e of tmpA) {
    const dx = e.x - X, dy = e.y - Y, d = Math.hypot(dx, dy) || 1;
    if (e.dead || d > R + e.r) continue;
    hurtEnemy(e, (e.isBoss ? 90 : 22 + 4 * k) * (clean ? 1.25 : 1) * G.S.dmg, 'marelle');
    if (!e.isBoss) { e.vx += dx / d * 440; e.vy += dy / d * 440; }
  }
  const R2 = R * R;
  for (const b of G.ebul) if ((b.x - X) ** 2 + (b.y - Y) ** 2 < R2) b.life = 0;
  G.balles = G.balles.filter(b => (b.x - X) ** 2 + (b.y - Y) ** 2 > R2);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; G.items.push({ x: X, y: Y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, ch: pick(LETTER_POOL), value: 7, rare: true, need: false, t: rnd(TAU), pull: false, rot: rnd(-0.4, 0.4) }); }
  for (let i = 0; i < 44; i++) { const a = rnd(TAU), s = rnd(160, 560); G.parts.push({ x: X, y: Y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.9, max: 0.9, size: rnd(3, 6), color: MARELLE_COLS[i % MARELLE_COLS.length], drag: 3 }); }
}

/* ---------- pilote ---------- */
function marelleTarget() {
  const M = G.marelle; if (!M || M.end) return null;
  const want = M.seq[M.prog], [x, y] = marelleCenter(M, want), S = MARELLE.S;
  // un caillou sur une case seule, entre la goutte et la case voulue : on la contourne par le côté
  const cr = MARELLE_ROWS.findIndex(row => row.includes(M.caillou)), [pu, pv] = marelleLocal(M, G.p.x, G.p.y);
  const wr = want === 'ciel' ? MARELLE_ROWS.length : MARELLE_ROWS.findIndex(row => row.includes(want));
  if (MARELLE_ROWS[cr].length === 1 && wr > cr && pu < (cr + 1) * S + 10) {
    const side = pv >= 0 ? 1 : -1;
    if (Math.abs(pv) < S * 0.85) { const [wx, wy] = marelleWorld(M, Math.max(pu, cr * S - S * 0.3), side * S * 1.05); return { x: wx, y: wy }; }
    const [wx, wy] = marelleWorld(M, (cr + 1.4) * S, side * S * 1.05); return { x: wx, y: wy };
  }
  return { x, y };
}
function marelleDanger(x, y) {   // le pilote évite la case du caillou
  const M = G.marelle; if (!M || M.end) return 0;
  const [u, v] = marelleLocal(M, x, y), S = MARELLE.S, r = MARELLE_ROWS.findIndex(row => row.includes(M.caillou)), row = MARELLE_ROWS[r];
  const v0 = row.length === 1 ? -S / 2 : row[0] === M.caillou ? -S : 0, pad = 26;
  return u > r * S - pad && u < (r + 1) * S + pad && v > v0 - pad && v < v0 + S + pad ? 7 : 0;
}

/* ---------- dessin ---------- */
function drawMarelle(v) {
  for (const f of G.marelleFx) {   // le Ciel éclate en poussière de craie
    const q = f.t / f.dur, rr = MARELLE.radius * ease(q);
    ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 12 * (1 - q) + 2; ctx.setLineDash([18, 10]); ctx.beginPath(); ctx.arc(f.x, f.y, rr, 0, TAU); ctx.stroke(); ctx.restore();
    if (q < 0.7) txt('Ciel !', f.x, f.y - 110 - q * 40, 56, { color: C.ink, alpha: 1 - q / 0.7, hl: C.hl });
  }
  const M = G.marelle; if (!M) return;
  const S = MARELLE.S, L = (MARELLE_ROWS.length + 1) * S;
  if (Math.max(Math.abs(M.x - (v.x0 + v.x1) / 2) - (v.x1 - v.x0) / 2, Math.abs(M.y - (v.y0 + v.y1) / 2) - (v.y1 - v.y0) / 2) > L + 60) return;
  const appear = ease(M.t / 0.7), fade = M.end ? clamp(1 - M.endT / MARELLE.endDur, 0, 1) : 1, want = M.seq[M.prog];
  const flip = Math.sin(M.ang) > 0.35 ? Math.PI : 0;   // les chiffres restent lisibles quand la marelle descend
  ctx.save(); ctx.translate(M.x, M.y); ctx.rotate(M.ang); ctx.globalAlpha = appear * fade;
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const cellRect = n => { const r = MARELLE_ROWS.findIndex(row => row.includes(n)), row = MARELLE_ROWS[r]; return [r * S, row.length === 1 ? -S / 2 : row[0] === n ? -S : 0]; };
  for (let n = 1; n <= 8; n++) {   // les cases faites se colorient ; la suivante clignote
    const [u0, v0] = cellRect(n);
    if (M.done.has(n)) { ctx.fillStyle = MARELLE_COLS[n - 1]; ctx.globalAlpha = 0.55 * appear * fade; ctx.fillRect(u0 + 4, v0 + 4, S - 8, S - 8); }
    else if (n === want) { ctx.fillStyle = C.hl; ctx.globalAlpha = (0.25 + 0.2 * Math.sin(G.time * 6)) * appear * fade; ctx.fillRect(u0 + 4, v0 + 4, S - 8, S - 8); }
  }
  if (want === 'ciel') { ctx.fillStyle = C.hl; ctx.globalAlpha = (0.25 + 0.2 * Math.sin(G.time * 6)) * appear * fade; ctx.beginPath(); ctx.arc(MARELLE_ROWS.length * S, 0, S - 4, -Math.PI / 2, Math.PI / 2); ctx.fill(); }
  ctx.globalAlpha = appear * fade;
  for (const pass of [0, 1]) {   // le trait de craie, repassé deux fois
    ctx.strokeStyle = pass ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.35)'; ctx.lineWidth = pass ? 4 : 9;
    ctx.beginPath();
    MARELLE_ROWS.forEach((row, r) => { if (row.length === 1) ctx.rect(r * S, -S / 2, S, S); else { ctx.rect(r * S, -S, S, S); ctx.rect(r * S, 0, S, S); } });
    ctx.moveTo(MARELLE_ROWS.length * S, -S); ctx.arc(MARELLE_ROWS.length * S, 0, S, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }
  const label = (s, u, vv, size, col) => { ctx.save(); ctx.translate(u, vv); ctx.rotate(Math.PI / 2 + flip); txt(s, 0, 0, size, { color: col, alpha: appear * fade }); ctx.restore(); };
  for (let n = 1; n <= 8; n++) { const [u0, v0] = cellRect(n); label(String(n), u0 + S / 2, v0 + S / 2, 54, n === M.caillou ? 'rgba(80,80,86,0.55)' : '#ffffff'); }
  label('CIEL', (MARELLE_ROWS.length + 0.45) * S, 0, 40, '#ffffff');
  label('Terre', -S * 0.35, 0, 30, 'rgba(255,255,255,0.85)');
  // le caillou, posé dans sa case
  const [cu, cv] = cellRect(M.caillou), hop = M.tossT > 0 ? Math.sin(M.tossT * Math.PI * 2) * 10 : 0;
  ctx.fillStyle = 'rgba(46,46,51,0.25)'; ctx.beginPath(); ctx.ellipse(cu + S * 0.62, cv + S * 0.66, 22, 9, 0, 0, TAU); ctx.fill();
  ctx.fillStyle = '#8d8a84'; ctx.strokeStyle = '#4f4c47'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(cu + S * 0.6, cv + S * 0.6 - hop, 20, 15, 0.4, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.45)'; ctx.beginPath(); ctx.ellipse(cu + S * 0.55, cv + S * 0.55 - hop, 7, 4, 0.4, 0, TAU); ctx.fill();
  ctx.restore();
  if (M.ratees && !M.end) { const [x, y] = marelleWorld(M, -S * 0.9, 0); txt('raté : ' + M.ratees, x, y, 24, { color: C.red, alpha: appear }); }
}
function drawMarelleArrow() {
  if (G.state !== 'play') return;
  const M = G.marelle; if (!M || M.end) return;
  const [x, y] = marelleCenter(M, M.seq[M.prog]);
  edgeArrow(x, y);
}
