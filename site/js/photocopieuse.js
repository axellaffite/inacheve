// La Photocopieuse : une machine de bureau qui se promène de page en page, une fois par chapitre, vers 1:40.
// Elle soulève son capot, annonce une bande de page en pointillés verts, puis la balaie de sa lumière : chaque rature prise
// dans la lumière est photocopiée (une copie grise, plus fragile). Mais si TOI tu es dans la lumière, elle imprime une copie
// de la goutte, qui tire à tes côtés pendant douze secondes. Biffée : bourrage papier, toutes ses copies s'effacent.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const PHOTO = { at: 100, dist: 250, warn: 1.05, scan: 1.1, eject: 0.5, cycle: 4.6, first: 1.6, len: 600, wid: 320, front: 56,
  copyMax: 6, copiesMax: 24, doubleT: 12, stay: 40, sheets: 5 };
const PHOTO_NOCOPY = new Set(['photocopieuse', 'tourbillon']);   // pas de deuxième photocopieuse, ni de tourbillon de plus
ETYPES.photocopieuse = { r: 52, hp: 70, speed: 58, dmg: 1, xp: 30, agil: 1.6 };
const PHOTO_GREEN = '#58c26a';

// Vers 1:40, une fois par chapitre (jamais pendant le patron)
function stepPhoto(dt) {
  if (!G.photoDone && G.t >= PHOTO.at && !G.boss && !G.bossDefeated) {
    G.photoDone = true;
    spawnPhotocopieuse();
  }
  stepDouble(dt);
}
function spawnPhotocopieuse(x, y) {
  const e = x === undefined ? spawnAround('photocopieuse') : spawnEnemy('photocopieuse', x, y);
  // les ratures des pages lointaines sont très solides (CH().scale) : la machine, elle, ne doit pas tenir plus qu'un patron
  e.hp = e.maxHp = ETYPES.photocopieuse.hp * (1 + G.t / 190) * (1 + 0.15 * CH().scale) * (devoirHas('double') ? 0.55 : 1);
  e.pt = PHOTO.first; e.life = 0; e.ang = 0; e.scanK = 0; e.lid = 0; e.copied = new Set(); e.copiedP = false;
  AU.play('photoArrive');
  if (!G.photoSeen) { G.photoSeen = true; caption('Clac, clac… une photocopieuse s’est égarée dans le cahier !', 3.6, 'pink'); caption('Tout ce qui passe dans sa lumière est copié… toi aussi !', 3.8, 'green'); }
  else caption('La photocopieuse est de retour !', 2.6, 'pink');
  return e;
}

// Repère de la vitre : u le long du faisceau (depuis la machine), v en travers
function photoLocal(e, x, y) {
  const c = Math.cos(e.ang), s = Math.sin(e.ang), dx = x - e.x, dy = y - e.y;
  return { u: dx * c + dy * s, v: -dx * s + dy * c };
}
const photoBar = e => PHOTO.front + e.scanK * PHOTO.len;   // la barre de lumière, en u

function stepPhotocopieuse(e, dt, dx, dy, d, slow, hid) {
  e.pt -= dt; e.life += dt;
  // elle garde ses distances, en tournant doucement autour de toi
  const want = clamp((d - PHOTO.dist) / 120, -0.3, 1);   // elle recule à peine : on peut la rattraper
  let mx = (dx / d * want - dy / d * 0.45) * e.speed * slow, my = (dy / d * want + dx / d * 0.45) * e.speed * slow;
  e.lid = Math.max(0, e.lid - dt * 2);
  if (e.phase === 'walk') {
    if (e.life > PHOTO.stay) { e.phase = 'leave'; e.pt = 1.1; e.ghost = true; caption('Plus de papier : la photocopieuse s’en va.', 2.6, 'green'); AU.play('photoJam'); }
    else if (e.pt <= 0 && d < 760 && !hid) {
      e.phase = 'warn'; e.pt = PHOTO.warn; e.ang = Math.atan2(dy, dx); e.copied = new Set(); e.copiedP = false; e.scanK = 0;
      AU.play('photoWarn');
    }
  } else if (e.phase === 'warn') {
    mx = 0; my = 0; e.lid = Math.min(1, e.lid + dt * 5);
    if (e.pt > PHOTO.warn * 0.45) { let da = Math.atan2(dy, dx) - e.ang; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU; e.ang += da * Math.min(1, dt * 5); }
    if (e.pt <= 0) { e.phase = 'scan'; e.pt = PHOTO.scan; AU.play('photoScan'); }
  } else if (e.phase === 'scan') {
    mx = 0; my = 0; e.lid = 1;
    e.scanK = clamp(1 - e.pt / PHOTO.scan, 0, 1);
    scanPass(e);
    if (e.pt <= 0) { e.phase = 'eject'; e.pt = PHOTO.eject; ejectSheets(e); }
  } else if (e.phase === 'eject') {
    mx = 0; my = 0;
    if (e.pt <= 0) { e.phase = 'walk'; e.pt = PHOTO.cycle; }
  } else if (e.phase === 'leave') {
    mx *= -2; my *= -2;
    if (e.pt <= 0) e.dead = true;   // partie sans rien laisser
  }
  MV.x = mx; MV.y = my; MV.agil = 2;
}

// La barre de lumière passe : on copie ce qu'elle touche (une fois par passage)
function scanPass(e) {
  const bar = photoBar(e), half = PHOTO.wid / 2;
  let live = 0;
  for (const o of G.enemies) if (o.copie && !o.dead) live++;
  for (const o of G.enemies) {
    if (o.dead || o === e || o.isBoss || o.copie || o.ghost || PHOTO_NOCOPY.has(o.type) || e.copied.has(o.id)) continue;
    const L = photoLocal(e, o.x, o.y);
    if (L.u < PHOTO.front || L.u > bar || Math.abs(L.v) > half) continue;
    e.copied.add(o.id);
    if (e.copied.size > PHOTO.copyMax || live >= PHOTO.copiesMax) continue;
    copyEnemy(o, e.ang); live++;
  }
  const p = G.p, L = photoLocal(e, p.x, p.y);
  if (!e.copiedP && L.u >= PHOTO.front && L.u <= bar && Math.abs(L.v) <= half + p.r) { e.copiedP = true; makeDouble(e); }
}
function copyEnemy(o, ang) {
  const side = rand() < 0.5 ? -1 : 1, off = o.r * 2 + 14;
  const x = clamp(o.x - Math.sin(ang) * off * side, 30, WORLD.w - 30), y = clamp(o.y + Math.cos(ang) * off * side, 30, WORLD.h - 30);
  const c = spawnEnemy(o.type, x, y);
  c.copie = true; c.hp = c.maxHp = o.maxHp * 0.5; c.xp = Math.max(1, Math.ceil(o.xp / 2));
  c.shape = o.shape; c.rot = o.rot; c.flash = 0.25;
  G.copies = (G.copies || 0) + 1;
  for (let i = 0; i < 6; i++) G.parts.push({ x, y, vx: rnd(-90, 90), vy: rnd(-90, 90), life: 0.5, max: 0.5, size: rnd(2, 4), color: i % 2 ? '#c9c9cc' : PHOTO_GREEN, drag: 4 });
  AU.play('photoCopy');
}

// La copie de la goutte : grise, elle te suit et tire avec toi
function makeDouble(e) {
  const p = G.p, side = photoLocal(e, p.x, p.y).v < 0 ? -1 : 1;
  const ox = -Math.sin(e.ang) * 56 * side, oy = Math.cos(e.ang) * 56 * side;
  const fresh = !G.double;
  G.double = { x: p.x + ox, y: p.y + oy, ox, oy, t: PHOTO.doubleT, fireCd: 0.25, face: p.face, look: p.face, squash: 0, r: p.r, vx: 0, vy: 0 };
  G.photos = (G.photos || 0) + 1;
  AU.play('photoDouble'); G.cam.shake = Math.max(G.cam.shake, 6);
  G.rings.push({ x: G.double.x, y: G.double.y, t: 0, dur: 0.6, r: 120, color: PHOTO_GREEN });
  addText(p.x, p.y - 34, 'photocopié !', '#3c9a4c', 28);
  if (G.photos === 1) caption('Photocopié ! Ta copie se bat à tes côtés', 3.2, 'green');
  else if (!fresh) caption('Copie rafraîchie !', 1.8, 'green');
}
function stepDouble(dt) {
  const D = G.double; if (!D) return;
  const p = G.p;
  D.t -= dt;
  if (D.t <= 0) { G.double = null; for (let i = 0; i < 14; i++) G.parts.push({ x: D.x + rnd(-10, 10), y: D.y + rnd(-10, 10), vx: rnd(-60, 60), vy: rnd(-90, -20), life: 0.7, max: 0.7, size: rnd(2, 4), color: '#a9a9ae', drag: 2 }); return; }
  const k = 1 - Math.exp(-dt * 7), tx = p.x + D.ox, ty = p.y + D.oy;
  const nx = lerp(D.x, tx, k), ny = lerp(D.y, ty, k);
  D.vx = (nx - D.x) / dt; D.vy = (ny - D.y) / dt; D.x = nx; D.y = ny;
  const sp = Math.hypot(D.vx, D.vy);
  D.face = sp > 20 ? Math.atan2(D.vy, D.vx) : p.face; D.squash = lerp(D.squash, Math.min(1, sp / 600), Math.min(1, dt * 10));
  D.fireCd -= dt;
  if (D.fireCd > 0) return;
  let tgt = null, bd = 520 * 520;
  for (const e of G.enemies) { if (e.dead || e.ghost) continue; const dd = (e.x - D.x) ** 2 + (e.y - D.y) ** 2; if (dd < bd) { bd = dd; tgt = e; } }
  if (!tgt) { D.fireCd = 0.1; return; }
  D.fireCd = 1 / (G.S.rate * 0.75);
  const a = Math.atan2(tgt.y - D.y, tgt.x - D.x); D.look = a;
  const sp2 = G.S.pspeed;
  G.shots.push({ x: D.x + Math.cos(a) * 12, y: D.y + Math.sin(a) * 12, vx: Math.cos(a) * sp2, vy: Math.sin(a) * sp2, r: 5, life: 1.1, pierce: 0, bounce: 0, hit: new Set(), px: D.x, py: D.y, copie: true, k: 0.8 });
}

// Après chaque passage, la machine crache ses feuilles en éventail
function ejectSheets(e) {
  const a0 = Math.atan2(G.p.y - e.y, G.p.x - e.x), n = PHOTO.sheets;
  for (let i = 0; i < n; i++) {
    const a = a0 + (i - (n - 1) / 2) * 0.24, sp = 230;
    G.ebul.push({ x: e.x + Math.cos(a) * 40, y: e.y + Math.sin(a) * 40, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 3.2, sheet: true, a, spin: rnd(-6, 6) });
  }
  AU.play('photoEject');
}

// Bourrage papier : la machine est biffée, ses copies s'effacent avec elle
function photoDeath(e) {
  let n = 0;
  for (const o of G.enemies) if (o.copie && !o.dead) {
    o.dead = true; n++;
    for (let i = 0; i < 5; i++) G.parts.push({ x: o.x + rnd(-8, 8), y: o.y + rnd(-8, 8), vx: rnd(-120, 120), vy: rnd(-120, 120), life: 0.6, max: 0.6, size: rnd(2, 5), color: i % 2 ? '#fff' : '#c9c9cc', drag: 3 });
  }
  for (let i = 0; i < 12; i++) dropLetter(e.x + rnd(-50, 50), e.y + rnd(-50, 50), 3);
  G.score += 500; G.photoKills = (G.photoKills || 0) + 1;
  for (let i = 0; i < 26; i++) { const a = rnd(TAU), s = rnd(120, 380); G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.5, 1), max: 1, size: rnd(5, 9), color: '#fff', drag: 3 }); }
  caption(n ? 'Bourrage papier ! Ses ' + n + ' copies s’effacent.' : 'Bourrage papier !', 2.8, 'green');
  AU.play('photoJam'); G.cam.shake = Math.max(G.cam.shake, 12);
}

// Le pilote des vidéos va se faire photocopier : il se place au milieu de la vitre pendant l'annonce
function photoTarget() {
  for (const e of G.enemies) {
    if (e.type !== 'photocopieuse' || e.ghost) continue;
    if (e.phase === 'warn' && !(G.double && G.double.t > 4)) { const u = PHOTO.front + PHOTO.len * 0.32; return { x: e.x + Math.cos(e.ang) * u, y: e.y + Math.sin(e.ang) * u }; }
    if (e.phase === 'walk') { const a = Math.atan2(G.p.y - e.y, G.p.x - e.x); return { x: e.x + Math.cos(a) * 190, y: e.y + Math.sin(a) * 190 }; }   // sinon, on va la biffer
  }
  return null;
}

/* ----- dessin ----- */
function drawPhotocopieuse(e, fr, fl) {
  const j = (fr - 1) * 0.9, look = Math.atan2(G.p.y - e.y, G.p.x - e.x);
  ctx.scale(1.25, 1.25);
  if (e.phase === 'leave') ctx.globalAlpha = Math.max(0, e.pt / 1.1);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // ombre
  ctx.fillStyle = 'rgba(46,46,51,0.12)'; ctx.beginPath(); ctx.ellipse(0, 36, 50, 9, 0, 0, TAU); ctx.fill();
  // le bac à papier, avec une feuille qui dépasse
  ctx.fillStyle = '#fff'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.6;
  ctx.save(); ctx.translate(44, 6 + j); ctx.rotate(0.12); ctx.fillRect(-4, -12, 22, 26); ctx.strokeRect(-4, -12, 22, 26);
  ctx.strokeStyle = '#bdbdc4'; ctx.lineWidth = 1; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(0, -7 + i * 6); ctx.lineTo(13, -7 + i * 6); ctx.stroke(); }
  ctx.restore();
  // le corps
  ctx.fillStyle = fl ? '#ffd9dc' : '#ece6d6'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.2;
  roundRect(-42 + j * 0.5, -22, 84, 54, 7); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#d9d1bd'; roundRect(-36, 18, 72, 10, 3); ctx.fill(); ctx.stroke();   // le tiroir
  ctx.beginPath(); ctx.moveTo(-8, 23); ctx.lineTo(8, 23); ctx.stroke();
  // la vitre et le capot qui se soulève
  const glow = e.phase === 'scan' ? 0.75 + 0.25 * Math.sin(G.time * 40) : e.phase === 'warn' ? 0.35 : 0;
  if (glow) { ctx.fillStyle = 'rgba(88,194,106,' + glow + ')'; ctx.fillRect(-38, -26, 76, 5); }
  ctx.save(); ctx.translate(-40, -24); ctx.rotate(-0.5 * e.lid);
  ctx.fillStyle = fl ? '#ffd9dc' : '#cfc7b2'; ctx.strokeStyle = C.graphite; roundRect(0, -9, 82, 10, 3); ctx.fill(); ctx.stroke();
  ctx.restore();
  // le petit écran (« ×2 ») et deux boutons qui te regardent
  ctx.fillStyle = '#20402a'; roundRect(-32, -14, 30, 15, 2); ctx.fill();
  ctx.fillStyle = PHOTO_GREEN; ctx.font = '700 12px ' + FONT_MAIN; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(e.phase === 'scan' ? '×' + clamp(e.copied.size, 1, PHOTO.copyMax) : '×2', -17, -6);
  for (const s of [10, 26]) {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s, -6, 6.5, 0, TAU); ctx.fill(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.6; ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + Math.cos(look) * 2.6, -6 + Math.sin(look) * 2.6, 2.8, 0, TAU); ctx.fill();
  }
  // un voyant qui clignote
  ctx.fillStyle = Math.floor(G.time * 3) % 2 ? PHOTO_GREEN : '#2c5a35'; ctx.beginPath(); ctx.arc(32, 8, 3, 0, TAU); ctx.fill();
  ctx.globalAlpha = 1;
}

// La vitre annoncée, la barre de lumière, les feuilles crachées et la copie de la goutte (par-dessus les ratures)
function drawPhotoFx() {
  for (const e of G.enemies) {
    if (e.type !== 'photocopieuse' || (e.phase !== 'warn' && e.phase !== 'scan')) continue;
    ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.ang);
    const half = PHOTO.wid / 2, x0 = PHOTO.front;
    if (e.phase === 'warn') {
      const k = 1 - e.pt / PHOTO.warn;
      ctx.globalAlpha = 0.08 + 0.06 * k; ctx.fillStyle = PHOTO_GREEN; ctx.fillRect(x0, -half, PHOTO.len, PHOTO.wid);
      ctx.globalAlpha = 0.55 + 0.35 * Math.sin(G.time * 18); ctx.strokeStyle = '#3c9a4c'; ctx.lineWidth = 3; ctx.setLineDash([16, 10]);
      ctx.strokeRect(x0, -half, PHOTO.len, PHOTO.wid);
    } else {
      const bar = photoBar(e);
      ctx.globalAlpha = 0.12; ctx.fillStyle = PHOTO_GREEN; ctx.fillRect(x0, -half, bar - x0, PHOTO.wid);
      const g = ctx.createLinearGradient(bar - 70, 0, bar + 10, 0);
      g.addColorStop(0, 'rgba(160,240,170,0)'); g.addColorStop(0.85, 'rgba(120,230,140,0.75)'); g.addColorStop(1, 'rgba(255,255,255,0.95)');
      ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(bar - 70, -half, 80, PHOTO.wid);
      ctx.globalAlpha = 0.4; ctx.strokeStyle = '#3c9a4c'; ctx.lineWidth = 2; ctx.setLineDash([16, 10]); ctx.strokeRect(x0, -half, PHOTO.len, PHOTO.wid);
    }
    ctx.restore();
    if (e.phase === 'scan') { const u = photoBar(e); txt('Bzzzz…', e.x + Math.cos(e.ang) * u, e.y + Math.sin(e.ang) * u - 20, 24, { color: '#3c9a4c', alpha: 0.85 }); }   // jamais la tête en bas
  }
  // les feuilles crachées
  for (const b of G.ebul) {
    if (!b.sheet) continue;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a + G.time * b.spin * 0.3);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.4; ctx.fillRect(-9, -12, 18, 24); ctx.strokeRect(-9, -12, 18, 24);
    ctx.strokeStyle = C.red; ctx.beginPath(); ctx.moveTo(-5, -12); ctx.lineTo(-5, 12); ctx.stroke();
    ctx.strokeStyle = '#9aa3d8'; ctx.lineWidth = 1; for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-3, -6 + i * 5); ctx.lineTo(6, -6 + i * 5); ctx.stroke(); }
    ctx.restore();
  }
}
function drawDouble() {
  const D = G.double; if (!D) return;
  if (D.t < 2.2 && Math.floor(G.time * 10) % 2 === 0) return;   // elle pâlit avant de disparaître
  drawPlayer({ x: D.x, y: D.y, r: D.r, squash: D.squash, face: D.face, look: D.look, inv: 0, dashCd: 0, dashT: 0, hidden: 0 }, true);
  txt('copie', D.x, D.y - 30, 16, { color: '#3c9a4c', alpha: 0.85 });
}
