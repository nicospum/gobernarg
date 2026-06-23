import { Bell, X, Check, AlertTriangle, Info, AlertCircle, Trophy } from 'lucide-react';
import { GameState, NotificationImportance } from '../types/game';

interface NotificationCenterProps {
  gameState: GameState;
  onMarkRead: () => void;
  onDismiss: (id: string) => void;
}

export function NotificationCenter({ gameState, onMarkRead, onDismiss }: NotificationCenterProps) {
  const notifications = gameState.notifications.slice(0, 10);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="bg-white rounded-lg shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-600" />
          Notificaciones
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </h2>
        {notifications.length > 0 && (
          <button
            onClick={onMarkRead}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <Check className="w-4 h-4" />
            Marcar leídas
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {notifications.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No hay notificaciones aún.</p>
        )}

        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`p-3 rounded-lg border flex gap-3 transition-opacity ${
              notification.read ? 'opacity-70 bg-gray-50 border-gray-200' : 'bg-white border-gray-300'
            } ${getImportanceBorder(notification.importance)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getIcon(notification.importance)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`font-semibold text-sm ${getTitleColor(notification.importance)}`}>
                  {notification.title}
                </p>
                <button
                  onClick={() => onDismiss(notification.id)}
                  className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                  aria-label="Descartar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-0.5">{notification.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                Año {gameState.year} · Trimestre {gameState.turn}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getIcon(importance: NotificationImportance) {
  switch (importance) {
    case 'critical':
      return <AlertTriangle className="w-5 h-5 text-red-600" />;
    case 'high':
      return <AlertCircle className="w-5 h-5 text-orange-600" />;
    case 'medium':
      return <Info className="w-5 h-5 text-blue-600" />;
    case 'low':
      return <Info className="w-5 h-5 text-gray-500" />;
    case 'success':
      return <Trophy className="w-5 h-5 text-green-600" />;
    default:
      return <Info className="w-5 h-5 text-gray-500" />;
  }
}

function getImportanceBorder(importance: NotificationImportance): string {
  switch (importance) {
    case 'critical':
      return 'border-l-4 border-l-red-500';
    case 'high':
      return 'border-l-4 border-l-orange-500';
    case 'medium':
      return 'border-l-4 border-l-blue-500';
    case 'success':
      return 'border-l-4 border-l-green-500';
    default:
      return 'border-l-4 border-l-gray-300';
  }
}

function getTitleColor(importance: NotificationImportance): string {
  switch (importance) {
    case 'critical':
      return 'text-red-700';
    case 'high':
      return 'text-orange-700';
    case 'medium':
      return 'text-blue-700';
    case 'success':
      return 'text-green-700';
    default:
      return 'text-gray-700';
  }
}
