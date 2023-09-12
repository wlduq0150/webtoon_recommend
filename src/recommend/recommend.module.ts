import { Module } from '@nestjs/common';
import { RecommendService } from './recommend.service';
import { RecommendController } from './recommend.controller';
import { WebtoonsModule } from 'src/webtoons/webtoons.module';
import { redisCacheModule } from 'src/caching/redisCacheModule';
import { redisCacheProvider } from 'src/caching/redisCacheProvider';
import { UsersModule } from 'src/users/users.module';



@Module({
  imports: [
    WebtoonsModule,
    UsersModule,
    redisCacheModule
  ],
  exports: [
    RecommendService,
    WebtoonsModule,
    UsersModule,
    redisCacheModule,
    redisCacheProvider,
  ],
  providers: [
    RecommendService,
    redisCacheProvider
  ],
  controllers: [RecommendController],
})
export class RecommendModule {}
