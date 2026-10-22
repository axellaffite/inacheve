// Les rimes (itération 20) : au chapitre XI, des fiches bristol sont posées face cachée sur la page.
// Marche sur une fiche pour la retourner, puis sur une autre : si les deux mots riment, elles restent ouvertes.
// Toutes les paires trouvées : le poème est récité et frappe toute la page. Un jeu de mémoire, en somme.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const RIMES = { first: 8, again: 20, cw: 112, ch: 140, gap: 34, inset: 14, d0: 300, d1: 460, radius: 560, endDur: 1.6, show: 0.95, flip: 0.22 };
// des paires qui riment (et aucune ne rime avec une autre), avec le vers qu'elles écrivent ensemble
const PAIRES_RIMES = [
  ['LUNE', 'PLUME', 'La lune a pris ma plume'],
  ['PAGE', 'NUAGE', 'un nuage a bu ma page'],
  ['GOMME', 'POMME', 'ma gomme sent la pomme'],
  ['CRAIE', 'FORÊT', 'j’ai dessiné une forêt à la craie'],
  ['CAHIER', 'ÉCOLIER', 'l’écolier dort sur son cahier'],
  ['CHAT', 'CHOCOLAT', 'le chat a mangé le chocolat'],
  ['SOLEIL', 'ABEILLE', 'une abeille a réveillé le soleil'],
  ['ÉTOILE', 'VOILE', 'une étoile a mis les voiles'],
  ['FLEUR', 'CŒUR', 'j’ai une fleur dans le cœur'],
  ['MOT', 'OISEAU', 'chaque mot est un oiseau'],
  ['PLUIE', 'NUIT', 'la pluie a lavé la nuit'],
  ['BALLON', 'VIOLON', 'mon ballon joue du violon'],
  ['ROSE', 'CHOSE', 'une rose m’a dit quelque chose'],
  ['ENCRE', 'ANCRE', 'mon encre a jeté l’ancre'],
  ['TROMPETTE', 'CHAUSSETTE', 'il y a une trompette dans ma chaussette']
];
const RIMES_GRID = [0, 0, 0, 3, 4, 5, 4];   // colonnes selon le nombre de paires (3 à 6)
const RIME_TINTS = ['#ffd6e6', '#cfe8ff', '#ffe3b8', '#d6f2cf', '#e8d6ff', '#fff1a6'];

function rimesCardAt(K, x, y) {   // la fiche sous ce point (un peu à l'intérieur : on peut marcher entre les fiches)
  const hw = RIMES.cw / 2 - RIMES.inset, hh = RIMES.ch / 2 - RIMES.inset;
  for (const c of K.cards) if (Math.abs(x - c.x) < hw && Math.abs(y - c.y) < hh) return c;
  return null;
}
function writeRimes() {
  const p = G.p, n = Math.min(6, 3 + (G.poemes || 0)), cols = RIMES_GRID[n], rows = 2 * n / cols;
  const gw = cols * RIMES.cw + (cols - 1) * RIMES.gap, gh = rows * RIMES.ch + (rows - 1) * RIMES.gap, mx = gw / 2 + 60, my = gh / 2 + 60;
  let x = WORLD.w / 2, y = WORLD.h / 2;
  for (let i = 0; i < 40; i++) {
    const a = rnd(TAU), d = rnd(RIMES.d0, RIMES.d1);
    x = clamp(p.x + Math.cos(a) * d, mx, WORLD.w - mx); y = clamp(p.y + Math.sin(a) * d, my, WORLD.h - my);
    if (Math.abs(p.x - x) > gw / 2 + 70 || Math.abs(p.y - y) > gh / 2 + 70) break;   // la goutte n'est pas déjà dessus
  }
  const ids = PAIRES_RIMES.map((_, i) => i);
  for (let i = ids.length - 1; i > 0; i--) { const k = Math.floor(rand() * (i + 1)); [ids[i], ids[k]] = [ids[k], ids[i]]; }
  const pairs = ids.slice(0, n), deck = [];
  pairs.forEach((pi, k) => { deck.push({ pair: pi, w: 0, tint: k }); deck.push({ pair: pi, w: 1, tint: k }); });
  for (let i = deck.length - 1; i > 0; i--) { const k = Math.floor(rand() * (i + 1)); [deck[i], deck[k]] = [deck[k], deck[i]]; }
  const cards = deck.map((c, i) => Object.assign(c, {
    x: x - gw / 2 + RIMES.cw / 2 + (i % cols) * (RIMES.cw + RIMES.gap), y: y - gh / 2 + RIMES.ch / 2 + Math.floor(i / cols) * (RIMES.ch + RIMES.gap),
    state: 'down', flip: 0, seen: false, tilt: rnd(-0.05, 0.05), shake: 0
  }));
  G.rimes = { x, y, gw, gh, pairs, cards, first: null, second: null, hideT: 0, on: null, t: 0, end: false, endT: 0, wrong: 0, found: 0, verses: [] };
  AU.play('rimesNew');
  if (!G.rimesSeen) { G.rimesSeen = true; caption('Nouveau : les rimes ! Des fiches sont posées face cachée…', 3.4, 'green'); caption('Retourne-les deux par deux : trouve les mots qui riment.', 3.6, 'green'); }
  else caption(pick(['Des rimes ! ' + n + ' paires à trouver.', 'Encore des fiches : ' + n + ' paires de rimes.', 'Un poème à trous : ' + n + ' rimes à retrouver.']), 2.4, 'green');
}
function stepRimes(dt) {
  if (CH().paper !== 'poesie') return;
  for (const f of G.rimesFx) f.t += dt;
  G.rimesFx = G.rimesFx.filter(f => f.t < f.dur);
  const K = G.rimes;
  if (!K) { if (G.t >= G.nextRimes) writeRimes(); return; }
  K.t += dt;
  for (const c of K.cards) { c.flip = clamp(c.flip + (c.state === 'down' ? -1 : 1) * dt / RIMES.flip, 0, 1); c.shake = Math.max(0, c.shake - dt); }
  if (K.end) { K.endT += dt; if (K.endT >= RIMES.endDur) G.rimes = null; return; }
  if (K.hideT > 0) {   // les deux fiches qui ne riment pas se retournent
    K.hideT -= dt;
    if (K.hideT <= 0) { K.first.state = 'down'; K.second.state = 'down'; K.first = K.second = null; }
  }
  const p = G.p, cur = p.dashT > 0 ? K.on : rimesCardAt(K, p.x, p.y);   // pendant un pâté, la goutte saute par-dessus les fiches
  if (cur === K.on) return;
  K.on = cur;
  if (!cur || cur.state !== 'down' || K.hideT > 0) return;
  cur.state = 'up'; cur.seen = true;
  AU.play('rimeFlip', K.first ? 2 : 1);
  if (!K.first) { K.first = cur; return; }
  const a = K.first;
  if (a.pair === cur.pair) {   // ça rime !
    a.state = cur.state = 'done'; K.first = null; K.found++;
    const P = PAIRES_RIMES[cur.pair];
    K.verses.push(P[2]);
    AU.play('rimeOk', K.found);
    addText((a.x + cur.x) / 2, Math.min(a.y, cur.y) - RIMES.ch / 2 - 20, P[0].toLowerCase() + ' / ' + P[1].toLowerCase(), C.ink, 30);
    G.score += 120; G.xp += 2;
    if (K.found === K.pairs.length) solveRimes(K);
  } else {   // ça ne rime pas : elles se retournent, et deux vers s'échappent
    K.second = cur; K.hideT = RIMES.show; K.wrong++; a.shake = cur.shake = 0.4;
    AU.play('rimeNon');
    addText(cur.x, cur.y - RIMES.ch / 2 - 20, 'ça ne rime pas !', C.red, 26);
    for (let i = 0; i < 2; i++) { const an = rnd(TAU); spawnEnemy('ver', clamp(cur.x + Math.cos(an) * 110, 30, WORLD.w - 30), clamp(cur.y + Math.sin(an) * 110, 30, WORLD.h - 30)); }
  }
}
function rimesImprint(K) {   // le poème reste recopié sur la page, à l'encre, avec son titre souligné
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.textAlign = 'center'; sctx.textBaseline = 'middle';
  const top = K.y - (K.verses.length + 1) * 21;
  sctx.globalAlpha = 0.34; sctx.fillStyle = C.ink; sctx.font = '400 40px ' + FONT_CURSIVE; sctx.fillText('Poème n° ' + G.poemes, K.x, top);
  sctx.globalAlpha = 0.4; sctx.strokeStyle = C.red; sctx.lineWidth = 3; sctx.beginPath(); sctx.moveTo(K.x - 120, top + 24); sctx.lineTo(K.x + 120, top + 22); sctx.stroke();
  sctx.globalAlpha = 0.3; sctx.font = '400 28px ' + FONT_CURSIVE;
  K.verses.forEach((v, i) => sctx.fillText(i === K.verses.length - 1 ? v + '.' : v + ',', K.x, top + 64 + i * 42));
  sctx.restore();
}
function solveRimes(K) {
  const p = G.p, n = ++G.poemes, k = Math.min(6, n), X = K.x, Y = K.y, R = RIMES.radius, clean = K.wrong <= 1;
  K.end = true; K.endT = 0; G.nextRimes = G.t + RIMES.again;
  G.score += (500 + 120 * k) * (clean ? 1.5 : 1); G.xp += 8 + 2 * k; p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('rimesFin');
  caption(clean ? 'Récité par cœur, presque sans faute !' : 'Le poème est complet : récitation !', clean ? 2.8 : 2.2, 'green');
  caption('« ' + K.verses[0] + '… »', 2.6, 'hl');
  G.cam.shake = Math.max(G.cam.shake, 12);
  G.rimesFx.push({ x: X, y: Y, t: 0, dur: 1.4, words: K.pairs.map(i => PAIRES_RIMES[i][0]).concat(K.pairs.map(i => PAIRES_RIMES[i][1])) });
  rimesImprint(K);
  query(X, Y, R + 60, tmpA);
  for (const e of tmpA) {
    const dx = e.x - X, dy = e.y - Y, d = Math.hypot(dx, dy) || 1;
    if (e.dead || d > R + e.r) continue;
    hurtEnemy(e, (e.isBoss ? 90 : 22 + 4 * k) * (clean ? 1.25 : 1) * G.S.dmg, 'rimes');
    if (!e.isBoss) { e.vx += dx / d * 440; e.vy += dy / d * 440; }
  }
  const R2 = R * R;
  for (const b of G.ebul) if ((b.x - X) ** 2 + (b.y - Y) ** 2 < R2) b.life = 0;
  G.fromages = G.fromages.filter(f => f.landed);
  G.pieds = G.pieds.filter(f => f.t >= 0 || (f.x - X) ** 2 + (f.y - Y) ** 2 > R2);
  for (let i = 0; i < 5; i++) { const a = i / 5 * TAU; G.items.push({ x: X, y: Y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, ch: pick(LETTER_POOL), value: 7, rare: true, need: false, t: rnd(TAU), pull: false, rot: rnd(-0.4, 0.4) }); }
  for (let i = 0; i < 40; i++) { const a = rnd(TAU), s = rnd(160, 560); G.parts.push({ x: X, y: Y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.9, max: 0.9, size: rnd(3, 6), color: RIME_COLS[i % RIME_COLS.length], drag: 3 }); }
}

// le pilote joue au jeu de mémoire avec une bonne mémoire : il retient toutes les fiches qu'il a vues
function rimesTarget() {
  const K = G.rimes; if (!K || K.end || K.hideT > 0) return null;
  const down = K.cards.filter(c => c.state === 'down'), p = G.p;
  const nearest = list => { let b = null, bd = 1e9; for (const c of list) { const d = Math.hypot(c.x - p.x, c.y - p.y); if (d < bd) { bd = d; b = c; } } return b; };
  let goal = null;
  if (K.first) goal = down.find(c => c.seen && c.pair === K.first.pair) || nearest(down.filter(c => !c.seen));
  else {
    const known = down.filter(c => c.seen && down.some(o => o !== c && o.seen && o.pair === c.pair));
    goal = nearest(known) || nearest(down.filter(c => !c.seen));
  }
  goal = goal || nearest(down);
  K.botGoal = goal;
  if (!goal) return null;
  if (goal === K.on) return { x: goal.x, y: goal.y + RIMES.ch };   // on est déjà dessus : il faut en sortir pour la retourner
  return { x: goal.x, y: goal.y };
}
function rimesDanger(x, y) {   // le pilote passe entre les fiches qu'il ne veut pas retourner
  const K = G.rimes; if (!K || K.end) return 0;
  const c = rimesCardAt(K, x, y);
  return c && c.state === 'down' && c !== K.botGoal ? 6 : 0;
}

function drawRimes(v) {
  for (const f of G.rimesFx) {   // la récitation : les mots du poème s'envolent en couronne
    const q = f.t / f.dur, rr = RIMES.radius * ease(q);
    ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#8a4fc9'; ctx.lineWidth = 10 * (1 - q) + 2; ctx.setLineDash([22, 12]); ctx.beginPath(); ctx.arc(f.x, f.y, rr, 0, TAU); ctx.stroke(); ctx.restore();
    if (1 - q > 0.05) f.words.forEach((w, i) => { const a = i / f.words.length * TAU + q; txt(w.toLowerCase(), f.x + Math.cos(a) * rr * 0.9, f.y + Math.sin(a) * rr * 0.9, 26, { color: RIME_COLS[i % RIME_COLS.length], alpha: 1 - q }); });
    if (q < 0.7) txt('Récité !', f.x, f.y - 130 - q * 40, 56, { font: FONT_CURSIVE, weight: 400, color: C.ink, alpha: 1 - q / 0.7, hl: C.hlGold });
  }
  const K = G.rimes; if (!K) return;
  if (K.x + K.gw / 2 + 80 < v.x0 || K.x - K.gw / 2 - 80 > v.x1 || K.y + K.gh / 2 + 80 < v.y0 || K.y - K.gh / 2 - 80 > v.y1) return;
  const appear = ease(K.t / 0.6), fade = K.end ? clamp(1 - K.endT / RIMES.endDur, 0, 1) : 1;
  const cw = RIMES.cw, ch = RIMES.ch;
  K.cards.forEach((c, i) => {
    const deal = ease(K.t * 3 - i * 0.12);   // les fiches sont distribuées une à une
    if (deal <= 0) return;
    const sx = Math.abs(Math.cos(c.flip * Math.PI)), face = c.flip > 0.5, P = PAIRES_RIMES[c.pair];
    ctx.save(); ctx.globalAlpha = appear * fade * deal;
    ctx.translate(c.x + (c.shake > 0 ? Math.sin(c.shake * 60) * 4 : 0), c.y - (1 - deal) * 40); ctx.rotate(c.tilt); ctx.scale(Math.max(0.04, sx), 1);
    ctx.fillStyle = 'rgba(46,46,51,0.16)'; roundRect(-cw / 2 + 5, -ch / 2 + 6, cw, ch, 10); ctx.fill();
    if (!face) {   // le dos : violet, une lune et des étoiles
      ctx.fillStyle = '#7b5ea7'; roundRect(-cw / 2, -ch / 2, cw, ch, 10); ctx.fill(); ctx.strokeStyle = '#4d3878'; ctx.lineWidth = 3; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; roundRect(-cw / 2 + 8, -ch / 2 + 8, cw - 16, ch - 16, 6); ctx.stroke();
      ctx.fillStyle = '#f6e7a8'; ctx.beginPath(); ctx.arc(-6, -10, 22, 0.9, TAU - 0.9); ctx.arc(4, -16, 18, TAU - 1.1, 1.1, true); ctx.closePath(); ctx.fill();
      for (const [sx2, sy2] of [[26, -40], [30, 22], [-30, 38]]) { ctx.beginPath(); ctx.arc(sx2, sy2, 3, 0, TAU); ctx.fill(); }
      txt('?', 0, 40, 30, { color: 'rgba(255,255,255,0.7)' });
    } else {   // la face : une fiche bristol réglée, et son mot
      const done = c.state === 'done', bad = K.hideT > 0 && (c === K.first || c === K.second);
      ctx.fillStyle = done ? RIME_TINTS[c.tint % RIME_TINTS.length] : '#fffdf6'; roundRect(-cw / 2, -ch / 2, cw, ch, 10); ctx.fill();
      ctx.strokeStyle = done ? C.gold : bad ? C.red : '#9d8fc2'; ctx.lineWidth = done ? 4 : 3; ctx.stroke();
      ctx.strokeStyle = 'rgba(150,130,210,0.3)'; ctx.lineWidth = 1.2; ctx.beginPath(); for (let y = -ch / 2 + 30; y < ch / 2; y += 22) { ctx.moveTo(-cw / 2 + 8, y); ctx.lineTo(cw / 2 - 8, y); } ctx.stroke();
      ctx.strokeStyle = 'rgba(224,106,108,0.5)'; ctx.beginPath(); ctx.moveTo(-cw / 2 + 18, -ch / 2 + 4); ctx.lineTo(-cw / 2 + 18, ch / 2 - 4); ctx.stroke();
      const w = P[c.w];
      txt(w, 4, -4, w.length > 7 ? 19 : w.length > 5 ? 23 : 28, { color: bad ? C.red : C.ink });
      if (done) txt('rime !', 4, 38, 20, { color: C.gold, rot: -0.06 });
    }
    ctx.restore();
  });
  if (!K.end && K.found) txt(K.found + ' / ' + K.pairs.length + ' rimes', K.x, K.y - K.gh / 2 - 34, 26, { color: '#7b5ea7', alpha: appear });
  if (!K.end && K.wrong) txt('ça ne rime pas : ' + K.wrong, K.x, K.y + K.gh / 2 + 32, 22, { color: C.red, alpha: appear });
}
function drawRimesArrow() {
  if (G.state !== 'play') return;
  const K = G.rimes; if (!K || K.end) return;
  edgeArrow(K.x, K.y);
}
