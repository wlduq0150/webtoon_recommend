import { Module } from '@nestjs/common';
import { redisCacheModule } from 'src/caching/redisCacheModule';
import { UsersModule } from 'src/users/users.module';
import { WebtoonsModule } from 'src/webtoons/webtoons.module';
import { UserWebtoonController } from './user-webtoon.controller';
import { UserWebtoonService } from './user-webtoon.service';

@Module({
  imports: [
    UsersModule,
    WebtoonsModule,
    redisCacheModule,
  ],
  exports: [
    redisCacheModule,
  ],
  controllers: [UserWebtoonController],
  providers: [UserWebtoonService]
})
export class UserWebtoonModule {}
