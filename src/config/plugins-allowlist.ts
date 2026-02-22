import type { WsAgentConfig } from "./config.js";

export function ensurePluginAllowlisted(cfg: WsAgentConfig, pluginId: string): WsAgentConfig {
  const allow = cfg.plugins?.allow;
  if (!Array.isArray(allow) || allow.includes(pluginId)) {
    return cfg;
  }
  return {
    ...cfg,
    plugins: {
      ...cfg.plugins,
      allow: [...allow, pluginId],
    },
  };
}
