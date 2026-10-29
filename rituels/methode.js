/* Les ateliers de méthode — fiches méthode et ateliers d'entraînement de la boîte à outils (reviser.html#/methode/<classe>).
   titre    nom de la rubrique
   fiches   { id, titre, d?, icone, resume, cle, structure?: [{ nom, part, taille, txt }], figures?, etapes: [{ titre, points, exemple? }],
              faire, eviter, atelier: "compo" | "doc" | "figures" } — communes à toutes les classes du lycée
   compos   { id, chapitre (identifiant de cours.js), sujet, analyse: [{ q, r, faux, expl }], problematique: { r, faux, expl },
              plan: { type, expl, parties: [{ titre, args }] }, intro / conclusion: [{ role, txt }] }
              rôles : accroche, definitions, contexte, problematique, annonce ; bilan, reponse, ouverture
   docs     { id, chapitre, consigne, doc: { titre, extrait, source }, presentation: [QCM], comprendre: [{ a, vrai, expl }],
              portee: [QCM], modele: { intro, parties: [{ titre, txt }], conclusion } }
              — les documents sont ceux des points de passage de cours.js, recopiés à l'identique
   figures  [{ n, chapitre, titre, sous, nb, items: [{ txt, type: "ponctuel" | "lineaire" | "surfacique", fig, expl }],
              legende: { sujet, parties: [{ titre, items }] } }]
   Un atelier n'apparaît que pour la classe de son chapitre, et seulement si ce chapitre est ouvert aux élèves. */
const METHODE = (function () {
  var FIGURES = [
    { txt: "Une grande ville", type: "ponctuel", fig: "cercle", expl: "Un cercle, dont la taille augmente avec l'importance de la ville." },
    { txt: "Une mine", type: "ponctuel", fig: "triangle", expl: "Un petit symbole (triangle) à l'endroit de la mine." },
    { txt: "Un grand barrage", type: "ponctuel", fig: "carre", expl: "Un symbole (carré) sur le cours d'eau." },
    { txt: "Un port de commerce", type: "ponctuel", fig: "cercle", expl: "Un cercle sur le littoral, proportionnel au trafic." },
    { txt: "Une mégapole", type: "ponctuel", fig: "carre", expl: "Un carré ou un cercle, hiérarchisé par la taille." },
    { txt: "Un fleuve", type: "lineaire", fig: "trait", expl: "Un trait bleu qui suit le cours d'eau." },
    { txt: "Une grande route ou une autoroute", type: "lineaire", fig: "trait", expl: "Un trait continu, plus épais pour un axe majeur." },
    { txt: "L'avancée d'un front pionnier", type: "lineaire", fig: "fleche", expl: "Une flèche qui montre le sens de l'avancée." },
    { txt: "Des flux de migrants", type: "lineaire", fig: "fleche", expl: "Une flèche, dont l'épaisseur indique l'importance du flux." },
    { txt: "Une frontière", type: "lineaire", fig: "pointilles", expl: "Un trait discontinu." },
    { txt: "Une forêt tropicale", type: "surfacique", fig: "aplat", expl: "Un aplat de couleur (vert pour la forêt)." },
    { txt: "Une zone de déforestation", type: "surfacique", fig: "hachures", expl: "Des hachures rouges : un espace menacé." },
    { txt: "Un espace d'agriculture d'exportation", type: "surfacique", fig: "aplat", expl: "Un aplat de couleur (jaune ou orange)." },
    { txt: "Une mégalopole", type: "surfacique", fig: "aplat", expl: "Un aplat autour des grandes villes qu'elle relie." },
    { txt: "Une région exposée aux séismes", type: "surfacique", fig: "hachures", expl: "Des hachures pour une zone de risque." }
  ];

  return {
    titre: "Les ateliers de méthode",
    fiches: [
      {
        id: "composition", titre: "La composition", icone: "essentiel",
        resume: "Répondre à un sujet par un texte organisé : introduction, deux ou trois parties, conclusion.",
        cle: "Une composition n'est pas une récitation : c'est une démonstration organisée qui répond à une problématique, avec des exemples précis. En Seconde, on commence souvent par une réponse organisée plus courte, construite de la même façon.",
        titreStructure: "La structure d'une composition (part du devoir)",
        structure: [
          { nom: "Introduction", part: "≈ 10 %", taille: 12, txt: "Accroche, définition des termes, contexte et bornes, problématique, annonce du plan." },
          { nom: "Partie I", part: "≈ 25 %", taille: 28, txt: "Une idée directrice, deux ou trois arguments, chacun avec un exemple précis." },
          { nom: "Partie II", part: "≈ 25 %", taille: 28, txt: "Même construction ; une phrase de transition entre les parties." },
          { nom: "Partie III", part: "≈ 25 %", taille: 28, txt: "Facultative si deux parties solides suffisent." },
          { nom: "Conclusion", part: "≈ 10 %", taille: 12, txt: "Bilan des parties, réponse claire à la problématique, ouverture." }
        ],
        etapes: [
          { titre: "Analyser le sujet (au brouillon)", points: [
            "Souligner chaque mot et le définir.",
            "Repérer les bornes chronologiques et l'espace : pourquoi commencer et finir à ces dates ?",
            "Identifier les acteurs et le type de sujet (une évolution, un tableau, une comparaison…)."
          ], exemple: "« L'ouverture atlantique et ses conséquences (fin XVᵉ-XVIᵉ siècle) » : ouverture atlantique = essor des voyages et des échanges des Européens à travers l'Atlantique ; fin du XVᵉ siècle = voyages de Colomb (1492) et de Vasco de Gama (1498)." },
          { titre: "Trouver la problématique", points: [
            "Une question qui oblige à expliquer : comment ? pourquoi ? dans quelle mesure ?",
            "Elle reprend les mots du sujet, sans le recopier."
          ], exemple: "Dans quelle mesure l'ouverture atlantique bouleverse-t-elle les relations entre les continents et les peuples ?" },
          { titre: "Mobiliser ses connaissances", points: [
            "Lister au brouillon dates, lieux, acteurs, chiffres, notions.",
            "Ne garder que ce qui répond à la problématique."
          ] },
          { titre: "Construire le plan", points: [
            "Chronologique (pour une évolution), thématique (pour un tableau) ou mixte.",
            "Deux ou trois parties, chacune résumée par une phrase qui répond en partie à la problématique."
          ] },
          { titre: "Rédiger", points: [
            "Introduction et conclusion entièrement rédigées (au brouillon d'abord si possible).",
            "Un paragraphe par argument : idée, explication, exemple précis.",
            "Sauter une ligne entre les parties, aller à la ligne entre les paragraphes.",
            "Garder 5 minutes pour relire (orthographe, dates, noms propres)."
          ] }
        ],
        faire: [
          "Définir les mots du sujet dans l'introduction.",
          "Donner des exemples précis : dates, chiffres, lieux, acteurs.",
          "Écrire des transitions entre les parties.",
          "Respecter les bornes du sujet."
        ],
        eviter: [
          "Réciter tout le cours sans répondre au sujet.",
          "Les titres apparents (I., II.) dans la copie rédigée.",
          "Une conclusion qui répète l'introduction.",
          "Sortir des bornes chronologiques."
        ],
        atelier: "compo"
      },
      {
        id: "analyse-document", titre: "L'analyse de document", icone: "document",
        resume: "Présenter, comprendre et critiquer un ou deux documents pour répondre à une consigne.",
        cle: "On analyse un document pour répondre à la consigne : on le présente, on en extrait les informations utiles, on les explique avec ses connaissances, et on en mesure la portée et les limites.",
        etapes: [
          { titre: "Lire la consigne", points: [
            "Elle donne le fil de la réponse : souligner ses mots-clés.",
            "Elle annonce souvent les parties attendues."
          ] },
          { titre: "Présenter le document", points: [
            "Nature : discours, texte de loi, lettre, affiche, carte, graphique…",
            "Auteur : qui est-il ? quelle est sa fonction, son point de vue ?",
            "Date et contexte : que se passe-t-il à ce moment-là ?",
            "Destinataire : à qui s'adresse-t-il ? dans quel but ?"
          ], exemple: "Ce document est un extrait de la réponse du dominicain Bartolomé de Las Casas à Sepúlveda, lors de la controverse de Valladolid (1550-1551) ; il est publié en 1552." },
          { titre: "Comprendre et expliquer", points: [
            "Prélever les informations utiles en citant le texte entre guillemets.",
            "Expliquer chaque citation avec ses connaissances : c'est ce qui fait la note.",
            "Organiser la réponse en deux ou trois parties qui suivent la consigne."
          ] },
          { titre: "Prendre du recul", points: [
            "Quel est l'intérêt du document pour comprendre la période ?",
            "Quelles sont ses limites : point de vue de l'auteur, ce qu'il ne dit pas, propagande ?"
          ] },
          { titre: "Rédiger", points: [
            "Introduction : présentation du document, contexte, problématique tirée de la consigne, annonce du plan.",
            "Développement : citation → explication → connaissance.",
            "Conclusion : réponse à la consigne, portée du document."
          ] }
        ],
        faire: [
          "Citer le document entre guillemets, avec mesure.",
          "Ajouter des connaissances qui ne sont pas dans le document.",
          "Identifier le point de vue de l'auteur.",
          "Suivre l'ordre de la consigne."
        ],
        eviter: [
          "Paraphraser : répéter le texte avec d'autres mots.",
          "Réciter le cours en oubliant le document.",
          "Prendre le document pour une vérité objective.",
          "Oublier la présentation du document."
        ],
        atelier: "doc"
      },
      {
        id: "croquis", titre: "Le croquis de géographie", d: "geo", icone: "croquis",
        resume: "Représenter une organisation de l'espace sur un fond de carte, avec un titre et une légende organisée.",
        cle: "Un croquis montre une organisation de l'espace pour répondre à un sujet : chaque figuré a un sens, et la légende est organisée en parties, comme un plan.",
        figures: true,
        etapes: [
          { titre: "Analyser le sujet", points: [
            "Le titre du croquis est le sujet, ou une reformulation de celui-ci.",
            "Repérer l'espace et l'échelle : un pays, une région, le monde ?"
          ] },
          { titre: "Construire la légende", points: [
            "Deux ou trois parties titrées, comme le plan d'une composition.",
            "Du général au particulier : les espaces, puis les lieux, puis les flux.",
            "Chaque élément de légende = un figuré + un texte explicatif."
          ] },
          { titre: "Choisir les figurés", points: [
            "Ponctuel pour un lieu, linéaire pour un flux ou une limite, surfacique pour un espace.",
            "Les couleurs ont un sens : chaudes pour le dynamisme ou le danger, froides pour les espaces en retrait.",
            "Une taille de figuré qui augmente avec l'importance du phénomène."
          ] },
          { titre: "Réaliser et nommer", points: [
            "Les aplats d'abord, puis les hachures, puis les figurés linéaires et ponctuels.",
            "La nomenclature : noms des lieux écrits à l'horizontale, au crayon puis au feutre fin.",
            "Le titre en haut, la légende à côté ou en dessous."
          ] }
        ],
        faire: [
          "Un titre précis.",
          "Une légende organisée en parties.",
          "Des couleurs cohérentes.",
          "Écrire les noms (mers, villes, pays) lisiblement."
        ],
        eviter: [
          "Une légende en simple liste.",
          "Trop de figurés : le croquis devient illisible.",
          "Oublier la nomenclature.",
          "Utiliser la même couleur pour deux phénomènes différents."
        ],
        atelier: "figures"
      },
      {
        id: "reviser", titre: "Bien réviser", icone: "cartes",
        resume: "Retenir durablement : se tester, espacer les révisions, alterner.",
        cle: "On retient mieux en essayant de se souvenir qu'en relisant : se tester, plusieurs fois, en espaçant les séances.",
        etapes: [
          { titre: "Se tester plutôt que relire", points: [
            "Relire donne l'impression de savoir ; se tester montre ce qu'on sait vraiment.",
            "Avec les cartes mémoire et les quiz de chaque chapitre : répondre avant de regarder."
          ] },
          { titre: "Espacer les séances", points: [
            "Revoir un chapitre le lendemain, puis 3 jours après, puis une semaine après.",
            "La révision express te propose chaque jour les cartes à revoir."
          ] },
          { titre: "Alterner les chapitres", points: [
            "Mélanger histoire et géographie, et plusieurs chapitres dans une même séance.",
            "Le mode aventure, s'il est ouvert pour ta classe, le fait pour toi."
          ] },
          { titre: "Réviser à deux", points: [
            "Expliquer un chapitre à quelqu'un, sans ses notes, en 3 minutes.",
            "Le duo : chacun son tour sur le même téléphone, celui ou celle qui a le plus de bonnes réponses gagne."
          ] },
          { titre: "S'entraîner aux exercices", points: [
            "Un sujet de composition de temps en temps : au moins l'introduction et le plan détaillé.",
            "Les ateliers de cette page : pas à pas, avec la correction."
          ] }
        ],
        faire: [
          "Des séances courtes (20 à 30 minutes) et régulières.",
          "Commencer par ce qu'on sait le moins.",
          "Dormir : le sommeil fixe les souvenirs."
        ],
        eviter: [
          "Tout réviser la veille.",
          "Relire et surligner sans se tester.",
          "Réviser avec les notifications du téléphone allumées."
        ]
      }
    ],

    compos: [
      {
        id: "ouverture-atlantique", chapitre: "2de-h2-c3",
        sujet: "L'ouverture atlantique et ses conséquences (fin XVᵉ-XVIᵉ siècle)",
        analyse: [
          { q: "Que désigne « l'ouverture atlantique » ?", r: "L'essor des voyages et des échanges des Européens à travers l'océan Atlantique", faux: ["La création d'un nouvel océan", "La fermeture de la Méditerranée aux Européens", "L'arrivée des Amérindiens en Europe"], expl: "À partir de la fin du XVᵉ siècle, les Européens traversent l'Atlantique et longent l'Afrique : l'océan devient un espace d'échanges." },
          { q: "Pourquoi le sujet commence-t-il à la fin du XVᵉ siècle ?", r: "Les voyages de Colomb (1492) et de Vasco de Gama (1498) ouvrent de nouvelles routes", faux: ["L'Empire romain s'effondre", "La Révolution française éclate", "Les Ottomans sont chassés d'Europe"], expl: "Colomb atteint les Caraïbes en 1492, Vasco de Gama atteint l'Inde en 1498 en contournant l'Afrique." },
          { q: "Quels espaces le sujet concerne-t-il ?", r: "L'Europe, l'Afrique et l'Amérique, reliées par l'Atlantique", faux: ["La France seulement", "L'Asie seulement", "L'Europe seulement"], expl: "Les conséquences touchent les trois continents bordant l'Atlantique, et même l'Asie par la route des épices." },
          { q: "Que recouvre le mot « conséquences » ?", r: "Les effets sur les peuples, les territoires et l'économie", faux: ["Seulement les causes des voyages", "Uniquement la vie de Christophe Colomb", "La liste des navires utilisés"], expl: "Le sujet ne demande pas de raconter les voyages, mais d'en montrer les effets." }
        ],
        problematique: {
          r: "Dans quelle mesure l'ouverture atlantique bouleverse-t-elle les relations entre les continents et les peuples ?",
          faux: ["Qui a découvert l'Amérique ?", "Combien de voyages Christophe Colomb a-t-il faits ?", "Quels navires utilisaient les Portugais ?"],
          expl: "Les autres questions appellent une réponse courte ou un récit ; celle-ci oblige à mesurer les bouleversements."
        },
        plan: { type: "thématique", expl: "Trois idées : la conquête du monde par les Européens, ses effets sur les Amérindiens, puis la naissance d'une nouvelle économie-monde.", parties: [
          { titre: "Des Européens qui explorent et conquièrent le monde", args: [
            "Les Portugais contournent l'Afrique : Vasco de Gama atteint l'Inde en 1498.",
            "Colomb atteint les Caraïbes en 1492 ; le traité de Tordesillas (1494) partage le monde entre l'Espagne et le Portugal.",
            "Les conquistadors soumettent les empires amérindiens : Cortés prend Tenochtitlan (1521), Pizarro Cuzco (1533)."
          ] },
          { titre: "Des sociétés amérindiennes bouleversées", args: [
            "Le choc microbien, la guerre et le travail forcé (encomienda) font s'effondrer la population du centre du Mexique.",
            "Lors de la controverse de Valladolid (1550-1551), Las Casas défend les Amérindiens contre Sepúlveda.",
            "Des sociétés métisses naissent, comme à Cholula."
          ] },
          { titre: "Une nouvelle économie-monde", args: [
            "L'argent du Potosí, découvert en 1545, afflue vers l'Europe par Séville.",
            "Les plantations de sucre se développent au Brésil et aux Antilles.",
            "La traite atlantique déporte des Africains réduits en esclavage vers l'Amérique."
          ] }
        ] },
        intro: [
          { role: "accroche", txt: "Le 12 octobre 1492, Christophe Colomb débarque sur l'île de Guanahani, aux Caraïbes : il croit avoir atteint les Indes." },
          { role: "definitions", txt: "L'ouverture atlantique désigne l'essor des voyages et des échanges des Européens à travers l'océan Atlantique ; ses conséquences touchent les peuples, les territoires et l'économie." },
          { role: "contexte", txt: "À la fin du XVᵉ siècle, Portugais et Espagnols cherchent de nouvelles routes vers les épices d'Asie ; au XVIᵉ siècle, ils bâtissent de vastes empires coloniaux." },
          { role: "problematique", txt: "Dans quelle mesure l'ouverture atlantique bouleverse-t-elle les relations entre les continents et les peuples ?" },
          { role: "annonce", txt: "Nous verrons comment les Européens explorent et conquièrent le monde, puis comment les sociétés amérindiennes sont bouleversées, enfin comment naît une nouvelle économie-monde." }
        ],
        conclusion: [
          { role: "bilan", txt: "Explorations, conquêtes, effondrement des peuples amérindiens et naissance d'une économie-monde : l'ouverture atlantique transforme profondément le monde au XVIᵉ siècle." },
          { role: "reponse", txt: "Elle relie durablement l'Europe, l'Afrique et l'Amérique : c'est une première mondialisation, mais elle se fait au prix de l'effondrement des peuples amérindiens et de la déportation des Africains." },
          { role: "ouverture", txt: "Aux XVIIᵉ et XVIIIᵉ siècles, la traite atlantique et l'économie de plantation prennent une ampleur plus grande encore." }
        ]
      },
      {
        id: "etat-royaume", chapitre: "2de-h3-c5",
        sujet: "L'affirmation de l'État dans le royaume de France (XVIᵉ-XVIIᵉ siècle)",
        analyse: [
          { q: "Qu'est-ce qu'un État ?", r: "Un territoire, une population et un pouvoir souverain qui les gouverne", faux: ["Une ville fortifiée", "Une religion officielle", "Une assemblée élue par tous"], expl: "Un État se caractérise par un territoire, une population et une souveraineté." },
          { q: "Que signifie « affirmation » dans ce sujet ?", r: "Le renforcement du pouvoir royal sur le territoire et les habitants", faux: ["La disparition du pouvoir du roi", "L'élection du roi par le peuple", "La division du royaume entre plusieurs rois"], expl: "Le sujet invite à montrer comment le roi étend son autorité… et jusqu'où." },
          { q: "Quels rois sont au cœur du sujet ?", r: "De François Iᵉʳ à Louis XIV", faux: ["Clovis et Charlemagne", "Napoléon Iᵉʳ et Napoléon III", "Louis XVI et Louis XVIII"], expl: "Du XVIᵉ au XVIIᵉ siècle : de François Iᵉʳ (ordonnance de Villers-Cotterêts, 1539) à Louis XIV (Versailles)." }
        ],
        problematique: {
          r: "Comment l'État royal renforce-t-il son emprise sur le territoire et les populations, et quelles limites rencontre-t-il ?",
          faux: ["Quand Louis XIV est-il né ?", "Combien de pièces compte le château de Versailles ?", "Qui était Colbert ?"],
          expl: "Elle tient ensemble le renforcement du pouvoir royal et ses limites : c'est tout l'enjeu du chapitre."
        },
        plan: { type: "thématique", expl: "Contrôler le territoire, s'imposer dans tous les domaines, puis montrer les limites : un plan thématique permet de nuancer.", parties: [
          { titre: "Contrôler le territoire", args: [
            "Les rois agrandissent le domaine royal par la guerre et les mariages ; Vauban fortifie les frontières.",
            "L'ordonnance de Villers-Cotterêts (1539) impose le français dans les actes de justice et d'administration.",
            "Au XVIIᵉ siècle, les intendants appliquent dans les provinces les décisions du roi."
          ] },
          { titre: "Affirmer l'autorité royale dans tous les domaines", args: [
            "Colbert applique le mercantilisme et fonde la Compagnie des Indes orientales (1664).",
            "Louis XIV révoque l'édit de Nantes (1685) au nom de l'unité religieuse.",
            "À Versailles, où la cour s'installe en 1682, l'étiquette attache la noblesse au roi."
          ] },
          { titre: "Un pouvoir qui reste limité", args: [
            "La Fronde (1648-1652) défie le pouvoir royal pendant la minorité de Louis XIV.",
            "Les lois fondamentales et les états provinciaux encadrent l'autorité du roi.",
            "Les guerres coûtent cher : le roi dépend des impôts et des financiers."
          ] }
        ] },
        intro: [
          { role: "accroche", txt: "« L'État, c'est moi » : Louis XIV n'a sans doute jamais prononcé cette phrase, mais elle résume l'image d'un roi tout-puissant." },
          { role: "definitions", txt: "Un État réunit un territoire, une population et un pouvoir souverain ; l'affirmer, c'est renforcer l'emprise du roi sur le royaume." },
          { role: "contexte", txt: "De François Iᵉʳ à Louis XIV, les rois de France construisent une monarchie administrative, dans un royaume déchiré au XVIᵉ siècle par les guerres de Religion." },
          { role: "problematique", txt: "Comment l'État royal renforce-t-il son emprise sur le territoire et les populations, et quelles limites rencontre-t-il ?" },
          { role: "annonce", txt: "Nous verrons comment le roi contrôle le territoire, puis comment il affirme son autorité dans tous les domaines, enfin quelles limites il rencontre." }
        ],
        conclusion: [
          { role: "bilan", txt: "Par l'administration, la guerre, l'économie, la religion et la cour, le roi renforce son emprise sur le royaume." },
          { role: "reponse", txt: "Mais ce pouvoir n'est jamais sans limites : l'« absolutisme » est une affirmation théorique plus qu'une réalité." },
          { role: "ouverture", txt: "Au XVIIIᵉ siècle, les philosophes des Lumières critiquent ce pouvoir, jusqu'à la Révolution de 1789." }
        ]
      },
      {
        id: "amazonie", chapitre: "2de-g1-c12",
        sujet: "L'Amazonie, un espace riche en ressources, convoité et menacé",
        analyse: [
          { q: "Qu'est-ce qu'une ressource ?", r: "Un élément que les sociétés exploitent pour satisfaire leurs besoins", faux: ["Un espace protégé où l'on ne fait rien", "Un phénomène naturel dangereux", "Une ville qui attire les habitants"], expl: "Bois, minerais, terres, eau : ils deviennent des ressources quand les sociétés les exploitent." },
          { q: "Que signifie « convoité » ?", r: "Désiré par de nombreux acteurs qui veulent l'exploiter", faux: ["Abandonné par ses habitants", "Protégé par la loi", "Inaccessible aux hommes"], expl: "Agriculteurs, entreprises minières, orpailleurs, États : beaucoup veulent exploiter l'Amazonie." },
          { q: "Quand un aléa devient-il un risque ?", r: "Quand il touche une société vulnérable", faux: ["Toujours, dès qu'il existe", "Seulement s'il est d'origine naturelle", "Jamais en Amazonie"], expl: "Le risque croise un aléa (sécheresse, crue, pollution) et la vulnérabilité d'une société." }
        ],
        problematique: {
          r: "Pourquoi l'exploitation des richesses de l'Amazonie menace-t-elle à la fois la forêt et les sociétés qui y vivent ?",
          faux: ["Quelle est la longueur de l'Amazone ?", "Combien de pays traverse l'Amazonie ?", "Quel temps fait-il en Amazonie ?"],
          expl: "Elle relie les trois mots du sujet : les ressources, la convoitise et les menaces."
        },
        plan: { type: "thématique", expl: "C'est aussi le plan de la légende du croquis : un environnement exceptionnel, des ressources convoitées, des risques.", parties: [
          { titre: "Un environnement exceptionnel", args: [
            "La plus grande forêt tropicale du monde, autour de l'Amazone et de ses affluents.",
            "Une biodiversité très riche et un puits de carbone essentiel pour le climat.",
            "Des peuples autochtones qui vivent de la forêt."
          ] },
          { titre: "Des ressources convoitées et exploitées", args: [
            "Le bois, les minerais (mine de fer de Carajás) et l'or des orpailleurs.",
            "Des terres pour le soja et l'élevage, conquises par le front pionnier.",
            "L'hydroélectricité des grands barrages, comme Belo Monte."
          ] },
          { titre: "Des risques qui fragilisent la région", args: [
            "Environ 20 % de la forêt a disparu en 50 ans : la déforestation libère du CO₂.",
            "Le mercure de l'orpaillage contamine les poissons, puis les riverains.",
            "Les États coopèrent peu : le pacte de Leticia (2019) n'est pas contraignant."
          ] }
        ] },
        intro: [
          { role: "accroche", txt: "Chaque année, des milliers de kilomètres carrés de forêt amazonienne disparaissent sous les tronçonneuses et les incendies." },
          { role: "definitions", txt: "Une ressource est un élément que les sociétés exploitent ; un espace convoité est désiré par de nombreux acteurs ; il est menacé quand son exploitation crée des risques." },
          { role: "contexte", txt: "Partagée entre plusieurs pays, surtout le Brésil, l'Amazonie est la plus grande forêt tropicale du monde ; depuis les années 1970, des routes comme la Transamazonienne l'ouvrent à l'exploitation." },
          { role: "problematique", txt: "Pourquoi l'exploitation des richesses de l'Amazonie menace-t-elle à la fois la forêt et les sociétés qui y vivent ?" },
          { role: "annonce", txt: "Nous verrons que l'Amazonie est un environnement exceptionnel, que ses ressources sont convoitées et exploitées, et que cette exploitation fait naître des risques." }
        ],
        conclusion: [
          { role: "bilan", txt: "Forêt immense et riche, l'Amazonie attire de nombreux acteurs qui exploitent son bois, ses minerais, ses terres et ses fleuves." },
          { role: "reponse", txt: "Cette exploitation fait reculer la forêt, pollue les fleuves et menace les populations : un aléa devient un risque quand il touche des sociétés vulnérables." },
          { role: "ouverture", txt: "Le changement climatique, qui rend les sécheresses plus fréquentes, fragilise encore davantage la forêt." }
        ]
      },
      {
        id: "revolution-nation", chapitre: "1re-h1-c1",
        sujet: "La Révolution et l'Empire : une nouvelle conception de la nation (1789-1815)",
        analyse: [
          { q: "Que signifie « souveraineté nationale » ?", r: "Le pouvoir appartient à la nation, et non plus au roi", faux: ["Le roi gouverne au nom de Dieu", "Chaque province est indépendante", "L'armée détient le pouvoir"], expl: "La Déclaration des droits de l'homme et du citoyen (1789) affirme que « le principe de toute souveraineté réside essentiellement dans la nation »." },
          { q: "Pourquoi le sujet s'arrête-t-il en 1815 ?", r: "La défaite de Waterloo met fin à l'Empire", faux: ["Louis XVI est exécuté", "La Bastille est prise", "Napoléon est sacré empereur"], expl: "Le 18 juin 1815, Napoléon est vaincu à Waterloo ; les Bourbons reviennent au pouvoir." },
          { q: "Quels espaces faut-il étudier ?", r: "La France, mais aussi l'Europe conquise", faux: ["Paris seulement", "Les colonies seulement", "L'Angleterre seulement"], expl: "Les conquêtes diffusent le modèle français en Europe et y font naître des sentiments nationaux." }
        ],
        problematique: {
          r: "Comment la période révolutionnaire et impériale instaure-t-elle de nouveaux rapports entre la nation et le pouvoir politique, en France et en Europe ?",
          faux: ["Pourquoi Louis XVI a-t-il été guillotiné ?", "Combien de batailles Napoléon a-t-il gagnées ?", "Qu'est-ce que la Bastille ?"],
          expl: "Elle porte sur l'idée centrale du sujet : la nation devient la source du pouvoir."
        },
        plan: { type: "chronologique", expl: "Le sujet décrit une évolution sur 26 ans : un plan chronologique en trois temps montre comment la souveraineté nationale est proclamée, organisée, puis confisquée.", parties: [
          { titre: "1789 : la nation devient souveraine", args: [
            "Le 17 juin 1789, les députés du tiers état se proclament Assemblée nationale.",
            "Le 14 juillet, le peuple de Paris prend la Bastille.",
            "La nuit du 4 août abolit les privilèges ; la Déclaration du 26 août affirme la souveraineté nationale."
          ] },
          { titre: "1790-1799 : quel régime pour la nation ?", args: [
            "La monarchie constitutionnelle de 1791 échoue après la fuite à Varennes et la guerre.",
            "La République est proclamée le 21 septembre 1792 ; Louis XVI est exécuté en janvier 1793.",
            "Menacée, la République suspend les libertés : c'est la Terreur (1793-1794)."
          ] },
          { titre: "1799-1815 : une nation canalisée par Napoléon", args: [
            "Bonaparte prend le pouvoir par le coup d'État du 18 Brumaire (1799) et gouverne par plébiscites.",
            "Le Code civil (1804) conserve l'égalité devant la loi : ce sont les « masses de granit ».",
            "Les conquêtes diffusent le modèle français, mais font naître le nationalisme des peuples dominés."
          ] }
        ] },
        intro: [
          { role: "accroche", txt: "Le 14 juillet 1790, à la fête de la Fédération, des Français venus de tout le pays jurent d'être fidèles à la nation, à la loi et au roi." },
          { role: "definitions", txt: "La nation est une communauté de citoyens qui détient la souveraineté ; avant 1789, le pouvoir appartenait au roi, de droit divin." },
          { role: "contexte", txt: "De la réunion des états généraux (mai 1789) à la défaite de Waterloo (1815), la France connaît la monarchie constitutionnelle, la République puis l'Empire." },
          { role: "problematique", txt: "Comment la période révolutionnaire et impériale instaure-t-elle de nouveaux rapports entre la nation et le pouvoir politique, en France et en Europe ?" },
          { role: "annonce", txt: "Nous verrons comment la nation devient souveraine en 1789, puis comment la Révolution cherche le régime qui lui convient, enfin comment Napoléon canalise la nation." }
        ],
        conclusion: [
          { role: "bilan", txt: "En 1789, la souveraineté passe du roi à la nation ; la République l'organise dans la guerre et la Terreur ; Napoléon la confisque tout en gardant les acquis de 1789." },
          { role: "reponse", txt: "La période impose une idée nouvelle : le pouvoir vient de la nation ; diffusée en Europe, cette idée y fait naître le nationalisme." },
          { role: "ouverture", txt: "Après 1815, la Restauration ne parvient pas à effacer cet héritage : les révolutions de 1830 et de 1848 le rappellent." }
        ]
      },
      {
        id: "deuxieme-republique", chapitre: "1re-h2-c3",
        sujet: "La Deuxième République (1848-1852) : la difficile entrée dans l'âge démocratique",
        analyse: [
          { q: "Que désigne « l'âge démocratique » ?", r: "L'époque où le pouvoir repose sur le vote de tous les citoyens", faux: ["L'époque des rois absolus", "Le règne de Napoléon Iᵉʳ", "La période de la Terreur"], expl: "En 1848, le suffrage devient universel… mais seulement masculin." },
          { q: "Que se passe-t-il en février 1848 ?", r: "Une révolution renverse Louis-Philippe et la République est proclamée", faux: ["Napoléon III est sacré", "La IIIᵉ République est proclamée", "Les femmes obtiennent le droit de vote"], expl: "Les 22-25 février 1848, Louis-Philippe abdique et un gouvernement provisoire proclame la République." },
          { q: "Pourquoi le sujet s'arrête-t-il en 1852 ?", r: "L'Empire est rétabli au profit de Louis-Napoléon Bonaparte", faux: ["Le suffrage universel est supprimé", "La France perd la guerre contre la Prusse", "Lamartine devient président"], expl: "Le 2 décembre 1852, Louis-Napoléon Bonaparte devient l'empereur Napoléon III." }
        ],
        problematique: {
          r: "Pourquoi l'instauration du suffrage universel masculin en 1848 ne suffit-elle pas à trancher la question du régime politique ouverte depuis 1789 ?",
          faux: ["Qui était Lamartine ?", "Combien de Français votent en 1848 ?", "Pourquoi le drapeau français est-il tricolore ?"],
          expl: "Elle pose le paradoxe du sujet : le suffrage universel conduit à la fin de la République."
        },
        plan: { type: "chronologique", expl: "Trois temps courts, de l'enthousiasme de février 1848 au rétablissement de l'Empire.", parties: [
          { titre: "Février-avril 1848 : une République démocratique", args: [
            "Une révolution renverse Louis-Philippe ; un gouvernement provisoire proclame la République.",
            "Le suffrage universel masculin est instauré le 5 mars ; l'esclavage est aboli le 27 avril.",
            "Lamartine refuse le drapeau rouge : la République sera libérale plutôt que sociale."
          ] },
          { titre: "1848-1851 : l'échec du projet républicain", args: [
            "La fermeture des ateliers nationaux provoque les journées de Juin, écrasées par l'armée.",
            "Louis-Napoléon Bonaparte est élu président le 10 décembre 1848 grâce à son nom et au vote paysan.",
            "Le parti de l'Ordre restreint le suffrage universel par la loi du 31 mai 1850."
          ] },
          { titre: "1851-1852 : du coup d'État à l'Empire", args: [
            "Le 2 décembre 1851, Louis-Napoléon dissout l'Assemblée et rétablit le suffrage universel.",
            "Un plébiscite approuve le coup d'État, malgré des résistances, surtout dans les campagnes du Sud.",
            "L'Empire est proclamé le 2 décembre 1852 : la France a le suffrage universel sans la République."
          ] }
        ] },
        intro: [
          { role: "accroche", txt: "En avril 1848, environ 9 millions d'hommes sont appelés à voter, alors qu'on ne comptait que 250 000 électeurs quelques mois plus tôt." },
          { role: "definitions", txt: "L'âge démocratique est celui où le pouvoir repose sur le vote de tous les citoyens ; en 1848, le suffrage universel reste masculin." },
          { role: "contexte", txt: "De la révolution de février 1848 à la proclamation du Second Empire en décembre 1852, la France fait l'expérience d'une République née de la rue." },
          { role: "problematique", txt: "Pourquoi l'instauration du suffrage universel masculin en 1848 ne suffit-elle pas à trancher la question du régime politique ouverte depuis 1789 ?" },
          { role: "annonce", txt: "Nous verrons la naissance d'une République démocratique, puis l'échec du projet républicain, enfin le passage du coup d'État à l'Empire." }
        ],
        conclusion: [
          { role: "bilan", txt: "La République de 1848 instaure le suffrage universel masculin, mais elle se divise, réprime les ouvriers et porte au pouvoir Louis-Napoléon Bonaparte, qui la renverse." },
          { role: "reponse", txt: "Le vote de tous ne suffit pas à fonder la République : les électeurs, surtout paysans, choisissent l'ordre et le nom de Bonaparte." },
          { role: "ouverture", txt: "Il faut attendre les années 1870 pour que la République s'enracine durablement." }
        ]
      },
      {
        id: "metropolisation", chapitre: "1re-g1-c12",
        sujet: "La métropolisation : un processus mondial différencié",
        analyse: [
          { q: "Qu'est-ce que la métropolisation ?", r: "La concentration des hommes, des activités et des fonctions de commandement dans les plus grandes villes", faux: ["La croissance de toutes les petites villes", "Le départ des habitants vers les campagnes", "La construction de villes nouvelles à la campagne"], expl: "Avec la mondialisation, le pouvoir se concentre dans quelques grandes villes reliées en réseau." },
          { q: "Que signifie « différencié » ?", r: "Le processus ne prend ni la même forme ni la même ampleur partout", faux: ["Le processus est identique dans toutes les villes", "Le processus ne concerne que l'Europe", "Le processus est terminé"], expl: "La métropolisation ne produit pas les mêmes effets à New York, à Lagos ou à Saint-Étienne." },
          { q: "À quelles échelles faut-il l'étudier ?", r: "Le monde, les métropoles et leurs quartiers", faux: ["Seulement l'échelle mondiale", "Seulement l'échelle d'un quartier", "Seulement l'échelle de la France"], expl: "Un sujet de géographie gagne à croiser les échelles : c'est le cœur de ce chapitre." }
        ],
        problematique: {
          r: "Comment le processus de métropolisation recompose-t-il la hiérarchie urbaine mondiale et les espaces métropolitains, à différentes échelles ?",
          faux: ["Quelle est la plus grande ville du monde ?", "Combien d'habitants compte Paris ?", "Qu'est-ce qu'un gratte-ciel ?"],
          expl: "Elle oblige à expliquer les recompositions, et à changer d'échelle."
        },
        plan: { type: "multiscalaire", expl: "Du monde aux quartiers : un plan qui change d'échelle à chaque partie, comme le demande le sujet.", parties: [
          { titre: "À l'échelle mondiale : des métropoles qui concentrent le pouvoir", args: [
            "45 % des humains vivent en ville en 2025 ; les mégapoles se multiplient, surtout en Asie.",
            "Les métropoles mondiales, dominées par Londres et New York, forment l'archipel mégalopolitain mondial.",
            "Le rayonnement dépend des fonctions de commandement plus que de la population : Jakarta, la ville la plus peuplée, n'est pas une métropole mondiale de premier rang."
          ] },
          { titre: "À l'échelle des métropoles : des villes qui se transforment", args: [
            "Le quartier central des affaires concentre sièges sociaux et finance.",
            "De nouvelles centralités apparaissent en périphérie : quartiers d'affaires, technopôles, aéroports.",
            "La ville s'étale, et des mégalopoles relient parfois plusieurs métropoles."
          ] },
          { titre: "Des inégalités à toutes les échelles", args: [
            "Entre les métropoles des Nords et les villes des Suds, où plus d'un milliard de personnes vivent dans des bidonvilles.",
            "À l'intérieur des métropoles : gentrification, quartiers fermés et quartiers informels.",
            "Certaines villes déclinent, comme Saint-Étienne, qui perd des habitants."
          ] }
        ] },
        intro: [
          { role: "accroche", txt: "Avec près de 42 millions d'habitants, Jakarta est la ville la plus peuplée du monde, mais elle pèse bien moins que Londres ou New York dans la mondialisation." },
          { role: "definitions", txt: "La métropolisation est la concentration des hommes, des activités et des fonctions de commandement dans les grandes villes ; elle est différenciée, car elle varie selon les lieux." },
          { role: "contexte", txt: "Depuis les années 1990, la mondialisation accélère ce processus, alors que l'urbanisation progresse surtout dans les Suds." },
          { role: "problematique", txt: "Comment le processus de métropolisation recompose-t-il la hiérarchie urbaine mondiale et les espaces métropolitains, à différentes échelles ?" },
          { role: "annonce", txt: "Nous verrons qu'à l'échelle mondiale quelques métropoles concentrent le pouvoir, puis que les métropoles se transforment, enfin que la métropolisation creuse les inégalités à toutes les échelles." }
        ],
        conclusion: [
          { role: "bilan", txt: "La métropolisation hiérarchise les villes du monde, transforme l'organisation des métropoles et creuse les inégalités." },
          { role: "reponse", txt: "Elle recompose les territoires à toutes les échelles, au profit de quelques métropoles mondiales, mais de manière très inégale entre les Nords et les Suds, et au sein même des villes." },
          { role: "ouverture", txt: "En France, la métropolisation renforce Paris et quelques grandes métropoles, au détriment d'autres territoires." }
        ]
      }
    ],

    docs: [
      {
        id: "las-casas", chapitre: "2de-h2-c3",
        consigne: "En analysant le document, montrez comment Las Casas défend les Amérindiens, et quelles sont les limites de sa position.",
        doc: {
          titre: "La réponse de Las Casas à Sepúlveda (1551)",
          extrait: "« Les Indiens ont d'aussi bons entendements, des esprits aussi perspicaces, aussi capables et dociles pour n'importe quelle science morale et doctrine spéculative […]. Et je ne parle pas de leurs admirables progrès dans les arts mécaniques et les arts libéraux, comme la lecture et l'écriture, la pratique de tous les instruments de musique, la grammaire, la logique […]. Le docteur Sepúlveda aurait dû s'informer auprès des serviteurs de Dieu qui ont sué beaucoup de nuits et de jours pour la conversion de ces gens, et ne pas donner crédit aux hommes tyranniques qui l'ont persuadé d'écrire son traité pour justifier les brigandages, les vols et les morts qu'ils ont commis […]. »",
          source: "Bartolomé de Las Casas, dominicain, ancien encomendero devenu évêque du Chiapas, réponse à Sepúlveda, 1551, publiée en 1552 (d'après La controverse entre Las Casas et Sepúlveda, Vrin, 2007, extraits adaptés)."
        },
        presentation: [
          { q: "Quelle est la nature de ce document ?", r: "Un texte argumentatif, tiré d'un débat entre théologiens", faux: ["Un journal de bord de Colomb", "Une loi du roi d'Espagne", "Une lettre d'un chef aztèque"], expl: "Las Casas répond point par point aux arguments de Sepúlveda." },
          { q: "Qui est l'auteur ?", r: "Un dominicain, ancien colon devenu évêque du Chiapas", faux: ["Un conquistador", "Le roi d'Espagne", "Un marchand de Séville"], expl: "Ancien encomendero, Las Casas est devenu un défenseur des Amérindiens." },
          { q: "Dans quel contexte le texte est-il écrit ?", r: "La controverse de Valladolid (1550-1551), sur la légitimité de la conquête", faux: ["Le premier voyage de Colomb", "La prise de Constantinople", "La Révolution française"], expl: "Charles Quint réunit des théologiens pour savoir si l'on peut soumettre les Amérindiens par la force." }
        ],
        comprendre: [
          { a: "Pour Las Casas, les Indiens sont incapables d'apprendre.", vrai: false, expl: "Ils ont au contraire « d'aussi bons entendements » et font d'« admirables progrès » dans les arts." },
          { a: "Il cite les progrès des Indiens en musique et en écriture.", vrai: true, expl: "« La lecture et l'écriture, la pratique de tous les instruments de musique »." },
          { a: "Il accuse des colons d'avoir inspiré le traité de Sepúlveda.", vrai: true, expl: "Des « hommes tyranniques » l'ont persuadé d'écrire pour « justifier les brigandages, les vols et les morts »." },
          { a: "Las Casas s'oppose à la conversion des Indiens au christianisme.", vrai: false, expl: "Il loue les « serviteurs de Dieu » qui travaillent à « la conversion de ces gens »." }
        ],
        portee: [
          { q: "Quelle est la portée de la controverse de Valladolid ?", r: "Elle affirme la dignité des Amérindiens, mais ne remet pas en cause la colonisation", faux: ["Elle met fin à la colonisation espagnole", "Elle donne officiellement raison à Sepúlveda", "Elle abolit l'esclavage des Africains"], expl: "La conquête et l'évangélisation continuent ; le débat montre pourtant que la violence des colons choque en Europe." },
          { q: "Quelle limite de la position de Las Casas faut-il souligner ?", r: "Il défend les Indiens, mais ne conteste ni la présence espagnole ni l'évangélisation", faux: ["Il refuse de parler des Indiens", "Il souhaite l'extermination des Indiens", "Il défend les conquistadors"], expl: "Las Casas veut une conversion pacifique, pas le départ des Espagnols." },
          { q: "Quel est le point de vue de l'auteur ?", r: "Celui d'un religieux engagé, qui veut convaincre", faux: ["Celui d'un observateur neutre", "Celui d'un conquistador", "Celui d'un historien d'aujourd'hui"], expl: "Le texte est un plaidoyer : il faut le lire comme une argumentation." }
        ],
        modele: {
          intro: "Ce document est un extrait de la réponse du dominicain Bartolomé de Las Casas à Sepúlveda, lors de la controverse de Valladolid (1550-1551), publiée en 1552. Charles Quint a réuni des théologiens pour savoir si l'on peut soumettre les Amérindiens par la force. Comment Las Casas défend-il les Amérindiens, et quelles sont les limites de sa position ? Nous verrons ses arguments, puis leurs limites.",
          parties: [
            { titre: "Une défense de la dignité des Amérindiens", txt: "Contre Sepúlveda, qui les juge « serviles et barbares » par nature, Las Casas affirme que les Indiens ont « d'aussi bons entendements » que les Européens et cite leurs « admirables progrès » en écriture et en musique. Il accuse les colons, ces « hommes tyranniques », d'avoir inspiré Sepúlveda pour justifier leurs « brigandages » : il dénonce ainsi les violences de la conquête et du travail forcé, qui font s'effondrer la population amérindienne." },
            { titre: "Une position qui ne remet pas en cause la colonisation", txt: "Las Casas ne demande pas le départ des Espagnols : il salue les religieux qui travaillent à « la conversion de ces gens ». Il veut une évangélisation pacifique. La controverse n'aboutit d'ailleurs à aucune décision qui arrête la conquête ; et dans le même temps, les Européens développent la traite des Africains vers les plantations." }
          ],
          conclusion: "Las Casas défend avec force l'égale dignité des Amérindiens et dénonce les violences des colons, mais il ne conteste ni la présence espagnole ni l'évangélisation : la controverse de Valladolid ne remet pas en cause la colonisation."
        }
      },
      {
        id: "edit-nantes", chapitre: "2de-h3-c5",
        consigne: "En analysant le document, montrez comment Henri IV rétablit la paix religieuse dans le royaume, et quelles en sont les limites.",
        doc: {
          titre: "L'édit de Nantes (1598)",
          extrait: "« VI. Avons permis et permettons à ceux de la religion prétendue réformée de vivre et demeurer partout dans notre royaume sans être vexés, brutalisés ni astreints à faire chose contre leur conscience. […] IX. Nous permettons aussi à ceux de ladite religion de continuer l'exercice public de leur religion […] XXII. Ordonnons qu'il ne sera fait ni différence, ni distinction entre les religions pour être admis dans les universités, collèges et écoles, et les malades et pauvres dans les hôpitaux et les léproseries. »",
          source: "Henri IV, édit de Nantes, avril 1598 (extraits, langue modernisée)."
        },
        presentation: [
          { q: "Quelle est la nature de ce document ?", r: "Un édit, c'est-à-dire une loi royale", faux: ["Un traité de paix entre deux pays", "Un sermon de pasteur", "Une lettre privée du roi"], expl: "Un édit est une décision du roi qui s'applique dans tout le royaume." },
          { q: "Qui est l'auteur ?", r: "Henri IV, ancien chef protestant converti au catholicisme", faux: ["Louis XIV", "Le pape", "Jean Calvin"], expl: "Protestant, Henri IV s'est converti au catholicisme en 1593 pour être accepté comme roi." },
          { q: "Dans quel contexte l'édit est-il signé ?", r: "À la fin des guerres de Religion (1562-1598)", faux: ["Après la révocation de 1685", "Pendant la Fronde", "Au début de la Révolution"], expl: "Après huit guerres de Religion et le massacre de la Saint-Barthélemy (1572), le roi veut rétablir la paix." }
        ],
        comprendre: [
          { a: "Les protestants peuvent vivre partout dans le royaume.", vrai: true, expl: "Article VI : « vivre et demeurer partout dans notre royaume »." },
          { a: "Les protestants peuvent être obligés d'agir contre leur conscience.", vrai: false, expl: "Ils ne doivent pas être « astreints à faire chose contre leur conscience »." },
          { a: "L'édit permet aux protestants de célébrer leur culte en public.", vrai: true, expl: "Article IX : « continuer l'exercice public de leur religion », dans les lieux fixés par l'édit." },
          { a: "Les protestants sont exclus des écoles et des hôpitaux.", vrai: false, expl: "Article XXII : « ni différence, ni distinction entre les religions »." }
        ],
        portee: [
          { q: "Quelle est la portée de l'édit ?", r: "Il met fin aux guerres de Religion en accordant la liberté de conscience et un culte limité aux protestants", faux: ["Il fait du protestantisme la religion du royaume", "Il interdit le catholicisme", "Il chasse les protestants du royaume"], expl: "Le catholicisme reste la religion du roi et du royaume : l'édit tolère les protestants." },
          { q: "Que révèle l'expression « religion prétendue réformée » ?", r: "Le roi tolère le protestantisme sans le reconnaître comme une religion égale au catholicisme", faux: ["Le roi est devenu protestant", "Le protestantisme est interdit", "Le roi ignore tout du protestantisme"], expl: "« Prétendue » : pour le pouvoir catholique, cette réforme n'est pas légitime." },
          { q: "Que devient l'édit en 1685 ?", r: "Louis XIV le révoque par l'édit de Fontainebleau", faux: ["Il est étendu aux juifs", "Il devient une loi européenne", "Il est confirmé par Napoléon"], expl: "Au nom de l'unité religieuse, Louis XIV interdit le culte protestant ; près de 180 000 protestants s'exilent." }
        ],
        modele: {
          intro: "Ce document est un extrait de l'édit de Nantes, une loi signée par le roi Henri IV en avril 1598. Il met fin aux guerres de Religion qui déchirent le royaume depuis 1562. Comment Henri IV rétablit-il la paix religieuse, et quelles en sont les limites ? Nous verrons les droits accordés aux protestants, puis les limites de cette tolérance.",
          parties: [
            { titre: "Des droits accordés aux protestants", txt: "Le roi permet aux protestants de « vivre et demeurer partout » dans le royaume sans être « astreints à faire chose contre leur conscience » : c'est la liberté de conscience. Il autorise « l'exercice public » de leur culte et interdit toute « distinction » pour entrer dans les écoles ou les hôpitaux. Par cet édit, l'État s'impose au-dessus des partis religieux pour rétablir la paix." },
            { titre: "Une tolérance limitée", txt: "L'édit parle de « religion prétendue réformée » : le catholicisme reste la religion du roi et du royaume, et le culte protestant n'est permis que dans certains lieux. Cette tolérance dépend de la volonté du roi : en 1685, Louis XIV révoque l'édit par l'édit de Fontainebleau, au nom de l'unité religieuse." }
          ],
          conclusion: "Par l'édit de Nantes, Henri IV rétablit la paix en accordant aux protestants la liberté de conscience et un culte limité. Mais cette tolérance, décidée par le roi, peut être retirée par le roi : c'est ce que fait Louis XIV en 1685."
        }
      },
      {
        id: "bill-of-rights", chapitre: "2de-h3-c6",
        consigne: "En analysant le document, montrez comment le Bill of Rights limite le pouvoir du roi au profit du Parlement.",
        doc: {
          titre: "Le Bill of Rights (1689)",
          extrait: "« Les Lords spirituels et temporels et les Communes […] déclarent […] : 1. Que le prétendu pouvoir de suspendre les lois […] par l'autorité royale, sans le consentement du Parlement, est illégal. […] 4. Que toute levée d'argent pour l'usage de la Couronne, sous prétexte de la prérogative royale, sans le consentement du Parlement, est illégale. […] 6. Que la levée et l'entretien d'une armée dans le royaume en temps de paix, sans le consentement du Parlement, est contraire aux lois. […] 13. […] il est nécessaire de réunir fréquemment le Parlement. »",
          source: "Le Bill of Rights (Déclaration des droits), 1689 (manuel d'histoire, p. 197)."
        },
        presentation: [
          { q: "Quelle est la nature de ce document ?", r: "Une déclaration des droits adoptée par le Parlement", faux: ["Un décret du roi Louis XIV", "Une lettre de Voltaire", "Une constitution républicaine"], expl: "Le Bill of Rights est un texte voté par le Parlement anglais." },
          { q: "Qui en sont les auteurs ?", r: "Les Lords et les Communes, c'est-à-dire le Parlement anglais", faux: ["Le roi Jacques II", "Les philosophes des Lumières", "Le pape"], expl: "Les Lords siègent à la Chambre haute, les Communes à la Chambre basse." },
          { q: "Dans quel contexte est-il adopté ?", r: "La Glorieuse Révolution : Jacques II est chassé, Guillaume d'Orange et Marie montent sur le trône", faux: ["La guerre de Cent Ans", "La révolution américaine", "La Révolution française"], expl: "En 1688-1689, le Parlement chasse Jacques II ; les nouveaux souverains doivent accepter cette déclaration." }
        ],
        comprendre: [
          { a: "Le roi ne peut pas suspendre les lois sans l'accord du Parlement.", vrai: true, expl: "Article 1 : ce pouvoir, « sans le consentement du Parlement, est illégal »." },
          { a: "Le roi peut lever des impôts librement.", vrai: false, expl: "Article 4 : toute levée d'argent sans le consentement du Parlement « est illégale »." },
          { a: "Le roi peut entretenir une armée en temps de paix sans l'accord du Parlement.", vrai: false, expl: "Article 6 : c'est « contraire aux lois »." },
          { a: "Le Parlement doit être réuni souvent.", vrai: true, expl: "Article 13 : « il est nécessaire de réunir fréquemment le Parlement »." }
        ],
        portee: [
          { q: "Quelle est la portée du Bill of Rights ?", r: "L'Angleterre devient une monarchie parlementaire, où le roi partage le pouvoir avec le Parlement", faux: ["L'Angleterre devient une République", "Le roi devient un monarque absolu", "Le Parlement est supprimé"], expl: "Les lois, les impôts et l'armée passent sous le contrôle du Parlement." },
          { q: "Qui s'inspire de ce modèle au XVIIIᵉ siècle ?", r: "Des philosophes des Lumières comme Voltaire et Montesquieu", faux: ["Louis XIV", "Les conquistadors", "Les empereurs de Chine"], expl: "Voltaire admire les libertés anglaises dans les Lettres philosophiques (1734)." },
          { q: "Quelle limite faut-il souligner ?", r: "Le Parlement ne représente qu'une minorité de propriétaires", faux: ["Le texte donne le droit de vote à toutes les femmes", "Le texte supprime la monarchie", "Le texte est écrit par le roi"], expl: "Seule une petite partie de la population élit les députés des Communes." }
        ],
        modele: {
          intro: "Ce document est un extrait du Bill of Rights, une déclaration des droits adoptée en 1689 par le Parlement anglais, les Lords et les Communes. Il est rédigé lors de la Glorieuse Révolution, qui chasse le roi Jacques II au profit de Guillaume d'Orange et de Marie. Comment ce texte limite-t-il le pouvoir du roi au profit du Parlement ? Nous verrons ce que le roi ne peut plus faire, puis la place nouvelle du Parlement.",
          parties: [
            { titre: "Un roi qui ne peut plus gouverner seul", txt: "Le roi ne peut plus « suspendre les lois », lever de l'argent ni entretenir une armée en temps de paix « sans le consentement du Parlement ». Le texte met fin à l'arbitraire royal, que Jacques II était accusé d'exercer : avec l'Habeas Corpus (1679), il protège les sujets contre un pouvoir sans contrôle." },
            { titre: "Un Parlement au cœur du pouvoir", txt: "Le Parlement contrôle désormais les lois, les impôts et l'armée, et il doit être « réuni fréquemment ». L'Angleterre devient une monarchie parlementaire, admirée au XVIIIᵉ siècle par Voltaire. Mais ce Parlement ne représente qu'une minorité de propriétaires." }
          ],
          conclusion: "Le Bill of Rights soumet le pouvoir du roi au consentement du Parlement : l'Angleterre devient une monarchie parlementaire, qui sert de modèle aux philosophes des Lumières."
        }
      },
      {
        id: "lamartine", chapitre: "1re-h2-c3",
        consigne: "En analysant le document, montrez quelle République Lamartine défend face aux manifestants.",
        doc: {
          titre: "Lamartine refuse le drapeau rouge (25 février 1848)",
          extrait: "« Hier, vous me demandiez d'usurper, au nom du peuple de Paris, sur les droits de trente-cinq millions d'hommes, de leur voter une république absolue au lieu d'une république investie de la force de leur consentement […] ; aujourd'hui, vous nous demandez le drapeau rouge à la place du drapeau tricolore. […] C'est que le drapeau tricolore, citoyens, a fait le tour du monde, avec la République et l'Empire, avec nos libertés et nos gloires, et que le drapeau rouge n'a fait que le tour du champ de Mars, traîné dans les flots de sang du peuple. »",
          source: "« M. de Lamartine au peuple », La Presse, 26 février 1848 (paroles recueillies la veille devant l'Hôtel de Ville)."
        },
        presentation: [
          { q: "Quelle est la nature de ce document ?", r: "Un discours rapporté par un journal", faux: ["Une loi de la République", "Un poème de Lamartine", "Une lettre privée"], expl: "Le journal La Presse publie les paroles de Lamartine prononcées la veille." },
          { q: "Qui est Lamartine en février 1848 ?", r: "Un poète, membre du gouvernement provisoire", faux: ["Le roi des Français", "Le président de la République élu", "Un chef ouvrier"], expl: "Poète célèbre, Lamartine est ministre des Affaires étrangères du gouvernement provisoire." },
          { q: "À qui s'adresse-t-il ?", r: "Aux manifestants, surtout des ouvriers parisiens, venus réclamer le drapeau rouge", faux: ["Aux électeurs de toute la France", "Aux députés de l'Assemblée", "À Louis-Philippe"], expl: "Le 25 février, des manifestants envahissent la place de l'Hôtel de Ville." }
        ],
        comprendre: [
          { a: "Lamartine veut une République qui repose sur le consentement de toute la nation.", vrai: true, expl: "Une « république investie de la force de leur consentement », celui de « trente-cinq millions d'hommes »." },
          { a: "Lamartine parle au nom du seul peuple de Paris.", vrai: false, expl: "Il refuse au contraire d'« usurper, au nom du peuple de Paris », les droits de toute la nation." },
          { a: "Pour lui, le drapeau tricolore rappelle les libertés et les gloires de la France.", vrai: true, expl: "Il « a fait le tour du monde, avec la République et l'Empire, avec nos libertés et nos gloires »." },
          { a: "Lamartine accepte le drapeau rouge comme drapeau national.", vrai: false, expl: "Il le refuse : il n'a fait que « le tour du champ de Mars, traîné dans les flots de sang du peuple »." }
        ],
        portee: [
          { q: "Quelle République Lamartine choisit-il ?", r: "Une République libérale, fondée sur le vote de la nation, plutôt qu'une République sociale", faux: ["Une République dirigée par les seuls ouvriers", "Une monarchie constitutionnelle", "Un Empire"], expl: "Le suffrage universel masculin est instauré quelques jours plus tard, le 5 mars 1848." },
          { q: "Que réclament les manifestants avec le drapeau rouge ?", r: "Une République sociale qui rompe avec le passé", faux: ["Le retour du roi", "La guerre contre l'Angleterre", "La fin du suffrage universel"], expl: "Pour eux, le drapeau rouge est le « symbole de nos misères et de la rupture avec le passé »." },
          { q: "Quelle limite le document présente-t-il ?", r: "C'est la version de Lamartine, qu'il réécrit encore en 1849 pour rassurer ses lecteurs", faux: ["Le texte a été écrit par un ouvrier", "Le texte est une loi", "Le texte n'a jamais été publié"], expl: "En 1849, après les journées de Juin, il ajoute « en 91 et en 93 » pour associer le drapeau rouge aux violences révolutionnaires." }
        ],
        modele: {
          intro: "Ce document reproduit les paroles prononcées par Lamartine, poète et membre du gouvernement provisoire, devant l'Hôtel de Ville le 25 février 1848, publiées le lendemain dans La Presse. La République vient d'être proclamée après la chute de Louis-Philippe, et des manifestants réclament le drapeau rouge. Quelle République Lamartine défend-il ? Nous verrons qu'il oppose la nation au peuple de Paris, puis le drapeau tricolore au drapeau rouge.",
          parties: [
            { titre: "La nation entière plutôt que le peuple de Paris", txt: "Lamartine refuse d'« usurper, au nom du peuple de Paris », les droits de « trente-cinq millions d'hommes » : la République doit reposer sur le « consentement » de toute la nation. Quelques jours plus tard, le gouvernement provisoire instaure le suffrage universel masculin (5 mars 1848)." },
            { titre: "Le drapeau tricolore contre le drapeau rouge", txt: "Le drapeau tricolore évoque « nos libertés et nos gloires », celles de la Révolution et de l'Empire ; le drapeau rouge, au contraire, est associé au sang versé. Pour les ouvriers, il symbolise une République sociale, qui réponde à leurs « misères ». Lamartine choisit une République libérale et modérée. Il s'agit cependant de son propre point de vue, qu'il réécrit en 1849." }
          ],
          conclusion: "En refusant le drapeau rouge, Lamartine choisit une République libérale, fondée sur le vote de la nation, plutôt que la République sociale voulue par les ouvriers parisiens. Cette opposition éclate quelques mois plus tard, lors des journées de Juin 1848."
        }
      },
      {
        id: "appel-2-decembre", chapitre: "1re-h2-c3",
        consigne: "En analysant le document, montrez comment Louis-Napoléon Bonaparte justifie son coup d'État.",
        doc: {
          titre: "L'appel au peuple du 2 décembre 1851",
          extrait: "« Français ! La situation actuelle ne peut durer plus longtemps. […] L'Assemblée, qui devait être le plus ferme appui de l'ordre, est devenue un foyer de complots. […] elle attente au pouvoir que je tiens directement du Peuple ; […] je l'ai dissoute, et je rends le Peuple entier juge entre elle et moi. »",
          source: "« Proclamation du Président de la République. Appel au peuple », affiche, Paris, 2 décembre 1851, musée Carnavalet."
        },
        presentation: [
          { q: "Quelle est la nature de ce document ?", r: "Une proclamation affichée dans Paris", faux: ["Un article de loi voté par l'Assemblée", "Un roman de Victor Hugo", "Une lettre privée"], expl: "Le matin du coup d'État, des affiches sont placardées sur les murs de Paris." },
          { q: "Qui est l'auteur ?", r: "Louis-Napoléon Bonaparte, président de la République élu en 1848", faux: ["Napoléon Iᵉʳ", "Lamartine", "Le roi Louis-Philippe"], expl: "Neveu de Napoléon Iᵉʳ, il a été élu président le 10 décembre 1848 avec environ 74 % des voix." },
          { q: "Dans quel contexte ?", r: "Le président, qui ne peut pas être réélu, entre en conflit avec l'Assemblée", faux: ["La guerre contre la Prusse", "La révolution de février 1848", "La fin de la Seconde Guerre mondiale"], expl: "La Constitution de 1848 interdit la réélection immédiate du président ; l'Assemblée a refusé de la réviser." }
        ],
        comprendre: [
          { a: "Bonaparte accuse l'Assemblée de comploter.", vrai: true, expl: "Elle est « devenue un foyer de complots »." },
          { a: "Il affirme tenir son pouvoir de l'Assemblée.", vrai: false, expl: "Il dit tenir son pouvoir « directement du Peuple »." },
          { a: "Il annonce la dissolution de l'Assemblée.", vrai: true, expl: "« Je l'ai dissoute »." },
          { a: "Il promet de démissionner.", vrai: false, expl: "Il propose au contraire que le peuple soit « juge entre elle et moi »." }
        ],
        portee: [
          { q: "Comment le peuple est-il consulté ?", r: "Par un plébiscite, les 20 et 21 décembre 1851, qui approuve le coup d'État", faux: ["Par de nouvelles élections législatives libres", "Par un vote réservé aux riches", "Il n'est jamais consulté"], expl: "Le suffrage universel masculin, rétabli par Bonaparte, approuve massivement son coup de force." },
          { q: "Quel régime naît de ce coup d'État ?", r: "Un régime autoritaire, puis le Second Empire en 1852", faux: ["La IIIᵉ République", "Une monarchie parlementaire", "Une démocratie libérale"], expl: "L'Empire est proclamé le 2 décembre 1852 : Louis-Napoléon devient Napoléon III." },
          { q: "Quelle limite le document présente-t-il ?", r: "Il justifie un coup de force et ne dit rien de la répression des opposants", faux: ["Il a été écrit par les opposants au président", "Il raconte toute la répression", "Il date du XXᵉ siècle"], expl: "Des milliers d'opposants sont arrêtés ou exilés, comme Victor Hugo." }
        ],
        modele: {
          intro: "Ce document est une proclamation affichée dans Paris le 2 décembre 1851 par Louis-Napoléon Bonaparte, président de la République élu en 1848. Ne pouvant être réélu, il est en conflit avec l'Assemblée et organise un coup d'État. Comment le justifie-t-il ? Nous verrons qu'il accuse l'Assemblée, puis qu'il fonde son pouvoir sur le peuple.",
          parties: [
            { titre: "Une Assemblée accusée", txt: "Le président affirme que « la situation actuelle ne peut durer » et que l'Assemblée, au lieu de défendre l'ordre, est devenue « un foyer de complots » qui « attente » à son pouvoir. Il se présente ainsi comme le défenseur de l'ordre, face à une Assemblée dominée par le parti de l'Ordre, qui a restreint le suffrage universel en 1850." },
            { titre: "Un pouvoir fondé sur le peuple", txt: "Il dit tenir son pouvoir « directement du Peuple » et rend « le Peuple entier juge » : il rétablit le suffrage universel et organise un plébiscite, qui approuve le coup d'État les 20 et 21 décembre 1851. C'est le césarisme : un pouvoir personnel qui s'appuie sur l'appel au peuple. Mais l'affiche ne dit rien de la répression qui frappe les opposants." }
          ],
          conclusion: "Louis-Napoléon Bonaparte justifie son coup d'État en accusant l'Assemblée et en s'appuyant sur le peuple. Le plébiscite lui donne raison, et l'Empire est rétabli un an plus tard : la France a le suffrage universel sans la République."
        }
      }
    ],

    figures: [
      {
        n: "2nde", chapitre: "2de-g1-c12",
        titre: "Les figurés et la légende du croquis", sous: "Choisir le bon figuré, puis organiser la légende du croquis de l'Amazonie", nb: 10,
        items: FIGURES,
        legende: {
          sujet: "Croquis : l'Amazonie, un espace riche en ressources, convoité et menacé",
          parties: [
            { titre: "Un environnement exceptionnel", items: ["Forêt tropicale", "L'Amazone et ses affluents"] },
            { titre: "Des ressources convoitées et exploitées", items: ["Grande ville (Manaus, Belém)", "Agriculture d'exportation (soja, élevage)", "Mine (Carajás)", "Grand barrage (Belo Monte, Tucuruí)", "Grande route (Transamazonienne)"] },
            { titre: "Des risques qui fragilisent la région", items: ["Front pionnier", "Arc de déforestation", "Orpaillage et pollution au mercure"] }
          ]
        }
      },
      {
        n: "1ere", chapitre: "1re-g1-c12",
        titre: "Les figurés et la légende du croquis", sous: "Choisir le bon figuré, puis organiser la légende d'un croquis sur la métropolisation", nb: 10,
        items: FIGURES,
        legende: {
          sujet: "Croquis : la métropolisation, un processus mondial différencié",
          parties: [
            { titre: "Des métropoles qui dominent le monde", items: ["Métropole mondiale de premier rang (New York, Londres)", "Autre grande métropole mondiale (Paris, Tokyo, Shanghai…)", "Mégalopole (Nord-Est des États-Unis, de Londres à Milan, Japon)"] },
            { titre: "Des métropoles en forte croissance dans les Suds", items: ["Mégapole à forte croissance (Lagos, Mumbai, Jakarta)", "Région où l'urbanisation progresse vite (Afrique subsaharienne, Asie du Sud)"] },
            { titre: "Des métropoles reliées en réseau", items: ["Flux majeurs entre les grandes métropoles", "Archipel mégalopolitain mondial"] }
          ]
        }
      }
    ]
  };
})();
