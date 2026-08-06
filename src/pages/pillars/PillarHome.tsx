import { useNavigate, useOutletContext } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { PillarOutletContext } from './pillarOutletContext';
import { PILLAR_SECTIONS } from './pillarSections';

export function PillarHome() {
  const navigate = useNavigate();
  const { pillarId, pillarLabel } = useOutletContext<PillarOutletContext>();

  return (
    <div className="px-4 pt-5 pb-24 flex flex-col gap-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
          Your pillar journey
        </p>
        <h2 className="text-base font-bold text-text">{pillarLabel}</h2>
        <p className="text-sm text-text-muted mt-1">
          Same path for every pillar — pick your healthiest next step.
        </p>
      </div>

      <ul className="flex flex-col gap-2">
        {PILLAR_SECTIONS.map((section) => {
          const Icon = section.icon;
          return (
            <li key={section.id}>
              <button
                type="button"
                onClick={() =>
                  navigate(`/pillars/${pillarId}/${section.path}`)
                }
                className="w-full flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-surface text-left hover:border-primary/40 hover:bg-primary/5 transition-colors">
                <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-text">
                    {section.label}
                  </span>
                  <span className="block text-xs text-text-muted mt-0.5 truncate">
                    {section.description}
                  </span>
                </span>
                <ChevronRight className="w-4 h-4 text-text-muted flex-shrink-0" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
