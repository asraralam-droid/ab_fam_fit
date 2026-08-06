import type { AdminProgram, ProgramModule, ProgramSection } from '../store/adminProgramsSlice';
import { pillarById, type AbPillarId } from './abPillars';

/** Brand curriculum path used across the member app (demo + production target). */
export const BRAND_HIERARCHY_STEPS = [
  'Pillar',
  'Program',
  'Modules',
  'Sections',
  'Lessons'
] as const;

/** Demo defaults when a program has no pillarId saved yet. */
const PROGRAM_PILLAR_DEFAULTS: Record<string, AbPillarId> = {
  'prog-jab': 'authentic-body'
};

export function resolveProgramPillarId(
  program: Pick<AdminProgram, 'id'> & { pillarId?: string | null }
): AbPillarId | null {
  if (program.pillarId) {
    const p = pillarById(program.pillarId as AbPillarId);
    if (p) return p.id;
  }
  return PROGRAM_PILLAR_DEFAULTS[program.id] ?? null;
}

export function programPillarLabel(
  program: Pick<AdminProgram, 'id'> & { pillarId?: string | null }
): string | null {
  const id = resolveProgramPillarId(program);
  return id ? pillarById(id)?.label ?? null : null;
}

export type HierarchyCrumb = {
  label: string;
  level: (typeof BRAND_HIERARCHY_STEPS)[number];
};

export function buildProgramHierarchyCrumbs(input: {
  program: AdminProgram;
  module?: ProgramModule | null;
  section?: ProgramSection | null;
  lessonLabel?: string | null;
}): HierarchyCrumb[] {
  const crumbs: HierarchyCrumb[] = [];
  const pillar = programPillarLabel(input.program);
  if (pillar) {
    crumbs.push({ label: pillar, level: 'Pillar' });
  }
  crumbs.push({ label: input.program.title, level: 'Program' });
  if (input.module) {
    crumbs.push({
      label: input.module.title || `Module ${input.module.order}`,
      level: 'Modules'
    });
  }
  if (input.section) {
    crumbs.push({
      label: input.section.title || `Section ${input.section.order}`,
      level: 'Sections'
    });
  }
  if (input.lessonLabel) {
    crumbs.push({ label: input.lessonLabel, level: 'Lessons' });
  }
  return crumbs;
}
