import { Injectable } from '@nestjs/common';
import { UserRepository } from '../repository';
import { CreateUserDto } from '../dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(user: CreateUserDto) {
    const existingUser = await this.userRepository.findByNickname(
      user.nickname,
    );
    if (existingUser) {
      throw new Error('Bu kullanıcı adı zaten kullanılıyor');
    }
    return this.userRepository.create(user);
  }
}
