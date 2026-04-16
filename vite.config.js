import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.{js,jsx}'],
    setupFiles: [],
  },
  build: {
    // Split the 855 KB monolith into cacheable vendor chunks so a React
    // patch release doesn't bust the cache for the entire app. Priority:
    // react-dom is by far the heaviest import, then framer-motion, then
    // the Radix/shadcn primitives.
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-motion': ['framer-motion'],
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
            'tailwindcss-animate',
          ],
          'vendor-icons': ['lucide-react'],
          'vendor-dates': ['date-fns'],
        },
      },
    },
    // Raise the 500 kB warning to 600 kB — the remaining app chunk should
    // sit comfortably under this once vendors are split out.
    chunkSizeWarningLimit: 600,
  },
})
