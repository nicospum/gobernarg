# Ideas útiles para integrar en `src/engine/gameEngine.ts`

Este documento rescata funcionalidad de los sistemas, hooks y componentes que fueron eliminados durante la limpieza, pero que pueden volver a integrarse directamente sobre el motor actual (`gameEngine.ts`) cuando se necesiten.

---

## 1. Habilidades especiales de arquetipos

**De dónde venía:** `src/systems/archetypes/` + `useArchetype` + `SpecialAbilitiesPanel`.

**Qué hacía:** cada arquetipo tenía una habilidad activable con cooldown y costo:

- **Político:** "Discurso patriótico" → +popularidad general, coste bajo.
- **Empresario:** "Inversión privada" → +presupuesto a cambio de -apoyo sindical.
- **Sindicalista:** "Movilización social" → +apoyo de grupos sociales, -estabilidad.
- **Comunicador:** "Campaña mediática" → +popularidad política, -presupuesto.

**Cómo integrarlo en `gameEngine.ts`:**

```ts
interface SpecialAbility {
  id: string;
  name: string;
  cooldown: number;
  cost: { budget?: number; popularity?: number };
  effect: (state: GameState) => GameState;
}

const ABILITIES: Record<Archetype, SpecialAbility> = {
  politico: { id: 'discurso_patriotico', name: 'Discurso patriótico', cooldown: 4, ... },
  // ...
};

// En GameState agregar:
// abilityCooldowns: Record<string, number>

export function useSpecialAbility(gameState: GameState, abilityId: string): GameState {
  // verificar cooldown, aplicar costo y efecto, resetear cooldown
}
```

**UI:** `SpecialAbilitiesPanel` muestra el botón con cooldown restante.

---

## 2. Centro de notificaciones

**De dónde venía:** `src/systems/notifications/` + `useNotifications` + `NotificationCenter`/`NotificationModal`.

**Qué hacía:** acumular alertas del juego (eventos, objetivos completados, advertencias) en una lista con:

- Importancia (`low`, `medium`, `high`, `critical`).
- Acciones asociadas (ej. "Ver evento", "Descartar").
- Agrupación por categoría.
- Marcado como leído.

**Cómo integrarlo en `gameEngine.ts`:**

```ts
interface Notification {
  id: string;
  type: 'event' | 'objective' | 'warning' | 'election';
  importance: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  actions?: { label: string; actionId: string }[];
  read: boolean;
  turn: number;
}

// En GameState agregar:
// notifications: Notification[]

export function addNotification(state: GameState, notification: Omit<Notification, 'id' | 'turn'>): GameState;
export function markNotificationRead(state: GameState, id: string): GameState;
```

**Dónde generarlas:**
- Al completar un objetivo.
- Al dispararse una crisis.
- Al entrar en año electoral.
- Al bajar de umbral de popularidad/presupuesto.

---

## 3. Advertencias y tendencias de indicadores

**De dónde venía:** `src/systems/indicators/` + `useIndicators`.

**Qué hacía:**

- **Warnings:** alertas cuando un indicador cruza umbrales críticos (popularidad < 20, presupuesto negativo, etc.).
- **Trends:** dirección del indicador (↑ estable, ↓ en caída) calculado con los últimos N turnos.
- **Modifiers:** factores contextuales que afectan los indicadores (crisis, emisiones de dinero, apoyo grupal).
- **Historial detallado:** guardar por qué cambió un indicador cada turno.

**Cómo integrarlo en `gameEngine.ts`:**

```ts
interface IndicatorSnapshot {
  turn: number;
  popularity: number;
  budget: number;
  stability: number;
  sources: { source: string; value: number }[];
}

// En GameState agregar:
// indicatorHistory: IndicatorSnapshot[]
// indicatorWarnings: { indicator: string; severity: string; message: string }[]

function updateWarnings(state: GameState): GameState {
  const warnings = [];
  if (state.popularity < 20) warnings.push({ indicator: 'popularity', severity: 'critical', message: 'Riesgo de revocatoria' });
  if (state.budget < 0) warnings.push({ indicator: 'budget', severity: 'critical', message: 'Déficit fiscal' });
  // ...
  return { ...state, indicatorWarnings: warnings };
}
```

**UI:** mostrar warnings en `IndicatorsPanel` o en una barra de alertas flotante.

---

## 4. Eventos programados / calendario político

**De dónde venía:** `src/systems/turns/defaultCalendar.ts` + `TurnManager`.

**Qué hacía:** definir eventos que ocurren en fechas fijas del calendario político:

- Año 1, Trimestre 2: "Apertura de sesiones ordinarias".
- Año 2, Trimestre 4: "Discusión del presupuesto".
- Año 4, Trimestre 2: "Campaña electoral".

**Cómo integrarlo en `gameEngine.ts`:**

```ts
interface CalendarEvent {
  year: number;
  turn: number;
  title: string;
  description: string;
  effect?: (state: GameState) => GameState;
}

const DEFAULT_CALENDAR: CalendarEvent[] = [
  { year: 1, turn: 2, title: 'Apertura de sesiones', description: '...' },
  // ...
];

// En processEndTurn, antes de los eventos aleatorios:
function processCalendarEvents(state: GameState): GameState {
  const events = DEFAULT_CALENDAR.filter(e => e.year === state.year && e.turn === state.turn);
  events.forEach(e => { /* aplicar efecto o agregar notificación */ });
  return state;
}
```

---

## 5. Eventos con probabilidad y condiciones más ricas

**De dónde venía:** `src/systems/events/eventProbabilityCalculator.ts` + `eventUtils.ts`.

**Qué hacía:** calcular probabilidad de eventos en base a múltiples factores:

- Popularidad actual.
- Presupuesto.
- Estabilidad.
- Historial de acciones recientes.
- Año electoral.

**Cómo integrarlo en `gameEngine.ts`:**

Reemplazar la función `resolveRandomEvents` por una más sofisticada que, para cada evento, compute:

```ts
function calculateEventProbability(event: GameEvent, state: GameState): number {
  let prob = event.baseProbability || 0;
  if (state.popularity < 30) prob += 0.1;
  if (state.budget < 0) prob += 0.1;
  if (state.stability < 30) prob += 0.15;
  // ...
  return Math.min(1, prob);
}
```

Esto evita que eventos positivos/negativos aparezcan de forma completamente aleatoria.

---

## 6. Acciones políticas avanzadas

**De dónde venía:** `src/systems/actions/actionManager.ts`.

**Qué hacía:** validar requisitos complejos de acciones:

- Asesor específico contratado.
- Relación mínima con un grupo de interés.
- Cargo mínimo (Intendente/Gobernador/Presidente).
- Efectos encadenados (una acción desbloquea otra).

**Cómo integrarlo en `gameEngine.ts`:**

Actualmente `getAvailableActionsForState` filtra solo por presupuesto y popularidad. Se puede extender:

```ts
function canExecuteAction(action: GameAction, state: GameState): boolean {
  if (action.requirements.advisorRequired) {
    return state.advisors.some(a => a.id === action.requirements.advisorRequired && a.isActive);
  }
  if (action.requirements.minGroupSupport) {
    return Object.entries(action.requirements.minGroupSupport).every(
      ([groupId, min]) => (state.groupRelations[groupId] || 0) >= min
    );
  }
  return true;
}
```

---

## 7. Sistema electoral alternativo / elecciones de medio término

**De dónde venía:** `src/systems/elections/electionManager.ts`.

**Qué hacía:** simular elecciones de medio término (año 2) además de las generales (año 4).

**Cómo integrarlo en `gameEngine.ts`:**

```ts
function checkMidtermElection(state: GameState): GameState {
  if (state.year === 2 && state.turn === 4) {
    // Evaluar bancada / apoyo legislativo
    const support = calculateLegislativeSupport(state);
    state.legislativeSupport = support;
    addNotification(state, { type: 'election', title: 'Elecciones de medio término', ... });
  }
  return state;
}
```

El apoyo legislativo podría afectar la efectividad de ciertas acciones (ej. reformas impositivas).

---

## 8. Calendario político y elecciones de medio término

**De dónde venía:** `src/systems/turns/defaultCalendar.ts` + la discusión sobre política argentina real.

**Qué hace:** introduce hitos fijos durante el mandato que estructuran la partida.

### Momentos clave del calendario

- **Año 1, Trimestre 2:** Apertura de sesiones ordinarias. Pequeño bono de legitimidad.
- **Año 1, Trimestre 4:** Primer informe de gestión. Evaluación temprana.
- **Año 2, Trimestre 2:** Inicio de campaña legislativa.
- **Año 2, Trimestre 4:** **Elecciones de medio término**.
- **Año 3, Trimestre 2:** Definición de estrategia post-legislativa.
- **Año 4, Trimestre 2:** Inicio de campaña presidencial.
- **Año 4, Trimestre 4:** Elecciones generales.

### Modelo de elecciones legislativas

El resultado mide porcentaje de votos del oficialismo:

| % oficialismo | Situación parlamentaria | Efecto |
|---|---|---|
| **>45%** | Victoria contundente, mayoría propia amplia | Reformas cuestan -1 acción, +10 estabilidad, pero riesgo de eventos de desgaste por sobreconfianza. |
| **42-45%** | Victoria clara, mayoría propia cómoda | Situación favorable, reformas normales, oposición contenida. |
| **38-41%** | Quorum propio pero justo | Perdiste bancas. Reformas normales, oposición presiona más. |
| **35-37%** | Paridad de tercios, sin quorum | Reformas cuestan +1 acción, obligás a negociar. |
| **<35%** | Derrota clara | Congreso hostil, reformas grandes bloqueadas o con +2 acciones, eventos de crisis frecuentes. |

### Estrategias post-legislativas

Después del resultado, el jugador enfrenta dilemas concretos que representan su postura:

- **Acelerar / radicalizar:** amplifica efectos de acciones, alto riesgo de choque. Peligroso si se ganó fuerte ("pasarse de rosca").
- **Aflojar / negociar:** acciones grandes cuestan más, ganás estabilidad gradualmente. Si ganaste fuerte, te hace ver débil.
- **Abrirse / armar coaliciones (disponible si ≥38%):** convocás a otros sectores. +estabilidad, menor riesgo de choque, mejor intención de voto a largo plazo. Costo: cedés presupuesto o popularidad con tu base.
- **Jugada audaz:** evento especial único, arriesgado, depende del arquetipo.

La clave es que **ganar las legislativas no hace el juego más fácil automáticamente**, sino que abre mejores opciones estratégicas.

---

# Principios filosóficos del juego

Estos principios definen qué tipo de experiencia política queremos que GobernArg transmita. No deben aparecer como texto explícito en el juego, sino que deben emerger de las mecánicas.

## 1. El camino no es recto, es sinuoso

**Idea:** una medida puede ser buena hoy y mala mañana. Una decisión impopular puede salvarte después; una popular puede destruirte en tres turnos.

**Cómo plasmarlo:**

- Acciones con **multiplicadores contextuales**. El mismo ajuste es distinto en crisis fiscal que en recesión social.
- **Efectos diferidos y sorpresivos.** Algunas consecuencias aparecen varios turnos después.
- No hay acciones "siempre correctas". El jugador debe leer el momento.

## 2. Toda decisión tiene costo

**Idea:** no existe la acción perfecta. Siempre perdés algo.

**Cómo plasmarlo:**

- Costos **multidimensionales** en cada acción: presupuesto, popularidad, apoyo de grupos, estabilidad, capital político, legitimidad.
- Las cartas de acción muestran claramente qué se gana y qué se pierde.
- No se puede elegir algo que solo sume.

## 3. La dosis hace al veneno

**Idea:** ninguna herramienta es intrínsecamente buena o mala. El problema es el exceso o el mal timing.

**Cómo plasmarlo:**

- **Rendimientos decrecientes:** cada acción tiene un contador de uso. Repetirla muchas veces reduce su efectividad y puede invertir el resultado.
- **Acciones "doradas" iniciales:** algunas medidas parecen muy beneficiosas al principio, pero abusar de ellas se vuelve tóxico.
- Informar al jugador a través de titulares del diario, no con advertencias directas.

## 4. No se puede maximizar todo al mismo tiempo

**Idea:** gobernar es decidir qué sacrificar para sostener lo importante.

**Cómo plasmarlo:**

- Ejes de prioridad contradictorios: crecimiento vs. distribución, orden fiscal vs. bienestar social, autonomía vs. alianzas.
- Objetivos que se oponen entre sí.
- El final de partida evalúa el equilibrio alcanzado, no solo si ganaste.

## 5. La estabilidad vale más que la épica

**Idea:** a veces la mejor decisión no es la más brillante, sino la que evita que todo explote.

**Cómo plasmarlo:**

- Bonus por mantener indicadores estables durante varios turnos.
- Penalización por alta volatilidad (subir y bajar muy rápido).
- Victorias "aburridas" posibles: "Sostuviste el país en pie".

## 6. La legitimidad es un recurso

**Idea:** una medida correcta técnicamente puede fracasar si no tenés apoyo social para sostenerla.

**Cómo plasmarlo:**

- Agregar **legitimidad** como recurso invisible.
- Medidas impopulares requieren legitimidad para funcionar.
- La legitimidad se gana cumpliendo promesas, convocando, explicando. Se pierde con decretos forzados, mentiras o crisis no resueltas.

## 7. El poder se gasta

**Idea:** cada decisión consume capital político, confianza, alianzas, tiempo, autoridad.

**Cómo plasmarlo:**

- Recursos invisibles que se gastan y se reconstruyen lentamente.
- Si gastás todo, quedás expuesto ante cualquier crisis.
- Acciones grandes requieren capital político acumulado.

## 8. Cambiar las reglas también es política

**Idea:** cuando las reglas producen malos resultados colectivos, alguien debe cambiarlas desde afuera.

**Cómo plasmarlo:**

- **Reformas institucionales** como acciones especiales: reforma tributaria, laboral, pacto con gobernadores, cambio de reglas del juego.
- Requieren mucho capital político y consenso.
- Tienen efectos a largo plazo y riesgo alto.

## 9. La política es contextual, no binaria

**Idea:** no se trata de ser de derecha o izquierda, sino de saber cuándo doblar sin perder el rumbo.

**Cómo plasmarlo:**

- No hay elecciones explícitas del tipo "¿Sos liberal o populista?".
- El estilo de gobierno emerge de las decisiones concretas.
- Variables continuas: `radical <-> conciliador`, `cerrado <-> convocante`, `populista <-> técnico`.
- El mismo jugador puede ser 53% radical y 43% conciliador al mismo tiempo.

## 10. Gobernar desde la fuerza exige abrirse

**Idea:** cuando tenés todo para llevarte puesto, el riesgo mayor no es aflojar, sino cerrarte. El momento de mayor poder es el momento de convocar al otro.

**Cómo plasmarlo:**

- Tras una victoria contundente en legislativas, la opción "Abrirse / armar coaliciones" es la más rentable a largo plazo.
- Acelerar desde la fuerza tiene alto riesgo de choque y desgaste.
- Cerrarse premia a corto plazo pero castiga en las presidenciales.

---

## Notas para implementación

- Antes de integrar cualquiera de estas ideas, actualizar `src/types/game.ts` para incluir los nuevos campos de `GameState`.
- Mantener el motor puro: las funciones de `gameEngine.ts` deben seguir recibiendo `GameState` y devolviendo `GameState` sin mutar el estado original.
- Cada mecánica nueva debería venir acompañada de su UI correspondiente; evitar agregar estado al motor si no hay componente que lo muestre.
- Los principios filosóficos deben emerger del juego, no explicarse en textos largos. Usar titulares, eventos, consecuencias y percepciones de grupos.
