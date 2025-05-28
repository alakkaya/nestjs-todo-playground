import * as request from 'supertest';
import { CreateUserDto } from 'src/modules/user/dto';
import { createTestUser, getRefreshTokenFromRedis } from '../common';
import { getAuthTokens, signIn } from '../common/auth.helper';
import { testUsers } from '../test-setup';
import { testConfig } from '../test-config';
import { ErrorCode } from '../../src/core/error';

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
      .set('Authorization', 'invalid_token');

    expect(response.status).toBe(401);
    expect(response.body.meta.errorCode).toBe(ErrorCode.UNAUTHORIZED);
  });

  it('should handle complete token refresh flow with /me endpoint', async () => {
    // 1. Sign in to get accessToken and refreshToken
    const signInResponse = await signIn({
      nickname: testUser.nickname,
      password: testUser.password,
    });

    expect(signInResponse.status).toBe(201);
    expect(signInResponse.body.result).toHaveProperty('accessToken');
    expect(signInResponse.body.result).toHaveProperty('refreshToken');

    let currentAccessToken = signInResponse.body.result.accessToken;
    let currentRefreshToken = signInResponse.body.result.refreshToken;

    // 2. Make request to /me endpoint with initial accessToken
    const firstMeResponse = await request(testConfig.baseUri)
      .get('/auth/me')
      .set('Authorization', `Bearer ${currentAccessToken}`);

    expect(firstMeResponse.status).toBe(200);
    expect(firstMeResponse.body.result).toHaveProperty('_id', userId);
    expect(firstMeResponse.body.result).toHaveProperty(
      'nickname',
      testUser.nickname,
    );

    // 3. Use refresh token to get new accessToken
    const refreshResponse = await request(testConfig.baseUri)
      .post('/auth/refresh-token')
      .send({ refreshToken: currentRefreshToken });

    expect(refreshResponse.status).toBe(201);
    expect(refreshResponse.body.result).toHaveProperty('newAccessToken');
    expect(refreshResponse.body.result).toHaveProperty('newRefreshToken');

    const newAccessToken = refreshResponse.body.result.newAccessToken;
    const newRefreshToken = refreshResponse.body.result.newRefreshToken;

    // 4. Make request to /me endpoint with new accessToken
    const secondMeResponse = await request(testConfig.baseUri)
      .get('/auth/me')
      .set('Authorization', `Bearer ${newAccessToken}`);

    expect(secondMeResponse.status).toBe(200);
    expect(secondMeResponse.body.result).toHaveProperty('_id', userId);
    expect(secondMeResponse.body.result).toHaveProperty(
      'nickname',
      testUser.nickname,
    );

    // 5. Try to get new accessToken with old refreshToken (should fail)
    const failedRefreshResponse = await request(testConfig.baseUri)
      .post('/auth/refresh-token')
      .send({ refreshToken: currentRefreshToken }); // Using old token

    expect(failedRefreshResponse.status).toBe(401);
    expect(failedRefreshResponse.body.meta.errorCode).toBe(
      ErrorCode.INVALID_REFRESH_TOKEN,
    );

    // 6. Verify new refreshToken is stored in Redis
    const savedToken = await getRefreshTokenFromRedis(userId);
    expect(savedToken).toBe(newRefreshToken);
    expect(savedToken).not.toBe(currentRefreshToken); // Old token is no longer valid
  });
});
