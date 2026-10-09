// Copie les polices (paquets npm @fontsource, licence SIL OFL) dans site/fonts/.
// Appelé automatiquement par record.mjs et bundle.mjs ; nécessite « npm ci ».
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FONTS = [
  ['@fontsource/playwrite-fr-moderne/files/playwrite-fr-moderne-latin-400-normal.woff2', 'cursive-400.woff2'],
  ['@fontsource/caveat/files/caveat-latin-400-normal.woff2', 'main-400.woff2'],
  ['@fontsource/caveat/files/caveat-latin-700-normal.woff2', 'main-700.woff2'],
  ['@fontsource/playwrite-fr-moderne/LICENSE', 'LICENSE-playwrite.txt'],
  ['@fontsource/caveat/LICENSE', 'LICENSE-caveat.txt']
];

export function ensureFonts() {
  fs.mkdirSync('site/fonts', { recursive: true });
  for (const [src, dst] of FONTS) {
    const to = path.join('site/fonts', dst);
    if (fs.existsSync(to)) continue;
    const from = path.join('node_modules', src);
    if (!fs.existsSync(from)) throw new Error(`Police introuvable (${src}) : lance « npm ci » d'abord.`);
    fs.copyFileSync(from, to);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) { ensureFonts(); console.log('Polices prêtes dans site/fonts/.'); }
