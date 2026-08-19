# Listado Completo de Piezas de Diseño a Desarrollar — GobernArg

> Documento maestro para generación de TODAS las piezas visuales del juego.
> Cada pieza tiene especificación exacta de formato, estilo y destino.

---

## Formato de salida general

| Parámetro | Valor |
|-----------|-------|
| **Formato** | WebP (calidad 85) |
| **Originales** | PNG en `src/assets/images/raw/` |
| **Registro** | Actualizar `src/assets/images/INVENTORY.md` + `src/utils/imageAssets.ts` |
| **Paleta** | Celeste `#4a90c9`, Dorado `#e0b83e`, Azul oscuro `#1a2b45`, Blanco `#ffffff`, Rojo `#c0392b` (solo crisis) |
| **Estilo general** | Heráldico institucional argentino: Sol de Mayo, laureles, bandera celeste/blanca, cúpulas |

---

## Grupo A — Iconos de Arquetipos (3 piezas)

**Formato**: SVG/PNG 1024×1024, fondo transparente, luego WebP q85
**Estilo**: Escudo hexagonal heráldico, trazo fino, gradiente sutil, 1 motivo central
**Destino**: `src/assets/images/icons/archetypes/`

| # | Archivo | Motivo central | Descripción |
|---|---------|----------------|-------------|
| A1 | `archetype-business.svg` | Maletín ejecutivo | Escudo hexagonal con trazo dorado fino. Centro: maletín con corbata dorada. Fondo interno: gradiente celeste sutil. Sin texto. |
| A2 | `archetype-communicator.svg` | Micrófono | Escudo hexagonal. Centro: micrófono clásico con 2 ondas de sonido. Acento dorado en la base del micrófono. |
| A3 | `archetype-union.svg` | Puño levantado | Escudo hexagonal. Centro: puño con bandera argentina en la manga. Sol de Mayo pequeño detrás. |

---

## Grupo B — Iconos de Categorías (3 piezas)

**Formato**: 1024×1024, fondo transparente, WebP q85
**Estilo**: Escudo hexagonal heráldico, consistente con Grupo A
**Destino**: `src/assets/images/icons/categories/`

| # | Archivo | Motivo central | Descripción |
|---|---------|----------------|-------------|
| B1 | `category-culture.svg` | Máscaras teatrales | Dos máscaras (comedia/tragedia) minimalistas enfrentadas. Trazo fino celeste. |
| B2 | `category-tourism.svg` | Pin de ubicación | Pin de mapa estilizado con anillo interno y punto dorado. Acento de sol naciente. |
| B3 | `category-technology.svg` | Microchip | Chip con pines finos y núcleo celeste. Circuitos sutiles de fondo. |

---

## Grupo C — Iconos de Grupos de Interés (15 piezas)

**Formato**: 1024×1024, fondo transparente, WebP q85
**Estilo**: Escudo fino (no macizo) con motivo central único. Consistente con A y B.
**Destino**: `src/assets/images/icons/groups/`

| # | Archivo | Motivo | Descripción |
|---|---------|--------|-------------|
| C1 | `group-financial.svg` | Moneda + gráfico | Moneda celeste con gráfico de tendencia ascendente dorado. |
| C2 | `group-middle-class.svg` | Casa | Casa unifamiliar minimalista con Sol de Mayo detrás. |
| C3 | `group-low-income.svg` | Corazón + manos | Corazón celeste con manos en cuenco doradas debajo. |
| C4 | `group-upper-class.svg` | Torre | Torre esbelta con remate de diamante dorado. |
| C5 | `group-indigenous.svg` | Sol andino | Sol Inti estilizado con cordillera debajo. |
| C6 | `group-ngo.svg` | Comunidad | Tres figuras conectadas formando círculo. |
| C7 | `group-environmentalists.svg` | Hoja + sol | Hoja fina con sol naciente. Sin verde (usar celeste). |
| C8 | `group-feminists.svg` | Símbolo género | Símbolo de género con chevron ascendente. Sin violeta (usar celeste). |
| C9 | `group-students.svg` | Birrete | Birrete de graduación con borla dorada. |
| C10 | `group-cooperatives.svg` | Engranaje | Engranaje fino con anillo central dorado. |
| C11 | `group-allies.svg` | Anillos entrelazados | Dos anillos entrelazados (celeste + dorado). |
| C12 | `group-opposition.svg` | Flechas opuestas | Dos flechas opuestas con punto central. |
| C13 | `group-artists.svg` | Paleta | Paleta de pintor con 3 gotas de color (celeste, dorado, blanco). |
| C14 | `group-athletes.svg` | Antorcha | Antorcha con llama dorada. |
| C15 | `group-academics.svg` | Libro abierto | Libro abierto de dos páginas con lomo dorado. |

---

## Grupo D — Imágenes de Eventos (11 piezas)

**Formato**: 1774×887 (relación 2:1), WebP q85
**Estilo**: Fotografía editorial realista, escena evocadora, paleta celeste/dorado/azul oscuro
**Destino**: `src/assets/images/events/`
**Generar con**: IA de imágenes (Midjourney, DALL-E, Leonardo, etc.)

| # | Archivo | Evento | Prompt para IA |
|---|---------|--------|----------------|
| D1 | `event-debt-default.webp` | `debt_default` | "Billetes argentinos apilados sobre escritorio oscuro, documento sellado en rojo, gráfico descendente al fondo, iluminación azul oscuro con acentos dorados, fotografía editorial, 2:1" |
| D2 | `event-energy-crisis.webp` | `energy_crisis` | "Skyline nocturno de Buenos Aires con apagón parcial, torre de alta tensión en primer plano, cielo azul oscuro, luces de advertencia ámbar, fotografía editorial" |
| D3 | `event-general-strike.webp` | `general_strike` | "Plaza de Mayo con multitud de trabajadores, banderas argentinas, pancartas sindicales, atmósfera celeste y gris con detalles dorados, fotografía editorial" |
| D4 | `event-heat-wave.webp` | `heat_wave` | "Avenida urbana bajo sol abrasador, ondulaciones de calor en el pavimento, ciudadanos buscando sombra, luz dorada intensa contra sombras azules, fotografía editorial" |
| D5 | `event-diplomatic-conflict.webp` | `diplomatic_conflict` | "Sala de negociación formal con mesa larga, dos banderas enfrentadas, diplomáticos tensos señalando tratado, paleta azul oscuro fría, emblemas dorados" |
| D6 | `event-external-sanctions.webp` | `external_sanctions` | "Fachada institucional estilo Casa Rosada, sello de SANCIONES en rojo superpuesto, emblemas oficiales atenuados, azul oscuro dominante, fotografía editorial" |
| D7 | `event-drought.webp` | `drought` | "Campo agrícola con tierra agrietada, cultivos marchitos, silo al fondo, luz ámbar de sequía, horizonte azul oscuro, fotografía editorial" |
| D8 | `event-prison-riot.webp` | `prison_riot` | "Perímetro carcelario nocturno, torres de vigilancia, alambre de púas, columnas de humo, luces de emergencia rojas, azul noche dominante" |
| D9 | `event-drug-wave.webp` | `drug_wave` | "Calle urbana nocturna con operativo policial, luces estroboscópicas azules y rojas, cinta de escena, luces doradas de ciudad al fondo" |
| D10 | `event-police-violence-scandal.webp` | `police_violence_scandal` | "Confrontación entre policía con escudos y manifestantes, celular grabando en primer plano, banderas argentinas desenfocadas, tono editorial crítico" |
| D11 | `event-minister-resignation.webp` | `minister_resignation` | "Despacho ministerial vacío, escritorio con carta de renuncia, sillón girado, luz celeste por la ventana, melancolía formal, azul oscuro y dorado" |

---

## Grupo E — Elementos de UI (10 piezas)

**Formato**: WebP q85 con transparencia donde se indica
**Estilo**: Vectorial/heráldico, trazo fino, gradientes sutiles
**Destino**: `src/assets/images/ui/`

| # | Archivo | Dimensiones | Transparencia | Descripción |
|---|---------|-------------|---------------|-------------|
| E1 | `presidential-portrait-frame.webp` | 1024×1024 | Centro transparente | Marco ovalado dorado tipo retrato oficial. Laureles laterales finos, Sol de Mayo arriba, cintas celestes en base. |
| E2 | `victory-banner.webp` | 1920×480 | No | Banner horizontal con cinta celeste/dorada, laureles, Sol de Mayo radiante, espacio central vacío para texto. |
| E3 | `defeat-banner.webp` | 1920×480 | No | Banner azul marino + gris, columna quebrada, Sol de Mayo apagado, cinta roja apagada. |
| E4 | `approval-seal.webp` | 512×512 | Sí | Sello lacre dorado/celeste con borde dentado, Sol de Mayo central, texto "APROBADO" en arco. |
| E5 | `crisis-seal.webp` | 512×512 | Sí | Sello lacre rojo/azul oscuro, borde irregular, flecha descendente, texto "CRISIS". |
| E6 | `mandate-badge-president.webp` | 512×512 | Sí | Insignia con banda presidencial celeste-blanca, Sol de Mayo, laureles dorados. |
| E7 | `mandate-badge-governor.webp` | 512×512 | Sí | Insignia con cúpula provincial, banda celeste, laureles. |
| E8 | `mandate-badge-intendente.webp` | 512×512 | Sí | Insignia con edificio municipal, banda celeste, laureles. |
| E9 | `achievement-medal-gold.webp` | 512×512 | Sí | Medalla dorada con cinta celeste/blanca, Sol de Mayo en el disco, laureles. |
| E10 | `achievement-medal-silver.webp` | 512×512 | Sí | Medalla plateada con cinta celeste/blanca, versión menor jerarquía. |

---

## Grupo F — Fondos (10 piezas)

**Formato**: 1672×941, WebP q85
**Estilo**: Ilustración realista pintada, arquitectura institucional argentina, cielo despejado arriba para overlay
**Destino**: `src/assets/images/backgrounds/`
**Generar con**: IA de imágenes

| # | Archivo | Prompt para IA |
|---|---------|----------------|
| F1 | `bg-cabinet-room.webp` | "Interior de sala de gabinete, mesa ovalada de madera oscura, sillas de cuero, bandera argentina, ventanal con Casa Rosada al atardecer, luz cálida dorada, ilustración realista pintada" |
| F2 | `bg-congress-interior.webp` | "Hemiciclo del Congreso argentino, bancas semicirculares de madera, estrado presidencial, banderas, cúpula iluminada, luz dorada cenital, ilustración realista" |
| F3 | `bg-press-room.webp` | "Sala de conferencias de prensa, atril con micrófonos, cámaras, flashes, pantallas, banderas argentinas, azul oscuro con acentos dorados" |
| F4 | `bg-presidential-office.webp` | "Despacho presidencial, escritorio de caoba, sillón presidencial, bandera argentina, biblioteca, ventanal con skyline al atardecer" |
| F5 | `bg-government-night.webp` | "Casa Rosada de noche, fachada iluminada cálida, luna, cielo estrellado azul oscuro, plaza vacía con farolas" |
| F6 | `bg-rainy-city.webp` | "Avenida institucional bajo lluvia, edificios gubernamentales, paraguas, reflejos en asfalto, cielo gris-azulado melancólico" |
| F7 | `bg-protest-demonstration.webp` | "Plaza de Mayo con multitud, banderas argentinas, pancartas celestes y doradas, Casa Rosada al fondo, cielo claro" |
| F8 | `bg-campaign-rally.webp` | "Acto de campaña, escenario con orador, banderas argentinas, multitud, globos celestes y dorados, luz cálida de tarde" |
| F9 | `bg-map-argentina.webp` | "Mapa estilizado de Argentina con provincias, tonos celeste y dorado sobre azul oscuro, marcadores institucionales" |
| F10 | `bg-casa-rosada-morning.webp` | "Casa Rosada a plena luz de día, cielo celeste limpio, plaza ordenada, banderas al viento, tonos luminosos y optimistas" |

---

## Grupo G — Personajes y Avatares (14 piezas)

**Formato**: 1254×1254, WebP q85
**Estilo**: Ilustración vectorial realista, busto centrado, iluminación plana, fondo temático
**Destino**: `src/assets/images/characters/` o `src/assets/images/advisors/`
**Generar con**: IA de imágenes

### Asesores masculinos (6) — destino `advisors/`

| # | Archivo | Descripción |
|---|---------|-------------|
| G1 | `advisor-infrastructure-male.webp` | Hombre 45-55, ingeniero civil, traje azul, casco o planos. Fondo azul con grúas y puente. |
| G2 | `advisor-foreign-male.webp` | Hombre 50-60, diplomático, traje oscuro, corbata celeste. Fondo con mapamundi y laureles. |
| G3 | `advisor-education-male.webp` | Hombre 40-50, académico, anteojos, saco azul, libro. Fondo con pizarra y libros. |
| G4 | `advisor-communication-male.webp` | Hombre 35-45, vocero, micrófono. Fondo amarillo/celeste con ondas de sonido. |
| G5 | `advisor-security-male.webp` | Hombre 45-55, firme, traje oscuro. Fondo con escudo y cámara. |
| G6 | `advisor-social-male.webp` | Hombre 40-50, camisa celeste, actitud cercana. Fondo con familias y barrios. |

### Avatares de personajes (6) — destino `characters/`

| # | Archivo | Descripción |
|---|---------|-------------|
| G7 | `character-female-executive-1.webp` | Mujer 35-45, traje sastre azul, brazos cruzados. Fondo celeste liso. |
| G8 | `character-female-executive-2.webp` | Mujer 45-55, anteojos, traje oscuro. Fondo azul con columnas. |
| G9 | `character-senior-leader.webp` | Hombre 65-75, canas, traje clásico. Fondo con Sol de Mayo y laureles. |
| G10 | `character-indigenous-leader.webp` | Persona 40-50 con poncho y wiphala. Fondo cálido con cerros. |
| G11 | `character-youth-activist.webp` | Joven 20-30, campera, pañuelo, gesto enérgico. Fondo vibrante con siluetas. |
| G12 | `character-business-executive.webp` | Hombre 45-55, empresario, corbata dorada, maletín. Fondo con rascacielos. |

### Asesores de especialidades nuevas (2) — destino `advisors/`

| # | Archivo | Descripción |
|---|---------|-------------|
| G13 | `advisor-health-female.webp` | Mujer 40-50, médica, guardapolvo blanco, estetoscopio. Fondo con hospital. |
| G14 | `advisor-justice-male.webp` | Hombre 50-60, juez, toga, balanza y martillo. Fondo con columnas y escudo. |

---

## Grupo H — Gaps en Componentes (18 mejoras)

Estas no son piezas nuevas sino **cambios de código** para integrar piezas existentes o corregir inconsistencias.

| # | Componente | Problema | Solución |
|---|-----------|----------|----------|
| H1 | `App.tsx` | Fondo de juego plano | Agregar textura de fondo sutil |
| H2 | `WelcomeModal` | No muestra avatar | Pasar `avatar` prop y mostrar con `official-frame` |
| H3 | `TurnSummaryModal` | Emblema cuadrado como hero | Usar banner panorámico dedicado |
| H4 | `GameOverModal` | Victoria con emblema cuadrado | Usar `victory-banner` |
| H5 | `LegacyScreen` | Header con emblema cuadrado | Usar `victory-banner`/`defeat-banner` |
| H6 | `ReelectionChoiceModal` | Sin imagen de cabecera | Agregar imagen de urna electoral |
| H7 | `MidtermStrategyModal` | Sin cabecera, iconos Lucide | Agregar header + iconos propios |
| H8 | `RightSidebar` | Grupos usan Lucide | Usar iconos webp de Grupo C |
| H9 | `EventModal` | Categoría usa Lucide | Reutilizar iconos de categoría existentes |
| H10 | `InterestGroupsPanel` | Tema claro inconsistente | Migrar a tema oscuro |
| H11 | `SubgroupMoodBadge` | Emojis 😊🙁😠💀 | Reemplazar por iconos propios |
| H12 | `App.tsx` botones | Letras L/C placeholder | Usar iconos propios |
| H13 | `CharacterCreation` | Doble icono + thumbnails prestados | Usar iconos de Grupo A |
| H14 | `ControlPanel` | Estado vacío sin ilustración | Agregar ilustración empty |
| H15 | `AdvisorPanel` | Estado vacío sin ilustración | Agregar ilustración empty |
| H16 | `NotificationCenter` | Estado vacío + tema claro | Agregar ilustración + migrar tema |
| H17 | Componentes legacy | Tema claro | Migrar a tema oscuro |
| H18 | `GameLog` | Sin header visual | Agregar textura tipo legajo |

---

## Resumen por grupo

| Grupo | Piezas | Formato | Generación |
|-------|--------|---------|------------|
| A. Arquetipos | 3 | SVG/PNG 1024², transparente | Manual o IA vectorial |
| B. Categorías | 3 | SVG/PNG 1024², transparente | Manual o IA vectorial |
| C. Grupos | 15 | SVG/PNG 1024², transparente | Manual o IA vectorial |
| D. Eventos | 11 | WebP 1774×887 | IA imágenes |
| E. UI | 10 | WebP variable, transparencia parcial | Manual o IA vectorial |
| F. Fondos | 10 | WebP 1672×941 | IA imágenes |
| G. Personajes | 14 | WebP 1254×1254 | IA imágenes |
| H. Código | 18 | N/A (cambios de código) | Programador |
| **Total piezas** | **66** | | |
| **Total mejoras código** | **18** | | |

---

## Prioridad de desarrollo

1. **Grupo A + B + C** (21 iconos) — se ven en cada partida, impacto inmediato
2. **Grupo D** (11 eventos) — a medida que se activan eventos pendientes
3. **Grupo E** (10 UI) — para pantallas de victoria/derrota
4. **Grupo F** (10 fondos) — renovación de escenarios
5. **Grupo G** (14 personajes) — ampliación de selección
6. **Grupo H** (18 código) — integración con las piezas generadas
