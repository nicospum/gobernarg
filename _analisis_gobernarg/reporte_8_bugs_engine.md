# Reporte 8 — Bugs de lógica en el engine de GobernArg

**Auditor:** Cazador_Bugs_Engine
**Alcance:** `src/engine/*.ts` (12 módulos) + `src/utils/*.ts` (electionSystem, popularidad, actionEffects, victoryConditions, crossGroupEffects, actionCalculator, interactionCosts, ascensionPenalty, careerLog)
**Proyecto:** `project-bolt-sb1-dzgqso GobernArg 21-11/project`
**Fecha:** 2026-09-20

> Excluye hallazgos ya reportados (turnos globales, victoria imposible, 17 efectos reconectados, huérfanos, votingIntention post-elección, matching de texto en intereses, estilo de mutación, RNG).

---

## 1. ALTO — Efectos diferidos de eventos (`target/value`) nunca se aplican

**Archivo:** `src/engine/eventResolver.ts:340-351` → `src/utils/actionEffects.ts:288-320`

**Qué hace el código:** `applyEventChoice` convierte los efectos `delayed` de una elección de evento en `PendingEffect` con campos `target` y `value` (`{ target: effect.target, value: effect.value, activationTurn: ... }`). `processPendingEffects` —el único consumidor de la cola— solo lee `budgetChange`, `popularityChange`, `stabilityChange` y `groupEffects`. Un `PendingEffect` con `target/value` activa ninguna rama, y como no tiene `duration`, el filtro final (`!isEffectActive(e) || e.duration !== undefined`) lo **elimina silenciosamente**. Nunca se aplica nada.

**Qué debería hacer:** mapear `target` ('popularity' | 'budget' | 'stability' | 'group_<id>') al mismo mecanismo de `applyEventEffect`, o generar `budgetChange/popularityChange/...` al encolar.

**Extra:** el `PendingEffect` con `type: 'diplomatic_event'` que crea `generatePendingEffects` (actionEffects.ts:225-232) tampoco tiene consumidor en ningún archivo (grep confirma: solo se crea, nadie lo lee). Mismo destino: se descarta sin efecto al activarse.

**Severidad:** alto (latente: hoy ningún evento en `data/events` usa `delayed`, pero el pipeline está roto; cualquier contenido futuro o mod que use `delayed` no funcionará).

**Reproducción mental:** crear un evento con `choices: [{ effects: { delayed: [{ target: 'budget', value: -500, turnsUntil: 2 }] } }]`; elegirlo; pasar 2 turnos → el presupuesto nunca cae y el efecto desaparece de `pendingEffects`.

---

## 2. ALTO — Objetivos con requisitos múltiples se completan cumpliendo solo UNO (semántica OR en vez de AND)

**Archivo:** `src/utils/victoryConditions.ts:83-128` (`updateObjectives`)

**Qué hace el código:** cada bloque de requisito está encadenado con `&& !completed`:

```ts
if (objective.requirements.popularity) { ...; completed = popularity >= req; }
if (objective.requirements.budget && !completed) { ...; completed = budget >= req; }
```

Si `popularity >= 70` ya marcó `completed = true`, el bloque `budget` se saltea. Si la popularidad no se cumple, el bloque `budget` puede completar el objetivo solo. Resultado: `'local-development'` (70% pop **y** $2000M), `'provincial-growth'` (75% y $5000M) y `'national-prosperity'` (80% y $10000M) se completan con **cualquiera** de las dos condiciones.

**Qué debería hacer:** evaluar todos los requisitos presentes y exigir que se cumplan todos (`completed = requisitosPresentes.every(...)`); `progress` debería reflejar el peor sub-requisito, no el último evaluado.

**Impacto:** recompensas gratis (+10/+15/+20 popularidad), `completedObjectives` inflado, y `checkVictoryConditions` (`objectives.every(completed)`) se vuelve notablemente más fácil — la victoria presidencial exige en la práctica solo popularidad, no el presupuesto de $10000M.

**Severidad:** alto.

**Reproducción mental:** partida de intendente con popularidad 70 y presupuesto 0 → 'Desarrollo Local' figura cumplido y otorga +10 de popularidad.

---

## 3. ALTO — El "impacto de actividad" electoral usa el `turnLog` de TODA la carrera: reelecciones regaladas

**Archivo:** `src/utils/electionSystem.ts:188-199` (`calculateActivityImpact`)

**Qué hace el código:** el comentario dice "durante el mandato actual", pero el score es `turnLog.reduce(...)` sobre **todo** el historial. `resolvePendingElection` (`src/engine/electionEngine.ts:80-114`) resetea ~25 campos entre mandatos y **omite `turnLog`** (y `historicalPopularity`/`historicalBudget`).

**Qué debería hacer:** contar solo las entradas del mandato que termina (el `turnLogEntry` ya guarda `term`; filtrar por `term === state.term` y posición), o resetear `turnLog` en el reset de mandato (cuidado: `careerLog.ts` lo usa para estadísticas de carrera — mejor filtrar que resetear).

**Impacto:** un mandato tiene 16 turnos y `expectedActions = 16`. Desde el segundo mandato en adelante el score de actividad es ~100 siempre (32+ turnos logueados), aportando `0.15 × 100 = 15` puntos de intención de voto contra los ~8-10 reales de un mandato típicamente activo. Hace todas las reelecciones/ascensos posteriores al primer mandato varios puntos más fáciles.

**Severidad:** alto.

**Reproducción mental:** ganar el primer mandato con 12 acciones/turno registradas; en la elección del segundo mandato, `calculateActivityImpact` cuenta 16+16 turnos → 100 → intención inflada ~+5-7 puntos.

---

## 4. MEDIO — Derrota por hiperinflación inalcanzable (condición muerta)

**Archivos:** `src/engine/turnProcessor.ts:333-334, 217-245` ; `src/utils/victoryConditions.ts:76-78`

**Qué hace el código:** `moneyPrintingCount` sube 1 por emisión, se resetea en cada `resolvePendingElection`, y la única acción que lo incrementa (`emitir_dinero`, `data/actionRegistry.ts:61-70`) tiene `cooldown: 4`. El cooldown se fija al usarla y se decrementa al final del mismo turno (`updateActionCooldowns`, turnProcessor.ts:207-215), así que la acción vuelve a estar disponible cada 3 turnos. Máximo teórico en 16 turnos: turnos 1, 4, 7, 10, 13, 16 → **6 emisiones**. La hiperinflación exige `>= 7`.

**Qué debería hacer:** o bajar el umbral a `>= 6`, o acortar el cooldown, o no resetear `moneyPrintingCount` entre mandatos. Como está, `defeatReason: 'hyperinflation'`, su notificación y su texto en `careerLog.ts:65` son código muerto.

**Severidad:** medio (vía de derrota documentada que jamás ocurre; también la "crisis inflacionaria" de `count >= 5` solo es alcanzable en los últimos 2 turnos del mandato).

**Reproducción mental:** emitir en todos los turnos posibles durante 4 años → `moneyPrintingCount` llega a 6 y nunca a 7.

---

## 5. MEDIO — Pasiva "reuniones gratis" (`freeInteractionGroups`) no quita el costo en acciones que promete

**Archivos:** `src/data/specialAbilities.ts:178,187` ; `src/utils/interactionCosts.ts:62-65` ; `src/engine/gameEngine.ts:322-324`

**Qué hace el código:** las pasivas de político ("Reuniones con aliados **no cuestan acción**") y sindicalista dicen explícitamente que no cuestan acción. La implementación solo hace 0 el **costo en presupuesto** (`calculateInteractionCost` devuelve 0 si el grupo está en `_archetypeFreeInteractions`). `applyInteraction` descuenta `actions: gameState.actions - 1` incondicionalmente.

**Qué debería hacer:** si el subgroup está en `_archetypeFreeInteractions`, no decrementar `actions` (solo presupuesto y cooldown).

**Severidad:** medio (pasiva de arquetipo visiblemente incumplida en gameplay; político/sindicalista pierden ~1 acción por reunión).

**Reproducción mental:** político, reunirse con 'aliados' → el costo en `$` es 0 pero el contador de acciones baja igual.

---

## 6. MEDIO — Doble aplicación de pasivas al crear la partida: ejes de 'político' contaminan el inicio

**Archivo:** `src/engine/gameEngine.ts:64-148,170-235` + `src/engine/archetypeEngine.ts:6-73`

**Qué hace el código:** `getInitialGameState()` invoca `applyArchetypePassives` con el arquetipo por defecto `'politico'` (shift conciliador +2, convocante +1). `createNewGame` vuelve a invocar `applyArchetypePassives` con el arquetipo elegido, que **suma sus shifts encima** sin revertir los de político. Resultado: elegir político arranca con ejes +4/+2 (debería +2/+1); elegir cualquier otro arquetipo arrastra el shift +2/+1 de político.

**Además**, `applyArchetypePassives` muta `baseActions`/`actions` de forma acumulativa (`updated.baseActions = (updated.baseActions || 5) + passive.extraActions`, línea 32-34) sin resetear `baseActions` (sí resetea `_archetypeExtraActions`). Se corrige de pasada en `recalcState`, pero es una trampa: hoy el dato (solo sindicalista tiene `extraActions: 1`) hace que el doble conteo inicial dé el mismo número por casualidad (1+1 vs 1+1); cualquier pasiva futura con `extraActions` lo rompe visiblemente, y el drift queda aplicado en cada `processEndTurn` (paso 0.6) hasta que `recalcState` lo pisa.

**Qué debería hacer:** `getInitialGameState` no debería aplicar pasivas (o `createNewGame` debería partir de un estado sin pasivas); `applyArchetypePassives` no debería escribir `baseActions`/`actions` — eso es responsabilidad exclusiva de `calculateAvailableActions` vía `recalcState`.

**Severidad:** medio.

**Reproducción mental:** nueva partida con sindicalista → inspeccionar `radicalConciliadorAxis` en el turno 1: vale -2 (shift de político + shift de sindicalista) en vez de -2... verificar contra el valor esperado 0/-2 según diseño; con político vale +4.

---

## 7. MEDIO — `historicalBudget`/`historicalPopularity` no se resetean entre mandatos

**Archivo:** `src/engine/electionEngine.ts:80-114` (reset de mandato) + `src/utils/electionSystem.ts:138-146` (`calculateBudgetImpact`)

**Qué hace el código:** el reset de mandato omite los historiales. `calculateBudgetImpact` mide el crecimiento contra `historicalBudget[0]`, que es el presupuesto **inicial de la primera partida/mandato de toda la carrera**, no del mandato que se evalúa. Tras una reelección el presupuesto se reinicia a `POSITION_STARTING_BUDGET + 10%`, por lo que el "growthRate" del segundo mandato arrastra deuda/herencia del primero.

**Qué debería hacer:** pushear un marcador o resetear `historicalBudget`/`historicalPopularity` al inicio de cada mandato (conservando una entrada inicial).

**Severidad:** medio-bajo (sesga la intención de voto en elecciones de segundo+ mandato en ambas direcciones según la partida).

---

## 8. BAJO — Penalidades de antagonistas calculadas con un `diminishingFactor` distinto al de la ganancia real

**Archivo:** `src/engine/turnProcessor.ts:300-363`

**Qué hace el código:** en el paso 1 se aplica `calculateActionEffects(action, state)` y luego se incrementa `actionUsageCount[actionId]`. En el paso 1.5 se vuelve a llamar `calculateActionEffects(action, state)` —ahora con `usageCount+1`— para recomputar `groupEffects` y derivar las penalidades de `applyCrossGroupEffects`. Como `diminishingFactor = 0.8^usageCount`, las penalidades a antagonistas salen ~20% menores que lo proporcional a la ganancia efectivamente aplicada (y divergen más con usos previos).

**Qué debería hacer:** reutilizar los `groupEffects` ya calculados en el paso 1 (guardarlos en un mapa) en vez de recalcular sobre estado mutado.

**Severidad:** bajo (diferencia numérica pequeña, solo afecta a la penalización cruzada).

---

## 9. BAJO — `recentActionIds` de demandas cruza mandatos

**Archivo:** `src/engine/groupAgendaEngine.ts:52-59`

**Qué hace el código:** filtra `turnLog` por número de turno global reconstruido desde `entry.year/entry.turn`. Como `turnLog` no se resetea entre mandatos (ver #3/#7) y el año vuelve a 1 tras cada elección, las entradas del mandato anterior con los mismos valores año/turno se consideran "acciones de los últimos 3 turnos", pudiendo vetar una demanda que en realidad no se ejecutó recientemente (o viceversa).

**Severidad:** bajo.

---

## 10. BAJO — Texto de advertencia de popularidad contradice la regla de derrota

**Archivo:** `src/engine/turnProcessor.ts:29-37` vs `src/utils/victoryConditions.ts:9` (`LOW_POPULARITY_TURNS: 2`)

**Qué hace el código:** la notificación avisa "Tres turnos consecutivos así y podrías perder el gobierno", pero la derrota por popularidad baja ocurre a los **2** turnos consecutivos (`consecutiveLowPopularity >= 2`).

**Severidad:** bajo (mensaje visiblemente engañoso para el jugador).

---

## 11. BAJO — Milestone de carrera mal tipificado al promover desde el mandato 1

**Archivo:** `src/engine/electionEngine.ts:22` (`recordElectionOutcome`)

**Qué hace el código:** `type: state.term === 1 ? 'initial' : option === 'reelection' ? 'reelection' : 'promotion'`. Un intendente que gana y asciende a gobernador en su primer mandato queda registrado como `'initial'` en vez de `'promotion'`, con lo que `careerLog.generateLegacyText` (careerLog.ts:25-38) no genera el párrafo del salto ("dio el salto de Intendente a Gobernador").

**Severidad:** bajo (solo narrativa del legado).

---

## 12. BAJO — Contratar/renovar asesores no recalcula acciones hasta el próximo fin de turno

**Archivo:** `src/engine/gameEngine.ts:342-374` (`hireAdvisors`/`dismissAdvisor`)

**Qué hace el código:** el `bonusActions` de los asesores solo se suma en `calculateAvailableActions`, que solo se invoca desde `recalcState` (fin de turno / elección). Al contratar un asesor, el jugador no ve las acciones extra hasta el turno siguiente, y al despedirlo conserva las acciones del bono durante el turno actual.

**Severidad:** bajo.

---

## Resumen por severidad

| # | Sev | Hallazgo | Archivo clave |
|---|-----|----------|---------------|
| 1 | Alto | Delayed effects `target/value` (y `diplomatic_event`) nunca se aplican | eventResolver.ts:340 / actionEffects.ts:288 |
| 2 | Alto | Objetivos multi-requisito cumplen con UNO (OR vs AND) | victoryConditions.ts:90-115 |
| 3 | Alto | Activity electoral usa turnLog de toda la carrera | electionSystem.ts:188 / electionEngine.ts:80-114 |
| 4 | Medio | Hiperinflación (≥7 emisiones) inalcanzable, cooldown 4 en 16 turnos | victoryConditions.ts:76 / actionRegistry.ts:70 |
| 5 | Medio | Pasiva reuniones gratis no ahorra la acción | gameEngine.ts:322 / interactionCosts.ts:62 |
| 6 | Medio | Doble pasivas al inicio (ejes de político) + baseActions acumulativo | gameEngine.ts:147,234 / archetypeEngine.ts:32 |
| 7 | Medio-bajo | `historicalBudget[0]` cruzado entre mandatos | electionSystem.ts:139 |
| 8 | Bajo | Antagonistas penalizados con diminishingFactor distinto | turnProcessor.ts:353-360 |
| 9 | Bajo | `recentActionIds` cruza mandatos | groupAgendaEngine.ts:54-59 |
| 10 | Bajo | Aviso "3 turnos" vs derrota a los 2 | turnProcessor.ts:34 |
| 11 | Bajo | Milestone 'promotion' marcado 'initial' | electionEngine.ts:22 |
| 12 | Bajo | Bonus de asesores tarda 1 turno | gameEngine.ts:342-374 |

**Verificación:** todos los hallazgos fueron confirmados leyendo el código y, donde aplica, los datos (`actionRegistry.ts`, `specialAbilities.ts`, `interestGroups.ts`, `types/game.ts`). No se hallaron divisiones por cero sin guarda (todas las funciones de promedio verifican arrays vacíos) ni condiciones invertidas adicionales fuera de las ya listadas.
