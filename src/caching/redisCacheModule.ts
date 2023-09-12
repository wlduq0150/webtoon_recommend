import { CacheModule } from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-ioredis";

export const redisCacheModule = CacheModule.registerAsync({
    isGlobal: true,
    useFactory: async () => (
      {
        store: redisStore,
        host: 'redis-17923.c299.asia-northeast1-1.gce.cloud.redislabs.com',
        port: '17923',
        password: 'HTuNsgrf3sDXgHfTUGByOGwMZzNVUAUs',
      }
    ),
  });