import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/domain/**/*.ts', 'src/domain/**/*.js'],
      exclude: ['tests/**', '**/node_modules/**', 'src/domain/index.js'],
      all: true,
      thresholds: {
        lines: 99,
        functions: 100,
        branches: 98,
        statements: 99
      }
    }
  }
});
