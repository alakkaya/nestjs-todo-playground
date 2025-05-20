import * as request from 'supertest';
import { testConfig } from '../test-config';
import { SignInDto } from '../../src/modules/auth/dto';
import { Response } from 'supertest';

export async function signIn(signInDto: SignInDto): Promise<Response> {
  return request(testConfig.baseUri).post('/auth/sign-in').send(signInDto);
}

export async function getAuthTokens(
  nickname: string,
  password: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const response = await signIn({ nickname, password });

  if (response.status !== 201) {
    throw new Error(
      `Failed to get auth tokens: ${response.body.meta.errorMessage}`,
    );
  }

  return {
    accessToken: response.body.result.accessToken,
    refreshToken: response.body.result.refreshToken,
  };
}
