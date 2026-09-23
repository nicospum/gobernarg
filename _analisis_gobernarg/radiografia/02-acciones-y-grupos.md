# 2. Acciones políticas y grupos de interés

**Radiografía de SOLO LECTURA — GobernArg (TypeScript, MVP presidente-only).** Branch `rediseno-visual`. Sin propuestas de cambio ni balance: solo el sistema real, con números literales y referencias archivo:función:línea.

**Nota de archivo previa:** las rutas asumidas difieren del repo real. `actionEffects.ts` vive en `src/utils/actionEffects.ts` (no en `engine/`); `actionCalculator.ts` es `src/utils/actionCalculator.ts` y calcula **cantidad de acciones por turno**, no efectos; `interactionCosts.ts` es `src/utils/interactionCosts.ts`. **No existe `canExecuteAction`** — la disponibilidad es `getAvailableActionsForState` + `toggleActionSelection` (ambas en `src/engine/actionEngine.ts`).

---

## PARTE 1 — ACCIONES

### 1.1 Tabla-resumen por categoría (61 acciones, `src/data/actionRegistry.ts`)

Valores **literales del registry** (antes de multiplicadores del motor):

| Categoría | N | budgetChange | popularityChange | explicitGroupEffects | cooldown propio | prerequisites | futureEffects | multiEffects |
|---|---|---|---|---|---|---|---|---|
| economia | 12 | −400…+800 | −20…+20 | 2 | 3 | 2 | 4 | 3 |
| social | 10 | −400…−200 | +12…+20 | 3 | 0 | 0 | 1 | 0 |
| infraestructura | 14 | −700…−80 | +2…+20 | 1 | 1 | 4 | 4 | 0 |
| diplomacia | 7 | −300…−150 | +8…+15 | 0 | 0 | 1 | 0 | 0 |
| seguridad | 7 | −500…−250 | +10…+20 | 2 | 1 | 1 | 1 | 1 |
| cultura | 8 | −400…−200 | +10…+18 | 0 | 0 | 0 | 0 | 0 |
| educacion | 1 | −100 | +10 | 0 | 0 | 0 | 0 | 0 |
| turismo | 1 | −50 | +8 | 0 | 0 | 0 | 0 | 0 |
| tecnologia | 1 | −200 | +12 | 0 | 0 | 0 | 0 | 0 |

- **explicitGroupEffects (8 acciones):** `subsidios_industriales` (empresarios +8, sindicatos +8, sector-financiero −9, ongs −6), `fomento_emprendimiento` (empresarios +9.6, cooperativas +6, clase-media +8.4), `plan_viviendas` (sectores-populares +12), `cobertura_social` (sectores-populares +12), `tercera_edad` (sectores-populares +9, clase-media +10.5, ongs +9), `viviendas_rurales` (sectores-populares +9), `seguridad_ciudadana` (clase-media +14), `sistema_vigilancia` (clase-media +10.5).
- **Las otras 53 declaran `affectedGroups` SIN efecto real** (ver 1.3 y Hallazgos).
- **Cooldown explícito (5):** emitir_dinero:3, prestamo_internacional:8, prestamo_local:8, estudio_factibilidad:2, seguridad_ciudadana:3.
- **minBudget:** todas lo tienen; valores posibles 0,50,80,100,150,200,250,300,350,400,450,500,600,700 (siempre = |budgetChange| salvo excepciones: emitir_dinero minBudget:0 con +150).
- **minLegislativeSupport (1):** reforma_impositiva:45 (con comentario en código: imposible — legislativeSupport es null hasta año 2 y fijo después; se mantiene deliberado).
- **minGroupSupport (1):** tratado_comercio: empresarios≥60.
- **requiredActions (7):** reforma_impositiva←mejorar_recaudacion; prestamo_internacional←mejorar_recaudacion; energia_renovable, construccion_hospitales, infraestructura_vial←estudio_factibilidad; modernizacion_aeropuertos←estudio_factibilidad+infraestructura_vial; lucha_narcotrafico←fortalecimiento_justicia.
- **satisfiesDemand:** 44 acciones lo declaran, pero **ningún código del engine lo lee** (solo types/tests). Campo muerto.

### 1.2 Cadena de ejecución completa

**Selección (pre-turno):** `toggleActionSelection` (actionEngine.ts:97) → verifica `getAvailableActionsForState` (actionEngine.ts:28), que filtra por: exclusión por cargo (vacía, engineShared.ts:46), préstamos según dificultad (loansAvailable false en difícil/extremo, difficultyEngine.ts:44,52), `availableForPositions`, cooldown>0, prerequisites (requiredActions/minLegislativeSupport/minLegitimacy/minGroupSupport), budget≥minBudget, minPopularity, advisorRequired, groupSupportRequired, y `unlockedActions` (arranca con TODAS, gameEngine.ts:118). Cada acción mapea a `actionCost`: reforma = 1 + penalidad legislativa; no-reforma = 1.

**Penalidad legislativa** (`getLegislativePenalty`, actionEngine.ts:16): legislativeSupport null → 0; ≥45 → −1; ≥38 → 0; ≥35 → +1; <35 → +2. Reforma = categoría economia/infraestructura **o** |budgetChange|≥200 (actionEngine.ts:12-13) → casi todas; excepciones no-reforma: emitir_dinero, estudio_factibilidad, fomentar_turismo, promover_educacion.

**Fin de turno** (`processEndTurn`, turnProcessor.ts:265), orden exacto:
1. `processCalendarEvents` → `resolveLegislativeConsequences` → `applyArchetypePassives` (pasos 0–0.6).
2. **Paso 1 — por cada acción seleccionada** (turnProcessor.ts:323-373): `calculateActionEffects` (actionEffects.ts:22) y aplica:
   - budget += budgetChange; popularity += popularityChange; stability/legitimacy/votingIntention (multiEffects ×diminishingFactor).
   - **Grupos:** `groupRelations[ge.groupId] += ge.supportChange` (clamped 0-100) — **crudo, sin 0.40 ni diminishingFactor**.
   - push pendingEffects; completedActions; emitir_dinero → moneyPrintingCount++; actionUsageCount++; `actionCooldowns[id] = cooldown ?? getDefaultCooldown`; préstamos → debtCount=min(3, +1), debtServiceRatio=debtCount×0.10; legitimidad vía `calculateLegitimacyChange` (legitimacyEngine.ts:4: +3 si cultura/diplomacia; −8 si pop≤−10 y budget≤−400; −min(5, |pop|×0.1) si pop<0); shift de ejes.
3. **Paso 1.5 — antagonismo cruzado** (turnProcessor.ts:380): `applyCrossGroupEffects(state, groupChanges)` — **una sola pasada** sobre los cambios ya calculados (fix Punto 13).
4. **Paso 2 — pendingEffects** que activan este turno (processPendingEffects, actionEffects.ts:267).
5. **Paso 3 — ingreso/gastos fijos:** presidente income 500, maintenance 350 (engineShared.ts:18-28), ×(1−debtServiceRatio), ×(1+incomeModifier activo), ×(1+_archetypeIncomeBonus), ×difficultyIncomeMultiplier.
6. Pasos 3.5-4: estrategia midterm; **desgaste de popularidad −10/turno presidente** (×difficultyDecay); efectos de ejes extremos (±80).
7. Pasos 7.x: cooldowns de interacciones (turnsLeft 2), cooldowns de acciones, inflación por emisión, moods/agendas/negociaciones/penalidades de demanda, cooldowns de habilidades.
8. `recalcState` → `checkDefeat` → notificaciones → objetivos.

**Fórmula de efectos inmediatos** (actionEffects.ts:71-84):

```
popularityChange = effPop × archetypeMult × advisorMult × strategyMult × reunionMult × 0.40 × diminishing × axisEff
budgetChange     = budgetChange × diminishing × costMultiplier × axisCost
   donde diminishing = (action.diminishingFactor ?? 0.80)^usageCount
   y si usageCount≥5 y pop>0 → la popularidad se INVIERTE a negativa
groupEffects     = crudos (solo ×bonus temporal de reunión si aplica, ×1.1)
```

Multiplicadores: arquetipo (politico ×1.2 diplomacia; empresario ×1.3 economía/×0.9 resto; sindicalista ×1.3 social/×0.9; comunicador ×1.1), asesor activo de especialidad matching ×1.2 por asesor, estrategia midterm (año≥3), reunión ×1.1, ejes extremos.

### 1.3 Matcher textual — estado: MUERTO

`calculateGroupEffects` (actionEffects.ts:144): si hay explicitGroupEffects → esos y **solo esos**; si no, matchea `subgroup.interests` contra `action.description` (substring case-insensitive) y da `popularityChange × (influence/10)`.

Verificación exhaustiva por script de los 61×36 pares acción/interés: **solo 4 coincidencias** —

| Interés | Acción |
|---|---|
| clase-media: "seguridad" | seguridad_ciudadana, sistema_vigilancia |
| sectores-populares: "Programas sociales" | cobertura_social |
| sectores-populares: "vivienda" | plan_viviendas, viviendas_rurales |

Las 4 tienen explicitGroupEffects → el matcher **nunca se ejecuta en la práctica**. Para las otras 53 acciones: **cero efecto grupal**. "educativa" ≠ "educación", etc.

### 1.4 Cooldowns

`getDefaultCooldown` (actionEffects.ts:257): explícito si existe; si no: préstamo/emitir_dinero → 8; |budget|>500 → 6; ≥200 → 3; resto → 1. Se registra en `state.actionCooldowns` al ejecutar (turnProcessor.ts:363-364) y decrementa en `updateActionCooldowns` (turnProcessor.ts:221): solo se conservan entradas >1 (decrementadas); cooldown=1 desaparece al final del mismo turno → **una acción de cooldown implícito 1 se puede usar cada turno**. Bloqueo de selección: `actionCooldowns[id] > 0` (actionEngine.ts:40).

### 1.5 Acciones especiales

**emitir_dinero** (registry:60-85): +150 budget, popularity +3 (efectivo +1.2 con factor 0.40), stability −3, legitimacy −5, votingIntention −2; cooldown 3; diminishing 0.65 (agresivo); moneyPrintingCount++ → inflación (turnProcessor.ts:231): count=3 → −5 pop y −50 budget **por turno**; count=5 → −20 pop y −300 budget/turno; **count≥7 → derrota hiperinflación** (victoryConditions.ts:76). Avisos a count 3 y 5 (turnProcessor.ts:64-81). Con 16 turnos/mandato y cooldown 3, máximo 5-6 emisiones: la derrota (7) es alcanzable solo en 2º mandato.

**Préstamos:** internacional +800/legitimacy −8/stability +5 (requiere mejorar_recaudacion, presidente-only); local +500/legitimacy −5. Ambos cooldown 8, diminishing 0.90, futureEffects (−100@t+4 pop−3 / −75@t+3 pop−2). Deuda: `debtCount = min(3, +1)`, `debtServiceRatio = debtCount×0.10` → ingreso −10/−20/−30 % (turnProcessor.ts:365-368, 390). Límite real: **el hardcodeo `Math.min(3,…)` ignora la pasiva de empresario** (`getMaxLoans` = 3+extraLoans existe en archetypeEngine.ts:87 pero con TODO de integración — no cableado).

**Interacciones** (`applyInteraction`, gameEngine.ts:248; costos en interactionCosts.ts):

| Tipo | Costo $ | Costo acción | Δapoyo | Efectos extra |
|---|---|---|---|---|
| reunión | 10 | 1 | +2 | bono temporal 3 turnos: actionMultiplier ×1.1 en acciones que afectan al grupo (pop y apoyo) |
| negociar | 25×influencia (rango 125-225) | 1 | +4 | genera demanda concreta en 1-2 turnos (deadline +4) |
| conceder | 45×influencia (rango 225-405) | 1 | +15 | pausa demandas 4 turnos; **todos los demás grupos −max(2, round(influencia×0.5))**; máx 4/mandato; requiere ≥1 reunión o negociación previa en el mandato |

**Las ganancias por interacción NO disparan antagonismo** (no pasan por applyCrossGroupEffects). Pasivas que anulan costos $: politico gratis con `aliados`; sindicalista gratis con `sindicatos` y `sectores-populares` (specialAbilities.ts:178,187; mecanismo `_archetypeFreeInteractions`, interactionCosts.ts:63).

---

## PARTE 2 — GRUPOS DE INTERÉS

### 2.1 Los 18 subgrupos (`src/data/interestGroups.ts`) — valores iniciales exactos

| Grupo | Influencia | baseSupport | supportMult | resourceDemand | demandActionIds |
|---|---|---|---|---|---|
| empresarios | 8 | 40 | 1.2 | 300 | reduccion_gasto, incentivos_exportacion, reforma_impositiva |
| sector-agricola | 7 | 45 | 1.1 | 250 | subsidios_industriales, viviendas_rurales, infraestructura_vial |
| sector-financiero | 9 | 35 | 1.3 | 400 | prestamo_local, control_precios, mejorar_recaudacion |
| sindicatos | 8 | 50 | 1.2 | 350 | aumento_salarial, acuerdo_sindical, cobertura_social |
| clase-media | 7 | 55 | 1.1 | 200 | programa_educativo, seguridad_ciudadana, transporte_publico |
| sectores-populares | 6 | 60 | 1.0 | 150 | plan_viviendas, programa_alimentario, cobertura_social |
| clase-alta | 8 | 30 | 1.4 | 450 | reduccion_gasto, reforma_impositiva, atraccion_inversiones |
| minorias-etnicas | 5 | 40 | 1.0 | 100 | alfabetizacion, igualdad_genero, plan_viviendas |
| ongs | 6 | 45 | 1.1 | 150 | fortalecimiento_justicia, programa_cultural, alfabetizacion |
| ambientalistas | 6 | 45 | 1.1 | 200 | reforestacion, energia_renovable, acuerdo_ambiental |
| feministas | 7 | 50 | 1.1 | 250 | igualdad_genero, programa_educativo, fortalecimiento_justicia |
| estudiantiles | 5 | 55 | 1.0 | 150 | programa_educativo, promover_educacion, red_bibliotecas |
| cooperativas | 5 | 45 | 1.0 | 100 | fomento_emprendimiento, subsidios_industriales, plan_viviendas |
| aliados | 8 | 70 | 1.3 | 400 | alianza_politica, acuerdo_sindical, participacion_cumbres |
| opositores | 7 | 20 | 1.2 | 300 | fortalecimiento_justicia, reduccion_gasto, control_precios |
| artistas | 5 | 45 | 1.0 | 150 | programa_cultural, festival_arte, centros_culturales |
| deportistas | 6 | 50 | 1.1 | 200 | programa_educativo, infraestructura_vial, transporte_publico |
| academicos | 7 | 45 | 1.2 | 250 | promover_educacion, desarrollar_tecnologia, red_bibliotecas |

Inicial: `groupRelations[id] = baseSupport` (gameEngine.ts:67-72). `popularity`, `satisfactionLevel`, `lastInteractionEffect` de cada subgrupo no se usan en el engine. **No existe decaimiento por turno del apoyo grupal** — solo sube o baja por acciones/interacciones/demandas/ejes (axis ±10 a TODOS en extremo).

### 2.2 Demandas/agendas (`src/engine/groupAgendaEngine.ts`)

- **Generación** (`generateGroupAgendas`, :15): máx **2 activas** simultáneas; probabilidad por grupo/turno = min(0.25, 0.08 + ignoredTurns×0.05); respeta pausa por concesión y negociación pendiente.
- **Tipo:** siempre **ID de acción** elegida de `demandActionIds` (Fisher-Yates, filtrando disponibilidad por cargo, prerrequisitos, y no usada en los últimos 3 turnos). La rama legacy de `AGENDA_TEMPLATES` (texto) es **inalcanzable**: las 7 claves del template tienen todas `demandActionIds`. Deadline: **3-5 turnos** (negociadas: 4).
- **Cumplir ejecutando la acción** (`applyGroupSatisfactionPenalty`, :149): si `completedActions` incluye el id al deadline → **+10 apoyo, +0 popularidad, SIN penalización a antagonistas**.
- **Satisfacer con botón** (`satisfyGroupDemand`, gameEngine.ts:480): **−1 acción, +5 apoyo, +1 popularidad, mood→contento, CON penalización a antagonistas** round(5×ratio).
- **Ignorar:** al deadline, **−influencia** (round; rango −5…−9).
- **Antagonismo al cumplir:** solo en la vía botón (+5). La vía acción (+10) es libre de castigo cruzado.

**Moods** (`updateGroupMoods`, :132): contento ≥70, neutral ≥50, disconforme ≥35, enojado <35, radicalizado <35 con ignoredTurns≥2 / <35+2 turnos. Efecto mecánico del mood: **solo aumenta la probabilidad de demanda** (+0.05/turno ignorado). No hay protestas ni castigos por grupo radicalizado.

### 2.3 Matriz de antagonismo completa (`src/data/groupAntagonists.ts`)

| Ganador → Perdedor | ratio | | Ganador → Perdedor | ratio |
|---|---|---|---|---|
| empresarios → sindicatos | 0.5 | | clase-alta → sindicatos | 0.3 |
| empresarios → sectores-populares | 0.3 | | clase-alta → sectores-populares | 0.3 |
| sector-financiero → sindicatos | 0.5 | | ambientalistas → sector-agricola | 0.4 |
| sector-financiero → sectores-populares | 0.3 | | ambientalistas → sector-financiero | 0.2 |
| sector-financiero → ambientalistas | 0.15 | | feministas → clase-alta | 0.2 |
| sindicatos → empresarios | 0.5 | | feministas → opositores | 0.2 |
| sindicatos → clase-alta | 0.4 | | aliados → opositores | 0.6 |
| sectores-populares → empresarios | 0.5 | | | |
| sectores-populares → clase-alta | 0.4 | | | |

Aplicación: `applyCrossGroupEffects` (crossGroupEffects.ts:9) — solo cuando el cambio es **>0**, penalización = round(ganancia×ratio), clamp 0-100. Se invoca en **un solo lugar**: paso 1.5 del fin de turno (ganancias por acciones). **No** aplica a interacciones (reunión/negociar/conceder usa su propia regla global) ni a demandas cumplidas por acción (+10). La matriz es **asimétrica** (fin→ambient 0.15 vs ambient→fin 0.2). Solo 8 grupos tienen entradas como agresores; 10 grupos (agricola, clase-media, minorias, ongs, estudiantiles, cooperativas, opositores, artistas, deportistas, academicos) **nunca generan castigo cruzado al ganar**.

### 2.4 ¿Es demasiado fácil mantener contentos a todos? — La cuenta

**Palancas reales que suben apoyo grupal (solo 4 vías):**
1. 8 acciones con explicitGroupEffects (Δ +6…+14, sin diminishing, sin factor 0.40).
2. Interacciones: +2 (reunión, $10), +4 (negociar, $125-225), +15 (conceder, $225-405, con castigo global).
3. Demandas: +10 (ejecutar acción) o +5 (botón).
4. Satisfy por objetivos/estabilidad: nada. No hay otra.

**Recursos por turno (presidente, arquetipo político):** acciones = 1 (base presidente, actionCalculator.ts:5-9) +1 (político) = **2**, +1 si popularidad≥75 → 3 típico. Turnos por mandato: 16. Total de slots: ~32-48.

**La cuenta, eje a eje:**

- **Velocidad neta vs antagonismo (clúster económico):** ciclo de 3 turnos con `subsidios_industriales` + `plan_viviendas`: subsidios da emp +8, sind +8, fin −9, ongs −6; sus positivos disparan sind −4 (0.5) y emp −4 (0.5). viviendas da sect-pop +12 → emp −6, clase-alta −4.8. **Neto por ciclo: emp −2, sind +4, sect-pop +12, clase-alta −4.8, fin −9, ongs −6.** El antagonismo desgasta empresarios/clase-alta −2/−4.8 por ciclo…
- **…pero una reunión da +2 por turno a CUALQUIER grupo, a $10, sin antagonismo ni límite.** Con 2-3 acciones/turno, el jugador asigna +2/turno a cada grupo que se desangra: empresarios queda neto 0 con 1 reunión cada 3 turnos. Las ganancias por interacción **no pasan por la matriz** (applyInteraction, gameEngine.ts:309-322, no llama applyCrossGroupEffects).
- **10 de 18 grupos nunca castigan a nadie:** sector-agricola, clase-media, minorias-etnicas, ongs, estudiantiles, cooperativas, opositores, artistas, deportistas, academicos se suben sin costo cruzado alguno. `tercera_edad` sube 3 de estos gratis (+9/+10.5/+9 en una sola acción).
- **Sin decaimiento:** el apoyo nunca baja solo; llegar a 70 ("contento") es permanente.
- **Demandas como fuente neta positiva:** probabilidad 0.08-0.25/grupo/turno, máx 2 activas; cumplir por acción da **+10 sin castigo a antagonistas** (vs +5 con castigo por botón) — el jugador que ejecuta la acción demandada sale siempre ganando (+10 neto vs −influencia si ignora).
- **Cuello real:** no el antagonismo, sino (a) slots de acción (32-48 por mandato para 18 grupos), (b) dinero (conceder de infl. 8 = $360 + castigo global), (c) el cooldown de las 8 acciones explícitas. Conceder es la única interacción con costo cruzado y está limitada (4/mandato + requisito previo).

**Conclusión con números:** sí, el sistema permite mantener contentos a todos. El antagonismo efectivo solo castiga 8 grupos y solo sobre ganancias de 8 acciones; las interacciones (+2/turno/grupo, $10) son una válvula ilimitada y libre de castigo que contrarresta cualquier fuga (máx castigo típico: −6/turno a empresarios, compensable con 3 reuniones = $30). El objetivo "Estabilidad Total" (empresarios 85 + sindicatos 85 + sectores-populares 80 + clase-media 80 + clase-alta 75, victoryConditions.ts:249-255) es exigente pero alcanzable precisamente porque `subsidios_industriales` sube a los dos antagonistas mutuos (+8/+8) en la misma acción, y la vía demanda (+10) no penaliza.

---

## Hallazgos de consistencia (solo señalados)

1. **Tooltip vs motor (53/61 acciones):** ActionCard.tsx:113-131 muestra "Apoyan/Se oponen" desde `affectedGroups`, pero el engine solo aplica `explicitGroupEffects` (8 acciones). El jugador ve apoyo/oposición prometida que **nunca ocurre**; además las 8 acciones explícitas a veces contradicen su propio `affectedGroups` (e.g. `subsidios_industriales` lista supports empresarios+sindicatos — coincide — pero sus opposes ongs −6/fin −9 no figuran como tales).
2. **Matcher textual 100% muerto:** solo 4 coincidencias reales y todas en acciones con explicitGroupEffects (que tienen prioridad). Para el resto, cero efecto grupal.
3. **`satisfiesDemand` (44 acciones) es campo muerto:** nadie en el engine lo lee; el match de demanda es por ID de acción (`demandActionIds`/`completedActions`), no por texto.
4. **Rama legacy de agendas (AGENDA_TEMPLATES) inalcanzable:** los 7 grupos con templates tienen demandActionIds → siempre se usa el sistema nuevo.
5. **Doble vía de satisfacción asimétrica:** cumplir la demanda ejecutando la acción da +10 SIN castigo a antagonistas; el botón da +5 CON castigo. Incentiva siempre la vía acción.
6. **Pasiva empresario "+1 préstamo (máx 4)" no cableada:** `getMaxLoans` existe pero turnProcessor.ts:366 usa `Math.min(3,…)` (TODO reconocido en archetypeEngine.ts:83-86).
7. **Comentario de código auto-contradictorio:** gameEngine.ts:242 dice "getInitialGameState() aplica las pasivas con 'politico'" pero las líneas 152-156 explican que ya NO se aplican ahí (comentario stale).
8. **Reforma impositiva bloqueada por diseño:** minLegislativeSupport:45 declarado "imposible de alcanzar" en el propio registry (líneas 137-139) y mantenido deliberadamente.
9. **actionCategories.ts es zombie** (reconocido en su propio encabezado y en actionRegistry.ts:70-73): solo se usa para `getAllActionIds` en gameEngine.ts:160-162; contiene cooldowns/efectos que no se ejecutan.
10. **Docs desactualizados:** `session-summary.md:29` dice "satisfacer demanda da +5… +1 popularidad" (correcto) pero `mecanicas-del-juego.md:121` describe impacto cruzado genérico; difficulty-analysis.md:291 muestra pseudocódigo (`state.groupRelations[antagonistId] -= change * ratio`) sin el `Math.round` real ni el clamp de una sola pasada.
