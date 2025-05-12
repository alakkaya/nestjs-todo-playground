import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CreateUserDto } from '../../src/modules/user/dto';
import { UserMongoModel } from '../common/db/mongo.helper';
import * as bcrypt from 'bcryptjs';
import { testUsers } from '../test-setup';
import { testConfig } from '../test-config';
import { ErrorCode } from '../../src/core/error/error-code';

it('should create a user', async () => {
  const dto: CreateUserDto = {
    fullname: 'test-user',
    nickname: 'tester-nickname',
    password: 'password123',
  };

  const response = await request(testConfig.baseUri).post('/user').send(dto);

  expect(response.status).toBe(201);

  const createdUser = await UserMongoModel.findOne({ nickname: dto.nickname })
    .select('+password') // select('+password') to include the password field for authentication
    .lean()
    .exec();

  expect(createdUser.fullname).toBe(dto.fullname);
  expect(createdUser.nickname).toBe(dto.nickname);

  // Şifre kontrolü
  const isPasswordMatch = bcrypt.compare(dto.password, createdUser.password);
  expect(isPasswordMatch).toBeTruthy();
});

it('should throw error if nickname already exists', async () => {
  const dto: CreateUserDto = {
    fullname: 'test-user',
    nickname: Math.random().toString(36).slice(2, 16),
    password: 'password123',
  };
  // Create the user for the first time
  await request(testConfig.baseUri).post('/user').send(dto);

  // Try to create the same user again - this should fail
  const response = await request(testConfig.baseUri)
    .post('/user')
    .send(dto)
    .expect(400);

  // Now check the error response
  expect(response.body.meta.errorCode).toBe(ErrorCode.NICKNAME_ALREADY_TAKEN);
});

it('should throw 400 error if required fields are missing (DTO validation)', async () => {
  // fullname eksik
  const missingFullname = {
    nickname: 'test-nickname',
    password: 'password123',
  };

  const response = await request(testConfig.baseUri)
    .post('/user')
    .send(missingFullname)
    .expect(400);

  expect(response.body.meta.status).toBe(400);
  expect(response.body.meta.errorMessage).toEqual(
    expect.arrayContaining([expect.stringContaining('fullname')]),
  );
  expect(response.body.result.statusCode).toBe(400);
});
