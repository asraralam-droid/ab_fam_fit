import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { GraduationCap, Check, Loader2, Lock } from 'lucide-react';
import { membershipSlice } from '../../store/membershipSlice';
import { programsSlice } from '../../store/programsSlice';
import type { RootState } from '../../store';
import {
  BOOK_PACKAGE_EXCLUDED,
  BOOK_PACKAGE_FEATURES,
  BOOK_PACKAGE_PRICE,
  BOOK_PACKAGE_PROGRAM_ID,
  BOOK_PACKAGE_TITLE
} from '../../utils/membershipAccess';
import type { UserRole } from '../../store/slices';

function roleDisplayLabel(role: UserRole | undefined): string {
  if (role === 'admin') return 'Admin';
  if (role === 'staff') return 'Staff';
  if (role === 'end-user') return 'Member';
  return 'Member';
}

export function Checkout() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const roleLabel = roleDisplayLabel(user?.role);
  const isInternalRole = user?.role === 'admin' || user?.role === 'staff';

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      if (isInternalRole) {
        dispatch(membershipSlice.actions.setMembershipTier('coaching'));
        dispatch(
          programsSlice.actions.purchaseProgram({
            programId: BOOK_PACKAGE_PROGRAM_ID,
            amountUsd: 0
          })
        );
      } else {
        dispatch(membershipSlice.actions.purchaseBookPackage());
        dispatch(
          programsSlice.actions.purchaseProgram({
            programId: BOOK_PACKAGE_PROGRAM_ID,
            amountUsd: BOOK_PACKAGE_PRICE
          })
        );
      }
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        navigate('/onboarding');
      }, 1200);
    }, 1200);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col h-full bg-primary items-center justify-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-primary" />
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold text-white text-center mb-2">
          {isInternalRole ? 'Access Granted' : 'Program Unlocked!'}
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-accent-lavender text-center">
          {isInternalRole
            ? `Continuing as ${roleLabel}. Full program access — sections unlock by progress.`
            : 'Full program access — sections unlock by progress, not extra fees.'}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-surface overflow-y-auto pb-8">
      <div className="bg-primary pt-12 pb-20 px-6 rounded-b-[40px]">
        <p className="text-accent-lavender text-xs font-bold uppercase tracking-wider mb-2">
          Program-level payment
        </p>
        <h1 className="text-3xl font-bold text-white mb-2">
          {BOOK_PACKAGE_TITLE}
        </h1>
        <p className="text-accent-lavender">
          Pay once at the Program level. No per-module charges.
        </p>
      </div>

      <div className="px-6 -mt-12">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-surface rounded-3xl shadow-xl border border-border p-6">
          <div className="flex items-center gap-3 mb-6 border-b border-border pb-6">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-end gap-2">
                <span className="text-5xl font-bold text-text">
                  ${BOOK_PACKAGE_PRICE}
                </span>
                <span className="text-text-muted mb-1">one-time</span>
              </div>
              <p className="text-xs text-text-muted mt-1">
                Unlocks entire program · all modules included
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-accent-sage/10 border border-accent-sage/25 p-3 mb-6">
            <p className="text-xs text-text leading-relaxed">
              <span className="font-bold">Demo payment rule:</span> you are charged
              for the <span className="font-bold">Program</span>, not Module 1 /
              2 / 3 individually. Later modules open by time or completion only.
            </p>
          </div>

          <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
            Included with program purchase
          </p>
          <ul className="space-y-3 mb-6">
            {BOOK_PACKAGE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-accent-sage/20 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-accent-sage" />
                </div>
                <span className="text-text text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <p className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3">
            Not included — upgrade later
          </p>
          <ul className="space-y-3 mb-8">
            {BOOK_PACKAGE_EXCLUDED.map((feature) => (
              <li key={feature} className="flex items-start gap-3 opacity-70">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-surface-2 flex items-center justify-center flex-shrink-0">
                  <Lock className="w-3 h-3 text-text-muted" />
                </div>
                <span className="text-text text-sm">{feature}</span>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full h-14 bg-primary text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/30 hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center">
            {isProcessing ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isInternalRole ? (
              `Continue as ${roleLabel}`
            ) : (
              `Pay $${BOOK_PACKAGE_PRICE} · Continue as ${roleLabel}`
            )}
          </button>
          <p className="text-center text-xs text-text-muted mt-4">
            {isInternalRole
              ? `Demo checkout — ${roleLabel} skips the card charge. Coaching upgrades stay separate.`
              : 'Demo checkout — no real card charge. Coaching upgrades stay separate.'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
