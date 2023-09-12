import { Body, Controller, Delete, Get, Param, Patch, Post, UseFilters } from '@nestjs/common';
import { AuthExceptionFilter } from 'src/exception/authException/authExceptionFilter';
import { CreateUserDataDto } from './dto/createUserDataDto.dto';
import { UpdateUserDataDto } from './dto/updateUserDataDto.dto';
import { UsersService } from './users.service';

@UseFilters(AuthExceptionFilter)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get("test")
    test() {
        return this.usersService.test();
    }

    @Get()
    getAll() {
        return this.usersService.getAll();
    }

    @Get(":id")
    getUser(@Param("id") userId: string) {
        return this.usersService.getUser(userId);
    }

    @Post() 
    createUser(@Body() createUserData: CreateUserDataDto) {
        console.log(createUserData);
        return this.usersService.createUser(createUserData);
    }

    @Delete(":id")
    deleteUser(@Param("id") userId: string) {
        return this.usersService.deleteUser(userId);
    }

    @Patch(":id")
    updateUser(@Param("id") userId: string, @Body() updateUserData: UpdateUserDataDto) {
        return this.usersService.updateUser(userId, updateUserData);
    }


}
