import { describe, expect, it } from "vitest";
import { normalizeName, tokenize } from "../../src/microservices/normalize.js";

describe("normalizeName", () => {
  it("lowercases the input", () => {
    expect(normalizeName("Integration")).toBe("integration");
  });

  it("collapses dashes, underscores, and whitespace into single spaces", () => {
    expect(normalizeName("ms_integration-gateway")).toBe("ms integration gateway");
    expect(normalizeName("ms__integration--gateway")).toBe("ms integration gateway");
    expect(normalizeName("ms integration   gateway")).toBe("ms integration gateway");
  });

  it("trims leading and trailing whitespace", () => {
    expect(normalizeName("  ms_gateway  ")).toBe("ms gateway");
  });

  it("returns an empty string for whitespace-only input", () => {
    expect(normalizeName("   ")).toBe("");
  });
});

describe("tokenize", () => {
  it("splits a normalized name into tokens", () => {
    expect(tokenize("ms-integration_gateway")).toEqual([
      "ms",
      "integration",
      "gateway",
    ]);
  });

  it("returns an empty array for empty input", () => {
    expect(tokenize("")).toEqual([]);
    expect(tokenize("   ")).toEqual([]);
  });

  it("preserves token order from the original string", () => {
    expect(tokenize("gateway integration ms")).toEqual([
      "gateway",
      "integration",
      "ms",
    ]);
  });
});
