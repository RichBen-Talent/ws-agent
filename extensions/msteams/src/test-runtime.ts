import os from "node:os";
import path from "node:path";
import type { PluginRuntime } from "ws-agent/plugin-sdk";

export const msteamsRuntimeStub = {
  state: {
    resolveStateDir: (env: NodeJS.ProcessEnv = process.env, homedir?: () => string) => {
      const override = env.WS_AGENT_STATE_DIR?.trim();
      if (override) {
        return override;
      }
      const resolvedHome = homedir ? homedir() : os.homedir();
      return path.join(resolvedHome, ".ws-agent");
    },
  },
} as unknown as PluginRuntime;
