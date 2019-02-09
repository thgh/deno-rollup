import { rollup } from 'https://unpkg.com/rollup@1.1.2/dist/rollup.browser.es.js'
import urlImport from 'https://unpkg.com/rollup-plugin-url-import@0.3.0/dist/index.mjs'
import typescript from './rollup-plugin-typescript/index.esm.js'
import { args, exit, readFile, writeFile, stdout, stderr } from 'deno'
import { parse } from 'https://deno.land/x/flags/mod.ts'

const HELP_MESSAGE = `
Rollup TypeScript and URL imports into one JS bundle.
Usage: denorollup [options] <entry file>
Options:
-d, --dir <dirname>     Directory for chunks (if absent, prints to stdout)
-h, --help              Show this help message
-i, --input <filename>  Input (alternative to <entry file>)
-m, --sourcemap         Generate sourcemap (\`-m inline\` for inline map)
-o, --file <output>     Single output file (if absent, prints to stdout)
-v, --version           Show version number
-w, --watch             Watch files in bundle and rebuild on changes
Example:
  denorollup input.ts > output.js
                        Bundles input.ts and writes to output.js
  denorollup input.ts -o output.js
                        Bundles input.ts and writes to output.js
  denorollup input.ts --dir dist
                        Bundles input.ts and writes to dist/input.js
`

async function main(opts) {
  const { _: inputs, dir, file, help, input, sourcemap, version, watch } = opts

  if (version) {
    error('version is not yet implemented')
  }

  if (watch) {
    error('watch is not yet implemented')
  }

  if (inputs[0] && inputs[0].endsWith('denorollup')) {
    inputs.unshift()
  }

  // Check if bundleable
  const entry = input || inputs[0]
  if (help || !entry) {
    console.log(HELP_MESSAGE)
    exit(0)
  }

  const useStdout = !file && !dir
  const useSourcemap = sourcemap === '' || sourcemap
  if (useStdout && useSourcemap) {
    error(
      'You must specify a --file (-o) option when creating a file with a sourcemaps'
    )
  }

  // Start bundling
  const bundle = await rollup({
    input: entry,
    // sourcemap
    plugins: [
      urlImport(),
      typescript({
        tsconfig: false,
        include: /\.tsx?$/,
        exclude: /\.d\.tsx?$/
      }),
      fileImport(),
    ]
  })
  const { output: outputs } = await bundle.generate({
    dir,
    file,
    format: 'esm',
    sourcemap: useSourcemap
  })

  // Output bundle
  outputs.forEach(async file => {
    let source
    if (file.isAsset) {
      source = file.source
    } else {
      source = file.code
      if (sourcemap === 'inline') {
        cleanSourcemap(file.map)
        source += `\n//# sourceMappingURL=${file.map.toUrl()}\n`
      } else if (sourcemap) {
        source += `\n//# sourceMappingURL=${file.fileName}.map\n`
      }
    }

    if (useStdout) {
      if (outputs.length > 1) {
        output('\n//→ ' + file.fileName + ':\n')
      }
      output(source)
    } else {
      const encoder = new TextEncoder()
      const outputDir = dir ? dir + '/' : ''
      await writeFile(outputDir + file.fileName, encoder.encode(source))
      if (sourcemap && sourcemap !== 'inline') {
        await writeFile(
          outputDir + file.fileName + '.map',
          encoder.encode(file.map.toString())
        )
      }
      stderr.write('created', file.fileName)
    }
  })
}

function fileImport() {
  const decoder = new TextDecoder('utf-8')
  return {
    name: 'fileImport',
    resolveId(filePath) {
      return filePath
    },
    async load(filePath) {
      const data = await readFile(filePath)
      return decoder.decode(data)
    }
  }
}

function error(msg) {
  console.error(msg)
  exit(1)
}

function output (str) {
  const encoder = new TextEncoder()
  return stdout.write(encoder.encode(str))
}

function log (str) {
  const encoder = new TextEncoder()
  return stderr.write(encoder.encode(str))
}

main(
  parse(args.slice(1), {
    string: ['dir', 'file', 'input', 'sourcemap'],
    boolean: ['help', 'version', 'watch'],
    alias: {
      d: 'dir',
      h: 'help',
      i: 'input',
      m: 'sourcemap',
      o: 'file',
      v: 'version',
      w: 'watch'
    }
  })
)

function cleanSourcemap(map) {
  map.sourcesContent = map.sourcesContent.map(clean)
  return map
}

function btoaReplacer(nonAsciiChars) {
  // make the UTF string into a binary UTF-8 encoded string
  var point = nonAsciiChars.charCodeAt(0)
  if (point >= 0xd800 && point <= 0xdbff) {
    var nextcode = nonAsciiChars.charCodeAt(1)
    if (nextcode !== nextcode)
      // NaN because string is 1 code point long
      return String.fromCharCode(
        0xef /*11101111*/,
        0xbf /*10111111*/,
        0xbd /*10111101*/
      )
    // https://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
    if (nextcode >= 0xdc00 && nextcode <= 0xdfff) {
      point = (point - 0xd800) * 0x400 + nextcode - 0xdc00 + 0x10000
      if (point > 0xffff)
        return String.fromCharCode(
          (0x1e /*0b11110*/ << 3) | (point >>> 18),
          (0x2 /*0b10*/ << 6) | ((point >>> 12) & 0x3f) /*0b00111111*/,
          (0x2 /*0b10*/ << 6) | ((point >>> 6) & 0x3f) /*0b00111111*/,
          (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/
        )
    } else return String.fromCharCode(0xef, 0xbf, 0xbd)
  }
  if (point <= 0x007f) return inputString
  else if (point <= 0x07ff) {
    return String.fromCharCode(
      (0x6 << 5) | (point >>> 6),
      (0x2 << 6) | (point & 0x3f)
    )
  } else
    return String.fromCharCode(
      (0xe /*0b1110*/ << 4) | (point >>> 12),
      (0x2 /*0b10*/ << 6) | ((point >>> 6) & 0x3f) /*0b00111111*/,
      (0x2 /*0b10*/ << 6) | (point & 0x3f) /*0b00111111*/
    )
}

function clean(inputString) {
  return inputString.replace(
    /[\x80-\uD7ff\uDC00-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]?/g,
    btoaReplacer
  )
}
