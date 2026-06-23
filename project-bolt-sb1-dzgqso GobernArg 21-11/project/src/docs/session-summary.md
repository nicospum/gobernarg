# Estado del proyecto — GobernArg V2

> Última actualización: 23 de junio de 2026 — Fase 2 completada

---

## Lo que se hizo en la Fase 2 (segunda sesión)

### 🔴 Bugfixes críticos (post-Sprint 4 Fase 1)
- **Crash al cumplir demanda:** `satisfyGroupDemand` tenía `const newState` reasignado → cambiado a `let`
- **Derrota prematura (1 turno en vez de 2):** `checkAllDefeatConditions` sumaba `+1` redundante
- **Corrupción de estado React:** mutación in-place de `groupRelations` → deep clone en `processEndTurn`
- **Campos stale post-reelección:** `resolvePendingElection` no reseteaba 15 campos → ahora los resetea todos
- **ErrorBoundary:** captura crashes y muestra pantalla amigable en vez de pantalla blanca
- Blindaje defensivo en `satisfyGroupDemand`: optional chaining y fallbacks

### 🟢 Sprint 1 — Tooltips y Claridad Visual
- **Nuevo:** `Tooltip.tsx` — componente reutilizable con Tailwind (hover)
- **Nuevo:** `ErrorBoundary.tsx` — pantalla de error amigable
- Tooltips numéricos en: ActionCard (flechas → valor real, $ → monto), IndicatorsPanel (thresholds de barras), VotingIntentionPanel (pesos electorales), ElectionResultsModal (desglose), PoliticalCalendarWidget (apoyo legislativo), AxisBars (explicación de ejes)
- `main.tsx` envuelto con ErrorBoundary

### 🟡 Sprint 2 — Efectos Diferidos y Recompensas Estratégicas
- **Nuevo:** `ActiveBenefits.tsx` — panel de beneficios activos en sidebar
- Nuevos campos en `PendingEffect`: `incomeModifier`, `costReductionCategory`, `costReductionPercent`, `stabilityChange`
- `processEndTurn`: aplica `incomeModifiers` activos al calcular ingresos
- `calculateActionEffects`: aplica `costReduction` a acciones de categoría matching
- `processPendingEffects`: soporta `stabilityChange` al activarse
- `futureEffects` agregados a: estudio_factibilidad, mejorar_recaudacion, fomento_emprendimiento

### 🟠 Sprint 3 — Profundización de Interacciones con Grupos
- **Reunión:** pausa demandas del grupo por 2 turnos
- **Negociar:** genera demanda concreta en 1-2 turnos, deadline 4 turnos
- **Conceder:** bloquea demandas 4 turnos (1 año) + +15 apoyo
- Nuevos campos: `demandPausedUntil`, `negotiationPending`
- `resolvePendingNegotiations`: genera demandas cuando vence el plazo de negociación
- `generateGroupAgendas`: respeta `demandPausedUntil`

### 🔴 Sprint 4 — Arquetipos, Ejes y Contenido
- **Habilidades pasivas por arquetipo** (`ARCHETYPE_PASSIVES`):
  - Político: +10% retención voto, reuniones aliados gratis
  - Empresario: +20% income economía, +1 préstamo extra
  - Sindicalista: reuniones sindicatos/populares gratis, +1 acción base
  - Comunicador: -30% impacto eventos negativos, ×1.1 en popularidad
- **Ejes contradictorios con efectos mecánicos** (`getAxisModifiers`):
  - ±80 en cada eje modifica costos, efectividad, estabilidad y relaciones grupales

### 🟢 Sprint 5+6 — GameLog y Documentación
- **Nuevo:** `GameLog.tsx` — historial de gestión con línea de tiempo (modal)
- Botón "Historial de gestión" en sidebar
- **Nuevo:** `docs/mecanicas-del-juego.md` — manual completo en castellano explicando todas las mecánicas, variables, reglas y estrategia
- **Nuevo:** `referencias/` — capturas de pantalla para referencia visual

---

## Commits de la Fase 2

```
4b07c82 docs: capturas de referencia para mejoras visuales
9ebb484 fix: 'Assignment to constant variable' en satisfyGroupDemand
cf16bf3 fix: blindaje defensivo en satisfyGroupDemand contra crashes
4192cf9 feat: Sprint 5+6 - GameLog, Documentación y Balance Final
8b56f1b feat: Sprint 4 - Arquetipos, Ejes y Contenido
0758503 feat: Sprint 3 - Profundización de Interacciones con Grupos
ba85ae0 feat: Sprint 2 - Efectos Diferidos y Recompensas Estratégicas
340fe42 feat: Sprint 1 - Tooltips y Claridad Visual
```

---

## Archivos creados en la Fase 2

| Archivo | Propósito |
|---------|-----------|
| `src/components/Tooltip.tsx` | Sistema de tooltips reutilizable con hover |
| `src/components/ErrorBoundary.tsx` | Captura errores, evita pantalla blanca |
| `src/components/ActiveBenefits.tsx` | Panel de beneficios diferidos activos |
| `src/components/GameLog.tsx` | Historial de gestión (timeline) |
| `src/docs/mecanicas-del-juego.md` | Manual completo en lenguaje natural |

## Archivos modificados en la Fase 2

| Archivo | Cambios principales |
|---------|-------------------|
| `src/main.tsx` | ErrorBoundary wrapper |
| `src/App.tsx` | ActiveBenefits, GameLog, try/catch en satisfyDemand |
| `src/types/game.ts` | incomeModifier, costReduction, stabilityChange, demandPausedUntil, negotiationPending |
| `src/engine/gameEngine.ts` | incomeModifiers en ingresos, applyInteraction (reunión/negociar/conceder), satisfyGroupDemand blindado |
| `src/utils/actionEffects.ts` | costReduction en calculateActionEffects, stabilityChange en processPendingEffects |
| `src/utils/victoryConditions.ts` | Fix +1 redundante en checkAllDefeatConditions |
| `src/engine/groupAgendaEngine.ts` | demandPausedUntil, resolvePendingNegotiations, fix mutación in-place |
| `src/engine/axisEngine.ts` | getAxisModifiers con efectos mecánicos reales |
| `src/data/actionCategories.ts` | futureEffects en 3 acciones |
| `src/data/specialAbilities.ts` | ARCHETYPE_PASSIVES con 8 pasivas |
| `src/components/ActionCard.tsx` | Tooltips en flechas, $, badges |
| `src/components/IndicatorsPanel.tsx` | Tooltips en barras y ejes |
| `src/components/VotingIntentionPanel.tsx` | Tooltips con pesos electorales |
| `src/components/ElectionResultsModal.tsx` | Tooltips en desglose |
| `src/components/PoliticalCalendarWidget.tsx` | Tooltip en apoyo legislativo |
| `src/components/ObjectivesPanel.tsx` | Fix countdown 3→2 turnos |
| `src/components/GameOverModal.tsx` | defeatReason + consejos |
| `src/components/LegacyScreen.tsx` | Badge derrota + perfil ideológico |
| `src/utils/careerLog.ts` | Texto narrativo por defeatReason |

---

## Próximos pasos

### 🔴 Urgente — Visual y experiencia
- Mejorar la presentación visual general (layout, colores, jerarquía de información)
- Íconos faltantes: 2 arquetipos, 14 grupos, 7 eventos nuevos (~23 piezas)
- Revisar los mocks de referencia en `referencias/`

### 🟡 Balance
- El juego volvió a ser fácil. Ajustar: desgaste de popularidad, ingresos por cargo, costos de acciones
- Diferenciar ingreso neto de presidente vs gobernador (hoy ambos +150M)

### 🟢 Contenido pendiente del plan
- 10 nuevas acciones (reforma laboral, desregulación, etc.)
- 7 nuevos eventos (escándalo, conflicto sindical, boom exportador, etc.)
- Sistema de sucesión partidaria
- Pesos electorales diferenciados por grupo
- Ventaja del oficialismo escalonada

---

## Archivos creados en la Fase 1 (sesión anterior)

| Archivo | Propósito |
|---|---|
| `src/docs/difficulty-analysis.md` | Diagnóstico + plan de 4 fases + 7 mecánicas nuevas |
| `src/docs/phase-1-plan.md` | Plan detallado Fase 1 |
| `src/data/groupAntagonists.ts` | Matriz de antagonismos entre grupos |
| `src/data/midtermStrategies.ts` | Efectos de 4 estrategias post-legislativas |
| `src/data/specialAbilities.ts` | 4 habilidades de arquetipos |
| `src/engine/axisEngine.ts` | Ejes contradictorios |
| `src/engine/difficultyEngine.ts` | 4 niveles de dificultad |
| `src/engine/groupAgendaEngine.ts` | Agendas, moods y radicalización |
| `src/engine/legitimacyEngine.ts` | Cálculo de legitimidad |
| `src/utils/ascensionPenalty.ts` | Penalización por ascenso |
| `src/utils/crossGroupEffects.ts` | Efectos cruzados entre grupos |
