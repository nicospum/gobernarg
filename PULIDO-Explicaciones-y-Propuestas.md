# Pulido Inicial — Explicaciones y Propuestas

Documento de respuesta a los puntos del checklist marcados como **"Explicar"** o **"Enviar propuesta"**.
Los puntos marcados **"Arreglar"** fueron corregidos directamente en código (con tests de regresión) y se resumen al final.

**Base de código:** `project-bolt-sb1-dzgqso GobernArg 21-11/project`

---

## Punto 1b — ¿Por qué los eventos triggered se disparan en loop infinito?

> **ESTADO: ✅ IMPLEMENTADO (Opción A)** — nuevo campo `lastEventFiredTurns?: Record<string, number>` en `GameState`. `resolveRandomEvents` saltea el evento si `globalTurn - lastFired < cooldown` y registra el turno al disparar. Se inicializa en `getInitialGameState`, se clona en `processEndTurn` (anti-mutación) y se resetea por mandato en `electionEngine` (el turno global reinicia). Tests en `eventResolver.test.ts`.

**Qué pasa:** eventos como `police_violence_scandal` o `minister_resignation` se pueden re-disparar turno tras turno sin límite.

**Causa raíz (3 factores combinados):**

1. `resolveRandomEvents` (`src/engine/eventResolver.ts:238-243`) evalúa **todos** los eventos con `trigger: 'triggered'` cuyas condiciones se cumplan, cada turno, sin registrar cuándo se disparó cada uno.
2. El campo `cooldown` de `GameEvent` **nunca se lee en ninguna parte del código** (verificado por búsqueda exhaustiva). Es metadata muerta: los eventos lo declaran pero el engine lo ignora.
3. El `eventLimiter` (`src/__tests__/eventLimiter.test.ts`) limita cuántos eventos *aleatorios* por turno, pero no aplica a los triggered (usan otro pipeline).

**Propuesta de fix (a elección):**

- **Opción A (mínima):** trackear `lastFiredTurn: Record<string, number>` dentro de `GameState` y en `resolveRandomEvents` saltar el evento si `globalTurn - lastFiredTurn[id] < (event.cooldown ?? 0)`. Persiste en saves y es retrocompatible (default `{}`).
- **Opción B (más estructural):** migrar los triggered al sistema `scheduledEvents`/`eventCooldowns` que ya existe en `EventState` (con `Map<string, number>` de cooldowns), unificando pipelines.

Recomiendo la **Opción A**: ~15 líneas, sin tocar tipos de eventos existentes.

---

## Punto 6 — affectedGroups: propuesta de fix sobre la tabla de impactos

> **ESTADO: ✅ ETAPA 1 IMPLEMENTADA** (cooldown de decisiones abajo). Detalle de lo hecho:
>
> - Nuevo campo `explicitGroupEffects?: { groupId, supportChange }[]` en `GameAction` (`types/game.ts`). Cuando está declarado, `calculateGroupEffects` (`utils/actionEffects.ts`) lo usa como **fuente de verdad** y saltea el matcher textual. Sin declarar, el matcher queda como fallback (comportamiento actual intacto).
> - **5 acciones legítimas migradas con magnitudes idénticas** a las que producía el matcher: plan_viviendas → sectores-populares +12 · cobertura_social → sectores-populares +12 · viviendas_rurales → sectores-populares +9 · seguridad_ciudadana → clase-media +14 · sistema_vigilancia → clase-media +10.5. **Cero cambio de balance.**
> - **3 acciones con falso positivo saneadas**: subsidios_industriales, tercera_edad y fomento_emprendimiento reciben efectos explícitos coherentes con sus `affectedGroups` declarados, calculados con la fórmula del propio juego (pop × influence/10; oposición negativa):
>   - subsidios_industriales: empresarios +8, sindicatos +8, sector-financiero −9, ongs −6
>   - tercera_edad: sectores-populares +9, clase-media +10.5, ongs +9
>   - fomento_emprendimiento: empresarios +9.6, cooperativas +6, clase-media +8.4
> - **Keyword "apoyo" eliminado de los interests de deportistas** (`data/interestGroups.ts`): mataba toda la clase de falsos positivos, no solo las 3 acciones.
> - ⚠️ Nota de balance: las 3 acciones saneadas **ganan** efectos grupales reales que antes no tenían (salvo el espurio). Es la decisión "que el tooltip diga la verdad" — si alguna magnitud te parece mucho, se ajusta a mano en `actionCategories.ts`.
> - La **Etapa 2** (auditar las 56 restantes y asignar efectos o corregir declaraciones) sigue pendiente y es diseño de balance para hacer con vos.

La tabla (`tabla_impactos_acciones.md`, revisada y aprobada por un segundo agente con 4 correcciones numéricas menores en `tabla_impactos_revision.md`) muestra el diagnóstico:

- **56/61 acciones ❌, 5 ⚠️, 0 ✅** en "efectos reales vs declarados".
- Solo **8 acciones** generan efectos grupales reales, y por matching textual (`description ∩ interests`), no por datos.
- `affectedGroups` solo alimenta el tooltip de la tarjeta (`ActionCard.tsx:113-131`).
- `satisfiesDemand` no tiene ningún consumidor en `src/` — metadata muerta.
- **14/18 grupos** jamás son afectados por ninguna acción.

**Propuesta (en 2 etapas):**

1. **Etapa 1 — honestidad inmediata (bajo riesgo):** agregar `effects.groupEffects: [{ groupId, supportChange }]` declarativos en `actionCategories.ts` para las acciones con matching textual confirmado (las 8), migrando esos casos del matcher frágil a datos explícitos. El matcher queda como fallback.
2. **Etapa 2 — cobertura real:** auditar las 56 restantes y asignarles `groupEffects`/`satisfiesDemand` coherentes con su `affectedGroups` declarado, o corregir la declaración si sobre-promete. Esto es diseño de balance, no solo código: conviene hacerlo con tus definiciones de juego, no por inferencia automática.

OJO: `satisfiesDemand` no se consume hoy; si en la Etapa 2 se lo empieza a usar, verificar que `groupAgendaEngine` lo interprete como "esta acción satisface la demanda X" sin duplicar efectos.

---

## Punto 10 — Hiperinflación inalcanzable

> **ESTADO: ✅ IMPLEMENTADO** — cooldown de `emitir_dinero` bajado de 4 a 3 (máximo teórico ahora 5 emisiones por mandato, 7 alcanzable en carrera) + advertencia escalonada en `addWarningNotifications`: a las 3 emisiones "Riesgo inflacionario" (high, ya existía) y a las 5 "Riesgo de hiperinflación" (**critical**, avisa que a las 7 se pierde el gobierno). El umbral de derrota queda en 7. Tests en `turnProcessor.test.ts`.

**El problema:** la derrota por hiperinflación exige `moneyPrintingCount >= 7` (`victoryConditions.ts`), pero la emisión monetaria tiene cooldown de 4 turnos: en un mandato de 16 turnos el máximo teórico es 4 emisiones, y llegando con préstamos previos quizá 6. **Umbral imposible de alcanzar** — la condición de derrota es decorativa.

**Propuestas (elegir una):**

1. **Bajar el umbral a 5-6 emisiones** (1 línea + ajustar test existente). Mantiene el cooldown actual.
2. **Bajar el cooldown de emisión a 3 turnos** y umbral a 7 (más dinámico, permite respuestas de crisis).
3. **Advertencia progresiva:** notificación al alcanzar 3 emisiones ("el mercado observa la impresión de dinero") y 5 ("riesgo de hiperinflación"), manteniendo el umbral en 7 con cooldown 3.

Mi recomendación: **opción 3 con cooldown 3** — la mecánica queda viva como presión, no como trampa invisible, y el jugador recibe señal antes de la derrota.

---

## Punto 11 — Demandas de grupos inejecutables

**El problema:** `groupAgendaEngine` genera demandas ("reforma_impositiva", "subsidio_transporte", etc.) sin verificar que el jugador *pueda* ejecutar la acción que las satisface. Las condiciones de ejecutabilidad (`minLegislativeSupport`, `minGroupSupport`, `minBudget`) se evalúan solo en `canExecuteAction`, al intentar ejecutar.

**Consecuencia:** un grupo puede exigir algo que es imposible cumplir en el estado actual → frustración garantizada y pérdida de apoyo por algo fuera del control del jugador.

**Propuesta:** filtrar candidatas en la generación de la agenda:

```
al generar demanda para grupo G:
  candidatas = acciones con satisfiesDemand(G)
  ejecutables = candidatas.filter(a => canExecuteAction(state, a).executable)
  elegir de ejecutables (o, si todas están bloqueadas, caer en demanda genérica de apoyo $ o popularidad)
```

Esto exige primero resolver el Punto 6 (hacer consumible `satisfiesDemand`), así que queda **bloqueado detrás de la Etapa 1 del Punto 6**.

---

## Punto 12 — Pasiva "reuniones gratis" no funciona del todo

> **ESTADO: ✅ RESUELTO SIN TOCAR DINÁMICA** — el comportamiento del código (reuniones gratis en **dinero**, gastan acción) quedó como estaba y se corrigieron los **textos** de las pasivas en `data/specialAbilities.ts` ("no cuestan acción" → "no cuestan dinero"), tanto en político (Constructor de alianzas) como en sindicalista (Base movilizada). Si más adelante querés que sean gratis en acciones de verdad, eso ya es decisión de balance.

**Qué funciona:** `_archetypeFreeInteractions` (ej. político: reuniones con `aliados` no cuestan **dinero**) sí se respeta en `calculateInteractionCost` (`interactionCosts.ts`) — el costo en $ se anula.

**Qué NO funciona:** `applyInteraction` (`gameEngine.ts`) siempre descuenta **1 acción**, sin consultar `_archetypeFreeInteractions`. La descripción de la pasiva dice "no cuestan acción", así que el texto promete más de lo que el código entrega.

**Propuesta (2 líneas):**

```ts
// en applyInteraction, antes de descontar:
const isFree = (gameState._archetypeFreeInteractions ?? []).includes(subgroupId);
if (!isFree && gameState.actions > 0) { /* descontar acción */ }
```

**Advertencia de balance:** el político ya es el arquetipo con mejor retención electoral; reuniones de acción gratis puede ser muy fuerte. Alternativa conservadora: que sigan gastando acción pero también den +1 de apoyo extra (bonus en vez de gratuidad). **Elegí uno y lo implemento.**

---

## Punto 14 — historicalBudget no resetea al cambiar de mandato

> **ESTADO: ✅ IMPLEMENTADO** — `state.historicalBudget = [state.budget]` agregado al reset de mandato en `electionEngine.ts`. Test de regresión en `gameEngine.test.ts` (reelección ganada → historicalBudget = [presupuesto nuevo]).
> Nota: `historicalPopularity` **no** necesita reset — `calculatePopularityImpact` usa `slice(-4)` (siempre los últimos 4 turnos), así que se autorregula entre mandatos.

**El problema:** `calculateBudgetImpact` (`electionSystem.ts:138-146`) mide el crecimiento del presupuesto contra `historicalBudget[0]` — el primer valor de **toda la carrera**. Al asumir un segundo mandato, tu "crecimiento" se mide contra el presupuesto inicial de intendente, no contra el con el que arrancaste el mandato actual.

**Consecuencia:** si heredás mucho presupuesto de un mandato anterior, el crecimiento aparece inflado (+puntos de intención de voto gratis); si el mandato anterior te dejó en números altos y este consumiste, aparece negativo aunque el mandato actual haya ido bien.

**Propuesta:** en el reset de mandato de `electionEngine.ts`, agregar `state.historicalBudget = [state.budget]` (como ya se hace con `historicalPopularity`). 1 línea + test. **Riesgo casi nulo.**

---

## Punto 15 — Cola de eventos: reemplazo vs concatenación

> **ESTADO: ✅ IMPLEMENTADO** — `setPendingEvents(prev => [...prev, ...nuevos])` en `App.tsx`. Idempotente con el flujo actual y a prueba de futuro.

**Qué pasa hoy:** en `handleEndTurn` (`App.tsx`) `setPendingEvents(result.triggeredEvents.filter(...))` **reemplaza** la cola. Si quedaba un evento sin responder de un turno anterior (imposible hoy porque el modal bloquea, pero frágil ante futuros cambios tipo "eventos encadenados"), se descarta silenciosamente.

**Evaluación:** con el flujo actual no es un bug observable — el `EventModal` bloquea la UI hasta resolver, y la cola siempre está vacía al terminar el turno. Es **fragilidad latente**, no bug activo.

**Propuesta:** concatenar en vez de reemplazar:

```ts
setPendingEvents(prev => [...prev, ...result.triggeredEvents.filter(e => e.choices && e.choices.length > 0)]);
```

Idempotente con el comportamiento actual (cola vacía = mismo resultado) y a prueba de futuro. **Riesgo cero, 1 línea.** Recomiendo hacerla ya junto con los fixes.

---

## Resumen de lo ya corregido en código (puntos "Arreglar")

| Punto | Fix | Archivo |
|---|---|---|
| 1a | Efectos diferidos de eventos traducidos al shape real de `PendingEffect` (antes se descartaban en silencio) + anti-mutación de `groupRelations` | `engine/eventResolver.ts` |
| 2 | Guard anti doble-clic en `resolvePendingElection` (un segundo clic re-reseteaba el mandato) | `engine/electionEngine.ts` |
| 3 | Guard anti doble-clic en `handleEventChoice` con `useRef` (dos clics aplicaban efectos ×2) | `App.tsx` |
| 4 | `ElectionResultsModal` ahora visible también en derrota (el `!gameOver` lo ocultaba); `GameOverModal` espera a que cierres los resultados | `App.tsx` |
| 7 | Objetivos multi-requisito ahora usan lógica AND (antes bastaba cumplir UN requisito) | `utils/victoryConditions.ts` |
| 8 | Actividad electoral cuenta solo el mandato actual (antes sumaba toda la carrera, +15 puntos gratis desde el 2º mandato) | `utils/electionSystem.ts` |
| 9 | `completedObjectives` clonado en `processEndTurn` (antes mutaba el estado prev de React) | `engine/turnProcessor.ts` |
| 13 | `hireAdvisors`: anti duplicados + máximo 2 slots; `getInitialGameState` ya no aplica pasivas del arquetipo default (se duplicaban en `createNewGame`) | `engine/gameEngine.ts` |
| 6 (Etapa 1) | `explicitGroupEffects` como fuente de verdad en `calculateGroupEffects`; 8 acciones migradas; keyword "apoyo" eliminado de deportistas | `types/game.ts`, `utils/actionEffects.ts`, `data/actionCategories.ts`, `data/interestGroups.ts` |
| 10 | Cooldown de `emitir_dinero` 4 → 3 + advertencia "Riesgo de hiperinflación" (critical) a las 5 emisiones | `data/actionCategories.ts`, `engine/turnProcessor.ts` |
| 14 | `historicalBudget` se resetea al presupuesto del nuevo mandato | `engine/electionEngine.ts` |

**Tests de regresión agregados:** 24 tests nuevos repartidos en `victoryConditions`, `electionSystem`, `eventResolver`, `gameEngine`, `turnProcessor` y `actionEffects` (183 → 207).

---

*Generado como parte del Pulido Inicial del checklist. Las propuestas de los puntos 1b, 6, 10, 11, 12, 14 y 15 quedan a la espera de tu elección para implementar.*

---

## ADDENDUM — Segunda tanda (bugs de código, sin tocar dinámica)

Además de los puntos del checklist, un barrido de los reportes 8-12 encontró 21 problemas. **13 fixes mecánicos ya aplicados** (217/217 tests, tsc limpio):

| # | Fix |
|---|---|
| 3 | `GameOverModal` ya no tapa al `EventModal` cuando ambos aparecen el mismo turno (la elección del evento se perdía) |
| 9 | `recentActionIds` de demandas filtra por mandato actual (entradas del mandato anterior vetaban demandas) |
| 10 | Aviso de popularidad crítica: texto real ("dos turnos") y umbral por cargo (20/25/30), no fijo en 20 |
| 11 | Milestone de carrera: ascender en el mandato 1 registra `promotion`, no `initial` (el legacy text no contaba el salto) |
| 12 | `hireAdvisors`/`dismissAdvisor` recalculan acciones al instante (recalcState) — el bono ya no espera al próximo turno |
| 13 | Las notificaciones guardan su año/trimestre de creación (antes mostraban el turno vivo como fecha) |
| 14 | `GameLog` muestra el título de la acción, no el id crudo |
| 15 | Indicador de popularidad de asesores con ícono/color según signo (antes siempre verde↑) |
| 16 | `ActiveBenefits`: filtro unificado con el criterio del engine y sin badge "0t" |
| 17 | Consejos de derrota alineados con las reglas reales (impeachment ≠ apoyo legislativo; hiperinflación = 7 emisiones) |
| 19 | Texto de la estrategia `abrirse` describe su efecto real |
| 20 | `TurnResult.triggeredEvents` tipado como `GameEvent[]` (era `any[]`) |
| 21 | `ReelectionChoiceModal` lee el umbral de popularidad de `careerRules` (no más "75%" hardcodeado) |

**Pospuestos a la sesión de dinámica/balance** (requieren decisión de diseño o tocan números):

1. **Objetivo de intendente imposible** — `community-support` exige 2 acciones solo de gobernador/presidente. Hay que decidir qué acciones de intendente lo reemplazan.
2. **Demandas inejecutables** (Punto 11) — el filtro de agendas ignora minLegislativeSupport/minGroupSupport/minBudget.
3. **"Probabilidad de éxito" de eventos decorativa** — la barra existe pero `applyEventChoice` no tira dados. Quitar la barra o implementar la tirada.
4. **Campos de asesores sin efecto** — groupBonuses/policyModifiers/popularityEffect/etc. se muestran pero ningún engine los aplica.
5. **Pasiva extraLoans del empresario sin efecto** — `getMaxLoans` existe pero el límite sigue hardcodeado en 3.
6. **Signo sospechoso en `coalition_opportunity`** — aceptar la coalición da `opositores +20`; probablemente era `aliados`.
7. **Antagonistas con diminishingFactor desalineado** (~20% menor que la ganancia real).
8. **`futureEffects` con delay 5-6 caen fuera del mandato** — se pierden al resetear pendingEffects en la elección.
9. **Punto 6 Etapa 2** — balance de las 56 acciones restantes (tabla de propuesta para revisar).
