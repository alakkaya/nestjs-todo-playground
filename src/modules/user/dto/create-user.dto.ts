import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  @ApiProperty({
    description: 'Full name of the user',
    minLength: 3,
    maxLength: 20,
  })
  fullname: string;

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

export class CreateUserAck {
  @ApiProperty()
  id: string;
}
