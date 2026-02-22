import { describe, expect, it } from "vitest";
import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it.each([
    {
      name: "help flag",
      argv: ["node", "ws-agent", "--help"],
      expected: true,
    },
    {
      name: "version flag",
      argv: ["node", "ws-agent", "-V"],
      expected: true,
    },
    {
      name: "normal command",
      argv: ["node", "ws-agent", "status"],
      expected: false,
    },
    {
      name: "root -v alias",
      argv: ["node", "ws-agent", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with profile",
      argv: ["node", "ws-agent", "--profile", "work", "-v"],
      expected: true,
    },
    {
      name: "root -v alias with log-level",
      argv: ["node", "ws-agent", "--log-level", "debug", "-v"],
      expected: true,
    },
    {
      name: "subcommand -v should not be treated as version",
      argv: ["node", "ws-agent", "acp", "-v"],
      expected: false,
    },
    {
      name: "root -v alias with equals profile",
      argv: ["node", "ws-agent", "--profile=work", "-v"],
      expected: true,
    },
    {
      name: "subcommand path after global root flags should not be treated as version",
      argv: ["node", "ws-agent", "--dev", "skills", "list", "-v"],
      expected: false,
    },
  ])("detects help/version flags: $name", ({ argv, expected }) => {
    expect(hasHelpOrVersion(argv)).toBe(expected);
  });

  it.each([
    {
      name: "single command with trailing flag",
      argv: ["node", "ws-agent", "status", "--json"],
      expected: ["status"],
    },
    {
      name: "two-part command",
      argv: ["node", "ws-agent", "agents", "list"],
      expected: ["agents", "list"],
    },
    {
      name: "terminator cuts parsing",
      argv: ["node", "ws-agent", "status", "--", "ignored"],
      expected: ["status"],
    },
  ])("extracts command path: $name", ({ argv, expected }) => {
    expect(getCommandPath(argv, 2)).toEqual(expected);
  });

  it.each([
    {
      name: "returns first command token",
      argv: ["node", "ws-agent", "agents", "list"],
      expected: "agents",
    },
    {
      name: "returns null when no command exists",
      argv: ["node", "ws-agent"],
      expected: null,
    },
  ])("returns primary command: $name", ({ argv, expected }) => {
    expect(getPrimaryCommand(argv)).toBe(expected);
  });

  it.each([
    {
      name: "detects flag before terminator",
      argv: ["node", "ws-agent", "status", "--json"],
      flag: "--json",
      expected: true,
    },
    {
      name: "ignores flag after terminator",
      argv: ["node", "ws-agent", "--", "--json"],
      flag: "--json",
      expected: false,
    },
  ])("parses boolean flags: $name", ({ argv, flag, expected }) => {
    expect(hasFlag(argv, flag)).toBe(expected);
  });

  it.each([
    {
      name: "value in next token",
      argv: ["node", "ws-agent", "status", "--timeout", "5000"],
      expected: "5000",
    },
    {
      name: "value in equals form",
      argv: ["node", "ws-agent", "status", "--timeout=2500"],
      expected: "2500",
    },
    {
      name: "missing value",
      argv: ["node", "ws-agent", "status", "--timeout"],
      expected: null,
    },
    {
      name: "next token is another flag",
      argv: ["node", "ws-agent", "status", "--timeout", "--json"],
      expected: null,
    },
    {
      name: "flag appears after terminator",
      argv: ["node", "ws-agent", "--", "--timeout=99"],
      expected: undefined,
    },
  ])("extracts flag values: $name", ({ argv, expected }) => {
    expect(getFlagValue(argv, "--timeout")).toBe(expected);
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "ws-agent", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "ws-agent", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "ws-agent", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it.each([
    {
      name: "missing flag",
      argv: ["node", "ws-agent", "status"],
      expected: undefined,
    },
    {
      name: "missing value",
      argv: ["node", "ws-agent", "status", "--timeout"],
      expected: null,
    },
    {
      name: "valid positive integer",
      argv: ["node", "ws-agent", "status", "--timeout", "5000"],
      expected: 5000,
    },
    {
      name: "invalid integer",
      argv: ["node", "ws-agent", "status", "--timeout", "nope"],
      expected: undefined,
    },
  ])("parses positive integer flag values: $name", ({ argv, expected }) => {
    expect(getPositiveIntFlagValue(argv, "--timeout")).toBe(expected);
  });

  it("builds parse argv from raw args", () => {
    const cases = [
      {
        rawArgs: ["node", "ws-agent", "status"],
        expected: ["node", "ws-agent", "status"],
      },
      {
        rawArgs: ["node-22", "ws-agent", "status"],
        expected: ["node-22", "ws-agent", "status"],
      },
      {
        rawArgs: ["node-22.2.0.exe", "ws-agent", "status"],
        expected: ["node-22.2.0.exe", "ws-agent", "status"],
      },
      {
        rawArgs: ["node-22.2", "ws-agent", "status"],
        expected: ["node-22.2", "ws-agent", "status"],
      },
      {
        rawArgs: ["node-22.2.exe", "ws-agent", "status"],
        expected: ["node-22.2.exe", "ws-agent", "status"],
      },
      {
        rawArgs: ["/usr/bin/node-22.2.0", "ws-agent", "status"],
        expected: ["/usr/bin/node-22.2.0", "ws-agent", "status"],
      },
      {
        rawArgs: ["nodejs", "ws-agent", "status"],
        expected: ["nodejs", "ws-agent", "status"],
      },
      {
        rawArgs: ["node-dev", "ws-agent", "status"],
        expected: ["node", "ws-agent", "node-dev", "ws-agent", "status"],
      },
      {
        rawArgs: ["ws-agent", "status"],
        expected: ["node", "ws-agent", "status"],
      },
      {
        rawArgs: ["bun", "src/entry.ts", "status"],
        expected: ["bun", "src/entry.ts", "status"],
      },
    ] as const;

    for (const testCase of cases) {
      const parsed = buildParseArgv({
        programName: "ws-agent",
        rawArgs: [...testCase.rawArgs],
      });
      expect(parsed).toEqual([...testCase.expected]);
    }
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "ws-agent",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "ws-agent", "status"]);
  });

  it("decides when to migrate state", () => {
    const nonMutatingArgv = [
      ["node", "ws-agent", "status"],
      ["node", "ws-agent", "health"],
      ["node", "ws-agent", "sessions"],
      ["node", "ws-agent", "config", "get", "update"],
      ["node", "ws-agent", "config", "unset", "update"],
      ["node", "ws-agent", "models", "list"],
      ["node", "ws-agent", "models", "status"],
      ["node", "ws-agent", "memory", "status"],
      ["node", "ws-agent", "agent", "--message", "hi"],
    ] as const;
    const mutatingArgv = [
      ["node", "ws-agent", "agents", "list"],
      ["node", "ws-agent", "message", "send"],
    ] as const;

    for (const argv of nonMutatingArgv) {
      expect(shouldMigrateState([...argv])).toBe(false);
    }
    for (const argv of mutatingArgv) {
      expect(shouldMigrateState([...argv])).toBe(true);
    }
  });

  it.each([
    { path: ["status"], expected: false },
    { path: ["config", "get"], expected: false },
    { path: ["models", "status"], expected: false },
    { path: ["agents", "list"], expected: true },
  ])("reuses command path for migrate state decisions: $path", ({ path, expected }) => {
    expect(shouldMigrateStateFromPath(path)).toBe(expected);
  });
});
