import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  restoreStateDirEnv,
  setStateDirEnv,
  snapshotStateDirEnv,
  withStateDirEnv,
} from "./state-dir-env.js";

function snapshotCurrentStateDirVar(): string | undefined {
  return process.env.WS_AGENT_STATE_DIR;
}

async function expectPathMissing(filePath: string) {
  await expect(fs.stat(filePath)).rejects.toThrow();
}

async function expectStateDirEnvRestored(params: {
  prev: string | undefined;
  capturedStateDir: string;
  capturedTempRoot: string;
}) {
  expect(process.env.WS_AGENT_STATE_DIR).toBe(params.prev);
  await expectPathMissing(params.capturedStateDir);
  await expectPathMissing(params.capturedTempRoot);
}

describe("state-dir-env helpers", () => {
  it("set/snapshot/restore round-trips WS_AGENT_STATE_DIR", () => {
    const prev = snapshotCurrentStateDirVar();
    const snapshot = snapshotStateDirEnv();

    setStateDirEnv("/tmp/ws-agent-state-dir-test");
    expect(process.env.WS_AGENT_STATE_DIR).toBe("/tmp/ws-agent-state-dir-test");

    restoreStateDirEnv(snapshot);
    expect(process.env.WS_AGENT_STATE_DIR).toBe(prev);
  });

  it("withStateDirEnv sets env for callback and cleans up temp root", async () => {
    const prev = snapshotCurrentStateDirVar();

    let capturedTempRoot = "";
    let capturedStateDir = "";
    await withStateDirEnv("ws-agent-state-dir-env-", async ({ tempRoot, stateDir }) => {
      capturedTempRoot = tempRoot;
      capturedStateDir = stateDir;
      expect(process.env.WS_AGENT_STATE_DIR).toBe(stateDir);
      await fs.writeFile(path.join(stateDir, "probe.txt"), "ok", "utf8");
    });

    await expectStateDirEnvRestored({ prev, capturedStateDir, capturedTempRoot });
  });

  it("withStateDirEnv restores env and cleans temp root when callback throws", async () => {
    const prev = snapshotCurrentStateDirVar();

    let capturedTempRoot = "";
    let capturedStateDir = "";
    await expect(
      withStateDirEnv("ws-agent-state-dir-env-", async ({ tempRoot, stateDir }) => {
        capturedTempRoot = tempRoot;
        capturedStateDir = stateDir;
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    await expectStateDirEnvRestored({ prev, capturedStateDir, capturedTempRoot });
  });
});
