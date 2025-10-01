import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class DeleteTodoDto {
  @IsString()
  @ApiProperty({
    description: 'Todo ID to delete',
    example: '507f1f77bcf86cd799439012',
  })
  todoId: string;

  @IsString()
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;
}

export class DeleteTodoAck {
  @ApiProperty({
    description: 'Success message about deletion scheduling',
    example: 'Todo deletion scheduled. You have 4 seconds to cancel.',
  })
  message: string;

  @ApiProperty({
    description: 'Job ID for the deletion task',
    example: '12345-67890-abcdef',
  })
  jobId: string;

  @ApiProperty({
    description: 'Remaining time to cancel deletion in milliseconds',
    example: 4000,
  })
  remainingTime: number;
}

export class CancelDeletionDto {
  @IsString()
  @ApiProperty({
    description: 'Todo ID to cancel deletion',
    example: '507f1f77bcf86cd799439012',
  })
  todoId: string;

  @IsString()
  @ApiProperty({
    description: 'User ID',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;
}

export class CancelDeletionAck {
  @ApiProperty({
    description: 'Message about cancellation result',
    example: 'Todo deletion cancelled successfully.',
  })
  message: string;

  @ApiProperty({
    description: 'Whether the cancellation was successful',
    example: true,
  })
  success: boolean;
}
