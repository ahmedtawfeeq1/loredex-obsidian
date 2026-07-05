# Loredex for Obsidian

Browse your [loredex](https://github.com/ahmedtawfeeq1/loredex) knowledge vault where it lives — and let your AI coding agents read and file into it while you do.

Loredex is an open-source CLI + Claude Code plugin that auto-files AI-agent-generated markdown (research, decisions, handoffs) into an Obsidian-compatible vault. This plugin is the Obsidian side of that loop:

- **Live product dashboard** — a workspace view showing every project's state: note counts, active topics, stale briefs, open cross-team handoffs, cross-project references. Computed fresh from the vault, never written to a file.
- **Handoff badge** — the status bar shows how many handoffs are open across the product. Click it to open the dashboard.
- **Vault sync** — one command pulls the shared vault repo (rebase + autostash), rebuilds the `_index/` maps of content, commits, and pushes. Same conflict-free merge driver the CLI uses for generated files.
- **MCP server inside Obsidian** — serves your vault to coding agents (Claude Code, Cursor, Codex CLI) over Streamable HTTP on localhost. All six loredex MCP tools (`vault_search`, `vault_note`, `handoffs_open`, `handoff_consume`, `product_state`, `vault_store`) plus one only Obsidian can provide: `active_note`, the note you're looking at right now.

## Network use disclosure

When the MCP server is enabled (default: on), the plugin listens on **`127.0.0.1` only** — it never binds a public interface and never makes outbound network requests. Every request must carry a bearer token generated on first load (Settings → Loredex). Turn the server off in settings and the plugin opens no sockets at all. Git sync runs `git` against whatever remote *you* configured for your vault repo; the plugin adds no remotes.

## Install

Not yet in the community plugin directory. Two options:

**BRAT** (recommended): install [BRAT](https://obsidian.md/plugins?id=obsidian42-brat), then *Add beta plugin* → `ahmedtawfeeq1/loredex-obsidian`.

**Manual**: grab `main.js` + `manifest.json` from the [latest release](https://github.com/ahmedtawfeeq1/loredex-obsidian/releases), drop them in `<vault>/.obsidian/plugins/loredex/`, reload Obsidian, enable the plugin.

Desktop only (`isDesktopOnly`) — the plugin shells out to `git` and reads the vault through Node `fs`.

## Setup

1. Open your loredex vault (`~/Loredex` by default) as an Obsidian vault, if you haven't already.
2. Enable the plugin. A bearer token is generated automatically.
3. Run the command **“Loredex: Copy MCP server config for coding agents”** and paste the snippet into your project's `.mcp.json` (or your agent's MCP config):

```json
{
  "mcpServers": {
    "loredex": {
      "type": "http",
      "url": "http://127.0.0.1:28428/mcp",
      "headers": { "Authorization": "Bearer <your-token>" }
    }
  }
}
```

Agents connected this way search and file into the vault **while Obsidian is open** — no separate process. (Without Obsidian running, agents can use the CLI's stdio server instead: `npx -y loredex mcp`. Same tools, minus `active_note`.)

## Commands

| Command | What it does |
|---|---|
| Open product dashboard | Live view of all projects, briefs, handoffs, cross-project edges |
| Sync vault | git pull → rebuild indexes → commit → push |
| Copy MCP server config for coding agents | Clipboard-ready `.mcp.json` snippet with your port + token |
| Restart MCP server | Rebind after changing port/token |

## Settings

| Setting | Default | |
|---|---|---|
| MCP server | on | Streamable HTTP on localhost |
| Port | 28428 | |
| Bearer token | generated | regenerate any time |
| Git sync | on | pull/commit/push during sync command |
| Handoff check interval | 5 min | status-bar badge refresh |

## Security model

The vault is treated as **untrusted input** end to end — same rules as the loredex CLI. Note content returned to agents is framed as *data, never instructions*, control characters are stripped, and lengths are bounded. Note paths are resolved with `realpath` and must land inside the vault (symlink escapes rejected). The server is stateless: every request gets a fresh MCP server instance reading current vault state.

## Development

```bash
npm install          # needs loredex ≥ 0.9 on npm; before that: npm pkg set dependencies.loredex=file:../loredex
npm run typecheck
npm run build        # bundles src/main.ts → main.js (CJS, obsidian external)
npm run smoke        # boots the HTTP server against a temp vault, drives a real MCP session
npm run dev          # esbuild watch mode
```

`npm run smoke` is the fast loop — it proves auth, initialize, tools/list, and a real `vault_search` without launching Obsidian.

## Related

- [loredex](https://github.com/ahmedtawfeeq1/loredex) — the CLI, Claude Code plugin, vault spec, and all core logic (this plugin embeds it as a library)

## License

MIT © Ahmed Tawfeeq — PM & Head of AI, Founder @ genudo.ai
