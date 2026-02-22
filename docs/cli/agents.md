---
summary: "CLI reference for `ws-agent agents` (list/add/delete/set identity)"
read_when:
  - You want multiple isolated agents (workspaces + routing + auth)
title: "agents"
---

# `ws-agent agents`

Manage isolated agents (workspaces + auth + routing).

Related:

- Multi-agent routing: [Multi-Agent Routing](/concepts/multi-agent)
- Agent workspace: [Agent workspace](/concepts/agent-workspace)

## Examples

```bash
ws-agent agents list
ws-agent agents add work --workspace ~/.ws-agent/workspace-work
ws-agent agents set-identity --workspace ~/.ws-agent/workspace --from-identity
ws-agent agents set-identity --agent main --avatar avatars/ws-agent.png
ws-agent agents delete work
```

## Identity files

Each agent workspace can include an `IDENTITY.md` at the workspace root:

- Example path: `~/.ws-agent/workspace/IDENTITY.md`
- `set-identity --from-identity` reads from the workspace root (or an explicit `--identity-file`)

Avatar paths resolve relative to the workspace root.

## Set identity

`set-identity` writes fields into `agents.list[].identity`:

- `name`
- `theme`
- `emoji`
- `avatar` (workspace-relative path, http(s) URL, or data URI)

Load from `IDENTITY.md`:

```bash
ws-agent agents set-identity --workspace ~/.ws-agent/workspace --from-identity
```

Override fields explicitly:

```bash
ws-agent agents set-identity --agent main --name "WsAgent" --emoji "🦞" --avatar avatars/ws-agent.png
```

Config sample:

```json5
{
  agents: {
    list: [
      {
        id: "main",
        identity: {
          name: "WsAgent",
          theme: "space lobster",
          emoji: "🦞",
          avatar: "avatars/ws-agent.png",
        },
      },
    ],
  },
}
```
