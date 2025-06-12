import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../service';
import { CreateUserDto, CreateUserAck } from '../dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiResponseSchema } from 'src/core/decorator';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponseSchema({
    model: CreateUserAck,
    status: 201,
    description: 'User created',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<CreateUserAck> {
    return this.userService.create(createUserDto);
  }
}
