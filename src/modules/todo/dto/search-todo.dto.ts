import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SearchTodoDto {
  @IsString()
  @ApiProperty({
    description: 'Search query for todos',
    example: 'meeting',
    required: true,
  })
  query: string;

  @IsOptional()
  @IsInt()
  @ApiProperty({
    description: 'Current page number',
    example: 1,
    required: false,
  })
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  limit?: number = 10;
}

export class SearchTodoItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  completed: boolean;

  @ApiProperty()
  userId: string;

  @ApiProperty({ required: false })
  createdAt?: Date;

  @ApiProperty({ required: false })
  updatedAt?: Date;
}

export class SearchTodoAck {
  @ApiProperty({ type: [SearchTodoItemDto] })
  todos: SearchTodoItemDto[];

  @ApiProperty({ description: 'Toplam sonuç sayısı' })
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}
