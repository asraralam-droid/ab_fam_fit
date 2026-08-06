import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { checkInSlice, homeSlice } from '../../store/slices';
import { SheetModal } from './SheetModal';
import { ModalField } from './ModalField';
import { CHECK_IN_FEELINGS } from '../../utils/checkInFeelings';

const FEELINGS = CHECK_IN_FEELINGS;

function todayLabel() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function DailyCheckInModal({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dispatch = useDispatch();
  const [feeling, setFeeling] = useState(3);
  const [note, setNote] = useState('');
  const label = todayLabel();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const feelingLabel =
      FEELINGS.find((f) => f.score === feeling)?.label ?? 'Okay';
    dispatch(
      checkInSlice.actions.addCheckIn({
        id: `daily-${Date.now()}`,
        date: label,
        feeling,
        word: feelingLabel,
        win: note,
        struggle: '',
        need: '',
        kind: 'daily'
      })
    );
    dispatch(
      homeSlice.actions.completeDailyCheckIn({
        date: todayKey(),
        feeling
      })
    );
    toast.success('Daily check-in saved');
    onClose();
    setFeeling(3);
    setNote('');
  };

  return (
    <SheetModal
      open={open}
      onClose={onClose}
      header={
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-text">Daily Check-in</h3>
            <p className="text-text-muted mt-1 text-sm">{label}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-2 text-text-muted hover:text-text"
            aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
      }>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3 block">
            How are you feeling today?
          </label>
          <div className="grid grid-cols-5 gap-2">
            {FEELINGS.map(({ score, label: feelingName }) => (
              <button
                key={score}
                type="button"
                onClick={() => setFeeling(score)}
                className={`h-16 rounded-xl border transition-all flex flex-col items-center justify-center ${
                  feeling === score
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-surface-2 hover:border-primary/40'
                }`}>
                <span className="text-lg font-bold text-text leading-none">
                  {score}
                </span>
                <span className="text-[11px] mt-1 text-text-muted">
                  {feelingName}
                </span>
              </button>
            ))}
          </div>
        </div>

        <ModalField label="One note for today (optional)">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Energy, win, or something you want to remember…"
            rows={3}
            className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-sm"
          />
        </ModalField>

        <button
          type="submit"
          className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">
          Save Daily Check-In
        </button>
      </form>
    </SheetModal>
  );
}
