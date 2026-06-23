import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { AdvisorWithStatus } from '../types/game';

interface AdvisorDismissModalProps {
  onClose: () => void;
  onDismiss: (selectedAdvisor: AdvisorWithStatus) => void;
  advisors: AdvisorWithStatus[];
}

export function AdvisorDismissModal({ onClose, onDismiss, advisors }: AdvisorDismissModalProps) {
  const [selectedAdvisor, setSelectedAdvisor] = useState<AdvisorWithStatus | null>(null);

  const handleAdvisorSelect = (advisor: AdvisorWithStatus) => {
    setSelectedAdvisor(prev => (prev?.id === advisor.id ? null : advisor));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="p-4 bg-red-900 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Despedir Asesor</h2>
          <button onClick={onClose} className="p-1 hover:bg-red-800 rounded">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 gap-4">
            {advisors.map((advisor) => {
              const isSelected = selectedAdvisor?.id === advisor.id;
              
              return (
                <button
                  key={advisor.id}
                  onClick={() => handleAdvisorSelect(advisor)}
                  className={`p-4 border rounded-lg text-left transition-all ${
                    isSelected
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{advisor.name}</h3>
                      <p className="text-sm text-gray-600">{advisor.specialty}</p>
                      <p className="text-sm text-gray-500 mt-1">{advisor.description}</p>
                      <p className="text-sm mt-1">
                        {advisor.isActive ? (
                          <span className="text-green-600">Activo</span>
                        ) : (
                          <span className="text-gray-600">
                            Inactivo por {advisor.turnsInactive} {advisor.turnsInactive === 1 ? 'turno' : 'turnos'}
                          </span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm">{advisor.influence}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <p>Asesor seleccionado: {selectedAdvisor?.name || 'Ninguno'}</p>
            </div>
            <button
              onClick={() => selectedAdvisor && onDismiss(selectedAdvisor)}
              disabled={!selectedAdvisor}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Expulsar Asesor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
