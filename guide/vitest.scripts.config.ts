import { defineConfig } from 'vitest/config';

// Tests of the Node build scripts (registry check, lint, log scan, content
// pipeline, example compilation, runtime, postbuild). The Angular unit tests
// run separately through `ng test` with their own configuration.
export default defineConfig({
  test: {
    include: ['scripts/**/test/**/*.test.mjs'],
    environment: 'node',
    testTimeout: 120000,
    hookTimeout: 120000,
    globals: false,
  },
});
