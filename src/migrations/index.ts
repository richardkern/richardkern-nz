import * as migration_20260707_051343_initial from './20260707_051343_initial';
import * as migration_20260711_064825_projects_seo_meta from './20260711_064825_projects_seo_meta';
import * as migration_20260715_205027_align_projects_native_drafts from './20260715_205027_align_projects_native_drafts';
import * as migration_20260715_222659_backfill_project_versions from './20260715_222659_backfill_project_versions';

export const migrations = [
  {
    up: migration_20260707_051343_initial.up,
    down: migration_20260707_051343_initial.down,
    name: '20260707_051343_initial',
  },
  {
    up: migration_20260711_064825_projects_seo_meta.up,
    down: migration_20260711_064825_projects_seo_meta.down,
    name: '20260711_064825_projects_seo_meta',
  },
  {
    up: migration_20260715_205027_align_projects_native_drafts.up,
    down: migration_20260715_205027_align_projects_native_drafts.down,
    name: '20260715_205027_align_projects_native_drafts',
  },
  {
    up: migration_20260715_222659_backfill_project_versions.up,
    down: migration_20260715_222659_backfill_project_versions.down,
    name: '20260715_222659_backfill_project_versions'
  },
];
