# Reporte 11 — Mejoras técnicas con foco en ROI

**Proyecto:** GobernArg (React 18 + TS + Vite + Tailwind + Vitest)
**Fecha:** 2026-09-20 · **Alcance:** `src/` completo (engine, components, utils, data, App.tsx)

> Nota: la deuda ya documentada (God Object `GameState`, RNG no determinista, dead code, 14 errores de lint, 0% cobertura UI, sin CI, fixtures `{} as GameState`, etc.) no se repite como hallazgo nuevo; se incorpora donde aporta a un plan priorizado.

---

## 1. Riesgo / bugs

### 1.1 🔴 Mutación del estado previo en `processEndTurn` (BUG REAL, no documentado)
`processEndTurn` hace shallow-copy selectivo de los arrays anidados (líneas 252-265 de `turnProcessor.ts`), pero **no copia `completedObjectives`** (ni otros campos anidados como `objectives`). `applyObjectiveRewards` (línea 196) hace `state.completedObjectives.push(obj)` sobre el array **compartido con el estado anterior de React**. Consecuencias: estado "inmutable" que muta en el tiempo → renders stale, imposibilidad de time-travel/undo, tests que pasan por accidente.
- **Archivos:** `src/engine/turnProcessor.ts` (copia inicial), `src/utils/victoryConditions.ts` (updateObjectives), `src/types/game.ts`.
- **Esfuerzo:** chico · **Impacto:** alto · **Riesgo:** bajo (agregar campos faltantes al spread inicial; validar con test de identidad de referencia).
- **Extensión recomendada:** test que ejecute `processEndTurn(state)` y aserte que ningún array/objeto anidado de `state` original cambió de referencia-contenido (guardar snapshots JSON de arrays compartidos).

### 1.2 Cerrar `EventModal` sin elegir descarta el evento sin consecuencias
En `App.tsx:275`, `onClose` hace `setPendingEvents(prev => prev.slice(1))`: el jugador puede cerrar un evento **con choices** sin elegir, saltándose sus consecuencias y dejando `turnLogEntry.decisions` vacío. Es un exploit de balance.
- **Archivos:** `src/App.tsx`, `src/components/EventModal.tsx`.
- **Esfuerzo:** chico · **Impacto:** medio (balance + coherencia del log) · **Riesgo:** bajo (ocultar/quitar el cierre para eventos con choices, o aplicar choice por defecto).

### 1.3 Tipar `TurnResult.triggeredEvents: any[]` → `GameEvent[]`
`engineShared.ts:64` declara `triggeredEvents: any[]; // GameEvent[]`. El `any` se propaga a `App.tsx` (`pendingEvents`) y anula chequeo de tipos en toda la cadena de eventos.
- **Archivos:** `src/engine/engineShared.ts`, `src/engine/turnProcessor.ts` (usa `import('./engineShared').TurnResult` inline — reemplazar por `import type`).
- **Esfuerzo:** chico · **Impacto:** medio · **Riesgo:** bajo (puede saltar errores de tipo latentes → son bugs reales a corregir).

### 1.4 Validación de datos estáticos al inicio (dev/build)
Los datos (1100+ líneas de `actionRegistry.ts`, 596 de `pendingEvents.ts`) no tienen validación: ids duplicados, `category` inexistente en `CATEGORY_ICONS`/`CATEGORY_STYLES`, `groupEffects` con `groupId` inválido o efectos que referencian habilidades inexistentes pasarían silenciosos. Un `validateGameData()` corrido en dev (`main.tsx`) y como test/CI previene clases enteras de bugs de contenido.
- **Archivos:** nuevo `src/data/validate.ts`, `src/main.tsx`, test en `src/__tests__/`.
- **Esfuerzo:** medio · **Impacto:** alto · **Riesgo:** nulo (solo detecta, no cambia datos).

### 1.5 Helper/assertion para el patrón defensivo repetido en App
`App.tsx:87` chequea `if (!prev || !prev.groupAgendas) return prev` — el tipo dice `GameState` no nullable, así que o el tipo miente o el chequeo es muerto. Un `assertGameState(state): asserts state is GameState` (o aceptar `GameState | null` explícitamente en el engine) elimina la ambigüedad en todos los handlers.
- **Archivos:** `src/App.tsx`, `src/types/game.ts`, `src/engine/gameEngine.ts`.
- **Esfuerzo:** chico · **Impacto:** medio · **Riesgo:** bajo.

---

## 2. Performance

### 2.1 `useMemo` en `ControlPanel`
`getAvailableActionsForState(gameState)` filtra/mapea las ~100+ acciones del registro **en cada render**, y `calculateActionEffects` se recalcula para cada acción seleccionada en cada render. Con `useMemo(() => ..., [gameState])` se calcula solo cuando cambia el estado (1× por acción del jugador).
- **Archivos:** `src/components/ControlPanel.tsx`, `src/engine/actionEngine.ts`.
- **Esfuerzo:** chico · **Impacto:** medio · **Riesgo:** bajo.

### 2.2 `React.memo` + `useCallback` en App y cards
App tiene ~14 `useState`; abrir/cerrar cualquier modal (Historial, Cuaderno, resumen) re-renderiza **todo el árbol** (RightSidebar 520 líneas, IndicatorsPanel, NotificationCenter, todas las ActionCards). Los handlers (`handleActionSelect`, `handleInteraction`, etc.) se recrean cada render. Memoizar handlers con `useCallback` y envolver `ActionCard`, `IndicatorsPanel`, `RightSidebar` en `memo` corta la mayoría de re-renders.
- **Archivos:** `src/App.tsx`, `src/components/ActionCard.tsx`, `src/components/IndicatorsPanel.tsx`, `src/components/RightSidebar.tsx`.
- **Esfuerzo:** medio · **Impacto:** medio-alto (sobre todo en partidas largas con historial/notificaciones grandes) · **Riesgo:** bajo-medio (cuidado con props inline que invaliden el memo).

### 2.3 Atributos de imágenes faltantes
Solo `EventModal` usa `loading="lazy" decoding="async"`. `AdvisorPanel`, `AdvisorSelectionModal`, `GameHeader` y `LegacyScreen` renderizan `<img>` sin lazy ni dimensiones (CLS). Las imágenes ya son `.webp` (bien).
- **Archivos:** `src/components/AdvisorPanel.tsx`, `AdvisorSelectionModal.tsx`, `GameHeader.tsx`, `LegacyScreen.tsx`.
- **Esfuerzo:** chico · **Impacto:** bajo-medio · **Riesgo:** nulo.

### 2.4 Render completo de listas acotadas (bajo ROI, mención)
`GameLog` y `NotificationCenter` listan todo el historial (≤16 turnos / ≤50 notificaciones). Acotable con paginación simple si en el futuro el historial crece. **Esfuerzo:** chico · **Impacto:** bajo · **Riesgo:** bajo. *(No prioritario.)*

---

## 3. Developer experience

### 3.1 Script `test:coverage` faltante
No existe forma de medir cobertura. Agregar `"test:coverage": "vitest run --coverage"` (Vitest 4 trae provider v8 builtin; puede requerir `npm i -D @vitest/coverage-v8`).
- **Esfuerzo:** chico · **Impacto:** medio · **Riesgo:** nulo.

### 3.2 `noUncheckedIndexedAccess` en tsconfig
Todo el engine accede `Record<string, number>` con `state.groupRelations[ge.groupId] || 0` (patrón `|| 0`/`?? 0` repetido docenas de veces). Activar `noUncheckedIndexedAccess` convierte esos accesos en chequeados por el compilador (previene `NaN` silenciosos).
- **Archivos:** `tsconfig.app.json` + arreglar los errores que surjan (la mayoría ya tienen fallback).
- **Esfuerzo:** medio · **Impacto:** alto (bugs de `NaN`/undefined prevenidos) · **Riesgo:** medio (toca muchos archivos a la vez; hacerlo en PR aparte).

### 3.3 Consolidar `src/lib` vs `src/utils` y revisar `src/systems`
Hay dos carpetas de utilidades con responsabilidades solapadas (`lib/format.ts`, `lib/effect-helpers.ts`, `utils/*`), y `src/systems/` contiene **solo types** (huérfano de la migración). Unificar criterio (o documentarlo en `AGENTS.md`) reduce el "¿dónde va esto?".
- **Esfuerzo:** chico · **Impacto:** bajo · **Riesgo:** bajo (solo moves de imports).

### 3.4 Quitar import type inline
`turnProcessor.ts:251` usa `import('./engineShared').TurnResult` inline en la firma. Trivial.
- **Esfuerzo:** chico · **Impacto:** bajo · **Riesgo:** nulo.

### 3.5 Dividir `types/game.ts` (527 líneas)
Monolito de tipos mezclando estado, acciones, eventos, notificaciones, asesores. Dividir en `types/state.ts`, `types/actions.ts`, `types/events.ts` mejora navegación y reduce conflictos de merge.
- **Esfuerzo:** medio · **Impacto:** bajo-medio · **Riesgo:** bajo (solo re-exports).

---

## 4. Testabilidad

### 4.1 Factory `createTestGame()` + harness de partida
Hoy los tests usan `{} as GameState`. Una factory que construya un estado válido mínimo (posición, año/turno, grupos, relaciones) habilita tests de integración del engine real: "simular N turnos seguidos y verificar invariantes" (budget finito, popularidad en [0,100], no derrota espuria en partida pasiva).
- **Archivos:** nuevo `src/__tests__/helpers/createTestGame.ts`, `src/__tests__/integration.test.ts`.
- **Esfuerzo:** medio · **Impacto:** alto · **Riesgo:** nulo (código nuevo).

### 4.2 RNG inyectable (habilita tests deterministas de integración)
`Math.random()` está esparcido en `eventResolver.ts`, `engineShared.ts`, `turnProcessor.ts`. Centralizar en `rng()` exportado permite sembrarlo en tests (`vi.spyOn`) y hacer deterministas los tests de turno completo sin mock puntual por archivo.
- **Archivos:** `src/engine/rng.ts` + reemplazos puntuales.
- **Esfuerzo:** chico-medio · **Impacto:** alto · **Riesgo:** bajo (mismo comportamiento por defecto).

### 4.3 Smoke tests de UI (jsdom + Testing Library)
`environment: 'node'` en vitest.config impide renderizar componentes. Agregar `jsdom` + `@testing-library/react` y 3 smoke tests (App renderiza WelcomeScreen → creación de personaje → primer turno) da la primera red de seguridad de UI.
- **Archivos:** `vitest.config.ts` (proyectos/workspace), `src/__tests__/ui/app.smoke.test.tsx`.
- **Esfuerzo:** medio · **Impacto:** alto · **Riesgo:** bajo.

---

## 5. Automatización

### 5.1 CI mínima (GitHub Actions)
Un workflow de ~25 líneas: `npm ci` → `tsc --noEmit` → `eslint .` → `vitest run`. Hoy **nada de esto se valida de forma automática** (los 14 errores de lint existen precisamente por eso). Primero fijar la CI en modo "continue-on-error" para lint si se quiere desbloquear rápido.
- **Archivos:** nuevo `.github/workflows/ci.yml`.
- **Esfuerzo:** chico · **Impacto:** alto · **Riesgo:** nulo.

### 5.2 Validación de datos en CI
Integrar 1.4 como paso `npm run validate:data` (o como test) para que contenido roto nunca llegue a build.
- **Esfuerzo:** chico (si 1.4 existe) · **Impacto:** medio-alto · **Riesgo:** nulo.

### 5.3 Pre-commit hook
`lint-staged` + eslint --fix en commit. Opcional si la CI corre completa.
- **Esfuerzo:** chico · **Impacto:** medio · **Riesgo:** bajo (fricción en commits si la config es estricta).

---

## Plan priorizado (quick wins primero)

| # | Propuesta | Esfuerzo | Impacto | Riesgo | Por qué primero |
|---|-----------|----------|---------|--------|-----------------|
| 1 | **5.1 CI mínima** (tsc + eslint + vitest) | chico | alto | nulo | Frena toda regresión futura; sin esto, el resto del plan no se sostiene |
| 2 | **1.3 + 3.4** tipar `TurnResult` e import type | chico | medio | bajo | 10 minutos, elimina `any` en cadena de eventos |
| 3 | **1.1 copia de `completedObjectives`** en processEndTurn | chico | alto | bajo | Bug real de mutación de estado React |
| 4 | **3.1 script `test:coverage`** | chico | medio | nulo | Base de medición para la deuda de tests |
| 5 | **4.2 RNG inyectable** | chico | alto | bajo | Desbloquea tests deterministas de todo el engine |
| 6 | **1.2 EventModal sin cierre a ciegas** | chico | medio | bajo | Cierra exploit de balance |
| 7 | **2.1 useMemo ControlPanel** | chico | medio | bajo | Perf gratis en el panel más usado |
| 8 | **1.5 assertGameState / nullabilidad explícita** | chico | medio | bajo | Tipado que miente = bugs futuros |
| 9 | **1.4 + 5.2 validateGameData** | medio | alto | nulo | Red de seguridad para ~2000 líneas de datos sin validar |
| 10 | **4.1 createTestGame + test de integración** | medio | alto | nulo | Reemplaza fixtures `{} as GameState`, primer test E2E de engine |
| 11 | **5.3 pre-commit** | chico | medio | bajo | Automatiza lo que la CI encontraría tarde |
| 12 | **2.2 memo/useCallback** | medio | medio-alto | bajo-medio | Perf de UI; hacer con la app estable |
| 13 | **4.3 smoke tests UI** | medio | alto | bajo | Primera cobertura de componentes |
| 14 | **3.2 noUncheckedIndexedAccess** | medio | alto | medio | PR aparte, tras la CI verde |
| 15 | **2.3 atributos de img** | chico | bajo-medio | nulo | Pulido |
| 16 | **3.3 + 3.5 estructura/tipos** | medio | bajo | bajo | Limpieza, cuando sobre tiempo |
| 17 | **2.4 paginación GameLog** | chico | bajo | bajo | Solo si el historial crece |

**Secuencia sugerida de sprints:** Sprint A (1-2 días): #1-#5. Sprint B: #6-#10. Sprint C: #11-#14. El resto es contínuo.
