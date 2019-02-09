import { readFileSync } from 'fs'
import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'
import builtins from 'rollup-plugin-node-builtins'
import pkg from './package.json'

export default {
  input: './index.js',

  external: ['deno', './typescript.esm.min.js'],

  plugins: [
    // virtualResolve(),
    mm(),
    inlineTslib(),
    builtins(),
    nodeResolve(),
    buble()
  ],

  output: [
    {
      format: 'esm',
      file: pkg.module
    }
  ]
}

function mm(argument) {
  return {
    resolveId(id, x) {
      if (id === 'micromatch') {
        return id
      }
      return null
    },
    load(id) {
      if (id === 'micromatch') {
        return `
export default {
  matcher,
  test
}
export function matcher (id) {
  return id
}
export function test (id) {
  return id
}
        `
      }
    }
  }
}

function virtualResolve(argument) {
  return {
    resolveId(id, x) {
      if (id === 'typescript') {
        console.log('type', x)
        return './typescript.esm.min.js'
      }
      if (id === 'resolve' || id === 'micromatch') {
        return id
      }
      if (id === 'fs') {
        return id
      }
    },
    load(id) {
      if (id === 'resolve') {
        return `
export default {}
        `
      }
      if (id === 'micromatch') {
        return `
export default {
  matcher,
  test
}
export function matcher (id) {
  return id
}
export function test (id) {
  return id
}
        `
      }
      if (id === 'fs') {
        return `
export function existsSync () {};
export function readFileSync () {};
export function statSync () {};
        `
      }
    }
  }
}

function inlineTslib() {
  return {
    banner() {
      return `const process = {
        cwd() {
          return '.'
        }
      }`
    },
    transform(code, id) {
      if (id.includes('rollup-plugin-typescript/src/index.js')) {
        return code
          .replace(
            'options.tslib',
            JSON.stringify(
              readFileSync(
                __dirname + '/node_modules/tslib/tslib.es6.js',
                'utf-8'
              )
            )
          )
          .replace(', process.cwd()', '')
          .replace('ts.DiagnosticCategory.Error', '""')
      }
    }
  }
}
