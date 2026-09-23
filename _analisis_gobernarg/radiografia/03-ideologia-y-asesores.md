# 3. Sistema ideológico y asesores

Radiografía de solo lectura del juego "GobernArg" (TypeScript, MVP presidente-only). Repo auditado: `project-bolt-sb1-dzgqso GobernArg 21-11/project/src`, rama `rediseno-visual`. Rutas citadas relativas a `project/src/`. Separación tajante entre "tiene efecto mecánico real" y "es solo texto/UI".

---

## PARTE 1 — SISTEMA IDEOLÓGICO

### 1.1 Ejes existentes

NO existe un perfil ideológico de "izquierda/derecha" ni estatismo/mercado. Existen **3 ejes bipolares independientes**, rango **-100 a +100**, con clamp en `engine/axisEngine.ts:21-23` (`clampAxis`):

| Eje | Campo en `GameState` | Polo -100 | Polo +100 | Definido en |
|---|---|---|---|---|
| Radical ↔ Conciliador | `radicalConciliadorAxis` | Radical | Conciliador | `types/game.ts:509`, `engine/axisEngine.ts` |
| Populista ↔ Técnico | `populistaTecnicoAxis` | Populista | Técnico | `types/game.ts:510` |
| Cerrado ↔ Convocante | `cerradoConvocanteAxis` | Cerrado | Convocante | `types/game.ts:511` |

Inicialización: los 3 en **0** en `engine/gameEngine.ts:141-143` (`getInitialGameState`).

### 1.2 Clasificación ideológica de las acciones

No hay tags ideológicos por acción (ningún campo `ideology`/`tags` en `GameAction`, `types/game.ts:50-90`). La clasificación es **por categoría de acción** mediante la tabla dura `CATEGORY_AXIS_SHIFTS` en `engine/axisEngine.ts:9-19`:

| Categoría | Radical/Concil. | Populista/Téc. | Cerrado/Convoc. | # acciones (`data/actionRegistry.ts`, `grep -c`) |
|---|---|---|---|---|
| economia | 0 | **+2** | -1 | 12 |
| social | +1 | **-2** | 0 | 10 |
| seguridad | **-3** | 0 | -2 | 7 |
| diplomacia | +2 | 0 | **+3** | 7 |
| cultura | +2 | -1 | +2 | 8 |
| infraestructura | 0 | +1 | 0 | 14 |
| educacion | +1 | 0 | +1 | 1 |
| turismo | 0 | -1 | +1 | 1 |
| tecnologia | 0 | +1 | 0 | 1 |

Total: **61 acciones** en `data/actionRegistry.ts` (fuente única de verdad; `data/actionCategories.ts:1-43` se deriva del registry agrupando por categoría).

### 1.3 Cálculo del perfil

Fórmula (todo suma fija, sin pesos variables ni normalización por magnitud de acción):

1. **Al ejecutar cada acción** (dentro del procesamiento de fin de turno): `applyAxisShift(action, state)` — llamado desde `engine/turnProcessor.ts:372`, definido en `engine/axisEngine.ts:25-33`. Suma el shift de la categoría de la acción a cada uno de los 3 ejes, con clamp ±100. Cada acción pesa igual sin importar su `popularityChange`/`budgetChange`.
2. **Al inicio de cada turno, por pasiva de arquetipo**: `applyArchetypePassives(state)` — `engine/turnProcessor.ts:312` → `engine/archetypeEngine.ts:20-23,55-70`, con shifts por turno declarados en `data/specialAbilities.ts:170-194`:
   - político: conciliador **+2**, convocante **+1** /turno
   - empresario: técnico **+2**, cerrado **-1** /turno
   - sindicalista: radical **-2**, populista **-2** /turno
   - comunicador: convocante **+2** /turno

   Nota: estos shifts se **re-aplican cada turno** (los acumuladores `_archetype*` se resetean al inicio de `applyArchetypePassives`, `archetypeEngine.ts:12-18`, pero los axis-shift no se compensan), por lo que el arquetipo empuja los ejes de forma monótona y solo las acciones ejecutadas los corrigen. No existe decaimiento natural de los ejes.

### 1.4 PREGUNTA CENTRAL — Consumidores del perfil

**SÍ hay consecuencias mecánicas, pero únicamente en los extremos (±80).** `getAxisModifiers()` — `engine/axisEngine.ts:43-70` — devuelve `{}` si ningún eje llega a ±80.

| Consumidor | Archivo:función:línea | Efecto real |
|---|---|---|
| Multiplicador de efectividad y costo de acciones | `utils/actionEffects.ts:64-72` en `calculateActionEffects` | Radical≤-80: `seguridad ×1.10`, `diplomacia ×0.85`. Conciliador≥80: costo `cultura -1%`, `diplomacia -1%`, `seguridad +1%`. Populista≤-80: `social ×1.20`, costo social -1%. Técnico≥80: `economia ×1.20`, `social ×0.90` |
| Estabilidad + relaciones grupales por turno | `engine/turnProcessor.ts:456-480` | Cerrado≤-80: `stability +5`, **todas** las `groupRelations -10`/turno. Convocante≥80: `groupRelations +10`, `stability -5`/turno |
| Notificaciones de aviso | `engine/turnProcessor.ts:83-136` | Avisos al cruzar ±80 en cada eje (solo texto/notificación) |
| UI legado | `components/LegacyScreen.tsx:196-227` | 3 `AxisBar` (Radical/Conciliador, Populista/Técnico, Cerrado/Convocante) en la pantalla final de legado |

**NO consumen los ejes** (verificado por grep exhaustivo sobre `src/`): `engine/electionEngine.ts`, `utils/electionSystem.ts`, `engine/eventResolver.ts` (`EventConditions` en `types/game.ts:320-336` no tiene campos de ejes), `engine/groupAgendaEngine.ts`, objetivos/condiciones de victoria, `engine/actionEngine.ts`, prerequisitos de acciones (`GameAction.prerequisites`, `types/game.ts:84-89`, solo acciones/apoyo legislativo/legitimidad/apoyo grupal). **No hay acciones bloqueadas ni eventos condicionados por ideología.**

### 1.5 ¿Reaccionan los grupos a la ideología?

**Solo a través del eje Cerrado/Convocante en ±80**: `turnProcessor.ts:463-470` aplica `groupRelationsModifier` de **±10 a todos los grupos por igual** (sin afinidad ideológica individual). No existe matching de ideología del jugador vs. ideología de grupo: los `groupBonuses` de los asesores tampoco se aplican (ver Parte 2). Los grupos reaccionan por intereses textuales (`utils/actionEffects.ts:144-170`, matching de palabras de `subgroup.interests` contra la descripción de la acción), no por espectro político.

---

## PARTE 2 — ASESORES

### 2.1 Listado completo (`data/advisors.ts:3-171`)

| ID | Nombre | Especialidad | bonusActions | Costo ($M) | popularityEffect | unlockRequirement | level | influence | effectiveness |
|---|---|---|---|---|---|---|---|---|---|
| advisor1 | Dr. Carlos Méndez | Economista | 2 | 300 | **-5** | null | 3 | 8 | 85 |
| advisor2 | Lic. María González | Comunicación Social | 1 | 250 | 10 | null | 2 | 9 | 80 |
| advisor3 | Ing. Roberto Silva | Infraestructura | 2 | 400 | 5 | null | 4 | 7 | 90 |
| advisor4 | Dra. Ana Martínez | Políticas Sociales | 1 | 200 | 15 | null | 3 | 8 | 85 |
| advisor5 | Dr. Jorge Ramírez | Relaciones Internacionales | 2 | 500 | 8 | popularity ≥ 60 | 5 | 9 | 95 |
| advisor6 | Lic. Patricia Sánchez | Seguridad Pública | 1 | 350 | 12 | null | 3 | 7 | 85 |
| advisor7 | Dr. Miguel Ángel Torres | Educación | 2 | 300 | 10 | popularity ≥ 55 | 4 | 8 | 90 |

**No existe salario/upkeep**: el `cost` es un pago único al contratar (`engine/gameEngine.ts:372-389`). No hay gasto por turno por mantener asesores.

### 2.2 Tabla campo × consumidor × efecto × estado

Tipo real: `types/game.ts:101-120` (`Advisor`) y `:122-125` (`AdvisorWithStatus`).

| Campo | Consumidor | Efecto exacto | Estado |
|---|---|---|---|
| `id` | `engine/eventResolver.ts:317-322` (`requiredAdvisors` en `checkEventConditions`) | Condición de eventos: el asesor debe estar contratado y `isActive`. **Ningún evento en `data/events/` declara `requiredAdvisors`** (grep sin resultados fuera de tests) → consumidor vivo pero sin datos | FUNCIONA (sin uso real) |
| `bonusActions` | `utils/actionCalculator.ts:23-28` en `calculateAvailableActions` (filtra `advisor.isActive`) | Suma directa a las acciones del turno: `baseActions += Σ bonusActions` de asesores activos. Recalc inmediato al contratar/despedir vía `recalcState` | **FUNCIONA** |
| `specialty` | `utils/actionEffects.ts:114-142` (`ADVISOR_SPECIALTY_CATEGORY_MAP` + `calculateAdvisorMultiplier`) | Si la categoría de la acción está en el mapa de la especialidad (key normalizada `toLowerCase().trim()`): `popularityChange ×1.2` por cada asesor activo que mapee (`multiplier *= 1.2`, línea 137, acumulativo). Solo afecta popularidad de la acción, no presupuesto ni efectos grupales | **FUNCIONA** (con 2 especialidades desfasadas, ver 2.4) |
| `cost` | `engine/gameEngine.ts:372-373` (`hireAdvisors`); UI `components/AdvisorSelectionModal.tsx:70-71` | Pago único al contratar (`budget - totalCost`); rechazo silencioso si `budget < totalCost` | FUNCIONA |
| `popularityEffect` | Ninguno en engine. Solo `getPopularityIndicator` en `AdvisorSelectionModal.tsx:14-26,97` y `AdvisorPanel.tsx:15,78` (íconos TrendingUp/Down por signo) | — | **DISPLAY-ONLY** (nunca toca `state.popularity`) |
| `groupBonuses` | Ninguno en engine. Solo render `AdvisorSelectionModal.tsx:165-169` y `AdvisorPanel.tsx:133` ("+X% relación con grupo") | — | **DISPLAY-ONLY** |
| `policyModifiers` | Ninguno en engine. Solo render `AdvisorSelectionModal.tsx:160-164` y `AdvisorPanel.tsx:128` ("+X% efectividad en categoría") | — | **DISPLAY-ONLY** |
| `specialAbilities` | Ninguno. `ARCHETYPE_ABILITIES`/`useSpecialAbility` (`engine/gameEngine.ts:424+`) son habilidades del **arquetipo**, no del asesor; los strings de asesor no se resuelven en ningún lado | — | **SIN CONSUMIDOR (ni siquiera se muestran en UI)** |
| `influence` | Solo UI (`AdvisorSelectionModal.tsx:134`, `AdvisorDismissModal.tsx:60`) | — | DISPLAY-ONLY |
| `level` | Solo UI (`AdvisorSelectionModal.tsx:125`, `AdvisorPanel.tsx:99`) | — | DISPLAY-ONLY |
| `traits` | Solo data; ningún render ni engine | — | **SIN CONSUMIDOR (ni siquiera se muestran)** |
| `effectiveness` | Solo data | — | **SIN CONSUMIDOR** |
| `unlockRequirement` | Solo UI: `AdvisorSelectionModal.tsx:73-79` (`isAdvisorAvailable`) filtra quién aparece para contratar | El engine no lo verifica; como el modal es la única vía de contratación, efectivamente funciona | FUNCIONA (vía UI) |
| `description` | UI | — | DISPLAY-ONLY |

### 2.3 Reglas de contratación (`engine/gameEngine.ts:353-404`)

| Regla | Implementación |
|---|---|
| Máximo de slots | **2 asesores simultáneos** (`MAX_ADVISORS = 2`, `gameEngine.ts:367`). El UI calcula slots libres (`components/AdvisorPanel.tsx:43`, `maxAdvisorsToHire = 2 - advisors.length`) y el engine corta la lista por slots (`candidates.slice(0, slots)`, `gameEngine.ts:368-369`) en lugar de rechazar toda la operación |
| Anti-duplicados | Filtra ids ya contratados (`gameEngine.ts:361-363`); el comentario registra que antes el UI permitía re-seleccionarlos y el engine los duplicaba, duplicando bonos |
| Una operación por turno | `advisorActionUsed` gatea contratar (`gameEngine.ts:357`) y despedir (`:396`); se resetea al procesar fin de turno (`engine/turnProcessor.ts:613`) y al resolver elección (`engine/electionEngine.ts:113`) |
| Efecto inmediato vs próximo turno | **Inmediato**: ambas funciones terminan en `recalcState` (`gameEngine.ts:384`, `:399`), que recalcula `baseActions`/`actions` al instante (`engine/engineShared.ts:110-122`). Comentario explícito "FIX (Punto 12)" en `:381-383` y `:397-398` |
| Despido | `dismissAdvisor` (`gameEngine.ts:392-404`): elimina por id, sin reembolso, recalc inmediato, consume la acción de asesor del turno |

### 2.4 Especialidades × mapeo a acciones

Mapa real en `utils/actionEffects.ts:115-127` (`ADVISOR_SPECIALTY_CATEGORY_MAP`), con normalización `advisor.specialty.toLowerCase().trim()` (`:134`):

| Especialidad en data (`data/advisors.ts`) | Key normalizada | Categorías mapeadas | Bonus ×1.2 alcanzable |
|---|---|---|---|
| Economista | `economista` | economia | ✅ |
| Comunicación Social | `comunicación social` | cultura, social, diplomacia | ✅ |
| Infraestructura | `infraestructura` | infraestructura | ✅ |
| Políticas Sociales | `políticas sociales` | **NINGUNA** (no está en el mapa) | ❌ |
| Relaciones Internacionales | `relaciones internacionales` | diplomacia | ✅ |
| Seguridad Pública | `seguridad pública` | **NINGUNA** (el mapa tiene `seguridad`, sin "pública") | ❌ |
| Educación | `educación` | educacion | ✅ (pero solo 1 acción de educación existe en el registry) |

Confirmado: **2 de 7 especialidades ("Políticas Sociales" y "Seguridad Pública") jamás otorgan el ×1.2** por desfasaje de nombre. El bonus es acumulativo por asesor que mapee (`multiplier *= 1.2`, `actionEffects.ts:137`).

### 2.5 Efectos no declarados

- Contratar/despedir recalcula las acciones disponibles **al instante** (`recalcState`, ver 2.3). `recalcState` también recalcula `popularity` vía `calculatePopularidad` y `votingIntention` vía `calculateElectionVotingIntention` (`engine/engineShared.ts:110-121`).
- `turnsInactive` / `isActive: false`: **ningún código del engine** escribe estos campos con valor distinto de `0`/`true` (grep `isActive: false|turnsInactive: [1-9]` solo arroja tests y docs). Los asesores **nunca se inactivan**: es un estado muerto que solo la UI sabe mostrar (`components/AdvisorPanel.tsx:122`, `components/AdvisorDismissModal.tsx:53`). El filtro `advisor.isActive` de `actionCalculator.ts:25` y `actionEffects.ts:133` evalúa siempre true en la práctica.

---

## Hallazgos de consistencia (solo señalados, sin proponer cambios)

1. **La UI promete bonos que no existen.** `AdvisorSelectionModal.tsx:157-171` muestra "+30% efectividad en economía" (policyModifiers) y "+15% relación con empresarios" (groupBonuses), y `popularityEffect` se grafica con flechas de tendencia. Ninguno de los tres campos es leído por ningún engine. El jugador paga $200-500M por estadísticas decorativas; el único retorno mecánico real de un asesor es `bonusActions` (acciones extra) y el ×1.2 de especialidad sobre la popularidad de la acción.
2. **Desfasaje de nombres de especialidad**: `data/advisors.ts` usa "Seguridad Pública" y "Políticas Sociales"; el mapa de `actionEffects.ts:115-127` no las reconoce → esos dos asesores nunca aplican su único bonus mecánico posible (el ×1.2). El jugador que contrata a Patricia Sánchez por su especialidad de seguridad no recibe nunca el bonus en las 7 acciones de seguridad.
3. **Magnitud casi nula de los costos por eje**: `axisEngine.ts:50-51` define `actionCostModifier` de ±1, y `actionEffects.ts:67-68` lo convierte en `1 + modifier/100` = **±1% de costo**, mientras los `effectivenessMultiplier` sí son ×1.10-1.20. Las notificaciones alarmistas de `turnProcessor.ts:83-136` ("Gobierno radicalizado", "Aislamiento político") sugieren consecuencias fuertes de los extremos ideológicos; en costo de acciones el efecto es de 1%.
4. **Doc de diseño describe mecánicas ausentes**: `docs/details/asesores_version_detallada.txt` documenta un `calculateAdvisorEffects` con `popularityModifier` aplicado a la popularidad, desactivación de asesores por `turnsInactive` y reactivación decrementando turnos — nada de eso existe en el engine actual.
5. **Plan vs. realidad de UI ideológica**: `docs/implementation-plan.md:78` prevé una sección "Perfil Ideológico" con 3 AxisBar en `IndicatorsPanel`; `components/IndicatorsPanel.tsx` real no muestra ejes (grep sin coincidencias de Axis/ideología) — el perfil solo es visible en `LegacyScreen` (pantalla final de legado), siendo ciego durante toda la partida pese a tener efectos mecánicos al cruzar ±80.
6. **`requiredAdvisors` es infraestructura vacía**: existe en el tipo (`types/game.ts:328`, también `systems/events/types.ts:33`) y en `eventResolver.ts:317-322`, pero ningún evento en `data/events/` lo declara (solo un test sintético en `__tests__/eventResolver.test.ts`).
7. **Deriva ideológica monótona por arquetipo**: las pasivas de arquetipo aplican shift de eje **cada turno** sin compensación (`archetypeEngine.ts:55-70`, corrido desde `turnProcessor.ts:312`). Un jugador que ejecuta pocas acciones ve cómo su arquetipo solo empuja un eje hacia el extremo de forma acumulativa (p. ej. sindicalista: -2/-2 por turno llega a -80 en ~40 turnos), y desde ahí los modificadores de extremo operan solos.
8. **UI de asesores inactivos muerta**: `AdvisorPanel.tsx:122` ("Estado: Activo / Inactivo por N turnos") y `AdvisorDismissModal.tsx:53` renderizan estados de inactividad que jamás ocurren en el engine (punto 2.5), sugiriendo al jugador una mecánica de rotación/sanción inexistente.
9. **El ×1.2 de asesor no refleja lo que la tarjeta sugiere**: el bonus de especialidad solo multiplica `popularityChange` (`actionEffects.ts:72`), no `budgetChange` ni `groupEffects`, mientras la tarjeta del asesor en UI insinúa "efectividad" general por categoría (policyModifiers mostrados, que además no se aplican). El tooltip de la acción y el resultado real coinciden entre sí, pero no con la promesa de la tarjeta del asesor.
