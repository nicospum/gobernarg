# PLAN FASE 1 — "El juego ya no es un paseo"

> Cambios concretos, línea por línea, basados en lectura directa de los archivos fuente.

---

## Resumen de cambios

| # | Archivo | Qué cambia | Impacto |
|---|---|---|---|
| 1 | `actionCalculator.ts` | Acciones base, bonus popularidad, bono político | Menos margen de acción |
| 2 | `victoryConditions.ts` | Umbrales de derrota por cargo | Perder es posible |
| 3 | `interactionCosts.ts` | `reunión` ya no es gratis | Cada interacción cuesta |
| 4 | `careerRules.ts` | `MAX_TERMS` intendente: 2 → 4 | Coincide con diseño |
| 5 | `actionCategories.ts` | Campo `availableForPositions` en cada acción | Intendente sin préstamo internacional |
| 6 | `gameEngine.ts` | Desgaste popularidad por cargo, ingreso neto, acciones base por cargo | Dificultad escalonada |

---

## 1. `src/utils/actionCalculator.ts`

### Cambio 1.1: Acciones base por cargo

```diff
 export function calculateAvailableActions(gameState: GameState): number {
-  let baseActions = 5;
+  const POSITION_BASE_ACTIONS: Record<Position, number> = {
+    intendente: 3,
+    gobernador: 2,
+    presidente: 1
+  };
+  let baseActions = POSITION_BASE_ACTIONS[gameState.position] ?? 3;
```

### Cambio 1.2: Bono político reducido

```diff
   if (gameState.archetype === 'politico') {
-    baseActions += 2;
+    baseActions += 1;
   }
```

### Cambio 1.3: Eliminar bonus por baja popularidad

```diff
   if (gameState.popularity >= 75) {
     baseActions += 1;
-  } else if (gameState.popularity < 25) {
-    baseActions += 2;
   }
```

---

## 2. `src/utils/victoryConditions.ts`

### Cambio 2.1: Umbrales de derrota por cargo

```diff
 const DEFEAT_CONDITIONS = {
-  LOW_POPULARITY_THRESHOLD: 15,
-  LOW_POPULARITY_TURNS: 3,
-  NEGATIVE_BUDGET_TURNS: 3
+  LOW_POPULARITY_THRESHOLD: {
+    intendente: 20,
+    gobernador: 25,
+    presidente: 30
+  },
+  LOW_POPULARITY_TURNS: 2,
+  NEGATIVE_BUDGET_TURNS: 2
 };

 export function checkDefeatConditions(gameState: GameState): boolean {
-  if (gameState.popularity < DEFEAT_CONDITIONS.LOW_POPULARITY_THRESHOLD) {
+  const threshold = DEFEAT_CONDITIONS.LOW_POPULARITY_THRESHOLD[gameState.position] ?? 20;
+  if (gameState.popularity < threshold) {
     if (gameState.consecutiveLowPopularity + 1 >= DEFEAT_CONDITIONS.LOW_POPULARITY_TURNS) {
       return true;
     }
   }
```

---

## 3. `src/utils/interactionCosts.ts`

### Cambio 3.1: `reunión` ya no es gratis

```diff
 const BASE_COSTS = {
-  reunion: 0,
+  reunion: 10,
   negociar: 25,
   conceder: 50
 };
```

---

## 4. `src/data/careerRules.ts`

### Cambio 4.1: Reelecciones de intendente

```diff
 export const MAX_TERMS: Record<Position, number> = {
-  intendente: 2,
+  intendente: 4,
   gobernador: 2,
   presidente: 2
 };
```

### Cambio 4.2: Dificultad de promoción (prepara para Fase 4, valores actualizados)

```diff
 export const PROMOTION_DIFFICULTY: Record<ElectionOption, number> = {
   reelection: 5,
-  'promote-governor': -10,
-  'promote-president': -25
+  'promote-governor': -15,   // más difícil
+  'promote-president': -40   // casi imposible desde intendente
 };
```

---

## 5. `src/types/game.ts`

### Cambio 5.1: Agregar `availableForPositions` a `GameAction`

En la interfaz `GameAction` (buscar `interface GameAction`), agregar:

```typescript
/** Cargos para los que está disponible esta acción. Si no se especifica, disponible para todos. */
availableForPositions?: Position[];
```

---

## 6. `src/data/actionCategories.ts`

### Cambio 6.1: Restringir acciones por cargo

Agregar `availableForPositions` a todas las acciones. Reglas:

| Categoría | Acciones disponibles para intendente | Bloqueadas para intendente |
|---|---|---|
| Economía | `subsidios_industriales`, `control_precios`, `fomento_emprendimiento`, `reduccion_gasto` | `emitir_dinero`, `mejorar_recaudacion`, `reforma_impositiva`, `incentivos_exportacion`, `aumento_salarial`, `prestamo_internacional`, `prestamo_local`, `atraccion_inversiones` |
| Diplomacia | `acuerdo_sindical`, `alianza_politica` | `tratado_comercio`, `cooperacion_internacional`, `acuerdo_ambiental`, `participacion_cumbres`, `mediacion_conflictos` |
| Seguridad | `seguridad_ciudadana`, `policia_proximidad`, `programa_desarme`, `prevencion_delito` | `lucha_narcotrafico`, `fortalecimiento_justicia`, `sistema_vigilancia` |
| Infraestructura | `transporte_publico`, `viviendas_rurales`, `reforestacion`, `infraestructura_vial`, `tratamiento_agua` | `energia_renovable`, `construccion_hospitales`, `modernizacion_aeropuertos`, `red_comunicaciones`, `red_gas` |
| Social | Todas disponibles | Ninguna |
| Cultura | Todas disponibles | Ninguna |
| Educación | `promover_educacion` | Ninguna |
| Turismo | `fomentar_turismo` | Ninguna |
| Tecnología | `desarrollar_tecnologia` | Ninguna |

**Gobernador:** similar a intendente pero con acceso a acciones regionales. Bloqueadas: `emitir_dinero` (solo presidente), `prestamo_internacional`, `tratado_comercio`.

**Presidente:** todas disponibles.

### Cambio 6.2: Ajustar valores de algunas acciones

```diff
 // emitir_dinero
-  popularityChange: 5,
+  popularityChange: 3,
-  budgetChange: 200,
+  budgetChange: 150,

 // prestamo_internacional
   budgetChange: 800,
+  futureEffects: [{ delay: 4, budgetChange: -100, popularityChange: -3 }],

 // prestamo_local
   budgetChange: 500,
+  futureEffects: [{ delay: 3, budgetChange: -75, popularityChange: -2 }],

 // reduccion_gasto
-  popularityChange: -15,
+  popularityChange: -20,

 // mejorar_recaudacion
-  popularityChange: -5,
+  popularityChange: -8,
```

---

## 7. `src/engine/gameEngine.ts`

### Cambio 7.1: Desgaste de popularidad por cargo

Buscar `NATURAL_POPULARITY_DECAY` y cambiar:

```diff
-const NATURAL_POPULARITY_DECAY = 3;
+const NATURAL_POPULARITY_DECAY: Record<Position, number> = {
+  intendente: 5,
+  gobernador: 7,
+  presidente: 10
+};
```

Y donde se usa (en `processEndTurn`, paso 4):

```diff
-  state.popularity -= NATURAL_POPULARITY_DECAY;
+  const decay = NATURAL_POPULARITY_DECAY[state.position] ?? 5;
+  state.popularity -= decay;
```

### Cambio 7.2: Ingreso neto ajustado

Buscar `POSITION_INCOME` y `POSITION_MAINTENANCE`:

```diff
 const POSITION_INCOME: Record<Position, number> = {
-  intendente: 250,
-  gobernador: 400,
-  presidente: 600
+  intendente: 200,
+  gobernador: 350,
+  presidente: 500
 };
 const POSITION_MAINTENANCE: Record<Position, number> = {
-  intendente: 100,
-  gobernador: 175,
-  presidente: 300
+  intendente: 120,
+  gobernador: 200,
+  presidente: 350
 };
```

Resultado neto: intendente +80, gobernador +150, presidente +150.

### Cambio 7.3: Presupuesto inicial intendente

```diff
 const POSITION_STARTING_BUDGET: Record<Position, number> = {
-  intendente: 1000,
+  intendente: 800,
   gobernador: 2000,
   presidente: 3500
 };
```

### Cambio 7.4: Filtrar acciones por cargo en `generatePossibleActions`

En `src/utils/actionGenerator.ts`, modificar `generatePossibleActions`:

```diff
 export function generatePossibleActions(gameState: GameState): GameAction[] {
   return actionCategories.flatMap(category =>
     category.actions.filter(action => {
+      // Filtrar por cargo
+      if (action.availableForPositions && !action.availableForPositions.includes(gameState.position)) {
+        return false;
+      }
       return action.requirements.minBudget <= gameState.budget &&
         (action.requirements.minPopularity === undefined || gameState.popularity >= action.requirements.minPopularity);
     })
   );
 }
```

### Cambio 7.5: Game over al terminar presidencia

En `processEndTurn`, después de verificar fin de mandato, agregar:

```typescript
// Si es presidente y ya cumplió MAX_TERMS, game over con victoria
if (state.position === 'presidente' && state.term >= MAX_TERMS['presidente']) {
  state.gameOver = true;
  state.victorious = checkVictoryConditions(state);
  return state;
}
```

---

## 8. Orden de implementación

| Paso | Archivo | Cambio |
|---|---|---|
| 1 | `types/game.ts` | Agregar `availableForPositions` a `GameAction` |
| 2 | `actionCategories.ts` | Agregar `availableForPositions` a TODAS las acciones + ajustar valores |
| 3 | `actionGenerator.ts` | Filtrar por cargo en `generatePossibleActions` |
| 4 | `actionCalculator.ts` | Acciones base por cargo, bonus ajustados |
| 5 | `victoryConditions.ts` | Umbrales de derrota por cargo |
| 6 | `interactionCosts.ts` | `reunión` cuesta 10 |
| 7 | `careerRules.ts` | `MAX_TERMS` intendente = 4 |
| 8 | `gameEngine.ts` | Desgaste, ingreso, presupuesto inicial, game over presidencia |

---

## 9. Resultado esperado

- **Intendente:** 3 acciones/turno, desgaste -5 popularidad, +80 ingresos netos, sin préstamos ni diplomacia internacional. Reelección hasta 4 veces.
- **Gobernador:** 2 acciones/turno, desgaste -7, +150 neto, sin emisión monetaria. Reelección hasta 2 veces.
- **Presidente:** 1 acción/turno, desgaste -10, +150 neto, todas las acciones disponibles pero con costo altísimo de equivocarse. 2 reelecciones máximo, game over después.
- **General:** perder es posible. 2 turnos consecutivos de popularidad <20/25/30 o presupuesto negativo → derrota. `reunión` ya no es gratis. Acciones bloqueadas por cargo fuerzan estrategia diferente en cada nivel.
