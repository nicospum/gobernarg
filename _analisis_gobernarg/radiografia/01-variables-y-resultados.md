# 1. Variables de estado y resultados del juego

Radiografía EXACTA (solo lectura) del juego **GobernArg** (TypeScript, React, MVP presidente-only). Repo auditado: `project-bolt-sb1-dzgqso GobernArg 21-11/project`. Todas las referencias son `archivo:función:línea` aproximadas al código leído. **No se propone ningún cambio ni balance**: solo se documenta el sistema real con números exactos.

Archivos clave: `src/types/game.ts`, `src/engine/` (gameEngine, engineShared, turnProcessor, electionEngine, eventResolver, archetypeEngine, difficultyEngine, legitimacyEngine, axisEngine, groupAgendaEngine), `src/utils/` (popularidad, electionSystem, victoryConditions, actionEffects, actionCalculator, interactionCosts, crossGroupEffects), `src/data/` (careerRules, specialAbilities, midtermStrategies, groupAntagonists, interestGroups, defeatReasons, calendar).

---

## PARTE 1 — VARIABLES DE ESTADO

### 1.1 `popularity` (types/game.ts:461)

| Aspecto | Detalle exacto |
|---|---|
| Valor inicial | 50 base (gameEngine.ts:getInitialGameState:84) → en partida real: `ARCHETYPE_STARTING_POPULARITY[archetype]` = político 50, empresario 50, sindicalista 50, comunicador 70 (engineShared.ts:36-41, aplicado en createNewGame:218) |
| Rango | Clamp [0,100] al recalcular (popularidad.ts:15); en turno se aplica `Math.max(0, …)` (turnProcessor.ts:453) y eventos clampan (eventResolver.ts:395) |
| Cómo sube | Efectos inmediatos de acciones: `popularityChange × 0.40 (POPULARITY_GLOBAL_FACTOR) × archetypeMultiplier × advisorMultiplier × strategyMultiplier × reunionMultiplier × diminishingFactor × axisEffectiveness` (actionEffects.ts:43,72); objetivos completados (+10/+15/+20 según cargo, victoryConditions.ts getPositionObjectives); satisfacer demanda manual +1 (gameEngine.ts:satisfyGroupDemand:523) y por acción cumplida en deadline +10 al grupo (no a pop); pasivas de estrategia midterm: abrirse +1/turno (midtermStrategies.ts:23); habilidades especiales: +8 a +15 (specialAbilities.ts); ingreso de eventos con choices |
| Cómo baja | Desgaste natural por cargo: presidente 10/turno × difficulty.popularityDecayMultiplier (0.5/1.0/1.3/1.5) (turnProcessor.ts:444-453); eventos (con resilience ×(1−0.30) del comunicador, eventResolver.ts:390); inflación: −5/turno a 3-4 emisiones, −20/turno a 5+ (turnProcessor.ts:processInflation:231); mantenimiento diferido de acciones grandes −2 (actionEffects.ts:214); acciones impopulares (factor 0.40) |
| Consecuencias | Umbral de derrota `DEFEAT_POP_THRESHOLD`: presidente 30 (engineShared.ts:52); 2 turnos consecutivos → `low_popularity` (victoryConditions.ts:9,52); <10 + estabilidad <20 → impeachment; elección (35% del peso); +1 acción base si ≥75 (actionCalculator.ts:31); victoria final requiere ≥60 (y objetivo de 80) |
| Referencia | types/game.ts:461; utils/popularidad.ts:3; engine/turnProcessor.ts:158 (checkDefeat), 444 (decay) |

### 1.2 `popularidadGrupos` / `popularidadPolitica` (types/game.ts:462-463)

| Aspecto | Detalle |
|---|---|
| Valor inicial | 50/50 (getInitialGameState:85-86) |
| Cómputo | `popularidadGrupos` = promedio simple de `groupRelations` (popularidad.ts:21-26); `popularidadPolitica` = `popularity` cruda (espejo); `popularidadTotal = max(popularity, round(grupos×0.4 + política×0.6))` clamp [0,100] (popularidad.ts:11-15) — **los grupos solo suben popularidad, nunca la bajan** |
| Consecuencias | Se escriben en recalcState (engineShared.ts:110-114) pero **ningún componente React las consume** (grep solo engine/types) — informativas |
| Referencia | utils/popularidad.ts:3; engine/engineShared.ts:recalcState |

### 1.3 `budget` (types/game.ts:464)

| Aspecto | Detalle |
|---|---|
| Valor inicial | `POSITION_STARTING_BUDGET[presidente]=3500` + 500 si empresario (engineShared.ts:30-34; gameEngine.ts:219). Dificultad no modifica el inicial |
| Rango | Sin techo; piso efectivo: derrota por <0 dos turnos consecutivos; clamp inferior solo en penalizaciones `Math.max(0,…)` puntuales (aplicarLegislativeOutcome) |
| Cómo sube | Ingreso fiscal por cargo: presidente +500/turno (intendente 200, gobernador 350; engineShared.ts:18-22) × (1−debtServiceRatio) × (1+incomeModifier activo) × (1+archetypeIncomeBonus 0.20 empresario) × difficulty.incomeMultiplier (1.2/1.0/0.85/0.7) (turnProcessor.ts:388-411); acciones con budgetChange positivo × diminishingFactor × costMultiplier × axisCostMultiplier (actionEffects.ts:73); infraestructura da pendingEffect +10% ingresos × 3 turnos (actionEffects.ts:220); préstamos/emitir dinero +150; habilidades +400/+500; recompensas de objetivos (+500/+1000/+2000); reelección: `3500 + 10% del budget` (electionEngine.ts:101) |
| Cómo baja | Costos de acciones (budgetChange negativo × factores); gasto fijo de gobierno: presidente −350/turno (engineShared.ts:24-28); mantenimiento diferido: \|budgetChange\|≥200 → 15% del costo en 2-4 turnos + (−2 pop) (actionEffects.ts:207-216); servicio de deuda: cada préstamo debtCount+1 (cap **3 hardcodeado**, turnProcessor.ts:366) → ratio = debtCount×0.10 → ingreso ×(1−ratio) (turnProcessor.ts:390-391); interacciones: reunión −10, negociar −25×influencia, conceder −45×influencia (interactionCosts.ts:8-11); inflación: −50/turno (3-4 emisiones), −300/turno (5+); eventos; concesiones cruzadas no cuestan budget |
| Consecuencias | <0 × 2 turnos consecutivos → `negative_budget`; budgetImpact electoral = `50 + growthRate/2` clamp [0,100] con growth contra `historicalBudget[0]` (electionSystem.ts:141-149); victoria final requiere budget > 0 y objetivo de 10000; prerequisitos minBudget por acción |
| Referencia | engine/turnProcessor.ts:388-417; utils/actionEffects.ts; engine/electionEngine.ts:101 |

### 1.4 `votingIntention` (types/game.ts:481) — "intención de voto"

| Aspecto | Detalle |
|---|---|
| Valor inicial | 50 (getInitialGameState:104), recalculado por recalcState (engineShared.ts:120) con la fórmula de electionSystem.ts |
| Fórmula | `VI = popImpact×0.35 + budgetImpact×0.15 + groupsSupport×0.15 + objectivesImpact×0.15 + stability×0.05 + activity×0.15`; si `_archetypeElectionRetention>0` (político 0.10): `VI += retention×(100−VI)`; clamp [0,100] (electionSystem.ts:108-133). Para opción: `(VI + PROMOTION_DIFFICULTY[opción]) × ascensionMultiplier`, reelección +5 (electionSystem.ts:79; careerRules.ts:20-24) |
| Cómo sube/baja | No se modifica directamente salvo por acciones con `multiEffects.votingIntentionChange` (ej. emitir_dinero −2, × diminishingFactor, turnProcessor.ts:337) y recalculo por cambios en sus componentes |
| Consecuencias | Gana elección si `votesPercentage ≥ 45` (MIN_VOTES_TO_WIN, electionSystem.ts:21,88); al resolver: `votingIntention = votesPercentage` (electionEngine.ts:50). **No participa en la victoria final ni en derrotas** |
| Referencia | utils/electionSystem.ts:17 (ELECTION_CONSTANTS), 108 |

### 1.5 `stability` (types/game.ts:492)

| Aspecto | Detalle |
|---|---|
| Valor inicial | 50 (getInitialGameState:115); no depende de arquetipo/dificultad |
| Rango | Clamp [0,100] (turnProcessor.ts:335, eventResolver.ts:399) |
| Cómo sube | `multiEffects.stabilityChange` de acciones (× diminishingFactor); resultado legislativo: landslide +10, clear +5 (eventResolver.ts:112-116); estrategias midterm (año ≥3): negociar +3, abrirse +5/turno (midtermStrategies.ts); eje cerrado ≤−80: +5/turno (axisEngine.ts:63); habilidades +5/+10 |
| Cómo baja | multiEffects negativos (emitir_dinero −3); legislativo: tie −3, minority −8, defeat −15; estrategias: acelerar −3, jugada_audaz −5/turno; eje convocante ≥80: −5/turno; eventos (con resilience del comunicador); habilidades −3/−8 |
| Consecuencias | `<25` notifica inestabilidad (turnProcessor.ts:54); impeachment si pop<10 + stab<20 ×2 turnos; 5% del peso electoral; advertencia de crisis en eventos |
| Referencia | engine/turnProcessor.ts:335,420-441; engine/axisEngine.ts:43 |

### 1.6 `legitimacy` (types/game.ts:502)

| Aspecto | Detalle |
|---|---|
| Valor inicial | 60 (getInitialGameState:125) |
| Rango | Clamp [0,100] (turnProcessor.ts:336; gameEngine useSpecialAbility:449) |
| Cómo sube | `multiEffects.legitimacyChange` × diminishingFactor; acciones cultura/diplomacia +3 por calculateLegitimacyChange (legitimacyEngine.ts:9); habilidades +5/+8 |
| Cómo baja | emitir_dinero −5; decretos forzados (pop≤−10 y budget≤−400) −8; medidas impopulares −min(5, \|pop\|×0.1); habilidades −5 |
| Consecuencias | `prerequisites.minLegitimacy` para desbloqueo de acciones; `checkLegitimacyCostMultiplier` (legitimidad ≤0 → costo ×2) **existe pero no es consumida por nadie** (grep sin usos). Sin derrota asociada |
| Referencia | engine/legitimacyEngine.ts:4,27; engine/turnProcessor.ts:370-371 |

### 1.7 `groupRelations` (types/game.ts:490) — "apoyo de grupos"

| Aspecto | Detalle |
|---|---|
| Valor inicial | Por subgrupo = `subgroup.baseSupport` (interestGroups.ts): empresarios 40, sector-agricola 45, sector-financiero 35, sindicatos 50, clase-media 55, sectores-populares 60, clase-alta 30, minorias-etnicas 40, ongs 45, ambientalistas 45, feministas 50, estudiantiles 55, cooperativas 45, **aliados 70**, **opositores 20**, artistas 45, deportistas 50, academicos 45 (gameEngine.ts:67-72/190-195) |
| Rango | Clamp [0,100] en casi todas las vías (gameEngine.ts:310-313; crossGroupEffects.ts:22; eventResolver.ts:402; turnProcessor.ts:340) |
| Cómo sube | Efectos grupales de acciones: explícitos (`explicitGroupEffects`) o matcher textual `popularityChange × influence/10` (actionEffects.ts:144-170), ×1.1 si bono de reunión activo; interacciones: reunión +2, negociar +4, conceder +15 (interactionCosts.ts:14-18); satisfacer demanda +5 manual / +10 por cumplir acción en deadline (gameEngine.ts:495; groupAgendaEngine.ts:158-162); habilidades (+3 a +15); eje convocante ≥80: +10/turno a todos; eventos |
| Cómo baja | **Antagonismo cruzado**: cuando un grupo gana apoyo, sus antagonistas pierden `round(ganancia × ratio)` (crossGroupEffects.ts:9-26; matriz groupAntagonists.ts:10-43, ratios 0.15-0.6); conceder: todos los demás grupos −max(2, round(influencia×0.5)) (gameEngine.ts:316-322); demanda ignorada en deadline: −round(influencia) (groupAgendaEngine.ts:170-174); satisfacer demanda descuenta antagonistas según matriz (gameEngine.ts:503-513); estrategia abrirse: aliados −2/turno; eje cerrado ≤−80: −10/turno a todos |
| Consecuencias | Promedio ponderado por influencia = 15% del voto electoral (electionSystem.ts:151-172); promedio simple alimenta `popularidadGrupos`; moods de grupos (≥70 contento, ≥50 neutral, ≥35 disconforme/enojado, <35 enojado/radicalizado, groupAgendaEngine.ts:132-147); objetivo "Estabilidad Total" exige 5 grupos en 75-85; apoyo legislativo usa promedio simple (eventResolver.ts:44-47) |
| Referencia | engine/gameEngine.ts:applyInteraction:248; utils/crossGroupEffects.ts |

### 1.8 `legislativeSupport` (types/game.ts:486)

| Aspecto | Detalle |
|---|---|
| Valor inicial | `null` (getInitialGameState:109) → `(??100)` en chequeos |
| Cómputo | Solo en midterms (año 2 turno 4, calendar.ts:29-31): `legislativeSupport = clamp(officialismVotes × 1.1, 25, 75)` (eventResolver.ts:74-75); officialismVotes = `35 + (avgPop−50)×0.25 + (avgGrupos−50)×0.15 + objetivos×10%×… + (stab−50)×0.1 + ruido ±3` clamp [28,58] (eventResolver.ts:36-68) |
| Efectos | Resultado ajusta estabilidad (+10/+5/−3/−8/−15); consecuencias por turno si <35 (45% evento oposición), <38 (25%), >45 (25% sobreconfianza) (eventResolver.ts:164-212); desbloquea estrategias midterm: acelerar si >42, abrirse si ≥3 grupos >50 (engineShared.ts:128-146); prerequisito `minLegislativeSupport` de acciones |
| Consecuencia crítica | Umbral del golpe: `stab<10 y legislativeSupport<25` — el clamp mínimo es 25 → condición estructuralmente imposible (ver Hallazgos) |
| Referencia | engine/eventResolver.ts:36-129 |

### 1.9 Variables derivadas / acumuladores

| Variable | Inicial | Mecánica exacta | Referencia |
|---|---|---|---|
| `moneyPrintingCount` | 0 | +1 por ejecución de `emitir_dinero` (cooldown 3, diminishingFactor 0.65); **reset a 0 en cada reelección** (electionEngine.ts:114); 3-4 emisiones: −5 pop/−50 budget por turno; 5-6: −20/−300; **≥7 → derrota `hyperinflation`** | turnProcessor.ts:357-358, processInflation:231; victoryConditions.ts:76 |
| `debtCount` / `debtServiceRatio` | 0 / 0 | `debtCount = min(3, debtCount+1)` por acción `isLoan`; `ratio = debtCount × 0.10`; ingreso × (1−ratio); **reset en reelección** (electionEngine.ts:122-123) | turnProcessor.ts:365-368 |
| `consecutiveLowPopularity` | 0 | +1/turno si pop < umbral cargo (presidente 30), reset si no; derrota al llegar a 2 | turnProcessor.ts:checkDefeat:158-169 |
| `consecutiveNegativeBudget` | 0 | +1/turno si budget < 0; derrota al 2 | turnProcessor.ts:171-175 |
| `impeachmentConsecutiveTurns` | 0 | +1/turno si pop<10 y stab<20; derrota al 2 | turnProcessor.ts:181-185; victoryConditions.ts:62 |
| `coupConsecutiveTurns` | 0 | +1/turno si stab<10 y legislativeSupport<25; derrota al 3 | turnProcessor.ts:186-190; victoryConditions.ts:69 |
| `actions` / `baseActions` | 5 / 5 base | Recalculado: base por cargo (presidente **1**) +1 político +1 empresario + pasiva sindicalista +1 + asesores activos (bonusActions) +1 si pop ≥75 (actionCalculator.ts:3-36); pasivas lo re-setean cada inicio de turno | engineShared.ts recalcState:110; turnProcessor.ts:312 |
| Ejes (`radicalConciliadorAxis`, `populistaTecnicoAxis`, `cerradoConvocanteAxis`) | 0/0/0 | Shift por categoría de acción (axisEngine.ts:9-19) + shift por pasiva **cada turno** (político +2/+1, empresario +2/−1, sindicalista −2/−2, comunicador +2; archetypeEngine.ts:55-70); clamp [−100,100]; extremos ±80 aplican modificadores (axisEngine.ts:43-70) | engine/axisEngine.ts |
| `groupAgendas` / `groupMoods` | [] / todos 'neutral' | Máx 2 demandas activas; prob base 0.08 +0.05×ignoredTurns (tope 0.25); deadline 3-5 turnos; negociada: deadline +4; penalización −influencia al vencer | groupAgendaEngine.ts:15-181 |
| `concessionsThisTerm` | 0 | Máx 4 concesiones/mandato; requiere ≥1 reunión/negociación previa | gameEngine.ts:261-271 |
| `temporarySupportBonuses` | {} | Reunión: bono ×1.1 efectos de acciones del grupo por 3 turnos (solo `actionMultiplier` se consume; el `bonus` numérico guardado nunca se aplica) | interactionCosts.ts:21-24; actionEffects.ts:177 |
| Acumuladores `_archetype*` | — | incomeBonus 0.20 (empresario), electionRetention 0.10 (político), extraActions +1 (sindicalista), extraLoans +1 (empresario, **no consumido**, ver Hallazgos), eventResilience 0.30 (comunicador) | specialAbilities.ts:175-196; archetypeEngine.ts:6 |

**No existen** como variables de estado: `socialConflict` (lo más cercano son `groupMoods`/`stability`), `income` (es constante por cargo `POSITION_INCOME`, no un estado), ni `voteIntention` (es `votingIntention`).

---

## PARTE 2 — RESULTADO DEL JUEGO

### 2.1 Vías de derrota (todas evaluadas en `checkAllDefeatConditions`, victoryConditions.ts:48, llamado desde `checkDefeat`, turnProcessor.ts:193, al final de cada `processEndTurn` paso 9)

| # | Razón (`DefeatReason`) | Condición exacta | Contador | ¿Alcanzable? |
|---|---|---|---|---|
| 1 | `low_popularity` | `popularity < 30` (presidente; 25 gobernador, 20 intendente) Y `consecutiveLowPopularity ≥ 2` | +1/turno bajo umbral, reset al salir (turnProcessor.ts:164-169) | Sí |
| 2 | `negative_budget` | `budget < 0` Y `consecutiveNegativeBudget ≥ 2` | +1/turno en negativo | Sí |
| 3 | `impeachment` | `popularity < 10` Y `stability < 20` Y `impeachmentConsecutiveTurns ≥ 2` | +1/turno (turnProcessor.ts:181-185) | **Sí en teoría, no en la práctica**: pop<10 ⊆ pop<30, ambos contadores suben juntos y `low_popularity` se chequea primero (victoryConditions.ts:52-54) → el reason siempre será `low_popularity` |
| 4 | `institutional_coup` | `stability < 10` Y `legislativeSupport < 25` Y `coupConsecutiveTurns ≥ 3` | +1/turno (turnProcessor.ts:186-190) | **NO**: `legislativeSupport = clamp(…, 25, 75)` (eventResolver.ts:75) nunca es <25; antes de midterms es `null → ??100` |
| 5 | `hyperinflation` | `moneyPrintingCount ≥ 7` | Directo, sin contador (victoryConditions.ts:76) | Sí: emitir_dinero tiene cooldown 3, 16 turnos/mandato permiten ≥5 emisiones por mandato; se resetea en reelección, así que exige 7 en un mismo mandato |
| 6 | `election_loss` | `votesPercentage < 45` al resolver elección pendiente | En `resolvePendingElection` (electionEngine.ts:57-62): `gameOver=true, victorious=false, defeatReason='election_loss'` | Sí |

Al perder: `gameOver=true`, `victorious=false`, `defeatReason` seteado (turnProcessor.ts:194-198 / electionEngine.ts:58-61). Textos UI en `data/defeatReasons.ts`.

### 2.2 Elección de re-elección

**Disparo**: fin de mandato = `year===4 && turn===4` (turnProcessor.ts:512). Si `term < MAX_TERMS[presidente]=2` (careerRules.ts:12-16) hay opción `'reelection'` (electionSystem.ts:32-55); si no quedan opciones → `finalizePresidentialCareer` directo (turnProcessor.ts:519-523).

**Fórmula de votos** (`processElectionResultsForOption`, electionSystem.ts:83-101 → `calculateVotingIntentionForOption`:62-81):

```
base = calculateVotingIntention(state)              // electionSystem.ts:108
votes = clamp[(base + PROMOTION_DIFFICULTY['reelection']=+5) × 1.0, 0, 100]
victory = votes >= 45                                // MIN_VOTES_TO_WIN
```

Componentes de `base` (pesos en ELECTION_CONSTANTS.WEIGHTS, electionSystem.ts:22-29), todos en escala 0-100:

| Componente | Peso | Fórmula literal |
|---|---|---|
| `popularityImpact` | **0.35** | Promedio de `historicalPopularity.slice(-4)` (últimos 4 trimestres, electionSystem.ts:135-139) |
| `budgetImpact` | **0.15** | `50 + ((budget − historicalBudget[0]) / historicalBudget[0]) × 100 / 2`, clamp [0,100] (electionSystem.ts:141-149) |
| `groupsSupport` | **0.15** | Σ(support×influencia)/Σinfluencia sobre todos los subgrupos (electionSystem.ts:151-172) |
| `objectivesImpact` | **0.15** | `completedObjectives.length / objectives.length × 100` (electionSystem.ts:174-179) |
| `stabilityBonus` | **0.05** | `stability` directo (electionSystem.ts:181-183) |
| `activityImpact` | **0.15** | `min(100, accionesDelMandatoActual / 16 × 100)` — turnLog filtrado por position+term (electionSystem.ts:191-207) |
| Retención pasiva | — | político: `VI += 0.10 × (100 − VI)` (electionSystem.ts:127-130) |

**Al perder** (electionEngine.ts:57-62): `gameOver=true, victorious=false, defeatReason='election_loss'`; `electionResults` guardado con `details` de cada componente.

**Al ganar — reset campo por campo** (`resolvePendingElection`, electionEngine.ts:64-137):
- `electionResults` seteado; `votingIntention = votesPercentage`; `pendingElection=false`; `pendingElectionOptions=[]`
- `term += 1`; `termsByPosition[presidente] += 1`; push de nuevo `CareerMilestone` (victory, type 'reelection')
- **`year=1`, `turn=1`**; `legislativeResults=null`; `legislativeSupport=null`
- `popularity = round(popularity × 0.7 + 30)` (ej. 80 → 86)
- `budget = POSITION_STARTING_BUDGET[presidente]=3500 + round(budget × 0.1)`
- `objectives = getPositionObjectives(presidente)` (los mismos 2); `completedActions=[]`; `pendingEffects=[]`; `interactionHistory={}`; `concessionsThisTerm=0`; `interactionCountByGroup={}`; `lastRandomEventTurn=0`; `randomEventsThisTerm=0`; `lastEventFiredTurns={}`; **`advisors=[]`**; `advisorActionUsed=false`; **`moneyPrintingCount=0`**; `consecutiveLowPopularity=0`; `consecutiveNegativeBudget=0`; `groupAgendas=[]`; `groupMoods=[]`; `actionUsageCount={}`; `actionCooldowns={}`; `debtCount=0`; `debtServiceRatio=0`; `completedObjectives=[]`; `midtermStrategy=null`; `pendingMidtermStrategy=false`; `availableMidtermStrategies=[]`; `audazTurnsCount=0`; `abilityCooldowns={}`; `impeachmentConsecutiveTurns=0`; `coupConsecutiveTurns=0`; **`historicalBudget=[budget]`** (para el budgetImpact)
- **NO se resetean**: `stability`, `legitimacy`, `votingIntention`, ejes, `groupRelations`, `historicalPopularity` (sigue acumulando toda la carrera), `defeatReason`
- Cierre con `recalcState` (recalcula popularity por popularidad.ts, acciones y votingIntention)

### 2.3 Victoria final

**Objetivos del presidente** (`getPositionObjectives('presidente')`, victoryConditions.ts:228-263) — fijos, sin rotación ni aleatoriedad, idénticos en cada mandato:

| Objetivo | Requisitos (AND) | Recompensa |
|---|---|---|
| `national-prosperity` "Prosperidad Nacional" | `popularity ≥ 80` **Y** `budget ≥ 10000` | +20 popularity |
| `total-stability` "Estabilidad Total" | groupSupport (AND de 5): empresarios ≥85, sindicatos ≥85, clase-media ≥80, clase-alta ≥75, sectores-populares ≥80 | +2000 budget |

**Evaluación de objetivos** (`updateObjectives`, victoryConditions.ts:83-148): cada requisito es un check independiente y se combinan con **AND** (`checks.every`); `progress` = promedio de progresos. Corre en `processEndTurn` paso 10 (turnProcessor.ts:575) y dentro de `finalizePresidentialCareer`. Recompensas aplicadas una sola vez (`applyObjectiveRewards`, turnProcessor.ts:207-215).

**Condición de victoria** (`checkVictoryConditions`, victoryConditions.ts:13-19):

```
victorious = objectives.every(o => o.completed)   // ambos objetivos
             AND popularity >= 60
             AND budget > 0
```

**Dónde y cuándo se chequea**: única llamada en `finalizePresidentialCareer` (electionEngine.ts:140-151), que se ejecuta al procesar el turno `year=4, turn=4` del **2º mandato presidencial** (cuando `getAvailableElectionOptions` devuelve vacío, turnProcessor.ts:519-523). Incluye el **re-chequeo**: `updateObjectives(state)` antes de fijar `victorious` (electionEngine.ts:149-150), porque `processEndTurn` evalúa objetivos recién en su paso 10, posterior al paso 5 que invoca al finalizador (fix del commit e8ffca3). El milestone final se registra con `votesPercentage = state.votingIntention` y `result='victory'` (electionEngine.ts:142). `gameOver=true` siempre.

**No hay victoria intermedia**: `checkVictoryConditions` no se invoca en ningún otro lado; cumplir objetivos en el mandato 1 no gana nada (solo recompensas).

### 2.4 Condiciones intermedias (impeachment, golpe, hiperinflación, crisis)

- **Impeachment**: ejecutable (código real, victoryConditions.ts:62-66) pero efectivamente ensombrecido por `low_popularity` (mismo timing, chequeo previo). Umbral: pop<10 + stab<20 × 2 turnos consecutivos.
- **Golpe institucional**: código ejecutable (victoryConditions.ts:69-73) pero **inalcanzable**: `legislativeSupport` nunca <25 por clamp (eventResolver.ts:75) y vale `null→100` antes de las midterms.
- **Hiperinflación**: alcanzable; 7 emisiones en un mismo mandato (el reset por reelección impide acumular entre mandatos).
- **Crisis inflacionaria intermedia** (no derrota): 3-4 emisiones → −5 pop/−50 budget por turno; 5+ → −20/−300 por turno (processInflation, turnProcessor.ts:231-259). Crisis de eventos: probabilidad × crisisProbabilityMultiplier de dificultad (0.3/1.0/1.5/2.0), máx 1 evento aleatorio por turno, cooldown global 3 turnos, máx 5 por mandato (eventResolver.ts:227-228).

---

## Hallazgos de consistencia (solo señalados, sin propuestas)

1. **`institutional_coup` es inalcanzable**: el clamp `Math.max(25, …)` de `legislativeSupport` (eventResolver.ts:75) contradice el umbral `< 25` (victoryConditions.ts:69). `coupConsecutiveTurns` nunca puede incrementarse. El tipo `DefeatReason` y toda la config UI del golpe son código muerto.
2. **`impeachment` prácticamente inalcanzable como razón**: pop<10 implica pop<30, ambos contadores suben en los mismos turnos y `low_popularity` se evalúa primero en `checkAllDefeatConditions`; el `reason` registrado siempre será `low_popularity`.
3. **`extraLoans` (empresario) es pasiva muerta**: `getMaxLoans` (archetypeEngine.ts:87) no es llamada por nadie; turnProcessor.ts:366 usa el literal `Math.min(3, …)`. El texto "máx 4 préstamos" no se cumple en el código.
4. **`checkLegitimacyCostMultiplier` ("legitimidad 0 ⇒ acciones ×2") no es consumida** por ningún archivo: la legitimidad en 0 no tiene efecto mecánico; la variable solo pesa en `prerequisites.minLegitimacy`.
5. **El `bonus` numérico de `temporarySupportBonuses` nunca se aplica** a `groupRelations`; solo `actionMultiplier` (×1.1) es leído (actionEffects.ts:177-190). La reunión da +2 una sola vez vía `supportGain`.
6. **`popularidadGrupos`/`popularidadPolitica` se calculan en cada `recalcState` pero ningún componente las muestra** (grep: solo engine/types). Además la fórmula `max(política, 0.4×grupos+0.6×política)` hace que el apoyo grupal solo pueda *subir* la popularidad.
7. **Reelección: `historicalPopularity` no se resetea** (sí `historicalBudget`, electionEngine.ts:135): el `popularityImpact` electoral mezcla datos de ambos mandatos solo si el slice(-4) cae en el borde; coherente, pero asimétrico con budget.
8. **Asesores eliminados en cada reelección** (`advisors=[]`) sin aviso en el flujo de elección; estabilidad, legitimidad, ejes y `groupRelations` tampoco se resetean (asimetría de resets: se borra `moneyPrintingCount` pero no `stability`).
9. **`canRunForOption` (minPop por opción) no se aplica en `resolvePendingElection`**: la única puerta real es el cálculo de votos; reelección tiene minPop=0 de todos modos.
10. **Reset de popularidad post-reelección puede subirla**: `pop×0.7+30` mapea 100→100, 80→86, 50→65; un presidente impopular (40) queda en 58.
11. **Desgaste vs. dificultad**: solo `popularityDecayMultiplier` e `incomeMultiplier`/`crisisProbabilityMultiplier`/`loansAvailable` se consumen; `baseActionsModifier` (−1 en hard/legend) y `ironman` están declarados "sin consumir" (difficultyEngine.ts:10-12) — la dificultad no cambia los puntos de acción pese al campo.
12. **Warning de estabilidad**: el mensaje de inestabilidad dispara a `<25` (turnProcessor.ts:54) pero no hay derrota por estabilidad sola; solo actúa como co-condición de impeachment.
13. **`processInflation` es excluyente (if/else)**: a 5+ emisiones aplica −20/−300 y **ya no** el −5/−50 menor; el texto de "presión inflacionaria" solo aparece en count===3.
14. **Presupuesto inicial vs. descripción de arquetipo**: comunicador arranca con 70 de popularidad pero el desgaste de presidente (10/turno) lo devuelve a la media en ~2-3 turnos si no actúa.
15. **Estrategia `jugada_audaz`**: el texto promete "penalización fuerte" tras 2 turnos; el código solo revierte a `'negociar'` sin penalidad (turnProcessor.ts:424-437).
16. **Umbral electoral 45 hardcodeado** en la UI (ReelectionChoiceModal.tsx:46,93) duplicado respecto a `MIN_VOTES_TO_WIN` (electionSystem.ts:21) — mismo valor, dos fuentes.
17. **Objetivos inalcanzables presentes**: los objetivos/umbrales de intendente y gobernador y las opciones `promote-*` siguen en el código pero son inalcanzables en el MVP (STARTING_POSITION='presidente', careerRules.ts:10); el comentario lo declara explícitamente.
18. **`historicalPopularity` al inicio contiene el valor pre-pasivas** y `createNewGame` lo reemplaza (gameEngine.ts:237), consistente; pero el comentario de electionSystem.ts (línea ~242 en gameEngine) contradice la firma actual afirmando que getInitialGameState "aplica las pasivas con 'politico'": hoy no lo hace.

**Referencias centrales**: `src/types/game.ts:453` (GameState) · `src/engine/turnProcessor.ts:265` (processEndTurn, pipeline de 10 pasos) · `src/engine/electionEngine.ts:39,140` · `src/utils/electionSystem.ts:17` · `src/utils/victoryConditions.ts:3,13,48,154` · `src/engine/engineShared.ts:18-56` (constantes de balance).
