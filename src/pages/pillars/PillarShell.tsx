import { NavLink, Outlet, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { pillarById, type AbPillarId } from '../../utils/abPillars';
import { pillarSectionByPath } from './pillarSections';

export function PillarShell() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pillarId } = useParams<{ pillarId: string }>();
  const pillar = pillarById((pillarId || '') as AbPillarId);

  const pathParts = location.pathname.split('/').filter(Boolean);
  // /pillars/:pillarId[/section]
  const sectionPath = pathParts.length >= 3 ? pathParts[2] : undefined;
  const section = pillarSectionByPath(sectionPath);
  const onSection = !!section;

  if (!pillar) {
    return (
      <div className="flex flex-col h-full px-4 pt-8">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="self-start p-2 -ml-2 text-text hover:bg-surface-2 rounded-full mb-4">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-text mb-2">Pillar not found</h1>
        <p className="text-sm text-text-muted mb-4">
          Pick a starting pillar in onboarding, then reopen the pillar hub.
        </p>
        <button
          type="button"
          onClick={() => navigate('/onboarding')}
          className="h-11 rounded-xl bg-primary text-white text-sm font-bold">
          Choose my pillar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="px-4 pt-4 pb-3 bg-surface border-b border-border sticky top-0 z-20">
        <div className="h-10 flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              onSection
                ? navigate(`/pillars/${pillar.id}`)
                : navigate('/home')
            }
            className="p-2 -ml-2 text-text hover:bg-surface-2 rounded-full transition-colors"
            aria-label={onSection ? 'Back to pillar sections' : 'Back to home'}>
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-text truncate">
              {onSection ? section.label : pillar.label}
            </h1>
            <p className="text-[11px] text-text-muted font-medium truncate">
              {onSection
                ? pillar.label
                : 'Choose your next step in this pillar'}
            </p>
          </div>
        </div>

        {onSection && (
          <div className="mt-3">
            <NavLink
              to={`/pillars/${pillar.id}`}
              className="text-xs font-bold text-primary">
              All sections
            </NavLink>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet context={{ pillarId: pillar.id, pillarLabel: pillar.label }} />
      </div>
    </div>
  );
}
