# mcp-sonar

MCP server that wraps the SonarQube Web API for issue retrieval. Connects to any SonarQube instance and exposes a `sonar_issues` tool over the Model Context Protocol (stdio transport).

## Prerequisites

- Node.js 18+
- A SonarQube instance with an access token

## Setup

```bash
npm install
npm run build
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `SONAR_URL` | Yes | Base URL of your SonarQube instance (e.g. `https://sonar.example.com`) |
| `SONAR_TOKEN` | Yes | SonarQube authentication token |
| `SONAR_PROJECT_KEY` | No | Default project key used when not provided per-request |

## Running

```bash
SONAR_URL=https://sonar.example.com SONAR_TOKEN=squ_xxx npm start
```

## MCP Client Configuration

Add to your MCP client config (e.g. Claude Desktop `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "sonar": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-sonar/build/index.js"],
      "env": {
        "SONAR_URL": "https://sonar.example.com",
        "SONAR_TOKEN": "squ_xxx",
        "SONAR_PROJECT_KEY": "my-project"
      }
    }
  }
}
```

## Available Tools

### `sonar_issues`

Search SonarQube issues (bugs, vulnerabilities, code smells) for a project.

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `projectKey` | string | SonarQube project key (falls back to `SONAR_PROJECT_KEY`) |
| `branch` | string | Branch name filter |
| `severities` | string | Comma-separated: `BLOCKER,CRITICAL,MAJOR,MINOR,INFO` |
| `types` | string | Comma-separated: `BUG,VULNERABILITY,CODE_SMELL` |
| `statuses` | string | Comma-separated: `OPEN,CONFIRMED,REOPENED` |
| `page` | number | Page number (default 1) |
| `pageSize` | number | Results per page, max 500 (default 100) |
