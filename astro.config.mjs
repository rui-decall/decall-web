// @ts-check
import { defineConfig } from 'astro/config';

import cloudflare from '@astrojs/cloudflare';

import react from '@astrojs/react';

import vue from '@astrojs/vue';

import tailwind from '@astrojs/tailwind';
import tailwindcss from '@tailwindcss/vite';
// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  output: 'server',
  integrations: [react(), vue(), tailwind()],

  vite: {
    plugins: [tailwindcss()],
  },
});