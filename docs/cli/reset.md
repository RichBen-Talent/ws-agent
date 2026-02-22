---
summary: "CLI reference for `ws-agent reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `ws-agent reset`

Reset local config/state (keeps the CLI installed).

```bash
ws-agent reset
ws-agent reset --dry-run
ws-agent reset --scope config+creds+sessions --yes --non-interactive
```
