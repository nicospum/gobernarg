import { useEffect, useState, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { GameHeader } from './components/GameHeader';
import { NewGameScreen, type NewGameChoice } from './components/NewGameScreen';
import { ControlPanel } from './components/ControlPanel';
import { TurnSummaryModal } from './components/TurnSummaryModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { ActorsPanel } from './components/ActorsPanel';
import { CommandStrip } from './components/board/CommandStrip';
import { MetricsRow } from './components/board/MetricsRow';
import { CivicBanner } from './components/board/CivicBanner';
import { TurnPlan } from './components/board/TurnPlan';
import { ElectoralPanel } from './components/board/ElectoralPanel';
import { StatusFooter } from './components/board/StatusFooter';
import { DefeatAlerts } from './components/board/StatusStrip';
import { EventModal } from './components/EventModal';
import { CountryPanel } from './components/CountryPanel';
import { clearSavedGame, loadGame, saveGame } from './lib/savegame';
import { recordReelectionWin, recordScenarioWin } from './lib/progress';
import { LITE_FEATURES, detailed } from './lite/config';
import { lazyModal } from './lib/lazyModal';
import { useIsMobile } from './lib/useMediaQuery';
import { MobileBottomBar, MobileHeader, MobileKpis, MobileMenu, type MobileTab } from './components/mobile/MobileChrome';
import { TutorialCard } from './components/Tutorial';
import { useTutorial } from './lib/tutorial';
import { markGameStart } from './lib/playtest';

import type { ElectionResults, TurnSummary, MidtermStrategy } from './types/game';
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
  // Celular: tablero en pestañas, con el menú en una hoja.
  const isMobile = useIsMobile();
  const [mobileTab, setMobileTab] = useState<MobileTab>('acciones');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  // Ayuda: tarjeta del primer turno y guía "Cómo se juega" desde el menú.
  const tutorial = useTutorial();
  const [showHelp, setShowHelp] = useState(false);
  // Playtest (Fase 3): "Contanos cómo te fue".
  const [showFeedback, setShowFeedback] = useState(false);

  // Guardado automático: cada cambio de la partida (y los eventos sin responder).
  useEffect(() => {
    if (gameStarted) saveGame(gameState, pendingEvents);
  }, [gameStarted, gameState, pendingEvents]);

  // Escenarios históricos (apagados en Lite, ver src/lite/config.ts): ganar la
  // partida queda registrado por escenario y cada reelección ganada desbloquea
  // el siguiente. Con el flag apagado se registra igual (sin aviso), así al
  // reactivarlos los desbloqueos ya ganados se conservan.
  useEffect(() => {
    if (gameState.gameOver && gameState.victorious) recordScenarioWin(gameState.causal.scenarioId);
  }, [gameState.gameOver, gameState.victorious, gameState.causal]);

  // Se cuenta una sola vez por resultado (el objeto se conserva mientras el modal está abierto).
  const countedElectionRef = useRef<ElectionResults | null>(null);
  useEffect(() => {
    const results = gameState.electionResults;
    if (!results || results === countedElectionRef.current) return;
    countedElectionRef.current = results;
    if (results.kind === 'reelection' && results.victory) {
      recordReelectionWin();
      if (LITE_FEATURES.escenariosHistoricos) toast('Ganaste la reelección: desbloqueaste un escenario histórico nuevo.');
    }
  }, [gameState.electionResults]);

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
    // La elección que ya estaba en pantalla no se vuelve a contar para desbloqueos.
    countedElectionRef.current = state.electionResults;
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
  const simple = !detailed();
  const showTutorialCard = !tutorial.dismissed && gameState.term === 1 && gameState.year === 1 && gameState.turn === 1;
  const tutorialCard = showTutorialCard && (
    <TutorialCard actions={gameState.baseActions} onDismiss={tutorial.dismiss} onOpenGuide={() => setShowHelp(true)} />
  );

  return (
    <div className="min-h-screen sr-room text-ink">
      <Toaster containerAriaLabel="Avisos" position={isMobile ? "top-center" : "bottom-right"} toastOptions={{ style: { background: "rgb(var(--navy))", color: "#fff", border: "none" } }} />
      <div ref={boardRef}>
      {isMobile ? (
        <>
          <MobileHeader
            gameState={gameState}
            onOpenMenu={() => setShowMobileMenu(true)}
          />
          <main className="px-3 pt-3 pb-[calc(9rem+env(safe-area-inset-bottom))] space-y-3">
            <MobileKpis gameState={gameState} />
            {!detailed() && <DefeatAlerts gameState={gameState} />}
            {tutorialCard}
            {mobileTab === 'acciones' && (
              <>
                <ControlPanel
                  gameState={gameState}
                  onActionSelect={handleActionSelect}
                  canTakeAction={gameState.actions > 0 && !gameState.gameOver && !gameState.pendingElection}
                />
                <TurnPlan
                  gameState={gameState}
                  onActionSelect={handleActionSelect}
                  onEndTurn={handleEndTurn}
                  canEndTurn={!modalOpen}
                />
              </>
            )}
            {mobileTab === 'pais' && <CountryPanel gameState={gameState} compact />}
            {mobileTab === 'actores' && (
              <>
                {/* Modo simple: lo esencial del voto ya está en la franja de arriba. */}
                {detailed() && <ElectoralPanel gameState={gameState} />}
                <ActorsPanel
                  gameState={gameState}
                  onInteract={handleActorInteraction}
                  onSelectAction={handleActionSelect}
                  disabled={gameState.gameOver || gameState.pendingElection}
                />
              </>
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
        <div className={simple ? 'xl:h-dvh xl:flex xl:flex-col xl:overflow-hidden' : undefined}>
          <GameHeader
            gameState={gameState}
            availableActions={gameState.actions}
            onRestart={handleRestart}
            onEndTurn={handleEndTurn}
            canEndTurn={!modalOpen}
            onOpenHelp={() => setShowHelp(true)}
            onOpenFeedback={() => setShowFeedback(true)}
          />
          <CommandStrip gameState={gameState} />
          <MetricsRow gameState={gameState} />

          {simple ? (
            // Modo simple (como en la B): sin columna izquierda; Acciones y la
            // columna de Este turno + Actores mitad y mitad. En pantallas anchas
            // el tablero ocupa el alto de la ventana y cada columna tiene su scroll.
            <main className="w-full max-w-[1540px] mx-auto px-4 lg:px-7 pt-4 pb-11 xl:pb-4 xl:flex-1 xl:min-h-0 xl:flex xl:flex-col">
              <DefeatAlerts gameState={gameState} className="mb-4 xl:flex-none" />
              <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 items-start xl:items-stretch xl:grid-rows-[minmax(0,1fr)] xl:flex-1 xl:min-h-0">
                <div className="flex flex-col gap-4 min-w-0 xl:min-h-0 xl:overflow-y-auto xl:pr-1 [scrollbar-gutter:stable] [&>*]:shrink-0" data-columna="acciones">
                  {tutorialCard}
                  <CivicBanner />
                  <ControlPanel
                    gameState={gameState}
                    onActionSelect={handleActionSelect}
                    canTakeAction={gameState.actions > 0 && !gameState.gameOver && !gameState.pendingElection}
                    index="01"
                  />
                </div>
                <aside className="flex flex-col gap-4 min-w-0 xl:min-h-0" aria-label="Turno y actores">
                  <div className="xl:flex-none">
                    <TurnPlan
                      gameState={gameState}
                      onActionSelect={handleActionSelect}
                      onEndTurn={handleEndTurn}
                      canEndTurn={!modalOpen}
                      index="02"
                    />
                  </div>
                  <div className="min-w-0 xl:flex-1 xl:min-h-0 xl:overflow-y-auto xl:pr-1 [scrollbar-gutter:stable]">
                    <ActorsPanel
                      gameState={gameState}
                      onInteract={handleActorInteraction}
                      onSelectAction={handleActionSelect}
                      disabled={gameState.gameOver || gameState.pendingElection}
                      index="03"
                    />
                  </div>
                </aside>
              </div>
            </main>
          ) : (
          <main className="max-w-[1540px] mx-auto px-4 lg:px-7 pt-[18px] pb-11">
            {tutorialCard && <div className="mb-4">{tutorialCard}</div>}

            {/* Modo simple: acciones y actores con el mismo ancho; la izquierda, la más angosta. */}
            <div className={`grid gap-4 grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)] ${detailed() ? 'xl:grid-cols-[270px_minmax(0,1fr)_332px]' : 'xl:grid-cols-[260px_minmax(0,1fr)_minmax(0,1fr)]'} items-start`}>
              <aside className="flex flex-col gap-4 min-w-0" aria-label="Estado del país y terreno político">
                <CountryPanel gameState={gameState} index="01" />
                <ElectoralPanel gameState={gameState} index="02" />
              </aside>

              <div className="flex flex-col gap-4 min-w-0">
                <CivicBanner />
                <ControlPanel
                  gameState={gameState}
                  onActionSelect={handleActionSelect}
                  canTakeAction={gameState.actions > 0 && !gameState.gameOver && !gameState.pendingElection}
                  index="03"
                  scroll
                />
              </div>

              <aside className="lg:col-span-2 xl:col-span-1 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-1 gap-4 min-w-0 items-start" aria-label="Turno y actores">
                <TurnPlan
                  gameState={gameState}
                  onActionSelect={handleActionSelect}
                  onEndTurn={handleEndTurn}
                  canEndTurn={!modalOpen}
                  index="04"
                />
                <ActorsPanel
                  gameState={gameState}
                  onInteract={handleActorInteraction}
                  onSelectAction={handleActionSelect}
                  disabled={gameState.gameOver || gameState.pendingElection}
                  index="05"
                />
              </aside>
            </div>
          </main>
          )}
          <StatusFooter gameState={gameState} />
        </div>
      )}
      </div>

      {isMobile && showMobileMenu && (
        <MobileMenu
          gameState={gameState}
          onClose={() => setShowMobileMenu(false)}
          onOpenHelp={() => setShowHelp(true)}
          onOpenFeedback={() => setShowFeedback(true)}
          onRestart={handleRestart}
        />
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
