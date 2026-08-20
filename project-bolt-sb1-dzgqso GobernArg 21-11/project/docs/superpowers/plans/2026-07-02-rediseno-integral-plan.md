# GobernArg — Rediseño Integral: Plan de Implementación

> **ESTADO REAL (20/08/2026)** — Estado de cada task al día de hoy, verificado contra el código:

**Implementado:**
- ✅ Task 1A (parcial): el cambio de `requiredGroups` del evento de coalición (`partidos` → `aliados`) SÍ se aplicó. El cambio de `emitir_dinero.popularityChange` de +3 a -3 **NO**: el valor sigue en **+3** (revertido, decisión de balance).
- ✅ Task 1B (parcial): `PROMOTION_MIN_POPULARITY['promote-governor']` SÍ pasó a 45; el apoyo de grupos se pondera por influencia; el bonus de estabilidad usa `state.stability`. La promoción a presidente **NO bajó a -25**: `PROMOTION_DIFFICULTY['promote-president']` se mantiene en **-40** (revertido).
- ✅ Task 1D: `src/data/actionRegistry.ts` creado, hoy con **61 acciones** (acciónRegistry como fuente única).
- ✅ Task 2A: efectos diferidos reales (incomeModifier, costReduction, stabilityChange, futureEffects).
- ✅ Task 2B: rediseño de interacciones (reunión/negociar/conceder con límites y costo cruzado).
- ✅ Task 2C: demandas conectadas vía `demandActionIds` + `completedActions`.
- ✅ Task 2D: **2 habilidades activas por arquetipo** (8 en total) + pasivas conectadas al runtime.
- ✅ Task 3A: tooltips contextuales (`Tooltip.tsx`, `ErrorBoundary`).
- ✅ Task 3B: `ManagementNotebook.tsx` creado.
- ✅ Task 3C/3D: estilos e iconos por categoría (`categoryStyles.ts`, imágenes por evento).
- ✅ Task 3F: `src/engine/narrativeEngine.ts` creado e integrado.

**Cambios deliberados (no aplicados a propósito):**
- 🔶 Task 3E: el decay quedó en **5/7/10** (intendente/gobernador/presidente) en lugar de 3/5/6 — decisión deliberada de balance; el neto del presidente también se ajustó.

**No aplicados:**
- ❌ Task 1C: hiperinflación sigue en **7 emisiones** (no 4) y el cooldown de `emitir_dinero` sigue en **4** (no 2) — las condiciones de derrota se mantuvieron conservadoras.
- ❌ Task 1B (resto): `ASCENSION_PENALTY` no se tocó con los valores propuestos; hoy `calculatePromotionPenalty` usa su propia tabla (intendente→presidente 0.30/0.30/0.20/0.12).

---

> **For agentic workers:** Use subagent-driven-development. Steps use checkbox syntax.

**Goal:** Implementar las 3 fases del rediseño: arreglar indicadores/elecciones/derrotas, enriquecer gameplay con interacciones/demandas/diferidos/arquetipos, pulir UI/tooltips/narrativa.

**Architecture:** Enjambre de agentes paralelos para tareas independientes + integración secuencial para las que comparten archivos. Fase 1 → verificación → Fase 2 → verificación → Fase 3.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Tailwind 3, Vitest.

**Base:** `C:/Users/User/Desktop/spum/gobernargV2-azul/project-bolt-sb1-dzgqso GobernArg 21-11/project/src/`

---

## Fase 1 — Arreglar (parallelizable tasks)

### Task 1A: Limpiar acciones rotas y evento coalition
- Modify: `src/data/actionCategories.ts` — cambiar `emitir_dinero.popularityChange: 3` → `-3`
- Modify: `src/data/events/political.ts` — cambiar `requiredGroups: ['partidos']` → `['aliados']`

### Task 1B: Hacer elecciones ganables
- Modify: `src/data/careerRules.ts` — `PROMOTION_DIFFICULTY['promote-president']: -40` → `-25`, `PROMOTION_MIN_POPULARITY['promote-governor']: 0` → `45`
- Modify: `src/utils/electionSystem.ts` — ponderar `calculateGroupsSupport` por `influence`, reemplazar stabilityBonus binario por `state.stability`, ajustar `ASCENSION_PENALTY` (intendente→presidente: 0.40→0.30, gob→pres: 0.20→0.15)

### Task 1C: Activar derrotas muertas
- Modify: `src/utils/victoryConditions.ts` — hiperinflación: 7→4, impeachment: pop<10%→<25% y stab<20%→<40%, golpe: legislativeSupport<25%→<30%
- Modify: `src/engine/turnProcessor.ts` — cooldown emitir_dinero: 4→2

### Task 1D: Crear registro unificado de acciones
- Create: `src/data/actionRegistry.ts` — interface `ActionDefinition` + array con las 58 acciones migradas
- Modify: `src/engine/actionEngine.ts` — adaptar `getAvailableActionsForState` para leer del registry
- Mantener `actionCategories.ts` como legacy hasta migración completa

---

## Fase 2 — Enriquecer

### Task 2A: Efectos diferidos reales
- Modify: `src/utils/actionEffects.ts` — extender `generatePendingEffects` para infraestructura (income bonus 2-4 turnos), diplomacia (desbloquea eventos futuros)
- Modify: `src/data/actionRegistry.ts` — agregar `delayed` effects a acciones de infraestructura y diplomacia existentes

### Task 2B: Rediseño de interacciones con grupos
- Rewrite: `src/utils/interactionCosts.ts` — nueva lógica: reunirse (+5 temp, bonus ×1.1), negociar (+8, genera demanda en 1-2 turnos), conceder (+15, 4 turnos sin demandas)
- Modify: `src/engine/gameEngine.ts` — reescribir `applyInteraction`
- Add: `demandActionIds` a subgrupos en `src/data/interestGroups.ts`

### Task 2C: Conectar demandas con acciones reales
- Rewrite: `src/engine/groupAgendaEngine.ts` — generar demandas desde `demandActionIds`, verificar cumplimiento vía `completedActions`
- Verify: build + tests

### Task 2D: Arquetipos con segunda habilidad
- Modify: `src/data/specialAbilities.ts` — agregar segunda habilidad por arquetipo
- Modify: `src/engine/archetypeEngine.ts` — integrar efectos de ejes ideológicos sobre apoyo de grupos

---

## Fase 3 — Pulir

### Task 3A: Tooltips contextuales
- Create: `src/components/InfoTooltip.tsx`
- Modify: `src/components/*.tsx` — wrappear indicadores, grupos, acciones con tooltips

### Task 3B: Cuaderno de Gestión
- Create: `src/components/ManagementNotebook.tsx`
- Modify: `src/App.tsx` — integrar panel

### Task 3C: Claridad visual en eventos
- Modify: `src/components/EventModal.tsx` — íconos por categoría, costos visibles, probabilidades
- Modify: `src/data/events/*.ts` — agregar metadatos de categoría

### Task 3D: Estilos por categoría
- Create: `src/data/categoryStyles.ts` — colores, íconos por ActionCategory
- Modify: `src/components/ActionPanel.tsx` — filtros por categoría, colores

### Task 3E: Balance final
- Modify: `src/engine/turnProcessor.ts` — decay: {int: -3, gob: -5, pres: -6}, recalcState solo suma
- Modify: `src/engine/engineShared.ts` — ajustar income neto presidente

### Task 3F: Capa narrativa
- Create: `src/engine/narrativeEngine.ts`
- Integrate en `turnProcessor.ts` (turno inicial) y `App.tsx` (acciones, interacciones, elecciones)
