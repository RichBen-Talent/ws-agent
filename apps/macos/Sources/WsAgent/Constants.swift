import Foundation

// Stable identifier used for both the macOS LaunchAgent label and Nix-managed defaults suite.
// nix-ws-agent writes app defaults into this suite to survive app bundle identifier churn.
let launchdLabel = "ai.wsagent.mac"
let gatewayLaunchdLabel = "ai.wsagent.gateway"
let onboardingVersionKey = "ws-agent.onboardingVersion"
let onboardingSeenKey = "ws-agent.onboardingSeen"
let currentOnboardingVersion = 7
let pauseDefaultsKey = "ws-agent.pauseEnabled"
let iconAnimationsEnabledKey = "ws-agent.iconAnimationsEnabled"
let swabbleEnabledKey = "ws-agent.swabbleEnabled"
let swabbleTriggersKey = "ws-agent.swabbleTriggers"
let voiceWakeTriggerChimeKey = "ws-agent.voiceWakeTriggerChime"
let voiceWakeSendChimeKey = "ws-agent.voiceWakeSendChime"
let showDockIconKey = "ws-agent.showDockIcon"
let defaultVoiceWakeTriggers = ["ws-agent"]
let voiceWakeMaxWords = 32
let voiceWakeMaxWordLength = 64
let voiceWakeMicKey = "ws-agent.voiceWakeMicID"
let voiceWakeMicNameKey = "ws-agent.voiceWakeMicName"
let voiceWakeLocaleKey = "ws-agent.voiceWakeLocaleID"
let voiceWakeAdditionalLocalesKey = "ws-agent.voiceWakeAdditionalLocaleIDs"
let voicePushToTalkEnabledKey = "ws-agent.voicePushToTalkEnabled"
let talkEnabledKey = "ws-agent.talkEnabled"
let iconOverrideKey = "ws-agent.iconOverride"
let connectionModeKey = "ws-agent.connectionMode"
let remoteTargetKey = "ws-agent.remoteTarget"
let remoteIdentityKey = "ws-agent.remoteIdentity"
let remoteProjectRootKey = "ws-agent.remoteProjectRoot"
let remoteCliPathKey = "ws-agent.remoteCliPath"
let canvasEnabledKey = "ws-agent.canvasEnabled"
let cameraEnabledKey = "ws-agent.cameraEnabled"
let systemRunPolicyKey = "ws-agent.systemRunPolicy"
let systemRunAllowlistKey = "ws-agent.systemRunAllowlist"
let systemRunEnabledKey = "ws-agent.systemRunEnabled"
let locationModeKey = "ws-agent.locationMode"
let locationPreciseKey = "ws-agent.locationPreciseEnabled"
let peekabooBridgeEnabledKey = "ws-agent.peekabooBridgeEnabled"
let deepLinkKeyKey = "ws-agent.deepLinkKey"
let modelCatalogPathKey = "ws-agent.modelCatalogPath"
let modelCatalogReloadKey = "ws-agent.modelCatalogReload"
let cliInstallPromptedVersionKey = "ws-agent.cliInstallPromptedVersion"
let heartbeatsEnabledKey = "ws-agent.heartbeatsEnabled"
let debugPaneEnabledKey = "ws-agent.debugPaneEnabled"
let debugFileLogEnabledKey = "ws-agent.debug.fileLogEnabled"
let appLogLevelKey = "ws-agent.debug.appLogLevel"
let voiceWakeSupported: Bool = ProcessInfo.processInfo.operatingSystemVersion.majorVersion >= 26
