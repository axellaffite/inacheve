// Le taille-crayon électrique (itération 27) : la quatrième machine égarée, grand frère branché du taille-crayon du brouillon.
// Il ronronne, puis aspire tout ce qui traîne autour de lui : les lettres, les ratures (qu'il taille en copeaux)… et la goutte.
// Son tiroir transparent se remplit ; plein, il le vide en crachant une couronne de copeaux.
// Biffé : le tiroir s'ouvre et rend en pluie toutes les lettres qu'il a mangées (et un peu plus).
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const TAILLEL = { at: 35, stay: 30, dist: 300, warn: 0.9, suck: 3.4, dump: 0.7, cycle: 2.8, first: 1.4, R: 380, pullP: 160, pullE: 240,
  pullL: 420, mouth: 34, full: 8, copeaux: 12, cSpeed: 220, again: 24, deathN: 30, rMax: 40 };
ETYPES.taillelec = { r: 42, hp: 50, speed: 64, dmg: 1, xp: 30, agil: 1.8 };
const TAILLEL_BODY = '#3aa39c', TAILLEL_DEEP = '#22706b';
ERRANTES.add('taillelec');
PHOTO_NOCOPY.add('taillelec');
VOISIN_SAYS.taille = ['Ça aspire ! Tiens-moi la main !', 'Mes lacets ! Il mange mes lacets !', 'Je ne veux pas finir en copeaux !'];

function stepTaille(dt) {
  const at = G.tailleAt || (devoirHas('taille') ? 20 : TAILLEL.at);
  if (!G.tailleDone && G.t >= at && !G.boss && !G.bossDefeated) {
    G.tailleDone = true;
    spawnTaillelec();
  }
}
function spawnTaillelec(x, y) {
  const e = x === undefined ? spawnAround('taillelec') : spawnEnemy('taillelec', x, y);
  e.hp = e.maxHp = ETYPES.taillelec.hp * (1 + G.t / 190) * (1 + 0.15 * CH().scale);
  e.pt = TAILLEL.first; e.life = 0; e.ate = 0; e.nL = 0; e.stock = 0; e.drawer = 0; e.spin = 0; e.hum = 0;
  AU.play('tailleArrive');
  if (!G.tailleSeen) { G.tailleSeen = true; caption('Vrrrr… Un taille-crayon électrique s’est échappé du bureau !', 3.6, 'pink'); caption('Il aspire tout : les lettres, les ratures… et toi !', 3.8, 'hl'); }
  else caption('Le taille-crayon électrique est rebranché !', 2.6, 'pink');
  return e;
}
function tailleGone() { if (devoirHas('taille')) { G.tailleDone = false; G.tailleAt = G.t + TAILLEL.again; } }

function stepTaillelec(e, dt, dx, dy, d, slow, hid) {
  e.pt -= dt; e.life += dt;
  const want = clamp((d - TAILLEL.dist) / 120, -0.6, 1);
  let mx = (dx / d * want + dy / d * 0.4) * e.speed * slow, my = (dy / d * want - dx / d * 0.4) * e.speed * slow;
  e.drawer = Math.max(0, e.drawer - dt * 2);
  e.hum = Math.max(0, e.hum - dt * 2);
  if (e.phase === 'walk') {
    e.spin += dt * 2;
    if (e.life > TAILLEL.stay) { e.phase = 'leave'; e.pt = 1.1; e.ghost = true; caption('Débranché : le taille-crayon retourne au bureau.', 2.6, 'hl'); AU.play('tailleJam'); }
    else if (e.pt <= 0 && d < 720 && !hid) { e.phase = 'warn'; e.pt = TAILLEL.warn; AU.play('tailleWarn'); }
  } else if (e.phase === 'warn') {
    mx = 0; my = 0; e.hum = Math.min(1, e.hum + dt * 4); e.spin += dt * (6 + 20 * (1 - e.pt / TAILLEL.warn));
    if (e.pt <= 0) { e.phase = 'suck'; e.pt = TAILLEL.suck; AU.play('tailleWhir'); }
  } else if (e.phase === 'suck') {
    mx = 0; my = 0; e.hum = 1; e.spin += dt * 30;
    const p = G.p, ramp = Math.min(1, (TAILLEL.suck - e.pt) / 0.4);
    if (d < TAILLEL.R && p.dashT <= 0) { const k = TAILLEL.pullP * (0.35 + 0.65 * (1 - d / TAILLEL.R)) * ramp; G.pullX -= dx / d * k; G.pullY -= dy / d * k; }
    if (rand() < dt * 4) AU.play('tailleWhir');
    if (rand() < dt * 26) { const a = rnd(TAU), r = TAILLEL.R * rnd(0.6, 1), s = -r / 0.55; G.parts.push({ x: e.x + Math.cos(a) * r, y: e.y + Math.sin(a) * r, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.5, max: 0.5, size: rnd(1.5, 2.5), color: C.pencil, drag: 0 }); }   // l'air qui file vers la bouche
    if (e.pt <= 0) {
      if (e.ate >= TAILLEL.full) { e.phase = 'dump'; e.pt = TAILLEL.dump; AU.play('tailleWarn'); }
      else { e.phase = 'walk'; e.pt = TAILLEL.cycle; }
    }
  } else if (e.phase === 'dump') {   // le tiroir est plein : il sort, et les copeaux partent en couronne
    mx = 0; my = 0; e.drawer = Math.min(1, e.drawer + dt * 5);
    if (e.pt <= 0) { tailleDump(e); e.phase = 'walk'; e.pt = TAILLEL.cycle; }
  } else if (e.phase === 'leave') {
    mx *= -2; my *= -2;
    if (e.pt <= 0) { e.dead = true; tailleGone(); }
  }
  MV.x = mx; MV.y = my; MV.agil = 2;
}
function tailleDump(e) {
  const n = TAILLEL.copeaux, off = rnd(TAU);
  for (let i = 0; i < n; i++) { const a = off + i / n * TAU; G.ebul.push({ x: e.x + Math.cos(a) * 40, y: e.y + Math.sin(a) * 40, vx: Math.cos(a) * TAILLEL.cSpeed, vy: Math.sin(a) * TAILLEL.cSpeed, life: 3, a, copeau: true }); }
  e.ate = 0;
  AU.play('tailleDump'); G.cam.shake = Math.max(G.cam.shake, 6);
  if (!G.tailleDumpSeen) { G.tailleDumpSeen = true; caption('Tiroir plein ! Il vide ses copeaux partout.', 2.6, 'hl'); }
}
function tailleBits(x, y, n, s0, s1) {
  for (let i = 0; i < n; i++) { const a = rnd(TAU), s = rnd(s0, s1); G.parts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.3, 0.7), max: 0.7, size: rnd(2, 4.5), color: i % 3 ? '#e8c08a' : C.red, drag: 4 }); }
}

// L'aspiration : les ratures et les lettres glissent vers la bouche du taille-crayon ; ce qui y arrive est taillé
const canSuck = (o, m) => o !== m && !o.dead && !o.ghost && !o.isBoss && !ERRANTES.has(o.type) && !(o.fall > 0) && !(o.pin > 0) && !o.q && o.r <= TAILLEL.rMax;
function stepTailleFx(dt) {
  let ate = false;
  for (const m of G.enemies) {
    if (m.type !== 'taillelec' || m.dead || m.phase !== 'suck') continue;
    const ramp = Math.min(1, (TAILLEL.suck - m.pt) / 0.4), R = TAILLEL.R;
    query(m.x, m.y, R + 40, tmpB);
    for (const o of tmpB) {
      if (!canSuck(o, m)) continue;
      const dx = m.x - o.x, dy = m.y - o.y, d = Math.hypot(dx, dy) || 1;
      if (d > R) continue;
      if (d < TAILLEL.mouth + o.r * 0.4) { tailleEat(m, o); continue; }
      const sp = TAILLEL.pullE * (0.3 + 0.7 * (1 - d / R)) * ramp, sw = sp * 0.45;   // et un peu de tourbillon
      o.x += (dx / d * sp - dy / d * sw) * dt; o.y += (dy / d * sp + dx / d * sw) * dt; o.vx *= 0.9; o.vy *= 0.9;
    }
    for (const it of G.items) {
      if (it.pull || it.gone) continue;   // déjà en route vers la goutte : trop tard pour lui
      const dx = m.x - it.x, dy = m.y - it.y, d = Math.hypot(dx, dy) || 1;
      if (d > R) continue;
      if (d < TAILLEL.mouth) { it.gone = true; m.stock += it.value; m.nL++; ate = true; continue; }
      const sp = TAILLEL.pullL * (0.3 + 0.7 * (1 - d / R)) * ramp;
      it.x += (dx / d * sp - dy / d * sp * 0.5) * dt; it.y += (dy / d * sp + dx / d * sp * 0.5) * dt; it.vx = 0; it.vy = 0;
    }
    for (const sh of G.shots) {   // tes gouttes d'encre aussi sont aspirées : elles filent dans la bouche et frappent deux fois plus fort
      const dx = m.x - sh.x, dy = m.y - sh.y, d2 = dx * dx + dy * dy;
      if (d2 > R * R || sh.hit.has(m.id)) continue;
      const d = Math.sqrt(d2) || 1, sp = Math.hypot(sh.vx, sh.vy) || 1, k = Math.min(1, dt * 5 * ramp);
      sh.vx = lerp(sh.vx, dx / d * sp, k); sh.vy = lerp(sh.vy, dy / d * sp, k); sh.k = 2; sh.life = Math.max(sh.life, d / sp + 0.1);
    }
    const v = G.v;
    if (v) {
      const dx = m.x - v.x, dy = m.y - v.y, d = Math.hypot(dx, dy) || 1;
      if (d < R && d > TAILLEL.mouth + 30) {
        const sp = TAILLEL.pullP * 0.7 * (1 - d / R) * ramp; v.x += dx / d * sp * dt; v.y += dy / d * sp * dt;
        if (!m.saidV && d < R * 0.7) { m.saidV = true; voisinSay('taille'); }
      }
    }
  }
  if (ate) { G.items = G.items.filter(it => !it.gone); AU.play('tailleEat'); }
}
function tailleEat(m, o) {
  o.dead = true; G.kills++; G.taillees = (G.taillees || 0) + 1;
  noteBestiaire(o.type);
  G.score += Math.round(o.xp * 10);
  m.ate++; m.nL++; m.stock += o.xp;
  tailleBits(m.x, m.y - 6, 7, 80, 240);
  AU.play('tailleEat');
  if (!G.tailleEatSeen) { G.tailleEatSeen = true; caption('Une rature taillée en copeaux !', 2.4, 'green'); }
}

function tailleDeath(e) {
  const n = clamp(8 + e.nL, 12, TAILLEL.deathN), v = Math.max(1, Math.round((e.stock + 24) / n));
  for (let i = 0; i < n; i++) {
    const before = G.items.length;
    dropLetter(e.x + rnd(-20, 20), e.y + rnd(-10, 10), v);
    if (G.items.length > before) { const it = G.items[G.items.length - 1], a = -Math.PI / 2 + rnd(-1.3, 1.3), s = rnd(200, 420); it.vx = Math.cos(a) * s; it.vy = Math.sin(a) * s; }   // la fontaine du tiroir
  }
  tailleBits(e.x, e.y, 34, 140, 480);
  G.rings.push({ x: e.x, y: e.y, t: 0, dur: 0.6, r: 260, color: TAILLEL_BODY });
  G.score += 500; G.tailleKills = (G.tailleKills || 0) + 1;
  caption(e.nL >= 6 ? 'Le tiroir s’ouvre : il rend tout ce qu’il a mangé !' : 'Débranché ! Son tiroir déborde de lettres.', 2.8, 'green');
  AU.play('tailleJam'); G.cam.shake = Math.max(G.cam.shake, 12);
  tailleGone();
}

function tailleTarget() {
  for (const e of G.enemies) {
    if (e.type !== 'taillelec' || e.ghost) continue;
    const a = Math.atan2(G.p.y - e.y, G.p.x - e.x) + 0.5, r = e.phase === 'suck' || e.phase === 'warn' ? TAILLEL.R + 50 : 240;   // pendant l'aspiration, le pilote reste juste au bord
    return { x: e.x + Math.cos(a) * r, y: e.y + Math.sin(a) * r };
  }
  return null;
}
function tailleDanger(x, y) {
  let s = 0;
  for (const e of G.enemies) {
    if (e.type !== 'taillelec' || (e.phase !== 'warn' && e.phase !== 'suck')) continue;
    const d = Math.hypot(x - e.x, y - e.y);
    if (d < TAILLEL.R) s += 2200 / Math.pow(Math.max(6, d - 50), 1.3) + (TAILLEL.R - d) * 0.02;
  }
  return s;
}

function drawTaillelec(e, fr, fl) {
  const j = (fr - 1) * 0.8, hum = e.hum || 0;
  if (e.phase === 'leave') ctx.globalAlpha = Math.max(0, e.pt / 1.1);
  ctx.fillStyle = 'rgba(46,46,51,0.14)'; ctx.beginPath(); ctx.ellipse(0, 36, 50, 9, 0, 0, TAU); ctx.fill();
  // le fil électrique, arraché de sa prise, qui traîne derrière lui
  const w = Math.sin(G.time * 3 + e.id) * 8;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#2b2f36'; ctx.lineWidth = 3.4;
  ctx.beginPath(); ctx.moveTo(-40, 14); ctx.bezierCurveTo(-70, 20 + w, -62, 46 - w, -92, 44 + w * 0.5); ctx.stroke();
  ctx.save(); ctx.translate(-96, 44 + w * 0.5); ctx.rotate(0.3);
  ctx.fillStyle = '#ece8dc'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.6; roundRect(-8, -7, 12, 14, 3); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = PERFO_STEEL; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(-8, -3); ctx.lineTo(-15, -3); ctx.moveTo(-8, 3); ctx.lineTo(-15, 3); ctx.stroke();
  ctx.restore();
  ctx.save(); ctx.scale(1.15, 1.15);
  if (hum) ctx.translate(Math.sin(G.time * 70) * 1.6 * hum, Math.cos(G.time * 55) * 1.2 * hum);   // il vibre en tournant
  ctx.translate(0, j * 0.5);
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.2;
  // le tiroir transparent, et ses copeaux
  const dy = e.drawer * 12;
  ctx.fillStyle = 'rgba(220,236,240,0.75)'; roundRect(-34, 14 + dy, 68, 20, 4); ctx.fill(); ctx.stroke();
  const fill = clamp((e.ate || 0) / TAILLEL.full, 0, 1);
  if (fill > 0) {
    ctx.save(); roundRect(-32, 16 + dy, 64, 16, 3); ctx.clip();
    const top = 32 + dy - 15 * fill;
    for (let i = 0; i < 14; i++) {
      const x = -28 + (i * 37) % 58, y = top + 2 + (i * 13) % 12;
      if (y > 33 + dy) continue;
      ctx.fillStyle = i % 4 ? '#e8c08a' : C.red; ctx.beginPath(); ctx.arc(x, y, 3.4, 0, Math.PI * 1.4); ctx.lineTo(x, y); ctx.fill();
    }
    ctx.restore();
  }
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.2;
  // le corps de plastique turquoise
  ctx.fillStyle = fl ? '#ffd9dc' : TAILLEL_BODY; roundRect(-40, -38, 80, 56, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.25)'; roundRect(-34, -34, 68, 10, 6); ctx.fill();
  ctx.fillStyle = fl ? '#ffb0b4' : TAILLEL_DEEP; roundRect(-40, 10, 80, 8, 3); ctx.fill();
  // le cadran de métal et son trou à crayon, où tourne la lame
  ctx.fillStyle = '#c9ced8'; ctx.beginPath(); ctx.arc(0, -4, 16, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#20232a'; ctx.beginPath(); ctx.arc(0, -4, 9 + 2 * hum, 0, TAU); ctx.fill();
  ctx.strokeStyle = '#8c929e'; ctx.lineWidth = 1.6;
  for (let k = 0; k < 3; k++) { const a = e.spin + k * TAU / 3; ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(Math.cos(a) * (8 + 2 * hum), -4 + Math.sin(a) * (8 + 2 * hum)); ctx.stroke(); }
  for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(Math.cos(a) * 13, -4 + Math.sin(a) * 13, 1.1, 0, TAU); ctx.fill(); }
  // les yeux (et les sourcils quand il aspire)
  const look = Math.atan2(G.p.y - e.y, G.p.x - e.x);
  for (const s of [-24, 24]) {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s, -20, 6.5, 0, TAU); ctx.fill(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + Math.cos(look) * 2.6, -20 + Math.sin(look) * 2.6, 2.8, 0, TAU); ctx.fill();
  }
  if (e.phase === 'warn' || e.phase === 'suck') { ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-31, -31); ctx.lineTo(-18, -27); ctx.moveTo(31, -31); ctx.lineTo(18, -27); ctx.stroke(); }
  // le voyant : vert au repos, rouge quand il tourne
  ctx.fillStyle = hum > 0.2 ? C.red : '#6cc06a'; ctx.beginPath(); ctx.arc(30, 4, 3.2, 0, TAU); ctx.fill();
  ctx.restore();
  ctx.globalAlpha = 1;
}
function drawTailleFx() {
  for (const e of G.enemies) {
    if (e.type !== 'taillelec' || (e.phase !== 'warn' && e.phase !== 'suck')) continue;
    const R = TAILLEL.R, warn = e.phase === 'warn';
    ctx.save(); ctx.lineCap = 'round';
    ctx.strokeStyle = warn ? C.red : C.pencil; ctx.lineWidth = 2.5; ctx.setLineDash([8, 10]); ctx.lineDashOffset = -G.time * 40;
    ctx.globalAlpha = warn ? 0.35 + 0.3 * Math.sin(G.time * 30) : 0.4;
    ctx.beginPath(); ctx.arc(e.x, e.y, R, 0, TAU); ctx.stroke();
    ctx.setLineDash([]);
    if (!warn) {   // trois bras de spirale qui s'enroulent vers la bouche
      ctx.lineWidth = 2.4; ctx.globalAlpha = 0.4;
      for (let k = 0; k < 3; k++) {
        const a0 = -G.time * 5 + k * TAU / 3;
        ctx.beginPath();
        for (let r = R; r > 40; r -= 12) { const a = a0 + (R - r) / R * 3.4, x = e.x + Math.cos(a) * r, y = e.y + Math.sin(a) * r; r === R ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}
