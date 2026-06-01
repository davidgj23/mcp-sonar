export const DEFAULT_PROJECT_KEY_PREFIX = "NU0188001_Biometria_Facial_MR";

/**
 * Builds the SonarQube project key from a resolved monorepo folder name.
 * The folder name (e.g. "ms_antifraud") is joined to the configured prefix
 * with a single underscore, yielding e.g.
 * "NU0188001_Biometria_Facial_MR_ms_antifraud".
 */
export function buildProjectKey(prefix: string, folder: string): string {
  const trimmedPrefix = prefix.replace(/_+$/, "");
  const trimmedFolder = folder.replace(/^_+/, "");
  return trimmedPrefix ? `${trimmedPrefix}_${trimmedFolder}` : trimmedFolder;
}
