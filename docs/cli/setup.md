---
summary: "CLI reference for `ws-agent setup` (initialize config + workspace)"
read_when:
  - You’re doing first-run setup without the full onboarding wizard
  - You want to set the default workspace path
title: "setup"
---

# `ws-agent setup`

Initialize `~/.ws-agent/ws-agent.json` and the agent workspace.

Related:

- Getting started: [Getting started](/start/getting-started)
- Wizard: [Onboarding](/start/onboarding)

## Examples

```bash
ws-agent setup
ws-agent setup --workspace ~/.ws-agent/workspace
```

To run the wizard via setup:

```bash
ws-agent setup --wizard
```
