# INFORME COMPLETO DE AUDITORÍA Y PLAN DE OPTIMIZACIÓN — GobernArg

> **Fecha**: 19/08/2026
> **Alcance**: Revisión integral del 100% del código (6 revisores + 5 verificadores independientes)
> **Método**: Cada hallazgo fue verificado contra el código real, no especulado.
> **Estado**: Nada fue modificado todavía. Este documento es la base para el trabajo de optimización.

---

## TABLA DE CONTENIDOS

1. [Resumen ejecutivo](#1-resumen-ejecutivo)
2. [Hallazgos CRÍTICOS (verificados)](#2-hallazgos-críticos-verificados)
3. [Informe del Revisor de Engine](#3-informe-del-revisor-de-engine)
4. [Informe del Revisor de Datos](#4-informe-del-revisor-de-datos)
5. [Informe del Revisor de Componentes UI](#5-informe-del-revisor-de-componentes-ui)
6. [Informe del Revisor de Tipos y Utils](#6-informe-del-revisor-de-tipos-y-utils)
7. [Informe del Revisor de Tests](#7-informe-del-revisor-de-tests)
8. [Informe del Revisor de Docs y Dependencias](#8-informe-del-revisor-de-docs-y-dependencias)
9. [Verificaciones independientes](#9-verificaciones-independientes)
10. [PLAN DE OPTIMIZACIÓN COMPLETO](#10-plan-de-optimización-completo)
11. [Próximos pasos](#11-próximos-pasos)

---

## 1. RESUMEN EJECUTIVO

El proyecto GobernArg tiene una base sólida pero **esconde bugs críticos que los 96 tests actuales no detectan**. El más grave es un **bug sistémico de aritmética de turnos** que rompe 6 mecánicas centrales del juego: las demandas de grupos casi nunca vencen, conceder pausa las demandas para siempre, las negociaciones se pierden, los eventos aleatorios se bloquean permanentemente después del primero, y los bonos de ingresos se aplican en el momento equivocado.

Además: **la victoria es imposible como gobernador y presidente** (los objetivos buscan datos en la estructura equivocada), **17 efectos de eventos se ignoran en silencio**, y el **lint y el type-check están rotos** por dependencias faltantes.

| Categoría | CRITICAL | HIGH | MEDIUM | LOW | Total |
|-----------|----------|------|--------|-----|-------|
| Engine | 1 sistémico | 4 | 8 | 6 | 19 |
| Datos | 1 | 2 | 4 | 6 | 13 |
| UI | 0 | 4 | 8 | 9 | 21 |
| Tipos/Utils | 0 | 3 | 12 | 10 | 25 |
| Tests | 0 | 7 | 12 | 3 | 22 |
| Docs/Deps | 2 | 3 | 5 | 4 | 14 |
| **TOTAL** | **4** | **26** | **50** | **39** | **119** |

---

## 2. HALLAZGOS CRÍTICOS (VERIFICADOS)

### 2.1 Bug sistémico: aritmética de turnos sin año

**El problema**: el turno es cíclico (1-4 por año, `turnProcessor.ts:483-489`), pero deadlines y cooldowns se calculan como `turn + N` y se comparan con `turn`. Cuando la suma supera 4, la condición nunca se cumple.

**Verificado con demos empíricos**: los 96 tests pasan y NO detectan ninguno de estos bugs.

**Rompe 6 mecánicas:**

| # | Ubicación | Bug | Impacto |
|---|-----------|-----|---------|
| 1 | `groupAgendaEngine.ts:100,131,204` | Deadlines `turn + 3..5` (mínimo 4, máximo 9) comparados con `turn ≤ 4` → solo vencen en 1 de 9 combinaciones (**88.9% nunca vencen**) | Las penalizaciones y recompensas automáticas de demandas están muertas. Las demandas quedan activas para siempre y bloquean la generación de nuevas (límite de 2 activas) |
| 2 | `gameEngine.ts:281` + `groupAgendaEngine.ts:44` | `demandPausedUntil = turn + 4` (mínimo 5) → `turn < pausedUntil` siempre true → **pausa PERMANENTE** | Un solo "conceder" silencia las demandas del grupo para siempre, incluso cruzando mandatos (no se resetea en `electionEngine`) |
| 3 | `gameEngine.ts:274-276` + `groupAgendaEngine.ts:167` | Negociación `resolveTurn = turn + 1..2` → en turno 3 muere 50%, en turno 4 muere 100% (**37.5% promedio**) | El jugador paga costo + acción y la demanda pactada nunca llega; la entrada queda huérfana en `negotiationPending` |
| 4 | `eventResolver.ts:229,246,261` | Cooldown global `turn - lastRandomEventTurn < 3` con turnos cíclicos → si el evento se disparó en turno 2, 3 o 4 (**75% de los casos**), la diferencia nunca llega a 3 → **bloqueo permanente** | Después del primer evento aleatorio/crisis, no hay más eventos en el mandato |
| 5 | `turnProcessor.ts:385` + `actionEffects.ts:149-194` | `incomeModifier` (obras de infraestructura): se aplica el MISMO turno (antes de lo previsto), nunca en el turno de activación, y **PERMANENTE** si `activationTurn` cruza el año (ej. turno 4 → `activationTurn = 7` nunca se iguala) | Economía distorsionada. **Exploit**: construir infraestructura en turno 4 = +10% de ingresos eterno. Mismo defecto para `costReduction` (estudio_factibilidad en turno 4 = -20% infinito) |
| 6 | `gameEngine.ts:266` | `expiresAt = turn + 3` (bono de reunión) — mismo patrón, hoy latente | Nadie lee el bono, pero cuando se conecte (ver 2.2) tendrá el mismo bug |

**Fix mínimo (patrón unificado)**: usar el turno global `totalTurns = (state.year - 1) * 4 + state.turn` (ya existe en `eventResolver.ts:304`) en TODAS las escrituras y lecturas de deadlines, cooldowns y activaciones.

### 2.2 Victoria imposible: objetivos groupSupport

**El problema**: `victoryConditions.ts:108-115` (`updateObjectives`) busca `interestGroups[].support` con ids de SUBGRUPOS (`empresarios`, `sindicatos`) entre los grupos PADRE (`sectores-economicos`, `grupos-sociales`...). El `find` siempre falla → `currentSupport = 0`.

**Consecuencia**:
- Objetivo `sector-alliance` (gobernador): `{'empresarios': 80, 'sindicatos': 80, 'clase-media': 75}` → NUNCA se completa
- Objetivo `total-stability` (presidente): 5 grupos ≥ 75-85 → NUNCA se completa
- `checkVictoryConditions` (`victoryConditions.ts:14`) exige TODOS los objetivos completos
- **La victoria es IMPOSIBLE como gobernador y como presidente** (el jugador queda bloqueado antes de llegar a presidente)

**Fix (1 línea)**: `const currentSupport = gameState.groupRelations[groupId] ?? 0;` — `groupRelations` ya está keyed por ids de subgrupos y es el store canónico de soporte en runtime (lo actualizan actionEffects, eventResolver, turnProcessor, crossGroupEffects, groupAgendaEngine).

### 2.3 17 efectos de eventos ignorados en silencio

**El problema**: `applyEventEffect` (`eventResolver.ts:340-354`) solo maneja `popularity`, `budget`, `stability` y targets con prefijo `group_`. Los **17 efectos** que usan ids planos (`opositores`, `aliados`, `sectores-populares`...) se descartan sin error ni aviso.

**Conteo exacto verificado**: 147 targets totales en `data/events/*.ts` → 17 planos (ignorados) + 7 `group_` (funcionan).

**Eventos afectados (8, todos alcanzables en juego)**:
- `student_protests` — estudiantiles +25/-10
- `coalition_opportunity` — opositores +20/-10
- `legislative_block` — aliados +10, opositores -20
- `police_violence_scandal` (activo) — sectores-populares -25, clase-media -10, etc.
- `debt_default` (activo) — empresarios -30
- `energy_crisis` (activo) — empresarios +15
- `general_strike` (activo) — sindicatos +20/-25
- `drought` (activo) — sector-agricola -20/+25

**Matiz importante**: los ids planos son el formato canónico correcto del estado (`groupRelations` está keyed por ellos). El bug está en `applyEventEffect`, no en los datos.

**Fix mínimo**: agregar rama `else` en `applyEventEffect` que trate cualquier target como id de grupo (con o sin prefijo `group_`).

### 2.4 Toolchain roto

| # | Problema | Comando que falla | Fix |
|---|----------|-------------------|-----|
| 1 | `eslint.config.js:5` usa `typescript-eslint` que NO está instalado | `npx eslint` → "Cannot find module 'typescript-eslint'" | `npm i -D typescript-eslint @eslint/js globals` |
| 2 | `tsconfig.node.json` usa `node:path`/`node:url` sin `@types/node` | `npx tsc -b` → TS2307/TS2339 | `npm i -D @types/node` |
| 3 | `vitest@4.1.9` exige `vite ^6+` pero hay `vite@5.4.14` | `npm ls` muestra DOBLE VITE instalado (5 en raíz + 8 anidado en vitest) | Subir `vite` a 7/8 |

---

## 3. INFORME DEL REVISOR DE ENGINE

### 3.1 BUGS DE LÓGICA (además de los críticos)

**HIGH — `victoryConditions.ts:110` + `turnProcessor.ts:534`**: `updateObjectives` lee `interestGroups[].support` para objetivos con `groupSupport`, pero los datos no definen ese campo (los subgrupos tienen `baseSupport`) → los objetivos de gobernador/presidente jamás se completan (ya cubierto en 2.2).

**HIGH — `actionEngine.ts:78-97`**: `toggleActionSelection` no valida disponibilidad: si la acción está en cooldown, sin prerrequisitos o sin presupuesto, `availableAction` es undefined → `actionCost = 1` y la acción se selecciona y se ejecuta igual en `processEndTurn` (`turnProcessor.ts:309-358` no re-valida). Solo la UI lo previene; el engine no tiene barrera.

**MEDIUM — `electionEngine.ts:74`**: `popularity = round(pop * 0.7 + 30)` sin clamp explícito.

**LOW — `turnProcessor.ts:435`**: el desgaste `adjustedDecay` no se redondea (float en popularidad).

### 3.2 DEAD CODE / FUNCIONES SIN CONSUMIDORES

| # | Ubicación | Severidad | Descripción |
|---|-----------|-----------|-------------|
| 1 | `turnProcessor.ts:193-204` | LOW | `checkElectionOrVictory` con bloque `if` de cuerpo VACÍO — lógica muerta |
| 2 | `narrativeEngine.ts:100,130,150` | LOW | `generateActionResult`, `generateInteractionResult`, `generateElectionResult` — sin importadores en producción |
| 3 | `legitimacyEngine.ts:27-28` | LOW | `checkLegitimacyCostMultiplier` — sin consumidores. La regla "legitimidad 0 → acciones cuestan el doble" NO está implementada |
| 4 | `axisEngine.ts:36-70` | LOW | `getAxisModifiers` — solo usado en tests. Los efectos mecánicos de ejes extremos (costos/efectividad/estabilidad/grupos) NUNCA se aplican en producción |
| 5 | `difficultyEngine.ts:5-43` | **HIGH** | De los 6 modificadores de dificultad, solo se consume `popularityDecayMultiplier`. **`crisisProbabilityMultiplier`, `loansAvailable` (hard/legend dicen "sin préstamos" pero se puede pedir igual), `ironman`, `baseActionsModifier`, `incomeMultiplier` son muertos** — la dificultad casi no altera el juego |
| 6 | `archetypeEngine.ts:29-32` | **HIGH** | `passive.extraActions` (sindicalista "+1 acción base"): se suma en `applyArchetypePassives` pero `recalcState` → `calculateAvailableActions` no lo incluye y lo borra cada turno → la pasiva no tiene efecto real |
| 7 | `archetypeEngine.ts:34-51` | **HIGH** | `_archetypeElectionRetention`, `_archetypeEventResilience`, `_archetypeFreeInteractions`, `_archetypeExtraLoans` — se acumulan y NADIE los lee. 4 pasivas de arquetipo son humo: solo `_archetypeIncomeBonus` funciona |
| 8 | `gameEngine.ts:262-268` | **HIGH** | `temporarySupportBonuses` (bono de reunión, `actionMultiplier: 1.1`) se escribe pero NUNCA se lee — la reunión solo da +2 de apoyo |
| 9 | `engineShared.ts:44-48` | LOW | `POSITION_ACTION_EXCLUSIONS` vacío en los 3 cargos |
| 10 | `gameEngine.ts:112` / `electionEngine.ts:79` / `turnProcessor.ts:562` | LOW | `scheduledEvents` nunca se puebla; `turnLog[].decisions` queda `[]` para siempre |

### 3.3 PROBLEMAS DE CONSISTENCIA

| # | Ubicación | Severidad | Descripción |
|---|-----------|-----------|-------------|
| 1 | `groupAgendaEngine.ts:52-54` | MEDIUM | Filtro de acciones recientes sin chequeo de `entry.year`: acciones de años anteriores cuentan como "recientes" |
| 2 | `engineShared.ts:90-106` vs `electionSystem.ts:115-133` | MEDIUM | **DOS fórmulas de intención de voto distintas** — UI y elecciones pueden mostrar valores diferentes |
| 3 | `electionEngine.ts:70-96` | MEDIUM | El reset de mandato no resetea `demandPausedUntil`, `negotiationPending`, `temporarySupportBonuses` ni `historicalBudget` → efectos del mandato anterior se arrastran; `calculateBudgetImpact` compara contra el presupuesto del PRIMER mandato → intención de voto distorsionada |
| 4 | `gameEngine.ts:86` + `archetypeEngine.ts:30` vs `actionCalculator.ts:5-9` | MEDIUM | Constantes contradictorias de acciones base: estado inicial usa 5, el juego real da 1-3 según cargo |
| 5 | `turnProcessor.ts:421` | MEDIUM | `state.groupRelations['aliados']` hardcodeado — cadena mágica |
| 6 | `engineShared.ts:50-54` vs `victoryConditions.ts:3-11` | MEDIUM | `DEFEAT_POP_THRESHOLD` duplicado con `LOW_POPULARITY_THRESHOLD` (mismos valores) en dos módulos |
| 7 | `gameEngine.ts:79,197` + `turnProcessor.ts:426-430` | LOW | Magic numbers que deberían ser constantes |
| 8 | `actionCalculator.ts:13-17` | LOW | Bonus de acciones asimétrico (comunicador +0) no documentado |
| 9 | `turnProcessor.ts:361-372` | LOW | `calculateActionEffects` se calcula 2 veces por acción por turno — desperdicio |
| 10 | `archetypeEngine.ts:73-75` vs `axisEngine.ts:21-23` | LOW | `clampAxis` duplicado |

---

## 4. INFORME DEL REVISOR DE DATOS

### 4.1 VALORES INCONSISTENTES

| Hallazgo | Severidad | Descripción |
|---|---|---|
| `actionRegistry.ts:1050-1057` (`promover_educacion`) | MEDIUM | Costo `-100` pero `minBudget: 200`. Quiebra el patrón (en las otras 58, minBudget == costo). Es la acción más eficiente del juego (+10 pop / -100) |
| `actionRegistry.ts:1069-1076` (`fomentar_turismo`) | MEDIUM | Costo `-50`, `minBudget: 150`. Mismo patrón roto |
| `actionRegistry.ts:1087-1094` (`desarrollar_tecnologia`) | MEDIUM | Costo `-200`, `minBudget: 300`. Mismo patrón roto |
| `actionRegistry.ts:118-130` (`reforma_impositiva`) | MEDIUM | Requisito `minLegislativeSupport: 45` puede ser IMPOSIBLE: `legislativeSupport` es `null` hasta las elecciones de medio término (año 2) y tras ellas queda fijo. Si el resultado es tie/minority (< 45), la acción queda bloqueada el resto del mandato |

### 4.2 IDs DUPLICADOS / REFERENCIAS ROTAS

| Hallazgo | Severidad | Descripción |
|---|---|---|
| `actionRegistry.ts:625,644,663` vs `actionCategories.ts` | **HIGH** | **Divergencia entre las dos fuentes de acciones.** `plan_hidrico`, `mantenimiento_urbano` y `plan_conectividad` existen en el registry (fuente del engine) pero no en `actionCategories.ts`. El estado inicial declara 58 acciones, no 61. `actionCategories.ts` además omite los `prerequisites` de 6 acciones |

**Verificado sin hallazgos**: 0 IDs duplicados dentro de cada archivo; todos los `requiredActions` de prerequisites existen (7 verificadas); sin ciclos de prerequisitos.

### 4.3 DEMAND_ACTION_IDS

| Hallazgo | Severidad | Descripción |
|---|---|---|
| `interestGroups.ts:29,131` | MEDIUM | `demandActionIds` de empresarios/clase-alta incluyen `reforma_impositiva` con prerequisitos. `groupAgendaEngine` solo valida `availableForPositions` y recencia, NO los prerequisitos → 1/3 de las agendas pueden pedir una acción imposible, con penalidad garantizada |
| `interestGroups.ts:61` | LOW | `prestamo_local` es un préstamo: si el jugador está en el límite de deuda, la demanda es inejecutable |

**Verificado sin hallazgos**: los 54 IDs de `demandActionIds` (18 grupos × 3) TODOS existen en `actionRegistry.ts`.

### 4.4 EVENTOS

| Hallazgo | Severidad | Descripción |
|---|---|---|
| 17 efectos con target de grupo en formato id plano ignorados | **CRITICAL** | Ya cubierto en 2.3 |
| `pendingEvents.ts:19-112` (police_violence, minister_resignation) | **HIGH** | Eventos `type: 'triggered'` habilitados pero NUNCA se disparan: `resolveRandomEvents` solo itera `crisis` y `random`; ningún otro código procesa `triggered` |
| `eventWeights.ts` completo | LOW | Configuración de pesos exportada pero NUNCA consumida; el selector real solo usa `probability` |
| `pendingEvents.ts:1-11` vs `:569-587` | LOW | El encabezado dice "Los eventos se agregan UNO POR UNO" pero los 12 están todos habilitados — documentación desactualizada |

**Verificado sin hallazgos**: 24 probabilidades en [0,1]; sin turnRange invertido; sin IDs duplicados de eventos; severidades válidas.

### 4.5 OTROS

| Hallazgo | Severidad | Descripción |
|---|---|---|
| `actionRegistry.ts:165` (`satisfiesDemand`) | LOW | 45 usos pero NUNCA se lee en runtime — metadata muerta. Mismatch de texto: `'Control de inflación'` vs `'control de la inflación'` |
| `interestGroups.ts` (15 demandas) | LOW | 15 demandas declaradas sin ninguna acción que las satisfaga (`Reforma laboral`, `apoyo en sequías`, etc.) |
| `specialAbilities.ts:193` | LOW | Passive 'Agenda setting' de comunicador: `incomeBonus: 0` con descripción "×1.1 en popularidad" — el campo `incomeBonus` es de PRESUPUESTO; el efecto prometido es un no-op |

---

## 5. INFORME DEL REVISOR DE COMPONENTES UI

### 5.1 TEMA CLARO INCONSISTENTE (componentes VIVOS)

| Componente | Severidad | Problema |
|------------|-----------|----------|
| `GameLog.tsx:14` | **HIGH** | Modal entero `bg-white rounded-2xl` sobre app dark; textos `text-blue-600`, `bg-blue-50`, `text-gray-500/700` — el modal más "blanco" del juego |
| `NotificationCenter.tsx:15` | **HIGH** | Panel `bg-white` en la columna derecha; notificaciones con `bg-gray-50`, `border-gray-200/300`, `text-red-700/blue-700` |
| `ActiveBenefits.tsx:24-25` | **HIGH** | `bg-green-50 border-green-200` + `text-green-800` — bloque verde pálido en tema dark |
| `AdvisorPanel.tsx:65,76,94-95,104,111` | **HIGH** | Tarjetas `bg-blue-50`/`bg-gray-50`, textos `text-gray-500/600` — panel vivo en App.tsx, totalmente en paleta light |
| `AxisBar.tsx:31-36` | MEDIUM | `text-gray-700` (#374151) sobre `#14181f` da ~2.3:1 de contraste — ilegible |
| `ErrorBoundary.tsx:36-56` | MEDIUM | Pantalla de error con tarjeta `bg-white` — única pantalla light de la app |
| `AdvisorSelectionModal.tsx:110` | LOW | Placeholder de avatar `bg-gray-100` |
| `AdvisorPanel.tsx:45,54` | LOW | Botones `bg-red-600`/`bg-blue-600` hardcodeados en vez de tokens |

### 5.2 COMPONENTES LEGACY LIGHT (no importados — deuda muerta)

`ObjectivesPanel.tsx`, `VotingIntentionPanel.tsx`, `PoliticalCalendarWidget.tsx`, `InterestGroupsPanel.tsx`, `AgendaItem.tsx`, `SubgroupMoodBadge.tsx`, `SupportBar.tsx` — todos con `bg-white`, `text-gray-*`, `bg-*-50`. No se renderizan hoy, pero si se reactivan rompen el tema. **Decisión: migrar a dark o borrar.**

### 5.3 ICONOS LUCIDE DONDE YA EXISTEN WEBP

| Hallazgo | Severidad | Descripción |
|---|---|---|
| `RightSidebar.tsx:355` | MEDIUM | `GroupsAccordion` usa `group.icon` (Lucide: Briefcase, Users, Home...) para 9 grupos, mientras existen los webp mapeados en `THUMBNAIL_GROUPS` |
| `CharacterCreation.tsx:128` | LOW | `<arch.icon>` Lucide redundante: el webp ya se muestra justo arriba |

### 5.4 ACCESIBILIDAD

| Hallazgo | Severidad | Descripción |
|---|---|---|
| `AdvisorDismissModal.tsx:23`, `AdvisorSelectionModal.tsx:80` | MEDIUM | Botones cerrar solo icono sin `aria-label` |
| `Tooltip.tsx:27-29` | MEDIUM | Solo `group-hover` — inaccesible por teclado. Coexisten 2 sistemas de tooltip |
| `ManagementNotebook.tsx:483-488`, `GameLog.tsx:20` | LOW | Cerrar con `&times;` sin `aria-label` |
| `ActionCard.tsx:162-171` | LOW | `role="button"` sin `aria-pressed`/`aria-selected` |
| `ElectionResultsModal.tsx:19` | LOW | `alt="Elecciones"` genérico |

### 5.5 RENDIMIENTO

| Hallazgo | Severidad | Descripción |
|---|---|---|
| Todas las `<img>` (17 en components) | MEDIUM | Ninguna usa `loading="lazy"` ni `decoding="async"` — afecta sobre todo a heroes de modales |
| `GameLog.tsx:10` | LOW | `[...turnLog].reverse()` en cada render — trivial |

### 5.6 BUGS VISUALES

| Hallazgo | Severidad | Descripción |
|---|---|---|
| `ActionCard.tsx:172-179` | MEDIUM | **Verificado compilando Tailwind**: `border-l-4` + `border-border` + `borderColor` compiten por `border-color`; gana el color de categoría y pinta los 4 bordes — el acento izquierdo no se distingue |
| `ElectionResultsModal.tsx:15-16`, `GameOverModal.tsx:30-31`, `ReelectionChoiceModal.tsx:20-21` | LOW | Sin `max-h`/scroll — se cortan en pantallas bajas |
| `LegacyScreen.tsx:102` | LOW | `isVictivityMessage` (typo) |
| `App.tsx:235-242` | LOW | Botones Historial/Cuaderno con acentos inconsistentes |

---

## 6. INFORME DEL REVISOR DE TIPOS Y UTILS

### 6.1 ESTADO INICIAL

| Hallazgo | Severidad | Descripción |
|---|---|---|
| `gameEngine.ts:167-220` `createNewGame` | MEDIUM | NUNCA re-aplica las pasivas del arquetipo elegido. `getInitialGameState` llama `applyArchetypePassives` con el default `'politico'` y `createNewGame` solo hace spread. (a) cualquier arquetipo arranca con los ejes de político; (b) los `_archetype*` quedan con valores de político hasta el primer fin de turno; (c) la pasiva `extraActions: 1` de sindicalista se pierde en la creación |
| `gameEngine.ts:196` vs `:80-81` | LOW | `createNewGame` sobrescribe `popularity` pero deja `popularidadPolitica`/`popularidadGrupos` en 50 — inconsistencia visible en turno 1 |
| `gameEngine.ts:154-157` | LOW | `cloneInterestGroups` usa `JSON.parse(JSON.stringify())` — las funciones (`icon: LucideIcon`) se pierden |

### 6.2 TYPES ANY / CASTS

| Hallazgo | Severidad | Descripción |
|---|---|---|
| `engineShared.ts:63` | MEDIUM | `triggeredEvents: any[]` con comentario `// GameEvent[]` — cast innecesario |
| `victoryConditions.ts:44` | LOW | Import dinámico inline inconsistente |
| `actionEffects.ts:91-103` | LOW | `ADVISOR_SPECIALTY_CATEGORY_MAP` duplica entradas con/sin acentos; las variantes sin tilde jamás matchean (toLowerCase no quita acentos) |

### 6.3 FUNCIONES SIN USAR (archivos enteros muertos)

| Hallazgo | Severidad | Descripción |
|---|---|---|
| `utils/advisorEffects.ts` | MEDIUM | `calculateAdvisorEffects`, `applyAdvisorEffects`, `updateGroupRelationsWithAdvisors` — 0 importadores |
| `lib/icons.ts` | MEDIUM | `CATEGORY_LABELS`, `CATEGORY_ICONS`, `PRIMARY_CATEGORIES` — 0 importadores (EventModal duplica sus propias versiones) |
| `lib/gameAssets.ts` | MEDIUM | `archetypeIcons`, `categoryIcons`, `groupIcons`, `eventImages`, `backgrounds`, `advisors`, `characters` — 0 importadores (duplica imageAssets) |
| `systems/types.ts` + `systems/effects/types.ts` | MEDIUM | 0 importadores (el segundo solo es importado por el primero, también muerto) |
| `utils/actionEffects.ts:217` `isActionAvailable` | MEDIUM | 0 importadores — la disponibilidad real vive en `actionEngine.ts` (que NO cubre advisorRequired/groupSupportRequired/unlockedActions) |
| `utils/electionSystem.ts:32,37,205` | LOW | `isElectionTurn`, `isMidTermElectionTurn`, `updateGameStateForElections` — 0 importadores |
| `utils/imageAssets.ts:242,305` + `iconThumbnails.ts:34` | LOW | `GROUP_ICONS`, `getArchetypeImage`, `THUMBNAIL_CATEGORIES` — 0 importadores |
| `utils/victoryConditions.ts:21` | LOW | `checkDefeatConditions` — 0 importadores |

### 6.4 UTILS DUPLICADAS

| Hallazgo | Severidad | Descripción |
|---|---|---|
| `engineShared.ts:90` vs `electionSystem.ts:115` | **HIGH** | Dos `calculateVotingIntention` con fórmulas distintas (ya cubierto en 3.3) |
| `engineShared.ts:50` vs `victoryConditions.ts:4-8` | MEDIUM | `DEFEAT_POP_THRESHOLD` duplicado |
| `types/game.ts:306-380` vs `systems/events/types.ts:3-59` | MEDIUM | Dos jerarquías paralelas de tipos de eventos con los mismos nombres pero formas distintas |
| Registro de iconos de categoría en 3 lugares | MEDIUM | `imageAssets.ts:228` (usado), `iconThumbnails.ts:34` (muerto), `gameAssets.ts:78` (muerto) |
| Registro de eventos duplicado | MEDIUM | `imageAssets.ts` (usado) vs `gameAssets.ts` (muerto) |

### 6.5 FALLBACKS ROTOS

| Hallazgo | Severidad | Descripción |
|---|---|---|
| `victoryConditions.ts:108-115` | **HIGH** | Objetivos groupSupport incompletables (ya cubierto en 2.2) |
| `types/game.ts:528-532` + `archetypeEngine.ts:13-51` | **HIGH** | `_archetypeExtraLoans`, `_archetypeElectionRetention`, `_archetypeEventResilience`, `_archetypeFreeInteractions` se escriben pero NUNCA se leen (ya cubierto en 3.2) |
| `GameState.scheduledEvents` | MEDIUM | Nunca se puebla; el shape tipado ni siquiera coincide con el sistema real |

**Verificado sin hallazgos**: 70+ campos de GameState SÍ se inicializan; todos los `import.meta.glob` matchean archivos existentes; ningún import de `.webp` está roto.

---

## 7. INFORME DEL REVISOR DE TESTS

### 7.1 TESTS QUE NO TESTEAN NADA

| Ubicación | Sev. | Descripción |
|---|---|---|
| `eventLimiter.test.ts:22-33` | **HIGH** | "permite eventos si el último fue hace 3+ turnos" — única aserción `expect(Array.isArray(triggered)).toBe(true)` que SIEMPRE es true (resolveRandomEvents siempre retorna array, incluso bloqueado). **No puede fallar jamás** |
| `eventLimiter.test.ts:46-55` | **HIGH** | Ídem — tautológica. Con el fixture hay ~72% de probabilidad de que un evento real se dispare y el test no lo detecta |
| `demandRules.test.ts:12-111` | MEDIUM | 4 tests de `generateGroupAgendas` solo asertan techos (invariantes deterministas del early-return). Si `BASE_PROBABILITY = 0`, los 4 siguen pasando |
| `careerRules.test.ts` + `engineShared.test.ts` | LOW | Snapshots literales de constantes — solo duplican el valor, no protegen comportamiento |

### 7.2 ÁREAS SIN COBERTURA (funciones importantes sin tests)

| Área | Sev. | Qué falta |
|---|---|---|
| `victoryConditions` | **HIGH** | 3 de 5 vías de derrota sin test (impeachment, golpe, hiperinflación); `checkVictoryConditions`, `checkDefeatConditions`, `updateObjectives`, `getPositionObjectives` con CERO tests |
| `electionSystem` | **HIGH** | `getAvailableElectionOptions`, `canRunForOption`, `calculateVotingIntentionForOption` con penalización por ascenso, `isElectionTurn`/`isMidTermElectionTurn`. `ascensionPenalty.ts` sin tests |
| `actionEffects` | **HIGH** | `getDefaultCooldown`, `isActionAvailable`, `processPendingEffects`, `calculateGroupEffects`, mantenimiento diferido con random (100% sin cobertura) |
| `groupAgendaEngine` | **HIGH** | `applyGroupSatisfactionPenalty`, `updateGroupMoods`, `resolvePendingNegotiations` sin tests |
| `eventResolver` | **HIGH** | `checkEventConditions` (gate de TODOS los eventos), `applyEventChoice`, `calculateLegislativeResults` sin tests |
| `gameEngine` | MEDIUM-HIGH | `useSpecialAbility`, `hireAdvisors`/`dismissAdvisor`, `createNewGame` sin tests |
| `turnProcessor` | MEDIUM | Inflación, fin de mandato, estrategia midterm, flujo completo de agendas sin tests |

### 7.3 TESTS FRÁGILES

| Ubicación | Sev. | Descripción |
|---|---|---|
| `electionSystem.test.ts:49-60` | **HIGH** | "intención borderline gana" gana por margen de **0.0875 puntos** (45.0875 vs umbral 45). Cualquier ajuste de pesos rompe el test |
| `actionEffects.test.ts:51,61,78-79` | MEDIUM | Snapshots de balance (factor 0.40, diminishing 0.80, ×1.3) — ya se rompió una vez |
| `demandRules.test.ts` + `concessionRules.test.ts` | MEDIUM | Snapshots de balance (+5 apoyo, ratios de antagonismo, SUPPORT_GAINS 2/4/15) |
| `turnProcessor.test.ts` | MEDIUM | Decay 5/7/10 y neto 80 hardcodeados |
| `eventLimiter.test.ts:62-64` | MEDIUM | `toBe(12)` rompe si alguien agrega un evento pendiente deshabilitado |

### 7.4 DEPENDENCIA DE Math.random

**Ninguna aserción es flaky HOY** — pero solo porque las aserciones son vacuas o invariantes. **Ningún test mockea `Math.random`** → las ramas probabilísticas positivas nunca se verifican (mantenimiento diferido, generación real de agendas, trigger de eventos).

### 7.5 FIXTURES INCOMPLETOS

| Ubicación | Sev. | Descripción |
|---|---|---|
| `interactionCosts.test.ts:24-26` | MEDIUM | `makeState()` = `{} as GameState` — objeto vacío casteado |
| `electionSystem.test.ts:5-27` | MEDIUM | Fixture con campos muertos (`votingIntention: 55` nunca se lee) |
| `turnProcessor.test.ts:6-11` | MEDIUM | Depende de TODOS los defaults de `getInitialGameState()` — un cambio de defaults rompe todo silenciosamente |
| `victoryConditions.test.ts:5-26` | MEDIUM | Declara campos de 3 vías de derrota que no se testean |

### 7.6 PROPUESTA: 15 tests nuevos

1. **Vías de derrota faltantes** con boundaries exactos (impeachment pop 9+stab 19+turns 1→no, 2→sí; golpe 2→no, 3→sí; hiperinflación 6→no, 7→sí)
2. **Umbrales por cargo** con boundary de turnos (intendente pop 19/gobernador 24/presidente 29 con 2 turnos → derrota; 1 turno → no)
3. **`checkVictoryConditions`** + `updateObjectives` (cada condición por separado → false)
4. **`calculateVotingIntentionForOption`** con penalización por ascenso (0/1/2 mandatos)
5. **`getAvailableElectionOptions`** + `canRunForOption` (presidente term 2 → 0 opciones, fin de carrera)
6. **`calculateVotingIntention`** con estado completo + caso `historicalPopularity: []` (evita NaN)
7. **`getDefaultCooldown`** (préstamos 8, ≥600 6, ≥200 3, <200 1)
8. **`isActionAvailable`** (1 test por requisito bloqueante)
9. **`processPendingEffects`** (aplica + clamps + elimina + no muta)
10. **`calculateActionEffects`** con `vi.spyOn(Math, 'random')` (mantenimiento diferido)
11. **`checkEventConditions`** (todas las condiciones)
12. **`resolveRandomEvents`** con random mockeado (trigger + cooldown + límite + "solo 1 por turno")
13. **`applyGroupSatisfactionPenalty`** + `updateGroupMoods` (transiciones)
14. **`generateGroupAgendas`** con random mockeado (demandActionIds, recencia, cargo, deadline)
15. **`useSpecialAbility`** + `hireAdvisors` (cooldowns, costos, rechazos con misma referencia)

---

## 8. INFORME DEL REVISOR DE DOCS Y DEPENDENCIAS

### 8.1 DEPENDENCIAS SIN USO

| Sev. | Paquete | Detalle |
|---|---|---|
| **HIGH** | `puppeteer@^25.3.0` | 0 imports; arrastra ~30 transitivas y descarga Chromium |
| **HIGH** | `open@^10.1.0` | 0 uso (`server.open` de Vite es nativo) |
| MEDIUM | `cross-env` | 0 uso |
| MEDIUM | `@radix-ui/react-slot` + `class-variance-authority` | Solo los usan `ui/button.tsx` y `ui/badge.tsx`, ambos código muerto |

### 8.2 COMPONENTES UI MUERTOS

`ui/button.tsx`, `ui/badge.tsx`, `ui/card.tsx`, `ui/tooltip.tsx` — ninguno es importado. Solo `ui/progress.tsx` se usa (EventModal). Eliminarlos libera 2 dependencias.

### 8.3 VERSIONES DESACTUALIZADAS

| Sev. | Paquete | Actual | Latest |
|---|---|---|---|
| **HIGH** | `vite` | 5.4.14 (EOL) | 8.2.1 |
| MEDIUM | `lucide-react` | 0.344 (jul 2024) | 1.33.0 |
| MEDIUM | `eslint` | 8.57.1 | 10.x |
| LOW | `react` | 18.3.1 | 19.2.8 (opcional) |
| LOW | `typescript` | 5.6.3 | 7.0.2 (opcional) |

### 8.4 DOCUMENTACIÓN DESACTUALIZADA

| Sev. | Documento | Problema |
|---|---|---|
| **HIGH** | `docs/superpowers/plans/2026-07-02-rediseno-integral-plan.md` | El plan "aprobado" NO está implementado: hiperinflación `7→4` (sigue 7), impeachment `10/20→25/40` (sigue 10/20), golpe `25→30` (sigue 25), `emitir_dinero` `3→-3` (sigue +3), decay `-3/-5/-6` (sigue 5/7/10). Cambios revertidos sin documentar |
| MEDIUM | `src/docs/session-summary.md` | Congelado al 23/06/2026 — no menciona el rediseño integral ni 15+ archivos nuevos |
| MEDIUM | `src/docs/mecanicas-del-juego.md` | Datos viejos: 1 habilidad (hoy 2), 19 grupos (hoy 18), 58 acciones (hoy 61) |
| MEDIUM | `docs/piezas-diseno-propuesta.md` | Dice "Ninguna pieza fue creada todavía" — pero las 66 ya existen |
| MEDIUM | `docs/eventos-aleatorios-propuesta.md` | Propone 28 eventos; el código tiene 18 activos; las 11 imágenes ya existen |
| LOW | `src/docs/roadmap.md` | 90% implementado con checkboxes sin marcar |
| LOW | `src/docs/difficulty-analysis.md`, `phase-1-plan.md` | Refieren archivos que ya no existen |

### 8.5 CONFIGURACIÓN

| Sev. | Hallazgo |
|---|---|
| MEDIUM | `vite.config.ts:12` — `outDir: '../dist'` sale del proyecto (riesgo de pisarse) |
| MEDIUM | `vitest.config.ts` duplica el alias `@` de `vite.config.ts` — mantenimiento doble |
| LOW | `tsconfig` con `allowImportingTsExtensions` sin uso |
| LOW | `vite.config.ts:15` — `server.open: true` fuerza abrir navegador |
| LOW | `eslint.config.js:13` — `ecmaVersion: 2020` desactualizado |
| LOW | No existe script `lint` en package.json |
| LOW | `.dark` duplica `:root` en index.css (no hay tema claro) |

### 8.6 PROPUESTAS DE INSTALACIÓN

| Prioridad | Paquete | Justificación |
|---|---|---|
| **SÍ urgente** | `@types/node` | Arregla `tsc -b` |
| **SÍ urgente** | `typescript-eslint` + `@eslint/js` + `globals` | Arregla lint |
| **SÍ recomendado** | `sonner` | Toasts para NotificationCenter |
| **SÍ opcional** | `motion` (ex framer-motion) | Animaciones micro del roadmap |
| NO | `clsx`, `tailwind-merge` | Ya instalados y usados |
| NO | `react-query`, `zustand` | Sobre-ingeniería (no hay API ni estado global complejo) |
| NO | `recharts` | Ya hay barras CSS |
| NO | `puppeteer`, `open`, `cross-env` | No se usan — no reinstalar |

---

## 9. VERIFICACIONES INDEPENDIENTES

Todos los hallazgos críticos fueron verificados por agentes SEPARADOS de los revisores, con demos empíricos ejecutados contra los módulos reales:

| Hallazgo | Verificación | Resultado |
|----------|--------------|-----------|
| Aritmética de turnos | 5 demos ejecutados (deadlines, pausa, negociación, cooldown, incomeModifier) | ✅ CONFIRMADO (4/5 plenos, 1/5 parcial pero real) |
| Objetivos imposibles | Lectura línea por línea de victoryConditions + interestGroups + getPositionObjectives | ✅ CONFIRMADO (HIGH; afecta gobernador Y presidente) |
| 17 efectos ignorados | Conteo exacto por archivo + análisis de applyEventEffect | ✅ CONFIRMADO (conteo 17 exacto; el bug está en el resolver, no en los datos) |
| Mutaciones React | Mapeo de call-sites + análisis de StrictMode | ✅ CONFIRMADO (3 HIGH con doble efecto real; 1 MEDIUM; 1 LOW) |
| Tests tautológicos | Lectura del test + análisis de todos los caminos de retorno | ✅ CONFIRMADO (la aserción no puede fallar jamás) |

**Nota importante de la verificación de mutaciones**: StrictMode doble-invoca updaters funcionales de `setState`, NO event handlers. Por eso:
- `useSpecialAbility`, `applyEventChoice`, `recordElectionOutcome` (updaters) → doble efecto REAL en dev ✅
- `processEndTurn` (event handler) → sin doble efecto, pero mutación real del estado previo + compounding si se dispara dos veces (doble click) → MEDIUM
- "Turnos salteados" → DESCARTADO (los escalares no componen en doble invocación)

---

## 10. PLAN DE OPTIMIZACIÓN COMPLETO

### FASE 1 — CRÍTICOS (4-6h)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 1.1 | **Fix aritmética de turnos**: usar turno global `(year-1)*4+turn` en deadlines, cooldowns y activaciones | `groupAgendaEngine.ts`, `gameEngine.ts`, `eventResolver.ts`, `turnProcessor.ts`, `actionEffects.ts` | 2-3h |
| 1.2 | **Fix objetivos**: `groupRelations[groupId] ?? 0` en vez de `interestGroups.find().support` | `victoryConditions.ts` | 15min |
| 1.3 | **Fix efectos de eventos**: rama `else` que trate cualquier target como grupo | `eventResolver.ts` | 30min |
| 1.4 | **Arreglar toolchain**: instalar `@types/node`, `typescript-eslint`, `@eslint/js`, `globals`; subir `vite` a 7/8 | `package.json` | 30min |
| 1.5 | **Tests de regresión** para los 3 bugs (agenda cruzando año, cooldown global, incomeModifier) | `__tests__/` | 1h |

### FASE 2 — HIGH (5-8h)

| # | Tarea | Archivos | Esfuerzo |
|---|-------|----------|----------|
| 2.1 | **Fix mutaciones React** (3 HIGH + 1 MEDIUM): clonar estructuras anidadas | `gameEngine.ts`, `eventResolver.ts`, `electionEngine.ts`, `turnProcessor.ts` | 1-2h |
| 2.2 | **Conectar pasivas de arquetipo** (retención, resiliencia, interacciones gratis, préstamo extra, extraActions) | `archetypeEngine.ts`, `electionSystem.ts`, `eventResolver.ts`, `applyInteraction`, `actionCalculator.ts` | 1-2h |
| 2.3 | **Conectar `temporarySupportBonuses`** (multiplicador 1.1 de reunión) | `actionEffects.ts` o `turnProcessor.ts` | 30min |
| 2.4 | **Conectar modificadores de dificultad** (crisisProbability, loansAvailable, ironman, baseActions, income) | `difficultyEngine.ts` + consumidores | 1h |
| 2.5 | **Disparar eventos `triggered`** (police_violence, minister_resignation) | `eventResolver.ts` | 30min |
| 2.6 | **Migrar 4 componentes a tema dark** | `GameLog.tsx`, `NotificationCenter.tsx`, `ActiveBenefits.tsx`, `AdvisorPanel.tsx` | 1-2h |
| 2.7 | **Unificar fórmula de intención de voto** | `engineShared.ts`, `electionSystem.ts` | 30min |
| 2.8 | **Eliminar deps sin uso** (puppeteer, open, cross-env) + componentes ui muertos | `package.json`, `components/ui/` | 30min |
| 2.9 | **Unificar registry vs categories** (3 acciones faltantes) | `actionRegistry.ts`, `actionCategories.ts` | 30min |

### FASE 3 — MEDIUM (3-4h)

| # | Tarea |
|---|-------|
| 3.1 | Arreglar 3 acciones con `minBudget ≠ costo` + `reforma_impositiva` bloqueada |
| 3.2 | Validar prerequisitos en demandas (groupAgendaEngine) |
| 3.3 | Eliminar dead code: `advisorEffects.ts`, `lib/icons.ts`, `lib/gameAssets.ts`, `systems/types.ts`, `systems/effects/types.ts`, `checkElectionOrVictory`, `getAxisModifiers` (o conectarlo), `isActionAvailable` (o fusionarla) |
| 3.4 | Decidir destino de 7 componentes legacy light (migrar o borrar) |
| 3.5 | Fix `ActionCard` border-color; `loading="lazy"` en imágenes; `aria-label` en botones cerrar |
| 3.6 | Fix `createNewGame` para re-aplicar pasivas del arquetipo |
| 3.7 | Poblar `scheduledEvents` o eliminarlo del tipo |
| 3.8 | Fix `cloneInterestGroups` (no perder icons) |
| 3.9 | Tests: mockear Math.random en eventLimiter + reforzar tests frágiles |

### FASE 4 — MEJORAS (2-3h)

| # | Tarea |
|---|-------|
| 4.1 | Instalar `sonner` para toasts; `motion` para animaciones (opcional) |
| 4.2 | `vite.config.ts`: `outDir: './dist'`; unificar vitest config con mergeConfig; agregar script `lint` |
| 4.3 | Implementar los 15 tests nuevos propuestos (sección 7.6) |
| 4.4 | Actualizar documentación: superpowers plan, session-summary, mecanicas-del-juego, piezas-diseno-propuesta, roadmap |
| 4.5 | Conectar `getAxisModifiers` a producción (ejes ideológicos con efectos reales) — feature anunciada pero muerta |

### Total estimado: 15-20 horas

---

## 11. PRÓXIMOS PASOS

1. **Backup git** — antes de tocar el engine, hacer un bundle fresco o crear remoto (sigue pendiente desde hace días)
2. **Fase 1 (críticos)** — arrancar por el fix de turnos globales, que desbloquea 6 mecánicas a la vez
3. **Fase 2 (HIGH)** — mutaciones React y pasivas de arquetipo (impacto visible en partida)
4. **Playtest** — después de Fase 1+2, una partida completa para validar que demandas, eventos y elecciones funcionan como diseñado
5. **Fases 3-4** — limpieza, tests y docs

> **Advertencia**: los 96 tests actuales pasan aunque el juego tenga estos bugs. Cualquier fix debe ir acompañado de un test que detecte la regresión — de lo contrario el bug puede volver sin que nadie se entere.
