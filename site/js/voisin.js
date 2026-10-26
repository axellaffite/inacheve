// Le voisin de table (itération 25) : une goutte d'encre verte assise à côté de toi.
// Elle joue toute seule (« oui »), ou un deuxième joueur la dirige aux flèches (« à deux »).
// Elle tire avec sa plume, arrête les coups qui te visent (et en reste étourdie), et te prête un cœur quand tu n'en as plus que deux.
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

const VOISIN = {
  key: 'inacheve.voisin', ink: '#2f8a4e', deep: '#1c5c33', light: '#5fbf7f',
  orbit: 130, speed: 0.95, rate: 0.6, dmg: 0.6, range: 520,
  dizzy: 1.6, lendCd: 75, lendAt: 2, idle: 6, sayEvery: 17
};
const VOISIN_MODES = ['non', 'oui', 'à deux'];
const VOISIN_SAYS = {
  start: ['Je m’assieds à côté de toi !', 'Salut ! Je te prête ma plume verte.', 'On fait la page à deux ?'],
  lend: ['Tiens, je te prête un cœur.', 'Prends le mien, j’en ai plein.', 'Un cœur pour toi, rends-le-moi demain !'],
  dizzy: ['Aïe ! Ça pique.', 'Ouille, ma plume !', 'J’ai vu trente-six chandelles.', 'Celle-là, je l’ai prise pour toi.'],
  boss: ['Oh là là, c’est le patron !', 'On s’y met à deux ?', 'Je reste à côté de toi.'],
  idle: ['Psst… derrière toi !', 'Tu as fini la dictée ?', 'Copie pas sur moi !', 'La maîtresse regarde…', 'J’ai faim, pas toi ?', 'On fait la course ?', 'Je trace, je trace !', 'C’est quoi, ce mot ?'],
  dream: ['Je rêvasse un peu…', 'Je joue tout seul, alors.']
};

try { G.voisinMode = CAPTURE ? 0 : clamp(parseInt(localStorage.getItem(VOISIN.key) || '0', 10) || 0, 0, 2); } catch (e) { G.voisinMode = 0; }
G.v = null;

const voisinOn = () => G.voisinMode > 0 && !G.devoir;
const voisinLabel = () => VOISIN_MODES[G.voisinMode];
function toggleVoisin() {
  const n = VOISIN_MODES.length - (G.input.touch ? 1 : 0);   // au tactile, pas de deuxième clavier : « à deux » est sauté
  G.voisinMode = (G.voisinMode + 1) % n;
  try { localStorage.setItem(VOISIN.key, String(G.voisinMode)); } catch (e) { /* rien */ }
  caption(G.voisinMode === 0 ? 'Le voisin de table range ses affaires.' : G.voisinMode === 1 ? 'Le voisin de table s’assied à côté de toi.' : 'À deux : ZQSD pour toi, flèches pour le voisin.', 2.4, 'green');
  setUI();
}

/* ----- arriver, parler ----- */
function voisinSpawn(say = true) {
  const p = G.p;
  G.v = { x: clamp(p.x - 90, 40, WORLD.w - 40), y: clamp(p.y + 50, 40, WORLD.h - 40), vx: 0, vy: 0, r: 12, face: 0, look: 0, squash: 0,
    fireCd: 0.8, dizzy: 0, lendCd: 8, idle: VOISIN.idle, manual: false, say: null, sayCd: VOISIN.sayEvery, sayN: 0, label: 3, boss: false };
  if (say) voisinSay('start');
}
function voisinSay(kind) {
  const v = G.v, list = VOISIN_SAYS[kind]; if (!v || !list) return;
  v.say = { text: list[v.sayN % list.length], t: 0, dur: 2.6 }; v.sayN += 3; v.sayCd = VOISIN.sayEvery;
}

/* ----- une image du jeu ----- */
function stepVoisin(dt) {
  if (!voisinOn()) { G.v = null; return; }
  if (!G.v) voisinSpawn();
  const v = G.v, p = G.p, S = G.S;
  v.label = Math.max(0, v.label - dt); v.lendCd = Math.max(0, v.lendCd - dt); v.sayCd -= dt;
  if (v.say) { v.say.t += dt; if (v.say.t > v.say.dur) v.say = null; }
  if (G.boss && !v.boss) { v.boss = true; voisinSay('boss'); } else if (!G.boss) v.boss = false;
  if (v.sayCd <= 0 && !v.say) voisinSay('idle');
  if (v.dizzy > 0) { v.dizzy -= dt; v.face += dt * 9; }
  // où aller : aux flèches (à deux), sinon en orbite autour de toi, ou tout contre toi pour te prêter un cœur
  const wantLend = p.hp <= VOISIN.lendAt && p.hp < p.maxHp && v.lendCd <= 0;
  let ix = 0, iy = 0;
  if (G.voisinMode === 2 && !G.demo) {
    if (keys.ArrowLeft) ix -= 1; if (keys.ArrowRight) ix += 1; if (keys.ArrowUp) iy -= 1; if (keys.ArrowDown) iy += 1;
    if (ix || iy) { v.idle = VOISIN.idle; v.manual = true; }
    else if ((v.idle -= dt) <= 0 && v.manual) { v.manual = false; voisinSay('dream'); }
  }
  if (!v.manual || G.voisinMode !== 2) {
    const a = G.t * 0.7 + 2.2, R = VOISIN.orbit;
    const tx = wantLend ? p.x : p.x + Math.cos(a) * R, ty = wantLend ? p.y : p.y + Math.sin(a) * R * 0.75;
    let dx = tx - v.x, dy = ty - v.y;
    for (const e of G.enemies) {   // on s'écarte des ratures trop proches
      if (e.ghost || e.isBoss) continue;
      const ex = v.x - e.x, ey = v.y - e.y, d2 = ex * ex + ey * ey;
      if (d2 < 90 * 90 && d2 > 1) { const d = Math.sqrt(d2), k = (90 - d) * 2.2; dx += ex / d * k; dy += ey / d * k; }
    }
    const d = Math.hypot(dx, dy);
    if (d > 14) { const m = Math.min(1, d / 120); ix = dx / d * m; iy = dy / d * m; }
  }
  const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
  const still = v.dizzy > 0 || G.freeze;   // étourdi, ou « soleil ! » : il ne bouge plus
  const sp = S.speed * VOISIN.speed, k = 1 - Math.exp(-dt * 12);
  v.vx = lerp(v.vx, still ? 0 : ix * sp, k); v.vy = lerp(v.vy, still ? 0 : iy * sp, k);
  v.x = clamp(v.x + v.vx * dt, v.r, WORLD.w - v.r); v.y = clamp(v.y + v.vy * dt, v.r, WORLD.h - v.r);
  const vs = Math.hypot(v.vx, v.vy);
  if (vs > 20 && v.dizzy <= 0) { const f = Math.atan2(v.vy, v.vx); let df = f - v.face; while (df > Math.PI) df -= TAU; while (df < -Math.PI) df += TAU; v.face += df * Math.min(1, dt * 12); }
  v.squash = lerp(v.squash, Math.min(1, vs / 600), Math.min(1, dt * 10));
  // le cœur prêté
  if (wantLend && Math.hypot(v.x - p.x, v.y - p.y) < v.r + p.r + 26) {
    p.hp = Math.min(p.maxHp, p.hp + 1); v.lendCd = VOISIN.lendCd; G.voisinLends = (G.voisinLends || 0) + 1;
    addText(p.x, p.y - 34, '+ 1 cœur', VOISIN.ink, 26); AU.play('voisinLend'); voisinSay('lend');
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; G.parts.push({ x: p.x, y: p.y, vx: Math.cos(a) * 220, vy: Math.sin(a) * 220, life: 0.5, max: 0.5, size: 2.6, color: VOISIN.light, drag: 4 }); }
  }
  // il arrête les coups qui te visent… et les ratures le bousculent
  if (!G.freeze) for (const b of G.ebul) {
    if (b.wait > 0 || b.life <= 0) continue;
    if ((b.x - v.x) ** 2 + (b.y - v.y) ** 2 < (v.r + 7) ** 2) { b.life = 0; voisinHit(b.x, b.y); }
  }
  for (const e of G.enemies) {
    if (e.ghost || e.dead) continue;
    if ((e.x - v.x) ** 2 + (e.y - v.y) ** 2 < (e.r + v.r - 3) ** 2) voisinHit(e.x, e.y);
  }
  // sa plume tire toute seule, un peu moins vite et moins fort que la tienne
  v.fireCd -= dt;
  if (v.fireCd <= 0 && v.dizzy <= 0 && !G.freeze) {
    let tgt = null, bd = VOISIN.range * VOISIN.range;
    for (const e of G.enemies) { if (e.ghost) continue; const d = (e.x - v.x) ** 2 + (e.y - v.y) ** 2; if (d < bd) { bd = d; tgt = e; } }
    if (tgt) {
      v.fireCd = 1 / (S.rate * VOISIN.rate);
      const a = Math.atan2(tgt.y - v.y, tgt.x - v.x); v.look = a;
      const n = 1 + S.extra;   // les guillemets valent aussi pour lui
      for (let i = 0; i < n; i++) {
        const aa = a + (i - (n - 1) / 2) * 0.2;
        G.shots.push({ x: v.x + Math.cos(aa) * 12, y: v.y + Math.sin(aa) * 12, vx: Math.cos(aa) * S.pspeed, vy: Math.sin(aa) * S.pspeed, r: 5, life: 1.1, pierce: S.pierce, bounce: 0, hit: new Set(), px: v.x, py: v.y, voisin: true, k: VOISIN.dmg });
      }
    } else v.fireCd = 0.15;
  }
}
function voisinHit(fx, fy) {
  const v = G.v; if (v.dizzy > 0) return;
  v.dizzy = VOISIN.dizzy; G.voisinStops = (G.voisinStops || 0) + 1;
  const dx = v.x - fx, dy = v.y - fy, d = Math.hypot(dx, dy) || 1; v.vx = dx / d * 320; v.vy = dy / d * 320;
  splat(v.x, v.y, 12, VOISIN.ink, 0.12, 5); AU.play('voisinOuch');
  if (v.sayN % 2 === 0 || !v.say) voisinSay('dizzy');
}

/* ----- dessin ----- */
function drawVoisin() {
  const v = G.v; if (!v || !voisinOn() || !G.p) return;
  drawPlayer({ x: v.x, y: v.y, r: v.r, squash: v.squash, face: v.face, look: v.look, inv: 0, dashCd: 0, dashT: 0, hidden: 0 }, [VOISIN.ink, VOISIN.deep]);
  // un épi sur le dessus de la tête
  ctx.save(); ctx.strokeStyle = VOISIN.deep; ctx.lineWidth = 2.2; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(v.x - 2, v.y - v.r + 1); ctx.quadraticCurveTo(v.x + 3, v.y - v.r - 12, v.x + 9, v.y - v.r - 6); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(v.x + 1, v.y - v.r + 1); ctx.quadraticCurveTo(v.x - 1, v.y - v.r - 9, v.x - 7, v.y - v.r - 8); ctx.stroke();
  if (v.dizzy > 0) for (let i = 0; i < 3; i++) {   // des étoiles qui tournent
    const a = G.time * 5 + i * TAU / 3;
    txt('*', v.x + Math.cos(a) * 18, v.y - v.r - 10 + Math.sin(a) * 6, 20, { color: C.margin, weight: 700 });
  }
  ctx.restore();
  if (v.label > 0) txt(G.voisinMode === 2 && !G.demo ? 'voisin (flèches)' : 'voisin', v.x, v.y + v.r + 18, 17, { color: VOISIN.deep, alpha: Math.min(1, v.label), weight: 700 });
  if (v.say) drawVoisinBubble(v);
}
function drawVoisinBubble(v) {
  const s = v.say, a = Math.min(1, s.t * 6, (s.dur - s.t) * 3);
  ctx.save(); ctx.globalAlpha = a; ctx.font = '700 19px ' + FONT_MAIN;
  const w = ctx.measureText(s.text).width + 22, h = 30, x = v.x - w / 2, y = v.y - v.r - 58;
  ctx.fillStyle = '#fdfcf6'; ctx.strokeStyle = VOISIN.deep; ctx.lineWidth = 2;
  roundRect(x, y, w, h, 10); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(v.x - 6, y + h - 1); ctx.lineTo(v.x + 2, y + h + 11); ctx.lineTo(v.x + 7, y + h - 1); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(v.x - 6, y + h); ctx.lineTo(v.x + 2, y + h + 11); ctx.lineTo(v.x + 7, y + h); ctx.stroke();
  ctx.restore();
  txt(s.text, v.x, y + h / 2 + 1, 19, { color: VOISIN.deep, alpha: a, weight: 700 });
}
