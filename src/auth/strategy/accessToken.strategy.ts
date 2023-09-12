import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { jwtConstants } from "../constants/jwtConstants";
import { AccessTokenPayloadDto } from "../dto/accessTokenPayload.dto";

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(Strategy, "accessToken") {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtConstants.accessTokenSecret,
            ignoreExpiration: false,
        });
    }

    async validate(payload: AccessTokenPayloadDto) {
        const userData = { ...payload };
        return userData;
    }
}