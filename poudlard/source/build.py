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
QUETES = "const QUETES = " + json.dumps(quetes, ensure_ascii=False) + ";"
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IM+Fell+English:ital@0;1&family=IM+Fell+English+SC&family=Lexend:wght@400;700&family=IBM+Plex+Mono:wght@500&display=swap">'
LIBS = '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>\n<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>'
TITLE = "Les Reliques des Fondateurs"
script = "\n".join([QUETES, lire("data.js"), lire("scene.js"), lire("ui.js")])
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
print("ok", len(full), "quetes:", "réelles" if os.path.exists(qf) else "provisoires")
