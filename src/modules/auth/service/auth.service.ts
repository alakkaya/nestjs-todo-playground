import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/modules/user/service';
import { SignInAck, SignInDto } from '../dto';
import { UnauthorizedException } from 'src/core/error';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

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
      secret: process.env.JWT_SECRET_ACCESS,
      expiresIn: process.env.JWT_EXPIRATION_ACCESS,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET_REFRESH,
      expiresIn: process.env.JWT_EXPIRATION_REFRESH,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
