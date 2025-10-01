import { McpTool } from 'src/core/interface';
import { McpToolNotFoundException } from 'src/core/error/exception/mcp-tool-not-found.exception';
import { validationMetadatasToSchemas } from 'class-validator-jsonschema';
import { formatMcpToolResponse } from 'src/core/helper';
import { TodoService } from 'src/modules/todo/service';
import { UpdateTodoDto } from 'src/modules/todo/dto/update-todo.dto';
import { GetTodoDto } from 'src/modules/todo/dto/get-todo.dto';
import { CreateTodoDto } from 'src/modules/todo/dto/create-todo.dto';

export class TodoTools {
  constructor(private readonly todoService: TodoService) {}

  getToolDefinitions() {
    const schemas = validationMetadatasToSchemas();

    return [
      {
        name: McpTool.TODO_CREATE.name,
        description: McpTool.TODO_CREATE.description,
        inputSchema: schemas.CreateTodoDto,
      },
      {
        name: McpTool.TODO_GET.name,
        description: McpTool.TODO_GET.description,
        inputSchema: schemas.GetTodoDto,
      },
      {
        name: McpTool.TODO_UPDATE.name,
        description: McpTool.TODO_UPDATE.description,
        inputSchema: schemas.UpdateTodoDto,
      },
      {
        name: McpTool.TODO_DELETE.name,
        description: McpTool.TODO_DELETE.description,
        inputSchema: schemas.DeleteTodoDto,
      },
      {
        name: McpTool.TODO_CANCEL_DELETION.name,
        description: McpTool.TODO_CANCEL_DELETION.description,
        inputSchema: schemas.CancelDeletionDto,
      },
    ];
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

  private async create(args: CreateTodoDto) {
    const result = await this.todoService.create(args);
    return formatMcpToolResponse('Todo created successfully', result);
  }

  private async get(args: { userId: string } & GetTodoDto) {
    const { userId, ...getTodoDto } = args;
    const result = await this.todoService.findByUserId(userId, getTodoDto);
    return formatMcpToolResponse('Todos retrieved successfully', result);
  }

  private async update(
    args: { todoId: string; userId: string } & UpdateTodoDto,
  ) {
    const { todoId, userId, ...updateTodoDto } = args;
    const result = await this.todoService.update(todoId, userId, updateTodoDto);
    return formatMcpToolResponse('Todo updated successfully', result);
  }

  private async delete(args: { todoId: string; userId: string }) {
    const { todoId, userId } = args;
    const result = await this.todoService.delete({ todoId, userId });
    return formatMcpToolResponse('Todo deletion scheduled', result);
  }

  private async cancelDeletion(args: { todoId: string; userId: string }) {
    const { todoId, userId } = args;
    const result = await this.todoService.cancelDeletion({ todoId, userId });
    return formatMcpToolResponse('Todo deletion cancelled', result);
  }
}
