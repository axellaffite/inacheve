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

## Chapitre III : le papier millimétré (itération 5)

Tout est dans `chapitre3.js` (page, ratures, Règle de fer) et `figure.js` (la figure), chargés après `refrain.js`. Les ratures géométriques sont listées dans `MILLI_TYPES` et animées par `stepMilli` (qui écrit dans `MV`, comme `stepPortee`).

- **Papier** (`paper: 'milli'`, `drawMilli`) : lignes orangées au millimètre (8 px, masquées quand l'écran est très dézoomé), plus marquées tous les 5 mm et tous les centimètres, et un repère O, x, y tracé au crayon en bas à gauche.
- **Traits de crayon** (`pencilStain`) : les compas, les équerres, la règle et les figures laissent des traits gris sur la couche des taches ; ils sèchent comme l'encre.
- **Segment** (base) : avance en faisant des moulinets.
- **Équerre** (dès 25 s) : s'arrête et trace un angle droit (`G.lines`) dont un côté passe par le joueur : 0,85 s en pointillés rouges, puis 0,3 s actif.
- **Compas** (dès 55 s) : plante sa pointe, ouvre ses branches (le cercle est annoncé en pointillés), puis trace un cercle complet en 2,3 s. Sa mine (la rature elle-même, `e.x`, `e.y`) fait mal ; la pointe (`e.cx`, `e.cy`) non.
- **Rapporteur** (dès 105 s) : vise, puis tire cinq rayons de 24° en 24°, deux fois. Ses projectiles et ceux de la règle sont des « ° » rouges (`b.deg`).
- **La Règle de fer** (boss à 3:00, 1 700 PV, `REGLE` : 540 × 54 px) : on se cogne sur toute sa longueur (`regleDist`, `segDist`). Cycle : graduations (tirs perpendiculaires depuis 9 points de la règle, en 2 ou 3 volées), moulinet (cercle annoncé 0,9 s, puis 2,6 s de rotation rapide), trait (elle se soulève, intouchable, son ombre vise un trait qui passe par le joueur, puis elle s'abat : 2 dégâts ; deux fois de suite quand elle est en colère). Sous 50 % : appel d'équerres et de segments.
- Dictées : ANGLE, CERCLE, RAYON, CARRÉ, COMPAS, ÉQUERRE, TRIANGLE…
- Musique : arpèges réguliers en la mineur et cliquetis de règle (`beatAt`, `chap === 3`).

### La figure (itération 5)

- 8 s après le début du chapitre III, des points A, B, C… sont posés sur la page (`writeFigure`) : 3 sommets d'abord (un triangle), un de plus à chaque figure réussie (6 au plus, l'hexagone).
- On les touche dans l'ordre, puis on revient au point A (« ferme ! ») : `figureTarget()` donne le point attendu. Un crayon en pointillés suit le joueur depuis le dernier sommet. Plus de 6 s entre deux points : la gomme passe, on reprend du point A.
- Figure fermée (`closeFigure`) : hachures dorées, et tout ce qui est dedans ou touche un côté prend (24 + 4 × sommets) × ENCRE (95 sur un boss) ; les projectiles et les angles droits à l'intérieur disparaissent ; un cœur et de l'expérience. La suivante vient 20 s plus tard.
- Le pilote automatique va vers la figure comme vers le refrain. L'écran de fin compte « dictées · refrains · figures » (`endTally`).

## Commencer au chapitre III (itération 5)

- Battre la Fausse Note enregistre `inacheve.chapitre` = 3 : touche 3 ou bouton « Commencer au chapitre III ». Brouillon de 28 mots, niveau 29. `__cap.start(3)` le lance en démo (test de fumée).

## Chapitre IV : la carte au trésor (itération 6)

Tenu depuis la note de marge « une carte au trésor ? » du chapitre III. Tout est dans `carte.js` (page, ratures marines, Pieuvre-Buvard) et `tresor.js` (la chasse au trésor), chargés après `figure.js`. Les ratures marines sont listées dans `CARTE_TYPES` et animées par `stepCarte` (qui écrit dans `MV`). `carte.js` ajoute ses ratures à `ETYPES` avec `Object.assign`.

- **Papier** (`paper: 'carte'`, `drawCarte`) : parchemin teinté, mer bleutée et vaguelettes (`SEA_MARKS`), sept îles au contour tremblé (`ISLANDS`, calculées une fois, avec leurs lignes d'eau, montagnes et palmiers), noms d'îles à la plume sépia, « Mer des Ratures », un petit navire qui tangue (`SHIP`) et une rose des vents (`ROSE`). Tout est dessiné en direct, avec un tri par ce qui est à l'écran.
- Pas de gomme sur la carte : le crabe prend sa place dans la table d'apparition.
- **Mouette** (base) : tourne autour du joueur (rayon ~170), s'arrête 0,55 s (trait rouge d'avertissement) puis pique en ligne droite.
- **Crabe** (dès 25 s) : marche de travers, change de côté par à-coups, approche lentement.
- **Tourbillon** (dès 45 s, quatre au plus sur la page) : dérive lentement et **attire** le joueur dans un rayon de 280 px (`G.pullX`, `G.pullY`, appliqués par `applyPull`, plafonnés à 170 px/s ; un pâté y échappe).
- **Bouteille à la mer** (dès 75 s) : dérive, vise (éventail rouge), puis tire cinq bouchons (`b.cork`).
- **La Pieuvre-Buvard** (boss à 3:00, 1 200 PV) : un buvard rose à tentacules. Cycle : balayage (un tentacule balaie un secteur de 130° annoncé 1 s en pointillés : `G.tents`, 2 dégâts), aspiration (1,8 s : elle t'attire, **boit tes gouttes** dans un rayon de 260 px et les taches de la page, puis recrache autant de pâtés roses, `b.blot`), pluie de pâtés (cercles annoncés autour de toi, `G.drops`). Sous 50 % : deux tentacules opposés, et elle appelle crabes et mouettes.
- Dictées : CAP, PORT, TRÉSOR, ESCALE, NAVIRE, BOUSSOLE, BOUTEILLE, ARCHIPEL, LONGITUDE, EXPLORATION.
- Musique : barcarolle à six temps en ré dorien, avec la houle (`beatAt`, `chap === 4`).

### La chasse au trésor (itération 6)

- 8 s après le début du chapitre IV, une piste est tracée (`writeTresor`) : un départ près du joueur, des étapes en zigzag, un X sur une île à bonne distance. 4 étapes la première fois, une de plus à chaque trésor (8 au plus).
- Seul le premier tronçon est visible : chaque fois que tu atteins le bout des pointillés (un rond doré marqué « ? »), le tronçon suivant se dessine (`T.shown`). `tresorTarget()` donne le point attendu ; la flèche dorée du bord d'écran le montre.
- Sur le X, il faut **rester** 1,6 s pour creuser (la jauge redescend doucement si tu t'éloignes). Pas de limite de temps : la tension vient de l'immobilité.
- Coffre ouvert (`openTresor`) : une onde de doublons (rayon 520) frappe tout ((20 + 3 × étapes) × ENCRE, 80 sur un boss), efface les projectiles et les pâtés qui tombent, rend un cœur, de l'expérience et cinq lettrines dorées. La piste suivante vient 22 s plus tard.
- Le pilote automatique suit la piste et reste sur le X pour creuser (`tresorDigging`), sauf danger immédiat. L'écran de fin compte les trésors (`endTally`).

## Commencer au chapitre IV (itération 6)

- Battre la Règle de fer enregistre `inacheve.chapitre` = 4 : touche 4 ou bouton « Commencer au chapitre IV ». Brouillon de 37 mots, niveau 38. `__cap.start(4)` le lance en démo (test de fumée).

## Le bestiaire (itération 7)

Tout est dans `bestiaire.js` (chargé après `tresor.js`). Une page du cahier par chapitre (`BESTIAIRE[n]` : type, nom, note au crayon), dessinée sur le canevas dans l'état `bestiaire`.

- **Croquer** : `killEnemy` appelle `noteBestiaire(type)`, qui compte les ratures biffées par type dans `G.bestiary`. La première fois, un polaroïd « croqué ! » glisse depuis le bord gauche pendant 3,4 s (`G.bestToasts`, une à la fois, seulement en jeu), avec le bruit d'un crayon qui gratte (`croquis`). Une page complète déclenche un sous-titre.
- **Les croquis** sont les vraies ratures : `drawCroquis` construit une fausse rature (`bestFake`) et appelle `drawEnemy`, mise à l'échelle par `BEST_VIS` (rayon apparent), découpée dans sa case. `G.p` est remplacé le temps du dessin, pour que les yeux des patrons suivent un point invisible.
- **La page** : feuille à lignes bleues, marge rouge, trous de classeur, croquis scotchés de travers ; cases inconnues hachurées avec un « ? » (« pas encore croisé·e », ou « se cache plus loin dans le cahier » pour un chapitre pas encore atteint). Chaque fiche dit combien de fois la rature a été biffée. Page complète : un bon point doré. Trois colonnes, deux sur écran étroit.
- **Ouvrir** : touche B ou bouton « Bestiaire » (titre, pause, fin de partie). Depuis le jeu, la partie passe d'abord en pause ; on revient toujours à l'état d'origine (`G.bestFrom`). Feuilleter : ← → ou Q D (`KeyA`, `KeyD`), ou toucher les flèches et les bords de l'écran ; refermer : Échap, B, Entrée ou la croix.
- L'écran de fin compte les « nouveaux croquis » de la partie ; l'écran titre dit où en est le bestiaire.
- Capture : le bestiaire part vide et n'est jamais enregistré. `__cap.bestiaire(page)`, `__cap.feuilleter(±1)`, `__cap.refermer()`, et `__cap.croque(types)` pour le remplir d'avance (le montage s'en sert pour les chapitres I à III).

## Réglages et mémoire

- `inacheve.best` : meilleur score.
- `inacheve.muted` : son coupé.
- `inacheve.calme` : secousses d'écran désactivées (bouton « Secousses » ou touche C).
- `inacheve.chapitre` : chapitre le plus loin débloqué (2 après la Grande Rature, 3 après la Fausse Note, 4 après la Règle de fer).
- `inacheve.bestiaire` : le bestiaire, `{ type: nombre de ratures biffées }` (validé au chargement, enregistré à chaque nouveau croquis, en fin de partie et quand on quitte la page).

## Déterminisme

Le hasard du jeu passe par `rand()`. Le hasard purement visuel (tremblements de l'écran et des biffures) passe par `vrand()`, séparé : une partie simulée avec `__cap.skip` et la même partie filmée avec `__cap.frames` sont identiques à l'image près. `tools/record.mjs` peut donc choisir sa graine en simulant exactement le montage (étapes `STEPS`, avec les coups de pouce `__cap.grant` et `__cap.levelup`).

## Équilibrage de référence (itération 1)

Simulé avec le pilote automatique : environ 2 parties sur 3 battent la Grande Rature, au niveau 20 à 23 vers 3:20. Un humain moyen devrait mourir quelques fois avant d'y arriver. Si tu modifies l'équilibrage, refais une simulation sur plusieurs graines.

Itération 2 (avec les mots composés) : 7 graines sur 10 gagnent, entre 3:28 et 3:41 ; les morts arrivent entre 2:14 et 2:38. L'équilibre n'a pas bougé de façon notable.

Itération 3 (chapitre II, parties naturelles : chapitre I joué en entier puis page tournée) : sur 12 pilotes arrivés au chapitre II, 8 battent la Fausse Note (entre 3:41 et 4:05 de chapitre), 4 meurent entre 2:08 et 3:00. Les premiers réglages (`scale` 1,15, boss à 820 PV) étaient beaucoup trop faciles : aucun pilote ne perdait plus de deux cœurs.

Itération 4 (départ au brouillon du chapitre II, pilote) : sur 6 graines, 1 seule bat la Fausse Note ; les autres meurent entre 1:40 et 3:10. Le brouillon (mots au hasard) est nettement plus faible qu'une vraie partie : c'est voulu, c'est un raccourci, pas une récompense. Dans le montage vidéo (graines 42 et 7, chapitre I abrégé), le pilote joue 4 à 5 refrains et bat la Fausse Note vers 3:30 à 3:50.

Itération 5 (chapitre III) : montage vidéo (mots donnés, niveau 34, deux pages tournées), 11 graines sur 12 battent la Règle de fer, entre 3:38 et 3:50 de chapitre. Au brouillon (28 mots au hasard), le pilote meurt le plus souvent entre 1:50 et 3:35 : comme pour le chapitre II, c'est un raccourci. Premiers réglages trop durs (`scale` 4, règle à 2 400 PV) : morts vers 1:40 et combats de plus d'une minute.

Itération 6 (chapitre IV) : montage vidéo (mots donnés, niveau 46, trois pages tournées), le pilote ouvre 6 à 7 trésors et bat la Pieuvre-Buvard sans grande peine. Au brouillon (37 mots au hasard), 4 graines sur 6 gagnent, en descendant à 2 cœurs ; les 2 autres meurent vers 2:50 et 3:10. Premiers réglages beaucoup trop faciles (`scale` 3,6, pieuvre à 2 100 PV, pas de bouteilles avant 100 s) : aucun pilote ne perdait plus de deux cœurs et le combat durait plus d'une minute.

## Outils

- `tools/check.mjs` : vérifications sans navigateur.
- `tools/record.mjs` : tournage déterministe (`--smoke` pour un test rapide, `--seed N` pour forcer une graine). Sans graine, il teste plusieurs graines en accéléré et filme une partie qui va au bout.
- `tools/meta.mjs` : lit l'itération et les notes (utilisé par le workflow pour la release).
- `tools/bundle.mjs` : version en un seul fichier dans `dist/` (celle publiée dans l'artefact).
- `tools/fonts.mjs` : copie les polices depuis `node_modules`.
- Workflow `Publier l'itération` : le miroir GitHub Pages essaie de s'activer tout seul ; s'il n'y arrive pas (Pages désactivé sur le dépôt), il est sauté sans faire échouer la publication (la release et sa vidéo restent la référence).

## Carnet d'idées (libre à toi de piocher, de modifier ou d'ignorer)

- ~~**Portées musicales**~~ : fait à l'itération 3 (chapitre II). ~~**Papier millimétré**~~ : fait à l'itération 5 (chapitre III). ~~**Carte au trésor**~~ : faite à l'itération 6 (chapitre IV), avec le buvard qui boit tout en patron. **Chapitre V** : la page de calligraphie (promesse dans la marge du IV : pleins et déliés, une plume qui crache, des lettres ornées), ou la page de garde, ou un cahier de brouillon tout raturé.
- **La carte, la suite** : des îles qui comptent vraiment (sable qui ralentit, mer où l'on glisse), un perroquet qui répète la dernière attaque, une boussole à soi (mot BOUSSOLE ?) qui montre le trésor, des trésors piégés (un coffre-mimique), une carte qui se déchire.
- **La figure, la suite** : des figures imposées (« trace un carré »), des points qui bougent, un compas à soi (mot COMPAS ?) qui trace un cercle protecteur ; des mots de géométrie comme pouvoirs (ANGLE, RAYON).
- ~~**Commencer au chapitre II**~~ : fait à l'itération 4 (brouillon de 19 mots au hasard), et au chapitre III à l'itération 5. Pour plus tard : un écran titre qui montre les pages débloquées comme les onglets d'un classeur.
- ~~**Refrain**~~ : fait à l'itération 4 (notes à toucher dans l'ordre). Pour plus tard : un refrain « en canon » que deux mélodies se partagent ; un refrain caché que seul l'écho d'une ligne traversée révèle ; une version du chapitre I (une phrase à recopier mot à mot, la « copie »).
- **Les paroles** (TODO dans la marge, et nouvelle promesse « les paroles ? » à côté du refrain) : des syllabes sous les notes du refrain, qui forment un mot ; les dictées du chapitre II écrites sous la portée, comme des paroles de chanson.
- **Bons points** : de petites cartes illustrées à collectionner, gagnées par des exploits ; une page « collection » dans le carnet de bord. (Le bestiaire donne déjà un bon point doré par page complète : on pourrait les compter sur l'écran titre.)
- ~~**Bestiaire**~~ : fait à l'itération 7. Pour plus tard : un croquis qui montre l'attaque de la rature quand on le touche ; des ratures « rares » (une gomme dorée, un gribouillis à l'envers) qui n'ont qu'une case en pointillés ; une page de patrons à part, avec leurs phrases de fin.
- **Page du jour** : une graine commune pour tous les joueurs, chaque jour, avec un défi.
- ~~**Combinaisons de mots**~~ : fait à l'itération 2 (cinq mots composés). Pour plus tard : d'autres unions (GUILLEMETS + ITALIQUE = « CITATION » ? SOUFFLE + LUNE = « CLAIR DE LUNE » ?), et un mot composé à trois mots, très rare.
- ~~**Accessibilité : secousses**~~ : fait à l'itération 2 (réglage « Secousses »). Restent : contraste renforcé, vitesse du jeu, daltonisme.
- **Nouvelles ratures** : le tipp-ex qui recouvre la page de blanc, la tache de café, le trombone, le taille-crayon qui aspire les lettres, la règle qui balaie la page.
- **Patrons de chapitres** : le Correcteur au stylo rouge, la Photocopieuse qui duplique tout, le Cartable (la Règle de fer est faite).
- **Lisibilité** : quand la page est très tachée en fin de chapitre, les taches pourraient sécher plus vite (ou une option « page propre »).
- **Accessibilité** : options de contraste, vitesse du jeu, daltonisme (les secousses sont faites).
- **Histoire** : une phrase d'histoire se révèle à chaque chapitre, comme si le cahier racontait quelque chose.
- **Musique** : un thème par chapitre (fait à l'itération 3 pour le I et le II) ; reste une musique qui réagit aux mots choisis.
- **Encre sympathique, la suite** : des lettres invisibles cachées dans la page, révélées seulement quand on est soi-même invisible.
- **Carnet des unions** : une page qui montre les mots composés déjà découverts, et des silhouettes « ? » pour les autres.
