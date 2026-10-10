# Inachevé : la bible

Document vivant, tenu à jour à chaque itération. Il décrit le jeu tel qu'il est, puis les idées pour la suite.

## Le concept

Un monde est en train d'être écrit, et c'est un cahier d'écolier à grands carreaux. Le joueur est une goutte d'encre échappée de la plume. Des ratures (gribouillis, biffures, taches, gommes) veulent effacer la page. On survit, on ramasse les lettres qu'elles lâchent, on apprend des mots qui deviennent des pouvoirs, et on finit le chapitre en battant la Grande Rature.

Le méta-récit est le cœur du projet : **le jeu est réellement inachevé**. Autour de la page, les marges grises sont « pas encore écrites » et portent des notes au crayon (« ici, plus tard : une autre page ? »). Chaque itération écrit un peu plus du monde. Les notes des marges sont des promesses que les itérations suivantes peuvent tenir.

## Identité

- Ton : livre jeunesse malicieux, poétique, jamais méchant. Vocabulaire de l'école française (dictée, pâté, marge, bon point, cahier, buvard).
- Couleurs : papier `#fdfcf6`, encre bleue `#1d3a8a`, crayon `#2e2e33`, rouge de marge et de correction `#c8424a` / `#e06a6c`, réglure Seyès bleu-violet, non-écrit gris clair `#ebeae3`.
- Accent unique : **le surligneur fluo** (jaune, rose, vert) pour ce qui compte (sous-titres, lettre attendue, mot choisi). Ne pas en abuser.
- Polices (dans `site/fonts/`, licence OFL) : Playwrite FR Moderne (cursive scolaire française) pour les grands titres, Caveat pour tout le reste.
- Trait « bouillonnant » : les ratures sont dessinées en trois variantes qui alternent 8 fois par seconde, comme une animation dessinée à la main.
- L'encre s'accumule : chaque rature biffée laisse une tache sur la page ; les gommes l'effacent. Depuis l'itération 3, l'encre sèche : une fois par seconde, toutes les taches pâlissent un peu (`dryStains`), sans jamais disparaître tout à fait.

## Systèmes (itération 1)

- **États** : `title`, `play`, `levelup`, `pause`, `gameover`, `victory`. Après la victoire : « page libre » (mode sans fin, la Grande Rature revient toutes les 3 minutes).
- **Monde** : une page de 44 × 31 grands carreaux (64 px), marge rouge à 3 carreaux du bord gauche, entourée de non-écrit.
- **Joueur** : goutte d'encre, 6 cœurs (7 en démo). Tir automatique sur la rature la plus proche (la Grande Rature est prioritaire). « Pâté d'encre » (Espace) : une ruée invulnérable qui laisse des flaques qui ralentissent et brûlent.
- **Ratures** : gribouillis (base), gouttelette (issue d'une tache), biffure (vise puis charge en ligne droite, ligne rouge d'avertissement), tache (lente, solide, se divise), gomme (rapide, 2 dégâts, efface l'encre), Grande Rature (boss à 3:00 : salves de traits rouges, puis sous 50 % de vie : invocations et charges).
- **Directeur** : le débit d'apparition monte avec le temps (plafonné), vagues en anneau toutes les 45 s, boss à 180 s.
- **Lettres** : chaque rature lâche des lettres (fréquences du français) qui valent de l'expérience ; lettrines dorées rares. Les lettres oubliées finissent par ramper vers le joueur.
- **Dictée** : un mot à compléter dans l'ordre (PLUME, ENCRE, MARGE…). La lettre attendue est surlignée au sol. Mot complété : un cœur, de l'expérience, et le mot suivant (plus long).
- **Mots-pouvoirs** (choix 1 parmi 3 à chaque niveau) : ENCRE (dégâts), VIRGULE (cadence), GUILLEMETS (éventail), ÉCHO (rebonds), ITALIQUE (traversée), LUNE (orbites), FEU (brûlure), POINT (frappe de zone périodique), VENT (recul), AIMANT (collecte), PLUME (vitesse, pâté), SOUFFLE (cœur max).
- **Phrase de fin** : la partie se résume en une phrase générée à partir des mots les plus forts (« Grâce à une virgule, la lune eut le dernier mot. »).
- **Son** : 100 % synthétisé en WebAudio (kalimba en ré dorien, bruitages de plume). Les vidéos rejouent les mêmes sons dans un `OfflineAudioContext`.
- **Démo automatique** : un pilote évalue 16 directions et choisit la plus sûre, en visant les lettres. Il sert aux vidéos.

## Mots composés (itération 2)

Quand deux mots atteignent chacun le niveau 2, leur union devient possible : au choix suivant, une fiche dorée « mot composé » est toujours proposée (une seule à la fois). Un mot composé ne se prend qu'une fois et n'a pas de niveaux. Ils sont rangés dans `MOTS` avec un champ `from` (voir `isCompose`, `composeReady`).

- **POINT-VIRGULE** (POINT + VIRGULE) : chaque point final est suivi, 0,35 s plus tard, d'une virgule qui tombe sur un autre attroupement.
- **POINT DE FEU** (POINT + FEU) : là où tombe un point, un cercle de flammes brûle 3 s.
- **ÉCHO DE LUNE** (LUNE + ÉCHO) : chaque coup de lune renvoie une goutte bleu clair vers la rature voisine.
- **PLUME AU VENT** (PLUME + VENT) : la fin de chaque pâté déclenche une bourrasque (dégâts, recul, efface les traits rouges).
- **ENCRE SYMPATHIQUE** (ENCRE + AIMANT) : après un pâté, 2 s d'invisibilité ; les ratures tournent autour d'un « ? » au crayon, là où tu as disparu.

La phrase de fin met les mots composés en vedette. Le pilote automatique les prend en priorité.

## Chapitres (itération 3)

Le cahier a maintenant deux pages. Chaque chapitre est une entrée de `CHAPTERS` (dans `jeu.js` pour le I, dans `chapitre2.js` pour le II, qui l'ajoute à la liste) : papier, notes des marges, dictées, table d'apparition (`pick`, `wave`), boss, décalages de difficulté (`scale`, `rateOff`, `rateCap`) et sous-titres de première rencontre (`meet`). `CH()` renvoie le chapitre courant (`G.chapter`).

- **Tourner la page** : après la victoire du chapitre I, Entrée (ou toucher) lance `turnPage()`. L'état `turn` (1,7 s) montre l'ancienne page, photographiée juste avant, qui se soulève par la droite et révèle son verso. Mots, niveau et cœurs max sont conservés ; les lettres restées au sol sont comptées ; le chrono du chapitre repart à zéro (le temps total s'affiche à la fin).
- **Page libre** : seulement après le dernier chapitre écrit (pour l'instant, le II).
- **Chapitre II, la portée** : papier à musique, dix portées de cinq lignes, barres de mesure, clé de sol tracée à la main (`CLEF`, un `Path2D`). Les lignes chantent quand on les traverse (fa, ré, si, sol, mi : `staffCross`) et chaque rature biffée sonne la note de sa hauteur sur la portée (`staffPitch`). La musique passe en boîte à musique, do lydien, avec un tic-tac discret.
  - **Croche** (base) : sautille en rythme, rapide par à-coups.
  - **Soupir** (dès 20 s) : s'efface, un cercle en pointillés annonce où il va se poser, puis il réapparaît près de toi. Inoffensif et intouchable tant qu'il est « fantôme » (`e.ghost`).
  - **Métronome** (dès 55 s) : tic, tic, tic… au quatrième tic, une onde rouge (`G.waves`) part de lui ; un cercle en pointillés l'annonce pendant le troisième tic. On est touché quand l'onde passe sur soi.
  - **La Fausse Note** (boss à 3:00, 1 500 PV) : une grosse note rouge avec un bémol de travers. Cycle : gamme (spirale de notes tirées une à une), portée (un mur de notes annoncé 0,9 s, avec un trou, la « respiration », marquée d'une apostrophe), accord (trois cercles de notes décalés d'un temps). Sous 50 % : spirale double, charge et appel de croches.
  - Dictées musicales : NOTE, GAMME, ACCORD, REFRAIN, SOLFÈGE…
- Les boss sont repérés par `e.isBoss` (champ `boss: true` dans `ETYPES`), plus par leur type.

## Le refrain (itération 4)

Tenu depuis la note de marge « un refrain ? » du chapitre II. Tout est dans `refrain.js` (chargé après `chapitre2.js`).

- 8 s après le début du chapitre II, un **refrain** s'écrit sur une portée proche (`writeRefrain`) : 4 notes à la première fois, une de plus à chaque refrain réussi (7 au plus). Les notes suivent une petite marche mélodique, chacune à sa vraie hauteur sur la portée (`staffPitch` les retrouve).
- Les notes sont dans des bulles dorées numérotées (pour ne pas les confondre avec les croches) ; la prochaine est surlignée en jaune. Une flèche dorée au bord de l'écran montre où attend la note suivante.
- On les touche **dans l'ordre**, chacune sonne sa note. Plus de 4 s entre deux notes (un arc doré le montre) : le refrain « se perd » et on reprend du début.
- Refrain complet (`singRefrain`) : la mélodie est rejouée d'un trait, puis une onde bleue et dorée (`G.songs`, rayon 540) frappe toutes les ratures (18 + 3 par note, 70 sur un boss, multiplié par ENCRE), efface les notes rouges et les ondes du métronome, rend un cœur et de l'expérience. Le refrain suivant vient 22 s plus tard.
- Le pilote automatique va vers le refrain en priorité (dans un rayon de 1 600 px).
- L'écran de fin compte « dictées · refrains » quand au moins un refrain a été joué.

## Commencer au chapitre II (itération 4)

- Battre la Grande Rature enregistre `inacheve.chapitre` = 2. L'écran titre propose alors la touche 2 (ou le bouton « Commencer au chapitre II ») pour commencer directement sur la portée.
- On y arrive **au brouillon** (`draft`) : 19 mots tirés au hasard (mots composés compris quand ils sont prêts, jamais SOUFFLE), niveau 20.
- Perdre ou recommencer (R) ramène au chapitre où la partie a commencé (`G.startChapter`).
- `__cap.start(2)` lance la démo au chapitre II (utilisé par le test de fumée).

## Réglages et mémoire

- `inacheve.best` : meilleur score.
- `inacheve.muted` : son coupé.
- `inacheve.calme` : secousses d'écran désactivées (bouton « Secousses » ou touche C).
- `inacheve.chapitre` : chapitre le plus loin débloqué (2 après la Grande Rature).

## Déterminisme

Le hasard du jeu passe par `rand()`. Le hasard purement visuel (tremblements de l'écran et des biffures) passe par `vrand()`, séparé : une partie simulée avec `__cap.skip` et la même partie filmée avec `__cap.frames` sont identiques à l'image près. `tools/record.mjs` peut donc choisir sa graine en simulant exactement le montage (étapes `STEPS`, avec les coups de pouce `__cap.grant` et `__cap.levelup`).

## Équilibrage de référence (itération 1)

Simulé avec le pilote automatique : environ 2 parties sur 3 battent la Grande Rature, au niveau 20 à 23 vers 3:20. Un humain moyen devrait mourir quelques fois avant d'y arriver. Si tu modifies l'équilibrage, refais une simulation sur plusieurs graines.

Itération 2 (avec les mots composés) : 7 graines sur 10 gagnent, entre 3:28 et 3:41 ; les morts arrivent entre 2:14 et 2:38. L'équilibre n'a pas bougé de façon notable.

Itération 3 (chapitre II, parties naturelles : chapitre I joué en entier puis page tournée) : sur 12 pilotes arrivés au chapitre II, 8 battent la Fausse Note (entre 3:41 et 4:05 de chapitre), 4 meurent entre 2:08 et 3:00. Les premiers réglages (`scale` 1,15, boss à 820 PV) étaient beaucoup trop faciles : aucun pilote ne perdait plus de deux cœurs.

Itération 4 (départ au brouillon du chapitre II, pilote) : sur 6 graines, 1 seule bat la Fausse Note ; les autres meurent entre 1:40 et 3:10. Le brouillon (mots au hasard) est nettement plus faible qu'une vraie partie : c'est voulu, c'est un raccourci, pas une récompense. Dans le montage vidéo (graines 42 et 7, chapitre I abrégé), le pilote joue 4 à 5 refrains et bat la Fausse Note vers 3:30 à 3:50.

## Outils

- `tools/check.mjs` : vérifications sans navigateur.
- `tools/record.mjs` : tournage déterministe (`--smoke` pour un test rapide, `--seed N` pour forcer une graine). Sans graine, il teste plusieurs graines en accéléré et filme une partie qui va au bout.
- `tools/meta.mjs` : lit l'itération et les notes (utilisé par le workflow pour la release).
- `tools/bundle.mjs` : version en un seul fichier dans `dist/` (celle publiée dans l'artefact).
- `tools/fonts.mjs` : copie les polices depuis `node_modules`.
- Workflow `Publier l'itération` : le miroir GitHub Pages essaie de s'activer tout seul ; s'il n'y arrive pas (Pages désactivé sur le dépôt), il est sauté sans faire échouer la publication (la release et sa vidéo restent la référence).

## Carnet d'idées (libre à toi de piocher, de modifier ou d'ignorer)

- ~~**Portées musicales**~~ : fait à l'itération 3 (chapitre II). **Chapitre III** : papier millimétré (géométrie : ennemis-compas, équerres, rapporteur), carte au trésor, page de calligraphie, buvard qui absorbe tout.
- ~~**Commencer au chapitre II**~~ : fait à l'itération 4 (brouillon de 19 mots au hasard). Pour plus tard : un écran titre qui montre les pages débloquées comme les onglets d'un classeur.
- ~~**Refrain**~~ : fait à l'itération 4 (notes à toucher dans l'ordre). Pour plus tard : un refrain « en canon » que deux mélodies se partagent ; un refrain caché que seul l'écho d'une ligne traversée révèle ; une version du chapitre I (une phrase à recopier mot à mot, la « copie »).
- **Les paroles** (TODO dans la marge, et nouvelle promesse « les paroles ? » à côté du refrain) : des syllabes sous les notes du refrain, qui forment un mot ; les dictées du chapitre II écrites sous la portée, comme des paroles de chanson.
- **Bons points** : de petites cartes illustrées à collectionner, gagnées par des exploits ; une page « collection » dans le carnet de bord.
- **Bestiaire** : une page qui se remplit de croquis annotés à chaque nouvelle rature rencontrée.
- **Page du jour** : une graine commune pour tous les joueurs, chaque jour, avec un défi.
- ~~**Combinaisons de mots**~~ : fait à l'itération 2 (cinq mots composés). Pour plus tard : d'autres unions (GUILLEMETS + ITALIQUE = « CITATION » ? SOUFFLE + LUNE = « CLAIR DE LUNE » ?), et un mot composé à trois mots, très rare.
- ~~**Accessibilité : secousses**~~ : fait à l'itération 2 (réglage « Secousses »). Restent : contraste renforcé, vitesse du jeu, daltonisme.
- **Nouvelles ratures** : le tipp-ex qui recouvre la page de blanc, la tache de café, le trombone, le taille-crayon qui aspire les lettres, la règle qui balaie la page.
- **Patrons de chapitres** : le Correcteur au stylo rouge, la Photocopieuse qui duplique tout, le Cartable.
- **Accessibilité** : options de contraste, vitesse du jeu, daltonisme (les secousses sont faites).
- **Histoire** : une phrase d'histoire se révèle à chaque chapitre, comme si le cahier racontait quelque chose.
- **Musique** : un thème par chapitre (fait à l'itération 3 pour le I et le II) ; reste une musique qui réagit aux mots choisis.
- **Encre sympathique, la suite** : des lettres invisibles cachées dans la page, révélées seulement quand on est soi-même invisible.
- **Carnet des unions** : une page qui montre les mots composés déjà découverts, et des silhouettes « ? » pour les autres.
