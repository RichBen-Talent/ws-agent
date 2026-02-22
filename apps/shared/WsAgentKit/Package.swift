// swift-tools-version: 6.2

import PackageDescription

let package = Package(
    name: "WsAgentKit",
    platforms: [
        .iOS(.v18),
        .macOS(.v15),
    ],
    products: [
        .library(name: "WsAgentProtocol", targets: ["WsAgentProtocol"]),
        .library(name: "WsAgentKit", targets: ["WsAgentKit"]),
        .library(name: "WsAgentChatUI", targets: ["WsAgentChatUI"]),
    ],
    dependencies: [
        .package(url: "https://github.com/steipete/ElevenLabsKit", exact: "0.1.0"),
        .package(url: "https://github.com/gonzalezreal/textual", exact: "0.3.1"),
    ],
    targets: [
        .target(
            name: "WsAgentProtocol",
            path: "Sources/WsAgentProtocol",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "WsAgentKit",
            dependencies: [
                "WsAgentProtocol",
                .product(name: "ElevenLabsKit", package: "ElevenLabsKit"),
            ],
            path: "Sources/WsAgentKit",
            resources: [
                .process("Resources"),
            ],
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .target(
            name: "WsAgentChatUI",
            dependencies: [
                "WsAgentKit",
                .product(
                    name: "Textual",
                    package: "textual",
                    condition: .when(platforms: [.macOS, .iOS])),
            ],
            path: "Sources/WsAgentChatUI",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
            ]),
        .testTarget(
            name: "WsAgentKitTests",
            dependencies: ["WsAgentKit", "WsAgentChatUI"],
            path: "Tests/WsAgentKitTests",
            swiftSettings: [
                .enableUpcomingFeature("StrictConcurrency"),
                .enableExperimentalFeature("SwiftTesting"),
            ]),
    ])
