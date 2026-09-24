/* Galère pour l'Orient — contenu du jeu (PPO Venise, 2de, Thème 1, chapitre 2)
   Tous les textes affichés aux élèves sont ici : tu peux les modifier sans toucher au moteur (jeu.js).
   Références « Doc. » = documents de la fiche élève « PPO : Venise, grande puissance maritime et commerciale ». */

const JEU = {
  titre: "Galère pour l'Orient",
  sousTitre: "Un marchand vénitien au milieu du XIVe siècle",
  niveau: "2de · Thème 1, chapitre 2 · PPO Venise",
  questionDepart: "Sur quoi Venise fonde-t-elle sa puissance, et qu'est-ce qui finit par la menacer ?",
  ducatsDepart: 200,
  cale: 12,              // nombre de ballots que la galère peut porter
  dateDepart: [1350, 7, 1], // 1er août 1350 (mois comptés à partir de 0)
  jourLimite: 165,       // au-delà, les autres galères sont rentrées avant toi : les prix baissent
  baisseRetard: 0.2,
  joursParUnite: 2,      // durée de navigation : jours par unité de distance sur la carte
  joursEscale: 2
};

const INTRO = [
  "Venise, été 1350. Tu es un jeune marchand vénitien. La République te confie 200 ducats d'or et une place à bord d'une galère de commerce.",
  "Ta mission : faire le tour des escales de Venise en Méditerranée orientale, acheter, vendre… et rentrer à Venise plus riche qu'au départ.",
  "À chaque nouvelle escale, lis ce que tu découvres et réponds à la question de ton carnet de bord : c'est lui que tu rendras à la fin."
];

const REGLES = [
  ["Les habitants", "À chaque escale, parle aux personnages : leurs réponses t'aident à remplir ton carnet de bord."],
  ["Naviguer", "Clique sur le nom d'un port relié par une route dorée."],
  ["Commercer", "12 ballots maximum dans ta cale. Achète bon marché, revends cher."],
  ["Le temps", "Départ le 1er août. Rentre à Venise avant le 12 janvier, sinon tes marchandises se vendront moins cher."],
  ["La caméra", "Glisse pour tourner, molette ou pincement pour zoomer, clic droit pour déplacer."]
];

/* ---------- Marchandises ---------- */
const MARCHANDISES = {
  draps:   { nom: "Draps de laine", couleur: "#7A3B2E", info: "Tissus de laine de Flandre et d'Italie, très demandés en Orient." },
  metaux:  { nom: "Cuivre et argent", couleur: "#A0764A", info: "Métaux d'Allemagne, vendus à Venise par les marchands allemands." },
  verre:   { nom: "Verre de Murano", couleur: "#3F8AA6", info: "Verrerie fabriquée dans la lagune de Venise." },
  boisfer: { nom: "Bois et fer", couleur: "#5B5F63", info: "Le pape interdit de les vendre aux musulmans : ils peuvent servir à construire des navires et des armes.", interdit: true },
  epices:  { nom: "Épices", couleur: "#C2622A", info: "Poivre, gingembre, cannelle, venus d'Inde et d'Asie du Sud-Est." },
  soie:    { nom: "Soieries", couleur: "#8C4A87", info: "Étoffes de soie de luxe." },
  coton:   { nom: "Coton", couleur: "#9C9486", info: "Coton de Syrie et de Crète, pour les tisserands d'Occident." },
  sucre:   { nom: "Sucre", couleur: "#C9B07A", info: "Sucre de canne de Chypre, un produit de luxe en Occident." },
  alun:    { nom: "Alun", couleur: "#7E96A3", info: "Minerai d'Asie Mineure, indispensable pour fixer les teintures des draps." },
  ble:     { nom: "Blé", couleur: "#C79A2E", info: "Blé de Crète, qui nourrit Venise et ses colonies." },
  vin:     { nom: "Vin de Crète", couleur: "#7B2D3B", info: "Vin doux (malvoisie), exporté dans tout l'Occident." }
};

/* ---------- Escales ----------
   achat : ce qu'on peut acheter ici (prix en ducats par ballot)
   vente : ce que les marchands d'ici t'achètent */
const PORTS = {
  venise: {
    nom: "Venise", lon: 12.34, lat: 45.435, drapeau: "venise", ville: "venise",
    statut: "Capitale de la République",
    titre: "Venise, capitale de la République",
    texte: [
      "Venise est bâtie sur une centaine d'îles, au milieu d'une lagune. Ta galère est amarrée près de la place Saint-Marc. Observe la gravure : que remarques-tu autour de la ville ?"
    ],
    figure: { src: "img/gravure-venise.jpg", alt: "Gravure en couleurs de Venise vue du ciel, entourée par la lagune et les navires", legende: "<b>Venise vue par un graveur</b> au XVIe siècle (Doc. 4 de ta fiche) : la ville est construite sur une lagune, sans muraille. © The Hebrew University of Jerusalem & The Jewish National & University Library." },
    notion: ["Doge", "chef de la République de Venise, élu à vie."],
    questions: ["q_sel", "q_muraille"],
    marcheTitre: "Au Rialto, achète ce que l'Orient demande",
    conseil: "Conseil d'un vieux marchand : draps, métaux et verre se revendent bien dans tous les ports d'Orient. Mais garde de la place pour les épices !",
    achat: { draps: 10, metaux: 12, verre: 8, boisfer: 6 },
    vente: {}
  },
  raguse: {
    nom: "Raguse", lon: 18.094, lat: 42.641, drapeau: "venise", ville: "raguse",
    statut: "Sous l'autorité de Venise (1205-1358)",
    titre: "Raguse, sur la côte de Dalmatie",
    texte: [
      "Sur la côte de Dalmatie, Raguse (aujourd'hui Dubrovnik) vit sous l'autorité de Venise. Les galères y font escale avant de traverser vers la Grèce."
    ],
    notion: ["Stato da Mar", "« l'État de mer » : l'ensemble des possessions de Venise outre-mer."],
    questions: ["q_stato"],
    escale: true
  },
  modon: {
    nom: "Modon", lon: 21.705, lat: 36.816, drapeau: "venise", ville: "modon",
    statut: "Possession vénitienne depuis 1207",
    titre: "Modon, « l'œil de la République »",
    texte: [
      "Au sud-ouest de la Grèce, la forteresse vénitienne de Modon surveille la route des galères. Sa voisine Coron appartient elle aussi à Venise."
    ],
    notion: ["Escale", "port où un navire s'arrête pour se ravitailler et se réparer."],
    questions: ["q_modon"],
    nouvelle: "Nouvelle apprise à Modon : des galères génoises rôdent en mer Égée. Prudence !",
    escale: true
  },
  candie: {
    nom: "Candie", lon: 25.134, lat: 35.34, drapeau: "venise", ville: "candie",
    statut: "Crète · colonie vénitienne",
    titre: "Candie, capitale de la Crète vénitienne",
    texte: [
      "Candie est la capitale de la Crète, une grande île que Venise a achetée en 1204 puis conquise. Un « duc » vénitien la gouverne."
    ],
    notion: ["Colonie", "territoire dominé et exploité par une puissance étrangère."],
    questions: ["q_colonie"],
    marcheTitre: "Marché de Candie",
    conseil: "Le blé et le vin crétois se revendent à Constantinople, et le coton à Venise.",
    achat: { ble: 4, vin: 7, coton: 9 },
    vente: { draps: 16, metaux: 18, verre: 13 }
  },
  constantinople: {
    nom: "Constantinople", lon: 28.975, lat: 41.01, drapeau: "byzance", ville: "constantinople",
    statut: "Empire byzantin · quartier vénitien",
    titre: "Constantinople, capitale de l'Empire byzantin",
    texte: [
      "Constantinople reste une ville immense, mais l'Empire byzantin est très affaibli. Les Vénitiens y ont leur propre quartier, au bord de la Corne d'Or."
    ],
    notion: ["Privilège", "droit particulier accordé par un souverain : ici, commercer sans payer de taxes."],
    questions: ["q_1204"],
    marcheTitre: "Marché du quartier vénitien",
    achat: { soie: 26, alun: 11 },
    vente: { draps: 20, metaux: 22, verre: 16, ble: 10, vin: 14 }
  },
  alexandrie: {
    nom: "Alexandrie", lon: 29.918, lat: 31.2, drapeau: "mamelouk", ville: "alexandrie",
    statut: "Sultanat mamelouk · fondouks vénitiens",
    titre: "Alexandrie, grand port du sultanat mamelouk",
    texte: [
      "Alexandrie est le grand port de l'Égypte, gouvernée par les sultans mamelouks, musulmans. C'est ici qu'arrivent les épices d'Asie."
    ],
    notion: ["Fondouk (comptoir)", "bâtiment où les marchands étrangers logent, entreposent et vendent leurs marchandises."],
    questions: ["q_fondouk", "q_intermediaire"],
    marcheTitre: "Marché d'Alexandrie",
    conseil: "Les épices achetées ici se revendent plus de deux fois leur prix au Rialto.",
    achat: { epices: 30, soie: 30 },
    vente: { draps: 22, metaux: 26, verre: 18, boisfer: 34, vin: 15 }
  },
  famagouste: {
    nom: "Famagouste", lon: 33.94, lat: 35.125, drapeau: "chypre", ville: "famagouste",
    statut: "Royaume chrétien de Chypre",
    titre: "Famagouste, port du royaume de Chypre",
    texte: [
      "Famagouste est le port le plus animé du royaume chrétien de Chypre, gouverné par la famille franque des Lusignan. On y entend parler toutes les langues de la Méditerranée."
    ],
    notion: ["Canne à sucre", "cultivée à Chypre dans de grands domaines ; des familles vénitiennes, comme les Cornaro, en posséderont bientôt."],
    questions: ["q_origine"],
    marcheTitre: "Marché de Famagouste",
    achat: { sucre: 12, coton: 8, epices: 38 },
    vente: { draps: 18, metaux: 20, verre: 15, ble: 9 }
  }
};

/* ---------- Personnages à qui parler ----------
   Un ou deux par escale. Les faits cités viennent des documents de la fiche et des travaux d'historiens ;
   les personnages eux-mêmes sont imaginés. port : "retour" = au retour à Venise.
   look : peau, habit, col (liseré), coiffe (berret, toque, turban, bonnet, voile), coiffeCol, cheveux, barbe. */
const PERSONNAGES = [
  { id: "pietro", port: "venise", nom: "Pietro", role: "Patron de ta galère",
    look: { peau: "#E2B48E", habit: "#7A1F1B", col: "#E3B341", coiffe: "berret", coiffeCol: "#1E1B1A", cheveux: "#3A2A20", barbe: "#3A2A20" },
    intro: "Benvenuto ! Je suis Pietro, le patron de la galère sur laquelle tu embarques. Avant de lever l'ancre, as-tu des questions ?",
    sujets: [
      ["Comment Venise s'est-elle enrichie ?", "Au début, grâce au sel ! Dans les salines de la lagune, on récolte le sel, que nos bateaux vont vendre le long des fleuves et des côtes. Le sel et le navire : voilà les deux trésors de Venise."],
      ["Pourquoi la ville n'a-t-elle pas de murailles ?", "Regarde autour de toi : de l'eau partout ! Une armée ne peut pas traverser la lagune à pied, et les bancs de vase piègent les navires qui ne connaissent pas les chenaux. Notre flotte de guerre fait le reste."],
      ["Qui construit les galères ?", "L'Arsenal, le grand chantier naval de la République. Les galères de commerce appartiennent à l'État : il les loue aux marchands, puis elles partent ensemble, en convoi, pour se protéger."],
      ["Qui dirige la République ?", "Le doge, élu à vie. Mais il ne décide pas seul : le Grand Conseil, formé des grandes familles de marchands, gouverne avec lui."]
    ],
    aurevoir: "Allez, en route ! Les rameurs attendent, et le vent est bon." },
  { id: "nikola", port: "raguse", nom: "Nikola", role: "Pilote du port de Raguse",
    look: { peau: "#C99A70", habit: "#5C6B4A", coiffe: "bonnet", coiffeCol: "#8E2F24", cheveux: "#2A1E16", barbe: "#2A1E16" },
    intro: "Dobar dan ! Je suis Nikola, pilote du port de Raguse. Je guide les navires entre les rochers et les îles de la côte.",
    sujets: [
      ["Qui gouverne Raguse ?", "Un comte envoyé par Venise. Depuis 1205, notre ville est sous l'autorité de la République, comme beaucoup de ports de cette côte."],
      ["Pourquoi les galères longent-elles la côte ?", "Une galère emporte plus de cent cinquante rameurs : il leur faut sans cesse de l'eau et des vivres. Alors on navigue de port en port, et on s'abrite quand le temps tourne."],
      ["C'est quoi, le Stato da Mar ?", "« L'État de mer » : tous les ports, les îles et les territoires que Venise tient outre-mer. Mis bout à bout, ils forment une chaîne d'escales jusqu'en Orient."]
    ],
    aurevoir: "Bon vent ! Garde la côte à ta gauche jusqu'à la Grèce." },
  { id: "giovanni", port: "modon", nom: "Giovanni", role: "Châtelain vénitien de Modon",
    look: { peau: "#DDB08A", habit: "#44546A", col: "#C9C3B6", coiffe: "berret", coiffeCol: "#8E1B1B", cheveux: "#5A4032", barbe: "#5A4032" },
    intro: "Salut, marchand ! Je suis Giovanni, le châtelain que Venise a envoyé commander la forteresse de Modon.",
    sujets: [
      ["Depuis quand Venise tient-elle Modon ?", "Depuis 1207. Après la prise de Constantinople par les croisés, en 1204, l'Empire byzantin a été partagé. Venise a choisi des ports bien placés sur ses routes, comme Modon et Coron."],
      ["Pourquoi « les yeux de la République » ?", "Parce que tous les navires passent par ici ! Ils nous apportent les nouvelles d'Orient et d'Occident, que nous envoyons aussitôt à Venise : les pirates, les Génois, le prix des épices…"],
      ["Que viennent faire les galères ici ?", "Faire le plein d'eau douce et de biscuit, réparer les coques, soigner les malades. Même les pèlerins qui partent pour Jérusalem font escale chez nous."]
    ],
    aurevoir: "Méfie-toi des Génois en mer Égée ! Que saint Marc te protège." },
  { id: "eleni", port: "candie", nom: "Eleni", role: "Paysanne grecque de Crète",
    look: { peau: "#D2A27A", habit: "#3E5F7A", coiffe: "voile", coiffeCol: "#2E2A28", cheveux: "#2A1E16" },
    intro: "Kaliméra ! Je m'appelle Eleni. Je travaille dans les vignes d'un seigneur vénitien, près de Candie.",
    sujets: [
      ["À qui appartient la terre ?", "Aux colons vénitiens. La République a partagé l'île en domaines et les a donnés à des familles venues de Venise. Nous, les Grecs, nous cultivons leurs terres et nous leur devons une grande part des récoltes."],
      ["Que produisez-vous ?", "Du blé, qui part nourrir Venise et ses autres colonies ; du vin doux, la malvoisie, vendu dans tout l'Occident ; et du coton."],
      ["Les Crétois acceptent-ils les Vénitiens ?", "Pas toujours ! Nos maîtres sont catholiques, nous sommes orthodoxes, et ils ne parlent pas notre langue. Plusieurs fois déjà, des Crétois se sont révoltés contre Venise."]
    ],
    aurevoir: "Je retourne aux vendanges. Kalo taxidi : bon voyage !" },
  { id: "marco", port: "constantinople", nom: "Marco", role: "Bayle de Venise à Constantinople",
    look: { peau: "#E5BC98", habit: "#1E1B1A", col: "#A3201C", coiffe: "berret", coiffeCol: "#1E1B1A", cheveux: "#8C8A86", barbe: "#A8A5A0" },
    intro: "Bienvenue au quartier vénitien ! Je suis Marco, le bayle : je représente Venise auprès de l'empereur et je règle les affaires de nos marchands.",
    sujets: [
      ["Pourquoi les Vénitiens ont-ils un quartier ici ?", "En 1082, l'empereur byzantin avait besoin de notre flotte contre ses ennemis. En échange, il nous a donné un quartier au bord de la Corne d'Or et le droit de commercer sans payer de taxes."],
      ["Que s'est-il passé en 1204 ?", "Les croisés devaient une somme énorme à Venise pour leur transport. Un prétendant au trône byzantin leur a promis de l'argent : ils l'ont suivi jusqu'ici, puis ont pris et pillé la ville. Venise ne l'avait pas prévu, mais elle en a tiré un immense profit : des ports, des îles, la Crète…"],
      ["Qui sont ces marchands, en face ?", "Les Génois, nos grands rivaux ! Ils tiennent Péra, de l'autre côté de la Corne d'Or, et veulent nous chasser du commerce de la mer Noire."],
      ["L'Empire byzantin est-il encore puissant ?", "Plus vraiment. Il a perdu presque toutes ses provinces, et les Turcs avancent en Asie Mineure. Mais Constantinople reste un très grand marché."]
    ],
    aurevoir: "Fais attention aux Génois, et que Dieu te garde !" },
  { id: "niccolo", port: "alexandrie", nom: "Niccolò", role: "Consul des Vénitiens à Alexandrie",
    look: { peau: "#DDB08A", habit: "#6E2A3A", col: "#E3B341", coiffe: "berret", coiffeCol: "#2E2A28", cheveux: "#3A2A20" },
    intro: "Te voilà au fondouk des Vénitiens ! Je suis Niccolò, le consul : je parle au nom de nos marchands devant les officiers du sultan.",
    sujets: [
      ["Comment vit-on dans le fondouk ?", "Nous avons nos entrepôts, nos chambres, un four et une chapelle. Le jour, on commerce librement. Mais le soir, les gardes du sultan ferment nos portes de l'extérieur jusqu'au matin."],
      ["Le pape n'interdit-il pas ce commerce ?", "Le pape interdit de vendre aux musulmans du bois, du fer et des armes. Pendant des années, il a même interdit tout commerce avec l'Égypte. Venise a obtenu de lui des autorisations : sans Alexandrie, pas d'épices !"],
      ["Pourquoi le sultan accepte-t-il des chrétiens ?", "Parce que notre commerce l'enrichit ! Il prélève des taxes sur tout ce que nous achetons et vendons. Chrétiens ou musulmans, les marchands ont besoin les uns des autres."]
    ],
    aurevoir: "Achète tes épices avant les autres galères : les meilleurs lots partent vite !" },
  { id: "hasan", port: "alexandrie", nom: "Hasan", role: "Marchand d'épices égyptien",
    look: { peau: "#A87A52", habit: "#2F6B55", col: "#E3B341", coiffe: "turban", coiffeCol: "#F2EDE3", cheveux: "#1A1410", barbe: "#1A1410" },
    intro: "Salam, ami vénitien ! Je suis Hasan. Ma famille fait venir les épices des Indes depuis trois générations.",
    sujets: [
      ["D'où viennent tes épices ?", "Le poivre et le gingembre poussent en Inde, la cannelle à Ceylan, le clou de girofle encore plus loin, dans les îles d'Asie du Sud-Est. Des navires les apportent jusqu'à Aden, à l'entrée de la mer Rouge."],
      ["Comment arrivent-elles jusqu'ici ?", "D'Aden, on remonte la mer Rouge en bateau, puis des caravanes de chameaux traversent le désert jusqu'au Nil. Des barques descendent le fleuve jusqu'au Caire, puis jusqu'à Alexandrie. Le voyage dure des mois !"],
      ["Pourquoi sont-elles si chères ?", "À chaque étape, il faut payer les transporteurs, les taxes du sultan et les risques du voyage. Et en Occident, on les adore : pour la cuisine, les remèdes, les parfums !"]
    ],
    aurevoir: "Que Dieu te donne une bonne traversée !" },
  { id: "georges", port: "famagouste", nom: "Georges", role: "Marchand chrétien venu de Syrie",
    look: { peau: "#C08E66", habit: "#6A4A2E", col: "#C9962E", coiffe: "turban", coiffeCol: "#3A4D78", cheveux: "#1A1410", barbe: "#2A1E16" },
    intro: "Bienvenue à Famagouste, le port le plus riche d'Orient ! Je suis Georges, marchand chrétien venu de Syrie.",
    sujets: [
      ["Pourquoi tant de marchands ici ?", "Depuis que les musulmans ont repris Acre, la dernière ville des croisés, en 1291, les marchands chrétiens se sont repliés ici, tout près de la Syrie. Famagouste est devenue le grand marché entre l'Orient et l'Occident."],
      ["D'où vient la soie que tu vends ?", "De très loin à l'est : de Perse et même de Chine. Les caravanes suivent les routes de la soie à travers l'Asie jusqu'aux villes de Syrie. De là, des bateaux l'apportent ici."],
      ["Et les épices de Syrie ?", "Elles viennent d'Inde elles aussi, par la mer jusqu'au golfe Persique, puis par caravanes jusqu'à Damas et Alep. On les achète à Beyrouth et on les apporte ici."],
      ["Que produit Chypre ?", "Du sucre ! Dans de grands domaines, on cultive la canne à sucre et on la presse dans des moulins. Et près de Larnaca, un lac salé donne du sel en abondance."]
    ],
    aurevoir: "Salue Venise pour moi ! Qui sait, un jour Chypre sera peut-être à elle…" },
  { id: "hans", port: "retour", nom: "Hans", role: "Marchand allemand du Rialto",
    look: { peau: "#EBC6A6", habit: "#5A3A22", col: "#D8CBB0", coiffe: "toque", coiffeCol: "#2E2A28", cheveux: "#C9A060", barbe: "#C9A060" },
    intro: "Grüß Gott ! Je suis Hans, marchand de Nuremberg. J'habite au Fondaco dei Tedeschi, la maison des marchands allemands, au pied du pont du Rialto.",
    sujets: [
      ["Que fais-tu de mes épices ?", "Je les charge sur des mulets, je franchis les Alpes et je les revends en Allemagne et jusqu'en Flandre. Venise est la porte par où l'Orient entre en Europe !"],
      ["Que vends-tu aux Vénitiens ?", "L'argent et le cuivre de nos mines, des toiles, des objets en métal. Les Vénitiens les emportent ensuite vers l'Orient."],
      ["Pourquoi tout le monde accepte-t-il le ducat ?", "Parce qu'il est en or presque pur et garde toujours le même poids depuis 1284. On peut lui faire confiance : marchands et banquiers l'acceptent dans toute la Méditerranée et au-delà."]
    ],
    aurevoir: "Auf Wiedersehen ! Je dois préparer mes mulets pour les Alpes." }
];

/* Prix de vente au retour à Venise */
const RETOUR = {
  titre: "Retour au Rialto",
  texte: [
    "De retour au Rialto, tu revends ta cargaison. Venise revend dans tout l'Occident les produits venus d'Orient : acheter loin, transporter, revendre cher."
  ],
  vente: { epices: 72, soie: 56, sucre: 32, alun: 26, coton: 21, vin: 16, ble: 9, draps: 8, metaux: 10, verre: 6, boisfer: 5 },
  questions: ["q_ducat"]
};

/* Villes rivales ou étrangères, visibles mais pas accessibles */
const AUTRES_LIEUX = [
  { nom: "Gênes", lon: 8.93, lat: 44.41, drapeau: "genes", ville: "petite", note: "la grande rivale" },
  { nom: "Chio", lon: 26.14, lat: 38.37, drapeau: "genes", ville: "petite", note: "génoise" },
  { nom: "Caffa", lon: 35.38, lat: 45.03, drapeau: "genes", ville: "petite", note: "génoise" }
];

const REGIONS = [
  { nom: "OCCIDENT CHRÉTIEN", lon: 9.2, lat: 46.4, style: "occident" },
  { nom: "EMPIRE BYZANTIN", lon: 26.2, lat: 41.75, style: "byzance" },
  { nom: "SULTANAT MAMELOUK", lon: 31.6, lat: 29.6, style: "islam" },
  { nom: "TURCS", lon: 31.5, lat: 38.8, style: "islam" },
  { nom: "Mer Adriatique", lon: 15.2, lat: 43.1, style: "mer" },
  { nom: "Mer Égée", lon: 25.0, lat: 39.4, style: "mer" },
  { nom: "Mer Méditerranée", lon: 20.5, lat: 34.2, style: "mer" },
  { nom: "Mer Noire", lon: 32.5, lat: 43.3, style: "mer" }
];

/* ---------- Questions du carnet de bord ---------- */
const QUESTIONS = {
  q_sel: {
    q: "Sur quoi repose, à l'origine, la fortune de Venise ?",
    choix: ["Le sel de la lagune et les navires", "Les mines d'or de ses montagnes", "Le blé de ses grandes campagnes", "La soie de ses ateliers"],
    bonne: 0,
    exp: "Venise n'a presque pas de campagnes. Elle extrait le sel de la lagune et le transporte sur ses navires : « le sel et le navire sont les deux fondements de cette prospérité » (Doc. 1 A).",
    schema: "Le sel et le navire"
  },
  q_muraille: {
    q: "Venise n'a pas de muraille. Pourquoi n'en a-t-elle pas besoin ?",
    choix: ["La lagune et la flotte la protègent", "Personne ne veut l'attaquer", "Le pape interdit de l'attaquer", "Ses murailles ont été détruites en 1204"],
    bonne: 0,
    exp: "Une armée à pied ne peut pas traverser la lagune, et la flotte de guerre défend la ville depuis la mer (Doc. 4)."
  },
  q_stato: {
    q: "Raguse fait partie des ports et territoires que Venise contrôle outre-mer. Comment appelle-t-on cet ensemble ?",
    choix: ["La Terre Ferme", "Le Stato da Mar (« État de mer »)", "Le fondouk", "Le califat"],
    bonne: 1,
    exp: "Le Stato da Mar regroupe les ports, les îles et les territoires vénitiens outre-mer. La Terre Ferme, elle, désigne les conquêtes de Venise en Italie au XVe siècle."
  },
  q_modon: {
    q: "Modon et Coron sont « les yeux de la République ». À quoi servent-elles ?",
    choix: ["À produire du sel pour Venise", "À loger le doge en été", "À ravitailler et protéger les galères, et à recueillir les nouvelles", "À surveiller la frontière avec l'Allemagne"],
    bonne: 2,
    exp: "Toutes les galères y font escale : eau, vivres, réparations, nouvelles des pirates et des Génois. Venise les tient depuis 1207, grâce au partage de l'Empire byzantin après la 4e croisade."
  },
  q_colonie: {
    q: "La Crète est une colonie d'exploitation. Qu'est-ce que cela signifie ?",
    choix: ["Les Crétois sont des marchands associés à Venise", "Venise domine l'île et exploite ses productions (blé, vin, coton)", "L'île est un simple entrepôt dans un port étranger", "Venise loue l'île chaque année au sultan"],
    bonne: 1,
    exp: "La Crète, « acquise contre de l'argent » après 1204, est gouvernée par un duc vénitien. Ses productions (blé, vin, coton) profitent à Venise et à ses colonies (Doc. 1 C et D)."
  },
  q_1204: {
    q: "Quel événement de 1204 donne à Venise l'essentiel de son empire (« le quart et demi de l'Empire byzantin ») ?",
    choix: ["La prise de Jérusalem par Saladin", "Le schisme entre Rome et Constantinople", "La prise de Constantinople par les Turcs", "La 4e croisade, qui prend et pille Constantinople"],
    bonne: 3,
    exp: "Attention : les croisés n'ont pas attaqué « pour le compte de Venise ». Endettés envers elle pour leur transport et trompés par les promesses d'un prétendant byzantin, ils se détournent sur Constantinople. Venise en tire un immense profit, sans l'avoir planifié (Doc. 1 C)."
  },
  q_fondouk: {
    q: "Tu loges dans le fondouk des Vénitiens. Qu'est-ce qu'un fondouk ?",
    choix: ["Une galère de guerre", "Une monnaie d'or musulmane", "Un bâtiment où les marchands étrangers logent, stockent et vendent leurs marchandises", "Une colonie peuplée de Vénitiens"],
    bonne: 2,
    exp: "Dans leurs fondouks (comptoirs), les Vénitiens « jouissent de la liberté de commerce » (Doc. 1 C), sous l'autorité de leur consul. Ce n'est pas une colonie : la ville reste au sultan."
  },
  q_intermediaire: {
    q: "Venise commerce avec les musulmans d'Égypte, alors que les croisades ont opposé chrétiens et musulmans. Que montre ce commerce ?",
    choix: ["Le commerce continue de relier les trois mondes, même en temps de guerre", "Venise s'est convertie à l'islam", "Le pape encourage ce commerce", "Le sultan est un allié militaire de Venise"],
    bonne: 0,
    exp: "« Venise a toujours été un intermédiaire entre de grandes puissances » (Doc. 1 B) : Carolingiens, Byzantins, musulmans, puis Turcs. Le commerce passe par-dessus les guerres de religion."
  },
  q_origine: {
    q: "D'où viennent les épices et la soie qui arrivent dans les ports de Méditerranée ?",
    choix: ["D'Afrique de l'Ouest, par le Sahara", "D'Asie (Inde, Chine), par la mer Rouge et les routes des caravanes", "Des îles de la mer Égée", "D'Amérique"],
    bonne: 1,
    exp: "Épices et soie viennent de très loin : d'Inde, d'Asie du Sud-Est, de Chine. Des marchands arabes, persans ou indiens les acheminent jusqu'aux ports d'Égypte et de Syrie, où les Vénitiens les achètent."
  },
  q_ducat: {
    q: "Tu es payé en ducats d'or. Sur le ducat, saint Marc remet l'étendard au doge ; au revers figure le Christ. Pourquoi une cité marchande met-elle des images religieuses sur sa monnaie ?",
    choix: ["Parce que le pape frappe la monnaie de Venise", "Pour placer Venise sous la protection de Dieu et de son saint patron, et inspirer confiance", "Pour qu'on ne puisse la dépenser que dans les églises", "Parce que les marchands musulmans refusent les autres monnaies"],
    bonne: 1,
    exp: "Le doge tient son pouvoir de saint Marc, patron de la ville. Frappé en or pur depuis 1284, toujours au même poids (3,5 g), le ducat inspire confiance dans toute la Méditerranée (Doc. 3)."
  }
};

/* ---------- Événements en mer ---------- */
const EVENEMENTS = {
  genes: {
    titre: "Des voiles génoises à l'horizon !",
    texte: "Gênes, rivale de Venise depuis le XIe siècle, lui dispute le commerce de l'Orient. La guerre vient de reprendre (1350). Des galères génoises approchent.",
    choix: [
      { label: "Rester groupés avec les galères du convoi", effet: { jours: 3 }, resultat: "Les Génois n'osent pas attaquer un convoi bien armé. Tu as perdu 3 jours, mais ta cargaison est intacte." },
      { label: "Filer seul pour arriver plus vite", hasard: [
        { effet: { perteBallots: 3 }, resultat: "Les Génois te rattrapent et pillent 3 ballots de ta cargaison !" },
        { effet: {}, resultat: "Tu leur échappes de justesse. Tu as eu de la chance…" }
      ] }
    ],
    aRetenir: "Pour se protéger, Venise fait naviguer ses galères de commerce en convois, organisés par l'État. Et c'est grâce à sa flotte qu'elle finira par l'emporter sur Gênes (Doc. 1 E)."
  },
  tempete: {
    titre: "Tempête au cap Malée",
    texte: "Au sud de la Grèce, le cap Malée est redouté des marins. Le vent se lève, la galère trop chargée embarque de l'eau.",
    choix: [
      { label: "Jeter 2 ballots à la mer pour alléger la galère", effet: { perteBallots: 2 }, resultat: "La galère, allégée, passe le cap. Deux ballots sont perdus." },
      { label: "S'abriter dans une crique et attendre", effet: { jours: 5 }, resultat: "Tu perds 5 jours, mais tu repars sans dommage." }
    ],
    aRetenir: "Les galères naviguent en longeant les côtes et font souvent escale : c'est pourquoi Venise a besoin de ports sûrs tout le long de ses routes."
  },
  contrebande: {
    titre: "Contrebande découverte",
    texte: "Les magistrats de Venise ont appris que tu as vendu du bois et du fer aux musulmans d'Alexandrie. La République, qui négocie avec le pape le droit de commercer en Égypte, ne peut pas fermer les yeux.",
    amende: 120,
    resultat: "Tu paies une amende de 120 ducats.",
    impuni: "Personne ne l'a su… cette fois. Mais les papes interdisent ce commerce depuis le XIIe siècle, et Venise punit les contrebandiers.",
    aRetenir: "Même en guerre contre les musulmans, les Occidentaux commercent avec eux : le pape doit sans cesse répéter l'interdiction… preuve qu'elle n'est pas toujours respectée."
  }
};

/* ---------- Et après ? Venise face aux menaces ---------- */
const CHRONIQUE = [
  { date: "1378-1381", titre: "La guerre de Chioggia", lon: 12.28, lat: 45.22, effet: "chioggia",
    texte: "La flotte de Gênes entre dans la lagune et prend Chioggia, aux portes de Venise. Assiégée, Venise l'emporte finalement grâce à sa flotte (Doc. 1 E).",
    reponse: "menace" },
  { date: "1404-1428", titre: "La conquête de la Terre Ferme", lon: 11.4, lat: 45.6, effet: "terreFerme",
    texte: "Venise conquiert Vicence, Padoue et Vérone (1404-1405), le Frioul (1420), puis Brescia et Bergame (1426-1428). Sa puissance n'est plus seulement maritime.",
    reponse: "atout" },
  { date: "1453", titre: "Les Ottomans prennent Constantinople", lon: 28.975, lat: 41.01, effet: "ottomansConstantinople",
    texte: "Le sultan ottoman Mehmed II s'empare de Constantinople : c'est la fin de l'Empire byzantin. Dès 1454, Venise signe un traité avec lui pour continuer à commercer (Doc. 1 B).",
    reponse: "menace" },
  { date: "1489", titre: "Chypre devient vénitienne", lon: 33.4, lat: 35.1, effet: "chypre",
    texte: "La reine de Chypre, la Vénitienne Catherine Cornaro, cède son royaume à la République. Venise contrôle désormais le sucre et le sel de l'île.",
    reponse: "atout" },
  { date: "1498", titre: "Vasco de Gama atteint l'Inde", lon: 32.5, lat: 29.8, effet: "gama",
    texte: "Le Portugais Vasco de Gama atteint l'Inde en contournant l'Afrique. Les épices peuvent désormais arriver en Europe sans passer par la Méditerranée ni par Venise.",
    reponse: "menace" },
  { date: "1500", titre: "Modon et Coron tombent", lon: 21.705, lat: 36.816, effet: "ottomansModon",
    texte: "Les Ottomans prennent Modon et Coron, « les yeux de la République ». Le Stato da Mar recule face à la puissance turque.",
    reponse: "menace" }
];

/* ---------- Schéma final ---------- */
const SCHEMA = {
  titre: "La puissance vénitienne (XIIe-XVe siècle)",
  cases: [
    { id: "fond", titre: "Les fondements", sous: "le site et les ressources de départ" },
    { id: "possessions", titre: "Les possessions", sous: "Stato da Mar et Terre Ferme" },
    { id: "commerce", titre: "Un intermédiaire entre trois mondes", sous: "produits et partenaires" },
    { id: "outils", titre: "Les instruments de la puissance", sous: "monnaie, flotte, privilèges" },
    { id: "menaces", titre: "Les menaces", sous: "rivaux et concurrents" }
  ],
  elements: [
    { id: "sel", texte: "Le sel de la lagune", cases: ["fond"] },
    { id: "navire", texte: "Le navire", cases: ["fond", "outils"] },
    { id: "lagune", texte: "Une ville sans muraille, protégée par la lagune", cases: ["fond"] },
    { id: "fondouks", texte: "Les fondouks d'Alexandrie et de Constantinople", cases: ["possessions", "commerce"] },
    { id: "crete", texte: "La Crète, colonie d'exploitation", cases: ["possessions"] },
    { id: "modon", texte: "Modon et Coron, escales fortifiées", cases: ["possessions"] },
    { id: "chypre", texte: "Chypre (1489)", cases: ["possessions"] },
    { id: "terreferme", texte: "La Terre Ferme (XVe s.)", cases: ["possessions"] },
    { id: "epices", texte: "Épices et soieries d'Orient", cases: ["commerce"] },
    { id: "draps", texte: "Draps et métaux d'Occident", cases: ["commerce"] },
    { id: "partenaires", texte: "Byzantins, Mamelouks, puis Ottomans", cases: ["commerce"] },
    { id: "ducat", texte: "Le ducat d'or (1284)", cases: ["outils"] },
    { id: "flotte", texte: "L'Arsenal et les convois de galères", cases: ["outils"] },
    { id: "privileges", texte: "Les privilèges obtenus de Byzance (1082)", cases: ["outils", "commerce"] },
    { id: "genes", texte: "Gênes, la rivale", cases: ["menaces"] },
    { id: "ottomans", texte: "Les Turcs ottomans (1453, 1500)", cases: ["menaces"] },
    { id: "gama", texte: "La route portugaise des Indes (1498)", cases: ["menaces"] }
  ]
};

const REDACTION = {
  consigne: "Réponds à la question de départ en quelques phrases.",
  aide: ["sel", "navire", "Stato da Mar", "colonie", "fondouk", "ducat", "intermédiaire", "Gênes", "Ottomans"]
};

/* ---------- Routes maritimes ----------
   Générées automatiquement à partir du trait de côte (recherche d'un chemin en mer) — ne pas modifier à la main.
   Coordonnées projetées, comme dans terre.js. */
const ROUTES = {"venise-raguse":[[-6.923,-7.095],[-3.506,-4.185],[-2.517,-4.365]],"raguse-modon":[[-2.517,-4.365],[-0.208,1.425],[0.334,1.485]],"modon-candie":[[0.334,1.485],[1.535,2.325],[3.067,2.775],[3.067,2.835]],"modon-constantinople":[[0.334,1.485],[1.441,2.265],[2.383,0.495],[2.619,0.315],[2.949,-0.225],[3.703,-1.725],[3.962,-1.815],[4.339,-2.205],[4.787,-2.355],[4.975,-2.535],[6.035,-2.625],[6.082,-2.745]],"candie-alexandrie":[[3.067,2.835],[4.127,2.865],[6.742,7.005]],"candie-famagouste":[[3.067,2.835],[4.15,2.865],[5.988,3.615],[9.852,3.795],[10.182,3.255],[10.017,3.105],[9.993,3.105]],"candie-constantinople":[[3.067,2.835],[3.42,1.725],[3.514,0.795],[3.538,-1.545],[3.891,-1.785],[4.362,-2.205],[4.81,-2.385],[4.999,-2.535],[6.035,-2.625],[6.082,-2.745]],"alexandrie-famagouste":[[6.742,7.005],[10.182,3.255],[10.017,3.105],[9.993,3.105]],"famagouste-constantinople":[[9.993,3.105],[10.135,3.165],[10.182,3.375],[8.768,3.945],[4.857,2.325],[3.467,0.525],[3.561,-1.575],[3.891,-1.785],[4.362,-2.205],[4.81,-2.385],[4.999,-2.535],[6.035,-2.625],[6.082,-2.745]]};

/* Événements déclenchés au milieu de certaines traversées (une seule fois chacun) */
const EVENEMENTS_ROUTES = {
  tempete: ["modon-candie", "modon-constantinople"],
  genes: ["candie-constantinople", "modon-constantinople", "famagouste-constantinople", "candie-famagouste"]
};
