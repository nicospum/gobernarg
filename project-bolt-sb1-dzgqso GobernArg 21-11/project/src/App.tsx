import { useEffect, useState, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { GameHeader } from './components/GameHeader';
import { NewGameScreen, type NewGameChoice } from './components/NewGameScreen';
import { ControlPanel } from './components/ControlPanel';
import { TurnSummaryModal } from './components/TurnSummaryModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { IndicatorsPanel } from './components/IndicatorsPanel';
import { PendingEffectsPanel } from './components/PendingEffectsPanel';
import { ActiveBenefits } from './components/ActiveBenefits';
import { InformesPanel } from './components/InformesPanel';
import { RightSidebar } from './components/RightSidebar';
import { EventModal } from './components/EventModal';
import { NotificationCenter } from './components/NotificationCenter';
import { CountryPanel } from './components/CountryPanel';
import { clearSavedGame, loadGame, saveGame } from './lib/savegame';
import { lazyModal } from './lib/lazyModal';
import { useIsMobile } from './lib/useMediaQuery';
import { MobileBottomBar, MobileHeader, MobileKpis, MobileMenu, type MobileTab } from './components/mobile/MobileChrome';
import { Sheet } from './components/mobile/Sheet';
import { TutorialCard } from './components/Tutorial';
import { useTutorial } from './lib/tutorial';
import { markGameStart } from './lib/playtest';

import type { TurnSummary, MidtermStrategy } from './types/game';
import type { ActorId } from './data/causal';
import type { GameEvent } from './systems/events/types';
import {
  getInitialGameState,
  createNewGame,
  toggleActionSelection,
  interactWithActor,
  processEndTurn,
  applyEventChoice,
  resolvePendingElection,
  retireFromReelection,
  markAllNotificationsRead,
  dismissNotification,
  triggerMidtermStrategy,
  type ActorInteraction,
} from './engine/gameEngine';

// Pantallas que aparecen pocas veces: se descargan recién cuando hacen falta
// (Fase 4), así la primera carga del juego es más liviana.
const LegacyScreen = lazyModal(() => import('./components/LegacyScreen').then(m => m.LegacyScreen));
const GameOverModal = lazyModal(() => import('./components/GameOverModal').then(m => m.GameOverModal));
const ReelectionChoiceModal = lazyModal(() => import('./components/ReelectionChoiceModal').then(m => m.ReelectionChoiceModal));
const ElectionResultsModal = lazyModal(() => import('./components/ElectionResultsModal').then(m => m.ElectionResultsModal));
const MidtermStrategyModal = lazyModal(() => import('./components/MidtermStrategyModal').then(m => m.MidtermStrategyModal));
const HowToPlayModal = lazyModal(() => import('./components/HowToPlayModal').then(m => m.HowToPlayModal));
const FeedbackModal = lazyModal(() => import('./components/FeedbackModal').then(m => m.FeedbackModal));

function App() {
  const [gameState, setGameState] = useState(() => getInitialGameState());
  const [gameStarted, setGameStarted] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);
  const [showTurnSummary, setShowTurnSummary] = useState(false);
  const [turnSummary, setTurnSummary] = useState<TurnSummary | null>(null);
  const [pendingEvents, setPendingEvents] = useState<GameEvent[]>([]);
  const [showMidtermStrategy, setShowMidtermStrategy] = useState(false);
  const [showLegacy, setShowLegacy] = useState(false);
  // Anti doble-clic en eventos: id del último evento cuya elección se procesó.
  const lastProcessedEventRef = useRef<string | null>(null);
  // Candado de "Finalizar turno": se abre recién cuando el turno nuevo ya se dibujó.
  const endTurnLockRef = useRef(false);
  useEffect(() => {
    endTurnLockRef.current = false;
  }, [gameState]);
  // Partida guardada en el navegador (se lee una vez, al abrir el juego).
  const [savedGame, setSavedGame] = useState(() => loadGame());
  const boardRef = useRef<HTMLDivElement>(null);
  // Celular: tablero en pestañas, con menú y notificaciones en hojas.
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<MobileTab>('acciones');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  // Ayuda: tarjeta del primer turno y guía "Cómo se juega" desde el menú.
  const tutorial = useTutorial();
  const [showHelp, setShowHelp] = useState(false);
  // Playtest (Fase 3): "Contanos cómo te fue".
  const [showFeedback, setShowFeedback] = useState(false);

  // Guardado automático: cada cambio de la partida (y los eventos sin responder).
  useEffect(() => {
    if (gameStarted) saveGame(gameState, pendingEvents);
  }, [gameStarted, gameState, pendingEvents]);

  // Perdiste o terminó el mandato: los eventos que quedaban ya no se responden.
  useEffect(() => {
    if (gameState.gameOver) setPendingEvents([]);
  }, [gameState.gameOver]);

  const handleStart = () => {
    setShowWelcomeScreen(false);
  };

  const handleContinue = () => {
    if (!savedGame) return;
    const { state, pendingEvents: events } = savedGame;
    setGameState(state);
    setPendingEvents(events);
    setShowMidtermStrategy(!!state.pendingMidtermStrategy);
    setShowWelcomeScreen(false);
    setGameStarted(true);
  };

  // Nueva partida en una sola pantalla: se arranca directo en el tablero.
  const handleGameStart = ({ archetype, governorName, avatar, scenarioId }: NewGameChoice) => {
    if (!governorName.trim()) return;
    const newState = createNewGame({ archetype, governorName, avatar, scenarioId });
    markGameStart();
    setGameState(newState);
    setGameStarted(true);
    window.scrollTo({ top: 0 });
  };

  const handleActionSelect = (actionId: string) => {
    setGameState(prev => toggleActionSelection(prev, actionId));
  };

  const handleSelectMidtermStrategy = (strategy: MidtermStrategy) => {
    setGameState(prev => triggerMidtermStrategy(prev, strategy));
    setShowMidtermStrategy(false);
  };

  const handleActorInteraction = (actor: ActorId, kind: ActorInteraction) => {
    setGameState(prev => interactWithActor(prev, actor, kind));
  };

  // Con un modal abierto el tablero queda inerte: no se puede cerrar el turno
  // ni tocar nada de atrás (ni con el teclado).
  const modalOpen =
    showTurnSummary || pendingEvents.length > 0 || !!gameState.pendingElection || !!gameState.electionResults ||
    showMidtermStrategy || showHelp || showFeedback || gameState.gameOver;
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    if (modalOpen) board.setAttribute('inert', '');
    else board.removeAttribute('inert');
  }, [modalOpen, gameStarted]);

  const handleEndTurn = () => {
    // Un doble clic, o un Enter con un modal abierto, cerraba un turno de más.
    if (endTurnLockRef.current || modalOpen) return;
    endTurnLockRef.current = true;
    const result = processEndTurn(gameState);
    setGameState(result.state);

    toast(`Turno finalizado — Año ${result.summary.year}, Trimestre ${result.summary.quarter}`);

    // Si hay estrategia pendiente, mostrar modal
    if (result.state.pendingMidtermStrategy) {
      setShowMidtermStrategy(true);
    }

    // El resumen se muestra siempre (salvo fin de juego). Si hay legislativas o
    // elección, aparece después de resolverlas: antes esos turnos no tenían resumen.
    setTurnSummary(result.summary);
    setShowTurnSummary(!result.state.gameOver);

    // Con la partida terminada no hay más eventos que responder.
    if (result.triggeredEvents.length > 0 && !result.state.gameOver) {
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

  const handleElectionChoice = () => {
    setGameState(prev => resolvePendingElection(prev));
  };

  const handleCloseElectionResults = () => {
    setGameState(prev => ({ ...prev, electionResults: null }));
  };

  const handleRestart = () => {
    clearSavedGame();
    setSavedGame(null);
    setGameState(getInitialGameState());
    setGameStarted(false);
    setShowTurnSummary(false);
    setTurnSummary(null);
    setPendingEvents([]);
    setShowLegacy(false);
  };

  if (showWelcomeScreen) {
    return <WelcomeScreen onStart={handleStart} saved={savedGame?.state} onContinue={handleContinue} />;
  }

  if (!gameStarted) {
    return <NewGameScreen onStart={handleGameStart} onBack={() => setShowWelcomeScreen(true)} />;
  }

  const currentEvent = pendingEvents[0] || null;
  const showTutorialCard = !tutorial.dismissed && gameState.term === 1 && gameState.year === 1 && gameState.turn === 1;
  const tutorialCard = showTutorialCard && (
    <TutorialCard actions={gameState.baseActions} onDismiss={tutorial.dismiss} onOpenGuide={() => setShowHelp(true)} />
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Toaster containerAriaLabel="Avisos" position={isMobile ? "top-center" : "bottom-right"} toastOptions={{ style: { background: "rgb(20 33 61)", color: "rgb(251 248 242)", border: "none" } }} />
      <div ref={boardRef}>
      {isMobile ? (
        <>
          <MobileHeader
            gameState={gameState}
            onOpenNotifications={() => setShowNotifications(true)}
            onOpenMenu={() => setShowMobileMenu(true)}
          />
          <main className="px-3 pt-3 pb-[calc(9rem+env(safe-area-inset-bottom))] space-y-3">
            <MobileKpis gameState={gameState} />
            {tutorialCard}
            {mobileTab === 'acciones' && (
              <ControlPanel
                gameState={gameState}
                onActionSelect={handleActionSelect}
                canTakeAction={gameState.actions > 0 && !gameState.gameOver && !gameState.pendingElection}
              />
            )}
            {mobileTab === 'pais' && (
              <>
                <CountryPanel gameState={gameState} compact />
                <PendingEffectsPanel gameState={gameState} />
                <ActiveBenefits gameState={gameState} />
                <InformesPanel gameState={gameState} />
              </>
            )}
            {mobileTab === 'actores' && (
              <RightSidebar
                gameState={gameState}
                onInteract={handleActorInteraction}
                onSelectAction={handleActionSelect}
                interactionsDisabled={gameState.gameOver || gameState.pendingElection}
              />
            )}
          </main>
          <MobileBottomBar
            gameState={gameState}
            tab={mobileTab}
            onTab={tab => {
              setMobileTab(tab);
              window.scrollTo({ top: 0 });
            }}
            onEndTurn={handleEndTurn}
            canEndTurn={!modalOpen}
          />
        </>
      ) : (
        <>
          <GameHeader
            gameState={gameState}
            availableActions={gameState.actions}
            onRestart={handleRestart}
            onEndTurn={handleEndTurn}
            canEndTurn={!modalOpen}
            onOpenHelp={() => setShowHelp(true)}
            onOpenFeedback={() => setShowFeedback(true)}
          />

          <main className="max-w-[1680px] mx-auto p-4 md:p-6 space-y-5">
            {tutorialCard}

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
              </div>
            </div>
          </main>
        </>
      )}
      </div>

      {isMobile && showMobileMenu && (
        <MobileMenu
          gameState={gameState}
          onClose={() => setShowMobileMenu(false)}
          onOpenNotifications={() => setShowNotifications(true)}
          onOpenHelp={() => setShowHelp(true)}
          onOpenFeedback={() => setShowFeedback(true)}
          onRestart={handleRestart}
        />
      )}

      {isMobile && showNotifications && (
        <Sheet title="Notificaciones" onClose={() => setShowNotifications(false)}>
          <NotificationCenter
            gameState={gameState}
            onMarkRead={() => setGameState(prev => markAllNotificationsRead(prev))}
            onDismiss={(id) => setGameState(prev => dismissNotification(prev, id))}
          />
        </Sheet>
      )}

      {showTurnSummary && turnSummary && !showMidtermStrategy && !gameState.pendingElection && !gameState.electionResults && (
        <TurnSummaryModal
          summary={turnSummary}
          gameState={gameState}
          onClose={() => setShowTurnSummary(false)}
        />
      )}

      {currentEvent && !showMidtermStrategy && !gameState.pendingElection && (
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
          onRetire={() => setGameState(prev => retireFromReelection(prev))}
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
          onFeedback={() => setShowFeedback(true)}
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
          onFeedback={() => setShowFeedback(true)}
        />
      )}

      {showFeedback && <FeedbackModal gameState={gameState} onClose={() => setShowFeedback(false)} />}

      {showHelp && <HowToPlayModal actions={gameState.baseActions} onClose={() => setShowHelp(false)} />}
    </div>
  );
}

export default App;
