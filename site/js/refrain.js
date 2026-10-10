// Le refrain (chapitre II) : une petite mélodie écrite sur une portée. Touche ses notes dans l'ordre, et la page chante.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const REFRAIN = { first: 8, again: 22, gap: 4, step: 118, radius: 540, min: 4, max: 7 };

// Écrit un nouveau refrain sur une portée proche du joueur (mais pas sous ses pieds)
function writeRefrain() {
  const p = G.p, n = Math.min(REFRAIN.max, REFRAIN.min + G.refrains);
  const width = (n - 1) * REFRAIN.step;
  let best = 0, bd = 1e9;
  for (let s = 0; s < STAFF_COUNT; s++) {
    const top = STAFF.top + s * STAFF.every, d = Math.abs(top + 32 - p.y - rnd(-260, 260));
    if (d < bd) { bd = d; best = s; }
  }
  const top = STAFF.top + best * STAFF.every;
  const side = p.x > WORLD.w / 2 ? -1 : 1;
  const x0 = clamp(side > 0 ? p.x + rnd(260, 520) : p.x - rnd(260, 520) - width, 260, WORLD.w - 120 - width);
  let pitch = Math.floor(rnd(2, 7));
  const notes = [];
  for (let i = 0; i < n; i++) {
    notes.push({ x: x0 + i * REFRAIN.step, y: top + 64 - pitch * 8, pitch, got: 0 });
    pitch = clamp(pitch + pick([-2, -1, -1, 1, 1, 2, 3]), 0, 8);
  }
  G.refrain = { notes, prog: 0, wait: 0, t: 0, top, x0, x1: x0 + width };
  AU.play('refrainNew');
  if (!G.refrainSeen) { G.refrainSeen = true; caption('Nouveau : un refrain est écrit sur la portée !', 3.4, 'green'); caption('Touche ses notes dans l’ordre', 3.4, 'green'); }
  else caption('Un nouveau refrain, plus long', 2.4, 'green');
}

function stepRefrain(dt) {
  if (CH().paper !== 'portee') return;
  const R = G.refrain;
  if (!R) { if (G.t >= G.nextRefrain) writeRefrain(); return; }
  R.t += dt;
  for (const nt of R.notes) if (nt.got) nt.got += dt;
  const p = G.p;
  if (R.prog > 0) {
    R.wait -= dt;
    if (R.wait <= 0) {   // trop lent : le refrain s'est perdu, on reprend du début
      for (const nt of R.notes) nt.got = 0;
      R.prog = 0; AU.play('refrainLost');
      addText(R.notes[0].x, R.notes[0].y - 40, 'perdu… on reprend !', C.pencil, 24);
    }
  }
  const nt = R.notes[R.prog];
  if (nt && (p.x - nt.x) ** 2 + (p.y - nt.y) ** 2 < (p.r + 18) ** 2) {
    nt.got = 0.001; R.prog++; R.wait = REFRAIN.gap;
    AU.play('refrainNote', nt.pitch);
    for (let i = 0; i < 8; i++) { const a = rnd(TAU), s = rnd(60, 160); G.parts.push({ x: nt.x, y: nt.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5, max: 0.5, size: rnd(2, 3.5), color: C.gold, drag: 4 }); }
    if (R.prog >= R.notes.length) singRefrain(R);
  }
}

// La page chante : une onde bleue part du joueur, efface les notes rouges et frappe toutes les ratures proches
function singRefrain(R) {
  const p = G.p, n = R.notes.length;
  G.refrains++; G.refrain = null; G.nextRefrain = G.t + REFRAIN.again;
  G.score += 120 * n; G.xp += 4 + n * 2; p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('refrain', R.notes.reduce((k, nt) => k * 10 + nt.pitch + 1, 0));
  caption(pick(['Refrain !', 'La page chante !', 'Da capo !']), 2.2, 'green');
  G.cam.shake = Math.max(G.cam.shake, 10);
  for (let i = 0; i < 3; i++) G.songs.push({ x: p.x, y: p.y, t: -i * 0.14, dur: 0.9, r: REFRAIN.radius });
  query(p.x, p.y, REFRAIN.radius + 60, tmpA);
  for (const e of tmpA) {
    const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1;
    if (e.dead || d > REFRAIN.radius + e.r) continue;
    hurtEnemy(e, (e.isBoss ? 70 : 18 + 3 * n) * G.S.dmg, 'song');
    if (!e.isBoss) { e.vx += dx / d * 420; e.vy += dy / d * 420; }
  }
  for (const b of G.ebul) if ((b.x - p.x) ** 2 + (b.y - p.y) ** 2 < REFRAIN.radius ** 2) b.life = 0;
  G.waves = G.waves.filter(wv => (wv.x - p.x) ** 2 + (wv.y - p.y) ** 2 > REFRAIN.radius ** 2);
  for (let i = 0; i < 30; i++) { const a = i / 30 * TAU; G.parts.push({ x: p.x + Math.cos(a) * 24, y: p.y + Math.sin(a) * 24, vx: Math.cos(a) * 600, vy: Math.sin(a) * 600, life: 0.6, max: 0.6, size: 3, color: i % 2 ? C.gold : C.inkLight, drag: 3 }); }
}

/* ===================== Dessin ===================== */
function drawRefrain(v) {
  const R = G.refrain;
  if (R) {
    const inView = R.x1 > v.x0 - 80 && R.x0 < v.x1 + 80 && R.top + 100 > v.y0 && R.top - 60 < v.y1;
    if (inView) {
      const k = Math.min(1, R.t * 2);
      // une accolade dorée au-dessus de la phrase, et son nom
      ctx.save(); ctx.globalAlpha = k;
      ctx.strokeStyle = C.gold; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.beginPath();
      const y = R.top - 34, xm = (R.x0 + R.x1) / 2;
      ctx.moveTo(R.x0 - 20, y + 10); ctx.quadraticCurveTo(R.x0 - 20, y, R.x0, y); ctx.lineTo(xm - 14, y); ctx.quadraticCurveTo(xm, y, xm, y - 10);
      ctx.quadraticCurveTo(xm, y, xm + 14, y); ctx.lineTo(R.x1, y); ctx.quadraticCurveTo(R.x1 + 20, y, R.x1 + 20, y + 10); ctx.stroke();
      ctx.restore();
      txt('refrain', xm, y - 30, 30, { color: C.gold, alpha: k, rot: -0.03 });
      R.notes.forEach((nt, i) => {
        const next = i === R.prog, got = nt.got > 0, pop = got ? 1 + 0.5 * Math.max(0, 1 - nt.got * 4) : 1;
        ctx.save(); ctx.translate(nt.x, nt.y); ctx.globalAlpha = k;
        // chaque note du refrain dans une bulle dorée, pour ne pas la confondre avec une croche
        if (!got) {
          ctx.fillStyle = next ? C.hl : C.hlGold; ctx.globalAlpha = k * (next ? 0.9 : 0.45);
          ctx.beginPath(); ctx.arc(2, -8, next ? 25 + 2 * Math.sin(G.time * 6) : 22, 0, TAU); ctx.fill();
          ctx.globalAlpha = k; ctx.strokeStyle = C.gold; ctx.lineWidth = 2; ctx.setLineDash(next ? [] : [5, 5]);
          ctx.beginPath(); ctx.arc(2, -8, next ? 25 + 2 * Math.sin(G.time * 6) : 22, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        }
        ctx.scale(pop, pop);
        const col = got ? C.gold : C.ink;
        ctx.fillStyle = col; ctx.strokeStyle = col;
        ctx.save(); ctx.rotate(-0.4); ctx.beginPath(); ctx.ellipse(0, 0, 10, 7, 0, 0, TAU); ctx.fill(); ctx.restore();
        ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(9, -2); ctx.lineTo(9, -30); ctx.stroke();
        ctx.restore();
        if (!got) txt(String(i + 1), nt.x - 20, nt.y - 30, 22, { color: C.gold, alpha: k });
      });
      if (R.prog > 0) {   // le temps qui reste avant que le refrain se perde
        const nt = R.notes[R.prog], f = clamp(R.wait / REFRAIN.gap, 0, 1);
        ctx.save(); ctx.strokeStyle = C.gold; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(nt.x, nt.y, 24, -Math.PI / 2, -Math.PI / 2 + TAU * f); ctx.stroke(); ctx.restore();
      }
    }
  }
  // l'onde du refrain : des cercles bleus et dorés, ponctués de notes
  for (const s of G.songs) {
    if (s.t < 0) continue;
    const k = Math.min(1, s.t / s.dur), rr = s.r * ease(k);
    ctx.save(); ctx.globalAlpha = 1 - k; ctx.strokeStyle = C.inkLight; ctx.lineWidth = 8 * (1 - k) + 2;
    ctx.beginPath(); ctx.arc(s.x, s.y, rr, 0, TAU); ctx.stroke();
    ctx.fillStyle = C.gold;
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + k; ctx.save(); ctx.translate(s.x + Math.cos(a) * rr, s.y + Math.sin(a) * rr); ctx.rotate(-0.4); ctx.beginPath(); ctx.ellipse(0, 0, 8, 5.5, 0, 0, TAU); ctx.fill(); ctx.restore(); }
    ctx.restore();
  }
}
// Hors de l'écran : une flèche dorée au bord indique où attend le refrain
function drawRefrainArrow() {
  const R = G.refrain; if (!R || G.state !== 'play') return;
  const nt = R.notes[R.prog]; if (!nt) return;
  const sx = W / 2 + (nt.x - G.cam.x) * ZOOM, sy = H / 2 + (nt.y - G.cam.y) * ZOOM, m = 60 * U;
  if (sx > m && sx < W - m && sy > m && sy < H - m) return;
  const a = Math.atan2(sy - H / 2, sx - W / 2), ex = W / 2 - m, ey = H / 2 - m;
  const k = Math.min(ex / Math.abs(Math.cos(a) || 1e-6), ey / Math.abs(Math.sin(a) || 1e-6));
  const x = W / 2 + Math.cos(a) * k, y = H / 2 + Math.sin(a) * k;
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.globalAlpha = 0.65 + 0.3 * Math.sin(G.time * 5);
  ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(18 * U, 0); ctx.lineTo(-8 * U, -12 * U); ctx.lineTo(-3 * U, 0); ctx.lineTo(-8 * U, 12 * U); ctx.closePath(); ctx.fill();
  ctx.restore();
}
