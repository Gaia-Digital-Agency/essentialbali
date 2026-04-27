import * as migration_20260427_082903_initial from './20260427_082903_initial';
import * as migration_20260427_105750_newsletters from './20260427_105750_newsletters';

export const migrations = [
  {
    up: migration_20260427_082903_initial.up,
    down: migration_20260427_082903_initial.down,
    name: '20260427_082903_initial',
  },
  {
    up: migration_20260427_105750_newsletters.up,
    down: migration_20260427_105750_newsletters.down,
    name: '20260427_105750_newsletters'
  },
];
