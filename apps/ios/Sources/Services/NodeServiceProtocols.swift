import CoreLocation
import Foundation
import WsAgentKit
import UIKit

protocol CameraServicing: Sendable {
    func listDevices() async -> [CameraController.CameraDeviceInfo]
    func snap(params: WsAgentCameraSnapParams) async throws -> (format: String, base64: String, width: Int, height: Int)
    func clip(params: WsAgentCameraClipParams) async throws -> (format: String, base64: String, durationMs: Int, hasAudio: Bool)
}

protocol ScreenRecordingServicing: Sendable {
    func record(
        screenIndex: Int?,
        durationMs: Int?,
        fps: Double?,
        includeAudio: Bool?,
        outPath: String?) async throws -> String
}

@MainActor
protocol LocationServicing: Sendable {
    func authorizationStatus() -> CLAuthorizationStatus
    func accuracyAuthorization() -> CLAccuracyAuthorization
    func ensureAuthorization(mode: WsAgentLocationMode) async -> CLAuthorizationStatus
    func currentLocation(
        params: WsAgentLocationGetParams,
        desiredAccuracy: WsAgentLocationAccuracy,
        maxAgeMs: Int?,
        timeoutMs: Int?) async throws -> CLLocation
    func startLocationUpdates(
        desiredAccuracy: WsAgentLocationAccuracy,
        significantChangesOnly: Bool) -> AsyncStream<CLLocation>
    func stopLocationUpdates()
    func startMonitoringSignificantLocationChanges(onUpdate: @escaping @Sendable (CLLocation) -> Void)
    func stopMonitoringSignificantLocationChanges()
}

protocol DeviceStatusServicing: Sendable {
    func status() async throws -> WsAgentDeviceStatusPayload
    func info() -> WsAgentDeviceInfoPayload
}

protocol PhotosServicing: Sendable {
    func latest(params: WsAgentPhotosLatestParams) async throws -> WsAgentPhotosLatestPayload
}

protocol ContactsServicing: Sendable {
    func search(params: WsAgentContactsSearchParams) async throws -> WsAgentContactsSearchPayload
    func add(params: WsAgentContactsAddParams) async throws -> WsAgentContactsAddPayload
}

protocol CalendarServicing: Sendable {
    func events(params: WsAgentCalendarEventsParams) async throws -> WsAgentCalendarEventsPayload
    func add(params: WsAgentCalendarAddParams) async throws -> WsAgentCalendarAddPayload
}

protocol RemindersServicing: Sendable {
    func list(params: WsAgentRemindersListParams) async throws -> WsAgentRemindersListPayload
    func add(params: WsAgentRemindersAddParams) async throws -> WsAgentRemindersAddPayload
}

protocol MotionServicing: Sendable {
    func activities(params: WsAgentMotionActivityParams) async throws -> WsAgentMotionActivityPayload
    func pedometer(params: WsAgentPedometerParams) async throws -> WsAgentPedometerPayload
}

struct WatchMessagingStatus: Sendable, Equatable {
    var supported: Bool
    var paired: Bool
    var appInstalled: Bool
    var reachable: Bool
    var activationState: String
}

struct WatchQuickReplyEvent: Sendable, Equatable {
    var replyId: String
    var promptId: String
    var actionId: String
    var actionLabel: String?
    var sessionKey: String?
    var note: String?
    var sentAtMs: Int?
    var transport: String
}

struct WatchNotificationSendResult: Sendable, Equatable {
    var deliveredImmediately: Bool
    var queuedForDelivery: Bool
    var transport: String
}

protocol WatchMessagingServicing: AnyObject, Sendable {
    func status() async -> WatchMessagingStatus
    func setReplyHandler(_ handler: (@Sendable (WatchQuickReplyEvent) -> Void)?)
    func sendNotification(
        id: String,
        params: WsAgentWatchNotifyParams) async throws -> WatchNotificationSendResult
}

extension CameraController: CameraServicing {}
extension ScreenRecordService: ScreenRecordingServicing {}
extension LocationService: LocationServicing {}
