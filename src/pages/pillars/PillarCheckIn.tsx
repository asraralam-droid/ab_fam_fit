import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle2, ClipboardList } from 'lucide-react';
import { RootState } from '../../store';
import { DailyCheckInModal } from '../../components/modals';
import { getCheckInFeelingLabel } from '../../utils/checkInFeelings';
import type { PillarOutletContext } from './pillarOutletContext';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

export function PillarCheckIn() {
  const { pillarLabel } = useOutletContext<PillarOutletContext>();
  const [open, setOpen] = useState(false);
  const { dailyCheckInDate, dailyCheckInFeeling } = useSelector(
    (s: RootState) => s.home
  );

  const doneToday = useMemo(
    () => dailyCheckInDate === todayKey(),
    [dailyCheckInDate]
  );
  const feelingLabel =
    dailyCheckInFeeling != null
      ? getCheckInFeelingLabel(dailyCheckInFeeling)
      : null;

  return (
    <div className="px-4 pt-6 pb-24 flex flex-col gap-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
          {pillarLabel}
        </p>
        <h2 className="text-lg font-bold text-text">Daily Check In</h2>
        <p className="text-sm text-text-muted mt-1">{todayLabel()}</p>
      </div>

      <div
        className={`rounded-2xl border p-4 ${
          doneToday
            ? 'border-primary/30 bg-primary/5'
            : 'border-border bg-surface'
        }`}>
        {doneToday ? (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-text">You’re checked in today</p>
              <p className="text-sm text-text-muted mt-1">
                Feeling: {feelingLabel ?? 'Saved'}
                {dailyCheckInFeeling != null ? ` (${dailyCheckInFeeling}/5)` : ''}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <ClipboardList className="w-6 h-6 text-text-muted flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-text">Not checked in yet</p>
              <p className="text-sm text-text-muted mt-1">
                Take one minute to notice how you&apos;re showing up in{' '}
                {pillarLabel}.
              </p>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full h-12 rounded-xl bg-primary text-white font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">
        {doneToday ? 'Update today’s check-in' : 'Check in now'}
      </button>

      <DailyCheckInModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
