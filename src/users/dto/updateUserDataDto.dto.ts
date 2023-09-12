import { PartialType } from "@nestjs/mapped-types";
import { IsDate, isEmpty, IsString } from "class-validator";
import { CreateUserDataDto } from "./createUserDataDto.dto";

export class UpdateUserDataDto extends PartialType(CreateUserDataDto) {
    // @IsString()
    // currentRefreshToken: string;

    // @IsDate()
    // currentRefreshTokenExp: Date;
}