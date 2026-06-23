import { useState } from 'react';
import { GameHeader } from './components/GameHeader';
import { CharacterCreation } from './components/CharacterCreation';
import { ControlPanel } from './components/ControlPanel';
import { AdvisorPanel } from './components/AdvisorPanel';
import { InterestGroupsPanel } from './components/InterestGroupsPanel';
import { TurnSummaryModal } from './components/TurnSummaryModal';
import { WelcomeModal } from './components/WelcomeModal';
import { LegacyScreen } from './components/LegacyScreen';
import { GameOverModal } from './components/GameOverModal';
import { ReelectionChoiceModal } from './components/ReelectionChoiceModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { IndicatorsPanel } from './components/IndicatorsPanel';
import { VotingIntentionPanel } from './components/VotingIntentionPanel';
import { ObjectivesPanel } from './components/ObjectivesPanel';
import { PendingEffectsPanel } from './components/PendingEffectsPanel';
import { ActiveBenefits } from './components/ActiveBenefits';
import { EventModal } from './components/EventModal';
import { ElectionResultsModal } from './components/ElectionResultsModal';
import { GameLog } from './components/GameLog';
import { MidtermStrategyModal } from './components/MidtermStrategyModal';
import { PoliticalCalendarWidget } from './components/PoliticalCalendarWidget';
import { NotificationCenter } from './components/NotificationCenter';

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

function App() {
  const [gameState, setGameState] = useState(() => getInitialGameState());
  const [gameStarted, setGameStarted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showTurnSummary, setShowTurnSummary] = useState(false);
  const [turnSummary, setTurnSummary] = useState<TurnSummary | null>(null);
  const [isAdminMode, setIsAdminMode] = useState<boolean | null>(null);
  const [pendingEvents, setPendingEvents] = useState<GameEvent[]>([]);
  const [showMidtermStrategy, setShowMidtermStrategy] = useState(false);
  const [showGameLog, setShowGameLog] = useState(false);

  const handleStart = (isAdmin: boolean) => {
    setIsAdminMode(isAdmin);
  };

  const handleGameStart = (
    position: Position,
    archetype: Archetype,
    governorName: string,
    adminMode: boolean,
    avatar: string
  ) => {
    if (!governorName.trim()) return;
    const newState = createNewGame(position, archetype, governorName, adminMode, avatar);
    setGameState(newState);
    setShowWelcome(true);
  };

  const handleActionSelect = (actionId: string) => {
    setGameState(prev => toggleActionSelection(prev, actionId));
  };

  const handleUseSpecialAbility = () => {
    setGameState(prev => useSpecialAbility(prev));
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
      setPendingEvents(result.triggeredEvents.filter(e => e.choices && e.choices.length > 0));
    }
  };

  const handleEventChoice = (choiceId: string) => {
    const [currentEvent, ...rest] = pendingEvents;
    if (!currentEvent) return;

    setGameState(prev => applyEventChoice(prev, currentEvent, choiceId));
    setPendingEvents(rest);
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
  };

  if (isAdminMode === null) {
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
    <div className="min-h-screen bg-gray-100">
      <GameHeader
        gameState={gameState}
        availableActions={gameState.actions}
        onRestart={handleRestart}
        onEndTurn={handleEndTurn}
        canEndTurn={gameState.actions > 0 && !gameState.gameOver && !gameState.pendingElection}
      />

      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                currentTurn={gameState.turn}
              />
            )}

            <NotificationCenter
              gameState={gameState}
              onMarkRead={() => setGameState(prev => markAllNotificationsRead(prev))}
              onDismiss={(id) => setGameState(prev => dismissNotification(prev, id))}
            />
          </div>

          <div className="space-y-4">
            <ActiveBenefits gameState={gameState} />
            <button
              onClick={() => setShowGameLog(true)}
              className="w-full text-left bg-white rounded-lg shadow-lg p-3 hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700"
            >
              📋 Historial de gestión
            </button>
            <IndicatorsPanel gameState={gameState} />
            <VotingIntentionPanel gameState={gameState} />
            <ObjectivesPanel gameState={gameState} />
            <PoliticalCalendarWidget gameState={gameState} />
            <InterestGroupsPanel
              gameState={gameState}
              onInteraction={handleInteraction}
              onSatisfyDemand={handleSatisfyDemand}
            />
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
          onClose={() => setPendingEvents(prev => prev.slice(1))}
        />
      )}

      {gameState.pendingElection && (
        <ReelectionChoiceModal
          gameState={gameState}
          onSelect={handleElectionChoice}
        />
      )}

      {!gameState.pendingElection && gameState.electionResults && !gameState.gameOver && (
        <ElectionResultsModal
          result={gameState.electionResults}
          onClose={handleCloseElectionResults}
        />
      )}

      {gameState.gameOver && !gameState.victorious && (
        <GameOverModal
          gameState={gameState}
          onRestart={handleRestart}
        />
      )}

      {showMidtermStrategy && gameState.availableMidtermStrategies.length > 0 && (
        <MidtermStrategyModal
          availableStrategies={gameState.availableMidtermStrategies}
          gameState={gameState}
          onSelect={handleSelectMidtermStrategy}
        />
      )}

      {gameState.gameOver && (
        <LegacyScreen
          gameState={gameState}
          onRestart={handleRestart}
        />
      )}

      {showGameLog && (
        <GameLog gameState={gameState} onClose={() => setShowGameLog(false)} />
      )}

      {gameState.isAdminMode && gameStarted && <AdminDebugPanel gameState={gameState} />}
    </div>
  );
}

function AdminDebugPanel({ gameState }: { gameState: ReturnType<typeof getInitialGameState> }) {
  return (
    <div className="fixed bottom-4 right-4 w-80 max-h-[60vh] overflow-y-auto bg-slate-900 text-slate-100 text-xs p-4 rounded-lg shadow-2xl z-40">
      <h4 className="font-bold mb-2 uppercase tracking-wide text-slate-400">Modo Admin / Debug</h4>
      <div className="space-y-2">
        <p>Popularidad: {gameState.popularity.toFixed(2)}</p>
        <p>Popularidad Grupos: {gameState.popularidadGrupos.toFixed(2)}</p>
        <p>Popularidad Política: {gameState.popularidadPolitica.toFixed(2)}</p>
        <p>Estabilidad: {gameState.stability.toFixed(2)}</p>
        <p>Presupuesto: ${gameState.budget.toFixed(0)}M</p>
        <p>Intención de voto: {gameState.votingIntention.toFixed(2)}%</p>
        <p>Acciones base: {gameState.baseActions}</p>
        <p>Emisiones acumuladas: {gameState.moneyPrintingCount}</p>
        <p>Turnos baja popularidad: {gameState.consecutiveLowPopularity}</p>
        <p>Turnos déficit: {gameState.consecutiveNegativeBudget}</p>
        <p>Apoyo legislativo: {gameState.legislativeSupport?.toFixed(1) ?? 'N/A'}%</p>
        <div>
          <p className="font-semibold mt-2">Relaciones con grupos:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {Object.entries(gameState.groupRelations).map(([id, support]) => (
              <li key={id}>{id}: {support.toFixed(1)}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold mt-2">Objetivos completados:</p>
          <p>{gameState.completedObjectives.length} / {gameState.objectives.length}</p>
        </div>
        <div>
          <p className="font-semibold mt-2">Últimas notificaciones:</p>
          <ul className="list-disc pl-4 space-y-0.5">
            {gameState.notifications.slice(0, 5).map(n => (
              <li key={n.id}>[{n.importance}] {n.title}</li>
            ))}
            {gameState.notifications.length === 0 && <li>Sin notificaciones</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
