# deno-rollup
Rollup CLI for deno

## Installation

```
npm install -g deno-rollup
# or
yarn global add deno-rollup
```

## Usage

```
deno-rollup [options] <entry file>
Options:
-d, --dir <dirname>     Directory for chunks (if absent, prints to stdout)
-h, --help              Show this help message
-i, --input <filename>  Input (alternative to <entry file>)
-m, --sourcemap         Generate sourcemap (\`-m inline\` for inline map)
-o, --file <output>     Single output file (if absent, prints to stdout)
-v, --version           Show version number
-w, --watch             Watch files in bundle and rebuild on changes
```

Examples:

```
deno-rollup input.ts > output.ts

deno-rollup -m -i input.ts -o output.ts
deno-rollup --sourcemap --input input.ts --file output.ts
```

## Build

To build this tool you need to have installed both Node and Deno

`npm run build`
