#!/usr/bin/env bash
# Copia las imágenes de la B Lite para la A Lite, aclaradas para el tema claro.
# Uso, desde project/:
#   scripts/aclarar-imagenes-lite.sh <carpeta b-lite de la B>
# (la que tiene actores/, politicas/ y pantallas/). Escribe en
# src/assets/images/a-lite/<carpeta>/ solo los archivos que nombra
# src/lite/imageMap.ts.
#
# Tratamiento (una sola vez, sin costo al jugar): las imágenes son nocturnas,
# así que se levantan las sombras (gamma 1.5), se baja un poco el contraste
# (sigmoide inversa 3), se calienta apenas (rojo +4 %, azul −5 %) y se baja
# un 5 % la saturación. Las luces no se queman: la gamma no toca el blanco.
# Tamaños: retratos 160×160 (≤15 KB), ilustraciones 640×320 (≤40 KB),
# portada 1200×900 (≤120 KB), banda de cierre 1200×400.
set -euo pipefail
SRC="${1:?Falta la carpeta b-lite de origen}"
OUT="src/assets/images/a-lite"
MAP="src/lite/imageMap.ts"

tone=(-gamma 1.5 +sigmoidal-contrast 3,50% -channel R -evaluate multiply 1.04 -channel B -evaluate multiply 0.95 +channel -modulate 102,95)
# SIN_TONO=1 copia sin aclarar (solo recorte y peso), para comparar.
[ "${SIN_TONO:-}" = 1 ] && tone=(-modulate 100)

process() { # carpeta nombre tamaño calidad
  local dir="$1" name="$2" size="$3" q="$4"
  local in="$SRC/$dir/$name.webp" out="$OUT/$dir/$name.webp"
  [ -f "$in" ] || { echo "falta $in" >&2; return; }
  mkdir -p "$OUT/$dir"
  convert "$in" -resize "$size^" -gravity center -extent "$size" "${tone[@]}" -strip -quality "$q" -define webp:method=6 "$out"
  printf '%-45s %6s bytes\n' "$out" "$(stat -c %s "$out")"
}

# Nombres de archivo que usa la tabla (valores entre comillas simples).
names() { sed -n "/^export const $1/,/^}/p" "$MAP" | grep -o ": '[^']*'" | tr -d ":' " | sort -u; }

for n in $(names ACTOR_IMAGE); do process actores "$n" 160x160 80; done
for n in $(names ACTION_IMAGE); do process politicas "$n" 640x320 74; done
process pantallas bienvenida-hero 1200x900 78
process pantallas cierre-turno 1200x400 72
