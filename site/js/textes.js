// Chapitre XII : le cahier de textes (itération 21). Le sixième cahier : l'emploi du temps collé à gauche,
// les devoirs de la semaine à droite. Toutes les 36 secondes, la cloche sonne et la matière change :
// calcul, musique, récré, géométrie, poésie… et avec elle les ratures de la page et sa musique.
// Deux ratures à soi : le réveil qui sonne et la cocotte en papier qui pince. Au bout : la Grande Horloge.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const NOTES_TEXTES = [
  { x: WORLD.w / 2, y: -150, t: '— cahier n° 6 · chapitre XII : le cahier de textes —', r: -0.02 },
  { x: WORLD.w * 0.72, y: -96, t: 'ajouté : un emploi du temps, et une cloche', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'le carnet de correspondance ?', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'à faire', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'pour', r: -0.05 },
  { x: -160, y: WORLD.h * 0.45 + 88, t: 'demain', r: -0.04 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'la cloche ne sonne pas pour rien', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: 'qui a avancé l’horloge ?', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'tic, tac…', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'signature des parents', r: 0.05 },
  { x: WORLD.w * 0.3, y: -96, t: 'mercredi : pas d’école', r: -0.02 }
];
const DICTEES_TEXTES = ['JOUR', 'HEURE', 'LEÇON', 'MARDI', 'DEVOIR', 'CLASSE', 'SEMAINE', 'HORLOGE', 'SONNERIE', 'CALENDRIER'];
const TEXTES_TYPES = new Set(['reveil', 'cocotte']);
Object.assign(ETYPES, {
  reveil:  { r: 18, hp: 16, speed: 62, dmg: 1, xp: 4, agil: 2 },
  cocotte: { r: 17, hp: 10, speed: 104, dmg: 1, xp: 3, agil: 3 },
  horloge: { r: 74, hp: 1250, speed: 40, dmg: 2, xp: 250, agil: 1.2, boss: true }
});

/* ---------- L'emploi du temps ---------- */
// les matières : chacune ramène les ratures (et la musique) de sa page ; le devoir du cahier de textes vise l'une d'elles
const EMPLOI = [
  { name: 'Calcul', ch: 9, col: '#c8423f', tint: 'rgba(200,66,63,0.13)', types: ['chiffre', 'fois', 'egal', 'retenue'], devoir: ['fois', 'signes fois'] },
  { name: 'Musique', ch: 2, col: '#c2407e', tint: 'rgba(208,80,138,0.13)', types: ['croche', 'soupir', 'metronome', 'biffure', 'gomme'], devoir: ['soupir', 'soupirs'] },
  { name: 'Récré', ch: 10, col: '#c97716', tint: 'rgba(224,138,42,0.15)', types: ['calot', 'toupie', 'corde', 'avion'], devoir: ['toupie', 'toupies'] },
  { name: 'Géométrie', ch: 3, col: '#2f7db5', tint: 'rgba(60,143,196,0.13)', types: ['segment', 'equerre', 'compas', 'rapporteur', 'gomme'], devoir: ['equerre', 'équerres'] },
  { name: 'Poésie', ch: 11, col: '#7b5ea7', tint: 'rgba(123,94,167,0.14)', types: ['ver', 'rime', 'exclam', 'corbeau'], devoir: ['exclam', 'points d’exclamation'] }
];
const CRENEAUX = ['8 h 30', '9 h 30', '10 h 30', '11 h 30', '13 h 30'];
const JOURS = ['lundi', 'mardi', 'jeudi', 'vendredi'];
const HEURE = { len: 36, keep: 460, show: 1.6 };
const TEXTES_CAP = 4;
// l'heure n (0, 1, 2…) : cinq créneaux par jour, et chaque jour l'emploi du temps commence par une autre matière
const matiere = (n = G.hour || 0) => EMPLOI[(n % 5 + Math.floor(n / 5)) % 5];
const jourDe = (n = G.hour || 0) => JOURS[Math.floor(n / 5) % 4];
const creneauDe = (n = G.hour || 0) => CRENEAUX[n % 5];
const enTextes = () => CH().paper === 'textes';

CHAPTERS.push({
  num: 'XII', name: 'Le cahier de textes', done: 'Le cahier de textes : tout est coché !', paper: 'textes', notes: NOTES_TEXTES, dictees: DICTEES_TEXTES,
  intro: 'Chapitre XII : le cahier de textes. Lundi, 8 h 30 : calcul !', boss: 'horloge', bossName: 'La Grande Horloge',
  bossIntro: '16 h 30… Tic, tac : voici la Grande Horloge !', bossBack: 'La Grande Horloge remonte ses aiguilles.', bossSound: 'boss12',
  scale: 42, rateOff: 240, rateCap: 18, waveCap: 'Toute la classe déboule !',
  meet: {
    reveil: 'Nouveau : le réveil. Quand il sonne, son onde part !',
    cocotte: 'Nouveau : la cocotte en papier. Elle s’ouvre… et elle pince !'
  },
  // les ratures de la matière de l'heure (avec toutes leurs variantes : on est en fin d'année), plus les deux du cahier de textes
  pick(t, r) {
    if (t > 15 && r < 0.045 && countType('reveil') < 2) return 'reveil';
    if (t > 8 && r < 0.1 && countType('cocotte') < 4) return 'cocotte';
    const A = G.agenda;   // un devoir en cours : la classe envoie plus souvent ce qu'il faut biffer
    if (A && !A.box && !A.done && r >= 0.1 && r < 0.15 && countType(A.type) < 5) return A.type;
    const S = matiere(), k = CHAPTERS[S.ch].pick(110 + t, r < 0.1 ? r * 9 : (r - 0.1) / 0.9);
    // pas de gomme (elle mord trop fort pour une fin d'année), et pas plus de quatre ratures de chaque sorte, à part la plus simple
    return k === 'gomme' || (k !== S.types[0] && countType(k) >= TEXTES_CAP) ? S.types[0] : k;
  },
  wave(t, i) { const S = matiere(), k = CHAPTERS[S.ch].wave(110 + t, i); return k === 'gomme' ? S.types[0] : k; }
});

// la cloche sonne : l'heure suivante, une autre matière ; les ratures de l'heure d'avant rentrent en classe
function ringBell(byBoss) {
  G.hour++; G.nextBell = G.t + HEURE.len; G.bell = HEURE.show;
  const S = matiere(), keep = new Set(S.types), p = G.p;
  AU.play('cloche'); G.cam.shake = Math.max(G.cam.shake, 5);
  if (G.agenda && !G.agenda.done && (G.agenda.got || G.agenda.box)) caption('Devoir oublié… la cloche a sonné !', 2.2, 'pink');
  G.agenda = null; G.nextAgenda = G.t + AGENDA.first;
  let gone = 0;
  for (const e of G.enemies) {
    if (e.dead || e.isBoss || keep.has(e.type) || TEXTES_TYPES.has(e.type) || ERRANTES.has(e.type) || e.pin > 0) continue;
    if (Math.hypot(e.x - p.x, e.y - p.y) < HEURE.keep) continue;
    e.dead = true;
    if (gone++ < 60) for (let i = 0; i < 3; i++) G.parts.push({ x: e.x, y: e.y, vx: rnd(-60, 60), vy: rnd(-90, -20), life: 0.5, max: 0.5, size: rnd(2, 4), color: C.pencil, drag: 3 });
  }
  if (!byBoss) caption('Driiing ! ' + jourDe().replace(/^./, c => c.toUpperCase()) + ', ' + creneauDe() + ' : ' + S.name.toLowerCase() + ' !', 2.8, 'hl');
}
function stepEmploi(dt) {
  if (!enTextes()) return;
  G.bell = Math.max(0, G.bell - dt);
  if (G.t >= G.nextBell && !G.boss) ringBell(false);   // pendant la Grande Horloge, c'est elle qui sonne
  stepAgenda(dt);
}
function textesKill(e) {   // une rature biffée sonne comme la matière de l'heure
  const ch = matiere().ch;
  if (ch === 9) AU.play('tablesKill', e.type === 'chiffre' ? 1 + e.id % 9 : 5);
  else if (ch === 2) AU.play('noteKill', staffPitch(e.y));
  else if (ch === 10) AU.play('recreKill', e.id);
  else if (ch === 3) AU.play('mmKill');
  else AU.play('poesieKill', e.id);
}
// la musique : celle de la matière de l'heure, et le carillon de la Grande Horloge quand elle est là
function textesMusic() { return G.boss ? 12 : matiere().ch; }

/* ---------- Le papier : l'emploi du temps à gauche, les devoirs à droite ---------- */
const TEXTES_GX = Math.round((MARGIN_X + WORLD.w) / 2);
const EDT = { x0: 300, y0: 300, hw: 170, dw: 230, hh: 90, rh: 250 };
const SEMAINE = [
  ['Lundi', ['Calcul : la table de 7, par cœur', 'Musique : chanter le refrain en entier', 'Poésie : apprendre « La goutte »'], [1, 1, 0]],
  ['Mardi', ['Géométrie : tracer un hexagone (le fermer !)', 'Rapporter le calot prêté', 'Faire signer le cahier'], [1, 0, 1]],
  ['Jeudi', ['Lecture : finir le chapitre XI', 'Recopier le brouillon au propre', 'Ne pas courir sous le préau'], [0, 1, 0]],
  ['Vendredi', ['Récitation !!!', 'Rendre la carte au trésor', 'Penser au goûter'], [0, 0, 1]]
];
function drawTextes(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = 'rgba(200,236,228,0.2)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // un papier vert d'eau
  const GX = TEXTES_GX, vis = (ax, ay, bx, by) => bx > v.x0 && ax < v.x1 && by > v.y0 && ay < v.y1;
  if (x1 > GX) {   // la page de droite : réglée, avec les devoirs de la semaine
    ctx.strokeStyle = 'rgba(90,160,150,0.3)'; ctx.lineWidth = 1.2 / ZOOM; ctx.beginPath();
    for (let y = Math.ceil(Math.max(y0, 96) / 48) * 48; y <= y1; y += 48) { ctx.moveTo(Math.max(x0, GX + 40), y); ctx.lineTo(x1, y); }
    ctx.stroke();
    ctx.strokeStyle = C.margin; ctx.globalAlpha = 0.6; ctx.lineWidth = 2 / ZOOM; ctx.beginPath(); ctx.moveTo(GX + 120, y0); ctx.lineTo(GX + 120, y1); ctx.stroke(); ctx.globalAlpha = 1;
    SEMAINE.forEach(([day, items, done], k) => {
      const bx = GX + 190, by = 220 + k * 440;
      if (!vis(bx - 60, by - 60, bx + 1100, by + 260)) return;
      ctx.save(); ctx.globalAlpha = 0.45; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.font = '400 40px ' + FONT_CURSIVE; ctx.fillStyle = C.ink; ctx.fillText(day, bx, by);
      const w = ctx.measureText(day).width;
      ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx - 4, by + 10); ctx.lineTo(bx + w + 10, by + 8); ctx.stroke();
      ctx.font = '400 28px ' + FONT_CURSIVE;
      items.forEach((it, i) => {
        const y = by + 86 + i * 48 - 8;
        ctx.fillText(it, bx + 40, y);
        ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.strokeRect(bx, y - 22, 24, 24);
        if (done[i]) { ctx.strokeStyle = C.red; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(bx + 4, y - 10); ctx.lineTo(bx + 11, y - 2); ctx.lineTo(bx + 28, y - 28); ctx.stroke(); }
      });
      ctx.restore();
    });
  }
  if (x0 < GX) {   // la page de gauche : l'emploi du temps, collé de travers avec un bout de scotch
    ctx.strokeStyle = C.margin; ctx.globalAlpha = 0.5; ctx.lineWidth = 2.2 / ZOOM; ctx.beginPath(); ctx.moveTo(MARGIN_X, y0); ctx.lineTo(MARGIN_X, y1); ctx.stroke(); ctx.globalAlpha = 1;
    drawEmploiTable(v, vis);
  }
  if (x0 < GX + 70 && x1 > GX - 70) {   // le pli du cahier
    const g = ctx.createLinearGradient(GX - 70, 0, GX + 70, 0);
    g.addColorStop(0, 'rgba(40,90,80,0)'); g.addColorStop(0.45, 'rgba(40,90,80,0.12)'); g.addColorStop(0.5, 'rgba(40,90,80,0.2)'); g.addColorStop(0.55, 'rgba(40,90,80,0.12)'); g.addColorStop(1, 'rgba(40,90,80,0)');
    ctx.fillStyle = g; ctx.fillRect(GX - 70, y0, 140, y1 - y0);
  }
}
function drawEmploiTable(v, vis) {
  const E = EDT, tx1 = E.x0 + E.hw + 4 * E.dw, ty1 = E.y0 + E.hh + 5 * E.rh;
  if (!vis(E.x0 - 60, E.y0 - 140, tx1 + 60, ty1 + 160)) return;
  const cur = enTextes() && G.state !== 'title' ? G.hour || 0 : -1, cd = cur >= 0 ? Math.floor(cur / 5) % 4 : -1, cs = cur >= 0 ? cur % 5 : -1;
  ctx.save();
  ctx.fillStyle = 'rgba(255,253,244,0.6)'; ctx.fillRect(E.x0, E.y0, tx1 - E.x0, ty1 - E.y0 + 110);
  txt('Emploi du temps', (E.x0 + tx1) / 2, E.y0 - 70, 58, { font: FONT_CURSIVE, weight: 400, color: C.ink, alpha: 0.55 });
  for (let d = 0; d < 4; d++) for (let i = 0; i < 5; i++) {
    const x = E.x0 + E.hw + d * E.dw, y = E.y0 + E.hh + i * E.rh;
    if (!vis(x, y, x + E.dw, y + E.rh)) continue;
    const S = EMPLOI[(i + d) % 5], now = d === cd && i === cs;
    ctx.fillStyle = S.tint; ctx.fillRect(x, y, E.dw, E.rh);
    if (now) { ctx.fillStyle = C.hl; ctx.globalAlpha = 0.45 + 0.15 * Math.sin(G.time * 4); ctx.fillRect(x + 6, y + 6, E.dw - 12, E.rh - 12); ctx.globalAlpha = 1; }
    txt(S.name, x + E.dw / 2, y + E.rh / 2, S.name.length > 7 ? 32 : 38, { font: FONT_CURSIVE, weight: 400, color: S.col, alpha: now ? 0.95 : 0.4 });
    if (now) { ctx.strokeStyle = S.col; ctx.lineWidth = 6; ctx.strokeRect(x + 3, y + 3, E.dw - 6, E.rh - 6); }
  }
  ctx.strokeStyle = 'rgba(46,46,51,0.35)'; ctx.lineWidth = 2.5; ctx.beginPath();
  for (let d = 0; d <= 4; d++) { const x = E.x0 + E.hw + d * E.dw; ctx.moveTo(x, E.y0); ctx.lineTo(x, ty1); }
  ctx.moveTo(E.x0, E.y0); ctx.lineTo(E.x0, ty1 + 110);
  for (let i = 0; i <= 5; i++) { const y = E.y0 + E.hh + i * E.rh; ctx.moveTo(E.x0, y); ctx.lineTo(tx1, y); }
  ctx.moveTo(E.x0, E.y0); ctx.lineTo(tx1, E.y0); ctx.moveTo(E.x0, ty1 + 110); ctx.lineTo(tx1, ty1 + 110); ctx.moveTo(tx1, E.y0); ctx.lineTo(tx1, ty1 + 110);
  ctx.stroke();
  JOURS.forEach((j, d) => {
    const x = E.x0 + E.hw + d * E.dw + E.dw / 2, y = E.y0 + E.hh / 2;
    txt(j.charAt(0).toUpperCase() + j.slice(1), x, y, 34, { color: C.graphite, alpha: 0.7 });
    if (d === cd) { ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 60, y + 24); ctx.lineTo(x + 60, y + 22); ctx.stroke(); }
  });
  CRENEAUX.forEach((h, i) => txt(h, E.x0 + E.hw / 2, E.y0 + E.hh + i * E.rh + E.rh / 2, 30, { color: i === cs ? C.red : C.pencil, alpha: 0.8 }));
  txt('16 h 30 : la sonnerie !', (E.x0 + tx1) / 2, ty1 + 55, 40, { font: FONT_CURSIVE, weight: 400, color: C.red, alpha: G.boss && enTextes() ? 0.7 + 0.3 * Math.sin(G.time * 8) : 0.5 });
  ctx.fillStyle = 'rgba(236,226,180,0.72)'; ctx.translate(E.x0 + 40, E.y0 - 6); ctx.rotate(-0.5); ctx.fillRect(-60, -16, 120, 32);   // le scotch
  ctx.restore();
}

/* ---------- Les ratures du cahier de textes ---------- */
const REVEIL = { keep: 260, warn: 0.75, wave: 210, dur: 0.6 };
const COCOTTE = { reach: 66, open: 0.45, rest: 1.5 };
function stepTextes(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  const p = G.p;
  e.pt -= dt;
  if (e.type === 'reveil') {   // il trottine, s'arrête, tremble… et sonne : une onde part de lui
    if (e.phase === 'walk') {
      if (d < REVEIL.keep) { MV.x *= -0.3; MV.y *= -0.3; }
      e.rot = Math.sin(G.t * 6 + e.id) * 0.12;
      if (e.pt <= 0 && d < 560 && !hid) { e.phase = 'ring'; e.pt = REVEIL.warn; AU.play('reveilWarn'); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else {
      MV.x = 0; MV.y = 0; e.rot = vrnd(-0.25, 0.25);
      if (e.pt <= 0) {
        G.waves.push({ x: e.x, y: e.y, t: 0, dur: REVEIL.dur, r: REVEIL.wave, hit: false });
        AU.play('reveil'); e.phase = 'walk'; e.pt = rnd(3.2, 4.4);
      }
    }
  } else if (e.type === 'cocotte') {   // elle sautille, s'approche, s'ouvre en quatre… et pince
    if (e.cyc === undefined) e.cyc = rnd(1);
    if (e.phase === 'walk') {
      e.cyc += dt * 2.2;
      const hop = Math.max(0, Math.sin(e.cyc * TAU));
      MV.x *= 0.25 + 1.6 * hop; MV.y *= 0.25 + 1.6 * hop;
      e.rot = Math.sin(e.cyc * 3) * 0.2;
      if (e.pt <= 0 && d < COCOTTE.reach + 40 && !hid) { e.phase = 'open'; e.pt = COCOTTE.open; AU.play('cocotteOpen'); }
    } else if (e.phase === 'open') {
      MV.x *= 0.1; MV.y *= 0.1;
      if (e.pt <= 0) {
        if (p.inv <= 0 && p.dashT <= 0 && d < COCOTTE.reach + p.r * 0.5) hurtPlayer(1, e.x, e.y);
        AU.play('cocotte'); e.phase = 'snap'; e.pt = COCOTTE.rest;
      }
    } else {
      MV.x *= 0.3; MV.y *= 0.3;
      if (e.pt <= 0) { e.phase = 'walk'; e.pt = 0.4; }
    }
  }
}

/* ---------- La Grande Horloge ---------- */
const HORLOGE = { warn: 0.9, sweep: 3.0, minLen: 540, hrLen: 360, minW: 1.45, hrW: -0.7, reach: 13, ring: 300, ring2: 430, tick: 0.1, rest: 0.4, numSpeed: 300 };
function stepHorloge(e, dt, dx, dy, d, slow) {
  const want = d < 340 ? -0.5 : 1;
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow * want; MV.y = dy / d * e.speed * slow * want;
  if (e.enter > 0) e.enter = Math.max(0, e.enter - dt * 0.5);
  const enraged = e.hp < e.maxHp / 2, p = G.p;
  e.ring = Math.max(0, (e.ring || 0) - dt);
  if (e.phase === 'hands') {   // les aiguilles s'allongent et balaient la page
    MV.x = 0; MV.y = 0;
    const before = e.ht; e.ht += dt;
    if (e.ht > HORLOGE.warn) {
      const k = enraged ? 1.35 : 1;
      e.am += dt * HORLOGE.minW * k; e.ah += dt * HORLOGE.hrW * k;
      if (p.inv <= 0 && p.dashT <= 0) for (const [a, L] of [[e.am, HORLOGE.minLen], [e.ah, HORLOGE.hrLen]]) {
        if (segDist(p.x, p.y, e.x, e.y, e.x + Math.cos(a) * L, e.y + Math.sin(a) * L) < HORLOGE.reach + p.r * 0.6) { hurtPlayer(1, e.x, e.y); break; }
      }
      if (Math.floor(e.ht * 2) !== Math.floor(before * 2)) AU.play('tic', Math.floor(e.ht * 2));
    }
    if (e.ht >= HORLOGE.warn + HORLOGE.sweep) { e.phase = 'walk'; e.atk = enraged ? 1.1 : 1.6; }
    return;
  }
  e.pt -= dt;
  if (e.phase === 'cast') { MV.x *= 0.15; MV.y *= 0.15; if (e.pt <= 0) { e.phase = 'walk'; e.atk = enraged ? 1.1 : 1.6; } return; }
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % (enraged ? 4 : 3);
  if (m === 1) {   // les aiguilles : la grande et la petite se referment sur toi, de part et d'autre
    const a0 = Math.atan2(dy, dx);
    e.phase = 'hands'; e.ht = 0; e.am = a0 - 1.5; e.ah = a0 + 1.6;
    AU.play('horlogeWarn');
    if (!G.aiguilleSeen) { G.aiguilleSeen = true; caption('Les aiguilles ! Éloigne-toi, ou saute par-dessus d’un pâté.', 2.8, 'pink'); }
  } else if (m === 2) {   // les douze heures : un cadran autour de toi, qui se referme… sauf par l'heure qui manque
    const gap = Math.floor(rnd(12)), rings = enraged ? [[HORLOGE.ring, 0, gap], [HORLOGE.ring2, 0.7, (gap + 6) % 12]] : [[HORLOGE.ring, 0, gap]];
    for (const [R, delay, g] of rings) for (let i = 0; i < 12; i++) {
      if (i === g) continue;
      const a = -Math.PI / 2 + i / 12 * TAU, c = Math.cos(a), s = Math.sin(a), w = delay + 12 * HORLOGE.tick + HORLOGE.rest;
      G.ebul.push({ x: p.x + c * R, y: p.y + s * R, vx: -c * HORLOGE.numSpeed, vy: -s * HORLOGE.numSpeed, life: 2.6, heure: i || 12, wait: w, w0: w, app: delay + i * HORLOGE.tick });
    }
    AU.play('heures'); e.phase = 'cast'; e.pt = (enraged ? 0.7 : 0) + 12 * HORLOGE.tick + HORLOGE.rest + 0.5;
    if (!G.heuresSeen) { G.heuresSeen = true; caption('Les douze heures ! Sors du cadran par l’heure qui manque.', 2.8, 'pink'); }
  } else if (m === 0 && !enraged || m === 3) {   // la sonnerie : elle avance l'heure, et la nouvelle matière attaque
    ringBell(true);
    const S = matiere(); e.ring = 1.4;
    if (S.ch === 9) pythagore(p, enraged);
    else if (S.ch === 10) { const b = Math.atan2(p.y - e.y, p.x - e.x); for (let i = 0; i < 3; i++) G.sifflets.push({ x: e.x, y: e.y, t: -i * 0.55, gapA: b + i * 1.1 * (i % 2 ? -1 : 1), hit: false }); AU.play('sifflet'); }
    else if (S.ch === 11) { const a0 = rnd(TAU); for (const a of enraged ? [a0, a0 + Math.PI / 3] : [a0]) G.cesures.push({ x: p.x, y: p.y, a, t: 0, hit: false }); AU.play('cesureWarn'); }
    else { const kind = S.ch === 2 ? 'metronome' : 'compas'; for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + G.t; spawnEnemy(kind, clamp(p.x + Math.cos(a) * 290, 30, WORLD.w - 30), clamp(p.y + Math.sin(a) * 290, 30, WORLD.h - 30)); } }
    caption('Driiing ! L’Horloge sonne : ' + S.name.toLowerCase() + ' !', 2.4, 'pink');
    e.phase = 'cast'; e.pt = 1.6;
  } else {   // colère : elle réveille toute la classe
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + G.t; spawnEnemy(i % 2 ? 'cocotte' : 'reveil', clamp(e.x + Math.cos(a) * 170, 30, WORLD.w - 30), clamp(e.y + Math.sin(a) * 170, 30, WORLD.h - 30)); }
    caption('Elle réveille toute la classe !', 1.8, 'pink'); AU.play('boss12'); e.atk = 2;
  }
}
// les mêmes coups, vus par le pilote automatique
function textesDanger(x, y) {
  let s = 0;
  for (const e of G.enemies) {
    if (e.type === 'horloge' && e.phase === 'hands') {
      const live = e.ht > HORLOGE.warn, k = e.hp < e.maxHp / 2 ? 1.35 : 1;
      for (const [a, L, w] of [[e.am, HORLOGE.minLen, HORLOGE.minW], [e.ah, HORLOGE.hrLen, HORLOGE.hrW]]) for (const ahead of [0, 0.25, 0.5]) {
        const an = a + (live ? w * k * ahead : 0), dd = segDist(x, y, e.x, e.y, e.x + Math.cos(an) * L, e.y + Math.sin(an) * L);
        if (dd < HORLOGE.reach + 36) s += live ? 4 : 2;
      }
    } else if (e.type === 'cocotte' && e.phase === 'open') { if (Math.hypot(x - e.x, y - e.y) < COCOTTE.reach + 30) s += 3.5; }
    else if (e.type === 'reveil' && e.phase === 'ring') { const dd = Math.abs(Math.hypot(x - e.x, y - e.y) - REVEIL.wave * 0.6); if (dd < 70) s += 2; }
  }
  return s;
}

/* ---------- Dessins ---------- */
function drawTextesFx() {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const e of G.enemies) {
    if (e.type === 'horloge' && e.phase === 'hands') {   // les aiguilles : annoncées en pointillés, puis à l'encre
      const live = e.ht > HORLOGE.warn;
      for (const [a, L, wdt, col] of [[e.am, HORLOGE.minLen, 9, '#2e2e33'], [e.ah, HORLOGE.hrLen, 14, '#8e2a28']]) {
        ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(a);
        if (!live) { ctx.strokeStyle = C.red; ctx.globalAlpha = 0.35 + 0.3 * Math.sin(G.time * 22); ctx.setLineDash([14, 10]); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(60, 0); ctx.lineTo(L, 0); ctx.stroke(); }
        else {
          ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(30, -wdt / 2); ctx.lineTo(L - 40, -wdt / 2); ctx.lineTo(L, 0); ctx.lineTo(L - 40, wdt / 2); ctx.lineTo(30, wdt / 2); ctx.closePath(); ctx.fill();
          ctx.globalAlpha = 0.18; ctx.fillRect(30, -wdt * 1.6, L - 40, wdt * 3.2);
        }
        ctx.restore();
      }
      if (!live) {   // le sens de la course : deux flèches courbes
        ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.5; ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
        ctx.beginPath(); ctx.arc(e.x, e.y, HORLOGE.minLen * 0.8, e.am, e.am + 0.7); ctx.stroke();
        ctx.beginPath(); ctx.arc(e.x, e.y, HORLOGE.hrLen * 0.8, e.ah - 0.6, e.ah); ctx.stroke(); ctx.restore();
      }
    } else if (e.type === 'cocotte' && e.phase === 'open') {
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 26); ctx.setLineDash([7, 7]); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(e.x, e.y, COCOTTE.reach, 0, TAU); ctx.stroke(); ctx.restore();
    } else if (e.type === 'reveil' && e.phase === 'ring') {
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.25 + 0.25 * Math.sin(G.time * 30); ctx.setLineDash([9, 9]); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.arc(e.x, e.y, REVEIL.wave, 0, TAU); ctx.stroke(); ctx.restore();
      txt('Driiing !', e.x, e.y - 44, 22, { color: C.red, rot: vrnd(-0.08, 0.08) });
    }
  }
  for (const b of G.ebul) if (b.heure) {   // les douze heures : elles apparaissent une à une, puis se referment
    if (b.wait > 0 && b.w0 - b.wait < b.app) continue;
    const a = b.wait > 0 ? 0.45 + 0.25 * Math.sin(G.time * 18) : 1;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fffdf4'; ctx.strokeStyle = b.wait > 0 ? C.red : '#8a6a3a'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.arc(b.x, b.y, 15, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
    txt(String(b.heure), b.x, b.y + 1, b.heure > 9 ? 17 : 21, { color: b.wait > 0 ? C.red : C.graphite, alpha: a });
  }
}

function drawTextesEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const j = (fr - 1) * 0.8;
  if (e.type === 'reveil') {   // un réveil à deux cloches, sur ses petits pieds
    ctx.rotate(e.rot || 0);
    const ring = e.phase === 'ring';
    ctx.fillStyle = 'rgba(46,46,51,0.16)'; ctx.beginPath(); ctx.ellipse(0, 22, 18, 5, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-10, 14); ctx.lineTo(-15, 22); ctx.moveTo(10, 14); ctx.lineTo(15, 22); ctx.stroke();
    for (const s of [-1, 1]) {   // les deux cloches
      ctx.save(); ctx.translate(s * 13, -17); ctx.rotate(s * 0.5 + (ring ? Math.sin(G.time * 60) * 0.25 : 0));
      ctx.fillStyle = fl ? '#ffd0d4' : '#e0b23a'; ctx.strokeStyle = '#8a6210'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, 8, Math.PI, 0); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
    }
    if (ring) { ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(Math.sin(G.time * 60) * 8, -26); ctx.stroke(); }
    ctx.fillStyle = fl ? '#ffd0d4' : '#3c8f84'; ctx.strokeStyle = '#1d5a52'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 18, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fffdf4'; ctx.beginPath(); ctx.arc(0, 0, 13.5, 0, TAU); ctx.fill();
    ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.2; ctx.beginPath(); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; ctx.moveTo(Math.cos(a) * 11, Math.sin(a) * 11); ctx.lineTo(Math.cos(a) * 13, Math.sin(a) * 13); } ctx.stroke();
    const t = G.time * (ring ? 8 : 0.6) + e.id;
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t) * 9, Math.sin(t) * 9); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t / 12 + 2) * 6, Math.sin(t / 12 + 2) * 6); ctx.stroke();
    for (const s of [-4.5, 4.5]) { ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s, -5 + j * 0.3, ring ? 2.6 : 1.8, 0, TAU); ctx.fill(); }
    if (ring) { ctx.strokeStyle = C.graphite; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.arc(0, 6, 3.5, 0, TAU); ctx.stroke(); }
  } else if (e.type === 'cocotte') {   // une cocotte en papier (une salière), vue de dessus : quatre becs de couleur
    ctx.rotate(e.rot || 0);
    const op = e.phase === 'open' ? ease(1 - e.pt / COCOTTE.open) : e.phase === 'snap' ? Math.max(0, e.pt / COCOTTE.rest - 0.8) * 5 : 0;
    const cols = ['#ff9ec4', '#fff1a6', '#9fd0f5', '#b6e8a8'], R = 19, gap = 2 + op * 9;
    ctx.fillStyle = 'rgba(46,46,51,0.15)'; ctx.beginPath(); ctx.ellipse(2, 20, 18, 5, 0, 0, TAU); ctx.fill();
    if (op > 0.05) { ctx.fillStyle = '#7a3044'; ctx.beginPath(); ctx.arc(0, 0, 8 + op * 8, 0, TAU); ctx.fill(); }
    for (let k = 0; k < 4; k++) {
      const a = k * Math.PI / 2 - Math.PI / 4, cx = Math.cos(a + Math.PI / 4) * gap * 0.7, cy = Math.sin(a + Math.PI / 4) * gap * 0.7;
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(k * Math.PI / 2);
      ctx.fillStyle = fl ? '#ffd0d4' : cols[k]; ctx.strokeStyle = 'rgba(46,46,51,0.6)'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R, -R); ctx.lineTo(R, R); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(46,46,51,0.3)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(R, 0); ctx.stroke();
      ctx.restore();
      if (op > 0.3) txt(String(k + 1), Math.cos(a + Math.PI / 4) * (R * 0.8 + gap), Math.sin(a + Math.PI / 4) * (R * 0.8 + gap), 12, { color: C.graphite });
    }
    for (const s of [-4, 4]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s, -5, 3.2, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s, -4.5 + j * 0.3, 1.6, 0, TAU); ctx.fill(); }
  }
}
function drawHorloge(e, fr, fl) {
  const enraged = e.hp < e.maxHp / 2, j = (fr - 1) * 1.4, ring = (e.ring || 0) > 0;
  ctx.save(); if (enraged || ring) ctx.translate(vrnd(-1.5, 1.5), vrnd(-1.5, 1.5));
  ctx.fillStyle = 'rgba(46,46,51,0.15)'; ctx.beginPath(); ctx.ellipse(0, 112, 90, 16, 0, 0, TAU); ctx.fill();
  // le balancier
  const sw = Math.sin(G.time * 3) * 0.35;
  ctx.save(); ctx.translate(0, 60); ctx.rotate(sw); ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 42); ctx.stroke();
  ctx.fillStyle = '#e0b23a'; ctx.strokeStyle = '#8a6210'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 48, 11, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
  // la cloche de la sonnerie, au-dessus
  ctx.save(); ctx.translate(0, -84); ctx.rotate(ring ? Math.sin(G.time * 50) * 0.3 : 0);
  ctx.fillStyle = fl ? '#fff3c0' : '#e0b23a'; ctx.strokeStyle = '#8a6210'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(-18, 8); ctx.quadraticCurveTo(-16, -16, 0, -18); ctx.quadraticCurveTo(16, -16, 18, 8); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 10, 4, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
  if (ring) txt('Driiing !', 0, -124, 26, { color: C.red, rot: vrnd(-0.1, 0.1) });
  // le cadran dans son bois
  ctx.fillStyle = fl ? '#fff3c0' : '#9a6a3a'; ctx.strokeStyle = '#5e3c1e'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 74, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fffdf4'; ctx.beginPath(); ctx.arc(0, 0, 62, 0, TAU); ctx.fill(); ctx.strokeStyle = '#5e3c1e'; ctx.lineWidth = 1.5; ctx.stroke();
  for (let k = 1; k <= 12; k++) { const a = -Math.PI / 2 + k / 12 * TAU; txt(String(k), Math.cos(a) * 50, Math.sin(a) * 50 + 1, k > 9 ? 13 : 15, { color: C.graphite }); }
  // ses propres aiguilles (quand elles ne balaient pas la page)
  if (e.phase !== 'hands') {
    const t = G.time * 0.5;
    ctx.strokeStyle = '#2e2e33'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t) * 40, Math.sin(t) * 40); ctx.stroke();
    ctx.strokeStyle = '#8e2a28'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(t / 12 - 1) * 26, Math.sin(t / 12 - 1) * 26); ctx.stroke();
  }
  ctx.fillStyle = '#2e2e33'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, TAU); ctx.fill();
  // les yeux, la bouche
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x);
  for (const s of [-1, 1]) {
    const ex = s * 22, ey = -18;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex, ey, 10, 0, TAU); ctx.fill(); ctx.strokeStyle = '#5e3c1e'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(ex + Math.cos(la) * 4, ey + Math.sin(la) * 4 + j * 0.3, 4.5, 0, TAU); ctx.fill();
    if (enraged) { ctx.strokeStyle = '#4a3a2a'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(ex + s * 12, ey - 17); ctx.lineTo(ex - s * 8, ey - 11); ctx.stroke(); }
  }
  ctx.strokeStyle = '#4a3a2a'; ctx.lineWidth = 3; ctx.beginPath();
  if (e.phase === 'cast' || ring) ctx.ellipse(0, 26, 9, 7, 0, 0, TAU); else if (enraged) { ctx.moveTo(-12, 28); ctx.lineTo(12, 28); } else ctx.arc(0, 18, 12, 0.4, Math.PI - 0.4);
  ctx.stroke();
  ctx.restore();
}

/* ---------- Le cartouche de l'emploi du temps, à gauche de l'écran ---------- */
function drawEmploiHUD() {
  if (!enTextes() || !G.p || !['play', 'pause', 'levelup'].includes(G.state)) return;
  const s = U, x = SAFE.l + 16 * s, y = SAFE.t + 78 * s, w = 250 * s, h = 98 * s, S = matiere(), A = G.agenda;
  const shake = G.bell > 0 ? Math.sin(G.time * 50) * 3 * s * (G.bell / HEURE.show) : 0;
  ctx.save(); ctx.translate(x + shake, y);
  ctx.fillStyle = 'rgba(255,253,244,0.9)'; ctx.strokeStyle = S.col; ctx.lineWidth = 2; roundRect(0, 0, w, h, 6 * s); ctx.fill(); ctx.stroke();
  ctx.fillStyle = S.tint; roundRect(0, 0, w, h, 6 * s); ctx.fill();
  ctx.restore();
  const bx = x + shake;
  if (G.bell > 0) txt('Driiing !', bx + 12 * s, y + 18 * s, 19 * s, { align: 'left', color: C.red });
  else txt(G.boss ? jourDe() + ' · 16 h 30' : jourDe() + ' · ' + creneauDe(), bx + 12 * s, y + 18 * s, 17 * s, { align: 'left', color: C.pencil, weight: 400 });
  txt(S.name, bx + 12 * s, y + 46 * s, 28 * s, { align: 'left', color: S.col, hl: C.hl });
  // la petite horloge : le temps qui reste avant la cloche
  const cx = bx + w - 30 * s, cy = y + 34 * s, r = 19 * s, q = G.boss ? 1 : clamp(1 - (G.nextBell - G.t) / HEURE.len, 0, 1);
  ctx.save(); ctx.fillStyle = '#fffdf4'; ctx.strokeStyle = G.boss ? C.red : C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); ctx.stroke();
  ctx.fillStyle = G.boss ? 'rgba(200,66,74,0.3)' : S.tint.replace(/0\.1\d\)$/, '0.5)'); ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r - 2, -Math.PI / 2, -Math.PI / 2 + q * TAU); ctx.closePath(); ctx.fill();
  const ha = -Math.PI / 2 + q * TAU; ctx.strokeStyle = C.graphite; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ha) * r * 0.8, cy + Math.sin(ha) * r * 0.8); ctx.stroke();
  ctx.restore();
  // le devoir du cahier de textes : une case à cocher, puis la consigne
  let line = 'pas de devoir pour l’instant', col = C.pencil, box = false, tick = false;
  if (A && A.done) { line = 'devoir fait !'; col = '#3c8a3c'; box = tick = true; }
  else if (A && A.box) { line = 'coche la case !'; col = C.red; box = true; }
  else if (A) { line = 'biffer ' + A.got + ' / ' + A.need + ' ' + A.label; col = C.ink; box = true; }
  const lx = bx + (box ? 38 : 12) * s, ly = y + 78 * s;
  if (box) {
    ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeRect(bx + 12 * s, ly - 9 * s, 18 * s, 18 * s);
    if (tick) { ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx + 15 * s, ly); ctx.lineTo(bx + 20 * s, ly + 6 * s); ctx.lineTo(bx + 33 * s, ly - 12 * s); ctx.stroke(); }
    ctx.restore();
  }
  ctx.font = '700 ' + (18 * s) + 'px ' + FONT_MAIN;
  const fz = 18 * s * Math.min(1, (bx + w - 10 * s - lx) / Math.max(1, ctx.measureText(line).width));
  txt(line, lx, ly, fz, { align: 'left', color: col });
}
