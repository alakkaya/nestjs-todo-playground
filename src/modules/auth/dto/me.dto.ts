import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MeDto {}

export class MeAck {
  @IsString()
  @ApiProperty()
  _id: string;

  @IsString()
  @ApiProperty()
  fullname: string;

  @IsString()
  @ApiProperty()
  nickname: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  createdAt?: Date;

  @IsString()
  @IsOptional()
  @ApiProperty()
  updatedAt?: Date;
}
