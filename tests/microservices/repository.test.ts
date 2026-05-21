import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { MonorepoMicroserviceRepository } from "../../src/microservices/repository.js";

describe("MonorepoMicroserviceRepository", () => {
  let monorepoRoot: string;

  beforeEach(() => {
    monorepoRoot = mkdtempSync(join(tmpdir(), "mcp-sonar-repo-"));
  });

  afterEach(() => {
    rmSync(monorepoRoot, { recursive: true, force: true });
  });

  it("returns top-level directories sorted alphabetically", () => {
    mkdirSync(join(monorepoRoot, "ms_payments"));
    mkdirSync(join(monorepoRoot, "ms_billing"));
    mkdirSync(join(monorepoRoot, "ms_integration_gateway"));

    const repository = new MonorepoMicroserviceRepository(monorepoRoot);

    expect(repository.list()).toEqual([
      "ms_billing",
      "ms_integration_gateway",
      "ms_payments",
    ]);
  });

  it("excludes files at the top level", () => {
    mkdirSync(join(monorepoRoot, "ms_payments"));
    writeFileSync(join(monorepoRoot, "README.md"), "");

    const repository = new MonorepoMicroserviceRepository(monorepoRoot);

    expect(repository.list()).toEqual(["ms_payments"]);
  });

  it("excludes hidden directories", () => {
    mkdirSync(join(monorepoRoot, "ms_payments"));
    mkdirSync(join(monorepoRoot, ".git"));
    mkdirSync(join(monorepoRoot, ".cache"));

    const repository = new MonorepoMicroserviceRepository(monorepoRoot);

    expect(repository.list()).toEqual(["ms_payments"]);
  });

  it("returns an empty array when the monorepo has no folders", () => {
    const repository = new MonorepoMicroserviceRepository(monorepoRoot);

    expect(repository.list()).toEqual([]);
  });
});
