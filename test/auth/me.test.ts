import * as request from 'supertest';

import { CreateUserDto } from 'src/modules/user/dto';
import { createTestUser } from 'test/common';
import { getAuthTokens } from '../common/auth.helper';
import { testUsers } from 'test/test-setup';
import { testConfig } from 'test/test-config';
import { ErrorCode } from 'src/core/error';

describe('Me Endpoint', () => {
  let testUser: CreateUserDto;
  let userId: string;
  let accessToken: string;

  beforeEach(async () => {
    // Unique test user
    testUser = {
      fullname: 'Me Test User',
      nickname: `test_${Math.random().toString(36).substring(2, 10)}`,
      password: 'Password123!',
    };

    const response = await createTestUser(testUser);
    expect(response.status).toBe(201);
    expect(response.body.result).toHaveProperty('id');
    userId = response.body.result.id;
    testUsers.push(userId);

    // Sign in to get access token
    const tokens = await getAuthTokens(testUser.nickname, testUser.password);
    accessToken = tokens.accessToken;
  });

  it('should return user details for authenticated user', async () => {
    const meResponse = await request(testConfig.baseUri)
      .get('/auth/me')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.meta.status).toBe(200);

    expect(meResponse.body.result).toHaveProperty('_id', userId);
    expect(meResponse.body.result).toHaveProperty(
      'fullname',
      testUser.fullname,
    );
    expect(meResponse.body.result).toHaveProperty(
      'nickname',
      testUser.nickname,
    );
    expect(meResponse.body.result).toHaveProperty('createdAt');
    expect(meResponse.body.result).toHaveProperty('updatedAt');

    // Check there is no password in the response
    expect(meResponse.body.result).not.toHaveProperty('password');
  });

  it('should return 401 when using invalid token', async () => {
    const response = await request(testConfig.baseUri)
      .get('/auth/me')
      .set('Authorization', 'Bearer invalid_token');

    expect(response.status).toBe(401);
    expect(response.body.meta.errorCode).toBe(ErrorCode.UNAUTHORIZED);
  });
});
