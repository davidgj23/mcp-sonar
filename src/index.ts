#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SonarClient } from "./sonar-client.js";
import { registerIssuesTool } from "./tools/issues.js";

const SONAR_URL = process.env.SONAR_URL;
const SONAR_TOKEN = process.env.SONAR_TOKEN;
const SONAR_PROJECT_KEY = process.env.SONAR_PROJECT_KEY;

if (!SONAR_URL || !SONAR_TOKEN) {
  console.error(
    "Missing required env vars: SONAR_URL and SONAR_TOKEN must be set.",
  );
  process.exit(1);
}

const client = new SonarClient({ baseUrl: SONAR_URL, token: SONAR_TOKEN });

const server = new McpServer({
  name: "mcp-sonar",
  version: "1.0.0",
});

registerIssuesTool(server, client, SONAR_PROJECT_KEY);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-sonar running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
