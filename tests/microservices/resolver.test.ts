import { describe, expect, it } from "vitest";
import { MicroserviceResolver } from "../../src/microservices/resolver.js";
import type { MicroserviceRepository } from "../../src/microservices/repository.js";

function repositoryWith(folders: string[]): MicroserviceRepository {
  return { list: () => folders };
}

describe("MicroserviceResolver", () => {
  describe("exact match", () => {
    it("matches when the input equals a folder name", () => {
      const resolver = new MicroserviceResolver(
        repositoryWith(["ms_integration_gateway", "ms_payments"]),
      );

      expect(resolver.resolve("ms_integration_gateway")).toEqual({
        kind: "match",
        projectKey: "ms_integration_gateway",
      });
    });

    it("matches across separator styles (dashes vs underscores)", () => {
      const resolver = new MicroserviceResolver(
        repositoryWith(["ms_integration_gateway"]),
      );

      expect(resolver.resolve("ms-integration-gateway")).toEqual({
        kind: "match",
        projectKey: "ms_integration_gateway",
      });
    });

    it("matches case-insensitively", () => {
      const resolver = new MicroserviceResolver(
        repositoryWith(["ms_integration_gateway"]),
      );

      expect(resolver.resolve("MS_Integration_Gateway")).toEqual({
        kind: "match",
        projectKey: "ms_integration_gateway",
      });
    });
  });

  describe("fuzzy token match", () => {
    it("matches when all input tokens appear in exactly one folder", () => {
      const resolver = new MicroserviceResolver(
        repositoryWith(["ms_integration_gateway", "ms_payments"]),
      );

      expect(resolver.resolve("integration gateway")).toEqual({
        kind: "match",
        projectKey: "ms_integration_gateway",
      });
    });

    it("matches a single token against a single folder", () => {
      const resolver = new MicroserviceResolver(
        repositoryWith(["ms_integration_gateway", "ms_payments"]),
      );

      expect(resolver.resolve("payments")).toEqual({
        kind: "match",
        projectKey: "ms_payments",
      });
    });
  });

  describe("ambiguous", () => {
    it("returns all matches when more than one folder contains every token", () => {
      const resolver = new MicroserviceResolver(
        repositoryWith([
          "ms_integration_gateway",
          "ms_integration_worker",
        ]),
      );

      expect(resolver.resolve("integration")).toEqual({
        kind: "ambiguous",
        input: "integration",
        matches: ["ms_integration_gateway", "ms_integration_worker"],
      });
    });
  });

  describe("not found", () => {
    it("returns the full candidate list when no folder contains every token", () => {
      const resolver = new MicroserviceResolver(
        repositoryWith(["ms_payments", "ms_billing"]),
      );

      expect(resolver.resolve("nonexistent")).toEqual({
        kind: "not_found",
        input: "nonexistent",
        candidates: ["ms_payments", "ms_billing"],
      });
    });

    it("returns not_found for empty input", () => {
      const resolver = new MicroserviceResolver(
        repositoryWith(["ms_payments"]),
      );

      expect(resolver.resolve("")).toEqual({
        kind: "not_found",
        input: "",
        candidates: ["ms_payments"],
      });
    });

    it("returns not_found for whitespace-only input", () => {
      const resolver = new MicroserviceResolver(
        repositoryWith(["ms_payments"]),
      );

      expect(resolver.resolve("   ")).toEqual({
        kind: "not_found",
        input: "   ",
        candidates: ["ms_payments"],
      });
    });
  });
});
