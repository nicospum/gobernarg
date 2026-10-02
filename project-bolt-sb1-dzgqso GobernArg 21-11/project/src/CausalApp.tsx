import { useCallback, useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { NewGameScreen, type NewGameChoice } from './components/NewGameScreen';
import { WelcomeScreen } from './components/WelcomeScreen';
import { CausalDashboard } from './components/causal/CausalDashboard';
import { markGameStart } from './components/causal/FeedbackForm';
import { applyCommand } from './causal/engine';
import { deserializeSession, newSession, SAVE_KEY, serializeSession, type GameSession } from './causal/persistence';
import type { CommandParams, GameCommand } from './causal/types';
import { TURNS_PER_TERM } from './causal/catalog';
import { getScenario } from './causal/scenarios';
import { recordReelectionWin } from './causal/progress';
import { LITE_FEATURES } from './lite/config';

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
  const [screen, setScreen] = useState<'welcome' | 'new' | 'game'>('welcome');
  const [savingError, setSavingError] = useState<string | null>(loaded.error);
  // Cada pantalla empieza arriba (en el celular la de nueva partida es larga).
  useEffect(() => { window.scrollTo?.({ top: 0 }); }, [screen]);
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
  // El nivel (o el escenario histórico) fija el país y la exigencia que sugiere.
  const start = (choice: NewGameChoice) => {
    const scenario = getScenario(choice.scenarioId);
    const next = newSession({ name: choice.name, profile: choice.profile, avatar: choice.avatar, difficulty: scenario?.suggestedDifficulty ?? 'normal', scenarioId: scenario?.id });
    current.current = next; setSession(next); setScreen('game'); markGameStart();
  };
  // Ganar la reelección desbloquea el siguiente escenario histórico. Se cuenta una
  // sola vez por elección (la partida se reconstruye comando por comando al recargar).
  // Con los escenarios ocultos (LITE_FEATURES) se cuenta igual, pero sin aviso.
  useEffect(() => {
    const elections = session?.state.campaign?.elections ?? [];
    const last = elections[elections.length - 1];
    if (!session || !last || last.kind !== 'presidential' || !last.won) return;
    const resolved = [...session.commands].reverse().find(cmd => cmd.type === 'resolve_election');
    if (!resolved) return;
    if (recordReelectionWin(resolved.id).counted && LITE_FEATURES.escenariosHistoricos) toast.success('Ganaste la reelección: desbloqueaste un escenario histórico nuevo.');
  }, [session]);
  const restart = () => {
    try { window.localStorage.removeItem(SAVE_KEY); } catch { /* Storage failure must not crash restart. */ }
    current.current = null; setSession(null); setScreen('new');
  };
  const makeCommand = (type: GameCommand['type'], actionId?: string, params?: CommandParams): boolean => {
    if (!session) return false;
    return commit({ id: crypto.randomUUID(), expectedTurn: session.state.turn, type, actionId, params });
  };
  return <div className={`situation-room b-screen-${screen}`}>
    <Toaster theme="dark" position="bottom-right" richColors containerAriaLabel="Avisos" />
    {screen === 'welcome' && <><WelcomeScreen onStart={() => setScreen('new')} savedLabel={savedLabel(session)} onContinue={() => setScreen('game')} />{savingError && <p role="alert" className="fixed bottom-4 left-4 right-4 rounded-lg bg-card border border-amber-300/40 p-4 text-sm text-amber-100">{savingError} Al empezar una partida nueva se crea un guardado nuevo.</p>}</>}
    {screen === 'new' && <NewGameScreen onBack={() => setScreen('welcome')} onStart={start} />}
    {screen === 'game' && session && <CausalDashboard state={session.state} savingError={savingError}
      onExecute={(id, params) => makeCommand('execute', id, params)} onCommand={(type, targetId, choiceId) => commit({ id: crypto.randomUUID(), expectedTurn: session.state.turn, type, targetId, choiceId })} onRestart={restart} />}
  </div>;
}
