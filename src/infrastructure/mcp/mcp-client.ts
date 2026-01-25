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
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      this.headers['Authorization'] = `Bearer ${apiKey}`;
    }
  }

  async listTools(): Promise<MCPTool[]> {
    try {
      const response = await fetch(`${this.baseUrl}/tools/list`, {
        method: 'POST',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to list tools: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as { tools?: MCPTool[] };
      return data.tools || [];
    } catch (error) {
      console.error('[MCP Client] Error listing tools:', error);
      throw error;
    }
  }

  async callTool(params: MCPToolCallParams): Promise<MCPToolCallResult> {
    try {
      const response = await fetch(`${this.baseUrl}/tools/call`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Tool call failed: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`
        );
      }

      const data = (await response.json()) as MCPToolCallResult;
      return data;
    } catch (error) {
      console.error('[MCP Client] Error calling tool:', error);
      throw error;
    }
  }

  async listResources(): Promise<MCPResource[]> {
    try {
      const response = await fetch(`${this.baseUrl}/resources/list`, {
        method: 'POST',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to list resources: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as { resources?: MCPResource[] };
      return data.resources || [];
    } catch (error) {
      console.error('[MCP Client] Error listing resources:', error);
      throw error;
    }
  }

  async readResource(uri: string): Promise<MCPToolCallResult> {
    try {
      const response = await fetch(`${this.baseUrl}/resources/read`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ uri }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to read resource: ${response.status} ${response.statusText}`
        );
      }

      const data = (await response.json()) as MCPToolCallResult;
      return data;
    } catch (error) {
      console.error('[MCP Client] Error reading resource:', error);
      throw error;
    }
  }

  async ping(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.headers,
      });

      return response.ok;
    } catch (error) {
      console.error('[MCP Client] Ping failed:', error);
      return false;
    }
  }
}
