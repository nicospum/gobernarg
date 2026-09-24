import { useState, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { GameHeader } from './components/GameHeader';
import { CharacterCreation } from './components/CharacterCreation';
import { ControlPanel } from './components/ControlPanel';
import { AdvisorPanel } from './components/AdvisorPanel';
import { TurnSummaryModal } from './components/TurnSummaryModal';
import { WelcomeModal } from './components/WelcomeModal';
import { SpecialAbilitiesPanel } from './components/SpecialAbilitiesPanel';
import { LegacyScreen } from './components/LegacyScreen';
import { GameOverModal } from './components/GameOverModal';
import { ReelectionChoiceModal } from './components/ReelectionChoiceModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { IndicatorsPanel } from './components/IndicatorsPanel';
import { PendingEffectsPanel } from './components/PendingEffectsPanel';
import { ActiveBenefits } from './components/ActiveBenefits';
import { InformesPanel } from './components/InformesPanel';
import { RightSidebar } from './components/RightSidebar';
import { EventModal } from './components/EventModal';
import { ElectionResultsModal } from './components/ElectionResultsModal';
import { GameLog } from './components/GameLog';
import { MidtermStrategyModal } from './components/MidtermStrategyModal';
import { NotificationCenter } from './components/NotificationCenter';
import { ManagementNotebook } from './components/ManagementNotebook';
import { CountryPanel } from './components/CountryPanel';

import type { Position, Archetype, AdvisorWithStatus, TurnSummary, MidtermStrategy } from './types/game';
import type { ActorId } from './data/causal';
import type { ElectionOption } from './data/careerRules';
import type { GameEvent } from './systems/events/types';
import {
  getInitialGameState,
  createNewGame,
  toggleActionSelection,
  interactWithActor,
  hireAdvisors,
  dismissAdvisor,
  processEndTurn,
  applyEventChoice,
  resolvePendingElection,
  markAllNotificationsRead,
  dismissNotification,
  useSpecialAbility as activateSpecialAbility,
  triggerMidtermStrategy,
  type ActorInteraction,
} from './engine/gameEngine';

function App() {
  const [gameState, setGameState] = useState(() => getInitialGameState());
  const [gameStarted, setGameStarted] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTurnSummary, setShowTurnSummary] = useState(false);
  const [turnSummary, setTurnSummary] = useState<TurnSummary | null>(null);
  const [pendingEvents, setPendingEvents] = useState<GameEvent[]>([]);
  const [showMidtermStrategy, setShowMidtermStrategy] = useState(false);
  const [showGameLog, setShowGameLog] = useState(false);
  const [showNotebook, setShowNotebook] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);
  // Anti doble-clic en eventos: id del último evento cuya elección se procesó.
  const lastProcessedEventRef = useRef<string | null>(null);

  const handleStart = (_isAdmin: boolean) => {
    setShowWelcomeScreen(false);
  };

  const handleGameStart = (
    position: Position,
    archetype: Archetype,
    governorName: string,
    avatar: string,
    platformId: string
  ) => {
    if (!governorName.trim()) return;
    const newState = createNewGame(position, archetype, governorName, false, avatar, 'normal', platformId);
    setGameState(newState);
    setShowWelcome(true);
  };

  const handleActionSelect = (actionId: string) => {
    setGameState(prev => toggleActionSelection(prev, actionId));
  };

  const handleUseSpecialAbility = (abilityId: string) => {
    setGameState(prev => activateSpecialAbility(prev, abilityId));
  };

  const handleSelectMidtermStrategy = (strategy: MidtermStrategy) => {
    setGameState(prev => triggerMidtermStrategy(prev, strategy));
    setShowMidtermStrategy(false);
  };

  const handleActorInteraction = (actor: ActorId, kind: ActorInteraction) => {
    setGameState(prev => interactWithActor(prev, actor, kind));
  };

  const handleHireAdvisor = (advisors: AdvisorWithStatus[]) => {
    setGameState(prev => hireAdvisors(prev, advisors));
  };

  const handleDismissAdvisor = (advisor: AdvisorWithStatus) => {
    setGameState(prev => dismissAdvisor(prev, advisor.id));
  };

  const handleEndTurn = () => {
    const result = processEndTurn(gameState);
    setGameState(result.state);

    toast(`Turno finalizado — Año ${result.summary.year}, Trimestre ${result.summary.quarter}`);

    // Si hay estrategia pendiente, mostrar modal
    if (result.state.pendingMidtermStrategy) {
      setShowMidtermStrategy(true);
    }

    // No mostramos el resumen si el turno terminó en elección pendiente o fin de juego
    if (!result.state.pendingElection && !result.state.gameOver && !result.state.pendingMidtermStrategy) {
      setTurnSummary(result.summary);
      setShowTurnSummary(true);
    }

    if (result.triggeredEvents.length > 0) {
      lastProcessedEventRef.current = null;
      // Concatenar en vez de reemplazar: si quedara un evento sin responder
      // de un turno anterior, no se descarta en silencio (Punto 15).
      setPendingEvents(prev => [
        ...prev,
        ...result.triggeredEvents.filter(e => e.choices && e.choices.length > 0),
      ]);
    }
  };

  const handleEventChoice = (choiceId: string) => {
    const [currentEvent] = pendingEvents;
    if (!currentEvent) return;
    // Anti doble-clic: dos clics rápidos aplicaban los efectos del evento 2 veces.
    if (lastProcessedEventRef.current === currentEvent.id) return;
    lastProcessedEventRef.current = currentEvent.id;

    setGameState(prev => applyEventChoice(prev, currentEvent, choiceId));
    setPendingEvents(prev => {
      const remaining = prev.slice(1);
      if (remaining.length === 0) lastProcessedEventRef.current = null;
      return remaining;
    });
  };

  const handleElectionChoice = (option: ElectionOption) => {
    setGameState(prev => resolvePendingElection(prev, option));
  };

  const handleCloseElectionResults = () => {
    setGameState(prev => ({ ...prev, electionResults: null }));
  };

  const handleRestart = () => {
    setGameState(getInitialGameState());
    setGameStarted(false);
    setShowWelcome(false);
    setShowTurnSummary(false);
    setTurnSummary(null);
    setPendingEvents([]);
    setShowLegacy(false);
  };

  if (showWelcomeScreen) {
    return <WelcomeScreen onStart={handleStart} />;
  }

  if (!gameStarted) {
    if (showWelcome) {
      return (
        <WelcomeModal
          governorName={gameState.governorName}
          position={gameState.position}
          onStart={() => {
            setShowWelcome(false);
            setGameStarted(true);
          }}
        />
      );
    }
    return <CharacterCreation onComplete={handleGameStart} />;
  }

  const currentEvent = pendingEvents[0] || null;

  return (
    <div className="min-h-screen bg-[#070e17] text-white selection:bg-blue-500/30 selection:text-blue-200">
      <Toaster theme="dark" position="bottom-right" />
      <GameHeader
        gameState={gameState}
        availableActions={gameState.actions}
        onRestart={handleRestart}
        onEndTurn={handleEndTurn}
        canEndTurn={!gameState.gameOver && !gameState.pendingElection}
      />

      <main className="max-w-[1680px] mx-auto p-4 md:p-6 space-y-5">
        {/* Indicadores horizontales arriba (KPIs B0) */}
        <IndicatorsPanel gameState={gameState} />

        {/* Detalle Macro y Motor Causal */}
        <CountryPanel gameState={gameState} />

        {/* Grid Principal: 2/3 Dashboard Acciones + 1/3 Sidebar Electoral & Actores */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 space-y-5">
            <ControlPanel
              gameState={gameState}
              onActionSelect={handleActionSelect}
              canTakeAction={gameState.actions > 0 && !gameState.gameOver && !gameState.pendingElection}
            />

            <SpecialAbilitiesPanel
              gameState={gameState}
              onUseAbility={handleUseSpecialAbility}
              disabled={!(gameState.actions > 0 && !gameState.gameOver && !gameState.pendingElection)}
            />

            <PendingEffectsPanel gameState={gameState} />

            <InformesPanel gameState={gameState} />

            <NotificationCenter
              gameState={gameState}
              onMarkRead={() => setGameState(prev => markAllNotificationsRead(prev))}
              onDismiss={(id) => setGameState(prev => dismissNotification(prev, id))}
            />
          </div>

          <div className="space-y-5">
            <RightSidebar
              gameState={gameState}
              onInteract={handleActorInteraction}
              onSelectAction={handleActionSelect}
              interactionsDisabled={gameState.gameOver || gameState.pendingElection}
            />

            <ActiveBenefits gameState={gameState} />

            <div className="flex gap-3">
              <button
                onClick={() => setShowGameLog(true)}
                className="flex-1 bg-[#0f1e38] border border-white/8 rounded-xl p-3.5 hover:bg-white/4 transition-all flex items-center gap-2.5 text-xs font-bold text-white shadow-md"
              >
                <span className="inline-flex w-6 h-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 font-mono text-xs">L</span>
                Historial de Gestión
              </button>
              <button
                onClick={() => setShowNotebook(true)}
                className="flex-1 bg-[#0f1e38] border border-white/8 rounded-xl p-3.5 hover:bg-white/4 transition-all flex items-center gap-2.5 text-xs font-bold text-white shadow-md"
              >
                <span className="inline-flex w-6 h-6 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs">C</span>
                Cuaderno Político
              </button>
            </div>

            <AdvisorPanel
              gameState={gameState}
              onHireAdvisor={handleHireAdvisor}
              onDismissAdvisor={handleDismissAdvisor}
            />
          </div>
        </div>
      </main>

      {showTurnSummary && turnSummary && (
        <TurnSummaryModal
          summary={turnSummary}
          gameState={gameState}
          onClose={() => setShowTurnSummary(false)}
        />
      )}

      {currentEvent && (
        <EventModal
          event={currentEvent}
          onChoice={handleEventChoice}
          onClose={() => {
            lastProcessedEventRef.current = null;
            setPendingEvents(prev => prev.slice(1));
          }}
        />
      )}

      {gameState.pendingElection && (
        <ReelectionChoiceModal
          gameState={gameState}
          onSelect={handleElectionChoice}
        />
      )}

      {!gameState.pendingElection && gameState.electionResults && (
        <ElectionResultsModal
          result={gameState.electionResults}
          onClose={handleCloseElectionResults}
        />
      )}

      {/* FIX (Punto 3): si el fin de turno dispara eventos Y gameOver a la vez,
          GameOverModal (z-50, más abajo en el DOM) tapaba al EventModal y la
          elección del jugador nunca se aplicaba. Se difiere el game over
          mientras haya eventos pendientes de responder. */}
      {gameState.gameOver && pendingEvents.length === 0 && !gameState.victorious && !showLegacy && !gameState.electionResults && (
        <GameOverModal
          gameState={gameState}
          onRestart={handleRestart}
          onShowLegacy={() => setShowLegacy(true)}
        />
      )}

      {showMidtermStrategy && gameState.availableMidtermStrategies.length > 0 && (
        <MidtermStrategyModal
          availableStrategies={gameState.availableMidtermStrategies}
          gameState={gameState}
          onSelect={handleSelectMidtermStrategy}
        />
      )}

      {gameState.gameOver && (gameState.victorious || showLegacy) && !gameState.electionResults && (
        <LegacyScreen
          gameState={gameState}
          onRestart={handleRestart}
          onClose={gameState.victorious ? undefined : () => setShowLegacy(false)}
        />
      )}

      {showGameLog && (
        <GameLog gameState={gameState} onClose={() => setShowGameLog(false)} />
      )}

      {showNotebook && (
        <ManagementNotebook gameState={gameState} onClose={() => setShowNotebook(false)} />
      )}
    </div>
  );
}

export default App;
