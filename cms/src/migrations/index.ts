import * as migration_20260427_082903_initial from './20260427_082903_initial';
import * as migration_20260427_105750_newsletters from './20260427_105750_newsletters';
import * as migration_20260429_040000_n2_media_naming_schema from './20260429_040000_n2_media_naming_schema';
import * as migration_20260501_080000_articles_group from "./20260501_080000_articles_group";

export const migrations = [
  {
    up: migration_20260427_082903_initial.up,
    down: migration_20260427_082903_initial.down,
    name: '20260427_082903_initial',
  },
  {
    up: migration_20260427_105750_newsletters.up,
    down: migration_20260427_105750_newsletters.down,
    name: '20260427_105750_newsletters',
  },
  {
    up: migration_20260429_040000_n2_media_naming_schema.up,
    down: migration_20260429_040000_n2_media_naming_schema.down,
    name: '20260429_040000_n2_media_naming_schema',
  },
  {
    up: migration_20260501_080000_articles_group.up,
    down: migration_20260501_080000_articles_group.down,
    name: "20260501_080000_articles_group",
  },
];
