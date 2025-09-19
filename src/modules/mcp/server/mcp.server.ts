import { Injectable } from '@nestjs/common';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { AuthService } from '../../auth/service/auth.service';
import { AuthTools } from '../tools/auth.tools';
import { UserService } from 'src/modules/user/service/user.service';
import { McpTool } from 'src/core/interface/mcp/mcp-tool.const';
import { McpToolNotFoundException } from 'src/core/error/exception/mcp-tool-not-found.exception';
import { McpCategoryNotSupportedException } from 'src/core/error/exception/mcp-category-not-supported.exception';

@Injectable()
export class McpServer {
  private server: Server;
  private authTools: AuthTools;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {
    this.authTools = new AuthTools(this.authService, this.userService);
    this.initializeServer();
  }

  private initializeServer() {
    this.server = new Server(
      {
        name: 'nestjs-todo-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      },
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [...this.authTools.getToolDefinitions()],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Category-based routing
        const allTools = Object.values(McpTool);
        const tool = allTools.find((t) => t.name === name);

        if (!tool) {
          throw new McpToolNotFoundException(name);
        }

        if (tool.category === 'auth') {
          return await this.authTools.handleToolCall(name, args);
        }

        throw new McpCategoryNotSupportedException(tool.category);
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
