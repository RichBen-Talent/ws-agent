---
summary: "CLI reference for `ws-agent config` (get/set/unset config values)"
read_when:
  - You want to read or edit config non-interactively
title: "config"
---

# `ws-agent config`

Config helpers: get/set/unset values by path. Run without a subcommand to open
the configure wizard (same as `ws-agent configure`).

## Examples

```bash
ws-agent config get browser.executablePath
ws-agent config set browser.executablePath "/usr/bin/google-chrome"
ws-agent config set agents.defaults.heartbeat.every "2h"
ws-agent config set agents.list[0].tools.exec.node "node-id-or-name"
ws-agent config unset tools.web.search.apiKey
```

## Paths

Paths use dot or bracket notation:

```bash
ws-agent config get agents.defaults.workspace
ws-agent config get agents.list[0].id
```

Use the agent list index to target a specific agent:

```bash
ws-agent config get agents.list
ws-agent config set agents.list[1].tools.exec.node "node-id-or-name"
```

## Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings.
Use `--strict-json` to require JSON5 parsing. `--json` remains supported as a legacy alias.

```bash
ws-agent config set agents.defaults.heartbeat.every "0m"
ws-agent config set gateway.port 19001 --strict-json
ws-agent config set channels.whatsapp.groups '["*"]' --strict-json
```

Restart the gateway after edits.
