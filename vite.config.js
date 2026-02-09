import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        pacman: resolve(__dirname, 'games/pacman/index.html'),
        flappy: resolve(__dirname, 'games/flappy/index.html'),
        tetris: resolve(__dirname, 'games/tetris/index.html'),
        towerwars: resolve(__dirname, 'games/towerwars/index.html'),
      }
    }
  }
});
