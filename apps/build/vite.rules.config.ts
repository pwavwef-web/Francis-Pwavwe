import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/test/firestore.rules.emulator.test.ts'],
    testTimeout: 20_000,
  },
});
