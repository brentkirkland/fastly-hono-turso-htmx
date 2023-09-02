import { build } from 'esbuild'
import { polyfillNode } from 'esbuild-plugin-polyfill-node'

build({
  entryPoints: ['./src/index.tsx'],
  bundle: true,
  outdir: './bin',
  plugins: [
    polyfillNode({
      globals: {
        navigator: true,
      }
    }),
  ],
}).catch((error) => {
  console.error(error)
  process.exit(1)
})
