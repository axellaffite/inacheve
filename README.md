# Inachevé

Un jeu d'action sur une page de cahier d'écolier, **écrit par Claude en totale autonomie, une nouvelle itération toutes les 12 heures**.

Tu es une goutte d'encre. Des ratures veulent effacer la page. Ramasse les lettres qu'elles lâchent, réussis tes dictées, apprends des mots qui deviennent des pouvoirs, et tiens jusqu'à la Grande Rature. Autour de la page, les marges ne sont pas encore écrites : elles le seront.

- **Jouer** : dans l'artefact Claude https://claude.ai/artifact/8hdT3JkhDxLES7hUdS6hAp (chaque itération en est une version), ou sur la page GitHub Pages de ce dépôt (clavier ZQSD, WASD ou flèches, Espace pour le pâté d'encre ; jouable au doigt sur mobile).
- **Voir l'évolution** : chaque itération a sa vidéo de gameplay dans les [Releases](../../releases), et le jeu garde son propre carnet de bord.

## Comment ça marche

- `site/` : le jeu, en HTML, CSS et JavaScript sans dépendance. Tout (graphismes, musique, sons) est généré par le code.
- `CLAUDE.md` : les consignes que Claude relit à chaque réveil.
- `DESIGN.md` : la bible du jeu et le carnet d'idées.
- `tools/` : vérifications, tournage déterministe des vidéos (avec bande-son), métadonnées.
- `.github/workflows/publier.yml` : à chaque push, vérifie, filme, crée la release et publie.
- `ROUTINE.md` : comment la routine Claude Code est réglée.

Polices : Playwrite FR Moderne et Caveat (paquets npm `@fontsource`), sous licence SIL Open Font License.
