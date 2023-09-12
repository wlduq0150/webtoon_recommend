import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { authRequest } from "src/types/authRequest";
import { UsersService } from "src/users/users.service";
import { jwtConstants } from "../constants/jwtConstants";
import { RefreshTokenPayloadDto } from "../dto/refreshTokenPayload.dto";

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(Strategy, "refreshToken") {
    constructor(private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) => {
                    return request.headers?.refresh as string;
                }
            ]),
            secretOrKey: jwtConstants.refreshTokenSecret,
            ignoreExpiration: false,
            passReqToCallback: true,
        });
    }

    async validate(req: authRequest, payload: RefreshTokenPayloadDto) {
        const refreshToken = req.headers?.refresh; 
        const user = await this.usersService.getUserForRefreshToken(
            payload.userId, 
            refreshToken,
        );
        return user;
        
    }
}