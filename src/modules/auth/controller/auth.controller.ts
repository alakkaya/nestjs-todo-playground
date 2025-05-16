import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from '../service';
import { SignInAck, SignInDto } from '../dto';
import { AuthGuard } from 'src/core/guard/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto): Promise<SignInAck> {
    return this.authService.signIn(signInDto);
  }

  @Post('sign-out')
  @UseGuards(AuthGuard)
  async signOut(@Request() req): Promise<void> {
    //With AuthGuard, req.user is already populated with the user data
    return this.authService.signOut(req.user._id);
  }
}
