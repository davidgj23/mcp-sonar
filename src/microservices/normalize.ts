const SEPARATOR_PATTERN = /[-_\s]+/g;

export function normalizeName(value: string): string {
  return value.toLowerCase().replace(SEPARATOR_PATTERN, " ").trim();
}

export function tokenize(value: string): string[] {
  const normalized = normalizeName(value);
  return normalized.length === 0 ? [] : normalized.split(" ");
}
