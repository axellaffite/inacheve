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

## Chapitre V : la page de calligraphie (itération 8)

Tenu depuis la note de marge « la calligraphie ? » du chapitre IV. Tout est dans `calligraphie.js` (page, ratures à la plume, encre fraîche, Grand Paraphe) et `enluminure.js` (la lettrine), chargés après `tresor.js` et avant `bestiaire.js`. Les ratures à la plume sont listées dans `CALLI_TYPES` et animées par `stepCalli` (qui écrit dans `MV`).

- **Papier** (`paper: 'calli'`, `drawCalli`) : papier crème, lignes d'écriture tous les 192 px (hampe, hauteur d'x, ligne de base marquée), obliques de pente à 55° (masquées quand l'écran est très dézoomé), marge rouge, et cinq grandes lettres pâles en filigrane (`BIG_LETTERS`).
- **Pleins et déliés** : `nibW` donne l'épaisseur d'un trait selon sa direction, comme une plume tenue à 45° (plein en descendant vers la droite, délié en montant). Tous les traits d'encre du chapitre l'utilisent.
- **L'encre fraîche** (`G.strokes`) : des traits faits de points datés. Un point brûle (1 dégât) à partir de 0,22 s (`STROKE_HOT`, plus pâle avant) et s'efface au bout de la vie du trait ; 700 points au plus en tout (`STROKE_MAX`). Un point sur trois marque la page (`inkLine`), puis sèche comme l'encre. Le pilote les évite (`calliNear`, `calliDanger`).
- **Délié** (base) : zigzague vers toi, un trait plein à la tête et délié à la queue.
- **Plume d'oie** (dès 25 s) : garde ses distances, vise 0,65 s (trait rouge) puis crache trois gouttes d'encre l'une après l'autre (`b.ink`, annoncées par `b.wait`).
- **Arabesque** (dès 50 s, quatre au plus) : tourne autour de toi en faisant des boucles (cycloïde) et laisse un trait d'encre de 2,3 s.
- **Majuscule** (dès 90 s, trois au plus) : une lettre ornée dans un cadre rouge et or ; elle s'enlumine 0,75 s puis lâche une couronne de dix fleurons (`b.fleur`).
- **Le Grand Paraphe** (boss à 3:00, 1 400 PV) : une signature à boucles, deux yeux et une plume d'oie. Cycle : signature (`startSig` : une cycloïde allongée qui part de lui, passe près de toi et file plus loin, annoncée 1 s en pointillés rouges, puis il la parcourt en 1,25 s en laissant un trait d'encre de 2,6 s), pleins et déliés (une couronne qui alterne grosses gouttes lentes et traits rouges rapides), points sur les i (de gros points d'encre, `G.drops` avec `ink`, tombent là où tu vas). Sous 50 % : deux couronnes, une seconde signature aussitôt après la première, et il appelle déliés et arabesques.
- Dictées : PLEIN, DÉLIÉ, ENCRE, PLUMIER, ENCRIER, LETTRINE, ARABESQUE, MAJUSCULE, ENLUMINURE, CALLIGRAPHIE.
- Musique : une valse en sol majeur (`beatAt`, `chap === 5`), basse puis deux accords pincés au clavecin.

### La lettrine (itération 8)

- 8 s après le début du chapitre V, une grande lettre (la première lettre du mot de la dictée en cours) s'écrit dans un cadre rouge et or, à 460–860 px du joueur (`writeEnlu`). Sa forme est lue dans un petit canevas (`enluMask`) et découpée en cases de 26 px.
- Passer dessus dore les cases dans un rayon de 40 px autour de la goutte ; la feuille d'or est découpée à la forme exacte de la lettre (`destination-in`). Il faut dorer 90 % des cases. Pas de limite de temps : la difficulté vient des ratures qui tournent autour.
- Lettrine dorée (`illuminate`) : une onde d'or (rayon 560) frappe tout ((22 + 0,12 × cases) × ENCRE, 90 sur un boss), efface projectiles, points qui tombent et encre fraîche, rend un cœur, de l'expérience et cinq lettrines d'or à ramasser. La lettre reste imprimée en or pâle sur la page. La suivante vient 22 s plus tard, 40 px plus grande (450 px au plus).
- Le pilote vise la case non dorée la plus proche (`enluTarget`). L'écran de fin compte les lettrines (`endTally`).

## Commencer au chapitre V (itération 8)

- Battre la Pieuvre-Buvard enregistre `inacheve.chapitre` = 5 : touche 5 ou bouton « Commencer au chapitre V ». Brouillon de 46 mots, niveau 47. `__cap.start(5)` le lance en démo (test de fumée).
- Le bestiaire a une cinquième page (délié, plume d'oie, arabesque, majuscule, Grand Paraphe).

## Les unions (itération 9)

Tout est dans `unions.js` (chargé après `bestiaire.js`), qui ajoute trois mots composés à `MOTS` avec `Object.assign`. `UNIONS` liste les huit mots composés. Le pilote les prend en priorité (`BOT_PRIORITY`).

- **CALLIGRAPHIE** (PLUME + ENCRE) : le joueur laisse un sillage (`G.trail`, un point tous les 12 px, 1,4 s de vie) dessiné en pleins et déliés (`nibW`), bleu nuit puis pâlissant vers le papier (`trailInk`, opaque pour que les bouts ronds ne fassent pas de pointillés). Une rature qui touche un point du sillage prend 2,2 × ENCRE, au plus une fois toutes les 0,3 s (`e.trailT`), sans bruit de coup. Un trait sur quatre marque la page (`inkLine`) et sèche.
- **CITATION** (GUILLEMETS + ITALIQUE) : toutes les 4 s, une phrase entre guillemets (`CITATIONS`) part vers l'attroupement le plus dense (les patrons comptent pour six) : `G.quotes`, 480 px/s, 1,9 s. Elle s'écrit en 0,3 s, surlignée en jaune, jamais la tête en bas. Collision : un segment de la longueur du texte (`segDist`, `regleDist` pour la Règle de fer), épaisseur 18 px ; (9 + 2 × GUILLEMETS) × ENCRE une fois par rature (le double sur un patron). Les projectiles qu'elle traverse disparaissent (« elle coupe la parole »).
- **LUNE ROUSSE** (LUNE + FEU) : les lunes deviennent orange, avec une traîne de feu, et chaque coup de lune enflamme la rature (`moonFire`).
- **Le carnet des unions** : la dernière page du bestiaire (`unionPage()` = `CHAPTERS.length`, donc toujours après le dernier chapitre). Huit fiches bristol, quatre colonnes (deux sur écran étroit) : une union découverte montre son nom surligné d'or, sa formule, sa description et son effet ; les autres sont hachurées, avec « ? ? ? » et un indice (le premier mot de l'union). Une union entre au carnet quand on la **choisit** (`noteUnion`, depuis `chooseMot`) ; les mots du brouillon ne comptent pas. Un petit texte doré « au carnet des unions : n / 8 » s'envole au-dessus de la goutte. Bon point doré quand les huit sont trouvées.
- L'écran titre compte croquis et unions ; l'écran de fin compte les « nouvelles unions » de la partie.
- La liste des mots du HUD rapetisse (lettres et points compris) quand elle s'allonge, jusqu'à la moitié de sa taille : une vingtaine de mots tiennent sans se chevaucher.
- **Brouillon** : un mot composé n'y compte plus que pour un demi-mot (`draft`), sinon les huit unions mangeaient les niveaux des mots simples.
- Capture : `__cap.unir(keys)` remplit le carnet d'avance (le carnet part vide et n'est jamais enregistré en capture) ; `__cap.state()` donne `unions` et `quotes`.

## Chapitre VI : la page de garde (itération 10)

Tenu depuis la note de marge « la page de garde ? » du chapitre V. C'est la dernière page du cahier : le chapitre se souvient des cinq autres. Tout est dans `garde.js` (page, ratures de reliure, Cartable) et `exlibris.js` (le sceau), chargés après `enluminure.js` et avant `bestiaire.js`. Les ratures de reliure sont listées dans `GARDE_TYPES` et animées par `stepGarde` (qui écrit dans `MV`).

- **Papier marbré** (`paper: 'garde'`, `drawGarde`) : calculé une seule fois, à un quart de la taille de la page, avec le vrai procédé du marbrage (des gouttes d'encre posées sur un bain qui repoussent les précédentes, deux peignes, quatre tourbillons), pixel par pixel et à rebours (`marbleWork`), puis adouci (`blurPass`) et posé à 25 % sur le papier. Son hasard est à part (`mulberry32(1010)`) : il ne touche pas au déterminisme. Pour éviter un à-coup quand la page tourne, il se calcule six lignes par image dès le chapitre V (boucle de `main.js`) ; sinon, d'un coup au premier dessin.
- **Décor** : le pli de la reliure à gauche, et l'étiquette du cahier collée de travers (`LABEL`) : « Nom : Inachevé · Classe : la page d'après · Année : toujours ».
- **Marbrure** (base) : une goutte de couleur à spirale qui tourne en s'approchant.
- **Signet** (dès 25 s) : garde ses distances, vise, tend son ruban à travers la page (`G.ribbons`, 540 px, 0,85 s en pointillés rouges) puis le fait claquer 0,35 s.
- **Peigne à marbrer** (dès 50 s, trois au plus) : se met en ligne (quatre pistes en pointillés), puis file droit 1,05 s ; ses quatre dents laissent de l'encre fraîche (`inkStroke` de la calligraphie, 2,1 s) qui brûle comme celle des arabesques.
- **Tampon** (dès 90 s, trois au plus) : saute (intouchable, `e.ghost`) vers là où tu vas, son point de chute entouré de pointillés rouges, et retombe (`stampLand`) : 1 dégât dessous, une couronne de huit éclats, et la page garde un « VU » rouge.
- **Le Cartable** (boss à 3:00, 1 300 PV) : un cartable de cuir, deux boucles dorées pour les yeux, une étiquette « CM2 ». Cycle : la trousse (il ouvre son rabat et lance trois volées de sept crayons de couleur, `b.crayon`), les bretelles (deux secteurs balayés, ce sont des `G.tents` avec `strap: true`, dessinés en cuir cousu), le grand saut (1,5 s en l'air, son ombre suit le joueur puis s'arrête ; il retombe : 2 dégâts dessous, « À REFAIRE » sur la page et une onde `G.waves` de 440 px). Sous 50 % : quatre volées, deux bretelles, deux sauts d'affilée, et il se vide sur la page (tampons et marbrures).
- Dictées : FIN, NOM, GARDE, SIGNET, TAMPON, RELIURE, CARTABLE, MARBRURE, COUVERTURE, BIBLIOTHÈQUE.
- Musique (`beatAt`, `chap === 6`) : « Au clair de la lune » (air traditionnel, `AU.LUNE`) à la boîte à musique, sur des accords tenus ; le sceau posé rejoue le début de l'air en carillon. Le clin d'œil est voulu : « prête-moi ta plume, pour écrire un mot ».
- Le pilote évite rubans et ombres (`gardeDanger`).

### L'ex-libris (itération 10)

- 8 s après le début du chapitre VI, un sceau de cire est posé à 320–560 px du joueur, et un cartouche « ex-libris » plus loin (700 px, puis 70 de plus à chaque sceau, 1 300 au plus) : `writeSceau`.
- On **porte** le sceau : il suit la goutte au bout d'un ruban (`SCEAU.follow`). Être touché le fait **lâcher** : il roule 110–170 px plus loin (`S.lost`). C'est la première mécanique où l'on transporte quelque chose.
- Sur le cartouche (72 px) : `stampSceau`, une onde de cire (rayon 540) frappe tout ((24 + 4 × sceaux) × ENCRE, 95 sur un boss), efface projectiles, rubans, pâtés qui tombent et encre fraîche ; un cœur, de l'expérience, cinq lettrines ; la page garde le cachet. Le suivant vient 22 s plus tard.
- Chaque sceau porte l'emblème d'une page (`EMBLEMS`, `drawEmblem`) : plume (I), croche (II), compas (III), ancre (IV), lettrine (V), goutte (VI, « c'est toi »). Au sixième, un sous-titre salue le cahier complet.
- `sceauTarget()` pour le pilote et la flèche dorée ; l'écran de fin compte les ex-libris ; `__cap.state()` donne `sceaux` et `sceau` (-1 rien, 0 posé au sol, 1 porté).

### Commencer au chapitre VI (itération 10)

- Battre le Grand Paraphe enregistre `inacheve.chapitre` = 6 : touche 6 ou bouton « Commencer au chapitre VI ». Brouillon de 52 mots (presque tous les mots au maximum), niveau 53. `__cap.start(6)` le lance en démo (test de fumée).
- Le bestiaire a une sixième page (marbrure, signet, peigne à marbrer, tampon, Cartable) ; le carnet des unions devient la page 7.

### Citations de chaque page (itération 10)

- CITATION pioche aussi dans des phrases propres à la page (`CITATIONS_CH`) : « do, ré, mi » sur la portée, « CQFD » sur le papier millimétré, « X marque l'endroit » sur la carte, « pleins et déliés » en calligraphie, « prête-moi ta plume » sur la page de garde.

## Le devoir du jour (itération 11)

Tout est dans `devoir.js` (chargé après `unions.js`). Un mode de jeu à part, lancé depuis l'écran titre (touche J ou bouton « Devoir du jour »).

- **Une page par jour, la même pour tous** : `devoirDuJour(date)` hache la date UTC (`hashStr` : FNV-1a puis un brassage final, sinon deux dates voisines donnaient presque le même devoir) et en tire le chapitre (I à VI, même s'il n'est pas encore débloqué : c'est une façon de découvrir les pages), une consigne, un coup de pouce et la graine de `rand`. Le brouillon de départ et les premières ratures sont donc identiques pour tout le monde. En capture, la date est `GAME_META.date`.
- **Consignes** (`CONSIGNES`, avec un bonus de note) : pas de pâtés (`sansPate`, le pâté est désactivé), copie à rendre plus tôt (`presse`, patron à 2:00, `devoirBossT`), interligne double (`double`, 1,8 × plus de ratures à 55 % de vie), écrire sans trembler (`fragile`, quatre cœurs), courant d'air (`courant` : `G.wind`, 95 px/s, tourne toutes les 16 s, pousse la goutte et les lettres ; traits de vent dessinés à l'écran par `drawWind`), brouillard de gomme (`brouillard` : un dégradé radial couleur gomme autour de la goutte, de 200 à 420 px, dans `drawDevoirFx`).
- **Coups de pouce** (`COUPS_DE_POUCE`) : pluie de lettrines (lettres dorées dix fois plus fréquentes), page propre (l'encre sèche vite, les lettres de plus de 9 s viennent à toi), deux cœurs de rechange, grand aimant (aimant × 2). « Sans trembler » et « cœurs de rechange » ne tombent jamais ensemble.
- **La note** (`gradeDevoir`) : gagné, au moins 11 : + dictées (2,5 au plus), + exploits de la page (refrains, figures, trésors, lettrines, ex-libris, ou une étoile par 120 ratures au chapitre I ; 2,5 au plus), + 2 × la part de cœurs restants, + le bonus de la consigne ; perdu, jamais la moyenne (9,5 au plus, selon le temps tenu). Arrondie au demi-point. L'écran de fin la montre entourée au stylo rouge, avec une appréciation (`drawNote`).
- **Mémoire** : `inacheve.devoir` garde la meilleure note du jour (`{ date, best }`). L'écran titre l'épingle sur la fiche du devoir (`drawDevoirSlip`, en haut à gauche sur grand écran ; le titre descend de 26 px pour lui faire de la place).
- Un devoir ne débloque pas de chapitre et ne compte pas pour le meilleur score. Entrée ou R le refont ; T ou le bouton « Retour au titre » ramènent au titre (aussi en pause et en fin de partie normale).
- Capture : `__cap.jour(over)` impose le devoir du jour (pour la fiche du titre), `__cap.devoir(over)` le lance en démo ; `over` peut fixer `chapter`, `consigne`, `pouce` et `seed`. `__cap.state()` donne `devoir` et `note`.

## Les lignes (itération 12)

Le chapitre I avait des dictées, mais pas d'exploit à lui comme les autres pages. Tout est dans `lignes.js` (chargé après `exlibris.js`).

- 8 s après le début du chapitre I, puis 20 s après chaque ligne copiée, une phrase de punition (`PUNITIONS`, de la plus courte à la plus longue, la dernière étant « Je finirai ce que j’ai commencé. ») s'écrit en pointillés au crayon sur une grande ligne Seyès, deux ou trois lignes au-dessus ou au-dessous de la goutte, en commençant un peu à sa gauche (`writeLignes`). Sa longueur : 19 px par signe ; le texte (Playwrite, 40 px) est étiré à cette longueur.
- On la **recopie** en passant dessus de gauche à droite : il faut être dans une bande de 34 px autour de la ligne d'écriture (`cy`, 16 px au-dessus de la ligne de base) et près de la plume (50 px derrière, 90 devant). La plume ne va pas plus vite que 160 px/s (`LIGNES.pen`, la goutte en fait 235) : qui court trop vite la perd et doit revenir. Chaque mot recopié sonne une note (`ligneMot`).
- Les **gommes** qui passent sur la partie écrite l'effacent jusqu'à leur bord gauche (« gommé ! »).
- Ligne finie (`finishLignes`) : la phrase reste imprimée à l'encre sur la couche des taches, avec une coche rouge (`printLigne`) ; elle sèche et se fait gommer comme le reste. La réglure balaie la page : deux lignes bleues s'éloignent de la phrase (`G.sweeps`, 260 px de part et d'autre, 100 px au-delà des bouts) et frappent ((12 + 2 × mots) × ENCRE, 60 sur un patron), effacent les traits rouges ; cinq lettrines dorées tombent. **Pas de cœur** : une punition ne soigne pas.
- `lignesTarget()` (juste devant la plume) pour le pilote et la flèche dorée ; l'écran de fin compte les lignes (`endTally`) ; `__cap.state()` donne `lignes` et `ligne` (pourcentage recopié, -1 sinon).
- Le devoir du jour note maintenant le chapitre I avec les lignes (au lieu d'une étoile par 120 ratures).

### Écrire en miroir (itération 12)

- Nouvelle consigne du devoir (`miroir`, bonus 2) : la gauche et la droite sont inversées (clavier, flèches et joystick tactile, dans `moveInput`). Le pilote n'y est pas soumis. Ajouter une consigne a changé la correspondance entre les dates et les devoirs à partir du 16 octobre 2026.

## Chapitre VII : le cahier de brouillon (itération 13)

Tenu depuis la note de marge « un deuxième cahier ? » du chapitre VI (qui répond maintenant « → oui : un brouillon ! »). C'est la première page du **deuxième cahier**. Tout est dans `brouillon.js` (page, ratures de brouillon, Stylo Rouge) et `morpion.js` (la partie de morpion), chargés après `lignes.js` et avant `bestiaire.js`. Les ratures de brouillon sont listées dans `BROU_TYPES` et animées par `stepBrouillon` (qui écrit dans `MV`).

- **Papier** (`paper: 'brouillon'`, `drawBrouillon`) : papier recyclé un peu gris, petits carreaux de 32 px, marge rouge, et 46 griffonnages laissés par quelqu'un d'autre (`DOODLES` : soleils, maisons, bonshommes, spirales, vieilles parties de morpion, calculs faux et barrés comme « 3 + 4 = 8 »). Leur hasard est à part (`mulberry32(1212)`).
- **Trombone** (base) : avance par bonds, comme un ressort.
- **Tache de café** (dès 25 s) : s'arrête et renverse une flaque (`G.cafes`, 66–82 px, 7 s, 16 au plus) qui ralentit la goutte de 45 % (`cafeSlow`, dans `stepPlayer`). Biffée, elle se renverse encore. La flaque séchée laisse une marque de tasse.
- **Taille-crayon** (dès 50 s, trois au plus) : garde ses distances, **aspire les lettres** dans un rayon de 230 px et les mange (son compteur doré au-dessus de lui), puis tourne sur lui-même et crache une couronne de huit copeaux (`b.copeau`). Biffé, il rend les lettres mangées (14 au plus).
- **Blanco** (dès 90 s, trois au plus) : vise 0,7 s (bande en pointillés rouges), puis roule tout droit 1 s en déroulant un ruban blanc (`G.tapes`, 420 points au plus) qui recouvre l'encre et les lettres. Le ruban brûle tant qu'il est humide (1,5 s, bordé de rouge), puis sèche et s'efface.
- **Le Stylo Rouge** (boss à 3:00, 1 400 PV) : un stylo à bille rouge avec des lunettes de correctrice ; sa pointe écrit en rouge partout où il passe. Cycle : fautes (quatre cercles rouges autour de toi, annoncés 1 s pendant que le stylo les entoure, `G.fautes`), barré (trois traits parallèles de 1 300 px, 125 px d'écart, `G.bars` : il faut se glisser entre eux), zéro pointé (un grand 0 de 300 px se referme sur toi en 2,1 s, sauf par une ouverture marquée de deux traits dorés : `G.zeros`, `inGap`). Sous 50 % : le capuchon saute, six fautes, deux barrés décalés, et il vide sa trousse (trombones et taille-crayon).
- Dictées : OUPS, ESSAI, CALCUL, CROQUIS, MORPION, TROMBONE, BROUILLON, CORRECTION, GRIBOUILLIS, RECOMMENCER.
- Musique (`beatAt`, `chap === 7`) : « Frère Jacques » (traditionnel, `AU.JACQUES`) en canon, la seconde voix deux mesures plus tard et une octave plus bas, une troisième tout en haut quand ça chauffe, et un crayon qui tapote.
- Le pilote évite flaques, ruban humide, fautes, traits et zéro, et se laisse attirer par l'ouverture du zéro (`brouillonDanger`).

### Le morpion (itération 13)

- 8 s après le début du chapitre VII, une grille de trois sur trois (cases de 124 px) se dessine au crayon à 420–720 px du joueur (`writeMorpion`).
- Les O commencent. **Rester 0,55 s dans une case libre** y dessine ton O (un O pâle se trace pendant l'attente). Les X répondent 0,9 s plus tard au stylo rouge (`chooseX` : ils gagnent quand ils peuvent, ne bloquent qu'une fois sur deux, aiment le centre).
- Trois O alignés (`winMorpion`) : une onde de O dorés (rayon 560) frappe tout ((22 + 4 × parties, 6 au plus) × ENCRE, 90 sur un patron), efface projectiles, fautes, traits annoncés et ruban blanc ; un cœur, de l'expérience, cinq lettrines ; la grille reste imprimée au crayon. La suivante vient 20 s plus tard.
- Trois X alignés (`loseMorpion`) : leur trait barre la page sur 1 400 px (annoncé 0,8 s). Match nul : un peu d'expérience, deux lettrines. Dans les deux cas, on rejoue 12 s plus tard.
- Le pilote joue comme un enfant appliqué (`botCell` : gagner, bloquer, le centre, les coins) et reste dans sa case (`morpionHolding`). `morpionTarget()` pour la flèche dorée ; l'écran de fin compte les morpions ; `__cap.state()` donne `morpions` et `morpion` (cases jouées, -1 sinon).

### Commencer au chapitre VII (itération 13)

- Battre le Cartable enregistre `inacheve.chapitre` = 7 : touche 7 ou bouton « Commencer au chapitre VII ». Brouillon de 52 mots (le maximum, comme au VI), niveau 53. `__cap.start(7)` le lance en démo (test de fumée).
- Le bestiaire a une septième page (trombone, tache de café, taille-crayon, blanco, Stylo Rouge) ; le carnet des unions devient la page 8.
- Le devoir du jour peut tomber sur les sept chapitres (`CHAPTERS.length - 1`), et les morpions gagnés comptent comme exploits. Cela a de nouveau changé la correspondance entre les dates et les devoirs à partir du 16 octobre 2026.

## Vitesse du jeu (itération 11)

- Bouton « Vitesse » ou touche V : 100 %, 80 % ou 60 % (`G.speed`, appliqué au pas de temps dans `frame`, jamais en capture). Gardé dans `inacheve.vitesse`.

## Réglages et mémoire

- `inacheve.best` : meilleur score.
- `inacheve.muted` : son coupé.
- `inacheve.calme` : secousses d'écran désactivées (bouton « Secousses » ou touche C).
- `inacheve.chapitre` : chapitre le plus loin débloqué (2 après la Grande Rature, 3 après la Fausse Note, 4 après la Règle de fer, 5 après la Pieuvre-Buvard, 6 après le Grand Paraphe, 7 après le Cartable).
- `inacheve.bestiaire` : le bestiaire, `{ type: nombre de ratures biffées }` (validé au chargement, enregistré à chaque nouveau croquis, en fin de partie et quand on quitte la page).
- `inacheve.devoir` : la meilleure note du devoir du jour, `{ date, best }` (validée au chargement).
- `inacheve.vitesse` : vitesse du jeu (1, 0,8 ou 0,6).
- `inacheve.unions` : le carnet des unions, la liste des mots composés déjà choisis (validée au chargement, enregistrée à chaque nouvelle union).

## Déterminisme

Le hasard du jeu passe par `rand()`. Le hasard purement visuel (tremblements de l'écran et des biffures) passe par `vrand()`, séparé : une partie simulée avec `__cap.skip` et la même partie filmée avec `__cap.frames` sont identiques à l'image près. `tools/record.mjs` peut donc choisir sa graine en simulant exactement le montage (étapes `STEPS`, avec les coups de pouce `__cap.grant` et `__cap.levelup`).

## Équilibrage de référence (itération 1)

Simulé avec le pilote automatique : environ 2 parties sur 3 battent la Grande Rature, au niveau 20 à 23 vers 3:20. Un humain moyen devrait mourir quelques fois avant d'y arriver. Si tu modifies l'équilibrage, refais une simulation sur plusieurs graines.

Itération 2 (avec les mots composés) : 7 graines sur 10 gagnent, entre 3:28 et 3:41 ; les morts arrivent entre 2:14 et 2:38. L'équilibre n'a pas bougé de façon notable.

Itération 3 (chapitre II, parties naturelles : chapitre I joué en entier puis page tournée) : sur 12 pilotes arrivés au chapitre II, 8 battent la Fausse Note (entre 3:41 et 4:05 de chapitre), 4 meurent entre 2:08 et 3:00. Les premiers réglages (`scale` 1,15, boss à 820 PV) étaient beaucoup trop faciles : aucun pilote ne perdait plus de deux cœurs.

Itération 4 (départ au brouillon du chapitre II, pilote) : sur 6 graines, 1 seule bat la Fausse Note ; les autres meurent entre 1:40 et 3:10. Le brouillon (mots au hasard) est nettement plus faible qu'une vraie partie : c'est voulu, c'est un raccourci, pas une récompense. Dans le montage vidéo (graines 42 et 7, chapitre I abrégé), le pilote joue 4 à 5 refrains et bat la Fausse Note vers 3:30 à 3:50.

Itération 5 (chapitre III) : montage vidéo (mots donnés, niveau 34, deux pages tournées), 11 graines sur 12 battent la Règle de fer, entre 3:38 et 3:50 de chapitre. Au brouillon (28 mots au hasard), le pilote meurt le plus souvent entre 1:50 et 3:35 : comme pour le chapitre II, c'est un raccourci. Premiers réglages trop durs (`scale` 4, règle à 2 400 PV) : morts vers 1:40 et combats de plus d'une minute.

Itération 8 (chapitre V) : premiers réglages trop généreux en majuscules (7 % des apparitions sans limite : une vingtaine à l'écran, la page couverte de fleurons) ; limitées à trois à la fois. Lettrine d'abord dorée en 5 s (82 %, pinceau de 46 px) : relevée à 90 % et 40 px, et une toutes les 25 s. Au brouillon (46 mots au hasard), `scale` 6,6 puis 8 : 6 graines sur 6 gagnaient sans jamais descendre sous 2 cœurs ; à 11, 3 sur 6 mouraient avant 2:30. Retenu : `scale` 10,5, `rateCap` 13, Grand Paraphe à 1 800 PV puis 1 400 (pour que le combat du montage tienne en 40 s) : 4 graines sur 6 gagnent (souvent à 1 ou 2 cœurs), 2 meurent vers 1:40–1:55. Montage vidéo (mots donnés, niveau 55) : 12 graines sur 12 battent le Grand Paraphe ; à 1 400 PV, entre 3:29 et 3:53, avec 4 à 6 lettrines.

Itération 9 (les unions) : au brouillon du chapitre V, avec les huit unions comptées comme des mots entiers, 4 graines sur 12 seulement gagnaient ; comptées pour rien, 12 sur 12 sans jamais descendre sous 2 cœurs. Retenu : un demi-mot chacune, 10 graines sur 12 gagnent, le plus souvent à 1 ou 2 cœurs. Au brouillon du chapitre II, 5 sur 12. Chapitre I en partie normale : 4 graines sur 6 battent la Grande Rature. Montage vidéo (graine 42) : le Grand Paraphe tombe vers 3:24.

Itération 10 (chapitre VI) : au brouillon (52 mots, presque tout au maximum), premiers réglages (`scale` 12, `rateCap` 13,5) : 8 graines sur 8 gagnent sans peine ; à 15 : 7 sur 8. Retenu : `scale` 19, `rateCap` 16 : 8 graines sur 10 gagnent (vers 3:35–4:00, souvent à 2 ou 3 cœurs), 2 meurent vers 1:50–2:10. Le Cartable, d'abord à 1 500 PV, tombait en 35 à 55 s (31 à 48 s dans le montage, trop long pour la vidéo) : ramené à 1 300 PV. Le papier marbré coûte environ 0,5 s de calcul en tout, étalé sur le chapitre V.

Itération 11 (devoir du jour, pilote) : sur 6 devoirs variés, les premiers réglages donnaient 19 à 20 sur 20 à chaque victoire (trop généreux) et « sans trembler » à trois cœurs faisait mourir le pilote en une minute au chapitre VI. Retenu : la note actuelle (victoires entre 15,5 et 19, défaites plafonnées à 9,5) et quatre cœurs. Comme pour les brouillons de chapitre, le pilote perd environ un devoir sur deux. Montage vidéo (devoir C, chapitre III, mots donnés) : la Règle de fer tombe entre 147 et 185 s ; il a fallu un brouillon bien garni pour que le combat tienne dans la vidéo.

Itération 12 (les lignes, chapitre I en partie normale, pilote) : sans les lignes, 5 graines sur 8 battent la Grande Rature (morts vers 2:05–2:40) ; avec, 16 sur 16, même sans cœur et avec une réglure affaiblie (440 → 260 px, 22 + 3 × mots → 12 + 2 × mots). C'est surtout le pilote qui change : la ligne le fait circuler au lieu de foncer sur les lettres au milieu des attroupements. Pour un humain, la ligne est plutôt un risque de plus (une course en ligne droite, prévisible). À surveiller : si le chapitre I paraît trop facile, monter `rateCap` plutôt que d'affaiblir la ligne.

Itération 13 (chapitre VII, brouillon de 52 mots, pilote) : le brouillon d'origine (`scale` 21, `rateCap` 16,5) était une promenade, 6 graines sur 6 sans descendre sous 6 cœurs. À 40 et 20, les combats du Stylo Rouge duraient jusqu'à 90 s. Retenu : `scale` 32, `rateCap` 19, trombones un peu plus vifs (128 px/s) : 8 graines sur 8 gagnent entre 3:33 et 3:53, en descendant à 2 à 5 cœurs, comme au chapitre VI (qui donne 4 à 6 aujourd'hui). En vidéo, la fin de chapitre était couverte de taches de café (lentes et solides, elles s'entassent) : leur part est passée de 26 % à 21 % des apparitions ; le Stylo Rouge tombe alors entre 3:46 et 4:15. Le pilote gagne 2 à 5 morpions par partie. Pour un humain, le chapitre reste à surveiller : si le brouillon paraît trop facile, monter `rateCap` (20) ou les PV du Stylo Rouge.

Itération 6 (chapitre IV) : montage vidéo (mots donnés, niveau 46, trois pages tournées), le pilote ouvre 6 à 7 trésors et bat la Pieuvre-Buvard sans grande peine. Au brouillon (37 mots au hasard), 4 graines sur 6 gagnent, en descendant à 2 cœurs ; les 2 autres meurent vers 2:50 et 3:10. Premiers réglages beaucoup trop faciles (`scale` 3,6, pieuvre à 2 100 PV, pas de bouteilles avant 100 s) : aucun pilote ne perdait plus de deux cœurs et le combat durait plus d'une minute.

## Outils

- `tools/check.mjs` : vérifications sans navigateur.
- `tools/record.mjs` : tournage déterministe (`--smoke` pour un test rapide, `--seed N` pour forcer une graine). Sans graine, il teste plusieurs graines en accéléré et filme une partie qui va au bout.
- `tools/meta.mjs` : lit l'itération et les notes (utilisé par le workflow pour la release).
- `tools/bundle.mjs` : version en un seul fichier dans `dist/` (celle publiée dans l'artefact).
- `tools/fonts.mjs` : copie les polices depuis `node_modules`.
- Workflow `Publier l'itération` : le miroir GitHub Pages essaie de s'activer tout seul ; s'il n'y arrive pas (Pages désactivé sur le dépôt), il est sauté sans faire échouer la publication (la release et sa vidéo restent la référence).

## Carnet d'idées (libre à toi de piocher, de modifier ou d'ignorer)

- ~~**Portées musicales**~~ : fait à l'itération 3 (chapitre II). ~~**Papier millimétré**~~ : fait à l'itération 5 (chapitre III). ~~**Carte au trésor**~~ : faite à l'itération 6 (chapitre IV), avec le buvard qui boit tout en patron. ~~**Calligraphie**~~ : faite à l'itération 8 (chapitre V). ~~**Page de garde**~~ : faite à l'itération 10 (chapitre VI, papier marbré, ex-libris, le Cartable). ~~**Un deuxième cahier**~~ : le cahier de brouillon, fait à l'itération 13 (chapitre VII, morpion, Stylo Rouge). **La suite** (promesse dans la marge du VII) : le cahier de vacances (mots croisés, labyrinthes, relier les points), ou le dos de la couverture avec ses tables de multiplication. Il faudra sans doute une façon de choisir son cahier sur l'écran titre (des cahiers posés sur un bureau ?), maintenant que les boutons de chapitre sont sept.
- **La carte, la suite** : des îles qui comptent vraiment (sable qui ralentit, mer où l'on glisse), un perroquet qui répète la dernière attaque, une boussole à soi (mot BOUSSOLE ?) qui montre le trésor, des trésors piégés (un coffre-mimique), une carte qui se déchire.
- **La figure, la suite** : des figures imposées (« trace un carré »), des points qui bougent, un compas à soi (mot COMPAS ?) qui trace un cercle protecteur ; des mots de géométrie comme pouvoirs (ANGLE, RAYON).
- ~~**Commencer au chapitre II**~~ : fait à l'itération 4 (brouillon de 19 mots au hasard), et au chapitre III à l'itération 5. Pour plus tard : un écran titre qui montre les pages débloquées comme les onglets d'un classeur.
- ~~**Refrain**~~ : fait à l'itération 4 (notes à toucher dans l'ordre). Pour plus tard : un refrain « en canon » que deux mélodies se partagent ; un refrain caché que seul l'écho d'une ligne traversée révèle ; ~~une version du chapitre I (une phrase à recopier mot à mot, la « copie »)~~ : faite à l'itération 12 (les lignes).
- **Les paroles** (TODO dans la marge, et nouvelle promesse « les paroles ? » à côté du refrain) : des syllabes sous les notes du refrain, qui forment un mot ; les dictées du chapitre II écrites sous la portée, comme des paroles de chanson.
- **Les lignes, la suite** : des lignes en deux couleurs (un mot au stylo rouge à repasser), une ligne qui se recopie en miroir, une rature « pâté » qui fait des taches sur la ligne en cours, la phrase de fin écrite comme une ligne au bas de la page, des lignes à copier aussi sur les autres pages (une portée à recopier note à note ?).
- **Bons points** : de petites cartes illustrées à collectionner, gagnées par des exploits ; une page « collection » dans le carnet de bord. (Le bestiaire donne déjà un bon point doré par page complète : on pourrait les compter sur l'écran titre.)
- ~~**Bestiaire**~~ : fait à l'itération 7. Pour plus tard : un croquis qui montre l'attaque de la rature quand on le touche ; des ratures « rares » (une gomme dorée, un gribouillis à l'envers) qui n'ont qu'une case en pointillés ; une page de patrons à part, avec leurs phrases de fin.
- ~~**Page du jour**~~ : faite à l'itération 11 (le devoir du jour), avec la consigne « écrire en miroir » à l'itération 12. Pour plus tard : d'autres consignes (« dictée à l'envers », « une seule lettre compte »), un devoir du week-end plus long (deux pages d'affilée), un carnet de notes qui garde les sept derniers jours, un code du jour à recopier pour comparer sa note avec un ami (sans aucun serveur).
- ~~**Combinaisons de mots**~~ : fait à l'itération 2 (cinq mots composés), puis trois de plus à l'itération 9 (CITATION, CALLIGRAPHIE, LUNE ROUSSE). Pour plus tard : CLAIR DE LUNE (SOUFFLE + LUNE, les lunes soignent ?), VENT + VIRGULE, un mot composé à trois mots très rare (une « phrase » ?), des unions propres à un chapitre (une union qui n'existe que sur la portée).
- ~~**Accessibilité : secousses**~~ : fait à l'itération 2 (réglage « Secousses »). ~~Vitesse du jeu~~ : faite à l'itération 11. Restent : contraste renforcé, daltonisme.
- **Nouvelles ratures** : ~~le tipp-ex, la tache de café, le trombone, le taille-crayon~~ (faits à l'itération 13, au brouillon). Restent : la règle qui balaie la page, l'agrafeuse, le compas à pointe sèche qui épingle la goutte.
- **Patrons de chapitres** : ~~le Correcteur au stylo rouge~~ (le Stylo Rouge, itération 13), ~~le Cartable~~ (itération 10). Reste : la Photocopieuse qui duplique tout (les ratures, et toi ?).
- **Le morpion, la suite** : une grille de 4 × 4 (« puissance 4 » au brouillon ?), des X qui trichent quand le Stylo Rouge est là, un morpion à jouer contre un ami sur le même clavier, un « morpion ultime » (neuf grilles) pour le cahier de vacances.
- **Lisibilité** : quand la page est très tachée en fin de chapitre, les taches pourraient sécher plus vite (ou une option « page propre »).
- **Accessibilité** : options de contraste, daltonisme (les secousses et la vitesse sont faites).
- **Histoire** : une phrase d'histoire se révèle à chaque chapitre, comme si le cahier racontait quelque chose.
- **Musique** : un thème par chapitre (fait à l'itération 3 pour le I et le II) ; reste une musique qui réagit aux mots choisis.
- **Encre sympathique, la suite** : des lettres invisibles cachées dans la page, révélées seulement quand on est soi-même invisible.
- **La calligraphie, la suite** : une lettrine à dorer avec un motif imposé (rouge puis or), un mot à recopier lettre par lettre en suivant des pointillés (la « copie »), un encrier à soi qui recharge la plume, un mot composé PLUME + ENCRE = « CALLIGRAPHIE » qui laisserait derrière toi un trait qui brûle les ratures.
- **Lisibilité, chapitre V** : en fin de chapitre, la page est très chargée (lettres au sol, taches, encre) ; on pourrait ramasser automatiquement les lettres très anciennes, ou alléger les taches.
- ~~**Carnet des unions**~~ : fait à l'itération 9 (dernière page du bestiaire). Pour plus tard : la phrase de fin écrite au bas du carnet, une fiche qui montre l'effet en petit quand on la touche.
- ~~**Citations, la suite**~~ : des citations propres à chaque page, faites à l'itération 10. Reste : une citation qu'on pourrait lire en entier en pause.
- **L'ex-libris, la suite** : écrire soi-même son nom sur l'étiquette du cahier (gardé en local, jamais envoyé) ; un sceau piégé qui fond si on traîne ; une page « collection » des six emblèmes ; des sceaux sur d'autres chapitres (porter une note jusqu'à la portée ?).
- **Le Cartable, la suite** : qu'il recrache des ratures de tous les chapitres (le bestiaire en entier), une fermeture éclair qui coupe la page en deux.
- **Musique** : ~~« Frère Jacques » en canon~~ (fait à l'itération 13, au brouillon). Pour plus tard : d'autres comptines traditionnelles pour d'autres pages (« À la claire fontaine », « Une souris verte »), et un refrain du chapitre II à deux voix sur le même principe.
