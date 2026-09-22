import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // This will load .env, .env.local, .env.[mode], .env.[mode].local
  // FIX: Replaced `process.cwd()` with `''` to fix a TypeScript error where `cwd` was not found on `process`.
  // `loadEnv` internally uses `path.resolve`, which resolves an empty string to the current working directory.
  const env = loadEnv(mode, '', '');

  return {
    plugins: [react()],
    // Set the base path for assets to be relative, allowing deployment to subdirectories.
    base: './',
    define: {
      // Expose the API key to the client-side code securely.
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
  };
});
