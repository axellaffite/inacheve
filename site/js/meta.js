// Métadonnées de l'itération et carnet de bord. À mettre à jour à CHAQUE itération (lu par tools/meta.mjs et tools/check.mjs).
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

/* =====================================================================
   MÉTA : à mettre à jour à CHAQUE itération (lu par tools/record.mjs)
   ===================================================================== */
const GAME_META = { iteration: 22, date: '2026-10-23', title: 'La perforatrice', chapter: 'XII', chapterName: 'Le cahier de textes' };
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
    ] }
];
window.GAME_META = GAME_META;
// Dépôt GitHub (rempli automatiquement par le workflow de publication) : sert à retrouver les vidéos des anciennes itérations
const REPO = '__REPO__';
const HAS_REPO = !REPO.startsWith('__');
const LOCAL_VIDEOS = true; // false dans la version artefact en fichier unique (tools/bundle.mjs) : les vidéos restent sur GitHub
