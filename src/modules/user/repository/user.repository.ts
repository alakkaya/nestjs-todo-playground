import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { UserDocument, UserModel } from '../model/user.model';
import { Model } from 'mongoose';
import { CreateUserDto } from '../dto';
import { User } from 'src/core/interface/mongo-model';

@Injectable()
export class UserRepository {
  constructor(
    @InjectModel(UserModel.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(...createUserDto);
    return newUser.save();
  }

  async findById(_id: string): Promise<Omit<User, 'password'>> {
    return this.userModel.findById(_id).lean().exec();
  }

  findByNickname(nickname: string): Promise<Omit<User, 'password'>> {
    return this.userModel
      .findOne({
        nickname,
      })
      .lean()
      .exec();
  }

  async findByNicknameForAuth(nickname: string): Promise<User | null> {
    return this.userModel
      .findOne({ nickname })
      .select('+password') // select('+password') to include the password field for authentication
      .lean()
      .exec();
  }
}
