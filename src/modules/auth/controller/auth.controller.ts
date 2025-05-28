import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../service';
import {
  MeAck,
  RefreshTokenAck,
  RefreshTokenDto,
  SignInAck,
  SignInDto,
} from '../dto';
import { AuthGuard } from 'src/core/guard/auth.guard';
import { ReqUser } from 'src/core/decorator';
import { User } from 'src/core/interface/mongo-model';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiResponse({
    status: 201,
    description: 'User signed in successfully.',
    type: SignInAck,
  })
  async signIn(@Body() signInDto: SignInDto): Promise<SignInAck> {
    return this.authService.signIn(signInDto);
  }

  @Post('sign-out')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out a user' })
  @ApiResponse({
    status: 201,
    description: 'User signed out successfully.',
  })
  async signOut(@ReqUser() user: User): Promise<void> {
    return this.authService.signOut(user._id);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiResponse({
    status: 201,
    description: 'Access token refreshed successfully.',
    type: RefreshTokenAck,
  })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenAck> {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({
    status: 200,
    description: 'Current user information retrieved successfully.',
    type: MeAck,
  })
  async me(@ReqUser() user: User): Promise<MeAck> {
    return {
      _id: user._id,
      fullname: user.fullname,
      nickname: user.nickname,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
