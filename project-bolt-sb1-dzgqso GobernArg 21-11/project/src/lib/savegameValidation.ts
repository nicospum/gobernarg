import { ACTOR_IDS, INDICATOR_IDS, SCENARIOS } from '../data/causal';
import type { GameState } from '../types/game';
import type { GameEvent } from '../systems/events/types';
import { calendarFor } from './calendar';

type Obj = Record<string, unknown>;
const obj = (x: unknown): x is Obj => !!x && typeof x === 'object' && !Array.isArray(x);
const number = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x);
const integer = (x: unknown): x is number => number(x) && Number.isInteger(x) && x >= 0;
const string = (x: unknown): x is string => typeof x === 'string';
const strings = (x: unknown): x is string[] => Array.isArray(x) && x.every(string);
const nullableInt = (x: unknown) => x === null || integer(x);
const numbers = (x: unknown) => obj(x) && Object.values(x).every(number);
const fields = (x: unknown, keys: string[]) => obj(x) && keys.every(k => number(x[k]));
const list = (x: unknown, check: (v: unknown) => boolean) => Array.isArray(x) && x.every(check);
const actor = (x: unknown) => string(x) && (ACTOR_IDS as readonly string[]).includes(x);
const span = (x: unknown) => obj(x) && integer(x.start) && integer(x.end);
const optionalNumber = (x: unknown) => x === undefined || number(x);
const optionalString = (x: unknown) => x === undefined || string(x);
const optionalBoolean = (x: unknown) => x === undefined || typeof x === 'boolean';
const optionalStrings = (x: unknown) => x === undefined || strings(x);
const optionalNumbers = (x: unknown) => x === undefined || numbers(x);
const range = (x: unknown) => obj(x) && optionalNumber(x.min) && optionalNumber(x.max);
const requirements = (x: unknown) => obj(x) && optionalNumber(x.popularity) && optionalNumber(x.budget)
  && optionalStrings(x.completedActions) && optionalNumbers(x.groupSupport)
  && (x.indicators === undefined || (obj(x.indicators) && Object.values(x.indicators).every(range)));
const breakdown = (x: unknown) => fields(x, ['apro','estructura','otros','incumbencia']) && obj(x)
  && ['aFavor','enContra'].every(k => list(x[k], a => obj(a) && string(a.actor) && number(a.sat)));

/** Rechaza números no finitos y árboles anómalos antes de cualquier rehidratación. */
export function safeJsonTree(value: unknown, depth = 0, budget = { left: 1000000 }): boolean {
  if (--budget.left < 0 || depth > 50) return false;
  if (typeof value === 'number') return Number.isFinite(value);
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.every(v => safeJsonTree(v, depth + 1, budget));
  return obj(value) && Object.entries(value).every(([key, v]) => !['__proto__', 'prototype', 'constructor'].includes(key) && safeJsonTree(v, depth + 1, budget));
}

const activity = (x: unknown) => obj(x) && number(x.pressure) && x.pressure >= 0 && x.pressure <= 32
  && integer(x.mandateStart) && x.mandateStart > 0 && integer(x.observedTurns) && x.observedTurns <= 16
  && typeof x.perfectUse === 'boolean' && typeof x.bonusGranted === 'boolean';
const activityRecord = (x: unknown) => fields(x, ['available','used','unused','pressureBefore','pressureAfter','governabilityPenalty','imagenDelta']) && obj(x)
  && number(x.available) && x.available >= 0 && number(x.used) && x.used >= 0 && x.used <= x.available
  && number(x.unused) && x.unused >= 0 && Math.abs(x.used + x.unused - x.available) < 1e-8
  && number(x.pressureBefore) && x.pressureBefore >= 0 && x.pressureBefore <= 32 && number(x.pressureAfter) && x.pressureAfter >= 0 && x.pressureAfter <= 32
  && number(x.governabilityPenalty) && x.governabilityPenalty >= 0 && x.governabilityPenalty <= 100
  && number(x.imagenDelta) && x.imagenDelta >= -0.5 && x.imagenDelta <= 2 && typeof x.bonusAwarded === 'boolean';

const indicatorMap = (x: unknown) => obj(x) && INDICATOR_IDS.every(id => number(x[id]));
const political = (x: unknown) => fields(x, ['leg','legAdj','gob','apro','estr','otros','iv','imagen','umbralLey','interna','coalicion']);
const actorSnapshot = (x: unknown) => obj(x) && ACTOR_IDS.every(id => obj(x[id]) && number(x[id].sat) && (x[id].rel === null || number(x[id].rel)));
const applied = (x: unknown) => obj(x) && optionalString(x.actionId) && optionalString(x.effectId) && optionalNumber(x.originTurn) && string(x.source) && string(x.target) && number(x.delta) && string(x.explanation) && ['DELTA','BONUS','SET'].includes(String(x.mode));
const channel = (x: unknown) => obj(x) && actor(x.actor) && optionalString(x.eventId) && string(x.label) && string(x.target) && number(x.value);
const record = (x: unknown) => obj(x) && integer(x.turn) && (x.managementActivity === undefined || activityRecord(x.managementActivity))
  && list(x.actions, a => obj(a) && string(a.actionId) && optionalString(a.suspended) && optionalBoolean(a.forced) && (a.actor === undefined || actor(a.actor)) && number(a.caja) && strings(a.scheduled))
  && list(x.applied, applied) && list(x.rules, r => obj(r) && string(r.ruleId) && string(r.target) && number(r.delta))
  && list(x.channelsApplied, channel) && list(x.channelsScheduled, channel)
  && fields(x.fiscal, ['cajaAntes','ingresos','gastoCorriente','servicioDeuda','costoAcciones','ingresosAcciones','efectosCaja','financiamiento','resultado','cajaDespues'])
  && indicatorMap(x.indicatorsBefore) && indicatorMap(x.indicatorsAfter) && actorSnapshot(x.actorsBefore) && actorSnapshot(x.actorsAfter)
  && political(x.politicalBefore) && political(x.politicalAfter) && strings(x.relationEvents) && strings(x.events) && strings(x.notes)
  && (x.internaReasons === undefined || strings(x.internaReasons));

export function validGameState(value: unknown): value is GameState {
  if (!obj(value) || !obj(value.causal)) return false;
  const s = value; const c = value.causal;
  if (!['light-12','legacy-16'].includes(String(c.calendar)) || !SCENARIOS.some(sc => sc.id === c.scenarioId)) return false;
  if (SCENARIOS.some(sc => sc.id === c.scenarioId && sc.reelectionsToUnlock > 0) && c.calendar !== 'legacy-16') return false;
  if (c.managementActivity !== undefined && !activity(c.managementActivity)) return false;
  const cal = calendarFor(c as { calendar: 'light-12' | 'legacy-16' });
  if (!integer(s.year) || s.year < 1 || s.year > 4 || !integer(s.turn) || s.turn < 1 || s.turn > cal.periodsPerYear || !integer(s.term) || s.term < 1 || s.term > 2) return false;
  if (!integer(c.turn) || c.turn < 1 || c.turn > cal.totalTurns + 1 || c.mandateStart !== (s.term - 1) * cal.turnsPerMandate + 1) return false;
  if (obj(c.managementActivity)) {
    const a = c.managementActivity;
    if (!number(a.pressure) || a.pressure > cal.totalTurns || a.pressure > c.turn - 1 || !integer(a.observedTurns) || a.observedTurns > cal.turnsPerMandate
      || !integer(a.mandateStart) || ![1, cal.turnsPerMandate + 1].includes(a.mandateStart) || a.mandateStart > c.mandateStart
      || a.observedTurns > c.turn - a.mandateStart) return false;
  }
  const civil = (s.term - 1) * cal.turnsPerMandate + (s.year - 1) * cal.periodsPerYear + s.turn;
  if (c.turn !== civil && !((s.pendingElection || s.gameOver) && c.turn === civil + 1)) return false;
  if (s.position !== 'presidente' || !['politico','empresario','sindicalista','comunicador'].includes(String(s.archetype)) || !string(s.governorName) || !string(s.avatar)) return false;
  if (!fields(s,['popularity','budget','actions','baseActions','votingIntention','stability','legitimacy','radicalConciliadorAxis','populistaTecnicoAxis','cerradoConvocanteAxis','lastRandomEventTurn','randomEventsThisTerm'])) return false;
  if (!['gameOver','victorious','pendingElection','pendingMidtermStrategy'].every(k => typeof s[k] === 'boolean')) return false;
  if (!strings(s.selectedActions) || !strings(s.completedActions) || !strings(s.availableMidtermStrategies) || !list(s.historicalPopularity, number) || !numbers(s.groupRelations)) return false;
  if (!list(s.notifications, n => obj(n) && string(n.id) && string(n.title) && string(n.message)
    && ['info','warning','success','error','event','crisis','achievement'].includes(String(n.type))
    && ['low','medium','high','critical','success'].includes(String(n.importance))
    && optionalString(n.category) && optionalString(n.groupId)
    && ['year','turn','timestamp','expiresAt'].every(k => optionalNumber(n[k]))
    && ['read','dismissed','requiresAcknowledgment'].every(k => optionalBoolean(n[k]))
    && (n.metadata === undefined || obj(n.metadata)) && n.icon === undefined
    && (n.actions === undefined || list(n.actions, a => obj(a) && string(a.label) && optionalString(a.id) && optionalString(a.style) && optionalString(a.confirmationMessage) && optionalBoolean(a.requiresConfirmation) && a.action === undefined)))) return false;
  if (!(s.lastInteractionMessage === null || optionalString(s.lastInteractionMessage)) || !(s.legislativeSupport === null || number(s.legislativeSupport))) return false;
  if (!(s.midtermStrategy === null || ['acelerar','negociar','abrirse','jugada_audaz'].includes(String(s.midtermStrategy)))) return false;
  if (!(s.defeatReason === null || ['low_popularity','negative_budget','impeachment','institutional_coup','hyperinflation','election_loss'].includes(String(s.defeatReason)))) return false;
  if (!list(s.objectives, o => obj(o) && string(o.id) && string(o.title) && string(o.description) && requirements(o.requirements) && obj(o.reward) && optionalNumber(o.reward.popularity) && optionalNumber(o.reward.budget) && typeof o.completed === 'boolean' && number(o.progress))) return false;
  if (!list(s.careerHistory, h => obj(h) && string(h.position) && integer(h.term) && number(h.startYear) && number(h.endYear) && string(h.result) && number(h.votesPercentage))) return false;
  if (!list(s.turnLog, t => obj(t) && integer(t.year) && integer(t.turn) && integer(t.term) && strings(t.actionsTaken) && strings(t.events) && strings(t.decisions) && strings(t.projectsCompleted) && strings(t.crisesFaced) && number(t.popularityChange) && number(t.budgetChange))) return false;
  if (s.lastEventFiredTurns !== undefined && !numbers(s.lastEventFiredTurns)) return false;
  if (s.electionResults !== null && !(obj(s.electionResults) && (s.electionResults.kind === undefined || ['reelection','succession'].includes(String(s.electionResults.kind))) && number(s.electionResults.votesPercentage) && typeof s.electionResults.victory === 'boolean' && (s.electionResults.causal === undefined || breakdown(s.electionResults.causal)) && fields(s.electionResults.details,['popularityImpact','budgetImpact','groupsSupport','completedObjectivesImpact','stabilityBonus']))) return false;
  if (s.legislativeResults !== null && !(obj(s.legislativeResults) && fields(s.legislativeResults,['officialismVotes','oppositionVotes','legislativeSupport']) && string(s.legislativeResults.outcome) && string(s.legislativeResults.message))) return false;
  if (!indicatorMap(c.base) || !indicatorMap(c.expect) || !obj(c.expect) || !number(c.expect.APRO) || !political(c.political) || !obj(c.actors)) return false;
  if (!ACTOR_IDS.every(id => { const a = (c.actors as Obj)[id]; return obj(a) && number(a.sat) && (a.rel === null || number(a.rel)) && nullableInt(a.lastContact) && integer(a.revealedUntil) && nullableInt(a.lastMeeting) && nullableInt(a.offerUntil) && integer(a.lowStreak) && (a.demand === null || (obj(a.demand) && string(a.demand.actionId) && integer(a.demand.createdTurn) && nullableInt(a.demand.revealedTurn))); })) return false;
  if (!list(c.agenda, e => obj(e) && string(e.uid) && string(e.effectId) && string(e.actionId) && integer(e.originTurn) && string(e.target) && ['DELTA','BONUS','SET'].includes(String(e.mode)) && number(e.magnitude) && span(e) && typeof e.everyTurn === 'boolean' && number(e.appliedTotal) && string(e.explanation) && optionalString(e.applyCondition) && optionalBoolean(e.whileCondition) && (e.actor === undefined || actor(e.actor)) && optionalNumber(e.floor) && optionalNumber(e.cumulativeCap))) return false;
  if (!list(c.bonuses, b => obj(b) && string(b.id) && string(b.target) && number(b.value) && span(b) && string(b.source) && string(b.label))) return false;
  if (!obj(c.flags) || !Object.values(c.flags).every(f => obj(f) && number(f.value) && integer(f.start) && nullableInt(f.end) && string(f.source))) return false;
  if (!obj(c.costMult) || !Object.values(c.costMult).every(f => obj(f) && number(f.value) && span(f))) return false;
  if (!list(c.executions, e => obj(e) && string(e.actionId) && integer(e.turn) && (e.actor === undefined || actor(e.actor)) && optionalBoolean(e.forced))) return false;
  if (!list(c.channelQueue, q => channel(q) && obj(q) && string(q.id) && integer(q.duration) && integer(q.applyTurn) && ['DELTA','BONUS'].includes(String(q.mode)))) return false;
  if (!list(c.saliency, x => obj(x) && actor(x.actor) && (INDICATOR_IDS as readonly unknown[]).includes(x.indicator) && number(x.mult) && integer(x.end) && string(x.source))) return false;
  if (!list(c.modifiers, m => obj(m) && string(m.id) && string(m.label) && span(m) && ['efficacy','confPerTurn','imagenPerTurn','umbralLey'].every(k => optionalNumber(m[k])) && (m.relPerTurn === undefined || numbers(m.relPerTurn)))) return false;
  if (!list(c.agreements, a => obj(a) && string(a.id) && actor(a.actor) && string(a.commitmentActionId) && integer(a.signedTurn) && integer(a.deadline) && string(a.offer) && ['active','fulfilled','broken'].includes(String(a.status)))) return false;
  if (!list(c.records, record) || !list(c.fiscalHistory, number) || !numbers(c.channelEventTurns) || !numbers(c.dissent) || !strings(c.ruptures)) return false;
  if (!fields(c,['caja','gastoCorr','deuda','ingresoMult','desanclaje','credibility','paPenaltyNextTurn','freeMeetingsUsed','immediateCosts','hyperStreak','govCrisisStreak','rng']) || typeof c.forcedEmission !== 'boolean') return false;
  const p = c.perks;
  return obj(p) && fields(p,['freeMeetingsPerTurn','eventResilience','structureMult','securityInstMitigation','loanDiscount']) && typeof p.freePolls === 'boolean'
    && list(p.freeMeetingActors, actor) && numbers(p.negotiationBonus) && numbers(p.categoryEfficacy) && numbers(p.categoryCajaDiscount) && strings(p.paDiscountCategories) && strings(p.reveals);
}

const conditions = (x: unknown) => obj(x)
  && ['minPopularity','maxPopularity','minBudget','maxBudget','minStability','maxStability','probability','minMoneyPrinting'].every(k => optionalNumber(x[k]))
  && optionalStrings(x.requiredGroups) && optionalStrings(x.requiredActions)
  && (x.turnRange === undefined || fields(x.turnRange, ['min','max']));
const effect = (x: unknown) => obj(x) && ['immediate','delayed','conditional'].includes(String(x.type)) && number(x.value)
  && optionalString(x.target) && optionalString(x.source) && optionalNumber(x.duration) && optionalNumber(x.turnsUntil)
  && (x.conditions === undefined || conditions(x.conditions));
const effects = (x: unknown) => obj(x) && list(x.immediate, effect)
  && (x.delayed === undefined || list(x.delayed, effect)) && (x.permanent === undefined || list(x.permanent, effect));
export function validPendingEvents(value: unknown): value is GameEvent[] {
  return list(value, e => obj(e) && string(e.id) && string(e.title) && string(e.description) && string(e.type) && string(e.category) && string(e.severity) && number(e.probability) && conditions(e.conditions) && effects(e.effects) && optionalStrings(e.blockedBy) && optionalStrings(e.requires) && optionalNumber(e.weight) && optionalNumber(e.cooldown) && optionalNumber(e.duration)
    && (e.choices === undefined || list(e.choices, c => obj(c) && string(c.id) && string(c.text) && effects(c.effects) && optionalNumber(c.probability) && (c.requirements === undefined || conditions(c.requirements)) && (c.consequences === undefined || (obj(c.consequences) && effects(c.consequences.success) && effects(c.consequences.failure))))));
}
