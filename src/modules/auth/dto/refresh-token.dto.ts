import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

export class RefreshTokenAck {
  @IsString()
  newAccessToken: string;

  @IsString()
  newRefreshToken: string;
}
