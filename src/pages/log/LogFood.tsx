import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { mealsSlice, homeSlice, notificationsSlice } from '../../store/slices';
import { communitySlice } from '../../store/communitySlice';
import type { RootState } from '../../store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Camera,
  X,
  Check,
  AlertTriangle,
  ShieldAlert
} from 'lucide-react';
import { toast } from 'sonner';
import { checkMealAgainstProtocol } from '../../utils/protocolAlerts';
import { CenteredModal } from '../../components/modals';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Juice'] as const;
type MealType = (typeof MEAL_TYPES)[number];
const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80'
];

export function LogFood() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { groups } = useSelector((state: RootState) => state.community);
  const today = new Date().toISOString().split('T')[0];
  const [mealType, setMealType] = useState<MealType>('Snack');
  const [photo, setPhoto] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [mealDate, setMealDate] = useState(today);
  const [success, setSuccess] = useState(false);
  const [showProtocolConfirm, setShowProtocolConfirm] = useState(false);

  const protocolCheck = useMemo(
    () => checkMealAgainstProtocol(description, mealType),
    [description, mealType]
  );

  const canSubmit = !!photo && description.trim().length > 0;

  const handleAddPhoto = () => {
    const next = DEMO_IMAGES[Math.floor(Math.random() * DEMO_IMAGES.length)];
    setPhoto(next);
  };

  const saveMeal = () => {
    const mealId = Date.now().toString();
    const desc = description.trim();
    const check = checkMealAgainstProtocol(desc, mealType);

    dispatch(
      mealsSlice.actions.logMeal({
        id: mealId,
        type: mealType,
        description: desc,
        date: mealDate,
        time: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        image: photo || undefined,
        protocolFlags: check.flagged
          ? check.matches.map((m) => m.label)
          : undefined,
        protocolSeverity: check.flagged ? check.severity : undefined
      })
    );
    dispatch(homeSlice.actions.incrementStreak());

    if (check.flagged) {
      dispatch(
        notificationsSlice.actions.addNotifications([
          {
            id: `protocol-${mealId}`,
            message: check.bestieMessage,
            time: 'Just now',
            read: false,
            type: 'protocol',
            link: '/bestie'
          }
        ])
      );
    }

    const healthGroup =
      groups.find((g) => g.id === 'g-health' && g.joined) ||
      groups.find((g) => g.pillarId === 'health-wellness' && g.joined) ||
      groups.find((g) => g.joined);
    if (healthGroup) {
      dispatch(
        communitySlice.actions.addPost({
          id: `meal-${mealId}`,
          author: user?.name || 'Member',
          avatarColor: 'sage',
          group: healthGroup.id,
          content: check.flagged
            ? `Logged ${mealType.toLowerCase()}: ${desc} (protocol note)`
            : `Logged ${mealType.toLowerCase()}: ${desc}`,
          image: photo || undefined,
          likes: 0,
          liked: false,
          shares: 0,
          time: 'Just now',
          comments: []
        })
      );
    }

    setShowProtocolConfirm(false);
    setSuccess(true);
    setTimeout(() => {
      if (check.flagged) {
        toast.warning(check.summary, {
          description: 'Bestie flagged a protocol note — check Notifications.',
          duration: 4500
        });
      } else {
        toast.success(
          healthGroup
            ? 'Meal saved to profile & community feed'
            : 'Meal logged to your profile'
        );
      }
      navigate('/home');
    }, 1400);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const check = checkMealAgainstProtocol(description, mealType);
    if (check.flagged) {
      setShowProtocolConfirm(true);
      return;
    }
    saveMeal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col max-w-[420px] mx-auto">
      {/* Header */}
      <div className="h-14 px-3 flex items-center gap-2 bg-surface border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center rounded-full text-text hover:bg-surface-2 transition-colors"
          aria-label="Back">
          <ChevronLeft className="w-6 h-6" strokeWidth={1.75} />
        </button>
        <h1 className="text-lg font-bold text-text">Log Food</h1>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-5 pb-32 flex flex-col gap-5">
        {/* Meal-type pills */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-1 px-1">
          {MEAL_TYPES.map((t) => {
            const active = mealType === t;
            return (
              <button
                key={t}
                onClick={() => setMealType(t)}
                className={`px-4 h-9 rounded-full text-sm font-semibold whitespace-nowrap border transition-all ${active ? 'bg-primary text-white border-primary shadow-sm' : 'bg-surface text-text border-border hover:border-primary/40'}`}>
                {t}
              </button>
            );
          })}
        </div>

        {/* Photo */}
        <div>
          <label className="text-sm font-bold text-text mb-2 block">
            Photo{' '}
            <span className="text-text-muted font-medium">(Required)</span>
          </label>
          <button
            onClick={handleAddPhoto}
            className="w-full aspect-[4/3] rounded-2xl border-2 border-dashed border-border bg-surface-2 hover:bg-surface-2/70 hover:border-primary/40 transition-all flex flex-col items-center justify-center gap-3 relative overflow-hidden group">
            {photo ? (
              <>
                <img
                  src={photo}
                  alt="Meal"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                <span className="relative z-10 text-white text-xs font-bold uppercase tracking-wider bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  Replace photo
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPhoto(null);
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 transition-colors z-10"
                  aria-label="Remove photo">
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-surface flex items-center justify-center border border-border">
                  <Camera
                    className="w-6 h-6 text-text-muted"
                    strokeWidth={1.75}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-text">
                    Tap to add photo
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    Take a picture of your meal
                  </p>
                </div>
              </>
            )}
          </button>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm font-bold text-text mb-2 block">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you have? e.g. green juice, salad, smoothie…"
            rows={4}
            className={`w-full p-3.5 rounded-2xl bg-surface border outline-none transition-all resize-none text-sm text-text placeholder:text-text-muted/70 ${
              protocolCheck.flagged
                ? protocolCheck.severity === 'alert'
                  ? 'border-orange-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-400'
                  : 'border-amber-400 focus:border-amber-500 focus:ring-1 focus:ring-amber-400'
                : 'border-border focus:border-primary focus:ring-1 focus:ring-primary'
            }`}
          />

          {protocolCheck.flagged && (
            <div
              className={`mt-3 rounded-2xl border p-3.5 ${
                protocolCheck.severity === 'alert'
                  ? 'bg-orange-500/10 border-orange-400/40'
                  : 'bg-amber-500/10 border-amber-400/40'
              }`}>
              <div className="flex gap-2.5 items-start">
                {protocolCheck.severity === 'alert' ? (
                  <ShieldAlert className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-bold text-text">
                    {protocolCheck.severity === 'alert'
                      ? 'Protocol alert'
                      : 'Protocol note'}
                  </p>
                  <p className="text-xs text-text-muted mt-1 leading-relaxed">
                    Detected: {protocolCheck.matches.map((m) => m.label).join(', ')}{' '}
                    ({protocolCheck.matchedKeywords.join(', ')}).{' '}
                    {protocolCheck.matches[0]?.tip}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Date */}
        <div>
          <label
            htmlFor="meal-date"
            className="text-sm font-bold text-text mb-2 block">
            Date
          </label>
          <input
            id="meal-date"
            type="date"
            value={mealDate}
            onChange={(e) => setMealDate(e.target.value)}
            className="w-full h-12 px-3.5 rounded-2xl bg-surface border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm text-text"
          />
        </div>
      </div>

      {/* Footer CTA */}
      <div className="absolute bottom-0 left-0 right-0 px-5 pb-6 pt-3 bg-background/95 backdrop-blur border-t border-border">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`w-full h-14 rounded-2xl font-bold text-base transition-all active:scale-[0.98] ${canSubmit ? 'bg-primary text-white shadow-md shadow-primary/20 hover:bg-primary-hover' : 'bg-surface-2 text-text-muted cursor-not-allowed'}`}>
          {protocolCheck.flagged ? 'Review & save meal' : 'Save meal'}
        </button>
      </div>

      <CenteredModal
        open={showProtocolConfirm}
        onClose={() => setShowProtocolConfirm(false)}
        title="Protocol check">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-orange-500/15 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-text leading-relaxed">
                {protocolCheck.bestieMessage}
              </p>
              <p className="text-xs text-text-muted mt-2">
                Demo note: this uses text keywords (not photo AI). You can still
                log and get back on track.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowProtocolConfirm(false)}
              className="flex-1 h-11 rounded-xl border border-border text-sm font-bold text-text bg-surface-2">
              Edit meal
            </button>
            <button
              type="button"
              onClick={saveMeal}
              className="flex-1 h-11 rounded-xl bg-primary text-white text-sm font-bold">
              Log anyway
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setShowProtocolConfirm(false);
              navigate('/bestie', {
                state: {
                  seedMessage: protocolCheck.matches.length
                    ? `I may have logged ${protocolCheck.matches
                        .map((m) => m.label)
                        .join(', ')}. Can you help me pick a clean swap?`
                    : 'Can you help me pick a clean food swap for my last meal?',
                  notificationId: 'protocol-swap'
                }
              });
            }}
            className="w-full h-11 rounded-xl border border-accent-sage/40 text-sm font-bold text-primary bg-accent-sage/10">
            Ask Bestie for a swap
          </button>
        </div>
      </CenteredModal>

      {/* Success overlay */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            exit={{
              opacity: 0
            }}
            className="absolute inset-0 z-50 bg-primary flex flex-col items-center justify-center text-center px-6">
            <motion.div
              initial={{
                scale: 0
              }}
              animate={{
                scale: 1
              }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 18
              }}
              className="w-24 h-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-2xl">
              <Check className="w-12 h-12 text-primary" strokeWidth={2.5} />
            </motion.div>
            <h2 className="text-3xl font-extrabold text-white mb-2">Logged!</h2>
            <p className="text-accent-lavender text-lg">+1 streak</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
