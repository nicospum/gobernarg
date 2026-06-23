# Estado del proyecto — GobernArg V2

> Última actualización: 23 de junio de 2026

---

## Lo que se hizo en esta sesión

### 1. Documentación y análisis
- `src/docs/difficulty-analysis.md` — Diagnóstico completo de por qué el juego era fácil y plan de 4 fases
- `src/docs/future-engine-features.md` — Ya existía, se usó como referencia para features futuras
- `src/docs/roadmap.md` — Ya existía, roadmap visual y de contenido
- `src/docs/phase-1-plan.md` — Plan detallado línea por línea de la Fase 1

### 2. Fase 1 — Balance y diferenciación por cargo
- Acciones base por cargo: intendente 3, gobernador 2, presidente 1
- Desgaste de popularidad por cargo: -5/-7/-10 por turno
- 25+ acciones restringidas por cargo (intendente sin préstamos, sin diplomacia exterior)
- Umbrales de derrota por cargo: pop <20/25/30% × 2 turnos
- `reunión` ya no es gratis (cuesta 10)
- Intendente: 4 reelecciones máximas
- Promoción más difícil (-15 gob, -40 pres)

### 3. Fase 2 — Memoria y consecuencias
- Rendimientos decrecientes: `factor = 0.80^usos`. 5+ usos invierte el efecto
- Inflación real: 3+ emisiones → penalización, 5+ → crisis, 7+ → game over
- Servicio de deuda: cada préstamo reduce ingreso 10%, máx 3
- Cooldowns en acciones: 1-8 turnos
- Efectos multidimensionales: stability, legitimacy, votingIntention
- Consecuencias diferidas automáticas en acciones grandes

### 4. Fase 3 — Estrategia y política
- Árbol de desbloqueo con prerequisites (requiredActions, minLegislativeSupport, minGroupSupport)
- Matriz de antagonismos entre grupos (aplicación automática cada turno)
- Estrategias post-legislativas (acelerar, negociar, abrirse, jugada_audaz)
- Penalización progresiva de ascenso (más reelecciones = menos penalización)
- Nueva acción: estudio_factibilidad

### 5. Fase 4 — Profundidad total
- Legitimidad como recurso (se gana con comunicación, se pierde con decretos)
- Ejes contradictorios (radical↔conciliador, populista↔técnico, cerrado↔convocante)
- Grupos con agendas, demandas, estados de ánimo y radicalización
- 4 dificultades: Easy, Normal, Hard, Legend (Ironman)
- 5 vías de derrota: popularidad, déficit, impeachment, golpe, hiperinflación
- 4 habilidades especiales de arquetipos con cooldown

### 6. Bugfixes críticos
- `getNextPosition('reelection')` devolvía 'intendente' siempre → arreglado
- Popularidad siempre 100% (fórmula incorrecta) → arreglado
- Ganar sin hacer nada (recalcState borraba el desgaste) → arreglado

---

## Commits

```
9c883a7 fix: 3 bugs críticos (cargo, popularidad, idle-win)
6a92b68 feat: Fase 4 - El poder se gasta
754fec7 feat: Fase 3 - Gobernar es elegir qué perder
fb8e656 feat: Fase 2 - Las decisiones tienen memoria
b20d483 feat: Fase 1 - Balance y diferenciación por cargo
7739e99 docs: planes detallados de implementación Fases 1-4
335fdd5 docs: agregar 7 mecánicas nuevas al análisis de dificultad
177f7a5 Initial commit: GobernArg V2 project baseline
```

---

## Próximos pasos

### 🔴 Urgente — Conectar UI a las mecánicas nuevas
Muchas mecánicas están implementadas en el motor pero no tienen interfaz:

| Feature | Archivo de motor | UI necesaria |
|---|---|---|
| Selector de dificultad | `difficultyEngine.ts` | Pantalla de inicio / `createNewGame` |
| Habilidades de arquetipos | `useSpecialAbility()` en `gameEngine.ts` | `SpecialAbilitiesPanel.tsx` |
| Estrategia post-legislativa | `midtermStrategies.ts` | `MidtermStrategyModal.tsx` |
| Agendas de grupos | `groupAgendaEngine.ts` | Panel de demandas en UI |
| Ejes contradictorios | `axisEngine.ts` | Indicador en pantalla de legado |
| Razón de derrota | `defeatReason` | `GameOverModal` / `LegacyScreen` |

### 🟡 Balance — Ajustar dificultad
El juego ahora es "muy difícil". Ajustar constantes:

| Qué | Dónde | Actual | Sugerido |
|---|---|---|---|
| Desgaste popularidad | `gameEngine.ts` | 5/7/10 | 3/5/7 |
| Acciones base | `actionCalculator.ts` | 3/2/1 | 4/3/2 |
| Peso grupos en pop | `popularidad.ts` | 40% | 30% |
| Costo reunión | `interactionCosts.ts` | 10 | 5 |

### 🟢 Contenido — Más acciones, eventos, assets
- Ampliar banco de acciones con prerequisitos más interesantes
- Más eventos aleatorios y crisis
- 43 imágenes pendientes según `image-needs.md` (arquetipos, grupos, categorías, eventos, fondos)
- Música y sonidos

### 🟢 Pulido
- Pantalla de elecciones con mapa de Argentina
- Modo campaña: ascender Intendente → Gobernador → Presidente
- Logros desbloqueables
- Tutorial interactivo
- Responsive design

---

## Archivos creados en esta sesión

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
