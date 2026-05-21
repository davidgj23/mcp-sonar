import { readdirSync } from "node:fs";

export interface MicroserviceRepository {
  list(): string[];
}

export class MonorepoMicroserviceRepository implements MicroserviceRepository {
  constructor(private readonly monorepoRoot: string) {}

  list(): string[] {
    const entries = readdirSync(this.monorepoRoot, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
      .map((entry) => entry.name)
      .sort();
  }
}
