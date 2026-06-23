import os
import subprocess
from pathlib import Path

BASE = Path('src/assets/images')
SOURCE_DIRS = [
    BASE / 'icons/archetypes',
    BASE / 'icons/categories',
    BASE / 'icons/groups',
    BASE / 'advisors',
]
OUT_DIR = BASE / 'icons/thumbnails'
SIZE = 128
QUALITY = 85


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    count = 0
    for src_dir in SOURCE_DIRS:
        if not src_dir.exists():
            continue
        for webp in sorted(src_dir.glob('*.webp')):
            out_name = webp.stem + '.webp'
            out_path = OUT_DIR / out_name
            cmd = [
                'ffmpeg', '-y', '-i', str(webp),
                '-vf', f'scale={SIZE}:{SIZE}:force_original_aspect_ratio=decrease,pad={SIZE}:{SIZE}:(ow-iw)/2:(oh-ih)/2:ffffff@0.0',
                '-q:v', str(QUALITY),
                str(out_path)
            ]
            try:
                subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                count += 1
                print(f'Generado {out_path}')
            except subprocess.CalledProcessError as e:
                print(f'Error generando {out_path}: {e}')
    print(f'Total thumbnails generados: {count}')


if __name__ == '__main__':
    main()
