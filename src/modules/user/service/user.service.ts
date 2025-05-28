import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository';
import { CreateUserDto, CreateUserAck } from '../dto';
import { NicknameAlreadyTakenException } from '../../../core/error';
import { User } from 'src/core/interface/mongo-model';

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

  async findByNickname(
    nickname: string,
  ): Promise<Omit<User, 'password'> | null> {
    return await this.userRepository.findByNickname(nickname);
  }

  async findByNicknameForAuth(nickname: string): Promise<User | null> {
    return await this.userRepository.findByNicknameForAuth(nickname);
  }
}
