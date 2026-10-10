// Métadonnées de l'itération et carnet de bord. À mettre à jour à CHAQUE itération (lu par tools/meta.mjs et tools/check.mjs).
// Scripts classiques partagés : les déclarations de premier niveau sont visibles des fichiers chargés ensuite.
'use strict';

/* =====================================================================
   MÉTA : à mettre à jour à CHAQUE itération (lu par tools/record.mjs)
   ===================================================================== */
const GAME_META = { iteration: 4, date: '2026-10-10', title: 'Le refrain', chapter: 'II', chapterName: 'La portée' };
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
    ] }
];
window.GAME_META = GAME_META;
// Dépôt GitHub (rempli automatiquement par le workflow de publication) : sert à retrouver les vidéos des anciennes itérations
const REPO = '__REPO__';
const HAS_REPO = !REPO.startsWith('__');
const LOCAL_VIDEOS = true; // false dans la version artefact en fichier unique (tools/bundle.mjs) : les vidéos restent sur GitHub
