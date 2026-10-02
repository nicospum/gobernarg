import { useCallback, useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { CharacterCreation } from './components/CharacterCreation';
import { GameSetup, type CharacterDraft } from './components/GameSetup';
import { recordReelectionWin } from './causal/progress';
import { WelcomeScreen } from './components/WelcomeScreen';
import { WelcomeModal } from './components/WelcomeModal';
import { CausalDashboard } from './components/causal/CausalDashboard';
import { markGameStart } from './components/causal/FeedbackForm';
import { applyCommand } from './causal/engine';
import { deserializeSession, newSession, SAVE_KEY, serializeSession, type GameSession } from './causal/persistence';
import type { CommandParams, GameCommand } from './causal/types';
import type { Difficulty, Profile } from './causal/campaignTypes';
import { TURNS_PER_TERM } from './causal/catalog';
import { getScenario } from './causal/scenarios';

/** "Laura Méndez · Mandato 1, turno 5 · Herencia pesada" para el botón Continuar partida. */
function savedLabel(session: GameSession | null): string | null {
  if (!session) return null;
  const s = session.state;
  const inTerm = (s.turn - 1) % TURNS_PER_TERM + 1;
  const scenario = getScenario(s.scenarioId);
  return [s.name, `Mandato ${s.term}, turno ${inTerm}`, scenario?.name].filter(Boolean).join(' · ');
}

function readSave(): { session: GameSession | null; error: string | null } {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY);
    return { session: raw ? deserializeSession(raw) : null, error: null };
  } catch (error) {
    return { session: null, error: `No se pudo abrir el guardado: ${error instanceof Error ? error.message : 'datos inválidos'}` };
  }
}

export default function CausalApp() {
  const [loaded] = useState(readSave);
  const [session, setSession] = useState<GameSession | null>(loaded.session);
  const current = useRef(session);
  const [screen, setScreen] = useState<'welcome' | 'character' | 'setup' | 'intro' | 'game'>('welcome');
  // Inicio en dos pasos: personaje (draft) y después dificultad, escenario y plataforma.
  const [draft, setDraft] = useState<CharacterDraft | null>(null);
  const [savingError, setSavingError] = useState<string | null>(loaded.error);
  useEffect(() => {
    if (!session) return;
    try { window.localStorage.setItem(SAVE_KEY, serializeSession(session)); setSavingError(null); }
    catch { setSavingError('No se pudo guardar en este navegador. La partida sigue abierta; evitá cerrar o recargar la página.'); }
  }, [session]);
  const commit = useCallback((command: GameCommand): boolean => {
    const existing = current.current;
    if (!existing) return false;
    const result = applyCommand(existing.state, command);
    if (!result.accepted) { toast.error(result.message); return false; }
    const next = { ...existing, state: result.state, commands: [...existing.commands, command] };
    current.current = next; setSession(next); toast.success(result.message);
    return true;
  }, []);
  const continueToSetup = (archetype: Profile, name: string, avatar: string) => {
    if (!name.trim()) return;
    setDraft({ archetype, governorName: name.trim(), avatar });
    setScreen('setup');
  };
  const start = (platformId: string, scenarioId: string, difficulty: Difficulty) => {
    if (!draft) return;
    const next = newSession({ name: draft.governorName, profile: draft.archetype, avatar: draft.avatar, difficulty, scenarioId, platformId });
    current.current = next; setSession(next); setScreen('intro'); markGameStart();
  };
  // Ganar la reelección desbloquea el siguiente escenario histórico. Se cuenta una
  // sola vez por elección (la partida se reconstruye comando por comando al recargar).
  useEffect(() => {
    const elections = session?.state.campaign?.elections ?? [];
    const last = elections[elections.length - 1];
    if (!session || !last || last.kind !== 'presidential' || !last.won) return;
    const resolved = [...session.commands].reverse().find(cmd => cmd.type === 'resolve_election');
    if (!resolved) return;
    if (recordReelectionWin(resolved.id).counted) toast.success('Ganaste la reelección: desbloqueaste un escenario histórico nuevo.');
  }, [session]);
  const restart = () => {
    try { window.localStorage.removeItem(SAVE_KEY); } catch { /* Storage failure must not crash restart. */ }
    current.current = null; setSession(null); setScreen('character');
  };
  const makeCommand = (type: GameCommand['type'], actionId?: string, params?: CommandParams): boolean => {
    if (!session) return false;
    return commit({ id: crypto.randomUUID(), expectedTurn: session.state.turn, type, actionId, params });
  };
  return <div className={`situation-room b-screen-${screen}`}>
    <Toaster theme="dark" position="bottom-right" richColors containerAriaLabel="Avisos" />
    {screen === 'welcome' && <><WelcomeScreen onStart={() => setScreen('character')} savedLabel={savedLabel(session)} onContinue={() => setScreen('game')} />{savingError && <p role="alert" className="fixed bottom-4 left-4 right-4 rounded-lg bg-card border border-amber-300/40 p-4 text-sm text-amber-100">{savingError} Al empezar una partida nueva se crea un guardado nuevo.</p>}</>}
    {screen === 'character' && <CharacterCreation onComplete={continueToSetup} initial={draft} />}
    {screen === 'setup' && draft && <GameSetup draft={draft} onBack={() => setScreen('character')} onStart={start} />}
    {screen === 'intro' && session && <WelcomeModal governorName={session.state.name} onStart={() => setScreen('game')} />}
    {screen === 'game' && session && <CausalDashboard state={session.state} savingError={savingError}
      onExecute={(id, params) => makeCommand('execute', id, params)} onCommand={(type, targetId, choiceId) => commit({ id: crypto.randomUUID(), expectedTurn: session.state.turn, type, targetId, choiceId })} onRestart={restart} />}
  </div>;
}
