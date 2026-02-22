import Foundation

public enum WsAgentLocationMode: String, Codable, Sendable, CaseIterable {
    case off
    case whileUsing
    case always
}
