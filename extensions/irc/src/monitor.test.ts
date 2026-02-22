import { describe, expect, it } from "vitest";
import { resolveIrcInboundTarget } from "./monitor.js";

describe("irc monitor inbound target", () => {
  it("keeps channel target for group messages", () => {
    expect(
      resolveIrcInboundTarget({
        target: "#ws-agent",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: true,
      target: "#ws-agent",
      rawTarget: "#ws-agent",
    });
  });

  it("maps DM target to sender nick and preserves raw target", () => {
    expect(
      resolveIrcInboundTarget({
        target: "ws-agent-bot",
        senderNick: "alice",
      }),
    ).toEqual({
      isGroup: false,
      target: "alice",
      rawTarget: "ws-agent-bot",
    });
  });

  it("falls back to raw target when sender nick is empty", () => {
    expect(
      resolveIrcInboundTarget({
        target: "ws-agent-bot",
        senderNick: " ",
      }),
    ).toEqual({
      isGroup: false,
      target: "ws-agent-bot",
      rawTarget: "ws-agent-bot",
    });
  });
});
