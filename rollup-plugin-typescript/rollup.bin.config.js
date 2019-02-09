// TODO: move to parent directory
import pkg from '../package.json'

const tsInternal = './typescript.esm.min.js'
const tsExternal =
  'https://unpkg.com/denorollup@' +
  pkg.version +
  '/rollup-plugin-typescript/typescript.esm.min.js'

export default {
  input: '../cli.js',
  external: [
    tsExternal,
    'deno',
    'https://unpkg.com/rollup@1.1.2/dist/rollup.browser.es.js',
    'https://unpkg.com/rollup-plugin-url-import@0.3.0/dist/index.mjs',
    'https://deno.land/x/flags/mod.ts'
  ],
  plugins: [
    {
      resolveId(id) {
        if (id === tsInternal) {
          return tsExternal
        }
      }
    }
  ],
  output: [
    {
      banner: '#!/usr/bin/env deno --allow-net --allow-write',
      format: 'esm',
      file: '../bin/denorollup'
    }
  ]
}
