import { defineConfig } from 'vite';
import { resolve, relative, sep } from 'path';
import { readdirSync, statSync } from 'fs';

function findGameIndexPages(dir) {
  const entries = readdirSync(dir);
  const pages = [];

  for (const entry of entries) {
    const fullPath = resolve(dir, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      pages.push(...findGameIndexPages(fullPath));
      continue;
    }

    if (entry === 'index.html') {
      pages.push(fullPath);
    }
  }

  return pages;
}

const gamePages = findGameIndexPages(resolve(__dirname, 'games'));
const gameInputs = Object.fromEntries(
  gamePages.map((pagePath) => {
    const relativePath = relative(resolve(__dirname, 'games'), pagePath);
    const key = relativePath
      .slice(0, -`${sep}index.html`.length)
      .split(sep)
      .join('-');

    return [key, pagePath];
  })
);

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...gameInputs,
      },
    },
  },
});
