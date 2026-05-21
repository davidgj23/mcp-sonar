#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SonarClient } from "./sonar-client.js";
import { MonorepoMicroserviceRepository } from "./microservices/repository.js";
import { MicroserviceResolver } from "./microservices/resolver.js";
import { registerIssuesTool } from "./tools/issues.js";
import { registerRulesTool } from "./tools/rules.js";
import { registerMicroservicesTool } from "./tools/microservices.js";

const SONAR_URL = process.env.SONAR_URL;
const SONAR_TOKEN = process.env.SONAR_TOKEN;
const MONOREPO_ROOT = process.env.MONOREPO_ROOT ?? process.cwd();

if (!SONAR_URL || !SONAR_TOKEN) {
  console.error(
    "Missing required env vars: SONAR_URL and SONAR_TOKEN must be set.",
  );
  process.exit(1);
}

const client = new SonarClient({ baseUrl: SONAR_URL, token: SONAR_TOKEN });
const repository = new MonorepoMicroserviceRepository(MONOREPO_ROOT);
const resolver = new MicroserviceResolver(repository);

const server = new McpServer({
  name: "mcp-sonar",
  version: "1.0.0",
});

registerIssuesTool(server, client, resolver);
registerRulesTool(server, client);
registerMicroservicesTool(server, repository);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`mcp-sonar running on stdio (monorepo root: ${MONOREPO_ROOT})`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
