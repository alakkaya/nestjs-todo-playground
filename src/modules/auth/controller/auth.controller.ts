import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from '../service';
import { SignInAck, SignInDto } from '../dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<SignInAck> {
    return this.authService.signIn(signInDto);
  }
}
