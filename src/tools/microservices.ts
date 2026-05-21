import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MicroserviceRepository } from "../microservices/repository.js";

export function registerMicroservicesTool(
  server: McpServer,
  repository: MicroserviceRepository,
) {
  server.registerTool(
    "sonar_list_microservices",
    {
      description:
        "List the microservices discovered in the configured monorepo root. Each name is also the SonarQube project key. Use this to disambiguate when a fuzzy match fails.",
      inputSchema: {},
    },
    async () => {
      const microservices = repository.list();
      return {
        content: [
          { type: "text" as const, text: JSON.stringify({ microservices }) },
        ],
      };
    },
  );
}
