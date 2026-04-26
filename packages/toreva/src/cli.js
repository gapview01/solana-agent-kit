import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

const DEFAULT_GATEWAY_URL = "https://gateway.stub.toreva.dev";
const DEFAULT_MCP_HEALTH_PATH = "/mcp/health";

const CLIENT_CONFIG_PATHS = {
  "claude-desktop": path.join(
    os.homedir(),
    ".config",
    "Claude",
    "claude_desktop_config.json",
  ),
  openclaw: path.join(os.homedir(), ".config", "openclaw", "mcp.json"),
  cursor: path.join(os.homedir(), ".cursor", "mcp.json"),
};

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const flags = {};

  for (const item of rest) {
    if (!item.startsWith("--")) continue;
    const [key, ...tail] = item.slice(2).split("=");
    flags[key] = tail.length ? tail.join("=") : "true";
  }

  return { command, flags };
}

function getTokenFile(flags) {
  return flags["token-file"]
    ? path.resolve(flags["token-file"])
    : path.join(os.homedir(), ".config", "toreva", "credentials.json");
}

async function readJson(filePath, fallback = {}) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

export async function initCommand(flags) {
  const client = flags.client;
  if (!client || !CLIENT_CONFIG_PATHS[client]) {
    throw new Error(
      "Invalid --client. Use claude-desktop, openclaw, or cursor.",
    );
  }

  const configPath = flags.config
    ? path.resolve(flags.config)
    : CLIENT_CONFIG_PATHS[client];
  const gatewayUrl = flags["gateway-url"] ?? DEFAULT_GATEWAY_URL;
  const tokenFile = getTokenFile(flags);

  const current = await readJson(configPath, {});
  current.mcpServers = current.mcpServers ?? {};
  current.mcpServers.toreva = {
    command: flags["server-command"] ?? "npx",
    args: flags["server-args"]
      ? flags["server-args"].split(",")
      : ["-y", "@toreva/cdx-mcp"],
    env: {
      TOREVA_GATEWAY_URL: gatewayUrl,
      TOREVA_TOKEN_FILE: tokenFile,
    },
  };

  await writeJson(configPath, current);

  return { ok: true, client, configPath };
}

export async function loginCommand(flags, deps = { fetch: globalThis.fetch }) {
  if (!deps.fetch) {
    throw new Error("Fetch API is not available in this runtime.");
  }

  const gatewayUrl = flags["gateway-url"] ?? DEFAULT_GATEWAY_URL;
  const tokenEndpoint = flags["token-endpoint"] ?? "/auth/token";
  const tokenFile = getTokenFile(flags);

  const response = await deps.fetch(`${gatewayUrl}${tokenEndpoint}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ client: "toreva-cli", stub: true }),
  });

  if (!response.ok) {
    throw new Error(`Token flow failed with HTTP ${response.status}`);
  }

  const payload = await response.json();
  if (!payload.accessToken) {
    throw new Error("Token flow response missing accessToken");
  }

  await writeJson(tokenFile, {
    accessToken: payload.accessToken,
    tokenType: payload.tokenType ?? "Bearer",
    issuedAt: new Date().toISOString(),
    gatewayUrl,
  });

  return { ok: true, tokenFile };
}

export async function doctorCommand(flags, deps = { fetch: globalThis.fetch }) {
  const client = flags.client;
  if (!client || !CLIENT_CONFIG_PATHS[client]) {
    throw new Error(
      "Invalid --client. Use claude-desktop, openclaw, or cursor.",
    );
  }

  const configPath = flags.config
    ? path.resolve(flags.config)
    : CLIENT_CONFIG_PATHS[client];
  const tokenFile = getTokenFile(flags);
  const mcpPath = flags["mcp-health-path"] ?? DEFAULT_MCP_HEALTH_PATH;

  const config = await readJson(configPath, null);
  if (!config?.mcpServers?.toreva) {
    return { ok: false, checks: ["install:missing", "token:unknown", "mcp:skip"] };
  }

  const tokenData = await readJson(tokenFile, null);
  if (!tokenData?.accessToken) {
    return { ok: false, checks: ["install:ok", "token:missing", "mcp:skip"] };
  }

  if (!deps.fetch) {
    return { ok: false, checks: ["install:ok", "token:ok", "mcp:fetch-unavailable"] };
  }

  const gatewayUrl =
    flags["gateway-url"] ??
    config.mcpServers.toreva.env?.TOREVA_GATEWAY_URL ??
    DEFAULT_GATEWAY_URL;

  const ping = await deps.fetch(`${gatewayUrl}${mcpPath}`, {
    headers: {
      authorization: `Bearer ${tokenData.accessToken}`,
    },
  });

  if (!ping.ok) {
    return { ok: false, checks: ["install:ok", "token:ok", `mcp:error:${ping.status}`] };
  }

  return { ok: true, checks: ["install:ok", "token:ok", "mcp:ok"] };
}

function printHelp() {
  console.log(`toreva commands:
  toreva init --client=claude-desktop|openclaw|cursor [--config=...] [--gateway-url=...]
  toreva login [--gateway-url=...] [--token-endpoint=/auth/token] [--token-file=...]
  toreva doctor --client=claude-desktop|openclaw|cursor [--config=...] [--token-file=...]
`);
}

export async function runCli(argv, deps) {
  const { command, flags } = parseArgs(argv);

  try {
    if (!command || command === "--help" || command === "help" || flags.help === "true") {
      printHelp();
      return 0;
    }

    if (command === "init") {
      const result = await initCommand(flags);
      console.log(`Installed Toreva MCP connector for ${result.client} at ${result.configPath}`);
      return 0;
    }

    if (command === "login") {
      const result = await loginCommand(flags, deps);
      console.log(`Stored Toreva token in ${result.tokenFile}`);
      return 0;
    }

    if (command === "doctor") {
      const result = await doctorCommand(flags, deps);
      console.log(`Doctor checks: ${result.checks.join(", ")}`);
      return result.ok ? 0 : 1;
    }

    printHelp();
    return 1;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    return 1;
  }
}
