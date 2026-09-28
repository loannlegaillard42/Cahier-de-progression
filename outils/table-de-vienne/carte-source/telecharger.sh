#!/bin/sh
# Télécharge les fonds Natural Earth (domaine public) utilisés pour construire la carte.
B=https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson
for f in ne_10m_admin_1_states_provinces ne_50m_lakes ne_10m_rivers_lake_centerlines ne_10m_rivers_europe; do
  curl -sS -o $f.geojson $B/$f.geojson
done
