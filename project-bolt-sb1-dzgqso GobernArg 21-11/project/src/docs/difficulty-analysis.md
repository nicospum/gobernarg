# Análisis de dificultad — GobernArg

> Basado en lectura completa de `gameEngine.ts`, `turnManager.ts`, `actionEffects.ts`, `actionCalculator.ts`, `actionGenerator.ts`, `interactionCosts.ts`, `popularidad.ts`, `popularityCalculator.ts`, `actionCategories.ts`, `events/*.ts`, `electionSystem.ts`, `victoryConditions.ts`, `gameCalculations.ts`.

---

## Resumen ejecutivo

**GobernArg es fácil porque el jugador tiene demasiadas herramientas gratuitas, cero consecuencias a largo plazo por repetir acciones, y los umbrales de derrota son tan bajos que casi nunca se activan sin negligencia extrema.**

---

## 1. Por qué GobernArg es actualmente muy fácil

### 1.1 Acciones netamente positivas y repetibles sin costo

| Acción | Popularidad | Presupuesto | minBudget | Problema |
|---|---|---|---|---|
| `emitir_dinero` | +5 | +200 | 0 | Gratis, gana popularidad Y dinero. |
| `prestamo_internacional` | -5 | +800 | 0 | Ingreso masivo sin requisitos. |
| `prestamo_local` | -3 | +500 | 0 | Mismo problema, escala menor. |
| `reduccion_gasto` | -15 | +300 | 0 | Costo cero, recupera presupuesto. |
| `mejorar_recaudacion` | -5 | +250 | 100 | Muy rentable. |

No hay inflación, límite de deuda, default, ni penalización por emitir dinero repetidamente. El `moneyPrintingCount` se incrementa pero solo activa una advertencia a partir de 3 usos; no tiene efectos mecánicos reales.

### 1.2 Sin rendimientos decrecientes ni cooldowns en acciones

- Ninguna acción pierde eficacia al repetirse.
- No hay límite de usos por acción.
- Las acciones "doradas" (+20 popularidad, bajo costo) se pueden spammear turno tras turno sin degradación.
- Las interacciones con grupos tienen cooldown de 2 turnos por subgrupo, pero las acciones normales no.

### 1.3 Combo económico roto

```
Turno 1: prestamo_internacional → +800 presupuesto, -5 popularidad
Turno 2: seguridad_ciudadana → -400, +20 popularidad (puede ser ×1.56 con arquetipo+asesor)
Repetir prestamo_local / emitir_dinero para financiar acciones sociales infinitamente.
```

Resultado: el jugador nunca enfrenta restricción presupuestaria real.

### 1.4 Muchas acciones por turno

```ts
baseActions = 5
+ político → +2        // 7
+ asesores (1~3)       // +1~3 extra
+ popularidad ≥ 75 → +1
+ popularidad < 25 → +2  // Contraproducente: regala acciones cuando estás mal
```

Un político con 2 asesores y popularidad 80 tiene **10 acciones por turno**. Con 10 acciones se puede contrarrestar cualquier evento negativo y sobra.

### 1.5 Popularidad fácil de mantener

- Casi todas las acciones dan `popularityChange` positivo (+8 a +20).
- Multiplicadores de arquetipo + asesor pueden llevar una acción a ×1.56 antes del factor 0.55.
- `reunión` con grupos cuesta 0 de presupuesto, 1 acción, y sube apoyo +5.
- Desgaste natural de popularidad: solo -3 por turno.
- El comunicador empieza con 70 de popularidad base.

### 1.6 Umbrales de derrota demasiado generosos

- **Popularidad < 15% durante 3 turnos consecutivos.** Para llegar ahí hay que ignorar el juego completamente.
- **Presupuesto negativo 3 turnos consecutivos.** Con préstamos y emisión infinita, casi imposible.
- No hay derrota por estabilidad baja, por perder elecciones de medio término, por impeachment, por golpe, ni por inflación descontrolada.

### 1.7 Eventos negativos no escalan con el progreso

- Las crisis pegan fuerte (-20 a -25 popularidad), pero:
  - Son aleatorias y poco frecuentes.
  - No aumentan en severidad en años avanzados.
  - No se encadenan (una crisis no dispara otra).
  - No hay eventos que bloqueen acciones del jugador.
- Los eventos positivos (inversión extranjera +400, coalición +15) contrarrestan fácilmente.

### 1.8 Las elecciones son fáciles de ganar

- Umbral: 45% de votos.
- La popularidad pesa 35% en la fórmula, y es lo más fácil de subir.
- La estabilidad solo pesa 5%, con lo cual ignorarla no castiga.
- Bonus de presupuesto positivo (+5%) es automático si no estás en negativo.

---

## 2. Palancas concretas para aumentar la dificultad

Ordenadas de menor a mayor esfuerzo de implementación.

### 🔴 Nivel 1 — Ajustes numéricos (rápido, alto impacto)

| Cambio | Valor actual | Valor sugerido | Efecto |
|---|---|---|---|
| Desgaste natural de popularidad | -3/turno | -5/turno (intendente), -7 (gobernador), -10 (presidente) | Obliga a trabajar la popularidad |
| Acciones base | 5 | 3 (intendente), 2 (gob.), 1 (presidente) | Presidente tiene menos margen |
| Bono arquetipo político | +2 | +1 | Sigue siendo ventaja pero no abrumadora |
| Costo de interacción `reunión` | 0 | 10 (intendente), 15 (gob.), 20 (presidente) | Ya no es gratis |
| Umbral derrota popularidad | <15% × 3 turnos | <20% × 2 turnos (intendente), <25% × 2 turnos (gob.), <30% × 2 turnos (presidente) | Pierde sentido la dificultad progresiva |
| Presupuesto inicial intendente | 1000 | 800 | Arranque más ajustado |
| Ingreso neto por turno | +150, +225, +300 | +100, +150, +200 | Menos holgura fiscal |
| Bonus popularidad baja | +2 acciones si pop < 25 | Eliminarlo | No premiar estar mal |
| Factor global de popularidad | ×0.55 | ×0.40 | Las acciones rinden menos |

### 🟡 Nivel 2 — Mecánicas nuevas (esfuerzo medio, ya diseñadas en future-engine-features.md)

1. **Rendimientos decrecientes en acciones**
   - Contador de usos por acción. Cada uso repetido reduce efectividad en 15-20%.
   - Tras 4-5 usos, el efecto puede invertirse (ej. `emitir_dinero` empieza a dar inflación → pérdida de popularidad).
   - Acciones "doradas" con efectividad inicial alta que decae rápido.

2. **Inflación real por emisión monetaria**
   - `moneyPrintingCount ≥ 3` → -5 popularidad/turno adicional, -50 presupuesto/turno.
   - `moneyPrintingCount ≥ 5` → crisis inflacionaria garantizada, -20 popularidad, -300 presupuesto.
   - Hace que `emitir_dinero` sea una decisión de emergencia real, no un cheat.

3. **Límite de deuda**
   - Préstamos tienen un máximo de 2-3 por partida.
   - Cada préstamo reduce el ingreso fiscal en 10% (servicio de deuda).
   - Tercer préstamo → penalización de popularidad adicional y riesgo de default.

4. **Consecuencias diferidas en acciones**
   - Las acciones grandes (`budgetChange ≥ 200`) agregan efectos diferidos 2-4 turnos después.
   - Ejemplo: `infraestructura_vial` (-500, +15 pop inmediato) → 3 turnos después: -100 presupuesto (mantenimiento).
   - El jugador ve los efectos diferidos en `PendingEffectsPanel` y debe planificar.

5. **Requisitos de asesores y grupos en generación de acciones**
   - Arreglar `generatePossibleActions` para que use `isActionAvailable`.
   - Bloquear acciones que requieran asesor específico o apoyo mínimo de grupo.
   - Esto reduce las opciones disponibles y fuerza estrategia.

6. **Calendario político con eventos programados**
   - Ya detallado en `future-engine-features.md` §4 y §8.
   - Las elecciones de medio término y los hitos del calendario estructuran la partida.
   - La opción de "acelerar/negociar/abrirse" post-legislativas da peso estratégico.

7. **Notificaciones y advertencias visibles**
   - Ya detallado en `future-engine-features.md` §2 y §3.
   - No cambia la dificultad directamente, pero hace que el jugador **sienta** la presión.

### 🟢 Nivel 3 — Sistemas nuevos (mayor esfuerzo, transforman el juego)

1. **Legitimidad como recurso invisible**
   - Las medidas impopulares requieren legitimidad para funcionar.
   - Se gana cumpliendo promesas/objetivos, convocando, explicando (acciones de comunicación).
   - Se pierde con decretos forzados, mentiras, crisis no resueltas.
   - Si legitimidad llega a 0 → las acciones cuestan el doble.

2. **Ejes de prioridad contradictorios**
   - Variables continuas: `radical ↔ conciliador`, `populista ↔ técnico`, `cerrado ↔ convocante`.
   - Elegir acciones consistentemente en un eje da bonos, pero cerrar puertas en el otro.
   - El final de partida evalúa el equilibrio, no solo si ganaste.

3. **Grupos de interés con agendas propias**
   - No solo reaccionan a tus acciones: tienen demandas, líderes, estados de ánimo.
   - Si ignorás a un grupo demasiado tiempo, se radicaliza y genera crisis.
   - Si favorecés siempre al mismo, los otros se resienten más rápido.

4. **Sistema de dificultad por partida**
   - Fácil: valores actuales. Base para aprender.
   - Normal: valores del Nivel 1 aplicados. Rendimientos decrecientes.
   - Difícil: Nivel 1 + Nivel 2 + crisis más frecuentes (probabilidad ×1.5), sin préstamos, eventos negativos más severos.
   - Leyenda: Nivel 3 completo + Ironman (sin guardar, un solo slot).

5. **Derrota por vías alternativas**
   - Impeachment: popularidad < 10% + estabilidad < 20% × 2 turnos → game over.
   - Golpe institucional: estabilidad < 10% + legislativeSupport < 25% × 3 turnos.
   - Inflación descontrolada: moneyPrintingCount ≥ 7.
   - Perder elección: no es game over, pero perdés el cargo y pasás a pantalla de legado.

---

## 3. Priorización recomendada

| Orden | Qué hacer | Dónde está diseñado | Impacto |
|---|---|---|---|
| 1 | Ajustes numéricos (Nivel 1) | Este documento | Alto inmediato |
| 2 | Rendimientos decrecientes | future-engine-features.md §3 (principio "la dosis hace al veneno") | Muy alto |
| 3 | Inflación real por emisión | Nuevo (derivado de §3) | Alto |
| 4 | Arreglar `generatePossibleActions` | future-engine-features.md §6 | Medio |
| 5 | Consecuencias diferidas en acciones | future-engine-features.md §1 ("Toda decisión tiene costo") | Alto |
| 6 | Calendario político + elecciones medio término | future-engine-features.md §4, §7, §8 | Muy alto |
| 7 | Habilidades de arquetipos | future-engine-features.md §1 | Medio |
| 8 | Notificaciones y advertencias | future-engine-features.md §2, §3 | Medio (UX) |
| 9 | Grupos con agendas propias | roadmap.md Fase 4 | Alto |
| 10 | Legitimidad y ejes contradictorios | future-engine-features.md §6, §7, §9 | Transformacional |
| 11 | Sistema de dificultad | roadmap.md Fase 5 | Empaqueta todo |

---

## 4. Plan de implementación por fases

### Fase A — "El juego ya no es un paseo" (1-2 sesiones)
Hacer los ajustes numéricos del Nivel 1 directamente en `src/utils/actionCalculator.ts`, `src/engine/gameEngine.ts`, `src/utils/victoryConditions.ts`, `src/utils/interactionCosts.ts` y `src/data/actionCategories.ts`.

### Fase B — "Las decisiones tienen memoria" (2-3 sesiones)
Implementar rendimientos decrecientes, inflación real y consecuencias diferidas. Actualizar `processEndTurn` en `gameEngine.ts` y el tipo `GameState` en `types/game.ts`.

### Fase C — "Gobernar es elegir qué perder" (3-4 sesiones)
Calendario político completo, requisitos de asesores/grupos, elecciones de medio término con ramificaciones estratégicas.

### Fase D — "El poder se gasta" (4+ sesiones)
Legitimidad, ejes contradictorios, grupos con agendas, derrotas alternativas, sistema de dificultad.

---

## 5. Mecánicas nuevas definidas por el diseñador (22/06/2026)

### 5.1 Acciones diferenciadas por cargo

**Problema actual:** todas las acciones están disponibles para los 3 cargos por igual. Un intendente puede pedir un préstamo internacional, lo cual no tiene sentido.

**Regla:** cada acción debe declarar para qué cargos está disponible.

| Cargo | Acciones exclusivas | Acciones bloqueadas |
|---|---|---|
| **Intendente** | Obras municipales, programas barriales, eventos culturales locales, seguridad ciudadana básica | Préstamo internacional, tratados comerciales, reforma impositiva nacional, defensa, relaciones exteriores |
| **Gobernador** | Coordinación intermunicipal, policía provincial, infraestructura regional, educación provincial | Tratados internacionales, defensa nacional, emisión monetaria |
| **Presidente** | Tratados internacionales, defensa, emisión monetaria, reforma constitucional, relaciones exteriores | Programas barriales (ineficiente), eventos culturales locales (irrelevante) |

**Implementación:** agregar campo `availableForPositions: Position[]` a `GameAction`. Modificar `generatePossibleActions` para filtrar por `state.position`.

---

### 5.2 Árbol de desbloqueo de acciones

**Problema actual:** todas las acciones están disponibles desde el turno 1 si tenés presupuesto suficiente.

**Regla:** algunas acciones requieren acciones previas completadas (prerrequisitos), apoyo en el congreso, o cierto nivel de legitimidad.

**Ejemplos de prerequisitos:**

| Acción | Requiere |
|---|---|
| `reforma_impositiva` | `mejorar_recaudacion` completada + `legislativeSupport >= 45` |
| `tratado_comercial` | `mision_diplomatica` completada + `groupRelations['empresarios'] >= 60` |
| `infraestructura_vial` | `estudio_factibilidad` completada (nueva acción previa) |
| `programa_vivienda` | `apoyo_sindicatos >= 50` Y `presupuesto >= 800` |
| `reforma_constitucional` | Presidente + `legislativeSupport >= 65` + `legitimidad >= 70` |
| `plan_seguridad_nacional` | `fortalecimiento_judicial` completado + `groupRelations['sindicatos_policiales'] >= 50` |

**Implementación:** campo `prerequisites: { requiredActions?: string[], minLegislativeSupport?: number, minLegitimacy?: number, minGroupSupport?: Record<string, number> }` en `GameAction`.

---

### 5.3 Cooldowns en acciones

**Problema actual:** podés usar la misma acción todos los turnos sin restricción.

**Regla:** cada acción tiene un cooldown (en turnos) después de usarse. Durante el cooldown no aparece disponible o aparece bloqueada.

| Tipo de acción | Cooldown sugerido |
|---|---|
| Acciones pequeñas (costo < 200, popularidad < 10) | 1 turno (podés usarla turno por medio) |
| Acciones medianas (costo 200-500) | 2-3 turnos |
| Acciones grandes (costo > 500, reformas) | 4-6 turnos |
| Acciones de emergencia (emitir_dinero) | 4 turnos |
| Préstamos | 8 turnos (solo 2 por mandato efectivamente) |

**Visualización:** la carta de acción muestra "Disponible en X turnos" con un contador.

**Implementación:** campo `cooldown: number` en `GameAction`. `GameState` mantiene `actionCooldowns: Record<string, number>`. En `processEndTurn` se decrementan todos los cooldowns.

---

### 5.4 Impactos cruzados entre grupos de interés

**Problema actual:** las acciones afectan grupos individualmente. No hay trade-off entre grupos antagónicos.

**Regla:** cuando un grupo gana apoyo significativo, sus grupos antagonistas pierden apoyo proporcionalmente.

**Matriz de antagonismos:**

| Si gana apoyo... | Pierden apoyo automáticamente... |
|---|---|
| Empresarios / Sector Financiero | Sindicatos (-50% de lo ganado), Sectores Populares (-30%) |
| Sindicatos / Sectores Populares | Empresarios (-50%), Clase Alta (-40%) |
| Ambientalistas | Sector Agrícola (-40%), Sector Financiero (-20%) |
| Feministas | Iglesia (-30%), Sectores Conservadores (-30%) |
| Aliados (partido oficialista) | Opositores (-60%) |
| Académicos / Científicos | (sin antagonistas fuertes — grupo "neutral") |

**Fórmula:**
```ts
function applyCrossGroupEffects(supportChanges: Record<string, number>, state: GameState): GameState {
  for (const [groupId, change] of Object.entries(supportChanges)) {
    if (change > 0) {
      const antagonists = GROUP_ANTAGONISTS[groupId] || [];
      for (const [antagonistId, ratio] of Object.entries(antagonists)) {
        state.groupRelations[antagonistId] -= change * ratio;
      }
    }
  }
  return state;
}
```

**Importancia:** esto hace que conceder a un sector tenga costo político real con otros. No se puede tener a todos contentos.

---

### 5.5 Impactos multidimensionales en acciones

**Problema actual:** la mayoría de acciones solo afectan popularidad y presupuesto.

**Regla:** cada acción debe declarar efectos sobre múltiples dimensiones.

**Dimensiones de efecto por acción:**
```ts
interface ActionEffects {
  popularityChange: number;       // ya existe
  budgetChange: number;           // ya existe
  stabilityChange?: number;       // nuevo
  legitimacyChange?: number;      // nuevo
  votingIntentionChange?: number; // nuevo (afecta intención de voto directa)
  groupEffects: {                 // ya existe pero mejorado
    [groupId: string]: number;
  };
  crossGroupEffects?: boolean;    // nuevo: si aplica la matriz de antagonismos
}
```

**Ejemplos concretos:**

| Acción | Pop | Budget | Estabilidad | Legitimidad | Grupos |
|---|---|---|---|---|---|
| `conceder_financiero` | -5 | -200 | +5 | -10 | financiero:+25, sindicatos:-8, populares:-4 |
| `reprimir_protesta` | -20 | -50 | +15 | -25 | sindicatos:-15, populares:-10, empresarios:+5 |
| `discurso_nacional` | +10 | 0 | +3 | +8 | aliados:+5 |
| `reforma_impositiva` | -15 | +300 | -5 | -10 | empresarios:+10, clase_alta:+8, populares:-12 |
| `plan_social_masivo` | +25 | -600 | -3 | +5 | populares:+15, sindicatos:+10, empresarios:-8 |

---

### 5.6 Sistema de reelecciones y términos

**Problema actual:** no se leyeron las reglas exactas de reelección en `careerRules.ts`, pero según el diseñador:

| Cargo | Reelecciones máximas | Total de mandatos posibles |
|---|---|---|
| Intendente | **4** (puede gobernar hasta 5 períodos) | 5 mandatos = 20 años |
| Gobernador | **2** (3 períodos máximo) | 3 mandatos = 12 años |
| Presidente | **2** (3 períodos máximo según el diseñador, PDF dice máximo 2 mandatos) | 3 mandatos = 12 años → **FIN DEL JUEGO** |

**Regla clave:** el juego termina después de la segunda reelección presidencial (fin del tercer mandato como presidente). Pantalla de legado final.

**Implementación:** verificar `MAX_TERMS` en `careerRules.ts` y ajustar si es necesario. Agregar condición en `checkDefeat` o `processEndTurn` que dispare `GAME_COMPLETE` después de `presidente && term >= MAX_TERMS`.

---

### 5.7 Dificultad progresiva de ascenso

**Problema actual:** promocionarse de intendente a gobernador o presidente es binario (cumplís popularidad o no).

**Regla:** la dificultad de ganar una elección para un cargo superior depende de cuántas reelecciones tuviste en tu cargo actual. La "chapa" (experiencia) pesa.

**Fórmula de penalización por ascenso:**

| De → A | 1er mandato (sin reelección) | 1 reelección | 2 reelecciones | 3+ reelecciones |
|---|---|---|---|---|
| Intendente → Gobernador | Penalización **-25%** votos | -15% | -8% | **-3%** |
| Intendente → Presidente | Penalización **-40%** votos | -30% | -20% | **-12%** |
| Gobernador → Presidente | Penalización **-20%** votos | -12% | -5% | N/A |

**Justificación:** un intendente reelecto 4 veces tiene maquinaria política, nombre y estructura para aspirar a más. Un intendente de un solo mandato que salta a presidente es un "don nadie" a nivel nacional y debería ser casi imposible.

**Implementación:**
```ts
function calculatePromotionPenalty(
  from: Position,
  to: Position,
  termsCompleted: number
): number {
  const PENALTIES = {
    'intendente->gobernador': [0.25, 0.15, 0.08, 0.03],
    'intendente->presidente':  [0.40, 0.30, 0.20, 0.12],
    'gobernador->presidente':  [0.20, 0.12, 0.05],
  };
  const key = `${from}->${to}`;
  const table = PENALTIES[key];
  const index = Math.min(termsCompleted - 1, table.length - 1);
  return table[Math.max(0, index)];
}
```

---

## 6. Plan de implementación revisado (incorpora mecánicas nuevas)

### Fase 1 — "El juego ya no es un paseo" (prioridad: URGENTE)
Ajustes numéricos + **diferenciación de acciones por cargo** (§5.1) + **límites de reelección** (§5.6).

**Archivos:** `actionCalculator.ts`, `gameEngine.ts`, `victoryConditions.ts`, `interactionCosts.ts`, `actionCategories.ts`, `careerRules.ts`, `actionGenerator.ts`, `types/game.ts`.

### Fase 2 — "Las decisiones tienen memoria" (prioridad: ALTA)
Rendimientos decrecientes + inflación + efectos diferidos + **cooldowns en acciones** (§5.3) + **impactos multidimensionales** (§5.5).

**Archivos:** `gameEngine.ts`, `actionCalculator.ts`, `actionEffects.ts`, `types/game.ts`.

### Fase 3 — "Gobernar es elegir qué perder" (prioridad: ALTA)
Calendario político + elecciones medio término + **árbol de desbloqueo** (§5.2) + **impactos cruzados entre grupos** (§5.4).

**Archivos:** `gameEngine.ts`, `actionGenerator.ts`, `types/game.ts`, `interestGroups.ts`, componentes UI nuevos.

### Fase 4 — "El poder se gasta" (prioridad: MEDIA)
Legitimidad + ejes contradictorios + **dificultad progresiva de ascenso** (§5.7) + derrotas alternativas + habilidades de arquetipos + sistema de dificultad.

**Archivos:** `electionSystem.ts`, `gameEngine.ts`, `types/game.ts`, `victoryConditions.ts`, nuevos módulos.
