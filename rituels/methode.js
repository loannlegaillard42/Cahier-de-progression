/* Les ateliers de méthode — fiches méthode et ateliers d'entraînement de la boîte à outils (reviser.html#/methode/<classe>).
   titre    nom de la rubrique
   fiches   { id, titre, n? (classes : collège ou lycée ; sans n, toutes), court (nom court du genre), d?, icone, resume, cle,
              structure?: [{ nom, part, taille, txt }], figures?, etapes: [{ titre, points, exemple? }],
              faire, eviter, atelier: "dc" | "compo" | "doc" | "figures" }
   dcs      développement construit (collège) : { id, chapitre, sujet, analyse: [QCM], tri: [{ t, garder, expl? }],
              plan: { parties: [{ titre, idees }] }, liens: [QCM], modele: { intro, paragraphes, conclusion } }
              — dans le modèle, les mots entre ** (mots de liaison, vocabulaire) sont mis en couleur
   compos   { id, chapitre (identifiant de cours.js), sujet, analyse: [{ q, r, faux, expl }], problematique: { r, faux, expl },
              plan: { type, expl, parties: [{ titre, args }] }, intro / conclusion: [{ role, txt }] }
              rôles : accroche, definitions, contexte, problematique, annonce ; bilan, reponse, ouverture
   docs     { id, chapitre, consigne, doc: { titre, extrait | image, alt?, notes?, source, credit? }, presentation: [QCM],
              comprendre: [{ a, vrai, expl }], portee: [QCM], modele: { intro, parties: [{ titre, txt }], conclusion } }
              au collège : questions: [..], prelever?: [QCM], modele: { reponses: [une réponse rédigée par question] }
              — les documents sont ceux des points de passage de cours.js ou des dossiers du professeur, recopiés à l'identique
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
  // en 5e, sur le chapitre « La croissance démographique et ses effets »
  var FIGURES_5E = [
    { txt: "New Delhi, une très grande ville", type: "ponctuel", fig: "cercle", expl: "Un cercle, plus gros quand la ville est plus peuplée." },
    { txt: "L'Inde, pays le plus peuplé du monde, sur une carte du monde", type: "ponctuel", fig: "etoile", expl: "Sur une carte du monde, un pays peut être signalé par un symbole : l'étoile du croquis fait en classe." },
    { txt: "Le Nigeria, pays le plus peuplé d'Afrique, sur une carte du monde", type: "ponctuel", fig: "cercle", expl: "Un symbole (un rond) pour le signaler, comme sur le croquis fait en classe." },
    { txt: "Un grand fleuve (le Gange, en Inde)", type: "lineaire", fig: "trait", expl: "Un trait bleu qui suit le cours du fleuve." },
    { txt: "L'exode rural : des habitants quittent les campagnes pour les villes", type: "lineaire", fig: "fleche", expl: "Une flèche, de la campagne vers la ville." },
    { txt: "Une frontière entre deux pays", type: "lineaire", fig: "pointilles", expl: "Un trait discontinu." },
    { txt: "Une route ou une voie ferrée", type: "lineaire", fig: "trait", expl: "Un trait continu." },
    { txt: "Les régions où la population va beaucoup augmenter d'ici 2050", type: "surfacique", fig: "aplat", expl: "Un aplat de couleur chaude (rouge), comme sur le croquis fait en classe." },
    { txt: "Les régions où la population stagne ou diminue", type: "surfacique", fig: "aplat", expl: "Un aplat de couleur froide (bleu), comme sur le croquis fait en classe." },
    { txt: "Les quartiers de bidonvilles d'une grande ville", type: "surfacique", fig: "hachures", expl: "Des hachures sur le plan de la ville : un espace où les conditions de vie sont difficiles." },
    { txt: "Une région où une partie de la population souffre de la faim", type: "surfacique", fig: "hachures", expl: "Des hachures : un espace en difficulté." }
  ];
  var COLLEGE = ["6e", "5e", "4e", "3e"], LYCEE = ["2nde", "1ere", "Tle"];

  return {
    titre: "Les ateliers de méthode",
    fiches: [
      {
        id: "composition", titre: "La composition", n: LYCEE, court: "composition", icone: "essentiel",
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
        id: "analyse-document", titre: "L'analyse de document", n: LYCEE, court: "analyse de document", icone: "document",
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
        id: "croquis", titre: "Le croquis de géographie", n: LYCEE, court: "croquis", d: "geo", icone: "croquis",
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
        id: "developpement-construit", titre: "Le développement construit", n: COLLEGE, court: "développement construit", icone: "essentiel",
        resume: "Répondre à une consigne par un texte organisé en paragraphes, avec des connaissances précises.",
        cle: "Un développement construit est un texte rédigé et organisé : une courte introduction, deux ou trois paragraphes reliés par des mots de liaison, une conclusion. Il montre que tu sais utiliser tes connaissances (dates, lieux, personnages, vocabulaire) pour répondre à la consigne.",
        titreStructure: "La structure d'un développement construit",
        structure: [
          { nom: "Introduction", part: "1 ou 2 phrases", taille: 14, txt: "Présenter le sujet : de quoi parle-t-on, quand et où ?" },
          { nom: "Paragraphe 1", part: "une idée", taille: 30, txt: "Une idée, expliquée avec des exemples précis : dates, lieux, personnages, vocabulaire." },
          { nom: "Paragraphe 2", part: "une idée", taille: 30, txt: "Une autre idée, introduite par un mot de liaison (ensuite, de plus…)." },
          { nom: "Paragraphe 3", part: "facultatif", taille: 22, txt: "Si le sujet le demande : une troisième idée." },
          { nom: "Conclusion", part: "1 ou 2 phrases", taille: 14, txt: "Répondre clairement à la consigne." }
        ],
        etapes: [
          { titre: "Comprendre la consigne", points: [
            "Souligne le verbe : raconter (dans l'ordre chronologique), décrire (dire comment c'est), expliquer (dire comment ou pourquoi), montrer (prouver avec des exemples).",
            "Repère le thème, les dates et le lieu du sujet."
          ], exemple: "« Raconte comment l'islam naît en Arabie et comment les califes construisent un immense empire » : raconter = suivre l'ordre des événements, de Mahomet aux Abbassides." },
          { titre: "Faire la liste de ses idées (au brouillon)", points: [
            "Note tout ce que tu sais : dates, lieux, personnages, mots du vocabulaire.",
            "Barre ce qui ne répond pas à la consigne ou sort des dates du sujet."
          ] },
          { titre: "Organiser ses idées", points: [
            "Regroupe les idées qui vont ensemble : chaque groupe fera un paragraphe.",
            "Pour raconter, suis l'ordre chronologique ; pour expliquer ou montrer, un paragraphe par idée."
          ] },
          { titre: "Rédiger", points: [
            "Une introduction courte qui présente le sujet.",
            "Un paragraphe par idée : va à la ligne à chaque nouveau paragraphe.",
            "Relie tes phrases avec des mots de liaison.",
            "Une conclusion qui répond à la consigne."
          ], exemple: "Mots de liaison : d'abord, ensuite, enfin (l'ordre) ; car, en effet (la cause) ; donc, c'est pourquoi, ainsi (la conséquence) ; mais, cependant (l'opposition) ; par exemple (un exemple)." },
          { titre: "Se relire", points: [
            "Vérifie les dates, les noms propres et l'orthographe des mots du vocabulaire.",
            "Vérifie que tu as bien répondu à la consigne."
          ] }
        ],
        faire: [
          "Écrire des phrases complètes.",
          "Utiliser le vocabulaire du chapitre.",
          "Donner des exemples précis : dates, lieux, personnages.",
          "Aller à la ligne à chaque paragraphe."
        ],
        eviter: [
          "Répondre par une liste à tirets.",
          "Recopier la leçon sans répondre à la consigne.",
          "Mélanger l'ordre des événements quand on raconte.",
          "Oublier l'introduction ou la conclusion."
        ],
        atelier: "dc"
      },
      {
        id: "document-college", titre: "Analyser un document", n: COLLEGE, court: "analyse de document", icone: "document",
        resume: "Présenter un texte ou une image, y prélever des informations et les expliquer avec ses connaissances.",
        cle: "Pour étudier un document, on le présente (nature, auteur, date, sujet), on y cherche les informations demandées en citant le document, puis on les explique avec ce qu'on a appris. On se demande aussi qui parle, et pourquoi.",
        etapes: [
          { titre: "Lire les questions, puis le document", points: [
            "Lis les questions avant le document : tu sais ce que tu cherches.",
            "Lis le document deux fois, crayon en main : souligne les mots importants."
          ] },
          { titre: "Présenter le document", points: [
            "Nature : un texte (récit, loi, lettre…), une image (enluminure, mosaïque, photographie), une carte…",
            "Auteur : qui l'a écrit ou réalisé ? Quelle est sa fonction ?",
            "Date : quand ? Au moment des faits, ou plus tard ?",
            "Sujet : de quoi parle-t-il ?"
          ], exemple: "Ce document est un extrait du Livre des pays, écrit en 891 par al-Ya'qubi, un géographe arabe. Il décrit Bagdad, la capitale des califes abbassides." },
          { titre: "Prélever des informations", points: [
            "Réponds par une phrase complète.",
            "Cite le texte entre guillemets « … » pour prouver ta réponse.",
            "Pour une image : décris ce que tu vois (premier plan, arrière-plan, personnages, détails)."
          ] },
          { titre: "Expliquer avec ses connaissances", points: [
            "Explique la citation avec tes mots et avec ce que tu as appris en cours.",
            "Utilise le vocabulaire du chapitre."
          ] },
          { titre: "Garder un regard critique", points: [
            "Qui parle ? Un auteur peut admirer un souverain ou défendre un camp, et embellir ce qu'il raconte.",
            "Le document montre-t-il tout ? Que manque-t-il ?"
          ] }
        ],
        faire: [
          "Présenter le document avant de l'étudier.",
          "Citer le document entre guillemets.",
          "Répondre par des phrases complètes.",
          "Ajouter ce que tu sais du cours."
        ],
        eviter: [
          "Recopier tout le texte.",
          "Répondre sans regarder le document.",
          "Croire que l'auteur est toujours objectif.",
          "Répondre par un seul mot."
        ],
        atelier: "doc"
      },
      {
        id: "carte-college", titre: "Lire et compléter une carte", n: COLLEGE, court: "carte", d: "geo", icone: "croquis",
        resume: "Comprendre une carte grâce à son titre et à sa légende, puis la compléter avec les bons figurés.",
        cle: "Une carte a toujours un titre, une légende, une orientation et une échelle. Dans la légende, chaque figuré a un sens : un point pour un lieu, une ligne ou une flèche pour un déplacement ou une limite, une surface colorée pour un espace.",
        figures: true,
        etapes: [
          { titre: "Lire le titre", points: [
            "Il dit de quoi parle la carte : le thème, l'espace, parfois la date."
          ] },
          { titre: "Lire la légende", points: [
            "Chaque figuré correspond à une information.",
            "Les couleurs ont un sens : des couleurs chaudes (rouge, orange) pour ce qui augmente ou est en difficulté, des couleurs froides (bleu, vert) pour ce qui stagne ou diminue."
          ] },
          { titre: "Se repérer", points: [
            "Cherche les continents, les océans, les pays et les villes.",
            "Utilise l'orientation (le nord) et l'échelle."
          ] },
          { titre: "Compléter une carte", points: [
            "Colorie d'abord les surfaces, puis trace les lignes et les flèches, puis place les points.",
            "Écris les noms à l'horizontale, lisiblement.",
            "Complète la légende : chaque figuré avec son explication."
          ] }
        ],
        faire: [
          "Commencer par lire le titre et la légende.",
          "Utiliser les mêmes couleurs sur la carte et dans la légende.",
          "Écrire les noms lisiblement."
        ],
        eviter: [
          "Colorier sans regarder la légende.",
          "Oublier le titre.",
          "Utiliser la même couleur pour deux informations différentes."
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
            "Un sujet d'entraînement de temps en temps (développement construit au collège, composition au lycée) : au moins l'introduction et le plan.",
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

    dcs: [
      {
        id: "deux-empires", chapitre: "5e-h1-c1",
        sujet: "Montre que l'empereur byzantin et Charlemagne sont à la fois des héritiers de Rome et des empereurs chrétiens.",
        analyse: [
          { q: "Que demande le verbe « Montre » ?", r: "Prouver une idée avec des exemples précis", faux: ["Dessiner une carte des deux empires", "Raconter toute la vie de Charlemagne", "Donner son avis personnel"], expl: "Montrer, c'est prouver : chaque idée doit être appuyée par un exemple (une date, un lieu, un personnage)." },
          { q: "De quels empereurs parle le sujet ?", r: "Le basileus de l'Empire byzantin et Charlemagne, empereur carolingien", faux: ["Les empereurs romains de l'Antiquité", "Le calife et le pape", "Clovis et le pape"], expl: "Le sujet compare les deux empires chrétiens du chapitre : Byzance à l'est, l'Empire carolingien à l'ouest." },
          { q: "Quelles sont les deux idées à démontrer ?", r: "Ils sont héritiers de Rome, et ils sont chrétiens", faux: ["Ils sont riches, et ils sont puissants", "Ils sont alliés, et ils sont ennemis", "Ils sont jeunes, et ils sont guerriers"], expl: "Deux idées, donc deux paragraphes : l'héritage de Rome, puis le christianisme." }
        ],
        tri: [
          { t: "Le basileus est couronné par le patriarche dans l'église Sainte-Sophie.", garder: true, expl: "Cela montre que l'empereur byzantin est chrétien." },
          { t: "Le 25 décembre 800, Charlemagne est couronné empereur par le pape à Rome.", garder: true, expl: "Couronné à Rome par le pape : il est à la fois héritier de Rome et chrétien." },
          { t: "Justinien fait rassembler les lois des anciens empereurs romains dans le Code Justinien.", garder: true, expl: "Il reprend les lois romaines : c'est un héritier de Rome." },
          { t: "Les missi dominici contrôlent les comtes dans tout l'Empire.", garder: false, expl: "C'est la façon de gouverner l'Empire : utile pour un autre sujet." },
          { t: "En 843, le traité de Verdun partage l'Empire carolingien.", garder: false, expl: "Cela parle du partage de l'Empire, pas de l'héritage de Rome ni du christianisme de l'empereur." },
          { t: "En 1453, les Turcs prennent Constantinople.", garder: false, expl: "C'est la fin de l'Empire byzantin : cela ne répond pas à la consigne." }
        ],
        plan: { parties: [
          { titre: "Des héritiers de Rome", idees: [
            "L'Empire byzantin est l'ancien Empire romain d'Orient, qui survit après 476.",
            "Justinien rassemble les lois des anciens empereurs romains dans le Code Justinien.",
            "En 800, Charlemagne est acclamé « empereur des Romains » et appelé « Auguste »."
          ] },
          { titre: "Des empereurs chrétiens", idees: [
            "Le basileus est couronné par le patriarche dans l'église Sainte-Sophie de Constantinople.",
            "Charlemagne est couronné empereur par le pape dans la basilique Saint-Pierre de Rome.",
            "Sur ses pièces de monnaie, Charlemagne fait inscrire « religion chrétienne »."
          ] }
        ] },
        liens: [
          { q: "« Le basileus règne sur l'ancien Empire romain d'Orient. ___, il fait rassembler les lois romaines dans un code. » Quel mot de liaison convient ?", r: "De plus", faux: ["Pourtant", "C'est pourquoi"], expl: "« De plus » ajoute une idée qui va dans le même sens." },
          { q: "« Charlemagne est couronné par le pape. ___, son pouvoir vient de Dieu. » Quel mot de liaison convient ?", r: "Ainsi", faux: ["Pourtant", "Par exemple"], expl: "« Ainsi » introduit une conséquence : couronné par le pape, il tient son pouvoir de Dieu." },
          { q: "« Les deux empereurs se disent héritiers de Rome, ___ l'un règne à Constantinople et l'autre à Aix-la-Chapelle. » Quel mot de liaison convient ?", r: "mais", faux: ["donc", "car"], expl: "« Mais » marque une opposition : ils ont un point commun, mais des capitales différentes." },
          { q: "Par quel mot de liaison peut commencer la conclusion ?", r: "En conclusion", faux: ["Tout d'abord", "Par exemple"], expl: "« En conclusion » (ou « Pour conclure », « Ainsi ») annonce la réponse finale à la consigne." }
        ],
        modele: {
          intro: "Au Moyen Âge, deux empires se partagent l'héritage de l'Empire romain : l'**Empire byzantin**, à l'est, et l'**Empire carolingien** de Charlemagne, à l'ouest. Leurs empereurs sont à la fois des héritiers de Rome et des empereurs chrétiens.",
          paragraphes: [
            "**Tout d'abord**, ces empereurs sont des **héritiers de Rome**. L'Empire byzantin est l'ancien Empire romain d'Orient, qui survit après la disparition de l'Empire d'Occident en 476. **Ainsi**, l'empereur **Justinien** (527-565) fait rassembler les lois des anciens empereurs romains dans le **Code Justinien**. **De même**, en 800, à Rome, Charlemagne est acclamé « empereur des Romains » et appelé « **Auguste** », comme les empereurs de l'Antiquité.",
            "**Ensuite**, ce sont des **empereurs chrétiens**. Le **basileus** est couronné par le **patriarche** dans l'église **Sainte-Sophie** de Constantinople : il est considéré comme l'élu de Dieu. **De son côté**, Charlemagne est couronné empereur par le **pape** Léon III dans la basilique Saint-Pierre de Rome, le 25 décembre 800. Il fait **même** inscrire « religion chrétienne » sur ses pièces de monnaie."
          ],
          conclusion: "**En conclusion**, le basileus comme Charlemagne se présentent comme les continuateurs des empereurs romains et tiennent leur pouvoir de Dieu. **Mais** l'Empire byzantin dure jusqu'en 1453, alors que l'Empire carolingien est partagé dès 843."
        }
      },
      {
        id: "naissance-islam", chapitre: "5e-h1-c2",
        sujet: "Raconte comment l'islam naît en Arabie et comment les califes construisent un immense empire (VIIᵉ-VIIIᵉ siècles).",
        analyse: [
          { q: "Que demande le verbe « Raconte » ?", r: "Présenter les faits dans l'ordre chronologique, avec des dates", faux: ["Décrire un lieu sans parler du temps", "Comparer deux religions", "Donner son opinion sur l'islam"], expl: "Raconter, c'est suivre l'ordre des événements : de 622 à 762, avec des mots qui montrent le temps qui passe." },
          { q: "Quelles sont les bornes chronologiques du sujet ?", r: "Les VIIᵉ et VIIIᵉ siècles, de Mahomet aux Abbassides", faux: ["Le XIIIᵉ siècle, avec la prise de Bagdad", "L'Antiquité romaine", "Le XXᵉ siècle"], expl: "VIIᵉ siècle : naissance de l'islam (622) ; VIIIᵉ siècle : fin des conquêtes et fondation de Bagdad (762)." },
          { q: "Quel espace est concerné ?", r: "L'Arabie, puis un empire qui va de l'Atlantique à l'Indus", faux: ["Seulement la ville de La Mecque", "L'Europe carolingienne", "L'Empire byzantin"], expl: "L'islam naît en Arabie ; les conquêtes créent un empire immense autour de la Méditerranée et jusqu'en Asie." }
        ],
        tri: [
          { t: "En 622, Mahomet quitte La Mecque pour Médine : c'est l'Hégire.", garder: true },
          { t: "Après la mort de Mahomet, en 632, les califes dirigent les musulmans.", garder: true },
          { t: "Les conquêtes arabes vont de l'océan Atlantique jusqu'à l'Indus.", garder: true },
          { t: "En 762, les Abbassides fondent Bagdad.", garder: true },
          { t: "En 1258, les Mongols prennent Bagdad.", garder: false, expl: "C'est au XIIIᵉ siècle : en dehors des bornes du sujet." },
          { t: "En 1054, catholiques et orthodoxes se séparent.", garder: false, expl: "Cela concerne les chrétiens, et c'est en dehors des bornes du sujet." },
          { t: "Charlemagne gouverne depuis Aix-la-Chapelle.", garder: false, expl: "C'est l'Empire carolingien : un autre chapitre." }
        ],
        plan: { parties: [
          { titre: "La naissance de l'islam en Arabie", idees: [
            "Selon la tradition musulmane, Mahomet, un marchand de La Mecque, prêche un dieu unique.",
            "En 622, il part pour Médine : c'est l'Hégire, l'an 1 du calendrier musulman.",
            "En 630, il reprend La Mecque ; à sa mort, en 632, une grande partie de l'Arabie est convertie."
          ] },
          { titre: "Les conquêtes des califes", idees: [
            "Après 632, les califes, successeurs de Mahomet, mènent des conquêtes.",
            "En un peu plus d'un siècle, l'empire s'étend de l'Atlantique à l'Indus.",
            "L'expansion est arrêtée devant Constantinople (718) et à Poitiers (732)."
          ] },
          { titre: "Des capitales qui changent avec les dynasties", idees: [
            "En 661, les califes omeyyades s'installent à Damas.",
            "En 750, les Abbassides remplacent les Omeyyades.",
            "En 762, les Abbassides fondent Bagdad, leur nouvelle capitale."
          ] }
        ] },
        liens: [
          { q: "« Les habitants de La Mecque s'opposent à Mahomet. ___, en 622, il part pour Médine. » Quel mot de liaison convient ?", r: "C'est pourquoi", faux: ["Pourtant", "Par exemple"], expl: "« C'est pourquoi » introduit une conséquence : l'opposition des Mecquois explique son départ." },
          { q: "« Les califes mènent de grandes conquêtes. ___, l'empire s'étend de l'Atlantique à l'Indus. » Quel mot de liaison convient ?", r: "Ainsi", faux: ["Cependant", "Car"], expl: "« Ainsi » introduit le résultat des conquêtes." },
          { q: "Pour raconter, quelle expression montre le temps qui passe ?", r: "Quelques années plus tard", faux: ["C'est pourquoi", "Par exemple"], expl: "Quand on raconte, on utilise des repères de temps : d'abord, puis, en 622, quelques années plus tard, enfin…" }
        ],
        modele: {
          intro: "Au VIIᵉ siècle, une nouvelle religion monothéiste, l'**islam**, naît en Arabie. En un peu plus d'un siècle, les successeurs de son prophète construisent un immense empire.",
          paragraphes: [
            "**D'abord**, selon la tradition musulmane, **Mahomet**, un marchand de **La Mecque**, prêche l'existence d'un dieu unique. Les habitants de La Mecque s'opposent à lui : **c'est pourquoi**, en **622**, il part pour **Médine**. Ce départ, l'**Hégire**, marque l'an 1 du calendrier musulman. **En 630**, Mahomet reprend La Mecque ; **à sa mort, en 632**, une grande partie de l'Arabie s'est convertie à l'islam.",
            "**Ensuite**, ses successeurs, les **califes**, à la fois chefs politiques et religieux, mènent des conquêtes. **En un peu plus d'un siècle**, l'empire s'étend de l'océan Atlantique jusqu'à l'Indus. L'expansion est arrêtée devant **Constantinople** en 718 et à **Poitiers** en 732.",
            "**Enfin**, la capitale change avec les dynasties. **En 661**, les califes **omeyyades** s'installent à **Damas**. **En 750**, les **Abbassides** les remplacent, **puis** fondent **Bagdad** en **762**."
          ],
          conclusion: "**Ainsi**, en moins d'un siècle et demi, l'islam né en Arabie est devenu la religion d'un immense **empire** dirigé par les califes, de l'Atlantique à l'Indus."
        }
      },
      {
        id: "seigneurie", chapitre: "5e-h2-c3",
        sujet: "Explique comment le seigneur domine les paysans de sa seigneurie.",
        analyse: [
          { q: "Que demande le verbe « Explique comment » ?", r: "Dire de quelle manière cela se passe, en donnant des exemples précis", faux: ["Faire la liste des châteaux forts", "Raconter une bataille", "Décrire un paysage"], expl: "Expliquer comment, c'est montrer les moyens : ici, comment le seigneur impose son pouvoir aux paysans." },
          { q: "Qu'est-ce qu'une seigneurie ?", r: "Le domaine sur lequel un seigneur exerce son pouvoir", faux: ["Une ville libre dirigée par des bourgeois", "Un monastère", "Le royaume du roi de France"], expl: "Le seigneur y possède les terres, rend la justice et protège les habitants." },
          { q: "Quels acteurs le sujet met-il face à face ?", r: "Le seigneur et les paysans", faux: ["Le roi et le pape", "Les bourgeois et les marchands", "Le vassal et son seigneur"], expl: "Attention : le vassal est un seigneur lié à un autre seigneur. Le sujet porte sur les paysans." }
        ],
        tri: [
          { t: "Le seigneur possède les terres, rend la justice et protège les habitants.", garder: true },
          { t: "Les paysans doivent des corvées pour cultiver la réserve.", garder: true },
          { t: "Ils paient le cens, le champart et les banalités pour le moulin et le four.", garder: true },
          { t: "Les serfs ne peuvent ni quitter la seigneurie ni se marier sans l'autorisation du seigneur.", garder: true },
          { t: "Le vassal jure fidélité à son seigneur lors de la cérémonie de l'hommage.", garder: false, expl: "C'est un lien entre seigneurs (la vassalité), pas entre le seigneur et les paysans." },
          { t: "Les chevaliers s'entraînent dans des tournois.", garder: false, expl: "C'est la vie des seigneurs, pas leur domination sur les paysans." }
        ],
        plan: { parties: [
          { titre: "Un seigneur maître de la seigneurie", idees: [
            "Le seigneur possède les terres : il garde la réserve et loue des tenures aux paysans.",
            "Il rend la justice et protège les habitants depuis son château.",
            "Les serfs ne peuvent ni quitter la seigneurie ni se marier sans son autorisation."
          ] },
          { titre: "Des paysans qui doivent de nombreuses obligations", idees: [
            "Ils travaillent gratuitement sur la réserve : ce sont les corvées.",
            "Ils paient des taxes en argent (le cens) et en nature (le champart).",
            "Ils paient des banalités pour utiliser le moulin, le four ou le pressoir du seigneur."
          ] }
        ] },
        liens: [
          { q: "« Le seigneur protège les paysans. ___, ceux-ci lui doivent des corvées et des taxes. » Quel mot de liaison convient ?", r: "En échange", faux: ["Pourtant", "Par exemple"], expl: "« En échange » montre ce que chacun doit à l'autre : la protection contre les obligations." },
          { q: "« Les paysans doivent de nombreuses taxes. ___, ils donnent le champart, une part de leur récolte. » Quel mot de liaison convient ?", r: "Par exemple", faux: ["Pourtant", "En conclusion"], expl: "« Par exemple » introduit un exemple précis." },
          { q: "« Les serfs ne sont pas libres ; ___, les vilains sont libres, mais doivent aussi des taxes. » Quel mot de liaison convient ?", r: "en revanche", faux: ["donc", "c'est pourquoi"], expl: "« En revanche » oppose deux situations : les serfs et les vilains." }
        ],
        modele: {
          intro: "Au Moyen Âge, à partir du XIᵉ siècle, les campagnes sont organisées en **seigneuries**. Le seigneur y domine les paysans, qui forment la grande majorité de la population.",
          paragraphes: [
            "**D'abord**, le seigneur est le maître de la seigneurie. Il possède les terres : il garde pour lui la **réserve** et loue des **tenures** aux paysans. Depuis son château, il rend la justice et protège les habitants. Les **serfs** ne peuvent ni quitter la seigneurie ni se marier sans son autorisation.",
            "**Ensuite**, les paysans, serfs ou **vilains**, doivent de nombreuses obligations à leur seigneur. Ils viennent travailler gratuitement sur la réserve : ce sont les **corvées**. Ils paient aussi des taxes en argent, le **cens**, et en nature, **par exemple** le **champart**, une part de la récolte. **Enfin**, ils paient des **banalités** pour utiliser le moulin, le four ou le pressoir du seigneur."
          ],
          conclusion: "**En conclusion**, le seigneur domine les paysans par la possession de la terre, la justice et les obligations qu'il leur impose. **En échange**, il leur doit sa protection."
        }
      },
      {
        id: "inde-defi", chapitre: "5e-g1-c1",
        sujet: "Explique pourquoi la croissance démographique est un défi pour l'Inde.",
        analyse: [
          { q: "Que demande « Explique pourquoi » ?", r: "Donner les causes et les conséquences, avec des exemples précis", faux: ["Dessiner une carte de l'Inde", "Raconter l'histoire de l'Inde", "Faire la liste des villes indiennes"], expl: "On explique d'où vient la croissance de la population, puis les défis qu'elle pose." },
          { q: "Que signifie « croissance démographique » ?", r: "L'augmentation de la population", faux: ["L'augmentation de la richesse", "La croissance des villes seulement", "La baisse du nombre de naissances"], expl: "La population augmente quand il y a plus de naissances que de décès : c'est l'accroissement naturel." },
          { q: "Quel est l'espace étudié ?", r: "L'Inde, pays le plus peuplé du monde", faux: ["Le Nigeria", "Le monde entier", "La Chine"], expl: "Le sujet porte sur l'étude de cas de l'Inde." }
        ],
        tri: [
          { t: "Depuis 2023, l'Inde est le pays le plus peuplé du monde, avec plus de 1,4 milliard d'habitants.", garder: true },
          { t: "40 % des Indiens ont moins de 25 ans.", garder: true },
          { t: "Avec l'exode rural, les villes comme New Delhi grandissent très vite et les bidonvilles s'étendent.", garder: true },
          { t: "Les inégalités restent fortes entre les États indiens.", garder: true },
          { t: "Le Nigeria est le pays le plus peuplé d'Afrique.", garder: false, expl: "C'est exact, mais le sujet porte sur l'Inde." },
          { t: "En Europe et au Japon, la population stagne ou diminue.", garder: false, expl: "Cela ne concerne pas l'Inde." }
        ],
        plan: { parties: [
          { titre: "Une population très nombreuse et jeune", idees: [
            "Depuis 1950, la population de l'Inde a presque quadruplé : plus de 1,4 milliard d'habitants.",
            "Depuis 2023, c'est le pays le plus peuplé du monde.",
            "40 % des Indiens ont moins de 25 ans."
          ] },
          { titre: "De nombreux défis à relever", idees: [
            "Il faut des écoles et des emplois pour tous ces jeunes.",
            "Avec l'exode rural, les villes grandissent très vite et beaucoup de migrants vivent dans des bidonvilles.",
            "Les inégalités restent fortes entre les États, et la population commence à vieillir."
          ] }
        ] },
        liens: [
          { q: "« La mortalité a baissé plus vite que la natalité. ___, la population a presque quadruplé. » Quel mot de liaison convient ?", r: "C'est pourquoi", faux: ["Pourtant", "D'abord"], expl: "« C'est pourquoi » introduit la conséquence de la baisse de la mortalité." },
          { q: "« Beaucoup d'habitants quittent les campagnes ; ___, les villes grandissent très vite. » Quel mot de liaison convient ?", r: "par conséquent", faux: ["pourtant", "par exemple"], expl: "L'exode rural a pour conséquence la croissance rapide des villes." },
          { q: "« Les Indiens vivent mieux qu'en 1950. ___, les inégalités restent fortes. » Quel mot de liaison convient ?", r: "Cependant", faux: ["Donc", "Ainsi"], expl: "« Cependant » marque une opposition : des progrès, mais des inégalités." }
        ],
        modele: {
          intro: "Depuis 2023, l'**Inde** est le pays le plus peuplé du monde. Cette forte **croissance démographique** est un défi pour son **développement**.",
          paragraphes: [
            "**Tout d'abord**, la population indienne est très nombreuse et très jeune. Depuis 1950, la **mortalité** a baissé plus vite que la **natalité** : **c'est pourquoi** la population a presque quadruplé, jusqu'à dépasser 1,4 milliard d'habitants. **Aujourd'hui**, 40 % des Indiens ont moins de 25 ans.",
            "**Ensuite**, cette croissance pose de nombreux défis. Il faut des écoles et des emplois pour tous ces jeunes. Avec l'**exode rural**, les villes comme **New Delhi** grandissent très vite, et beaucoup de migrants vivent dans des **bidonvilles**. Les Indiens vivent mieux qu'en 1950 : l'espérance de vie est passée de 41 à 72 ans. **Cependant**, les **inégalités** restent fortes entre les États."
          ],
          conclusion: "**En conclusion**, la croissance démographique est un défi pour l'Inde : il faut loger, scolariser et employer une population immense et jeune. **Mais** les femmes ont aujourd'hui moins d'enfants : la croissance ralentit et la population commence à vieillir."
        }
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
      },
      // 5e : documents des dossiers de la classe (séance 2 du chapitre 1, séance 2 du chapitre 2) et de la fiche du chapitre de géographie
      {
        id: "couronnement-basileus", chapitre: "5e-h1-c1",
        consigne: "Lis le document deux fois. Dans chaque réponse, cite un mot ou une phrase du texte entre guillemets.",
        questions: [
          "Présente le document : sa nature, son auteur, sa date et ce dont il parle.",
          "Relève deux éléments qui montrent que le pouvoir de l'empereur vient de Dieu.",
          "Comment les dignitaires montrent-ils qu'ils obéissent à l'empereur ?",
          "Ce texte est écrit d'après un empereur, Constantin VII. Pourquoi faut-il le lire avec un regard critique ?"
        ],
        doc: {
          titre: "Le couronnement du basileus",
          extrait: [
            "« L'empereur entre dans l'église Sainte-Sophie de Constantinople. Il revêt les habits du sacre puis pénètre dans la nef (1) avec le patriarche (2). Le patriarche fait la prière sur le manteau pourpre de l'empereur, dont on revêt le souverain. Ensuite, le patriarche fait la prière sur la couronne impériale et la place en personne sur la tête du souverain.",
            "Aussitôt le peuple lance par trois fois l'acclamation : « Saint, Saint, Saint, Gloire à Dieu dans les hauteurs et paix sur la terre ! » Puis : « Nombreuses années au grand empereur ! » Couronné, il s'assoit sur son fauteuil et tous les dignitaires (3) entrent, tombant à terre et baisant ses genoux. »"
          ],
          notes: [
            "(1) Allée centrale d'une église.",
            "(2) Chef de l'Église byzantine ; il n'est pas soumis au pape de Rome.",
            "(3) Personnes importantes dans la gestion de l'Empire, de l'armée, de l'Église."
          ],
          source: "D'après Constantin VII, Le Livre des cérémonies, Xᵉ siècle."
        },
        presentation: [
          { q: "Quelle est la nature de ce document ?", r: "Un texte qui décrit une cérémonie", faux: ["Une loi de l'empereur", "Une lettre du pape", "Une enluminure"], expl: "Le texte décrit, étape par étape, le couronnement (le sacre) d'un empereur." },
          { q: "Qui est l'auteur ?", r: "Constantin VII, un empereur byzantin", faux: ["Charlemagne", "Le patriarche de Constantinople", "Un historien d'aujourd'hui"], expl: "Le texte est écrit d'après l'empereur byzantin Constantin VII, dans Le Livre des cérémonies." },
          { q: "De quand date-t-il ?", r: "Du Xᵉ siècle", faux: ["Du VIᵉ siècle, sous Justinien", "De l'an 800", "Du XVᵉ siècle"], expl: "Xᵉ siècle : les années 900." },
          { q: "De quoi parle-t-il ?", r: "Du couronnement de l'empereur byzantin dans l'église Sainte-Sophie", faux: ["Du couronnement de Charlemagne à Rome", "De la prise de Constantinople", "De la construction de Sainte-Sophie"], expl: "L'empereur byzantin (le basileus) est couronné à Constantinople." }
        ],
        prelever: [
          { q: "Quelle citation montre que l'empereur est couronné par un chef religieux ?", r: "« le patriarche fait la prière sur la couronne impériale et la place en personne sur la tête du souverain »", faux: ["« L'empereur entre dans l'église Sainte-Sophie de Constantinople »", "« Couronné, il s'assoit sur son fauteuil »"], expl: "Le patriarche, chef de l'Église byzantine, pose lui-même la couronne." },
          { q: "Quelle citation montre que la cérémonie est religieuse ?", r: "« Saint, Saint, Saint, Gloire à Dieu dans les hauteurs et paix sur la terre ! »", faux: ["« Il revêt les habits du sacre »", "« tous les dignitaires entrent »"], expl: "L'acclamation est une prière : on chante la gloire de Dieu au moment du couronnement." },
          { q: "Quelle citation montre que les dignitaires se soumettent à l'empereur ?", r: "« tombant à terre et baisant ses genoux »", faux: ["« Nombreuses années au grand empereur ! »", "« il s'assoit sur son fauteuil »"], expl: "Ils se prosternent devant lui : c'est un geste de soumission." }
        ],
        comprendre: [
          { a: "Le couronnement a lieu dans une église.", vrai: true, expl: "« l'église Sainte-Sophie de Constantinople »." },
          { a: "C'est le pape qui couronne l'empereur byzantin.", vrai: false, expl: "C'est le patriarche, qui « n'est pas soumis au pape de Rome »." },
          { a: "L'empereur porte un manteau pourpre.", vrai: true, expl: "« le manteau pourpre de l'empereur » : le pourpre est la couleur des empereurs depuis Rome." },
          { a: "Les dignitaires restent debout devant l'empereur.", vrai: false, expl: "Ils entrent « tombant à terre et baisant ses genoux »." }
        ],
        portee: [
          { q: "Que montre ce texte sur le pouvoir du basileus ?", r: "C'est un pouvoir à la fois politique et religieux : l'empereur est considéré comme l'élu de Dieu", faux: ["L'empereur obéit au pape de Rome", "L'empereur est élu par le peuple", "L'empereur n'a aucun lien avec l'Église"], expl: "Couronné par le patriarche dans une église, il tient son pouvoir de Dieu." },
          { q: "Pourquoi faut-il lire ce texte avec un regard critique ?", r: "Il est écrit d'après un empereur, qui veut montrer la grandeur de son pouvoir", faux: ["Il est écrit par un ennemi de l'empereur", "C'est une photographie de la cérémonie", "Il est écrit par un historien neutre"], expl: "Le texte décrit la cérémonie telle que l'empereur veut qu'on la voie." }
        ],
        modele: { reponses: [
          "Ce document est un **texte** qui décrit une cérémonie. Il est tiré du Livre des cérémonies, écrit d'après l'empereur byzantin **Constantin VII** au **Xᵉ siècle**. Il raconte le couronnement d'un empereur byzantin, le **basileus**, dans l'église Sainte-Sophie de Constantinople.",
          "Le pouvoir de l'empereur vient de Dieu : il est couronné dans une église, « Sainte-Sophie », par le chef de l'Église byzantine, le **patriarche**, qui « place en personne » la couronne « sur la tête du souverain ». **De plus**, le peuple chante « Gloire à Dieu dans les hauteurs ». L'empereur est donc considéré comme l'élu de Dieu.",
          "Les **dignitaires** entrent en « tombant à terre et baisant ses genoux » : ils se prosternent devant l'empereur. Ce geste montre qu'ils lui obéissent et qu'il a un très grand pouvoir.",
          "Le texte est écrit d'après un empereur : il a intérêt à montrer la grandeur et le caractère sacré du pouvoir impérial. Il décrit la cérémonie telle que l'empereur veut qu'on la voie : il faut **garder un regard critique**."
        ] }
      },
      {
        id: "bagdad-yaqubi", chapitre: "5e-h1-c2",
        consigne: "Lis le document deux fois. Dans chaque réponse, cite un mot ou une phrase du texte entre guillemets.",
        questions: [
          "Présente le document : sa nature, son auteur, sa date et ce dont il parle.",
          "Quelle forme a la ville de Bagdad ? Combien a-t-elle de portes ?",
          "Que trouve-t-on au centre de la ville ? Qu'est-ce que cela montre ?",
          "Pourquoi al-Ya'qubi dit-il que l'Irak est « le nombril de la terre » ? Peut-il être totalement objectif ?"
        ],
        doc: {
          titre: "Bagdad vue par un géographe arabe",
          extrait: [
            "« Si je commence par l'Irak, c'est uniquement parce qu'il est le centre de ce bas monde, le nombril de la terre. […]",
            "Al-Mansur en fit une ville ronde, la seule ville au monde connue dans le monde entier. La ville fut pourvue de quatre portes que le Calife nomma : porte de Kufa, porte de Basra, porte du Kurasan, porte de Syrie. […] Au centre de la grande place s'élevait le palais, à côté duquel se trouvait la grande mosquée. »"
          ],
          source: "Al-Ya'qubi, géographe et historien arabe, Le Livre des pays, 891, trad. G. Wiet, Le Caire, 1937 (extraits). Al-Mansur est le calife abbasside qui fonde Bagdad en 762."
        },
        presentation: [
          { q: "Quelle est la nature de ce document ?", r: "Un extrait d'un livre de géographie", faux: ["Un plan de la ville", "Une sourate du Coran", "Une lettre du calife"], expl: "Le Livre des pays décrit les régions et les villes du monde musulman." },
          { q: "Qui est l'auteur ?", r: "Al-Ya'qubi, un géographe et historien arabe", faux: ["Al-Mansur, le calife", "Mahomet", "Un voyageur chrétien"], expl: "Al-Ya'qubi vit dans l'empire abbasside." },
          { q: "De quand date-t-il ?", r: "De 891, au IXᵉ siècle", faux: ["De 762, l'année de la fondation de Bagdad", "De 1258, l'année de la prise de Bagdad", "De 622, l'année de l'Hégire"], expl: "Le texte est écrit plus d'un siècle après la fondation de la ville." },
          { q: "De quoi parle-t-il ?", r: "De Bagdad, la capitale des califes abbassides", faux: ["De La Mecque, ville sainte", "De Damas, capitale des Omeyyades", "De Constantinople, capitale byzantine"], expl: "Bagdad est fondée en 762 par le calife al-Mansur." }
        ],
        prelever: [
          { q: "Quelle citation donne la forme de la ville ?", r: "« Al-Mansur en fit une ville ronde »", faux: ["« La ville fut pourvue de quatre portes »", "« le centre de ce bas monde »"], expl: "Bagdad est une ville ronde, avec quatre portes." },
          { q: "Quelle citation montre l'importance de la religion dans la ville ?", r: "« le palais, à côté duquel se trouvait la grande mosquée »", faux: ["« porte de Kufa, porte de Basra »", "« Si je commence par l'Irak »"], expl: "La grande mosquée est au centre, à côté du palais du calife." },
          { q: "Quelle citation montre que l'auteur admire l'Irak ?", r: "« le centre de ce bas monde, le nombril de la terre »", faux: ["« La ville fut pourvue de quatre portes »", "« Au centre de la grande place »"], expl: "Pour lui, l'Irak est le centre du monde." }
        ],
        comprendre: [
          { a: "Bagdad a été fondée par le calife al-Mansur.", vrai: true, expl: "Al-Mansur, calife abbasside, fonde Bagdad en 762." },
          { a: "La ville a six portes.", vrai: false, expl: "Elle a « quatre portes » : Kufa, Basra, le Kurasan et la Syrie." },
          { a: "Au centre de la ville se trouvent le palais et la grande mosquée.", vrai: true, expl: "« Au centre de la grande place s'élevait le palais, à côté duquel se trouvait la grande mosquée »." },
          { a: "L'auteur pense que l'Irak est une région sans importance.", vrai: false, expl: "Il en fait au contraire « le nombril de la terre »." }
        ],
        portee: [
          { q: "Pourquoi le palais et la grande mosquée sont-ils côte à côte au centre de la ville ?", r: "Le calife est à la fois chef politique et guide religieux", faux: ["Par hasard, faute de place", "Parce que le calife habite dans la mosquée", "Parce que les marchands y vendent leurs produits"], expl: "Le palais (le pouvoir politique) et la mosquée (la religion) sont réunis au cœur de la ville." },
          { q: "Al-Ya'qubi peut-il être totalement objectif ?", r: "Non : il vit dans l'empire abbasside et admire sa capitale, il peut embellir sa description", faux: ["Oui : un géographe dit toujours la vérité", "Oui : il n'a jamais vu Bagdad", "Non : il déteste les Abbassides"], expl: "Un auteur qui admire son souverain peut embellir ce qu'il décrit : il faut garder un regard critique." }
        ],
        modele: { reponses: [
          "Ce document est un extrait du Livre des pays, un **livre de géographie** écrit en **891** par **al-Ya'qubi**, un géographe et historien arabe. Il décrit **Bagdad**, la capitale des califes abbassides, fondée en 762 par le calife al-Mansur.",
          "Bagdad est une ville ronde : « Al-Mansur en fit une ville ronde ». Elle a « quatre portes » : la porte de Kufa, celle de Basra, celle du Kurasan et celle de Syrie.",
          "Au centre de la ville, sur la grande place, se trouvent « le palais » du calife et « la grande mosquée ». Cela montre que le **calife** est à la fois le chef politique et le guide religieux des musulmans.",
          "Al-Ya'qubi dit que l'Irak est « le centre de ce bas monde, le nombril de la terre » parce qu'il vit dans l'empire abbasside et admire sa capitale, une des plus grandes villes du monde. Il ne peut pas être totalement objectif : il peut embellir ce qu'il décrit, il faut **garder un regard critique**."
        ] }
      },
      {
        id: "le-caire-corniche", chapitre: "5e-g1-c2",
        consigne: "Observe bien la photographie, puis réponds par des phrases complètes.",
        questions: [
          "Présente le document : sa nature, sa date et le lieu photographié.",
          "Décris ce que l'on voit au premier plan et à l'arrière-plan.",
          "Quel type de quartier cette photographie montre-t-elle ? Justifie.",
          "Cette photographie suffit-elle pour décrire tout Le Caire ? Pourquoi ?"
        ],
        doc: {
          titre: "Le Caire : les tours de la Corniche du Nil",
          image: "docs/5e-g1-c2/corniche-nil.jpg",
          alt: "Le Nil au premier plan, une felouque, un pont à gauche, des arbres à droite et les tours du centre du Caire à l'arrière-plan",
          source: "Photographie, Le Caire (Égypte), 2013 (Nile Corniche, Wikimedia Commons).",
          credit: "Phevos87, CC BY-SA 3.0"
        },
        presentation: [
          { q: "Quelle est la nature de ce document ?", r: "Une photographie", faux: ["Une carte", "Un tableau peint", "Un graphique"], expl: "C'est une photographie prise depuis le fleuve ou sa rive." },
          { q: "Quand a-t-elle été prise ?", r: "En 2013", faux: ["En 1925", "En 1969", "En 1990"], expl: "C'est une photographie récente du Caire." },
          { q: "Quel lieu montre-t-elle ?", r: "Le Caire, capitale de l'Égypte, au bord du Nil", faux: ["New Delhi, capitale de l'Inde", "Lagos, au Nigeria", "Paris, au bord de la Seine"], expl: "Le Caire est une très grande métropole, traversée par le Nil." }
        ],
        prelever: [
          { q: "Que voit-on au premier plan ?", r: "Le Nil, un large fleuve", faux: ["Un bidonville", "Des champs cultivés", "Le désert"], expl: "Le fleuve occupe tout le bas de la photographie." },
          { q: "Que voit-on à l'arrière-plan ?", r: "De hautes tours : bureaux, ministères, hôtels de luxe", faux: ["Des pyramides", "Des maisons en terre", "Des usines"], expl: "Ce sont les tours du centre-ville, au bord du Nil." },
          { q: "Quel bateau navigue sur le fleuve ?", r: "Une felouque, un bateau à voile traditionnel", faux: ["Un porte-conteneurs", "Un paquebot de croisière géant", "Un sous-marin"], expl: "La felouque est aujourd'hui surtout utilisée pour les promenades des touristes." }
        ],
        comprendre: [
          { a: "Les tours appartiennent à un quartier d'affaires.", vrai: true, expl: "Bureaux, ministères, hôtels de luxe : c'est le centre riche de la métropole." },
          { a: "Un pont relie les deux rives du fleuve.", vrai: true, expl: "À gauche, un pont traverse le Nil." },
          { a: "La photographie montre des quartiers très pauvres.", vrai: false, expl: "On ne voit que le centre riche : la pauvreté n'apparaît pas sur cette image." }
        ],
        portee: [
          { q: "Quelle image du Caire cette photographie donne-t-elle ?", r: "Celle d'une métropole moderne et riche", faux: ["Celle d'un petit village", "Celle d'une ville en ruine", "Celle d'une ville sans fleuve"], expl: "Les tours et les rives aménagées montrent la richesse du centre." },
          { q: "Pourquoi faut-il compléter cette photographie avec d'autres documents ?", r: "Elle ne montre que le centre riche : il faut aussi voir les quartiers pauvres, comme la Cité des Morts", faux: ["Parce qu'elle est trop ancienne", "Parce que Le Caire n'a pas de quartier riche", "Parce qu'une photographie ne montre jamais rien de vrai"], expl: "Le Caire est une ville de contrastes entre richesse et grande pauvreté." }
        ],
        modele: { reponses: [
          "Ce document est une **photographie** prise en **2013** au **Caire**, la capitale de l'Égypte. Elle montre le centre-ville, au bord du Nil.",
          "Au premier plan, on voit le **Nil**, un large fleuve, sur lequel navigue une **felouque**, un bateau à voile. À l'arrière-plan, on voit de **hautes tours** : des bureaux, des ministères et des hôtels de luxe. À gauche, un **pont** traverse le fleuve ; à droite, des arbres bordent la rive.",
          "Cette photographie montre un **quartier d'affaires** moderne et riche, au cœur d'une très grande **métropole** : les tours de bureaux et d'hôtels de luxe, et la rive aménagée avec des arbres, montrent la richesse de ce quartier.",
          "Non : la photographie ne montre que le centre riche du Caire. **Or** Le Caire est une ville de **contrastes** entre richesse et grande pauvreté : il faut d'autres documents pour voir les quartiers pauvres, comme la Cité des Morts."
        ] }
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
      },
      {
        n: "5e", chapitre: "5e-g1-c1",
        titre: "Les figurés et la légende d'une carte", sous: "Choisir le bon figuré, puis organiser la légende de la carte sur la population mondiale en 2050", nb: 8,
        items: FIGURES_5E,
        legende: {
          sujet: "Carte : où la population va-t-elle augmenter d'ici 2050 ?",
          parties: [
            { titre: "Une croissance de la population très inégale", items: ["La population va beaucoup augmenter (Afrique)", "La population va encore augmenter (Asie du Sud)", "La population stagne ou diminue (Europe, Japon, Chine)"] },
            { titre: "Deux géants démographiques", items: ["L'Inde, pays le plus peuplé du monde", "Le Nigeria, pays le plus peuplé d'Afrique"] }
          ]
        }
      }
    ]
  };
})();
