#!/bin/sh
# Reproduit l'enveloppe ajoutée à la publication (doctype, charset, viewport) pour tester en local
{ printf '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>body{margin:0}[hidden]{display:none!important}</style></head><body>\n'; cat index.html; printf '\n</body></html>\n'; } > local.html
mkdir -p captures
