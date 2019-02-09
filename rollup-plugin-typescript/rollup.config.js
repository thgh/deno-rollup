import { readFileSync } from 'fs'
import buble from 'rollup-plugin-buble'
import nodeResolve from 'rollup-plugin-node-resolve'
import builtins from 'rollup-plugin-node-builtins'
import pkg from './package.json'

export default {
  input: './node_modules/rollup-plugin-typescript/src/index.js',

  external: ['./typescript.out.js'],

  plugins: [
    virtualResolve(),
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

function virtualResolve(argument) {
  return {
    resolveId(id) {
      if (id === 'typescript') {
        return './typescript.out.js'
      }
      if (id === 'resolve' || id === 'micromatch') {
        return id
      }
      if (id === 'fs' || id === 'typescript') {
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
    banner () {
      return `const process = {
        cwd() {
          return '.'
        }
      }`
    },
    transform(code, id) {
      if (id.includes('rollup-plugin-typescript/src/index.js')) {
        console.log('inlineTslib')
        return code.replace(
          'options.tslib',
          JSON.stringify(
            readFileSync(__dirname + '/node_modules/tslib/tslib.es6.js', 'utf-8')
          )
        ).replace(', process.cwd()', '')
      }
    }
  }
}
