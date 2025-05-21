import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from '../service';
import { SignInAck, SignInDto } from '../dto';
import { AuthGuard } from 'src/core/guard/auth.guard';
import { ReqUser } from 'src/core/decorator';
import { User } from 'src/core/interface/mongo-model';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<SignInAck> {
    return this.authService.signIn(signInDto);
  }

  @Post('sign-out')
  @UseGuards(AuthGuard)
  async signOut(@ReqUser() user: User): Promise<void> {
    return this.authService.signOut(user._id);
  }
}
