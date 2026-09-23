# Reporte 1 — Historia del repositorio GobernArg V2

**Repositorio:** `C:\Users\User\Desktop\spum\gobernargV2-azul` · **Rama:** `rediseno-visual`
**Alcance:** 60 commits · 2026-06-23 → 2026-08-20 (58 días calendario, actividad en 7 días)
**Autores:** Nicolas <nicolas.spaccaviento@gmail.com> (31 commits, junio) y nicospum <nicospum@users.noreply.github.com> (29 commits, agosto) — misma persona, dos identidades git.
**Código analizado:** `project-bolt-sb1-dzgqso GobernArg 21-11/project` (React + TypeScript + Vite + Tailwind + Vitest)

---

## 1. Línea de tiempo cronológica por eras

```
2026-06-23  ██ Era 1 — MADURACIÓN DEL MOTOR (26 commits en 1 día)
            05:00 baseline → Fases 1-4 de mecánicas → Sprints 1-6 motor↔UI → fixes críticos
2026-06-24  ██ Era 2 — REDISEÑO VISUAL (3 commits)
            11:46 refs Figma → 17:43 Fases 0-6 → 18:05 Fase 7 (bug turno trabado)
2026-06-25  ▒▒ Era 2 (cierre) — referencias Figma (2 commits)
   ...      (hiato de 51 días sin commits)
2026-08-16  ██ Era 3 — REFACTOR Y FUNDAMENTOS AGOSTO (6 commits)
            08:20 modularización engine → 09:49 0 errores TS + 63 tests
2026-08-17  ██ Era 4 — PULIDO DE DISEÑO Y MVP (5 commits)
            concesiones limitadas → MVP solo presidente → economía de acciones
2026-08-19  ██ Era 5 — ASSETS + AUDITORÍA + OPTIMIZACIÓN (16 commits, maratón)
            04-05h piezas SVG → 10h integración 66 assets → 13h 12 eventos
            23h auditoría (119 hallazgos) → FASES 1-4 de optimización
2026-08-20  ▒▒ Era 5 (cierre) — docs al estado real (00:58)
```

**Hash clave por era:**

| Era | Hash | Fecha | Hitos |
|---|---|---|---|
| 1 | `177f7a5` | 06-23 05:00 | Initial commit (baseline 15.295 líneas, 257 archivos) |
| 1 | `6a92b68` | 06-23 06:40 | Fase 4: legitimidad, ejes, agendas de grupos, 4 dificultades, 5 derrotas |
| 1 | `4192cf9` | 06-23 16:36 | Sprint 5+6: GameLog + doc de mecánicas (cierra 6 sprints) |
| 2 | `1eed891` | 06-24 17:43 | Fases 0-6 rediseño: design system dark Figma, reskin completo |
| 2 | `91915f8` | 06-24 18:05 | Fase 7: fix bug turno trabado |
| 3 | `f9b3525` | 08-16 08:20 | Modularización: 7 módulos engine, 58 acciones, primeros tests |
| 3 | `c9f18a3` | 08-16 09:49 | 0 errores TS + 63 tests (antes 10) |
| 4 | `49182b2` | 08-17 10:04 | MVP solo presidente |
| 4 | `45f9f8e` | 08-17 11:27 | Economía de acciones + anti-inacción electoral |
| 5 | `daf0bd2` | 08-19 10:36 | 66 assets visuales integrados |
| 5 | `2bce319` | 08-19 13:04 | Los 12 eventos pendientes activados |
| 5 | `d00189a` | 08-19 23:03 | Auditoría: 119 hallazgos (4 críticos, 26 altos) |
| 5 | `0160294`→`1e3793e` | 08-19/20 | FASES 1, 2, 3+3.4 y 4 de optimización |
| 5 | `14d5810` | 08-20 00:58 | Docs sincronizadas al estado real |

---

## 2. Tabla de commits agrupados por etapa

### Era 1 — Maduración del motor (2026-06-23, 26 commits)

| Hash | Hora | Tipo | Mensaje |
|---|---|---|---|
| `177f7a5` | 05:00 | — | Initial commit: GobernArg V2 project baseline |
| `335fdd5` | 05:42 | docs | 7 mecánicas nuevas al análisis de dificultad |
| `7739e99` | 06:18 | docs | Planes Fases 1-4 |
| `b20d483` | 06:25 | feat | Fase 1 — Balance y diferenciación por cargo |
| `fb8e656` | 06:31 | feat | Fase 2 — Las decisiones tienen memoria |
| `754fec7` | 06:35 | feat | Fase 3 — Gobernar es elegir qué perder |
| `6a92b68` | 06:40 | feat | Fase 4 — El poder se gasta (legitimidad, ejes, agendas, dificultades, derrotas) |
| `9c883a7` | 07:10 | fix | 3 bugs críticos |
| `5015f3c` | 10:37 | docs | Resumen de sesión |
| `c574c46` | 11:29 | docs | Plan motor↔UI en 4 sprints |
| `458b840` | 11:30 | feat | Sprint 1 — Panel de habilidades especiales |
| `0dc0094` | 11:33 | feat | Sprint 2 — Razón de derrota y ejes contradictorios |
| `4509d36` | 11:34 | feat | Sprint 3 — Agendas de grupos de interés |
| `166e3c2` | 11:37 | feat | Sprint 4 — Estrategias post-legislativas |
| `8cb6750` | 13:02 | fix | 6 bugs críticos (inmutabilidad, derrota prematura, reset de mandato) |
| `340fe42` | 16:29 | feat | Sprint 1 — Tooltips y claridad visual |
| `ba85ae0` | 16:32 | feat | Sprint 2 — Efectos diferidos y recompensas estratégicas |
| `0758503` | 16:34 | feat | Sprint 3 — Profundización de interacciones con grupos |
| `8b56f1b` | 16:34 | feat | Sprint 4 — Arquetipos, ejes y contenido |
| `4192cf9` | 16:36 | feat | Sprint 5+6 — GameLog, documentación y balance final |
| `cf16bf3` | 16:46 | fix | Blindaje defensivo en satisfyGroupDemand |
| `9ebb484` | 16:50 | fix | 'Assignment to constant variable' |
| `4b07c82` | 17:48 | docs | Capturas de referencia |
| `cb3f034` | 17:48 | docs | Resumen post-Fase 2 |
| `d1fb317` | 20:13 | fix | Header: reiniciar/finalizar turno |
| `572aeee` | 20:15 | fix | Import faltante SpecialAbilitiesPanel |

### Era 2 — Rediseño visual (2026-06-24/25, 5 commits)

| Hash | Fecha/hora | Tipo | Mensaje |
|---|---|---|---|
| `4ef3538` | 06-24 11:46 | docs | Referencias del rediseño (Figma Make export) |
| `1eed891` | 06-24 17:43 | feat | Fases 0-5 + Fase 6 parcial del rediseño visual |
| `91915f8` | 06-24 18:05 | feat | Fase 6 (modales/pre-juego/Legacy) + Fase 7 (bug turno trabado) |
| `bebe6f5` | 06-25 07:25 | docs | Referencias segundo Figma |
| `8ddb630` | 06-25 07:27 | chore | Instalador WezTerm a referencias |

### Era 3 — Refactor y fundamentos (2026-08-16, 6 commits)

| Hash | Hora | Tipo | Mensaje |
|---|---|---|---|
| `f9b3525` | 08:20 | refactor | Modularizar engine y completar rediseño integral |
| `ff1cd0e` | 08:24 | feat | Iconos webp propios en categorías (Fase 1 visual) |
| `067c8a2` | 08:34 | fix | Crash en historial + layout compacto |
| `c0e4b1e` | 08:39 | refactor | Ocultar perfil ideológico + paleta neutra |
| `a1fde95` | 08:56 | feat | Balance + dashboard Fase 2 + fix bugs |
| `c9f18a3` | 09:49 | fix | 0 errores TypeScript + 63 tests (antes 10) |

### Era 4 — Pulido de diseño y MVP (2026-08-17, 5 commits)

| Hash | Hora | Tipo | Mensaje |
|---|---|---|---|
| `64941fe` | 08:50 | feat | Pulido inicial: concesiones limitadas + encadenamiento |
| `594ef35` | 09:16 | fix | Demandas de grupos como eventos raros |
| `6a1c127` | 09:33 | feat | Impacto cruzado en satisfacción (trade-offs) |
| `49182b2` | 10:04 | refactor | MVP solo presidente |
| `45f9f8e` | 11:27 | feat | Economía de acciones + rebalanceo electoral anti-inacción |

### Era 5 — Assets, auditoría y optimización (2026-08-19/20, 18 commits)

| Hash | Fecha/hora | Tipo | Mensaje |
|---|---|---|---|
| `2acf80f` | 08-19 04:25 | fix | Favicon SVG propio (G dorada) |
| `bce60ab` | 08-19 04:55 | feat | Limitador global de eventos aleatorios |
| `f1322b7` | 08-19 05:02 | docs | Propuesta de 84 piezas de diseño |
| `1386b7c` | 08-19 05:18 | feat | 31 piezas SVG + galería + doc piezas IA |
| `d6635e6` | 08-19 05:36 | feat | Versión 2 de piezas SVG (minimalistas) |
| `d2e8604` | 08-19 05:42 | docs | Listado maestro de piezas |
| `daf0bd2` | 08-19 10:36 | feat | Integrar 66 nuevos assets visuales |
| `35e4899` | 08-19 10:56 | feat | Activar 3 eventos nuevos con imágenes |
| `2bce319` | 08-19 13:04 | feat | Activar TODOS los 12 eventos pendientes |
| `0441a48` | 08-19 23:00 | docs | Plan de optimización integral verificado |
| `79adab2` | 08-19 23:00 | chore | Quitar tsbuildinfo del repo |
| `d00189a` | 08-19 23:03 | docs | Informe completo de auditoría (518 líneas) |
| `0160294` | 08-19 23:16 | fix | FASE 1 — bugs críticos verificados |
| `afeabb4` | 08-19 23:24 | feat | FASE 2 — mutaciones React, pasivas, dificultad, UI dark, registry |
| `2a2ada3` | 08-19 23:25 | fix | FASE 2.7 — fórmula de intención de voto unificada |
| `b3ba398` | 08-19 23:34 | feat | FASE 3 — datos, dead code, UI, engine, tests |
| `1e3793e` | 08-20 00:06 | feat | FASE 3.4 + FASE 4 completas |
| `14d5810` | 08-20 00:58 | docs | Actualizar 7 documentos al estado real |

---

## 3. Qué se hizo en cada etapa (en detalle)

### Era 1 — Maduración del motor de juego (23-jun)

El baseline (`177f7a5`) ya traía el proyecto Bolt completo: 257 archivos, 15.295 líneas, con utils sueltas (electionSystem, victoryConditions, popularityCalculator, turnManager…), posiciones intendente/gobernador/presidente y assets iniciales.

Sobre ese base, en ~11 horas se ejecutaron 4 fases de mecánica + 2 planes de 4-6 sprints:

- **Fase 1** (`b20d483`): balance y diferenciación por cargo.
- **Fase 2** (`fb8e656`): "las decisiones tienen memoria" — efectos diferidos.
- **Fase 3** (`754fec7`): "gobernar es elegir qué perder" — trade-offs.
- **Fase 4** (`6a92b68`, el más grande de la era, +467/-12): sistema de **legitimidad como recurso** (si llega a 0 las acciones cuestan ×2), **ejes ideológicos contradictorios** (radical↔conciliador, populista↔técnico, cerrado↔convocante), **grupos con agendas** (demandas con deadline, estados de ánimo contento→radicalizado), **4 dificultades** (Easy/Normal/Hard/Legend), **5 vías de derrota** (popularidad baja, déficit, impeachment, golpe, hiperinflación) y **4 habilidades de arquetipos**. Creó los módulos `difficultyEngine`, `legitimacyEngine`, `axisEngine`, `groupAgendaEngine`, `specialAbilities`.
- **Sprints motor↔UI**: panel de habilidades especiales, razón de derrota, agendas visibles, estrategias post-legislativas; luego tooltips, efectos diferidos en UI, interacciones con grupos, arquetipos/ejes, GameLog y documentación de mecánicas.
- **Fixes críticos del día**: `8cb6750` arregló 6 bugs (inmutabilidad de estado, derrota prematura, reset de mandato); `cf16bf3`/`9ebb484` blindaron `satisfyGroupDemand` contra crashes y asignación a constante.

### Era 2 — Rediseño visual integral (24/25-jun)

Con referencias exportadas desde Figma (`4ef3538`), `1eed891` reskineó toda la app en **~7 horas de trabajo distribuidas en un commit gigante**:

- **Fase 0 — design system**: paleta dark con CSS vars HSL (`--background #0B1829`, `--card #112240`, `--primary #1B64C8`, `--accent` dorado `#C9A32A`), fuentes Inter + Barlow Condensed + JetBrains Mono, primitivos shadcn manuales (card, badge, button, tooltip, progress).
- **Fase 1**: TopBar compacto (`GameHeader` reescrito) + `IndicatorsPanel` horizontal con 5 indicadores, sistema de riesgo bajo/crítico (`lib/risk.ts`) y helpers de formato (`lib/format.ts`).
- **Fase 2**: `ActionCard` reescrito con badges REC/BLQ/BON y `ControlPanel` con tabs por categoría.
- **Fases 3-5**: paneles de efectos con paleta semántica por tipo.
- **Fase 6** (`91915f8`): reskin de los 8 modales/pantallas (TurnSummary, Event, Reelection, ElectionResults, GameOver, Midterm, Welcome, CharacterCreation, Legacy + nuevo bloque "Performance Summary" con rating /10). **Fase 7**: fix del bug del turno trabado — `canEndTurn` ya no exigía acciones > 0, lo que bloqueaba la partida al gastar todo.

### Era 3 — Refactor y fundamentos (16-ago)

Tras 51 días sin commits, retorno con refactor profundo:

- `f9b3525`: el engine monolítico se partió en **7 módulos** (`actionEngine`, `archetypeEngine`, `electionEngine`, `eventResolver`, `narrativeEngine`, `turnProcessor`, `engineShared`), se eliminaron 5 utils legacy, `actionRegistry.ts` unificó **58 acciones**, aparecieron `InfoTooltip` y `ManagementNotebook`, y se montó la suite **Vitest** (10 tests). También fixeó `emitir_dinero`, hizo ganables las elecciones y activó las derrotas.
- `c9f18a3`: calidad — **0 errores de TypeScript** (de una deuda grande) y **63 tests** (de 10), con suites nuevas para axisEngine, interactionCosts, careerRules, engineShared, archetypeEngine y turnProcessor.

### Era 4 — Pulido de diseño de reglas y foco MVP (17-ago)

Día enteramente de *game design* con test-driven:

- `64941fe`: concesiones limitadas (máx 4/mandato, requieren reunión o negociación previa), **costo cruzado** (conceder baja el apoyo de los demás grupos), diferenciación reunión +2 / negociar +4 / conceder +15, y **encadenamiento**: 6 acciones de alto impacto requieren prerequisites (p. ej. `energia_renovable` exige `estudio_factibilidad`).
- `594ef35`: las demandas de grupos pasan a ser eventos raros (anti-spam).
- `6a1c127`: impacto cruzado en satisfacción — satisfacer a un grupo puede molestar a otros (trade-offs).
- `49182b2`: **MVP solo presidente** — se ocultan los selectores de modo y cargo, se elimina `AdminDebugPanel`, estado inicial forzado a presidente con budget 3500. Se preservan tipos/constantes para reincorporar roles.
- `45f9f8e`: **economía de acciones** (satisfacer demandas cuesta 1 acción) y **rebalanceo electoral anti-inacción**: nuevo peso ACTIVITY 0.15 que mide acciones ejecutadas vs. 16 esperadas por término; ya no se gana pasivamente con 90%+ de votos.

### Era 5 — Assets, auditoría y optimización (19/20-ago)

La era más densa (18 commits en 21 horas), con dos sub-etapas:

**A. Identidad visual y contenido (04-13h):**
- `bce60ab`: limitador global de eventos (cooldown 3 turnos, máx 5 por mandato).
- `1386b7c`/`d6635e6`/`d2e8604`: 31 piezas SVG vectoriales propias (iconos de arquetipos, categorías, grupos, marcos, sellos, medallas) en 2 versiones + galería + documento con prompts para generar 35 piezas más con IA.
- `daf0bd2`: integración de **66 assets** (21 iconos, 11 imágenes de eventos, 10 fondos institucionales, 8 asesores, 6 personajes) con registry central `gameAssets.ts` y mapeos `getEventImage`/`getAdvisorPortrait`. Commit de ~200 MB con 11 zips de assets.
- `2bce319`: activación de los **12 eventos pendientes** (policía, renuncia de ministro, default, crisis energética, paro general, motín carcelario, narcotráfico, conflicto diplomático, sanciones, olas de calor, sequía, inundación).

**B. Auditoría masiva y optimización por fases (23h-01h, maratón nocturno):**
- `d00189a`: auditoría con **6 revisores + 5 verificadores independientes** documentada en 518 líneas: **119 hallazgos** (4 críticos, 26 altos, 50 medios, 39 bajos).
- **FASE 1** (`0160294`): fix del **bug sistémico de turnos cíclicos** que rompía 6 mecánicas (demandas, concesiones, negociaciones, cooldowns, incomeModifier) — unificación en `getGlobalTurn`; fix de **victoria imposible** (los objetivos leían `find().support` en vez de `groupRelations[groupId]`); fix de **17 efectos de eventos ignorados**; toolchain reparado (vite 5→7, eslint).
- **FASE 2** (`afeabb4`/`2a2ada3`): corrección de **mutaciones React** que duplicaban efectos en dev (clonado de 8 estructuras anidadas), **pasivas de arquetipo conectadas** de verdad (retención electoral, acciones extra del sindicalista, interacciones gratis, bono de reunión ×1.1), **dificultad conectada** (multiplicadores de crisis, préstamos e ingresos), migración de 4 componentes a tema dark, y **unificación de la fórmula de intención de voto** que mostraba valores distintos en panel vs. elecciones.
- **FASE 3** (`b3ba398`): balance de datos, **eliminación de dead code** (~530 líneas borradas: advisorEffects, lib/icons, gameAssets viejo, systems/types, funciones fantasma), 108 tests.
- **FASE 3.4+4** (`1e3793e`): se eliminaron 7 componentes legacy muertos, se agregaron toasts (sonner) y animaciones (motion), y **75 tests nuevos** → **183 tests pasando, tsc 0 errores, build OK**.
- `14d5810`: sincronización de 7 documentos (session-summary, mecánicas, roadmap, plan-optimización…) al estado real.

---

## 4. Estadísticas

### Commits por tipo (prefijo del mensaje)

| Tipo | Cantidad | % |
|---|---|---|
| feat | 29 (27 + 2 feat(rediseno)) | 48,3% |
| docs | 13 | 21,7% |
| fix | 12 | 20,0% |
| refactor | 3 | 5,0% |
| chore | 2 | 3,3% |
| initial | 1 | 1,7% |

### Commits por día y hora

- **Por día:** 26 (23-jun) · 3 (24-jun) · 2 (25-jun) · 6 (16-ago) · 5 (17-ago) · 16 (19-ago) · 2 (20-ago). Actividad en solo 7 días con hiato de 51 días.
- **Por franja horaria:** trabajo matutino intenso (05-11h: 33 commits) y picos de tarde (16-18h: 12). **Maratón nocturno evidente el 19-ago**: 8 commits entre 23:00 y 00:58 (Fases 1-4 de optimización), más 6 commits entre 04:25 y 05:42 (piezas SVG). El último commit es 00:58 del 20-ago.
- **Ritmo medio:** dentro de los días activos, ~8,6 commits/día; en sesiones maratónicas hasta 26 commits/día.

### Archivos más tocados (top 10)

| Archivo | Commits tocados |
|---|---|
| `src/engine/gameEngine.ts` | 25 |
| `src/App.tsx` | 18 |
| `src/types/game.ts` | 14 |
| `src/utils/actionEffects.ts` | 9 |
| `src/data/actionCategories.ts` | 8 |
| `src/components/IndicatorsPanel.tsx` | 8 |
| `src/utils/electionSystem.ts` | 7 |
| `src/engine/turnProcessor.ts` | 7 |
| `src/engine/groupAgendaEngine.ts` | 7 |
| `src/engine/electionEngine.ts` | 7 |

**Patrón claro:** el corazón del juego es `gameEngine.ts` + `App.tsx` (orquestación UI), y en agosto el trabajo se desplazó hacia `src/engine/*` (7 módulos) y `src/data/*` (registries). `gameEngine.ts` aparece en el 42% de todos los commits.

### Evolución del tamaño del código

| Métrica | Initial (23-jun) | Actual (20-ago) |
|---|---|---|
| Archivos TS/TSX en `src` | 56 | 98 |
| Líneas TS/TSX/CSS en `src` | 7.599 | 16.918 |
| Tests | 0 | 16 archivos / **183 tests** |
| Errores TypeScript | no medido | 0 |
| Módulos engine | 1 monolito | 8 (action, archetype, election, eventResolver, narrative, turnProcessor, engineShared, gameEngine) |
| Acciones de juego | — | 61 unificadas en registry |

> Nota: el baseline inicial ya contenía 15.295 líneas totales (257 archivos, incluyendo CSS, configs y assets). El crecimiento medido en `src` (7,6k → 16,9k líneas) es neto de refactor: en la Fase 3 de optimización se borraron ~530 líneas de dead code, y en 3.4 se eliminaron 7 componentes legacy (~600 líneas).

### Sistemas más trabajados

1. **Engine de turno/economía** (gameEngine, turnProcessor, engineShared, actionEngine) — afectado por las eras 1, 3 y 5.
2. **Sistema electoral** (electionSystem, electionEngine) — rebalanceado en eras 1, 4 y 5 (fórmula unificada, anti-inacción).
3. **Grupos de interés y agendas** (groupAgendaEngine, interactionCosts) — trade-offs, eventos raros, encadenamiento.
4. **UI/App shell** (App.tsx, IndicatorsPanel, modales) — rediseño total era 2, migración dark era 5.
5. **Eventos aleatorios** (eventResolver, pendingEvents) — limitador, 15 eventos activados, 17 efectos fixeados.

---

## 5. Conclusión — cómo maduró el proyecto

GobernArg V2 evolucionó en **tres saltos de madurez** separados por un hiato de 7 semanas:

1. **Junio: de prototipo a juego.** En 3 días (28 commits) se pasó de un baseline funcional a un juego con identidad: motor con legitimidad, ejes ideológicos, agendas de grupos, 5 derrotas, 4 dificultades y un rediseño visual completo basado en Figma. El trabajo fue vertiginoso (26 commits en un día) y arrastró deuda técnica evidente (lint roto, errores TS, bugs críticos fixeados en caliente el mismo día).

2. **Agosto (inicio): de juego a producto enfocado.** Tras el hiato, el refactor del 16-ago impuso orden (engine modular, tests, 0 errores TS) y el 17-ago aplicó diseño de reglas sofisticado (concesiones, encadenamientos, economía de acciones) culminando en el recorte estratégico a **MVP solo presidente**. La suite de tests creció 10 → 89 en 2 días: se consolidó una disciplina de verificación.

3. **Agosto (fin): de producto a experiencia pulida.** La integración masiva de assets propios (iconos, eventos ilustrados, fondos, retratos) dio identidad visual argentina, y la auditoría profesional de 6 revisores + 5 verificadores con su plan en 4 fases — ejecutado en una sola noche maratónica — eliminó los 4 bugs críticos (turnos cíclicos, victoria imposible, efectos ignorados, toolchain roto), conectó sistemas que existían solo en papel (pasivas de arquetipo, dificultad) y llevó el proyecto a un estado verificable: **183 tests, 0 errores de TypeScript, build OK, docs sincronizadas**.

El patrón de trabajo es de **sesiones maratónicas matutinas y nocturnas** (el autor commitea entre las 05 y las 11, y de madrugada en los picos), con mensajes de commit semánticos detallados que documentan decisiones de diseño. La madurez se refleja en la transición de "feat rápidos + fixes de emergencia" (junio) a "refactor + tests + auditoría con verificación independiente" (agosto). El proyecto quedó en el commit `14d5810` como un MVP jugable, verificado y documentado, con pendientes menores conocidos (14 errores de lint de estilo, `baseActionsModifier` e ironman sin consumir, Grupo E de assets pendiente).
