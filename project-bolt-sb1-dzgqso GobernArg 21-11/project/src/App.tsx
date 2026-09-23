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

import type { Position, Archetype, AdvisorWithStatus, InteractionType, TurnSummary, MidtermStrategy } from './types/game';
import type { ElectionOption } from './data/careerRules';
import type { GameEvent } from './systems/events/types';
import {
  getInitialGameState,
  createNewGame,
  toggleActionSelection,
  applyInteraction,
  hireAdvisors,
  dismissAdvisor,
  processEndTurn,
  applyEventChoice,
  resolvePendingElection,
  markAllNotificationsRead,
  dismissNotification,
  useSpecialAbility,
  satisfyGroupDemand,
  triggerMidtermStrategy
} from './engine/gameEngine';
import { getGlobalTurn } from './engine/engineShared';

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
    avatar: string
  ) => {
    if (!governorName.trim()) return;
    const newState = createNewGame(position, archetype, governorName, false, avatar);
    setGameState(newState);
    setShowWelcome(true);
  };

  const handleActionSelect = (actionId: string) => {
    setGameState(prev => toggleActionSelection(prev, actionId));
  };

  const handleUseSpecialAbility = (abilityId: string) => {
    setGameState(prev => useSpecialAbility(prev, abilityId));
  };

  const handleSatisfyDemand = (agendaId: string) => {
    try {
      setGameState(prev => {
        if (!prev || !prev.groupAgendas) return prev;
        return satisfyGroupDemand(prev, agendaId);
      });
    } catch (err) {
      console.error('[GobernArg] Error en satisfyGroupDemand:', err);
    }
  };

  const handleSelectMidtermStrategy = (strategy: MidtermStrategy) => {
    setGameState(prev => triggerMidtermStrategy(prev, strategy));
    setShowMidtermStrategy(false);
  };

  const handleInteraction = (subgroupId: string, type: InteractionType) => {
    setGameState(prev => applyInteraction(prev, subgroupId, type));
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
    <div className="min-h-screen bg-background text-foreground">
      <Toaster theme="dark" position="bottom-right" />
      <GameHeader
        gameState={gameState}
        availableActions={gameState.actions}
        onRestart={handleRestart}
        onEndTurn={handleEndTurn}
        canEndTurn={!gameState.gameOver && !gameState.pendingElection}
      />

      <main className="container mx-auto p-4 h-[calc(100vh-3.5rem)] overflow-y-auto">
        {/* Indicadores horizontales arriba */}
        <IndicatorsPanel gameState={gameState} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="lg:col-span-2 space-y-4">
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

            {gameState.pendingEffects.length > 0 && (
              <PendingEffectsPanel
                effects={gameState.pendingEffects}
                currentTurn={getGlobalTurn(gameState)}
              />
            )}

            {gameState.pendingEffects.length > 0 && (
              <InformesPanel
                effects={gameState.pendingEffects}
                currentTurn={getGlobalTurn(gameState)}
              />
            )}

            <NotificationCenter
              gameState={gameState}
              onMarkRead={() => setGameState(prev => markAllNotificationsRead(prev))}
              onDismiss={(id) => setGameState(prev => dismissNotification(prev, id))}
            />
          </div>

          <div className="space-y-4">
            <RightSidebar
              gameState={gameState}
              onInteraction={handleInteraction}
              onSatisfyDemand={handleSatisfyDemand}
            />
            <ActiveBenefits gameState={gameState} />
            <div className="flex gap-2">
              <button
                onClick={() => setShowGameLog(true)}
                className="flex-1 text-left bg-card border border-border rounded-lg p-3 hover:bg-white/3 transition-colors flex items-center gap-2 text-sm font-medium text-foreground/80"
              >
                <span className="inline-flex w-5 h-5 items-center justify-center rounded bg-primary/15 text-primary font-bold text-[11px]">L</span>
                Historial
              </button>
              <button
                onClick={() => setShowNotebook(true)}
                className="flex-1 text-left bg-card border border-border rounded-lg p-3 hover:bg-white/3 transition-colors flex items-center gap-2 text-sm font-medium text-foreground/80"
              >
                <span className="inline-flex w-5 h-5 items-center justify-center rounded bg-blue-400/15 text-blue-400 font-bold text-[11px]">C</span>
                Cuaderno
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

      {gameState.gameOver && (gameState.victorious || showLegacy) && (
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
