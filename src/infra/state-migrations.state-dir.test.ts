import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { autoMigrateLegacyStateDir } from "./state-migrations.js";

describe("legacy state dir auto-migration", () => {
  it("returns migrated=false when no legacy dirs exist", async () => {
    const root = await fs.promises.mkdtemp(path.join(os.tmpdir(), "ws-agent-state-dir-"));
    try {
      const result = await autoMigrateLegacyStateDir({
        env: {} as NodeJS.ProcessEnv,
        homedir: () => root,
      });
      expect(result.migrated).toBe(false);
    } finally {
      await fs.promises.rm(root, { recursive: true, force: true });
    }
  });
});
