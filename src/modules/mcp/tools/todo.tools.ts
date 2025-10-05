import { McpTool } from 'src/core/interface';
import { McpToolNotFoundException } from 'src/core/error/exception/mcp-tool-not-found.exception';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { formatMcpToolResponse } from 'src/core/helper';
import { TodoService } from 'src/modules/todo/service';
import {
  McpCreateTodoDto,
  McpGetTodoDto,
  McpUpdateTodoDto,
  McpDeleteTodoDto,
  McpCancelDeletionDto,
} from '../dto';

export class TodoTools {
  constructor(private readonly todoService: TodoService) {}

  getToolDefinitions() {
    const schemas = validationMetadatasToSchemas();

    return [
      {
        name: McpTool.TODO_CREATE.name,
        description: McpTool.TODO_CREATE.description,
        inputSchema: schemas.McpCreateTodoDto,
      },
      {
        name: McpTool.TODO_GET.name,
        description: McpTool.TODO_GET.description,
        inputSchema: schemas.McpGetTodoDto,
      },
      {
        name: McpTool.TODO_UPDATE.name,
        description: McpTool.TODO_UPDATE.description,
        inputSchema: schemas.McpUpdateTodoDto,
      },
      {
        name: McpTool.TODO_DELETE.name,
        description: McpTool.TODO_DELETE.description,
        inputSchema: schemas.McpDeleteTodoDto,
      },
      {
        name: McpTool.TODO_CANCEL_DELETION.name,
        description: McpTool.TODO_CANCEL_DELETION.description,
        inputSchema: schemas.McpCancelDeletionDto,
      },
    ];
  }

  async handleToolCall(toolName: string, args: any) {
    switch (toolName) {
      case McpTool.TODO_CREATE.name:
        return await this.create(args as McpCreateTodoDto);
      case McpTool.TODO_GET.name:
        return await this.get(args as McpGetTodoDto);
      case McpTool.TODO_UPDATE.name:
        return await this.update(args as McpUpdateTodoDto);
      case McpTool.TODO_DELETE.name:
        return await this.delete(args as McpDeleteTodoDto);
      case McpTool.TODO_CANCEL_DELETION.name:
        return await this.cancelDeletion(args as McpCancelDeletionDto);
      default:
        throw new McpToolNotFoundException(toolName);
    }
  }

  private async create(args: McpCreateTodoDto) {
    const { userId, ...createTodoDto } = args;
    const result = await this.todoService.create(createTodoDto, userId);
    return formatMcpToolResponse('Todo created successfully', result);
  }

  private async get(args: McpGetTodoDto) {
    const { userId, ...getTodoDto } = args;
    const result = await this.todoService.findByUserId(userId, getTodoDto);
    return formatMcpToolResponse('Todos retrieved successfully', result);
  }

  private async update(args: McpUpdateTodoDto) {
    const { todoId, userId, ...updateTodoDto } = args;
    const result = await this.todoService.update(todoId, userId, updateTodoDto);
    return formatMcpToolResponse('Todo updated successfully', result);
  }

  private async delete(args: McpDeleteTodoDto) {
    const { todoId, userId } = args;
    const result = await this.todoService.delete(todoId, userId);
    return formatMcpToolResponse('Todo deletion scheduled', result);
  }

  private async cancelDeletion(args: McpCancelDeletionDto) {
    const { todoId, userId } = args;
    const result = await this.todoService.cancelDeletion(todoId, userId);
    return formatMcpToolResponse('Todo deletion cancelled', result);
  }
}
