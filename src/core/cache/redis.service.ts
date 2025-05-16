import { cacheKeys, cacheTTL } from './constants';
import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async saveRefreshToken(userId: string, token: string): Promise<void> {
    const key = cacheKeys.tokens.refreshToken(userId);
    await this.redis.set(key, token, 'EX', cacheTTL.tokens.refreshToken);
  }

  async getRefreshToken(userId: string): Promise<string | null> {
    const key = cacheKeys.tokens.refreshToken(userId);
    return this.redis.get(key);
  }

  async deleteRefreshToken(userId: string): Promise<void> {
    const key = cacheKeys.tokens.refreshToken(userId);
    await this.redis.del(key);
  }
}
