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

  async create(createUserDTO: CreateUserDto): Promise<User> {
    const newUser = new this.userModel(createUserDTO);
    return newUser.save();
  }
}
