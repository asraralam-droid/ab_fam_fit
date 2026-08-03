import React from 'react';

type ToggleSize = 'sm' | 'md';

const sizeStyles: Record<
  ToggleSize,
  { track: string; knob: string; on: string; off: string }
> = {
  sm: {
    track: 'h-5 w-9',
    knob: 'h-4 w-4',
    on: 'translate-x-4',
    off: 'translate-x-0.5'
  },
  md: {
    track: 'h-6 w-11',
    knob: 'h-5 w-5',
    on: 'translate-x-5',
    off: 'translate-x-0.5'
  }
};

export type ToggleSwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: ToggleSize;
  id?: string;
  'aria-label'?: string;
  className?: string;
};

export function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md',
  id,
  'aria-label': ariaLabel,
  className = ''
}: ToggleSwitchProps) {
  const s = sizeStyles[size];

  const control = (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel ?? (label ? undefined : 'Toggle')}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50 ${s.track} ${checked ? 'bg-accent-sage' : 'bg-border'} ${className}`}>
      <span
        aria-hidden
        className={`pointer-events-none block rounded-full bg-white shadow transition-transform ${s.knob} ${checked ? s.on : s.off}`}
      />
    </button>
  );

  if (label) {
    return (
      <label
        htmlFor={id}
        className="flex items-center justify-between gap-3 p-3 rounded-xl bg-surface-2 border border-border cursor-pointer">
        <span className="text-sm font-semibold text-text">{label}</span>
        {control}
      </label>
    );
  }

  return control;
}
