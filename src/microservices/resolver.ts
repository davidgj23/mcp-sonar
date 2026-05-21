import { normalizeName, tokenize } from "./normalize.js";
import type { MicroserviceRepository } from "./repository.js";

export type ResolutionResult =
  | { kind: "match"; projectKey: string }
  | { kind: "ambiguous"; input: string; matches: string[] }
  | { kind: "not_found"; input: string; candidates: string[] };

export class MicroserviceResolver {
  constructor(private readonly repository: MicroserviceRepository) {}

  resolve(input: string): ResolutionResult {
    const candidates = this.repository.list();
    const exactMatch = findExactMatch(input, candidates);
    if (exactMatch) {
      return { kind: "match", projectKey: exactMatch };
    }

    const tokens = tokenize(input);
    if (tokens.length === 0) {
      return { kind: "not_found", input, candidates };
    }

    const tokenMatches = findTokenMatches(tokens, candidates);
    if (tokenMatches.length === 1) {
      return { kind: "match", projectKey: tokenMatches[0] };
    }
    if (tokenMatches.length > 1) {
      return { kind: "ambiguous", input, matches: tokenMatches };
    }
    return { kind: "not_found", input, candidates };
  }
}

function findExactMatch(input: string, candidates: string[]): string | undefined {
  const normalizedInput = normalizeName(input);
  return candidates.find((name) => normalizeName(name) === normalizedInput);
}

function findTokenMatches(tokens: string[], candidates: string[]): string[] {
  return candidates.filter((name) => {
    const normalized = normalizeName(name);
    return tokens.every((token) => normalized.includes(token));
  });
}
