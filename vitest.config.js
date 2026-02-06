import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['**/*.{test,spec}.{js,jsx}'],
    backend: {
      environment: 'node',
      include: ['backend/**/*.{test,spec}.{js,jsx}'],
    },
    frontend: {
      environment: 'jsdom',
      include: ['frontend/**/*.{test,spec}.{js,jsx}'],
      setupFiles: ['frontend/tests/setup.js'],
    },
  },
})
