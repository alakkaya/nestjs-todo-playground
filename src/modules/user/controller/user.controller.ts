import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../service';
import { CreateUserDto, UserCreateAck } from '../dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<UserCreateAck> {
    return this.userService.create(createUserDto);
  }
}
