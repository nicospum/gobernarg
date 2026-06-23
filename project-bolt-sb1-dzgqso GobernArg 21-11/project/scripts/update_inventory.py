import os
import subprocess
from pathlib import Path

BASE = Path('src/assets/images')
RAW = BASE / 'raw'

# Mapeo: ruta relativa final -> (original base name sin ext, descripción, uso sugerido)
MAPPING = {
    'logo/logo-primary.webp': ('image_023', 'Logotipo principal "Gobernarg" con escudo institucional y tipografía.', 'Logo principal en pantalla de bienvenida y splash.'),
    'logo/logo-wide.webp': ('image_012', 'Logotipo panorámico "Gobernarg" para headers y material promocional.', 'Header del juego y pantallas anchas.'),

    'backgrounds/balcony-casa-rosada-sunset.webp': ('image_008', 'Balcón presidencial con Casa Rosada al fondo al atardecer.', 'Fondo de bienvenida / escenario nacional.'),
    'backgrounds/balcony-congress-sunset.webp': ('image_010', 'Balcón presidencial con Congreso y atardecer cálido.', 'Fondo de pantalla principal / menú.'),
    'backgrounds/balcony-congress-vertical.webp': ('image_011', 'Variante vertical del balcón con Congreso.', 'Fondo vertical móvil / splash.'),
    'backgrounds/municipal-plaza.webp': ('image_013', 'Plaza cívica con edificio municipal y bandera argentina.', 'Fondo de escenario municipal / intendencia.'),
    'backgrounds/government-building-balcony.webp': ('image_014', 'Edificio gubernamental imponente visto desde balcón.', 'Fondo de escenario ejecutivo / ministerial.'),
    'backgrounds/congress-sunrise-panorama.webp': ('image_024', 'Panorama del Congreso argentino al amanecer.', 'Fondo de pantalla de inicio / menú principal.'),
    'backgrounds/balcony-congress-flags.webp': ('image_025', 'Balcón con banderas argentinas y Congreso al fondo.', 'Pantalla de título / carga.'),
    'backgrounds/town-square-autumn.webp': ('image_030', 'Plaza municipal con edificio colonial en otoño.', 'Fondo de campaña provincial / municipal.'),
    'backgrounds/government-building-gardens.webp': ('image_031', 'Edificio gubernamental clásico con jardines.', 'Fondo de escenario de gobierno.'),
    'backgrounds/casa-rosada-skyline.webp': ('image_032', 'Casa Rosada con skyline de la ciudad al atardecer.', 'Fondo de escenario nacional / presidencial.'),

    'characters/character-executive-1.webp': ('image_015', 'Hombre ejecutivo con traje azul, brazos cruzados.', 'Avatar de personaje jugable.'),
    'characters/character-executive-2.webp': ('image_016', 'Hombre de traje azul y camisa celeste, brazos cruzados.', 'Avatar de personaje jugable.'),
    'characters/character-popular-leader.webp': ('image_017', 'Dirigente popular mayor con bufanda celeste y blanca.', 'Avatar de líder social / sindical.'),
    'characters/character-spokesperson.webp': ('image_018', 'Mujer con blazer azul sosteniendo micrófono.', 'Avatar de portavoz / candidata.'),
    'characters/character-candidate-handshake.webp': ('image_026', 'Hombre extendiendo la mano en gesto de saludo político.', 'Avatar de gobernante / candidato.'),
    'characters/character-conservative-executive.webp': ('image_027', 'Hombre ejecutivo conservador con pañuelo y columnas de fondo.', 'Avatar de gobernador / alto funcionario.'),
    'characters/character-fighter-leader.webp': ('image_028', 'Líder popular barbudo con puños cerrados y fondo rojo.', 'Avatar de dirigente social combativo.'),
    'characters/character-young-orator.webp': ('image_029', 'Joven con micrófono celeste y blanco, fondo amarillo.', 'Avatar de comunicador / candidato joven.'),
    'characters/character-podium-official.webp': ('image_054', 'Hombre en podio con bandera argentina y Congreso.', 'Avatar de presidente / gobernante oficial.'),

    'advisors/advisor-economy-female.webp': ('image_019', 'Asesora de economía con gráficos financieros de fondo.', 'Ministra / asesora de Economía.'),
    'advisors/advisor-press-female.webp': ('image_020', 'Asesora de prensa con tablet y siluetas de comunicación.', 'Ministra / asesora de Prensa.'),
    'advisors/advisor-security-female.webp': ('image_021', 'Asesora de seguridad con escudo y cámara de fondo.', 'Ministra / asesora de Seguridad.'),
    'advisors/advisor-social-female.webp': ('image_022', 'Asesora social con escena comunitaria de fondo.', 'Ministra / asesora de Desarrollo Social.'),
    'advisors/advisor-economy-male.webp': ('image_033', 'Asesor económico con gráficos de crecimiento.', 'Ministro / asesor de Economía.'),
    'advisors/advisor-communication-female.webp': ('image_034', 'Asesora de comunicación con micrófono y burbuja de diálogo.', 'Vocera / asesora de Comunicación.'),
    'advisors/advisor-institutional-female.webp': ('image_035', 'Asesora institucional con escudo y Congreso.', 'Asesora de Gobierno / Institucional.'),
    'advisors/advisor-social-education-female.webp': ('image_036', 'Asesora social con siluetas de familias y hogar.', 'Asesora de Desarrollo Social / Educación.'),
    'advisors/advisor-foreign-female.webp': ('image_037', 'Asesora de relaciones exteriores con mapa mundi.', 'Canciller / asesora de Diplomacia.'),
    'advisors/advisor-economy-icon.webp': ('image_055', 'Icono de asesor económico con maletín y gráficos.', 'Icono para tarjeta de asesor económico.'),
    'advisors/advisor-press-icon.webp': ('image_057', 'Icono de vocero hablando frente a micrófono.', 'Icono para tarjeta de asesor de prensa.'),

    'events/event-economic-crisis.webp': ('image_009', 'Ciudadanos preocupados frente a caja registradora vacía y gráficos bajistas.', 'Evento de crisis económica / inflación.'),
    'events/event-social-protest.webp': ('image_038', 'Multitud protestando frente al Congreso con banderas.', 'Evento de protesta social.'),
    'events/event-corruption-scandal.webp': ('image_039', 'Escena de entrega de dinero en sobres con prensa afuera.', 'Evento de escándalo de corrupción.'),
    'events/event-flood-emergency.webp': ('image_040', 'Inundación urbana con rescatistas y familias afectadas.', 'Evento de emergencia climática.'),
    'events/event-infrastructure-plan.webp': ('image_041', 'Funcionarios revisando planos de infraestructura.', 'Evento de obra pública / infraestructura.'),
    'events/event-election-day.webp': ('image_042', 'Ciudadanos votando en cabinas frente al Congreso.', 'Evento electoral / día de votación.'),

    'ui/official-frame.webp': ('image_001', 'Marco ornamental estilo diploma con escudo, laureles y banderas.', 'Marco decorativo para informes / logros.'),
    'ui/shield-emblem.webp': ('image_058', 'Escudo institucional con Congreso y Sol de Mayo.', 'Emblema para logros / insignias.'),
    'ui/shield-emblem-premium.webp': ('image_059', 'Escudo institucional premium con laureles y estrella dorada.', 'Emblema de alta distinción.'),

    'icons/archetypes/archetype-institutional.webp': ('image_003', 'Escudo hexagonal con estrella, laureles y ondas.', 'Icono de arquetipo institucional / orden.'),
    'icons/archetypes/archetype-nationalist.webp': ('image_056', 'Figura con boina, puño levantado y bandera argentina.', 'Icono de arquetipo nacionalista / patriota.'),

    'icons/categories/category-economy.webp': ('image_002', 'Escudo hexagonal con gráfico de barras ascendente y Sol de Mayo.', 'Icono de categoría Economía.'),
    'icons/categories/category-social.webp': ('image_004', 'Escudo hexagonal con siluetas protegidas por manos.', 'Icono de categoría Social.'),
    'icons/categories/category-infrastructure.webp': ('image_005', 'Escudo hexagonal con paisaje urbano y puente.', 'Icono de categoría Infraestructura.'),
    'icons/categories/category-diplomacy.webp': ('image_006', 'Escudo hexagonal con apretón de manos y globo terráqueo.', 'Icono de categoría Diplomacia.'),
    'icons/categories/category-government.webp': ('image_007', 'Escudo hexagonal con edificio institucional y cúpula.', 'Icono de categoría Gobierno.'),
    'icons/categories/category-education.webp': ('image_043', 'Icono plano de figura con birrete y libro abierto.', 'Icono de categoría Educación.'),
    'icons/categories/category-security.webp': ('image_044', 'Icono plano de escudo con check.', 'Icono de categoría Seguridad.'),
    'icons/categories/category-economy-growth.webp': ('image_045', 'Icono plano de barras ascendentes con moneda.', 'Icono de categoría Economía / crecimiento.'),
    'icons/categories/category-infrastructure-bridge.webp': ('image_047', 'Icono de puente colgante y carretera.', 'Icono de categoría Infraestructura.'),
    'icons/categories/category-government-congress.webp': ('image_048', 'Icono del Congreso con cúpula y bandera.', 'Icono de categoría Gobierno / legislativo.'),
    'icons/categories/category-diplomacy-handshake.webp': ('image_049', 'Icono de apretón de manos con globo terráqueo.', 'Icono de categoría Diplomacia.'),

    'icons/groups/group-workers.webp': ('image_046', 'Icono de trabajadores con puño levantado y bandera.', 'Icono de sindicatos / trabajadores.'),
    'icons/groups/group-business.webp': ('image_050', 'Icono de maletín ejecutivo con edificios de oficinas.', 'Icono de empresarios / sector empresarial.'),
    'icons/groups/group-media.webp': ('image_051', 'Icono de micrófono, cámara y periódico.', 'Icono de medios de comunicación.'),
    'icons/groups/group-church.webp': ('image_052', 'Icono de iglesia con figuras humanas.', 'Icono de institución religiosa.'),
    'icons/groups/group-agriculture.webp': ('image_053', 'Icono de tractor en campo con espiga de trigo.', 'Icono de sector agropecuario.'),
}


def get_dimensions(path: Path) -> str:
    try:
        out = subprocess.check_output([
            'ffprobe', '-v', 'error', '-select_streams', 'v:0',
            '-show_entries', 'stream=width,height', '-of', 'csv=s=x:p=0',
            str(path)
        ], stderr=subprocess.DEVNULL)
        return out.decode().strip()
    except Exception:
        return '?x?'


def main():
    rows = []
    total = 0
    for rel, (orig, desc, usage) in sorted(MAPPING.items()):
        webp_path = BASE / rel
        png_path = RAW / f'{orig}.png'
        if not webp_path.exists():
            print(f'WARN: no existe {webp_path}')
            continue
        dims = get_dimensions(webp_path)
        webp_size = webp_path.stat().st_size
        png_size = png_path.stat().st_size if png_path.exists() else 0
        rows.append((rel, f'{orig}.png', dims, png_size, webp_size, usage))
        total += 1

    lines = [
        '# Inventario de imágenes generadas',
        '',
        'Todas las imágenes están en formato WebP (calidad 85) para reducir peso sin pérdida visible.',
        'Los PNG originales se conservan en `src/assets/images/raw/` como respaldo.',
        '',
        '| Archivo WebP | Original | Dimensiones | Tamaño PNG | Tamaño WebP | Uso sugerido |',
        '|---|---|---|---|---|---|',
    ]
    for rel, orig, dims, png_size, webp_size, usage in rows:
        lines.append(f'| {rel} | {orig} | {dims} | {png_size} | {webp_size} | {usage} |')

    lines.append('')
    lines.append(f'Total: {total} imágenes')
    lines.append('')

    out_path = BASE / 'INVENTORY.md'
    out_path.write_text('\n'.join(lines), encoding='utf-8')
    print(f'Escrito {out_path} con {total} entradas')


if __name__ == '__main__':
    main()
