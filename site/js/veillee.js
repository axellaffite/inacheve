'use strict';

// La veillée (itération 30) : à la colo, la nuit tombe régulièrement. La page s'assombrit, seule ta lumière (et celle des
// lucioles) éclaire autour de toi, et des étoiles filantes traversent le ciel. Huit lucioles s'allument : attrape-les pour
// remplir ton bocal (ta lumière grandit). Bocal plein, ou au lever du jour, tu l'ouvres : les lucioles foncent sur les ratures.
// Quand la Grande Ourse descend, la nuit dure jusqu'à la fin du combat.
const VEIL = { first: 25, again: 50, len: 24, fade: 2, n: 8, d0: 260, d1: 700, catchR: 30, light: 230, lightStep: 20, dmg: 40, bossMul: 3, dark: 0.8, speed: 560, respawn: 5 };
VOISIN_SAYS.veillee = ['J’ai pas peur du noir, moi.', 'Regarde, une étoile filante !', 'On se raconte une histoire ?', 'Chut, les autres dorment…'];

function startNuit(boss) {
  G.nuit = { t: 0, len: boss ? Infinity : VEIL.len, boss, end: false, endT: 0, respawn: 0 };
  G.nuits = (G.nuits || 0) + 1; G.bocal = 0;
  spawnLucioles();
  AU.play('nuit');
  if (boss) caption('La nuit tombe pour de bon : plus de lune, juste tes lucioles…', 3, 'green');
  else if (!G.nuitSeen) { G.nuitSeen = true; caption('La nuit tombe sur la colo : c’est l’heure de la veillée !', 3.2, 'green'); caption('Attrape les lucioles : elles remplissent ton bocal… et ta lumière grandit.', 3.4, 'green'); }
  else caption('La nuit tombe : la veillée commence !', 2.2, 'green');
  if (G.v && typeof voisinSay === 'function') voisinSay('veillee');
}
function spawnLucioles() {
  const p = G.p;
  for (let i = 0; i < VEIL.n; i++) {
    const a = i / VEIL.n * TAU + rnd(-0.3, 0.3), d = rnd(VEIL.d0, VEIL.d1);
    G.lucioles.push({ x: clamp(p.x + Math.cos(a) * d, 60, WORLD.w - 60), y: clamp(p.y + Math.sin(a) * d, 60, WORLD.h - 60), ph: rnd(TAU), t: 0 });
  }
}
// la noirceur de la page, de 0 (plein jour) à 1 (nuit noire)
function nuitK() {
  const N = G.nuit; if (!N || !enCamp()) return 0;
  if (N.end) return clamp(1 - N.endT / VEIL.fade, 0, 1);
  return clamp(N.t / VEIL.fade, 0, 1);
}
const lumiere = () => VEIL.light + VEIL.lightStep * (G.bocal || 0);
function endNuit() {
  const N = G.nuit; if (!N || N.end) return;
  N.end = true; N.endT = 0;
  if (G.bocal) releaseBocal(false);
  G.lucioles = [];
  G.nextNuit = G.t + VEIL.again;
  AU.play('aube'); caption('Le jour se lève sur la colo.', 2, 'hl');
}
function releaseBocal(full) {
  const n = G.bocal, p = G.p; if (!n) return;
  G.bocal = 0;
  const near = G.enemies.filter(e => !e.dead && !e.ghost && (e.x - p.x) ** 2 + (e.y - p.y) ** 2 < 800 * 800).sort((a, b) => ((a.x - p.x) ** 2 + (a.y - p.y) ** 2) - ((b.x - p.x) ** 2 + (b.y - p.y) ** 2));
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU;
    G.vols.push({ x: p.x + Math.cos(a) * 20, y: p.y + Math.sin(a) * 20, vx: Math.cos(a) * 260, vy: Math.sin(a) * 260, t: 0, tgt: near.length ? near[i % near.length] : null });
  }
  AU.play('bocal');
  if (!full) { caption('Le jour se lève : tu ouvres le bocal !', 2.2, 'green'); return; }
  G.bocaux = (G.bocaux || 0) + 1;
  G.score += 400; G.xp += 12;
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  G.p.hp = Math.min(G.p.maxHp, G.p.hp + 1);
  G.cam.shake = Math.max(G.cam.shake, 5);
  caption('Le bocal est plein ! Les lucioles s’envolent sur les ratures… et un cœur !', 2.8, 'green');
  if (G.nuit) G.nuit.respawn = VEIL.respawn;
}
function stepVeillee(dt) {
  if (!enCamp()) return;
  const p = G.p;
  stepVols(dt);
  let N = G.nuit;
  const bossNight = G.boss && !G.bossDefeated;
  if (N && N.end) { N.endT += dt; if (N.endT >= VEIL.fade) G.nuit = N = null; }
  if (!N || N.end) {
    if (bossNight) { G.nuit = null; startNuit(true); }
    else if (!N && G.t >= G.nextNuit) { if (G.boss) G.nextNuit = G.t + 6; else startNuit(false); }
    if (!G.nuit || G.nuit.end) return;
    N = G.nuit;
  }
  if (bossNight && !N.boss) { N.boss = true; N.len = Infinity; caption('La Grande Ourse garde la nuit avec elle…', 2.6, 'pink'); }
  if (N.boss && !bossNight) { endNuit(); return; }
  N.t += dt;
  for (const l of G.lucioles) {   // elles flânent, en s'allumant et s'éteignant doucement
    l.t += dt;
    l.x = clamp(l.x + Math.cos(G.t * 0.8 + l.ph) * 34 * dt, 40, WORLD.w - 40);
    l.y = clamp(l.y + Math.sin(G.t * 1.1 + l.ph * 1.3) * 26 * dt, 40, WORLD.h - 40);
    if (!l.caught && (p.x - l.x) ** 2 + (p.y - l.y) ** 2 < (p.r + VEIL.catchR) ** 2) {
      l.caught = true; G.bocal = (G.bocal || 0) + 1; G.lucioPrises = (G.lucioPrises || 0) + 1;
      AU.play('luciole', G.bocal); addText(l.x, l.y - 24, G.bocal + ' / ' + VEIL.n, '#8bbf3a', 22);
      if (G.bocal >= VEIL.n) releaseBocal(true);
    }
  }
  G.lucioles = G.lucioles.filter(l => !l.caught);
  if (N.boss && !G.lucioles.length && !G.bocal) { N.respawn -= dt; if (N.respawn <= 0) { spawnLucioles(); N.respawn = VEIL.respawn; } }
  if (N.t >= N.len) endNuit();
}
function stepVols(dt) {   // les lucioles lâchées : chacune file sur une rature
  for (const f of G.vols) {
    f.t += dt;
    if (!f.tgt || f.tgt.dead) { let bd = 700 * 700; f.tgt = null; for (const e of G.enemies) { if (e.dead || e.ghost) continue; const d = (e.x - f.x) ** 2 + (e.y - f.y) ** 2; if (d < bd) { bd = d; f.tgt = e; } } }
    if (f.tgt) {
      const dx = f.tgt.x - f.x, dy = f.tgt.y - f.y, d = Math.hypot(dx, dy) || 1, k = 1 - Math.exp(-dt * 6);
      f.vx = lerp(f.vx, dx / d * VEIL.speed, k); f.vy = lerp(f.vy, dy / d * VEIL.speed, k);
      if (d < f.tgt.r + 10) {
        const e = f.tgt; hurtEnemy(e, VEIL.dmg * G.S.dmg * (e.isBoss ? VEIL.bossMul : 1), 'luciole');
        if (e.dead) G.luciKills = (G.luciKills || 0) + 1;
        G.rings.push({ x: f.x, y: f.y, t: 0, dur: 0.3, r: 34, color: '#c6e65a' });
        f.t = 99;
      }
    }
    f.x += f.vx * dt; f.y += f.vy * dt;
  }
  G.vols = G.vols.filter(f => f.t < 3);
}
// le pilote : la luciole libre la plus proche, sans changer d'avis en route
function veilleeTarget() {
  if (!G.nuit || G.nuit.end || !G.lucioles || !G.lucioles.length) return null;
  const p = G.p;
  if (G.luciT && !G.luciT.caught && G.lucioles.includes(G.luciT)) return G.luciT;
  let bd = 1100 * 1100; G.luciT = null;
  for (const l of G.lucioles) { const d = (l.x - p.x) ** 2 + (l.y - p.y) ** 2; if (d < bd) { bd = d; G.luciT = l; } }
  return G.luciT;
}

/* ----- dessin ----- */
const nightCv = document.createElement('canvas'), nctx = nightCv.getContext('2d');
const toScreen = (x, y) => [W / 2 + (x - G.cam.x) * ZOOM, H / 2 + (y - G.cam.y) * ZOOM];
function drawNuitScreen() {
  const k = nuitK(); if (!k || !G.p || G.state === 'title') return;
  if (nightCv.width !== cv.width || nightCv.height !== cv.height) { nightCv.width = cv.width; nightCv.height = cv.height; }
  nctx.setTransform(1, 0, 0, 1, 0, 0); nctx.globalCompositeOperation = 'source-over'; nctx.clearRect(0, 0, nightCv.width, nightCv.height);
  nctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  nctx.fillStyle = 'rgba(14,18,52,' + (VEIL.dark * k) + ')'; nctx.fillRect(0, 0, W, H);
  nctx.globalCompositeOperation = 'destination-out';
  const hole = (x, y, r) => {
    const [sx, sy] = toScreen(x, y), R = r * ZOOM;
    if (sx < -R || sy < -R || sx > W + R || sy > H + R) return;
    const g = nctx.createRadialGradient(sx, sy, R * 0.35, sx, sy, R);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    nctx.fillStyle = g; nctx.fillRect(sx - R, sy - R, R * 2, R * 2);
  };
  hole(G.p.x, G.p.y, lumiere());
  if (G.v) hole(G.v.x, G.v.y, 130);
  for (const l of G.lucioles) hole(l.x, l.y, 90);
  for (const f of G.vols) hole(f.x, f.y, 70);
  if (G.boss && G.boss.type === 'ourse') hole(G.boss.x, G.boss.y, 280);
  ctx.drawImage(nightCv, 0, 0, W, H);
  // par-dessus le noir : le ciel, la lanterne, la Grande Ourse, ce qui brille et ce qui pique
  ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(ZOOM, ZOOM); ctx.translate(-G.cam.x, -G.cam.y);
  for (let i = 0; i < 30; i++) {   // les étoiles du ciel (loin de ta lumière)
    const sx = G.cam.x + (((i * 7919) % 1000) / 1000 - 0.5) * W / ZOOM, sy = G.cam.y + (((i * 104729) % 1000) / 1000 - 0.5) * H / ZOOM;
    if (Math.hypot(sx - G.p.x, sy - G.p.y) < lumiere() + 40) continue;
    txt('✦', sx, sy, 14 + (i % 3) * 6, { color: '#fff6c8', alpha: k * (0.45 + 0.45 * Math.sin(G.time * 3 + i)) });
  }
  drawFilantes(k);
  const lg = ctx.createRadialGradient(G.p.x, G.p.y, 0, G.p.x, G.p.y, 120);   // la chaleur de ta lumière
  lg.addColorStop(0, 'rgba(255,214,120,' + (0.16 * k) + ')'); lg.addColorStop(1, 'rgba(255,214,120,0)');
  ctx.fillStyle = lg; ctx.fillRect(G.p.x - 120, G.p.y - 120, 240, 240);
  if (G.boss && G.boss.type === 'ourse') { ctx.save(); ctx.translate(G.boss.x, G.boss.y); drawOurse(G.boss, 1, G.boss.flash > 0); ctx.restore(); }
  drawCampBullets();
  for (const l of G.lucioles) drawLuciole(l.x, l.y, l.ph, k);
  for (const f of G.vols) { drawLuciole(f.x, f.y, f.t * 9, 1); }
  ctx.restore();
}
function drawLuciole(x, y, ph, a) {
  const on = 0.55 + 0.45 * Math.sin(G.time * 4 + ph);
  const g = ctx.createRadialGradient(x, y, 0, x, y, 26);
  g.addColorStop(0, 'rgba(214,255,120,' + (0.85 * on * a) + ')'); g.addColorStop(1, 'rgba(214,255,120,0)');
  ctx.fillStyle = g; ctx.fillRect(x - 26, y - 26, 52, 52);
  ctx.globalAlpha = a; ctx.fillStyle = '#f4ffb0'; ctx.beginPath(); ctx.arc(x, y, 4, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(230,240,255,0.6)'; const fl = Math.sin(G.time * 40 + ph) * 2;
  ctx.beginPath(); ctx.ellipse(x - 3, y - 5 - fl, 4, 2, -0.6, 0, TAU); ctx.ellipse(x + 3, y - 5 - fl, 4, 2, 0.6, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
}
// des étoiles filantes, juste pour les yeux : leur passage ne dépend que de l'heure de la nuit
function drawFilantes(k) {
  const N = G.nuit; if (!N) return;
  const per = 2.7, i = Math.floor(N.t / per), u = (N.t - i * per) / 0.9;
  if (u > 1) return;
  const h = Math.imul(i + 7, 2654435761) >>> 0, x0 = G.cam.x + ((h % 1000) / 1000 - 0.6) * W / ZOOM, y0 = G.cam.y - H / ZOOM * (0.3 + (h >> 10) % 100 / 600);
  const x = x0 + u * 520, y = y0 + u * 200;
  const g = ctx.createLinearGradient(x, y, x - 180, y - 70);
  g.addColorStop(0, 'rgba(255,250,220,' + (0.9 * k * (1 - u * 0.6)) + ')'); g.addColorStop(1, 'rgba(255,250,220,0)');
  ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 180, y - 70); ctx.stroke();
  txt('✦', x, y, 18, { color: '#fffbe6', alpha: k });
}
// le bocal, en haut à gauche : les lucioles attrapées, et le temps qui reste avant le jour
function drawBocalHUD() {
  if (!enCamp() || G.state !== 'play' || !G.nuit || G.nuit.end) return;
  const s = U, x = SAFE.l + 22 * s, y = SAFE.t + 86 * s, w = 70 * s, h = 86 * s, n = G.bocal || 0, a = clamp(G.nuit.t * 2, 0, 1);
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(255,253,244,0.18)'; ctx.strokeStyle = '#e8ecff'; ctx.lineWidth = 2.5 * s;
  roundRect(x, y + 12 * s, w, h - 12 * s, 14 * s); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#b07a3a'; ctx.fillRect(x + 6 * s, y, w - 12 * s, 13 * s);   // le couvercle
  for (let i = 0; i < n; i++) {
    const lx = x + w / 2 + Math.cos(G.time * 1.3 + i * 2.1) * w * 0.3, ly = y + 52 * s + Math.sin(G.time * 1.7 + i * 1.3) * h * 0.25;
    const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 12 * s); g.addColorStop(0, 'rgba(214,255,120,0.95)'); g.addColorStop(1, 'rgba(214,255,120,0)');
    ctx.fillStyle = g; ctx.fillRect(lx - 12 * s, ly - 12 * s, 24 * s, 24 * s);
  }
  ctx.restore();
  txt('La veillée', x + w + 12 * s, y + 22 * s, 22 * s, { align: 'left', color: '#fffbe6', alpha: a });
  txt('lucioles : ' + n + ' / ' + VEIL.n, x + w + 12 * s, y + 50 * s, 17 * s, { align: 'left', color: '#e8ecff', alpha: a, weight: 400 });
  if (!G.nuit.boss) {
    const k = clamp(1 - G.nuit.t / G.nuit.len, 0, 1);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = k < 0.25 ? '#ffd75e' : '#e8ecff'; ctx.fillRect(x + w + 12 * s, y + 68 * s, 120 * s * k, 5 * s); ctx.restore();
  } else txt('jusqu’au matin…', x + w + 12 * s, y + 74 * s, 16 * s, { align: 'left', color: '#ffd75e', alpha: a, weight: 400 });
}
function drawVeilleeArrow() {
  if (G.state !== 'play' || !enCamp() || !G.nuit || G.nuit.end || !G.lucioles.length) return;
  const p = G.p; let b = null, bd = 1e12;
  for (const l of G.lucioles) { const d = (l.x - p.x) ** 2 + (l.y - p.y) ** 2; if (d < bd) { bd = d; b = l; } }
  if (b) edgeArrow(b.x, b.y);
}
