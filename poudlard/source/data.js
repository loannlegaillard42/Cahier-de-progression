/* ================= Données du jeu ================= */
const MAISONS = {
  gry: { nom: "Gryffondor", c: "#A3262A", clair: "#FF8A7A", c2: "#D9A92B" },
  ser: { nom: "Serdaigle", c: "#2A4C9C", clair: "#A9C0FF", c2: "#B08A4E" },
  pou: { nom: "Poufsouffle", c: "#E2B12C", clair: "#FFD45E", c2: "#26221C" },
  sep: { nom: "Serpentard", c: "#1F7A4A", clair: "#74E3A6", c2: "#BFC5CC" },
};
const ORDRE_MAISONS = ["gry", "ser", "pou", "sep"];
const HEROS = {
  leo: { nom: "Léo Flamberge", court: "Léo", maison: "gry", spe: "Créatures et défense", f: false },
  iris: { nom: "Iris Plumelune", court: "Iris", maison: "ser", spe: "Sortilèges et énigmes", f: true },
  capucine: { nom: "Capucine Boisjoli", court: "Capucine", maison: "pou", spe: "Botanique", f: true },
  silas: { nom: "Silas Vifargent", court: "Silas", maison: "sep", spe: "Potions", f: false },
};
const ORDRE_HEROS = ["leo", "iris", "capucine", "silas"];
const HEROS_DE_MAISON = { gry: "leo", ser: "iris", pou: "capucine", sep: "silas" };
const RANGS = [[0, "Novice", "Novice"], [3, "Adepte", "Adepte"], [6, "Expert", "Experte"], [10, "Légende", "Légende"]];

const CHAPITRES = [
  { n: 1, titre: "Les Serres", heros: "capucine", relique: "coupe", mois: "novembre-décembre" },
  { n: 2, titre: "La Forêt interdite", heros: "leo", relique: "epee", mois: "janvier-février" },
  { n: 3, titre: "Le Lac noir", heros: "silas", relique: "medaillon", mois: "mars-avril" },
  { n: 4, titre: "Le Château", heros: "iris", relique: "diademe", mois: "mai-juin" },
];
const chapitreDe = (n) => CHAPITRES[Math.min(3, Math.max(0, Math.ceil(n / 4) - 1))];

/* x, z : position sur la carte ; y : altitude imposée (étapes dans le château) */
const LIEUX = [
  { n: 0, nom: "Le Grand Hall", x: 0, z: -18.5 },
  { n: 1, nom: "Le Parc du château", x: -9, z: -13 },
  { n: 2, nom: "La Serre n°1", x: -17, z: -12 },
  { n: 3, nom: "La Serre n°3", x: -24, z: -6 },
  { n: 4, nom: "Le Jardin d'Helga", x: -31, z: 2, cp: true },
  { n: 5, nom: "La Cabane de Hagrid", x: -21, z: 9 },
  { n: 6, nom: "L'Enclos des hippogriffes", x: -33, z: 15 },
  { n: 7, nom: "Le Sentier des licornes", x: -39, z: 28 },
  { n: 8, nom: "La Clairière des centaures", x: -24, z: 35, cp: true },
  { n: 9, nom: "Le Saule cogneur", x: -8, z: 25 },
  { n: 10, nom: "La Rive du lac noir", x: 4, z: 19 },
  { n: 11, nom: "Le Cachot des potions", x: 9, z: -9 },
  { n: 12, nom: "La Salle sous le lac", x: 23, z: 2, y: 0.9, cp: true },
  { n: 13, nom: "Le Terrain de Quidditch", x: 42, z: -14 },
  { n: 14, nom: "La Bibliothèque", x: 12.5, z: -31, y: 16.2 },
  { n: 15, nom: "La Salle sur Demande", x: -3, z: -37, y: 20.3 },
  { n: 16, nom: "La Tour de Serdaigle", x: -14, z: -41, y: 25.2, cp: true },
];

const XP_ANNEES = [0, 150, 450, 800, 1200, 1600, 2000];
const XP_RESULTAT = { reussite: 100, partielle: 60, echec: 30 };
const XP_CHECKPOINT = 150, XP_DEFI = 40;

const SORTS = [
  { id: "lumos", nom: "Lumos", annee: 1, freq: "etape", effet: "Le professeur éclaire un mot-clé de l'épreuve." },
  { id: "leviosa", nom: "Wingardium Leviosa", annee: 2, freq: "etape", effet: "Le professeur fait léviter une mauvaise réponse hors d'une question." },
  { id: "alohomora", nom: "Alohomora", annee: 3, freq: "chapitre", effet: "Ouvre le coffre d'un défi maison sans mot de passe." },
  { id: "expelliarmus", nom: "Expelliarmus", annee: 4, freq: "chapitre", effet: "Désarme l'Ombre : annule une carte du destin néfaste." },
  { id: "accio", nom: "Accio", annee: 5, freq: "chapitre", effet: "Fait venir un objet surprise dans le sac." },
  { id: "protego", nom: "Protego", annee: 6, freq: "chapitre", effet: "Une épreuve ratée compte comme partielle." },
  { id: "patronum", nom: "Spero Patronum", annee: 7, freq: "finale", effet: "Le jour de la grande finale, toute la classe le lance, quelle que soit son année : le Patronus de l'équipe chasse l'Ombre (+100 XP)." },
];

const OBJETS = {
  rapeltout: { nom: "Rapeltout", effet: "Révèle l'indice de l'épreuve.", quand: "epreuve", auto: "indice" },
  plume: { nom: "Plume à Papote", effet: "Le professeur souffle la première lettre d'une réponse.", quand: "epreuve" },
  retourneur: { nom: "Retourneur de temps", effet: "+5 minutes pour la phase en cours (les délais des critères de réussite sont prolongés d'autant).", quand: "epreuve", auto: "temps" },
  cape: { nom: "Cape d'invisibilité", effet: "Une question, une paire, une place dans l'ordre ou une ligne de code est comptée juste pour toutes les maisons.", quand: "epreuve" },
  pimentine: { nom: "Pimentine", effet: "Les maisons qui se sont trompées retentent une réponse (question, paire, ordre ou ligne de code).", quand: "epreuve" },
  felix: { nom: "Felix Felicis", effet: "Chance liquide : une épreuve ratée ou partielle devient réussie.", quand: "resultat", auto: "felix" },
  bezoard: { nom: "Bézoard", effet: "Annule une carte du destin néfaste.", quand: "destin", auto: "annule" },
  chocogrenouille: { nom: "Chocogrenouille", effet: "+25 XP tout de suite.", quand: "libre", auto: "xp25" },
  dragees: { nom: "Dragées surprises", effet: "Un pari : +50 XP… ou −20 XP si c'est goût vomi !", quand: "libre", auto: "pari" },
};
const ORDRE_OBJETS = ["rapeltout", "plume", "retourneur", "cape", "pimentine", "felix", "bezoard", "chocogrenouille", "dragees"];
const COMPAGNONS = {
  botruc: { nom: "Brindille, le Botruc", effet: "Une fois par chapitre : un indice gratuit pendant une épreuve." },
  niffleur: { nom: "Pépite, le Niffleur", effet: "+15 XP pour chaque défi maison réussi." },
};
const RELIQUES = {
  coupe: { nom: "La Coupe de Poufsouffle", maison: "pou", pouvoir: "Abondance : +10 XP à chaque épreuve réussie ou partielle." },
  epee: { nom: "L'Épée de Gryffondor", maison: "gry", pouvoir: "Bravoure : une fois par chapitre, annule une carte du destin néfaste." },
  medaillon: { nom: "Le Médaillon de Serpentard", maison: "sep", pouvoir: "Ruse : une fois par chapitre, tire une nouvelle carte du destin." },
  diademe: { nom: "Le Diadème de Serdaigle", maison: "ser", pouvoir: "Sagesse : chaque maison gagne 20 points." },
};
const ORDRE_RELIQUES = ["coupe", "epee", "medaillon", "diademe"];

/* Récompenses fixes : [objet à la validation (sauf échec), objet du défi maison] */
const GAINS = {
  1: ["rapeltout", "chocogrenouille"], 2: ["chocogrenouille", "rapeltout"], 3: ["pimentine", "dragees"], 4: [null, "bezoard"],
  5: ["plume", "chocogrenouille"], 6: ["dragees", "retourneur"], 7: ["comp:botruc", "plume"], 8: [null, "pimentine"],
  9: ["bezoard", "dragees"], 10: ["comp:niffleur", "rapeltout"], 11: ["retourneur", "felix"], 12: [null, "chocogrenouille"],
  13: ["cape", "bezoard"], 14: ["rapeltout", "dragees"], 15: ["felix", "chocogrenouille"], 16: [null, null],
};

const DESTIN = [
  { id: "encre", titre: "Encre renversée", texte: "Tous les encriers de la tour sont renversés… et on entend un ricanement au loin.", effet: { xp: -20 }, nefaste: true },
  { id: "rusard", titre: "Rusard vous a surpris", texte: "Promenade dans les couloirs après le couvre-feu ! Chaque maison perd 5 points.", effet: { toutes: -5 }, nefaste: true },
  { id: "teigne", titre: "Miss Teigne monte la garde", texte: "La chatte de Rusard repart avec un objet de votre sac.", effet: { perte: 1 }, nefaste: true },
  { id: "mimi", titre: "Mimi Geignarde", texte: "Elle a encore inondé les toilettes du deuxième étage. Tout le monde patauge.", effet: { xp: -10 }, nefaste: true },
  { id: "lutins", titre: "Lutins de Cornouailles", texte: "Ils ont semé la pagaille dans vos sacs et vos parchemins.", effet: { xp: -15 }, nefaste: true },
  { id: "fumseck", titre: "Fumseck !", texte: "Le phénix apparaît dans un éclat de flammes et redonne du courage à toute l'équipe.", effet: { xp: 40 } },
  { id: "cuisines", titre: "Les cuisines de Poudlard", texte: "Un elfe de maison vous glisse des friandises dans les poches.", effet: { objet: "chocogrenouille" } },
  { id: "moine", titre: "Le Moine Gras", texte: "Le fantôme de Poufsouffle vous salue d'un grand sourire.", effet: { maison: "pou", pts: 10 } },
  { id: "nick", titre: "Nick Quasi-Sans-Tête", texte: "Le fantôme de Gryffondor raconte (encore) comment il a failli perdre la tête.", effet: { maison: "gry", pts: 10 } },
  { id: "dame", titre: "La Dame Grise", texte: "Le fantôme de Serdaigle murmure un secret à l'oreille d'Iris.", effet: { maison: "ser", pts: 10 } },
  { id: "baron", titre: "Le Baron Sanglant", texte: "Le fantôme de Serpentard fait taire un ricanement qui traînait dans les couloirs.", effet: { maison: "sep", pts: 10 } },
  { id: "epouvantard", titre: "Un Épouvantard !", texte: "Il jaillit de l'armoire ! Toute la classe crie « Riddikulus ! » en même temps pour le faire fuir.", effet: { xp: 20 } },
  { id: "colis", titre: "Courrier pour vous", texte: "Moka rapporte un colis mystérieux.", effet: { hasard: 1 } },
  { id: "vomi", titre: "Goût vomi", texte: "Une Dragée surprise au goût vomi ! Il ne se passe rien… à part des grimaces.", effet: {} },
  { id: "hagrid", titre: "Les gâteaux de Hagrid", texte: "Durs comme de la pierre, mais faits avec amour.", effet: { xp: 10 } },
  { id: "choixpeau", titre: "Le Choixpeau chante", texte: "Il entonne une chanson pour l'équipe. Le professeur choisit la maison qui s'est le mieux tenue.", effet: { choix: 15 } },
];

/* ================= Icônes (SVG) ================= */
const ICONES = {
  rapeltout: '<svg viewBox="0 0 64 64"><rect x="24" y="50" width="16" height="7" rx="2" fill="#C9A24A"/><circle cx="32" cy="30" r="21" fill="#DDEBF5" stroke="#8FB3CC" stroke-width="2"/><path d="M22 36c4-10 14-2 18-10 3 7-6 14-12 16-4 1-6-2-6-6Z" fill="#D94B4B" opacity=".85"/><circle cx="25" cy="22" r="4" fill="#fff" opacity=".8"/></svg>',
  plume: '<svg viewBox="0 0 64 64"><path d="M50 6C30 10 18 26 16 46l4 2C26 32 36 20 50 6Z" fill="#F4F0E6" stroke="#8A7B5C" stroke-width="2"/><path d="M16 46 10 58" stroke="#2B2116" stroke-width="3" stroke-linecap="round"/><path d="M22 40c6-2 10-6 14-12M26 32c5-1 9-4 12-8" stroke="#B9AE93" stroke-width="1.5" fill="none"/><circle cx="46" cy="52" r="5" fill="#6A4FC1"/></svg>',
  retourneur: '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="none" stroke="#D9B24C" stroke-width="3"/><ellipse cx="32" cy="32" rx="9" ry="24" fill="none" stroke="#B8913A" stroke-width="2"/><path d="M25 18h14M25 46h14M27 18c0 8 10 10 10 14s-10 6-10 14M37 18c0 8-10 10-10 14s10 6 10 14" stroke="#7A5A1A" stroke-width="2" fill="none"/><path d="M28 43h8l-4-6Z" fill="#E8C978"/></svg>',
  cape: '<svg viewBox="0 0 64 64"><path d="M32 8c-7 0-11 5-11 10l-9 38h40l-9-38c0-5-4-10-11-10Z" fill="#B9C3D6" opacity=".9"/><path d="M21 18c4 5 18 5 22 0" stroke="#fff" stroke-width="2" fill="none"/><path d="M18 40c6-3 10 6 16 2s10 4 14 0" stroke="#fff" stroke-width="1.5" fill="none" opacity=".7"/><path d="M12 56c6-4 14 2 20-2s14 2 20-2" stroke="#8C98B0" stroke-width="2" fill="none"/></svg>',
  pimentine: '<svg viewBox="0 0 64 64"><path d="M27 6h10v8l9 14v24a6 6 0 0 1-6 6H24a6 6 0 0 1-6-6V28l9-14Z" fill="#F3EFE6" stroke="#8A7B5C" stroke-width="2"/><path d="M19 36h26v16a5 5 0 0 1-5 5H24a5 5 0 0 1-5-5Z" fill="#E0452F"/><rect x="26" y="3" width="12" height="6" rx="2" fill="#8A5A2B"/><path d="M24 30c0-4 4-4 4-8M34 30c0-4 4-4 4-8" stroke="#bbb" stroke-width="2" fill="none"/></svg>',
  felix: '<svg viewBox="0 0 64 64"><path d="M28 6h8v10c8 3 14 11 14 20a18 18 0 0 1-36 0c0-9 6-17 14-20Z" fill="#F3EFE6" stroke="#8A7B5C" stroke-width="2"/><path d="M15 38a17 17 0 0 0 34 0Z" fill="#E8B923"/><rect x="27" y="3" width="10" height="6" rx="2" fill="#8A5A2B"/><circle cx="25" cy="44" r="2" fill="#fff"/><circle cx="36" cy="48" r="1.6" fill="#fff"/><circle cx="31" cy="41" r="1.2" fill="#fff"/></svg>',
  bezoard: '<svg viewBox="0 0 64 64"><path d="M14 36c-2-12 8-22 20-22 10 0 18 8 16 20-2 10-10 16-20 16-8 0-15-5-16-14Z" fill="#8C6A45" stroke="#5A4128" stroke-width="2"/><circle cx="26" cy="30" r="3" fill="#6B4E31"/><circle cx="38" cy="38" r="2.5" fill="#6B4E31"/><circle cx="34" cy="24" r="2" fill="#A98760"/></svg>',
  chocogrenouille: '<svg viewBox="0 0 64 64"><path d="M32 6 56 22 48 54H16L8 22Z" fill="#6A3FA0" stroke="#3E2463" stroke-width="2"/><ellipse cx="32" cy="36" rx="12" ry="9" fill="#6B3A1E"/><circle cx="26" cy="28" r="4" fill="#6B3A1E"/><circle cx="38" cy="28" r="4" fill="#6B3A1E"/><circle cx="26" cy="27" r="1.5" fill="#fff"/><circle cx="38" cy="27" r="1.5" fill="#fff"/><text x="32" y="20" font-size="7" text-anchor="middle" fill="#F3D26B" font-family="serif">CHOCO</text></svg>',
  dragees: '<svg viewBox="0 0 64 64"><path d="M16 22h32l-4 34H20Z" fill="#E9D8B0" stroke="#8A7B5C" stroke-width="2"/><path d="M16 22l6-10h20l6 10" fill="#D94B4B"/><ellipse cx="26" cy="36" rx="4" ry="3" fill="#7BC043"/><ellipse cx="36" cy="40" rx="4" ry="3" fill="#F37736"/><ellipse cx="30" cy="47" rx="4" ry="3" fill="#7E57C2"/><ellipse cx="39" cy="30" rx="4" ry="3" fill="#FDF498"/></svg>',
  botruc: '<svg viewBox="0 0 64 64"><path d="M32 10v34M32 22l-8-6M32 28l9-7M32 44l-8 12M32 44l8 12M32 30l-11 4M32 30l11 3" stroke="#5E8C3A" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="10" r="5" fill="#7DB04B"/><circle cx="30" cy="9" r="1.2" fill="#2B2116"/><circle cx="34" cy="9" r="1.2" fill="#2B2116"/><path d="M24 14l-4-6M40 14l4-6" stroke="#7DB04B" stroke-width="3" stroke-linecap="round"/></svg>',
  niffleur: '<svg viewBox="0 0 64 64"><ellipse cx="30" cy="38" rx="18" ry="14" fill="#2E2A33"/><ellipse cx="48" cy="34" rx="8" ry="6" fill="#2E2A33"/><ellipse cx="55" cy="35" rx="3" ry="2.5" fill="#E8A3A3"/><circle cx="47" cy="31" r="1.6" fill="#fff"/><circle cx="20" cy="50" r="7" fill="#E8C33A" stroke="#B08A1A" stroke-width="2"/><text x="20" y="53" font-size="8" text-anchor="middle" fill="#7A5A10" font-weight="700">G</text></svg>',
  coupe: '<svg viewBox="0 0 64 64"><path d="M18 10h28c0 16-5 24-14 26-9-2-14-10-14-26Z" fill="#E2B74A" stroke="#9A7A22" stroke-width="2"/><path d="M18 14c-8 0-8 12 2 14M46 14c8 0 8 12-2 14" stroke="#C99A2E" stroke-width="3" fill="none"/><path d="M29 36h6v10h-6Z" fill="#C99A2E"/><path d="M20 52h24l-4-6H24Z" fill="#E2B74A" stroke="#9A7A22" stroke-width="2"/><circle cx="32" cy="20" r="4" fill="#2E2A33"/><circle cx="31" cy="19" r="1" fill="#E8D6A0"/></svg>',
  epee: '<svg viewBox="0 0 64 64"><path d="M32 4l4 6v30h-8V10Z" fill="#DDE3EC" stroke="#8A97A8" stroke-width="1.5"/><path d="M20 40h24v4H20Z" fill="#D9B24C"/><rect x="29" y="44" width="6" height="11" fill="#7A3E1E"/><circle cx="32" cy="58" r="4" fill="#D9B24C"/><circle cx="32" cy="42" r="2.4" fill="#C0262C"/><circle cx="23" cy="42" r="1.6" fill="#C0262C"/><circle cx="41" cy="42" r="1.6" fill="#C0262C"/></svg>',
  medaillon: '<svg viewBox="0 0 64 64"><path d="M32 4c-6 6-6 10 0 14 6-4 6-8 0-14Z" fill="none" stroke="#C99A2E" stroke-width="2.5"/><circle cx="32" cy="38" r="20" fill="#E2B74A" stroke="#9A7A22" stroke-width="2.5"/><circle cx="32" cy="38" r="14" fill="#1F7A4A"/><path d="M38 30c-4-3-12-1-10 4 2 4 10 2 10 7 0 5-8 6-12 3" stroke="#BFE8C9" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
  diademe: '<svg viewBox="0 0 64 64"><path d="M6 44c8-10 16-14 26-14s18 4 26 14" stroke="#CDD6E2" stroke-width="4" fill="none"/><path d="M14 38 20 22l6 12 6-20 6 20 6-12 6 16" fill="#E4EAF2" stroke="#8A97A8" stroke-width="2" stroke-linejoin="round"/><path d="M32 34l-5-6 5-6 5 6Z" fill="#3D6FD8" stroke="#1F3C85" stroke-width="1.5"/><circle cx="20" cy="36" r="2" fill="#3D6FD8"/><circle cx="44" cy="36" r="2" fill="#3D6FD8"/></svg>',
};

function sablierSVG(couleur, ratio) {
  const h = Math.round(30 * Math.max(0, Math.min(1, ratio)));
  return `<svg viewBox="0 0 34 52" aria-hidden="true"><path d="M5 3h24M5 49h24" stroke="#E8C978" stroke-width="3" stroke-linecap="round"/>
  <path d="M8 4c0 12 8 14 8 22s-8 10-8 22h18c0-12-8-14-8-22s8-10 8-22Z" fill="rgba(255,255,255,.07)" stroke="#E8C978" stroke-width="1.5"/>
  <clipPath id="cl-${couleur.slice(1)}"><path d="M8 4c0 12 8 14 8 22s-8 10-8 22h18c0-12-8-14-8-22s8-10 8-22Z"/></clipPath>
  <rect x="6" y="${48 - h}" width="22" height="${h}" fill="${couleur}" clip-path="url(#cl-${couleur.slice(1)})"/></svg>`;
}

function portraitSVG(maison, cls = "portrait") {
  const m = MAISONS[maison];
  return `<svg class="${cls}" viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="56" fill="${m.c}" opacity=".28"/><circle cx="60" cy="60" r="56" fill="none" stroke="${m.clair}" stroke-width="3"/>
  <path d="M24 116c2-20 17-31 36-31s34 11 36 31Z" fill="#1B1D33"/><circle cx="60" cy="64" r="14" fill="#1B1D33"/>
  <path d="M35 52h50l-6-5H41Z" fill="#1B1D33"/><path d="M44 49C50 37 55 22 67 10C64 24 70 37 76 49Z" fill="#1B1D33"/>
  <path d="M45.5 45.5h29l1 3h-31Z" fill="${m.c}"/><rect x="44" y="80" width="32" height="10" rx="4" fill="${m.c}"/>
  <rect x="51" y="80" width="4" height="10" fill="${m.c2}"/><rect x="65" y="80" width="4" height="10" fill="${m.c2}"/>
  <rect x="63" y="87" width="9" height="24" rx="2" fill="${m.c}"/><rect x="63" y="95" width="9" height="3" fill="${m.c2}"/><rect x="63" y="103" width="9" height="3" fill="${m.c2}"/></svg>`;
}
