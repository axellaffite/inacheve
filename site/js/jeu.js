// Simulation : état, ratures, joueur et pilote automatique, collisions, niveaux, fins de partie.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

/* ===================== État ===================== */
const G = {
  state: 'title', time: 0, stateT: 0, demo: false, t: 0,
  cam: { x: WORLD.w / 2, y: WORLD.h / 2, shake: 0 },
  captions: [], deco: [], best: 0, input: { touch: !CAPTURE && !!(window.matchMedia && matchMedia('(pointer: coarse)').matches) }
};
try { G.best = parseInt(localStorage.getItem('inacheve.best') || '0', 10) || 0; } catch (e) { G.best = 0; }
try { G.calm = !CAPTURE && localStorage.getItem('inacheve.calme') === '1'; } catch (e) { G.calm = false; }
// chapitre le plus loin atteint : une fois la Grande Rature battue, on peut commencer directement au chapitre II
try { G.unlocked = CAPTURE ? 1 : parseInt(localStorage.getItem('inacheve.chapitre') || '1', 10) || 1; } catch (e) { G.unlocked = 1; }
function unlockChapter(n) { if (G.demo || G.devoir || n <= G.unlocked) return; G.unlocked = n; try { localStorage.setItem('inacheve.chapitre', String(n)); } catch (e) { /* rien */ } }
let enemyId = 1;

function xpFor(level) { return Math.floor(5 + level * 3 + level * level * 0.3); }
function lvl(k) { return (G.mots && G.mots[k]) || 0; }
function computeStats() {
  const g = lvl('GUILLEMETS');
  G.S = {
    dmg: 1 + 0.3 * lvl('ENCRE'), rate: 2.8 * (1 + 0.18 * lvl('VIRGULE')), extra: g ? g + 1 : 0,
    bounce: lvl('ECHO'), pierce: lvl('ITALIQUE'), pspeed: 560 * (1 + 0.1 * lvl('ITALIQUE')),
    moons: lvl('LUNE'), burn: lvl('FEU'), point: lvl('POINT'), knock: lvl('VENT'),
    magnet: 135 * (1 + 0.45 * lvl('AIMANT')) * (devoirHas('aimant') ? 2 : 1), speed: 235 * (1 + 0.1 * lvl('PLUME')), dashCd: 2.1 * (1 - 0.13 * lvl('PLUME'))
  };
}

// Les chapitres du cahier. Le chapitre II (la portée) est décrit dans chapitre2.js, qui l'ajoute à la liste.
const CHAPTERS = [null, {
  num: 'I', name: 'Premier chapitre', done: 'Premier chapitre : écrit.', paper: 'seyes', notes: UNWRITTEN_NOTES, dictees: DICTEES,
  intro: 'Chapitre I : tiens la page jusqu’à la Grande Rature', boss: 'boss', bossName: 'La Grande Rature', bossIntro: 'La Grande Rature approche…', bossBack: 'Elle revient, plus épaisse.', bossSound: 'boss',
  scale: 0, rateOff: 0, rateCap: 5.5, waveCap: 'Une vague de gribouillis !', meet: {},
  pick(t, r) { if (t > 95 && r < 0.09) return 'gomme'; if (t > 60 && r < 0.22) return 'tache'; if (t > 25 && r < 0.42) return 'biffure'; return 'gribouillis'; },
  wave(t, i) { return t > 80 && i % 3 === 0 ? 'biffure' : 'gribouillis'; }
}];
const CH = () => CHAPTERS[G.chapter || 1];
const TURN_DUR = 1.7;

// devoir : le devoir du jour (devoir.js), dont la graine vient de la date
function newGame(demo, start = 1, devoir = null) {
  if (!CAPTURE && !devoir) { seed = (seed * 16807 + 12345) % 2147483647; }
  rand = mulberry32(devoir ? devoir.seed : seed);
  G.chapter = start; G.startChapter = start;
  Object.assign(G, {
    demo, devoir, note: null, state: 'play', stateT: 0, t: 0, kills: 0, letters: 0, dictees: 0, level: 1, xp: 0, xpNext: xpFor(1), pendingLv: 0,
    mots: {}, motOrder: [], enemies: [], shots: [], ebul: [], items: [], parts: [], puddles: [], points: [], texts: [], fires: [], rings: [], waves: [], seen: {}, totalT: 0,
    spawnAcc: 0, nextWave: 45, boss: null, bossSpawned: false, bossDefeated: false, endless: false, nextBossAt: 180,
    pointCd: 6, dicteeIdx: 0, dicteeWord: CH().dictees[0], dicteeProg: 0, choices: [], sel: 0, score: 0, comboN: 0, comboT: 0,
    moonA: 0, botPickT: 0, endPhrase: '', newBest: false,
    refrain: null, refrains: 0, nextRefrain: REFRAIN.first, songs: [], refrainSeen: false,
    lines: [], figure: null, figures: 0, nextFigure: FIGURE.first, fills: [], figureSeen: false,
    tents: [], drops: [], tresor: null, tresors: 0, nextTresor: TRESOR.first, chests: [], coins: [], tresorSeen: false, pullX: 0, pullY: 0,
    strokes: [], strokeN: 0, sigs: [], sigSeen: false, enlu: null, enlus: 0, nextEnlu: ENLU.first, glows: [], enluSeen: false,
    newCroquis: 0, bestToasts: [], trail: [], quotes: [], quoteCd: 1.5, newUnions: 0,
    ribbons: [], sceau: null, sceaux: 0, nextSceau: SCEAU.first, stamps: [], sceauSeen: false, jumpSeen: false,
    ligne: null, lignes: 0, nextLigne: LIGNES.first, sweeps: [], ligneSeen: false
  });
  const hp = demo ? 7 : 6;
  G.p = { x: WORLD.w / 2, y: WORLD.h / 2, vx: 0, vy: 0, r: 13, hp, maxHp: hp, inv: 1.2, dashCd: 0, dashT: 0, dx: 1, dy: 0, face: 0, fireCd: 0.5, look: 0, puddleT: 0, squash: 0, hidden: 0, gx: 0, gy: 0 };
  G.cam.x = G.p.x; G.cam.y = G.p.y;
  computeStats(); clearStains();
  if (start > 1) draft([0, 0, 19, 28, 37, 46, 52][start]);
  if (devoir) setupDevoir();
  else {
    caption(CH().intro, 4);
    if (start > 1) caption('Au brouillon : tes mots sont tirés au hasard', 4, 'green');
  }
  setUI();
}
// Brouillon : on commence plus loin dans le cahier, avec des mots choisis au hasard (comme une partie déjà jouée)
function draft(n) {
  // un mot composé ne compte que pour un demi-mot : il y en a huit depuis l'itération 9, ils mangeaient le brouillon
  for (let i = 0; i < n;) {
    const avail = Object.keys(MOTS).filter(k => !isCompose(k) && lvl(k) < MOTS[k].max && k !== 'SOUFFLE');
    const ready = Object.keys(MOTS).filter(composeReady);
    const k = ready.length && rand() < 0.5 ? pick(ready) : avail.length ? pick(avail) : null;
    if (!k) break;
    G.mots[k] = lvl(k) + 1; if (!G.motOrder.includes(k)) G.motOrder.push(k);
    i += isCompose(k) ? 0.5 : 1;
  }
  G.level = n + 1; G.xpNext = xpFor(G.level); computeStats();
}
// On tourne la page : le chapitre suivant commence, avec les mêmes mots et le même niveau
function turnPage() {
  if (G.chapter >= CHAPTERS.length - 1) return;
  snapPage();
  for (const it of G.items) G.xp += it.value;   // les lettres restées au sol comptent quand même
  Object.assign(G, {
    chapter: G.chapter + 1, state: 'turn', stateT: 0, totalT: G.totalT + G.t, t: 0, enemies: [], shots: [], ebul: [], items: [], parts: [], puddles: [], points: [], fires: [], rings: [], waves: [], texts: [],
    spawnAcc: 0, nextWave: 45, boss: null, bossSpawned: false, bossDefeated: false, victoryAt: 0, endless: false, nextBossAt: 180, pointCd: 3,
    dicteeIdx: 0, dicteeProg: 0, comboN: 0, newBest: false, captions: [], refrain: null, nextRefrain: REFRAIN.first, songs: [],
    lines: [], figure: null, nextFigure: FIGURE.first, fills: [],
    tents: [], drops: [], tresor: null, nextTresor: TRESOR.first, chests: [], coins: [],
    strokes: [], strokeN: 0, sigs: [], enlu: null, nextEnlu: ENLU.first, glows: [], trail: [], quotes: [],
    ribbons: [], sceau: null, nextSceau: SCEAU.first, stamps: [], ligne: null, nextLigne: LIGNES.first, sweeps: []
  });
  G.dicteeWord = CH().dictees[0];
  const p = G.p; Object.assign(p, { x: WORLD.w / 2, y: WORLD.h / 2, vx: 0, vy: 0, hp: p.maxHp, inv: 2.5, dashT: 0, hidden: 0 });
  G.cam.x = p.x; G.cam.y = p.y; clearStains();
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
  AU.play('turn');
  caption(CH().intro, 4.5);
  setUI();
}

function caption(text, dur = 2.5, style = 'hl') { G.captions.push({ text, t: 0, dur, style }); if (G.captions.length > 3) G.captions.shift(); }
function addText(x, y, text, color = C.ink, size = 22) { G.texts.push({ x, y, text, color, size, t: 0, dur: 1 }); }

/* ===================== Ennemis ===================== */
const ETYPES = {
  gribouillis: { r: 16, hp: 2.5, speed: 84, dmg: 1, xp: 1, agil: 3.5 },
  gouttelette: { r: 10, hp: 1, speed: 108, dmg: 1, xp: 1, agil: 5 },
  biffure:     { r: 17, hp: 6, speed: 55, dmg: 1, xp: 2, agil: 3 },
  tache:       { r: 24, hp: 14, speed: 42, dmg: 1, xp: 4, agil: 1.6 },
  gomme:       { r: 22, hp: 24, speed: 90, dmg: 2, xp: 6, agil: 2.2 },
  boss:        { r: 74, hp: 540, speed: 46, dmg: 2, xp: 60, agil: 1.2, boss: true },
  // chapitre II : la portée
  croche:      { r: 15, hp: 3, speed: 104, dmg: 1, xp: 1, agil: 4 },
  soupir:      { r: 16, hp: 7, speed: 62, dmg: 1, xp: 2, agil: 3 },
  metronome:   { r: 26, hp: 26, speed: 40, dmg: 1, xp: 5, agil: 1.5 },
  fausse:      { r: 70, hp: 1500, speed: 50, dmg: 2, xp: 80, agil: 1.2, boss: true },
  // chapitre III : le papier millimétré
  segment:     { r: 15, hp: 3.5, speed: 100, dmg: 1, xp: 1, agil: 4 },
  equerre:     { r: 22, hp: 9, speed: 62, dmg: 1, xp: 3, agil: 3 },
  compas:      { r: 17, hp: 20, speed: 72, dmg: 1, xp: 5, agil: 2.5 },
  rapporteur:  { r: 26, hp: 30, speed: 40, dmg: 1, xp: 6, agil: 1.5 },
  regle:       { r: 58, hp: 1700, speed: 44, dmg: 1, xp: 100, agil: 1.2, boss: true }
};
function spawnEnemy(type, x, y) {
  const T = ETYPES[type];
  const scale = T.boss ? 1 + (G.endless ? 0.6 * Math.floor((G.t - 180) / 180 + 1) : 0) : 1 + G.t / 190 + CH().scale + (G.endless ? (G.t - 180) / 100 : 0);
  const meet = CH().meet[type];
  const frail = devoirHas('double') && !T.boss ? 0.55 : 1;   // interligne double : plus nombreuses, plus fragiles
  if (meet && !G.seen[type]) { G.seen[type] = true; caption(meet, 3.2, 'green'); }
  const e = {
    id: enemyId++, type, isBoss: !!T.boss, x, y, vx: 0, vy: 0, r: T.r, hp: T.hp * scale * frail, maxHp: T.hp * scale * frail, speed: T.speed * (1 + Math.min(0.35, G.t / 600)),
    dmg: T.dmg, xp: T.xp, agil: T.agil, shape: Math.floor(rnd((SHAPES[type] || [0]).length)), rot: rnd(TAU), spin: rnd(-1.5, 1.5),
    flash: 0, burn: 0, burnDps: 0, slow: 0, orbCd: 0, punchCd: 0, phase: 'walk', pt: rnd(1.5, 3), cx: 0, cy: 0, boilOff: rnd(3), atk: 2.5, atkN: 0, enter: 0
  };
  G.enemies.push(e);
  return e;
}
function spawnAround(type) {
  const viewR = Math.hypot(W, H) / ZOOM / 2 + 60;
  for (let i = 0; i < 10; i++) {
    const a = rnd(TAU), d = viewR + rnd(0, 120);
    const x = G.p.x + Math.cos(a) * d, y = G.p.y + Math.sin(a) * d;
    if (x > 30 && y > 30 && x < WORLD.w - 30 && y < WORLD.h - 30) return spawnEnemy(type, x, y);
  }
  // à défaut, depuis le bord de page le plus éloigné
  const x = G.p.x < WORLD.w / 2 ? WORLD.w - 40 : 40, y = rnd(40, WORLD.h - 40);
  return spawnEnemy(type, x, y);
}
function director(dt) {
  const t = G.t, ch = CH();
  if (G.boss && !G.endless) { G.spawnAcc += dt * 0.7; }
  else G.spawnAcc += dt * (devoirHas('double') ? 1.8 : 1) * Math.min(G.endless ? ch.rateCap + 3.5 : ch.rateCap, 0.9 + (t + ch.rateOff) * 0.03 + (G.endless ? (t - 180) * 0.02 : 0));
  while (G.spawnAcc >= 1) {
    G.spawnAcc -= 1;
    if (G.enemies.length > 240) break;
    spawnAround(ch.pick(t, rand()));
  }
  if (t >= G.nextWave && (!G.boss || G.endless)) {
    G.nextWave += 45;
    const n = 14 + Math.floor(t / 30) * 2;
    const ring = Math.min(W, H) / ZOOM * 0.62;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU;
      const x = clamp(G.p.x + Math.cos(a) * ring, 30, WORLD.w - 30), y = clamp(G.p.y + Math.sin(a) * ring, 30, WORLD.h - 30);
      spawnEnemy(ch.wave(t, i), x, y);
    }
    caption(ch.waveCap, 2.2, 'pink');
  }
  if (!G.bossSpawned && t >= devoirBossT()) {
    G.bossSpawned = true;
    const b = spawnAround(ch.boss); b.enter = 1; G.boss = b;
    caption(ch.bossIntro, 3.5, 'pink'); G.cam.shake = 14; AU.play(ch.bossSound);
  }
  if (G.endless && G.bossDefeated && !G.boss && t >= G.nextBossAt) {
    G.nextBossAt += 180; const b = spawnAround(ch.boss); G.boss = b; caption(ch.bossBack, 3, 'pink'); AU.play(ch.bossSound);
  }
}

function hurtEnemy(e, dmg, src, kx = 0, ky = 0) {
  if (e.dead) return;
  e.hp -= dmg; e.flash = 0.09;
  if (src === 'shot' && G.S.burn) { e.burn = 2.6; e.burnDps = 0.9 + 0.75 * G.S.burn; }
  if (G.S.knock && src === 'shot' && !e.isBoss) { const k = 70 + 60 * G.S.knock; e.vx += kx * k; e.vy += ky * k; }
  if (src !== 'burn' && src !== 'puddle' && src !== 'trail') AU.play('hit');
  if (e.hp <= 0) killEnemy(e);
}
function killEnemy(e) {
  e.dead = true; G.kills++;
  noteBestiaire(e.type);
  G.score += e.isBoss ? 2500 * G.chapter : Math.round(e.xp * 10);
  splat(e.x, e.y, e.r * (e.isBoss ? 1.6 : 0.9), C.ink, 0.16, e.isBoss ? 26 : 8);
  for (let i = 0; i < (e.isBoss ? 70 : 9); i++) {
    const a = rnd(TAU), s = rnd(60, e.isBoss ? 520 : 260);
    G.parts.push({ x: e.x, y: e.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.3, 0.8), max: 0.8, size: rnd(1.5, 4.5), color: i % 3 ? C.ink : C.graphite, drag: 4 });
  }
  if (e.isBoss) {
    G.boss = null; G.cam.shake = 26; AU.play('win');
    for (let i = 0; i < 40; i++) dropLetter(e.x + rnd(-80, 80), e.y + rnd(-80, 80), i % 4 === 0 ? 5 : 2);
    if (!G.bossDefeated) { G.bossDefeated = true; G.victoryAt = G.t + 1.6; unlockChapter(Math.min(CHAPTERS.length - 1, G.chapter + 1)); }
    return;
  }
  const paper = CH().paper;
  if (paper === 'portee') AU.play('noteKill', staffPitch(e.y)); else if (paper === 'milli') AU.play('mmKill'); else if (paper === 'carte') AU.play('carteKill'); else if (paper === 'calli') AU.play('calliKill'); else if (paper === 'garde') AU.play('gardeKill'); else AU.play('kill');
  if (e.type === 'tache') { for (let i = 0; i < 2; i++) { const g = spawnEnemy('gouttelette', e.x + rnd(-10, 10), e.y + rnd(-10, 10)); g.vx = rnd(-150, 150); g.vy = rnd(-150, 150); } }
  let v = e.xp;
  const n = v <= 2 ? v : 2 + (v > 4 ? 1 : 0);
  for (let i = 0; i < n; i++) { const share = Math.max(1, Math.round(v / (n - i))); v -= share; dropLetter(e.x + rnd(-8, 8), e.y + rnd(-8, 8), share); }
}
function dropLetter(x, y, value) {
  if (G.items.length > 320) { G.xp += value; return; }
  let ch = pick(LETTER_POOL), rare = false, need = false;
  const target = G.dicteeWord[G.dicteeProg];
  if (target && rand() < 0.1) { ch = target; need = true; }
  if (rand() < (devoirHas('pluie') ? 0.25 : 0.025)) { rare = true; value += 5; }
  G.items.push({ x, y, vx: rnd(-90, 90), vy: rnd(-90, 90), ch, value, rare, need, t: rnd(TAU), pull: false, rot: rnd(-0.4, 0.4) });
}

/* ===================== Joueur & entrées ===================== */
const keys = {};
function moveInput() {
  if (G.demo) return botInput();
  let x = 0, y = 0;
  if (keys.KeyA || keys.ArrowLeft) x -= 1; if (keys.KeyD || keys.ArrowRight) x += 1;
  if (keys.KeyW || keys.ArrowUp) y -= 1; if (keys.KeyS || keys.ArrowDown) y += 1;
  const j = G.input.joy;
  if (j && j.active) { const dx = j.x - j.ox, dy = j.y - j.oy, d = Math.hypot(dx, dy); if (d > 6) { const m = Math.min(1, d / (55 * U)); x = dx / d * m; y = dy / d * m; } }
  if (devoirHas('miroir')) x = -x;   // consigne du devoir : écrire en miroir
  const d = Math.hypot(x, y); if (d > 1) { x /= d; y /= d; }
  return { x, y, dash: !!G.input.dashQueued };
}
// Le pilote automatique des vidéos : teste 16 directions et prend la plus sûre (lettres et dictée en bonus)
function botInput() {
  const p = G.p, near = [], bul = [];
  for (const e of G.enemies) if (Math.abs(e.x - p.x) < 520 && Math.abs(e.y - p.y) < 520) near.push(e);
  for (const b of G.ebul) if (Math.abs(b.x - p.x) < 320 && Math.abs(b.y - p.y) < 320) bul.push(b);
  let goal = null, gd = 1e9;
  const need = G.dicteeWord[G.dicteeProg];
  for (const it of G.items) { const d = Math.hypot(it.x - p.x, it.y - p.y) - (it.ch === need ? 160 : 0) - (it.rare ? 80 : 0); if (d < gd && d < 520) { gd = d; goal = it; } }
  const rn = (G.refrain && G.refrain.notes[G.refrain.prog]) || figureTarget() || tresorTarget() || enluTarget() || sceauTarget() || lignesTarget();   // refrain, figure, trésor, lettrine, sceau et lignes passent avant les lettres
  const toSong = rn && Math.hypot(rn.x - p.x, rn.y - p.y) < 1600;
  if (toSong) goal = rn;
  if (!goal) goal = { x: WORLD.w / 2 + Math.cos(G.t * 0.21) * 700, y: WORLD.h / 2 + Math.sin(G.t * 0.17) * 420 };
  const gdx = goal.x - p.x, gdy = goal.y - p.y, gl = Math.hypot(gdx, gdy) || 1;
  const prev = G.botDir || { x: 1, y: 0 };
  let best = prev, bestS = -1e9, close = false;
  for (const e of near) if (Math.hypot(e.x - p.x, e.y - p.y) - e.r < 30) close = true;
  const ink = G.strokes.length || G.sigs.length ? calliNear(p.x, p.y) : null;   // encre fraîche et signature annoncée
  const garde = CH().paper === 'garde';   // rubans tendus, ombres des tampons et du Cartable
  for (let i = 0; i < 16; i++) {
    const a = i / 16 * TAU, dx = Math.cos(a), dy = Math.sin(a);
    let sc = 0;
    for (const look of [60, 140]) {
      const x = p.x + dx * look, y = p.y + dy * look, w = look === 60 ? 1 : 0.6;
      for (const e of near) {
        let d = Math.hypot(e.x - x, e.y - y) - e.r;
        if (e.type === 'regle') d = regleDist(e, x, y);
        else if (e.ghost) continue;
        if (e.type === 'compas' && e.phase !== 'walk') d = Math.min(d, Math.abs(Math.hypot(e.cx - x, e.cy - y) - e.Rt) - 10);
        if (e.type === 'biffure' && e.phase !== 'walk') d -= 40;
        if (e.type === 'metronome' && e.ticks % 4 === 3) d -= 150;
        sc -= w * (e.isBoss ? 5 : e.type === 'gomme' || e.type === 'metronome' || e.type === 'tourbillon' ? 1.6 : 1) * 2900 / Math.pow(Math.max(8, d), 1.8);
      }
      for (const b of bul) sc -= w * (b.wait > 0 ? 300 : 600) / Math.pow(Math.max(6, Math.hypot(b.x - x, b.y - y)), 1.5);
      for (const l of G.lines) if (l.t < l.warn + l.act) for (const a of [l.a, l.a + l.side * Math.PI / 2]) sc -= w * 700 / Math.pow(Math.max(6, segDist(x, y, l.x, l.y, l.x + Math.cos(a) * l.len, l.y + Math.sin(a) * l.len)), 1.4);
      for (const wv of G.waves) { const rr = wv.r * ease(wv.t / wv.dur); if (wv.t < wv.dur && !wv.hit) sc -= w * 900 / Math.pow(Math.max(6, Math.abs(Math.hypot(wv.x - x, wv.y - y) - rr)), 1.4); }
      if (G.tents.length || G.drops.length) sc -= w * carteDanger(x, y);
      if (ink) sc -= w * calliDanger(x, y, ink);
      if (garde) sc -= w * gardeDanger(x, y);
      const wm = Math.min(x, y, WORLD.w - x, WORLD.h - y);
      if (wm < 220) sc -= (220 - wm) * 0.03 * w;
    }
    sc += (dx * gdx + dy * gdy) / gl * (toSong ? 3 : 1.5);
    sc += (dx * prev.x + dy * prev.y) * 0.25;
    if (sc > bestS) { bestS = sc; best = { x: dx, y: dy }; }
  }
  G.botDir = best;
  if (tresorDigging() && !close && bestS > -6) { const X = tresorTarget(); return { x: (X.x - p.x) / 80, y: (X.y - p.y) / 80, dash: false }; }   // on reste sur le X pour creuser
  return { x: best.x, y: best.y, dash: close && p.dashCd <= 0 };
}
function stepPlayer(dt) {
  const p = G.p, S = G.S, inp = moveInput();
  G.input.dashQueued = false;
  if (inp.dash && p.dashCd <= 0 && !devoirHas('sansPate')) {
    let dx = inp.x, dy = inp.y; if (Math.hypot(dx, dy) < 0.2) { dx = Math.cos(p.face); dy = Math.sin(p.face); }
    const d = Math.hypot(dx, dy) || 1; p.vx = dx / d * 980; p.vy = dy / d * 980; p.dashT = 0.17; p.dashCd = S.dashCd; p.inv = Math.max(p.inv, 0.32); p.puddleT = 0;
    AU.play('dash'); G.cam.shake = Math.max(G.cam.shake, 3);
  }
  if (p.dashT > 0) {
    p.dashT -= dt; p.puddleT -= dt;
    if (p.puddleT <= 0) { p.puddleT = 0.045; G.puddles.push({ x: p.x, y: p.y, r: 30, life: 2.6, max: 2.6 }); splat(p.x, p.y, 16, C.ink, 0.07, 3); }
    if (p.dashT <= 0) endDash(p);
  } else {
    const tx = inp.x * S.speed, ty = inp.y * S.speed, k = 1 - Math.exp(-dt * 14);
    p.vx = lerp(p.vx, tx, k); p.vy = lerp(p.vy, ty, k);
  }
  const oy = p.y;
  p.x = clamp(p.x + p.vx * dt, p.r, WORLD.w - p.r); p.y = clamp(p.y + p.vy * dt, p.r, WORLD.h - p.r);
  if (CH().paper === 'portee') staffCross(oy, p.y);   // les lignes de la portée chantent quand on les traverse
  const sp = Math.hypot(p.vx, p.vy);
  if (sp > 20) { const f = Math.atan2(p.vy, p.vx); let df = f - p.face; while (df > Math.PI) df -= TAU; while (df < -Math.PI) df += TAU; p.face += df * Math.min(1, dt * 12); }
  p.squash = lerp(p.squash, Math.min(1, sp / 600), Math.min(1, dt * 10));
  p.inv = Math.max(0, p.inv - dt); p.dashCd = Math.max(0, p.dashCd - dt); p.hidden = Math.max(0, p.hidden - dt);
  if (rand() < sp / 600 * dt * 30) G.parts.push({ x: p.x - Math.cos(p.face) * 14, y: p.y - Math.sin(p.face) * 14, vx: rnd(-20, 20), vy: rnd(-20, 20), life: 0.5, max: 0.5, size: rnd(1, 2.6), color: C.ink, drag: 3 });
  // tir automatique sur la rature la plus proche
  p.fireCd -= dt;
  if (p.fireCd <= 0) {
    let tgt = null, bd = 600 * 600;
    for (const e of G.enemies) { let d = (e.x - p.x) ** 2 + (e.y - p.y) ** 2; if (e.ghost) continue; if (e.isBoss && d < 480 * 480) d *= 0.15; if (d < bd) { bd = d; tgt = e; } }
    if (tgt) {
      p.fireCd = 1 / S.rate;
      const lead = Math.sqrt(bd) / S.pspeed;
      const a = Math.atan2(tgt.y + tgt.vy * lead * 0.5 - p.y, tgt.x + tgt.vx * lead * 0.5 - p.x);
      p.look = a;
      const n = 1 + S.extra;
      for (let i = 0; i < n; i++) {
        const aa = a + (i - (n - 1) / 2) * 0.17;
        G.shots.push({ x: p.x + Math.cos(aa) * 12, y: p.y + Math.sin(aa) * 12, vx: Math.cos(aa) * S.pspeed, vy: Math.sin(aa) * S.pspeed, r: 5.5, life: 1.25, pierce: S.pierce, bounce: S.bounce, hit: new Set(), px: p.x, py: p.y });
      }
      AU.play('shoot');
    } else p.fireCd = 0.1;
  }
}
// Fin de pâté : les mots composés PLUME AU VENT et ENCRE SYMPATHIQUE y réagissent
function endDash(p) {
  if (lvl('PLUME_AU_VENT')) {
    const R = 175;
    G.rings.push({ x: p.x, y: p.y, t: 0, dur: 0.45, r: R, color: C.ink });
    query(p.x, p.y, R + 60, tmpA);
    for (const e of tmpA) {
      const dx = e.x - p.x, dy = e.y - p.y, d = Math.hypot(dx, dy) || 1;
      if (e.dead || d > R + e.r) continue;
      hurtEnemy(e, 5 * G.S.dmg, 'gust');
      if (!e.isBoss) { e.vx += dx / d * 620; e.vy += dy / d * 620; }
    }
    for (const b of G.ebul) if ((b.x - p.x) ** 2 + (b.y - p.y) ** 2 < R * R) b.life = 0;
    for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; G.parts.push({ x: p.x + Math.cos(a) * 20, y: p.y + Math.sin(a) * 20, vx: Math.cos(a) * 520, vy: Math.sin(a) * 520, life: 0.4, max: 0.4, size: 2.5, color: C.inkLight, drag: 5 }); }
    AU.play('gust'); G.cam.shake = Math.max(G.cam.shake, 6);
  }
  if (lvl('ENCRE_SYMPATHIQUE')) {
    p.hidden = 2; p.gx = p.x; p.gy = p.y; AU.play('vanish');
    addText(p.x, p.y - 28, 'invisible', C.inkLight, 22);
  }
}
function hurtPlayer(n, fromX, fromY) {
  const p = G.p; if (p.inv > 0 || G.state !== 'play') return;
  p.hp -= n; p.inv = 1.1; G.cam.shake = 12; AU.play('hurt');
  splat(p.x, p.y, 20, C.ink, 0.2, 10);
  const dx = p.x - fromX, dy = p.y - fromY, d = Math.hypot(dx, dy) || 1; p.vx += dx / d * 380; p.vy += dy / d * 380;
  for (const e of G.enemies) { const ex = e.x - p.x, ey = e.y - p.y, ed = Math.hypot(ex, ey); if (ed < 120 && !e.isBoss) { e.vx += ex / ed * 260; e.vy += ey / ed * 260; } }
  if (p.hp <= 0) endRun(false);
}

/* ===================== Simulation ===================== */
let grid = new Map();
const CELL = 64;
function buildGrid() {
  grid = new Map();
  for (const e of G.enemies) { const k = ((e.x / CELL) | 0) + ((e.y / CELL) | 0) * 1000; let a = grid.get(k); if (!a) grid.set(k, a = []); a.push(e); }
}
function query(x, y, r, out) {
  out.length = 0; const x0 = ((x - r) / CELL) | 0, x1 = ((x + r) / CELL) | 0, y0 = ((y - r) / CELL) | 0, y1 = ((y + r) / CELL) | 0;
  for (let cy = y0; cy <= y1; cy++) for (let cx = x0; cx <= x1; cx++) { const a = grid.get(cx + cy * 1000); if (a) for (const e of a) out.push(e); }
  return out;
}
const tmpA = [], tmpB = [];

function stepPlay(dt) {
  if (Math.floor(G.t + dt) > Math.floor(G.t)) dryStains(0.018);   // une fois par seconde
  G.t += dt;
  const p = G.p, S = G.S;
  stepPlayer(dt);
  director(dt);
  buildGrid();
  G.pullX = 0; G.pullY = 0;
  // ---- ennemis
  for (const e of G.enemies) {
    if (e.dead) continue;
    e.flash = Math.max(0, e.flash - dt); e.orbCd -= dt; e.punchCd -= dt;
    if (e.burn > 0) { e.burn -= dt; hurtEnemy(e, e.burnDps * dt, 'burn'); if (rand() < dt * 12) G.parts.push({ x: e.x + rnd(-e.r, e.r) * 0.6, y: e.y + rnd(-e.r, e.r) * 0.6, vx: 0, vy: rnd(-60, -20), life: 0.4, max: 0.4, size: rnd(2, 4), color: C.fire, drag: 1 }); if (e.dead) continue; }
    let slow = 1;
    for (const pd of G.puddles) if ((e.x - pd.x) ** 2 + (e.y - pd.y) ** 2 < (pd.r + e.r * 0.5) ** 2) { slow = 0.55; break; }
    // invisible (encre sympathique) : les ratures foncent vers l'endroit où tu as disparu, puis tournent en rond
    const hid = p.hidden > 0, aimX = hid ? p.gx + Math.cos(G.t * 1.3 + e.id) * 90 : p.x, aimY = hid ? p.gy + Math.sin(G.t * 1.1 + e.id) * 90 : p.y;
    const dx = aimX - e.x, dy = aimY - e.y, d = Math.hypot(dx, dy) || 1;
    let tx = dx / d * e.speed * slow, ty = dy / d * e.speed * slow, agil = e.agil;
    if (e.type === 'gribouillis' || e.type === 'gouttelette') { const w = Math.sin(G.t * 3 + e.id) * 0.5; tx += -dy / d * e.speed * w; ty += dx / d * e.speed * w; }
    if (e.type === 'biffure') {
      e.pt -= dt;
      if (e.phase === 'walk' && e.pt <= 0 && d < 520 && !hid) { e.phase = 'aim'; e.pt = 0.6; e.cx = dx / d; e.cy = dy / d; }
      else if (e.phase === 'aim') { tx = 0; ty = 0; e.cx = lerp(e.cx, dx / d, dt * 3); e.cy = lerp(e.cy, dy / d, dt * 3); if (e.pt <= 0) { e.phase = 'charge'; e.pt = 0.5; const n = Math.hypot(e.cx, e.cy) || 1; e.cx /= n; e.cy /= n; } }
      else if (e.phase === 'charge') { tx = e.cx * 430; ty = e.cy * 430; agil = 20; if (e.pt <= 0) { e.phase = 'walk'; e.pt = rnd(2, 3.4); } }
      else if (e.phase === 'walk' && e.pt <= 0) e.pt = 0.5;
      e.rot = Math.atan2(e.phase === 'walk' ? ty : e.cy, e.phase === 'walk' ? tx : e.cx);
    } else if (e.type === 'gomme') {
      if (rand() < dt * 20) eraseStain(e.x, e.y, 30);
      e.rot = Math.atan2(ty, tx) * 0.15 + Math.sin(G.t * 4 + e.id) * 0.12;
    } else if (e.type === 'regle') {
      stepRegle(e, dt, dx, dy, d, slow); tx = MV.x; ty = MV.y; agil = MV.agil;
    } else if (e.type === 'pieuvre') {
      stepPieuvre(e, dt, dx, dy, d, slow); tx = MV.x; ty = MV.y; agil = MV.agil;
    } else if (e.type === 'paraphe') {
      stepParaphe(e, dt, dx, dy, d, slow); tx = MV.x; ty = MV.y; agil = MV.agil;
    } else if (e.type === 'cartable') {
      stepCartable(e, dt, dx, dy, d, slow); tx = MV.x; ty = MV.y; agil = MV.agil;
    } else if (e.isBoss) {
      if (e.type === 'boss') stepBoss(e, dt, dx, dy, d); else stepFausse(e, dt, dx, dy, d);
      tx = e.phase === 'charge' ? e.cx * 520 : (e.phase === 'aim' ? 0 : dx / d * e.speed * slow);
      ty = e.phase === 'charge' ? e.cy * 520 : (e.phase === 'aim' ? 0 : dy / d * e.speed * slow);
      if (e.phase === 'charge') agil = 18;
      e.rot += dt * (e.hp < e.maxHp / 2 ? 1.6 : 0.8);
    } else if (e.type === 'croche' || e.type === 'soupir' || e.type === 'metronome') {
      stepPortee(e, dt, dx, dy, d, slow, hid); tx = MV.x; ty = MV.y; agil = MV.agil;
    } else if (MILLI_TYPES.has(e.type)) {
      stepMilli(e, dt, dx, dy, d, slow, hid); tx = MV.x; ty = MV.y; agil = MV.agil;
    } else if (CARTE_TYPES.has(e.type)) {
      stepCarte(e, dt, dx, dy, d, slow, hid); tx = MV.x; ty = MV.y; agil = MV.agil;
    } else if (CALLI_TYPES.has(e.type)) {
      stepCalli(e, dt, dx, dy, d, slow, hid); tx = MV.x; ty = MV.y; agil = MV.agil;
    } else if (GARDE_TYPES.has(e.type)) {
      stepGarde(e, dt, dx, dy, d, slow, hid); tx = MV.x; ty = MV.y; agil = MV.agil;
    } else e.rot += e.spin * dt;
    const k = 1 - Math.exp(-dt * agil);
    e.vx = lerp(e.vx, tx, k); e.vy = lerp(e.vy, ty, k);
    // séparation
    query(e.x, e.y, e.r + 30, tmpA);
    for (const o of tmpA) {
      if (o === e || o.dead) continue;
      const ox = e.x - o.x, oy = e.y - o.y, od = ox * ox + oy * oy, rr = e.r + o.r;
      if (od < rr * rr && od > 0.01) { const dd = Math.sqrt(od), push = (rr - dd) / rr * (o.isBoss ? 600 : 160); e.vx += ox / dd * push * dt * 10; e.vy += oy / dd * push * dt * 10; }
    }
    e.x = clamp(e.x + e.vx * dt, -40, WORLD.w + 40); e.y = clamp(e.y + e.vy * dt, -40, WORLD.h + 40);
    // contact avec le joueur
    if (!e.ghost && (p.x - e.x) ** 2 + (p.y - e.y) ** 2 < (e.r + p.r - 3) ** 2) hurtPlayer(e.dmg, e.x, e.y);
  }
  applyPull(dt);   // tourbillons et Pieuvre-Buvard
  stepDevoir(dt);   // courant d'air, page propre
  // ---- gouttes du joueur
  for (const s of G.shots) {
    s.px = s.x; s.py = s.y; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
    if (s.x < -50 || s.y < -50 || s.x > WORLD.w + 50 || s.y > WORLD.h + 50) s.life = 0;
    if (s.life <= 0) continue;
    query(s.x, s.y, s.r + 80, tmpA);
    for (const e of tmpA) {
      if (e.dead || e.ghost || s.hit.has(e.id)) continue;
      const rr = e.r + s.r; if ((e.x - s.x) ** 2 + (e.y - s.y) ** 2 > rr * rr) continue;
      const sp = Math.hypot(s.vx, s.vy) || 1;
      hurtEnemy(e, S.dmg, 'shot', s.vx / sp, s.vy / sp); s.hit.add(e.id);
      G.parts.push({ x: s.x, y: s.y, vx: rnd(-80, 80), vy: rnd(-80, 80), life: 0.3, max: 0.3, size: rnd(1.5, 3), color: C.ink, drag: 5 });
      if (s.bounce > 0) {
        s.bounce--; let nt = null, nd = 340 * 340;
        query(s.x, s.y, 340, tmpB);
        for (const o of tmpB) { if (o.dead || s.hit.has(o.id)) continue; const od = (o.x - s.x) ** 2 + (o.y - s.y) ** 2; if (od < nd) { nd = od; nt = o; } }
        if (nt) { const a = Math.atan2(nt.y - s.y, nt.x - s.x); s.vx = Math.cos(a) * sp; s.vy = Math.sin(a) * sp; s.life = Math.max(s.life, 0.7); continue; }
      }
      if (s.pierce > 0) { s.pierce--; continue; }
      s.life = 0; break;
    }
  }
  G.shots = G.shots.filter(s => s.life > 0);
  // ---- projectiles ennemis (traits de stylo rouge)
  for (const b of G.ebul) {
    if (b.wait > 0) { b.wait -= dt; continue; }   // annoncée, pas encore partie
    b.x += b.vx * dt; b.y += b.vy * dt; b.life -= dt;
    if ((b.x - p.x) ** 2 + (b.y - p.y) ** 2 < (p.r + 5) ** 2) { hurtPlayer(1, b.x, b.y); b.life = 0; }
  }
  G.ebul = G.ebul.filter(b => b.life > 0);
  for (const wv of G.waves) {   // ondes du métronome : on est touché quand le cercle passe sur soi
    wv.t += dt; const rr = wv.r * ease(wv.t / wv.dur);
    if (!wv.hit && wv.t < wv.dur && Math.abs(Math.hypot(p.x - wv.x, p.y - wv.y) - rr) < p.r + 9) { wv.hit = true; hurtPlayer(1, wv.x, wv.y); }
  }
  G.waves = G.waves.filter(wv => wv.t < wv.dur + 0.25);
  stepLines(dt);   // angles droits des équerres
  stepCarteFx(dt);   // tentacules et pluie de pâtés
  stepCalliFx(dt);   // l'encre fraîche des plumes (et des peignes)
  stepGardeFx(dt);   // les rubans des signets
  stepUnions(dt);   // CALLIGRAPHIE, CITATION, LUNE ROUSSE
  // ---- lunes en orbite
  if (S.moons) {
    G.moonA += dt * 2.7; const R = 74 + 6 * S.moons;
    for (let i = 0; i < S.moons; i++) {
      const a = G.moonA + i / S.moons * TAU, mx = p.x + Math.cos(a) * R, my = p.y + Math.sin(a) * R;
      query(mx, my, 90, tmpA);
      for (const e of tmpA) if (!e.dead && e.orbCd <= 0 && (e.x - mx) ** 2 + (e.y - my) ** 2 < (e.r + 13) ** 2) {
        e.orbCd = 0.33; hurtEnemy(e, (1.6 + 0.5 * S.moons) * S.dmg, 'moon', Math.cos(a), Math.sin(a));
        if (lvl('ECHO_DE_LUNE')) moonEcho(mx, my, e);
        if (lvl('LUNE_ROUSSE')) moonFire(e, mx, my);
      }
    }
  }
  // ---- flaques d'encre (pâtés)
  for (const pd of G.puddles) {
    pd.life -= dt;
    query(pd.x, pd.y, pd.r + 80, tmpA);
    for (const e of tmpA) if (!e.dead && (e.x - pd.x) ** 2 + (e.y - pd.y) ** 2 < (pd.r + e.r * 0.5) ** 2) hurtEnemy(e, 2.4 * S.dmg * dt, 'puddle');
  }
  G.puddles = G.puddles.filter(pd => pd.life > 0);
  // ---- POINT final
  if (S.point) {
    G.pointCd -= dt;
    if (G.pointCd <= 0 && G.enemies.length) {
      G.pointCd = Math.max(3, 8 - (S.point - 1) * 1.1);
      let best = null, bn = -1;
      for (let i = 0; i < 7; i++) { const e = pick(G.enemies); if (e.dead || Math.hypot(e.x - p.x, e.y - p.y) > 560) continue; const n = query(e.x, e.y, 110, tmpA).length; if (n > bn) { bn = n; best = e; } }
      if (best) {
        G.points.push({ x: best.x, y: best.y, t: 0, fall: 0.55, r: 88 + 14 * S.point, dmg: (7 + 4 * S.point) * S.dmg });
        if (lvl('POINT_VIRGULE')) {
          // la virgule tombe juste après, sur l'attroupement suivant
          let b2 = null, bn2 = -1;
          for (let i = 0; i < 7; i++) { const e = pick(G.enemies); if (e.dead || e === best || Math.hypot(e.x - best.x, e.y - best.y) < 140 || Math.hypot(e.x - p.x, e.y - p.y) > 600) continue; const n = query(e.x, e.y, 110, tmpA).length; if (n > bn2) { bn2 = n; b2 = e; } }
          const tx = b2 ? b2.x : best.x + rnd(-120, 120), ty = b2 ? b2.y : best.y + 150;
          G.points.push({ x: tx, y: ty, t: -0.35, fall: 0.55, r: (88 + 14 * S.point) * 0.8, dmg: (7 + 4 * S.point) * S.dmg * 0.8, comma: true });
        }
      }
    }
  }
  for (const pt of G.points) {
    pt.t += dt;
    if (!pt.done && pt.t >= pt.fall) {
      pt.done = true; G.cam.shake = Math.max(G.cam.shake, 10); AU.play('point'); splat(pt.x, pt.y, pt.r * 0.4, C.inkDeep, 0.3, 14);
      query(pt.x, pt.y, pt.r + 80, tmpA);
      for (const e of tmpA) { const d = Math.hypot(e.x - pt.x, e.y - pt.y); if (!e.dead && d < pt.r + e.r) hurtEnemy(e, pt.dmg, 'point', (e.x - pt.x) / (d || 1), (e.y - pt.y) / (d || 1)); }
      for (let i = 0; i < 26; i++) { const a = rnd(TAU), s = rnd(120, 420); G.parts.push({ x: pt.x, y: pt.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: rnd(0.3, 0.7), max: 0.7, size: rnd(2, 5), color: C.inkDeep, drag: 4 }); }
      if (lvl('POINT_DE_FEU')) { G.fires.push({ x: pt.x, y: pt.y, r: pt.r * 0.85, life: 3, max: 3, seed: rnd(TAU) }); AU.play('fire'); }
    }
  }
  G.points = G.points.filter(pt => pt.t < pt.fall + 0.6);
  for (const f of G.fires) {
    f.life -= dt;
    query(f.x, f.y, f.r + 80, tmpA);
    for (const e of tmpA) if (!e.dead && (e.x - f.x) ** 2 + (e.y - f.y) ** 2 < (f.r + e.r * 0.5) ** 2) { hurtEnemy(e, 3.2 * S.dmg * dt, 'burn'); if (e.burn < 0.6) { e.burn = 1.2; e.burnDps = Math.max(e.burnDps, 1.5); } }
    if (rand() < dt * 30) { const a = rnd(TAU), rr = Math.sqrt(rand()) * f.r; G.parts.push({ x: f.x + Math.cos(a) * rr, y: f.y + Math.sin(a) * rr, vx: rnd(-10, 10), vy: rnd(-90, -40), life: 0.5, max: 0.5, size: rnd(2.5, 5), color: C.fire, drag: 1 }); }
  }
  G.fires = G.fires.filter(f => f.life > 0);
  for (const r of G.rings) r.t += dt;
  G.rings = G.rings.filter(r => r.t < r.dur);
  stepRefrain(dt);
  stepFigure(dt);
  stepTresor(dt);
  stepEnlu(dt);
  stepSceau(dt);
  stepLignes(dt);
  for (const c of G.coins) c.t += dt;
  G.coins = G.coins.filter(c => c.t < c.dur);
  for (const sg of G.songs) sg.t += dt;
  G.songs = G.songs.filter(sg => sg.t < sg.dur);
  G.enemies = G.enemies.filter(e => !e.dead);
  // ---- lettres
  G.comboT -= dt; if (G.comboT <= 0) G.comboN = 0;
  for (const it of G.items) {
    it.t += dt;
    const dx = p.x - it.x, dy = p.y - it.y, d = Math.hypot(dx, dy) || 1;
    if (d < S.magnet || it.pull) { it.pull = true; const s = 260 + (1 - Math.min(1, d / S.magnet)) * 600 + it.t * 40; it.vx = lerp(it.vx, dx / d * s, Math.min(1, dt * 9)); it.vy = lerp(it.vy, dy / d * s, Math.min(1, dt * 9)); }
    else if (it.t > 6) { const s = Math.min(70, (it.t - 6) * 12); it.vx = lerp(it.vx, dx / d * s, Math.min(1, dt * 3)); it.vy = lerp(it.vy, dy / d * s, Math.min(1, dt * 3)); } // les lettres oubliées veulent être écrites
    else { it.vx *= Math.exp(-dt * 4); it.vy *= Math.exp(-dt * 4); }
    it.x += it.vx * dt; it.y += it.vy * dt;
    if (d < p.r + 10) { it.got = true; collect(it); }
  }
  G.items = G.items.filter(it => !it.got);
  // ---- divers
  stepParticles(dt);
  if (G.victoryAt && G.t >= G.victoryAt) { G.victoryAt = 0; endRun(true); }
  if (G.pendingLv > 0 && G.state === 'play') openLevelUp();
}
// ÉCHO DE LUNE : la lune renvoie une goutte vers la rature voisine la plus proche
function moonEcho(x, y, from) {
  let nt = null, nd = 360 * 360;
  query(x, y, 360, tmpB);
  for (const o of tmpB) { if (o.dead || o === from) continue; const od = (o.x - x) ** 2 + (o.y - y) ** 2; if (od < nd) { nd = od; nt = o; } }
  if (!nt) return;
  const a = Math.atan2(nt.y - y, nt.x - x), sp = G.S.pspeed * 1.1;
  G.shots.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, r: 4.5, life: 0.9, pierce: 0, bounce: 1 + Math.floor(G.S.bounce / 2), hit: new Set([from.id]), px: x, py: y, echo: true });
}
function stepBoss(e, dt, dx, dy, d) {
  if (e.enter > 0) { e.enter = Math.max(0, e.enter - dt * 0.5); }
  const enraged = e.hp < e.maxHp / 2;
  e.atk -= dt;
  if (e.phase === 'aim') { e.pt -= dt; e.cx = lerp(e.cx, dx / d, dt * 2); e.cy = lerp(e.cy, dy / d, dt * 2); if (e.pt <= 0) { e.phase = 'charge'; e.pt = 0.7; const n = Math.hypot(e.cx, e.cy) || 1; e.cx /= n; e.cy /= n; } return; }
  if (e.phase === 'charge') { e.pt -= dt; if (e.pt <= 0) { e.phase = 'walk'; } return; }
  if (e.atk <= 0) {
    e.atkN++;
    if (enraged && e.atkN % 3 === 0) { e.phase = 'aim'; e.pt = 0.8; e.cx = dx / d; e.cy = dy / d; e.atk = 1.9; caption('Elle charge !', 1.2, 'pink'); return; }
    if (enraged && e.atkN % 3 === 1) {
      for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + G.t; spawnEnemy('gribouillis', e.x + Math.cos(a) * 95, e.y + Math.sin(a) * 95); }
      e.atk = 2.1; return;
    }
    const n = enraged ? 16 : 11, off = rnd(TAU);
    for (let i = 0; i < n; i++) { const a = off + i / n * TAU; G.ebul.push({ x: e.x + Math.cos(a) * 60, y: e.y + Math.sin(a) * 60, vx: Math.cos(a) * 205, vy: Math.sin(a) * 205, life: 4, a }); }
    AU.play('bossShot'); e.atk = enraged ? 1.9 : 2.7;
  }
}
function collect(it) {
  G.letters++; G.xp += it.value; G.score += it.value * 3;
  G.comboN++; G.comboT = 1.1;
  const target = G.dicteeWord[G.dicteeProg];
  if (target && it.ch === target) {
    G.dicteeProg++; AU.play('dictee', G.dicteeProg);
    if (G.dicteeProg >= G.dicteeWord.length) {
      G.dictees++; G.score += 150 * G.dicteeWord.length; AU.play('dicteeDone');
      caption('Dictée réussie : ' + G.dicteeWord + ' !', 2.6, 'green');
      G.p.hp = Math.min(G.p.maxHp, G.p.hp + 1); G.xp += 6 + G.dicteeWord.length * 2;
      G.dicteeIdx++; G.dicteeWord = CH().dictees[G.dicteeIdx % CH().dictees.length]; G.dicteeProg = 0;
    }
  } else AU.play('pickup', Math.min(10, G.comboN >> 1));
  while (G.xp >= G.xpNext) { G.xp -= G.xpNext; G.level++; G.xpNext = xpFor(G.level); G.pendingLv++; }
}
function stepParticles(dt) {
  for (const q of G.parts) { q.life -= dt; q.x += q.vx * dt; q.y += q.vy * dt; const k = Math.exp(-dt * (q.drag || 2)); q.vx *= k; q.vy *= k; }
  G.parts = G.parts.filter(q => q.life > 0);
  if (G.parts.length > 900) G.parts.splice(0, G.parts.length - 900);
  for (const t of G.texts) t.t += dt;
  G.texts = G.texts.filter(t => t.t < t.dur);
}

/* ===================== Niveaux ===================== */
function composeReady(k) { return isCompose(k) && !lvl(k) && MOTS[k].from.every(f => lvl(f) >= 2); }
function openLevelUp() {
  const avail = Object.keys(MOTS).filter(k => !isCompose(k) && lvl(k) < MOTS[k].max && !(k === 'SOUFFLE' && G.p.hp === G.p.maxHp && rand() < 0.5));
  const ready = Object.keys(MOTS).filter(composeReady);
  if (!avail.length && !ready.length) { G.pendingLv = 0; G.p.hp = G.p.maxHp; return; }
  const ch = [];
  // un mot composé disponible est toujours proposé (un seul à la fois), à une place au hasard
  const comp = ready.length ? pick(ready) : null;
  while (ch.length < (comp ? 2 : 3) && avail.length) { const i = Math.floor(rand() * avail.length); ch.push(avail.splice(i, 1)[0]); }
  if (comp) ch.splice(Math.floor(rand() * (ch.length + 1)), 0, comp);
  G.choices = ch; G.sel = 0; G.state = 'levelup'; G.stateT = 0; G.botPickT = 1.25; AU.play('level');
  for (let i = 0; i < 24; i++) { const a = rnd(TAU), s = rnd(100, 300); G.parts.push({ x: G.p.x, y: G.p.y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, life: 0.6, max: 0.6, size: rnd(2, 4), color: '#e8c22a', drag: 3 }); }
  setUI();
}
function chooseMot(i) {
  const k = G.choices[i]; if (!k) return;
  G.mots[k] = lvl(k) + 1; if (!G.motOrder.includes(k)) G.motOrder.push(k);
  if (k === 'SOUFFLE') { G.p.maxHp++; G.p.hp = G.p.maxHp; }
  computeStats();
  if (isCompose(k)) {
    AU.play('fusion'); G.cam.shake = Math.max(G.cam.shake, 8);
    caption('Mot composé : ' + MOTS[k].from.map(f => MOTS[f].label).join(' + ') + ' = ' + MOTS[k].label, 3.2, 'green');
    noteUnion(k);
    G.rings.push({ x: G.p.x, y: G.p.y, t: 0, dur: 0.7, r: 220, color: C.gold });
    for (let i = 0; i < 40; i++) { const a = rnd(TAU), sp = rnd(140, 420); G.parts.push({ x: G.p.x, y: G.p.y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0.9, max: 0.9, size: rnd(2, 5), color: i % 2 ? C.gold : C.ink, drag: 3 }); }
  } else AU.play('choose');
  addText(G.p.x, G.p.y - 30, MOTS[k].label + (G.mots[k] > 1 ? ' ' + G.mots[k] : ''), isCompose(k) ? C.gold : C.ink, 30);
  G.pendingLv--; G.state = 'play'; G.stateT = 0; G.p.inv = Math.max(G.p.inv, 0.6);
  if (G.pendingLv > 0) openLevelUp();
  setUI();
}
const BOT_PRIORITY = ['POINT_VIRGULE', 'CITATION', 'ECHO_DE_LUNE', 'LUNE_ROUSSE', 'POINT_DE_FEU', 'CALLIGRAPHIE', 'PLUME_AU_VENT', 'ENCRE_SYMPATHIQUE', 'LUNE', 'GUILLEMETS', 'VIRGULE', 'ENCRE', 'POINT', 'ECHO', 'FEU', 'SOUFFLE', 'ITALIQUE', 'PLUME', 'AIMANT', 'VENT'];

/* ===================== Fins de partie ===================== */
function phrase(win) {
  const weight = k => lvl(k) + (isCompose(k) ? 10 : 0);   // les mots composés ont la vedette
  const ws = G.motOrder.slice().sort((a, b) => weight(b) - weight(a)).map(k => MOTS[k].frag);
  const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
  if (!ws.length) return 'Une page presque blanche.';
  if (ws.length === 1) return win ? cap(ws[0]) + ' tint bon, jusqu’au point final.' : 'Il ne restait que ' + ws[0] + '.';
  if (win && G.chapter === 6) return pick(['Grâce à ' + ws[0] + ', le Cartable rendit toutes ses affaires.', cap(ws[0]) + ' et ' + ws[1] + ' scellèrent la dernière page du cahier.']);
  if (win && G.chapter === 5) return pick(['Grâce à ' + ws[0] + ', le Grand Paraphe posa enfin sa plume.', cap(ws[0]) + ' et ' + ws[1] + ' signèrent la page, en pleins et en déliés.']);
  if (win && G.chapter === 4) return pick(['Grâce à ' + ws[0] + ', la Pieuvre-Buvard rendit toute son encre.', cap(ws[0]) + ' et ' + ws[1] + ' trouvèrent le trésor, juste sous le X.']);
  if (win && G.chapter === 3) return pick(['Grâce à ' + ws[0] + ', la Règle de fer plia enfin.', cap(ws[0]) + ' et ' + ws[1] + ' tracèrent le dernier trait, bien droit.']);
  if (win && G.chapter === 2) return pick(['Grâce à ' + ws[0] + ', la Fausse Note retrouva le ton.', cap(ws[0]) + ' et ' + ws[1] + ' jouèrent juste jusqu’à la dernière mesure.']);
  if (win) return pick([cap(ws[0]) + ' et ' + ws[1] + ' tinrent la page jusqu’au bout.', 'Grâce à ' + ws[0] + ', ' + ws[1] + ' eut le dernier mot.']);
  return pick(['Ici, ' + ws[0] + ' croisa ' + ws[1] + ', puis tout fut raturé.', cap(ws[0]) + ' et ' + ws[1] + ' ont presque suffi.', 'On devinait encore ' + ws[0] + ' sous la gomme.']);
}
function endRun(win) {
  G.state = win ? 'victory' : 'gameover'; G.stateT = 0;
  G.score += Math.floor(G.t) * 5;
  G.endPhrase = phrase(win);
  saveBestiaire();
  if (G.devoir) gradeDevoir(win);
  else if (!G.demo && G.score > G.best) { G.best = G.score; G.newBest = true; try { localStorage.setItem('inacheve.best', String(G.best)); } catch (e) { /* rien */ } }
  if (!win) { AU.play('lose'); splat(G.p.x, G.p.y, 50, C.ink, 0.35, 20); }
  setUI();
}
