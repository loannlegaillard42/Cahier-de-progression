/* Fiches de révision — histoire-géographie
   Une entrée par chapitre, reprise des cours (fiches objectifs, traces écrites, fiches résumé).
   C'est la source de la boîte à outils des élèves (reviser.html) : chaque outil se construit
   à partir de ces champs, et n'apparaît que si le chapitre a de quoi le remplir.

   Champs d'un chapitre :
     id          identifiant court, utilisé dans les liens (reviser.html#/5e-h1-c1)
     n, d        niveau ("5e", "2nde", "1ere") et discipline ("histoire", "geo")
     theme       thème du programme
     rituel      thème correspondant dans la banque des rituels (questions.js), pour en reprendre les questions
     num, titre  « Chapitre 1 », intitulé du chapitre
     question    question de départ / problématique
     plan        grandes parties
     cle         la phrase à retenir
     essentiel   l'essentiel du cours, en quelques phrases
     periodes    bandes de la frise : { de, a, nom, court?, detail? } — court : libellé raccourci sur la frise
     reperes     dates : { a, b?, date, txt } — a / b : année (négative avant J.-C.) ou "AAAA-MM-JJ"
     notions     { mot, def }
     personnages { nom, dates, txt: [indices, du plus vague au plus précis — sans le nom] }
     lieux       { nom, txt }
     trous       textes à compléter : { titre, texte } — les mots entre [crochets] sont à retrouver
     capable     « Je suis capable de… » */

/* Plan de l'année, classe par classe, dans l'ordre de la progression.
   Chaque chapitre qui a une fiche (« fiche » = identifiant d'un chapitre de COURS ci-dessous)
   s'ouvre dans la boîte à outils ; les autres s'affichent « à venir », en attendant d'être remplis. */
const CLASSES = [
  { id: "5e", nom: "5e", annee: [
    { d: "histoire", theme: "Thème 1 · Chrétientés et islam (VIᵉ-XIIIᵉ siècle), des mondes en contact", chapitres: [
      { num: "Chapitre 1", titre: "Byzance et l'Europe carolingienne", fiche: "5e-h1-c1" },
      { num: "Chapitre 2", titre: "De la naissance de l'islam à la prise de Bagdad par les Mongols", fiche: "5e-h1-c2" }
    ] },
    { d: "histoire", theme: "Thème 2 · Société, Église et pouvoir politique dans l'Occident féodal (XIᵉ-XVᵉ siècle)", chapitres: [
      { num: "Chapitre 3", titre: "L'ordre seigneurial : la formation et la domination des campagnes" },
      { num: "Chapitre 4", titre: "L'émergence d'une nouvelle société urbaine" },
      { num: "Chapitre 5", titre: "L'affirmation de l'État monarchique dans le royaume des Capétiens et des Valois" }
    ] },
    { d: "histoire", theme: "Thème 3 · Transformations de l'Europe et ouverture sur le monde aux XVIᵉ et XVIIᵉ siècles", chapitres: [
      { num: "Chapitre 6", titre: "Le monde au temps de Charles Quint et Soliman le Magnifique" },
      { num: "Chapitre 7", titre: "Humanisme, réformes et conflits religieux" },
      { num: "Chapitre 8", titre: "Du Prince de la Renaissance au roi absolu" }
    ] },
    { d: "geo", theme: "Thème 1 · La question démographique et l'inégal développement", chapitres: [
      { num: "Chapitre 1", titre: "La croissance démographique et ses effets" },
      { num: "Chapitre 2", titre: "Répartition de la richesse et de la pauvreté dans le monde" }
    ] },
    { d: "geo", theme: "Thème 2 · Des ressources limitées, à gérer et à renouveler", chapitres: [
      { num: "Chapitre 3", titre: "L'énergie, l'eau : des ressources à ménager et à mieux utiliser" },
      { num: "Chapitre 4", titre: "L'alimentation : comment nourrir une humanité en croissance démographique et aux besoins alimentaires accrus ?" }
    ] },
    { d: "geo", theme: "Thème 3 · Prévenir les risques, s'adapter au changement global", chapitres: [
      { num: "Chapitre 5", titre: "Le changement global et ses principaux effets géographiques régionaux" },
      { num: "Chapitre 6", titre: "Prévenir les risques industriels et technologiques" }
    ] }
  ] },

  { id: "2nde", nom: "Seconde", annee: [
    { d: "histoire", theme: "Introduction", chapitres: [
      { num: "Introduction", titre: "La périodisation" }
    ] },
    { d: "histoire", theme: "Thème 1 · Le monde méditerranéen : empreintes de l'Antiquité et du Moyen Âge", chapitres: [
      { num: "Chapitre 1", titre: "La Méditerranée antique : les empreintes grecques et romaines", fiche: "2de-h1-c1" },
      { num: "Chapitre 2", titre: "La Méditerranée médiévale : espace d'échanges et de conflits à la croisée de trois civilisations", fiche: "2de-h1-c2" }
    ] },
    { d: "histoire", theme: "Thème 2 · XVᵉ-XVIᵉ siècles : un nouveau rapport au monde, un temps de mutation intellectuelle", chapitres: [
      { num: "Chapitre 3", titre: "L'ouverture atlantique : les conséquences de la découverte du « Nouveau Monde »" },
      { num: "Chapitre 4", titre: "Renaissance, Humanisme et réformes religieuses : les mutations de l'Europe" }
    ] },
    { d: "histoire", theme: "Thème 3 · L'État à l'époque moderne : France et Angleterre", chapitres: [
      { num: "Chapitre 5", titre: "L'affirmation de l'État dans le royaume de France" },
      { num: "Chapitre 6", titre: "Le modèle britannique et son influence" }
    ] },
    { d: "histoire", theme: "Thème 4 · Dynamiques et ruptures dans les sociétés des XVIIᵉ et XVIIIᵉ siècles", chapitres: [
      { num: "Chapitre 7", titre: "Les Lumières et le développement des sciences" },
      { num: "Chapitre 8", titre: "Tensions, mutations et crispations de la société d'ordres" }
    ] },
    { d: "geo", theme: "Thème 1 · Sociétés et environnements : des équilibres fragiles", chapitres: [
      { num: "Chapitres 1 et 2", titre: "Les sociétés face aux risques ; des ressources majeures sous pression", fiche: "2de-g1-c12" },
      { num: "Chapitre 3", titre: "La France : des milieux métropolitains et ultramarins entre valorisation et protection", fiche: "2de-g1-c3" }
    ] },
    { d: "geo", theme: "Thème 2 · Territoires, populations et développement : quels défis ?", chapitres: [
      { num: "Question 1", titre: "Des trajectoires démographiques différenciées : les défis du nombre et du vieillissement" },
      { num: "Question 2", titre: "Développement et inégalités" },
      { num: "Question spécifique", titre: "La France : dynamiques démographiques et inégalités socio-économiques" }
    ] },
    { d: "geo", theme: "Thème 3 · Des mobilités généralisées", chapitres: [
      { num: "Question 1", titre: "Les migrations internationales" },
      { num: "Question 2", titre: "Les mobilités touristiques internationales" },
      { num: "Question spécifique", titre: "La France : mobilités, transports et enjeux d'aménagement" }
    ] },
    { d: "geo", theme: "Thème 4 · Thème conclusif", chapitres: [
      { num: "Thème conclusif", titre: "L'Afrique australe : un espace en profonde mutation" }
    ] }
  ] },

  { id: "1ere", nom: "Première", annee: [
    { d: "histoire", theme: "Thème 1 · L'Europe face aux révolutions", chapitres: [
      { num: "Chapitre 1", titre: "La Révolution française et l'Empire : une nouvelle conception de la nation", fiche: "1re-h1-c1" },
      { num: "Chapitre 2", titre: "L'Europe entre restauration et révolution (1814-1848)", fiche: "1re-h1-c2" }
    ] },
    { d: "histoire", theme: "Thème 2 · La France dans l'Europe des nationalités : politique et société (1848-1871)", chapitres: [
      { num: "Chapitre 3", titre: "La difficile entrée dans l'âge démocratique : la Deuxième République et le Second Empire" },
      { num: "Chapitre 4", titre: "L'industrialisation et l'accélération des transformations économiques et sociales en France" },
      { num: "Chapitre 5", titre: "La France et la construction de nouveaux États par la guerre et la diplomatie" }
    ] },
    { d: "histoire", theme: "Thème 3 · La Troisième République avant 1914 : un régime politique, un empire colonial", chapitres: [
      { num: "Chapitre 6", titre: "La mise en œuvre du projet républicain" },
      { num: "Chapitre 7", titre: "Permanences et mutations de la société française jusqu'en 1914" },
      { num: "Chapitre 8", titre: "Métropole et colonies" }
    ] },
    { d: "histoire", theme: "Thème 4 · La Première Guerre mondiale : le « suicide de l'Europe » et la fin des empires européens", chapitres: [
      { num: "Chapitre 9", titre: "Un embrasement mondial et ses grandes étapes" },
      { num: "Chapitre 10", titre: "Les sociétés en guerre : des civils acteurs et victimes de la guerre" },
      { num: "Chapitre 11", titre: "Sortir de la guerre : la tentative de construction d'un ordre des nations démocratiques" }
    ] },
    { d: "geo", theme: "Thème 1 · La métropolisation : un processus mondial différencié", chapitres: [
      { num: "Question 1", titre: "Les villes à l'échelle mondiale : le poids croissant des métropoles" },
      { num: "Question 2", titre: "Des métropoles inégales et en mutation" },
      { num: "Question spécifique", titre: "La France : la métropolisation et ses effets" }
    ] },
    { d: "geo", theme: "Thème 2 · Une diversification des espaces et des acteurs de la production", chapitres: [
      { num: "Question 1", titre: "Les espaces de production dans le monde : une diversité croissante" },
      { num: "Question 2", titre: "Métropolisation, littoralisation des espaces productifs et accroissement des flux" },
      { num: "Question spécifique", titre: "La France : les systèmes productifs entre valorisation locale et intégration européenne et mondiale" }
    ] },
    { d: "geo", theme: "Thème 3 · Les espaces ruraux : multifonctionnalité ou fragmentation ?", chapitres: [
      { num: "Question 1", titre: "La fragmentation des espaces ruraux" },
      { num: "Question 2", titre: "Affirmation des fonctions non agricoles et conflits d'usages" },
      { num: "Question spécifique", titre: "La France : des espaces ruraux multifonctionnels, entre initiatives locales et politiques européennes" }
    ] },
    { d: "geo", theme: "Thème 4 · Thème conclusif", chapitres: [
      { num: "Thème conclusif", titre: "La Chine : des recompositions spatiales multiples" }
    ] }
  ] }
];

const COURS = [

  /* =====================================================================
     5e — HISTOIRE — Thème 1, chapitre 1
     ===================================================================== */
  {
    id: "5e-h1-c1", n: "5e", d: "histoire",
    theme: "Chrétientés et islam (VIᵉ-XIIIᵉ siècle), des mondes en contact",
    rituel: "Chrétientés et islam (VIe-XIIIe s.)",
    num: "Chapitre 1",
    titre: "Byzance et l'Europe carolingienne",
    question: "Comment naissent et évoluent les empires chrétiens byzantin et carolingien ?",
    plan: [
      "Deux empires chrétiens : l'Empire byzantin et l'Empire carolingien",
      "Une religion chrétienne, deux Églises"
    ],
    cle: "Les deux empires se disent héritiers de Rome et sont chrétiens, mais l'un dure plus de mille ans et l'autre moins de cinquante.",
    essentiel: [
      "En 395, l'Empire romain est partagé en deux. L'Empire d'Occident disparaît en 476, envahi par les peuples barbares. L'Empire d'Orient survit : c'est l'Empire byzantin.",
      "L'empereur byzantin, le basileus, est chef de l'État et de l'armée ; il est considéré comme l'élu de Dieu. Justinien (527-565) agrandit l'Empire et impose le Code Justinien. L'Empire recule ensuite et disparaît en 1453.",
      "En 800, Charlemagne, roi des Francs, est sacré empereur par le pape. Il gouverne depuis Aix-la-Chapelle avec les comtes, surveillés par les missi dominici. En 843, le traité de Verdun partage l'Empire entre ses trois petits-fils.",
      "Les deux Églises ne pratiquent pas le christianisme de la même façon. En 1054, le pape et le patriarche s'excluent : c'est le schisme. En 1204, le pillage de Constantinople par les croisés rend la séparation définitive : Église catholique à l'ouest, Église orthodoxe à l'est."
    ],
    periodes: [
      { de: 395, a: 1453, nom: "Empire byzantin" },
      { de: 800, a: 843, nom: "Empire carolingien" }
    ],
    reperes: [
      { a: 395, date: "395", txt: "L'Empire romain est partagé en deux : Occident et Orient." },
      { a: 476, date: "476", txt: "Fin de l'Empire romain d'Occident. C'est la fin de l'Antiquité." },
      { a: 527, b: 565, date: "527-565", txt: "Règne de Justinien, l'empereur byzantin le plus puissant." },
      { a: 800, date: "800", txt: "Charlemagne est couronné empereur par le pape." },
      { a: 843, date: "843", txt: "Traité de Verdun : l'Empire carolingien est partagé entre les 3 petits-fils de Charlemagne." },
      { a: 1054, date: "1054", txt: "Schisme d'Orient : catholiques et orthodoxes se séparent." },
      { a: 1204, date: "1204", txt: "Des croisés pillent Constantinople : la rupture devient définitive." },
      { a: 1453, date: "1453", txt: "Les Turcs prennent Constantinople : fin de l'Empire byzantin." }
    ],
    notions: [
      { mot: "Empire", def: "Vaste État regroupant plusieurs peuples ou territoires sous l'autorité d'un empereur." },
      { mot: "Empereur", def: "Chef d'un empire." },
      { mot: "Basileus", def: "« Roi » en grec : titre de l'empereur byzantin." },
      { mot: "Chrétienté", def: "Ensemble des populations et des États qui pratiquent la religion chrétienne." },
      { mot: "Pape", def: "Chef de l'Église catholique, à Rome." },
      { mot: "Patriarche", def: "Chef de l'Église orthodoxe, à Constantinople. Il n'est pas soumis au pape." },
      { mot: "Catholique", def: "Chrétien d'Occident, qui reconnaît l'autorité du pape." },
      { mot: "Orthodoxe", def: "Chrétien d'Orient, qui reconnaît l'autorité du patriarche." },
      { mot: "Schisme", def: "Rupture, séparation durable à l'intérieur d'une religion." },
      { mot: "Comte", def: "Personne nommée par l'empereur pour diriger une parcelle de territoire (un comté) en son nom." },
      { mot: "Missi dominici", def: "« Envoyés du maître » : représentants de l'empereur qui circulent dans l'Empire pour vérifier que ses lois sont appliquées." },
      { mot: "Invasions barbares", def: "Arrivée, sur le territoire de l'Empire romain, de peuples venus d'au-delà de ses frontières (Francs, Wisigoths, Vandales…)." }
    ],
    personnages: [
      { nom: "Justinien", dates: "empereur de 527 à 565", txt: [
        "Empereur de l'Empire romain d'Orient au VIᵉ siècle.",
        "Il veut rétablir la puissance de l'ancien Empire romain et l'agrandit par des conquêtes.",
        "Une mosaïque de Ravenne le montre entouré de soldats, de prêtres et de fonctionnaires.",
        "Il fait rassembler les lois des anciens empereurs dans un code qui porte son nom."
      ] },
      { nom: "Charlemagne", dates: "empereur de 800 à 814", txt: [
        "Roi des Francs, il fait des conquêtes en Germanie, en Italie et en Espagne.",
        "Il gouverne depuis Aix-la-Chapelle avec des comtes, surveillés par les missi dominici.",
        "Il crée des écoles pour former des religieux et des fonctionnaires.",
        "Le 25 décembre 800, le pape le couronne empereur à Rome."
      ] }
    ],
    lieux: [
      { nom: "Constantinople", txt: "Capitale de l'Empire byzantin, protégée par la mer et de puissantes murailles. Ancien nom : Byzance." },
      { nom: "Aix-la-Chapelle", txt: "Capitale de l'Empire carolingien, où se trouve le palais de Charlemagne." },
      { nom: "Rome", txt: "Ville du pape, chef de l'Église catholique ; Charlemagne y est couronné en 800." },
      { nom: "Ravenne", txt: "Ville d'Italie, capitale de l'Empire romain d'Occident à sa fin ; on y voit la mosaïque de Justinien." }
    ],
    trous: [
      { titre: "La fin de l'Empire romain", texte: "En [395], l'Empire romain est partagé en deux : l'Occident et l'Orient. Au Vᵉ siècle, des peuples [barbares] envahissent l'Occident et y fondent leurs royaumes. En [476], l'Empire romain d'Occident disparaît. L'Empire romain d'Orient, protégé par sa capitale [Constantinople], survit : il prendra le nom d'Empire byzantin." },
      { titre: "Deux empires chrétiens", texte: "Au VIᵉ siècle, l'empereur [Justinien] agrandit l'Empire byzantin et y impose les lois romaines. L'empereur byzantin, le [basileus], est considéré comme l'élu de Dieu. En [800], Charlemagne est sacré empereur par le pape. Il gouverne depuis [Aix-la-Chapelle] avec l'aide des [comtes], surveillés par les [missi dominici]. En 843, le traité de [Verdun] partage son empire." },
      { titre: "Une religion, deux Églises", texte: "En Occident, l'Église est dirigée par le [pape], à Rome ; en Orient, par le [patriarche], à Constantinople. En [1054], les deux chefs s'excluent l'un l'autre : c'est le [schisme] d'Orient. En [1204], des croisés venus d'Occident pillent Constantinople : la séparation devient définitive." }
    ],
    capable: [
      "Placer les 8 dates du chapitre sur une frise.",
      "Expliquer ce qui se passe en 395, en 476 et en 800.",
      "Dire ce qu'est un empire et qui est à sa tête.",
      "Expliquer pourquoi les deux empereurs se disent héritiers de Rome.",
      "Expliquer comment le basileus gouverne son empire.",
      "Expliquer comment Charlemagne administre le sien (comtes, missi dominici).",
      "Lire une carte et dire si un empire grandit ou recule.",
      "Donner deux différences entre catholiques et orthodoxes.",
      "Expliquer ce qu'est le schisme de 1054.",
      "Utiliser correctement les 12 mots du vocabulaire.",
      "Répondre à la question de départ du chapitre."
    ]
  },

  /* =====================================================================
     5e — HISTOIRE — Thème 1, chapitre 2
     ===================================================================== */
  {
    id: "5e-h1-c2", n: "5e", d: "histoire",
    theme: "Chrétientés et islam (VIᵉ-XIIIᵉ siècle), des mondes en contact",
    rituel: "Chrétientés et islam (VIe-XIIIe s.)",
    num: "Chapitre 2",
    titre: "De la naissance de l'islam à la prise de Bagdad",
    question: "Comment l'islam est-il né et comment un vaste empire s'est-il construit autour de la Méditerranée ?",
    plan: [
      "Naissance de l'islam et construction d'un empire",
      "Une religion et ses pratiques",
      "Sociétés et cultures en contact"
    ],
    cle: "Né au VIIᵉ siècle en Arabie, l'islam est à l'origine d'un immense empire dirigé par les califes, où se rencontrent des peuples, des religions et des savoirs.",
    essentiel: [
      "Selon la tradition musulmane, Mahomet, marchand de La Mecque, prêche un dieu unique. En 622, il part pour Médine : c'est l'Hégire, l'an 1 du calendrier musulman.",
      "Après sa mort en 632, ses successeurs, les califes, conquièrent un immense empire. Les Omeyyades gouvernent depuis Damas (661), puis les Abbassides depuis Bagdad, fondée en 762.",
      "L'empire se divise : politiquement, avec plusieurs califats (Bagdad, Cordoue, Le Caire) ; religieusement, entre sunnites et chiites.",
      "Les musulmans suivent le Coran et les cinq piliers de l'islam.",
      "Dans les grandes villes comme Damas, musulmans, juifs et chrétiens vivent ensemble ; juifs et chrétiens ont le statut de dhimmis. Marchandises, savoirs et hommes circulent entre chrétientés et islam."
    ],
    periodes: [
      { de: 661, a: 750, nom: "Omeyyades (Damas)" },
      { de: 750, a: 1258, nom: "Abbassides (Bagdad)" }
    ],
    reperes: [
      { a: 622, date: "622", txt: "Hégire : Mahomet quitte La Mecque pour Médine. C'est l'an 1 du calendrier musulman." },
      { a: 632, date: "632", txt: "Mort de Mahomet. Abu Bakr devient le premier calife." },
      { a: 661, date: "661", txt: "Les califes omeyyades installent leur capitale à Damas." },
      { a: 750, date: "750", txt: "Les Abbassides remplacent les Omeyyades à la tête de l'empire." },
      { a: 762, date: "762", txt: "Fondation de Bagdad, nouvelle capitale des Abbassides." },
      { a: 1258, date: "1258", txt: "Les Mongols prennent et pillent Bagdad." }
    ],
    notions: [
      { mot: "Islam", def: "Religion monothéiste née au VIIᵉ siècle en Arabie, fondée sur la prédication de Mahomet." },
      { mot: "Musulman", def: "Fidèle de l'islam." },
      { mot: "Coran", def: "Livre sacré des musulmans ; selon eux, il rassemble la parole de Dieu révélée à Mahomet." },
      { mot: "Hégire", def: "Départ de Mahomet de La Mecque vers Médine, en 622 : l'an 1 du calendrier musulman." },
      { mot: "Mosquée", def: "Lieu de prière des musulmans." },
      { mot: "Cinq piliers", def: "Les cinq obligations des musulmans : profession de foi, prière, aumône, jeûne du ramadan, pèlerinage à La Mecque." },
      { mot: "Calife", def: "« Successeur » de Mahomet : chef politique et religieux des musulmans." },
      { mot: "Empire", def: "Vaste territoire regroupant plusieurs peuples sous l'autorité d'un seul chef." },
      { mot: "Sunnites et chiites", def: "Les deux grandes branches de l'islam, séparées par un désaccord sur qui doit diriger les musulmans après Mahomet." },
      { mot: "Souk", def: "Marché d'une ville du monde musulman." },
      { mot: "Dhimmi", def: "« Protégé » : juif ou chrétien qui garde sa religion en terre d'islam, en échange d'un impôt spécial." }
    ],
    personnages: [
      { nom: "Mahomet", dates: "vers 570-632", txt: [
        "Selon la tradition musulmane, c'est un marchand de La Mecque, en Arabie.",
        "Les musulmans le considèrent comme le prophète de l'islam.",
        "En 622, il quitte La Mecque pour Médine : c'est l'Hégire.",
        "Il meurt à Médine en 632."
      ] },
      { nom: "Abu Bakr", dates: "mort en 634", txt: [
        "Compagnon et beau-père du prophète de l'islam.",
        "En 632, il est choisi pour diriger les musulmans.",
        "Il est le premier calife."
      ] },
      { nom: "Ali", dates: "mort en 661", txt: [
        "Cousin et gendre du prophète de l'islam.",
        "Il devient calife en 656, mais son pouvoir est contesté par le gouverneur de Syrie.",
        "Pour les chiites, lui et ses descendants sont les seuls chefs légitimes des musulmans."
      ] },
      { nom: "Moawiya", dates: "mort en 680", txt: [
        "Gouverneur de Syrie, il s'oppose au calife Ali.",
        "En 661, il devient calife et installe sa capitale à Damas.",
        "Il fonde la dynastie des Omeyyades."
      ] }
    ],
    lieux: [
      { nom: "La Mecque", txt: "Ville d'Arabie où naît Mahomet ; lieu du pèlerinage des musulmans." },
      { nom: "Médine", txt: "Ville d'Arabie où Mahomet s'installe en 622, lors de l'Hégire." },
      { nom: "Damas", txt: "Capitale des califes omeyyades à partir de 661 ; on y voit la Grande Mosquée des Omeyyades." },
      { nom: "Bagdad", txt: "Capitale des Abbassides, fondée en 762 ; prise par les Mongols en 1258." },
      { nom: "Cordoue", txt: "Capitale d'un califat en Espagne musulmane (al-Andalus)." },
      { nom: "Tolède", txt: "Ville d'Espagne où, au XIIᵉ siècle, des traducteurs font passer en latin des livres arabes." }
    ],
    trous: [
      { titre: "Les débuts de l'islam", texte: "Selon la tradition musulmane, en [622], Mahomet quitte La Mecque pour Médine : c'est l'[Hégire]. Après sa mort en 632, ses successeurs, les [califes], dirigent les musulmans et conquièrent un immense [empire]. En 661, les Omeyyades installent leur capitale à [Damas] ; en 762, les Abbassides fondent [Bagdad]." },
      { titre: "Une religion, des sociétés", texte: "Les musulmans lisent le [Coran], leur livre sacré, et respectent les cinq [piliers] de l'islam. Ils prient à la [mosquée]. Dans les villes, juifs et chrétiens gardent leur religion : ce sont des [dhimmis], qui paient un impôt spécial. Les marchandises s'échangent dans les [souks]." }
    ],
    capable: [
      "Situer l'Arabie, La Mecque et Médine sur une carte.",
      "Raconter les débuts de l'islam selon la tradition musulmane.",
      "Placer les 6 dates du chapitre sur une frise.",
      "Expliquer qui est le calife et comment il dirige l'empire.",
      "Décrire Bagdad, capitale des Abbassides.",
      "Expliquer pourquoi l'empire se divise, politiquement et religieusement.",
      "Citer les cinq piliers de l'islam.",
      "Décrire la vie dans une grande ville du monde musulman.",
      "Montrer que marchandises, savoirs et hommes circulent en Méditerranée.",
      "Présenter un document : nature, auteur, date."
    ]
  },

  /* =====================================================================
     2nde — HISTOIRE — Thème 1, chapitre 1
     ===================================================================== */
  {
    id: "2de-h1-c1", n: "2nde", d: "histoire",
    theme: "Le monde méditerranéen : empreintes de l'Antiquité et du Moyen Âge",
    rituel: "Le monde méditerranéen : Antiquité et Moyen Âge",
    num: "Chapitre 1",
    titre: "La Méditerranée antique : les empreintes grecques et romaines",
    question: "Quels modèles politiques et culturels les Grecs et les Romains ont-ils légués à l'espace méditerranéen ?",
    plan: [
      "La Méditerranée grecque : la Grèce des cités ; Athènes, cité démocratique et impérialiste ; Périclès",
      "La Méditerranée romaine : de la République à l'Empire (Auguste) ; un espace prospère et unifié ; la christianisation (Constantin)"
    ],
    cle: "Athènes lègue un vocabulaire politique (démocratie, citoyenneté, égalité devant la loi) ; Rome, un vaste espace unifié par le droit, la langue et une citoyenneté ouverte.",
    essentiel: [
      "Le monde grec est une mosaïque de cités indépendantes : divisées politiquement, elles partagent une même culture (langue, dieux, jeux d'Olympie).",
      "Au Vᵉ siècle av. J.-C., Athènes est une démocratie : les citoyens votent les lois, gouvernent et rendent la justice. Mais cette démocratie est étroite (10 à 15 % des habitants) : femmes, métèques et esclaves en sont exclus.",
      "Après les guerres médiques, Athènes dirige la ligue de Délos ; en 454, le transfert du trésor à Athènes transforme l'alliance en empire maritime : c'est une thalassocratie.",
      "En 27 av. J.-C., Auguste fonde le Principat : les formes de la République sont conservées, mais un seul homme cumule les pouvoirs, sans limite de durée.",
      "L'Empire romain unifie la Méditerranée (mare nostrum) par le droit, le latin, les routes et la monnaie. La citoyenneté s'élargit jusqu'à l'édit de Caracalla (212). Au IVᵉ siècle, Constantin favorise le christianisme, qui devient religion de l'Empire en 380."
    ],
    periodes: [
      { de: -800, a: -338, nom: "Cités grecques indépendantes" },
      { de: -509, a: -27, nom: "République romaine" },
      { de: -27, a: 476, nom: "Empire romain" }
    ],
    reperes: [
      { a: -800, b: -500, date: "-800 / -500", txt: "Colonisation grecque de la Méditerranée." },
      { a: -490, b: -479, date: "-490 / -479", txt: "Guerres médiques (Marathon, Salamine) : les cités grecques unies contre les Perses." },
      { a: -478, date: "-478", txt: "Fondation de la ligue de Délos, alliance dirigée par Athènes." },
      { a: -454, date: "-454", txt: "Le trésor de la ligue est transféré à Athènes : l'alliance devient un empire." },
      { a: -27, date: "-27", txt: "Octave reçoit le titre d'Auguste et fonde le Principat." },
      { a: 212, date: "212", txt: "Édit de Caracalla : la citoyenneté romaine est accordée à tous les hommes libres de l'Empire." },
      { a: 313, date: "313", txt: "« Édit » de Milan : le christianisme est toléré." },
      { a: 325, date: "325", txt: "Concile de Nicée, convoqué et présidé par Constantin." },
      { a: 380, date: "380", txt: "Édit de Théodose : le christianisme devient religion d'État." }
    ],
    notions: [
      { mot: "Cité", def: "Une ville et son territoire, formant un État indépendant." },
      { mot: "Citoyen", def: "Membre de la cité qui détient des droits politiques et des devoirs." },
      { mot: "Démocratie", def: "Régime où le pouvoir appartient à l'ensemble des citoyens (dêmos : le peuple ; kratos : le pouvoir)." },
      { mot: "Isonomie", def: "Égalité de droits entre les citoyens devant la loi." },
      { mot: "Ecclésia", def: "Assemblée de tous les citoyens athéniens, qui vote les lois et décide de la guerre." },
      { mot: "Éphébie", def: "Service militaire de deux ans que les jeunes Athéniens accomplissent à partir de 18 ans, avant d'être pleinement citoyens." },
      { mot: "Métèque", def: "Étranger libre installé à Athènes, non citoyen mais ayant accès à la justice ; beaucoup sont marchands." },
      { mot: "Ostracisme", def: "Vote par lequel les citoyens athéniens exilent pour dix ans un homme jugé dangereux pour la démocratie." },
      { mot: "Thalassocratie", def: "Domination fondée sur la maîtrise de la mer." },
      { mot: "Impérialisme", def: "Politique d'un État qui étend sa domination sur d'autres." },
      { mot: "Principat", def: "Régime fondé par Auguste en 27 av. J.-C. : le princeps concentre les pouvoirs." },
      { mot: "Limes", def: "Frontière militaire fortifiée de l'Empire romain." },
      { mot: "Romanisation", def: "Diffusion dans les provinces du mode de vie, de la langue et du droit romains." },
      { mot: "Christianisation", def: "Processus par lequel le christianisme devient la religion de l'Empire." }
    ],
    personnages: [
      { nom: "Périclès", dates: "vers 495-429 av. J.-C.", txt: [
        "Homme politique athénien du Vᵉ siècle av. J.-C., issu d'une grande famille.",
        "Élu stratège de nombreuses fois, il domine longtemps la vie politique d'Athènes.",
        "Il crée des indemnités qui permettent aux citoyens pauvres de participer à la vie civique.",
        "Il fait construire le Parthénon, financé en partie par le trésor de la ligue de Délos."
      ] },
      { nom: "Auguste", dates: "63 av. J.-C. - 14 apr. J.-C.", txt: [
        "Petit-neveu et fils adoptif de Jules César.",
        "Il met fin aux guerres civiles qui déchirent la République romaine.",
        "En 27 av. J.-C., le Sénat lui donne un titre qui signifie « vénérable ».",
        "Il fonde le Principat : les institutions républicaines subsistent, mais il cumule les pouvoirs."
      ] },
      { nom: "Constantin", dates: "empereur de 306 à 337", txt: [
        "Empereur romain du IVᵉ siècle.",
        "En 312, il bat son rival Maxence au pont Milvius ; il aurait eu la veille la vision du dieu des chrétiens.",
        "En 325, il convoque et préside le concile de Nicée.",
        "Il fait de Byzance une nouvelle capitale, à laquelle il donne son nom."
      ] }
    ],
    lieux: [
      { nom: "Athènes", txt: "Cité grecque de l'Attique, démocratique et à la tête d'un empire maritime au Vᵉ siècle av. J.-C." },
      { nom: "Délos", txt: "Île de la mer Égée où était gardé le trésor de la ligue, avant son transfert à Athènes en 454 av. J.-C." },
      { nom: "Rome", txt: "Centre de l'Empire romain, qui entoure toute la Méditerranée aux Iᵉʳ-IIᵉ siècles." },
      { nom: "Nicée", txt: "Ville d'Asie Mineure où Constantin réunit environ 300 évêques en 325." },
      { nom: "Alexandrie", txt: "Grande ville d'Égypte fondée par Alexandre le Grand au IVᵉ siècle av. J.-C., célèbre pour sa bibliothèque." }
    ],
    trous: [
      { titre: "La démocratie athénienne", texte: "Au Vᵉ siècle av. J.-C., Athènes est une [démocratie] : les citoyens gouvernent. Chaque citoyen est égal devant la loi : c'est l'[isonomie]. Il peut voter les lois à l'[Ecclésia], gouverner et rendre la justice. Pour être citoyen, il faut être un homme, avoir 18 ans, avoir accompli l'[éphébie] et être né de deux parents athéniens. Les citoyens ne représentent que 10 à 15 % des habitants : les femmes, les [métèques] et les esclaves sont exclus." },
      { titre: "Athènes, un empire maritime", texte: "Après les guerres médiques, Athènes prend la tête de la ligue de [Délos] (478 av. J.-C.). En [454], le trésor de la ligue est transféré à Athènes : l'alliance devient un empire. Athènes impose sa [monnaie] et installe des garnisons dans les cités alliées. Sa force est la [trière] : c'est une [thalassocratie]." },
      { titre: "Rome, de la République à l'Empire chrétien", texte: "En 27 av. J.-C., Octave reçoit le titre d'Auguste et fonde le [Principat] : les institutions de la République subsistent, mais un seul homme cumule les pouvoirs. L'Empire est protégé par une frontière fortifiée, le [limes]. La [romanisation] diffuse le latin, le droit et le mode de vie romains. En [212], l'édit de Caracalla accorde la citoyenneté à tous les hommes libres. Au IVᵉ siècle, [Constantin] favorise les chrétiens : c'est le début de la [christianisation] de l'Empire." }
    ],
    capable: [
      "Placer les repères du chapitre sur une frise.",
      "Définir et employer à bon escient les notions du chapitre.",
      "Expliquer pourquoi Athènes est une démocratie, et quelles en sont les limites.",
      "Expliquer comment Athènes passe d'une alliance à un empire maritime.",
      "Présenter l'héritage ambigu de Périclès.",
      "Dire si Auguste conserve la République ou fonde un nouveau régime, en le justifiant.",
      "Montrer comment Rome unifie l'espace méditerranéen (droit, citoyenneté, romanisation).",
      "Expliquer le rôle de Constantin dans la christianisation de l'Empire.",
      "Présenter un document et citer un passage entre guillemets pour justifier une affirmation.",
      "Formuler une hypothèse, puis la vérifier à l'aide d'un document."
    ]
  },

  /* =====================================================================
     2nde — HISTOIRE — Thème 1, chapitre 2
     ===================================================================== */
  {
    id: "2de-h1-c2", n: "2nde", d: "histoire",
    theme: "Le monde méditerranéen : empreintes de l'Antiquité et du Moyen Âge",
    rituel: "Le monde méditerranéen : Antiquité et Moyen Âge",
    num: "Chapitre 2",
    titre: "La Méditerranée médiévale : espace d'échanges et de conflits à la croisée de trois civilisations",
    question: "Dans quelle mesure la Méditerranée médiévale est-elle un espace de conflits entre les trois civilisations qui la bordent — et, en même temps, un espace d'échanges qui les relie ?",
    plan: [
      "Trois civilisations autour d'une même mer : l'Empire byzantin, le monde musulman, l'Occident chrétien",
      "Une mer de conflits : croisades et djihad (Bernard de Clairvaux) ; vivre sous la domination de l'autre",
      "Une mer d'échanges : Venise, puissance maritime ; la circulation des savoirs"
    ],
    cle: "La Méditerranée médiévale est à la fois une mer de conflits entre Chrétienté et Islam, et une mer d'échanges qui relie les trois civilisations.",
    essentiel: [
      "Vers l'an 1000, trois civilisations bordent la Méditerranée : l'Empire byzantin (basileus, Constantinople, chrétiens orthodoxes), le monde musulman (califes de Bagdad, de Cordoue, du Caire) et l'Occident chrétien (pape à Rome, royaumes féodaux).",
      "Elles s'affrontent : croisades à partir de 1096, djihad, Reconquista. Dans chaque camp, la guerre est justifiée au nom de la foi — Bernard de Clairvaux prêche la deuxième croisade en 1146.",
      "Juifs, chrétiens et musulmans vivent aussi sous la domination de l'autre, avec des statuts inégaux (dhimmis en terre d'islam).",
      "Malgré les conflits, la Méditerranée reste un espace d'échanges : Venise bâtit sa puissance sur le commerce et ses comptoirs ; savoirs et techniques circulent (traducteurs de Tolède, papier, chiffres)."
    ],
    periodes: [
      { de: 395, a: 1453, nom: "Empire byzantin" },
      { de: 1096, a: 1291, nom: "Croisades" }
    ],
    reperes: [
      { a: 476, date: "476", txt: "Chute de l'Empire romain d'Occident : début du Moyen Âge." },
      { a: 622, date: "622", txt: "Hégire : Mahomet quitte La Mecque pour Médine." },
      { a: 1054, date: "1054", txt: "Schisme entre l'Église catholique (Rome) et l'Église orthodoxe (Constantinople)." },
      { a: 1096, date: "1096", txt: "Départ de la première croisade." },
      { a: 1146, date: "1146", txt: "À Vézelay, Bernard de Clairvaux prêche la deuxième croisade." },
      { a: 1204, date: "1204", txt: "Sac de Constantinople par les croisés de la quatrième croisade, détournée par Venise." },
      { a: 1453, date: "1453", txt: "Les Ottomans prennent Constantinople : fin de l'Empire byzantin." },
      { a: 1492, date: "1492", txt: "Prise de Grenade : fin de la Reconquista." }
    ],
    notions: [
      { mot: "Chrétienté", def: "L'ensemble des territoires et des populations de religion chrétienne, formant une communauté par-delà les frontières politiques." },
      { mot: "Islam", def: "Religion monothéiste fondée au VIIᵉ siècle sur la prédication de Mahomet et le Coran ; par extension, la civilisation qui s'en réclame." },
      { mot: "Orthodoxie", def: "Forme du christianisme pratiquée dans l'Empire byzantin, séparée de l'Église catholique romaine après le schisme de 1054." },
      { mot: "Basileus", def: "Titre de l'empereur byzantin, qui se considère comme l'héritier des empereurs romains." },
      { mot: "Patriarche", def: "Chef religieux de l'Église orthodoxe, nommé par le basileus à Constantinople." },
      { mot: "Calife", def: "« Successeur » de Mahomet : chef à la fois politique et religieux de la communauté des croyants." },
      { mot: "Empire carolingien", def: "Empire fondé en 800 par le couronnement de Charlemagne ; il se fragmente dès le IXᵉ siècle." },
      { mot: "Féodalité", def: "Organisation politique et sociale de l'Occident médiéval, fondée sur les liens personnels entre seigneurs et vassaux." },
      { mot: "Vassalité", def: "Lien par lequel un vassal reçoit un fief de son seigneur, en échange de fidélité et de service militaire." },
      { mot: "Croisade", def: "Expédition militaire et religieuse menée contre les ennemis de la foi chrétienne." },
      { mot: "Djihad", def: "Littéralement « effort » : d'abord l'effort spirituel du croyant ; peut aussi désigner, dans certaines conditions du droit musulman, la lutte armée pour défendre la communauté." },
      { mot: "Reconquista", def: "Reconquête progressive, par les royaumes chrétiens, des territoires de la péninsule Ibérique occupés par les musulmans." },
      { mot: "Dhimmi", def: "Dans le monde musulman, statut du « protégé » : juifs et chrétiens conservent leur religion en échange d'un impôt particulier et de règles spécifiques." },
      { mot: "Comptoir", def: "Établissement commercial installé par des marchands étrangers dans un port, servant de base à leurs échanges." },
      { mot: "Transfert culturel", def: "Déplacement d'éléments culturels (savoirs, techniques, formes artistiques) d'une civilisation vers une autre." }
    ],
    personnages: [
      { nom: "Bernard de Clairvaux", dates: "1090-1153", txt: [
        "Moine de l'ordre cistercien, réputé pour sa rigueur.",
        "Il dirige l'abbaye de Clairvaux, en Champagne, qui devient célèbre dans toute l'Europe.",
        "Il écrit un éloge des chevaliers-moines de l'ordre du Temple.",
        "En 1146, à Vézelay, il prêche la deuxième croisade."
      ] },
      { nom: "Saladin", dates: "vers 1138-1193", txt: [
        "Sultan qui unifie l'Égypte et la Syrie à la fin du XIIᵉ siècle.",
        "Il appelle les musulmans au djihad contre les États latins d'Orient.",
        "En 1187, il reprend Jérusalem aux croisés."
      ] },
      { nom: "Averroès", dates: "1126-1198", txt: [
        "Savant, médecin et philosophe musulman, né à Cordoue.",
        "Il commente les œuvres du philosophe grec Aristote.",
        "Traduits en latin, ses commentaires circulent dans les universités de l'Occident chrétien."
      ] },
      { nom: "Al-Idrisi", dates: "vers 1100-1165", txt: [
        "Géographe musulman, formé à Cordoue.",
        "Il travaille à Palerme, à la cour du roi normand de Sicile Roger II.",
        "Il y réalise un grand livre de géographie et une carte du monde connu."
      ] }
    ],
    lieux: [
      { nom: "Constantinople", txt: "Capitale de l'Empire byzantin et siège du patriarche ; pillée en 1204, prise par les Ottomans en 1453." },
      { nom: "Rome", txt: "Siège du pape, chef de l'Église catholique." },
      { nom: "Bagdad", txt: "Capitale du califat abbasside." },
      { nom: "Cordoue", txt: "Capitale du califat omeyyade d'al-Andalus, en péninsule Ibérique." },
      { nom: "Le Caire", txt: "Capitale du califat fatimide, fondée en 969." },
      { nom: "Jérusalem", txt: "Ville sainte pour les juifs, les chrétiens et les musulmans ; objectif des croisades." },
      { nom: "Venise", txt: "Cité maritime d'Italie, dirigée par un doge, qui bâtit sa puissance sur le commerce et ses comptoirs." },
      { nom: "Tolède", txt: "Ville de la péninsule Ibérique où des traducteurs font passer en latin des savoirs grecs et arabes." }
    ],
    trous: [
      { titre: "Trois civilisations", texte: "Vers l'an 1000, trois civilisations bordent la Méditerranée. À Constantinople, le [basileus] dirige l'Empire byzantin, de religion chrétienne [orthodoxe]. Le monde musulman est dirigé par des [califes]. En Occident, la société est organisée par la [féodalité], et le [pape] dirige l'Église catholique depuis Rome." },
      { titre: "Une mer de conflits", texte: "À partir de 1096, les chrétiens d'Occident lancent des [croisades] vers la Terre sainte. Du côté musulman, des lettrés appellent au [djihad]. Dans la péninsule Ibérique, les royaumes chrétiens mènent la [Reconquista], achevée en 1492 avec la prise de [Grenade]. En terre d'islam, juifs et chrétiens ont le statut de [dhimmis]." },
      { titre: "Une mer d'échanges", texte: "Malgré les conflits, la Méditerranée reste un espace d'échanges. [Venise] bâtit sa puissance sur le commerce et installe des [comptoirs] dans les ports. À [Tolède], des traducteurs font passer en latin des savoirs grecs et arabes : c'est un [transfert culturel]." }
    ],
    capable: [
      "Placer les repères du chapitre sur une frise.",
      "Distinguer les trois civilisations : chef, capitale, religion.",
      "Définir et employer le lexique du chapitre.",
      "Résumer un document en deux phrases.",
      "Classer un corpus de documents et lui donner un titre.",
      "Confronter deux récits d'un même événement.",
      "Expliquer pourquoi la date d'écriture d'un document compte.",
      "Retracer le trajet d'un savoir d'une civilisation à l'autre."
    ]
  },

  /* =====================================================================
     2nde — GÉOGRAPHIE — Thème 1, chapitres 1 et 2 (Amazonie)
     ===================================================================== */
  {
    id: "2de-g1-c12", n: "2nde", d: "geo",
    theme: "Sociétés et environnements : des équilibres fragiles",
    rituel: "Sociétés et environnements : équilibres fragiles",
    num: "Chapitres 1 et 2",
    titre: "Les sociétés face aux risques ; des ressources sous pression : l'Amazonie",
    question: "En quoi l'Amazonie est-elle un espace riche en ressources, convoité et menacé ?",
    plan: [
      "Les sociétés face aux risques : l'Amazonie, puis les risques dans le monde",
      "Des ressources majeures sous pression : les ressources de l'Amazonie et le front pionnier",
      "Tâche finale : le croquis de l'Amazonie"
    ],
    cle: "Un aléa devient un risque quand il touche une société vulnérable ; en Amazonie, l'exploitation des ressources aggrave les risques.",
    essentiel: [
      "Un aléa devient un risque quand il touche une société vulnérable. En Amazonie, la frontière entre risques naturels (sécheresse, crue) et risques liés aux activités humaines (déforestation, barrages, pollution) est floue.",
      "L'exposition aux risques est inégale dans le monde, la vulnérabilité aussi : le Japon est très exposé mais peu vulnérable. Le changement climatique amplifie certains aléas.",
      "L'Amazonie est riche en ressources convoitées : bois, minerais, or, hydrocarbures, terres agricoles, hydroélectricité. Le front pionnier avance sur la forêt : environ 20 % de la forêt a disparu en 50 ans.",
      "Exploiter une ressource a des conséquences en chaîne : le mercure de l'orpaillage contamine les poissons, puis les riverains ; la déforestation détruit la biodiversité et libère du CO₂.",
      "Les États amazoniens tentent de coopérer (pacte de Leticia, 2019), sans mesures contraignantes."
    ],
    periodes: [],
    reperes: [],
    notions: [
      { mot: "Aléa", def: "Phénomène naturel ou lié aux activités humaines qui peut se produire et causer des dégâts (sécheresse, crue, séisme…)." },
      { mot: "Enjeux", def: "Les personnes, les biens et les activités exposés à un aléa." },
      { mot: "Vulnérabilité", def: "Fragilité d'une société face à un aléa ; elle dépend de sa richesse, de son organisation et de sa préparation." },
      { mot: "Risque", def: "Danger qui menace une société : risque = aléa + enjeux vulnérables." },
      { mot: "Exposition", def: "Le fait de se trouver dans une zone touchée par un aléa. Être très exposé ne veut pas dire être très vulnérable." },
      { mot: "Ressource", def: "Élément du milieu que les sociétés exploitent pour répondre à leurs besoins (bois, minerais, eau, terres…)." },
      { mot: "Front pionnier", def: "Zone où l'on défriche de nouvelles terres : une piste est ouverte, la forêt est brûlée, puis on installe élevage ou soja, et le front avance." },
      { mot: "Orpaillage", def: "Recherche de l'or dans les rivières, souvent illégale en Amazonie ; le mercure utilisé pollue les eaux." },
      { mot: "Déforestation", def: "Destruction de la forêt pour exploiter le bois ou les terres." },
      { mot: "Puits de carbone", def: "Milieu qui absorbe et stocke du CO₂, comme la forêt amazonienne." },
      { mot: "Croquis", def: "Représentation simplifiée d'un espace, avec un titre, une légende organisée en parties et une nomenclature." }
    ],
    personnages: [],
    lieux: [
      { nom: "Amazone", txt: "Grand fleuve d'Amérique du Sud qui traverse la forêt amazonienne ; il sert de voie de circulation." },
      { nom: "Manaus", txt: "Grande ville au cœur de l'Amazonie brésilienne, sur le fleuve." },
      { nom: "Belém", txt: "Grande ville située à l'embouchure de l'Amazone." },
      { nom: "Arc de déforestation", txt: "Sud et sud-est du bassin (Rondônia, nord du Mato Grosso, sud du Pará), là où la forêt recule le plus vite." },
      { nom: "Belo Monte", txt: "Grand barrage hydroélectrique sur le Xingu, affluent de l'Amazone." },
      { nom: "Carajás", txt: "Grande région minière (fer) de l'État du Pará, au Brésil." },
      { nom: "Transamazonienne", txt: "Route ouverte à travers la forêt, le long de laquelle avancent les fronts pionniers." },
      { nom: "Leticia", txt: "Ville de Colombie où sept pays amazoniens ont signé en 2019 un pacte pour protéger la forêt." },
      { nom: "Ceinture de feu du Pacifique", txt: "Zone de séismes et de volcans autour du Pacifique : Japon, Philippines, Indonésie, Andes, ouest des États-Unis." },
      { nom: "Dhaka", txt: "Capitale du Bangladesh, dans un delta bas et très peuplé, exposé aux inondations et aux cyclones." }
    ],
    trous: [
      { titre: "Aléa, vulnérabilité, risque", texte: "Un [aléa] est un phénomène qui peut se produire, comme une sécheresse ou une crue. Il devient un [risque] quand il touche une société [vulnérable]. Le Japon est très [exposé] aux séismes, mais peu vulnérable car il est riche et préparé." },
      { titre: "Une forêt sous pression", texte: "L'Amazonie est riche en [ressources] : bois, or, fer, terres agricoles. Le [front pionnier] avance sur la forêt : on ouvre une piste, on brûle la forêt, puis on installe de l'élevage ou du soja. Cette [déforestation] détruit la biodiversité et affaiblit un grand [puits de carbone]. L'[orpaillage] pollue les fleuves au mercure." }
    ],
    capable: [
      "Distinguer aléa, enjeux, vulnérabilité et risque.",
      "Donner des exemples de risques naturels et de risques liés aux activités humaines en Amazonie.",
      "Localiser les grandes zones exposées aux risques dans le monde.",
      "Expliquer pourquoi exposition et vulnérabilité ne vont pas toujours ensemble.",
      "Citer les ressources de l'Amazonie et expliquer le front pionnier.",
      "Expliquer les conséquences en chaîne de l'orpaillage et de la déforestation.",
      "Transformer un texte en légende organisée en trois parties.",
      "Réaliser le croquis de l'Amazonie : titre, légende, nomenclature."
    ]
  },

  /* =====================================================================
     2nde — GÉOGRAPHIE — Thème 1, chapitre 3 (la France)
     ===================================================================== */
  {
    id: "2de-g1-c3", n: "2nde", d: "geo",
    theme: "Sociétés et environnements : des équilibres fragiles",
    rituel: "Sociétés et environnements : équilibres fragiles",
    num: "Chapitre 3",
    titre: "La France : des milieux métropolitains et ultramarins entre valorisation et protection",
    question: "Comment la France valorise-t-elle et protège-t-elle des milieux variés, en métropole et outre-mer ?",
    plan: [
      "Un territoire riche en milieux naturels",
      "Des milieux soumis aux risques",
      "Vers une gestion plus durable",
      "Tâche finale : le croquis de la France"
    ],
    cle: "La France, ce sont des milieux variés, valorisés par les sociétés, exposés aux risques, et qu'il faut protéger sans exclure les activités humaines.",
    essentiel: [
      "La France possède une grande variété de milieux, en métropole (climats océanique, méditerranéen, de montagne ; plaines, montagnes, littoraux) et en outre-mer, qui lui donne la 2ᵉ ZEE du monde.",
      "Ces milieux sont valorisés : agriculture intensive (Bassin parisien, Bassin aquitain, Bretagne), tourisme balnéaire (surtout en Méditerranée), sports d'hiver (Alpes, Pyrénées).",
      "Ils sont soumis à des risques : risque = aléa + enjeux vulnérables. La métropole est surtout exposée aux inondations, aux sécheresses et à l'érosion côtière ; les Antilles aux séismes.",
      "Protéger ne veut pas dire interdire : plusieurs statuts (parc national, parc naturel régional, parc naturel marin, Natura 2000) et plusieurs acteurs (Union européenne, État, collectivités, associations)."
    ],
    periodes: [],
    reperes: [],
    notions: [
      { mot: "Milieu", def: "Ensemble des éléments naturels d'un espace (relief, climat, végétation, eau), plus ou moins transformés par les sociétés." },
      { mot: "Anthropisation", def: "Transformation d'un milieu par les activités humaines." },
      { mot: "Outre-mer", def: "Territoires français situés hors d'Europe : Antilles, Guyane, La Réunion, Mayotte, Polynésie, Nouvelle-Calédonie…" },
      { mot: "ZEE", def: "Zone économique exclusive : espace maritime, jusqu'à 200 milles (environ 370 km) des côtes, dont l'État exploite seul les ressources." },
      { mot: "Érosion côtière", def: "Recul du trait de côte sous l'effet des vagues, des tempêtes et de la montée du niveau de la mer." },
      { mot: "Parc national", def: "Espace protégé créé par l'État ; son cœur est très réglementé et la présence humaine y est limitée." },
      { mot: "Parc naturel régional", def: "Espace habité, créé à l'initiative des régions, qui concilie protection de la nature et développement local." },
      { mot: "Parc naturel marin", def: "Espace protégé créé par l'État pour le milieu marin, où la pêche et les loisirs restent possibles." },
      { mot: "Natura 2000", def: "Réseau européen de sites naturels protégés." },
      { mot: "Développement durable", def: "Développement qui répond aux besoins actuels sans compromettre ceux des générations futures (économie, société, environnement)." }
    ],
    personnages: [],
    lieux: [
      { nom: "Le Signal (Soulac-sur-Mer)", txt: "Immeuble de Gironde menacé par l'érosion côtière : évacué en 2014, démoli en 2023." },
      { nom: "Antilles", txt: "Territoires d'outre-mer où l'aléa sismique est le plus fort de France." },
      { nom: "Fossé rhénan", txt: "Zone sismique de l'est de la France, au sud de l'Alsace." },
      { nom: "Parc amazonien de Guyane", txt: "Le plus grand parc national de France, en outre-mer." },
      { nom: "Vanoise", txt: "Premier parc national français (1963), dans les Alpes." },
      { nom: "Calanques", txt: "Parc national aux portes de Marseille, à la fois terrestre et marin." },
      { nom: "Bassin parisien", txt: "Grande plaine de grandes cultures et d'agriculture intensive." }
    ],
    trous: [
      { titre: "Des milieux variés", texte: "La France possède des milieux très variés, en métropole et en [outre-mer]. Grâce à ces territoires, elle dispose de la deuxième [ZEE] du monde. Les sociétés transforment les milieux : c'est l'[anthropisation]." },
      { titre: "Risques et protection", texte: "L'immeuble du Signal, en Gironde, a été évacué en 2014 à cause de l'[érosion côtière] : l'aléa et les [enjeux] forment le [risque]. Pour protéger les milieux, l'État crée des [parcs nationaux] ; les régions créent des [parcs naturels régionaux], habités, qui concilient protection et développement local." }
    ],
    capable: [
      "Décrire la variété des milieux de la France, en métropole et outre-mer.",
      "Expliquer pourquoi la ZEE française est si vaste.",
      "Localiser les principales zones à risques en France.",
      "Expliquer un risque avec la formule aléa + enjeux.",
      "Distinguer parc national, parc naturel régional et parc naturel marin.",
      "Citer les acteurs de la protection des milieux.",
      "Réaliser le croquis de la France en trois parties."
    ]
  },

  /* =====================================================================
     1ère — HISTOIRE — Thème 1, chapitre 1
     ===================================================================== */
  {
    id: "1re-h1-c1", n: "1ere", d: "histoire",
    theme: "L'Europe face aux révolutions",
    rituel: "L'Europe face aux révolutions",
    num: "Chapitre 1",
    titre: "La Révolution française et l'Empire : une nouvelle conception de la nation (1789-1815)",
    question: "Comment la période révolutionnaire et impériale instaure-t-elle de nouveaux rapports entre la nation et le pouvoir politique, en France et en Europe ?",
    plan: [
      "Les différentes phases de la Révolution en 1789",
      "Quelle nouvelle France après cette révolution ? (14 juillet 1789 / 14 juillet 1790)",
      "La souveraineté royale progressivement remise en cause (1790-1792)",
      "La République : la nation en armes et la Terreur (Madame Roland)",
      "Une nation canalisée et conquérante sous Napoléon Bonaparte (le Code civil)"
    ],
    cle: "La Révolution remplace la souveraineté du roi par celle de la nation ; Napoléon la confisque tout en conservant l'essentiel des acquis de 1789.",
    essentiel: [
      "En 1789, la souveraineté passe du roi à la nation en trois temps : par les députés (17 juin), par la rue (14 juillet), par le droit (4 et 26 août).",
      "La monarchie constitutionnelle de 1791 échoue : fuite à Varennes, guerre, manifeste de Brunswick, prise des Tuileries le 10 août 1792. La République est proclamée le 21 septembre 1792.",
      "Menacée à l'extérieur et à l'intérieur, la République suspend les libertés : c'est la Terreur (1793-1794), jusqu'à la chute de Robespierre.",
      "Bonaparte confisque la souveraineté (plébiscites, censure, police) tout en conservant les acquis de 1789 (égalité devant la loi, Code civil, départements) : ce sont les « masses de granit ».",
      "Les conquêtes diffusent le modèle français en Europe, mais la domination française fait naître le nationalisme des autres peuples. En 1815, l'esprit de la Révolution paraît balayé — en apparence seulement."
    ],
    periodes: [
      { de: "1789-07-09", a: "1792-08-10", nom: "Monarchie constitutionnelle", court: "Monarchie const.", detail: "La nation, par la Constitution de 1791. Suffrage censitaire : les citoyens « actifs » (env. 4,3 millions sur 28)." },
      { de: "1792-09-21", a: "1799-11-09", nom: "République", detail: "La nation. Suffrage universel masculin en 1792, redevenu censitaire sous le Directoire (env. 30 000 décideurs réels)." },
      { de: "1799-11-09", a: "1804-05-18", nom: "Consulat", detail: "En principe la nation, en fait le Premier consul. Suffrage universel masculin réduit au plébiscite." },
      { de: "1804-05-18", a: "1815-06-22", nom: "Premier Empire", detail: "L'empereur, par hérédité, avec l'apparence du consentement populaire (plébiscites)." }
    ],
    reperes: [
      { a: "1789-07-14", date: "14 juillet 1789", txt: "Prise de la Bastille." },
      { a: "1789-08-04", date: "4 août 1789", txt: "Abolition des privilèges." },
      { a: "1789-08-26", date: "26 août 1789", txt: "Déclaration des droits de l'homme et du citoyen." },
      { a: "1791-09-03", date: "3 septembre 1791", txt: "Constitution : la France devient une monarchie constitutionnelle." },
      { a: "1792-08-10", date: "10 août 1792", txt: "Prise des Tuileries : chute de la monarchie." },
      { a: "1792-09-21", date: "21 septembre 1792", txt: "Abolition de la royauté : proclamation de la République." },
      { a: "1793-01-21", date: "21 janvier 1793", txt: "Exécution de Louis XVI." },
      { a: "1794-07-27", date: "27 juillet 1794", txt: "Chute de Robespierre : fin de la Terreur (1793-1794)." },
      { a: "1799-11-09", date: "9 novembre 1799", txt: "18 Brumaire : coup d'État de Bonaparte." },
      { a: "1804-03-21", date: "21 mars 1804", txt: "Promulgation du Code civil." },
      { a: "1804-12-02", date: "2 décembre 1804", txt: "Sacre de Napoléon à Notre-Dame." },
      { a: "1815-06-18", date: "18 juin 1815", txt: "Waterloo : fin de l'Empire." }
    ],
    notions: [
      { mot: "Société d'ordres", def: "Société dans laquelle le rang de chacun est fixé par sa naissance et non par sa fortune, et dans laquelle deux ordres — clergé et noblesse — jouissent de privilèges." },
      { mot: "Cahiers de doléances", def: "Registres rédigés en 1789 par chaque paroisse, chaque corporation et chaque ordre pour recenser les plaintes et les vœux à présenter aux États généraux." },
      { mot: "Souveraineté nationale", def: "Principe selon lequel le pouvoir politique appartient à la nation tout entière, et non à un roi ; il s'exerce par des représentants élus." },
      { mot: "Monarchie constitutionnelle", def: "Régime dans lequel le roi garde le pouvoir exécutif mais l'exerce dans les limites fixées par une Constitution, le pouvoir législatif appartenant à une assemblée élue." },
      { mot: "Suffrage censitaire", def: "Système dans lequel seuls les citoyens payant un impôt minimum, le cens, ont le droit de vote. Il s'oppose au suffrage universel." },
      { mot: "Sans-culottes", def: "Militants populaires parisiens (artisans, boutiquiers, compagnons) qui réclament le suffrage universel, la taxation des grains et des mesures contre les « ennemis de la Révolution »." },
      { mot: "Terreur", def: "Période de 1793-1794 pendant laquelle le gouvernement révolutionnaire suspend les libertés et emploie la violence d'État pour vaincre les ennemis intérieurs et extérieurs." },
      { mot: "Plébiscite", def: "Vote par lequel les citoyens répondent par oui ou par non à une question posée par le chef de l'État : on approuve un homme et sa politique, on ne désigne pas de représentants." },
      { mot: "Césarisme", def: "Régime dans lequel un homme seul exerce un pouvoir personnel et autoritaire tout en gardant les apparences de la souveraineté du peuple." },
      { mot: "Masses de granit", def: "Expression de Bonaparte pour les grandes institutions du Consulat destinées à durer : préfets, Concordat, Banque de France, lycées, Légion d'honneur, Code civil." },
      { mot: "Nationalisme", def: "Sentiment d'appartenance à une nation, accompagné de la revendication pour elle d'un État indépendant." }
    ],
    personnages: [
      { nom: "Louis XVI", dates: "1754-1793", txt: [
        "Roi de France à partir de 1774.",
        "Il accepte de réunir les États généraux, mais se rallie mal à la monarchie constitutionnelle.",
        "Sa fuite, arrêtée à Varennes en juin 1791, le fait soupçonner de trahison.",
        "Détrôné le 10 août 1792, il est jugé et exécuté le 21 janvier 1793."
      ] },
      { nom: "Manon Roland", dates: "1754-1793", txt: [
        "Fille d'un graveur, très instruite.",
        "Son salon réunit les députés girondins ; elle rédige une partie des textes signés par son mari, ministre de l'Intérieur.",
        "Arrêtée après la chute des Girondins, elle écrit ses Mémoires en prison.",
        "Elle est guillotinée le 8 novembre 1793."
      ] },
      { nom: "Olympe de Gouges", dates: "1748-1793", txt: [
        "Femme de lettres engagée dans la Révolution.",
        "En 1791, elle publie la Déclaration des droits de la femme et de la citoyenne.",
        "Elle est guillotinée en novembre 1793."
      ] },
      { nom: "Maximilien Robespierre", dates: "1758-1794", txt: [
        "Avocat d'Arras, député à partir de 1789.",
        "Le 3 décembre 1792, il déclare à la Convention que le roi « doit mourir parce qu'il faut que la patrie vive ».",
        "Chef de file des Montagnards, membre du Comité de salut public, principal artisan de la Terreur.",
        "Arrêté le 9 thermidor an II, il est guillotiné le lendemain."
      ] },
      { nom: "Napoléon Bonaparte", dates: "1769-1821", txt: [
        "Général corse, devenu célèbre par ses victoires.",
        "Il prend le pouvoir par le coup d'État du 18 Brumaire.",
        "Consul à vie en 1802, il devient empereur en 1804.",
        "Vaincu à Waterloo en 1815, il meurt à Sainte-Hélène."
      ] }
    ],
    lieux: [
      { nom: "Varennes", txt: "Lieu où le roi, qui tentait de fuir, est arrêté dans la nuit du 20 au 21 juin 1791." },
      { nom: "Valmy", txt: "Victoire des soldats-citoyens qui arrête l'invasion, le 20 septembre 1792." },
      { nom: "Austerlitz", txt: "Victoire de Napoléon contre l'Autriche et la Russie, le 2 décembre 1805." },
      { nom: "Trafalgar", txt: "Défaite navale de 1805 qui interdit définitivement la mer à Napoléon." },
      { nom: "Waterloo", txt: "Dernière défaite de Napoléon, le 18 juin 1815, en Belgique actuelle." }
    ],
    trous: [
      { titre: "1789-1791 : la nation souveraine", texte: "En 1789, la France est une monarchie absolue et une [société d'ordres]. Le 17 juin, les députés du tiers état se proclament [Assemblée nationale]. Le 26 août, la Déclaration des droits de l'homme et du citoyen affirme que la souveraineté réside dans la [nation]. La Constitution de 1791 fait de la France une [monarchie constitutionnelle], avec un suffrage [censitaire]." },
      { titre: "1793-1815 : de la Terreur à l'Empire", texte: "En 1793-1794, pendant la [Terreur], le gouvernement révolutionnaire suspend les libertés pour vaincre ses ennemis. Par le coup d'État du 18 [Brumaire], Bonaparte prend le pouvoir ; les citoyens ne votent plus que par [plébiscite]. Il crée des institutions durables, les « [masses de granit] », dont le [Code civil] en 1804. En Europe, la domination française fait naître le [nationalisme] des peuples." }
    ],
    capable: [
      "Définir les notions du chapitre (société d'ordres, souveraineté nationale, Terreur, plébiscite…).",
      "Situer les dates du chapitre et lire la carte de l'Europe napoléonienne en 1811.",
      "Expliquer pourquoi la monarchie absolue s'effondre en 1789.",
      "Expliquer ce que la Déclaration des droits de l'homme change dans la définition de la nation.",
      "Expliquer pourquoi la Révolution devient violente entre 1792 et 1794.",
      "Expliquer comment Napoléon confisque la souveraineté tout en gardant les acquis de 1789.",
      "Expliquer pourquoi les « guerres de libération » finissent par susciter des nationalismes.",
      "Rédiger l'introduction d'une analyse de document : accroche, contexte, présentation.",
      "Construire un schéma fléché causes / déroulement / conséquences."
    ]
  },

  /* =====================================================================
     1ère — HISTOIRE — Thème 1, chapitre 2
     ===================================================================== */
  {
    id: "1re-h1-c2", n: "1ere", d: "histoire",
    theme: "L'Europe face aux révolutions",
    rituel: "L'Europe face aux révolutions",
    num: "Chapitre 2",
    titre: "L'Europe entre restauration et révolution (1814-1848)",
    question: "Comment l'ordre européen rétabli en 1815 est-il contesté, en France et en Europe, par les aspirations libérales et nationales, jusqu'à sa rupture en 1848 ?",
    plan: [
      "L'ordre de Vienne : restaurer, pacifier, contenir (Metternich et le congrès de Vienne)",
      "En France, deux monarchies constitutionnelles (les Trois Glorieuses)",
      "Les peuples contre l'ordre de Vienne (le massacre de Chios)",
      "1848 : le printemps des peuples"
    ],
    cle: "L'ordre de Vienne meurt moins d'une révolution victorieuse que de son incapacité à répondre à la question qu'il avait refusé de poser : que faire des nations ?",
    essentiel: [
      "En 1815, le congrès de Vienne rétablit les dynasties et redessine les frontières sans consulter les peuples. Le « système Metternich » surveille, censure et intervient contre les révolutions — mais aucune guerre générale n'éclate entre grandes puissances jusqu'en 1853.",
      "En France, la Charte de 1814 est octroyée par le roi à ses sujets. Charles X, chef des ultras, est renversé en trois jours (Trois Glorieuses, juillet 1830). La monarchie de Juillet change de principe, mais reste censitaire.",
      "Malgré la censure, les idées libérales et nationales circulent : sociétés secrètes, presse, universités, banquets. Le massacre de Chios (1822) fait naître un vaste mouvement philhellène.",
      "Trois vagues révolutionnaires (1820-1821, 1830, 1848) sont écrasées, mais chacune laisse quelque chose : la Grèce (1830), la Belgique (1831), le suffrage universel masculin et l'abolition de l'esclavage en France (1848)."
    ],
    periodes: [
      { de: "1814-04-06", a: "1830-07-29", nom: "Restauration", detail: "Louis XVIII puis Charles X. La Charte de 1814, octroyée : environ 100 000 électeurs (300 F d'impôt, 30 ans)." },
      { de: "1830-08-09", a: "1848-02-24", nom: "Monarchie de Juillet", detail: "Louis-Philippe, « roi des Français ». Charte de 1830, acceptée : de 166 000 à 250 000 électeurs (200 F, 25 ans)." }
    ],
    reperes: [
      { a: "1814-06-04", date: "4 juin 1814", txt: "La Charte octroyée par Louis XVIII." },
      { a: "1814-11-01", b: "1815-06-09", date: "nov. 1814 - juin 1815", txt: "Le congrès de Vienne redessine l'Europe." },
      { a: "1815-09-26", date: "26 septembre 1815", txt: "La Sainte-Alliance." },
      { a: "1819-09-20", date: "20 septembre 1819", txt: "Les décrets de Carlsbad : censure et surveillance des universités en Allemagne." },
      { a: "1822-04-15", date: "avril 1822", txt: "Le massacre de Chios, pendant la guerre d'indépendance grecque (1821-1830)." },
      { a: "1827-10-20", date: "20 octobre 1827", txt: "Navarin : les flottes française, britannique et russe détruisent la flotte turco-égyptienne." },
      { a: "1830-07-28", date: "27-29 juillet 1830", txt: "Les Trois Glorieuses renversent Charles X." },
      { a: "1830-08-14", date: "14 août 1830", txt: "La Charte révisée ; Louis-Philippe est « roi des Français »." },
      { a: 1831, date: "1831", txt: "Mazzini fonde la Jeune-Italie ; l'indépendance de la Belgique est reconnue." },
      { a: "1848-02-24", date: "février-mars 1848", txt: "Le printemps des peuples : la IIᵉ République est proclamée le 24 février." },
      { a: "1848-04-27", date: "5 mars et 27 avril 1848", txt: "Suffrage universel masculin ; décret d'abolition de l'esclavage." }
    ],
    notions: [
      { mot: "Légitimisme", def: "Doctrine selon laquelle le pouvoir royal ne procède ni de la nation ni d'un contrat, mais d'un droit héréditaire et divin." },
      { mot: "Libéralisme", def: "Courant issu des Lumières et de 1789 qui subordonne le pouvoir à une constitution et garantit des libertés individuelles ; la plupart des libéraux de 1814-1848 sont monarchistes et censitaires." },
      { mot: "Monarchie constitutionnelle", def: "Régime dans lequel le roi conserve le pouvoir exécutif mais l'exerce dans les limites fixées par une constitution, en partageant le pouvoir législatif avec des chambres." },
      { mot: "Charte octroyée", def: "Constitution accordée par le souverain de sa seule volonté, et non votée par une assemblée représentant la nation. Elle repose sur la souveraineté royale." },
      { mot: "Suffrage censitaire", def: "Droit de vote réservé aux hommes payant un montant minimal d'impôt direct, le cens : 300 F et 30 ans en 1814 ; 200 F et 25 ans après 1831." },
      { mot: "Concert européen", def: "Système par lequel les grandes puissances prétendent régler collectivement les affaires de l'Europe par la concertation et par des congrès. C'est une pratique, pas une institution." },
      { mot: "Mouvement des nationalités", def: "Aspiration de populations qui se pensent comme une nation (langue, histoire, culture) à se doter d'un État, en s'émancipant d'un empire ou en unifiant des États morcelés." },
      { mot: "Question d'Orient", def: "Ensemble des problèmes posés aux puissances européennes par l'affaiblissement de l'Empire ottoman : qui héritera de ses territoires sans rompre l'équilibre européen ?" },
      { mot: "Société secrète", def: "Association clandestine, organisée en cellules et fondée sur un serment, par laquelle les opposants contournent la censure et l'interdiction de réunion." },
      { mot: "Philhellénisme", def: "Mouvement d'opinion européen favorable à l'indépendance de la Grèce, porté par des écrivains et des artistes (Hugo, Byron, Delacroix) et par des comités de souscription." },
      { mot: "Nationalisme d'existence et de puissance", def: "Le premier est celui d'un peuple qui réclame le droit d'exister comme nation souveraine ; le second, celui d'un État déjà constitué qui se sert de la référence nationale pour s'étendre." }
    ],
    personnages: [
      { nom: "Metternich", dates: "1773-1859", txt: [
        "Ministre des Affaires étrangères de l'Autriche à partir de 1809, chancelier à partir de 1821.",
        "Il préside le congrès de Vienne.",
        "Il donne son nom à un système de surveillance, de censure et d'intervention contre les révolutions.",
        "Chassé par l'insurrection de Vienne, il démissionne le 13 mars 1848."
      ] },
      { nom: "Louis XVIII", dates: "1755-1824", txt: [
        "Frère de Louis XVI.",
        "Roi en 1814, il octroie la Charte.",
        "Il gouverne avec prudence, entre ultras et libéraux."
      ] },
      { nom: "Charles X", dates: "1757-1836", txt: [
        "Frère de Louis XVI et de Louis XVIII ; il devient roi en 1824.",
        "Chef des ultras, il se fait sacrer à Reims en 1825.",
        "Ses ordonnances de juillet 1830 provoquent une révolution qui le renverse en trois jours."
      ] },
      { nom: "Louis-Philippe", dates: "1773-1850", txt: [
        "Duc d'Orléans.",
        "Il devient « roi des Français » en 1830, après les Trois Glorieuses.",
        "Il est chassé par la révolution de février 1848."
      ] },
      { nom: "Giuseppe Mazzini", dates: "1805-1872", txt: [
        "Ancien carbonaro italien.",
        "Il fonde la Jeune-Italie à Marseille en 1831, puis la Jeune-Europe en 1834.",
        "Il veut faire de l'Italie une république démocratique unitaire."
      ] },
      { nom: "Victor Schœlcher", dates: "1804-1893", txt: [
        "Sous-secrétaire d'État aux colonies du gouvernement provisoire en 1848.",
        "Il prépare le décret d'abolition de l'esclavage du 27 avril 1848."
      ] },
      { nom: "Eugène Delacroix", dates: "1798-1863", txt: [
        "Peintre romantique français.",
        "En 1824, il peint les Scènes des massacres de Scio.",
        "Il peint Le 28 juillet 1830. La Liberté guidant le peuple."
      ] }
    ],
    lieux: [
      { nom: "Vienne", txt: "Capitale de l'Empire d'Autriche, où se réunit le congrès de 1814-1815 ; insurgée le 13 mars 1848." },
      { nom: "Chios", txt: "Île grecque de la mer Égée, ravagée par la flotte ottomane en 1822." },
      { nom: "Navarin", txt: "Baie du Péloponnèse où la flotte turco-égyptienne est détruite en 1827." },
      { nom: "Palerme", txt: "Ville de Sicile insurgée le 12 janvier 1848 : le premier foyer du printemps des peuples." },
      { nom: "Francfort", txt: "Ville où siège en 1848 la première assemblée élue de toute l'Allemagne." }
    ],
    trous: [
      { titre: "L'ordre de 1815 et la France", texte: "En 1815, le congrès de [Vienne], présidé par [Metternich], redessine l'Europe sans consulter les peuples. En France, Louis XVIII accorde une [charte octroyée] ; seuls les hommes payant le [cens] votent. En juillet 1830, les [Trois Glorieuses] renversent Charles X : Louis-Philippe devient « roi des Français »." },
      { titre: "Les peuples contre l'ordre de Vienne", texte: "Les opposants s'organisent en [sociétés secrètes], comme les Carbonari. Le massacre de [Chios] (1822) fait naître en Europe un mouvement de [philhellénisme] ; la Grèce devient indépendante en 1830. En 1848, le [printemps des peuples] échoue partout, mais la France adopte le [suffrage universel masculin] et abolit l'esclavage." }
    ],
    capable: [
      "Définir les notions du chapitre (légitimisme, libéralisme, charte octroyée, concert européen…).",
      "Situer les repères du chapitre et lire la carte de l'Europe de 1815.",
      "Expliquer ce que le congrès de Vienne cherche à restaurer, et par quels moyens.",
      "Expliquer pourquoi la Charte de 1814 n'est pas une constitution comme les autres.",
      "Expliquer pourquoi Charles X est renversé en trois jours.",
      "Expliquer pourquoi le mouvement des nationalités menace l'ordre de 1815.",
      "Expliquer pourquoi 1848 échoue partout et change tout de même l'Europe.",
      "Analyser une œuvre d'art comme document : ce qu'elle montre, ce qu'elle veut, à qui elle s'adresse.",
      "Comparer deux textes : la Charte de 1814 et la Charte de 1830."
    ]
  }
];
