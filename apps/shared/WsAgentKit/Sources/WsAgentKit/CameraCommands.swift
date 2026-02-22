import Foundation

public enum WsAgentCameraCommand: String, Codable, Sendable {
    case list = "camera.list"
    case snap = "camera.snap"
    case clip = "camera.clip"
}

public enum WsAgentCameraFacing: String, Codable, Sendable {
    case back
    case front
}

public enum WsAgentCameraImageFormat: String, Codable, Sendable {
    case jpg
    case jpeg
}

public enum WsAgentCameraVideoFormat: String, Codable, Sendable {
    case mp4
}

public struct WsAgentCameraSnapParams: Codable, Sendable, Equatable {
    public var facing: WsAgentCameraFacing?
    public var maxWidth: Int?
    public var quality: Double?
    public var format: WsAgentCameraImageFormat?
    public var deviceId: String?
    public var delayMs: Int?

    public init(
        facing: WsAgentCameraFacing? = nil,
        maxWidth: Int? = nil,
        quality: Double? = nil,
        format: WsAgentCameraImageFormat? = nil,
        deviceId: String? = nil,
        delayMs: Int? = nil)
    {
        self.facing = facing
        self.maxWidth = maxWidth
        self.quality = quality
        self.format = format
        self.deviceId = deviceId
        self.delayMs = delayMs
    }
}

public struct WsAgentCameraClipParams: Codable, Sendable, Equatable {
    public var facing: WsAgentCameraFacing?
    public var durationMs: Int?
    public var includeAudio: Bool?
    public var format: WsAgentCameraVideoFormat?
    public var deviceId: String?

    public init(
        facing: WsAgentCameraFacing? = nil,
        durationMs: Int? = nil,
        includeAudio: Bool? = nil,
        format: WsAgentCameraVideoFormat? = nil,
        deviceId: String? = nil)
    {
        self.facing = facing
        self.durationMs = durationMs
        self.includeAudio = includeAudio
        self.format = format
        self.deviceId = deviceId
    }
}
