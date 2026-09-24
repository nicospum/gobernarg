# Integración del motor causal — GobernArg

Rama: `motor-causal` · Fuente de lógica: `_analisis_gobernarg/GobernArg_Motor_Causal_v1.xlsx` + `chat con contexto del avance.md` · Fuente de producto/UI/contenido: el repo.

Este documento resume qué se hizo, cómo está armado, qué se conservó/adaptó/deprecó y qué decisiones quedan abiertas. El detalle turno por turno del playtest está en `_analisis_gobernarg/playtest/PLAYTEST_REPORT.md` (análisis) y `PLAYTEST_DATOS.md` (datos crudos).

---

## 1. Resumen ejecutivo

- El juego ahora corre sobre el motor causal del Excel: **acción → paquete de efectos → 15 indicadores → satisfacción de 17 actores → canales de poder → política (APRO/IV/GOB/LEG)**. Ninguna acción mueve popularidad o grupos "a mano".
- **No se rehízo el juego**: se conservaron todas las pantallas, imágenes, asesores, habilidades, eventos, calendario, estrategia post-legislativa, cuaderno, legado, historial y la carrera de dos mandatos. Lo viejo se conectó al motor nuevo mediante un adaptador (`causalBridge.ts`).
- **No se borró ningún archivo** (0 archivos eliminados en la rama). Los sistemas viejos que ya no gobiernan el juego quedan marcados `@deprecated` y con sus tests funcionando.
- Estado de calidad al cierre: **lint limpio · typecheck limpio · 266 tests en 22 archivos OK · build OK · `npm run playtest` OK**.
- El motor reproduce las simulaciones S1–S3 del Excel (test `causalSimulations.test.ts`).

## 2. Arquitectura

```
src/
├── data/causal/                 ← DATOS (sin lógica)
│   ├── generated/*.ts           ← generado desde el Excel (no editar a mano)
│   ├── types.ts                 ← tipos de las filas del Excel
│   └── index.ts                 ← catálogo tipado + lo escrito a mano (requisitos, plataformas, mapeos legacy)
├── engine/causal/               ← DOMINIO PURO (sin React, sin GameState)
│   ├── dsl.ts                   ← parser de condiciones (COUNT, DONE, FLAG, SAT, REL, and/or/not)
│   ├── context.ts               ← valor efectivo = base + bonus; referencias temporales; saturación
│   ├── effects.ts               ← agenda: DELTA/BONUS/SET, offset, duración, PERSISTENT, CONDITIONAL, REPETITION
│   ├── rules.ts                 ← reglas estructurales R01–R20 (01B_INTERACCIONES)
│   ├── fiscal.ts                ← ingresos, gasto corriente, servicio de deuda, SOLV, proyección de caja
│   ├── actors.ts                ← satisfacción (tanh), sensibilidades, saliencia
│   ├── relations.ts             ← relación: acuerdos, pedidos, deriva
│   ├── channels.ts              ← canales de poder con rezago de 1 turno (07_CANALES)
│   ├── political.ts             ← APRO, ESTR, OTROS/imagen, IV, LEG, GOB
│   ├── interactions.ts          ← reunión, encuesta, negociación, acuerdo
│   ├── actions.ts               ← disponibilidad, costos, leyes/DNU, proyección
│   ├── turn.ts                  ← closeTurn: T.2–T.10
│   ├── state.ts / types.ts / rng.ts
│   └── index.ts
├── engine/causalBridge.ts       ← ADAPTADOR motor ↔ GameState/UI legacy
├── engine/*.ts                  ← orquestación del juego (turnos, elecciones, eventos) — adaptada
├── lib/causalText.ts, turnExplain.ts, agendaView.ts  ← textos y vistas legibles para la UI
├── components/*                 ← UI: sólo lee estado y llama funciones del engine
└── playtest/                    ← bots + runner deterministas (mismas funciones que la UI)
```

Reglas que se respetaron:
- **Cero lógica de motor en componentes React.** Los componentes llaman a `getPolicyAvailability`, `interactWithActor`, `processEndTurn`, etc., y leen textos de `lib/`.
- `GameState.causal` (`CausalState`) es la **fuente de verdad**. Los campos viejos (`popularity`, `budget`, `stability`, `legitimacy`, `votingIntention`, `legislativeSupport`, `groupRelations`, `groupMoods`) se **espejan** desde el motor en `syncLegacy()` para que las pantallas viejas sigan funcionando.
- RNG sembrado (mulberry32) dentro del estado → partidas reproducibles.
- `scripts/excel_to_causal.py` regenera `src/data/causal/generated/` desde el Excel. Cambiar el diseño = editar el Excel y regenerar.

### Orden del cierre de turno (`processEndTurn`)
1. `closeTurn` del motor (T.2 expirar/emisión forzada/suspensiones → T.3 agenda → T.4 canales → T.5 fiscal → T.6 reglas → T.7 actores → T.8 canales nuevos → T.9 relaciones → T.10 política).
2. Calendario político (legislativas, estrategia post-legislativa).
3. Consecuencias legislativas.
4. Eventos de canal (paro general, corrida, cacerolazo…) + eventos aleatorios con condiciones causales.
5. Notificaciones → fin de mandato → avance de calendario → PA → `syncLegacy` → derrota causal → avisos → metas → log → resumen.

### Convenciones de tiempo
- Los bonus se expresan en turnos de **cierre**; el jugador ve `viewRef = turn − 1` (el último cierre).
- Los flags se expresan en turnos de **decisión** (un flag seteado en el cierre c vale desde c+1; los flags de reunión valen en el mismo turno).

## 3. Decisiones tomadas

| Tema | Decisión | Origen |
|---|---|---|
| Victoria | 2 mandatos, **país continuo** (no se resetea entre mandatos). Reelección en T16 con IV ≥ 45 %. Al final del 2.º mandato, elección de **sucesión** (IV ≥ 45, sin bonus de incumbencia). | Usuario |
| Derrotas | Hiperinflación = INFL ≥ 90 dos turnos seguidos. Juicio político = GOB < 15 dos turnos seguidos. Caja negativa ⇒ **emisión forzada**, no derrota. Aprobación baja no es derrota inmediata. | Usuario (propuesta del Excel, R-24) |
| Metas | Los objetivos viejos se reemplazan por 5 metas de gestión basadas en indicadores (`getPresidentialGoals`). No otorgan victoria por sí solas. | Implementación, sin inventar condiciones de victoria |
| Satisfacción vs relación | Separadas. Satisfacción = cómo le va al actor con el país (indicadores). Relación = vínculo con el gobierno (reuniones, acuerdos, pedidos). | Excel |
| Reunión | Primera puerta: revela preocupaciones y pedido del actor, habilita negociar. Hay reuniones gratis por turno; los actores difíciles o con relación < 25 cuestan 1 PA. | Excel |
| Elecciones | Indicadores → satisfacción de actores → peso electoral. IV = 0,65·APRO + 0,10·ESTR + 0,25·OTROS. Sin doble conteo (test dedicado). | Excel (R-21 sigue abierta en pesos) |
| Legislativas | Nuevo LEG = 0,5·LEG + 0,5·(votos + aliados). | Implementación |
| Incumbencia | +5 puntos en la reelección (no en la sucesión). | Implementación |
| Plataforma | Se elige al crear el personaje (5 plataformas, 3 indicadores con signo). Define qué le importa al oficialismo. Los ejes ideológicos se conservan como perfil narrativo. | Excel R-23 (propuesta) |
| Leyes | Acciones LEY requieren LEG ≥ umbral (45/50/55 según la oposición). El DNU permite sacar una por turno por decreto, con costo institucional y riesgo de suspensión judicial. | Excel |

## 4. Archivos principales

**Nuevos**
- `scripts/excel_to_causal.py` — generador desde el Excel.
- `src/data/causal/**` — datos del motor (generados + mano).
- `src/engine/causal/**` — dominio del motor.
- `src/engine/causalBridge.ts` — adaptador.
- `src/data/events/causalEvents.ts` — condiciones y efectos causales de los eventos existentes + eventos de canal.
- `src/lib/causalText.ts`, `src/lib/turnExplain.ts`, `src/lib/agendaView.ts` — textos y explicaciones.
- `src/components/ActorsPanel.tsx`, `src/components/CountryPanel.tsx`.
- `src/utils/actorIcons.ts`.
- `src/playtest/bots.ts`, `src/playtest/runner.ts`, `playtest/*.playtest.ts`, `vitest.playtest.config.ts`.
- Tests: `causalEngine.test.ts`, `causalSimulations.test.ts`, `playtestBalance.test.ts`.

**Reescritos sobre la misma API**: `engine/gameEngine.ts`, `engine/turnProcessor.ts`.
**Adaptados**: `electionEngine`, `eventResolver`, `engineShared`, `actionEngine`, `victoryConditions`, `advisors`, `specialAbilities`, `midtermStrategies`, `defeatReasons`, `imageAssets`, `categoryStyles` y ~25 componentes (ver §5).

## 5. Mapa KEEP / ADAPT / DEPRECATE / REMOVE

### KEEP (sin cambios de fondo)
Pantallas de inicio y creación de personaje, identidad visual, todas las imágenes y retratos, calendario político, historial (`GameLog`), eventos narrativos (textos e imágenes), carrera presidencial de dos mandatos, `careerRules`, `narrativeEngine`, `archetypeEngine`, perfil ideológico (como narrativa), estrategia post-legislativa (flujo y modal).

### ADAPT (conectados al motor)
| Sistema | Cómo se adaptó |
|---|---|
| Acciones (61 viejas → 58 del Excel) | Catálogo nuevo desde `04_ACCIONES`/`05_EFECTOS`. `LEGACY_ACTION_TO_NEW` mapea ids viejos. `ActionCard` muestra costo, PA, cooldown, línea de tiempo de efectos y actores afectados. |
| Grupos de interés → 17 actores | `LEGACY_GROUP_TO_ACTOR`. `groupRelations`/`groupMoods` se espejan desde el motor. Panel de actores nuevo con reunión/encuesta/negociar/acuerdo. |
| Indicadores superiores | Aprobación, Gobernabilidad, Conflictividad, Intención de voto, Caja (con proyección de cierre). Panel "Estado del País" con 15 indicadores en bandas legibles. |
| Asesores | Sueldo va al gasto corriente; bonus por rol (`ADVISOR_ROLES`: eficacia por categoría, descuentos de PA, revelaciones, imagen). Desbloqueo por APRO. |
| Habilidades especiales | `AbilityEffect[]` causales; pasivas con efectos de inicio. |
| Estrategia post-legislativa | `MIDTERM_CAUSAL`: multiplicadores de eficacia, relación por turno, LEG, imagen; descripciones veraces. |
| Eventos | Condiciones `when` en DSL causal; efectos al motor; efectos diferidos a la agenda. Chips causales en `EventModal`. |
| Elecciones | Legislativas y presidenciales causales, desglose por componente en `ElectionResultsModal`, sucesión. |
| Resumen de turno | Explica qué cambió y por qué (acción, regla, canal) y reacciones de actores. |
| Cuaderno, Informes, Beneficios activos, Efectos pendientes | Leen la agenda del motor (efectos en camino, en curso, condiciones vigentes, acuerdos y pedidos). |
| Legado / Game Over | Desempeño calculado desde el estado causal; textos de derrota actualizados. |
| Derrotas (`defeatReasons`) | Textos y consejos alineados con las reglas nuevas. |

### DEPRECATE (se conservan, marcados `@deprecated`, con tests)
- `data/actionRegistry.ts` (61 acciones viejas) — sigue usado por `GameLog`/`ManagementNotebook` para nombres históricos y por `groupAgendaEngine`.
- `data/interestGroups.ts`, `applyInteraction`, `satisfyGroupDemand` (legacy en `gameEngine`).
- `utils/actionEffects.ts`, `utils/electionSystem.ts` (partes), funciones viejas de `utils/victoryConditions.ts`.
- `engine/groupAgendaEngine.ts`, `engine/legitimacyEngine.ts`, `utils/crossGroupEffects.ts`, `lib/effect-helpers.ts`, `data/actionCategories.ts`: ya no los importa código vivo; quedan para no perder referencia de diseño y porque tienen tests.
- Rutas legacy de `eventResolver` para estados sin `causal`.

### REMOVE
**Nada.** No se eliminó ningún archivo ni componente. Se quitaron sólo fragmentos muertos introducidos durante la propia integración. Una limpieza de lo DEPRECATE queda como decisión futura (§12).

## 6. Indicadores

15 indicadores del Excel: INFL, ACTV, PODA, INVC, PRES, SOLV, EXTE, INFR, EDUC, PSOC, SEGU, CIEN, INST, AMBI, CONF. Valor efectivo = base + bonus vigentes. SOLV se deriva del resultado fiscal y la deuda (R19).

- **Visibilidad (R-22, propuesta del Excel)**: INVC, EXTE, EDUC, CIEN (y otros parciales) llevan el ícono de ojo tachado: el jugador ve la banda, no el número exacto.
- **Presentación**: bandas (Crítico/Débil/Normal/Bueno…), inflación como "~x % mensual", solvencia como riesgo país.
- **Saturación anti-espiral** (calibración, §11): los deltas de reglas y canales se atenúan cerca de los extremos (`SATURATION_BAND` = 30). INFL y SOLV quedan exentos para que la hiperinflación y la insolvencia sigan siendo alcanzables.

## 7. Línea de tiempo de efectos

La agenda soporta: DELTA (permanente sobre la base), BONUS (temporal), SET, offset (efecto "en N turnos"), duración, PERSISTENT (mientras dure el programa, con costo corriente), CONDITIONAL (EXEC/APPLY: se evalúa al ejecutar o al aplicar), REPETITION (ventanas COUNT: repetir la misma receta escala o castiga), topes. La UI la muestra en cada carta (AHORA / EN n T / TEMPORAL / PERMANENTE / MIENTRAS DURE) y en el cuaderno.

Excepción de datos: `CONDITION_OVERRIDES['reunion.02']` corrige una condición que contaba la ejecución actual dentro del COUNT.

## 8. Actores

17 actores con matriz de sensibilidad (`03_MATRIZ`) y satisfacción con fórmula tanh (ALFA 0,4, BETA 0,1). Relación separada (K_REL 20). Canales de poder (`07_CANALES`) con rezago de 1 turno: retención de cosecha, postergación de inversiones, medidas de fuerza, interpelaciones, riesgo país, etc. La oposición opera con −15 de satisfacción en los turnos preelectorales. Disidencia y rupturas del oficialismo/aliados.

## 9. Reuniones y negociación

- **Reunión**: revela preocupaciones y el pedido concreto (válido `VENTANA_DEMANDA` = 6 turnos), frescura de información 4 turnos, marca `reunido_<actor>` (requisito de algunas acciones).
- **Encuesta** ($50M): para actores no organizados (clase media, sectores populares).
- **Negociar**: probabilidad según relación/dificultad; si sale bien abre una oferta hasta el próximo turno.
- **Acuerdo**: compromiso de ejecutar una acción en `PLAZO_ACUERDO` = 4 turnos a cambio de una concesión del actor (tregua de canal, apoyo legislativo…). Cumplir +8 relación; incumplir −20 y −5 de credibilidad. La UI avisa si hoy no podrías ejecutar lo que prometés.

## 10. Elecciones

- **Legislativas** (año 2, T4): IV del cierre → votos; nuevo LEG = 0,5·LEG + 0,5·(votos + aliados). Consecuencias legislativas y estrategia post-legislativa en año 3, T1.
- **Presidencial** (T16): IV + 5 de incumbencia ≥ 45 ⇒ segundo mandato, país continuo.
- **Sucesión** (T32): IV ≥ 45 sin incumbencia ⇒ victoria de carrera.
- Cadena sin doble conteo: indicadores → satisfacción de actores → APRO (ponderada por peso electoral) → IV. El test `elecciones sin doble conteo` lo verifica.

## 11. Calibración aplicada (fuera del Excel, documentada)

Detectadas en el playtest y corregidas con cambios mínimos:
1. **Historial fiscal heredado**: `fiscalHistory` arranca con `[heredado, heredado]` para que SOLV no oscile violentamente en los primeros turnos.
2. **Saturación anti-espiral** en reglas y canales (excepto INFL/SOLV): evitaba colapsos en cadena irreversibles por acumulación de reglas.
3. **Proyección de caja al cierre** en la UI (incluye acciones que reducen ingresos e intereses de deuda nueva): el jugador no podía anticipar la emisión forzada.
4. Parámetros agregados (no estaban en el Excel): `DESANCLAJE_INICIAL` 12, `LEG_OFICIALISMO_BASE` 38, `LEG_ALIADOS` 9, `LUNA_MIEL_LEG` 8, `VENTANA_DEMANDA` 6, `FRESCURA_INFO` 4, `VOTOS_PARA_GANAR` 45, `HIPER_UMBRAL` 90, `GOB_CRISIS_UMBRAL` 15, `PLAZO_ACUERDO` 4.
5. Traducción de efectos viejos (eventos/habilidades que no se reescribieron): popularidad → imagen ×0,4; estabilidad → CONF −×0,3; presupuesto → CAJA; legitimidad → INST ×0,3; grupo → REL ×0,4.

## 12. Sistemas provisorios

- **Traducción automática de efectos legacy** (§11.5) en eventos que no tienen efectos causales escritos a mano.
- **Ofertas de acuerdo por actor** (`OFFERS` en `interactions.ts`): diseñadas en la integración; el Excel define la mecánica pero no el menú exacto.
- **Metas de gestión** (5 metas por indicadores): reemplazan los objetivos viejos; son orientativas.
- **Pesos del legado** (rating sobre 10).
- **Ids de notificaciones** con secuencia local (no consumen `Math.random`), para que las partidas con semilla no cambien por cambios de UI.
- **Sin persistencia**: el juego no guardaba partidas antes y sigue sin guardar (recargar la página reinicia). Si se agrega, `CausalState` es serializable (incluido el RNG).

## 13. Riesgos

- **Dominancia de la estrategia adaptable** (bot H gana el 100 % de las partidas, con ~70 % de votos en la reelección): la curva logística de APRO es empinada y un jugador que atiende a los actores más tensos escala rápido. Puede ser demasiado fácil para un jugador humano atento.
- **Asimetría ideológica**: el programa heterodoxo coherente (G1b) no gana nunca por restricción externa (EXTE), mientras el ortodoxo coherente (G2b) es reelecto en el 57 % y gana la carrera en el 27 %. Puede leerse como sesgo del diseño.
- **Hipernegociar no alcanza** (F): coherente con el diseño ("la reunión es la puerta, no el resultado"), pero conviene confirmar que el jugador lo entienda.
- **58 acciones visibles con 4 PA** (R-25): puede abrumar.
- **Bundle de 920 kB**: warning de Vite por tamaño de chunk (no bloquea).

## 14. Decisiones pendientes (para el equipo de diseño)

| Id | Tema | Estado en el código |
|---|---|---|
| R-21 | Fórmula final de IV y "otros componentes" (hoy OTROS = imagen presidencial) | Implementado con pesos del Excel 0,65/0,10/0,25; parametrizado en `PARAMS`. **Decidido** por el usuario: se mantiene 65/10/25. |
| R-07 | Segmentar PODA en formal/vulnerable | **Decidido** por el usuario: un solo PODA. |
| R-17 | Fusión Derechos + Cultura como actor | **Decidido** por el usuario: se mantienen juntos (`derechos_cultura`). |
| R-22 | Visibilidad de indicadores | Propuesta del Excel implementada (bandas + ícono). |
| R-23 | Plataforma del oficialismo | Propuesta implementada (5 plataformas, 3 indicadores). Confirmar. |
| R-24 | Umbrales de derrota | **Decidido** por el usuario: propuesta del Excel. |
| R-25 | 58 acciones visibles vs ~25 al inicio | **Decidido** por el usuario: las bloqueadas (espera, requisitos, ley sin DNU posible) se ocultan por defecto, con botón "Ver también las bloqueadas". Las que sólo esperan PA, caja o un DNU siguen visibles. |
| R-26 | Efecto directo de transparencia sobre la relación con el oficialismo | Se conserva como en el Excel. |
| Balance | Curva logística de APRO / dominancia del jugador adaptable | Sin tocar: requiere decisión de dificultad. |
| Balance | Asimetría heterodoxo/ortodoxo (EXTE, R07/R17 de reglas) | Sin tocar: requiere decisión de diseño. |
| Producto | Cantidad de PA por turno (4) | Sin tocar. |
| Producto | Limpieza de módulos DEPRECATE | Pendiente de aprobación. |

## 15. Cómo verificar

```bash
cd "project-bolt-sb1-dzgqso GobernArg 21-11/project"
npm run lint
npx tsc --noEmit -p tsconfig.app.json
npx vitest run
npm run build
npm run playtest   # regenera _analisis_gobernarg/playtest/PLAYTEST_DATOS.md y partida_<bot>.json
```

QA visual realizada en el navegador (1440×900 y 375×812): inicio, creación de personaje con plataforma, panel principal, estado del país, cartas de acción, actores (reunión/negociación/acuerdo), resumen de turno, eventos con chips causales, estrategia post-legislativa, fin de mandato, resultados electorales con desglose, derrota, legado, asesores (con retratos), cuaderno. Todas las imágenes cargan. Hallazgos corregidos en el commit `fix(ui): textos y detalles encontrados en la QA visual`.
