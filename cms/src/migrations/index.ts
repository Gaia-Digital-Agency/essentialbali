import * as migration_20260427_082903_initial from './20260427_082903_initial';

export const migrations = [
  {
    up: migration_20260427_082903_initial.up,
    down: migration_20260427_082903_initial.down,
    name: '20260427_082903_initial'
  },
];
