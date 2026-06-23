# PLAN DE IMPLEMENTACIÓN UNIFICADO — GobernArg V2

## Conexión Motor de Juego ↔ UI (5 Áreas Urgentes)

---

## 1. Resumen Ejecutivo

Este plan integra 5 áreas que tienen el motor y datos implementados, pero carecen de interfaz de usuario. Esfuerzo total estimado: **~35-40 horas** repartido en **4 sprints**.

Se excluye el Área de Selector de Dificultad / Ironman — se abordará en una etapa posterior.

### Las 5 áreas y su estado actual:

| # | Área | Motor | Datos | UI | App.tsx |
|---|---|---|---|---|---|
| 2 | Habilidades Especiales | ✅ Completo | ✅ | ❌ | ❌ |
| 3 | Estrategias Post-Legislativas | ⚠️ Parcial | ✅ | ❌ | ❌ |
| 4 | Agendas de Grupos | ⚠️ Parcial | ⚠️ | ❌ | ❌ |
| 5 | Ejes Contradictorios | ✅ Completo | ✅ | ❌ | ❌ |
| 6 | Razón de Derrota | ⚠️ Parcial | ❌ | ❌ | ❌ |

---

## 2. Arquitectura — Data Flow

```
App.tsx (integra TODO)
├── GameHeader
├── ControlPanel ← SpecialAbilitiesPanel (NUEVO - Sprint 1)
├── IndicatorsPanel ← AxisBar[] (NUEVO - Sprint 2)
├── InterestGroupsPanel ← SupportBar + MoodBadge + AgendaItem (NUEVOS - Sprint 3)
├── MidtermStrategyModal (NUEVO - Sprint 4)
├── GameOverModal ← defeatReason (MEJORADO - Sprint 2)
└── LegacyScreen ← defeatReason + ejes (MEJORADO - Sprint 2)

gameEngine.ts (modificaciones repartidas por sprint)
├── Sprint 2: notificaciones ejes extremos + election_loss fix
├── Sprint 3: satisfyGroupDemand()
└── Sprint 4: triggerMidtermStrategy() + filtrado + calendar + bloqueo + audaz fix
```

---

## 3. SPRINTS DE IMPLEMENTACIÓN (en orden)

---

### 🟢 SPRINT 1 — Habilidades Especiales de Arquetipos

**Estado inicial:** `useSpecialAbility()` implementada y exportada en gameEngine.ts. Cooldowns se decrementan en processEndTurn. `abilityCooldowns` existe en GameState. `specialAbilities.ts` tiene datos completos. **Falta 100% la UI.**

**Pasos:**

| # | Archivo | Acción | Descripción |
|---|---|---|---|
| 1.1 | `src/components/SpecialAbilitiesPanel.tsx` | **CREAR** | Componente con: nombre de habilidad, descripción, costos ($M, acciones, popularidad), efectos esperados, botón "Usar Habilidad", indicador de cooldown restante, barra de progreso. Props: `gameState`, `onUseAbility`, `disabled` |
| 1.2 | `src/components/ControlPanel.tsx` | **MODIFICAR** | Insertar `<SpecialAbilitiesPanel>` entre el bloque de acciones y el botón "Finalizar Turno". Agregar prop `onUseAbility` |
| 1.3 | `src/App.tsx` | **MODIFICAR** | Agregar import de `useSpecialAbility`, handler `handleUseSpecialAbility`, pasar a ControlPanel vía prop, manejar actionId `__use_special_ability__` en `handleActionSelect` |

**Dependencias:** Ninguna. `useSpecialAbility()` ya existe en gameEngine.ts.

**Estimado:** ~5-6h

---

### 🟡 SPRINT 2 — Razón de Derrota + Ejes Contradictorios

**Estado inicial:** Las 5 vías de derrota se asignan correctamente en `checkDefeat()` menos `election_loss` (BUG). GameOverModal y LegacyScreen no usan `defeatReason`. Los ejes se calculan en `applyAxisShift()` pero no se muestran.

**Pasos:**

| # | Archivo | Acción | Descripción |
|---|---|---|---|
| 2.1 | `src/data/defeatReasons.ts` | **CREAR** | Mapa `DEFEAT_REASON_CONFIG: Record<DefeatReason, {title, description, icon, advice, severity}>`. 6 entradas: low_popularity, negative_budget, impeachment, institutional_coup, hyperinflation, election_loss |
| 2.2 | `src/engine/gameEngine.ts` | **MODIFICAR** | **BUGFIX** en `resolvePendingElection`: agregar `state.defeatReason = 'election_loss'` cuando `!results.victory`. **Agregar** notificaciones en `processEndTurn` cuando eje >=80 o <=-80 (radical↔conciliador, populista↔técnico, cerrado↔convocante) |
| 2.3 | `src/components/AxisBar.tsx` | **CREAR** | Barra bipolar -100 a +100. Props: `value`, `labelLo`, `labelHi`, `loColor`, `hiColor`. Marcador posicionado según valor. |
| 2.4 | `src/components/IndicatorsPanel.tsx` | **MODIFICAR** | Agregar sección "Perfil Ideológico" con 3 `<AxisBar>`: Radical↔Conciliador, Populista↔Técnico, Cerrado↔Convocante |
| 2.5 | `src/components/GameOverModal.tsx` | **MODIFICAR** | Usar `gameState.defeatReason` + `DEFEAT_REASON_CONFIG` para mostrar título específico, descripción, consejo. Reemplazar texto genérico "Fin del Juego" |
| 2.6 | `src/components/LegacyScreen.tsx` | **MODIFICAR** | Agregar badge con razón de derrota (si `!victorious`). Agregar sección "Perfil ideológico de tu gestión" con 3 AxisBar |
| 2.7 | `src/utils/careerLog.ts` | **MODIFICAR** | En `generateLegacyText`, reemplazar párrafo genérico "perdió las elecciones" por texto narrativo específico según `defeatReason` |
| 2.8 | `src/App.tsx` | **MODIFICAR** | Render condicional de `<GameOverModal>` ANTES de `<LegacyScreen>`. Agregar cambios de ejes en TurnSummaryModal. Importar defeatReasons |

**Dependencias:** Paso 2.2 (engine) antes que 2.5/2.6/2.7 (UI que lee defeatReason). 2.3 antes que 2.4/2.6 (UI que usa AxisBar).

**Estimado:** ~12-14h

---

### 🟠 SPRINT 3 — Agendas de Grupos de Interés

**Estado inicial:** `groupAgendaEngine.ts` genera agendas/moods/penalizaciones. `processEndTurn` las ejecuta. Pero InterestGroupsPanel no muestra support, mood, ni agendas. No existe `satisfyGroupDemand()` en engine.

**Pasos:**

| # | Archivo | Acción | Descripción |
|---|---|---|---|
| 3.1 | `src/engine/gameEngine.ts` | **MODIFICAR** | Agregar función exportada `satisfyGroupDemand(state, agendaId)`: marca satisfied=true, +10 groupRelation, resetea mood a 'contento', +2 popularidad, notificación success |
| 3.2 | `src/components/SubgroupMoodBadge.tsx` | **CREAR** | Badge pequeño con color+emoji: contento🟢, neutral🔵, disconforme🟡, enojado🟠, radicalizado🔴. Props: `mood` |
| 3.3 | `src/components/AgendaItem.tsx` | **CREAR** | Tarjeta con: demanda, deadline (turnos restantes), barra de urgencia (rojo ≤2 turnos), botón "Cumplir demanda". Props: `agenda`, `turnsLeft`, `onSatisfy` |
| 3.4 | `src/components/SupportBar.tsx` | **CREAR** | Barra horizontal 0-100. Verde >70, azul 50-70, amarillo 35-50, rojo <35. Props: `value` |
| 3.5 | `src/components/InterestGroupsPanel.tsx` | **MODIFICAR** | Para cada subgroup: agregar `<SupportBar>`, `<SubgroupMoodBadge>`, lista de `<AgendaItem>` activas. Agregar prop `onSatisfyDemand` |
| 3.6 | `src/App.tsx` | **MODIFICAR** | Handler `handleSatisfyDemand` → `satisfyGroupDemand()`. Pasar a InterestGroupsPanel |

**Dependencias:** Paso 3.1 (engine) antes que 3.3/3.5/3.6 (UI que usa satisfyGroupDemand). 3.2/3.3/3.4 antes que 3.5.

**Estimado:** ~10-12h

---

### 🔴 SPRINT 4 — Estrategias Post-Legislativas

**Estado inicial:** `midtermStrategies.ts` tiene datos. `processEndTurn` aplica efectos pasivos. El calendario tiene evento `definicion-estrategia` en año 3 turno 1. Pero: `pendingMidtermStrategy` nunca se activa, no hay modal de selección, `jugada_audaz` usa `state.turn >= 3` en vez de contador propio.

**Pasos:**

| # | Archivo | Acción | Descripción |
|---|---|---|---|
| 4.1 | `src/types/game.ts` | **MODIFICAR** | Agregar campo `audazTurnsCount: number` a GameState |
| 4.2 | `src/engine/gameEngine.ts` | **MODIFICAR** | 5 cambios: (a) `filterAvailableMidtermStrategies(state)` — filtrar según legislativeSupport/groupRelations/archetype. (b) `triggerMidtermStrategy(state, strategy)` — aplicar estrategia. (c) `processCalendarEvents` — activar `definicion-estrategia` → pendingMidtermStrategy=true. (d) `processEndTurn` — bloquear avance si pendingMidtermStrategy. (e) Reemplazar `state.turn>=3` por `audazTurnsCount` en lógica de jugada_audaz (dura 2 turnos exactos, luego revierte a 'negociar') |
| 4.3 | `src/components/MidtermStrategyModal.tsx` | **CREAR** | Modal de elección forzosa (sin botón cerrar). 4 tarjetas de estrategia con: nombre, descripción, nivel de riesgo (badge color), multiplicadores, efectos/turno. Estrategias no disponibles bloqueadas con tooltip. Botón "Confirmar Estrategia". Props: `availableStrategies`, `gameState`, `onSelect` |
| 4.4 | `src/App.tsx` | **MODIFICAR** | Estado `showMidtermStrategy`. Handler `handleSelectMidtermStrategy` → `triggerMidtermStrategy()`. En `handleEndTurn`, detectar `pendingMidtermStrategy` y mostrar modal. Render condicional de `<MidtermStrategyModal>` |

**Dependencias:** 4.1 → 4.2 → 4.3 → 4.4. Este sprint depende de los anteriores (necesita App.tsx ya tocado).

**Estimado:** ~7-8h

---

## 4. Tabla Resumen de Archivos

### CREAR (7):

| Archivo | Sprint | Est. |
|---|---|---|
| `src/components/SpecialAbilitiesPanel.tsx` | 1 | 2h |
| `src/data/defeatReasons.ts` | 2 | 1h |
| `src/components/AxisBar.tsx` | 2 | 1.5h |
| `src/components/SubgroupMoodBadge.tsx` | 3 | 1h |
| `src/components/AgendaItem.tsx` | 3 | 1.5h |
| `src/components/SupportBar.tsx` | 3 | 1h |
| `src/components/MidtermStrategyModal.tsx` | 4 | 3h |

### MODIFICAR (8):

| Archivo | Sprint | Est. |
|---|---|---|
| `src/components/ControlPanel.tsx` | 1 | 1.5h |
| `src/App.tsx` | 1,2,3,4 | 2h + 1h + 1h + 1h |
| `src/engine/gameEngine.ts` | 2,3,4 | 1h + 1h + 3h |
| `src/components/IndicatorsPanel.tsx` | 2 | 2h |
| `src/components/GameOverModal.tsx` | 2 | 2h |
| `src/components/LegacyScreen.tsx` | 2 | 3h |
| `src/utils/careerLog.ts` | 2 | 1h |
| `src/components/InterestGroupsPanel.tsx` | 3 | 4h |
| `src/types/game.ts` | 4 | 0.5h |

**Total: 7 creados + 8 modificados = 15 archivos**

---

## 5. Testing por Sprint

**Sprint 1:** SpecialAbilitiesPanel se renderiza en ControlPanel. Botón "Usar" descuenta acciones y budget. Cooldown aparece y decrementa al finalizar turno. Efectos se aplican correctamente.

**Sprint 2:** Cada vía de derrota muestra título y descripción específica en GameOverModal y LegacyScreen. election_loss se asigna al perder elección. AxisBar muestra valores correctos en IndicatorsPanel y LegacyScreen. Notificaciones al llegar a ±80.

**Sprint 3:** InterestGroupsPanel muestra support, mood, y agendas activas por subgrupo. Botón "Cumplir demanda" marca satisfied, sube +10 support, +2 popularidad, resetea mood.

**Sprint 4:** Al llegar a año 3 turno 1, aparece MidtermStrategyModal. Estrategias se filtran correctamente. Efectos pasivos se aplican. jugada_audaz dura 2 turnos exactos.

---

## 6. Estimación Total

| Sprint | Áreas | Horas |
|---|---|---|
| Sprint 1 | Habilidades Especiales | ~5-6h |
| Sprint 2 | Derrota + Ejes | ~12-14h |
| Sprint 3 | Agendas de Grupos | ~10-12h |
| Sprint 4 | Estrategias Midterm | ~7-8h |
| **Total** | | **~35-40h** |
