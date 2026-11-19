import { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Heart,
  MapPin,
  X,
} from 'lucide-react';
import { calculateCourseFee, getRatingDescriptor, RESIDENCY_TIER_INFO } from '../data/courses';
import { BookingRecord, Course, CreditProfile, IntakeSession } from '../types/course';

interface CourseBookingDrawerProps {
  course: Course | null;
  creditProfile: CreditProfile;
  isSaved: boolean;
  onClose: () => void;
  onToggleSave: (courseId: string) => void;
  onOpenCreditProfile: () => void;
  onConfirmBooking: (booking: BookingRecord) => void;
  onOpenBookingsTab: () => void;
}

export function CourseBookingDrawer({
  course,
  creditProfile,
  isSaved,
  onClose,
  onToggleSave,
  onOpenCreditProfile,
  onConfirmBooking,
  onOpenBookingsTab,
}: CourseBookingDrawerProps) {
  const [selectedIntakeId, setSelectedIntakeId] = useState<string>('');
  const [applyCredit, setApplyCredit] = useState(true);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendeeEmail, setAttendeeEmail] = useState('');
  const [attendeePhone, setAttendeePhone] = useState('');
  const [formError, setFormError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (course) {
      setSelectedIntakeId(course.intakes[0]?.id ?? '');
      setApplyCredit(true);
      setFormError('');
      setConfirmedBooking(null);
      setImgError(false);
    }
  }, [course]);

  useEffect(() => {
    if (!course) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [course, onClose]);

  if (!course) return null;

  const selectedIntake: IntakeSession =
    course.intakes.find((i) => i.id === selectedIntakeId) ?? course.intakes[0];

  const fee = calculateCourseFee(course, creditProfile, applyCredit);
  const totalAvailableCredit =
    creditProfile.openingCreditBalance + creditProfile.midCareerCreditBalance;
  const tierInfo = RESIDENCY_TIER_INFO[creditProfile.tier];

  function handleFillSample() {
    setAttendeeName('Tan Wei Ming');
    setAttendeeEmail('weiming.tan@example.sg');
    setAttendeePhone('+65 9123 4567');
    setFormError('');
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!course) return;
    if (!attendeeName.trim() || !attendeeEmail.trim() || !attendeePhone.trim()) {
      setFormError('Please enter your full name, email address, and Singapore mobile number.');
      return;
    }

    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const record: BookingRecord = {
      bookingRef: `MSF-2026-${randomDigits}`,
      courseId: course.id,
      courseTitle: course.title,
      provider: course.provider,
      referenceCode: course.referenceCode,
      track: course.track,
      intake: selectedIntake,
      attendeeName: attendeeName.trim(),
      attendeeEmail: attendeeEmail.trim(),
      attendeePhone: attendeePhone.trim(),
      openingCreditUsed: fee.openingCreditUsed,
      midCareerCreditUsed: fee.midCareerCreditUsed,
      subsidyAmount: fee.subsidyAmount,
      netPayable: fee.outOfPocket,
      bookedAt: new Date().toLocaleDateString('en-SG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };

    onConfirmBooking(record);
    setConfirmedBooking(record);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="course-drawer-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Sticky Drawer Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-xs border-b border-[#E5E9F0] px-5 sm:px-7 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-[#64748B] font-mono-num truncate">
            <span className="font-sans font-semibold text-[#003B73]">
              {course.track === 'work' ? 'Work Skills' : 'Hobby Skills'}
            </span>
            <span aria-hidden="true">·</span>
            <span>{course.referenceCode}</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onToggleSave(course.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#334155] hover:bg-[#F7F8FA] border border-[#E5E9F0] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isSaved ? 'fill-[#DC2626] text-[#DC2626]' : 'text-[#475569]'
                }`}
              />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close course details"
              className="p-2 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-[#F7F8FA] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="px-5 sm:px-7 py-6 space-y-7 flex-1">
          {confirmedBooking ? (
            /* Confirmation Receipt State */
            <div className="py-4 space-y-6">
              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="w-7 h-7 text-[#047857] shrink-0 mt-0.5" />
                <div>
                  <h2
                    id="course-drawer-title"
                    className="font-display text-2xl font-bold text-[#0F172A]"
                  >
                    Seat Reserved — {confirmedBooking.bookingRef}
                  </h2>
                  <p className="mt-1.5 text-sm text-[#475569] leading-relaxed">
                    Your provisional registration with {confirmedBooking.provider} is confirmed. A confirmation copy has been prepared for{' '}
                    <span className="font-medium text-[#0F172A]">
                      {confirmedBooking.attendeeEmail}
                    </span>
                    .
                  </p>
                </div>
              </div>

              <div className="border-t border-b border-[#E5E9F0] py-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B]">Course</span>
                  <span className="font-medium text-[#0F172A] text-right">
                    {confirmedBooking.courseTitle}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B]">Course Code</span>
                  <span className="font-mono-num text-[#0F172A]">
                    {confirmedBooking.referenceCode}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B]">Selected Intake</span>
                  <span className="font-medium text-[#0F172A] text-right tabular-nums">
                    {confirmedBooking.intake.dateLabel} ({confirmedBooking.intake.timeLabel})
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B]">Location</span>
                  <span className="text-[#0F172A] text-right">
                    {confirmedBooking.intake.venue}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#64748B]">Attendee</span>
                  <span className="text-[#0F172A] text-right">
                    {confirmedBooking.attendeeName} · {confirmedBooking.attendeePhone}
                  </span>
                </div>
                {(confirmedBooking.openingCreditUsed + confirmedBooking.midCareerCreditUsed) > 0 && (
                  <div className="flex justify-between gap-4">
                    <span className="text-[#64748B]">SkillsFuture Credit Applied</span>
                    <span className="font-medium text-[#047857] tabular-nums">
                      −S$
                      {(
                        confirmedBooking.openingCreditUsed +
                        confirmedBooking.midCareerCreditUsed
                      ).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between gap-4 pt-3 border-t border-[#EEF1F6]">
                  <span className="font-semibold text-[#0F172A]">Net Cash Payable</span>
                  <span className="font-display text-lg font-bold text-[#0F172A] tabular-nums">
                    S${confirmedBooking.netPayable.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenBookingsTab();
                  }}
                  className="bg-[#006CE4] hover:bg-[#0057B8] text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  View My Bookings
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="border border-[#CBD5E1] hover:bg-[#F7F8FA] text-[#0F172A] text-sm font-medium px-5 py-2.5 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Continue Browsing
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Hero Photo + Heading */}
              <div>
                <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#EEF2F6]">
                  {!imgError ? (
                    <img
                      src={course.imageUrl}
                      alt={course.imageAlt}
                      referrerPolicy="no-referrer"
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#475569]">
                      <BookOpen className="w-8 h-8 text-[#003B73] mb-2" />
                      <span className="text-sm font-medium">{course.subCategory}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2 text-xs text-[#64748B]">
                  <span className="font-semibold text-[#003B73]">{course.provider}</span>
                  <span aria-hidden="true">·</span>
                  <span>{course.subCategory}</span>
                </div>

                <h2
                  id="course-drawer-title"
                  className="mt-1.5 font-display text-2xl font-bold text-[#0F172A] leading-tight text-balance"
                >
                  {course.title}
                </h2>
                <p className="mt-2.5 text-[15px] text-[#475569] leading-relaxed">
                  {course.summary}
                </p>

                {/* Clean 4-column Key Facts Strip */}
                <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-[#E5E9F0]">
                  <div>
                    <div className="text-xs text-[#64748B]">Duration</div>
                    <div className="mt-1 text-sm font-semibold text-[#0F172A] tabular-nums">
                      {course.durationLabel}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#64748B]">Schedule</div>
                    <div className="mt-1 text-sm font-semibold text-[#0F172A]">
                      {course.scheduleLabel}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#64748B]">Format</div>
                    <div className="mt-1 text-sm font-semibold text-[#0F172A]">
                      {course.mode}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#64748B]">Credential</div>
                    <div className="mt-1 text-sm font-semibold text-[#0F172A]">
                      {course.wsqCertified ? 'WSQ Certified' : 'SSG Approved'}
                    </div>
                  </div>
                </div>
              </div>

              {/* What You'll Learn + TRAQOM Learner Quality */}
              <div className="grid grid-cols-1 sm:grid-cols-[1.35fr_1fr] gap-6">
                <div>
                  <h3 className="font-display text-sm font-semibold text-[#0F172A]">
                    What you will learn
                  </h3>
                  <ul className="mt-3 space-y-2.5">
                    {course.outcomes.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 text-sm text-[#334155] leading-snug">
                        <Check
                          className="w-4 h-4 text-[#047857] shrink-0 mt-0.5"
                          aria-hidden="true"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* TRAQOM Verified Satisfaction Breakdown */}
                <div className="sm:border-l sm:border-[#EEF1F6] sm:pl-6">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-display text-sm font-semibold text-[#0F172A]">
                        TRAQOM Rating
                      </h3>
                      <p className="text-xs text-[#64748B] tabular-nums">
                        {getRatingDescriptor(course.traqom.overall)} · {course.traqom.reviewCount}{' '}
                        learners
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-md rounded-bl-none bg-[#003B73] text-white font-display font-bold text-sm flex items-center justify-center tabular-nums">
                      {course.traqom.overall.toFixed(1)}
                    </div>
                  </div>

                  <div className="mt-4 space-y-3">
                    {[
                      { label: 'Trainer Quality', val: course.traqom.trainerQuality },
                      { label: 'Course Content', val: course.traqom.courseContent },
                      { label: 'Practical Value', val: course.traqom.practicalValue },
                    ].map((metric) => (
                      <div key={metric.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#475569]">{metric.label}</span>
                          <span className="font-semibold text-[#0F172A] tabular-nums">
                            {metric.val.toFixed(1)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-[#EEF1F6] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#003B73] rounded-full"
                            style={{ width: `${(metric.val / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 1: Select an Intake Session */}
              <div className="pt-2 border-t border-[#E5E9F0]">
                <h3 className="font-display text-base font-semibold text-[#0F172A]">
                  1. Choose an intake session
                </h3>
                <div className="mt-3 space-y-2.5">
                  {course.intakes.map((intake) => {
                    const isSelected = intake.id === selectedIntake.id;
                    return (
                      <label
                        key={intake.id}
                        className={`block rounded-xl border p-4 cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-[#006CE4] bg-[#F5F9FF]'
                            : 'border-[#E5E9F0] hover:border-[#CBD5E1] bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <input
                              type="radio"
                              name="intake-session"
                              checked={isSelected}
                              onChange={() => setSelectedIntakeId(intake.id)}
                              className="mt-1 w-4 h-4 accent-[#006CE4] cursor-pointer"
                            />
                            <div>
                              <div className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-[#0F172A] tabular-nums">
                                <Calendar className="w-4 h-4 text-[#003B73]" aria-hidden="true" />
                                <span>{intake.dateLabel}</span>
                                <span className="text-[#94A3B8]" aria-hidden="true">·</span>
                                <span className="font-normal text-[#475569]">{intake.daysLabel}</span>
                              </div>
                              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#475569] tabular-nums">
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-[#64748B]" aria-hidden="true" />
                                  {intake.timeLabel}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <MapPin className="w-3.5 h-3.5 text-[#64748B]" aria-hidden="true" />
                                  {intake.venue} ({intake.mrtNearby})
                                </span>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs font-medium text-[#047857] whitespace-nowrap shrink-0 tabular-nums">
                            {intake.seatsLeft} seats left
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Transparent Fee & SkillsFuture Credit Breakdown */}
              <div className="pt-2 border-t border-[#E5E9F0]">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-base font-semibold text-[#0F172A]">
                    2. Fee breakdown ({tierInfo.shortLabel})
                  </h3>
                  <button
                    type="button"
                    onClick={onOpenCreditProfile}
                    className="text-xs font-medium text-[#006CE4] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Change residency / age tier
                  </button>
                </div>

                <div className="mt-3 bg-[#F7F8FA] rounded-xl p-4 sm:p-5 space-y-2.5 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-[#475569]">Published full course fee (incl. GST)</span>
                    <span className="font-medium text-[#0F172A] tabular-nums">
                      S${fee.fullFee.toLocaleString()}
                    </span>
                  </div>

                  {fee.subsidyAmount > 0 && (
                    <div className="flex justify-between gap-4">
                      <span className="text-[#475569]">
                        SSG Course Fee Subsidy ({Math.round(fee.subsidyRate * 100)}%)
                      </span>
                      <span className="font-medium text-[#047857] tabular-nums">
                        −S${fee.subsidyAmount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {course.skillsFutureCreditEligible && totalAvailableCredit > 0 && (
                    <div className="pt-2 border-t border-[#E5E9F0] flex items-center justify-between gap-4">
                      <label className="flex items-center gap-2.5 text-sm text-[#0F172A] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={applyCredit}
                          onChange={(e) => setApplyCredit(e.target.checked)}
                          className="w-4 h-4 rounded accent-[#006CE4] cursor-pointer"
                        />
                        <span>
                          Apply {fee.creditApplied > 0 ? fee.creditSourceLabel : 'SkillsFuture Credit'}
                        </span>
                      </label>
                      <span className="font-medium text-[#047857] tabular-nums">
                        {applyCredit && fee.creditApplied > 0
                          ? `−S$${fee.creditApplied.toLocaleString()}`
                          : 'S$0'}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#CBD5E1] flex items-baseline justify-between gap-4">
                    <div>
                      <div className="font-display font-semibold text-[#0F172A]">
                        Estimated out-of-pocket cash
                      </div>
                      <div className="text-xs text-[#64748B]">
                        {fee.isFullyCovered
                          ? 'No upfront cash needed — fully offset by SkillsFuture funding'
                          : 'Payable directly to training provider upon confirmation'}
                      </div>
                    </div>
                    <div className="font-display text-2xl font-bold text-[#0F172A] tabular-nums">
                      S${fee.outOfPocket.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Streamlined Booking Form */}
              <form onSubmit={handleSubmit} className="pt-2 border-t border-[#E5E9F0] space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-display text-base font-semibold text-[#0F172A]">
                    3. Learner details
                  </h3>
                  <button
                    type="button"
                    onClick={handleFillSample}
                    className="text-xs font-medium text-[#006CE4] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Fill sample details
                  </button>
                </div>

                {formError && (
                  <p className="text-xs font-medium text-[#B91C1C]" role="alert">
                    {formError}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="booking-name"
                      className="block text-xs font-medium text-[#334155] mb-1.5"
                    >
                      Full Name (as per NRIC / FIN)
                    </label>
                    <input
                      id="booking-name"
                      type="text"
                      value={attendeeName}
                      onChange={(e) => setAttendeeName(e.target.value)}
                      placeholder="e.g. Tan Wei Ming"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] placeholder:text-[#94A3B8]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="booking-email"
                      className="block text-xs font-medium text-[#334155] mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="booking-email"
                      type="email"
                      value={attendeeEmail}
                      onChange={(e) => setAttendeeEmail(e.target.value)}
                      placeholder="you@example.sg"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] placeholder:text-[#94A3B8]"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="booking-phone"
                      className="block text-xs font-medium text-[#334155] mb-1.5"
                    >
                      Mobile Number (SG)
                    </label>
                    <input
                      id="booking-phone"
                      type="tel"
                      value={attendeePhone}
                      onChange={(e) => setAttendeePhone(e.target.value)}
                      placeholder="+65 9123 4567"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#CBD5E1] rounded-lg text-[#0F172A] placeholder:text-[#94A3B8]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs text-[#64748B]">
                    Free cancellation up to 7 days before {selectedIntake.dateLabel}.
                  </p>
                  <button
                    type="submit"
                    className="bg-[#006CE4] hover:bg-[#0057B8] text-white font-display font-semibold text-sm px-6 py-3 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Confirm Seat · S${fee.outOfPocket.toLocaleString()}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
