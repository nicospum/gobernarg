# REPORTE 7 — Auditoría de Roadmap y Estado de Proyecto
## GobernArg — Planificación, cumplimiento y backlog

> **Rol:** Auditor_Roadmap · **Fecha de análisis:** 20/08/2026
> **Base:** documentación interna del proyecto + verificación contra archivos reales (`git log`, `src/assets/images/`).
> **Estado documentado del juego:** **versión 4.4**

---

## 1. ESTADO ACTUAL DEL PROYECTO (v4.4)

### 1.1 Qué es el juego hoy

GobernArg es un **MVP funcional y testeable centrado en un solo cargo: PRESIDENTE**, con ciclo de mandato completo de 16 turnos (4 años), elecciones de medio término (año 2) y generales (año 4), victoria y derrota posibles, y **183 tests** que pasan (`npm run test` + `npx tsc --noEmit`).

Los cargos de intendente y gobernador existen en estructura de datos (`careerRules.ts`) y textos narrativos, pero **el flujo de juego jugable es presidente directo**.

### 1.2 Qué incluye la versión 4.4 (post-auditoría integral, commits 19–20/08)

| Área | Estado |
|---|---|
| **Turnos globales** | ✅ Arreglado — deadlines, cooldowns y efectos diferidos usan `(year-1)*4 + turn`; demandas, negociaciones y cooldowns de eventos vencen correctamente entre años |
| **Victoria** | ✅ Posible — objetivos usan `groupRelations` keyed por subgrupo (fix 1 línea del bug sistémico) |
| **Eventos** | ✅ **18 eventos activos con imágenes propias** (6 econ + 6 pol + 6 soc); 12 activados el 19/08; limitador global: cooldown 3 turnos, máx 5 aleatorios/mandato; 17 efectos antes ignorados ahora aplican |
| **Pasivas de arquetipo** | ✅ 4 pasivas conectadas al runtime + **2 habilidades activas por arquetipo (8 total)** |
| **Dificultad** | ✅ `popularityDecayMultiplier`, `crisisProbabilityMultiplier`, `incomeMultiplier`, `loansAvailable` consumidos. ⚠️ `baseActionsModifier` e `ironman` documentados pero **sin consumir** |
| **Interacciones/demandas** | ✅ Concesiones limitadas (máx 4/mandato, costo cruzado), demandas raras (8–25%, máx 2 simultáneas, cumplir cuesta 1 acción) |
| **Mutaciones React** | ✅ Eliminadas (deep clones en `processEndTurn`, `useSpecialAbility`, `applyEventChoice`, `recordElectionOutcome`) |
| **UI** | ✅ Migrada a tema oscuro (GameLog, NotificationCenter, ActiveBenefits, AdvisorPanel + legacy) |
| **Toolchain** | ✅ Lint y `tsc` funcionan; 14 errores de lint menores restantes |
| **Tests** | ✅ 183 (era 96 al inicio de la auditoría) |
| **Assets visuales** | ✅ 66 piezas del master integradas (19–20/08): iconos A/B/C, 12 imágenes de eventos, fondos, personajes; **31 piezas SVG v2** (commits d6635e6/1386b7c) |
| **Dead code / deps** | ✅ Eliminados (puppeteer, open, cross-env, componentes ui muertos, helpers sin uso) |
| **Fórmulas de voto** | ✅ Unificadas (2.7) |

**Commits clave:** `d00189a` auditoría → `0160294` FASE 1 → `afeabb4` FASE 2 → `b3ba398` FASE 3 → `1e3793e` FASE 3.4+4 → `14d5810` docs actualizados.

---

## 2. CUMPLIMIENTO DE CADA PLAN HISTÓRICO

### 2.1 Plan de Optimización (`docs/plan-optimizacion.md`, 19/08) — 119 hallazgos

| Fase | Contenido | Cumplimiento |
|---|---|---|
| **Fase 1 (críticos)** | 1.1 turnos globales · 1.2 objetivos groupRelations · 1.3 17 efectos · 1.4 toolchain | ✅ **100%** |
| **Fase 2 (HIGH)** | 2.1 mutaciones React · 2.2 pasivas · 2.3 bono reunión · 2.4 dificultad · 2.5 triggered · 2.6 UI dark · 2.7 voto · 2.8 deps · 2.9 registry | ✅ **100%** (con 2 pendientes menores: `baseActionsModifier`, `ironman`) |
| **Fase 3 (MEDIUM)** | 3.1 datos · 3.2 dead code · 3.3 UI/UX · 3.4 tests | ✅ **100% (3.4 incluido)** — 183 tests |
| **Fase 4 (mejoras)** | 4.1 instalar · 4.2 config · 4.3 tests nuevos · 4.4 docs | ✅ **100% (4.1–4.4)** — 7 documentos actualizados |

**Restos documentados:** 14 errores de lint (11 estilo + 3 puntuales); `baseActionsModifier`/`ironman` sin cablear. Nada más.

### 2.2 Rediseño Integral (`docs/superpowers/plans/2026-07-02-rediseno-integral-plan.md`)

El propio plan fue **actualizado con estado real verificado (20/08)**:

- ✅ **Implementados:** 1A (parcial), 1B (parcial), 1D, 2A, 2B, 2C, 2D, 3A, 3B, 3C/3D, 3F.
- 🔶 **Decisión deliberada de balance:** 3E (decay quedó en 5/7/10 por cargo, no 3/5/6).
- ❌ **No aplicados:** 1C (hiperinflación sigue en 7 emisiones, cooldown emitir_dinero en 4 — condiciones de derrota conservadoras), resto de 1B (`ASCENSION_PENALTY` con tabla propia; `promote-president` sigue en -40).
- **Reversión sin documentar detectada y ya documentada:** `emitir_dinero.popularityChange` quedó en **+3** (no -3 como pedía el plan).

**Conclusión:** el rediseño integral está ~85% cumplido; lo omitido son cambios de balance que se decidió no hacer.

### 2.3 Roadmap de mejoras (`src/docs/roadmap.md`)

- **Fases 1–5: implementadas** (identidad visual, dashboard, mecánicas, contenido, elecciones/dificultades/epílogo).
- **Pendientes dentro de fases completas:** animaciones micro, TurnSummaryModal con diario+gráfico, retratos/historias de asesores, objetivos más variados, logros desbloqueables.
- **Fase 6 (pulido final): sin empezar** — sonidos/música, tutorial interactivo, responsive, pantallas de victoria/derrota emotivas, testing manual de balance.

### 2.4 Plan de implementación unificado (`src/docs/implementation-plan.md`, 5 áreas Motor↔UI)

Los 4 sprints (habilidades especiales, razón de derrota + ejes, agendas de grupos, estrategias post-legislativas) fueron **implementados en junio 2026** y siguen vigentes según `session-summary.md`. El área excluida — **selector de dificultad / Ironman** — quedó para "etapa posterior" y **hoy sigue parcial** (ironman sin consumir; selector existe pero sin efecto ironman).

### 2.5 Plan Fase 1 "El juego ya no es un paseo" (`src/docs/phase-1-plan.md`)

**Cumplido:** acciones base por cargo (3/2/1), umbrales de derrota por cargo, reunión cuesta 10, MAX_TERMS intendente 4, `availableForPositions`, desgaste 5/7/10, ingreso neto ajustado, game over al terminar presidencia. Sus evoluciones figuran como Fase A del `difficulty-analysis.md` y están vigentes en el código (session-summary confirma decay 5/7/10 como "decisión deliberada").

### 2.6 Análisis de dificultad (`src/docs/difficulty-analysis.md`, 22/06)

- **Nivel 1 (ajustes numéricos):** ✅ aplicado vía phase-1-plan.
- **Nivel 2 (mecánicas):** ✅ parcialmente — efectos diferidos ✅, calendario ✅, notificaciones ✅, habilidades ✅, agendas ✅, cooldowns de acciones ✅ (`actionCooldowns` existe tras Fase 2). **Inflación real por emisión y rendimientos decrecientes estrictos: no confirmados como mecánica completa** (emitir_dinero sigue en +3 pop / 200 budget, cooldown 4 — más benigno que el diseño).
- **Nivel 3 (transformacional):** ⚠️ parcial — ejes ✅ (AxisBar en UI), derrotas alternativas ✅ (impeachment/golpe/hiperinflación verificados en Fase 3), dificultad ✅ (sin ironman). **Legitimidad como recurso: NO implementada** (era la pieza "transformacional" #1).

---

## 3. BACKLOG PENDIENTE DOCUMENTADO (priorizado)

### 🔴 P0 — Riesgo funcional / deuda declarada en los propios documentos

| # | Ítem | Fuente | Esfuerzo |
|---|---|---|---|
| 1 | Conectar `baseActionsModifier` e `ironman` de dificultad al runtime (o eliminarlos de la UI/datos) | plan-optimización 2.4, session-summary | Bajo |
| 2 | 14 errores de lint (6 any + 5 unused + rules-of-hooks + 2 prefer-const) | plan-optimización pendientes | Bajo |
| 3 | **Docs desactualizados que inducen a error:** `INVENTORY.md` (dice 59 imágenes; en disco hay 17 eventos + 20 iconos grupos + 5 arquetipos + 14 categorías = ~80+ piezas nuevas no inventariadas), `image-needs.md` (lista como "faltantes" iconos ya integrados), `eventos-aleatorios-inventario.md` (congelado en 12 eventos; hoy 18) | verificación en disco 20/08 | Bajo |

### 🟠 P1 — Contenido de eventos (propia propuesta v2: 28 objetivo vs 18 activos)

| # | Ítem | Fuente |
|---|---|---|
| 4 | **10 eventos restantes de la propuesta:** `cabinet_crisis`, `financial_bubble`, `early_elections_pressure`, `ally_betrayal`, `spying_scandal`, `student_spying`, `international_summit`, `pandemic`, `corruption_scandal_triggered`, `allies_uncomfortable_triggered` | eventos-aleatorios-propuesta §"Estado actual" |
| 5 | 2 eventos scheduled nuevos: **Cumbre de gobernadores** (A3T3) y **Debate presidencial** (A4T1) | eventos-aleatorios-propuesta §5 |
| 6 | Mecánicas de reversión documentadas (§6) no verificadas como implementadas como sistema (acciones que revierten eventos activos) | eventos-aleatorios-propuesta |

### 🟡 P2 — Assets visuales pendientes

| # | Ítem | Fuente |
|---|---|---|
| 7 | **Grupo E (10 piezas UI):** marco retrato presidencial, banners victoria/derrota, sellos aprobado/crisis, insignias de mandato ×3, medallas oro/plata — en `ui/` solo existen `official-frame` y 2 emblemas | piezas-diseno-master §Grupo E |
| 8 | Grupo F (10 fondos interiores) y Grupo G (14 personajes) — aún no generados (verificación en disco: sin `bg-cabinet-room`, sin asesores masculinos) | piezas-diseno-master |
| 9 | Piezas H pendientes tras integración mayoritaria: estados vacíos ilustrados (ControlPanel, AdvisorPanel, NotificationCenter), iconos de moods para `SubgroupMoodBadge` (hoy emojis), headers de TurnSummary/GameOver/Legacy/Reelection/Midterm | piezas-diseno-propuesta §8 |

### 🟢 P3 — Features de engine futuras (`future-engine-features.md`)

| # | Ítem | Estado |
|---|---|---|
| 10 | **Legitimidad como recurso invisible** (principio filosófico #6) | No implementada — hueco mayor de diseño |
| 11 | Selector de dificultad / **Ironman** (un solo slot, sin guardar) | Excluido del plan unificado; sigue pendiente |
| 12 | Acciones con requisitos ricos (asesor específico, apoyo grupal mínimo — `canExecuteAction` del doc) | Parcial (prerequisitos existen en demandas; no en generación de acciones) |
| 13 | `scheduledEvents` nunca se puebla — **ManagementNotebook siempre vacío** (bug 3.3 documentado, no listado como resuelto) | Abierto |
| 14 | Fórmula de probabilidad de eventos con pity timer y modificadores (§7 propuesta) | Parcial (eventWeights existe; pity timer no confirmado) |
| 15 | Retratos e historias para asesores; objetivos variados por cargo/arquetipo; **logros desbloqueables** (dependería de Grupo E medallas) | roadmap Fases 4–5 |

### ⚪ P4 — Pulido final (roadmap Fase 6, sin empezar)

Sonidos/música opcional · tutorial interactivo · responsive design · pantallas victoria/derrota más emotivas (liga con Grupo E/H) · **testing manual y ajuste final de balance** (bloqueante natural para considerar el juego "terminado").

### 🔵 P5 — Alcance mayor (diseño, no solo pulido)

| # | Ítem |
|---|---|
| 16 | **Modo campaña completo:** ascender Intendente → Gobernador → Presidente (roadmap Fase 5; los datos de careerRules ya existen) |
| 17 | Árbol de desbloqueo de acciones con `prerequisites` completos (difficulty-analysis §5.2) |
| 18 | Matriz de antagonismos entre grupos en runtime (§5.4 — existe el concepto en costo cruzado de concesiones, no como sistema general) |
| 19 | Balance pendiente del rediseño: revisitar 1C (derrotas) y `emitir_dinero +3` si se quiere mayor dificultad |

---

## 4. INVENTARIO DE ASSETS Y SU ESTADO

**Verificado en disco (20/08):**

| Grupo | Piezas | Estado |
|---|---|---|
| Arquetipos (A) | 5/5 webp | ✅ Completo (incl. business, communicator, union v2) |
| Categorías (B) | 14/14 webp (incl. culture, tourism, technology v2) | ✅ Completo |
| Grupos de interés (C) | 20/20 webp | ✅ Completo |
| Eventos (D) | 17 imágenes en `events/` | ✅ Las 12 de la tanda 19/08 integradas (+5 base) |
| UI (E) | 3/13 en `ui/` (official-frame, shield-emblem ×2) | ❌ **Faltan 10: banners, sellos, insignias, medallas** |
| Fondos (F) | 8 fondos existentes (exteriores/balcones); faltan 10 interiores | ⚠️ Parcial |
| Personajes (G) | 9 avatares + 8 asesores existentes; faltan 6 asesores masculinos, 6 avatares, 2 especialidades nuevas | ⚠️ Parcial |
| Logo | 2 piezas | ✅ |

**Total estimado en disco: ~85 piezas webp** (INVENTORY.md reporta solo 59 → **desactualizado, P0-3**).

---

## 5. RIESGOS Y HUECOS

1. **Deuda de documentación que contradice el código** (INVENTORY.md, image-needs.md, eventos-aleatorios-inventario.md): riesgo de que futuros agentes "regeneren" piezas ya existentes o crean eventos duplicados. **Es la acción más barata y de mayor retorno inmediato.**
2. **`scheduledEvents` vacío / ManagementNotebook muerto**: feature visible que nunca muestra nada — impacta percepción de calidad más que su costo de arreglo.
3. **Dificultad declarada "easy" sin inflación real**: `emitir_dinero` (+3 pop/+200) y la reversión de `popularityChange` a +3 dejan sin efecto el principio de diseño "la dosis hace al veneno". Hay decisión de balance pendiente explícita (aplicar 1C o no).
4. **Ironman / baseActionsModifier anunciados en UI sin efecto**: promesa rota al jugador.
5. **Sin backup remoto**: riesgo #5 del propio plan ("conviene pushear o hacer bundle antes de tocar el engine") — sigue abierto.
6. **Legitimidad ausente**: el principio filosófico #6 y la pieza "transformacional" del análisis de dificultad no tienen implementación ni fecha; si se descarta, conviene documentar la decisión.
7. **Tests 183 cubren mecánicas pero la Fase 6 pide testing manual de balance**: la suite no valida "diversión" ni dificultad percibida; el cierre del juego depende de playtesting humano.
8. **Concentración en MVP presidente:** intendente/gobernador quedan como estructura sin gameplay; cualquier trabajo futuro sobre modo campaña es esfuerzo grande (está bien como decisión de scope, pero es el hueco más grande del roadmap).

---

## 6. SÍNTESIS: PRÓXIMOS PASOS RECOMENDADOS (ordenados)

1. **P0-3** — Sincronizar INVENTORY.md + image-needs.md + eventos-aleatorios-inventario.md con el disco (1 sesión).
2. **P0-1/P0-2** — Cablear o eliminar `baseActionsModifier`/`ironman`; limpiar 14 lints (1 sesión).
3. **P0-4** — Arreglar `scheduledEvents` → ManagementNotebook funcional.
4. **P1-4/5** — Implementar los 10 eventos restantes (máximo valor de rejugabilidad por hora; la mitad son `triggered` con condiciones ya definidas).
5. **P2-7** — Grupo E (10 piezas UI) desbloquea victoria/derrota emotiva + logros (P3-15).
6. **P4** — Fase 6 de pulido, cerrando con playtesting manual de balance y la decisión pendiente sobre inflación/1C.
7. **P5** — Modo campaña y legitimidad solo tras cerrar lo anterior.

*GobernArg v4.4 está en su mejor estado documentado: los planes históricos están ~90% cumplidos, la deuda técnica crítica es cero, y el backlog restante es de contenido, pulido y sincronización documental — no de supervivencia del proyecto.*
