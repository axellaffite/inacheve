// Boucle, entrées clavier/souris/tactile, carnet de bord, démarrage et API de capture (window.__cap).
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

/* ===================== Boucle ===================== */
function initTitle() {
  G.state = 'title'; G.stateT = 0; G.deco = []; clearStains();   // une page propre pour le titre, même au retour d'une partie
  for (let i = 0; i < 16; i++) {
    const type = pick(['gribouillis', 'gribouillis', 'biffure', 'tache', 'gouttelette']);
    const T = ETYPES[type];
    G.deco.push({ type, x: WORLD.w / 2 + rnd(-900, 900), y: WORLD.h / 2 + rnd(-520, 520), vx: rnd(-30, 30), vy: rnd(-30, 30), r: T.r, shape: Math.floor(rnd(6)), rot: rnd(TAU), spin: rnd(-0.6, 0.6), boilOff: rnd(3), flash: 0, phase: 'walk', cx: 0, cy: 0 });
  }
  G.cam.x = WORLD.w / 2; G.cam.y = WORLD.h / 2;
  setUI();
}
function update(dt) {
  G.time += dt; G.stateT += dt;
  if (G.state !== 'levelup') { for (const c of G.captions) c.t += dt; G.captions = G.captions.filter(c => c.t < c.dur); }
  if (G.state === 'bureau') { stepBureau(dt); return; }
  if (G.state === 'title') {
    for (const d of G.deco) { d.x += d.vx * dt; d.y += d.vy * dt; d.rot += d.spin * dt; if (Math.abs(d.x - WORLD.w / 2) > 950) d.vx *= -1; if (Math.abs(d.y - WORLD.h / 2) > 560) d.vy *= -1; }
    G.cam.x = WORLD.w / 2 + Math.sin(G.time * 0.08) * 120; G.cam.y = WORLD.h / 2 + Math.cos(G.time * 0.06) * 60;
    return;
  }
  if (G.state === 'bestiaire') {
    G.bestFlip += dt;
    if (G.bestFrom === 'title') { for (const d of G.deco) { d.x += d.vx * dt; d.y += d.vy * dt; d.rot += d.spin * dt; } }
    return;
  }
  if (G.state === 'play') { stepPlay(dt); stepBestToasts(dt); }
  else if (G.state === 'levelup') {
    if (G.demo) {
      G.botPickT -= dt;
      const best = G.choices.map(k => BOT_PRIORITY.indexOf(k)).reduce((bi, v, i, arr) => v < arr[bi] ? i : bi, 0);
      if (G.botPickT < 0.7) G.sel = best;
      if (G.botPickT <= 0) chooseMot(best);
    }
  } else if (G.state === 'gameover' || G.state === 'victory') stepParticles(dt);
  else if (G.state === 'turn' && G.stateT >= TURN_DUR) { G.state = 'play'; G.stateT = 0; setUI(); }
  // caméra
  if (G.p && G.state !== 'title') {
    const vw = W / ZOOM, vh = H / ZOOM, m = 230;
    let tx = G.p.x, ty = G.p.y;
    tx = vw > WORLD.w + 2 * m ? WORLD.w / 2 : clamp(tx, vw / 2 - m, WORLD.w - vw / 2 + m);
    ty = vh > WORLD.h + 2 * m ? WORLD.h / 2 : clamp(ty, vh / 2 - m, WORLD.h - vh / 2 + m);
    const k = 1 - Math.exp(-dt * 7); G.cam.x = lerp(G.cam.x, tx, k); G.cam.y = lerp(G.cam.y, ty, k);
  }
  G.cam.shake = Math.max(0, G.cam.shake - dt * 40);
}
let lastT = 0;
function frame(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000 || 0.016); lastT = now;
  update(dt * G.speed); render();
  if (G.chapter >= 5 && G.state !== 'title' && !marbleCv) marbleWork(6);   // le papier marbré du chapitre VI se prépare en douce
  AU.tick(G.state === 'play' ? Math.min(1, G.t / 180) : 0.1, !!G.boss && G.state === 'play', musicChapter());
  requestAnimationFrame(frame);
}

/* ===================== Entrées & interface ===================== */
function setUI() {
  if (CAPTURE) { document.getElementById('ui').classList.add('hidden'); return; }
  const showUI = G.state === 'title' || G.state === 'pause' || G.state === 'gameover' || G.state === 'victory';
  document.getElementById('ui').classList.toggle('hidden', !showUI);
  document.getElementById('btnPause').classList.toggle('show', G.input.touch && G.state === 'play');
  document.getElementById('btnSound').textContent = 'Son : ' + (AU.muted ? 'coupé' : 'activé');
  document.getElementById('btnCalm').textContent = 'Secousses : ' + (G.calm ? 'non' : 'oui');
  document.getElementById('btnSpeed').textContent = 'Vitesse : ' + speedLabel();
  document.getElementById('btnDevoir').classList.toggle('hidden', G.state !== 'title');
  document.getElementById('btnTitre').classList.toggle('hidden', !(G.state === 'pause' || G.state === 'gameover' || G.state === 'victory'));
  document.getElementById('btnBureau').classList.toggle('hidden', G.state !== 'title');
}
function primaryAction() {
  AU.init();
  if (G.state === 'title') newGame(false);
  else if (G.state === 'pause') { G.state = 'play'; setUI(); }
  else if ((G.state === 'gameover' || G.state === 'victory') && G.stateT > 0.8 && G.devoir) startDevoir(false);   // on refait le devoir
  else if (G.state === 'gameover' && G.stateT > 0.8) newGame(false, G.startChapter);
  else if (G.state === 'victory' && G.stateT > 0.8 && G.chapter < CHAPTERS.length - 1) turnPage();
  else if (G.state === 'victory' && G.stateT > 0.8) { G.state = 'play'; G.endless = true; G.nextWave = G.t + 20; G.nextBossAt = G.t + 180; caption('Page libre : jusqu’où iras-tu ?', 3); setUI(); }
}
function togglePause() {
  if (G.state === 'play') { G.state = 'pause'; G.stateT = 0; } else if (G.state === 'pause') G.state = 'play';
  setUI();
}
function restartRun() { if (G.devoir) startDevoir(false); else newGame(false, G.startChapter); }
function goTitle() { saveBestiaire(); G.devoir = null; G.p = null; G.chapter = 1; initTitle(); }
// vitesse du jeu (accessibilité) : 100 %, 80 % ou 60 %
const SPEEDS = [1, 0.8, 0.6];
try { G.speed = CAPTURE ? 1 : SPEEDS.includes(parseFloat(localStorage.getItem('inacheve.vitesse'))) ? parseFloat(localStorage.getItem('inacheve.vitesse')) : 1; } catch (e) { G.speed = 1; }
const speedLabel = () => Math.round(G.speed * 100) + '\u202f%';
function toggleSpeed() {
  G.speed = SPEEDS[(SPEEDS.indexOf(G.speed) + 1) % SPEEDS.length];
  try { localStorage.setItem('inacheve.vitesse', String(G.speed)); } catch (e) { /* rien */ }
  caption(G.speed === 1 ? 'Vitesse normale.' : 'Le jeu tourne à ' + speedLabel() + ' : tout le monde ralentit.', 2); setUI();
}
function toggleCalm() { G.calm = !G.calm; try { localStorage.setItem('inacheve.calme', G.calm ? '1' : '0'); } catch (e) { /* rien */ } caption(G.calm ? 'Secousses coupées : la page reste immobile.' : 'Secousses rétablies.', 1.8); setUI(); }
function toggleMute() { AU.init(); AU.setMuted(!AU.muted); try { localStorage.setItem('inacheve.muted', AU.muted ? '1' : '0'); } catch (e) { /* rien */ } setUI(); }

if (!CAPTURE) {
  addEventListener('keydown', e => {
    if (document.getElementById('journal').open) return;
    if (G.input.touch) { G.input.touch = false; setUI(); }
    keys[e.code] = true;
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) e.preventDefault();
    AU.init();
    if (G.state === 'bestiaire') {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') flipBestiaire(-1);
      else if (e.code === 'ArrowRight' || e.code === 'KeyD') flipBestiaire(1);
      else if (e.code === 'Escape' || e.code === 'KeyB' || e.code === 'Enter' || e.code === 'Space' || e.code === 'Backspace') closeBestiaire();
      return;
    }
    if (e.code === 'Tab' && (G.state === 'title' || G.state === 'bureau')) e.preventDefault();
    if (G.state === 'bureau') {   // le bureau : choisir sa page
      const dg = /^(Digit|Numpad)([1-9])$/.exec(e.code), at = dg ? bureauItems().findIndex(it => it.kind === 'page' && it.n === parseInt(dg[2], 10)) : -1;
      if (['ArrowLeft', 'ArrowUp', 'KeyA', 'KeyW'].includes(e.code)) bureauSelect(G.bureauSel - 1);
      else if (['ArrowRight', 'ArrowDown', 'KeyD', 'KeyS'].includes(e.code)) bureauSelect(G.bureauSel + 1);
      else if (e.code === 'Enter' || e.code === 'Space') bureauGo();
      else if (e.code === 'Escape' || e.code === 'Backspace' || e.code === 'Tab') closeBureau();
      else if (e.code === 'KeyB') openBestiaire();
      else if (e.code === 'KeyJ') startDevoir(false);
      else if (e.code === 'KeyM') toggleMute();
      else if (e.code === 'KeyC') toggleCalm();
      else if (e.code === 'KeyV') toggleSpeed();
      else if (at >= 0) { bureauSelect(at); bureauGo(); }
      return;
    }
    if (e.code === 'Tab' && G.state === 'title') { openBureau(); return; }
    if (e.code === 'KeyB' && ['title', 'play', 'pause', 'gameover', 'victory'].includes(G.state)) { openBestiaire(); return; }
    if (e.code === 'KeyM') toggleMute();
    if (e.code === 'KeyC') toggleCalm();
    if (e.code === 'KeyV') toggleSpeed();
    if (e.code === 'KeyJ' && G.state === 'title') { startDevoir(false); return; }
    if (e.code === 'KeyT' && ['pause', 'gameover', 'victory'].includes(G.state)) { goTitle(); return; }
    if (G.state === 'levelup') {
      if (G.stateT < 0.3) return;
      if (e.code === 'Digit1' || e.code === 'Numpad1') chooseMot(0);
      else if (e.code === 'Digit2' || e.code === 'Numpad2') chooseMot(1);
      else if (e.code === 'Digit3' || e.code === 'Numpad3') chooseMot(2);
      else if (e.code === 'ArrowLeft' || e.code === 'ArrowUp' || e.code === 'KeyA' || e.code === 'KeyW') G.sel = (G.sel + G.choices.length - 1) % G.choices.length;
      else if (e.code === 'ArrowRight' || e.code === 'ArrowDown' || e.code === 'KeyD' || e.code === 'KeyS') G.sel = (G.sel + 1) % G.choices.length;
      else if (e.code === 'Enter' || e.code === 'Space') chooseMot(G.sel);
      return;
    }
    const dig = /^(Digit|Numpad)([2-9])$/.exec(e.code), chn = dig ? parseInt(dig[2], 10) : 0;   // touches 2 à 8 : commencer plus loin dans le cahier
    if (chn && chn < CHAPTERS.length && G.state === 'title' && G.unlocked >= chn) { newGame(false, chn); return; }
    if (e.code === 'Enter' || (e.code === 'Space' && G.state !== 'play')) primaryAction();
    if ((e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') && G.state === 'play') G.input.dashQueued = true;
    if (e.code === 'Escape' || e.code === 'KeyP') togglePause();
    if (e.code === 'KeyR' && (G.state === 'victory' || G.state === 'gameover')) restartRun();
  });
  addEventListener('keyup', e => { keys[e.code] = false; });
  addEventListener('pagehide', saveBestiaire);
  addEventListener('blur', () => { for (const k in keys) keys[k] = false; if (G.state === 'play') togglePause(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden && G.state === 'play') togglePause(); });
  G.input.joy = { active: false };
  cv.addEventListener('pointerdown', e => {
    cv.focus(); AU.init();
    const touch = e.pointerType === 'touch'; if (touch !== G.input.touch) { G.input.touch = touch; setUI(); }
    const x = e.clientX, y = e.clientY;
    if (G.state === 'bestiaire') {
      const h = bestHit(x, y);
      if (h === 'close') closeBestiaire(); else if (h === 'prev') flipBestiaire(-1); else if (h === 'next') flipBestiaire(1);
      return;
    }
    if (G.state === 'bureau') {
      const h = bureauHit(x, y);
      if (h === 'close') closeBureau(); else if (h === 'go') bureauGo(); else if (h !== null) { if (h === G.bureauSel) bureauGo(); else bureauSelect(h); }
      return;
    }
    if (G.state === 'levelup') {
      if (G.stateT < 0.35) return;
      cardRects().forEach((r, i) => { if (x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h) chooseMot(i); });
      return;
    }
    if (G.state !== 'play') { if (G.state === 'title' || touch || G.state === 'pause' || G.state === 'gameover' || G.state === 'victory') primaryAction(); return; }
    if (touch) {
      const bxp = W - SAFE.r - 70 * U, byp = H - SAFE.b - 110 * U;
      if (Math.hypot(x - bxp, y - byp) < 52 * U) { G.input.dashQueued = true; return; }
      if (!G.input.joy.active) { G.input.joy = { active: true, id: e.pointerId, ox: x, oy: y, x, y }; }
    } else { G.input.joy = { active: true, id: e.pointerId, ox: x, oy: y, x, y }; }
  });
  cv.addEventListener('pointermove', e => {
    const j = G.input.joy;
    if (G.state === 'bureau' && e.pointerType === 'mouse') { const h = bureauHit(e.clientX, e.clientY); if (typeof h === 'number') bureauSelect(h); }
    if (G.state === 'levelup') { cardRects().forEach((r, i) => { if (e.clientX >= r.x && e.clientX <= r.x + r.w && e.clientY >= r.y && e.clientY <= r.y + r.h) G.sel = i; }); }
    if (j && j.active && j.id === e.pointerId) { j.x = e.clientX; j.y = e.clientY; }
  });
  const endJoy = e => { const j = G.input.joy; if (j && j.id === e.pointerId) j.active = false; };
  cv.addEventListener('pointerup', endJoy); cv.addEventListener('pointercancel', endJoy);
  cv.addEventListener('contextmenu', e => e.preventDefault());

  const dlg = document.getElementById('journal');
  document.getElementById('btnJournal').addEventListener('click', () => { buildJournal(); if (G.state === 'play') togglePause(); dlg.showModal(); });
  document.getElementById('btnCloseJournal').addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', () => cv.focus());
  document.getElementById('btnBest').addEventListener('click', () => { AU.init(); openBestiaire(); cv.focus(); });
  document.getElementById('btnSound').addEventListener('click', toggleMute);
  document.getElementById('btnCalm').addEventListener('click', toggleCalm);
  document.getElementById('btnSpeed').addEventListener('click', toggleSpeed);
  document.getElementById('btnDevoir').addEventListener('click', () => { AU.init(); if (G.state === 'title') startDevoir(false); });
  document.getElementById('btnTitre').addEventListener('click', () => { AU.init(); if (['pause', 'gameover', 'victory'].includes(G.state)) goTitle(); cv.focus(); });
  document.getElementById('btnBureau').addEventListener('click', () => { AU.init(); if (G.state === 'title') openBureau(); cv.focus(); });
  document.getElementById('btnPause').addEventListener('click', () => togglePause());
}
function videoFor(n) {
  const tag = 'iteration-' + String(n).padStart(3, '0');
  return {
    src: !LOCAL_VIDEOS ? null : n === GAME_META.iteration ? 'videos/' + tag + '.mp4' : HAS_REPO ? 'https://github.com/' + REPO + '/releases/download/' + tag + '/' + tag + '.mp4' : null,
    page: HAS_REPO ? 'https://github.com/' + REPO + '/releases/tag/' + tag : null
  };
}
function buildJournal() {
  const ol = document.getElementById('entries'); ol.innerHTML = '';
  if (HAS_REPO && !document.getElementById('allVideos')) {
    const p = document.createElement('p'); p.className = 'lede'; p.id = 'allVideos';
    const a = document.createElement('a'); a.href = 'https://github.com/' + REPO + '/releases'; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Toutes les vidéos et le code source sont sur GitHub.';
    a.style.color = 'var(--ink)'; p.appendChild(a); ol.before(p);
  }
  for (const j of JOURNAL.slice().reverse()) {
    const li = document.createElement('li'); li.className = 'entry';
    const h = document.createElement('h3'); h.textContent = 'Itération ' + j.iteration + ' : ' + j.title; li.appendChild(h);
    const t = document.createElement('time'); t.dateTime = j.date; t.textContent = frDate(j.date); li.appendChild(t);
    const ul = document.createElement('ul'); for (const n of j.notes) { const x = document.createElement('li'); x.textContent = n; ul.appendChild(x); } li.appendChild(ul);
    const vid = videoFor(j.iteration);
    const miss = document.createElement('p'); miss.className = 'novideo';
    if (vid.page) { const a = document.createElement('a'); a.href = vid.page; a.target = '_blank'; a.rel = 'noopener'; a.textContent = 'Voir la vidéo de cette itération sur GitHub'; a.style.color = 'var(--ink)'; miss.appendChild(a); }
    else miss.textContent = 'La vidéo de cette itération est rangée avec le code source du jeu.';
    if (vid.src) {
      const v = document.createElement('video'); v.controls = true; v.preload = 'metadata'; v.playsInline = true; v.src = vid.src;
      v.addEventListener('error', () => { v.replaceWith(miss); });
      li.appendChild(v);
    } else li.appendChild(miss);
    ol.appendChild(li);
  }
}

/* ===================== Démarrage ===================== */
resize(); if (!CAPTURE) addEventListener('resize', resize);
makeTextures(); buildShapes();
initTitle();
const fontsReady = Promise.all([document.fonts.load('700 20px Main'), document.fonts.load('400 20px Main'), document.fonts.load('40px Cursive')]).catch(() => null);

// API de capture pour tools/record.mjs (image par image, déterministe)
window.__cap = {
  ready: fontsReady.then(() => true),
  meta: GAME_META,
  frames(n, dt = 1 / 30, quality = 0.86) {
    const out = [];
    for (let i = 0; i < n; i++) {
      CAPLOG.on = true; update(dt); CAPLOG.on = false; render(); out.push(cv.toDataURL('image/jpeg', quality));
      CAPLOG.states.push({ t: CAPLOG.t, i: G.state === 'play' ? Math.min(1, G.t / 180) : 0.1, b: !!G.boss && G.state === 'play', c: musicChapter() });
      CAPLOG.t += dt;
    }
    return out;
  },
  audio(duration) { return AU.renderCapture(duration); },
  skip(seconds, dt = 1 / 30) { const n = Math.round(seconds / dt); for (let i = 0; i < n; i++) update(dt); },
  title() { initTitle(); },
  jour(over) { devoirOver = over || null; },
  devoir(over) { if (over) devoirOver = over; startDevoir(true); },
  start(chapter) { newGame(true, chapter || 1); },
  caption(t, d) { caption(t, d); },
  state() { return { state: G.state, chapter: G.chapter || 1, t: G.t, boss: !!G.boss, bossDefeated: !!G.bossDefeated, level: G.level, hp: G.p ? G.p.hp : 0, enemies: G.enemies ? G.enemies.length : 0, kills: G.kills, mots: G.mots, refrains: G.refrains || 0, refrain: G.refrain ? G.refrain.prog : -1, figures: G.figures || 0, tresors: G.tresors || 0, tresor: G.tresor ? G.tresor.shown : -1, enlus: G.enlus || 0, enlu: G.enlu ? Math.round(100 * G.enlu.painted / G.enlu.cells.length) : -1, croquis: bestCount(), page: G.bestPage, unions: unionCount(), quotes: G.quotes ? G.quotes.length : 0, sceaux: G.sceaux || 0, sceau: G.sceau ? (G.sceau.carried ? 1 : 0) : -1, devoir: !!G.devoir, note: G.note ? G.note.n : -1, lignes: G.lignes || 0, ligne: G.ligne ? Math.round(100 * G.ligne.prog / G.ligne.len) : -1, morpions: G.morpions || 0, morpion: G.morpion ? G.morpion.cells.filter(c => c).length : -1, labys: G.labys || 0, laby: G.laby ? (G.laby.inEnt ? G.laby.trail.length : 0) : -1, calculs: G.calculs || 0, calcul: G.calc && !G.calc.end ? G.calc.wrong : -1, photos: G.photos || 0, copies: G.copies || 0, photoKills: G.photoKills || 0, double: G.double ? 1 : 0, agrafees: G.agrafees || 0, agrafPins: G.agrafPins || 0, agrafKills: G.agrafKills || 0, pin: G.p && G.p.pin > 0 ? 1 : 0, bureau: G.state === 'bureau' ? bureauChapter() : -1, records: Object.keys(G.pages).length }; },
  bestiaire(page) { openBestiaire(page); },
  croque(types) { types.forEach((k, i) => { if (BEST_TYPES.has(k)) G.bestiary[k] = (G.bestiary[k] || 0) + 4 + (i * 37) % 90; }); },
  unir(keys) { keys.forEach(k => { if (UNIONS.includes(k)) G.unions[k] = 1; }); },
  feuilleter(d) { flipBestiaire(d); },
  refermer() { closeBestiaire(); },
  reprendre() { if (G.state === 'pause') togglePause(); },
  // montage : la photocopieuse arrive tout de suite, à 420 px du joueur
  photocopie() { if (G.state !== 'play') return; G.photoDone = true; const a = rnd(TAU); spawnPhotocopieuse(clamp(G.p.x + Math.cos(a) * 420, 80, WORLD.w - 80), clamp(G.p.y + Math.sin(a) * 420, 80, WORLD.h - 80)); },
  // montage : l'agrafeuse arrive tout de suite, à 380 px du joueur
  agrafeuse() { if (G.state !== 'play') return; G.agrafDone = true; const a = rnd(TAU); spawnAgrafeuse(clamp(G.p.x + Math.cos(a) * 380, 80, WORLD.w - 80), clamp(G.p.y + Math.sin(a) * 380, 80, WORLD.h - 80)); },
  heal() { if (G.p) G.p.hp = G.p.maxHp; },
  // donne des mots d'un coup (montage) puis ouvre un choix : un mot composé prêt y est toujours proposé
  grant(mots) { for (const k in mots) { G.mots[k] = Math.max(lvl(k), mots[k]); if (!G.motOrder.includes(k)) G.motOrder.push(k); } computeStats(); G.pointCd = Math.min(G.pointCd, 1.5); },
  levelup() { if (G.state === 'play' || G.state === 'levelup') G.pendingLv++; },
  // montage : fixe le niveau affiché, puis tourne la page (chapitre suivant, mêmes mots)
  level(n) { G.level = n; G.xp = 0; G.xpNext = xpFor(n); },
  turn() { if (G.state === 'play' || G.state === 'victory') turnPage(); },
  // le bureau : l'ouvrir (depuis n'importe où), y déplacer la goutte, commencer la page choisie
  bureau(n) { if (G.state !== 'title') goTitle(); const i = n ? bureauItems().findIndex(it => it.kind === 'page' && it.n === n) : undefined; openBureau(i === -1 ? undefined : i); },
  choisir(d) { bureauSelect(G.bureauSel + d); },
  commencer() { bureauGo(true); },
  debloque(n) { G.unlocked = clamp(n, 1, CHAPTERS.length - 1); },
  pages(o) { for (const k in o) G.pages = Object.assign({}, G.pages, { [k]: o[k] }); }
};
if (!CAPTURE) { fontsReady.then(() => { lastT = performance.now(); requestAnimationFrame(frame); }); }
else render();
