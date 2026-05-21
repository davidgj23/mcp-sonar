import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export interface RegisteredTool {
  name: string;
  config: { description: string; inputSchema: unknown };
  handler: (input: any) => Promise<{ content: Array<{ type: "text"; text: string }> }>;
}

export interface FakeMcpServer {
  asMcpServer: McpServer;
  registered: RegisteredTool[];
  tool(name: string): RegisteredTool;
}

export function createFakeMcpServer(): FakeMcpServer {
  const registered: RegisteredTool[] = [];

  const fake = {
    registerTool(name: string, config: any, handler: any) {
      registered.push({ name, config, handler });
    },
  };

  return {
    asMcpServer: fake as unknown as McpServer,
    registered,
    tool(name: string): RegisteredTool {
      const found = registered.find((t) => t.name === name);
      if (!found) {
        throw new Error(`Tool '${name}' was not registered`);
      }
      return found;
    },
  };
}
