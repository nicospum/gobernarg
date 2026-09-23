# Reporte 6 — Estrategia de Tests y Calidad de Software (QA_Calidad)

**Proyecto:** GobernArg (React 18 + TS + Vite 7 + Vitest 4.1.9)
**Path analizado:** `project-bolt-sb1-dzgqso GobernArg 21-11/project`
**Fecha del análisis:** 2026-09-20
**Estado verificado en vivo:** ✅ 16/16 archivos, **183/183 tests pasan** (Vitest 4.1.9), `tsc -b` exit 0, lint con 14 errores documentados.

---

## 1. Resumen del Informe de Auditoría (2026-08-19)

El documento `docs/INFORME-AUDITORIA-COMPLETA.md` es una auditoría del 100% del código por 6 revisores + 5 verificadores independientes, con demos empíricas contra el código real. Total: **119 hallazgos (4 CRITICAL, 26 HIGH, 50 MEDIUM, 39 LOW)**.

### Hallazgos críticos encontrados

1. **Bug sistémico de aritmética de turnos** (el más grave): el turno es cíclico 1–4 por año, pero deadlines/cooldowns se calculaban como `turn + N` comparado con `turn`. Rompía 6 mecánicas: deadlines de demandas nunca vencían (88,9% de los casos), "conceder" pausaba demandas para siempre, las negociaciones se perdían (37,5%), el cooldown de eventos aleatorios bloqueaba el resto del mandato (75%), `incomeModifier` se aplicaba en el momento equivocado o se volvía permanente (exploit de +10% eterno construyendo en turno 4), y el bono de reunión era latente.
2. **Victoria imposible como gobernador y presidente**: `updateObjectives` buscaba `interestGroups[].support` con ids de subgrupos entre grupos padre → `find` siempre fallaba → `currentSupport = 0` → los objetivos `sector-alliance` y `total-stability` jamás se completaban.
3. **17 efectos de eventos ignorados en silencio**: `applyEventEffect` solo manejaba `popularity`, `budget`, `stability` y targets `group_*`; 17 targets con ids planos (`opositores`, `sindicatos`...) de 8 eventos alcanzables se descartaban sin error.
4. **Toolchain roto**: `typescript-eslint` no instalado (eslint fallaba), `@types/node` faltante (`tsc -b` fallaba), doble Vite instalado (5 en raíz + 8 anidado por vitest 4).

**Lección central del informe:** *los 96 tests de entonces pasaban con el juego completamente roto*. Los tests no detectaban ninguno de los bugs críticos. La advertencia explícita: "Cualquier fix debe ir acompañado de un test que detecte la regresión".

### Plan de optimización (fases 1–4, 15–20 h estimadas)

| Fase | Contenido | Estado |
|------|-----------|--------|
| **Fase 1 — Críticos** | Turno global `(year-1)*4+turn` en todos los deadlines/cooldowns; fix de objetivos (`groupRelations[groupId]`); rama `else` para efectos planos; toolchain | ✅ Completa (commit 0160294) |
| **Fase 2 — HIGH** | Mutaciones React (clones en `useSpecialAbility`, `applyEventChoice`, `recordElectionOutcome`, `processEndTurn`); pasivas de arquetipo conectadas; bono de reunión; dificultad conectada; eventos `triggered`; 4 componentes a tema dark; fórmula de voto unificada; deps fantasmas eliminadas; registry/categories unificados | ✅ Completa (afeabb4) |
| **Fase 3 — MEDIUM** | Datos (3 acciones con `minBudget ≠ costo`, `reforma_impositiva`); dead code eliminado; UI/UX; tests (eventLimiter con Math.random mockeado, tests frágiles reforzados) | ✅ Completa (b3ba398) |
| **Fase 4 — Mejoras** | Instalación (`sonner`, `motion`), configuración (outDir, mergeConfig, script lint), **implementación de los 15 tests nuevos propuestos → 183 tests en total**, docs actualizadas | ✅ Completa (1e3793e, 14d5810) |

**Pendientes declarados en el plan (confirmados en vivo):**
- Lint con **14 errores** (6 `no-explicit-any`, 5 `no-unused-vars`, 1 `rules-of-hooks`, 2 `prefer-const`) — verificados hoy ejecutando `npx eslint .`.
- `baseActionsModifier` e `ironman` de dificultad documentados pero sin consumir en runtime.

---

## 2. Mapa de cobertura de tests (16 archivos, 183 tests)

Estilo general: tests unitarios puros (environment `node`, sin DOM), fixtures con factory functions (`makeState`, `baseState`, `makeAction`), preferencia por aserciones de identidad (`toBe(state)` para rechazos que devuelven la misma referencia) e invariantes de inmutabilidad (el estado original no se muta). Comentarios en español que explican la aritmética esperada. Uso correcto de `vi.spyOn(Math, 'random')` con `afterEach(vi.restoreAllMocks)` en los 3 archivos que lo necesitan.

| # | Archivo | Tests | Sistema bajo test | Qué cubre (ejemplos concretos) |
|---|---------|-------|-------------------|-------------------------------|
| 1 | `actionEffects.test.ts` | 15 | `utils/actionEffects.ts` | Cálculo de efectos: factor 0.40 de popularidad, multiplicador de arquetipo empresario ×1.3, rendimiento decreciente `0.80^usos`, inversión a negativo tras 5 usos. `getDefaultCooldown` por umbral de presupuesto (8 préstamos/emisión, 6 ≥600, 3 ≥200, 1 <200, explícito gana). `processPendingEffects`: aplicación one-shot vs. futuros vs. vigentes vs. expirados, clamp 0–100, no-mutación, retorno por referencia si no hay cambios. Mantenimiento diferido (≥200) con random mockeado: -15% costo, delay 2–4 turnos |
| 2 | `archetypeEngine.test.ts` | 12 | `engine/archetypeEngine.ts` | Pasivas por arquetipo: político (retención 10%, reuniones gratis con aliados, ejes +2/+1), empresario (income +20%, préstamo extra, ejes técnico/cerrado), sindicalista (reuniones gratis ×2 grupos, **+1 acción base**, ejes radical/populista), comunicador (resiliencia 30%, eje convocante). Verifica también qué NO otorga cada arquetipo |
| 3 | `axisEngine.test.ts` | 12 | `engine/axisEngine.ts` | `applyAxisShift` por categoría de acción (economía, diplomacia, seguridad), clamp ±100, categoría desconocida no modifica. `getAxisModifiers` en extremos ±80: costos, multiplicadores de efectividad por categoría, modificadores de relaciones y estabilidad |
| 4 | `careerRules.test.ts` | 8 | `data/careerRules.ts` | Constantes de carrera: `MAX_TERMS` (intendente 4, gobernador/presidente 2), `PROMOTION_DIFFICULTY` (reelección +5, gobernador −15, presidente −40), `PROMOTION_MIN_POPULARITY` (0/45/75). Tests de snapshot de constantes + invariantes de orden |
| 5 | `concessionRules.test.ts` | 12 | `engine/gameEngine.ts` (applyInteraction) + `utils/interactionCosts.ts` + `data/actionRegistry.ts` | Reglas de concesión: conceder sin reunión/negociación previa es no-op (misma referencia), máximo 4 concesiones por mandato, costo cruzado (sube el grupo, bajan los demás). Diferenciación de impacto: reunión +2 / negociar +4 / conceder +15. Prerrequisitos del registry: acciones de alto impacto requieren `estudio_factibilidad`, cadenas (`modernizacion_aeropuertos`, `prestamo_internacional`, `lucha_narcotrafico`) |
| 6 | `demandRules.test.ts` | 12 | `engine/groupAgendaEngine.ts` + `engine/gameEngine.ts` (satisfyGroupDemand) | Límite de 2 demandas activas (0, 1, 2 ya activas → techos), respeto de `demandPausedUntil`. Recompensa reducida: +5 apoyo (no +10), +1 popularidad, consume 1 acción, no-op sin acciones. **Impacto cruzado antagonista**: satisfacer empresarios penaliza sindicatos (−3) y sectores populares (−2) con redondeo exacto, y el test clave "matemáticamente imposible subir todos los grupos" (suma neta ≤ 0 en pares antagónicos) |
| 7 | `electionSystem.test.ts` | 11 | `utils/electionSystem.ts` | `processElectionResults` (victoria con intención ≥45, derrota con pop baja y déficit; test reforzado con margen ~5 pts tras el hallazgo del margen frágil de 0.0875). `calculateVotingIntentionForOption` con tabla de penalización por ascenso (intendente→gobernador: 0/1/2 mandatos → ×0.25/0.15/0.08; gobernador→presidente ×0.15/0.12/0.05), reelección sin penalización. `getAvailableElectionOptions` (3 opciones en mandato 1; 0 como presidente en mandato 2 = fin de carrera). `canRunForOption` en boundaries 44/45 y 74/75 |
| 8 | `engineShared.test.ts` | 11 | `engine/engineShared.ts` + `gameEngine.ts` | Constantes de posición: ingreso (200/350/500), mantenimiento (120/200/350) siempre menor al ingreso, presupuesto inicial (800/2000/3500), cobertura exacta de los 3 cargos. Estado inicial arranca como presidente |
| 9 | `eventLimiter.test.ts` | 7 | `engine/eventResolver.ts` + `data/events/pendingEvents.ts` | **Los 2 tests que eran tautológicos fueron reescritos**: ahora usan `Math.random` mockeado a 0 y asiertan `triggered.length === 1` + mutación de `lastRandomEventTurn`/`randomEventsThisTerm` con turno global. Cooldown <3 turnos bloquea, máximo 5 por mandato bloquea. Validación del registry: 12 eventos pendientes activos, estructura válida, `getAllEvents` los incluye |
| 10 | `eventResolver.test.ts` | 11 | `engine/eventResolver.ts` (checkEventConditions) | Gate de eventos con evento sintético de condiciones completas: pop/budget/stability min+max, emisión monetaria, grupos requeridos (soporte > 0), asesores activos, acciones completadas, rango de **turno global** (year 2 turn 1 = 5) con boundaries exactos (3 y 10 entran; 2 y 11 no) |
| 11 | `gameEngine.test.ts` | 11 | `engine/gameEngine.ts` | `hireAdvisors`: descuento de costo, activación, acumulación, rechazo por segunda contratación del turno y por presupuesto insuficiente (misma referencia). `useSpecialAbility`: efectos y costos exactos de `discurso_patriotico` (+12 pop, +5 estab, +8 legit, cooldown 4) y `inversion_privada` empresario, clamp 0–100, no-mutación del original, rechazos por acciones/presupuesto/cooldown/habilidad inexistente |
| 12 | `groupAgendaEngine.test.ts` | 14 | `engine/groupAgendaEngine.ts` | `updateGroupMoods`: umbrales de soporte → contento (≥70) / neutral (60) / disconforme / enojado (40, con conteo de turnos ignorados) / radicalizado (30), incremento/reseteo de `ignoredTurns`, default 50 sin relación, no-mutación. `applyGroupSatisfactionPenalty`: demanda vencida cumplida +10, no cumplida −influencia (8 → 47; default 5 → 50), no vencida no penaliza |
| 13 | `interactionCosts.test.ts` | 5 | `utils/interactionCosts.ts` | Costos: reunión 10 fija, negociar 25×influencia, conceder 45×influencia, redondeo con influencia fraccionaria (1.5 → 38/68), 0 en tipo desconocido. (Sigue usando el fixture `{} as GameState` señalado en la auditoría) |
| 14 | `turnArithmetic.test.ts` | 9 | `engineShared.getGlobalTurn` + agregados cross-módulo | **Los tests de regresión de los bugs críticos**: `getGlobalTurn` (1/1→1, 4/4→16, cruza año 2/1→5); demanda con deadline 4 vencida en turno 1 año 2 (global 5) SÍ penaliza/recompensa (antes nunca vencía); deadline futuro no aplica; cooldown de eventos: disparado en turno global 2 no bloquea en global 5 (diferencia 3) pero sí bloquea en global 3 (diferencia 1) |
| 15 | `turnProcessor.test.ts` | 7 | `engine/turnProcessor.ts` | `processEndTurn`: desgaste de popularidad por cargo (5/7/10), creación de `TurnLogEntry` con todos los campos requeridos, year/turn/position correctos, `budgetChange` +80 para intendente (ingreso 200 − mantenimiento 120) |
| 16 | `victoryConditions.test.ts` | 26 | `utils/victoryConditions.ts` | El archivo más grande: las 5 vías de derrota (low_popularity, negative_budget, impeachment 9/19+2 turnos, golpe 9/24+3 turnos, hiperinflación 7 emisiones). Boundaries de turnos consecutivos con contador pre-incrementado (0=no, 1=sí), umbrales por cargo (intendente 20 / gobernador 25 / presidente 30) con boundary exacto (en el umbral no cuenta). `checkVictoryConditions`: todas las condiciones AND (objetivos completos + pop ≥60 + budget >0), falla por cada una por separado. `updateObjectives`: pop/budget/acciones/**groupSupport leyendo `groupRelations`** (regresión del bug 2.2: `empresarios:80, sindicatos:80, clase-media:75` → completa; sindicatos 79 → progress 67; sin relación → 0), progreso parcial, no-mutación, respeta objetivos ya completados |

### Invariantes transversales del juego que protege la suite

- **Aritmética de turnos global**: `turnArithmetic`, `eventResolver`, `eventLimiter`, `groupAgendaEngine`, `actionEffects` usan y verifican el turno global `(year-1)*4+turn`.
- **Límite de eventos**: cooldown 3 turnos globales + máximo 5 por mandato + solo elegibles por condiciones.
- **Límite y ciclo de vida de demandas**: máximo 2 activas, pausa por concesión, deadlines globales, penalización/recompensa al vencer.
- **Antagonismo de grupos**: satisfacer/conceder a un grupo penaliza a sus antagonistas con ratios exactos (la victoria exige gestionar tensiones, no maximizar todo).
- **Condiciones de victoria/derrota**: boundaries exactos por cargo y por contadores consecutivos.
- **Inmutabilidad**: ~10 tests asiertan explícitamente que el estado de entrada no se muta (contrato funcional del engine, relevante para React).
- **Rechazos = misma referencia**: patrón de "early return con `toBe(state)`" usado consistentemente en gameEngine, demandRules, concessionRules.
- **Economía básica**: ingreso − mantenimiento = neto por turno; costos de interacción escalados por influencia; cooldowns de acciones por magnitud presupuestaria.

---

## 3. Estado actual (verificado en vivo el 2026-09-20)

> Nota de entorno: el `node_modules` del proyecto contiene binarios nativos de **Linux** (`@rollup/rollup-linux-x64-gnu`, `@esbuild/linux-x64`), por lo que `npx vitest` no arranca en Windows (falta `@rollup/rollup-win32-x64-msvc`). Se ejecutó vía WSL (Ubuntu, Node 24.19.0) **sin instalar ni modificar nada**.

| Verificación | Resultado |
|---|---|
| `npx vitest run` | ✅ **16 archivos / 183 tests — todos pasan** (3.38 s, tests 121 ms) |
| `npx tsc -b` | ✅ Exit 0 — 0 errores de TypeScript (coherente con el commit c9f18a3) |
| `npx eslint .` | ❌ 14 errores (los pendientes documentados: `no-explicit-any`, `no-unused-vars` con prefijo `_`, 1 `rules-of-hooks`, 2 `prefer-const`) |
| Scripts en package.json | `dev`, `build`, `serve`, `lint`, `test`, `test:watch`, `test:ui` (script `lint` agregado en Fase 4 ✔) |
| Toolchain | vite 7.3.6, vitest 4.1.9, typescript-eslint 8.67, @types/node 26 — coherente (doble vite eliminado) |
| vitest.config.ts | Usa `mergeConfig(viteConfig, ...)` con `environment: 'node'` e `include: src/__tests__/**/*.test.ts` (la duplicación del alias quedó resuelta con mergeConfig ✔) |
| eslint.config.js | `typescript-eslint` flat config, `ecmaVersion: 2022`, react-hooks + react-refresh |

**Evolución verificada por git log:** 63 tests (commit c9f18a3, 16-08) → 96 tests (auditoría 19-08) → **183 tests** (Fase 4, commit 1e3793e, 20-08). Crecimiento ×2,9 en 4 días.

---

## 4. Evaluación de la cultura de calidad

**Fortalezas (notables para un proyecto indie):**

1. **Auditoría profesional de 6 revisores + 5 verificadores independientes**, con demos empíricas y conteo exacto (ej. "17 efectos ignorados" verificado target por target). Nada especulado.
2. **TDD de regresión post-auditoría**: cada bug crítico tiene hoy un test que lo detecta (`turnArithmetic` existe exclusivamente para eso). Se cumplió la advertencia del informe: "todo fix va con su test".
3. **Los 15 tests propuestos en la sección 7.6 del informe fueron efectivamente implementados** y verificados: vías de derrota faltantes con boundaries exactos (victoryConditions: 26 tests), umbrales por cargo, `checkVictoryConditions`/`updateObjectives`, penalización de ascenso 0/1/2 mandatos, `getAvailableElectionOptions` fin de carrera, `getDefaultCooldown` por umbrales, `processPendingEffects`, mantenimiento diferido con random mockeado, `checkEventConditions` completo, `resolveRandomEvents` con random mockeado, `applyGroupSatisfactionPenalty`/`updateGroupMoods`, `useSpecialAbility`/`hireAdvisors` con rechazos por misma referencia. El plan no fue humo: se cerró completo.
4. **Fix verificable de tests rotos**: los 2 tests tautológicos de `eventLimiter` (aserciones que "no podían fallar jamás") fueron reescritos con `Math.random` mockeado y aserciones reales; el test electoral frágil (margen 0.0875) fue reforzado con margen ~5 pts dejando comentario explicativo.
5. **Buenas prácticas en la suite**: factories de fixtures, tests de inmutabilidad, boundaries exactos (44/45, 74/75, 20/25/30, en-umbral-no-cuenta), identidad por referencia para no-ops, `toBeCloseTo` para flotantes, mocks restaurados en `afterEach`.
6. **Toolchain funcional**: tsc limpio, script lint existe, vitest config unificada con mergeConfig.

**Debilidades:**

1. **Los tests llegaron después de los bugs**: la suite de 96 tests pasaba con victoria imposible, eventos bloqueados y demandas eternas. Historial de tests que daban falsa confianza.
2. **Sin CI**: no hay GitHub Actions ni hook que corra tests/lint/tsc automáticamente. La calidad depende de correrlo a mano (y en WSL, dado el node_modules Linux-only).
3. **Snapshot de constantes**: `careerRules` y `engineShared` (19 tests) son snapshots literales de constantes — duplican el valor, no protegen comportamiento, y rompen ante cualquier rebalance aunque sea correcto. La auditoría misma los catalogó LOW.
4. **Documentación de pendientes honesta pero no automatizada**: los 14 errores de lint y los 2 modificadores de dificultad sin consumir están documentados como "pendientes menores" desde el 20-08, sin ticket ni follow-up.

---

## 5. Brechas de testing detectadas

| Brecha | Severidad | Detalle |
|--------|-----------|---------|
| **Cobertura de UI: 0%** | HIGH | Ningún test de componentes React (no hay Testing Library, jsdom ni tests de hooks). Los 4 componentes migrados a tema dark en Fase 2, el ErrorBoundary y la lógica de modales no tienen test. El bug visual de `ActionCard` (border-color) era solo detectable compilando Tailwind. |
| **Sin tests de integración end-to-end** | HIGH | No existe una partida completa simulada: `processEndTurn` solo se testea por turno 1 aislado (desgaste y turnLog). El flujo de 16 turnos → elección de midterm → fin de mandato → reset (que la auditoría marcó como "la función más riesgosa") no tiene test de recorrido completo. Sin tests de `electionEngine.recordElectionOutcome` (carrera acumulativa). |
| **Sin coverage report** | MEDIUM | No hay script `test:coverage` ni `coverage` en vitest config; no se puede medir qué % del engine real está cubierto. Áreas sospechadas sin tests: `calculateGroupEffects`, `toggleActionSelection`/validación del engine, `applyEventChoice`, `calculateLegislativeResults`, `ascensionPenalty` ya cubierto parcialmente, `crossGroupEffects`. |
| **`demandPausedUntil` y `negotiationPending` cruzando mandatos** | MEDIUM | La auditoría halló que el reset de mandato no limpiaba estos campos (Fase 2/3). Hay tests de pausa pero ninguno de reset entre mandatos (reaparición de demandas pausadas en el mandato siguiente). |
| **Tests de balance frágiles restantes** | MEDIUM | `turnProcessor` hardcodea decay 5/7/10 y neto 80; `eventLimiter` aserta `toBe(12)` eventos (rompe al agregar uno deshabilitado); `actionEffects`/`demandRules`/`concessionRules` fijan números de balance (+5 apoyo, ratios de antagonismo, factor 0.40). Cualquier rebalance legítimo rompe tests — riesgo de que alguien "ajuste el test" en vez de entender el cambio. |
| **Fixture `{} as GameState` persiste** | LOW | `interactionCosts.test.ts:25` sigue casteando un objeto vacío (señalado en la auditoría 7.5); `electionSystem.test.ts` conserva el campo muerto `votingIntention` en el fixture (con comentario aclaratorio, aceptable). |
| **Aleatoriedad residual sin mockear** | LOW | Solo 3 archivos mockean `Math.random`. La generación real de agendas con probabilidades positivas (rama `BASE_PROBABILITY > 0`) no se ejercita: los tests de `generateGroupAgendas` siguen asertando solo techos (early-return), como señalaba la auditoría. |
| **Sin tests de accesibilidad/render** | LOW | Hallazgos de a11y (aria-labels, tooltips por teclado, contraste AxisBar) sin tests ni herramienta (axe, Storybook). |
| **node_modules no portable** | LOW | Los binarios nativos Linux-only hacen que el proyecto no se pueda testear en Windows sin reinstalar dependencias — riesgo de que un dev en Windows asuma "los tests pasan" sin correrlos. |

### Recomendaciones priorizadas (sin ejecutar)

1. Agregar `test:coverage` con `v8`/`istanbul` y un piso mínimo en el engine (`src/engine`, `src/utils`).
2. Un test de integración: partida de 16 turnos con acciones ejecutadas → fin de mandato → elección → victoria/derrota, asertando invariantes (presupuesto nunca NaN, turnos 1→16 exactos, log con 16 entradas).
3. CI mínima (GitHub Actions): `tsc -b && eslint . (max-warnings) && vitest run` en cada push.
4. Resolver los 14 errores de lint restantes (la mayoría auto-fixable o con `argsIgnorePattern: '^_'`).
5. Reemplazar snapshots de constantes por tests de comportamiento o por validación de datos (ej. "todo cargo tiene ingreso > mantenimiento"), que ya existen parcialmente.
6. Correr un playtest completo post-Fase 2 (pendiente del propio plan, ítem 11.4) y capturarlo como test e2e manual documentado.

---

*Reporte generado por QA_Calidad. Verificación en vivo: WSL Ubuntu + Node 24.19.0 + Vitest 4.1.9, sin instalar ni modificar dependencias del proyecto.*
