import type {
  AnyAgentTool,
  WsAgentPluginApi,
  WsAgentPluginToolFactory,
} from "../../src/plugins/types.js";
import { createLobsterTool } from "./src/lobster-tool.js";

export default function register(api: WsAgentPluginApi) {
  api.registerTool(
    ((ctx) => {
      if (ctx.sandboxed) {
        return null;
      }
      return createLobsterTool(api) as AnyAgentTool;
    }) as WsAgentPluginToolFactory,
    { optional: true },
  );
}
