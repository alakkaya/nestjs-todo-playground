import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redlock, { Lock } from 'redlock';
import Redis from 'ioredis';
import { RaceConditionException } from 'src/core/error';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { ConfigService } from '@nestjs/config';
import { Environment } from 'src/core/interface';

@Injectable()
export class RedlockService implements OnModuleDestroy {
  private redlock: Redlock;
  private readonly defaultTTL: number;

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly configService: ConfigService<Environment>,
  ) {
    this.defaultTTL = this.configService.get('REDLOCK_DEFAULT_TTL', 10000);

    this.redlock = new Redlock([redis], {
      driftFactor: 0.01, // adjusts for timing inaccuracies between Redis nodes
      retryCount: 3,
      retryDelay: 200,
      retryJitter: 200,
    });
  }

  async acquireLock(
    resource: string,
    ttl: number = this.defaultTTL,
  ): Promise<Lock> {
    try {
      return await this.redlock.acquire([resource], ttl);
    } catch (error) {
      throw new RaceConditionException();
    }
  }

  async withLock<T>(
    resource: string,
    callback: () => Promise<T>,
    ttl: number = this.defaultTTL,
  ): Promise<T> {
    const lock = await this.acquireLock(resource, ttl);
    try {
      return await callback();
    } finally {
      await lock.release();
    }
  }

  onModuleDestroy() {
    this.redlock.quit();
  }
}
