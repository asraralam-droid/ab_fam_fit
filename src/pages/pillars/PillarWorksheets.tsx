import { useOutletContext } from 'react-router-dom';
import { FileText } from 'lucide-react';
import type { PillarOutletContext } from './pillarOutletContext';

export function PillarWorksheets() {
  const { pillarLabel } = useOutletContext<PillarOutletContext>();

  return (
    <div className="px-4 pt-6 pb-24 flex flex-col gap-5">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">
          {pillarLabel}
        </p>
        <h2 className="text-lg font-bold text-text">Worksheets</h2>
        <p className="text-sm text-text-muted mt-1">
          Practice and reflect in this pillar.
        </p>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-surface p-6 text-center">
        <FileText className="w-8 h-8 text-text-muted mx-auto mb-3" />
        <p className="text-sm font-bold text-text">Worksheets coming soon</p>
        <p className="text-sm text-text-muted mt-2 leading-relaxed">
          Guided worksheets for {pillarLabel} aren&apos;t in the app yet. This
          section will fill as content is added.
        </p>
      </div>
    </div>
  );
}
