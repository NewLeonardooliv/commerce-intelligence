import { MCPHttpClient, type MCPTool, type MCPResource } from './mcp-client';

export type MCPServerConfig = {
  name: string;
  url: string;
  apiKey?: string;
  enabled: boolean;
  description?: string;
};

export type MCPToolWithServer = MCPTool & {
  serverName: string;
};

export type MCPResourceWithServer = MCPResource & {
  serverName: string;
};

export class MCPService {
  private clients: Map<string, MCPHttpClient>;
  private serversConfig: MCPServerConfig[];

  constructor(serversConfig: MCPServerConfig[]) {
    this.serversConfig = serversConfig.filter((s) => s.enabled);
    this.clients = new Map();

    for (const config of this.serversConfig) {
      this.clients.set(config.name, new MCPHttpClient(config.url, config.apiKey));
    }
  }

  async listAllTools(): Promise<MCPToolWithServer[]> {
    const allTools: MCPToolWithServer[] = [];

    for (const [serverName, client] of this.clients) {
      try {
        const tools = await client.listTools();
        allTools.push(
          ...tools.map((tool) => ({
            ...tool,
            serverName,
          }))
        );
      } catch (error) {
        console.error(`[MCP Service] Failed to list tools from ${serverName}:`, error);
      }
    }

    return allTools;
  }

  async listAllResources(): Promise<MCPResourceWithServer[]> {
    const allResources: MCPResourceWithServer[] = [];

    for (const [serverName, client] of this.clients) {
      try {
        const resources = await client.listResources();
        allResources.push(
          ...resources.map((resource) => ({
            ...resource,
            serverName,
          }))
        );
      } catch (error) {
        console.error(
          `[MCP Service] Failed to list resources from ${serverName}:`,
          error
        );
      }
    }

    return allResources;
  }

  async callTool(serverName: string, toolName: string, args: Record<string, unknown>) {
    const client = this.clients.get(serverName);

    if (!client) {
      throw new Error(`MCP server "${serverName}" not found`);
    }

    return await client.callTool({
      name: toolName,
      arguments: args,
    });
  }

  async readResource(serverName: string, uri: string) {
    const client = this.clients.get(serverName);

    if (!client) {
      throw new Error(`MCP server "${serverName}" not found`);
    }

    return await client.readResource(uri);
  }

  async checkHealth(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    for (const [serverName, client] of this.clients) {
      health[serverName] = await client.ping();
    }

    return health;
  }

  getServerConfig(serverName: string): MCPServerConfig | undefined {
    return this.serversConfig.find((s) => s.name === serverName);
  }

  getServers(): MCPServerConfig[] {
    return this.serversConfig;
  }
}
