import { ACTOR_IDS, INDICATOR_IDS, SCENARIOS } from '../data/causal';
import type { GameState } from '../types/game';
import type { GameEvent } from '../systems/events/types';

type ObjectValue = Record<string, unknown>;
const object = (value: unknown): value is ObjectValue => value !== null && typeof value === 'object' && !Array.isArray(value);
const integer = (value: unknown): value is number => typeof value === 'number' && Number.isInteger(value) && value >= 0;
const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const string = (value: unknown): value is string => typeof value === 'string';
const bool = (value: unknown) => typeof value === 'boolean';
const list = (value: unknown, valid: (item: unknown) => boolean) => Array.isArray(value) && value.every(valid);
const optional = (value: unknown, valid: (item: unknown) => boolean) => value === undefined || valid(value);
const nullable = (value: unknown, valid: (item: unknown) => boolean) => value === null || valid(value);
const strings = (value: unknown) => list(value, string);
const numbers = (value: unknown, keys: readonly string[]) => object(value) && keys.every(key => number(value[key]));
const texts = (value: unknown, keys: readonly string[]) => object(value) && keys.every(key => string(value[key]));
const numberMap = (value: unknown) => object(value) && Object.values(value).every(number);
/** Misma defensa de árbol que Light; sin dependencias ni efectos laterales. */
export function safeJsonTree(value: unknown, depth = 0, budget = { left: 1000000 }): boolean {
  if (--budget.left < 0 || depth > 50) return false;
  if (typeof value === 'number') return Number.isFinite(value);
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return true;
  if (Array.isArray(value)) return value.every(item => safeJsonTree(item, depth + 1, budget));
  return object(value) && Object.entries(value).every(([key, item]) => !['__proto__','prototype','constructor'].includes(key) && safeJsonTree(item, depth + 1, budget));
}
const actorId = (value: unknown) => string(value) && (ACTOR_IDS as readonly string[]).includes(value);
const actorMap = (value: unknown, valid: (item: unknown) => boolean) => object(value) && ACTOR_IDS.every(id => valid(value[id]));
const indicators = (value: unknown) => numbers(value, INDICATOR_IDS);
const political = (value: unknown) => numbers(value, ['leg','legAdj','gob','apro','estr','otros','iv','imagen','umbralLey','interna','coalicion']);
const modes = (value: unknown) => value === 'DELTA' || value === 'BONUS' || value === 'SET';
const actorSnapshot = (value: unknown) => object(value) && number(value.sat) && nullable(value.rel, number);

function actor(value: unknown): boolean {
  return object(value) && actorSnapshot(value) && numbers(value,['revealedUntil','lowStreak'])
    && ['lastContact','lastMeeting','offerUntil'].every(key => nullable(value[key], number))
    && nullable(value.demand, demand => texts(demand,['actionId']) && object(demand) && number(demand.createdTurn) && nullable(demand.revealedTurn, number));
}
function scheduled(value: unknown): boolean {
  return object(value) && texts(value,['uid','effectId','actionId','target','explanation']) && numbers(value,['originTurn','magnitude','start','end','appliedTotal']) && modes(value.mode) && bool(value.everyTurn)
    && optional(value.actor,actorId) && optional(value.applyCondition,string) && optional(value.whileCondition,bool)
    && ['floor','cumulativeCap'].every(key => optional(value[key],number));
}
function record(value: unknown): boolean {
  if (!object(value)) return false;
  return number(value.turn) && indicators(value.indicatorsBefore) && indicators(value.indicatorsAfter) && actorMap(value.actorsBefore,actorSnapshot) && actorMap(value.actorsAfter,actorSnapshot)
    && political(value.politicalBefore) && political(value.politicalAfter)
    && numbers(value.fiscal,['cajaAntes','ingresos','gastoCorriente','servicioDeuda','costoAcciones','ingresosAcciones','efectosCaja','financiamiento','resultado','cajaDespues'])
    && list(value.actions,item => object(item) && string(item.actionId) && number(item.caja) && strings(item.scheduled) && optional(item.suspended,string) && optional(item.forced,bool))
    && list(value.applied,item => object(item) && texts(item,['source','target','explanation']) && number(item.delta) && modes(item.mode))
    && list(value.rules,item => object(item) && texts(item,['ruleId','target']) && number(item.delta))
    && ['channelsApplied','channelsScheduled'].every(key => list(value[key], item => object(item) && actorId(item.actor) && texts(item,['label','target']) && number(item.value)))
    && ['relationEvents','events','notes'].every(key => strings(value[key])) && optional(value.internaReasons,strings);
}
function causal(value: unknown): boolean {
  if (!object(value)) return false;
  return numbers(value,['turn','mandateStart','caja','gastoCorr','deuda','ingresoMult','desanclaje','credibility','paPenaltyNextTurn','freeMeetingsUsed','immediateCosts','hyperStreak','govCrisisStreak','rng'])
    && (value.turn as number) >= 1 && indicators(value.base) && indicators(value.expect) && object(value.expect) && number(value.expect.APRO) && numberMap(value.expect) && political(value.political) && actorMap(value.actors,actor)
    && bool(value.forcedEmission) && texts(value,['platformId','scenarioId']) && optional(value.platformMode,item => item === 'propia')
    && list(value.agenda,scheduled) && list(value.records,record) && list(value.fiscalHistory,number) && strings(value.ruptures)
    && numberMap(value.channelEventTurns) && numberMap(value.dissent)
    && object(value.flags) && Object.values(value.flags).every(item => object(item) && numbers(item,['value','start']) && nullable(item.end,number) && string(item.source))
    && object(value.costMult) && Object.values(value.costMult).every(item => numbers(item,['value','start','end']))
    && list(value.bonuses,item => texts(item,['id','target','source','label']) && numbers(item,['value','start','end']))
    && list(value.executions,item => object(item) && string(item.actionId) && number(item.turn) && optional(item.actor,actorId) && optional(item.forced,bool))
    && list(value.channelQueue,item => object(item) && texts(item,['id','label','target']) && actorId(item.actor) && numbers(item,['value','duration','applyTurn']) && modes(item.mode))
    && list(value.saliency,item => object(item) && actorId(item.actor) && string(item.indicator) && numbers(item,['mult','end']) && string(item.source))
    && list(value.modifiers,item => object(item) && texts(item,['id','label']) && numbers(item,['start','end']) && ['efficacy','confPerTurn','imagenPerTurn','umbralLey'].every(key => optional(item[key],number)) && optional(item.relPerTurn,numberMap))
    && list(value.agreements,item => object(item) && texts(item,['id','commitmentActionId','offer']) && actorId(item.actor) && numbers(item,['signedTurn','deadline']) && ['active','fulfilled','broken'].includes(String(item.status)))
    && perks(value.perks);
}
function perks(value: unknown): boolean {
  return object(value) && numbers(value,['freeMeetingsPerTurn','eventResilience','structureMult','securityInstMitigation','loanDiscount']) && bool(value.freePolls)
    && list(value.freeMeetingActors,actorId) && strings(value.paDiscountCategories) && strings(value.reveals)
    && ['negotiationBonus','categoryEfficacy','categoryCajaDiscount'].every(key => numberMap(value[key]));
}
function conditions(value: unknown): boolean {
  return object(value) && ['minPopularity','maxPopularity','minBudget','maxBudget','minStability','maxStability','probability','minMoneyPrinting'].every(key => optional(value[key],number))
    && ['requiredGroups','requiredAdvisors','requiredActions'].every(key => optional(value[key],strings))
    && optional(value.turnRange,item => numbers(item,['min','max']));
}
function effect(value: unknown): boolean {
  return object(value) && ['immediate','delayed','conditional'].includes(String(value.type)) && number(value.value)
    && ['duration','turnsUntil'].every(key => optional(value[key],number)) && optional(value.target,string) && optional(value.source,string) && optional(value.conditions,conditions);
}
function effects(value: unknown): boolean { return object(value) && list(value.immediate,effect) && optional(value.delayed,item => list(item,effect)) && optional(value.permanent,item => list(item,effect)); }
export function validPendingEvent(value: unknown): value is GameEvent {
  return object(value) && texts(value,['id','title','description']) && number(value.probability) && conditions(value.conditions) && effects(value.effects)
    && ['random','scheduled','triggered','crisis'].includes(String(value.type)) && ['political','economic','social','international','natural'].includes(String(value.category)) && ['low','medium','high','critical'].includes(String(value.severity))
    && optional(value.choices,choices => list(choices,item => object(item) && texts(item,['id','text']) && effects(item.effects) && optional(item.requirements,conditions) && optional(item.probability,number) && optional(item.consequences,result => object(result) && effects(result.success) && effects(result.failure))));
}
function election(value: unknown): boolean {
  return object(value) && number(value.votesPercentage) && bool(value.victory) && numbers(value.details,['popularityImpact','budgetImpact','groupsSupport','completedObjectivesImpact','stabilityBonus'])
    && optional(value.causal,item => object(item) && numbers(item,['apro','estructura','otros','incumbencia']) && ['aFavor','enContra'].every(key => list(item[key], entry => texts(entry,['actor']) && numbers(entry,['sat']))));
}
function objective(value: unknown): boolean {
  if (!object(value) || !texts(value,['id','title','description']) || !object(value.requirements) || !numberMap(value.reward) || !bool(value.completed) || !number(value.progress)) return false;
  const requirements = value.requirements;
  return ['popularity','budget'].every(key => optional(requirements[key],number)) && optional(requirements.completedActions,strings) && optional(requirements.groupSupport,numberMap)
    && optional(requirements.indicators,item => object(item) && Object.values(item).every(range => object(range) && optional(range.min,number) && optional(range.max,number)));
}

/** Guardas de importación puras: no migran, no escriben y no avanzan secuencias. */
export function validFullState(value: unknown): value is GameState {
  if (!object(value) || !causal(value.causal) || !object(value.causal)) return false;
  const c = value.causal;
  if (!integer(value.year) || value.year < 1 || value.year > 4 || !integer(value.turn) || value.turn < 1 || value.turn > 4 || !integer(value.term) || value.term < 1 || value.term > 2) return false;
  if (!integer(c.turn) || c.turn < 1 || c.turn > 33 || c.mandateStart !== (value.term - 1) * 16 + 1 || !SCENARIOS.some(scenario => scenario.id === c.scenarioId)) return false;
  const civil = (value.term - 1) * 16 + (value.year - 1) * 4 + value.turn;
  if (c.turn !== civil && !((value.pendingElection || value.gameOver) && c.turn === civil + 1)) return false;
  if (value.position !== 'presidente' || !['politico','empresario','sindicalista','comunicador'].includes(String(value.archetype))) return false;
  if (!['easy','normal','hard','legend'].includes(String(value.difficulty))) return false;
  return texts(value,['governorName','avatar','platformId','position','archetype','difficulty'])
    && numbers(value,['year','turn','term','actions','baseActions','moneyPrintingCount','popularity','popularidadGrupos','popularidadPolitica','budget','votingIntention','stability','legitimacy','debtCount','debtServiceRatio','consecutiveLowPopularity','consecutiveNegativeBudget','impeachmentConsecutiveTurns','coupConsecutiveTurns','radicalConciliadorAxis','populistaTecnicoAxis','cerradoConvocanteAxis','audazTurnsCount','concessionsThisTerm','lastRandomEventTurn','randomEventsThisTerm'])
    && ['advisorActionUsed','gameOver','victorious','pendingElection','pendingMidtermStrategy','isAdminMode'].every(key => bool(value[key]))
    && ['selectedActions','completedActions','pendingElectionOptions','availableMidtermStrategies'].every(key => strings(value[key]))
    && ['groupRelations','actionUsageCount','actionCooldowns','abilityCooldowns','demandPausedUntil','negotiationPending','termsByPosition'].every(key => numberMap(value[key]))
    && ['historicalPopularity','historicalBudget'].every(key => list(value[key],number))
    && list(value.advisors,item => object(item) && texts(item,['id','name','specialty','description']) && number(item.cost) && bool(item.isActive) && number(item.turnsInactive))
    && list(value.notifications,item => object(item) && texts(item,['id','type','title','message','importance']) && ['year','turn','timestamp','expiresAt'].every(key => optional(item[key],number)) && ['read','dismissed','requiresAcknowledgment'].every(key => optional(item[key],bool)) && ['category','groupId'].every(key => optional(item[key],string)))
    && list(value.objectives,objective) && list(value.completedObjectives,objective)
    && list(value.pendingEffects,item => object(item) && string(item.id) && number(item.activationTurn))
    && list(value.groupAgendas,item => object(item) && texts(item,['id','groupId','demand']) && number(item.deadline) && bool(item.satisfied) && bool(item.penaltyApplied))
    && list(value.groupMoods,item => texts(item,['groupId','mood']) && numbers(item,['ignoredTurns','lastSatisfiedTurn']))
    && object(value.interactionHistory) && Object.values(value.interactionHistory).every(item => texts(item,['lastInteraction']) && numbers(item,['turnsLeft']))
    && object(value.temporarySupportBonuses) && Object.values(value.temporarySupportBonuses).every(item => object(item) && numbers(item,['bonus','expiresAt']) && optional(item.actionMultiplier,number))
    && object(value.interactionCountByGroup) && Object.values(value.interactionCountByGroup).every(item => numbers(item,['reuniones','negociaciones']))
    && list(value.careerHistory,item => texts(item,['position','result','type']) && numbers(item,['term','startYear','endYear']))
    && list(value.turnLog,item => object(item) && texts(item,['position']) && numbers(item,['year','turn','term','popularityChange','budgetChange']) && ['actionsTaken','events','decisions','projectsCompleted','crisesFaced'].every(key => strings(item[key])))
    && nullable(value.electionResults,election) && nullable(value.legislativeSupport,number)
    && nullable(value.legislativeResults,item => texts(item,['outcome','message']) && numbers(item,['officialismVotes','oppositionVotes','legislativeSupport']))
    && optional(value.lastInteractionMessage,item => nullable(item,string))
    && optional(value.lastEventFiredTurns,numberMap) && optional(value.unlockedActions,strings)
    && optional(value.advisorSalaryVersion,item => item === 1 || item === 2)
    && optional(value.interestGroups,item => list(item,group => object(group) && string(group.id) && list(group.subgroups,sub => texts(sub,['id','name']))));
}
