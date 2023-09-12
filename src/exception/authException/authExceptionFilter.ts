import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Request, Response } from "express";
import { AuthException } from "./authException";

@Catch(AuthException)
export class AuthExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse<Response>();

        let { statusCode, message } = exception.errorCode;
        if (exception.message) message = exception.message;

        res
        .status(statusCode)
        .json({
            statusCode,
            timestamp: new Date().toISOString(),
            message,
        });
    }
}