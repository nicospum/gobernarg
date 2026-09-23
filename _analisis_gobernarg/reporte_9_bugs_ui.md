# Reporte 9 — Bugs de UI (Cazador_Bugs_UI)

**Fecha:** 2026-09-20
**Alcance:** `src/App.tsx` + todos los componentes en `src/components/*.tsx` (incl. `ui/progress.tsx`).
**Criterio:** solo bugs verificados leyendo el código (línea exacta + razonamiento). Se excluye el bug ya fixeado de GameOverModal tapado por LegacyScreen y la deuda estructural conocida (props drilling, god components, doble tooltip, modales sin abstracción, motion infrautilizado, restos de tema claro).

---

## CRÍTICOS / ALTOS

### 1. Doble clic en una opción electoral aplica el reset de mandato DOS veces
- **Archivo:** `src/components/ReelectionChoiceModal.tsx:50-53` (botón sin protección) + `src/engine/electionEngine.ts:30-34` (`resolvePendingElection` sin guarda de `pendingElection`)
- **Descripción:** `handleElectionChoice` en `App.tsx:142-144` usa `setGameState(prev => resolvePendingElection(prev, option))` (update funcional). Un doble clic dispara dos updates secuenciales: el primero resuelve la elección (`pendingElection=false`), el segundo vuelve a entrar a `resolvePendingElection` porque **no verifica `pendingElection`**. Todo el bloque de victoria corre dos veces:
  - `popularity = popularity*0.7+30` aplicado 2× (transformación compuesta incorrecta)
  - `budget = POSITION_STARTING_BUDGET + budget*0.1` aplicado 2× (usa el budget ya reseteado)
  - `termsByPosition[previousPosition]` incrementado 2×
  - **dos milestones duplicados** en `careerHistory`
- **Severidad:** ALTA
- **Impacto:** un jugador que hace doble clic al elegir reelección/promoción queda con popularidad, presupuesto, contadores de mandato y legado corruptos. Es el click más importante del juego y el más vulnerable.

### 2. Doble clic en una opción de evento aplica los efectos DOS veces
- **Archivo:** `src/App.tsx:134-140` (`handleEventChoice`) + `src/components/EventModal.tsx:165-167` (botón sin `disabled`/guard)
- **Descripción:** `handleEventChoice` lee `pendingEvents` del **closure** (`const [currentEvent, ...rest] = pendingEvents`), no del estado fresco. En un doble clic, ambas invocaciones usan el mismo `currentEvent` y ambas ejecutan `applyEventChoice(prev, currentEvent, choiceId)` (que **no es idempotente**: aplica `choice.effects.immediate` cada vez, ver `src/engine/eventResolver.ts:332-338`). Los efectos inmediatos (presupuesto, popularidad, estabilidad, grupos) se duplican. `setPendingEvents(rest)` es idempotente, así que la cola no se corrompe, pero el daño del evento sí.
- **Severidad:** ALTA
- **Impacto:** cualquier evento con doble clic inflige el doble de penalidad/bonus. Eventos críticos (crisis, -20 estabilidad, etc.) se resuelven con el doble de castigo sin que el jugador lo sepa.

### 3. Al perder una elección, el resultado electoral nunca se muestra
- **Archivo:** `src/App.tsx:286-291`
- **Descripción:** la condición de render es `!gameState.pendingElection && gameState.electionResults && !gameState.gameOver`. Pero en `src/engine/electionEngine.ts:45-49`, cuando `!results.victory` se setean **a la vez** `electionResults` y `gameOver=true`. Resultado: en derrota electoral `gameOver` bloquea `ElectionResultsModal` y el jugador salta directo al `GameOverModal` (motivo `election_loss`). Nunca ve el porcentaje de votos ni el desglose (popularidad 35%, grupos 25%, etc.) que el modal está diseñado para mostrar — solo en victoria.
- **Severidad:** MEDIA-ALTA
- **Impacto:** el desenlace más narrativo del juego (perder las urnas) se reduce a un cartel genérico; el jugador no sabe por cuánto perdió. Además `handleCloseElectionResults` queda como handler muerto en el camino de derrota.

---

## MEDIOS

### 4. Modales apilados sin coordinación de z-index ni de resolución
- **Archivo:** `src/App.tsx:264-323`
- **Descripción:** Todos los modales usan `z-50` y se apilan por orden de DOM. Combinaciones problemáticas verificables:
  - `EventModal` (línea 271) queda **debajo** de `ReelectionChoiceModal` (279), `MidtermStrategyModal` (301) y `GameOverModal` (293). Si el fin de turno dispara `triggeredEvents` y a la vez `gameOver` (p. ej. colapso por popularidad en turno de evento), `GameOverModal` tapa al evento: la elección del evento **jamás se aplica** (efectos perdidos silenciosamente) y el modal queda montado detrás.
  - `handleEndTurn` (129-131) hace `setPendingEvents(result.triggeredEvents.filter(...))` **reemplazando** la cola en vez de concatenar; hoy no es explotable porque el modal bloquea la UI, pero cualquier evento pendiente se sobrescribiría.
- **Severidad:** MEDIA
- **Impacto:** pérdida silenciosa de efectos de eventos cuando coinciden con game over / elección; arquitectura frágil ante cualquier futuro flujo async.

### 5. Asesores ya contratados se pueden volver a contratar (duplicados)
- **Archivo:** `src/components/AdvisorSelectionModal.tsx:73` + `src/engine/gameEngine.ts:342-362`
- **Descripción:** `availableForHire = availableAdvisors.filter(isAdvisorAvailable)` **no excluye** `gameState.advisors` ya contratados, y `hireAdvisors` tampoco deduplica por `id`. Como `advisorActionUsed` se resetea cada turno (`src/engine/turnProcessor.ts:594`), en el turno siguiente el jugador puede contratar de nuevo al mismo asesor: paga 2 veles, quedan 2 entradas con el mismo `id` en `gameState.advisors` → **keys duplicadas** en `AdvisorPanel.tsx:74` (`key={advisor.id}`), bonificaciones contadas 2 veces, y "Despedir Asesor" (`dismissAdvisor` filtra por id) elimina **ambas** copias de una sola vez.
- **Severidad:** MEDIA
- **Impacto:** exploit económico/bonificación doble o, al despedit, pérdida de 2 asesores con un solo click; React además warna por keys duplicadas.

---

## BAJOS

### 6. Notificaciones muestran el turno actual como fecha de creación
- **Archivo:** `src/components/NotificationCenter.tsx:66-68`
- **Descripción:** cada notificación renderiza `Año {gameState.year} · Trimestre {gameState.turn}` usando el estado **actual** del juego, no el del turno en que se creó. El campo `timestamp` existe (`src/types/game.ts:411`) pero es `Date.now()` (`engineShared.ts:94`), inútil para mapear a turno de juego. Una notificación de hace 6 turnos aparece como creada hoy.
- **Severidad:** BAJA
- **Impacto:** información temporal engañosa; confunde el diagnóstico del jugador sobre cuándo ocurrió cada crisis.

### 7. GameLog muestra IDs crudos de acciones
- **Archivo:** `src/components/GameLog.tsx:39-43`
- **Descripción:** `entry.actionsTaken.map(action => ...{action}...)` imprime el id (`obra_publica_escuela`) sin resolver. `ManagementNotebook.tsx:336-339` sí resuelve el título vía `actionDefinitions.find(...)`. Inconsistencia entre dos vistas del mismo dato.
- **Severidad:** BAJA
- **Impacto:** el Historial (botón "L") muestra slugs técnicos ilegibles.

### 8. Efectos inmediatos duplicados visualmente en EventModal
- **Archivo:** `src/components/EventModal.tsx:174-205` vs `229-251`
- **Descripción:** cada opción muestra los mismos `choice.effects.immediate` dos veces: primero como badges `CostBadge` y debajo otra vez como lista "Efectos inmediatos" (`effect.target: +valor`). Misma información, dos formatos, duplica la altura del modal.
- **Severidad:** BAJA
- **Impacto:** ruido visual; en eventos con muchos efectos el modal crece innecesariamente.

### 9. Indicador de popularidad de asesor siempre muestra flecha verde
- **Archivo:** `src/components/AdvisorPanel.tsx:15-19` y `src/components/AdvisorSelectionModal.tsx:14-18`
- **Descripción:** `getPopularityIndicator` devuelve 1-3 íconos `TrendingUp` en verde (`text-emerald-400`) para cualquier valor; con `popularityEffect` negativo o 0 sigue mostrando una flecha verde hacia arriba, indicando lo contrario de lo que el número dice.
- **Severidad:** BAJA
- **Impacto:** señalización engañosa al comparar asesores.

### 10. ActiveBenefits: filtro inconsistente y "0t"
- **Archivo:** `src/components/ActiveBenefits.tsx:18-21, 33, 55`
- **Descripción:** (a) los efectos con `stabilityChange` se excluyen cuando `activationTurn === currentGlobalTurn` (condición `pe.activationTurn > currentGlobalTurn` solo para estabilidad), inconsistente con ingresos/costo; (b) efectos con `activationTurn < currentGlobalTurn` pero aún dentro de su `duration` quedan fuera (`>= currentGlobalTurn`); (c) `turnsLeft` puede ser 0 → renderiza literal "0t".
- **Severidad:** BAJA
- **Impacto:** beneficios vigentes no listados o listados con contador vacío.

### 11. Texto hardcodeado de requisitos en ReelectionChoiceModal
- **Archivo:** `src/components/ReelectionChoiceModal.tsx:68-74`
- **Descripción:** el mensaje de requisito es `option === 'promote-president' ? '75%' : 'popularidad suficiente'`, independiente de la lógica real de `canRunForOption`. Si los umbrales cambian en `utils/electionSystem.ts`, el texto queda desactualizado (contradicción texto/estado).
- **Severidad:** BAJA
- **Impacto:** mensaje de bloqueo genérico que puede no reflejar el requisito real.

---

## No verificados / descartados (para transparencia)

- **Soft-lock por `availableMidtermStrategies` vacío:** descartado — `filterAvailableMidtermStrategies` siempre incluye `'negociar'` (`engineShared.ts:121`).
- **`pendingElectionOptions` vacío con modal sin botón:** el engine resuelve el caso presidente (`turnProcessor.ts:500-504`); no se encontró camino real a ese estado.
- **MAX_TURNS=16 en GameHeader:** correcto — el mandato es 4 años × 4 trimestres y `year` se resetea a 1 por mandato (`electionEngine.ts:81`).
- **Keys por índice:** `TurnSummaryModal`, `AdvisorSelectionModal`, `LegacyScreen` usan `key={index}` en listas estáticas de render único — sin reordenamiento, sin bug real.
