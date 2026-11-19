import { useState, useRef, useEffect } from 'react';
import { Briefcase, CalendarClock, Clock, Compass, Search, Sparkles, X } from 'lucide-react';
import { DURATION_LABELS, QUICK_SEARCH_SUGGESTIONS } from '../data/courses';
import { DurationBucket, ScheduleFilter, SkillTrack } from '../types/course';

interface HeroSearchBarProps {
  track: SkillTrack;
  query: string;
  duration: DurationBucket;
  schedule: ScheduleFilter;
  onChangeTrack: (track: SkillTrack) => void;
  onChangeQuery: (query: string) => void;
  onChangeDuration: (duration: DurationBucket) => void;
  onChangeSchedule: (schedule: ScheduleFilter) => void;
  onSubmitSearch: () => void;
}

export function HeroSearchBar({
  track,
  query,
  duration,
  schedule,
  onChangeTrack,
  onChangeQuery,
  onChangeDuration,
  onChangeSchedule,
  onSubmitSearch,
}: HeroSearchBarProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const filteredSuggestions = QUICK_SEARCH_SUGGESTIONS.filter((item) => {
    if (track !== 'all' && item.track !== track) return false;
    if (!query.trim()) return true;
    return item.label.toLowerCase().includes(query.trim().toLowerCase());
  });

  return (
    <section id="top" className="relative bg-[#003B73] text-white pt-8 sm:pt-10 pb-8">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="max-w-2xl">
          <h1 className="font-display text-[clamp(1.85rem,3.4vw,2.75rem)] font-bold leading-[1.15] tracking-tight text-balance text-white">
            Find and book your next skill in Singapore
          </h1>
          <p className="mt-2.5 text-[15px] sm:text-base text-white/80 leading-relaxed max-w-xl">
            Compare Work Skills and Hobby Skills side-by-side with clear durations, real SkillsFuture Credit deductions, and instant intake seats.
          </p>
        </div>
      </div>

      {/* Unified Booking-style 4-field search bar straddling hero bottom cleanly by 32px */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 mt-7 -mb-16 relative z-20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowSuggestions(false);
            onSubmitSearch();
          }}
          className="bg-[#D99B00] p-1 rounded-xl shadow-[0_10px_30px_-10px_rgba(0,30,66,0.28)]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[185px_1fr_195px_185px_auto] gap-1">
            {/* Field 1: Category (Work Skills / Hobby Skills) */}
            <div className="bg-white rounded-lg px-3.5 py-2.5 flex items-center gap-2.5 text-[#0F172A]">
              {track === 'work' ? (
                <Briefcase className="w-4 h-4 text-[#003B73] shrink-0" aria-hidden="true" />
              ) : track === 'hobby' ? (
                <Sparkles className="w-4 h-4 text-[#003B73] shrink-0" aria-hidden="true" />
              ) : (
                <Compass className="w-4 h-4 text-[#003B73] shrink-0" aria-hidden="true" />
              )}
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="search-category"
                  className="block text-[11px] font-medium text-[#64748B] leading-none mb-1"
                >
                  Skill category
                </label>
                <select
                  id="search-category"
                  value={track}
                  onChange={(e) => onChangeTrack(e.target.value as SkillTrack)}
                  className="w-full bg-transparent text-sm font-semibold text-[#0F172A] focus:outline-none cursor-pointer truncate"
                >
                  <option value="all">All Skills</option>
                  <option value="work">Work Skills</option>
                  <option value="hobby">Hobby Skills</option>
                </select>
              </div>
            </div>

            {/* Field 2: Course or Skill search input */}
            <div
              ref={searchBoxRef}
              className="relative bg-white rounded-lg px-3.5 py-2.5 flex items-center gap-2.5 text-[#0F172A]"
            >
              <Search className="w-4 h-4 text-[#003B73] shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="search-course"
                  className="block text-[11px] font-medium text-[#64748B] leading-none mb-1"
                >
                  Course or skill
                </label>
                <input
                  id="search-course"
                  type="text"
                  value={query}
                  onFocus={() => setShowSuggestions(true)}
                  onChange={(e) => {
                    onChangeQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  placeholder="Try Generative AI, Sourdough, Python, Pottery..."
                  className="w-full bg-transparent text-sm font-medium text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
                  autoComplete="off"
                />
              </div>
              {query && (
                <button
                  type="button"
                  onClick={() => onChangeQuery('')}
                  aria-label="Clear search query"
                  className="p-1 text-[#64748B] hover:text-[#0F172A] rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Quick Suggestions Dropdown */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] bg-white rounded-xl border border-[#E5E9F0] shadow-[0_14px_34px_-12px_rgba(15,23,42,0.2)] py-2 z-30">
                  <div className="px-3.5 py-1.5 text-xs font-medium text-[#64748B]">
                    Popular courses in Singapore
                  </div>
                  <div className="divide-y divide-[#F1F5F9]">
                    {filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion.label}
                        type="button"
                        onClick={() => {
                          onChangeQuery(suggestion.label);
                          setShowSuggestions(false);
                          onSubmitSearch();
                        }}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-[#F7F8FA] flex items-center justify-between gap-3 transition-colors"
                      >
                        <span className="text-sm font-medium text-[#0F172A] truncate">
                          {suggestion.label}
                        </span>
                        <span className="text-xs text-[#64748B] whitespace-nowrap shrink-0">
                          {suggestion.track === 'work' ? 'Work Skills' : 'Hobby Skills'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Field 3: Duration */}
            <div className="bg-white rounded-lg px-3.5 py-2.5 flex items-center gap-2.5 text-[#0F172A]">
              <Clock className="w-4 h-4 text-[#003B73] shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="search-duration"
                  className="block text-[11px] font-medium text-[#64748B] leading-none mb-1"
                >
                  Duration
                </label>
                <select
                  id="search-duration"
                  value={duration}
                  onChange={(e) => onChangeDuration(e.target.value as DurationBucket)}
                  className="w-full bg-transparent text-sm font-semibold text-[#0F172A] focus:outline-none cursor-pointer truncate"
                >
                  {(Object.keys(DURATION_LABELS) as DurationBucket[]).map((key) => (
                    <option key={key} value={key}>
                      {DURATION_LABELS[key]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field 4: Schedule / Format */}
            <div className="bg-white rounded-lg px-3.5 py-2.5 flex items-center gap-2.5 text-[#0F172A]">
              <CalendarClock className="w-4 h-4 text-[#003B73] shrink-0" aria-hidden="true" />
              <div className="flex-1 min-w-0">
                <label
                  htmlFor="search-schedule"
                  className="block text-[11px] font-medium text-[#64748B] leading-none mb-1"
                >
                  Schedule
                </label>
                <select
                  id="search-schedule"
                  value={schedule}
                  onChange={(e) => onChangeSchedule(e.target.value as ScheduleFilter)}
                  className="w-full bg-transparent text-sm font-semibold text-[#0F172A] focus:outline-none cursor-pointer truncate"
                >
                  <option value="any">Any schedule</option>
                  <option value="weekends">Weekends</option>
                  <option value="evenings">Weekday Evenings</option>
                  <option value="daytime">Weekday Daytime</option>
                  <option value="online">Live Online</option>
                </select>
              </div>
            </div>

            {/* Search Submit Button */}
            <button
              type="submit"
              className="bg-[#006CE4] hover:bg-[#0057B8] text-white font-display font-semibold text-[15px] px-7 py-3.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
