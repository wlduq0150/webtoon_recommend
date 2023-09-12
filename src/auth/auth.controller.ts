import { Body, Controller, Get, Post, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { AuthExceptionFilter } from 'src/exception/authException/authExceptionFilter';
import { CreateUserDataDto } from 'src/users/dto/createUserDataDto.dto';
import { AuthService } from './auth.service';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { RegisterDataDto } from './dto/registerData.dto';
import { AccessTokenGuard } from './guard/accessToken.guard';
import { LocalGuard } from './guard/local.guard';
import { RefreshTokenGuard } from './guard/refreshToken.guard';

@UseFilters(AuthExceptionFilter)
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("register")
    register(@Body() registerDataDto: RegisterDataDto) {
        return this.authService.register(registerDataDto);
    }

    @UseGuards(LocalGuard)
    @Post("login")
    login(@Req() req) {
        return this.authService.login(req.user);
    }

    @UseGuards(RefreshTokenGuard)
    @Post("logout")
    logout(@Req() req, @Res() res) {
        this.authService.logout(req.user.userId, res);
        return res.send({ message: "logout success" });
    }

    @Post("refresh")
    refresh(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refresh(refreshTokenDto);
    }

    @UseGuards(AccessTokenGuard)
    @Get("profile")
    getProfile(@Req() req) {
        return req.user;
    }
}
