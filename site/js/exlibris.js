// L'ex-libris (chapitre VI) : un sceau de cire attend sur la page. Ramasse-le, porte-le jusqu'au cartouche « ex-libris »
// et scelle-le : l'onde de cire balaie la page. Si tu es touché en chemin, tu le lâches.
// Chaque sceau porte l'emblème d'une page déjà écrite : la plume, la croche, le compas, l'ancre, la lettrine, la goutte.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const SCEAU = { first: 8, again: 22, grab: 40, reach: 72, radius: 540, d0: 700, grow: 70, dmax: 1300, follow: 36 };
const EMBLEMS = ['plume', 'croche', 'compas', 'ancre', 'lettrine', 'goutte'];
const WAX = '#a8262e', WAX_D = '#6e1218', WAX_L = '#d0505a';

function writeSceau() {
  const p = G.p, dist = Math.min(SCEAU.dmax, SCEAU.d0 + SCEAU.grow * G.sceaux);
  let x = p.x, y = p.y;
  for (let i = 0; i < 30; i++) {
    const a = rnd(TAU), d = rnd(320, 560);
    x = clamp(p.x + Math.cos(a) * d, 140, WORLD.w - 140); y = clamp(p.y + Math.sin(a) * d, 140, WORLD.h - 140);
    if (Math.hypot(x - p.x, y - p.y) > 260) break;
  }
  let tx = x, ty = y;
  for (let i = 0; i < 40; i++) {
    const a = rnd(TAU);
    tx = clamp(x + Math.cos(a) * dist, 170, WORLD.w - 170); ty = clamp(y + Math.sin(a) * dist, 190, WORLD.h - 190);
    if (Math.hypot(tx - x, ty - y) > dist * 0.75 && Math.hypot(tx - p.x, ty - p.y) > 380) break;
  }
  G.sceau = { x, y, tx, ty, carried: false, t: 0, em: EMBLEMS[G.sceaux % EMBLEMS.length], hp: p.hp, lost: 0 };
  AU.play('sceauNew');
  if (!G.sceauSeen) { G.sceauSeen = true; caption('Nouveau : un sceau de cire t’attend…', 3.4, 'green'); caption('… porte-le jusqu’à l’ex-libris !', 3.4, 'green'); }
  else caption('Un nouveau sceau : ' + EMBLEM_NAMES[G.sceau.em], 2.4, 'green');
}
const EMBLEM_NAMES = { plume: 'la plume du chapitre I', croche: 'la croche du chapitre II', compas: 'le compas du chapitre III', ancre: 'l’ancre du chapitre IV', lettrine: 'la lettrine du chapitre V', goutte: 'la goutte d’encre, c’est toi' };

// Là où le joueur doit aller : le sceau, puis l'ex-libris
function sceauTarget() {
  const S = G.sceau; if (!S) return null;
  return S.carried ? { x: S.tx, y: S.ty } : S;
}
function stepSceau(dt) {
  if (CH().paper !== 'garde') return;
  for (const st of G.stamps) st.t += dt;
  G.stamps = G.stamps.filter(st => st.t < st.dur);
  const S = G.sceau;
  if (!S) { if (G.t >= G.nextSceau) writeSceau(); return; }
  S.t += dt;
  const p = G.p;
  if (!S.carried) {
    if ((p.x - S.x) ** 2 + (p.y - S.y) ** 2 < (SCEAU.grab + p.r) ** 2) {
      S.carried = true; S.hp = p.hp; AU.play('sceauGrab');
      addText(p.x, p.y - 34, 'le sceau !', WAX, 26);
    }
    return;
  }
  // il suit la goutte au bout de son ruban
  const bx = p.x - Math.cos(p.face) * SCEAU.follow, by = p.y - Math.sin(p.face) * SCEAU.follow, k = 1 - Math.exp(-dt * 10);
  S.x = lerp(S.x, bx, k); S.y = lerp(S.y, by, k);
  if (p.hp < S.hp) {   // touché : le sceau roule plus loin
    const a = rnd(TAU), d = rnd(110, 170);
    S.carried = false; S.lost++; S.x = clamp(p.x + Math.cos(a) * d, 60, WORLD.w - 60); S.y = clamp(p.y + Math.sin(a) * d, 60, WORLD.h - 60);
    AU.play('sceauDrop'); addText(p.x, p.y - 34, 'lâché !', C.red, 26);
    if (S.lost === 1) caption('Touché : tu as lâché le sceau !', 2, 'pink');
    return;
  }
  S.hp = p.hp;
  if ((p.x - S.tx) ** 2 + (p.y - S.ty) ** 2 < SCEAU.reach ** 2) stampSceau(S);
}
// Le sceau est posé : l'ex-libris est scellé, une onde de cire balaie la page
function stampSceau(S) {
  const p = G.p, n = ++G.sceaux, X = S.tx, Y = S.ty;
  G.sceau = null; G.nextSceau = G.t + SCEAU.again;
  G.score += 500 + 100 * Math.min(6, n); G.xp += 8 + 2 * Math.min(6, n); p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('sceau');
  caption(n === EMBLEMS.length ? 'Six sceaux : tout le cahier tient sur sa page de garde !' : pick(['Scellé !', 'L’ex-libris est scellé !', 'Ce cahier appartient à… toi.']), n === EMBLEMS.length ? 3.4 : 2.4, 'green');
  G.cam.shake = Math.max(G.cam.shake, 12);
  G.stamps.push({ x: X, y: Y, em: S.em, t: 0, dur: 2.6 });
  // la page garde l'empreinte : un cachet de cire, avec son emblème
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.translate(X, Y); sctx.globalAlpha = 0.5;
  waxDisc(sctx, 34); sctx.strokeStyle = WAX_D; sctx.fillStyle = WAX_D; sctx.lineWidth = 2.6; drawEmblem(sctx, S.em, 0.85); sctx.restore();
  query(X, Y, SCEAU.radius + 60, tmpA);
  for (const e of tmpA) {
    const dx = e.x - X, dy = e.y - Y, d = Math.hypot(dx, dy) || 1;
    if (e.dead || d > SCEAU.radius + e.r) continue;
    hurtEnemy(e, (e.isBoss ? 95 : 24 + 4 * Math.min(6, n)) * G.S.dmg, 'sceau');
    if (!e.isBoss) { e.vx += dx / d * 440; e.vy += dy / d * 440; }
  }
  const R2 = SCEAU.radius ** 2;
  for (const b of G.ebul) if ((b.x - X) ** 2 + (b.y - Y) ** 2 < R2) b.life = 0;
  G.drops = G.drops.filter(dr => (dr.x - X) ** 2 + (dr.y - Y) ** 2 > R2);
  G.ribbons = G.ribbons.filter(rb => (rb.x - X) ** 2 + (rb.y - Y) ** 2 > R2);
  eraseStrokes(X, Y, SCEAU.radius);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; G.items.push({ x: X, y: Y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, ch: pick(LETTER_POOL), value: 7, rare: true, need: false, t: rnd(TAU), pull: false, rot: rnd(-0.4, 0.4) }); }
  for (let i = 0; i < 40; i++) { const a = rnd(TAU), s = rnd(160, 560); G.parts.push({ x: X, y: Y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.9, max: 0.9, size: rnd(3, 6), color: i % 3 ? WAX : C.gold, drag: 3 }); }
}

/* ===================== Dessin ===================== */
// Un disque de cire au bord ondulé, centré sur l'origine du contexte g
function waxDisc(g, r) {
  g.fillStyle = WAX; g.beginPath();
  for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, rr = r * (1 + 0.07 * Math.sin(i * 2.7) + 0.04 * Math.sin(i * 5.3)); i ? g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr) : g.moveTo(Math.cos(a) * rr, Math.sin(a) * rr); }
  g.closePath(); g.fill();
  g.strokeStyle = WAX_D; g.lineWidth = r * 0.06; g.beginPath(); g.arc(0, 0, r * 0.72, 0, TAU); g.stroke();
}
// L'emblème d'une page, dans une boîte de 40 × 40 (le trait et la couleur sont ceux du contexte)
function drawEmblem(g, em, s) {
  g.save(); g.scale(s, s); g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath();
  if (em === 'plume') { g.moveTo(-12, 16); g.quadraticCurveTo(-4, -6, 14, -18); g.quadraticCurveTo(8, 2, -12, 16); g.moveTo(-16, 20); g.lineTo(2, -2); }
  else if (em === 'croche') { g.ellipse(-6, 12, 8, 6, -0.4, 0, TAU); g.moveTo(1, 10); g.lineTo(1, -18); g.quadraticCurveTo(12, -10, 12, 2); }
  else if (em === 'compas') { g.arc(0, -15, 4, 0, TAU); g.moveTo(-2, -12); g.lineTo(-12, 17); g.moveTo(2, -12); g.lineTo(12, 17); g.moveTo(-7, 3); g.lineTo(7, 3); }
  else if (em === 'ancre') { g.arc(0, -14, 4, 0, TAU); g.moveTo(0, -10); g.lineTo(0, 17); g.moveTo(-9, -4); g.lineTo(9, -4); g.moveTo(-15, 6); g.quadraticCurveTo(-12, 18, 0, 17); g.quadraticCurveTo(12, 18, 15, 6); }
  else if (em === 'goutte') { g.moveTo(0, -18); g.bezierCurveTo(4, -8, 13, 0, 13, 7); g.arc(0, 7, 13, 0, Math.PI); g.bezierCurveTo(-13, 0, -4, -8, 0, -18); }
  g.stroke();
  if (em === 'lettrine') { g.font = '400 34px ' + FONT_CURSIVE; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('A', 0, 3); }
  g.restore();
}
function drawCartouche(x, y, em, a, glow) {   // le cartouche « ex-libris », qui attend son sceau
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(251,246,232,0.92)'; ctx.beginPath(); ctx.ellipse(0, 0, 92, 116, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 3.5; ctx.stroke();
  ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(0, 0, 82, 106, 0, 0, TAU); ctx.stroke();
  ctx.strokeStyle = '#3f7a4a'; ctx.lineWidth = 2;
  for (const s of [-1, 1]) { ctx.beginPath(); for (let i = 0; i <= 12; i++) { const t = i / 12, an = Math.PI / 2 + s * (0.4 + t * 1.1), r = 98 + Math.sin(t * 9) * 5; i ? ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r) : ctx.moveTo(Math.cos(an) * r, Math.sin(an) * r); } ctx.stroke(); }
  ctx.restore();
  txt('EX-LIBRIS', x, y - 70, 24, { color: '#7a5a3a', alpha: a });
  ctx.save(); ctx.translate(x, y + 8); ctx.globalAlpha = a;
  ctx.strokeStyle = glow ? C.red : 'rgba(122,90,58,0.55)'; ctx.lineWidth = 2.5; ctx.setLineDash([7, 6]); ctx.lineDashOffset = -G.time * 18;
  ctx.beginPath(); ctx.arc(0, 0, 40 + (glow ? Math.sin(G.time * 8) * 4 : 0), 0, TAU); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(122,90,58,0.55)'; ctx.fillStyle = 'rgba(122,90,58,0.55)'; ctx.lineWidth = 2; drawEmblem(ctx, em, 1);
  ctx.restore();
  txt('ce cahier appartient à', x, y + 72, 17, { color: C.pencil, weight: 400, alpha: a });
}
function drawSeal(x, y, em, s) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.fillStyle = 'rgba(46,46,51,0.18)'; ctx.beginPath(); ctx.ellipse(2, 20, 20, 6, 0, 0, TAU); ctx.fill();
  waxDisc(ctx, 24);
  ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.beginPath(); ctx.ellipse(-8, -10, 7, 4, -0.6, 0, TAU); ctx.fill();
  ctx.strokeStyle = WAX_D; ctx.fillStyle = WAX_D; ctx.lineWidth = 2.6; drawEmblem(ctx, em, 0.62);
  ctx.restore();
}
function drawSceau(v) {
  for (const st of G.stamps) {
    const k = st.t / st.dur, fade = Math.min(1, (st.dur - st.t) * 1.5);
    if (st.t < 1.1) {   // l'onde de cire
      const q = st.t / 1.1, rr = SCEAU.radius * ease(q);
      ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = WAX; ctx.lineWidth = 10 * (1 - q) + 2; ctx.beginPath(); ctx.arc(st.x, st.y, rr, 0, TAU); ctx.stroke();
      ctx.fillStyle = WAX_L; for (let i = 0; i < 18; i++) { const an = i / 18 * TAU - q; ctx.beginPath(); ctx.arc(st.x + Math.cos(an) * rr, st.y + Math.sin(an) * rr, 5, 0, TAU); ctx.fill(); }
      ctx.restore();
    }
    drawCartouche(st.x, st.y, st.em, fade, false);
    ctx.save(); ctx.globalAlpha = fade; drawSeal(st.x, st.y + 8, st.em, 1.5 + 0.4 * (1 - ease(k * 4))); ctx.restore();
    if (k < 0.6) txt('scellé !', st.x, st.y - 140 - k * 40, 36, { color: WAX, alpha: 1 - k / 0.6, hl: C.hl });
  }
  const S = G.sceau; if (!S) return;
  const a = Math.min(1, S.t * 2), p = G.p;
  if (S.tx + 140 > v.x0 && S.tx - 140 < v.x1 && S.ty + 160 > v.y0 && S.ty - 160 < v.y1) {
    drawCartouche(S.tx, S.ty, S.em, a, S.carried);
    if (S.carried) txt('pose le sceau ici !', S.tx, S.ty + 146, 28, { color: WAX, alpha: a, hl: C.hl });
  }
  if (S.carried) {   // le ruban qui le relie à la goutte
    ctx.save(); ctx.strokeStyle = '#c8424a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.x, p.y);
    ctx.quadraticCurveTo((p.x + S.x) / 2 + Math.sin(G.time * 7) * 8, (p.y + S.y) / 2 + 12, S.x, S.y); ctx.stroke(); ctx.restore();
    drawSeal(S.x, S.y, S.em, 0.85);
  } else {
    const bob = Math.sin(G.time * 3) * 4;
    ctx.save(); ctx.globalAlpha = 0.35 + 0.25 * Math.sin(G.time * 5); ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(S.x, S.y, 40, 0, TAU); ctx.stroke(); ctx.restore();
    ctx.save(); ctx.globalAlpha = a; drawSeal(S.x, S.y + bob, S.em, 1.1); ctx.restore();
    txt(S.lost ? 'ramasse le sceau !' : 'le sceau', S.x, S.y + 52, 24, { color: WAX, alpha: a, hl: C.hl });
  }
}
function drawSceauArrow() {
  if (G.state !== 'play') return;
  const tg = sceauTarget(); if (tg) edgeArrow(tg.x, tg.y);
}
