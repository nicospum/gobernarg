import { CheckCircle2 } from 'lucide-react';
import { GroupAgendaItem } from '../types/game';

interface AgendaItemProps {
  agenda: GroupAgendaItem;
  turnsLeft: number;
  onSatisfy: (agendaId: string) => void;
}

export function AgendaItem({ agenda, turnsLeft, onSatisfy }: AgendaItemProps) {
  const isSatisfied = agenda.satisfied;
  const isExpired = turnsLeft <= 0 && !isSatisfied;
  const isUrgent = turnsLeft <= 2 && turnsLeft > 0 && !isSatisfied;

  return (
    <div className={`border rounded-lg p-2 mb-2 text-xs ${
      isSatisfied
        ? 'bg-green-50 border-green-200'
        : isExpired
        ? 'bg-red-50 border-red-300'
        : isUrgent
        ? 'bg-yellow-50 border-yellow-300'
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className="flex justify-between items-start gap-2">
        <div className="flex-1">
          <p className={`font-medium ${isExpired ? 'text-red-700' : 'text-gray-800'}`}>
            {agenda.demand}
          </p>
          <p className={`mt-0.5 ${isExpired ? 'text-red-600' : isUrgent ? 'text-yellow-700' : 'text-gray-500'}`}>
            {isSatisfied
              ? '✓ Cumplida'
              : isExpired
              ? '⚠ Vencida'
              : `⏳ ${turnsLeft} turno${turnsLeft !== 1 ? 's' : ''} restante${turnsLeft !== 1 ? 's' : ''}`}
          </p>
        </div>
        {!isSatisfied && !isExpired && (
          <button
            onClick={() => onSatisfy(agenda.id)}
            className="px-2 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-1 shrink-0"
            title="Cumplir esta demanda"
          >
            <CheckCircle2 className="w-3 h-3" />
            Cumplir
          </button>
        )}
      </div>
    </div>
  );
}
