import { useState } from 'react';
import { BookOpen, Check, ChevronRight, Heart } from 'lucide-react';
import { calculateCourseFee, getRatingDescriptor } from '../data/courses';
import { Course, CreditProfile } from '../types/course';

interface CourseCardProps {
  course: Course;
  creditProfile: CreditProfile;
  isSaved: boolean;
  isBooked: boolean;
  onToggleSave: (courseId: string) => void;
  onOpenCourse: (course: Course) => void;
}

export function CourseCard({
  course,
  creditProfile,
  isSaved,
  isBooked,
  onToggleSave,
  onOpenCourse,
}: CourseCardProps) {
  const [imgError, setImgError] = useState(false);
  const fee = calculateCourseFee(course, creditProfile, true);
  const nextIntake = course.intakes[0];
  const ratingWord = getRatingDescriptor(course.traqom.overall);

  return (
    <article className="group bg-white border border-[#E5E9F0] rounded-xl p-4 sm:p-5 transition-all duration-200 hover:border-[#C2D1E5] hover:shadow-[0_8px_24px_-12px_rgba(0,59,115,0.16)]">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
        {/* Left: Fixed 4:3 editorial course photography with fallback */}
        <div className="relative w-full sm:w-[232px] aspect-[4/3] shrink-0 rounded-lg overflow-hidden bg-[#EEF2F6]">
          <button
            type="button"
            onClick={() => onOpenCourse(course)}
            className="block w-full h-full text-left cursor-pointer"
            aria-label={`View details for ${course.title}`}
          >
            {!imgError ? (
              <img
                src={course.imageUrl}
                alt={course.imageAlt}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#E2E8F0] to-[#F1F5F9] text-[#475569]">
                <BookOpen className="w-7 h-7 mb-2 text-[#003B73]" aria-hidden="true" />
                <span className="text-xs font-medium text-center line-clamp-2">
                  {course.subCategory}
                </span>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(course.id);
            }}
            aria-label={isSaved ? `Remove ${course.title} from saved` : `Save ${course.title}`}
            aria-pressed={isSaved}
            className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-[#0F172A] flex items-center justify-center shadow-sm transition-colors cursor-pointer"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isSaved ? 'fill-[#DC2626] text-[#DC2626]' : 'text-[#334155]'
              }`}
            />
          </button>
        </div>

        {/* Center: Unboxed metadata, clean title, clear duration & schedule */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Quiet unboxed metadata line — zero pills */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#64748B]">
              <span className="font-semibold text-[#003B73]">
                {course.track === 'work' ? 'Work Skills' : 'Hobby Skills'}
              </span>
              <span aria-hidden="true">·</span>
              <span>{course.subCategory}</span>
              <span aria-hidden="true">·</span>
              <span className="truncate">{course.provider}</span>
            </div>

            {/* Course Title */}
            <h3 className="mt-1.5 font-display text-[17px] sm:text-[18px] font-semibold leading-snug text-[#0F172A]">
              <button
                type="button"
                onClick={() => onOpenCourse(course)}
                className="text-left hover:text-[#006CE4] transition-colors cursor-pointer"
              >
                {course.title}
              </button>
            </h3>

            {/* Primary Logistics Line: Duration · Schedule · MRT/Area · Mode */}
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-[#334155] tabular-nums">
              <span>{course.durationLabel}</span>
              <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
              <span>{course.scheduleLabel}</span>
              <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
              <span>{course.areaLabel}</span>
              <span className="text-[#CBD5E1]" aria-hidden="true">·</span>
              <span className="text-[#64748B] font-normal">{course.mode}</span>
            </div>

            {/* Plain-English description */}
            <p className="mt-2.5 text-[14px] text-[#475569] leading-relaxed line-clamp-2">
              {course.summary}
            </p>
          </div>

          {/* Bottom Availability & Accreditation text */}
          <div className="mt-3.5 pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#64748B] tabular-nums">
            <span className="font-medium text-[#0F172A]">
              Next intake: {nextIntake.dateLabel}
            </span>
            <span aria-hidden="true">·</span>
            <span>{nextIntake.seatsLeft} seats available</span>
            <span aria-hidden="true">·</span>
            <span>{course.certificationLabel}</span>
            {isBooked && (
              <>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1 font-semibold text-[#047857]">
                  <Check className="w-3.5 h-3.5" aria-hidden="true" />
                  Seat booked
                </span>
              </>
            )}
          </div>
        </div>

        {/* Right: Booking-style TRAQOM score + transparent net out-of-pocket price */}
        <div className="sm:w-[196px] shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-[#EEF1F6] sm:pl-5 flex flex-row sm:flex-col justify-between items-end gap-4">
          {/* TRAQOM Review Score */}
          <div className="flex items-center gap-2.5 sm:self-end">
            <div className="text-left sm:text-right">
              <div className="text-[13px] font-semibold text-[#0F172A] leading-tight">
                {ratingWord}
              </div>
              <div className="text-xs text-[#64748B] tabular-nums">
                {course.traqom.reviewCount} reviews
              </div>
            </div>
            <div
              className="w-9 h-9 rounded-md rounded-bl-none bg-[#003B73] text-white font-display font-bold text-sm flex items-center justify-center tabular-nums shrink-0"
              title="MySkillsFuture TRAQOM learner satisfaction score out of 10"
            >
              {course.traqom.overall.toFixed(1)}
            </div>
          </div>

          {/* Transparent Out-of-Pocket Fee Stack + Primary Action */}
          <div className="text-right w-auto sm:w-full">
            {fee.outOfPocket < fee.fullFee && (
              <div className="text-xs text-[#64748B] line-through tabular-nums">
                Full fee S${fee.fullFee.toLocaleString()}
              </div>
            )}
            <div className="font-display text-2xl font-bold text-[#0F172A] leading-tight tabular-nums mt-0.5">
              S${fee.outOfPocket.toLocaleString()}
            </div>
            <div className="mt-1 text-xs leading-snug">
              {fee.isFullyCovered ? (
                <span className="inline-flex items-center justify-end gap-1 font-medium text-[#047857]">
                  <Check className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                  <span>Covered by Credit</span>
                </span>
              ) : fee.creditApplied > 0 ? (
                <span className="text-[#047857] font-medium tabular-nums">
                  After S${fee.creditApplied.toLocaleString()} Credit
                </span>
              ) : fee.subsidyAmount > 0 ? (
                <span className="text-[#475569] tabular-nums">
                  After {Math.round(fee.subsidyRate * 100)}% SSG Subsidy
                </span>
              ) : (
                <span className="text-[#64748B]">Full course fee</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => onOpenCourse(course)}
              className="mt-3 w-full inline-flex items-center justify-center gap-1.5 bg-[#006CE4] hover:bg-[#0057B8] text-white text-sm font-medium py-2.5 px-4 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>See dates</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
