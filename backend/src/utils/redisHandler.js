import { createClient } from 'redis';

class RedisService {
    static Instance = null;
    constructor() {
        if (!RedisService.Instance) {
            this.client = createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379'
            });

            this.connect();
            this.registerEvents();
            RedisService.Instance = this;
        }
        return RedisService.Instance;
    }

    async connect() {
        try {
            await this.client.connect();
            console.log('Redis connected successfully');
        } catch (error) {
            console.error('Redis connection failed:', error);
            process.exit(1);
        }
    }

    registerEvents() {
        this.client.on('error', (err) => {
            console.error('Redis client error:', err);
        });

        this.client.on('reconnecting', () => {
            console.log('Redis client reconnecting...');
        });
    }

    async get(key) {
        try {
            const data = await this.client.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Redis get error for key ${key}:`, error);
            throw error;
        }
    }

    async set(key, value, ttl = null) {
        try {
            if (ttl) {
                return await this.client.setEx(key, ttl, JSON.stringify(value));
            }
            return await this.client.set(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Redis set error for key ${key}:`, error);
            throw error;
        }
    }

    async del(key) {
        try {
            return await this.client.del(key);
        } catch (error) {
            console.error(`Redis delete error for key ${key}:`, error);
            throw error;
        }
    }

    async incrBy(key, increment = 1) {
        try {
            return await this.client.incrBy(key, increment);
        } catch (err) {
            console.error(`rBy error for key ${key}:`, err);
            throw err;
        }
    }

    async incrByWithExpire(key, increment, ttl = 3600) {
        const result = await this.client.multi()
            .incrBy(key, increment)
            .expire(key, ttl)
            .exec();
        return result[0];
    }

    async hSet(hashKey, field, value) {
        try {
            return await this.client.hSet(hashKey, field, value);
        } catch (error) {
            console.error(`Redis hSet error for hash ${hashKey}, field ${field}:`, error);
            throw error;
        }
    }

    async hGet(hashKey, field) {
        try {
            const data = await this.client.hGet(hashKey, field);
            return data ? data : null;
        } catch (error) {
            console.error(`Redis hGet error for hash ${hashKey}, field ${field}:`, error);
            throw error;
        }
    }

    async hExists(hashKey, field) {
        try {
            return await this.client.hExists(hashKey, field);
        } catch (error) {
            console.error(`Redis hExists error for hash ${hashKey}, field ${field}:`, error);
            throw error;
        }
    }
    async hSetNX(hashKey, field, value) {
        try {
            return await this.client.hSetNX(hashKey, field, value);
        } catch (error) {
            console.error(`Redis hSetNX error for hash ${hashKey}, field ${field}:`, error);
            throw error;
        }
    }
    // 其他 Redis 操作方法...
}
export const redisService = new RedisService();