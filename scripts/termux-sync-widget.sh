#!/data/data/com.termux/files/usr/bin/bash
# WsAgent OAuth Sync Widget
# Syncs Claude Code tokens to WsAgent on l36 server
# Place in ~/.shortcuts/ on phone for Termux:Widget

termux-toast "Syncing WsAgent auth..."

# Run sync on l36 server
SERVER="${WS_AGENT_SERVER:-${WS_AGENT_SERVER:-l36}}"
RESULT=$(ssh "$SERVER" '/home/admin/ws-agent/scripts/sync-claude-code-auth.sh' 2>&1)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    # Extract expiry time from output
    EXPIRY=$(echo "$RESULT" | grep "Token expires:" | cut -d: -f2-)

    termux-vibrate -d 100
    termux-toast "WsAgent synced! Expires:${EXPIRY}"

    # Optional: restart ws-agent service
    ssh "$SERVER" 'systemctl --user restart ws-agent' 2>/dev/null
else
    termux-vibrate -d 300
    termux-toast "Sync failed: ${RESULT}"
fi
