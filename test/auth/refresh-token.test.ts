import * as request from 'supertest';
import { testConfig } from '../test-config';
import { CreateUserDto } from '../../src/modules/user/dto';
import {
  createTestUser,
  deleteRefreshTokenFromRedis,
  getRefreshTokenFromRedis,
  setRefreshTokenInRedis,
} from '../common';
import { testUsers } from '../test-setup';
import { createExpiredRefreshToken, signIn } from '../common/auth.helper';
import { ErrorCode } from '../../src/core/error';

describe('Auth Flow Tests', () => {
  let testUser: CreateUserDto;
  let userId: string;
  let accessToken: string;
  let refreshToken: string;

  beforeEach(async () => {
    // Unique test user
    testUser = {
      fullname: 'Auth Flow Test User',
      nickname: `flow_test_${Math.random().toString(36).substring(2, 10)}`,
      password: 'Password123!',
    };

    const createResponse = await createTestUser(testUser);
    expect(createResponse.status).toBe(201);
    expect(createResponse.body.result).toHaveProperty('id');
    userId = createResponse.body.result.id;
    testUsers.push(userId);
  });

  it('should refresh access token with a valid refresh token', async () => {
    const signInResponse = await signIn({
      nickname: testUser.nickname,
      password: testUser.password,
    });

    expect(signInResponse.status).toBe(201);
    expect(signInResponse.body.result).toHaveProperty('accessToken');
    expect(signInResponse.body.result).toHaveProperty('refreshToken');

    accessToken = signInResponse.body.result.accessToken;
    refreshToken = signInResponse.body.result.refreshToken;

    // Verify refresh token is stored in Redis
    const savedToken = await getRefreshTokenFromRedis(userId);
    expect(savedToken).toBe(refreshToken);

    const refreshResponse = await request(testConfig.baseUri)
      .post('/auth/refresh-token')
      .send({ refreshToken });

    expect(refreshResponse.status).toBe(201);
    expect(refreshResponse.body.result).toHaveProperty('newAccessToken');

    // Check redis for the new refresh token
    const updatedToken = await getRefreshTokenFromRedis(userId);
    expect(updatedToken).toBe(refreshResponse.body.result.newRefreshToken);
  });

  it('should fail with expired refresh token', async () => {
    // First sign in to get a valid refresh token
    const signInResponse = await signIn({
      nickname: testUser.nickname,
      password: testUser.password,
    });

    expect(signInResponse.status).toBe(201);
    refreshToken = signInResponse.body.result.refreshToken;

    // Verify refresh token is stored in Redis
    const savedToken = await getRefreshTokenFromRedis(userId);
    expect(savedToken).toBe(refreshToken);

    // Create an expired refresh token
    const expiredToken = await createExpiredRefreshToken(refreshToken);

    // Set the expired token in Redis
    await setRefreshTokenInRedis(userId, expiredToken);

    const refreshResponse = await request(testConfig.baseUri)
      .post('/auth/refresh-token')
      .send({ refreshToken: expiredToken });

    expect(refreshResponse.status).toBe(401);
    expect(refreshResponse.body.meta.errorCode).toBe(
      ErrorCode.INVALID_REFRESH_TOKEN,
    );
  });

  it('should fail when refresh token is valid but not found in Redis', async () => {
    // First sign in to get a valid refresh token
    const signInResponse = await signIn({
      nickname: testUser.nickname,
      password: testUser.password,
    });

    expect(signInResponse.status).toBe(201);
    refreshToken = signInResponse.body.result.refreshToken;

    // Verify refresh token is stored in Redis
    const savedToken = await getRefreshTokenFromRedis(userId);
    expect(savedToken).toBe(refreshToken);

    // Manually delete the refresh token from Redis (simulating sign-out or cache invalidation)
    await deleteRefreshTokenFromRedis(userId);

    // Verify token is removed from Redis
    const deletedToken = await getRefreshTokenFromRedis(userId);
    expect(deletedToken).toBeNull();

    // Try to refresh with the valid JWT token that's no longer in Redis
    const refreshResponse = await request(testConfig.baseUri)
      .post('/auth/refresh-token')
      .send({ refreshToken });

    expect(refreshResponse.status).toBe(401);
    expect(refreshResponse.body.meta.errorCode).toBe(
      ErrorCode.INVALID_REFRESH_TOKEN,
    );
  });
});
