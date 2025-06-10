import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../service';
import { CreateUserDto, CreateUserAck } from '../dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    type: CreateUserAck,
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<CreateUserAck> {
    return this.userService.create(createUserDto);
  }
}
