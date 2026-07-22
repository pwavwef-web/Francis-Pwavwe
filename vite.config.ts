import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// The Vite root is the repository root so that all existing static assets
// (profile.jpg, favicon.png, assets/**, docs/**) resolve in place during dev
// with zero duplication. The new futuristic app is the `app.html` entry; the
// legacy index.html / script.js / styles.css are left completely untouched.
export default defineConfig({
  root: '.',
  base: './',
  appType: 'mpa',
  server: {
    port: 3456,
    open: '/app.html',
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'es2022',
    // Emit hashed JS/CSS/image bundles into their own folder so a root-merge
    // deploy never collides with the hand-authored `assets/` (icons, certs).
    // NB: not `build/` — that name is git-ignored (Flutter leftover).
    assetsDir: 'bundle',
    rollupOptions: {
      // Two MPA source entries: the landing app and the /blogs archive. Each is
      // copied to its deployable name after build (app.html→index.html,
      // blogs-app.html→blogs.html) so the source entries are never overwritten.
      input: ['app.html', 'blogs-app.html'],
    },
  },
  plugins: [
    // Copy runtime-referenced static assets into dist so `npm run build`
    // produces a fully self-contained, deployable folder.
    viteStaticCopy({
      targets: [
        { src: 'assets', dest: '.' },
        { src: 'docs', dest: '.' },
        { src: 'profile.jpg', dest: '.' },
        { src: 'favicon.png', dest: '.' },
        { src: 'CNAME', dest: '.' },
        { src: 'ads.txt', dest: '.' },
      ],
    }),
  ],
});
