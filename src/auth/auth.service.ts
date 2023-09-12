import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from "bcrypt";
import { User } from 'src/sequelize/entity/user.model';
import { jwtConstants } from './constants/jwtConstants';
import { AccessTokenPayloadDto } from './dto/accessTokenPayload.dto';
import { RefreshTokenPayloadDto } from './dto/refreshTokenPayload.dto';
import { loginTokenDataDto } from './dto/loginTokenData.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { NewAccessTokenDto } from './dto/newAccessToken.dto';
import { RegisterDataDto } from './dto/registerData.dto';
import { PasswordWrongException, UserNotFoundException } from 'src/exception/authException/authExceptions';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    async register(registerDataDto: RegisterDataDto) {
        this.usersService.createUser(registerDataDto);
    }

    async validateUser(userId: string, password: string): Promise<User> {
        const user = await this.usersService.getUser(userId);

        const equalPassword = await bcrypt.compare(password, user.password);
        if (!equalPassword) {
            throw PasswordWrongException();
        }

        return user;
    }

    async getAccessToken(user: User): Promise<string> {
        const payload: AccessTokenPayloadDto = {
            userId: user.userId,
            userName: user.name,
            userAge: user.age,
            userSex: user.sex,
        };
        const accessToken: string = await this.jwtService.signAsync(
            payload,
            {
                secret: jwtConstants.accessTokenSecret,
                expiresIn: jwtConstants.accessTokenExpired,
            }
        );
        return accessToken;
    }

    async getRefreshToken(user: User): Promise<string> {
        const payload: RefreshTokenPayloadDto = {
            userId: user.userId,
        };
        const refreshToken: string = await this.jwtService.signAsync(
            payload,
            {
                secret: jwtConstants.refreshTokenSecret,
                expiresIn: jwtConstants.refreshTokenExpired,
            }
        );
        return refreshToken;
    }

    async refresh(refreshTokenDto: RefreshTokenDto): Promise<NewAccessTokenDto> {
        const { refreshToken } = refreshTokenDto;
        const { userId } = await this.jwtService.verifyAsync(
            refreshToken,
            {
                secret: jwtConstants.refreshTokenSecret,
            }
        );
        const user = await this.usersService.getUserForRefreshToken(userId, refreshToken);
        const newAccessToken: string = await this.getAccessToken(user);
        return { newAccessToken };
    }

    async login(user: User): Promise<loginTokenDataDto> {
        const accessToken: string = await this.getAccessToken(user);
        const refreshToken: string = await this.getRefreshToken(user);
        await this.usersService.setCurrentRefreshToken(user.userId, refreshToken);
        const loginTokenData: loginTokenDataDto = {
            accessToken,
            refreshToken,
        };
        return loginTokenData;
    }

    async logout(userId: string, res: Response): Promise<void> {
        await this.usersService.removeCurrentRefreshToken(userId);
    }
}
