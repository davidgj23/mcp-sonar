import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SonarClient } from "../sonar-client.js";
import type { MicroserviceResolver, ResolutionResult } from "../microservices/resolver.js";
import { buildProjectKey } from "../microservices/project-key.js";

export function registerIssuesTool(
  server: McpServer,
  client: SonarClient,
  resolver: MicroserviceResolver,
  projectKeyPrefix: string,
) {
  server.registerTool(
    "sonar_issues",
    {
      description:
        "Search SonarQube issues (bugs, vulnerabilities, code smells) for a microservice in the monorepo. The microservice name is fuzzy-matched against top-level folders; the folder name is used as the SonarQube project key. Returns raw JSON including issues[], paging, and components[].",
      inputSchema: {
        microservice: z
          .string()
          .describe(
            "Human-friendly microservice name (e.g. 'integration gateway'). Resolved to a folder/project key via fuzzy match.",
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
    async ({ microservice, branch, severities, types, statuses, page, pageSize }) => {
      const resolution = resolver.resolve(microservice);
      if (resolution.kind !== "match") {
        return textResponse(formatResolutionError(resolution));
      }

      const projectKey = buildProjectKey(projectKeyPrefix, resolution.folder);
      const issues = await client.get("/api/issues/search", {
        componentKeys: projectKey,
        branch,
        severities,
        types,
        statuses,
        p: page,
        ps: pageSize,
      });

      return textResponse(JSON.stringify(issues));
    },
  );
}

type ResolutionFailure = Exclude<ResolutionResult, { kind: "match" }>;

function formatResolutionError(resolution: ResolutionFailure): string {
  if (resolution.kind === "ambiguous") {
    return `Microservice '${resolution.input}' is ambiguous. Matches: ${resolution.matches.join(", ")}`;
  }
  return `Microservice '${resolution.input}' not found. Available: ${resolution.candidates.join(", ")}`;
}

function textResponse(text: string) {
  return { content: [{ type: "text" as const, text }] };
}
