import { BRAND_HIERARCHY_STEPS, type HierarchyCrumb } from '../utils/brandHierarchy';

type Props = {
  crumbs?: HierarchyCrumb[];
  /** Show the full brand path legend (Pillar → … → Lessons). */
  showLegend?: boolean;
  className?: string;
};

export function BrandHierarchyTrail({
  crumbs,
  showLegend = false,
  className = ''
}: Props) {
  return (
    <div className={className}>
      {showLegend && (
        <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5">
          {BRAND_HIERARCHY_STEPS.join(' → ')}
        </p>
      )}
      {crumbs && crumbs.length > 0 && (
        <nav aria-label="Brand hierarchy" className="flex flex-wrap items-center gap-x-1 gap-y-1">
          {crumbs.map((crumb, i) => (
            <span key={`${crumb.level}-${crumb.label}`} className="inline-flex items-center gap-1 min-w-0">
              {i > 0 && (
                <span className="text-text-muted/70 text-xs px-0.5" aria-hidden>
                  →
                </span>
              )}
              <span className="inline-flex items-center gap-1 min-w-0">
                <span className="text-[9px] font-bold uppercase tracking-wider text-primary/80 flex-shrink-0">
                  {crumb.level === 'Modules'
                    ? 'Module'
                    : crumb.level === 'Sections'
                      ? 'Section'
                      : crumb.level === 'Lessons'
                        ? 'Lesson'
                        : crumb.level}
                </span>
                <span className="text-xs font-semibold text-text truncate max-w-[140px]">
                  {crumb.label}
                </span>
              </span>
            </span>
          ))}
        </nav>
      )}
    </div>
  );
}
