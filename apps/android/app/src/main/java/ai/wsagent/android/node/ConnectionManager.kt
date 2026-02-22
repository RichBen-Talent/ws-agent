package ai.wsagent.android.node

import android.os.Build
import ai.wsagent.android.BuildConfig
import ai.wsagent.android.SecurePrefs
import ai.wsagent.android.gateway.GatewayClientInfo
import ai.wsagent.android.gateway.GatewayConnectOptions
import ai.wsagent.android.gateway.GatewayEndpoint
import ai.wsagent.android.gateway.GatewayTlsParams
import ai.wsagent.android.protocol.WsAgentCanvasA2UICommand
import ai.wsagent.android.protocol.WsAgentCanvasCommand
import ai.wsagent.android.protocol.WsAgentCameraCommand
import ai.wsagent.android.protocol.WsAgentLocationCommand
import ai.wsagent.android.protocol.WsAgentScreenCommand
import ai.wsagent.android.protocol.WsAgentSmsCommand
import ai.wsagent.android.protocol.WsAgentCapability
import ai.wsagent.android.LocationMode
import ai.wsagent.android.VoiceWakeMode

class ConnectionManager(
  private val prefs: SecurePrefs,
  private val cameraEnabled: () -> Boolean,
  private val locationMode: () -> LocationMode,
  private val voiceWakeMode: () -> VoiceWakeMode,
  private val smsAvailable: () -> Boolean,
  private val hasRecordAudioPermission: () -> Boolean,
  private val manualTls: () -> Boolean,
) {
  companion object {
    internal fun resolveTlsParamsForEndpoint(
      endpoint: GatewayEndpoint,
      storedFingerprint: String?,
      manualTlsEnabled: Boolean,
    ): GatewayTlsParams? {
      val stableId = endpoint.stableId
      val stored = storedFingerprint?.trim().takeIf { !it.isNullOrEmpty() }
      val isManual = stableId.startsWith("manual|")

      if (isManual) {
        if (!manualTlsEnabled) return null
        if (!stored.isNullOrBlank()) {
          return GatewayTlsParams(
            required = true,
            expectedFingerprint = stored,
            allowTOFU = false,
            stableId = stableId,
          )
        }
        return GatewayTlsParams(
          required = true,
          expectedFingerprint = null,
          allowTOFU = false,
          stableId = stableId,
        )
      }

      // Prefer stored pins. Never let discovery-provided TXT override a stored fingerprint.
      if (!stored.isNullOrBlank()) {
        return GatewayTlsParams(
          required = true,
          expectedFingerprint = stored,
          allowTOFU = false,
          stableId = stableId,
        )
      }

      val hinted = endpoint.tlsEnabled || !endpoint.tlsFingerprintSha256.isNullOrBlank()
      if (hinted) {
        // TXT is unauthenticated. Do not treat the advertised fingerprint as authoritative.
        return GatewayTlsParams(
          required = true,
          expectedFingerprint = null,
          allowTOFU = false,
          stableId = stableId,
        )
      }

      return null
    }
  }

  fun buildInvokeCommands(): List<String> =
    buildList {
      add(WsAgentCanvasCommand.Present.rawValue)
      add(WsAgentCanvasCommand.Hide.rawValue)
      add(WsAgentCanvasCommand.Navigate.rawValue)
      add(WsAgentCanvasCommand.Eval.rawValue)
      add(WsAgentCanvasCommand.Snapshot.rawValue)
      add(WsAgentCanvasA2UICommand.Push.rawValue)
      add(WsAgentCanvasA2UICommand.PushJSONL.rawValue)
      add(WsAgentCanvasA2UICommand.Reset.rawValue)
      add(WsAgentScreenCommand.Record.rawValue)
      if (cameraEnabled()) {
        add(WsAgentCameraCommand.Snap.rawValue)
        add(WsAgentCameraCommand.Clip.rawValue)
      }
      if (locationMode() != LocationMode.Off) {
        add(WsAgentLocationCommand.Get.rawValue)
      }
      if (smsAvailable()) {
        add(WsAgentSmsCommand.Send.rawValue)
      }
      if (BuildConfig.DEBUG) {
        add("debug.logs")
        add("debug.ed25519")
      }
      add("app.update")
    }

  fun buildCapabilities(): List<String> =
    buildList {
      add(WsAgentCapability.Canvas.rawValue)
      add(WsAgentCapability.Screen.rawValue)
      if (cameraEnabled()) add(WsAgentCapability.Camera.rawValue)
      if (smsAvailable()) add(WsAgentCapability.Sms.rawValue)
      if (voiceWakeMode() != VoiceWakeMode.Off && hasRecordAudioPermission()) {
        add(WsAgentCapability.VoiceWake.rawValue)
      }
      if (locationMode() != LocationMode.Off) {
        add(WsAgentCapability.Location.rawValue)
      }
    }

  fun resolvedVersionName(): String {
    val versionName = BuildConfig.VERSION_NAME.trim().ifEmpty { "dev" }
    return if (BuildConfig.DEBUG && !versionName.contains("dev", ignoreCase = true)) {
      "$versionName-dev"
    } else {
      versionName
    }
  }

  fun resolveModelIdentifier(): String? {
    return listOfNotNull(Build.MANUFACTURER, Build.MODEL)
      .joinToString(" ")
      .trim()
      .ifEmpty { null }
  }

  fun buildUserAgent(): String {
    val version = resolvedVersionName()
    val release = Build.VERSION.RELEASE?.trim().orEmpty()
    val releaseLabel = if (release.isEmpty()) "unknown" else release
    return "WsAgentAndroid/$version (Android $releaseLabel; SDK ${Build.VERSION.SDK_INT})"
  }

  fun buildClientInfo(clientId: String, clientMode: String): GatewayClientInfo {
    return GatewayClientInfo(
      id = clientId,
      displayName = prefs.displayName.value,
      version = resolvedVersionName(),
      platform = "android",
      mode = clientMode,
      instanceId = prefs.instanceId.value,
      deviceFamily = "Android",
      modelIdentifier = resolveModelIdentifier(),
    )
  }

  fun buildNodeConnectOptions(): GatewayConnectOptions {
    return GatewayConnectOptions(
      role = "node",
      scopes = emptyList(),
      caps = buildCapabilities(),
      commands = buildInvokeCommands(),
      permissions = emptyMap(),
      client = buildClientInfo(clientId = "ws-agent-android", clientMode = "node"),
      userAgent = buildUserAgent(),
    )
  }

  fun buildOperatorConnectOptions(): GatewayConnectOptions {
    return GatewayConnectOptions(
      role = "operator",
      scopes = listOf("operator.read", "operator.write", "operator.talk.secrets"),
      caps = emptyList(),
      commands = emptyList(),
      permissions = emptyMap(),
      client = buildClientInfo(clientId = "ws-agent-control-ui", clientMode = "ui"),
      userAgent = buildUserAgent(),
    )
  }

  fun resolveTlsParams(endpoint: GatewayEndpoint): GatewayTlsParams? {
    val stored = prefs.loadGatewayTlsFingerprint(endpoint.stableId)
    return resolveTlsParamsForEndpoint(endpoint, storedFingerprint = stored, manualTlsEnabled = manualTls())
  }
}
