import { useState } from 'react';
import { Star, HandshakeIcon, MessageCircle, Award, Lock, Users } from 'lucide-react';
import { GameState, InteractionType } from '../types/game';
import { interestGroups } from '../data/interestGroups';
import { calculateInteractionCost } from '../utils/interactionCosts';
import { THUMBNAIL_GROUPS } from '../utils/iconThumbnails';
import { SupportBar } from './SupportBar';
import { SubgroupMoodBadge } from './SubgroupMoodBadge';
import { AgendaItem } from './AgendaItem';

interface InterestGroupsPanelProps {
  gameState: GameState;
  onInteraction: (subgroupId: string, type: InteractionType) => void;
  onSatisfyDemand?: (agendaId: string) => void;
}

const interactionConfig = {
  reunion: {
    icon: MessageCircle,
    color: 'blue',
    bgColor: 'bg-blue-100',
    hoverBg: 'hover:bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-300'
  },
  negociar: {
    icon: HandshakeIcon,
    color: 'green',
    bgColor: 'bg-green-100',
    hoverBg: 'hover:bg-green-50',
    textColor: 'text-green-700',
    borderColor: 'border-green-300'
  },
  conceder: {
    icon: Award,
    color: 'purple',
    bgColor: 'bg-purple-100',
    hoverBg: 'hover:bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-300'
  }
};

export function InterestGroupsPanel({ gameState, onInteraction, onSatisfyDemand }: InterestGroupsPanelProps) {
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => 
      prev.includes(groupId) 
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const isInteractionBlocked = (subgroupId: string) => {
    const interaction = gameState.interactionHistory[subgroupId];
    return interaction && interaction.turnsLeft > 0;
  };

  const getInteractionStatus = (subgroupId: string, type: InteractionType) => {
    const interaction = gameState.interactionHistory[subgroupId];
    if (interaction && interaction.turnsLeft > 0) {
      return {
        isSelected: interaction.lastInteraction === type,
        isDisabled: true,
        turnsLeft: interaction.turnsLeft
      };
    }
    return {
      isSelected: false,
      isDisabled: false,
      turnsLeft: 0
    };
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Grupos de Interés y Facciones</h2>
      
      {interestGroups.map(group => (
        <div key={group.id} className="border rounded-lg shadow-sm">
          <button
            onClick={() => toggleGroup(group.id)}
            className="w-full p-4 text-left flex justify-between items-center hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              {(() => {
                const firstSubgroupWithIcon = group.subgroups.find(sg => THUMBNAIL_GROUPS[sg.id]);
                const icon = firstSubgroupWithIcon ? THUMBNAIL_GROUPS[firstSubgroupWithIcon.id] : null;
                return icon ? (
                  <img src={icon} alt={group.name} className="w-8 h-8 object-contain rounded bg-blue-50 p-1" />
                ) : (
                  <Users className="w-6 h-6 text-blue-600" />
                );
              })()}
              <span className="font-semibold">{group.name}</span>
            </div>
            <span className={`transform transition-transform duration-200 ${
              openGroups.includes(group.id) ? 'rotate-180' : ''
            }`}>▼</span>
          </button>
          
          {openGroups.includes(group.id) && (
            <div className="p-4 border-t space-y-4">
              {group.subgroups.map(subgroup => {
                const isBlocked = isInteractionBlocked(subgroup.id);
                
                return (
                  <div key={subgroup.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold">{subgroup.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{subgroup.description}</p>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">{subgroup.influence}</span>
                      </div>
                    </div>

                    {/* Support & Mood */}
                    <div className="flex flex-col gap-1.5 mb-3">
                      <SupportBar value={gameState.groupRelations[subgroup.id] ?? subgroup.baseSupport} />
                      {(() => {
                        const mood = gameState.groupMoods.find(m => m.groupId === subgroup.id);
                        return mood ? <SubgroupMoodBadge mood={mood.mood} /> : null;
                      })()}
                    </div>

                    {/* Agendas activas */}
                    {onSatisfyDemand && (
                      <div className="mb-3">
                        {gameState.groupAgendas
                          .filter(a => a.groupId === subgroup.id)
                          .map(agenda => (
                            <AgendaItem
                              key={agenda.id}
                              agenda={agenda}
                              turnsLeft={agenda.deadline - gameState.turn}
                              onSatisfy={onSatisfyDemand}
                            />
                          ))}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(interactionConfig) as InteractionType[]).map((type) => {
                        const config = interactionConfig[type];
                        const cost = calculateInteractionCost(type, subgroup, gameState);
                        const status = getInteractionStatus(subgroup.id, type);
                        const disabled = gameState.budget < cost || gameState.actions <= 0 || status.isDisabled;
                        const Icon = config.icon;
                        
                        return (
                          <button
                            key={type}
                            onClick={() => !disabled && onInteraction(subgroup.id, type)}
                            disabled={disabled}
                            className={`
                              flex-1 min-w-[120px] px-3 py-2 rounded-lg transition-all 
                              flex items-center justify-center gap-2 border
                              ${status.isSelected ? `${config.bgColor} ${config.borderColor}` : ''}
                              ${disabled && !status.isSelected
                                ? 'bg-gray-50 border-gray-200 cursor-not-allowed opacity-50'
                                : `hover:${config.bgColor} border-gray-300 hover:${config.borderColor} 
                                   ${config.textColor} hover:shadow-sm`
                              }
                            `}
                            title={disabled ? 'No disponible' : ''}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="font-medium">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                            {cost > 0 && !status.isDisabled && (
                              <span className="text-sm">
                                ${cost}M
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {isBlocked && (
                      <div className="mt-2 text-sm text-orange-600 flex items-center gap-1">
                        <Lock className="w-4 h-4" />
                        <span>No puedes volver a interactuar por {gameState.interactionHistory[subgroup.id].turnsLeft} turnos</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}