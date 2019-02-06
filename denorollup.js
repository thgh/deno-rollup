#!/usr/bin/env deno

import { rollup } from 'https://dev.jspm.io/npm:rollup@1.1.2/dist/rollup.browser.es.js'
import urlImport from 'https://dev.jspm.io/npm:rollup-plugin-url-import@0.2.0/dist/index.esm.js'
import { args, readFile, writeFile } from 'deno'

async function main(argument) {
  if (args.length !== 2) {
    return console.log('Filename expected')
  }
  const bundle = await rollup({
    input: args[1],
    plugins: [
      urlImport(),
      {
        resolveId(a, b) {
          return a
        },
        async load(a, b) {
          const data = await readFile(a)
          const decoder = new TextDecoder('utf-8')
          return decoder.decode(data)
        }
      }
    ]
  })
  const gen = await bundle.generate({ format: 'esm' })
  const encoder = new TextEncoder()
  gen.output.forEach(out => {
    const fileName = out.fileName.replace('.js', '.out.js')
    console.log('write', fileName)

    writeFile(fileName, encoder.encode(out.code))
  })
  console.log('ok')
}
main()
