import { IsString, MaxLength, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  @MinLength(1)
  @MaxLength(20)
  nickname: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  password: string;
}

export class SignInAck {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;
}
