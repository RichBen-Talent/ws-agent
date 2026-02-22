---
summary: "Uninstall WsAgent completely (CLI, service, state, workspace)"
read_when:
  - You want to remove WsAgent from a machine
  - The gateway service is still running after uninstall
title: "Uninstall"
---

# Uninstall

Two paths:

- **Easy path** if `ws-agent` is still installed.
- **Manual service removal** if the CLI is gone but the service is still running.

## Easy path (CLI still installed)

Recommended: use the built-in uninstaller:

```bash
ws-agent uninstall
```

Non-interactive (automation / npx):

```bash
ws-agent uninstall --all --yes --non-interactive
npx -y ws-agent uninstall --all --yes --non-interactive
```

Manual steps (same result):

1. Stop the gateway service:

```bash
ws-agent gateway stop
```

2. Uninstall the gateway service (launchd/systemd/schtasks):

```bash
ws-agent gateway uninstall
```

3. Delete state + config:

```bash
rm -rf "${WS_AGENT_STATE_DIR:-$HOME/.ws-agent}"
```

If you set `WS_AGENT_CONFIG_PATH` to a custom location outside the state dir, delete that file too.

4. Delete your workspace (optional, removes agent files):

```bash
rm -rf ~/.ws-agent/workspace
```

5. Remove the CLI install (pick the one you used):

```bash
npm rm -g ws-agent
pnpm remove -g ws-agent
bun remove -g ws-agent
```

6. If you installed the macOS app:

```bash
rm -rf /Applications/WsAgent.app
```

Notes:

- If you used profiles (`--profile` / `WS_AGENT_PROFILE`), repeat step 3 for each state dir (defaults are `~/.ws-agent-<profile>`).
- In remote mode, the state dir lives on the **gateway host**, so run steps 1-4 there too.

## Manual service removal (CLI not installed)

Use this if the gateway service keeps running but `ws-agent` is missing.

### macOS (launchd)

Default label is `bot.molt.gateway` (or `bot.molt.<profile>`; legacy `com.ws-agent.*` may still exist):

```bash
launchctl bootout gui/$UID/bot.molt.gateway
rm -f ~/Library/LaunchAgents/bot.molt.gateway.plist
```

If you used a profile, replace the label and plist name with `bot.molt.<profile>`. Remove any legacy `com.ws-agent.*` plists if present.

### Linux (systemd user unit)

Default unit name is `ws-agent-gateway.service` (or `ws-agent-gateway-<profile>.service`):

```bash
systemctl --user disable --now ws-agent-gateway.service
rm -f ~/.config/systemd/user/ws-agent-gateway.service
systemctl --user daemon-reload
```

### Windows (Scheduled Task)

Default task name is `WsAgent Gateway` (or `WsAgent Gateway (<profile>)`).
The task script lives under your state dir.

```powershell
schtasks /Delete /F /TN "WsAgent Gateway"
Remove-Item -Force "$env:USERPROFILE\.ws-agent\gateway.cmd"
```

If you used a profile, delete the matching task name and `~\.ws-agent-<profile>\gateway.cmd`.

## Normal install vs source checkout

### Normal install (install.sh / npm / pnpm / bun)

If you used `https://ws-agent.ai/install.sh` or `install.ps1`, the CLI was installed with `npm install -g ws-agent@latest`.
Remove it with `npm rm -g ws-agent` (or `pnpm remove -g` / `bun remove -g` if you installed that way).

### Source checkout (git clone)

If you run from a repo checkout (`git clone` + `ws-agent ...` / `bun run ws-agent ...`):

1. Uninstall the gateway service **before** deleting the repo (use the easy path above or manual service removal).
2. Delete the repo directory.
3. Remove state + workspace as shown above.
