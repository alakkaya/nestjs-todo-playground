import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, UserModel } from '../model/user.model';
import { Model } from 'mongoose';
import { CreateUserDto, UserCreationResponseDto } from '../dto';
import { User } from 'src/core/interface/mongo-model';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserCreationResponseDto> {
    const newUser = new this.userModel({ ...createUserDto });
    const savedUser = await newUser.save();
    //TODO: savedUser return degerinde password de geliyor. Halil Abi'nin kodunda ozel save() metodu yazmis bunun icin mi?
    // DTO kullanarak döndürülen değeri oluştur
    return new UserCreationResponseDto(savedUser._id.toString());
  }

  async findById(_id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userModel.findById(_id).lean().exec();
    if (user) {
      return user;
    }
    return null;
  }

  async findByNickname(
    nickname: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.userModel
      .findOne({
        nickname,
      })
      .lean()
      .exec();
    if (user) {
      return user;
    }
    return null;
  }

  async findByNicknameForAuth(nickname: string): Promise<User | null> {
    return this.userModel
      .findOne({ nickname })
      .select('+password') // select('+password') to include the password field for authentication
      .lean()
      .exec();
  }
}
