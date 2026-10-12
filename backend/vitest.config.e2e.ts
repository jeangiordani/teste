import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    globals: true,
    include: ['test/**/*.e2e-spec.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    fileParallelism: false,

    env: {
      NODE_ENV: 'test',
    },
  },
});