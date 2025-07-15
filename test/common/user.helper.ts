import * as request from 'supertest';
import { testConfig } from '../test-config';
import { CreateUserDto } from '../../src/modules/user/dto';

export async function createTestUser(dto: CreateUserDto) {
  if (!dto) {
    dto = {
      fullname: '#test-user',
      nickname: Math.random().toString(36).slice(2, 16),
      password: 'passw@rd123',
    };
  }
  return request(testConfig.baseUri).post('/user').send(dto);
}

export function generateTestUserDto(prefix: string = 'test'): CreateUserDto {
  return {
    fullname: `${prefix.charAt(0).toUpperCase() + prefix.slice(1)} User`,
    nickname: `${prefix}_${Math.random().toString(36).substring(2, 10)}`,
    password: 'Password123!',
  };
}
