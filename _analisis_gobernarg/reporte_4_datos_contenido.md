# Reporte 4 — Datos y Contenido de GobernArg
**Especialista:** Contenido_Datos (catálogo y balance de la capa de datos)
**Fuente:** `project-bolt-sb1-dzgqso GobernArg 21-11/project/src/data/` (~4.050 líneas de TypeScript)
**Fecha:** 2026-09-20

---

## 1. Inventario general de contenido

| Sistema | Cantidad | Archivo(s) |
|---|---|---|
| Acciones políticas | **61** (9 categorías) | `actionRegistry.ts` + `actionCategories.ts` |
| Eventos aleatorios/crisis activos | **18** (6 base + 12 pending habilitados) | `events/*.ts` |
| Eventos de consecuencia legislativa | **6** (3 oposición + 3 sobreconfianza) | `events/legislativeConsequences.ts` |
| Pesos/modificadores de eventos | 1 matriz (5 categorías × 4 severidades × 4 arquetipos × 3 cargos × 6 estados × 3 fases) | `events/eventWeights.ts` |
| Grupos de interés | **18 subgrupos** en 5 macro-grupos | `interestGroups.ts` |
| Matriz de antagonismos | **8 relaciones** con ratios | `groupAntagonists.ts` |
| Asesores | **7** | `advisors.ts` |
| Habilidades especiales activas | **8** (2 por arquetipo × 4 arquetipos) | `specialAbilities.ts` |
| Pasivas de arquetipo | **12** (3 por arquetipo) | `specialAbilities.ts` |
| Estrategias de medio término | **4** | `midtermStrategies.ts` |
| Calendario político | **8 hitos** (2 elecciones) | `calendar.ts` |
| Razones de derrota | **6** | `defeatReasons.ts` |
| Reglas de carrera | 3 cargos, máx. mandatos, dificultades de promoción | `careerRules.ts` |

---

## 2. Acciones políticas (61)

### 2.1 Distribución por categoría

| Categoría | Acciones | Costo típico (M) | Popularidad típica |
|---|---|---|---|
| Economía | 12 | 0–400 (préstamos dan +500/+800) | -20 a +20 |
| Social | 10 | 200–400 | +12 a +20 |
| Infraestructura | 14 | 80–700 | +2 a +20 |
| Diplomacia | 7 | 150–300 | +8 a +15 |
| Seguridad | 7 | 250–500 | +10 a +20 |
| Cultura | 8 | 200–400 | +10 a +18 |
| Educación | 1 | 100 | +10 |
| Turismo | 1 | 50 | +8 |
| Tecnología | 1 | 200 | +12 |

**Observación de diseño:** Educación, Turismo y Tecnología son categorías "stub" de 1 acción heredada (probablemente del scaffold inicial de Bolt), mientras Economía/Social/Infraestructura/Seguridad/Cultura/Diplomacia están completamente desarrolladas en `actionRegistry.ts` con grupos afectados y demandas satisfechas. Hay duplicación de datos entre `actionCategories.ts` (61 acciones, sin grupos) y `actionRegistry.ts` (61 acciones, con `affectedGroups`/`satisfiesDemand`) — fuente de riesgo de inconsistencia (ya visible: `promover_educacion` exige minBudget 100 en registry pero 200 en categories).

### 2.2 Ejemplos concretos de acciones (tabla de balance)

| Acción | Categoría | Costo (M) | Pop. | Efectos extra | Apoya | Se opone | Satisfacción de demanda |
|---|---|---|---|---|---|---|---|
| Emitir Dinero | Economía | **+150** | +3 | estab. -3, legit. -5, voto -2; cooldown 4, factor 0.65 | populares, sindicatos | empresarios, financiero, clase-alta | — |
| Préstamo Internacional | Economía | **+800** | -5 | estab. +5, legit. -8; cuota -100 a los 4 turnos; cooldown 8 | financiero | opositores, ongs | — |
| Reforma Impositiva | Economía | +400 | -10 | prereq: mejorar_recaudación + apoyo legislativo ≥45 | ongs, populares | empresarios, clase-alta | simplificación tributaria |
| Reducción del Gasto | Economía | **+300** | **-20** | — | empresarios, financiero, clase-alta | sindicatos, populares | — |
| Plan de Viviendas | Social | -400 | +20 | -50 en t3, +8 pop en t6 | populares, clase-media, sindicatos | clase-alta | acceso a vivienda |
| Control de Precios | Economía | -150 | +15 | — | populares, sindicatos, clase-media | empresarios, clase-alta | Control de inflación |
| Construcción de Hospitales | Infraestructura | -600 | +20 | prereq: estudio_factibilidad | populares, clase-media, sindicatos | — | servicios públicos |
| Modernización de Aeropuertos | Infraestructura | -700 | +10 | prereq: estudio_factibilidad + vial; solo presidente | empresarios, clase-alta | ambientalistas | — |
| Estudio de Factibilidad | Infraestructura | -80 | +2 | cooldown 2; -15 en t1 | empresarios, académicos | — | — |
| Seguridad Ciudadana | Seguridad | -400 | +20 | estab. +10, legit. +5, voto +3; -80 en t3 | clase-media, clase-alta, empresarios | — | seguridad |
| Tratado de Libre Comercio | Diplomacia | -300 | +8 | prereq: apoyo empresarios ≥60; solo presidente | empresarios, agrícola, financiero | sindicatos | — |
| Acuerdo Sindical | Diplomacia | -200 | +15 | — | sindicatos, populares | empresarios, clase-alta | Paritarias, condiciones laborales |
| Paro Controlado (hab. sindicalista) | Especial | 1 acción | +5 | estab. -8 | sindicatos +15, populares +15 | **empresarios -10** | — |
| Inversión Privada (hab. empresario) | Especial | 1 acción + pop -3 | — | presupuesto +400, estab. -3 | empresarios +10, financiero +8 | **sindicatos -8, populares -4** | — |

### 2.3 Rangos de balance de acciones

- **Costo en presupuesto:** -700 (aeropuertos) a +800 (préstamo internacional). Gasto social/infraestructura típico: 200–500.
- **Cambio de popularidad por acción:** -20 (reducción de gasto) a +20 (aumento salarial, viviendas, cobertura social, alimentario, seguridad ciudadana, hospitales).
- **Cooldowns:** 2 (estudio_factibilidad), 3 (seguridad_ciudadana), 4 (emitir_dinero), 8 (préstamos).
- **Rendimientos decrecientes (`diminishingFactor`):** emitir 0.65, préstamos 0.90, seguridad 0.85.
- **Efectos diferidos (`futureEffects`):** hasta 6 turnos en el futuro (fomento_emprendimiento devuelve +30×3 desde t4–t6).
- **Prerequisitos encadenados:** estudio_factibilidad → energía renovable / hospitales / aeropuertos / vial; mejorar_recaudacion → reforma impositiva / préstamo internacional; fortalecimiento_justicia → lucha_narcotrafico.
- **Restricción por cargo:** emitir_dinero, préstamo_internacional, tratado_comercio, cumbres y aeropuertos son solo presidente; acuerdo_sindical y alianza_politica disponibles incluso para intendente.

---

## 3. Eventos (18 activos + 6 consecuencias legislativas)

### 3.1 Inventario

**Base (6):** `inflation_crisis` (crítica), `foreign_investment` (media), `coalition_opportunity` (media), `legislative_block` (alta), `student_protests` (alta), `healthcare_crisis` (crítica).

**Pending habilitados (12):**
- Contextuales/triggered (2): `police_violence_scandal` (requiere lucha_narcotrafico o seguridad_ciudadana), `minister_resignation` (estabilidad ≤35).
- Económicos (2): `debt_default` (requiere ≥3 emisiones), `energy_crisis` (presupuesto ≤800).
- Sociales (3): `general_strike`, `prison_riot` (estab. ≤35), `drug_wave` (estab. ≤40).
- Internacionales (2): `diplomatic_conflict`, `external_sanctions` (estab. ≤40).
- Naturales (3): `heat_wave`, `drought` (golpea a sector-agricola), `flood`.

Todos tienen 1–2 **choices** con probabilidad propia (0.4–0.8) y efectos inmediatos sobre popularidad/estabilidad/presupuesto/apoyo grupal.

### 3.2 Ejemplos concretos (tabla)

| Evento | Tipo | Severidad | Prob. | Condición | Impacto inmediato | Choice ejemplo |
|---|---|---|---|---|---|---|
| Crisis Inflacionaria | crisis | crítica | 0.4 | ≥3 emisiones, t3–16 | pop -25, estab -20, presup. -300 | Austeridad (p0.7): pop -15, estab +10, presup. +200 / Control de precios (p0.4): pop +10, estab -15, empresarios -20 |
| Default de Deuda | crisis | crítica | 0.35 | ≥3 emisiones, t5–16 | presup. -500, estab -25, pop -15 | Default técnico (p0.4): presup. +200, estab -30, empresarios -30 |
| Crisis de Salud | crisis | crítica | 0.2 | presupuesto ≤500, t2–16 | pop -20, estab -15 | Fondos emergencia (p0.75): -400, pop +25, estab +15 |
| Paro General | crisis | crítica | 0.35 | t3–16 | estab -20, pop -15, presup. -200 | Descontar día (p0.4): +50, pop -10, sindicatos -25 |
| Escándalo Policial | triggered | crítica | 1.0 | acciones de seguridad | pop -20, estab -15, populares -25 | Defender policía (p0.5): pop -15, populares -30, clase-alta +10 |
| Protestas Estudiantiles | crisis | alta | 0.25 | pop ≤50, t1–16 | pop -15, estab -10 | +Presupuesto (p0.8): -300, pop +20, estudiantiles +25 |

### 3.3 Sistema de pesos (`eventWeights.ts`)

- **Peso por categoría:** económico/político/social 1.0 · internacional 0.8 · natural 0.6.
- **Peso por severidad:** low 0.8 · medium 1.0 · high 1.2 · critical 1.5.
- **Por arquetipo:** empresario recibe ×1.3 eventos económicos y ×0.8 sociales; sindicalista ×1.3 sociales; comunicador ×1.2 políticos y sociales.
- **Por cargo:** intendente ×1.3 eventos locales / ×0.4 nacionales; presidente inverso (×1.3 nacional).
- **Por estado del juego:** baja popularidad (<30) ×1.3; presupuesto negativo ×1.4; baja estabilidad (<25) **×1.5**; alta estabilidad (>75) ×0.6 — el juego "aprieta" cuando el jugador está débil (death spiral suave, mitigado por el ×0.6 en estabilidad alta).
- **Por fase:** early ×0.8 (t1–4), mid ×1.0 (t5–12), late ×1.2 (t13–16).

**Consecuencias legislativas (6, probabilidad 1.0, sin choices):** bloqueo legislativo (-8 pop/-5 estab), marcha opositora, intento de juicio político (-10/-8), soberbia de gobierno, aliados incómodos (aliados -10), editoriales de advertencia. Son el "coste político" del resultado de las elecciones de medio término.

---

## 4. Grupos de interés (18 subgrupos / 5 familias)

### 4.1 Tabla resumen

| Familia | Subgrupos | Influencia (1–10) | Apoyo base | resourceDemand (M) | Demandas clave |
|---|---|---|---|---|---|
| Sectores Económicos | empresarios, sector-agricola, sector-financiero, sindicatos | 7–9 | 35–50 | 250–400 | Reforma laboral, caminos rurales, autonomía BCRA, Paritarias |
| Grupos Sociales | clase-media, sectores-populares, clase-alta, minorías-étnicas, ongs | 5–8 | 30–60 | 100–450 | Control inflación, ayuda social, reducción impuestos, transparencia |
| Movimientos Sociales | ambientalistas, feministas, estudiantiles, cooperativas | 5–7 | 45–55 | 100–250 | Políticas ambientales, paridad salarial, presupuesto educativo |
| Partidos Políticos | aliados (base 70), opositores (base 20) | 7–8 | 20–70 | 300–400 | Espacios de poder / transparencia |
| Colectivos Específicos | artistas, deportistas, académicos | 5–7 | 45–50 | 150–250 | Financiamiento cultural, instalaciones, presupuesto científico |

Cada subgrupo define `demandActionIds` (3 acciones que suben su satisfacción), `supportMultiplier` (1.0–1.4: la clase-alta responde ×1.4, populares ×1.0), y `resourceDemand` (cuánto presupuesto espera recibir). Nace con `satisfactionLevel: 50`.

### 4.2 Matriz de antagonismos (`groupAntagonists.ts`) — trade-off central

El commit "impacto cruzado en satisfacción de demandas" se confirma: cuando un grupo **gana** apoyo, sus antagonistas pierden un **ratio** de esa ganancia.

| Grupo ganador | Antagonista | Ratio |
|---|---|---|
| empresarios | sindicatos | **0.5** |
| empresarios | sectores-populares | 0.3 |
| sector-financiero | sindicatos | 0.5 |
| sector-financiero | sectores-populares | 0.3 |
| sector-financiero | ambientalistas | 0.15 |
| sindicatos | empresarios | 0.5 |
| sindicatos | clase-alta | 0.4 |
| sectores-populares | empresarios | 0.5 |
| sectores-populares | clase-alta | 0.4 |
| clase-alta | sindicatos / populares | 0.3 |
| ambientalistas | sector-agricola / financiero | 0.4 / 0.2 |
| feministas | clase-alta / opositores | 0.2 |
| aliados | opositores | **0.6** |

**Análisis:** el eje dominante es **capital vs. trabajo** (ratios 0.5 en ambos sentidos entre empresarios/financiero y sindicatos/populares). Sumado a los `affectedGroups.opposes` de cada acción, ninguna política económica es neutral: gastar en lo social castiga a la clase-alta; ajustar castiga a los sindicatos. Además los eventos duplican esta lógica (default técnico: empresarios -30; paro general: sindicatos ±20/25).

**Brecha detectada:** la matriz es asimétrica e incompleta — ongs, estudiantiles, académicos, artistas, cooperativas, deportistas y minorías-étnicas **no son antagonistas de nadie ni tienen antagonistas** (son grupos "puros"), y empresarios↔clase-alta no se afectan mutuamente. El trade-off se concentra en ~8 grupos de los 18.

---

## 5. Asesores (7)

| Asesor | Especialidad | Costo (M) | Influencia | Bonus acciones | Modificador de política | Popularidad | Desbloqueo |
|---|---|---|---|---|---|---|---|
| Dr. Carlos Méndez | Economista | 300 | 8 | +2 | economía ×1.3 | -5 | — |
| Lic. María González | Comunicación | 250 | 9 | +1 | social ×1.2, cultura ×1.15 | +10 | — |
| Ing. Roberto Silva | Infraestructura | 400 | 7 | +2 | infraestructura ×1.4 | +5 | — |
| Dra. Ana Martínez | Políticas Sociales | 200 | 8 | +1 | social ×1.3 | +15 | — |
| Dr. Jorge Ramírez | Rel. Internacionales | 500 | 9 | +2 | diplomacia ×1.4 | +8 | popularidad ≥60 |
| Lic. Patricia Sánchez | Seguridad | 350 | 7 | +1 | seguridad ×1.3 | +12 | — |
| Dr. M. A. Torres | Educación | 300 | 8 | +2 | social ×1.3, cultura ×1.2 | +10 | popularidad ≥55 |

Cada asesor además da bonus de apoyo a 2 grupos (+10/+15/+20), tiene 2 habilidades propias referenciadas, 2 rasgos y efectividad 80–95%. Rango de costos 200–500; los mejores (Ramírez, 95% efectividad) se bloquean tras hitos de popularidad.

---

## 6. Habilidades especiales (8 activas + 12 pasivas)

**Activas por arquetipo (cooldown 3–6, cuestan 1 acción + presupuesto/popularidad):**

| Arquetipo | Habilidad | Coste | Efecto clave |
|---|---|---|---|
| Político | Discurso Patriótico (cd 4) | 30 | pop +12, estab +5, legit +8, aliados +8 |
| Político | Pacto de Gobernabilidad (cd 5) | 100 | estab +10, aliados +5 y opositores +5 (única que sube opositores) |
| Empresario | Inversión Privada (cd 5) | 1 acción, pop -3 | presupuesto +400, sindicatos -8 |
| Empresario | Llamado a Inversores (cd 6) | 1 acción | presupuesto +500, legit -5 |
| Sindicalista | Movilización Social (cd 4) | 50 | pop +8, sindicatos +12, empresarios -6 |
| Sindicalista | Paro Controlado (cd 5) | 1 acción | sindicatos +15, populares +15, empresarios -10, estab -8 |
| Comunicador | Campaña Mediática (cd 3) | 80 | pop +10, clase-media +6 |
| Comunicador | Gira de Medios (cd 6) | 50 | pop +15 |

**Pasivas (3 por arquetipo):** oficialismo (+10% retención de voto), eficiencia económica (+20% ingresos de acciones de economía), red de contactos (1 préstamo extra), base movilizada (interacciones gratis con sindicatos/populares), blindaje mediático (-30% impacto de eventos negativos), agenda setting (×1.1 popularidad), +3 pasivas de desplazamiento ideológico por turno (ejes radical/conciliador, populista/técnico, cerrado/convocante). Esto conecta datos con el sistema de ideología.

---

## 7. Estrategias de medio término (4)

| Estrategia | Multiplicador acciones | Coste | Estab./turno | Pop./turno | Riesgo |
|---|---|---|---|---|---|
| Acelerar | ×1.25 | — | -3 | -2 | alto |
| Negociar | ×0.85 | +1 acción | +3 | 0 | bajo |
| Abrirse (coaliciones) | ×1.15 | — | +5 | +1 | medio |
| Jugada Audaz | **×1.50** (2 turnos) | — | -5 | -3 | **extremo** |

Trade-off clásico ritmo/estabilidad, con "abrirse" premiando gobiernos de coalición y "jugada audaz" como apuesta de alto riesgo condicionada al arquetipo.

---

## 8. Carrera política, calendario y derrota

- **Mandatos máximos:** intendente 4, gobernador 2, presidente 2 (`MAX_TERMS`).
- **Dificultad de promoción (modificador electoral):** reelección +5 · intendente→gobernador **-15** · →presidente **-40**. Popularidad mínima: reelección 0, gobernador 45, presidente 75. Postularse a presidente desde intendente está descrito en el juego como "casi imposible".
- **Calendario (partida de 4 años × 4 turnos = 16 turnos):** apertura de sesiones (y1t2), informe de gestión (y1t4), campaña legislativa (y2t2), **elecciones de medio término (y2t4)**, definición de estrategia (y3t1), último período legislativo (y3t2), campaña presidencial (y4t2), **elecciones generales (y4t4)**.
- **Razones de derrota (6):** desgaste popular, colapso fiscal, juicio político, golpe institucional, hiperinflación, derrota electoral. Cada una con consejo contextual (ej. hiperinflación: "no emitas más de 3 veces" — coherente con el trigger `minMoneyPrinting: 3` de crisis inflacionaria y default).

---

## 9. Evaluación de calidad temática y de contenido

### Fortalezas
1. **Coherencia argentina alta:** emisión monetaria con cooldown y rendimientos decrecientes, default selectivo, Paritarias, tarifazos, apagones/crisis energética, caminos rurales, juicio político, "pasarse de rosca", apriete entre aliados y opositores. El vocabulario político es auténtico.
2. **Trade-offs reales y documentados:** la matriz de antagonismos + `affectedGroups` + choices de eventos generan el ciclo "complacer a un sector cuesta otro" que el commit describe. El eje capital/trabajo (0.5) está correctamente calibrado como el conflicto central.
3. **Profundidad sistémica:** prerequisitos encadenados (factibilidad → obras), efectos diferidos hasta 6 turnos, préstamos con cuotas, modificadores de eventos por arquetipo/cargo/estado/fase — contenido con capas.
4. **Buena curva de riesgo:** severidades y pesos (critical ×1.5, low ×0.8) y el estado del juego influyendo en la frecuencia de crisis crean tensión escalonada.
5. **Gestión de contenido pendiente:** `pendingEvents.ts` con activación uno-por-uno y registro documentado es una buena práctica de balance iterativo.

### Debilidades / riesgos
1. **Desbalance de categorías:** Educación/Turismo/Tecnología tienen 1 acción genérica heredada frente a 10–14 en las principales — las categorías poco profundas conviene fusionarlas o expandirlas.
2. **Duplicación de fuentes:** `actionCategories.ts` vs `actionRegistry.ts` (61 vs 61) ya presenta inconsistencias (minBudget de promover_educacion). Fuente única recomendada.
3. **Antagonismos parciales:** 10 de 18 grupos sin antagonismos; ongs/estudiantiles/académicos/artistas son apolíticos en la matriz aunque tengan `opposes` en acciones — las dos capas no siempre coinciden.
4. **Eventos base escasos:** solo 6 eventos base; el contenido real está en los 12 pending (habilitados) y 6 legislativos. La diversidad depende del registro pending.
5. **Posible bloqueo de contenido:** comentario en el código admite que `reforma_impositiva` (minLegislativeSupport 45) puede ser inalcanzable por el estado del apoyo legislativo — decisión deliberada pero un dead-end de contenido.
6. **Asesores:** solo 7, con 2 bloqueados por popularidad; `groupBonuses` referencia un grupo "medios" que no existe en interestGroups (dato huérfano).

### Veredicto
Contenido temáticamente sólido y genuinamente argentino, con números de balance consistentes entre acciones, eventos y condiciones de derrota. La capa de trade-offs (antagonismos + opposes + choices) es el punto más fuerte. Los principales deudas: homogeneizar la duplicación de acciones, densificar las 3 categorías stub y completar la matriz de antagonismos para los grupos huérfanos.
