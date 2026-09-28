"""Construction des cellules historiques (1812 / 1815) à partir de Natural Earth admin-1 (10m).
Chaque cellule = morceau de terre avec : id, o1812 (propriétaire 1812), o1815 (propriétaire 1815 réel),
dossier (négociation du jeu), grp (groupe à l'intérieur du dossier), confed (membre de la Confédération germanique en 1815)."""
import json
from shapely.geometry import shape, Polygon, MultiPolygon, box, Point
from shapely.ops import unary_union
from shapely.validation import make_valid

EXT = box(-12.5, 33.0, 38.0, 63.0)

def poly(pts):
    return make_valid(Polygon(pts))

def nettoie(g):
    g = make_valid(g)
    if g.geom_type == 'GeometryCollection':
        g = unary_union([x for x in g.geoms if x.geom_type in ('Polygon', 'MultiPolygon')])
    return g.buffer(0)

A1 = []
for f in json.load(open('ne_10m_admin_1_states_provinces.geojson'))['features']:
    g = shape(f['geometry'])
    if not g.intersects(EXT):
        continue
    p = f['properties']
    A1.append({'a3': p['adm0_a3'], 'nom': p['name'] or '', 'reg': p.get('region') or '',
               'geom': nettoie(g.intersection(EXT))})

def U(a3, noms=None, regs=None, sauf=None):
    """Union des unités admin-1 d'un pays (filtrées par nom ou région)."""
    gs = []
    for u in A1:
        if u['a3'] != a3:
            continue
        if noms is not None and u['nom'] not in noms:
            continue
        if regs is not None and u['reg'] not in regs:
            continue
        if sauf is not None and u['nom'] in sauf:
            continue
        gs.append(u['geom'])
    if not gs:
        raise SystemExit(f'Aucune unité pour {a3} {noms} {regs}')
    return nettoie(unary_union(gs))

def verifie_noms(a3, noms):
    connus = {u['nom'] for u in A1 if u['a3'] == a3}
    manquants = [n for n in noms if n not in connus]
    if manquants:
        raise SystemExit(f'Noms inconnus pour {a3}: {manquants}')

# ---------------------------------------------------------------- masques (lon, lat)
M = {}
M['NICE'] = poly([(7.2,43.4),(7.19,43.66),(7.18,43.78),(7.1,43.84),(6.98,43.87),(6.88,43.92),(6.84,44.0),(6.6,44.2),(6.6,44.6),(8.0,44.6),(8.0,43.4)])
M['EUPEN'] = poly([(6.0,50.78),(6.13,50.72),(6.3,50.5),(6.42,50.33),(6.27,50.13),(6.13,50.13),(6.0,50.25),(5.99,50.38),(6.0,50.5),(5.95,50.62),(5.97,50.72)])
M['PAVESE'] = poly([(8.8,45.5),(8.83,45.42),(8.92,45.33),(9.0,45.27),(9.1,45.21),(9.15,45.17),(9.27,45.12),(9.4,45.11),(9.55,45.09),(9.8,45.07),(9.8,45.5)])
M['OLTREPO'] = poly([(8.4,45.13),(8.7,45.1),(8.9,45.1),(9.1,45.12),(9.27,45.12),(9.4,45.11),(9.55,45.09),(9.8,45.07),(9.8,44.5),(8.4,44.5)])
M['LAZIO_NAP'] = poly([(13.2,41.2),(13.33,41.28),(13.38,41.42),(13.5,41.52),(13.56,41.56),(13.5,41.61),(13.46,41.66),(13.48,41.72),(13.5,41.78),(13.45,41.85),(13.4,41.95),(14.3,41.95),(14.3,40.9),(13.2,40.9)])
M['INNVIERTEL'] = poly([(12.7,48.1),(12.85,48.35),(13.4,48.6),(13.6,48.5),(13.75,48.3),(13.7,48.0),(13.55,47.85),(13.3,47.8),(12.95,47.95)])
M['CARINTHIE_O'] = poly([(12.0,46.0),(14.05,46.0),(14.05,47.3),(12.0,47.3)])
M['SUD_SAVE_HR'] = poly([(15.3,45.9),(15.5,45.87),(15.7,45.85),(15.85,45.8),(16.0,45.77),(16.15,45.7),(16.3,45.55),(16.4,45.45),(16.7,45.33),(16.95,45.25),(16.95,44.0),(15.3,44.0)])
M['VOIVODINE'] = poly([(18.8,45.0),(19.1,44.95),(19.4,44.92),(19.7,44.77),(20.0,44.7),(20.2,44.67),(20.35,44.76),(20.448,44.826),(20.55,44.84),(20.8,44.75),(20.95,44.7),(21.2,44.78),(21.4,44.78),(21.6,44.68),(22.0,44.6),(22.7,44.55),(22.7,46.3),(18.8,46.3)])
M['TERNOPIL_N'] = poly([(24.5,49.95),(26.8,49.95),(26.8,50.6),(24.5,50.6)])
M['BESSARABIE_N'] = poly([(26.15,47.5),(28.0,47.5),(28.0,49.0),(26.15,49.0)])
M['MEMEL'] = poly([(20.9,55.2),(20.95,55.85),(21.15,55.8),(21.35,55.72),(21.5,55.6),(21.75,55.48),(21.95,55.35),(22.2,55.2),(22.55,55.09),(22.55,55.0),(20.9,55.0)])
M['UZNEMUNE'] = poly([(23.1,53.9),(23.5,53.92),(23.83,53.92),(23.97,54.1),(24.05,54.4),(24.02,54.62),(23.93,54.8),(23.85,54.88),(23.6,54.97),(23.45,55.07),(23.0,55.09),(22.6,55.08),(22.3,55.05),(22.6,54.4),(22.8,54.0)])
# Frontière Prusse / royaume de Pologne (1815) : tout ce qui est à l'est de la ligne
M['CONGRES_EST'] = poly([(20.2,53.15),(19.95,53.18),(19.7,53.17),(19.45,53.19),(19.3,53.18),(19.05,53.11),(18.85,53.06),(18.72,53.02),(18.66,52.92),(18.6,52.85),(18.47,52.77),(18.3,52.72),(18.25,52.6),(18.15,52.48),(18.0,52.37),(17.88,52.3),(17.8,52.22),(17.66,52.18),(17.8,52.05),(17.95,51.9),(18.02,51.8),(18.05,51.72),(18.07,51.6),(18.1,51.45),(18.12,51.35),(18.15,51.25),(18.2,51.15),(18.3,51.05),(18.45,50.95),(18.6,50.85),(18.75,50.75),(18.85,50.62),(18.95,50.5),(19.05,50.4),(19.08,50.33),(19.1,50.28),(19.18,50.23),(19.5,49.9),(24.5,49.9),(24.5,53.15)])
M['KP_NORD'] = poly([(17.0,53.95),(17.0,53.33),(18.36,53.33),(18.4,53.35),(18.46,53.41),(18.55,53.45),(18.72,53.47),(19.0,53.46),(19.4,53.5),(19.8,53.5),(19.8,53.95)])
M['WP_NORD'] = poly([(15.5,53.7),(15.5,52.95),(16.2,52.9),(16.55,52.92),(16.75,53.05),(17.0,53.08),(17.4,53.1),(17.62,53.14),(17.62,53.7)])
M['CRACOVIE'] = poly([(19.17,50.25),(19.5,50.26),(19.8,50.23),(20.0,50.17),(20.1,50.1),(20.1,50.05),(19.94,50.045),(19.8,50.02),(19.6,50.0),(19.4,50.03),(19.25,50.07),(19.17,50.1)])
M['NORD_VISTULE'] = poly([(18.9,50.08),(19.1,50.08),(19.25,50.07),(19.4,50.03),(19.6,50.0),(19.8,50.02),(19.94,50.045),(20.1,50.05),(20.3,50.08),(20.5,50.18),(20.7,50.22),(20.9,50.26),(21.1,50.32),(21.3,50.42),(21.5,50.53),(21.7,50.65),(21.83,50.75),(21.83,51.2),(18.9,51.2)])
M['SILESIE_AUT'] = poly([(17.5,49.93),(19.5,49.93),(19.5,49.3),(17.5,49.3)])
M['DANTZIG'] = poly([(18.45,54.28),(18.5,54.45),(18.68,54.48),(18.85,54.42),(18.85,54.28),(18.65,54.22)])
M['BIALYSTOK'] = poly([(22.4,52.6),(22.55,52.4),(23.0,52.2),(24.5,52.2),(24.5,53.6),(23.7,53.6),(23.2,53.55),(22.85,53.5),(22.6,53.35),(22.55,53.1),(22.4,52.9)])
# Rhin : tout ce qui est à l'ouest du fleuve
LIGNE_RHIN = [(8.22,48.97),(8.36,49.2),(8.44,49.32),(8.46,49.49),(8.4,49.6),(8.37,49.7),(8.36,49.86),(8.33,49.95),(8.3,50.0),(8.25,50.03),(8.15,50.04),(8.05,50.0),(7.9,49.98),(7.8,50.04),(7.72,50.15),(7.62,50.24),(7.61,50.35),(7.5,50.41),(7.4,50.45),(7.28,50.55),(7.18,50.65),(7.11,50.74),(7.0,50.85),(6.968,50.94),(6.99,51.03),(6.9,51.11),(6.8,51.17),(6.76,51.23),(6.73,51.3),(6.74,51.43),(6.65,51.6),(6.5,51.73),(6.3,51.83),(6.1,51.87)]
M['RIVE_GAUCHE'] = poly(LIGNE_RHIN + [(5.5,51.87),(5.5,48.9),(8.22,48.9)])
M['PALATINAT'] = poly([(7.03,49.12),(7.05,49.2),(7.075,49.265),(7.13,49.305),(7.2,49.34),(7.23,49.36),(7.28,49.43),(7.35,49.52),(7.45,49.6),(7.62,49.68),(7.85,49.7),(8.02,49.7),(8.15,49.66),(8.3,49.6),(8.5,49.6),(8.5,48.9),(7.03,48.9)])
M['HESSE_RHENANE'] = poly([(7.85,49.7),(8.02,49.7),(8.15,49.66),(8.3,49.6),(8.5,49.6),(8.5,50.05),(8.3,50.05),(8.1,50.02),(7.89,50.0),(7.9,49.93),(7.9,49.87),(7.92,49.82),(7.9,49.75)])
M['EMPIRE_NO'] = poly([(6.62,51.66),(6.96,51.66),(7.18,51.74),(7.52,51.63),(7.82,51.68),(8.0,51.75),(8.2,51.85),(8.4,52.05),(8.6,52.2),(8.92,52.29),(9.2,52.52),(9.5,52.65),(9.9,52.75),(10.3,52.9),(10.6,53.1),(10.62,53.36),(11.0,53.6),(11.0,54.2),(5.9,54.2),(5.9,51.66)])
M['LIPPE'] = poly([(8.6,51.95),(8.68,52.08),(8.85,52.1),(9.05,52.1),(9.2,51.98),(9.15,51.82),(8.95,51.75),(8.72,51.78),(8.6,51.85)])
M['OLDENBOURG'] = poly([(7.62,53.2),(7.7,52.95),(7.72,52.75),(7.95,52.6),(8.15,52.47),(8.35,52.45),(8.45,52.55),(8.55,52.75),(8.7,52.95),(8.65,53.1),(8.5,53.25),(8.52,53.55),(8.3,53.62),(8.05,53.72),(7.8,53.72),(7.72,53.45)])
M['BRUNSWICK'] = unary_union([poly([(10.25,52.45),(10.55,52.42),(10.8,52.4),(11.05,52.3),(11.1,52.12),(10.9,51.98),(10.6,51.95),(10.45,51.97),(10.35,52.05),(10.25,52.2)]),
                              poly([(9.35,51.97),(9.6,51.98),(9.9,51.92),(10.12,51.88),(10.12,51.78),(9.85,51.72),(9.55,51.7),(9.35,51.8)])])
M['SCHAUMBOURG'] = poly([(8.95,52.22),(9.1,52.33),(9.3,52.42),(9.45,52.3),(9.35,52.18),(9.15,52.12),(8.97,52.14)])
M['SCHLESWIG'] = poly([(7.5,54.3),(8.85,54.28),(9.1,54.36),(9.4,54.33),(9.66,54.3),(9.9,54.36),(10.15,54.43),(10.4,54.5),(11.4,54.5),(11.4,55.3),(7.5,55.3)])
M['LUBECK'] = poly([(10.55,53.85),(10.62,53.98),(10.9,53.98),(10.95,53.88),(10.8,53.8),(10.62,53.8)])
M['LAUENBOURG'] = poly([(10.3,53.42),(10.45,53.35),(10.62,53.33),(10.78,53.38),(10.95,53.45),(10.95,53.8),(10.78,53.78),(10.62,53.78),(10.5,53.72),(10.4,53.55)])
M['POMERANIE_SUED'] = poly([(12.44,54.3),(12.47,54.2),(12.6,54.12),(12.75,54.07),(12.88,53.98),(12.98,53.93),(13.1,53.925),(13.3,53.905),(13.69,53.87),(13.78,53.9),(13.77,54.02),(13.8,54.12),(13.9,54.2),(14.0,54.4),(13.6,54.8),(12.8,54.6),(12.3,54.45)])
M['POMERANIE_PRU'] = poly([(12.98,53.93),(13.1,53.925),(13.3,53.905),(13.69,53.87),(13.78,53.9),(13.77,54.02),(13.8,54.12),(13.9,54.2),(14.4,54.2),(14.4,53.3),(13.9,53.4),(13.75,53.55),(13.62,53.72),(13.45,53.72),(13.3,53.63),(13.12,53.66),(12.95,53.78),(12.9,53.88)])
M['LUSACE_BB'] = poly([(12.2,52.25),(12.45,52.2),(12.7,52.17),(13.0,52.08),(13.3,52.05),(13.55,52.1),(13.8,52.08),(14.0,52.05),(14.3,52.03),(14.8,52.06),(14.8,51.3),(12.2,51.3)])
M['ANHALT'] = unary_union([poly([(11.65,51.66),(11.7,51.85),(11.9,52.0),(12.1,52.08),(12.3,52.05),(12.45,51.9),(12.42,51.78),(12.2,51.72),(12.0,51.68),(11.85,51.63)]),
                           poly([(11.0,51.62),(11.1,51.75),(11.3,51.76),(11.35,51.68),(11.2,51.6)])])
M['SAXE_ST'] = poly([(11.1,51.4),(11.25,51.52),(11.5,51.58),(11.7,51.55),(11.85,51.52),(11.9,51.44),(12.05,51.44),(12.2,51.5),(12.25,51.6),(12.2,51.7),(12.35,51.72),(12.45,51.78),(12.42,51.9),(12.4,52.0),(12.5,52.1),(12.8,52.1),(13.2,52.1),(13.2,50.9),(11.1,50.9)])
M['ELBE_EST'] = poly([(11.66,52.1),(11.72,52.2),(11.8,52.32),(11.9,52.45),(11.99,52.54),(12.02,52.68),(12.03,52.8),(11.95,52.9),(11.75,53.05),(12.6,53.05),(12.6,52.05),(12.2,52.05),(11.9,52.0),(11.75,52.02)])
M['THURINGE_PRU'] = poly([(9.9,51.2),(10.0,51.45),(10.4,51.58),(10.95,51.62),(11.45,51.42),(11.35,51.2),(11.15,51.1),(11.1,50.95),(10.9,50.97),(10.55,51.03),(10.3,51.1),(10.05,51.15)])
M['SAXE_PRU'] = poly([(12.1,51.43),(12.55,51.42),(12.9,51.43),(13.1,51.4),(13.3,51.42),(13.6,51.45),(13.9,51.4),(14.2,51.33),(14.45,51.28),(14.7,51.22),(14.85,51.12),(14.97,51.06),(15.2,51.06),(15.2,51.8),(12.1,51.8)])
M['BASSE_FRANCONIE'] = poly([(8.9,50.3),(9.5,50.55),(10.0,50.62),(10.45,50.45),(10.62,50.3),(10.78,50.18),(10.85,50.08),(10.75,49.93),(10.55,49.8),(10.4,49.7),(10.15,49.62),(9.95,49.52),(9.6,49.55),(9.2,49.6),(8.9,49.8)])
M['COBOURG'] = poly([(10.75,50.22),(10.9,50.4),(11.2,50.4),(11.3,50.28),(11.1,50.15),(10.88,50.15)])
M['BADE'] = poly([(7.4,50.0),(9.7,50.0),(9.6,49.8),(9.72,49.55),(9.6,49.42),(9.45,49.36),(9.3,49.3),(9.18,49.28),(9.05,49.2),(8.98,49.12),(8.85,49.05),(8.76,48.98),(8.75,48.92),(8.72,48.85),(8.6,48.8),(8.42,48.75),(8.35,48.6),(8.3,48.47),(8.3,48.3),(8.33,48.15),(8.5,48.1),(8.52,48.02),(8.62,47.95),(8.72,47.9),(8.85,47.85),(9.0,47.9),(9.1,48.05),(9.2,47.98),(9.35,47.9),(9.42,47.75),(9.35,47.6),(9.35,47.4),(7.4,47.4)])
M['HOHENZOLLERN'] = poly([(8.85,48.4),(9.0,48.42),(9.15,48.3),(9.3,48.2),(9.35,48.08),(9.2,48.02),(9.1,48.08),(9.0,48.25),(8.88,48.3)])
M['RLP_NORD_PRU'] = poly([(7.62,50.33),(7.68,50.4),(7.7,50.5),(7.75,50.6),(7.8,50.7),(7.95,50.72),(8.2,50.75),(8.2,51.0),(7.0,51.0),(7.0,50.33)])
M['LUSACE_EST'] = poly([(14.9,50.85),(15.3,50.85),(15.33,51.05),(15.3,51.15),(15.35,51.3),(15.4,51.45),(14.9,51.45)])
M['CORFOU'] = poly([(19.3,39.3),(20.3,39.3),(20.3,39.95),(19.3,39.95)])

# ---------------------------------------------------------------- cellules
CELLS = []
def C(id, geom, o1812, o1815, dossier=None, grp=None, confed=False):
    geom = nettoie(geom)
    if geom.is_empty:
        raise SystemExit(f'Cellule vide : {id}')
    CELLS.append(dict(id=id, geom=geom, o1812=o1812, o1815=o1815, dossier=dossier, grp=grp, confed=confed))

# --- Îles britanniques, péninsule Ibérique
C('GB', unary_union([U('GBR'), U('IRL'), U('IMN'), U('JEY'), U('GGY'), U('GIB')]), 'GBR', 'GBR')
C('MALTE', U('MLT'), 'GBR', 'GBR')
C('PT', U('PRT'), 'POR', 'POR')
CATALOGNE = U('ESP', noms=['Barcelona', 'Gerona', 'Lérida', 'Tarragona'])
C('CATALOGNE', CATALOGNE, 'EMP', 'ESP')
C('ES', unary_union([U('ESP', sauf=['Barcelona', 'Gerona', 'Lérida', 'Tarragona', 'Las Palmas', 'Santa Cruz de Tenerife']), U('AND')]), 'ESPj', 'ESP')

# --- France
verifie_noms('FRA', ['Savoie', 'Haute-Savoie', 'Alpes-Maritimes', 'Bas-Rhin', 'Haute-Rhin', 'Moselle', 'Meurthe-et-Moselle', 'Meuse', 'Vosges'])
AM = U('FRA', noms=['Alpes-Maritimes'])
C('NICE', unary_union([AM.intersection(M['NICE']), U('MCO')]), 'EMP', 'SAR')
C('SAVOIE', U('FRA', noms=['Savoie', 'Haute-Savoie']), 'EMP', 'SAR', dossier='france', grp='savoie')
C('ALSACE', U('FRA', noms=['Bas-Rhin', 'Haute-Rhin']), 'EMP', 'FRA', dossier='france', grp='alsace')
C('LORRAINE', U('FRA', noms=['Moselle', 'Meurthe-et-Moselle', 'Meuse', 'Vosges']), 'EMP', 'FRA', dossier='france', grp='lorraine')
FR_RESTE = U('FRA', sauf=['Savoie', 'Haute-Savoie', 'Alpes-Maritimes', 'Bas-Rhin', 'Haute-Rhin', 'Moselle', 'Meurthe-et-Moselle', 'Meuse', 'Vosges'])
C('FR', unary_union([FR_RESTE, AM.difference(M['NICE'])]), 'EMP', 'FRA')

# --- Benelux
BEL = U('BEL', sauf=['Luxembourg'])
C('EUPEN', BEL.intersection(M['EUPEN']), 'EMP', 'PRU')
C('BE', BEL.difference(M['EUPEN']), 'EMP', 'NLD', dossier='belgique', grp='belgique')
C('BE_LUX', U('BEL', noms=['Luxembourg']), 'EMP', 'NLD', dossier='belgique', grp='luxembourg', confed=True)
C('LU', U('LUX'), 'EMP', 'NLD', dossier='belgique', grp='luxembourg', confed=True)
C('NL', U('NLD'), 'EMP', 'NLD')

# --- Suisse
C('GENEVE', U('CHE', noms=['Genève']), 'EMP', 'SUI')
C('VALAIS', U('CHE', noms=['Valais']), 'EMP', 'SUI')
C('JURA', U('CHE', noms=['Jura']), 'EMP', 'SUI')
C('NEUCHATEL', U('CHE', noms=['Neuchâtel']), 'NEU', 'SUI')
C('CH', U('CHE', sauf=['Genève', 'Valais', 'Jura', 'Neuchâtel']), 'SUI', 'SUI')

# --- Italie
verifie_noms('ITA', ['Turin', 'Aoste', 'Bozen', 'Crotene', 'Oristrano', 'Barletta-Andria Trani'])
PIEM = U('ITA', noms=['Turin', 'Cuneo', 'Asti', 'Alessandria', 'Vercelli', 'Biella', 'Aoste'])
C('PIEMONT', PIEM, 'EMP', 'SAR')
C('NOVARE', U('ITA', noms=['Novara', 'Verbano-Cusio-Ossola']), 'ITA', 'SAR')
PAVIA = U('ITA', noms=['Pavia'])
C('PAVESE', PAVIA.intersection(M['PAVESE']), 'ITA', 'AUT', dossier='italie', grp='lombardie')
C('OLTREPO', PAVIA.intersection(M['OLTREPO']), 'EMP', 'SAR')
C('LOMELLINE', PAVIA.difference(M['PAVESE']).difference(M['OLTREPO']), 'ITA', 'SAR')
C('LOMBARDIE', U('ITA', noms=['Milano', 'Monza e Brianza', 'Varese', 'Como', 'Lecco', 'Sondrio', 'Bergamo', 'Brescia', 'Cremona', 'Lodi', 'Mantova']), 'ITA', 'AUT', dossier='italie', grp='lombardie')
C('VENETIE', U('ITA', noms=['Venezia', 'Padova', 'Vicenza', 'Verona', 'Treviso', 'Rovigo', 'Belluno', 'Udine', 'Pordenone']), 'ITA', 'AUT', dossier='italie', grp='venetie')
C('GORIZIA', U('ITA', noms=['Gorizia', 'Trieste']), 'EMP', 'AUT', confed=True)
C('TRENTIN', U('ITA', noms=['Trento', 'Bozen']), 'ITA', 'AUT', confed=True)
C('LIGURIE', U('ITA', noms=['Genova', 'Savona', 'Imperia', 'La Spezia']), 'EMP', 'SAR', dossier='italie', grp='genes')
C('SARDAIGNE', U('ITA', regs=['Sardegna']), 'SARi', 'SAR')
C('PARME', U('ITA', noms=['Piacenza', 'Parma']), 'EMP', 'PAR')
C('MODENE', U('ITA', noms=['Reggio Emilia', 'Modena']), 'ITA', 'MOD')
C('MASSA', U('ITA', noms=['Massa-Carrara']), 'LUCP', 'MOD')
C('LUCQUES', U('ITA', noms=['Lucca']), 'LUCP', 'LUC')
C('TOSCANE', U('ITA', noms=['Pistoia', 'Prato', 'Firenze', 'Livorno', 'Pisa', 'Arezzo', 'Siena', 'Grosseto']), 'EMP', 'TOS')
C('LEGATIONS', unary_union([U('ITA', noms=['Bologna', 'Ferrara', 'Ravenna', 'Forlì-Cesena', 'Rimini']), U('SMR')]), 'ITA', 'PAP')
C('MARCHES', U('ITA', regs=['Marche']), 'ITA', 'PAP')
C('OMBRIE', U('ITA', regs=['Umbria']), 'EMP', 'PAP')
LAZIO = unary_union([U('ITA', regs=['Lazio']), U('VAT')])
SUD_LAZ = LAZIO.intersection(M['LAZIO_NAP'])
C('LATIUM', LAZIO.difference(M['LAZIO_NAP']), 'EMP', 'PAP')
C('NAPLES', unary_union([U('ITA', regs=['Abruzzo', 'Molise', 'Campania', 'Apulia', 'Basilicata', 'Calabria']), SUD_LAZ]), 'NAP', 'SIC', dossier='naples', grp='naples')
C('SICILE', U('ITA', regs=['Sicily']), 'SICi', 'SIC')

# --- Autriche, Bohême, Hongrie
OOE = U('AUT', noms=['Oberösterreich'])
C('INNVIERTEL', OOE.intersection(M['INNVIERTEL']), 'CDR_BAV', 'AUT', confed=True)
C('HAUTE_AUTRICHE', OOE.difference(M['INNVIERTEL']), 'AUT', 'AUT', confed=True)
C('SALZBOURG', U('AUT', noms=['Salzburg']), 'CDR_BAV', 'AUT', confed=True)
C('TYROL', U('AUT', noms=['Tirol', 'Vorarlberg']), 'CDR_BAV', 'AUT', confed=True)
KAR = U('AUT', noms=['Kärnten'])
C('CARINTHIE_O', KAR.intersection(M['CARINTHIE_O']), 'EMP', 'AUT', confed=True)
C('AUTRICHE', unary_union([U('AUT', noms=['Niederösterreich', 'Wien', 'Steiermark', 'Burgenland']), KAR.difference(M['CARINTHIE_O'])]), 'AUT', 'AUT', confed=True)
C('BOHEME', U('CZE'), 'AUT', 'AUT', confed=True)
C('HONGRIE', unary_union([U('HUN'), U('SVK')]), 'AUT', 'AUT')
C('CARNIOLE', U('SVN', regs=['Gorenjska', 'Osrednjeslovenska', 'Notranjsko-kraška', 'Jugovzhodna Slovenija', 'Goriška', 'Obalno-kraška', 'Zasavska']), 'EMP', 'AUT', confed=True)
C('STYRIE_SUD', U('SVN', regs=['Podravska', 'Savinjska', 'Koroška', 'Pomurska', 'Spodnjeposavska']), 'AUT', 'AUT', confed=True)
C('ISTRIE', U('HRV', noms=['Istarska']), 'EMP', 'AUT', confed=True)
ZS = U('HRV', noms=['Zagrebacka', 'Sisacko-Moslavacka'])
C('CROATIE_ILL', unary_union([U('HRV', noms=['Primorsko-Goranska', 'Licko-Senjska', 'Karlovacka', 'Zadarska', 'Šibensko-Kninska', 'Splitsko-Dalmatinska', 'Dubrovacko-Neretvanska']), ZS.intersection(M['SUD_SAVE_HR'])]), 'EMP', 'AUT')
C('CROATIE', unary_union([U('HRV', sauf=['Istarska', 'Primorsko-Goranska', 'Licko-Senjska', 'Karlovacka', 'Zadarska', 'Šibensko-Kninska', 'Splitsko-Dalmatinska', 'Dubrovacko-Neretvanska', 'Zagrebacka', 'Sisacko-Moslavacka']), ZS.difference(M['SUD_SAVE_HR'])]), 'AUT', 'AUT')
BOKA = U('MNE', noms=['Kotor', 'Tivat', 'Herceg Novi', 'Budva'])
C('BOUCHES_KOTOR', BOKA, 'EMP', 'AUT')
SRB = U('SRB')
C('VOIVODINE', SRB.intersection(M['VOIVODINE']), 'AUT', 'AUT')
ROU_AUT = ['Alba', 'Arad', 'Bihor', 'Bistrita-Nasaud', 'Brasov', 'Caras-Severin', 'Cluj', 'Covasna', 'Harghita', 'Hunedoara', 'Maramures', 'Mures', 'Salaj', 'Satu Mare', 'Sibiu', 'Timis', 'Suceava']
verifie_noms('ROU', ROU_AUT)
C('TRANSYLVANIE', U('ROU', noms=ROU_AUT), 'AUT', 'AUT')
C('GALICIE_EST', U('UKR', noms=["L'viv", "Ivano-Frankivs'k", 'Transcarpathia']), 'AUT', 'AUT')
TER = U('UKR', noms=["Ternopil'"])
C('TARNOPOL', TER.difference(M['TERNOPIL_N']), 'RUS', 'AUT', dossier='pologne', grp='tarnopol')
CHE = U('UKR', noms=['Chernivtsi'])
C('BUCOVINE', CHE.difference(M['BESSARABIE_N']), 'AUT', 'AUT')

# --- Empire ottoman
C('MOLDAVIE_VALACHIE', U('ROU', sauf=ROU_AUT), 'OTT', 'OTT')
C('BALKANS', unary_union([SRB.difference(M['VOIVODINE']), U('BIH'), U('MNE', sauf=['Kotor', 'Tivat', 'Herceg Novi', 'Budva']), U('ALB'), U('MKD'), U('KOS'), U('BGR'),
                          U('GRC', sauf=['Ionioi Nisoi']), U('TUR')] + [U(x) for x in ('CYP', 'CYN', 'ESB', 'WSB') if any(u['a3'] == x for u in A1)]), 'OTT', 'OTT')
ION = U('GRC', noms=['Ionioi Nisoi'])
C('CORFOU', ION.intersection(M['CORFOU']), 'EMP', 'GBR')
C('ILES_IONIENNES', ION.difference(M['CORFOU']), 'GBR', 'GBR')

# --- Russie et pays baltes
RUS_ALL = U('RUS')
KAL = U('RUS', noms=['Kaliningrad'])
C('KALININGRAD', KAL, 'PRU', 'PRU')
C('RUSSIE', unary_union([RUS_ALL.difference(KAL), U('BLR'), U('LVA'), U('EST'), U('MDA'),
                         U('UKR', sauf=["L'viv", "Ivano-Frankivs'k", 'Transcarpathia', "Ternopil'", 'Chernivtsi']),
                         TER.intersection(M['TERNOPIL_N']), CHE.intersection(M['BESSARABIE_N'])]), 'RUS', 'RUS')
C('FINLANDE', unary_union([U('FIN'), U('ALD')]), 'RUS', 'RUS')
LTU = U('LTU')
MEM = LTU.intersection(M['MEMEL'])
C('MEMEL', MEM, 'PRU', 'PRU')
C('UZNEMUNE', LTU.difference(MEM).intersection(M['UZNEMUNE']), 'VAR', 'POL', dossier='pologne', grp='nord_ouest')
C('LITUANIE', LTU.difference(MEM).difference(M['UZNEMUNE']), 'RUS', 'RUS')

# --- Pologne actuelle
verifie_noms('POL', ['Greater Poland', 'Kuyavian-Pomeranian', 'Lesser Poland', 'Lower Silesian', 'Lublin', 'Lubusz', 'Masovian', 'Opole', 'Podlachian', 'Pomeranian', 'Silesian', 'Subcarpathian', 'Warmian-Masurian', 'West Pomeranian', 'Łódź', 'Świętokrzyskie'])
PODL = U('POL', noms=['Podlachian'])
C('BIALYSTOK', PODL.intersection(M['BIALYSTOK']), 'RUS', 'RUS')
C('PODLACHIE', PODL.difference(M['BIALYSTOK']), 'VAR', 'POL', dossier='pologne', grp='nord_ouest')
C('MAZOVIE', U('POL', noms=['Masovian']), 'VAR', 'POL', dossier='pologne', grp='nord_ouest')
C('LODZ', U('POL', noms=['Łódź']), 'VAR', 'POL', dossier='pologne', grp='nord_ouest')
C('SANDOMIR', U('POL', noms=['Świętokrzyskie']), 'VAR', 'POL', dossier='pologne', grp='sud_est')
C('LUBLIN', U('POL', noms=['Lublin']), 'VAR', 'POL', dossier='pologne', grp='sud_est')
LP = U('POL', noms=['Lesser Poland'])
SIL = U('POL', noms=['Silesian'])
KRA_G = unary_union([LP, SIL]).intersection(M['CRACOVIE'])
C('CRACOVIE', KRA_G, 'VAR', 'KRA', dossier='pologne', grp='cracovie')
C('PETITE_POLOGNE_N', LP.intersection(M['NORD_VISTULE']).difference(M['CRACOVIE']), 'VAR', 'POL', dossier='pologne', grp='sud_est')
C('GALICIE_O', LP.difference(M['NORD_VISTULE']).difference(M['CRACOVIE']), 'AUT', 'AUT')
C('SUBCARPATES', U('POL', noms=['Subcarpathian']), 'AUT', 'AUT')
SIL_R = SIL.difference(M['CRACOVIE'])
C('SILESIE_AUT', SIL_R.intersection(M['SILESIE_AUT']), 'AUT', 'AUT', confed=True)
SIL_R2 = SIL_R.difference(M['SILESIE_AUT'])
C('SILESIE_CONGRES', SIL_R2.intersection(M['CONGRES_EST']), 'VAR', 'POL', dossier='pologne', grp='nord_ouest')
C('HAUTE_SILESIE', unary_union([SIL_R2.difference(M['CONGRES_EST']), U('POL', noms=['Opole'])]), 'PRU', 'PRU', confed=True)
LS = unary_union([U('POL', noms=['Lower Silesian', 'Lubusz', 'West Pomeranian'])])
C('LUSACE_EST', LS.intersection(M['LUSACE_EST']), 'CDR_SAX', 'PRU', dossier='saxe', grp='nord', confed=True)
C('BASSE_SILESIE', LS.difference(M['LUSACE_EST']), 'PRU', 'PRU', confed=True)
POM = U('POL', noms=['Pomeranian'])
C('DANTZIG', POM.intersection(M['DANTZIG']), 'DAN', 'PRU')
C('PRUSSE_OCC', unary_union([POM.difference(M['DANTZIG']), U('POL', noms=['Warmian-Masurian'])]), 'PRU', 'PRU')
KP = U('POL', noms=['Kuyavian-Pomeranian'])
KPN = KP.intersection(M['KP_NORD'])
C('KUJAVIE_NORD', KPN, 'PRU', 'PRU')
KPS = KP.difference(M['KP_NORD'])
C('KUJAVIE_EST', KPS.intersection(M['CONGRES_EST']), 'VAR', 'POL', dossier='pologne', grp='nord_ouest')
C('BROMBERG_THORN', KPS.difference(M['CONGRES_EST']), 'VAR', 'PRU', dossier='pologne', grp='posnanie')
WP = U('POL', noms=['Greater Poland'])
WPN = WP.intersection(M['WP_NORD'])
C('NETZE_NORD', WPN, 'PRU', 'PRU')
WPS = WP.difference(M['WP_NORD'])
C('KALISZ', WPS.intersection(M['CONGRES_EST']), 'VAR', 'POL', dossier='pologne', grp='nord_ouest')
C('POSNANIE', WPS.difference(M['CONGRES_EST']), 'VAR', 'PRU', dossier='pologne', grp='posnanie')

# --- Allemagne actuelle
verifie_noms('DEU', ['Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg', 'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen', 'Rheinland-Pfalz', 'Saarland', 'Sachsen-Anhalt', 'Sachsen', 'Schleswig-Holstein', 'Thüringen'])
SH = U('DEU', noms=['Schleswig-Holstein'])
C('LUBECK', SH.intersection(M['LUBECK']), 'EMP', 'GER', confed=True)
SH2 = SH.difference(M['LUBECK'])
C('LAUENBOURG', SH2.intersection(M['LAUENBOURG']), 'EMP', 'DEN', confed=True)
SH3 = SH2.difference(M['LAUENBOURG'])
C('SCHLESWIG', SH3.intersection(M['SCHLESWIG']), 'DNK', 'DEN')
C('HOLSTEIN', SH3.difference(M['SCHLESWIG']), 'DNK', 'DEN', confed=True)
C('HAMBOURG', U('DEU', noms=['Hamburg']), 'EMP', 'GER', confed=True)
C('BREME', U('DEU', noms=['Bremen']), 'EMP', 'GER', confed=True)
NS = U('DEU', noms=['Niedersachsen'])
OLD = NS.intersection(M['OLDENBOURG'])
C('OLDENBOURG', OLD, 'EMP', 'GER', confed=True)
NS2 = NS.difference(M['OLDENBOURG'])
BRU = NS2.intersection(M['BRUNSWICK'])
C('BRUNSWICK', BRU, 'CDR', 'GER', confed=True)
NS3 = NS2.difference(M['BRUNSWICK'])
C('SCHAUMBOURG', NS3.intersection(M['SCHAUMBOURG']), 'CDR', 'GER', confed=True)
NS4 = NS3.difference(M['SCHAUMBOURG'])
C('HANOVRE_NO', NS4.intersection(M['EMPIRE_NO']), 'EMP', 'HAN', confed=True)
C('HANOVRE_SE', NS4.difference(M['EMPIRE_NO']), 'CDR', 'HAN', confed=True)
NRW = U('DEU', noms=['Nordrhein-Westfalen'])
C('RHENANIE_NORD', NRW.intersection(M['RIVE_GAUCHE']), 'EMP', 'PRU', dossier='rhin', grp='rive_gauche', confed=True)
NRWR = NRW.difference(M['RIVE_GAUCHE'])
C('LIPPE', NRWR.intersection(M['LIPPE']), 'CDR', 'GER', confed=True)
NRWR2 = NRWR.difference(M['LIPPE'])
C('MUNSTER', NRWR2.intersection(M['EMPIRE_NO']), 'EMP', 'PRU', dossier='rhin', grp='rive_droite', confed=True)
C('WESTPHALIE', NRWR2.difference(M['EMPIRE_NO']), 'CDR', 'PRU', dossier='rhin', grp='rive_droite', confed=True)
RLP = U('DEU', noms=['Rheinland-Pfalz'])
SAAR = U('DEU', noms=['Saarland'])
RG = unary_union([RLP.intersection(M['RIVE_GAUCHE']), SAAR])
PAL = RG.intersection(M['PALATINAT'])
C('PALATINAT', PAL, 'EMP', 'BAV', dossier='rhin', grp='palatinat', confed=True)
RG2 = RG.difference(M['PALATINAT'])
C('HESSE_RHENANE', RG2.intersection(M['HESSE_RHENANE']), 'EMP', 'GER', dossier='rhin', grp='hesse_rhenane', confed=True)
RG3 = RG2.difference(M['HESSE_RHENANE'])
SAAR_R = RG3.intersection(SAAR.buffer(0.001))
C('SARRE', SAAR_R, 'EMP', 'PRU', dossier='france', grp='sarre', confed=True)
C('RHENANIE_SUD', RG3.difference(SAAR.buffer(0.001)), 'EMP', 'PRU', dossier='rhin', grp='rive_gauche', confed=True)
RLPR = RLP.difference(M['RIVE_GAUCHE'])
C('NEUWIED', RLPR.intersection(M['RLP_NORD_PRU']), 'CDR', 'PRU', dossier='rhin', grp='rive_droite', confed=True)
C('NASSAU', unary_union([RLPR.difference(M['RLP_NORD_PRU']), U('DEU', noms=['Hessen'])]), 'CDR', 'GER', confed=True)
BW = U('DEU', noms=['Baden-Württemberg'])
C('BADE', BW.intersection(M['BADE']), 'CDR_BAD', 'BAD', confed=True)
BW2 = BW.difference(M['BADE'])
C('HOHENZOLLERN', BW2.intersection(M['HOHENZOLLERN']), 'CDR', 'GER', confed=True)
C('WURTEMBERG', BW2.difference(M['HOHENZOLLERN']), 'CDR_WUR', 'WUR', confed=True)
BY = U('DEU', noms=['Bayern'])
UF = BY.intersection(M['BASSE_FRANCONIE'])
C('BASSE_FRANCONIE', UF, 'CDR', 'BAV', confed=True)
BY2 = BY.difference(M['BASSE_FRANCONIE'])
C('COBOURG', BY2.intersection(M['COBOURG']), 'CDR', 'GER', confed=True)
C('BAVIERE', BY2.difference(M['COBOURG']), 'CDR_BAV', 'BAV', confed=True)
TH = U('DEU', noms=['Thüringen'])
C('THURINGE_PRU', TH.intersection(M['THURINGE_PRU']), 'CDR', 'PRU', confed=True)
C('THURINGE', TH.difference(M['THURINGE_PRU']), 'CDR', 'GER', confed=True)
SN = U('DEU', noms=['Sachsen'])
C('SAXE_NORD_SN', SN.intersection(M['SAXE_PRU']), 'CDR_SAX', 'PRU', dossier='saxe', grp='nord', confed=True)
C('SAXE', SN.difference(M['SAXE_PRU']), 'CDR_SAX', 'SAX', dossier='saxe', grp='sud', confed=True)
ST = U('DEU', noms=['Sachsen-Anhalt'])
AN = ST.intersection(M['ANHALT'])
C('ANHALT', AN, 'CDR', 'GER', confed=True)
ST2 = ST.difference(M['ANHALT'])
C('SAXE_NORD_ST', ST2.intersection(M['SAXE_ST']), 'CDR_SAX', 'PRU', dossier='saxe', grp='nord', confed=True)
ST3 = ST2.difference(M['SAXE_ST'])
C('JERICHOW', ST3.intersection(M['ELBE_EST']), 'PRU', 'PRU', confed=True)
C('MAGDEBOURG', ST3.difference(M['ELBE_EST']), 'CDR', 'PRU', confed=True)
BB = U('DEU', noms=['Brandenburg'])
C('BASSE_LUSACE', BB.intersection(M['LUSACE_BB']), 'CDR_SAX', 'PRU', dossier='saxe', grp='nord', confed=True)
C('BRANDEBOURG', unary_union([BB.difference(M['LUSACE_BB']), U('DEU', noms=['Berlin'])]), 'PRU', 'PRU', confed=True)
MV = U('DEU', noms=['Mecklenburg-Vorpommern'])
C('POMERANIE_SUEDOISE', MV.intersection(M['POMERANIE_SUED']), 'SWE', 'PRU', confed=True)
MV2 = MV.difference(M['POMERANIE_SUED'])
C('POMERANIE_OCC', MV2.intersection(M['POMERANIE_PRU']), 'PRU', 'PRU', confed=True)
C('MECKLEMBOURG', MV2.difference(M['POMERANIE_PRU']), 'CDR', 'GER', confed=True)
C('LIECHTENSTEIN', U('LIE'), 'CDR', 'GER', confed=True)

# --- Scandinavie
C('DANEMARK', U('DNK'), 'DNK', 'DEN')
C('NORVEGE', U('NOR'), 'DNK', 'SWN')
C('SUEDE', U('SWE'), 'SWE', 'SWN')

# --- Hors d'Europe (fond neutre)
HORS = [U(x) for x in ('MAR', 'DZA', 'TUN', 'SYR', 'LBN') if any(u['a3'] == x for u in A1)]
C('HORS', unary_union(HORS), 'HORS', 'HORS')

# ---------------------------------------------------------------- contrôles
tous = unary_union([c['geom'] for c in CELLS])
terre = unary_union([u['geom'] for u in A1 if u['a3'] not in ('FRO', 'ESP') or True])
reste = terre.difference(tous)
somme = sum(c['geom'].area for c in CELLS)
print('cellules :', len(CELLS), ' recouvrement (somme - union) :', round(somme - tous.area, 4), ' terre non attribuée :', round(reste.area, 4))
if reste.area > 0.01:
    parts = [reste] if reste.geom_type == 'Polygon' else list(reste.geoms)
    for p in sorted(parts, key=lambda p: -p.area)[:12]:
        if p.area > 0.002:
            rp = p.representative_point()
            print('   trou', round(p.area, 3), round(rp.x, 2), round(rp.y, 2))
# chevauchements deux à deux
from shapely.strtree import STRtree
arbre = STRtree([c['geom'] for c in CELLS])
for i, c in enumerate(CELLS):
    for j in arbre.query(c['geom']):
        if j <= i:
            continue
        inter = c['geom'].intersection(CELLS[j]['geom']).area
        if inter > 0.0005:
            print('   chevauchement', c['id'], CELLS[j]['id'], round(inter, 4))

import pickle
pickle.dump(CELLS, open('cells.pkl', 'wb'))
