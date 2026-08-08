import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['website/src/**/*.test.{ts,tsx}', 'api/**/*.test.ts'],
    setupFiles: ['./website/src/test/setup.ts'],
    restoreMocks: true,
    env: {
      DATABASE_URL: 'postgresql://test:test@127.0.0.1:5432/test',
      POSTGRES_URL: 'postgresql://test:test@127.0.0.1:5432/test',
      BETTER_AUTH_SECRET: 'credential-free-test-secret-at-least-32-characters',
      BETTER_AUTH_URL: 'http://127.0.0.1:4173',
    },
  },
})
