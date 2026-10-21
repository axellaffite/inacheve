'use strict';

// L'agrafeuse (itération 18) : la deuxième machine de bureau égarée dans le cahier.
// Elle vise, puis tire trois agrafes en rafale : une agrafe qui te touche te cloue à la page (secoue-toi, ou fais un pâté).
// Les agrafes qui ratent se plantent dans la page et clouent les ratures qui marchent dessus.
const AGRAF = { at: 140, dist: 300, warn: 0.8, len: 760, burst: 3, gap: 0.14, speed: 600, cycle: 3.2, first: 1.4, stay: 40,
  pinP: 1.1, plantLife: 8, plantMax: 18, pinE: 1.9, deathR: 540, deathPin: 2.8 };
ETYPES.agrafeuse = { r: 46, hp: 70, speed: 66, dmg: 1, xp: 30, agil: 1.8 };
const AGRAF_STEEL = '#8d93a3', AGRAF_BODY = '#3e5584';
const ERRANTES = new Set(['photocopieuse', 'agrafeuse']);   // les machines égarées : jamais copiées, jamais clouées
PHOTO_NOCOPY.add('agrafeuse');

function stepAgraf(dt) {
  if (!G.agrafDone && G.t >= AGRAF.at && !G.boss && !G.bossDefeated) {
    G.agrafDone = true;
    spawnAgrafeuse();
  }
}
function spawnAgrafeuse(x, y) {
  const e = x === undefined ? spawnAround('agrafeuse') : spawnEnemy('agrafeuse', x, y);
  e.hp = e.maxHp = ETYPES.agrafeuse.hp * (1 + G.t / 190) * (1 + 0.15 * CH().scale);
  e.pt = AGRAF.first; e.life = 0; e.ang = 0; e.lid = 0; e.shot = 0; e.clac = 0;
  AU.play('agrafArrive');
  if (!G.agrafSeen) { G.agrafSeen = true; caption('Clac ! Une agrafeuse s’est échappée du bureau !', 3.6, 'pink'); caption('Ses agrafes clouent à la page : secoue-toi, ou fais un pâté !', 3.8, 'hl'); }
  else caption('L’agrafeuse est de retour !', 2.6, 'pink');
  return e;
}

function stepAgrafeuse(e, dt, dx, dy, d, slow, hid) {
  e.pt -= dt; e.life += dt; e.clac = Math.max(0, e.clac - dt * 4);
  const want = clamp((d - AGRAF.dist) / 120, -0.6, 1);
  let mx = (dx / d * want + dy / d * 0.5) * e.speed * slow, my = (dy / d * want - dx / d * 0.5) * e.speed * slow;
  e.lid = Math.max(0, e.lid - dt * 3);
  if (e.phase === 'walk') {
    e.ang = Math.atan2(dy, dx);
    if (e.life > AGRAF.stay) { e.phase = 'leave'; e.pt = 1.1; e.ghost = true; caption('Plus d’agrafes : l’agrafeuse retourne au bureau.', 2.6, 'hl'); AU.play('agrafJam'); }
    else if (e.pt <= 0 && d < 720 && !hid) { e.phase = 'warn'; e.pt = AGRAF.warn; AU.play('agrafWarn'); }
  } else if (e.phase === 'warn') {
    mx = 0; my = 0; e.lid = Math.min(1, e.lid + dt * 4);
    if (e.pt > AGRAF.warn * 0.4) { let da = Math.atan2(dy, dx) - e.ang; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; e.ang += da * Math.min(1, dt * 6); }
    if (e.pt <= 0) { e.phase = 'fire'; e.pt = 0; e.shot = 0; }
  } else if (e.phase === 'fire') {
    mx = 0; my = 0;
    if (e.pt <= 0) {
      fireAgrafe(e); e.shot++; e.pt = AGRAF.gap;
      if (e.shot >= AGRAF.burst) { e.phase = 'walk'; e.pt = AGRAF.cycle; }
    }
  } else if (e.phase === 'leave') {
    mx *= -2; my *= -2;
    if (e.pt <= 0) e.dead = true;
  }
  MV.x = mx; MV.y = my; MV.agil = 2;
}
function fireAgrafe(e) {
  const a = e.ang + (e.shot - 1) * 0.05, life = AGRAF.len / AGRAF.speed;
  G.ebul.push({ x: e.x + Math.cos(a) * 50, y: e.y + Math.sin(a) * 50, vx: Math.cos(a) * AGRAF.speed, vy: Math.sin(a) * AGRAF.speed, life, agrafe: true, a });
  e.clac = 1; e.lid = 0;
  AU.play('agrafClac'); G.cam.shake = Math.max(G.cam.shake, 2);
}
// une agrafe touche la goutte : elle est clouée à la page (appelé avant hurtPlayer)
function agrafeHit() {
  const p = G.p;
  if (p.inv > 0 || p.dashT > 0 || G.state !== 'play') return;
  p.pin = AGRAF.pinP; G.agrafees = (G.agrafees || 0) + 1;
  AU.play('agrafPin');
  addText(p.x, p.y - 34, 'agrafée !', C.red, 28);
  if (G.agrafees === 1) caption('Agrafée ! Bouge dans tous les sens pour t’arracher', 3, 'pink');
}
// secouer la goutte (ou faire un pâté) arrache l'agrafe
function stepPin(p, inp, dt) {
  if (!(p.pin > 0)) return false;
  if (inp.dash && p.dashCd <= 0 && !devoirHas('sansPate')) { unpin(p); return false; }
  p.pin -= dt * (1 + 2.2 * Math.min(1, Math.hypot(inp.x, inp.y)));   // plus on se débat, plus vite on s'arrache
  if (p.pin <= 0) { unpin(p); return false; }
  p.vx = 0; p.vy = 0;
  return true;
}
function unpin(p) {
  p.pin = 0; AU.play('agrafTear');
  addText(p.x, p.y - 30, 'arrachée !', C.ink, 22);
  for (let i = 0; i < 8; i++) { const a = rnd(TAU); G.parts.push({ x: p.x, y: p.y, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160, life: 0.4, max: 0.4, size: rnd(2, 3.5), color: i % 2 ? AGRAF_STEEL : C.ink, drag: 4 }); }
}

// agrafes en vol qui arrivent au bout : elles se plantent dans la page ; agrafes plantées : elles clouent les ratures
function stepAgrafFx(dt) {
  for (const b of G.ebul) {
    if (!b.agrafe || b.life > 0.1) continue;
    b.life = 0;
    if (G.agrafes.length >= AGRAF.plantMax) G.agrafes.shift();
    G.agrafes.push({ x: b.x, y: b.y, a: b.a, life: AGRAF.plantLife });
    G.parts.push({ x: b.x, y: b.y, vx: rnd(-40, 40), vy: rnd(-40, 40), life: 0.3, max: 0.3, size: 2, color: AGRAF_STEEL, drag: 4 });
  }
  for (const s of G.agrafes) {
    s.life -= dt;
    if (s.life <= 0) continue;
    query(s.x, s.y, 70, tmpA);
    for (const e of tmpA) {
      if (!canPin(e) || (e.x - s.x) ** 2 + (e.y - s.y) ** 2 > (e.r + 10) ** 2) continue;
      pinEnemy(e, AGRAF.pinE); s.life = 0; AU.play('agrafPin');
      if (!G.agrafPinSeen) { G.agrafPinSeen = true; caption('Une rature a marché sur une agrafe : clouée !', 2.8, 'green'); }
      break;
    }
  }
  G.agrafes = G.agrafes.filter(s => s.life > 0);
}
const canPin = e => !e.dead && !e.ghost && !e.isBoss && !ERRANTES.has(e.type) && !(e.pin > 0);
function pinEnemy(e, t) {
  e.pin = t; e.pinA = rnd(-0.5, 0.5); e.vx = 0; e.vy = 0;
  G.agrafPins = (G.agrafPins || 0) + 1;
}

function agrafDeath(e) {
  query(e.x, e.y, AGRAF.deathR, tmpB);
  let n = 0;
  for (const o of tmpB) if (canPin(o) && Math.hypot(o.x - e.x, o.y - e.y) < AGRAF.deathR) { pinEnemy(o, AGRAF.deathPin); n++; }
  for (let i = 0; i < 12; i++) dropLetter(e.x + rnd(-50, 50), e.y + rnd(-50, 50), 3);
  G.score += 500; G.agrafKills = (G.agrafKills || 0) + 1;
  for (let i = 0; i < 30; i++) { const a = rnd(TAU), s = rnd(140, 460); G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.4, 0.9), max: 0.9, size: rnd(2, 4), color: i % 3 ? AGRAF_STEEL : AGRAF_BODY, drag: 3 }); }
  G.rings.push({ x: e.x, y: e.y, t: 0, dur: 0.6, r: AGRAF.deathR, color: AGRAF_STEEL });
  caption(n ? 'Clac-clac-clac ! ' + n + ' ratures agrafées à la page.' : 'Clac-clac-clac ! La dernière rafale.', 2.8, 'green');
  AU.play('agrafJam'); G.cam.shake = Math.max(G.cam.shake, 12);
}

// le pilote : se tenir à côté d'elle pour la biffer, jamais dans l'axe annoncé
function agrafTarget() {
  for (const e of G.enemies) {
    if (e.type !== 'agrafeuse' || e.ghost) continue;
    const a = Math.atan2(G.p.y - e.y, G.p.x - e.x) + 0.6;
    return { x: e.x + Math.cos(a) * 230, y: e.y + Math.sin(a) * 230 };
  }
  return null;
}
function agrafDanger(x, y) {
  let s = 0;
  for (const e of G.enemies) {
    if (e.type !== 'agrafeuse' || (e.phase !== 'warn' && e.phase !== 'fire')) continue;
    const d = segDist(x, y, e.x, e.y, e.x + Math.cos(e.ang) * AGRAF.len, e.y + Math.sin(e.ang) * AGRAF.len);
    s += 900 / Math.pow(Math.max(6, d), 1.4);
  }
  return s;
}

function drawAgrafeuse(e, fr, fl) {
  const j = (fr - 1) * 0.8, left = Math.cos(e.ang) < 0;
  if (e.phase === 'leave') ctx.globalAlpha = Math.max(0, e.pt / 1.1);
  ctx.fillStyle = 'rgba(46,46,51,0.12)'; ctx.beginPath(); ctx.ellipse(0, 30, 52, 9, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.scale(1.2, 1.2);
  if (left) ctx.scale(-1, 1);   // elle regarde toujours vers sa cible
  ctx.translate(0, j * 0.6 - e.clac * 3);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.2;
  // le socle
  ctx.fillStyle = fl ? '#ffd9dc' : '#2c3550'; roundRect(-50, 12, 100, 14, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = AGRAF_STEEL; roundRect(28, 8, 22, 6, 2); ctx.fill(); ctx.stroke();   // l'enclume
  // le bras, qui s'ouvre quand elle vise
  ctx.save(); ctx.translate(-42, 8); ctx.rotate(-0.42 * e.lid + 0.06 * e.clac);
  ctx.fillStyle = fl ? '#ffd9dc' : AGRAF_BODY; roundRect(0, -26, 96, 22, 9); ctx.fill(); ctx.stroke();
  ctx.fillStyle = AGRAF_STEEL; roundRect(6, -7, 88, 7, 3); ctx.fill(); ctx.stroke();   // le magasin
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(14, -21); ctx.lineTo(70, -21); ctx.stroke();
  // les yeux, sur le bras
  const look = left ? Math.PI - Math.atan2(G.p.y - e.y, G.p.x - e.x) : Math.atan2(G.p.y - e.y, G.p.x - e.x);
  for (const s of [52, 70]) {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s, -15, 6.5, 0, TAU); ctx.fill(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + Math.cos(look) * 2.6, -15 + Math.sin(look) * 2.6, 2.8, 0, TAU); ctx.fill();
  }
  if (e.phase === 'warn') { ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(46, -26); ctx.lineTo(60, -30); ctx.moveTo(64, -26); ctx.lineTo(76, -30); ctx.stroke(); }   // les sourcils froncés
  ctx.restore();
  ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(-42, 8, 4, 0, TAU); ctx.fill();   // la charnière
  ctx.restore();
  ctx.globalAlpha = 1;
}
function drawStaple(x, y, a, size, alpha) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#5b606c'; ctx.lineWidth = size * 0.22; ctx.lineCap = 'square'; ctx.lineJoin = 'miter';
  ctx.beginPath(); ctx.moveTo(-size * 0.22, -size * 0.5); ctx.lineTo(size * 0.12, -size * 0.5); ctx.lineTo(size * 0.12, size * 0.5); ctx.lineTo(-size * 0.22, size * 0.5); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = size * 0.07; ctx.beginPath(); ctx.moveTo(size * 0.16, -size * 0.42); ctx.lineTo(size * 0.16, size * 0.42); ctx.stroke();
  ctx.restore();
}
function drawAgrafFx() {
  for (const s of G.agrafes) drawStaple(s.x, s.y, s.a, 16, Math.min(1, s.life / 1.2) * 0.9);
  for (const e of G.enemies) {
    if (e.type === 'agrafeuse' && e.phase === 'warn') {
      const k = 1 - e.pt / AGRAF.warn;
      ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.ang);
      ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.35 * k + 0.15 * Math.sin(G.time * 30); ctx.lineWidth = 3; ctx.setLineDash([4, 14]);
      for (const o of [-12, 12]) { ctx.beginPath(); ctx.moveTo(56, o); ctx.lineTo(AGRAF.len, o); ctx.stroke(); }   // deux rails de pointillés, comme une agrafe vue de dessus
      ctx.restore();
    }
    if (e.pin > 0) drawStaple(e.x, e.y - e.r * 0.2, e.pinA + Math.PI / 2, Math.max(18, e.r * 1.2), Math.min(1, e.pin * 3));
  }
  for (const b of G.ebul) if (b.agrafe) drawStaple(b.x, b.y, b.a, 18, 1);
}
function drawPlayerPin() {
  const p = G.p; if (!(p.pin > 0)) return;
  drawStaple(p.x + vrnd(-1.5, 1.5), p.y, Math.PI / 2 + 0.2, 30, 1);
  txt('secoue-toi !', p.x, p.y + 38, 20, { color: C.red, alpha: 0.6 + 0.4 * Math.sin(G.time * 12) });
}
