# Future work

## Agent-ops dex support (deferred 2026-07-14)

loredex core is gaining dex types (`_index/dex.json`) and an `agent-ops` type
(Manager ▸ Client ▸ Pipeline|Agent ▸ Stage, client tags, workspace materializer,
non-md indexing). This plugin was deliberately left out of that rollout.

When picking it up:

- Bump the `loredex` dep to the release that ships dex types (≥ 2.5.0). Because
  the plugin is a thin delegator (`syncVault` → `rebuildIndexes(vaultPath)`,
  which branches on dex type internally), agent-ops Home/MOC/Dashboard.base
  regeneration should work with **no plugin code changes** — verify with
  `npm run typecheck && npm run smoke` against an agent-ops fixture dex.
- Status-bar handoff badge degrades to empty in agent-ops dexes (no handoffs
  concept there) — acceptable; consider an `_inbox` pending count instead.
- Wording sweep: "vault" → "dex" in README, manifest description, settings tab,
  command display names (command IDs stay unchanged).
- Bump manifest/versions for a plugin release after the above.

Design reference: `loredex/docs/plan/agent-ops-dex-type.md` and `loredex/docs/DEX-SPEC.md`.
