import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  @ApiProperty()
  nickname: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @ApiProperty()
  password: string;
}

export class SignInAck {
  @IsString()
  @ApiProperty()
  accessToken: string;

  @IsString()
  @ApiProperty()
  refreshToken: string;
}
