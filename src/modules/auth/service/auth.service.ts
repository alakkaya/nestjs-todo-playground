import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/service';
import { SignInAck, SignInDto } from '../dto';
import { UnauthorizedException } from 'src/core/error';
import * as bcrypt from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/core/interface/mongo-model';
import { RedisService } from 'src/core/cache/redis.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async getUserByToken(token: string): Promise<User> {
    const userPayload = await this.jwtService.verifyAsync(token, {
      secret: this.configService.get<string>('JWT_SECRET_ACCESS'),
    });

    const user = await this.userService.findByNicknameForAuth(
      userPayload.nickname,
    );

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }

  async signIn(signInDto: SignInDto): Promise<SignInAck> {
    const { nickname, password } = signInDto;

    const user = await this.userService.findByNicknameForAuth(nickname);

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordMatch = bcrypt.compareSync(password, user.password);

    if (!isPasswordMatch) {
      throw new UnauthorizedException();
    }

    const payload = {
      _id: user._id,
      nickname: user.nickname,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET_ACCESS'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION_ACCESS'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.configService.get<string>('JWT_SECRET_REFRESH'),
      expiresIn: this.configService.get<string>('JWT_EXPIRATION_REFRESH'),
    });

    // Save refresh token to Redis
    await this.redisService.saveRefreshToken(user._id, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async signOut(userId: string): Promise<void> {
    await this.redisService.deleteRefreshToken(userId);
  }
}
