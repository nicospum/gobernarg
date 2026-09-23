# GOBERNARG — Comprensión integral del proyecto

**Documento de análisis técnico y de diseño**
**Fecha de análisis:** 2026-09-19 · **Estado analizado:** versión 4.4 (commit `14d5810`, rama `rediseno-visual`)
**Método:** revisión completa del repositorio con 7 especialistas en paralelo (historia git, diseño documentado, arquitectura del engine, datos/contenido, UI/componentes, tests/calidad, roadmap/auditoría), más los 2 PDFs de diseño original extraídos a texto. Los reportes completos de cada especialista están en `_analisis_gobernarg/reporte_*.md`.

---

## 1. Qué es GobernArg

GobernArg es un **juego de estrategia y simulación política argentina, 100% client-side** (React 18 + TypeScript + Vite, sin backend). El jugador encarna a un dirigente político —hoy solo disponible como **presidente**— y debe administrar un mandato completo de **4 años × 4 trimestres = 16 turnos**, gestionando presupuesto, popularidad, estabilidad, relaciones con 18 grupos de interés y una agenda de eventos, hasta llegar a las elecciones generales del año 4.

**La fantasy:** ser el político argentino que negocia con sindicatos, empresarios, la oposición y la prensa; ceder cuando conviene, resistir cuando hace falta, y pensar las consecuencias a varios turnos vista. El vocabulario del juego es auténtico: emisión monetaria, default selectivo, Paritarias, tarifazos, juicio político, "pasarse de rosca".

**Filosofía de diseño:** 10 principios que deben *emerger* de las mecánicas y no explicarse en tutoriales:

1. *El camino no es recto, es sinuoso* — efectos contextuales y diferidos; no hay acción "siempre correcta".
2. *Toda decisión tiene costo* — costos multidimensionales (presupuesto, popularidad, grupos, estabilidad, legitimidad); nada solo suma.
3. *La dosis hace al veneno* — rendimientos decrecientes por repetición; acciones "doradas" que se vuelven tóxicas.
4. *No se puede maximizar todo* — ejes contradictorios; gobernar es elegir qué sacrificar.
5. *La estabilidad vale más que la épica* — bonus por estabilidad sostenida; victorias "aburridas" posibles.
6. *La legitimidad es un recurso* — medidas impopulares requieren legitimidad (⚠️ diseñada, parcialmente implementada).
7. *El poder se gasta* — capital político que se reconstruye lento.
8. *Cambiar las reglas también es política* — reformas institucionales como acciones de alto riesgo.
9. *La política es contextual, no binaria* — el perfil ideológico emerge de las decisiones.
10. *Gobernar desde la fuerza exige abrirse* — tras ganar fuerte, convocar rinde más que radicalizar.

---

## 2. Stack y estructura

| Capa | Tecnología |
|---|---|
| Framework | React 18.2 + TypeScript 5 |
| Build | Vite 7 |
| Estilos | Tailwind 3.4 (tokens HSL CSS) + tailwindcss-animate |
| UI primitives | Radix UI (Tooltip, Progress), sonner (toasts), motion, embla-carousel, lucide-react |
| Tests | Vitest 4.1.9 (entorno `node`, 183 tests en 16 archivos) |
| Calidad | ESLint 8 (typescript-eslint flat config), `tsc -b` limpio |

**Tamaño:** ~16.900 líneas TS/TSX/CSS en `src` (98 archivos), de las cuales el engine ocupa ~2.565 líneas en 12 módulos y la capa de datos ~4.050 líneas.

```
src/
├── engine/        12 módulos del motor (fachada, turno, elecciones, eventos, agendas, ejes, arquetipos, dificultad, legitimidad, narrativa, acciones, shared)
├── data/          contenido: 61 acciones, 18 eventos activos + 6 legislativos, 18 grupos, 7 asesores, habilidades, estrategias, calendario, derrotas
├── components/    27 componentes React (tablero, 12 modales, paneles, pantallas de inicio/cierre)
├── utils/ + lib/  fórmulas satélites (elecciones, popularidad, efectos, costos, victoria) y helpers
├── systems/       tipos de efectos y eventos
└── types/game.ts  GameState: modelo central de ~85 campos
```

---

## 3. Historia del proyecto (git)

**60 commits, del 2026-06-23 al 2026-08-20**, un solo autor (dos identidades git: `Nicolas` y `nicospum`), rama `rediseno-visual`. Actividad real en solo **7 días de trabajo** con un hiato de 51 días (26-jun → 16-ago). La prioridad temporal es clara: **todo el estado actual del juego viene de agosto, especialmente del 19-ago**.

### Las 5 eras

**Era 1 — Maduración del motor (23-jun, 26 commits en un día).** Sobre un baseline de Bolt de 15.295 líneas, en ~11 horas se ejecutaron 4 fases de mecánica (balance por cargo, "las decisiones tienen memoria", "gobernar es elegir qué perder", "el poder se gasta") y 6 sprints motor↔UI. Nacieron los sistemas de legitimidad, ejes ideológicos, agendas de grupos con estados de ánimo, 4 dificultades y 5 vías de derrota. El mismo día se fixearon en caliente 9 bugs críticos (inmutabilidad de estado, derrota prematura, reset de mandato, crashes en `satisfyGroupDemand`).

**Era 2 — Rediseño visual (24/25-jun, 5 commits).** Con referencias exportadas desde Figma, se reskineó toda la app: design system dark (fondo azul pizarra, acento dorado, Barlow Condensed + Inter + JetBrains Mono), TopBar compacto, indicadores con sistema de riesgo, reskin de los 8 modales y pantallas pre-juego, más el fix del bug del turno trabado (`canEndTurn` exigía acciones > 0 y bloqueaba la partida al gastar todo).

**Era 3 — Refactor y fundamentos (16-ago, 6 commits).** Tras el hiato: el engine monolítico se partió en **7 módulos**, el registry unificó 58 acciones, se eliminaron 5 utils legacy y apareció la suite Vitest (10 tests → **63 tests**, **0 errores de TypeScript** tras pagar una deuda grande).

**Era 4 — Pulido de diseño y foco MVP (17-ago, 5 commits).** Día de *game design* con TDD: concesiones limitadas (máx 4/mandato, requieren reunión o negociación previa, costo cruzado al resto de los grupos), encadenamiento de acciones (6 acciones de alto impacto requieren prerrequisitos), demandas de grupos como eventos raros (anti-spam), impacto cruzado de satisfacción (trade-offs), **recorte a MVP solo presidente** y **economía de acciones con rebalanceo electoral anti-inacción** (nuevo factor ACTIVIDAD del 15% en la intención de voto).

**Era 5 — Assets, auditoría y optimización (19/20-ago, 18 commits, la era más densa).** Maratón en dos frentes:
- **Día (04–13h):** 31 piezas SVG propias en 2 versiones + galería, integración de 66 assets webp (iconos, 11 imágenes de eventos, fondos institucionales, asesores, personajes), activación de los **12 eventos pendientes** (quedaron 18 eventos activos), limitador global de eventos aleatorios (cooldown 3 turnos + máx 5 por mandato).
- **Noche (23h–01h):** auditoría profesional con **6 revisores + 5 verificadores independientes** → informe de 518 líneas con **119 hallazgos (4 críticos, 26 altos)**. Luego, en la misma noche, se ejecutaron las **FASES 1 a 4 del plan de optimización**: turnos globales (fix del bug sistémico de aritmética cíclica), victoria posible (fix de objetivos), 17 efectos de eventos reconectados, mutaciones React eliminadas, pasivas de arquetipo conectadas, dificultad conectada, fórmula de voto unificada, dead code eliminado y **75 tests nuevos → 183 pasando, build OK**. Cierre con sincronización de 7 documentos.

### Estadísticas del repo

- **Commits por tipo:** feat 48% · docs 22% · fix 20% · refactor 5% · chore 3%. La documentación acompaña al código en cada etapa.
- **Ritmo:** sesiones maratónicas matutinas (05–11h, 33 commits) y una maratón nocturna el 19-ago (8 commits entre las 23:00 y la 01:00). Picos de 26 commits/día.
- **Crecimiento de `src`:** 7.599 → 16.918 líneas, 56 → 98 archivos, neto de ~1.100 líneas de dead code eliminadas en la optimización.
- **Tests:** 0 → 183 en dos ráfagas (16-ago y 19/20-ago).
- **Archivos más tocados:** `engine/gameEngine.ts` (42% de todos los commits), `App.tsx` (30%), `types/game.ts` (23%).
- **Autores:** una sola persona — vos (Nicolas), con dos identidades git distintas entre junio y agosto.

### Lectura de madurez

El proyecto maduró en tres saltos: **junio** (de prototipo Bolt a juego con identidad, con deuda técnica y fixes en caliente), **agosto inicio** (refactor + tests + diseño de reglas sofisticado + recorte de scope a MVP), y **agosto fin** (identidad visual propia masiva + auditoría con verificación independiente + plan ejecutado en una noche). La transición de "features rápidos + fixes de emergencia" a "refactor + tests + auditoría" es la marca del cambio de madurez.

---

## 4. El juego: diseño y mecánicas

### 4.1 Loop core

```
SELECCIÓN (arquetipo + dificultad; cargo = presidente fijo)
  → POR TURNO (trimestre): ejecutar N acciones políticas + interacciones con grupos
    + responder eventos/demandas
  → FIN DE TURNO: ingresos − mantenimiento − desgaste de popularidad
    + vencimiento de cooldowns/demandas/efectos diferidos + eventos (calendario/aleatorios)
  → HITO AÑO 2/T4: ELECCIONES DE MEDIO TÉRMINO (define bancada legislativa 28–58%)
  → HITO AÑO 3/T1: ELECCIÓN DE ESTRATEGIA POST-LEGISLATIVA (bloquea el turno hasta elegir)
  → HITO AÑO 4/T4: ELECCIONES GENERALES (≥45% = victoria; sin ballotage)
  → EPÍLOGO: pantalla de legado (rating /10, perfil ideológico, narrativa)
```

La intención de voto es **invisible** para el jugador durante la partida: el feedback es indirecto hasta el resultado electoral.

### 4.2 Métricas principales y fórmulas canónicas

**Popularidad (0–100):** `max(política, grupos·0.4 + política·0.6)` donde "grupos" es el **promedio simple** de las 18 relaciones. Desgaste natural por turno: −10 (presidente), escalado por dificultad. El 40% grupal actúa como piso: un presidente inactivo se estabiliza ~35%.

**Presupuesto:** inicial 3.500M (presidente); neto por turno +150M (ingreso 500 − mantenimiento 350). Préstamos: máx 3 (4 empresario), cada uno −10% de ingresos por servicio de deuda. **7 emisiones monetarias = hiperinflación = derrota instantánea** (a las 3 y 5 emisiones empiezan penalizaciones por inflación).

**Estabilidad (0–100):** no se desgasta sola; cambia por acciones, elecciones, estrategia y eventos. Umbral de impeachment: pop <10 y estabilidad <20 por 2 turnos. Umbral de golpe: estabilidad <10 y apoyo legislativo <25% por 3 turnos.

**Legitimidad (0–100):** sube con cultura/diplomacia, baja con decretos forzosos. Diseñada como recurso (a 0, las acciones cuestan el doble), pero ese consumo **no está cableado** en el runtime (función huérfana).

**Intención de voto (fuente única tras el fix 2.7):**

```
VI = 0.35·popularidadPromedio4T + 0.15·presupuesto + 0.15·gruposPonderados
   + 0.15·objetivosCumplidos + 0.05·estabilidad + 0.15·actividad
```

- "grupos" acá es **promedio ponderado por influencia** (distinto del promedio simple de popularidad — dos agregaciones del mismo dato).
- "actividad" = `accionesTomadas/16 · 100`: la defensa contra la estrategia de no hacer nada.
- Pasiva del Político de Raza: `VI += retención·(100 − VI)`.
- Para opciones de carrera: `(base + PROMOTION_DIFFICULTY[opción]) × multiplicadorDeAscenso`, clamp 0–100.

**Bancada legislativa (medio término):**

```
votos = 35 + (popProm−50)·0.25 + (grupos−50)·0.15 + objetivos·10% + (estab−50)·0.1 ± 3
votos = clamp(votos, 28, 58) → legislativeSupport = clamp(votos·1.1, 25, 75)
```

Outcomes: >45 paliza (+10 estabilidad), >42 cómoda, >37 justa, >34 minoría, sino derrota (−15 estabilidad). Con apoyo <35 hay 45% de evento de oposición; >45, 25% de evento de sobreconfianza. El apoyo legislativo modifica el costo en acciones de las reformas (−1/+0/+1/+2).

### 4.3 Sistemas de juego

**Acciones políticas (61 en 9 categorías).** Cada una tiene costo presupuestario (−700 a +800M), puntos de acción, efectos inmediatos, cooldown (2–8 turnos), **rendimientos decrecientes** (factor 0.65–0.90 por categoría, inversión a negativo tras 5 usos) y a veces **efectos diferidos** hasta 6 turnos (obra pública devuelve beneficios, pero genera mantenimiento del 15% a los 2–4 turnos). Hay **prerrequisitos encadenados**: estudio de factibilidad → energía renovable / hospitales / aeropuertos / vial; mejorar recaudación → reforma impositiva / préstamo internacional. Balance documentado: costo bajo 100–200, medio 200–400, alto 400–800, muy alto >800.

**Interacciones con grupos (costo = base × influencia).** Reunión +2 apoyo ($10) · Negociar +4 ($25×infl.) · Conceder +15 ($45–50×infl.). Reglas: máximo **4 concesiones por mandato**, conceder exige al menos una reunión o negociación previa en el mandato, y conceder genera **costo cruzado** al resto de los grupos (`max(2, influencia·0.5)`).

**Demandas (eventos raros).** Probabilidad base 8%/turno (hasta 25% si se ignora al grupo), máximo 2 activas, plazo 4 turnos. La demanda es una **acción concreta del registry**: si ya la ejecutaste dentro del plazo, se auto-cumple con +10 apoyo; si vence incumplida, penalización proporcional a la influencia. Cumplir cuesta 1 acción, da +5 apoyo y aplica el impacto cruzado por antagonismos.

**Antagonismos (el trade-off central).** Cuando un grupo gana apoyo, sus rivales pierden un ratio de esa ganancia (0.15–0.6). El eje dominante es **capital vs. trabajo**: empresarios/financiero ↔ sindicatos/populares con ratio 0.5 en ambos sentidos; después aliados ↔ opositores (0.6), ambientalistas ↔ agrícola/financiero, sindicatos ↔ clase alta. Los tests incluyen la invariante clave: *"es matemáticamente imposible subir todos los grupos a la vez"*.

**Eventos (18 activos con imagen propia).** 6 base + 12 habilitados el 19-ago (default, crisis energética, paro general, motín carcelario, narcotráfico, conflicto diplomático, sanciones, olas de calor, sequía, inundación, escándalo policial triggered, renuncia de ministro triggered). Cada uno tiene 1–2 choices con probabilidad propia. Probabilidades dinámicas por estado del juego: baja estabilidad multiplica crisis ×1.5, presupuesto negativo ×1.4, alta estabilidad ×0.6 — el juego **aprieta cuando estás débil** (death spiral suave, mitigado). Limitador global: cooldown de 3 turnos entre aleatorios + máximo 5 por mandato + 1 por turno; los eventos *triggered* y de calendario no se limitan.

**Arquetipos (4, con 2 habilidades activas + pasivas).**
- **Político de Raza:** Discurso Patriótico y Pacto de Gobernabilidad; retención electoral +10%, reuniones con aliados gratis.
- **Empresario:** Inversión Privada y Llamado a Inversores; ingresos económicos +20%, préstamo extra. Castiga a sindicatos/populares.
- **Sindicalista:** Movilización Social y Paro Controlado; reuniones gratis con sindicatos/populares, +1 acción base. Castiga a empresarios.
- **Comunicador:** Campaña Mediática y Gira de Medios; resiliencia −30% a eventos negativos, arranca con 70% de popularidad, todo ×1.1.

**Ejes ideológicos (3 continuos −100..+100):** radical↔conciliador, populista↔técnico, cerrado↔convocante. Se mueven por categoría de acción y activan efectos solo en los extremos (±80): modificadores de costo, efectividad y efectos de estado (cerrado extremo: +5 estabilidad pero −10 a todos los grupos). El perfil se revela en la pantalla de legado.

**Estrategia post-legislativa (año 3, forzosa):** Acelerar (×1.25, −3 estab/turno) · Negociar (×0.85, +3 estab/turno) · Abrirse (×1.15, +5 estab/+1 pop por turno, requiere 3+ grupos >50) · Jugada Audaz (×1.50 por 2 turnos, −5 estab/−3 pop por turno, requiere Comunicador/Político o pop >65).

**Asesores (7, máximo 2 simultáneos).** Cuestan 200–500M, dan +1/+2 acciones, multiplicadores de categoría (×1.2–×1.4) y bonos de apoyo a 2 grupos. Los dos mejores se desbloquean por hitos de popularidad. Sin mantenimiento ni sistema de lealtad todavía.

**6 vías de derrota:** popularidad baja (2 turnos bajo el umbral del cargo), colapso fiscal (2 turnos en negativo), impeachment, golpe institucional, hiperinflación (7 emisiones), derrota electoral (<45%). **Victoria:** ganar las generales; al completar el último mandato presidencial, evaluación final con objetivos cumplidos + popularidad ≥60 + presupuesto > 0.

### 4.4 Carrera política (diseñada, no jugable)

La escalera Intendente → Gobernador → Presidente existe en datos (`careerRules.ts`) y textos: presupuestos iniciales 800/2.000/3.500, ingresos netos +80/+150/+150, dificultades de promoción electoral (+5 reelección, −15 a gobernador, **−40 a presidente** — "casi imposible" desde intendente), máximos de mandatos 4/2/2. El **modo campaña está pendiente**: el MVP es presidente directo y la UI tiene el cargo hardcodeado.

### 4.5 Evolución del balance (auditoría de dificultad, junio)

Un análisis de dificultad diagnosticó el juego como **"muy fácil"** y lo endureció: acciones base 5 → 3/2/1 por cargo, desgaste −3 fijo → −5/−7/−10, umbrales de derrota duplicados en turnos, préstamos con límite y costo, emisión con consecuencias reales, rendimientos decrecientes, bonus por popularidad baja eliminado (premiaba estar mal). ⚠️ No hay análisis posterior que valide que el endurecimiento no fue demasiado lejos, y la Fase 6 de playtesting de balance sigue sin empezar.

---

## 5. Arquitectura técnica

### 5.1 Modelo de datos

`GameState` es un objeto plano monolítico de ~85 campos: progresión (cargo, año, turno 1–4 cíclico), indicadores, `groupRelations` (apoyo por subgrupo), memoria de decisiones (`actionUsageCount`, cooldowns, `completedActions`, `turnLog`), efectos pendientes, sistema político (apoyo legislativo, estrategia, ejes), agendas de grupos (demandas, moods, negociaciones en curso) y contadores de derrota.

**La invariante más delicada del sistema** (y origen del bug crítico de la auditoría): el turno es cíclico 1–4, por lo que toda aritmética de deadlines/cooldowns debe usar el **turno global** `(year−1)·4 + turn` (`getGlobalTurn` en `engineShared`). El propio código lo documenta: `turn + N` "nunca se cumple cuando el deadline cae en otro año".

El arquetipo se "compila" cada turno a acumuladores `_archetype*` (incomeBonus, extraLoans, retention, resilience, freeInteractions, extraActions) — un patrón de *materialized view*.

### 5.2 Módulos del engine

| Módulo | LOC | Responsabilidad |
|---|---|---|
| `gameEngine.ts` | 505 | Fachada + interacciones, asesores, habilidades, demandas; re-exporta todo el engine |
| `turnProcessor.ts` | 613 | `processEndTurn`: pipeline de ~15 pasos que orquesta a todos |
| `eventResolver.ts` | 378 | Eventos aleatorios/triggered/calendario + elección de medio término + consecuencias legislativas |
| `groupAgendaEngine.ts` | 255 | Generación de demandas, estados de ánimo, penalizaciones al vencer |
| `electionEngine.ts` | 125 | Elecciones generales, ascensos, reset de mandato, cierre de carrera |
| `actionEngine.ts` | 116 | Disponibilidad de acciones (filtros por cargo/cooldown/prerequisitos/presupuesto) |
| `narrativeEngine.ts` | 175 | Generador de texto (intro de turno, resultados) — puro |
| `engineShared.ts` | 148 | Constantes de balance, `getGlobalTurn`, `recalcState`, notificaciones |
| `axisEngine.ts` / `archetypeEngine.ts` / `difficultyEngine.ts` / `legitimacyEngine.ts` | 71 / 89 / 61 / 29 | Ejes, pasivas, dificultad, legitimidad (puros y pequeños) |

Fórmulas satélites viven en `utils/` (elecciones, popularidad, efectos de acción, costos de interacción, condiciones de victoria) y `App.tsx` consume todo a través de la fachada con funciones puras: `setGameState(prev => engineFn(prev, ...))`.

### 5.3 Flujo de un turno (`processEndTurn`)

```
1. Narrativa de introducción
2. ¿Estrategia post-legislativa pendiente? → RETORNO BLOQUEADO (el turno no avanza)
3. Calendario político (medio término / definición de estrategia)
4. Consecuencias legislativas (eventos de oposición / sobreconfianza según apoyo)
5. Pasivas de arquetipo (re-materialización de _archetype*)
6. Por cada acción seleccionada: efectos inmediatos, grupos por intereses,
   efectos pendientes, cooldowns, deuda, legitimidad, ejes
7. Efectos cruzados antagónicos
8. Procesar efectos pendientes activos
9. Ingreso − mantenimiento × deuda × modificadores × arquetipo × dificultad
10. Pasivos de la estrategia midterm
11. Desgaste natural de popularidad × dificultad
12. Efectos de ejes extremos
13. Eventos aleatorios (limitador: cooldown 3 turnos, máx 5/mandato)
14. Notificaciones
15. ¿Fin de mandato? (año 4, turno 4) → elección pendiente o cierre de carrera
16. Avanzar turno/año · cooldowns · inflación · agendas/moods · cooldowns de habilidades
17. recalcState (popularidad, acciones, intención de voto)
18. checkDerrota (5 vías) + objetivos y recompensas
19. Historiales + turnLog
```

### 5.4 Evaluación arquitectónica

**Fortalezas:** modularización real por dominio con fachada única; fórmula de voto unificada como fuente única; módulos pequeños puros y testeables; buenas invariantes documentadas en el código; cobertura de tests del engine.

**Debilidades (por orden de gravedad):**
1. **Estilo de estado mixto**: `processEndTurn` hace shallow copy y luego muta profundamente, mientras otras funciones son puras; funciones `void` que mutan su argumento. Semántica impredecible por archivo (hoy no explota porque App siempre usa el valor de retorno).
2. **Acoplamiento por God Object**: los 12 módulos reciben el `GameState` entero aunque usen 3 campos.
3. **Duplicación de fuentes de verdad**: umbrales de derrota en dos lados; tipos de eventos definidos dos veces (idénticos); dos definiciones de "reforma" (flag de datos ignorado por una heurística de `|budgetChange| ≥ 200`); dos agregaciones de apoyo grupal (simple vs. ponderada).
4. **RNG no determinista** en ~15 puntos (`Math.random`): sin seeds, sin replays, tests de integración frágiles.
5. **Deuda reconocida en el propio código**: `getMaxLoans` sin consumidores, `checkLegitimacyCostMultiplier` huérfana, `baseActionsModifier`/`ironman` sin cablear, pasivas aplicadas dos veces en `createNewGame`, lógica de `extraActions` duplicada.
6. **Efectos de grupos por matching de texto** (`interests` vs. `description.includes(...)`): acopla el modelo a la redacción.
7. **`votingIntention` post-elección copia el resultado electoral** en vez de recalcularse.
8. Tipado laxo en fronteras (`triggeredEvents: any[]`, imports inline).
9. Efectos de acción calculados dos veces por turno (paso 1 y paso 1.5), con riesgo de divergencia leve.

---

## 6. Contenido y balance

| Sistema | Cantidad | Detalle |
|---|---|---|
| Acciones políticas | 61 (9 categorías) | Economía 12 · Infraestructura 14 · Social 10 · Cultura 8 · Diplomacia 7 · Seguridad 7 · Educación/Turismo/Tecnología 1 c/u (stubs) |
| Eventos | 18 activos + 6 legislativos | con imágenes webp propias y choices con probabilidad |
| Grupos | 18 subgrupos en 5 familias | influencia 1–10, apoyo base 20–70, 3 demandas clave c/u |
| Antagonismos | 8 relaciones con ratios | capital↔trabajo es el eje (0.5) |
| Asesores | 7 | 2 máximo simultáneos, desbloqueos por popularidad |
| Habilidades | 8 activas + 12 pasivas | cooldowns 3–6, costos en acciones/presupuesto/popularidad |
| Estrategias midterm | 4 | multiplicadores ×0.85 a ×1.50 |
| Calendario | 8 hitos | 2 elecciones, campañas, informe de gestión |
| Derrotas | 6 | cada una con consejo contextual |

**Calidad temática: alta.** El contenido es genuinamente argentino y los trade-offs son reales: ninguna política económica es neutral (gastar en lo social castiga a la clase alta; ajustar castiga a los sindicatos). La curva de riesgo está bien resuelta (severidades, pesos, estado del juego que aprieta).

**Debilidades de contenido:** duplicación 61-vs-61 entre `actionCategories.ts` y `actionRegistry.ts` (ya con inconsistencias: `minBudget` de educación diverge); 10 de 18 grupos sin antagonismos (los "grupos puros"); `reforma_impositiva` posiblemente inalcanzable (admite el propio código); un dato de asesor referencia un grupo "medios" que no existe; Educación/Turismo/Tecnología son stubs de una acción heredada.

---

## 7. UI y experiencia

### 7.1 Flujo de pantallas

`App.tsx` orquesta sin router, por renderizado condicional con banderas de estado:

```
WelcomeScreen → CharacterCreation (cargo hardcodeado 'presidente')
  → WelcomeModal → TABLERO PRINCIPAL (16 turnos)
  → [TurnSummaryModal | EventModal (cola) | MidtermStrategyModal]
  → ReelectionChoiceModal → ElectionResultsModal
  → GameOverModal + LegacyScreen (rating /10, ejes, narrativa) → restart
```

### 7.2 Anatomía del tablero

- **GameHeader** (sticky): logo "GOBERN**ARG**" (ARG en dorado), cargo/avatar, año/trimestre con barra de progreso de 16 turnos, acciones disponibles, presupuesto, popularidad con tendencia, estabilidad, CTA "Finalizar Turno".
- **IndicatorsPanel:** 6 tarjetas (Popularidad, Estabilidad, Legitimidad, Conflicto Social derivado, Intención de Voto, Presupuesto) con barra de riesgo y marcador de target; tooltips que enseñan la simulación.
- **Columna izquierda:** ControlPanel de acciones con 10 tabs por categoría (iconos webp propios), banner de apoyo legislativo, badges REC/BLQ/BON en cada ActionCard; SpecialAbilitiesPanel; PendingEffectsPanel e InformesPanel (efectos cortos/largos con milestones); NotificationCenter.
- **RightSidebar (520 líneas):** Situación Electoral (top 3 a favor/en contra), Calendario Político, Noticias, Grupos de Interés (acordeón con mood y 3 botones de interacción), ActiveBenefits, AdvisorPanel.
- **12 modales/overlays** hand-rolled con el mismo patrón `fixed inset-0 z-50`, sin componente Modal base.

### 7.3 Diseño visual

Dark UI cohesiva: fondo azul pizarra 8%, cards 12%, foreground 92%, **acento dorado/ámbar 42/70/50** que materializa la "G dorada" del favicon en CTA, logo y victorias. Tipografía institucional: Barlow Condensed (títulos en mayúsculas, tracking amplio) + Inter + JetBrains Mono para valores. Paleta semántica consistente (verde/rojo/ámbar/celeste). **~90 assets webp propios** generados (fondos de Casa Rosada/Congreso, 16 avatares, 19 retratos de asesores, 18 ilustraciones de eventos, iconos de categorías/grupos/arquetipos) con patrón "hero" de imagen de cabecera en modales. Nivel de acabado alto para un proyecto indie.

### 7.4 Problemas de UI/UX detectados

1. **Bug real: GameOverModal y LegacyScreen se montan juntos** (ambos `z-50`); LegacyScreen queda arriba y **no tiene botón de cierre** → en derrota, el jugador no llega a leer su causa de derrota ni el consejo.
2. **Props drilling severo**: `gameState` completo atraviesa ~10 niveles; App.tsx concentra 15 handlers. Falta un store (Zustand/Context).
3. **RightSidebar es god-component** (520 líneas, 4 secciones + helpers inline).
4. **Duplicación de subsistemas**: dos tooltips (Radix accesible vs. custom CSS), dos catálogos de imágenes, dos sistemas de notificación (sonner casi sin uso vs. NotificationCenter), dos vistas del historial, y los efectos pendientes se muestran desde 4 ángulos distintos.
5. **Motion infrautilizado** (1 componente animado de 27) pese a estar instalado; los modales entran y salen sin transición.
6. Restos de tema claro sueltos (AxisBar, AdvisorSelectionModal, ErrorBoundary).
7. Tendencias `null` hardcodeadas en 4 indicadores (chips que siempre muestran "—").
8. Lógica de dominio derivada en componentes (conflicto social, performance, cálculos electorales).
9. `position` hardcodeado a 'presidente' en creación de personaje (código muerto de otros cargos en UI).

---

## 8. Calidad: tests y auditoría

### 8.1 La auditoría del 19-08 (punto de inflexión)

Auditoría del 100% del código por **6 revisores + 5 verificadores independientes**, con demos empíricas: **119 hallazgos (4 críticos, 26 altos, 50 medios, 39 bajos)**. Los 4 críticos:

1. **Bug sistémico de aritmética de turnos cíclicos** — rompía 6 mecánicas: deadlines de demandas que nunca vencían (88,9% de los casos), concesión que pausaba demandas para siempre, negociaciones perdidas (37,5%), cooldown de eventos que bloqueaba el resto del mandato, exploit de +10% de ingresos eterno, bono de reunión latente.
2. **Victoria imposible** — los objetivos leían `interestGroups[].support` con ids de subgrupos entre grupos padre; el `find` siempre fallaba.
3. **17 efectos de eventos ignorados en silencio** — `applyEventEffect` solo manejaba 4 targets; los de ids planos se descartaban sin error.
4. **Toolchain roto** — eslint no funcionaba, `tsc -b` fallaba, doble Vite instalado.

**La lección central del informe:** *los 96 tests de entonces pasaban con todo eso roto*. Regla que se impuso después: todo fix va con su test de regresión.

### 8.2 Estado verificado hoy

| Verificación | Resultado |
|---|---|
| `vitest run` | ✅ **183/183 tests pasan** (16 archivos, 3.4 s) |
| `tsc -b` | ✅ 0 errores |
| `eslint .` | ❌ 14 errores documentados (6 `any`, 5 unused, 1 rules-of-hooks, 2 prefer-const) |
| Build | ✅ OK |

> Nota de entorno: el `node_modules` tiene binarios Linux-only; se verificó vía WSL sin tocar el proyecto.

### 8.3 Qué cubre la suite

Tests **puramente unitarios sobre el engine**, con buenas prácticas (factories, `Math.random` mockeado, identidad por referencia para no-ops, boundaries exactos, tests de inmutabilidad). Los 16 archivos protegen: aritmética de turnos globales (los tests de regresión de los bugs críticos), límites de eventos y demandas, antagonismos con ratios exactos, victoria/derrota con boundaries por cargo, sistema electoral con penalizaciones de ascenso, costos de interacción, cooldowns, efectos de acción con rendimientos decrecientes, pasivas de arquetipo, condiciones de eventos por turno global.

Los 15 tests nuevos propuestos por la propia auditoría fueron **efectivamente implementados** (el plan no fue humo), y los tests tautológicos/frágiles señalados fueron reescritos.

### 8.4 Brechas

- **0% cobertura de UI/React** (sin Testing Library ni jsdom).
- **Sin tests de integración**: ninguna partida completa de 16 turnos recorrida de punta a punta; `electionEngine.recordElectionOutcome` (la función más riesgosa según la auditoría) no tiene test de recorrido.
- Sin coverage report, sin CI, ~19 tests son snapshots de constantes de balance (frágiles ante rebalances legítimos).
- Fixture `{} as GameState` persistente; aleatoriedad residual sin mockear en generación de agendas.

---

## 9. Estado actual (v4.4) y backlog

### Cumplimiento de planes

| Plan | Estado |
|---|---|
| Optimización por fases 1–4 (19/20-ago) | ✅ 100% (restan 14 lints y 2 modificadores sin cablear) |
| Rediseño integral (junio) | ~85% (lo omitido son decisiones de balance deliberadas) |
| Roadmap fases 1–5 | ✅ hechas · **Fase 6 (pulido final) sin empezar** |
| Plan de implementación motor↔UI | ✅ los 4 sprints hechos; dificultad/Ironman sigue parcial |

### Backlog priorizado (síntesis de los documentos)

**P0 — deuda declarada:** sincronizar documentación que contradice el código (INVENTORY.md dice 59 imágenes; hay ~85 · image-needs.md lista como faltantes piezas ya integradas · inventario de eventos congelado en 12); cablear o eliminar `baseActionsModifier`/`ironman`; los 14 lints.

**P1 — contenido:** 10 eventos restantes de la propuesta (crisis de gabinete, burbuja financiera, pandemia, traición de aliados, etc.) + 2 eventos scheduled (Cumbre de gobernadores A3T3, Debate presidencial A4T1). Es el ítem de **máximo valor de rejugabilidad por hora**.

**P2 — assets:** Grupo E (10 piezas UI: banners victoria/derrota, sellos, insignias de mandato, medallas) — desbloquea victoria/derrota emotiva y logros; Grupos F y G parciales.

**P3 — features:** `scheduledEvents` está vacío → **ManagementNotebook siempre vacío** (bug documentado, no resuelto); legitimidad como recurso (principio #6) sin implementar; lealtad de asesores; logros desbloqueables.

**P4 — pulido final (Fase 6):** sonidos/música, tutorial interactivo, responsive, pantallas emotivas, **playtesting manual de balance** (bloqueante natural para considerar el juego "terminado"; la suite no valida diversión).

**P5 — alcance mayor:** modo campaña (Intendente→Gobernador→Presidente), árbol de desbloqueo completo, matriz de antagonismos generalizada.

### Riesgos transversales

1. **Docs desactualizados que inducen a error** — el riesgo más barato de resolver y el de mayor retorno: un futuro agente que lea los `.txt` viejos implementará balance pre-auditoría (fórmula de popularidad 60/40 vieja, costos de interacción viejos, bonus eliminados).
2. **Store description promete features inexistentes** (creación de arquetipo propio, gabinete de 3 consejeros, microtransacciones, multijugador, logros).
3. **Dificultad declarada "easy" sin inflación real** — `emitir_dinero` quedó en +3 pop (no −3 como pedía el plan de rediseño): decisión de balance pendiente y explícita.
4. **Sin backup remoto** (no hay push a origin desde agosto; el riesgo #5 del propio plan sigue abierto).
5. **Falta de validación humana**: 183 tests cubren mecánicas, no diversión ni dificultad percibida.

---

## 10. Conclusión: qué aprendí

**Sobre el juego:** GobernArg es un simulador político con diseño real — no un tech demo. Tiene tesis de diseño (los 10 principios), trade-offs genuinos (capital vs. trabajo como conflicto central, imposibilidad matemática de maximizar todo), memoria de decisiones (efectos diferidos, rendimientos decrecientes, encadenamientos) y una identidad visual argentina construida a pulso (66+ assets propios, vocabulario político auténtico). El MVP actual es un mandato presidencial completo y cerrado, jugable de punta a punta.

**Sobre el proceso:** este proyecto es un caso de estudio de cómo un desarrollo solitario con agentes de IA madura: junio fue velocidad con deuda, agosto fue disciplina — refactor previo, tests con regresión, auditoría con verificación cruzada (6 revisores + 5 verificadores), plan por fases ejecutado de punta a punta, y documentación que acompaña cada decisión. La auditoría encontró lo que los tests no veían (los 96 tests pasaban con victoria imposible), y eso cambió el estándar: hoy cada fix crítico tiene su test.

**Sobre el estado:** v4.4 está en su mejor momento documentado — planes históricos ~90% cumplidos, deuda crítica cero, 183 tests verdes. Lo que falta no es supervivencia del proyecto sino **contenido (10 eventos), pulido (Fase 6) y sincronización documental**, y después de eso, la pregunta grande: validar con humanos si el juego es divertido y ni muy fácil ni muy duro.

**Los tres hallazgos que más pesan si seguís trabajando acá:**
1. El bug UX de GameOver/Legacy (el jugador derrotado no ve su causa de derrota) — fix de una línea, impacto grande.
2. La documentación desincronizada es una trampa para futuros agentes — sincronizar los `.txt` viejos o marcarlos como históricos.
3. La duplicación de fuentes de verdad (acciones, umbrales, tipos de eventos, agregaciones de grupos) es el tipo de deuda que produjo el bug sistémico de turnos: conviene unificar antes de agregar features nuevas.

---

*Documento integrado por el orquestador a partir de 7 reportes especializados completos (disponibles en `_analisis_gobernarg/`), el historial git completo (60 commits) y los documentos de diseño originales (27 archivos + 2 PDFs).*
