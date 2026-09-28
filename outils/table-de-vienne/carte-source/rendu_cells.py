import pickle, sys, random, colorsys
import matplotlib; matplotlib.use('Agg')
import matplotlib.pyplot as plt
from shapely.ops import unary_union
CELLS = pickle.load(open('cells.pkl', 'rb'))
annee = sys.argv[1]; x0, x1, y0, y1 = map(float, sys.argv[2:6]); out = sys.argv[6]
cle = 'o' + annee
own = {}
for c in CELLS: own.setdefault(c[cle], []).append(c['geom'])
random.seed(11)
fig, ax = plt.subplots(figsize=(22, 17), dpi=60)
ax.set_facecolor('#cfe3ea')
for o, gs in own.items():
    g = unary_union(gs)
    h = random.random()
    col = colorsys.hsv_to_rgb(h, .35 if not o.startswith('CDR') else .5, .95)
    if o == 'HORS': col = (.85, .85, .8)
    polys = [g] if g.geom_type == 'Polygon' else list(g.geoms)
    for p in polys:
        x, y = p.exterior.xy
        ax.fill(x, y, facecolor=col, edgecolor='#222', linewidth=1.1)
    if o != 'HORS':
        big = max(polys, key=lambda p: p.area)
        rp = big.representative_point()
        if x0 < rp.x < x1 and y0 < rp.y < y1:
            ax.text(rp.x, rp.y, o, fontsize=11, ha='center', weight='bold')
if annee == '1815':
    conf = unary_union([c['geom'] for c in CELLS if c['confed']])
    polys = [conf] if conf.geom_type == 'Polygon' else list(conf.geoms)
    for p in polys:
        x, y = p.exterior.xy; ax.plot(x, y, color='#c00', lw=2.5, ls='--')
else:
    cdr = unary_union([c['geom'] for c in CELLS if c['o1812'].startswith('CDR')])
    polys = [cdr] if cdr.geom_type == 'Polygon' else list(cdr.geoms)
    for p in polys:
        x, y = p.exterior.xy; ax.plot(x, y, color='#c00', lw=2.5, ls='--')
ax.set_xlim(x0, x1); ax.set_ylim(y0, y1); ax.set_aspect(1.45)
plt.savefig(out, bbox_inches='tight')
