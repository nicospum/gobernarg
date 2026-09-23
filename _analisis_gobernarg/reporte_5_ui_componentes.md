# Reporte 5 — Análisis de UI y Componentes (GobernArg)

**Alcance:** `src/App.tsx`, `src/main.tsx`, `src/index.css`, los 27 componentes de `src/components/` (incl. `ui/progress.tsx`) y `src/utils/imageAssets.ts` + `src/utils/iconThumbnails.ts`.
**Stack verificado:** React 18.2 + TypeScript + Vite 7 + Tailwind 3.4 (tokens CSS) + Radix UI (Tooltip, Progress) + motion 13 + sonner 2 + embla-carousel + lucide-react.
**Fecha:** 2026-09-20 · Estado analizado: post-UI-dark (afeabb4), documentos 4.4.

---

## 1. Mapa de pantallas / flujo

El flujo está centralizado en `App.tsx` mediante **renderizado condicional por banderas de estado** (sin router):

```
WelcomeScreen ──onStart──▶ CharacterCreation ──onComplete──▶ WelcomeModal ──"Entendido"──▶
TABLERO PRINCIPAL (juego por turnos) ──Finalizar Turno──▶ [TurnSummaryModal | MidtermStrategyModal]
        │                                                            │ (pendienteElection?)
        │                                                            ▼
        │                                              ReelectionChoiceModal ──onSelect──▶
        │                                                            │ electionResults
        │                                                            ▼
        │                                              ElectionResultsModal (ganaste/perdiste)
        │                                                            │ gameOver
        │                                                            ▼
        │                          GameOverModal (derrota o victoria) + LegacyScreen (siempre al gameOver)
        │                                                            │ onRestart
        └────────────────────────────────────────────────────────────┴──▶ CharacterCreation
```

Detalles del orquestador (`App.tsx`, 324 líneas):

- **Estados locales:** `gameState` (única fuente de verdad del motor), `showWelcomeScreen`, `gameStarted`, `showWelcome`, `showTurnSummary`/`turnSummary`, `pendingEvents` (cola de eventos), `showMidtermStrategy`, `showGameLog`, `showNotebook`.
- **Ciclo de turno** (`handleEndTurn`): llama a `processEndTurn`, emite `toast()` de sonner, y decide modal según prioridad: `pendingMidtermStrategy` > `pendingElection`/`gameOver` (sin resumen) > `TurnSummaryModal`. Los eventos con choices se encolan en `pendingEvents` y se muestran **de a uno** (`EventModal` con el primero de la cola).
- **Pantallas de cierre:** cuando `gameOver`, se montan **dos overlays simultáneos**: `GameOverModal` (solo si `!victorious`) y `LegacyScreen` (siempre). Ambos con `z-50`, apilados en orden de declaración → el último (LegacyScreen) queda arriba y **oculta el GameOverModal en la práctica** (ver §6).
- Reinicio (`handleRestart`) solo resetea estado local; no resetea `showWelcomeScreen` (queda en creación de personaje).

---

## 2. Anatomía del tablero principal

Layout: `GameHeader` sticky (h-14) + `<main>` scrollable con altura calculada, en grid `lg:grid-cols-3` (2/3 izquierda, 1/3 derecha).

```
┌──────────────────────────────────────────────────────────────────────┐
│ GameHeader: logo · cargo+avatar · año/trimestre+progreso · acciones ·│
│             presupuesto · popularidad+tendencia · estabilidad ·      │
│             [Reiniciar] [Finalizar Turno]                            │
├──────────────────────────────────────────────────────────────────────┤
│ IndicatorsPanel (fila horizontal, full width)                        │
│  Popularidad │ Estabilidad │ Legitimidad │ Conflicto │ Voto │ Presup.│
├───────────────────────────────────────┬──────────────────────────────┤
│ ControlPanel ("Acciones Políticas")   │ RightSidebar (w-80)          │
│  · banner apoyo legislativo           │  · Situación Electoral       │
│  · tabs por categoría (iconos webp)   │  · Calendario Político (col.)│
│  · grid de ActionCards                │  · Noticias (colapsable)     │
│  · footer sumario selección           │  · Grupos de Interés         │
│ SpecialAbilitiesPanel (1 card o       │    (acordeón + interacciones)│
│  carrusel Embla)                      │                              │
│ PendingEffectsPanel (efectos cortos)  │ ActiveBenefits (banner verde)│
│ InformesPanel (efectos largos c/      │ Botones: Historial / Cuaderno│
│  milestones)                          │ AdvisorPanel (2 asesores)    │
│ NotificationCenter                    │                              │
└───────────────────────────────────────┴──────────────────────────────┘
+ overlays: TurnSummary · Event · ReelectionChoice · ElectionResults ·
  GameOver · Legacy · MidtermStrategy · GameLog · ManagementNotebook ·
  AdvisorSelection · AdvisorDismiss
```

**Qué muestra cada panel:**

| Panel | Ubicación | Contenido |
|---|---|---|
| `GameHeader` | top sticky | Identidad (logo + "GOBERN**ARG**" con ARG en dorado), cargo/avatar/año/trimestre con barra de progreso 16 turnos, acciones, presupuesto, popularidad con tendencia, estabilidad, CTA fin de turno |
| `IndicatorsPanel` | fila superior | 6 tarjetas con barra de riesgo + marcador de target: Popularidad, Estabilidad, Legitimidad, Conflicto Social (derivado), Intención de Voto, Presupuesto. Solo popularidad y presupuesto tienen chip de tendencia real; el resto la muestra como `null` |
| `ControlPanel` | col. izq. | Tabs de categorías (10, con mini-iconos webp), banner de apoyo legislativo (4 niveles), grid de `ActionCard`, footer con impacto acumulado de selección |
| `RightSidebar` | col. der. | 4 secciones: Situación Electoral (voto, riesgo, top 3 a favor/en contra), Calendario Político (próximos 4 hitos con color por severidad), Noticias (5 últimas no descartadas), Grupos de Interés (acordeón con relación, ánimo, demandas y 3 botones de interacción con cooldown) |
| `SpecialAbilitiesPanel` | col. izq. | Habilidad del arquetipo: costos, efectos, cooldown con barra. Preparado para carrusel Embla cuando hay >1 |
| `PendingEffectsPanel` / `InformesPanel` | col. izq. | Efectos cortos (urgentes vs. en curso) y efectos largos con barra de progreso y milestones por turno |
| `NotificationCenter` | col. izq. | Lista de notificaciones con icono/borde por importancia, marcar leídas, descartar |
| `ActiveBenefits` | col. der. | Banner verde de beneficios activos (modificadores de ingreso/costo) con turnos restantes |
| `AdvisorPanel` | col. der. | Hasta 2 asesores con retrato, nivel, influencia, bonos; modales de contratación/despido |

---

## 3. Arquitectura de componentes

### 3.1 Pasaje de estado
- **Patrón único:** `App` posee `gameState` y funciones del `engine/gameEngine` (puras: `toggleActionSelection`, `applyInteraction`, `processEndTurn`, etc.). Se los reparte por **props drilling** de `gameState` completo + callbacks. ~10 componentes reciben el objeto `GameState` entero.
- No hay Context, Zustand ni Redux: cada acción del jugador es `setGameState(prev => engineFn(prev, ...))`.
- `handleCloseElectionResults` muta el estado inline (`{ ...prev, electionResults: null }`) rompiendo la convención de pasar por el engine.
- `handleSatisfyDemand` envuelve en try/catch aunque `satisfyGroupDemand` es llamada dentro del updater (el catch no captura errores del updater de React).

### 3.2 Catálogo de componentes

| Componente | Líneas | Responsabilidad | Disparo |
|---|---|---|---|
| `WelcomeScreen` | 37 | Portada: fondo Congreso + logo wide + CTA | inicio |
| `CharacterCreation` | 174 | Nombre (validación), 4 arquetipos con tooltip de pasivas, 16 avatares webp; `position` hardcodeado a `'presidente'` | tras portada |
| `WelcomeModal` | 79 | Overlay felicitación con fondo según cargo | tras crear personaje |
| `GameHeader` | 217 | Barra superior con KPIs y CTA fin de turno | siempre en juego |
| `IndicatorsPanel` | 322 | 6 tarjetas de indicadores con riesgo/tendencia/tooltip | siempre |
| `ControlPanel` | 166 | Tabs de categorías + grid de acciones + footer | siempre |
| `ActionCard` | 281 | Tarjeta de acción: badges REC/BLQ/BON, costos, efectos, riesgo, tooltip de grupos afectados | dentro de ControlPanel |
| `SpecialAbilitiesPanel` | 318 | Habilidad de arquetipo (card o carrusel Embla) | siempre |
| `RightSidebar` | 520 | Sidebar con 4 sub-secciones (ver §2) | siempre |
| `PendingEffectsPanel` | 119 | Efectos cortos urgentes/en curso | si hay efectos |
| `InformesPanel` | 130 | Informes largos con milestones | si hay informes |
| `NotificationCenter` | 122 | Feed de notificaciones con importancia | siempre |
| `ActiveBenefits` | 62 | Banner de beneficios económicos activos | si hay beneficios |
| `AdvisorPanel` | 155 | Lista de asesores + modales contratar/despedir | siempre |
| `AdvisorSelectionModal` | 192 | Grid de candidatos con costo total | desde AdvisorPanel |
| `AdvisorDismissModal` | 86 | Selección de asesor a despedir | desde AdvisorPanel |
| `TurnSummaryModal` | 168 | Resumen trimestral (único con animación motion) | post turno |
| `EventModal` | 272 | Evento con imagen, severidad, choices con badges de efecto y barra de probabilidad | al finalizar turno (cola) |
| `MidtermStrategyModal` | 195 | 4 estrategias post-legislativas con riesgo y efectos | `pendingMidtermStrategy` |
| `ReelectionChoiceModal` | 96 | Opciones de carrera post-mandato con proyección | `pendingElection` |
| `ElectionResultsModal` | 154 | Resultado electoral con desglose por peso (tooltips) | `electionResults` |
| `GameOverModal` | 115 | Fin de juego por causa (6 iconos) con consejo | `gameOver && !victorious` |
| `LegacyScreen` | 301 | Rating /10, narrativa, stats, 3 ejes ideológicos, obras y crisis | `gameOver` |
| `GameLog` | 76 | Timeline del `turnLog` | botón "Historial" |
| `ManagementNotebook` | 424 | Cuaderno: compromisos, efectos diferidos, historial reciente | botón "Cuaderno" |
| `ErrorBoundary` | 64 | Clase, captura errores y ofrece reload | raíz |
| `Tooltip` / `InfoTooltip` | 60 / 34 | Dos sistemas de tooltip distintos (ver §3.3) | varios |
| `AxisBar` | 50 | Barra de eje ideológico -100..+100 | LegacyScreen |
| `ui/progress` | 24 | Wrapper Radix Progress con `indicatorClassName` | EventModal |

### 3.3 Modales
Hay **11 modales/overlays**, todos implementados como `fixed inset-0 z-50` hand-rolled (mismo patrón repetido, sin componente Modal base): WelcomeModal, TurnSummary, Event, ReelectionChoice, ElectionResults, GameOver, Legacy, MidtermStrategy, GameLog, ManagementNotebook, AdvisorSelection, AdvisorDismiss.

### 3.4 Notificaciones (sonner)
- `<Toaster theme="dark" position="bottom-right">` único en App.
- Sonner se usa **mínimamente**: un solo `toast()` al finalizar turno. El sistema de notificaciones real vive en `gameState.notifications` (`NotificationCenter` + `NewsPanel` del sidebar), no integrado con sonner → dos sistemas de notificación paralelos sin unificar.

### 3.5 Tooltips — doble sistema
1. **`InfoTooltip`** (Radix `@radix-ui/react-tooltip`): accesible (Provider/Root/Portal), delay 300ms, animaciones `tailwindcss-animate`. Usado en indicadores, ActionCards y arquetipos.
2. **`Tooltip`** (custom con `group-hover`): CSS puro, sin accesibilidad (no keyboard/focus), estilos hardcodeados `bg-slate-800`. Usado en badges de ActionCard y desglose electoral.

Ambos conviven; el custom duplica lo que Radix ya resuelve.

### 3.6 Assets visuales
- **`imageAssets.ts`:** registro centralizado `IMAGES` con ~90 imports webp explícitos (logo, 18 fondos, 15 personajes, 19 asesores, 18 eventos, UI, iconos) + helpers `getEventImage`, `getAdvisorPortrait`, `getPositionBackground`, `CATEGORY_ICONS`.
- **`iconThumbnails.ts`:** segunda vía vía `import.meta.glob` (eager) con fallback a string vacío — duplica parcialmente `imageAssets` (`THUMBNAIL_CATEGORIES` vs `CATEGORY_ICONS` contienen el mismo mapeo) y refencia ~18 archivos webp de grupos que en `imageAssets` solo se importan 5 (riesgo de `''` silencioso si falta el archivo).
- Imágenes con `loading="lazy" decoding="async"` en modales; los fondos CSS se cargan inline por `style`.

---

## 4. Evaluación visual / UX

### 4.1 Tema y paleta (UI dark)
- Tokens HSL en `:root` y `.dark` (idénticos → dark único, sin modo claro real).
- Fondo `220 15% 8%` (azul pizarra muy oscuro), cards `220 16% 12%`, foreground `217 25% 92%`.
- **"Paleta menos azul":** el primary bajó a `210 50% 45%` (azul medio apagado); el acento dorado `42 70% 50%` (ámbar) es el color de marca en CTA principales, logo ("GOBERN**ARG**"), trimestre y victorias → la "G dorada" del favicon se traduce en `accent` dorado/ámbar como color de énfasis. Destructivo rojo `348 65% 40%`.
- Semántica consistente: verde=positivo, rojo=crítico/riesgo, ámbar=advertencia, celeste=info — aplicada en indicadores, noticias, eventos, estrategias.

### 4.2 Tipografía
- Inter (sans), **Barlow Condensed** (`font-display`, títulos en mayúsculas con tracking amplio, rasgo "institucional/político") y JetBrains Mono (valores numéricos, chips de tendencia). Sistema tipográfico claro y bien aplicado.

### 4.3 Imágenes propias
- Toda la identidad visual es de assets **webp propios** (generados): fondos fotográficos institucionales (Casa Rosada, Congreso), 16 retratos de avatar, 19 retratos de asesores, 18 ilustraciones de eventos, logo y escudos. Nivel de acabado alto para un proyecto indie; los modales de evento/resumen/legado usan imagen de cabecera con degradado hacia `card` (patrón "hero" coherente).

### 4.4 Motion
- **Uso muy acotado:** `motion/react` solo en `TurnSummaryModal` (fade+scale de entrada). Resto: transiciones CSS (`transition-all duration-150/300/500`), `animate-pulse` en milestones, clases `animate-in/fade-in` de tailwindcss-animate en el Radix tooltip. Para una dependencia "motion" declarada, se aprovecha ~1%. Embla solo se activaría si un arquetipo tuviera >1 habilidad (hoy 1).

### 4.5 Calidad general de UI
- Densidad de información bien resuelta: chips, barras de riesgo con target, tooltips explicativos en cada indicador y en el desglose electoral (pesos 35/25/15/5).
- Estados vacíos contemplados (sin noticias, sin asesores, sin efectos, sin eventos).
- Feedback continuo: badges REC/BLQ/BON en acciones, banner legislativo, tendencias +/−.
- Responsive razonable (grid colapsa a 1 col., header oculta KPIs por breakpoint), aunque el tablero claramente apunta a desktop.

---

## 5. Problemas de UX / arquitectura detectados

1. **GameOverModal y LegacyScreen se montan juntos** (`gameOver`): dos overlays `z-50` apilados; LegacyScreen (declarado después) tapa al GameOverModal. En derrota, el usuario nunca ve el modal de derrota hasta que LegacyScreen se cierre — y LegacyScreen **no tiene botón de cierre**, solo "Jugar de nuevo" → el jugador derrotado no puede leer su causa de derrota ni el consejo. Bug UX real.
2. **Props drilling severo:** `gameState` completo atraviesa ~10 niveles de componentes; `App.tsx` concentra 15 handlers. Cualquier feature nueva agranda el orquestador. Falta un store (Zustand/Context) o selectors.
3. **RightSidebar (520 líneas) es un "god component":** 4 secciones + helpers inline (flatten, colores, severidades). Debería dividirse en archivos.
4. **Duplicación de sistemas:** dos tooltip systems (Radix vs. custom CSS), dos catálogos de imágenes (`imageAssets` vs `iconThumbnails`), dos presentaciones de notificaciones (sonner vs NotificationCenter/NewsPanel), dos vistas del historial (GameLog vs. sección Historial del Cuaderno), y PendingEffects/Informes/ActiveBenefits/Cuaderno-Efectos muestran los mismos `pendingEffects` desde 4 ángulos distintos.
5. **Modales hand-rolled repetidos:** el patrón `fixed inset-0 bg-black/70 backdrop-blur z-50` se copió 12 veces sin componente base (foco, Escape, scroll-lock y ARIA quedan a cargo de cada uno; la mayoría no los implementa). GameLog y Cuaderno usan `&times;` con `text-xl` en vez de icono/botón accesible.
6. **Estilos legacy residuales:** `AxisBar` usa claro (`text-gray-500`, `bg-gray-200`) — al estar dentro de un modal oscuro hereda mal y rompe el tema; `AdvisorSelectionModal` usa `bg-gray-100`; `ErrorBoundary` usa `bg-slate-900`/`bg-white`/`bg-blue-600` hardcodeados; `NotificationCenter` usa `bg-red-500` en vez del token destructive.
7. **Position hardcodeado:** `CharacterCreation` fija `position: 'presidente'` — la UI presenta 3 cargos en header/modales pero no se puede elegir (código muerto de intendente/gobernador en UI).
8. **Tendencias ficticias parciales:** `IndicatorsPanel` arma `trends` con `null` para estabilidad/legitimidad/conflicto/voto "para cuando haya historial" — el chip siempre muestra "—"; o se implementa historia o se limpia.
9. **Derivaciones en capa de presentación:** `deriveConflictoSocial` (IndicatorsPanel), `derivePerformance` (LegacyScreen), `flattenSubgroups` y cálculos electorales (RightSidebar) son lógica de dominio viviendo en componentes → difícil de testear y duplicable.
10. **Re-export raros:** `GameHeader` re-exporta `Users` "por compat"; `IndicatorsPanel` re-exporta el tipo `Risk`. Muestra de deuda acumulada.
11. **Animación infrautilizada:** `motion` instalado pero con 1 uso; entrada/salida de modales y montaje de paneles quedan sin transición → sensación rígida comparada con el resto del acabado.
12. Minor: botones inline en App (Historial/Cuaderno) con letras "L"/"C" en vez de iconos lucide (inconsistencia con el resto de la UI iconográfica); `handleCloseElectionResults` muta estado fuera del engine; el `try/catch` de `handleSatisfyDemand` no captura errores del updater.

---

## 6. Conclusión

La UI de GobernArg muestra un **rediseño visual serio y cohesionado**: tema dark con acento dorado propio, assets webp generados en cantidad y calidad, lenguaje de diseño institucional (Barlow Condensed, mayúsculas, chips, barras de riesgo con targets) y tooltips explicativos que enseñan la simulación. Los puntos débiles no son estéticos sino **estructurales**: orquestador sobrecargado con props drilling, god components (RightSidebar, ManagementNotebook), duplicación de subsistemas (tooltips, notificaciones, catálogo de imágenes, vistas de efectos/historial), 12 modales sin abstracción ni accesibilidad, un bug de apilamiento GameOver/Legacy, y restos de tema claro sueltos. La inversión con mayor retorno sería: (a) extraer un `Modal` base y un store de UI, (b) unificar tooltip + assets + notificaciones, (c) pulir la cadencia de motion en modales y montaje de paneles.
