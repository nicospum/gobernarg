import { useCallback, useEffect, useRef, useState } from 'react';
import { Toaster, toast } from 'sonner';
import { CharacterCreation } from './components/CharacterCreation';
import { WelcomeScreen } from './components/WelcomeScreen';
import { WelcomeModal } from './components/WelcomeModal';
import { CausalDashboard } from './components/causal/CausalDashboard';
import { applyCommand } from './causal/engine';
import { deserializeSession, newSession, SAVE_KEY, serializeSession, type GameSession } from './causal/persistence';
import type { Archetype, Position } from './types/game';
import type { CommandParams, GameCommand } from './causal/types';
import type { Difficulty } from './causal/campaignTypes';

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
  const [screen, setScreen] = useState<'welcome' | 'character' | 'intro' | 'game'>(loaded.session ? 'game' : 'welcome');
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
  const start = (_position: Position, profile: Archetype, name: string, avatar: string, difficulty: Difficulty = 'normal') => {
    if (!name.trim()) return;
    const next = newSession({ name: name.trim(), profile, avatar, difficulty });
    current.current = next; setSession(next); setScreen('intro');
  };
  const restart = () => {
    try { window.localStorage.removeItem(SAVE_KEY); } catch { /* Storage failure must not crash restart. */ }
    current.current = null; setSession(null); setScreen('character');
  };
  const makeCommand = (type: GameCommand['type'], actionId?: string, params?: CommandParams): boolean => {
    if (!session) return false;
    return commit({ id: crypto.randomUUID(), expectedTurn: session.state.turn, type, actionId, params });
  };
  return <>
    <Toaster theme="dark" position="bottom-right" richColors />
    {screen === 'welcome' && <><WelcomeScreen onStart={() => setScreen('character')} />{savingError && <p role="alert" className="fixed bottom-4 left-4 right-4 rounded-lg bg-card border border-amber-300/40 p-4 text-sm text-amber-100">{savingError} Al empezar una partida nueva se crea un guardado nuevo.</p>}</>}
    {screen === 'character' && <CharacterCreation onComplete={start} causalMode />}
    {screen === 'intro' && session && <WelcomeModal governorName={session.state.name} position="presidente" onStart={() => setScreen('game')} />}
    {screen === 'game' && session && <CausalDashboard state={session.state} savingError={savingError}
      onExecute={(id, params) => makeCommand('execute', id, params)} onCommand={(type, targetId, choiceId) => commit({ id: crypto.randomUUID(), expectedTurn: session.state.turn, type, targetId, choiceId })} onRestart={restart} />}
  </>;
}
