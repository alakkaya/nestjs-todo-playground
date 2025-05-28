import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty()
  refreshToken: string;
}

export class RefreshTokenAck {
  @IsString()
  @ApiProperty()
  newAccessToken: string;

  @IsString()
  @ApiProperty()
  newRefreshToken: string;
}
