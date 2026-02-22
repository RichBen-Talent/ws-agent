---
summary: "CLI reference for `ws-agent doctor` (health checks + guided repairs)"
read_when:
  - You have connectivity/auth issues and want guided fixes
  - You updated and want a sanity check
title: "doctor"
---

# `ws-agent doctor`

Health checks + quick fixes for the gateway and channels.

Related:

- Troubleshooting: [Troubleshooting](/gateway/troubleshooting)
- Security audit: [Security](/gateway/security)

## Examples

```bash
ws-agent doctor
ws-agent doctor --repair
ws-agent doctor --deep
```

Notes:

- Interactive prompts (like keychain/OAuth fixes) only run when stdin is a TTY and `--non-interactive` is **not** set. Headless runs (cron, Telegram, no terminal) will skip prompts.
- `--fix` (alias for `--repair`) writes a backup to `~/.ws-agent/ws-agent.json.bak` and drops unknown config keys, listing each removal.

## macOS: `launchctl` env overrides

If you previously ran `launchctl setenv WS_AGENT_GATEWAY_TOKEN ...` (or `...PASSWORD`), that value overrides your config file and can cause persistent “unauthorized” errors.

```bash
launchctl getenv WS_AGENT_GATEWAY_TOKEN
launchctl getenv WS_AGENT_GATEWAY_PASSWORD

launchctl unsetenv WS_AGENT_GATEWAY_TOKEN
launchctl unsetenv WS_AGENT_GATEWAY_PASSWORD
```
