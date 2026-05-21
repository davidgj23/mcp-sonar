import { describe, expect, it } from "vitest";
import { registerMicroservicesTool } from "../../src/tools/microservices.js";
import type { MicroserviceRepository } from "../../src/microservices/repository.js";
import { createFakeMcpServer } from "../support/fake-mcp-server.js";

function repositoryWith(folders: string[]): MicroserviceRepository {
  return { list: () => folders };
}

describe("registerMicroservicesTool", () => {
  it("registers the sonar_list_microservices tool", () => {
    const server = createFakeMcpServer();

    registerMicroservicesTool(server.asMcpServer, repositoryWith([]));

    expect(server.registered).toHaveLength(1);
    expect(server.registered[0].name).toBe("sonar_list_microservices");
  });

  it("returns the discovered microservices as JSON", async () => {
    const server = createFakeMcpServer();
    registerMicroservicesTool(
      server.asMcpServer,
      repositoryWith(["ms_billing", "ms_payments"]),
    );

    const response = await server.tool("sonar_list_microservices").handler({});

    expect(JSON.parse(response.content[0].text)).toEqual({
      microservices: ["ms_billing", "ms_payments"],
    });
  });

  it("returns an empty list when the monorepo has no microservices", async () => {
    const server = createFakeMcpServer();
    registerMicroservicesTool(server.asMcpServer, repositoryWith([]));

    const response = await server.tool("sonar_list_microservices").handler({});

    expect(JSON.parse(response.content[0].text)).toEqual({ microservices: [] });
  });
});
