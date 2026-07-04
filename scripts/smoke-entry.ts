/**
 * Obsidian-free smoke test: boots LoredexHttpServer against a temp vault and
 * drives one MCP session over Streamable HTTP (initialize → tools/list →
 * vault_search). Proves the plugin's server stack without launching Obsidian.
 */
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { Config } from 'loredex'
import { LoredexHttpServer } from '../src/server'

const vault = mkdtempSync(join(tmpdir(), 'loredex-smoke-'))
mkdirSync(join(vault, 'projects', 'demo-api', 'auth'), { recursive: true })
writeFileSync(
  join(vault, 'projects', 'demo-api', 'auth', '2026-07-04-token-refresh.md'),
  `---\nproject: demo-api\ntopic: auth\ntype: decision\ndate: '2026-07-04'\nsource: smoke\ntags: []\nstatus: active\n---\n\n# Token refresh\n\nRefresh tokens rotate on every use.\n`,
)

const config: Config = { vaultPath: vault, sync: 'none', projects: {} }
const port = 28431
const token = 'smoke-token'
const server = new LoredexHttpServer({ config, port, token })
await server.start()

const url = `http://127.0.0.1:${port}/mcp`
let requestId = 0

async function rpc(method: string, params: object, useToken = token): Promise<Response> {
  requestId += 1
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      Authorization: `Bearer ${useToken}`,
    },
    body: JSON.stringify({ jsonrpc: '2.0', id: requestId, method, params }),
  })
}

async function parseRpc(res: Response): Promise<any> {
  const text = await res.text()
  // stateless Streamable HTTP replies as an SSE stream with one data: line
  const data = text
    .split('\n')
    .find((line) => line.startsWith('data:'))
    ?.slice(5)
  return JSON.parse(data ?? text)
}

function assert(cond: unknown, label: string): void {
  if (!cond) {
    console.error(`FAIL: ${label}`)
    process.exit(1)
  }
  console.log(`ok: ${label}`)
}

// 1. auth is enforced
const unauthorized = await rpc('initialize', {}, 'wrong-token')
assert(unauthorized.status === 401, 'rejects bad bearer token')

// 2. initialize
const init = await parseRpc(
  await rpc('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'smoke', version: '0.0.0' },
  }),
)
assert(init.result?.serverInfo?.name, `initialize → server ${init.result?.serverInfo?.name}`)

// 3. tools/list exposes the loredex core set
const tools = await parseRpc(await rpc('tools/list', {}))
const names = (tools.result?.tools ?? []).map((t: { name: string }) => t.name)
assert(names.includes('vault_search'), `tools/list has vault_search (${names.length} tools)`)

// 4. vault_search finds the seeded note
const search = await parseRpc(
  await rpc('tools/call', { name: 'vault_search', arguments: { query: 'refresh tokens' } }),
)
const body = search.result?.content?.[0]?.text ?? ''
assert(body.includes('token-refresh'), 'vault_search returns the seeded note')

await server.stop()
rmSync(vault, { recursive: true, force: true })
console.log('smoke: all checks passed')
