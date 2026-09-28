import json
from pyproj import Transformer
T = Transformer.from_crs('EPSG:4326', '+proj=laea +lat_0=50 +lon_0=12 +units=km', always_xy=True)
def P(lon, lat):
    x, y = T.transform(lon, lat); return [round(x, 1), round(-y, 1)]

# Villes : (id, nom, lon, lat, niveau) — niveau 1 = toujours visible, 2 = à partir d'un zoom moyen, 3 = lieux d'événements (affichés à la demande)
VILLES = [
 ('paris','Paris',2.35,48.86,1),('londres','Londres',-0.13,51.51,1),('vienne','Vienne',16.37,48.21,1),('berlin','Berlin',13.4,52.52,1),
 ('petersbourg','Saint-Pétersbourg',30.32,59.94,1),('varsovie','Varsovie',21.01,52.23,1),('madrid','Madrid',-3.7,40.42,1),('lisbonne','Lisbonne',-9.14,38.72,1),
 ('rome','Rome',12.5,41.9,1),('naples','Naples',14.27,40.85,1),('constantinople','Constantinople',28.98,41.01,1),('stockholm','Stockholm',18.07,59.33,1),('copenhague','Copenhague',12.57,55.68,1),
 ('turin','Turin',7.69,45.07,2),('milan','Milan',9.19,45.46,2),('venise','Venise',12.34,45.44,2),('genes','Gênes',8.93,44.41,2),('florence','Florence',11.25,43.77,2),
 ('munich','Munich',11.58,48.14,2),('dresde','Dresde',13.74,51.05,2),('stuttgart','Stuttgart',9.18,48.78,2),('hanovre','Hanovre',9.73,52.37,2),('bruxelles','Bruxelles',4.35,50.85,2),
 ('amsterdam','Amsterdam',4.9,52.37,2),('berne','Berne',7.45,46.95,2),('cracovie','Cracovie',19.94,50.06,2),('prague','Prague',14.42,50.09,2),('buda','Buda',19.04,47.5,2),
 ('christiania','Christiania',10.75,59.91,2),('konigsberg','Königsberg',20.51,54.71,2),('dantzig','Dantzig',18.65,54.35,2),('posen','Posen',16.93,52.41,2),('breslau','Breslau',17.04,51.11,2),
 ('leipzig','Leipzig',12.37,51.34,2),('francfort','Francfort',8.68,50.11,2),('cologne','Cologne',6.95,50.94,2),('hambourg','Hambourg',9.99,53.55,2),('palerme','Palerme',13.36,38.12,2),
 ('cagliari','Cagliari',9.11,39.22,2),('kiev','Kiev',30.52,50.45,2),('athenes','Athènes',23.73,37.98,2),('lemberg','Lemberg',24.03,49.84,2),('trieste','Trieste',13.77,45.65,2),
 ('bologne','Bologne',11.34,44.49,2),('parme','Parme',10.33,44.8,2),('modene','Modène',10.93,44.65,2),('lucques','Lucques',10.5,43.84,2),('karlsruhe','Karlsruhe',8.4,49.01,2),
 ('mayence','Mayence',8.27,50.0,2),('luxembourg','Luxembourg',6.13,49.61,2),('dublin','Dublin',-6.26,53.35,2),('edimbourg','Édimbourg',-3.19,55.95,2),('marseille','Marseille',5.37,43.3,2),
 ('lyon','Lyon',4.84,45.76,2),('bordeaux','Bordeaux',-0.58,44.84,2),('strasbourg','Strasbourg',7.75,48.58,2),('riga','Riga',24.1,56.95,2),('vilna','Vilna',25.28,54.69,2),
 ('bucarest','Bucarest',26.1,44.43,2),('belgrade','Belgrade',20.47,44.8,2),('iasi','Iași',27.59,47.16,2),('smyrne','Smyrne',27.14,38.42,2),('la_valette','La Valette',14.51,35.9,2),
 ('corfou','Corfou',19.92,39.62,2),('alger','Alger',3.06,36.75,2),('tunis','Tunis',10.18,36.8,2),('gibraltar','Gibraltar',-5.35,36.14,2),('barcelone','Barcelone',2.17,41.39,2),
 ('carlsbad','Carlsbad',12.87,50.23,3),('troppau','Troppau',17.9,49.94,3),('laibach','Laibach',14.51,46.05,3),('verone','Vérone',10.99,45.44,3),('aix','Aix-la-Chapelle',6.08,50.78,3),
 ('cadix','Cadix',-6.29,36.53,3),('chios','Chios',26.05,38.37,3),('navarin','Navarin',21.7,36.91,3),('missolonghi','Missolonghi',21.43,38.37,3),('waterloo','Waterloo',4.4,50.68,3),
 ('tolentino','Tolentino',13.28,43.21,3),('golfejuan','Golfe-Juan',7.08,43.57,3),('elbe','Île d\'Elbe',10.3,42.78,3),('kalisz','Kalisz',18.09,51.76,3),('kiel','Kiel',10.13,54.32,3),('wartburg','Wartbourg',10.31,50.97,3),
 ('modene3','Modène',10.93,44.65,3),('budapest','Pest',19.06,47.5,3),('milan3','Milan',9.19,45.46,3),('venise3','Venise',12.34,45.44,3),('berlin3','Berlin',13.4,52.52,3),
 ('paris3','Paris',2.35,48.86,3),('vienne3','Vienne',16.37,48.21,3),('bruxelles3','Bruxelles',4.35,50.85,3),('varsovie3','Varsovie',21.01,52.23,3),('cracovie3','Cracovie',19.94,50.06,3),
 ('naples3','Naples',14.27,40.85,3),('turin3','Turin',7.69,45.07,3),('prague3','Prague',14.42,50.09,3),('madrid3','Madrid',-3.7,40.42,3),('petersbourg3','Saint-Pétersbourg',30.32,59.94,3),
]
villes = [{'id': i, 'n': n, 'p': P(lo, la), 'niv': nv} for i, n, lo, la, nv in VILLES]

# Étiquettes des États : (texte, lon, lat, taille, style) — taille relative, style : 'A' capitales espacées, 'b' italique
E1815 = {
 'FRA': [('Royaume de France', 2.3, 47.3, 1.25, 'A')], 'GBR': [('Royaume-Uni', -1.6, 52.6, 1.05, 'A')], 'ESP': [('Espagne', -3.6, 40.1, 1.2, 'A')],
 'POR': [('Portugal', -8.1, 39.9, .7, 'A')], 'NLD': [('Pays-Bas', 5.2, 51.9, .8, 'A'), ('Belgique', 4.5, 50.6, .55, 'b')], 'SUI': [('Suisse', 8.0, 46.8, .7, 'A')],
 'SAR': [('Piémont-Sardaigne', 7.6, 44.95, .6, 'A'), ('Sardaigne', 9.0, 40.1, .55, 'b')], 'AUT': [("Empire d'Autriche", 18.8, 47.55, 1.15, 'A'), ('Lombardie-Vénétie', 10.9, 45.55, .55, 'b')],
 'PAR': [('Parme', 9.95, 44.75, .45, 'A')], 'MOD': [('Modène', 10.75, 44.4, .45, 'A')], 'LUC': [('Lucques', 10.45, 43.95, .4, 'A')], 'TOS': [('Toscane', 11.2, 43.35, .55, 'A')],
 'PAP': [('États pontificaux', 12.75, 42.9, .6, 'A')], 'SIC': [('Royaume des Deux-Siciles', 15.9, 40.75, .75, 'A'), ('Sicile', 14.2, 37.55, .55, 'b')],
 'PRU': [('Royaume de Prusse', 16.0, 53.3, 1.05, 'A'), ('Prusse rhénane', 7.4, 50.95, .5, 'b')], 'RUS': [('Empire russe', 28.8, 54.6, 1.35, 'A'), ('Finlande', 26.5, 62.0, .55, 'b')],
 'POL': [('Royaume de Pologne', 20.9, 52.0, .7, 'A'), ('(uni à la Russie)', 20.9, 51.55, .45, 'b')], 'KRA': [('Cracovie', 19.95, 50.35, .38, 'b')],
 'DEN': [('Danemark', 9.4, 56.05, .75, 'A')], 'SWN': [('Suède-Norvège', 15.2, 59.3, 1.0, 'A')], 'OTT': [('Empire ottoman', 24.3, 42.4, 1.2, 'A')],
 'BAV': [('Bavière', 11.8, 48.85, .65, 'A')], 'WUR': [('Wurtemberg', 9.45, 48.65, .42, 'A')], 'BAD': [('Bade', 8.3, 48.2, .42, 'A')], 'SAX': [('Saxe', 12.95, 50.8, .5, 'A')],
 'HAN': [('Hanovre', 9.7, 52.85, .55, 'A')], 'GER': [], 'HORS': [('Régence d\'Alger', 3.0, 35.3, .45, 'b'), ('Maroc', -5.8, 34.6, .45, 'b'), ('Régence de Tunis', 9.6, 35.2, .42, 'b')],
 # États hypothétiques (choix de l'élève)
 'POLi': [('Pologne', 20.9, 52.0, .9, 'A')], 'VEN': [('Rép. de Venise', 12.2, 45.75, .5, 'A')], 'GEN': [('Rép. de Gênes', 8.9, 44.55, .45, 'A')],
 'ITN': [("Royaume d'Italie", 10.9, 45.5, .6, 'A')], 'BEL': [('Belgique', 4.5, 50.6, .6, 'A')], 'NAPm': [('Royaume de Naples', 15.9, 40.75, .75, 'A'), ('(Murat)', 15.9, 40.35, .45, 'b')],
 'ALL': [('Allemagne unifiée', 10.8, 50.6, 1.0, 'A')],
}
E1812 = {
 'EMP': [('Empire français', 2.3, 47.3, 1.35, 'A'), ('Provinces illyriennes', 15.2, 44.95, .5, 'b'), ('Catalogne', 1.6, 41.9, .45, 'b')], 'GBR': [('Royaume-Uni', -1.6, 52.6, 1.05, 'A')],
 'ESPj': [('Espagne', -3.6, 40.3, 1.2, 'A'), ('(Joseph Bonaparte)', -3.6, 39.75, .5, 'b')], 'POR': [('Portugal', -8.1, 39.9, .7, 'A')], 'SUI': [('Suisse', 8.2, 46.8, .6, 'A')],
 'ITA': [("Royaume d'Italie", 11.2, 45.3, .7, 'A')], 'NAP': [('Royaume de Naples', 15.9, 40.75, .75, 'A'), ('(Murat)', 15.9, 40.35, .45, 'b')], 'SICi': [('Sicile', 14.2, 37.55, .55, 'b')],
 'SARi': [('Sardaigne', 9.0, 40.1, .55, 'b')], 'CDR': [('Westphalie', 10.3, 51.95, .5, 'b')], 'CDR_BAV': [('Bavière', 11.8, 48.6, .65, 'A')], 'CDR_WUR': [('Wurt.', 9.45, 48.65, .4, 'A')],
 'CDR_BAD': [('Bade', 8.3, 48.2, .4, 'A')], 'CDR_SAX': [('Saxe', 13.05, 51.62, .55, 'A')], 'VAR': [('Duché de Varsovie', 20.6, 52.1, .7, 'A')], 'PRU': [('Prusse', 15.8, 53.35, .8, 'A')],
 'AUT': [("Empire d'Autriche", 19.3, 47.9, 1.1, 'A')], 'RUS': [('Empire russe', 28.8, 54.6, 1.35, 'A')], 'SWE': [('Suède', 15.2, 59.3, .9, 'A')], 'DNK': [('Danemark-Norvège', 9.2, 56.1, .6, 'A')],
 'OTT': [('Empire ottoman', 24.3, 42.4, 1.2, 'A')], 'DAN': [], 'NEU': [], 'LUCP': [], 'HORS': [('Régence d\'Alger', 3.0, 35.3, .45, 'b'), ('Maroc', -5.8, 34.6, .45, 'b'), ('Régence de Tunis', 9.6, 35.2, .42, 'b')],
}
# Zones de négociation : étiquette et cadrage (lon/lat min-max)
DOSSIERS = {
 'pologne': ('Duché de Varsovie', 20.4, 52.1, (15.5, 49.3, 25.5, 55.3)),
 'saxe': ('Royaume de Saxe', 13.1, 51.45, (10.3, 50.0, 16.2, 52.9)),
 'rhin': ('Rhénanie et Westphalie', 7.3, 50.9, (4.8, 48.8, 10.2, 52.6)),
 'belgique': ('Belgique', 4.6, 50.55, (1.8, 49.1, 7.2, 51.9)),
 'italie': ('Italie du Nord', 10.3, 45.35, (6.5, 43.4, 14.3, 46.9)),
 'naples': ('Royaume de Naples', 15.7, 40.9, (11.5, 37.8, 19.0, 42.9)),
 'allemagne': ('Allemagne', 10.3, 50.4, (4.8, 46.3, 19.5, 55.2)),
 'france': ('France', 4.2, 47.2, (-5.0, 42.0, 10.5, 51.5)),
}
import pickle as _pk
from shapely.geometry import Point as _Pt
_CELLS = _pk.load(open('cells.pkl', 'rb'))
def cellule(lo, la):
    p = _Pt(lo, la)
    for c in _CELLS:
        if c['geom'].contains(p): return c['id']
    return min(_CELLS, key=lambda c: c['geom'].distance(p))['id']
def PT(d): return {o: [{'t': t, 'p': P(lo, la), 's': s, 'y': st, 'c': cellule(lo, la)} for t, lo, la, s, st in L] for o, L in d.items()}
def BB(b): 
    x0, y0 = P(b[0], b[3]); x1, y1 = P(b[2], b[1])
    # boîte englobante à partir des quatre coins
    pts = [P(b[0], b[1]), P(b[0], b[3]), P(b[2], b[1]), P(b[2], b[3])]
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    return [min(xs), min(ys), max(xs), max(ys)]
dossiers = {k: {'t': t, 'p': P(lo, la), 'b': BB(b)} for k, (t, lo, la, b) in DOSSIERS.items()}
cadres = {'europe': [-1900, -1300, 1520, 1620], 'centre': BB((-4.5, 40.5, 28.0, 57.5))}
libelles = {'cdr': P(9.4, 50.75), 'confed': P(9.35, 50.45)}

from shapely.geometry import LineString as _LS, box as _box
_EXT = _box(-1900, -1300, 1520, 1620)
grat = []
for lon in range(-10, 40, 5):
    l = _LS([P(lon, la / 4) for la in range(33 * 4, 64 * 4)]).intersection(_EXT)
    for m in ([l] if l.geom_type == 'LineString' else list(getattr(l, 'geoms', []))):
        if m.length > 50: grat.append([[round(x, 1), round(y, 1)] for x, y in m.coords])
for lat in range(35, 65, 5):
    l = _LS([P(lo / 4, lat) for lo in range(-14 * 4, 40 * 4)]).intersection(_EXT)
    for m in ([l] if l.geom_type == 'LineString' else list(getattr(l, 'geoms', []))):
        if m.length > 50: grat.append([[round(x, 1), round(y, 1)] for x, y in m.coords])
topo = json.load(open('europe.topo.json'))
eaux = json.load(open('eaux.json'))
js = ['/* Carte de l\'Europe 1812 / 1815 — données (projection azimutale équivalente de Lambert, unités : km, y vers le bas).',
      '   Fond : Natural Earth (domaine public), frontières historiques recomposées pour ce jeu. */',
      'window.EUROPE = ' + json.dumps(topo, separators=(',', ':')) + ';',
      'window.EAUX = ' + json.dumps(eaux, separators=(',', ':'), ensure_ascii=False) + ';',
      'window.VILLES = ' + json.dumps(villes, separators=(',', ':'), ensure_ascii=False) + ';',
      'window.ETIQUETTES = ' + json.dumps({'1815': PT(E1815), '1812': PT(E1812)}, separators=(',', ':'), ensure_ascii=False) + ';',
      'window.ZONES = ' + json.dumps({'dossiers': dossiers, 'cadres': cadres, 'graticule': grat, 'libelles': libelles}, separators=(',', ':'), ensure_ascii=False) + ';']
open('carte-donnees.js', 'w').write('\n'.join(js) + '\n')
import os; print('carte-donnees.js', os.path.getsize('carte-donnees.js') // 1024, 'Ko')
