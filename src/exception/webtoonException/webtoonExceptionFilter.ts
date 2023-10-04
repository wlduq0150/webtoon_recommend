import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { HttpStatusCode } from "axios";
import { Request, Response } from "express";
import { WebtoonException } from "./webtoonException";

@Catch(WebtoonException)
export class WebtoonExceptionFilter implements ExceptionFilter {
    catch(exception: WebtoonException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse<Response>();

        const statusCode: number = (
            exception.errorCode ? 
            exception.errorCode.statusCode : 
            HttpStatusCode.InternalServerError
        );

        let message: string = exception.message;
        if (exception.message) message = exception.message;

        if (exception.data) console.log(`webtoonId ${exception.data.webtoonId}\n${exception.data}`);

        res.status(statusCode)
        .json({
            statusCode,
            timestamp: new Date().toISOString(),
            message,
        });
    }
}