'use strict';

// Le tampon dateur (itération 33) : la cinquième machine égarée. Il saute et retombe de tout son poids :
// tout ce qui se trouve sous son rectangle reste figé à la date du jour (les ratures, les lettres… et la goutte).
// Une rature datée ne bouge plus et prend plus cher ; une lettre datée compte double. Il avance d'un jour à chaque coup.
const DATEUR = { at: 80, stay: 34, dist: 280, warn: 1.0, leap: 0.55, lift: 0.45, cycle: 2.3, first: 1.5, w: 250, h: 130,
  pinP: 1.2, pinE: 4, mul: 1.6, imprint: 9, max: 8, deathR: 480, deathPin: 3.2, again: 24 };
ETYPES.dateur = { r: 40, hp: 64, speed: 72, dmg: 1, xp: 30, agil: 1.8 };
const DATEUR_BODY = '#4f5d9c', DATEUR_KNOB = '#b8473f', DATEUR_INK = '#c23b5a';
const MOIS = ['JANV.', 'FÉVR.', 'MARS', 'AVR.', 'MAI', 'JUIN', 'JUIL.', 'AOÛT', 'SEPT.', 'OCT.', 'NOV.', 'DÉC.'];
ERRANTES.add('dateur');
PHOTO_NOCOPY.add('dateur');
VOISIN_SAYS.dateur = ['Hé ! Je suis daté d’aujourd’hui !', 'Je ne peux plus bouger… c’est la date !', 'Il m’a tamponné le front !'];

// la date du tampon : le jour même (la date du jeu en capture), puis un jour de plus à chaque coup
function dateurDay(n) {
  const iso = todayISO(), d = new Date(Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10) + n));
  return d.getUTCDate() + ' ' + MOIS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}
const dateurShort = n => { const s = dateurDay(n).split(' '); return s[0] + ' ' + s[1]; };

function stepDateur(dt) {
  const at = G.dateurAt || (devoirHas('dateur') ? 20 : DATEUR.at);
  if (!G.dateurDone && G.t >= at && !G.boss && !G.bossDefeated) {
    G.dateurDone = true;
    spawnDateur();
  }
}
function spawnDateur(x, y) {
  const e = x === undefined ? spawnAround('dateur') : spawnEnemy('dateur', x, y);
  e.hp = e.maxHp = ETYPES.dateur.hp * (1 + G.t / 190) * (1 + 0.15 * CH().scale);
  e.pt = DATEUR.first; e.life = 0; e.press = 0; e.h = 0; e.tx = e.x; e.ty = e.y; e.sx = e.x; e.sy = e.y; e.day = 0; e.roll = 0;
  AU.play('dateurArrive');
  if (!G.dateurSeen) { G.dateurSeen = true; caption('Tchac ! Un tampon dateur s’est échappé du bureau !', 3.6, 'pink'); caption('Ce qu’il tamponne reste figé à sa date : attire les ratures dessous !', 3.8, 'hl'); }
  else caption('Le tampon dateur est de retour !', 2.6, 'pink');
  return e;
}
// il part de lui-même, ou on le biffe : avec la consigne « Tout est daté », il revient
function dateurGone() { if (devoirHas('dateur')) { G.dateurDone = false; G.dateurAt = G.t + DATEUR.again; } }

function stepDateurEnemy(e, dt, dx, dy, d, slow, hid) {
  e.pt -= dt; e.life += dt; e.roll = Math.max(0, e.roll - dt * 3);
  const want = clamp((d - DATEUR.dist) / 120, -0.6, 1);
  let mx = (dx / d * want + dy / d * 0.4) * e.speed * slow, my = (dy / d * want - dx / d * 0.4) * e.speed * slow;
  if (e.phase === 'walk') {
    e.press = Math.max(0, e.press - dt * 3);
    if (e.life > DATEUR.stay) { e.phase = 'leave'; e.pt = 1.1; e.ghost = true; caption('Plus d’encre : le tampon dateur retourne au bureau.', 2.6, 'hl'); AU.play('dateurJam'); }
    else if (e.pt <= 0 && d < 700 && !hid) {
      e.phase = 'warn'; e.pt = DATEUR.warn;
      e.tx = clamp(G.p.x + G.p.vx * 0.3, 140, WORLD.w - 140); e.ty = clamp(G.p.y + G.p.vy * 0.3, 90, WORLD.h - 90);
      AU.play('dateurWarn');
    }
  } else if (e.phase === 'warn') {
    mx = 0; my = 0; e.press = Math.min(1, e.press + dt * 2.5);
    if (e.pt > DATEUR.warn * 0.45) {   // il vise encore, puis il se décide : on a le temps de sortir du cadre
      const k = Math.min(1, dt * 3);
      e.tx = clamp(lerp(e.tx, G.p.x, k), 140, WORLD.w - 140); e.ty = clamp(lerp(e.ty, G.p.y, k), 90, WORLD.h - 90);
    }
    if (e.pt <= 0) { e.phase = 'leap'; e.pt = DATEUR.leap; e.sx = e.x; e.sy = e.y; e.ghost = true; AU.play('perfoHop'); }
  } else if (e.phase === 'leap') {
    const k = clamp(1 - e.pt / DATEUR.leap, 0, 1);
    e.x = lerp(e.sx, e.tx, k); e.y = lerp(e.sy, e.ty, k); e.h = Math.sin(k * Math.PI) * 150; e.vx = 0; e.vy = 0;
    mx = 0; my = 0;
    if (e.pt <= 0) { e.x = e.tx; e.y = e.ty; e.h = 0; e.ghost = false; dateurStamp(e); e.phase = 'lift'; e.pt = DATEUR.lift; }
  } else if (e.phase === 'lift') {   // il reste un instant appuyé sur la page
    mx = 0; my = 0; e.press = Math.max(0, e.press - dt * 2);
    if (e.pt <= 0) { e.phase = 'walk'; e.pt = DATEUR.cycle; }
  } else if (e.phase === 'leave') {
    mx *= -2; my *= -2;
    if (e.pt <= 0) { e.dead = true; dateurGone(); }
  }
  MV.x = mx; MV.y = my; MV.agil = e.phase === 'leap' ? 40 : 2;
}

const inStamp = (s, x, y, m) => Math.abs(x - s.x) < DATEUR.w / 2 + m && Math.abs(y - s.y) < DATEUR.h / 2 + m;
function dateurStamp(e) {
  const date = dateurDay(e.day), s = { x: e.x, y: e.y, date, t: 0, life: DATEUR.imprint, rot: rnd(-0.06, 0.06) };
  e.day++; e.roll = 1;
  if (G.dates.length >= DATEUR.max) G.dates.shift();
  G.dates.push(s);
  G.dateurs = (G.dateurs || 0) + 1;
  const p = G.p;
  if (inStamp(s, p.x, p.y, p.r * 0.4) && p.inv <= 0 && p.dashT <= 0) {
    p.pin = DATEUR.pinP; p.dateur = date; G.dateesP = (G.dateesP || 0) + 1;
    addText(p.x, p.y - 36, 'datée !', DATEUR_INK, 28);
    if (G.dateesP === 1) caption('Datée ! Secoue-toi pour décoller l’encre (ou fais un pâté).', 3, 'pink');
  }
  let n = 0;
  query(s.x, s.y, DATEUR.w / 2 + 60, tmpB);
  for (const o of tmpB) if (canPin(o) && inStamp(s, o.x, o.y, o.r * 0.3)) { dateEnemy(o, DATEUR.pinE, date); n++; }
  let l = 0;
  for (const it of G.items) if (!it.pull && !it.date && inStamp(s, it.x, it.y, 0)) { it.date = true; it.value *= 2; it.vx = 0; it.vy = 0; l++; }
  if (G.v && inStamp(s, G.v.x, G.v.y, 10)) voisinSay('dateur');
  if (n && !G.dateeSeen) { G.dateeSeen = true; caption(n > 1 ? n + ' ratures datées : elles ne bougent plus, biffe-les !' : 'Une rature datée : elle ne bouge plus, biffe-la !', 2.8, 'green'); }
  else if (l && !G.dateLSeen) { G.dateLSeen = true; caption('Des lettres datées : elles comptent double !', 2.6, 'green'); }
  AU.play('dateurClac'); G.cam.shake = Math.max(G.cam.shake, 9);
  for (let i = 0; i < 14; i++) { const a = rnd(TAU), sp = rnd(90, 260); G.parts.push({ x: s.x + Math.cos(a) * DATEUR.w * 0.45, y: s.y + Math.sin(a) * DATEUR.h * 0.45, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.4, max: 0.4, size: rnd(2, 4), color: i % 3 ? DATEUR_INK : C.pencil, drag: 4 }); }
}
function dateEnemy(o, t, date) {
  o.pin = Math.max(o.pin || 0, t); o.pinA = rnd(-0.3, 0.3); o.vx = 0; o.vy = 0; o.datee = t; o.dateTxt = date;
  G.datees = (G.datees || 0) + 1;
}

function stepDateurFx(dt) {
  for (const s of G.dates) s.t += dt;
  if (G.dates.length) G.dates = G.dates.filter(s => s.t < s.life);
  for (const e of G.enemies) if (e.datee > 0) e.datee -= dt;
}

function dateurDeath(e) {
  const date = dateurDay(e.day);
  query(e.x, e.y, DATEUR.deathR, tmpB);
  let n = 0;
  for (const o of tmpB) if (canPin(o) && Math.hypot(o.x - e.x, o.y - e.y) < DATEUR.deathR) { dateEnemy(o, DATEUR.deathPin, date); n++; }
  for (let i = 0; i < 12; i++) dropLetter(e.x + rnd(-50, 50), e.y + rnd(-50, 50), 3);
  G.score += 500; G.dateurKills = (G.dateurKills || 0) + 1;
  for (let i = 0; i < 30; i++) { const a = rnd(TAU), s = rnd(140, 460); G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.4, 0.9), max: 0.9, size: rnd(2, 4), color: i % 3 ? DATEUR_INK : DATEUR_BODY, drag: 3 }); }
  G.rings.push({ x: e.x, y: e.y, t: 0, dur: 0.6, r: DATEUR.deathR, color: DATEUR_INK });
  caption(n ? 'Dernier coup de tampon : ' + n + ' ratures datées du ' + date + ' !' : 'Dernier coup de tampon, daté du ' + date + '.', 2.8, 'green');
  AU.play('dateurJam'); G.cam.shake = Math.max(G.cam.shake, 12);
  dateurGone();
}

function dateurTarget() {
  for (const e of G.enemies) {
    if (e.type !== 'dateur' || (e.ghost && e.phase !== 'leap')) continue;
    if (e.phase === 'warn' || e.phase === 'leap') {   // le pilote sort du cadre par le côté le plus proche
      const dx = G.p.x - e.tx, dy = G.p.y - e.ty, ox = (DATEUR.w / 2 + 70) * Math.sign(dx || 1), oy = (DATEUR.h / 2 + 70) * Math.sign(dy || 1);
      return Math.abs(dx) / DATEUR.w > Math.abs(dy) / DATEUR.h ? { x: e.tx + ox, y: G.p.y } : { x: G.p.x, y: e.ty + oy };
    }
    const a = Math.atan2(G.p.y - e.y, G.p.x - e.x) + 0.6;
    return { x: e.x + Math.cos(a) * 250, y: e.y + Math.sin(a) * 250 };
  }
  return null;
}
function dateurDanger(x, y) {
  let s = 0;
  for (const e of G.enemies) {
    if (e.type !== 'dateur' || (e.phase !== 'warn' && e.phase !== 'leap')) continue;
    const ox = Math.abs(x - e.tx) - DATEUR.w / 2, oy = Math.abs(y - e.ty) - DATEUR.h / 2, out = Math.max(ox, oy);
    if (out < 40) s += 60 + (40 - out) * 2;
  }
  return s;
}

/* ----- dessin ----- */
function drawDateur(e, fr, fl) {
  const j = (fr - 1) * 0.8, h = e.h || 0, press = e.press || 0;
  if (e.phase === 'leave') ctx.globalAlpha = Math.max(0, e.pt / 1.1);
  const sh = 1 - Math.min(0.5, h / 300);
  ctx.fillStyle = 'rgba(46,46,51,0.14)'; ctx.beginPath(); ctx.ellipse(0, 34, 46 * sh, 9 * sh, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(0, -h + j * 0.5);
  ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.2;
  // le socle et sa semelle encrée
  ctx.fillStyle = '#3a3d46'; roundRect(-40, 18, 80, 14, 3); ctx.fill(); ctx.stroke();
  ctx.fillStyle = DATEUR_INK; ctx.fillRect(-36, 29, 72, 3);
  // les deux bras du cadre
  ctx.strokeStyle = '#8c929e'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(-34, 18); ctx.lineTo(-30, -30 + press * 10); ctx.moveTo(34, 18); ctx.lineTo(30, -30 + press * 10); ctx.stroke();
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.2;
  // le corps, avec la fenêtre des molettes
  const by = -22 + press * 10;
  ctx.fillStyle = fl ? '#ffd9dc' : DATEUR_BODY; roundRect(-30, by, 60, 38, 6); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fffdf3'; roundRect(-25, by + 11, 50, 16, 3); ctx.fill(); ctx.stroke();
  ctx.save(); roundRect(-25, by + 11, 50, 16, 3); ctx.clip();
  ctx.fillStyle = DATEUR_INK; ctx.font = '700 12px ' + FONT_MAIN; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(dateurShort(e.day || 0), 0, by + 19 - (e.roll || 0) * 14);
  if (e.roll) ctx.fillText(dateurShort((e.day || 1) - 1), 0, by + 33 - e.roll * 14);
  ctx.restore();
  // la tige et le gros bouton, qui a des yeux
  ctx.fillStyle = '#8c929e'; ctx.fillRect(-4, by - 12, 8, 12); ctx.strokeRect(-4, by - 12, 8, 12);
  const ky = by - 24;
  ctx.fillStyle = fl ? '#ffb0b4' : DATEUR_KNOB; ctx.beginPath(); ctx.ellipse(0, ky, 24, 16, 0, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.beginPath(); ctx.ellipse(-8, ky - 7, 9, 4, -0.3, 0, TAU); ctx.fill();
  const look = Math.atan2(G.p.y - e.y, G.p.x - e.x);
  for (const s of [-9, 9]) {
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s, ky + 1, 5.5, 0, TAU); ctx.fill(); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + Math.cos(look) * 2.2, ky + 1 + Math.sin(look) * 2.2, 2.4, 0, TAU); ctx.fill();
  }
  if (e.phase === 'warn' || e.phase === 'leap') { ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-15, ky - 9); ctx.lineTo(-4, ky - 5); ctx.moveTo(15, ky - 9); ctx.lineTo(4, ky - 5); ctx.stroke(); }
  ctx.restore();
  ctx.globalAlpha = 1;
}
// une empreinte de tampon : un double cadre et la date, à l'encre violine
function drawStampMark(x, y, w, h, date, rot, alpha, size) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = alpha;
  ctx.strokeStyle = DATEUR_INK; ctx.lineWidth = Math.max(1.5, h * 0.035); roundRect(-w / 2, -h / 2, w, h, h * 0.08); ctx.stroke();
  ctx.lineWidth = Math.max(1, h * 0.015); roundRect(-w / 2 + h * 0.07, -h / 2 + h * 0.07, w - h * 0.14, h - h * 0.14, h * 0.05); ctx.stroke();
  ctx.fillStyle = DATEUR_INK; ctx.font = '700 ' + size + 'px ' + FONT_MAIN; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText(date, 0, h * 0.04);
  ctx.restore();
}
// sous les ratures : les empreintes encore fraîches
function drawDateurUnder() {
  for (const s of G.dates) {
    const k = s.t / s.life, a = k < 0.05 ? 1 : 0.75 * (1 - Math.max(0, (k - 0.6) / 0.4));
    drawStampMark(s.x, s.y, DATEUR.w, DATEUR.h, s.date, s.rot, a, 40);
  }
}
// au-dessus : le cadre qui annonce le coup, et la date sur le front des ratures datées
function drawDateurFx() {
  for (const e of G.enemies) {
    if (e.type === 'dateur' && (e.phase === 'warn' || e.phase === 'leap')) {
      const k = e.phase === 'warn' ? 1 - e.pt / DATEUR.warn : 1;
      ctx.save(); ctx.strokeStyle = DATEUR_INK; ctx.lineWidth = 3; ctx.setLineDash([12, 9]); ctx.lineDashOffset = -G.time * 50;
      ctx.globalAlpha = e.phase === 'leap' ? 0.8 : 0.35 + 0.3 * Math.sin(G.time * 24);
      ctx.strokeRect(e.tx - DATEUR.w / 2, e.ty - DATEUR.h / 2, DATEUR.w, DATEUR.h);
      ctx.setLineDash([]); ctx.globalAlpha = 0.08 + 0.14 * k; ctx.fillStyle = DATEUR_INK;
      ctx.fillRect(e.tx - DATEUR.w / 2, e.ty - DATEUR.h / 2, DATEUR.w, DATEUR.h);
      ctx.restore();
    }
    if (e.datee > 0 && !e.dead) drawStampMark(e.x, e.y - e.r * 0.1, 58, 24, dateurShortOf(e.dateTxt), (e.pinA || 0) * 0.6, Math.min(1, e.datee * 2), 13);
  }
}
const dateurShortOf = s => (s || '').split(' ').slice(0, 2).join(' ');
function drawPlayerDate(p) {
  drawStampMark(p.x + vrnd(-1.5, 1.5), p.y - 4, 64, 26, dateurShortOf(p.dateur), -0.12, 1, 14);
}
