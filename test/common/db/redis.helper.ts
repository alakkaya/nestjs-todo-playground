import { Redis } from 'ioredis';
import { testConfig } from '../../test-config';
import { cacheKeys } from '../../../src/core/cache/constants';

let redisClient: Redis;

export const connectRedis = async (): Promise<void> => {
  if (!redisClient) {
    redisClient = new Redis({
      host: testConfig.redis.host,
      port: testConfig.redis.port,
    });
  }

  // Reset cache before starting tests
  await resetCache();
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
};

export const resetCache = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.flushall();
  }
};

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    throw new Error('Redis client not connected. Call connectRedis() first.');
  }
  return redisClient;
};

export const getRefreshTokenFromRedis = async (
  userId: string,
): Promise<string | null> => {
  const key = cacheKeys.tokens.refreshToken(userId);
  return redisClient.get(key);
};

export const deleteRefreshTokenFromRedis = async (
  userId: string,
): Promise<void> => {
  const key = cacheKeys.tokens.refreshToken(userId);
  await redisClient.del(key);
};

export const setRefreshTokenInRedis = async (
  userId: string,
  token: string,
  ttl?: number,
): Promise<void> => {
  const key = cacheKeys.tokens.refreshToken(userId);
  if (ttl) {
    await redisClient.set(key, token, 'EX', ttl);
  } else {
    await redisClient.set(key, token);
  }
};
