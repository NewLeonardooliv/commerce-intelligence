import type { MCPServerConfig } from '../infrastructure/mcp/mcp-service';

export function loadMCPConfig(): MCPServerConfig[] {
  const servers: MCPServerConfig[] = [];

  console.log('MCP_SERVER_1_URL', process.env.MCP_SERVER_1_URL);

  if (process.env.MCP_SERVER_1_URL) {
    servers.push({
      name: process.env.MCP_SERVER_1_NAME || 'mcp-server-1',
      url: process.env.MCP_SERVER_1_URL,
      apiKey: process.env.MCP_SERVER_1_API_KEY,
      enabled: process.env.MCP_SERVER_1_ENABLED !== 'false',
      description: process.env.MCP_SERVER_1_DESCRIPTION,
    });
  }

  if (process.env.MCP_SERVER_2_URL) {
    servers.push({
      name: process.env.MCP_SERVER_2_NAME || 'mcp-server-2',
      url: process.env.MCP_SERVER_2_URL,
      apiKey: process.env.MCP_SERVER_2_API_KEY,
      enabled: process.env.MCP_SERVER_2_ENABLED !== 'false',
      description: process.env.MCP_SERVER_2_DESCRIPTION,
    });
  }

  if (process.env.MCP_SERVER_3_URL) {
    servers.push({
      name: process.env.MCP_SERVER_3_NAME || 'mcp-server-3',
      url: process.env.MCP_SERVER_3_URL,
      apiKey: process.env.MCP_SERVER_3_API_KEY,
      enabled: process.env.MCP_SERVER_3_ENABLED !== 'false',
      description: process.env.MCP_SERVER_3_DESCRIPTION,
    });
  }

  return servers;
}

export const manualMCPConfig: MCPServerConfig[] = [];

export const isMCPEnabled = (): boolean => {
  return process.env.ENABLE_MCP === 'true';
};
