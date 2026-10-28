'use strict';

// Le coloriage magique (itération 29) : sur toutes les pages, un dessin à colorier s'imprime près de la goutte, avec ses zones
// numérotées et trois crayons de couleur posés autour. On ramasse un crayon, puis on reste dans les zones de son numéro pour
// les colorier. Tout colorié avant que la gomme passe : le dessin prend vie (un poisson, un papillon, un soleil) et t'aide un moment.
const COLO = { first: 20, again: 60, len: 42, d0: 430, d1: 760, ring: 90, pick: 34, vivant: 14, endDur: 2.2, burst: 420, gap: 7 };
// les crayons : [nom, couleur]
const COLO_INKS = [null, ['rouge', '#e5484d'], ['jaune', '#f2bd2c'], ['bleu', '#3b82d6'], ['vert', '#47a85a']];
VOISIN_SAYS.colo = ['Waouh, il bouge !', 'Tu dépasses pas, toi !', 'Je peux colorier aussi ?', 'Il est trop beau !'];

const ovalPts = (cx, cy, rx, ry, rot = 0, n = 30) => Array.from({ length: n }, (_, i) => {
  const a = i / n * TAU, x = Math.cos(a) * rx, y = Math.sin(a) * ry;
  return [cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)];
});
const starPts = (cx, cy, r0, r1, n) => Array.from({ length: n * 2 }, (_, i) => { const a = i / (n * 2) * TAU, r = i % 2 ? r0 : r1; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
const cloudPts = (cx, cy, rx, ry) => Array.from({ length: 40 }, (_, i) => { const a = i / 40 * TAU, k = Math.sin(a) < 0 ? 1 + 0.2 * Math.abs(Math.sin(a * 3)) : 1; return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]; });
const wavePts = (x0, w, y0, y1) => {   // une algue : une bande qui ondule de haut en bas
  const L = [], R = [];
  for (let i = 0; i <= 12; i++) { const y = y1 + (y0 - y1) * i / 12, o = Math.sin(i * 0.9) * 14; L.push([x0 + o, y]); R.unshift([x0 + w + o, y]); }
  return L.concat(R);
};

// Les dessins : chaque zone a un numéro de couleur, un contour et un point d'ancrage (où l'on écrit le numéro) ; dans l'ordre du dessin
const COLORIAGES = [
  { name: 'le poisson', kind: 'poisson', zones: [
    { col: 4, pts: wavePts(-196, 58, -40, 130), at: [-168, 70] },
    { col: 2, pts: [[95, 0], [188, -88], [188, 88]], at: [152, 0] },
    { col: 2, pts: [[-74, -60], [-10, -128], [52, -64]], at: [-10, -86] },
    { col: 1, pts: ovalPts(-10, 0, 125, 82), at: [-6, 24] }
  ], deco() {
    ctx.beginPath(); ctx.arc(-86, -16, 12, 0, TAU); ctx.fillStyle = '#fffdf4'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(-89, -16, 5, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.arc(-118, 12, 12, -0.2, 1.2); ctx.stroke();
    for (const [x, y] of [[20, -30], [50, 0], [20, 30], [80, -20], [80, 20]]) { ctx.beginPath(); ctx.arc(x, y, 14, -1.2, 1.2); ctx.stroke(); }
    for (const [x, y, r] of [[-160, -88, 10], [-180, -120, 7], [-150, -140, 5]]) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); }
  } },
  { name: 'le papillon', kind: 'papillon', zones: [
    { col: 3, pts: ovalPts(-84, -52, 88, 62, -0.5), at: [-70, -72] },
    { col: 3, pts: ovalPts(84, -52, 88, 62, 0.5), at: [70, -72] },
    { col: 2, pts: ovalPts(-62, 66, 62, 48, 0.5), at: [-72, 74] },
    { col: 2, pts: ovalPts(62, 66, 62, 48, -0.5), at: [72, 74] },
    { col: 1, pts: ovalPts(0, 4, 24, 102), at: [0, 18] }
  ], deco() {
    ctx.beginPath(); ctx.moveTo(-6, -98); ctx.quadraticCurveTo(-30, -150, -54, -150); ctx.moveTo(6, -98); ctx.quadraticCurveTo(30, -150, 54, -150); ctx.stroke();
    for (const s of [-1, 1]) { ctx.beginPath(); ctx.arc(54 * s, -150, 6, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(128 * s, -34, 13, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(80 * s, 74, 10, 0, TAU); ctx.stroke(); }
    for (let y = -60; y <= 80; y += 22) { ctx.beginPath(); ctx.moveTo(-20, y); ctx.quadraticCurveTo(0, y + 8, 20, y); ctx.stroke(); }
  } },
  { name: 'le soleil', kind: 'soleil', zones: [
    { col: 1, pts: starPts(-40, -10, 115, 172, 9), at: [-40 + 95, -10] },
    { col: 2, pts: ovalPts(-40, -10, 74, 74), at: [-40, 22] },
    { col: 3, pts: cloudPts(108, 104, 108, 50), at: [108, 112] }
  ], deco() {
    ctx.beginPath(); ctx.arc(-64, -34, 7, 0, TAU); ctx.arc(-16, -34, 7, 0, TAU); ctx.fillStyle = C.graphite; ctx.fill();
    ctx.beginPath(); ctx.arc(-40, -8, 28, 0.3, Math.PI - 0.3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(40, 112); ctx.quadraticCurveTo(108, 126, 176, 112); ctx.stroke();
  } }
];
const polyArea = pts => { let s = 0; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) s += (pts[j][0] + pts[i][0]) * (pts[j][1] - pts[i][1]); return Math.abs(s / 2); };
function inPoly(x, y, pts) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
const coloHash = i => ((Math.imul(i + 1, 2654435761) >>> 0) % 1000) / 1000;

function startColo(n) {
  const p = G.p, D = COLORIAGES[(n === undefined ? G.coloN : n) % COLORIAGES.length];
  G.coloN = (n === undefined ? G.coloN : n) + 1;
  let x = WORLD.w / 2, y = WORLD.h / 2;
  for (let i = 0; i < 30; i++) {
    const a = rnd(TAU), d = rnd(COLO.d0, COLO.d1);
    x = clamp(p.x + Math.cos(a) * d, 340, WORLD.w - 340); y = clamp(p.y + Math.sin(a) * d, 300, WORLD.h - 300);
    if (Math.hypot(x - p.x, y - p.y) > COLO.d0 * 0.75) break;
  }
  const zones = D.zones.map(z => {
    const pts = z.pts.map(([px, py]) => [x + px, y + py]), xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
    return { col: z.col, pts, ax: x + z.at[0], ay: y + z.at[1], fill: 0, time: clamp(polyArea(z.pts) / 15000, 0.7, 1.8), x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys) };
  });
  const cols = [...new Set(zones.map(z => z.col))], off = rnd(TAU);
  const crayons = cols.map((col, i) => { const a = off + i / cols.length * TAU; return { col, x: clamp(x + Math.cos(a) * (COLO.ring + 230), 60, WORLD.w - 60), y: clamp(y + Math.sin(a) * (COLO.ring + 200), 60, WORLD.h - 60), rot: a + 0.8 }; });
  G.colo = { D, x, y, zones, crayons, cols, held: G.colo ? G.colo.held : 0, t: 0, end: false, endT: 0, win: false, hintCd: 0, done: 0, tgt: null };
  AU.play('coloNew');
  if (!G.coloSeen) { G.coloSeen = true; caption('Un coloriage magique s’imprime sur la page !', 3.2, 'green'); caption('Prends un crayon, puis colorie les zones de son numéro.', 3.6, 'green'); }
  else caption('Un nouveau coloriage : ' + D.name + ' !', 2.4, 'green');
}
const coloZoneAt = (C0, x, y) => { for (let i = C0.zones.length - 1; i >= 0; i--) { const z = C0.zones[i]; if (x > z.x0 && x < z.x1 && y > z.y0 && y < z.y1 && inPoly(x, y, z.pts)) return z; } return null; };

function stepColo(dt) {
  stepVivants(dt);
  for (const f of G.coloFx) f.t += dt;
  G.coloFx = G.coloFx.filter(f => f.t < f.dur);
  const K = G.colo;
  if (!K) { if (G.t >= G.nextColo) { if (G.boss) G.nextColo = G.t + 8; else startColo(); } return; }
  if (K.end) { K.endT += dt; if (K.endT >= COLO.endDur) G.colo = null; return; }
  K.t += dt; K.hintCd -= dt;
  const p = G.p;
  for (const c of K.crayons) if (c.col !== K.held && (c.x - p.x) ** 2 + (c.y - p.y) ** 2 < (COLO.pick + p.r) ** 2) {
    K.held = c.col; AU.play('coloPick', c.col);
    addText(c.x, c.y - 30, 'crayon ' + COLO_INKS[c.col][0], COLO_INKS[c.col][1], 26);
  }
  const z = coloZoneAt(K, p.x, p.y);
  if (z && z.fill < 1) {
    if (z.col === K.held) {
      z.fill = Math.min(1, z.fill + dt / z.time);
      AU.play('coloScrib');
      if (rand() < dt * 14) G.parts.push({ x: p.x + rnd(-14, 14), y: p.y + rnd(-14, 14), vx: rnd(-40, 40), vy: rnd(-40, 40), life: 0.5, max: 0.5, size: rnd(2, 4), color: COLO_INKS[z.col][1], drag: 3 });
      if (z.fill >= 1) {
        K.done++; AU.play('coloZone', K.done);
        addText(z.ax, z.ay - 20, K.done + ' / ' + K.zones.length, COLO_INKS[z.col][1], 30);
      }
    } else if (K.hintCd <= 0) {
      K.hintCd = 1.4;
      addText(p.x, p.y - 42, 'ici, il faut du ' + COLO_INKS[z.col][0] + ' !', COLO_INKS[z.col][1], 24);
    }
  }
  if (K.done >= K.zones.length) coloAlive(K);
  else if (K.t >= COLO.len) { K.end = true; K.endT = 0; G.nextColo = G.t + COLO.again; AU.play('ctrlBad'); caption('La gomme passe : le coloriage s’efface…', 2.4, 'pink'); }
}

// Tout est colorié : le dessin reste sur la page, et il prend vie
function coloAlive(K) {
  const p = G.p;
  K.end = true; K.win = true; K.endT = 0; G.nextColo = G.t + COLO.again;
  G.coloriages = (G.coloriages || 0) + 1;
  const heart = G.coloriages % 2 === 0;   // un cœur tous les deux coloriages
  G.score += 500; G.xp += 14; if (heart) p.hp = Math.min(p.maxHp, p.hp + 1);
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('coloAlive'); G.cam.shake = Math.max(G.cam.shake, 10);
  caption(K.D.name[0].toUpperCase() + K.D.name.slice(1) + ' prend vie' + (heart ? ', et te rend un cœur !' : ' !'), 2.8, 'green');
  voisinSay('colo');
  query(K.x, K.y, COLO.burst + 60, tmpA);
  for (const e of tmpA) {
    const dx = e.x - K.x, dy = e.y - K.y, d = Math.hypot(dx, dy) || 1;
    if (e.dead || d > COLO.burst + e.r) continue;
    hurtEnemy(e, (e.isBoss ? 60 : 20) * G.S.dmg, 'colo');
    if (!e.isBoss) { e.vx += dx / d * 380; e.vy += dy / d * 380; }
  }
  G.coloFx.push({ x: K.x, y: K.y, t: 0, dur: 1.2, ring: true, cols: K.cols });
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.lineJoin = 'round';   // le dessin colorié reste imprimé sur la page
  for (const z of K.zones) { coloPath(z.pts, sctx); sctx.globalAlpha = 0.3; sctx.fillStyle = COLO_INKS[z.col][1]; sctx.fill(); sctx.globalAlpha = 0.25; sctx.strokeStyle = C.graphite; sctx.lineWidth = 3; sctx.stroke(); }
  sctx.restore();
  for (let i = 0; i < 40; i++) { const a = rnd(TAU), s = rnd(160, 520), z = K.zones[i % K.zones.length]; G.parts.push({ x: z.ax, y: z.ay, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.9, max: 0.9, size: rnd(3, 6), color: COLO_INKS[z.col][1], drag: 3 }); }
  G.vivants.push({ kind: K.D.kind, t: 0, x: K.x, y: K.y, a: rnd(TAU), cd: 0.6, face: 1 });
}
function coloPath(pts, g = ctx) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }

// Les dessins vivants : le poisson nage autour de toi et mord, le papillon sème son pollen, le soleil lance ses rayons
function stepVivants(dt) {
  const p = G.p;
  for (const V of G.vivants) {
    V.t += dt; V.cd -= dt;
    let tx, ty, sp;
    if (V.kind === 'poisson') { V.a += dt * 2.3; tx = p.x + Math.cos(V.a) * 150; ty = p.y + Math.sin(V.a) * 120; sp = 6; }
    else if (V.kind === 'papillon') { V.a += dt * 1.4; tx = p.x + Math.cos(V.a) * 110 + Math.sin(V.t * 5) * 30; ty = p.y + Math.sin(V.a * 2) * 70 - 60; sp = 4; }
    else { tx = p.x; ty = p.y - 170; sp = 3; }
    const ox = V.x;
    V.x += (tx - V.x) * Math.min(1, dt * sp); V.y += (ty - V.y) * Math.min(1, dt * sp);
    if (Math.abs(V.x - ox) > 0.5) V.face = V.x > ox ? 1 : -1;
    if (V.kind === 'poisson') {
      query(V.x, V.y, 90, tmpA);
      for (const e of tmpA) if (!e.dead && !e.ghost && (e.coloCd || 0) <= G.t && (e.x - V.x) ** 2 + (e.y - V.y) ** 2 < (e.r + 44) ** 2) {
        e.coloCd = G.t + 0.25; vivantHurt(e, 16);
        if (!e.isBoss) { e.vx += (e.x - V.x) * 4; e.vy += (e.y - V.y) * 4; }
      }
      if (rand() < dt * 3) G.parts.push({ x: V.x, y: V.y - 10, vx: rnd(-10, 10), vy: -40, life: 0.8, max: 0.8, size: rnd(2, 4), color: C.inkLight, drag: 1 });
    } else if (V.cd <= 0 && V.kind === 'papillon') {
      V.cd = 0.7;
      query(V.x, V.y, 460, tmpA);
      const near = tmpA.filter(e => !e.dead && !e.ghost && (e.x - V.x) ** 2 + (e.y - V.y) ** 2 < 460 * 460).sort((a, b) => ((a.x - V.x) ** 2 + (a.y - V.y) ** 2) - ((b.x - V.x) ** 2 + (b.y - V.y) ** 2)).slice(0, 3);
      for (const e of near) { G.coloFx.push({ x: V.x, y: V.y, ex: e.x, ey: e.y, t: 0, dur: 0.35, pollen: true }); vivantHurt(e, 10); }
      if (near.length) AU.play('coloPollen');
    } else if (V.cd <= 0 && V.kind === 'soleil') {
      V.cd = 1.6;
      query(V.x, V.y, 380, tmpA);
      for (const e of tmpA) if (!e.dead && !e.ghost && (e.x - V.x) ** 2 + (e.y - V.y) ** 2 < (360 + e.r) ** 2) vivantHurt(e, 16);
      G.coloFx.push({ x: V.x, y: V.y, t: 0, dur: 0.7, sun: true });
      AU.play('coloSun');
    }
  }
  G.vivants = G.vivants.filter(V => V.t < COLO.vivant);
}
function vivantHurt(e, dmg) {
  hurtEnemy(e, dmg * G.S.dmg, 'colo');
  if (e.dead) G.coloKills = (G.coloKills || 0) + 1;
}

// Le pilote : le crayon le plus proche parmi ceux qui servent encore, puis les zones de sa couleur, une à une (sans changer d'avis en route)
function coloTarget() {
  const K = G.colo; if (!K || K.end) return null;
  const p = G.p, d2 = (x, y) => (x - p.x) ** 2 + (y - p.y) ** 2, left = col => K.zones.some(z => z.fill < 1 && z.col === col);
  if (left(K.held)) {
    if (!K.tz || K.tz.fill >= 1 || K.tz.col !== K.held) { K.tz = null; let bd = 1e12; for (const z of K.zones) if (z.fill < 1 && z.col === K.held && d2(z.ax, z.ay) < bd) { bd = d2(z.ax, z.ay); K.tz = z; } }
    K.tgt = { x: K.tz.ax, y: K.tz.ay };
  } else {
    if (!K.want || !left(K.want.col)) { K.want = null; let bd = 1e12; for (const c of K.crayons) if (left(c.col) && d2(c.x, c.y) < bd) { bd = d2(c.x, c.y); K.want = c; } }
    K.tgt = K.want ? { x: K.want.x, y: K.want.y } : null;
  }
  return K.tgt;
}

const coloGoing = () => !!(G.colo && !G.colo.end && G.colo.tgt && (G.colo.tgt.x - G.p.x) ** 2 + (G.colo.tgt.y - G.p.y) ** 2 < 340 * 340);

/* ----- dessin ----- */
function drawCrayon(col, a = 1) {   // un crayon de couleur couché : le bois hexagonal, la mine taillée, la gomme du bout
  const ink = COLO_INKS[col][1];
  ctx.globalAlpha = a; ctx.lineJoin = 'round';
  ctx.fillStyle = 'rgba(46,46,51,0.15)'; ctx.fillRect(-34, 8, 62, 6);
  ctx.fillStyle = ink; ctx.strokeStyle = 'rgba(46,46,51,0.7)'; ctx.lineWidth = 1.6;
  ctx.fillRect(-36, -7, 54, 14); ctx.strokeRect(-36, -7, 54, 14);
  ctx.fillStyle = 'rgba(255,255,255,0.3)'; ctx.fillRect(-36, -5, 54, 3);
  ctx.fillStyle = '#ecd2a6'; ctx.beginPath(); ctx.moveTo(18, -7); ctx.lineTo(36, 0); ctx.lineTo(18, 7); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = ink; ctx.beginPath(); ctx.moveTo(29, -3); ctx.lineTo(36, 0); ctx.lineTo(29, 3); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#c9ced8'; ctx.fillRect(-42, -7, 6, 14); ctx.strokeRect(-42, -7, 6, 14);
  ctx.globalAlpha = 1;
}
function drawColoriage(v) {
  for (const f of G.coloFx) {
    const q = f.t / f.dur;
    ctx.save();
    if (f.ring) { f.cols.forEach((c, i) => { ctx.globalAlpha = 1 - q; ctx.strokeStyle = COLO_INKS[c][1]; ctx.lineWidth = 8 * (1 - q) + 2; ctx.beginPath(); ctx.arc(f.x, f.y, COLO.burst * ease(q) * (1 - i * 0.08), 0, TAU); ctx.stroke(); }); }
    ctx.restore();
  }
  const K = G.colo; if (!K) return;
  if (K.x + 260 < v.x0 || K.x - 260 > v.x1 || K.y + 280 < v.y0 || K.y - 260 > v.y1) { drawColoCrayons(K, v); return; }
  const a = K.end ? clamp(1 - (K.endT - 1.2) / 1, 0, 1) : Math.min(1, K.t * 2);
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(255,253,244,0.75)'; ctx.strokeStyle = 'rgba(46,46,51,0.35)'; ctx.lineWidth = 2;   // la feuille de coloriage, un peu de travers
  ctx.save(); ctx.translate(K.x, K.y); ctx.rotate(-0.015); ctx.fillRect(-240, -200, 480, 400); ctx.setLineDash([6, 6]); ctx.strokeRect(-232, -192, 464, 384); ctx.setLineDash([]); ctx.restore();
  for (const z of K.zones) {
    if (z.fill <= 0) continue;
    const ink = COLO_INKS[z.col][1];
    ctx.save(); coloPath(z.pts); ctx.clip();
    if (z.fill >= 1) { ctx.globalAlpha = a * 0.55; ctx.fillStyle = ink; ctx.fill(); }
    ctx.globalAlpha = a * 0.85; ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.lineCap = 'round';
    ctx.beginPath();
    const span = (z.x1 - z.x0) + (z.y1 - z.y0);
    for (let i = 0, n = Math.ceil(span / COLO.gap); i < n; i++) {   // des traits de crayon en biais, dans le désordre, comme quand on colorie vite
      if (coloHash(i) >= z.fill) continue;
      const o = i * COLO.gap, w = Math.sin(i * 1.7) * 3;
      ctx.moveTo(z.x0 + o + w, z.y0 - 4); ctx.lineTo(z.x0 + o - (z.y1 - z.y0) - w, z.y1 + 4);
    }
    ctx.stroke(); ctx.restore();
  }
  ctx.strokeStyle = C.graphite; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.globalAlpha = a;
  for (const z of K.zones) { coloPath(z.pts); ctx.stroke(); }
  ctx.save(); ctx.translate(K.x, K.y); ctx.lineWidth = 2.5; K.D.deco(); ctx.restore();
  ctx.restore();
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  for (const z of K.zones) if (z.fill < 1) {   // les numéros, entourés ; celui du crayon en main est surligné
    const hl = z.col === K.held && !K.end, r = 15;
    ctx.save(); ctx.globalAlpha = a * (1 - z.fill * 0.6);
    if (hl) { ctx.fillStyle = C.hl; ctx.beginPath(); ctx.arc(z.ax, z.ay, r + 4 + Math.sin(G.time * 6) * 2, 0, TAU); ctx.fill(); }
    ctx.fillStyle = '#fffdf4'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(z.ax, z.ay, r, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.font = '700 22px ' + FONT_MAIN; ctx.fillStyle = C.graphite; ctx.fillText(String(z.col), z.ax, z.ay + 1);
    if (z.fill > 0) { ctx.strokeStyle = COLO_INKS[z.col][1]; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(z.ax, z.ay, r + 5, -Math.PI / 2, -Math.PI / 2 + z.fill * TAU); ctx.stroke(); }
    ctx.restore();
  }
  txt('Coloriage magique : ' + K.D.name, K.x, K.y - 222, 30, { color: C.graphite, alpha: a, hl: K.win ? C.hlGold : undefined });
  K.cols.forEach((c, i) => {   // la légende : chaque numéro et sa couleur
    const lx = K.x + (i - (K.cols.length - 1) / 2) * 120, ly = K.y + 222;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = COLO_INKS[c][1]; ctx.fillRect(lx - 48, ly - 11, 22, 22); ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.5; ctx.strokeRect(lx - 48, ly - 11, 22, 22); ctx.restore();
    txt(c + ' = ' + COLO_INKS[c][0], lx + 12, ly, 24, { color: C.graphite, alpha: a, hl: c === K.held && !K.end ? C.hl : undefined });
  });
  if (!K.end) {   // le temps qui reste avant la gomme
    const k = clamp(1 - K.t / COLO.len, 0, 1);
    ctx.save(); ctx.globalAlpha = a * 0.7; ctx.fillStyle = k < 0.3 ? C.red : C.pencil; ctx.fillRect(K.x - 200, K.y + 246, 400 * k, 5); ctx.restore();
  } else if (K.win) txt('colorié !', K.x, K.y - 262 - K.endT * 20, 40, { font: FONT_CURSIVE, weight: 400, color: C.red, alpha: a });
  drawColoCrayons(K, v);
}
function drawColoCrayons(K, v) {
  if (K.end) return;
  for (const c of K.crayons) {
    if (c.x < v.x0 - 60 || c.x > v.x1 + 60 || c.y < v.y0 - 60 || c.y > v.y1 + 60) continue;
    const held = c.col === K.held;
    ctx.save(); ctx.translate(c.x, c.y + Math.sin(G.time * 3 + c.col) * 3); ctx.rotate(c.rot);
    drawCrayon(c.col, held ? 0.35 : 1);
    ctx.restore();
    if (!held) { ctx.save(); ctx.strokeStyle = COLO_INKS[c.col][1]; ctx.globalAlpha = 0.35 + 0.25 * Math.sin(G.time * 5 + c.col); ctx.lineWidth = 3; ctx.setLineDash([6, 6]); ctx.beginPath(); ctx.arc(c.x, c.y, 46, 0, TAU); ctx.stroke(); ctx.restore(); }
  }
}
function drawColoHeld() {   // le crayon que la goutte tient, à côté d'elle
  const K = G.colo; if (!K || K.end || !K.held || G.state !== 'play') return;
  ctx.save(); ctx.translate(G.p.x + 22, G.p.y - 18); ctx.rotate(-0.9 + Math.sin(G.time * 10) * (G.p.moving ? 0.25 : 0.05)); ctx.scale(0.6, 0.6);
  drawCrayon(K.held); ctx.restore();
}
function drawVivants() {
  for (const f of G.coloFx) {
    const q = f.t / f.dur;
    if (f.pollen) {   // une traînée de pollen doré jusqu'à la rature
      ctx.save(); ctx.globalAlpha = 1 - q; ctx.strokeStyle = '#f2bd2c'; ctx.lineWidth = 4; ctx.setLineDash([3, 7]); ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(lerp(f.x, f.ex, Math.min(1, q * 3)), lerp(f.y, f.ey, Math.min(1, q * 3))); ctx.stroke(); ctx.restore();
    } else if (f.sun) {
      ctx.save(); ctx.globalAlpha = 0.6 * (1 - q); ctx.strokeStyle = '#f2bd2c'; ctx.lineWidth = 10 * (1 - q) + 2;
      ctx.beginPath(); ctx.arc(f.x, f.y, 360 * ease(q), 0, TAU); ctx.stroke();
      ctx.strokeStyle = '#e5484d'; ctx.lineWidth = 4; ctx.beginPath();
      for (let i = 0; i < 12; i++) { const an = i / 12 * TAU, r = 360 * ease(q); ctx.moveTo(f.x + Math.cos(an) * r * 0.8, f.y + Math.sin(an) * r * 0.8); ctx.lineTo(f.x + Math.cos(an) * r, f.y + Math.sin(an) * r); }
      ctx.stroke(); ctx.restore();
    }
  }
  for (const V of G.vivants) {
    const left = COLO.vivant - V.t, a = left < 2 && Math.sin(G.time * 16) > 0 ? 0.45 : Math.min(1, V.t * 3);
    ctx.save(); ctx.translate(V.x, V.y); ctx.globalAlpha = a; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2.2; ctx.lineJoin = 'round';
    if (V.kind === 'poisson') {
      ctx.scale(-V.face * 0.42, 0.42); ctx.rotate(Math.sin(G.time * 8) * 0.08);
      const tail = Math.sin(G.time * 14) * 18;
      coloPath([[95, 0], [188, -88 + tail], [188, 88 + tail]]); ctx.fillStyle = '#f2bd2c'; ctx.fill(); ctx.stroke();
      coloPath([[-74, -60], [-10, -128], [52, -64]]); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-10, 0, 125, 82, 0, 0, TAU); ctx.fillStyle = '#e5484d'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-86, -16, 14, 0, TAU); ctx.fillStyle = '#fffdf4'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(-91, -16, 6, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(-118, 12, 14, -0.2, 1.2); ctx.stroke();
    } else if (V.kind === 'papillon') {
      const flap = 0.35 + 0.65 * Math.abs(Math.sin(G.time * 12));
      ctx.scale(0.4, 0.4);
      for (const s of [-1, 1]) {
        ctx.save(); ctx.scale(s * flap, 1);
        ctx.beginPath(); ctx.ellipse(84, -52, 88, 62, 0.5, 0, TAU); ctx.fillStyle = '#3b82d6'; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(62, 66, 62, 48, -0.5, 0, TAU); ctx.fillStyle = '#f2bd2c'; ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.arc(110, -44, 16, 0, TAU); ctx.fillStyle = '#fffdf4'; ctx.fill(); ctx.stroke();
        ctx.restore();
      }
      ctx.beginPath(); ctx.ellipse(0, 4, 24, 102, 0, 0, TAU); ctx.fillStyle = '#e5484d'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-6, -98); ctx.quadraticCurveTo(-30, -150, -54, -150); ctx.moveTo(6, -98); ctx.quadraticCurveTo(30, -150, 54, -150); ctx.stroke();
    } else {
      ctx.scale(0.45, 0.45); ctx.rotate(G.time * 0.8);
      coloPath(starPts(0, 0, 125, 188, 9)); ctx.fillStyle = '#e5484d'; ctx.fill(); ctx.stroke();
      ctx.rotate(-G.time * 0.8);
      ctx.beginPath(); ctx.arc(0, 0, 80, 0, TAU); ctx.fillStyle = '#f2bd2c'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-26, -20, 8, 0, TAU); ctx.arc(26, -20, 8, 0, TAU); ctx.fillStyle = C.graphite; ctx.fill();
      ctx.beginPath(); ctx.arc(0, 10, 32, 0.3, Math.PI - 0.3); ctx.stroke();
    }
    ctx.restore();
  }
}
function drawColoArrow() {
  if (G.state !== 'play' || !G.colo || G.colo.end) return;
  const t = coloTarget(); if (t) edgeArrow(t.x, t.y);
}
