import type { Project } from '@/payload-types'

/**
 * Display labels for a project's stack: the durable `technologies` relationship
 * (issue #61). Callers must fetch with depth >= 1 for the relationship to resolve
 * to Technology objects.
 */
export const projectTechLabels = (project: Partial<Project>): string[] => {
  const techs = project.technologies
  if (!Array.isArray(techs)) return []
  return techs
    .map((t) => (t && typeof t === 'object' && 'name' in t ? t.name : null))
    .filter((n): n is string => typeof n === 'string' && n.trim().length > 0)
}
