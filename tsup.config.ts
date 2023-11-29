import { defineConfig } from 'tsup';

export default defineConfig({
  sourcemap: true,
  experimentalDts: true,
  target: 'es6',
  format: 'esm',
  splitting: true,
  outDir: 'dist',
  entry: ['src/index.ts'],
  clean: true,
});
// TODO: https://tsup.egoist.dev/#generate-typescript-declaration-maps--d-ts-map
