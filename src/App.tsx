import { useMemo, useRef, useState } from 'react';
import { ArrowUpDown, SlidersHorizontal } from 'lucide-react';
import { CourseBookingDrawer } from './components/CourseBookingDrawer';
import { CourseCard } from './components/CourseCard';
import { CreditProfileDrawer } from './components/CreditProfileDrawer';
import { FilterSidebar } from './components/FilterSidebar';
import { HeroSearchBar } from './components/HeroSearchBar';
import { SavedBookingsDrawer } from './components/SavedBookingsDrawer';
import { TopBar } from './components/TopBar';
import {
  calculateCourseFee,
  COURSES,
  HOBBY_SUBCATEGORIES,
  WORK_SUBCATEGORIES,
} from './data/courses';
import {
  BookingRecord,
  Course,
  CreditProfile,
  DurationBucket,
  FilterState,
  LearningMode,
  SkillTrack,
  SortOption,
} from './types/course';

const INITIAL_FILTERS: FilterState = {
  track: 'all',
  subCategory: '',
  query: '',
  duration: 'any',
  durationMulti: [],
  schedule: 'any',
  modeFilters: [],
  budget: 'any',
  onlyCreditEligible: false,
  onlyMidCareer: false,
  onlyWsq: false,
  sortBy: 'recommended',
};

const INITIAL_CREDIT_PROFILE: CreditProfile = {
  tier: 'sc-25-39',
  openingCreditBalance: 500,
  midCareerCreditBalance: 0,
};

export default function App() {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [creditProfile, setCreditProfile] = useState<CreditProfile>(INITIAL_CREDIT_PROFILE);
  const [savedIds, setSavedIds] = useState<string[]>(['w-genai-workflows', 'h-artisan-sourdough']);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [isCreditDrawerOpen, setIsCreditDrawerOpen] = useState(false);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [savedDrawerTab, setSavedDrawerTab] = useState<'saved' | 'bookings'>('saved');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const resultsSectionRef = useRef<HTMLDivElement>(null);

  const totalAvailableCredit =
    creditProfile.openingCreditBalance + creditProfile.midCareerCreditBalance;

  function updateFilters(partial: Partial<FilterState>) {
    setFilters((prev) => ({ ...prev, ...partial }));
  }

  function handleSelectTrack(track: SkillTrack, shouldScroll = false) {
    setFilters((prev) => ({
      ...prev,
      track,
      subCategory: '',
    }));
    if (shouldScroll) {
      resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleChangeHeroDuration(duration: DurationBucket) {
    setFilters((prev) => ({
      ...prev,
      duration,
      durationMulti: duration === 'any' ? [] : [duration],
    }));
  }

  function handleToggleDurationMulti(bucket: Exclude<DurationBucket, 'any'>) {
    setFilters((prev) => {
      const current = new Set(prev.durationMulti);
      if (prev.duration !== 'any') current.add(prev.duration);

      if (current.has(bucket)) {
        current.delete(bucket);
      } else {
        current.add(bucket);
      }

      const nextList = Array.from(current);
      return {
        ...prev,
        durationMulti: nextList,
        duration: nextList.length === 1 ? nextList[0] : 'any',
      };
    });
  }

  function handleToggleMode(mode: LearningMode) {
    setFilters((prev) => {
      const exists = prev.modeFilters.includes(mode);
      return {
        ...prev,
        modeFilters: exists
          ? prev.modeFilters.filter((m) => m !== mode)
          : [...prev.modeFilters, mode],
      };
    });
  }

  function handleResetFilters() {
    setFilters(INITIAL_FILTERS);
  }

  function handleToggleSave(courseId: string) {
    setSavedIds((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId]
    );
  }

  function handleConfirmBooking(record: BookingRecord) {
    setBookings((prev) => [record, ...prev]);
    setCreditProfile((prev) => ({
      ...prev,
      openingCreditBalance: Math.max(0, prev.openingCreditBalance - record.openingCreditUsed),
      midCareerCreditBalance: Math.max(
        0,
        prev.midCareerCreditBalance - record.midCareerCreditUsed
      ),
    }));
  }

  function handleCancelBooking(bookingRef: string) {
    const target = bookings.find((b) => b.bookingRef === bookingRef);
    if (!target) return;
    setBookings((prev) => prev.filter((b) => b.bookingRef !== bookingRef));
    setCreditProfile((prev) => ({
      ...prev,
      openingCreditBalance: prev.openingCreditBalance + target.openingCreditUsed,
      midCareerCreditBalance: prev.midCareerCreditBalance + target.midCareerCreditUsed,
    }));
  }

  // Courses matching everything except duration (so sidebar duration counts stay accurate)
  const coursesBeforeDuration = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return COURSES.filter((course) => {
      if (filters.track !== 'all' && course.track !== filters.track) return false;
      if (filters.subCategory && course.subCategory !== filters.subCategory) return false;

      if (q) {
        const haystack =
          `${course.title} ${course.provider} ${course.subCategory} ${course.summary} ${course.areaLabel} ${course.referenceCode}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      if (filters.schedule !== 'any' && !course.scheduleTags.includes(filters.schedule)) {
        return false;
      }

      if (filters.modeFilters.length > 0 && !filters.modeFilters.includes(course.mode)) {
        return false;
      }

      if (filters.onlyCreditEligible && !course.skillsFutureCreditEligible) return false;
      if (filters.onlyMidCareer && !course.midCareerTopUpEligible) return false;
      if (filters.onlyWsq && !course.wsqCertified) return false;

      if (filters.budget !== 'any') {
        const fee = calculateCourseFee(course, creditProfile, true).outOfPocket;
        if (filters.budget === 'zero-cash' && fee > 0) return false;
        if (filters.budget === 'under-100' && fee >= 100) return false;
        if (filters.budget === 'under-300' && fee >= 300) return false;
      }

      return true;
    });
  }, [filters, creditProfile]);

  const durationCounts = useMemo(() => {
    const counts: Record<Exclude<DurationBucket, 'any'>, number> = {
      'half-day': 0,
      '1-2-days': 0,
      '3-5-days': 0,
      'multi-week': 0,
    };
    for (const c of coursesBeforeDuration) {
      counts[c.durationBucket] += 1;
    }
    return counts;
  }, [coursesBeforeDuration]);

  const filteredCourses = useMemo(() => {
    const activeDurations =
      filters.durationMulti.length > 0
        ? filters.durationMulti
        : filters.duration !== 'any'
          ? [filters.duration]
          : [];

    const matched = coursesBeforeDuration.filter((course) => {
      if (activeDurations.length > 0 && !activeDurations.includes(course.durationBucket)) {
        return false;
      }
      return true;
    });

    return [...matched].sort((a, b) => {
      if (filters.sortBy === 'lowest-fee') {
        const feeA = calculateCourseFee(a, creditProfile, true).outOfPocket;
        const feeB = calculateCourseFee(b, creditProfile, true).outOfPocket;
        return feeA - feeB || b.traqom.overall - a.traqom.overall;
      }
      if (filters.sortBy === 'soonest') {
        return a.intakes[0].startDateIso.localeCompare(b.intakes[0].startDateIso);
      }
      if (filters.sortBy === 'shortest') {
        return a.totalHours - b.totalHours;
      }
      // Recommended: TRAQOM weighted with review count
      return b.traqom.overall - a.traqom.overall || b.traqom.reviewCount - a.traqom.reviewCount;
    });
  }, [coursesBeforeDuration, filters.duration, filters.durationMulti, filters.sortBy, creditProfile]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.track !== 'all') count += 1;
    if (filters.subCategory) count += 1;
    if (filters.query.trim()) count += 1;
    if (filters.duration !== 'any' || filters.durationMulti.length > 0) count += 1;
    if (filters.schedule !== 'any') count += 1;
    if (filters.modeFilters.length > 0) count += 1;
    if (filters.budget !== 'any') count += 1;
    if (filters.onlyCreditEligible) count += 1;
    if (filters.onlyMidCareer) count += 1;
    if (filters.onlyWsq) count += 1;
    return count;
  }, [filters]);

  const workCount = useMemo(() => COURSES.filter((c) => c.track === 'work').length, []);
  const hobbyCount = useMemo(() => COURSES.filter((c) => c.track === 'hobby').length, []);

  const visibleSubCategories = useMemo(() => {
    if (filters.track === 'work') return [...WORK_SUBCATEGORIES];
    if (filters.track === 'hobby') return [...HOBBY_SUBCATEGORIES];
    return [...WORK_SUBCATEGORIES.slice(0, 2), ...HOBBY_SUBCATEGORIES.slice(0, 2)];
  }, [filters.track]);

  const savedCourses = useMemo(
    () => COURSES.filter((c) => savedIds.includes(c.id)),
    [savedIds]
  );

  const bookedCourseIds = useMemo(
    () => new Set(bookings.map((b) => b.courseId)),
    [bookings]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F8FA] text-[#0F172A]">
      {/* Strict 3-Zone Top Bar */}
      <TopBar
        activeTrack={filters.track}
        savedCount={savedIds.length}
        bookingsCount={bookings.length}
        totalAvailableCredit={totalAvailableCredit}
        onSelectTrack={(track) => handleSelectTrack(track, true)}
        onOpenSaved={() => {
          setSavedDrawerTab('saved');
          setIsSavedDrawerOpen(true);
        }}
        onOpenCredit={() => setIsCreditDrawerOpen(true)}
      />

      {/* Hero + Booking-Style Unified Search Bar */}
      <HeroSearchBar
        track={filters.track}
        query={filters.query}
        duration={filters.duration}
        schedule={filters.schedule}
        onChangeTrack={(track) => handleSelectTrack(track, false)}
        onChangeQuery={(query) => updateFilters({ query })}
        onChangeDuration={handleChangeHeroDuration}
        onChangeSchedule={(schedule) => updateFilters({ schedule })}
        onSubmitSearch={() =>
          resultsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      />

      {/* Main Streamlined Booking Marketplace Workspace */}
      <main
        ref={resultsSectionRef}
        className="flex-1 max-w-[1200px] w-full mx-auto px-4 sm:px-6 pt-14 sm:pt-16 pb-16"
      >
        {/* Top Toolbar: Work Skills / Hobby Skills Segmented Tabs + Sort */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#E5E9F0]">
          {/* Interactive Track Segmented Switcher */}
          <div className="flex flex-wrap items-center gap-3">
            <div
              role="tablist"
              aria-label="Course skill tracks"
              className="inline-flex items-center p-1 bg-[#EAEFF5] rounded-lg"
            >
              {(
                [
                  { id: 'all', label: `All Courses (${COURSES.length})` },
                  { id: 'work', label: `Work Skills (${workCount})` },
                  { id: 'hobby', label: `Hobby Skills (${hobbyCount})` },
                ] as { id: SkillTrack; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={filters.track === tab.id}
                  onClick={() => handleSelectTrack(tab.id, false)}
                  className={`px-3.5 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums cursor-pointer ${
                    filters.track === tab.id
                      ? 'bg-white text-[#003B73] shadow-xs font-semibold'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Mobile Saved quick link */}
            <button
              type="button"
              onClick={() => {
                setSavedDrawerTab('saved');
                setIsSavedDrawerOpen(true);
              }}
              className="md:hidden px-3 py-2 text-xs font-medium text-[#003B73] bg-white border border-[#E5E9F0] rounded-lg whitespace-nowrap shrink-0 tabular-nums"
            >
              Saved ({savedIds.length + bookings.length})
            </button>
          </div>

          {/* Right Controls: Mobile Filters + Result Count + Sort */}
          <div className="flex items-center justify-between md:justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0F172A] bg-white border border-[#CBD5E1] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </span>
            </button>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-sm text-[#475569] tabular-nums whitespace-nowrap">
                <strong className="font-semibold text-[#0F172A]">
                  {filteredCourses.length}
                </strong>{' '}
                {filteredCourses.length === 1 ? 'course' : 'courses'} found
              </span>

              <div className="inline-flex items-center gap-2 bg-white border border-[#E5E9F0] rounded-lg px-3 py-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#64748B] shrink-0" aria-hidden="true" />
                <label htmlFor="sort-courses" className="sr-only">
                  Sort courses
                </label>
                <select
                  id="sort-courses"
                  value={filters.sortBy}
                  onChange={(e) => updateFilters({ sortBy: e.target.value as SortOption })}
                  className="bg-transparent text-xs sm:text-sm font-medium text-[#0F172A] focus:outline-none cursor-pointer"
                >
                  <option value="recommended">Top Rated (TRAQOM)</option>
                  <option value="lowest-fee">Lowest Out-of-Pocket</option>
                  <option value="soonest">Soonest Start Date</option>
                  <option value="shortest">Shortest Duration</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Topic Quick Filter Bar (Contextual to Work Skills / Hobby Skills) */}
        <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-medium text-[#64748B] whitespace-nowrap shrink-0 mr-1">
            Focus area:
          </span>
          <button
            type="button"
            onClick={() => updateFilters({ subCategory: '' })}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              filters.subCategory === ''
                ? 'bg-[#003B73] text-white'
                : 'bg-white text-[#475569] border border-[#E5E9F0] hover:text-[#0F172A]'
            }`}
          >
            All Topics
          </button>
          {visibleSubCategories.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() =>
                updateFilters({
                  subCategory: filters.subCategory === topic ? '' : topic,
                })
              }
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filters.subCategory === topic
                  ? 'bg-[#003B73] text-white'
                  : 'bg-white text-[#475569] border border-[#E5E9F0] hover:text-[#0F172A]'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Booking.com 2-Column Catalog Grid */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[268px_1fr] gap-7 items-start">
          <FilterSidebar
            filters={filters}
            creditProfile={creditProfile}
            durationCounts={durationCounts}
            activeFilterCount={activeFilterCount}
            isMobileOpen={isMobileFiltersOpen}
            onCloseMobile={() => setIsMobileFiltersOpen(false)}
            onUpdateFilters={updateFilters}
            onToggleDurationMulti={handleToggleDurationMulti}
            onToggleMode={handleToggleMode}
            onResetFilters={handleResetFilters}
            onOpenCreditDrawer={() => setIsCreditDrawerOpen(true)}
          />

          {/* Course Listings Feed */}
          <section aria-label="Course search results" className="space-y-4">
            {filteredCourses.length === 0 ? (
              <div className="bg-white border border-[#E5E9F0] rounded-xl px-6 py-14 text-center">
                <h2 className="font-display text-lg font-semibold text-[#0F172A]">
                  No courses match your current filters
                </h2>
                <p className="mt-2 text-sm text-[#64748B] max-w-md mx-auto">
                  Try widening your duration, schedule, or out-of-pocket fee filters to view more SkillsFuture-approved Work Skills and Hobby Skills.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 bg-[#006CE4] hover:bg-[#0057B8] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Reset all filters
                </button>
              </div>
            ) : (
              filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  creditProfile={creditProfile}
                  isSaved={savedIds.includes(course.id)}
                  isBooked={bookedCourseIds.has(course.id)}
                  onToggleSave={handleToggleSave}
                  onOpenCourse={(selected) => setActiveCourse(selected)}
                />
              ))
            )}
          </section>
        </div>
      </main>

      {/* Clean Minimal Footer */}
      <footer className="bg-white border-t border-[#E5E9F0] py-8">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#64748B]">
          <div>
            <span className="font-display font-semibold text-[#0F172A]">
              MySkillsFuture Courses
            </span>{' '}
            · Streamlined Singapore Course Discovery · TRAQOM & SkillsFuture Credit Estimator
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <button
              type="button"
              onClick={() => handleSelectTrack('work', true)}
              className="hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              Work Skills
            </button>
            <button
              type="button"
              onClick={() => handleSelectTrack('hobby', true)}
              className="hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              Hobby Skills
            </button>
            <button
              type="button"
              onClick={() => setIsCreditDrawerOpen(true)}
              className="hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              Fee Estimator
            </button>
            <button
              type="button"
              onClick={() => {
                setSavedDrawerTab('bookings');
                setIsSavedDrawerOpen(true);
              }}
              className="hover:text-[#0F172A] transition-colors cursor-pointer"
            >
              My Bookings
            </button>
          </div>
        </div>
      </footer>

      {/* Interactive Drawers */}
      <CourseBookingDrawer
        course={activeCourse}
        creditProfile={creditProfile}
        isSaved={activeCourse ? savedIds.includes(activeCourse.id) : false}
        onClose={() => setActiveCourse(null)}
        onToggleSave={handleToggleSave}
        onOpenCreditProfile={() => setIsCreditDrawerOpen(true)}
        onConfirmBooking={handleConfirmBooking}
        onOpenBookingsTab={() => {
          setSavedDrawerTab('bookings');
          setIsSavedDrawerOpen(true);
        }}
      />

      <CreditProfileDrawer
        isOpen={isCreditDrawerOpen}
        creditProfile={creditProfile}
        onClose={() => setIsCreditDrawerOpen(false)}
        onChangeProfile={setCreditProfile}
      />

      <SavedBookingsDrawer
        isOpen={isSavedDrawerOpen}
        activeTab={savedDrawerTab}
        savedCourses={savedCourses}
        bookings={bookings}
        creditProfile={creditProfile}
        onClose={() => setIsSavedDrawerOpen(false)}
        onChangeTab={setSavedDrawerTab}
        onRemoveSaved={handleToggleSave}
        onOpenCourse={(course) => setActiveCourse(course)}
        onCancelBooking={handleCancelBooking}
      />
    </div>
  );
}
