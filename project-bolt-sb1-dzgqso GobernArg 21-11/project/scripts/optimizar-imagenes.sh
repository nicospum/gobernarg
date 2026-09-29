#!/usr/bin/env bash
# Achica las imágenes del juego (Fase 4). Uso, desde project/:
#   scripts/optimizar-imagenes.sh src/assets/images
# Reemplaza cada archivo solo si la versión nueva pesa menos.
# Ruta a ffmpeg (compilado con libwebp). Se cambia con la variable FFMPEG.
FF="${FFMPEG:-ffmpeg}"
IMG="$1"
TMP="$(mktemp -d)"
before=0; after=0
shrink() { # carpeta, filtro de escala, calidad
  local dir="$1" scale="$2" q="$3"
  for f in "$IMG/$dir"/*.webp; do
    [ -f "$f" ] || continue
    local out="$TMP/$(basename "$f")"
    "$FF" -v error -y -i "$f" -vf "$scale" -c:v libwebp -quality "$q" -compression_level 6 -pix_fmt yuva420p "$out" || continue
    local a b; a=$(stat -c %s "$f"); b=$(stat -c %s "$out")
    before=$((before + a))
    if [ "$b" -lt "$a" ]; then cp "$out" "$f"; after=$((after + b)); else after=$((after + a)); fi
  done
}
ICON="scale='min(iw,256)':'min(ih,256)':force_original_aspect_ratio=decrease"
shrink icons/groups "$ICON" 80
shrink icons/categories "$ICON" 80
shrink icons/archetypes "$ICON" 80
shrink advisors "$ICON" 80
shrink characters "scale='min(iw,384)':'min(ih,384)':force_original_aspect_ratio=decrease" 80
shrink events "scale='min(iw,1200)':-2" 72
shrink backgrounds "scale='min(iw,1600)':-2" 70
echo "antes $((before / 1024)) KB · después $((after / 1024)) KB"
rm -rf "$TMP"
