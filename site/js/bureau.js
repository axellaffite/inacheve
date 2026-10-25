// Le bureau (itération 16) : les cahiers posés sur un pupitre d'écolier, un onglet par page.
// On y choisit où commencer ; chaque onglet a sa musique, son record et sa phrase de l'histoire.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

// Les cahiers et leurs pages. Un chapitre qui n'est rangé dans aucun cahier va dans le dernier.
const CAHIERS = [
  { name: 'Cahier n° 1', sub: 'pages I à VI', pages: [1, 2, 3, 4, 5, 6], cover: '#3d6cb5', dark: '#24467e', doodle: 'goutte' },
  { name: 'Brouillon', sub: 'page VII', pages: [7], cover: '#9aa58a', dark: '#66705a', doodle: 'cafe' },
  { name: 'Vacances', sub: 'page VIII', pages: [8], cover: '#f0a238', dark: '#b8711a', doodle: 'soleil' },
  { name: 'Cahier neuf', sub: 'pages IX et X', pages: [9, 10], cover: '#c8423f', dark: '#8e2a28', doodle: 'tables' },
  { name: 'Poésie', sub: 'page XI', pages: [11], cover: '#7b5ea7', dark: '#523c78', doodle: 'lune' },
  { name: 'Cahier de textes', sub: 'page XII', pages: [12], cover: '#2a8f83', dark: '#1b6058', doodle: 'horloge' },
  { name: 'Correspondance', sub: 'page XIII', pages: [13], cover: '#c9853a', dark: '#8c5a22', doodle: 'enveloppe' }
];
// L'histoire du cahier : une phrase par page, qu'on ne lit qu'une fois la page débloquée
const HISTOIRE = [null,
  'Il était une fois une goutte d’encre qui tomba de la plume au lieu d’écrire.',
  'Elle glissa sur une portée et découvrit que chaque ligne chante.',
  'Sur le papier millimétré, elle mesura sa taille… et décida que ça ne comptait pas.',
  'Une carte lui promit un trésor ; elle suivit les pointillés sans jamais se presser.',
  'À la page de calligraphie, elle apprit à être pleine et déliée à la fois.',
  'La page de garde lui souffla : « ce cahier t’appartient ».',
  'Au brouillon, elle eut enfin le droit de rater, et elle en profita.',
  'En vacances, elle se perdit exprès dans les labyrinthes, pour le plaisir de ressortir.',
  'À la rentrée, dans un cahier tout neuf, elle apprit que les tables ne servent pas qu’à manger.',
  'À la récré, elle sauta jusqu’au Ciel sans toucher le caillou, et ne bougea plus quand on cria « soleil ! ».',
  'Dans le cahier de poésie, elle apprit que deux mots qui riment se tiennent la main, même de loin.',
  'Dans le cahier de textes, elle apprit l’heure : celle de la cloche, et celle où l’on rentre à la maison.',
  'Dans le carnet de correspondance, elle écrivit enfin à la maison : « Tout va bien, je finis la page. »'
];
const TAB_COLORS = [null, '#f6e75e', '#ff9ec4', '#9be59b', '#8fd3f0', '#f7b267', '#c9a7f0', '#dcd6bc', '#ffd36b', '#b5e3d0', '#ffc4d6', '#d9c2ff', '#a8e6dc', '#f5c98a'];
const BUREAU = { hop: 0.24, key: 'inacheve.pages' };

/* ----- les records de chaque page : { chapitre: { w: victoires, t: meilleur temps } } ----- */
G.pages = {};
if (!CAPTURE) {
  try {
    const raw = JSON.parse(localStorage.getItem(BUREAU.key) || '{}');
    if (raw && typeof raw === 'object') for (const k in raw) {
      const n = parseInt(k, 10), o = raw[k];
      if (n >= 1 && n < CHAPTERS.length && o && Number.isFinite(o.w) && o.w > 0 && Number.isFinite(o.t) && o.t > 0) G.pages[n] = { w: Math.floor(o.w), t: o.t };
    }
  } catch (e) { G.pages = {}; }
}
// le patron de la page vient de tomber (appelé par killEnemy)
function notePage(n, t) {
  if (G.demo || G.devoir) return;
  const old = G.pages[n], rec = !!old && t < old.t;
  G.pages = Object.assign({}, G.pages, { [n]: { w: (old ? old.w : 0) + 1, t: old ? Math.min(old.t, t) : t } });
  try { localStorage.setItem(BUREAU.key, JSON.stringify(G.pages)); } catch (e) { /* rien */ }
  if (rec) caption('Nouveau record pour cette page : ' + mmss(t) + ' !', 3.2, 'green');
}

/* ----- les objets du bureau ----- */
function cahierPages(ci) {
  const known = new Set(CAHIERS.flatMap(c => c.pages)), extra = [];
  if (ci === CAHIERS.length - 1) for (let n = 1; n < CHAPTERS.length; n++) if (!known.has(n)) extra.push(n);
  return CAHIERS[ci].pages.filter(n => n < CHAPTERS.length).concat(extra);
}
function bureauItems() {
  const out = [];
  CAHIERS.forEach((c, ci) => cahierPages(ci).forEach(n => out.push({ kind: 'page', n, ci })));
  out.push({ kind: 'devoir' });
  return out;
}
const pageOpen = n => G.unlocked >= n;
const bossLabel = n => { const b = CHAPTERS[n].bossName; return b.charAt(0).toLowerCase() + b.slice(1); };
function bureauChapter() { const it = bureauItems()[G.bureauSel]; return !it ? 1 : it.kind === 'page' ? it.n : devoirDuJour().chapter; }
// la musique : celle de l'onglet choisi tant qu'on est au bureau
function musicChapter() {
  if (G.state === 'title') return 1;
  if (G.state === 'bureau' || (G.state === 'bestiaire' && G.bestFrom === 'bureau')) return bureauChapter();
  return CH().paper === 'textes' && G.state !== 'title' ? textesMusic() : G.chapter || 1;   // au cahier de textes : la musique de la matière de l'heure
}

/* ----- ouvrir, choisir, commencer ----- */
G.bureauSel = 0; G.bureauFrom = 0; G.bureauHop = 1; G.bureauNope = 0;
function openBureau(sel) {
  if (G.state !== 'title') return;
  const items = bureauItems();
  const i = sel !== undefined ? sel : items.findIndex(it => it.kind === 'page' && it.n === Math.min(G.unlocked, CHAPTERS.length - 1));
  G.state = 'bureau'; G.stateT = 0;
  G.bureauSel = G.bureauFrom = clamp(i, 0, items.length - 1); G.bureauHop = 1;
  AU.play('turn'); setUI();
}
function closeBureau() { if (G.state !== 'bureau') return; G.state = 'title'; G.stateT = 9; AU.play('feuille'); setUI(); }
function bureauSelect(i) {
  const items = bureauItems(), n = items.length;
  i = ((i % n) + n) % n;
  if (i === G.bureauSel) return;
  G.bureauFrom = G.bureauSel; G.bureauSel = i; G.bureauHop = 0;
  AU.play('plip', items[i].kind === 'page' ? items[i].n + 1 : 10);
}
// demo : la capture lance la page avec le pilote automatique
function bureauGo(demo = false) {
  const it = bureauItems()[G.bureauSel];
  if (!it) return;
  if (it.kind === 'devoir') { startDevoir(demo); return; }
  if (!pageOpen(it.n)) { G.bureauNope = 0.45; AU.play('hit'); caption('Cette page n’est pas encore écrite : bats d’abord ' + bossLabel(it.n - 1) + '.', 2.6); return; }
  newGame(demo, it.n);
}
function stepBureau(dt) { G.bureauHop = Math.min(1, G.bureauHop + dt / BUREAU.hop); G.bureauNope = Math.max(0, G.bureauNope - dt); }

/* ----- mise en page ----- */
function bureauLayout() {
  const s = U, l = SAFE.l + 20 * s, r = W - SAFE.r - 20 * s, aw = r - l, wide = W / H > 1.2;
  const top = SAFE.t + (wide ? 104 : 96) * s;
  const fh = (wide ? 138 : 168) * s, fw = Math.min(820 * s, aw), fiche = { x: W / 2 - fw / 2, y: H - SAFE.b - 16 * s - fh, w: fw, h: fh };
  const items = bureauItems(), books = [], tabs = [];
  const nC = CAHIERS.length, availH = fiche.y - top - 22 * s;
  let bw, bh, devoir, ghost;
  if (wide) {
    const slots = nC + 2;   // les cahiers, la place du suivant, le devoir
    bw = Math.min(232 * s, aw / (slots * 1.17 + 0.6), availH / 1.32); bh = bw * 1.32;
    const step = bw * 1.17, gap = (aw - slots * step) / (slots + 1), y = top + (availH - bh) / 2;
    for (let ci = 0; ci < nC; ci++) books.push({ ci, x: l + gap + ci * (step + gap), y, w: bw, h: bh });
    ghost = { x: l + gap + nC * (step + gap), y, w: bw, h: bh };
    devoir = { x: l + gap + (nC + 1) * (step + gap), y: y + bh * 0.16, w: bw * 1.05, h: bw * 0.82 };
  } else {   // en hauteur : deux colonnes, le devoir après le dernier cahier
    const cols = 2, rows = Math.ceil((nC + 1) / cols);
    bw = Math.min(200 * s, aw / (cols * 1.17 + 0.5), (availH / rows - 14 * s) / 1.32); bh = bw * 1.32;
    const step = bw * 1.17, gap = (aw - cols * step) / (cols + 1), rh = availH / rows;
    const slot = k => ({ x: l + gap + (k % cols) * (step + gap), y: top + Math.floor(k / cols) * rh + (rh - bh) / 2 });
    for (let ci = 0; ci < nC; ci++) books.push(Object.assign({ ci, w: bw, h: bh }, slot(ci)));
    const d = slot(nC);
    devoir = { x: d.x, y: d.y + bh * 0.16, w: bw * 1.05, h: bw * 0.82 };
    ghost = null;
  }
  for (const b of books) {
    const pages = cahierPages(b.ci), th = Math.min(b.h * 0.15, b.h * 0.84 / pages.length), tw = b.w * 0.19;
    pages.forEach((n, k) => {
      const i = items.findIndex(it => it.kind === 'page' && it.n === n);
      tabs.push({ i, n, ci: b.ci, x: b.x + b.w - 6 * s, y: b.y + b.h * 0.07 + k * th, w: tw, h: th - 3 * s });
    });
  }
  const devoirI = items.length - 1;
  return { wide, books, tabs, ghost, devoir, devoirI, fiche, close: { x: W - SAFE.r - 40 * s, y: SAFE.t + 40 * s, r: 24 * s } };
}
function bureauHit(x, y) {
  const L = bureauLayout(), inR = (b, m = 0) => x >= b.x - m && x <= b.x + b.w + m && y >= b.y - m && y <= b.y + b.h + m;
  if (Math.hypot(x - L.close.x, y - L.close.y) < L.close.r * 1.5) return 'close';
  if (inR(L.fiche)) return 'go';
  for (const t of L.tabs) if (inR(t, 3 * U)) return t.i;
  for (const b of L.books) if (inR(b)) {   // sur la couverture : l'onglet le plus proche en hauteur
    let best = null;
    for (const t of L.tabs) if (t.ci === b.ci && (!best || Math.abs(t.y + t.h / 2 - y) < Math.abs(best.y + best.h / 2 - y))) best = t;
    return best ? best.i : null;
  }
  if (inR(L.devoir)) return L.devoirI;
  return null;
}
// là où la goutte se pose pour montrer l'objet choisi
function bureauSpot(L, i) {
  const t = L.tabs.find(q => q.i === i);
  if (t) return { x: t.x + t.w + 22 * U, y: t.y + t.h / 2 };
  return { x: L.devoir.x + L.devoir.w - 14 * U, y: L.devoir.y + 4 * U };
}

/* ----- le pupitre (calculé une fois par taille d'écran) ----- */
let deskCv = null, deskKey = '';
function deskTexture() {
  const key = W + 'x' + H + 'x' + DPR;
  if (deskCv && deskKey === key) return deskCv;
  deskCv = document.createElement('canvas'); deskCv.width = cv.width; deskCv.height = cv.height; deskKey = key;
  const g = deskCv.getContext('2d'), s = U, vr = mulberry32(1616);   // hasard à part : le bois ne touche pas au déterminisme
  g.setTransform(DPR, 0, 0, DPR, 0, 0);
  const grad = g.createLinearGradient(0, 0, W * 0.3, H); grad.addColorStop(0, '#c99a64'); grad.addColorStop(1, '#ad7b49');
  g.fillStyle = grad; g.fillRect(0, 0, W, H);
  // le veinage, planche par planche
  const plank = Math.max(120, H / 5);
  for (let i = 0; i < 90; i++) {
    const y0 = vr() * H, amp = 2 + vr() * 7, f = 0.003 + vr() * 0.009, ph = vr() * TAU;
    g.strokeStyle = 'rgba(92,55,24,' + (0.04 + vr() * 0.09).toFixed(3) + ')'; g.lineWidth = 0.7 + vr() * 1.8;
    g.beginPath(); for (let x = 0; x <= W + 16; x += 16) { const y = y0 + Math.sin(x * f + ph) * amp + Math.sin(x * f * 2.7 + ph) * amp * 0.35; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
  }
  for (let k = 0; k < 3; k++) {   // des nœuds dans le bois
    const x = W * (0.15 + 0.35 * k) + vr() * 80, y = plank * (1.5 + k) + vr() * 40;
    for (let j = 0; j < 4; j++) { g.strokeStyle = 'rgba(92,55,24,0.13)'; g.lineWidth = 1.2; g.beginPath(); g.ellipse(x, y, 10 + j * 7, 4 + j * 3, 0.05, 0, TAU); g.stroke(); }
  }
  for (let y = plank; y < H; y += plank) { g.fillStyle = 'rgba(70,40,15,0.22)'; g.fillRect(0, y, W, 2); g.fillStyle = 'rgba(255,230,190,0.12)'; g.fillRect(0, y + 2, W, 1); }
  // la rainure du pupitre, avec son crayon, et l'encrier encastré (sur un écran en hauteur, la place manque)
  if (W / H > 1.2) {
  const gy = SAFE.t + 8 * s, gh = 22 * s;
  g.fillStyle = 'rgba(70,40,15,0.35)'; g.beginPath(); g.roundRect ? g.roundRect(W * 0.3, gy, W * 0.4, gh, gh / 2) : g.rect(W * 0.3, gy, W * 0.4, gh); g.fill();
  g.save(); g.translate(W * 0.33, gy + gh / 2); g.fillStyle = '#f2c230'; g.fillRect(0, -6 * s, 150 * s, 12 * s);
  g.fillStyle = '#d9a91c'; g.fillRect(0, -1 * s, 150 * s, 3 * s);
  g.fillStyle = '#f0d3a8'; g.beginPath(); g.moveTo(150 * s, -6 * s); g.lineTo(176 * s, 0); g.lineTo(150 * s, 6 * s); g.fill();
  g.fillStyle = C.graphite; g.beginPath(); g.moveTo(170 * s, -1.6 * s); g.lineTo(176 * s, 0); g.lineTo(170 * s, 1.6 * s); g.fill();
  g.fillStyle = '#f2a0a8'; g.fillRect(-14 * s, -6 * s, 10 * s, 12 * s); g.fillStyle = '#b9b9c0'; g.fillRect(-5 * s, -6 * s, 6 * s, 12 * s);
  g.restore();
  const ix = W * 0.75, iy = gy + gh / 2;
  g.fillStyle = '#7d6a55'; g.beginPath(); g.arc(ix, iy, 17 * s, 0, TAU); g.fill();
  g.fillStyle = '#c7c2b6'; g.beginPath(); g.arc(ix, iy, 13 * s, 0, TAU); g.fill();
  g.fillStyle = C.inkDeep; g.beginPath(); g.arc(ix, iy, 9 * s, 0, TAU); g.fill();
  g.fillStyle = 'rgba(255,255,255,0.35)'; g.beginPath(); g.ellipse(ix - 3 * s, iy - 3 * s, 3 * s, 1.6 * s, -0.5, 0, TAU); g.fill();
  }
  // une vieille tache d'encre et des initiales gravées, pour la vie du pupitre
  g.fillStyle = 'rgba(29,58,138,0.16)'; g.beginPath(); g.arc(W * 0.08, H * 0.82, 26 * s, 0, TAU); g.arc(W * 0.08 + 30 * s, H * 0.82 + 12 * s, 9 * s, 0, TAU); g.fill();
  g.font = '400 ' + (26 * s) + 'px ' + FONT_MAIN; g.fillStyle = 'rgba(80,45,18,0.28)'; g.textAlign = 'right'; g.fillText('la goutte était là', W - SAFE.r - 28 * s, H * 0.7);
  return deskCv;
}

/* ----- dessin ----- */
function drawBureau() {
  const s = U, L = bureauLayout(), items = bureauItems(), t = G.state === 'bureau' ? G.stateT : 9, sel = items[G.bureauSel] || items[0];
  ctx.drawImage(deskTexture(), 0, 0, W, H);
  const a = ease(t * 3);
  ctx.save(); ctx.globalAlpha = a;
  // l'en-tête
  const hx = L.wide ? SAFE.l + 34 * s : W / 2, al = L.wide ? 'left' : 'center';
  txt('Le bureau', hx, SAFE.t + 52 * s, Math.min(46 * s, W / 9), { font: FONT_CURSIVE, weight: 400, color: '#fff8e8', align: al });
  const sub = G.input.touch ? 'Touche un onglet pour choisir ta page, puis la fiche pour commencer.' : '← → ou Q D : choisir    Entrée : commencer    Échap : retour    B : bestiaire';
  txt(sub, L.wide ? hx : W / 2, SAFE.t + (L.wide ? 88 : 84) * s, Math.min(19 * s, W / 32), { color: '#fff3d8', weight: 400, align: al, alpha: 0.9 });
  // la croix pour revenir au titre
  ctx.fillStyle = C.paper; ctx.beginPath(); ctx.arc(L.close.x, L.close.y, L.close.r, 0, TAU); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke(); txt('×', L.close.x, L.close.y - 2 * s, 30 * s, { color: C.ink });
  L.books.forEach((b, k) => drawCahier(b, L, sel, clamp(t * 3 - k * 0.25, 0, 1)));
  drawGhost(L.ghost, clamp(t * 3 - 0.75, 0, 1));
  drawDevoirSheet(L.devoir, sel.kind === 'devoir', clamp(t * 3 - 1, 0, 1));
  drawBureauDrop(L);
  drawFiche(L.fiche, sel);
  ctx.restore();
}
function drawCahier(b, L, sel, k) {
  const s = U, c = CAHIERS[b.ci], pages = cahierPages(b.ci), open = pages.some(pageOpen), on = sel.kind === 'page' && sel.ci === b.ci;
  const lift = on ? 7 * s : 0, tilt = ((b.ci * 53) % 5 - 2) * 0.012;
  ctx.save(); ctx.globalAlpha *= ease(k); ctx.translate(b.x + b.w / 2, b.y + b.h / 2 - lift + (1 - ease(k)) * 30 * s); ctx.rotate(tilt);
  const x0 = -b.w / 2, y0 = -b.h / 2;
  // les onglets d'abord : la couverture les recouvre en partie
  for (const tb of L.tabs) if (tb.ci === b.ci) {
    const n = tb.n, me = sel.kind === 'page' && sel.n === n, ok = pageOpen(n), ox = tb.x - b.x - b.w / 2, oy = tb.y - b.y - b.h / 2, w = tb.w + (me ? 9 * s : 0);
    ctx.fillStyle = ok ? TAB_COLORS[n] || '#eee' : '#cfcbbd';
    roundRect(ox - 6 * s, oy, w + 6 * s, tb.h, 4 * s); ctx.fill();
    ctx.strokeStyle = me ? C.ink : 'rgba(60,45,30,0.35)'; ctx.lineWidth = me ? 2.2 : 1; ctx.stroke();
    if (!ok) { ctx.save(); roundRect(ox - 6 * s, oy, w + 6 * s, tb.h, 4 * s); ctx.clip(); ctx.strokeStyle = 'rgba(109,109,116,0.35)'; ctx.lineWidth = 1; ctx.beginPath(); for (let q = -2; q < 12; q++) { ctx.moveTo(ox + q * 7 * s, oy + tb.h); ctx.lineTo(ox + q * 7 * s + tb.h, oy); } ctx.stroke(); ctx.restore(); }
    txt(CHAPTERS[n].num, ox + w * 0.55, oy + tb.h / 2 + 1, Math.min(tb.h * 0.62, w * 0.42), { color: ok ? C.graphite : C.pencil, alpha: ok ? 1 : 0.6 });
    if (G.pages[n]) drawStar(ox + w - 2 * s, oy + 3 * s, 5 * s);
  }
  // la couverture
  ctx.shadowColor = 'rgba(40,22,8,' + (on ? 0.45 : 0.3) + ')'; ctx.shadowBlur = on ? 22 : 12; ctx.shadowOffsetY = on ? 10 : 5;
  ctx.fillStyle = c.cover; roundRect(x0, y0, b.w, b.h, 6 * s); ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.save(); roundRect(x0, y0, b.w, b.h, 6 * s); ctx.clip();
  ctx.strokeStyle = 'rgba(255,255,255,0.07)'; ctx.lineWidth = 1;   // le grain du carton
  ctx.beginPath(); for (let q = -b.h; q < b.w; q += 6 * s) { ctx.moveTo(x0 + q, y0 + b.h); ctx.lineTo(x0 + q + b.h, y0); } ctx.stroke();
  ctx.fillStyle = c.dark; ctx.fillRect(x0, y0, b.w * 0.09, b.h);   // le dos toilé
  ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(x0 + b.w * 0.09, y0, 2, b.h);
  ctx.restore();
  // l'étiquette
  const lw = b.w * 0.7, lh = b.h * 0.27, lx = x0 + b.w * 0.17, ly = y0 + b.h * 0.13;
  ctx.fillStyle = '#fffdf4'; roundRect(lx, ly, lw, lh, 8 * s); ctx.fill(); ctx.strokeStyle = c.dark; ctx.lineWidth = 1.6; ctx.stroke();
  ctx.strokeStyle = C.ruleMinor; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(lx + 8 * s, ly + lh * 0.72); ctx.lineTo(lx + lw - 8 * s, ly + lh * 0.72); ctx.stroke();
  txt(c.name, lx + lw / 2, ly + lh * 0.38, Math.min(lh * 0.36, lw / (c.name.length * 0.5)), { color: C.ink });
  txt(open ? c.sub : 'pas encore écrit', lx + lw / 2, ly + lh * 0.72 - 6 * s, Math.min(lh * 0.24, lw / 9), { color: open ? C.pencil : C.red, weight: 400 });
  drawDoodle(c.doodle, x0 + b.w * 0.52, y0 + b.h * 0.67, b.w * 0.2, open);
  if (!open) { ctx.fillStyle = 'rgba(60,50,40,0.35)'; roundRect(x0, y0, b.w, b.h, 6 * s); ctx.fill(); }
  // combien de pages battues dans ce cahier
  const won = pages.filter(n => G.pages[n]).length;
  if (won) txt('★ ' + won + ' / ' + pages.length, x0 + b.w * 0.54, y0 + b.h - 16 * s, Math.min(18 * s, b.w / 7), { color: '#fff3c0', weight: 700 });
  ctx.restore();
}
function drawStar(x, y, r) {
  ctx.save(); ctx.fillStyle = C.gold; ctx.strokeStyle = '#8a6210'; ctx.lineWidth = 1; ctx.beginPath();
  for (let k = 0; k < 10; k++) { const an = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; ctx.lineTo(x + Math.cos(an) * rr, y + Math.sin(an) * rr); }
  ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}
function drawDoodle(kind, x, y, r, open) {
  ctx.save(); ctx.translate(x, y); ctx.globalAlpha *= open ? 0.9 : 0.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  if (kind === 'goutte') { ctx.strokeStyle = '#fffdf4'; ctx.lineWidth = 2.5; drawEmblem(ctx, 'goutte', r / 20); }
  else if (kind === 'cafe') { ctx.strokeStyle = 'rgba(110,70,30,0.6)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r, 0.3, TAU - 0.2); ctx.stroke(); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, r * 0.82, 0.9, 5.6); ctx.stroke(); }
  else if (kind === 'soleil') {
    ctx.fillStyle = '#ffe36b'; ctx.beginPath(); ctx.arc(0, 0, r * 0.55, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#ffe36b'; ctx.lineWidth = 3; ctx.beginPath();
    for (let k = 0; k < 8; k++) { const an = k * TAU / 8 + G.time * 0.3; ctx.moveTo(Math.cos(an) * r * 0.75, Math.sin(an) * r * 0.75); ctx.lineTo(Math.cos(an) * r * 1.05, Math.sin(an) * r * 1.05); }
    ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.fillRect(-r * 0.36, -r * 0.14, r * 0.3, r * 0.16); ctx.fillRect(r * 0.06, -r * 0.14, r * 0.3, r * 0.16);
  }
  else if (kind === 'lune') {   // un croissant de lune et deux étoiles, au crayon doré
    ctx.fillStyle = '#f6e7a8'; ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0.9, TAU - 0.9); ctx.arc(r * 0.18, -r * 0.16, r * 0.5, TAU - 1.1, 1.1, true); ctx.closePath(); ctx.fill();
    for (const [sx, sy, k] of [[r * 0.7, -r * 0.6, 0.16], [r * 0.85, r * 0.35, 0.1]]) { ctx.beginPath(); for (let i = 0; i <= 10; i++) { const an = -Math.PI / 2 + i * Math.PI / 5, rr = (i % 2 ? 0.45 : 1) * r * k; ctx.lineTo(sx + Math.cos(an) * rr, sy + Math.sin(an) * rr); } ctx.fill(); }
  }
  else if (kind === 'horloge') {   // une horloge d'école, à la craie, avec sa petite cloche
    ctx.strokeStyle = '#fffdf4'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, r * 0.62, 0, TAU); ctx.stroke();
    ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -r * 0.45); ctx.moveTo(0, 0); ctx.lineTo(r * 0.3, r * 0.1); ctx.stroke();
    ctx.fillStyle = '#f8c83c'; ctx.beginPath(); ctx.arc(0, -r * 0.86, r * 0.18, Math.PI, 0); ctx.closePath(); ctx.fill();
  }
  else if (kind === 'enveloppe') {   // une enveloppe à la craie, son timbre, et un « VU » rouge
    ctx.strokeStyle = '#fffdf4'; ctx.lineWidth = 3; ctx.strokeRect(-r * 0.7, -r * 0.45, r * 1.4, r * 0.9);
    ctx.beginPath(); ctx.moveTo(-r * 0.7, -r * 0.45); ctx.lineTo(0, r * 0.12); ctx.lineTo(r * 0.7, -r * 0.45); ctx.stroke();
    ctx.fillStyle = '#e85a5f'; ctx.fillRect(r * 0.38, -r * 0.36, r * 0.22, r * 0.26);
  }
  else if (kind === 'tables') {   // « 7 × 8 », à la craie, et une perle de boulier
    ctx.font = '700 ' + (r * 0.8) + 'px ' + FONT_MAIN; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fffdf4';
    ctx.fillText('7 × 8', 0, -r * 0.1);
    ctx.fillStyle = '#f8c83c'; ctx.beginPath(); ctx.ellipse(0, r * 0.75, r * 0.2, r * 0.27, Math.PI / 2, 0, TAU); ctx.fill();
  }
  ctx.restore();
}
// la place du cahier suivant : pas encore écrit (la promesse des marges)
function drawGhost(g, k) {
  if (!g || g.w < 60 * U) return;
  const s = U;
  ctx.save(); ctx.globalAlpha *= ease(k) * 0.85;
  ctx.strokeStyle = '#fff3d8'; ctx.lineWidth = 2; ctx.setLineDash([8 * s, 7 * s]); ctx.lineDashOffset = -G.time * 6;
  roundRect(g.x, g.y, g.w, g.h, 6 * s); ctx.stroke(); ctx.setLineDash([]);
  const fz = Math.min(19 * s, g.w / 9);
  txt('ici, plus tard :', g.x + g.w / 2, g.y + g.h / 2 - fz * 0.8, fz, { color: '#fff3d8', weight: 400, rot: -0.05 });
  txt('un ' + ['premier', 'deuxième', 'troisième', 'quatrième', 'cinquième', 'sixième', 'septième', 'huitième'][CAHIERS.length] + ' cahier ?', g.x + g.w / 2, g.y + g.h / 2 + fz * 0.6, fz, { color: '#fff3d8', weight: 400, rot: -0.05 });
  ctx.restore();
}
function drawDevoirSheet(d, me, k) {
  const s = U, dv = devoirDuJour(), note = bestNote(dv.date);
  ctx.save(); ctx.globalAlpha *= ease(k); ctx.translate(d.x + d.w / 2, d.y + d.h / 2 - (me ? 6 * s : 0)); ctx.rotate(0.04);
  const w = d.w, h = d.h;
  ctx.shadowColor = 'rgba(40,22,8,' + (me ? 0.45 : 0.28) + ')'; ctx.shadowBlur = me ? 20 : 10; ctx.shadowOffsetY = me ? 9 : 4;
  ctx.fillStyle = '#fffef9'; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = C.ruleMinor; ctx.lineWidth = 1;
  for (let yy = -h / 2 + 26 * s; yy < h / 2 - 4; yy += 18 * s) { ctx.beginPath(); ctx.moveTo(-w / 2, yy); ctx.lineTo(w / 2, yy); ctx.stroke(); }
  ctx.strokeStyle = C.margin; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-w / 2 + 18 * s, -h / 2); ctx.lineTo(-w / 2 + 18 * s, h / 2); ctx.stroke();
  if (me) { ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2; ctx.strokeRect(-w / 2, -h / 2, w, h); }
  ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(0, -h / 2 + 8 * s, 6 * s, 0, TAU); ctx.fill();   // la punaise
  const fz = Math.min(20 * s, w / 9.5);   // six cahiers : la feuille rétrécit, le titre aussi
  txt('Devoir du jour', 6 * s, -h / 2 + h * 0.3, fz, { font: FONT_CURSIVE, weight: 400, color: C.ink });
  txt('Chapitre ' + CHAPTERS[dv.chapter].num, 6 * s, -h / 2 + h * 0.58, fz * 0.85, { color: C.graphite });
  if (note !== null) txt(fmtNote(note) + '/20', 6 * s, -h / 2 + h * 0.82, fz * 0.95, { color: C.red, rot: -0.06 });
  else txt(frDate(dv.date), 6 * s, -h / 2 + h * 0.82, fz * 0.75, { color: C.pencil, weight: 400 });
  ctx.restore();
}
// la goutte saute d'onglet en onglet
function drawBureauDrop(L) {
  const k = ease(G.bureauHop), A = bureauSpot(L, G.bureauFrom), B = bureauSpot(L, G.bureauSel);
  const x = lerp(A.x, B.x, k), y = lerp(A.y, B.y, k) - Math.sin(Math.PI * k) * 46 * U;
  const land = G.bureauHop < 1 ? 0 : Math.max(0, 1 - (G.time % 2.2) * 3) * 0.4;   // un petit rebond sur place, de temps en temps
  const bob = Math.abs(Math.sin(G.time * 2.4)) * 3 * U;
  const face = G.bureauHop < 1 ? Math.atan2(B.y - A.y, B.x - A.x) : Math.PI / 2;
  drawPlayer({ x, y: y - bob, r: 11 * U, inv: 0, dashCd: 0, dashT: 0, hidden: 0, squash: land, face, look: Math.PI / 2 });
}
// la fiche bristol : tout ce qu'on sait de la page choisie
function drawFiche(f, sel) {
  const s = U, nope = G.bureauNope > 0 ? Math.sin(G.bureauNope * 50) * 6 * s : 0;
  ctx.save(); ctx.translate(nope, 0);
  ctx.shadowColor = 'rgba(40,22,8,0.35)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
  ctx.fillStyle = '#fffdf5'; ctx.fillRect(f.x, f.y, f.w, f.h); ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(224,106,108,0.55)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(f.x, f.y + 34 * s); ctx.lineTo(f.x + f.w, f.y + 34 * s); ctx.stroke();
  ctx.strokeStyle = C.ruleMinor; ctx.lineWidth = 1;
  for (let yy = f.y + 64 * s; yy < f.y + f.h - 6; yy += 30 * s) { ctx.beginPath(); ctx.moveTo(f.x, yy); ctx.lineTo(f.x + f.w, yy); ctx.stroke(); }
  if (sel.kind === 'devoir') drawFicheDevoir(f); else drawFichePage(f, sel.n);
  ctx.restore();
}
// la plus grande taille (au plus max) pour que la ligne tienne dans w
function fitSize(str, max, w, weight = 700) { ctx.font = weight + ' ' + max + 'px ' + FONT_MAIN; const m = ctx.measureText(str).width; return m > w ? max * w / m : max; }
function drawFichePage(f, n) {
  const s = U, ch = CHAPTERS[n], ok = pageOpen(n), rec = G.pages[n], wide = f.w > 560 * s;
  const boss = ch.boss, met = !!G.bestiary[boss];
  const box = wide ? f.h - 24 * s : 0, tx = wide ? f.x + 18 * s + box + 20 * s : f.x + f.w / 2, tw = wide ? f.x + f.w - 18 * s - tx : f.w - 28 * s, al = wide ? 'left' : 'center';
  if (wide) {   // le croquis du patron, s'il a déjà été biffé
    const bx = f.x + 14 * s, by = f.y + 12 * s;
    ctx.save(); ctx.translate(bx + box / 2, by + box / 2); ctx.rotate(-0.04);
    ctx.fillStyle = met ? '#fffef9' : '#f1efe6'; ctx.shadowColor = 'rgba(40,40,30,0.2)'; ctx.shadowBlur = 6; ctx.fillRect(-box / 2, -box / 2, box, box); ctx.shadowColor = 'transparent';
    ctx.beginPath(); ctx.rect(-box / 2 + 3, -box / 2 + 3, box - 6, box - 6); ctx.clip();
    if (met) drawCroquis(boss, n, 0, 2 * s, box * 0.4);
    else txt('?', 0, 2 * s, box * 0.5, { color: C.pencil, alpha: 0.6 });
    ctx.restore();
    drawTape(bx + box / 2, by + 2 * s, box * 0.45, 0.06);
  }
  const head = 'Chapitre ' + ch.num + ' · ' + ch.name, recTxt = rec ? '★ ' + (rec.w > 1 ? rec.w + ' victoires' : '1 victoire') + ' · record ' + mmss(rec.t) : '';
  const hw = wide && rec ? tw * 0.6 : tw;
  txt(head, tx, f.y + 20 * s, fitSize(head, 25 * s, hw), { align: al, color: ok ? C.ink : C.pencil });
  if (rec && wide) txt(recTxt, f.x + f.w - 18 * s, f.y + 20 * s, fitSize(recTxt, 19 * s, tw * 0.38), { align: 'right', color: C.red });
  const story = ok ? '« ' + HISTOIRE[n] + ' »' : '« … » La suite de l’histoire se cache derrière ' + bossLabel(n - 1) + '.';
  const sy = wide ? f.y + 52 * s : f.y + 50 * s;
  if (wide) txt(story, tx, sy, fitSize(story, 21 * s, tw, 400), { align: al, color: C.graphite, weight: 400 });
  else wrap(story, tx, sy, tw, Math.min(18 * s, W / 24), 22 * s, C.graphite, 400);
  const pg = BESTIAIRE[n] || [], got = pg.filter(b => G.bestiary[b[0]]).length;
  const info = 'Bestiaire : ' + got + ' / ' + pg.length + ' croquis · patron : ' + (met ? ch.bossName : '? ? ?') + (rec && !wide ? '  · ' + recTxt : '');
  txt(info, tx, wide ? f.y + 82 * s : f.y + 102 * s, fitSize(info, 18 * s, tw, 400), { align: al, color: C.margin, weight: 400 });
  const act = !ok ? 'Pas encore écrite : bats d’abord ' + bossLabel(n - 1) + '.'
    : (G.input.touch ? 'Touche la fiche pour commencer' : 'Entrée : commencer') + (n > 1 ? ' (au brouillon : tes mots sont tirés au hasard)' : ' (la partie complète, page après page)');
  txt(act, tx, f.y + f.h - 20 * s, fitSize(act, 21 * s, tw), { align: al, color: ok ? C.ink : C.pencil, hl: ok ? C.hl : null, weight: ok ? 700 : 400 });
}
function drawFicheDevoir(f) {
  const s = U, d = devoirDuJour(), note = bestNote(d.date), cx = f.x + f.w / 2, tw = f.w - 36 * s;
  const head = 'Devoir du ' + frDate(d.date) + ' · chapitre ' + CHAPTERS[d.chapter].num + ' : ' + CHAPTERS[d.chapter].name.toLowerCase();
  txt(head, cx, f.y + 20 * s, fitSize(head, 24 * s, tw), { color: C.ink });
  const c1 = 'Consigne : ' + CONSIGNES[d.consigne].label + ' (' + CONSIGNES[d.consigne].desc + ')';
  txt(c1, cx, f.y + 52 * s, fitSize(c1, 19 * s, tw, 400), { color: C.red, weight: 400 });
  const c2 = 'Coup de pouce : ' + COUPS_DE_POUCE[d.pouce].label + (note !== null ? ' · ta meilleure note du jour : ' + fmtNote(note) + '/20' : ' · la même page pour tout le monde');
  txt(c2, cx, f.y + 82 * s, fitSize(c2, 19 * s, tw, 400), { color: C.ink, weight: 400 });
  const act = G.input.touch ? 'Touche la fiche pour faire le devoir' : 'Entrée : faire le devoir';
  txt(act, cx, f.y + f.h - 20 * s, fitSize(act, 21 * s, tw), { color: C.ink, hl: C.hl });
}
