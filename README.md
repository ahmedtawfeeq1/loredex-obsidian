<div align="center">

# 🔮 Loredex for Obsidian

**The Obsidian and MCP dashboard layer for [loredex](https://github.com/ahmedtawfeeq1/loredex) — shared memory, handoffs, and focused views for coding-agent teamwork.**

[![release](https://img.shields.io/github/v/release/ahmedtawfeeq1/loredex-obsidian?color=7c3aed)](https://github.com/ahmedtawfeeq1/loredex-obsidian/releases)
[![core: loredex](https://img.shields.io/npm/v/loredex?label=core%3A%20loredex&color=cb3837)](https://www.npmjs.com/package/loredex)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**loredex ecosystem** &nbsp;·&nbsp; [📖 loredex (CLI + core)](https://github.com/ahmedtawfeeq1/loredex) &nbsp;·&nbsp; [🖥️ Desktop app](https://github.com/ahmedtawfeeq1/loredex-desktop) &nbsp;·&nbsp; **🔮 Obsidian plugin** (you are here)

Part of the **loredex ecosystem** — the CLI, Claude Code plugin, vault spec, and all core logic live in the main repo: **[ahmedtawfeeq1/loredex](https://github.com/ahmedtawfeeq1/loredex)**. This plugin embeds that package as a library and re-hosts it inside Obsidian.

</div>

---

[Loredex](https://github.com/ahmedtawfeeq1/loredex) is the universal control system for coding-agent teamwork across products and projects. This plugin is the visual dashboard and in-app MCP layer that lets teams browse shared memory, track handoffs, and work from focused views inside Obsidian:

<a id="quick-actions"></a>
## 🚀 Quick Actions

| I want to... | Go here |
|---|---|
| Install the plugin fast | [Install](#install) |
| Connect my agent to Obsidian's local MCP server | [Setup](#setup) |
| Understand how this fits into the full loredex framework | [Main repo](https://github.com/ahmedtawfeeq1/loredex) |
| See the visual story behind the product | [loredex infographic gallery](https://github.com/ahmedtawfeeq1/loredex/blob/main/docs/INFOGRAPHICS.md) |
| Check security and localhost network behavior | [Network use disclosure](#network-use-disclosure) |

<a id="table-of-contents"></a>
## 📑 Table of Contents

- [Quick Actions](#quick-actions)
- [Why this plugin exists](#why-this-plugin-exists)
- [Requirements](#requirements)
- [Network use disclosure](#network-use-disclosure)
- [Install](#install)
- [Setup](#setup)
- [Commands](#commands)
- [Settings](#settings)
- [Security model](#security-model)
- [Development](#development)
- [Related](#related)
- [License](#license)

<a id="why-this-plugin-exists"></a>
## 🧭 Why This Plugin Exists

| Use the main `loredex` repo for... | Use `loredex-obsidian` for... |
|---|---|
| Routing markdown into the vault, running `adopt`, `route`, `curate`, `handoff`, and the CLI MCP server | Opening the dashboard, syncing the vault from inside Obsidian, watching handoffs, and exposing `active_note` to agents |
| Setting the shared knowledge structure | Making that structure visible and agent-accessible where you actually read it |

- **📊 Native dashboard** — one click (ribbon or command) opens `_index/Dashboard.base`, the Obsidian Bases database loredex generates: latest notes, open handoffs, by-project cards, stale list. Sortable, filterable, 100% native UI.
- **🔔 Handoff badge** — the status bar shows how many cross-team handoffs are open across the product. Click it to open the dashboard.
- **⇅ Vault sync** — one command pulls the shared vault repo (rebase + autostash), rebuilds the indexes, commits, and pushes. Same conflict-free merge driver the CLI uses for generated files.
- **🤖 MCP server inside Obsidian** — serves the vault to coding agents (Claude Code, Cursor, Codex CLI) over Streamable HTTP on localhost. All six loredex MCP tools (`vault_search`, `vault_note`, `handoffs_open`, `handoff_consume`, `product_state`, `vault_store`) **plus one only Obsidian can provide: `active_note`** — the note you're looking at right now.

<a id="requirements"></a>
## Requirements

- Obsidian **≥ 1.9** (the dashboard uses the core Bases plugin) · desktop only (`isDesktopOnly` — the plugin shells out to `git` and reads the vault through Node `fs`)
- A loredex vault (`npx loredex init` — see the [main repo](https://github.com/ahmedtawfeeq1/loredex))

<a id="network-use-disclosure"></a>
## Network use disclosure

When the MCP server is enabled (default: on), the plugin listens on **`127.0.0.1` only** — it never binds a public interface and never makes outbound network requests. Every request must carry a bearer token generated on first load (Settings → Loredex). Turn the server off in settings and the plugin opens no sockets at all. Git sync runs `git` against whatever remote *you* configured for your vault repo; the plugin adds no remotes.

<a id="install"></a>
## Install

Not yet in the community plugin directory. Two options:

**BRAT** (recommended — auto-updates): install [BRAT](https://obsidian.md/plugins?id=obsidian42-brat), then *Add beta plugin* → `ahmedtawfeeq1/loredex-obsidian`.

**Manual**: grab `main.js` + `manifest.json` from the [latest release](https://github.com/ahmedtawfeeq1/loredex-obsidian/releases), drop them in `<vault>/.obsidian/plugins/loredex/`, reload Obsidian, enable the plugin.

<a id="setup"></a>
## Setup

1. Open your loredex vault (`~/Loredex` by default) as an Obsidian vault, if you haven't already.
2. Enable the plugin. A bearer token is generated automatically.
3. Run the command **“Loredex: Copy MCP server config for coding agents”** and add it to your agent. Recommended: user-scope config so the token never lands in a committed `.mcp.json`:

```bash
claude mcp add --scope user --transport http loredex-obsidian \
  http://127.0.0.1:28428/mcp --header "Authorization: Bearer <your-token>"
```

Agents connected this way search and file into the vault **while Obsidian is open** — no separate process. (Without Obsidian running, agents use the CLI's stdio server instead: `npx -y loredex mcp`. Same tools, minus `active_note`.)

<a id="commands"></a>
## Commands

| Command | What it does |
|---|---|
| Open product dashboard | Opens `_index/Dashboard.base` — the native Bases database over every note, handoff, and project |
| Sync vault | git pull → rebuild indexes → commit → push |
| Copy MCP server config for coding agents | Clipboard-ready snippet with your port + token |
| Restart MCP server | Rebind after changing port/token |

<a id="settings"></a>
## Settings

| Setting | Default | |
|---|---|---|
| MCP server | on | Streamable HTTP on localhost |
| Port | 28428 | |
| Bearer token | generated | regenerate any time (then re-add the agent config) |
| Git sync | on | pull/commit/push during sync command |
| Handoff check interval | 5 min | status-bar badge refresh |

<a id="security-model"></a>
## Security model

The vault is treated as **untrusted input** end to end — same rules as the loredex CLI. Note content returned to agents is framed as *data, never instructions*, control characters are stripped, and lengths are bounded. Note paths are resolved with `realpath` and must land inside the vault (symlink escapes rejected). The server is stateless: every request gets a fresh MCP server instance reading current vault state.

<a id="development"></a>
## Development

```bash
npm install          # installs the loredex core from npm
npm run typecheck
npm run build        # bundles src/main.ts → main.js (CJS, obsidian external)
npm run smoke        # boots the HTTP server against a temp vault, drives a real MCP session
npm run dev          # esbuild watch mode
```

`npm run smoke` is the fast loop — it proves auth, initialize, tools/list, and a real `vault_search` without launching Obsidian.

<a id="related"></a>
## Related

- **[loredex](https://github.com/ahmedtawfeeq1/loredex)** — the main repo: CLI, Claude Code plugin, MCP server, vault spec, and all core logic (this plugin embeds it as a library)

<a id="license"></a>
## License

MIT © Ahmed Tawfeeq — PM & Head of AI, Founder @ genudo.ai
