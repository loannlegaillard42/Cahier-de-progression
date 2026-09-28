import json, pickle
from pyproj import Transformer
from shapely.geometry import box, mapping, shape, Polygon, MultiPolygon, LineString, MultiLineString, Point
from shapely.ops import transform, unary_union
from shapely.strtree import STRtree

T = Transformer.from_crs('EPSG:4326', '+proj=laea +lat_0=50 +lon_0=12 +units=km', always_xy=True)
proj = lambda g: transform(lambda x, y, z=None: T.transform(x, y), g)
EXT = box(-1900, -1620, 1520, 1300)

CELLS = pickle.load(open('cells.pkl', 'rb'))
for c in CELLS:
    g = proj(c['geom']).buffer(0).intersection(EXT)
    c['g'] = g

def parts(g):
    if g.is_empty: return []
    return [g] if g.geom_type == 'Polygon' else [p for p in getattr(g, 'geoms', []) if p.geom_type == 'Polygon']

# 0) partition propre : on « polygonise » toutes les limites, puis on rend chaque face à sa cellule
from shapely.ops import polygonize
import time
t0 = time.time()
limites = unary_union([c['g'].boundary for c in CELLS if not c['g'].is_empty])
faces = list(polygonize(limites))
arbreC = STRtree([c['g'] for c in CELLS])
attrib = {i: [] for i in range(len(CELLS))}
orphelines = []
for f in faces:
    rp = f.representative_point()
    hits = [j for j in arbreC.query(rp) if CELLS[j]['g'].contains(rp)]
    if hits: attrib[hits[0]].append(f)
    else: orphelines.append(f)
# faces orphelines (interstices entre cellules) : rattachées au voisin qui partage la plus longue limite ; les autres sont en mer
rattachees = 0
for f in orphelines:
    meilleur, lg = None, 0.0
    for j in arbreC.query(f.buffer(0.05)):
        l = f.boundary.intersection(CELLS[j]['g'].buffer(0.05)).length
        if l > lg: meilleur, lg = j, l
    if meilleur is not None and lg > .3 * f.boundary.length:
        attrib[meilleur].append(f); rattachees += 1
for i, c in enumerate(CELLS):
    c['g'] = unary_union(attrib[i]) if attrib[i] else Polygon()
print('faces :', len(faces), ' interstices rattachés :', rattachees, '/', len(orphelines), ' (%.1fs)' % (time.time() - t0))

# 1) petits morceaux : rattachés à la cellule voisine (frontière commune la plus longue) ou supprimés (îlots)
SEUIL_ENCLAVE, SEUIL_ILE = 40.0, 25.0
morceaux = []
for i, c in enumerate(CELLS):
    for p in parts(c['g']):
        morceaux.append([i, p])
arbre = STRtree([m[1] for m in morceaux])
nouveaux = {i: [] for i in range(len(CELLS))}
deplaces = supprimes = 0
for k, (i, p) in enumerate(morceaux):
    if p.area >= SEUIL_ENCLAVE:
        nouveaux[i].append(p); continue
    meilleur, lg = None, 0.0
    for j in arbre.query(p.buffer(0.01)):
        if j == k or morceaux[j][0] == i: continue
        l = p.boundary.intersection(morceaux[j][1].buffer(0.02)).length
        if l > lg: meilleur, lg = morceaux[j][0], l
    if meilleur is not None and lg > 0.05:
        nouveaux[meilleur].append(p); deplaces += 1
    elif p.area >= SEUIL_ILE:
        nouveaux[i].append(p)
    else:
        supprimes += 1
print('morceaux rattachés :', deplaces, ' îlots supprimés :', supprimes)

# 2) lacs intérieurs : on bouche les trous qui ne sont pas des enclaves d'autres cellules (les grands lacs sont redessinés à part)
fusions = {i: unary_union(nouveaux[i]).buffer(0) for i in nouveaux if nouveaux[i]}
arbre2 = STRtree(list(fusions.values())); cles = list(fusions.keys())
bouches = 0
for i, g in fusions.items():
    res = []
    for p in parts(g):
        garder = []
        for ring in p.interiors:
            trou = Polygon(ring)
            couvert = sum(fusions[cles[j]].intersection(trou).area for j in arbre2.query(trou) if cles[j] != i)
            if couvert > .5 * trou.area: garder.append(ring)
            else: bouches += 1
        res.append(Polygon(p.exterior, garder))
    fusions[i] = unary_union(res).buffer(0)
print('lacs bouchés :', bouches)
feats = []
for i, c in enumerate(CELLS):
    g = fusions.get(i)
    if g is None or g.is_empty:
        print('  cellule vide après nettoyage :', c['id']); continue
    props = {k: c[k] for k in ('id', 'o1812', 'o1815', 'dossier', 'grp', 'confed')}
    feats.append({'type': 'Feature', 'id': c['id'], 'properties': props, 'geometry': mapping(g)})
json.dump({'type': 'FeatureCollection', 'features': feats}, open('cells_proj.geojson', 'w'))
print('cellules écrites :', len(feats))

# 2) fleuves et lacs
def charge(fn): return json.load(open(fn))['features']
NOMS_FLEUVES = {'Rhine': 'Rhin', 'Rhein': 'Rhin', 'Danube': 'Danube', 'Donau': 'Danube', 'Elbe': 'Elbe', 'Oder': 'Oder', 'Odra': 'Oder', 'Vistula': 'Vistule', 'Wisla': 'Vistule', 'Wisła': 'Vistule',
                'Po': 'Pô', 'Rhône': 'Rhône', 'Rhone': 'Rhône', 'Seine': 'Seine', 'Loire': 'Loire', 'Garonne': 'Garonne', 'Tagus': 'Tage', 'Tajo': 'Tage', 'Ebro': 'Èbre', 'Douro': 'Douro', 'Duero': 'Douro',
                'Dnieper': 'Dniepr', 'Dnepr': 'Dniepr', 'Dniester': 'Dniestr', 'Neman': 'Niémen', 'Nemunas': 'Niémen', 'Weser': 'Weser', 'Main': 'Main', 'Moselle': 'Moselle', 'Mosel': 'Moselle',
                'Meuse': 'Meuse', 'Maas': 'Meuse', 'Warta': 'Warta', 'Bug': 'Bug', 'Sava': 'Save', 'Drava': 'Drave', 'Tisza': 'Tisza', 'Inn': 'Inn', 'Thames': 'Tamise', 'Guadalquivir': 'Guadalquivir',
                'Dvina': 'Dvina', 'Daugava': 'Dvina', 'Western Dvina': 'Dvina', 'Prut': 'Prut', 'Siret': 'Siret', 'Morava': 'Morava', 'Adige': 'Adige', 'Tiber': 'Tibre', 'Tevere': 'Tibre', 'Neckar': 'Neckar', 'Saale': 'Saale', 'Pripyat': 'Pripiat', 'Narew': 'Narew', 'San': 'San', 'Mures': 'Mureș', 'Olt': 'Olt'}
lignes = {}
for f in charge('ne_10m_rivers_lake_centerlines.geojson') + charge('ne_10m_rivers_europe.geojson'):
    p = f['properties']; n = p.get('name') or p.get('name_en') or ''
    if n not in NOMS_FLEUVES: continue
    g = shape(f['geometry'])
    if not g.intersects(box(-12, 33, 38, 63)): continue
    lignes.setdefault(NOMS_FLEUVES[n], []).append(proj(g))
fleuves = []
for n, gs in lignes.items():
    g = unary_union(gs).intersection(EXT).simplify(1.2)
    ls = [g] if g.geom_type == 'LineString' else [x for x in getattr(g, 'geoms', []) if x.geom_type == 'LineString']
    pts = [[[round(x, 1), round(-y, 1)] for x, y in l.coords] for l in ls if l.length > 15]
    if pts: fleuves.append({'n': n, 'l': pts})
lacs = []
for f in charge('ne_50m_lakes.geojson'):
    g = shape(f['geometry'])
    if not g.intersects(box(-12, 33, 38, 63)): continue
    g = proj(g).buffer(0).intersection(EXT).simplify(0.8)
    for p in parts(g):
        if p.area < 60: continue
        lacs.append([[round(x, 1), round(-y, 1)] for x, y in p.exterior.coords])
json.dump({'fleuves': fleuves, 'lacs': lacs}, open('eaux.json', 'w'))
print('fleuves :', sorted(f['n'] for f in fleuves), ' lacs :', len(lacs))
