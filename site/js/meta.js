// Métadonnées de l'itération et carnet de bord. À mettre à jour à CHAQUE itération (lu par tools/meta.mjs et tools/check.mjs).
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

/* =====================================================================
   MÉTA : à mettre à jour à CHAQUE itération (lu par tools/record.mjs)
   ===================================================================== */
const GAME_META = { iteration: 36, date: '2026-11-27', title: 'Le cahier de sciences', chapter: 'XIX', chapterName: 'Le cahier de sciences' };
const JOURNAL = [
  { iteration: 1, date: '2026-10-09', title: 'Le premier brouillon',
    notes: [
      "Naissance du monde : une page de cahier à grands carreaux, entourée de marges que personne n'a encore écrites.",
      "Tu es une goutte d'encre. Ta plume tire toute seule ; toi, tu esquives et tu fais des pâtés.",
      "Quatre ratures veulent effacer la page : le gribouillis, la biffure, la tache et la gomme. Au bout du chapitre, la Grande Rature.",
      "Douze mots-pouvoirs à apprendre en montant de niveau, et des dictées à compléter lettre par lettre.",
      "Musique et bruitages générés en direct, sans aucun fichier son."
    ] },
  { iteration: 2, date: '2026-10-09', title: 'Les mots se tiennent la main',
    notes: [
      "Les mots composés arrivent : quand deux mots atteignent le niveau 2, ils peuvent s’unir sur une fiche dorée.",
      "Cinq unions à découvrir : POINT-VIRGULE, POINT DE FEU, ÉCHO DE LUNE, PLUME AU VENT et ENCRE SYMPATHIQUE, qui te rend invisible après un pâté.",
      "Sur téléphone, les sous-titres descendent au-dessus de la dictée et ne cachent plus tes mots.",
      "Nouveau réglage « Secousses » (bouton ou touche C) pour garder la page immobile quand ça cogne.",
      "Une nouvelle note au crayon est apparue dans la marge du haut. Sauras-tu la trouver ?"
    ] },
  { iteration: 3, date: '2026-10-10', title: 'On tourne la page',
    notes: [
      "Le chapitre II est écrit : quand la Grande Rature tombe, on tourne la page, et on garde ses mots et son niveau.",
      "La nouvelle page est une partition. Ses lignes chantent quand tu les traverses, et chaque rature biffée sonne une note.",
      "Trois ratures musicales : la croche qui sautille, le soupir qui disparaît et réapparaît, le métronome dont le cercle frappe au quatrième tic.",
      "Au bout de la portée t’attend la Fausse Note : gammes en spirale, accords, et des portées entières de notes où il faut trouver la respiration.",
      "L’encre sèche doucement : les vieilles taches pâlissent, la page reste lisible même après mille ratures."
    ] },
  { iteration: 4, date: '2026-10-10', title: 'Le refrain',
    notes: [
      "Au chapitre II, un refrain s’écrit sur la portée : quelques notes à toucher dans l’ordre, avant que la mélodie ne se perde.",
      "Quand le refrain est complet, la page chante : une onde de notes dorées balaie les ratures, efface les notes rouges et te rend un cœur.",
      "Chaque refrain réussi en appelle un autre, un peu plus long. Une flèche dorée montre où il t’attend.",
      "Une fois la Grande Rature battue, tu peux commencer directement au chapitre II, avec un brouillon de mots tirés au hasard.",
      "Dans la marge, la promesse du refrain est tenue. Une autre l’a remplacée…"
    ] },
  { iteration: 5, date: '2026-10-11', title: 'Tout se mesure',
    notes: [
      "Le chapitre III est écrit : derrière la Fausse Note, une page de papier millimétré où tout se mesure.",
      "Quatre ratures de géométrie : le segment qui fait des moulinets, l’équerre qui trace un angle droit sur toi, le compas qui dessine des cercles et le rapporteur qui tire en éventail.",
      "Relie les points A, B, C… dans l’ordre, puis reviens au point A : la figure fermée se hachure et frappe tout ce qu’elle enferme.",
      "Au bout de la page t’attend la Règle de fer : ses graduations s’envolent, elle fait des moulinets et s’abat de tout son long là où tu te tiens.",
      "Les compas et les règles laissent leurs traits de crayon sur la page, comme un vrai cahier de géométrie.",
      "Une fois la Fausse Note battue, tu peux commencer directement au chapitre III."
    ] },
  { iteration: 6, date: '2026-10-11', title: 'X marque l’endroit',
    notes: [
      "Le chapitre IV est écrit : derrière la Règle de fer, une carte au trésor, avec ses îles, sa mer, son petit navire et sa rose des vents.",
      "Suis les pointillés : ils se dessinent devant toi à mesure que tu avances, jusqu’à un X rouge. Reste dessus pour creuser, et le coffre s’ouvre dans une pluie de doublons.",
      "Quatre ratures venues du large : la mouette qui tourne puis pique, le crabe qui marche de travers, le tourbillon qui t’attire et la bouteille à la mer qui tire ses bouchons.",
      "Au bout de la carte t’attend la Pieuvre-Buvard : ses tentacules balaient la page, elle boit ton encre… puis te la recrache.",
      "Une musique de marin, à six temps, qui tangue comme un bateau.",
      "Une fois la Règle de fer battue, tu peux commencer directement au chapitre IV."
    ] },
  { iteration: 7, date: '2026-10-12', title: 'Le bestiaire',
    notes: [
      "Le cahier a maintenant son bestiaire : une page par chapitre, où chaque rature est croquée, scotchée et annotée au crayon.",
      "La première fois que tu biffes une rature, son croquis glisse au bord de l’écran. Il rejoint aussitôt le bestiaire, et il y reste d’une partie à l’autre.",
      "Les croquis bougent encore un peu : le métronome bat la mesure, le crabe pince, les yeux des patrons te cherchent.",
      "Chaque fiche compte combien de fois tu as biffé sa rature. Une page complète gagne un bon point doré.",
      "Ouvre le bestiaire avec la touche B, ou le bouton « Bestiaire » de l’écran titre, de la pause et de la fin de partie."
    ] },
  { iteration: 8, date: '2026-10-13', title: 'Pleins et déliés',
    notes: [
      "Le chapitre V est écrit : derrière la Pieuvre-Buvard, une page de calligraphie, avec ses lignes d’écriture et ses grandes lettres pâles.",
      "Une lettrine attend dans son cadre rouge et or. Passe et repasse dessus pour la couvrir de feuille d’or : une fois dorée, elle s’illumine et frappe toute la page autour d’elle.",
      "Quatre ratures à la plume : le délié qui zigzague, la plume d’oie qui crache son encre, l’arabesque dont les boucles brûlent tant qu’elles sont fraîches, et la majuscule et sa couronne de fleurons.",
      "Au bout de la page t’attend le Grand Paraphe : il annonce sa signature en pointillés, puis la trace d’un seul trait, et fait tomber de gros points sur les i.",
      "Une valse au clavecin accompagne la plume, et le bestiaire gagne une cinquième page.",
      "Une fois la Pieuvre-Buvard battue, tu peux commencer directement au chapitre V."
    ] },
  { iteration: 9, date: '2026-10-13', title: 'Entre guillemets',
    notes: [
      "Trois mots de plus savent s’unir. GUILLEMETS + ITALIQUE = CITATION : une phrase entre guillemets traverse la page, frappe tout ce qu’elle croise et coupe la parole aux traits rouges.",
      "PLUME + ENCRE = CALLIGRAPHIE : tu écris en marchant, en pleins et en déliés, et ton sillage brûle les ratures qui marchent dessus.",
      "LUNE + FEU = LUNE ROUSSE : tes lunes s’embrasent et mettent le feu à tout ce qu’elles cognent.",
      "Le bestiaire a une dernière page : le carnet des unions. Chaque mot composé que tu choisis y est rangé pour de bon ; les autres attendent, avec un indice.",
      "L’écran titre et la fin de partie comptent tes unions."
    ] },
  { iteration: 10, date: '2026-10-14', title: 'La page de garde',
    notes: [
      "Le chapitre VI est écrit : derrière le Grand Paraphe, la page de garde du cahier, en papier marbré, avec son étiquette « Nom : Inachevé ».",
      "Un sceau de cire t’attend sur la page : ramasse-le et porte-le jusqu’à l’ex-libris. Si une rature te touche en chemin, tu le lâches !",
      "Chaque sceau porte l’emblème d’une page déjà écrite : la plume, la croche, le compas, l’ancre, la lettrine… et la goutte d’encre, c’est toi.",
      "Quatre ratures de reliure : la marbrure qui tourne, le signet qui fait claquer son ruban, le peigne qui trace des sillons d’encre et le tampon qui saute pour marquer « VU ».",
      "Au bout du cahier t’attend le Cartable : il lance sa trousse, balaie la page de ses bretelles et saute pour retomber sur toi. La musique ? « Au clair de la lune », à la boîte à musique.",
      "Les citations parlent maintenant la langue de chaque page : « do, ré, mi » sur la portée, « X marque l’endroit » sur la carte…"
    ] },
  { iteration: 11, date: '2026-10-14', title: 'Le devoir du jour',
    notes: [
      "Chaque jour, un nouveau devoir : une page du cahier tirée de la date, la même pour tout le monde, avec les mêmes mots au départ.",
      "Le devoir a sa consigne (pas de pâtés, courant d’air, brouillard de gomme, interligne double…) et son coup de pouce (pluie de lettrines, page propre, grand aimant…).",
      "À la fin, la maîtresse rend la copie : une note sur 20 entourée au stylo rouge, et une appréciation. Ta meilleure note du jour reste épinglée sur l’écran titre.",
      "Lance le devoir avec la touche J, ou le bouton « Devoir du jour ». On peut le refaire autant de fois qu’on veut.",
      "Nouveau réglage « Vitesse » (bouton ou touche V) : le jeu peut tourner à 80 % ou 60 %, pour respirer un peu.",
      "Un bouton « Retour au titre » (ou la touche T) apparaît en pause et en fin de partie."
    ] },
  { iteration: 12, date: '2026-10-16', title: 'Cent lignes',
    notes: [
      "Le premier chapitre a enfin son exploit : des lignes à copier. Une phrase de punition s’écrit en pointillés sur la page.",
      "Recopie-la de gauche à droite en passant dessus. La plume a son rythme : si tu cours trop vite, elle ne suit plus.",
      "Attention aux gommes : elles effacent ce que tu as déjà écrit, et il faut le recopier.",
      "Ligne finie : la réglure balaie la page au-dessus et au-dessous de la phrase, des lettrines dorées tombent, et la phrase reste écrite sur le cahier.",
      "Nouvelle consigne pour le devoir du jour : « écrire en miroir », où la gauche et la droite sont inversées. Au chapitre I, ce sont les lignes copiées qui font la note."
    ] },
  { iteration: 13, date: '2026-10-16', title: 'Le cahier de brouillon',
    notes: [
      "Le premier cahier est plein : derrière la page de garde s’ouvre un deuxième cahier, le cahier de brouillon, couvert de calculs barrés et de petits dessins.",
      "Une partie de morpion se dessine sur la page. Reste un instant dans une case pour y poser ton O ; les X répondent au stylo rouge. Trois O alignés, et toute la page tremble !",
      "Quatre ratures de brouillon : le trombone qui bondit, la tache de café qui renverse des flaques collantes, le taille-crayon qui mange tes lettres et le blanco qui déroule son ruban brûlant.",
      "Au bout du brouillon t’attend le Stylo Rouge : il entoure les fautes, barre la page de trois traits et referme sur toi un grand zéro… dont il faut trouver l’ouverture.",
      "La musique ? « Frère Jacques », en canon. Le bestiaire gagne une septième page, et le devoir du jour peut maintenant tomber sur le brouillon."
    ] },
  { iteration: 14, date: '2026-10-19', title: 'La photocopieuse',
    notes: [
      "Clac, clac… Une photocopieuse s’est égarée dans le cahier. Vers 1:40, elle débarque sur chaque page, même au brouillon.",
      "Elle soulève son capot, annonce une bande de page en pointillés verts, puis la balaie de sa lumière : chaque rature prise dedans est photocopiée. Les copies sont plus pâles, plus fragiles, et portent un petit « bis ».",
      "Et si c’est toi qui passes dans la lumière ? Elle imprime une copie grise de la goutte, qui te suit et tire avec toi pendant douze secondes. À toi de choisir : fuir la lumière, ou plonger dedans.",
      "Après chaque passage, elle crache ses feuilles en éventail. Biffe-la : bourrage papier, et toutes ses copies s’effacent d’un coup. Sinon, à court de papier, elle finit par s’en aller.",
      "L’écran de fin compte maintenant tes photocopies."
    ] },
  { iteration: 15, date: '2026-10-19', title: 'Le cahier de vacances',
    notes: [
      "Le brouillon est plein : derrière le Stylo Rouge s’ouvre un troisième cahier, le cahier de vacances, couvert d’exercices en couleurs (relie les points, mots croisés, devinettes…).",
      "Un vrai labyrinthe s’imprime sur la page. Ses murs t’arrêtent, mais les ratures, elles, passent par-dessus ! Entre par « entrée », ressors par « sortie » : le soleil d’été balaie alors toute la page.",
      "Quatre ratures d’été : le coquillage qui roule, le pointillé (des points à relier, seule la tête craint tes gouttes), le ballon de plage qui rebondit sur les murs et le cornet de glace qui lance sa boule là où tu vas.",
      "Au bout des vacances t’attend le Grand Soleil : rayons qui tournent, marée qu’on ne traverse que par la bouée, et coucher de soleil où la page entière plonge dans la nuit.",
      "La musique ? Une petite chanson de plage au ukulélé. Le bestiaire gagne une huitième page, et le devoir du jour peut tomber sur le cahier de vacances."
    ] },
  { iteration: 16, date: '2026-10-20', title: 'Le bureau',
    notes: [
      "Nouveau : le bureau ! Les trois cahiers sont posés sur un vieux pupitre d’écolier, avec un onglet de couleur pour chaque page. Touche Tab (ou le bouton « Le bureau ») pour l’ouvrir.",
      "La goutte d’encre saute d’onglet en onglet, et chaque onglet joue la musique de sa page : la portée, la valse, « Frère Jacques », la chanson de plage…",
      "Chaque page débloquée révèle une phrase de l’histoire de la goutte. Lues dans l’ordre, elles racontent tout le cahier.",
      "Le bureau garde tes records : combien de fois tu as battu chaque patron, et en combien de temps au mieux. Une étoile dorée marque les pages gagnées.",
      "Le devoir du jour est punaisé sur le bureau, à côté d’une place vide… pour un quatrième cahier ?"
    ] },
  { iteration: 17, date: '2026-10-20', title: 'La rentrée',
    notes: [
      "Les vacances sont finies : derrière le Grand Soleil s’ouvre un quatrième cahier, tout neuf. Le chapitre IX se joue au dos de sa couverture, là où sont imprimées les tables de multiplication.",
      "Nouveau : le calcul mental ! Une ardoise pose une multiplication, et les réponses flottent dans des bulles autour d’elle. Touche la bonne : toute la page est frappée. Une mauvaise ? « Faux ! », et des chiffres s’échappent.",
      "Quatre ratures de calcul : le chiffre qui trottine, le signe fois qui tire en croix, le signe égal qui lance ses deux traits, et la retenue qui saute sur les autres ratures pour les rendre plus solides.",
      "Au bout de la rentrée t’attend le Boulier : des rangées de perles où une seule tringle est vide, des billes qui tombent du ciel, et une grande table de Pythagore dont la ligne et la colonne s’allument sous tes pieds.",
      "La musique ? Une petite marche de rentrée au glockenspiel, avec la cloche de l’école. Le bureau accueille le cahier neuf, et le bestiaire gagne une neuvième page."
    ] },
  { iteration: 18, date: '2026-10-21', title: 'L’agrafeuse',
    notes: [
      "Clac ! Une deuxième machine s’est échappée du bureau : l’agrafeuse. Vers 2:20, elle débarque sur chaque page, au brouillon comme dans le devoir du jour.",
      "Elle ouvre la mâchoire, montre deux rails de pointillés rouges… puis tire trois agrafes d’affilée. Une agrafe qui te touche te cloue à la page : débats-toi dans tous les sens, ou fais un pâté, pour t’arracher.",
      "Les agrafes qui ratent se plantent dans le papier. La première rature qui marche dessus reste clouée sur place un bon moment : à toi d’attirer les ratures sur le chemin des agrafes.",
      "Biffe-la, et elle lâche une dernière rafale : toutes les ratures autour d’elle sont agrafées à la page d’un seul coup.",
      "Le bestiaire ouvre une page pour les rares : les machines égarées qui n’appartiennent à aucun chapitre. La photocopieuse y a enfin son croquis, l’agrafeuse aussi."
    ] },
  { iteration: 19, date: '2026-10-21', title: 'La récré',
    notes: [
      "Driiing ! Derrière le Boulier, le cahier neuf s’ouvre sur le chapitre X : la récré. La page est restée par terre dans la cour, sur le bitume, couverte de dessins à la craie.",
      "Nouveau : la marelle ! Elle se dessine près de toi avec un caillou dans une case. Saute de la Terre jusqu’au Ciel, case après case, sans jamais marcher sur le caillou : au Ciel, toute la cour est frappée. Un pâté, c’est un saut : il passe par-dessus les cases.",
      "Quatre ratures de récré : le calot qui ne sait pas freiner, la toupie qui crache en spirale, la corde à sauter qu’on franchit d’un pâté quand elle frappe le sol, et l’avion en papier qui vise puis pique.",
      "Au bout de la récré t’attend le Grand Sifflet : des ondes de sifflet où il faut trouver l’ouverture, la balle au prisonnier… et « un, deux, trois, soleil ! ». Quand il se retourne, tout le monde se fige : toi aussi, ne touche plus à rien !",
      "La musique ? Une comptine de cour à la flûte, avec un jeu de mains. Sur le bureau, le cahier neuf a maintenant deux onglets, et la touche 0 ouvre directement la page X."
    ] },
  { iteration: 20, date: '2026-10-22', title: 'Le cahier de poésie', notes: [
      "Un cinquième cahier arrive sur le bureau : le cahier de poésie. Au chapitre XI, un dessin aux crayons de couleur à gauche, un poème recopié à droite.",
      "Nouveau : les rimes ! Des fiches sont posées face cachée sur la page. Marche dessus pour les retourner deux par deux : LUNE et PLUME riment, elles restent ouvertes ; GOMME et CHAT, non… et deux vers s’échappent.",
      "Toutes les paires trouvées, le poème est récité : ses mots s’envolent en couronne et frappent toute la page, puis il reste recopié sur le cahier.",
      "Quatre ratures de poésie : le ver en béret qui avance en accordéon, les rimes jumelles qui se répondent à travers toi, le point d’exclamation qui tombe de tout son long, et le corbeau qui lâche son fromage (une fois tombé, ramasse-le : miam !).",
      "Au bout du cahier t’attend le Grand Alexandrin : ses douze pieds qui marchent sur la page, ses rimes croisées, A, B, A, B… et sa césure qui coupe la page en deux.",
      "La musique ? Une berceuse à la harpe. Les citations parlent maintenant la langue des pages VII à XI, et la touche à droite du 0 ouvre directement la page XI."
    ] },
  { iteration: 21, date: '2026-10-22', title: 'Le cahier de textes', notes: [
      "Un sixième cahier arrive sur le bureau : le cahier de textes. Au chapitre XII, l’emploi du temps de la semaine est collé à gauche, les devoirs à faire sont écrits à droite.",
      "Driiing ! Toutes les 36 secondes, la cloche sonne et la matière change : calcul, musique, récré, géométrie, poésie… Les ratures de la page changent avec elle, et la musique aussi.",
      "Nouveau : à chaque heure, un devoir s’écrit dans le cahier de textes. Biffe les ratures surlignées (elles sont plus fragiles), puis va cocher la case : toute la page est frappée. Si la cloche sonne avant, le devoir est oublié.",
      "Deux ratures à soi : le réveil qui tremble puis sonne, et la cocotte en papier qui s’ouvre en quatre… et pince.",
      "À 16 h 30 t’attend la Grande Horloge : ses aiguilles qui balaient la page, ses douze heures qui se referment sur toi (sors par celle qui manque !), et sa sonnerie qui fait venir la matière suivante.",
      "Sur le bureau, la touche « = » (deux à droite du 0) ouvre directement la page XII, et la feuille du devoir du jour a retrouvé son titre en entier."
    ] },
  { iteration: 22, date: '2026-10-23', title: 'La perforatrice', notes: [
      "Clac ! Une troisième machine s’est échappée du bureau : la perforatrice. Vers 1:00, elle débarque sur chaque page, au brouillon comme dans le devoir du jour.",
      "Elle lève son levier, vise la goutte (un cercle de pointillés rouges)… puis saute et retombe dessus en perçant deux trous dans la page. Le rond de papier s’envole en confetti.",
      "Par les trous, on voit le bois du pupitre. La goutte s’arrête au bord (un pâté saute par-dessus), mais les ratures qui marchent dessus tombent à travers la page ! À toi de les attirer.",
      "Biffe-la, et sa dernière perforation troue la page sous toutes les ratures autour d’elle : elles tombent d’un coup. Au bout d’un moment, une rustine vient reboucher chaque trou.",
      "Le devoir du jour a une nouvelle consigne, « Feuille perforée » : la perforatrice arrive dès 0:20, et revient toujours. La page des rares du bestiaire a son troisième croquis."
    ] },
  { iteration: 23, date: '2026-10-23', title: 'Les bons points', notes: [
      "Comme à l’école : chaque exploit rapporte maintenant des bons points. Un refrain chanté, un trésor déterré, un calcul juste, trois dictées complètes, un nouveau croquis… et trois d’un coup quand un patron tombe.",
      "Dix bons points font une image ! Douze vignettes peintes à la gouache sont à gagner : le hibou savant, la montgolfière, le phare, la baleine, le moulin… Chacune bouge un peu, si on la regarde bien.",
      "Les images se rangent à la toute dernière page du bestiaire, « Mes images ». Touche I pour y aller directement, depuis l’écran titre ou la pause.",
      "Une petite étoile dorée glisse sur le bord de la page à chaque bon point gagné, avec dix étoiles pour savoir où tu en es. Les bons points sont gardés d’une partie à l’autre.",
      "La copie de fin de partie compte aussi les bons points gagnés pendant la partie."
    ] },
  { iteration: 24, date: '2026-10-25', title: 'Le carnet de correspondance', notes: [
      "Un septième cahier arrive sur le bureau : le carnet de correspondance. Au chapitre XIII, ses cases imprimées (« Mot des parents », « Absences et retards »…) sont déjà remplies à la main.",
      "Nouveau : des mots à faire signer ! Un mot de l’école se pose sur la page. Reste près de lui et la plume des parents le signe, trait après trait. Une fois signé, toute la page est frappée.",
      "Mais les ratures ont vu le mot, elles aussi : chacune qui le touche y fait un pâté, et la signature recule. Défends-le ! Un mot signé sans un seul pâté frappe encore plus fort.",
      "Deux nouvelles ratures : le bâton de colle, qui laisse des flaques où l’on avance deux fois moins vite, et l’enveloppe, qui s’ouvre et t’écrit trois lettres d’un coup.",
      "À 3:00 t’attend le Grand Tampon du directeur : il saute et retombe là où tu es (sors de son ombre !), éclabousse la page d’encre violette et t’envoie « LU ET APPROUVÉ », lettre par lettre.",
      "Le carnet a sa musique, une valse à l’accordéon, et sa page au bestiaire. Chaque mot signé rapporte un bon point."
    ] },
  { iteration: 25, date: '2026-10-26', title: 'Le voisin de table', notes: [
      "Touche N (ou bouton « Voisin ») : un voisin de table s’assied à côté de toi. C’est une goutte d’encre verte, avec un épi sur la tête, et il te suit de page en page.",
      "Sa plume tire toute seule sur les ratures. Il se met aussi en travers des coups qui te visent : il les arrête… et reste étourdi un moment, avec des étoiles autour de la tête.",
      "Quand il ne te reste que deux cœurs, il vient t’en prêter un (une fois de temps en temps, il n’en a pas tant que ça).",
      "Jouer à deux sur le même clavier : en mode « à deux », tu joues avec ZQSD et un ami dirige le voisin avec les flèches. S’il lâche les flèches un moment, le voisin rejoue tout seul.",
      "Il papote, aussi : « Copie pas sur moi ! ». Le devoir du jour, lui, se fait toujours seul, et la copie de fin dit ce que ton voisin a biffé."
    ] },
  { iteration: 26, date: '2026-10-27', title: 'Le bulletin', notes: [
      "Chapitre XIV : le bulletin de fin d’année, promis dans la marge du carnet de correspondance. Un huitième cahier rejoint le bureau, bleu comme les vrais bulletins.",
      "Contrôle surprise ! Cinq ratures deviennent des questions, entourées et numérotées au stylo rouge. Tu as vingt secondes pour les biffer toutes, et chaque coup reçu coûte trois points.",
      "Ta note s’écrit au stylo rouge dans le bulletin imprimé sur la page, avec une appréciation. Au-dessus de la moyenne, une onde balaie les ratures et la mention reste tamponnée ; à 16 et plus, un cœur en prime.",
      "Deux nouvelles ratures : le zéro pointé, qui vise puis roule tout droit, et la note sur vingt, qui se coupe en deux notes sur dix quand on la biffe.",
      "Le Grand Bulletin s’ouvre en grand pour lancer ses notes en éventail et des murs de « peut mieux faire » : il faut passer par le trou. En colère, il convoque le conseil de classe.",
      "Une marche de distribution des prix accompagne la page, et le bestiaire gagne une quatorzième page."
    ] },
  { iteration: 27, date: '2026-10-27', title: 'Le taille-crayon électrique', notes: [
      "Vrrrr ! Une quatrième machine s’est échappée du bureau : le taille-crayon électrique, grand frère branché de celui du brouillon. Vers 0:35, il débarque sur chaque page, son fil arraché traînant derrière lui.",
      "Quand son voyant passe au rouge, il aspire tout ce qui traîne autour de lui : les lettres, les ratures… et toi. Un pâté t’arrache à son souffle.",
      "Les ratures aspirées sont taillées en copeaux et remplissent son tiroir transparent. Quand il est plein, il le vide en crachant une couronne de copeaux.",
      "Tes gouttes d’encre sont aspirées, elles aussi : tire dans le tourbillon, elles frappent deux fois plus fort. Biffé, il rend en fontaine toutes les lettres qu’il a mangées, avec un bon point.",
      "Le devoir du jour a une nouvelle consigne, « Crayons à tailler », et la page des rares du bestiaire son quatrième croquis. Ton voisin de table, lui, n’aime pas du tout être aspiré."
    ] },
  { iteration: 28, date: '2026-10-28', title: 'La kermesse', notes: [
      "Chapitre XV : c’est la fête de fin d’année ! Un neuvième cahier, couleur de soleil, rejoint le bureau. La page est couverte de guirlandes de fanions, de confettis et du programme de la fête.",
      "Un chamboule-tout s’installe près de toi. Approche-toi : ta plume vise les boîtes. Chaque boîte touchée s’envole, fait tomber celles du dessus et roule à travers la page en bousculant les ratures.",
      "Toutes les boîtes par terre avant que le stand ferme ? Gagné : un moulinet de papier tourne autour de toi et fauche les ratures pendant quinze secondes (et parfois un cœur en prime).",
      "Deux nouvelles ratures : les canards de la pêche, qui vont par quatre en file indienne derrière leur chef couronné, et la course en sac, qui bondit vers toi et retombe dans un grand « boum ».",
      "À 3:00, le Grand Manège tourne en lançant des lettres en spirale. Quand le pompon descend, attrape-le : un tour gratuit, et le manège s’arrête avec le tournis. Une polka à l’orgue de barbarie accompagne la fête."
    ] },
  { iteration: 29, date: '2026-10-28', title: 'Le coloriage magique', notes: [
      "Sur toutes les pages, un coloriage magique s’imprime près de toi vers 0:20 : un dessin au crayon avec ses zones numérotées, sa légende, et trois crayons de couleur posés autour.",
      "Ramasse un crayon, puis reste dans les zones de son numéro : les traits de couleur les remplissent peu à peu. Le numéro du crayon que tu tiens est surligné ; une zone d’une autre couleur te le rappelle.",
      "Tout colorié avant que la gomme passe ? Le dessin prend vie ! Le poisson rouge nage autour de toi et croque les ratures, le papillon sème son pollen sur les plus proches, le soleil lance ses rayons sur toute la page.",
      "Chaque coloriage réussi fait trembler les ratures alentour, reste imprimé en couleur sur la page, rapporte un bon point, compte comme exploit au devoir du jour, et rend un cœur une fois sur deux.",
      "Trois dessins se suivent, toujours dans le même ordre : le poisson, le papillon, puis le soleil. Ton voisin de table, lui, trouve qu’ils sont trop beaux."
    ] },
  { iteration: 30, date: '2026-11-23', title: 'La veillée', notes: [
      "Un dixième cahier arrive sur le bureau : le carnet de colo, avec ses sapins au crayon, sa tente et le planning de la semaine. La note de marge « les grandes vacances ? » a enfin sa réponse : le chapitre XVI, la colo.",
      "Vers 0:25, puis toutes les cinquante secondes, la nuit tombe : c’est la veillée. La page s’assombrit, seule ta lumière éclaire autour de toi, et des étoiles filantes traversent le ciel.",
      "Huit lucioles s’allument dans le noir. Attrape-les : elles vont dans ton bocal, et ta lumière grandit. Bocal plein (ou au lever du jour), tu l’ouvres et les lucioles foncent sur les ratures. Un bocal plein rend un cœur et rapporte un bon point.",
      "Deux nouvelles ratures : le moustique, qui s’arrête, vise et pique en piqué (la nuit, ils sortent en nombre), et le hérisson, qui se roule en boule, hérisse ses piquants et les lance tout autour.",
      "À 3:00, la Grande Ourse descend du ciel, une constellation avec son morceau de nuit : pluie d’étoiles filantes, étoiles qui s’allument en cercle autour de toi avant de foncer, et une berceuse en « z ». Avec elle, la nuit dure jusqu’au matin.",
      "Une berceuse originale à la guitare, avec des grillons, accompagne la page, et la Grande Ourse a sa case au bestiaire."
    ] },
  { iteration: 31, date: '2026-11-24', title: 'Le jeu de l’oie', notes: [
      "Sur toutes les pages, vers 0:40, un petit jeu de l’oie s’imprime à côté de toi : une spirale de cases, un pion goutte d’encre et un gros dé posé tout près.",
      "Fonce dans le dé : il part en roulant à travers les ratures, les bouscule et les cogne, puis s’arrête sur un nombre. Avec un pâté, il roule encore plus loin.",
      "Ton pion avance d’autant de cases. Sur une case de l’oie, il avance encore du même nombre ; le pont le fait sauter plus loin, le labyrinthe le fait reculer.",
      "Arrivé au centre ? L’oie s’envole : une grande oie de papier en écharpe rouge traverse la page en fauchant les ratures. Un cœur, un bon point, et un exploit pour le devoir du jour.",
      "La vidéo de l’itération 30 n’a pas pu être tournée (la machine qui filme avait changé) : c’est réparé, le tournage reprend."
    ] },
  { iteration: 32, date: '2026-11-25', title: 'La farandole', notes: [
      "Un onzième cahier arrive sur le bureau, couleur brique, avec sa cloche : le dernier jour d’école. La note de marge « le dernier jour ? » a enfin sa réponse : le chapitre XVII.",
      "La dernière page du cahier se remplit de dédicaces : les copains de la classe arrivent un à un et te demandent : « Je peux écrire dans ton cahier ? » Va les voir avant qu’ils repartent !",
      "Chaque copain écrit son petit mot sur la page, puis te suit en farandole et tire sur les ratures avec sa plume. Attention : une rature qui le bouscule, et il lâche ta main.",
      "Six copains dans la file ? C’est la ronde ! Ils tournent autour de toi en se donnant la main, renversent les ratures et arrêtent les coups. À la fin : « Bonnes vacances ! », un cœur et un bon point.",
      "Deux nouvelles ratures : le chewing-gum, qui souffle des bulles et colle aux pattes, et la feuille volante, qui file tout droit quand souffle le courant d’air.",
      "À 3:00, le Grand Tableau se décroche du mur : volées de craies, brosse qui fonce, et cercles de craie qui crissent (passe par le trou !). Une chanson du dernier jour, avec claquements de mains, accompagne la page."
    ] },
  { iteration: 33, date: '2026-11-25', title: 'Le tampon dateur',
    notes: [
      "Tchac ! Une cinquième machine s’est échappée du bureau : le tampon dateur. Vers 1:20, il débarque sur chaque page, son gros bouton rouge plein d’yeux.",
      "Il vise la goutte, saute… et retombe de tout son poids. Un cadre en pointillés annonce le coup : sors-en vite, ou fais un pâté !",
      "Tout ce qu’il tamponne reste figé à la date du jour : les ratures datées ne bougent plus et prennent plus cher, les lettres datées comptent double. Attire les ratures sous son cadre !",
      "Il avance d’un jour à chaque coup, et ses empreintes violines restent un moment sur la page. Biffé, son dernier coup de tampon date toute la foule autour de lui.",
      "Le devoir du jour a une nouvelle consigne, « Tout est daté », et la page des rares du bestiaire son cinquième croquis. Ton voisin de table n’aime pas du tout qu’on lui tamponne le front."
    ] },
  { iteration: 34, date: '2026-11-26', title: 'La classe de neige', notes: [
      "Un douzième cahier arrive sur le bureau, bleu glacier, avec son flocon : la classe de neige. La note de marge « une classe de plus ? » a sa réponse : le chapitre XVIII.",
      "Il neige sur la page, et le papier est semé de plaques de verglas : dessus, tout glisse. La goutte comme les ratures ! Sers-t’en pour les semer.",
      "Une boule de neige t’attend : pousse-la, elle roule devant toi et grossit. Bien ronde, amène-la dans le rond « ici ». Trois boules (le ventre, le buste, la tête) font un bonhomme de neige.",
      "Le bonhomme prend vie, avec son bonnet, son écharpe et son nez en carotte : il lance des boules de neige sur les ratures, puis fond doucement. Un cœur et un bon point pour toi.",
      "Deux nouvelles ratures : le flocon, qui tourne de plus en plus vite et éclate en étoile de glace, et la boule de neige, qui grossit en roulant et se casse en deux.",
      "À 3:00, la Grande Moufle descend la piste : boules en éventail, claque à plat sur le rond annoncé, et avalanches à traverser par le trou. Une chanson de neige, avec ses grelots, accompagne la page."
    ] },
  { iteration: 35, date: '2026-11-27', title: 'Le cerf-volant', notes: [
      "Sur toutes les pages, vers 0:55, un cerf-volant tombe à côté de toi, avec sa bobine et sa queue à nœuds de surligneur. Il est découpé dans la page où tu joues : un bout de portée, de carte au trésor, de papier millimétré…",
      "Ramasse-le, puis cours face au vent : une flèche te montre la direction, et elle devient verte quand tu cours du bon côté. Le vent tourne de temps en temps !",
      "Si tu t’arrêtes, ou si tu cours avec le vent dans le dos, il redescend… et finit par piquer du nez. Une rature qui te touche fait détendre le fil.",
      "En vol, il se balance au bout de son fil, et lui comme sa queue fauchent les ratures qu’ils touchent. Assez de ciel, et il touche les nuages : un grand looping autour de toi balaie la page, avec un cœur et un bon point en prime.",
      "Sur le bureau, les douze cahiers ne tenaient plus sur une ligne : ils sont maintenant rangés sur deux étagères, bien plus lisibles, avec la place vide d’un treizième cahier."
    ] },
  { iteration: 36, date: '2026-11-27', title: 'Le cahier de sciences', notes: [
      "La place vide du bureau est prise : un treizième cahier, vert tendre avec sa feuille, le cahier de sciences. Chapitre XIX : une page d’observation avec des feuilles d’herbier scotchées, le cycle de l’eau et la métamorphose de la grenouille dessinés au crayon.",
      "L’expérience du jour : faire pousser un haricot dans le coton. Ramasse l’arrosoir, remplis-le sous le petit nuage de pluie qui se promène, puis arrose le bocal. Attention : si une rature te touche, l’eau se renverse !",
      "Trois arrosages : une racine, deux feuilles… et le haricot magique pousse jusqu’au ciel. Ses lianes fouettent les ratures autour de lui, avec un cœur et un bon point pour toi.",
      "De nouvelles ratures : le têtard, qui frétille et, si on le laisse grandir, devient une grenouille qui saute là où tu vas ; et le pissenlit, qui souffle ses aigrettes en éventail, même quand on le biffe.",
      "À 3:00, la Grande Loupe se penche sur la page. Sous son verre, tout est vraiment grossi ! Elle concentre le soleil en un point qui brûle, grossit les ratures qu’elle regarde et lance des reflets. Une petite chanson de printemps, avec ses oiseaux, accompagne la page."
    ] }
];
window.GAME_META = GAME_META;
// Dépôt GitHub (rempli automatiquement par le workflow de publication) : sert à retrouver les vidéos des anciennes itérations
const REPO = '__REPO__';
const HAS_REPO = !REPO.startsWith('__');
const LOCAL_VIDEOS = true; // false dans la version artefact en fichier unique (tools/bundle.mjs) : les vidéos restent sur GitHub
