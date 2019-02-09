import urlImport from 'rollup-plugin-url-import'
import { terser } from 'rollup-plugin-terser'

export default {
  input: 'https://dev.jspm.io/typescript',
  plugins: [
    urlImport(),
    {
      transform(code, id) {
        if (id.includes('typescript')) {
          return code.replace(': global;', ': window;')
        }
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
