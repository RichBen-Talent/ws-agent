#!/usr/bin/env bash
set -euo pipefail

cd /repo

export WS_AGENT_STATE_DIR="/tmp/ws-agent-test"
export WS_AGENT_CONFIG_PATH="${WS_AGENT_STATE_DIR}/ws-agent.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${WS_AGENT_STATE_DIR}/credentials"
mkdir -p "${WS_AGENT_STATE_DIR}/agents/main/sessions"
echo '{}' >"${WS_AGENT_CONFIG_PATH}"
echo 'creds' >"${WS_AGENT_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${WS_AGENT_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm ws-agent reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${WS_AGENT_CONFIG_PATH}"
test ! -d "${WS_AGENT_STATE_DIR}/credentials"
test ! -d "${WS_AGENT_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${WS_AGENT_STATE_DIR}/credentials"
echo '{}' >"${WS_AGENT_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm ws-agent uninstall --state --yes --non-interactive

test ! -d "${WS_AGENT_STATE_DIR}"

echo "OK"
