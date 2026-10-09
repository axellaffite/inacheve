// Vérifications rapides, sans navigateur : syntaxe JS, cohérence de l'itération et du carnet de bord.
import fs from 'node:fs';
import vm from 'node:vm';
import { readMeta } from './meta.mjs';

const html = fs.readFileSync('site/index.html', 'utf8');
const errors = [];
const scripts = [...html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
if (!scripts.length && !/<script[^>]*\bsrc=/.test(html)) errors.push('aucun script trouvé');
scripts.forEach((code, i) => { try { new vm.Script(code, { filename: `inline-${i}.js` }); } catch (e) { errors.push(`script ${i} : ${e.message}`); } });
let allCode = scripts.join('\n');
for (const m of html.matchAll(/<script[^>]*\bsrc="([^"]+)"/g)) {
  const src = m[1];
  if (/^https?:/.test(src)) continue;
  if (!fs.existsSync('site/' + src)) { errors.push(`${src} : fichier introuvable`); continue; }
  const code = fs.readFileSync('site/' + src, 'utf8'); allCode += '\n' + code;
  try { new vm.Script(code, { filename: src }); } catch (e) { errors.push(`${src} : ${e.message}`); }
}

let meta;
try { meta = readMeta(); } catch (e) { errors.push(e.message); }
if (meta) {
  const { GAME_META: M, JOURNAL: J } = meta;
  if (!Number.isInteger(M.iteration) || M.iteration < 1) errors.push('GAME_META.iteration doit être un entier >= 1');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(M.date)) errors.push('GAME_META.date doit être au format AAAA-MM-JJ');
  if (!M.title) errors.push('GAME_META.title manquant');
  J.forEach((j, i) => {
    if (j.iteration !== i + 1) errors.push(`JOURNAL[${i}] devrait être l'itération ${i + 1} (trouvé ${j.iteration}) : ne jamais supprimer d'entrée`);
    if (!j.title || !Array.isArray(j.notes) || !j.notes.length) errors.push(`JOURNAL[${i}] : titre ou notes manquants`);
  });
  if (J.length && J[J.length - 1].iteration !== M.iteration) errors.push(`la dernière entrée du JOURNAL (${J[J.length - 1].iteration}) ne correspond pas à GAME_META.iteration (${M.iteration})`);
  if (!allCode.includes('window.__cap')) errors.push("l'API de capture window.__cap a disparu : tools/record.mjs ne pourra plus filmer");
  if (errors.length === 0) console.log(`OK : itération ${M.iteration} « ${M.title} », ${J.length} entrée(s) au carnet.`);
}
if (errors.length) { console.error('Problèmes :\n- ' + errors.join('\n- ')); process.exit(1); }
