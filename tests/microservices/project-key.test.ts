import { describe, expect, it } from "vitest";
import {
  DEFAULT_PROJECT_KEY_PREFIX,
  buildProjectKey,
} from "../../src/microservices/project-key.js";

describe("buildProjectKey", () => {
  it("joins the prefix and folder with a single underscore", () => {
    expect(buildProjectKey(DEFAULT_PROJECT_KEY_PREFIX, "ms_antifraud")).toBe(
      "NU0188001_Biometria_Facial_MR_ms_antifraud",
    );
  });

  it("does not duplicate underscores when the prefix already ends with one", () => {
    expect(buildProjectKey("NU0188001_Biometria_Facial_MR_", "ms_antifraud")).toBe(
      "NU0188001_Biometria_Facial_MR_ms_antifraud",
    );
  });

  it("returns the bare folder when the prefix is empty", () => {
    expect(buildProjectKey("", "ms_antifraud")).toBe("ms_antifraud");
  });
});
