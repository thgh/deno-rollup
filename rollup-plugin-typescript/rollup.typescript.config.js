// import urlImport from 'rollup-plugin-url-import'
import { terser } from 'rollup-plugin-terser'

export default {
  // input: 'https://dev.jspm.io/typescript',
  input: 'typescript.out.js',
  plugins: [
    // urlImport(),
    {
      intro() {
        return 'const global = window; const self = window;'
      },
      transform (code, id) {
        return code.replace('(typescript, tsconfigPath) {', '(typescript, tsconfigPath) {return {}')
      }
    },
    terser()
  ],
  output: [
    {
      format: 'esm',
      file: 'typescript.esm.min.js'
    }
  ]
}
