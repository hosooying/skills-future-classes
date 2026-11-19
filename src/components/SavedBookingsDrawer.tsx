import { useEffect } from 'react';
import { Calendar, Check, MapPin, Trash2, X } from 'lucide-react';
import { calculateCourseFee } from '../data/courses';
import { BookingRecord, Course, CreditProfile } from '../types/course';

interface SavedBookingsDrawerProps {
  isOpen: boolean;
  activeTab: 'saved' | 'bookings';
  savedCourses: Course[];
  bookings: BookingRecord[];
  creditProfile: CreditProfile;
  onClose: () => void;
  onChangeTab: (tab: 'saved' | 'bookings') => void;
  onRemoveSaved: (courseId: string) => void;
  onOpenCourse: (course: Course) => void;
  onCancelBooking: (bookingRef: string) => void;
}

export function SavedBookingsDrawer({
  isOpen,
  activeTab,
  savedCourses,
  bookings,
  creditProfile,
  onClose,
  onChangeTab,
  onRemoveSaved,
  onOpenCourse,
  onCancelBooking,
}: SavedBookingsDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="saved-drawer-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E5E9F0] flex items-center justify-between gap-4">
          <h2
            id="saved-drawer-title"
            className="font-display text-lg font-bold text-[#0F172A]"
          >
            Shortlist & Bookings
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortlist and bookings"
            className="p-2 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-[#F7F8FA] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean Segmented Tabs */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 p-1 bg-[#F1F5F9] rounded-lg">
            <button
              type="button"
              onClick={() => onChangeTab('saved')}
              className={`py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap tabular-nums cursor-pointer ${
                activeTab === 'saved'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              Saved ({savedCourses.length})
            </button>
            <button
              type="button"
              onClick={() => onChangeTab('bookings')}
              className={`py-2 px-3 text-sm font-medium rounded-md transition-colors whitespace-nowrap tabular-nums cursor-pointer ${
                activeTab === 'bookings'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'text-[#475569] hover:text-[#0F172A]'
              }`}
            >
              My Bookings ({bookings.length})
            </button>
          </div>
        </div>

        <div className="px-6 py-5 flex-1">
          {activeTab === 'saved' ? (
            savedCourses.length === 0 ? (
              <div className="py-12 text-center">
                <p className="font-display text-base font-semibold text-[#0F172A]">
                  No saved courses yet
                </p>
                <p className="mt-1.5 text-sm text-[#64748B] max-w-xs mx-auto">
                  Tap the heart icon on any Work Skill or Hobby Skill to compare durations and fees side-by-side.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-[#EEF1F6]">
                {savedCourses.map((course) => {
                  const fee = calculateCourseFee(course, creditProfile, true);
                  return (
                    <div key={course.id} className="py-4 first:pt-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs text-[#64748B]">
                            <span className="font-semibold text-[#003B73]">
                              {course.track === 'work' ? 'Work Skills' : 'Hobby Skills'}
                            </span>{' '}
                            · {course.durationLabel} · {course.areaLabel}
                          </div>
                          <h3 className="mt-1 font-display text-[15px] font-semibold text-[#0F172A] leading-snug">
                            {course.title}
                          </h3>
                          <div className="mt-1 text-xs text-[#64748B] tabular-nums">
                            {course.provider} · Next: {course.intakes[0].dateLabel}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-display text-lg font-bold text-[#0F172A] tabular-nums">
                            S${fee.outOfPocket.toLocaleString()}
                          </div>
                          <div className="text-[11px] text-[#047857]">
                            {fee.isFullyCovered ? 'Covered by Credit' : 'Est. cash'}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onOpenCourse(course);
                          }}
                          className="bg-[#006CE4] hover:bg-[#0057B8] text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          See dates & book
                        </button>
                        <button
                          type="button"
                          onClick={() => onRemoveSaved(course.id)}
                          className="text-xs font-medium text-[#64748B] hover:text-[#B91C1C] transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : bookings.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-display text-base font-semibold text-[#0F172A]">
                No confirmed reservations yet
              </p>
              <p className="mt-1.5 text-sm text-[#64748B] max-w-xs mx-auto">
                Pick a course intake date to reserve a seat and apply your SkillsFuture Credit directly.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EEF1F6]">
              {bookings.map((booking) => {
                const creditUsed =
                  booking.openingCreditUsed + booking.midCareerCreditUsed;
                return (
                  <div key={booking.bookingRef} className="py-4 first:pt-0 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="font-mono-num font-medium text-[#003B73]">
                        {booking.bookingRef}
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-[#047857]">
                        <Check className="w-3.5 h-3.5" aria-hidden="true" />
                        Confirmed
                      </span>
                    </div>

                    <h3 className="font-display text-[15px] font-semibold text-[#0F172A] leading-snug">
                      {booking.courseTitle}
                    </h3>

                    <div className="text-xs text-[#475569] space-y-1 tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#64748B]" aria-hidden="true" />
                        <span>
                          {booking.intake.dateLabel} · {booking.intake.timeLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#64748B]" aria-hidden="true" />
                        <span>{booking.intake.venue}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between gap-3 text-xs">
                      <div className="text-[#475569] tabular-nums">
                        Cash payable:{' '}
                        <strong className="text-[#0F172A]">
                          S${booking.netPayable.toLocaleString()}
                        </strong>
                        {creditUsed > 0 && (
                          <span className="text-[#047857]">
                            {' '}
                            (S${creditUsed.toLocaleString()} Credit used)
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onCancelBooking(booking.bookingRef)}
                        className="inline-flex items-center gap-1 text-[#64748B] hover:text-[#B91C1C] font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
