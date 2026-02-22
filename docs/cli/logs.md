---
summary: "CLI reference for `ws-agent logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
title: "logs"
---

# `ws-agent logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

- Logging overview: [Logging](/logging)

## Examples

```bash
ws-agent logs
ws-agent logs --follow
ws-agent logs --json
ws-agent logs --limit 500
ws-agent logs --local-time
ws-agent logs --follow --local-time
```

Use `--local-time` to render timestamps in your local timezone.
