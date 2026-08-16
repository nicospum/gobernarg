# GobernArg — Rediseño Integral: de simulador de botones a simulador de gobierno

> **Spec version:** 1.0  
> **Fecha:** 2026-07-02  
> **Estado:** Aprobado — listo para plan de implementación

## Goal

Transformar GobernArg de una colección de acciones aisladas con indicadores confusos en una simulación donde gobernar se siente como **decidir, negociar, comprometerse y vivir con las consecuencias**.

## Architecture

Tres fases de implementación por impacto:
1. **Arreglar** lo que rompe la experiencia (indicadores, elecciones, derrotas)
2. **Enriquecer** el gameplay (matriz unificada de acciones, interacciones con compromisos, efectos diferidos, arquetipos con identidad)
3. **Pulir** la experiencia (tooltips, cuaderno de gestión, narrativa, balance, claridad visual)

Tech stack: React 18, TypeScript 5, Vite 5, Tailwind CSS 3, Vitest.

---

## Phase 1 — Fix what breaks the experience

### 1.1 Redefine the 3 core indicators

**Current problem:** `popularidad`, `estabilidad`, and `legitimidad` are indistinguishable — most actions change all three by similar amounts, making trade-offs invisible.

**Design:**

| Indicator | What it measures | What raises it | What lowers it | Who cares |
|---|---|---|---|---|
| Popularidad | Public perception | Visible actions (public works, security, culture), positive events, meetings with mass groups | Natural decay, crises, inflation, unpopular actions (austerity, printing money) | Elections (40% of vote weight), social stability |
| Estabilidad | Institutional order | Security, deals with opposition, end of crises | Protests, legislative blocks, soft coups, high inflation | Defeat by impeachment/coup, reform costs |
| Legitimidad | Institutional backing | Legal/transparent actions, fulfilling demands, clean elections, allied support | Corruption, printing money, broken promises, authoritarian measures | Action cost multiplier (lower legitimacy = more expensive reforms) |

**Files:** `src/types/game.ts` (add documentation comments to indicator fields), `src/utils/actionEffects.ts` (split effects per indicator), `src/utils/electionSystem.ts` (use correct indicators in vote calculation).

### 1.2 Make elections winnable

**Current problem:** Promoción Intendente→Presidente is mathematically impossible (max voting intention = 36%, threshold = 45%). Gobernador→Presidente requires ~97%. Gobernador has 0% minimum popularity to run.

**Changes:**
- Reduce `PROMOTION_DIFFICULTY['promote-president']` from -40 to -25
- Reduce `ASCENSION_PENALTY['intendente->presidente']` from 0.40 to 0.30  
- Reduce `ASCENSION_PENALTY['gobernador->presidente']` from 0.20 to 0.15
- Set `PROMOTION_MIN_POPULARITY['promote-governor']` to 45 (was 0)
- Weight `calculateGroupsSupport` by group `influence`
- Replace binary stability bonus with `state.stability` directly as percentage

**Files:** `src/data/careerRules.ts`, `src/utils/electionSystem.ts`

### 1.3 Activate dead defeat conditions

**Current problem:** Hyperinflation requires 7 emissions but max possible is 4 (cooldown resets on election). Impeachment requires popularity <10% but the low-popularity defeat triggers much earlier. Coup requires `legislativeSupport < 25%` which is impossible (min is 25).

**Changes:**
- Hyperinflation: threshold 7 → 4, cooldown of `emitir_dinero` 4 → 2 turns
- Impeachment: popularity <10% → <25%, stability <20% → <40%
- Coup: `legislativeSupport < 25%` → `< 30%`

**Files:** `src/utils/victoryConditions.ts`, `src/engine/turnProcessor.ts`

### 1.4 Clean up dead/confusing actions

- `estudio_factibilidad`: either implement its promised infrastructure discount via `costReductionCategory` on `pendingEffects`, or remove it
- `emitir_dinero`: popularityChange 3 → -3 (consistent with real-world logic; diminishing system handles overuse)
- `group_estudiantes` / `group_partidos` targets: already fixed in previous sprint
- Event `coalition_opportunity`: `requiredGroups: ['partidos']` → `['aliados']`

**Files:** `src/data/actionCategories.ts`, `src/data/events/political.ts`

### 1.5 Create unified action registry (scaffold)

Create `src/data/actionRegistry.ts` with the extended `ActionDefinition` interface (see Phase 2) and migrate existing 58 actions. This replaces `actionCategories.ts` and becomes the single source of truth for all action metadata.

**Files:** Create `src/data/actionRegistry.ts`, modify `src/engine/actionEngine.ts`

---

## Phase 2 — Enrich gameplay

### 2.1 Unified action registry (complete)

Every action in the game lives in `actionRegistry.ts` as an `ActionDefinition`:

```typescript
interface ActionDefinition {
  id: string;
  name: string;
  description: string;
  category: ActionCategory;
  availableFor: Position[];
  cost: { budget: number; actions?: number };
  effects: {
    immediate: Partial<IndicatorChanges>;
    delayed?: DelayedEffect[];
  };
  affectedGroups: {
    supports: string[];    // subgroup IDs that gain support
    opposes: string[];     // subgroup IDs that lose support
  };
  triggersEvent?: string;
  satisfiesDemand?: string[];
  prerequisites?: {
    requiresAction?: string[];
    requiresPosition?: Position;
    requiresLegislativeSupport?: number;
  };
  diminishingFactor?: number;
}
```

This is extensible — the user's "hundreds of additional actions" just add entries to the array.

### 2.2 Real delayed effects

- Infrastructure actions generate delayed income bonuses (2-4 turns)
- Diplomacy actions unlock future events
- `estudio_factibilidad` applies `costReductionPercent` to infrastructure category for 6 turns
- The Management Notebook (Phase 3) displays pending effects

**Files:** `src/utils/actionEffects.ts` (extend `generatePendingEffects`), `src/data/actionRegistry.ts` (add delayed effects to actions)

### 2.3 Interaction redesign

Replace the current abstract interaction system with one that creates real commitments:

| Interaction | Cost | Immediate | Future commitment |
|---|---|---|---|
| Reunirse | 1 action | +5 support (3 turns). 1.1× bonus on actions that group likes | None |
| Negociar | 1 action + variable budget | +8 support. Group issues a concrete demand in 1-2 turns | If unmet: -12 support, group radicalizes |
| Conceder | 1 action + high cost | +15 support. No demands from this group for 4 turns | Next demand will be more demanding |

**Files:** `src/utils/interactionCosts.ts` (rewrite), `src/engine/gameEngine.ts` (rewrite `applyInteraction`), `src/engine/groupAgendaEngine.ts` (integrate with new demand system)

### 2.4 Connect demands to real actions

Demands generated by `groupAgendaEngine.ts` must reference actions that exist in the registry:

1. Each group has `demandActionIds` — IDs of actions it can request
2. Demands pick actions that exist, are available for the player's position, and haven't been used in 3+ turns
3. Fulfilling a demand = executing that action. System checks `completedActions` against demand.
4. UI shows: "El sector financiero te pide: Desregular la economía [ejecutar]" with direct action button

**Files:** `src/engine/groupAgendaEngine.ts`, `src/data/interestGroups.ts` (add `demandActionIds` to subgroups)

### 2.5 Archetype identity

- Each archetype gets **2 active abilities** (not just 1) with different cooldowns and costs
- Ideological axes (`radicalConciliadorAxis`, etc.) become visible to the player and affect group support
- Archetype passives already working via `archetypeEngine.ts` — extend with visible UI feedback

**Files:** `src/data/specialAbilities.ts` (add second ability per archetype), `src/engine/archetypeEngine.ts` (integrate axis effects), `src/engine/gameEngine.ts` (surface axes to UI)

---

## Phase 3 — Polish the experience

### 3.1 Contextual tooltips

Every number, bar, and icon in the UI gets a tooltip on hover:

- Indicators: current value, trend vs last turn, causes of last change
- Groups: name, support level, last interaction, pending demands
- Actions: real cost (after diminishing), affected groups, delayed effects, unlocks produced
- Archetype: active passives, available abilities with cooldowns
- Ideological axes: current position, aligned groups

**Files:** `src/components/*.tsx` (add Tooltip wrappers), create `src/components/InfoTooltip.tsx`

### 3.2 Management Notebook

New panel showing government memory:

- **Commitments:** group demands with deadlines, status, penalties
- **Pending effects:** delayed bonuses/costs with countdown
- **Upcoming events:** political calendar
- **Recent history:** last 5 actions and consequences

**Files:** Create `src/components/ManagementNotebook.tsx`, integrate into `App.tsx`

### 3.3 Visual event clarity

- Category icons + colors (red = crisis, blue = opportunity, orange = protest)
- Show real cost per choice before selecting
- Show chained consequences ("this may trigger X in 3 turns")
- Show probabilities as bars

**Files:** `src/components/EventModal.tsx`, `src/data/events/*.ts` (add metadata)

### 3.4 Category visual differentiation

Each action category gets:
- Distinct color (green = economy, orange = social, blue = security, violet = diplomacy)
- Category icon
- Filter in action panel

**Files:** `src/components/ActionPanel.tsx`, create `src/data/categoryStyles.ts`

### 3.5 Balance adjustments

- Popularity decay: `{ intendente: -3, gobernador: -5, presidente: -6 }` (was `{5, 7, 10}`)
- `recalcState`: group support only adds bonus, never drags popularity down
- President net income: increase maintenance or base income to make president margin > governor margin

**Files:** `src/engine/turnProcessor.ts`, `src/engine/engineShared.ts`

### 3.6 Narrative layer

- Turn start: contextual text based on position, popularity, pending threats
- Action feedback: narrative text when executing actions
- Group dialogue: groups "speak" when interacting
- Election night: tension-building results reveal

**Files:** Create `src/engine/narrativeEngine.ts`, integrate into `src/engine/turnProcessor.ts` and `src/App.tsx`

---

## Self-Review

1. **Placeholder scan:** No TBDs or TODOs. All changes have concrete file targets.
2. **Internal consistency:** Phase 1's action registry scaffold feeds Phase 2's complete registry. Phase 2's demand system feeds Phase 3's notebook. Dependencies flow forward.
3. **Scope check:** Three phases, each independently shippable. Phase 1 alone makes the game functional. Phase 2 adds depth. Phase 3 adds polish.
4. **Ambiguity check:** All indicator definitions, interaction costs, and numerical changes are explicit. No "improve X" without how.
5. **Extensibility:** The `ActionDefinition` interface in Phase 2 is designed for hundreds of additional actions — just add entries to the array.
