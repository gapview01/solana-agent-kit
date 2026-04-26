import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { doctorCommand, initCommand, loginCommand } from "../src/cli.js";

async function mkTmpDir() {
  return fs.mkdtemp(path.join(os.tmpdir(), "toreva-cli-"));
}

test("init writes Toreva MCP config for requested client", async () => {
  const dir = await mkTmpDir();
  const configPath = path.join(dir, "claude.json");

  const result = await initCommand({
    client: "claude-desktop",
    config: configPath,
    "token-file": path.join(dir, "token.json"),
    "gateway-url": "https://gateway.example",
  });

  assert.equal(result.ok, true);
  const json = JSON.parse(await fs.readFile(configPath, "utf8"));
  assert.equal(json.mcpServers.toreva.command, "npx");
  assert.deepEqual(json.mcpServers.toreva.args, ["-y", "@toreva/cdx-mcp"]);
  assert.equal(
    json.mcpServers.toreva.env.TOREVA_GATEWAY_URL,
    "https://gateway.example",
  );
});

test("login persists access token from mocked gateway flow", async () => {
  const dir = await mkTmpDir();
  const tokenFile = path.join(dir, "credentials.json");

  const result = await loginCommand(
    {
      "gateway-url": "https://gateway.example",
      "token-endpoint": "/auth/token",
      "token-file": tokenFile,
    },
    {
      fetch: async (url) => {
        assert.equal(url, "https://gateway.example/auth/token");
        return {
          ok: true,
          status: 200,
          json: async () => ({ accessToken: "tok_test_123", tokenType: "Bearer" }),
        };
      },
    },
  );

  assert.equal(result.ok, true);
  const stored = JSON.parse(await fs.readFile(tokenFile, "utf8"));
  assert.equal(stored.accessToken, "tok_test_123");
});

test("doctor reports OK and error states", async () => {
  const dir = await mkTmpDir();
  const configPath = path.join(dir, "cursor.json");
  const tokenFile = path.join(dir, "token.json");

  await initCommand({ client: "cursor", config: configPath, "token-file": tokenFile });
  await fs.writeFile(tokenFile, JSON.stringify({ accessToken: "tok_good" }));

  const okResult = await doctorCommand(
    {
      client: "cursor",
      config: configPath,
      "token-file": tokenFile,
      "gateway-url": "https://gateway.example",
    },
    {
      fetch: async () => ({ ok: true, status: 200 }),
    },
  );

  assert.equal(okResult.ok, true);
  assert.deepEqual(okResult.checks, ["install:ok", "token:ok", "mcp:ok"]);

  const errResult = await doctorCommand(
    {
      client: "cursor",
      config: configPath,
      "token-file": tokenFile,
      "gateway-url": "https://gateway.example",
    },
    {
      fetch: async () => ({ ok: false, status: 401 }),
    },
  );

  assert.equal(errResult.ok, false);
  assert.deepEqual(errResult.checks, ["install:ok", "token:ok", "mcp:error:401"]);
});
