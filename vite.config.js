import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Vite configuration with Tailwind CSS plugin, API proxy, and Vitest test settings
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Proxy all /api requests to the backend server running on port 5000
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  // Vitest configuration for running React component tests
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/__tests__/setup.js',
    css: true,
    // Ensure the automatic JSX runtime is available in tests
    deps: {
      optimizer: {
        web: {
          include: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
