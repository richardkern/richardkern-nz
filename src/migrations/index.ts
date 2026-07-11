import * as migration_20260707_051343_initial from './20260707_051343_initial';
import * as migration_20260711_064825_projects_seo_meta from './20260711_064825_projects_seo_meta';

export const migrations = [
  {
    up: migration_20260707_051343_initial.up,
    down: migration_20260707_051343_initial.down,
    name: '20260707_051343_initial',
  },
  {
    up: migration_20260711_064825_projects_seo_meta.up,
    down: migration_20260711_064825_projects_seo_meta.down,
    name: '20260711_064825_projects_seo_meta'
  },
];
