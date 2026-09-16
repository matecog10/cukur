import { defineConfig } from 'astro/config';

// Set SITE_URL to the real domain before deploying (used for canonical URLs, sitemap, JSON-LD).
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://example.com',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'always' },
  devToolbar: { enabled: false },
});
