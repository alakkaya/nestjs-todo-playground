import { McpTool } from 'src/core/interface';
import { McpToolNotFoundException } from 'src/core/error/exception/mcp-tool-not-found.exception';
import { formatMcpToolResponse } from 'src/core/helper';
import { TodoService } from 'src/modules/todo/service';
import { TodoSchemas } from '../schemas';

export class TodoTools {
  constructor(private readonly todoService: TodoService) {}

  getToolDefinitions() {
    return [
      {
        name: McpTool.TODO_CREATE.name,
        description: McpTool.TODO_CREATE.description,
        inputSchema: TodoSchemas.create,
      },
      {
        name: McpTool.TODO_GET.name,
        description: McpTool.TODO_GET.description,
        inputSchema: TodoSchemas.get,
      },
      {
        name: McpTool.TODO_UPDATE.name,
        description: McpTool.TODO_UPDATE.description,
        inputSchema: TodoSchemas.update,
      },
      {
        name: McpTool.TODO_DELETE.name,
        description: McpTool.TODO_DELETE.description,
        inputSchema: TodoSchemas.delete,
      },
      {
        name: McpTool.TODO_CANCEL_DELETION.name,
        description: McpTool.TODO_CANCEL_DELETION.description,
        inputSchema: TodoSchemas.cancelDeletion,
      },
    ] as const;
  }

  async handleToolCall(toolName: string, args: any) {
    switch (toolName) {
      case McpTool.TODO_CREATE.name:
        return await this.create(args);
      case McpTool.TODO_GET.name:
        return await this.get(args);
      case McpTool.TODO_UPDATE.name:
        return await this.update(args);
      case McpTool.TODO_DELETE.name:
        return await this.delete(args);
      case McpTool.TODO_CANCEL_DELETION.name:
        return await this.cancelDeletion(args);
      default:
        throw new McpToolNotFoundException(toolName);
    }
  }

  private async create(args: any) {
    const createTodoDto = {
      title: args.title,
      description: args.description,
    };

    const result = await this.todoService.create(createTodoDto, args.userId);
    return formatMcpToolResponse('Todo created successfully', result);
  }

  private async get(args: any) {
    const getTodoDto = {
      page: args.page,
      limit: args.limit,
      completed: args.completed,
    };

    const result = await this.todoService.findByUserId(args.userId, getTodoDto);
    return formatMcpToolResponse('Todos retrieved successfully', result);
  }

  private async update(args: any) {
    const updateTodoDto = {
      title: args.title,
      description: args.description,
      completed: args.completed,
    };

    const result = await this.todoService.update(
      args.todoId,
      args.userId,
      updateTodoDto,
    );
    return formatMcpToolResponse('Todo updated successfully', result);
  }

  private async delete(args: any) {
    const result = await this.todoService.delete(args.todoId, args.userId);
    return formatMcpToolResponse('Todo deletion scheduled', result);
  }

  private async cancelDeletion(args: any) {
    const result = await this.todoService.cancelDeletion(
      args.todoId,
      args.userId,
    );
    return formatMcpToolResponse('Todo deletion cancelled', result);
  }
}
