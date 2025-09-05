import { ApiProperty } from '@nestjs/swagger';

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
