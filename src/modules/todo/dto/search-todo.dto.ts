import { ApiProperty } from '@nestjs/swagger';

export class SearchTodoDto {
  @ApiProperty()
  query: string;

  @ApiProperty({ required: false, default: 1 })
  page?: number = 1;

  @ApiProperty({ required: false, default: 10 })
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
