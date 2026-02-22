// swift-tools-version: 6.2
// Package manifest for the WsAgent macOS companion (menu bar app + IPC library).

import PackageDescription

let package = Package(
    name: "WsAgent",
    platforms: [
        .macOS(.v15),
    ],
    products: [
        .library(name: "WsAgentIPC", targets: ["WsAgentIPC"]),
        .library(name: "WsAgentDiscovery", targets: ["WsAgentDiscovery"]),
        .executable(name: "WsAgent", targets: ["WsAgent"]),
        .executable(name: "ws-agent-mac", targets: ["WsAgentMacCLI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/orchetect/MenuBarExtraAccess", exact: "1.2.2"),
        .package(url: "https://github.com/swiftlang/swift-subprocess.git", from: "0.1.0"),
        .package(url: "https://github.com/apple/swift-log.git", from: "1.8.0"),
        .package(url: "https://github.com/sparkle-project/Sparkle", from: "2.8.1"),
        .package(url: "https://github.com/steipete/Peekaboo.git", branch: "main"),
        .package(path: "../shared/WsAgentKit"),
        .package(path: "../../Swabble"),
    ],
    targets: [
        .target(
            name: "WsAgentIPC",
            dependencies: [],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "WsAgentDiscovery",
            dependencies: [
                .product(name: "WsAgentKit", package: "WsAgentKit"),
            ],
            path: "Sources/WsAgentDiscovery",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "WsAgent",
            dependencies: [
                "WsAgentIPC",
                "WsAgentDiscovery",
                .product(name: "WsAgentKit", package: "WsAgentKit"),
                .product(name: "WsAgentChatUI", package: "WsAgentKit"),
                .product(name: "WsAgentProtocol", package: "WsAgentKit"),
                .product(name: "SwabbleKit", package: "swabble"),
                .product(name: "MenuBarExtraAccess", package: "MenuBarExtraAccess"),
                .product(name: "Subprocess", package: "swift-subprocess"),
                .product(name: "Logging", package: "swift-log"),
                .product(name: "Sparkle", package: "Sparkle"),
                .product(name: "PeekabooBridge", package: "Peekaboo"),
                .product(name: "PeekabooAutomationKit", package: "Peekaboo"),
            ],
            exclude: [
                "Resources/Info.plist",
            ],
            resources: [
                .copy("Resources/WsAgent.icns"),
                .copy("Resources/DeviceModels"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .executableTarget(
            name: "WsAgentMacCLI",
            dependencies: [
                "WsAgentDiscovery",
                .product(name: "WsAgentKit", package: "WsAgentKit"),
                .product(name: "WsAgentProtocol", package: "WsAgentKit"),
            ],
            path: "Sources/WsAgentMacCLI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "WsAgentIPCTests",
            dependencies: [
                "WsAgentIPC",
                "WsAgent",
                "WsAgentDiscovery",
                .product(name: "WsAgentProtocol", package: "WsAgentKit"),
                .product(name: "SwabbleKit", package: "swabble"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
