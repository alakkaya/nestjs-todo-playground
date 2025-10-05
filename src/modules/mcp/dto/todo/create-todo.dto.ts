import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreateTodoDto } from '../../../todo/dto';

export class McpCreateTodoDto extends CreateTodoDto {
  @IsString()
  @ApiProperty({
    description: 'REQUIRED: Your user ID from auth_login response',
    example: '507f1f77bcf86cd799439011',
  })
  userId: string;
}
