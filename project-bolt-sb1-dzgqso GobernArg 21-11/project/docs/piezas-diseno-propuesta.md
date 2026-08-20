# Propuestas de Piezas de Diseño — GobernArg

> Documento consolidado de propuestas de diseño visual para completar la identidad del juego.
> Basado en análisis de 6 agentes sobre los 59 assets existentes y los 40+ componentes UI.
>
> **ESTADO ACTUAL (20/08/2026):** las **66 piezas del master ya existen** en `src/assets/images/`
> (integradas el 19-20/08, inventario en `INVENTORY.md`). Detalle por grupo (ver `piezas-diseno-master.md`):
> - **Grupos A, B, C, D, F y G integrados** — iconos de arquetipos, categorías y grupos de interés,
>   imágenes de los 12 eventos pendientes, fondos, personajes y avatares.
> - **Grupo E (10 elementos de UI** — marcos, banners, sellos, medallas) **pendiente de generar.**
> - **Grupo H (18 mejoras de código en componentes)** — mayormente completado (tema oscuro, iconos propios).
> Este documento queda como **backlog histórico de diseño**: las secciones 1-7 describen lo que ya se
> generó; la sección 8 (gaps en componentes UI) y el Grupo E son lo que resta.

---

## Estilo visual del juego (guía)

| Capa | Estilo | Paleta | Formato |
|------|--------|--------|---------|
| **UI/Logo/Emblemas** | Ilustración vectorial plana/heráldica, contornos oscuros, Sol de Mayo, laureles, bandera | Celeste, blanco, dorado, azul oscuro | WebP q85, transparencia donde aplique |
| **Fondos** | Ilustración realista pintada, amanecer/atardecer, arquitectura institucional argentina | Celeste, azul oscuro, dorado, crema | WebP q85, 1672×941 |
| **Eventos** | Fotografía/ilustración editorial realista, escena evocadora única | Celeste, dorado, azul oscuro | WebP q85, 1774×887 |
| **Personajes** | Ilustración vectorial realista, busto centrado, iluminación plana | Celeste, azul oscuro, dorado, tonos piel cálidos | WebP q85, 1254×1254 |
| **Iconos UI** | Vectorial plano/lineal, escudo hexagonal para categorías, escena plana para grupos | Celeste, blanco, azul oscuro, dorado | WebP q85, 1024×1024 fondo transparente |

---

## Resumen ejecutivo

| Categoría | Propuestas | Prioridad |
|-----------|------------|-----------|
| Iconos de grupos de interés | 15 | 🔴 Alta |
| Iconos de arquetipos | 3 | 🔴 Alta |
| Iconos de categorías | 3 | 🔴 Alta |
| Imágenes de eventos pendientes | 11 | 🟠 Media-alta |
| Elementos UI (marcos, sellos, medallas) | 10 | 🟠 Media |
| Fondos nuevos | 10 | 🟡 Media |
| Personajes/avatares adicionales | 14 | 🟡 Media |
| Gaps en componentes UI | 18 | 🟡 Media |
| **Total** | **84** | |

---

## 1. Iconos de grupos de interés (15) — 🔴 ALTA

**Problema**: 15 subgrupos de interés no tienen icono propio. Caen al fallback `Users` de Lucide en `InterestGroupsPanel` y `RightSidebar`.

**Estilo**: composición plana de escena, 1024×1024, fondo transparente, paleta celeste/dorado.

| # | Archivo | Descripción | Dónde se usa |
|---|---------|-------------|--------------|
| 1 | `group-financial.webp` | Edificio bancario, billete, gráfico ascendente | `sector-financiero` |
| 2 | `group-middle-class.webp` | Familia frente a casa, escudo estable | `clase-media` |
| 3 | `group-low-income.webp` | Manos recibiendo alimentos, vivienda social | `sectores-populares` |
| 4 | `group-upper-class.webp` | Torre de lujo, auto alta gama, dorado | `clase-alta` |
| 5 | `group-indigenous.webp` | Textiles originarios, territorio, sol | `minorias-etnicas` |
| 6 | `group-ngo.webp` | Manos entrelazadas, corazón, laureles | `ongs` |
| 7 | `group-environmentalists.webp` | Hoja verde, panel solar, planeta | `ambientalistas` |
| 8 | `group-feminists.webp` | Puño violeta/rosa, bandera, símbolo género | `feministas` |
| 9 | `group-students.webp` | Birrete, libro abierto, banderín | `estudiantiles` |
| 10 | `group-cooperatives.webp` | Manos con herramienta, trigo | `cooperativas` |
| 11 | `group-allies.webp` | Apretón de manos, banderas aliadas | `aliados` |
| 12 | `group-opposition.webp` | Tribuna opositora, desacuerdo | `opositores` |
| 13 | `group-artists.webp` | Paleta, pincel, máscara teatral | `artistas` |
| 14 | `group-athletes.webp` | Pelota, medalla, estadio | `deportistas` |
| 15 | `group-academics.webp` | Birrete, microscopio, átomo | `academicos` |

---

## 2. Iconos de arquetipos (3) — 🔴 ALTA

**Problema**: solo existen 2 iconos de arquetipo. `empresario` y `comunicador` reutilizan thumbnails de asesores; `sindicalista` reutiliza el nacionalista.

| # | Archivo | Descripción | Dónde |
|---|---------|-------------|-------|
| 1 | `archetype-business.webp` | Traje ejecutivo, maletín, edificios, gráfico | `empresario` |
| 2 | `archetype-communicator.webp` | Micrófono, ondas de sonido, cámara | `comunicador` |
| 3 | `archetype-union.webp` | Puño levantado, bandera, trabajadores | `sindicalista` |

---

## 3. Iconos de categorías (3) — 🔴 ALTA

**Problema**: `cultura`, `turismo` y `tecnologia` reutilizan iconos de otras categorías.

| # | Archivo | Descripción | Dónde |
|---|---------|-------------|-------|
| 1 | `category-culture.webp` | Escudo hexagonal con paleta, máscara teatral | `cultura` |
| 2 | `category-tourism.webp` | Escudo con avión, cataratas, sol | `turismo` |
| 3 | `category-technology.webp` | Escudo con chip, fibra óptica | `tecnologia` |

---

## 4. Imágenes de eventos pendientes (11) — 🟠 MEDIA-ALTA

**Problema**: los 12 eventos en `pendingEvents.ts` no tienen imagen propia. `getEventImage()` solo discrimina por categoría, no por evento.

**Estilo**: 1774×887, fotografía editorial realista, WebP q85.

| # | Evento | Archivo | Descripción visual |
|---|--------|---------|-------------------|
| 1 | `debt_default` | `event-debt-default.webp` | Billetes, documento sellado rojo, gráfico descendente |
| 2 | `energy_crisis` | `event-energy-crisis.webp` | Skyline nocturno con apagón parcial |
| 3 | `general_strike` | `event-general-strike.webp` | Multitud sindical en Plaza de Mayo |
| 4 | `heat_wave` | `event-heat-wave.webp` | Avenida con ondulaciones de calor |
| 5 | `diplomatic_conflict` | `event-diplomatic-conflict.webp` | Sala de negociación tensa |
| 6 | `external_sanctions` | `event-external-sanctions.webp` | Sello "SANCIONES" sobre fachada |
| 7 | `drought` | `event-drought.webp` | Campo agrietado, cultivos marchitos |
| 8 | `prison_riot` | `event-prison-riot.webp` | Perímetro carcelario nocturno |
| 9 | `drug_wave` | `event-drug-wave.webp` | Operativo policial nocturno |
| 10 | `police_violence_scandal` | `event-police-violence-scandal.webp` | Confrontación con celular grabando |
| 11 | `minister_resignation` | `event-minister-resignation.webp` | Despacho vacío con carta de renuncia |

**Nota técnica**: `flood` reutiliza `event-flood-emergency.webp` (ya existe). Además hay que extender `getEventImage` para aceptar `event.id`.

---

## 5. Elementos de UI (10) — 🟠 MEDIA

**Problema**: falta identidad propia para victoria/derrota/logros. La derrota reutiliza una foto de protesta; `official-frame.webp` está huérfano.

**Estilo**: vectorial/heráldico, celeste/dorado/azul oscuro.

| # | Archivo | Descripción | Dónde |
|---|---------|-------------|-------|
| 1 | `presidential-portrait-frame.webp` | Marco dorado tipo retrato oficial con centro transparente | GameHeader (avatar), CharacterCreation |
| 2 | `victory-banner.webp` | Banner horizontal con cinta celeste/dorada, laureles | GameOverModal, LegacyScreen (victoria) |
| 3 | `defeat-banner.webp` | Banner azul oscuro con columna quebrada | GameOverModal, LegacyScreen (derrota) |
| 4 | `approval-seal.webp` | Sello lacre "APROBADO" dorado/celeste | TurnSummaryModal, ObjectivesPanel |
| 5 | `crisis-seal.webp` | Sello lacre "CRISIS" rojo | TurnSummaryModal, GameOverModal |
| 6 | `mandate-badge-president.webp` | Insignia banda presidencial | GameHeader, WelcomeModal |
| 7 | `mandate-badge-governor.webp` | Insignia cúpula provincial | (futuro) |
| 8 | `mandate-badge-intendente.webp` | Insignia municipal | (futuro) |
| 9 | `achievement-medal-gold.webp` | Medalla dorada con cinta celeste | ObjectivesPanel, LegacyScreen |
| 10 | `achievement-medal-silver.webp` | Medalla plateada | ObjectivesPanel, LegacyScreen |

---

## 6. Fondos nuevos (10) — 🟡 MEDIA

**Problema**: todos los fondos actuales son exteriores/balcones. Faltan interiores institucionales y estados de clima/ánimo.

**Estilo**: 1672×941, ilustración realista pintada, cielo/espacio superior despejado.

| # | Archivo | Descripción | Dónde |
|---|---------|-------------|-------|
| 1 | `bg-cabinet-room.webp` | Sala de gabinete, mesa ovalada | AdvisorSelection, ManagementNotebook |
| 2 | `bg-congress-interior.webp` | Hemiciclo del Congreso | MidtermStrategyModal, ElectionResults |
| 3 | `bg-press-room.webp` | Sala de conferencias con atril | EventModal comunicación |
| 4 | `bg-presidential-office.webp` | Despacho presidencial | Dashboard, InformesPanel |
| 5 | `bg-government-night.webp` | Casa Rosada de noche | GameOverModal, LegacyScreen |
| 6 | `bg-rainy-city.webp` | Avenida institucional bajo lluvia | Eventos climáticos |
| 7 | `bg-protest-demonstration.webp` | Multitud frente a Plaza de Mayo | InterestGroupsPanel |
| 8 | `bg-campaign-rally.webp` | Acto de campaña | ReelectionChoiceModal |
| 9 | `bg-map-argentina.webp` | Mapa estilizado de Argentina | Resultados electorales |
| 10 | `bg-casa-rosada-morning.webp` | Casa Rosada a plena luz | Victoria, WelcomeModal |

---

## 7. Personajes/Avatares (14) — 🟡 MEDIA

**Problema**: faltan asesores masculinos (3 especialidades caen en retratos femeninos), faltan avatares de otros perfiles.

**Estilo**: 1254×1254, ilustración vectorial realista, busto centrado.

### Asesores masculinos (6)

| # | Archivo | Para especialidad |
|---|---------|-------------------|
| 1 | `advisor-infrastructure-male.webp` | Infraestructura |
| 2 | `advisor-foreign-male.webp` | Relaciones Internacionales |
| 3 | `advisor-education-male.webp` | Educación |
| 4 | `advisor-communication-male.webp` | Comunicación |
| 5 | `advisor-security-male.webp` | Seguridad |
| 6 | `advisor-social-male.webp` | Desarrollo Social |

### Avatares de personajes (6)

| # | Archivo | Perfil |
|---|---------|--------|
| 7 | `character-female-executive-1.webp` | Mujer ejecutiva 35-45 |
| 8 | `character-female-executive-2.webp` | Mujer ejecutiva 45-55 |
| 9 | `character-senior-leader.webp` | Líder senior 65-75 |
| 10 | `character-indigenous-leader.webp` | Líder originario |
| 11 | `character-youth-activist.webp` | Activista joven |
| 12 | `character-business-executive.webp` | Empresario |

### Asesores de especialidades nuevas (2)

| # | Archivo | Especialidad |
|---|---------|--------------|
| 13 | `advisor-health-female.webp` | Salud |
| 14 | `advisor-justice-male.webp` | Justicia |

---

## 8. Gaps en componentes UI (18) — 🟡 MEDIA

### Faltan piezas de diseño (7)

| # | Componente | Qué falta | Propuesta |
|---|-----------|-----------|-----------|
| 1 | `App.tsx` | Fondo de pantalla de juego plano | `game-bg-texture.webp` (textura sutil) |
| 2 | `WelcomeModal` | No muestra avatar del gobernante | Reutilizar `official-frame.webp` + avatar |
| 3 | `TurnSummaryModal` | Header con emblema cuadrado estirado | `turn-summary-header.webp` panorámico |
| 4 | `GameOverModal` | Victoria con emblema cuadrado | `victory-background.webp` panorámico |
| 5 | `LegacyScreen` | Header con emblema cuadrado | `legacy-victory.webp` / `legacy-defeat.webp` |
| 6 | `ReelectionChoiceModal` | Sin imagen de cabecera | `reelection-header.webp` (urna) |
| 7 | `MidtermStrategyModal` | Sin cabecera, iconos Lucide | `midterm-header.webp` + 4 iconos propios |

### Iconos Lucide/emoji genéricos (6)

| # | Componente | Qué falta | Propuesta |
|---|-----------|-----------|-----------|
| 8 | `RightSidebar` | Grupos usan Lucide | 9 iconos webp propios |
| 9 | `EventModal` | Categoría usa Lucide | Reutilizar webp de categorías existentes |
| 10 | `InterestGroupsPanel` | Fallback `Users` + tema claro | Iconos de grupo + migrar a tema oscuro |
| 11 | `SubgroupMoodBadge` | Emojis 😊🙁😠💀 | 5 iconos webp de moods |
| 12 | `App.tsx` | Botones con letras L/C placeholder | Iconos propios o Lucide |
| 13 | `CharacterCreation` | Doble icono + thumbnails prestados | Eliminar Lucide redundante + thumbnails propios |

### Estados vacíos sin ilustración (3)

| # | Componente | Propuesta |
|---|-----------|-----------|
| 14 | `ControlPanel` | `empty-actions.webp` |
| 15 | `AdvisorPanel` | `advisor-empty.webp` |
| 16 | `NotificationCenter` | `notifications-empty.webp` |

### Componentes legacy (2)

| # | Componente | Propuesta |
|---|-----------|-----------|
| 17 | `ObjectivesPanel`, `VotingIntentionPanel`, `PoliticalCalendarWidget` | Migrar a tema oscuro + headers |
| 18 | `GameLog` | `game-log-header.webp` textura legajo |

---

## Orden de implementación recomendado

### Fase 1 — Iconos que se ven en cada partida (🔴 Alta)
1. 3 iconos de arquetipos (empresario, comunicador, sindicalista)
2. 3 iconos de categorías (cultura, turismo, tecnología)
3. 15 iconos de grupos de interés

### Fase 2 — Imágenes para los eventos pendientes (🟠 Media-alta)
4. 11 imágenes de eventos (a medida que se activan los eventos)

### Fase 3 — Elementos UI de victoria/derrota (🟠 Media)
5. 10 elementos UI (marcos, banners, sellos, medallas)

### Fase 4 — Fondos interiores (🟡 Media)
6. 10 fondos nuevos

### Fase 5 — Personajes adicionales (🟡 Media)
7. 14 avatares/asesores

### Fase 6 — Gaps en componentes (🟡 Media)
8. 18 mejoras en componentes UI

---

## Reglas técnicas para nuevas piezas

1. **Formato**: WebP calidad 85. Originales PNG en `src/assets/images/raw/`.
2. **Registro**: cada pieza nueva debe registrarse en `src/utils/imageAssets.ts` y actualizar `src/assets/images/INVENTORY.md`.
3. **Thumbnails**: si el icono es 1024×1024, generar versión 128×128 en `icons/thumbnails/` (script `scripts/generate_thumbnails.py`).
4. **Transparencia**: iconos, sellos, marcos y medallas deben tener fondo transparente.
5. **Paleta**: celeste `hsl(210 50% 45%)`, dorado `hsl(42 70% 50%)`, azul oscuro `hsl(220 15% 8%)`.
