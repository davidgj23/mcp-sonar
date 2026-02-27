import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SonarClient } from "../sonar-client.js";

export function registerIssuesTool(
  server: McpServer,
  client: SonarClient,
  defaultProjectKey?: string,
) {
  server.registerTool(
    "sonar_issues",
    {
      description:
        "Search SonarQube issues (bugs, vulnerabilities, code smells) for a project. Returns raw JSON from the SonarQube API including issues[], paging, and components[].",
      inputSchema: {
        projectKey: z
          .string()
          .optional()
          .describe(
            "SonarQube project key. Defaults to SONAR_PROJECT_KEY env var if not provided.",
          ),
        branch: z
          .string()
          .optional()
          .describe("Branch name to filter issues by."),
        severities: z
          .string()
          .optional()
          .describe(
            "Comma-separated severities: BLOCKER,CRITICAL,MAJOR,MINOR,INFO",
          ),
        types: z
          .string()
          .optional()
          .describe(
            "Comma-separated types: BUG,VULNERABILITY,CODE_SMELL",
          ),
        statuses: z
          .string()
          .optional()
          .describe(
            "Comma-separated statuses: OPEN,CONFIRMED,REOPENED",
          ),
        page: z.number().optional().describe("Page number (default 1)."),
        pageSize: z
          .number()
          .optional()
          .describe("Results per page, max 500 (default 100)."),
      },
    },
    async ({ projectKey, branch, severities, types, statuses, page, pageSize }) => {
      const resolvedKey = projectKey || defaultProjectKey;
      if (!resolvedKey) {
        return {
          content: [
            {
              type: "text" as const,
              text: "Error: projectKey is required. Provide it as a parameter or set SONAR_PROJECT_KEY env var.",
            },
          ],
        };
      }

      const result = await client.get("/api/issues/search", {
        componentKeys: resolvedKey,
        branch,
        severities,
        types,
        statuses,
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
