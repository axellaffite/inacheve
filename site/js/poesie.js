// Chapitre XI : le cahier de poésie (itération 20). Le cinquième cahier : un dessin aux crayons de couleur à gauche,
// les poèmes recopiés à droite. Quatre ratures : le ver qui avance en accordéon, les rimes jumelles qui se répondent
// à travers la goutte, le point d'exclamation qui tombe de tout son long et le corbeau qui lâche son fromage.
// Au bout : le Grand Alexandrin, ses douze pieds, ses rimes croisées et sa césure.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const NOTES_POESIE = [
  { x: WORLD.w / 2, y: -150, t: '— cahier n° 5 · chapitre XI : le cahier de poésie —', r: -0.02 },
  { x: WORLD.w * 0.72, y: -96, t: 'ajouté : des rimes, et des crayons de couleur', r: 0.025 },
  { x: WORLD.w + 175, y: WORLD.h * 0.3, t: 'ici, plus tard :', r: 0.06 },
  { x: WORLD.w + 190, y: WORLD.h * 0.3 + 46, t: 'le cahier de textes ?', r: 0.04 },
  { x: -185, y: WORLD.h * 0.45, t: 'récitation', r: -0.07 },
  { x: -175, y: WORLD.h * 0.45 + 44, t: 'vendredi', r: -0.05 },
  { x: -160, y: WORLD.h * 0.45 + 88, t: '(par cœur !)', r: -0.04 },
  { x: WORLD.w * 0.28, y: WORLD.h + 140, t: 'dessin à gauche, poème à droite', r: 0.03 },
  { x: WORLD.w * 0.7, y: WORLD.h + 150, t: 'qui a pris le fromage ?', r: -0.03 },
  { x: WORLD.w + 165, y: WORLD.h * 0.78, t: 'un vers, deux vers…', r: 0.08 },
  { x: -170, y: WORLD.h * 0.15, t: 'souligner le titre', r: 0.05 },
  { x: WORLD.w * 0.3, y: -96, t: 'à apprendre pour demain', r: -0.02 }
];
const DICTEES_POESIE = ['VERS', 'RIME', 'PIED', 'POÈME', 'STROPHE', 'POÉSIE', 'COMPTINE', 'RÉCITER', 'ALEXANDRIN', 'RÉCITATION'];
const POESIE_TYPES = new Set(['ver', 'rime', 'exclam', 'corbeau']);
Object.assign(ETYPES, {
  ver:        { r: 14, hp: 5, speed: 112, dmg: 1, xp: 1, agil: 3 },
  rime:       { r: 18, hp: 9, speed: 96, dmg: 1, xp: 3, agil: 2.5 },
  exclam:     { r: 15, hp: 14, speed: 70, dmg: 1, xp: 4, agil: 2.5 },
  corbeau:    { r: 18, hp: 12, speed: 120, dmg: 1, xp: 4, agil: 2 },
  alexandrin: { r: 72, hp: 1300, speed: 42, dmg: 2, xp: 240, agil: 1.2, boss: true }
});

CHAPTERS.push({
  num: 'XI', name: 'Le cahier de poésie', done: 'La poésie : apprise par cœur !', paper: 'poesie', notes: NOTES_POESIE, dictees: DICTEES_POESIE,
  intro: 'Chapitre XI : le cahier de poésie. Un dessin à gauche, un poème à droite…', boss: 'alexandrin', bossName: 'Le Grand Alexandrin',
  bossIntro: 'Douze pieds sur la page : voici le Grand Alexandrin !', bossBack: 'Le Grand Alexandrin reprend au début du vers.', bossSound: 'boss11',
  scale: 54, rateOff: 240, rateCap: 21.5, waveCap: 'Toute la strophe déboule !',
  meet: {
    ver: 'Nouveau : le ver (de terre, et de poésie). Il avance en accordéon',
    rime: 'Nouveau : les rimes jumelles. Ne reste pas entre elles quand elles se répondent !',
    exclam: 'Nouveau : le point d’exclamation. Il tombe de tout son long !',
    corbeau: 'Nouveau : le corbeau. Il lâche son fromage… ramasse-le quand il est tombé !'
  },
  pick(t, r) {   // pas plus de trois exclamations ni de deux corbeaux, et six rimes au plus (jumelles comprises)
    if (t > 100 && r < 0.07 && countType('corbeau') < 2) return 'corbeau';
    if (t > 50 && r < 0.14 && countType('exclam') < 3) return 'exclam';
    return t > 25 && r < 0.25 && countType('rime') < 6 ? 'rime' : 'ver';
  },
  wave(t, i) { return t > 70 && i % 8 === 0 ? 'rime' : 'ver'; }
});

/* ---------- Le papier : un dessin à gauche, un poème à droite ---------- */
const POESIE_GX = Math.round((MARGIN_X + WORLD.w) / 2);   // le pli du cahier, entre les deux pages
const POEMES = [
  { x: POESIE_GX + 170, y: 240, title: 'La goutte', lines: ['Une goutte d’encre bleue', 'a sauté de ma plume ;', 'elle a fait le tour des cieux', 'et s’est posée sur la lune.'] },
  { x: POESIE_GX + 760, y: 336, title: 'Le brouillon', lines: ['Sur mon cahier de brouillon,', 'j’ai tout raté : c’est permis !', 'Trois ratures, un papillon,', 'et un soleil qui sourit.'] },
  { x: POESIE_GX + 170, y: 1104, title: 'La rature', lines: ['La rature a peur du noir,', 'elle dort au creux du buvard ;', 'et quand je tourne la page,', 'elle rêve qu’elle est un nuage.'] },
  { x: POESIE_GX + 760, y: 1200, title: 'Récitation', lines: ['Je sais ma poésie par cœur,', 'je la récite sans erreur,', 'je connais tout, même la fin…', 'enfin, presque. À demain ?'] }
];
const DESSINS = (() => {
  const r = mulberry32(2020), kinds = ['lune', 'arbre', 'oiseau', 'maison', 'fleur', 'bateau', 'chat', 'papillon'], out = [];
  const cw = (POESIE_GX - MARGIN_X - 120) / 3, rh = (WORLD.h - 200) / 3;
  let k = 0;
  for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) {
    if (i === 1 && j === 1) continue;   // le milieu de la page reste blanc : on y joue
    out.push({ kind: kinds[k++ % kinds.length], x: MARGIN_X + 60 + (i + 0.5) * cw + (r() - 0.5) * 60, y: 100 + (j + 0.5) * rh + (r() - 0.5) * 60, s: 1.05 + r() * 0.3, a: (r() - 0.5) * 0.25, seed: Math.floor(r() * 1e6) });
  }
  return out;
})();
let poesieCv = null;
const POESIE_RES = 0.5;
function poesieDrawings() {   // les dessins aux crayons de couleur, calculés une fois (leur hasard est à part)
  if (poesieCv) return poesieCv;
  poesieCv = document.createElement('canvas'); poesieCv.width = Math.ceil(POESIE_GX * POESIE_RES); poesieCv.height = Math.ceil(WORLD.h * POESIE_RES);
  const g = poesieCv.getContext('2d');
  g.scale(POESIE_RES, POESIE_RES); g.lineCap = 'round'; g.lineJoin = 'round';
  for (const d of DESSINS) { g.save(); g.translate(d.x, d.y); g.rotate(d.a); g.scale(d.s, d.s); drawDessin(g, d.kind, mulberry32(d.seed)); g.restore(); }
  return poesieCv;
}
// colorier une forme au crayon de couleur : des hachures serrées, un peu de travers, qui débordent à peine
function crayonne(g, path, color, r, ang = 0.7, gap = 6) {
  g.save(); g.clip(path); g.strokeStyle = color; g.globalAlpha = 0.75; g.lineWidth = 3.2;
  const c = Math.cos(ang), s = Math.sin(ang);
  g.beginPath();
  for (let k = -170; k <= 170; k += gap) {
    const j = (r() - 0.5) * 3;
    g.moveTo(-c * 170 - s * (k + j), -s * 170 + c * (k + j)); g.lineTo(c * 170 - s * (k - j), s * 170 + c * (k - j));
  }
  g.stroke(); g.restore();
}
function drawDessin(g, kind, r) {
  const P = () => new Path2D(), out = (p, w = 3) => { g.strokeStyle = 'rgba(46,46,51,0.75)'; g.lineWidth = w; g.stroke(p); };
  if (kind === 'lune') {
    const p = P(); p.arc(0, 0, 80, 0, TAU); const q = P(); q.arc(36, -22, 70, 0, TAU);
    const hole = P(); hole.rect(-200, -200, 400, 400); hole.arc(36, -22, 70, 0, TAU);   // le croissant : le disque, moins un autre disque
    g.save(); g.clip(hole, 'evenodd'); crayonne(g, p, '#f4c430', r); out(p); g.restore();
    g.save(); g.clip(p); out(q); g.restore();
    g.strokeStyle = 'rgba(46,46,51,0.75)'; g.lineWidth = 3; g.beginPath(); g.arc(-38, 6, 8, 0.2, Math.PI - 0.2); g.stroke();   // un œil qui dort
    for (const [x, y, k] of [[90, -60, 18], [110, 40, 12], [60, 90, 10]]) { const st = P(); for (let i = 0; i <= 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? k * 0.45 : k; st.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } crayonne(g, st, '#f4c430', r, -0.4, 4); out(st, 2); }
  } else if (kind === 'arbre') {
    const t = P(); t.rect(-16, 10, 32, 90); crayonne(g, t, '#8a5a2b', r, 1.4); out(t);
    const c = P(); for (const [x, y, k] of [[0, -40, 62], [-50, 0, 44], [50, 0, 44], [0, 20, 40]]) { c.moveTo(x + k, y); c.arc(x, y, k, 0, TAU); }
    crayonne(g, c, '#5aa05a', r, 0.5); out(c);
    for (const [x, y] of [[-30, -30], [26, -50], [40, 10], [-46, 14]]) { const a = P(); a.arc(x, y, 9, 0, TAU); crayonne(g, a, '#d23c3c', r, 0, 3); }
  } else if (kind === 'oiseau') {
    const br = P(); br.moveTo(-110, 60); br.quadraticCurveTo(0, 50, 110, 70); g.strokeStyle = 'rgba(138,90,43,0.8)'; g.lineWidth = 9; g.stroke(br);
    const b = P(); b.ellipse(0, 0, 58, 42, -0.15, 0, TAU); crayonne(g, b, '#3c8fc4', r); out(b);
    const w = P(); w.ellipse(-10, -4, 30, 18, -0.5, 0, TAU); crayonne(g, w, '#255f8e', r, -0.6, 4); out(w, 2);
    const be = P(); be.moveTo(54, -12); be.lineTo(84, -2); be.lineTo(54, 6); be.closePath(); crayonne(g, be, '#f19a3e', r, 0, 3); out(be, 2);
    g.fillStyle = 'rgba(46,46,51,0.85)'; g.beginPath(); g.arc(34, -14, 5, 0, TAU); g.fill();
    g.strokeStyle = 'rgba(46,46,51,0.7)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-6, 40); g.lineTo(-10, 58); g.moveTo(10, 40); g.lineTo(12, 58); g.stroke();
    g.font = '700 30px ' + FONT_MAIN; g.fillStyle = 'rgba(46,46,51,0.6)'; g.fillText('♪', 80, -50);
  } else if (kind === 'maison') {
    const w = P(); w.rect(-70, -20, 140, 110); crayonne(g, w, '#f0a238', r); out(w);
    const t = P(); t.moveTo(-88, -16); t.lineTo(0, -90); t.lineTo(88, -16); t.closePath(); crayonne(g, t, '#c8423f', r, -0.5); out(t);
    const d = P(); d.rect(-16, 30, 32, 60); crayonne(g, d, '#8a5a2b', r, 1.4, 4); out(d, 2);
    const f = P(); f.rect(30, 0, 28, 26); crayonne(g, f, '#8fd3f0', r, 0.3, 4); out(f, 2);
    const ch = P(); ch.rect(40, -82, 18, 34); crayonne(g, ch, '#9a9aa2', r, 1.2, 4); out(ch, 2);
    g.strokeStyle = 'rgba(110,110,120,0.55)'; g.lineWidth = 3; g.beginPath(); for (let k = 0; k < 30; k++) { const a = k * 0.5, rr = 3 + k * 0.6; g.lineTo(50 + Math.cos(a) * rr + k * 1.2, -92 - k * 2.4 + Math.sin(a) * rr); } g.stroke();
  } else if (kind === 'fleur') {
    const s = P(); s.moveTo(0, 10); s.quadraticCurveTo(-10, 60, 4, 110); g.strokeStyle = 'rgba(90,160,90,0.9)'; g.lineWidth = 8; g.stroke(s);
    const l = P(); l.ellipse(-26, 70, 26, 11, -0.6, 0, TAU); crayonne(g, l, '#5aa05a', r, 0.2, 4); out(l, 2);
    const pe = P(); for (let k = 0; k < 6; k++) { const a = k * TAU / 6; pe.moveTo(Math.cos(a) * 38 + 22, Math.sin(a) * 38 - 30); pe.ellipse(Math.cos(a) * 38, Math.sin(a) * 38 - 30, 22, 22, 0, 0, TAU); }
    crayonne(g, pe, '#ff8fb8', r); out(pe, 2);
    const c = P(); c.arc(0, -30, 18, 0, TAU); crayonne(g, c, '#f4c430', r, -0.6, 4); out(c, 2);
  } else if (kind === 'bateau') {
    const wv = P(); for (let x = -120; x <= 120; x += 30) { wv.moveTo(x, 70); wv.quadraticCurveTo(x + 15, 58, x + 30, 70); } g.strokeStyle = 'rgba(60,143,196,0.8)'; g.lineWidth = 5; g.stroke(wv);
    const h = P(); h.moveTo(-80, 20); h.lineTo(80, 20); h.lineTo(56, 60); h.lineTo(-56, 60); h.closePath(); crayonne(g, h, '#8a5a2b', r, 1.2); out(h);
    g.strokeStyle = 'rgba(46,46,51,0.8)'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, 20); g.lineTo(0, -90); g.stroke();
    const sa = P(); sa.moveTo(6, -86); sa.lineTo(70, 10); sa.lineTo(6, 10); sa.closePath(); crayonne(g, sa, '#e9524a', r, -0.3, 5); out(sa, 2);
    const sb = P(); sb.moveTo(-6, -70); sb.lineTo(-56, 10); sb.lineTo(-6, 10); sb.closePath(); crayonne(g, sb, '#fff1a6', r, 0.3, 5); out(sb, 2);
  } else if (kind === 'chat') {
    const b = P(); b.ellipse(0, 40, 54, 58, 0, 0, TAU); crayonne(g, b, '#9a9aa2', r); out(b);
    const hd = P(); hd.arc(0, -36, 40, 0, TAU); hd.moveTo(-36, -50); hd.lineTo(-30, -92); hd.lineTo(-8, -72); hd.moveTo(36, -50); hd.lineTo(30, -92); hd.lineTo(8, -72);
    crayonne(g, hd, '#9a9aa2', r, -0.5); out(hd);
    const tl = P(); tl.moveTo(50, 70); tl.bezierCurveTo(120, 80, 110, 0, 80, -10); g.strokeStyle = 'rgba(110,110,120,0.9)'; g.lineWidth = 10; g.stroke(tl);
    g.fillStyle = 'rgba(90,160,90,0.95)'; for (const x of [-15, 15]) { g.beginPath(); g.ellipse(x, -40, 6, 9, 0, 0, TAU); g.fill(); }
    g.strokeStyle = 'rgba(46,46,51,0.7)'; g.lineWidth = 2; g.beginPath(); for (const s of [-1, 1]) for (const dy of [-4, 4]) { g.moveTo(s * 10, -24 + dy); g.lineTo(s * 46, -28 + dy * 2.5); } g.stroke();
  } else {   // un papillon
    const w = P(); for (const [x, y, rx, ry, a] of [[-38, -26, 40, 30, -0.4], [38, -26, 40, 30, 0.4], [-30, 26, 28, 22, 0.4], [30, 26, 28, 22, -0.4]]) { w.moveTo(x + rx, y); w.ellipse(x, y, rx, ry, a, 0, TAU); }
    crayonne(g, w, '#c9a7f0', r); out(w, 2);
    const sp = P(); for (const [x, y] of [[-40, -28], [40, -28]]) { sp.moveTo(x + 12, y); sp.arc(x, y, 12, 0, TAU); } crayonne(g, sp, '#f19a3e', r, -0.7, 4);
    const bd = P(); bd.ellipse(0, 0, 8, 44, 0, 0, TAU); crayonne(g, bd, '#4a3a7a', r, 1.4, 3); out(bd, 2);
    g.strokeStyle = 'rgba(46,46,51,0.75)'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-3, -42); g.quadraticCurveTo(-12, -70, -24, -72); g.moveTo(3, -42); g.quadraticCurveTo(12, -70, 24, -72); g.stroke();
  }
}
function drawPoesie(v) {
  const x0 = Math.max(0, v.x0), x1 = Math.min(WORLD.w, v.x1), y0 = Math.max(0, v.y0), y1 = Math.min(WORLD.h, v.y1);
  if (x1 <= x0 || y1 <= y0) return;
  ctx.fillStyle = 'rgba(236,224,250,0.18)'; ctx.fillRect(x0, y0, x1 - x0, y1 - y0);   // un papier un peu lilas
  const GX = POESIE_GX;
  if (x1 > GX) {   // la page de droite est réglée : on y recopie les poèmes
    ctx.strokeStyle = 'rgba(150,130,210,0.34)'; ctx.lineWidth = 1.2 / ZOOM; ctx.beginPath();
    for (let y = Math.ceil(Math.max(y0, 96) / 48) * 48; y <= y1; y += 48) { ctx.moveTo(Math.max(x0, GX + 40), y); ctx.lineTo(x1, y); }
    ctx.stroke();
    ctx.strokeStyle = C.margin; ctx.globalAlpha = 0.6; ctx.lineWidth = 2 / ZOOM; ctx.beginPath(); ctx.moveTo(GX + 120, y0); ctx.lineTo(GX + 120, y1); ctx.stroke(); ctx.globalAlpha = 1;
    for (const pm of POEMES) if (pm.x + 620 > v.x0 && pm.x - 40 < v.x1 && pm.y + 260 > v.y0 && pm.y - 80 < v.y1) drawPoeme(pm);
  }
  if (x0 < GX) {   // la page de gauche : blanche, avec les dessins
    ctx.strokeStyle = C.margin; ctx.globalAlpha = 0.5; ctx.lineWidth = 2.2 / ZOOM; ctx.beginPath(); ctx.moveTo(MARGIN_X, y0); ctx.lineTo(MARGIN_X, y1); ctx.stroke(); ctx.globalAlpha = 1;
    const sx = x0, sw = Math.min(x1, GX) - x0;
    if (sw > 0) { ctx.save(); ctx.globalAlpha = 0.62; ctx.drawImage(poesieDrawings(), sx * POESIE_RES, y0 * POESIE_RES, sw * POESIE_RES, (y1 - y0) * POESIE_RES, sx, y0, sw, y1 - y0); ctx.restore(); }
  }
  if (x0 < GX + 70 && x1 > GX - 70) {   // le pli du cahier
    const g = ctx.createLinearGradient(GX - 70, 0, GX + 70, 0);
    g.addColorStop(0, 'rgba(90,70,120,0)'); g.addColorStop(0.45, 'rgba(90,70,120,0.13)'); g.addColorStop(0.5, 'rgba(90,70,120,0.22)'); g.addColorStop(0.55, 'rgba(90,70,120,0.13)'); g.addColorStop(1, 'rgba(90,70,120,0)');
    ctx.fillStyle = g; ctx.fillRect(GX - 70, y0, 140, y1 - y0);
  }
}
function drawPoeme(pm) {
  ctx.save(); ctx.globalAlpha = 0.42; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  ctx.font = '400 38px ' + FONT_CURSIVE; ctx.fillStyle = C.ink; ctx.fillText(pm.title, pm.x, pm.y - 6);
  const w = ctx.measureText(pm.title).width;
  ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(pm.x - 4, pm.y + 6); ctx.lineTo(pm.x + w + 8, pm.y + 4); ctx.stroke();   // souligné à la règle
  ctx.font = '400 27px ' + FONT_CURSIVE;
  pm.lines.forEach((l, i) => ctx.fillText(l, pm.x + (i % 2 ? 26 : 0), pm.y + 90 + i * 48 - 8));
  ctx.restore();
}

/* ---------- Les ratures de poésie ---------- */
const RIME_MOTS = [['MOUTON', 'CRAYON'], ['CHAPEAU', 'BATEAU'], ['SOURIS', 'TAPIS'], ['LAPIN', 'CHEMIN'], ['HIBOU', 'GENOU'], ['GIRAFE', 'CARAFE'], ['BALEINE', 'LAINE'], ['TORTUE', 'LAITUE']];
const RIME_COLS = ['#d0508a', '#3c8fc4', '#e08a2a', '#4f9a4f', '#8a4fc9', '#c8424a', '#2a9d8f', '#b0892a'];
const RIME = { orbit: 240, warn: 0.85, zap: 0.3, reach: 13 };
const EXCL = { keep: 210, aim: 0.75, fall: 0.22, down: 1.1, len: 190, reach: 20 };
const CORBEAU = { keep: 340, croa: 0.5, fall: 1.15, reach: 36, regrow: 5, life: 7 };
function stepPoesie(e, dt, dx, dy, d, slow, hid) {
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow; MV.y = dy / d * e.speed * slow;
  const p = G.p;
  if (e.type === 'ver') {   // il avance en accordéon : il se ramasse, puis il s'étire
    if (e.cyc === undefined) e.cyc = rnd(1);
    e.cyc += dt * 1.6;
    const push = Math.max(0, Math.sin(e.cyc * TAU));
    MV.x *= 0.2 + 1.7 * push; MV.y *= 0.2 + 1.7 * push;
    if (Math.hypot(e.vx, e.vy) > 8) e.rot = Math.atan2(e.vy, e.vx);
  } else if (e.type === 'rime') {   // deux rimes jumelles, de part et d'autre de la goutte, qui se répondent
    if (e.twin === undefined) {
      e.twin = null; e.pairI = (G.rimeN = (G.rimeN || 0) + 1) % RIME_MOTS.length; e.word = 0;
      if (!e.copie) {
        const t = spawnEnemy('rime', clamp(2 * p.x - e.x, 30, WORLD.w - 30), clamp(2 * p.y - e.y, 30, WORLD.h - 30));
        t.twin = e; t.pairI = e.pairI; t.word = 1; e.twin = t;
      }
    }
    const tw = e.twin && !e.twin.dead ? e.twin : null;
    if (!tw) {   // orpheline : elle ne rime plus avec rien, et elle fonce
      if (e.phase !== 'walk') e.phase = 'walk';
      MV.x *= 1.35; MV.y *= 1.35; return;
    }
    const lead = e.id < tw.id;
    const myA = Math.atan2(e.y - p.y, e.x - p.x), twA = Math.atan2(tw.y - p.y, tw.x - p.x);
    const ta = lead ? myA + 0.5 : twA + Math.PI, tx = p.x + Math.cos(ta) * RIME.orbit, ty = p.y + Math.sin(ta) * RIME.orbit;
    const gx = tx - e.x, gy = ty - e.y, gd = Math.hypot(gx, gy) || 1, sp = Math.min(e.speed * 1.3, gd * 3) * slow;
    MV.x = gx / gd * sp; MV.y = gy / gd * sp;
    if (!lead) { if (e.phase !== 'walk') { MV.x = 0; MV.y = 0; } return; }
    if (e.lk === undefined) e.lk = rnd(2, 3);
    e.lk -= dt;
    if (e.phase === 'walk') {
      if (e.lk <= 0 && d < 700 && Math.hypot(tw.x - p.x, tw.y - p.y) < 700 && !hid) { e.phase = tw.phase = 'link'; e.lk = RIME.warn; e.zapHit = false; AU.play('rimeLink'); }
      else if (e.lk <= 0) e.lk = 0.5;
    } else if (e.phase === 'link') {
      MV.x = 0; MV.y = 0;
      if (e.lk <= 0) { e.phase = tw.phase = 'zap'; e.lk = RIME.zap; AU.play('rimeZap'); }
    } else {
      MV.x = 0; MV.y = 0;
      if (!e.zapHit && p.inv <= 0 && p.dashT <= 0 && segDist(p.x, p.y, e.x, e.y, tw.x, tw.y) < RIME.reach + p.r * 0.6) { e.zapHit = true; hurtPlayer(1, (e.x + tw.x) / 2, (e.y + tw.y) / 2); }
      if (e.lk <= 0) { e.phase = tw.phase = 'walk'; e.lk = rnd(2.8, 3.6); }
    }
  } else if (e.type === 'exclam') {   // il se dresse, vise, puis tombe de tout son long
    e.pt -= dt;
    if (e.phase === 'walk') {
      if (d < EXCL.keep) { MV.x *= -0.4; MV.y *= -0.4; }
      if (e.pt <= 0 && d < 340 && !hid) { e.phase = 'aim'; e.pt = EXCL.aim; e.fa = Math.atan2(dy, dx); AU.play('exclamWarn'); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else if (e.phase === 'aim') {
      MV.x = 0; MV.y = 0;
      let da = Math.atan2(dy, dx) - e.fa; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
      e.fa += clamp(da, -dt * 1.1, dt * 1.1);
      if (e.pt <= 0) { e.phase = 'fall'; e.pt = EXCL.fall; }
    } else if (e.phase === 'fall') {
      MV.x = 0; MV.y = 0;
      if (e.pt <= 0) {
        const ex = e.x + Math.cos(e.fa) * EXCL.len, ey = e.y + Math.sin(e.fa) * EXCL.len;
        if (p.inv <= 0 && p.dashT <= 0 && segDist(p.x, p.y, e.x, e.y, ex, ey) < EXCL.reach + p.r * 0.5) hurtPlayer(1, e.x, e.y);
        splat(ex, ey, 9, '#4a3a7a', 0.18, 4);
        AU.play('exclamFall'); G.cam.shake = Math.max(G.cam.shake, 4);
        e.phase = 'down'; e.pt = EXCL.down;
      }
    } else {
      MV.x = 0; MV.y = 0;
      if (e.pt <= 0) { e.phase = 'walk'; e.pt = rnd(2.4, 3.2); }
    }
  } else if (e.type === 'corbeau') {   // il tourne au-dessus de toi, croasse… et lâche son fromage
    if (e.cheese === undefined) { e.cheese = true; e.regrow = 0; }
    e.pt -= dt; e.flap = (e.flap || 0) + dt * 11;
    if (!e.cheese) { e.regrow -= dt; if (e.regrow <= 0) e.cheese = true; }
    if (e.phase === 'walk') {
      const away = d < CORBEAU.keep ? -0.7 : 0.6;
      MV.x = (dx / d * away + dy / d * 0.9) * e.speed * slow; MV.y = (dy / d * away - dx / d * 0.9) * e.speed * slow;
      if (e.cheese && e.pt <= 0 && d < 620 && !hid) { e.phase = 'croa'; e.pt = CORBEAU.croa; AU.play('croa'); }
      else if (e.pt <= 0) e.pt = 0.5;
    } else {
      MV.x *= 0.15; MV.y *= 0.15;
      if (e.pt <= 0) {
        const tx = clamp(p.x + p.vx * 0.7, 40, WORLD.w - 40), ty = clamp(p.y + p.vy * 0.7, 40, WORLD.h - 40);
        G.fromages.push({ x0: e.x, y0: e.y, x: tx, y: ty, t: 0, landed: false, life: CORBEAU.life, rot: rnd(-0.5, 0.5) });
        e.cheese = false; e.regrow = CORBEAU.regrow; e.phase = 'walk'; e.pt = rnd(3, 4);
      }
    }
  }
}

/* ---------- Le Grand Alexandrin ---------- */
const ALEX = { step: 92, n: 12, beat: 0.2, lead: 0.75, foot: 40, stay: 1.4, cesWarn: 1.0, cesAct: 0.35, cesLen: 1700, cesW: 16, vSpeed: 250 };
function stepAlexandrin(e, dt, dx, dy, d, slow) {
  const want = d < 320 ? -0.5 : 1;
  MV.agil = e.agil; MV.x = dx / d * e.speed * slow * want; MV.y = dy / d * e.speed * slow * want;
  if (e.enter > 0) e.enter = Math.max(0, e.enter - dt * 0.5);
  const enraged = e.hp < e.maxHp / 2, p = G.p;
  e.quill = Math.max(0, (e.quill || 0) - dt);
  e.pt -= dt;
  if (e.phase === 'cast') { MV.x *= 0.15; MV.y *= 0.15; if (e.pt <= 0) { e.phase = 'walk'; e.atk = enraged ? 1.1 : 1.6; } return; }
  e.atk -= dt; if (e.atk > 0) return;
  e.atkN++;
  const m = e.atkN % (enraged ? 4 : 3);
  if (m === 1) {   // les douze pieds : une file de pas qui traverse la page, numérotés de 1 à 12
    for (const off of enraged ? [-0.32, 0.32] : [0]) {
      const a = Math.atan2(dy, dx) + off, c = Math.cos(a), s = Math.sin(a);
      for (let i = 0; i < ALEX.n; i++) {
        const side = i % 2 ? 1 : -1, u = 70 + i * ALEX.step;
        G.pieds.push({ x: e.x + c * u - s * side * 22, y: e.y + s * u + c * side * 22, a, n: i + 1, t: -(ALEX.lead + i * ALEX.beat), hit: false });
      }
    }
    e.quill = 1; AU.play('piedsWarn'); e.phase = 'cast'; e.pt = ALEX.lead + ALEX.n * ALEX.beat + 0.3;
    if (!G.piedSeen) { G.piedSeen = true; caption('Douze pieds ! Ne reste pas sur le chemin de ses pas.', 2.8, 'pink'); }
  } else if (m === 2) {   // les rimes croisées : des couronnes de A et de B, en alternance
    const n = enraged ? 12 : 9, base = Math.atan2(dy, dx);
    for (let k = 0; k < (enraged ? 6 : 4); k++) for (let i = 0; i < n; i++) {
      const an = base + (i + (k % 2 ? 0.5 : 0)) / n * TAU;
      G.ebul.push({ x: e.x + Math.cos(an) * 60, y: e.y + Math.sin(an) * 60, vx: Math.cos(an) * ALEX.vSpeed, vy: Math.sin(an) * ALEX.vSpeed, life: 4, vers: k % 2 ? 'B' : 'A', wait: k * 0.34 });
    }
    AU.play('rimesCroisees'); e.phase = 'cast'; e.pt = 1.6;
    if (!G.croisSeen) { G.croisSeen = true; caption('Rimes croisées : A, B, A, B… glisse-toi entre elles !', 2.8, 'pink'); }
  } else if (m === 0 && !enraged || m === 3) {   // la césure : un trait coupe la page en deux, là où tu es
    const a0 = rnd(TAU);
    for (const a of enraged ? [a0, a0 + Math.PI / 3] : [a0]) G.cesures.push({ x: p.x, y: p.y, a, t: 0, hit: false });
    AU.play('cesureWarn'); e.quill = 0.8; e.phase = 'cast'; e.pt = ALEX.cesWarn + ALEX.cesAct + 0.2;
    if (!G.cesureSeen) { G.cesureSeen = true; caption('La césure ! Le vers est coupé en deux : sors du trait.', 2.8, 'pink'); }
  } else {   // colère : il appelle ses vers
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU + G.t; spawnEnemy(i < 2 ? 'rime' : 'ver', clamp(e.x + Math.cos(a) * 170, 30, WORLD.w - 30), clamp(e.y + Math.sin(a) * 170, 30, WORLD.h - 30)); }
    caption('Il appelle ses vers !', 1.8, 'pink'); AU.play('boss11'); e.atk = 2;
  }
}
function cesureDist(c, x, y) { return Math.abs(-(x - c.x) * Math.sin(c.a) + (y - c.y) * Math.cos(c.a)); }
function stepPoesieFx(dt) {
  if (CH().paper !== 'poesie') return;
  const p = G.p, safe = p.inv > 0 || p.dashT > 0;
  for (const f of G.pieds) {
    const before = f.t; f.t += dt;
    if (before < 0 && f.t >= 0) {   // le pied se pose
      AU.play('pied', f.n);
      if (!safe && Math.hypot(p.x - f.x, p.y - f.y) < ALEX.foot + p.r * 0.5) { f.hit = true; hurtPlayer(1, f.x, f.y); }
    }
  }
  G.pieds = G.pieds.filter(f => f.t < ALEX.stay);
  for (const c of G.cesures) {
    c.t += dt;
    if (!c.hit && !safe && c.t >= ALEX.cesWarn && c.t < ALEX.cesWarn + ALEX.cesAct && cesureDist(c, p.x, p.y) < ALEX.cesW + p.r * 0.5) { c.hit = true; hurtPlayer(1, c.x, c.y); }
    if (c.t - dt < ALEX.cesWarn && c.t >= ALEX.cesWarn) { AU.play('cesure'); G.cam.shake = Math.max(G.cam.shake, 7); }
  }
  G.cesures = G.cesures.filter(c => c.t < ALEX.cesWarn + ALEX.cesAct + 0.25);
  for (const f of G.fromages) {
    f.t += dt;
    if (!f.landed) {
      if (f.t >= CORBEAU.fall) {
        f.landed = true; AU.play('fromage');
        if (!safe && Math.hypot(p.x - f.x, p.y - f.y) < CORBEAU.reach + p.r * 0.4) hurtPlayer(1, f.x, f.y);
        if (!G.fromageSeen) { G.fromageSeen = true; caption('Le fromage est tombé ! Ramasse-le, comme le renard.', 2.8, 'green'); }
      }
      continue;
    }
    f.life -= dt;
    if (f.life > 0 && f.t > CORBEAU.fall + 0.35 && Math.hypot(p.x - f.x, p.y - f.y) < p.r + 22) {   // miam : de l'expérience, et une lettre dorée
      f.life = 0; G.miams = (G.miams || 0) + 1; G.xp += 4; G.score += 60;
      G.items.push({ x: f.x, y: f.y, vx: 0, vy: 0, ch: pick(LETTER_POOL), value: 6, rare: true, need: false, t: 0, pull: true, rot: 0 });
      addText(f.x, f.y - 30, 'miam !', C.gold, 28); AU.play('miam');
    }
  }
  G.fromages = G.fromages.filter(f => !f.landed || f.life > 0);
}
function poesieDanger(x, y) {
  let s = 0;
  for (const f of G.pieds) if (f.t > -0.7 && f.t < 0.12 && Math.hypot(x - f.x, y - f.y) < ALEX.foot + 34) s += 4;
  for (const c of G.cesures) if (c.t < ALEX.cesWarn + ALEX.cesAct && cesureDist(c, x, y) < ALEX.cesW + 36) s += 4;
  for (const f of G.fromages) if (!f.landed && Math.hypot(x - f.x, y - f.y) < CORBEAU.reach + 40) s += 5;
  for (const e of G.enemies) {
    if (e.type === 'exclam' && (e.phase === 'aim' || e.phase === 'fall')) { if (segDist(x, y, e.x, e.y, e.x + Math.cos(e.fa) * EXCL.len, e.y + Math.sin(e.fa) * EXCL.len) < EXCL.reach + 30) s += 3.5; }
    else if (e.type === 'rime' && e.phase !== 'walk' && e.twin && !e.twin.dead && e.id < e.twin.id) { if (segDist(x, y, e.x, e.y, e.twin.x, e.twin.y) < RIME.reach + 34) s += e.phase === 'zap' ? 5 : 3.5; }
  }
  return s + rimesDanger(x, y);
}

function drawPoesieFx() {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  for (const e of G.enemies) {
    if (e.type === 'exclam' && e.phase === 'aim') {   // là où il va tomber
      ctx.save(); ctx.translate(e.x, e.y); ctx.rotate(e.fa); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.3 + 0.3 * Math.sin(G.time * 24); ctx.setLineDash([10, 8]); ctx.lineWidth = 2.5;
      ctx.strokeRect(10, -EXCL.reach, EXCL.len, EXCL.reach * 2); ctx.restore();
    } else if (e.type === 'rime' && e.phase !== 'walk' && e.twin && !e.twin.dead && e.id < e.twin.id) {   // les deux rimes se répondent
      const col = RIME_COLS[e.pairI % RIME_COLS.length], tw = e.twin;
      ctx.save(); ctx.strokeStyle = col;
      if (e.phase === 'link') { ctx.globalAlpha = 0.35 + 0.3 * Math.sin(G.time * 22); ctx.setLineDash([12, 10]); ctx.lineWidth = 3; }
      else { ctx.globalAlpha = 0.9; ctx.lineWidth = 8; }
      ctx.beginPath(); ctx.moveTo(e.x, e.y); ctx.lineTo(tw.x, tw.y); ctx.stroke();
      if (e.phase === 'zap') { ctx.globalAlpha = 0.25; ctx.lineWidth = 22; ctx.stroke(); }
      ctx.restore();
      if (e.phase === 'zap') txt('ça rime !', (e.x + tw.x) / 2, (e.y + tw.y) / 2 - 26, 24, { color: col, rot: -0.05 });
    }
  }
  for (const c of G.cesures) {   // la césure : un trait en travers de la page, avec ses deux barres obliques
    const cs = Math.cos(c.a), sn = Math.sin(c.a), L = ALEX.cesLen / 2, live = c.t >= ALEX.cesWarn;
    ctx.save(); ctx.strokeStyle = live ? '#7a3fb8' : C.red; ctx.globalAlpha = live ? 0.85 : 0.35 + 0.25 * Math.sin(G.time * 18);
    ctx.lineWidth = live ? 10 : 3; if (!live) ctx.setLineDash([16, 12]);
    ctx.beginPath(); ctx.moveTo(c.x - cs * L, c.y - sn * L); ctx.lineTo(c.x + cs * L, c.y + sn * L); ctx.stroke();
    if (live) { ctx.globalAlpha = 0.25; ctx.lineWidth = 30; ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.a); txt('//', 0, -34, 46, { color: C.red, alpha: 0.85 }); ctx.restore();
  }
  for (const f of G.pieds) {   // les douze pieds : annoncés en pointillés, puis posés à l'encre
    if (f.t < -0.8) continue;
    ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a + Math.PI / 2);
    const on = f.t >= 0;
    if (on) { ctx.globalAlpha = clamp(1 - f.t / ALEX.stay, 0, 1) * 0.85; ctx.fillStyle = '#4a3a7a'; }
    else { ctx.globalAlpha = 0.3 + 0.25 * Math.sin(G.time * 16); ctx.strokeStyle = C.red; ctx.setLineDash([6, 6]); ctx.lineWidth = 2.5; }
    ctx.beginPath(); ctx.ellipse(0, 6, 15, 24, 0, 0, TAU);
    for (let k = 0; k < 4; k++) { ctx.moveTo(-11 + k * 7.5 + 4, -26 - (k === 0 || k === 3 ? 0 : 4)); ctx.arc(-11 + k * 7.5, -26 - (k === 0 || k === 3 ? 0 : 4), 4, 0, TAU); }
    if (on) ctx.fill(); else ctx.stroke();
    ctx.restore();
    if (on && f.t < 0.6) txt(String(f.n), f.x + 30, f.y - 26, 22, { color: '#4a3a7a', alpha: 1 - f.t / 0.6 });
  }
  for (const f of G.fromages) {   // le fromage du corbeau : il tombe, puis il attend qu'on le ramasse
    if (!f.landed) {
      const q = clamp(f.t / CORBEAU.fall, 0, 1);
      ctx.save(); ctx.strokeStyle = C.red; ctx.globalAlpha = 0.45; ctx.setLineDash([8, 7]); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(f.x, f.y, CORBEAU.reach, 0, TAU); ctx.stroke(); ctx.restore();
      ctx.fillStyle = 'rgba(46,46,51,' + (0.08 + 0.2 * q) + ')'; ctx.beginPath(); ctx.ellipse(f.x, f.y, 10 + 18 * q, 5 + 8 * q, 0, 0, TAU); ctx.fill();
      const x = lerp(f.x0, f.x, q), y = lerp(f.y0, f.y, q) - Math.sin(q * Math.PI) * 120;
      drawFromage(x, y, 0.8 + 0.4 * q, f.rot + q * 6);
    } else drawFromage(f.x, f.y, 1, f.rot, Math.min(1, f.life * 2));
  }
  for (const b of G.ebul) if (b.vers) {   // les rimes croisées : des A et des B
    const col = b.vers === 'A' ? '#3e63c9' : '#8a4fc9', a = b.wait > 0 ? 0.3 + 0.2 * Math.sin(G.time * 20) : 1;
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(b.x, b.y, 12, 0, TAU); ctx.fill(); ctx.stroke(); ctx.restore();
    txt(b.vers, b.x, b.y + 1, 19, { color: col, alpha: a });
  }
}
function drawFromage(x, y, k, rot, alpha = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(k, k); ctx.globalAlpha *= alpha;
  ctx.fillStyle = '#f6cf4a'; ctx.strokeStyle = '#a07c16'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-18, 10); ctx.lineTo(18, 10); ctx.lineTo(14, -12); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#d9ab23'; for (const [hx, hy, hr] of [[-6, 4, 3], [6, 0, 2.5], [10, 6, 2]]) { ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill(); }
  ctx.restore();
}

function drawPoesieEnemy(e, fr, fl) {
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const j = (fr - 1) * 0.8;
  if (e.type === 'ver') {   // un ver de terre en béret, qui se ramasse et s'étire
    const k = 0.75 + 0.35 * Math.max(0, Math.sin((e.cyc || 0) * TAU)), L = 30 * k;
    ctx.rotate(e.rot);
    ctx.strokeStyle = fl ? C.red : '#8e4a52'; ctx.lineWidth = 13; ctx.beginPath();
    for (let i = 0; i <= 8; i++) { const u = -L + (L + 4) * i / 8, w = Math.sin(i * 1.3 + (e.cyc || 0) * 8) * 4 / k; i ? ctx.lineTo(u, w) : ctx.moveTo(u, w); }
    ctx.stroke(); ctx.strokeStyle = fl ? '#f7c6ca' : '#e89aa0'; ctx.lineWidth = 9; ctx.stroke();
    ctx.strokeStyle = 'rgba(142,74,82,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); for (let i = 1; i < 4; i++) { const u = -L + i * L / 4; ctx.moveTo(u, -4); ctx.lineTo(u, 4); } ctx.stroke();
    ctx.fillStyle = fl ? '#f7c6ca' : '#e89aa0'; ctx.beginPath(); ctx.arc(4, 0, 8, 0, TAU); ctx.fill();
    ctx.fillStyle = '#2e2e33'; ctx.beginPath(); ctx.ellipse(2, -7, 9, 4, -0.2, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(2, -10, 2, 0, TAU); ctx.fill();   // le béret
    for (const s of [-3, 3]) { ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(7, s + j * 0.3, 1.7, 0, TAU); ctx.fill(); }
  } else if (e.type === 'rime') {   // une étiquette, un mot qui rime avec celui d'en face
    const col = RIME_COLS[(e.pairI || 0) % RIME_COLS.length], orphan = e.twin === null || (e.twin && e.twin.dead), word = RIME_MOTS[(e.pairI || 0) % RIME_MOTS.length][e.word || 0];
    ctx.rotate(Math.sin(G.t * 2 + e.id) * 0.08 + (orphan ? 0.18 : 0));
    ctx.fillStyle = fl ? '#ffd0d4' : '#fffaf0'; ctx.strokeStyle = orphan ? C.red : col; ctx.lineWidth = 3;
    roundRect(-50, -15, 100, 32, 10); ctx.fill(); ctx.stroke();
    txt(word, 0, 2, word.length > 6 ? 17 : 19, { color: col });
    for (const s of [-12, 12]) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(s, -22, 6, 0, TAU); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s + j, -21, 2.6, 0, TAU); ctx.fill(); }
    if (orphan) txt('seule !', 0, 30, 16, { color: C.red, rot: 0.05 });
  } else if (e.type === 'exclam') {   // un point d'exclamation : debout, il vise ; couché, il fait toute sa longueur
    const col = fl ? '#c8424a' : '#4a3a7a';
    if (e.phase === 'fall' || e.phase === 'down') {
      const q = e.phase === 'fall' ? ease(1 - e.pt / EXCL.fall) : 1, L = EXCL.len * (0.3 + 0.7 * q);
      ctx.rotate(e.fa);
      ctx.fillStyle = 'rgba(46,46,51,0.15)'; ctx.fillRect(6, -10, L, 22);
      ctx.fillStyle = col; roundRect(4, -9, L - 34, 18, 9); ctx.fill();
      ctx.beginPath(); ctx.arc(L - 10, 0, 11, 0, TAU); ctx.fill();
      if (e.phase === 'down') for (const s of [-1, 1]) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20, s * 3 - 2); ctx.lineTo(26, s * 3 + 2); ctx.moveTo(26, s * 3 - 2); ctx.lineTo(20, s * 3 + 2); ctx.stroke(); }
      return;
    }
    if (e.phase === 'aim') ctx.translate(vrnd(-1.5, 1.5), 0);
    ctx.fillStyle = 'rgba(46,46,51,0.18)'; ctx.beginPath(); ctx.ellipse(0, 10, 14, 5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = col; roundRect(-8, -44 - j, 16, 36, 8); ctx.fill();
    ctx.beginPath(); ctx.arc(0, 2, 8, 0, TAU); ctx.fill();
    for (const s of [-3.5, 3.5]) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(s, -32 - j, 3, 0, TAU); ctx.fill(); ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(s, -31 - j, 1.5, 0, TAU); ctx.fill(); }
  } else if (e.type === 'corbeau') {   // un corbeau, son bec, et son fromage
    const dir = e.vx < 0 ? -1 : 1, flap = Math.sin(e.flap || 0), croa = e.phase === 'croa';
    ctx.scale(dir, 1);
    ctx.fillStyle = 'rgba(46,46,51,0.15)'; ctx.beginPath(); ctx.ellipse(0, 26, 18, 6, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = fl ? '#ffd0d4' : '#2a2a33'; ctx.strokeStyle = '#111116'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.ellipse(-12, -6 - flap * 10, 16, 6 + Math.abs(flap) * 4, -0.5 - flap * 0.4, 0, TAU); ctx.fill();   // l'aile du fond
    ctx.beginPath(); ctx.ellipse(0, 0, 20, 13, -0.1, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-18, 2); ctx.lineTo(-32, 8); ctx.lineTo(-30, -2); ctx.closePath(); ctx.fill();   // la queue
    ctx.beginPath(); ctx.arc(15, -8, 10, 0, TAU); ctx.fill();
    ctx.fillStyle = '#8f8a7a'; ctx.beginPath(); ctx.moveTo(23, -11); ctx.lineTo(36, croa ? -14 : -8); ctx.lineTo(23, -5); ctx.closePath(); ctx.fill();
    if (croa) { ctx.beginPath(); ctx.moveTo(23, -6); ctx.lineTo(34, 0); ctx.lineTo(23, -3); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(17, -11, 3, 0, TAU); ctx.fill(); ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(18, -11, 1.5, 0, TAU); ctx.fill();
    ctx.fillStyle = fl ? '#ffd0d4' : '#3a3a44'; ctx.beginPath(); ctx.ellipse(-4, -10 + flap * 12, 18, 6 + Math.abs(flap) * 3, -0.6 + flap * 0.5, 0, TAU); ctx.fill();   // l'aile de devant
    if (e.cheese && !croa) drawFromage(38, -6, 0.55, 0.3);
    if (croa) { ctx.scale(dir, 1); txt('Croâ !', 0, -36, 20, { color: C.graphite, rot: -0.1 }); }
  }
}
function drawAlexandrin(e, fr, fl) {
  const enraged = e.hp < e.maxHp / 2, j = (fr - 1) * 1.4;
  ctx.save(); if (enraged) ctx.translate(vrnd(-1.5, 1.5), vrnd(-1.5, 1.5));
  ctx.fillStyle = 'rgba(46,46,51,0.15)'; ctx.beginPath(); ctx.ellipse(0, 78, 120, 18, 0, 0, TAU); ctx.fill();
  // le parchemin, roulé aux deux bouts
  ctx.fillStyle = fl ? '#fff3c0' : '#f3e6c4'; ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 3;
  roundRect(-96, -58, 192, 118, 8); ctx.fill(); ctx.stroke();
  for (const s of [-1, 1]) {
    ctx.fillStyle = fl ? '#fff' : '#e2cf9f'; ctx.beginPath(); ctx.ellipse(s * 100, 1, 15, 66, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(138,106,58,0.6)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(s * 100, 1, 7, 50, 0, 0, TAU); ctx.stroke(); ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 3;
  }
  // les vers écrits dessus (douze pieds : douze petits traits)
  ctx.strokeStyle = 'rgba(29,58,138,0.45)'; ctx.lineWidth = 2.2; ctx.beginPath();
  for (let l = 0; l < 3; l++) for (let k = 0; k < 12; k++) { const x = -78 + k * 13.5, y = 26 + l * 11; ctx.moveTo(x, y); ctx.lineTo(x + 8 + Math.sin(k * 3 + l) * 2, y + Math.sin(k + l * 2 + G.time * 2) * 1.2); }
  ctx.stroke();
  txt('XII', 0, -44, 18, { color: '#8a6a3a', weight: 700 });
  // la couronne de laurier
  ctx.strokeStyle = '#4f9a4f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -40, 78, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke();
  for (let k = 0; k < 9; k++) {
    const a = Math.PI * 1.17 + k * Math.PI * 0.085, x = Math.cos(a) * 78, y = -40 + Math.sin(a) * 78;
    ctx.fillStyle = k % 2 ? '#5aa05a' : '#4f9a4f'; ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2 + (k % 2 ? 0.6 : -0.6)); ctx.beginPath(); ctx.ellipse(0, -8, 5, 11, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
  // la plume, levée quand il écrit
  ctx.save(); ctx.translate(92, -40); ctx.rotate(-0.5 - (e.quill > 0 ? 0.5 : 0) + Math.sin(G.time * 2) * 0.05);
  ctx.fillStyle = '#fdfcf6'; ctx.strokeStyle = '#6d6d74'; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-20, -50, 4, -96); ctx.quadraticCurveTo(22, -50, 0, 0); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(3, -90); ctx.stroke(); ctx.restore();
  // les yeux, la bouche
  const la = Math.atan2(G.p.y - e.y, G.p.x - e.x);
  for (const s of [-1, 1]) {
    const ex = s * 30, ey = -12;
    ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(ex, ey, 13, 0, TAU); ctx.fill(); ctx.strokeStyle = '#8a6a3a'; ctx.lineWidth = 2.5; ctx.stroke();
    ctx.fillStyle = C.graphite; ctx.beginPath(); ctx.arc(ex + Math.cos(la) * 5, ey + Math.sin(la) * 5 + j * 0.3, 5.5, 0, TAU); ctx.fill();
    if (enraged) { ctx.strokeStyle = '#4a3a2a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ex + s * 14, ey - 22); ctx.lineTo(ex - s * 10, ey - 15); ctx.stroke(); ctx.fillStyle = 'rgba(224,106,108,0.5)'; ctx.beginPath(); ctx.arc(ex + s * 10, ey + 20, 8, 0, TAU); ctx.fill(); }
  }
  ctx.strokeStyle = '#4a3a2a'; ctx.lineWidth = 3; ctx.beginPath();
  if (e.phase === 'cast') { ctx.ellipse(0, 10, 10, 7, 0, 0, TAU); } else if (enraged) { ctx.moveTo(-14, 12); ctx.lineTo(14, 12); } else ctx.arc(0, 2, 14, 0.4, Math.PI - 0.4);
  ctx.stroke();
  ctx.restore();
}
