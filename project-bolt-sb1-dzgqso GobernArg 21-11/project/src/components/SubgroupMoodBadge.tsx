interface SubgroupMoodBadgeProps {
  mood: 'contento' | 'neutral' | 'disconforme' | 'enojado' | 'radicalizado';
}

const MOOD_CONFIG: Record<SubgroupMoodBadgeProps['mood'], { label: string; emoji: string; bg: string; text: string }> = {
  contento: { label: 'Contento', emoji: '😊', bg: 'bg-green-100', text: 'text-green-800' },
  neutral: { label: 'Neutral', emoji: '😐', bg: 'bg-blue-100', text: 'text-blue-800' },
  disconforme: { label: 'Disconforme', emoji: '🙁', bg: 'bg-yellow-100', text: 'text-yellow-800' },
  enojado: { label: 'Enojado', emoji: '😠', bg: 'bg-orange-100', text: 'text-orange-800' },
  radicalizado: { label: 'Radicalizado', emoji: '💀', bg: 'bg-red-100', text: 'text-red-800' },
};

export function SubgroupMoodBadge({ mood }: SubgroupMoodBadgeProps) {
  const config = MOOD_CONFIG[mood];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.emoji}
      {config.label}
    </span>
  );
}
