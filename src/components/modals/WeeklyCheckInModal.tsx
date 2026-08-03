import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { checkInSlice, homeSlice } from '../../store/slices';
import { SheetModal } from './SheetModal';
import { ModalField } from './ModalField';
import { CHECK_IN_FEELINGS } from '../../utils/checkInFeelings';

const FEELINGS = CHECK_IN_FEELINGS;

function getWeekLabel() {
  return `Week of ${new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })}`;
}

export function WeeklyCheckInModal({
  open,
  onClose
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dispatch = useDispatch();
  const [feeling, setFeeling] = useState(3);
  const [win, setWin] = useState('');
  const [struggle, setStruggle] = useState('');
  const [word, setWord] = useState('');
  const [need, setNeed] = useState('');
  const weekLabel = getWeekLabel();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      checkInSlice.actions.addCheckIn({
        id: Date.now().toString(),
        date: weekLabel,
        feeling,
        word: word || 'Steady',
        win,
        struggle,
        need
      })
    );
    dispatch(homeSlice.actions.completeCheckIn(word || 'Steady'));
    toast.success('Check-in saved');
    onClose();
    setFeeling(3);
    setWin('');
    setStruggle('');
    setWord('');
    setNeed('');
  };

  return (
    <SheetModal
      open={open}
      onClose={onClose}
      header={
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-text">Weekly Reflection</h3>
            <p className="text-text-muted mt-1 text-sm">{weekLabel}</p>
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
            How are you feeling about your journey this week?
          </label>
          <div className="grid grid-cols-5 gap-2">
            {FEELINGS.map(({ score, label }) => (
              <button
                key={score}
                type="button"
                onClick={() => setFeeling(score)}
                className={`h-16 rounded-xl border transition-all flex flex-col items-center justify-center ${
                  feeling === score
                    ? 'border-primary bg-primary/10 shadow-sm'
                    : 'border-border bg-surface-2 hover:border-primary/40'
                }`}>
                <span className="text-lg font-bold text-text leading-none">{score}</span>
                <span className="text-[11px] mt-1 text-text-muted">{label}</span>
              </button>
            ))}
          </div>
        </div>

        <ModalField label="What was your biggest win this week?">
          <textarea
            value={win}
            onChange={(e) => setWin(e.target.value)}
            placeholder="No win is too small. Did you log every day? Try a new recipe? Drink more water?"
            rows={3}
            className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-sm"
          />
        </ModalField>

        <ModalField label="What was your biggest struggle?">
          <textarea
            value={struggle}
            onChange={(e) => setStruggle(e.target.value)}
            placeholder="Be honest with yourself. This is private and just for you."
            rows={3}
            className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-sm"
          />
        </ModalField>

        <ModalField label="Describe your week in ONE word">
          <input
            type="text"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="e.g., Determined"
            className="w-full h-11 px-3 rounded-xl bg-surface-2 border border-border focus:border-primary outline-none transition-all"
          />
        </ModalField>

        <ModalField label="What do you need for next week?">
          <textarea
            value={need}
            onChange={(e) => setNeed(e.target.value)}
            placeholder="More sleep? Meal prep? Support from family? Less stress?"
            rows={3}
            className="w-full p-3 rounded-xl bg-surface-2 border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none text-sm"
          />
        </ModalField>

        <button
          type="submit"
          className="w-full h-12 bg-primary text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all">
          Submit Check-In
        </button>
      </form>
    </SheetModal>
  );
}
