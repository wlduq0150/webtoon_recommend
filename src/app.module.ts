import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MysqlSequelizeModule } from './sequelize/mysql_sequelize.module';
import { UsersModule } from './users/users.module';
import { WebtoonsModule } from './webtoons/webtoons.module';
import { RecommendModule } from './recommend/recommend.module';
import { DataManagerModule } from './data_manager/data_manager.module';
import { UserWebtoonModule } from './user-webtoon/user-webtoon.module';

@Module({
  imports: [
    MysqlSequelizeModule,
    UsersModule,
    AuthModule,
    WebtoonsModule,
    RecommendModule,
    DataManagerModule,
    UserWebtoonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
