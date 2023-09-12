import { Module } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from './entity/user.model';
import { Webtoon } from './entity/webtoon.model';
import { UserWebtoon } from './entity/userWebtoon.model';

const sequelizeModule = SequelizeModule.forRoot({
  dialect: 'mysql',
  host: 'groupfinding.cafe24app.com',
  port: 3306,
  username: 'wlduq0150',
  password: 'hansol0160@',
  database: 'wlduq0150',
  models: [User, Webtoon, UserWebtoon],
  synchronize: true,
});

@Module({
  imports: [sequelizeModule],
  exports: [sequelizeModule],
  providers: [],
})
export class MysqlSequelizeModule {
  constructor(private sequelize: Sequelize) {
    sequelize.sync()
    .then(() => {
        console.log("데이터베이스 연결 성공");
    })
    .catch((e) => {
        console.error(e);
        console.log("데이터베이스 연결 실패");
    });
  }
}


//https://docs.nestjs.com/techniques/database