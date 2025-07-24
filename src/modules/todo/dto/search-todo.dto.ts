import { ApiProperty } from '@nestjs/swagger';

export class SearchTodoDto {
  @ApiProperty()
  text: string;
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
}
