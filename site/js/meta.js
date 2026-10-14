// Métadonnées de l'itération et carnet de bord. À mettre à jour à CHAQUE itération (lu par tools/meta.mjs et tools/check.mjs).
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

/* =====================================================================
   MÉTA : à mettre à jour à CHAQUE itération (lu par tools/record.mjs)
   ===================================================================== */
const GAME_META = { iteration: 10, date: '2026-10-14', title: 'La page de garde', chapter: 'VI', chapterName: 'La page de garde' };
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
    ] }
];
window.GAME_META = GAME_META;
// Dépôt GitHub (rempli automatiquement par le workflow de publication) : sert à retrouver les vidéos des anciennes itérations
const REPO = '__REPO__';
const HAS_REPO = !REPO.startsWith('__');
const LOCAL_VIDEOS = true; // false dans la version artefact en fichier unique (tools/bundle.mjs) : les vidéos restent sur GitHub
