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
