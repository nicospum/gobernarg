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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl">
        <div className="px-5 py-4 border-b border-border flex justify-between items-center">
          <h2 className="font-display text-xl font-bold uppercase tracking-wide text-destructive">Despedir Asesor</h2>
          <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground rounded transition-colors">
            <X className="w-5 h-5" />
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
                      ? 'border-destructive bg-destructive/10'
                      : 'border-border bg-card hover:border-destructive/40 hover:bg-white/3'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{advisor.name}</h3>
                      <p className="text-sm text-foreground/70">{advisor.specialty}</p>
                      <p className="text-sm text-muted-foreground mt-1">{advisor.description}</p>
                      <p className="text-sm mt-1">
                        {advisor.isActive ? (
                          <span className="text-emerald-400">Activo</span>
                        ) : (
                          <span className="text-muted-foreground">
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

        <div className="px-5 py-4 border-t border-border">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <p className="text-foreground">Asesor seleccionado: {selectedAdvisor?.name || 'Ninguno'}</p>
            </div>
            <button
              onClick={() => selectedAdvisor && onDismiss(selectedAdvisor)}
              disabled={!selectedAdvisor}
              className="bg-destructive hover:bg-destructive/90 disabled:bg-white/5 disabled:text-muted-foreground disabled:cursor-not-allowed text-destructive-foreground px-6 py-2 rounded font-display font-bold uppercase tracking-wide text-sm transition-colors"
            >
              Expulsar Asesor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
