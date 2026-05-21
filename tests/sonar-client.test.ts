import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SonarClient } from "../src/sonar-client.js";

const ORIGINAL_FETCH = globalThis.fetch;

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });
}

function expectedAuthHeader(token: string): string {
  return "Basic " + Buffer.from(token + ":").toString("base64");
}

describe("SonarClient", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = ORIGINAL_FETCH;
  });

  it("sends a GET request with the basic auth header derived from the token", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    const client = new SonarClient({
      baseUrl: "https://sonar.example.com",
      token: "squ_xxx",
    });

    await client.get("/api/issues/search", { componentKeys: "ms_payments" });

    const [, init] = fetchMock.mock.calls[0];
    expect(init.headers.Authorization).toBe(expectedAuthHeader("squ_xxx"));
  });

  it("builds the URL with provided query parameters", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    const client = new SonarClient({
      baseUrl: "https://sonar.example.com",
      token: "t",
    });

    await client.get("/api/issues/search", {
      componentKeys: "ms_payments",
      ps: 10,
    });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://sonar.example.com/api/issues/search?componentKeys=ms_payments&ps=10",
    );
  });

  it("omits undefined and empty-string parameters from the URL", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    const client = new SonarClient({
      baseUrl: "https://sonar.example.com",
      token: "t",
    });

    await client.get("/api/issues/search", {
      componentKeys: "ms_payments",
      branch: undefined,
      severities: "",
    });

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(
      "https://sonar.example.com/api/issues/search?componentKeys=ms_payments",
    );
  });

  it("strips trailing slashes from the base URL", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ ok: true }));
    const client = new SonarClient({
      baseUrl: "https://sonar.example.com///",
      token: "t",
    });

    await client.get("/api/issues/search", { componentKeys: "x" });

    const [url] = fetchMock.mock.calls[0];
    expect(url.startsWith("https://sonar.example.com/api/issues/search")).toBe(
      true,
    );
  });

  it("returns the parsed JSON body on a successful response", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ issues: [{ key: "1" }] }));
    const client = new SonarClient({
      baseUrl: "https://sonar.example.com",
      token: "t",
    });

    const result = await client.get("/api/issues/search", {});

    expect(result).toEqual({ issues: [{ key: "1" }] });
  });

  it("throws including status and body when the response is not ok", async () => {
    fetchMock.mockResolvedValue(
      new Response("Forbidden", { status: 403 }),
    );
    const client = new SonarClient({
      baseUrl: "https://sonar.example.com",
      token: "t",
    });

    await expect(client.get("/api/issues/search", {})).rejects.toThrow(
      /403.*Forbidden/,
    );
  });
});
