import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Scope } from "@nestjs/common";

export const redisCacheProvider = {
    provide: "REDIS",
    useExisting: CACHE_MANAGER,
    scope: Scope.DEFAULT
}

