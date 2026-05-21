import { describe, expect, it, vi } from "vitest";
import { registerRulesTool } from "../../src/tools/rules.js";
import type { SonarClient } from "../../src/sonar-client.js";
import { createFakeMcpServer } from "../support/fake-mcp-server.js";

function buildClient(getImpl: SonarClient["get"]): SonarClient {
  return { get: getImpl } as unknown as SonarClient;
}

describe("registerRulesTool", () => {
  it("registers the sonar_rules tool", () => {
    const server = createFakeMcpServer();

    registerRulesTool(server.asMcpServer, buildClient(vi.fn()));

    expect(server.registered).toHaveLength(1);
    expect(server.registered[0].name).toBe("sonar_rules");
  });

  it("maps the ruleKey input to the Sonar API's rule_key parameter", async () => {
    const server = createFakeMcpServer();
    const get = vi.fn().mockResolvedValue({ rules: [] });
    registerRulesTool(server.asMcpServer, buildClient(get));

    await server.tool("sonar_rules").handler({
      ruleKey: "java:S1135",
      languages: "java",
      page: 1,
      pageSize: 100,
    });

    expect(get).toHaveBeenCalledWith("/api/rules/search", {
      activation: undefined,
      qprofile: undefined,
      languages: "java",
      severities: undefined,
      types: undefined,
      rule_key: "java:S1135",
      p: 1,
      ps: 100,
    });
  });

  it("returns the API response as JSON text", async () => {
    const server = createFakeMcpServer();
    const get = vi.fn().mockResolvedValue({ rules: [{ key: "java:S1135" }] });
    registerRulesTool(server.asMcpServer, buildClient(get));

    const response = await server.tool("sonar_rules").handler({});

    expect(JSON.parse(response.content[0].text)).toEqual({
      rules: [{ key: "java:S1135" }],
    });
  });
});
