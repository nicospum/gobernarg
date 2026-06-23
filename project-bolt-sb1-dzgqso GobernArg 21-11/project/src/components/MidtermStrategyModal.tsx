import { AlertTriangle, Zap, Handshake, Users, Flame } from 'lucide-react';
import { GameState, MidtermStrategy } from '../types/game';
import { MIDTERM_STRATEGY_EFFECTS } from '../data/midtermStrategies';

interface MidtermStrategyModalProps {
  availableStrategies: MidtermStrategy[];
  gameState: GameState;
  onSelect: (strategy: MidtermStrategy) => void;
}

const STRATEGY_INFO: Record<MidtermStrategy, {
  name: string;
  icon: typeof Zap;
  color: string;
  riskLabel: string;
  riskColor: string;
}> = {
  acelerar: {
    name: 'Acelerar',
    icon: Zap,
    color: 'border-yellow-400 bg-yellow-50',
    riskLabel: 'Riesgo Alto',
    riskColor: 'text-yellow-700 bg-yellow-200',
  },
  negociar: {
    name: 'Negociar',
    icon: Handshake,
    color: 'border-blue-400 bg-blue-50',
    riskLabel: 'Riesgo Bajo',
    riskColor: 'text-blue-700 bg-blue-200',
  },
  abrirse: {
    name: 'Abrirse',
    icon: Users,
    color: 'border-green-400 bg-green-50',
    riskLabel: 'Riesgo Medio',
    riskColor: 'text-green-700 bg-green-200',
  },
  jugada_audaz: {
    name: 'Jugada Audaz',
    icon: Flame,
    color: 'border-red-400 bg-red-50',
    riskLabel: 'Riesgo Extremo',
    riskColor: 'text-red-700 bg-red-200',
  },
};

export function MidtermStrategyModal({ availableStrategies, gameState, onSelect }: MidtermStrategyModalProps) {
  const outcome = gameState.legislativeResults?.outcome ?? 'tie';

  const outcomeLabels: Record<string, string> = {
    landslide: 'Ganaste por paliza. Tenés capital político de sobra.',
    clear: 'Ganaste claramente. Tenés margen para maniobrar.',
    tie: 'Empate técnico. La paridad te obliga a ser cuidadoso.',
    minority: 'Minoría legislativa. Tu margen es estrecho.',
    defeat: 'Derrota legislativa. Necesitás reconstruir desde la negociación.',
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 md:p-8">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Definí tu Estrategia Post-Legislativa
            </h2>
            <p className="text-gray-600">
              {outcomeLabels[outcome] ?? 'Los resultados electorales redefinen tu margen de acción.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {(Object.keys(STRATEGY_INFO) as MidtermStrategy[]).map(strategy => {
              const info = STRATEGY_INFO[strategy];
              const effect = MIDTERM_STRATEGY_EFFECTS[strategy];
              const isAvailable = availableStrategies.includes(strategy);
              const Icon = info.icon;
              const isSelected = false;

              return (
                <button
                  key={strategy}
                  onClick={() => isAvailable && onSelect(strategy)}
                  disabled={!isAvailable}
                  className={`border-2 rounded-xl p-4 text-left transition-all ${
                    isAvailable
                      ? `${info.color} hover:shadow-md cursor-pointer active:scale-[0.98]`
                      : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2 rounded-lg ${isAvailable ? 'bg-white' : 'bg-gray-200'}`}>
                      <Icon className={`w-6 h-6 ${
                        strategy === 'acelerar' ? 'text-yellow-600' :
                        strategy === 'negociar' ? 'text-blue-600' :
                        strategy === 'abrirse' ? 'text-green-600' :
                        'text-red-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{info.name}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${info.riskColor}`}>
                        {info.riskLabel}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                    {effect.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/60 rounded-lg px-2 py-1">
                      <span className="text-gray-500">Efectividad</span>
                      <p className="font-semibold text-gray-900">
                        ×{effect.actionMultiplier.toFixed(2)}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg px-2 py-1">
                      <span className="text-gray-500">Estabilidad/turno</span>
                      <p className={`font-semibold ${effect.stabilityPerTurn > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {effect.stabilityPerTurn > 0 ? '+' : ''}{effect.stabilityPerTurn}
                      </p>
                    </div>
                    <div className="bg-white/60 rounded-lg px-2 py-1">
                      <span className="text-gray-500">Popularidad/turno</span>
                      <p className={`font-semibold ${effect.popularityPerTurn > 0 ? 'text-green-600' : effect.popularityPerTurn < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                        {effect.popularityPerTurn > 0 ? '+' : ''}{effect.popularityPerTurn !== 0 ? effect.popularityPerTurn : 'Sin cambio'}
                      </p>
                    </div>
                    {effect.actionCostModifier !== 0 && (
                      <div className="bg-white/60 rounded-lg px-2 py-1">
                        <span className="text-gray-500">Costo extra</span>
                        <p className="font-semibold text-orange-600">
                          +{effect.actionCostModifier} acción
                        </p>
                      </div>
                    )}
                  </div>

                  {!isAvailable && (
                    <div className="mt-3 flex items-center gap-1 text-xs text-gray-500">
                      <AlertTriangle className="w-3 h-3" />
                      No disponible en este contexto
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-gray-500 text-center italic">
            Esta decisión definirá tu margen de maniobra para el resto del mandato.
            {availableStrategies.length === 1 && ' Solo tenés una opción viable en este contexto político.'}
          </p>
        </div>
      </div>
    </div>
  );
}
