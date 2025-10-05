import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { GetTodoDto } from '../../../todo/dto';

export class McpGetTodoDto extends GetTodoDto {
  @IsString()
  @ApiProperty({
    description: 'REQUIRED: Your user ID from auth_login response',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;
}
