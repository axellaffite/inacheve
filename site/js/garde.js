// Chapitre VI : la page de garde. Papier marbré, ratures de reliure (marbrure, signet, peigne, tampon) et le Cartable.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

/* ===================== La page ===================== */
const NOTES_GARDE = [
  { x: WORLD.w / 2, y: -150, t: '— chapitre VI : la page de garde —', r: -0.02 },
  { x: WORLD.w * 0.7, y: -96, t: 'ajouté : la page de garde (c’est fait, en papier marbré)', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'un deuxième cahier ?', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'au clair', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'de la lune', r: -0.05 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'prête-moi ta plume…', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: '(TODO : couvrir le cahier avant la rentrée)', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'fin ?', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'cf. ch. I, la toute première page', r: 0.05 },
  { x: WORLD.w * 0.3, y: -96, t: 'six sceaux, six pages', r: -0.02 }
];
const DICTEES_GARDE = ['FIN', 'NOM', 'GARDE', 'SIGNET', 'TAMPON', 'RELIURE', 'CARTABLE', 'MARBRURE', 'COUVERTURE', 'BIBLIOTHÈQUE'];
const GARDE_TYPES = new Set(['marbrure', 'signet', 'peigne', 'tampon']);
Object.assign(ETYPES, {
  marbrure: { r: 15, hp: 4, speed: 104, dmg: 1, xp: 1, agil: 4 },
  signet:   { r: 16, hp: 10, speed: 70, dmg: 1, xp: 3, agil: 3 },
  peigne:   { r: 22, hp: 18, speed: 60, dmg: 1, xp: 5, agil: 2.5 },
  tampon:   { r: 24, hp: 28, speed: 44, dmg: 1, xp: 6, agil: 1.6 },
  cartable: { r: 80, hp: 1300, speed: 44, dmg: 2, xp: 160, agil: 1.2, boss: true }
});

CHAPTERS.push({
  num: 'VI', name: 'La page de garde', done: 'La page de garde : le cahier est plein.', paper: 'garde', notes: NOTES_GARDE, dictees: DICTEES_GARDE,
  intro: 'Chapitre VI : la page de garde. Le cahier se souvient…', boss: 'cartable', bossName: 'Le Cartable',
  bossIntro: 'Quelque chose de lourd tombe sur la page…', bossBack: 'Le Cartable revient, encore plein.', bossSound: 'boss6',
  scale: 19, rateOff: 200, rateCap: 16, waveCap: 'Une coulée de marbrures !',
  meet: {
    marbrure: 'Nouveau : la marbrure, qui tourne en s’approchant',
    signet: 'Nouveau : le signet. Son ruban claque en ligne droite !',
    peigne: 'Nouveau : le peigne à marbrer. Ses sillons d’encre brûlent !',
    tampon: 'Nouveau : le tampon. Il saute… regarde où tombe son ombre !'
  },
  pick(t, r) {   // pas plus de trois peignes ni de trois tampons à la fois
    if (t > 90 && r < 0.07 && G.enemies.filter(e => e.type === 'tampon').length < 3) return 'tampon';
    if (t > 50 && r < 0.13 && G.enemies.filter(e => e.type === 'peigne').length < 3) return 'peigne';
    return t > 25 && r < 0.27 ? 'signet' : 'marbrure';
  },
  wave(t, i) { return t > 70 && i % 4 === 0 ? 'signet' : 'marbrure'; }
});

// Le papier marbré : de l'encre déposée goutte à goutte sur un bain, puis peignée et tournée.
// On calcule chaque pixel à rebours (gouttes, peignes, tourbillons), une seule fois, à un quart de la taille de la page.
const MARBLE_S = 4, MARBLE_COLS = [[47, 74, 138], [201, 146, 43], [176, 74, 64], [104, 140, 100], [240, 230, 205], [70, 52, 104]];
let marbleCv = null, marbleJob = null;
function marbleInit() {
  const w = Math.round(WORLD.w / MARBLE_S), h = Math.round(WORLD.h / MARBLE_S), r = mulberry32(1010), ops = [];
  for (let i = 0; i < 120; i++) ops.push({ k: 0, x: r() * w, y: r() * h, r2: (16 + r() * 26) ** 2, c: Math.floor(r() * MARBLE_COLS.length) });
  for (let i = 0; i < 9; i++) { const x = r() * w, y = r() * h; for (let j = 0; j < 4; j++) ops.push({ k: 0, x, y, r2: 10 * 10, c: (i + j * 2) % MARBLE_COLS.length }); }   // des yeux de paon
  ops.push({ k: 1, mx: 1, my: 0, nx: 0, ny: 1, s: 30, o: 7, a: 30, l: 7 });   // un peigne à l'horizontale
  ops.push({ k: 1, mx: 0, my: 1, nx: 1, ny: 0, s: 18, o: 0, a: 14, l: 5 });   // puis un peigne fin, à la verticale
  for (let i = 0; i < 4; i++) ops.push({ k: 2, x: r() * w, y: r() * h, a: (r() < 0.5 ? -1 : 1) * (1.6 + r() * 1.6), l: 40 + r() * 40 });
  const cv2 = document.createElement('canvas'); cv2.width = w; cv2.height = h;
  const g = cv2.getContext('2d'), img = g.createImageData(w, h);
  marbleJob = { ops, w, h, y: 0, cv: cv2, g, img };
}
// Calcule quelques lignes du marbre (on s'y prend dès le chapitre V, pour que la page tourne sans à-coup)
function marbleWork(rows) {
  if (marbleCv) return;
  if (!marbleJob) marbleInit();
  const J = marbleJob, ops = J.ops, w = J.w, D = J.img.data, bg = [238, 228, 204], end = Math.min(J.h, J.y + rows);
  for (let y = J.y; y < end; y++) for (let x = 0; x < w; x++) {
    let px = x + 0.5, py = y + 0.5, col = bg;
    for (let i = ops.length - 1; i >= 0; i--) {
      const o = ops[i];
      if (o.k === 0) {
        const dx = px - o.x, dy = py - o.y, d2 = dx * dx + dy * dy;
        if (d2 <= o.r2) { col = MARBLE_COLS[o.c]; break; }
        const f = Math.sqrt(1 - o.r2 / d2); px = o.x + dx * f; py = o.y + dy * f;
      } else if (o.k === 1) {
        let d = ((px * o.nx + py * o.ny - o.o) % o.s + o.s) % o.s; d = Math.min(d, o.s - d);
        const z = o.a * o.l / (d + o.l); px -= o.mx * z; py -= o.my * z;
      } else {
        const dx = px - o.x, dy = py - o.y, th = -o.a * Math.exp(-Math.sqrt(dx * dx + dy * dy) / o.l), c = Math.cos(th), s = Math.sin(th);
        px = o.x + dx * c - dy * s; py = o.y + dx * s + dy * c;
      }
    }
    const q = (y * w + x) * 4; D[q] = col[0]; D[q + 1] = col[1]; D[q + 2] = col[2]; D[q + 3] = 255;
  }
  J.y = end;
  if (J.y < J.h) return;
  blurPass(D, w, J.h, 4); blurPass(D, w, J.h, w * 4);   // on adoucit les bords des gouttes
  J.g.putImageData(J.img, 0, 0);
  marbleCv = J.cv; marbleJob = null;
}
// Un flou à trois cases, le long d'une ligne (step = 4) ou d'une colonne (step = largeur × 4)
function blurPass(D, w, h, step) {
  const n = w * h * 4, out = new Uint8ClampedArray(D);
  for (let i = 0; i < n; i++) {
    if ((i & 3) === 3) continue;
    const a = i - step, b = i + step, x = (i >> 2) % w;
    const okA = a >= 0 && (step !== 4 || x > 0), okB = b < n && (step !== 4 || x < w - 1);
    out[i] = (D[i] * 2 + (okA ? D[a] : D[i]) + (okB ? D[b] : D[i])) >> 2;
  }
  D.set(out);
}
const LABEL = { x: WORLD.w / 2, y: 300, w: 560, h: 210 };
function drawGarde(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  if (!marbleCv) marbleWork(1e9);
  ctx.save(); ctx.globalAlpha = 0.25;
  ctx.drawImage(marbleCv, x0 / MARBLE_S, y0 / MARBLE_S, (x1 - x0) / MARBLE_S, (y1 - y0) / MARBLE_S, x0, y0, x1 - x0, y1 - y0);
  ctx.restore();
  // la reliure, à gauche : le pli de la page de garde
  if (x0 < 90) { const g = ctx.createLinearGradient(0, 0, 90, 0); g.addColorStop(0, 'rgba(60,40,20,0.3)'); g.addColorStop(1, 'rgba(60,40,20,0)'); ctx.fillStyle = g; ctx.fillRect(0, y0, 90, y1 - y0); }
  // l'étiquette du cahier, collée de travers
  const L = LABEL;
  if (L.x + L.w > v.x0 && L.x - L.w < v.x1 && L.y + L.h > v.y0 && L.y - L.h < v.y1) {
    ctx.save(); ctx.translate(L.x, L.y); ctx.rotate(-0.03);
    ctx.shadowColor = 'rgba(40,30,20,0.25)'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 4;
    ctx.fillStyle = '#fbf6e8'; roundRect(-L.w / 2, -L.h / 2, L.w, L.h, 26); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = '#7a5a3a'; ctx.lineWidth = 3; ctx.stroke();
    ctx.lineWidth = 1.2; roundRect(-L.w / 2 + 10, -L.h / 2 + 10, L.w - 20, L.h - 20, 18); ctx.stroke();
    ctx.restore();
    const r = -0.03, row = (k, lab, val, yy) => {
      const c = Math.cos(r), s = Math.sin(r), lx = -L.w / 2 + 50, vx = -L.w / 2 + 210;
      txt(lab, L.x + lx * c - yy * s, L.y + lx * s + yy * c, 30, { color: '#7a5a3a', weight: 400, align: 'left', rot: r });
      txt(val, L.x + vx * c - yy * s, L.y + vx * s + yy * c, k ? 34 : 44, { color: C.pencil, weight: 400, align: 'left', rot: r, font: k ? FONT_MAIN : FONT_CURSIVE });
    };
    row(0, 'Nom :', 'Inachevé', -48); row(1, 'Classe :', 'la page d’après', 12); row(1, 'Année :', 'toujours', 64);
  }
}

/* ===================== Les ratures de reliure ===================== */
const MARB_INK = ['#2f4a8a', '#b47a1e', '#a8443a', '#4f7a4c'];
function stepGarde(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  const s = e.speed * slow;
  if (e.type === 'marbrure') {   // elle tourne en s'approchant, comme l'encre sur le bain
    const side = e.id % 2 ? 1 : -1;
    MV.x = (dx / d * 0.75 - dy / d * side * 0.7) * s; MV.y = (dy / d * 0.75 + dx / d * side * 0.7) * s;
    e.rot += dt * 4 * side;
  } else if (e.type === 'signet') {   // il vise, tend son ruban à travers la page, et le fait claquer
    e.pt -= dt; e.rot = Math.sin(G.t * 2 + e.id) * 0.25;
    if (e.phase === 'walk') {
      if (d < 220) { MV.x *= -0.4; MV.y *= -0.4; }
      if (e.pt <= 0 && d < 470 && !hid) {
        e.phase = 'aim'; e.pt = SIGNET.warn + SIGNET.act; e.aimA = Math.atan2(dy, dx);
        G.ribbons.push({ e, x: e.x, y: e.y, a: e.aimA, len: SIGNET.len, t: 0, warn: SIGNET.warn, act: SIGNET.act, hit: false, sound: false });
        AU.play('ribbonWarn');
      } else if (e.pt <= 0) e.pt = 0.5;
    } else { MV.x = 0; MV.y = 0; e.vx = 0; e.vy = 0; if (e.pt <= 0) { e.phase = 'walk'; e.pt = rnd(2.6, 3.6); } }
  } else if (e.type === 'peigne') {   // il se met en ligne, puis file droit : ses dents tracent des sillons d'encre
    e.pt -= dt;
    if (e.phase === 'walk') {
      e.rot = Math.atan2(dy, dx);
      if (e.pt <= 0 && d < 520 && !hid) { e.phase = 'aim'; e.pt = 0.75; e.aimA = Math.atan2(dy, dx); AU.play('combWarn'); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else if (e.phase === 'aim') {
      MV.x = 0; MV.y = 0; e.rot = e.aimA;
      if (e.pt <= 0) { e.phase = 'comb'; e.pt = PEIGNE.dur; e.teeth = PEIGNE.off.map(() => inkStroke(PEIGNE.life, e)); AU.play('comb'); }
    } else {
      const c = Math.cos(e.aimA), sn = Math.sin(e.aimA);
      MV.x = c * PEIGNE.speed; MV.y = sn * PEIGNE.speed; MV.agil = 30; e.rot = e.aimA;
      PEIGNE.off.forEach((o, i) => addStrokePt(e.teeth[i], e.x - sn * o - c * 14, e.y + c * o - sn * 14));
      if (e.pt <= 0) { for (const t of e.teeth) t.done = true; e.teeth = null; e.phase = 'walk'; e.pt = rnd(2.8, 3.8); }
    }
  } else if (e.type === 'tampon') {   // il saute, et retombe là où tu allais : « VU ! »
    e.pt -= dt;
    if (e.phase === 'walk') {
      e.rot = Math.sin(G.t * 3 + e.id) * 0.1;
      if (e.pt <= 0 && d < 600 && !hid) {
        const p = G.p;
        e.phase = 'jump'; e.pt = TAMPON.air; e.ghost = true; e.jx0 = e.x; e.jy0 = e.y;
        e.jx = clamp(p.x + p.vx * 0.5, 40, WORLD.w - 40); e.jy = clamp(p.y + p.vy * 0.5, 40, WORLD.h - 40);
        AU.play('stampJump');
      } else if (e.pt <= 0) e.pt = 0.5;
    } else {
      const k = clamp(1 - e.pt / TAMPON.air, 0, 1);
      MV.x = 0; MV.y = 0; e.vx = 0; e.vy = 0;
      e.x = lerp(e.jx0, e.jx, ease(k)); e.y = lerp(e.jy0, e.jy, ease(k)); e.h = Math.sin(k * Math.PI) * 130;
      if (e.pt <= 0) { e.ghost = false; e.h = 0; e.phase = 'walk'; e.pt = rnd(2.2, 3.2); stampLand(e, TAMPON.R, 1, 8); }
    }
  }
}
const SIGNET = { warn: 0.85, act: 0.35, len: 540 };
const PEIGNE = { dur: 1.05, speed: 400, life: 2.1, off: [-27, -9, 9, 27] };
const TAMPON = { air: 1.0, R: 66 };
// Un tampon (ou le Cartable) retombe : on est touché dessous, la page garde la marque, et des éclats partent en couronne
function stampLand(e, R, dmg, n) {
  const p = G.p;
  if ((p.x - e.x) ** 2 + (p.y - e.y) ** 2 < (R + p.r) ** 2) hurtPlayer(dmg, e.x, e.y);
  const off = rnd(TAU);
  for (let i = 0; i < n; i++) { const a = off + i / n * TAU; G.ebul.push({ x: e.x + Math.cos(a) * (R * 0.5), y: e.y + Math.sin(a) * (R * 0.5), vx: Math.cos(a) * 170, vy: Math.sin(a) * 170, life: 3.5, a }); }
  sctx.save(); sctx.scale(STAIN_S, STAIN_S); sctx.translate(e.x, e.y); sctx.rotate(rnd(-0.3, 0.3)); sctx.globalAlpha = 0.22;
  sctx.strokeStyle = C.red; sctx.lineWidth = 4; sctx.strokeRect(-R * 0.7, -R * 0.42, R * 1.4, R * 0.84);
  sctx.fillStyle = C.red; sctx.font = '700 ' + Math.round(R * 0.55) + 'px ' + FONT_MAIN; sctx.textAlign = 'center'; sctx.textBaseline = 'middle';
  sctx.fillText(e.isBoss ? 'À REFAIRE' : 'VU', 0, 2); sctx.restore();
  G.cam.shake = Math.max(G.cam.shake, e.isBoss ? 16 : 5);
  AU.play(e.isBoss ? 'slam' : 'stampLand');
  for (let i = 0; i < 14; i++) { const a = rnd(TAU), sp = rnd(80, 260); G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.5, max: 0.5, size: rnd(2, 4), color: i % 2 ? C.red : C.graphite, drag: 4 }); }
}

/* ===================== Le Cartable ===================== */
const CARTABLE = { air: 1.5, R: 115, wave: 440 };
function stepCartable(e, dt, dx, dy, d, slow) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  if (e.enter > 0) e.enter = Math.max(0, e.enter - dt * 0.5);
  const enraged = e.hp < e.maxHp / 2, p = G.p;
  e.pt -= dt; e.open = Math.max(0, (e.open || 0) - dt * 2);
  if (e.phase === 'trousse') {   // il ouvre son rabat et lance le contenu de sa trousse
    MV.x = 0; MV.y = 0; e.open = 1;
    if (e.pt <= 0) {
      const a0 = Math.atan2(dy, dx);
      for (let i = 0; i < 7; i++) { const a = a0 + (i - 3) * 0.15; G.ebul.push({ x: e.x + Math.cos(a) * 70, y: e.y - 30 + Math.sin(a) * 70, vx: Math.cos(a) * 290, vy: Math.sin(a) * 290, life: 4, a, crayon: true, col: (i + e.vol) % CRAYONS.length }); }
      AU.play('trousse'); e.vol--; e.pt = 0.45;
      if (e.vol <= 0) { e.phase = 'walk'; e.atk = enraged ? 1.3 : 1.8; }
    }
    return;
  }
  if (e.phase === 'sweep') { MV.x = 0; MV.y = 0; if (e.pt <= 0) { e.phase = 'walk'; e.atk = enraged ? 1.2 : 1.6; } return; }
  if (e.phase === 'jump') {   // il saute au-dessus de la page ; son ombre te suit, puis s'arrête… et il retombe
    MV.x = 0; MV.y = 0; e.vx = 0; e.vy = 0;
    const k = clamp(1 - e.pt / CARTABLE.air, 0, 1);
    if (k < 0.7) { const f = 1 - Math.exp(-dt * 3); e.jx = lerp(e.jx, clamp(p.x, 90, WORLD.w - 90), f); e.jy = lerp(e.jy, clamp(p.y, 90, WORLD.h - 90), f); }
    const f2 = 1 - Math.exp(-dt * 5); e.x = lerp(e.x, e.jx, f2); e.y = lerp(e.y, e.jy, f2);
    e.h = Math.sin(k * Math.PI) * 260;
    if (e.pt <= 0) {
      e.x = e.jx; e.y = e.jy; e.h = 0; e.ghost = false;
      stampLand(e, CARTABLE.R, 2, enraged ? 14 : 10);
      G.waves.push({ x: e.x, y: e.y, t: 0, dur: 1.0, r: CARTABLE.wave, hit: false });
      if (enraged && !e.again) { e.again = true; cartableJump(e); }
      else { e.again = false; e.phase = 'walk'; e.atk = enraged ? 1.4 : 1.9; }
    }
    return;
  }
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % (enraged ? 4 : 3);
  if (m === 1) { e.phase = 'trousse'; e.vol = enraged ? 4 : 3; e.pt = 0.5; AU.play('flap'); }
  else if (m === 2) strapSweep(e, enraged ? 2 : 1, dx, dy);
  else if (m === 0 && !enraged || m === 3) cartableJump(e);
  else {   // colère : il se vide sur la page
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + G.t; spawnEnemy(i % 3 === 0 ? 'tampon' : 'marbrure', e.x + Math.cos(a) * 170, e.y + Math.sin(a) * 170); }
    caption('Le Cartable se vide sur la page !', 1.8, 'pink'); AU.play('flap'); e.open = 1; e.atk = 2;
  }
}
function cartableJump(e) {
  e.phase = 'jump'; e.pt = CARTABLE.air; e.ghost = true; e.jx = e.x; e.jy = e.y;
  AU.play('lift');
  if (!G.jumpSeen) { G.jumpSeen = true; caption('Il saute : sors de son ombre !', 2.4, 'pink'); }
}
// Ses deux bretelles balaient la page (comme les tentacules de la Pieuvre-Buvard, mais en cuir)
function strapSweep(e, n, dx, dy) {
  const aim = Math.atan2(dy, dx), dir = rand() < 0.5 ? 1 : -1;
  for (let i = 0; i < n; i++) {
    const c = aim + i * Math.PI;
    G.tents.push({ e, x: e.x, y: e.y, a0: c - dir * 1.1, a1: c + dir * 1.1, a: c - dir * 1.1, t: 0, warn: 1.0, dur: 0.9, len: 390, hit: false, sound: false, strap: true });
  }
  e.phase = 'sweep'; e.pt = 1.9;
  AU.play('armWarn');
}

/* ===================== Effets : rubans des signets ===================== */
function stepGardeFx(dt) {
  if (!G.ribbons.length) return;
  const p = G.p;
  for (const rb of G.ribbons) {
    const was = rb.t < rb.warn; rb.t += dt;
    if (rb.e.dead && rb.t < rb.warn) { rb.t = 99; continue; }
    if (was && rb.t >= rb.warn) { rb.sound = true; AU.play('ribbonSnap'); }
    if (!rb.hit && rb.t >= rb.warn && rb.t < rb.warn + rb.act && p.inv <= 0 && p.dashT <= 0) {
      if (segDist(p.x, p.y, rb.x, rb.y, rb.x + Math.cos(rb.a) * rb.len, rb.y + Math.sin(rb.a) * rb.len) < p.r + 8) { rb.hit = true; hurtPlayer(1, rb.x, rb.y); }
    }
  }
  G.ribbons = G.ribbons.filter(rb => rb.t < rb.warn + rb.act + 0.3);
}
// Pour le pilote automatique : rubans tendus et ombres des tampons
function gardeDanger(x, y) {
  let s = 0;
  for (const rb of G.ribbons) {
    if (rb.t > rb.warn + rb.act) continue;
    const d = segDist(x, y, rb.x, rb.y, rb.x + Math.cos(rb.a) * rb.len, rb.y + Math.sin(rb.a) * rb.len);
    if (d < 60) s += 3 + (60 - d) * 0.1;
  }
  for (const e of G.enemies) {
    if (e.phase !== 'jump') continue;
    const R = (e.isBoss ? CARTABLE.R : TAMPON.R) + 40, d = Math.hypot(x - e.jx, y - e.jy);
    if (d < R) s += (e.isBoss ? 6 : 3) + (R - d) * 0.08;
  }
  return s;
}

/* ===================== Dessin ===================== */
const CRAYONS = ['#c8424a', '#2f6fbf', '#3f8f4a', '#e0a020', '#8a4fb0'];
const LEATHER = '#8a5232', LEATHER_D = '#5e341c', LEATHER_FL = '#d99a7a';
function drawGardeEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const j = (fr - 1) * 0.8;
  if (e.type === 'marbrure') {   // une goutte de couleur, et la spirale qu'elle dessine en tournant
    const col = MARB_INK[e.id % MARB_INK.length];
    ctx.rotate(e.rot);
    ctx.fillStyle = fl ? C.red : col; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.arc(0, 0, 15 + j, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
    ctx.strokeStyle = 'rgba(250,244,226,0.9)'; ctx.lineWidth = 2.5; ctx.beginPath();
    for (let i = 0; i <= 24; i++) { const t = i / 24, a = t * 4 * Math.PI, r = 1 + t * 12; i ? ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r) : ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    ctx.stroke();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 0, 15 + j, 0, TAU); ctx.stroke();
  } else if (e.type === 'signet') {   // un ruban de soie rouge, avec sa queue d'aronde
    ctx.rotate(e.rot);
    const w = 10, L = 34, sway = Math.sin(G.time * 5 + e.id) * 5;
    ctx.fillStyle = fl ? '#ff9aa0' : '#b8323c'; ctx.strokeStyle = '#7a1e26'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-w, -L / 2); ctx.lineTo(w, -L / 2); ctx.quadraticCurveTo(w + sway * 0.4, 0, w + sway, L / 2 + j); ctx.lineTo(sway, L / 2 - 8); ctx.lineTo(-w + sway, L / 2 - j); ctx.quadraticCurveTo(-w + sway * 0.4, 0, -w, -L / 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-3, -L / 2 + 3); ctx.quadraticCurveTo(-3 + sway * 0.3, 0, -3 + sway * 0.8, L / 2 - 8); ctx.stroke();
    for (const s of [-4, 4]) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(s, -L / 2 + 8, 3.4, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s, -L / 2 + 9, 1.7, 0, TAU); ctx.fill(); }
  } else if (e.type === 'peigne') {   // un peigne à marbrer : un dos de bois et des dents de laiton
    if (e.phase === 'aim') {
      ctx.save(); ctx.rotate(e.aimA); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 26); ctx.setLineDash([10, 8]); ctx.lineWidth = 2;
      ctx.beginPath(); for (const o of PEIGNE.off) { ctx.moveTo(0, o); ctx.lineTo(PEIGNE.speed * PEIGNE.dur, o); } ctx.stroke(); ctx.restore();
    }
    ctx.rotate(e.rot);
    ctx.fillStyle = fl ? '#ffd6c0' : C.wood; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    roundRect(-6, -36, 14, 72, 4); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#a8862a'; ctx.lineWidth = 3;
    ctx.beginPath(); for (let k = -4; k <= 4; k++) { const y = k * 8; ctx.moveTo(8, y); ctx.lineTo(24 + (k % 2 ? 0 : 3) + j, y); } ctx.stroke();
    for (const s of [-8, 8]) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(1, s, 3.2, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(2, s, 1.6, 0, TAU); ctx.fill(); }
  } else if (e.type === 'tampon') {   // un tampon encreur : un manche rond, un socle, et « VU » à l'envers dessous
    const h = e.h || 0;
    ctx.fillStyle = 'rgba(46,46,51,' + (0.18 - h / 1400) + ')'; ctx.beginPath(); ctx.ellipse(0, 18, 26 - h / 12, 9 - h / 40, 0, 0, TAU); ctx.fill();
    ctx.translate(0, -h); ctx.rotate(e.rot);
    ctx.fillStyle = fl ? '#ffd6d6' : '#d9c3a0'; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2;
    roundRect(-24, 2, 48, 16, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.red; ctx.fillRect(-22, 15, 44, 5);
    ctx.fillStyle = fl ? '#ffd6d6' : C.wood; ctx.beginPath(); ctx.moveTo(-8, 2); ctx.lineTo(-6, -14); ctx.lineTo(6, -14); ctx.lineTo(8, 2); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -20 + j, 10, 0, TAU); ctx.fill(); ctx.stroke();
    for (const s of [-9, 9]) { ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(s, 9, 3, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s, 9.5, 1.5, 0, TAU); ctx.fill(); }
  }
}
function drawCartable(e, fr, fl) {
  const enraged = e.hp < e.maxHp / 2, h = e.h || 0, j = (fr - 1) * 1.2, open = e.open || 0;
  ctx.fillStyle = 'rgba(46,46,51,' + Math.max(0.06, 0.22 - h / 1600) + ')'; ctx.beginPath(); ctx.ellipse(0, 70, 110 - h / 8, 30 - h / 30, 0, 0, TAU); ctx.fill();
  ctx.save(); ctx.translate(0, -h); ctx.rotate(Math.sin(G.time * (enraged ? 5 : 2.5)) * 0.04);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  // la poignée et le corps
  ctx.strokeStyle = LEATHER_D; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(-34, -72); ctx.quadraticCurveTo(0, -116 - j, 34, -72); ctx.stroke();
  ctx.fillStyle = fl ? LEATHER_FL : LEATHER; ctx.strokeStyle = LEATHER_D; ctx.lineWidth = 4;
  roundRect(-100, -74, 200, 148, 18); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = 'rgba(255,230,200,0.35)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 5]); roundRect(-90, -64, 180, 128, 12); ctx.stroke(); ctx.setLineDash([]);
  // la trousse qui dépasse quand le rabat s'ouvre
  if (open > 0) { CRAYONS.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(-46 + i * 20, -74 - open * 28, 12, 30); ctx.fillStyle = '#f2d9a8'; ctx.beginPath(); ctx.moveTo(-46 + i * 20, -74 - open * 28); ctx.lineTo(-40 + i * 20, -86 - open * 28); ctx.lineTo(-34 + i * 20, -74 - open * 28); ctx.fill(); }); }
  // le rabat
  ctx.save(); ctx.translate(0, -74); ctx.scale(1, 1 - open * 0.55);
  ctx.fillStyle = fl ? LEATHER_FL : enraged ? '#7a3a24' : '#744026'; ctx.strokeStyle = LEATHER_D; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-102, 0); ctx.lineTo(102, 0); ctx.lineTo(102, 70); ctx.quadraticCurveTo(102, 92, 80, 92); ctx.lineTo(-80, 92); ctx.quadraticCurveTo(-102, 92, -102, 70); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
  // deux boucles dorées : ses yeux
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x), ex = Math.cos(la) * 5, ey = Math.sin(la) * 5, by = -74 + 92 * (1 - open * 0.55) - 6;
  for (const sx of [-52, 52]) {
    ctx.strokeStyle = LEATHER_D; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(sx, by - 30); ctx.lineTo(sx, by + 34); ctx.stroke();
    ctx.fillStyle = C.paper; ctx.strokeStyle = C.gold; ctx.lineWidth = 5; roundRect(sx - 17, by - 13, 34, 30, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(sx + ex, by + 2 + ey, 6.5, 0, TAU); ctx.fill();
    if (enraged) { ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(sx - 18 * Math.sign(sx), by - 24); ctx.lineTo(sx + 16 * Math.sign(sx), by - 16); ctx.stroke(); }
  }
  // une étiquette au nom de la classe
  ctx.fillStyle = '#fbf6e8'; ctx.fillRect(-28, 38, 56, 22); ctx.strokeStyle = LEATHER_D; ctx.lineWidth = 1.5; ctx.strokeRect(-28, 38, 56, 22);
  txt('CM2', 0, 50, 16, { color: C.pencil, weight: 400 });
  ctx.restore();
}
function drawGardeFx() {
  for (const rb of G.ribbons) {   // un ruban tendu en pointillés, puis il claque
    const live = rb.t >= rb.warn, k = live ? clamp((rb.t - rb.warn) / rb.act, 0, 1) : 0;
    ctx.save(); ctx.translate(rb.x, rb.y); ctx.rotate(rb.a);
    if (!live) {
      ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 24); ctx.setLineDash([12, 9]); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.moveTo(0, 0); for (let i = 1; i <= 20; i++) ctx.lineTo(rb.len * i / 20, Math.sin(i * 1.3 + G.time * 6) * 4); ctx.stroke();
    } else {
      ctx.globalAlpha = 1 - k * k; ctx.strokeStyle = '#7a1e26'; ctx.lineWidth = 15; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(rb.len, 0); ctx.stroke();
      ctx.strokeStyle = '#c8424a'; ctx.lineWidth = 10; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(rb.len, -2); ctx.stroke();
    }
    ctx.restore();
  }
  for (const e of G.enemies) if (e.phase === 'jump' && (e.type === 'tampon' || e.type === 'cartable')) {   // là où il va retomber
    const R = e.isBoss ? CARTABLE.R : TAMPON.R;
    ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.35 + 0.3 * Math.sin(G.time * 22); ctx.setLineDash([10, 8]); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(e.jx, e.jy, R, 0, TAU); ctx.stroke(); ctx.restore();
  }
  for (const b of G.ebul) {   // les crayons de couleur lancés par le Cartable
    if (!b.crayon) continue;
    ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a);
    ctx.fillStyle = CRAYONS[b.col]; ctx.fillRect(-14, -3.5, 20, 7);
    ctx.fillStyle = '#f2d9a8'; ctx.beginPath(); ctx.moveTo(6, -3.5); ctx.lineTo(14, 0); ctx.lineTo(6, 3.5); ctx.closePath(); ctx.fill();
    ctx.fillStyle = CRAYONS[b.col]; ctx.beginPath(); ctx.moveTo(11, -1.3); ctx.lineTo(14, 0); ctx.lineTo(11, 1.3); ctx.fill();
    ctx.restore();
  }
}
