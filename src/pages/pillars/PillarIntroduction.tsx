import { useNavigate, useOutletContext } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { pillarById } from '../../utils/abPillars';
import type { PillarOutletContext } from './pillarOutletContext';

export function PillarIntroduction() {
  const navigate = useNavigate();
  const { pillarId, pillarLabel } = useOutletContext<PillarOutletContext>();
  const pillar = pillarById(pillarId);
  const description =
    pillar?.description ?? 'Your next step in the Authentic Balance journey.';

  return (
    <div className="px-4 pt-6 pb-24 flex flex-col gap-6">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
          Introduction
        </p>
        <h2 className="text-xl font-bold text-text leading-snug">
          Welcome to {pillarLabel}
        </h2>
        <p className="text-sm text-text-muted mt-3 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-4">
        <p className="text-sm text-text leading-relaxed">
          This pillar follows one clear path. Start with a daily check-in so we
          know how you&apos;re showing up — then take your healthiest next step.
        </p>
      </div>

      <button
        type="button"
        onClick={() => navigate(`/pillars/${pillarId}/check-in`)}
        className="w-full h-12 rounded-xl bg-primary text-white font-bold shadow-md shadow-primary/20 hover:bg-primary-hover transition-all flex items-center justify-center gap-2">
        <ClipboardList className="w-5 h-5" />
        Start with Daily Check In
      </button>
    </div>
  );
}
