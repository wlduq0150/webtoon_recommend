import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from 'src/sequelize/entity/user.model';
import { CreateUserDataDto } from './dto/createUserDataDto.dto';
import { UpdateUserDataDto } from './dto/updateUserDataDto.dto';
import * as bcrypt from "bcrypt";
import { jwtConstants } from 'src/auth/constants/jwtConstants';
import { Cache } from 'cache-manager';
import { UserAlreadyExistException, UserNotFoundException } from 'src/exception/authException/authExceptions';
import { userCacheTTL, userReadCacheTTL } from 'src/caching/constants';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        @Inject("REDIS")
        private cacheManager: Cache, 
    ) {}

    async test() {
        const exUser = await this.getUser("test");
        return exUser.$get("readWebtoons");
    }
 
    async getAll() {
        const users = await this.userModel.findAll();
        return users;
    }

    async getUser(userId: string): Promise<any> {
        const userCacheKey: string = `userCache-${userId}`;

        const userCache: string = await this.cacheManager.get(userCacheKey);
        if (userCache) {
            const userInfo = JSON.parse(userCache);
            return new User(userInfo);
        }

        const exUser = await this.userModel.findOne({ where: { userId }});
        if (!exUser) {
            throw UserNotFoundException();
        }

        await this.cacheManager.set(
            userCacheKey,
            JSON.stringify(exUser),
            userCacheTTL
        );
        
        return exUser;
    }

    async getUserReadWebtoonIds(userId: string): Promise<string[]> {
        const userReadCacheKey: string = `userReadCache-${userId}`;
        
        const userReadCache: string = await this.cacheManager.get(userReadCacheKey);
        if (userReadCache) {
            return JSON.parse(userReadCache);
        }

        const exUser: User = await this.getUser(userId);

        const readWebtoons: any[] = await exUser.$get("readWebtoons", { attributes: ["webtoonId"] });

        const readwebtoonIds: string[] = readWebtoons.map(
            (webtoon) => { return webtoon.webtoonId }
        );

        await this.cacheManager.set(
            userReadCacheKey,
            JSON.stringify(readwebtoonIds),
            userReadCacheTTL
        );

        return readwebtoonIds;
    }

    async createUser(createUserData: CreateUserDataDto) {
        const { password } = createUserData;
        const hashPassword = await bcrypt.hash(password, 10);

        this.userModel.create({
            ...createUserData,
            password: hashPassword,
        })
        .then(() => {
            console.log(`[Info]userId ${createUserData.userId} is created.`)
        })
        .catch((err) => {
            throw UserAlreadyExistException()
        });
        
        return true;
    }

    async deleteUser(userId: string) {
        await this.getUser(userId);

        this.userModel.destroy({
            where: { userId }
        })
        .then(() => {
            console.log(`[Info]userId ${userId} is removed.`)
        });
        
        return true;
    }

    async updateUser(userId: string, updateUserData: UpdateUserDataDto) {
        await this.getUser(userId);

        this.userModel.update({
            ...updateUserData,
        }, {
            where: { userId },
        })
        .then(() => {
            console.log(`[Info]userId ${userId} is changed.`)
        });

        return true;
    }

    async setCurrentRefreshToken(userId: string, refreshToken: string): Promise<void> {
        const currentRefreshToken: string = await this.getHashedRefreshToken(refreshToken);
        const currentRefreshTokenExp: Date = await this.getRefreshTokenExp();
        await this.updateUser(userId, {
            currentRefreshToken,
            currentRefreshTokenExp,
        });
    }

    async removeCurrentRefreshToken(userId: string): Promise<void> {
        this.updateUser(userId, {
            currentRefreshToken: null,
            currentRefreshTokenExp: null,
        });
    }

    async getHashedRefreshToken(refreshToken: string): Promise<string> {
        const hashedRefreshToken: string = await bcrypt.hash(refreshToken, 10);
        return hashedRefreshToken;
    }

    async getRefreshTokenExp(): Promise<Date> {
        const now: Date = new Date();
        const refreshTokenExp: number = jwtConstants.refreshTokenExpired;
        const currentRefreshTokenExp: Date = new Date(now.getTime() + refreshTokenExp);
        return currentRefreshTokenExp;
    }

    async getUserForRefreshToken(userId: string, refreshToken: string): Promise<User> {
        const user: User = await this.getUser(userId);
        const refreshTokenCompare = await bcrypt.compare(refreshToken, user.currentRefreshToken);
        if (!refreshTokenCompare) {
            throw new UnauthorizedException("[Error]refreshToken is wrong with user..");
        }
        return user;
    }
}
