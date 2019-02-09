import { cwd } from 'deno'
import { resolve } from 'path'
import typescript from './typescript.esm.min.js'
import { createFilter } from 'rollup-pluginutils'

const TSLIB_ID = '\0tslib'

export default function(options = {}) {
  options = Object.assign({}, options)

  const filter = createFilter(/\.tsx?$/, /\.d\.tsx?$/)

  return {
    name: 'typescript',

    resolveId(importee, importer) {
      if (importee === 'tslib') {
        return TSLIB_ID
      }
      if (importer && importer.endsWith('.ts')) {
        return resolve(cwd(), importer, '..', importee)
      }
    },

    load(id) {
      if (id === TSLIB_ID) {
        return options.tslib
      }
    },

    transform(code, id) {
      if (!filter(id)) return null

      const transformed = typescript.transpileModule(code, {
        compilerOptions: {
          target: 'ES6'
        },
        fileName: id
      })

      return {
        code: transformed.outputText,

        // Rollup expects `map` to be an object so we must parse the string
        map: transformed.sourceMapText
          ? JSON.parse(transformed.sourceMapText)
          : null
      }
    }
  }
}
