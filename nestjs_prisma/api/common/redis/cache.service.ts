import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

@Injectable()
export class CacheService {
  private readonly prefix = 'cache:';

  constructor(private readonly redisService: RedisService) {}

  async get<T>(key: string): Promise<T | null> {
    if (!this.redisService.isAvailable()) return null;
    const client = this.redisService.getClient();
    const value = await client.get(this.prefixKey(key));
    if (value === null) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    if (!this.redisService.isAvailable()) return;
    const client = this.redisService.getClient();
    const serialized = JSON.stringify(value);
    if (ttl) {
      await client.setex(this.prefixKey(key), ttl, serialized);
    } else {
      await client.set(this.prefixKey(key), serialized);
    }
  }

  async delete(key: string): Promise<void> {
    if (!this.redisService.isAvailable()) return;
    const client = this.redisService.getClient();
    await client.del(this.prefixKey(key));
  }

  async has(key: string): Promise<boolean> {
    if (!this.redisService.isAvailable()) return false;
    const client = this.redisService.getClient();
    const exists = await client.exists(this.prefixKey(key));
    return exists === 1;
  }

  async clear(pattern?: string): Promise<void> {
    if (!this.redisService.isAvailable()) return;
    const client = this.redisService.getClient();
    if (pattern) {
      const keys = await client.keys(this.prefixKey(pattern));
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } else {
      await client.flushdb();
    }
  }

  async increment(key: string, ttl?: number): Promise<number> {
    if (!this.redisService.isAvailable()) return 0;
    const client = this.redisService.getClient();
    const fullKey = this.prefixKey(key);
    const value = await client.incr(fullKey);
    if (ttl && value === 1) {
      await client.expire(fullKey, ttl);
    }
    return value;
  }

  private prefixKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}
