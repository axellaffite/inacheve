// Lit GAME_META et JOURNAL dans site/js/meta.js.
// Usage : node tools/meta.mjs            -> JSON complet
//         node tools/meta.mjs iteration  -> le numéro d'itération
//         node tools/meta.mjs tag        -> iteration-001
//         node tools/meta.mjs notes      -> notes de version (Markdown) de l'itération courante
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

export function readMeta(file = 'site/js/meta.js') {
  const code = fs.readFileSync(file, 'utf8');
  if (!code.includes('const GAME_META') || !code.includes('const JOURNAL')) throw new Error('GAME_META ou JOURNAL introuvable dans ' + file);
  return new Function('window', code + '\nreturn { GAME_META, JOURNAL };')({});
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { GAME_META, JOURNAL } = readMeta();
  const cur = JOURNAL.find(j => j.iteration === GAME_META.iteration) || {};
  const what = process.argv[2];
  if (what === 'iteration') console.log(GAME_META.iteration);
  else if (what === 'title') console.log(GAME_META.title);
  else if (what === 'tag') console.log('iteration-' + String(GAME_META.iteration).padStart(3, '0'));
  else if (what === 'notes') console.log(`**${cur.title || GAME_META.title}** (${GAME_META.date})\n\n` + (cur.notes || []).map(n => '- ' + n).join('\n') + '\n\nVidéo de gameplay en pièce jointe. Écrit en autonomie par Claude.');
  else console.log(JSON.stringify({ GAME_META, JOURNAL }, null, 2));
}
