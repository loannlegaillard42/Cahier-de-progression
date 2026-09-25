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
  ["Se promener", "Le bouton « Se promener librement » permet de marcher sur la colline avec Z Q S D ou les flèches."]
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
