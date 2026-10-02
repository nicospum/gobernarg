#!/usr/bin/env bash
# Fotos diurnas de la Lite ("toque de realismo"): vienen verticales (~400×670)
# con un título escrito arriba. Se recorta un cuadro 4:3 debajo del título,
# centrado en el cartel de cada foto, y se guarda en WebP ≤40 KB. No pasan
# por el aclarado (ya son de día).
# Uso, desde project/:  scripts/recortar-fotos-lite.sh <carpeta con POL-XX.png>
set -euo pipefail
SRC="${1:?Falta la carpeta de las fotos}"
OUT="src/assets/images/a-lite/fotos"
FF="${FFMPEG:-ffmpeg}"
mkdir -p "$OUT"

# archivo origen → nombre de salida y desde qué altura (px) arranca el recorte.
crop() { # POL nombre y
  local in="$SRC/$1.png" out="$OUT/$2.webp" y="$3" q=82
  local w; w=$(identify -format %w "$in")
  local h=$(( w * 3 / 4 ))
  encode() { convert "$in" -crop "${w}x${h}+0+$y" +repage -resize 400x300^ -gravity center -extent 400x300 -strip png:- |
    "$FF" -loglevel error -y -f png_pipe -i - -c:v libwebp -quality "$q" -compression_level 6 "$out"; }
  encode
  while [ "$(stat -c %s "$out")" -gt 40000 ] && [ "$q" -gt 50 ]; do q=$((q - 6)); encode; done
  printf '%-40s %6s bytes\n' "$out" "$(stat -c %s "$out")"
}

crop POL-27 libreta_trabajo 330
crop POL-28 anses_jubilados 105
crop POL-29 afip_simple 240
crop POL-30 aerolineas_en_venta 360
crop POL-31 vaca_muerta 290
crop POL-36 argentina_al_mundo 120
