# Estado del proyecto — GobernArg V2

> Última actualización: **20 de agosto de 2026**

---

## Estado actual

**GobernArg es un MVP funcional y testeable centrado en un solo cargo: PRESIDENTE.** El juego tiene un ciclo de mandato completo de 16 turnos (4 años), victoria y derrota posibles, y 183 tests que verifican las mecánicas centrales.

### Lo que está implementado y funcionando

**(a) MVP solo presidente**
- La partida se juega como presidente, con mandato de 16 turnos, elecciones de medio término (año 2) y generales (año 4).
- Los cargos de intendente y gobernador existen en la estructura (`careerRules.ts`) y en los textos narrativos, pero el flujo de juego actual es presidente directo.

**(b) 18 eventos activos con imágenes propias**
- 6 económicos + 6 políticos + 6 sociales, cada uno con imagen propia en `src/assets/images/events/`.
- `getEventImage()` mapea por `event.id` (prioridad sobre la categoría), con las 12 imágenes de la tanda de eventos nuevos (19/08) ya integradas.

**(c) Concesiones limitadas**
- Máximo **4 concesiones por mandato** (`concessionsThisTerm`).
- Requieren trabajo previo: al menos 1 reunión o 1 negociación con el grupo en el mandato actual.
- Tienen **costo cruzado**: conceder penaliza al resto de los grupos con `max(2, influencia × 0.5)`.

**(d) Demandas raras y acotadas**
- Probabilidad base **8%** por turno (máximo 25% con modificadores).
- Máximo **2 demandas activas simultáneas**.
- Satisfacer una demanda **consume 1 acción**, da +5 apoyo al grupo y +1 de popularidad, con impacto cruzado sobre los antagonistas.

**(e) Limitador global de eventos**
- Cooldown de **3 turnos** entre eventos aleatorios/crisis (`GLOBAL_COOLDOWN_TURNS`).
- Máximo **5 eventos aleatorios por mandato** (`MAX_RANDOM_EVENTS_PER_TERM`).
- Los eventos contextuales (`triggered`) y de calendario no están limitados.

**(f) Pasivas de arquetipo funcionando**
- Las 4 pasivas por arquetipo están conectadas al runtime: retención de voto (político), resistencia a eventos negativos (comunicador), interacciones gratis (político/sindicalista), préstamo extra (empresario) y acciones extra (sindicalista).
- Cada arquetipo tiene **2 habilidades activas** (8 en total).

**(g) Dificultad con efectos reales**
- `popularityDecayMultiplier`, `crisisProbabilityMultiplier`, `incomeMultiplier` y `loansAvailable` se consumen en el runtime.
- Pendiente documentado: `baseActionsModifier` e `ironman` aún no se consumen.

**(h) 183 tests**
- Suite de Vitest con cobertura de turnos globales, victoria/derrota, eventos, demandas, elecciones, efectos diferidos, dificultad y UI.
- `npm run test` pasa completo.

**(i) 56+ assets visuales integrados**
- Fondos por cargo, iconos propios de grupos/arquetipos/categorías, 18 imágenes de eventos, avatares y asesores, marcos/banners de UI.
- Inventario en `src/assets/images/INVENTORY.md`.

**(j) Turnos globales arreglados**
- Deadlines, cooldowns y efectos diferidos usan el turno global `(year - 1) * 4 + turn` en lugar de aritmética cíclica. Demandas, negociaciones y cooldowns de eventos vencen correctamente a través de los años.

**(k) Victoria posible**
- Los objetivos usan `groupRelations` (keyed por subgrupo) — los objetivos de gobernador y presidente se completan y la victoria es alcanzable.

---

## Historia reciente

### Auditoría integral (agosto 2026) — 4 fases de fixes

1. **Turnos globales** — unificación de la aritmética de turnos; desbloqueó demandas, negociaciones, cooldowns y economía.
2. **Victoria y derrota** — objetivos corregidos, condiciones de impeachment/golpe/hiperinflación verificadas.
3. **Eventos y estado** — 17 efectos de eventos que se descartaban en silencio ahora aplican; mutaciones de estado React eliminadas (deep clones en `processEndTurn`, `useSpecialAbility`, `applyEventChoice`, `recordElectionOutcome`).
4. **Pasivas, dificultad, UI dark y dead code** — pasivas conectadas al runtime, modificadores de dificultad consumidos, componentes migrados a tema oscuro, dependencias y componentes muertos eliminados.

### Fase 2 (junio 2026, sesión anterior)

Sprints de tooltips, efectos diferidos, interacciones con grupos, arquetipos con pasivas y GameLog — todo esto sigue vigente.

---

## Cómo verificar

```bash
npm run test        # 183 tests
npx tsc --noEmit    # tipos
```

---

## Pendientes

- **Lint:** 14 errores, 11 de estilo (6 `no-explicit-any`, 5 `no-unused-vars`) + 3 puntuales (1 `rules-of-hooks`, 2 `prefer-const`).
- `baseActionsModifier` e `ironman` de dificultad documentados pero sin consumir en runtime.
- Grupo E de piezas de diseño (UI: marcos, sellos, medallas, estados vacíos) pendiente de generar.
- Roadmap: Fase 6 (sonidos, tutorial, responsive) sin empezar.
