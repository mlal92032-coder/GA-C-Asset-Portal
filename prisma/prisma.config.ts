import { defineConfig } from '@prisma/internals';

export default defineConfig({
  migrations: {
    seed: 'tsx ./prisma/seed.ts',
  },
});
