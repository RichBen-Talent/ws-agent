import path from "node:path";
import { describe, expect, it } from "vitest";
import { formatCliCommand } from "./command-format.js";
import { applyCliProfileEnv, parseCliProfileArgs } from "./profile.js";

describe("parseCliProfileArgs", () => {
  it("leaves gateway --dev for subcommands", () => {
    const res = parseCliProfileArgs([
      "node",
      "ws-agent",
      "gateway",
      "--dev",
      "--allow-unconfigured",
    ]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBeNull();
    expect(res.argv).toEqual(["node", "ws-agent", "gateway", "--dev", "--allow-unconfigured"]);
  });

  it("still accepts global --dev before subcommand", () => {
    const res = parseCliProfileArgs(["node", "ws-agent", "--dev", "gateway"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("dev");
    expect(res.argv).toEqual(["node", "ws-agent", "gateway"]);
  });

  it("parses --profile value and strips it", () => {
    const res = parseCliProfileArgs(["node", "ws-agent", "--profile", "work", "status"]);
    if (!res.ok) {
      throw new Error(res.error);
    }
    expect(res.profile).toBe("work");
    expect(res.argv).toEqual(["node", "ws-agent", "status"]);
  });

  it("rejects missing profile value", () => {
    const res = parseCliProfileArgs(["node", "ws-agent", "--profile"]);
    expect(res.ok).toBe(false);
  });

  it.each([
    ["--dev first", ["node", "ws-agent", "--dev", "--profile", "work", "status"]],
    ["--profile first", ["node", "ws-agent", "--profile", "work", "--dev", "status"]],
  ])("rejects combining --dev with --profile (%s)", (_name, argv) => {
    const res = parseCliProfileArgs(argv);
    expect(res.ok).toBe(false);
  });
});

describe("applyCliProfileEnv", () => {
  it("fills env defaults for dev profile", () => {
    const env: Record<string, string | undefined> = {};
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    const expectedStateDir = path.join(path.resolve("/home/peter"), ".ws-agent-dev");
    expect(env.WS_AGENT_PROFILE).toBe("dev");
    expect(env.WS_AGENT_STATE_DIR).toBe(expectedStateDir);
    expect(env.WS_AGENT_CONFIG_PATH).toBe(path.join(expectedStateDir, "ws-agent.json"));
    expect(env.WS_AGENT_GATEWAY_PORT).toBe("19001");
  });

  it("does not override explicit env values", () => {
    const env: Record<string, string | undefined> = {
      WS_AGENT_STATE_DIR: "/custom",
      WS_AGENT_GATEWAY_PORT: "19099",
    };
    applyCliProfileEnv({
      profile: "dev",
      env,
      homedir: () => "/home/peter",
    });
    expect(env.WS_AGENT_STATE_DIR).toBe("/custom");
    expect(env.WS_AGENT_GATEWAY_PORT).toBe("19099");
    expect(env.WS_AGENT_CONFIG_PATH).toBe(path.join("/custom", "ws-agent.json"));
  });

  it("uses WS_AGENT_HOME when deriving profile state dir", () => {
    const env: Record<string, string | undefined> = {
      WS_AGENT_HOME: "/srv/ws-agent-home",
      HOME: "/home/other",
    };
    applyCliProfileEnv({
      profile: "work",
      env,
      homedir: () => "/home/fallback",
    });

    const resolvedHome = path.resolve("/srv/ws-agent-home");
    expect(env.WS_AGENT_STATE_DIR).toBe(path.join(resolvedHome, ".ws-agent-work"));
    expect(env.WS_AGENT_CONFIG_PATH).toBe(
      path.join(resolvedHome, ".ws-agent-work", "ws-agent.json"),
    );
  });
});

describe("formatCliCommand", () => {
  it.each([
    {
      name: "no profile is set",
      cmd: "ws-agent doctor --fix",
      env: {},
      expected: "ws-agent doctor --fix",
    },
    {
      name: "profile is default",
      cmd: "ws-agent doctor --fix",
      env: { WS_AGENT_PROFILE: "default" },
      expected: "ws-agent doctor --fix",
    },
    {
      name: "profile is Default (case-insensitive)",
      cmd: "ws-agent doctor --fix",
      env: { WS_AGENT_PROFILE: "Default" },
      expected: "ws-agent doctor --fix",
    },
    {
      name: "profile is invalid",
      cmd: "ws-agent doctor --fix",
      env: { WS_AGENT_PROFILE: "bad profile" },
      expected: "ws-agent doctor --fix",
    },
    {
      name: "--profile is already present",
      cmd: "ws-agent --profile work doctor --fix",
      env: { WS_AGENT_PROFILE: "work" },
      expected: "ws-agent --profile work doctor --fix",
    },
    {
      name: "--dev is already present",
      cmd: "ws-agent --dev doctor",
      env: { WS_AGENT_PROFILE: "dev" },
      expected: "ws-agent --dev doctor",
    },
  ])("returns command unchanged when $name", ({ cmd, env, expected }) => {
    expect(formatCliCommand(cmd, env)).toBe(expected);
  });

  it("inserts --profile flag when profile is set", () => {
    expect(formatCliCommand("ws-agent doctor --fix", { WS_AGENT_PROFILE: "work" })).toBe(
      "ws-agent --profile work doctor --fix",
    );
  });

  it("trims whitespace from profile", () => {
    expect(formatCliCommand("ws-agent doctor --fix", { WS_AGENT_PROFILE: "  jbws-agent  " })).toBe(
      "ws-agent --profile jbws-agent doctor --fix",
    );
  });

  it("handles command with no args after ws-agent", () => {
    expect(formatCliCommand("ws-agent", { WS_AGENT_PROFILE: "test" })).toBe(
      "ws-agent --profile test",
    );
  });

  it("handles pnpm wrapper", () => {
    expect(formatCliCommand("pnpm ws-agent doctor", { WS_AGENT_PROFILE: "work" })).toBe(
      "pnpm ws-agent --profile work doctor",
    );
  });
});
