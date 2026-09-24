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
      "Venise est bâtie sur une centaine d'îles, au milieu d'une lagune. Elle n'a presque pas de campagnes, mais elle extrait le sel de la lagune et possède une grande flotte.",
      "Regarde bien : aucune muraille autour de la ville. Dans l'Arsenal, le chantier naval de l'État, on construit les galères. Le doge, élu à vie, dirige la République avec les grandes familles de marchands."
    ],
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
      "Raguse (aujourd'hui Dubrovnik) vit sous l'autorité de Venise, qui y nomme le gouverneur. Les galères longent cette côte d'escale en escale avant de traverser vers la Grèce.",
      "Ces ports, ces îles et ces territoires tenus par Venise outre-mer forment une longue chaîne le long des routes maritimes."
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
      "Au sud-ouest de la Grèce, Modon et sa voisine Coron appartiennent à Venise depuis 1207, après la quatrième croisade.",
      "Toutes les galères y font escale : on y prend de l'eau et des vivres, on répare les navires, on apprend les nouvelles. On les appelle « les yeux de la République »."
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
      "Venise a acheté la Crète en 1204, puis l'a conquise ; elle la gouverne par un « duc ». Les paysans grecs de l'île y cultivent le blé, la vigne et le coton pour Venise.",
      "Le blé crétois nourrit Venise et ses autres colonies ; son vin doux est vendu dans tout l'Occident."
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
      "La ville reste immense, mais l'Empire byzantin est très affaibli. Depuis 1082, l'empereur accorde aux Vénitiens un quartier au bord de la Corne d'Or et les dispense de taxes.",
      "En face, de l'autre côté de la Corne d'Or, les Génois, grands rivaux de Venise, tiennent le quartier de Péra."
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
      "L'Égypte est gouvernée par les sultans mamelouks, musulmans. Les épices d'Inde arrivent par la mer Rouge, puis par le Nil jusqu'à Alexandrie.",
      "Les Vénitiens logent dans leurs fondouks, dirigés par un consul. La nuit, les gardes du sultan en ferment les portes de l'extérieur."
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
      "Chypre est un royaume chrétien, gouverné par la famille franque des Lusignan. Depuis la chute d'Acre, dernière ville des croisés (1291), Famagouste est le grand marché des Occidentaux en Orient.",
      "On y trouve le coton et les épices de Syrie, et le sucre de l'île. Chypre deviendra vénitienne en 1489."
    ],
    notion: ["Canne à sucre", "cultivée à Chypre dans de grands domaines ; des familles vénitiennes, comme les Cornaro, en posséderont bientôt."],
    questions: ["q_origine"],
    marcheTitre: "Marché de Famagouste",
    achat: { sucre: 12, coton: 8, epices: 38 },
    vente: { draps: 18, metaux: 20, verre: 15, ble: 9 }
  }
};

/* Prix de vente au retour à Venise */
const RETOUR = {
  titre: "Retour au Rialto",
  texte: [
    "Les marchands allemands et italiens t'attendent : Venise revend dans tout l'Occident les produits venus d'Orient.",
    "C'est le cœur de sa richesse : acheter loin, transporter sur ses navires, revendre cher."
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
