// Les unions (itération 9) : trois nouveaux mots composés, CALLIGRAPHIE, CITATION et LUNE ROUSSE,
// et le carnet des unions, la dernière page du bestiaire, qui garde les mots composés déjà découverts.
'use strict';

Object.assign(MOTS, {
  CALLIGRAPHIE: { label: 'CALLIGRAPHIE', from: ['PLUME', 'ENCRE'], max: 1, desc: 'Tu écris en marchant : ton sillage d’encre brûle les ratures.', eff: () => 'un trait qui brûle derrière toi', frag: 'la calligraphie' },
  CITATION:     { label: 'CITATION', from: ['GUILLEMETS', 'ITALIQUE'], max: 1, desc: 'Une phrase entre guillemets traverse la page et coupe la parole aux ratures.', eff: () => 'une citation toutes les 4 s', frag: 'une citation' },
  LUNE_ROUSSE:  { label: 'LUNE ROUSSE', from: ['LUNE', 'FEU'], max: 1, desc: 'Tes lunes s’embrasent et mettent le feu à tout ce qu’elles cognent.', eff: () => 'les lunes brûlent', frag: 'la lune rousse' }
});
const UNIONS = Object.keys(MOTS).filter(isCompose);

/* ----- CALLIGRAPHIE : un sillage en pleins et déliés, qui brûle ----- */
const SILLAGE = { life: 1.4, gap: 12, hot: 0.08, tick: 0.3, dmg: 2.2, w: 15, max: 140 };
function stepTrail() {
  const p = G.p, T = G.trail;
  let k = 0; while (k < T.length && G.t - T[k].b > SILLAGE.life) k++;
  if (k) T.splice(0, k);
  if (!lvl('CALLIGRAPHIE')) return;
  const last = T[T.length - 1];
  if (!last || (last.x - p.x) ** 2 + (last.y - p.y) ** 2 > SILLAGE.gap ** 2) {
    T.push({ x: p.x, y: p.y, b: G.t });
    if (last && T.length % 4 === 0) inkLine(last.x, last.y, p.x, p.y, 0.05, 5);   // la page en garde une trace, qui sèche
    if (T.length > SILLAGE.max) T.shift();
  }
  for (let i = 1; i < T.length; i += 2) {
    const q = T[i]; if (G.t - q.b < SILLAGE.hot) continue;
    query(q.x, q.y, 70, tmpA);
    for (const e of tmpA) {
      if (e.dead || e.ghost || (e.trailT || 0) > G.t || (e.x - q.x) ** 2 + (e.y - q.y) ** 2 > (e.r + 12) ** 2) continue;
      e.trailT = G.t + SILLAGE.tick; hurtEnemy(e, SILLAGE.dmg * G.S.dmg, 'trail');
      G.parts.push({ x: q.x + rnd(-6, 6), y: q.y + rnd(-6, 6), vx: rnd(-40, 40), vy: rnd(-90, -30), life: 0.4, max: 0.4, size: rnd(2, 3.5), color: C.inkLight, drag: 2 });
    }
  }
}
// l'encre fraîche est bleu nuit, puis elle pâlit vers la couleur du papier
const trailInk = k => { const m = (a, b) => Math.round(a + (b - a) * (1 - k) * 0.85); return 'rgb(' + m(18, 253) + ',' + m(39, 252) + ',' + m(95, 246) + ')'; };
function drawTrail() {
  const T = G.trail; if (T.length < 2) return;
  ctx.save(); ctx.lineCap = 'round';
  for (let i = 1; i < T.length; i++) {
    const a = T[i - 1], b = T[i], age = (G.t - b.b) / SILLAGE.life, k = 1 - age;
    if ((a.x - b.x) ** 2 + (a.y - b.y) ** 2 > 60 * 60) continue;   // pâté : on ne relie pas les points trop lointains
    ctx.strokeStyle = trailInk(k);   // opaque : les bouts ronds ne se superposent pas en pointillés
    ctx.lineWidth = nibW(a.x, a.y, b.x, b.y, SILLAGE.w) * (0.55 + 0.45 * k);
    ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
  }
  ctx.restore();
}

/* ----- CITATION : une phrase entre guillemets qui transperce tout ----- */
const CITATIONS = ['il était une fois', 'à suivre…', 'point à la ligne', 'la plume est légère', 'fin du chapitre', 'encore une page',
  'l’encre ne ment pas', 'on recommence', 'ceci n’est pas une rature', 'et la page fut blanche', 'tout s’efface, sauf ceci', 'lu et approuvé'];
// et quelques-unes propres à chaque page du cahier
const CITATIONS_CH = [null, null,
  ['do, ré, mi', 'da capo', 'un soupir, deux temps', 'la note juste', 'en mesure !'],
  ['CQFD', 'à main levée', 'au millimètre près', 'mesure deux fois, trace une fois', 'la ligne droite'],
  ['X marque l’endroit', 'terre en vue !', 'cap au nord', 'ohé, du bateau !', 'à l’abordage'],
  ['pleins et déliés', 'une belle main', 'à la plume', 'lu et signé', 'sans un pâté'],
  ['ex-libris', 'prête-moi ta plume', 'pour écrire un mot', 'fin… ou presque', 'à suivre, page suivante']];
const QUOTE = { cd: 4, speed: 480, life: 1.9, size: 34, thick: 18, write: 0.3 };
function stepCitations(dt) {
  if (lvl('CITATION')) {
    G.quoteCd -= dt;
    if (G.quoteCd <= 0 && G.enemies.length) {
      const p = G.p; let best = null, bn = -1;
      for (let i = 0; i < 7; i++) { const e = pick(G.enemies); if (e.dead || e.ghost || Math.hypot(e.x - p.x, e.y - p.y) > 620) continue; const n = query(e.x, e.y, 120, tmpA).length + (e.isBoss ? 6 : 0); if (n > bn) { bn = n; best = e; } }
      if (best) {
        G.quoteCd = QUOTE.cd;
        const a = Math.atan2(best.y - p.y, best.x - p.x), text = '« ' + pick((CITATIONS_CH[G.chapter] || []).concat(CITATIONS)) + ' »';
        G.quotes.push({ x: p.x + Math.cos(a) * 30, y: p.y + Math.sin(a) * 30, a, vx: Math.cos(a) * QUOTE.speed, vy: Math.sin(a) * QUOTE.speed, text, half: text.length * QUOTE.size * 0.21, t: 0, hit: new Set() });
        AU.play('citation');
      } else G.quoteCd = 0.3;
    }
  }
  const dmg = (9 + 2 * lvl('GUILLEMETS')) * G.S.dmg;
  for (const q of G.quotes) {
    q.t += dt; q.x += q.vx * dt; q.y += q.vy * dt;
    const w = q.half * Math.min(1, q.t / QUOTE.write), cx = Math.cos(q.a) * w, cy = Math.sin(q.a) * w;
    const x1 = q.x - cx, y1 = q.y - cy, x2 = q.x + cx, y2 = q.y + cy;
    query(q.x, q.y, q.half + 80, tmpA);
    for (const e of tmpA) {
      if (e.dead || e.ghost || q.hit.has(e.id)) continue;
      const d = e.type === 'regle' ? regleDist(e, q.x, q.y) : segDist(e.x, e.y, x1, y1, x2, y2) - e.r;
      if (d > QUOTE.thick) continue;
      q.hit.add(e.id); hurtEnemy(e, e.isBoss ? dmg * 2 : dmg, 'citation', Math.cos(q.a), Math.sin(q.a));
      for (let i = 0; i < 5; i++) G.parts.push({ x: e.x, y: e.y, vx: Math.cos(q.a) * rnd(80, 260) + rnd(-60, 60), vy: Math.sin(q.a) * rnd(80, 260) + rnd(-60, 60), life: 0.4, max: 0.4, size: rnd(2, 4), color: i % 2 ? C.ink : C.gold, drag: 4 });
    }
    // les guillemets coupent la parole : les projectiles traversés disparaissent
    for (const b of G.ebul) if (!(b.wait > 0) && Math.abs(b.x - q.x) < q.half + 30 && Math.abs(b.y - q.y) < q.half + 30 && segDist(b.x, b.y, x1, y1, x2, y2) < QUOTE.thick) b.life = 0;
  }
  G.quotes = G.quotes.filter(q => q.t < QUOTE.life && q.x > -300 && q.y > -300 && q.x < WORLD.w + 300 && q.y < WORLD.h + 300);
}
function drawCitations() {
  for (const q of G.quotes) {
    const n = Math.ceil(q.text.length * Math.min(1, q.t / QUOTE.write)), s = q.text.slice(0, n);
    const fade = Math.min(1, (QUOTE.life - q.t) * 3);
    // le texte reste lisible : jamais la tête en bas
    let a = q.a; if (Math.cos(a) < 0) a += Math.PI;
    ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(a); ctx.globalAlpha = fade;
    ctx.font = 'italic 700 ' + QUOTE.size + 'px ' + FONT_MAIN; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const w = ctx.measureText(q.text).width;
    drawHighlight(-w / 2 - 8, -QUOTE.size * 0.34, w + 16, QUOTE.size * 0.72, C.hl);
    ctx.fillStyle = C.inkDeep; ctx.textAlign = 'left'; ctx.fillText(s, -w / 2, 1);
    ctx.restore();
  }
}

/* ----- LUNE ROUSSE : les lunes mettent le feu ----- */
function moonFire(e, mx, my) {
  e.burn = 2.4; e.burnDps = Math.max(e.burnDps, 1.4 + 0.35 * G.S.moons);
  for (let i = 0; i < 4; i++) G.parts.push({ x: mx + rnd(-8, 8), y: my + rnd(-8, 8), vx: rnd(-50, 50), vy: rnd(-120, -40), life: 0.45, max: 0.45, size: rnd(2.5, 4.5), color: C.fire, drag: 1.5 });
}
function moonSparks(dt) {
  if (!lvl('LUNE_ROUSSE') || !G.S.moons) return;
  const R = 74 + 6 * G.S.moons;
  for (let i = 0; i < G.S.moons; i++) if (rand() < dt * 9) {
    const a = G.moonA + i / G.S.moons * TAU;
    G.parts.push({ x: G.p.x + Math.cos(a) * R + rnd(-5, 5), y: G.p.y + Math.sin(a) * R + rnd(-5, 5), vx: rnd(-15, 15), vy: rnd(-70, -30), life: 0.4, max: 0.4, size: rnd(2, 3.5), color: C.fire, drag: 1 });
  }
}

function stepUnions(dt) { stepTrail(); stepCitations(dt); moonSparks(dt); }

/* ----- le carnet des unions : la dernière page du bestiaire ----- */
G.unions = {};
if (!CAPTURE) {
  try {
    const raw = JSON.parse(localStorage.getItem('inacheve.unions') || '[]');
    if (Array.isArray(raw)) for (const k of raw) if (UNIONS.includes(k)) G.unions[k] = 1;
  } catch (e) { G.unions = {}; }
}
const unionPage = () => CHAPTERS.length;
const unionCount = () => UNIONS.filter(k => G.unions[k]).length;
function saveUnions() {
  if (CAPTURE) return;
  try { localStorage.setItem('inacheve.unions', JSON.stringify(Object.keys(G.unions))); } catch (e) { /* rien */ }
}
// Un mot composé choisi pour la première fois : il entre au carnet
function noteUnion(k) {
  if (!isCompose(k) || G.unions[k]) return;
  G.unions[k] = 1; G.newUnions = (G.newUnions || 0) + 1;
  G.texts.push({ x: G.p.x, y: G.p.y - 64, text: 'au carnet des unions : ' + unionCount() + ' / ' + UNIONS.length, color: C.gold, size: 22, t: -0.4, dur: 1.6 });
  saveUnions();
}
function drawUnionCell(k, i, c, a) {
  const M = MOTS[k], s = U, known = !!G.unions[k], small = c.w < 200 * s;
  const bw = c.w - 16 * s, bh = c.h - 18 * s, tilt = ((i * 53) % 7 - 3) * 0.01;
  ctx.save(); ctx.globalAlpha = a;
  ctx.translate(c.x + c.w / 2, c.y + 8 * s + bh / 2); ctx.rotate(tilt);
  ctx.shadowColor = 'rgba(40,40,30,0.2)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  ctx.fillStyle = known ? '#fffef9' : '#f1efe6'; ctx.fillRect(-bw / 2, -bh / 2, bw, bh);
  ctx.shadowColor = 'transparent';
  // fiche bristol, comme au moment du choix
  const top = -bh / 2 + Math.min(46 * s, bh * 0.28), ty = -bh / 2 + Math.min(25 * s, bh * 0.15);
  ctx.strokeStyle = C.margin; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(-bw / 2, top); ctx.lineTo(bw / 2, top); ctx.stroke();
  ctx.strokeStyle = C.ruleMinor; ctx.lineWidth = 1; ctx.beginPath(); for (let y = top + 22 * s; y < bh / 2 - 4; y += 22 * s) { ctx.moveTo(-bw / 2, y); ctx.lineTo(bw / 2, y); } ctx.stroke();
  ctx.strokeStyle = known ? C.gold : 'rgba(201,146,27,0.35)'; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.strokeRect(-bw / 2 + 5, -bh / 2 + 5, bw - 10, bh - 10); ctx.setLineDash([]);
  const fs = Math.min(30 * s, bw / Math.max(6, M.label.length * 0.62)), ff = Math.min(17 * s, bw / 15);
  if (known) {
    txt(M.label, 0, ty, fs, { color: C.ink, hl: C.hlGold });
    txt(M.from.map(f => MOTS[f].label).join(' + '), 0, top + 16 * s, ff, { color: C.gold });
    if (!small) { wrap(M.desc, 0, top + 46 * s, bw - 26 * s, ff, ff * 1.2, C.graphite, 400); txt(M.eff(0), 0, bh / 2 - 24 * s, ff * 1.1, { color: C.ink }); }
  } else {
    ctx.save(); ctx.beginPath(); ctx.rect(-bw / 2 + 3, top + 2, bw - 6, bh / 2 - top - 5); ctx.clip();
    ctx.strokeStyle = 'rgba(109,109,116,0.22)'; ctx.lineWidth = 1.2; ctx.beginPath();
    for (let x = -bw; x < bw; x += 14 * s) { ctx.moveTo(x, bh / 2); ctx.lineTo(x + bh, -bh / 2); } ctx.stroke(); ctx.restore();
    txt('? ? ?', 0, ty, fs, { color: C.pencil });
    txt('?', 0, (top + bh / 2) / 2 + 8 * s, Math.min(bh * 0.4, 90 * s), { color: C.pencil, alpha: 0.18 });
    // un indice : le premier mot de l'union
    txt(MOTS[M.from[0]].label + ' + ?', 0, top + 16 * s, ff, { color: C.pencil, weight: 400 });
    if (!small) txt('deux mots au niveau 2…', 0, top + 46 * s, ff, { color: C.pencil, weight: 400 });
  }
  ctx.restore();
  ctx.save(); ctx.globalAlpha = a; drawTape(c.x + c.w / 2, c.y + 8 * s, Math.min(60 * s, bw * 0.4), tilt * 2); ctx.restore();
}
