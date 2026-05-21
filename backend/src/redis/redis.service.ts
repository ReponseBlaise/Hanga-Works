import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly client: Redis;
  private readonly logger = new Logger(RedisService.name);
  private isReady = false;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST ?? 'localhost',
      port: Number(process.env.REDIS_PORT ?? 6379),
      lazyConnect: true,         // don't auto-connect on instantiation
      enableOfflineQueue: false, // fail fast instead of queueing
      retryStrategy: () => null, // don't retry — log and move on
    });

    this.client.on('ready', () => {
      this.isReady = true;
      this.logger.log('Redis connected');
    });

    this.client.on('error', () => {
      this.isReady = false;
    });

    // Try connecting — if Redis is down this resolves silently
    this.client.connect().catch(() => {
      this.logger.warn('Redis unavailable — caching disabled, app still works');
    });
  }

  async get(key: string): Promise<string | null> {
    if (!this.isReady) return null;
    try {
      return await this.client.get(key);
    } catch {
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    if (!this.isReady) return;
    try {
      await this.client.set(key, value, 'EX', ttlSeconds);
    } catch {
      // cache write failure is non-fatal
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isReady) return;
    try {
      await this.client.del(key);
    } catch {
      // cache delete failure is non-fatal
    }
  }

  onModuleDestroy() {
    this.client.quit();
  }
}
