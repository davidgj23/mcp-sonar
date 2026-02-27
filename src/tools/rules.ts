import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SonarClient } from "../sonar-client.js";

export function registerRulesTool(server: McpServer, client: SonarClient) {
  server.registerTool(
    "sonar_rules",
    {
      description:
        "Search SonarQube rules (coding standards configured for the project). Returns raw JSON including rules[], paging, and facets. Useful to understand what rules are active and their descriptions.",
      inputSchema: {
        activation: z
          .boolean()
          .optional()
          .describe("Filter on active rules only (true) or inactive only (false)."),
        qprofile: z
          .string()
          .optional()
          .describe("Quality profile key to filter rules by."),
        languages: z
          .string()
          .optional()
          .describe("Comma-separated language keys: java,js,ts,xml,etc."),
        severities: z
          .string()
          .optional()
          .describe("Comma-separated severities: BLOCKER,CRITICAL,MAJOR,MINOR,INFO"),
        types: z
          .string()
          .optional()
          .describe("Comma-separated types: BUG,VULNERABILITY,CODE_SMELL"),
        ruleKey: z
          .string()
          .optional()
          .describe("Specific rule key to look up (e.g. java:S1135)."),
        page: z.number().optional().describe("Page number (default 1)."),
        pageSize: z
          .number()
          .optional()
          .describe("Results per page, max 500 (default 100)."),
      },
    },
    async ({ activation, qprofile, languages, severities, types, ruleKey, page, pageSize }) => {
      const result = await client.get("/api/rules/search", {
        activation,
        qprofile,
        languages,
        severities,
        types,
        rule_key: ruleKey,
        p: page,
        ps: pageSize,
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(result),
          },
        ],
      };
    },
  );
}
