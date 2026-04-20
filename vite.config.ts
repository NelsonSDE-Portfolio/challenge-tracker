import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'challengeTracker',
      filename: 'remoteEntry.js',
      remotes: {
        // When running as a remote, we can optionally consume from host
        // This is primarily for standalone development
        portfolioHost: 'http://localhost:4000/assets/remoteEntry.js',
      },
      exposes: {
        './App': './src/App.tsx',
      },
      shared: ['react', 'react-dom', 'react-router-dom', '@clerk/clerk-react'],
    }),
  ],
  server: {
    port: 4001,
    strictPort: true,
  },
  preview: {
    port: 4001,
    strictPort: true,
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: true,
    cssCodeSplit: false,
  },
});
