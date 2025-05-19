import * as request from 'supertest';
import { testConfig } from '../test-config';
import { CreateUserDto } from '../../src/modules/user/dto';
import { SignInDto } from '../../src/modules/auth/dto';
import { createTestUser, getRefreshTokenFromRedis } from '../common';
import { testUsers } from '../test-setup';
import { signIn, getAuthTokens } from '../common/auth.helper';
import { ErrorCode } from '../../src/core/error';

let testUser: CreateUserDto;
let userId: string;

beforeEach(async () => {
  // Unique test user
  testUser = {
    fullname: 'Sign In Test User',
    nickname: `test_${Math.random().toString(36).substring(2, 10)}`,
    password: 'Password123!',
  };

  const response = await createTestUser(testUser);
  expect(response.status).toBe(201);
  expect(response.body.result).toHaveProperty('id');
  userId = response.body.result.id;
  testUsers.push(userId);
});

it('should successfully sign in with valid credentials', async () => {
  const signInDto: SignInDto = {
    nickname: testUser.nickname,
    password: testUser.password,
  };

  const response = await signIn(signInDto);

  expect(response.status).toBe(201);
  expect(response.body.meta.status).toBe(201);
  expect(response.body.result).toHaveProperty('accessToken');
  expect(response.body.result).toHaveProperty('refreshToken');

  // Verify token was saved to Redis
  const savedToken = await getRefreshTokenFromRedis(userId);
  expect(savedToken).toBe(response.body.result.refreshToken);
});

it('should return 401 for incorrect password', async () => {
  const signInDto: SignInDto = {
    nickname: testUser.nickname,
    password: 'wrongPassword123!',
  };

  const response = await signIn(signInDto);
  expect(response.status).toBe(401);
  expect(response.body.meta.errorCode).toBe(ErrorCode.UNAUTHORIZED);
});

it('should return 401 for non-existent user', async () => {
  const signInDto: SignInDto = {
    nickname: 'nonexistent_user',
    password: 'Password123!',
  };

  const response = await signIn(signInDto);
  expect(response.status).toBe(401);
  expect(response.body.meta.errorCode).toBe(ErrorCode.UNAUTHORIZED);
});

it('should sign out and remove refresh token from redis', async () => {
  // First sign in
  const { accessToken } = await getAuthTokens(
    testUser.nickname,
    testUser.password,
  );

  // Perform sign out
  const signOutRes = await request(testConfig.baseUri)
    .post('/auth/sign-out')
    .set('Authorization', `Bearer ${accessToken}`);

  expect(signOutRes.status).toBe(201);

  // Verify token was removed from Redis
  const savedToken = await getRefreshTokenFromRedis(userId);
  expect(savedToken).toBeNull();
});

it('should return 400 for missing required fields', async () => {
  const signInDto: SignInDto = {
    nickname: '',
    password: '',
  };

  const response = await signIn(signInDto);
  expect(response.status).toBe(400);
  expect(response.body.meta.errorMessage).toEqual(
    expect.arrayContaining([expect.stringContaining('nickname')]),
  );
});
