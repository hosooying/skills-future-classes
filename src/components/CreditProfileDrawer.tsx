import { useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { calculateCourseFee, COURSES, RESIDENCY_TIER_INFO } from '../data/courses';
import { CreditProfile, ResidencyTier } from '../types/course';

interface CreditProfileDrawerProps {
  isOpen: boolean;
  creditProfile: CreditProfile;
  onClose: () => void;
  onChangeProfile: (profile: CreditProfile) => void;
}

const TIERS: ResidencyTier[] = ['sc-25-39', 'sc-40-plus', 'pr', 'standard'];

export function CreditProfileDrawer({
  isOpen,
  creditProfile,
  onClose,
  onChangeProfile,
}: CreditProfileDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const zeroCashCount = COURSES.filter(
    (c) => calculateCourseFee(c, creditProfile, true).outOfPocket === 0
  ).length;

  function handleSelectTier(tier: ResidencyTier) {
    const defaults = RESIDENCY_TIER_INFO[tier];
    onChangeProfile({
      tier,
      openingCreditBalance: defaults.defaultOpeningCredit,
      midCareerCreditBalance: defaults.defaultMidCareerCredit,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#0F172A]/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credit-drawer-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white h-full overflow-y-auto shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E5E9F0] flex items-center justify-between gap-4">
          <h2
            id="credit-drawer-title"
            className="font-display text-lg font-bold text-[#0F172A]"
          >
            SkillsFuture Fee Estimator
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close fee estimator"
            className="p-2 rounded-lg text-[#475569] hover:text-[#0F172A] hover:bg-[#F7F8FA] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 flex-1">
          <p className="text-sm text-[#475569] leading-relaxed">
            Select your Singapore residency and age tier once. Every course card will automatically display your real out-of-pocket cash fee.
          </p>

          {/* Residency & Age Tier */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold text-[#0F172A]">
              Residency & Age Tier
            </div>
            {TIERS.map((tier) => {
              const info = RESIDENCY_TIER_INFO[tier];
              const isSelected = creditProfile.tier === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => handleSelectTier(tier)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#006CE4] bg-[#F5F9FF]'
                      : 'border-[#E5E9F0] hover:border-[#CBD5E1] bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-[#0F172A]">
                        {info.title}
                      </div>
                      <div className="mt-1 text-xs text-[#64748B] leading-relaxed">
                        {info.subtitle}
                      </div>
                    </div>
                    {isSelected && (
                      <Check
                        className="w-4 h-4 text-[#006CE4] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Adjustable SkillsFuture Credit Balances */}
          {(creditProfile.tier === 'sc-25-39' ||
            creditProfile.tier === 'sc-40-plus') && (
            <div className="pt-4 border-t border-[#E5E9F0] space-y-5">
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <label
                    htmlFor="opening-credit-slider"
                    className="font-medium text-[#0F172A]"
                  >
                    Opening SkillsFuture Credit
                  </label>
                  <span className="font-mono-num font-semibold text-[#003B73]">
                    S${creditProfile.openingCreditBalance.toLocaleString()}
                  </span>
                </div>
                <input
                  id="opening-credit-slider"
                  type="range"
                  min={0}
                  max={1000}
                  step={50}
                  value={creditProfile.openingCreditBalance}
                  onChange={(e) =>
                    onChangeProfile({
                      ...creditProfile,
                      openingCreditBalance: Number(e.target.value),
                    })
                  }
                  className="w-full accent-[#006CE4] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#64748B] tabular-nums mt-1">
                  <span>S$0</span>
                  <span>S$500 standard</span>
                  <span>S$1,000</span>
                </div>
              </div>

              {creditProfile.tier === 'sc-40-plus' && (
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <label
                      htmlFor="midcareer-credit-slider"
                      className="font-medium text-[#0F172A]"
                    >
                      Mid-Career Credit (Age 40+)
                    </label>
                    <span className="font-mono-num font-semibold text-[#003B73]">
                      S${creditProfile.midCareerCreditBalance.toLocaleString()}
                    </span>
                  </div>
                  <input
                    id="midcareer-credit-slider"
                    type="range"
                    min={0}
                    max={4000}
                    step={250}
                    value={creditProfile.midCareerCreditBalance}
                    onChange={(e) =>
                      onChangeProfile({
                        ...creditProfile,
                        midCareerCreditBalance: Number(e.target.value),
                      })
                    }
                    className="w-full accent-[#006CE4] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#64748B] tabular-nums mt-1">
                    <span>S$0</span>
                    <span>S$2,000</span>
                    <span>S$4,000 top-up</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Impact Summary */}
          <div className="bg-[#F7F8FA] rounded-xl p-4 border border-[#E5E9F0]">
            <div className="text-xs font-medium text-[#64748B]">
              Catalog impact
            </div>
            <div className="mt-1 font-display text-lg font-bold text-[#0F172A] tabular-nums">
              {zeroCashCount} of {COURSES.length} courses are S$0 cash
            </div>
            <p className="mt-1 text-xs text-[#475569] leading-relaxed">
              Work Skills courses apply both SSG subsidies and eligible Credits; Hobby Skills courses offset directly with your Opening Credit.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#E5E9F0]">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#006CE4] hover:bg-[#0057B8] text-white text-sm font-semibold py-3 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Apply to Course Prices
          </button>
        </div>
      </div>
    </div>
  );
}
