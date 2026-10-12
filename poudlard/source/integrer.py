# Intègre le résultat du workflow (chapitres vérifiés + patches de cohérence) dans quetes.json
# et contrôle mécaniquement le contenu.
import json, re, sys, unicodedata, os

src = json.load(open(sys.argv[1], encoding="utf-8"))
D = os.path.dirname(os.path.abspath(__file__))
etapes = {}
for v in src["chapitres"]:
    for e in v["chapitre"]["etapes"]:
        etapes[int(e["num"])] = e

def poser(obj, chemin, valeur):
    parts = re.findall(r"[^.\[\]]+|\[\d+\]", chemin)
    cur = obj
    for i, p in enumerate(parts):
        dernier = i == len(parts) - 1
        cle = int(p[1:-1]) if p.startswith("[") else p
        if dernier:
            ancien = cur[cle] if (isinstance(cur, list) and cle < len(cur)) or (isinstance(cur, dict) and cle in cur) else None
            if isinstance(ancien, int) and not isinstance(ancien, bool):
                valeur = int(re.sub(r"\D", "", valeur) or ancien)
            if isinstance(cur, list) and cle == len(cur):
                cur.append(valeur)
            else:
                cur[cle] = valeur
        else:
            cur = cur[cle]

appliques, refuses = [], []
for p in (src.get("critique") or {}).get("patches", []):
    n = int(p["num"])
    if n not in etapes:
        refuses.append((p, "étape inconnue")); continue
    try:
        poser(etapes[n], p["champ"], p["nouvelle_valeur"]); appliques.append(p)
    except Exception as ex:
        refuses.append((p, repr(ex)))

def sans_accent(s):
    return unicodedata.normalize("NFD", s).encode("ascii", "ignore").decode()
def norm(s):
    return re.sub(r"[^A-Z0-9]", "", sans_accent(str(s)).upper())

alertes = []
for n in range(1, 17):
    e = etapes.get(n)
    if not e:
        alertes.append(f"étape {n} manquante"); continue
    E = e["epreuve"]
    for i, q in enumerate(E.get("questions", [])):
        if q.get("choix"):
            if not any(norm(c) == norm(q["reponse"]) for c in q["choix"]):
                alertes.append(f"étape {n} question {i+1} : réponse absente des choix → {q['reponse']!r}")
    mdp = e["defi_maison"].get("mot_de_passe", "")
    if mdp and (mdp != mdp.upper() or norm(mdp) != mdp or " " in mdp):
        alertes.append(f"étape {n} : mot de passe mal formé {mdp!r}")
        e["defi_maison"]["mot_de_passe"] = norm(mdp)
    if not E.get("questions") and not E.get("paires") and not E.get("ordre") and not (E.get("code") or {}).get("message"):
        if E["type"] != "defi_equipe":
            alertes.append(f"étape {n} : épreuve sans contenu jouable ({E['type']})")
    for champ in ("recit", "message_ombre"):
        if not e.get(champ):
            alertes.append(f"étape {n} : {champ} vide")

json.dump({str(k): etapes[k] for k in sorted(etapes)}, open(os.path.join(D, "quetes.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"{len(etapes)} étapes · patches appliqués {len(appliques)} · refusés {len(refuses)}")
for p, why in refuses:
    print("  refusé :", p["num"], p["champ"], why)
print("Alertes :" if alertes else "Aucune alerte.")
for a in alertes:
    print("  -", a)
print("Types :", [etapes[n]["epreuve"]["type"] for n in sorted(etapes)])
print("Mots de passe :", [etapes[n]["defi_maison"]["mot_de_passe"] for n in sorted(etapes)])
