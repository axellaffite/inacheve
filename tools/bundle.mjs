// Produit dist/inacheve.html : le jeu en un seul fichier (polices incluses, aucune ressource externe),
// prêt à être publié comme artefact Claude. Usage : node tools/bundle.mjs [--repo pseudo/depot]
import fs from 'node:fs';
import { ensureFonts } from './fonts.mjs';

ensureFonts();
const args = process.argv.slice(2);
const i = args.indexOf('--repo');
const repo = i >= 0 ? args[i + 1] : process.env.INACHEVE_REPO;
let html = fs.readFileSync('site/index.html', 'utf8');
html = html.replace(/url\('fonts\/([^']+)'\)/g, (_, f) => `url('data:font/woff2;base64,${fs.readFileSync('site/fonts/' + f).toString('base64')}')`);
html = html.replace(/<script src="([^"h][^"]*)"><\/script>/g, (_, f) => `<script>\n${fs.readFileSync('site/' + f, 'utf8')}\n</script>`);
html = html.replace('const LOCAL_VIDEOS = true;', 'const LOCAL_VIDEOS = false;');
if (repo) html = html.split('__REPO__').join(repo);
fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/inacheve.html', html);
console.log(`dist/inacheve.html (${(html.length / 1024).toFixed(0)} Ko)${repo ? ', dépôt ' + repo : ''}`);
