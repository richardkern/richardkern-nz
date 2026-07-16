import type { Project } from '@/payload-types'

/**
 * Display labels for a project's stack (issue #61): the durable `technologies`
 * relationship, falling back to the legacy free-text `tech` array during the
 * transition (and if the relationship isn't populated). Callers must fetch with
 * depth >= 1 for the relationship to resolve to Technology objects.
 */
export const projectTechLabels = (project: Partial<Project>): string[] => {
  const techs = project.technologies
  if (Array.isArray(techs) && techs.length > 0) {
    const names = techs
      .map((t) => (t && typeof t === 'object' && 'name' in t ? t.name : null))
      .filter((n): n is string => typeof n === 'string' && n.trim().length > 0)
    if (names.length > 0) return names
  }
  const legacy = project.tech
  if (Array.isArray(legacy)) {
    return legacy
      .map((t) => t?.label)
      .filter((l): l is string => typeof l === 'string' && l.trim().length > 0)
  }
  return []
}
