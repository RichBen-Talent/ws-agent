import type { WsAgentConfig } from "../config/config.js";

export function setPluginEnabledInConfig(
  config: WsAgentConfig,
  pluginId: string,
  enabled: boolean,
): WsAgentConfig {
  return {
    ...config,
    plugins: {
      ...config.plugins,
      entries: {
        ...config.plugins?.entries,
        [pluginId]: {
          ...(config.plugins?.entries?.[pluginId] as object | undefined),
          enabled,
        },
      },
    },
  };
}
