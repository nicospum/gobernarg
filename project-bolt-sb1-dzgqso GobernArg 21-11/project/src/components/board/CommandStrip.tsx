import { AlertCircle, BarChart3, Users, Vote } from 'lucide-react';
import type { GameState } from '../../types/game';
import { riskLabel } from '@/lib/risk';
import { defeatRisk, nextElection, scrollToPanel, turnInMandate } from '@/lib/boardView';

/** Barra de comando: briefing del turno, próxima elección y accesos a los paneles. */
export function CommandStrip({ gameState }: { gameState: GameState }) {
  const next = nextElection(gameState);
  const risk = defeatRisk(gameState.causal.political.iv);
  const inMandate = turnInMandate(gameState);
  const links = [
    { id: 'panel-pais', label: 'País', icon: BarChart3 },
    { id: 'panel-electoral', label: 'Electoral', icon: Vote },
    { id: 'panel-actores', label: 'Actores', icon: Users },
  ];
  return (
    <div className="bg-surface border-b border-rule">
      <div className="max-w-[1540px] mx-auto min-h-[46px] flex flex-wrap items-center gap-x-6 gap-y-2 px-4 lg:px-7 py-2">
        <div className="flex items-center gap-2.5 text-[11px] font-extrabold tracking-[0.13em] uppercase text-sala-navy">
          <span className="sr-live-dot" />
          Situación del gobierno
          <span className="text-sala-dim">/ Briefing {String(gameState.year).padStart(2, '0')}.{String(gameState.turn).padStart(2, '0')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-sala-muted">
          <AlertCircle size={15} className="text-sala-coral" />
          <b className="text-sala-coral tracking-[0.06em] uppercase text-[10px]">{next.label}</b>
          {next.turns === 0 ? ' al cerrar este turno' : ` en ${next.turns} ${next.turns === 1 ? 'turno' : 'turnos'}`}
          <span>·</span> riesgo de derrota {riskLabel(risk).toLowerCase()}
          <span className="hidden xl:inline text-sala-dim">· turno {inMandate} de 16</span>
        </div>
        <nav aria-label="Accesos" className="ml-auto flex gap-1">
          {links.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => scrollToPanel(id)}
              className="flex items-center gap-1.5 px-2.5 h-8 rounded-md text-[11px] text-sala-muted hover:text-sala-blue hover:bg-sunken"
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
