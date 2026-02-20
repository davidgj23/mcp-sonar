export interface SonarClientConfig {
  baseUrl: string;
  token: string;
}

export class SonarClient {
  private baseUrl: string;
  private authHeader: string;

  constructor(config: SonarClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/+$/, "");
    this.authHeader =
      "Basic " + Buffer.from(config.token + ":").toString("base64");
  }

  async issuesSearch(
    params: Record<string, string | number | undefined>,
  ): Promise<unknown> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") {
        query.set(key, String(value));
      }
    }

    const url = `${this.baseUrl}/api/issues/search?${query.toString()}`;
    const response = await fetch(url, {
      headers: { Authorization: this.authHeader },
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(
        `SonarQube API error ${response.status}: ${body}`,
      );
    }

    return response.json();
  }
}
