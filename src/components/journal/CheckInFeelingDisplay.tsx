import React from 'react';
import { CHECK_IN_FEELINGS } from '../../utils/checkInFeelings';

export function CheckInFeelingDisplay({ feeling }: { feeling: number }) {
  return (
    <div className="mb-2">
      <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1.5">
        Feeling
      </p>
      <div className="grid grid-cols-5 gap-1.5">
        {CHECK_IN_FEELINGS.map(({ score, label }) => {
          const selected = feeling === score;
          return (
            <div
              key={score}
              className={`rounded-lg border px-1 py-1.5 text-center transition-colors ${
                selected
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : 'border-border bg-surface-2 opacity-60'
              }`}>
              <span className="block text-xs font-bold text-text leading-none">
                {score}
              </span>
              <span className="block text-[9px] mt-0.5 text-text-muted leading-tight">
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
