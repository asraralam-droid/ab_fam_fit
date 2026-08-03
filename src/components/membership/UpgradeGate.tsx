import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles } from 'lucide-react';

interface UpgradeGateProps {
  title?: string;
  description?: string;
  compact?: boolean;
}

export function UpgradeGate({
  title = 'Coaching access required',
  description = 'Your $77 book package includes books and self-guided tools. Unlock structured lessons, personalized guidance, or Misty coaching with an upgrade.',
  compact = false
}: UpgradeGateProps) {
  const navigate = useNavigate();

  if (compact) {
    return (
      <div className="rounded-2xl border border-border bg-surface-2 p-4 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-text">{title}</p>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/work-with-misty')}
          className="w-full h-10 rounded-xl bg-primary text-white text-sm font-bold flex items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          Work with Misty
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center px-6 py-10">
      <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
        <Lock className="w-7 h-7" />
      </div>
      <h2 className="text-xl font-bold text-text mb-2">{title}</h2>
      <p className="text-sm text-text-muted mb-6 max-w-sm leading-relaxed">
        {description}
      </p>
      <button
        type="button"
        onClick={() => navigate('/work-with-misty')}
        className="w-full max-w-xs h-12 rounded-xl bg-primary text-white font-bold flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />
        Work with Misty / Join a challenge
      </button>
    </div>
  );
}
