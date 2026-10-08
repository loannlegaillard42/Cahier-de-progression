# La table de Vienne

Jeu pour la classe de 1re (Thème 1, chapitre 2 : point de passage et d'ouverture « Metternich et le congrès de Vienne »).
L'élève travaille pour Friedrich von Gentz, le secrétaire général du congrès. Il rencontre les négociateurs, redessine l'Europe sur une carte, puis suit la contestation de l'ordre de 1815 jusqu'en 1848.

Version en ligne : https://claude.ai/artifact/Hw57GCiwZvWEEjRoNtjkqX

## Déroulé (environ une heure)

| Étape | Ce que fait l'élève | Lien avec la fiche |
|---|---|---|
| L'Europe de 1812 | Lit la carte de l'Europe napoléonienne, répond à une question | Carte animée |
| Les salons | Parle à Gentz, Metternich, Castlereagh, Alexandre Ier, Hardenberg et Talleyrand ; remplit le tableau « Qui veut quoi ? » | Doc. 1 |
| La table des négociations | Trois séances, huit dossiers (Pologne, Saxe, Rhénanie, Belgique, Italie du Nord, Naples, Allemagne, France) ; quatre jauges : équilibre, légitimité, sécurité, entente | Tableau p. 2 |
| Événements | Crise de janvier 1815 (si l'entente s'effondre, le compromis historique est imposé), Cent-Jours | |
| Bilan | Compare sa carte à celle de 1815 ; « Et les peuples ? » | |
| Deux alliances | Sainte-Alliance ou Quadruple-Alliance ? | Doc. 2, encadré « Attention » |
| Tableau de la fiche | Classe 13 étiquettes dans les 4 lignes du tableau | Tableau p. 2 |
| 1815-1848 | Classe 12 événements (défense, contestation libérale, contestation nationale), dont Chios et les Trois Glorieuses | Question problématisée |
| Conclusion | Reçoit un plan en trois axes et rédige un brouillon de conclusion | Étape 2 |

Le carnet du secrétaire se remplit tout seul. L'élève le copie pour le rendre (ENT, document).
Les boutons « Copier le plan » et « Copier le tableau comparatif » (écran de conclusion, écran de fin, carnet) copient le plan et le tableau « Ma proposition / Décision de 1815 » sous forme de vrais tableaux, à coller dans un traitement de texte. Le code de reprise permet de finir la partie sur un autre ordinateur, par exemple à la maison.

## Fichiers

- `jeu/donnees.js` : tous les textes (personnages, dossiers, événements, questions). On peut les modifier sans toucher au reste.
- `jeu/jeu.js` : le déroulé du jeu.
- `jeu/carte.js` : l'affichage de la carte (SVG).
- `jeu/carte-donnees.js` : la carte elle-même, produite par les scripts de `carte-source/`.
- `jeu/partie.js` : une partie complète jouée automatiquement (Playwright), pour vérifier qu'une modification ne casse rien. Lancer d'abord `sh fabrique-local.sh`.
- `jeu/mesure.js` : mesure la fluidité de la carte sur un ordinateur lent simulé (processeur bridé 6 fois).

## Fluidité

Pendant un glisser ou un zoom, la carte est déplacée comme une image (transformation CSS) puis redessinée une seule fois à la fin du geste. Elle n'est recalculée que si un territoire change de propriétaire, et aucune animation ne tourne en permanence. Sur un ordinateur lent simulé, le glisser tourne à environ 60 images par seconde et la carte au repos n'utilise plus le processeur.

## Reconstruire la carte

Les frontières de 1812 et de 1815 sont recomposées à partir des limites administratives actuelles (Natural Earth), découpées par des masques dessinés à la main là où les frontières anciennes ne suivent pas les limites actuelles.

```sh
cd carte-source
sh telecharger.sh
pip install shapely pyproj matplotlib
npm install
python3 cellules.py      # cellules et propriétaires en 1812 et en 1815
python3 temoins.py       # vérifie 336 villes-témoins (propriétaire attendu en 1812 et en 1815)
python3 projette.py      # projection de Lambert, pavage propre, nettoyage
node topo.js 4 1e4       # TopoJSON simplifié (4 = niveau de simplification, 1e4 = précision)
python3 donnees_carte.py # écrit carte-donnees.js (à copier dans ../jeu/)
```

## Sources

- Documents : fiche élève du PPO ; traité de la Quadruple-Alliance (20 novembre 1815, art. 6).
- Personnages réels, paroles imaginées d'après leurs positions au congrès.
- Fond de carte : Natural Earth (domaine public). Bibliothèque topojson-client (licence ISC).
