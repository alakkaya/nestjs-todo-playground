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
import { TodoTools } from '../tools/todo.tools';
import { TodoService } from 'src/modules/todo/service/todo.service';

@Injectable()
export class McpServer {
  private server: Server;
  private authTools: AuthTools;
  private todoTools: TodoTools;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly todoService: TodoService,
  ) {
    this.authTools = new AuthTools(this.authService, this.userService);
    this.todoTools = new TodoTools(this.todoService);
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
        tools: [
          ...this.authTools.getToolDefinitions(),
          ...this.todoTools.getToolDefinitions(),
        ],
      };
    });

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Category-based routing
        const allTools: Array<{
          name: string;
          description: string;
          category: string;
        }> = Object.values(McpTool);
        const tool = allTools.find((t) => t.name === name);

        if (!tool) {
          throw new McpToolNotFoundException(name);
        }

        switch (tool.category) {
          case 'auth':
            return await this.authTools.handleToolCall(name, args);
          case 'todo':
            return await this.todoTools.handleToolCall(name, args);
          default:
            throw new McpCategoryNotSupportedException(tool.category);
        }
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
