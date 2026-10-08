/* La table de Vienne — contenu du jeu (1re · Thème 1, chapitre 2 · PPO Metternich et le congrès de Vienne).
   Tous les textes affichés aux élèves sont ici : tu peux les modifier sans toucher au moteur (jeu.js).
   « Doc. 1 » et « Doc. 2 » renvoient à la fiche élève du PPO (Metternich face à la révolution ; traité de la Sainte-Alliance).
   Les personnages sont réels ; leurs paroles sont imaginées d'après les positions qu'ils ont défendues au congrès. */

const JEU = {
  titre: "La table de Vienne",
  sousTitre: "Redessiner l'Europe après Napoléon (1814-1815)",
  niveau: "1re · Thème 1, chapitre 2 · PPO Metternich et le congrès de Vienne",
  questionDepart: "Quel ordre européen les vainqueurs de Napoléon mettent-ils en place en 1815, et sur quels principes le fondent-ils ?",
  questionFinale: "L'ordre européen voulu par Metternich peut-il être durable ?",
  motsMin: 40,
  /* Code professeur : demandé pour effacer une partie et en recommencer une (note sommative). Change-le si tu veux. */
  codeProf: "METTERNICH"
};

/* ---------- Barème (points automatiques sur 14 ; la rédaction, sur 6, est corrigée par le professeur) ---------- */
const BAREME = {
  exigences: 3,   // tableau « Qui veut quoi ? », score au premier essai
  tableau: 4,     // tableau de la fiche, score au premier essai
  alliances: 3,   // 5 affirmations + QCM du bilan
  chronique: 4,   // 12 événements classés
  redaction: 6    // plan + brouillon, à la main
};

const INTRO = [
  "Vienne, septembre 1814. Napoléon a abdiqué au printemps et vit en exil sur l'île d'Elbe. Les souverains et les diplomates de toute l'Europe arrivent dans la capitale de l'empereur d'Autriche.",
  "Tu travailles pour Friedrich von Gentz, le secrétaire général du congrès. Tu vas écouter les grandes puissances, préparer les décisions… et comprendre sur quels principes elles reconstruisent l'Europe.",
  "Ton carnet de secrétaire se remplit au fil du jeu : c'est lui que tu rendras à la fin."
];

const REGLES = [
  ["Les salons", "Parle aux diplomates : note ce que chacun réclame."],
  ["La table", "Clique sur une zone hachurée de la carte pour ouvrir un dossier, puis choisis une solution."],
  ["Les jauges", "Chaque décision fait bouger l'équilibre, la légitimité, la sécurité face à la France et l'entente entre alliés."],
  ["La carte", "Glisse pour te déplacer, molette ou pincement pour zoomer. Survole un État pour lire son nom."],
  ["Le carnet", "Il garde tes choix et tes réponses. Tu peux t'arrêter et reprendre plus tard, même sur un autre ordinateur, grâce au code de reprise."]
];

/* ---------- Jauges ---------- */
const JAUGES = {
  eq:  { nom: "Équilibre", aide: "Aucune puissance ne peut dominer les autres." },
  leg: { nom: "Légitimité", aide: "Les dynasties qui régnaient avant la Révolution retrouvent leur trône." },
  sec: { nom: "Sécurité", aide: "La France est entourée d'États solides, pour qu'elle ne puisse pas recommencer." },
  ent: { nom: "Entente", aide: "Les vainqueurs restent unis. Si l'entente s'effondre, c'est la guerre entre alliés." }
};
const JAUGE_DEPART = 35;
const SEUIL_CRISE = 30; // en dessous, l'entente est rompue après la première séance

/* ---------- L'Europe de 1812 ---------- */
const EUROPE_1812 = {
  titre: "L'Europe de Napoléon, en 1812",
  texte: [
    "Voici l'Europe à l'apogée de Napoléon. L'Empire français compte plus de 130 départements, de Hambourg à Rome. Autour, des États dépendants : royaumes confiés à ses frères et à ses maréchaux, Confédération du Rhin, duché de Varsovie…",
    "Deux ans plus tard, tout s'est effondré : après la retraite de Russie (1812) et la défaite de Leipzig (1813), les Alliés entrent dans Paris (mars 1814)."
  ],
  question: {
    q: "Sur la carte de 1812, laquelle de ces villes est française ?",
    choix: ["Vienne", "Rome", "Varsovie", "Madrid"],
    bonne: 1,
    exp: "Rome est annexée à l'Empire en 1809 : elle devient le chef-lieu d'un département français. Varsovie est la capitale d'un État dépendant, Madrid celle du royaume de Joseph Bonaparte, et Vienne celle de l'Autriche, alliée forcée de Napoléon."
  },
  apres: {
    titre: "Septembre 1814 : tout est à refaire",
    texte: [
      "Louis XVIII, frère de Louis XVI, est roi de France. Le traité de Paris (30 mai 1814) ramène la France à ses frontières de 1792.",
      "Mais que faire de tout ce que Napoléon avait conquis ou créé ? Ces territoires sont hachurés sur ta carte : c'est au congrès de Vienne d'en décider."
    ]
  }
};

/* ---------- Personnages ----------
   look : peau, cheveux, coiffure (court, boucles, poudre, degarni), habit, decor (plaque, cordon, epaulettes, toison), cordon (couleur) */
const PERSONNAGES = [
  {
    id: "gentz", nom: "Friedrich von Gentz", role: "Secrétaire général du congrès", guide: true,
    look: { peau: "#EFC7A5", cheveux: "#8C877E", coiffure: "court", habit: "#3B3F4A", decor: null },
    intro: "Bienvenue à Vienne ! Je suis Friedrich von Gentz, conseiller du prince de Metternich et secrétaire général du congrès. Tu m'aideras : tu prépareras les décisions et tu tiendras le carnet des séances.",
    sujets: [
      ["Qui décide, au congrès ?", "Tous les États d'Europe ont envoyé des diplomates. Mais le congrès ne se réunit jamais en séance plénière : tout se décide entre les quatre grandes puissances victorieuses, l'Autriche, le Royaume-Uni, la Russie et la Prusse. La France vaincue cherche à s'inviter à leur table."],
      ["Pourquoi tous ces bals ?", "Les souverains restent des mois à Vienne : bals, concerts, chasses… On négocie dans les salons autant que dans les bureaux. Un vieux prince a eu ce mot : « Le congrès danse, mais il ne marche pas. »"],
      ["Que devons-nous décider ?", "Napoléon a bouleversé la carte de l'Europe. Il faut décider du sort des territoires qu'il avait conquis ou créés : le duché de Varsovie, la Saxe, la rive gauche du Rhin, la Belgique, l'Italie… Ils sont hachurés sur ta carte."]
    ],
    aurevoir: "Va rencontrer les cinq grands négociateurs. Note bien ce que chacun réclame : ton carnet en aura besoin."
  },
  {
    id: "metternich", nom: "Klemens von Metternich", role: "Ministre des Affaires étrangères d'Autriche", pays: "AUT",
    look: { peau: "#F1CDAE", cheveux: "#C9A46A", coiffure: "boucles", habit: "#2E3B54", decor: "toison" },
    intro: "Soyez le bienvenu. L'Europe sort de vingt-cinq ans de révolutions et de guerres. Notre devoir est simple : rétablir l'ordre, et le rendre durable.",
    sujets: [
      ["Quel est votre but ?", "L'équilibre. Aucune puissance ne doit pouvoir dominer les autres : ni la France hier, ni la Russie demain. Chaque agrandissement doit être compensé."],
      ["Que craignez-vous le plus ?", "La révolution. Elle a renversé les rois et jeté les peuples dans la guerre. Contre elle, les souverains doivent rester unis et conserver tout ce qui existe légalement. Relis mes paroles dans le document 1 de ta fiche.", "pologne"],
      ["Que veut l'Autriche ?", "Nous renonçons à la Belgique, trop lointaine. En échange, l'Autriche doit tenir l'Italie du Nord et présider une confédération des États allemands. Et je ne laisserai ni la Russie prendre toute la Pologne, ni la Prusse avaler la Saxe.", "italie"]
    ],
    aurevoir: "Excusez-moi : ce soir, il y a bal à la Hofburg."
  },
  {
    id: "castlereagh", nom: "Lord Castlereagh", role: "Ministre des Affaires étrangères du Royaume-Uni", pays: "GBR",
    look: { peau: "#F2CFB3", cheveux: "#4A3526", coiffure: "court", habit: "#1E2838", decor: "plaque" },
    intro: "Le Royaume-Uni ne demande pas de terres sur le continent. Il demande la paix, et un équilibre qui la garantisse.",
    sujets: [
      ["Comment empêcher la France de recommencer ?", "En l'entourant d'États solides : un grand royaume des Pays-Bas au nord, la Prusse sur le Rhin, le Piémont renforcé au sud-est. Une véritable barrière.", "belgique"],
      ["Que veut le Royaume-Uni pour lui-même ?", "Garder les îles et les ports conquis pendant la guerre : Malte, Héligoland, Le Cap, Ceylan… Nos navires dominent les mers : cela nous suffit."],
      ["Et la Russie ?", "Le tsar est notre allié, mais il est déjà très puissant. S'il prend toute la Pologne, ses armées camperont au cœur de l'Europe.", "pologne"],
      ["Autre chose ?", "Oui : nous voulons que le congrès condamne la traite des esclaves. Les puissances le déclareront le 8 février 1815."]
    ],
    aurevoir: "Au revoir. Et méfiez-vous : la police autrichienne ouvre tout notre courrier."
  },
  {
    id: "alexandre", nom: "Alexandre Ier", role: "Tsar de Russie", pays: "RUS",
    look: { peau: "#F0CBAA", cheveux: "#B8905E", coiffure: "degarni", habit: "#2E5A3E", decor: "epaulettes", cordon: "#3F6FB5" },
    intro: "Mes armées ont poursuivi Napoléon de Moscou jusqu'à Paris. La Russie a payé le prix le plus lourd : elle a droit à sa récompense.",
    sujets: [
      ["Que réclamez-vous ?", "La Pologne. Tout le duché de Varsovie, dont je ferai un royaume de Pologne uni à la Russie. J'en serai le roi, et je lui donnerai même une constitution.", "pologne"],
      ["Et la Prusse, votre alliée ?", "Le roi de Prusse m'a suivi dans la guerre. Je soutiens sa demande : qu'il reçoive toute la Saxe. Son roi est resté fidèle à Napoléon jusqu'au bout.", "saxe"],
      ["Comment voyez-vous l'avenir ?", "Les souverains doivent se conduire en frères chrétiens. Je rêve d'une sainte alliance des rois, fondée sur l'Évangile."]
    ],
    aurevoir: "Nous nous reverrons au bal. J'adore danser."
  },
  {
    id: "hardenberg", nom: "Karl August von Hardenberg", role: "Chancelier de Prusse", pays: "PRU",
    look: { peau: "#EBC3A3", cheveux: "#ECE8DE", coiffure: "court", habit: "#23334F", decor: "cordon", cordon: "#E0892B" },
    intro: "En 1807, Napoléon a pris la moitié de la Prusse. Nous avons tout reconquis les armes à la main. Justice doit nous être rendue.",
    sujets: [
      ["Que réclame la Prusse ?", "La Saxe, tout entière. Son roi a combattu aux côtés de Napoléon jusqu'à la bataille de Leipzig, en 1813 : il doit être puni. Et le tsar nous a promis son soutien.", "saxe"],
      ["Combien de territoires voulez-vous ?", "En 1813, les Alliés se sont engagés à nous rendre notre puissance d'avant 1806, soit environ dix millions d'habitants. Ici, une commission de statistique compte les « âmes » de chaque territoire."],
      ["Accepteriez-vous la Rhénanie ?", "Elle est loin de Berlin et collée à la France… Les Anglais veulent que nous montions la garde sur le Rhin. Nous préférons la Saxe, mais nous prendrons ce qu'on nous donnera.", "rhin"]
    ],
    aurevoir: "Parlez plus fort la prochaine fois : je suis un peu sourd."
  },
  {
    id: "talleyrand", nom: "Charles-Maurice de Talleyrand", role: "Ministre des Affaires étrangères de Louis XVIII", pays: "FRA",
    look: { peau: "#EFCBAE", cheveux: "#DCD5C6", coiffure: "poudre", habit: "#3A302E", decor: "plaque" },
    intro: "La France n'est plus l'ennemie : l'ennemi, c'était Napoléon. Louis XVIII, le roi légitime, a droit à sa place parmi les grandes puissances.",
    sujets: [
      ["Qu'est-ce que la légitimité ?", "Un principe simple : les trônes reviennent aux dynasties qui régnaient légalement avant la Révolution. Ainsi Louis XVIII en France… et le roi de Saxe dans son royaume.", "saxe"],
      ["Que veut la France ?", "Garder les frontières de 1792 que lui a laissées le traité de Paris. Et chasser Murat de Naples, pour rendre le trône aux Bourbons, cousins de mon roi.", "naples"],
      ["Qui défend la légitimité ?", "On nous appelle les légitimistes : pour nous, un roi légitime ne peut être ni chassé ni remplacé par un usurpateur. C'est le fondement de toute paix durable."],
      ["Comment vous faire entendre ?", "En divisant les vainqueurs. L'Autriche et le Royaume-Uni ne veulent pas que la Russie et la Prusse s'agrandissent trop… La France peut les y aider."]
    ],
    aurevoir: "Au revoir. Ici, un secret ne dure jamais plus d'une soirée."
  }
];

/* ---------- Qui veut quoi ? (tableau des exigences) ---------- */
const EXIGENCES = [
  { id: "e1", texte: "Tout le duché de Varsovie", perso: "alexandre" },
  { id: "e2", texte: "Une sainte alliance des souverains chrétiens", perso: "alexandre" },
  { id: "e3", texte: "Toute la Saxe", perso: "hardenberg" },
  { id: "e4", texte: "Retrouver sa puissance d'avant 1806", perso: "hardenberg" },
  { id: "e5", texte: "Une barrière d'États solides autour de la France", perso: "castlereagh" },
  { id: "e6", texte: "Garder Malte et les ports conquis", perso: "castlereagh" },
  { id: "e7", texte: "Dominer l'Italie du Nord", perso: "metternich" },
  { id: "e8", texte: "Présider une confédération des États allemands", perso: "metternich" },
  { id: "e9", texte: "Rendre Naples aux Bourbons", perso: "talleyrand" },
  { id: "e10", texte: "Être admis à la table des grandes puissances", perso: "talleyrand" }
];

/* ---------- Séances de négociation ---------- */
const SEANCES = [
  { id: "s1", titre: "Première séance", date: "Automne 1814", dossiers: ["pologne", "saxe"],
    texte: "La question qui divise le plus les Alliés : le sort de la Pologne et de la Saxe. La Russie et la Prusse se soutiennent ; l'Autriche et le Royaume-Uni s'inquiètent." },
  { id: "s2", titre: "Deuxième séance", date: "Hiver 1815", dossiers: ["rhin", "belgique", "italie", "naples", "allemagne"],
    texte: "Il faut maintenant fixer les frontières de l'Ouest et du Sud, et organiser l'Allemagne." },
  { id: "s3", titre: "Troisième séance", date: "Paris, novembre 1815", dossiers: ["france"],
    texte: "Napoléon est revenu, puis a été vaincu à Waterloo. Les Alliés se retrouvent à Paris pour décider du sort de la France." }
];

/* Chaque option : effets sur les jauges, et propriétaire de chaque partie du territoire (groupes de cellules de la carte).
   AUT Autriche, PRU Prusse, RUS Russie, POL royaume de Pologne (tsar), KRA Cracovie, SAX Saxe, BAV Bavière, GER autres États allemands,
   FRA France, NLD Pays-Bas, SAR Piémont-Sardaigne, SIC Bourbons de Naples, et États imaginés : POLi, BEL, VEN, GEN, ITN, NAPm, ALL. */
const DOSSIERS = {
  pologne: {
    court: "la Pologne",
    titre: "Le duché de Varsovie",
    situation: "Créé par Napoléon en 1807 avec des terres prises à la Prusse, agrandi en 1809 aux dépens de l'Autriche (la même année, la Russie a reçu la région de Tarnopol). L'armée russe l'occupe depuis 1813.",
    ames: "4,3 millions d'âmes",
    avis: [["alexandre", "Tout le duché, pour en faire un royaume uni à la Russie."], ["hardenberg", "Nous voulons récupérer nos anciennes provinces polonaises, dont Posen."], ["metternich", "La Russie ne doit pas avancer jusqu'au cœur de l'Europe."], ["peuple", "Des patriotes polonais : « Rendez-nous une Pologne libre ! »"]],
    options: [
      { id: "tsar", texte: "Tout au tsar : un royaume de Pologne uni à la Russie", effets: { eq: -20, leg: 0, sec: 0, ent: -20 },
        terres: { nord_ouest: "POL", sud_est: "POL", posnanie: "POL", cracovie: "POL", tarnopol: "RUS" },
        reaction: "Alexandre Ier jubile. Metternich et Castlereagh sont inquiets : les troupes russes camperaient à quelques jours de Berlin et de Vienne." },
      { id: "partage", texte: "Un nouveau partage entre la Prusse, l'Autriche et la Russie", effets: { eq: 5, leg: 5, sec: 0, ent: -15 },
        terres: { nord_ouest: "PRU", posnanie: "PRU", sud_est: "AUT", cracovie: "AUT", tarnopol: "AUT" },
        reaction: "La Prusse et l'Autriche approuvent. Le tsar refuse net : son armée occupe Varsovie, et il n'a pas l'intention d'en partir." },
      { id: "independance", texte: "Rétablir une Pologne indépendante", effets: { eq: 0, leg: -5, sec: 0, ent: -25 }, peuple: true,
        terres: { nord_ouest: "POLi", sud_est: "POLi", posnanie: "POLi", cracovie: "POLi", tarnopol: "AUT" },
        reaction: "Les patriotes polonais applaudissent… mais aucune des trois puissances qui se sont partagé la Pologne au XVIIIe siècle ne l'accepte." },
      { id: "compromis", texte: "Un royaume de Pologne au tsar, mais Posen à la Prusse et Cracovie ville libre", effets: { eq: 10, leg: 0, sec: 0, ent: 10 },
        terres: { nord_ouest: "POL", sud_est: "POL", posnanie: "PRU", cracovie: "KRA", tarnopol: "AUT" },
        reaction: "Chacun obtient une part. Le tsar devient roi de Pologne, mais il ne prend pas tout." }
    ],
    reel: "compromis",
    texteReel: "Le tsar devient roi d'un royaume de Pologne uni à la Russie, doté d'une constitution. La Prusse récupère la région de Posen, l'Autriche garde la Galicie et retrouve Tarnopol ; Cracovie devient une ville libre."
  },
  saxe: {
    court: "la Saxe",
    titre: "Le royaume de Saxe",
    situation: "Le roi de Saxe, Frédéric-Auguste Ier, est resté l'allié de Napoléon jusqu'à la défaite de Leipzig (octobre 1813). Il est prisonnier des Alliés.",
    ames: "2 millions d'âmes",
    avis: [["hardenberg", "Toute la Saxe : son roi a trahi, il doit être puni."], ["talleyrand", "On ne détrône pas un roi légitime. Rendez-lui son royaume."], ["metternich", "Une Prusse maîtresse de la Saxe menacerait la Bohême, aux portes de Vienne."]],
    options: [
      { id: "prusse", texte: "Toute la Saxe à la Prusse", effets: { eq: -15, leg: -15, sec: 0, ent: -20 },
        terres: { nord: "PRU", sud: "PRU" },
        reaction: "Hardenberg est satisfait. L'Autriche, la France et le Royaume-Uni protestent : un roi légitime perd son trône, et la Prusse devient trop forte." },
      { id: "roi", texte: "Rendre toute la Saxe à son roi", effets: { eq: -5, leg: 15, sec: 0, ent: -10 },
        terres: { nord: "SAX", sud: "SAX" },
        reaction: "Talleyrand approuve : c'est la légitimité. Mais la Prusse et la Russie sont furieuses : la Prusse n'est pas dédommagée." },
      { id: "partage", texte: "Partager : le nord à la Prusse, le reste au roi de Saxe", effets: { eq: 10, leg: 5, sec: 0, ent: 10 },
        terres: { nord: "PRU", sud: "SAX" },
        reaction: "Personne n'est enthousiaste, mais chacun peut l'accepter : le roi garde sa couronne, la Prusse s'agrandit." }
    ],
    reel: "partage",
    texteReel: "La Prusse reçoit le nord de la Saxe : environ 40 % des habitants et près de 60 % du territoire. Le roi garde Dresde et Leipzig."
  },
  rhin: {
    court: "la Rhénanie",
    titre: "La Rhénanie et la Westphalie",
    situation: "La rive gauche du Rhin (Cologne, Aix-la-Chapelle, Trèves, Mayence) est française depuis les années 1790. Plus à l'est, la Westphalie appartenait à des États créés par Napoléon.",
    ames: "1,6 million d'âmes sur la rive gauche",
    avis: [["castlereagh", "Il faut une puissance solide pour monter la garde face à la France."], ["hardenberg", "Nous préférons la Saxe… mais nous accepterons des terres sur le Rhin."], ["metternich", "L'Autriche ne veut plus de terres aussi lointaines."]],
    options: [
      { id: "prusse", texte: "Surtout à la Prusse (le Palatinat à la Bavière, Mayence à la Hesse)", effets: { eq: 5, leg: 0, sec: 15, ent: 5 },
        terres: { rive_gauche: "PRU", rive_droite: "PRU", palatinat: "BAV", hesse_rhenane: "GER" },
        reaction: "Castlereagh est satisfait : la Prusse devient la sentinelle du Rhin. Hardenberg accepte, même si ces terres sont loin de Berlin." },
      { id: "france", texte: "La laisser à la France", effets: { eq: -10, leg: -5, sec: -20, ent: -10 },
        terres: { rive_gauche: "FRA", palatinat: "FRA", hesse_rhenane: "FRA", rive_droite: "PRU" },
        reaction: "Talleyrand sourit. Les Alliés, eux, rappellent qu'ils viennent de faire vingt ans de guerre contre la France." },
      { id: "allemands", texte: "La partager entre des États allemands moyens (Bavière, Hesse…)", effets: { eq: 5, leg: 0, sec: 5, ent: 0 },
        terres: { rive_gauche: "GER", palatinat: "BAV", hesse_rhenane: "GER", rive_droite: "PRU" },
        reaction: "Ces petits États seraient-ils assez forts pour arrêter une armée française ? Castlereagh en doute." }
    ],
    reel: "prusse",
    texteReel: "La Prusse reçoit la Rhénanie et la Westphalie : elle monte désormais la garde sur le Rhin. La Bavière obtient le Palatinat et la Hesse la région de Mayence (1816)."
  },
  belgique: {
    court: "la Belgique",
    titre: "La Belgique",
    situation: "Possession autrichienne avant la Révolution, la Belgique est annexée par la France en 1795.",
    ames: "3,5 millions d'âmes",
    avis: [["castlereagh", "Unie à la Hollande, elle formerait un royaume solide au nord de la France."], ["metternich", "L'Autriche n'en veut plus : c'est trop loin de Vienne."], ["peuple", "Des Belges : « Nous sommes catholiques, les Hollandais protestants… »"]],
    options: [
      { id: "paysbas", texte: "L'unir aux Pays-Bas, sous le roi Guillaume d'Orange", effets: { eq: 5, leg: 0, sec: 15, ent: 5 },
        terres: { belgique: "NLD", luxembourg: "NLD" },
        reaction: "Castlereagh est ravi : un royaume solide garde la frontière nord de la France." },
      { id: "autriche", texte: "La rendre à l'Autriche", effets: { eq: 0, leg: 10, sec: 5, ent: -10 },
        terres: { belgique: "AUT", luxembourg: "AUT" },
        reaction: "C'est légitime… mais Metternich n'en veut pas : l'Autriche préfère des terres proches de Vienne." },
      { id: "france", texte: "La laisser à la France", effets: { eq: -10, leg: -5, sec: -20, ent: -10 },
        terres: { belgique: "FRA", luxembourg: "FRA" },
        reaction: "Castlereagh s'étrangle : Anvers, face à Londres, resterait un port français." },
      { id: "independante", texte: "En faire un État indépendant", effets: { eq: 0, leg: -5, sec: -5, ent: 0 }, peuple: true,
        terres: { belgique: "BEL", luxembourg: "BEL" },
        reaction: "Un petit État neuf, sans dynastie ni armée : saura-t-il résister à la France ?" }
    ],
    reel: "paysbas",
    texteReel: "La Belgique est unie aux Pays-Bas : le royaume du roi Guillaume Ier forme une barrière au nord de la France. Guillaume devient aussi grand-duc de Luxembourg."
  },
  italie: {
    court: "l'Italie du Nord",
    titre: "L'Italie du Nord",
    situation: "Napoléon avait créé un royaume d'Italie (Milan, Venise) et annexé Gênes et le Piémont à la France. Avant 1797, Venise et Gênes étaient des républiques indépendantes depuis des siècles.",
    ames: "plus de 4 millions d'âmes",
    avis: [["metternich", "L'Autriche doit tenir la plaine du Pô, de Milan à Venise."], ["castlereagh", "Donnez Gênes au roi de Piémont-Sardaigne : il gardera les Alpes face à la France."], ["peuple", "L'envoyé de Gênes : « Rendez-nous notre république ! »"]],
    options: [
      { id: "republiques", texte: "Rétablir les républiques de Venise et de Gênes ; la Lombardie à l'Autriche", effets: { eq: 0, leg: 5, sec: -10, ent: -10 }, peuple: true,
        terres: { lombardie: "AUT", venetie: "VEN", genes: "GEN" },
        reaction: "Les Génois et les Vénitiens se réjouissent. Metternich et Castlereagh, eux, n'aiment pas les républiques." },
      { id: "autriche", texte: "Lombardie et Vénétie à l'Autriche, Gênes au Piémont-Sardaigne", effets: { eq: 5, leg: 0, sec: 10, ent: 5 },
        terres: { lombardie: "AUT", venetie: "AUT", genes: "SAR" },
        reaction: "L'Autriche domine l'Italie du Nord ; le Piémont, renforcé, garde les Alpes. Les Génois protestent en vain." },
      { id: "royaume", texte: "Garder un royaume d'Italie du Nord", effets: { eq: -5, leg: -15, sec: -10, ent: -10 }, peuple: true,
        terres: { lombardie: "ITN", venetie: "ITN", genes: "SAR" },
        reaction: "Un royaume créé par Napoléon ? Pour les vainqueurs, c'est impensable." }
    ],
    reel: "autriche",
    texteReel: "L'Autriche forme un royaume lombard-vénitien. Gênes est donnée au roi de Piémont-Sardaigne malgré les protestations des Génois. Ni Venise ni Gênes ne redeviennent des républiques : la légitimité vaut pour les rois, pas pour les républiques."
  },
  naples: {
    court: "Naples",
    titre: "Le royaume de Naples",
    situation: "Joachim Murat, maréchal et beau-frère de Napoléon, règne à Naples depuis 1808. En janvier 1814, il a rejoint les Alliés pour garder son trône. Le roi Bourbon, Ferdinand IV, s'est réfugié en Sicile.",
    ames: "5 millions d'âmes",
    avis: [["talleyrand", "Murat est un usurpateur : rendez Naples à Ferdinand, le roi légitime."], ["metternich", "L'Autriche a promis à Murat de lui laisser son trône… pour l'instant."]],
    options: [
      { id: "murat", texte: "Laisser Murat sur le trône de Naples", effets: { eq: 0, leg: -15, sec: 0, ent: 5 },
        terres: { naples: "NAPm" },
        reaction: "Metternich tient sa promesse. Talleyrand enrage : un maréchal de Napoléon garde une couronne." },
      { id: "bourbons", texte: "Rendre Naples au roi Bourbon Ferdinand IV", effets: { eq: 0, leg: 15, sec: 0, ent: -5 },
        terres: { naples: "SIC" },
        reaction: "Talleyrand triomphe : c'est la légitimité. Metternich est gêné : il avait donné sa parole à Murat." }
    ],
    reel: "bourbons",
    texteReel: "Pendant les Cent-Jours, Murat se range aux côtés de Napoléon. Battu par les Autrichiens à Tolentino (mai 1815), il perd son trône : Ferdinand IV retrouve Naples, et forme en 1816 le royaume des Deux-Siciles."
  },
  allemagne: {
    court: "l'Allemagne",
    titre: "L'organisation de l'Allemagne",
    situation: "Le Saint-Empire romain germanique a disparu en 1806. Napoléon avait réuni beaucoup d'États allemands dans la Confédération du Rhin. Il reste une quarantaine d'États, du royaume de Bavière à la ville libre de Hambourg.",
    ames: "30 millions d'âmes",
    avis: [["metternich", "Une confédération souple, présidée par l'Autriche, où chaque prince garde son trône."], ["hardenberg", "La Prusse veut peser autant que l'Autriche en Allemagne."], ["peuple", "Des patriotes allemands : « Une seule nation, un seul État ! »"]],
    options: [
      { id: "empire", texte: "Rétablir le Saint-Empire romain germanique", effets: { eq: -5, leg: 10, sec: 5, ent: -10 },
        reaction: "Les rois de Bavière et de Wurtemberg refusent de redevenir les vassaux d'un empereur." },
      { id: "confed", texte: "Une Confédération germanique de 39 États, présidée par l'Autriche", effets: { eq: 10, leg: 5, sec: 10, ent: 10 },
        reaction: "Chaque prince garde son trône ; l'Autriche préside, la Prusse participe. Les patriotes allemands sont déçus." },
      { id: "unifiee", texte: "Unifier l'Allemagne en un seul État", effets: { eq: -20, leg: -15, sec: 5, ent: -25 }, peuple: true, unifier: true,
        reaction: "Les rois de Bavière, de Saxe et de Wurtemberg refusent de perdre leur couronne. L'Autriche et la Prusse redoutent ce nouveau géant." }
    ],
    reel: "confed",
    texteReel: "L'Acte fédéral (8 juin 1815) crée la Confédération germanique : 39 États souverains, dont l'Autriche et la Prusse, réunis dans une Diète à Francfort présidée par l'Autriche. Il n'y a pas d'unité allemande."
  },
  france: {
    court: "la France",
    titre: "Que faire de la France ?",
    situation: "Après les Cent-Jours et Waterloo, les Alliés occupent Paris. Louis XVIII est revenu sur le trône en juillet 1815.",
    ames: "29 millions d'âmes",
    avis: [["hardenberg", "La France doit payer : prenons-lui l'Alsace et la Lorraine !"], ["alexandre", "Ne l'humilions pas : Louis XVIII doit pouvoir régner."], ["castlereagh", "Une France trop affaiblie romprait l'équilibre."]],
    options: [
      { id: "demembrer", texte: "La démembrer : l'Alsace et la Lorraine aux États allemands", effets: { eq: -10, leg: -5, sec: 10, ent: -10 },
        terres: { alsace: "GER", lorraine: "GER", sarre: "PRU", savoie: "SAR" },
        reaction: "Les Prussiens applaudissent. Le tsar et Castlereagh s'y opposent : une France humiliée voudra sa revanche." },
      { id: "traite", texte: "Les frontières de 1790, une lourde indemnité et une occupation militaire", effets: { eq: 5, leg: 5, sec: 10, ent: 10 },
        terres: { alsace: "FRA", lorraine: "FRA", sarre: "PRU", savoie: "SAR" },
        reaction: "La France est punie, sans être détruite : Louis XVIII garde un royaume solide." },
      { id: "clemence", texte: "Aucune sanction : Louis XVIII n'y est pour rien", effets: { eq: 0, leg: 5, sec: -10, ent: -10 },
        terres: { alsace: "FRA", lorraine: "FRA", sarre: "FRA", savoie: "FRA" },
        reaction: "Les Prussiens, qui ont perdu tant d'hommes à Waterloo, crient au scandale." }
    ],
    reel: "traite",
    texteReel: "Le second traité de Paris (20 novembre 1815) ramène la France à peu près à ses frontières de 1790 : elle perd notamment la Savoie, Sarrebruck et Landau. Elle doit payer 700 millions de francs et subir une occupation militaire jusqu'en 1818."
  }
};
/* Avant la troisième séance, ces territoires sont français (traité de Paris de 1814) */
const TERRES_1814 = { france: { alsace: "FRA", lorraine: "FRA", sarre: "FRA", savoie: "FRA" } };

/* ---------- Événements ---------- */
const EVENEMENTS = {
  crise: {
    date: "Janvier 1815",
    titre: "Au bord de la guerre",
    texteRupture: "Tes propositions ont dressé les Alliés les uns contre les autres. Le 3 janvier 1815, l'Autriche, le Royaume-Uni et la France signent un traité secret contre la Russie et la Prusse. On parle de mobiliser les armées !",
    texteCalme: "Dans la réalité, la question de la Pologne et de la Saxe a failli déclencher une guerre entre les Alliés : le 3 janvier 1815, l'Autriche, le Royaume-Uni et la France ont signé un traité secret contre la Russie et la Prusse.",
    suiteRupture: "Pour éviter la guerre, les diplomates adoptent en février 1815 un compromis : un royaume de Pologne au tsar, Posen à la Prusse, Cracovie ville libre, et le nord de la Saxe à la Prusse. Ta carte est corrigée.",
    suiteCalme: "Finalement, un compromis est trouvé en février 1815 : un royaume de Pologne au tsar, Posen à la Prusse, Cracovie ville libre, et le nord de la Saxe à la Prusse.",
    aRetenir: "L'équilibre se construit par des compensations : chaque puissance doit obtenir une part, sans qu'aucune ne domine. Et Talleyrand a réussi son pari : la France vaincue est entrée dans le jeu des grandes puissances.",
    villes: ["vienne"]
  },
  centjours: {
    date: "Mars-juin 1815",
    titre: "Les Cent-Jours",
    etapes: [
      ["1er mars 1815", "Napoléon s'échappe de l'île d'Elbe et débarque à Golfe-Juan. Louis XVIII s'enfuit ; Napoléon reprend le pouvoir à Paris.", "golfejuan"],
      ["13 mars 1815", "Les puissances réunies à Vienne déclarent Napoléon « hors la loi » et reforment leur coalition.", "vienne3"],
      ["Mars-mai 1815", "Murat, roi de Naples, prend le parti de Napoléon et attaque l'Autriche. Battu à Tolentino (2-3 mai), il perd son trône.", "tolentino"],
      ["9 juin 1815", "Les diplomates signent l'Acte final du congrès de Vienne.", "vienne3"],
      ["18 juin 1815", "Napoléon est définitivement vaincu à Waterloo. Il est exilé à Sainte-Hélène, au milieu de l'Atlantique.", "waterloo"]
    ],
    murat: "Murat a trahi les Alliés : ton choix est annulé. Ferdinand IV retrouve le trône de Naples.",
    aRetenir: "Le retour de Napoléon ressoude les Alliés. Le 9 juin 1815, l'Acte final du congrès fixe la nouvelle carte de l'Europe, neuf jours avant Waterloo."
  }
};

/* ---------- Bilan ---------- */
const BILAN = {
  titre: "Ta paix et la paix de Vienne",
  peuples: "Tu l'as peut-être remarqué : il n'y avait pas de jauge pour les peuples. Au congrès, les territoires sont comptés en « âmes », mais personne ne demande leur avis aux Polonais, aux Belges, aux Italiens ou aux Allemands. Retiens-le : c'est la grande faiblesse de l'ordre de 1815.",
  question: {
    q: "Qu'est-ce qui a surtout guidé les diplomates de Vienne ?",
    choix: ["Le désir des peuples de former une nation", "L'équilibre entre les puissances et la légitimité des rois", "La volonté de punir durement la France", "Le principe républicain"],
    bonne: 1,
    exp: "Les vainqueurs cherchent l'équilibre (aucune puissance ne domine, chacune reçoit des compensations) et la légitimité (les dynasties d'avant la Révolution retrouvent leur trône). Les aspirations des peuples ne comptent pas."
  }
};

/* ---------- Après le congrès : deux alliances ---------- */
const ALLIANCES = {
  titre: "Après le congrès : deux alliances pour garder l'ordre",
  docs: [
    { id: "sainte", titre: "La Sainte-Alliance", date: "26 septembre 1815", signataires: "Autriche, Prusse, Russie (le Royaume-Uni refuse d'y entrer)",
      extrait: "« Art. 1. Conformément aux paroles des Saintes Écritures qui ordonnent à tous les hommes de se regarder comme frères, les trois monarques contractants demeureront unis par les liens d'une fraternité véritable et indissoluble […]. »",
      source: "Doc. 2 de ta fiche" },
    { id: "quadruple", titre: "La Quadruple-Alliance", date: "20 novembre 1815", signataires: "Autriche, Prusse, Russie, Royaume-Uni (la France y entre en 1818)",
      extrait: "« Art. 6. […] les Hautes Parties contractantes sont convenues de renouveler, à des époques déterminées, […] des réunions consacrées aux grands intérêts communs et à l'examen des mesures […] les plus salutaires pour le repos et la prospérité des peuples et pour le maintien de la paix de l'Europe. »",
      source: "Traité du 20 novembre 1815" }
  ],
  affirmations: [
    { id: "a1", texte: "Elle unit les souverains au nom de la religion chrétienne.", rep: ["sainte"] },
    { id: "a2", texte: "Le Royaume-Uni en fait partie.", rep: ["quadruple"] },
    { id: "a3", texte: "Elle prévoit des réunions régulières des puissances : les congrès.", rep: ["quadruple"] },
    { id: "a4", texte: "Elle cherche à maintenir l'ordre de 1815.", rep: ["deux"] },
    { id: "a5", texte: "Elle ne prévoit aucun moyen concret d'agir.", rep: ["sainte"] },
    { id: "a6", texte: "Elle organise le concert européen : les grandes puissances règlent ensemble les affaires de l'Europe.", rep: ["quadruple"] }
  ],
  aRetenir: "Attention à ne pas confondre : la Sainte-Alliance est une déclaration de principes, sans moyens d'agir. C'est la Quadruple-Alliance et ses congrès (Aix-la-Chapelle 1818, Troppau 1820, Laibach 1821, Vérone 1822) qui organisent les interventions armées contre les révolutions."
};

/* ---------- Le tableau de la fiche (page 2) ---------- */
const TABLEAU = {
  titre: "Ce que décide le congrès de Vienne",
  consigne: "Complète le tableau de ta fiche : clique sur une étiquette, puis sur la ligne où elle doit aller.",
  lignes: [
    { id: "l1", titre: "Des frontières redessinées", indices: "France, Pologne, Belgique, États italiens et allemands" },
    { id: "l2", titre: "De nouvelles règles diplomatiques", indices: "Congrès, alliances, équilibre entre les puissances" },
    { id: "l3", titre: "La légitimité monarchique et dynastique", indices: "Qui revient au pouvoir, et au nom de quoi" },
    { id: "l4", titre: "Un ordre européen fondé sur la religion chrétienne", indices: "Doc. 2, Sainte-Alliance" }
  ],
  etiquettes: [
    { id: "t1", texte: "La France revient à ses frontières de 1790.", ligne: "l1" },
    { id: "t2", texte: "Le tsar devient roi d'un royaume de Pologne.", ligne: "l1" },
    { id: "t3", texte: "La Prusse s'étend jusqu'au Rhin et prend le nord de la Saxe.", ligne: "l1" },
    { id: "t4", texte: "La Belgique est unie aux Pays-Bas.", ligne: "l1" },
    { id: "t5", texte: "L'Autriche domine l'Italie du Nord.", ligne: "l1" },
    { id: "t6", texte: "Les grandes puissances décident entre elles, sans consulter les peuples.", ligne: "l2" },
    { id: "t7", texte: "Les territoires sont répartis pour qu'aucune puissance ne domine.", ligne: "l2" },
    { id: "t8", texte: "Les vainqueurs s'engagent à se réunir en congrès (Quadruple-Alliance).", ligne: "l2" },
    { id: "t9", texte: "Louis XVIII, un Bourbon, règne en France.", ligne: "l3" },
    { id: "t10", texte: "Ferdinand IV, un Bourbon, retrouve Naples.", ligne: "l3" },
    { id: "t11", texte: "Le roi de Saxe garde son trône, le pape retrouve ses États.", ligne: "l3" },
    { id: "t12", texte: "Les souverains d'Autriche, de Prusse et de Russie s'unissent au nom de l'Évangile.", ligne: "l4" },
    { id: "t13", texte: "Les rois se disent « délégués par la Providence ».", ligne: "l4" }
  ]
};

/* ---------- L'ordre de 1815 à l'épreuve (1815-1848) ----------
   rep : réponses acceptées parmi defense (défend l'ordre), liberale, nationale (contestations) */
const CHOIX_CHRONIQUE = [["defense", "Défend l'ordre de 1815"], ["liberale", "Contestation libérale"], ["nationale", "Contestation nationale"]];
const CHRONIQUE = [
  { date: "1818", titre: "Le congrès d'Aix-la-Chapelle", villes: ["aix"], rep: ["defense"],
    texte: "Les Alliés retirent leurs troupes de France. Louis XVIII rejoint les quatre grandes puissances : elles se réuniront désormais à cinq pour veiller sur la paix : c'est le concert européen.",
    exp: "Le système des congrès fonctionne : les puissances se concertent pour maintenir l'ordre de 1815." },
  { date: "1819", titre: "Les décrets de Carlsbad", villes: ["carlsbad"], rep: ["defense"],
    texte: "Un étudiant nationaliste assassine l'écrivain Kotzebue, accusé d'espionner pour le tsar. Metternich fait adopter dans toute la Confédération germanique la censure de la presse et la surveillance des universités.",
    exp: "Metternich réprime les idées libérales et nationales qui circulent parmi les étudiants allemands." },
  { date: "1820", titre: "Révolutions en Espagne et à Naples", villes: ["cadix", "naples3"], rep: ["liberale"],
    texte: "Des officiers, souvent membres de sociétés secrètes (les carbonari en Italie), se soulèvent et obligent les rois d'Espagne et de Naples à accorder une constitution qui limite leur pouvoir.",
    exp: "Contestation libérale : les révolutionnaires réclament une constitution et des libertés. Comme la presse est censurée, ils s'organisent en sociétés secrètes." },
  { date: "1821", titre: "Le congrès de Laibach", villes: ["laibach", "naples3", "turin3"], rep: ["defense"],
    texte: "Réunies en congrès, les puissances chargent l'armée autrichienne d'écraser les révolutions de Naples et du Piémont (mars-avril 1821).",
    exp: "Les congrès servent à organiser des interventions armées contre les révolutions." },
  { date: "1822", titre: "Le massacre de Chios", villes: ["chios"], rep: ["nationale"], ppo: "Le massacre de Chios",
    texte: "Depuis 1821, les Grecs se soulèvent contre l'Empire ottoman pour obtenir leur indépendance. En avril 1822, les troupes ottomanes massacrent ou réduisent en esclavage des milliers d'habitants de l'île de Chios. L'émotion est immense en Europe.",
    exp: "Contestation nationale : les Grecs veulent un État indépendant. Metternich y voit une révolte contre un souverain légitime, le sultan." },
  { date: "1823", titre: "L'expédition d'Espagne", villes: ["cadix", "madrid3"], rep: ["defense"],
    texte: "Mandatée par le congrès de Vérone (1822), l'armée française entre en Espagne et rétablit le roi Ferdinand VII dans son pouvoir absolu (prise du fort du Trocadéro, à Cadix).",
    exp: "La France de Louis XVIII, réintégrée dans le concert européen, défend à son tour l'ordre de 1815." },
  { date: "1827-1830", titre: "L'indépendance de la Grèce", villes: ["navarin"], rep: ["nationale"],
    texte: "À Navarin (1827), les flottes britannique, française et russe détruisent la flotte ottomane. En 1830, la Grèce devient indépendante.",
    exp: "Une contestation nationale réussit, et pour la première fois des grandes puissances soutiennent un peuple révolté : l'ordre de Metternich se fissure." },
  { date: "Juillet 1830", titre: "Les Trois Glorieuses", villes: ["paris3"], rep: ["liberale"], ppo: "Les Trois Glorieuses",
    texte: "À Paris, trois journées de barricades renversent Charles X, qui voulait supprimer la liberté de la presse. Louis-Philippe devient « roi des Français ».",
    exp: "Contestation libérale : les Parisiens défendent les libertés garanties par la Charte." },
  { date: "Août 1830", titre: "La révolution belge", villes: ["bruxelles3"], rep: ["nationale", "liberale"],
    texte: "Les Belges se soulèvent contre le roi des Pays-Bas. Les grandes puissances reconnaissent leur indépendance (1831) : un morceau de l'œuvre du congrès de Vienne se défait.",
    exp: "Les deux à la fois : les Belges veulent leur propre État et se donnent une constitution très libérale (1831)." },
  { date: "1830-1831", titre: "L'insurrection polonaise", villes: ["varsovie3"], rep: ["nationale"],
    texte: "Les Polonais se révoltent contre le tsar Nicolas Ier. L'armée russe reprend Varsovie en septembre 1831 ; le tsar supprime ensuite la constitution du royaume.",
    exp: "Contestation nationale, écrasée : le royaume de Pologne perd son autonomie." },
  { date: "1846", titre: "La fin de la ville libre de Cracovie", villes: ["cracovie3"], rep: ["defense"],
    texte: "Après un soulèvement polonais, l'Autriche annexe la ville libre de Cracovie, avec l'accord de la Prusse et de la Russie.",
    exp: "Les trois puissances conservatrices s'entendent pour étouffer le mouvement national polonais." },
  { date: "1848", titre: "Le printemps des peuples", villes: ["paris3", "vienne3", "berlin3", "milan3", "venise3", "budapest", "prague3"], rep: ["liberale", "nationale"],
    texte: "Révolutions à Paris, Vienne, Berlin, Milan, Venise, Pest, Prague… Le 13 mars 1848, Metternich doit démissionner et s'enfuir de Vienne.",
    exp: "Les deux à la fois : les peuples réclament des libertés et le droit de former une nation. L'ordre de Metternich s'effondre." }
];

/* ---------- Réponse finale ---------- */
const REDACTION = {
  consigne: "Écris le brouillon de ta conclusion en quelques lignes. Appuie-toi sur ton plan : des dates, des acteurs, des lieux.",
  aide: ["équilibre", "légitimité", "légitimisme", "concert européen", "congrès", "Sainte-Alliance", "Quadruple-Alliance", "libéralisme", "nation", "1830", "1848", "Metternich"],
  plan: [
    { titre: "Les organisateurs", sous: "Le congrès de Vienne (1814-1815)" },
    { titre: "Les défenseurs", sous: "Alliances, congrès, interventions" },
    { titre: "Les contestations", sous: "Libérales et nationales" }
  ]
};

const VOCABULAIRE = [
  ["Congrès", "réunion des représentants des États pour régler ensemble les affaires européennes."],
  ["Légitimité", "principe selon lequel seules les dynasties régnant avant 1789 ont le droit de gouverner."],
  ["Équilibre européen", "répartition des territoires organisée pour qu'aucune puissance ne domine les autres."],
  ["Sainte-Alliance", "traité du 26 septembre 1815 unissant l'Autriche, la Prusse et la Russie au nom du christianisme."],
  ["Légitimisme", "doctrine des partisans de la légitimité : défendre les dynasties « légitimes » contre les révolutions et les usurpateurs."],
  ["Concert européen", "entente des grandes puissances, qui se réunissent en congrès pour régler ensemble les affaires de l'Europe et y maintenir l'ordre."],
  ["Société secrète", "organisation clandestine d'opposants (carbonari, sociétés d'étudiants…) qui agit en secret parce que la presse et les réunions sont surveillées."],
  ["Censure", "contrôle des journaux et des livres par le pouvoir avant ou après leur publication."]
];
