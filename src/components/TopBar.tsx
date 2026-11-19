import { SkillTrack } from '../types/course';

interface TopBarProps {
  activeTrack: SkillTrack;
  savedCount: number;
  bookingsCount: number;
  totalAvailableCredit: number;
  onSelectTrack: (track: SkillTrack) => void;
  onOpenSaved: () => void;
  onOpenCredit: () => void;
}

export function TopBar({
  activeTrack,
  savedCount,
  bookingsCount,
  totalAvailableCredit,
  onSelectTrack,
  onOpenSaved,
  onOpenCredit,
}: TopBarProps) {
  const savedTotal = savedCount + bookingsCount;

  return (
    <header className="bg-[#003B73] text-white border-b border-white/10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single crisp wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            onSelectTrack('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="font-display text-xl font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          MySkillsFuture
        </a>

        {/* Zone 2: 4 single-line text nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-white/85"
        >
          <button
            type="button"
            onClick={() => onSelectTrack('all')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTrack === 'all'
                ? 'text-white border-white'
                : 'border-transparent hover:text-white hover:border-white/40'
            }`}
          >
            Explore
          </button>
          <button
            type="button"
            onClick={() => onSelectTrack('work')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTrack === 'work'
                ? 'text-white border-white'
                : 'border-transparent hover:text-white hover:border-white/40'
            }`}
          >
            Work Skills
          </button>
          <button
            type="button"
            onClick={() => onSelectTrack('hobby')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
              activeTrack === 'hobby'
                ? 'text-white border-white'
                : 'border-transparent hover:text-white hover:border-white/40'
            }`}
          >
            Hobby Skills
          </button>
          <button
            type="button"
            onClick={onOpenSaved}
            className="py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 border-transparent hover:text-white hover:border-white/40 tabular-nums"
          >
            {savedTotal > 0 ? `Saved (${savedTotal})` : 'Saved'}
          </button>
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCredit}
            className="px-4 py-2 text-sm font-medium text-[#003B73] bg-white hover:bg-[#F1F5F9] rounded-lg transition-colors whitespace-nowrap shrink-0 tabular-nums"
          >
            Credit · S${totalAvailableCredit.toLocaleString()}
          </button>
        </div>
      </div>
    </header>
  );
}
