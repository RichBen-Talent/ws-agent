import Foundation

public enum WsAgentChatTransportEvent: Sendable {
    case health(ok: Bool)
    case tick
    case chat(WsAgentChatEventPayload)
    case agent(WsAgentAgentEventPayload)
    case seqGap
}

public protocol WsAgentChatTransport: Sendable {
    func requestHistory(sessionKey: String) async throws -> WsAgentChatHistoryPayload
    func sendMessage(
        sessionKey: String,
        message: String,
        thinking: String,
        idempotencyKey: String,
        attachments: [WsAgentChatAttachmentPayload]) async throws -> WsAgentChatSendResponse

    func abortRun(sessionKey: String, runId: String) async throws
    func listSessions(limit: Int?) async throws -> WsAgentChatSessionsListResponse

    func requestHealth(timeoutMs: Int) async throws -> Bool
    func events() -> AsyncStream<WsAgentChatTransportEvent>

    func setActiveSessionKey(_ sessionKey: String) async throws
}

extension WsAgentChatTransport {
    public func setActiveSessionKey(_: String) async throws {}

    public func abortRun(sessionKey _: String, runId _: String) async throws {
        throw NSError(
            domain: "WsAgentChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "chat.abort not supported by this transport"])
    }

    public func listSessions(limit _: Int?) async throws -> WsAgentChatSessionsListResponse {
        throw NSError(
            domain: "WsAgentChatTransport",
            code: 0,
            userInfo: [NSLocalizedDescriptionKey: "sessions.list not supported by this transport"])
    }
}
