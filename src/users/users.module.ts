import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/sequelize/entity/user.model';
import { redisCacheModule } from 'src/caching/redisCacheModule';
import { redisCacheProvider } from 'src/caching/redisCacheProvider';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    SequelizeModule.forFeature([User]),
    redisCacheModule,
  ],
  exports: [
    UsersService,
    redisCacheModule,
    redisCacheProvider,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    redisCacheProvider
  ]
})
export class UsersModule {}
