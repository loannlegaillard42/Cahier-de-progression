/* Banque de rituels — histoire-géographie
   Chaque entrée : { n: niveau, d: discipline, t: thème, k: type, q: question, r: réponse }
   Types (k) : "notion" (définir), "repere" (date/lieu), "vf" (vrai-faux), "flash" (question ouverte),
               "quisuisje" (indices progressifs à révéler un par un, puis réponse — utilise "indices": [...] et "r": le sujet)
   Cette banque est modifiable : tes propres questions s'ajoutent depuis l'application. */

const BANQUE = [
  /* ---------------- QUI SUIS-JE ? — 2nde Histoire, Thème 1 ---------------- */
  { n: "2nde", d: "histoire", t: "Le monde méditerranéen : Antiquité et Moyen Âge", k: "quisuisje",
    q: "Qui suis-je ?", r: "Périclès",
    indices: [
      "Je suis un homme politique de l'Antiquité.",
      "J'ai été plusieurs fois stratège, élu par mes concitoyens.",
      "Mon nom est associé au « siècle d'or » d'une grande cité grecque, au Ve siècle av. J.-C.",
      "J'ai fait construire le Parthénon sur l'Acropole d'Athènes."
    ] },
  { n: "2nde", d: "histoire", t: "Le monde méditerranéen : Antiquité et Moyen Âge", k: "quisuisje",
    q: "Qui suis-je ?", r: "Auguste",
    indices: [
      "Je suis un homme politique de l'Antiquité romaine.",
      "Je suis le petit-neveu et fils adoptif d'un célèbre général assassiné en 44 av. J.-C.",
      "Le Sénat m'a donné un titre qui signifie « vénérable, sacré ».",
      "Je suis considéré comme le premier empereur romain, à l'origine de la Pax Romana."
    ] },
  { n: "2nde", d: "histoire", t: "Le monde méditerranéen : Antiquité et Moyen Âge", k: "quisuisje",
    q: "Qui suis-je ?", r: "Alexandrie",
    indices: [
      "Je suis une grande ville du pourtour méditerranéen.",
      "J'ai été fondée au IVe siècle av. J.-C. par un conquérant macédonien qui porte mon nom.",
      "Sous les Ptolémées puis sous Rome, j'ai abrité l'une des plus grandes bibliothèques de l'Antiquité.",
      "Je suis aujourd'hui une grande ville d'Égypte, sur la mer Méditerranée."
    ] },
  { n: "2nde", d: "histoire", t: "Le monde méditerranéen : Antiquité et Moyen Âge", k: "quisuisje",
    q: "Qui suis-je ?", r: "Bernard de Clairvaux",
    indices: [
      "Je suis un religieux du Moyen Âge occidental.",
      "J'ai fondé et dirigé une abbaye qui deviendra célèbre dans toute l'Europe.",
      "J'appartiens à l'ordre cistercien, réputé pour sa rigueur.",
      "En 1146, j'ai prêché un appel à une nouvelle croisade en Terre sainte."
    ] },
  { n: "2nde", d: "histoire", t: "Le monde méditerranéen : Antiquité et Moyen Âge", k: "quisuisje",
    q: "Qui suis-je ?", r: "Venise",
    indices: [
      "Je suis une cité du Moyen Âge, bâtie sur des îles et des lagunes.",
      "Je suis dirigée par un doge, et une partie de mes habitants sont de riches marchands.",
      "Mes navires relient l'Occident chrétien à Constantinople et au monde musulman.",
      "Je donne mon nom à une célèbre république maritime d'Italie du Nord-Est."
    ] },
  { n: "2nde", d: "histoire", t: "Le monde méditerranéen : Antiquité et Moyen Âge", k: "quisuisje",
    q: "Qui suis-je ?", r: "Jérusalem",
    indices: [
      "Je suis une ville de la Méditerranée orientale.",
      "Trois religions me considèrent comme une ville sainte.",
      "Prise par les croisés en 1099, je suis reprise par Saladin en 1187.",
      "Je suis aujourd'hui la capitale revendiquée d'Israël, entre judaïsme, christianisme et islam."
    ] },

  /* ---------------- 5e — HISTOIRE ---------------- */
  { n: "5e", d: "histoire", t: "Chrétientés et islam (VIe-XIIIe s.)", k: "notion", q: "Qu'est-ce que l'Empire byzantin ?", r: "L'Empire romain d'Orient, qui survit après la chute de Rome. Sa capitale est Constantinople." },
  { n: "5e", d: "histoire", t: "Chrétientés et islam (VIe-XIIIe s.)", k: "repere", q: "Que se passe-t-il en 622 ?", r: "L'Hégire : Mahomet quitte La Mecque pour Médine. C'est le point de départ du calendrier musulman." },
  { n: "5e", d: "histoire", t: "Chrétientés et islam (VIe-XIIIe s.)", k: "repere", q: "Que se passe-t-il en 800 ?", r: "Charlemagne est couronné empereur à Rome par le pape Léon III." },
  { n: "5e", d: "histoire", t: "Chrétientés et islam (VIe-XIIIe s.)", k: "notion", q: "Qui est le calife ?", r: "Le successeur de Mahomet : il dirige la communauté des musulmans, à la fois sur le plan politique et religieux." },
  { n: "5e", d: "histoire", t: "Chrétientés et islam (VIe-XIIIe s.)", k: "vf", q: "Vrai ou faux : l'Empire byzantin est l'héritier de l'Empire romain d'Occident.", r: "FAUX — il est l'héritier de l'Empire romain d'Orient." },
  { n: "5e", d: "histoire", t: "Chrétientés et islam (VIe-XIIIe s.)", k: "flash", q: "Cite les trois civilisations en contact autour de la Méditerranée à cette époque.", r: "L'Empire byzantin, le monde musulman et l'Occident chrétien (Empire carolingien puis royaumes latins)." },

  { n: "5e", d: "histoire", t: "Société, Église et pouvoir féodal (XIe-XVe s.)", k: "notion", q: "Qu'est-ce qu'une seigneurie ?", r: "Un vaste domaine dirigé par un seigneur, qui y exerce le pouvoir et prélève des redevances sur les paysans." },
  { n: "5e", d: "histoire", t: "Société, Église et pouvoir féodal (XIe-XVe s.)", k: "notion", q: "Quelle est la différence entre un vassal et un suzerain ?", r: "Le vassal jure fidélité et doit aide ; le suzerain lui accorde protection et un fief en échange." },
  { n: "5e", d: "histoire", t: "Société, Église et pouvoir féodal (XIe-XVe s.)", k: "notion", q: "Qu'est-ce que la dîme ?", r: "Un impôt versé à l'Église, correspondant environ au dixième des récoltes." },
  { n: "5e", d: "histoire", t: "Société, Église et pouvoir féodal (XIe-XVe s.)", k: "repere", q: "Que se passe-t-il en 1214 à Bouvines ?", r: "Philippe Auguste remporte la bataille : une victoire qui renforce fortement le pouvoir du roi de France." },
  { n: "5e", d: "histoire", t: "Société, Église et pouvoir féodal (XIe-XVe s.)", k: "notion", q: "Qu'est-ce qu'une charte de franchise ?", r: "Un document par lequel un seigneur accorde des libertés et des droits aux habitants d'une ville." },

  { n: "5e", d: "histoire", t: "Transformations de l'Europe (XVIe-XVIIe s.)", k: "repere", q: "Que se passe-t-il en 1492 ?", r: "Christophe Colomb atteint l'Amérique. La même année s'achève la Reconquista en Espagne." },
  { n: "5e", d: "histoire", t: "Transformations de l'Europe (XVIe-XVIIe s.)", k: "notion", q: "Qu'est-ce que l'humanisme ?", r: "Un mouvement intellectuel de la Renaissance qui place l'être humain et son savoir au centre, en s'appuyant sur les textes antiques." },
  { n: "5e", d: "histoire", t: "Transformations de l'Europe (XVIe-XVIIe s.)", k: "repere", q: "Que fait Luther en 1517 ?", r: "Il publie ses 95 thèses contre certaines pratiques de l'Église : c'est le début de la Réforme protestante." },
  { n: "5e", d: "histoire", t: "Transformations de l'Europe (XVIe-XVIIe s.)", k: "repere", q: "Que prévoit l'édit de Nantes (1598) ?", r: "Signé par Henri IV, il accorde la liberté de culte aux protestants et met fin aux guerres de religion." },
  { n: "5e", d: "histoire", t: "Transformations de l'Europe (XVIe-XVIIe s.)", k: "notion", q: "Qu'est-ce que la monarchie absolue ?", r: "Un régime où le roi détient tous les pouvoirs, sans les partager, et affirme les tenir de Dieu." },

  /* ---------------- 5e — GÉOGRAPHIE ---------------- */
  { n: "5e", d: "geo", t: "Question démographique et inégal développement", k: "notion", q: "Qu'est-ce que la transition démographique ?", r: "Le passage d'une natalité et d'une mortalité fortes à des taux faibles. Entre les deux, la population augmente rapidement." },
  { n: "5e", d: "geo", t: "Question démographique et inégal développement", k: "notion", q: "Que mesure l'IDH ?", r: "Le développement humain, entre 0 et 1, à partir de trois éléments : la santé, l'éducation et le niveau de vie." },
  { n: "5e", d: "geo", t: "Question démographique et inégal développement", k: "notion", q: "Quelle différence entre croissance et développement ?", r: "La croissance mesure la richesse produite ; le développement mesure l'amélioration des conditions de vie de la population." },
  { n: "5e", d: "geo", t: "Question démographique et inégal développement", k: "vf", q: "Vrai ou faux : la croissance démographique est aujourd'hui la plus forte en Afrique subsaharienne.", r: "VRAI — c'est la région où la population augmente le plus vite." },
  { n: "5e", d: "geo", t: "Question démographique et inégal développement", k: "flash", q: "Les inégalités existent-elles seulement entre pays ?", r: "Non : elles existent aussi à l'intérieur d'un même pays, et jusqu'à l'échelle d'une ville (quartiers riches / quartiers pauvres)." },

  { n: "5e", d: "geo", t: "Des ressources limitées", k: "notion", q: "Différence entre ressource renouvelable et non renouvelable ?", r: "Une ressource renouvelable se reconstitue à l'échelle humaine (soleil, vent, eau) ; une non renouvelable s'épuise (pétrole, charbon, gaz)." },
  { n: "5e", d: "geo", t: "Des ressources limitées", k: "notion", q: "Qu'est-ce que le stress hydrique ?", r: "Une situation où les besoins en eau dépassent les ressources disponibles sur un territoire." },
  { n: "5e", d: "geo", t: "Des ressources limitées", k: "notion", q: "Qu'est-ce que la sécurité alimentaire ?", r: "Le fait que chacun ait accès, en permanence, à une nourriture suffisante et de qualité pour être en bonne santé." },
  { n: "5e", d: "geo", t: "Des ressources limitées", k: "notion", q: "Qu'appelle-t-on énergie fossile ?", r: "Une énergie issue de matières formées dans le sous-sol il y a des millions d'années : charbon, pétrole, gaz." },
  { n: "5e", d: "geo", t: "Des ressources limitées", k: "flash", q: "Que signifie « ménager » une ressource ?", r: "L'utiliser en la préservant, pour qu'elle reste disponible pour les générations futures — c'est le développement durable." },

  { n: "5e", d: "geo", t: "Prévenir les risques, changement global", k: "notion", q: "Qu'est-ce qu'un aléa ?", r: "Un phénomène menaçant, naturel ou technologique : séisme, cyclone, accident industriel…" },
  { n: "5e", d: "geo", t: "Prévenir les risques, changement global", k: "notion", q: "Qu'est-ce que la vulnérabilité ?", r: "La fragilité d'une population ou d'un territoire face à un aléa : capacité à s'en protéger et à s'en relever." },
  { n: "5e", d: "geo", t: "Prévenir les risques, changement global", k: "vf", q: "Vrai ou faux : un aléa devient un risque uniquement s'il menace des populations ou des biens.", r: "VRAI — sans enjeu humain exposé, il n'y a pas de risque." },
  { n: "5e", d: "geo", t: "Prévenir les risques, changement global", k: "notion", q: "Qu'est-ce que le changement global ?", r: "L'ensemble des transformations de la planète liées aux activités humaines, dont le réchauffement climatique." },
  { n: "5e", d: "geo", t: "Prévenir les risques, changement global", k: "notion", q: "Que signifie « s'adapter » au changement climatique ?", r: "Modifier ses aménagements et ses pratiques pour en limiter les conséquences (digues, cultures adaptées, alerte…)." },

  /* ---------------- 2nde — HISTOIRE ---------------- */
  { n: "2nde", d: "histoire", t: "Le monde méditerranéen : Antiquité et Moyen Âge", k: "notion", q: "Qu'est-ce qu'une cité grecque (polis) ?", r: "Un petit État indépendant formé d'une ville et de son territoire, avec ses lois, ses dieux et ses citoyens." },
  { n: "2nde", d: "histoire", t: "Le monde méditerranéen : Antiquité et Moyen Âge", k: "notion", q: "Qui est citoyen à Athènes au Ve siècle av. J.-C. ?", r: "Un homme libre, majeur, né de père et de mère athéniens. Femmes, métèques et esclaves en sont exclus." },
  { n: "2nde", d: "histoire", t: "Le monde méditerranéen : Antiquité et Moyen Âge", k: "notion", q: "Qu'est-ce que la romanisation ?", r: "La diffusion du mode de vie, de la langue et des institutions de Rome dans les territoires conquis." },
  { n: "2nde", d: "histoire", t: "Le monde méditerranéen : Antiquité et Moyen Âge", k: "repere", q: "Que prévoit l'édit de Caracalla en 212 ?", r: "Il accorde la citoyenneté romaine à presque tous les hommes libres de l'Empire." },
  { n: "2nde", d: "histoire", t: "Le monde méditerranéen : Antiquité et Moyen Âge", k: "repere", q: "Que se passe-t-il en 1095 ?", r: "Le pape Urbain II appelle à la première croisade lors du concile de Clermont." },
  { n: "2nde", d: "histoire", t: "Le monde méditerranéen : Antiquité et Moyen Âge", k: "flash", q: "La Méditerranée médiévale : espace de conflits ou d'échanges ?", r: "Les deux, simultanément : croisades et affrontements, mais aussi commerce, circulation des savoirs et des techniques." },

  { n: "2nde", d: "histoire", t: "XVe-XVIe siècles : nouveau rapport au monde", k: "repere", q: "Pourquoi 1492 est-elle une date charnière ?", r: "Colomb atteint l'Amérique : début de l'ouverture atlantique et d'une nouvelle vision du monde." },
  { n: "2nde", d: "histoire", t: "XVe-XVIe siècles : nouveau rapport au monde", k: "notion", q: "Qu'appelle-t-on l'ouverture atlantique ?", r: "Le basculement des échanges de la Méditerranée vers l'Atlantique après les Grandes Découvertes." },
  { n: "2nde", d: "histoire", t: "XVe-XVIe siècles : nouveau rapport au monde", k: "notion", q: "Qu'est-ce que l'humanisme ?", r: "Un courant intellectuel qui renouvelle le savoir par le retour aux textes antiques et la confiance dans la raison humaine." },
  { n: "2nde", d: "histoire", t: "XVe-XVIe siècles : nouveau rapport au monde", k: "repere", q: "Que se passe-t-il en 1517 ?", r: "Luther publie ses 95 thèses : point de départ de la Réforme protestante." },
  { n: "2nde", d: "histoire", t: "XVe-XVIe siècles : nouveau rapport au monde", k: "notion", q: "Qu'est-ce que la Contre-Réforme ?", r: "La réaction de l'Église catholique face au protestantisme, organisée lors du concile de Trente (1545-1563)." },

  { n: "2nde", d: "histoire", t: "L'État à l'époque moderne : France et Angleterre", k: "notion", q: "Qu'est-ce que la monarchie absolue ?", r: "Un régime où le roi concentre tous les pouvoirs et affirme les tenir de Dieu, sans contrôle d'une assemblée." },
  { n: "2nde", d: "histoire", t: "L'État à l'époque moderne : France et Angleterre", k: "repere", q: "Que se passe-t-il en 1685 ?", r: "Louis XIV révoque l'édit de Nantes : le protestantisme est interdit en France." },
  { n: "2nde", d: "histoire", t: "L'État à l'époque moderne : France et Angleterre", k: "repere", q: "Qu'est-ce que la Glorieuse Révolution (1688) ?", r: "En Angleterre, le renversement de Jacques II ; elle aboutit au Bill of Rights (1689) qui limite le pouvoir royal." },
  { n: "2nde", d: "histoire", t: "L'État à l'époque moderne : France et Angleterre", k: "notion", q: "Qu'est-ce qu'une monarchie parlementaire ?", r: "Un régime où le roi règne mais partage le pouvoir avec un Parlement qui vote les lois et l'impôt." },
  { n: "2nde", d: "histoire", t: "L'État à l'époque moderne : France et Angleterre", k: "flash", q: "Oppose en une phrase le modèle français et le modèle britannique.", r: "En France, le pouvoir se concentre entre les mains du roi ; en Angleterre, il est progressivement limité par le Parlement." },

  { n: "2nde", d: "histoire", t: "Dynamiques et ruptures aux XVIIe-XVIIIe siècles", k: "notion", q: "Qu'est-ce que le mouvement des Lumières ?", r: "Un courant du XVIIIe siècle qui défend la raison, l'esprit critique, la tolérance et la liberté contre l'arbitraire." },
  { n: "2nde", d: "histoire", t: "Dynamiques et ruptures aux XVIIe-XVIIIe siècles", k: "repere", q: "Qu'est-ce que l'Encyclopédie (à partir de 1751) ?", r: "L'ouvrage dirigé par Diderot et d'Alembert, qui rassemble et diffuse les savoirs de son temps." },
  { n: "2nde", d: "histoire", t: "Dynamiques et ruptures aux XVIIe-XVIIIe siècles", k: "notion", q: "Qu'est-ce que la société d'ordres ?", r: "Une société divisée en trois ordres — clergé, noblesse, tiers état — avec des droits inégaux." },
  { n: "2nde", d: "histoire", t: "Dynamiques et ruptures aux XVIIe-XVIIIe siècles", k: "notion", q: "Qu'est-ce que le commerce triangulaire ?", r: "Un circuit reliant l'Europe, l'Afrique et l'Amérique, fondé sur la traite et le travail forcé des esclaves." },
  { n: "2nde", d: "histoire", t: "Dynamiques et ruptures aux XVIIe-XVIIIe siècles", k: "repere", q: "Que se passe-t-il en 1776 ?", r: "La déclaration d'indépendance des États-Unis, inspirée des idées des Lumières." },

  /* ---------------- 2nde — GÉOGRAPHIE ---------------- */
  { n: "2nde", d: "geo", t: "Sociétés et environnements : équilibres fragiles", k: "notion", q: "Comment définit-on un risque ?", r: "La rencontre entre un aléa (phénomène menaçant) et des enjeux vulnérables (populations, biens, activités)." },
  { n: "2nde", d: "geo", t: "Sociétés et environnements : équilibres fragiles", k: "notion", q: "Qu'est-ce que la résilience d'un territoire ?", r: "Sa capacité à se remettre d'une catastrophe et à retrouver son fonctionnement." },
  { n: "2nde", d: "geo", t: "Sociétés et environnements : équilibres fragiles", k: "notion", q: "Qu'est-ce que l'anthropisation d'un milieu ?", r: "La transformation d'un milieu naturel par les activités humaines." },
  { n: "2nde", d: "geo", t: "Sociétés et environnements : équilibres fragiles", k: "flash", q: "Pourquoi parle-t-on d'équilibres « fragiles » ?", r: "Parce que l'exploitation des ressources et l'occupation des espaces peuvent rompre des équilibres difficiles à rétablir." },

  { n: "2nde", d: "geo", t: "Territoires, populations et développement", k: "notion", q: "Qu'est-ce que le vieillissement d'une population ?", r: "L'augmentation de la part des personnes âgées, due à la baisse de la natalité et à l'allongement de la vie." },
  { n: "2nde", d: "geo", t: "Territoires, populations et développement", k: "notion", q: "Qu'est-ce qu'un pays émergent ?", r: "Un pays en forte croissance économique, qui s'insère dans la mondialisation mais conserve de fortes inégalités internes." },
  { n: "2nde", d: "geo", t: "Territoires, populations et développement", k: "notion", q: "Qu'est-ce que le développement durable ?", r: "Un développement qui répond aux besoins présents sans compromettre ceux des générations futures : économique, social, environnemental." },
  { n: "2nde", d: "geo", t: "Territoires, populations et développement", k: "vf", q: "Vrai ou faux : tous les pays connaissent la transition démographique au même moment.", r: "FAUX — elle est décalée dans le temps selon les pays, ce qui crée des trajectoires très différentes." },

  { n: "2nde", d: "geo", t: "Des mobilités généralisées", k: "notion", q: "Quelle différence entre un migrant et un réfugié ?", r: "Le migrant se déplace pour diverses raisons ; le réfugié fuit un danger et bénéficie d'une protection juridique internationale." },
  { n: "2nde", d: "geo", t: "Des mobilités généralisées", k: "notion", q: "Qu'est-ce qu'une diaspora ?", r: "Une population dispersée dans plusieurs pays mais qui garde des liens forts avec son territoire d'origine." },
  { n: "2nde", d: "geo", t: "Des mobilités généralisées", k: "notion", q: "Qu'appelle-t-on flux touristiques ?", r: "Les déplacements de personnes voyageant pour leurs loisirs, très inégalement répartis dans le monde." },
  { n: "2nde", d: "geo", t: "Des mobilités généralisées", k: "flash", q: "Les migrations internationales concernent-elles surtout les pays riches ?", r: "Non : une grande partie des migrations se fait entre pays du Sud, souvent vers des pays voisins." },

  { n: "2nde", d: "geo", t: "L'Afrique australe (thème conclusif)", k: "notion", q: "Quels pays forment le cœur de l'Afrique australe ?", r: "L'Afrique du Sud et ses voisins : Namibie, Botswana, Zimbabwe, Mozambique, Zambie, Lesotho, Eswatini." },
  { n: "2nde", d: "geo", t: "L'Afrique australe (thème conclusif)", k: "flash", q: "Pourquoi l'Afrique australe est-elle un espace « en profonde mutation » ?", r: "Elle combine ressources abondantes, forte croissance urbaine, mobilités importantes et inégalités héritées, dont celles de l'apartheid." },

  /* ---------------- 1ère — HISTOIRE ---------------- */
  { n: "1ere", d: "histoire", t: "L'Europe face aux révolutions", k: "repere", q: "Que se passe-t-il en 1789 ?", r: "Le début de la Révolution française : États généraux, prise de la Bastille, Déclaration des droits de l'homme et du citoyen." },
  { n: "1ere", d: "histoire", t: "L'Europe face aux révolutions", k: "notion", q: "Qu'est-ce que la souveraineté nationale ?", r: "Le principe selon lequel le pouvoir appartient à la nation, et non plus au roi de droit divin." },
  { n: "1ere", d: "histoire", t: "L'Europe face aux révolutions", k: "repere", q: "Que retenir de 1804 ?", r: "Napoléon devient empereur ; c'est aussi l'année du Code civil, qui fixe durablement le droit français." },
  { n: "1ere", d: "histoire", t: "L'Europe face aux révolutions", k: "repere", q: "Qu'est-ce que le congrès de Vienne (1815) ?", r: "La réorganisation de l'Europe par les vainqueurs de Napoléon, qui veulent revenir à l'ordre d'avant 1789." },
  { n: "1ere", d: "histoire", t: "L'Europe face aux révolutions", k: "notion", q: "Que défendent les libéraux au XIXe siècle ?", r: "Les libertés individuelles, une constitution et la limitation du pouvoir par une assemblée élue." },

  { n: "1ere", d: "histoire", t: "La France dans l'Europe des nationalités (1848-1871)", k: "repere", q: "Que se passe-t-il en 1848 ?", r: "Le Printemps des peuples en Europe ; en France, la IIe République, le suffrage universel masculin et l'abolition de l'esclavage." },
  { n: "1ere", d: "histoire", t: "La France dans l'Europe des nationalités (1848-1871)", k: "notion", q: "Qu'est-ce que le principe des nationalités ?", r: "L'idée que chaque peuple partageant une culture et une histoire a le droit de former son propre État." },
  { n: "1ere", d: "histoire", t: "La France dans l'Europe des nationalités (1848-1871)", k: "repere", q: "Que retenir de 1852 ?", r: "Louis-Napoléon Bonaparte devient Napoléon III : début du Second Empire." },
  { n: "1ere", d: "histoire", t: "La France dans l'Europe des nationalités (1848-1871)", k: "repere", q: "Que se passe-t-il en 1870-1871 ?", r: "La défaite face à la Prusse, la chute du Second Empire, la proclamation de l'Empire allemand et la Commune de Paris." },
  { n: "1ere", d: "histoire", t: "La France dans l'Europe des nationalités (1848-1871)", k: "notion", q: "Qu'est-ce que le prolétariat ?", r: "La classe des ouvriers de l'industrie, qui ne possèdent que leur force de travail." },

  { n: "1ere", d: "histoire", t: "La Troisième République avant 1914", k: "repere", q: "Que retenir des lois Ferry (1881-1882) ?", r: "L'école primaire devient gratuite, laïque et obligatoire." },
  { n: "1ere", d: "histoire", t: "La Troisième République avant 1914", k: "repere", q: "Que prévoit la loi de 1905 ?", r: "La séparation des Églises et de l'État : la République ne reconnaît ni ne salarie aucun culte." },
  { n: "1ere", d: "histoire", t: "La Troisième République avant 1914", k: "notion", q: "Qu'est-ce que la laïcité ?", r: "La neutralité de l'État en matière religieuse, garantissant à chacun la liberté de croire ou de ne pas croire." },
  { n: "1ere", d: "histoire", t: "La Troisième République avant 1914", k: "notion", q: "Qu'est-ce que l'impérialisme colonial ?", r: "La domination politique, économique et culturelle exercée par une puissance européenne sur des territoires conquis." },
  { n: "1ere", d: "histoire", t: "La Troisième République avant 1914", k: "flash", q: "Qu'est-ce que l'affaire Dreyfus révèle de la société française ?", r: "Une France profondément divisée, entre antisémitisme et défense des droits, autour de la République et de la justice." },

  { n: "1ere", d: "histoire", t: "La Première Guerre mondiale", k: "repere", q: "Quelles sont les dates de la Première Guerre mondiale ?", r: "1914-1918. Elle s'achève par l'armistice du 11 novembre 1918." },
  { n: "1ere", d: "histoire", t: "La Première Guerre mondiale", k: "notion", q: "Qu'est-ce qu'une guerre totale ?", r: "Une guerre qui mobilise toutes les ressources d'un pays — économie, société, sciences — et touche aussi les civils." },
  { n: "1ere", d: "histoire", t: "La Première Guerre mondiale", k: "repere", q: "Pourquoi 1917 est-elle une année charnière ?", r: "Les révolutions russes éclatent et les États-Unis entrent en guerre : les équilibres du conflit basculent." },
  { n: "1ere", d: "histoire", t: "La Première Guerre mondiale", k: "repere", q: "Que retenir de 1915 en Arménie ?", r: "Le génocide arménien perpétré par l'Empire ottoman." },
  { n: "1ere", d: "histoire", t: "La Première Guerre mondiale", k: "repere", q: "Qu'est-ce que le traité de Versailles (1919) ?", r: "Le traité qui met fin à la guerre avec l'Allemagne, jugé très sévère par celle-ci et porteur de tensions futures." },

  /* ---------------- 1ère — GÉOGRAPHIE ---------------- */
  { n: "1ere", d: "geo", t: "La métropolisation", k: "notion", q: "Qu'est-ce que la métropolisation ?", r: "La concentration croissante des populations, des activités et des fonctions de commandement dans les grandes villes." },
  { n: "1ere", d: "geo", t: "La métropolisation", k: "notion", q: "Qu'est-ce qu'un CBD ?", r: "Le Central Business District : le quartier d'affaires central d'une métropole, concentrant sièges sociaux et services." },
  { n: "1ere", d: "geo", t: "La métropolisation", k: "notion", q: "Qu'est-ce que la gentrification ?", r: "L'arrivée de populations plus aisées dans un quartier populaire, qui s'y transforme et en repousse les habitants d'origine." },
  { n: "1ere", d: "geo", t: "La métropolisation", k: "notion", q: "Qu'est-ce qu'une ville mondiale ?", r: "Une métropole qui exerce un pouvoir de commandement à l'échelle du monde (New York, Londres, Tokyo, Paris…)." },
  { n: "1ere", d: "geo", t: "La métropolisation", k: "flash", q: "La métropolisation profite-t-elle à tous les territoires ?", r: "Non : elle renforce les grandes villes et peut marginaliser les espaces périphériques et ruraux." },

  { n: "1ere", d: "geo", t: "Espaces et acteurs de la production", k: "notion", q: "Qu'est-ce qu'un espace productif ?", r: "Un territoire aménagé et organisé pour produire des biens ou des services." },
  { n: "1ere", d: "geo", t: "Espaces et acteurs de la production", k: "notion", q: "Qu'est-ce que la littoralisation ?", r: "La concentration des activités productives sur les littoraux, liée à l'importance du commerce maritime." },
  { n: "1ere", d: "geo", t: "Espaces et acteurs de la production", k: "notion", q: "Qu'est-ce qu'une FTN ?", r: "Une firme transnationale : une entreprise implantée dans plusieurs pays, acteur majeur de la mondialisation." },
  { n: "1ere", d: "geo", t: "Espaces et acteurs de la production", k: "flash", q: "Cite trois acteurs de l'organisation d'un espace productif.", r: "Les entreprises, les collectivités et l'État, auxquels s'ajoutent l'Union européenne et les habitants." },

  { n: "1ere", d: "geo", t: "Les espaces ruraux", k: "notion", q: "Que signifie la multifonctionnalité des espaces ruraux ?", r: "Ils ne servent plus seulement à l'agriculture : ils accueillent aussi habitat, tourisme, industries et espaces protégés." },
  { n: "1ere", d: "geo", t: "Les espaces ruraux", k: "notion", q: "Qu'est-ce que la périurbanisation ?", r: "L'extension des espaces urbanisés autour des villes, sur des communes rurales devenues résidentielles." },
  { n: "1ere", d: "geo", t: "Les espaces ruraux", k: "notion", q: "Qu'est-ce qu'un conflit d'usage ?", r: "Une opposition entre acteurs qui veulent utiliser un même espace de façons incompatibles." },
  { n: "1ere", d: "geo", t: "Les espaces ruraux", k: "vf", q: "Vrai ou faux : tous les espaces ruraux français se dépeuplent.", r: "FAUX — certains gagnent des habitants (périurbain, littoraux), d'autres se vident : c'est la fragmentation." },

  { n: "1ere", d: "geo", t: "La Chine (thème conclusif)", k: "notion", q: "Qu'oppose-t-on entre Chine littorale et Chine intérieure ?", r: "Un littoral riche, urbanisé et ouvert sur le monde, face à un intérieur moins développé et plus rural." },
  { n: "1ere", d: "geo", t: "La Chine (thème conclusif)", k: "notion", q: "Qu'est-ce qu'une recomposition spatiale ?", r: "La transformation de l'organisation d'un territoire sous l'effet de dynamiques économiques, démographiques ou politiques." },
  { n: "1ere", d: "geo", t: "La Chine (thème conclusif)", k: "flash", q: "Cite deux grands défis territoriaux de la Chine aujourd'hui.", r: "Réduire les inégalités entre régions, et faire face à l'urbanisation rapide, au vieillissement et aux pressions environnementales." },
];
