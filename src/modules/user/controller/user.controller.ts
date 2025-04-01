import { Controller } from '@nestjs/common';
import { UserService } from '../service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}
}
