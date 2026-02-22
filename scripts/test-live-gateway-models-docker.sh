#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IMAGE_NAME="${WS_AGENT_IMAGE:-${WS_AGENT_IMAGE:-ws-agent:local}}"
CONFIG_DIR="${WS_AGENT_CONFIG_DIR:-${WS_AGENT_CONFIG_DIR:-$HOME/.ws-agent}}"
WORKSPACE_DIR="${WS_AGENT_WORKSPACE_DIR:-${WS_AGENT_WORKSPACE_DIR:-$HOME/.ws-agent/workspace}}"
PROFILE_FILE="${WS_AGENT_PROFILE_FILE:-${WS_AGENT_PROFILE_FILE:-$HOME/.profile}}"

PROFILE_MOUNT=()
if [[ -f "$PROFILE_FILE" ]]; then
  PROFILE_MOUNT=(-v "$PROFILE_FILE":/home/node/.profile:ro)
fi

echo "==> Build image: $IMAGE_NAME"
docker build -t "$IMAGE_NAME" -f "$ROOT_DIR/Dockerfile" "$ROOT_DIR"

echo "==> Run gateway live model tests (profile keys)"
docker run --rm -t \
  --entrypoint bash \
  -e COREPACK_ENABLE_DOWNLOAD_PROMPT=0 \
  -e HOME=/home/node \
  -e NODE_OPTIONS=--disable-warning=ExperimentalWarning \
  -e WS_AGENT_LIVE_TEST=1 \
  -e WS_AGENT_LIVE_GATEWAY_MODELS="${WS_AGENT_LIVE_GATEWAY_MODELS:-${WS_AGENT_LIVE_GATEWAY_MODELS:-all}}" \
  -e WS_AGENT_LIVE_GATEWAY_PROVIDERS="${WS_AGENT_LIVE_GATEWAY_PROVIDERS:-${WS_AGENT_LIVE_GATEWAY_PROVIDERS:-}}" \
  -e WS_AGENT_LIVE_GATEWAY_MODEL_TIMEOUT_MS="${WS_AGENT_LIVE_GATEWAY_MODEL_TIMEOUT_MS:-${WS_AGENT_LIVE_GATEWAY_MODEL_TIMEOUT_MS:-}}" \
  -v "$CONFIG_DIR":/home/node/.ws-agent \
  -v "$WORKSPACE_DIR":/home/node/.ws-agent/workspace \
  "${PROFILE_MOUNT[@]}" \
  "$IMAGE_NAME" \
  -lc "set -euo pipefail; [ -f \"$HOME/.profile\" ] && source \"$HOME/.profile\" || true; cd /app && pnpm test:live"
