import * as migration_20260707_051343_initial from './20260707_051343_initial';

export const migrations = [
  {
    up: migration_20260707_051343_initial.up,
    down: migration_20260707_051343_initial.down,
    name: '20260707_051343_initial'
  },
];
