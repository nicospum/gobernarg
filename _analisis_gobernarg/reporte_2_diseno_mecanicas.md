# Reporte 2 — Diseño y Mecánicas de GobernArg
## Reconstrucción integral del diseño documentado

> Fuente: docs en `project/src/docs/` (14 archivos + 10 en `details/`), `Instrucciones.txt`, `equipo.txt`, `changes_log.txt`, y los PDFs extraídos a `_analisis_gobernarg/`.
> **Canon actual:** `mecanicas-del-juego.md` y `session-summary.md` (20/08/2026). El resto es histórico/evolutivo.

---

## 1. Visión del juego (concepto y fantasy)

**GobernArg** es un juego de estrategia y simulación política argentina. El jugador encarna un dirigente político —intendente, gobernador o presidente— que debe administrar recursos, construir poder político y sobrevivir a las presiones de los sectores sociales, económicos y políticos.

- **Fantasy:** ser el político argentino que negocia con sindicatos, empresarios, la oposición y la prensa; ceder cuando conviene, resistir cuando hace falta, y pensar las consecuencias a varios turnos.
- **Filosofía de diseño** (`future-engine-features.md`, 10 principios que deben *emerger* de las mecánicas, no explicarse):
  1. *El camino no es recto, es sinuoso* — efectos contextuales y diferidos; no hay acción "siempre correcta".
  2. *Toda decisión tiene costo* — costos multidimensionales (presupuesto, popularidad, grupos, estabilidad, legitimidad); nada solo suma.
  3. *La dosis hace al veneno* — rendimientos decrecientes por repetición; acciones "doradas" que se vuelven tóxicas.
  4. *No se puede maximizar todo* — ejes contradictorios; gobernar es elegir qué sacrificar.
  5. *La estabilidad vale más que la épica* — bonus por estabilidad sostenida, penalización por volatilidad; victorias "aburridas" posibles.
  6. *La legitimidad es un recurso* — medidas impopulares requieren legitimidad.
  7. *El poder se gasta* — capital político que se reconstruye lento.
  8. *Cambiar las reglas también es política* — reformas institucionales como acciones especiales de alto riesgo.
  9. *La política es contextual, no binaria* — el perfil ideológico emerge de las decisiones, no de una elección explícita de bando.
  10. *Gobernar desde la fuerza exige abrirse* — tras ganar fuerte, la opción más rentable es convocar, no radicalizar.
- **Mensaje central de los PDFs:** "El camino no es recto, sino sinuoso" — liderar requiere adaptabilidad, equilibrio de intereses y decisiones difíciles. Múltiples formas de ganar (equilibrio, estabilidad, reelección/ascenso) y de perder (crisis insostenibles, pérdida de popularidad, destitución).

**Estado real (session-summary, 20/08/2026):** MVP funcional centrado **solo en el cargo de PRESIDENTE**. Intendente y gobernador existen en datos y textos narrativos (`careerRules.ts`) pero no tienen flujo de juego. 183 tests pasando.

---

## 2. Loop core de juego

```
SELECCIÓN (arquetipo + dificultad, cargo = presidente)
  → POR TURNO (trimestre): ejecutar N acciones políticas + interacciones con grupos
    + responder eventos/demandas
  → FIN DE TURNO: ingresos − mantenimiento − desgaste natural de popularidad
    + vencimiento de cooldowns/demandas/efectos diferidos + eventos (calendario/aleatorios)
  → HITO AÑO 2/T4: ELECCIONES DE MEDIO TÉRMINO (define apoyo legislativo 28–58%)
  → HITO AÑO 3/T1: ELECCIÓN DE ESTRATEGIA POST-LEGISLATIVA
  → HITO AÑO 4/T4: ELECCIONES GENERALES (≥45% = victoria; no hay ballotage)
  → EPÍLOGO: pantalla de legado
```

- Un mandato = 4 años × 4 turnos = **16 turnos**.
- La intención de voto es **invisible para el jugador** (solo visible en Modo Admin); el feedback es indirecto hasta el resultado electoral.

---

## 3. Sistemas de juego (estado actual / canon)

### 3.1 Métricas principales

**Popularidad (0–100)**
- Fórmula **actual**: `40% × promedio relaciones con grupos + 60% × popularidad política` (acciones/eventos).
- **Desgaste natural por turno:** intendente −5, gobernador −7, presidente −10. El 40% grupal actúa como piso: un presidente inactivo se estabiliza ~35%.
- Inicial: 50 todos; Comunicador arranca en 70.

**Presupuesto (millones, puede ser negativo)**
- Inicial por cargo: 800 / 2.000 / 3.500.
- Ingreso bruto − mantenimiento por turno: Intendente 200−120 = **+80**; Gobernador 350−200 = **+150**; Presidente 500−350 = **+150**.
- **Préstamos:** máximo 3 (Empresario: 4); cada uno reduce ingresos en 10% (servicio de deuda).
- **Emisión monetaria:** 7 emisiones = hiperinflación = derrota instantánea.

**Estabilidad (0–100)**
- No se desgasta sola: solo cambia por acciones, elecciones, estrategia post-legislativa y eventos.
- Si <20 **y** popularidad <10% → tracking de impeachment (2 turnos = derrota).
- Si <10 **y** apoyo legislativo <25% → tracking de golpe institucional (3 turnos = derrota).

**Legitimidad (0–100)**
- Sube con cultura y diplomacia (+3); baja con decretos forzosos (−8) y acciones impopulares.
- En 0 → todas las acciones cuestan el doble de puntos de acción.

**Intención de voto (0–100)** — 6 factores:
| Factor | Peso |
|---|---|
| Popularidad (promedio últimos 4 turnos) | 35% |
| Presupuesto (crecimiento económico) | 15% |
| Apoyo de grupos | 15% |
| Objetivos cumplidos | 15% |
| Estabilidad | 5% |
| Actividad (acciones tomadas / 16 turnos esperados; penaliza inacción) | 15% |

Umbral de victoria: **45%**, sin segunda vuelta.

### 3.2 Elecciones

- **Medio término (Año 2, T4):** solo legislativas. Definen apoyo en Congreso (28–58%). No cuestan presupuesto. Ganar por palizada: +10 estabilidad; perder: −15. El resultado afecta costo de reformas y probabilidad de eventos de oposición.
- **Generales (Año 4, T4):** a todo o nada. Ajustes: reelección +5; ascenso a gobernador −15; ascenso a presidente −40. Penalización **multiplicativa por "chapa"** (mandatos completados en el cargo actual): hasta −30% para un intendente sin experiencia que aspira a presidente; menos penalización cuantos más mandatos acumuló.
- Modelo legislativo detallado (`future-engine-features.md` §8): >45% victoria contundente (reformas −1 acción, +10 estabilidad, riesgo de sobreconfianza); 42–45% cómoda; 38–41% quorum justo; 35–37% sin quorum (reformas +1 acción); <35% congreso hostil (reformas +2 o bloqueadas, crisis frecuentes).

### 3.3 Estrategia post-legislativa (Año 3, T1, forzosa)

| Estrategia | Efectividad | Estabilidad | Popularidad | Disponible si |
|---|---|---|---|---|
| Acelerar | ×1.25 | −3/turno | −2/turno | Apoyo legislativo > 42% |
| Negociar | ×0.85 | +3/turno | 0 | Siempre |
| Abrirse | ×1.15 | +5/turno | +1/turno | 3+ grupos con apoyo > 50% |
| Jugada Audaz | ×1.50 | −5/turno | −3/turno | Comunicador/Político o pop > 65% |

*Jugada Audaz* dura exactamente 2 turnos y luego revierte forzosamente a Negociar.

### 3.4 Los 18 subgrupos de interés (5 familias)

Sectores Económicos (Empresarios ⭐8, Agrícola ⭐7, Financiero ⭐9, Sindicatos ⭐8); Grupos Sociales (Clase Media ⭐7, Sectores Populares ⭐6, Clase Alta ⭐8, Minorías Étnicas ⭐5, ONGs ⭐6); Movimientos Sociales (Ambientalistas ⭐6, Feministas ⭐7, Estudiantiles ⭐5, Cooperativas ⭐5); Partidos (Aliados ⭐8, Opositores ⭐7); Colectivos (Artistas ⭐5, Deportistas ⭐6, Académicos ⭐7).

Cada subgrupo: influencia (1–10, escala costos e impacto electoral), apoyo base (20–70%), intereses (keywords), **mood** (contento → neutral → disconforme → enojado → radicalizado).

**Interacciones (costo = base × influencia):**
| Tipo | Apoyo | Costo | Efecto |
|---|---|---|---|
| Reunión | +5 | $10 × infl. | Grupo tranquilo 2 turnos sin demandas |
| Negociar | +10 | $25 × infl. | El grupo presentará una demanda en 1–2 turnos (plazo 4 turnos) |
| Conceder | +15 | $50 × infl. | Grupo satisfecho 4 turnos; **límite 4 por mandato**; requiere ≥1 reunión/negociación previa en el mandato; **costo cruzado** al resto de los grupos (`max(2, influencia × 0.5)`) |

**Demandas:** eventos raros — probabilidad base **8%/turno** (hasta 25% con modificadores), **máx 2 activas**. Plazo 4 turnos; incumplir = pérdida de apoyo proporcional a la influencia. Cumplir (botón verde): consume 1 acción, +5 apoyo, +1 popularidad, impacto cruzado sobre antagonistas. Si ya ejecutaste la acción pedida dentro del plazo → auto-cumplida con **+10 apoyo**.

**Antagonismos (impacto cruzado):** cuando un grupo gana apoyo, sus rivales pierden automáticamente (ej. empresarios +10 ⇒ sindicatos −5). Matriz documentada: Empresarios/Financiero vs Sindicatos (−50% de lo ganado) y Sectores Populares (−30%); Sindicatos/Populares vs Empresarios (−50%) y Clase Alta (−40%); Ambientalistas vs Agrícola (−40%) y Financiero (−20%); Feministas vs Iglesia/Sectores Conservadores (−30%); Aliados vs Opositores (−60%); Académicos/Científicos = neutrales.

### 3.5 Acciones políticas

- **61 acciones en 9 categorías** registradas en `actionRegistry.ts` (las 6 originales: Economía, Social, Infraestructura, Diplomacia, Seguridad, Cultura; se sumaron Educación, Turismo, Tecnología — la lista de requisitos por cargo en `phase-1-plan.md` las menciona).
- Cada acción: presupuesto + puntos de acción + efectos inmediatos (popularidad, presupuesto, estabilidad, legitimidad) + efectos en grupos por intereses.
- **Rendimientos decrecientes:** efectividad ×0.80 por uso repetido.
- **Efectos diferidos:** estudio de factibilidad (reduce costos de infraestructura), mejorar recaudación (+$50M × 3 turnos), fomento al emprendimiento (+$30M × 3 turnos, madura más lento), infraestructura grande (≥$200M) genera mantenimiento del 15% en 2–4 turnos. Visibles en panel "Beneficios activos".
- Rangos de costo documentados: bajo 100–200 / medio 200–400 / alto 400–800 / muy alto >800; impacto en popularidad 5–10 / 10–15 / 15–20 / >20.
- Regla de cargo: `availableForPositions` filtra qué acciones ve cada cargo (intendente sin préstamo internacional, emisión monetaria ni tratados; gobernador sin emisión ni préstamos internacionales; presidente con todo).
- Árbol de desbloqueo diseñado (§5.2 de difficulty-analysis): reforma impositiva requiere mejorar_recaudación + apoyo legislativo ≥45; infraestructura_vial requiere estudio de factibilidad; reforma constitucional requiere legislativo ≥65 + legitimidad ≥70; etc.

### 3.6 Eventos

- **18 eventos activos con imagen propia** (6 económicos + 6 políticos + 6 sociales).
- Limitador global: cooldown de **3 turnos** entre eventos aleatorios; máximo **5 eventos aleatorios por mandato**; eventos contextuales (`triggered`) y de calendario sin límite.
- Probabilidades dinámicas según estado (popularidad/presupuesto/estabilidad bajos aumentan probabilidad de crisis).
- Diseño histórico prevé eventos por magnitud (local/regional/nacional/internacional) y por tipo (sociales, económicos, políticos, naturales, internacionales) — los naturales/internacionales aún no están en el banco activo.
- Calendario político: apertura de sesiones (A1T2), informe de gestión (A1T4), campaña legislativa (A2T2), medio término (A2T4), definición de estrategia (A3T1), campaña presidencial (A4T2), generales (A4T4).

### 3.7 Los 4 arquetipos (2 habilidades activas + 2 pasivas cada uno)

**Político de Raza** — activas: Discurso Patriótico (+12 pop, +5 est, +8 leg, CD 4); Pacto de Gobernabilidad (+10 est, +5 leg, aliados +5, opositores +5, CD 5). Pasivas: +10% retención de voto en reelección; reuniones con aliados gratis. Fuerte en Diplomacia ×1.2.

**Empresario** — activas: Inversión Privada (+$400M, −3 pop, CD 5); Llamado a Inversores (+$500M, −5 leg, empresarios +8, financiero +5, CD 6). Pasivas: economía genera +20% presupuesto; 1 préstamo extra (máx 4). Fuerte Economía ×1.3, resto ×0.9.

**Sindicalista** — activas: Movilización Social (+8 pop, −5 est, +5 leg, CD 4); Paro Controlado (+5 pop, −8 est, sindicatos +15, populares +15, empresarios −10, CD 5). Pasivas: reuniones con sindicatos/sectores populares gratis; +1 acción base. Fuerte Social ×1.3, resto ×0.9.

**Comunicador** — activas: Campaña Mediática (+10 pop, CD 3); Gira de Medios (+15 pop, clase media +4, aliados +3, CD 6). Pasivas: eventos negativos −30% impacto; todas las acciones ×1.1. Empieza con 70% de popularidad (los demás 50).

*Balance anterior (viejo):* Político +2 acciones; Empresario +1 acción y capital inicial 2000M; Sindicalista +1 acción; Comunicador 5 acciones base y mejor manejo de crisis.

### 3.8 Ejes de liderazgo (3 ejes continuos, −100 a +100)

- **Radical ↔ Conciliador:** seguridad −3 hacia radical; diplomacia y cultura +2 hacia conciliador. Extremo radical: seguridad más efectiva, diplomacia sufre. Extremo conciliador: cultura/diplomacia cuestan menos acciones.
- **Populista ↔ Técnico:** social/cultura → populista; economía/tecnología → técnico. Extremo populista: social más efectivo y barato. Extremo técnico: economía más potente, social menos efectivo.
- **Cerrado ↔ Convocante:** seguridad/economía → cerrado; diplomacia/cultura/educación → convocante. Extremo cerrado: +5 estabilidad pero −10 a todos los grupos. Extremo convocante: +10 relación con todos pero −5 estabilidad.

Notificaciones al cruzar ±80. El perfil se muestra en el panel de indicadores y en la pantalla de legado.

### 3.9 Asesores

- **Máximo 2 simultáneos** (diseño viejo mencionaba "1~3"); contratación/despido consume 1 acción.
- Especialidades documentadas: Economista (+2 acciones, infl. 8, $300M, −5% pop), Comunicador Social (+1, infl. 9, $250M, +10% pop), Experto en Infraestructura (+2, infl. 7, $400M, +5% pop), Especialista Social (+1, infl. 8, $200M, +15% pop).
- Efectos: bonus de acciones, modificador de popularidad, efectos especiales por especialidad (economista: +20% rendimiento económico; comunicador: −30% probabilidad de crisis), activación/desactivación con turnos de inactividad. Sin mantenimiento mensual.
- Pendiente de diseño: sistema de lealtad, desarrollo de asesores, retratos/historias.

### 3.10 Sistema de dificultad

- Tres niveles (Fácil / Normal / Difícil) que consumen en runtime: `popularityDecayMultiplier`, `crisisProbabilityMultiplier`, `incomeMultiplier`, `loansAvailable`.
- **Pendiente documentado pero NO consumido:** `baseActionsModifier` e `ironman` (un solo slot, sin guardar).
- Diseño "Leyenda": Nivel 3 completo + Ironman.

### 3.11 Condiciones de victoria / derrota

**6 vías de derrota:**
1. Popularidad baja: 2 turnos consecutivos bajo el umbral del cargo (20/25/30).
2. Colapso fiscal: 2 turnos consecutivos con presupuesto negativo.
3. Impeachment: pop <10% Y estabilidad <20, 2 turnos.
4. Golpe institucional: estabilidad <10 Y apoyo legislativo <25%, 3 turnos.
5. Hiperinflación: 7+ emisiones.
6. Derrota electoral: <45% de votos.

**Victoria:** ganar la elección general (≥45%). Objetivos de mandato usan `groupRelations` por subgrupo; al completar MAX_TERMS como presidente (según `careerRules.ts`, presidente = 2 mandatos), game over con evaluación de victoria → **pantalla de legado** con razón de derrota específica, perfil ideológico y texto narrativo (`careerLog.ts`).

### 3.12 Carrera política (diseñada, parcialmente implementada)

- Ladder Intendente → Gobernador → Presidente, con reglas en `careerRules.ts`: `PROMOTION_DIFFICULTY` (reelección +5; ascenso a gobernador −15; a presidente −40) y penalización multiplicativa por ascenso según mandatos completados (tabla §5.7 de difficulty-analysis: intendente→presidente −40%/−30%/−20%/−12% según reelecciones).
- **MAX_TERMS:** intendente 4, gobernador 2, presidente 2 (actualizado en phase-1-plan).
- **Modo campaña (ascenso de cargo) está pendiente** — roadmap Fase 5: la partida actual es presidente directo.

---

## 4. Evolución del diseño (viejo → nuevo)

El diseño pasó por una **auditoría de dificultad (22/06/2026, `difficulty-analysis.md`)** que diagnosticó el juego como "muy fácil" y propuso 4 fases de endurecimiento (A: ajustes numéricos; B: memoria de decisiones; C: calendario político; D: sistemas transformacionales). `session-summary.md` (20/08/2026) confirma que Fases 1–5 del roadmap están implementadas. Cambios canónicos:

| Aspecto | Diseño viejo (docs .txt / PDFs / equipo.txt) | Diseño actual (mecanicas-del-juego.md / session-summary) |
|---|---|---|
| Fórmula popularidad | Grupos 60% + Política 40% | **Grupos 40% + Política 60%** |
| Desgaste natural | −3 fijo por turno | **−5 / −7 / −10 por cargo** |
| Umbral derrota por popularidad | <15% × 3 turnos | **20/25/30% × 2 turnos por cargo** |
| Umbral derrota fiscal | negativo × 3 turnos | **× 2 turnos** |
| Acciones base | 5 (Político +2; Empresario/Sindicalista +1) | **3/2/1 por cargo; Político +1** |
| Bonus por popularidad baja | +2 acciones si <25% | **Eliminado** (premiaba estar mal) |
| Costos interacción | Reunión $0, Negociar $100M, Conceder $200M | **$10/$25/$50 × influencia** |
| Fórmula intención de voto | Pop 35% + Grupos 25% + Objetivos 15% + Estab. 5% (otro doc: Estab 25% + Presup 20% + Grupos 20%) | **6 factores: 35/15/15/15/5/15 + factor actividad** |
| Ingreso neto por turno | +150 / +225 / +300 | **+80 / +150 / +150** (ingreso bruto: 200/300→350/500) |
| Presupuesto inicial | 1000M (Empresario 2000M) | **Por cargo: 800 / 2000 / 3500** |
| Emisión monetaria | Sin consecuencias reales (solo advertencia a los 3 usos) | **7 emisiones = hiperinflación = derrota** |
| Préstamos | Sin límite ni costo | **Máx 3 (4 empresario), −10% ingresos c/u** |
| Repetición de acciones | Sin penalización (spammear "doradas") | **×0.80 de efectividad por uso** |
| Elecciones | Solo generales (turno 16) | **+ Medio término (A2T4) + estrategia post-legislativa (A3T1)** |
| Reelecciones intendente | "Indefinida según leyes locales" (PDF) | **Máx 4 (5 mandatos)** |
| Elección de cargo | El jugador elegía 1 de 3 cargos | **MVP solo presidente**; modo campaña pendiente |
| Acciones | ~60 en 6 categorías | **61 en 9 categorías**, filtradas por cargo, con prerrequisitos diseñados |
| Grupos | 18 subgrupos pasivos | **18 subgrupos con mood, agendas, demandas raras, antagonismos cruzados** |
| Legitimidad / ejes | No existían | **Recursos y sistemas nuevos implementados** |

## 5. Contradicciones detectadas entre documentos

1. **Mandatos presidenciales:** el PDF dice "máximo dos mandatos de 4 años" (1 reelección); `difficulty-analysis.md` §5.6 dice "Presidente: 2 reelecciones (3 mandatos) → FIN DEL JUEGO" y lo marca como contradicción a verificar. `careerRules.ts`/`phase-1-plan.md` fijan **presidente = 2 mandatos** — el PDF y el código coinciden; la nota del diseñador quedó desactualizada.
2. **Reelección de intendente:** PDF original "reelección indefinida"; diseño posterior "4 reelecciones"; código actual MAX_TERMS intendente = **4** (que según el comentario significa probablemente "4 mandatos", no 4 reelecciones → 5 mandatos). Ambigüedad mandato-vs-reelección no resuelta en los docs.
3. **Fórmula de popularidad:** `game_mechanics.txt`, `popularidad.txt` y `equipo.txt` (todos .txt raíz de una generación anterior) dicen 60/40 a favor de grupos; `mecanicas-del-juego.md` (canon) dice **40/60**. Los .txt no fueron actualizados.
4. **Fórmula de intención de voto:** tres versiones coexisten (intencion_voto.txt y elecciones.txt: 35/25/15/5; game_mechanics.txt: 35/25/20/20; canon: 35/15/15/15/5/15). Además los pesos viejos de intencion_voto.txt suman 80%, no 100%.
5. **Costos de interacción:** `grupos_interes.txt` (Reunión $0 / Negociar $100M / Conceder $200M) contradice al canon (10/25/50 × influencia) y a `phase-1-plan.md` (reunión pasa de 0 a 10). El doc viejo no fue actualizado tras el balanceo.
6. **Asesores:** `difficulty-analysis.md` menciona "+1~3 asesores" y combos hasta ×1.56; los docs de asesores y el código fijan **máximo 2**.
7. **Ingreso de gobernador:** `presupuesto.txt` dice +300M bruto; el canon dice **+350M** (neto idéntico +150 tras cambiar mantenimiento a 200).
8. **Categorías de acciones:** docs viejos y la descripción de Store hablan de "6 áreas de gobierno"; el código registra **9 categorías**. La Store description está desactualizada frente al juego.
9. **Arquetipo Empresario:** diseño viejo "capital inicial mayor (2000M)"; el canon eliminó el bonus de capital inicial por uno de "+20% presupuesto en economía + préstamo extra". El presupuesto inicial ahora depende del cargo, no del arquetipo.
10. **Efectividad de acciones por cargo:** el PDF decía "intendente: las acciones de cercanía se pueden repetir sin perder efectividad"; el canon aplicó rendimientos decrecientes **globales** (×0.80) — la diferenciación por cargo quedó solo en costos/acciones disponibles, no en reglas de repetición.
11. **Bonus popularidad baja:** aún figura en `popularidad.txt` (>75% +1 acción, <25% +2 acciones) pero fue eliminado en el rebalanceo (phase-1-plan cambio 1.3).
12. **Riesgo de crisis por gasto >500:** `acciones_politicas_version_detallada.txt` define 30% de crisis económica si `budgetChange < −500`; el canon reemplazó esto por **mantenimiento diferido del 15%** en 2–4 turnos. El doc técnico viejo no refleja la mecánica actual.
13. **Eventos naturales e internacionales:** diseñados en el PDF y en future-engine-features pero **ausentes del banco activo** (18 eventos = económicos/políticos/sociales solamente).

## 6. Riesgos de diseño detectados

1. **Dificultad "pico y valle":** la auditoría de junio lo calificó de "muy fácil" y todo el rediseño apuntó a endurecer; no hay análisis posterior que valide si el endurecimiento (desgaste −10, 1 acción base de presidente, umbrales ×2) no fue demasiado lejos en el otro sentido. La Fase 6 del roadmap ("testing manual y ajustes finales de balance") sigue sin empezar.
2. **Factor actividad ambiguo:** 15% de la intención de voto mide "acciones tomadas sobre las esperadas (16 turnos)" — confuso: ¿acciones por turno esperadas? ¿16 turnos totales? Un jugador eficiente con pocas acciones bien elegidas quedaría penalizado igual que uno inactivo.
3. **Invisibilidad de la intención de voto:** sin Modo Admin el jugador vuela a ciegas hasta la elección; combinado con el umbral duro de 45% y sin ballotage, la derrota puede sentirse arbitraria ("jugaste bien pero perdés igual").
4. **Paradoja del desgaste vs. piso grupal:** presidente inactivo se estabiliza en ~35% de popularidad por el piso del 40% grupal — lo que podría permitir estrategias de "no hacer nada" para llegar a las elecciones si los grupos arrancan contentos. El factor actividad (15%) es la única defensa documentada.
5. **Contradicción mandatos/reelecciones sin resolver** (sección 5, punto 2): el texto del diseñador y el código difieren en la semántica de MAX_TERMS; riesgo de implementar "fin del juego" un mandato antes/después de lo pensado.
6. **Docs de diseño desincronizados:** los .txt raíz (`game_mechanics.txt`, `popularidad.txt`, `presupuesto.txt`, `intencion_voto.txt`, `grupos_interes.txt`) contienen el balance PRE-auditoría y conviven con el canon .md. Cualquier agente/LLM que lea los .txt primero implementará valores viejos.
7. **Store description desactualizada:** promete "6 áreas de gobierno", creación de arquetipo propio, gabinete de 3 consejeros iniciales, microtransacciones con personajes históricos, logros y modo multijugador — ninguno de esos sistemas existe en el MVP actual.
8. **Sistemas diseñados pero no consumidos:** `baseActionsModifier` e `ironman` de dificultad documentados sin uso en runtime; acciones con `availableForPositions` diseñadas pero el juego solo se juega como presidente (su efecto real es nulo hoy).
9. **Cooldowns de habilidades vs. rendimientos decrecientes:** no queda claro en los docs si las 8 habilidades activas de arquetipo sufren el ×0.80 por uso o si solo afecta a acciones normales — punto de balance sin especificar.
10. **Asesores sin mantenimiento ni lealtad:** con 2 asesores permanentes que dan +1~3 acciones y bonos, la decisión de contratar es casi siempre correcta (compra única, beneficio perpetuo). El diseño reconoce "sistema de lealtad" como pendiente.
11. **Ausencia de guardado:** equipo.txt lista "guardado/carga de partida" como pendiente; en un juego de 16 turnos con decisiones irreversibles, perder la partida por cerrar el navegador es un riesgo de experiencia serio (el ironman pendiente agravaría esto).
12. **Elecciones de medio término sin costo ni campaña:** no consumen presupuesto ni acciones; el jugador solo las "recibe". El roadmap menciona "eventos de campaña/debates/encuestas" como mejoras futuras, pero hoy son pasivas.

---

*Fin del reporte. Preparado por Disenador_Juego a partir de 27 documentos fuente.*
