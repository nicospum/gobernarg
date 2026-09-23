# GobernArg — Informe de Dinámicas: Estado Actual y Decisiones de Balance

**Repo:** `project-bolt-sb1-dzgqso GobernArg 21-11/project` · branch `rediseno-visual` · commit base `c1c138d`
**Alcance:** MVP presidente-only (único cargo jugable). Auditoría de 4 agentes en paralelo (economía, victoria, política/grupos, acciones/arquetipos) sobre el código real, con números exactos.
**Convención de estado:** ✅ funciona · ⚠️ funciona con problemas · ❌ roto · 🧟 muerto (existe pero no tiene efecto)

---

## 1. Resumen ejecutivo

La columna vertebral del juego **funciona y es legible**: hay un loop claro (elegís 1-3 acciones → la plata y la popularidad reaccionan → eventos y demandas presionan → elección al año 4 → segundo mandato → legado). La derrota por popularidad y por déficit tienen dientes, la re-elección se gana con margen razonable, y las 8 acciones "firmadas" con `explicitGroupEffects` hacen que la política responda.

Pero el balance tiene **tres problemas estructurales**:

1. **La victoria final es prácticamente imposible (~0% probabilidad en partida normal).** Pide 10000M (techo teórico ~9900M) + popularidad 80 + 5 grupos a 75-85, todo simultáneo y solo evaluado en el 2º mandato (que además resetea los objetivos). Casi todo jugador termina `victorious=false` sin haber tenido nunca una ruta jugable a `true`.
2. **La economía es deflacionaria por diseño.** Ingreso neto +150M/turno vs costo promedio de acción ~302M: para actuar necesitás préstamos (sin límite real) o emisión, y la caja se agota ~turno 10-12 si gastás en 2 acciones por turno.
3. **La superficie política es estrecha y miente en cosas cosméticas.** ~85% de las acciones no mueven ningún grupo (matcher muerto), la "probabilidad de éxito" de eventos es teatro (y hay un bug: los efectos base de eventos con choices nunca se aplican), los asesores prometen bonos que no existen, y los efectos diferidos de largo plazo se evaporan al reelegir.

**Conclusión:** el juego hoy es "sobreviví la reelección y mirá tu legado mediocre". Eso puede ser una decisión de diseño válida para el MVP, pero hay que tomarla conscientemente.

---

## 2. Cómo es una partida (loop real, presidente)

- **Inicio:** presupuesto 3500M, ingreso 500M, mantenimiento 350M (neto **+150M/turno**), popularidad inicial según arquetipo (50 o 70), 16 turnos por mandato (4 años × 4 trimestres).
- **Por turno:** 1-3 acciones (base 1 + arquetipo + asesores + bonus si pop ≥75), decay de popularidad **−10**, evento aleatorio (promedio ~−2 pop), demandas de grupos.
- **Válvulas de plata:** 2 préstamos (+800M y +500M, cooldown 8, **−10% de ingreso permanente** cada uno) y emisión de dinero (+150M, cooldown 3, factor decreciente; a las 3 emisiones: −5 pop y −50M/turno; a las 7: derrota — inalcanzable en un mandato).
- **Año 4, turno 16:** elección. Necesitás ~45 puntos de "votos" (promedio real del jugador que no se hunde: 60-75). **Ganar resetea:** objetivos, popularidad (pop×0.7+30), presupuesto (3500 + 10% de lo acumulado), historicalBudget, pendingEffects, cooldowns de eventos.
- **Fin del 2º mandato (turno 32):** legado. Victoria solo si cumpliste los objetivos del 2º mandato.

---

## 3. Tabla maestra de estado por sistema

| Sistema | Estado | Detalle |
|---|---|---|
| Loop de turno (acciones → procesar → eventos/demandas) | ✅ | `turnProcessor.ts` |
| Derrota por popularidad (<30 dos turnos seguidos) | ✅ | La única vía de derrota con dientes reales |
| Derrota por déficit (<0 dos turnos) | ✅ | `victoryConditions.ts:56-59` |
| Re-elección (mecánica de votos) | ✅ | Funciona, **excesivamente fácil** (umbral 45) |
| Reset de mandato | ✅ | Completo y correcto tras el fix de historicalBudget |
| Cambios de apoyo vía `explicitGroupEffects` (8 acciones) | ✅ | Prioridad clara sobre el matcher |
| Demandas: cumplir/ignorar | ✅ | +10 / −influence / +5 con antagonismo |
| Disparo de eventos (cola, cooldowns) | ✅ | Cooldown por evento y global funcionan |
| Interacciones (reunión/negociar/conceder) | ✅ | +2 / +4 / +15, costos en `interactionCosts.ts` |
| Matriz de antagonismo | ✅ | Aplicada en turno y demandas |
| Asesores: bonusActions + multiplicador | ✅ | Sí tienen efecto real |
| Acciones generadoras de plata | ✅ | Recaudación / reforma / reducción de gasto |
| Mantenimiento diferido (acciones ≥200M) | ✅ | 15% aleatorio a 2-4 turnos |
| Cooldowns de acciones | ✅ | 5 explícitos + default por \|Δbudget\| |
| Penalidad legislativa en reformas | ✅ | Viva y comunicada |
| **Victoria final** | ❌ | Imposible en la práctica (§5) |
| **Evaluación de objetivos** | ✅ | ~~Off-by-one~~ **FIXED** en `finalizePresidentialCareer` (commit posterior al informe): re-evalúa objetivos antes de fijar `victorious` |
| **Efectos base de eventos con choices** | ❌ | **Nunca se aplican** — solo los efectos del choice elegido |
| **Probabilidad de éxito de eventos** | ❌ | 100% decorativa (`EventModal.tsx:208-226`) |
| **Asesores: groupBonuses/policyModifiers/popularityEffect** | ❌ | Display-only; 2 de 7 especialidades no mapean nunca |
| **Matcher textual grupos ↔ acciones** | ❌ | Muerto → ~85% de las acciones políticas no mueven ningún grupo |
| Decay de popularidad | ⚠️ | −10/turno exige dedicación casi total a acciones de pop; piso 0.4G oculto |
| Economía global | ⚠️ | Deflacionaria: neto +150 vs acción promedio ~302 |
| Pasiva empresario "+20% economía" | ⚠️ | La descripción dice "+20% presupuesto en acciones de economía"; implementa **+20% de ingreso fiscal/turno** (`specialAbilities.ts:182`) |
| Coalición (evento) | ⚠️ | Funciona, pero aceptar da **opositores +20** (contraintuitivo, `political.ts:32`) |
| diminishingFactor de antagonistas | ✅ | ~~Desalineado~~ **FIXED**: eliminada la doble pasada en `turnProcessor.ts` (una sola aplicación alineada al cálculo canónico). Nota: el desajuste del ~20-25% no se reproducía con el código actual del árbol; el fix deja guardia de regresión |
| futureEffects delay 5-6 | ⚠️ | Se pierden al reelegir si activationTurn > 16 (`electionEngine.ts:104`) |
| Filtro de demandas | ⚠️ | Ignora minLegislativeSupport/minGroupSupport/minBudget → demandas inejecutables |
| Interests ↔ grupos | ⚠️ | IDs válidos, pero deportistas/artistas/académicos/etc. no tienen acciones que los muevan |
| Re-elección umbral | ⚠️ | 45 demasiado bajo: +20 puntos de regalo; el pasivo puro llega a ~49 |
| UI de acciones | ⚠️ | Las bloqueadas se ocultan en vez de mostrarse deshabilitadas; badge de cooldown estático |
| `extraLoans` (empresario) | 🧟 | `getMaxLoans` existe pero el límite está hardcodeado (`Math.min(3)`) |
| `baseActionsModifier` e `ironman` (dificultad) | 🧟 | Declarados, nunca consumidos |
| Pasiva comunicador "Agenda setting ×1.1" | 🧟 | El ×1.1 está hardcodeado en `actionEffects.ts:107-108`; `incomeBonus: 0` |
| Hiperinflación | 🧟 | Inalcanzable: máx ~4-5 emisiones por mandato < 7 requeridas |
| Pesos de eventos (`eventWeights.ts`) | 🧟 | Completo sin uso; `weight` ignorado |
| Impeachment / golpe institucional | 🧟 | Ocluidos por la vía de popularidad / legislativeSupport null |
| Elección perdida como final | 🧟 | Umbral tan bajo que casi no ocurre |

---

## 4. Economía — números y efectos

| Magnitud | Valor | Efecto en la partida |
|---|---|---|
| Presupuesto inicial | 3500M | Colchón de ~7 turnos sin ingresos extra |
| Ingreso neto pasivo | **+150M/turno** | En 16 turnos: +2400M sin hacer nada |
| Costo promedio de acción | **~302M** | 2 acciones/turno = −500M/turno → caja agotada ~turno 10-12 |
| Préstamo 1 | +800M, cd 8, **−10% ingreso permanente** | Financia ~2 turnos de déficit; el costo permanente se acumula |
| Préstamo 2 | +500M, cd 8, −10% ingreso permanente | Con ambos: ingreso 500→400 |
| Emisión (+150M, cd 3) | factor 0.65 decreciente | A las 3 emisiones: −5 pop, −50M/turno. Exploit conocido: préstamo/emisión para financiar todo lo demás |
| Acciones generadoras | recaudación/reforma/reducción | La vía "seria" de financiarse; `reforma_impositiva` exige legislativeSupport ≥45 que en año 1 es null→0 (**⚠️ inalcanzable temprano**, admitido en comentario `actionRegistry.ts:137-139`) |

**Veredicto:** la economía obliga a elegir cada turno entre "subir popularidad" y "no quebrar". Funciona como tensión, pero la dependencia de préstamos sin límite de cantidad es un agujero.

## 5. Victoria — matemática del problema

| Condición | Requisito | Realidad | Brecha |
|---|---|---|---|
| Re-elección | ~45 votos | Jugador no-hundido: 60-75 | **+20 a +30 de margen: fácil** |
| Objetivo `national-prosperity` | 10000M + pop ≥80 | Techo pasivo ~5900M; techo teórico ~9900M; pop con decay −10 sostenido | **Imposible sin exploit y aun así justo** |
| Objetivo `total-stability` | 5 grupos a 75-85 | clase-alta arranca en 30; matriz de antagonismo; +225 bruto necesario en 16 turnos | **Diseñado para no cumplirse** |
| Evaluación | fin del 2º mandato | **Objetivos resetean al reelegir** → solo 16 turnos para cumplirlos, y el off-by-one los evalúa un turno atrasados | Doble penalización |

**Efecto en el jugador:** termina la carrera con `victorious=false` siempre, y el legado se siente como un boleta de "participaste".

## 6. Acciones por turno y arquetipos

| Fuente de acciones | Valor | Estado |
|---|---|---|
| Base presidente | 1 | ✅ (`actionCalculator.ts`, POSITION_BASE_ACTIONS) |
| Arquetipo | +1 (político/empresario/sindicalista); comunicador da 1 pero pop inicial 70 y ×1.1 | ⚠️ doble conteo en turno 1 del sindicalista (`archetypeEngine.ts:32-33`) |
| Asesores | +1 (bonusActions) | ✅ |
| Bonus popularidad | +1 si pop ≥75 | ✅ |
| Dificultad | `baseActionsModifier` −1 en hard/legend | 🧟 **no consumido** — exactamente el compensador que haría falta |
| Inicialización | `getInitialGameState` hardcodea `actions: 5` | ⚠️ contradice POSITION_BASE_ACTIONS |

**Trayectoria típica:** con 2 acciones y decay −10 + eventos ~−2, necesitás **+12 brutos/turno** solo para empatar la popularidad. Acciones pop-baratas dan +3..+8 → estás en la cuerda floja hasta llegar a pop 75 (3ª acción), que es donde el juego se vuelve manejable. En hard/legend (decay ×1.3/×1.5) sí es "solo sobrevivir".

## 7. Política y grupos — qué responde y qué no

| Palanca | Efecto real | Estado |
|---|---|---|
| 8 acciones con `explicitGroupEffects` | Apoyos directos, prioridad sobre matcher | ✅ |
| Otras acciones políticas | Apoyo derivado solo de Δpopularidad × influencia/10 | ⚠️ funciona pero es opaco |
| Matcher de texto (keywords "apoyo"/interests) | Inservible | 🧟 por eso ~85% del toolkit no mueve grupos |
| Interacciones (reunión/negociar/conceder) | +2 / +4 / +15 apoyo | ✅ la palabra grupal más fiel |
| Demandas | +10 cumplir / −influence ignorar | ✅ presión real |
| Eventos | Disparan bien; choices con probability 100% | ❌ la barra miente + efectos base perdidos |
| Coalición | opositores +20 al aceptar | ⚠️ signo sospechoso |
| Antagonistas | subir unos baja otros | ⚠️ diminishingFactor ~20-25% descontado de más |
| Asesores | +acciones y ×1.2 en su especialidad (5/7) | ⚠️ el resto de sus campos es decoración |
| Efectos diferidos largos | se pierden en la elección | ⚠️ castiga planificar |

---

## 8. Lo que está bien (no tocar sin motivo)

1. Loop de turno claro y debuggeado (230 tests verdes).
2. Derrota por popularidad: tensión real cada turno desde el minuto 1.
3. Re-elección con margen: da la satisfacción de "me reciclaron" sin esfuerzo heroico — el filtro real es el decay.
4. Las 8 acciones firmadas: el jugador que las descubre siente que "entendió el juego".
5. Demandas y antagonismo: generan decisiones con costo de oportunidad.
6. Préstamos con costo permanente: buena válvula con precio.
7. Emisión con escalera de consecuencias: bien diseñada, aunque el último peldaño es inalcanzable.

---

## 9. Decisiones pendientes (elegir por número)

### Grupo A — Victoria y estructura de partida

1. **Victoria final.** ¿Qué querés que sea?
   - **A1:** Acumular objetivos entre mandatos (no resetearlos al reelegir) + bajar umbrales (7000-8000M, grupos 70-75). → victoria alcanzable en partida buena, ~2º-3º intento.
   - **A2:** Solo bajar umbrales. → sigue siendo solo 2º mandato, más alcanzable.
   - **A3:** Solo acumular entre mandatos. → 32 turnos para cumplir objetivos originales.
   - **A4:** Dejarla imposible pero honesta: mostrarla como "desafío de legado" y cambiar el copy del final. → cero código de balance.
2. **~~Off-by-one de evaluación final.~~ ✅ HECHO** (post-informe): re-evaluación de objetivos dentro de `finalizePresidentialCareer`, con test que fallaba antes y pasa ahora.
3. **Umbral de re-elección (45).** ¿Subirlo a 55-60 para que la elección filtre? Hoy el pasivo puro casi gana.

### Grupo B — Economía

4. **Préstamos.** ¿Límite real de 3 consumiendo `getMaxLoans` (activa la pasiva extraLoans del empresario de regalo), o sin límite pero subiendo el costo permanente?
5. **Emisión/hiperinflación.** Hoy la derrota por hiperinflación (7 emisiones) es inalcanzable. ¿Bajo el umbral a 5-6 para que exista el riesgo, o lo dejo como escenario imposible?
6. **`reforma_impositiva` bloqueada en año 1** (legislativeSupport null→0 < 45). ¿Le doy vía alternativa (umbral con ?? 30, o que los asesores de política sumen LS), o queda como acción de año 2+?

### Grupo C — Superficie política

7. **Matcher de grupos muerto.** ¿Porto `affectedGroups` de las acciones al engine (rápido, sirve las 53 acciones ya evaluadas en `etapa2_propuesta_groupEffects.md`) o amplío acción por acción con `explicitGroupEffects` (finísimo pero lento)? Esto es LA decisión que hace que "la política responda".
8. **Eventos: la barra miente.** ¿Implemento la tirada real de `choice.probability` (puede fallar una elección de evento — más drama) o borro la barra y dejo 100% siempre? Ojo: hay un bug aparte — los efectos base de eventos con choices nunca se aplican. Ese fix va sí o sí con cualquiera de las dos.
9. **Asesores.** ¿Implemento groupBonuses/policyModifiers/popularityEffect (asesores con identidad real) o recorto la UI a lo que funciona (+acciones, ×1.2, costos)?
10. **Demandas inejecutables.** ¿Completo el filtro con minLegislativeSupport/minGroupSupport/minBudget (menos demandas pero siempre cumplibles) o las dejo como "presión política sin garantía"?
11. **futureEffects al reelegir.** ¿Conservo los pendingEffects con activationTurn > 16 al segundo mandato? Cambia el significado de "planificar a largo plazo".

### Grupo D — Pulido de sistemas vivos

12. **Coalición:** `opositores +20` al aceptar. ¿Lo invierto a `aliados`/`opositores −20`?
13. **~~Antagonistas~~ ✅ HECHO** (post-informe): eliminada la doble pasada en `turnProcessor.ts`. El desajuste del ~20-25% no se reproducía con el código actual; quedó guardia de regresión.
14. **Dificultad:** consumo `baseActionsModifier` en `actionCalculator.ts` (hard/legend pasan de imposibles a duras). ¿Lo activo?
15. **Arquetipos:** corrijo la descripción de la pasiva empresario (o la implementación), arreglo el doble conteo del sindicalista en turno 1, y sincronizo `getInitialGameState` con POSITION_BASE_ACTIONS. Pack mecánico, ¿va?
16. **UI:** acciones bloqueadas visibles deshabilitadas con razón + cooldown restante real en la carta. ¿Va en la misma tanda?

---

## 10. Efectos esperados por combinación de decisiones

| Si decidís... | Efecto en la partida |
|---|---|
| A1 + 3 + 14 | Partida de ~45-60 min con final ganable en el 2º-3º intento; elección filtra de verdad; hard es duro pero justo |
| A4 solo | El juego queda como sandbox de "sobreviví"; el legado muestra progreso, no victoria. Menos frustración que hoy (porque el copy es honesto), menos dopamina |
| 7 (cualquiera de las dos vías) | La política pasa de "8 acciones importan" a "todo el toolkit importa" — el cambio de percepción más grande del MVP |
| 8 (tirada real) + 13 | Los eventos pasan de notificación a decisión con riesgo; los antagonistas pinchan como se anuncia |
| 4 + 5 + 6 | Economía con tres válvulas distintas y ningún agujero: deuda cara, emisión riesgosa y reforma como inversión de año 2 |
| 9 + 10 + 11 | Los sistemas secundarios dejan de mentir: asesores con identidad, demandas cumplibles, planificación de largo plazo premiada |

**Sugerencia de orden si querés el menor riesgo con mayor impacto:** 2, 13 (bugs directos) → 7 + 8 (superficie política) → A1 + 3 (victoria) → 4-6 (economía) → 9-11 (sistemas secundarios) → 12, 14-16 (pulido).

---

*Generado por auditoría multi-agente (4 exploradores en paralelo) sobre commit `c1c138d`. Todos los valores verificados contra código con ruta:línea en el cuerpo del informe.*
