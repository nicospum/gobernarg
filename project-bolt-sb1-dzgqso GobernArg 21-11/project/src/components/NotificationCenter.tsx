import { X, Check, AlertTriangle, Info, AlertCircle, Trophy } from 'lucide-react';
import { GameState, NotificationImportance } from '../types/game';
import { PanelHead } from './board/PanelHead';

interface NotificationCenterProps {
  gameState: GameState;
  onMarkRead: () => void;
  onDismiss: (id: string) => void;
  index?: string;
  /** Sin marco de panel (dentro de la hoja del celular). */
  bare?: boolean;
}

export function NotificationCenter({ gameState, onMarkRead, onDismiss, index, bare = false }: NotificationCenterProps) {
  const notifications = gameState.notifications.slice(0, 10);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <section id="panel-notificaciones" className={`${bare ? '' : 'sr-panel'} scroll-mt-24`} aria-label="Notificaciones">
      {!bare && (
        <PanelHead index={index} label="Mesa de entradas" title="Notificaciones">
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold text-white bg-sala-coral rounded-full px-2 py-0.5">{unreadCount}</span>
          )}
        </PanelHead>
      )}
      {notifications.length > 0 && (
        <div className="flex justify-end px-4 pt-2.5">
          <button onClick={onMarkRead} className="text-[11px] font-semibold text-sala-blue hover:underline flex items-center gap-1">
            <Check className="w-3.5 h-3.5" /> Marcar leídas
          </button>
        </div>
      )}

      <ul className={`${bare ? '' : 'max-h-[420px] overflow-y-auto'} px-3 pt-2 pb-3 space-y-2`}>
        {notifications.length === 0 && (
          <li className="text-sala-muted text-[12px] text-center py-4">No hay notificaciones aún.</li>
        )}

        {notifications.map(notification => (
          <li
            key={notification.id}
            className={`relative pl-4 pr-2.5 py-2.5 rounded-lg border border-rule flex gap-2.5 transition-opacity ${
              notification.read ? 'opacity-70 bg-sunken/40' : 'bg-surface'
            }`}
          >
            <span className={`absolute left-0 top-2.5 bottom-2.5 w-1 rounded-r ${getImportanceBar(notification.importance)}`} aria-hidden="true" />
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.importance)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`font-bold text-[12px] ${getTitleColor(notification.importance)}`}>
                  {notification.title}
                </p>
                <button
                  onClick={() => onDismiss(notification.id)}
                  className="text-sala-dim hover:text-ink flex-shrink-0"
                  aria-label="Descartar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[12px] text-sala-muted mt-0.5 leading-snug">{notification.message}</p>
              <p className="text-[10px] text-sala-dim mt-1 uppercase tracking-[0.08em]">
                {/* Punto 13: fecha de creación de la notificación (fallback al
                    turno vivo para notificaciones viejas sin el campo). */}
                Año {notification.year ?? gameState.year} · Trimestre {notification.turn ?? gameState.turn}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function getIcon(importance: NotificationImportance) {
  switch (importance) {
    case 'critical':
      return <AlertTriangle className="w-4 h-4 text-sala-bad" />;
    case 'high':
      return <AlertCircle className="w-4 h-4 text-sala-coral" />;
    case 'medium':
      return <Info className="w-4 h-4 text-sala-blue" />;
    case 'low':
      return <Info className="w-4 h-4 text-sala-dim" />;
    case 'success':
      return <Trophy className="w-4 h-4 text-sala-good" />;
    default:
      return <Info className="w-4 h-4 text-sala-dim" />;
  }
}

function getImportanceBar(importance: NotificationImportance): string {
  switch (importance) {
    case 'critical':
      return 'bg-sala-bad';
    case 'high':
      return 'bg-sala-coral';
    case 'medium':
      return 'bg-sala-blue';
    case 'success':
      return 'bg-sala-good';
    default:
      return 'bg-rule';
  }
}

function getTitleColor(importance: NotificationImportance): string {
  switch (importance) {
    case 'critical':
      return 'text-sala-bad';
    case 'high':
      return 'text-sala-coral';
    case 'medium':
      return 'text-sala-blue';
    case 'success':
      return 'text-sala-good';
    default:
      return 'text-ink';
  }
}
