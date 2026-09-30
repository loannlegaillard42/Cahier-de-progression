/* Vézelay, 31 mars 1146 — contenu du jeu (PPO Bernard de Clairvaux, 2de, Thème 1, chapitre 2)
   Tous les textes affichés aux élèves sont ici : tu peux les modifier sans toucher au moteur (jeu.js, scene3d.js).
   Références « Doc. » = documents de la fiche élève « Croisades et djihad — PPO Bernard de Clairvaux ». */

const JEU = {
  titre: "Vézelay, 31 mars 1146",
  sousTitre: "Un moine prêche la croisade",
  niveau: "2de · Thème 1, chapitre 2 · PPO Bernard de Clairvaux",
  questionDepart: "Comment un moine, sans armée ni royaume, devient-il l'un des principaux acteurs politiques de l'Occident ?"
};

const INTRO = [
  "Vézelay, en Bourgogne, le 31 mars 1146, jour de Pâques. Tu es un jeune pèlerin venu prier les reliques de sainte Marie-Madeleine.",
  "Aujourd'hui, une foule immense se rassemble sur la colline : le roi Louis VII a convoqué ses barons, et l'abbé Bernard de Clairvaux doit parler.",
  "Ta mission : parcourir la colline, interroger ceux que tu rencontres, assister au sermon, puis suivre la croisade qui en sort. Réponds aux questions de ton carnet de bord : c'est lui que tu rendras à la fin."
];

const REGLES = [
  ["Les habitants", "À chaque étape, parle aux personnages : leurs réponses t'aident à remplir ton carnet de bord."],
  ["Avancer", "Réponds aux questions de l'étape, puis clique sur « Étape suivante »."],
  ["Regarder", "Glisse sur l'image pour regarder autour de toi. Clique sur un personnage pour lui parler."],
  ["Se promener", "Le bouton « Se promener librement » permet de marcher sur la colline avec Z Q S D ou les flèches."],
  ["Les objets", "Les objets qui brillent se cliquent : examine-les pour comprendre le cours et la société de l'époque."],
  ["Le son", "Le bouton « Son » en haut de l'écran fait entendre le vent, les oiseaux, la foule et les cloches. Il est coupé au départ : pense aux écouteurs en classe."]
];

/* ---------- Étapes ----------
   vue : "3d" (point de vue sur la colline, défini dans scene3d.js) ou "carte" (carte de la croisade).
   persos : personnages à rencontrer ; questions : questions du carnet (après la rencontre). */
const ETAPES = [
  { id: "route", date: "31 mars 1146", titre: "Sur la route de Vézelay", vue: "3d", point: "route",
    texte: ["Au sommet de la colline se dresse l'abbaye de la Madeleine. Depuis le matin, des milliers de personnes montent vers Vézelay."],
    persos: ["aubert"], notion: ["Pèlerinage", "voyage vers un lieu saint pour y prier et obtenir le pardon de ses péchés."], questions: [] },
  { id: "basilique", date: "31 mars 1146", titre: "La basilique de la Madeleine", vue: "3d", point: "basilique",
    texte: ["La grande église de l'abbaye vient d'être reconstruite après un incendie. Elle attire des pèlerins de toute l'Europe."],
    persos: ["renaud"], notion: ["Reliques", "restes du corps d'un saint, ou objets lui ayant appartenu, que les fidèles viennent prier."], questions: ["q_lieu"] },
  { id: "bourg", date: "31 mars 1146", titre: "Un moine de Clairvaux", vue: "3d", point: "bourg",
    texte: ["Au bord du bourg, on découvre le champ où la foule se rassemble autour d'une grande estrade de bois."],
    citation: { texte: "Entré à Cîteaux en 1112, fondateur de l'abbaye de Clairvaux en 1115, Bernard conseille les papes et les rois sans exercer lui-même aucun pouvoir politique.", source: "Ta fiche, PPO Bernard de Clairvaux" },
    persos: ["etienne"], notion: ["Abbé", "moine élu à la tête d'une abbaye. Bernard est l'abbé de Clairvaux."], questions: ["q_pouvoir"] },
  { id: "champ", date: "31 mars 1146", titre: "Chevaliers du Christ", vue: "3d", point: "champ",
    texte: ["Les chevaliers sont venus avec leurs chevaux et leurs tentes. Beaucoup hésitent encore : partir coûte cher et le voyage est long."],
    citation: { texte: "C'est en toute sécurité que les chevaliers du Christ combattent pour leur Seigneur, sans avoir à craindre de pécher en tuant leurs adversaires, ni de périr, s'ils se font tuer eux-mêmes. Que la mort soit subie, qu'elle soit donnée, c'est toujours une mort pour le Christ : elle n'a rien de criminel. […] Pourtant, il ne convient pas de tuer les païens si l'on peut trouver un autre moyen.", source: "Bernard de Clairvaux, Éloge de la nouvelle chevalerie, vers 1128-1136 (Doc. 4)" },
    persos: ["hugues"], notion: ["Indulgence", "remise des peines dues pour les péchés, promise à ceux qui partent en croisade."], questions: ["q_tuer", "q_indulgence"] },
  { id: "estrade", date: "31 mars 1146", titre: "Le roi et la reine", vue: "3d", point: "estrade",
    texte: ["Sur l'estrade se tiennent le roi Louis VII et la reine Aliénor. Le roi porte déjà une croix envoyée par le pape."],
    persos: ["louis", "alienor"], notion: ["Croisade", "expédition militaire décidée par la papauté, présentée comme un pèlerinage armé vers Jérusalem."], questions: ["q_decide"] },
  { id: "sermon", date: "31 mars 1146", titre: "Le sermon de Bernard", vue: "3d", point: "foule", sermon: true,
    texte: ["Bernard monte sur l'estrade. Il est maigre, épuisé par les jeûnes, vêtu de la robe blanche des moines de Cîteaux. La foule se tait."],
    citation: { texte: "Et lorsque cet orateur du Ciel eut répandu la rosée de la parole divine, de toutes parts, tous firent entendre leurs acclamations, demandant des croix, des croix ! Et après que l'abbé eut semé, plus encore que distribué, un faisceau de croix qu'il avait fait préparer à l'avance, il fut forcé de couper ses propres vêtements pour en faire d'autres croix.", source: "Odon de Deuil, moine de Saint-Denis et chapelain du roi, vers 1148 (Doc. 5)" },
    persos: ["odon"], notion: ["Prendre la croix", "faire le vœu de partir en croisade ; on coud alors une croix de tissu sur son vêtement."], questions: ["q_effet", "q_source"] },
  { id: "rhenanie", date: "1146-1147", titre: "Bernard parcourt l'Europe", vue: "carte",
    carte: { routes: ["bernard"], lieux: ["clairvaux", "vezelay", "mayence", "spire", "paris", "rome"], vue: "europe" },
    texte: ["Après Vézelay, Bernard prêche la croisade en Flandre et en Rhénanie. Il parle en français à des foules allemandes qui ne le comprennent pas… et qui prennent pourtant la croix.",
      "À Noël 1146, à Spire, il convainc Conrad III, roi de Germanie, de partir lui aussi. Deux rois partiront donc en croisade."],
    persos: ["ephraim"], notion: ["Saint-Empire", "l'empire germanique. En 1146, il est dirigé par Conrad III, roi de Germanie."], questions: ["q_juifs"] },
  { id: "croisade", date: "1147-1148", titre: "La croisade en marche", vue: "carte",
    sousEtapes: [
      { titre: "Été 1147 : deux armées en route", texte: "Conrad III part de Ratisbonne en mai, Louis VII de Saint-Denis en juin. Tous deux traversent la Hongrie et les Balkans jusqu'à Constantinople.",
        carte: { routes: ["conrad1", "louis1"], lieux: ["paris", "metz", "ratisbonne", "constantinople", "edesse"], vue: "balkans" } },
      { titre: "Octobre 1147 : Conrad III battu à Dorylée", texte: "En Asie Mineure, les Turcs harcèlent l'armée allemande et l'écrasent près de Dorylée. Conrad se replie vers Nicée.",
        carte: { routes: ["conrad2"], deja: ["conrad1", "louis1"], lieux: ["constantinople", "nicee", "dorylee", "edesse"], vue: "anatolie" } },
      { titre: "Janvier 1148 : Louis VII battu au mont Cadmos", texte: "L'armée française longe la côte, puis se fait massacrer au mont Cadmos. Le roi en réchappe. Avec ses barons, il gagne Antioche par la mer.",
        carte: { routes: ["louis2", "louisMer"], deja: ["conrad1", "louis1", "conrad2"], lieux: ["constantinople", "nicee", "dorylee", "ephese", "cadmos", "attalia", "antioche", "edesse"], vue: "orient" } },
      { titre: "Juillet 1148 : l'échec devant Damas", texte: "Réunis à Acre, les rois décident d'attaquer Damas, pourtant alliée de Jérusalem. Le siège ne dure que quatre jours : il faut se retirer. Édesse ne sera jamais reprise.",
        carte: { routes: ["louisLevant", "conradRetour", "damas"], deja: ["conrad1", "louis1", "conrad2", "louis2", "louisMer"], lieux: ["constantinople", "dorylee", "cadmos", "attalia", "antioche", "acre", "jerusalem", "damas", "edesse"], vue: "levant" } },
      { titre: "Octobre 1147 : le seul succès, à Lisbonne", texte: "Des croisés anglais, flamands et allemands, partis par mer, aident le roi du Portugal à prendre Lisbonne aux musulmans. La même année, d'autres croisés combattent les Slaves païens au bord de la Baltique.",
        carte: { routes: ["lisbonne"], deja: ["conrad1", "louis1", "conrad2", "louis2", "louisMer", "louisLevant", "conradRetour", "damas"], lieux: ["lisbonne", "dartmouth", "paris", "constantinople", "dorylee", "cadmos", "damas", "edesse", "jerusalem"], vue: "tout" } }
    ],
    texte: [],
    persos: ["odon2"], notion: ["États latins d'Orient", "principautés fondées par les croisés après 1099 : Jérusalem, Antioche, Tripoli et Édesse, perdue en 1144."], questions: ["q_defaites", "q_succes"] },
  { id: "echec", date: "1149-1150", titre: "1148 : l'échec", vue: "carte",
    carte: { routes: [], deja: ["bernard", "conrad1", "louis1", "conrad2", "louis2", "louisMer", "louisLevant", "conradRetour", "damas", "lisbonne"], lieux: ["clairvaux", "vezelay", "paris", "spire", "constantinople", "dorylee", "cadmos", "antioche", "acre", "jerusalem", "damas", "edesse", "lisbonne"], vue: "tout" },
    texte: ["Louis VII rentre en France en 1149. Beaucoup accusent Bernard d'avoir envoyé des milliers d'hommes à la mort. Il écrit au pape Eugène III, son ancien disciple."],
    citation: { texte: "Nous avons vu le Seigneur, provoqué par nos infidélités, nous traiter comme si, avant les temps marqués, il eût déjà jugé la terre […]. Les enfants de l'Église […] ont succombé au milieu des déserts, moissonnés par le glaive ou consumés par la famine. […] Je n'ai fait qu'obéir à vos ordres, ou plutôt aux ordres de Dieu même qui me parlait par votre bouche.", source: "Bernard de Clairvaux, De la considération, vers 1149-1152 (Doc. 6)" },
    persos: ["etienne2"], notion: null, questions: ["q_echec", "q_refus"] }
];

/* ---------- Personnages ----------
   look : peau, habit, col, coiffe (couronne, voile, capuche, tonsure, casque, bonnet, chaperon), coiffeCol, cheveux, barbe. */
const PERSONNAGES = [
  { id: "aubert", nom: "Aubert", role: "Vigneron de la vallée de la Cure",
    look: { peau: "#D4A47C", habit: "#7A5A3A", col: "#5A4030", coiffe: "chaperon", coiffeCol: "#8A6A40", cheveux: "#4A3424", barbe: "#4A3424" },
    intro: "Bonnes Pâques, l'ami ! Je m'appelle Aubert, je cultive la vigne dans la vallée. Tu as vu cette foule ? Je n'ai jamais vu autant de monde à Vézelay !",
    sujets: [
      ["Pourquoi tant de monde aujourd'hui ?", "Le roi Louis a convoqué ici ses barons et ses chevaliers pour le jour de Pâques. On dit que l'abbé Bernard de Clairvaux va parler. Tout le monde veut l'entendre : c'est un saint homme !"],
      ["Que se passe-t-il en Orient ?", "Des voyageurs racontent que les Turcs ont pris Édesse, une ville chrétienne d'Orient, il y a plus d'un an. Les chrétiens de là-bas appellent à l'aide."],
      ["Pourquoi à Vézelay ?", "Vézelay est un grand lieu de pèlerinage : l'abbaye garde les reliques de sainte Marie-Madeleine. Des pèlerins viennent de loin, et certains repartent d'ici vers Saint-Jacques-de-Compostelle."]
    ],
    aurevoir: "Je vais tâcher de trouver une place près de l'estrade. Que Dieu te garde !" },
  { id: "renaud", nom: "Frère Renaud", role: "Moine de l'abbaye de Vézelay",
    look: { peau: "#E2B896", habit: "#26221F", coiffe: "tonsure", cheveux: "#6A5040" },
    intro: "Paix à toi, pèlerin. Je suis frère Renaud, moine de l'abbaye de la Madeleine. Bienvenue dans notre basilique.",
    sujets: [
      ["Que gardez-vous dans la basilique ?", "Les reliques de sainte Marie-Madeleine, l'amie du Christ. Des foules de pèlerins viennent les prier et demander le pardon de leurs péchés."],
      ["Que montre la grande sculpture de l'entrée ?", "Au-dessus du grand portail, le Christ envoie ses apôtres annoncer sa parole à tous les peuples de la Terre, même les plus lointains. Beaucoup y voient un appel à partir au loin, au service de Dieu."],
      ["Pourquoi l'assemblée n'a-t-elle pas lieu dans l'église ?", "Elle est trop petite pour une telle foule ! On a construit une grande estrade de bois dans un champ, sur le flanc de la colline."]
    ],
    aurevoir: "Va entendre l'abbé de Clairvaux. Je prierai pour toi." },
  { id: "etienne", nom: "Frère Étienne", role: "Moine de Clairvaux",
    look: { peau: "#E6BE9C", habit: "#EDE8DC", coiffe: "tonsure", cheveux: "#8A6A4A" },
    intro: "Salut à toi ! Je suis frère Étienne, moine de Clairvaux. J'accompagne notre abbé, Bernard, dans ses voyages.",
    sujets: [
      ["Qui est Bernard ?", "Il est né vers 1090 dans une famille noble de Bourgogne. En 1112, il est entré à l'abbaye de Cîteaux avec une trentaine de compagnons. En 1115, il a fondé notre abbaye de Clairvaux, dont il est l'abbé."],
      ["Comment vivez-vous à Clairvaux ?", "Nous sommes des cisterciens : nous suivons strictement la règle de saint Benoît. Prière, silence, travail des champs, nourriture simple, églises sans décor. Notre habit de laine non teinte nous vaut le nom de « moines blancs »."],
      ["Pourquoi les rois l'écoutent-ils ?", "Il n'a ni armée ni royaume, et il a refusé de devenir évêque. Mais tout le monde admire sa sainteté et sa parole. Il écrit des centaines de lettres aux papes, aux rois, aux évêques. Et le pape Eugène III est un ancien moine de Clairvaux : son disciple !"]
    ],
    aurevoir: "Je dois rejoindre notre abbé près de l'estrade. Écoute-le bien !" },
  { id: "hugues", nom: "Hugues", role: "Chevalier, vassal du duc de Bourgogne",
    look: { peau: "#DDB08A", habit: "#8A8D90", col: "#8E2F24", coiffe: "casque", coiffeCol: "#9A9EA2", cheveux: "#5A4032", barbe: "#5A4032" },
    intro: "Holà ! Je suis Hugues, chevalier, vassal du duc de Bourgogne. Si l'abbé nous appelle, je suis prêt à prendre la croix.",
    sujets: [
      ["Pourquoi partir si loin ?", "Pour défendre les chrétiens d'Orient et les lieux saints, et pour le salut de mon âme ! Partir en croisade, c'est faire un pèlerinage en armes."],
      ["Que gagnes-tu en partant ?", "L'indulgence : le pape promet que les péchés de ceux qui partent seront pardonnés. Et pendant mon absence, l'Église protège ma famille et mes biens."],
      ["Tuer, n'est-ce pas un péché ?", "L'abbé Bernard a répondu à cette question dans un livre écrit pour les Templiers, ces moines-chevaliers : celui qui combat pour le Christ ne pèche pas en tuant ses ennemis. Mais il ajoute qu'il vaut mieux ne pas tuer si l'on peut faire autrement."],
      ["Combien coûte une croisade ?", "Très cher ! Il faut des chevaux, des armes, des serviteurs, de quoi vivre pendant des années. Beaucoup de chevaliers vendent ou mettent en gage leurs terres pour partir."]
    ],
    aurevoir: "Que Dieu nous donne la victoire ! On se retrouvera peut-être en Orient." },
  { id: "louis", nom: "Louis VII", role: "Roi des Francs",
    look: { peau: "#EBC6A6", habit: "#2F4F8E", col: "#E3B341", coiffe: "couronne", coiffeCol: "#E3B341", cheveux: "#B08850" },
    intro: "Approche. Je suis Louis, septième du nom, roi des Francs. Aujourd'hui, devant tous mes barons, je m'engage à partir en croisade.",
    sujets: [
      ["Pourquoi partir en croisade ?", "À Noël 1144, l'émir Zengi a pris Édesse, la capitale du plus ancien des États latins d'Orient. Les chrétiens d'Orient sont en danger. Et moi, je veux le pardon de Dieu : il y a trois ans, mes soldats ont brûlé l'église de Vitry, où des centaines de personnes s'étaient réfugiées."],
      ["Qui a décidé cette croisade ?", "Le pape Eugène III. Dans une bulle, une lettre solennelle, il a appelé les chrétiens à partir et promis l'indulgence. Puis il a confié à l'abbé Bernard la mission de prêcher la croisade."],
      ["Pourquoi avoir besoin de Bernard ?", "À Noël dernier, à Bourges, j'ai annoncé mon projet à mes barons. Ils sont restés hésitants. Personne ne sait entraîner les foules comme l'abbé de Clairvaux."],
      ["Qui gouvernera pendant ton absence ?", "L'abbé Suger, de Saint-Denis, mon fidèle conseiller. Encore un moine !"]
    ],
    aurevoir: "Va, et écoute l'abbé : bientôt, tout le royaume portera la croix." },
  { id: "alienor", nom: "Aliénor d'Aquitaine", role: "Duchesse d'Aquitaine, reine des Francs",
    look: { peau: "#F0CDB0", habit: "#8E2F3A", col: "#E3B341", coiffe: "voile", coiffeCol: "#F2EEE6", cheveux: "#8A5A30" },
    intro: "Bonjour, jeune pèlerin. Je suis Aliénor, duchesse d'Aquitaine et reine des Francs. Moi aussi, je vais prendre la croix aujourd'hui.",
    sujets: [
      ["Une reine en croisade ?", "Oui ! Je partirai avec le roi, comme d'autres grandes dames, et mes vassaux d'Aquitaine me suivront. Une croisade, ce n'est pas seulement une armée : c'est aussi un immense pèlerinage."],
      ["Que penses-tu de l'abbé Bernard ?", "C'est un homme austère, qui n'aime guère le luxe des cours, ni celui des églises trop décorées. Mais quand il parle, personne ne lui résiste. Même les rois et les papes suivent ses conseils."],
      ["Que va-t-il se passer ensuite ?", "Il faudra plus d'un an pour tout préparer : réunir l'argent, les chevaux, les armes, négocier le passage avec le roi de Hongrie et l'empereur de Constantinople. Nous partirons au printemps prochain."]
    ],
    aurevoir: "Que Dieu te garde. Nous nous reverrons peut-être à Jérusalem !" },
  { id: "odon", nom: "Odon de Deuil", role: "Moine de Saint-Denis, chapelain du roi",
    look: { peau: "#E0B490", habit: "#26221F", coiffe: "tonsure", cheveux: "#3A2A20" },
    intro: "Bonjour ! Je suis Odon, moine de l'abbaye de Saint-Denis et chapelain du roi. Je note tout ce que je vois : je veux écrire l'histoire de ce voyage.",
    sujets: [
      ["Qu'as-tu vu pendant le sermon ?", "Quand l'abbé a fini de parler, la foule a crié : « Des croix ! Des croix ! ». Il avait fait préparer un gros paquet de croix en tissu. Il n'y en a pas eu assez : il a dû découper ses propres vêtements pour en faire d'autres !"],
      ["Pourquoi coudre une croix sur ses habits ?", "La croix de tissu, cousue sur l'épaule, montre à tous que l'on a fait le vœu de partir. Celui qui a pris la croix doit tenir sa promesse devant Dieu."],
      ["Ton récit est-il fiable ?", "J'étais là, je l'ai vu de mes yeux ! Mais je te l'avoue : je suis moine, j'admire l'abbé Bernard et je sers le roi. Un historien doit toujours se demander qui écrit, et pourquoi."]
    ],
    aurevoir: "Je dois rejoindre le roi. Je partirai avec lui en croisade, pour tout raconter." },
  { id: "ephraim", nom: "Éphraïm", role: "Jeune juif de Bonn, en Rhénanie",
    look: { peau: "#DDB08A", habit: "#3E4F6A", col: "#C9A13A", coiffe: "pointu", coiffeCol: "#C9A13A", cheveux: "#2A1E16" },
    intro: "Shalom. Je m'appelle Éphraïm, je vis à Bonn, en Rhénanie. Cette année 1146 a été terrible pour les nôtres.",
    sujets: [
      ["Que s'est-il passé en Rhénanie ?", "Un moine nommé Radulf parcourt nos villes en prêchant la croisade. Il crie qu'avant d'aller combattre les musulmans, il faut tuer les juifs d'ici. Des foules l'ont écouté : des juifs ont été massacrés à Cologne, à Mayence, à Worms…"],
      ["Qu'a fait Bernard ?", "Il est venu jusqu'à Mayence pour faire taire Radulf et le renvoyer dans son monastère. Il a écrit partout qu'il ne faut ni persécuter, ni tuer, ni chasser les juifs. On raconte qu'il a dit : « Quiconque attaque un juif pour le tuer, c'est comme s'il blessait Jésus lui-même. »"],
      ["Bernard aime-t-il les juifs ?", "Pas vraiment : il pense que nous devrons nous convertir un jour, et il nous reproche de prêter de l'argent. Mais il veut que nous soyons protégés. Sans lui, bien plus des nôtres seraient morts."]
    ],
    aurevoir: "Que l'Éternel te garde. Souviens-toi de ce qui s'est passé ici." },
  { id: "odon2", nom: "Odon de Deuil", role: "De retour de croisade, en 1149",
    look: { peau: "#E0B490", habit: "#26221F", coiffe: "tonsure", cheveux: "#3A2A20" },
    intro: "Me revoici, bien fatigué. J'ai suivi l'armée du roi jusqu'en Orient, comme je te l'avais promis. Veux-tu savoir ce qui s'est passé ?",
    sujets: [
      ["Comment s'est passé le voyage jusqu'à Constantinople ?", "Nous sommes partis de Saint-Denis en juin 1147. L'armée du roi Conrad nous précédait. Il a fallu traverser l'Allemagne, la Hongrie, les Balkans : des mois de marche. À Constantinople, l'empereur byzantin se méfiait de nous, et nous de lui."],
      ["Que s'est-il passé en Asie Mineure ?", "Les Turcs connaissent le pays et harcèlent nos colonnes. Conrad a été écrasé près de Dorylée en octobre 1147. Nous, nous avons été massacrés au mont Cadmos en janvier 1148 : le roi lui-même a failli y mourir."],
      ["Et ensuite ?", "Le roi, les barons et une partie de l'armée ont pris la mer à Attalia pour gagner Antioche. Beaucoup de pèlerins pauvres, restés à terre, sont morts ou ont été capturés."],
      ["Pourquoi attaquer Damas ?", "À Acre, en juin 1148, les rois et les barons de Jérusalem ont choisi d'attaquer Damas, pourtant alliée de Jérusalem contre Nur ad-Din, le fils de Zengi. Le siège n'a duré que quatre jours : nous avons dû reculer."]
    ],
    aurevoir: "Nous étions partis si nombreux… En Orient, nous n'avons rien repris." },
  { id: "etienne2", nom: "Frère Étienne", role: "De retour à Clairvaux, vers 1150",
    look: { peau: "#E6BE9C", habit: "#EDE8DC", coiffe: "tonsure", cheveux: "#8A6A4A" },
    intro: "Ah, te revoilà ! Ici, à Clairvaux, les nouvelles d'Orient nous ont accablés. Notre abbé en a beaucoup souffert.",
    sujets: [
      ["Comment Bernard explique-t-il l'échec ?", "Pour lui, Dieu a puni les croisés pour leurs péchés : leur orgueil, leurs querelles, leurs désordres. L'échec ne vient pas de la croisade elle-même, qui était voulue par Dieu."],
      ["Est-il critiqué ?", "Oh oui ! Beaucoup l'accusent d'avoir envoyé des milliers d'hommes à la mort. Il répond qu'il n'a fait qu'obéir au pape, et donc à Dieu. Il l'a même écrit au pape Eugène III, son ancien disciple."],
      ["Renonce-t-il à la croisade ?", "Jamais ! En 1150, une assemblée a même voulu qu'il dirige lui-même une nouvelle croisade. Le projet n'a pas abouti."],
      ["Que devient Bernard ?", "Il meurt à Clairvaux en 1153. En 1174, le pape le proclame saint. Il y a alors plus de trois cents abbayes cisterciennes dans toute l'Europe."]
    ],
    aurevoir: "Que Dieu te garde. Prie pour notre abbé." }
];

/* ---------- Le sermon (étape 6) ----------
   Le texte du sermon de Vézelay n'a pas été conservé : ces phrases viennent d'une lettre écrite par Bernard
   en 1146 pour prêcher la croisade (lettre 363), en traduction simplifiée. */
const SERMON = {
  source: "D'après une lettre de Bernard pour prêcher la croisade, 1146 (traduction simplifiée). Le texte exact du sermon de Vézelay n'a pas été conservé.",
  lignes: [
    { qui: "Bernard", texte: "Voici maintenant le temps favorable, voici le jour du salut !" },
    { qui: "Bernard", texte: "Chevaliers, vous avez désormais une cause pour laquelle combattre sans danger pour vos âmes : vaincre y est glorieux, et mourir, un gain." },
    { qui: "Bernard", texte: "Si tu es un marchand avisé, voici une affaire à ne pas manquer : prends le signe de la croix, et tu obtiendras le pardon de tous les péchés que tu auras confessés d'un cœur sincère." },
    { qui: "La foule", texte: "Des croix ! Des croix !", foule: true },
    { qui: "Odon de Deuil", texte: "Il n'y a plus assez de croix : l'abbé découpe ses propres vêtements pour en faire d'autres !", croix: true }
  ]
};

/* ---------- Questions du carnet de bord ---------- */
const QUESTIONS = {
  q_lieu: {
    q: "Pourquoi Vézelay est-elle un lieu bien choisi pour appeler à la croisade ?",
    choix: ["C'est la capitale du royaume de France", "C'est un grand lieu de pèlerinage, où la foule vient prier Marie-Madeleine", "C'est une forteresse imprenable", "C'est un port d'où partent les navires pour l'Orient"],
    bonne: 1,
    exp: "Vézelay attire des foules de pèlerins. Or la croisade est présentée comme un pèlerinage en armes : on part pour Jérusalem, et l'on gagne le pardon de ses péchés."
  },
  q_pouvoir: {
    q: "Quel pouvoir politique Bernard exerce-t-il lui-même ?",
    choix: ["Il est évêque et seigneur d'un grand fief", "Il commande l'armée du roi", "Aucun : il est moine, mais il conseille les papes et les rois", "Il est le pape"],
    bonne: 2,
    exp: "Bernard est abbé de Clairvaux : il n'a ni armée ni royaume, et il a refusé de devenir évêque. Son pouvoir vient de son prestige de saint homme et de sa parole : il conseille les papes et les rois."
  },
  q_tuer: {
    q: "Selon Bernard (Doc. 4), pourquoi le chevalier du Christ ne commet-il pas de péché en tuant ?",
    choix: ["Parce qu'il combat pour le Christ : donner ou recevoir la mort pour lui n'a rien de criminel", "Parce qu'il paie une amende à l'Église", "Parce qu'il ne combat que contre des chrétiens", "Parce que le roi le lui ordonne"],
    bonne: 0,
    exp: "« Que la mort soit subie, qu'elle soit donnée, c'est toujours une mort pour le Christ : elle n'a rien de criminel. » Bernard hésite pourtant : « il ne convient pas de tuer les païens si l'on peut trouver un autre moyen »."
  },
  q_indulgence: {
    q: "Que promet l'Église à ceux qui partent en croisade ?",
    choix: ["Un fief en Orient à chacun", "Une solde payée par le pape", "L'indulgence : le pardon des peines dues pour leurs péchés", "Le droit de ne plus jamais payer d'impôt"],
    bonne: 2,
    exp: "L'indulgence efface les peines dues pour les péchés confessés. L'Église protège aussi la famille et les biens des croisés pendant leur absence."
  },
  q_decide: {
    q: "Qui décide la deuxième croisade, et qui la prêche ?",
    choix: ["Le roi la décide, un évêque la prêche", "Le pape Eugène III la décide, Bernard la prêche", "Bernard la décide, le pape la prêche", "Les chevaliers la décident, les moines la prêchent"],
    bonne: 1,
    exp: "Après la chute d'Édesse (1144), le pape Eugène III, ancien moine de Clairvaux, appelle à la croisade et charge Bernard de la prêcher (Doc. 5). Le roi Louis VII, lui, s'engage à partir."
  },
  q_effet: {
    q: "Quel détail montre l'effet produit par Bernard sur la foule (Doc. 5) ?",
    choix: ["La foule lui jette des pierres", "Le roi le fait chevalier", "Il n'a plus assez de croix et doit couper ses vêtements pour en faire d'autres", "La foule le porte en triomphe jusqu'à Paris"],
    bonne: 2,
    exp: "« Il fut forcé de couper ses propres vêtements pour en faire d'autres croix » : la foule réclame plus de croix que Bernard n'en avait préparé."
  },
  q_source: {
    q: "Odon de Deuil, qui raconte la scène, est moine et chapelain du roi. Que peut-on dire de son récit ?",
    choix: ["Il ne peut pas se tromper, puisqu'il est moine", "Il invente tout : il n'était pas à Vézelay", "Il était présent, mais il admire Bernard et le roi : il peut embellir la scène", "Il écrit pour se moquer de Bernard"],
    bonne: 2,
    exp: "Un témoin direct est précieux, mais il faut toujours se demander qui écrit et pour qui. Odon écrit pour la gloire du roi, et il admire Bernard."
  },
  q_juifs: {
    q: "Que fait Bernard en Rhénanie, à l'automne 1146 ?",
    choix: ["Il fait expulser les juifs du royaume", "Il fait taire le moine Radulf, qui pousse à massacrer les juifs", "Il se fait couronner empereur", "Il prend lui-même la tête d'une armée"],
    bonne: 1,
    exp: "Bernard veut la croisade contre les musulmans, mais il refuse qu'on persécute les juifs. Il fait renvoyer Radulf dans son monastère. À Noël 1146, à Spire, il convainc aussi Conrad III, roi de Germanie, de prendre la croix."
  },
  q_defaites: {
    q: "Où les armées de Conrad III puis de Louis VII sont-elles battues ?",
    choix: ["En Hongrie, puis à Constantinople", "En Asie Mineure : près de Dorylée (1147), puis au mont Cadmos (1148)", "À Jérusalem, puis à Acre", "À Lisbonne, puis à Damas"],
    bonne: 1,
    exp: "Les deux armées sont écrasées par les Turcs en traversant l'Asie Mineure : Conrad près de Dorylée (octobre 1147), Louis au mont Cadmos (janvier 1148)."
  },
  q_succes: {
    q: "Où la croisade remporte-t-elle son seul succès ?",
    choix: ["À Damas, prise en 1148", "À Édesse, reprise en 1147", "À Constantinople", "À Lisbonne, prise aux musulmans en 1147"],
    bonne: 3,
    exp: "En Orient, la croisade n'a rien repris. Mais à Lisbonne, des croisés venus par mer aident le roi du Portugal : l'idée de croisade s'étend à la péninsule Ibérique, et même aux païens des bords de la Baltique."
  },
  q_echec: {
    q: "Comment Bernard explique-t-il l'échec de 1148 (Doc. 6) ?",
    choix: ["Par la trahison du pape", "Par la supériorité des armes turques", "Par les péchés des croisés : Dieu les a punis", "Par le manque d'argent du roi"],
    bonne: 2,
    exp: "« Le Seigneur, provoqué par nos infidélités… » : pour Bernard, Dieu a puni les péchés des croisés."
  },
  q_refus: {
    q: "Que refuse-t-il de remettre en cause ?",
    choix: ["La croisade elle-même : il n'a fait qu'obéir au pape, donc à Dieu", "La puissance des Turcs", "Le courage du roi", "La richesse de Damas"],
    bonne: 0,
    exp: "« Je n'ai fait qu'obéir à vos ordres, ou plutôt aux ordres de Dieu même » : Bernard ne doute ni de la croisade, ni de son propre rôle."
  }
};

/* ---------- Schéma bilan ---------- */
const SCHEMA = {
  titre: "Bernard de Clairvaux : la puissance d'un moine",
  cases: [
    { id: "armes", titre: "Ses armes", sous: "sans armée ni royaume" },
    { id: "entraine", titre: "Ceux qu'il entraîne", sous: "du pape aux foules" },
    { id: "obtient", titre: "Ce qu'il obtient", sous: "résultats de son action" },
    { id: "limites", titre: "Les limites", sous: "échecs et critiques" }
  ],
  elements: [
    { id: "sermons", texte: "Ses sermons (Vézelay, Spire)", cases: ["armes"] },
    { id: "lettres", texte: "Des centaines de lettres", cases: ["armes"] },
    { id: "livre", texte: "Un livre pour les Templiers (Doc. 4)", cases: ["armes"] },
    { id: "prestige", texte: "Son prestige de saint homme", cases: ["armes"] },
    { id: "pape", texte: "Le pape Eugène III, son ancien disciple", cases: ["entraine"] },
    { id: "roi", texte: "Le roi Louis VII et la reine Aliénor", cases: ["entraine"] },
    { id: "empereur", texte: "Conrad III, roi de Germanie (Spire, 1146)", cases: ["entraine"] },
    { id: "foules", texte: "Des foules de chevaliers et de pèlerins", cases: ["entraine"] },
    { id: "armees", texte: "Deux armées royales partent en 1147", cases: ["obtient"] },
    { id: "juifs", texte: "Les juifs de Rhénanie protégés (1146)", cases: ["obtient"] },
    { id: "defaites", texte: "Défaites en Asie Mineure (1147-1148)", cases: ["limites"] },
    { id: "damas", texte: "Échec devant Damas (1148)", cases: ["limites"] },
    { id: "critique", texte: "Il est accusé d'avoir envoyé des hommes à la mort", cases: ["limites"] }
  ]
};

const REDACTION = {
  consigne: "En trois phrases, montre comment un moine, sans armée ni royaume, devient l'un des principaux acteurs politiques de l'Occident.",
  aide: ["abbé", "sermon", "lettres", "pape Eugène III", "Louis VII", "Conrad III", "Vézelay", "croisade", "échec"]
};

/* ---------- Objets à examiner ----------
   etape : l'étape où l'objet se trouve ; theme : "cours" (croisade, Église, sources) ou "feodal" (société féodale).
   illustration (facultative) : "ordres", "pyramide" ou "royaume" (dessins de jeu.js).
   La question « Le sais-tu ? » ne compte pas dans les 12 questions du carnet : c'est un défi en plus. */
const OBJETS = [
  { id: "bourdon", etape: "route", nom: "Le bourdon et la besace du pèlerin", lieu: "Au pied d'une croix de chemin", theme: "cours", notion: "Pèlerinage",
    textes: ["Avant de partir, le pèlerin fait bénir à l'église son bâton, le **bourdon**, et son sac, la **besace**.",
      "Il est alors sous la **protection de l'Église** : l'attaquer est un péché grave. Ceux qui reviennent de Saint-Jacques-de-Compostelle portent une coquille.",
      "La croisade reprend ce modèle : c'est un **pèlerinage en armes**, avec un vœu, un lieu saint à atteindre et la protection de l'Église."],
    question: { q: "Pourquoi dit-on que la croisade est un « pèlerinage en armes » ?", choix: ["Les croisés font un vœu et partent vers un lieu saint, comme les pèlerins", "Les pèlerins portent toujours une épée", "Le roi oblige tout le monde à partir", "On voyage toujours à cheval"], bonne: 0,
      exp: "Comme le pèlerin, le croisé fait un vœu, part vers Jérusalem et reçoit la protection de l'Église. Mais il part pour combattre." } },
  { id: "charrue", etape: "route", nom: "La charrue et les bœufs", lieu: "Dans un champ, près de la route", theme: "feodal", notion: "Ceux qui travaillent", illustration: "ordres",
    textes: ["Plus de neuf personnes sur dix sont des **paysans**. Avec une lourde charrue tirée par des bœufs, ils cultivent le blé, l'orge et la vigne.",
      "La terre appartient à un **seigneur**, ici souvent l'abbaye. Le paysan exploite une tenure : il doit des **redevances**, en argent ou en nature, et des journées de travail gratuit, les **corvées**.",
      "Vers l'an mil, l'évêque Adalbéron de Laon décrit une société en **trois ordres** : ceux qui prient, ceux qui combattent, ceux qui travaillent."],
    question: { q: "Que doit le paysan à son seigneur ?", choix: ["Rien : il est propriétaire de sa terre", "Des redevances et des corvées", "Le service à cheval à la guerre", "Une part des offrandes des pèlerins"], bonne: 1,
      exp: "Le paysan exploite une terre du seigneur : il lui doit des redevances (argent, grain, vin) et des corvées (journées de travail gratuit)." } },
  { id: "tympan", etape: "basilique", nom: "Le tympan de la Pentecôte", lieu: "Dans l'avant-nef, au-dessus de la porte", theme: "cours", notion: "Mission de l'Église", interieur: true,
    textes: ["Au-dessus de la porte de la nef, un Christ immense envoie ses **apôtres** porter sa parole au monde entier : des rayons partent de ses mains vers leurs têtes.",
      "Tout autour, les sculpteurs ont représenté les **peuples lointains**, réels ou imaginaires, qui doivent recevoir cette parole.",
      "Pour les pèlerins de 1146, le message est clair : les chrétiens ont une **mission** qui dépasse l'Occident."],
    question: { q: "Que montre ce tympan ?", choix: ["Le Christ envoyant ses apôtres vers tous les peuples", "La bataille de Dorylée", "Le sacre de Louis VII", "La vie des moines de Cîteaux"], bonne: 0,
      exp: "C'est la mission des apôtres, le jour de la Pentecôte : annoncer la parole du Christ à tous les peuples de la Terre." } },
  { id: "chapiteau", etape: "basilique", nom: "Le chapiteau du moulin", lieu: "Sur un pilier de la nef", theme: "cours", notion: "Enseigner la foi", interieur: true,
    textes: ["Sur ce chapiteau, **Moïse** verse du grain dans un moulin et **saint Paul** recueille la farine.",
      "Le grain, c'est l'Ancien Testament ; la farine, c'est le Nouveau, qui l'explique aux chrétiens.",
      "Les sculptures **enseignent la foi** à des fidèles qui, pour la plupart, ne savent pas lire."],
    question: { q: "À quoi servent les sculptures des églises pour la plupart des fidèles ?", choix: ["À connaître les récits de la Bible sans savoir lire", "À décorer le palais du roi", "À indiquer la route de Jérusalem", "À compter les offrandes"], bonne: 0,
      exp: "Au XIIe siècle, presque personne ne sait lire en dehors du clergé : les images sculptées et peintes racontent la Bible." } },
  { id: "chasse", etape: "basilique", nom: "La châsse des reliques", lieu: "Dans le chœur, sur l'autel", theme: "cours", notion: "Reliques", interieur: true,
    textes: ["Les moines affirment posséder le corps de **Marie-Madeleine**. Ses reliques reposent dans une **châsse**, un coffre de bois couvert d'or et de pierres.",
      "Les pèlerins viennent la prier pour obtenir guérison et pardon. Leurs **offrandes** enrichissent l'abbaye, qui peut bâtir cette immense église.",
      "Vézelay, grand lieu de pèlerinage, est donc l'endroit idéal pour appeler les foules à la croisade."],
    question: { q: "Pourquoi les reliques enrichissent-elles l'abbaye ?", choix: ["Les pèlerins laissent des offrandes", "Le roi paie un impôt aux moines", "Les reliques sont vendues aux marchands", "Les chevaliers y déposent leur butin"], bonne: 0,
      exp: "Les pèlerins donnent de l'argent, des cierges, des objets précieux : les reliques font vivre l'abbaye et le bourg." } },
  { id: "four", etape: "bourg", nom: "Le four banal", lieu: "Au pied des remparts", theme: "feodal", notion: "Seigneurie",
    textes: ["À Vézelay, le **seigneur**, c'est l'abbé. Les habitants doivent cuire leur pain dans son four et payer pour cela : c'est une **banalité**.",
      "Il en va de même pour le moulin et le pressoir. Le seigneur rend aussi la **justice** et taxe les marchandises vendues au marché.",
      "Ces charges pèsent lourd : en 1152, les bourgeois de Vézelay se révolteront contre l'abbé."],
    question: { q: "Qu'est-ce qu'une banalité ?", choix: ["L'obligation d'utiliser, en payant, le four, le moulin ou le pressoir du seigneur", "Une fête de village", "Un impôt payé au roi pour la croisade", "Une prière récitée chaque matin"], bonne: 0,
      exp: "Le seigneur possède le four, le moulin et le pressoir ; les habitants sont obligés de s'en servir et de payer une redevance." } },
  { id: "charte", etape: "bourg", nom: "La charte et le sceau de l'abbé", lieu: "Sur la table du prévôt", theme: "feodal", notion: "L'Église, grand seigneur",
    textes: ["Les droits de l'abbaye sont écrits en latin sur du **parchemin**, dans des chartes. Un **sceau** de cire, pendu au bas, prouve qu'elles sont authentiques.",
      "L'abbaye de Vézelay ne dépend que du **pape** : ni l'évêque d'Autun, ni le comte de Nevers ne peuvent y commander, d'où de longs conflits.",
      "L'Église est donc aussi un **grand seigneur**, avec des terres, des paysans et des revenus."],
    question: { q: "Pourquoi dit-on que l'Église est aussi un seigneur ?", choix: ["Elle possède des terres et perçoit des redevances", "Elle commande l'armée du roi", "Elle nomme les rois de France", "Elle interdit le commerce"], bonne: 0,
      exp: "Évêchés et abbayes possèdent d'immenses domaines : comme les seigneurs laïcs, ils perçoivent redevances, taxes et banalités." } },
  { id: "dime", etape: "bourg", nom: "Les gerbes de la dîme", lieu: "Devant la grange de l'abbaye", theme: "feodal", notion: "Dîme",
    textes: ["Chaque année, les paysans donnent à l'Église environ **un dixième** de leur récolte : c'est la **dîme**.",
      "Elle sert à entretenir le clergé et les églises, et à aider les pauvres. Grain et vin sont rangés dans de grandes granges.",
      "Avec les redevances dues au seigneur, il reste peu au paysan pour nourrir sa famille."],
    question: { q: "Quelle part de la récolte la dîme représente-t-elle ?", choix: ["Environ un dixième", "La moitié", "Toute la récolte", "Rien : elle se paie en prières"], bonne: 0,
      exp: "Dîme vient du latin decima, « dixième » : en principe, un dixième des récoltes revient à l'Église." } },
  { id: "epee", etape: "champ", nom: "L'épée et les éperons", lieu: "Sur le râtelier des chevaliers", theme: "feodal", notion: "Ceux qui combattent",
    textes: ["Le **chevalier** combat à cheval, avec une lance, une épée, un écu et une cotte de mailles de 10 à 15 kilos.",
      "Tout cela coûte très cher : seuls les seigneurs, et les hommes qu'ils entretiennent, peuvent être chevaliers.",
      "Le jeune noble devient chevalier lors de l'**adoubement** : on lui remet l'épée et les éperons. L'Église lui demande de protéger les faibles et de défendre les chrétiens."],
    question: { q: "Pourquoi tout le monde ne peut-il pas être chevalier ?", choix: ["Le cheval et les armes coûtent très cher", "Il faut savoir lire le latin", "Il faut être moine", "Le pape choisit chaque chevalier"], bonne: 0,
      exp: "Un cheval de guerre et un équipement complet valent une fortune : la chevalerie est réservée aux plus riches." } },
  { id: "ecu", etape: "champ", nom: "L'écu : vassal et seigneur", lieu: "Contre le râtelier", theme: "feodal", notion: "Vassalité", illustration: "pyramide",
    textes: ["Hugues est le **vassal** du duc de Bourgogne. À genoux, les mains jointes dans celles du duc, il lui a prêté **hommage** et juré fidélité sur des reliques.",
      "En échange, le duc lui a confié une terre, le **fief**. Hugues lui doit aide et conseil : combattre à ses côtés, siéger à sa cour.",
      "Le duc est lui-même vassal du roi : ces liens d'homme à homme forment la **société féodale**."],
    question: { q: "Que reçoit un vassal de son seigneur ?", choix: ["Un fief, en échange de son aide et de sa fidélité", "Un salaire chaque mois", "Une place de moine à Clairvaux", "Le droit de choisir le pape"], bonne: 0,
      exp: "Par l'hommage, le vassal promet aide et conseil ; le seigneur lui confie un fief, le plus souvent une terre." } },
  { id: "bulle", etape: "estrade", nom: "La bulle du pape Eugène III", lieu: "Sur le pupitre de l'estrade", theme: "cours", notion: "Indulgence",
    textes: ["Le 1er décembre 1145, le pape Eugène III appelle à la croisade par une lettre solennelle, une **bulle**, du nom de son sceau de plomb, la *bulla*.",
      "Il promet aux croisés le **pardon de leurs péchés**, la **protection de l'Église** pour leur famille et leurs biens, et l'arrêt des intérêts sur leurs dettes.",
      "Il la renouvelle le 1er mars 1146 : c'est elle que Bernard vient prêcher à Vézelay."],
    question: { q: "Qu'est-ce qu'une bulle ?", choix: ["Une lettre solennelle du pape, scellée de plomb", "Une prière chantée par les moines", "Un bouclier de chevalier", "Une taxe royale"], bonne: 0,
      exp: "La bulle doit son nom à la bulla, le sceau de plomb qui authentifie les lettres les plus importantes du pape." } },
  { id: "sceau", etape: "estrade", nom: "Le sceau du roi", lieu: "Sur le coussin, près du roi", theme: "feodal", notion: "Royauté capétienne", illustration: "royaume",
    textes: ["Sur son **sceau**, Louis VII est assis sur son trône : sacré à Reims, il tient son pouvoir de Dieu. Tous les grands seigneurs du royaume lui doivent l'hommage.",
      "Mais il ne commande vraiment que son **domaine**, autour de Paris et d'Orléans. Les **grands vassaux**, comme le comte de Champagne, sont presque aussi puissants que lui.",
      "En épousant Aliénor, il est devenu duc d'**Aquitaine**, un duché bien plus vaste que son domaine."],
    question: { q: "Pourquoi le pouvoir de Louis VII est-il limité ?", choix: ["Il ne contrôle vraiment que son domaine ; les grands vassaux sont puissants", "Le pape gouverne la France", "Il n'a pas été sacré", "Il vit en Orient"], bonne: 0,
      exp: "Le roi est le suzerain de tous, mais son domaine est petit : les ducs et les comtes gouvernent leurs terres presque librement." } },
  { id: "croix", etape: "sermon", nom: "Les croix de tissu", lieu: "Sur l'estrade, près de Bernard", theme: "cours", notion: "Prendre la croix",
    textes: ["Celui qui **prend la croix** fait un vœu : partir pour Jérusalem. Il coud la croix de tissu sur son épaule et devient un « croisé », en latin *crucesignatus*, « marqué de la croix ».",
      "Le vœu engage devant Dieu : celui qui ne part pas peut être puni par l'Église.",
      "Bernard avait fait préparer des croix à l'avance : la scène était organisée… mais la foule en réclama plus encore (Doc. 5)."],
    question: { q: "Que signifie « prendre la croix » ?", choix: ["Faire le vœu de partir en croisade", "Devenir moine à Clairvaux", "Porter le crucifix en procession", "Payer la dîme"], bonne: 0,
      exp: "Prendre la croix, c'est faire publiquement le vœu de partir ; la croix cousue sur le vêtement montre cet engagement." } },
  { id: "tablette", etape: "sermon", nom: "La tablette de cire d'Odon", lieu: "Sur un tabouret, près d'Odon", theme: "cours", notion: "Les sources",
    textes: ["Pour prendre des notes, on écrit avec un **stylet** sur une tablette de bois couverte de **cire**, que l'on peut effacer.",
      "Odon recopiera ensuite son récit sur du **parchemin**, pour l'abbé Suger de Saint-Denis : c'est la principale source sur cette croisade (Doc. 5).",
      "Moine et chapelain du roi, il admire Louis VII et Bernard : l'historien doit en tenir compte."],
    question: { q: "Pourquoi faut-il lire le récit d'Odon avec prudence ?", choix: ["Il admire le roi et Bernard", "Il n'était pas à la croisade", "Il écrit deux siècles plus tard", "Il écrit en arabe"], bonne: 0,
      exp: "Un témoin direct est précieux, mais Odon écrit pour la gloire du roi : il faut confronter son récit à d'autres sources." } },
  { id: "lettre", etape: "rhenanie", nom: "Une lettre de Bernard", lieu: "Copiée et lue dans les églises", theme: "cours", notion: "Les armes de Bernard",
    textes: ["Bernard ne peut pas être partout : il **écrit**. Ses lettres, en latin, sont copiées et lues à voix haute en Angleterre, en Bavière, en Bohême…",
      "Dans l'une d'elles (lettre 363), il appelle à la croisade mais interdit de s'en prendre aux juifs : « il ne faut ni les persécuter, ni les tuer, ni même les chasser ».",
      "Ses lettres sont une **arme politique** : elles portent sa parole bien plus loin que sa voix."],
    question: { q: "Pourquoi Bernard écrit-il autant de lettres ?", choix: ["Pour porter sa parole dans toute la chrétienté", "Pour vendre des reliques", "Pour payer les chevaliers", "Pour apprendre le latin aux paysans"], bonne: 0,
      exp: "Copiées et lues en public, les lettres permettent à Bernard d'agir partout sans se déplacer." } },
  { id: "oriflamme", etape: "croisade", nom: "L'oriflamme de Saint-Denis", lieu: "Le départ du roi, 11 juin 1147", theme: "cours", notion: "Roi et pèlerin",
    textes: ["Le 11 juin 1147, à l'abbaye de Saint-Denis, le pape Eugène III remet à Louis VII l'**oriflamme**, la bannière rouge de saint Denis, avec la besace du pèlerin.",
      "Le roi part à la fois en **chef de guerre** et en **pèlerin**.",
      "Pendant son absence, l'abbé **Suger** gouverne le royaume : encore un homme d'Église au cœur du pouvoir."],
    question: { q: "Que reçoit Louis VII à Saint-Denis ?", choix: ["L'oriflamme et la besace du pèlerin", "La couronne impériale", "Les clés de Jérusalem", "L'épée de Bernard"], bonne: 0,
      exp: "L'oriflamme fait du roi un chef de guerre protégé par saint Denis ; la besace, un pèlerin." } },
  { id: "bourse", etape: "croisade", nom: "La bourse du croisé", lieu: "Les dépenses du voyage", theme: "feodal", notion: "Payer la croisade",
    textes: ["Partir coûte très cher : cheval, armes, serviteurs, nourriture pour deux ans ou plus.",
      "Beaucoup de chevaliers **vendent** ou **mettent en gage** leurs terres, souvent auprès des abbayes. Le roi lève une taxe sur son royaume et emprunte aux **Templiers**.",
      "À Constantinople, on paie en **besants**, les pièces d'or de l'Empire byzantin."],
    question: { q: "Comment beaucoup de chevaliers paient-ils leur départ ?", choix: ["Ils vendent ou mettent en gage leurs terres", "Le pape leur verse un salaire", "Ils pillent l'abbaye de Vézelay", "Le voyage est gratuit"], bonne: 0,
      exp: "Vendre ou engager sa terre permet de réunir l'argent du voyage ; les abbayes, riches, prêtent ou achètent." } },
  { id: "livre", etape: "echec", nom: "Le traité De la considération", lieu: "Écrit à Clairvaux, vers 1149-1152", theme: "cours", notion: "Justifier l'échec",
    textes: ["Après l'échec, Bernard écrit pour le pape Eugène III un long traité, **De la considération** (Doc. 6), où il le conseille sur la façon de gouverner l'Église.",
      "Il y explique l'échec par les **péchés des croisés**, sans jamais douter de la croisade elle-même.",
      "Il meurt en 1153 et sera proclamé **saint** dès 1174."],
    question: { q: "À qui Bernard adresse-t-il De la considération ?", choix: ["Au pape Eugène III, son ancien disciple", "Au roi Louis VII", "À l'empereur de Constantinople", "Aux moines de Vézelay"], bonne: 0,
      exp: "Eugène III est un ancien moine de Clairvaux : Bernard, son ancien abbé, lui écrit comme un maître à son disciple." } }
];
