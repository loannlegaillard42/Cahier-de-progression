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
     lieux       { nom, txt, lon?, lat? } — avec ses coordonnées (degrés, est et nord positifs), le lieu se place sur la carte
     documents   documents des fiches d'activités (au niveau du chapitre ou d'un point de passage) :
                 texte  { id?, titre, extrait, source, montre }
                 image  { id, titre, image (chemin dans rituels/), nature, auteur, date, annee?, source, credit,
                          contexte?, montre, details: [{ nom, x, y (en % de la largeur et de la hauteur), r?, txt }] }
                 — un document image ajoute l'outil « Les documents » (présenter le document, repérer ses détails)
     carte       fond de carte du chapitre (identifiant dans cartes.js : mediterranee, europe, france, atlantique-nord,
                 monde), ou liste de fonds du plus détaillé au plus large : chaque lieu va sur le premier qui le contient
     trous       textes à compléter : { titre, texte } — les mots entre [crochets] sont à retrouver
     capable     « Je suis capable de… »
     ppo         points de passage et d'ouverture, chacun avec ses propres champs :
                 { id, titre, court, question, branches: [{ titre, points }], reperes, notions, personnages, lieux,
                   documents, pieges, mots, reponse, trous, schema, capable }
                 — schema : { titre, cases: [{ titre, aide, etiquettes }] } pour l'exercice « Classer » */

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
      { num: "Chapitre 3", titre: "L'ordre seigneurial : la formation et la domination des campagnes", fiche: "5e-h2-c3" },
      { num: "Chapitre 4", titre: "L'émergence d'une nouvelle société urbaine", fiche: "5e-h2-c4" },
      { num: "Chapitre 5", titre: "L'affirmation de l'État monarchique dans le royaume des Capétiens et des Valois", fiche: "5e-h2-c5" }
    ] },
    { d: "histoire", theme: "Thème 3 · Transformations de l'Europe et ouverture sur le monde aux XVIᵉ et XVIIᵉ siècles", chapitres: [
      { num: "Chapitre 6", titre: "Le monde au temps de Charles Quint et Soliman le Magnifique", fiche: "5e-h3-c6" },
      { num: "Chapitre 7", titre: "Humanisme, réformes et conflits religieux", fiche: "5e-h3-c7" },
      { num: "Chapitre 8", titre: "Du Prince de la Renaissance au roi absolu", fiche: "5e-h3-c8" }
    ] },
    { d: "geo", theme: "Thème 1 · La question démographique et l'inégal développement", chapitres: [
      { num: "Chapitre 1", titre: "La croissance démographique et ses effets", fiche: "5e-g1-c1" },
      { num: "Chapitre 2", titre: "Répartition de la richesse et de la pauvreté dans le monde", fiche: "5e-g1-c2" }
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
      { num: "Introduction", titre: "La périodisation", fiche: "2de-h0-intro" }
    ] },
    { d: "histoire", theme: "Thème 1 · Le monde méditerranéen : empreintes de l'Antiquité et du Moyen Âge", chapitres: [
      { num: "Chapitre 1", titre: "La Méditerranée antique : les empreintes grecques et romaines", fiche: "2de-h1-c1" },
      { num: "Chapitre 2", titre: "La Méditerranée médiévale : espace d'échanges et de conflits à la croisée de trois civilisations", fiche: "2de-h1-c2" }
    ] },
    { d: "histoire", theme: "Thème 2 · XVᵉ-XVIᵉ siècles : un nouveau rapport au monde, un temps de mutation intellectuelle", chapitres: [
      { num: "Chapitre 3", titre: "L'ouverture atlantique : les conséquences de la découverte du « Nouveau Monde »", fiche: "2de-h2-c3" },
      { num: "Chapitre 4", titre: "Renaissance, Humanisme et réformes religieuses : les mutations de l'Europe", fiche: "2de-h2-c4" }
    ] },
    { d: "histoire", theme: "Thème 3 · L'État à l'époque moderne : France et Angleterre", chapitres: [
      { num: "Chapitre 5", titre: "L'affirmation de l'État dans le royaume de France", fiche: "2de-h3-c5" },
      { num: "Chapitre 6", titre: "Le modèle britannique et son influence", fiche: "2de-h3-c6" }
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
      { num: "Chapitre 3", titre: "La difficile entrée dans l'âge démocratique : la Deuxième République et le Second Empire", fiche: "1re-h2-c3" },
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
      { num: "Questions 1 et 2", titre: "Les villes à l'échelle mondiale : le poids croissant des métropoles ; des métropoles inégales et en mutation", fiche: "1re-g1-c12" },
      { num: "Question spécifique", titre: "La France : la métropolisation et ses effets", fiche: "1re-g1-qs" }
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
     5e — HISTOIRE — Thème 2, chapitre 3
     ===================================================================== */
  {
    id: "5e-h2-c3", n: "5e", d: "histoire", carte: "france",
    theme: "Société, Église et pouvoir politique dans l'Occident féodal (XIᵉ-XVᵉ siècle)",
    rituel: "Société, Église et pouvoir féodal (XIe-XVe s.)",
    num: "Chapitre 3",
    titre: "L'ordre seigneurial : la formation et la domination des campagnes",
    question: "Comment les seigneurs organisent-ils leur domination sur les hommes dans les campagnes en formation ?",
    plan: [
      "Des campagnes organisées en seigneurie : la seigneurie, les liens entre seigneurs (vassalité), la vie des seigneurs",
      "Le dynamisme économique de la seigneurie : les obligations des paysans, les défrichements"
    ],
    cle: "Dans les campagnes, le seigneur domine les terres et les hommes. Cette domination repose sur des obligations réciproques, dans des campagnes en pleine expansion entre le XIᵉ et le XIVᵉ siècle.",
    essentiel: [
      "Au Moyen Âge, les campagnes sont organisées en seigneuries. Le seigneur y exerce son pouvoir : il possède les terres, rend la justice et protège les habitants. Une seigneurie comprend le château, le village, les champs (tenures et réserve), les moulins et l'église.",
      "Il existe des seigneuries laïques, dirigées par un noble, et des seigneuries ecclésiastiques, dirigées par des membres du clergé, comme celle du couvent des Billettes, près de Paris.",
      "Les seigneurs sont unis entre eux par la cérémonie de l'hommage : le vassal jure fidélité à un seigneur plus puissant, qui lui donne un fief. Le vassal doit conseil et aide ; le seigneur doit protection et soutien. Ces liens forment la féodalité.",
      "Les seigneurs sont des chevaliers : ils combattent aux côtés de leur seigneur, s'entraînent dans des tournois, organisent des banquets et pratiquent l'amour courtois. Chrétiens, ils font appel à un prêtre à l'approche de la mort.",
      "Les paysans, serfs ou vilains (libres), doivent au seigneur des corvées, des taxes en nature (comme le champart, une part de la récolte) et en argent (le cens), et des banalités pour utiliser le moulin et le four. Ils versent aussi la dîme à l'Église. En échange, le seigneur les protège.",
      "Entre le XIᵉ et le début du XIVᵉ siècle, les campagnes sont en plein essor : la charrue se répand, la population de l'Europe passe d'environ 42 à 73 millions d'habitants entre 1000 et 1300, et les défrichements créent de nouveaux champs et de nouveaux villages, qui rapportent de nouveaux revenus au seigneur. Peu à peu, la domination seigneuriale s'assouplit : certains seigneurs accordent des chartes de franchise ou vendent leur liberté à des serfs."
    ],
    periodes: [
      { de: 1000, a: 1500, nom: "L'Occident féodal (XIᵉ-XVᵉ siècle)", court: "Occident féodal" },
      { de: 1000, a: 1300, nom: "Grands défrichements et essor des campagnes", court: "Grands défrichements" }
    ],
    reperes: [
      { a: 1000, b: 1300, date: "XIᵉ-XIIIᵉ siècle", txt: "Grands défrichements : la forêt recule, de nouveaux champs et de nouveaux villages apparaissent." },
      { a: 1000, b: 1300, date: "1000-1300", txt: "La population de l'Europe passe d'environ 42 à 73 millions d'habitants." },
      { a: 1020, date: "1020", txt: "Dans une lettre au duc d'Aquitaine, l'évêque Fulbert de Chartres décrit les devoirs du vassal et du seigneur." },
      { a: 1030, date: "vers 1030", txt: "L'évêque Adalbéron de Laon décrit une société en trois ordres : ceux qui prient, ceux qui combattent, ceux qui travaillent." },
      { a: 1100, b: 1200, date: "XIIᵉ siècle", txt: "La charrue à soc de fer et à versoir se répand : la terre est mieux labourée, les récoltes augmentent." },
      { a: 1187, date: "1187", txt: "Philippe Auguste confirme la charte de franchise de Lorris : les habitants paient moins de taxes et ne doivent la corvée qu'une fois par an." },
      { a: 1200, b: 1300, date: "XIIIᵉ siècle", txt: "La complainte des vilains de Verson, en Normandie, énumère les obligations des paysans envers leur seigneur." },
      { a: 1248, date: "1248", txt: "L'abbaye de Saint-Denis affranchit les serfs de plusieurs villages, qui paient 1 700 livres pour leur liberté." }
    ],
    notions: [
      { mot: "Seigneurie", def: "Domaine sur lequel un seigneur exerce son pouvoir (justice, administration, protection)." },
      { mot: "Réserve", def: "Champs que le seigneur garde pour lui ; ce sont les paysans qui les cultivent." },
      { mot: "Tenure", def: "Champ loué au paysan, qu'il cultive pour son propre usage en échange de taxes et de corvées." },
      { mot: "Hommage", def: "Cérémonie au cours de laquelle le vassal place ses mains dans celles de son seigneur et lui jure fidélité." },
      { mot: "Vassal", def: "Seigneur qui prête serment de fidélité à un seigneur plus puissant, en échange d'un fief." },
      { mot: "Fief", def: "Terre (ou château, ou droit de percevoir des taxes) donnée par un seigneur à son vassal lors de la cérémonie de l'hommage." },
      { mot: "Féodalité", def: "Ensemble des liens personnels entre seigneurs, fondés sur l'hommage et des obligations réciproques." },
      { mot: "Chevalier", def: "Guerrier noble qui combat à cheval, armé et protégé par une armure." },
      { mot: "Serf", def: "Paysan qui appartient à son seigneur : il ne peut ni quitter la seigneurie ni se marier sans son autorisation, et ses enfants sont serfs à leur tour." },
      { mot: "Vilain", def: "Paysan libre, qui doit tout de même de nombreuses obligations à son seigneur." },
      { mot: "Corvée", def: "Journées de travail gratuit que les paysans doivent au seigneur, par exemple pour cultiver la réserve." },
      { mot: "Banalités", def: "Taxes payées au seigneur pour utiliser son moulin, son four ou son pressoir : les paysans n'ont pas le droit d'en utiliser d'autres." },
      { mot: "Dîme", def: "Impôt versé à l'Église, environ un dixième des récoltes." },
      { mot: "Défrichement", def: "Destruction volontaire de zones boisées pour gagner de nouvelles terres cultivables." },
      { mot: "Croissance agricole", def: "Augmentation de la production agricole, grâce aux progrès des techniques et à l'extension des terres cultivées." }
    ],
    personnages: [
      { nom: "Fulbert de Chartres", dates: "vers 960-1028", txt: [
        "Évêque d'une grande ville de la Beauce au début du XIᵉ siècle.",
        "On lui demande d'expliquer ce que se doivent un seigneur et son vassal.",
        "En 1020, il écrit au duc d'Aquitaine pour décrire leurs devoirs réciproques.",
        "Selon lui, le vassal doit à son seigneur « le conseil et l'aide »."
      ] },
      { nom: "Adalbéron de Laon", dates: "mort vers 1030", txt: [
        "Évêque d'une ville du nord du royaume de France au début du XIᵉ siècle.",
        "Vers 1030, il écrit un poème adressé au roi Robert le Pieux.",
        "Il y décrit une société divisée en trois ordres : ceux qui prient, ceux qui combattent et ceux qui travaillent."
      ] }
    ],
    lieux: [
      { nom: "Couvent des Billettes (Paris)", lon: 2.36, lat: 48.86, txt: "Couvent de Paris, devenu riche grâce au pèlerinage né d'un miracle : il achète des terres près de Paris et forme une seigneurie ecclésiastique." },
      { nom: "Verson", lon: -0.46, lat: 49.15, txt: "Village de Normandie, près de Caen ; au XIIIᵉ siècle, la complainte de ses vilains énumère les obligations des paysans." },
      { nom: "Chartres", lon: 1.49, lat: 48.45, txt: "Ville de l'évêque Fulbert, qui décrit en 1020 les devoirs du vassal et du seigneur." },
      { nom: "Laon", lon: 3.62, lat: 49.56, txt: "Ville de l'évêque Adalbéron, qui décrit vers 1030 la société des trois ordres." },
      { nom: "Lorris", lon: 2.51, lat: 47.89, txt: "Bourg du Gâtinais dont la charte de franchise, confirmée par Philippe Auguste en 1187, allège les taxes et les corvées." },
      { nom: "Saint-Denis", lon: 2.36, lat: 48.94, txt: "Abbaye près de Paris qui, en 1248, affranchit les serfs de plusieurs villages contre de l'argent." }
    ],
    trous: [
      { titre: "La seigneurie", texte: "Les campagnes sont organisées en [seigneuries], qui comprennent les [seigneurs], les [paysans] et l'Église. La seigneurie possède un [domaine seigneurial] (habitation du seigneur, lieu de justice et d'administration), un village où vivent les paysans, des champs (les [tenures], cultivées par les paysans pour leur usage, et la [réserve], cultivée pour le seigneur), des [moulins] et une [église] qui encadre la vie religieuse. Il existe des seigneuries laïques et des seigneuries [ecclésiastiques], comme celle du couvent des Billettes." },
      { titre: "Seigneurs et vassaux", texte: "L'organisation féodale repose sur la cérémonie de l'[hommage], qui établit des liens d'homme à homme. Un seigneur [vassal] prête serment à un seigneur plus puissant qui, en échange, lui donne un [fief] (une terre). Le vassal doit [conseil] et [aide] à son seigneur ; le seigneur doit protection et soutien à son vassal. Cet ensemble de liens entre seigneurs constitue la [féodalité]. Les seigneurs sont des [chevaliers] : ils s'affrontent lors de [tournois] et pratiquent l'[amour courtois]." },
      { titre: "Les paysans et l'essor des campagnes", texte: "Le [serf] appartient à son seigneur ; le [vilain] est un paysan libre. Tous doivent au seigneur des journées de travail gratuit, la [corvée], et des taxes en nature ou en argent. Ils paient aussi pour utiliser le moulin et le four du seigneur : ce sont les [banalités]. À partir du XIIᵉ siècle, les outils deviennent plus performants avec la [charrue] : les campagnes s'enrichissent. Pour nourrir davantage d'habitants, les hommes pratiquent le [défrichement] : ils font reculer la [forêt] pour créer de nouveaux champs et de nouveaux villages. Le seigneur, qui perçoit des taxes sur ces nouvelles terres, en tire de nouveaux [revenus]." }
    ],
    capable: [
      "Décrire l'organisation d'une seigneurie : ses lieux et leur fonction.",
      "Distinguer une seigneurie laïque d'une seigneurie ecclésiastique.",
      "Décrire la cérémonie de l'hommage et les devoirs réciproques du seigneur et du vassal.",
      "Expliquer ce qu'est la féodalité.",
      "Décrire la vie des seigneurs : banquets, tournois, guerre, amour courtois, vie chrétienne.",
      "Distinguer un serf d'un vilain.",
      "Classer les obligations des paysans : corvées, taxes en nature, taxes en argent, banalités.",
      "Expliquer les causes et les conséquences des défrichements.",
      "Présenter un document : nature, date, auteur, source.",
      "Raconter la journée d'un seigneur en utilisant le vocabulaire du chapitre."
    ]
  },

  /* =====================================================================
     5e — HISTOIRE — Thème 2, chapitre 4
     ===================================================================== */
  {
    id: "5e-h2-c4", n: "5e", d: "histoire", carte: "europe",
    theme: "Société, Église et pouvoir politique dans l'Occident féodal (XIᵉ-XVᵉ siècle)",
    rituel: "Société, Église et pouvoir féodal (XIe-XVe s.)",
    num: "Chapitre 4",
    titre: "L'émergence d'une nouvelle société urbaine",
    question: "Pourquoi et comment les villes se développent-elles au Moyen Âge, et comment leur société est-elle organisée ?",
    plan: [
      "Le développement des villes au Moyen Âge : l'essor des villes et le grand commerce",
      "Étude de cas : Paris, ville médiévale (centre économique, politique, religieux et culturel)",
      "Vivre en ville au Moyen Âge : habiter la ville, une société urbaine hiérarchisée"
    ],
    cle: "Au Moyen Âge, les villes grandissent grâce à la croissance des campagnes et au grand commerce. Elles font naître une nouvelle société, plus libre que celle des campagnes féodales, mais hiérarchisée.",
    essentiel: [
      "Entre le XIᵉ et le XIVᵉ siècle, la croissance agricole permet de mieux nourrir la population, qui augmente. Une partie des habitants s'installe en ville. Au milieu du XIVᵉ siècle, environ 20 % des Européens vivent en ville : c'est une minorité, mais les villes jouent un rôle économique, politique et culturel majeur.",
      "Les villes se développent grâce au grand commerce. L'Italie du Nord (Venise, Gênes, Florence, Milan) et les Flandres (Bruges, Gand, Ypres) sont les régions les plus urbanisées. Entre les deux, les foires de Champagne (Troyes, Provins…) permettent aux marchands du Nord et du Sud de se rencontrer.",
      "Paris ne cesse de grandir : Philippe Auguste l'entoure d'une enceinte à partir de 1190, puis une nouvelle enceinte, bien plus vaste, est bâtie entre 1356 et 1383 (enceinte de Charles V). Artisans et marchands y sont organisés en corporations, qui fixent les règles de chaque métier.",
      "Paris est aussi un centre politique, religieux et culturel. Philippe Auguste en fait la capitale du royaume et y fait construire le Louvre. La cathédrale Notre-Dame (1163-1345) domine la ville ; à l'Hôtel-Dieu, l'Église soigne les malades et les pauvres ; en 1257, Robert de Sorbon fonde la Sorbonne pour les étudiants pauvres en théologie.",
      "La ville est un espace de liberté : le bourgeois est libre et ne doit pas les corvées des paysans. Grâce aux chartes de franchise, les habitants s'administrent eux-mêmes, avec un maire (à Paris, le prévôt des marchands) et des échevins. Mais la vie urbaine est difficile : pas d'égouts, risque d'incendie, insécurité la nuit.",
      "La société urbaine est hiérarchisée : au sommet, le seigneur, les échevins et le clergé ; puis les marchands et les maîtres artisans ; puis le petit peuple et les apprentis, qui forment la majorité ; enfin, les exclus (mendiants, vagabonds, lépreux, minorités)."
    ],
    periodes: [
      { de: 1000, a: 1350, nom: "Essor des villes et du grand commerce", court: "Essor des villes" },
      { de: 1163, a: 1345, nom: "Construction de Notre-Dame de Paris", court: "Notre-Dame" }
    ],
    reperes: [
      { a: 1000, b: 1350, date: "XIᵉ-XIVᵉ siècle", txt: "Grâce à la croissance agricole et au grand commerce, les villes se développent dans toute l'Europe." },
      { a: 1163, date: "1163", txt: "Début de la construction de la cathédrale Notre-Dame de Paris, à l'initiative de l'évêque Maurice de Sully." },
      { a: 1190, date: "à partir de 1190", txt: "Philippe Auguste entoure Paris d'une enceinte fortifiée et fait construire le Louvre." },
      { a: 1200, b: 1300, date: "XIIIᵉ siècle", txt: "Venise et Paris atteignent 100 000 habitants." },
      { a: 1257, date: "1257", txt: "Robert de Sorbon fonde à Paris un collège pour les étudiants pauvres en théologie : la Sorbonne." },
      { a: 1268, date: "vers 1268", txt: "Étienne Boileau, prévôt de Paris, rassemble les règlements des métiers parisiens dans le Livre des métiers." },
      { a: 1345, date: "vers 1345", txt: "Fin des travaux de la cathédrale Notre-Dame de Paris." },
      { a: 1350, date: "milieu du XIVᵉ siècle", txt: "Environ 20 % des Européens vivent en ville." },
      { a: 1356, b: 1383, date: "1356-1383", txt: "Construction de l'enceinte de Charles V, bien plus vaste que celle de Philippe Auguste." }
    ],
    notions: [
      { mot: "Ville", def: "Espace densément peuplé, avec des activités et des constructions particulières, qui donne naissance à une société urbaine." },
      { mot: "Grand commerce", def: "Échange de marchandises sur de longues distances, entre grandes régions d'Europe et au-delà." },
      { mot: "Foire", def: "Grand rassemblement commercial qui revient régulièrement, où se rencontrent des marchands et des produits venus de loin." },
      { mot: "Bourgeois", def: "Habitant libre d'un bourg (une ville), qui ne doit pas les obligations des paysans des campagnes." },
      { mot: "Corporation", def: "Association qui regroupe tous les artisans ou marchands d'un même métier et qui en fixe les règles." },
      { mot: "Apprenti", def: "Jeune qui apprend un métier pendant plusieurs années chez un maître artisan." },
      { mot: "Prévôt", def: "Officier du roi chargé de la justice, de la police et des impôts dans une ville." },
      { mot: "Enceinte", def: "Muraille fortifiée qui entoure et protège une ville." },
      { mot: "Capitale", def: "Ville où résident le roi et son gouvernement : le centre du pouvoir politique du royaume." },
      { mot: "Cathédrale", def: "Église où siège un évêque : la principale église d'un diocèse." },
      { mot: "Hôtel-Dieu", def: "Hôpital tenu par l'Église, où des religieuses soignent les malades et les pauvres." },
      { mot: "Université", def: "Lieu d'enseignement supérieur où l'on étudie la théologie, le droit ou la médecine, en latin." },
      { mot: "Échevin", def: "Magistrat élu qui participe à l'administration d'une ville, aux côtés du maire, du prévôt ou du comte." },
      { mot: "Charte de franchise", def: "Texte accordé par le roi ou un seigneur, qui donne des libertés à une ville, comme le droit de s'administrer elle-même." }
    ],
    personnages: [
      { nom: "Philippe Auguste", dates: "roi de 1180 à 1223", txt: [
        "Roi de France à la fin du XIIᵉ et au début du XIIIᵉ siècle.",
        "À partir de 1190, il fait entourer Paris d'une grande enceinte fortifiée.",
        "Il fait construire le Louvre, une forteresse qui protège la ville.",
        "Il fait de Paris la capitale du royaume : les documents royaux y sont désormais conservés."
      ] },
      { nom: "Maurice de Sully", dates: "vers 1120-1196", txt: [
        "Évêque de Paris au XIIᵉ siècle.",
        "En 1163, il lance un immense chantier dans l'île de la Cité.",
        "Sa cathédrale gothique, financée par les dons des fidèles, est achevée vers 1345."
      ] },
      { nom: "Étienne Boileau", dates: "vers 1200-1270", txt: [
        "Officier au service du roi Louis IX, au XIIIᵉ siècle.",
        "Prévôt de Paris, il est chargé de la justice, de la police et des impôts de la ville.",
        "Vers 1268, il rassemble par écrit les règlements de tous les métiers parisiens dans le Livre des métiers."
      ] },
      { nom: "Robert de Sorbon", dates: "1201-1274", txt: [
        "Homme d'Église et maître en théologie à Paris, au XIIIᵉ siècle.",
        "Il veut aider les étudiants pauvres qui veulent étudier la théologie.",
        "En 1257, il fonde pour eux un collège qui porte son nom, dans le quartier latin."
      ] },
      { nom: "Charles V", dates: "roi de 1364 à 1380", txt: [
        "Roi de France au XIVᵉ siècle.",
        "Paris a débordé de ses anciens murs : de nouveaux quartiers sont nés au-dehors.",
        "Une nouvelle enceinte de Paris, bâtie entre 1356 et 1383, porte son nom."
      ] }
    ],
    lieux: [
      { nom: "Paris", lon: 2.35, lat: 48.85, txt: "Capitale du royaume : un centre économique (corporations), politique (Louvre), religieux (Notre-Dame, Hôtel-Dieu) et culturel (Sorbonne)." },
      { nom: "Venise", lon: 12.34, lat: 45.44, txt: "Grande ville marchande d'Italie du Nord, qui atteint 100 000 habitants au XIIIᵉ siècle." },
      { nom: "Gênes", lon: 8.93, lat: 44.41, txt: "Port d'Italie du Nord, tourné vers le commerce en Méditerranée." },
      { nom: "Florence", lon: 11.26, lat: 43.77, txt: "Ville d'Italie du Nord, riche de ses marchands et de ses artisans." },
      { nom: "Bruges", lon: 3.22, lat: 51.21, txt: "Grande ville marchande des Flandres, en Europe du Nord." },
      { nom: "Gand", lon: 3.72, lat: 51.05, txt: "Ville des Flandres, célèbre pour la fabrication des draps." },
      { nom: "Troyes", lon: 4.07, lat: 48.30, txt: "Ville des foires de Champagne, où se rencontrent les marchands d'Italie et des Flandres." },
      { nom: "Provins", lon: 3.30, lat: 48.56, txt: "Autre ville des foires de Champagne, à mi-chemin entre l'Italie du Nord et les Flandres." },
      { nom: "Italie du Nord", txt: "Région très urbanisée (Venise, Gênes, Florence, Milan), reliée à l'Orient par la Méditerranée." },
      { nom: "Flandres", txt: "Région très urbanisée d'Europe du Nord (Bruges, Gand, Ypres), spécialisée dans les draps." }
    ],
    trous: [
      { titre: "L'essor des villes", texte: "Entre le XIᵉ et le XIVᵉ siècle, la [croissance agricole] des campagnes permet à la population européenne d'augmenter fortement. Une partie de cette population s'installe dans des villes, qui se développent grâce à l'essor du [grand commerce]. L'[Italie du Nord] et les [Flandres] sont des régions particulièrement urbanisées, reliées entre elles par les [foires de Champagne]. Ainsi, [Venise] ou [Paris] atteignent [100 000] habitants au XIIIᵉ siècle. Le monde urbain reste toutefois minoritaire : environ [20 %] des Européens vivent en ville au milieu du XIVᵉ siècle." },
      { titre: "Paris, une ville aux pouvoirs multiples", texte: "Paris ne cesse de s'agrandir : le roi [Philippe Auguste] fait construire une première enceinte à partir de 1190 ; une seconde, bien plus vaste, est bâtie entre 1356 et 1383 : l'enceinte de [Charles V]. Les artisans et les marchands sont organisés en [corporations], qui fixent les règles de chaque métier. Philippe Auguste fait de Paris la [capitale] du royaume et y fait construire le [Louvre]. La cathédrale [Notre-Dame] domine la ville ; à l'[Hôtel-Dieu], l'Église soigne les malades et les pauvres. Au XIIIᵉ siècle, Robert de Sorbon fonde la [Sorbonne] pour les étudiants pauvres en théologie." },
      { titre: "Vivre en ville", texte: "La ville est un espace de liberté par rapport aux campagnes féodales : les rois et les seigneurs accordent souvent des [chartes de franchise], qui permettent aux [bourgeois] de s'administrer eux-mêmes, avec à leur tête un maire et des [échevins]. Mais la vie urbaine reste difficile : [hygiène] précaire, risques d'[incendie], insécurité la nuit. La société urbaine est [hiérarchisée] : au sommet, le seigneur, les échevins et le clergé ; puis les marchands et les maîtres artisans, organisés en corporations ; puis le [petit peuple] et les apprentis ; enfin, les [exclus] (mendiants, vagabonds, minorités), en marge de la société urbaine." }
    ],
    capable: [
      "Expliquer le lien entre la croissance agricole et le développement des villes.",
      "Situer sur une carte l'Italie du Nord, les Flandres et les foires de Champagne.",
      "Réaliser un croquis du grand commerce avec une légende organisée (lieux, routes, produits).",
      "Décrire l'agrandissement de Paris grâce à ses enceintes successives.",
      "Expliquer le rôle d'une corporation à partir d'un règlement de métier.",
      "Montrer que Paris est un centre économique, politique, religieux et culturel.",
      "Expliquer en quoi la ville offre plus de liberté que la campagne.",
      "Citer des difficultés de la vie en ville au Moyen Âge.",
      "Construire le schéma de la société urbaine hiérarchisée.",
      "Répondre à la question de départ du chapitre."
    ]
  },

  /* =====================================================================
     5e — HISTOIRE — Thème 2, chapitre 5
     ===================================================================== */
  {
    id: "5e-h2-c5", n: "5e", d: "histoire", carte: "france",
    theme: "Société, Église et pouvoir politique dans l'Occident féodal (XIᵉ-XVᵉ siècle)",
    rituel: "Société, Église et pouvoir féodal (XIe-XVe s.)",
    num: "Chapitre 5",
    titre: "L'affirmation de l'État monarchique dans le royaume des Capétiens et des Valois",
    question: "Comment le pouvoir royal s'affirme-t-il en France entre le Xᵉ et le XVᵉ siècle ?",
    plan: [
      "Une lente affirmation du pouvoir monarchique : Hugues Capet, Philippe Auguste, Louis IX",
      "La construction progressive de l'État monarchique : Philippe le Bel, Charles VII et la guerre de Cent Ans, Louis XI"
    ],
    cle: "Entre le Xᵉ et le XVᵉ siècle, le roi de France passe d'un pouvoir faible, limité à un petit domaine, à un pouvoir souverain sur tout le royaume. Cette évolution est lente et connaît des crises, mais à la fin du XVᵉ siècle la France est un État monarchique solide.",
    essentiel: [
      "En 987, Hugues Capet est élu roi. Il ne possède qu'un petit domaine royal, en Île-de-France et dans l'Orléanais. Ses successeurs restent longtemps des rois faibles : ils ne sont que les suzerains de grands seigneurs, parfois plus puissants qu'eux.",
      "Philippe Auguste (1180-1223) renforce son pouvoir : il confie la justice à des baillis, fait de Paris la capitale du royaume et remporte la victoire de Bouvines en 1214. Il devient un roi souverain : on passe du « roi des Francs » au « roi de France ».",
      "Louis IX (1226-1270), ou Saint Louis, impose la monnaie royale dans tout le royaume et contrôle ses officiers (Grande Ordonnance de 1254). Il rend la justice, même envers les seigneurs. Modèle du roi chrétien, il part en croisade en 1248 et il est canonisé en 1297. Mais il impose aussi aux Juifs du royaume un signe distinctif : c'est une discrimination.",
      "Philippe le Bel (1285-1314) s'entoure de légistes, des conseillers formés au droit. Pour affirmer qu'il est seul maître dans son royaume, il s'oppose au pape Boniface VIII, que ses hommes arrêtent en 1303. En 1302, il réunit les premiers états généraux pour obtenir le soutien du royaume.",
      "En 1328, les Capétiens n'ont plus d'héritier direct : Philippe VI de Valois devient roi. La guerre de Cent Ans (1337-1453) oppose les rois de France et d'Angleterre. Après un début de règne fragile, Charles VII redresse le royaume : aidé par Jeanne d'Arc, il est sacré à Reims en 1429 ; il crée une armée permanente (1445) et un impôt permanent, et chasse les Anglais, sauf de Calais.",
      "Louis XI (1461-1483) soumet les grands seigneurs, par la ruse ou par la force, et agrandit le royaume. À la fin du XVᵉ siècle, la France est devenue un État monarchique solide, même si le roi reste soumis à certaines règles fondamentales."
    ],
    periodes: [
      { de: 987, a: 1328, nom: "Les Capétiens directs", court: "Capétiens" },
      { de: 1328, a: 1483, nom: "Les Valois, de Philippe VI à Louis XI", court: "Valois" },
      { de: 1337, a: 1453, nom: "Guerre de Cent Ans" }
    ],
    reperes: [
      { a: 987, date: "987", txt: "Hugues Capet est élu roi : début de la dynastie des Capétiens." },
      { a: 1190, date: "1190", txt: "Par une ordonnance, Philippe Auguste confie la justice aux baillis et fait apporter les redevances royales à Paris." },
      { a: 1214, date: "1214", txt: "Victoire de Philippe Auguste à Bouvines : l'autorité du roi est renforcée." },
      { a: 1254, date: "1254", txt: "Grande Ordonnance de Louis IX pour contrôler ses officiers (baillis et prévôts)." },
      { a: 1297, date: "1297", txt: "Louis IX est canonisé par l'Église : il devient Saint Louis." },
      { a: 1302, date: "1302", txt: "Philippe le Bel réunit les premiers états généraux." },
      { a: 1303, date: "1303", txt: "Les hommes de Philippe le Bel arrêtent le pape Boniface VIII à Anagni." },
      { a: 1328, date: "1328", txt: "Charles IV meurt sans fils : fin des Capétiens directs. Philippe VI, premier roi Valois, monte sur le trône." },
      { a: 1337, b: 1453, date: "1337-1453", txt: "Guerre de Cent Ans entre les rois de France et d'Angleterre." },
      { a: 1429, date: "1429", txt: "Grâce à Jeanne d'Arc, Charles VII est sacré à Reims." },
      { a: 1445, date: "1445", txt: "Charles VII crée les compagnies d'ordonnance : une armée permanente." },
      { a: 1461, b: 1483, date: "1461-1483", txt: "Règne de Louis XI, qui soumet les grands seigneurs et agrandit le royaume." }
    ],
    notions: [
      { mot: "Domaine royal", def: "Territoire sur lequel le roi exerce directement son pouvoir, sans seigneur intermédiaire." },
      { mot: "Suzerain", def: "Seigneur dont dépendent des vassaux. Un roi suzerain n'est que le premier parmi des seigneurs puissants." },
      { mot: "Souverain", def: "Roi qui exerce une autorité supérieure sur tout le royaume, au-dessus de tous les seigneurs." },
      { mot: "Sacre", def: "Cérémonie religieuse qui donne au roi un caractère sacré." },
      { mot: "Bailli", def: "Officier royal chargé de rendre la justice et de faire appliquer les décisions du roi dans une circonscription, le bailliage." },
      { mot: "Monnaie royale", def: "Pièces frappées au nom du roi ; leur usage obligatoire dans tout le royaume renforce l'autorité royale." },
      { mot: "Justice royale", def: "Justice rendue par le roi ou en son nom, qui s'impose peu à peu au-dessus de celle des seigneurs." },
      { mot: "Légiste", def: "Conseiller du roi formé au droit, qui l'aide à administrer le royaume et à faire les lois." },
      { mot: "États généraux", def: "Assemblée de représentants du clergé, de la noblesse et du peuple (bourgeois des villes), convoquée par le roi." },
      { mot: "Église gallicane", def: "Église de France qui se veut largement indépendante du pape et reconnaît l'autorité du roi." },
      { mot: "Guerre de Cent Ans", def: "Long conflit (1337-1453) entre les rois de France et d'Angleterre pour la couronne de France." },
      { mot: "Armée permanente", def: "Armée de soldats professionnels, entretenue en temps de paix comme en temps de guerre, payée régulièrement par le roi." },
      { mot: "Impôt permanent", def: "Impôt levé chaque année par le roi, et non plus seulement en cas de guerre, pour payer son armée." },
      { mot: "État", def: "Territoire délimité par des frontières, sur lequel s'exerce un pouvoir souverain, administré par des personnes au service du roi." },
      { mot: "État monarchique", def: "État dirigé par un roi (un monarque), qui exerce son pouvoir au-dessus de tous mais reste soumis à certaines règles fondamentales." }
    ],
    personnages: [
      { nom: "Hugues Capet", dates: "roi de 987 à 996", txt: [
        "Duc des Francs, l'un des grands seigneurs du royaume au Xᵉ siècle.",
        "En 987, il est élu roi par les grands du royaume.",
        "Il ne possède qu'un petit domaine royal, en Île-de-France et dans l'Orléanais.",
        "Il fonde une dynastie : ses descendants directs règnent sur la France jusqu'en 1328."
      ] },
      { nom: "Philippe Auguste", dates: "roi de 1180 à 1223", txt: [
        "Roi de France à la fin du XIIᵉ et au début du XIIIᵉ siècle.",
        "Par une ordonnance de 1190, il confie la justice à des baillis.",
        "Il fait de Paris la capitale du royaume et y fait construire le Louvre.",
        "En 1214, il remporte la victoire de Bouvines."
      ] },
      { nom: "Louis IX", dates: "roi de 1226 à 1270", txt: [
        "Petit-fils du roi vainqueur à Bouvines.",
        "Par la Grande Ordonnance de 1254, il contrôle ses baillis et ses prévôts.",
        "Il impose aux Juifs du royaume le port d'un signe distinctif, une roue de tissu.",
        "Parti en croisade en 1248, il est déclaré saint par l'Église en 1297."
      ] },
      { nom: "Philippe le Bel", dates: "roi de 1285 à 1314", txt: [
        "Roi de France à la fin du XIIIᵉ et au début du XIVᵉ siècle.",
        "Il s'entoure de légistes, des conseillers formés au droit.",
        "En 1302, il réunit les premiers états généraux.",
        "En 1303, ses hommes arrêtent le pape Boniface VIII à Anagni."
      ] },
      { nom: "Jeanne d'Arc", dates: "vers 1412-1431", txt: [
        "Jeune femme qui joue un grand rôle pendant la guerre de Cent Ans.",
        "Elle redonne courage aux troupes du roi et permet son sacre à Reims en 1429.",
        "Capturée, elle est condamnée et brûlée à Rouen en 1431.",
        "En 1456, le roi obtient sa réhabilitation."
      ] },
      { nom: "Charles VII", dates: "roi de 1422 à 1461", txt: [
        "Roi de France pendant la guerre de Cent Ans.",
        "Au début de son règne, il ne contrôle qu'une partie du royaume : il a dû fuir Paris en 1418.",
        "Aidé par Jeanne d'Arc, il est sacré à Reims en 1429.",
        "En 1445, il crée une armée permanente : les compagnies d'ordonnance."
      ] },
      { nom: "Louis XI", dates: "roi de 1461 à 1483", txt: [
        "Roi de France à la fin du XVᵉ siècle.",
        "Il s'habille simplement et déteste les cérémonies, mais il est très intelligent.",
        "Un chroniqueur le surnomme « l'universelle araigne » pour sa capacité à prendre ses ennemis au piège.",
        "Il soumet les grands seigneurs : le duc de Nemours est décapité en 1477."
      ] }
    ],
    lieux: [
      { nom: "Paris", lon: 2.35, lat: 48.85, txt: "Capitale du royaume depuis Philippe Auguste : les documents et les redevances du roi y sont rassemblés." },
      { nom: "Saint-Denis", lon: 2.36, lat: 48.94, txt: "Abbaye près de Paris où sont enterrés les rois de France, comme Hugues Capet et Philippe Auguste." },
      { nom: "Bouvines", lon: 3.19, lat: 50.58, txt: "Village du nord du royaume où Philippe Auguste bat, en 1214, l'empereur, le comte de Flandre et leurs alliés." },
      { nom: "Reims", lon: 4.03, lat: 49.26, txt: "Ville du sacre des rois de France ; Charles VII y est sacré en 1429, grâce à Jeanne d'Arc." },
      { nom: "Anagni", lon: 13.16, lat: 41.74, txt: "Ville d'Italie où les hommes de Philippe le Bel arrêtent le pape Boniface VIII en 1303." },
      { nom: "Orléans", lon: 1.91, lat: 47.90, txt: "Ville du domaine royal d'Hugues Capet, où une école de droit forme des légistes ; Jeanne d'Arc la délivre des Anglais en 1429." },
      { nom: "Rouen", lon: 1.10, lat: 49.44, txt: "Ville de Normandie où Jeanne d'Arc est condamnée et brûlée en 1431." },
      { nom: "Calais", lon: 1.86, lat: 50.95, txt: "Port du nord du royaume : la seule ville que les Anglais gardent à la fin de la guerre de Cent Ans." },
      { nom: "Île-de-France", txt: "Région autour de Paris, cœur du domaine royal des premiers Capétiens." }
    ],
    trous: [
      { titre: "Du roi faible au roi souverain", texte: "En 987, Hugues Capet devient roi, mais il ne possède qu'un [domaine royal] restreint, en Île-de-France et dans l'Orléanais : c'est un roi [faible] face à de puissants seigneurs. Sous Philippe Auguste (1180-1223), la victoire de [Bouvines] en 1214 renforce considérablement l'autorité royale. Le roi s'appuie sur des officiers royaux, les [baillis], et fait de [Paris] la capitale du royaume. Louis IX, resté dans l'histoire sous le nom de [Saint Louis], impose la [monnaie royale] dans tout le royaume et réforme la justice par la Grande Ordonnance de [1254]." },
      { titre: "Philippe le Bel et Charles VII", texte: "Philippe le Bel (1285-1314) s'entoure de [légistes], des conseillers formés au droit. Il s'oppose au pape [Boniface VIII], qu'il fait arrêter en 1303. À partir de 1302, il réunit les [états généraux], une assemblée du clergé, de la noblesse et du peuple. La guerre de [Cent Ans] (1337-1453) oppose les rois de France et d'Angleterre. Après un début de règne fragile, [Charles VII] redresse le royaume, aidé notamment par [Jeanne d'Arc]. En 1445, il crée une [armée permanente], payée régulièrement par le roi. À sa mort, en 1461, il a vaincu les Anglais, sauf à [Calais]." },
      { titre: "Un État monarchique", texte: "Entre le Xᵉ et le XVᵉ siècle, le pouvoir royal s'affirme progressivement : d'un roi limité à un petit domaine autour de Paris, on passe à un roi [souverain] qui contrôle l'ensemble du royaume par ses baillis, sa [justice], sa [monnaie] et ses légistes. La guerre de Cent Ans, malgré la crise qu'elle provoque, renforce finalement l'[État] royal, avec une armée permanente et un [impôt] régulier. [Louis XI] achève ce mouvement en soumettant les grands [féodaux] et en agrandissant le royaume. À la fin du XVᵉ siècle, la France est devenue un [État monarchique] solide." }
    ],
    capable: [
      "Placer sur une frise les repères du chapitre (987, 1214, 1297, 1302, 1337-1453, 1461-1483).",
      "Expliquer la différence entre un roi suzerain et un roi souverain.",
      "Expliquer pourquoi Hugues Capet est un roi faible.",
      "Montrer comment Philippe Auguste renforce son pouvoir : Bouvines, les baillis, Paris capitale.",
      "Expliquer comment Louis IX renforce la monnaie et la justice royales, sans oublier la part sombre de son règne.",
      "Expliquer comment Philippe le Bel s'affirme face au pape et s'appuie sur ses légistes et sur les états généraux.",
      "Expliquer pourquoi la guerre de Cent Ans renforce finalement l'État royal sous Charles VII.",
      "Décrire la manière de gouverner de Louis XI.",
      "Associer chaque roi étudié à un moyen d'affirmer son pouvoir.",
      "Définir l'État monarchique."
    ]
  },

  /* =====================================================================
     5e — HISTOIRE — Thème 3, chapitre 6
     ===================================================================== */
  {
    id: "5e-h3-c6", n: "5e", d: "histoire", carte: ["mediterranee", "monde"],
    theme: "Transformations de l'Europe et ouverture sur le monde aux XVIᵉ et XVIIᵉ siècles",
    rituel: "Transformations de l'Europe (XVIe-XVIIe s.)",
    num: "Chapitre 6",
    titre: "Le monde au temps de Charles Quint et Soliman le Magnifique",
    question: "Quelle expansion l'Europe connaît-elle aux XVᵉ et XVIᵉ siècles ? Que devient l'espace méditerranéen ?",
    plan: [
      "Les Européens à la recherche d'une nouvelle route vers les Indes : les grands voyages, la rencontre avec l'Amérique, les empires coloniaux et le grand commerce",
      "Une nouvelle rivalité méditerranéenne : l'Empire ottoman de Soliman face à l'empire de Charles Quint"
    ],
    cle: "Aux XVᵉ et XVIᵉ siècles, les Européens atteignent l'Inde et l'Amérique et profitent d'une première mondialisation. La Méditerranée, elle, devient l'enjeu de la rivalité entre Soliman le Magnifique et Charles Quint.",
    essentiel: [
      "En 1453, le sultan ottoman Mehmed II prend Constantinople, qui devient Istanbul. Les routes terrestres vers l'Asie passent sous contrôle ottoman : les épices et la soie deviennent plus difficiles et plus chères à obtenir pour les Européens.",
      "Les Portugais et les Espagnols cherchent alors une route maritime vers les Indes. Christophe Colomb part vers l'Ouest et atteint en 1492 un continent inconnu des Européens : l'Amérique. Vasco de Gama contourne l'Afrique et arrive en Inde en 1498. La caravelle, la boussole, le gouvernail d'étambot et le portulan rendent ces voyages possibles.",
      "En Amérique, les conquistadors conquièrent d'immenses territoires et fondent des colonies. La population d'Amérique s'effondre, surtout à cause du choc microbien, auquel s'ajoutent la violence de la conquête et le travail forcé.",
      "En Asie et en Afrique, les Portugais fondent surtout des comptoirs. En 1494, le traité de Tordesillas partage le monde entre l'Espagne et le Portugal. Les marchandises circulent entre tous les continents : c'est la première mondialisation, dont l'Europe est la grande bénéficiaire. Elle repose aussi sur la traite atlantique.",
      "En 1520, Soliman le Magnifique devient sultan et porte l'Empire ottoman à son apogée. Son armée, avec les janissaires, est redoutée en Europe. Sa capitale, Istanbul, est une ville riche et cosmopolite.",
      "Élu empereur en 1519, Charles Quint règne sur un empire réparti entre l'Europe et l'Amérique, enrichi par l'or et l'argent du Nouveau Monde. Les deux souverains se disputent la Méditerranée : les Ottomans échouent devant Vienne en 1529, et leur flotte est battue à Lépante en 1571.",
      "Pourtant, le roi de France François Iᵉʳ, catholique, s'allie à Soliman contre Charles Quint : les intérêts politiques l'emportent parfois sur la religion."
    ],
    periodes: [
      { de: 1516, a: 1556, nom: "Règne de Charles Quint", court: "Charles Quint" },
      { de: 1520, a: 1566, nom: "Règne de Soliman le Magnifique", court: "Soliman" }
    ],
    reperes: [
      { a: 1453, date: "1453", txt: "Le sultan Mehmed II prend Constantinople, qui devient Istanbul, capitale de l'Empire ottoman." },
      { a: 1492, date: "1492", txt: "Christophe Colomb atteint l'Amérique." },
      { a: 1494, date: "1494", txt: "Traité de Tordesillas : l'Espagne et le Portugal se partagent le monde." },
      { a: 1498, date: "1498", txt: "Vasco de Gama atteint l'Inde en contournant l'Afrique." },
      { a: 1516, date: "1516", txt: "Charles de Habsbourg hérite de l'Espagne." },
      { a: 1519, date: "1519", txt: "Charles Quint est élu empereur du Saint-Empire romain germanique." },
      { a: 1520, date: "1520", txt: "Soliman le Magnifique devient sultan de l'Empire ottoman." },
      { a: 1529, date: "1529", txt: "Les Ottomans assiègent Vienne, sans parvenir à la prendre." },
      { a: 1571, date: "1571", txt: "Bataille de Lépante : une coalition chrétienne (Espagne, Venise, papauté) bat la flotte ottomane." }
    ],
    notions: [
      { mot: "Route des Indes", def: "Itinéraire commercial qui permet de rapporter en Europe les épices et la soie venues d'Asie." },
      { mot: "Caravelle", def: "Navire léger et rapide, capable de naviguer loin des côtes et de remonter le vent." },
      { mot: "Portulan", def: "Carte marine qui indique les ports, les côtes et les routes maritimes." },
      { mot: "Autochtone", def: "Personne dont le peuple habitait un territoire avant l'arrivée de populations extérieures." },
      { mot: "Choc microbien", def: "Effondrement de la population causé par des maladies apportées par les Européens (variole, grippe, rougeole), contre lesquelles les peuples d'Amérique n'étaient pas immunisés." },
      { mot: "Conquistador", def: "Conquérant espagnol du Nouveau Monde au XVIᵉ siècle." },
      { mot: "Colonie", def: "Territoire conquis, occupé et exploité par un pays étranger." },
      { mot: "Comptoir", def: "Établissement commercial fondé sur une côte étrangère, sans conquête du territoire autour." },
      { mot: "Première mondialisation", def: "Mise en relation commerciale de tous les continents, à partir du XVIᵉ siècle." },
      { mot: "Traite atlantique", def: "Déportation de millions d'Africains réduits en esclavage, transportés de force à travers l'Atlantique pour travailler dans les mines et les plantations d'Amérique." },
      { mot: "Empire", def: "Vaste ensemble de territoires et de peuples soumis à l'autorité d'un même souverain." },
      { mot: "Sultan", def: "Souverain de l'Empire ottoman, chef politique et religieux des musulmans de l'empire." },
      { mot: "Janissaire", def: "Soldat d'élite de l'armée ottomane, entraîné dès l'enfance au service du sultan." },
      { mot: "Cosmopolite", def: "Se dit d'une ville où vivent ensemble des populations d'origines et de religions très diverses." },
      { mot: "Siècle d'Or", def: "Période de très grande puissance de l'Espagne aux XVIᵉ et XVIIᵉ siècles." }
    ],
    personnages: [
      { nom: "Mehmed II", dates: "1432-1481", txt: [
        "Sultan de l'Empire ottoman au XVᵉ siècle.",
        "Ses canons géants abattent des murailles réputées imprenables.",
        "En 1453, il prend la capitale de l'Empire byzantin.",
        "Il fait de Constantinople, devenue Istanbul, la capitale de son empire."
      ] },
      { nom: "Christophe Colomb", dates: "vers 1451-1506", txt: [
        "Navigateur au service des souverains espagnols.",
        "Il pense atteindre l'Asie en naviguant droit vers l'Ouest.",
        "Il part de Palos le 3 août 1492 avec trois navires, dont la Santa María.",
        "Le 12 octobre 1492, il débarque sur une île des Caraïbes et croit être arrivé aux Indes."
      ] },
      { nom: "Vasco de Gama", dates: "vers 1469-1524", txt: [
        "Navigateur portugais de la fin du XVᵉ siècle.",
        "Il part vers l'Est et contourne l'Afrique.",
        "En 1498, il atteint l'Inde, à Calicut : il ouvre la route maritime des Indes."
      ] },
      { nom: "Bartolomé de Las Casas", dates: "vers 1484-1566", txt: [
        "Religieux espagnol de l'ordre des dominicains.",
        "Il vit en Amérique et y voit la violence des conquérants.",
        "Il compare les Espagnols à des loups et les habitants d'Amérique à de douces brebis.",
        "En 1552, il publie la Très brève relation de la destruction des Indes pour alerter le roi d'Espagne."
      ] },
      { nom: "Soliman le Magnifique", dates: "sultan de 1520 à 1566", txt: [
        "Souverain musulman du XVIᵉ siècle.",
        "Il porte l'Empire ottoman à son apogée : son empire s'étend de la Hongrie à l'Égypte.",
        "Ses armées assiègent Vienne en 1529, sans parvenir à la prendre.",
        "Le roi de France François Iᵉʳ s'allie avec lui contre Charles Quint."
      ] },
      { nom: "Charles Quint", dates: "1500-1558", txt: [
        "Membre de la famille des Habsbourg, il hérite de l'Espagne en 1516.",
        "En 1519, il est élu empereur du Saint-Empire romain germanique.",
        "On dit que « le soleil ne se couche jamais » sur son empire, réparti entre l'Europe et l'Amérique.",
        "Il défend la chrétienté face au sultan Soliman le Magnifique."
      ] },
      { nom: "Francisco Pizarro", dates: "vers 1475-1541", txt: [
        "Conquistador espagnol du XVIᵉ siècle.",
        "Il fait prisonnier l'empereur inca Atahualpa.",
        "Il conquiert le Pérou au nom de son empereur, en prétendant y apporter la foi catholique."
      ] },
      { nom: "François Iᵉʳ", dates: "roi de France de 1515 à 1547", txt: [
        "Roi de France catholique du XVIᵉ siècle.",
        "Son royaume est encerclé par les possessions de Charles Quint.",
        "Il s'allie au sultan Soliman le Magnifique contre l'empereur."
      ] }
    ],
    lieux: [
      { nom: "Constantinople (Istanbul)", lon: 28.98, lat: 41.01, txt: "Capitale de l'Empire byzantin, prise par les Ottomans en 1453. Devenue Istanbul, c'est la capitale cosmopolite de Soliman, sur le Bosphore, entre l'Europe et l'Asie." },
      { nom: "Palos", lon: -6.89, lat: 37.23, txt: "Port d'Espagne d'où Christophe Colomb part le 3 août 1492." },
      { nom: "Guanahani", lon: -74.50, lat: 24.05, txt: "Île des Caraïbes (Bahamas) où Colomb débarque le 12 octobre 1492 ; il la rebaptise San Salvador." },
      { nom: "Lisbonne", lon: -9.14, lat: 38.72, txt: "Capitale du Portugal, point de départ des routes portugaises vers l'Afrique et l'Inde." },
      { nom: "Calicut", lon: 75.78, lat: 11.25, txt: "Port de l'Inde atteint par Vasco de Gama en 1498." },
      { nom: "Goa", lon: 73.91, lat: 15.50, txt: "Comptoir portugais en Inde." },
      { nom: "Séville", lon: -5.98, lat: 37.39, txt: "Grand port d'Espagne sur le Guadalquivir, par lequel arrivent l'or et l'argent d'Amérique." },
      { nom: "Nouvelle-Espagne", txt: "Colonie espagnole d'Amérique, conquise au XVIᵉ siècle (l'actuel Mexique)." },
      { nom: "Vienne", lon: 16.37, lat: 48.21, txt: "Ville des Habsbourg d'Autriche, assiégée sans succès par les Ottomans en 1529." },
      { nom: "Lépante", lon: 21.15, lat: 38.25, txt: "Au large de ce port grec, en 1571, une coalition chrétienne bat la flotte ottomane." }
    ],
    trous: [
      { titre: "Une nouvelle route vers les Indes", texte: "En [1453], les Ottomans de Mehmed II prennent Constantinople, qui devient [Istanbul]. Les routes terrestres vers l'Asie passent sous leur contrôle : les Européens cherchent une nouvelle [route maritime] vers les Indes. Les Portugais, avec [Vasco de Gama], contournent l'Afrique et atteignent l'Inde en 1498. Les Espagnols, avec Christophe Colomb, partent vers l'Ouest et atteignent en [1492] un continent inconnu des Européens : l'[Amérique]. La population d'Amérique s'effondre, surtout à cause du [choc microbien]." },
      { titre: "Empires coloniaux et première mondialisation", texte: "En Asie et en Afrique, les Européens fondent surtout des [comptoirs], des établissements commerciaux sur les côtes. En Amérique, ils conquièrent de vastes territoires et fondent des [colonies]. Le traité de [Tordesillas] (1494) partage le monde entre l'Espagne et le Portugal. Des marchandises circulent entre tous les continents : c'est la [première mondialisation], dont l'Europe est la grande bénéficiaire. Pour exploiter mines et plantations, les Européens déportent des millions d'Africains réduits en [esclavage] : c'est le début de la [traite atlantique]." },
      { titre: "Deux empires rivaux en Méditerranée", texte: "En [1520], [Soliman le Magnifique] devient sultan de l'Empire ottoman et le porte à son apogée. Sa capitale, Istanbul, est une ville [cosmopolite]. En [1519], Charles Quint est élu empereur : son empire, réparti sur deux continents, est enrichi par l'or et l'argent d'[Amérique]. Les deux souverains s'affrontent pour le contrôle de la [Méditerranée] : les Ottomans échouent devant [Vienne] en 1529. Pourtant, le roi de France [François Iᵉʳ], catholique, s'allie au sultan contre Charles Quint." }
    ],
    capable: [
      "Placer les repères du chapitre sur une frise (1453, 1492, 1498, 1519, 1520, 1529, 1571).",
      "Expliquer pourquoi la prise de Constantinople pousse les Européens à chercher une nouvelle route vers les Indes.",
      "Comparer les voyages de Vasco de Gama et de Christophe Colomb.",
      "Citer les progrès techniques qui rendent possible la navigation en haute mer.",
      "Identifier le point de vue d'un auteur en comparant deux récits de la rencontre avec l'Amérique (Colomb, Las Casas).",
      "Expliquer les causes de l'effondrement de la population d'Amérique.",
      "Distinguer comptoir et colonie, et les localiser.",
      "Décrire la première mondialisation et la place de la traite atlantique.",
      "Caractériser l'Empire ottoman de Soliman et l'empire de Charles Quint.",
      "Expliquer pourquoi les deux empires s'affrontent en Méditerranée, et pourquoi François Iᵉʳ s'allie à Soliman."
    ]
  },

  /* =====================================================================
     5e — HISTOIRE — Thème 3, chapitre 7
     ===================================================================== */
  {
    id: "5e-h3-c7", n: "5e", d: "histoire", carte: "europe",
    theme: "Transformations de l'Europe et ouverture sur le monde aux XVIᵉ et XVIIᵉ siècles",
    rituel: "Transformations de l'Europe (XVIe-XVIIe s.)",
    num: "Chapitre 7",
    titre: "Humanisme, réformes et conflits religieux",
    question: "Quels bouleversements culturels et religieux caractérisent l'Europe de la Renaissance ?",
    plan: [
      "Une révolution culturelle et artistique : l'humanisme et l'imprimerie, la Renaissance à Florence, une science nouvelle (le procès de Galilée)",
      "Les réformes et les conflits religieux : la Réforme protestante, la Réforme catholique, les guerres de Religion"
    ],
    cle: "À la Renaissance, l'Europe s'ouvre à des idées nouvelles (humanisme, imprimerie, arts, sciences fondées sur l'observation), mais l'unité religieuse de la chrétienté occidentale se brise. C'est à la fois un temps d'ouverture et de fractures durables.",
    essentiel: [
      "Aux XVᵉ et XVIᵉ siècles, les humanistes redécouvrent les textes de l'Antiquité grecque et romaine. Ils placent l'être humain, son éducation et sa raison au centre de leur réflexion. La plupart, comme Érasme, restent des chrétiens convaincus.",
      "Vers 1450, à Mayence, Gutenberg met au point l'imprimerie à caractères mobiles. Les livres sont reproduits plus vite, en grand nombre et à moindre coût : les idées circulent dans toute l'Europe.",
      "À Florence, de riches mécènes comme Laurent de Médicis financent les artistes. Ceux-ci s'inspirent de l'Antiquité, utilisent la perspective et représentent le corps humain avec réalisme : c'est la Renaissance (Brunelleschi, Botticelli, Michel-Ange).",
      "Les savants fondent leurs travaux sur l'observation et la démonstration. Copernic (1543) puis Galilée défendent l'héliocentrisme. En 1633, Galilée est jugé par le tribunal de l'Inquisition et doit renier ses idées.",
      "En 1517, Martin Luther publie ses 95 thèses contre la vente des indulgences. Grâce à l'imprimerie, ses idées se diffusent très vite : c'est la Réforme protestante. Elle se divise en plusieurs courants : luthéranisme, calvinisme, anglicanisme.",
      "L'Église catholique répond par le concile de Trente (1545-1563) : elle réaffirme ses croyances, mais se réforme aussi en formant mieux les prêtres et en supprimant certains abus. C'est la Réforme catholique.",
      "En France, les guerres de Religion opposent catholiques et protestants de 1562 à 1598 ; le massacre de la Saint-Barthélemy (1572) en est l'épisode le plus meurtrier. En 1598, Henri IV signe l'édit de Nantes, qui autorise les protestants à pratiquer leur religion."
    ],
    periodes: [
      { de: 1400, a: 1600, nom: "Renaissance (XVᵉ-XVIᵉ siècle)", court: "Renaissance" },
      { de: 1562, a: 1598, nom: "Guerres de Religion en France", court: "Guerres de Religion" }
    ],
    reperes: [
      { a: 1450, date: "vers 1450", txt: "Gutenberg met au point l'imprimerie à caractères mobiles, à Mayence." },
      { a: 1501, b: 1504, date: "1501-1504", txt: "Michel-Ange sculpte le David, à Florence." },
      { a: 1517, date: "1517", txt: "Luther publie ses 95 thèses : c'est le début de la Réforme protestante." },
      { a: 1534, date: "1534", txt: "Henri VIII rompt avec Rome et devient le chef de l'Église anglicane." },
      { a: 1543, date: "1543", txt: "Copernic publie sa théorie : la Terre tourne autour du Soleil." },
      { a: 1545, b: 1563, date: "1545-1563", txt: "Le concile de Trente organise la Réforme catholique." },
      { a: 1572, date: "1572", txt: "Massacre de la Saint-Barthélemy à Paris (24 août)." },
      { a: 1598, date: "1598", txt: "Henri IV signe l'édit de Nantes." },
      { a: 1633, date: "1633", txt: "Procès de Galilée : il doit renier ses idées devant l'Inquisition." }
    ],
    notions: [
      { mot: "Humanisme", def: "Courant de pensée des XVᵉ et XVIᵉ siècles qui place l'être humain, sa raison et son éducation au centre de la réflexion." },
      { mot: "Humaniste", def: "Savant qui redécouvre les textes de l'Antiquité, apprend le grec et le latin, et échange avec les autres savants d'Europe." },
      { mot: "Imprimerie", def: "Technique mise au point vers 1450 par Gutenberg, qui permet de reproduire des livres rapidement et en grand nombre." },
      { mot: "Renaissance", def: "Renouveau artistique et intellectuel des XVᵉ et XVIᵉ siècles, inspiré de l'Antiquité gréco-romaine." },
      { mot: "Mécène", def: "Personne riche et puissante (prince, pape, banquier) qui finance des artistes et des œuvres d'art." },
      { mot: "Perspective", def: "Technique de dessin qui permet de représenter la profondeur sur une surface plane." },
      { mot: "Géocentrisme", def: "Théorie selon laquelle la Terre est immobile au centre du monde, et tout tourne autour d'elle." },
      { mot: "Héliocentrisme", def: "Théorie selon laquelle le Soleil est au centre, et la Terre tourne autour de lui." },
      { mot: "Hérésie", def: "Opinion contraire à la doctrine officielle de l'Église." },
      { mot: "Inquisition", def: "Tribunal de l'Église chargé de juger les personnes accusées d'hérésie." },
      { mot: "Indulgence", def: "Document vendu par l'Église, censé effacer la punition due pour les péchés." },
      { mot: "Réforme protestante", def: "Mouvement lancé par Luther en 1517, qui aboutit à la naissance d'Églises chrétiennes séparées de Rome." },
      { mot: "Réforme catholique", def: "Réponse de l'Église catholique à la Réforme protestante, décidée notamment au concile de Trente (1545-1563)." },
      { mot: "Guerres de Religion", def: "Conflits qui opposent catholiques et protestants en Europe au XVIᵉ siècle (de 1562 à 1598 en France)." },
      { mot: "Tolérance religieuse", def: "Fait d'accepter que plusieurs religions soient pratiquées dans un même État." }
    ],
    personnages: [
      { nom: "Johannes Gutenberg", dates: "vers 1400-1468", txt: [
        "Artisan allemand du XVᵉ siècle, installé à Mayence.",
        "Il utilise de petites lettres en métal, réutilisables, que l'on assemble pour composer une page.",
        "Vers 1450, il met au point l'imprimerie à caractères mobiles."
      ] },
      { nom: "Érasme", dates: "vers 1467-1536", txt: [
        "Savant de la Renaissance qui écrit à d'autres savants dans toute l'Europe.",
        "Il étudie le grec et le latin pour lire les textes anciens, et la Bible, dans leur langue d'origine.",
        "Ce chrétien convaincu est l'un des plus célèbres humanistes.",
        "Le peintre Holbein l'a représenté au travail, entouré de livres."
      ] },
      { nom: "Laurent de Médicis", dates: "1449-1492", txt: [
        "Membre d'une riche famille de banquiers de Florence.",
        "Il fait tracer de nouvelles rues et construire des bâtiments pour embellir sa ville.",
        "Il protège les artistes et les gens de lettres : c'est un grand mécène.",
        "On le surnomme « le Magnifique »."
      ] },
      { nom: "Michel-Ange", dates: "1475-1564", txt: [
        "Artiste italien de la Renaissance : sculpteur, peintre et architecte.",
        "Il représente le corps humain nu avec réalisme, comme les artistes de l'Antiquité.",
        "Entre 1508 et 1512, il peint le plafond de la chapelle Sixtine, à Rome.",
        "Entre 1501 et 1504, il sculpte le David, à Florence."
      ] },
      { nom: "Nicolas Copernic", dates: "1473-1543", txt: [
        "Savant polonais de la Renaissance.",
        "Il affirme que la Terre tourne autour du Soleil.",
        "Il publie sa théorie de l'héliocentrisme en 1543, l'année de sa mort."
      ] },
      { nom: "Galilée", dates: "1564-1642", txt: [
        "Savant italien qui observe le ciel avec une lunette qu'il a construite.",
        "Il dessine les reliefs et les phases de la Lune.",
        "Pour lui, la nature s'explique par l'observation et la démonstration, non par l'autorité des Écritures.",
        "En 1633, il est jugé par l'Inquisition et doit renier ses idées."
      ] },
      { nom: "Martin Luther", dates: "1483-1546", txt: [
        "Moine et professeur de théologie en Allemagne.",
        "Il dénonce la vente des indulgences par l'Église.",
        "Pour lui, seuls la foi et le repentir sincère permettent d'être pardonné.",
        "En 1517, il publie ses 95 thèses à Wittenberg."
      ] },
      { nom: "Jean Calvin", dates: "1509-1564", txt: [
        "Réformateur protestant né en France.",
        "Il s'installe à Genève, en Suisse.",
        "Il fonde un courant protestant rigoureux, à la discipline stricte et au culte très dépouillé."
      ] },
      { nom: "Henri VIII", dates: "roi d'Angleterre de 1509 à 1547", txt: [
        "Roi d'Angleterre au XVIᵉ siècle.",
        "En 1534, il rompt avec le pape, pour des raisons d'abord politiques et personnelles.",
        "Il devient le chef de l'Église d'Angleterre : l'Église anglicane."
      ] }
    ],
    lieux: [
      { nom: "Florence", lon: 11.26, lat: 43.77, txt: "Ville d'Italie, capitale de la Renaissance, où les Médicis protègent les artistes (dôme de Brunelleschi, David de Michel-Ange)." },
      { nom: "Rome", lon: 12.48, lat: 41.89, txt: "Ville du pape. Brunelleschi y étudie les monuments antiques ; Galilée y est jugé en 1633." },
      { nom: "Mayence", lon: 8.25, lat: 49.99, txt: "Ville d'Allemagne où Gutenberg met au point l'imprimerie vers 1450." },
      { nom: "Wittenberg", lon: 12.65, lat: 51.87, txt: "Ville d'Allemagne où Luther publie ses 95 thèses en 1517." },
      { nom: "Genève", lon: 6.14, lat: 46.20, txt: "Ville de Suisse où Calvin organise son Église." },
      { nom: "Trente", lon: 11.12, lat: 46.07, txt: "Ville d'Italie où se réunit le concile de 1545 à 1563." },
      { nom: "Paris", lon: 2.35, lat: 48.86, txt: "Capitale du royaume de France, où a lieu le massacre de la Saint-Barthélemy, le 24 août 1572." },
      { nom: "Nantes", lon: -1.55, lat: 47.22, txt: "Ville où Henri IV signe en 1598 l'édit qui porte le nom de la ville." }
    ],
    trous: [
      { titre: "L'humanisme et la Renaissance", texte: "Aux XVᵉ et XVIᵉ siècles, des savants appelés [humanistes] redécouvrent les textes de l'Antiquité. Ils placent l'[être humain], son éducation et sa raison au centre de leur réflexion : c'est l'[humanisme]. Vers [1450], l'Allemand Gutenberg invente l'[imprimerie] à caractères mobiles. Les artistes italiens s'inspirent de l'Antiquité : c'est la [Renaissance]. À Florence, de riches familles comme les [Médicis] financent les artistes : ce sont des [mécènes]." },
      { titre: "Une science nouvelle", texte: "Les savants de la Renaissance fondent leurs travaux sur l'[observation] et l'expérience. En astronomie, Copernic puis Galilée défendent l'[héliocentrisme], selon lequel la Terre tourne autour du Soleil, contre le [géocentrisme] enseigné jusque-là. En [1633], Galilée est jugé par le tribunal de l'[Inquisition] et doit renier ses idées. Vésale, lui, étudie le corps humain par la [dissection]." },
      { titre: "Réformes et guerres de Religion", texte: "En [1517], le moine allemand [Martin Luther] publie ses 95 thèses pour dénoncer la vente des [indulgences] par l'Église. Grâce à l'imprimerie, ses idées se diffusent très vite : c'est le début de la [Réforme protestante]. L'Église catholique réunit le concile de [Trente] (1545-1563). En France, les [guerres de Religion] durent de 1562 à 1598 ; en 1572 a lieu le massacre de la [Saint-Barthélemy]. En [1598], Henri IV signe l'édit de [Nantes]." }
    ],
    capable: [
      "Placer les repères du chapitre sur une frise.",
      "Définir l'humanisme et décrire le travail d'un humaniste.",
      "Expliquer pourquoi l'imprimerie change la diffusion des idées en Europe.",
      "Expliquer le rôle d'un mécène, avec l'exemple des Médicis à Florence.",
      "Montrer qu'une œuvre de la Renaissance s'inspire de l'Antiquité.",
      "Distinguer géocentrisme et héliocentrisme.",
      "Expliquer pourquoi Galilée est jugé en 1633, sans réduire l'affaire à « la science contre la religion ».",
      "Expliquer les critiques de Luther contre l'Église et citer les trois grands courants protestants.",
      "Expliquer pourquoi le concile de Trente est à la fois une riposte et une réforme.",
      "Expliquer pourquoi l'édit de Nantes est un compromis."
    ]
  },

  /* =====================================================================
     5e — HISTOIRE — Thème 3, chapitre 8
     ===================================================================== */
  {
    id: "5e-h3-c8", n: "5e", d: "histoire", carte: "france",
    theme: "Transformations de l'Europe et ouverture sur le monde aux XVIᵉ et XVIIᵉ siècles",
    rituel: "Transformations de l'Europe (XVIe-XVIIe s.)",
    num: "Chapitre 8",
    titre: "Du Prince de la Renaissance au roi absolu",
    question: "Comment le pouvoir royal s'est-il renforcé pour parvenir à l'absolutisme ?",
    plan: [
      "François Iᵉʳ, le roi de la Renaissance",
      "Henri IV et la stabilisation du royaume",
      "Louis XIV et l'absolutisme royal : gouverner seul, Versailles, les limites du pouvoir absolu"
    ],
    cle: "Du XVIᵉ au XVIIᵉ siècle, le pouvoir royal se renforce par étapes, de François Iᵉʳ à Henri IV puis à Louis XIV, avec qui la monarchie absolue est achevée. Mais ce renforcement est lent, interrompu par des crises, et jamais total.",
    essentiel: [
      "François Iᵉʳ devient roi en 1515. Roi-guerrier, il bat les mercenaires suisses à Marignan, puis affronte Charles Quint : il est fait prisonnier à Pavie en 1525. Grand mécène, il fait construire Chambord et accueille Léonard de Vinci.",
      "En 1539, l'ordonnance de Villers-Cotterêts impose le français, à la place du latin, dans les actes de justice et d'administration. Le roi unifie ainsi son administration et renforce son autorité sur tout le royaume.",
      "En 1589, Henri IV devient roi, mais ce prince protestant n'est pas reconnu par une grande partie du royaume catholique. Il abjure en 1593, est sacré à Chartres en 1594 et signe l'édit de Nantes en 1598 pour rétablir la paix religieuse. Il est assassiné par Ravaillac en 1610.",
      "Louis XIV devient roi en 1643, à 4 ans : sa mère Anne d'Autriche assure la régence, aidée du cardinal Mazarin. À la mort de Mazarin, en 1661, il décide de gouverner seul. Selon le droit divin, défendu par Bossuet, il tient son pouvoir de Dieu et n'est responsable que devant Lui : c'est la monarchie absolue.",
      "À partir de 1682, Louis XIV s'installe définitivement à Versailles. La haute noblesse vit à la cour, réglée par l'étiquette, et dépend des faveurs du roi. Les portraits officiels, comme celui peint par Rigaud en 1701, sont des images de propagande construites pour convaincre.",
      "Même absolu, le pouvoir du roi a des limites : les lois fondamentales du royaume, le coût des guerres, les révoltes contre les impôts. En 1685, Louis XIV révoque l'édit de Nantes : le protestantisme est de nouveau interdit et environ 200 000 protestants fuient le royaume."
    ],
    periodes: [
      { de: 1515, a: 1547, nom: "Règne de François Iᵉʳ", court: "François Iᵉʳ" },
      { de: 1562, a: 1598, nom: "Guerres de Religion", court: "Guerres de Religion" },
      { de: 1589, a: 1610, nom: "Règne d'Henri IV", court: "Henri IV" },
      { de: 1643, a: 1715, nom: "Règne de Louis XIV", court: "Louis XIV" }
    ],
    reperes: [
      { a: 1515, date: "1515", txt: "François Iᵉʳ devient roi ; victoire de Marignan contre les mercenaires suisses." },
      { a: 1539, date: "1539", txt: "Ordonnance de Villers-Cotterêts : le français remplace le latin dans les actes de justice et d'administration." },
      { a: 1589, date: "1589", txt: "Henri IV devient roi à la mort d'Henri III, mais il n'est pas reconnu par tous." },
      { a: 1593, date: "1593", txt: "Henri IV abjure le protestantisme et devient catholique." },
      { a: 1598, date: "1598", txt: "Édit de Nantes : les protestants peuvent pratiquer leur religion dans le royaume." },
      { a: 1610, date: "1610", txt: "Assassinat d'Henri IV par Ravaillac." },
      { a: 1643, date: "1643", txt: "Louis XIV devient roi, à 4 ans." },
      { a: 1661, date: "1661", txt: "Mort de Mazarin : Louis XIV décide de gouverner seul (début du règne personnel)." },
      { a: 1682, date: "1682", txt: "Louis XIV installe définitivement la cour et le gouvernement à Versailles." },
      { a: 1685, date: "1685", txt: "Édit de Fontainebleau : Louis XIV révoque l'édit de Nantes." },
      { a: 1715, date: "1715", txt: "Mort de Louis XIV, après 72 ans de règne." }
    ],
    notions: [
      { mot: "Ordonnance, édit", def: "Texte de loi décidé par le roi, qui s'applique à tout le royaume." },
      { mot: "Mécène", def: "Personne puissante qui protège et finance des artistes." },
      { mot: "Roi-guerrier", def: "Souverain qui conduit lui-même ses armées au combat." },
      { mot: "Abjurer", def: "Renoncer publiquement à sa religion pour en adopter une autre." },
      { mot: "Sacre", def: "Cérémonie religieuse qui fait du roi l'élu de Dieu." },
      { mot: "Régicide", def: "Assassinat d'un roi." },
      { mot: "Monarchie absolue", def: "Régime dans lequel le roi détient tous les pouvoirs et ne les partage avec personne." },
      { mot: "Droit divin", def: "Idée selon laquelle le roi tient son pouvoir directement de Dieu : il n'est donc responsable que devant Lui." },
      { mot: "Intendant", def: "Représentant du roi envoyé dans une province pour y faire appliquer ses décisions." },
      { mot: "Cour", def: "Ensemble des nobles qui vivent auprès du roi, à Versailles, pour le servir et obtenir ses faveurs." },
      { mot: "Étiquette", def: "Règles très strictes qui organisent chaque geste de la vie à la cour, autour du roi." },
      { mot: "Propagande royale", def: "Ensemble des images, des textes et des cérémonies destinés à célébrer la grandeur du roi." },
      { mot: "Révocation", def: "Annulation d'une loi ou d'un édit accordé auparavant." },
      { mot: "Lois fondamentales", def: "Règles du royaume que le roi lui-même ne peut pas changer, comme les règles de succession au trône." }
    ],
    personnages: [
      { nom: "François Iᵉʳ", dates: "roi de 1515 à 1547", txt: [
        "Il devient roi de France à 20 ans.",
        "Quelques mois plus tard, il bat les mercenaires suisses en Italie.",
        "Il affronte plusieurs fois Charles Quint, qui le fait prisonnier à Pavie en 1525.",
        "Il fait construire Chambord et impose le français dans les actes de justice en 1539."
      ] },
      { nom: "Léonard de Vinci", dates: "1452-1519", txt: [
        "Artiste et savant italien de la Renaissance.",
        "Le roi de France le fait venir dans son royaume.",
        "Il s'installe au Clos Lucé, près d'Amboise, où il meurt en 1519."
      ] },
      { nom: "Henri IV", dates: "roi de 1589 à 1610", txt: [
        "Prince protestant, roi de Navarre.",
        "Il devient roi de France en 1589, mais une grande partie du royaume refuse de le reconnaître.",
        "Il abjure en 1593 et il est sacré à Chartres en 1594.",
        "Il signe l'édit de Nantes en 1598 ; il est assassiné en 1610."
      ] },
      { nom: "Ravaillac", dates: "vers 1578-1610", txt: [
        "Catholique fanatique.",
        "Il n'accepte pas la tolérance accordée aux protestants.",
        "Le 14 mai 1610, rue de la Ferronnerie à Paris, il assassine le roi."
      ] },
      { nom: "Louis XIV", dates: "roi de 1643 à 1715", txt: [
        "Il devient roi à 4 ans, en 1643.",
        "En 1661, à la mort de Mazarin, il décide de gouverner seul.",
        "En 1682, il installe la cour et le gouvernement à Versailles.",
        "Surnommé le Roi-Soleil, il révoque l'édit de Nantes en 1685."
      ] },
      { nom: "Mazarin", dates: "1602-1661", txt: [
        "Cardinal d'origine italienne.",
        "Il aide la reine Anne d'Autriche pendant la régence.",
        "Il gouverne réellement le royaume pendant l'enfance du roi.",
        "Sa mort, en 1661, marque le début du règne personnel de Louis XIV."
      ] },
      { nom: "Bossuet", dates: "1627-1704", txt: [
        "Évêque français du XVIIᵉ siècle.",
        "Il est chargé de l'éducation du fils de Louis XIV.",
        "Il écrit que les rois sont « les ministres de Dieu et ses lieutenants sur la terre » : c'est la théorie du droit divin."
      ] },
      { nom: "Hyacinthe Rigaud", dates: "1659-1743", txt: [
        "Peintre de la cour de France.",
        "En 1701, il peint le portrait officiel le plus célèbre de Louis XIV.",
        "Il représente le roi en costume de sacre, avec la couronne, le sceptre et la main de justice."
      ] }
    ],
    lieux: [
      { nom: "Marignan", lon: 9.32, lat: 45.36, txt: "Ville d'Italie, près de Milan, où François Iᵉʳ bat les mercenaires suisses en 1515." },
      { nom: "Pavie", lon: 9.16, lat: 45.19, txt: "Ville d'Italie où François Iᵉʳ, battu par les troupes de Charles Quint, est fait prisonnier en 1525." },
      { nom: "Chambord", lon: 1.52, lat: 47.62, txt: "Château de la Renaissance construit pour François Iᵉʳ à partir de 1519." },
      { nom: "Villers-Cotterêts", lon: 3.09, lat: 49.25, txt: "Château royal où François Iᵉʳ signe en 1539 l'ordonnance qui impose le français." },
      { nom: "Chartres", lon: 1.49, lat: 48.45, txt: "Ville dont la cathédrale accueille le sacre d'Henri IV en 1594, car Reims est alors tenue par la Ligue catholique." },
      { nom: "Reims", lon: 4.03, lat: 49.26, txt: "Ville où les rois de France sont traditionnellement sacrés ; Louis XIV y est sacré en 1654." },
      { nom: "Nantes", lon: -1.55, lat: 47.22, txt: "Ville où Henri IV signe l'édit de 1598." },
      { nom: "Paris", lon: 2.35, lat: 48.86, txt: "Capitale du royaume ; Henri IV y est assassiné par Ravaillac, rue de la Ferronnerie, en 1610." },
      { nom: "Versailles", lon: 2.12, lat: 48.80, txt: "Ancien pavillon de chasse de Louis XIII, transformé en immense palais ; Louis XIV s'y installe définitivement en 1682." },
      { nom: "Fontainebleau", lon: 2.70, lat: 48.40, txt: "Château où Louis XIV signe en 1685 l'édit qui révoque l'édit de Nantes." }
    ],
    trous: [
      { titre: "François Iᵉʳ, un prince de la Renaissance", texte: "[François Iᵉʳ] devient roi de France en [1515]. Roi-guerrier, il remporte la victoire de [Marignan] contre les mercenaires suisses, puis affronte plus tard Charles Quint. Il fait construire le château de [Chambord] et fait venir des artistes italiens comme [Léonard de Vinci]. En 1539, par l'ordonnance de [Villers-Cotterêts], il impose le [français] dans les actes de justice et d'administration, à la place du latin." },
      { titre: "Henri IV, restaurer la paix", texte: "En [1589], Henri IV devient roi mais, étant [protestant], il n'est pas reconnu par une grande partie du royaume catholique. Il [abjure] sa religion en 1593, est sacré à [Chartres] en 1594, puis signe l'édit de [Nantes] en 1598 pour rétablir la paix religieuse. Mais cette paix reste fragile : Henri IV est assassiné en 1610 par [Ravaillac]." },
      { titre: "Louis XIV, roi absolu", texte: "Louis XIV devient roi en [1643], à l'âge de 4 ans ; sa mère, aidée du cardinal [Mazarin], gouverne à sa place. En [1661], il décide de gouverner seul. Selon la théorie du [droit divin], il tient son pouvoir directement de Dieu. À partir de [1682], il installe le gouvernement au château de [Versailles], où la vie de la noblesse est réglée par une [étiquette] très stricte. En [1685], il révoque l'édit de Nantes." }
    ],
    capable: [
      "Placer les repères du chapitre sur une frise, de 1515 à 1715.",
      "Montrer que François Iᵉʳ est un roi-guerrier et un mécène de la Renaissance.",
      "Expliquer en quoi l'ordonnance de Villers-Cotterêts renforce le pouvoir du roi.",
      "Critiquer une image peinte longtemps après les faits (Ingres, 1818).",
      "Expliquer comment Henri IV rétablit la paix et l'autorité royale, et pourquoi son abjuration est un choix politique.",
      "Distinguer régence, sacre et règne personnel dans le règne de Louis XIV.",
      "Définir le droit divin et la monarchie absolue.",
      "Expliquer comment Versailles et l'étiquette permettent au roi de contrôler la noblesse.",
      "Décrypter un portrait royal comme une image de propagande.",
      "Montrer que le renforcement du pouvoir royal n'est ni régulier ni total (crises, limites, révocation de 1685)."
    ]
  },

  /* =====================================================================
     5e — GÉOGRAPHIE — Thème 1, chapitre 1
     ===================================================================== */
  {
    id: "5e-g1-c1", n: "5e", d: "geo",
    theme: "La question démographique et l'inégal développement",
    rituel: "Question démographique et inégal développement",
    num: "Chapitre 1",
    titre: "La croissance démographique et ses effets",
    question: "Quelles sont les conséquences de la croissance démographique mondiale sur le développement des sociétés humaines ?",
    plan: [
      "Introduction : 3, 8, bientôt 10 milliards d'humains ?",
      "L'Inde, un géant démographique qui croît et qui fait face à de nombreux défis",
      "Le Nigeria, un futur géant démographique ?",
      "Une croissance démographique inégale selon les États : pays favorisés, émergents, précaires"
    ],
    cle: "La population mondiale augmente parce qu'il y a plus de naissances que de décès. Cette croissance pose de grands défis au développement : il faut nourrir, loger, scolariser et employer une population nombreuse et jeune ; là où elle ralentit, la population vieillit.",
    essentiel: [
      "La population mondiale est passée de 2,5 milliards d'habitants en 1950 à 8 milliards en 2022. Selon l'ONU, elle pourrait approcher 10 milliards en 2050.",
      "La population augmente quand il y a plus de naissances que de décès : c'est l'accroissement naturel. En Inde, depuis 1950, la mortalité a baissé plus vite que la natalité : la population a presque quadruplé.",
      "Depuis 2023, l'Inde est le pays le plus peuplé du monde, avec plus de 1,4 milliard d'habitants. Sa population est très jeune : 40 % des Indiens ont moins de 25 ans. Les Indiens vivent mieux qu'en 1950 (l'espérance de vie est passée de 41 à 72 ans), mais les inégalités restent fortes entre les États.",
      "L'Inde fait face à de nombreux défis. Avec l'exode rural, les villes comme New Delhi grandissent très vite et beaucoup de migrants vivent dans des bidonvilles. Les femmes ont moins d'enfants (2 par femme aujourd'hui, contre 5,7 en 1950) : la population commence à vieillir.",
      "Le Nigeria est le pays le plus peuplé d'Afrique : 45 millions d'habitants en 1960, 219 millions en 2022. Cette croissance très rapide freine son développement : il manque des emplois et une partie de la population souffre de la faim. Pour faire baisser la fécondité, l'ONU conseille le planning familial et l'éducation des filles.",
      "La population n'augmente pas partout au même rythme. D'ici 2050, elle augmentera surtout en Afrique et en Asie du Sud, dans des pays précaires et émergents où la population est jeune. Dans les pays favorisés (Europe, Japon), elle stagne ou diminue, et elle vieillit."
    ],
    periodes: [],
    reperes: [
      { a: 1950, date: "1950", txt: "2,5 milliards d'humains sur Terre ; l'Inde compte 357 millions d'habitants." },
      { a: 2004, date: "2004", txt: "Le Nigeria lance un plan de dix ans pour faire baisser la fécondité : c'est un échec." },
      { a: 2022, date: "2022", txt: "La population mondiale atteint 8 milliards d'humains. Le Nigeria compte 219 millions d'habitants." },
      { a: 2023, date: "2023", txt: "L'Inde dépasse la Chine et devient le pays le plus peuplé du monde (plus de 1,4 milliard d'habitants)." },
      { a: 2050, date: "2050 (projection)", txt: "Près de 10 milliards d'humains selon l'ONU ; le Nigeria pourrait compter 375 millions d'habitants." }
    ],
    notions: [
      { mot: "Croissance démographique", def: "Augmentation du nombre d'habitants." },
      { mot: "Taux de natalité", def: "Nombre de naissances pour 1 000 habitants en un an (en ‰)." },
      { mot: "Taux de mortalité", def: "Nombre de décès pour 1 000 habitants en un an (en ‰)." },
      { mot: "Accroissement naturel", def: "Différence entre la natalité et la mortalité. Quand il y a plus de naissances que de décès, la population augmente." },
      { mot: "Taux de fécondité", def: "Nombre moyen d'enfants par femme." },
      { mot: "Vieillissement", def: "Augmentation de la part des personnes âgées dans une population." },
      { mot: "Développement", def: "Amélioration des conditions de vie d'une population (santé, éducation, revenus)." },
      { mot: "Inégalités", def: "Grandes différences entre des territoires ou des personnes." },
      { mot: "Exode rural", def: "Départ des habitants des campagnes vers les villes." },
      { mot: "Bidonville", def: "Quartier d'habitations précaires, souvent sans eau ni électricité." },
      { mot: "Chômage", def: "Situation des personnes qui cherchent un travail sans en trouver." },
      { mot: "Planning familial", def: "Aide aux couples pour choisir le nombre d'enfants et le moment de les avoir (contraception)." },
      { mot: "Pays favorisés", def: "Pays riches où les habitants vivent bien (exemple : la France)." },
      { mot: "Pays émergents", def: "Pays dont l'économie progresse vite (exemple : l'Inde)." },
      { mot: "Pays précaires", def: "Pays pauvres où beaucoup d'habitants manquent de l'essentiel." }
    ],
    personnages: [],
    lieux: [
      { nom: "Inde", txt: "Pays d'Asie du Sud, le plus peuplé du monde depuis 2023 (plus de 1,4 milliard d'habitants). C'est un pays émergent, à la population très jeune." },
      { nom: "New Delhi", lon: 77.21, lat: 28.61, txt: "Capitale de l'Inde. Sa région urbaine compte 32 millions d'habitants ; beaucoup de migrants venus des campagnes y vivent dans des bidonvilles, sans eau ni électricité." },
      { nom: "Kerala", txt: "État du sud de l'Inde : 92 % des femmes y savent lire et écrire (2011), bien plus que la moyenne du pays (65 %)." },
      { nom: "Bihar et Rajasthan", txt: "États de l'Inde où à peine plus d'une femme sur deux sait lire et écrire (2011) : ils sont en retard sur le reste du pays." },
      { nom: "Chine", txt: "Pays d'Asie de l'Est, longtemps le plus peuplé du monde : l'Inde l'a dépassé en 2023." },
      { nom: "Nigeria", txt: "Pays d'Afrique de l'Ouest, le plus peuplé d'Afrique : 45 millions d'habitants en 1960, 219 millions en 2022, peut-être 375 millions en 2050." },
      { nom: "Sun City", lon: -112.27, lat: 33.60, txt: "Ville des États-Unis, en Arizona, construite pour les retraités : elle montre le vieillissement de la population." },
      { nom: "Afrique", txt: "Continent où la population augmentera le plus d'ici 2050 : la population y est très jeune." },
      { nom: "Asie du Sud", txt: "Région du monde, autour de l'Inde, où la population va encore augmenter d'ici 2050." },
      { nom: "Europe et Japon", txt: "Pays favorisés où la population stagne ou diminue, et vieillit." }
    ],
    trous: [
      { titre: "L'Inde, un géant démographique", texte: "L'Inde est le [pays le plus peuplé] du monde depuis 2023. Sa population a presque quadruplé depuis 1950, car la [mortalité] a baissé plus vite que la [natalité] : l'[accroissement naturel] est donc élevé. C'est une [population jeune] : 40 % des Indiens ont moins de 25 ans. Nourrir, loger et employer autant d'habitants est un grand [défi]." },
      { titre: "Un géant face à de nombreux défis", texte: "En Inde, le [développement] progresse, mais les [inégalités] restent fortes : au Kerala, 92 % des femmes savent lire et écrire, contre à peine plus de la moitié au Rajasthan. Avec l'[exode rural], les villes comme [New Delhi] grandissent très vite, et beaucoup de migrants vivent dans des [bidonvilles], sans eau ni électricité. Comme les femmes ont moins d'enfants, la population commence à vieillir : le [vieillissement] est un nouveau défi." },
      { titre: "Le Nigeria et le monde", texte: "Le Nigeria est le pays le plus peuplé d'[Afrique]. Sa [croissance démographique] est très rapide, car le [taux de fécondité] reste élevé. Il manque des emplois : le [chômage] augmente, et une partie de la population souffre de la [faim]. L'ONU propose de développer le [planning familial] et l'[éducation des filles]. Dans le monde, la population augmente surtout dans les pays [précaires] et émergents ; elle stagne et vieillit dans les pays [favorisés]." }
    ],
    capable: [
      "Décrire l'évolution de la population mondiale depuis 1950 et connaître les chiffres clés (8 milliards d'humains en 2022).",
      "Expliquer la croissance démographique par l'accroissement naturel : plus de naissances que de décès.",
      "Lire un graphique et faire un calcul simple.",
      "Présenter un document : sa nature, son auteur, sa date, sa source.",
      "Montrer que les conditions de vie s'améliorent en Inde, mais inégalement.",
      "Citer les défis de l'Inde : inégalités, exode rural, bidonvilles, vieillissement.",
      "Expliquer pourquoi une croissance très rapide freine le développement du Nigeria (emploi, alimentation).",
      "Citer des solutions pour faire baisser la fécondité (planning familial, éducation des filles) et leurs limites.",
      "Lire une légende et comparer deux cartes pour dire où la population augmente ou diminue.",
      "Répondre à la problématique dans un bilan rédigé avec des mots-clés."
    ]
  },

  /* =====================================================================
     5e — GÉOGRAPHIE — Thème 1, chapitre 2
     ===================================================================== */
  {
    id: "5e-g1-c2", n: "5e", d: "geo",
    theme: "La question démographique et l'inégal développement",
    rituel: "Question démographique et inégal développement",
    num: "Chapitre 2",
    titre: "Répartition de la richesse et de la pauvreté dans le monde",
    question: "Quelles sont les principales inégalités de richesse et de développement dans le monde, à toutes les échelles ?",
    plan: [
      "Les inégalités de richesse entre les Nords et les Suds",
      "Des inégalités au sein des Nords et des Suds ; lutter contre la pauvreté : l'ODD n° 1",
      "Des inégalités autour de la Méditerranée et à l'intérieur d'un pays : l'Italie",
      "Des inégalités à l'intérieur d'une ville : Le Caire"
    ],
    cle: "La richesse et la pauvreté sont inégalement réparties à toutes les échelles : entre les Nords et les Suds, entre les deux rives de la Méditerranée, entre le nord et le sud de l'Italie, et même à l'intérieur d'une ville comme Le Caire.",
    essentiel: [
      "La richesse et la pauvreté existent partout, dans les pays riches comme dans les pays pauvres. Les inégalités sont des différences entre les territoires et entre les individus, ressenties comme injustes.",
      "À l'échelle du monde, la richesse est très mal répartie : 20 % des habitants de la planète possèdent 94,5 % de la richesse (Oxfam, 2014). Les Nords, riches et développés (Amérique du Nord, Europe, Japon, Australie), s'opposent aux Suds, plus pauvres, où vit la majorité de la population mondiale.",
      "La pauvreté a des conséquences sur la vie des habitants : dans les pays pauvres, surtout en Afrique, l'espérance de vie est plus courte. À Madagascar, le PIB par habitant n'est que de 530 $ par an, soit moins de 1,50 $ par jour.",
      "Les Nords et les Suds ne sont pas homogènes. Dans les Suds, il y a des pays émergents (Chine, Inde, Brésil), des pays pétroliers (Arabie saoudite, Qatar) et des pays les moins avancés (PMA), surtout en Afrique. C'est pourquoi on parle DES Nords et DES Suds.",
      "En 2015, l'ONU a fixé 17 objectifs de développement durable (ODD) à atteindre en 2030 ; le premier est d'éliminer la pauvreté. L'extrême pauvreté a diminué de moitié en trente ans, mais le monde est en retard : 575 millions de personnes vivront encore dans l'extrême pauvreté en 2030, surtout en Afrique subsaharienne.",
      "Autour de la Méditerranée, les pays de la rive nord (Espagne, France, Italie) ont un IDH plus élevé que ceux de la rive sud (Égypte, Libye). En Italie, le nord, industrialisé et tourné vers la Dorsale européenne, est plus riche que le sud (Calabre, Campanie, Sicile), qui est en situation de périphérie.",
      "Même à l'intérieur d'une ville, les contrastes sont forts. Au Caire, capitale de l'Égypte, les tours du quartier d'affaires et les hôtels de luxe bordent le Nil, alors qu'au sud-est, des familles pauvres venues avec l'exode rural vivent dans la Cité des Morts, un ancien cimetière."
    ],
    periodes: [],
    reperes: [
      { a: 2015, date: "2015", txt: "L'ONU adopte les 17 objectifs de développement durable (ODD) ; le n° 1 : éliminer la pauvreté." },
      { a: 2020, date: "2020", txt: "La pandémie de Covid-19 arrête brutalement le recul de l'extrême pauvreté dans le monde." },
      { a: 2030, date: "2030", txt: "Date fixée par l'ONU pour atteindre les ODD." }
    ],
    notions: [
      { mot: "Inégalités", def: "Différences entre les territoires et entre les individus, ressenties et vécues comme injustes." },
      { mot: "PIB", def: "Richesse produite par un pays en un an." },
      { mot: "PIB par habitant", def: "PIB divisé par le nombre d'habitants : c'est la richesse moyenne d'un habitant." },
      { mot: "Nords", def: "Pays les plus développés et les plus riches (Amérique du Nord, Europe, Japon, Australie)." },
      { mot: "Suds", def: "Pays moins développés, où vit la majorité de la population mondiale." },
      { mot: "Espérance de vie", def: "Nombre moyen d'années que peut espérer vivre un nouveau-né." },
      { mot: "Seuil de pauvreté", def: "Revenu en dessous duquel une personne est considérée comme pauvre. Pour la Banque mondiale, vivre avec moins de 3 $ par jour, c'est l'extrême pauvreté." },
      { mot: "Pays émergent", def: "Pays des Suds dont l'économie se développe rapidement (Chine, Inde, Brésil…)." },
      { mot: "Pays pétrolier", def: "Pays qui s'enrichit en vendant son pétrole (Arabie saoudite, Qatar…)." },
      { mot: "PMA", def: "Pays les moins avancés : les pays les plus pauvres du monde, surtout en Afrique." },
      { mot: "ODD", def: "Objectifs de développement durable : 17 objectifs fixés par l'ONU en 2015 pour 2030 ; le premier est d'éliminer la pauvreté." },
      { mot: "IDH", def: "Indice de développement humain : il mesure le développement d'un pays (santé, éducation, revenu), de 0 à 1. Plus il est proche de 1, plus le pays est développé." },
      { mot: "Centre", def: "Lieu qui concentre la population, les richesses et le pouvoir de décision." },
      { mot: "Périphérie", def: "Espace qui dépend d'un centre et qui en est éloigné." },
      { mot: "Métropole", def: "Très grande ville qui concentre la population, les activités et les pouvoirs." }
    ],
    personnages: [],
    lieux: [
      { nom: "Paris (18ᵉ arrondissement)", lon: 2.35, lat: 48.89, txt: "Quartier de Paris où l'on voit des abris de fortune : la pauvreté existe aussi dans un pays riche." },
      { nom: "Mumbai", lon: 72.88, lat: 19.08, txt: "Grande ville de l'Inde, pays émergent. Une rue arborée, bordée d'immeubles et de voitures, montre que la richesse existe aussi dans les Suds." },
      { nom: "Madagascar", txt: "Pays très pauvre d'Afrique : son PIB par habitant n'est que de 530 $ par an, soit moins de 1,50 $ par jour." },
      { nom: "Afrique subsaharienne", txt: "Région où l'espérance de vie est la plus courte et où vivent la plupart des personnes en extrême pauvreté." },
      { nom: "Méditerranée", txt: "Mer qui sépare une rive nord plus développée (Espagne, France, Italie) et une rive sud moins développée (Égypte, Libye)." },
      { nom: "Nord de l'Italie", txt: "Régions riches et industrialisées, tournées vers les Alpes et la Dorsale européenne (Lombardie, Trentin, Émilie-Romagne)." },
      { nom: "Sud de l'Italie", txt: "Régions moins riches, en situation de périphérie (Calabre, Pouilles, Campanie, Sicile, Sardaigne)." },
      { nom: "Le Caire", lon: 31.24, lat: 30.04, txt: "Capitale de l'Égypte, grande métropole au bord du Nil : une ville de contrastes entre richesse et très grande pauvreté." },
      { nom: "Corniche du Nil", txt: "Quartier d'affaires du Caire, au bord du Nil : tours de bureaux, ministère des Affaires étrangères, hôtels de luxe." },
      { nom: "Cité des Morts", txt: "Quartier très pauvre au sud-est du Caire : un ancien cimetière où vivent des familles venues avec l'exode rural au XXᵉ siècle." }
    ],
    trous: [
      { titre: "Les Nords et les Suds", texte: "Dans le monde, la [richesse] est très mal répartie : 20 % des habitants possèdent 94,5 % de la richesse. Les [Nords], riches et développés, s'opposent aux [Suds], plus pauvres, où vit la majorité de la population mondiale. On mesure la richesse produite par un pays avec son [PIB]. Dans les pays pauvres, surtout en Afrique, l'[espérance de vie] est plus courte. Ces [inégalités] sont ressenties comme injustes." },
      { titre: "Des Nords et des Suds très divers", texte: "On parle DES Suds car ces pays sont très différents : la Chine ou le Brésil sont des [pays émergents], l'Arabie saoudite et le Qatar sont des [pays pétroliers], alors que le Niger ou Madagascar font partie des [PMA], les pays les plus pauvres du monde. Pour réduire la [pauvreté], l'ONU a fixé en 2015 les 17 [ODD], à atteindre en [2030]." },
      { titre: "Des inégalités à toutes les échelles", texte: "Autour de la [Méditerranée], les pays de la rive nord ont un [IDH] plus élevé que ceux de la rive sud. En Italie, le nord, industrialisé et tourné vers la [Dorsale européenne], est plus riche que le sud, qui est une [périphérie]. Même dans une [métropole] comme Le Caire, les contrastes sont forts : les tours du [quartier d'affaires] bordent le Nil, alors que des familles venues avec l'[exode rural] vivent dans la Cité des Morts. Les inégalités existent donc à toutes les [échelles]." }
    ],
    capable: [
      "Repérer des signes de richesse et de pauvreté sur une photographie.",
      "Définir les inégalités et dire qu'elles existent dans tous les pays.",
      "Lire une carte par anamorphose et dire où se trouve la richesse dans le monde.",
      "Localiser les Nords et les Suds, et les comparer (PIB par habitant, espérance de vie).",
      "Expliquer pourquoi on parle DES Nords et DES Suds (pays émergents, pays pétroliers, PMA).",
      "Expliquer comment l'ONU lutte contre la pauvreté avec les ODD.",
      "Comparer les deux rives de la Méditerranée avec l'IDH.",
      "Expliquer pourquoi le nord de l'Italie est plus riche que le sud (centre et périphérie).",
      "Décrire les contrastes d'une métropole : Le Caire.",
      "Changer d'échelle (monde, région, pays, ville) et rédiger un bilan avec des mots-clés."
    ]
  },

  /* =====================================================================
     2nde — HISTOIRE — Introduction : la périodisation
     ===================================================================== */
  {
    id: "2de-h0-intro", n: "2nde", d: "histoire",
    theme: "Introduction",
    rituel: "Le monde méditerranéen : Antiquité et Moyen Âge",
    num: "Introduction",
    titre: "La périodisation",
    question: "La périodisation : pourquoi et comment se repérer en histoire ?",
    plan: [
      "Qu'est-ce que l'histoire ?",
      "Les grandes périodes",
      "Des bornes discutées (476, 1492, 1789)",
      "Temps court, temps long (Fernand Braudel)",
      "Une périodisation vivante : calendriers, Anthropocène"
    ],
    cle: "La périodisation est une construction des historiens : ils découpent le temps après coup en périodes pour le rendre compréhensible, mais les bornes choisies (476, 1453 ou 1492, 1789) sont des choix symboliques qui se discutent.",
    essentiel: [
      "L'histoire étudie le passé des sociétés humaines à partir de traces (sources écrites, matérielles, orales, numériques) : l'historien les sélectionne, les recoupe et propose une interprétation vérifiable.",
      "Périodiser, c'est découper le passé en périodes pour pouvoir le penser, le comparer et l'enseigner. Ce découpage est fait après coup : personne, en 475, ne savait qu'il vivait « la fin de l'Antiquité ».",
      "Après la Préhistoire, on distingue traditionnellement quatre grandes périodes : l'Antiquité (jusqu'en 476), le Moyen Âge (jusqu'en 1453 ou 1492), l'époque moderne (jusqu'en 1789) et l'époque contemporaine.",
      "Ces bornes sont des choix symboliques, faits surtout d'un point de vue européen. Pour Henri Pirenne, la vraie rupture avec le monde romain vient des conquêtes arabes du VIIᵉ siècle ; le nom même de « Moyen Âge » a été inventé à la Renaissance pour dénigrer cette période.",
      "Fernand Braudel distingue trois temps : le temps court des événements, le temps moyen et le temps long, dont l'événement n'est que « l'écume ».",
      "D'autres cultures comptent le temps autrement (calendriers musulman, chinois, hébraïque, compte long maya). Aujourd'hui, certains proposent une nouvelle période, l'Anthropocène : un terme proposé en 2000 par le chimiste Paul Crutzen."
    ],
    periodes: [
      { de: -3300, a: 476, nom: "Antiquité" },
      { de: 476, a: 1492, nom: "Moyen Âge" },
      { de: 1492, a: 1789, nom: "Époque moderne", court: "Moderne" },
      { de: 1789, a: 2026, nom: "Époque contemporaine", court: "Contemporaine" }
    ],
    reperes: [
      { a: -3300, date: "vers 3300 av. J.-C.", txt: "Naissance de l'écriture en Mésopotamie (Sumer), puis en Égypte vers 3200 av. J.-C. : fin de la Préhistoire, début de l'Antiquité." },
      { a: 395, date: "395", txt: "L'Empire romain est divisé en deux : Empire d'Occident et Empire d'Orient." },
      { a: 476, date: "476", txt: "Le chef germanique Odoacre dépose Romulus Augustule, dernier empereur romain d'Occident : la borne retenue pour la fin de l'Antiquité." },
      { a: 496, date: "vers 496", txt: "Baptême de Clovis, roi des Francs." },
      { a: 1453, date: "1453", txt: "Les Ottomans prennent Constantinople : fin de l'Empire byzantin ; une borne possible de la fin du Moyen Âge." },
      { a: 1492, date: "1492", txt: "Christophe Colomb atteint l'Amérique : l'autre borne retenue pour le début de l'époque moderne." },
      { a: 1517, date: "1517", txt: "Luther publie ses 95 thèses : début de la Réforme protestante." },
      { a: 1789, date: "1789", txt: "Début de la Révolution française : la borne retenue pour le début de l'époque contemporaine." },
      { a: 1815, date: "1815", txt: "Le congrès de Vienne redessine l'Europe après la chute de Napoléon." },
      { a: 2000, date: "2000", txt: "Le chimiste Paul Crutzen propose le terme d'Anthropocène." },
      { a: 2020, date: "2020", txt: "Pandémie mondiale de Covid-19." }
    ],
    notions: [
      { mot: "Histoire", def: "Discipline qui étudie le passé des sociétés humaines à partir de traces : elle ne le raconte pas tel quel, elle l'interroge et le reconstruit." },
      { mot: "Source", def: "Trace du passé sur laquelle s'appuie l'historien : source écrite, matérielle, orale ou numérique." },
      { mot: "Périodisation", def: "Fait de découper le temps en différentes périodes, pour pouvoir le penser, le comparer et l'enseigner." },
      { mot: "Période", def: "Segment de l'histoire qui se distingue des autres par des caractéristiques propres." },
      { mot: "Événement", def: "Fait remarquable, jugé digne d'être retenu et consigné par écrit ; il peut marquer une rupture, avec un avant et un après." },
      { mot: "Borne chronologique", def: "Date choisie pour marquer le passage d'une période à une autre (476, 1492, 1789) : un choix symbolique, fait après coup, qui se discute." },
      { mot: "Chrononyme", def: "Nom donné à une période (« Moyen Âge », « Renaissance »…). Il n'est jamais neutre : il dit souvent comment on juge cette période." },
      { mot: "Préhistoire", def: "Période qui précède l'invention de l'écriture. Longtemps exclue de l'histoire faute d'écrits, elle est connue grâce à l'archéologie." },
      { mot: "Antiquité", def: "Du latin antiquitas, « temps très anciens » : de l'invention de l'écriture (vers 3300 av. J.-C.) à la fin de l'Empire romain d'Occident (476)." },
      { mot: "Moyen Âge", def: "Période de 476 à 1453 ou 1492. Son nom a été inventé à la Renaissance par des humanistes qui la jugeaient « âge sombre », pour valoriser leur propre époque." },
      { mot: "Époque moderne", def: "Période de la fin du XVᵉ siècle (1453 ou 1492) à la Révolution française (1789) : Renaissance, affirmation de l'État sous Louis XIV, siècle des Lumières." },
      { mot: "Époque contemporaine", def: "Période de 1789 à nos jours : croissance démographique, industrie, nationalismes, colonisation, guerres, démocraties et totalitarismes." },
      { mot: "Temps court, moyen et long", def: "Les trois temps de l'histoire selon Fernand Braudel : le temps court des événements, le temps moyen des évolutions sur quelques décennies, le temps long (la « longue durée ») des structures qui changent très lentement." },
      { mot: "Calendrier", def: "Système qui divise et compte le temps à partir d'un point de départ choisi : la naissance du Christ pour le calendrier chrétien, l'Hégire (622) pour le calendrier musulman." },
      { mot: "Anthropocène", def: "Période dans laquelle l'action de l'être humain devient irréversible sur la Terre. Le terme a été proposé en 2000 par le chimiste Paul Crutzen ; son adoption comme période officielle reste débattue." }
    ],
    personnages: [
      { nom: "Odoacre", dates: "vers 433-493", txt: [
        "Chef germanique, officier de l'armée romaine.",
        "En 476, il dépose le jeune Romulus Augustule, dernier empereur romain d'Occident.",
        "Depuis le XIXᵉ siècle, ce geste sert de borne pour marquer la fin de l'Antiquité."
      ] },
      { nom: "Henri Pirenne", dates: "1862-1935", txt: [
        "Historien belge, spécialiste du Moyen Âge.",
        "Pour lui, la vraie rupture avec le monde romain n'a pas lieu en 476.",
        "Elle vient des conquêtes arabes du VIIᵉ siècle, qui coupent la Méditerranée en deux.",
        "Sa thèse se résume par la formule « sans Mahomet, Charlemagne est inconcevable » (Mahomet et Charlemagne, 1937)."
      ] },
      { nom: "Fernand Braudel", dates: "1902-1985", txt: [
        "Historien français du XXᵉ siècle.",
        "Il consacre sa grande thèse à la Méditerranée au temps de Philippe II (1949).",
        "Il distingue trois temps en histoire : court, moyen et long.",
        "Pour lui, l'événement n'est que l'écume à la surface d'un océan de temps long."
      ] },
      { nom: "Jacques Le Goff", dates: "1924-2014", txt: [
        "Historien français, grand spécialiste du Moyen Âge.",
        "Il défend l'idée d'un « long Moyen Âge », qui durerait jusqu'au milieu du XVIIIᵉ siècle.",
        "En 2014, il publie Faut-il vraiment découper l'histoire en tranches ?"
      ] },
      { nom: "Paul Crutzen", dates: "1933-2021", txt: [
        "Chimiste néerlandais, spécialiste de l'atmosphère.",
        "Prix Nobel de chimie en 1995 pour ses travaux sur la couche d'ozone.",
        "En 2000, il propose de nommer « Anthropocène » une nouvelle période, marquée par l'action irréversible de l'être humain sur la Terre."
      ] }
    ],
    trous: [
      { titre: "Le temps de l'historien", texte: "L'[histoire] étudie le passé des sociétés humaines à partir de [traces] : elle ne le raconte pas tel quel, elle l'interroge et le reconstruit. [Périodiser], c'est découper ce passé en unités de sens, appelées « [périodes] ». Le temps vécu par les contemporains est [continu] : personne, en 475, ne savait qu'il vivait « la fin de l'Antiquité ». Une périodisation n'est donc pas une donnée du passé : c'est une [construction], qui dépend d'un [point de vue]." },
      { titre: "Les grandes périodes", texte: "La Préhistoire s'achève avec l'invention de l'[écriture]. L'[Antiquité] se termine en [476], quand Odoacre dépose le dernier empereur romain d'Occident. Le [Moyen Âge] dure jusqu'en [1453] ou en [1492]. L'époque [moderne] s'achève avec la Révolution française, en [1789] ; commence alors l'époque [contemporaine]." },
      { titre: "Des bornes discutées", texte: "Pour l'historien belge Henri [Pirenne], la vraie rupture avec le monde romain vient des conquêtes [arabes] du VIIᵉ siècle. Fernand [Braudel] distingue trois temps : court, moyen et [long] ; pour lui, l'[événement] n'est que l'écume à la surface de la longue durée. D'autres cultures comptent le temps avec leur propre [calendrier]. Aujourd'hui, certains proposent une nouvelle période, l'[Anthropocène], marquée par l'action irréversible de l'être humain sur la Terre." }
    ],
    capable: [
      "Expliquer que la périodisation est une construction humaine pour organiser l'histoire.",
      "Nommer dans l'ordre les grandes périodes de l'histoire.",
      "Connaître les dates-clés qui les séparent (476, 1453, 1492, 1789) et dire à quoi elles correspondent.",
      "Critiquer le caractère subjectif de ces dates (par exemple : pourquoi 1492 ? pourquoi 476 ?).",
      "Expliquer la thèse d'Henri Pirenne sur la fin du monde romain.",
      "Distinguer temps court, temps moyen et temps long, selon Fernand Braudel.",
      "Proposer une autre façon de diviser l'histoire (par thèmes, par cultures…).",
      "Comparer des façons de compter le temps issues de cultures différentes (calendriers musulman, chinois, hébraïque).",
      "Construire une frise chronologique avec des événements marquants.",
      "Dire ce qu'est l'Anthropocène et pourquoi il fait débat."
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
    id: "2de-h1-c2", n: "2nde", d: "histoire", carte: "mediterranee",
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
      { a: 1187, date: "1187", txt: "Bataille de Hattin : Saladin reprend Jérusalem." },
      { a: 1204, date: "1204", txt: "Sac de Constantinople par les croisés de la quatrième croisade, endettés envers Venise pour leur transport." },
      { a: 1291, date: "1291", txt: "Chute d'Acre : fin des États latins d'Orient." },
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
      { nom: "Constantinople", lon: 28.98, lat: 41.01, txt: "Capitale de l'Empire byzantin et siège du patriarche ; pillée en 1204, prise par les Ottomans en 1453." },
      { nom: "Rome", lon: 12.48, lat: 41.89, txt: "Siège du pape, chef de l'Église catholique." },
      { nom: "Bagdad", lon: 44.36, lat: 33.31, txt: "Capitale du califat abbasside." },
      { nom: "Cordoue", lon: -4.78, lat: 37.88, txt: "Capitale du califat omeyyade d'al-Andalus, en péninsule Ibérique." },
      { nom: "Le Caire", lon: 31.24, lat: 30.04, txt: "Capitale du califat fatimide, fondée en 969." },
      { nom: "Jérusalem", lon: 35.23, lat: 31.78, txt: "Ville sainte pour les juifs, les chrétiens et les musulmans ; objectif des croisades." },
      { nom: "Venise", lon: 12.34, lat: 45.44, txt: "Cité maritime d'Italie, dirigée par un doge, qui bâtit sa puissance sur le commerce et ses comptoirs." },
      { nom: "Tolède", lon: -4.02, lat: 39.86, txt: "Ville de la péninsule Ibérique où des traducteurs font passer en latin des savoirs grecs et arabes." }
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
    ],

    /* Les deux points de passage, repris des fiches et des jeux Canva :
       « C2-Fiche4-PPO-Venise », « PPO Venise — version à projeter », « Galère pour l'Orient, Venise 1350 » ;
       « C2-Fiche2-Croisades-djihad-PPO-Bernard », « Vézelay, 31 mars 1146 », « Bilan carte mentale — PPO Bernard de Clairvaux ». */
    ppo: [
      {
        id: "venise", court: "PPO Venise",
        titre: "Venise, grande puissance maritime et commerciale",
        question: "Sur quoi Venise fonde-t-elle sa puissance, et qu'est-ce qui finit par la menacer ?",
        branches: [
          { titre: "Les fondements", points: [
            "Une ville bâtie sur une lagune : l'eau et les bancs de vase la protègent, elle n'a pas besoin de murailles.",
            "Le sel, première source d'enrichissement.",
            "Le navire : une flotte de commerce et de guerre, armée à l'Arsenal."
          ] },
          { titre: "Un intermédiaire commercial", points: [
            "Venise commerce avec les Carolingiens et les Byzantins, puis avec les musulmans et les Ottomans : pour elle, le commerce passe avant la guerre.",
            "Elle rapporte d'Orient épices, soieries, coton, sucre, alun ; elle y vend draps de laine, cuivre, argent, verre de Murano.",
            "Le ducat d'or (1284), au poids fixe : une monnaie de confiance, acceptée dans toute la Méditerranée."
          ] },
          { titre: "Le Stato da Mar", points: [
            "Des fondouks (comptoirs) dans les grandes villes : Constantinople, Alexandrie.",
            "Après la quatrième croisade (1204), des colonies : îles de l'Égée, régions de Grèce ; la Crète, achetée, colonie d'exploitation (coton, blé, vin).",
            "Chypre devient vénitienne en 1489 (sucre, sel). Au XVᵉ siècle, Venise conquiert aussi la Terre Ferme, en Italie."
          ] },
          { titre: "Les menaces", points: [
            "Gênes, la grande rivale : la guerre de Chioggia (1378-1381), gagnée grâce à la flotte.",
            "Les Ottomans prennent Constantinople (1453), puis Modon et Coron (1500).",
            "La route portugaise des Indes (1498) permet d'acheter les épices sans passer par Venise."
          ] }
        ],
        reperes: [
          { a: 1082, date: "1082", txt: "L'empereur byzantin accorde à Venise des privilèges de commerce à Constantinople." },
          { a: 1204, date: "1204", txt: "Après la quatrième croisade, Venise gagne un empire : îles de l'Égée, régions de Grèce, la Crète." },
          { a: 1284, date: "1284", txt: "Premier ducat d'or vénitien." },
          { a: 1378, b: 1381, date: "1378-1381", txt: "Guerre de Chioggia : Venise l'emporte sur Gênes, sa grande rivale." },
          { a: 1404, b: 1428, date: "1404-1428", txt: "Venise conquiert la Terre Ferme : Padoue, Vérone, Brescia." },
          { a: 1453, date: "1453", txt: "Les Ottomans prennent Constantinople ; Venise continue de commercer avec eux." },
          { a: 1489, date: "1489", txt: "Chypre devient vénitienne." },
          { a: 1498, date: "1498", txt: "Vasco de Gama atteint l'Inde par l'Atlantique : une route des épices qui contourne Venise." },
          { a: 1500, date: "1500", txt: "Les Ottomans prennent Modon et Coron, ports vénitiens de Grèce." }
        ],
        notions: [
          { mot: "Lagune", def: "Étendue d'eau peu profonde, séparée de la mer par des bancs de sable." },
          { mot: "Doge", def: "Chef de la République de Venise, élu à vie." },
          { mot: "Fondouk", def: "Comptoir : bâtiment ou quartier d'une ville étrangère où les marchands vénitiens logent, stockent et vendent, avec des droits particuliers." },
          { mot: "Privilège", def: "Droit particulier accordé par un souverain ; par exemple, commercer sans payer de taxes." },
          { mot: "Stato da Mar", def: "« L'État de mer » : l'ensemble des possessions de Venise outre-mer." },
          { mot: "Colonie", def: "Territoire dominé et exploité par une puissance étrangère, comme la Crète pour Venise." },
          { mot: "Ducat", def: "Pièce d'or de Venise, créée en 1284, au poids fixe, acceptée dans toute la Méditerranée." },
          { mot: "Terre Ferme", def: "Territoire conquis par Venise sur le continent italien au XVᵉ siècle (Padoue, Vérone, Brescia)." },
          { mot: "Arsenal", def: "Chantier naval de Venise, où l'on construit et arme les galères des convois de commerce." },
          { mot: "Consul (ou bayle)", def: "Représentant de Venise auprès d'un souverain étranger, par exemple à Alexandrie ou à Constantinople." }
        ],
        personnages: [],
        lieux: [
          { nom: "Venise", lon: 12.34, lat: 45.44, txt: "Cité bâtie sur une lagune de l'Adriatique, dirigée par un doge ; capitale du Stato da Mar." },
          { nom: "Constantinople", lon: 28.98, lat: 41.01, txt: "Capitale byzantine où Venise obtient des privilèges en 1082 et un quartier de commerce ; prise par les Ottomans en 1453." },
          { nom: "Alexandrie", lon: 29.92, lat: 31.2, txt: "Grand port d'Égypte (sultanat mamelouk) où les Vénitiens ont un fondouk et achètent les épices." },
          { nom: "Crète (Candie)", lon: 25.13, lat: 35.34, txt: "Île achetée par Venise en 1204 : colonie d'exploitation qui fournit coton, blé et vin." },
          { nom: "Chypre (Famagouste)", lon: 33.94, lat: 35.12, txt: "Île du sucre et du sel ; Famagouste devient un grand marché après 1291 ; vénitienne en 1489." },
          { nom: "Modon", lon: 21.7, lat: 36.82, txt: "Port vénitien du Péloponnèse, tenu après 1204 ; avec Coron, l'un des « yeux de la République »." },
          { nom: "Raguse", lon: 18.09, lat: 42.65, txt: "Port de l'Adriatique, escale des galères vénitiennes vers l'Orient." },
          { nom: "Gênes", lon: 8.93, lat: 44.41, txt: "Cité marchande d'Italie, grande rivale de Venise en Méditerranée orientale." }
        ],
        documents: [
          { titre: "Le sel et le navire", source: "Philippe Braunstein, historien, Les Collections de L'Histoire, n° 71, 2016.",
            extrait: "« La ville ne peut compter que sur les produits de ses proches campagnes. Mais elle extrait le sel, la première source d'enrichissement. Le sel et le navire sont ainsi les deux fondements de cette prospérité très ancienne. »",
            montre: "Un historien explique les deux fondements de la puissance vénitienne." },
          { titre: "Un intermédiaire entre les puissances", source: "Philippe Braunstein, historien, Les Collections de L'Histoire, n° 71, 2016.",
            extrait: "« Venise a toujours été un intermédiaire entre de grandes puissances. […] En 993 et 1082, ils obtiennent de Byzance des droits et des positions de commerce privilégiées. Puis, lorsque les Turcs s'emparent de Constantinople en 1453, ils continuent à commercer avec eux. »",
            montre: "Venise commerce avec des mondes qui se font la guerre : le commerce continue au milieu des conflits." },
          { titre: "Le ducat d'or", source: "Monnaie créée à Venise en 1284.",
            extrait: "D'un côté, saint Marc, patron de Venise, remet l'étendard au doge agenouillé ; de l'autre, le Christ debout. Or presque pur, poids inchangé pendant des siècles.",
            montre: "Une monnaie de confiance : sa valeur est garantie par l'or, par son poids fixe et par les images religieuses." }
        ],
        pieges: [
          "1204 : ne pas écrire que les croisés ont attaqué Constantinople « pour le compte de Venise ». Endettés envers Venise pour leur transport, ils suivent un prétendant byzantin, Alexis IV Ange, qui ne tient pas ses promesses. Venise en tire un immense profit, mais ce n'était pas un plan préparé à l'avance.",
          "Au XVᵉ siècle, la puissance de Venise n'est plus seulement maritime : elle conquiert la Terre Ferme en Italie.",
          "Distinguer un fondouk (un comptoir, dans une ville étrangère) et une colonie (un territoire dominé et exploité, comme la Crète)."
        ],
        mots: ["lagune", "sel", "navire", "fondouk", "Crète", "épices", "ducat", "Gênes", "Ottomans"],
        reponse: "Protégée par sa lagune, Venise s'enrichit d'abord grâce au sel et au navire. Elle devient l'intermédiaire entre l'Orient et l'Occident : dans ses fondouks et ses colonies comme la Crète, elle achète les épices et la soie qu'elle revend en Europe, payées en ducats. Mais sa puissance est menacée par Gênes, puis par les Ottomans et la nouvelle route portugaise des Indes.",
        trous: [
          { titre: "Le bilan", texte: "Protégée par sa [lagune], Venise s'enrichit d'abord grâce au [sel] et au [navire]. Elle devient l'intermédiaire entre l'Orient et l'Occident : dans ses [fondouks] et ses colonies comme la [Crète], elle achète les [épices] et la soie qu'elle revend en Europe, payées en [ducats]. Mais sa puissance est menacée par [Gênes], puis par les [Ottomans] et la nouvelle route portugaise des Indes." },
          { titre: "Le Stato da Mar", texte: "En [1082], l'empereur byzantin accorde des privilèges aux Vénitiens. Après la quatrième croisade, en [1204], Venise obtient des îles de l'Égée et la Crète : c'est le [Stato da Mar]. Ses marchands achètent les épices dans le fondouk d'[Alexandrie]. En [1489], Chypre devient vénitienne. Au XVᵉ siècle, Venise conquiert aussi la [Terre Ferme] en Italie." }
        ],
        schema: { titre: "La puissance vénitienne (XIIᵉ-XVᵉ siècle)", cases: [
          { titre: "Les fondements", aide: "le site et les ressources de départ", etiquettes: ["le sel de la lagune", "le navire", "une ville sans muraille, protégée par la lagune"] },
          { titre: "Les possessions", aide: "Stato da Mar, puis Terre Ferme", etiquettes: ["les fondouks d'Alexandrie et de Constantinople", "la Crète, colonie d'exploitation", "Modon et Coron", "Chypre (1489)", "la Terre Ferme"] },
          { titre: "Un intermédiaire entre trois mondes", aide: "produits et partenaires", etiquettes: ["épices et soieries d'Orient", "draps et métaux d'Occident", "Byzantins, Mamelouks puis Ottomans"] },
          { titre: "Les instruments de la puissance", aide: "monnaie, flotte, privilèges", etiquettes: ["le ducat d'or", "l'Arsenal et les convois de galères", "les privilèges de 1082"] },
          { titre: "Les menaces", aide: "rivaux et concurrents", etiquettes: ["Gênes", "les Turcs ottomans", "la route portugaise des Indes"] }
        ] },
        capable: [
          "Expliquer sur quoi repose la puissance de Venise au départ (lagune, sel, navire).",
          "Citer deux types de possessions vénitiennes, avec un exemple pour chacun.",
          "Expliquer pourquoi le ducat inspire confiance aux marchands.",
          "Expliquer pourquoi Venise commerce avec des mondes qui se font la guerre.",
          "Citer trois menaces qui pèsent sur la puissance vénitienne.",
          "Dire ce que Venise gagne en 1204, sans écrire que la croisade a été faite « pour son compte »."
        ]
      },
      {
        id: "bernard", court: "PPO Bernard",
        titre: "Bernard de Clairvaux et la deuxième croisade",
        question: "Comment un moine, sans armée ni royaume, devient-il l'un des principaux acteurs politiques de l'Occident ?",
        branches: [
          { titre: "Qui est Bernard ?", points: [
            "Né vers 1090 en Bourgogne, dans une famille noble, il devient moine à Cîteaux en 1112.",
            "Abbé de Clairvaux en 1115 : un moine cistercien qui vit de prière, de pauvreté et de travail.",
            "Réputé pour sa sainteté, il écrit des centaines de lettres et conseille papes et rois ; le pape Eugène III est son ancien disciple."
          ] },
          { titre: "Pourquoi une croisade ?", points: [
            "Noël 1144 : Zengi, maître de Mossoul et d'Alep, prend Édesse, l'un des États latins d'Orient.",
            "1er décembre 1145 : par une bulle, le pape Eugène III appelle à la croisade et promet l'indulgence (le pardon des péchés).",
            "Un pèlerinage en armes : Bernard justifie le combat du « chevalier du Christ »."
          ] },
          { titre: "Ses armes : la parole", points: [
            "Vézelay, 31 mars 1146 : devant Louis VII et Aliénor, la foule réclame « des croix, des croix ! ».",
            "Spire, Noël 1146 : il convainc le roi germanique Conrad III de prendre la croix.",
            "Ses lettres sont lues dans toute la chrétienté ; en Rhénanie, il fait taire le moine Raoul, qui appelle à massacrer les juifs."
          ] },
          { titre: "La croisade échoue (1147-1149)", points: [
            "1147 : deux armées royales partent, celles de Louis VII et de Conrad III.",
            "Défaites face aux Turcs en Asie Mineure : Dorylée (octobre 1147), mont Cadmos (janvier 1148) ; en juillet 1148, le siège de Damas est abandonné.",
            "Seul succès : Lisbonne, prise par des croisés venus du Nord (octobre 1147). Bernard explique l'échec par les péchés des croisés."
          ] }
        ],
        reperes: [
          { a: 1095, date: "1095", txt: "Au concile de Clermont, le pape Urbain II appelle à la première croisade." },
          { a: 1105, date: "1105", txt: "À Damas, le juriste al-Sulamî appelle au djihad contre les Francs." },
          { a: 1115, date: "1115", txt: "Bernard devient abbé de Clairvaux." },
          { a: "1144-12-24", date: "Noël 1144", txt: "Zengi prend Édesse, l'un des États latins d'Orient." },
          { a: "1145-12-01", date: "1er décembre 1145", txt: "Par une bulle, le pape Eugène III appelle à la croisade." },
          { a: "1146-03-31", date: "31 mars 1146", txt: "À Vézelay, Bernard prêche la croisade devant Louis VII et Aliénor." },
          { a: "1146-12-25", date: "Noël 1146", txt: "À Spire, Bernard convainc Conrad III de prendre la croix." },
          { a: "1148-07-24", date: "juillet 1148", txt: "Le siège de Damas est abandonné : la croisade a échoué." },
          { a: 1153, date: "1153", txt: "Mort de Bernard ; il est proclamé saint en 1174." }
        ],
        notions: [
          { mot: "Indulgence", def: "Remise des peines dues pour les péchés, promise à ceux qui partent en croisade." },
          { mot: "Pèlerinage", def: "Voyage vers un lieu saint pour prier et obtenir le pardon de ses péchés." },
          { mot: "Bulle", def: "Lettre officielle du pape, scellée d'un sceau de plomb : celle de 1145 appelle à la croisade." },
          { mot: "Prendre la croix", def: "Faire le vœu de partir en croisade ; on coud une croix de tissu sur son vêtement." },
          { mot: "Abbé", def: "Moine élu à la tête d'une abbaye." },
          { mot: "Ordre cistercien", def: "Ordre de moines né à Cîteaux, réputé pour sa rigueur : prière, pauvreté, travail." },
          { mot: "États latins d'Orient", def: "Les quatre principautés fondées par les croisés après 1099 : Jérusalem, Antioche, Édesse, Tripoli." },
          { mot: "Templiers", def: "Ordre de moines-soldats chargé de protéger les pèlerins ; Bernard écrit pour eux l'Éloge de la nouvelle chevalerie." },
          { mot: "Guerre sainte", def: "Guerre présentée par une autorité religieuse comme voulue par Dieu." }
        ],
        personnages: [
          { nom: "Eugène III", dates: "pape de 1145 à 1153", txt: [
            "Ancien moine de Clairvaux, disciple de Bernard.",
            "Devenu pape, il apprend la chute d'Édesse.",
            "Le 1er décembre 1145, par une bulle, il appelle à une nouvelle croisade et charge Bernard de la prêcher."
          ] },
          { nom: "Louis VII", dates: "roi des Francs de 1137 à 1180", txt: [
            "Roi des Francs, sacré à Reims.",
            "Le 31 mars 1146, à Vézelay, il prend la croix avec la reine Aliénor.",
            "Parti en 1147, son armée est battue au mont Cadmos, puis échoue devant Damas."
          ] },
          { nom: "Aliénor d'Aquitaine", dates: "vers 1122-1204", txt: [
            "Duchesse d'Aquitaine, reine par son mariage avec le roi des Francs.",
            "Elle assiste au sermon de Vézelay en 1146.",
            "Elle accompagne le roi en Orient pendant la deuxième croisade."
          ] },
          { nom: "Conrad III", dates: "roi germanique de 1138 à 1152", txt: [
            "Roi germanique, à la tête de l'Empire.",
            "À Noël 1146, à Spire, Bernard le convainc de prendre la croix.",
            "Son armée est battue par les Turcs à Dorylée, en octobre 1147."
          ] },
          { nom: "Zengi", dates: "mort en 1146", txt: [
            "Chef turc, maître de Mossoul et d'Alep.",
            "À Noël 1144, il prend Édesse, le plus ancien des États latins d'Orient.",
            "Sa conquête provoque la deuxième croisade."
          ] },
          { nom: "Odon de Deuil", dates: "vers 1110-1162", txt: [
            "Moine de l'abbaye de Saint-Denis.",
            "Chapelain du roi Louis VII, il suit l'armée pendant la croisade.",
            "Il raconte le sermon de Vézelay : un récit d'admirateur du roi, à lire avec prudence."
          ] },
          { nom: "Urbain II", dates: "pape de 1088 à 1099", txt: [
            "Pape à la fin du XIᵉ siècle.",
            "En 1095, au concile de Clermont, il appelle les chevaliers à secourir les chrétiens d'Orient.",
            "Il promet la rémission des péchés à ceux qui partent : c'est la première croisade."
          ] },
          { nom: "Al-Sulamî", dates: "mort en 1106", txt: [
            "Juriste musulman de Damas.",
            "En 1105, six ans après la prise de Jérusalem par les croisés, il écrit un Livre du djihad.",
            "Il reproche aux musulmans leur désunion face aux Francs."
          ] }
        ],
        lieux: [
          { nom: "Clairvaux", lon: 4.79, lat: 48.15, txt: "Abbaye cistercienne de Champagne, dirigée par Bernard à partir de 1115." },
          { nom: "Vézelay", lon: 3.75, lat: 47.47, txt: "Colline de Bourgogne, lieu de pèlerinage (basilique de la Madeleine), où Bernard prêche la croisade le 31 mars 1146." },
          { nom: "Spire", lon: 8.43, lat: 49.32, txt: "Ville de l'Empire germanique où Conrad III prend la croix, à Noël 1146." },
          { nom: "Édesse", lon: 38.79, lat: 37.16, txt: "Capitale du plus ancien des États latins d'Orient, prise par Zengi en 1144." },
          { nom: "Dorylée", lon: 30.52, lat: 39.78, txt: "Lieu d'Asie Mineure où l'armée de Conrad III est battue par les Turcs, en octobre 1147." },
          { nom: "Mont Cadmos", lon: 29.27, lat: 37.68, txt: "Montagne d'Asie Mineure où l'armée de Louis VII est battue, en janvier 1148." },
          { nom: "Damas", lon: 36.29, lat: 33.51, txt: "Grande ville musulmane de Syrie, assiégée en vain par les croisés en juillet 1148." },
          { nom: "Lisbonne", lon: -9.14, lat: 38.72, txt: "Ville prise en octobre 1147 par des croisés venus du Nord : le seul succès de la croisade." }
        ],
        documents: [
          { titre: "Bernard justifie le combat du chevalier chrétien", source: "Bernard de Clairvaux, Éloge de la nouvelle chevalerie, vers 1128-1136, écrit à la demande des Templiers.",
            extrait: "« C'est en toute sécurité que les chevaliers du Christ combattent pour leur Seigneur, sans avoir à craindre de pécher en tuant leurs adversaires, ni de périr, s'ils se font tuer eux-mêmes. […] Pourtant, il ne convient pas de tuer les païens si l'on peut trouver un autre moyen de les empêcher de harceler ou d'opprimer les fidèles. »",
            montre: "Le chevalier du Christ peut tuer sans pécher ; la dernière phrase montre que Bernard hésite malgré tout." },
          { titre: "Vézelay, 31 mars 1146", source: "Odon de Deuil, moine de Saint-Denis, chapelain de Louis VII, Histoire de la croisade de Louis VII, vers 1148.",
            extrait: "« De toutes parts, tous firent entendre leurs acclamations, demandant des croix, des croix ! Et après que l'abbé eut semé, plus encore que distribué, un faisceau de croix qu'il avait fait préparer à l'avance, il fut forcé de couper ses propres vêtements pour en faire d'autres croix. »",
            montre: "L'effet de la parole de Bernard sur la foule. À lire avec prudence : l'auteur admire le roi." },
          { titre: "Bernard explique l'échec", source: "Bernard de Clairvaux, De la considération, II, 1, vers 1149-1152, au pape Eugène III.",
            extrait: "« Nous avions dit : « Vous aurez la paix », et la paix est loin de nous. […] Je n'ai fait qu'obéir à vos ordres, ou plutôt aux ordres de Dieu même qui me parlait par votre bouche. »",
            montre: "Bernard attribue l'échec aux péchés des croisés et ne remet pas en cause son appel." },
          { titre: "Un même argument dans les deux camps", source: "Urbain II à Clermont (1095), d'après Foucher de Chartres ; al-Sulamî, Livre du djihad, Damas, 1105.",
            extrait: "Urbain II : « Qu'ils soient désormais des chevaliers du Christ, ceux-là qui n'étaient que des brigands ! » — Al-Sulamî : « Tout musulman, qu'il soit riche ou pauvre, doit s'engager contre elles. »",
            montre: "Des deux côtés, des hommes de religion présentent la guerre comme voulue par Dieu." }
        ],
        pieges: [
          "Bernard ne décide pas la croisade : c'est le pape Eugène III, par sa bulle de 1145. Bernard la prêche.",
          "Djihad : le mot signifie « effort » et a plusieurs sens ; al-Sulamî et Saladin n'en mobilisent qu'un, la lutte armée. Évitez l'opposition « grand djihad / petit djihad », fondée sur un texte tardif dont l'authenticité est discutée.",
          "Reconquista : le mot n'existe pas au Moyen Âge, il a été forgé au XIXᵉ siècle. Le mot « croisade » lui-même n'apparaît qu'au XIIIᵉ siècle : on parlait de « passage » ou de « pèlerinage ».",
          "Foucher de Chartres et Odon de Deuil écrivent après coup et du côté chrétien : leurs récits disent aussi ce que l'on a voulu retenir."
        ],
        mots: ["abbé", "sermon", "lettres", "pape Eugène III", "Louis VII", "Conrad III", "Vézelay", "croisade", "échec"],
        reponse: "Bernard, abbé de Clairvaux, n'a ni armée ni royaume, mais il agit par sa parole et par son prestige de saint homme. Chargé par le pape Eugène III, son ancien disciple, de prêcher la croisade après la chute d'Édesse, il soulève la foule à Vézelay en 1146, puis convainc Louis VII et Conrad III de prendre la croix ; ses lettres circulent dans toute la chrétienté. Mais il lance la croisade sans en contrôler l'issue : après les défaites en Asie Mineure et l'échec devant Damas en 1148, il explique l'échec par les péchés des croisés, sans remettre en cause son appel.",
        trous: [
          { titre: "Le bilan", texte: "Bernard, [abbé] de Clairvaux, n'a ni armée ni royaume. Chargé par le pape [Eugène III] de prêcher la croisade après la chute d'[Édesse], il soulève la foule à [Vézelay] en 1146, puis convainc [Louis VII] et [Conrad III] de prendre la croix. Mais la croisade échoue devant [Damas] en 1148 : Bernard l'explique par les [péchés] des croisés." },
          { titre: "Croisades et djihad", texte: "En 1095, le pape [Urbain II] promet la rémission des péchés aux chevaliers qui partent. Bernard affirme que le chevalier du Christ peut tuer sans [pécher]. Du côté musulman, le juriste [al-Sulamî] (1105), puis [Saladin], appellent au [djihad] et reprochent aux musulmans leur désunion. Dans les deux camps, la guerre est présentée comme voulue par [Dieu]." }
        ],
        schema: { titre: "La puissance d'un moine", cases: [
          { titre: "Ses armes", aide: "sans armée ni royaume", etiquettes: ["ses sermons (Vézelay, Spire)", "des centaines de lettres", "un livre pour les Templiers", "son prestige de saint homme"] },
          { titre: "Ceux qu'il entraîne", aide: "du pape aux foules", etiquettes: ["le pape Eugène III, son ancien disciple", "Louis VII et Aliénor", "Conrad III", "des foules de chevaliers et de pèlerins"] },
          { titre: "Ce qu'il obtient", aide: "les résultats de son action", etiquettes: ["deux armées royales partent en 1147", "les juifs de Rhénanie protégés"] },
          { titre: "Les limites", aide: "échecs et critiques", etiquettes: ["défaites en Asie Mineure", "échec devant Damas", "il est accusé d'avoir envoyé des hommes à la mort"] }
        ] },
        capable: [
          "Expliquer pourquoi la deuxième croisade est lancée (chute d'Édesse, 1144).",
          "Distinguer qui décide la croisade (le pape) et qui la prêche (Bernard).",
          "Expliquer comment un moine sans armée ni royaume devient un acteur politique.",
          "Raconter l'échec de la croisade et dire comment Bernard l'explique.",
          "Comparer les appels chrétiens et musulmans à la guerre au nom de la foi.",
          "Critiquer un récit écrit après coup (Odon de Deuil, Foucher de Chartres)."
        ]
      }
    ]
  },

  /* =====================================================================
     2nde — HISTOIRE — Thème 2, chapitre 3
     ===================================================================== */
  {
    id: "2de-h2-c3", n: "2nde", d: "histoire", carte: ["europe", "monde"],
    theme: "XVᵉ-XVIᵉ siècles : un nouveau rapport au monde, un temps de mutation intellectuelle",
    rituel: "XVe-XVIe siècles : nouveau rapport au monde",
    num: "Chapitre 3",
    titre: "L'ouverture atlantique : les conséquences de la découverte du « Nouveau Monde »",
    question: "Dans quelle mesure l'ouverture des Européens sur l'Atlantique aux XVᵉ-XVIᵉ siècles bouleverse-t-elle les relations entre les continents et les peuples ?",
    plan: [
      "Les voyages européens : une construction historique à déconstruire (pourquoi partir ? ; Magellan ou Enrique ?)",
      "Explorer, conquérir, coloniser : une transformation profonde du monde (de l'exploration à la colonie ; Las Casas et la controverse de Valladolid ; Cholula, ville métisse)",
      "Une nouvelle économie-monde : ressources, esclavages, circulations (l'or et l'argent ; le sucre et l'esclavage)"
    ],
    cle: "Aux XVᵉ-XVIᵉ siècles, l'ouverture atlantique relie durablement l'Europe, l'Afrique, l'Amérique et l'Asie : c'est une première mondialisation, mais elle se fait au prix de l'effondrement des peuples amérindiens et de la déportation des Africains.",
    essentiel: [
      "Après la prise de Constantinople par les Ottomans (1453), les Européens, d'abord les Portugais, cherchent une route maritime vers les épices d'Asie. Ils partent pour des raisons économiques (épices, or, commerce), religieuses (propager la foi) et politiques (rivalités, prestige du roi) ; la caravelle, l'astrolabe et la boussole rendent possible la navigation en haute mer.",
      "Colomb atteint les Caraïbes en 1492 ; en 1494, le traité de Tordesillas partage le monde entre l'Espagne et le Portugal ; Vasco de Gama atteint l'Inde en 1498 et les Portugais installent des comptoirs ; l'expédition Magellan-Elcano fait le tour du monde (1519-1522). Mais les « Grandes Découvertes » sont un regard européen : des non-Européens, comme l'interprète Enrique, ont rendu ces voyages possibles.",
      "Les conquistadors soumettent les empires amérindiens : Cortés prend Tenochtitlan en 1521, avec des alliés indigènes ; Pizarro prend Cuzco en 1533. Les Espagnols fondent un empire colonial où ils imposent le travail forcé (encomienda) et l'évangélisation. Le choc microbien, la guerre, le travail forcé et la famine font s'effondrer la population : au centre du Mexique, elle passe d'environ 25 millions en 1518 à 1,1 million en 1605 (estimations discutées).",
      "La conquête fait débat en Europe : lors de la controverse de Valladolid (1550-1551), Las Casas défend la liberté des Amérindiens contre Sepúlveda, mais la colonisation n'est pas remise en cause. En Amérique naissent des sociétés métisses, comme à Cholula, dans le cadre de la domination espagnole.",
      "Une nouvelle économie-monde se met en place : l'argent de Potosí (découvert en 1545), extrait par les Indiens soumis à la mita, arrive à Séville puis circule jusqu'en Asie ; le sucre du Brésil est produit dans des plantations par des esclaves africains, déportés par la traite atlantique (environ 277 500 au XVIᵉ siècle)."
    ],
    periodes: [
      { de: 1518, a: 1605, nom: "Effondrement de la population du centre du Mexique (de 25,2 à 1,1 millions d'habitants)", court: "Effondrement démographique" },
      { de: 1519, a: 1533, nom: "Conquête des empires aztèque et inca", court: "Conquêtes" },
      { de: 1570, a: 1600, nom: "Essor du sucre brésilien et de la traite atlantique", court: "Sucre et traite" }
    ],
    reperes: [
      { a: 1453, date: "1453", txt: "Prise de Constantinople par les Ottomans." },
      { a: 1492, date: "1492", txt: "Christophe Colomb atteint les Caraïbes (Guanahani, le 12 octobre)." },
      { a: 1494, date: "1494", txt: "Traité de Tordesillas : le monde est partagé entre l'Espagne et le Portugal." },
      { a: 1498, date: "1498", txt: "Vasco de Gama atteint l'Inde (Calicut) en contournant l'Afrique." },
      { a: 1519, b: 1522, date: "1519-1522", txt: "Expédition Magellan-Elcano : le premier tour du monde." },
      { a: 1521, date: "1521", txt: "Cortés prend Tenochtitlan : fin de l'empire aztèque." },
      { a: 1533, date: "1533", txt: "Pizarro prend Cuzco : fin de l'empire inca." },
      { a: 1545, date: "1545", txt: "Découverte de l'argent du Potosí." },
      { a: 1550, b: 1551, date: "1550-1551", txt: "Controverse de Valladolid entre Las Casas et Sepúlveda." },
      { a: 1605, date: "1605", txt: "Centre du Mexique : environ 1,1 million d'habitants, contre 25,2 millions en 1518 (estimations discutées)." }
    ],
    notions: [
      { mot: "« Nouveau Monde »", def: "Expression qui désigne l'Amérique du point de vue des Européens ; on l'écrit entre guillemets, car ce monde n'a rien de « nouveau » pour ses habitants." },
      { mot: "Conquistador", def: "Chef d'expédition militaire espagnol parti conquérir des territoires en Amérique, à la recherche de richesses et de gloire." },
      { mot: "Empire colonial", def: "Ensemble des territoires possédés et administrés par une puissance en dehors de son territoire d'origine." },
      { mot: "Colonisation", def: "Installation et domination durables sur un territoire conquis, au profit de la métropole." },
      { mot: "Évangélisation", def: "Diffusion du christianisme : action de convertir des populations à la foi chrétienne." },
      { mot: "Encomienda", def: "Système par lequel un colon espagnol (l'encomendero) reçoit des Indiens pour les faire travailler, en échange de leur évangélisation." },
      { mot: "Choc microbien", def: "Effondrement démographique provoqué par les maladies apportées par les Européens (variole, rougeole, grippe), contre lesquelles les Amérindiens n'ont aucune immunité." },
      { mot: "Métissage", def: "Mélange biologique (des familles) et culturel (des cultures) entre Européens, Amérindiens et Africains." },
      { mot: "Mita", def: "Travail forcé imposé par roulement aux Indiens des Andes, organisé à Potosí à partir de 1573." },
      { mot: "Comptoir", def: "Établissement commercial installé par des marchands européens sur une côte lointaine (Afrique, Asie), qui sert de base à leurs échanges." },
      { mot: "Traite atlantique", def: "Commerce de captifs africains, déportés de force par bateau vers les Amériques pour y être réduits en esclavage." },
      { mot: "Esclavage", def: "Condition d'une personne privée de liberté, qui appartient à un maître, peut être vendue et est forcée de travailler. Il existe avant la conquête, mais change d'échelle avec les plantations américaines." },
      { mot: "Plantation", def: "Grande exploitation agricole tropicale, spécialisée dans une culture d'exportation comme le sucre, fondée sur le travail d'esclaves." },
      { mot: "Économie-monde", def: "Espace d'échanges reliés entre eux et organisés autour de centres dominants (notion de l'historien Fernand Braudel)." },
      { mot: "Mondialisation", def: "Mise en relation durable des différentes parties du monde par des échanges ; au XVIᵉ siècle, l'Europe, l'Afrique, l'Amérique et l'Asie sont reliées : c'est une première mondialisation." }
    ],
    personnages: [
      { nom: "Henri le Navigateur", dates: "1394-1460", txt: [
        "Prince portugais, fils du roi Jean Iᵉʳ.",
        "Au XVᵉ siècle, il organise l'exploration des côtes de l'Afrique, au-delà des îles Canaries et du cap Bojador.",
        "Le chroniqueur Zurara lui prête cinq raisons : connaître ces terres, commercer, mesurer la force des musulmans, trouver un allié chrétien, propager la foi."
      ] },
      { nom: "Christophe Colomb", dates: "1451-1506", txt: [
        "Navigateur génois au service des souverains d'Espagne.",
        "Il veut atteindre les Indes en traversant l'Atlantique vers l'ouest.",
        "Le 12 octobre 1492, il débarque à Guanahani, aux Bahamas, et rencontre les Taïnos.",
        "Il meurt en 1506, persuadé d'avoir atteint l'Asie."
      ] },
      { nom: "Fernand de Magellan", dates: "vers 1480-1521", txt: [
        "Navigateur portugais passé au service de l'Espagne.",
        "En 1519, il quitte Séville avec cinq navires pour atteindre les Moluques par l'ouest.",
        "Il franchit le détroit qui porte aujourd'hui son nom et traverse le Pacifique.",
        "Il meurt aux Philippines, à Mactan, en 1521 ; Elcano ramène un seul navire en Espagne en 1522."
      ] },
      { nom: "Enrique", dates: "né vers 1493, mort après 1521", txt: [
        "Esclave du chef de l'expédition du premier tour du monde.",
        "Natif de Malacca selon le testament de son maître (de Sumatra selon Pigafetta), il parle le malais.",
        "Interprète indispensable aux Philippines en 1521, il est affranchi par le testament de son maître, mais on lui refuse cette liberté.",
        "Certains historiens pensent qu'il a pu être le premier à boucler un tour du monde, sans qu'on puisse le prouver."
      ] },
      { nom: "Hernán Cortés", dates: "1485-1547", txt: [
        "Conquistador espagnol, il débarque au Mexique en 1519 avec quelques centaines d'hommes.",
        "Il s'allie aux Tlaxcaltèques, ennemis des Aztèques.",
        "Dans une lettre à Charles Quint (1520), il décrit Tenochtitlan et raconte avoir fait jeter les idoles des temples.",
        "En 1521, il prend Tenochtitlan : le territoire conquis devient la Nouvelle-Espagne."
      ] },
      { nom: "Francisco Pizarro", dates: "vers 1475-1541", txt: [
        "Conquistador espagnol, il part à la conquête des Andes avec environ 180 hommes.",
        "Il profite d'une guerre de succession entre deux prétendants rivaux, Huáscar et Atahualpa.",
        "Il capture puis fait exécuter Atahualpa et prend Cuzco en 1533."
      ] },
      { nom: "Bartolomé de Las Casas", dates: "1484-1566", txt: [
        "Ancien colon qui faisait travailler des Indiens (encomendero), il devient religieux dominicain.",
        "Évêque du Chiapas, il dénonce les violences des conquistadors.",
        "En 1550-1551, à Valladolid, il défend la liberté des Amérindiens contre Sepúlveda.",
        "En 1552, il publie la Très brève relation de la destruction des Indes."
      ] }
    ],
    lieux: [
      { nom: "Constantinople", lon: 28.98, lat: 41.01, txt: "Capitale de l'Empire byzantin, prise par les Ottomans de Mehmet II le 29 mai 1453." },
      { nom: "Guanahani", lon: -74.5, lat: 24.05, txt: "Île des Bahamas (sans doute l'actuelle San Salvador) où Christophe Colomb débarque le 12 octobre 1492." },
      { nom: "Tordesillas", lon: -5, lat: 41.5, txt: "Ville de Castille où l'Espagne et le Portugal signent en 1494 le traité qui partage le monde, à 370 lieues à l'ouest des îles du Cap-Vert." },
      { nom: "Calicut", lon: 75.78, lat: 11.25, txt: "Port de la côte ouest de l'Inde, atteint par Vasco de Gama en 1498." },
      { nom: "Tenochtitlan (Mexico)", lon: -99.13, lat: 19.43, txt: "Capitale aztèque bâtie sur une lagune, « aussi grande que Séville ou Cordoue » selon Cortés ; prise en 1521, elle devient Mexico." },
      { nom: "Cuzco", lon: -71.97, lat: -13.53, txt: "Capitale de l'empire inca, dans les Andes, prise par Pizarro en 1533." },
      { nom: "Cholula", lon: -98.3, lat: 19.06, txt: "Ville de Nouvelle-Espagne : sa carte de 1581, peinte par un artiste nahua, réunit le couvent franciscain et la grande pyramide." },
      { nom: "Valladolid", lon: -4.72, lat: 41.65, txt: "Ville de Castille où se tient, en 1550-1551, la controverse entre Las Casas et Sepúlveda, convoquée par Charles Quint." },
      { nom: "Potosí", lon: -65.75, lat: -19.59, txt: "Ville minière des Andes (actuelle Bolivie), née vers 4 000 m d'altitude après la découverte de l'argent en 1545." },
      { nom: "Séville", lon: -5.98, lat: 37.39, txt: "Seul port autorisé à commercer avec l'Amérique : la Casa de Contratación y contrôle l'arrivée de l'argent." }
    ],
    trous: [
      { titre: "Des voyages européens à déconstruire", texte: "Après la prise de [Constantinople] par les Ottomans en 1453, les Européens cherchent une route maritime vers les [épices] d'Asie. Ils partent pour commercer, pour propager la [foi] chrétienne et pour mieux connaître le monde. La [caravelle], l'[astrolabe] et la [boussole] permettent de naviguer en haute mer. Mais le récit des « Grandes Découvertes » est un regard européen : l'interprète malais [Enrique] a rendu possible l'expédition de [Magellan]." },
      { titre: "Explorer, conquérir, coloniser", texte: "En 1521, [Cortés] prend Tenochtitlan avec l'aide d'alliés indigènes. Les Amérindiens subissent un effondrement démographique, causé par le [choc microbien], mais aussi par la guerre et le [travail forcé] ; ils sont soumis à l'[évangélisation]. En 1550-1551, lors de la controverse de [Valladolid], [Las Casas] défend les Indiens contre [Sepúlveda], mais la colonisation continue. Des sociétés métisses naissent, comme à [Cholula]." },
      { titre: "Une nouvelle économie-monde", texte: "À partir de [1545], l'argent de [Potosí] est extrait par les Indiens soumis à la [mita]. Il gagne [Séville] en convoi, puis circule jusqu'en [Asie]. Au Brésil, le [sucre] est produit dans des [plantations] par des esclaves africains : la [traite] atlantique en déporte environ 277 500 au XVIᵉ siècle." }
    ],
    capable: [
      "Placer sur une frise les repères du chapitre (1453, 1492, 1494, 1498, 1519-1522, 1521, 1533, 1545, 1550-1551).",
      "Expliquer les raisons économiques, religieuses et politiques des voyages, et les moyens techniques qui les rendent possibles.",
      "Expliquer pourquoi on écrit « Grandes Découvertes » et « Nouveau Monde » entre guillemets, avec l'exemple d'Enrique.",
      "Expliquer comment les Européens passent de l'exploration à la conquête et à la colonisation (Cortés, Pizarro, encomienda, évangélisation).",
      "Expliquer les causes de l'effondrement des populations amérindiennes (choc microbien, guerre, travail forcé).",
      "Expliquer pourquoi la controverse de Valladolid est un débat important mais limité.",
      "Repérer des signes de métissage dans un document (la carte de Cholula, 1581).",
      "Décrire le circuit de l'argent, de Potosí à Séville et jusqu'en Asie.",
      "Expliquer le lien entre plantations sucrières, traite atlantique et esclavage.",
      "Construire un paragraphe argumenté : un argument, une explication, un exemple précis (un lieu et une date)."
    ],

    /* Les trois points de passage, repris des fiches élève Canva :
       « 2de · II-B PPO Las Casas et la controverse de Valladolid », « 2de · III-A PPO L'or et l'argent, des Amériques à l'Europe »,
       « 2de · III-B PPO L'économie sucrière et l'esclavage », et du « Bilan du chapitre et corrigés (Thème 2, ch. 1) ». */
    ppo: [
      {
        id: "valladolid", court: "PPO Valladolid",
        titre: "Bartolomé de Las Casas et la controverse de Valladolid",
        question: "A-t-on le droit de soumettre les Amérindiens ? Le débat de Valladolid (1550-1551) remet-il en cause la colonisation ?",
        branches: [
          { titre: "Une conquête qui fait débat", points: [
            "1511 : à Hispaniola, le dominicain Montesinos dénonce dans un sermon la violence des colons.",
            "Les lois de Burgos (1512) fixent les premières règles sur le travail des Indiens ; en 1537, le pape Paul III affirme qu'ils sont des hommes libres, capables de recevoir la foi.",
            "1542 : les Leyes Nuevas (« lois nouvelles ») interdisent de réduire les Indiens en esclavage."
          ] },
          { titre: "Sepúlveda : une guerre juste", points: [
            "Les Indiens commettent de graves délits : idolâtrie, sacrifices humains.",
            "Ils seraient « serviles et barbares » par nature, « esclaves par nature » selon Aristote, et devraient donc servir les Espagnols.",
            "Les soumettre faciliterait leur conversion ; la guerre protégerait aussi les victimes des sacrifices."
          ] },
          { titre: "Las Casas : convertir par la douceur", points: [
            "Ancien encomendero devenu dominicain puis évêque du Chiapas, il a vu les violences de la conquête.",
            "Les Indiens ont des sociétés organisées et la raison : ils sont capables de toute science.",
            "Ils sont libres : il faut les convertir par la douceur, pas par la guerre.",
            "Il accuse les colons d'avoir inspiré Sepúlveda pour justifier leurs vols et leurs crimes."
          ] },
          { titre: "Un débat important mais limité", points: [
            "Convoqué par Charles Quint devant des théologiens, il n'aboutit à aucune décision nette.",
            "Il a lieu en Europe, après la conquête : la colonisation et l'évangélisation continuent.",
            "L'esclavage des Africains n'est pas remis en cause.",
            "Les gravures de Théodore de Bry (1598) diffusent dans l'Europe protestante la « légende noire » de l'Espagne catholique."
          ] }
        ],
        reperes: [
          { a: 1511, date: "1511", txt: "Sermon du dominicain Montesinos contre les colons d'Hispaniola." },
          { a: 1512, date: "1512", txt: "Lois de Burgos : premières règles sur le travail des Indiens." },
          { a: 1537, date: "1537", txt: "Le pape Paul III affirme que les Indiens sont des hommes libres, capables de recevoir la foi." },
          { a: 1542, date: "1542", txt: "Leyes Nuevas : interdiction de réduire les Indiens en esclavage." },
          { a: 1550, b: 1551, date: "1550-1551", txt: "Controverse de Valladolid, convoquée par Charles Quint." },
          { a: 1552, date: "1552", txt: "Las Casas publie la Très brève relation de la destruction des Indes." },
          { a: 1598, date: "1598", txt: "À Francfort, Théodore de Bry publie des gravures illustrant le livre de Las Casas." }
        ],
        notions: [
          { mot: "Controverse", def: "Débat organisé entre deux positions opposées." },
          { mot: "Encomendero", def: "Colon qui reçoit des Indiens pour les faire travailler, en échange de leur évangélisation (c'est l'encomienda)." },
          { mot: "Idolâtrie", def: "Culte rendu à des idoles." },
          { mot: "Évangélisation", def: "Action de convertir des populations au christianisme." },
          { mot: "« Esclave par nature »", def: "Idée du philosophe grec Aristote, reprise par Sepúlveda : certains hommes seraient faits pour obéir et servir." },
          { mot: "Guerre juste", def: "Guerre jugée légitime par les théologiens ; pour Sepúlveda, la conquête de l'Amérique en est une." },
          { mot: "Dominicain", def: "Religieux de l'ordre des frères prêcheurs ; Montesinos, Las Casas et Domingo de Soto sont dominicains." },
          { mot: "« Légende noire »", def: "Image d'une Espagne catholique cruelle, diffusée en Europe, notamment par les protestants, à partir des récits de Las Casas." }
        ],
        personnages: [
          { nom: "Bartolomé de Las Casas", dates: "1484-1566", txt: [
            "Ancien colon qui faisait travailler des Indiens, il devient religieux dominicain.",
            "Évêque du Chiapas, il dénonce les violences commises contre les Amérindiens.",
            "À Valladolid, il affirme que les Indiens ont la raison et doivent être convertis par la douceur.",
            "En 1552, il publie la Très brève relation de la destruction des Indes."
          ] },
          { nom: "Juan Ginés de Sepúlveda", dates: "vers 1490-1573", txt: [
            "Humaniste et théologien espagnol, traducteur d'Aristote.",
            "Chroniqueur de l'empereur, il écrit un traité pour justifier la guerre contre les Indiens.",
            "Pour lui, les Indiens sont « serviles et barbares » par nature et doivent servir les Espagnols.",
            "À Valladolid, en 1550-1551, il affronte le grand défenseur des Indiens."
          ] },
          { nom: "Charles Quint", dates: "1500-1558", txt: [
            "Petit-fils des Rois catholiques, il devient roi d'Espagne en 1516.",
            "Élu empereur en 1519, il règne sur un immense empire, en Europe et en Amérique.",
            "Destinataire des lettres de Cortés, il convoque en 1550 un débat sur la légitimité de la conquête."
          ] },
          { nom: "Domingo de Soto", dates: "1494-1560", txt: [
            "Théologien dominicain, professeur à l'université de Salamanque.",
            "Ancien confesseur de l'empereur, il siège parmi les juges de Valladolid.",
            "Il rédige pour l'empereur un résumé des arguments des deux adversaires, publié en 1552."
          ] }
        ],
        lieux: [
          { nom: "Valladolid", lon: -4.72, lat: 41.65, txt: "Ville de Castille où se tient la controverse, en 1550-1551." },
          { nom: "Saint-Domingue", lon: -69.89, lat: 18.47, txt: "Ville de l'île d'Hispaniola où le dominicain Montesinos prêche contre les colons en 1511." },
          { nom: "Chiapas", txt: "Région du sud de la Nouvelle-Espagne dont Las Casas est l'évêque." },
          { nom: "Francfort", lon: 8.68, lat: 50.11, txt: "Ville d'Allemagne où le graveur protestant Théodore de Bry publie en 1598 des gravures illustrant le livre de Las Casas." }
        ],
        documents: [
          { titre: "Les quatre raisons de Sepúlveda", source: "Résumé des arguments de Juan Ginés de Sepúlveda par le théologien Domingo de Soto, pour Charles Quint, 1551, publié par Las Casas en 1552 (d'après La controverse entre Las Casas et Sepúlveda, Vrin, 2007).",
            extrait: "« Monsieur le docteur Sepúlveda a donc brièvement fondé son avis sur quatre raisons. La première est la gravité des délits de ces gens, principalement l'idolâtrie et leurs autres péchés contre nature. La seconde est la grossièreté de leur entendement : du fait de leur nature, ils sont serviles et barbares, et donc obligés de servir ceux qui ont l'entendement plus subtil, comme le sont les Espagnols. La troisième est la fin de la foi, car cette soumission est plus commode et opportune pour la prédication et la persuasion. La quatrième est l'injure qu'ils se font entre eux, en tuant des hommes pour les sacrifier et certains pour les manger. »",
            montre: "Des raisons religieuses, « naturelles » et morales pour déclarer la conquête juste : les Indiens seraient inférieurs par nature." },
          { titre: "La réponse de Las Casas", source: "Bartolomé de Las Casas, dominicain, ancien encomendero devenu évêque du Chiapas, réponse à Sepúlveda, 1551, publiée en 1552 (même édition, extraits adaptés).",
            extrait: "« Les Indiens ont d'aussi bons entendements, des esprits aussi perspicaces, aussi capables et dociles pour n'importe quelle science morale et doctrine spéculative […]. Et je ne parle pas de leurs admirables progrès dans les arts mécaniques et les arts libéraux, comme la lecture et l'écriture, la pratique de tous les instruments de musique, la grammaire, la logique […]. Le docteur Sepúlveda aurait dû s'informer auprès des serviteurs de Dieu qui ont sué beaucoup de nuits et de jours pour la conversion de ces gens, et ne pas donner crédit aux hommes tyranniques qui l'ont persuadé d'écrire son traité pour justifier les brigandages, les vols et les morts qu'ils ont commis […]. »",
            montre: "Las Casas défend l'égale dignité des Indiens et accuse les colons d'avoir inspiré Sepúlveda ; il ne conteste pas leur conversion." }
        ],
        pieges: [
          "Le débat n'oppose pas partisans et adversaires de la colonisation : Las Casas veut convertir les Indiens par la douceur, mais ne remet en cause ni la domination espagnole ni l'évangélisation.",
          "Valladolid n'aboutit à aucune décision nette : ne pas écrire que Las Casas « gagne » et que les Indiens sont libérés. L'interdiction de les réduire en esclavage date des Leyes Nuevas de 1542, avant le débat.",
          "La gravure de Théodore de Bry (1598) n'est pas un témoignage direct : publiée à Francfort par un protestant, 46 ans après le livre de Las Casas, elle nourrit la « légende noire » de l'Espagne catholique."
        ],
        mots: ["Charles Quint", "Sepúlveda", "Las Casas", "esclaves par nature", "guerre juste", "évangélisation", "encomienda", "aucune décision", "la colonisation continue", "Africains"],
        reponse: "En 1550-1551, Charles Quint réunit à Valladolid des théologiens pour savoir si la guerre contre les Indiens est juste. Sepúlveda affirme que oui : les Indiens commettent de graves délits, comme l'idolâtrie et les sacrifices humains, et seraient « serviles et barbares » par nature, « esclaves par nature » selon Aristote ; les soumettre faciliterait leur conversion. Le dominicain Las Casas, ancien encomendero, lui répond que les Indiens ont des sociétés organisées et la raison : ils sont libres et doivent être convertis par la douceur, non par la guerre. Ce débat est important, car il montre que la conquête est contestée en Europe même. Mais il est limité : il a lieu après la conquête, n'aboutit à aucune décision nette et ne remet en cause ni la colonisation ni l'évangélisation, qui continuent. L'esclavage des Africains, lui, n'est même pas discuté.",
        trous: [
          { titre: "Le bilan", texte: "En [1550-1551], [Charles Quint] réunit à [Valladolid] des théologiens. [Sepúlveda] juge la guerre juste : les Indiens seraient « esclaves par nature ». Le dominicain [Las Casas] répond qu'ils ont la raison et doivent être convertis par la [douceur]. Le débat n'aboutit à aucune décision : la [colonisation] continue, et l'esclavage des [Africains] n'est pas remis en cause." }
        ],
        capable: [
          "Présenter les positions de Sepúlveda et de Las Casas, avec leurs arguments.",
          "Citer une expression de chaque document qui montre leur vision des Amérindiens.",
          "Situer la controverse dans une suite de repères (1511, 1537, 1542, 1550-1551, 1552).",
          "Expliquer pourquoi la controverse est un débat important mais limité.",
          "Critiquer une image : la gravure de De Bry n'est pas un témoignage direct.",
          "Défendre un point de vue à l'oral en raisonnant comme un acteur du XVIᵉ siècle."
        ]
      },
      {
        id: "argent", court: "PPO Or et argent",
        titre: "L'or et l'argent, des Amériques à l'Europe",
        question: "Comment l'argent américain relie-t-il les continents au XVIᵉ siècle ?",
        branches: [
          { titre: "Extraire : Potosí", points: [
            "1545 : l'argent est découvert dans la montagne de Potosí, dans les Andes ; une ville naît à 4 000 m d'altitude pour l'exploiter. En 1546, on découvre aussi l'argent de Zacatecas, en Nouvelle-Espagne.",
            "Les Indiens sont contraints au travail ; à partir de 1573, la mita leur impose un travail forcé par roulement.",
            "Dès 1550, le dominicain Domingo de Santo Tomás parle d'une « bouche de l'enfer » : la cupidité des Espagnols sacrifie les Indiens."
          ] },
          { titre: "Transporter et contrôler", points: [
            "L'argent du Pérou franchit l'isthme de Panama ; celui de la Nouvelle-Espagne part de Veracruz.",
            "Les flottes traversent l'Atlantique en convoi, escortées contre les pirates et les corsaires.",
            "À Séville, seul port autorisé, la Casa de Contratación contrôle les arrivées ; le roi prélève le quint, soit 20 % de l'argent."
          ] },
          { titre: "Un afflux massif", points: [
            "Arrivées officielles d'argent à Séville : 86 tonnes dans les années 1530, 2 708 tonnes dans les années 1590 ; l'or ne dépasse jamais 43 tonnes par décennie.",
            "Le tournant se produit après 1560 : Potosí est en plein essor, puis la mita fournit la main-d'œuvre.",
            "L'afflux de métal contribue à une hausse générale des prix en Europe : la « révolution des prix »."
          ] },
          { titre: "Une première mondialisation", points: [
            "L'argent paie les guerres du roi d'Espagne et ses dettes auprès des banquiers de Gênes et d'Anvers.",
            "Il sert à acheter en Inde et en Chine les épices, la soie et la porcelaine.",
            "À partir de 1571, le galion de Manille relie chaque année Acapulco aux Philippines : le circuit fait le tour de la Terre."
          ] }
        ],
        reperes: [
          { a: 1503, date: "1503", txt: "Création à Séville de la Casa de Contratación, qui contrôle le commerce avec l'Amérique." },
          { a: 1545, date: "1545", txt: "Découverte de l'argent de Potosí." },
          { a: 1546, date: "1546", txt: "Découverte de l'argent de Zacatecas, en Nouvelle-Espagne." },
          { a: "1550-07-01", date: "1er juillet 1550", txt: "Le dominicain Domingo de Santo Tomás dénonce Potosí, « bouche de l'enfer »." },
          { a: 1571, date: "1571", txt: "Fondation de Manille : le galion relie désormais Acapulco aux Philippines." },
          { a: 1573, date: "1573", txt: "La mita, travail forcé par roulement, est organisée à Potosí." },
          { a: 1591, b: 1600, date: "1591-1600", txt: "Record des arrivées officielles d'argent à Séville : 2 708 tonnes en dix ans." }
        ],
        notions: [
          { mot: "Mita", def: "Travail forcé imposé par roulement aux Indiens des Andes, organisé à Potosí à partir de 1573." },
          { mot: "Flotte", def: "Convoi de navires escortés qui rapporte chaque année l'argent américain à Séville." },
          { mot: "Quint", def: "Impôt royal d'un cinquième (20 %) prélevé sur les métaux précieux arrivés d'Amérique." },
          { mot: "Casa de Contratación", def: "« Maison du commerce » de Séville, qui contrôle la navigation et le commerce avec l'Amérique." },
          { mot: "Galion de Manille", def: "Navire qui relie chaque année Acapulco, en Nouvelle-Espagne, à Manille, aux Philippines, à partir de 1571." },
          { mot: "Révolution des prix", def: "Hausse générale des prix en Europe au XVIᵉ siècle, à laquelle contribue l'afflux d'argent américain." },
          { mot: "Économie-monde", def: "Espace d'échanges reliés entre eux et organisés autour de centres dominants." },
          { mot: "Mondialisation", def: "Mise en relation durable des différentes parties du monde par des échanges." }
        ],
        personnages: [
          { nom: "Domingo de Santo Tomás", dates: "1499-1570", txt: [
            "Religieux dominicain espagnol installé au Pérou.",
            "Il apprend le quechua et en publie la première grammaire, en 1560.",
            "Le 1er juillet 1550, il écrit au Conseil des Indes que l'on a découvert une « bouche de l'enfer » où meurent les Indiens."
          ] },
          { nom: "Pedro Cieza de León", dates: "vers 1520-1554", txt: [
            "Soldat espagnol parti très jeune en Amérique.",
            "Il parcourt les Andes et en décrit les peuples, les routes et les villes.",
            "Sa Chronique du Pérou, publiée à Séville en 1553, montre en gravure la montagne d'argent de Potosí."
          ] }
        ],
        lieux: [
          { nom: "Potosí", lon: -65.75, lat: -19.59, txt: "Montagne d'argent des Andes (vice-royauté du Pérou, actuelle Bolivie), exploitée à partir de 1545." },
          { nom: "Zacatecas", lon: -102.58, lat: 22.77, txt: "Grande mine d'argent de la Nouvelle-Espagne (Mexique), découverte en 1546." },
          { nom: "Panama", lon: -79.49, lat: 9.01, txt: "Ville de l'isthme où l'argent du Pérou, venu par le Pacifique, est débarqué puis transporté jusqu'aux ports de l'Atlantique (Nombre de Dios, puis Portobelo à partir de 1597)." },
          { nom: "Séville", lon: -5.98, lat: 37.39, txt: "Seul port autorisé à commercer avec l'Amérique ; la Casa de Contratación y contrôle l'arrivée des flottes." },
          { nom: "Manille", lon: 120.98, lat: 14.6, txt: "Port des Philippines, fondé par les Espagnols en 1571 : l'argent américain y est échangé contre la soie et la porcelaine de Chine." }
        ],
        documents: [
          { titre: "Une « bouche de l'enfer »", source: "Lettre du dominicain Domingo de Santo Tomás au Conseil des Indes, 1er juillet 1550 (traduction adaptée).",
            extrait: "« Il y a quatre ans, pour achever de perdre cette terre, on a découvert une bouche de l'enfer par laquelle entre chaque année une grande quantité de gens, que la cupidité des Espagnols sacrifie à son dieu : c'est une mine d'argent qu'on appelle Potosí. »",
            montre: "Les victimes de la mine sont les Indiens contraints au travail : l'argent devient une idole à laquelle la cupidité sacrifie des vies." },
          { titre: "L'argent arrive à Séville", source: "D'après Earl J. Hamilton, American Treasure and the Price Revolution in Spain, 1934 (arrivées officielles).",
            extrait: "Argent arrivé à Séville, en tonnes, par décennie : 86 (années 1530), 178 (1540), 303 (1550), 943 (1560), 1 119 (1570), 2 103 (1580), 2 708 (1590). L'or ne dépasse jamais 43 t par décennie.",
            montre: "Un afflux qui explose après 1560 : l'argent, bien plus que l'or, fait la richesse américaine de l'Espagne." }
        ],
        pieges: [
          "Le PPO s'appelle « l'or et l'argent », mais c'est surtout l'argent qui compte : l'or ne dépasse jamais 43 tonnes par décennie, contre 2 708 tonnes d'argent dans les années 1590.",
          "L'argent ne reste pas en Espagne : il paie les guerres et les banquiers de Gênes et d'Anvers, et une partie finit en Asie (Inde, Chine).",
          "Potosí n'est pas au Mexique : elle se trouve dans les Andes, dans la vice-royauté du Pérou (actuelle Bolivie). La grande mine de la Nouvelle-Espagne, c'est Zacatecas."
        ],
        mots: ["Potosí", "mita", "isthme de Panama", "flottes", "Séville", "quint", "Gênes", "Chine", "galion de Manille", "mondialisation"],
        reponse: "Au XVIᵉ siècle, l'argent américain relie quatre continents. Il est extrait à Potosí, montagne d'argent découverte en 1545 dans les Andes, et à Zacatecas, au Mexique, par des Indiens contraints au travail : à partir de 1573, la mita leur impose un travail forcé par roulement, et un dominicain parle dès 1550 d'une « bouche de l'enfer ». L'argent du Pérou franchit l'isthme de Panama, celui du Mexique part de Veracruz, puis les flottes traversent l'Atlantique en convoi jusqu'à Séville, où le roi prélève le quint. Les arrivées passent de 86 tonnes dans les années 1530 à 2 708 dans les années 1590. Cet argent paie les guerres et les banquiers de Gênes et d'Anvers, puis sert à acheter en Asie épices, soie et porcelaine ; à partir de 1571, le galion de Manille le transporte aussi par le Pacifique. C'est une première mondialisation, fondée sur l'exploitation des Amérindiens.",
        trous: [
          { titre: "Le bilan", texte: "L'argent est découvert à [Potosí] en [1545]. Les Indiens y travaillent de force, par roulement : c'est la [mita]. L'argent traverse l'Atlantique en [flottes] escortées jusqu'à [Séville], où le roi prélève le [quint]. Il paie les banquiers de [Gênes] et d'Anvers, puis sert à acheter la soie de [Chine] : c'est une première [mondialisation]." }
        ],
        schema: { titre: "Le circuit de l'argent (XVIᵉ siècle)", cases: [
          { titre: "Extraire", aide: "les mines et ceux qui y travaillent", etiquettes: ["Potosí (Pérou)", "Zacatecas (Nouvelle-Espagne)", "les Indiens soumis à la mita"] },
          { titre: "Rassembler et traverser", aide: "les ports et la traversée", etiquettes: ["l'isthme de Panama", "le port de Veracruz", "les flottes en convoi contre les pirates"] },
          { titre: "Contrôler", aide: "l'arrivée en Espagne", etiquettes: ["Séville, seul port autorisé", "la Casa de Contratación", "le quint : 20 % pour le roi"] },
          { titre: "Dépenser et échanger", aide: "où va l'argent ensuite", etiquettes: ["les guerres du roi d'Espagne", "les banquiers de Gênes et d'Anvers", "les épices, la soie et la porcelaine d'Inde et de Chine", "le galion de Manille (1571)"] }
        ] },
        capable: [
          "Situer Potosí, l'isthme de Panama, Séville et Manille sur une carte.",
          "Décrire les étapes du circuit de l'argent : extraire, rassembler, traverser, contrôler, dépenser, échanger.",
          "Lire un graphique et dire quand se produit le tournant (après 1560).",
          "Expliquer qui travaille à la mine et dans quelles conditions (la mita).",
          "Expliquer en quoi le circuit de l'argent est une première mondialisation."
        ]
      },
      {
        id: "sucre", court: "PPO Sucre et esclavage",
        titre: "Le développement de l'économie « sucrière » et de l'esclavage dans les îles portugaises et au Brésil",
        question: "Pourquoi le sucre des Amériques entraîne-t-il la traite des Africains ?",
        branches: [
          { titre: "Des îles portugaises au Brésil", points: [
            "Les Portugais cultivent d'abord la canne à sucre dans l'île de Madère, puis à São Tomé, dans le golfe de Guinée, tout près des côtes africaines, où les esclaves se révoltent souvent.",
            "À partir du milieu du XVIᵉ siècle, la canne gagne le Brésil, au climat très favorable ; la production prend son essor après 1570.",
            "Aux Antilles (Hispaniola), les Espagnols multiplient aussi les sucreries une fois les mines épuisées."
          ] },
          { titre: "La plantation et son moulin", points: [
            "La plantation s'organise autour du moulin, l'engenho, qui presse la canne ; le jus est cuit dans des chaudières, puis transformé en pains de sucre.",
            "Autour du moulin : la maison du maître (senhor de engenho), une chapelle et les cases des esclaves.",
            "Pour le jésuite Antonil, les esclaves sont « les mains et les pieds » du maître du moulin : sans eux, pas de plantation."
          ] },
          { titre: "Pourquoi des Africains ?", points: [
            "Aux Antilles, les Amérindiens disparaissent : les Espagnols font venir des « Noirs de Guinée », d'abord pour les mines, puis pour les sucreries.",
            "Les plantations exigent toujours plus de main-d'œuvre.",
            "Des marchands africains vendent des captifs aux Européens contre des produits manufacturés (tissus, armes, métaux)."
          ] },
          { titre: "Un système atlantique", points: [
            "Environ 277 500 Africains sont embarqués vers les Amériques au XVIᵉ siècle ; le tournant se produit après 1575 (152 000 en 1576-1600, plus de 350 000 en 1601-1625).",
            "Le sucre traverse l'Atlantique vers Lisbonne et Anvers, où on le raffine et le consomme.",
            "Une économie atlantique à trois continents se met en place, fondée sur l'esclavage."
          ] }
        ],
        reperes: [
          { a: 1500, date: "1500", txt: "Cabral atteint le Brésil, qui revient au Portugal d'après le traité de Tordesillas." },
          { a: 1501, b: 1600, date: "1501-1600", txt: "Environ 277 500 Africains sont embarqués vers les Amériques." },
          { a: 1565, date: "1565", txt: "Benzoni décrit les sucreries d'Hispaniola, où travaillent des esclaves africains." },
          { a: 1570, date: "1570", txt: "La production de sucre brésilien prend son essor." },
          { a: 1576, b: 1600, date: "1576-1600", txt: "Tournant de la traite : environ 152 000 Africains embarqués, deux fois et demie plus qu'en 1551-1575." },
          { a: 1652, date: "1652", txt: "Frans Post peint un paysage du Brésil hollandais, avec une plantation et son moulin." }
        ],
        notions: [
          { mot: "Plantation", def: "Grande exploitation agricole tropicale, spécialisée dans une culture d'exportation comme le sucre, fondée sur le travail d'esclaves." },
          { mot: "Engenho", def: "Moulin à sucre et, par extension, la plantation qui l'entoure." },
          { mot: "Senhor de engenho", def: "Maître du moulin : le propriétaire de la plantation." },
          { mot: "Sucrerie", def: "Atelier où l'on transforme la canne en sucre ; par extension, la plantation de canne." },
          { mot: "Traite", def: "Commerce des captifs africains réduits en esclavage." },
          { mot: "Esclave", def: "Personne privée de liberté, qui appartient à un maître, peut être vendue et est forcée de travailler." },
          { mot: "Économie-monde", def: "Espace d'échanges reliés entre eux et organisés autour de centres dominants." }
        ],
        personnages: [
          { nom: "André João Antonil", dates: "1649-1716", txt: [
            "Jésuite d'origine italienne, installé à Bahia, au Brésil.",
            "Il décrit l'économie de la colonie : sucre, tabac, mines d'or.",
            "Dans Culture et opulence du Brésil (1711), il écrit que les esclaves sont « les mains et les pieds » du maître du moulin."
          ] },
          { nom: "Girolamo Benzoni", dates: "vers 1519 - après 1572", txt: [
            "Marchand milanais, il vit aux Amériques de 1541 à 1556.",
            "Il publie à Venise, en 1565, une Histoire du Nouveau Monde.",
            "Il raconte qu'à Hispaniola les Espagnols ont remplacé les Amérindiens disparus par des esclaves africains."
          ] },
          { nom: "Frans Post", dates: "1612-1680", txt: [
            "Peintre néerlandais.",
            "Il séjourne au Brésil hollandais au XVIIᵉ siècle.",
            "Ses paysages, peints pour des acheteurs hollandais, montrent des plantations et leurs moulins, mais peu la violence de l'esclavage."
          ] }
        ],
        lieux: [
          { nom: "Madère (Funchal)", lon: -16.91, lat: 32.65, txt: "Île portugaise de l'Atlantique où la canne à sucre est d'abord cultivée." },
          { nom: "São Tomé", lon: 6.73, lat: 0.34, txt: "Île portugaise du golfe de Guinée, tout près de l'Afrique : la culture du sucre y est transférée, mais les esclaves s'y révoltent souvent." },
          { nom: "Bahia (Salvador)", lon: -38.51, lat: -12.97, txt: "Capitale du Brésil portugais, au cœur d'une grande région sucrière." },
          { nom: "Hispaniola (Saint-Domingue)", lon: -69.89, lat: 18.47, txt: "Île des Antilles où les Espagnols remplacent les Amérindiens disparus par des esclaves africains, dans les mines puis les sucreries." },
          { nom: "Lisbonne", lon: -9.14, lat: 38.72, txt: "Capitale du Portugal, où arrive le sucre du Brésil avant d'être revendu en Europe du Nord." }
        ],
        documents: [
          { titre: "« Les mains et les pieds » du maître", source: "A. J. Antonil, jésuite installé à Bahia, Culture et opulence du Brésil, 1711 (traduction adaptée).",
            extrait: "« Les esclaves sont les mains et les pieds du maître du moulin, car sans eux il n'est pas possible au Brésil de créer, conserver et agrandir une plantation, ni d'avoir un moulin en activité. »",
            montre: "La plantation sucrière repose entièrement sur le travail des esclaves." },
          { titre: "Des mines aux sucreries", source: "Girolamo Benzoni, marchand milanais aux Amériques de 1541 à 1556, Histoire du Nouveau Monde, Venise, 1565 (traduction adaptée). L'île est Hispaniola (Saint-Domingue).",
            extrait: "« Quand les naturels de cette île commencèrent à disparaître, les Espagnols se pourvurent de Noirs de Guinée, et ils en ont amené un grand nombre. Quand il y avait des mines, ils les faisaient travailler à l'or et à l'argent ; mais depuis que les mines sont épuisées, ils ont multiplié les sucreries, où ces esclaves sont surtout employés, en plus de servir leurs maîtres en tout le reste. »",
            montre: "La disparition des Amérindiens pousse les Espagnols à faire venir des Africains, d'abord pour les mines, puis pour le sucre." },
          { titre: "Les captifs de la traite", source: "Estimations de la Trans-Atlantic Slave Trade Database (slavevoyages.org, université Emory).",
            extrait: "Africains embarqués vers les Amériques, en milliers, par période de 25 ans : 13 (1501-1525), 51 (1526-1550), 61 (1551-1575), 152 (1576-1600), 353 (1601-1625), 315 (1626-1650). Total 1501-1600 : environ 277 500 personnes.",
            montre: "La traite décolle après 1575, en même temps que le sucre brésilien." }
        ],
        pieges: [
          "Le tableau de Frans Post (1652), peint pour des acheteurs hollandais, donne une vision idyllique de la plantation : il montre peu la violence de l'esclavage.",
          "L'esclavage existe avant la conquête des Amériques (en Afrique, en Méditerranée, dans les îles portugaises) : ce qui change, c'est son ampleur et son lien avec la plantation.",
          "Les chiffres de la traite sont des estimations : retenir l'ordre de grandeur (environ 277 500 Africains au XVIᵉ siècle, 12,5 millions du XVᵉ au XIXᵉ siècle) et le tournant après 1575."
        ],
        mots: ["Madère", "São Tomé", "Brésil", "engenho", "canne à sucre", "esclaves", "traite", "Guinée", "Lisbonne", "trois continents"],
        reponse: "Le sucre est d'abord produit par les Portugais dans leurs îles de l'Atlantique, à Madère puis à São Tomé, près des côtes africaines. À partir du milieu du XVIᵉ siècle, la canne à sucre gagne le Brésil, où la production prend son essor après 1570. La plantation s'organise autour du moulin, l'engenho, et demande une main-d'œuvre nombreuse : pour le jésuite Antonil, les esclaves sont « les mains et les pieds » du maître du moulin. Aux Antilles, les Amérindiens disparaissent ; les Espagnols font donc venir des « Noirs de Guinée », d'abord pour les mines, puis pour les sucreries. Des marchands africains vendent des captifs aux Européens contre des tissus, des armes et des métaux. Environ 277 500 Africains sont déportés au XVIᵉ siècle, dont plus de la moitié après 1575. Le sucre repart vers Lisbonne et Anvers : une économie atlantique à trois continents se met en place, fondée sur l'esclavage.",
        trous: [
          { titre: "Le bilan", texte: "Les Portugais cultivent d'abord la canne à sucre à [Madère], puis à [São Tomé]. Au [Brésil], la production prend son essor après [1570]. La plantation s'organise autour du moulin, l'[engenho]. Des [esclaves] africains y travaillent : la [traite] en déporte environ 277 500 au XVIᵉ siècle. Le [sucre] repart vers Lisbonne et Anvers." }
        ],
        schema: { titre: "Le système atlantique du sucre (XVIᵉ siècle)", cases: [
          { titre: "Europe (Lisbonne, Anvers)", aide: "ce qu'on y fait, ce qui en part", etiquettes: ["on raffine et on consomme le sucre", "des produits manufacturés partent vers l'Afrique : tissus, armes, métaux"] },
          { titre: "Afrique (Guinée, Angola)", aide: "qui vend, qui part", etiquettes: ["des marchands africains vendent des captifs aux Européens", "les captifs sont embarqués pour traverser l'Atlantique"] },
          { titre: "Amériques (Brésil, Antilles)", aide: "ce qu'on y produit, et comment", etiquettes: ["les plantations de canne à sucre", "le moulin (engenho)", "les captifs sont vendus aux planteurs", "le sucre part vers l'Europe"] }
        ] },
        capable: [
          "Expliquer le déplacement du sucre de Madère à São Tomé, puis au Brésil.",
          "Décrire une plantation sucrière (engenho) et dire qui y travaille.",
          "Expliquer pourquoi les Européens font venir des Africains en Amérique.",
          "Lire un graphique de la traite : total au XVIᵉ siècle et tournant après 1575.",
          "Critiquer une image : ce que le tableau montre et ce qu'il cache.",
          "Compléter le schéma du système atlantique (Europe, Afrique, Amériques)."
        ]
      }
    ]
  },

  /* =====================================================================
     2nde — HISTOIRE — Thème 2, chapitre 4
     ===================================================================== */
  {
    id: "2de-h2-c4", n: "2nde", d: "histoire", carte: "europe",
    theme: "XVᵉ-XVIᵉ siècles : un nouveau rapport au monde, un temps de mutation intellectuelle",
    rituel: "XVe-XVIe siècles : nouveau rapport au monde",
    num: "Chapitre 4",
    titre: "Renaissance, Humanisme et réformes religieuses : les mutations de l'Europe",
    question: "Comment se renouvellent la pensée et l'art aux XVᵉ et XVIᵉ siècles et comment la pensée nouvelle favorise-t-elle les réformes religieuses ?",
    plan: [
      "Une révolution culturelle et artistique : l'Humanisme (Érasme), la Renaissance des arts (Michel-Ange), les sciences contre l'Église",
      "Les réformes et les conflits religieux : la Réforme protestante (Luther), la réaction catholique, les guerres de Religion"
    ],
    cle: "L'Humanisme et la Renaissance renouvellent la pensée et l'art en revenant à l'Antiquité et en plaçant l'être humain au centre ; l'esprit critique qu'ils développent favorise la Réforme protestante, qui divise durablement la chrétienté occidentale.",
    essentiel: [
      "En 1453, la prise de Constantinople par les Ottomans pousse des savants byzantins à fuir vers l'Italie avec des manuscrits antiques. Vers 1455, l'imprimerie à caractères mobiles de Gutenberg permet de diffuser les textes vite et en grand nombre : environ 210 millions de livres sont produits en Europe au XVIᵉ siècle.",
      "L'Humanisme place l'être humain, sa raison et sa dignité au centre de la réflexion, en dialogue avec les textes antiques ; il rejette le Moyen Âge, jugé « âge sombre ». Érasme, « prince des humanistes », retraduit le Nouveau Testament à partir du grec (1516) et critique le haut clergé dans l'Éloge de la Folie.",
      "Les artistes de la Renaissance s'inspirent de l'Antiquité, placent le corps humain au centre et utilisent la perspective linéaire et la peinture à l'huile. Financés par des mécènes (les Médicis à Florence, les papes à Rome), ils sont désormais reconnus comme des créateurs : de 1508 à 1512, Michel-Ange peint la voûte de la chapelle Sixtine pour le pape Jules II.",
      "Les sciences s'appuient sur l'observation et l'expérience : Vésale étudie le corps par la dissection, Copernic puis Galilée défendent l'héliocentrisme, contre l'enseignement de l'Église. En 1633, Galilée doit abjurer devant l'Inquisition.",
      "En 1517, le moine allemand Luther conteste la vente des indulgences dans ses 95 thèses. Excommunié, il fonde une Église où seule la foi permet le salut. Le calvinisme (Genève) et l'anglicanisme (1534) naissent ensuite : la chrétienté occidentale se divise en espaces confessionnels rivaux.",
      "L'Église catholique réagit : le concile de Trente (1545-1563) réaffirme ses dogmes, condamne les abus du clergé et crée des séminaires ; les jésuites, fondés en 1540, diffusent le catholicisme par l'enseignement et les missions.",
      "Les divisions religieuses débouchent sur des guerres : en France de 1562 à 1598 (massacre de la Saint-Barthélemy en 1572), jusqu'à l'édit de Nantes (1598) ; dans le Saint Empire, jusqu'à la paix d'Augsbourg (1555), puis pendant la guerre de Trente Ans (1618-1648)."
    ],
    periodes: [
      { de: 1400, a: 1600, nom: "Humanisme et Renaissance (XVᵉ-XVIᵉ siècles)", court: "Humanisme et Renaissance" },
      { de: 1545, a: 1563, nom: "Concile de Trente", court: "Trente" },
      { de: 1562, a: 1598, nom: "Guerres de Religion en France", court: "Guerres de Religion" },
      { de: 1618, a: 1648, nom: "Guerre de Trente Ans" }
    ],
    reperes: [
      { a: 1453, date: "1453", txt: "Les Ottomans prennent Constantinople : des savants byzantins fuient vers l'Italie avec des manuscrits antiques." },
      { a: 1455, date: "vers 1455", txt: "À Mayence, Gutenberg achève d'imprimer une Bible : l'imprimerie à caractères mobiles diffuse les idées nouvelles." },
      { a: 1508, b: 1512, date: "1508-1512", txt: "Michel-Ange peint la voûte de la chapelle Sixtine pour le pape Jules II." },
      { a: 1516, date: "1516", txt: "Érasme publie une nouvelle traduction du Nouveau Testament, faite à partir du grec." },
      { a: 1517, date: "1517", txt: "Les 95 thèses de Luther, à Wittenberg, contre la vente des indulgences." },
      { a: 1534, date: "1534", txt: "Acte de suprématie : Henri VIII rompt avec Rome, naissance de l'anglicanisme." },
      { a: 1543, date: "1543", txt: "Vésale publie son traité d'anatomie ; Copernic affirme que la Terre tourne autour du Soleil." },
      { a: 1545, b: 1563, date: "1545-1563", txt: "Le concile de Trente réaffirme les dogmes catholiques et réforme le clergé." },
      { a: 1555, date: "1555", txt: "Paix d'Augsbourg dans le Saint Empire : « tel prince, telle religion »." },
      { a: 1572, date: "1572", txt: "Massacre de la Saint-Barthélemy : plusieurs milliers de protestants tués à Paris puis en province." },
      { a: 1598, date: "1598", txt: "Édit de Nantes : Henri IV met fin aux guerres de Religion en France." },
      { a: 1633, date: "1633", txt: "Procès de Galilée : condamné par l'Inquisition, il doit abjurer l'héliocentrisme." }
    ],
    notions: [
      { mot: "Humanisme", def: "Courant de pensée qui place l'être humain, sa raison et sa dignité au centre de la réflexion, en dialogue avec les textes de l'Antiquité." },
      { mot: "Renaissance", def: "Mouvement de redécouverte des arts et des savoirs antiques aux XVᵉ-XVIᵉ siècles." },
      { mot: "Langue vernaculaire", def: "Langue parlée dans un pays (français, italien…), par opposition au latin, seule langue savante du Moyen Âge." },
      { mot: "Mécène", def: "Personne, souvent riche ou puissante, qui finance des artistes et leurs œuvres." },
      { mot: "Fresque", def: "Technique de peinture murale exécutée sur un enduit frais." },
      { mot: "Dissection", def: "Ouverture méthodique d'un corps (souvent de condamnés à mort à cette époque) pour en étudier l'anatomie." },
      { mot: "Héliocentrisme", def: "Théorie selon laquelle le Soleil, et non la Terre, est au centre du système solaire. Elle s'oppose au géocentrisme enseigné par l'Église." },
      { mot: "Chrétienté", def: "Ensemble des territoires et des populations de religion chrétienne." },
      { mot: "Indulgence", def: "Document vendu par l'Église, censé réduire le temps qu'une âme doit passer au purgatoire." },
      { mot: "La Réforme", def: "Mouvement religieux du XVIᵉ siècle qui conteste l'autorité et certaines pratiques de l'Église catholique ; il est à l'origine du protestantisme." },
      { mot: "Catholicisme / Protestantisme", def: "Les deux grandes branches du christianisme occidental après la Réforme." },
      { mot: "Concile", def: "Assemblée d'évêques et de théologiens réunie pour statuer sur des questions de doctrine et de discipline religieuse." },
      { mot: "Contre-Réforme", def: "Ensemble des réactions et des réformes internes par lesquelles l'Église catholique répond à la Réforme protestante." },
      { mot: "Guerres de Religion", def: "Conflits armés qui opposent catholiques et protestants en Europe au XVIᵉ et au début du XVIIᵉ siècle." },
      { mot: "Édit", def: "Acte législatif pris par un souverain, qui a force de loi." }
    ],
    personnages: [
      { nom: "Johannes Gutenberg", dates: "vers 1400-1468", txt: [
        "Allemand du XVᵉ siècle.",
        "Il met au point une technique qui permet de reproduire les livres rapidement et en grand nombre.",
        "Vers 1455, il achève à Mayence l'impression d'une Bible.",
        "Il invente l'imprimerie à caractères mobiles."
      ] },
      { nom: "Érasme", dates: "vers 1466-1536", txt: [
        "Grand humaniste né aux Pays-Bas, qui maîtrise le latin et le grec ancien.",
        "On le surnomme le « prince des humanistes ».",
        "En 1516, il publie une nouvelle traduction du Nouveau Testament, faite à partir du grec.",
        "Dans l'Éloge de la Folie, il fait parler la Folie pour critiquer le haut clergé."
      ] },
      { nom: "Michel-Ange", dates: "1475-1564", txt: [
        "Artiste italien de la Renaissance : sculpteur, peintre et architecte.",
        "Il sculpte la Pietà (1498-1499), puis le David de Florence (1501-1504).",
        "De 1508 à 1512, il peint pour le pape Jules II une immense fresque au Vatican.",
        "On lui doit la Création d'Adam, au plafond de la chapelle Sixtine."
      ] },
      { nom: "André Vésale", dates: "1514-1564", txt: [
        "Médecin flamand du XVIᵉ siècle.",
        "Il fonde ses connaissances sur l'observation du corps plutôt que sur les textes anciens.",
        "Il étudie le corps humain par la dissection, pratiquée sur des condamnés à mort.",
        "En 1543, il publie un grand traité d'anatomie illustré, De humani corporis fabrica."
      ] },
      { nom: "Nicolas Copernic", dates: "1473-1543", txt: [
        "Astronome polonais.",
        "Il remet en cause le modèle hérité d'Aristote et de Ptolémée, qui place la Terre au centre de l'univers.",
        "Dans un ouvrage publié en 1543, il affirme que la Terre tourne autour du Soleil."
      ] },
      { nom: "Galilée", dates: "1564-1642", txt: [
        "Savant italien de la fin du XVIᵉ et du début du XVIIᵉ siècle.",
        "Il perfectionne la lunette astronomique et observe les satellites de Jupiter et les phases de Vénus.",
        "Il défend l'héliocentrisme de Copernic.",
        "En 1633, jugé par l'Inquisition, il doit abjurer sa théorie."
      ] },
      { nom: "Martin Luther", dates: "1483-1546", txt: [
        "Moine allemand de l'ordre des Augustins.",
        "Il juge scandaleuse la vente des indulgences par l'Église.",
        "En 1517, il publie 95 thèses à Wittenberg.",
        "Excommunié par le pape Léon X, il fonde une Église où seule la foi permet le salut."
      ] },
      { nom: "Jean Calvin", dates: "1509-1564", txt: [
        "Réformateur protestant français du XVIᵉ siècle.",
        "Il s'installe à Genève, qui devient un grand foyer de la Réforme.",
        "Il fonde un courant protestant plus austère que le luthéranisme, qui se diffuse en France et aux Pays-Bas."
      ] },
      { nom: "Henri VIII", dates: "roi d'Angleterre de 1509 à 1547", txt: [
        "Roi d'Angleterre de la dynastie Tudor.",
        "Il rompt avec le pape pour des raisons avant tout politiques et personnelles.",
        "En 1534, l'Acte de suprématie fait de lui le chef de l'Église d'Angleterre : c'est la naissance de l'anglicanisme."
      ] },
      { nom: "Ignace de Loyola", dates: "vers 1491-1556", txt: [
        "Religieux espagnol du XVIᵉ siècle.",
        "Il fonde un ordre de religieux très disciplinés et fidèles au pape, approuvé en 1540.",
        "Ses membres, les jésuites, diffusent le catholicisme par l'enseignement et les missions."
      ] }
    ],
    lieux: [
      { nom: "Constantinople", lon: 28.98, lat: 41.01, txt: "Capitale de l'Empire byzantin, prise par les Ottomans en 1453 : des savants fuient vers l'Italie avec des manuscrits antiques." },
      { nom: "Mayence", lon: 8.27, lat: 50.0, txt: "Ville d'Allemagne où Gutenberg met au point l'imprimerie à caractères mobiles." },
      { nom: "Florence", lon: 11.26, lat: 43.77, txt: "Cité italienne des Médicis, grands mécènes ; le David de Michel-Ange y symbolise la liberté de la cité." },
      { nom: "Rome (Vatican)", lon: 12.45, lat: 41.9, txt: "Siège du pape : chapelle Sixtine peinte par Michel-Ange, basilique Saint-Pierre financée en partie par la vente des indulgences." },
      { nom: "Wittenberg", lon: 12.65, lat: 51.87, txt: "Ville d'Allemagne où Luther publie ses 95 thèses en 1517." },
      { nom: "Genève", lon: 6.14, lat: 46.2, txt: "Ville où s'installe Calvin : le grand foyer du calvinisme." },
      { nom: "Trente", lon: 11.12, lat: 46.07, txt: "Ville du nord de l'Italie actuelle, alors dans le Saint Empire, où se réunit le concile de 1545 à 1563." },
      { nom: "Augsbourg", lon: 10.9, lat: 48.37, txt: "Ville du Saint Empire où est signée la paix de 1555 : « tel prince, telle religion »." },
      { nom: "Paris", lon: 2.35, lat: 48.86, txt: "Ville du massacre de la Saint-Barthélemy, les 24 et 25 août 1572." },
      { nom: "Nantes", lon: -1.55, lat: 47.22, txt: "Ville où Henri IV signe en 1598 l'édit qui met fin aux guerres de Religion en France." }
    ],
    trous: [
      { titre: "L'Humanisme", texte: "L'[Humanisme] est le courant de pensée qui marque, à partir du XVᵉ siècle, la rupture intellectuelle entre le Moyen Âge et l'époque moderne. Favorisée par la fuite de savants byzantins après la prise de [Constantinople] en [1453] et par la redécouverte des textes [antiques], cette pensée place l'être humain, sa [raison] et sa dignité au centre de la réflexion. L'invention de l'[imprimerie] par [Gutenberg] permet la diffusion rapide de ces idées. [Érasme] propose une nouvelle traduction du Nouveau Testament et critique le haut clergé dans l'Éloge de la [Folie]." },
      { titre: "Les arts et les sciences", texte: "Les artistes de la [Renaissance] se passionnent pour l'Antiquité gréco-romaine et placent l'[Homme] au centre de leurs œuvres, grâce aux progrès de l'anatomie et de la [perspective] linéaire. De grands [mécènes], comme les [Médicis] à Florence ou les papes à Rome, financent leurs œuvres. [Vésale] étudie le corps humain par la [dissection], tandis que Copernic puis [Galilée] défendent l'[héliocentrisme], contre l'enseignement de l'Église." },
      { titre: "Les réformes religieuses", texte: "En [1517], le moine allemand Martin Luther conteste la vente des [indulgences] dans ses 95 thèses, à [Wittenberg]. Excommunié, il fonde une Église où seule la [foi] permet le salut. Le [calvinisme] naît à Genève, l'[anglicanisme] en Angleterre en 1534. L'Église catholique réagit par le concile de [Trente] (1545-1563) et l'action des [jésuites]. En France, les guerres de Religion s'achèvent par l'édit de [Nantes] (1598)." }
    ],
    capable: [
      "Placer sur une frise les repères du chapitre, de 1453 à 1598.",
      "Expliquer en quoi la prise de Constantinople (1453) et l'imprimerie favorisent la naissance de l'Humanisme.",
      "Expliquer en quoi l'Humanisme constitue une rupture avec la pensée médiévale.",
      "Présenter Érasme et expliquer pourquoi il critique l'Église par la voix de la Folie.",
      "Citer trois caractéristiques de l'art de la Renaissance et présenter une œuvre (auteur, date, mécène, sujet).",
      "Expliquer pourquoi les travaux de Vésale, de Copernic et de Galilée entrent en conflit avec l'Église.",
      "Expliquer pourquoi les 95 thèses de Luther entraînent une rupture avec le pape.",
      "Situer sur une carte les grands espaces confessionnels de l'Europe vers 1560.",
      "Comparer la Réforme protestante et la réaction catholique : salut, sacrements, autorité du pape, clergé.",
      "Répondre à la problématique : montrer comment l'esprit critique humaniste favorise les réformes religieuses."
    ],

    /* Les trois points de passage, repris de la fiche séquence, des séances 1, 2 et 4 (et leurs corrigés)
       et du diaporama « Chapitre 2 — Humanisme, Renaissance et réformes religieuses ». */
    ppo: [
      {
        id: "michel-ange", court: "PPO Michel-Ange",
        titre: "1508 : Michel-Ange entreprend la fresque de la chapelle Sixtine",
        question: "En quoi la voûte de la chapelle Sixtine illustre-t-elle l'art de la Renaissance ?",
        branches: [
          { titre: "Une commande du pape", points: [
            "En 1508, le pape Jules II, grand mécène, confie à Michel-Ange la décoration de la voûte de la chapelle Sixtine, au Vatican.",
            "Michel-Ange est déjà un sculpteur célèbre : la Pietà (1498-1499), le David (1501-1504).",
            "Il peint la voûte de 1508 à 1512."
          ] },
          { titre: "Une technique : la fresque", points: [
            "Une peinture murale exécutée sur un enduit frais.",
            "Environ 520 m² de voûte peints, dans la chapelle du palais du pape."
          ] },
          { titre: "Un sujet chrétien, des corps à l'antique", points: [
            "Des épisodes de la Genèse, dont la Création d'Adam.",
            "Des corps puissants, souvent nus, dans des poses dynamiques héritées de l'Antiquité.",
            "La foi chrétienne unie à l'admiration de la beauté humaine : l'idéal de la Renaissance."
          ] },
          { titre: "Un artiste reconnu comme créateur", points: [
            "Autrefois considéré comme un simple artisan, l'artiste est désormais reconnu comme un créateur, qui signe ses œuvres.",
            "Les grands mécènes, papes à Rome et Médicis à Florence, financent les œuvres majeures.",
            "Au même moment, Raphaël peint L'École d'Athènes au Vatican pour le même pape (1510-1511)."
          ] }
        ],
        reperes: [
          { a: 1495, b: 1498, date: "1495-1498", txt: "Léonard de Vinci peint La Cène à Milan, pour le duc Ludovic Sforza." },
          { a: 1498, b: 1499, date: "1498-1499", txt: "Michel-Ange sculpte la Pietà, aujourd'hui à la basilique Saint-Pierre de Rome." },
          { a: 1501, b: 1504, date: "1501-1504", txt: "Michel-Ange sculpte le David pour la République de Florence." },
          { a: 1508, date: "1508", txt: "Le pape Jules II confie à Michel-Ange la voûte de la chapelle Sixtine." },
          { a: 1510, b: 1511, date: "1510-1511", txt: "Raphaël peint L'École d'Athènes au Vatican, pour Jules II." },
          { a: 1512, date: "1512", txt: "Michel-Ange achève la voûte de la chapelle Sixtine." }
        ],
        notions: [
          { mot: "Fresque", def: "Technique de peinture murale exécutée sur un enduit frais." },
          { mot: "Mécène", def: "Personne, souvent riche ou puissante, qui finance des artistes et leurs œuvres." },
          { mot: "Chapelle Sixtine", def: "Chapelle du palais du pape, au Vatican, à Rome ; elle porte le nom du pape Sixte IV, qui l'a fait construire." },
          { mot: "Genèse", def: "Premier livre de la Bible, qui raconte la création du monde et de l'homme." },
          { mot: "Perspective linéaire", def: "Technique qui donne l'illusion de la profondeur sur une surface plane : les lignes fuyantes se rejoignent en un point." },
          { mot: "Pietà", def: "Représentation de la Vierge tenant sur ses genoux le corps du Christ mort." },
          { mot: "Artiste", def: "À la Renaissance, il n'est plus considéré comme un simple artisan, mais comme un créateur, qui signe ses œuvres." }
        ],
        personnages: [
          { nom: "Michel-Ange", dates: "1475-1564", txt: [
            "Artiste italien de la Renaissance : sculpteur, peintre et architecte.",
            "Il sculpte la Pietà et le David.",
            "De 1508 à 1512, il peint à fresque des épisodes de la Genèse pour le pape Jules II.",
            "On lui doit la Création d'Adam, au plafond de la chapelle Sixtine."
          ] },
          { nom: "Jules II", dates: "pape de 1503 à 1513", txt: [
            "Pape au début du XVIᵉ siècle, grand mécène.",
            "Il commande à Raphaël les fresques de la Chambre de la Signature, dont L'École d'Athènes.",
            "En 1508, il confie à Michel-Ange la voûte de la chapelle Sixtine."
          ] },
          { nom: "Raphaël", dates: "1483-1520", txt: [
            "Peintre italien de la Renaissance.",
            "Il travaille au Vatican pour le pape Jules II.",
            "Dans L'École d'Athènes (1510-1511), il réunit Platon et Aristote dans une architecture antique idéalisée."
          ] }
        ],
        lieux: [
          { nom: "Rome (Vatican)", lon: 12.45, lat: 41.9, txt: "Palais du pape : la chapelle Sixtine (Michel-Ange) et la Chambre de la Signature (Raphaël)." },
          { nom: "Florence", lon: 11.26, lat: 43.77, txt: "Cité des Médicis ; le David de Michel-Ange y est placé comme symbole de la liberté de la cité." },
          { nom: "Carrare", lon: 10.1, lat: 44.08, txt: "Ville de Toscane célèbre pour son marbre blanc, dans lequel Michel-Ange sculpte la Pietà." }
        ],
        documents: [
          { titre: "La voûte de la chapelle Sixtine", source: "Michel-Ange, fresque, 1508-1512, environ 520 m², chapelle Sixtine, Vatican. Commande du pape Jules II.",
            extrait: "Sur la voûte, des épisodes de la Genèse, dont la Création d'Adam : Dieu tend le bras vers Adam, nu et allongé, pour lui donner la vie. Les corps sont puissants, dans des poses dynamiques.",
            montre: "Un sujet chrétien, commandé par un pape mécène, traité avec une maîtrise du corps humain héritée de l'Antiquité." },
          { titre: "La Pietà", source: "Michel-Ange, marbre de Carrare, 1498-1499, 174 × 195 cm, basilique Saint-Pierre, Rome. Commande du cardinal Jean Bilhères de Lagraulas.",
            extrait: "La Vierge tient sur ses genoux le corps du Christ mort.",
            montre: "La fusion entre la spiritualité chrétienne et l'admiration de la beauté humaine." },
          { titre: "L'École d'Athènes", source: "Raphaël, fresque, 1510-1511, Chambre de la Signature, Vatican. Commande du pape Jules II.",
            extrait: "Les grands philosophes de l'Antiquité, Platon et Aristote au centre, réunis dans une architecture antique idéalisée.",
            montre: "Au même moment et pour le même pape, le retour à l'Antiquité et la perspective linéaire." }
        ],
        pieges: [
          "La Renaissance ne rejette pas la religion : la voûte de la Sixtine représente la Genèse et a été commandée par un pape. Elle unit la foi chrétienne et l'admiration de la beauté humaine.",
          "Michel-Ange peint la voûte (le plafond) de 1508 à 1512 ; le Jugement dernier, sur le mur de l'autel de la même chapelle, est plus tardif (1536-1541).",
          "Ne pas confondre l'Humanisme, un courant de pensée, et la Renaissance, le renouveau des arts et des savoirs."
        ],
        mots: ["Jules II", "mécène", "fresque", "voûte", "Genèse", "corps humain", "Antiquité", "créateur", "Raphaël"],
        reponse: "La voûte de la chapelle Sixtine illustre l'art de la Renaissance. C'est d'abord la commande d'un grand mécène : en 1508, le pape Jules II confie à Michel-Ange, déjà célèbre pour sa Pietà et son David, la décoration de la voûte de sa chapelle, au Vatican. De 1508 à 1512, l'artiste peint à fresque, sur un enduit frais, environ 520 m² d'épisodes de la Genèse, dont la Création d'Adam. Le sujet reste chrétien, mais les corps, puissants et souvent nus, sont représentés dans des poses dynamiques héritées de l'Antiquité : la Renaissance unit la foi chrétienne et l'admiration de la beauté humaine. Enfin, l'œuvre montre le nouveau statut de l'artiste : Michel-Ange n'est plus un simple artisan, mais un créateur reconnu, au moment même où Raphaël peint L'École d'Athènes pour le même pape.",
        trous: [
          { titre: "Le bilan", texte: "En [1508], le pape [Jules II], grand [mécène], confie à Michel-Ange la voûte de la chapelle [Sixtine]. Jusqu'en [1512], l'artiste y peint à [fresque] des épisodes de la [Genèse], dont la Création d'Adam. Les corps, puissants et souvent nus, sont hérités de l'[Antiquité]. L'artiste n'est plus un artisan, mais un [créateur]." }
        ],
        capable: [
          "Dater la voûte de la chapelle Sixtine et dire qui l'a commandée.",
          "Définir une fresque et un mécène.",
          "Décrire le sujet de la voûte et expliquer ce qu'il doit à la Bible et à l'Antiquité.",
          "Citer trois caractéristiques de l'art de la Renaissance à partir de cette œuvre.",
          "Expliquer comment change le statut de l'artiste à la Renaissance."
        ]
      },
      {
        id: "erasme", court: "PPO Érasme",
        titre: "Érasme, prince des humanistes",
        question: "Pourquoi Érasme est-il surnommé le « prince des humanistes » ?",
        branches: [
          { titre: "Un savant européen", points: [
            "Né vers 1466 aux Pays-Bas, mort en 1536 : un grand humaniste qui maîtrise le latin et le grec ancien.",
            "Il écrit en latin, la langue savante de toute l'Europe.",
            "Grâce à l'imprimerie, ses livres circulent dans toute l'Europe."
          ] },
          { titre: "Revenir aux textes", points: [
            "Le plus ancien exemplaire connu du Nouveau Testament est un manuscrit en grec.",
            "La Vulgate de saint Jérôme, la traduction latine de référence, comportait des erreurs.",
            "En 1516, Érasme publie une nouvelle traduction latine, faite directement à partir du grec : c'est la méthode humaniste du retour aux sources."
          ] },
          { titre: "Critiquer l'Église avec prudence", points: [
            "Dans l'Éloge de la Folie (écrit en 1509), c'est la Folie elle-même qui prend la parole.",
            "Elle critique le haut clergé (pape, cardinaux, évêques), qui vit comme des princes, dans le luxe et l'amour de l'argent, loin de la pauvreté du Christ.",
            "En faisant parler la Folie, Érasme évite la censure et une condamnation par l'Église."
          ] },
          { titre: "Un humaniste au temps des réformes", points: [
            "Son esprit critique et son retour aux textes préparent la contestation religieuse.",
            "Mais Érasme reste catholique et refuse de suivre Luther."
          ] }
        ],
        reperes: [
          { a: 1466, date: "vers 1466", txt: "Naissance d'Érasme aux Pays-Bas." },
          { a: 1509, date: "1509", txt: "Érasme écrit l'Éloge de la Folie, publié en 1511." },
          { a: 1516, date: "1516", txt: "Érasme publie une nouvelle traduction latine du Nouveau Testament, faite à partir du grec." },
          { a: 1517, date: "1517", txt: "Luther publie ses 95 thèses : le temps des réformes commence." },
          { a: 1536, date: "1536", txt: "Mort d'Érasme, à Bâle." }
        ],
        notions: [
          { mot: "Humanisme", def: "Courant de pensée qui place l'être humain, sa raison et sa dignité au centre de la réflexion, en dialogue avec les textes de l'Antiquité." },
          { mot: "Nouveau Testament", def: "Partie de la Bible qui raconte la vie et l'enseignement de Jésus et de ses apôtres ; ses plus anciens manuscrits connus sont en grec." },
          { mot: "Vulgate", def: "Traduction latine de la Bible réalisée par saint Jérôme vers 400 ; c'est le texte de référence de l'Église au Moyen Âge." },
          { mot: "Haut clergé", def: "Les membres les plus puissants de l'Église : le pape, les cardinaux, les évêques." },
          { mot: "Censure", def: "Contrôle et interdiction, par une autorité, des écrits jugés dangereux." },
          { mot: "Imprimerie", def: "Technique qui permet de reproduire des textes rapidement et en grand nombre grâce à des caractères mobiles, mise au point par Gutenberg au milieu du XVᵉ siècle." }
        ],
        personnages: [
          { nom: "Érasme", dates: "vers 1466-1536", txt: [
            "Grand humaniste né aux Pays-Bas, qui écrit en latin.",
            "Il maîtrise le grec ancien.",
            "En 1516, il publie une nouvelle traduction du Nouveau Testament, plus fidèle que la Vulgate.",
            "Dans l'Éloge de la Folie, il fait parler la Folie pour critiquer le haut clergé."
          ] },
          { nom: "Thomas More", dates: "1478-1535", txt: [
            "Humaniste et homme politique anglais.",
            "Ami d'Érasme, qui écrit l'Éloge de la Folie chez lui, à Londres, en 1509.",
            "En 1516, il publie L'Utopie, le récit d'une société idéale."
          ] }
        ],
        lieux: [
          { nom: "Rotterdam", lon: 4.48, lat: 51.92, txt: "Ville des Pays-Bas où naît Érasme, appelé aussi Érasme de Rotterdam." },
          { nom: "Bâle", lon: 7.59, lat: 47.56, txt: "Ville d'imprimeurs où paraît en 1516 le Nouveau Testament d'Érasme, et où il meurt en 1536." }
        ],
        documents: [
          { titre: "L'Éloge de la Folie", source: "Érasme, Éloge de la Folie, écrit en 1509, publié en 1511 (extrait étudié dans le manuel de la classe).",
            extrait: "La Folie prend elle-même la parole. Elle dépeint le pape, les cardinaux et les évêques comme des princes, qui vivent dans le luxe et l'amour de l'argent, en oubliant leur mission religieuse et la pauvreté du Christ.",
            montre: "Une critique indirecte du haut clergé : faire parler la Folie permet à Érasme d'éviter la censure." },
          { titre: "Le Nouveau Testament d'Érasme", source: "Érasme, nouvelle traduction latine du Nouveau Testament, Bâle, 1516.",
            extrait: "Une traduction faite directement à partir du texte grec, publiée avec le texte grec en regard, plus fidèle que la Vulgate de saint Jérôme, qui comportait des erreurs.",
            montre: "La méthode humaniste : revenir aux textes originaux grâce aux langues anciennes, puis les diffuser par l'imprimerie." }
        ],
        pieges: [
          "Érasme critique les abus de l'Église, mais il ne rompt pas avec elle : il reste catholique et refuse de suivre Luther.",
          "Érasme écrit en latin, la langue savante de toute l'Europe ; ce sont d'autres humanistes, comme Rabelais, Montaigne ou Machiavel, qui écrivent en langue vernaculaire.",
          "Dans l'Éloge de la Folie, ce n'est pas Érasme qui parle, mais la Folie : c'est ce procédé qui lui permet d'éviter la censure."
        ],
        mots: ["humaniste", "grec ancien", "Nouveau Testament", "Vulgate", "1516", "Éloge de la Folie", "haut clergé", "censure", "imprimerie"],
        reponse: "Érasme (vers 1466-1536) est surnommé le « prince des humanistes » parce qu'il incarne la méthode et l'esprit de l'Humanisme. Né aux Pays-Bas, il maîtrise le latin et le grec ancien et revient aux textes originaux : en 1516, il publie une nouvelle traduction latine du Nouveau Testament, faite directement à partir du grec, plus fidèle que la Vulgate de saint Jérôme, qui comportait des erreurs. Grâce à l'imprimerie, ses livres circulent dans toute l'Europe. Il exerce aussi son esprit critique sur l'Église : dans l'Éloge de la Folie, écrit en 1509, c'est la Folie qui parle et qui dénonce le pape, les cardinaux et les évêques, qui vivent comme des princes, loin de la pauvreté du Christ. Ce procédé lui permet d'éviter la censure. Son retour aux textes prépare la contestation religieuse, mais Érasme reste catholique et refuse de suivre Luther.",
        trous: [
          { titre: "Le bilan", texte: "Érasme, le « prince des [humanistes] », maîtrise le [grec] ancien. En [1516], il publie une nouvelle traduction du [Nouveau Testament], plus fidèle que la [Vulgate] de saint Jérôme. Dans l'Éloge de la [Folie], il critique le haut [clergé], qui vit dans le luxe ; en faisant parler la Folie, il évite la [censure]. Grâce à l'[imprimerie], ses livres circulent dans toute l'Europe." }
        ],
        capable: [
          "Présenter Érasme en quelques phrases (dates, origine, langues, œuvres).",
          "Expliquer pourquoi la connaissance du grec ancien lui permet de retraduire le Nouveau Testament.",
          "Expliquer quelle critique de l'Église il formule dans l'Éloge de la Folie, et pourquoi il la met dans la bouche de la Folie.",
          "Expliquer en quoi Érasme incarne la méthode humaniste du retour aux textes.",
          "Dire pourquoi Érasme, critique de l'Église, ne devient pas protestant."
        ]
      },
      {
        id: "luther", court: "PPO Luther",
        titre: "1517 : Luther ouvre le temps des réformes",
        question: "Comment les 95 thèses de Luther ouvrent-elles le temps des réformes ?",
        branches: [
          { titre: "Une Église contestée", points: [
            "À la fin du XVᵉ siècle, des chrétiens s'interrogent sur la meilleure façon d'obtenir leur salut.",
            "Ils accusent les curés d'être ignorants, les évêques et les abbés de s'enrichir, les papes de vivre comme des rois.",
            "L'Église vend des indulgences, notamment pour financer la construction de la basilique Saint-Pierre de Rome."
          ] },
          { titre: "Les 95 thèses (1517)", points: [
            "Martin Luther, moine augustin allemand, juge scandaleuse la vente des indulgences.",
            "En 1517, à Wittenberg, il la dénonce dans ses 95 thèses : pour lui, ces documents n'ont aucun effet sur le salut.",
            "Il critique plus largement l'autorité du pape Léon X."
          ] },
          { titre: "La rupture avec le pape", points: [
            "Sommé de se rétracter, Luther refuse.",
            "Il brûle la bulle du pape qui lui demande de se soumettre (1520) ; il est excommunié en 1521.",
            "Son courant de pensée rallie de plus en plus de partisans."
          ] },
          { titre: "Une nouvelle Église, d'autres réformes", points: [
            "Le salut par la foi seule, et non par les œuvres ; deux sacrements (baptême, communion) au lieu de sept ; plus de culte de la Vierge et des saints.",
            "La prédication et la Bible traduite en langue nationale diffusent ses idées.",
            "D'autres réformes suivent : calvinisme (Genève), anglicanisme (1534), puis la réaction catholique du concile de Trente (1545-1563)."
          ] }
        ],
        reperes: [
          { a: "1517-10-31", date: "31 octobre 1517", txt: "Luther rend publiques ses 95 thèses contre la vente des indulgences." },
          { a: 1520, date: "1520", txt: "Luther brûle la bulle du pape qui lui demande de se soumettre." },
          { a: 1521, date: "1521", txt: "Le pape Léon X excommunie Luther." },
          { a: 1534, date: "1534", txt: "Acte de suprématie : naissance de l'anglicanisme." },
          { a: 1545, b: 1563, date: "1545-1563", txt: "Le concile de Trente : la réponse de l'Église catholique." },
          { a: 1546, date: "1546", txt: "Mort de Luther." },
          { a: 1555, date: "1555", txt: "Paix d'Augsbourg : chaque prince du Saint Empire choisit la religion de son territoire." }
        ],
        notions: [
          { mot: "Indulgence", def: "Document vendu par l'Église, censé réduire le temps qu'une âme doit passer au purgatoire." },
          { mot: "Purgatoire", def: "Selon l'Église catholique, lieu où les âmes des morts expient leurs péchés avant d'accéder au paradis." },
          { mot: "Salut", def: "Pour les chrétiens, le fait d'échapper à l'enfer et d'accéder au paradis après la mort." },
          { mot: "Thèse", def: "Proposition que l'on avance et que l'on s'engage à défendre dans un débat." },
          { mot: "Excommunication", def: "Exclusion de l'Église, prononcée par le pape." },
          { mot: "Sacrement", def: "Rite religieux (baptême, communion…) qui, pour les chrétiens, transmet la grâce de Dieu. Les catholiques en ont sept, les luthériens deux." },
          { mot: "La Réforme", def: "Mouvement religieux du XVIᵉ siècle qui conteste l'autorité et certaines pratiques de l'Église catholique ; il est à l'origine du protestantisme." }
        ],
        personnages: [
          { nom: "Martin Luther", dates: "1483-1546", txt: [
            "Moine allemand de l'ordre des Augustins.",
            "Il juge scandaleuse la vente des indulgences.",
            "En 1517, il publie 95 thèses à Wittenberg.",
            "Excommunié en 1521, il fonde une Église où seule la foi permet le salut."
          ] },
          { nom: "Léon X", dates: "pape de 1513 à 1521", txt: [
            "Pape issu de la famille florentine des Médicis.",
            "L'Église vend alors des indulgences pour financer la construction de la basilique Saint-Pierre de Rome.",
            "Il somme le moine de Wittenberg de se rétracter, puis l'excommunie en 1521."
          ] },
          { nom: "Jean Calvin", dates: "1509-1564", txt: [
            "Réformateur protestant français.",
            "Il s'installe à Genève, qui devient un grand foyer de la Réforme.",
            "Son courant, plus austère que le luthéranisme, se diffuse en France et aux Pays-Bas."
          ] }
        ],
        lieux: [
          { nom: "Wittenberg", lon: 12.65, lat: 51.87, txt: "Ville d'Allemagne où Luther est moine et où il publie ses 95 thèses en 1517." },
          { nom: "Rome", lon: 12.45, lat: 41.9, txt: "Siège du pape Léon X ; la basilique Saint-Pierre est financée en partie par la vente des indulgences." },
          { nom: "Genève", lon: 6.14, lat: 46.2, txt: "Ville où s'installe Calvin : le grand foyer du calvinisme." },
          { nom: "Augsbourg", lon: 10.9, lat: 48.37, txt: "Ville du Saint Empire où est signée la paix de 1555 : « tel prince, telle religion »." }
        ],
        documents: [
          { titre: "Luther affichant ses 95 thèses", source: "Ferdinand Pauwels, peinture, 1872.",
            extrait: "Luther, en habit de moine, fixe ses thèses sur la porte de l'église de Wittenberg.",
            montre: "Une scène peinte plus de trois siècles après les faits, qui fait de Luther un héros : un document à lire avec prudence." },
          { titre: "Les espaces confessionnels de l'Europe vers 1560", source: "Carte des espaces chrétiens d'Europe après la Réforme (diaporama du cours).",
            extrait: "Catholiques au sud et à l'ouest de l'Europe ; luthériens en Allemagne du Nord et en Scandinavie ; calvinistes à Genève, dans une partie de la France et aux Pays-Bas ; anglicans en Angleterre.",
            montre: "En une quarantaine d'années, la chrétienté occidentale se divise en espaces confessionnels rivaux." }
        ],
        pieges: [
          "Au départ, Luther ne veut pas fonder une nouvelle Église mais réformer l'Église : c'est son refus de se rétracter et son excommunication qui entraînent la rupture.",
          "L'affichage des thèses sur la porte de l'église de Wittenberg n'est raconté qu'après la mort de Luther et reste discuté par les historiens ; ce qui est sûr, c'est que le 31 octobre 1517 il envoie ses thèses à l'archevêque de Mayence.",
          "L'anglicanisme ne naît pas d'une querelle de doctrine : Henri VIII rompt avec Rome en 1534 pour des raisons avant tout politiques et personnelles."
        ],
        mots: ["indulgences", "95 thèses", "Wittenberg", "Léon X", "excommunié", "foi seule", "deux sacrements", "imprimerie", "calvinisme", "concile de Trente"],
        reponse: "En 1517, Martin Luther, moine augustin allemand, conteste la vente des indulgences, ces documents censés réduire le temps passé au purgatoire, que l'Église vend notamment pour financer la construction de la basilique Saint-Pierre de Rome. Dans ses 95 thèses, rendues publiques à Wittenberg, il affirme que les indulgences n'ont aucun effet sur le salut et critique l'autorité du pape Léon X. Sommé de se rétracter, il refuse, brûle la bulle du pape et est excommunié en 1521. Il fonde alors une Église où seule la foi permet le salut, qui ne garde que deux sacrements et abandonne le culte de la Vierge et des saints. Grâce à l'imprimerie et à la Bible traduite en allemand, ses idées se diffusent vite. Luther ouvre ainsi le temps des réformes : d'autres courants naissent, calvinisme et anglicanisme, puis l'Église catholique réagit par le concile de Trente (1545-1563).",
        trous: [
          { titre: "Le bilan", texte: "En [1517], le moine allemand Martin Luther conteste la vente des [indulgences], qui finance notamment la basilique [Saint-Pierre] de Rome. Dans ses 95 [thèses], à [Wittenberg], il critique l'autorité du pape [Léon X]. Il refuse de se rétracter et est [excommunié]. Dans son Église, seule la [foi] permet le salut, et il ne reste que deux [sacrements]." }
        ],
        capable: [
          "Expliquer ce qu'est une indulgence et pourquoi Luther en dénonce la vente.",
          "Raconter comment les 95 thèses entraînent la rupture entre Luther et le pape (1517-1521).",
          "Citer trois différences entre l'Église de Luther et l'Église catholique.",
          "Distinguer luthéranisme, calvinisme et anglicanisme, et les situer sur une carte.",
          "Analyser avec prudence une image peinte longtemps après les faits (le tableau de Pauwels, 1872).",
          "Expliquer pourquoi on dit que Luther « ouvre le temps des réformes »."
        ]
      }
    ]
  },

  /* =====================================================================
     2nde — HISTOIRE — Thème 3, chapitre 5
     ===================================================================== */
  {
    id: "2de-h3-c5", n: "2nde", d: "histoire", carte: "france",
    theme: "L'État à l'époque moderne : France et Angleterre",
    rituel: "L'État à l'époque moderne : France et Angleterre",
    num: "Chapitre 5",
    titre: "L'affirmation de l'État dans le royaume de France",
    question: "Comment l'État a-t-il renforcé son emprise sur le territoire et les populations ? À quelles limites l'autorité royale s'est-elle confrontée ?",
    plan: [
      "La naissance de l'État moderne : une volonté d'expansion territoriale ; contrôler le territoire, la monarchie administrative (l'ordonnance de Villers-Cotterêts)",
      "L'affirmation de l'autorité royale : la guerre ; le contrôle de l'économie (Colbert) ; la religion (l'édit de Nantes et sa révocation) ; soumettre la noblesse (Versailles)",
      "Les limites rencontrées par l'autorité royale"
    ],
    cle: "Du XVIᵉ au XVIIIᵉ siècle, l'État royal renforce son emprise dans tous les domaines (territoire, administration, économie, religion, noblesse) ; mais ce pouvoir n'est jamais sans limites en pratique : l'« absolutisme » est une affirmation théorique plus qu'une réalité.",
    essentiel: [
      "Un État se caractérise par un territoire, une population et une souveraineté. De François Iᵉʳ à Louis XIV, les rois étendent le domaine royal par la guerre, les mariages et la colonisation ; Vauban protège les frontières par une « ceinture de fer » de places fortes.",
      "Pour contrôler ce territoire, le roi met en place une monarchie administrative : ordonnance de Villers-Cotterêts (1539), ministres et secrétaires d'État, intendants généralisés dans les provinces au XVIIᵉ siècle, routes, postes et corps des Ponts et Chaussées (1716).",
      "Presque permanente sous Louis XIII et Louis XIV, la guerre étend le royaume et affirme la gloire du roi, mais la « Révolution militaire » la rend très coûteuse. Le roi alourdit les impôts (la taille ; la capitation en 1695) et Colbert applique le mercantilisme : compagnies des Indes orientales (1664) et du Levant (1670).",
      "Henri IV met fin aux guerres de Religion par l'édit de Nantes (1598) ; Louis XIV le révoque par l'édit de Fontainebleau (1685) au nom de l'unité religieuse : près de 180 000 protestants s'exilent.",
      "À Versailles, où la cour s'installe en 1682, l'étiquette, les honneurs et les pensions attachent la noblesse au roi : les historiens parlent d'obéissance consentie plutôt que de soumission.",
      "Mais l'autorité royale reste limitée : lois fondamentales, états provinciaux qui négocient, critiques jusque dans l'entourage du roi (Fénelon, 1694), révolte de la Fronde (1648-1652), dépendance envers les financiers. Le mot « absolutisme », forgé au XIXᵉ siècle, est donc fortement nuancé par les historiens."
    ],
    periodes: [
      { de: 1515, a: 1547, nom: "Règne de François Iᵉʳ", court: "François Iᵉʳ" },
      { de: 1562, a: 1598, nom: "Guerres de Religion" },
      { de: 1610, a: 1643, nom: "Règne de Louis XIII", court: "Louis XIII" },
      { de: 1643, a: 1715, nom: "Règne de Louis XIV", court: "Louis XIV" }
    ],
    reperes: [
      { a: 1534, date: "1534", txt: "Affaire des Placards : François Iᵉʳ durcit sa politique contre les protestants." },
      { a: 1539, date: "1539", txt: "Ordonnance de Villers-Cotterêts : le français dans les actes de justice et d'administration, registres de baptêmes." },
      { a: 1562, b: 1598, date: "1562-1598", txt: "Les huit guerres de Religion." },
      { a: "1572-08-24", date: "24 août 1572", txt: "Massacre de la Saint-Barthélemy, sur ordre de Charles IX." },
      { a: 1598, date: "1598", txt: "Édit de Nantes : Henri IV accorde la liberté de culte aux protestants." },
      { a: 1648, b: 1652, date: "1648-1652", txt: "La Fronde défie le pouvoir royal pendant la minorité de Louis XIV." },
      { a: 1661, b: 1682, date: "1661-1682", txt: "Chantier du château de Versailles ; la cour s'y installe en 1682." },
      { a: 1664, date: "1664", txt: "Colbert fonde la Compagnie des Indes orientales." },
      { a: 1685, date: "1685", txt: "Édit de Fontainebleau : Louis XIV révoque l'édit de Nantes." },
      { a: 1688, b: 1697, date: "1688-1697", txt: "Guerre de la Ligue d'Augsbourg : la France contre une coalition européenne." },
      { a: 1695, date: "1695", txt: "Création de la capitation, un nouvel impôt pour financer la guerre." },
      { a: 1716, date: "1716", txt: "Création du corps des Ponts et Chaussées." }
    ],
    notions: [
      { mot: "État", def: "Un État se caractérise par un territoire, une population et une souveraineté. Ici, le territoire soumis à l'autorité du roi de France." },
      { mot: "Domaine royal", def: "Ensemble des terres directement soumises à l'autorité du roi de France." },
      { mot: "Monarchie administrative", def: "Système politique dans lequel le pouvoir royal s'appuie sur une administration structurée et hiérarchisée pour gouverner l'ensemble du territoire." },
      { mot: "Intendant", def: "Haut fonctionnaire royal envoyé en province pour surveiller et faire appliquer les décisions du roi (justice, police, finances)." },
      { mot: "Lit de justice", def: "Séance solennelle du parlement, en présence du roi, qui lui permet de forcer l'enregistrement d'une loi." },
      { mot: "Siège", def: "Opération militaire consistant à encercler une ville ou une forteresse pour la contraindre à se rendre." },
      { mot: "Révolution militaire", def: "Transformation des armées européennes à l'époque moderne (hausse des effectifs, de la puissance de feu, du coût), qui ne peut être financée que par de grands États." },
      { mot: "Mercantilisme", def: "Politique économique qui consiste à faire rentrer le plus d'or et d'argent possible dans le royaume, en favorisant les exportations et en limitant les importations." },
      { mot: "Édit", def: "Acte législatif pris par un souverain, ayant force de loi." },
      { mot: "Étiquette", def: "Ensemble des règles strictes qui organisent la vie de cour à Versailles." },
      { mot: "Obéissance consentie", def: "Notion préférée par les historiens à celle de stricte soumission : les nobles obéissent au roi, mais en attendent des contreparties (honneurs, pensions)." },
      { mot: "Lois fondamentales", def: "Règles non écrites du royaume auxquelles le roi lui-même ne peut se soustraire : succession au fils aîné, loi salique, serments du sacre." },
      { mot: "Fronde", def: "Série de révoltes du Parlement de Paris puis des princes contre le pouvoir royal (1648-1652), pendant la minorité de Louis XIV." },
      { mot: "Dépendance financière", def: "Situation d'un roi qui, pour payer ses guerres, doit emprunter aux financiers et aux élites, et donc composer avec leurs conditions." },
      { mot: "Absolutisme", def: "Terme forgé au XIXᵉ siècle pour désigner un pouvoir royal sans limites ni contrôle ; les historiens l'ont fortement nuancé, voire abandonné." }
    ],
    personnages: [
      { nom: "François Iᵉʳ", dates: "roi de 1515 à 1547", txt: [
        "Roi de France au XVIᵉ siècle, gendre de son prédécesseur Louis XII.",
        "Il donne une nouvelle image du roi et de la monarchie : ce sont les prémices de l'affirmation de l'État.",
        "Sous son règne, la Bretagne et l'Auvergne sont rattachées au domaine royal.",
        "En 1539, il impose le français dans les actes de justice et d'administration, à la place du latin."
      ] },
      { nom: "Henri IV", dates: "roi de 1589 à 1610", txt: [
        "Roi de Navarre et protestant, il épouse Marguerite de Valois en 1572 : ce mariage est l'occasion du massacre de la Saint-Barthélemy.",
        "Il devient roi de France en 1589, à la mort du dernier roi Valois.",
        "Sous son règne, le Périgord, le comté de Foix, l'Armagnac et la Bresse sont réunis au domaine royal.",
        "En 1598, il met fin aux guerres de Religion par un édit qui accorde la liberté de culte aux protestants."
      ] },
      { nom: "Louis XIV", dates: "roi de 1643 à 1715", txt: [
        "Devenu roi enfant, il connaît pendant sa minorité la révolte de la Fronde.",
        "Il gouverne avec des ministres comme Colbert et mène de nombreuses guerres, comme celle de la Ligue d'Augsbourg.",
        "Il fait de Versailles le siège de la cour en 1682 ; on le surnomme le « roi-soleil ».",
        "En 1685, il révoque l'édit de Nantes de son grand-père par l'édit de Fontainebleau."
      ] },
      { nom: "Jean-Baptiste Colbert", dates: "1619-1683", txt: [
        "Contrôleur général des finances et secrétaire d'État à la Marine du roi au XVIIᵉ siècle.",
        "Il applique le mercantilisme : faire entrer dans le royaume le plus d'or et d'argent possible.",
        "Il fonde la Compagnie des Indes orientales (1664) et la Compagnie du Levant (1670).",
        "Le port de Lorient est fondé en 1666, sur son ordre, pour servir de base à la Compagnie des Indes."
      ] },
      { nom: "Vauban", dates: "1633-1707", txt: [
        "Ingénieur militaire au service de Louis XIV.",
        "Il dirige des sièges savants : tranchées en zigzag, batteries de canons.",
        "Il fait édifier sur les frontières une « ceinture de fer » de places fortes."
      ] },
      { nom: "Richelieu", dates: "1585-1642", txt: [
        "Cardinal, principal ministre de Louis XIII.",
        "Il applique déjà des principes du mercantilisme pour développer l'économie du royaume.",
        "Sous son ministère, les états de Languedoc refusent de payer l'entretien des troupes (1629), puis négocient âprement avec le roi."
      ] },
      { nom: "Mazarin", dates: "1602-1661", txt: [
        "Cardinal, principal ministre de la régente Anne d'Autriche pendant la minorité de Louis XIV.",
        "En 1648, il annonce la suppression de la paulette, ce qui accroît la fureur des officiers.",
        "Pendant la Fronde, il fait arrêter des meneurs du Parlement (1648), puis le prince de Condé (1650)."
      ] },
      { nom: "Fénelon", dates: "1651-1715", txt: [
        "Homme d'Église, théologien et écrivain français.",
        "Proche de la cour, il critique durement la façon de gouverner de Louis XIV.",
        "Dans une lettre anonyme au roi (1694), il dénonce les guerres menées pour la gloire et la misère du peuple : « La France entière n'est plus qu'un grand hôpital désolé et sans provision. »"
      ] }
    ],
    lieux: [
      { nom: "Versailles", lon: 2.12, lat: 48.80, txt: "Château conçu à la gloire de Louis XIV : travaux à partir de 1661, installation de la cour en 1682." },
      { nom: "Paris", lon: 2.35, lat: 48.86, txt: "Capitale du royaume, où siège le Parlement ; théâtre de la Saint-Barthélemy (1572) et des barricades de la Fronde (1648)." },
      { nom: "Villers-Cotterêts", lon: 3.09, lat: 49.25, txt: "Château royal où François Iᵉʳ signe en 1539 l'ordonnance qui impose le français dans les actes officiels." },
      { nom: "Nantes", lon: -1.55, lat: 47.22, txt: "Ville où Henri IV donne en 1598 l'édit qui met fin aux guerres de Religion." },
      { nom: "Fontainebleau", lon: 2.70, lat: 48.40, txt: "Château royal où Louis XIV signe en 1685 l'édit qui révoque l'édit de Nantes." },
      { nom: "Namur", lon: 4.87, lat: 50.47, txt: "Ville des Pays-Bas espagnols assiégée en 1692 pendant la guerre de la Ligue d'Augsbourg ; Mignard y peint Louis XIV couronné par la Victoire." },
      { nom: "Lorient", lon: -3.37, lat: 47.75, txt: "Port fondé en 1666 pour servir de base à la Compagnie des Indes orientales." },
      { nom: "Saint-Germain-en-Laye", lon: 2.09, lat: 48.90, txt: "Château où la régente Anne d'Autriche s'enfuit avec le jeune Louis XIV pendant la Fronde." },
      { nom: "Languedoc", txt: "Province dont les états provinciaux négocient âprement avec le roi sur les impôts, au XVIIᵉ siècle." }
    ],
    trous: [
      { titre: "La naissance de l'État moderne", texte: "Entre le XVIᵉ et le XVIIᵉ siècle, les rois de France étendent le [domaine royal] par la [guerre], les [mariages] et la [colonisation]. L'ingénieur [Vauban] protège les frontières par une « ceinture de fer » de places fortes. Pour contrôler les provinces, le roi s'appuie sur des [intendants], chargés de la justice, de la police et des [finances]. Dès 1539, l'ordonnance de [Villers-Cotterêts] impose le [français] dans les actes de justice et d'administration." },
      { titre: "L'affirmation de l'autorité royale", texte: "Pour financer ses guerres, le roi augmente les impôts : la [capitation] est créée en 1695. [Colbert] applique le [mercantilisme] et fonde la Compagnie des Indes orientales en [1664]. En 1598, Henri IV accorde la liberté de culte aux protestants par l'édit de [Nantes] ; Louis XIV le révoque en [1685]. À [Versailles], l'[étiquette] règle la vie des courtisans : on parle d'[obéissance consentie] plutôt que de soumission." },
      { titre: "Les limites de l'autorité royale", texte: "Le roi doit respecter les [lois fondamentales] du royaume, comme la [loi salique]. Les [états provinciaux], comme ceux du Languedoc, négocient avec lui plutôt que d'obéir. En 1694, [Fénelon] critique le roi dans une lettre anonyme. De 1648 à 1652, la [Fronde] défie le pouvoir royal. Enfin, le roi dépend des [financiers] qui lui prêtent l'argent de la guerre. La notion d'[absolutisme] doit donc être fortement nuancée." }
    ],
    capable: [
      "Définir un État (territoire, population, souveraineté) et placer les repères du chapitre sur une frise.",
      "Citer les trois moyens de l'expansion du domaine royal, avec un exemple pour chacun.",
      "Expliquer comment le roi contrôle et unifie le territoire (intendants, Villers-Cotterêts, Ponts et Chaussées).",
      "Expliquer pourquoi la guerre renforce le pouvoir royal, mais coûte de plus en plus cher.",
      "Analyser une œuvre d'art comme document historique (Louis XIV devant Namur, par Mignard).",
      "Définir le mercantilisme et expliquer le rôle des compagnies de commerce.",
      "Comparer l'édit de Nantes et l'édit de Fontainebleau.",
      "Expliquer pourquoi on parle d'« obéissance consentie » de la noblesse à Versailles.",
      "Citer et expliquer cinq limites de l'autorité royale.",
      "Expliquer pourquoi les historiens nuancent la notion d'« absolutisme »."
    ],

    /* Les quatre points de passage, repris des fiches du professeur :
       « I2_Monarchie_administrative » (et son corrigé, avec les articles de l'ordonnance à projeter) ;
       « II2_Colbert_mercantilisme » (dossier PPO Colbert) ; « II3_Autorite_religieuse » (et les extraits des deux édits
       de la fiche d'origine « II. Séance 3. Autorité religieuse ») ; « II4_Versailles_noblesse ». */
    ppo: [
      {
        id: "villers", court: "PPO Villers-Cotterêts",
        titre: "1539 - L'ordonnance de Villers-Cotterêts et la construction administrative française",
        question: "En quoi l'ordonnance de Villers-Cotterêts participe-t-elle à l'unité et à la construction administrative de la France ?",
        branches: [
          { titre: "Le contexte", points: [
            "Roi depuis 1515, François Iᵉʳ veut donner une nouvelle image du roi et de la monarchie : ce sont les prémices de l'affirmation de l'État.",
            "Une ordonnance est un texte juridique à valeur de loi qui s'applique à l'ensemble du territoire.",
            "Celle de 1539 compte 192 articles : elle veut « pourvoir au bien de notre justice », abréger les procès et soulager les sujets."
          ] },
          { titre: "Une réforme de la justice", points: [
            "Les arrêts de justice doivent être écrits si clairement qu'il n'y ait « ni puisse avoir aucune ambiguïté » (art. 110).",
            "Les juges doivent traiter rapidement les procès criminels, sous peine de suspension ou de perte de leur office (art. 139)."
          ] },
          { titre: "Une réforme administrative", points: [
            "Les paroisses doivent tenir des registres des baptêmes et des sépultures, « en forme de preuve » (art. 50 et 51).",
            "Ces registres sont signés d'un notaire et déposés chaque année au greffe du bailli ou du sénéchal royal (art. 52 et 53).",
            "Ce sont les prémices de l'état civil : on veut écrire tout acte pour éviter les contestations."
          ] },
          { titre: "Une réforme linguistique", points: [
            "Les actes de justice doivent être « prononcés, enregistrés et délivrés aux parties en langage maternel français et non autrement » (art. 111).",
            "Le français remplace le latin, langue des clercs et des juristes, que beaucoup de sujets ne comprennent pas.",
            "Le royaume reçoit les mêmes règles et la même langue écrite : l'unité administrative progresse, bien avant l'unification politique complète."
          ] }
        ],
        reperes: [
          { a: 1515, date: "1515", txt: "François Iᵉʳ devient roi de France." },
          { a: 1539, date: "1539", txt: "Ordonnance de Villers-Cotterêts : le français et les registres de baptêmes." },
          { a: 1674, date: "1674", txt: "Louis XIV confie à un intendant la province de Picardie (justice, police, finances)." },
          { a: 1716, date: "1716", txt: "Création du corps des Ponts et Chaussées pour coordonner le réseau de communication." },
          { a: 1750, date: "1750", txt: "Il faut 4 jours et demi pour aller de Paris à Angers." },
          { a: 1789, date: "1789", txt: "Il ne faut plus que 2 jours pour aller de Paris à Angers." }
        ],
        notions: [
          { mot: "Ordonnance", def: "Texte juridique à valeur de loi qui s'applique à l'ensemble du territoire." },
          { mot: "Monarchie administrative", def: "Système politique dans lequel le pouvoir royal s'appuie sur une administration structurée et hiérarchisée pour gouverner l'ensemble du territoire." },
          { mot: "Centralisation", def: "Concentration des décisions entre les mains du roi et de son administration, qui les font appliquer dans tout le royaume." },
          { mot: "Intendant", def: "Haut fonctionnaire royal envoyé en province pour surveiller et faire appliquer les décisions du roi (justice, police, finances)." },
          { mot: "État civil", def: "Enregistrement officiel des naissances, des mariages et des décès ; l'ordonnance de 1539 en pose les prémices avec les registres de baptêmes et de sépultures." },
          { mot: "Bailli (ou sénéchal)", def: "Officier qui rend la justice au nom du roi dans une circonscription du royaume ; les registres paroissiaux sont déposés à son greffe." }
        ],
        personnages: [
          { nom: "François Iᵉʳ", dates: "roi de 1515 à 1547", txt: [
            "Roi de France de la Renaissance, gendre de Louis XII par son mariage avec Claude de France.",
            "Il s'emploie à donner une nouvelle image du roi et de la monarchie.",
            "En 1539, il signe une ordonnance de 192 articles qui réforme la justice et l'administration.",
            "Il impose que les actes de justice soient rédigés « en langage maternel français et non autrement »."
          ] }
        ],
        lieux: [
          { nom: "Villers-Cotterêts", lon: 3.09, lat: 49.25, txt: "Château royal où l'ordonnance est signée en 1539." },
          { nom: "Paris", lon: 2.35, lat: 48.86, txt: "Capitale du royaume, d'où partent les routes vers les villes de province." },
          { nom: "Angers", lon: -0.56, lat: 47.47, txt: "Ville reliée à Paris en 4 jours et demi en 1750, en 2 jours en 1789." },
          { nom: "Picardie", txt: "Province confiée en 1674 à un intendant, « yeux et oreilles du roi »." }
        ],
        documents: [
          { titre: "Pourquoi une ordonnance ?", source: "François Iᵉʳ, ordonnance de Villers-Cotterêts, 1539, préambule.",
            extrait: "« François, par la grâce de Dieu, roi de France, faisons savoir, à tous présents à venir, que [afin de] pourvoir au bien de notre justice, [à l']abréviation des procès, et [au] soulagement de nos sujets, avons […] statué et ordonné […] »",
            montre: "Le roi légifère seul, « par la grâce de Dieu », pour tout le royaume ; son but premier est de réformer la justice." },
          { titre: "Les registres de baptêmes", source: "François Iᵉʳ, ordonnance de Villers-Cotterêts, 1539, article 51.",
            extrait: "« Aussi sera fait registre, en forme de preuve, des baptêmes, qui contiendront le temps et l'heure de la nativité, et par l'extrait dudit registre, se pourra prouver le temps de majorité ou minorité, et sera pleine foi à cette fin. »",
            montre: "L'écrit devient une preuve officielle de l'âge : ce sont les prémices de l'état civil." },
          { titre: "Le français, langue des actes de justice", source: "François Iᵉʳ, ordonnance de Villers-Cotterêts, 1539, article 111.",
            extrait: "« Et pour ce que telles choses sont souvent advenues sur l'intelligence des mots latins contenus dans lesdits arrêts […] soient prononcés, enregistrés et délivrés aux parties en langage maternel français et non autrement. »",
            montre: "Le français remplace le latin pour que les actes soient compris et ne prêtent plus à contestation." }
        ],
        pieges: [
          "L'ordonnance ne vise pas d'abord à faire disparaître les langues régionales : elle remplace le latin, langue des clercs et des juristes, par le français dans les actes officiels.",
          "Elle ne crée pas l'état civil tel qu'on le connaît : les registres sont tenus par les paroisses (les curés) ; ce sont des prémices.",
          "Les intendants ne datent pas de 1539 : ils ne sont généralisés dans les provinces qu'au XVIIᵉ siècle."
        ],
        mots: ["François Iᵉʳ", "ordonnance", "1539", "justice", "procès", "registres de baptêmes", "état civil", "français", "latin", "unité"],
        reponse: "En 1539, François Iᵉʳ signe à Villers-Cotterêts une ordonnance de 192 articles, un texte qui a valeur de loi dans tout le royaume. Elle réforme d'abord la justice : les procès doivent être plus rapides, les arrêts écrits clairement, et les juges négligents sont menacés de sanctions. Elle réforme aussi l'administration : les paroisses doivent tenir des registres des baptêmes et des sépultures, signés d'un notaire et déposés chaque année auprès d'un officier royal ; ce sont les prémices de l'état civil. Enfin, les actes de justice doivent être rédigés « en langage maternel français et non autrement », et non plus en latin, pour éviter les contestations. En imposant les mêmes règles et la même langue écrite à tout le royaume, l'ordonnance participe à son unité et à la construction d'une monarchie administrative, que les intendants et les Ponts et Chaussées prolongent aux XVIIᵉ et XVIIIᵉ siècles.",
        trous: [
          { titre: "Le bilan", texte: "En [1539], [François Iᵉʳ] signe l'ordonnance de Villers-Cotterêts. Elle réforme la [justice] : les procès doivent être plus rapides. Elle impose aux paroisses de tenir des [registres] des baptêmes : ce sont les prémices de l'[état civil]. Elle impose enfin le [français] à la place du [latin] dans les actes de justice et d'administration. Elle participe ainsi à l'[unité] du royaume." }
        ],
        capable: [
          "Situer l'ordonnance dans le temps et dire qui la signe.",
          "Définir une ordonnance.",
          "Classer des articles de l'ordonnance selon leurs aspects judiciaires, administratifs et linguistiques.",
          "Expliquer pourquoi l'ordonnance participe à l'unité et à la construction administrative de la France.",
          "Nuancer : remplacer le latin n'est pas interdire les langues régionales."
        ]
      },
      {
        id: "colbert", court: "PPO Colbert",
        titre: "Colbert développe une politique maritime et mercantiliste, et fonde les compagnies des Indes et du Levant",
        question: "Pourquoi la monarchie crée-t-elle les compagnies des Indes et du Levant, et avec quels résultats ?",
        branches: [
          { titre: "Financer la guerre", points: [
            "Les guerres coûtent cher : la taille augmente et la capitation est créée en 1695, censée être temporaire mais maintenue.",
            "Le roi décide seul des politiques fiscales, sans plus réunir d'assemblées.",
            "Ses conseillers, Richelieu sous Louis XIII puis surtout Colbert sous Louis XIV, appliquent le mercantilisme."
          ] },
          { titre: "Le mercantilisme", points: [
            "La richesse d'un État se mesure à l'or et à l'argent qu'il possède : il faut exporter le plus possible et importer le moins possible.",
            "Colbert veut acclimater en France les meilleures industries étrangères, pour ne plus avoir à importer et pour exporter davantage.",
            "Le grand commerce avec les régions lointaines doit assurer la croissance du royaume."
          ] },
          { titre: "Les compagnies à monopole", points: [
            "1664 : la Compagnie des Indes orientales reçoit le monopole du commerce dans l'océan Indien et en Asie orientale.",
            "Il s'agit de concurrencer les Portugais, les Hollandais, les Anglais et les Danois, déjà installés aux Indes.",
            "1670 : la Compagnie du Levant doit organiser le commerce entre Marseille, Sète et les ports de l'Empire ottoman.",
            "Lorient est fondé en 1666 pour servir de base à la Compagnie des Indes orientales."
          ] },
          { titre: "Des résultats inégaux", points: [
            "La Compagnie du Levant n'établit « aucun comptoir ni magasin » et n'a « ni vaisseaux ni barques » : en 1704, le roi lui retire son privilège de transit.",
            "La Compagnie des Indes orientales connaît de graves difficultés ; elle est remplacée en 1719 par la Compagnie des Indes de John Law.",
            "La politique mercantiliste, ambitieuse, se heurte en pratique à de sérieuses difficultés : une limite de l'action de l'État."
          ] }
        ],
        reperes: [
          { a: 1664, date: "1664", txt: "Fondation de la Compagnie des Indes orientales." },
          { a: 1666, date: "1666", txt: "Fondation de Lorient, base de la Compagnie des Indes orientales." },
          { a: 1670, date: "1670", txt: "Fondation de la Compagnie du Levant." },
          { a: 1695, date: "1695", txt: "Création de la capitation, nouvel impôt pour financer la guerre." },
          { a: "1704-10-15", date: "15 octobre 1704", txt: "Un arrêt du Conseil retire à la Compagnie du Levant le transit de Marseille à Genève : elle n'a jamais établi de comptoir." },
          { a: 1719, date: "1719", txt: "La Compagnie des Indes de John Law remplace l'ancienne Compagnie des Indes orientales." }
        ],
        notions: [
          { mot: "Mercantilisme", def: "Politique économique qui consiste à faire rentrer le plus d'or et d'argent possible dans le royaume, en favorisant les exportations et en limitant les importations." },
          { mot: "Compagnie de commerce à monopole", def: "Compagnie privée à laquelle le roi accorde l'exclusivité du commerce avec une région du monde." },
          { mot: "Monopole", def: "Droit exclusif de pratiquer une activité, ici un commerce, sans concurrent." },
          { mot: "Taille", def: "Principal impôt direct du royaume." },
          { mot: "Capitation", def: "Nouvel impôt créé en 1695 pour financer la guerre ; censé être temporaire, il se maintient." },
          { mot: "Comptoir", def: "Établissement commercial (entrepôts, magasins) installé par des marchands dans un port lointain, comme Pondichéry en Inde." },
          { mot: "Échelles du Levant", def: "Ports et villes de l'Empire ottoman où commercent les marchands européens." }
        ],
        personnages: [
          { nom: "Jean-Baptiste Colbert", dates: "1619-1683", txt: [
            "L'un des principaux ministres de Louis XIV.",
            "Contrôleur général des finances et secrétaire d'État à la Marine, il contrôle la vie économique et commerciale du royaume.",
            "Il applique le mercantilisme et veut acclimater en France les meilleures industries étrangères.",
            "Il fonde la Compagnie des Indes orientales en 1664 et la Compagnie du Levant en 1670."
          ] },
          { nom: "Richelieu", dates: "1585-1642", txt: [
            "Cardinal, principal ministre de Louis XIII.",
            "Avant Colbert, il applique déjà des principes du mercantilisme."
          ] },
          { nom: "François Charpentier", dates: "1620-1702", txt: [
            "Écrivain français du XVIIᵉ siècle.",
            "En 1664, il publie un discours pour encourager la création d'une compagnie de commerce.",
            "Il présente le commerce des Indes orientales comme le plus riche du monde et s'indigne que les Français en soient absents."
          ] }
        ],
        lieux: [
          { nom: "Lorient", lon: -3.37, lat: 47.75, txt: "Port fondé en 1666 pour servir de base à la Compagnie des Indes orientales." },
          { nom: "Marseille", lon: 5.37, lat: 43.30, txt: "Grand port de Méditerranée, d'où la Compagnie du Levant doit commercer avec l'Empire ottoman." },
          { nom: "Sète", lon: 3.69, lat: 43.40, txt: "Port du Languedoc associé au commerce de la Compagnie du Levant." },
          { nom: "Pondichéry", lon: 79.81, lat: 11.94, txt: "Comptoir français en Inde, l'une des bases de la Compagnie des Indes orientales." },
          { nom: "Échelles du Levant", txt: "Ports de l'Empire ottoman où la Compagnie du Levant n'a jamais établi de comptoir." }
        ],
        documents: [
          { titre: "Commercer avec les Indes", source: "François Charpentier, Discours d'un fidèle sujet du roi, touchant l'établissement d'une compagnie française pour le commerce des Indes orientales, 1664.",
            extrait: "« Entre tous les commerces qui se font dans toutes les parties du monde, il n'y en a point de plus riche ni de plus considérable que celui des Indes Orientales. […] Pourquoi faudrait-il que les Portugais, les Hollandais, les Anglais, les Danois, allassent tous les jours dans les Indes orientales, y possédassent des magasins et des forteresses, et que les Français n'y eussent jamais ni l'un ni l'autre ? »",
            montre: "Les deux raisons de fonder la compagnie : un commerce très riche, et une rivalité avec les puissances déjà installées aux Indes." },
          { titre: "L'échec de la Compagnie du Levant", source: "Arrêt du Conseil d'État du roi, portant révocation du transit de Marseille à Genève, 15 octobre 1704.",
            extrait: "« Le transit a été accordé en premier lieu aux intéressés de la Compagnie du Levant du bureau de Paris, sous prétexte d'augmenter le commerce dans les Échelles du Levant […]. Mais […] cette prétendue Compagnie n'a jamais établi en Levant aucun comptoir ni magasin, elle n'a jamais eu ni vaisseaux ni barques. »",
            montre: "Le roi retire un privilège à une compagnie qui n'a jamais rempli sa mission : la politique de Colbert a ses limites." }
        ],
        pieges: [
          "Une compagnie de commerce n'est pas une administration royale : c'est une compagnie privée à laquelle le roi accorde un monopole.",
          "Le mercantilisme ne consiste pas à acheter beaucoup à l'étranger : il veut exporter plus qu'on importe, pour faire entrer l'or et l'argent dans le royaume.",
          "Ne pas présenter la politique de Colbert comme une réussite complète : la Compagnie du Levant n'a jamais établi de comptoir, et la Compagnie des Indes orientales connaît de graves difficultés."
        ],
        mots: ["guerre", "impôts", "mercantilisme", "or et argent", "exportations", "monopole", "Compagnie des Indes orientales", "Compagnie du Levant", "Lorient", "échec"],
        reponse: "Les guerres de Louis XIV coûtent cher : pour les financer, le roi augmente les impôts et cherche à enrichir le royaume. Colbert, l'un de ses principaux ministres, applique le mercantilisme : faire entrer le plus d'or et d'argent possible en exportant davantage et en important moins. Il fonde des compagnies de commerce privées auxquelles le roi accorde un monopole : la Compagnie des Indes orientales en 1664, pour profiter du commerce très riche des épices, de la soie et de la porcelaine, et concurrencer les Portugais, les Hollandais, les Anglais et les Danois ; puis la Compagnie du Levant en 1670, pour commercer avec l'Empire ottoman depuis Marseille et Sète. Lorient est fondé en 1666 pour servir de base à la première. Mais les résultats sont inégaux : la Compagnie du Levant n'établit jamais de comptoir, et la Compagnie des Indes orientales connaît de graves difficultés. La politique de Colbert montre à la fois l'ambition de l'État et ses limites.",
        trous: [
          { titre: "Le bilan", texte: "Pour financer ses guerres, le roi augmente les impôts : la [capitation] est créée en 1695. [Colbert] applique le [mercantilisme], qui vise à faire entrer le plus d'[or] et d'argent possible en développant les [exportations]. Il fonde des compagnies à [monopole] : la Compagnie des Indes orientales en [1664], la Compagnie du [Levant] en 1670. [Lorient] est fondé en 1666 pour servir de base à la première. Mais la Compagnie du Levant n'établit jamais de [comptoir]." }
        ],
        capable: [
          "Expliquer le lien entre le coût de la guerre et le contrôle royal de l'économie.",
          "Définir le mercantilisme et une compagnie de commerce à monopole.",
          "Donner deux raisons de la fondation de la Compagnie des Indes orientales.",
          "Expliquer l'échec de la Compagnie du Levant à partir d'un document.",
          "Situer Lorient et expliquer pourquoi ce port est fondé."
        ]
      },
      {
        id: "versailles", court: "PPO Versailles",
        titre: "Versailles, le « roi-soleil » et la société de cour",
        question: "Comment et pourquoi le roi tente-t-il de s'attacher la noblesse ?",
        branches: [
          { titre: "Un château à la gloire du roi", points: [
            "Les travaux débutent en 1661 ; la cour s'installe à Versailles en 1682.",
            "Le château est un instrument politique, conçu à la gloire de Louis XIV.",
            "Notre principale source sur la vie de cour : les Mémoires du duc de Saint-Simon, témoin direct."
          ] },
          { titre: "L'étiquette", points: [
            "La vie du roi est réglée par un emploi du temps précis, celle de la cour par des règles strictes : l'étiquette.",
            "Le roi reçoit les courtisans qu'il a choisis à son lever et à son dîner (notre déjeuner).",
            "L'après-midi, chasses et promenades ; le soir, bals et théâtre ; des courtisans sont encore admis au souper et au coucher."
          ] },
          { titre: "Pourquoi attirer les nobles ?", points: [
            "Selon Saint-Simon, pour les détacher de leurs racines et de leurs clientèles locales, où ils pourraient constituer un contre-pouvoir.",
            "À la cour, les nobles vivent dans une étroite dépendance morale et financière à l'égard du roi.",
            "Redoutant la disgrâce, ils sont prêts à tout pour lui plaire."
          ] },
          { titre: "Une obéissance consentie", points: [
            "Le roi récompense ceux qui lui plaisent : honneurs (l'ordre de Saint-Louis pour les officiers), gratifications, pensions.",
            "C'est un échange à double sens : les nobles se plient à l'étiquette, mais en attendent des contreparties.",
            "On parle donc d'obéissance consentie plutôt que de stricte soumission : la relation entre le roi et la noblesse reste négociée."
          ] }
        ],
        reperes: [
          { a: 1643, date: "1643", txt: "Louis XIV devient roi, encore enfant." },
          { a: 1661, date: "1661", txt: "Début des travaux du château de Versailles." },
          { a: "1682-05-06", date: "6 mai 1682", txt: "La cour s'installe à Versailles." },
          { a: 1693, date: "1693", txt: "Création de l'ordre de Saint-Louis, qui récompense les officiers." },
          { a: "1715-09-01", date: "1er septembre 1715", txt: "Mort de Louis XIV à Versailles." }
        ],
        notions: [
          { mot: "Cour", def: "Ensemble des personnes, nobles surtout, qui vivent auprès du roi." },
          { mot: "Courtisan", def: "Noble vivant à la cour du roi, cherchant à obtenir ses faveurs." },
          { mot: "Étiquette", def: "Ensemble des règles strictes qui organisent la vie de cour à Versailles." },
          { mot: "Clientèle", def: "Réseau de fidèles et de protégés qu'un grand noble entretient dans sa région." },
          { mot: "Disgrâce", def: "Perte de la faveur du roi : le courtisan disgracié est privé de ses faveurs et de ses récompenses." },
          { mot: "Pension", def: "Somme d'argent versée régulièrement par le roi à un noble pour le récompenser." },
          { mot: "Obéissance consentie", def: "Notion préférée par les historiens à celle de stricte soumission : les nobles obéissent au roi, mais en attendent des contreparties." }
        ],
        personnages: [
          { nom: "Louis XIV", dates: "roi de 1643 à 1715", txt: [
            "Roi de France surnommé le « roi-soleil ».",
            "Il fait construire à partir de 1661 un château conçu à sa gloire, où la cour s'installe en 1682.",
            "Sa journée, du lever au coucher, est réglée par l'étiquette, au contact permanent des courtisans.",
            "Peu avant sa mort, en 1715, il déclare : « Je m'en vais, mais l'État demeurera toujours. »"
          ] },
          { nom: "Saint-Simon", dates: "1675-1755", txt: [
            "Duc vivant à la cour de Louis XIV.",
            "Témoin direct de la vie de cour, il écrit des Mémoires, notre principale source sur Versailles.",
            "Selon lui, le roi attire les nobles à la cour pour les détacher de leurs racines et de leurs clientèles locales."
          ] }
        ],
        lieux: [
          { nom: "Versailles", lon: 2.12, lat: 48.80, txt: "Château conçu à la gloire de Louis XIV ; la cour s'y installe en 1682." },
          { nom: "Paris", lon: 2.35, lat: 48.86, txt: "Capitale du royaume, que la cour quitte pour Versailles." }
        ],
        documents: [
          { titre: "Le roi et l'État", source: "Paroles de Louis XIV à ses courtisans, quelques jours avant sa mort à Versailles, en 1715. La formule « L'État c'est moi » lui est faussement attribuée (citation apocryphe).",
            extrait: "« Je m'en vais, mais l'État demeurera toujours. »",
            montre: "Le roi distingue sa personne, mortelle, de l'État, qui lui survit : le contraire de la formule apocryphe « L'État c'est moi »." }
        ],
        pieges: [
          "Ne pas parler d'une noblesse simplement « domestiquée » : les nobles obéissent, mais en échange d'honneurs et de pensions ; c'est une obéissance consentie.",
          "« L'État c'est moi » est une citation apocryphe : Louis XIV ne l'a jamais prononcée.",
          "La cour ne s'installe pas à Versailles dès 1661 : les travaux commencent en 1661, l'installation a lieu en 1682."
        ],
        mots: ["Versailles", "1682", "gloire", "étiquette", "courtisans", "Saint-Simon", "clientèles locales", "disgrâce", "pensions", "obéissance consentie"],
        reponse: "À partir de 1661, Louis XIV fait construire à Versailles un château conçu à sa gloire, où la cour s'installe en 1682. La vie du roi et des courtisans y est réglée par l'étiquette, du lever au coucher : être admis près du roi devient une faveur. Selon le duc de Saint-Simon, témoin direct de la vie de cour, le roi attire ainsi les nobles pour les détacher de leurs racines et de leurs clientèles locales, où ils pourraient former un contre-pouvoir. À Versailles, ils vivent dans une étroite dépendance morale et financière : redoutant la disgrâce, ils sont prêts à tout pour plaire au roi. Mais celui-ci les récompense en retour par des honneurs, comme l'ordre de Saint-Louis, des gratifications et des pensions. La relation fonctionne donc dans les deux sens : plutôt qu'une stricte soumission, les historiens parlent d'une obéissance consentie de la noblesse.",
        trous: [
          { titre: "Le bilan", texte: "Le château de [Versailles], dont les travaux débutent en [1661], accueille la cour en [1682]. Selon le duc de [Saint-Simon], le roi y attire les nobles pour les détacher de leurs [clientèles] locales. Leur vie est réglée par l'[étiquette]. Redoutant la [disgrâce], les [courtisans] cherchent à plaire au roi, qui les récompense par des honneurs et des [pensions]. On parle d'[obéissance consentie]." }
        ],
        capable: [
          "Dater le chantier de Versailles et l'installation de la cour.",
          "Décrire une journée du roi réglée par l'étiquette.",
          "Expliquer, d'après Saint-Simon, pourquoi le roi attire les nobles à la cour.",
          "Citer trois façons dont le roi récompense les courtisans.",
          "Expliquer pourquoi on parle d'« obéissance consentie » plutôt que de soumission."
        ]
      },
      {
        id: "nantes", court: "PPO Édit de Nantes",
        titre: "L'Édit de Nantes et sa révocation",
        question: "Comment l'État restaure-t-il puis affirme-t-il son autorité dans le domaine religieux ?",
        branches: [
          { titre: "Les guerres de Religion", points: [
            "La Réforme protestante provoque en France huit guerres de Religion (1562-1598).",
            "François Iᵉʳ, d'abord conciliant, change d'attitude après l'affaire des Placards (1534) : les protestants sont considérés comme hérétiques.",
            "Le 24 août 1572, sur ordre de Charles IX, le massacre de la Saint-Barthélemy marque l'apogée des violences.",
            "À la mort d'Henri III (1589), le protestant Henri de Navarre devient roi : Henri IV."
          ] },
          { titre: "L'édit de Nantes (1598)", points: [
            "Henri IV accorde aux protestants la liberté de conscience et l'exercice public de leur culte, dans certains lieux.",
            "Il leur accorde des places de sûreté (La Rochelle, Montpellier…), dont le roi paie la garnison.",
            "Le catholicisme reste religion d'État ; aucune distinction entre religions pour entrer dans les écoles ou les hôpitaux.",
            "Le roi restaure la paix civile, et avec elle son autorité."
          ] },
          { titre: "La révocation (1685)", points: [
            "Par l'édit de Fontainebleau, Louis XIV révoque l'édit de Nantes, au nom du principe « un roi, une foi, une loi ».",
            "Les temples sont démolis ; les pasteurs doivent se convertir ou quitter le royaume dans les quinze jours.",
            "Les écoles protestantes sont interdites ; les enfants doivent être baptisés par les curés des paroisses."
          ] },
          { titre: "Les conséquences", points: [
            "Près de 180 000 protestants choisissent l'exil, surtout vers l'Angleterre et les Provinces-Unies ; d'autres pratiquent leur culte en secret.",
            "La colère des princes protestants européens est l'une des causes de la guerre de la Ligue d'Augsbourg (1688-1697).",
            "Le roi réaffirme son autorité religieuse et l'unité religieuse du royaume, mais la question religieuse peut aussi fragiliser son pouvoir."
          ] }
        ],
        reperes: [
          { a: 1534, date: "1534", txt: "Affaire des Placards : les protestants sont considérés comme hérétiques." },
          { a: 1562, b: 1598, date: "1562-1598", txt: "Les huit guerres de Religion." },
          { a: "1572-08-24", date: "24 août 1572", txt: "Massacre de la Saint-Barthélemy." },
          { a: 1589, date: "1589", txt: "Mort d'Henri III : Henri de Navarre devient roi (Henri IV)." },
          { a: 1598, date: "avril 1598", txt: "Édit de Nantes." },
          { a: 1610, date: "1610", txt: "Henri IV est assassiné." },
          { a: 1685, date: "octobre 1685", txt: "Édit de Fontainebleau : révocation de l'édit de Nantes." },
          { a: 1688, b: 1697, date: "1688-1697", txt: "Guerre de la Ligue d'Augsbourg, nourrie par la colère des princes protestants." }
        ],
        notions: [
          { mot: "Édit", def: "Acte législatif pris par un souverain, ayant force de loi." },
          { mot: "Révocation", def: "Annulation d'un acte juridique antérieur par l'autorité qui l'avait pris." },
          { mot: "R.P.R.", def: "« Religion prétendue réformée » : terme employé à l'époque pour désigner le protestantisme, jugé illégitime par la monarchie catholique." },
          { mot: "Hérétique", def: "Personne dont les croyances sont condamnées par l'Église comme contraires à la vraie foi." },
          { mot: "Liberté de conscience", def: "Droit de croire ce que l'on veut sans être inquiété pour sa religion." },
          { mot: "Place de sûreté", def: "Ville accordée aux protestants en 1598, avec l'édit de Nantes, où le roi finance une garnison pour les protéger." },
          { mot: "Temple", def: "Lieu de culte des protestants." },
          { mot: "Pasteur", def: "Chef religieux d'une communauté protestante ; l'édit de 1685 les appelle « ministres »." }
        ],
        personnages: [
          { nom: "Henri IV", dates: "roi de 1589 à 1610", txt: [
            "Roi de Navarre, chef protestant pendant les guerres de Religion.",
            "Son mariage avec Marguerite de Valois, en août 1572, est l'occasion du massacre de la Saint-Barthélemy.",
            "Devenu roi de France, il accorde en 1598 la liberté de culte aux protestants, tout en maintenant le catholicisme comme religion d'État.",
            "Il est assassiné en 1610."
          ] },
          { nom: "Louis XIV", dates: "roi de 1643 à 1715", txt: [
            "Petit-fils du roi qui avait mis fin aux guerres de Religion.",
            "Il veut l'unité religieuse du royaume : « un roi, une foi, une loi ».",
            "En 1685, par l'édit de Fontainebleau, il révoque l'édit de Nantes."
          ] },
          { nom: "Charles IX", dates: "roi de 1560 à 1574", txt: [
            "Roi de France pendant les guerres de Religion.",
            "Sa sœur Marguerite de Valois épouse le roi de Navarre en août 1572.",
            "Le massacre de la Saint-Barthélemy a lieu sur son ordre, le 24 août 1572."
          ] }
        ],
        lieux: [
          { nom: "Nantes", lon: -1.55, lat: 47.22, txt: "Ville où Henri IV donne l'édit d'avril 1598." },
          { nom: "Fontainebleau", lon: 2.70, lat: 48.40, txt: "Château royal où Louis XIV signe l'édit de révocation en 1685." },
          { nom: "Paris", lon: 2.35, lat: 48.86, txt: "Ville où commence le massacre de la Saint-Barthélemy, le 24 août 1572." },
          { nom: "La Rochelle", lon: -1.15, lat: 46.16, txt: "Port, l'une des places de sûreté accordées aux protestants en 1598." },
          { nom: "Montpellier", lon: 3.88, lat: 43.61, txt: "Ville, l'une des places de sûreté accordées aux protestants en 1598." }
        ],
        documents: [
          { titre: "L'édit de Nantes", source: "Henri IV, édit de Nantes, avril 1598 (extraits, langue modernisée).",
            extrait: "« VI. Avons permis et permettons à ceux de la religion prétendue réformée de vivre et demeurer partout dans notre royaume sans être vexés, brutalisés ni astreints à faire chose contre leur conscience. […] IX. Nous permettons aussi à ceux de ladite religion de continuer l'exercice public de leur religion […] XXII. Ordonnons qu'il ne sera fait ni différence, ni distinction entre les religions pour être admis dans les universités, collèges et écoles, et les malades et pauvres dans les hôpitaux et les léproseries. »",
            montre: "La liberté de conscience et de culte des protestants, et l'égalité d'accès aux écoles et aux hôpitaux : le roi rétablit la paix." },
          { titre: "L'édit de Fontainebleau", source: "Louis XIV, édit de Fontainebleau, octobre 1685 (extraits, langue modernisée).",
            extrait: "« I. Faisons savoir, que Nous […] par ce présent édit perpétuel et irrévocable, supprimé et révoqué l'édit du Roi Henri donné à Nantes au mois d'avril 1598 […]. En conséquence, nous voulons que tous les temples de ceux de la Religion Prétendue Réformée (R.P.R.) situés dans notre royaume soient incessamment démolis. […] IV. Enjoignons à tous les ministres de ladite R.P.R. [les pasteurs] qui ne voudraient pas se convertir et embrasser la Religion Catholique, Apostolique et Romaine, de sortir de notre royaume et terres de notre obéissance, quinze jours après la publication de notre présent édit […] »",
            montre: "Le roi supprime le culte protestant et chasse les pasteurs : il impose l'unité religieuse du royaume." }
        ],
        pieges: [
          "L'édit de Nantes ne crée pas l'égalité entre les deux religions : le catholicisme reste religion d'État et le culte protestant n'est permis que dans certains lieux.",
          "Ne pas confondre l'édit de Nantes (Henri IV, 1598), qui accorde la liberté de culte, et l'édit de Fontainebleau (Louis XIV, 1685), qui le révoque.",
          "La révocation ne fait pas disparaître le protestantisme : beaucoup s'exilent, d'autres pratiquent leur culte en secret."
        ],
        mots: ["guerres de Religion", "Saint-Barthélemy", "Henri IV", "1598", "liberté de conscience", "religion d'État", "Louis XIV", "1685", "révocation", "exil"],
        reponse: "Après huit guerres de Religion (1562-1598) et le massacre de la Saint-Barthélemy (1572), l'autorité royale est très affaiblie. Devenu roi en 1589, Henri IV met fin au conflit par l'édit de Nantes (1598) : il accorde aux protestants la liberté de conscience, l'exercice public de leur culte dans certains lieux et des places de sûreté, tout en maintenant le catholicisme comme religion d'État. En restaurant la paix civile, le roi restaure aussi son autorité. Près d'un siècle plus tard, Louis XIV veut l'unité religieuse du royaume, au nom du principe « un roi, une foi, une loi ». Par l'édit de Fontainebleau (1685), il révoque l'édit de Nantes : les temples sont démolis, les pasteurs doivent se convertir ou partir, les écoles protestantes sont fermées. Près de 180 000 protestants s'exilent et la colère des princes protestants nourrit la guerre de la Ligue d'Augsbourg. La religion est donc un levier de l'affirmation de l'État, mais aussi parfois de sa fragilisation.",
        trous: [
          { titre: "Le bilan", texte: "Après huit guerres de Religion et le massacre de la [Saint-Barthélemy] (1572), [Henri IV] promulgue l'édit de Nantes en [1598] : il accorde la liberté de conscience et de culte aux [protestants], tout en maintenant le [catholicisme] comme religion d'État. En [1685], Louis XIV révoque cet édit par l'édit de [Fontainebleau] : le protestantisme est interdit, les [temples] sont détruits, et près de 180 000 protestants choisissent l'[exil]." }
        ],
        capable: [
          "Rappeler le contexte des guerres de Religion (Placards, Saint-Barthélemy).",
          "Remplir un tableau comparant l'édit de Nantes et l'édit de Fontainebleau (auteur, date, décision, conséquences).",
          "Expliquer en quoi l'édit de Nantes restaure l'autorité royale.",
          "Expliquer pourquoi Louis XIV révoque l'édit de Nantes, et avec quelles conséquences.",
          "Définir édit, révocation et R.P.R."
        ]
      }
    ]
  },

  /* =====================================================================
     2nde — HISTOIRE — Thème 3, chapitre 6
     ===================================================================== */
  {
    id: "2de-h3-c6", n: "2nde", d: "histoire", carte: "atlantique-nord",
    theme: "L'État à l'époque moderne : France et Angleterre",
    rituel: "L'État à l'époque moderne : France et Angleterre",
    num: "Chapitre 6",
    titre: "Le modèle britannique et son influence",
    question: "Comment s'est construit le modèle britannique (XVIIᵉ-XVIIIᵉ siècles) et quelle a été son influence ?",
    plan: [
      "La première révolution anglaise : du conflit entre le roi et le Parlement à la République",
      "De l'Habeas Corpus au Bill of Rights : l'Angleterre devient une monarchie parlementaire",
      "Un modèle à imiter : un empire intercontinental et l'influence des idées anglaises sur les Lumières (Voltaire)",
      "De la révolution américaine à la naissance de la République des États-Unis (Washington)"
    ],
    cle: "Au XVIIᵉ siècle, le Parlement anglais impose au roi le respect des lois et des libertés : ce modèle de monarchie parlementaire inspire les philosophes des Lumières, puis les colons américains, qui le retournent contre leur métropole et fondent une république dotée d'une constitution écrite.",
    essentiel: [
      "Charles Iᵉʳ veut gouverner sans le Parlement : la guerre civile (1642-1649) conduit à son exécution en 1649 et à la proclamation de la République. Cromwell impose ensuite un pouvoir personnel et la monarchie est restaurée en 1660.",
      "Charles II puis Jacques II cherchent à renforcer leur pouvoir et favorisent les catholiques. Le Parlement vote l'Habeas Corpus (1679) contre les emprisonnements arbitraires. En 1688, la Glorieuse Révolution chasse Jacques II ; Guillaume III et Marie II acceptent le Bill of Rights (1689) : l'Angleterre devient une monarchie parlementaire, mais pas une démocratie, car le suffrage reste censitaire.",
      "Enrichie par son empire colonial et son commerce, l'Angleterre voit naître une classe moyenne ; Newton et Locke fondent les Lumières anglaises. Exilé en Angleterre de 1726 à 1728, Voltaire fait l'éloge de ses libertés dans les Lettres philosophiques et critique l'absolutisme français.",
      "Après la guerre de Sept Ans (1756-1763), le Parlement britannique taxe les treize colonies d'Amérique sans l'accord de leurs assemblées. Les colons retournent contre leur métropole les principes anglais et proclament leur indépendance le 4 juillet 1776 ; aidés par la France, ils la font reconnaître en 1783.",
      "La Constitution de 1787 crée un État fédéral fondé sur la séparation des pouvoirs ; George Washington devient le premier président des États-Unis en 1789. Mais cette république n'est pas une démocratie : suffrage censitaire, esclavage, déportation des Indiens, femmes privées de droits politiques."
    ],
    periodes: [
      { de: 1642, a: 1649, nom: "Guerre civile anglaise", court: "Guerre civile" },
      { de: 1649, a: 1660, nom: "République anglaise (Commonwealth), puis Protectorat de Cromwell", court: "République" },
      { de: 1775, a: 1783, nom: "Guerre d'indépendance américaine", court: "Indépendance" }
    ],
    reperes: [
      { a: 1642, b: 1649, date: "1642-1649", txt: "Guerre civile entre les partisans du roi et ceux du Parlement." },
      { a: "1649-01-30", date: "30 janvier 1649", txt: "Exécution de Charles Iᵉʳ ; la République est proclamée le 19 mai." },
      { a: 1660, date: "1660", txt: "Retour de la monarchie : Charles II devient roi." },
      { a: 1679, date: "1679", txt: "L'Habeas Corpus protège contre les emprisonnements arbitraires." },
      { a: 1688, date: "1688", txt: "Glorieuse Révolution : Jacques II est chassé." },
      { a: 1689, date: "1689", txt: "Bill of Rights : l'Angleterre devient une monarchie parlementaire." },
      { a: 1707, date: "1707", txt: "Acte d'Union : l'Angleterre et l'Écosse forment le royaume de Grande-Bretagne." },
      { a: 1733, b: 1734, date: "1733-1734", txt: "Publication des Lettres philosophiques de Voltaire, en anglais (1733) puis en français (1734)." },
      { a: 1763, date: "1763", txt: "Fin de la guerre de Sept Ans : victorieuse, la Grande-Bretagne prend à la France l'essentiel de ses possessions d'Amérique du Nord." },
      { a: "1776-07-04", date: "4 juillet 1776", txt: "Déclaration d'indépendance des États-Unis." },
      { a: "1787-09-17", date: "17 septembre 1787", txt: "La convention de Philadelphie adopte la Constitution des États-Unis." },
      { a: "1789-04-30", date: "30 avril 1789", txt: "George Washington prête serment comme premier président des États-Unis." }
    ],
    notions: [
      { mot: "Parlement", def: "En Angleterre, assemblée formée de la Chambre des lords et de la Chambre des communes (élue) ; il vote les lois et consent aux impôts." },
      { mot: "Bill", def: "Projet de loi, ou loi votée par le Parlement anglais." },
      { mot: "Monarchie absolue", def: "Système politique dans lequel le roi concentre à lui seul les pouvoirs exécutif, législatif et judiciaire." },
      { mot: "Régicide", def: "Le fait de tuer un roi ; l'exécution de Charles Iᵉʳ en 1649 est un régicide." },
      { mot: "Monarchie parlementaire", def: "Système politique dans lequel le pouvoir du roi est limité et contrôlé par un Parlement élu." },
      { mot: "Habeas Corpus", def: "Loi anglaise de 1679 qui protège les individus contre les emprisonnements arbitraires." },
      { mot: "Bill of Rights", def: "« Déclaration des droits » votée en 1689, qui fixe les pouvoirs respectifs du roi et du Parlement." },
      { mot: "Anglicans", def: "Fidèles de l'Église d'Angleterre, protestante, séparée de Rome au XVIᵉ siècle, et dont le roi est le chef." },
      { mot: "Empire colonial", def: "Ensemble des territoires possédés par un État hors de son territoire d'origine." },
      { mot: "Dock", def: "Bassin d'un port entouré de quais et d'entrepôts, où l'on charge et décharge les navires." },
      { mot: "Enlightenment", def: "Nom anglais du mouvement des Lumières, courant intellectuel du XVIIIᵉ siècle qui promeut la raison et les libertés." },
      { mot: "Droit naturel", def: "Ensemble de droits que tout être humain posséderait par nature, indépendamment des lois." },
      { mot: "Colonie", def: "Territoire occupé et administré par un État en dehors de ses frontières." },
      { mot: "Constitution", def: "Texte fondamental qui organise les pouvoirs d'un État." },
      { mot: "Séparation des pouvoirs", def: "Principe selon lequel les pouvoirs législatif, exécutif et judiciaire sont confiés à des institutions distinctes, qui se limitent l'une l'autre." }
    ],
    personnages: [
      { nom: "Charles Iᵉʳ", dates: "roi de 1625 à 1649", txt: [
        "Roi d'Angleterre au XVIIᵉ siècle, il veut s'affranchir du contrôle du Parlement sur les impôts.",
        "Il gouverne sans Parlement de 1629 à 1640.",
        "Vaincu dans la guerre civile, il est jugé pour trahison par une Haute Cour de Justice dont il refuse la légitimité.",
        "Il est décapité le 30 janvier 1649 à Whitehall, à Londres."
      ] },
      { nom: "Oliver Cromwell", dates: "1599-1658", txt: [
        "Gentilhomme puritain et chef militaire anglais.",
        "À la tête de la New Model Army, l'armée du Parlement, il remporte la bataille de Naseby (1645).",
        "Après l'exécution du roi, il impose un pouvoir personnel autoritaire : le Protectorat."
      ] },
      { nom: "Jacques II", dates: "roi de 1685 à 1688", txt: [
        "Frère et successeur de Charles II.",
        "Converti au catholicisme, il dispense ses partisans catholiques du serment du Test.",
        "Jugé trop autoritaire, il est chassé par la Glorieuse Révolution en 1688 et s'enfuit en France."
      ] },
      { nom: "Guillaume III", dates: "roi de 1689 à 1702", txt: [
        "Prince protestant des Provinces-Unies, plus grand adversaire de Louis XIV.",
        "En 1688, appelé par des opposants au roi catholique, il débarque en Angleterre.",
        "En 1689, avec son épouse Marie, il devient roi après avoir accepté le Bill of Rights."
      ] },
      { nom: "John Locke", dates: "1632-1704", txt: [
        "Philosophe anglais, contemporain de la Glorieuse Révolution.",
        "Il théorise l'existence d'un droit naturel pour tous les hommes.",
        "Avec Newton, il est à l'origine des Lumières anglaises (Enlightenment)."
      ] },
      { nom: "Voltaire", dates: "1694-1778", txt: [
        "Écrivain et philosophe français des Lumières.",
        "Exilé en Angleterre de 1726 à 1728, il y admire la liberté d'expression et le régime parlementaire.",
        "Dans ses Lettres philosophiques, ou Lettres anglaises, il célèbre l'Angleterre et critique l'absolutisme français."
      ] },
      { nom: "George Washington", dates: "1732-1799", txt: [
        "Chef militaire et homme politique américain du XVIIIᵉ siècle.",
        "En 1775, le Congrès lui confie le commandement de l'armée des insurgés.",
        "Il participe à la rédaction de la Constitution de 1787.",
        "Le 30 avril 1789, à New York, il prête serment comme premier président des États-Unis."
      ] }
    ],
    lieux: [
      { nom: "Londres", lon: -0.13, lat: 51.51, txt: "Capitale de l'Angleterre : Charles Iᵉʳ y est décapité à Whitehall en 1649 ; le Parlement siège à Westminster." },
      { nom: "Naseby", lon: -0.99, lat: 52.40, txt: "Lieu de la victoire décisive de Cromwell et de l'armée du Parlement sur le roi, en 1645." },
      { nom: "Écosse", txt: "Royaume dont la révolte force Charles Iᵉʳ à convoquer le Parlement en 1640 ; uni à l'Angleterre en 1707." },
      { nom: "Treize colonies", txt: "Colonies britanniques de la côte est de l'Amérique du Nord, qui proclament leur indépendance en 1776." },
      { nom: "Boston", lon: -71.06, lat: 42.36, txt: "Port où des colons jettent à la mer une cargaison de thé britannique en 1773 (Boston Tea Party)." },
      { nom: "Lexington", lon: -71.22, lat: 42.45, txt: "Village où ont lieu, avec Concord, les premiers combats de la guerre d'indépendance, en avril 1775." },
      { nom: "Philadelphie", lon: -75.17, lat: 39.95, txt: "Ville où se réunit le Congrès en 1774 et où la Constitution est adoptée en 1787." },
      { nom: "New York", lon: -74.01, lat: 40.71, txt: "Ville où George Washington prête serment comme président, le 30 avril 1789." }
    ],
    trous: [
      { titre: "La monarchie parlementaire anglaise", texte: "En [1649], le roi Charles Iᵉʳ est décapité et le Parlement proclame la [République]. La monarchie est restaurée en [1660]. En 1679, l'[Habeas Corpus] protège les sujets contre les emprisonnements [arbitraires]. En 1688, la [Glorieuse Révolution] chasse Jacques II. Guillaume III et Marie acceptent le [Bill of Rights] (1689) : l'Angleterre devient une [monarchie parlementaire], mais le suffrage reste [censitaire]." },
      { titre: "Un modèle pour les Lumières", texte: "Enrichie par son [empire colonial], l'Angleterre voit naître une [classe moyenne], qui discute de politique dans les [coffee houses]. Isaac [Newton] et John [Locke], qui théorise le [droit naturel], fondent les Lumières anglaises. Exilé en Angleterre de 1726 à 1728, [Voltaire] fait l'éloge de la [tolérance religieuse] et du régime parlementaire dans ses Lettres philosophiques." },
      { titre: "La naissance des États-Unis", texte: "Après la guerre de [Sept Ans], le Parlement britannique impose des [taxes] aux treize colonies sans leur accord. En 1773, des colons jettent du thé à la mer : c'est la [Boston Tea Party]. Le [4 juillet 1776], le Congrès adopte la Déclaration d'[indépendance]. La [Constitution] de 1787 crée un État fédéral ; George Washington devient [président] en 1789. Mais la jeune République maintient l'[esclavage]." }
    ],
    capable: [
      "Placer sur une frise les repères du chapitre, de 1649 à 1789.",
      "Expliquer pourquoi le conflit entre Charles Iᵉʳ et le Parlement aboutit à son exécution et à la République.",
      "Expliquer ce que l'Habeas Corpus et le Bill of Rights changent pour les sujets et pour le roi.",
      "Définir une monarchie parlementaire et expliquer pourquoi l'Angleterre n'est pas une démocratie.",
      "Expliquer pourquoi l'Angleterre apparaît comme un modèle économique, social et intellectuel.",
      "Comparer, avec Voltaire, la situation de la France et celle de l'Angleterre.",
      "Expliquer comment les colons américains justifient la rupture de 1776.",
      "Décrire le partage des pouvoirs dans la Constitution de 1787.",
      "Montrer les limites de la démocratie américaine à sa naissance.",
      "Analyser et confronter des documents de nature différente (texte de loi, constitution, image, carte)."
    ],

    /* Les trois points de passage, repris de la feuille de route et des séances (versions professeur) :
       « Seance2_De_lHabeas_Corpus_au_Bill_of_Rights » ; « Seance3_Un_empire_intercontinental_et_les_Lumieres » ;
       « Seance4_Une_politique_a_lorigine_de_la_revolution_americaine » et « Seance5_La_naissance_de_la_Republique_americaine ». */
    ppo: [
      {
        id: "bill", court: "PPO Bill of Rights",
        titre: "1679 et 1689 – L'Habeas Corpus et le Bill of Rights, le refus de l'arbitraire royal",
        question: "Comment l'Angleterre est-elle devenue une monarchie parlementaire ?",
        branches: [
          { titre: "La tentation absolutiste des rois restaurés", points: [
            "En 1660, la monarchie est restaurée : Charles II veut renforcer les pouvoirs de la couronne et limiter ceux du Parlement.",
            "Le Parlement est majoritairement protestant, mais les rois accordent des avantages aux catholiques.",
            "Le Bill du Test (1673) impose aux officiers du roi un serment contre l'Église romaine ; Charles II puis Jacques II en dispensent leurs partisans catholiques."
          ] },
          { titre: "L'Habeas Corpus (1679)", points: [
            "Tout prisonnier doit être présenté à un juge dans les trois jours et connaître les vraies causes de sa détention.",
            "Tout prisonnier, ou toute personne en sa faveur, peut demander une ordonnance d'Habeas Corpus.",
            "Les sujets sont protégés contre les emprisonnements arbitraires."
          ] },
          { titre: "La Glorieuse Révolution (1688-1689)", points: [
            "Jacques II, catholique, roi depuis 1685, est jugé trop autoritaire.",
            "En 1688, appelé par des opposants protestants, Guillaume d'Orange débarque en Angleterre ; Jacques II s'enfuit.",
            "En 1689, Guillaume III et Marie II deviennent roi et reine à condition d'accepter la Déclaration des droits."
          ] },
          { titre: "Le Bill of Rights, un contrat entre le roi et la nation", points: [
            "Sans le consentement du Parlement, le roi ne peut plus suspendre les lois, lever d'impôts ni entretenir une armée en temps de paix.",
            "Le Parlement doit être réuni fréquemment ; la parole y est libre ; les sujets ont le droit de pétition.",
            "En 1701, le trône est interdit aux catholiques ; en 1707, l'Acte d'Union crée le royaume de Grande-Bretagne.",
            "Ce n'est pas une démocratie : le suffrage reste censitaire et la corruption électorale est répandue."
          ] }
        ],
        reperes: [
          { a: 1660, date: "1660", txt: "Restauration : Charles II devient roi." },
          { a: 1673, date: "1673", txt: "Bill du Test : un serment contre l'Église romaine pour les officiers du roi." },
          { a: 1679, date: "1679", txt: "Habeas Corpus." },
          { a: 1685, date: "1685", txt: "Jacques II, catholique, devient roi." },
          { a: 1688, date: "1688", txt: "Glorieuse Révolution : Guillaume d'Orange débarque, Jacques II s'enfuit." },
          { a: 1689, date: "1689", txt: "Guillaume III et Marie II acceptent le Bill of Rights." },
          { a: 1701, date: "1701", txt: "Acte d'établissement (Act of Settlement) : le trône est interdit aux catholiques." },
          { a: 1707, date: "1707", txt: "Acte d'Union de l'Angleterre et de l'Écosse : le royaume de Grande-Bretagne." }
        ],
        notions: [
          { mot: "Habeas Corpus", def: "Loi anglaise de 1679 qui protège les individus contre les emprisonnements arbitraires." },
          { mot: "Bill of Rights", def: "« Déclaration des droits » votée en 1689, qui fixe les pouvoirs respectifs du roi et du Parlement." },
          { mot: "Monarchie parlementaire", def: "Système politique dans lequel le pouvoir du roi est limité et contrôlé par un Parlement élu." },
          { mot: "Arbitraire", def: "Qui dépend de la seule volonté de celui qui détient le pouvoir, sans règle ni contrôle : par exemple, emprisonner sans jugement." },
          { mot: "Glorieuse Révolution", def: "Révolution de 1688-1689 qui chasse Jacques II et donne la couronne à Guillaume III et Marie II, qui acceptent le Bill of Rights." },
          { mot: "Bill du Test", def: "Loi de 1673 qui impose aux officiers du roi un serment rejetant l'Église catholique romaine." },
          { mot: "Prérogative royale", def: "Ensemble des pouvoirs que le roi exerce seul, sans le Parlement ; le Bill of Rights la limite." },
          { mot: "Suffrage censitaire", def: "Droit de vote réservé aux plus riches, ceux qui possèdent une propriété ou paient un certain impôt." }
        ],
        personnages: [
          { nom: "Charles II", dates: "roi de 1660 à 1685", txt: [
            "Fils du roi exécuté en 1649.",
            "Il monte sur le trône en 1660, lors de la Restauration.",
            "Il cherche à renforcer les pouvoirs de la couronne et dispense des catholiques du serment du Test.",
            "Sous son règne, le Parlement vote l'Habeas Corpus (1679)."
          ] },
          { nom: "Jacques II", dates: "roi de 1685 à 1688", txt: [
            "Frère et successeur de Charles II.",
            "Catholique, il favorise ses partisans catholiques et veut renforcer le pouvoir royal.",
            "En 1688, la Glorieuse Révolution le chasse du trône."
          ] },
          { nom: "Guillaume III", dates: "roi de 1689 à 1702", txt: [
            "Prince protestant d'Orange, grand adversaire de Louis XIV.",
            "En 1688, il débarque en Angleterre à l'appel d'opposants au roi catholique.",
            "Il devient roi en 1689, avec son épouse, à condition d'accepter la Déclaration des droits."
          ] },
          { nom: "Marie II", dates: "reine de 1689 à 1694", txt: [
            "Fille protestante du roi catholique chassé en 1688.",
            "Épouse du prince d'Orange.",
            "Elle devient reine en 1689, avec son mari, après avoir accepté le Bill of Rights."
          ] }
        ],
        lieux: [
          { nom: "Westminster", lon: -0.12, lat: 51.50, txt: "Quartier de Londres où siège le Parlement (Chambre des lords et Chambre des communes)." },
          { nom: "Écosse", txt: "Royaume uni à l'Angleterre par l'Acte d'Union de 1707." }
        ],
        documents: [
          { titre: "Le Bill du Test", source: "D'après le Bill du Test, 1673 (manuel d'histoire, p. 196-197).",
            extrait: "« Je professe, témoigne et déclare de tout mon cœur, en présence de Dieu Tout-Puissant, que je ne crois point, en ma conscience, que l'Église romaine soit la seule Église catholique et universelle du Christ […] ; que je ne crois point que la Vierge Marie ou aucun autre saint, doivent être adorés ou servis […]. »",
            montre: "Le serment écarte les catholiques des fonctions publiques : les dispenses accordées par les rois inquiètent le Parlement protestant." },
          { titre: "L'Habeas Corpus", source: "L'Habeas Corpus, 1679 (manuel d'histoire, p. 197).",
            extrait: "« Sur présentation d'une ordonnance d'Habeas corpus, les officiers du roi devront, dans les trois jours, présenter le prisonnier devant le Lord chancelier ou devant les juges […] afin que les vraies causes de sa détention […] lui soient communiquées. […] Tout prisonnier peut demander une ordonnance d'Habeas corpus et toute personne pourra demander un Habeas corpus en faveur d'un prisonnier. »",
            montre: "Un prisonnier doit être présenté rapidement à un juge : la fin des emprisonnements arbitraires." },
          { titre: "Le Bill of Rights", source: "Le Bill of Rights (Déclaration des droits), 1689 (manuel d'histoire, p. 197).",
            extrait: "« Les Lords spirituels et temporels et les Communes […] déclarent […] : 1. Que le prétendu pouvoir de suspendre les lois […] par l'autorité royale, sans le consentement du Parlement, est illégal. […] 4. Que toute levée d'argent pour l'usage de la Couronne, sous prétexte de la prérogative royale, sans le consentement du Parlement, est illégale. […] 6. Que la levée et l'entretien d'une armée dans le royaume en temps de paix, sans le consentement du Parlement, est contraire aux lois. […] 13. […] il est nécessaire de réunir fréquemment le Parlement. »",
            montre: "Les lois, les impôts et l'armée passent sous le contrôle du Parlement : le roi perd son pouvoir arbitraire." }
        ],
        pieges: [
          "Le Bill of Rights n'abolit pas la monarchie : le roi gouverne toujours, mais ne peut plus suspendre les lois, lever d'impôts ni entretenir une armée en temps de paix sans le Parlement.",
          "Une monarchie parlementaire n'est pas une démocratie : le suffrage est censitaire et la corruption électorale fréquente.",
          "1707 : l'Acte d'Union crée le royaume de Grande-Bretagne ; le « Royaume-Uni » n'apparaît qu'en 1801, avec l'union de l'Irlande."
        ],
        mots: ["Restauration", "catholiques", "Habeas Corpus", "arbitraire", "Jacques II", "Glorieuse Révolution", "Guillaume III", "Bill of Rights", "Parlement", "monarchie parlementaire"],
        reponse: "Après la Restauration de 1660, Charles II puis Jacques II cherchent à renforcer le pouvoir royal et favorisent les catholiques, ce qui inquiète un Parlement majoritairement protestant. En 1679, le Parlement vote l'Habeas Corpus : tout prisonnier doit être présenté rapidement à un juge et connaître les causes de sa détention, ce qui met fin aux emprisonnements arbitraires. En 1688, Jacques II, catholique et jugé trop autoritaire, est chassé par la Glorieuse Révolution : Guillaume d'Orange et son épouse Marie deviennent roi et reine en 1689, à condition d'accepter le Bill of Rights. Ce texte est un contrat entre le roi et la nation : sans l'accord du Parlement, le roi ne peut plus suspendre les lois, lever des impôts ni entretenir une armée en temps de paix, et le Parlement doit être réuni fréquemment. L'Angleterre devient ainsi une monarchie parlementaire, qui refuse l'arbitraire royal. Mais ce n'est pas une démocratie : le suffrage reste censitaire.",
        trous: [
          { titre: "Le bilan", texte: "Après la [Restauration] de 1660, Charles II puis Jacques II favorisent les [catholiques]. En 1679, l'[Habeas Corpus] protège les sujets contre les emprisonnements [arbitraires]. En 1688, des opposants à Jacques II font appel à Guillaume d'Orange : c'est la [Glorieuse Révolution]. Guillaume III et Marie acceptent le [Bill of Rights] (1689) : le roi ne peut plus lever d'[impôts] sans l'accord du [Parlement]. L'Angleterre devient une [monarchie parlementaire]." }
        ],
        capable: [
          "Expliquer pourquoi les rois restaurés inquiètent le Parlement protestant.",
          "Dire quels droits l'Habeas Corpus donne aux prisonniers.",
          "Raconter la Glorieuse Révolution de 1688-1689.",
          "Expliquer quels pouvoirs le roi perd et quels pouvoirs le Parlement gagne avec le Bill of Rights.",
          "Définir une monarchie parlementaire et expliquer pourquoi elle n'est pas une démocratie."
        ]
      },
      {
        id: "voltaire", court: "PPO Voltaire",
        titre: "Voltaire, l'Angleterre et la publication des Lettres philosophiques ou Lettres anglaises : 1726-1733",
        question: "Pour quelles raisons l'Angleterre apparaît-elle à Voltaire comme un modèle à imiter ?",
        branches: [
          { titre: "Un modèle économique et social", points: [
            "Sortie renforcée de la guerre de Succession d'Espagne, l'Angleterre s'impose comme une puissance coloniale et commerciale (Amérique, Afrique, Asie).",
            "Le commerce colonial enrichit le pays : les exportations dépassent les importations.",
            "Londres se modernise (immeubles, quais) ; une classe moyenne apparaît, qui discute de politique dans les coffee houses."
          ] },
          { titre: "Les Lumières anglaises", points: [
            "Isaac Newton définit la science expérimentale.",
            "John Locke théorise l'existence d'un droit naturel pour tous les hommes.",
            "La liberté est au cœur du modèle politique et économique anglais."
          ] },
          { titre: "Voltaire en Angleterre", points: [
            "Exilé en Angleterre de 1726 à 1728, Voltaire admire la liberté d'expression, le régime parlementaire et la société libérale.",
            "Ses lettres sur les Anglais paraissent à Londres en 1733, puis en français en 1734 sous le titre de Lettres philosophiques.",
            "En France, le livre est condamné et brûlé en 1734 : le contraste avec la liberté anglaise est frappant."
          ] },
          { titre: "La France et l'Angleterre selon Voltaire", points: [
            "La France honore ses rois ; l'Angleterre honore ses savants, ceux qui font grandir le pays.",
            "En Angleterre, un négociant est respecté ; on y pratique la tolérance religieuse, alors qu'en France seul le catholicisme est autorisé.",
            "Les Anglais ont rompu avec la papauté et limité le pouvoir du roi ; leurs nobles paient l'impôt : pour Voltaire, les Anglais sont libres et égaux entre eux."
          ] }
        ],
        reperes: [
          { a: 1689, date: "1689", txt: "Bill of Rights : l'Angleterre devient une monarchie parlementaire." },
          { a: 1701, b: 1714, date: "1701-1714", txt: "Guerre de Succession d'Espagne, dont l'Angleterre sort renforcée." },
          { a: 1726, b: 1728, date: "1726-1728", txt: "Voltaire est exilé en Angleterre." },
          { a: 1727, date: "1727", txt: "Mort de Newton, enterré avec les honneurs à l'abbaye de Westminster." },
          { a: 1733, date: "1733", txt: "Les lettres de Voltaire sur les Anglais paraissent à Londres, en anglais." },
          { a: 1734, date: "1734", txt: "Édition française des Lettres philosophiques, condamnée et brûlée à Paris." }
        ],
        notions: [
          { mot: "Enlightenment", def: "Nom anglais du mouvement des Lumières, courant intellectuel du XVIIIᵉ siècle qui promeut la raison et les libertés." },
          { mot: "Droit naturel", def: "Ensemble de droits que tout être humain posséderait par nature, indépendamment des lois." },
          { mot: "Tolérance religieuse", def: "Fait d'accepter que plusieurs religions puissent être pratiquées dans un même État." },
          { mot: "Libéralisme", def: "Courant de pensée qui défend les libertés individuelles (d'expression, de religion, d'entreprendre) et un pouvoir limité." },
          { mot: "Classe moyenne", def: "Groupe social enrichi par le commerce et les affaires, qui dispose de loisirs et s'intéresse à la politique." },
          { mot: "Coffee house", def: "Café londonien où l'on lit les journaux et où l'on discute de politique et d'affaires." },
          { mot: "Négociant", def: "Marchand qui pratique le commerce en gros, souvent à longue distance." },
          { mot: "Empire colonial", def: "Ensemble des territoires possédés par un État hors de son territoire d'origine." }
        ],
        personnages: [
          { nom: "Voltaire", dates: "1694-1778", txt: [
            "Écrivain et philosophe français des Lumières.",
            "Exilé en Angleterre de 1726 à 1728.",
            "Il y admire la liberté d'expression, la tolérance religieuse et le régime parlementaire.",
            "Ses Lettres philosophiques, ou Lettres anglaises, opposent ce modèle à la France ; elles sont condamnées et brûlées à Paris en 1734."
          ] },
          { nom: "Isaac Newton", dates: "1643-1727", txt: [
            "Savant anglais de la fin du XVIIᵉ siècle.",
            "Il définit la science expérimentale et énonce la loi de la gravitation universelle.",
            "À sa mort, en 1727, il est enterré à l'abbaye de Westminster : Voltaire admire que l'Angleterre honore ainsi ses savants."
          ] },
          { nom: "John Locke", dates: "1632-1704", txt: [
            "Philosophe anglais, contemporain de la Glorieuse Révolution.",
            "Il théorise l'existence d'un droit naturel pour tous les hommes.",
            "Avec Newton, il est à l'origine des Lumières anglaises."
          ] }
        ],
        lieux: [
          { nom: "Londres", lon: -0.13, lat: 51.51, txt: "Capitale enrichie par le commerce, avec ses quais modernisés et ses coffee houses ; Voltaire y vit de 1726 à 1728." },
          { nom: "Paris", lon: 2.35, lat: 48.86, txt: "Ville où l'édition française des Lettres philosophiques est condamnée et brûlée en 1734." }
        ],
        documents: [
          { titre: "La France et l'Angleterre selon Voltaire", source: "Résumé d'après les Lettres philosophiques (manuel d'histoire, p. 205, doc. 5a à 5e), tableau de la séance 3.",
            extrait: "En France, on honore les rois ; en Angleterre, les savants. Un négociant anglais est respecté. Les Anglais pratiquent la tolérance religieuse, alors qu'en France seul le catholicisme est autorisé. Ils ont rompu avec la papauté et limité le pouvoir du roi. Leurs nobles paient l'impôt, alors que les nobles français ont des privilèges.",
            montre: "Pour Voltaire, l'Angleterre est libre, tolérante et respecte le mérite : un modèle opposé à la France de son temps." }
        ],
        pieges: [
          "Les Lettres philosophiques paraissent d'abord en anglais, à Londres (1733), puis en français (1734) : c'est l'édition française qui est condamnée.",
          "Voltaire ne décrit pas l'Angleterre de façon neutre : il s'en sert pour critiquer la monarchie française et l'intolérance religieuse.",
          "L'Angleterre admirée par Voltaire n'est pas une démocratie : le suffrage y reste censitaire."
        ],
        mots: ["empire colonial", "commerce", "classe moyenne", "Newton", "Locke", "droit naturel", "exil", "liberté", "tolérance religieuse", "Lettres philosophiques"],
        reponse: "Au début du XVIIIᵉ siècle, l'Angleterre apparaît comme un modèle à imiter. Sortie renforcée de la guerre de Succession d'Espagne, elle s'enrichit grâce à son empire colonial et à son commerce : Londres se modernise et une classe moyenne apparaît, qui discute de politique dans les coffee houses. C'est aussi un foyer intellectuel : Newton définit la science expérimentale et Locke théorise le droit naturel, à l'origine des Lumières anglaises. Exilé en Angleterre de 1726 à 1728, Voltaire admire la liberté d'expression, la tolérance religieuse, l'égalité devant l'impôt et le régime parlementaire. Dans ses Lettres philosophiques, publiées en anglais en 1733 puis en français en 1734, il oppose ce modèle libéral à la France : on y honore les rois plutôt que les savants, seul le catholicisme y est autorisé et les nobles y ont des privilèges. Condamné en France, le livre contribue pourtant à y diffuser l'image d'une Angleterre libre.",
        trous: [
          { titre: "Le bilan", texte: "Sortie renforcée de la guerre de Succession d'[Espagne], l'Angleterre s'enrichit grâce à son empire colonial. Une nouvelle [classe moyenne] se retrouve dans les [coffee houses]. Les travaux d'Isaac [Newton] et la philosophie de John [Locke], qui théorise le [droit naturel], fondent les Lumières anglaises. Exilé en Angleterre de [1726] à 1728, [Voltaire] admire la liberté d'expression et la [tolérance religieuse] ; il oppose ce modèle à l'absolutisme français." }
        ],
        capable: [
          "Montrer que l'Angleterre est un modèle économique et social au début du XVIIIᵉ siècle.",
          "Présenter Newton et Locke et dire ce qu'ils apportent aux Lumières.",
          "Situer le séjour de Voltaire en Angleterre et la publication des Lettres philosophiques.",
          "Comparer la France et l'Angleterre selon Voltaire sur trois points.",
          "Expliquer pourquoi Voltaire se sert de l'Angleterre pour critiquer la France."
        ]
      },
      {
        id: "washington", court: "PPO Washington",
        titre: "Washington, premier président des États-Unis d'Amérique",
        question: "Quel rôle George Washington joue-t-il dans la naissance des États-Unis, et cette jeune République est-elle démocratique ?",
        branches: [
          { titre: "La rupture avec la métropole", points: [
            "Les treize colonies sont organisées sur le modèle anglais : une assemblée élue vote les impôts.",
            "Après la guerre de Sept Ans (1756-1763), le Parlement britannique les taxe sans leur accord (Sugar Act, Stamp Act, Townshend Acts, Tea Act) : boycotts et violences.",
            "Boston Tea Party (1773), puis Congrès des colonies à Philadelphie (1774).",
            "Le 4 juillet 1776, la Déclaration d'indépendance affirme les droits naturels et le droit de renverser un gouvernement tyrannique."
          ] },
          { titre: "Le chef de guerre", points: [
            "La guerre commence à Lexington et Concord, en avril 1775.",
            "En juin 1775, le Congrès confie à George Washington le commandement de l'armée des insurgés.",
            "Aidés par la France, les insurgés obtiennent en 1783 que la Grande-Bretagne reconnaisse leur indépendance."
          ] },
          { titre: "Une constitution, un président", points: [
            "La confédération laisse trop d'autonomie aux États : Washington participe à la rédaction de la Constitution de 1787.",
            "Elle crée un État fédéral : un président détient le pouvoir exécutif, le Congrès (Chambre des représentants et Sénat) le pouvoir législatif ; aucun ne peut renverser l'autre.",
            "Le 30 avril 1789, à New York, Washington prête serment comme premier président ; il le reste jusqu'en 1797 et tient le pays à l'écart des conflits européens."
          ] },
          { titre: "Une république non démocratique", points: [
            "Le suffrage reste censitaire dans la plupart des États.",
            "L'esclavage n'est pas interdit par la Constitution et se développe dans le Sud (plantations de coton).",
            "Les Indiens sont déportés hors des zones de peuplement blanc (président Jackson, 1830) ; les femmes sont privées de droits politiques (Seneca Falls, 1848)."
          ] }
        ],
        reperes: [
          { a: 1763, date: "1763", txt: "Fin de la guerre de Sept Ans : la Grande-Bretagne victorieuse taxe ses colonies." },
          { a: "1773-12-16", date: "16 décembre 1773", txt: "Boston Tea Party." },
          { a: "1775-04-19", date: "19 avril 1775", txt: "Premiers combats à Lexington et Concord : début de la guerre d'indépendance." },
          { a: "1776-07-04", date: "4 juillet 1776", txt: "Déclaration d'indépendance." },
          { a: 1783, date: "1783", txt: "Traité de Paris : la Grande-Bretagne reconnaît l'indépendance des États-Unis." },
          { a: "1787-09-17", date: "17 septembre 1787", txt: "Adoption de la Constitution par la convention de Philadelphie." },
          { a: "1789-04-30", date: "30 avril 1789", txt: "Washington prête serment comme premier président." },
          { a: 1797, date: "1797", txt: "Washington quitte la présidence après deux mandats." }
        ],
        notions: [
          { mot: "Congrès", def: "Assemblée réunissant les représentants des treize colonies ; après 1787, il détient le pouvoir législatif (Chambre des représentants et Sénat)." },
          { mot: "Déclaration d'indépendance", def: "Texte du 4 juillet 1776 par lequel les colonies américaines rompent avec la couronne britannique." },
          { mot: "Patriote", def: "Nom donné aux insurgés américains partisans de l'indépendance." },
          { mot: "Confédération", def: "Union d'États qui conservent une large autonomie." },
          { mot: "État fédéral", def: "État dans lequel le pouvoir est partagé entre un gouvernement central et des États fédérés qui gardent une large autonomie." },
          { mot: "Constitution", def: "Texte fondamental qui organise les pouvoirs d'un État." },
          { mot: "Amendement", def: "Modification ou ajout apporté à une constitution ou à un projet de loi." },
          { mot: "Esclavage", def: "Condition d'une personne privée de liberté, possédée et exploitée par un maître." }
        ],
        personnages: [
          { nom: "George Washington", dates: "1732-1799", txt: [
            "Chef militaire et homme politique américain du XVIIIᵉ siècle.",
            "En juin 1775, le Congrès lui confie le commandement de l'armée des insurgés.",
            "Il participe à la rédaction de la Constitution de 1787.",
            "Le 30 avril 1789, à New York, il prête serment comme premier président des États-Unis."
          ] },
          { nom: "Andrew Jackson", dates: "1767-1845", txt: [
            "Président des États-Unis de 1829 à 1837.",
            "En 1830, il défend devant le Congrès le déplacement forcé des Indiens hors des zones de peuplement blanc."
          ] }
        ],
        lieux: [
          { nom: "Boston", lon: -71.06, lat: 42.36, txt: "Port où des colons jettent à la mer une cargaison de thé britannique en 1773." },
          { nom: "Lexington", lon: -71.22, lat: 42.45, txt: "Village du Massachusetts où ont lieu, avec Concord, les premiers combats de la guerre d'indépendance (avril 1775)." },
          { nom: "Philadelphie", lon: -75.17, lat: 39.95, txt: "Ville du Congrès (1774, 1776) et de la convention qui adopte la Constitution (1787)." },
          { nom: "New York", lon: -74.01, lat: 40.71, txt: "Ville où Washington prête serment, au Federal Hall, le 30 avril 1789." },
          { nom: "Seneca Falls", lon: -76.80, lat: 42.91, txt: "Ville de l'État de New York où une déclaration dénonce en 1848 la privation des droits des femmes." }
        ],
        documents: [
          { titre: "Les droits naturels et le droit de révolte", source: "Extraits de la Déclaration d'indépendance des États-Unis, 4 juillet 1776 (manuel d'histoire, p. 210).",
            extrait: "« Nous tenons pour évidentes ces vérités : que tous les hommes naissent égaux ; que leur Créateur les a dotés de certains droits inaliénables, parmi lesquels la vie, la liberté et la recherche du bonheur ; que pour garantir ces droits, les hommes instituent des gouvernements dont le juste pouvoir émane du consentement des gouvernés ; que si un gouvernement vient à méconnaître ces fins, le peuple a le droit de le modifier ou de l'abolir […]. »",
            montre: "Les colons fondent la rupture sur le droit naturel et le consentement des gouvernés : des idées venues d'Angleterre et des Lumières." },
          { titre: "Les griefs contre le roi et la rupture", source: "Extraits de la Déclaration d'indépendance des États-Unis, 4 juillet 1776 (manuel d'histoire, p. 210).",
            extrait: "« Ce gouvernement nous a soumis à une juridiction étrangère à notre constitution […] et a : autorisé le cantonnement sur notre sol de troupes en nombre important ; étouffé notre commerce avec toutes les parties du monde ; imposé des taxes sans notre consentement […]. En conséquence, Nous, représentants des États-Unis d'Amérique, réunis en Congrès […] affirmons et déclarons solennellement que ces Colonies unies doivent être en droit des États libres et indépendants […]. »",
            montre: "Les colons retournent contre leur métropole le principe anglais : pas d'impôt sans consentement." },
          { titre: "Le serment du président", source: "Serment d'investiture du président, Constitution de 1787, article II, section 1 ; prononcé par George Washington le 30 avril 1789.",
            extrait: "« Je jure solennellement de remplir fidèlement les fonctions de Président des États-Unis et, dans toute la mesure de mes moyens, de sauvegarder, protéger et défendre la Constitution des États-Unis. »",
            montre: "Le président est soumis à une constitution écrite, qu'il jure de défendre." }
        ],
        pieges: [
          "La guerre d'indépendance commence à Lexington et Concord (avril 1775), avant que Washington ne reçoive le commandement de l'armée (juin 1775).",
          "Ne pas confondre la Déclaration d'indépendance (1776), qui justifie la rupture, et la Constitution (1787), qui organise les pouvoirs.",
          "La jeune République n'est pas une démocratie : suffrage censitaire, esclavage, Indiens déportés, femmes sans droits politiques."
        ],
        mots: ["taxes", "consentement", "Déclaration d'indépendance", "droits naturels", "Washington", "Constitution", "État fédéral", "président", "esclavage", "suffrage censitaire"],
        reponse: "Après la guerre de Sept Ans, le Parlement britannique taxe les treize colonies sans l'accord de leurs assemblées. Les colons retournent contre leur métropole le principe anglais du consentement à l'impôt : le 4 juillet 1776, la Déclaration d'indépendance affirme que les hommes ont des droits naturels et que le peuple peut renverser un gouvernement tyrannique. George Washington commande l'armée des insurgés à partir de 1775 ; aidés par la France, ils obtiennent la reconnaissance de leur indépendance en 1783. Washington participe ensuite à la rédaction de la Constitution de 1787, qui crée un État fédéral : un président détient le pouvoir exécutif, le Congrès le pouvoir législatif, et aucun ne peut renverser l'autre. En 1789, il devient le premier président des États-Unis. Mais cette République n'est pas une démocratie : le suffrage reste censitaire, l'esclavage est maintenu, les Indiens sont chassés de leurs terres et les femmes sont privées de droits politiques.",
        trous: [
          { titre: "Le bilan", texte: "Après la guerre d'indépendance, la [confédération] est jugée trop faible. George Washington participe à la rédaction de la [Constitution] de 1787, qui crée un État [fédéral] : un [président] détient le pouvoir exécutif, le [Congrès] le pouvoir législatif. Washington devient premier président en [1789]. Mais le suffrage reste [censitaire], l'[esclavage] se développe dans le Sud, les Indiens sont déportés et les [femmes] restent privées de droits politiques." }
        ],
        capable: [
          "Expliquer pourquoi les colons contestent les taxes du Parlement britannique.",
          "Expliquer, à partir de la Déclaration de 1776, comment est justifiée la rupture avec la Grande-Bretagne.",
          "Présenter le rôle de Washington, du commandement de l'armée à la présidence.",
          "Décrire le partage des pouvoirs dans la Constitution de 1787 et l'influence du modèle anglais.",
          "Citer quatre limites de la démocratie américaine à sa naissance."
        ]
      }
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
  },

  /* =====================================================================
     1ère — HISTOIRE — Thème 2, chapitre 3
     ===================================================================== */
  {
    id: "1re-h2-c3", n: "1ere", d: "histoire", carte: "france",
    theme: "La France dans l'Europe des nationalités : politique et société (1848-1871)",
    rituel: "La France dans l'Europe des nationalités (1848-1871)",
    num: "Chapitre 3",
    titre: "La difficile entrée dans l'âge démocratique : la Deuxième République et le Second Empire",
    question: "Pourquoi l'instauration du suffrage universel masculin en 1848 ne suffit-elle pas à trancher la question du régime politique ouverte depuis 1789 ?",
    plan: [
      "La naissance de la Deuxième République, février-avril 1848 (Alphonse de Lamartine en 1848)",
      "L'échec du projet républicain, 1848-1852 (George Sand ; Louis-Napoléon Bonaparte, premier président de la République)",
      "Le Second Empire, 1852-1870 : un régime autoritaire appuyé sur le suffrage universel"
    ],
    cle: "Le suffrage universel masculin, conquis en 1848, ne tranche pas la question du régime : les électeurs portent au pouvoir Louis-Napoléon Bonaparte, qui met fin à la République et fonde un Empire plébiscité. De 1848 à 1870, la France a le suffrage universel sans la République.",
    essentiel: [
      "En février 1848, une révolution renverse Louis-Philippe. Le gouvernement provisoire est partagé entre deux conceptions de la République : la République libérale des modérés (drapeau tricolore) et la République sociale des ouvriers parisiens (drapeau rouge). Le 25 février, Lamartine refuse le drapeau rouge.",
      "Le gouvernement provisoire concrétise les idéaux démocratiques hérités de la Révolution : libertés de la presse et de réunion, suffrage universel masculin (5 mars), abolition de l'esclavage (27 avril), droit au travail et ateliers nationaux. Mais les femmes restent exclues du vote.",
      "Le projet républicain échoue en raison de trois tensions : les campagnes se méfient d'une République qui augmente les impôts ; la bourgeoisie s'oppose au monde ouvrier (fermeture des ateliers nationaux, journées de Juin écrasées par l'armée) ; les conservateurs du parti de l'Ordre l'emportent sur les républicains et restreignent le suffrage (loi du 31 mai 1850).",
      "Élu président le 10 décembre 1848 grâce à son nom et au vote paysan, Louis-Napoléon Bonaparte entre en conflit avec l'Assemblée. Par le coup d'État du 2 décembre 1851, il la dissout, rétablit le suffrage universel et se fait approuver par plébiscite ; l'Empire est proclamé le 2 décembre 1852.",
      "Le Second Empire est un régime autoritaire : pouvoir personnel de Napoléon III, candidature officielle, presse surveillée, opposants proscrits comme Victor Hugo. Il s'appuie pourtant sur le suffrage universel masculin, consulté par plébiscite : c'est le césarisme. Il renforce l'État, favorise la prospérité économique et mène une politique de grandeur nationale.",
      "Dans les années 1860, le régime se libéralise lentement : c'est l'Empire libéral. Il s'effondre après la défaite de Sedan face à la Prusse : la République est proclamée le 4 septembre 1870."
    ],
    periodes: [
      { de: "1848-02-24", a: "1852-12-02", nom: "Deuxième République", court: "IIᵉ République", detail: "Suffrage universel masculin : environ 9 millions d'électeurs. Constitution du 4 novembre 1848 : un président et une Assemblée élus au suffrage universel masculin." },
      { de: "1852-12-02", a: "1860-11-24", nom: "Second Empire autoritaire", court: "Empire autoritaire", detail: "Napoléon III gouverne seul (Constitution de 1852) : candidature officielle, presse surveillée, opposants proscrits ; le peuple est consulté par plébiscite." },
      { de: "1860-11-24", a: "1870-09-04", nom: "Second Empire libéral", court: "Empire libéral", detail: "Réformes des années 1860 : droit d'adresse des assemblées (1860), droit de grève (1864), lois sur la presse et les réunions publiques (1868) ; plébiscite du 8 mai 1870." }
    ],
    reperes: [
      { a: "1848-02-22", b: "1848-02-25", date: "22-25 février 1848", txt: "Révolution de février : Louis-Philippe abdique, un gouvernement provisoire proclame la République." },
      { a: "1848-03-05", date: "5 mars 1848", txt: "Décret instaurant le suffrage universel masculin." },
      { a: "1848-04-27", date: "27 avril 1848", txt: "Décret d'abolition de l'esclavage dans les colonies françaises." },
      { a: "1848-06-23", b: "1848-06-26", date: "23-26 juin 1848", txt: "Journées de Juin : l'insurrection ouvrière qui suit la fermeture des ateliers nationaux est écrasée par l'armée du général Cavaignac." },
      { a: "1848-11-04", date: "4 novembre 1848", txt: "Constitution de la IIᵉ République : un président et une Assemblée élus au suffrage universel masculin." },
      { a: "1848-12-10", date: "10 décembre 1848", txt: "Louis-Napoléon Bonaparte est élu président de la République avec environ 74 % des voix." },
      { a: "1850-05-31", date: "31 mai 1850", txt: "Loi électorale : environ 3 millions d'électeurs, surtout ouvriers, perdent le droit de vote." },
      { a: "1851-12-02", date: "2 décembre 1851", txt: "Coup d'État de Louis-Napoléon Bonaparte, approuvé par le plébiscite des 20 et 21 décembre." },
      { a: "1852-12-02", date: "2 décembre 1852", txt: "Proclamation du Second Empire : Louis-Napoléon Bonaparte devient Napoléon III." },
      { a: 1860, b: 1870, date: "années 1860", txt: "Lente libéralisation du régime : c'est l'Empire libéral." },
      { a: "1870-05-08", date: "8 mai 1870", txt: "Dernier plébiscite : 7,35 millions de « oui » approuvent les réformes libérales." },
      { a: "1870-09-04", date: "4 septembre 1870", txt: "Après la défaite de Sedan, la République est proclamée à l'Hôtel de Ville de Paris." }
    ],
    notions: [
      { mot: "Suffrage universel masculin", def: "Droit de vote accordé à tous les hommes majeurs, sans condition de fortune : en 1848, à tous les Français de 21 ans résidant depuis six mois dans leur commune. Les femmes en restent exclues." },
      { mot: "Gouvernement provisoire", def: "Gouvernement formé le 24 février 1848, après la chute de Louis-Philippe, pour diriger le pays jusqu'à l'élection d'une Assemblée constituante ; il réunit des républicains modérés (Lamartine) et des socialistes (Louis Blanc)." },
      { mot: "République sociale", def: "Conception de la République défendue par les socialistes et les ouvriers parisiens (drapeau rouge) : elle doit aussi améliorer le sort des travailleurs. Elle s'oppose à la République libérale des modérés (drapeau tricolore), qui s'en tient aux libertés et au suffrage." },
      { mot: "Ateliers nationaux", def: "Chantiers publics créés fin février 1848 pour donner du travail aux chômeurs, payés par l'État ; jugés trop coûteux par les conservateurs, ils sont fermés en juin 1848, ce qui provoque les journées de Juin." },
      { mot: "Abolition de l'esclavage", def: "Suppression de l'esclavage dans les colonies françaises par le décret du 27 avril 1848, préparé par Victor Schœlcher, au nom de la devise « Liberté, Égalité, Fraternité »." },
      { mot: "Parti de l'Ordre", def: "Rassemblement des conservateurs, surtout monarchistes, qui veulent défendre l'ordre, la propriété et la religion contre les « rouges » ; il domine l'Assemblée législative élue en mai 1849." },
      { mot: "Journées de Juin", def: "Insurrection des ouvriers parisiens du 23 au 26 juin 1848, après la fermeture des ateliers nationaux ; écrasée par l'armée du général Cavaignac, elle marque la rupture entre la République et le monde ouvrier." },
      { mot: "Coup d'État", def: "Prise ou maintien du pouvoir par la force, en violation de la Constitution : le 2 décembre 1851, le président Louis-Napoléon Bonaparte dissout l'Assemblée." },
      { mot: "Plébiscite", def: "Vote par lequel les citoyens répondent par oui ou par non à une question posée par le chef de l'État : on approuve un homme et sa politique, on ne désigne pas de représentants." },
      { mot: "Césarisme", def: "Régime dans lequel un homme seul exerce un pouvoir personnel et autoritaire tout en s'appuyant sur le peuple, consulté directement par plébiscite." },
      { mot: "Régime autoritaire", def: "Régime où le pouvoir est concentré entre les mains d'un chef qui limite les libertés (presse, réunion) et réprime les opposants, même s'il fait voter les citoyens." },
      { mot: "Candidature officielle", def: "Pratique du Second Empire : aux élections du Corps législatif, le gouvernement désigne dans chaque circonscription le candidat qu'il soutient, avec l'aide des préfets et des maires." },
      { mot: "Empire libéral", def: "Nom donné au Second Empire des années 1860 : l'empereur accorde peu à peu plus de pouvoirs aux assemblées et plus de libertés (presse, réunion, droit de grève)." },
      { mot: "Proscription", def: "Bannissement d'opposants politiques hors du territoire, par décision du pouvoir : après le coup d'État de 1851, Victor Hugo et de nombreux républicains sont proscrits." }
    ],
    personnages: [
      { nom: "Alphonse de Lamartine", dates: "1790-1869", txt: [
        "Poète romantique, auteur des Méditations poétiques, devenu député sous la monarchie de Juillet.",
        "En février 1848, il entre au gouvernement provisoire comme ministre des Affaires étrangères.",
        "Le 25 février 1848, devant l'Hôtel de Ville, il refuse le drapeau rouge et défend le drapeau tricolore.",
        "Héros de février, il n'obtient qu'environ 18 000 voix à l'élection présidentielle de décembre 1848."
      ] },
      { nom: "Alexandre Ledru-Rollin", dates: "1807-1874", txt: [
        "Avocat et député républicain sous la monarchie de Juillet, il défend le suffrage universel.",
        "Ministre de l'Intérieur du gouvernement provisoire en 1848, il organise les élections d'avril.",
        "Candidat « démocrate-socialiste » à l'élection présidentielle de décembre 1848, il obtient 370 119 voix.",
        "Après l'échec d'une manifestation, le 13 juin 1849, il s'exile en Angleterre jusqu'en 1870."
      ] },
      { nom: "Louis Blanc", dates: "1811-1882", txt: [
        "Journaliste et théoricien socialiste, auteur de L'Organisation du travail (1839).",
        "Membre du gouvernement provisoire en 1848, il défend le droit au travail.",
        "Il préside la commission du Luxembourg, chargée d'étudier la condition des ouvriers.",
        "Après les journées de Juin, il doit s'exiler en Angleterre."
      ] },
      { nom: "Victor Schœlcher", dates: "1804-1893", txt: [
        "Journaliste et militant abolitionniste, il a voyagé aux Antilles.",
        "Sous-secrétaire d'État à la Marine et aux Colonies du gouvernement provisoire en 1848.",
        "Il prépare le décret du 27 avril 1848 qui abolit l'esclavage dans les colonies françaises."
      ] },
      { nom: "George Sand", dates: "1804-1876", txt: [
        "Romancière célèbre, elle signe ses livres d'un pseudonyme masculin.",
        "Proche du ministre de l'Intérieur en 1848, elle rédige des circulaires et des Bulletins de la République.",
        "Depuis sa maison de Nohant, dans l'Indre, elle décrit la méfiance des paysans envers la République.",
        "En janvier 1852, elle écrit au prince-président pour défendre ses amis républicains emprisonnés ou exilés."
      ] },
      { nom: "Louis-Eugène Cavaignac", dates: "1802-1857", txt: [
        "Général républicain, qui a fait carrière en Algérie.",
        "Ministre de la Guerre, il reçoit les pleins pouvoirs pendant les journées de Juin 1848 et écrase l'insurrection ouvrière.",
        "Chef du pouvoir exécutif jusqu'en décembre 1848, il est le candidat des républicains modérés à l'élection présidentielle.",
        "Le 10 décembre 1848, il est battu avec 1 448 107 voix."
      ] },
      { nom: "Louis-Napoléon Bonaparte", dates: "1808-1873", txt: [
        "Neveu de Napoléon Iᵉʳ, il tente deux fois de renverser la monarchie de Juillet (1836 et 1840).",
        "Le 10 décembre 1848, il est élu président de la République avec environ 74 % des voix.",
        "Le 2 décembre 1851, il dissout l'Assemblée par un coup d'État.",
        "Proclamé empereur le 2 décembre 1852, il règne jusqu'à la défaite de Sedan, en 1870."
      ] },
      { nom: "Victor Hugo", dates: "1802-1885", txt: [
        "Poète et romancier romantique, élu député en 1848.",
        "Opposant au coup d'État du 2 décembre 1851, il est proscrit : Bruxelles, Jersey, puis Guernesey.",
        "Il refuse l'amnistie de 1859 et ne rentre en France qu'à la chute de l'Empire, en 1870.",
        "En exil, il publie Les Châtiments (1853) contre celui qu'il surnomme « Napoléon le Petit »."
      ] }
    ],
    lieux: [
      { nom: "Hôtel de Ville de Paris", lon: 2.35, lat: 48.86, txt: "Siège du gouvernement provisoire en février 1848 ; Lamartine y refuse le drapeau rouge le 25 février ; la République y est proclamée le 4 septembre 1870." },
      { nom: "Faubourg Saint-Antoine", lon: 2.38, lat: 48.85, txt: "Quartier ouvrier de l'est de Paris, l'un des principaux foyers des barricades des journées de Juin 1848." },
      { nom: "Nohant", lon: 1.97, lat: 46.63, txt: "Village du Berry (Indre) où vit George Sand ; elle y observe la méfiance des paysans envers la République." },
      { nom: "Bruxelles", lon: 4.35, lat: 50.85, txt: "Première étape de l'exil de Victor Hugo après le coup d'État, en décembre 1851." },
      { nom: "Jersey", lon: -2.11, lat: 49.19, txt: "Île anglo-normande où Victor Hugo vit en exil de 1852 à 1855 et écrit Les Châtiments." },
      { nom: "Guernesey", lon: -2.54, lat: 49.46, txt: "Île anglo-normande où Victor Hugo vit en exil de 1855 à 1870." },
      { nom: "Sedan", lon: 4.94, lat: 49.7, txt: "Ville des Ardennes où Napoléon III, vaincu par les Prussiens, capitule le 2 septembre 1870 : l'Empire s'effondre." },
      { nom: "Colonies françaises", txt: "Antilles, Guyane, La Réunion, Sénégal : l'esclavage y est aboli par le décret du 27 avril 1848." }
    ],
    trous: [
      { titre: "Février-avril 1848 : la naissance de la République", texte: "En février 1848, une révolution renverse Louis-Philippe. Le [gouvernement provisoire] est partagé entre deux conceptions de la République : la République [libérale] des modérés, symbolisée par le drapeau [tricolore], et la République [sociale] des ouvriers parisiens, symbolisée par le drapeau [rouge]. Il instaure le [suffrage universel masculin] le 5 mars et abolit l'[esclavage] le 27 avril. Il proclame le [droit au travail] et crée les [ateliers nationaux] pour les chômeurs. Mais les femmes restent exclues du vote." },
      { titre: "1848-1852 : l'échec du projet républicain", texte: "La République se heurte vite à trois tensions. Les [campagnes] se méfient d'un régime qui augmente les impôts. En juin 1848, la fermeture des ateliers nationaux provoque les [journées de Juin], écrasées par l'armée : la [bourgeoisie] l'emporte sur le monde ouvrier. Le 10 décembre 1848, [Louis-Napoléon Bonaparte] est élu président. L'Assemblée, dominée par le [parti de l'Ordre], restreint le suffrage par la loi du [31 mai 1850]. Le 2 décembre 1851, le président dissout l'Assemblée par un [coup d'État], approuvé par [plébiscite] ; un an plus tard, il devient l'empereur [Napoléon III]." },
      { titre: "1852-1870 : un Empire plébiscité", texte: "Le Second Empire est un [régime autoritaire] : l'empereur a seul l'initiative des lois et les ministres ne dépendent que de lui. Aux élections, le gouvernement soutient la [candidature officielle] de ses partisans. Pourtant, le régime s'appuie sur le [suffrage universel] masculin et consulte directement le peuple par [plébiscite] : c'est le [césarisme]. Les opposants sont réprimés : [Victor Hugo], frappé de [proscription], vit en exil jusqu'en 1870. Dans les années 1860, le régime se libéralise : c'est l'[Empire libéral]. Après la défaite de Sedan, la République est proclamée le [4 septembre 1870]." }
    ],
    capable: [
      "Situer les repères du chapitre et définir ses notions (suffrage universel masculin, plébiscite, césarisme…).",
      "Expliquer les deux conceptions de la République qui s'opposent en février 1848 (drapeau tricolore / drapeau rouge).",
      "Citer trois mesures du gouvernement provisoire et dire pour chacune si elle relève de la liberté, de l'égalité ou de la fraternité.",
      "Expliquer en quelques lignes pourquoi la République échoue (villes / campagnes, bourgeois / ouvriers, conservateurs / républicains).",
      "Raconter comment Louis-Napoléon Bonaparte passe de président élu à empereur (1848-1852).",
      "Montrer que le Second Empire est un régime autoritaire qui s'appuie pourtant sur le suffrage universel.",
      "Mettre une figure historique en perspective : Lamartine, George Sand, Louis-Napoléon Bonaparte.",
      "Analyser une peinture d'histoire et confronter deux documents.",
      "Lire un texte constitutionnel et un graphique électoral.",
      "Répondre à la problématique : pourquoi le suffrage universel masculin ne suffit pas à trancher la question du régime."
    ],

    /* Les trois points de passage, repris de la fiche séquence, de la fiche objectifs et des fiches d'activité Canva :
       « I. A PPO Lamartine en 1848 » (et « I. B Les décrets de 1848 ») ; « II. A-C PPO George Sand » ;
       « II. D PPO Louis-Napoléon Bonaparte » (et « III. Le Second Empire, un pouvoir plébiscité »). */
    ppo: [
      {
        id: "lamartine", court: "PPO Lamartine",
        titre: "Alphonse de Lamartine en 1848",
        question: "Pourquoi, en refusant le drapeau rouge le 25 février 1848, Lamartine fait-il un choix de République ?",
        branches: [
          { titre: "Un poète au pouvoir", points: [
            "Poète romantique (Méditations poétiques, 1820), député depuis 1833, auteur d'une Histoire des Girondins (1847).",
            "Après la révolution de février, il entre au gouvernement provisoire comme ministre des Affaires étrangères ; il en est la figure la plus populaire."
          ] },
          { titre: "25 février 1848 : deux drapeaux, deux Républiques", points: [
            "Devant l'Hôtel de Ville, une délégation armée d'ouvriers réclame le drapeau rouge, « symbole de nos misères et de la rupture avec le passé » : elle veut une République sociale.",
            "Lamartine refuse : le drapeau tricolore « a fait le tour du monde, avec la République et l'Empire » ; il veut une République libérale, fondée sur le consentement des « trente-cinq millions » de Français et non sur la pression du peuple de Paris.",
            "Le gouvernement provisoire, dominé par les républicains modérés, doit pourtant répondre aux attentes des révolutionnaires parisiens."
          ] },
          { titre: "Les mesures du gouvernement provisoire", points: [
            "Liberté : liberté de la presse et de réunion, abolition de la peine de mort en matière politique.",
            "Égalité : suffrage universel masculin (5 mars), abolition de l'esclavage (27 avril).",
            "Fraternité : droit au travail (25 février), ateliers nationaux pour les chômeurs, journée de travail réduite d'une heure (10 heures à Paris, 11 en province).",
            "Limites : les femmes restent exclues du vote ; pour faire face à la crise, le gouvernement augmente les impôts, ce qui mécontente les campagnes."
          ] },
          { titre: "De la gloire à l'échec", points: [
            "Le 23 avril 1848, les premières élections au suffrage universel masculin donnent une Assemblée modérée ; Lamartine est élu dans dix départements.",
            "Membre de la Commission exécutive, il est emporté par la crise des journées de Juin.",
            "Le 10 décembre 1848, il n'obtient qu'environ 18 000 voix à l'élection présidentielle.",
            "En 1849, son Histoire de la révolution de 1848 réécrit la scène du drapeau : un récit à confronter aux autres témoins."
          ] }
        ],
        reperes: [
          { a: "1848-02-24", date: "24 février 1848", txt: "Abdication de Louis-Philippe ; un gouvernement provisoire, dont Lamartine fait partie, proclame la République." },
          { a: "1848-02-25", date: "25 février 1848", txt: "Devant l'Hôtel de Ville, Lamartine refuse le drapeau rouge ; décret sur le droit au travail." },
          { a: "1848-03-05", date: "5 mars 1848", txt: "Décret instaurant le suffrage universel masculin." },
          { a: "1848-04-23", date: "23 avril 1848", txt: "Élection de l'Assemblée constituante ; Lamartine est élu dans dix départements." },
          { a: "1848-04-27", date: "27 avril 1848", txt: "Décret d'abolition de l'esclavage." },
          { a: "1848-06-23", b: "1848-06-26", date: "23-26 juin 1848", txt: "Journées de Juin : la Commission exécutive, dont Lamartine est membre, s'efface devant le général Cavaignac." },
          { a: "1848-12-10", date: "10 décembre 1848", txt: "Élection présidentielle : environ 18 000 voix pour Lamartine." },
          { a: 1849, date: "1849", txt: "Lamartine publie son Histoire de la révolution de 1848." }
        ],
        notions: [
          { mot: "Gouvernement provisoire", def: "Gouvernement formé le 24 février 1848 pour diriger le pays jusqu'à l'élection d'une Assemblée constituante ; dominé par les républicains modérés, il compte aussi des socialistes." },
          { mot: "République libérale", def: "Conception des républicains modérés, symbolisée par le drapeau tricolore : la République garantit les libertés et le suffrage universel, sans bouleverser l'ordre social." },
          { mot: "République sociale", def: "Conception des socialistes et des ouvriers parisiens, symbolisée par le drapeau rouge : la République doit aussi changer le sort des travailleurs (droit au travail, association)." },
          { mot: "Droit au travail", def: "Engagement pris par le gouvernement provisoire le 25 février 1848 de « garantir du travail à tous les citoyens »." },
          { mot: "Ateliers nationaux", def: "Chantiers publics créés fin février 1848 pour donner du travail aux chômeurs, payés par l'État ; ils sont fermés en juin 1848." },
          { mot: "Peinture d'histoire", def: "Grand tableau qui met en scène un événement historique : c'est une reconstitution composée après coup, pas une photographie, qu'il faut confronter à d'autres sources." }
        ],
        personnages: [
          { nom: "Alphonse de Lamartine", dates: "1790-1869", txt: [
            "Poète romantique, député sous la monarchie de Juillet.",
            "Ministre des Affaires étrangères du gouvernement provisoire en 1848.",
            "Le 25 février 1848, devant l'Hôtel de Ville, il refuse le drapeau rouge.",
            "En 1849, il publie une Histoire de la révolution de 1848."
          ] },
          { nom: "Louis Blanc", dates: "1811-1882", txt: [
            "Théoricien socialiste, auteur de L'Organisation du travail (1839).",
            "Membre du gouvernement provisoire, il incarne la République sociale.",
            "Il défend le droit au travail et préside la commission du Luxembourg."
          ] },
          { nom: "Victor Schœlcher", dates: "1804-1893", txt: [
            "Militant abolitionniste.",
            "Sous-secrétaire d'État à la Marine et aux Colonies en 1848.",
            "Il prépare le décret du 27 avril 1848 qui abolit l'esclavage."
          ] },
          { nom: "Charles de Freycinet", dates: "1828-1923", txt: [
            "Élève de l'École polytechnique en 1848.",
            "Il est présent à l'Hôtel de Ville le 25 février 1848 et assiste à la scène du drapeau.",
            "Il publie ses Souvenirs en 1912 : un témoignage écrit plus de soixante ans après les faits."
          ] }
        ],
        lieux: [
          { nom: "Hôtel de Ville de Paris", lon: 2.35, lat: 48.86, txt: "Siège du gouvernement provisoire, où Lamartine refuse le drapeau rouge le 25 février 1848." },
          { nom: "Colonies françaises", txt: "Antilles, Guyane, La Réunion, Sénégal : l'esclavage y est aboli par le décret du 27 avril 1848." }
        ],
        documents: [
          { titre: "Lamartine refuse le drapeau rouge", source: "« M. de Lamartine au peuple », La Presse, 26 février 1848 (paroles recueillies la veille devant l'Hôtel de Ville).",
            extrait: "« Hier, vous me demandiez d'usurper, au nom du peuple de Paris, sur les droits de trente-cinq millions d'hommes, de leur voter une république absolue au lieu d'une république investie de la force de leur consentement […] ; aujourd'hui, vous nous demandez le drapeau rouge à la place du drapeau tricolore. […] C'est que le drapeau tricolore, citoyens, a fait le tour du monde, avec la République et l'Empire, avec nos libertés et nos gloires, et que le drapeau rouge n'a fait que le tour du champ de Mars, traîné dans les flots de sang du peuple. »",
            montre: "Lamartine oppose la volonté de toute la nation, exprimée par le vote, à la pression du peuple de Paris : il choisit une République libérale." },
          { titre: "Ce que réclament les manifestants", source: "Charles de Freycinet, élève de l'École polytechnique présent à l'Hôtel de Ville le 25 février, Souvenirs, 1848-1878, Paris, Delagrave, 1912.",
            extrait: "« L'un d'eux, qui paraissait le chef, ouvrier de vingt-six à vingt-huit ans […], exposa en termes clairs, non dépourvus d'éloquence, l'objet de leur démarche. […] « Nous ne voulons pas, termina-t-il, que la révolution soit escamotée encore une fois. Il nous faut la preuve que vous êtes avec nous. Cette preuve, vous la donnerez en décrétant le drapeau rouge, symbole de nos misères et de la rupture avec le passé. » »",
            montre: "Pour les ouvriers, le drapeau rouge est le symbole d'une République sociale qui rompt avec le passé. Témoignage publié en 1912 : à lire avec prudence." },
          { titre: "La même phrase racontée en 1849", source: "Lamartine, Histoire de la révolution de 1848, Paris, Perrotin, 1849, t. I.",
            extrait: "« le drapeau rouge que vous nous rapportez n'a jamais fait que le tour du Champ de Mars, traîné dans le sang du peuple en 91 et en 93, et le drapeau tricolore a fait le tour du monde, avec le nom, la gloire et la liberté de la patrie ! »",
            montre: "Écrit après les journées de Juin, le récit ajoute « en 91 et en 93 » : Lamartine associe le drapeau rouge aux violences de la Révolution pour rassurer ses lecteurs." }
        ],
        pieges: [
          "Lamartine n'est pas socialiste : républicain modéré, il refuse le drapeau rouge et la République sociale ; c'est Louis Blanc qui défend l'organisation du travail.",
          "Le tableau de Philippoteaux n'est pas une photographie de la scène : c'est une reconstitution composée après coup, qui met Lamartine en valeur ; il faut le confronter aux témoignages.",
          "Le suffrage de 1848 n'est « universel » que pour les hommes : les femmes restent exclues du vote jusqu'en 1944."
        ],
        mots: ["gouvernement provisoire", "Hôtel de Ville", "drapeau tricolore", "drapeau rouge", "République libérale", "République sociale", "suffrage universel masculin", "abolition de l'esclavage", "droit au travail", "décembre 1848"],
        reponse: "Le 25 février 1848, devant l'Hôtel de Ville, des ouvriers armés réclament le drapeau rouge, symbole de leurs misères et de la rupture avec le passé : ils veulent une République sociale, qui garantisse le travail. Lamartine, poète devenu ministre des Affaires étrangères du gouvernement provisoire, refuse : le drapeau tricolore rappelle les gloires de la Révolution et de l'Empire, alors que le drapeau rouge évoque le sang versé. En choisissant le drapeau, il choisit une République libérale, fondée sur le consentement de tous les Français et non sur la pression du peuple de Paris. Le gouvernement provisoire, dominé par les modérés, doit pourtant répondre aux attentes ouvrières : il proclame le droit au travail et crée les ateliers nationaux, tout en instaurant le suffrage universel masculin et en abolissant l'esclavage. Mais ce suffrage élit une Assemblée modérée, et Lamartine, héros de février, n'obtient qu'environ 18 000 voix en décembre 1848.",
        trous: [
          { titre: "Le bilan", texte: "Le 25 février 1848, devant l'[Hôtel de Ville], des ouvriers armés réclament le drapeau [rouge], symbole d'une République [sociale]. Membre du [gouvernement provisoire], Lamartine refuse et défend le drapeau [tricolore] : il veut une République [libérale], fondée sur le consentement de tous les Français. Le gouvernement instaure le [suffrage universel masculin] et abolit l'[esclavage], mais les élections donnent une Assemblée modérée ; en décembre 1848, Lamartine n'obtient qu'environ [18 000] voix." }
        ],
        capable: [
          "Présenter Lamartine et son rôle dans le gouvernement provisoire en 1848.",
          "Expliquer ce que représentent le drapeau rouge et le drapeau tricolore, et les deux conceptions de la République qu'ils symbolisent.",
          "Analyser le tableau de Philippoteaux en trois étapes : présenter, décrire, interpréter.",
          "Confronter le tableau aux témoignages et expliquer pourquoi le récit de 1849 ajoute « en 91 et en 93 ».",
          "Classer les mesures de 1848 selon la devise Liberté, Égalité, Fraternité, et en donner une limite.",
          "Expliquer pourquoi Lamartine, héros de février, est battu en décembre 1848."
        ]
      },
      {
        id: "sand", court: "PPO George Sand",
        titre: "George Sand, femme de lettres engagée en politique",
        question: "En quoi George Sand est-elle à la fois témoin et actrice de l'échec de la République entre 1848 et 1852 ?",
        branches: [
          { titre: "Une femme de lettres engagée", points: [
            "Romancière célèbre, elle signe ses livres d'un pseudonyme masculin ; elle vit à Nohant, dans le Berry (Indre).",
            "Avant 1848, elle s'engage auprès des républicains et défend les couches populaires.",
            "En 1848, une femme ne peut ni voter ni être élue : elle agit par l'écriture et par ses relations."
          ] },
          { titre: "Février-avril 1848 : l'espérance", points: [
            "« Nous nous lançons dans l'inconnu avec la foi et l'espérance » (4 mars 1848) : le peuple a été « sublime de courage et de douceur ».",
            "Proche du ministre de l'Intérieur Ledru-Rollin, elle rédige des circulaires et des Bulletins de la République : « Me voilà déjà occupée comme un homme d'État » (23 mars).",
            "À Nohant, elle juge que la population des campagnes « n'a point d'initiative » et fait adopter un candidat ouvrier et un candidat paysan."
          ] },
          { titre: "Juin-décembre 1848 : la fracture", points: [
            "« La réaction va trop vite » (10 juin 1848) : elle défend le peuple : « on le blesse, on l'humilie, on l'injurie ».",
            "Après les journées de Juin, elle constate que « la bourgeoisie l'emporte », alors que le suffrage universel est « encore debout » (30 septembre 1848, à Mazzini).",
            "Les paysans, sans épargne, n'aiment pas « c'te chetite république » et croient voter pour Napoléon en votant pour son neveu (8 décembre 1848)."
          ] },
          { titre: "1851-1852 : la réaction", points: [
            "Le 4 décembre 1851, à Paris, elle note le décret « effroyable » de Saint-Arnaud : tirer sans sommation, fusiller tout homme pris sur les barricades.",
            "Le 20 janvier 1852, elle écrit au prince-président : ses amis républicains sont « dans les cachots ou dans l'exil » ; « Assez, assez, vainqueur »."
          ] }
        ],
        reperes: [
          { a: "1848-03-04", date: "4 mars 1848", txt: "À Paris, George Sand écrit sa confiance dans la République nouvelle." },
          { a: "1848-03-23", date: "23 mars 1848", txt: "Elle rédige des circulaires pour deux ministères et prépare un Bulletin de la République." },
          { a: "1848-06-23", b: "1848-06-26", date: "23-26 juin 1848", txt: "Journées de Juin : l'insurrection ouvrière est écrasée." },
          { a: "1848-09-30", date: "30 septembre 1848", txt: "Lettre à Mazzini : « la bourgeoisie l'emporte »." },
          { a: "1848-12-10", date: "10 décembre 1848", txt: "Les paysans votent en masse pour Louis-Napoléon Bonaparte." },
          { a: "1851-12-02", date: "2 décembre 1851", txt: "Coup d'État ; le 4 décembre, George Sand décrit la répression à Paris." },
          { a: "1852-01-20", date: "20 janvier 1852", txt: "Elle écrit au prince-président pour défendre ses amis emprisonnés ou exilés." }
        ],
        notions: [
          { mot: "Témoin et acteur", def: "Le témoin observe et raconte les événements ; l'acteur y prend part et agit sur eux. George Sand est tour à tour l'un et l'autre." },
          { mot: "Bulletin de la République", def: "Feuille officielle publiée par le ministère de l'Intérieur au printemps 1848 pour diffuser les idées républicaines dans le pays ; George Sand en rédige plusieurs numéros." },
          { mot: "Journées de Juin", def: "Insurrection des ouvriers parisiens du 23 au 26 juin 1848, après la fermeture des ateliers nationaux, écrasée par l'armée." },
          { mot: "Parti de l'Ordre", def: "Rassemblement des conservateurs, surtout monarchistes, qui veulent défendre l'ordre et la propriété contre les « rouges »." },
          { mot: "Réaction", def: "Politique des conservateurs qui veulent revenir sur les conquêtes d'une révolution, ici la République démocratique et sociale de 1848." },
          { mot: "Proscription", def: "Bannissement d'opposants politiques hors du territoire, par décision du pouvoir, après le coup d'État de 1851." }
        ],
        personnages: [
          { nom: "George Sand", dates: "1804-1876", txt: [
            "Romancière célèbre, qui signe d'un pseudonyme masculin.",
            "En 1848, elle rédige des circulaires et des Bulletins de la République.",
            "Depuis Nohant, elle décrit la méfiance des paysans du Berry.",
            "En 1852, elle écrit au prince-président : « Assez, assez, vainqueur »."
          ] },
          { nom: "Alexandre Ledru-Rollin", dates: "1807-1874", txt: [
            "Avocat et député républicain, défenseur du suffrage universel.",
            "Ministre de l'Intérieur du gouvernement provisoire en 1848.",
            "Son ministère publie les Bulletins de la République, auxquels collabore une romancière célèbre."
          ] },
          { nom: "Giuseppe Mazzini", dates: "1805-1872", txt: [
            "Révolutionnaire italien, fondateur de la Jeune-Italie (1831).",
            "En 1849, il dirige la République romaine.",
            "Une romancière française lui écrit en septembre 1848 que « la bourgeoisie l'emporte »."
          ] },
          { nom: "Armand de Saint-Arnaud", dates: "1798-1854", txt: [
            "Général qui a fait carrière en Algérie.",
            "Ministre de la Guerre de Louis-Napoléon Bonaparte en 1851.",
            "Il dirige l'armée lors du coup d'État et ordonne de fusiller tout homme pris sur les barricades."
          ] }
        ],
        lieux: [
          { nom: "Nohant", lon: 1.97, lat: 46.63, txt: "Village du Berry (Indre) où vit George Sand ; elle y fait adopter un candidat ouvrier et un candidat paysan en 1848." },
          { nom: "Faubourg Saint-Antoine", lon: 2.38, lat: 48.85, txt: "Quartier ouvrier de l'est de Paris, l'un des principaux foyers des barricades de juin 1848." }
        ],
        documents: [
          { titre: "Une femme « occupée comme un homme d'État »", source: "George Sand, lettre à son fils Maurice, Paris, 23 mars 1848 (G. Sand, Lettres d'une vie, Folio classique, 2004).",
            extrait: "« Me voilà déjà occupée comme un homme d'État. J'ai fait déjà deux circulaires gouvernementales aujourd'hui, une pour le ministère de l'Instruction publique, et une pour le ministère de l'Intérieur. […] Tu dois avoir reçu les 6 premiers n°s du Bulletin de la République, le 7e sera de moi. »",
            montre: "Sans droit de vote, George Sand agit pourtant au cœur du pouvoir républicain, par l'écriture : elle est actrice." },
          { titre: "« La bourgeoisie l'emporte »", source: "George Sand, lettre à Giuseppe Mazzini, Nohant, 30 septembre 1848 (Lettres d'une vie, Folio classique, 2004).",
            extrait: "« La bourgeoisie l'emporte, direz-vous […]. Mais pourquoi la bourgeoisie l'emporte-t-elle, quand le peuple est souverain, et que le principe de sa souveraineté, le suffrage universel est encore debout ? […] Il faut à ceux-ci un empereur, à ceux-là des rois […]. »",
            montre: "Après les journées de Juin, elle constate que le suffrage universel n'empêche pas la victoire des conservateurs : elle est témoin de la fracture." },
          { titre: "« Assez, assez, vainqueur »", source: "George Sand, lettre à Louis-Napoléon Bonaparte, Nohant, 20 janvier 1852 (Lettres d'une vie, Folio classique, 2004).",
            extrait: "« Prince, ma famille est dispersée et jetée à tous les vents du ciel. Les amis de mon enfance et de ma vieillesse […] sont dans les cachots ou dans l'exil, votre rigueur s'est appesantie sur tous ceux qui prennent, qui acceptent ou qui subissent le titre de républicains socialistes. […] je crie vers vous le cœur saignant et les yeux en pleurs : Assez, assez, vainqueur […]. »",
            montre: "Après le coup d'État, elle intervient auprès du prince-président pour défendre les républicains réprimés." }
        ],
        pieges: [
          "George Sand n'est ni électrice ni élue : en 1848, les femmes n'ont aucun droit politique. Son action passe par l'écriture (lettres, circulaires, Bulletins de la République) et par ses relations.",
          "Ne pas réduire son rôle à celui de témoin : elle raconte les événements, mais elle agit aussi (circulaires, candidats ouvrier et paysan, lettre au prince-président).",
          "Ses lettres sont des sources engagées : elle défend le peuple et les républicains socialistes, et juge sévèrement la bourgeoisie et les paysans."
        ],
        mots: ["Nohant", "Ledru-Rollin", "Bulletin de la République", "campagnes", "journées de Juin", "bourgeoisie", "parti de l'Ordre", "coup d'État", "proscription", "témoin et actrice"],
        reponse: "George Sand, romancière célèbre, est d'abord une actrice de la République naissante. En mars 1848, proche du ministre de l'Intérieur Ledru-Rollin, elle rédige des circulaires et des Bulletins de la République, « occupée comme un homme d'État », alors qu'une femme ne peut ni voter ni être élue. Mais elle est aussi un témoin lucide des tensions qui font échouer le projet républicain. Depuis Nohant, elle constate que les paysans, appauvris, ne comprennent pas la République et votent pour le neveu de Napoléon. Après les journées de Juin, elle écrit à Mazzini que « la bourgeoisie l'emporte » sur le peuple ouvrier, malgré le suffrage universel. En décembre 1851, elle décrit la répression du coup d'État ; en janvier 1852, elle écrit au prince-président pour défendre ses amis républicains, emprisonnés ou exilés. Son parcours, de l'espérance de février à la résignation de 1852, résume l'échec de la République.",
        trous: [
          { titre: "Le bilan", texte: "George Sand, romancière, vit à [Nohant], dans l'Indre. En mars 1848, proche du ministre [Ledru-Rollin], elle rédige des [Bulletins de la République] : elle est alors [actrice] des événements. Elle en est aussi [témoin] : les paysans se méfient de la République et votent pour le neveu de [Napoléon]. Après les [journées de Juin], elle constate que « la [bourgeoisie] l'emporte ». Après le [coup d'État] de 1851, ses amis républicains sont en prison ou en exil." }
        ],
        capable: [
          "Présenter George Sand et expliquer comment une femme agit en politique en 1848, sans droit de vote.",
          "Montrer, avec un exemple pour chaque, qu'elle est témoin et actrice des événements.",
          "Expliquer, à partir de ses lettres, les tensions entre villes et campagnes, bourgeois et ouvriers, conservateurs et républicains.",
          "Placer sur une frise les étapes 1848-1852 : l'espérance, la fracture, la réaction.",
          "Critiquer une lettre : qui écrit, à qui, quand, avec quel point de vue."
        ]
      },
      {
        id: "bonaparte", court: "PPO Louis-Napoléon",
        titre: "Louis-Napoléon Bonaparte, premier président de la République",
        question: "Comment le premier président de la République, élu au suffrage universel masculin en 1848, devient-il quatre ans plus tard l'empereur Napoléon III ?",
        branches: [
          { titre: "Un nom et une image", points: [
            "Neveu de Napoléon Iᵉʳ, il tente deux fois de renverser la monarchie de Juillet (Strasbourg, 1836 ; Boulogne, 1840), puis s'évade du fort de Ham (1846).",
            "Élu député en 1848, il profite de la légende napoléonienne : l'image d'Épinal le présente en « représentant du peuple, président de la République ».",
            "Devenu empereur, il se fait représenter en uniforme, avec les attributs du pouvoir impérial (portrait d'après Winterhalter)."
          ] },
          { titre: "Le président élu (1848-1849)", points: [
            "10 décembre 1848 : élu avec 5 434 226 voix (environ 74 %), loin devant Cavaignac (1 448 107), Ledru-Rollin (370 119), Raspail et Lamartine.",
            "Il doit sa victoire à son nom, au vote des paysans, à la peur des « rouges » après Juin et au soutien du parti de l'Ordre.",
            "La Constitution du 4 novembre 1848 lui donne un mandat de quatre ans, sans réélection immédiate possible."
          ] },
          { titre: "Le conflit des pouvoirs (1849-1851)", points: [
            "Mai 1849 : l'Assemblée législative est dominée par le parti de l'Ordre, monarchiste.",
            "31 mai 1850 : l'Assemblée exige trois ans de domicile pour voter ; environ 3 millions d'électeurs, surtout ouvriers, perdent le droit de vote. Le président peut se poser en défenseur du suffrage universel.",
            "1851 : l'Assemblée refuse de réviser la Constitution, qui lui interdit de se représenter."
          ] },
          { titre: "Du coup d'État à l'Empire (1851-1852)", points: [
            "2 décembre 1851 : il dissout l'Assemblée et rétablit le suffrage universel : « je rends le Peuple entier juge entre elle et moi » ; la résistance républicaine est durement réprimée.",
            "20-21 décembre 1851 : plébiscite, 7,4 millions de « oui » contre 0,6 million de « non ».",
            "Constitution du 14 janvier 1852 : président pour dix ans, il a seul l'initiative des lois.",
            "Après le plébiscite de novembre 1852, l'Empire est proclamé le 2 décembre 1852 : il devient Napoléon III."
          ] }
        ],
        reperes: [
          { a: "1848-11-04", date: "4 novembre 1848", txt: "Constitution : un président élu pour quatre ans au suffrage universel masculin, non rééligible immédiatement." },
          { a: "1848-12-10", date: "10 décembre 1848", txt: "Louis-Napoléon Bonaparte est élu président avec environ 74 % des voix." },
          { a: "1849-05-13", date: "13 mai 1849", txt: "Élection d'une Assemblée législative dominée par le parti de l'Ordre." },
          { a: "1850-05-31", date: "31 mai 1850", txt: "Loi électorale : environ 3 millions d'électeurs perdent le droit de vote." },
          { a: "1851-12-02", date: "2 décembre 1851", txt: "Coup d'État : l'Assemblée est dissoute." },
          { a: "1851-12-20", b: "1851-12-21", date: "20-21 décembre 1851", txt: "Plébiscite : 7,4 millions de « oui » approuvent le coup d'État." },
          { a: "1852-01-14", date: "14 janvier 1852", txt: "Constitution : le président est désigné pour dix ans et a seul l'initiative des lois." },
          { a: "1852-12-02", date: "2 décembre 1852", txt: "Proclamation du Second Empire : Louis-Napoléon Bonaparte devient Napoléon III." }
        ],
        notions: [
          { mot: "Bonapartisme", def: "Courant politique attaché à la mémoire de Napoléon Iᵉʳ et à sa famille : un pouvoir fort, appuyé directement sur le peuple." },
          { mot: "Prince-président", def: "Nom donné à Louis-Napoléon Bonaparte, président de la République et héritier de la famille impériale, de 1848 à 1852." },
          { mot: "Parti de l'Ordre", def: "Rassemblement des conservateurs, surtout monarchistes, qui domine l'Assemblée législative élue en 1849 et restreint le suffrage en 1850." },
          { mot: "Coup d'État", def: "Prise ou maintien du pouvoir par la force, en violation de la Constitution." },
          { mot: "Plébiscite", def: "Vote par lequel les citoyens répondent par oui ou par non à une question posée par le chef de l'État : on approuve un homme et sa politique." },
          { mot: "Césarisme", def: "Régime dans lequel un homme seul exerce un pouvoir personnel et autoritaire tout en s'appuyant sur le peuple, consulté par plébiscite." },
          { mot: "Image d'Épinal", def: "Estampe populaire coloriée, imprimée à Épinal (imprimerie Pellerin) et diffusée à bas prix, notamment dans les campagnes : un moyen de propagande auprès du peuple." }
        ],
        personnages: [
          { nom: "Louis-Napoléon Bonaparte", dates: "1808-1873", txt: [
            "Neveu de Napoléon Iᵉʳ, longtemps exilé.",
            "Il tente deux fois de renverser la monarchie de Juillet, puis s'évade du fort de Ham.",
            "Le 10 décembre 1848, il devient le premier président de la République élu au suffrage universel masculin.",
            "Le 2 décembre 1851, il dissout l'Assemblée et en appelle au peuple."
          ] },
          { nom: "Louis-Eugène Cavaignac", dates: "1802-1857", txt: [
            "Général républicain modéré.",
            "Il écrase les journées de Juin, puis devient chef du pouvoir exécutif.",
            "Le 10 décembre 1848, il arrive deuxième avec 1 448 107 voix."
          ] },
          { nom: "Alexandre Ledru-Rollin", dates: "1807-1874", txt: [
            "Ancien ministre de l'Intérieur du gouvernement provisoire.",
            "Candidat « démocrate-socialiste » en décembre 1848, il obtient 370 119 voix.",
            "Après l'échec d'une manifestation, le 13 juin 1849, il s'exile en Angleterre."
          ] }
        ],
        lieux: [
          { nom: "Palais de l'Élysée", lon: 2.32, lat: 48.87, txt: "Résidence du prince-président, où se prépare le coup d'État du 2 décembre 1851." },
          { nom: "Palais-Bourbon", lon: 2.32, lat: 48.86, txt: "Siège de l'Assemblée, occupé par l'armée à l'aube du 2 décembre 1851." },
          { nom: "Fort de Ham", lon: 3.07, lat: 49.75, txt: "Forteresse de la Somme où Louis-Napoléon Bonaparte est emprisonné après sa tentative de 1840 ; il s'en évade en 1846." }
        ],
        documents: [
          { titre: "L'appel au peuple du 2 décembre 1851", source: "« Proclamation du Président de la République. Appel au peuple », affiche, Paris, 2 décembre 1851, musée Carnavalet.",
            extrait: "« Français ! La situation actuelle ne peut durer plus longtemps. […] L'Assemblée, qui devait être le plus ferme appui de l'ordre, est devenue un foyer de complots. […] elle attente au pouvoir que je tiens directement du Peuple ; […] je l'ai dissoute, et je rends le Peuple entier juge entre elle et moi. »",
            montre: "Le président justifie le coup d'État en accusant l'Assemblée et fonde son pouvoir directement sur le peuple, qu'il va consulter par plébiscite." },
          { titre: "Pourquoi les paysans votent pour lui", source: "George Sand, lettre à Pauline Viardot, Nohant, 8 décembre 1848 (Lettres d'une vie, Folio classique, 2004).",
            extrait: "« Les paysans, sauf qu'ils mangent, sont très malheureux. Ils n'ont plus d'épargne, ils ne trouvent plus à emprunter […]. Cela ne leur fait pas aimer c'te chetite république à laquelle ils ne comprennent rien. Ils croient que Napoléon n'est pas mort et qu'ils votent pour lui en votant pour son neveu. »",
            montre: "Le mécontentement des campagnes et la légende napoléonienne expliquent le vote massif des paysans en décembre 1848." },
          { titre: "La Constitution de 1852", source: "Constitution du 14 janvier 1852, art. 2, 5 et 8 (Digithèque MJP, université de Perpignan).",
            extrait: "« Art. 2. — Le Gouvernement de la République française est confié pour dix ans au prince Louis Napoléon Bonaparte, président actuel de la République. Art. 5. — Le président de la République est responsable devant le Peuple français, auquel il a toujours le droit de faire appel. […] Art. 8. — Il a seul l'initiative des lois. »",
            montre: "Un pouvoir personnel et autoritaire, qui se dit responsable devant le seul peuple : c'est le césarisme." }
        ],
        pieges: [
          "Louis-Napoléon Bonaparte n'est pas le fils de Napoléon Iᵉʳ mais son neveu ; le fils de Napoléon Iᵉʳ (« Napoléon II ») est mort en 1832.",
          "Le coup d'État ne supprime pas le suffrage universel : il le rétablit (la loi du 31 mai 1850 est abrogée) et s'en sert, par le plébiscite, pour légitimer un pouvoir personnel.",
          "Ne pas confondre les deux 2 décembre : coup d'État le 2 décembre 1851, proclamation de l'Empire le 2 décembre 1852 — deux anniversaires du sacre de Napoléon Iᵉʳ (1804) et d'Austerlitz (1805)."
        ],
        mots: ["neveu de Napoléon Iᵉʳ", "suffrage universel masculin", "vote paysan", "parti de l'Ordre", "loi du 31 mai 1850", "coup d'État", "plébiscite", "Constitution de 1852", "Napoléon III"],
        reponse: "Neveu de Napoléon Iᵉʳ, Louis-Napoléon Bonaparte est élu président de la République le 10 décembre 1848 avec environ 74 % des voix, grâce à son nom, au vote des paysans qui croient voter pour l'Empereur, et au soutien du parti de l'Ordre. Mais la Constitution de 1848 lui interdit de se représenter, et il entre en conflit avec l'Assemblée monarchiste élue en 1849. Quand celle-ci restreint le suffrage par la loi du 31 mai 1850, puis refuse de réviser la Constitution, il se pose en défenseur du peuple. Le 2 décembre 1851, par un coup d'État, il dissout l'Assemblée, rétablit le suffrage universel masculin et réprime la résistance républicaine. Le plébiscite de décembre 1851 l'approuve massivement, et la Constitution de 1852 lui confie le pouvoir pour dix ans. Un an plus tard, un nouveau plébiscite rétablit l'Empire : le 2 décembre 1852, il devient Napoléon III. Le suffrage universel a servi à fonder un pouvoir personnel.",
        trous: [
          { titre: "Le bilan", texte: "Neveu de [Napoléon Iᵉʳ], Louis-Napoléon Bonaparte est élu président le [10 décembre 1848] avec environ 74 % des voix. L'Assemblée, dominée par le [parti de l'Ordre], restreint le suffrage par la loi du [31 mai 1850]. Le [2 décembre 1851], il dissout l'Assemblée par un [coup d'État] et fait approuver son action par un [plébiscite]. Le 2 décembre 1852, l'Empire est rétabli : il devient [Napoléon III]." }
        ],
        capable: [
          "Expliquer pourquoi Louis-Napoléon Bonaparte est élu massivement en décembre 1848.",
          "Confronter l'image d'Épinal de 1848 et le portrait officiel de Napoléon III : ce qui change, ce qui demeure, pourquoi.",
          "Expliquer le conflit entre le président et l'Assemblée (loi du 31 mai 1850, refus de réviser la Constitution).",
          "Raconter le coup d'État du 2 décembre 1851 et dire sur quoi Louis-Napoléon Bonaparte fonde son pouvoir.",
          "Rédiger un paragraphe : comment passe-t-il de président élu à empereur (1848-1852) ?"
        ]
      }
    ]
  },

  /* =====================================================================
     1ère — GÉOGRAPHIE — Thème 1, questions 1 et 2
     ===================================================================== */
  {
    id: "1re-g1-c12", n: "1ere", d: "geo", carte: "monde",
    theme: "La métropolisation : un processus mondial différencié",
    rituel: "La métropolisation",
    num: "Questions 1 et 2",
    titre: "Les villes à l'échelle mondiale : le poids croissant des métropoles ; des métropoles inégales et en mutation",
    question: "Comment le processus de métropolisation recompose-t-il la hiérarchie urbaine mondiale et les espaces métropolitains, à différentes échelles ?",
    plan: [
      "Urbanisation et métropolisation : la ville s'étend au monde (exposés : Mégalopolis, Mumbai, Londres, Rio-São Paulo, Paris)",
      "Une recomposition différenciée des territoires : quelles formes prend la métropolisation ?",
      "Des espaces métropolitains au rayonnement inégal (étude de cas : Saint-Étienne)",
      "Des inégalités croissantes à toutes les échelles et la diversité des espaces métropolisés"
    ],
    cle: "La métropolisation concentre les hommes, les richesses et les fonctions de commandement dans quelques grandes villes, reliées entre elles en un réseau hiérarchisé ; mais les villes les plus peuplées ne sont pas les plus puissantes.",
    essentiel: [
      "En 2025, 45 % des 8,2 milliards d'humains vivent dans une ville, plus du double de 1950 (20 %). L'urbanisation s'accélère surtout dans les Suds (Afrique subsaharienne, Asie du Sud et du Sud-Est), sous l'effet de la croissance démographique et de l'exode rural.",
      "Avec la mondialisation, les hommes, les activités et les fonctions de commandement se concentrent dans les plus grandes villes : c'est la métropolisation. Les villes s'étalent, les mégapoles se multiplient (8 en 1975, 33 en 2025, dont 19 en Asie) et forment parfois des mégalopoles : du Nord-Est des États-Unis, de Londres à Milan, de Tokyo à Fukuoka.",
      "La métropolisation transforme l'organisation interne des villes : le quartier central des affaires concentre le commandement, de nouvelles centralités apparaissent en périphérie (quartiers d'affaires, technopôles, aéroports) et la ville s'étale. Les métropoles se fragmentent : gentrification des quartiers centraux, quartiers informels et quartiers fermés se côtoient sans se mélanger.",
      "Le rayonnement d'une métropole dépend de ses fonctions de commandement bien plus que de sa population : Jakarta, la ville la plus peuplée du monde (près de 42 millions d'habitants), n'est pas parmi les dix premières métropoles mondiales. Les métropoles mondiales forment un réseau hiérarchisé, l'archipel mégalopolitain mondial, dominé par Londres et New York.",
      "La métropolisation creuse les inégalités à toutes les échelles : entre les métropoles du Nord et les villes des Suds, où plus d'un milliard de personnes vivent dans des bidonvilles ; au sein des métropoles, entre centres riches et périphéries pauvres ; entre quartiers, par la gentrification et la fermeture des quartiers aisés.",
      "On distingue quatre types d'espaces métropolisés : les métropoles mondiales de premier rang (Londres, New York, Tokyo, Paris), les métropoles des pays émergents en voie d'intégration (Shanghai, Dubaï, Mumbai, São Paulo), les mégapoles des Suds peu intégrées à la mondialisation (Lagos, Dacca, Kinshasa) et les métropoles en déclin, comme Detroit ou Saint-Étienne, qui cherchent à se reconvertir.",
      "Repères : les 10 villes les plus peuplées (ONU, 2025) sont Jakarta, Dacca, Tokyo, New Delhi, Shanghai, Canton, Le Caire, Manille, Calcutta et Séoul ; les 10 premières métropoles (GaWC, 2024) sont Londres, New York, Hong Kong, Pékin, Singapour, Shanghai, Paris, Dubaï, Tokyo et Sydney."
    ],
    periodes: [],
    reperes: [
      { a: 1950, date: "1950", txt: "20 % des humains vivent dans une ville." },
      { a: 1961, date: "1961", txt: "Le géographe Jean Gottmann décrit la « Megalopolis » du Nord-Est des États-Unis, de Boston à Washington." },
      { a: 1968, b: 2023, date: "1968-2023", txt: "Saint-Étienne passe de 223 223 à 173 136 habitants : une métropole en décroissance." },
      { a: 1975, date: "1975", txt: "Le monde compte 8 mégapoles (plus de 10 millions d'habitants)." },
      { a: 1990, b: 1999, date: "années 1990", txt: "Le mot « métropolisation » apparaît, lié à la mondialisation." },
      { a: 2022, date: "2022", txt: "1,12 milliard de personnes vivent dans des bidonvilles, surtout en Asie et en Afrique subsaharienne." },
      { a: 2025, date: "2025", txt: "45 % des 8,2 milliards d'humains vivent dans une ville ; le monde compte 33 mégapoles, dont 19 en Asie." },
      { a: 2050, date: "2050 (prévision)", txt: "37 mégapoles prévues ; d'ici là, les deux tiers de la croissance démographique mondiale auront lieu dans les villes." }
    ],
    notions: [
      { mot: "Urbanisation", def: "Processus d'augmentation de la part de la population vivant en ville ; il s'accompagne de l'extension des espaces urbanisés." },
      { mot: "Métropolisation", def: "Processus de concentration des populations, des activités et des fonctions de commandement dans les plus grandes villes, les métropoles, qui rayonnent à l'échelle nationale, continentale ou mondiale." },
      { mot: "Métropole", def: "Grande ville qui concentre des fonctions de commandement et rayonne sur un territoire plus ou moins vaste ; ce n'est pas le nombre d'habitants qui la définit." },
      { mot: "Recomposition spatiale", def: "Transformation de l'organisation d'un espace : répartition des hommes, des activités, des flux et des hiérarchies." },
      { mot: "Transition urbaine", def: "Passage d'une société majoritairement rurale à une société majoritairement urbaine." },
      { mot: "Étalement urbain", def: "Extension des espaces urbanisés à la périphérie des villes, au détriment des espaces agricoles et naturels." },
      { mot: "Mégapole", def: "Agglomération de plus de 10 millions d'habitants." },
      { mot: "Mégalopole", def: "Chapelet de grandes villes proches et reliées entre elles, formant un espace urbanisé presque continu." },
      { mot: "Quartier central des affaires (CBD)", def: "Quartier qui concentre les sièges sociaux, les activités financières et les services supérieurs, souvent marqué par les gratte-ciel." },
      { mot: "Centralité", def: "Capacité d'un lieu à attirer des hommes, des activités et des flux." },
      { mot: "Gentrification", def: "Embourgeoisement d'un quartier populaire, qui entraîne le départ progressif des habitants modestes." },
      { mot: "Fragmentation socio-spatiale", def: "Coupure sociale et spatiale entre des quartiers d'une même ville, qui coexistent sans se mélanger." },
      { mot: "Fonction de commandement", def: "Activité qui permet de prendre des décisions et de contrôler un territoire ou une économie (siège social, bourse, gouvernement)." },
      { mot: "Métropole mondiale", def: "Métropole dont les fonctions de commandement rayonnent sur le monde entier." },
      { mot: "Archipel mégalopolitain mondial (AMM)", def: "Réseau des grandes métropoles mondiales, plus reliées entre elles qu'à leur arrière-pays." }
    ],
    personnages: [
      { nom: "Jean Gottmann", dates: "1915-1994", txt: [
        "Géographe français du XXᵉ siècle, qui a longtemps travaillé aux États-Unis.",
        "En 1961, il publie un grand livre sur la façade nord-est des États-Unis.",
        "Il y décrit « une étendue presque continue d'espaces urbains et suburbains, du sud du New Hampshire au nord de la Virginie ».",
        "Il donne le nom de « Megalopolis » à cet ensemble de villes, de Boston à Washington."
      ] }
    ],
    lieux: [
      { nom: "Londres", lon: -0.13, lat: 51.51, txt: "Métropole mondiale (Alpha++) : la City et Canary Wharf, Heathrow, 1er aéroport d'Europe ; gentrification de l'est de la ville." },
      { nom: "New York", lon: -74.01, lat: 40.71, txt: "Métropole mondiale (Alpha++), cœur de la Mégalopolis : Manhattan concentre le commandement ; son revenu médian est plus du double de celui du Bronx." },
      { nom: "Mégalopolis américaine", txt: "Chapelet de villes du Nord-Est des États-Unis, de Boston à Washington, reliées par le Northeast Corridor ; décrite par Jean Gottmann en 1961." },
      { nom: "Tokyo", lon: 139.69, lat: 35.68, txt: "À la fois mégapole (33 millions d'habitants), métropole mondiale (Alpha+) et cœur de la mégalopole japonaise." },
      { nom: "Paris", lon: 2.35, lat: 48.86, txt: "Métropole mondiale (Alpha+), dans les dix premières : La Défense, Roissy-Charles-de-Gaulle ; le Grand Paris Express doit relier les banlieues entre elles." },
      { nom: "Mumbai", lon: 72.88, lat: 19.08, txt: "Métropole d'un pays émergent sur un site littoral contraint ; 41,8 % des habitants vivaient dans un bidonville en 2011, comme Dharavi (environ 1 million d'habitants)." },
      { nom: "São Paulo", lon: -46.63, lat: -23.55, txt: "Capitale économique du Brésil, qui l'emporte sur Rio de Janeiro ; un habitant sur sept vit en favela, tandis que les plus riches s'isolent dans des quartiers fermés comme Alphaville." },
      { nom: "Jakarta", lon: 106.85, lat: -6.21, txt: "Ville la plus peuplée du monde (près de 42 millions d'habitants en 2025), mais absente des dix premières métropoles mondiales." },
      { nom: "Detroit", lon: -83.05, lat: 42.33, txt: "Métropole en déclin : désindustrialisation, 1,85 million d'habitants en 1950, 0,64 million en 2020." },
      { nom: "Saint-Étienne", lon: 4.39, lat: 45.44, txt: "Métropole en reconversion dans l'orbite de Lyon : la ville-centre a perdu 50 000 habitants depuis 1968 ; elle mise sur le design (Cité du design)." }
    ],
    trous: [
      { titre: "La ville gagne le monde", texte: "L'urbanisation du monde s'accélère, surtout dans les pays des [Suds], sous l'effet de la croissance démographique et de l'[exode rural]. Avec la [mondialisation], les hommes et les activités se concentrent dans les plus grandes villes : c'est la [métropolisation]. Les villes s'[étalent] et les [mégapoles] se multiplient." },
      { titre: "Les formes de la métropolisation", texte: "La métropolisation transforme l'organisation interne des villes : le [centre des affaires] concentre le [commandement], de nouvelles [centralités] apparaissent en périphérie et la ville s'étale. Les métropoles sont aussi de plus en plus [fragmentées] : [gentrification] des quartiers centraux, quartiers [informels] et quartiers [fermés] se côtoient sans se mélanger." },
      { titre: "Des métropoles inégales", texte: "Toutes les métropoles n'ont pas le même [rayonnement] : il dépend de leurs [fonctions de commandement] plus que de leur [population]. Elles forment un réseau hiérarchisé, l'[archipel mégalopolitain mondial], dominé par [Londres] et [New York]. La métropolisation creuse les [inégalités] à toutes les échelles, du monde au quartier. On distingue plusieurs types de métropoles : mondiales, émergentes, mégapoles peu intégrées, et métropoles en [déclin] qui cherchent à se reconvertir, comme [Saint-Étienne]." }
    ],
    capable: [
      "Distinguer urbanisation et métropolisation.",
      "Définir et employer les notions du thème (métropole, mégapole, mégalopole, centralité, fragmentation…).",
      "Expliquer comment une métropole concentre populations, activités et fonctions de commandement.",
      "Expliquer l'étalement urbain et l'apparition de nouvelles centralités en périphérie.",
      "Montrer que la métropolisation prend des formes différentes selon les contextes (villes compactes, villes étalées).",
      "Expliquer pourquoi les villes les plus peuplées ne sont pas les plus puissantes.",
      "Identifier les inégalités socio-spatiales à toutes les échelles, du monde au quartier.",
      "Classer les métropoles du monde en une typologie de quatre types.",
      "Nommer et localiser les 10 villes les plus peuplées, les 10 premières métropoles, les 3 mégalopoles et les régions à forte ou faible croissance urbaine.",
      "Transposer des documents en schéma ou en croquis, et différencier un argument, une explication et une illustration."
    ]
  },

  /* =====================================================================
     1ère — GÉOGRAPHIE — Thème 1, question spécifique
     ===================================================================== */
  {
    id: "1re-g1-qs", n: "1ere", d: "geo", carte: "france",
    theme: "La métropolisation : un processus mondial différencié",
    rituel: "La métropolisation",
    num: "Question spécifique",
    titre: "La France : la métropolisation et ses effets",
    question: "Comment la métropolisation recompose-t-elle le territoire français ?",
    plan: [
      "Paris, une ville primatiale et mondiale (exposé : Paris, métropole dominante)",
      "Des métropoles régionales qui s'affirment inégalement (exposés : Lyon, Bordeaux, Lille, Fort-de-France)",
      "Des territoires fragilisés et des politiques de rééquilibrage : villes moyennes, périurbain, outre-mer",
      "Le défi de la fragmentation socio-spatiale (Clichy-sous-Bois et Neuilly-sur-Seine)",
      "Tâche finale : le croquis de la France, puis un développement construit à partir du croquis"
    ],
    cle: "La métropolisation recompose le territoire français : elle renforce Paris et les métropoles de l'Ouest et du Sud, tandis que le Nord-Est, les villes moyennes, une partie des espaces ruraux et certains territoires ultramarins sont fragilisés.",
    essentiel: [
      "Paris est une ville primatiale : son aire d'attraction compte 13,3 millions d'habitants, environ un Français sur cinq, près de six fois plus que celle de Lyon. L'Île-de-France produit 30 % de la richesse nationale avec 18 % des habitants : Paris est la seule métropole mondiale française.",
      "Dès 1947, Jean-François Gravier dénonce « Paris et le désert français ». L'État a longtemps cherché à rééquilibrer le territoire ; la décentralisation (lois Defferre, 1982) donne ensuite plus de pouvoirs aux collectivités, et les lois MAPTAM (2014) et NOTRe (2015) renforcent les métropoles : la France en compte 22.",
      "Les métropoles régionales s'affirment inégalement : celles de l'Ouest et du Sud (Montpellier, Toulouse, Bordeaux, Nantes, Rennes) gagnent plus de 1 % d'habitants par an, grâce aux LGV, aux grands projets urbains (Confluence, Euratlantique, Euralille) et à leurs universités. Une large diagonale du nord-est au sud-ouest perd des habitants, et d'anciennes villes industrielles comme Saint-Étienne peinent à se reconvertir.",
      "Les villes moyennes souffrent de la dévitalisation de leur centre : l'État les aide avec Action cœur de ville (2018) et Petites villes de demain. La périurbanisation étend l'influence des villes : 93 % des Français vivent dans l'une des 699 aires d'attraction des villes, dont 43 % dans les couronnes.",
      "Les métropoles françaises sont fragmentées : quartiers d'affaires et quartiers aisés d'un côté, 1 362 quartiers prioritaires (5,3 millions d'habitants) de l'autre ; le taux de pauvreté atteint 45 % à Clichy-sous-Bois contre 8 % à Neuilly-sur-Seine. La politique de la ville, la loi SRU et les transports (Grand Paris Express) cherchent à réduire ces inégalités, avec des résultats encore limités.",
      "Outre-mer, Fort-de-France concentre les fonctions de commandement de la Martinique, mais perd 1 % d'habitants par an, comme la Guadeloupe ; la Guyane et La Réunion, au contraire, gagnent des habitants."
    ],
    periodes: [],
    reperes: [
      { a: 1947, date: "1947", txt: "Jean-François Gravier publie « Paris et le désert français »." },
      { a: 1982, date: "1982", txt: "Les lois Defferre : la décentralisation donne plus de pouvoirs aux collectivités territoriales." },
      { a: 1993, b: 1994, date: "1993-1994", txt: "Arrivée du TGV puis de l'Eurostar à Lille, qui devient un carrefour européen." },
      { a: 2000, date: "2000", txt: "La loi SRU impose aux communes un minimum de logements sociaux (20 %, porté à 25 % en 2013 pour la plupart)." },
      { a: 2014, b: 2015, date: "2014-2015", txt: "Les lois MAPTAM et NOTRe renforcent les métropoles ; la Métropole de Lyon naît en 2015." },
      { a: 2017, date: "2017", txt: "La LGV met Bordeaux à 2 h 04 de Paris." },
      { a: 2018, date: "2018", txt: "L'État lance le programme Action cœur de ville pour 222 villes moyennes." },
      { a: 2024, date: "2024", txt: "Nouvelle carte de la politique de la ville : 1 362 quartiers prioritaires en France métropolitaine." }
    ],
    notions: [
      { mot: "Ville primatiale", def: "Ville qui domine très largement le réseau urbain d'un pays par sa population et ses fonctions." },
      { mot: "Métropole régionale", def: "Grande ville qui concentre les fonctions de commandement et rayonne sur une région, parfois au-delà." },
      { mot: "Métropole (sens institutionnel)", def: "Intercommunalité dotée de pouvoirs renforcés ; la France en compte 22. À ne pas confondre avec le sens géographique (fonctions et rayonnement) : Brest ou Saint-Étienne sont des métropoles institutionnelles, pas des métropoles régionales majeures." },
      { mot: "Décentralisation", def: "Transfert de compétences de l'État vers les collectivités territoriales (communes, départements, régions)." },
      { mot: "Aire d'attraction d'une ville", def: "Ensemble formé par un pôle urbain et les communes dont au moins 15 % des actifs travaillent dans ce pôle (Insee, 2020)." },
      { mot: "Périurbanisation", def: "Installation de citadins dans les communes rurales proches des villes, d'où ils continuent de s'y rendre pour travailler." },
      { mot: "Ville moyenne", def: "Ville de taille intermédiaire (environ 20 000 à 100 000 habitants), relais entre les métropoles et les espaces ruraux qui l'entourent." },
      { mot: "Dévitalisation", def: "Perte d'habitants, de commerces et de services d'un centre-ville." },
      { mot: "Fragmentation socio-spatiale", def: "Division d'une ville en espaces séparés socialement et physiquement, qui coexistent sans se mélanger." },
      { mot: "Ségrégation", def: "Séparation des groupes sociaux dans l'espace, subie ou choisie." },
      { mot: "Gentrification", def: "Embourgeoisement d'un quartier populaire, qui entraîne le départ progressif des habitants modestes." },
      { mot: "Quartier prioritaire (QPV)", def: "Quartier urbain défini par l'État selon la faiblesse des revenus de ses habitants, qui bénéficie de la politique de la ville." },
      { mot: "Mixité sociale", def: "Coexistence dans un même espace de groupes sociaux différents." },
      { mot: "Loi SRU", def: "Loi de 2000 qui impose aux communes un minimum de logements sociaux (20 %, porté à 25 % en 2013 pour la plupart) pour favoriser la mixité sociale." }
    ],
    personnages: [
      { nom: "Jean-François Gravier", dates: "1915-2005", txt: [
        "Géographe français du XXᵉ siècle, qui a travaillé à l'aménagement du territoire.",
        "En 1947, il publie un livre qui dénonce la domination de la capitale sur le reste du pays.",
        "Pour lui, l'agglomération parisienne se comporte « comme un groupe monopoleur dévorant la substance nationale ».",
        "Le titre de son livre oppose la capitale à un « désert français »."
      ] }
    ],
    lieux: [
      { nom: "Paris", lon: 2.35, lat: 48.86, txt: "Ville primatiale et seule métropole mondiale française : aire de 13,3 millions d'habitants, pouvoir politique, sièges sociaux, La Défense, aéroport de Roissy-Charles-de-Gaulle." },
      { nom: "Lyon", lon: 4.84, lat: 45.76, txt: "Deuxième aire urbaine du pays, métropole régionale de rang européen ; grand projet urbain de Confluence, aéroport de Saint-Exupéry." },
      { nom: "Bordeaux", lon: -0.58, lat: 44.84, txt: "Métropole très attractive, à 2 h 04 de Paris par la LGV depuis 2017 ; grand projet Euratlantique autour de la gare Saint-Jean ; logement de plus en plus cher." },
      { nom: "Lille", lon: 3.06, lat: 50.63, txt: "Ancienne ville industrielle reconvertie grâce au TGV et à l'Eurostar ; Euralille, 3ᵉ quartier d'affaires de France ; Eurométropole Lille-Kortrijk-Tournai, de part et d'autre de la frontière." },
      { nom: "Toulouse", lon: 1.44, lat: 43.6, txt: "L'une des métropoles du Sud les plus dynamiques : son aire gagne plus de 1 % d'habitants par an." },
      { nom: "Fort-de-France", lon: -61.07, lat: 14.6, txt: "Métropole ultramarine qui concentre les fonctions de commandement de la Martinique, mais perd 1 % d'habitants par an." },
      { nom: "Saint-Étienne", lon: 4.39, lat: 45.44, txt: "Métropole au sens institutionnel, en reconversion difficile dans l'orbite de Lyon : la ville a perdu 50 000 habitants depuis 1968." },
      { nom: "Clichy-sous-Bois", lon: 2.55, lat: 48.91, txt: "Commune de Seine-Saint-Denis, à une vingtaine de kilomètres de Neuilly : 45 % de pauvres ; la ligne 16 du Grand Paris Express doit la désenclaver." },
      { nom: "Neuilly-sur-Seine", lon: 2.27, lat: 48.88, txt: "Commune aisée des Hauts-de-Seine, près de La Défense : 8 % de pauvres ; sanctionnée pour son manque de logements sociaux (loi SRU)." },
      { nom: "Diagonale du nord-est au sud-ouest", txt: "Large bande du territoire où la population baisse ; cinq régions stagnent : Hauts-de-France, Grand Est, Normandie, Bourgogne-Franche-Comté, Centre-Val de Loire." }
    ],
    trous: [
      { titre: "Le réseau urbain français", texte: "Paris, ville [primatiale] et seule métropole [mondiale] française, domine le réseau urbain. Les [métropoles régionales] se renforcent grâce à la [décentralisation], aux [LGV] et aux grands projets. Les [villes moyennes], souvent fragilisées, font l'objet de politiques de revitalisation, tandis que la [périurbanisation] étend l'influence des villes sur presque tout le territoire." },
      { titre: "Des métropoles fragmentées", texte: "Les métropoles françaises sont marquées par une forte [fragmentation socio-spatiale] : quartiers d'affaires et quartiers [aisés] d'un côté, quartiers [prioritaires] de l'autre. La [politique de la ville], la loi [SRU] et le développement des [transports] cherchent à réduire ces inégalités, avec des résultats encore limités." },
      { titre: "Conclusion du thème", texte: "La métropolisation est un processus [mondial] mais [différencié]. Elle concentre les hommes, les richesses et les [fonctions de commandement] dans quelques grandes villes, reliées entre elles au sein de l'[archipel mégalopolitain mondial]. Elle recompose la [hiérarchie urbaine] à toutes les échelles : entre les villes du monde, entre les villes françaises et au sein même des métropoles, où elle accroît les [inégalités] et la [fragmentation]." }
    ],
    capable: [
      "Expliquer pourquoi Paris est une ville primatiale et la seule métropole mondiale française.",
      "Montrer que les métropoles régionales s'affirment de façon inégale (Ouest et Sud, Nord-Est).",
      "Distinguer les deux sens du mot « métropole » : géographique et institutionnel.",
      "Expliquer la fragilisation des villes moyennes, du périurbain et des outre-mer, et les politiques de rééquilibrage.",
      "Expliquer la fragmentation socio-spatiale d'une métropole française et les politiques pour la réduire (politique de la ville, loi SRU, transports).",
      "Localiser Paris et les métropoles régionales : Bordeaux, Grenoble, Lille, Lyon, Marseille, Metz, Montpellier, Nancy, Nantes, Nice, Strasbourg, Toulouse.",
      "Transposer un texte en croquis : le croquis de la France.",
      "Rédiger un développement construit à partir du croquis.",
      "Analyser la formulation d'un sujet de question problématisée et organiser la réponse."
    ]
  }
];
