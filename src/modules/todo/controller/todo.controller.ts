import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TodoService } from '../service/todo.service';
import {
  CreateTodoDto,
  CreateTodoAck,
  GetTodoDto,
  GetTodoAck,
  UpdateTodoDto,
  UpdateTodoAck,
  SearchTodoAck,
  SearchTodoDto,
} from '../dto';
import { AuthGuard } from 'src/core/guard/auth.guard';
import { ApiException, ReqUser } from 'src/core/decorator';
import { User } from 'src/core/interface';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TodoNotFoundException } from 'src/core/error';
import { TodoElastic } from 'src/modules/utils/elastic-search/interface';

@ApiTags('Todo')
@Controller('todo')
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new todo' })
  @ApiResponse({
    status: 201,
    description: 'Todo created successfully',
    type: CreateTodoAck,
  })
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @ReqUser() user: User,
  ): Promise<CreateTodoAck> {
    return this.todoService.create(createTodoDto, user._id);
  }

  @Get()
  @ApiOperation({ summary: 'Get todos for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'Todos retrieved successfully',
    type: GetTodoAck,
  })
  async findAll(
    @Query() getTodoDto: GetTodoDto,
    @ReqUser() user: User,
  ): Promise<GetTodoAck> {
    return this.todoService.findByUserId(user._id, getTodoDto);
  }

  @Patch(':todoId')
  @ApiOperation({ summary: 'Update a todo' })
  @ApiException(TodoNotFoundException)
  @ApiResponse({
    status: 200,
    description: 'Todo updated successfully',
    type: UpdateTodoAck,
  })
  async update(
    @Param('todoId') todoId: string,
    @Body() updateTodoDto: UpdateTodoDto,
    @ReqUser() user: User,
  ): Promise<UpdateTodoAck> {
    return this.todoService.update(todoId, user._id, updateTodoDto);
  }

  @Delete(':todoId')
  @ApiOperation({ summary: 'Delete a todo' })
  @ApiException(TodoNotFoundException)
  @ApiResponse({
    status: 200,
    description: 'Todo deleted successfully',
  })
  async delete(
    @Param('todoId') todoId: string,
    @ReqUser() user: User,
  ): Promise<void> {
    return this.todoService.delete(todoId, user._id);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search todos' })
  @ApiResponse({
    status: 200,
    description: 'Todos found by search',
    type: SearchTodoAck,
  })
  async search(
    @Query() searchDto: SearchTodoDto,
    @ReqUser() user: User,
  ): Promise<SearchTodoAck> {
    return this.todoService.search(searchDto, user._id);
  }
}
