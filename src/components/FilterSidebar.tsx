import { SlidersHorizontal, X } from 'lucide-react';
import { DURATION_LABELS, RESIDENCY_TIER_INFO } from '../data/courses';
import {
  BudgetFilter,
  CreditProfile,
  DurationBucket,
  FilterState,
  LearningMode,
  SkillTrack,
} from '../types/course';

interface FilterSidebarProps {
  filters: FilterState;
  creditProfile: CreditProfile;
  durationCounts: Record<Exclude<DurationBucket, 'any'>, number>;
  activeFilterCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onUpdateFilters: (partial: Partial<FilterState>) => void;
  onToggleDurationMulti: (bucket: Exclude<DurationBucket, 'any'>) => void;
  onToggleMode: (mode: LearningMode) => void;
  onResetFilters: () => void;
  onOpenCreditDrawer: () => void;
}

const DURATION_OPTIONS: Exclude<DurationBucket, 'any'>[] = [
  'half-day',
  '1-2-days',
  '3-5-days',
  'multi-week',
];

const MODE_OPTIONS: LearningMode[] = ['In-Person', 'Live Online', 'Hybrid'];

const BUDGET_OPTIONS: { value: BudgetFilter; label: string }[] = [
  { value: 'any', label: 'Any out-of-pocket fee' },
  { value: 'zero-cash', label: 'S$0 cash after Credit' },
  { value: 'under-100', label: 'Under S$100' },
  { value: 'under-300', label: 'Under S$300' },
];

export function FilterSidebar({
  filters,
  creditProfile,
  durationCounts,
  activeFilterCount,
  isMobileOpen,
  onCloseMobile,
  onUpdateFilters,
  onToggleDurationMulti,
  onToggleMode,
  onResetFilters,
  onOpenCreditDrawer,
}: FilterSidebarProps) {
  const tierInfo = RESIDENCY_TIER_INFO[creditProfile.tier];
  const totalCredit =
    creditProfile.openingCreditBalance + creditProfile.midCareerCreditBalance;

  const content = (
    <div className="bg-white border border-[#E5E9F0] rounded-xl divide-y divide-[#EEF1F6]">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#003B73]" aria-hidden="true" />
          <h2 className="font-display text-[15px] font-semibold text-[#0F172A]">
            Filter by
          </h2>
        </div>
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs font-medium text-[#006CE4] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Reset ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Active Subsidy & Credit Estimator Row */}
      <div className="px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-[#0F172A]">
            Your Fee Tier
          </span>
          <button
            type="button"
            onClick={onOpenCreditDrawer}
            className="text-xs font-medium text-[#006CE4] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
          >
            Change
          </button>
        </div>
        <p className="mt-1.5 text-sm font-medium text-[#0F172A]">
          {tierInfo.shortLabel}
        </p>
        <p className="mt-0.5 text-xs text-[#64748B] tabular-nums">
          {totalCredit > 0
            ? `S$${totalCredit.toLocaleString()} SkillsFuture Credit applied`
            : 'Showing subsidised or standard fees'}
        </p>
      </div>

      {/* Category: Work Skills vs Hobby Skills */}
      <div className="px-5 py-4">
        <h3 className="text-xs font-semibold text-[#0F172A] mb-3">
          Skill Category
        </h3>
        <div className="space-y-2.5">
          {(
            [
              { value: 'all', label: 'All Skills' },
              { value: 'work', label: 'Work Skills' },
              { value: 'hobby', label: 'Hobby Skills' },
            ] as { value: SkillTrack; label: string }[]
          ).map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2.5 text-sm text-[#334155] cursor-pointer hover:text-[#0F172A]"
            >
              <input
                type="radio"
                name="sidebar-track"
                checked={filters.track === option.value}
                onChange={() =>
                  onUpdateFilters({ track: option.value, subCategory: '' })
                }
                className="w-4 h-4 accent-[#006CE4] cursor-pointer"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Course Duration */}
      <div className="px-5 py-4">
        <h3 className="text-xs font-semibold text-[#0F172A] mb-3">Duration</h3>
        <div className="space-y-2.5">
          {DURATION_OPTIONS.map((bucket) => {
            const isChecked =
              filters.duration === bucket ||
              filters.durationMulti.includes(bucket);
            return (
              <label
                key={bucket}
                className="flex items-center justify-between gap-2 text-sm text-[#334155] cursor-pointer hover:text-[#0F172A]"
              >
                <span className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => onToggleDurationMulti(bucket)}
                    className="w-4 h-4 rounded accent-[#006CE4] cursor-pointer"
                  />
                  <span>{DURATION_LABELS[bucket]}</span>
                </span>
                <span className="text-xs text-[#64748B] tabular-nums">
                  {durationCounts[bucket]}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Out-of-Pocket Cash Fee */}
      <div className="px-5 py-4">
        <h3 className="text-xs font-semibold text-[#0F172A] mb-3">
          Out-of-Pocket Cash
        </h3>
        <div className="space-y-2.5">
          {BUDGET_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2.5 text-sm text-[#334155] cursor-pointer hover:text-[#0F172A]"
            >
              <input
                type="radio"
                name="sidebar-budget"
                checked={filters.budget === option.value}
                onChange={() => onUpdateFilters({ budget: option.value })}
                className="w-4 h-4 accent-[#006CE4] cursor-pointer"
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Learning Mode */}
      <div className="px-5 py-4">
        <h3 className="text-xs font-semibold text-[#0F172A] mb-3">
          Learning Format
        </h3>
        <div className="space-y-2.5">
          {MODE_OPTIONS.map((mode) => (
            <label
              key={mode}
              className="flex items-center gap-2.5 text-sm text-[#334155] cursor-pointer hover:text-[#0F172A]"
            >
              <input
                type="checkbox"
                checked={filters.modeFilters.includes(mode)}
                onChange={() => onToggleMode(mode)}
                className="w-4 h-4 rounded accent-[#006CE4] cursor-pointer"
              />
              <span>{mode}</span>
            </label>
          ))}
        </div>
      </div>

      {/* SkillsFuture Funding & Accreditation */}
      <div className="px-5 py-4">
        <h3 className="text-xs font-semibold text-[#0F172A] mb-3">
          Funding & Certification
        </h3>
        <div className="space-y-2.5">
          <label className="flex items-center gap-2.5 text-sm text-[#334155] cursor-pointer hover:text-[#0F172A]">
            <input
              type="checkbox"
              checked={filters.onlyCreditEligible}
              onChange={(e) =>
                onUpdateFilters({ onlyCreditEligible: e.target.checked })
              }
              className="w-4 h-4 rounded accent-[#006CE4] cursor-pointer"
            />
            <span>SkillsFuture Credit eligible</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm text-[#334155] cursor-pointer hover:text-[#0F172A]">
            <input
              type="checkbox"
              checked={filters.onlyMidCareer}
              onChange={(e) =>
                onUpdateFilters({ onlyMidCareer: e.target.checked })
              }
              className="w-4 h-4 rounded accent-[#006CE4] cursor-pointer"
            />
            <span>Mid-Career (40+) Top-Up</span>
          </label>
          <label className="flex items-center gap-2.5 text-sm text-[#334155] cursor-pointer hover:text-[#0F172A]">
            <input
              type="checkbox"
              checked={filters.onlyWsq}
              onChange={(e) => onUpdateFilters({ onlyWsq: e.target.checked })}
              className="w-4 h-4 rounded accent-[#006CE4] cursor-pointer"
            />
            <span>WSQ Certified</span>
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Left Filter Rail */}
      <aside aria-label="Course filters" className="hidden lg:block">
        {content}
      </aside>

      {/* Mobile Filter Drawer */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden flex justify-end bg-[#0F172A]/45"
          onClick={onCloseMobile}
        >
          <div
            className="w-full max-w-sm bg-[#F7F8FA] h-full overflow-y-auto p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-base font-semibold text-[#0F172A]">
                Filters
              </span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Close filters"
                className="p-2 rounded-lg text-[#475569] hover:bg-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {content}
            <div className="mt-4">
              <button
                type="button"
                onClick={onCloseMobile}
                className="w-full py-3 px-4 bg-[#006CE4] text-white text-sm font-semibold rounded-lg"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
