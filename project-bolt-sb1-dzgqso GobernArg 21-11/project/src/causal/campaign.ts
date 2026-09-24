import { ACTORS, POLICIES } from './catalog';
import { ABILITIES, CABINET, CAMPAIGN_EVENTS, DIFFICULTIES, STRATEGIES } from './campaignCatalog';
import { clamp, hasRecentMeeting, isProject, totalArrears } from './selectors';
import type { CampaignDelta, Difficulty, Strategy } from './campaignTypes';
import type { CausalState, GameCommand, IndicatorId, PolicyDefinition } from './types';

export const CAMPAIGN_COMMANDS = ['hire_advisor', 'dismiss_advisor', 'train_advisor', 'use_ability', 'choose_event', 'choose_strategy', 'resolve_election', 'acknowledge_result', 'read_news', 'dismiss_news'];
export function addNews(state: CausalState, title: string, text: string, importance: 'normal' | 'warning' | 'critical' = 'normal') {
  const c = state.campaign;
  if (c) c.news.push({ id: `news:${state.turn}:${c.news.length}`, turn: state.turn, title, text, importance, read: false, dismissed: false });
}
export function enableCampaign(state: CausalState, difficulty: Difficulty = 'normal') {
  if (state.campaign) return;
  state.campaign = {
    version: 1, difficulty, advisors: [], cabinetActionTurn: 0, abilities: {}, communication: { value: 0, until: 0 },
    axes: { radical: 0, technical: 0, open: 0 }, seats: { oficialismo: 40, aliados: 15, oposicion: 45 },
    strategy: null, strategyUntil: 0, strategyPending: false, pendingEvent: null, eventHistory: [], randomSeed: 20260924,
    lastEventTurn: state.turn, news: [], objectives: [
      { id: 'services', title: 'Servicios que funcionan', description: 'Educación, salud y protección social en 60 o más.', progress: 0, completed: false, reward: 120 },
      { id: 'delivery', title: 'Gobierno que cumple', description: 'Cumplir tres acuerdos verificables.', progress: 0, completed: false, reward: 100 },
      { id: 'publicworks', title: 'Capacidad para el futuro', description: 'Ejecutar tres obras distintas y alcanzar infraestructura 55.', progress: 0, completed: false, reward: 150 },
    ], elections: [], resultPending: false, votes: state.socialComponent, approval: state.socialComponent,
    stability: 70, legitimacy: 55, lowApprovalTurns: 0, insolvencyTurns: 0, impeachmentTurns: 0, coupTurns: 0,
    hyperinflationTurns: 0, outcome: null, outcomeReason: '', governanceUntil: 0,
  };
  refreshPolitics(state);
  state.actionPoints += state.profile === 'sindicalista' ? 1 : 0;
  addNews(state, 'Comienza una nueva etapa', 'Gabinete, perfiles, eventos y calendario electoral activos. Tus compromisos y deudas se conservan.');
}
export function campaignBlock(state: CausalState): string | null {
  const c = state.campaign;
  if (c?.pendingEvent) return 'Primero respondé el evento pendiente.';
  if (c?.resultPending) return 'Primero revisá el resultado electoral.';
  if (c?.strategyPending) return 'Elegí tu estrategia para la segunda mitad del mandato.';
  return null;
}
export function campaignActionPoints(state: CausalState) {
  if (!state.campaign) return 4;
  return 4 + (state.profile === 'sindicalista' ? 1 : 0) + state.campaign.advisors
    .filter(a => a.activeFrom <= state.turn).reduce((sum, a) => sum + (CABINET.find(d => d.id === a.id)?.bonusActions ?? 0), 0);
}
export function electoralBreakdown(state: CausalState) {
  const c = state.campaign;
  const social = state.socialComponent * .75;
  const organization = (state.actors.oficialismo.relationship * .6 + state.actors.aliados.relationship * .25 + state.actors.gobernadores.relationship * .15) * .15;
  const resolved = state.agreements.filter(a => a.status !== 'pending');
  const credibility = (resolved.length ? resolved.filter(a => a.status === 'fulfilled').length / resolved.length * 100 : 50) * .10;
  const communication = c && state.turn < c.communication.until ? c.communication.value : 0;
  const wear = Math.min(4, Math.floor((state.turn - 1) / 8));
  const difficulty = c ? DIFFICULTIES[c.difficulty].electionPenalty : 0;
  const base = clamp(social + organization + credibility + communication - wear - difficulty);
  const incumbency = c && state.profile === 'politico' && state.term === 1 ? .05 * (100 - base) : 0;
  return { social, organization, credibility, communication, wear, difficulty, incumbency, total: clamp(base + incumbency) };
}
export function refreshPolitics(state: CausalState) {
  const c = state.campaign;
  if (!c) return;
  const conflict = ACTORS.filter(a => state.actors[a.id].conflict).length;
  const resolved = state.agreements.filter(a => a.status !== 'pending');
  const kept = resolved.length ? resolved.filter(a => a.status === 'fulfilled').length / resolved.length * 100 : 50;
  c.approval = state.socialComponent;
  c.stability = clamp(85 - conflict * 7 - Math.min(45, totalArrears(state) / 20));
  c.legitimacy = clamp(.6 * state.indicators.derechos + .4 * kept);
  c.votes = electoralBreakdown(state).total;
}
function scheduleDelta(state: CausalState, delta: CampaignDelta, executionId: string, label: string, start: number) {
  const c = state.campaign!;
  if (delta.cabinet && c.advisors.length) {
    const member = c.advisors[0];
    const bonus = CABINET.find(a => a.id === member.id)?.bonusActions ?? 0;
    if (member.activeFrom <= state.turn) state.actionPoints = Math.max(0, state.actionPoints - bonus);
    if (delta.cabinet === 'resign') c.advisors.shift();
    else member.activeFrom = Math.max(member.activeFrom, state.turn + 2);
  }
  for (const [key, original] of Object.entries(delta.indicator ?? {})) {
    const target = key as IndicatorId;
    const adverse = target === 'inflacion' ? original! > 0 : original! < 0;
    const magnitude = original! * (state.profile === 'comunicador' && adverse && label.startsWith('Evento:') ? .7 : 1);
    state.effects.push({ id: `${executionId}:${target}`, executionId, effectId: `${executionId}:${target}`, actionId: label,
      startTurn: start, endExclusive: start + 1, magnitude, kind: 'indicator', target, operation: 'pulse', lastAppliedTurn: null });
  }
  for (const actor of ACTORS) if (delta.relationship?.[actor.id]) state.actors[actor.id].relationship = clamp(state.actors[actor.id].relationship + delta.relationship[actor.id]!);
  if (delta.communication) c.communication = { value: Math.max(c.communication.value && state.turn < c.communication.until ? c.communication.value : 0, delta.communication), until: state.turn + 3 };
}
function recordExpense(state: CausalState, cmd: GameCommand, title: string, cost: number, points: number) {
  state.cash -= cost; state.actionPoints -= points;
  state.history.push({ id: cmd.id, actionId: title, turn: state.turn, params: {}, cashDelta: -cost, actionCost: points, efficacy: 1 });
}
export function campaignPolicyExecuted(state: CausalState, policy: PolicyDefinition) {
  const c = state.campaign;
  if (!c) return;
  const a = c.axes;
  if (policy.id === 'reunirse' || policy.id === 'negociar') a.open += 4;
  else if (policy.id === 'firmar_acuerdo') { a.open += 3; a.radical -= 2; }
  else {
    a.open -= 1;
    a.technical += isProject(policy.id) || policy.category === 'Desarrollo' ? 3 : policy.category === 'Servicios' || policy.category === 'Cultura' ? -2 : 0;
    a.radical += policy.requirements.some(r => r.kind === 'legislative') || policy.category === 'Seguridad' ? 3 : -1;
  }
  for (const key of ['open', 'radical', 'technical'] as const) a[key] = clamp(a[key], -100, 100);
}
function progressObjectives(state: CausalState) {
  const c = state.campaign!;
  const values = [
    Math.min(state.indicators.educacion, state.indicators.salud, state.indicators.proteccion) / 60,
    state.agreements.filter(a => a.status === 'fulfilled').length / 3,
    Math.min(new Set(state.history.filter(h => isProject(h.actionId)).map(h => h.actionId)).size / 3, state.indicators.infraestructura / 55),
  ];
  c.objectives.forEach((objective, i) => {
    if (objective.completed) return;
    objective.progress = clamp(values[i] * 100);
    if (objective.progress >= 100) {
      objective.completed = true;
      // Reward is an authorized grant booked at the next close, never unreported cash.
      const id = `objective:${objective.id}`;
      state.effects.push({ id, executionId: id, effectId: id, actionId: objective.title, kind: 'ledger', target: 'revenue_once', operation: 'flow',
        magnitude: objective.reward, startTurn: state.turn + 1, endExclusive: state.turn + 2, lastAppliedTurn: null });
      addNews(state, `Objetivo cumplido: ${objective.title}`, `Aporte extraordinario de ${objective.reward} U programado para el siguiente cierre.`);
    }
  });
}
function finish(state: CausalState, reason: string, outcome: 'victory' | 'defeat' | 'retired') {
  state.phase = 'ended'; state.campaign!.outcome = outcome; state.campaign!.outcomeReason = reason;
  state.campaign!.pendingEvent = null; state.campaign!.strategyPending = false; state.campaign!.resultPending = false;
  addNews(state, outcome === 'victory' ? 'Legado presidencial' : 'Fin de la gestión', reason, outcome === 'defeat' ? 'critical' : 'normal');
}
function checkDefeat(state: CausalState) {
  const c = state.campaign!;
  c.lowApprovalTurns = c.approval < 25 ? c.lowApprovalTurns + 1 : 0;
  c.insolvencyTurns = totalArrears(state) > 600 ? c.insolvencyTurns + 1 : 0;
  c.impeachmentTurns = c.legitimacy < 20 && state.indicators.derechos < 25 ? c.impeachmentTurns + 1 : 0;
  c.coupTurns = c.stability < 15 && state.actors.oficialismo.relationship < 25 ? c.coupTurns + 1 : 0;
  c.hyperinflationTurns = state.indicators.inflacion >= 95 && state.indicators.ingreso_real < 20 ? c.hyperinflationTurns + 1 : 0;
  const cases: [number, number, string][] = [
    [c.lowApprovalTurns, 2, 'Pérdida de apoyo: aprobación material menor a 25 durante dos cierres.'],
    [c.insolvencyTurns, 3, 'Insolvencia: más de 600 U de atrasos durante tres cierres.'],
    [c.impeachmentTurns, 2, 'Juicio político: legitimidad menor a 20 y garantías menores a 25 durante dos cierres.'],
    [c.coupTurns, 3, 'Ruptura institucional: estabilidad menor a 15 y relación con el oficialismo menor a 25 durante tres cierres.'],
    [c.hyperinflationTurns, 2, 'Colapso inflacionario: inflación de 95 o más e ingreso real menor a 20 durante dos cierres.'],
  ];
  for (const [value, threshold, message] of cases) {
    if (value >= threshold) { finish(state, message, 'defeat'); return; }
    if (value > 0) addNews(state, 'Riesgo de continuidad', `${message} Acumulado: ${value}/${threshold}.`, 'critical');
  }
}
function nextRandom(state: CausalState) {
  const c = state.campaign!;
  c.randomSeed = (Math.imul(1664525, c.randomSeed) + 1013904223) >>> 0;
  return c.randomSeed / 4294967296;
}
export function eligibleCampaignEvents(state: CausalState) {
  const c = state.campaign;
  if (!c) return [];
  const midterm = c.elections.find(e => e.kind === 'legislative' && e.term === state.term);
  return CAMPAIGN_EVENTS.filter(event => {
    if (c.eventHistory.some(h => h.id === event.id && state.turn - h.turn < 6)) return false;
    if (event.id.startsWith('oposicion_')) return !!midterm && !midterm.won;
    if (event.id.startsWith('desgaste_')) return !!midterm && midterm.won;
    switch (event.id) {
      case 'minister_resignation': return c.advisors.length > 0;
      case 'debt_default': return totalArrears(state) > 0;
      case 'police_violence_scandal': return state.indicators.derechos < 55 && state.history.some(h => state.turn - h.turn < 3 && POLICIES.some(p => p.id === h.actionId && p.category === 'Seguridad'));
      case 'energy_crisis': return state.indicators.infraestructura < 50;
      case 'general_strike': return state.actors.sindicatos.conflict || state.actors.sindicatos.satisfaction < 40;
      case 'external_sanctions': return state.indicators.derechos < 40;
      case 'students': return state.indicators.educacion < 55;
      case 'health': return state.indicators.salud < 55;
      case 'inflation': return state.indicators.inflacion >= 55;
      case 'drug_wave': return state.indicators.seguridad < 50;
      default: return true;
    }
  });
}
export function settleCampaignClose(state: CausalState) {
  const c = state.campaign;
  if (!c) return;
  refreshPolitics(state); progressObjectives(state); checkDefeat(state);
  if (state.phase === 'ended') return;
  const inTerm = (state.turn - 1) % 16 + 1;
  if (c.strategy === 'jugada_audaz' && state.turn >= c.strategyUntil) {
    c.strategy = 'negociar'; addNews(state, 'Termina la Jugada Audaz', 'El gobierno vuelve a una estrategia de negociación.');
  }
  if (c.strategy === 'acelerar' || c.strategy === 'jugada_audaz') c.axes.radical = clamp(c.axes.radical + 4, -100, 100);
  if (c.strategy === 'abrirse') c.axes.open = clamp(c.axes.open + 3, -100, 100);
  const milestones: Record<number, string> = { 2: 'Apertura de sesiones ordinarias', 4: 'Primer informe de gestión', 6: 'Comienza la campaña legislativa', 10: 'Último período legislativo', 14: 'Comienza la campaña presidencial' };
  if (milestones[inTerm]) addNews(state, milestones[inTerm], `Mandato ${state.term}. La ciudadanía evalúa resultados y compromisos cumplidos.`);
  if (inTerm === 8) {
    const legislativeVotes = clamp(c.votes - electoralBreakdown(state).incumbency);
    // Renew half of each block; total always remains 100 seats.
    const renewed = Math.round(clamp(legislativeVotes, 10, 85) * .5);
    const allies = Math.round((50 - renewed) * .25);
    c.seats.oficialismo = Math.floor(c.seats.oficialismo / 2) + renewed;
    c.seats.aliados = Math.floor(c.seats.aliados / 2) + allies;
    c.seats.oposicion = 100 - c.seats.oficialismo - c.seats.aliados;
    c.elections.push({ turn: state.turn, term: state.term, kind: 'legislative', votes: legislativeVotes, won: legislativeVotes >= 45, ownSeats: c.seats.oficialismo });
    c.resultPending = true; c.strategyPending = true;
    addNews(state, 'Elecciones de medio término', `${legislativeVotes.toFixed(1)}% de votos. El oficialismo queda con ${c.seats.oficialismo} bancas.`, 'warning');
    return;
  }
  if (inTerm === 16) {
    addNews(state, 'Cierre del mandato', `Proyección electoral: ${c.votes.toFixed(1)}%. ${state.term >= 2 ? 'Se alcanzó el límite de dos mandatos.' : 'Podés presentarte a la reelección o retirarte.'}`);
    if (state.term >= 2) finish(state, c.objectives.every(o => o.completed) && c.votes >= 45
      ? 'Completaste dos mandatos, los tres objetivos y conservaste respaldo electoral.' : 'Completaste los dos mandatos permitidos. El legado registra los objetivos y resultados alcanzados.',
    c.objectives.every(o => o.completed) && c.votes >= 45 ? 'victory' : 'retired');
    return;
  }
  if (state.turn - c.lastEventTurn >= 3 && nextRandom(state) < DIFFICULTIES[c.difficulty].eventChance) {
    let candidates = eligibleCampaignEvents(state);
    if (state.indicators.inflacion >= 65 && candidates.some(e => e.id === 'inflation')) candidates = candidates.filter(e => e.id === 'inflation');
    if (candidates.length) {
      const event = candidates[Math.floor(nextRandom(state) * candidates.length)];
      c.pendingEvent = { id: event.id, turn: state.turn }; c.lastEventTurn = state.turn;
      addNews(state, event.title, event.description, 'warning');
    }
  }
  const conflicts = ACTORS.filter(a => state.actors[a.id].conflict);
  addNews(state, `Informe del trimestre ${inTerm}`, conflicts.length ? `Presión activa de ${conflicts.map(a => a.name).join(', ')}. Revisá sus prioridades y compromisos.` : 'El trimestre concluye sin canales de conflicto activos. Revisá los resultados de tus políticas.');
}

/** Mutates a draft only. Caller discards it on rejection; preview uses its own clone. */
export function runCampaignCommand(state: CausalState, cmd: GameCommand): string | null {
  const c = state.campaign;
  if (!c) return 'Esta partida no tiene la campaña política activa.';
  if (cmd.type === 'read_news' || cmd.type === 'dismiss_news') {
    const items = cmd.targetId === 'all' ? c.news : c.news.filter(n => n.id === cmd.targetId);
    if (!items.length) return 'La noticia no existe.';
    for (const item of items) { if (cmd.type === 'read_news') item.read = true; else item.dismissed = true; }
    return null;
  }
  if (state.phase === 'ended') return 'Esta gestión ya terminó.';
  if (cmd.type === 'resolve_election') {
    if (state.phase !== 'mandate_review' || state.term >= 2) return 'No hay una reelección pendiente.';
    const won = c.votes >= 45;
    c.elections.push({ turn: state.turn - 1, term: state.term, kind: 'presidential', votes: c.votes, won, ownSeats: c.seats.oficialismo });
    if (!won) finish(state, `Derrota electoral: ${c.votes.toFixed(1)}% de votos; necesitabas 45%.`, 'defeat');
    else {
      state.term += 1; state.phase = 'governing'; c.strategy = null; c.strategyPending = false; c.resultPending = true;
      state.actionPoints = campaignActionPoints(state);
      addNews(state, 'Reelección ganada', `${c.votes.toFixed(1)}% de votos. Comienza el segundo mandato; se mantienen deudas, obras, asesores y compromisos.`);
      refreshPolitics(state);
    }
    return null;
  }
  if (cmd.type === 'acknowledge_result') {
    if (!c.resultPending) return 'No hay un resultado pendiente.';
    c.resultPending = false; return null;
  }
  if (cmd.type === 'choose_strategy') {
    if (!c.strategyPending || c.resultPending || !Object.prototype.hasOwnProperty.call(STRATEGIES, cmd.targetId ?? '')) return 'No hay una estrategia válida pendiente.';
    c.strategy = cmd.targetId as Strategy; c.strategyUntil = state.turn + 1; c.strategyPending = false;
    addNews(state, 'Nueva estrategia', STRATEGIES[c.strategy].name); return null;
  }
  if (cmd.type === 'choose_event') {
    if (state.phase !== 'governing' || !c.pendingEvent || c.pendingEvent.id !== cmd.targetId) return 'Ese evento ya no está pendiente.';
    const event = CAMPAIGN_EVENTS.find(e => e.id === cmd.targetId)!;
    const choice = event.choices.find(o => o.id === cmd.choiceId);
    if (!choice) return 'Respuesta desconocida.';
    if (state.cash < choice.cost) return `Necesitás ${choice.cost} U.`;
    recordExpense(state, cmd, `Evento: ${event.title} — ${choice.label}`, choice.cost, 0);
    scheduleDelta(state, choice.effect, cmd.id, `Evento: ${event.title}`, state.turn);
    c.eventHistory.push({ id: event.id, turn: state.turn, choiceId: choice.id }); c.pendingEvent = null;
    addNews(state, event.title, `Decisión: ${choice.label}. ${choice.description}`); refreshPolitics(state); return null;
  }
  if (state.phase !== 'governing') return 'Primero resolvé el cierre del mandato.';
  const block = campaignBlock(state); if (block) return block;
  if (state.actionPoints < 1) return 'Necesitás un punto de acción.';
  if (['hire_advisor', 'dismiss_advisor', 'train_advisor'].includes(cmd.type)) {
    const definition = CABINET.find(a => a.id === cmd.targetId);
    if (!definition) return 'Asesor desconocido.';
    const member = c.advisors.find(a => a.id === cmd.targetId);
    if (c.cabinetActionTurn === state.turn) return 'Ya gestionaste el gabinete este turno.';
    if (cmd.type === 'hire_advisor') {
      if (member || c.advisors.length >= 2) return 'Hay dos cargos disponibles y cada asesor solo puede ocupar uno.';
      if (c.approval < definition.minimumApproval) return `Requiere aprobación de ${definition.minimumApproval}.`;
      if (state.cash < definition.cost || totalArrears(state) > 0) return `Necesitás ${definition.cost} U y no tener atrasos.`;
      recordExpense(state, cmd, `Contratar: ${definition.name}`, definition.cost, 1);
      c.advisors.push({ id: definition.id, level: definition.level, hiredTurn: state.turn, activeFrom: state.turn + 1 });
    } else if (cmd.type === 'dismiss_advisor') {
      if (!member) return 'Ese asesor no pertenece al gabinete.';
      recordExpense(state, cmd, `Despedir: ${definition.name}`, 0, 1);
      // Remove unused bonus capacity immediately; hiring never grants same-turn capacity.
      state.actionPoints = Math.max(0, state.actionPoints - (member.activeFrom <= state.turn ? definition.bonusActions : 0));
      c.advisors = c.advisors.filter(a => a.id !== member.id);
    } else {
      if (!member || member.level >= 5 || member.activeFrom > state.turn) return 'El asesor debe estar activo y tener nivel menor a 5.';
      const cost = 50 * (member.level + 1);
      if (state.cash < cost || totalArrears(state) > 0) return `Necesitás ${cost} U y no tener atrasos.`;
      recordExpense(state, cmd, `Capacitar: ${definition.name}`, cost, 1);
      state.actionPoints = Math.max(0, state.actionPoints - definition.bonusActions);
      member.level += 1; member.activeFrom = state.turn + 2;
    }
    c.cabinetActionTurn = state.turn;
    addNews(state, 'Gabinete presidencial', `${definition.name}: ${cmd.type === 'hire_advisor' ? 'se incorpora el próximo turno' : cmd.type === 'dismiss_advisor' ? 'deja el gabinete' : 'entra en capacitación y vuelve dentro de dos turnos'}.`);
    return null;
  }
  if (cmd.type === 'use_ability') {
    const ability = ABILITIES.find(a => a.id === cmd.targetId && a.profile === state.profile);
    if (!ability) return 'Esta habilidad no corresponde a tu perfil.';
    if ((c.abilities[ability.id] ?? 0) > state.turn) return `Disponible desde T${c.abilities[ability.id]}.`;
    if (state.cash < ability.cost || totalArrears(state) > 0) return `Necesitás ${ability.cost} U y no tener atrasos.`;
    if (ability.requirement === 'investment' && (!hasRecentMeeting(state, 'industria') || state.indicators.credito < 35)) return 'Requiere reunión vigente con industria y crédito de al menos 35.';
    if (ability.requirement === 'labor' && !hasRecentMeeting(state, 'sindicatos')) return 'Requiere reunión vigente con sindicatos.';
    if (ability.requirement === 'pact' && (!hasRecentMeeting(state, 'aliados') || !hasRecentMeeting(state, 'oposicion'))) return 'Requiere reuniones vigentes con aliados y oposición.';
    recordExpense(state, cmd, ability.name, ability.cost, 1);
    scheduleDelta(state, ability.effect, cmd.id, ability.name, state.turn + 1);
    if (ability.requirement === 'pact') c.governanceUntil = state.turn + 3;
    c.abilities[ability.id] = state.turn + ability.cooldown;
    addNews(state, ability.name, ability.description); refreshPolitics(state); return null;
  }
  return 'Comando político desconocido.';
}
export function campaignActionReason(state: CausalState, type: GameCommand['type'], targetId?: string, choiceId?: string) {
  return runCampaignCommand(structuredClone(state), { id: 'preview-campaign', expectedTurn: state.turn, type, targetId, choiceId });
}
