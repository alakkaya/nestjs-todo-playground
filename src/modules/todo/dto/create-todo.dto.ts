import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTodoDto {
  @IsString()
  @MinLength(1, { message: 'Title cannot be empty' })
  @MaxLength(100, { message: 'Title cannot exceed 100 characters' })
  @ApiProperty({
    description: 'Title of the todo item',
    minLength: 1,
    maxLength: 100,
  })
  title: string;

  @IsString()
  @ApiProperty()
  description: string;
}

export class CreateTodoAck {
  @ApiProperty({
    description: 'ID of the created todo item',
    example: '507f1f77bcf86cd799439012',
  })
  id: string;

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
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-07-02T10:30:00.000Z',
  })
  updatedAt?: Date;
}
