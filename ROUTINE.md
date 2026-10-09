# Mettre le jeu en pilote automatique (toutes les 12 h)

Le jeu évolue grâce à une **routine Claude Code** : une session Claude qui se lance toute seule dans le cloud d'Anthropic, à heure fixe, même ordinateur éteint. Elle lit `CLAUDE.md`, écrit l'itération suivante, la pousse sur `main` et **republie l'artefact du jeu** (https://claude.ai/artifact/8hdT3JkhDxLES7hUdS6hAp) : chaque itération devient une nouvelle version dans son historique. Le workflow GitHub `Publier l'itération` prend le relais : il vérifie le jeu, le filme, range la vidéo dans une Release et, si le dépôt est public, met à jour le miroir GitHub Pages.

## Une seule fois

1. **Première vidéo** : onglet *Actions → Publier l'itération → Run workflow* pour tourner la vidéo de l'itération 1. Facultatif, pour un miroir public : *Settings → Pages → Source* : **GitHub Actions** (dépôt public uniquement).
2. **La routine** : aller sur https://claude.ai/code/routines → **New routine**.
   - Nom : `Inachevé : itération suivante`
   - Instructions : copier le texte ci-dessous.
   - Dépôt : ce dépôt. Environnement : **Default**.
   - Connecteurs : tout retirer (la routine n'en a pas besoin).
   - Déclencheur : **Schedule**, quotidien à **07:07**. Pour passer à toutes les 12 h, ajouter un second déclencheur quotidien à **19:07**, ou bien lancer `/schedule update` dans Claude Code (CLI) et donner l'expression cron `7 7,19 * * *`.
   - Enregistrer, puis **Run now** pour vérifier que tout fonctionne.

## Texte des instructions de la routine

```
Tu es l'auteur autonome du jeu « Inachevé », dans ce dépôt. Lis CLAUDE.md et suis sa procédure à la lettre pour produire l'itération suivante : vérifie que la précédente a bien été publiée, choisis toi-même les nouveautés, implémente-les, vérifie, incrémente le numéro d'itération, complète le carnet de bord et DESIGN.md, adapte le montage vidéo, puis fais un commit sur main et pousse directement sur main (pas sur une branche claude/). Personne ne répondra à tes questions : décide seul. Sois ambitieux mais livre quelque chose de fini et de solide.
```

## Bon à savoir

- **Coût** : GitHub Pages, Actions (dépôt public) et Releases sont gratuits. Chaque exécution de la routine consomme le quota de ton abonnement Claude, comme une session normale ; rien n'est facturé en plus tant que les crédits d'usage supplémentaires ne sont pas activés.
- **L'artefact doit rester privé** (ou partagé sans mise à jour automatique des lecteurs) : c'est la condition pour qu'une routine puisse le republier sans demander d'autorisation. Pour un partage public, utilise le miroir GitHub Pages.
- **Si une itération casse le jeu**, le workflow refuse de la publier : la version en ligne reste la dernière qui marchait, et l'itération suivante commence par réparer.
- **Pause** : l'interrupteur en haut de la page de la routine suspend tout.
- Les routines sont en *research preview* : leur fonctionnement peut évoluer. Sur un compte Team ou Enterprise, un administrateur peut les avoir désactivées.
