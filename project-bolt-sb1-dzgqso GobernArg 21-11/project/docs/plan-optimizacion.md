# PLAN DE OPTIMIZACIÓN Y MEJORAS — GobernArg

> Documento consolidado de 6 revisores + 5 verificadores independientes.
> Todos los hallazgos fueron VERIFICADOS contra el código real.
> Fecha: 19/08/2026

> **PROGRESO (20/08/2026)**
>
> - [x] **Fase 1 ✅ completa** — turnos globales, objetivos/victoria, efectos de eventos, toolchain.
> - [x] **Fase 2 ✅ completa** — mutaciones React, pasivas de arquetipo, bono de reunión, dificultad
>       conectada (excepto los 2 pendientes de abajo), eventos `triggered`, UI tema oscuro, fórmulas
>       de voto unificadas, deps eliminadas, registry/categories unificados.
> - [x] **Fase 3 ✅ completa (3.4 incluido)** — datos, dead code, UI/UX y tests.
> - [x] **Fase 4 ✅ completa (4.1-4.4)** — instalación, configuración, tests nuevos (183 en total) y
>       documentación actualizada (este documento incluido).
>
> **Pendientes menores:**
> - Lint con **11 errores de estilo** (6 `no-explicit-any` + 5 `no-unused-vars`; más 3 puntuales:
>   1 `rules-of-hooks`, 2 `prefer-const` — total 14).
> - `baseActionsModifier` e `ironman` de dificultad: documentados pero **sin consumir** en runtime.

---

## Resumen ejecutivo

| Categoría | CRITICAL | HIGH | MEDIUM | LOW |
|-----------|----------|------|--------|-----|
| Bugs de lógica | 1 sistémico (rompe 6 mecánicas) | 4 | 8 | 6 |
| Estado React | 0 | 3 (doble efecto dev) | 1 | 1 |
| Datos | 1 (17 efectos ignorados) | 2 | 4 | 6 |
| UI | 0 | 4 (tema claro) | 8 | 9 |
| Tipos/Utils | 0 | 3 | 12 | 10 |
| Tests | 0 | 7 | 12 | 3 |
| Dependencias | 2 (lint y tsc rotos) | 3 | 5 | 4 |
| **Total** | **4** | **26** | **50** | **39** |

---

# FASE 1 — CRÍTICOS (arreglar YA)

## 1.1 Bug sistémico: aritmética de turnos sin año (VERIFICADO ✅)

**El problema**: el turno es cíclico 1-4 (`turnProcessor.ts:483-489`), pero deadlines/cooldowns se calculan como `turn + N` y se comparan con `turn`. Cuando la suma supera 4, la condición nunca se cumple.

**Rompe 6 mecánicas:**

| # | Ubicación | Bug | Impacto |
|---|-----------|-----|---------|
| 1 | `groupAgendaEngine.ts:100,131,204` | Deadlines `turn + 3..5` nunca vencen (88.9% de casos) | Penalizaciones/recompensas de demandas muertas; demandas bloquean el sistema para siempre |
| 2 | `gameEngine.ts:281` + `groupAgendaEngine.ts:44` | `demandPausedUntil = turn + 4` = pausa PERMANENTE | "Conceder" mata las demandas del grupo para siempre |
| 3 | `gameEngine.ts:274-276` + `groupAgendaEngine.ts:167` | Negociación `turn + 1..2` en turno 3-4 nunca se resuelve (37.5%) | Jugador paga y la demanda pactada nunca llega |
| 4 | `eventResolver.ts:229,246,261` | Cooldown `turn - last < 3` con turnos cíclicos = bloqueo PERMANENTE (75% de casos) | Después del 1er evento aleatorio, no hay más eventos en el mandato |
| 5 | `turnProcessor.ts:385` + `actionEffects.ts:149-194` | `incomeModifier` se aplica el mismo turno o NUNCA o PERMANENTE (según turno) | Economía distorsionada; exploit de +10% infinito construyendo en turno 4 |
| 6 | `gameEngine.ts:266` | `expiresAt = turn + 3` mismo patrón (hoy muerto porque nadie lee el bono) | Latente |

**Fix mínimo (patrón unificado)**: usar turno global `totalTurns = (state.year - 1) * 4 + state.turn` (ya existe en `eventResolver.ts:304`) en TODAS las escrituras y lecturas de deadlines/cooldowns.

**Tests que lo detectarían**: demanda con deadline cruzando año; cooldown de eventos con `last=2, turn=1, year=2`; incomeModifier recorriendo 4 end-turns.

## 1.2 Victoria imposible: objetivos groupSupport (VERIFICADO ✅)

**El problema**: `victoryConditions.ts:108-115` busca `interestGroups[].support` con ids de SUBGRUPOS (`empresarios`, `sindicatos`) entre grupos PADRE (`sectores-economicos`). El find siempre falla → `currentSupport = 0`.

**Consecuencia**: objetivos `sector-alliance` (gobernador) y `total-stability` (presidente) NUNCA se completan → **victoria imposible como gobernador y presidente** (`checkVictoryConditions` exige todos completos).

**Fix (1 línea)**: `const currentSupport = gameState.groupRelations[groupId] ?? 0;` — `groupRelations` ya está keyed por ids de subgrupos y es el store canónico de soporte.

## 1.3 17 efectos de eventos ignorados (VERIFICADO ✅)

**El problema**: `applyEventEffect` (`eventResolver.ts:340-354`) solo maneja `popularity`, `budget`, `stability` y targets con prefijo `group_`. **17 efectos** usan ids planos (`opositores`, `aliados`, `sectores-populares`...) y se descartan en silencio.

**Eventos afectados** (8): `student_protests`, `coalition_opportunity`, `legislative_block`, `police_violence_scandal`, `debt_default`, `energy_crisis`, `general_strike`, `drought`.

**Fix mínimo**: normalizar en `applyEventEffect` — agregar rama `else` que trate cualquier target como id de grupo (con/sin prefijo `group_`).

## 1.4 Toolchain roto (VERIFICADO ✅)

| # | Problema | Fix |
|---|----------|-----|
| 1 | `eslint.config.js:5` usa `typescript-eslint` NO instalado → `npx eslint` falla | `npm i -D typescript-eslint @eslint/js globals` |
| 2 | `tsconfig.node.json` usa `node:path`/`node:url` sin `@types/node` → `tsc -b` falla | `npm i -D @types/node` |
| 3 | `vitest@4` exige `vite ^6+` pero hay `vite@5` → DOBLE VITE instalado | Subir `vite` a 7/8 |

---

# FASE 2 — HIGH (arreglar pronto)

## 2.1 Mutaciones de estado React (3 HIGH + 1 MEDIUM confirmados)

| # | Ubicación | Bug | Fix |
|---|-----------|-----|-----|
| 1 | `gameEngine.ts:394,409-413` `useSpecialAbility` | Mutación `groupRelations` en updater funcional → **doble efecto en dev** (StrictMode) | `const newState = { ...state, groupRelations: { ...state.groupRelations } };` |
| 2 | `eventResolver.ts:320,350` `applyEventChoice` | Ídem → doble efecto en elecciones de eventos | Clonar `groupRelations` en la copia |
| 3 | `electionEngine.ts:13-19,24,59` `recordElectionOutcome` | Muta milestone + push al array compartido → **careerHistory duplicado en dev** | Clonar `careerHistory` con `.map(m => ({...m}))` y reemplazar milestone por map |
| 4 | `turnProcessor.ts:269-274,332,339,347,349,551-552,568` `processEndTurn` | Shallow copy comparte 6+ arrays/objetos que se mutan | Clonar `pendingEffects`, `completedActions`, `turnLog`, `historicalPopularity`, `historicalBudget`, `actionUsageCount`, `actionCooldowns` |
| 5 | `engineShared.ts:110-117` `recalcState` | Impura (escribe in-place) pero siempre recibe copia — riesgo futuro | Refactorizar a retorno puro |

## 2.2 Pasivas de arquetipo sin efecto (VERIFICADO ✅)

4 pasivas anunciadas en UI pero **nunca leídas** en runtime:
- `_archetypeElectionRetention` (político +10% retención) — electionSystem no la lee
- `_archetypeEventResilience` (comunicador -30% eventos) — eventResolver no la lee
- `_archetypeFreeInteractions` (político/sindicalista) — applyInteraction no la lee
- `_archetypeExtraLoans` (empresario +1 préstamo) — nadie la lee
- `passive.extraActions` (sindicalista) — se borra cada turno en recalcState

**Fix**: conectar cada pasiva donde corresponde + test.

## 2.3 temporarySupportBonuses escrito pero nunca leído

Bono de reunión (`actionMultiplier: 1.1`) se escribe pero ningún engine lo lee. La reunión solo da +2 apoyo. **Fix**: aplicar el multiplicador en `calculateActionEffects` cuando hay bono activo.

## 2.4 Modificadores de dificultad muertos

6 modificadores declarados en `difficultyEngine.ts`, solo 1 (`popularityDecayMultiplier`) se consume. **Fix**: conectar `crisisProbabilityMultiplier`, `baseActionsModifier`, `incomeMultiplier`, `loansAvailable`, `ironman`.

## 2.5 Eventos `triggered` nunca se disparan

`police_violence_scandal` y `minister_resignation` están "activos" pero `resolveRandomEvents` solo itera `crisis` y `random`. **Fix**: agregar procesamiento de `triggered` con sus condiciones.

## 2.6 UI con tema claro en app oscura (4 componentes VIVOS)

| Componente | Problema |
|------------|----------|
| `GameLog.tsx` | Modal entero `bg-white` |
| `NotificationCenter.tsx` | Panel `bg-white` |
| `ActiveBenefits.tsx` | `bg-green-50` light |
| `AdvisorPanel.tsx` | Tarjetas `bg-blue-50`/`bg-gray-50` |

**Fix**: migrar a `bg-card`/`border-border`/`text-foreground`.

## 2.7 Dos fórmulas de intención de voto

`engineShared.ts:90` (recalcState) y `electionSystem.ts:115` calculan `votingIntention` distinto. UI y elecciones pueden mostrar valores diferentes. **Fix**: unificar en una sola función.

## 2.8 Dependencias sin uso

- `puppeteer@^25` — 0 imports, arrastra Chromium (~30 deps transitivas) → **ELIMINAR**
- `open@^10` — 0 uso → **ELIMINAR**
- `cross-env` — 0 uso → **ELIMINAR**
- `@radix-ui/react-slot` + `class-variance-authority` — solo los usan `ui/button|badge|card|tooltip.tsx` muertos → **ELIMINAR junto con los componentes**

## 2.9 Registry vs categories divergentes

3 acciones (`plan_hidrico`, `mantenimiento_urbano`, `plan_conectividad`) existen en `actionRegistry.ts` pero no en `actionCategories.ts`. **Fix**: unificar a una sola fuente de verdad.

---

# FASE 3 — MEDIUM (mejoras)

## 3.1 Datos
- 3 acciones con `minBudget ≠ |costo|` (`promover_educacion` -100/200, `fomentar_turismo` -50/150, `desarrollar_tecnologia` -200/300)
- `reforma_impositiva` con `minLegislativeSupport: 45` posiblemente imposible (support null hasta año 2)
- `demandActionIds` de empresarios/clase-alta incluyen `reforma_impositiva` con prerequisitos → demandas imposibles
- 15 demandas huérfanas sin acción que las satisfaga

## 3.2 Dead code (eliminar o conectar)
- `utils/advisorEffects.ts` — 0 importadores
- `lib/icons.ts` — 0 importadores (EventModal duplica sus propios)
- `lib/gameAssets.ts` — 0 importadores (duplica imageAssets)
- `systems/types.ts` + `systems/effects/types.ts` — 0 importadores
- `checkElectionOrVictory` (cuerpo vacío), `checkLegitimacyCostMultiplier`, `getAxisModifiers` (solo tests), `isActionAvailable` (0 importadores), `GROUP_ICONS`, `getArchetypeImage`, `THUMBNAIL_CATEGORIES`, `checkDefeatConditions`, `isElectionTurn`, `isMidTermElectionTurn`, `updateGameStateForElections`
- 7 componentes legacy light sin importar: `ObjectivesPanel`, `VotingIntentionPanel`, `PoliticalCalendarWidget`, `InterestGroupsPanel`, `AgendaItem`, `SubgroupMoodBadge`, `SupportBar` (migrar o borrar)
- `ui/button|badge|card|tooltip.tsx` — 0 importadores

## 3.3 UI/UX
- `ActionCard.tsx:172-179` — conflicto de `border-color` (verificado compilando Tailwind): el acento izquierdo `border-l-4` no se distingue
- Todas las `<img>` sin `loading="lazy"` ni `decoding="async"`
- Botones de cierre sin `aria-label` (AdvisorDismissModal, AdvisorSelectionModal, ManagementNotebook, GameLog)
- Tooltip custom inaccesible por teclado (solo `group-hover`)
- `AxisBar` contraste `text-gray-700` ilegible
- Modales sin `max-h`/scroll (ElectionResultsModal, GameOverModal, ReelectionChoiceModal)
- `RightSidebar` usa Lucide para grupos cuando existen webp propios
- `CharacterCreation` doble iconografía (webp + Lucide en misma card)
- `createNewGame` no re-aplica pasivas del arquetipo elegido (arranca con ejes de político)
- `scheduledEvents` nunca se puebla (ManagementNotebook siempre vacío)
- `cloneInterestGroups` pierde icons (JSON round-trip)

## 3.4 Tests
- 2 tests tautológicos en `eventLimiter` (VERIFICADO ✅) — mockear `Math.random`
- Tests frágiles: electoral con margen 0.0875 puntos; snapshots de balance por todos lados
- Fixtures `{} as GameState` (interactionCosts, axisEngine)

---

# FASE 4 — MEJORAS RECOMENDADAS

## 4.1 Instalar
| Paquete | Prioridad | Justificación |
|---------|-----------|---------------|
| `@types/node` | CRITICAL | Arregla `tsc -b` |
| `typescript-eslint` + `@eslint/js` + `globals` | CRITICAL | Arregla lint |
| `sonner` | Recomendado | Toasts para NotificationCenter |
| `motion` (ex framer-motion) | Opcional | Animaciones micro del roadmap |

## 4.2 Configuración
- `vite.config.ts:12` — `outDir: '../dist'` sale del proyecto → cambiar a `./dist`
- `vitest.config.ts` duplica alias de `vite.config.ts` → usar `mergeConfig`
- `eslint.config.js` — `ecmaVersion: 2020` → actualizar
- Agregar script `lint` a package.json
- Eliminar `.dark` duplicado de `index.css` (no hay tema claro)

## 4.3 Tests nuevos (15 propuestos)
1. Vías de derrota faltantes (impeachment, golpe, hiperinflación) con boundaries
2. Umbrales por cargo con boundary de turnos exacto
3. `checkVictoryConditions` + `updateObjectives`
4. `calculateVotingIntentionForOption` con penalización por ascenso
5. `getAvailableElectionOptions` + `canRunForOption` (fin de carrera presidente)
6. `calculateVotingIntention` con estado completo + caso histórico vacío
7. `getDefaultCooldown` (préstamos 8, ≥600 6, ≥200 3, <200 1)
8. `isActionAvailable` (1 test por requisito bloqueante)
9. `processPendingEffects` (aplica + clamps + elimina)
10. `calculateActionEffects` con `vi.spyOn(Math, 'random')` (mantenimiento diferido)
11. `checkEventConditions` (todas las condiciones)
12. `resolveRandomEvents` con random mockeado (trigger + cooldown + límite)
13. `applyGroupSatisfactionPenalty` + `updateGroupMoods`
14. `generateGroupAgendas` con random mockeado (demandActionIds, recencia, cargo)
15. `useSpecialAbility` + `hireAdvisors` (cooldowns, costos, rechazos)

## 4.4 Documentación a actualizar
- `docs/superpowers/plans/2026-07-02-rediseno-integral-plan.md` — estado real (cambios revertidos sin documentar)
- `src/docs/session-summary.md` — congelado al 23/06
- `src/docs/mecanicas-del-juego.md` — datos viejos (1 habilidad vs 2, 19 grupos vs 18, 58 vs 61 acciones)
- `docs/piezas-diseno-propuesta.md` — dice "ninguna pieza creada" pero ya existen 66
- `docs/eventos-aleatorios-propuesta.md` — 28 eventos propuestos vs 18 activos
- `src/docs/roadmap.md` — 90% implementado con checkboxes sin marcar

---

# ORDEN DE EJECUCIÓN RECOMENDADO

| Fase | Prioridad | Esfuerzo | Impacto |
|------|-----------|----------|---------|
| **1.1 Turnos globales** | CRITICAL | 2-3h | Desbloquea demandas, negociaciones, eventos, economía |
| **1.2 Objetivos groupRelations** | CRITICAL | 15min | Hace posible la victoria |
| **1.3 Efectos de eventos** | CRITICAL | 30min | Eventos afectan grupos |
| **1.4 Toolchain** | CRITICAL | 30min | Lint + tsc funcionan |
| **2.1 Mutaciones React** | HIGH | 1-2h | Dev consistente |
| **2.2-2.5 Pasivas/dificultad/triggered/bono** | HIGH | 2-3h | Mecánicas anunciadas funcionan |
| **2.6 UI tema claro** | HIGH | 1-2h | Consistencia visual |
| **2.7-2.9 Votación/deps/registry** | HIGH | 1h | Higiene + consistencia |
| **3.1-3.4 MEDIUM** | MEDIUM | 3-4h | Mejoras generales |
| **4.1-4.4 Mejoras** | MEDIUM | 2-3h | Deps + tests + docs |

**Total estimado: 15-20 horas de trabajo.**

---

# RIESGOS Y NOTAS

1. **Los 96 tests actuales NO detectan los bugs críticos** — pasarían igual con el juego roto. Los fixes deben ir acompañados de tests que los detecten.
2. **`processEndTurn` es la función más riesgosa** — tocar la aritmética de turnos puede romper el flujo de 16 turnos. Hacerlo con tests de integración.
3. **No cambiar balance** — el objetivo es que las mecánicas existentes FUNCIONEN como fueron diseñadas, no rebalancear.
4. **React 19 / Tailwind 4** — migraciones opcionales, NO recomendadas ahora (alto riesgo, bajo beneficio).
5. **Backup git sigue pendiente** — antes de tocar el engine, conviene pushear o al menos hacer un bundle fresco.
