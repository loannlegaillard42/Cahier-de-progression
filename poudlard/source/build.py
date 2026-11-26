# Assemble le jeu : poudlard/index.html (document complet) + fragment pour l'Artifact.
import json, sys, os, html
D = os.path.dirname(os.path.abspath(__file__))
lire = lambda f: open(os.path.join(D, f), encoding="utf-8").read()
repo_out, art_out = sys.argv[1], sys.argv[2]
qf = os.path.join(D, "quetes.json")
if os.path.exists(qf):
    quetes = json.load(open(qf, encoding="utf-8"))
else:  # contenu provisoire pour tester le moteur
    quetes = {}
    for n in range(1, 17):
        quetes[str(n)] = {"num": n, "titre": f"Titre de l'étape {n}", "lieu": "", "heros": ["capucine","leo","silas","iris"][(n-1)//4],
            "recit": "Chers héros,\nMoka vous apporte une lettre de test. " * 3, "message_ombre": "Vous courez, vous cherchez,\nmais c'est moi qui vais gagner !",
            "epreuve": {"type": ["qcm","association","ordre","code","enigmes","defi_equipe"][n % 6], "titre": "Épreuve de test", "consigne": "Consigne de test pour l'épreuve.", "deroulement": "Chaque maison répond sur son ardoise.", "duree": 25,
                "questions": [{"q": "Quelle est la couleur du Vif d'or ?", "choix": ["Rouge", "Doré", "Vert"], "reponse": "Doré", "explication": "Il est doré."}],
                "paires": [{"gauche": "Mandragore", "droite": "Cri assourdissant"}, {"gauche": "Filet du Diable", "droite": "Craint la lumière"}, {"gauche": "Branchiflore", "droite": "Respirer sous l'eau"}],
                "ordre": ["Mettre les cache-oreilles", "Saisir la plante", "La tirer du pot", "La rempoter"], "code": {"message": "OXPRV", "cle": "Décale chaque lettre de 3 rangs en arrière.", "reponse": "LUMOS"}, "indice": "Un indice de test.", "reussite": "4 sur 5 = réussite."},
            "defi_maison": {"titre": "Défi maison de test", "consigne": "Trouvez le mot de passe.", "contenu": "Énigme : je suis le sort de lumière.", "mot_de_passe": "LUMOS" if n % 2 else ""}, "note_prof": "Note de test."}
import re
def insec(o):
    if isinstance(o, dict): return {k: insec(v) for k, v in o.items()}
    if isinstance(o, list): return [insec(v) for v in o]
    if isinstance(o, str): return re.sub(r" ([!?:;»])", "\u202f\\1", o).replace("« ", "«\u202f")
    return o
quetes = insec(quetes)
QUETES = "const QUETES = " + json.dumps(quetes, ensure_ascii=False) + ";"
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&family=Lexend:wght@400;700&family=IBM+Plex+Mono:wght@500&display=swap">'
LIBS = "\n".join(['<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>'] + [f'<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/{f}"></script>' for f in ["controls/OrbitControls.js", "objects/Sky.js", "objects/Water.js"]])
TITLE = "Les Reliques des Fondateurs"
# le moteur 3D est découpé en fichiers dans scene/, assemblés dans l'ordre de leur nom
scene = "".join(lire(os.path.join("scene", f)) for f in sorted(os.listdir(os.path.join(D, "scene"))) if f.endswith(".js"))
script = "\n".join([QUETES, lire("data.js"), scene, lire("ui.js")])
corps = lire("body.html") + "\n" + LIBS + "\n<script>\n" + script + "\n</script>\n"
frag = f"<title>{TITLE}</title>\n{FONTS}\n<style>\n{lire('style.css')}\n</style>\n{corps}"
full = f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>{TITLE}</title>
<meta name="description" content="Jeu de quêtes Harry Potter pour une classe de 6e : carte 3D du domaine de Poudlard, 4 héros, 16 étapes." />
<meta name="theme-color" content="#0E1124" />
{FONTS}
<style>
{lire('style.css')}
</style>
</head>
<body>
{corps}
</body>
</html>
'''
open(repo_out, "w", encoding="utf-8").write(full)
open(art_out, "w", encoding="utf-8").write(frag)

# ---------- Versions autonomes : tout est dans le fichier (moteur 3D, polices), fonctionnent sans Internet ----------
import base64, shutil
SORTIE = os.path.dirname(os.path.abspath(repo_out))
LIBS_LOCALES = "\n".join(f"<script>\n{lire(os.path.join('vendor', f))}\n</script>" for f in ["three.min.js", "OrbitControls.js", "Sky.js", "Water.js"])
def polices_integrees():
    css = lire(os.path.join("polices", "polices.css"))
    for f in os.listdir(os.path.join(D, "polices")):
        if f.endswith(".woff2"):
            css = css.replace(f"url(polices/{f})", "url(data:font/woff2;base64," + base64.b64encode(open(os.path.join(D, "polices", f), "rb").read()).decode() + ")")
    return "<style>\n" + css + "</style>"
def autonome(tete_en_plus="", script_en_plus=""):
    corps_local = lire("body.html") + "\n" + LIBS_LOCALES + "\n<script>\n" + script_en_plus + script + "\n</script>\n"
    return f'''<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>{TITLE}</title>
<meta name="description" content="Jeu de quêtes Harry Potter pour une classe de 6e : carte 3D du domaine de Poudlard, 4 héros, 16 étapes." />
<meta name="theme-color" content="#0E1124" />
{tete_en_plus}
{polices_integrees()}
<style>
{lire('style.css')}
</style>
</head>
<body>
{corps_local}
</body>
</html>
'''
open(os.path.join(SORTIE, "hors-ligne.html"), "w", encoding="utf-8").write(autonome())
# Application installable (à servir en https, par exemple GitHub Pages)
APP = os.path.join(SORTIE, "app"); os.makedirs(os.path.join(APP, "icones"), exist_ok=True)
for f in os.listdir(os.path.join(D, "icones")): shutil.copy(os.path.join(D, "icones", f), os.path.join(APP, "icones", f))
version = __import__("hashlib").sha1((script + lire("style.css") + lire("body.html")).encode()).hexdigest()[:10]
tete = '<link rel="manifest" href="manifest.webmanifest" />\n<link rel="icon" href="icones/icone-192.png" />\n<link rel="apple-touch-icon" href="icones/icone-apple-180.png" />\n<meta name="apple-mobile-web-app-capable" content="yes" />'
open(os.path.join(APP, "index.html"), "w", encoding="utf-8").write(autonome(tete, "window.APPLI = true;\n"))
json.dump({"name": TITLE, "short_name": "Reliques", "description": "Jeu de quêtes Harry Potter pour la classe : carte 3D du domaine de Poudlard.", "lang": "fr", "start_url": "./", "scope": "./", "display": "standalone", "orientation": "landscape", "background_color": "#0E1124", "theme_color": "#0E1124",
  "icons": [{"src": "icones/icone-192.png", "sizes": "192x192", "type": "image/png"}, {"src": "icones/icone-512.png", "sizes": "512x512", "type": "image/png"}, {"src": "icones/icone-masque-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}]},
  open(os.path.join(APP, "manifest.webmanifest"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open(os.path.join(APP, "sw.js"), "w", encoding="utf-8").write(f'''/* Garde le jeu dans l'ordinateur : il s'ouvre même sans Internet, et se met à jour quand une nouvelle version est en ligne. */
const CACHE = "reliques-{version}";
const FICHIERS = ["./", "index.html", "manifest.webmanifest", "icones/icone-192.png", "icones/icone-512.png", "icones/icone-masque-512.png", "icones/icone-apple-180.png"];
self.addEventListener("install", (e) => {{ e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FICHIERS))); self.skipWaiting(); }});
self.addEventListener("activate", (e) => {{ e.waitUntil(caches.keys().then((l) => Promise.all(l.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())); }});
self.addEventListener("fetch", (e) => {{
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  // réseau d'abord (pour recevoir les mises à jour), sinon la copie gardée
  e.respondWith(fetch(e.request).then((r) => {{ if (r.ok) {{ const c = r.clone(); caches.open(CACHE).then((k) => k.put(e.request, c)); }} return r; }}).catch(() => caches.match(e.request, {{ ignoreSearch: true }}).then((r) => r || caches.match("index.html"))));
}});
''')
print("autonomes ok", os.path.getsize(os.path.join(SORTIE, "hors-ligne.html")), "version", version)
print("ok", len(full), "quetes:", "réelles" if os.path.exists(qf) else "provisoires")
