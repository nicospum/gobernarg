# Reporte 10 — Auditoría de Integridad de Datos de Contenido (GobernArg)

**Auditor:** Auditor_Datos · **Fecha:** 2026-09-20
**Alcance:** `src/data/**` completo + consumo real en `src/engine/**`, `src/utils/**` y componentes clave de UI.
**Nota:** no se repiten hallazgos ya conocidos (duplicación actionCategories/actionRegistry con minBudget de educación, grupo "medios" huérfano, 10/18 grupos sin antagonismos, reforma_impositiva, stubs de 1 acción), salvo cuando se encontró evidencia nueva.

---

## 1. Hallazgos Críticos

### C1. Eventos `triggered` se re-disparan CADA turno — sin dedup ni cooldown efectivo
| Dato | Archivo:línea | Problema | Fix |
|---|---|---|---|
| `police_violence_scandal` (`probability: 1`, `cooldown: 99`) | `data/events/pendingEvents.ts:19-66` | Una vez que `lucha_narcotrafico` y `seguridad_ciudadana` están en `completedActions`, la condición es permanente. `resolveRandomEvents` evalúa los `triggered` **todos los turnos** (`engine/eventResolver.ts:238-243`) y el campo `cooldown` del evento **no lo lee nadie** (verificado por grep: cero consumos de `event.cooldown` en todo `src/`). El evento dispara modal + notificación infinitamente. | Agregar registro de eventos ya disparados en `GameState` (p. ej. `firedEvents: string[]`) y hacer que `checkEventConditions`/`resolveRandomEvents` lo respete; consumir `event.cooldown`. |
| `minister_resignation` (`maxStability: 35`, `probability: 1`) | `data/events/pendingEvents.ts:68-112` | Idéntico problema: mientras `stability ≤ 35`, dispara cada turno. El `cooldown: 99` es decorativo. | Mismo fix. |

**Impacto:** spam de modales/eventos y aplicación repetida de efectos (p. ej. `-20 popularidad` por turno en el peor caso). Es el bug de datos→engine más grave encontrado.

### C2. `affectedGroups` (61 acciones, ~500 entradas) NO genera ningún efecto real
| Dato | Archivo:línea | Problema | Fix |
|---|---|---|---|
| `affectedGroups: {supports, opposes}` en `ActionDefinition` | `data/actionRegistry.ts:48-54` y cada acción | El engine **nunca** lee `affectedGroups`. El efecto grupal real se calcula en `calculateGroupEffects` (`utils/actionEffects.ts:144-164`) por **matching de subcadenas** entre `action.description` y `subgroup.interests`. Verificado con script: **solo 8 de 61 acciones** producen algún efecto grupal; las otras 53 tienen `affectedGroups` informativo que **no ocurre en el juego**. Además `ActionCard.tsx:113-128` muestra esas listas como "Apoyan/Se oponen", induciendo al jugador a creer efectos inexistentes (y ocultando los reales). | O bien consumir `affectedGroups` en `calculateGroupEffects` (fuente declarativa), o bien eliminar el campo y corregir la UI. Ideal: unificar en una sola fuente. |

**Impacto:** la mitad de la "inteligencia" de datos de actionRegistry es decorativa; la UI miente sobre efectos grupales.

## 2. Hallazgos Altos

### A1. `satisfiesDemand` — campo declarado 40+ veces, cero consumidores
| Dato | Archivo:línea | Problema | Fix |
|---|---|---|---|
| `satisfiesDemand?: string[]` | `data/actionRegistry.ts:53`; usos en :101,138,168,203,303,318,333,348,363,406,421,436,455,474,493,508,542,557,575,590,606,645,664,684,704,720,769,826,845,860,876,892,907,922,941,956,971,986,1001,1016,1031,1046,1065,1102 | Grep en todo `src/`: el campo solo aparece en su declaración y asignaciones. Ningún engine/UI lo lee. Sugiere una mecánica de "satisfacer demandas por texto" que no existe (el sistema real usa `demandActionIds` en `groupAgendaEngine`). | Eliminar el campo o implementar su consumo. Hoy es dato muerto que desorienta mantenimiento. |

### A2. Demandas que el jugador no puede ejecutar (chequeo de prerequisitos incompleto)
| Dato | Archivo:línea | Problema | Fix |
|---|---|---|---|
| Filtro de demandas en `generateGroupAgendas` / `resolvePendingNegotiations` | `engine/groupAgendaEngine.ts:87-96` y `:212-221` | Solo se verifica `prerequisites.requiredActions` y `availableForPositions`. **No** se verifica `minLegislativeSupport`, `minGroupSupport` ni `requirements.minBudget`. Consecuencias: (a) puede exigirse `reforma_impositiva` (que además requiere apoyo legislativo ≥45, inexistente hasta las midterms) → demanda inejecutable → penalidad garantizada salvo que el jugador use el botón "satisfacer" de `satisfyGroupDemand`; (b) puede exigirse una acción de `minBudget` 400-700 sin fondos. | Replicar en el agenda engine los mismos chequeos de `getAvailableActionsForState` (o reutilizarla). |

### A3. Objetivo de intendente imposible de completar
| Dato | Archivo:línea | Problema | Fix |
|---|---|---|---|
| Objetivo `community-support` (intendente) | `utils/victoryConditions.ts:149-166` | Requiere ejecutar `construccion_hospitales` y `red_comunicaciones`, ambas con `availableForPositions: ['gobernador','presidente']` (`actionRegistry.ts:485,537`) → un intendente **jamás** puede completar este objetivo. Impacta el cálculo de intención de voto (`calculateObjectivesImpact`, `utils/electionSystem.ts:171-176`: pierde hasta 7.5 puntos de 15% de peso) y, si se usa `checkVictoryConditions` fuera de presidente, la victoria. | Reemplazar esas acciones por equivalentes de intendente o filtrar el objetivo por posición. |

## 3. Hallazgos Medios

### M1. Campos de asesores sin efecto mecánico (solo display)
| Dato | Archivo:línea | Problema | Fix |
|---|---|---|---|
| `specialAbilities` de advisors | `data/advisors.ts:15,38,61,84,110,133,159` | Los ids (`reforma_monetaria_avanzada`, `campania_mediatica_intensiva`, etc.) **no existen** en `ARCHETYPE_ABILITIES` (`data/specialAbilities.ts:23-157`); tampoco hay engine que los resuelva. Referencias rotas puras. | Crear las habilidades o quitar el campo. |
| `groupBonuses`, `policyModifiers`, `popularityEffect`, `level`, `influence`, `traits`, `effectiveness` | `data/advisors.ts` (todos los advisors); consumo solo en `AdvisorSelectionModal.tsx` / `AdvisorPanel.tsx` como texto | Ningún engine los aplica: `calculateAdvisorMultiplier` (`utils/actionEffects.ts:129-142`) solo usa `specialty`; `calculatePopularidad` (`utils/popularidad.ts`) no considera advisors; `calculateAvailableActions` solo suma `bonusActions`. El jugador lee bonos que nunca se aplican. | Implementar aplicación o marcarlos como cosméticos en UI. |

### M2. Sistema de pesos de eventos completamente muerto
| Dato | Archivo:línea | Problema | Fix |
|---|---|---|---|
| `eventWeights` (categoryWeights, severityWeights, archetypeModifiers, positionModifiers, stateModifiers, turnModifiers) | `data/events/eventWeights.ts:1-79`; re-export en `data/events/index.ts:23` | Cero consumidores en engine/UI (grep verificado). Además el campo `weight` de cada evento (`economic.ts:50,98`, `political.ts:51,99`, `social.ts:49,96`, `pendingEvents.ts` ×12) tampoco se lee: `resolveRandomEvents` itera en orden fijo de array. | Implementar selección ponderada o eliminar. |

### M3. `choice.probability` mostrada como "Probabilidad de éxito" sin efecto
| Dato | Archivo:línea | Problema | Fix |
|---|---|---|---|
| `probability` en choices | `components/EventModal.tsx:161-162,208-226`; datos en todos los eventos | La UI dibuja una barra "Probabilidad de éxito" (verde/ámbar/rojo), pero `applyEventChoice` (`engine/eventResolver.ts:332-354`) aplica los efectos **siempre**, sin tirada. El número es puramente decorativo y engañoso. | Aplicar tirada real (éxito/fallo → `choice.consequences`, que también existe en el tipo y está sin usar: `systems/events/types.ts:55-58`) o quitar la barra. |

### M4. Pasiva `extraLoans` sin efecto real
| Dato | Archivo:línea | Problema | Fix |
|---|---|---|---|
| `Red de contactos` (empresario, `extraLoans: 1`) | `data/specialAbilities.ts:183`; `engine/archetypeEngine.ts:79-88` (TODO explícito) | `getMaxLoans()` existe pero **nadie lo llama**; `turnProcessor.ts:342` sigue usando `Math.min(3, ...)`. El préstamo extra prometido ("máx 4") no existe. | Usar `getMaxLoans(state)` en `turnProcessor` (y donde se valide el préstamo). |

### M5. Sistema de desbloqueo de acciones inerte
| Dato | Archivo:línea | Problema | Fix |
|---|---|---|---|
| `unlockedActions` | `engine/gameEngine.ts:114,150-152`; filtro en `engine/actionEngine.ts:79`; campo `GameAction.unlockedActions` (`types/game.ts:60`) | Al inicio se desbloquean **todas** las ids de `actionCategories`, y ningún código modifica `state.unlockedActions` ni ninguna acción define `unlockedActions`. El filtro del engine es una no-op permanente. | Quitar el filtro o implementar progresión real. |
| `triggersEvent` | `data/actionRegistry.ts:52` | Declarado en la interfaz; ninguna acción lo usa y ningún engine lo lee. | Eliminar o implementar. |
| `requirements.advisorRequired` / `groupSupportRequired` / `minPopularity` | `types/game.ts:27-29`; lógica en `actionEngine.ts:63-77` | El engine soporta los tres filtros pero **ninguna acción de los datos los usa** → código muerto (no es bug, pero es superficie falsa). | Documentar o usar. |

## 4. Hallazgos Bajos

| # | Dato | Archivo:línea | Problema | Fix |
|---|---|---|---|---|
| B1 | `baseActionsModifier`, `ironman` (dificultad) | `engine/difficultyEngine.ts:19-20` (ya documentado en comentarios del propio archivo) | Sin consumidores. Legend/hard no reducen acciones ni actúan como ironman. | Implementar o quitar. |
| B2 | Texto advertencia popularidad | `engine/turnProcessor.ts:29-37` vs `utils/victoryConditions.ts:9` y `engine/engineShared.ts:51-55` | El mensaje dice "Tres turnos consecutivos así y podrías perder" pero la derrota es a los **2** turnos; además avisa solo si `<20`, mientras los umbrales reales son 20/25/30 por cargo (para presidente la derrota ya viene contando cuando el aviso recién aparece). | Alinear textos con `LOW_POPULARITY_TURNS` y `DEFEAT_POP_THRESHOLD`. |
| B3 | `defeatReasons.impeachment.advice` | `data/defeatReasons.ts:30` | Recomienda "cultivá apoyo legislativo", pero el impeachment depende de popularidad+estabilidad (`victoryConditions.ts:62-66`); el apoyo legislativo corresponde al **golpe** (`:69-73`). | Corregir el consejo. |
| B4 | `defeatReasons.hyperinflation.advice` | `data/defeatReasons.ts:44` | "No emitas dinero más de 3 veces": la derrota por hiperinflación es a las **7** emisiones (`victoryConditions.ts:76`); desde 3 hay penalización por turno y el evento `inflation_crisis`. El número del texto no coincide con ningún umbral de derrota. | Aclarar "penalización desde 3, derrota en 7" o unificar umbrales. |
| B5 | `futureEffects` con delay 5-6 | `actionRegistry.ts:179-183` (fomento_emprendimiento: 4,5,6), `:295-298` (plan_viviendas: 3,6), `:676-679` (plan_conectividad: 3,6) | Ejecutadas después del turno global 10-11, la parte diferida cae en turno ≥17 de un mandato de 16 y `pendingEffects` se resetea en la elección → efecto declarado jamás visto. | Acortar delays o escalar según turnos restantes. |
| B6 | `AGENDA_TEMPLATES` (legacy) | `engine/groupAgendaEngine.ts:5-13,104-107,228-234` | Los 18 subgrupos tienen `demandActionIds`, por lo que la rama legacy nunca se ejecuta. Código/datos muertos. | Eliminar o usar como fallback real. |
| B7 | `coalition_opportunity` choice `accept_coalition` | `data/events/political.ts:24-35` | Aceptar la coalición da **`opositores` +20** (y rechazarla -10). Signo sospechoso: ¿aliarse con "partidos clave" beneficia a la oposición? Probablemente invertido o mal targeteado (`aliados` sería lo esperado). | Revisar con diseño. |
| B8 | Descripción `abrirse` | `data/midtermStrategies.ts:26` | Promete "mejor intención de voto a largo plazo" pero el efecto real solo es `popularityPerTurn +1` y `-2 aliados/turno`; no toca `votingIntention` por separado. | Ajustar texto o efecto. |
| B9 | Nuevas divergencias actionCategories vs actionRegistry | `actionRegistry.ts:1079` (`fomentar_turismo` minBudget **50** vs 150 en categories), `:1097` (`desarrollar_tecnologia` **200** vs 300) | Además del minBudget de educación ya conocido, hay dos divergencias más. Hoy es benigno (solo las ids de categories se consumen, vía `getAllActionIds`), pero es deuda que crece. | Unificar fuentes (una sola export). |
| B10 | Comunicador pasiva `Agenda setting` | `data/specialAbilities.ts:193` | `incomeBonus: 0` como placeholder; la descripción dice "ya implementado en actionEffects" (cierto: ×1.1). El campo en 0 es confuso pero inofensivo. | Usar otro campo o comentario. |
| B11 | `getAntagonistsForGroup` | `data/groupAntagonists.ts:45-47` | Export sin consumidores (los engines usan `GROUP_ANTAGONISTS` directamente). | Usar o eliminar. |

## 5. Verificaciones realizadas sin hallazgos

- **Ids de acciones en `demandActionIds`:** los 54 ids referenciados existen en `actionRegistry` ✓.
- **Ids en `affectedGroups` y antagonismos:** todos los grupos referenciados existen en `interestGroups` ✓ (el problema es de consumo, no de referencia).
- **`turnRange` de eventos:** todos usan max ≤16, coherente con el mandato de 16 turnos ✓.
- **Condiciones de eventos aleatorios/crisis:** alcanzables dentro de rangos del sistema (minStability 60, maxBudget 500/800, minMoneyPrinting 3) ✓.
- **`group_xxx` vs ids planos en targets de eventos:** `applyEventEffect` (`eventResolver.ts:373`) normaliza ambos formatos ✓ (convivencia fea pero funcional).
- **Calendario:** los 8 hitos ocurren en año/turno válidos; `elecciones-generales` (año 4, turno 4) coincide con `isEndOfTerm` en `turnProcessor.ts:493` ✓.
- **`PROMOTION_MIN_POPULARITY` / `PROMOTION_DIFFICULTY`:** consumidos en `utils/electionSystem.ts:55-77` ✓.
- **`midtermStrategies`:** multiplicadores consumidos en `actionEffects.ts:30-32` y efectos por turno en `turnProcessor.ts:401-422`; duración de `jugada_audaz` (2 turnos) coincide con su descripción ✓.
- **`unlockRequirement` de advisors:** consumido en `AdvisorSelectionModal.tsx:66-68` ✓.

## 6. Resumen por severidad

| Severidad | Cantidad | IDs |
|---|---|---|
| Crítica | 2 | C1 (eventos triggered en bucle), C2 (affectedGroups sin efecto real) |
| Alta | 3 | A1 (satisfiesDemand muerto), A2 (demandas inejecutables), A3 (objetivo intendente imposible) |
| Media | 5 | M1 (campos advisor muertos/refs rotas), M2 (eventWeights muerto), M3 (probabilidad de éxito falsa), M4 (extraLoans sin efecto), M5 (unlock/triggersEvent muertos) |
| Baja | 11 | B1-B11 |

**Recomendación prioritaria:** C1 rompe la experiencia de juego (spam infinito) y C2 invalida medio dataset de actionRegistry; ambos deberían resolverse antes de cualquier nuevo contenido. A1/A2/M1 son los siguientes en deuda de mantenimiento.
