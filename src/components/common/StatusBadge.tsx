import { TRACKS } from '@/data/mockData';

interface StatusBadgeProps {
  type: string;
}

export function StatusBadge({ type }: StatusBadgeProps) {
  const isNewcomer = type === TRACKS.NEWCOMER;
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wide ${
      isNewcomer ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
    }`}>
      {isNewcomer ? 'Newcomer' : 'New Believer'}
    </span>
  );
}
