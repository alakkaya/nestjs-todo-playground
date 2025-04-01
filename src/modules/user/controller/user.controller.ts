import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from '../service';
import { User } from 'src/core/interface/mongo-model';
import { CreateUserDto } from '../dto';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }
}
