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

type JSONRPCRequest = {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: unknown;
};

type JSONRPCResponse = {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
};

export class MCPHttpClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private sessionId?: string;
  private requestCounter = 0;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      this.headers['Authorization'] = `Bearer ${apiKey}`;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (this.sessionId) {
      return;
    }

    console.log(`[MCP Client] Initializing connection to ${this.baseUrl}`);

    const initRequest: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: ++this.requestCounter,
      method: 'initialize',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {},
          resources: {},
        },
        clientInfo: {
          name: 'commerce-intelligence',
          version: '1.0.0',
        },
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/mcp`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(initRequest),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details');
        console.error(
          `[MCP Client] Initialization failed: ${response.status} ${response.statusText}`
        );
        console.error(`[MCP Client] Error details: ${errorText}`);
        throw new Error(
          `Failed to initialize MCP at ${this.baseUrl}/mcp: ${response.status} ${response.statusText}. Is the MCP server running?`
        );
      }

      const data = (await response.json()) as JSONRPCResponse;

      if (data.error) {
        console.error('[MCP Client] Initialization error:', data.error);
        throw new Error(`MCP initialization error: ${data.error.message}`);
      }

      this.sessionId = response.headers.get('mcp-session-id') || undefined;

      if (this.sessionId) {
        this.headers['mcp-session-id'] = this.sessionId;
        console.log(`[MCP Client] Session initialized: ${this.sessionId}`);
      } else {
        console.warn('[MCP Client] No session ID received from server');
      }

      const notificationRequest: JSONRPCRequest = {
        jsonrpc: '2.0',
        id: ++this.requestCounter,
        method: 'notifications/initialized',
      };

      await fetch(`${this.baseUrl}/mcp`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(notificationRequest),
      });

      console.log('[MCP Client] Initialization complete');
    } catch (error) {
      if (error instanceof Error && error.message.includes('fetch')) {
        throw new Error(
          `Cannot connect to MCP server at ${this.baseUrl}. Please ensure the server is running.`
        );
      }
      throw error;
    }
  }

  private async sendRequest(method: string, params?: unknown): Promise<unknown> {
    await this.ensureInitialized();

    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: ++this.requestCounter,
      method,
      params,
    };

    const response = await fetch(`${this.baseUrl}/mcp`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`MCP request failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as JSONRPCResponse;

    if (data.error) {
      throw new Error(`MCP error: ${data.error.message}`);
    }

    return data.result;
  }

  async listTools(): Promise<MCPTool[]> {
    try {
      const result = await this.sendRequest('tools/list');
      const tools = (result as { tools?: MCPTool[] })?.tools || [];
      return tools;
    } catch (error) {
      console.error('[MCP Client] Error listing tools:', error);
      throw error;
    }
  }

  async callTool(params: MCPToolCallParams): Promise<MCPToolCallResult> {
    try {
      const result = await this.sendRequest('tools/call', params);

      const toolResult = result as {
        content?: Array<{
          type: 'text' | 'image' | 'resource';
          text?: string;
          data?: string;
          mimeType?: string;
        }>;
        isError?: boolean;
      };

      return {
        content: toolResult.content || [],
        isError: toolResult.isError || false,
      };
    } catch (error) {
      console.error('[MCP Client] Error calling tool:', error);
      throw error;
    }
  }

  async listResources(): Promise<MCPResource[]> {
    try {
      const result = await this.sendRequest('resources/list');
      const resources = (result as { resources?: MCPResource[] })?.resources || [];
      return resources;
    } catch (error) {
      console.error('[MCP Client] Error listing resources:', error);
      throw error;
    }
  }

  async readResource(uri: string): Promise<MCPToolCallResult> {
    try {
      const result = await this.sendRequest('resources/read', { uri });

      const resourceResult = result as {
        contents?: Array<{
          uri: string;
          mimeType?: string;
          text?: string;
        }>;
      };

      return {
        content:
          resourceResult.contents?.map((c) => ({
            type: 'text' as const,
            text: c.text,
            mimeType: c.mimeType,
          })) || [],
        isError: false,
      };
    } catch (error) {
      console.error('[MCP Client] Error reading resource:', error);
      throw error;
    }
  }

  async ping(): Promise<boolean> {
    try {
      console.log(`[MCP Client] Pinging ${this.baseUrl}/health`);
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const isOk = response.ok;
      console.log(`[MCP Client] Ping result: ${isOk ? 'OK' : 'FAILED'}`);
      return isOk;
    } catch (error) {
      console.error(`[MCP Client] Ping failed for ${this.baseUrl}:`, error);
      return false;
    }
  }

  async close(): Promise<void> {
    if (!this.sessionId) {
      return;
    }

    try {
      await fetch(`${this.baseUrl}/mcp`, {
        method: 'DELETE',
        headers: this.headers,
      });
    } catch (error) {
      console.error('[MCP Client] Error closing session:', error);
    } finally {
      this.sessionId = undefined;
      delete this.headers['mcp-session-id'];
    }
  }
}
