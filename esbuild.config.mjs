import esbuild from 'esbuild'
import process from 'node:process'
import builtins from 'node:module'

const mode = process.argv[2]
const banner = `/*
Loredex Obsidian plugin — https://github.com/ahmedtawfeeq1/loredex-obsidian
Bundled build; source in src/. Core logic lives in the 'loredex' npm package.
*/`

/** Everything Obsidian/Electron provides at runtime stays external. */
const externals = [
  'obsidian',
  'electron',
  '@codemirror/*',
  '@lezer/*',
  ...builtins.builtinModules,
  ...builtins.builtinModules.map((m) => `node:${m}`),
]

if (mode === 'smoke') {
  // obsidian-free bundle of the HTTP server for a live smoke test outside the app
  await esbuild.build({
    entryPoints: ['scripts/smoke-entry.ts'],
    bundle: true,
    platform: 'node',
    format: 'esm',
    target: 'es2022',
    outfile: 'smoke.js',
    external: [...builtins.builtinModules, ...builtins.builtinModules.map((m) => `node:${m}`)],
    // CJS deps (gray-matter) require() builtins; give the ESM bundle a require
    banner: {
      js: "import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);",
    },
  })
  process.exit(0)
}

const context = await esbuild.context({
  entryPoints: ['src/main.ts'],
  bundle: true,
  banner: { js: banner },
  platform: 'node',
  format: 'cjs',
  target: 'es2022',
  outfile: 'main.js',
  external: externals,
  sourcemap: mode === 'production' ? false : 'inline',
  treeShaking: true,
  logLevel: 'info',
})

if (mode === 'production') {
  await context.rebuild()
  process.exit(0)
} else {
  await context.watch()
}
