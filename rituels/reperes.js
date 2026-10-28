/* Repères fondamentaux — le parcours de culture générale du mode aventure (reviser.html#/aventure/reperes-<classe>).
   Chaque unité reprend les champs d'un point de passage de cours.js (court, notions, reperes, lieux) ;
   « carte » choisit le fond de carte de l'unité (cartes.js), « min » la classe à partir de laquelle elle apparaît.
   L'unité « siecles » n'a pas de contenu ici : ses questions sont calculées par l'application. */
const REPERES_FONDAMENTAUX = [
  { id: "periodes", court: "Les grandes périodes", d: "histoire",
    notions: [
      { mot: "Préhistoire", def: "La très longue période qui précède l'invention de l'écriture." },
      { mot: "Antiquité", def: "La période qui va de l'invention de l'écriture (vers 3300 av. J.-C.) à la chute de l'Empire romain d'Occident (476)." },
      { mot: "Moyen Âge", def: "La période qui va de la chute de l'Empire romain d'Occident (476) à la fin du XVᵉ siècle." },
      { mot: "Temps modernes", def: "La période, aussi appelée époque moderne, qui va de la fin du XVᵉ siècle (1492) à la Révolution française (1789)." },
      { mot: "Époque contemporaine", def: "La période qui commence avec la Révolution française (1789) et va jusqu'à nos jours." },
      { mot: "Siècle", def: "Une période de cent ans : le XXIᵉ siècle va de 2001 à 2100." },
      { mot: "Millénaire", def: "Une période de mille ans : le IIIᵉ millénaire a commencé en 2001." },
      { mot: "Chronologie", def: "Le classement des événements dans l'ordre où ils se sont produits." }
    ],
    reperes: [
      { a: -3300, date: "vers 3300 av. J.-C.", txt: "Invention de l'écriture en Mésopotamie : début de l'Antiquité." },
      { a: 476, date: "476", txt: "Chute de l'Empire romain d'Occident : début du Moyen Âge." },
      { a: 1492, date: "1492", txt: "Christophe Colomb atteint l'Amérique : début des Temps modernes." },
      { a: 1789, date: "1789", txt: "Début de la Révolution française : début de l'époque contemporaine." }
    ] },

  { id: "siecles", court: "Compter en siècles", d: "histoire", siecles: true },

  { id: "dates-antiquite", court: "Grandes dates : Antiquité et Moyen Âge", d: "histoire",
    reperes: [
      { a: -508, date: "508 av. J.-C.", txt: "Réformes de Clisthène : naissance de la démocratie à Athènes." },
      { a: -52, date: "52 av. J.-C.", txt: "Jules César bat Vercingétorix à Alésia." },
      { a: -27, date: "27 av. J.-C.", txt: "Octave reçoit le titre d'Auguste : il est le premier empereur romain." },
      { a: 476, date: "476", txt: "Chute de l'Empire romain d'Occident." },
      { a: 622, date: "622", txt: "L'Hégire : Mahomet quitte La Mecque pour Médine." },
      { a: 800, date: "800", txt: "Charlemagne est couronné empereur à Rome." },
      { a: 987, date: "987", txt: "Hugues Capet devient roi des Francs : début de la dynastie capétienne." },
      { a: 1054, date: "1054", txt: "Schisme entre l'Église catholique de Rome et l'Église orthodoxe de Constantinople." },
      { a: 1096, date: "1096", txt: "Départ de la première croisade." },
      { a: 1453, date: "1453", txt: "Les Ottomans prennent Constantinople : fin de l'Empire byzantin." }
    ] },

  { id: "dates-modernes", court: "Grandes dates : Temps modernes", d: "histoire",
    reperes: [
      { a: 1492, date: "1492", txt: "Christophe Colomb atteint l'Amérique." },
      { a: 1498, date: "1498", txt: "Vasco de Gama atteint l'Inde en contournant l'Afrique." },
      { a: 1517, date: "1517", txt: "Luther publie ses 95 thèses : début de la Réforme protestante." },
      { a: 1598, date: "1598", txt: "L'édit de Nantes accorde la liberté de culte aux protestants." },
      { a: 1661, date: "1661", txt: "Début du règne personnel de Louis XIV." },
      { a: 1685, date: "1685", txt: "Louis XIV révoque l'édit de Nantes." },
      { a: 1776, date: "1776", txt: "Déclaration d'indépendance des États-Unis." },
      { a: 1789, date: "1789", txt: "Début de la Révolution française." }
    ] },

  { id: "dates-contemporaines", court: "Grandes dates : époque contemporaine", d: "histoire",
    reperes: [
      { a: 1792, date: "1792", txt: "Proclamation de la Iʳᵉ République en France." },
      { a: 1804, date: "1804", txt: "Napoléon Bonaparte est sacré empereur des Français." },
      { a: 1848, date: "1848", txt: "Abolition définitive de l'esclavage et suffrage universel masculin en France." },
      { a: 1870, date: "1870", txt: "Proclamation de la IIIᵉ République." },
      { a: 1905, date: "1905", txt: "Loi de séparation des Églises et de l'État." },
      { a: 1914, b: 1918, date: "1914-1918", txt: "La Première Guerre mondiale." },
      { a: 1939, b: 1945, date: "1939-1945", txt: "La Seconde Guerre mondiale." },
      { a: 1944, date: "1944", txt: "Les femmes obtiennent le droit de vote en France." },
      { a: 1958, date: "1958", txt: "Naissance de la Vᵉ République." },
      { a: 1989, date: "1989", txt: "Chute du mur de Berlin." }
    ] },

  { id: "continents", court: "Continents et océans", d: "geo", carte: "monde",
    lieux: [
      { nom: "Afrique", lon: 20, lat: 5, txt: "Le continent traversé par l'équateur, au sud de la Méditerranée." },
      { nom: "Amérique du Nord", lon: -100, lat: 45, txt: "Le continent du Canada, des États-Unis et du Mexique." },
      { nom: "Amérique du Sud", lon: -60, lat: -12, txt: "Le continent du Brésil et de la cordillère des Andes." },
      { nom: "Asie", lon: 90, lat: 45, txt: "Le plus grand et le plus peuplé des continents." },
      { nom: "Europe", lon: 15, lat: 52, txt: "Le petit continent à l'ouest de l'Asie, dont il est séparé par l'Oural." },
      { nom: "Océanie", lon: 135, lat: -25, txt: "Le continent formé par l'Australie et les îles du Pacifique." },
      { nom: "Océan Pacifique", lon: -140, lat: 5, txt: "Le plus vaste des océans, entre l'Asie, l'Océanie et l'Amérique." },
      { nom: "Océan Atlantique", lon: -35, lat: 15, txt: "L'océan qui sépare l'Europe et l'Afrique de l'Amérique." },
      { nom: "Océan Indien", lon: 80, lat: -20, txt: "L'océan entre l'Afrique, l'Asie et l'Australie." },
      { nom: "Océan Arctique", lon: 40, lat: 73, txt: "L'océan qui entoure le pôle Nord, en partie couvert de glace." }
    ] },

  { id: "europe", court: "Capitales d'Europe", d: "geo", carte: "europe",
    lieux: [
      { nom: "Paris", lon: 2.35, lat: 48.86, txt: "Capitale de la France." },
      { nom: "Londres", lon: -0.13, lat: 51.51, txt: "Capitale du Royaume-Uni." },
      { nom: "Madrid", lon: -3.70, lat: 40.42, txt: "Capitale de l'Espagne." },
      { nom: "Lisbonne", lon: -9.14, lat: 38.72, txt: "Capitale du Portugal." },
      { nom: "Rome", lon: 12.50, lat: 41.90, txt: "Capitale de l'Italie." },
      { nom: "Berlin", lon: 13.40, lat: 52.52, txt: "Capitale de l'Allemagne." },
      { nom: "Bruxelles", lon: 4.35, lat: 50.85, txt: "Capitale de la Belgique, siège de la Commission européenne." },
      { nom: "Amsterdam", lon: 4.90, lat: 52.37, txt: "Capitale des Pays-Bas." },
      { nom: "Dublin", lon: -6.26, lat: 53.35, txt: "Capitale de l'Irlande." },
      { nom: "Copenhague", lon: 12.57, lat: 55.68, txt: "Capitale du Danemark." },
      { nom: "Vienne", lon: 16.37, lat: 48.21, txt: "Capitale de l'Autriche, sur le Danube." },
      { nom: "Prague", lon: 14.42, lat: 50.08, txt: "Capitale de la Tchéquie." },
      { nom: "Varsovie", lon: 21.01, lat: 52.23, txt: "Capitale de la Pologne." },
      { nom: "Budapest", lon: 19.04, lat: 47.50, txt: "Capitale de la Hongrie, sur le Danube." },
      { nom: "Bucarest", lon: 26.10, lat: 44.43, txt: "Capitale de la Roumanie." },
      { nom: "Athènes", lon: 23.73, lat: 37.98, txt: "Capitale de la Grèce." },
      { nom: "Kiev", lon: 30.52, lat: 50.45, txt: "Capitale de l'Ukraine (aussi écrite Kyiv)." }
    ] },

  { id: "monde", court: "Pays et capitales du monde", d: "geo", carte: "monde",
    lieux: [
      { nom: "Washington", lon: -77.04, lat: 38.91, txt: "Capitale des États-Unis." },
      { nom: "Ottawa", lon: -75.70, lat: 45.42, txt: "Capitale du Canada." },
      { nom: "Mexico", lon: -99.13, lat: 19.43, txt: "Capitale du Mexique." },
      { nom: "Bogota", lon: -74.07, lat: 4.71, txt: "Capitale de la Colombie." },
      { nom: "Lima", lon: -77.04, lat: -12.05, txt: "Capitale du Pérou." },
      { nom: "Brasilia", lon: -47.88, lat: -15.79, txt: "Capitale du Brésil." },
      { nom: "Buenos Aires", lon: -58.38, lat: -34.60, txt: "Capitale de l'Argentine." },
      { nom: "Rabat", lon: -6.84, lat: 34.02, txt: "Capitale du Maroc." },
      { nom: "Alger", lon: 3.06, lat: 36.75, txt: "Capitale de l'Algérie." },
      { nom: "Dakar", lon: -17.47, lat: 14.69, txt: "Capitale du Sénégal." },
      { nom: "Le Caire", lon: 31.24, lat: 30.04, txt: "Capitale de l'Égypte, sur le Nil." },
      { nom: "Abuja", lon: 7.49, lat: 9.06, txt: "Capitale du Nigeria." },
      { nom: "Kinshasa", lon: 15.27, lat: -4.44, txt: "Capitale de la République démocratique du Congo." },
      { nom: "Nairobi", lon: 36.82, lat: -1.29, txt: "Capitale du Kenya." },
      { nom: "Pretoria", lon: 28.19, lat: -25.75, txt: "Capitale administrative de l'Afrique du Sud." },
      { nom: "Moscou", lon: 37.62, lat: 55.76, txt: "Capitale de la Russie." },
      { nom: "Ankara", lon: 32.86, lat: 39.93, txt: "Capitale de la Turquie." },
      { nom: "Riyad", lon: 46.72, lat: 24.71, txt: "Capitale de l'Arabie saoudite." },
      { nom: "Téhéran", lon: 51.39, lat: 35.69, txt: "Capitale de l'Iran." },
      { nom: "New Delhi", lon: 77.21, lat: 28.61, txt: "Capitale de l'Inde." },
      { nom: "Pékin", lon: 116.40, lat: 39.90, txt: "Capitale de la Chine." },
      { nom: "Séoul", lon: 126.98, lat: 37.57, txt: "Capitale de la Corée du Sud." },
      { nom: "Tokyo", lon: 139.69, lat: 35.69, txt: "Capitale du Japon." },
      { nom: "Canberra", lon: 149.13, lat: -35.28, txt: "Capitale de l'Australie." }
    ] },

  { id: "france", court: "La France : villes, montagnes, mers", d: "geo", carte: "france",
    lieux: [
      { nom: "Paris", lon: 2.35, lat: 48.86, txt: "La capitale de la France, sur la Seine." },
      { nom: "Lyon", lon: 4.84, lat: 45.76, txt: "Grande ville au confluent du Rhône et de la Saône." },
      { nom: "Marseille", lon: 5.37, lat: 43.30, txt: "Le premier port de France, sur la Méditerranée." },
      { nom: "Toulouse", lon: 1.44, lat: 43.60, txt: "Grande ville du Sud-Ouest, sur la Garonne, ville de l'aéronautique." },
      { nom: "Bordeaux", lon: -0.58, lat: 44.84, txt: "Grande ville du Sud-Ouest, sur la Garonne, près de l'Atlantique." },
      { nom: "Nantes", lon: -1.55, lat: 47.22, txt: "Grande ville de l'Ouest, sur la Loire." },
      { nom: "Lille", lon: 3.06, lat: 50.63, txt: "Grande ville du Nord, près de la Belgique." },
      { nom: "Strasbourg", lon: 7.75, lat: 48.57, txt: "Grande ville de l'Est, sur le Rhin, siège du Parlement européen." },
      { nom: "Rennes", lon: -1.68, lat: 48.11, txt: "La grande ville de la Bretagne." },
      { nom: "Nice", lon: 7.26, lat: 43.70, txt: "Grande ville de la Côte d'Azur, près de l'Italie." },
      { nom: "Alpes", lon: 6.6, lat: 45.2, txt: "Les plus hautes montagnes de France, à l'est, avec le mont Blanc." },
      { nom: "Pyrénées", lon: 0.6, lat: 42.8, txt: "Les montagnes de la frontière avec l'Espagne." },
      { nom: "Massif central", lon: 2.9, lat: 45.3, txt: "Le massif ancien du centre-sud du pays, aux nombreux volcans éteints." },
      { nom: "Jura", lon: 5.9, lat: 46.6, txt: "Les montagnes de la frontière suisse, au nord des Alpes." },
      { nom: "Vosges", lon: 7.0, lat: 48.1, txt: "Le massif ancien de l'Est, à l'ouest de l'Alsace." },
      { nom: "Manche", lon: -1.5, lat: 50.0, txt: "La mer qui sépare la France du Royaume-Uni." },
      { nom: "Océan Atlantique", lon: -4.0, lat: 46.0, txt: "L'océan qui borde la côte ouest de la France." },
      { nom: "Mer Méditerranée", lon: 5.0, lat: 42.4, txt: "La mer qui borde le sud de la France." }
    ] },

  { id: "metropoles", court: "Les grandes métropoles du monde", d: "geo", carte: "monde", min: "2nde",
    lieux: [
      { nom: "Tokyo", lon: 139.69, lat: 35.69, txt: "Capitale du Japon, l'une des plus grandes agglomérations du monde." },
      { nom: "Delhi", lon: 77.21, lat: 28.61, txt: "Mégapole de l'Inde, où se trouve la capitale, New Delhi." },
      { nom: "Shanghai", lon: 121.47, lat: 31.23, txt: "Premier port de Chine, à l'embouchure du Yangzi." },
      { nom: "Bombay", lon: 72.88, lat: 19.08, txt: "Capitale économique de l'Inde, grand port sur l'océan Indien (aussi appelée Mumbai)." },
      { nom: "Dacca", lon: 90.41, lat: 23.81, txt: "Capitale du Bangladesh, mégapole du delta du Gange." },
      { nom: "Jakarta", lon: 106.85, lat: -6.21, txt: "Mégapole de l'île de Java, en Indonésie." },
      { nom: "Le Caire", lon: 31.24, lat: 30.04, txt: "Capitale de l'Égypte, immense métropole sur le Nil." },
      { nom: "Lagos", lon: 3.38, lat: 6.52, txt: "Mégapole du Nigeria, grand port du golfe de Guinée." },
      { nom: "Istanbul", lon: 28.98, lat: 41.01, txt: "La plus grande ville de Turquie, de part et d'autre du Bosphore, entre Europe et Asie." },
      { nom: "Londres", lon: -0.13, lat: 51.51, txt: "Capitale du Royaume-Uni, grande place financière mondiale." },
      { nom: "New York", lon: -74.01, lat: 40.71, txt: "Première métropole des États-Unis, grande place financière mondiale." },
      { nom: "Los Angeles", lon: -118.24, lat: 34.05, txt: "Deuxième métropole des États-Unis, sur la côte pacifique." },
      { nom: "Mexico", lon: -99.13, lat: 19.43, txt: "Capitale du Mexique, mégapole d'Amérique latine." },
      { nom: "São Paulo", lon: -46.63, lat: -23.55, txt: "La plus grande métropole du Brésil et d'Amérique du Sud." }
    ] }
];
