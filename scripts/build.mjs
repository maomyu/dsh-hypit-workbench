import { build } from 'esbuild'
import { mkdir, writeFile } from 'node:fs/promises'

const result = await build({
  entryPoints: ['src/client.jsx'],
  bundle: true,
  write: false,
  format: 'cjs',
  platform: 'browser',
  target: 'es2022',
  minify: true,
  charset: 'utf8',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  external: ['react', 'react-dom'],
  loader: { '.css': 'text', '.svg': 'dataurl' },
  legalComments: 'inline',
})

await mkdir('dist', { recursive: true })
const client = [
  "window.__ModuleLoader__.load({id:'dsh-hypit-workbench',factory(require){",
  'const module={exports:{}};let exports=module.exports;',
  result.outputFiles[0].text,
  'return module.exports;}});',
].join('\n')
await writeFile('dist/client.js', client)
console.log(`built dist/client.js (${Buffer.byteLength(client)} bytes)`)
