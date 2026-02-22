import Foundation
import Testing
@testable import WsAgent

@Suite(.serialized)
struct WsAgentConfigFileTests {
    @Test
    func configPathRespectsEnvOverride() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("ws-agent-config-\(UUID().uuidString)")
            .appendingPathComponent("ws-agent.json")
            .path

        await TestIsolation.withEnvValues(["WS_AGENT_CONFIG_PATH": override]) {
            #expect(WsAgentConfigFile.url().path == override)
        }
    }

    @MainActor
    @Test
    func remoteGatewayPortParsesAndMatchesHost() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("ws-agent-config-\(UUID().uuidString)")
            .appendingPathComponent("ws-agent.json")
            .path

        await TestIsolation.withEnvValues(["WS_AGENT_CONFIG_PATH": override]) {
            WsAgentConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "ws://gateway.ts.net:19999",
                    ],
                ],
            ])
            #expect(WsAgentConfigFile.remoteGatewayPort() == 19999)
            #expect(WsAgentConfigFile.remoteGatewayPort(matchingHost: "gateway.ts.net") == 19999)
            #expect(WsAgentConfigFile.remoteGatewayPort(matchingHost: "gateway") == 19999)
            #expect(WsAgentConfigFile.remoteGatewayPort(matchingHost: "other.ts.net") == nil)
        }
    }

    @MainActor
    @Test
    func setRemoteGatewayUrlPreservesScheme() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("ws-agent-config-\(UUID().uuidString)")
            .appendingPathComponent("ws-agent.json")
            .path

        await TestIsolation.withEnvValues(["WS_AGENT_CONFIG_PATH": override]) {
            WsAgentConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "wss://old-host:111",
                    ],
                ],
            ])
            WsAgentConfigFile.setRemoteGatewayUrl(host: "new-host", port: 2222)
            let root = WsAgentConfigFile.loadDict()
            let url = ((root["gateway"] as? [String: Any])?["remote"] as? [String: Any])?["url"] as? String
            #expect(url == "wss://new-host:2222")
        }
    }

    @MainActor
    @Test
    func clearRemoteGatewayUrlRemovesOnlyUrlField() async {
        let override = FileManager().temporaryDirectory
            .appendingPathComponent("ws-agent-config-\(UUID().uuidString)")
            .appendingPathComponent("ws-agent.json")
            .path

        await TestIsolation.withEnvValues(["WS_AGENT_CONFIG_PATH": override]) {
            WsAgentConfigFile.saveDict([
                "gateway": [
                    "remote": [
                        "url": "wss://old-host:111",
                        "token": "tok",
                    ],
                ],
            ])
            WsAgentConfigFile.clearRemoteGatewayUrl()
            let root = WsAgentConfigFile.loadDict()
            let remote = ((root["gateway"] as? [String: Any])?["remote"] as? [String: Any]) ?? [:]
            #expect((remote["url"] as? String) == nil)
            #expect((remote["token"] as? String) == "tok")
        }
    }

    @Test
    func stateDirOverrideSetsConfigPath() async {
        let dir = FileManager().temporaryDirectory
            .appendingPathComponent("ws-agent-state-\(UUID().uuidString)", isDirectory: true)
            .path

        await TestIsolation.withEnvValues([
            "WS_AGENT_CONFIG_PATH": nil,
            "WS_AGENT_STATE_DIR": dir,
        ]) {
            #expect(WsAgentConfigFile.stateDirURL().path == dir)
            #expect(WsAgentConfigFile.url().path == "\(dir)/ws-agent.json")
        }
    }

    @MainActor
    @Test
    func saveDictAppendsConfigAuditLog() async throws {
        let stateDir = FileManager().temporaryDirectory
            .appendingPathComponent("ws-agent-state-\(UUID().uuidString)", isDirectory: true)
        let configPath = stateDir.appendingPathComponent("ws-agent.json")
        let auditPath = stateDir.appendingPathComponent("logs/config-audit.jsonl")

        defer { try? FileManager().removeItem(at: stateDir) }

        try await TestIsolation.withEnvValues([
            "WS_AGENT_STATE_DIR": stateDir.path,
            "WS_AGENT_CONFIG_PATH": configPath.path,
        ]) {
            WsAgentConfigFile.saveDict([
                "gateway": ["mode": "local"],
            ])

            let configData = try Data(contentsOf: configPath)
            let configRoot = try JSONSerialization.jsonObject(with: configData) as? [String: Any]
            #expect((configRoot?["meta"] as? [String: Any]) != nil)

            let rawAudit = try String(contentsOf: auditPath, encoding: .utf8)
            let lines = rawAudit
                .split(whereSeparator: \.isNewline)
                .map(String.init)
            #expect(!lines.isEmpty)
            guard let last = lines.last else {
                Issue.record("Missing config audit line")
                return
            }
            let auditRoot = try JSONSerialization.jsonObject(with: Data(last.utf8)) as? [String: Any]
            #expect(auditRoot?["source"] as? String == "macos-ws-agent-config-file")
            #expect(auditRoot?["event"] as? String == "config.write")
            #expect(auditRoot?["result"] as? String == "success")
            #expect(auditRoot?["configPath"] as? String == configPath.path)
        }
    }
}
