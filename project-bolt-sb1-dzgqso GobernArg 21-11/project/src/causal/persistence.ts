import { ACTORS, INDICATORS } from './catalog';
import { applyCommand, createCausalGame } from './engine';
import { AGREEMENT_LABELS } from './interactions';
import { CAMPAIGN_COMMANDS, enableCampaign } from './campaign';
import { DIFFICULTIES } from './campaignCatalog';
import type { Difficulty } from './campaignTypes';
import { getScenario, isValidPlatformId } from './scenarios';
import type { CausalState, GameCommand } from './types';

export const SAVE_KEY = 'gobernarg.causal.v1';
interface Player { name: string; profile: string; avatar: string; difficulty?: Difficulty; scenarioId?: string; platformId?: string }
/** El escenario y la plataforma son parte de la creación: la reconstrucción parte del mismo país. */
const gameOptions = (player: Player) => ({ scenarioId: player.scenarioId, platformId: player.platformId });
export interface GameSession { player: Player; commands: GameCommand[]; state: CausalState }
export function newSession(player: Player): GameSession {
  const state = createCausalGame(player.name, player.profile, player.avatar, gameOptions(player));
  enableCampaign(state, player.difficulty ?? 'normal');
  return { player, commands: [], state };
}
export function serializeSession(session: GameSession): string {
  // Replay is authoritative: saved derived indicators cannot be tampered with or go stale.
  return JSON.stringify({ schemaVersion: 1, modelVersion: 'causal-1', campaignVersion: 1, player: session.player, commands: session.commands });
}
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function validCommand(value: unknown): value is GameCommand {
  if (!isObject(value) || typeof value.id !== 'string' || value.id.length > 180 || !Number.isInteger(value.expectedTurn)
    || typeof value.expectedTurn !== 'number' || value.expectedTurn < 1
    || !['execute', 'close_turn', 'end_game', ...CAMPAIGN_COMMANDS].includes(String(value.type))) return false;
  if (['targetId', 'choiceId'].some(key => value[key] !== undefined && (typeof value[key] !== 'string' || (value[key] as string).length > 250))) return false;
  if (value.actionId !== undefined && typeof value.actionId !== 'string') return false;
  if (value.params !== undefined) {
    if (!isObject(value.params)) return false;
    const p = value.params;
    if (Object.keys(p).some(key => !['actorId', 'projectId', 'billId', 'loanId', 'templateId', 'offerId', 'indicatorId'].includes(key))) return false;
    if (Object.values(p).some(item => typeof item !== 'string' || item.length > 250)) return false;
    if (p.actorId !== undefined && !ACTORS.some(actor => actor.id === p.actorId)) return false;
    if (p.indicatorId !== undefined && !INDICATORS.some(indicator => indicator.id === p.indicatorId)) return false;
    if (p.templateId !== undefined && !Object.prototype.hasOwnProperty.call(AGREEMENT_LABELS, String(p.templateId))) return false;
  }
  return true;
}
export function deserializeSession(text: string): GameSession {
  if (text.length > 2_000_000) throw new Error('La partida guardada supera el tamaño permitido.');
  const value: unknown = JSON.parse(text);
  if (!isObject(value) || value.schemaVersion !== 1 || value.modelVersion !== 'causal-1') throw new Error('Esta partida pertenece a otro motor. El guardado anterior no se convierte automáticamente.');
  if (!isObject(value.player) || typeof value.player.name !== 'string' || !value.player.name.trim()
    || value.player.name.length > 120 || typeof value.player.profile !== 'string' || typeof value.player.avatar !== 'string'
    || !Array.isArray(value.commands) || value.commands.length > 10_000) throw new Error('La partida guardada tiene datos inválidos.');
  if (value.player.difficulty !== undefined && !Object.prototype.hasOwnProperty.call(DIFFICULTIES, String(value.player.difficulty))) throw new Error('Dificultad inválida.');
  if (value.player.scenarioId !== undefined && !getScenario(String(value.player.scenarioId))) throw new Error('Escenario inválido.');
  if (value.player.platformId !== undefined && !isValidPlatformId(value.player.platformId)) throw new Error('Plataforma inválida.');
  if (value.campaignVersion !== 1) throw new Error('Versión de campaña no compatible.');
  const player: Player = { name: value.player.name, profile: value.player.profile, avatar: value.player.avatar,
    ...(value.player.difficulty ? { difficulty: value.player.difficulty as Difficulty } : {}),
    ...(value.player.scenarioId ? { scenarioId: String(value.player.scenarioId) } : {}),
    ...(value.player.platformId ? { platformId: String(value.player.platformId) } : {}) };
  const session = newSession(player);
  for (const item of value.commands) {
    if (!validCommand(item)) throw new Error('El historial guardado contiene un comando inválido.');
    const result = applyCommand(session.state, item);
    if (!result.accepted) throw new Error(`No se pudo reconstruir la partida: ${result.message}`);
    session.state = result.state; session.commands.push(item);
  }
  return session;
}
