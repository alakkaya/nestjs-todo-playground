import { IsOptional, IsString } from 'class-validator';

export class MeDto {}

export class MeAck {
  @IsString()
  _id: string;

  @IsString()
  fullname: string;

  @IsString()
  nickname: string;

  @IsString()
  @IsOptional()
  createdAt?: Date;

  @IsString()
  @IsOptional()
  updatedAt?: Date;
}
