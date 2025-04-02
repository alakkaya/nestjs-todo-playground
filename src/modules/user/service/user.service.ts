import { ConflictException, Injectable } from '@nestjs/common';
import { UserRepository } from '../repository';
import { CreateUserDto, UserCreationResponseDto } from '../dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async create(user: CreateUserDto): Promise<UserCreationResponseDto> {
    const existingUser = await this.userRepository.findByNickname(
      user.nickname,
    );
    if (existingUser) {
      throw new ConflictException('Bu kullanıcı adı zaten kullanılıyor');
    }
    return this.userRepository.create(user);
  }
}
