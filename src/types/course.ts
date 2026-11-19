export type SkillTrack = 'all' | 'work' | 'hobby';

export type CourseTrack = 'work' | 'hobby';

export type DurationBucket =
  | 'any'
  | 'half-day'
  | '1-2-days'
  | '3-5-days'
  | 'multi-week';

export type ScheduleFilter =
  | 'any'
  | 'weekends'
  | 'evenings'
  | 'daytime'
  | 'online';

export type LearningMode = 'In-Person' | 'Live Online' | 'Hybrid';

export type BudgetFilter = 'any' | 'zero-cash' | 'under-100' | 'under-300';

export type SortOption =
  | 'recommended'
  | 'lowest-fee'
  | 'soonest'
  | 'shortest';

export type ResidencyTier =
  | 'sc-25-39'
  | 'sc-40-plus'
  | 'pr'
  | 'standard';

export interface IntakeSession {
  id: string;
  startDateIso: string;
  dateLabel: string;
  daysLabel: string;
  timeLabel: string;
  venue: string;
  mrtNearby: string;
  seatsLeft: number;
}

export interface TraqomMetrics {
  overall: number;
  reviewCount: number;
  trainerQuality: number;
  courseContent: number;
  practicalValue: number;
}

export interface Course {
  id: string;
  referenceCode: string;
  title: string;
  track: CourseTrack;
  subCategory: string;
  provider: string;
  summary: string;
  outcomes: string[];
  imageUrl: string;
  imageAlt: string;
  durationBucket: Exclude<DurationBucket, 'any'>;
  durationLabel: string;
  totalHours: number;
  mode: LearningMode;
  scheduleTags: Exclude<ScheduleFilter, 'any'>[];
  scheduleLabel: string;
  areaLabel: string;
  fullFee: number;
  ssgSubsidised: boolean;
  skillsFutureCreditEligible: boolean;
  midCareerTopUpEligible: boolean;
  wsqCertified: boolean;
  certificationLabel: string;
  traqom: TraqomMetrics;
  intakes: IntakeSession[];
}

export interface CreditProfile {
  tier: ResidencyTier;
  openingCreditBalance: number;
  midCareerCreditBalance: number;
}

export interface FeeBreakdown {
  fullFee: number;
  subsidyRate: number;
  subsidyAmount: number;
  feeAfterSubsidy: number;
  creditApplied: number;
  creditSourceLabel: string;
  outOfPocket: number;
  isFullyCovered: boolean;
}

export interface FilterState {
  track: SkillTrack;
  subCategory: string;
  query: string;
  duration: DurationBucket;
  durationMulti: Exclude<DurationBucket, 'any'>[];
  schedule: ScheduleFilter;
  modeFilters: LearningMode[];
  budget: BudgetFilter;
  onlyCreditEligible: boolean;
  onlyMidCareer: boolean;
  onlyWsq: boolean;
  sortBy: SortOption;
}

export interface BookingRecord {
  bookingRef: string;
  courseId: string;
  courseTitle: string;
  provider: string;
  referenceCode: string;
  track: CourseTrack;
  intake: IntakeSession;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  openingCreditUsed: number;
  midCareerCreditUsed: number;
  subsidyAmount: number;
  netPayable: number;
  bookedAt: string;
}
