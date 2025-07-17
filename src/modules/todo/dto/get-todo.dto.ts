import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean, IsNumber, Min, Max } from 'class-validator';

export class GetTodoDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    required: false,
    default: 1,
    minimum: 1,
    description: 'Page number for pagination',
  })
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100) // Assuming a maximum limit of 100 items per page
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    required: false,
    default: 10,
    minimum: 1,
    maximum: 100,
    description: 'Number of items per page',
  })
  limit?: number = 10;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  })
  @ApiProperty({
    required: false,
    description:
      'Filter by completion status. If not provided, returns all todos.',
  })
  completed?: boolean;
}

// For Swagger documentation
export class TodoResponseDto {
  @ApiProperty({
    description: 'ID of the todo item',
    example: '507f1f77bcf86cd799439012',
  })
  _id: string;

  @ApiProperty({
    description: 'Title of the todo item',
    example: 'Complete project documentation',
  })
  title: string;

  @ApiProperty({
    description: 'Description of the todo item',
    example: 'Write comprehensive documentation for the NestJS project',
  })
  description: string;

  @ApiProperty({
    description: 'Completion status',
    example: false,
  })
  completed: boolean;

  @ApiProperty({
    description: 'ID of the user who owns this todo',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-07-02T10:30:00.000Z',
  })
  createdAt?: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-07-02T10:30:00.000Z',
  })
  updatedAt?: Date;
}

export class GetTodoAck {
  @ApiProperty({
    type: [TodoResponseDto],
    description: 'Array of todo items',
  })
  todos: TodoResponseDto[];

  @ApiProperty({
    description: 'Total number of todos matching the filter',
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
  })
  totalPages?: number;
}
