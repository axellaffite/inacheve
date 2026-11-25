// La farandole des copains (itération 32, chapitre XVII) : le dernier jour, les copains de la classe viennent écrire une
// dédicace dans ton cahier, puis te suivent en file indienne en tirant avec leur plume. Six copains : la ronde !
'use strict';

const FARA = { first: 10, again: 12, wait: 24, max: 6, d0: 380, d1: 680, catchR: 34, step: 6, gap: 5, rate: 0.45, dmg: 0.45, range: 440,
  inv: 1.5, ronde: 9, rondeR: 150, rondeSpin: 2.4, rondeDmg: 48, rondeCd: 0.25, dedis: 12 };
const COPAINS = [
  { ink: '#e0569b', deep: '#a8326d', acc: 'noeud' }, { ink: '#f08a2c', deep: '#b15c12', acc: 'casquette' },
  { ink: '#8a5cd6', deep: '#5d3a9e', acc: 'lunettes' }, { ink: '#1fa3a8', deep: '#13706f', acc: 'couettes' },
  { ink: '#d94a3a', deep: '#9c2d22', acc: 'paille' }, { ink: '#c9a21a', deep: '#8a6d0c', acc: 'bonnet' }
];
const DEDICACES = ['Bonnes vacances !', 'À l’année prochaine !', 'Ne m’oublie pas !', 'Écris-moi cet été !', 'Tu es une super goutte !', 'Vive les vacances !',
  'On se revoit en septembre ?', 'Gros bisous d’encre', 'Ton copain du fond de la classe', 'Reste comme tu es !', 'Pense à moi à la plage', 'Merci pour la gomme !'];
VOISIN_SAYS.dernier = ['Tu m’écris pendant les vacances ?', 'Moi aussi, je signe !', 'Plus que quelques heures !', 'À l’année prochaine, voisin !'];

function stepFarandole(dt) {
  if (!enDernier()) return;
  const p = G.p;
  // le chemin de la goutte, que la file suit pas à pas
  const P = G.fpath, last = P[0];
  if (!last || (last.x - p.x) ** 2 + (last.y - p.y) ** 2 > FARA.step * FARA.step) { P.unshift({ x: p.x, y: p.y }); if (P.length > (FARA.max + 1) * FARA.gap + 4) P.length = (FARA.max + 1) * FARA.gap + 4; }
  stepCopainWaiting(dt);
  const R = G.ronde;
  if (R) R.t += dt;
  G.fara.forEach((c, i) => {
    if (c.inv > 0) c.inv -= dt;
    if (R) {   // la ronde : ils tournent autour de toi en se donnant la main
      const a = R.t * FARA.rondeSpin + i / G.fara.length * TAU, rr = FARA.rondeR * Math.min(1, R.t * 2);
      c.x = lerp(c.x, p.x + Math.cos(a) * rr, 1 - Math.exp(-dt * 14)); c.y = lerp(c.y, p.y + Math.sin(a) * rr, 1 - Math.exp(-dt * 14));
      c.face = a + Math.PI / 2;
      query(c.x, c.y, 80, tmpA);
      for (const e of tmpA) if (!e.dead && !e.ghost && (e.rondeCd || 0) <= G.t && (e.x - c.x) ** 2 + (e.y - c.y) ** 2 < (e.r + 16) ** 2) {
        e.rondeCd = G.t + FARA.rondeCd; hurtEnemy(e, FARA.rondeDmg * G.S.dmg, 'ronde', Math.cos(a), Math.sin(a));
        if (e.dead) G.faraKills = (G.faraKills || 0) + 1;
      }
      for (const b of G.ebul) if (b.wait === undefined || b.wait <= 0) { if ((b.x - c.x) ** 2 + (b.y - c.y) ** 2 < 22 * 22) b.life = 0; }   // la ronde arrête les coups
      return;
    }
    const t = P[Math.min(P.length - 1, (i + 1) * FARA.gap)] || p, k = 1 - Math.exp(-dt * 12);
    const ox = c.x; c.x = lerp(c.x, t.x, k); c.y = lerp(c.y, t.y, k);
    if (Math.abs(c.x - ox) > 0.3) c.face = Math.atan2(t.y - c.y, t.x - c.x);
    // sa plume tire toute seule sur la rature la plus proche
    c.fire -= dt;
    if (c.fire <= 0 && !G.freeze) {
      let tgt = null, bd = FARA.range * FARA.range;
      for (const e of G.enemies) { if (e.ghost) continue; const d = (e.x - c.x) ** 2 + (e.y - c.y) ** 2; if (d < bd) { bd = d; tgt = e; } }
      if (tgt) {
        c.fire = 1 / (G.S.rate * FARA.rate); const a = Math.atan2(tgt.y - c.y, tgt.x - c.x); c.look = a;
        G.shots.push({ x: c.x + Math.cos(a) * 12, y: c.y + Math.sin(a) * 12, vx: Math.cos(a) * G.S.pspeed, vy: Math.sin(a) * G.S.pspeed, r: 5, life: 1.1, pierce: 0, bounce: 0, hit: new Set(), px: c.x, py: c.y, copain: COPAINS[c.n].ink, k: FARA.dmg });
      } else c.fire = 0.15;
    }
    if (c.inv > 0) return;
    // une rature ou un coup qui le touche : il lâche la main et rentre chez lui
    let hit = false;
    for (const e of G.enemies) if (!e.ghost && !e.dead && (e.x - c.x) ** 2 + (e.y - c.y) ** 2 < (e.r + 10) ** 2) { hit = true; break; }
    if (!hit) for (const b of G.ebul) if (!(b.wait > 0) && (b.x - c.x) ** 2 + (b.y - c.y) ** 2 < 14 * 14) { b.life = 0; hit = true; break; }
    if (hit) c.out = true;
  });
  const outs = G.fara.filter(c => c.out);
  if (outs.length) {
    G.fara = G.fara.filter(c => !c.out);
    for (const c of outs) copainLeaves(c, 'Ouille ! À la rentrée !');
    AU.play('copainOut'); G.copainsOut = (G.copainsOut || 0) + outs.length;
  }
  if (R && R.t >= FARA.ronde) endRonde();
  for (const c of G.partis) { c.t += dt; c.x += c.vx * dt; c.y += c.vy * dt; c.vy -= 30 * dt; }
  G.partis = G.partis.filter(c => c.t < 2.4);
  for (const d of G.dedis) d.t += dt;
}
function stepCopainWaiting(dt) {
  const C0 = G.copain, p = G.p;
  if (!C0) {
    if (G.t >= G.nextCopain && G.fara.length < FARA.max && !G.ronde && G.state === 'play') spawnCopain();
    return;
  }
  C0.t += dt;
  if ((p.x - C0.x) ** 2 + (p.y - C0.y) ** 2 < (p.r + FARA.catchR) ** 2) { copainJoins(C0); return; }
  if (C0.t >= FARA.wait) {   // il n'a pas pu attendre
    copainLeaves(C0, 'Tant pis, à la rentrée !'); G.copain = null; G.nextCopain = G.t + FARA.again * 0.5;
  }
}
function spawnCopain() {
  const p = G.p, used = new Set(G.fara.map(c => c.n));
  let n = G.copainN % COPAINS.length; for (let k = 0; k < COPAINS.length && used.has(n); k++) n = (n + 1) % COPAINS.length;
  G.copainN++;
  const a = rnd(TAU), d = rnd(FARA.d0, FARA.d1);
  G.copain = { n, x: clamp(p.x + Math.cos(a) * d, 90, WORLD.w - 90), y: clamp(p.y + Math.sin(a) * d, 90, WORLD.h - 90), t: 0, face: 0, look: 0, txt: DEDICACES[G.dediN % DEDICACES.length] };
  G.dediN++;
  AU.play('copain');
  if (!G.copainSeen) { G.copainSeen = true; caption('Un copain veut écrire dans ton cahier ! Va le voir avant qu’il parte…', 3.2, 'green'); }
}
function copainJoins(c) {
  G.copain = null; G.nextCopain = G.t + FARA.again;
  G.dedis.push({ x: c.x, y: c.y - 34, text: c.txt, col: COPAINS[c.n].ink, rot: rnd(-0.12, 0.12), t: 0 });
  if (G.dedis.length > FARA.dedis) G.dedis.shift();
  const last = G.fara[G.fara.length - 1] || G.p;
  G.fara.push({ n: c.n, x: c.x, y: c.y, face: Math.atan2(last.y - c.y, last.x - c.x), look: 0, fire: 0.6, inv: FARA.inv });
  G.copains = (G.copains || 0) + 1;
  G.score += 150; G.xp += 4;
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('dedicace', G.fara.length);
  addText(c.x, c.y - 60, '« ' + c.txt + ' »', COPAINS[c.n].deep, 24);
  if (G.fara.length === 2 && !G.faraSeen) { G.faraSeen = true; caption('Ils te suivent en farandole et tirent avec leur plume. Six copains, et c’est la ronde !', 3.4, 'green'); }
  if (G.fara.length >= FARA.max) startRonde();
}
function copainLeaves(c, say) {
  const a = rnd(TAU);
  G.partis.push({ n: c.n, x: c.x, y: c.y, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260 - 80, t: 0, say });
}
function startRonde() {
  G.ronde = { t: 0 }; G.copain = null;
  AU.play('ronde'); G.cam.shake = Math.max(G.cam.shake, 4);
  caption('La farandole est complète : c’est la ronde ! Les copains tournent autour de toi…', 3, 'green');
  if (G.v && typeof voisinSay === 'function') voisinSay('dernier');
}
function endRonde() {
  G.ronde = null; G.rondes = (G.rondes || 0) + 1;
  G.fara.forEach((c, i) => { const a = i / G.fara.length * TAU; G.partis.push({ n: c.n, x: c.x, y: c.y, vx: Math.cos(a) * 330, vy: Math.sin(a) * 330, t: 0, say: 'Bonnes vacances !' }); });
  G.fara = []; G.fpath.length = 0; G.nextCopain = G.t + FARA.again;
  G.score += 600; G.xp += 15;
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  G.p.hp = Math.min(G.p.maxHp, G.p.hp + 1);
  AU.play('rondeFin');
  caption('« Bonnes vacances ! » La ronde se défait… et un cœur pour toi !', 2.8, 'green');
}
function farandoleTarget() { return enDernier() && G.copain && !G.ronde ? G.copain : null; }

/* ---------- dessin ---------- */
function drawDedis(v) {   // les dédicaces écrites dans le cahier, qui s'écrivent de gauche à droite
  for (const d of G.dedis) {
    if (d.x < v.x0 - 300 || d.x > v.x1 + 300 || d.y < v.y0 - 60 || d.y > v.y1 + 60) continue;
    ctx.save(); ctx.font = '700 30px ' + FONT_MAIN;
    const w = ctx.measureText(d.text).width, k = clamp(d.t / 0.9, 0, 1);
    ctx.translate(d.x, d.y); ctx.rotate(d.rot);
    ctx.beginPath(); ctx.rect(-w / 2 - 10, -30, (w + 20) * k, 60); ctx.clip();
    txt(d.text, 0, 0, 30, { color: d.col, alpha: 0.75 });
    ctx.restore();
  }
}
function drawCopain(c, ink, deep, acc, wave) {
  drawPlayer({ x: c.x, y: c.y, r: 12, squash: 0, face: c.face || 0, look: c.look || c.face || 0, inv: 0, dashCd: 0, dashT: 0, hidden: 0 }, [ink, deep]);
  drawAcc(acc, c.x, c.y - 12, ink, deep);
  if (wave) {   // il agite la main
    ctx.save(); ctx.strokeStyle = deep; ctx.lineWidth = 2.5; ctx.lineCap = 'round';
    const a = -1.1 + Math.sin(G.time * 10) * 0.4; ctx.beginPath(); ctx.moveTo(c.x + 10, c.y - 4); ctx.lineTo(c.x + 10 + Math.cos(a) * 16, c.y - 4 + Math.sin(a) * 16); ctx.stroke(); ctx.restore();
  }
}
function drawAcc(acc, x, y, ink, deep) {   // un signe distinctif sur la tête
  ctx.save(); ctx.translate(x, y); ctx.lineWidth = 2; ctx.lineJoin = 'round';
  if (acc === 'noeud') { ctx.fillStyle = '#ff7fb6'; ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(-9, -8); ctx.lineTo(-9, 4); ctx.closePath(); ctx.moveTo(0, -2); ctx.lineTo(9, -8); ctx.lineTo(9, 4); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(0, -2, 3, 0, TAU); ctx.fill(); }
  else if (acc === 'casquette') { ctx.fillStyle = '#3c66c4'; ctx.beginPath(); ctx.arc(0, 2, 10, Math.PI, TAU); ctx.fill(); ctx.fillRect(4, 0, 12, 3); }
  else if (acc === 'lunettes') { ctx.strokeStyle = C.graphite; ctx.beginPath(); ctx.arc(-5, 16, 4.5, 0, TAU); ctx.moveTo(9.5, 16); ctx.arc(5, 16, 4.5, 0, TAU); ctx.moveTo(-0.5, 16); ctx.lineTo(0.5, 16); ctx.stroke(); }
  else if (acc === 'couettes') { ctx.strokeStyle = deep; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-8, 4); ctx.quadraticCurveTo(-18, 0, -16, 12); ctx.moveTo(8, 4); ctx.quadraticCurveTo(18, 0, 16, 12); ctx.stroke(); }
  else if (acc === 'paille') { ctx.fillStyle = '#e8c86a'; ctx.strokeStyle = '#a8862a'; ctx.beginPath(); ctx.ellipse(0, 2, 17, 4, 0, 0, TAU); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 1, 8, Math.PI, TAU); ctx.fill(); ctx.stroke(); ctx.fillStyle = C.red; ctx.fillRect(-8, -1, 16, 2.5); }
  else { ctx.fillStyle = '#4f9ad8'; ctx.beginPath(); ctx.arc(0, 3, 10, Math.PI, TAU); ctx.fill(); ctx.fillStyle = '#fffdf4'; ctx.fillRect(-10, 1, 20, 4); ctx.beginPath(); ctx.arc(0, -9, 4, 0, TAU); ctx.fill(); }
  ctx.restore();
}
function drawFarandole() {
  if (!G.fara || !enDernier()) return;
  const p = G.p;
  // les mains qui se tiennent : un trait qui relie la file
  if (G.fara.length) {
    ctx.save(); ctx.strokeStyle = C.pencil; ctx.globalAlpha = 0.5; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
    if (G.ronde) { G.fara.forEach((c, i) => { if (i === 0) ctx.moveTo(c.x, c.y); else ctx.lineTo(c.x, c.y); }); ctx.closePath(); }
    else { ctx.moveTo(p.x, p.y); for (const c of G.fara) ctx.lineTo(c.x, c.y); }
    ctx.stroke(); ctx.restore();
  }
  if (G.ronde) {
    const k = clamp(1 - G.ronde.t / FARA.ronde, 0, 1);
    ctx.save(); ctx.strokeStyle = C.gold; ctx.globalAlpha = 0.35; ctx.lineWidth = 6; ctx.setLineDash([12, 12]); ctx.lineDashOffset = -G.time * 60;
    ctx.beginPath(); ctx.arc(p.x, p.y, FARA.rondeR, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke(); ctx.restore();
  }
  for (const c of G.fara) { const K = COPAINS[c.n]; ctx.save(); if (c.inv > 0 && Math.floor(G.time * 14) % 2) ctx.globalAlpha = 0.5; drawCopain(c, K.ink, K.deep, K.acc, !!G.ronde); ctx.restore(); }
  for (const c of G.partis) {
    const K = COPAINS[c.n], a = clamp(1 - (c.t - 1.6) / 0.8, 0, 1);
    ctx.save(); ctx.globalAlpha = a; drawCopain(c, K.ink, K.deep, K.acc, true); ctx.restore();
    if (c.t < 1.4) txt(c.say, c.x, c.y - 44, 20, { color: K.deep, alpha: a });
  }
  const W0 = G.copain;
  if (W0) {   // il attend en sautillant, avec sa bulle, et un pointillé qui dit le temps qui reste
    const K = COPAINS[W0.n], hop = Math.abs(Math.sin(G.time * 6)) * 6, k = clamp(1 - W0.t / FARA.wait, 0, 1);
    W0.face = Math.atan2(p.y - W0.y, p.x - W0.x); W0.look = W0.face;
    ctx.save(); ctx.strokeStyle = k < 0.25 ? C.red : K.ink; ctx.globalAlpha = 0.6; ctx.lineWidth = 3; ctx.setLineDash([6, 7]);
    ctx.beginPath(); ctx.arc(W0.x, W0.y, 38, -Math.PI / 2, -Math.PI / 2 + TAU * k); ctx.stroke(); ctx.restore();
    drawCopain({ x: W0.x, y: W0.y - hop, face: W0.face, look: W0.look }, K.ink, K.deep, K.acc, true);
    const say = W0.t < FARA.wait - 4 ? 'Je peux écrire dans ton cahier ?' : 'Vite, je dois partir !';
    ctx.save(); ctx.font = '700 19px ' + FONT_MAIN;
    const w = ctx.measureText(say).width + 22, bx = W0.x - w / 2, by = W0.y - 84;
    ctx.fillStyle = '#fdfcf6'; ctx.strokeStyle = K.deep; ctx.lineWidth = 2; roundRect(bx, by, w, 30, 10); ctx.fill(); ctx.stroke();
    ctx.restore();
    txt(say, W0.x, by + 16, 19, { color: K.deep });
  }
}
// en haut à gauche : la farandole, six places à remplir
function drawFaraHUD() {
  if (!enDernier() || G.state !== 'play' || !G.fara) return;
  const s = U, x = SAFE.l + 22 * s, y = SAFE.t + 92 * s, n = G.fara.length;
  txt(G.ronde ? 'La ronde !' : 'La farandole', x, y, 22 * s, { align: 'left', color: '#b0472f', hl: G.ronde ? C.hl : undefined });
  for (let i = 0; i < FARA.max; i++) {
    const cx = x + 12 * s + i * 26 * s, cy = y + 30 * s, K = COPAINS[(G.fara[i] || {}).n];
    ctx.save(); ctx.lineWidth = 2 * s;
    if (G.fara[i]) { ctx.fillStyle = K.ink; ctx.beginPath(); ctx.arc(cx, cy, 9 * s, 0, TAU); ctx.fill(); }
    else { ctx.strokeStyle = C.pencil; ctx.setLineDash([3 * s, 3 * s]); ctx.beginPath(); ctx.arc(cx, cy, 9 * s, 0, TAU); ctx.stroke(); }
    ctx.restore();
  }
  txt(n + ' / ' + FARA.max + ' copains', x, y + 56 * s, 17 * s, { align: 'left', color: C.pencil, weight: 400 });
}
function drawFaraArrow() {
  if (G.state !== 'play' || !enDernier() || !G.copain) return;
  edgeArrow(G.copain.x, G.copain.y);
}
