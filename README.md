# mcp-sonar

MCP server that wraps the SonarQube Web API for issue retrieval. Connects to any SonarQube instance and exposes `sonar_issues`, `sonar_rules`, and `sonar_list_microservices` tools over the Model Context Protocol (stdio transport).

The server is designed for monorepos: you reference a microservice by its human-friendly name (e.g. `"integration gateway"`), and the server resolves it to the matching top-level folder in the monorepo. The folder name is used directly as the SonarQube project key.

## Prerequisites

- Node.js 18+
- A SonarQube instance with an access token
- A monorepo whose top-level folder names match your SonarQube project keys

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
| `MONOREPO_ROOT` | No | Path to the monorepo root used to discover microservices. Defaults to `process.cwd()` (the directory where the server is launched). |

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
        "MONOREPO_ROOT": "/absolute/path/to/monorepo"
      }
    }
  }
}
```

## Available Tools

### `sonar_issues`

Search SonarQube issues for a microservice in the monorepo. The `microservice` parameter is fuzzy-matched against top-level folder names; the resolved folder name becomes the SonarQube project key.

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `microservice` | string | Human-friendly microservice name (e.g. `"integration gateway"` resolves to folder `ms_integration_gateway`) |
| `branch` | string | Branch name filter |
| `severities` | string | Comma-separated: `BLOCKER,CRITICAL,MAJOR,MINOR,INFO` |
| `types` | string | Comma-separated: `BUG,VULNERABILITY,CODE_SMELL` |
| `statuses` | string | Comma-separated: `OPEN,CONFIRMED,REOPENED` |
| `page` | number | Page number (default 1) |
| `pageSize` | number | Results per page, max 500 (default 100) |

### `sonar_list_microservices`

Lists the microservices (top-level folders) discovered under `MONOREPO_ROOT`. Useful when a fuzzy match is ambiguous or fails.

### `sonar_rules`

Search SonarQube rules (coding standards). See `src/tools/rules.ts` for the full parameter list.
