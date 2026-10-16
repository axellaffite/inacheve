// Les lignes (chapitre I) : une phrase de punition s'écrit en pointillés sur une ligne du cahier.
// Recopie-la en la suivant de gauche à droite, sans aller plus vite que la plume ; les gommes effacent ce que tu as écrit. Ligne finie : la réglure balaie la page.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const LIGNES = { first: 8, again: 20, band: 34, behind: 50, ahead: 90, pen: 160, cw: 19, size: 40, rise: 16, sweep: 260, side: 100 };
// de la plus courte à la plus longue ; la dernière est un clin d'œil au jeu lui-même
const PUNITIONS = [
  'Je ne ferai plus de pâtés.',
  'La gomme n’est pas un jouet.',
  'Je ne gribouillerai plus la marge.',
  'Je recopierai mes lignes sans trembler.',
  'Une goutte d’encre ne court pas dans le cahier.',
  'Je finirai ce que j’ai commencé.'
];

// Une nouvelle phrase, sur une grande ligne Seyès au-dessus ou au-dessous du joueur, qui commence un peu à sa gauche
function writeLignes() {
  const p = G.p, s = PUNITIONS[G.lignes % PUNITIONS.length], len = Math.round(s.length * LIGNES.cw);
  const row = clamp(Math.round(p.y / SQ) + pick([-3, -2, 2, 3]), 2, Math.floor(WORLD.h / SQ) - 2);
  const x0 = clamp(p.x - rnd(160, 320), MARGIN_X + 24, WORLD.w - len - 60);
  // les espaces entre les mots, pour faire sonner chaque mot recopié
  const gaps = []; for (let i = 0; i < s.length; i++) if (s[i] === ' ') gaps.push(i / s.length * len);
  G.ligne = { s, x0, y: row * SQ, cy: row * SQ - LIGNES.rise, len, prog: 0, t: 0, gaps, word: 0, writing: 0, gT: 0, tw: 0 };
  AU.play('lignesNew');
  if (!G.ligneSeen) { G.ligneSeen = true; caption('Nouveau : des lignes à copier !', 3.4, 'green'); caption('Suis les pointillés de gauche à droite', 3.4, 'green'); }
  else caption('Encore une ligne à copier', 2.4, 'green');
}

// Là où la plume attend le joueur : juste devant ce qui est déjà écrit
function lignesTarget() {
  const L = G.ligne; if (!L) return null;
  return { x: L.x0 + Math.min(L.len, L.prog + 40), y: L.cy };
}

function stepLignes(dt) {
  if (CH().paper !== 'seyes') return;
  for (const sw of G.sweeps) sw.t += dt;
  G.sweeps = G.sweeps.filter(sw => sw.t < sw.dur);
  const L = G.ligne;
  if (!L) { if (G.t >= G.nextLigne) writeLignes(); return; }
  L.t += dt; L.writing = Math.max(0, L.writing - dt); L.gT = Math.max(0, L.gT - dt);
  const p = G.p, pen = L.x0 + L.prog;
  if (Math.abs(p.y - L.cy) < LIGNES.band && p.x > pen - LIGNES.behind && p.x < pen + LIGNES.ahead) {
    const np = Math.min(clamp(p.x - L.x0, 0, L.len), L.prog + LIGNES.pen * dt);   // la plume ne court pas plus vite que l'écriture
    if (np > L.prog) {
      L.prog = np; L.writing = 0.15; AU.play('quill');
      while (L.word < L.gaps.length && L.prog >= L.gaps[L.word]) AU.play('ligneMot', L.word++);
      if (L.prog >= L.len) { finishLignes(L); return; }
    }
  }
  // la gomme passe : ce qu'elle touche est effacé, il faut le réécrire
  for (const e of G.enemies) {
    if (e.dead || e.type !== 'gomme' || Math.abs(e.y - L.cy) > 40) continue;
    const cut = e.x - L.x0 - e.r;
    if (e.x + e.r < L.x0 || cut >= L.prog) continue;
    L.prog = Math.max(0, cut);
    L.word = L.gaps.filter(g => g <= L.prog).length;
    if (L.gT <= 0) { L.gT = 1.2; AU.play('figureLost'); addText(e.x, L.cy - 46, 'gommé !', C.red, 26); }
  }
}

// La ligne est copiée : elle reste écrite sur la page, et la réglure balaie tout ce qui est au-dessus et au-dessous
function finishLignes(L) {
  const n = L.gaps.length + 1, x1 = L.x0 + L.len;
  G.lignes++; G.ligne = null; G.nextLigne = G.t + LIGNES.again;
  G.score += 120 * n; G.xp += 4 + n * 2;   // pas de cœur : une punition ne soigne pas
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('lignes', n);
  caption(L.s === PUNITIONS[PUNITIONS.length - 1] ? '… un jour, peut-être.' : pick(['Ligne copiée !', 'Bon point !', 'Cent fois ? Une seule suffira.']), 2.4, 'green');
  G.cam.shake = Math.max(G.cam.shake, 10);
  printLigne(L);
  G.sweeps.push({ x0: L.x0 - LIGNES.side, x1: x1 + LIGNES.side, y: L.cy, t: 0, dur: 0.9, r: LIGNES.sweep });
  for (const e of G.enemies) {
    if (e.dead || e.x < L.x0 - LIGNES.side - e.r || e.x > x1 + LIGNES.side + e.r) continue;
    const dy = e.y - L.cy; if (Math.abs(dy) > LIGNES.sweep + e.r) continue;
    hurtEnemy(e, (e.isBoss ? 60 : 12 + 2 * n) * G.S.dmg, 'lignes');
    if (!e.isBoss) e.vy += Math.sign(dy || 1) * 360;
  }
  for (const b of G.ebul) if (b.x > L.x0 - LIGNES.side && b.x < x1 + LIGNES.side && Math.abs(b.y - L.cy) < LIGNES.sweep) b.life = 0;
  // des lettrines dorées tombent de la ligne, à ramasser
  for (let i = 0; i < 5; i++) { const x = lerp(L.x0, x1, (i + 0.5) / 5); G.items.push({ x, y: L.cy, vx: rnd(-60, 60), vy: rnd(-200, 200), ch: pick(LETTER_POOL), value: 6, rare: true, need: false, t: rnd(TAU), pull: false, rot: rnd(-0.4, 0.4) }); }
  for (let i = 0; i < 30; i++) { const x = lerp(L.x0, x1, rand()); G.parts.push({ x, y: L.cy, vx: rnd(-40, 40), vy: rnd(-320, 320), life: 0.8, max: 0.8, size: rnd(2, 4.5), color: i % 3 ? C.ink : C.gold, drag: 3 }); }
}

// La phrase reste écrite à l'encre sur la page (elle sèche comme le reste), avec la coche rouge de la maîtresse
function printLigne(L) {
  sctx.save(); sctx.scale(STAIN_S, STAIN_S);
  sctx.font = '400 ' + LIGNES.size + 'px ' + FONT_CURSIVE; sctx.textBaseline = 'alphabetic'; sctx.textAlign = 'left';
  const w = sctx.measureText(L.s).width || L.len;
  sctx.globalAlpha = 0.6; sctx.fillStyle = C.ink;
  sctx.save(); sctx.translate(L.x0, L.y); sctx.scale(L.len / w, 1); sctx.fillText(L.s, 0, 0); sctx.restore();
  const cx = L.x0 + L.len + 34, cy = L.cy;
  sctx.globalAlpha = 0.8; sctx.strokeStyle = C.red; sctx.lineWidth = 5; sctx.lineCap = 'round';
  sctx.beginPath(); sctx.moveTo(cx - 14, cy); sctx.lineTo(cx - 3, cy + 13); sctx.lineTo(cx + 18, cy - 20); sctx.stroke();
  sctx.restore();
}

/* ===================== Dessin ===================== */
function drawLignes() {
  // la réglure qui balaie : deux lignes bleues s'éloignent de la phrase, vers le haut et vers le bas
  for (const sw of G.sweeps) {
    const k = sw.t / sw.dur, rr = sw.r * ease(k), a = 1 - k;
    ctx.save(); ctx.globalAlpha = a * 0.35; ctx.fillStyle = C.hl; ctx.fillRect(sw.x0, sw.y - rr, sw.x1 - sw.x0, rr * 2);
    ctx.globalAlpha = a; ctx.strokeStyle = C.inkLight; ctx.lineCap = 'round';
    for (const dir of [-1, 1]) for (let j = 0; j < 3; j++) {
      const y = sw.y + dir * Math.max(0, rr - j * 16);
      ctx.lineWidth = j ? 2 : 6 * a + 2; ctx.beginPath(); ctx.moveTo(sw.x0, y); ctx.lineTo(sw.x1, y); ctx.stroke();
    }
    ctx.restore();
  }
  const L = G.ligne; if (!L) return;
  const k = Math.min(1, L.t * 2), pen = L.x0 + L.prog;
  ctx.save(); ctx.font = '400 ' + LIGNES.size + 'px ' + FONT_CURSIVE; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
  if (!L.tw) L.tw = ctx.measureText(L.s).width || L.len;
  // la piste qui reste à écrire, à peine surlignée
  ctx.globalAlpha = k * 0.3; ctx.fillStyle = C.hl; ctx.fillRect(pen, L.cy - LIGNES.band * 0.8, L.x0 + L.len - pen, LIGNES.band * 1.6);
  ctx.translate(L.x0, L.y); ctx.scale(L.len / L.tw, 1);
  // le modèle en pointillés au crayon…
  ctx.globalAlpha = k * 0.7; ctx.strokeStyle = C.pencil; ctx.lineWidth = 1.4; ctx.setLineDash([3, 4]); ctx.strokeText(L.s, 0, 0); ctx.setLineDash([]);
  // … et ce qui est déjà recopié, à l'encre
  if (L.prog > 0) {
    ctx.save(); ctx.beginPath(); ctx.rect(-10, -LIGNES.size * 1.3, L.prog * L.tw / L.len + 10, LIGNES.size * 2); ctx.clip();
    ctx.globalAlpha = k; ctx.fillStyle = C.ink; ctx.fillText(L.s, 0, 0); ctx.restore();
  }
  ctx.restore();
  // la plume : là où il faut reprendre
  const pulse = 1 + 0.12 * Math.sin(G.time * 6);
  ctx.save(); ctx.translate(pen, L.cy); ctx.globalAlpha = k;
  ctx.fillStyle = C.hl; ctx.globalAlpha = k * 0.85; ctx.beginPath(); ctx.arc(0, 0, 22 * pulse, 0, TAU); ctx.fill();
  ctx.globalAlpha = k; ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.stroke();
  // une petite plume métallique, pointe en bas
  ctx.rotate(-0.5 + (L.writing > 0 ? 0.15 * Math.sin(G.time * 40) : 0));
  ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(-7, -14); ctx.lineTo(0, -20); ctx.lineTo(7, -14); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.paper; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(0, 8); ctx.lineTo(0, -10); ctx.stroke();
  ctx.restore();
  if (L.prog <= 0) txt('copie ici →', pen - 24, L.cy - 52, 26, { align: 'right', color: C.gold, alpha: k, hl: C.hl });
  else txt(Math.floor(100 * L.prog / L.len) + ' %', L.x0 + L.len + 40, L.cy - 2, 24, { align: 'left', color: C.pencil, alpha: k * 0.9 });
}
function drawLignesArrow() {
  const tg = lignesTarget(); if (tg && G.state === 'play') edgeArrow(tg.x, tg.y);
}
