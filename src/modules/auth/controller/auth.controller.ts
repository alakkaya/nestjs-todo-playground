import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  HttpCode,
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
import { ApiException, ApiResponseSchema, ReqUser } from 'src/core/decorator';
import { User } from 'src/core/interface/mongo-model';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  InvalidRefreshTokenException,
  UnauthorizedException,
} from 'src/core/error';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  @ApiOperation({ summary: 'Sign in a user' })
  @ApiException(UnauthorizedException)
  @ApiResponseSchema({
    model: SignInAck,
    status: 201,
    description: 'User signed in successfully',
  })
  async signIn(@Body() signInDto: SignInDto): Promise<SignInAck> {
    return this.authService.signIn(signInDto);
  }

  @Post('sign-out')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sign out a user' })
  @HttpCode(201)
  @ApiResponseSchema({
    status: 201,
    description: 'User signed out successfully',
  })
  async signOut(@ReqUser() user: User): Promise<void> {
    return this.authService.signOut(user._id);
  }

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token using refresh token' })
  @ApiException(InvalidRefreshTokenException, UnauthorizedException)
  @ApiResponseSchema({
    model: RefreshTokenAck,
    status: 201,
    description: 'Access token refreshed successfully',
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
  @ApiResponseSchema({
    model: MeAck,
    status: 200,
    description: 'Current user information',
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
