import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  resolveDefaultConfigCandidates,
  resolveConfigPathCandidate,
  resolveConfigPath,
  resolveOAuthDir,
  resolveOAuthPath,
  resolveStateDir,
} from "./paths.js";

describe("oauth paths", () => {
  it("prefers WS_AGENT_OAUTH_DIR over WS_AGENT_STATE_DIR", () => {
    const env = {
      WS_AGENT_OAUTH_DIR: "/custom/oauth",
      WS_AGENT_STATE_DIR: "/custom/state",
    } as NodeJS.ProcessEnv;

    expect(resolveOAuthDir(env, "/custom/state")).toBe(path.resolve("/custom/oauth"));
    expect(resolveOAuthPath(env, "/custom/state")).toBe(
      path.join(path.resolve("/custom/oauth"), "oauth.json"),
    );
  });

  it("derives oauth path from WS_AGENT_STATE_DIR when unset", () => {
    const env = {
      WS_AGENT_STATE_DIR: "/custom/state",
    } as NodeJS.ProcessEnv;

    expect(resolveOAuthDir(env, "/custom/state")).toBe(path.join("/custom/state", "credentials"));
    expect(resolveOAuthPath(env, "/custom/state")).toBe(
      path.join("/custom/state", "credentials", "oauth.json"),
    );
  });
});

describe("state + config path candidates", () => {
  async function withTempRoot(prefix: string, run: (root: string) => Promise<void>): Promise<void> {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), prefix));
    try {
      await run(root);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  }

  function expectWsAgentHomeDefaults(env: NodeJS.ProcessEnv): void {
    const configuredHome = env.WS_AGENT_HOME;
    if (!configuredHome) {
      throw new Error("WS_AGENT_HOME must be set for this assertion helper");
    }
    const resolvedHome = path.resolve(configuredHome);
    expect(resolveStateDir(env)).toBe(path.join(resolvedHome, ".ws-agent"));

    const candidates = resolveDefaultConfigCandidates(env);
    expect(candidates[0]).toBe(path.join(resolvedHome, ".ws-agent", "ws-agent.json"));
  }

  it("uses WS_AGENT_STATE_DIR when set", () => {
    const env = {
      WS_AGENT_STATE_DIR: "/new/state",
    } as NodeJS.ProcessEnv;

    expect(resolveStateDir(env, () => "/home/test")).toBe(path.resolve("/new/state"));
  });

  it("uses WS_AGENT_HOME for default state/config locations", () => {
    const env = {
      WS_AGENT_HOME: "/srv/ws-agent-home",
    } as NodeJS.ProcessEnv;
    expectWsAgentHomeDefaults(env);
  });

  it("prefers WS_AGENT_HOME over HOME for default state/config locations", () => {
    const env = {
      WS_AGENT_HOME: "/srv/ws-agent-home",
      HOME: "/home/other",
    } as NodeJS.ProcessEnv;
    expectWsAgentHomeDefaults(env);
  });

  it("orders default config candidates in a stable order", () => {
    const home = "/home/test";
    const resolvedHome = path.resolve(home);
    const candidates = resolveDefaultConfigCandidates({} as NodeJS.ProcessEnv, () => home);
    const expected = [
      path.join(resolvedHome, ".ws-agent", "ws-agent.json"),
      path.join(resolvedHome, ".ws-agent", "ws-agent.json"),
      path.join(resolvedHome, ".ws-agent", "moldbot.json"),
      path.join(resolvedHome, ".ws-agent", "ws-agent.json"),
      path.join(resolvedHome, ".ws-agent", "ws-agent.json"),
      path.join(resolvedHome, ".ws-agent", "ws-agent.json"),
      path.join(resolvedHome, ".ws-agent", "moldbot.json"),
      path.join(resolvedHome, ".ws-agent", "ws-agent.json"),
      path.join(resolvedHome, ".moldbot", "ws-agent.json"),
      path.join(resolvedHome, ".moldbot", "ws-agent.json"),
      path.join(resolvedHome, ".moldbot", "moldbot.json"),
      path.join(resolvedHome, ".moldbot", "ws-agent.json"),
      path.join(resolvedHome, ".ws-agent", "ws-agent.json"),
      path.join(resolvedHome, ".ws-agent", "ws-agent.json"),
      path.join(resolvedHome, ".ws-agent", "moldbot.json"),
      path.join(resolvedHome, ".ws-agent", "ws-agent.json"),
    ];
    expect(candidates).toEqual(expected);
  });

  it("prefers ~/.ws-agent when it exists and legacy dir is missing", async () => {
    await withTempRoot("ws-agent-state-", async (root) => {
      const newDir = path.join(root, ".ws-agent");
      await fs.mkdir(newDir, { recursive: true });
      const resolved = resolveStateDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(newDir);
    });
  });

  it("falls back to existing legacy state dir when ~/.ws-agent is missing", async () => {
    await withTempRoot("ws-agent-state-legacy-", async (root) => {
      const legacyDir = path.join(root, ".ws-agent");
      await fs.mkdir(legacyDir, { recursive: true });
      const resolved = resolveStateDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(legacyDir);
    });
  });

  it("CONFIG_PATH prefers existing config when present", async () => {
    await withTempRoot("ws-agent-config-", async (root) => {
      const legacyDir = path.join(root, ".ws-agent");
      await fs.mkdir(legacyDir, { recursive: true });
      const legacyPath = path.join(legacyDir, "ws-agent.json");
      await fs.writeFile(legacyPath, "{}", "utf-8");

      const resolved = resolveConfigPathCandidate({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(legacyPath);
    });
  });

  it("respects state dir overrides when config is missing", async () => {
    await withTempRoot("ws-agent-config-override-", async (root) => {
      const legacyDir = path.join(root, ".ws-agent");
      await fs.mkdir(legacyDir, { recursive: true });
      const legacyConfig = path.join(legacyDir, "ws-agent.json");
      await fs.writeFile(legacyConfig, "{}", "utf-8");

      const overrideDir = path.join(root, "override");
      const env = { WS_AGENT_STATE_DIR: overrideDir } as NodeJS.ProcessEnv;
      const resolved = resolveConfigPath(env, overrideDir, () => root);
      expect(resolved).toBe(path.join(overrideDir, "ws-agent.json"));
    });
  });
});
