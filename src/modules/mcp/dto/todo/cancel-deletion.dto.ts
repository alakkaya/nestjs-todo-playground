import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class McpCancelDeletionDto {
  @IsString()
  @ApiProperty({
    description: 'REQUIRED: Todo ID to cancel deletion',
    example: '507f1f77bcf86cd799439012',
  })
  todoId: string;

  @IsString()
  @ApiProperty({
    description: 'REQUIRED: Your user ID from auth_login response',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;
}
