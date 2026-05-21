import { describe, expect, it, vi } from "vitest";
import { registerIssuesTool } from "../../src/tools/issues.js";
import { MicroserviceResolver } from "../../src/microservices/resolver.js";
import type { MicroserviceRepository } from "../../src/microservices/repository.js";
import type { SonarClient } from "../../src/sonar-client.js";
import { createFakeMcpServer } from "../support/fake-mcp-server.js";

function buildResolver(folders: string[]): MicroserviceResolver {
  const repository: MicroserviceRepository = { list: () => folders };
  return new MicroserviceResolver(repository);
}

function buildClient(getImpl: SonarClient["get"]): SonarClient {
  return { get: getImpl } as unknown as SonarClient;
}

function textOf(response: { content: Array<{ type: "text"; text: string }> }): string {
  return response.content[0].text;
}

describe("registerIssuesTool", () => {
  it("registers the sonar_issues tool", () => {
    const server = createFakeMcpServer();
    const client = buildClient(vi.fn());

    registerIssuesTool(server.asMcpServer, client, buildResolver([]));

    expect(server.registered).toHaveLength(1);
    expect(server.registered[0].name).toBe("sonar_issues");
  });

  it("forwards the resolved project key as componentKeys to the Sonar API", async () => {
    const server = createFakeMcpServer();
    const get = vi.fn().mockResolvedValue({ issues: [] });
    registerIssuesTool(
      server.asMcpServer,
      buildClient(get),
      buildResolver(["ms_integration_gateway"]),
    );

    const response = await server.tool("sonar_issues").handler({
      microservice: "integration gateway",
      severities: "BLOCKER",
      page: 2,
      pageSize: 50,
    });

    expect(get).toHaveBeenCalledWith("/api/issues/search", {
      componentKeys: "ms_integration_gateway",
      branch: undefined,
      severities: "BLOCKER",
      types: undefined,
      statuses: undefined,
      p: 2,
      ps: 50,
    });
    expect(JSON.parse(textOf(response))).toEqual({ issues: [] });
  });

  it("does not call the Sonar API when the microservice cannot be resolved", async () => {
    const server = createFakeMcpServer();
    const get = vi.fn();
    registerIssuesTool(
      server.asMcpServer,
      buildClient(get),
      buildResolver(["ms_payments", "ms_billing"]),
    );

    const response = await server.tool("sonar_issues").handler({
      microservice: "nonexistent",
    });

    expect(get).not.toHaveBeenCalled();
    expect(textOf(response)).toContain("not found");
    expect(textOf(response)).toContain("ms_payments");
    expect(textOf(response)).toContain("ms_billing");
  });

  it("returns an ambiguity message listing every candidate match", async () => {
    const server = createFakeMcpServer();
    const get = vi.fn();
    registerIssuesTool(
      server.asMcpServer,
      buildClient(get),
      buildResolver(["ms_integration_gateway", "ms_integration_worker"]),
    );

    const response = await server.tool("sonar_issues").handler({
      microservice: "integration",
    });

    expect(get).not.toHaveBeenCalled();
    expect(textOf(response)).toContain("ambiguous");
    expect(textOf(response)).toContain("ms_integration_gateway");
    expect(textOf(response)).toContain("ms_integration_worker");
  });
});
