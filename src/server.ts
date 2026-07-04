import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js'
import { type Config, createLoredexMcpServer } from 'loredex'

export interface LoredexServerOptions {
  config: Config
  port: number
  /** bearer token — requests without it are rejected */
  token: string
  /** register host-specific tools (e.g. active_note) on top of the core set */
  extend?: (server: ReturnType<typeof createLoredexMcpServer>) => void
}

/**
 * Streamable HTTP host for the loredex MCP server. Localhost-only by design; every
 * request needs the bearer token. Stateless: one MCP server + transport per request —
 * the SDK-recommended pattern for HTTP hosts, and it keeps vault state always-fresh.
 */
export class LoredexHttpServer {
  private http: Server | null = null

  constructor(private readonly options: LoredexServerOptions) {}

  get running(): boolean {
    return this.http !== null
  }

  async start(): Promise<void> {
    if (this.http) return
    const server = createServer((req, res) => {
      void this.handle(req, res)
    })
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject)
      server.listen(this.options.port, '127.0.0.1', () => resolve())
    })
    this.http = server
  }

  async stop(): Promise<void> {
    const server = this.http
    this.http = null
    if (server) await new Promise<void>((resolve) => server.close(() => resolve()))
  }

  private async handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    try {
      const auth = req.headers.authorization ?? ''
      if (auth !== `Bearer ${this.options.token}`) {
        res.writeHead(401, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'unauthorized' }))
        return
      }
      if (req.method !== 'POST') {
        // stateless mode: no SSE stream to resume, no sessions to delete
        res.writeHead(405).end()
        return
      }
      const chunks: Buffer[] = []
      for await (const chunk of req) chunks.push(chunk as Buffer)
      const body = JSON.parse(Buffer.concat(chunks).toString('utf8'))

      const mcp = createLoredexMcpServer(this.options.config)
      this.options.extend?.(mcp)
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined })
      res.on('close', () => {
        void transport.close()
        void mcp.close()
      })
      await mcp.connect(transport)
      await transport.handleRequest(req, res, body)
    } catch {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' })
        res.end(JSON.stringify({ error: 'internal error' }))
      }
    }
  }
}
