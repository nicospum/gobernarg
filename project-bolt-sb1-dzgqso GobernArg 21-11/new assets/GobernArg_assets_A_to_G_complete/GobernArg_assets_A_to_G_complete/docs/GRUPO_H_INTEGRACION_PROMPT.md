# Grupo H — Prompt de integración para la app

Quiero integrar todos los assets visuales generados para GobernArg en la aplicación del juego.

Assets disponibles:
- `src/assets/images/icons/archetypes/`
- `src/assets/images/icons/categories/`
- `src/assets/images/icons/groups/`
- `src/assets/images/events/`
- `src/assets/images/ui/`
- `src/assets/images/backgrounds/`
- `src/assets/images/advisors/`
- `src/assets/images/characters/`

## Objetivo
Reemplazar iconos genéricos, fondos planos y placeholders por los assets reales generados. Mantener la lógica del juego intacta y mejorar la presentación visual.

## Tareas

1. Crear un archivo central de rutas, por ejemplo:
`src/assets/assetMap.ts`

Debe exportar mapas como:
- `archetypeIcons`
- `categoryIcons`
- `groupIcons`
- `eventImages`
- `uiAssets`
- `backgroundImages`
- `advisorImages`
- `characterImages`

2. Reemplazar iconos Lucide en tarjetas de arquetipos, categorías y grupos por imágenes WebP del asset map.

3. Usar imágenes de eventos en cards, modales y notificaciones de eventos.

4. Usar assets UI para:
- pantalla de victoria: `victory-banner.webp`
- pantalla de derrota: `defeat-banner.webp`
- sellos: `approval-seal.webp`, `crisis-seal.webp`
- insignias de mandato: presidente, gobernador e intendente
- medallas de logros
- marco de retrato presidencial

5. Usar fondos dinámicos según pantalla/contexto:
- dashboard: `bg-cabinet-room.webp`
- Congreso/legislativo: `bg-congress-interior.webp`
- comunicación/prensa: `bg-press-room.webp`
- despacho: `bg-presidential-office.webp`
- crisis/nocturno: `bg-government-night.webp`
- conflicto social: `bg-protest-demonstration.webp`
- campaña: `bg-campaign-rally.webp`
- mapa/territorio: `bg-map-argentina.webp`

6. Usar avatares/personajes en:
- diálogos de asesores
- demandas de actores
- panel de personajes
- eventos narrativos
- pantalla de selección o perfil político

7. Optimizar carga:
- usar WebP por defecto
- lazy loading para fondos y personajes
- preservar `alt` descriptivos
- evitar importar imágenes no usadas

8. Mantener consistencia:
- nombres de archivos en minúsculas
- rutas estables
- no borrar lógica existente
- no romper tests ni navegación

## Resultado esperado
La app debe verse más inmersiva, con identidad argentina y assets conectados al sistema de juego, sin convertirlo en una demo visual vacía.