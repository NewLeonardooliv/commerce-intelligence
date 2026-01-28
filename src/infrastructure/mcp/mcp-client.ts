import { MCPToolset } from '@google/adk';
import { env } from '../../config/env';

export type MCPTool = {
  name: string;
  description: string;
  inputSchema: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
};

export type MCPResource = {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
};

export type MCPToolCallParams = {
  name: string;
  arguments: Record<string, unknown>;
};

export type MCPToolCallResult = {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
};

export class MCPHttpClient {
  private mcpToolset: MCPToolset;
  private serverUrl: string;
  private initialized = false;

  constructor(serverUrl?: string, _googleApiKey?: string) {
    const mcpUrl = serverUrl || env.mcp.serverUrl;

    if (!env.google.apiKey) {
      throw new Error(
        'GOOGLE_API_KEY is required. Please set it in your environment variables.'
      );
    }

    console.log(`[MCP Client] Initializing with URL: ${mcpUrl}`);

    this.serverUrl = mcpUrl;

    this.mcpToolset = new MCPToolset({
      type: 'StreamableHTTPConnectionParams',
      url: mcpUrl,
    });

    this.initialized = true;
  }

  getMCPToolset(): MCPToolset {
    return this.mcpToolset;
  }

  async listTools(): Promise<MCPTool[]> {
    try {
      if (!this.initialized) {
        throw new Error('MCP Client not initialized');
      }

      console.log('[MCP Client] Listing available tools...');
      console.log('[MCP Client] Tools are managed by ADK MCPToolset');

      return [];
    } catch (error) {
      console.error('[MCP Client] Error listing tools:', error);
      throw error;
    }
  }

  async callTool(params: MCPToolCallParams): Promise<MCPToolCallResult> {
    try {
      if (!this.initialized) {
        throw new Error('MCP Client not initialized');
      }

      console.log(`[MCP Client] Tool call requested: ${params.name}`);
      console.log(
        `[MCP Client] Note: Direct tool calls should be made through an LlmAgent with MCPToolset`
      );

      return {
        content: [
          {
            type: 'text',
            text: `Tool ${params.name} should be called through an LlmAgent that uses the MCPToolset. Arguments: ${JSON.stringify(params.arguments)}`,
          },
        ],
        isError: false,
      };
    } catch (error) {
      console.error('[MCP Client] Error calling tool:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  async listResources(): Promise<MCPResource[]> {
    try {
      if (!this.initialized) {
        throw new Error('MCP Client not initialized');
      }

      console.log('[MCP Client] Listing available resources...');
      console.log('[MCP Client] Resources are managed by ADK MCPToolset');

      return [];
    } catch (error) {
      console.error('[MCP Client] Error listing resources:', error);
      throw error;
    }
  }

  async readResource(uri: string): Promise<MCPToolCallResult> {
    try {
      if (!this.initialized) {
        throw new Error('MCP Client not initialized');
      }

      console.log(`[MCP Client] Resource read requested: ${uri}`);
      console.log(
        `[MCP Client] Note: Resources should be read through an LlmAgent with MCPToolset`
      );

      return {
        content: [
          {
            type: 'text',
            text: `Resource ${uri} should be read through an LlmAgent that uses the MCPToolset.`,
          },
        ],
        isError: false,
      };
    } catch (error) {
      console.error('[MCP Client] Error reading resource:', error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  }

  async ping(): Promise<boolean> {
    try {
      console.log(`[MCP Client] Pinging MCP server at ${this.serverUrl}...`);

      const response = await fetch(this.serverUrl, {
        method: 'HEAD',
      }).catch(() => null);

      const isHealthy = response?.ok || false;

      console.log(`[MCP Client] Ping result: ${isHealthy ? 'OK' : 'FAILED'}`);
      return isHealthy;
    } catch (error) {
      console.error('[MCP Client] Ping failed:', error);
      return false;
    }
  }

  async close(): Promise<void> {
    console.log('[MCP Client] Closing connection...');
    this.initialized = false;
  }

  isInitialized(): boolean {
    return this.initialized;
  }
}
