import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository';
import { CreateUserDto, CreateUserAck } from '../dto';
import { NicknameAlreadyTakenException } from 'src/core/error';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(user: CreateUserDto): Promise<CreateUserAck> {
    const existingUser = await this.userRepository.findByNickname(
      user.nickname,
    );
    if (existingUser) {
      throw new NicknameAlreadyTakenException();
    }
    return this.userRepository.create(user);
  }
}
